// ============ LOLAMARKET API — ROUTER ============
// Bu fayl faqat yo'naltiradi: qaysi yo'l qaysi modulga tegishli.
// Biznes mantiq routes/ ichida, umumiy yordamchilar lib/ ichida.

const http = require('http');

const { PORT, GIT_SHA } = require('./config');
const { clientIp, ok, fail, cors } = require('./lib/http');

// ---- Domen modullari ----
const {
  handleWebLoginStart, handleWebLoginPoll, handleWebMe, handleWebLogout,
  handleWebMyOrders,
} = require('./routes/web-auth');
const {
  handleAdminSummary, handleAdminActionRequest, handleAdminActionStatus,
  handleAdminTraffic,
} = require('./routes/admin');
const { handleTrack } = require('./routes/track');
const {
  handleCreateDispute, handleGetDisputes, handleSellerDisputeReply,
  handleAdminDisputes, handleDisputePhoto, scanStaleDisputes, DISPUTE_REMINDER_MS,
} = require('./routes/disputes');
const {
  handleMe, handleSellerProducts, handleSellerProductUpdate,
  handleSellerOrders, handleSellerOrderAction,
} = require('./routes/seller');
const { handleSavePickupPoint, handleMyPhoto, handleGetFavorites, handleSaveFavorite } = require('./routes/profile');
const {
  handleCreateOrder, handleCreateWebOrder, handleGetOrders,
  handleOrderNotify, handleOrderStatus,
} = require('./routes/orders');
const {
  handleAuthTelegram, handleGetProducts, handleSubmitProduct,
  handleModerationList, handleModerationAction, handleProductPhoto,
} = require('./routes/catalog');
const {
  handleCreateReview, handleGetReviews, handleSellerReviews,
} = require('./routes/reviews');
const { handleAiImage, handleAiGallery, handleAiMy } = require('./routes/ai');
const { handleTelegramWebhook } = require('./routes/webhook');
const { handleProductPage } = require('./routes/pdp');
const { OG_ENABLED } = require('./config');


