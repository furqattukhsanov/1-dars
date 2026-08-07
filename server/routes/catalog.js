const https = require('https');
const crypto = require('crypto');
const { pool } = require('../db');
const { BOT_TOKEN, ADMIN_PANEL_TOKEN, AI_IMAGE_ENABLED } = require('../config');
const { IMAGE_CHOICES, COMBO_CHOICES, COMBO_TEXT_MAX } = require('../lib/ai');
const { verifyInitData, authUser, isAdmin, currentSeller } = require('../lib/auth');
const { escapeHtml, money, safeEqual } = require('../lib/format');
const { validate } = require('../lib/validate');
const { rateLimited, readBody, sendJson, ok, fail } = require('../lib/http');
const { loadContacts } = require('../lib/contacts');
const { sendOrderNotifyMessage, callTelegram, notify, tgGetFile } = require('../lib/telegram-api');

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
      `INSERT INTO users (tg_user_id, full_name, role)
       VALUES ($1, $2, 'buyer')
       ON CONFLICT (tg_user_id)
       DO UPDATE SET full_name = COALESCE(EXCLUDED.full_name, users.full_name)
       RETURNING id, tg_user_id, full_name, role, created_at`,
      [String(tgUser.id), fullName]
    );
    // `aiImageEnabled` — AI rasm tugmasi chizilsinmi. Sozlama yaroqsiz bo'lsa
    // (config.js qorovuli) frontend tugmani UMUMAN ko'rsatmaydi: bosilgach
    // "xato" chiqadigan tugma sozlama buzilganini yashirardi.
    // ⚠️ Bu KO'RINISH belgisi, himoya EMAS — endpointning o'zi ham mustaqil
    // tekshiradi (tugmani yashirish hech qachon yagona qorovul bo'lmaydi).
    // `aiImageChoices` — savol guruhlari va ularning KALITLARI. Yorliqlar
    // (uz/ru) frontendda, kalitlar esa SERVERDA tug'iladi va shu yerdan
    // beriladi: ikkinchi ro'yxat himoya emas, kelajakdagi tuzoq (db/014).
    // Frontend serverdan kelmagan kalitni umuman chizmaydi.
    sendJson(res, 200, {
      ok: true,
      user: rows[0],
      aiImageEnabled: AI_IMAGE_ENABLED,
      aiImageChoices: AI_IMAGE_ENABLED
        ? Object.fromEntries(Object.entries(IMAGE_CHOICES).map(([g, v]) => [g, Object.keys(v)]))
        : null,
      // Combo javoblari ALOHIDA yuboriladi, chunki ular SHARTLI: faqat
      // `dizayn = combo` tanlanganda so'raladi. Bitta ro'yxatga qo'shib
      // yuborilsa frontend ularni doim chizardi va xaridor keraksiz ikki
      // savolga javob berib o'tirardi.
      aiComboChoices: AI_IMAGE_ENABLED
        ? Object.fromEntries(Object.entries(COMBO_CHOICES).map(([g, v]) => [g, Object.keys(v)]))
        : null,
      // Erkin matn chegarasi — frontend `maxlength` ni SHUNDAN oladi.
      // Qo'lda yozilsa server 60 ga, input 100 ga sozlanib qolishi mumkin
      // edi va xaridor yozib bo'lgach 400 xato ko'rardi (db/014 darsi).
      aiComboTextMax: AI_IMAGE_ENABLED ? COMBO_TEXT_MAX : null,
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

async function handleProductImage(msg) {
  const fileId = msg.photo ? msg.photo[msg.photo.length - 1].file_id : null;
  if (!fileId) return false;

  const p = await openAwaitingProductImage(msg.from.id);
  if (!p) return false;

  await pool.query(
    `UPDATE products SET img_file_id=$1, awaiting_image=false WHERE id=$2`,
    [fileId, p.id]);
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    parse_mode: 'HTML',
    text: `✅ Rasm qabul qilindi: <b>${escapeHtml(p.name_uz)}</b>`,
  });
  return true;
}

// ============ /api/products — katalog (bazadan) ============
function productRowToVM(r) {
  return {
    id: r.id,
    catKey: r.cat_key,
    pattern: r.pattern,
    img: r.img_file_id ? productPhotoUrl(r.img_file_id) : r.img,
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
      SELECT p.id, p.cat_key, p.pattern, p.img, p.img_file_id, p.price, p.unit, p.moq, p.lead_days,
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
  const u = authUser(req);
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
      `INSERT INTO products (id, seller_id, cat_key, price, unit, moq, name_uz, name_ru, comp_uz, stock, status, submitted_by_tg, awaiting_image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending',$11,true)`,
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
  handleProductPhoto, handleProductImage, productPhotoUrl,
};
