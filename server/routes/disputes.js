const https = require('https');
const crypto = require('crypto');
const { ADMIN_CHAT_ID, ADMIN_PANEL_TOKEN, BOT_TOKEN } = require('../config');
const { pool } = require('../db');
const { requestUser, adminPanelAuth, requireSeller } = require('../lib/auth');
const { escapeHtml, safeEqual, dateLabel } = require('../lib/format');
const { validate } = require('../lib/validate');
const { rateLimited, readBody, ok, fail } = require('../lib/http');
const { callTelegram, notify, tgGetFile } = require('../lib/telegram-api');

// ============ BAHSLI HOLATLAR (disputes) ============
// Dalil rasmi Telegram orqali yig'iladi: bahs ochilgach bot xaridordan rasm
// so'raydi va faqat file_id saqlanadi (fayl Telegram serverida qoladi).
const DISPUTE_REASONS = {
  not_delivered: 'Mato yetib kelmadi',
  damaged:       'Mato shikastlangan',
  wrong_item:    "Boshqa mato keldi",
  quality:       'Sifat mos emas',
  quantity:      'Miqdor kam chiqdi',
  other:         'Boshqa muammo',
};

// Bahs faqat mato yo'lga chiqqandan keyin ochiladi — bundan oldin muammo
// "buyurtma" muammosi (bekor qilish), bahs emas.
const DISPUTE_ALLOWED_ORDER_STATUS = ['shipped', 'delivered', 'completed'];

