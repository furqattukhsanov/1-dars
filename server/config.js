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

// ============ AI (Sprint 10) ============
// 2026-08-07 dan beri yagona AI funksiyasi — kiyim RASMI. Matn g'oyalari
// founder qarori bilan olib tashlandi. Pastdagi `AI_PROVIDER` / `AI_API_KEY`
// qoldi, chunki rasm ham o'sha kalit bilan ishlaydi.
// `chatId()` bilan AYNI mulohaza: qiymatning BO'SH EMASLIGI uni haqiqiy
// qilmaydi. `.env` da `AI_API_KEY=<key>` namunasi qolib ketsa, `||` uni
// haqiqiy kalit deb qabul qiladi va funksiya jimgina o'lik turaverardi —
// aynan `ALERT_CHAT_ID` bilan 2026-08-05 da bo'lgani kabi (u yerda xato
// monitoringi ikki kun o'lik turdi va buni HECH NARSA ko'rsatmadi).
//
// ⚠️ FARQI `ADMIN_CHAT_ID` DAN: bu yerda `process.exit(1)` QILINMAYDI.
// AI — ixtiyoriy funksiya; kalitsiz sayt, buyurtma va bot to'liq ishlayveradi.
// Sozlama yaroqsiz bo'lsa funksiya O'CHADI (tugma umuman chizilmaydi) va
// jurnalda qichqiriladi. To'xtash faqat ortida zaxira qolmagan sozlama uchun.

// Provayder ro'yxati SHU YERDA tug'iladi va boshqa joyda takrorlanmaydi —
// `server/lib/ai.js` shu ro'yxatga qarab yo'l tanlaydi (db/014 darsi: bir xil
// ro'yxat ikki joyda yashasa, ikkinchisini yangilash unutiladi).
const AI_PROVIDERS = new Set(['gemini', 'openai']);

// Kalit shakli. Aniq formatga (masalan `AIza…` yoki `sk-…`) BOG'LANMAYDI:
// provayderlar prefikslarini o'zgartiradi va o'shanda haqiqiy kalit rad
// etilardi. Tekshiriladigani — namuna qolib ketganini ochib beradigan
// belgilar: burchak qavslar, bo'sh joy, va aql bovar qilmas qisqalik.
function aiKey(raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  if (/[<>]/.test(v) || /\s/.test(v) || v.length < 20) {
    // Birinchi argument — alert guruhlash kaliti, o'zgaruvchan qism ikkinchida.
    // ⚠️ KALITNING O'ZI hech qachon jurnalga yozilmaydi — faqat uzunligi.
    console.error('AI_API_KEY yaroqsiz, AI funksiyasi o\'chirildi:', `uzunlik=${v.length}`);
    return '';
  }
  return v;
}

const AI_PROVIDER = (() => {
  const v = String(process.env.AI_PROVIDER || '').trim().toLowerCase();
  if (!v) return '';
  if (AI_PROVIDERS.has(v)) return v;
  console.error('AI_PROVIDER noma\'lum, AI funksiyasi o\'chirildi:', v);
  return '';
})();

const AI_API_KEY = aiKey(process.env.AI_API_KEY);

// Funksiya YOQILGANMI — chaqiruvchi kod faqat shu bayroqqa qaraydi, sozlama
// tafsilotini bilmaydi. Frontend tugmani shu qiymatga qarab chizadi.
const AI_ENABLED = !!(AI_PROVIDER && AI_API_KEY);
if (!AI_ENABLED) {
  console.error('AI funksiyasi o\'chiq — sozlama to\'liq emas:',
    `provider=${AI_PROVIDER || 'yo\'q'} key=${AI_API_KEY ? 'bor' : 'yo\'q'}`);
}

// ============ RASM MODELI (Sprint 10 ning rasm qismi, 2026-08-07) ============
// ⚠️ RASM FAQAT GEMINI YO'LIDA. `AI_PROVIDER=openai` bo'lsa rasm funksiyasi
// o'chadi — OpenAI rasm yo'li YOZILMAGAN. Buni jimgina "ishlayotgandek"
// qoldirish `lib/ai.js` dagi ogohlantirish bilan bitta oilada: abstraksiya
// borligi ikkala yo'l sinalgan degani EMAS.
//
// Model nomi `.env` dan olinadi, chunki u tez o'zgaradi
// (`gemini-2.5-flash-image` → `gemini-3.1-flash-image`) va o'zgarishi uchun
// deploy kutib o'tirmaslik kerak. Shakli tekshiriladi: model nomida faqat
// harf, raqam, nuqta va chiziqcha bo'ladi — namuna (`<model>`) shu yerda
// tutiladi, aks holda so'rov 404 bo'lib, sababi noma'lum bo'lib qolardi.
const AI_IMAGE_MODEL = (() => {
  const v = String(process.env.AI_IMAGE_MODEL || '').trim();
  if (!v) return 'gemini-2.5-flash-image';
  if (/^[a-zA-Z0-9.-]+$/.test(v)) return v;
  console.error('AI_IMAGE_MODEL yaroqsiz, zaxira model ishlatiladi:', v);
  return 'gemini-2.5-flash-image';
})();

