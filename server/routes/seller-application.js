const { pool } = require('../db');
const { escapeHtml } = require('../lib/format');
const { ClientError } = require('../lib/validate');
const {
  callTelegram, sendOpenAppMessage, sendOrderNotifyMessage,
} = require('../lib/telegram-api');

// ============ SOTUVCHI ARIZASI (bot suhbati, Sprint 0) ============
// PRD §9 chegarasi: o'z-o'zini ro'yxatdan o'tkazish yo'q — founder qo'lda
// tasdiqlaydi. Ariza bosqichlari seller_applications.step ustunida saqlanadi
// (in-memory emas), shu sabab server qayta ishga tushsa ham suhbat davom etadi.
const SELLER_APP_QUESTIONS = {
  city: "Qaysi shaharda joylashgansiz?",
  product_type: 'Qanday turdagi mato yoki mahsulot ishlab chiqarasiz? (masalan: ikat, atlas, shoyi)',
};

async function getOpenSellerApplication(tgUserId) {
  const { rows } = await pool.query(
    `SELECT id, step FROM seller_applications
      WHERE tg_user_id = $1 AND status = 'pending' AND step != 'done'
      ORDER BY created_at DESC LIMIT 1`,
    [String(tgUserId)]
  );
  return rows[0] || null;
}

async function startSellerApplication(msg) {
  const existing = await getOpenSellerApplication(msg.from.id);
  if (existing) {
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: 'Sizda allaqachon ochiq ariza bor — javob berishda davom eting.',
    });
    return;
  }
  await pool.query(
    `INSERT INTO seller_applications (tg_user_id, tg_username, step) VALUES ($1, $2, 'business_name')`,
    [String(msg.from.id), msg.from.username || null]
  );
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    text: "🌷 LolaMarket sotuvchisi bo'lish uchun 4 ta savolga javob bering.\n\n1) Korxona nomi qanday?",
  });
}

// Ochiq arizasi bor foydalanuvchining oddiy matn xabarini navbatdagi javob
// sifatida qabul qiladi. Ariza yo'q bo'lsa false qaytadi (chaqiruvchi odatdagi
// buyruq/ /start yo'liga o'tadi).
async function handleSellerApplicationStep(msg, text) {
  const app = await getOpenSellerApplication(msg.from.id);
  if (!app) return false;

  if (app.step === 'business_name') {
    if (!text) {
      await callTelegram('sendMessage', { chat_id: msg.chat.id, text: "Iltimos, korxona nomini matn ko'rinishida yuboring." });
      return true;
    }
    await pool.query(`UPDATE seller_applications SET business_name=$1, step='city' WHERE id=$2`, [text.slice(0, 200), app.id]);
    await callTelegram('sendMessage', { chat_id: msg.chat.id, text: `2) ${SELLER_APP_QUESTIONS.city}` });
    return true;
  }
  if (app.step === 'city') {
    if (!text) {
      await callTelegram('sendMessage', { chat_id: msg.chat.id, text: 'Iltimos, shahar nomini yuboring.' });
      return true;
    }
    await pool.query(`UPDATE seller_applications SET city=$1, step='product_type' WHERE id=$2`, [text.slice(0, 120), app.id]);
    await callTelegram('sendMessage', { chat_id: msg.chat.id, text: `3) ${SELLER_APP_QUESTIONS.product_type}` });
    return true;
  }
  if (app.step === 'product_type') {
    if (!text) {
      await callTelegram('sendMessage', { chat_id: msg.chat.id, text: 'Iltimos, mahsulot turini yuboring.' });
      return true;
    }
    await pool.query(`UPDATE seller_applications SET product_type=$1, step='phone' WHERE id=$2`, [text.slice(0, 200), app.id]);
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: '4) Telefon raqamingizni pastdagi tugma orqali yuboring:',
      reply_markup: {
        keyboard: [[{ text: '📱 Telefon raqamni yuborish', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    return true;
  }
  // step === 'phone' — faqat contact xabari qabul qilinadi, matn emas
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    text: 'Iltimos, telefon raqamingizni yuqoridagi tugma orqali yuboring.',
  });
  return true;
}

// Telefon (contact) xabari kelganda arizani yakunlaydi va adminga xabar beradi.
// Ariza yakunlangan bo'lsa true qaytaradi — chaqiruvchi shunda o'z javobini
// yubormaydi (bitta kontakt xabariga ikkita javob ketmasin).
async function handleSellerApplicationContact(msg) {
  const app = await getOpenSellerApplication(msg.from.id);
  if (!app || app.step !== 'phone') return false;
  const { rows } = await pool.query(
    `UPDATE seller_applications SET phone=$1, step='done' WHERE id=$2
     RETURNING id, business_name, city, product_type, phone, tg_username`,
    [msg.contact.phone_number, app.id]
  );
  if (!rows.length) return false;
  const a = rows[0];
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    text: "✅ Arizangiz qabul qilindi! Founder tez orada ko'rib chiqadi — natija shu yerga xabar bilan keladi.",
    reply_markup: { remove_keyboard: true },
  });
  const summary = [
    '🆕 <b>Yangi sotuvchi arizasi</b>',
    '',
    `<b>Korxona:</b> ${escapeHtml(a.business_name || '-')}`,
    `<b>Shahar:</b> ${escapeHtml(a.city || '-')}`,
    `<b>Mahsulot turi:</b> ${escapeHtml(a.product_type || '-')}`,
    `<b>Telefon:</b> ${escapeHtml(a.phone || '-')}`,
    a.tg_username ? `<b>Telegram:</b> @${escapeHtml(a.tg_username)}` : '',
    '',
    `<code>/sotuvchi_tasdiqla ${a.id}</code>   <code>/sotuvchi_rad ${a.id}</code>`,
  ]
    .filter(Boolean)
    .join('\n');
  await sendOrderNotifyMessage(summary).catch((e) => console.error('sellerApp admin notify:', e.message));
  return true;
}

