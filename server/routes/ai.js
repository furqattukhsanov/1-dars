const {
  AI_ENABLED, AI_IMAGE_ENABLED, AI_IMAGE_CHAT_ID,
  AI_CREDITS_START, AI_CREDIT_COST, AI_UNLIMITED_TG_IDS,
} = require('../config');
const { pool } = require('../db');
const { authUser } = require('../lib/auth');
const { rateLimited, clientIp, readBody, sendJson, ok, fail } = require('../lib/http');
const { imageSourceHash, generateImage, normalizeChoices, choicesHash, joriyJavobmi } = require('../lib/ai');
const { tgGetFile, tgDownloadFile, sendPhotoBytes } = require('../lib/telegram-api');
const { productPhotoUrl } = require('./catalog');

// ============ LOLA CREDIT — ATOMIK ============
// (2026-08-07, founder: "har bir insonga 20 ta lola credit, bitta rasmga 2 ta")
//
// `decrementStock` bilan AYNI naqsh (CLAUDE.md, zaxira qoidasi): tekshiruv va
// yechish BITTA gapda. Alohida `SELECT` + `UPDATE` ga bo'linsa, bir vaqtda
// kelgan ikki so'rov ikkalasi ham "krediti bor" deb o'qib o'tib ketardi va
// balans MANFIYGA tushardi — aynan oxirgi rulon muammosi, faqat pul tomonda.
//
// Qator qaytmasa — kredit yetmadi.
//
// Birinchi so'rovda qator O'ZI tug'iladi va balans darrov `START - COST` bo'ladi:
// "20 ta berish" uchun alohida qadam yo'q, ya'ni "krediti berilmay qolgan
// foydalanuvchi" degan holat mavjud emas.
//
// ⚠️ CHEKSIZ RO'YXAT (`AI_UNLIMITED_TG_IDS`) — balans TEGILMAYDI, lekin sarf
// BARIBIR YOZILADI. Yozuvni ham o'tkazib yuborish oson yo'l edi, lekin
// o'shanda o'z sarfingiz KO'RINMAS bo'lardi: hisob kelganda kim qancha
// sarflaganini ko'rsatadigan yozuv qolmasdi. Bu "jimgina yolg'on" oilasidan.
async function takeCredits(tgUserId, cheksiz) {
  if (cheksiz) {
    const { rows } = await pool.query(
      `INSERT INTO ai_credits (tg_user_id, balance, spent)
       VALUES ($1, $2, $3)
       ON CONFLICT (tg_user_id)
       DO UPDATE SET spent = ai_credits.spent + $3, updated_at = now()
       RETURNING balance`,
      [tgUserId, AI_CREDITS_START, AI_CREDIT_COST]
    );
    return { ok: true, cheksiz: true, balance: rows.length ? rows[0].balance : AI_CREDITS_START };
  }

  const { rows } = await pool.query(
    `INSERT INTO ai_credits (tg_user_id, balance, spent)
     -- ⚠️ ::int SHART. Turi ko'rsatilmasa ikkala parametr ham Postgres uchun
     -- unknown bo'ladi va u qaysi ayirish operatorini tanlashni bilmaydi:
     -- "operator is not unique: unknown - unknown".
     -- Nuqson 2026-08-07 da production'da chiqdi va uni test TUTMADI, chunki
     -- Test 14c pool.query ni taqlid qiladi — ya'ni SQL matni HECH QACHON
     -- haqiqiy Postgres'ga bormaydi. Qorovul: Test 14o (matnni skanerlaydi).
     VALUES ($1, $2::int - $3::int, $3::int)
     ON CONFLICT (tg_user_id)
     DO UPDATE SET balance = ai_credits.balance - $3,
                   spent   = ai_credits.spent + $3,
                   updated_at = now()
           WHERE ai_credits.balance >= $3
     RETURNING balance`,
    [tgUserId, AI_CREDITS_START, AI_CREDIT_COST]
  );
  return rows.length ? { ok: true, balance: rows[0].balance } : { ok: false, balance: 0 };
}

