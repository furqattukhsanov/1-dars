const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3001;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://lolamarket.uz';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://lolamarket.uz/mini-app/';
const CONTACTS_FILE = __dirname + '/contacts.json';

// Moderatsiya ruxsati bor Telegram ID'lari (vergul bilan ajratilgan).
// Berilmasa — ADMIN_CHAT_ID (admin shaxsiy chati = uning Telegram user id'si).
const ADMIN_TG_IDS = new Set(
  (process.env.ADMIN_TG_IDS || process.env.ADMIN_CHAT_ID || '')
    .split(',').map((s) => s.trim()).filter(Boolean)
);

if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
  console.error('BOT_TOKEN yoki ADMIN_CHAT_ID .env da topilmadi');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL .env da topilmadi');
  process.exit(1);
}

// ============ POSTGRESQL ============
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', (e) => console.error('pg pool xatosi:', e.message));

const hits = new Map();
function rateLimited(key, max = 10) {
  const now = Date.now();
  const windowMs = 60_000;
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

function clientIp(req) {
  const fwd = req.headers['x-real-ip'] || (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || req.socket.remoteAddress;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// So'm formatlash: 1720000 -> "1 720 000 so'm"
function money(n) {
  const v = Math.round(Number(n) || 0);
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
}

const MONTHS = {
  uz: ['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr'],
  ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
};
function dateLabel(d) {
  return { uz: `${d.getDate()}-${MONTHS.uz[d.getMonth()]}`, ru: `${d.getDate()} ${MONTHS.ru[d.getMonth()]}` };
}

// ============ VALIDATSIYA (PROMPT 1 / Dars 11) ============
// Zod o'rnini bosuvchi minimal validator — tashqi dependency qo'shmasdan.
// Muhim: server HECH QACHON client tekshiruviga ishonmaydi. Client validatsiyasi
// (brauzerdagi forma) faqat UX uchun — DevTools orqali uni chetlab o'tish oson,
// shu sabab har bir yozuv shu yerda, server tomonda, qaytadan tekshiriladi.
//
// Qoida obyekti maydon uchun: { type:'string'|'int', required, min, max, enum, default }
//   string: min/max = belgilar soni
//   int:    min/max = qiymat chegarasi
function checkField(value, rule, field) {
  const isEmpty = value == null || value === '';
  if (isEmpty) {
    if (rule.required) return { error: `${field}: majburiy maydon` };
    return { value: rule.default !== undefined ? rule.default : null };
  }
  if (rule.type === 'int') {
    const n = typeof value === 'number' ? value : parseInt(value, 10);
    if (!Number.isInteger(n)) return { error: `${field}: butun son bo'lishi kerak` };
    if (rule.min != null && n < rule.min) return { error: `${field}: kamida ${rule.min}` };
    if (rule.max != null && n > rule.max) return { error: `${field}: ${rule.max} dan oshmasligi kerak` };
    return { value: n };
  }
  if (typeof value !== 'string') return { error: `${field}: matn bo'lishi kerak` };
  const s = value.trim();
  if (rule.min != null && s.length < rule.min) return { error: `${field}: kamida ${rule.min} belgi` };
  if (rule.max != null && s.length > rule.max) return { error: `${field}: ${rule.max} belgidan oshmasligi kerak` };
  if (rule.enum && !rule.enum.includes(s)) return { error: `${field}: ruxsat etilmagan qiymat` };
  return { value: s };
}

// Butun obyektni sxema bo'yicha tekshiradi.
// { ok:true, data:{...tozalangan} } yoki { ok:false, error:'birinchi xato', errors:[...] }
function validate(data, schema) {
  const out = {};
  const errors = [];
  for (const field in schema) {
    const res = checkField(data ? data[field] : undefined, schema[field], field);
    if (res.error) errors.push(res.error);
    else out[field] = res.value;
  }
  return errors.length ? { ok: false, error: errors[0], errors } : { ok: true, data: out };
}

// Foydalanuvchiga ko'rsatish mumkin bo'lgan xato (validatsiya / biznes qoidasi).
// Server ICHKI xatolari (DB, tarmoq) bu belgiga ega bo'lmaydi — ular umumiy
// "server error" bilan yashiriladi, shunda stack trace yoki DB detallari
// hech qachon klientga chiqmaydi (Dars 11 — xato boshqaruvi).
class ClientError extends Error {
  constructor(message) {
    super(message);
    this.userFacing = true;
  }
}

// ============ KONTAKTLAR (telefon ulashish) — fayl bazasi ============
function loadContacts() {
  try {
    return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveContact(userId, phone) {
  const data = loadContacts();
  data[String(userId)] = { phone, savedAt: Date.now() };
  try {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(data));
  } catch (e) {
    console.error('contacts.json yozishda xato:', e.message);
  }
}

function callTelegram(method, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${BOT_TOKEN}/${method}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sendOrderNotifyMessage(text) {
  return callTelegram('sendMessage', { chat_id: ADMIN_CHAT_ID, text, parse_mode: 'HTML' });
}

function sendBuyerConfirmMessage(chatId, itemsText, total) {
  const text = [
    '✅ <b>Buyurtmangiz qabul qilindi</b>',
    '',
    '<b>Tarkib:</b>',
    itemsText,
    '',
    `<b>Jami:</b> ${escapeHtml(total || '-')}`,
    '',
    "Ishlab chiqaruvchi tasdiqlaydi — tez orada xabar beramiz.",
  ].join('\n');
  return callTelegram('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' });
}

const STATUS_COMMANDS = {
  tasdiqla: {
    status: 'confirmed',
    buyerText: (orderId) =>
      `✅ <b>Buyurtmangiz tasdiqlandi!</b>\n\nBuyurtma: <code>${escapeHtml(orderId)}</code>\nTez orada ishlab chiqarishga yuboriladi.`,
    adminOkText: (orderId) => `✅ ${orderId} xaridorga tasdiqlandi deb xabar berildi.`,
  },
  yolga: {
    status: 'shipped',
    buyerText: (orderId) =>
      `🚚 <b>Buyurtmangiz yo'lga chiqdi!</b>\n\nBuyurtma: <code>${escapeHtml(orderId)}</code>\nBTS Pochta orqali yetkazib berilmoqda.`,
    adminOkText: (orderId) => `🚚 ${orderId} xaridorga yo'lga chiqdi deb xabar berildi.`,
  },
  yetdi: {
    status: 'delivered',
    buyerText: (orderId) =>
      `📦 <b>Buyurtmangiz yetib keldi!</b>\n\nBuyurtma: <code>${escapeHtml(orderId)}</code>\nXaridingiz uchun rahmat!`,
    adminOkText: (orderId) => `📦 ${orderId} xaridorga yetib keldi deb xabar berildi.`,
  },
};

function sendOpenAppMessage(chatId, text) {
  return callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: "🌷 Do'konni ochish", web_app: { url: MINI_APP_URL } }]],
    },
  });
}

function readBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        req.destroy();
        reject(new Error('payload too large'));
        return;
      }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

// ============ STANDART API JAVOBI (PROMPT 4 / Dars 11) ============
// "lib/api-response" ekvivalenti: barcha API javoblari bitta shaklda —
// muvaffaqiyat { ok:true, data }, xato { ok:false, error } — to'g'ri HTTP status bilan.
// Status kodlar: 200 OK, 201 Created, 400 noto'g'ri kirish, 401 kirilmagan,
// 403 ruxsat yo'q, 404 topilmadi, 429 juda ko'p so'rov, 500 server xatosi.
function ok(res, data = null, code = 200) {
  sendJson(res, code, { ok: true, data });
}
function fail(res, error = 'error', code = 400) {
  sendJson(res, code, { ok: false, error });
}

// ============ TELEGRAM initData IMZOSINI TEKSHIRISH ============
// Telegram Mini App yuborgan initData'ni bot token bilan tekshiradi.
// Imzo to'g'ri bo'lsa foydalanuvchi obyektini qaytaradi, aks holda null.
// Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
function verifyInitData(initData, maxAgeSec = 86400) {
  try {
    if (!initData || typeof initData !== 'string') return null;
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    params.delete('hash');

    // hash'dan tashqari barcha kalit=qiymat larni alifbo tartibida \n bilan birlashtiramiz
    const pairs = [];
    for (const [k, v] of params) pairs.push(`${k}=${v}`);
    pairs.sort();
    const dataCheckString = pairs.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    // Doimiy vaqtli taqqoslash (timing attack'dan himoya)
    const a = Buffer.from(computed, 'hex');
    const b = Buffer.from(hash, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    // auth_date eskirganmi? (standart 24 soat)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    if (maxAgeSec && authDate && Date.now() / 1000 - authDate > maxAgeSec) return null;

    const userJson = params.get('user');
    if (!userJson) return null;
    return JSON.parse(userJson); // { id, first_name, last_name, username, ... }
  } catch (e) {
    return null;
  }
}

// So'rov header'idagi initData'dan tasdiqlangan foydalanuvchini qaytaradi (yoki null).
// Himoyalangan endpointlar shu orqali "bu kim" ekanini BILADI — mijozga ishonmaydi.
function authUser(req) {
  return verifyInitData(req.headers['x-telegram-init-data']);
}

// Foydalanuvchi admin (moderator)mi? Kimlik imzolangan initData'dan olinadi,
// so'ng ADMIN_TG_IDS ro'yxati bilan SERVER tomonda solishtiriladi.
// MUHIM (Dars 11): bu tekshiruv hech qachon faqat frontendda (masalan tugmani
// yashirish) bo'lmasligi kerak — aks holda har kim to'g'ridan-to'g'ri so'rov
// yuborib admin funksiyalarini chaqira olardi.
function isAdmin(tgUser) {
  return !!(tgUser && tgUser.id && ADMIN_TG_IDS.has(String(tgUser.id)));
}

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
    sendJson(res, 200, { ok: true, user: rows[0] });
  } catch (e) {
    console.error('auth xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/products — katalog (bazadan) ============
function productRowToVM(r) {
  return {
    id: r.id,
    catKey: r.cat_key,
    pattern: r.pattern,
    img: r.img,
    price: Number(r.price),
    unit: r.unit,
    moq: Number(r.moq),
    lead: r.lead_days == null ? null : Number(r.lead_days),
    rating: r.rating == null ? null : Number(r.rating),
    reviews: Number(r.reviews || 0),
    verified: !!r.is_verified,
    stockKey: r.stock_key,
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
      SELECT p.id, p.cat_key, p.pattern, p.img, p.price, p.unit, p.moq, p.lead_days,
             p.rating, p.reviews, p.stock_key, p.badge_tone, p.width, p.weight,
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
    });
    if (!v.ok) return fail(res, v.error, 400);
    const d = v.data;
    const id = 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    await pool.query(
      `INSERT INTO products (id, cat_key, price, unit, moq, name_uz, name_ru, comp_uz, status, submitted_by_tg)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9)`,
      [id, d.cat_key, d.price, d.unit || 'rulon', d.moq || 1, d.name_uz, d.name_ru, d.comp_uz, String(u.id)]
    );
    sendOrderNotifyMessage(
      `🆕 <b>Yangi e'lon moderatsiyaga</b>\n\n<b>${escapeHtml(d.name_uz)}</b>\nNarx: ${escapeHtml(money(d.price))}\nID: <code>${escapeHtml(id)}</code>\n\nRo'yxat: <code>/moderatsiya</code>`
    ).catch(() => {});
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

// ============ /api/orders POST — buyurtma yaratish (bazaga) ============
async function handleCreateOrder(req, res, ip) {
  if (rateLimited(`createorder:${ip}`)) return fail(res, 'too many requests', 429);
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  const client = await pool.connect();
  try {
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body);

    // 1) Skalyar maydonlar — uzunlik cheklovlari (DB'ni suiiste'moldan himoya qiladi)
    const v = validate(data, {
      buyerName: { type: 'string', required: false, max: 200 },
      address:   { type: 'string', required: false, max: 500 },
      payment:   { type: 'string', required: false, max: 100 },
      comment:   { type: 'string', required: false, max: 1000 },
      lang:      { type: 'string', required: false, enum: ['uz', 'ru'], default: 'uz' },
    });
    if (!v.ok) throw new ClientError(v.error);

    // 2) Savat (items) — massiv, har element {id:string, qty:int}
    const lines = Array.isArray(data.items) ? data.items : [];
    if (!lines.length) throw new ClientError("Savat bo'sh");
    if (lines.length > 50) throw new ClientError("Juda ko'p tur (maksimum 50)");
    for (const l of lines) {
      if (!l || typeof l.id !== 'string' || !l.id.trim()) throw new ClientError("Mahsulot ID noto'g'ri");
      const q = parseInt(l.qty, 10);
      if (!Number.isInteger(q) || q < 1 || q > 100000) throw new ClientError("Miqdor 1..100000 oralig'ida bo'lishi kerak");
    }

    // Mahsulot narx/nom/moq'ni BAZADAN olamiz (klientga ishonmaymiz)
    const ids = lines.map((l) => String(l.id));
    const qtyById = new Map(lines.map((l) => [String(l.id), Math.max(1, parseInt(l.qty, 10) || 1)]));
    const { rows: prods } = await client.query(
      `SELECT id, price, name_uz, name_ru, unit, moq FROM products WHERE id = ANY($1)`,
      [ids]
    );
    if (!prods.length) throw new ClientError('Mahsulot topilmadi');

    // 3) MOQ (minimal buyurtma) — biznes qoidasi, faqat server tomonda ishonchli
    for (const p of prods) {
      const qty = qtyById.get(p.id) || 1;
      const moq = Number(p.moq) || 1;
      if (qty < moq) throw new ClientError(`"${p.name_uz}" uchun minimal buyurtma: ${moq} ${p.unit}`);
    }

    const lang = data.lang === 'ru' ? 'ru' : 'uz';
    const items = prods.map((p) => {
      const qty = qtyById.get(p.id) || 1;
      return {
        id: p.id,
        qty,
        unitPrice: Number(p.price),
        name: lang === 'ru' ? p.name_ru : p.name_uz,
        unit: p.unit,
      };
    });
    const total = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);

    await client.query('BEGIN');
    const { rows: idRows } = await client.query(`SELECT '#LM-' || nextval('order_seq') AS id`);
    const orderId = idRows[0].id;

    await client.query(
      `INSERT INTO orders (id, buyer_name, tg_user_id, tg_username, address, payment, comment, total_amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending')`,
      [
        orderId,
        data.buyerName || null,
        String(u.id),               // tasdiqlangan Telegram ID (mijozdan emas — imzodan)
        u.username || data.tgUser || null,
        data.address || null,
        data.payment || null,
        data.comment || null,
        total,
      ]
    );
    for (const it of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, qty, unit_price) VALUES ($1,$2,$3,$4,$5)`,
        [orderId, it.id, it.name, it.qty, it.unitPrice]
      );
    }
    await client.query('COMMIT');

    // Telegram xabarlari (baza yozilgach)
    const uShort = (u) => (u === 'rulon' ? 'rulon' : u || '');
    const itemsText = items
      .slice(0, 30)
      .map((it) => `• ${escapeHtml(it.name || '?')} — ${escapeHtml(it.qty)} ${escapeHtml(uShort(it.unit))} x ${escapeHtml(money(it.unitPrice))}`)
      .join('\n');
    const adminText = [
      '🛒 <b>Yangi buyurtma — LolaMarket</b>',
      '',
      `<b>ID:</b> ${escapeHtml(orderId)}`,
      `<b>Xaridor:</b> ${escapeHtml(data.buyerName || "Noma'lum")}`,
      u.username ? `<b>Telegram:</b> @${escapeHtml(u.username)}` : '',
      `<b>Manzil:</b> ${escapeHtml(data.address || '-')}`,
      `<b>To'lov:</b> ${escapeHtml(data.payment || '-')}`,
      data.comment ? `<b>Izoh:</b> ${escapeHtml(data.comment)}` : '',
      '',
      '<b>Tarkib:</b>',
      itemsText,
      '',
      `<b>Jami:</b> ${escapeHtml(money(total))}`,
      `\nTasdiqlash uchun: <code>/tasdiqla ${escapeHtml(orderId)}</code>`,
    ]
      .filter(Boolean)
      .join('\n');

    sendOrderNotifyMessage(adminText).catch((e) => console.error('admin notify:', e.message));
    sendBuyerConfirmMessage(u.id, itemsText, money(total)).catch(() => {});

    sendJson(res, 200, { ok: true, orderId, status: 'pending', total });
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    console.error('createOrder xatosi:', e.message);
    // Faqat foydalanuvchiga mo'ljallangan (validatsiya) xatolarnigina ko'rsatamiz;
    // DB/ichki xatolar umumiy "server error" bilan yashiriladi.
    if (e.userFacing) fail(res, e.message, 400);
    else fail(res, 'server error', 500);
  } finally {
    client.release();
  }
}

