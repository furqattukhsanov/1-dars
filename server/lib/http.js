const { ALLOWED_ORIGIN } = require('../config');

// ============ HTTP YORDAMCHILARI ============

// ---- Tezlik cheklovi (rate limit) ----
const hits = new Map();

function rateLimited(key, max = 10) {
  const now = Date.now();
  const windowMs = 60_000;
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

// Rate limit Map tozalash — xotira oqishi uchun. Hali keladigan so'rovlar ham
// filtrladi hisoblanadi (windowMs ichida), shuning uchun tozalash xavfsiz.
setInterval(() => {
  for (const [key, arr] of hits.entries()) {
    if (arr.length === 0) hits.delete(key);
  }
}, 5 * 60 * 1000).unref();

// Ogohlantirish faqat bir marta chiqsin — har so'rovda yozilsa, nginx noto'g'ri
// sozlangan holatda log to'lib ketadi (nosozlikning o'zi esa doimiy).
let warnedNoRealIp = false;

function clientIp(req) {
  // Nginx'dan X-Real-IP: server konfiguratsiyasida proxy_set_header X-Real-IP $remote_addr;
  // bo'lishi kerak. Aks holda, Cloudflare orqasidagi hamma foydalanuvchi 127.0.0.1 bo'ladi
  // va rate limit hammani birga bloklaydi — nosozlik jimgina keladi.
  const fwd = req.headers['x-real-ip'] || (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = fwd || req.socket.remoteAddress;
  if (!fwd && !warnedNoRealIp && req.socket.remoteAddress === '127.0.0.1') {
    warnedNoRealIp = true;
    console.warn('⚠️  X-Real-IP header yo\'q — nginx proxy_set_header tekshirilsin (bu ogohlantirish bir marta chiqadi)');
  }
  return ip;
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

function cors(res, methods) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Telegram-Init-Data, X-Admin-Token');
  // Sayt sessiyasi cookie'da yuradi. Origin aniq ko'rsatilgan (`*` emas),
  // shuning uchun credentials ruxsati xavfsiz.
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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

module.exports = { rateLimited, clientIp, readBody, sendJson, ok, fail, cors, parseCookies };
