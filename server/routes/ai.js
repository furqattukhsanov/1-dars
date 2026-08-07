const { AI_ENABLED, AI_DAILY_LIMIT, AI_IMAGE_ENABLED, AI_IMAGE_CHAT_ID } = require('../config');
const { pool } = require('../db');
const { authUser } = require('../lib/auth');
const { rateLimited, clientIp, readBody, sendJson, ok, fail } = require('../lib/http');
const { imageSourceHash, generateImage, normalizeChoices, choicesHash } = require('../lib/ai');
const { tgGetFile, tgDownloadFile, sendPhotoBytes } = require('../lib/telegram-api');
const { productPhotoUrl } = require('./catalog');

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

// ============ AI KIYIM RASMI (2026-08-07) ============
// POST /api/ai/image  { productId }
//
// Oqim: imzo → kesh (hash bilan) → ATOMIK limit → manba surat → AI →
// Telegram'ga yuklash → kesh yozish.
//
// ⚠️ MATN G'OYALARI SHU FAYLDAN OLIB TASHLANDI (2026-08-07, founder qarori:
// "matn ai umuman kerak emas, faqat rasm qolsin"). Yuqoridagi `takeQuota`
// o'sha yo'ldan qoldi va bu ATAYLAB: u atomik limitning ISHLAB TURGAN
// namunasi edi, rasm ham aynan shu hisobni ishlatadi. Ya'ni matn yo'li
// o'chdi, undan qolgan qism esa yangidan yozilmadi.
//
// Rasm yo'lining uchta o'ziga xos bandi:
//   1) hash ichida SURAT ham bor (`imageSourceHash`) — surat almashsa rasm
//      yaroqsiz bo'ladi;
//   2) natija bazada emas, Telegram'da yashaydi va faqat `file_id` saqlanadi;
//   3) manba surat bo'lmasa umuman boshlanmaydi — image-to-image ning MANBASI
//      yo'q bo'lsa qoladigani "matndan o'ylab topish" bo'lardi, u esa aynan
//      2026-08-06 da rad etilgan yo'l.

// ---- Manba surat ----
// Ikki xil bo'lishi mumkin: Telegram `img_file_id` (sotuvchi botga yuborgan)
// yoki statik `img` yo'li (katalogdagi eski rasmlar). Faqat BIRINCHISI
// qo'llab-quvvatlanadi — statik rasm serverning o'z diskida turadi va uni
// o'qish uchun yo'lni tashqi qiymatdan yasash kerak bo'lardi (path traversal
// yuzasi). Ikkinchisi uchun javob ochiq: rasm yo'q deb aytiladi.
async function loadSourcePhoto(fileId) {
  const filePath = await tgGetFile(fileId);
  if (!filePath) throw new Error('manba suratning file_path i yo\'q');
  return tgDownloadFile(filePath);
}