async function handleCreateDispute(req, res, ip) {
  if (rateLimited(`dispute:${ip}`, 10)) return fail(res, 'too many requests', 429);
  // Mini App (initData) ham, sayt (cookie sessiya) ham — ikkalasi ham
  // qabul qilinadi. Ilgari faqat initData bo'lgani uchun sayt xaridori
  // bahs ocholmasdi: kafolat va'da qilingan, mexanizmi esa yo'q edi.
  const u = await requestUser(req);
  if (!u) return fail(res, 'unauthorized', 401);
  try {
    const data = JSON.parse(await readBody(req, 20_000));
    const v = validate(data, {
      orderId:    { type: 'string', required: true, max: 40 },
      reasonKey:  { type: 'string', required: true, enum: Object.keys(DISPUTE_REASONS) },
      comment:    { type: 'string', required: false, max: 1000 },
    });
    if (!v.ok) return fail(res, v.error, 400);

    // Buyurtma shu xaridorniki ekanini imzolangan Telegram ID orqali tekshiramiz
    const { rows: ord } = await pool.query(
      `SELECT id, status, buyer_name FROM orders WHERE id=$1 AND tg_user_id=$2`,
      [v.data.orderId, String(u.id)]);
    if (!ord.length) return fail(res, 'buyurtma topilmadi', 404);
    if (!DISPUTE_ALLOWED_ORDER_STATUS.includes(ord[0].status)) {
      return fail(res, "bu buyurtma bo'yicha hali bahs ochib bo'lmaydi", 400);
    }

    const reason = DISPUTE_REASONS[v.data.reasonKey] +
      (v.data.comment ? ` — ${v.data.comment}` : '');

    // Buyurtmadagi birinchi sotuvchi (odatda bitta) — javob berish uchun
    const { rows: sel } = await pool.query(
      `SELECT p.seller_id FROM order_items oi JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id=$1 AND p.seller_id IS NOT NULL LIMIT 1`, [v.data.orderId]);

    let d;
    try {
      const { rows } = await pool.query(
        `INSERT INTO disputes (order_id, reason, opened_by_tg, seller_id, status, awaiting_evidence)
         VALUES ($1,$2,$3,$4,'open',true) RETURNING id`,
        [v.data.orderId, reason.slice(0, 1000), String(u.id), sel.length ? sel[0].seller_id : null]);
      d = rows[0];
    } catch (e) {
      // Unikal indeks: bitta buyurtmada bitta ochiq bahs
      if (e.code === '23505') return fail(res, "bu buyurtma bo'yicha ochiq bahs allaqachon bor", 409);
      throw e;
    }

    // Xaridordan dalil rasmini so'raymiz (bot suhbati)
    await notify(u.id,
      `📸 <b>Bahs #${d.id} ochildi</b>\n\nBuyurtma: <code>${escapeHtml(v.data.orderId)}</code>\n` +
      `<b>Muammo:</b> ${escapeHtml(reason)}\n\n` +
      `Iltimos, muammoni ko'rsatuvchi <b>rasm yoki video yuboring</b> (10 tagacha).\n` +
      `Yuborib bo'lgach <b>tayyor</b> deb yozing.`);

    await notify(ADMIN_CHAT_ID,
      `⚠️ <b>Yangi bahs #${d.id}</b>\n\nBuyurtma: <code>${escapeHtml(v.data.orderId)}</code>\n` +
      `<b>Xaridor:</b> ${escapeHtml(ord[0].buyer_name || "Noma'lum")}\n` +
      `<b>Muammo:</b> ${escapeHtml(reason)}\n\nAdmin panelning "Bahslar" bo'limida ko'rib chiqing.`);

    if (sel.length) {
      const { rows: stg } = await pool.query(
        `SELECT u.tg_user_id FROM sellers s JOIN users u ON u.id=s.user_id WHERE s.id=$1`, [sel[0].seller_id]);
      if (stg.length) {
        await notify(stg[0].tg_user_id,
          `⚠️ <b>Buyurtma bo'yicha shikoyat</b>\n\nBuyurtma: <code>${escapeHtml(v.data.orderId)}</code>\n` +
          `<b>Muammo:</b> ${escapeHtml(reason)}\n\nKabinetingizdagi buyurtma sahifasida javob yozing.`);
      }
    }

    ok(res, { id: d.id, status: 'open' }, 201);
  } catch (e) {
    console.error('createDispute xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// GET /api/disputes — xaridorning o'z bahslari (Mini App'da holatni ko'rsatish uchun)
async function handleGetDisputes(req, res, ip) {
  if (rateLimited(`disputelist:${ip}`, 60)) return fail(res, 'too many requests', 429);
  const u = await requestUser(req);   // Mini App yoki sayt — ikkalasi ham
  if (!u) return fail(res, 'unauthorized', 401);
  try {
    const { rows } = await pool.query(
      `SELECT id, order_id, reason, status, decision, refund_amount,
              seller_response, created_at, array_length(evidence_file_ids, 1) AS photos
         FROM disputes WHERE opened_by_tg = $1 ORDER BY created_at DESC LIMIT 50`,
      [String(u.id)]);
    ok(res, rows.map((r) => ({
      id: r.id,
      orderId: r.order_id,
      reason: r.reason,
      status: r.status,
      decision: r.decision,
      refundAmount: r.refund_amount === null ? null : Number(r.refund_amount),
      sellerResponse: r.seller_response,
      photos: r.photos || 0,
      date: dateLabel(new Date(r.created_at)),
    })));
  } catch (e) {
    console.error('getDisputes xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// POST /api/seller/dispute — sotuvchining bahsga javobi
async function handleSellerDisputeReply(req, res, ip) {
  if (rateLimited(`sellerdispute:${ip}`, 20)) return fail(res, 'too many requests', 429);
  const me = await requireSeller(req, res);
  if (!me) return;
  try {
    const data = JSON.parse(await readBody(req, 20_000));
    const v = validate(data, {
      disputeId: { type: 'int', required: true, min: 1 },
      response:  { type: 'string', required: true, min: 3, max: 1000 },
    });
    if (!v.ok) return fail(res, v.error, 400);

    // Egalik: bahs shu sotuvchining buyurtmasiga tegishli bo'lishi shart
    const { rows } = await pool.query(
      `UPDATE disputes SET seller_response=$1, seller_responded_at=now()
        WHERE id=$2 AND seller_id=$3 AND status='open'
        RETURNING id, order_id, opened_by_tg`,
      [v.data.response, v.data.disputeId, me.seller_id]);
    if (!rows.length) return fail(res, 'bahs topilmadi yoki allaqachon yopilgan', 404);

    await notify(rows[0].opened_by_tg,
      `💬 <b>Ishlab chiqaruvchi javob berdi</b>\n\nBuyurtma: <code>${escapeHtml(rows[0].order_id)}</code>\n` +
      `${escapeHtml(v.data.response)}\n\nModerator qarorini kuting.`);
    await notify(ADMIN_CHAT_ID,
      `💬 <b>Bahs #${rows[0].id}</b> — sotuvchi javob berdi:\n${escapeHtml(v.data.response)}`);

    ok(res, { id: rows[0].id });
  } catch (e) {
    console.error('sellerDisputeReply xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// GET /api/admin/disputes — moderator navbati (panel tokeni bilan)
async function handleAdminDisputes(req, res, ip) {
  if (rateLimited(`admindisputes:${ip}`, 30)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.order_id, d.reason, d.status, d.decision, d.at_fault,
              d.logistics_payer, d.refund_amount, d.seller_response, d.evidence_file_ids,
              d.awaiting_evidence, d.created_at, d.resolved_at,
              o.buyer_name, o.total_amount, o.status AS order_status,
              s.business_name_uz AS seller_name
         FROM disputes d
         JOIN orders o  ON o.id = d.order_id
         LEFT JOIN sellers s ON s.id = d.seller_id
        ORDER BY (d.status='open') DESC, d.created_at DESC
        LIMIT 100`);
    ok(res, rows.map((r) => ({
      id: r.id,
      orderId: r.order_id,
      reason: r.reason,
      status: r.status,
      decision: r.decision,
      atFault: r.at_fault,
      logisticsPayer: r.logistics_payer,
      refundAmount: r.refund_amount === null ? null : Number(r.refund_amount),
      sellerResponse: r.seller_response,
      awaitingEvidence: r.awaiting_evidence,
      buyerName: r.buyer_name,
      sellerName: r.seller_name,
      orderTotal: r.total_amount === null ? null : Number(r.total_amount),
      orderStatus: r.order_status,
      // Rasm havolasi imzolangan: Telegram fayl URL'ida bot tokeni bor,
      // uni panelga BERMAYMIZ — server proksi qiladi (handleDisputePhoto).
      photos: (r.evidence_file_ids || []).map((f) => `/api/admin/dispute-photo?f=${encodeURIComponent(f)}&s=${photoSig(f)}`),
      date: dateLabel(new Date(r.created_at)),
      ageHours: Math.floor((Date.now() - new Date(r.created_at).getTime()) / 3600000),
    })));
  } catch (e) {
    console.error('adminDisputes xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// Dalil rasmi uchun imzo: <img src> header yubora olmaydi, tokenni esa URL'ga
// qo'yib bo'lmaydi (nginx loglariga tushadi). Shuning uchun file_id dan
// ADMIN_PANEL_TOKEN bilan HMAC hosil qilamiz — imzo faqat shu faylga yaraydi.
function photoSig(fileId) {
  return crypto.createHmac('sha256', ADMIN_PANEL_TOKEN || 'x').update(String(fileId)).digest('hex').slice(0, 32);
}

async function handleDisputePhoto(req, res, ip) {
  if (rateLimited(`disputephoto:${ip}`, 120)) return fail(res, 'too many requests', 429);
  let f, s;
  try {
    const q = new URL(req.url, 'http://x').searchParams;
    f = q.get('f'); s = q.get('s');
  } catch (_) { return fail(res, 'invalid', 400); }
  if (!f || !s || !ADMIN_PANEL_TOKEN || !safeEqual(s, photoSig(f))) return fail(res, 'unauthorized', 401);
  try {
    const filePath = await tgGetFile(f);
    if (!filePath) return fail(res, 'not found', 404);
    // Telegram'dan oqim sifatida uzatamiz — fayl serverimizda saqlanmaydi
    https.get(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`, (tgRes) => {
      if (tgRes.statusCode !== 200) { tgRes.resume(); return fail(res, 'not found', 404); }
      res.writeHead(200, {
        'Content-Type': tgRes.headers['content-type'] || 'application/octet-stream',
        'Cache-Control': 'private, max-age=300',
      });
      tgRes.pipe(res);
    }).on('error', () => fail(res, 'server error', 500));
  } catch (e) {
    console.error('disputePhoto xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- 24 soatlik eslatma ----
// Ochiq bahs 24 soatdan oshsa adminga bir marta eslatma yuboriladi
// (reminded_at qo'yiladi — takror yuborilmaydi).
const DISPUTE_REMINDER_MS = 15 * 60 * 1000;
async function scanStaleDisputes() {
  try {
    const { rows } = await pool.query(
      `UPDATE disputes SET reminded_at = now()
        WHERE status='open' AND reminded_at IS NULL
          AND created_at < now() - interval '24 hours'
        RETURNING id, order_id, reason`);
    for (const d of rows) {
      await notify(ADMIN_CHAT_ID,
        `⏰ <b>Bahs #${d.id} 24 soatdan beri hal qilinmagan</b>\n\n` +
        `Buyurtma: <code>${escapeHtml(d.order_id)}</code>\n<b>Muammo:</b> ${escapeHtml(d.reason || '-')}`);
    }
  } catch (e) {
    console.error('disputes eslatma xatosi:', e.message);
  }
}
// ---- Dalil rasmi/videosi (bahs ochilgandan keyingi bot suhbati) ----
// Xaridorning ochiq, dalil kutayotgan bahsini topadi va file_id ni qo'shadi.
// Hech qanday fayl bizning serverga yuklanmaydi.
const MAX_EVIDENCE = 10;

async function openAwaitingDispute(tgUserId) {
  const { rows } = await pool.query(
    `SELECT id, order_id, array_length(evidence_file_ids, 1) AS n
       FROM disputes
      WHERE opened_by_tg = $1 AND status='open' AND awaiting_evidence = true
      ORDER BY created_at DESC LIMIT 1`,
    [String(tgUserId)]);
  return rows[0] || null;
}

async function handleDisputeEvidence(msg) {
  // Telegram rasmni bir necha o'lchamda yuboradi — eng kattasi oxirgi element
  const fileId = msg.photo ? msg.photo[msg.photo.length - 1].file_id
    : msg.video ? msg.video.file_id
    : null;
  if (!fileId) return false;

  const d = await openAwaitingDispute(msg.from.id);
  if (!d) return false;

  if ((d.n || 0) >= MAX_EVIDENCE) {
    await callTelegram('sendMessage', {
      chat_id: msg.chat.id,
      text: `Dalil chegarasi ${MAX_EVIDENCE} ta. Yuborib bo'lgan bo'lsangiz "tayyor" deb yozing.`,
    });
    return true;
  }

  const { rows } = await pool.query(
    `UPDATE disputes SET evidence_file_ids = array_append(evidence_file_ids, $1)
      WHERE id=$2 AND status='open' RETURNING array_length(evidence_file_ids,1) AS n`,
    [fileId, d.id]);
  const n = rows.length ? rows[0].n : 0;
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    text: `✅ Qabul qilindi (${n}/${MAX_EVIDENCE}). Yana yuborishingiz mumkin yoki "tayyor" deb yozing.`,
  });
  return true;
}

// "tayyor" — dalil yig'ish tugadi, moderator ko'rib chiqishga o'tadi
async function handleDisputeEvidenceDone(msg, text) {
  if (!/^(tayyor|tayyorman|готово|done)$/i.test(text.trim())) return false;
  const d = await openAwaitingDispute(msg.from.id);
  if (!d) return false;
  await pool.query(`UPDATE disputes SET awaiting_evidence=false WHERE id=$1`, [d.id]);
  await callTelegram('sendMessage', {
    chat_id: msg.chat.id,
    text: "Rahmat! Moderator ko'rib chiqadi va qaror haqida xabar beramiz.",
  });
  await notify(ADMIN_CHAT_ID, `📸 Bahs #${d.id} — xaridor dalillarni yuborib bo'ldi.`);
  return true;
}

module.exports = { handleCreateDispute, handleGetDisputes, handleSellerDisputeReply, handleAdminDisputes, handleDisputePhoto, scanStaleDisputes, handleDisputeEvidence, handleDisputeEvidenceDone, DISPUTE_REMINDER_MS };