// Generatsiya qilingan rasm SHU chatga yuboriladi va undan `file_id` olinadi
// (jadval: `product_ai_image`). Berilmasa — ADMIN_CHAT_ID, `ALERT_CHAT_ID`
// va `BACKUP_CHAT_ID` bilan AYNI naqsh.
// Alohida chat ajratish tavsiya etiladi: rasm oqimi admin chatidagi buyurtma
// xabarlarini ko'mib yubormasin.
const AI_IMAGE_CHAT_ID = chatId(process.env.AI_IMAGE_CHAT_ID, 'AI_IMAGE_CHAT_ID', ADMIN_CHAT_ID);

// Rasm tugmasi shu bayroqqa qarab chiziladi. `AI_ENABLED` ning O'ZI yetarli
// emas — matn ishlab, rasm ishlamaydigan holat HAQIQIY holat (2026-08-06 da
// aynan shunday edi: matn HTTP 200, rasm HTTP 429 `limit: 0`).
const AI_IMAGE_ENABLED = !!(AI_ENABLED && AI_PROVIDER === 'gemini');
if (AI_ENABLED && !AI_IMAGE_ENABLED) {
  console.error('AI rasm funksiyasi o\'chiq — provayder gemini emas:', AI_PROVIDER);
}

// Ro'yxatdan o'tgan foydalanuvchiga kuniga nechta YANGI generatsiya
// (keshdan o'qish limitga TEGMAYDI — Sprint 10, 4-qaror).
//
// ⚠️ ESKIRDI (2026-08-07): gating endi LOLA CREDIT bilan ketadi (pastga qara).
// Qiymat o'chirilmadi, chunki `db/016` dagi `ai_usage` jadvali va uning
// izohlari hali shu tushunchaga ishora qiladi — o'chirish ularni yolg'onga
// aylantirardi. Yangi kod uni ISHLATMAYDI.
const AI_DAILY_LIMIT = (() => {
  const v = Number(process.env.AI_DAILY_LIMIT);
  return Number.isInteger(v) && v > 0 ? v : 10;
})();

// ============ LOLA CREDIT (2026-08-07, founder qarori) ============
// "Har bir insonga 20 ta lola credit beramiz, bitta rasmga 2 credit ketadi."
//
// Kunlik limitdan farqi TUSHUNCHADA: bu — QOLDIQ (balans), har kuni
// yangilanmaydi. Ya'ni "ertaga qaytib keling" degan xabar endi YOLG'ON
// bo'lardi va u shuning uchun UI dan ham olib tashlandi.
// Qayta to'ldirish (kunlik yoki xarid orqali) hali YO'Q — kerak bo'lganda
// ataylab qo'shiladi, "bir kun o'zi tiklanadi" degan taxminga tayanilmaydi.
//
// Shakl tekshiruvi MAJBURIY (CLAUDE.md: `ALERT_CHAT_ID` darsi) — `.env` da
// namuna to'ldirilmay qolsa yoki `20 ta` deb yozilsa, `Number()` `NaN` beradi
// va u JIMGINA "cheksiz" yoki "nol" ga aylanib ketardi.
function musbatButun(raw, nom, zaxira) {
  if (raw == null || String(raw).trim() === '') return zaxira;
  const v = Number(String(raw).trim());
  if (!Number.isInteger(v) || v <= 0) {
    console.error('Sozlama yaroqsiz, zaxira ishlatildi:', `${nom}=${raw} → ${zaxira}`);
    return zaxira;
  }
  return v;
}

const AI_CREDITS_START = musbatButun(process.env.AI_CREDITS_START, 'AI_CREDITS_START', 20);
const AI_CREDIT_COST = musbatButun(process.env.AI_CREDIT_COST, 'AI_CREDIT_COST', 2);

