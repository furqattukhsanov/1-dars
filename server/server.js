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
// Saytdagi "Telegram orqali kirish" tugmasi shu botga deep-link yasaydi.
const BOT_USERNAME = (process.env.BOT_USERNAME || 'lolamarketbot').replace(/^@/, '');
const CONTACTS_FILE = __dirname + '/contacts.json';
// admin/index.html panelidagi kirish kaliti — Telegram initData'ga bog'liq emas
// (standalone sahifa uni ishlab chiqara olmaydi), shuning uchun alohida sir.
// Berilmasa — /api/admin/summary doim 401 qaytaradi (panel ishlamaydi, lekin xavfsiz).
const ADMIN_PANEL_TOKEN = process.env.ADMIN_PANEL_TOKEN || '';
// Oldindan to'lov ulushi. Mini App'dagi PREPAY_RATE bilan bir xil bo'lishi shart —
// lekin haqiqiy manba shu yer: summa har doim server tomonda qayta hisoblanadi.
const PREPAY_RATE = Number(process.env.PREPAY_RATE) || 0.5;
// Platforma komissiyasi. Butun platformaga BITTA stavka (2026-07-27 founder
// qarori) — sotuvchi bo'yicha alohida stavka emas. Buyurtma yaratilganda
// o'sha paytdagi qiymat orders.commission_rate ga snapshot qilinadi, shuning
// uchun stavka keyin o'zgarsa eski buyurtmalar hisoboti buzilmaydi.
// PRD §4 diapazoni 10–12% — default 10%.
const COMMISSION_RATE = (() => {
  const v = Number(process.env.COMMISSION_RATE);
  return Number.isFinite(v) && v >= 0 && v < 1 ? v : 0.10;
})();

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

// ============ SAYTDA TELEGRAM ORQALI KIRISH (deep-link + cookie sessiya) ============
// Sayt xaridorida imzolangan initData yo'q (u Mini App ichida emas), shuning
// uchun kimlik shu yo'l bilan olinadi:
//   1) brauzer /api/auth/web/start — server `code` va `verifier` yasaydi;
//   2) brauzer `t.me/<bot>?start=web_<code>` ni ochadi;
//   3) foydalanuvchi botda "Boshlash" bosadi — Telegram webhook'ga ID'ni O'ZI
//      yuboradi, ya'ni ID brauzerdan kelmaydi va soxtalashtirib bo'lmaydi;
//   4) brauzer code+verifier bilan so'raydi va HttpOnly cookie sessiya oladi.
const WEB_LOGIN_TTL_MS = 10 * 60 * 1000;      // kod 10 daqiqa yashaydi
const WEB_SESSION_TTL_DAYS = 30;
const SESSION_COOKIE = 'lm_session';

