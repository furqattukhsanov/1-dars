const crypto = require('crypto');

// ============ FORMATLASH VA KRIPTO YORDAMCHILARI ============
// Sof funksiyalar — hech qanday holatga yoki tashqi resursga bog'liq emas.

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

function sha256(s) {
  return crypto.createHash('sha256').update(String(s)).digest('hex');
}

function randHex(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = { escapeHtml, safeEqual, money, MONTHS, dateLabel, sha256, randHex };