// ⚠️ Narx boshlang'ich qoldiqdan katta bo'lsa hech kim BIRORTA ham rasm
// chiza olmaydi — funksiya jimgina o'lardi va sababi hech qayerda
// ko'rinmasdi. Shuning uchun bu holat jurnalda QICHQIRADI.
if (AI_CREDIT_COST > AI_CREDITS_START) {
  console.error('Kredit sozlamasi qarama-qarshi:',
    `AI_CREDIT_COST=${AI_CREDIT_COST} > AI_CREDITS_START=${AI_CREDITS_START} — hech kim rasm chiza olmaydi`);
}

// Cheksiz generatsiya huquqi — vergul bilan ajratilgan Telegram ID lar.
//
// ⚠️ `ADMIN_TG_IDS` dan ATAYLAB ALOHIDA. Admin ro'yxati moderatsiya haqida;
// unga qo'shilgan yangi odam JIMGINA cheksiz PUL sarflash huquqini ham
// olardi (~$0.04 har rasm). Pulga tegadigan huquq alohida va ko'rinadigan
// ro'yxatda turadi.
//
// Shakl tekshiruvi: Telegram ID — butun son. Yaroqsizi tashlanadi VA
// jurnalda qichqiradi (jimgina tashlansa, siz o'zingizni ro'yxatda deb
// o'ylab yurardingiz, aslida esa limit ostida edingiz).
const AI_UNLIMITED_TG_IDS = new Set(
  (process.env.AI_UNLIMITED_TG_IDS || '')
    .split(',').map((s) => s.trim()).filter(Boolean)
    .filter((s) => {
      if (/^-?\d+$/.test(s)) return true;
      console.error('AI_UNLIMITED_TG_IDS da yaroqsiz ID tashlandi:', s);
      return false;
    })
);

// Moderatsiya ruxsati bor Telegram ID'lari (vergul bilan ajratilgan).
// Berilmasa — ADMIN_CHAT_ID (admin shaxsiy chati = uning Telegram user id'si).
const ADMIN_TG_IDS = new Set(
  (process.env.ADMIN_TG_IDS || process.env.ADMIN_CHAT_ID || '')
    .split(',').map((s) => s.trim()).filter(Boolean)
);

// ============ R2 — fayl ombori (Cloudflare) ============
// Bugungacha rasm ombori vazifasini TELEGRAM bajarib kelgan: fayl Telegram
// serverida yotadi, bazada faqat `file_id` saqlanadi va ko'rsatishda o'z
// serverimiz uni proksi qiladi (`routes/catalog.js` → `handleProductPhoto`).
// U ishlaydi, lekin katalog rasmlarini BOT TOKENIGA bog'lab qo'yadi — token
// almashsa yoki bot bloklansa rasmlar bilan birga yo'qoladi. R2 shu
// bog'lanishni uzadi.
//
// ⚠️ AI bloki bilan AYNI mulohaza (va aynan shu sabab bilan yozilgan):
// qiymatning BO'SH EMASLIGI uni haqiqiy qilmaydi. `.env` da
// `R2_BUCKET=<bucket_nomi>` namunasi to'ldirilmay qolsa, `||` uni haqiqiy
// deb qabul qilardi va yuklash har safar jimgina yiqilardi.
//
// `process.exit(1)` QILINMAYDI: fayl ombori — ixtiyoriy funksiya, usiz
// Telegram yo'li ishlayveradi. Sozlama yaroqsiz bo'lsa funksiya O'CHADI va
// jurnalda qichqiriladi.

// Sir qiymat (kalitlar). Aniq uzunlikka BOG'LANMAYDI — `aiKey()` dagi bir xil
// mulohaza: provayder formatni o'zgartirsa haqiqiy kalit rad etilardi.
// Tekshiriladigani — namuna qolib ketganini ochib beradigan belgilar.
// ⚠️ Qiymatning O'ZI hech qachon jurnalga yozilmaydi, faqat uzunligi.
function r2Sir(raw, nom) {
  const v = String(raw || '').trim();
  if (!v) return '';
  if (/[<>]/.test(v) || /\s/.test(v) || v.length < 20) {
    console.error('R2 sozlamasi yaroqsiz, fayl ombori o\'chirildi:', `${nom} uzunlik=${v.length}`);
    return '';
  }
  return v;
}

// Account ID endpoint HOSTNAME iga qo'yiladi (`<id>.r2.cloudflarestorage.com`).
// Shuning uchun tekshiruv bu yerda qat'iy: qiyshiq qiymat so'rovni butunlay
// BOSHQA hostga yuborardi va biz uni faqat javob kelmaganidan bilardik.
function r2AccountId(raw) {
  const v = String(raw || '').trim().toLowerCase();
  if (!v) return '';
  if (!/^[a-f0-9]{20,64}$/.test(v)) {
    console.error('R2 sozlamasi yaroqsiz, fayl ombori o\'chirildi:', `R2_ACCOUNT_ID uzunlik=${v.length}`);
    return '';
  }
  return v;
}

