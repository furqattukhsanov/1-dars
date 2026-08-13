const https = require('https');
const crypto = require('crypto');
const { pool } = require('../db');
const { BOT_TOKEN, ADMIN_PANEL_TOKEN, AI_IMAGE_ENABLED } = require('../config');
const { aiClientConfig } = require('../lib/ai');
const { mapsClientConfig } = require('../lib/maps');
const { verifyInitData, authUser, requestUser, isAdmin, currentSeller } = require('../lib/auth');
const { escapeHtml, money, safeEqual } = require('../lib/format');
const { validate } = require('../lib/validate');
const { rateLimited, readBody, sendJson, ok, fail } = require('../lib/http');
const { loadContacts } = require('../lib/contacts');
const { sendOrderNotifyMessage, callTelegram, notify, tgGetFile, tgDownloadFile,
  MAX_DOWNLOAD_BYTES } = require('../lib/telegram-api');
const { r2Put, r2PublicUrl, R2_ENABLED } = require('../lib/r2');

// ============ /api/auth/telegram — Telegram orqali kirish ============
// initData'ni tekshiradi, foydalanuvchini users jadvaliga yozadi (yoki topadi).
async function handleAuthTelegram(req, res, ip) {
  if (rateLimited(`auth:${ip}`, 30)) return fail(res, 'too many requests', 429);
  try {
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body || '{}');
    const tgUser = verifyInitData(data.initData);
    if (!tgUser || !tgUser.id) return fail(res, 'invalid initData', 401);

    const fullName =
      [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || null;
    const { rows } = await pool.query(
      // `engaged_at` — BIRINCHI haqiqiy foydalanish belgisi (db/020).
      // `COALESCE` bilan bir marta yoziladi: keyingi ochishlar uni surmaydi,
      // aks holda "birinchi foydalanish" o'rniga "oxirgi" bo'lib qolardi.
      `INSERT INTO users (tg_user_id, full_name, role, engaged_at)
       VALUES ($1, $2, 'buyer', now())
       ON CONFLICT (tg_user_id)
       DO UPDATE SET full_name  = COALESCE(EXCLUDED.full_name, users.full_name),
                     engaged_at = COALESCE(users.engaged_at, now())
       RETURNING id, tg_user_id, full_name, role, created_at`,
      [String(tgUser.id), fullName]
    );
    // `aiImageEnabled` — AI rasm tugmasi chizilsinmi. Sozlama yaroqsiz bo'lsa
    // (config.js qorovuli) frontend tugmani UMUMAN ko'rsatmaydi: bosilgach
    // "xato" chiqadigan tugma sozlama buzilganini yashirardi.
    // ⚠️ Bu KO'RINISH belgisi, himoya EMAS — endpointning o'zi ham mustaqil
    // tekshiradi (tugmani yashirish hech qachon yagona qorovul bo'lmaydi).
    //
    // ⚠️ Blok QO'LDA yig'ilmaydi — `aiClientConfig()` (`lib/ai.js`) beradi va
    // AYNI funksiyani sayt tomoni (`/api/auth/web/me`) ham chaqiradi. Ilgari
    // u shu yerda qo'lda yozilgandi, ya'ni sozlama faqat Mini App'ga borardi.
    sendJson(res, 200, {
      ok: true,
      user: rows[0],
      ...aiClientConfig(AI_IMAGE_ENABLED),
      // Karta sozlamasi — AYNI naqsh (lib/maps.js).
      ...mapsClientConfig(),
    });
  } catch (e) {
    console.error('auth xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}


// ============ Mahsulot rasmi — Telegram file_id proksi ============
// Dalil rasmi (disputes.js) bilan bir xil naqsh: fayl serverimizda
// saqlanmaydi, faqat file_id. Bu yerdagi farq — mahsulot rasmi OMMAVIY
// (admin tokeni shart emas), shuning uchun imzo faqat "bizning serverni
// begona Telegram fayllarini proksi qilishga majburlab bo'lmasin" degan
// maqsadda ishlatiladi, maxfiylik uchun emas.
function productPhotoSig(fileId) {
  return crypto.createHmac('sha256', ADMIN_PANEL_TOKEN || 'x').update(String(fileId)).digest('hex').slice(0, 32);
}

function productPhotoUrl(fileId) {
  if (!fileId) return null;
  return `/api/product-photo?f=${encodeURIComponent(fileId)}&s=${productPhotoSig(fileId)}`;
}

// Telegram bergan `content-type` ishonchli emas: yo umuman yo'q, yo umumiy
// `application/octet-stream`. Ikkalasi ham yaroqsiz deb qaytariladi.
function usableMime(ct) {
  if (!ct) return null;
  const v = String(ct).split(';')[0].trim().toLowerCase();
  return (!v || v === 'application/octet-stream') ? null : v;
}

// `getFile` qaytargan yo'l kengaytmasidan tur aniqlanadi (`photos/file_12.jpg`).
const MIME_BY_EXT = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', gif: 'image/gif', heic: 'image/heic',
};
function mimeFromPath(p) {
  const ext = String(p || '').split('.').pop().toLowerCase();
  return MIME_BY_EXT[ext] || 'application/octet-stream';
}

async function handleProductPhoto(req, res, ip) {
  if (rateLimited(`productphoto:${ip}`, 300)) return fail(res, 'too many requests', 429);
  let f, s;
  try {
    const q = new URL(req.url, 'http://x').searchParams;
    f = q.get('f'); s = q.get('s');
  } catch (_) { return fail(res, 'invalid', 400); }
  if (!f || !s || !safeEqual(s, productPhotoSig(f))) return fail(res, 'unauthorized', 401);
  try {
    const filePath = await tgGetFile(f);
    if (!filePath) return fail(res, 'not found', 404);
    https.get(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`, (tgRes) => {
      if (tgRes.statusCode !== 200) { tgRes.resume(); return fail(res, 'not found', 404); }
      res.writeHead(200, {
        // Telegram fayl CDN'i `content-type` bermaydi — 2026-07-31 sinovida
        // rasm `application/octet-stream` bo'lib kelgani aniqlandi. Brauzer
        // <img> ichida turni o'zi sezadi, lekin Cloudflare rasm
        // optimizatsiyasi ishlamay qoladi. Shuning uchun tur `getFile`
        // qaytargan yo'lning kengaytmasidan aniqlanadi (`photos/file_12.jpg`).
        // DIQQAT: `|| ` yetarli emas — Telegram `application/octet-stream` ni
        // ATAYLAB yuborishi ham mumkin, u esa "truthy" va fallback'ni bosib
        // o'tardi. Shuning uchun umumiy tur ham yaroqsiz deb hisoblanadi.
        'Content-Type': usableMime(tgRes.headers['content-type']) || mimeFromPath(filePath),
        // Ommaviy katalog rasmi — brauzer/CDN uzoqroq keshlashi mumkin
        // (dalil rasmidan farqi: bu yerda maxfiylik yo'q).
        'Cache-Control': 'public, max-age=86400',
      });
      tgRes.pipe(res);
    }).on('error', () => fail(res, 'server error', 500));
  } catch (e) {
    console.error('productPhoto xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- Bot suhbati: mahsulot qo'shilgach yuborilgan rasm ----
async function openAwaitingProductImage(tgUserId) {
  const { rows } = await pool.query(
    `SELECT id, name_uz FROM products
      WHERE submitted_by_tg = $1 AND awaiting_image = true
      ORDER BY created_at DESC LIMIT 1`,
    [String(tgUserId)]);
  return rows[0] || null;
}

// Sotuvchi suratini R2 ga ham qo'yish — ENG YAXSHI HARAKAT.
//
// ⚠️ Yiqilsa sotuvchiga XATO KO'RSATILMAYDI va rasm qabul qilinganicha
// qoladi: `img_file_id` allaqachon yozilgan, ya'ni rasm katalogda ishlaydi.
// R2 bu yerda tezlik va bot tokenidan mustaqillik uchun, majburiy ombor emas.
// Lekin xato YUTILMAYDI — alertga chiqadi, aks holda R2 har safar yiqilib
// turgan holat jimgina davom etardi (`ALERT_CHAT_ID` darsi).
//
// Kalit TARKIBDAN yasaladi (baytlarning `sha256` i): bir xil rasm qayta
// yuborilsa ayni kalit chiqadi va ortiqcha nusxa yig'ilmaydi, boshqa rasm
// esa albatta boshqa kalit oladi — bu `immutable` kesh uchun SHART.
async function uploadProductImageToR2(productId, fileId) {
  const filePath = await tgGetFile(fileId);
  if (!filePath) throw new Error('suratning file_path i yo\'q');
  const { buf } = await tgDownloadFile(filePath);
  const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 32);
  const ext = String(filePath).split('.').pop().toLowerCase();
  const toza = String(productId).replace(/[^a-zA-Z0-9_-]/g, '') || 'x';
  const key = `mahsulot/${toza}/${hash}.${MIME_BY_EXT[ext] ? ext : 'jpg'}`;
  await r2Put(key, buf, mimeFromPath(filePath));
  return key;
}

async function handleProductImage(msg) {
  const fileId = msg.photo ? msg.photo[msg.photo.length - 1].file_id : null;
  if (!fileId) return false;

  const p = await openAwaitingProductImage(msg.from.id);
  if (!p) return false;

  // `awaiting_video` shu yerda ochiladi (db/023). Bu YANGI e'londagi bayroqdan
  // TASHQARI: migratsiyadan oldin yaratilgan mahsulotlarda u `false` bo'lib
  // qoladi va ularga video qo'shishning boshqa yo'li yo'q edi. Rasm yuborish —
  // sotuvchi shu e'lon bilan ishlayotganining aniq belgisi, ya'ni videoni
  // aynan shu paytda kutish xavfsiz.
  await pool.query(
    `UPDATE products SET img_file_id=$1, awaiting_image=false, awaiting_video=true WHERE id=$2`,
    [fileId, p.id]);

  // ⚠️ `img_file_id` dan KEYIN va alohida `UPDATE` bilan: R2 yiqilsa ham
  // rasm qabul qilingan bo'lib qolsin. Bitta `UPDATE` da birlashtirilsa,
  // R2 nosozligi sotuvchining rasmini butunlay yo'qotardi.
  if (R2_ENABLED) {
    try {
      const key = await uploadProductImageToR2(p.id, fileId);
      await pool.query('UPDATE products SET img_r2_key=$1 WHERE id=$2', [key, p.id]);
    } catch (e) {
      // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
      console.error('mahsulot rasmi R2 ga yozilmadi:', e.message);
    }
  }

  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    parse_mode: 'HTML',
    text: `✅ Rasm qabul qilindi: <b>${escapeHtml(p.name_uz)}</b>\n\n`
      + `🎬 Xohlasangiz shu mahsulot uchun <b>qisqa video</b> ham yuboring — `
      + `matoning tovlanishi va to'qimasi rasmdan ko'ra yaxshi ko'rinadi.\n`
      + `${VIDEO_MAX_SECONDS} soniyagacha, <b>fayl sifatida emas</b> — oddiy video qilib.`,
  });
  return true;
}

// ============ MAHSULOT VIDEOSI (db/023) ============
// Rasm yo'lining yonidagi ikkinchi tarmoq. Uchta joyda undan ATAYLAB farq
// qiladi va har bir farqning sababi bor:
//
// 1️⃣ TARTIB TESKARI — avval R2, keyin baza. Rasmda R2 "eng yaxshi harakat":
//    yiqilsa ham `img_file_id` orqali Telegram proksisi rasmni ko'rsataveradi.
//    Videoda bu pog'ona YO'Q — `handleProductPhoto` faylni butunlay `pipe`
//    qiladi va `Range` (206) bermaydi, iOS Safari esa `<video>` uchun aynan
//    shuni talab qiladi. Ya'ni R2 siz yozilgan `vid_file_id` — hech qachon
//    ochilmaydigan videoni "bor" deb ko'rsatuvchi jimgina yolg'on bo'lardi
//    (`NULL` reyting va `ALERT_CHAT_ID` darslari bilan bitta oila).
//
// 2️⃣ RAD ETISH ESHITILADI. Chegaraga urilgan sotuvchi jim qoldirilsa
//    "yubordim, ishlamadi" degan holatda qolardi va sababini faqat biz
//    jurnaldan ko'rardik. Har rad etishda `awaiting_video` ATAYLAB `true`
//    qoladi — qayta urinish darrov ishlashi kerak.
//
// 3️⃣ `ffmpeg` YO'Q. Muqovani (birinchi kadr) Telegram o'zi beradi
//    (`msg.video.thumbnail`), ya'ni serverga nativ paket qo'shilmaydi —
//    `lib/png.js` da `sharp` dan voz kechilgani bilan bir xil mulohaza.
const VIDEO_MAX_SECONDS = 30;
const VIDEO_MIME = 'video/mp4';

function mb(baytlar) {
  return Math.round((baytlar / (1024 * 1024)) * 10) / 10;
}

// Rad etish sababi (sotuvchiga ko'rsatiladigan matn) yoki `null`.
//
// ⚠️ Tekshiruv baytlarni YUKLASHDAN OLDIN bo'ladi: Telegram xabarning
// o'zida `duration`, `file_size` va `mime_type` ni beradi. Yuklab bo'lgandan
// keyin rad etish 12 MB ni bekorga tortib olish demakdir, ustiga Bot API
// `getFile` 20 MB dan kattasini UMUMAN bermaydi va xato "fayl topilmadi"
// bo'lib kelib, sababi butunlay boshqa narsaga o'xshab ko'rinardi.
function videoRadSababi(v) {
  const mime = String(v.mime_type || '').toLowerCase();
  if (mime !== VIDEO_MIME) {
    // Telefon kamerasidan Telegram orqali kelgan video har doim mp4/h264.
    // Boshqa tur — odatda `.mov`/HEVC, ya'ni sotuvchi uni FAYL sifatida
    // yuborgan: bunday video Android Chrome'da umuman ochilmaydi.
    return `Video <b>MP4</b> bo'lishi kerak.\n\nTelegram'da uni <b>fayl (document)</b> `
      + `sifatida emas, oddiy <b>video</b> qilib yuboring — Telegram o'zi to'g'ri formatga o'giradi.`;
  }
  const sek = Number(v.duration || 0);
  if (sek > VIDEO_MAX_SECONDS) {
    return `Video <b>${VIDEO_MAX_SECONDS} soniyadan</b> uzun bo'lmasin `
      + `(sizniki — ${sek} s).\n\nQisqartirib qayta yuboring: xaridor uzun videoni oxirigacha ko'rmaydi, `
      + `mobil internet esa behuda sarflanadi.`;
  }
  const bayt = Number(v.file_size || 0);
  if (bayt > MAX_DOWNLOAD_BYTES) {
    return `Video hajmi <b>${mb(MAX_DOWNLOAD_BYTES)} MB dan</b> kichik bo'lsin `
      + `(sizniki — ${mb(bayt)} MB).\n\nTelegram'da videoni yuborishdan oldin sifatni pasaytiring `
      + `yoki qisqaroq oling.`;
  }
  return null;
}

async function openAwaitingProductVideo(tgUserId) {
  const { rows } = await pool.query(
    `SELECT id, name_uz FROM products
      WHERE submitted_by_tg = $1 AND awaiting_video = true
      ORDER BY created_at DESC LIMIT 1`,
    [String(tgUserId)]);
  return rows[0] || null;
}

// Kalit TARKIBDAN yasaladi (baytlarning `sha256` i) — rasmdagi bilan AYNI
// qoida. Obyekt R2 da `immutable, max-age=31536000` bilan yotadi, ya'ni bitta
// kalit ostidagi fayl hech qachon o'zgarmasligi SHART: tasodifiy kalitda
// video almashgan kuni eskisi bir yil davomida yangisi o'rniga ko'rinardi.
// Muqova ham AYNI hashga bog'lanadi — video bilan birga eskiradi.
async function uploadProductVideoToR2(productId, v) {
  const filePath = await tgGetFile(v.file_id);
  if (!filePath) throw new Error('videoning file_path i yo\'q');
  const { buf } = await tgDownloadFile(filePath);
  const hash = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 32);
  const toza = String(productId).replace(/[^a-zA-Z0-9_-]/g, '') || 'x';
  const key = `mahsulot/${toza}/video/${hash}.mp4`;
  await r2Put(key, buf, VIDEO_MIME);

  // ---- Muqova ----
  // ⚠️ O'Z `try` i bilan: muqova YO'QOLSA video yo'qolmaydi. Poster bo'lmasa
  // chiqishda mahsulot rasmi ishlatiladi, ya'ni nuqson kosmetik. Xato esa
  // YUTILMAYDI — alertga chiqadi (tasma/R2 bandlaridagi bilan bitta qoida).
  let posterKey = null;
  const thumbId = (v.thumbnail && v.thumbnail.file_id) || (v.thumb && v.thumb.file_id) || null;
  if (thumbId) {
    try {
      const thumbPath = await tgGetFile(thumbId);
      if (thumbPath) {
        const t = await tgDownloadFile(thumbPath);
        posterKey = `mahsulot/${toza}/video/${hash}-poster.jpg`;
        await r2Put(posterKey, t.buf, mimeFromPath(thumbPath));
      }
    } catch (e) {
      // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
      console.error('video muqovasi R2 ga yozilmadi:', e.message);
      posterKey = null;
    }
  }

  return { key, posterKey, thumbId, bytes: buf.length };
}

async function handleProductVideo(msg) {
  const v = msg.video;
  if (!v || !v.file_id) return false;

  const p = await openAwaitingProductVideo(msg.from.id);
  // Mahsulot kutmayapti — video boshqa maqsadda yuborilgan. `false` qaytadi
  // va webhook uni o'z yo'liga qo'yib yuboradi (bahs dalili allaqachon
  // bundan OLDIN tekshirilgan).
  if (!p) return false;

  const sabab = videoRadSababi(v);
  if (sabab) {
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      parse_mode: 'HTML',
      text: `⚠️ Video qabul qilinmadi.\n\n${sabab}`,
    });
    return true;
  }

  let natija;
  try {
    natija = await uploadProductVideoToR2(p.id, v);
  } catch (e) {
    // R2 o'chiq bo'lsa ham shu yo'ldan o'tadi (`r2Put` → "R2 sozlanmagan").
    console.error('mahsulot videosi R2 ga yozilmadi:', e.message);
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      parse_mode: 'HTML',
      // ⚠️ "Qabul qilindi" DEYILMAYDI. Bazaga yozilmagan video keyin
      // ko'rinmaydi va sotuvchi buni faqat oylar o'tib sezardi.
      text: '⚠️ Videoni hozir saqlab bo\'lmadi — texnik nosozlik.\n\n'
        + 'Birozdan keyin qayta yuboring, e\'lon video kutib turadi.',
    });
    return true;
  }

  await pool.query(
    `UPDATE products
        SET vid_file_id=$1, vid_r2_key=$2, vid_poster_file_id=$3,
            vid_poster_r2_key=$4, vid_seconds=$5, vid_bytes=$6,
            vid_at=now(), awaiting_video=false
      WHERE id=$7`,
    [v.file_id, natija.key, natija.thumbId, natija.posterKey,
      v.duration == null ? null : Number(v.duration), natija.bytes, p.id]);

  // Havola ATAYLAB beriladi: A+B bosqichida video hali katalogda
  // ko'rsatilmaydi (frontend — D bandi), ya'ni usiz natijani KO'RIB
  // bo'lmasdi. Hajm va davomiylik ham shu sabab yoziladi — namunalar
  // yig'ilgach "video qancha joy oladi" degan savolga o'lchangan javob
  // kerak, taxmin emas (hujjatdagi raqam — tekshirilmagan da'vo darsi).
  const havola = r2PublicUrl(natija.key);
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    parse_mode: 'HTML',
    text: `✅ Video qabul qilindi: <b>${escapeHtml(p.name_uz)}</b>\n\n`
      + `⏱ ${v.duration || 0} soniya · 📦 ${mb(natija.bytes)} MB`
      + (havola ? `\n🔗 ${escapeHtml(havola)}` : '')
      // ⚠️ "Katalogda ko'rinadi" DEYILMAYDI — frontend hali qo'shilmagan
      // (D bandi). Bajarilmagan va'da bergandan ko'ra kamroq va'da berilsin.
      + `\n\nSaqlandi — sifatini ko'rib chiqamiz.`,
  });
  return true;
}