// ============ KREDITNI QAYTARISH (2026-08-07) ============
// Kredit AI chaqiruvidan OLDIN yechiladi — bu ataylab: aks holda bir vaqtda
// kelgan o'nlab so'rov hammasi "krediti bor" deb o'tib ketardi va pul
// chegaradan oshib sarflanardi.
//
// ⚠️ Lekin oldindan yechish YARIM yo'l edi: generatsiya YIQILSA foydalanuvchi
// hech narsa olmaydi, krediti esa ketgan bo'lardi. Bu nazariy emas —
// 2026-08-07 da production'da AYNAN shu bo'ldi: Gemini `HTTP 503 high demand`
// qaytardi (o'z tomonidagi vaqtinchalik nosozlik), foydalanuvchi esa xato
// xabarini VA 2 credit kamaygan balansni ko'rdi. Provayder nosozligi
// XARIDORNING hisobidan to'lanishi mumkin emas.
//
// Qaytarish YO'Q QILINGANDA ham xavfsiz: `spent >= $3` sharti bir marta
// yechilgan kreditni ikki marta qaytarishga yo'l qo'ymaydi.
//
// ⚠️ Telegram'ga yuklash yiqilganda ham qaytariladi. O'sha holatda Google'ga
// pul ALLAQACHON to'langan bo'ladi — ya'ni zarar bizniki. Baribir qaytariladi:
// xaridor rasm olmadi, demak u to'lamasligi kerak.
async function refundCredits(tgUserId, cheksiz) {
  if (cheksiz) {
    // Balans tegilmagan edi — faqat sarf hisobini orqaga qaytaramiz.
    await pool.query(
      `UPDATE ai_credits SET spent = spent - $2, updated_at = now()
        WHERE tg_user_id = $1 AND spent >= $2`,
      [tgUserId, AI_CREDIT_COST]
    );
    return;
  }
  await pool.query(
    `UPDATE ai_credits
        SET balance = balance + $2, spent = spent - $2, updated_at = now()
      WHERE tg_user_id = $1 AND spent >= $2`,
    [tgUserId, AI_CREDIT_COST]
  );
}