function sha256(s) {
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

function randHex(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

// Sessiya tokeni faqat HttpOnly cookie'da yuradi — sahifadagi JS uni o'qiy
// olmaydi, shuning uchun XSS bo'lsa ham token o'g'irlanmaydi (admin panel
// tokenidan farqi shu: u sessionStorage'da yashaydi).
function setSessionCookie(res, token) {
  const maxAge = WEB_SESSION_TTL_DAYS * 24 * 60 * 60;
  res.setHeader('Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

// Cookie'dagi tokendan foydalanuvchini qaytaradi (yoki null).
// Har bir himoyalangan endpoint shu orqali "bu kim" ekanini biladi.
async function webSessionUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token || !/^[0-9a-f]{32,128}$/.test(token)) return null;
  const { rows } = await pool.query(
    `UPDATE web_sessions s SET last_seen_at = now()
      WHERE s.token_hash = $1 AND s.expires_at > now()
      RETURNING s.user_id, s.tg_user_id`,
    [sha256(token)]
  );
  if (!rows.length) return null;
  const { rows: u } = await pool.query(
    `SELECT id, full_name, phone, role, tg_user_id, tg_username FROM users WHERE id = $1`,
    [rows[0].user_id]
  );
  if (!u.length) return null;
  return {
    id: u[0].id,
    tgUserId: String(u[0].tg_user_id || rows[0].tg_user_id),
    name: u[0].full_name,
    phone: u[0].phone,
    username: u[0].tg_username,
    role: u[0].role,
  };
}

function publicUser(u) {
  return u && { name: u.name, username: u.username, phone: u.phone, role: u.role };
}

// ---- POST /api/auth/web/start — kod yaratish ----
async function handleWebLoginStart(req, res, ip) {
  if (rateLimited(`weblogin:${ip}`, 10)) return fail(res, 'too many requests', 429);
  try {
    const code = randHex(12);      // deep-link'da ko'rinadi
    const verifier = randHex(24);  // faqat brauzerda qoladi
    await pool.query(
      `INSERT INTO web_login_codes (code, verifier_hash, expires_at)
       VALUES ($1, $2, now() + ($3 || ' milliseconds')::interval)`,
      [code, sha256(verifier), String(WEB_LOGIN_TTL_MS)]
    );
    // Eskirgan kodlarni shu yerda tozalaymiz — alohida cron kerak emas
    pool.query(`DELETE FROM web_login_codes WHERE expires_at < now() - interval '1 day'`)
      .catch(() => {});
    sendJson(res, 200, {
      ok: true,
      code,
      verifier,
      url: `https://t.me/${BOT_USERNAME}?start=web_${code}`,
      expiresIn: Math.floor(WEB_LOGIN_TTL_MS / 1000),
    });
  } catch (e) {
    console.error('webLoginStart xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- GET /api/auth/web/poll?code=..&verifier=.. — kodni sessiyaga almashtirish ----
// Brauzer botda tasdiqlanishini shu endpoint orqali kutadi.
async function handleWebLoginPoll(req, res, ip) {
  if (rateLimited(`weblogin:poll:${ip}`, 120)) return fail(res, 'too many requests', 429);
  let code, verifier;
  try {
    const q = new URL(req.url, 'http://x').searchParams;
    code = q.get('code');
    verifier = q.get('verifier');
  } catch (e) { /* pastda tekshiriladi */ }
  if (!code || !verifier) return fail(res, 'invalid code', 400);

  try {
    const { rows } = await pool.query(
      `SELECT code, verifier_hash, status, user_id, expires_at < now() AS expired
         FROM web_login_codes WHERE code = $1`,
      [code]
    );
    // Kod topilmasa ham "expired" deymiz — mavjud kodlarni taxmin qilib
    // bo'lmasin uchun javob bir xil bo'ladi.
    if (!rows.length) return sendJson(res, 200, { ok: true, status: 'expired' });
    const row = rows[0];
    if (!safeEqual(row.verifier_hash, sha256(verifier))) return fail(res, 'invalid code', 403);
    if (row.status === 'used') return sendJson(res, 200, { ok: true, status: 'expired' });
    if (row.expired) return sendJson(res, 200, { ok: true, status: 'expired' });
    if (row.status !== 'confirmed') return sendJson(res, 200, { ok: true, status: 'pending' });

    // Tasdiqlangan — kod bir marta ishlaydi, keyin sessiyaga aylanadi
    const upd = await pool.query(
      `UPDATE web_login_codes SET status='used' WHERE code=$1 AND status='confirmed' RETURNING user_id, tg_user_id`,
      [code]
    );
    if (!upd.rows.length) return sendJson(res, 200, { ok: true, status: 'expired' });

    const token = randHex(32);
    await pool.query(
      `INSERT INTO web_sessions (token_hash, user_id, tg_user_id, expires_at)
       VALUES ($1, $2, $3, now() + ($4 || ' days')::interval)`,
      [sha256(token), upd.rows[0].user_id, String(upd.rows[0].tg_user_id), String(WEB_SESSION_TTL_DAYS)]
    );
    const { rows: u } = await pool.query(
      `SELECT full_name, phone, role, tg_username FROM users WHERE id = $1`,
      [upd.rows[0].user_id]
    );
    setSessionCookie(res, token);
    sendJson(res, 200, {
      ok: true,
      status: 'confirmed',
      user: u.length
        ? { name: u[0].full_name, username: u[0].tg_username, phone: u[0].phone, role: u[0].role }
        : null,
    });
  } catch (e) {
    console.error('webLoginPoll xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- GET /api/auth/web/me — sahifa ochilganda sessiyani tiklash ----
async function handleWebMe(req, res, ip) {
  if (rateLimited(`webme:${ip}`, 60)) return fail(res, 'too many requests', 429);
  try {
    const u = await webSessionUser(req);
    sendJson(res, 200, { ok: true, user: publicUser(u) || null });
  } catch (e) {
    console.error('webMe xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- POST /api/auth/web/logout ----
async function handleWebLogout(req, res, ip) {
  if (rateLimited(`weblogout:${ip}`, 30)) return fail(res, 'too many requests', 429);
  try {
    const token = parseCookies(req)[SESSION_COOKIE];
    if (token) await pool.query(`DELETE FROM web_sessions WHERE token_hash = $1`, [sha256(token)]);
  } catch (e) {
    console.error('webLogout xatosi:', e.message);
  }
  clearSessionCookie(res);
  sendJson(res, 200, { ok: true });
}

// ---- GET /api/web/orders — profildagi "Mening buyurtmalarim" ----
async function handleWebMyOrders(req, res, ip) {
  if (rateLimited(`weborders:${ip}`, 60)) return fail(res, 'too many requests', 429);
  try {
    const u = await webSessionUser(req);
    if (!u) return fail(res, 'unauthorized', 401);
    const { rows } = await pool.query(
      `SELECT id, status, created_at, total_amount FROM orders
        WHERE tg_user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [u.tgUserId]
    );
    sendJson(res, 200, {
      ok: true,
      orders: rows.map((o) => ({
        id: o.id,
        status: o.status,
        date: dateLabel(new Date(o.created_at)).uz,
        total: o.total_amount === null ? null : Number(o.total_amount),
      })),
    });
  } catch (e) {
    console.error('webMyOrders xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- Botda "Boshlash" bosilganda (webhook) — kodni tasdiqlash ----
// Telegram ID shu yerda keladi: uni klient emas, Telegram yuboradi.
async function confirmWebLoginCode(msg, code) {
  const { rows: found } = await pool.query(
    `SELECT code FROM web_login_codes WHERE code = $1 AND status = 'pending' AND expires_at > now()`,
    [code]
  );
  if (!found.length) {
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: "⌛️ Kirish kodi eskirgan yoki allaqachon ishlatilgan.\n\nSaytda \"Kirish\" tugmasini qaytadan bosing.",
    });
    return;
  }

  const fullName =
    [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || msg.from.username || null;
  const { rows: users } = await pool.query(
    `INSERT INTO users (tg_user_id, full_name, tg_username, role)
     VALUES ($1, $2, $3, 'buyer')
     ON CONFLICT (tg_user_id) DO UPDATE
       SET full_name   = COALESCE(EXCLUDED.full_name, users.full_name),
           tg_username = COALESCE(EXCLUDED.tg_username, users.tg_username)
     RETURNING id, phone`,
    [String(msg.from.id), fullName, msg.from.username || null]
  );
  const user = users[0];

  const { rows: upd } = await pool.query(
    `UPDATE web_login_codes
        SET status='confirmed', tg_user_id=$1, user_id=$2, confirmed_at=now()
      WHERE code=$3 AND status='pending' AND expires_at > now()
      RETURNING code`,
    [String(msg.from.id), user.id, code]
  );
  if (!upd.length) return; // oradan o'tib ketgan — jim o'tamiz

  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    parse_mode: 'HTML',
    text: `✅ <b>Saytga kirdingiz</b>\n\nlolamarket.uz sahifasiga qayting — profilingiz ochiladi.\nBuyurtma bersangiz, holati haqidagi xabar shu yerga keladi.`,
  });

  // Telefon hali yo'q bo'lsa — bir marta so'raymiz. Bo'lsa, checkout formasi
  // avtomatik to'ladi va xaridor uni qayta yozmaydi.
  if (!user.phone) {
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: "📱 Buyurtmani tezroq rasmiylashtirish uchun telefon raqamingizni bir marta yuboring — keyingi safar forma o'zi to'ladi.",
      reply_markup: {
        keyboard: [[{ text: '📱 Telefon raqamni yuborish', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
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

// ============ ADMIN PANEL RUXSATI ============
// admin/index.html (standalone sahifa) Telegram initData ishlab chiqara olmaydi,
// shuning uchun alohida sir — ADMIN_PANEL_TOKEN (X-Admin-Token header).
// O'QISH shu token bilan yetarli. YOZUV amallari qo'shimcha ravishda Telegram'da
// tasdiqlanadi (handleAdminAction) — token o'g'irlansa ham pul o'tkazilmaydi.
function adminPanelAuth(req, res) {
  const token = req.headers['x-admin-token'];
  if (!ADMIN_PANEL_TOKEN || !token || !safeEqual(token, ADMIN_PANEL_TOKEN)) {
    fail(res, 'unauthorized', 401);
    return false;
  }
  return true;
}

// ============ /api/admin/summary — admin panel statistikasi ============
// Savdo hajmi (GMV) hisobida bekor qilingan va qaytarilgan buyurtmalar
// hisobga olinmaydi — quyidagi so'rovlarda `status NOT IN ('cancelled','refunded')`.
// Ro'yxat ATAYLAB to'g'ridan-to'g'ri yozilgan, parametr sifatida emas:
// `status <> ALL($1)` da Postgres massiv parametrining tipini aniqlay olmay
// xato berishi mumkin.
async function handleAdminSummary(req, res, ip) {
  if (rateLimited(`adminsummary:${ip}`, 30)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;
  try {
    const [
      modRes, appRes, sellerRes, todayRes, catRes, ordersRes,
      dailyRes, monthlyRes, totalsRes, topSellersRes,
      appListRes, sellerListRes, modListRes, disputeRes,
    ] = await Promise.all([
      pool.query(`SELECT count(*)::int AS n FROM products WHERE status='pending'`),
      pool.query(`SELECT count(*)::int AS n FROM seller_applications WHERE status='pending' AND step='done'`),
      pool.query(`SELECT count(*)::int AS n FROM sellers WHERE is_verified = true`),
      pool.query(`SELECT count(*)::int AS n FROM orders WHERE created_at >= date_trunc('day', now())`),
      pool.query(`SELECT cat_key, count(*)::int AS n FROM products WHERE status='published' GROUP BY cat_key ORDER BY n DESC`),
      pool.query(`
        SELECT o.id, o.buyer_name, o.buyer_phone, o.source, o.status,
               o.total_amount, o.commission_amount,
               o.payout_amount, o.prepay_amount, o.created_at, o.paid_out_at,
               (SELECT count(*) FROM order_items oi WHERE oi.order_id = o.id)::int AS items_count,
               EXISTS (SELECT 1 FROM disputes d WHERE d.order_id = o.id AND d.status='open') AS has_dispute
          FROM orders o ORDER BY o.created_at DESC LIMIT 100`),

      // ---- Kunlik GMV (30 kun). generate_series bo'sh kunlarni ham qatorga
      // qo'shadi — aks holda grafik savdosiz kunlarni butunlay tashlab ketardi.
      pool.query(`
        SELECT d::date AS day,
               COALESCE(SUM(o.total_amount), 0)::bigint      AS gmv,
               COALESCE(SUM(o.commission_amount), 0)::bigint AS commission,
               COUNT(o.id)::int                              AS orders
          FROM generate_series(date_trunc('day', now()) - interval '29 days',
                               date_trunc('day', now()), interval '1 day') d
          LEFT JOIN orders o
                 ON o.created_at >= d AND o.created_at < d + interval '1 day'
                AND o.status NOT IN ('cancelled','refunded')
         GROUP BY d ORDER BY d`),

      // ---- Oylik GMV (12 oy) — Reja/Fakt sahifasi uchun
      pool.query(`
        SELECT m::date AS month,
               COALESCE(SUM(o.total_amount), 0)::bigint      AS gmv,
               COALESCE(SUM(o.commission_amount), 0)::bigint AS commission,
               COUNT(o.id)::int                              AS orders
          FROM generate_series(date_trunc('month', now()) - interval '11 months',
                               date_trunc('month', now()), interval '1 month') m
          LEFT JOIN orders o
                 ON o.created_at >= m AND o.created_at < m + interval '1 month'
                AND o.status NOT IN ('cancelled','refunded')
         GROUP BY m ORDER BY m`),

      pool.query(`
        SELECT COUNT(*)::int                                   AS orders_total,
               COALESCE(SUM(total_amount), 0)::bigint          AS gmv_total,
               COALESCE(SUM(commission_amount), 0)::bigint     AS commission_total,
               COUNT(*) FILTER (WHERE status='completed')::int AS completed,
               COALESCE(SUM(payout_amount) FILTER (WHERE status='delivered'), 0)::bigint AS payout_due
          FROM orders WHERE status NOT IN ('cancelled','refunded')`),

      // ---- Eng faol sotuvchilar (30 kun). Buyurtmada bir nechta sotuvchi
      // bo'lishi mumkin — shuning uchun order_items qatorlari bo'yicha yig'amiz.
      pool.query(`
        SELECT s.id, s.business_name_uz AS name,
               COUNT(DISTINCT o.id)::int                        AS orders,
               COALESCE(SUM(oi.qty * oi.unit_price), 0)::bigint AS gmv
          FROM sellers s
          JOIN products p     ON p.seller_id = s.id
          JOIN order_items oi ON oi.product_id = p.id
          JOIN orders o       ON o.id = oi.order_id AND o.status NOT IN ('cancelled','refunded')
         WHERE o.created_at >= now() - interval '30 days'
         GROUP BY s.id, s.business_name_uz
         ORDER BY gmv DESC LIMIT 10`),

      pool.query(`
        SELECT id, business_name, city, product_type, phone, tg_username, created_at
          FROM seller_applications
         WHERE status='pending' AND step='done'
         ORDER BY created_at DESC LIMIT 50`),

      pool.query(`
        SELECT s.id, s.business_name_uz AS name, s.city_uz AS city, s.rating, s.created_at,
               COALESCE(u.phone, sa.phone) AS phone,
               (SELECT count(*) FROM products p
                 WHERE p.seller_id = s.id AND p.status='published')::int AS products
          FROM sellers s
          LEFT JOIN users u ON u.id = s.user_id
          LEFT JOIN LATERAL (
            SELECT phone FROM seller_applications sa2
             WHERE sa2.tg_user_id = u.tg_user_id AND sa2.status='approved'
             ORDER BY sa2.reviewed_at DESC NULLS LAST LIMIT 1
          ) sa ON true
         WHERE s.is_verified = true
         ORDER BY s.created_at DESC LIMIT 100`),

      pool.query(`
        SELECT p.id, p.name_uz, p.price, p.unit, p.cat_key, p.img, p.created_at,
               s.business_name_uz AS seller_name
          FROM products p
          LEFT JOIN sellers s ON s.id = p.seller_id
         WHERE p.status='pending' ORDER BY p.created_at DESC LIMIT 50`),

      pool.query(`SELECT count(*)::int AS n FROM disputes WHERE status='open'`),
    ]);

    const t = totalsRes.rows[0];
    ok(res, {
      moderationPending: modRes.rows[0].n,
      sellerAppsPending: appRes.rows[0].n,
      sellersVerified: sellerRes.rows[0].n,
      ordersToday: todayRes.rows[0].n,
      disputesOpen: disputeRes.rows[0].n,
      commissionRate: COMMISSION_RATE,

      totals: {
        orders: t.orders_total,
        gmv: Number(t.gmv_total),
        commission: Number(t.commission_total),
        completed: t.completed,
        // Yetkazilgan, lekin hali sotuvchiga o'tkazilmagan summa
        payoutDue: Number(t.payout_due),
      },

      daily: dailyRes.rows.map((r) => ({
        day: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day),
        gmv: Number(r.gmv),
        commission: Number(r.commission),
        orders: r.orders,
      })),
      monthly: monthlyRes.rows.map((r) => ({
        month: r.month instanceof Date ? r.month.toISOString().slice(0, 7) : String(r.month).slice(0, 7),
        gmv: Number(r.gmv),
        commission: Number(r.commission),
        orders: r.orders,
      })),

      topSellers: topSellersRes.rows.map((r) => ({
        id: r.id, name: r.name, orders: r.orders, gmv: Number(r.gmv),
      })),

      categories: catRes.rows.map((r) => ({ catKey: r.cat_key, count: r.n })),

      recentOrders: ordersRes.rows.map((r) => ({
        id: r.id,
        buyerName: r.buyer_name,
        // Sayt buyurtmasida Telegram yo'q — telefon yagona bog'lanish yo'li
        phone: r.buyer_phone,
        source: r.source,
        status: r.status,
        total: r.total_amount === null ? null : Number(r.total_amount),
        commission: r.commission_amount === null ? null : Number(r.commission_amount),
        payout: r.payout_amount === null ? null : Number(r.payout_amount),
        prepay: r.prepay_amount === null ? null : Number(r.prepay_amount),
        paidOut: !!r.paid_out_at,
        hasDispute: r.has_dispute,
        itemsCount: r.items_count,
        date: dateLabel(new Date(r.created_at)),
      })),

      applications: appListRes.rows.map((r) => ({
        id: r.id,
        business: r.business_name,
        city: r.city,
        productType: r.product_type,
        phone: r.phone,
        tgUsername: r.tg_username,
        date: dateLabel(new Date(r.created_at)),
      })),

      sellers: sellerListRes.rows.map((r) => ({
        id: r.id, name: r.name, city: r.city, phone: r.phone,
        products: r.products,
        rating: r.rating == null ? null : Number(r.rating),
        joined: new Date(r.created_at).toISOString().slice(0, 10),
      })),

      moderationQueue: modListRes.rows.map((r) => ({
        id: r.id,
        name: r.name_uz,
        price: Number(r.price),
        unit: r.unit,
        catKey: r.cat_key,
        img: r.img,
        sellerName: r.seller_name,
        date: dateLabel(new Date(r.created_at)),
      })),
    });
  } catch (e) {
    console.error('adminSummary xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ ADMIN AMALLARI: panel so'raydi → Telegram tasdiqlaydi ============
//
// Nega ikki bosqich (2026-07-27 founder qarori):
// admin panel tokeni brauzer sessionStorage'da yashaydi va o'g'irlanishi mumkin.
// Pul o'tkazish, refund va bahs qarori — qaytarib bo'lmaydigan amallar, ular
// uchun bitta token yetarli emas. Panel faqat SO'ROV yaratadi; amal ADMIN_CHAT_ID
// chatidagi tugma bosilgandan keyin bajariladi. Tasdiqlovchi shaxs Telegram
// hisobiga ega bo'lishi shart — ya'ni ikkinchi, mustaqil omil.
//
// So'rov 30 daqiqadan keyin eskiradi — kechagi tugmani bosib qo'yish xavfi yo'q.
const ADMIN_ACTION_TTL_MS = 30 * 60 * 1000;

function callbackAnswer(id, text) {
  return callTelegram('answerCallbackQuery', { callback_query_id: id, text: text || '' }).catch(() => {});
}

// Buyurtmada qatnashgan sotuvchilarning Telegram ID'lari (xabar yuborish uchun).
// Bitta buyurtmada bir nechta sotuvchi bo'lishi mumkin.
async function sellerTgIdsForOrder(orderId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT u.tg_user_id
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN sellers s  ON s.id = p.seller_id
       JOIN users u    ON u.id = s.user_id
      WHERE oi.order_id = $1 AND u.tg_user_id IS NOT NULL`,
    [orderId]
  );
  return rows.map((r) => r.tg_user_id);
}

function notify(chatId, text) {
  if (!chatId) return Promise.resolve();
  return callTelegram('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' }).catch(() => {});
}

// Har amal turi uchun: kirishni tekshirish (check), tasdiq xabari matni
// (summary) va bajarish (run). `run` DB'ni o'zgartiradi va xabar yuboradi;
// ClientError tashlasa admin chatiga sabab qaytadi.
const ADMIN_ACTIONS = {
  seller_approve: {
    schema: {},
    async check(targetId) {
      const { rows } = await pool.query(
        `SELECT id, business_name, city FROM seller_applications
          WHERE id = $1 AND status='pending' AND step='done'`, [Number(targetId) || 0]);
      if (!rows.length) throw new ClientError("ariza topilmadi yoki allaqachon ko'rib chiqilgan");
      return rows[0];
    },
    summary: (t) => `🆕 <b>Sotuvchini tasdiqlash</b>\n\n${escapeHtml(t.business_name || '?')} — ${escapeHtml(t.city || '?')}`,
    run: (a) => handleSellerApplicationReview(ADMIN_CHAT_ID, 'approve', Number(a.target_id)),
  },

  seller_reject: {
    schema: { reason: { type: 'string', required: false, max: 500 } },
    check: (targetId) => ADMIN_ACTIONS.seller_approve.check(targetId),
    summary: (t, p) =>
      `🚫 <b>Sotuvchi arizasini rad etish</b>\n\n${escapeHtml(t.business_name || '?')}` +
      (p.reason ? `\n<b>Sabab:</b> ${escapeHtml(p.reason)}` : ''),
    run: (a) => handleSellerApplicationReview(ADMIN_CHAT_ID, 'reject', Number(a.target_id), a.payload.reason),
  },

  product_publish: {
    schema: {},
    async check(targetId) {
      const { rows } = await pool.query(
        `SELECT id, name_uz, price FROM products WHERE id = $1 AND status='pending'`, [String(targetId)]);
      if (!rows.length) throw new ClientError("e'lon topilmadi yoki allaqachon ko'rib chiqilgan");
      return rows[0];
    },
    summary: (t) => `✅ <b>E'lonni nashr qilish</b>\n\n${escapeHtml(t.name_uz)} — ${escapeHtml(money(t.price))}`,
    async run(a) {
      const { rows } = await pool.query(
        `UPDATE products SET status='published', reject_reason=NULL, reviewed_at=now()
          WHERE id=$1 AND status='pending' RETURNING id, name_uz, submitted_by_tg`,
        [a.target_id]);
      if (!rows.length) throw new ClientError("e'lon holati o'zgargan");
      await notify(rows[0].submitted_by_tg,
        `✅ <b>E'loningiz nashr etildi</b>\n\n${escapeHtml(rows[0].name_uz)} endi katalogda ko'rinadi.`);
      return `✅ nashr etildi: ${rows[0].name_uz}`;
    },
  },

  product_reject: {
    schema: { reason: { type: 'string', required: false, max: 500 } },
    check: (targetId) => ADMIN_ACTIONS.product_publish.check(targetId),
    summary: (t, p) =>
      `🚫 <b>E'lonni rad etish</b>\n\n${escapeHtml(t.name_uz)}` +
      (p.reason ? `\n<b>Sabab:</b> ${escapeHtml(p.reason)}` : ''),
    async run(a) {
      const { rows } = await pool.query(
        `UPDATE products SET status='rejected', reject_reason=$1, reviewed_at=now()
          WHERE id=$2 AND status='pending' RETURNING id, name_uz, submitted_by_tg`,
        [a.payload.reason || null, a.target_id]);
      if (!rows.length) throw new ClientError("e'lon holati o'zgargan");
      await notify(rows[0].submitted_by_tg,
        `🚫 <b>E'loningiz rad etildi</b>\n\n${escapeHtml(rows[0].name_uz)}` +
        (a.payload.reason ? `\n<b>Sabab:</b> ${escapeHtml(a.payload.reason)}` : '') +
        `\n\nTuzatib qayta yuborishingiz mumkin.`);
      return `🚫 rad etildi: ${rows[0].name_uz}`;
    },
  },

  // "Pul o'tkazildi" — savdoni yakunlaydi. Faqat yetkazilgan buyurtmada
  // mumkin va ochiq bahs bo'lmasligi shart (bahs hal bo'lmasdan pul ketmasin).
  order_payout: {
    schema: {},
    async check(targetId) {
      const { rows } = await pool.query(
        `SELECT o.id, o.status, o.total_amount, o.payout_amount, o.commission_amount,
                EXISTS (SELECT 1 FROM disputes d WHERE d.order_id=o.id AND d.status='open') AS has_dispute
           FROM orders o WHERE o.id = $1`, [String(targetId)]);
      if (!rows.length) throw new ClientError('buyurtma topilmadi');
      const o = rows[0];
      if (o.status !== 'delivered') throw new ClientError(`faqat "yetkazildi" holatida mumkin (hozir: ${o.status})`);
      if (o.has_dispute) throw new ClientError('bu buyurtmada ochiq bahs bor — avval uni hal qiling');
      return o;
    },
    summary: (t) =>
      `💸 <b>Sotuvchiga pul o'tkazish</b>\n\n<b>Buyurtma:</b> <code>${escapeHtml(t.id)}</code>\n` +
      `<b>Jami:</b> ${escapeHtml(money(t.total_amount))}\n` +
      `<b>Komissiya:</b> ${escapeHtml(money(t.commission_amount || 0))}\n` +
      `<b>Sotuvchiga:</b> ${escapeHtml(money(t.payout_amount || 0))}`,
    async run(a) {
      const { rows } = await pool.query(
        `UPDATE orders SET status='completed', paid_out_at=now()
          WHERE id=$1 AND status='delivered' RETURNING id, payout_amount`,
        [a.target_id]);
      if (!rows.length) throw new ClientError("buyurtma holati o'zgargan");
      for (const tg of await sellerTgIdsForOrder(a.target_id)) {
        await notify(tg,
          `💸 <b>To'lov o'tkazildi</b>\n\nBuyurtma: <code>${escapeHtml(a.target_id)}</code>\n` +
          `Summa: ${escapeHtml(money(rows[0].payout_amount || 0))}`);
      }
      return `💸 ${a.target_id} — pul o'tkazildi deb belgilandi`;
    },
  },

  // Refund — hozircha BUXGALTERIYA yozuvi: Payme/Click ulanmagan, pul qo'lda
  // qaytariladi. Bu yozuv "qaytarildi" faktini qayd etadi va xaridorga xabar
  // beradi; haqiqiy o'tkazma platforma tashqarisida bajariladi.
  order_refund: {
    schema: {
      amount: { type: 'int', required: true, min: 1, max: 100000000000 },
      reason: { type: 'string', required: true, min: 3, max: 500 },
    },
    async check(targetId, p) {
      const { rows } = await pool.query(
        `SELECT id, status, total_amount, tg_user_id FROM orders WHERE id = $1`, [String(targetId)]);
      if (!rows.length) throw new ClientError('buyurtma topilmadi');
      const o = rows[0];
      if (o.status === 'refunded') throw new ClientError('bu buyurtma allaqachon qaytarilgan');
      if (p.amount > Number(o.total_amount)) throw new ClientError('qaytarish summasi buyurtma summasidan katta');
      return o;
    },
    summary: (t, p) =>
      `↩️ <b>Pul qaytarish</b>\n\n<b>Buyurtma:</b> <code>${escapeHtml(t.id)}</code>\n` +
      `<b>Buyurtma summasi:</b> ${escapeHtml(money(t.total_amount))}\n` +
      `<b>Qaytariladi:</b> ${escapeHtml(money(p.amount))}` +
      (p.amount < Number(t.total_amount) ? ' (qisman)' : ' (to\'liq)') +
      `\n<b>Sabab:</b> ${escapeHtml(p.reason)}\n\n` +
      `<i>Diqqat: pul o'tkazmasi qo'lda bajariladi — bu yozuv faqat faktni qayd etadi.</i>`,
    async run(a) {
      const { rows } = await pool.query(
        `UPDATE orders SET status='refunded', refund_amount=$1, refund_reason=$2, refunded_at=now()
          WHERE id=$3 AND status <> 'refunded' RETURNING id, tg_user_id`,
        [a.payload.amount, a.payload.reason, a.target_id]);
      if (!rows.length) throw new ClientError("buyurtma holati o'zgargan");
      await notify(rows[0].tg_user_id,
        `↩️ <b>Pul qaytarildi</b>\n\nBuyurtma: <code>${escapeHtml(a.target_id)}</code>\n` +
        `Summa: ${escapeHtml(money(a.payload.amount))}\n<b>Sabab:</b> ${escapeHtml(a.payload.reason)}`);
      return `↩️ ${a.target_id} — ${money(a.payload.amount)} qaytarildi`;
    },
  },

  // Bahs qarori: kim aybdor + logistikani kim to'laydi + ixtiyoriy qaytarish.
  dispute_resolve: {
    schema: {
      atFault:        { type: 'string', required: true, enum: ['buyer', 'seller', 'none'] },
      logisticsPayer: { type: 'string', required: true, enum: ['buyer', 'seller', 'platform'] },
      decision:       { type: 'string', required: true, min: 3, max: 1000 },
      refundAmount:   { type: 'int', required: false, min: 0, max: 100000000000, default: 0 },
    },
    async check(targetId, p) {
      const { rows } = await pool.query(
        `SELECT d.id, d.order_id, d.reason, d.status, o.total_amount, o.tg_user_id
           FROM disputes d JOIN orders o ON o.id = d.order_id
          WHERE d.id = $1`, [Number(targetId) || 0]);
      if (!rows.length) throw new ClientError('bahs topilmadi');
      if (rows[0].status !== 'open') throw new ClientError('bahs allaqachon hal qilingan');
      if (p.refundAmount > Number(rows[0].total_amount)) {
        throw new ClientError('qaytarish summasi buyurtma summasidan katta');
      }
      return rows[0];
    },
    summary: (t, p) => {
      const FAULT = { buyer: 'Xaridor', seller: 'Sotuvchi', none: 'Hech kim' };
      const PAYER = { buyer: 'Xaridor', seller: 'Sotuvchi', platform: 'Platforma' };
      return `⚖️ <b>Bahs qarori</b> — #${t.id}\n\n` +
        `<b>Buyurtma:</b> <code>${escapeHtml(t.order_id)}</code>\n` +
        `<b>Xaridor shikoyati:</b> ${escapeHtml(t.reason || '-')}\n\n` +
        `<b>Aybdor:</b> ${FAULT[p.atFault]}\n` +
        `<b>Logistikani to'laydi:</b> ${PAYER[p.logisticsPayer]}\n` +
        (p.refundAmount ? `<b>Qaytariladi:</b> ${escapeHtml(money(p.refundAmount))}\n` : '') +
        `<b>Qaror:</b> ${escapeHtml(p.decision)}`;
    },
    async run(a) {
      const p = a.payload;
      const client = await pool.connect();
      let d;
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          `UPDATE disputes SET status='resolved', decision=$1, at_fault=$2,
                  logistics_payer=$3, refund_amount=$4, resolved_at=now(), awaiting_evidence=false
            WHERE id=$5 AND status='open'
            RETURNING id, order_id, opened_by_tg`,
          [p.decision, p.atFault, p.logisticsPayer, p.refundAmount || null, Number(a.target_id)]);
        if (!rows.length) throw new ClientError('bahs allaqachon hal qilingan');
        d = rows[0];
        // Qaytarish belgilangan bo'lsa buyurtma ham 'refunded' bo'ladi —
        // shunda pul o'tkazish (payout) endi mumkin bo'lmaydi.
        if (p.refundAmount > 0) {
          await client.query(
            `UPDATE orders SET status='refunded', refund_amount=$1,
                    refund_reason=$2, refunded_at=now()
              WHERE id=$3 AND status <> 'refunded'`,
            [p.refundAmount, `Bahs #${d.id}: ${p.decision}`.slice(0, 500), d.order_id]);
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK').catch(() => {});
        throw e;
      } finally {
        client.release();
      }

      const text =
        `⚖️ <b>Bahs bo'yicha qaror qabul qilindi</b>\n\n` +
        `Buyurtma: <code>${escapeHtml(d.order_id)}</code>\n` +
        `<b>Qaror:</b> ${escapeHtml(p.decision)}` +
        (p.refundAmount ? `\n<b>Qaytariladi:</b> ${escapeHtml(money(p.refundAmount))}` : '');
      await notify(d.opened_by_tg, text);
      for (const tg of await sellerTgIdsForOrder(d.order_id)) await notify(tg, text);
      return `⚖️ Bahs #${d.id} hal qilindi`;
    },
  },
};

// ---- POST /api/admin/action — paneldan amal SO'RASH ----
async function handleAdminActionRequest(req, res, ip) {
  if (rateLimited(`adminaction:${ip}`, 20)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;
  try {
    const data = JSON.parse(await readBody(req, 20_000));
    const def = ADMIN_ACTIONS[data.kind];
    if (!def) return fail(res, "noma'lum amal", 400);
    const targetId = String(data.targetId || '').trim();
    if (!targetId) return fail(res, 'targetId kerak', 400);

    const v = validate(data.payload || {}, def.schema);
    if (!v.ok) return fail(res, v.error, 400);

    // Oldindan tekshiruv: admin Telegram'da mantiqsiz so'rov ko'rmasin
    // (masalan allaqachon hal qilingan bahs uchun tugma).
    const target = await def.check(targetId, v.data);

    const { rows } = await pool.query(
      `INSERT INTO admin_actions (kind, target_id, payload) VALUES ($1,$2,$3) RETURNING id`,
      [data.kind, targetId, JSON.stringify(v.data)]);
    const actionId = rows[0].id;

    const sent = await callTelegram('sendMessage', {
      chat_id: ADMIN_CHAT_ID,
      parse_mode: 'HTML',
      text: `${def.summary(target, v.data)}\n\n<i>So'rov admin paneldan keldi. Tasdiqlaysizmi?</i>`,
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Tasdiqlash', callback_data: `aa:${actionId}:ok` },
          { text: '✖️ Bekor',      callback_data: `aa:${actionId}:no` },
        ]],
      },
    });

    // Telegram'ga xabar ketmasa so'rov abadiy "pending" bo'lib osilib qolardi —
    // darhol yopamiz va panelga aniq sabab qaytaramiz.
    let messageId = null;
    try { messageId = JSON.parse(sent.body).result.message_id; } catch (_) {}
    if (!messageId) {
      await pool.query(`UPDATE admin_actions SET status='failed', error=$1, decided_at=now() WHERE id=$2`,
        ['Telegram xabarini yuborib bo\'lmadi', actionId]);
      return fail(res, "Telegram'ga tasdiq so'rovi yuborilmadi — keyinroq urinib ko'ring", 502);
    }
    await pool.query(`UPDATE admin_actions SET tg_message_id=$1 WHERE id=$2`, [messageId, actionId]);

    ok(res, { id: actionId, status: 'pending' }, 201);
  } catch (e) {
    console.error('adminAction xatosi:', e.message);
    if (e.userFacing) return fail(res, e.message, 400);
    fail(res, 'server error', 500);
  }
}

// ---- GET /api/admin/action?id= — panel natijani kutadi ----
async function handleAdminActionStatus(req, res, ip) {
  if (rateLimited(`adminactionst:${ip}`, 120)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;
  let id;
  try { id = new URL(req.url, 'http://x').searchParams.get('id'); } catch (_) { id = null; }
  if (!id || !/^\d+$/.test(id)) return fail(res, 'invalid id', 400);
  try {
    const { rows } = await pool.query(
      `SELECT id, kind, status, error, requested_at FROM admin_actions WHERE id=$1`, [Number(id)]);
    if (!rows.length) return fail(res, 'not found', 404);
    const a = rows[0];
    // Eskirganini o'qish paytida ham belgilaymiz — panel "abadiy kutish"da qolmasin
    if (a.status === 'pending' && Date.now() - new Date(a.requested_at).getTime() > ADMIN_ACTION_TTL_MS) {
      await pool.query(`UPDATE admin_actions SET status='expired', decided_at=now() WHERE id=$1 AND status='pending'`, [a.id]);
      a.status = 'expired';
    }
    ok(res, { id: a.id, kind: a.kind, status: a.status, error: a.error });
  } catch (e) {
    console.error('adminActionStatus xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- Telegram tugmasi bosilganda ----
async function handleAdminActionCallback(cq) {
  const m = String(cq.data || '').match(/^aa:(\d+):(ok|no)$/);
  if (!m) return;
  const actionId = Number(m[1]);
  const approved = m[2] === 'ok';

  // Tugmani kim bosgani MUHIM: xabar admin chatida tursa ham, tasdiqlovchi
  // ADMIN_TG_IDS ro'yxatida bo'lishi shart (guruhga qo'shilgan begona bosmasin).
  if (!isAdmin(cq.from)) {
    await callbackAnswer(cq.id, 'Ruxsat yo\'q');
    return;
  }

  const { rows } = await pool.query(`SELECT * FROM admin_actions WHERE id=$1`, [actionId]);
  if (!rows.length) return callbackAnswer(cq.id, 'So\'rov topilmadi');
  const a = rows[0];
  if (a.status !== 'pending') return callbackAnswer(cq.id, `Allaqachon ko'rib chiqilgan (${a.status})`);
  if (Date.now() - new Date(a.requested_at).getTime() > ADMIN_ACTION_TTL_MS) {
    await pool.query(`UPDATE admin_actions SET status='expired', decided_at=now() WHERE id=$1`, [actionId]);
    return callbackAnswer(cq.id, "So'rov eskirdi — paneldan qayta yuboring");
  }

  let resultText;
  if (!approved) {
    await pool.query(
      `UPDATE admin_actions SET status='declined', decided_at=now(), decided_by=$1 WHERE id=$2 AND status='pending'`,
      [String(cq.from.id), actionId]);
    resultText = '✖️ Bekor qilindi';
  } else {
    try {
      // Ijrochi ClientError tashlasa — bu biznes sababi (holat o'zgargan),
      // uni adminga ko'rsatamiz. Boshqa xatolar yashiriladi.
      const out = await ADMIN_ACTIONS[a.kind].run(a);
      await pool.query(
        `UPDATE admin_actions SET status='done', decided_at=now(), decided_by=$1 WHERE id=$2 AND status='pending'`,
        [String(cq.from.id), actionId]);
      resultText = typeof out === 'string' ? out : '✅ Bajarildi';
    } catch (e) {
      console.error('adminAction run xatosi:', e.message);
      const reason = e.userFacing ? e.message : 'ichki xato';
      await pool.query(
        `UPDATE admin_actions SET status='failed', error=$1, decided_at=now(), decided_by=$2 WHERE id=$3`,
        [reason, String(cq.from.id), actionId]);
      resultText = `❌ Bajarilmadi: ${reason}`;
    }
  }

  await callbackAnswer(cq.id, resultText.slice(0, 190));
  if (a.tg_message_id) {
    await callTelegram('editMessageReplyMarkup', {
      chat_id: ADMIN_CHAT_ID, message_id: a.tg_message_id, reply_markup: { inline_keyboard: [] },
    }).catch(() => {});
  }
  await notify(ADMIN_CHAT_ID, resultText);
}

// ============ BAHSLI HOLATLAR (disputes) ============
// Dalil rasmi Telegram orqali yig'iladi: bahs ochilgach bot xaridordan rasm
// so'raydi va faqat file_id saqlanadi (fayl Telegram serverida qoladi).
const DISPUTE_REASONS = {
  not_delivered: 'Mato yetib kelmadi',
  damaged:       'Mato shikastlangan',
  wrong_item:    "Boshqa mato keldi",
  quality:       'Sifat mos emas',
  quantity:      'Miqdor kam chiqdi',
  other:         'Boshqa muammo',
};

// Bahs faqat mato yo'lga chiqqandan keyin ochiladi — bundan oldin muammo
// "buyurtma" muammosi (bekor qilish), bahs emas.
const DISPUTE_ALLOWED_ORDER_STATUS = ['shipped', 'delivered', 'completed'];

async function handleCreateDispute(req, res, ip) {
  if (rateLimited(`dispute:${ip}`, 10)) return fail(res, 'too many requests', 429);
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  try {
    const data = JSON.parse(await readBody(req, 20_000));
    const v = validate(data, {
      orderId:    { type: 'string', required: true, max: 40 },
      reasonKey:  { type: 'string', required: true, enum: Object.keys(DISPUTE_REASONS) },
      comment:    { type: 'string', required: false, max: 1000 },
    });
    if (!v.ok) return fail(res, v.error, 400);

    // Buyurtma shu xaridorniki ekanini imzolangan Telegram ID orqali tekshiramiz
    const { rows: ord } = await pool.query(
      `SELECT id, status, buyer_name FROM orders WHERE id=$1 AND tg_user_id=$2`,
      [v.data.orderId, String(u.id)]);
    if (!ord.length) return fail(res, 'buyurtma topilmadi', 404);
    if (!DISPUTE_ALLOWED_ORDER_STATUS.includes(ord[0].status)) {
      return fail(res, "bu buyurtma bo'yicha hali bahs ochib bo'lmaydi", 400);
    }

    const reason = DISPUTE_REASONS[v.data.reasonKey] +
      (v.data.comment ? ` — ${v.data.comment}` : '');

    // Buyurtmadagi birinchi sotuvchi (odatda bitta) — javob berish uchun
    const { rows: sel } = await pool.query(
      `SELECT p.seller_id FROM order_items oi JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id=$1 AND p.seller_id IS NOT NULL LIMIT 1`, [v.data.orderId]);

    let d;
    try {
      const { rows } = await pool.query(
        `INSERT INTO disputes (order_id, reason, opened_by_tg, seller_id, status, awaiting_evidence)
         VALUES ($1,$2,$3,$4,'open',true) RETURNING id`,
        [v.data.orderId, reason.slice(0, 1000), String(u.id), sel.length ? sel[0].seller_id : null]);
      d = rows[0];
    } catch (e) {
      // Unikal indeks: bitta buyurtmada bitta ochiq bahs
      if (e.code === '23505') return fail(res, "bu buyurtma bo'yicha ochiq bahs allaqachon bor", 409);
      throw e;
    }

    // Xaridordan dalil rasmini so'raymiz (bot suhbati)
    await notify(u.id,
      `📸 <b>Bahs #${d.id} ochildi</b>\n\nBuyurtma: <code>${escapeHtml(v.data.orderId)}</code>\n` +
      `<b>Muammo:</b> ${escapeHtml(reason)}\n\n` +
      `Iltimos, muammoni ko'rsatuvchi <b>rasm yoki video yuboring</b> (10 tagacha).\n` +
      `Yuborib bo'lgach <b>tayyor</b> deb yozing.`);

    await notify(ADMIN_CHAT_ID,
      `⚠️ <b>Yangi bahs #${d.id}</b>\n\nBuyurtma: <code>${escapeHtml(v.data.orderId)}</code>\n` +
      `<b>Xaridor:</b> ${escapeHtml(ord[0].buyer_name || "Noma'lum")}\n` +
      `<b>Muammo:</b> ${escapeHtml(reason)}\n\nAdmin panelning "Bahslar" bo'limida ko'rib chiqing.`);

    if (sel.length) {
      const { rows: stg } = await pool.query(
        `SELECT u.tg_user_id FROM sellers s JOIN users u ON u.id=s.user_id WHERE s.id=$1`, [sel[0].seller_id]);
      if (stg.length) {
        await notify(stg[0].tg_user_id,
          `⚠️ <b>Buyurtma bo'yicha shikoyat</b>\n\nBuyurtma: <code>${escapeHtml(v.data.orderId)}</code>\n` +
          `<b>Muammo:</b> ${escapeHtml(reason)}\n\nKabinetingizdagi buyurtma sahifasida javob yozing.`);
      }
    }

    ok(res, { id: d.id, status: 'open' }, 201);
  } catch (e) {
    console.error('createDispute xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// GET /api/disputes — xaridorning o'z bahslari (Mini App'da holatni ko'rsatish uchun)
async function handleGetDisputes(req, res, ip) {
  if (rateLimited(`disputelist:${ip}`, 60)) return fail(res, 'too many requests', 429);
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  try {
    const { rows } = await pool.query(
      `SELECT id, order_id, reason, status, decision, refund_amount,
              seller_response, created_at, array_length(evidence_file_ids, 1) AS photos
         FROM disputes WHERE opened_by_tg = $1 ORDER BY created_at DESC LIMIT 50`,
      [String(u.id)]);
    ok(res, rows.map((r) => ({
      id: r.id,
      orderId: r.order_id,
      reason: r.reason,
      status: r.status,
      decision: r.decision,
      refundAmount: r.refund_amount === null ? null : Number(r.refund_amount),
      sellerResponse: r.seller_response,
      photos: r.photos || 0,
      date: dateLabel(new Date(r.created_at)),
    })));
  } catch (e) {
    console.error('getDisputes xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// POST /api/seller/dispute — sotuvchining bahsga javobi
async function handleSellerDisputeReply(req, res, ip) {
  if (rateLimited(`sellerdispute:${ip}`, 20)) return fail(res, 'too many requests', 429);
  const me = await requireSeller(req, res);
  if (!me) return;
  try {
    const data = JSON.parse(await readBody(req, 20_000));
    const v = validate(data, {
      disputeId: { type: 'int', required: true, min: 1 },
      response:  { type: 'string', required: true, min: 3, max: 1000 },
    });
    if (!v.ok) return fail(res, v.error, 400);

    // Egalik: bahs shu sotuvchining buyurtmasiga tegishli bo'lishi shart
    const { rows } = await pool.query(
      `UPDATE disputes SET seller_response=$1, seller_responded_at=now()
        WHERE id=$2 AND seller_id=$3 AND status='open'
        RETURNING id, order_id, opened_by_tg`,
      [v.data.response, v.data.disputeId, me.seller_id]);
    if (!rows.length) return fail(res, 'bahs topilmadi yoki allaqachon yopilgan', 404);

    await notify(rows[0].opened_by_tg,
      `💬 <b>Ishlab chiqaruvchi javob berdi</b>\n\nBuyurtma: <code>${escapeHtml(rows[0].order_id)}</code>\n` +
      `${escapeHtml(v.data.response)}\n\nModerator qarorini kuting.`);
    await notify(ADMIN_CHAT_ID,
      `💬 <b>Bahs #${rows[0].id}</b> — sotuvchi javob berdi:\n${escapeHtml(v.data.response)}`);

    ok(res, { id: rows[0].id });
  } catch (e) {
    console.error('sellerDisputeReply xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// GET /api/admin/disputes — moderator navbati (panel tokeni bilan)
async function handleAdminDisputes(req, res, ip) {
  if (rateLimited(`admindisputes:${ip}`, 30)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.order_id, d.reason, d.status, d.decision, d.at_fault,
              d.logistics_payer, d.refund_amount, d.seller_response, d.evidence_file_ids,
              d.awaiting_evidence, d.created_at, d.resolved_at,
              o.buyer_name, o.total_amount, o.status AS order_status,
              s.business_name_uz AS seller_name
         FROM disputes d
         JOIN orders o  ON o.id = d.order_id
         LEFT JOIN sellers s ON s.id = d.seller_id
        ORDER BY (d.status='open') DESC, d.created_at DESC
        LIMIT 100`);
    ok(res, rows.map((r) => ({
      id: r.id,
      orderId: r.order_id,
      reason: r.reason,
      status: r.status,
      decision: r.decision,
      atFault: r.at_fault,
      logisticsPayer: r.logistics_payer,
      refundAmount: r.refund_amount === null ? null : Number(r.refund_amount),
      sellerResponse: r.seller_response,
      awaitingEvidence: r.awaiting_evidence,
      buyerName: r.buyer_name,
      sellerName: r.seller_name,
      orderTotal: r.total_amount === null ? null : Number(r.total_amount),
      orderStatus: r.order_status,
      // Rasm havolasi imzolangan: Telegram fayl URL'ida bot tokeni bor,
      // uni panelga BERMAYMIZ — server proksi qiladi (handleDisputePhoto).
      photos: (r.evidence_file_ids || []).map((f) => `/api/admin/dispute-photo?f=${encodeURIComponent(f)}&s=${photoSig(f)}`),
      date: dateLabel(new Date(r.created_at)),
      ageHours: Math.floor((Date.now() - new Date(r.created_at).getTime()) / 3600000),
    })));
  } catch (e) {
    console.error('adminDisputes xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// Dalil rasmi uchun imzo: <img src> header yubora olmaydi, tokenni esa URL'ga
// qo'yib bo'lmaydi (nginx loglariga tushadi). Shuning uchun file_id dan
// ADMIN_PANEL_TOKEN bilan HMAC hosil qilamiz — imzo faqat shu faylga yaraydi.
function photoSig(fileId) {
  return crypto.createHmac('sha256', ADMIN_PANEL_TOKEN || 'x').update(String(fileId)).digest('hex').slice(0, 32);
}

function tgGetFile(fileId) {
  return callTelegram('getFile', { file_id: fileId }).then((r) => {
    try { return JSON.parse(r.body).result.file_path; } catch (_) { return null; }
  });
}

async function handleDisputePhoto(req, res, ip) {
  if (rateLimited(`disputephoto:${ip}`, 120)) return fail(res, 'too many requests', 429);
  let f, s;
  try {
    const q = new URL(req.url, 'http://x').searchParams;
    f = q.get('f'); s = q.get('s');
  } catch (_) { return fail(res, 'invalid', 400); }
  if (!f || !s || !ADMIN_PANEL_TOKEN || !safeEqual(s, photoSig(f))) return fail(res, 'unauthorized', 401);
  try {
    const filePath = await tgGetFile(f);
    if (!filePath) return fail(res, 'not found', 404);
    // Telegram'dan oqim sifatida uzatamiz — fayl serverimizda saqlanmaydi
    https.get(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`, (tgRes) => {
      if (tgRes.statusCode !== 200) { tgRes.resume(); return fail(res, 'not found', 404); }
      res.writeHead(200, {
        'Content-Type': tgRes.headers['content-type'] || 'application/octet-stream',
        'Cache-Control': 'private, max-age=300',
      });
      tgRes.pipe(res);
    }).on('error', () => fail(res, 'server error', 500));
  } catch (e) {
    console.error('disputePhoto xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- 24 soatlik eslatma ----
// Ochiq bahs 24 soatdan oshsa adminga bir marta eslatma yuboriladi
// (reminded_at qo'yiladi — takror yuborilmaydi).
const DISPUTE_REMINDER_MS = 15 * 60 * 1000;
async function scanStaleDisputes() {
  try {
    const { rows } = await pool.query(
      `UPDATE disputes SET reminded_at = now()
        WHERE status='open' AND reminded_at IS NULL
          AND created_at < now() - interval '24 hours'
        RETURNING id, order_id, reason`);
    for (const d of rows) {
      await notify(ADMIN_CHAT_ID,
        `⏰ <b>Bahs #${d.id} 24 soatdan beri hal qilinmagan</b>\n\n` +
        `Buyurtma: <code>${escapeHtml(d.order_id)}</code>\n<b>Muammo:</b> ${escapeHtml(d.reason || '-')}`);
    }
  } catch (e) {
    console.error('disputes eslatma xatosi:', e.message);
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
    // Komissiya ham SERVER tomonda: stavka snapshot qilinadi, sotuvchiga
    // o'tkaziladigan summa shu yerda qat'iylashadi. Admin "Pul o'tkazildi"
    // bosganda summa qaytadan hisoblanmaydi — buyurtmadagi qiymat ishlatiladi.
    const commissionAmount = Math.round(total * COMMISSION_RATE);
    const payoutAmount = total - commissionAmount;

    await client.query('BEGIN');
    const { rows: idRows } = await client.query(`SELECT '#LM-' || nextval('order_seq') AS id`);
    const orderId = idRows[0].id;

    await client.query(
      `INSERT INTO orders (id, buyer_name, tg_user_id, tg_username, address, payment, comment,
                           total_amount, prepay_amount, rest_amount,
                           commission_rate, commission_amount, payout_amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending')`,
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
        COMMISSION_RATE,
        commissionAmount,
        payoutAmount,
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
      // Faqat ADMIN chatida — sotuvchi va xaridor komissiyani ko'rmaydi
      `📊 <b>Komissiya:</b> ${escapeHtml(money(commissionAmount))} · <b>Sotuvchiga:</b> ${escapeHtml(money(payoutAmount))}`,
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

// ============ /api/web-orders POST — SAYT buyurtmasi (bazaga) ============
// lolamarket.uz savatidan keladi. Mini App'dan ikki farqi bor:
//   1) Telegram imzosi YO'Q — sayt xaridorida Telegram hisobi bo'lmasligi mumkin.
//      Shuning uchun kimligi telefon orqali aniqlanadi va u MAJBURIY.
//   2) `source='web'` bilan yoziladi — panelda buyurtma qayerdan kelgani ko'rinadi.
// Narx, MOQ, oldindan to'lov va komissiya — hammasi SERVER tomonda, xuddi
// Mini App'dagidek. Klient yuborgan summaga hech qachon ishonilmaydi.
//
// MUHIM (2026-07-29): ilgari sayt buyurtmasi faqat `/api/telegram-notify` ga
// borardi, u esa bazaga yozmaydi — buyurtma Telegram'ga tushib, admin panelda
// umuman ko'rinmasdi. Shu endpoint o'sha teshikni yopadi.
async function handleCreateWebOrder(req, res, ip) {
  // Imzo yo'q — spamga ochiq. Shuning uchun limit Mini App'nikidan qattiqroq.
  if (rateLimited(`weborder:${ip}`, 5)) return fail(res, 'too many requests', 429);
  // Saytda Telegram orqali kirgan bo'lsa — kimligini cookie sessiyasidan olamiz.
  // Telegram ID mijozdan SO'RALMAYDI: u sessiyaga botdagi tasdiqda yozilgan.
  const session = await webSessionUser(req).catch((e) => {
    console.error('webOrder sessiya xatosi:', e.message);
    return null;
  });
  const client = await pool.connect();
  try {
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body);

    const v = validate(data, {
      buyerName: { type: 'string', required: true,  max: 200 },
      phone:     { type: 'string', required: true,  max: 30 },
      company:   { type: 'string', required: false, max: 200 },
      address:   { type: 'string', required: true,  max: 500 },
      comment:   { type: 'string', required: false, max: 1000 },
    });
    if (!v.ok) throw new ClientError(v.error);

    // Telefon: faqat raqamlar sanaladi (format erkin — +998, probel, qavs mayli)
    const digits = String(v.data.phone).replace(/\D/g, '');
    if (digits.length < 9) throw new ClientError("Telefon raqami to'liq emas");

    // Savat — Mini App bilan bir xil shakl: [{id, qty}]
    const lines = Array.isArray(data.items) ? data.items : [];
    if (!lines.length) throw new ClientError("Savat bo'sh");
    if (lines.length > 50) throw new ClientError("Juda ko'p tur (maksimum 50)");
    for (const l of lines) {
      if (!l || typeof l.id !== 'string' || !l.id.trim()) throw new ClientError("Mahsulot ID noto'g'ri");
      const q = parseInt(l.qty, 10);
      if (!Number.isInteger(q) || q < 1 || q > 100000) throw new ClientError("Miqdor 1..100000 oralig'ida bo'lishi kerak");
    }

    const ids = lines.map((l) => String(l.id));
    const qtyById = new Map(lines.map((l) => [String(l.id), Math.max(1, parseInt(l.qty, 10) || 1)]));
    const { rows: prods } = await client.query(
      `SELECT id, price, name_uz, unit, moq FROM products WHERE id = ANY($1)`,
      [ids]
    );
    if (!prods.length) throw new ClientError('Mahsulot topilmadi');

    for (const p of prods) {
      const qty = qtyById.get(p.id) || 1;
      const moq = Number(p.moq) || 1;
      if (qty < moq) throw new ClientError(`"${p.name_uz}" uchun minimal buyurtma: ${moq} ${p.unit}`);
    }

    const items = prods.map((p) => ({
      id: p.id,
      qty: qtyById.get(p.id) || 1,
      unitPrice: Number(p.price),
      name: p.name_uz,
      unit: p.unit,
    }));
    const total = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
    const prepay = Math.round(total * PREPAY_RATE);
    const rest = total - prepay;
    const commissionAmount = Math.round(total * COMMISSION_RATE);
    const payoutAmount = total - commissionAmount;

    // ID Mini App bilan BIR XIL ketma-ketlikdan olinadi — shunda `/tasdiqla #LM-...`
    // buyrug'i sayt buyurtmalarida ham ishlaydi (webhook regex faqat raqam kutadi).
    await client.query('BEGIN');
    const { rows: idRows } = await client.query(`SELECT '#LM-' || nextval('order_seq') AS id`);
    const orderId = idRows[0].id;

    const buyerName = v.data.company ? `${v.data.buyerName} (${v.data.company})` : v.data.buyerName;

    await client.query(
      `INSERT INTO orders (id, buyer_id, buyer_name, buyer_phone, tg_user_id, tg_username,
                           address, payment, comment,
                           total_amount, prepay_amount, rest_amount,
                           commission_rate, commission_amount, payout_amount, status, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending','web')`,
      [
        orderId,
        session ? session.id : null,
        buyerName,
        v.data.phone,
        session ? session.tgUserId : null,
        session ? session.username : null,
        v.data.address,
        'Kelishilgan holda',
        v.data.comment || null,
        total,
        prepay,
        rest,
        COMMISSION_RATE,
        commissionAmount,
        payoutAmount,
      ]
    );
    for (const it of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, qty, unit_price) VALUES ($1,$2,$3,$4,$5)`,
        [orderId, it.id, it.name, it.qty, it.unitPrice]
      );
    }
    await client.query('COMMIT');

    const uShort = (u) => (u === 'rulon' ? 'rulon' : u || '');
    const itemsText = items
      .slice(0, 30)
      .map((it) => `• ${escapeHtml(it.name || '?')} — ${escapeHtml(it.qty)} ${escapeHtml(uShort(it.unit))} x ${escapeHtml(money(it.unitPrice))}`)
      .join('\n');
    const adminText = [
      '🌐 <b>Yangi buyurtma — SAYTDAN</b>',
      '',
      `<b>ID:</b> ${escapeHtml(orderId)}`,
      `<b>Xaridor:</b> ${escapeHtml(buyerName)}`,
      `<b>Telefon:</b> ${escapeHtml(v.data.phone)}`,
      session && session.username ? `<b>Telegram:</b> @${escapeHtml(session.username)}` : '',
      `<b>Manzil:</b> ${escapeHtml(v.data.address)}`,
      v.data.comment ? `<b>Izoh:</b> ${escapeHtml(v.data.comment)}` : '',
      '',
      '<b>Tarkib:</b>',
      itemsText,
      '',
      `<b>Jami:</b> ${escapeHtml(money(total))}`,
      `💰 <b>Oldindan to'lov:</b> ${escapeHtml(money(prepay))}`,
      `<b>Qolgani:</b> ${escapeHtml(money(rest))}`,
      `📊 <b>Komissiya:</b> ${escapeHtml(money(commissionAmount))} · <b>Sotuvchiga:</b> ${escapeHtml(money(payoutAmount))}`,
      // Telegram orqali kirmagan xaridor bilan bog'lanish faqat qo'ng'iroq orqali
      session
        ? "\n💬 Xaridor Telegram'da — holat o'zgarishi unga avtomatik boradi."
        : "\n☎️ Xaridor Telegram'da emas — telefon qiling.",
      `Tasdiqlash uchun: <code>/tasdiqla ${escapeHtml(orderId)}</code>`,
    ]
      .filter(Boolean)
      .join('\n');

    sendOrderNotifyMessage(adminText).catch((e) => console.error('web order notify:', e.message));

    // Telegram orqali kirgan xaridorga tasdiq xabari — endi uning ID'si bor
    if (session) {
      sendBuyerConfirmMessage(session.tgUserId, itemsText, money(total), money(prepay), money(rest))
        .catch((e) => console.error('web order buyer confirm:', e.message));
      // Telefon profilda yo'q bo'lsa — keyingi buyurtmada forma o'zi to'lsin
      pool.query(`UPDATE users SET phone = COALESCE(phone, $2) WHERE id = $1`, [session.id, v.data.phone])
        .catch((e) => console.error('users.phone yangilashda xato:', e.message));
    }

    sendJson(res, 200, { ok: true, orderId, status: 'pending', total, prepay, rest });
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    console.error('createWebOrder xatosi:', e.message);
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
      // Ochiq bahs ham qo'shiladi — sotuvchi kabinetidan javob yoza olishi kerak
      `SELECT o.id, o.status, o.created_at, o.buyer_name, o.address, o.comment,
              o.total_amount, o.prepay_amount, o.rest_amount, o.tracking_code,
              oi.product_id, oi.name AS item_name, oi.qty, oi.unit_price,
              d.id AS dispute_id, d.reason AS dispute_reason, d.seller_response
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
         LEFT JOIN LATERAL (
           SELECT id, reason, seller_response FROM disputes
            WHERE order_id = o.id AND status = 'open' LIMIT 1
         ) d ON true
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
          dispute: r.dispute_id
            ? { id: r.dispute_id, reason: r.dispute_reason, sellerResponse: r.seller_response }
            : null,
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
// Ariza yakunlangan bo'lsa true qaytaradi — chaqiruvchi shunda o'z javobini
// yubormaydi (bitta kontakt xabariga ikkita javob ketmasin).
async function handleSellerApplicationContact(msg) {
  const app = await getOpenSellerApplication(msg.from.id);
  if (!app || app.step !== 'phone') return false;
  const { rows } = await pool.query(
    `UPDATE seller_applications SET phone=$1, step='done' WHERE id=$2
     RETURNING id, business_name, city, product_type, phone, tg_username`,
    [msg.contact.phone_number, app.id]
  );
  if (!rows.length) return false;
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
  return true;
}

// Admin /sotuvchi_tasdiqla yoki /sotuvchi_rad buyrug'ini bajaradi.
async function handleSellerApplicationReview(chatId, action, appId, reason) {
  const { rows } = await pool.query(
    `SELECT id, tg_user_id, tg_username, business_name, city, phone FROM seller_applications
      WHERE id = $1 AND status = 'pending' AND step = 'done'`,
    [appId]
  );
  if (!rows.length) {
    await callTelegram('sendMessage', { chat_id: chatId, text: `❌ #${appId} ariza topilmadi yoki allaqachon ko'rib chiqilgan.` });
    throw new ClientError("ariza topilmadi yoki allaqachon ko'rib chiqilgan");
  }
  const app = rows[0];

  if (action === 'reject') {
    await pool.query(`UPDATE seller_applications SET status='rejected', reviewed_at=now() WHERE id=$1`, [app.id]);
    await callTelegram('sendMessage', { chat_id: chatId, text: `🚫 #${app.id} ariza rad etildi.` });
    await callTelegram('sendMessage', {
      chat_id: app.tg_user_id,
      text: "Afsuski, arizangiz hozircha tasdiqlanmadi." +
        (reason ? `\n\nSabab: ${reason}` : '') +
        "\n\nSavollar bo'lsa botga yozing.",
    }).catch(() => {});
    return `🚫 #${app.id} ariza rad etildi`;
  }

  // approve — foydalanuvchi hali /api/auth/telegram chaqirmagan bo'lishi mumkin
  // (Mini App'ni ochmagan), shuning uchun users'ga ham upsert qilamiz.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: userRows } = await client.query(
      // Telefon ham users'ga yoziladi — admin panelidagi sotuvchilar ro'yxati
      // uni shu yerdan oladi (ilgari faqat arizada qolib ketardi).
      `INSERT INTO users (tg_user_id, full_name, phone, role)
         VALUES ($1, $2, $3, 'seller')
         ON CONFLICT (tg_user_id) DO UPDATE
           SET role = 'seller',
               phone = COALESCE(EXCLUDED.phone, users.phone)
         RETURNING id`,
      [String(app.tg_user_id), app.business_name || app.tg_username || null, app.phone || null]
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
    throw e;
  } finally {
    client.release();
  }

  await callTelegram('sendMessage', { chat_id: chatId, text: `✅ #${app.id} — ${app.business_name || '?'} sotuvchi sifatida tasdiqlandi.` });
  await sendOpenAppMessage(
    app.tg_user_id,
    "🎉 <b>Tabriklaymiz!</b> Siz LolaMarket sotuvchisi sifatida tasdiqlandingiz.\n\nQuyidagi tugma orqali kabinetingizni oching:"
  ).catch(() => {});
  return `✅ #${app.id} — ${app.business_name || '?'} tasdiqlandi`;
}

// ---- Dalil rasmi/videosi (bahs ochilgandan keyingi bot suhbati) ----
// Xaridorning ochiq, dalil kutayotgan bahsini topadi va file_id ni qo'shadi.
// Hech qanday fayl bizning serverga yuklanmaydi.
const MAX_EVIDENCE = 10;

async function openAwaitingDispute(tgUserId) {
  const { rows } = await pool.query(
    `SELECT id, order_id, array_length(evidence_file_ids, 1) AS n
       FROM disputes
      WHERE opened_by_tg = $1 AND status='open' AND awaiting_evidence = true
      ORDER BY created_at DESC LIMIT 1`,
    [String(tgUserId)]);
  return rows[0] || null;
}

async function handleDisputeEvidence(msg) {
  // Telegram rasmni bir necha o'lchamda yuboradi — eng kattasi oxirgi element
  const fileId = msg.photo ? msg.photo[msg.photo.length - 1].file_id
    : msg.video ? msg.video.file_id
    : null;
  if (!fileId) return false;

  const d = await openAwaitingDispute(msg.from.id);
  if (!d) return false;

  if ((d.n || 0) >= MAX_EVIDENCE) {
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: `Dalil chegarasi ${MAX_EVIDENCE} ta. Yuborib bo'lgan bo'lsangiz "tayyor" deb yozing.`,
    });
    return true;
  }

  const { rows } = await pool.query(
    `UPDATE disputes SET evidence_file_ids = array_append(evidence_file_ids, $1)
      WHERE id=$2 AND status='open' RETURNING array_length(evidence_file_ids,1) AS n`,
    [fileId, d.id]);
  const n = rows.length ? rows[0].n : 0;
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    text: `✅ Qabul qilindi (${n}/${MAX_EVIDENCE}). Yana yuborishingiz mumkin yoki "tayyor" deb yozing.`,
  });
  return true;
}

// "tayyor" — dalil yig'ish tugadi, moderator ko'rib chiqishga o'tadi
async function handleDisputeEvidenceDone(msg, text) {
  if (!/^(tayyor|tayyorman|готово|done)$/i.test(text.trim())) return false;
  const d = await openAwaitingDispute(msg.from.id);
  if (!d) return false;
  await pool.query(`UPDATE disputes SET awaiting_evidence=false WHERE id=$1`, [d.id]);
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    text: "Rahmat! Moderator ko'rib chiqadi va qaror haqida xabar beramiz.",
  });
  await notify(ADMIN_CHAT_ID, `📸 Bahs #${d.id} — xaridor dalillarni yuborib bo'ldi.`);
  return true;
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

    // Admin panel so'ragan amalning tasdiq tugmasi
    if (update.callback_query) {
      await handleAdminActionCallback(update.callback_query)
        .catch((e) => console.error('adminAction callback xatosi:', e.message));
      return;
    }

    const msg = update.message;
    if (!msg || !msg.chat || msg.chat.type !== 'private') return;
    if (rateLimited(`webhook:${msg.chat.id}`, 20)) return;

    // Bahs dalili (rasm/video) — ochiq bahs bo'lsa qabul qilinadi
    if (msg.photo || msg.video) {
      await handleDisputeEvidence(msg).catch((e) => console.error('dispute evidence xatosi:', e.message));
      return;
    }

    if (msg.contact) {
      if (msg.contact.user_id && msg.from && msg.contact.user_id === msg.from.id) {
        saveContact(msg.contact.user_id, msg.contact.phone_number);
        // Telefon `users` ga ham yoziladi — saytdagi profil va checkout formasi
        // uni shu yerdan oladi (contacts.json faqat Mini App uchun edi).
        await pool.query(
          `UPDATE users SET phone = COALESCE(phone, $2) WHERE tg_user_id = $1`,
          [String(msg.from.id), msg.contact.phone_number]
        ).catch((e) => console.error('users.phone yozishda xato:', e.message));
        const usedByApplication = await handleSellerApplicationContact(msg)
          .catch((e) => { console.error('sellerApp contact xatosi:', e.message); return false; });
        // Ariza oqimi bo'lmasa — raqam saytda kirgan xaridordan kelgan
        if (!usedByApplication) {
          await callTelegram('sendMessage', {
            chat_id: msg.chat.id,
            text: "✅ Rahmat! Raqamingiz saqlandi — saytda buyurtma bersangiz forma o'zi to'ladi.",
            reply_markup: { remove_keyboard: true },
          }).catch(() => {});
        }
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

      // ---- Ochiq bahslar ro'yxati (qaror admin panelda qabul qilinadi) ----
      if (/^\/bahslar\b/i.test(text)) {
        try {
          const { rows } = await pool.query(
            `SELECT d.id, d.order_id, d.reason, d.seller_response,
                    EXTRACT(EPOCH FROM (now() - d.created_at))/3600 AS hours
               FROM disputes d WHERE d.status='open' ORDER BY d.created_at LIMIT 20`);
          if (!rows.length) {
            await callTelegram('sendMessage', { chat_id: msg.chat.id, text: "✅ Ochiq bahs yo'q." });
          } else {
            const list = rows.map((r) =>
              `• <b>#${r.id}</b> — <code>${escapeHtml(r.order_id)}</code> (${Math.floor(r.hours)} soat)\n` +
              `  ${escapeHtml(r.reason || '-')}` +
              (r.seller_response ? `\n  <i>Sotuvchi javobi bor</i>` : `\n  <i>Sotuvchi hali javob bermagan</i>`)
            ).join('\n\n');
            await callTelegram('sendMessage', {
              chat_id: msg.chat.id, parse_mode: 'HTML',
              text: `⚖️ <b>Ochiq bahslar (${rows.length})</b>\n\n${list}\n\nQaror admin panelning "Bahslar" bo'limida qabul qilinadi.`,
            });
          }
        } catch (e) {
          console.error('bahslar list xatosi:', e.message);
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

    // ---- Bahs dalili yig'ish tugadi ----
    if (await handleDisputeEvidenceDone(msg, text).catch((e) => {
      console.error('dispute done xatosi:', e.message);
      return false;
    })) return;

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
      // Saytdan kelgan kirish havolasi: /start web_<kod>
      const startParam = text.slice('/start'.length).trim();
      const loginMatch = startParam.match(/^web_([0-9a-f]{8,64})$/);
      if (loginMatch) {
        await confirmWebLoginCode(msg, loginMatch[1])
          .catch((e) => console.error('web login confirm xatosi:', e.message));
        return;
      }
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
  // Sayt sessiyasi cookie'da yuradi. Origin aniq ko'rsatilgan (`*` emas),
  // shuning uchun credentials ruxsati xavfsiz.
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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

  // ===== Saytda Telegram orqali kirish =====
  if (path === '/api/auth/web/start') {
    cors(res, 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return fail(res, 'method not allowed', 405);
    return handleWebLoginStart(req, res, ip);
  }

  if (path === '/api/auth/web/poll') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleWebLoginPoll(req, res, ip);
  }

  if (path === '/api/auth/web/me') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleWebMe(req, res, ip);
  }

  if (path === '/api/auth/web/logout') {
    cors(res, 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return fail(res, 'method not allowed', 405);
    return handleWebLogout(req, res, ip);
  }

  if (path === '/api/web/orders') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleWebMyOrders(req, res, ip);
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

  // Paneldan so'ralgan yozuv amali — Telegram'da tasdiqlanadi
  if (path === '/api/admin/action') {
    cors(res, 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'POST') return handleAdminActionRequest(req, res, ip);
    if (req.method === 'GET') return handleAdminActionStatus(req, res, ip);
    return fail(res, 'method not allowed', 405);
  }

  if (path === '/api/admin/disputes') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleAdminDisputes(req, res, ip);
  }

  // Dalil rasmi — imzolangan havola bilan (bot tokeni panelga chiqmaydi)
  if (path === '/api/admin/dispute-photo') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleDisputePhoto(req, res, ip);
  }

  if (path === '/api/disputes') {
    cors(res, 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'POST') return handleCreateDispute(req, res, ip);
    if (req.method === 'GET') return handleGetDisputes(req, res, ip);
    return fail(res, 'method not allowed', 405);
  }

  if (path === '/api/seller/dispute') {
    cors(res, 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return fail(res, 'method not allowed', 405);
    return handleSellerDisputeReply(req, res, ip);
  }

  if (path === '/api/orders') {
    cors(res, 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'POST') return handleCreateOrder(req, res, ip);
    if (req.method === 'GET') return handleGetOrders(req, res, ip);
    return fail(res, 'method not allowed', 405);
  }

  // Sayt (landing) savati — Telegram imzosisiz, telefon orqali
  if (path === '/api/web-orders') {
    cors(res, 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return fail(res, 'method not allowed', 405);
    return handleCreateWebOrder(req, res, ip);
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

// 24 soatdan oshgan hal qilinmagan bahslar uchun eslatma skaneri.
// unref() — bu taymer jarayonni tirik ushlab turmasin (to'xtatish toza bo'lsin).
setInterval(scanStaleDisputes, DISPUTE_REMINDER_MS).unref();