async function handleAiImage(req, res) {
  // Ikki bayroq: umumiy AI va aynan RASM. Matn ishlab, rasm ishlamaydigan
  // holat haqiqiy holat (2026-08-06: matn HTTP 200, rasm HTTP 429).
  if (!AI_ENABLED || !AI_IMAGE_ENABLED) return fail(res, 'ai_image_disabled', 503);

  const ip = clientIp(req);
  // Matn yo'lidan PASTROQ chegara: bitta rasm ~$0.04, matn esa ming marta
  // arzon. Bu narx himoyasi, tezlik himoyasi emas.
  if (rateLimited(`aiimg:${ip}`, 6)) return fail(res, 'too many requests', 429);

  try {
    // Kimlik FAQAT imzolangan initData dan (CLAUDE.md, 2026-07-29).
    const tg = authUser(req);
    if (!tg || !tg.id) return fail(res, 'unauthorized', 401);

    const body = await readBody(req, 5_000);
    const inp = JSON.parse(body || '{}');
    const productId = String(inp.productId || '').trim();
    if (!productId) return fail(res, 'productId kerak', 400);

    // ---- Xaridor javoblari (2026-08-07) ----
    // Oq ro'yxatdan O'TKAZILADI va yaroqsizi 400 bilan RAD ETILADI.
    // ⚠️ Zaxira qiymat qo'yilmaydi ("javob kelmasa ayol/ko'ylak deb hisobla"):
    // o'shanda xaridor bir narsani tanlab, butunlay boshqasini ko'rardi va
    // sababini bilmasdi — ustiga bu PULLIK so'rov.
    let choices;
    try {
      choices = normalizeChoices(inp.choices);
    } catch (_) {
      return fail(res, 'bad_choices', 400);
    }
    const cHash = choicesHash(choices);

    const { rows: prod } = await pool.query(
      `SELECT id, name_uz, comp_uz, cat_key, img_file_id
         FROM products WHERE id = $1 AND status = 'published'`,
      [productId]
    );
    if (!prod.length) return fail(res, 'mahsulot topilmadi', 404);
    const p = prod[0];

    // ---- 0. Manba bormi ----
    // Kesh tekshiruvidan OLDIN: manbasiz mahsulotning keshi ham bo'lishi
    // mumkin emas, ya'ni bu tartib bitta ortiqcha so'rovni tejaydi.
    if (!p.img_file_id) return fail(res, 'no_source_photo', 422);

    const hash = imageSourceHash(p, p.img_file_id);

    // ---- 1. Kesh ----
    const { rows: cached } = await pool.query(
      `SELECT file_id, model, source_hash, created_at
         FROM product_ai_image WHERE product_id = $1 AND choices_hash = $2`,
      [productId, cHash]
    );
    if (cached.length && cached[0].source_hash === hash) {
      return ok(res, {
        image: productPhotoUrl(cached[0].file_id),
        model: cached[0].model,
        cached: true,
        createdAt: cached[0].created_at,
      });
    }

    // ---- 2. Limit ----
    // Matn bilan BITTA hisobda (`ai_usage`). Alohida hisob QILINMADI: ikkita
    // hisob ikkita "ertaga yangilanadi" xabarini talab qilardi va
    // foydalanuvchi qaysi biri tugaganini bilmasdi.
    if (!(await takeQuota(String(tg.id)))) {
      return sendJson(res, 429, { ok: false, error: 'limit', limit: AI_DAILY_LIMIT });
    }

    // ---- 3. Manba surat + AI ----
    const source = await loadSourcePhoto(p.img_file_id);
    const { buf, model } = await generateImage(p, source, choices);

    // ---- 4. Telegram'ga yuklash ----
    // ⚠️ Bu qadam yiqilsa keshga HECH NARSA yozilmaydi va pul ketgan natija
    // yo'qoladi. Shuning uchun `sendPhotoBytes` jimgina `null` qaytarmaydi —
    // u xato tashlaydi va sabab alertga chiqadi.
    const fileId = await sendPhotoBytes(
      AI_IMAGE_CHAT_ID, buf, `ai-${productId}.png`,
      `AI kiyim rasmi — ${p.name_uz || productId} (${Object.values(choices).join(', ')})`
    );

    // ---- 5. Keshga yozish ----
    await pool.query(
      `INSERT INTO product_ai_image (product_id, choices_hash, choices, file_id, source_hash, model)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6)
       ON CONFLICT (product_id, choices_hash)
       DO UPDATE SET file_id = EXCLUDED.file_id,
                     source_hash = EXCLUDED.source_hash,
                     choices = EXCLUDED.choices,
                     model = EXCLUDED.model,
                     created_at = now()`,
      [productId, cHash, JSON.stringify(choices), fileId, hash, model]
    );

    ok(res, { image: productPhotoUrl(fileId), model, cached: false, createdAt: new Date() });
  } catch (e) {
    // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
    console.error('aiImage xatosi:', e.message);
    fail(res, 'ai_unavailable', 503);
  }
}

// ============ AI GALEREYASI — /api/ai/gallery (2026-08-07) ============
// AI bo'limidagi galereya shundan oziqlanadi (pastki paneldagi ✦ tab).
//
// ⚠️ BU YERDA HECH NARSA GENERATSIYA QILINMAYDI — faqat ALLAQACHON
// chizilgan rasmlar o'qiladi. Shuning uchun u GET, imzosiz va bepul.
// Agar lenta generatsiya qildirganida, bosh sahifani ochgan har bir odam
// pul sarflardi — bu Sprint 10 ning "avtomatik yuklash yo'q" qarorining
// aynan takrori bo'lardi.
//
// Bo'sh bo'lsa BO'SH massiv qaytadi va frontend blokni UMUMAN chizmaydi:
// CLAUDE.md — ma'lumot bazadan kelmasa, blok ko'rsatilmaydi (o'ylab topilgan
// namuna rasm qo'yilmaydi).
const GALLERY_LIMIT = 10;

async function handleAiGallery(req, res) {
  const ip = clientIp(req);
  if (rateLimited(`aigal:${ip}`, 60)) return fail(res, 'too many requests', 429);
  try {
    // `DISTINCT ON (product_id)` — bitta mahsulotning bir nechta javob
    // varianti bo'lishi mumkin (kesh kaliti `mahsulot + javoblar`), lenta esa
    // bitta matoni takrorlab ko'rsatmasligi kerak: eng YANGISI olinadi.
    // Mahsulot e'londan olingan bo'lsa umuman chiqmaydi.
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (i.product_id)
              i.product_id, i.file_id, i.choices, i.created_at,
              p.name_uz, p.name_ru
         FROM product_ai_image i
         JOIN products p ON p.id = i.product_id AND p.status = 'published'
        ORDER BY i.product_id, i.created_at DESC`
    );
    // Tartib SQL da `product_id` bo'yicha majburlangan (DISTINCT ON sharti),
    // shuning uchun "eng yangisi birinchi" tartibi shu yerda beriladi.
    rows.sort((a, b) => b.created_at - a.created_at);
    ok(res, {
      items: rows.slice(0, GALLERY_LIMIT).map((r) => ({
        productId: r.product_id,
        image: productPhotoUrl(r.file_id),
        name: { uz: r.name_uz, ru: r.name_ru },
        choices: r.choices,
      })),
    });
  } catch (e) {
    // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
    console.error('aiGallery xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

module.exports = { handleAiImage, handleAiGallery, takeQuota, loadSourcePhoto };
