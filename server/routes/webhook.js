const { ADMIN_CHAT_ID, WEBHOOK_SECRET } = require('../config');
const { pool } = require('../db');
const { escapeHtml, money } = require('../lib/format');
const { rateLimited, readBody } = require('../lib/http');
const { saveContact } = require('../lib/contacts');
const {
  callTelegram, STATUS_COMMANDS, sendOpenAppMessage,
} = require('../lib/telegram-api');
const { confirmWebLoginCode } = require('./web-auth');
const { handleAdminActionCallback } = require('./admin');
const { handleDisputeEvidence, handleDisputeEvidenceDone } = require('./disputes');
const {
  startSellerApplication, handleSellerApplicationStep,
  handleSellerApplicationContact, handleSellerApplicationReview,
} = require('./seller-application');

// ============ Telegram webhook ============
async function handleTelegramWebhook(req, res) {
  if (WEBHOOK_SECRET) {
    const got = req.headers['x-telegram-bot-api-secret-token'];
    if (got !== WEBHOOK_SECRET) {
      res.writeHead(401);
      return res.end();
    }
  }
  res.writeHead(200);
  res.end('ok');

  try {
    const body = await readBody(req, 200_000);
    const update = JSON.parse(body);

    // Admin panel so'ragan amalning tasdiq tugmasi
    if (update.callback_query) {
      await handleAdminActionCallback(update.callback_query)
        .catch((e) => console.error('adminAction callback xatosi:', e.message));
      return;
    }

    const msg = update.message;
    if (!msg || !msg.chat || msg.chat.type !== 'private') return;
    if (rateLimited(`webhook:${msg.chat.id}`, 20)) return;

    // Bahs dalili (rasm/video) — ochiq bahs bo'lsa qabul qilinadi
    if (msg.photo || msg.video) {
      await handleDisputeEvidence(msg).catch((e) => console.error('dispute evidence xatosi:', e.message));
      return;
    }

    if (msg.contact) {
      if (msg.contact.user_id && msg.from && msg.contact.user_id === msg.from.id) {
        saveContact(msg.contact.user_id, msg.contact.phone_number);
        // Telefon `users` ga ham yoziladi — saytdagi profil va checkout formasi
        // uni shu yerdan oladi (contacts.json faqat Mini App uchun edi).
        await pool.query(
          `UPDATE users SET phone = COALESCE(phone, $2) WHERE tg_user_id = $1`,
          [String(msg.from.id), msg.contact.phone_number]
        ).catch((e) => console.error('users.phone yozishda xato:', e.message));
        const usedByApplication = await handleSellerApplicationContact(msg)
          .catch((e) => { console.error('sellerApp contact xatosi:', e.message); return false; });
        // Ariza oqimi bo'lmasa — raqam saytda kirgan xaridordan kelgan
        if (!usedByApplication) {
          await callTelegram('sendMessage', {
            chat_id: msg.chat.id,
            text: "✅ Rahmat! Raqamingiz saqlandi — saytda buyurtma bersangiz forma o'zi to'ladi.",
            reply_markup: { remove_keyboard: true },
          }).catch(() => {});
        }
      }
      return;
    }

    const text = (msg.text || '').trim();

    if (String(msg.chat.id) === String(ADMIN_CHAT_ID)) {
      const m = text.match(/^\/(tasdiqla|yolga|yetdi)\s+(#?LM-\d+)/i);
      if (m) {
        const cmd = STATUS_COMMANDS[m[1].toLowerCase()];
        const orderId = m[2].startsWith('#') ? m[2] : '#' + m[2];
        try {
          const { rows } = await pool.query(
            `UPDATE orders SET status = $1 WHERE id = $2 RETURNING tg_user_id`,
            [cmd.status, orderId]
          );
          if (!rows.length) {
            await callTelegram('sendMessage', { chat_id: ADMIN_CHAT_ID, text: `❌ ${orderId} topilmadi.` });
          } else if (rows[0].tg_user_id) {
            await callTelegram('sendMessage', {
              chat_id: rows[0].tg_user_id,
              text: cmd.buyerText(orderId),
              parse_mode: 'HTML',
            }).catch(() => {});
            await callTelegram('sendMessage', { chat_id: ADMIN_CHAT_ID, text: cmd.adminOkText(orderId) });
          } else {
            await callTelegram('sendMessage', { chat_id: ADMIN_CHAT_ID, text: `⚠️ ${orderId} holati "${cmd.status}" deb belgilandi, lekin xaridorning Telegram ID'si topilmadi — xabar yuborilmadi.` });
          }
        } catch (e) {
          console.error('status update xatosi:', e.message);
          await callTelegram('sendMessage', { chat_id: ADMIN_CHAT_ID, text: `❌ ${orderId} holatini yangilashda xato.` }).catch(() => {});
        }
        return;
      }

      // ---- Moderatsiya buyruqlari (Dars 11) ----
      if (/^\/moderatsiya\b/i.test(text)) {
        try {
          const { rows } = await pool.query(
            `SELECT id, name_uz, price FROM products WHERE status='pending' ORDER BY created_at DESC LIMIT 20`
          );
          if (!rows.length) {
            await callTelegram('sendMessage', { chat_id: msg.chat.id, text: "✅ Moderatsiya navbati bo'sh — kutayotgan e'lon yo'q." });
          } else {
            const list = rows
              .map((r) => `• <b>${escapeHtml(r.name_uz)}</b> — ${escapeHtml(money(r.price))}\n  <code>/nashr ${escapeHtml(r.id)}</code>   <code>/rad ${escapeHtml(r.id)}</code>`)
              .join('\n\n');
            await callTelegram('sendMessage', { chat_id: msg.chat.id, parse_mode: 'HTML', text: `🗂 <b>Moderatsiya navbati (${rows.length})</b>\n\n${list}` });
          }
        } catch (e) {
          console.error('moderatsiya list xatosi:', e.message);
        }
        return;
      }
      const mod = text.match(/^\/(nashr|rad)\s+(\S+)/i);
      if (mod) {
        const newStatus = mod[1].toLowerCase() === 'nashr' ? 'published' : 'rejected';
        const pid = mod[2];
        try {
          const { rows } = await pool.query(
            `UPDATE products SET status=$1, reviewed_at=now() WHERE id=$2 AND status='pending' RETURNING id, name_uz`,
            [newStatus, pid]
          );
          if (!rows.length) {
            await callTelegram('sendMessage', { chat_id: msg.chat.id, parse_mode: 'HTML', text: `❌ <code>${escapeHtml(pid)}</code> topilmadi yoki allaqachon ko'rib chiqilgan.` });
          } else {
            const label = newStatus === 'published' ? '✅ nashr etildi' : '🚫 rad etildi';
            await callTelegram('sendMessage', { chat_id: msg.chat.id, parse_mode: 'HTML', text: `${label}: <b>${escapeHtml(rows[0].name_uz)}</b>` });
          }
        } catch (e) {
          console.error('moderatsiya action xatosi:', e.message);
        }
        return;
      }

      // ---- Ochiq bahslar ro'yxati (qaror admin panelda qabul qilinadi) ----
      if (/^\/bahslar\b/i.test(text)) {
        try {
          const { rows } = await pool.query(
            `SELECT d.id, d.order_id, d.reason, d.seller_response,
                    EXTRACT(EPOCH FROM (now() - d.created_at))/3600 AS hours
               FROM disputes d WHERE d.status='open' ORDER BY d.created_at LIMIT 20`);
          if (!rows.length) {
            await callTelegram('sendMessage', { chat_id: msg.chat.id, text: "✅ Ochiq bahs yo'q." });
          } else {
            const list = rows.map((r) =>
              `• <b>#${r.id}</b> — <code>${escapeHtml(r.order_id)}</code> (${Math.floor(r.hours)} soat)\n` +
              `  ${escapeHtml(r.reason || '-')}` +
              (r.seller_response ? `\n  <i>Sotuvchi javobi bor</i>` : `\n  <i>Sotuvchi hali javob bermagan</i>`)
            ).join('\n\n');
            await callTelegram('sendMessage', {
              chat_id: msg.chat.id, parse_mode: 'HTML',
              text: `⚖️ <b>Ochiq bahslar (${rows.length})</b>\n\n${list}\n\nQaror admin panelning "Bahslar" bo'limida qabul qilinadi.`,
            });
          }
        } catch (e) {
          console.error('bahslar list xatosi:', e.message);
        }
        return;
      }

      // ---- Sotuvchi arizalari (Sprint 0) ----
      if (/^\/sotuvchilar\b/i.test(text)) {
        try {
          const { rows } = await pool.query(
            `SELECT id, business_name, city FROM seller_applications
              WHERE status='pending' AND step='done' ORDER BY created_at DESC LIMIT 20`
          );
          if (!rows.length) {
            await callTelegram('sendMessage', { chat_id: msg.chat.id, text: "✅ Ko'rib chiqilmagan sotuvchi arizasi yo'q." });
          } else {
            const list = rows
              .map((r) => `• <b>${escapeHtml(r.business_name || '?')}</b> — ${escapeHtml(r.city || '?')}\n  <code>/sotuvchi_tasdiqla ${r.id}</code>   <code>/sotuvchi_rad ${r.id}</code>`)
              .join('\n\n');
            await callTelegram('sendMessage', { chat_id: msg.chat.id, parse_mode: 'HTML', text: `🗂 <b>Sotuvchi arizalari (${rows.length})</b>\n\n${list}` });
          }
        } catch (e) {
          console.error('sotuvchilar list xatosi:', e.message);
        }
        return;
      }
      const sellerAppCmd = text.match(/^\/(sotuvchi_tasdiqla|sotuvchi_rad)\s+(\d+)/i);
      if (sellerAppCmd) {
        const action = sellerAppCmd[1].toLowerCase() === 'sotuvchi_tasdiqla' ? 'approve' : 'reject';
        await handleSellerApplicationReview(msg.chat.id, action, parseInt(sellerAppCmd[2], 10)).catch((e) => {
          console.error('sellerApp review xatosi:', e.message);
        });
        return;
      }
    }

    // ---- Bahs dalili yig'ish tugadi ----
    if (await handleDisputeEvidenceDone(msg, text).catch((e) => {
      console.error('dispute done xatosi:', e.message);
      return false;
    })) return;

    // ---- Ochiq sotuvchi arizasi bo'lsa — matn navbatdagi javob sifatida qabul qilinadi ----
    if (await handleSellerApplicationStep(msg, text).catch((e) => {
      console.error('sellerApp step xatosi:', e.message);
      return false;
    })) return;

    if (/^\/sotuvchi\b/i.test(text)) {
      await startSellerApplication(msg).catch((e) => console.error('sellerApp start xatosi:', e.message));
      return;
    }

    if (text.startsWith('/start')) {
      // Saytdan kelgan kirish havolasi: /start web_<kod>
      const startParam = text.slice('/start'.length).trim();
      const loginMatch = startParam.match(/^web_([0-9a-f]{8,64})$/);
      if (loginMatch) {
        await confirmWebLoginCode(msg, loginMatch[1])
          .catch((e) => console.error('web login confirm xatosi:', e.message));
        return;
      }
      await sendOpenAppMessage(
        msg.chat.id,
        "Assalomu alaykum! 🌷 <b>LolaMarket</b> — to'qima materiallar uchun B2B platforma.\n\nQuyidagi tugma orqali katalogni oching. Ishlab chiqaruvchi bo'lsangiz — /sotuvchi buyrug'ini yuboring."
      );
    } else {
      await sendOpenAppMessage(msg.chat.id, "Ilovani ochish uchun quyidagi tugmani bosing:");
    }
  } catch (e) {
    console.error('webhook xatosi:', e.message);
  }
}

module.exports = { handleTelegramWebhook };
