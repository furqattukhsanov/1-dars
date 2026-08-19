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

// ============ KARTA (Yandex Maps JS API) ============
// Profildagi "Mening manzilim" — xaridor doimiy BTS olish nuqtasini KARTADAN
// belgilaydi (2026-08-13 founder qarori). Karta Yandex'dan olinadi: O'zbekiston
// ko'chalari va uy raqamlari bo'yicha eng to'liq baza o'shanda.
//
// ⚠️ Bu kalit SIR EMAS — u brauzerdagi `<script src="...apikey=...">` da
// baribir ko'rinadi va Yandex uni DOMEN bo'yicha cheklaydi. Shunga qaramay
// `.env` da yashaydi va repoga yozilmaydi: shunda kalit almashtirilganda
// deploy kutilmaydi va test/production har xil kalit ishlatishi mumkin.
//
// ⚠️ SHAKL TEKSHIRILADI (`ALERT_CHAT_ID` darsi — bo'sh emaslik haqiqiylik
// EMAS). Aniq formatga (UUID) BOG'LANMAYDI, `aiKey()` bilan bitta mulohaza:
// Yandex kalit shaklini o'zgartirsa haqiqiy kalit rad etilib qolardi.
// Tutiladigani — namuna qolib ketganini ochib beradigan belgilar.
function mapsKey(raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  if (!/^[A-Za-z0-9._-]{20,120}$/.test(v)) {
    // Birinchi argument — alert guruhlash kaliti (CLAUDE.md, Test 10c).
    // ⚠️ Kalitning O'ZI jurnalga yozilmaydi — faqat uzunligi.
    console.error('YANDEX_MAPS_KEY yaroqsiz, karta o\'chirildi:', `uzunlik=${v.length}`);
    return '';
  }
  return v;
}

const YANDEX_MAPS_KEY = mapsKey(process.env.YANDEX_MAPS_KEY);

// Karta YOQILGANMI. ⚠️ Kalitsiz ham nuqta tanlash TO'LIQ ishlaydi — ro'yxat,
// qidiruv va "eng yaqinini topish" (brauzer GPS) kartaga bog'liq emas.
// O'chgani faqat kartaning O'ZI. Bu ataylab: karta tashqi xizmat, u yiqilsa
// yoki kalit tugasa xaridor manzilini o'zgartira olmay qolmasin.
const MAPS_ENABLED = !!YANDEX_MAPS_KEY;
if (!MAPS_ENABLED) {
  console.error('Karta o\'chiq — YANDEX_MAPS_KEY berilmagan:', 'nuqta ro\'yxatdan tanlanadi');
}

// ============ MAHSULOT SAHIFASI UCHUN og: META (2026-08-16) ============
// Mahsulot endi o'z manzilida yashaydi (`/mahsulot/<id>`). Telegramga havola
// tashlanganda oldindan ko'rish mato nomi va suratini ko'rsatishi uchun
// SERVER o'sha sahifaning `<head>` iga `og:` teglarini qo'yib beradi —
// buning uchun unga statik `index.html` ning joyi kerak.
//
// ⚠️ Yo'l SHAKLI bo'yicha tekshiriladi, "bo'sh emas" degani yetarli emas
// (`ALERT_CHAT_ID` darsi): papkada `index.html` HAQIQATAN turganini
// ko'ramiz. Topilmasa funksiya JIMGINA emas, QICHQIRIB o'chadi va nginx
// avvalgidek statik faylni beraveradi — ya'ni sayt ishlaydi, faqat
// oldindan ko'rish umumiy bo'lib qoladi.
function webRoot(raw) {
  const v = String(raw || '/var/www/lolamarket').trim();
  try {
    // eslint-disable-next-line global-require
    if (require('fs').existsSync(require('path').join(v, 'index.html'))) return v;
    console.error('WEB_ROOT da index.html topilmadi, og: meta o\'chirildi:', v);
  } catch (e) {
    console.error('WEB_ROOT o\'qilmadi, og: meta o\'chirildi:', e.message);
  }
  return null;
}
const WEB_ROOT = webRoot(process.env.WEB_ROOT);
const OG_ENABLED = !!WEB_ROOT;

// Havolada ko'rinadigan domen. `og:url` va `og:image` MUTLAQ bo'lishi shart —
// nisbiy manzilni Telegram ham, Facebook ham o'qimaydi.
const SITE_ORIGIN = (String(process.env.SITE_ORIGIN || 'https://lolamarket.uz').trim().replace(/\/+$/, ''));

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