// ============ /api/products — katalog (bazadan) ============
function productRowToVM(r) {
  return {
    id: r.id,
    catKey: r.cat_key,
    pattern: r.pattern,
    // Uch pog'ona, shu tartibda: R2 (eng tez, bot tokeniga bog'liq emas) →
    // Telegram proksi (eski yo'l) → repodagi statik rasm. `r2PublicUrl` domen
    // ulanmagan bo'lsa `null` qaytaradi, ya'ni pog'ona o'zi pastga tushadi.
    img: r2PublicUrl(r.img_r2_key) || (r.img_file_id ? productPhotoUrl(r.img_file_id) : r.img),
    price: Number(r.price),
    unit: r.unit,
    moq: Number(r.moq),
    lead: r.lead_days == null ? null : Number(r.lead_days),
    rating: r.rating == null ? null : Number(r.rating),
    reviews: Number(r.reviews || 0),
    verified: !!r.is_verified,
    stockKey: r.stock_key,
    // null = cheksiz (`made` va sotuvchi son kiritmagan e'lonlar)
    stock: r.stock === null || r.stock === undefined ? null : Number(r.stock),
    badgeTone: r.badge_tone,
    width: r.width,
    weight: r.weight,
    name: { uz: r.name_uz, ru: r.name_ru },
    supplier: { uz: r.business_name_uz, ru: r.business_name_ru },
    city: { uz: r.city_uz, ru: r.city_ru },
    comp: { uz: r.comp_uz, ru: r.comp_ru },
    badge: r.badge_uz ? { uz: r.badge_uz, ru: r.badge_ru } : null,
  };
}

