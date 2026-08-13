const https = require('https');
const crypto = require('crypto');
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

// ============ FAYLNI BAYT SIFATIDA OLIB KELISH ============
// `handleProductPhoto` (routes/catalog.js) faylni brauzerga OQIM bilan
// uzatadi — u yerda bayt kerak emas. Bu yerda esa manba rasm AI ga
// yuboriladi, ya'ni butun tarkib xotirada kerak.
//
// Hajm chegarasi SHART: mahsulot surati sotuvchi yuborgan fayl, ya'ni tashqi
// ma'lumot. Chegarasiz o'qish bitta katta fayl bilan Node jarayonini
// yiqitardi.
const MAX_DOWNLOAD_BYTES = 12 * 1024 * 1024;

// Kengaytmadan tur — `routes/catalog.js` dagi bilan bir xil mulohaza:
// Telegram CDN'i `content-type` bermaydi yoki `application/octet-stream`
// beradi, AI provayderi esa haqiqiy turni talab qiladi.
const MIME_BY_EXT = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
};

function tgDownloadFile(filePath) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`, (res) => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`fayl yuklanmadi HTTP ${res.statusCode}`)); }
      const chunks = [];
      let size = 0;
      res.on('data', (d) => {
        size += d.length;
        if (size > MAX_DOWNLOAD_BYTES) { res.destroy(); return reject(new Error('fayl juda katta')); }
        chunks.push(d);
      });
      res.on('end', () => resolve({
        buf: Buffer.concat(chunks),
        mime: MIME_BY_EXT[String(filePath).split('.').pop().toLowerCase()] || 'image/jpeg',
      }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ============ RASMNI YUKLASH (multipart) ============
// `callTelegram` JSON yuboradi va bayt yubora olmaydi. Fayl yuborish uchun
// Telegram `multipart/form-data` talab qiladi, shuning uchun bu alohida yo'l.
//
// NEGA UMUMAN TELEGRAM'GA YUKLANADI: generatsiya qilingan rasm biror joyda
// yashashi kerak. Serverdagi papka tanlanmadi — deploy rsync bilan boradi va
// papka bir kun jimgina yo'qolishi mumkin (2026-08-03 da `/opt/lolamarket-
// notify/` shunday o'chgan edi). Telegram esa loyihada allaqachon ishlaydigan
// omborxona: mahsulot surati ham, bahs dalili ham o'sha yerda.
//
// Qaytaradi — eng KATTA o'lchamning `file_id` si. Telegram bitta rasmni bir
// necha o'lchamda qaytaradi va oxirgisi eng kattasi (`routes/catalog.js` da
// ham aynan shu tanlanadi).
function sendPhotoBytes(chatId, buf, filename, caption) {
  return new Promise((resolve, reject) => {
    const boundary = `----lola${crypto.randomBytes(16).toString('hex')}`;
    const field = (name, value) =>
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`);

    const body = Buffer.concat([
      field('chat_id', String(chatId)),
      ...(caption ? [field('caption', caption)] : []),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="${filename}"\r\n`
        + 'Content-Type: image/png\r\n\r\n'),
      buf,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendPhoto`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          const sizes = j?.result?.photo;
          const fileId = Array.isArray(sizes) && sizes.length ? sizes[sizes.length - 1].file_id : null;
          // ⚠️ Jimgina `null` qaytarilmaydi. Chaqiruvchi keshga yozmoqchi va
          // `file_id` yo'qligini "rasm yo'q" deb tushunib, PULGA generatsiya
          // qilingan natijani yo'qotardi — sababi esa ko'rinmasdi.
          if (!fileId) return reject(new Error(`sendPhoto file_id bermadi: ${j?.description || res.statusCode}`));
          resolve(fileId);
        } catch (e) { reject(new Error('sendPhoto javobi buzuq')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/* Tayyor rasmni foydalanuvchining O'Z chatiga yuboradi — bayram effekti bilan.
   Rasm allaqachon Telegram'da yotibdi, shuning uchun baytlar EMAS, `file_id`
   uzatiladi (ikkinchi marta yuklash shart emas).

   ⚠️ EFFEKT IXTIYORIY VA U YIQILSA XABAR BARIBIR KETADI. Telegram noto'g'ri
   yoki qo'llab-quvvatlanmaydigan `message_effect_id` da BUTUN so'rovni rad
   etadi — ya'ni effektsiz qayta urinish bo'lmasa foydalanuvchi rasmni
   umuman olmasdi. Shuning uchun rad javobida bir marta effektSIZ
   takrorlanadi: bayram — qo'shimcha, xabar — asosiy narsa.

   Qaytaradi: `{ ok, effekt }` — `effekt` effekt bilan ketganini bildiradi
   (chaqiruvchi buni jurnalga yozadi, "konfetti ishlayapti" degan ishonch
   o'lchanmagan da'vo bo'lib qolmasin). */
async function sendPhotoWithEffect(chatId, fileId, caption, effectId) {
  const asos = { chat_id: String(chatId), photo: fileId };
  if (caption) asos.caption = caption;

  if (effectId) {
    const r = await callTelegram('sendPhoto', Object.assign({}, asos, { message_effect_id: effectId }));
    if (r.status === 200) return { ok: true, effekt: true };
    // Effekt sabab rad etilgan bo'lishi mumkin — effektsiz bir marta urinamiz.
    const r2 = await callTelegram('sendPhoto', asos);
    return { ok: r2.status === 200, effekt: false, sabab: r.body };
  }

  const r = await callTelegram('sendPhoto', asos);
  return { ok: r.status === 200, effekt: false, sabab: r.status === 200 ? null : r.body };
}

module.exports = {
  callTelegram, sendOrderNotifyMessage, sendBuyerConfirmMessage,
  STATUS_COMMANDS, sendOpenAppMessage, callbackAnswer, notify, tgGetFile,
  tgDownloadFile, sendPhotoBytes, sendPhotoWithEffect,
};
