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
// admin/index.html panelidagi kirish kaliti — Telegram initData'ga bog'liq emas
// (standalone sahifa uni ishlab chiqara olmaydi), shuning uchun alohida sir.
// Berilmasa — /api/admin/summary doim 401 qaytaradi (panel ishlamaydi, lekin xavfsiz).
const ADMIN_PANEL_TOKEN = process.env.ADMIN_PANEL_TOKEN || '';
// Oldindan to'lov ulushi. Mini App'dagi PREPAY_RATE bilan bir xil bo'lishi shart —
// lekin haqiqiy manba shu yer: summa har doim server tomonda qayta hisoblanadi.
const PREPAY_RATE = Number(process.env.PREPAY_RATE) || 0.5;

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

// Doimiy vaqtli satr taqqoslash (admin panel token uchun — timing attack'dan himoya)
function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
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

function sendBuyerConfirmMessage(chatId, itemsText, total, prepay, rest) {
  const text = [
    '✅ <b>Buyurtmangiz qabul qilindi</b>',
    '',
    '<b>Tarkib:</b>',
    itemsText,
    '',
    `<b>Jami:</b> ${escapeHtml(total || '-')}`,
    prepay ? `<b>To'landi:</b> ${escapeHtml(prepay)}` : '',
    // Xaridor qolgan to'lov shartini oldindan bilishi kerak — BTS to'lovsiz bermaydi
    rest ? `<b>Qolgani:</b> ${escapeHtml(rest)} — mato BTS'ga yetib kelgach to'lanadi` : '',
    '',
    "Ishlab chiqaruvchi tasdiqlaydi — tez orada xabar beramiz.",
  ].filter(Boolean).join('\n');
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
    // Yuboruvchi tasdiqlangan sotuvchi bo'lsa, e'lon o'sha sotuvchiga biriktiriladi —
    // shusiz mahsulot kabinetda ko'rinmaydi va buyurtma unga yetib bormaydi.
    const me = await currentSeller(u);
    const sellerId = me && me.role === 'seller' ? me.seller_id : null;
    await pool.query(
      `INSERT INTO products (id, seller_id, cat_key, price, unit, moq, name_uz, name_ru, comp_uz, status, submitted_by_tg)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10)`,
      [id, sellerId, d.cat_key, d.price, d.unit || 'rulon', d.moq || 1, d.name_uz, d.name_ru, d.comp_uz, String(u.id)]
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

// ============ /api/admin/summary — admin panel statistikasi ============
// admin/index.html (standalone sahifa) uchun. Telegram initData bilan emas —
// ADMIN_PANEL_TOKEN bilan himoyalanadi (X-Admin-Token header). Faqat O'QISH —
// tasdiqlash/rad etish hamon bot buyruqlari orqali (initData'siz sahifa
// harakatlarni ishonchli bajara olmaydi).
async function handleAdminSummary(req, res, ip) {
  if (rateLimited(`adminsummary:${ip}`, 30)) return fail(res, 'too many requests', 429);
  const token = req.headers['x-admin-token'];
  if (!ADMIN_PANEL_TOKEN || !token || !safeEqual(token, ADMIN_PANEL_TOKEN)) {
    return fail(res, 'unauthorized', 401);
  }
  try {
    const [modRes, appRes, sellerRes, todayRes, catRes, ordersRes] = await Promise.all([
      pool.query(`SELECT count(*)::int AS n FROM products WHERE status='pending'`),
      pool.query(`SELECT count(*)::int AS n FROM seller_applications WHERE status='pending' AND step='done'`),
      pool.query(`SELECT count(*)::int AS n FROM sellers WHERE is_verified = true`),
      pool.query(`SELECT count(*)::int AS n FROM orders WHERE created_at >= date_trunc('day', now())`),
      pool.query(`SELECT cat_key, count(*)::int AS n FROM products WHERE status='published' GROUP BY cat_key ORDER BY n DESC`),
      pool.query(`
        SELECT o.id, o.buyer_name, o.status, o.total_amount, o.created_at,
               (SELECT count(*) FROM order_items oi WHERE oi.order_id = o.id)::int AS items_count
          FROM orders o ORDER BY o.created_at DESC LIMIT 20`),
    ]);
    ok(res, {
      moderationPending: modRes.rows[0].n,
      sellerAppsPending: appRes.rows[0].n,
      sellersVerified: sellerRes.rows[0].n,
      ordersToday: todayRes.rows[0].n,
      categories: catRes.rows.map((r) => ({ catKey: r.cat_key, count: r.n })),
      recentOrders: ordersRes.rows.map((r) => ({
        id: r.id,
        buyerName: r.buyer_name,
        status: r.status,
        total: r.total_amount === null ? null : Number(r.total_amount),
        itemsCount: r.items_count,
        date: dateLabel(new Date(r.created_at)),
      })),
    });
  } catch (e) {
    console.error('adminSummary xatosi:', e.message);
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
    // Oldindan to'lov SERVER tomonda hisoblanadi — klient yuborgan `prepay`/`rest`
    // qiymatlariga ishonmaymiz (narx/MOQ kabi). Qolgan qism mato BTS'ga yetib
    // kelgach to'lanadi; to'lanmaguncha BTS mahsulotni bermaydi.
    const prepay = Math.round(total * PREPAY_RATE);
    const rest = total - prepay;

    await client.query('BEGIN');
    const { rows: idRows } = await client.query(`SELECT '#LM-' || nextval('order_seq') AS id`);
    const orderId = idRows[0].id;

    await client.query(
      `INSERT INTO orders (id, buyer_name, tg_user_id, tg_username, address, payment, comment, total_amount, prepay_amount, rest_amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')`,
      [
        orderId,
        data.buyerName || null,
        String(u.id),               // tasdiqlangan Telegram ID (mijozdan emas — imzodan)
        u.username || data.tgUser || null,
        data.address || null,
        data.payment || null,
        data.comment || null,
        total,
        prepay,
        rest,
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
      // Sotuvchi jo'natishdan oldin puli kelganini ko'rishi shart — modelning asosi shu
      `💰 <b>Oldindan to'landi:</b> ${escapeHtml(money(prepay))}`,
      `<b>Qolgani (BTS'da olishda):</b> ${escapeHtml(money(rest))}`,
      `\nTasdiqlash uchun: <code>/tasdiqla ${escapeHtml(orderId)}</code>`,
    ]
      .filter(Boolean)
      .join('\n');

    sendOrderNotifyMessage(adminText).catch((e) => console.error('admin notify:', e.message));
    sendBuyerConfirmMessage(u.id, itemsText, money(total), money(prepay), money(rest)).catch(() => {});

    sendJson(res, 200, { ok: true, orderId, status: 'pending', total, prepay, rest });
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

// ============ SOTUVCHI KABINETI ============
// Rol SERVER tomonda aniqlanadi: imzolangan initData → users.role → sellers.
// Frontend faqat ko'rinishni boshqaradi; har bir sotuvchi endpointi rolni
// mustaqil qayta tekshiradi (tugmani yashirish himoya emas).
async function currentSeller(tgUser) {
  if (!tgUser || !tgUser.id) return null;
  const { rows } = await pool.query(
    `SELECT u.id AS user_id, u.role, s.id AS seller_id, s.business_name_uz, s.business_name_ru, s.is_verified
       FROM users u
       LEFT JOIN sellers s ON s.user_id = u.id
      WHERE u.tg_user_id = $1`,
    [String(tgUser.id)]
  );
  return rows[0] || null;
}

// Sotuvchi endpointlari uchun yagona qorovul: rol 'seller' VA sellers yozuvi bo'lishi shart
async function requireSeller(req, res) {
  const u = authUser(req);
  if (!u || !u.id) { fail(res, 'unauthorized', 401); return null; }
  const me = await currentSeller(u);
  if (!me || me.role !== 'seller' || !me.seller_id) { fail(res, 'sotuvchi emas', 403); return null; }
  return { tg: u, ...me };
}

// ============ /api/me — men kimman (rol + sotuvchi profili) ============
async function handleMe(req, res, ip) {
  if (rateLimited(`me:${ip}`, 60)) return fail(res, 'too many requests', 429);
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  try {
    const me = await currentSeller(u);
    ok(res, {
      role: me ? me.role : 'buyer',
      isAdmin: isAdmin(u),
      seller: me && me.seller_id
        ? { id: me.seller_id, name: { uz: me.business_name_uz, ru: me.business_name_ru || me.business_name_uz }, verified: me.is_verified }
        : null,
    });
  } catch (e) {
    console.error('me xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/seller/products GET — sotuvchining o'z mahsulotlari ============
// Ommaviy katalogdan farqi: bu yerda BARCHA holatlar ko'rinadi
// (pending — moderatsiyada, rejected — rad etilgan, draft — yashirilgan).
async function handleSellerProducts(req, res, ip) {
  if (rateLimited(`sellerprod:${ip}`, 60)) return fail(res, 'too many requests', 429);
  const me = await requireSeller(req, res);
  if (!me) return;
  try {
    const { rows } = await pool.query(
      `SELECT id, name_uz, name_ru, price, unit, moq, cat_key, img, status, reject_reason, created_at
         FROM products WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 200`,
      [me.seller_id]
    );
    ok(res, rows.map((r) => ({
      id: r.id,
      name: { uz: r.name_uz, ru: r.name_ru || r.name_uz },
      price: Number(r.price),
      unit: r.unit,
      moq: Number(r.moq),
      catKey: r.cat_key,
      img: r.img,
      status: r.status,
      rejectReason: r.reject_reason,
    })));
  } catch (e) {
    console.error('sellerProducts xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/seller/product PATCH — tahrirlash / yashirish ============
// Yashirish = status 'draft' (katalogdan chiqadi). Qayta ko'rsatish moderatsiyaga
// qaytadi ('pending') — narx yoki nom o'zgargan bo'lishi mumkin, qayta ko'riladi.
async function handleSellerProductUpdate(req, res, ip) {
  if (rateLimited(`sellerpatch:${ip}`, 30)) return fail(res, 'too many requests', 429);
  const me = await requireSeller(req, res);
  if (!me) return;
  try {
    const data = JSON.parse(await readBody(req, 20_000));
    const id = String(data.id || '').trim();
    if (!id) return fail(res, 'id kerak', 400);

    // Mahsulot shu sotuvchiniki ekanini tasdiqlaymiz (boshqaniki tahrirlanmasin)
    const { rows: own } = await pool.query(
      `SELECT id, status FROM products WHERE id = $1 AND seller_id = $2`,
      [id, me.seller_id]
    );
    if (!own.length) return fail(res, 'mahsulot topilmadi', 404);

    if (data.action === 'hide') {
      const { rows } = await pool.query(
        `UPDATE products SET status = 'draft' WHERE id = $1 RETURNING id, status`, [id]);
      return ok(res, rows[0]);
    }
    if (data.action === 'show') {
      const { rows } = await pool.query(
        `UPDATE products SET status = 'pending' WHERE id = $1 RETURNING id, status`, [id]);
      return ok(res, rows[0]);
    }

    // Tahrirlash — o'zgargan e'lon qayta moderatsiyaga tushadi
    const v = validate(data, {
      name_uz: { type: 'string', required: true, min: 2, max: 200 },
      name_ru: { type: 'string', required: false, max: 200 },
      price:   { type: 'int', required: true, min: 1, max: 100000000000 },
      moq:     { type: 'int', required: false, min: 1, max: 100000, default: 1 },
      comp_uz: { type: 'string', required: false, max: 500 },
    });
    if (!v.ok) return fail(res, v.error, 400);
    const d = v.data;
    const { rows } = await pool.query(
      `UPDATE products SET name_uz=$1, name_ru=$2, price=$3, moq=$4, comp_uz=$5,
              status='pending', reject_reason=NULL
         WHERE id=$6 RETURNING id, status`,
      [d.name_uz, d.name_ru || null, d.price, d.moq, d.comp_uz || null, id]
    );
    ok(res, rows[0]);
  } catch (e) {
    console.error('sellerProductUpdate xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/seller/orders GET — sotuvchiga kelgan buyurtmalar ============
// Buyurtma bir nechta sotuvchining mahsulotini o'z ichiga olishi mumkin —
// shuning uchun faqat SHU sotuvchining qatorlari va ular bo'yicha summa qaytadi.
async function handleSellerOrders(req, res, ip) {
  if (rateLimited(`sellerorders:${ip}`, 60)) return fail(res, 'too many requests', 429);
  const me = await requireSeller(req, res);
  if (!me) return;
  try {
    const { rows } = await pool.query(
      `SELECT o.id, o.status, o.created_at, o.buyer_name, o.address, o.comment,
              o.total_amount, o.prepay_amount, o.rest_amount, o.tracking_code,
              oi.product_id, oi.name AS item_name, oi.qty, oi.unit_price
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
        WHERE p.seller_id = $1
        ORDER BY o.created_at DESC
        LIMIT 300`,
      [me.seller_id]
    );
    const byOrder = new Map();
    for (const r of rows) {
      if (!byOrder.has(r.id)) {
        byOrder.set(r.id, {
          id: r.id,
          statusKey: r.status,
          date: dateLabel(new Date(r.created_at)),
          createdAt: r.created_at,
          buyerName: r.buyer_name,
          address: r.address,
          comment: r.comment,
          tracking: r.tracking_code,
          // Butun buyurtma summasi (barcha sotuvchilar bo'yicha) — ma'lumot uchun
          orderTotal: r.total_amount === null ? null : Number(r.total_amount),
          prepay: r.prepay_amount === null ? null : Number(r.prepay_amount),
          rest: r.rest_amount === null ? null : Number(r.rest_amount),
          items: [],
          sellerTotal: 0,   // faqat shu sotuvchining qatorlari yig'indisi
        });
      }
      const o = byOrder.get(r.id);
      const line = Number(r.unit_price) * Number(r.qty);
      o.items.push({ id: r.product_id, name: r.item_name, qty: Number(r.qty), unitPrice: Number(r.unit_price) });
      o.sellerTotal += line;
    }
    ok(res, [...byOrder.values()]);
  } catch (e) {
    console.error('sellerOrders xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/seller/order POST — qabul / rad etish / jo'natish ============
const SELLER_ORDER_ACTIONS = {
  accept: {
    from: ['pending'], to: 'confirmed',
    buyerText: (id) => `✅ <b>Buyurtmangiz tasdiqlandi!</b>\n\nBuyurtma: <code>${escapeHtml(id)}</code>\nIshlab chiqaruvchi qabul qildi — tez orada jo'natiladi.`,
  },
  reject: {
    from: ['pending'], to: 'cancelled',
    buyerText: (id) => `❌ <b>Buyurtma bekor qilindi</b>\n\nBuyurtma: <code>${escapeHtml(id)}</code>\nIshlab chiqaruvchi qabul qila olmadi. Oldindan to'lov qaytariladi — savdo bo'limi bog'lanadi.`,
  },
  ship: {
    from: ['confirmed'], to: 'shipped',
    buyerText: (id, tracking) =>
      `🚚 <b>Buyurtmangiz yo'lga chiqdi</b>\n\nBuyurtma: <code>${escapeHtml(id)}</code>` +
      (tracking ? `\nBTS trek: <code>${escapeHtml(tracking)}</code>` : '') +
      `\n\nBTS'ga yetib kelgach qolgan to'lovni amalga oshirasiz.`,
  },
};

async function handleSellerOrderAction(req, res, ip) {
  if (rateLimited(`sellerorderact:${ip}`, 30)) return fail(res, 'too many requests', 429);
  const me = await requireSeller(req, res);
  if (!me) return;
  try {
    const data = JSON.parse(await readBody(req, 20_000));
    const orderId = String(data.orderId || '').trim();
    const cmd = SELLER_ORDER_ACTIONS[data.action];
    if (!orderId || !cmd) return fail(res, "noto'g'ri so'rov", 400);

    const tracking = cmd.to === 'shipped' ? String(data.tracking || '').trim().slice(0, 60) : null;
    if (cmd.to === 'shipped' && !tracking) return fail(res, 'BTS trek raqamini kiriting', 400);

    // Buyurtma shu sotuvchining mahsulotini o'z ichiga oladimi? (begona buyurtma boshqarilmasin)
    const { rows: mine } = await pool.query(
      `SELECT 1 FROM order_items oi JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1 AND p.seller_id = $2 LIMIT 1`,
      [orderId, me.seller_id]
    );
    if (!mine.length) return fail(res, 'buyurtma topilmadi', 404);

    const { rows } = await pool.query(
      `UPDATE orders SET status = $1, tracking_code = COALESCE($2, tracking_code)
        WHERE id = $3 AND status = ANY($4)
        RETURNING id, status, tg_user_id`,
      [cmd.to, tracking, orderId, cmd.from]
    );
    if (!rows.length) return fail(res, "buyurtma holati mos emas (allaqachon o'zgargan)", 409);

    const row = rows[0];
    if (row.tg_user_id) {
      callTelegram('sendMessage', {
        chat_id: row.tg_user_id,
        text: cmd.buyerText(orderId, tracking),
        parse_mode: 'HTML',
      }).catch(() => {});
    }
    if (ADMIN_CHAT_ID) {
      callTelegram('sendMessage', {
        chat_id: ADMIN_CHAT_ID,
        text: `ℹ️ ${escapeHtml(orderId)} — sotuvchi (${escapeHtml(me.business_name_uz || '?')}) holatni "${escapeHtml(row.status)}" ga o'zgartirdi.`,
        parse_mode: 'HTML',
      }).catch(() => {});
    }
    ok(res, { id: row.id, status: row.status });
  } catch (e) {
    console.error('sellerOrderAction xatosi:', e.message);
    fail(res, 'server error', 500);
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
      `SELECT id, status, created_at, total_amount, prepay_amount, rest_amount
         FROM orders WHERE tg_user_id = $1 ORDER BY created_at DESC LIMIT 50`,
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
      total: o.total_amount === null ? null : Number(o.total_amount),
      // Eski buyurtmalarda (migratsiyagacha) bu ustunlar bo'sh — null qaytadi
      prepay: o.prepay_amount === null ? null : Number(o.prepay_amount),
      rest: o.rest_amount === null ? null : Number(o.rest_amount),
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

// ============ SOTUVCHI ARIZASI (bot suhbati, Sprint 0) ============
// PRD §9 chegarasi: o'z-o'zini ro'yxatdan o'tkazish yo'q — founder qo'lda
// tasdiqlaydi. Ariza bosqichlari seller_applications.step ustunida saqlanadi
// (in-memory emas), shu sabab server qayta ishga tushsa ham suhbat davom etadi.
const SELLER_APP_QUESTIONS = {
  city: "Qaysi shaharda joylashgansiz?",
  product_type: 'Qanday turdagi mato yoki mahsulot ishlab chiqarasiz? (masalan: ikat, atlas, shoyi)',
};

async function getOpenSellerApplication(tgUserId) {
  const { rows } = await pool.query(
    `SELECT id, step FROM seller_applications
      WHERE tg_user_id = $1 AND status = 'pending' AND step != 'done'
      ORDER BY created_at DESC LIMIT 1`,
    [String(tgUserId)]
  );
  return rows[0] || null;
}

async function startSellerApplication(msg) {
  const existing = await getOpenSellerApplication(msg.from.id);
  if (existing) {
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: 'Sizda allaqachon ochiq ariza bor — javob berishda davom eting.',
    });
    return;
  }
  await pool.query(
    `INSERT INTO seller_applications (tg_user_id, tg_username, step) VALUES ($1, $2, 'business_name')`,
    [String(msg.from.id), msg.from.username || null]
  );
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    text: "🌷 LolaMarket sotuvchisi bo'lish uchun 4 ta savolga javob bering.\n\n1) Korxona nomi qanday?",
  });
}

// Ochiq arizasi bor foydalanuvchining oddiy matn xabarini navbatdagi javob
// sifatida qabul qiladi. Ariza yo'q bo'lsa false qaytadi (chaqiruvchi odatdagi
// buyruq/ /start yo'liga o'tadi).
async function handleSellerApplicationStep(msg, text) {
  const app = await getOpenSellerApplication(msg.from.id);
  if (!app) return false;

  if (app.step === 'business_name') {
    if (!text) {
      await callTelegram('sendMessage', { chat_id: msg.chat.id, text: "Iltimos, korxona nomini matn ko'rinishida yuboring." });
      return true;
    }
    await pool.query(`UPDATE seller_applications SET business_name=$1, step='city' WHERE id=$2`, [text.slice(0, 200), app.id]);
    await callTelegram('sendMessage', { chat_id: msg.chat.id, text: `2) ${SELLER_APP_QUESTIONS.city}` });
    return true;
  }
  if (app.step === 'city') {
    if (!text) {
      await callTelegram('sendMessage', { chat_id: msg.chat.id, text: 'Iltimos, shahar nomini yuboring.' });
      return true;
    }
    await pool.query(`UPDATE seller_applications SET city=$1, step='product_type' WHERE id=$2`, [text.slice(0, 120), app.id]);
    await callTelegram('sendMessage', { chat_id: msg.chat.id, text: `3) ${SELLER_APP_QUESTIONS.product_type}` });
    return true;
  }
  if (app.step === 'product_type') {
    if (!text) {
      await callTelegram('sendMessage', { chat_id: msg.chat.id, text: 'Iltimos, mahsulot turini yuboring.' });
      return true;
    }
    await pool.query(`UPDATE seller_applications SET product_type=$1, step='phone' WHERE id=$2`, [text.slice(0, 200), app.id]);
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: '4) Telefon raqamingizni pastdagi tugma orqali yuboring:',
      reply_markup: {
        keyboard: [[{ text: '📱 Telefon raqamni yuborish', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    return true;
  }
  // step === 'phone' — faqat contact xabari qabul qilinadi, matn emas
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    text: 'Iltimos, telefon raqamingizni yuqoridagi tugma orqali yuboring.',
  });
  return true;
}

// Telefon (contact) xabari kelganda arizani yakunlaydi va adminga xabar beradi.
async function handleSellerApplicationContact(msg) {
  const app = await getOpenSellerApplication(msg.from.id);
  if (!app || app.step !== 'phone') return;
  const { rows } = await pool.query(
    `UPDATE seller_applications SET phone=$1, step='done' WHERE id=$2
     RETURNING id, business_name, city, product_type, phone, tg_username`,
    [msg.contact.phone_number, app.id]
  );
  if (!rows.length) return;
  const a = rows[0];
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    text: "✅ Arizangiz qabul qilindi! Founder tez orada ko'rib chiqadi — natija shu yerga xabar bilan keladi.",
    reply_markup: { remove_keyboard: true },
  });
  const summary = [
    '🆕 <b>Yangi sotuvchi arizasi</b>',
    '',
    `<b>Korxona:</b> ${escapeHtml(a.business_name || '-')}`,
    `<b>Shahar:</b> ${escapeHtml(a.city || '-')}`,
    `<b>Mahsulot turi:</b> ${escapeHtml(a.product_type || '-')}`,
    `<b>Telefon:</b> ${escapeHtml(a.phone || '-')}`,
    a.tg_username ? `<b>Telegram:</b> @${escapeHtml(a.tg_username)}` : '',
    '',
    `<code>/sotuvchi_tasdiqla ${a.id}</code>   <code>/sotuvchi_rad ${a.id}</code>`,
  ]
    .filter(Boolean)
    .join('\n');
  await sendOrderNotifyMessage(summary).catch((e) => console.error('sellerApp admin notify:', e.message));
}

// Admin /sotuvchi_tasdiqla yoki /sotuvchi_rad buyrug'ini bajaradi.
async function handleSellerApplicationReview(chatId, action, appId) {
  const { rows } = await pool.query(
    `SELECT id, tg_user_id, tg_username, business_name, city FROM seller_applications
      WHERE id = $1 AND status = 'pending' AND step = 'done'`,
    [appId]
  );
  if (!rows.length) {
    await callTelegram('sendMessage', { chat_id: chatId, text: `❌ #${appId} ariza topilmadi yoki allaqachon ko'rib chiqilgan.` });
    return;
  }
  const app = rows[0];

  if (action === 'reject') {
    await pool.query(`UPDATE seller_applications SET status='rejected', reviewed_at=now() WHERE id=$1`, [app.id]);
    await callTelegram('sendMessage', { chat_id: chatId, text: `🚫 #${app.id} ariza rad etildi.` });
    await callTelegram('sendMessage', {
      chat_id: app.tg_user_id,
      text: "Afsuski, arizangiz hozircha tasdiqlanmadi. Savollar bo'lsa botga yozing.",
    }).catch(() => {});
    return;
  }

  // approve — foydalanuvchi hali /api/auth/telegram chaqirmagan bo'lishi mumkin
  // (Mini App'ni ochmagan), shuning uchun users'ga ham upsert qilamiz.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: userRows } = await client.query(
      `INSERT INTO users (tg_user_id, full_name, role)
         VALUES ($1, $2, 'seller')
         ON CONFLICT (tg_user_id) DO UPDATE SET role = 'seller'
         RETURNING id`,
      [String(app.tg_user_id), app.business_name || app.tg_username || null]
    );
    const userId = userRows[0].id;

    const { rows: existingSeller } = await client.query(`SELECT id FROM sellers WHERE user_id = $1`, [userId]);
    if (existingSeller.length) {
      await client.query(
        `UPDATE sellers SET business_name_uz=$1, city_uz=$2, is_verified=true WHERE id=$3`,
        [app.business_name, app.city, existingSeller[0].id]
      );
    } else {
      await client.query(
        `INSERT INTO sellers (user_id, business_name_uz, city_uz, is_verified) VALUES ($1,$2,$3,true)`,
        [userId, app.business_name, app.city]
      );
    }
    await client.query(`UPDATE seller_applications SET status='approved', reviewed_at=now() WHERE id=$1`, [app.id]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('sellerApp approve xatosi:', e.message);
    await callTelegram('sendMessage', { chat_id: chatId, text: `❌ #${app.id} tasdiqlashda xato yuz berdi.` });
    return;
  } finally {
    client.release();
  }

  await callTelegram('sendMessage', { chat_id: chatId, text: `✅ #${app.id} — ${app.business_name || '?'} sotuvchi sifatida tasdiqlandi.` });
  await sendOpenAppMessage(
    app.tg_user_id,
    "🎉 <b>Tabriklaymiz!</b> Siz LolaMarket sotuvchisi sifatida tasdiqlandingiz.\n\nQuyidagi tugma orqali kabinetingizni oching:"
  ).catch(() => {});
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
        await handleSellerApplicationContact(msg).catch((e) => console.error('sellerApp contact xatosi:', e.message));
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

      // ---- Sotuvchi arizalari (Sprint 0) ----
      if (/^\/sotuvchilar\b/i.test(text)) {
        try {
          const { rows } = await pool.query(
            `SELECT id, business_name, city FROM seller_applications
              WHERE status='pending' AND step='done' ORDER BY created_at DESC LIMIT 20`
          );
          if (!rows.length) {
            await callTelegram('sendMessage', { chat_id: msg.chat.id, text: "✅ Ko'rib chiqilmagan sotuvchi arizasi yo'q." });
          } else {
            const list = rows
              .map((r) => `• <b>${escapeHtml(r.business_name || '?')}</b> — ${escapeHtml(r.city || '?')}\n  <code>/sotuvchi_tasdiqla ${r.id}</code>   <code>/sotuvchi_rad ${r.id}</code>`)
              .join('\n\n');
            await callTelegram('sendMessage', { chat_id: msg.chat.id, parse_mode: 'HTML', text: `🗂 <b>Sotuvchi arizalari (${rows.length})</b>\n\n${list}` });
          }
        } catch (e) {
          console.error('sotuvchilar list xatosi:', e.message);
        }
        return;
      }
      const sellerAppCmd = text.match(/^\/(sotuvchi_tasdiqla|sotuvchi_rad)\s+(\d+)/i);
      if (sellerAppCmd) {
        const action = sellerAppCmd[1].toLowerCase() === 'sotuvchi_tasdiqla' ? 'approve' : 'reject';
        await handleSellerApplicationReview(msg.chat.id, action, parseInt(sellerAppCmd[2], 10)).catch((e) => {
          console.error('sellerApp review xatosi:', e.message);
        });
        return;
      }
    }

    // ---- Ochiq sotuvchi arizasi bo'lsa — matn navbatdagi javob sifatida qabul qilinadi ----
    if (await handleSellerApplicationStep(msg, text).catch((e) => {
      console.error('sellerApp step xatosi:', e.message);
      return false;
    })) return;

    if (/^\/sotuvchi\b/i.test(text)) {
      await startSellerApplication(msg).catch((e) => console.error('sellerApp start xatosi:', e.message));
      return;
    }

    if (text.startsWith('/start')) {
      await sendOpenAppMessage(
        msg.chat.id,
        "Assalomu alaykum! 🌷 <b>LolaMarket</b> — to'qima materiallar uchun B2B platforma.\n\nQuyidagi tugma orqali katalogni oching. Ishlab chiqaruvchi bo'lsangiz — /sotuvchi buyrug'ini yuboring."
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-Init-Data, X-Admin-Token');
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

  if (path === '/api/admin/summary') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleAdminSummary(req, res, ip);
  }

  if (path === '/api/orders') {
    cors(res, 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'POST') return handleCreateOrder(req, res, ip);
    if (req.method === 'GET') return handleGetOrders(req, res, ip);
    return fail(res, 'method not allowed', 405);
  }

  // ===== Sotuvchi kabineti =====
  if (path === '/api/me') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleMe(req, res, ip);
  }

  if (path === '/api/seller/products') {
    cors(res, 'GET, PATCH, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET') return handleSellerProducts(req, res, ip);
    if (req.method === 'PATCH') return handleSellerProductUpdate(req, res, ip);
    return fail(res, 'method not allowed', 405);
  }

  if (path === '/api/seller/orders') {
    cors(res, 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET') return handleSellerOrders(req, res, ip);
    if (req.method === 'POST') return handleSellerOrderAction(req, res, ip);
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
