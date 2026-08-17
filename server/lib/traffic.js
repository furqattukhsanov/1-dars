const crypto = require('crypto');
const { TRAFFIC_SALT } = require('../config');

// ============ TRAFIK O'LCHOVI — SOF MANTIQ (2026-08-18) ============
// Bu modulda BAZA ham, HTTP ham yo'q — faqat "kelgan qiymatni nimaga
// aylantiramiz" degan qarorlar. Sabab: aynan shu qarorlar (tashrifchi
// belgisi, ekran ro'yxati, bot filtri) panel raqamining MA'NOSINI
// belgilaydi va ular testda so'rovsiz, bazasiz sinalishi kerak.
//
// Yozuv va HTTP — `routes/track.js` da. Qatlam bir tomonga qaraydi
// (`routes/ → lib/`), CLAUDE.md dagi `web-session.js` darsi bilan bitta
// naqsh.

// ---- Hodisa turlari ----
// ⚠️ Bu ro'yxat `db/028_traffic.sql` dagi CHECK bilan HARFMA-HARF bir xil
// bo'lishi shart. Ikkita ro'yxat bo'lgani xavfli (CLAUDE.md — `to_status`
// darsi), shuning uchun ular QO'LDA emas, TEST bilan bog'langan:
// `server/test.js` → Test 42 SQL dagi CHECK ni shu massiv bilan
// solishtiradi va farq bo'lsa QIZIL bo'ladi.
const KINDS = ['view', 'cart'];
const FACES = ['web', 'miniapp'];

// ---- Ekran nomlari ----
// Ikkala yuzning O'Z nomlari bor va ular ATAYLAB birlashtirilmagan: saytdagi
// `product` bilan Mini App'dagi `detail` bitta narsa, lekin `home` faqat
// Mini App'da bor. Nomlarni "umumiy tilga" tarjima qilish jozibali ko'rinadi,
// lekin tarjima jadvali yana QO'LDA yoziladigan ikkinchi ro'yxat bo'lardi —
// panelda esa yuz bo'yicha ajratib ko'rsatish baribir kerak.
//
// 🔴 RO'YXAT KOD BILAN QULFLANGAN: `server/test.js` → Test 42 `script.js` dagi
// `drawerView = '...'` va `telegram-app/app.js` dagi `render()` xaritasidan
// ekran nomlarini O'ZI yig'adi va har biri shu yerda borligini tekshiradi.
// Ya'ni yangi ekran qo'shilib bu ro'yxat unutilsa test qizil bo'ladi.
// Aks holda yangi ekran jimgina `other` ga tushib, panelda "hech kim
// ochmagan" bo'lib ko'rinardi — o'lchov nuqsonining eng yomon turi.
const SCREENS = new Set([
  // Sayt (script.js): katalog + PDP + tortma ko'rinishlari
  'katalog', 'product',
  'address', 'cart', 'checkout', 'contact', 'dispute', 'done', 'fav',
  'info', 'login', 'orders', 'profile', 'review',
  'seller-form', 'seller-products', 'seller-orders',
  // Mini App (app.js): render() xaritasidagi kalitlar
  'home', 'ai', 'detail', 'search', 'success', 'notifications', 'saved',
  's-products', 's-orders', 's-profile', 's-form',
]);

// Ro'yxatda yo'q ekran SHU nomga tushadi. Rad etilmaydi: hodisani yo'qotish
// ("bu odam umuman kelmadi") noto'g'ri nom ("qayerdaligi noaniq")dan
// YOMONROQ. Nom drift qilib ketmasligini yuqoridagi test qo'riqlaydi.
const BOSHQA = 'other';

/* Klient yuborgan ekran nomini ro'yxatga soladi. */
function ekranNomi(raw) {
  const v = String(raw || '').trim().toLowerCase();
  return SCREENS.has(v) ? v : BOSHQA;
}

// ============ BOT FILTRI ============
// ⚠️ Bu filtr "hammasini tutaman" DEMAYDI va shunday da'vo qilinmasin:
// beacon JS bilan ishlaydi, ya'ni JS bajarmaydigan robotlar allaqachon
// hisobga tushmaydi; JS bajaradigan zamonaviy skraperlar esa o'zini brauzer
// deb ko'rsatadi va bu ro'yxat ularni ushlamaydi. Ro'yxat FAQAT o'zini
// ochiq tanitganlarni chiqarib tashlaydi — Telegram va Facebook'ning
// havola ko'rinishini tayyorlaydigan robotlari aynan shunday, va aynan
// ular bizda ko'p bo'ladi (har tashlangan havola uchun bittadan).
const BOT_UA = /bot|crawl|spider|slurp|curl|wget|python-request|headless|lighthouse|preview|facebookexternalhit|whatsapp|monitor|uptime|ahrefs|semrush|pingdom/i;

