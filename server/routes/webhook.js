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
const { handleProductImage, handleProductVideo } = require('./catalog');
const { hideReview } = require('./reviews');
const { recordStatusChange } = require('../lib/order-history');
const {
  startSellerApplication, handleSellerApplicationStep,
  handleSellerApplicationContact, handleSellerApplicationReview,
} = require('./seller-application');

// Deep-link manba belgisi: `t.me/<bot>?start=guruh_ipak` → `/start guruh_ipak`
// (db/025). Havolani har kim yasay oladi, ya'ni payload IXTIYORIY matn
// bo'lishi mumkin — shuning uchun RO'YXAT emas, SHAKL tekshiriladi
// (`isPickupPointId` bilan bitta mulohaza: kanallar ro'yxatini kodga
// ko'chirish `admin_actions_kind_check` tuzog'i bo'lardi — yangi kanal
// qo'shilganda deploy talab qilinardi).
//
// `web_` ATAYLAB rad etiladi: u kirish kodi uchun band va manba emas.
function manbaBelgisi(payload) {
  const v = String(payload || '').trim();
  if (!/^[a-z0-9_]{2,32}$/.test(v)) return null;
  if (v.startsWith('web_')) return null;
  return v;
}

// ============ JIM RAD ETISH BUZILDI (2026-08-14) ============
// Shakl ATAYLAB qat'iy (faqat `[a-z0-9_]`), Telegram esa deep-link'da katta
// harf va chiziqchaga ham RUXSAT beradi. Ya'ni `?start=Instagram` yoki
// `?start=guruh-ipak` havolasi ISHLAYDI — odam botga kiradi, biz esa
// manbani jimgina tashlab yuboramiz va panelda o'sha kanal "nol berdi"
// bo'lib ko'rinadi. Bu loyihaning eng qimmat xato turi: raqam yo'q emas,
// YOLG'ON.
//
// Shakl QAT'IY QOLDIRILDI (founder qarori, 2026-08-14) — kengaytirilsa `IG`
// va `ig` ikki xil kanal bo'lib panelda ikki qatorga bo'linardi. O'zgargani
// JIMLIK: rad etilgan payload endi alertga chiqadi.
//
// ⚠️ NEGA O'RAM, nega `/start` ichida oddiy `if` EMAS: alohida chaqiruv
// `if (false)` bilan o'chirilsa qorovul buni ko'rmasdi — mutatsiya bilan
// SINALDI va o'tib ketdi. O'ram esa qiymatni QAYTARADI, ya'ni uni chetlab
// o'tish uchun `/start` ni `manbaBelgisi` ga qaytarish kerak — buni Test 27
// manba kodidan ushlaydi. Ogohlantirishning O'ZI esa xatti-harakat bilan
// sinaladi, matn bilan emas.
//
// ⚠️ Ikkita hol ATAYLAB jim: (1) payload umuman yo'q — bu ODATDAGI `/start`
// va u har kirishda alert yuborardi; (2) `web_...` — saytga kirish kodi, u
// manba emas va shakli buzilgani ham normal (eskirgan havola).
//
// Alert kaliti BARQAROR (birinchi argument), payload ikkinchida — aks holda
// har xil payload alohida guruh bo'lib tomni to'ldirardi. `alert.js` matnni
// `escapeHtml` dan o'tkazadi, ya'ni ixtiyoriy matn xavfsiz.
function manbaAniqla(payload) {
  const manba = manbaBelgisi(payload);
  const xom = String(payload || '').trim();
  if (!manba && xom && !xom.startsWith('web_')) {
    console.error(
      'deep-link manba belgisi rad etildi — havola shakli noto\'g\'ri:',
      xom.slice(0, 64)
    );
  }
  return manba;
}

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

    // Bahs dalili (rasm/video) — ochiq bahs bo'lsa qabul qilinadi.
    // Bahs kutmasa — kutilayotgan mahsulot rasmi yoki videosi bo'lishi mumkin.
    if (msg.photo || msg.video) {
      const usedByDispute = await handleDisputeEvidence(msg)
        .catch((e) => { console.error('dispute evidence xatosi:', e.message); return false; });
      if (usedByDispute) return;
      // Rasm va video AYRIM yo'ldan boradi: birinchisi `awaiting_image` ni,
      // ikkinchisi `awaiting_video` ni kutadi (db/023). Ilgari ikkalasi ham
      // `handleProductImage` ga tushardi va u videoni jimgina tashlab
      // yuborardi — sotuvchi hech qanday javob olmasdi.
      if (msg.video) {
        await handleProductVideo(msg)
          .catch((e) => console.error('product video xatosi:', e.message));
        return;
      }
      await handleProductImage(msg)
        .catch((e) => console.error('product image xatosi:', e.message));
      return;
    }

    if (msg.contact) {
      if (msg.contact.user_id && msg.from && msg.contact.user_id === msg.from.id) {
        saveContact(msg.contact.user_id, msg.contact.phone_number);
        /* Telefon `users` ga ham yoziladi — saytdagi profil va checkout formasi
           uni shu yerdan oladi (contacts.json faqat Mini App uchun edi).

           ⚠️ USTIDAN YOZADI va bu ATAYLAB (2026-08-14, founder shikoyati:
           "webdagi profilimda boshqa raqam turibdi telegram orqali login
           qilgan bo'lsam ham"). Ilgari bu yerda ham `COALESCE(phone, $2)`
           turardi, ya'ni BIRINCHI yozilgan raqam abadiy qotib qolardi.
           Natijada tuzoq hosil bo'lardi: checkout formasiga yoki sotuvchi
           arizasiga bir marta boshqa raqam tushsa (sinov raqami, hamkasb,
           ofis raqami), profil o'shani ko'rsatib turaverardi va uni
           TUZATISHNING ILOJI YO'Q edi — bot esa raqamni faqat `!user.phone`
           bo'lganda so'raydi, ya'ni qayta ham so'ramasdi.

           Nega aynan SHU manba g'olib: raqamni Telegram'ning O'ZI tasdiqlagan
           (yuqoridagi `msg.contact.user_id === msg.from.id` sharti uni
           foydalanuvchining SHAXSIY kontakti ekanini kafolatlaydi), qolgan
           ikki manba esa qo'lda yoziladi va boshqa odamniki bo'lishi mumkin.
           Shuning uchun qoida: TASDIQLANGAN kontakt > forma. Forma yozuvlari
           `COALESCE` da qoladi — ular faqat BO'SH joyni to'ldiradi.

           ⚠️ `users.src` bilan ADASHTIRMASLIK kerak: u yerda "birinchi
           teginish qulflanadi" TO'G'RI, chunki u analitika FAKTI. Telefon
           esa fakt emas, JORIY aloqa ma'lumoti — u o'zgarishi normal. */
        await pool.query(
          `UPDATE users SET phone = $2 WHERE tg_user_id = $1`,
          [String(msg.from.id), msg.contact.phone_number]
        ).catch((e) => console.error('users.phone yozishda xato:', e.message));
        const usedByApplication = await handleSellerApplicationContact(msg)
          .catch((e) => { console.error('sellerApp contact xatosi:', e.message); return false; });
        // Ariza oqimi bo'lmasa — raqam saytda kirgan xaridordan kelgan
        if (!usedByApplication) {
          await callTelegram('sendMessage', {
            chat_id: msg.chat.id,
            // Raqamning O'ZI ko'rsatiladi: bu yagona joy, undan foydalanuvchi
            // profildagi raqam ALMASHGANIGA ishonch hosil qiladi. "Saqlandi"
            // deyish yetarli emas edi — xato raqamni tuzatayotgan odam
            // natijani ko'rmasdi va tuzalgan-tuzalmaganini bilmasdi.
            text: `✅ Rahmat! Raqamingiz saqlandi: ${msg.contact.phone_number}\n\n`
              + "Saytdagi profilingizda va buyurtma formasida endi shu raqam turadi. "
              + "O'zgartirish kerak bo'lsa — yangi kontaktingizni shu yerga qayta yuboring.",
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
          // ⚠️ Bu yo'l holat O'TISHINI tekshirmaydi — `seller.js` dagidan farqi
          // shu: admin `/yetdi` ni istalgan holatdagi buyurtmaga yozaveradi
          // (masalan `pending` dan to'g'ridan-to'g'ri `delivered` ga). Bu
          // MAVJUD xatti-harakat va 2026-08-03 da ATAYLAB o'zgartirilmadi:
          // qorovul qo'shish founder'ning bot bilan ishlash odatini kutilmaganda
          // buzardi. Tarix esa endi `from_status` ni yozadi, ya'ni bunday
          // mantiqsiz o'tish KO'RINADI — tuzatilmaydi, lekin yashirinmaydi.
          //
          // Tranzaksiya: holat va tarix atomik bo'lishi uchun qo'shildi
          // (ilgari bu yerda tranzaksiya umuman yo'q edi).
          let rows;
          const client = await pool.connect();
          try {
            await client.query('BEGIN');
            const upd = await client.query(
              `WITH prev AS (SELECT id, status FROM orders WHERE id = $2 FOR UPDATE)
               UPDATE orders o SET status = $1
                 FROM prev WHERE o.id = prev.id
                 RETURNING o.tg_user_id, prev.status AS from_status`,
              [cmd.status, orderId]
            );
            rows = upd.rows;
            if (rows.length) {
              await recordStatusChange(client, {
                orderId,
                from: rows[0].from_status,
                to: cmd.status,
                actorKind: 'admin',
                actorTg: msg.from && msg.from.id,
                note: 'bot buyrug\'i',
              });
            }
            await client.query('COMMIT');
          } catch (e) {
            try { await client.query('ROLLBACK'); } catch (_) {}
            throw e;
          } finally {
            client.release();
          }
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

      // ---- Sharhlar (moderatsiyasiz chiqadi, keyin yashirish mumkin) ----
      // Sharh yozish uchun haqiqiy, yetkazilgan buyurtma kerak — shuning
      // uchun oldindan tasdiqlash talab qilinmaydi. Bu buyruq — keyingi
      // nazorat: haqoratli yoki begona sharhni navbatdan chiqarish.
      if (/^\/sharhlar\b/i.test(text)) {
        try {
          const { rows } = await pool.query(
            `SELECT r.id, r.stars, r.body, r.author_name, p.name_uz
               FROM reviews r LEFT JOIN products p ON p.id = r.product_id
              WHERE r.status='published' ORDER BY r.created_at DESC LIMIT 20`);
          if (!rows.length) {
            await callTelegram('sendMessage', { chat_id: msg.chat.id, text: "Hali sharh yo'q." });
          } else {
            const list = rows.map((r) =>
              `• <b>#${r.id}</b> ${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)} — ${escapeHtml(r.name_uz || '?')}\n` +
              (r.body ? `  <i>${escapeHtml(r.body.slice(0, 120))}</i>\n` : '') +
              `  ${escapeHtml(r.author_name || "noma'lum")}   <code>/sharh_yashir ${r.id} sabab</code>`
            ).join('\n\n');
            await callTelegram('sendMessage', {
              chat_id: msg.chat.id, parse_mode: 'HTML',
              text: `⭐️ <b>Oxirgi sharhlar (${rows.length})</b>\n\n${list}`,
            });
          }
        } catch (e) {
          console.error('sharhlar list xatosi:', e.message);
        }
        return;
      }
      const revCmd = text.match(/^\/sharh_yashir\s+(\d+)\s+(.+)/i);
      if (revCmd) {
        try {
          // hideReview reytingni ham qayta hisoblaydi — yashirilgan sharh
          // yulduzlarda qolib ketmasin
          const r = await hideReview(Number(revCmd[1]), revCmd[2].trim().slice(0, 500));
          await callTelegram('sendMessage', {
            chat_id: msg.chat.id, parse_mode: 'HTML',
            text: `🙈 Sharh #${r.id} yashirildi va reytingdan chiqarildi.`,
          });
        } catch (e) {
          const why = e.userFacing ? e.message : 'ichki xato';
          await callTelegram('sendMessage', { chat_id: msg.chat.id, text: `❌ Bajarilmadi: ${why}` }).catch(() => {});
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
      // Botga kirgan odamni yozib qo'yamiz — "botda qancha odam bor" savoliga
      // yagona manba shu (Telegram Bot API obunachilar sonini bermaydi).
      //
      // ⚠️ `engaged_at` ATAYLAB TEGILMAYDI — na INSERT da, na UPDATE da. Bu
      // qator "ilovani ochgan" degani EMAS, va agar odam keyin ilovani ochsa
      // `engaged_at` ni o'sha yo'lning o'zi qo'yadi (db/020 izohiga qara).
      // `DO UPDATE` ishlatiladi, `DO NOTHING` emas: ismi o'zgargan bo'lishi
      // mumkin, lekin roli TEGILMAYDI — sotuvchi `/start` bossa `buyer` ga
      // tushib qolardi.
      //
      // Telegram ID bu yerda ISHONCHLI: uni klient emas, webhook orqali
      // Telegram'ning o'zi yuboradi va so'rov WEBHOOK_SECRET bilan
      // tekshirilgan (CLAUDE.md — foydalanuvchi kimligi brauzerdan olinmaydi).
      const startParam = text.slice('/start'.length).trim();
      // ⚠️ `manbaAniqla`, `manbaBelgisi` EMAS: o'ram tozalash bilan birga
      // rad etilgan havolani ALERTGA chiqaradi (izohi funksiya ustida).
      const manba = manbaAniqla(startParam);

      if (msg.from && msg.from.id) {
        const startName =
          [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ')
          || msg.from.username || null;
        // ⚠️ `src` — BIRINCHI teginish va u `COALESCE(users.src, ...)` bilan
        // qulflanadi (db/025). Oxirgi manba yozilsa, eng ko'p eslatma
        // yuborilgan kanal eng samarali ko'rinib qolardi.
        await pool.query(
          `INSERT INTO users (tg_user_id, full_name, tg_username, role, src)
             VALUES ($1, $2, $3, 'buyer', $4)
           ON CONFLICT (tg_user_id) DO UPDATE
             SET full_name   = COALESCE(users.full_name, EXCLUDED.full_name),
                 tg_username = COALESCE(EXCLUDED.tg_username, users.tg_username),
                 src         = COALESCE(users.src, EXCLUDED.src)`,
          // ⚠️ `manba` — TOZALANGAN qiymat, `startParam` EMAS. Xom payload
          // bazaga tushsa panel `GROUP BY` ga ixtiyoriy matn kirardi.
          [String(msg.from.id), startName, msg.from.username || null, manba]
        // Birinchi argument — alert guruhlash kaliti, o'zgaruvchan qism ikkinchida.
        ).catch((e) => console.error('/start foydalanuvchini yozishda xato:', e.message));
      }

      // Saytdan kelgan kirish havolasi: /start web_<kod>
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

module.exports = {
  handleTelegramWebhook,
  // Sinov uchun ATAYLAB ochiq — `videoRadSababi` va `tekshirKalit` bilan
  // bitta qoida: qorovulni to'g'ridan-to'g'ri sinab bo'lsin.
  manbaBelgisi,
  // `manbaAniqla` ham ochiq: uning ogohlantirishi MATN bilan emas,
  // XATTI-HARAKAT bilan sinaladi (mutatsiya 5 aynan matn tekshiruvidan
  // o'tib ketgan edi).
  manbaAniqla,
};
