const fs = require('fs');
const path = require('path');

// ============ O'Z-O'ZINI TEKSHIRISH ============
// Nima uchun bu bor (2026-08-05 da tishladi): `/opt/lolamarket-notify/` papkasi
// serverdan O'CHIB KETGAN edi, lekin Node jarayoni kodni ishga tushganda
// xotiraga yuklab olgani uchun HECH NARSA sezilmadi — sayt javob berardi,
// `/api/version` to'g'ri SHA ko'rsatardi, jurnalda xato yo'q edi.
// `/proc/PID/cwd` esa `(deleted)` deb turardi. Ya'ni har qanday restart yoki
// reboot backendni butunlay o'ldirardi va uni qaytarib bo'lmasdi: kod ham,
// `.env` ham, `node_modules` ham yo'q edi. Nosozlik ~24 soat ko'rinmadi va
// uni faqat tasodifan topdik.
//
// Nega qorovul JARAYONNING O'ZIDA: papka ichidagi skript (masalan
// `pg-backup.sh`) papka bilan birga o'chadi — bugun aynan shu bo'ldi va
// kunlik zaxira ikki kun jimgina ishlamadi. Papkadan tashqaridagi skript esa
// `BOT_TOKEN` ning IKKINCHI nusxasini talab qilardi, ya'ni sirni yana bir
// joyga ko'chirish kerak bo'lardi. Jarayonning o'zi esa yangi sirsiz,
// yangi cronsiz tekshira oladi va xato mavjud alert yo'lidan o'tadi.
//
// Cheklovi ochiq aytilsin: bu FAQAT "papka yo'q, jarayon tirik" holatini
// tutadi. Jarayon o'lgan bo'lsa bu kod umuman ishlamaydi — u holat boshqacha
// ko'rinadi (sayt javob bermaydi), ya'ni jimgina emas.

const APP_ROOT = path.join(__dirname, '..');

// Restart uchun HAR BIRI shart: bittasi yo'q bo'lsa servis qayta ko'tarilmaydi.
const REQUIRED = ['server.js', 'config.js', '.env', 'node_modules'];

// Soatiga bir marta yetadi: nosozlik sekin (fayl o'chishi bir martalik hodisa),
// tekshiruvning o'zi esa bir necha `stat` chaqiruvi — narxi yo'q hisob.
const CHECK_MS = 60 * 60_000;

// Qaytaradi: yo'q bo'lgan fayllar ro'yxati (bo'sh massiv = hammasi joyida).
// Sof funksiya emas (diskka qaraydi), lekin test uni boshqa papka bilan
// chaqirib sinay oladi.
function missingFiles(root = APP_ROOT) {
  if (!fs.existsSync(root)) return ['(papkaning O\'ZI yo\'q)'];
  return REQUIRED.filter((f) => !fs.existsSync(path.join(root, f)));
}

function runCheck() {
  const missing = missingFiles();
  if (!missing.length) return true;

  // Birinchi argument QAT'IY — u alert guruhlash kaliti (Test 10c shuni
  // qo'riqlaydi). O'zgaruvchan ro'yxat ikkinchi argumentda.
  console.error(
    'JIDDIY: backend fayllari diskda yo\'q — restart bo\'lsa servis ko\'tarilmaydi.',
    missing.join(', ')
  );
  return false;
}

function install() {
  // Ishga tushganda darrov bir marta: deploy paytida buzilgan bo'lsa
  // bir soat kutmasin.
  runCheck();
  setInterval(runCheck, CHECK_MS).unref();
}

module.exports = { install, runCheck, missingFiles, REQUIRED, CHECK_MS };
