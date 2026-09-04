// ============ STATIK KATALOG RASMI → WEBP (2026-09-05) ============
// Katalogning uch pog'onali rasm zanjirida (R2 → Telegram proksi → statik)
// OXIRGI pog'ona uchun webp variantini tanlaydi: `assets/products/x.jpg`
// yonida `x.webp` YOTGAN bo'lsa, yo'l webp'ga almashtiriladi.
//
// ⚠️ RO'YXAT QO'LDA YOZILMAYDI — diskdagi papka bir marta o'qiladi va
// haqiqat manbai FAYLNING O'ZI: webp'si yo'q rasm (masalan textile-04,
// unda webp jpg'dan atigi 5% kichik chiqqani uchun ATAYLAB yasalmagan)
// jpg'ligicha qoladi. Shu tufayli "webp bor deb yuborib, 404 chizish"
// holati bo'lishi mumkin emas — bu jimgina yolg'on oilasidan qochish.
//
// ⚠️ FAQAT `assets/products/` yo'llari qamraladi. R2 URL, Telegram proksi
// va sotuvchi yuklagan boshqa yo'llar bu funksiyaga umuman kirmaydi
// (chaqiruvchi tomonda uch pog'onaning faqat oxirgisiga qo'llanadi).
//
// WEB_ROOT berilmagan muhitda (lokal test) papka o'qilmaydi va funksiya
// no-op bo'ladi — ixtiyoriy funksiya serverni o'ldirmaydi (Yandex kaliti
// va AI kaliti bilan bitta naqsh).

const fs = require('fs');
const path = require('path');
const { WEB_ROOT } = require('../config');

const STATIK_RE = /^assets\/products\/([^/]+)\.(jpe?g|png)$/i;

// Lazy: birinchi chaqiruvda to'ldiriladi va JARAYON UMRI davomida turadi.
// ⚠️ Demak yangi webp fayl qo'shilsa u faqat backend RESTARTdan keyin
// ko'rinadi — deploy tartibi: avval statik CI (webp fayllar joyiga tushsin),
// KEYIN backend restart. Teskari tartibda ro'yxat bo'sh o'qilib, jpg
// tarqalaverardi (buzilish emas, lekin yutuq restartgacha kechikardi).
let webpSet = null;

function webpNomlar(dir) {
  try {
    return new Set(
      fs.readdirSync(dir)
        .filter((f) => f.toLowerCase().endsWith('.webp'))
        .map((f) => f.slice(0, -'.webp'.length))
    );
  } catch (_) {
    return new Set(); // papka yo'q/o'qilmadi → no-op, xato emas
  }
}

/** `assets/products/x.jpg` → `assets/products/x.webp` (fayl diskda bo'lsa).
 *  `dirOverride` — testlar uchun aniq papka (global keshga tegilmaydi).
 *  Ikkala rejim ham AYNI tanlov kodidan o'tadi — tarmoq ikkiga bo'linsa
 *  testlar faqat bitta tarmoqni sinab, ikkinchisi qorovulsiz qolardi. */
function statikWebp(img, dirOverride) {
  if (typeof img !== 'string') return img;
  const m = STATIK_RE.exec(img);
  if (!m) return img;
  let nomlar;
  if (dirOverride) {
    nomlar = webpNomlar(dirOverride);
  } else {
    if (webpSet === null) {
      webpSet = WEB_ROOT
        ? webpNomlar(path.join(WEB_ROOT, 'mini-app', 'assets', 'products'))
        : new Set();
    }
    nomlar = webpSet;
  }
  return nomlar.has(m[1]) ? `assets/products/${m[1]}.webp` : img;
}

module.exports = { statikWebp };