// Bucket nomi URL YO'LIGA qo'yiladi. Tekshiruv Cloudflare'ning o'z nomlash
// qoidasi bilan bir xil (kichik harf, raqam, defis, 3–63) va bu shunchaki
// tozalik emas: tekshirilmagan nom yo'lga qo'shilsa, undagi `/` yoki `..`
// so'rovni boshqa manzilga burib yuborardi.
function r2Bucket(raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(v)) {
    console.error('R2 sozlamasi yaroqsiz, fayl ombori o\'chirildi:', `R2_BUCKET=${v}`);
    return '';
  }
  return v;
}

const R2_ACCOUNT_ID = r2AccountId(process.env.R2_ACCOUNT_ID);
const R2_ACCESS_KEY_ID = r2Sir(process.env.R2_ACCESS_KEY_ID, 'R2_ACCESS_KEY_ID');
const R2_SECRET_ACCESS_KEY = r2Sir(process.env.R2_SECRET_ACCESS_KEY, 'R2_SECRET_ACCESS_KEY');
const R2_BUCKET = r2Bucket(process.env.R2_BUCKET);

const R2_ENABLED = !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET);
const R2_ENDPOINT = R2_ENABLED ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '';

// Rasm foydalanuvchiga SHU manzil orqali beriladi (R2 custom domain).
// Yuklashdan ALOHIDA sozlama va bu ataylab: yuklash ishlashi rasmning
// ommaviy ko'rinishini bildirmaydi — domen ulanmagan bo'lishi mumkin.
// Berilmasa yuklash ishlayveradi, URL esa eski Telegram proksisidan beriladi.
//
// ⚠️ Oxiridagi `/` olib tashlanadi: aks holda kalit bilan qo'shilganda
// `//` hosil bo'lardi va u BOSHQA obyekt kaliti — 404. `lib/r2.js` dagi
// `tekshirKalit` ham `//` ni rad etadi, ya'ni nomuvofiqlik ikki joyda
// bir xil tushuniladi.
function r2PublicBase(raw) {
  const v = String(raw || '').trim().replace(/\/+$/, '');
  if (!v) return '';
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(v)) {
    console.error('R2_PUBLIC_BASE yaroqsiz, Telegram yo\'li ishlatiladi:', v);
    return '';
  }
  return v;
}

const R2_PUBLIC_BASE = r2PublicBase(process.env.R2_PUBLIC_BASE);

// ⚠️ QISMAN to'ldirilgan holat ALOHIDA qichqiradi va bu eng muhim qorovul.
// To'rttadan uchtasi qo'yilgan bo'lsa odam "qo'ydim" deb o'ylab yuradi,
// funksiya esa o'chiq turadi va buni hech narsa ko'rsatmasdi — `ALERT_CHAT_ID`
// bilan 2026-08-05 da AYNAN shu bo'lgan (monitoring ikki kun o'lik turdi).
{
  const berilgan = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET']
    .filter((n) => String(process.env[n] || '').trim() !== '').length;
  // Tekshiruvdan O'TGANLARI sanaladi, `.env` da BORLARI emas. Farqi muhim:
  // to'rttasi ham yozilgan, lekin bittasi yaroqsiz bo'lsa "chala" deyish
  // YOLG'ON bo'lardi va odam yo'q qiymatni qidirib yurardi.
  if (berilgan > 0 && !R2_ENABLED) {
    const yaroqli = [R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET]
      .filter(Boolean).length;
    console.error('R2 sozlamasi to\'liq emas — fayl ombori o\'chiq:', `yaroqli=${yaroqli}/4 (.env da ${berilgan} ta yozilgan)`);
  }
}

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
  AI_PROVIDERS, AI_PROVIDER, AI_API_KEY, AI_ENABLED, AI_DAILY_LIMIT,
  AI_CREDITS_START, AI_CREDIT_COST, AI_UNLIMITED_TG_IDS,
  AI_IMAGE_MODEL, AI_IMAGE_CHAT_ID, AI_IMAGE_ENABLED,
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
  R2_ENABLED, R2_ENDPOINT, R2_PUBLIC_BASE,
  chatId, aiKey, r2Sir, r2AccountId, r2Bucket, r2PublicBase,
};
