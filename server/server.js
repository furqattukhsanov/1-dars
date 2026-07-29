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
} = require('./routes/admin');
const {
  handleCreateDispute, handleGetDisputes, handleSellerDisputeReply,
  handleAdminDisputes, handleDisputePhoto, scanStaleDisputes, DISPUTE_REMINDER_MS,
} = require('./routes/disputes');
const {
  handleMe, handleSellerProducts, handleSellerProductUpdate,
  handleSellerOrders, handleSellerOrderAction,
} = require('./routes/seller');
const {
  handleCreateOrder, handleCreateWebOrder, handleGetOrders,
  handleOrderNotify, handleOrderStatus,
} = require('./routes/orders');
const {
  handleAuthTelegram, handleGetProducts, handleSubmitProduct,
  handleModerationList, handleModerationAction, handleGetContact,
} = require('./routes/catalog');
const { handleTelegramWebhook } = require('./routes/webhook');


function handleRequest(req, res) {
  const ip = clientIp(req);
  const path = req.url.split('?')[0];

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
}

// Faqat to'g'ridan-to'g'ri ishga tushirilganda tinglaymiz — `require` qilinganda
// (test.js) tinglamaydi, shunda testlar port band qilmasdan router'ni sinaydi.
if (require.main === module) {
  http.createServer(handleRequest)
    .listen(PORT, '127.0.0.1', () => console.log(`lolamarket-notify listening on ${PORT}`));

  // 24 soatdan oshgan hal qilinmagan bahslar uchun eslatma skaneri.
  // unref() — bu taymer jarayonni tirik ushlab turmasin (to'xtatish toza bo'lsin).
  setInterval(scanStaleDisputes, DISPUTE_REMINDER_MS).unref();
}

module.exports = { handleRequest };