// ============ /api/orders GET — foydalanuvchi buyurtmalari (tarix) ============
async function handleGetOrders(req, res, ip) {
  if (rateLimited(`getorders:${ip}`, 60)) return fail(res, 'too many requests', 429);
  // Kimlik imzolangan initData'dan olinadi — mijoz uid'siga ISHONMAYMIZ.
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  const uid = String(u.id);
  try {
    const { rows: orders } = await pool.query(
      `SELECT id, status, created_at FROM orders WHERE tg_user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [uid]
    );
    if (!orders.length) return sendJson(res, 200, []);
    const orderIds = orders.map((o) => o.id);
    const { rows: itemRows } = await pool.query(
      `SELECT order_id, product_id, qty FROM order_items WHERE order_id = ANY($1)`,
      [orderIds]
    );
    const itemsByOrder = new Map();
    for (const it of itemRows) {
      if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, []);
      itemsByOrder.get(it.order_id).push({ id: it.product_id, qty: Number(it.qty) });
    }
    const out = orders.map((o) => ({
      id: o.id,
      date: dateLabel(new Date(o.created_at)),
      statusKey: o.status,
      items: itemsByOrder.get(o.id) || [],
    }));
    sendJson(res, 200, out); // orqaga moslik: yalang'och massiv
  } catch (e) {
    console.error('getOrders xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/telegram-notify — ESKI klientlar uchun (faqat xabar, bazaga yozmaydi) ============
// Yangi klient /api/orders ishlatadi. Bu faqat orqaga moslik uchun qoldirilgan.
async function handleOrderNotify(req, res, ip) {
  if (rateLimited(`notify:${ip}`)) return fail(res, 'too many requests', 429);
  try {
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body);
    const lines = Array.isArray(data.items) ? data.items : [];
    if (!lines.length) throw new Error("items bo'sh");
    const itemsText = lines
      .slice(0, 30)
      .map((it) => `• ${escapeHtml(it.name || '?')} — ${escapeHtml(it.qty ?? '?')} x ${escapeHtml(it.price ?? '?')}`)
      .join('\n');
    const text = [
      '🛒 <b>Yangi buyurtma — LolaMarket</b>',
      '',
      data.orderId ? `<b>ID:</b> ${escapeHtml(data.orderId)}` : '',
      `<b>Xaridor:</b> ${escapeHtml(data.buyerName || "Noma'lum")}`,
      data.tgUser ? `<b>Telegram:</b> @${escapeHtml(data.tgUser)}` : '',
      `<b>Manzil:</b> ${escapeHtml(data.address || '-')}`,
      `<b>To'lov:</b> ${escapeHtml(data.payment || '-')}`,
      data.comment ? `<b>Izoh:</b> ${escapeHtml(data.comment)}` : '',
      '',
      '<b>Tarkib:</b>',
      itemsText,
      '',
      `<b>Jami:</b> ${escapeHtml(data.total || '-')}`,
      data.orderId ? `\nTasdiqlash uchun: <code>/tasdiqla ${escapeHtml(data.orderId)}</code>` : '',
    ]
      .filter(Boolean)
      .join('\n');
    const result = await sendOrderNotifyMessage(text);
    if (data.tgUserId && /^\d+$/.test(String(data.tgUserId))) {
      sendBuyerConfirmMessage(data.tgUserId, itemsText, data.total).catch(() => {});
    }
    sendJson(res, result.status === 200 ? 200 : 502, { ok: result.status === 200 });
  } catch (e) {
    fail(res, e.message, 400);
  }
}