async function handleGetProducts(req, res, ip) {
  if (rateLimited(`products:${ip}`, 60)) return fail(res, 'too many requests', 429);
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.cat_key, p.pattern, p.img, p.img_file_id, p.img_r2_key, p.price, p.unit, p.moq, p.lead_days,
             p.rating, p.reviews, p.stock_key, p.stock, p.badge_tone, p.width, p.weight,
             p.name_uz, p.name_ru, p.comp_uz, p.comp_ru, p.badge_uz, p.badge_ru,
             s.business_name_uz, s.business_name_ru, s.city_uz, s.city_ru, s.is_verified
      FROM products p
      LEFT JOIN sellers s ON s.id = p.seller_id
      WHERE p.status = 'published'
      ORDER BY p.sort_order NULLS LAST, p.id
    `);
    // Orqaga moslik: eski mijozlar yalang'och massiv kutadi (envelope EMAS)
    sendJson(res, 200, rows.map(productRowToVM));
  } catch (e) {
    console.error('products xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/products POST — yangi e'lon yuborish (moderatsiyaga) ============
// Autentifikatsiya qilingan foydalanuvchi mahsulot taklif qiladi. E'lon 'pending'
// holatida saqlanadi — admin tasdiqlamaguncha katalogda KO'RINMAYDI (approval workflow).
async function handleSubmitProduct(req, res, ip) {
  if (rateLimited(`submitproduct:${ip}`, 10)) return fail(res, 'too many requests', 429);
  // Kimlik ikkala kanaldan (2026-08-13, C2): sotuvchi kabineti saytda ham
  // ochilgach, "e'lon qo'shish" faqat Mini App'da ishlaydigan bo'lib qolardi —
  // ya'ni kabinet YARIM bo'lardi. Faqat `u.id` ishlatiladi, shuning uchun
  // `requestUser` ning qisqaroq shakli hech narsani yo'qotmaydi.
  // ⚠️ Rasm baribir BOT orqali so'raladi (`awaiting_image` + `notify`) —
  // sayt fayl yuklashni qo'shmaydi, xabar sotuvchining Telegramiga boradi.
  const u = await requestUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  try {
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body);
    const v = validate(data, {
      name_uz: { type: 'string', required: true, min: 2, max: 200 },
      name_ru: { type: 'string', required: false, max: 200 },
      price:   { type: 'int', required: true, min: 1, max: 100000000000 },
      cat_key: { type: 'string', required: true, enum: ['silk', 'ikat', 'suzani', 'cotton', 'wool', 'linen'] },
      unit:    { type: 'string', required: false, max: 20, default: 'rulon' },
      moq:     { type: 'int', required: false, min: 1, max: 100000, default: 1 },
      comp_uz: { type: 'string', required: false, max: 500 },
      // Bo'sh qoldirilsa null = CHEKSIZ (011 migratsiyasi). 0 esa haqiqiy
      // qiymat — "zaxirada tugadi".
      stock:   { type: 'int', required: false, min: 0, max: 1000000 },
    });
    if (!v.ok) return fail(res, v.error, 400);
    const d = v.data;
    const id = 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    // Yuboruvchi tasdiqlangan sotuvchi bo'lsa, e'lon o'sha sotuvchiga biriktiriladi —
    // shusiz mahsulot kabinetda ko'rinmaydi va buyurtma unga yetib bormaydi.
    const me = await currentSeller(u);
    const sellerId = me && me.role === 'seller' ? me.seller_id : null;
    await pool.query(
      // `awaiting_video` ham darrov ochiladi (db/023): sotuvchi videoni rasmdan
      // OLDIN yuborishi mumkin va o'sha video yo'qolib ketmasin. Eski
      // e'lonlarda bayroq rasm qabul qilinganda ochiladi.
      `INSERT INTO products (id, seller_id, cat_key, price, unit, moq, name_uz, name_ru, comp_uz, stock, status, submitted_by_tg, awaiting_image, awaiting_video)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',$11,true,true)`,
      [id, sellerId, d.cat_key, d.price, d.unit || 'rulon', d.moq || 1, d.name_uz, d.name_ru, d.comp_uz, d.stock, String(u.id)]
    );
    sendOrderNotifyMessage(
      `🆕 <b>Yangi e'lon moderatsiyaga</b>\n\n<b>${escapeHtml(d.name_uz)}</b>\nNarx: ${escapeHtml(money(d.price))}\nID: <code>${escapeHtml(id)}</code>\n\nRo'yxat: <code>/moderatsiya</code>`
    ).catch(() => {});
    // Rasm formada emas — bot orqali so'raymiz (Telegram file_id naqshi, disputes'dagi kabi)
    notify(u.id,
      `🖼 <b>${escapeHtml(d.name_uz)}</b> qo'shildi.\n\nEndi shu mahsulot uchun <b>rasm yuboring</b> — u katalogda ko'rsatiladi. Rasmsiz ham moderatsiyadan o'tishi mumkin, lekin xaridorlar uni ko'rmaydi.`
    );
    ok(res, { id, status: 'pending' }, 201);
  } catch (e) {
    console.error('submitProduct xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/admin/moderation — moderatsiya (FAQAT admin) ============
// GET  → 'pending' e'lonlar ro'yxati
// POST → { id, action:'approve'|'reject', reason? } bilan tasdiqlash/rad etish
// Ruxsat SERVER tomonda isAdmin() bilan tekshiriladi (401 = kirmagan, 403 = admin emas).
async function handleModerationList(req, res, ip) {
  if (rateLimited(`modlist:${ip}`, 60)) return fail(res, 'too many requests', 429);
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  if (!isAdmin(u)) return fail(res, 'forbidden', 403);
  try {
    const { rows } = await pool.query(
      `SELECT id, name_uz, name_ru, price, unit, moq, cat_key, comp_uz, submitted_by_tg, created_at
       FROM products WHERE status = 'pending' ORDER BY created_at DESC LIMIT 100`
    );
    ok(res, rows);
  } catch (e) {
    console.error('modList xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

async function handleModerationAction(req, res, ip) {
  if (rateLimited(`modaction:${ip}`, 30)) return fail(res, 'too many requests', 429);
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  if (!isAdmin(u)) return fail(res, 'forbidden', 403);
  try {
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body);
    const v = validate(data, {
      id:     { type: 'string', required: true, max: 100 },
      action: { type: 'string', required: true, enum: ['approve', 'reject'] },
      reason: { type: 'string', required: false, max: 500 },
    });
    if (!v.ok) return fail(res, v.error, 400);
    const newStatus = v.data.action === 'approve' ? 'published' : 'rejected';
    const { rows } = await pool.query(
      `UPDATE products SET status = $1, reject_reason = $2, reviewed_at = now()
       WHERE id = $3 AND status = 'pending'
       RETURNING id, status`,
      [newStatus, v.data.action === 'reject' ? (v.data.reason || null) : null, v.data.id]
    );
    if (!rows.length) return fail(res, "pending e'lon topilmadi", 404);
    ok(res, rows[0]);
  } catch (e) {
    console.error('modAction xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}




// ============ /api/telegram-contact — telefon (fayl bazasi) ============
function handleGetContact(req, res, ip) {
  if (rateLimited(`contact:${ip}`, 30)) return fail(res, 'too many requests', 429);
  let uid;
  try {
    uid = new URL(req.url, 'http://x').searchParams.get('uid');
  } catch (e) {
    uid = null;
  }
  if (!uid || !/^\d+$/.test(uid)) return fail(res, 'invalid uid', 400);
  const data = loadContacts();
  const entry = data[uid];
  sendJson(res, 200, { phone: entry ? entry.phone : null });
}




module.exports = {
  handleAuthTelegram, handleGetProducts, handleSubmitProduct, handleModerationList, handleModerationAction, handleGetContact,
  handleProductPhoto, handleProductImage, handleProductVideo, productPhotoUrl,
  // Sinov uchun ATAYLAB ochiq: chegara qorovulini (`videoRadSababi`) to'g'ridan-
  // to'g'ri sinab bo'lsin — loyiha darsi: yozilgan qoida himoya emas, uni
  // tekshiradigan test himoya (`lib/r2.js` → `tekshirKalit` bilan bir xil).
  videoRadSababi, VIDEO_MAX_SECONDS,
};
