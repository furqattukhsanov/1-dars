const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============ SOZLAMALAR ============
// Barcha sirlar va biznes doimiylari shu yerda — bitta joyda ko'rinadi.
// Sirlar faqat .env dan keladi, repoga hech qachon yozilmaydi.

const PORT = process.env.PORT || 3001;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://lolamarket.uz';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://lolamarket.uz/mini-app/';
// Saytdagi "Telegram orqali kirish" tugmasi shu botga deep-link yasaydi.
const BOT_USERNAME = (process.env.BOT_USERNAME || 'lolamarketbot').replace(/^@/, '');
const CONTACTS_FILE = __dirname + '/contacts.json';

// Server versiyasi — deploy diagnozida "serverda qaysi kod turibdi" savoliga javob.
//
// MUHIM: production'da git YO'Q — kod `git archive` bilan ko'chiriladi va
// /opt/lolamarket-notify git repo emas. Shuning uchun `git rev-parse` u yerda
// har doim muvaffaqiyatsiz bo'ladi va "unknown" qaytaradi (2026-07-30 da aynan
// shu bo'ldi: endpoint ishladi, lekin foydasiz javob berdi).
//
// To'g'ri yo'l: versiya DEPLOY paytida version.txt ga yoziladi va shu yerdan
// o'qiladi. Git faqat lokal ishlab chiqish uchun zaxira variant.
function readVersion() {
  try {
    const v = fs.readFileSync(path.join(__dirname, 'version.txt'), 'utf8').trim();
    if (v) return v;
  } catch (_) { /* fayl yo'q — lokal ishlab chiqish bo'lishi mumkin */ }

  try {
    return execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() || 'unknown';
  } catch (_) {
    return 'unknown';
  }
}

const GIT_SHA = readVersion();

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
// PRD §4: stavka 12% (2026-08-02 founder qarori — ilgari 10% edi;
// o'sha kuni eski buyurtmalar ham db/013_commission_12.sql bilan
// 12% ga qayta hisoblandi, ya'ni bazada endi bitta stavka).
const COMMISSION_RATE = (() => {
  const v = Number(process.env.COMMISSION_RATE);
  return Number.isFinite(v) && v >= 0 && v < 1 ? v : 0.12;
})();

// Logistika (BTS Pochta) taxminiy narxi. BTS API ulanmagan (Sprint 6),
// shuning uchun manzilga qarab dinamik hisoblanmaydi — butun platformaga
// BITTA taxminiy summa, xuddi COMMISSION_RATE kabi. PRD: logistikani
// xaridor to'laydi — bu summa BTS nuqtasida TO'G'RIDAN-TO'G'RI BTS'ga
// to'lanadi, platforma escrow'iga (prepay/rest) kirmaydi, faqat xulosada
// ko'rsatish va buyurtmada saqlash uchun. Buyurtma yaratilganda
// orders.delivery_fee_estimate ga snapshot qilinadi — keyin bu qiymat
// o'zgarsa eski buyurtmalar ko'rsatkichi buzilmasin.
const DELIVERY_FEE_ESTIMATE = (() => {
  const v = Number(process.env.DELIVERY_FEE_ESTIMATE);
  return Number.isFinite(v) && v >= 0 ? v : 25000;
})();

// Telegram chat_id HAR DOIM butun son (guruhlarniki manfiy). Boshqa har qanday
// qiymat — ayniqsa `.env` da to'ldirilmay qolgan `<chat_id>` kabi namuna —
// JIMGINA qabul qilinmaydi.
//
// Sabab (2026-08-05 da aynan shu tishladi): `.env` da `ALERT_CHAT_ID=<chat_id>`
// turardi. U bo'sh EMAS, shuning uchun pastdagi `||` zaxirasi uni haqiqiy
// qiymat deb qabul qildi va alertlar mavjud bo'lmagan chatga ketaverdi.
// `sendAlert` xatoni ataylab yutgani uchun jurnalda ham iz qolmadi —
// xato monitoringi ikki kun o'lik turdi va buni HECH NARSA ko'rsatmadi.
// Endi yaroqsiz qiymat zaxiraga qaytadi VA jurnalda qichqiradi.
function chatId(raw, name, fallback) {
  const v = String(raw || '').trim();
  if (!v) return fallback;
  if (/^-?\d+$/.test(v)) return v;
  // Birinchi argument — alert guruhlash kaliti, o'zgaruvchan qism ikkinchida.
  console.error('Chat ID yaroqsiz, zaxira qiymat ishlatiladi:', name, v);
  return fallback;
}

// Server xatolari haqidagi alertlar shu chatga boradi. Berilmasa —
// ADMIN_CHAT_ID (zaxira nusxadagi BACKUP_CHAT_ID bilan bir xil naqsh).
// Alohida chat ajratish tavsiya etiladi: alert oqimi buyurtma xabarlarini
// ko'mib yubormasin.
const ALERT_CHAT_ID = chatId(process.env.ALERT_CHAT_ID, 'ALERT_CHAT_ID', ADMIN_CHAT_ID);

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
// ADMIN_CHAT_ID — hamma narsaning oxirgi zaxirasi (alert, moderatsiya, backup),
// shuning uchun uning yaroqsizligi ogohlantirish emas, TO'XTASH sababi:
// zaxiraning zaxirasi yo'q. Yuqoridagi `chatId()` izohiga qara.
if (!/^-?\d+$/.test(String(ADMIN_CHAT_ID).trim())) {
  console.error('ADMIN_CHAT_ID butun son emas — .env da namuna to\'ldirilmay qolganmi?');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL .env da topilmadi');
  process.exit(1);
}

module.exports = {
  PORT, BOT_TOKEN, ADMIN_CHAT_ID, ALLOWED_ORIGIN, WEBHOOK_SECRET,
  MINI_APP_URL, BOT_USERNAME, CONTACTS_FILE, GIT_SHA, ALERT_CHAT_ID,
  ADMIN_PANEL_TOKEN, PREPAY_RATE, COMMISSION_RATE, ADMIN_TG_IDS, DELIVERY_FEE_ESTIMATE,
  chatId,
};
