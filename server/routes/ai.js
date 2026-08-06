const { AI_ENABLED, AI_DAILY_LIMIT } = require('../config');
const { pool } = require('../db');
const { authUser } = require('../lib/auth');
const { rateLimited, clientIp, readBody, sendJson, ok, fail } = require('../lib/http');
const { sourceHash, generateIdeas } = require('../lib/ai');

// ============ AI KIYIM G'OYALARI (Sprint 10) ============
// POST /api/ai/ideas  { productId }
//
// Oqim: imzo → kesh (hash bilan) → ATOMIK limit → AI → sxema → kesh yozish.
// Kesh mos kelsa limitga UMUMAN TEGILMAYDI (4-qaror): xarajat foydalanuvchi
// soniga emas, MAHSULOT soniga bog'liq bo'lishi shundan kelib chiqadi.

// Hozircha faqat o'zbekcha (7-qaror). Ruscha qo'shilganda shu qiymat
// so'rovdan keladi — jadval kaliti allaqachon (product_id, lang).
const LANG = 'uz';

// Bitta kategoriyaga nechta mahsulot tavsiya qilinadi
const RECS_PER_CAT = 2;

// ============ OQ RO'YXAT BAZADAN OLINADI ============
// Sprint 10, 5-qaror + 2026-08-06 founder qarori. Qo'lda yozilgan doimiy
// EMAS: katalogga yangi tur qo'shilsa ro'yxat o'zi kengayadi va kodga
// tegilmaydi (db/014 darsi — bir xil ro'yxat ikki joyda yashasa,
// ikkinchisini yangilash unutiladi va amal production'da jimgina o'ladi).
async function allowedCategories() {
  const { rows } = await pool.query(
    `SELECT DISTINCT cat_key FROM products
      WHERE status = 'published' AND cat_key IS NOT NULL AND cat_key <> ''
      ORDER BY cat_key`
  );
  return rows.map((r) => r.cat_key);
}

// ============ TAVSIYALAR HAR SAFAR QAYTA HISOBLANADI ============
// ⚠️ Keshda mahsulot `id` si SAQLANMAYDI — faqat kategoriya kaliti.
// Sabab 5-qarorning davomi: saqlangan `id` mahsulot e'londan olingan yoki
// o'chirilgan kuni O'LIK HAVOLAGA aylanardi va buni faqat foydalanuvchi
// sezardi. Kategoriya esa eskirmaydi. Ya'ni g'oyalar keshlanadi, tavsiya
// esa har javobda jonli katalogdan yig'iladi.
async function recsByCategory(cats, excludeProductId) {
  if (!cats.length) return new Map();
  const { rows } = await pool.query(
    `SELECT id, cat_key, name_uz, price, unit, img FROM (
       SELECT p.id, p.cat_key, p.name_uz, p.price, p.unit, p.img,
              row_number() OVER (PARTITION BY p.cat_key
                                 ORDER BY p.sort_order NULLS LAST, p.id) AS rn
         FROM products p
        WHERE p.status = 'published'
          AND p.cat_key = ANY($1::text[])
          AND p.id <> $2
     ) t WHERE t.rn <= $3`,
    [cats, excludeProductId, RECS_PER_CAT]
  );
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.cat_key)) map.set(r.cat_key, []);
    map.get(r.cat_key).push({
      id: r.id, name: r.name_uz, price: Number(r.price), unit: r.unit, img: r.img,
    });
  }
  return map;
}

// G'oyaga haqiqiy mahsulotlarni biriktiradi. Kategoriyada mahsulot topilmasa
// ro'yxat BO'SH qoladi va frontend blokni umuman chizmaydi — "tavsiya yo'q"
// deb yozib qo'yish o'ylab topilgan ma'lumotdan farq qilmasdi (CLAUDE.md:
// ma'lumot bazadan kelmasa blok ko'rsatilmaydi).
function attachRecs(ideas, map) {
  return ideas.map((it) => {
    const seen = new Set();
    const tavsiyalar = [];
    for (const c of it.kerakli_kategoriyalar) {
      for (const p of map.get(c) || []) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        tavsiyalar.push(p);
      }
    }
    return { ...it, tavsiyalar };
  });
}

// ============ KUNLIK LIMIT — ATOMIK ============
// `decrementStock` bilan AYNI naqsh (CLAUDE.md, zaxira qoidasi): tekshiruv va
// oshirish BITTA gapda. Alohida `SELECT` + `UPDATE` ga bo'linsa, bir vaqtda
// kelgan ikki so'rov ikkalasi ham "hali limit tugamagan" deb o'qib o'tib
// ketardi — aynan oxirgi rulon muammosi.
//
// Qator qaytmasa — limit tugagan.
//
// Kun MAHALLIY mintaqada hisoblanadi (db/016 izohiga qara): UTC ishlatilsa
// limit aslida Toshkent vaqti bilan 05:00 da yangilanardi, foydalanuvchiga
// esa "ertaga 00:00 da" deyilardi — jimgina yolg'on.
async function takeQuota(tgUserId) {
  const { rows } = await pool.query(
    `INSERT INTO ai_usage (tg_user_id, day, used)
     VALUES ($1, (now() AT TIME ZONE 'Asia/Tashkent')::date, 1)
     ON CONFLICT (tg_user_id, day)
     DO UPDATE SET used = ai_usage.used + 1
           WHERE ai_usage.used < $2
     RETURNING used`,
    [tgUserId, AI_DAILY_LIMIT]
  );
  return rows.length > 0;
}