// Admin /sotuvchi_tasdiqla yoki /sotuvchi_rad buyrug'ini bajaradi.
async function handleSellerApplicationReview(chatId, action, appId, reason) {
  const { rows } = await pool.query(
    `SELECT id, tg_user_id, tg_username, business_name, city, phone FROM seller_applications
      WHERE id = $1 AND status = 'pending' AND step = 'done'`,
    [appId]
  );
  if (!rows.length) {
    await callTelegram('sendMessage', { chat_id: chatId, text: `❌ #${appId} ariza topilmadi yoki allaqachon ko'rib chiqilgan.` });
    throw new ClientError("ariza topilmadi yoki allaqachon ko'rib chiqilgan");
  }
  const app = rows[0];

  if (action === 'reject') {
    await pool.query(`UPDATE seller_applications SET status='rejected', reviewed_at=now() WHERE id=$1`, [app.id]);
    await callTelegram('sendMessage', { chat_id: chatId, text: `🚫 #${app.id} ariza rad etildi.` });
    await callTelegram('sendMessage', {
      chat_id: app.tg_user_id,
      text: "Afsuski, arizangiz hozircha tasdiqlanmadi." +
        (reason ? `\n\nSabab: ${reason}` : '') +
        "\n\nSavollar bo'lsa botga yozing.",
    }).catch(() => {});
    return `🚫 #${app.id} ariza rad etildi`;
  }

  // approve — foydalanuvchi hali /api/auth/telegram chaqirmagan bo'lishi mumkin
  // (Mini App'ni ochmagan), shuning uchun users'ga ham upsert qilamiz.
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const { rows: userRows } = await client.query(
      // Telefon ham users'ga yoziladi — admin panelidagi sotuvchilar ro'yxati
      // uni shu yerdan oladi (ilgari faqat arizada qolib ketardi).
      // `engaged_at` — haqiqiy foydalanish belgisi (db/020). Sotuvchi arizasini
      // to'ldirish `/start` bosishdan ancha uzoqroq qadam.
      `INSERT INTO users (tg_user_id, full_name, phone, role, engaged_at)
         VALUES ($1, $2, $3, 'seller', now())
         ON CONFLICT (tg_user_id) DO UPDATE
           SET role = 'seller',
               phone = COALESCE(EXCLUDED.phone, users.phone),
               engaged_at = COALESCE(users.engaged_at, now())
         RETURNING id`,
      [String(app.tg_user_id), app.business_name || app.tg_username || null, app.phone || null]
    );
    const userId = userRows[0].id;

    const { rows: existingSeller } = await client.query(`SELECT id FROM sellers WHERE user_id = $1`, [userId]);
    if (existingSeller.length) {
      await client.query(
        `UPDATE sellers SET business_name_uz=$1, city_uz=$2, is_verified=true WHERE id=$3`,
        [app.business_name, app.city, existingSeller[0].id]
      );
    } else {
      await client.query(
        `INSERT INTO sellers (user_id, business_name_uz, city_uz, is_verified) VALUES ($1,$2,$3,true)`,
        [userId, app.business_name, app.city]
      );
    }
    await client.query(`UPDATE seller_applications SET status='approved', reviewed_at=now() WHERE id=$1`, [app.id]);
    await client.query('COMMIT');
  } catch (e) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('sellerApp approve xatosi:', e.message);
    await callTelegram('sendMessage', { chat_id: chatId, text: `❌ #${app.id} tasdiqlashda xato yuz berdi.` });
    throw e;
  } finally {
    if (client) client.release();
  }

  await callTelegram('sendMessage', { chat_id: chatId, text: `✅ #${app.id} — ${app.business_name || '?'} sotuvchi sifatida tasdiqlandi.` });
  await sendOpenAppMessage(
    app.tg_user_id,
    "🎉 <b>Tabriklaymiz!</b> Siz LolaMarket sotuvchisi sifatida tasdiqlandingiz.\n\nQuyidagi tugma orqali kabinetingizni oching:"
  ).catch(() => {});
  return `✅ #${app.id} — ${app.business_name || '?'} tasdiqlandi`;
}

module.exports = { startSellerApplication, handleSellerApplicationStep, handleSellerApplicationContact, handleSellerApplicationReview };