// Tayyor rasm foydalanuvchining O'Z chatiga shu effekt bilan yuboriladi —
// Telegram'ning quizdagi bayram animatsiyasi (Bot API 7.4, `message_effect_id`).
// Sabab: Mini App SDK'da konfetti metodi YO'Q (2026-08-13 da jonli SDK o'qib
// tekshirildi — faqat `HapticFeedback` ning uchtasi bor), ya'ni Telegram'ning
// HAQIQIY effektiga yagona yo'l — chatga xabar yuborish.
//
// ⚠️ SHAKL TEKSHIRILADI, bo'sh emasligining o'zi yetarli emas (`ALERT_CHAT_ID`
// darsi): effekt id — o'nlik raqamlar satri. Yaroqsiz qiymat jimgina qabul
// qilinsa, Telegram HAR SAFAR rad etardi va biz buni bilmasdik.
// Bo'sh qoldirilsa effekt umuman qo'shilmaydi (rasm baribir yuboriladi).
function effectId(xom, nom) {
  const v = String(xom == null ? '' : xom).trim();
  if (!v) return null;
  if (!/^\d{5,25}$/.test(v)) {
    // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
    console.error('Yaroqsiz message_effect_id — effektsiz ishlaymiz:', `${nom}=${v}`);
    return null;
  }
  return v;
}
// 🎉 — Telegram'ning standart bayram effekti. `.env` da almashtirsa bo'ladi.
const AI_IMAGE_EFFECT_ID = effectId(
  process.env.AI_IMAGE_EFFECT_ID || '5046509860389126442', 'AI_IMAGE_EFFECT_ID');

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