async function handleAiIdeas(req, res) {
  // Sozlama yaroqsiz bo'lsa funksiya butunlay o'chiq (config.js jurnalda
  // qichqirgan). Frontend ham tugmani chizmaydi — bu ikkinchi qatlam.
  if (!AI_ENABLED) return fail(res, 'ai_disabled', 503);

  const ip = clientIp(req);
  if (rateLimited(`ai:${ip}`, 20)) return fail(res, 'too many requests', 429);

  try {
    // Kimlik FAQAT imzolangan initData dan (CLAUDE.md, 2026-07-29).
    // Klient yuborgan `tg_user_id` ga ishonilmaydi — u umuman o'qilmaydi.
    const tg = authUser(req);
    if (!tg || !tg.id) return fail(res, 'unauthorized', 401);

    const body = await readBody(req, 5_000);
    const productId = String(JSON.parse(body || '{}').productId || '').trim();
    if (!productId) return fail(res, 'productId kerak', 400);

    const { rows: prod } = await pool.query(
      `SELECT id, name_uz, comp_uz, cat_key, width, weight
         FROM products WHERE id = $1 AND status = 'published'`,
      [productId]
    );
    if (!prod.length) return fail(res, 'mahsulot topilmadi', 404);
    const p = prod[0];
    const hash = sourceHash(p);

    // ---- 1. Kesh ----
    // Hash mos kelmasa (mato tavsifi tahrirlangan) qator BOR bo'lsa ham
    // yaroqsiz deb qaraladi va pastda ustiga yoziladi.
    const { rows: cached } = await pool.query(
      `SELECT ideas, model, source_hash, created_at
         FROM product_ai_ideas WHERE product_id = $1 AND lang = $2`,
      [productId, LANG]
    );
    if (cached.length && cached[0].source_hash === hash) {
      const ideas = cached[0].ideas;
      const cats = [...new Set(ideas.flatMap((i) => i.kerakli_kategoriyalar || []))];
      const map = await recsByCategory(cats, productId);
      return ok(res, {
        ideas: attachRecs(ideas, map),
        model: cached[0].model,
        cached: true,
        createdAt: cached[0].created_at,
      });
    }

    // ---- 2. Limit ----
    // ⚠️ Limit AI chaqiruvidan OLDIN olinadi (sprint tartibi). Ya'ni AI
    // yiqilsa ham bitta birlik sarflanadi. Bu bilib qilingan tanlov:
    // muvaffaqiyatsiz so'rov ham provayder kvotasini yeydi, shuning uchun
    // "faqat muvaffaqiyatda hisobla" naqshi bilan endpointni bepul
    // urib turish mumkin bo'lardi. Qaytarish (kompensatsiya) yozuvi
    // QO'SHILMADI — u ham yiqilishi mumkin va murakkablik ortardi.
    if (!(await takeQuota(String(tg.id)))) {
      return sendJson(res, 429, { ok: false, error: 'limit', limit: AI_DAILY_LIMIT });
    }

    // ---- 3. AI ----
    const cats = await allowedCategories();
    const { ideas, model } = await generateIdeas(p, cats);

    // ---- 4. Keshga yozish ----
    // Sxemadan o'tmagan javob bu yergacha YETIB KELMAYDI — `generateIdeas`
    // xato tashlaydi (6-qaror: mos kelmasa keshga yozilmaydi).
    await pool.query(
      `INSERT INTO product_ai_ideas (product_id, lang, ideas, source_hash, model)
       VALUES ($1, $2, $3::jsonb, $4, $5)
       ON CONFLICT (product_id, lang)
       DO UPDATE SET ideas = EXCLUDED.ideas,
                     source_hash = EXCLUDED.source_hash,
                     model = EXCLUDED.model,
                     created_at = now()`,
      [productId, LANG, JSON.stringify(ideas), hash, model]
    );

    const used = [...new Set(ideas.flatMap((i) => i.kerakli_kategoriyalar))];
    const map = await recsByCategory(used, productId);
    ok(res, { ideas: attachRecs(ideas, map), model, cached: false, createdAt: new Date() });
  } catch (e) {
    // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
    // O'zgaruvchan qism (mahsulot id, model xabari) ikkinchi argumentda.
    console.error('aiIdeas xatosi:', e.message);
    fail(res, 'ai_unavailable', 503);
  }
}

module.exports = { handleAiIdeas, allowedCategories, recsByCategory, attachRecs, takeQuota, LANG };
