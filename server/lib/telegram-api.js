const https = require('https');
const { BOT_TOKEN, ADMIN_CHAT_ID, MINI_APP_URL } = require('../config');
const { escapeHtml } = require('./format');

// ============ TELEGRAM BOT API ============
// Bot tokeni faqat shu modulda ishlatiladi — boshqa joyga tarqamaydi.

function callTelegram(method, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${BOT_TOKEN}/${method}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let data = '';
        res.on('data', (d) => (data += d));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sendOrderNotifyMessage(text) {
  return callTelegram('sendMessage', { chat_id: ADMIN_CHAT_ID, text, parse_mode: 'HTML' });
}

function sendBuyerConfirmMessage(chatId, itemsText, total, prepay, rest, deliveryFee) {
  const text = [
    '✅ <b>Buyurtmangiz qabul qilindi</b>',
    '',
    '<b>Tarkib:</b>',
    itemsText,
    '',
    `<b>Jami:</b> ${escapeHtml(total || '-')}`,
    prepay ? `<b>To'landi:</b> ${escapeHtml(prepay)}` : '',
    // Xaridor qolgan to'lov shartini oldindan bilishi kerak — BTS to'lovsiz bermaydi
    rest ? `<b>Qolgani:</b> ${escapeHtml(rest)} — mato BTS'ga yetib kelgach to'lanadi` : '',
    // Logistika mahsulot summasiga KIRMAYDI — BTS nuqtasida alohida to'lanadi
    deliveryFee ? `<b>Yetkazish (taxminiy):</b> ${escapeHtml(deliveryFee)} — BTS nuqtasida to'lanadi` : '',
    '',
    "Ishlab chiqaruvchi tasdiqlaydi — tez orada xabar beramiz.",
  ].filter(Boolean).join('\n');
  return callTelegram('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' });
}

const STATUS_COMMANDS = {
  tasdiqla: {
    status: 'confirmed',
    buyerText: (orderId) =>
      `✅ <b>Buyurtmangiz tasdiqlandi!</b>\n\nBuyurtma: <code>${escapeHtml(orderId)}</code>\nTez orada ishlab chiqarishga yuboriladi.`,
    adminOkText: (orderId) => `✅ ${orderId} xaridorga tasdiqlandi deb xabar berildi.`,
  },
  yolga: {
    status: 'shipped',
    buyerText: (orderId) =>
      `🚚 <b>Buyurtmangiz yo'lga chiqdi!</b>\n\nBuyurtma: <code>${escapeHtml(orderId)}</code>\nBTS Pochta orqali yetkazib berilmoqda.`,
    adminOkText: (orderId) => `🚚 ${orderId} xaridorga yo'lga chiqdi deb xabar berildi.`,
  },
  yetdi: {
    status: 'delivered',
    buyerText: (orderId) =>
      `📦 <b>Buyurtmangiz yetib keldi!</b>\n\nBuyurtma: <code>${escapeHtml(orderId)}</code>\nXaridingiz uchun rahmat!`,
    adminOkText: (orderId) => `📦 ${orderId} xaridorga yetib keldi deb xabar berildi.`,
  },
};

function sendOpenAppMessage(chatId, text) {
  return callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: "🌷 Do'konni ochish", web_app: { url: MINI_APP_URL } }]],
    },
  });
}

function callbackAnswer(id, text) {
  return callTelegram('answerCallbackQuery', { callback_query_id: id, text: text || '' }).catch(() => {});
}

// Xabar yuborishda xato bo'lsa jim o'tamiz — bildirishnoma yetib bormagani
// asosiy amalni (buyurtma, tasdiq) bekor qilmasligi kerak.
function notify(chatId, text) {
  if (!chatId) return Promise.resolve();
  return callTelegram('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' }).catch(() => {});
}

function tgGetFile(fileId) {
  return callTelegram('getFile', { file_id: fileId }).then((r) => {
    try { return JSON.parse(r.body).result.file_path; } catch (_) { return null; }
  });
}

module.exports = {
  callTelegram, sendOrderNotifyMessage, sendBuyerConfirmMessage,
  STATUS_COMMANDS, sendOpenAppMessage, callbackAnswer, notify, tgGetFile,
};