// ============ /api/order-status — holat (bazadan) ============
async function handleOrderStatus(req, res, ip) {
  if (rateLimited(`orderstatus:${ip}`, 60)) return fail(res, 'too many requests', 429);
  let id;
  try {
    id = new URL(req.url, 'http://x').searchParams.get('id');
  } catch (e) {
    id = null;
  }
  if (!id) return fail(res, 'invalid id', 400);
  try {
    const { rows } = await pool.query(`SELECT status FROM orders WHERE id = $1`, [id]);
    sendJson(res, 200, { status: rows.length ? rows[0].status : null });
  } catch (e) {
    console.error('orderStatus xatosi:', e.message);
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

// ============ Telegram webhook ============
async function handleTelegramWebhook(req, res) {
  if (WEBHOOK_SECRET) {
    const got = req.headers['x-telegram-bot-api-secret-token'];
    if (got !== WEBHOOK_SECRET) {
      res.writeHead(401);
      return res.end();
    }
  }
  res.writeHead(200);
  res.end('ok');

  try {
    const body = await readBody(req, 200_000);
    const update = JSON.parse(body);
    const msg = update.message;
    if (!msg || !msg.chat || msg.chat.type !== 'private') return;
    if (rateLimited(`webhook:${msg.chat.id}`, 20)) return;

    if (msg.contact) {
      if (msg.contact.user_id && msg.from && msg.contact.user_id === msg.from.id) {
        saveContact(msg.contact.user_id, msg.contact.phone_number);
      }
      return;
    }

    const text = (msg.text || '').trim();

    if (String(msg.chat.id) === String(ADMIN_CHAT_ID)) {
      const m = text.match(/^\/(tasdiqla|yolga|yetdi)\s+(#?LM-\d+)/i);
      if (m) {
        const cmd = STATUS_COMMANDS[m[1].toLowerCase()];
        const orderId = m[2].startsWith('#') ? m[2] : '#' + m[2];
        try {
          const { rows } = await pool.query(
            `UPDATE orders SET status = $1 WHERE id = $2 RETURNING tg_user_id`,
            [cmd.status, orderId]
          );
          if (!rows.length) {
            await callTelegram('sendMessage', { chat_id: ADMIN_CHAT_ID, text: `❌ ${orderId} topilmadi.` });
          } else if (rows[0].tg_user_id) {
            await callTelegram('sendMessage', {
              chat_id: rows[0].tg_user_id,
              text: cmd.buyerText(orderId),
              parse_mode: 'HTML',
            }).catch(() => {});
            await callTelegram('sendMessage', { chat_id: ADMIN_CHAT_ID, text: cmd.adminOkText(orderId) });
          } else {
            await callTelegram('sendMessage', { chat_id: ADMIN_CHAT_ID, text: `⚠️ ${orderId} holati "${cmd.status}" deb belgilandi, lekin xaridorning Telegram ID'si topilmadi — xabar yuborilmadi.` });
          }
        } catch (e) {
          console.error('status update xatosi:', e.message);
          await callTelegram('sendMessage', { chat_id: ADMIN_CHAT_ID, text: `❌ ${orderId} holatini yangilashda xato.` }).catch(() => {});
        }
        return;
      }

      // ---- Moderatsiya buyruqlari (Dars 11) ----
      if (/^\/moderatsiya\b/i.test(text)) {
        try {
          const { rows } = await pool.query(
            `SELECT id, name_uz, price FROM products WHERE status='pending' ORDER BY created_at DESC LIMIT 20`
          );
          if (!rows.length) {
            await callTelegram('sendMessage', { chat_id: msg.chat.id, text: "✅ Moderatsiya navbati bo'sh — kutayotgan e'lon yo'q." });
          } else {
            const list = rows
              .map((r) => `• <b>${escapeHtml(r.name_uz)}</b> — ${escapeHtml(money(r.price))}\n  <code>/nashr ${escapeHtml(r.id)}</code>   <code>/rad ${escapeHtml(r.id)}</code>`)
              .join('\n\n');
            await callTelegram('sendMessage', { chat_id: msg.chat.id, parse_mode: 'HTML', text: `🗂 <b>Moderatsiya navbati (${rows.length})</b>\n\n${list}` });
          }
        } catch (e) {
          console.error('moderatsiya list xatosi:', e.message);
        }
        return;
      }
      const mod = text.match(/^\/(nashr|rad)\s+(\S+)/i);
      if (mod) {
        const newStatus = mod[1].toLowerCase() === 'nashr' ? 'published' : 'rejected';
        const pid = mod[2];
        try {
          const { rows } = await pool.query(
            `UPDATE products SET status=$1, reviewed_at=now() WHERE id=$2 AND status='pending' RETURNING id, name_uz`,
            [newStatus, pid]
          );
          if (!rows.length) {
            await callTelegram('sendMessage', { chat_id: msg.chat.id, parse_mode: 'HTML', text: `❌ <code>${escapeHtml(pid)}</code> topilmadi yoki allaqachon ko'rib chiqilgan.` });
          } else {
            const label = newStatus === 'published' ? '✅ nashr etildi' : '🚫 rad etildi';
            await callTelegram('sendMessage', { chat_id: msg.chat.id, parse_mode: 'HTML', text: `${label}: <b>${escapeHtml(rows[0].name_uz)}</b>` });
          }
        } catch (e) {
          console.error('moderatsiya action xatosi:', e.message);
        }
        return;
      }
    }

    if (text.startsWith('/start')) {
      await sendOpenAppMessage(
        msg.chat.id,
        "Assalomu alaykum! 🌷 <b>LolaMarket</b> — to'qima materiallar uchun B2B platforma.\n\nQuyidagi tugma orqali katalogni oching:"
      );
    } else {
      await sendOpenAppMessage(msg.chat.id, "Ilovani ochish uchun quyidagi tugmani bosing:");
    }
  } catch (e) {
    console.error('webhook xatosi:', e.message);
  }
}

// ============ ROUTER ============
function cors(res, methods) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-Init-Data');
}

const server = http.createServer((req, res) => {
  const ip = clientIp(req);
  const path = req.url.split('?')[0];

  if (path === '/api/auth/telegram') {
    cors(res, 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return fail(res, 'method not allowed', 405);
    return handleAuthTelegram(req, res, ip);
  }

  if (path === '/api/products') {
    cors(res, 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET') return handleGetProducts(req, res, ip);
    if (req.method === 'POST') return handleSubmitProduct(req, res, ip);
    return fail(res, 'method not allowed', 405);
  }

  if (path === '/api/admin/moderation') {
    cors(res, 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET') return handleModerationList(req, res, ip);
    if (req.method === 'POST') return handleModerationAction(req, res, ip);
    return fail(res, 'method not allowed', 405);
  }

  if (path === '/api/orders') {
    cors(res, 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'POST') return handleCreateOrder(req, res, ip);
    if (req.method === 'GET') return handleGetOrders(req, res, ip);
    return fail(res, 'method not allowed', 405);
  }

  if (path === '/api/telegram-notify') {
    cors(res, 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return fail(res, 'method not allowed', 405);
    return handleOrderNotify(req, res, ip);
  }

  if (path === '/api/order-status') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleOrderStatus(req, res, ip);
  }

  if (path === '/api/telegram-contact') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleGetContact(req, res, ip);
  }

  if (path === '/api/telegram-webhook' && req.method === 'POST') {
    return handleTelegramWebhook(req, res);
  }

  fail(res, 'not found', 404);
});

server.listen(PORT, '127.0.0.1', () => console.log(`lolamarket-notify listening on ${PORT}`));