// ============ SOTUVCHI KABINETIGA RUXSAT (2026-08-13, founder qarori) ======
// "Sotuvchi kabineti faqat men bergan Telegram ID orqali kirganlarda chiqsin
// — hozircha faqat menda."
//
// ⚠️ Bazadagi `users.role = 'seller'` endi YETARLI EMAS, u ikkinchi shart
// bo'lib qoldi. Sabab: rol bazada paydo bo'lishining bir nechta yo'li bor
// (ariza, qo'lda SQL, kelajakdagi avtomatik tasdiq) va ularning HAMMASINI
// eslab qolish kerak bo'lardi. Ro'yxat esa BITTA joyda va ko'rinadi —
// `db/014` darsi: ikkinchi ro'yxat himoya emas, tuzoq; bu yerda ro'yxat
// ikkinchi emas, YAGONA eshik.
//
// ⚠️ ZAXIRA ATAYLAB `ADMIN_TG_IDS` → `ADMIN_CHAT_ID`: sozlama umuman
// berilmasa kabinet founder'ning O'ZIGA ochiq qoladi, boshqa hech kimga
// emas. "Berilmasa hammaga ochiq" varianti xavfsizlik sozlamasi uchun
// noto'g'ri: e'tibordan chetda qolgan `.env` JIMGINA hammani ichkariga
// qo'yib yuborardi. Oxirgi zaxira (`ADMIN_CHAT_ID`) esa haqiqiy — u
// `chatId()` da tekshiriladi va yaroqsiz bo'lsa server ko'tarilmaydi.
//
// Shakl tekshiruvi `AI_UNLIMITED_TG_IDS` dagi bilan bir xil: Telegram ID —
// butun son, yaroqsizi tashlanadi VA jurnalda qichqiradi (jimgina tashlansa
// sotuvchi o'zini ro'yxatda deb o'ylab, kabinetni ko'rmay yurardi).
const SELLER_TG_IDS = new Set(
  (process.env.SELLER_TG_IDS || process.env.ADMIN_TG_IDS || process.env.ADMIN_CHAT_ID || '')
    .split(',').map((s) => s.trim()).filter(Boolean)
    .filter((s) => {
      if (/^-?\d+$/.test(s)) return true;
      console.error('SELLER_TG_IDS da yaroqsiz ID tashlandi:', s);
      return false;
    })
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

// ============ CLOUDFLARE CACHE PURGE (2026-08-13) ============
// Video o'chirilganda R2 dan o'chirish YETARLI EMAS: 2026-08-09 da O'LCHANGAN —
// obyekt bucket'dan ketgandan keyin ham `cdn.lolamarket.uz` uni
// `cf-cache-status: HIT` bilan berib turadi. Ya'ni "o'chirdim" degan tuyg'u
// yolg'on bo'ladi va nomaqbul video internetda qolaveradi.
//
// ⚠️ IXTIYORIY va `process.exit` QILINMAYDI (R2/AI/karta kalitlari bilan
// bitta naqsh): purge sozlanmagan bo'lsa video baribir bazadan va R2 dan
// o'chiriladi — u ilovada KO'RINMAY qoladi. Lekin bu holat YASHIRILMAYDI:
// admin tasdiq javobida "CDN keshi tozalanmadi, qo'lda purge kerak" deb
// AYTILADI. Jimgina "o'chirildi" deyish eng yomon variant bo'lardi.
function cfToken(raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  // Cloudflare API tokeni — 40 belgidan uzun, faqat harf/raqam/tire/pastki
  // chiziq. `<token>` kabi to'ldirilmagan namuna shu yerda ushlanadi
  // (`ALERT_CHAT_ID` darsi: bo'sh emasligi haqiqiy qilmaydi).
  if (!/^[A-Za-z0-9_-]{30,}$/.test(v)) {
    console.error('CF_API_TOKEN yaroqsiz, CDN purge o\'chiq: uzunlik=' + v.length);
    return '';
  }
  return v;
}
function cfZone(raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  if (!/^[a-f0-9]{32}$/i.test(v)) {
    console.error('CF_ZONE_ID yaroqsiz, CDN purge o\'chiq: uzunlik=' + v.length);
    return '';
  }
  return v;
}
// ============ CLOUDFLARE WEB ANALYTICS (2026-08-19) ============
// Panelga «tashrif» raqamlarini olib keladi. ⚠️ Bu bizning `traffic_events`
// ni ALMASHTIRMAYDI — u boshqa savolga javob beradi (CLAUDE.md): Cloudflare
// necha kishi kelganini biladi, biz esa QAYSI MATO ko'rilganini. Ikkalasi
// panelda YONMA-YON qo'yilmaydi — mos kelmagan ikki raqam «biri buzuq»
// degan yolg'on xulosa beradi.
//
// ⚠️ Token PURGE tokenidan ALOHIDA: purge uchun `Zone.Cache Purge`, bu yerda
// `Account Analytics: Read` kerak. Bitta tokenga ikkalasini yig'ish mumkin
// edi, lekin alohida bo'lgani yaxshiroq — biri o'g'irlansa ikkinchisi
// o'z ishini davom ettiradi va ruxsat doirasi tor qoladi.
//
// ⚠️ IXTIYORIY, `process.exit` QILINMAYDI (R2/AI/karta naqshi): sozlanmagan
// bo'lsa panel Cloudflare blokini UMUMAN chizmaydi — nol ko'rsatmaydi.
const CF_ANALYTICS_TOKEN = cfToken(process.env.CF_ANALYTICS_TOKEN);

// Account va sayt belgisi — ikkalasi ham 32 ta hex. `cfZone` AYNI shaklni
// tekshiradi, shuning uchun qayta ishlatiladi (ikkinchi nusxa yozilmaydi).
const CF_ACCOUNT_ID = cfZone(process.env.CF_ACCOUNT_ID);

// 🔴 `CF_SITE_TAG` — beacon skriptidagi `token` EMAS. 2026-08-19 da o'lchandi:
// sahifadagi `data-cf-beacon` da `6acaeab5…` turadi, GraphQL esa `0d0ad786…`
// ni kutadi. Beacon qiymati bilan so'ralganda javob XATOSIZ, lekin BO'SH
// keladi — ya'ni panel «hech kim kelmadi» deb turardi. Bizning eng qimmat
// xato turimiz: raqam yo'q emas, YOLG'ON. To'g'ri qiymat GraphQL javobidagi
// `siteTag` o'lchovidan olinadi.
const CF_SITE_TAG = cfZone(process.env.CF_SITE_TAG);

const CF_ANALYTICS_ENABLED = !!(CF_ANALYTICS_TOKEN && CF_ACCOUNT_ID && CF_SITE_TAG);

// Qisman to'ldirilgan holat — purge va R2 dagi bilan AYNI qorovul.
{
  const berilgan = ['CF_ANALYTICS_TOKEN', 'CF_ACCOUNT_ID', 'CF_SITE_TAG']
    .filter((n) => String(process.env[n] || '').trim() !== '').length;
  if (berilgan > 0 && !CF_ANALYTICS_ENABLED) {
    console.error('Cloudflare analitika sozlamasi to\'liq emas — panelda blok chizilmaydi:',
      `yaroqli=${[CF_ANALYTICS_TOKEN, CF_ACCOUNT_ID, CF_SITE_TAG].filter(Boolean).length}/3 (.env da ${berilgan} ta yozilgan)`);
  }
}

const CF_API_TOKEN = cfToken(process.env.CF_API_TOKEN);
const CF_ZONE_ID = cfZone(process.env.CF_ZONE_ID);
const CF_PURGE_ENABLED = !!(CF_API_TOKEN && CF_ZONE_ID);

// Qisman to'ldirilgan holat — R2 dagi bilan AYNI qorovul.
{
  const berilgan = ['CF_API_TOKEN', 'CF_ZONE_ID']
    .filter((n) => String(process.env[n] || '').trim() !== '').length;
  if (berilgan > 0 && !CF_PURGE_ENABLED) {
    console.error('Cloudflare purge sozlamasi to\'liq emas — CDN keshi tozalanmaydi:',
      `yaroqli=${[CF_API_TOKEN, CF_ZONE_ID].filter(Boolean).length}/2 (.env da ${berilgan} ta yozilgan)`);
  }
}

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

// ============ TRAFIK O'LCHOVI UCHUN SIR (2026-08-18) ============
// `db/028` dagi `traffic_events.visitor` — `sha256(ip|user-agent|SIR|KUN)`.
// SIR shu yerdan keladi va uning YAGONA vazifasi: bazani ko'rgan odam
// ma'lum IP ni HISOBLAB topa olmasin. Sirsiz hash foydasiz bo'lardi —
// O'zbekistondagi IP fazosi kichik, ya'ni hammasini birma-bir hash qilib
// solishtirish arzon ish (rainbow table).
//
// ⚠️ IXTIYORIY va `process.exit` QILINMAYDI (R2/AI/karta bilan bitta naqsh):
// berilmasa BOT_TOKEN dan hosila olinadi. Zaxira ATAYLAB bor — sir yo'qligi
// trafik o'lchovini butunlay o'chirib qo'yса, funksiya jimgina o'lik turardi
// va buni hech narsa ko'rsatmasdi (`ALERT_CHAT_ID` darsi).
//
// ⚠️ ZAXIRANING NARXI AYTILADI: BOT_TOKEN almashtirilsa (2026-08-13 da bir
// marta bo'lgan) hosila ham o'zgaradi va O'SHA KUNGI tashrifchi soni bir oz
// oshib ketadi — bitta odam token almashuvidan oldin va keyin ikki xil belgi
// oladi. "Ko'rishlar" soniga TEGMAYDI. Shuning uchun `.env` da o'z qiymatini
// qo'yish afzal: `TRAFFIC_SALT=$(openssl rand -hex 32)`.
function trafficSalt(raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  // Kamida 16 belgi — kaliti kalta sir sirning o'zi emas. Yuqori chegara
  // yo'q. Shakl tor emas: bu qiymat hech qayerga yuborilmaydi, faqat hash
  // ichiga kiradi, ya'ni belgilar to'plami muhim emas — UZUNLIGI muhim.
  if (v.length < 16) {
    // Birinchi argument — alert guruhlash kaliti (CLAUDE.md, Test 10c).
    // Sirning O'ZI jurnalga chiqmaydi — faqat uzunligi.
    console.error('TRAFFIC_SALT juda kalta, BOT_TOKEN hosilasiga qaytildi:', `uzunlik=${v.length}`);
    return '';
  }
  return v;
}
const TRAFFIC_SALT = trafficSalt(process.env.TRAFFIC_SALT)
  || require('crypto').createHash('sha256').update(`lolamarket-traffic|${BOT_TOKEN}`).digest('hex');

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
  MINI_APP_URL, BOT_USERNAME, GIT_SHA, ALERT_CHAT_ID,
  ADMIN_PANEL_TOKEN, PREPAY_RATE, COMMISSION_RATE, ADMIN_TG_IDS, SELLER_TG_IDS, DELIVERY_FEE_ESTIMATE,
  AI_PROVIDERS, AI_PROVIDER, AI_API_KEY, AI_ENABLED, AI_DAILY_LIMIT,
  AI_CREDITS_START, AI_CREDIT_COST, AI_UNLIMITED_TG_IDS,
  AI_IMAGE_MODEL, AI_IMAGE_CHAT_ID, AI_IMAGE_ENABLED, AI_IMAGE_EFFECT_ID,
  CF_API_TOKEN, CF_ZONE_ID, CF_PURGE_ENABLED,
  CF_ANALYTICS_TOKEN, CF_ACCOUNT_ID, CF_SITE_TAG, CF_ANALYTICS_ENABLED,
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
  R2_ENABLED, R2_ENDPOINT, R2_PUBLIC_BASE,
  YANDEX_MAPS_KEY, MAPS_ENABLED,
  WEB_ROOT, OG_ENABLED, SITE_ORIGIN,
  chatId, aiKey, mapsKey, r2Sir, r2AccountId, r2Bucket, r2PublicBase, webRoot,
};