// Faqat KO'RSATISH uchun — qoldiqni o'qiydi va hech narsa yechmaydi.
// Qator yo'q bo'lsa `AI_CREDITS_START` qaytadi va bu YOLG'ON EMAS: birinchi
// so'rovda u aynan shuncha bilan tug'iladi.
async function readCredits(tgUserId) {
  const { rows } = await pool.query(
    'SELECT balance, spent FROM ai_credits WHERE tg_user_id = $1',
    [tgUserId]
  );
  const r = rows[0];
  return {
    balance: r ? r.balance : AI_CREDITS_START,
    spent: r ? r.spent : 0,
    cost: AI_CREDIT_COST,
    unlimited: AI_UNLIMITED_TG_IDS.has(String(tgUserId)),
  };
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

  try {
    // ⚠️ TARTIB: kimlik AVVAL, tezlik chegarasi KEYIN (2026-08-07 da almashdi).
    // Ilgari `rateLimited` birinchi turardi va o'shanda cheksiz ro'yxatdagi
    // odam ham 7-so'rovda 429 olardi — ya'ni "cheksiz kredit" JIMGINA
    // yolg'on bo'lardi: kredit cheksiz, lekin daqiqada 6 ta.
    // Kimlik FAQAT imzolangan initData dan (CLAUDE.md, 2026-07-29).
    const tg = authUser(req);
    if (!tg || !tg.id) return fail(res, 'unauthorized', 401);

    const cheksiz = AI_UNLIMITED_TG_IDS.has(String(tg.id));

    // Matn yo'lidan PASTROQ chegara: bitta rasm ~$0.04. Bu narx himoyasi,
    // tezlik himoyasi emas — shuning uchun kredit hisobi bilan qo'sh qorovul.
    // Kalit IP emas, FOYDALANUVCHI: bitta uy Wi-Fi'sidagi ikki xaridor
    // bir-birini bloklamasin (kimlik baribir imzolangan).
    const ip = clientIp(req);
    if (!cheksiz && rateLimited(`aiimg:${tg.id}:${ip}`, 6)) {
      return fail(res, 'too many requests', 429);
    }

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
      // ⚠️ Keshdan o'qish KREDIT YEMAYDI (Sprint 10, 4-qaror) — hech qanday
      // AI chaqiruvi bo'lmadi, ya'ni to'lanadigan narsa ham yo'q.
      return ok(res, {
        image: productPhotoUrl(cached[0].file_id),
        model: cached[0].model,
        cached: true,
        createdAt: cached[0].created_at,
        credits: await readCredits(String(tg.id)),
      });
    }

    // ---- 2. Lola credit ----
    const kredit = await takeCredits(String(tg.id), cheksiz);
    if (!kredit.ok) {
      // ⚠️ "Ertaga yangilanadi" DEYILMAYDI: kredit qoldiq, u o'zi tiklanmaydi
      // va bunday xabar jimgina yolg'on bo'lardi.
      return sendJson(res, 429, {
        ok: false, error: 'no_credit',
        credits: { balance: kredit.balance, cost: AI_CREDIT_COST },
      });
    }

    // ---- 3-5: shu yerdan keyin har qanday yiqilish KREDITNI QAYTARADI ----
    // Kredit yuqorida ALLAQACHON yechilgan, ya'ni bu nuqtadan keyingi xato
    // foydalanuvchini "pul to'ladim, hech narsa olmadim" holatida qoldirardi.
    // Aynan shu 2026-08-07 da production'da bo'ldi (Gemini HTTP 503).
    let fileId;
    let model;
    try {
      // ---- 3. Manba surat + AI ----
      const source = await loadSourcePhoto(p.img_file_id);
      const natija = await generateImage(p, source, choices);
      model = natija.model;

      // ---- 4. Telegram'ga yuklash ----
      // ⚠️ Bu qadam yiqilsa keshga HECH NARSA yozilmaydi va pul ketgan natija
      // yo'qoladi. Shuning uchun `sendPhotoBytes` jimgina `null` qaytarmaydi —
      // u xato tashlaydi va sabab alertga chiqadi.
      fileId = await sendPhotoBytes(
        AI_IMAGE_CHAT_ID, natija.buf, `ai-${productId}.png`,
        `AI kiyim rasmi — ${p.name_uz || productId} (${Object.values(choices).join(', ')})`
      );
    } catch (e) {
      // ⚠️ Qaytarish xatosi ASL xatoni BOSIB KETMASIN: aks holda alertda
      // "gemini 503" o'rniga "baza band" ko'rinardi va tashxis yo'qolardi.
      try {
        await refundCredits(String(tg.id), cheksiz);
      } catch (e2) {
        // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
        console.error('aiImage kredit qaytarilmadi:', e2.message);
      }
      throw e;
    }

    // ---- 5. Keshga yozish ----
    await pool.query(
      `INSERT INTO product_ai_image (product_id, choices_hash, choices, file_id, source_hash, model, tg_user_id)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)
       ON CONFLICT (product_id, choices_hash)
       DO UPDATE SET file_id = EXCLUDED.file_id,
                     source_hash = EXCLUDED.source_hash,
                     choices = EXCLUDED.choices,
                     model = EXCLUDED.model,
                     tg_user_id = EXCLUDED.tg_user_id,
                     created_at = now()`,
      [productId, cHash, JSON.stringify(choices), fileId, hash, model, String(tg.id)]
    );

    ok(res, {
      image: productPhotoUrl(fileId), model, cached: false, createdAt: new Date(),
      credits: { balance: kredit.balance, cost: AI_CREDIT_COST, unlimited: !!kredit.cheksiz },
    });
  } catch (e) {
    // ============ XATO TURI (2026-08-08) ============
    // Uch xil nosozlik uch xil javob beradi, chunki foydalanuvchi ular
    // bilan uch xil ish qiladi:
    //   busy    — provayder band (503/500). Qayta urinish FOYDALI.
    //   blocked — model rasmni rad etdi. Qayta urinish FOYDASIZ: ayni
    //             prompt ayni javobni beradi, javoblarni O'ZGARTIRISH kerak.
    //   qolgani — bizning tomonda nosozlik.
    // Hammasini bitta `ai_unavailable` ga qo'shish aynan 2026-08-08 da
    // zarar keltirdi: xaridor rad etilgan so'rovni qayta-qayta bosardi.
    //
    // ⚠️ Kredit UCHALASIDA ham qaytarilgan (yuqoridagi `refundCredits`),
    // ya'ni bu yerdagi tanlov faqat XABARGA ta'sir qiladi.
    //
    // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
    // ⚠️ Provayder bandligi ALOHIDA kalitga chiqarilgan va bu ataylab:
    // u bizning nosozligimiz emas va tez-tez takrorlanadi, umumiy kalitda
    // qolsa haqiqiy nuqsonni Telegram'da ko'mib yuborardi.
    if (e && e.kind === 'busy') {
      console.error('aiImage provayder band:', e.message);
      return fail(res, 'ai_busy', 503);
    }
    if (e && e.kind === 'blocked') {
      console.error('aiImage rad etildi:', e.message);
      return fail(res, 'ai_blocked', 422);
    }
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
const MY_LIMIT = 30;

// ============ ESKIRGAN JAVOBLI QATORLARNI FILTRLASH (2026-08-07) ============
// `kim = erkak` olib tashlanganda paydo bo'lgan savol: bazadagi eski rasmlar
// nima bo'ladi? Ular O'CHIRILMAYDI (haqiqiy, pulga chizilgan rasmlar), lekin
// KO'RSATILMAYDI.
//
// ⚠️ Tekshiruv `joriyJavobmi` bilan qilinadi — ya'ni "ko'rsatilmaydigan
// javoblar" degan IKKINCHI RO'YXAT yozilmaydi. db/014 darsi: ikkinchi ro'yxat
// himoya emas, kelajakdagi tuzoq — ro'yxatdan yana bir kalit olinsa, uni shu
// yerda ham eslab qolish kerak bo'lardi va aynan shu unutilardi.
//
// ⚠️ Ilgari bu yerda to'g'ridan-to'g'ri `normalizeChoices` turardi va u
// 2026-08-09 da JIMGINA ISHLAMAY QOLARDI: o'sha kuni butun `kim` guruhi
// olib tashlandi, `normalizeChoices` esa faqat O'ZI biladigan guruhlarni
// aylanadi — ya'ni endi notanish `kim` kaliti e'tibordan chetda qolardi va
// bazadagi `kim=erkak` / `kim=bola` rasmlari lentaga QAYTIB kelardi.
// Farq: `normalizeChoices` "javob yetarlimi" ni tekshiradi, `joriyJavobmi`
// esa "javob ORTIQCHA emasmi" ni ham.
function joriyMi(r) {
  return joriyJavobmi(r.choices);
}

function lentaYozuvi(r) {
  return {
    productId: r.product_id,
    image: productPhotoUrl(r.file_id),
    name: { uz: r.name_uz, ru: r.name_ru },
    choices: r.choices,
    createdAt: r.created_at,
  };
}

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
    ok(res, { items: rows.filter(joriyMi).slice(0, GALLERY_LIMIT).map(lentaYozuvi) });
  } catch (e) {
    // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
    console.error('aiGallery xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ MENING RASMLARIM + KREDIT — /api/ai/my (2026-08-07) ============
// AI ekranining "Mening rasmlarim" bo'limi va kredit ko'rsatkichi shundan
// oziqlanadi. Ikkalasi BITTA javobda: ekran ochilganda ikkita so'rov o'rniga
// bitta ketadi, va kredit qoldig'i rasmlar bo'lmaganda ham ko'rinadi.
//
// ⚠️ Kredit qoldig'i SO'RALMASDAN ko'rsatiladi — bu ataylab. Ilgari
// foydalanuvchi chegarani faqat U TUGAGANDA bilardi (HTTP 429), ya'ni pul
// sarflashdan oldin nechta qolganini ko'ra olmasdi.
//
// ⚠️ Imzo SHART: bu shaxsiy ma'lumot. Galereya (`/api/ai/gallery`) esa
// imzosiz va ochiq — u umumiy lenta.
async function handleAiMy(req, res) {
  const ip = clientIp(req);
  if (rateLimited(`aimy:${ip}`, 60)) return fail(res, 'too many requests', 429);
  try {
    const tg = authUser(req);
    if (!tg || !tg.id) return fail(res, 'unauthorized', 401);

    const { rows } = await pool.query(
      `SELECT i.product_id, i.file_id, i.choices, i.created_at, p.name_uz, p.name_ru
         FROM product_ai_image i
         JOIN products p ON p.id = i.product_id AND p.status = 'published'
        WHERE i.tg_user_id = $1
        ORDER BY i.created_at DESC
        LIMIT $2`,
      [String(tg.id), MY_LIMIT]
    );

    ok(res, {
      items: rows.filter(joriyMi).map(lentaYozuvi),
      credits: await readCredits(String(tg.id)),
    });
  } catch (e) {
    // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
    console.error('aiMy xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

module.exports = {
  handleAiImage, handleAiGallery, handleAiMy,
  takeCredits, refundCredits, readCredits, loadSourcePhoto,
};