function botmi(ua) {
  return BOT_UA.test(String(ua || ''));
}

// ============ TASHRIFCHI BELGISI ============
// `sha256(ip | user-agent | sir | KUN)` ning 16 hex belgisi.
//
// 🔴 KUN HASH ICHIDA TURISHI — BU QAROR, KAMCHILIK EMAS. Uni olib tashlash
// "oylik noyob tashrifchi" degan raqamni ochib berardi, lekin o'sha zahoti
// odamni oylar bo'ylab kuzatib boradigan barqaror identifikator yaratardi.
// Bizga kerak bo'lgan savol ("bugun necha kishi keldi") kunlik belgi bilan
// ham javob oladi.
//
// ⚠️ Kun UTC bo'yicha olinadi — server vaqt mintaqasi o'zgarsa belgi ham
// o'zgarib, o'sha kuni tashrifchi soni sakrab ketardi.
function visitorBelgisi(ip, ua, kunISO) {
  const kun = kunISO || new Date().toISOString().slice(0, 10);
  return crypto.createHash('sha256')
    .update(`${ip || ''}|${ua || ''}|${TRAFFIC_SALT}|${kun}`)
    .digest('hex')
    .slice(0, 16);
}

// ============ TASHQI HAVOLA — FAQAT HOST ============
// To'liq URL ATAYLAB saqlanmaydi: qidiruv natijasidan kelgan havolada
// qidiruv so'zi, ba'zan esa shaxsiy parametrlar bo'ladi. Bizga kerakli
// javob ("qaysi sayt odam yubordi") host bilan to'liq olinadi.
//
// O'Z domenimiz `null` ga aylanadi — ichki o'tish "tashqi manba" emas.
function refHost(raw, ozDomen) {
  const v = String(raw || '').trim();
  if (!v) return null;
  let host;
  try {
    host = new URL(v).hostname.toLowerCase();
  } catch (e) {
    return null;
  }
  if (!host || host.length > 64) return null;
  const oz = String(ozDomen || '').toLowerCase();
  if (host === oz || (oz && host.endsWith(`.${oz}`))) return null;
  return host;
}

// ============ KAMPANIYA BELGISI ============
// `users.src` bilan AYNI shakl (`routes/webhook.js` → `manbaBelgisi`), ya'ni
// panel botdan kelgan kanal bilan saytdagi kanalni bitta nom ostida
// solishtira oladi. Shakl mos kelmasa ikki ro'yxat ikki xil yozilib,
// `guruh_ipak` va `guruh-ipak` alohida kanal bo'lib ko'rinardi.
function manbaBelgisi(raw) {
  const v = String(raw || '').trim().toLowerCase();
  return /^[a-z0-9_]{2,32}$/.test(v) ? v : null;
}

// ============ QAYSI YUZ ============
// Klient aytgan qiymatga EMAS, so'rovni yuborgan SAHIFAGA qaraladi:
// `Referer` — brauzer qo'yadigan sarlavha va u fetch'ni yuborgan sahifani
// ko'rsatadi. Mini App `/mini-app/` ostida yashaydi, ya'ni yuzni yo'ldan
// aniqlash mumkin.
//
// ⚠️ Bu XAVFSIZLIK chorasi emas (sarlavhani yasash mumkin) — bu XATO
// chorasi: klient tomonda bitta qatorni nusxalab, `face` ni yangilashni
// unutish oson, va u holda Mini App trafigi jimgina "sayt" bo'lib
// yozilardi. Sarlavha esa o'zi to'g'ri keladi.
//
// Sarlavha yo'q bo'lsa (ba'zi brauzerlarda `no-referrer`) klient aytgan
// qiymatga qaytiladi — u ham ro'yxatdan o'tadi.
function yuzAniqla(refererHeader, klientAytdi) {
  const v = String(refererHeader || '');
  if (v) {
    try {
      if (new URL(v).pathname.startsWith('/mini-app/')) return 'miniapp';
      return 'web';
    } catch (e) { /* buzuq sarlavha — pastdagi zaxiraga tushadi */ }
  }
  const k = String(klientAytdi || '').trim();
  return FACES.includes(k) ? k : 'web';
}

module.exports = {
  KINDS, FACES, SCREENS, BOSHQA,
  ekranNomi, botmi, visitorBelgisi, refHost, manbaBelgisi, yuzAniqla,
};