function routeRequest(req, res) {
  const ip = clientIp(req);
  const path = req.url.split('?')[0];

  /* Mahsulot sahifasi — `og:` teglari bilan (2026-08-16).
     ⚠️ Bu YO'L `/api/` ostida EMAS, ya'ni u faqat nginx uni shu yerga
     yo'naltirganda keladi. Yo'naltirilmasa — nginx statik `index.html` ni
     beraveradi va sayt to'liq ishlaydi, faqat oldindan ko'rish umumiy
     bo'ladi (`routes/pdp.js` bandiga qara). `OG_ENABLED` yolg'on bo'lsa
     (statik papka topilmadi) route umuman qatnashmaydi. */
  if (OG_ENABLED && req.method === 'GET' && path.indexOf('/mahsulot/') === 0) {
    handleProductPage(req, res, ip, path);
    return;
  }

  // Versiyani tekshirish — deploy diagnozida serverda qaysi kod turgani bilish uchun
  if (path === '/api/version') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return ok(res, { version: GIT_SHA });
  }

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

  /* Trafik hodisasi — ANONIM va ATAYLAB kimliksiz (`routes/track.js` izohi).
     Sayt ham, Mini App ham shu yerga yozadi; javob kutilmaydi. */
  if (path === '/api/track') {
    cors(res, 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return fail(res, 'method not allowed', 405);
    return handleTrack(req, res, ip);
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

  /* Trafik statistikasi — `summary` dan ALOHIDA. Sabab: u vaqt oralig'i
     bilan so'raladi (`?days=`) va og'irroq, `summary` esa panel har
     ochilganda va har amaldan keyin qayta yuklanadi. Bittaga qo'shilsa
     panelning eng issiq so'rovi sekinlashardi. */
  if (path === '/api/admin/traffic') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleAdminTraffic(req, res, ip);
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

  // Sharhlar: GET ommaviy (mahsulot kartochkasi uchun), POST — faqat o'z
  // yetkazilgan buyurtmasi bo'yicha
  if (path === '/api/reviews') {
    cors(res, 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET') return handleGetReviews(req, res, ip);
    if (req.method === 'POST') return handleCreateReview(req, res, ip);
    return fail(res, 'method not allowed', 405);
  }

  // AI kiyim RASMI (2026-08-07). POST — g'oyalar bilan AYNI sabab: bu YOZUV
  // amali (kesh va kunlik limit yoziladi) va Cloudflare uni keshlab
  // qo'ymasligi kerak.
  // AI galereyasi — pastki paneldagi AI bo'limi shundan oziqlanadi.
  // FAQAT O'QISH: bu yerda hech narsa generatsiya qilinmaydi.
  if (path === '/api/ai/gallery') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleAiGallery(req, res, ip);
  }

  // "Mening rasmlarim" + kredit qoldig'i. GET, lekin IMZO SHART — bu shaxsiy
  // ma'lumot (galereyadan farqi shu: u ochiq va umumiy).
  if (path === '/api/ai/my') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleAiMy(req, res, ip);
  }

  if (path === '/api/ai/image') {
    cors(res, 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return fail(res, 'method not allowed', 405);
    return handleAiImage(req, res, ip);
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

  // Profil surati — Telegram avatari (2026-08-13). Baytlar PROKSI qilinadi,
  // Telegram manzili qaytarilmaydi: u yerda bot tokeni turadi.
  if (path === '/api/me/photo') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleMyPhoto(req, res, ip);
  }

  // Profildagi "Mening manzilim" — doimiy BTS olish nuqtasi. O'QISH
  // `/api/me` da (qo'shimcha so'rov qilinmasin), YOZUV shu yerda.
  if (path === '/api/pickup-point') {
    cors(res, 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'POST') return fail(res, 'method not allowed', 405);
    return handleSavePickupPoint(req, res, ip);
  }

  // Sevimli matolar (♡). O'QISH `/api/me` ga QO'SHILMADI va bu ataylab:
  // ro'yxat o'nlab id bo'lishi mumkin, `/api/me` esa har profil ochilishida
  // chaqiriladi — ikkalasi bitta so'rovga solinsa profil ekrani sevimlilar
  // uzunligiga bog'liq bo'lib qolardi (`db/026`).
  if (path === '/api/favorites') {
    cors(res, 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET') return handleGetFavorites(req, res, ip);
    if (req.method === 'POST') return handleSaveFavorite(req, res, ip);
    return fail(res, 'method not allowed', 405);
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

  // Sotuvchi o'z reytingi va sharhlarini ko'radi (PRD story №15)
  if (path === '/api/seller/reviews') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleSellerReviews(req, res, ip);
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

  // Mahsulot rasmi — ommaviy, imzolangan havola bilan (bot tokeni chiqmaydi)
  if (path === '/api/product-photo') {
    cors(res, 'GET, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method !== 'GET') return fail(res, 'method not allowed', 405);
    return handleProductPhoto(req, res, ip);
  }

  /* ⚠️ `/api/telegram-contact?uid=` OLIB TASHLANDI (2026-08-16) va QAYTIB
     KELMASIN. U kimlikni BRAUZERDAN olardi: so'rovda kelgan `uid` bo'yicha
     to'g'ridan-to'g'ri telefon raqami qaytarardi, hech qanday imzo yoki
     sessiya tekshirmasdan. Telegram ID esa sir emas (guruhdagi xabar,
     forward, `@userinfobot`), ya'ni istalgan odam istalgan foydalanuvchining
     raqamini o'qiy olardi. Bu CLAUDE.md ning eng tepasidagi qoidaning
     to'g'ridan-to'g'ri buzilishi: "Klient yuborgan `tg_user_id` ga
     ishonadigan endpoint qo'shilmasin".
     Raqam endi `/api/me` da — kimlik `requestUser()` dan, manba esa
     `users.phone` (sayt ham AYNI ustundan o'qiydi). Qorovul: Test 36. */

  if (path === '/api/telegram-webhook' && req.method === 'POST') {
    return handleTelegramWebhook(req, res);
  }

  fail(res, 'not found', 404);
}

// ---- Qulagan so'rov butun serverni o'ldirmasin ----
// To'qqizta handler `try` blokiga KIRISHDAN OLDIN `await` qiladi (auth
// tekshiruvi: authUser / requireSeller / webSessionUser — ular bazaga boradi).
// Baza o'sha lahzada javob bermasa, rad etilgan promise hech kim ushlamaydi:
// Node buni `unhandledRejection` deb biladi va JARAYONNI O'LDIRADI — ya'ni
// bitta so'rovdagi baza uzilishi o'sha paytdagi BARCHA so'rovlarni yiqitardi.
// Shu o'ram xatoni so'rov chegarasida to'xtatadi: qulagan so'rov 500 oladi,
// qolganlari ishlayveradi. Xato `console.error` ga tushadi, ya'ni alertga ham.
function handleRequest(req, res) {
  let out;
  try {
    out = routeRequest(req, res);
  } catch (e) {
    return requestCrashed(req, res, e);
  }
  if (out && typeof out.then === 'function') {
    out.catch((e) => requestCrashed(req, res, e));
  }
}

function requestCrashed(req, res, e) {
  const path = String(req.url || '').split('?')[0];
  // Belgi QAT'IY, yo'l esa ikkinchi argumentda: birinchi argument alert
  // guruhlash kaliti va unga yo'l qo'yilsa har endpoint ALOHIDA alert bo'lardi
  // (bitta nosozlik ~26 xil kalit) — bosish tomi aynan shu yerda ishlamay
  // qolardi. 2026-08-05 da topildi, qoida esa 2026-08-03 da yozilgan edi.
  console.error('so\'rov qulashi:', `${req.method} ${path}`, (e && e.message) || e);
  // Handler javobni allaqachon boshlagan bo'lishi mumkin — u holda status
  // qo'yib bo'lmaydi, faqat ulanishni yopamiz (aks holda klient osilib qoladi).
  try {
    if (res.headersSent) res.end();
    else fail(res, 'server error', 500);
  } catch (_) { /* javob yozib bo'lmadi — ulanish allaqachon uzilgan */ }
}

// Faqat to'g'ridan-to'g'ri ishga tushirilganda tinglaymiz — `require` qilinganda
// (test.js) tinglamaydi, shunda testlar port band qilmasdan router'ni sinaydi.
if (require.main === module) {
  // Xato alertlari FAQAT shu yerda o'rnatiladi: u console.error'ni o'raydi,
  // testlar esa console.error'ni o'zi ushlaydi (test.js → testNoBrokenReferences).
  require('./lib/alert').install();

  // Alertdan KEYIN: qorovul xatosi alert yo'liga tushishi kerak, aks holda
  // u faqat jurnalga yozilib jimgina qolardi — aynan qorovul qo'riqlayotgan
  // nosozlikning o'zi kabi.
  require('./lib/self-check').install();

  http.createServer(handleRequest)
    .listen(PORT, '127.0.0.1', () => console.log(`lolamarket-notify listening on ${PORT}`));

  // Bot chatidagi "Ochish" menyu tugmasi — Mini App'ga kirish nuqtasi
  // (founder, 2026-08-13). Ishga tushishga BOG'LANGAN, chunki qo'lda
  // bajariladigan qadam unutiladi: `BOT_TOKEN` almashtirilganda bu sozlama
  // ham nolga qaytadi (webhook bilan ayni tuzoq).
  //
  // ⚠️ Serverni USHLAB TURMAYDI: tugma ro'yxatdan o'tmasa ham sayt va
  // buyurtmalar ishlashi kerak. Xato `registerMenuButton` ichida alertga
  // chiqadi; `catch` bu yerda faqat tarmoq uzilishi uchun.
  require('./lib/telegram-api').registerMenuButton().catch((e) => {
    // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
    console.error('menyu tugmasi ro\'yxatdan o\'tmadi:', e.message);
  });

  // 24 soatdan oshgan hal qilinmagan bahslar uchun eslatma skaneri.
  // unref() — bu taymer jarayonni tirik ushlab turmasin (to'xtatish toza bo'lsin).
  setInterval(scanStaleDisputes, DISPUTE_REMINDER_MS).unref();
}

module.exports = { handleRequest, routeRequest };
