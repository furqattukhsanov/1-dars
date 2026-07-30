const { ADMIN_CHAT_ID, ADMIN_TG_IDS, COMMISSION_RATE } = require('../config');
const { pool } = require('../db');
const { adminPanelAuth, isAdmin } = require('../lib/auth');
const { escapeHtml, money, dateLabel } = require('../lib/format');
const { validate, ClientError } = require('../lib/validate');
const { rateLimited, readBody, ok, fail } = require('../lib/http');
const { callTelegram, callbackAnswer, notify } = require('../lib/telegram-api');
const { handleSellerApplicationReview } = require('./seller-application');
const { productPhotoUrl } = require('./catalog');

// ============ ADMIN PANEL RUXSATI ============
// admin/index.html (standalone sahifa) Telegram initData ishlab chiqara olmaydi,
// shuning uchun alohida sir — ADMIN_PANEL_TOKEN (X-Admin-Token header).
// ============ /api/admin/summary — admin panel statistikasi ============
// Savdo hajmi (GMV) hisobida bekor qilingan va qaytarilgan buyurtmalar
// hisobga olinmaydi — quyidagi so'rovlarda `status NOT IN ('cancelled','refunded')`.
// Ro'yxat ATAYLAB to'g'ridan-to'g'ri yozilgan, parametr sifatida emas:
// `status <> ALL($1)` da Postgres massiv parametrining tipini aniqlay olmay
// xato berishi mumkin.
async function handleAdminSummary(req, res, ip) {
  if (rateLimited(`adminsummary:${ip}`, 30)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;
  try {
    const [
      modRes, appRes, sellerRes, todayRes, catRes, ordersRes,
      dailyRes, monthlyRes, totalsRes, topSellersRes,
      appListRes, sellerListRes, modListRes, disputeRes,
    ] = await Promise.all([
      pool.query(`SELECT count(*)::int AS n FROM products WHERE status='pending'`),
      pool.query(`SELECT count(*)::int AS n FROM seller_applications WHERE status='pending' AND step='done'`),
      pool.query(`SELECT count(*)::int AS n FROM sellers WHERE is_verified = true`),
      pool.query(`SELECT count(*)::int AS n FROM orders WHERE created_at >= date_trunc('day', now())`),
      pool.query(`SELECT cat_key, count(*)::int AS n FROM products WHERE status='published' GROUP BY cat_key ORDER BY n DESC`),
      pool.query(`
        SELECT o.id, o.buyer_name, o.buyer_phone, o.source, o.status,
               o.total_amount, o.commission_amount,
               o.payout_amount, o.prepay_amount, o.created_at, o.paid_out_at,
               (SELECT count(*) FROM order_items oi WHERE oi.order_id = o.id)::int AS items_count,
               EXISTS (SELECT 1 FROM disputes d WHERE d.order_id = o.id AND d.status='open') AS has_dispute
          FROM orders o ORDER BY o.created_at DESC LIMIT 100`),

      // ---- Kunlik GMV (30 kun). generate_series bo'sh kunlarni ham qatorga
      // qo'shadi — aks holda grafik savdosiz kunlarni butunlay tashlab ketardi.
      pool.query(`
        SELECT d::date AS day,
               COALESCE(SUM(o.total_amount), 0)::bigint      AS gmv,
               COALESCE(SUM(o.commission_amount), 0)::bigint AS commission,
               COUNT(o.id)::int                              AS orders
          FROM generate_series(date_trunc('day', now()) - interval '29 days',
                               date_trunc('day', now()), interval '1 day') d
          LEFT JOIN orders o
                 ON o.created_at >= d AND o.created_at < d + interval '1 day'
                AND o.status NOT IN ('cancelled','refunded')
         GROUP BY d ORDER BY d`),

      // ---- Oylik GMV (12 oy) — Reja/Fakt sahifasi uchun
      pool.query(`
        SELECT m::date AS month,
               COALESCE(SUM(o.total_amount), 0)::bigint      AS gmv,
               COALESCE(SUM(o.commission_amount), 0)::bigint AS commission,
               COUNT(o.id)::int                              AS orders
          FROM generate_series(date_trunc('month', now()) - interval '11 months',
                               date_trunc('month', now()), interval '1 month') m
          LEFT JOIN orders o
                 ON o.created_at >= m AND o.created_at < m + interval '1 month'
                AND o.status NOT IN ('cancelled','refunded')
         GROUP BY m ORDER BY m`),

      pool.query(`
        SELECT COUNT(*)::int                                   AS orders_total,
               COALESCE(SUM(total_amount), 0)::bigint          AS gmv_total,
               COALESCE(SUM(commission_amount), 0)::bigint     AS commission_total,
               COUNT(*) FILTER (WHERE status='completed')::int AS completed,
               COALESCE(SUM(payout_amount) FILTER (WHERE status='delivered'), 0)::bigint AS payout_due
          FROM orders WHERE status NOT IN ('cancelled','refunded')`),

      // ---- Eng faol sotuvchilar (30 kun). Buyurtmada bir nechta sotuvchi
      // bo'lishi mumkin — shuning uchun order_items qatorlari bo'yicha yig'amiz.
      pool.query(`
        SELECT s.id, s.business_name_uz AS name,
               COUNT(DISTINCT o.id)::int                        AS orders,
               COALESCE(SUM(oi.qty * oi.unit_price), 0)::bigint AS gmv
          FROM sellers s
          JOIN products p     ON p.seller_id = s.id
          JOIN order_items oi ON oi.product_id = p.id
          JOIN orders o       ON o.id = oi.order_id AND o.status NOT IN ('cancelled','refunded')
         WHERE o.created_at >= now() - interval '30 days'
         GROUP BY s.id, s.business_name_uz
         ORDER BY gmv DESC LIMIT 10`),

      pool.query(`
        SELECT id, business_name, city, product_type, phone, tg_username, created_at
          FROM seller_applications
         WHERE status='pending' AND step='done'
         ORDER BY created_at DESC LIMIT 50`),

      pool.query(`
        SELECT s.id, s.business_name_uz AS name, s.city_uz AS city, s.rating, s.created_at,
               COALESCE(u.phone, sa.phone) AS phone,
               (SELECT count(*) FROM products p
                 WHERE p.seller_id = s.id AND p.status='published')::int AS products
          FROM sellers s
          LEFT JOIN users u ON u.id = s.user_id
          LEFT JOIN LATERAL (
            SELECT phone FROM seller_applications sa2
             WHERE sa2.tg_user_id = u.tg_user_id AND sa2.status='approved'
             ORDER BY sa2.reviewed_at DESC NULLS LAST LIMIT 1
          ) sa ON true
         WHERE s.is_verified = true
         ORDER BY s.created_at DESC LIMIT 100`),

      pool.query(`
        SELECT p.id, p.name_uz, p.price, p.unit, p.cat_key, p.img, p.img_file_id, p.stock, p.created_at,
               s.business_name_uz AS seller_name
          FROM products p
          LEFT JOIN sellers s ON s.id = p.seller_id
         WHERE p.status='pending' ORDER BY p.created_at DESC LIMIT 50`),

      pool.query(`SELECT count(*)::int AS n FROM disputes WHERE status='open'`),
    ]);

    const t = totalsRes.rows[0];
    ok(res, {
      moderationPending: modRes.rows[0].n,
      sellerAppsPending: appRes.rows[0].n,
      sellersVerified: sellerRes.rows[0].n,
      ordersToday: todayRes.rows[0].n,
      disputesOpen: disputeRes.rows[0].n,
      commissionRate: COMMISSION_RATE,

      totals: {
        orders: t.orders_total,
        gmv: Number(t.gmv_total),
        commission: Number(t.commission_total),
        completed: t.completed,
        // Yetkazilgan, lekin hali sotuvchiga o'tkazilmagan summa
        payoutDue: Number(t.payout_due),
      },

      daily: dailyRes.rows.map((r) => ({
        day: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day),
        gmv: Number(r.gmv),
        commission: Number(r.commission),
        orders: r.orders,
      })),
      monthly: monthlyRes.rows.map((r) => ({
        month: r.month instanceof Date ? r.month.toISOString().slice(0, 7) : String(r.month).slice(0, 7),
        gmv: Number(r.gmv),
        commission: Number(r.commission),
        orders: r.orders,
      })),

      topSellers: topSellersRes.rows.map((r) => ({
        id: r.id, name: r.name, orders: r.orders, gmv: Number(r.gmv),
      })),

      categories: catRes.rows.map((r) => ({ catKey: r.cat_key, count: r.n })),

      recentOrders: ordersRes.rows.map((r) => ({
        id: r.id,
        buyerName: r.buyer_name,
        // Sayt buyurtmasida Telegram yo'q — telefon yagona bog'lanish yo'li
        phone: r.buyer_phone,
        source: r.source,
        status: r.status,
        total: r.total_amount === null ? null : Number(r.total_amount),
        commission: r.commission_amount === null ? null : Number(r.commission_amount),
        payout: r.payout_amount === null ? null : Number(r.payout_amount),
        prepay: r.prepay_amount === null ? null : Number(r.prepay_amount),
        paidOut: !!r.paid_out_at,
        hasDispute: r.has_dispute,
        itemsCount: r.items_count,
        date: dateLabel(new Date(r.created_at)),
      })),

      applications: appListRes.rows.map((r) => ({
        id: r.id,
        business: r.business_name,
        city: r.city,
        productType: r.product_type,
        phone: r.phone,
        tgUsername: r.tg_username,
        date: dateLabel(new Date(r.created_at)),
      })),

      sellers: sellerListRes.rows.map((r) => ({
        id: r.id, name: r.name, city: r.city, phone: r.phone,
        products: r.products,
        rating: r.rating == null ? null : Number(r.rating),
        joined: new Date(r.created_at).toISOString().slice(0, 10),
      })),

      moderationQueue: modListRes.rows.map((r) => ({
        id: r.id,
        name: r.name_uz,
        price: Number(r.price),
        unit: r.unit,
        catKey: r.cat_key,
        img: r.img_file_id ? productPhotoUrl(r.img_file_id) : r.img,
        stock: r.stock === null ? null : Number(r.stock),
        sellerName: r.seller_name,
        date: dateLabel(new Date(r.created_at)),
      })),
    });
  } catch (e) {
    console.error('adminSummary xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ ADMIN AMALLARI: panel so'raydi → Telegram tasdiqlaydi ============
//
// Nega ikki bosqich (2026-07-27 founder qarori):
// admin panel tokeni brauzer sessionStorage'da yashaydi va o'g'irlanishi mumkin.
// Pul o'tkazish, refund va bahs qarori — qaytarib bo'lmaydigan amallar, ular
// uchun bitta token yetarli emas. Panel faqat SO'ROV yaratadi; amal ADMIN_CHAT_ID
// chatidagi tugma bosilgandan keyin bajariladi. Tasdiqlovchi shaxs Telegram
// hisobiga ega bo'lishi shart — ya'ni ikkinchi, mustaqil omil.
//
// So'rov 30 daqiqadan keyin eskiradi — kechagi tugmani bosib qo'yish xavfi yo'q.
const ADMIN_ACTION_TTL_MS = 30 * 60 * 1000;

// Buyurtmada qatnashgan sotuvchilarning Telegram ID'lari (xabar yuborish uchun).
// Bitta buyurtmada bir nechta sotuvchi bo'lishi mumkin.
async function sellerTgIdsForOrder(orderId) {
  const { rows } = await pool.query(
    `SELECT DISTINCT u.tg_user_id
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN sellers s  ON s.id = p.seller_id
       JOIN users u    ON u.id = s.user_id
      WHERE oi.order_id = $1 AND u.tg_user_id IS NOT NULL`,
    [orderId]
  );
  return rows.map((r) => r.tg_user_id);
}

// Har amal turi uchun: kirishni tekshirish (check), tasdiq xabari matni
// (summary) va bajarish (run). `run` DB'ni o'zgartiradi va xabar yuboradi;
// ClientError tashlasa admin chatiga sabab qaytadi.
const ADMIN_ACTIONS = {
  seller_approve: {
    schema: {},
    async check(targetId) {
      const { rows } = await pool.query(
        `SELECT id, business_name, city FROM seller_applications
          WHERE id = $1 AND status='pending' AND step='done'`, [Number(targetId) || 0]);
      if (!rows.length) throw new ClientError("ariza topilmadi yoki allaqachon ko'rib chiqilgan");
      return rows[0];
    },
    summary: (t) => `🆕 <b>Sotuvchini tasdiqlash</b>\n\n${escapeHtml(t.business_name || '?')} — ${escapeHtml(t.city || '?')}`,
    run: (a) => handleSellerApplicationReview(ADMIN_CHAT_ID, 'approve', Number(a.target_id)),
  },

  seller_reject: {
    schema: { reason: { type: 'string', required: false, max: 500 } },
    check: (targetId) => ADMIN_ACTIONS.seller_approve.check(targetId),
    summary: (t, p) =>
      `🚫 <b>Sotuvchi arizasini rad etish</b>\n\n${escapeHtml(t.business_name || '?')}` +
      (p.reason ? `\n<b>Sabab:</b> ${escapeHtml(p.reason)}` : ''),
    run: (a) => handleSellerApplicationReview(ADMIN_CHAT_ID, 'reject', Number(a.target_id), a.payload.reason),
  },

  product_publish: {
    schema: {},
    async check(targetId) {
      const { rows } = await pool.query(
        `SELECT id, name_uz, price FROM products WHERE id = $1 AND status='pending'`, [String(targetId)]);
      if (!rows.length) throw new ClientError("e'lon topilmadi yoki allaqachon ko'rib chiqilgan");
      return rows[0];
    },
    summary: (t) => `✅ <b>E'lonni nashr qilish</b>\n\n${escapeHtml(t.name_uz)} — ${escapeHtml(money(t.price))}`,
    async run(a) {
      const { rows } = await pool.query(
        `UPDATE products SET status='published', reject_reason=NULL, reviewed_at=now()
          WHERE id=$1 AND status='pending' RETURNING id, name_uz, submitted_by_tg`,
        [a.target_id]);
      if (!rows.length) throw new ClientError("e'lon holati o'zgargan");
      await notify(rows[0].submitted_by_tg,
        `✅ <b>E'loningiz nashr etildi</b>\n\n${escapeHtml(rows[0].name_uz)} endi katalogda ko'rinadi.`);
      return `✅ nashr etildi: ${rows[0].name_uz}`;
    },
  },

  product_reject: {
    schema: { reason: { type: 'string', required: false, max: 500 } },
    check: (targetId) => ADMIN_ACTIONS.product_publish.check(targetId),
    summary: (t, p) =>
      `🚫 <b>E'lonni rad etish</b>\n\n${escapeHtml(t.name_uz)}` +
      (p.reason ? `\n<b>Sabab:</b> ${escapeHtml(p.reason)}` : ''),
    async run(a) {
      const { rows } = await pool.query(
        `UPDATE products SET status='rejected', reject_reason=$1, reviewed_at=now()
          WHERE id=$2 AND status='pending' RETURNING id, name_uz, submitted_by_tg`,
        [a.payload.reason || null, a.target_id]);
      if (!rows.length) throw new ClientError("e'lon holati o'zgargan");
      await notify(rows[0].submitted_by_tg,
        `🚫 <b>E'loningiz rad etildi</b>\n\n${escapeHtml(rows[0].name_uz)}` +
        (a.payload.reason ? `\n<b>Sabab:</b> ${escapeHtml(a.payload.reason)}` : '') +
        `\n\nTuzatib qayta yuborishingiz mumkin.`);
      return `🚫 rad etildi: ${rows[0].name_uz}`;
    },
  },

  // "Pul o'tkazildi" — savdoni yakunlaydi. Faqat yetkazilgan buyurtmada
  // mumkin va ochiq bahs bo'lmasligi shart (bahs hal bo'lmasdan pul ketmasin).
  order_payout: {
    schema: {},
    async check(targetId) {
      const { rows } = await pool.query(
        `SELECT o.id, o.status, o.total_amount, o.payout_amount, o.commission_amount,
                EXISTS (SELECT 1 FROM disputes d WHERE d.order_id=o.id AND d.status='open') AS has_dispute
           FROM orders o WHERE o.id = $1`, [String(targetId)]);
      if (!rows.length) throw new ClientError('buyurtma topilmadi');
      const o = rows[0];
      if (o.status !== 'delivered') throw new ClientError(`faqat "yetkazildi" holatida mumkin (hozir: ${o.status})`);
      if (o.has_dispute) throw new ClientError('bu buyurtmada ochiq bahs bor — avval uni hal qiling');
      return o;
    },
    summary: (t) =>
      `💸 <b>Sotuvchiga pul o'tkazish</b>\n\n<b>Buyurtma:</b> <code>${escapeHtml(t.id)}</code>\n` +
      `<b>Jami:</b> ${escapeHtml(money(t.total_amount))}\n` +
      `<b>Komissiya:</b> ${escapeHtml(money(t.commission_amount || 0))}\n` +
      `<b>Sotuvchiga:</b> ${escapeHtml(money(t.payout_amount || 0))}`,
    async run(a) {
      const { rows } = await pool.query(
        `UPDATE orders SET status='completed', paid_out_at=now()
          WHERE id=$1 AND status='delivered' RETURNING id, payout_amount`,
        [a.target_id]);
      if (!rows.length) throw new ClientError("buyurtma holati o'zgargan");
      for (const tg of await sellerTgIdsForOrder(a.target_id)) {
        await notify(tg,
          `💸 <b>To'lov o'tkazildi</b>\n\nBuyurtma: <code>${escapeHtml(a.target_id)}</code>\n` +
          `Summa: ${escapeHtml(money(rows[0].payout_amount || 0))}`);
      }
      return `💸 ${a.target_id} — pul o'tkazildi deb belgilandi`;
    },
  },

  // Refund — hozircha BUXGALTERIYA yozuvi: Payme/Click ulanmagan, pul qo'lda
  // qaytariladi. Bu yozuv "qaytarildi" faktini qayd etadi va xaridorga xabar
  // beradi; haqiqiy o'tkazma platforma tashqarisida bajariladi.
  order_refund: {
    schema: {
      amount: { type: 'int', required: true, min: 1, max: 100000000000 },
      reason: { type: 'string', required: true, min: 3, max: 500 },
    },
    async check(targetId, p) {
      const { rows } = await pool.query(
        `SELECT id, status, total_amount, tg_user_id FROM orders WHERE id = $1`, [String(targetId)]);
      if (!rows.length) throw new ClientError('buyurtma topilmadi');
      const o = rows[0];
      if (o.status === 'refunded') throw new ClientError('bu buyurtma allaqachon qaytarilgan');
      if (p.amount > Number(o.total_amount)) throw new ClientError('qaytarish summasi buyurtma summasidan katta');
      return o;
    },
    summary: (t, p) =>
      `↩️ <b>Pul qaytarish</b>\n\n<b>Buyurtma:</b> <code>${escapeHtml(t.id)}</code>\n` +
      `<b>Buyurtma summasi:</b> ${escapeHtml(money(t.total_amount))}\n` +
      `<b>Qaytariladi:</b> ${escapeHtml(money(p.amount))}` +
      (p.amount < Number(t.total_amount) ? ' (qisman)' : ' (to\'liq)') +
      `\n<b>Sabab:</b> ${escapeHtml(p.reason)}\n\n` +
      `<i>Diqqat: pul o'tkazmasi qo'lda bajariladi — bu yozuv faqat faktni qayd etadi.</i>`,
    async run(a) {
      const { rows } = await pool.query(
        `UPDATE orders SET status='refunded', refund_amount=$1, refund_reason=$2, refunded_at=now()
          WHERE id=$3 AND status <> 'refunded' RETURNING id, tg_user_id`,
        [a.payload.amount, a.payload.reason, a.target_id]);
      if (!rows.length) throw new ClientError("buyurtma holati o'zgargan");
      await notify(rows[0].tg_user_id,
        `↩️ <b>Pul qaytarildi</b>\n\nBuyurtma: <code>${escapeHtml(a.target_id)}</code>\n` +
        `Summa: ${escapeHtml(money(a.payload.amount))}\n<b>Sabab:</b> ${escapeHtml(a.payload.reason)}`);
      return `↩️ ${a.target_id} — ${money(a.payload.amount)} qaytarildi`;
    },
  },

  // Bahs qarori: kim aybdor + logistikani kim to'laydi + ixtiyoriy qaytarish.
  dispute_resolve: {
    schema: {
      atFault:        { type: 'string', required: true, enum: ['buyer', 'seller', 'none'] },
      logisticsPayer: { type: 'string', required: true, enum: ['buyer', 'seller', 'platform'] },
      decision:       { type: 'string', required: true, min: 3, max: 1000 },
      refundAmount:   { type: 'int', required: false, min: 0, max: 100000000000, default: 0 },
    },
    async check(targetId, p) {
      const { rows } = await pool.query(
        `SELECT d.id, d.order_id, d.reason, d.status, o.total_amount, o.tg_user_id
           FROM disputes d JOIN orders o ON o.id = d.order_id
          WHERE d.id = $1`, [Number(targetId) || 0]);
      if (!rows.length) throw new ClientError('bahs topilmadi');
      if (rows[0].status !== 'open') throw new ClientError('bahs allaqachon hal qilingan');
      if (p.refundAmount > Number(rows[0].total_amount)) {
        throw new ClientError('qaytarish summasi buyurtma summasidan katta');
      }
      return rows[0];
    },
    summary: (t, p) => {
      const FAULT = { buyer: 'Xaridor', seller: 'Sotuvchi', none: 'Hech kim' };
      const PAYER = { buyer: 'Xaridor', seller: 'Sotuvchi', platform: 'Platforma' };
      return `⚖️ <b>Bahs qarori</b> — #${t.id}\n\n` +
        `<b>Buyurtma:</b> <code>${escapeHtml(t.order_id)}</code>\n` +
        `<b>Xaridor shikoyati:</b> ${escapeHtml(t.reason || '-')}\n\n` +
        `<b>Aybdor:</b> ${FAULT[p.atFault]}\n` +
        `<b>Logistikani to'laydi:</b> ${PAYER[p.logisticsPayer]}\n` +
        (p.refundAmount ? `<b>Qaytariladi:</b> ${escapeHtml(money(p.refundAmount))}\n` : '') +
        `<b>Qaror:</b> ${escapeHtml(p.decision)}`;
    },
    async run(a) {
      const p = a.payload;
      let client;
      let d;
      try {
        client = await pool.connect();
        await client.query('BEGIN');
        const { rows } = await client.query(
          `UPDATE disputes SET status='resolved', decision=$1, at_fault=$2,
                  logistics_payer=$3, refund_amount=$4, resolved_at=now(), awaiting_evidence=false
            WHERE id=$5 AND status='open'
            RETURNING id, order_id, opened_by_tg`,
          [p.decision, p.atFault, p.logisticsPayer, p.refundAmount || null, Number(a.target_id)]);
        if (!rows.length) throw new ClientError('bahs allaqachon hal qilingan');
        d = rows[0];
        // Qaytarish belgilangan bo'lsa buyurtma ham 'refunded' bo'ladi —
        // shunda pul o'tkazish (payout) endi mumkin bo'lmaydi.
        if (p.refundAmount > 0) {
          await client.query(
            `UPDATE orders SET status='refunded', refund_amount=$1,
                    refund_reason=$2, refunded_at=now()
              WHERE id=$3 AND status <> 'refunded'`,
            [p.refundAmount, `Bahs #${d.id}: ${p.decision}`.slice(0, 500), d.order_id]);
        }
        await client.query('COMMIT');
      } catch (e) {
        if (client) await client.query('ROLLBACK').catch(() => {});
        throw e;
      } finally {
        if (client) client.release();
      }

      const text =
        `⚖️ <b>Bahs bo'yicha qaror qabul qilindi</b>\n\n` +
        `Buyurtma: <code>${escapeHtml(d.order_id)}</code>\n` +
        `<b>Qaror:</b> ${escapeHtml(p.decision)}` +
        (p.refundAmount ? `\n<b>Qaytariladi:</b> ${escapeHtml(money(p.refundAmount))}` : '');
      await notify(d.opened_by_tg, text);
      for (const tg of await sellerTgIdsForOrder(d.order_id)) await notify(tg, text);
      return `⚖️ Bahs #${d.id} hal qilindi`;
    },
  },
};

// ---- POST /api/admin/action — paneldan amal SO'RASH ----
async function handleAdminActionRequest(req, res, ip) {
  if (rateLimited(`adminaction:${ip}`, 20)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;
  try {
    const data = JSON.parse(await readBody(req, 20_000));
    const def = ADMIN_ACTIONS[data.kind];
    if (!def) return fail(res, "noma'lum amal", 400);
    const targetId = String(data.targetId || '').trim();
    if (!targetId) return fail(res, 'targetId kerak', 400);

    const v = validate(data.payload || {}, def.schema);
    if (!v.ok) return fail(res, v.error, 400);

    // Oldindan tekshiruv: admin Telegram'da mantiqsiz so'rov ko'rmasin
    // (masalan allaqachon hal qilingan bahs uchun tugma).
    const target = await def.check(targetId, v.data);

    const { rows } = await pool.query(
      `INSERT INTO admin_actions (kind, target_id, payload) VALUES ($1,$2,$3) RETURNING id`,
      [data.kind, targetId, JSON.stringify(v.data)]);
    const actionId = rows[0].id;

    const sent = await callTelegram('sendMessage', {
      chat_id: ADMIN_CHAT_ID,
      parse_mode: 'HTML',
      text: `${def.summary(target, v.data)}\n\n<i>So'rov admin paneldan keldi. Tasdiqlaysizmi?</i>`,
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Tasdiqlash', callback_data: `aa:${actionId}:ok` },
          { text: '✖️ Bekor',      callback_data: `aa:${actionId}:no` },
        ]],
      },
    });

    // Telegram'ga xabar ketmasa so'rov abadiy "pending" bo'lib osilib qolardi —
    // darhol yopamiz va panelga aniq sabab qaytaramiz.
    let messageId = null;
    try { messageId = JSON.parse(sent.body).result.message_id; } catch (_) {}
    if (!messageId) {
      await pool.query(`UPDATE admin_actions SET status='failed', error=$1, decided_at=now() WHERE id=$2`,
        ['Telegram xabarini yuborib bo\'lmadi', actionId]);
      return fail(res, "Telegram'ga tasdiq so'rovi yuborilmadi — keyinroq urinib ko'ring", 502);
    }
    await pool.query(`UPDATE admin_actions SET tg_message_id=$1 WHERE id=$2`, [messageId, actionId]);

    ok(res, { id: actionId, status: 'pending' }, 201);
  } catch (e) {
    console.error('adminAction xatosi:', e.message);
    if (e.userFacing) return fail(res, e.message, 400);
    fail(res, 'server error', 500);
  }
}

// ---- GET /api/admin/action?id= — panel natijani kutadi ----
async function handleAdminActionStatus(req, res, ip) {
  if (rateLimited(`adminactionst:${ip}`, 120)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;
  let id;
  try { id = new URL(req.url, 'http://x').searchParams.get('id'); } catch (_) { id = null; }
  if (!id || !/^\d+$/.test(id)) return fail(res, 'invalid id', 400);
  try {
    const { rows } = await pool.query(
      `SELECT id, kind, status, error, requested_at FROM admin_actions WHERE id=$1`, [Number(id)]);
    if (!rows.length) return fail(res, 'not found', 404);
    const a = rows[0];
    // Eskirganini o'qish paytida ham belgilaymiz — panel "abadiy kutish"da qolmasin
    if (a.status === 'pending' && Date.now() - new Date(a.requested_at).getTime() > ADMIN_ACTION_TTL_MS) {
      await pool.query(`UPDATE admin_actions SET status='expired', decided_at=now() WHERE id=$1 AND status='pending'`, [a.id]);
      a.status = 'expired';
    }
    ok(res, { id: a.id, kind: a.kind, status: a.status, error: a.error });
  } catch (e) {
    console.error('adminActionStatus xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- Telegram tugmasi bosilganda ----
async function handleAdminActionCallback(cq) {
  const m = String(cq.data || '').match(/^aa:(\d+):(ok|no)$/);
  if (!m) return;
  const actionId = Number(m[1]);
  const approved = m[2] === 'ok';

  // Tugmani kim bosgani MUHIM: xabar admin chatida tursa ham, tasdiqlovchi
  // ADMIN_TG_IDS ro'yxatida bo'lishi shart (guruhga qo'shilgan begona bosmasin).
  if (!isAdmin(cq.from)) {
    await callbackAnswer(cq.id, 'Ruxsat yo\'q');
    return;
  }

  const { rows } = await pool.query(`SELECT * FROM admin_actions WHERE id=$1`, [actionId]);
  if (!rows.length) return callbackAnswer(cq.id, 'So\'rov topilmadi');
  const a = rows[0];
  if (a.status !== 'pending') return callbackAnswer(cq.id, `Allaqachon ko'rib chiqilgan (${a.status})`);
  if (Date.now() - new Date(a.requested_at).getTime() > ADMIN_ACTION_TTL_MS) {
    await pool.query(`UPDATE admin_actions SET status='expired', decided_at=now() WHERE id=$1`, [actionId]);
    return callbackAnswer(cq.id, "So'rov eskirdi — paneldan qayta yuboring");
  }

  let resultText;
  if (!approved) {
    await pool.query(
      `UPDATE admin_actions SET status='declined', decided_at=now(), decided_by=$1 WHERE id=$2 AND status='pending'`,
      [String(cq.from.id), actionId]);
    resultText = '✖️ Bekor qilindi';
  } else {
    try {
      // Ijrochi ClientError tashlasa — bu biznes sababi (holat o'zgargan),
      // uni adminga ko'rsatamiz. Boshqa xatolar yashiriladi.
      const out = await ADMIN_ACTIONS[a.kind].run(a);
      await pool.query(
        `UPDATE admin_actions SET status='done', decided_at=now(), decided_by=$1 WHERE id=$2 AND status='pending'`,
        [String(cq.from.id), actionId]);
      resultText = typeof out === 'string' ? out : '✅ Bajarildi';
    } catch (e) {
      console.error('adminAction run xatosi:', e.message);
      const reason = e.userFacing ? e.message : 'ichki xato';
      await pool.query(
        `UPDATE admin_actions SET status='failed', error=$1, decided_at=now(), decided_by=$2 WHERE id=$3`,
        [reason, String(cq.from.id), actionId]);
      resultText = `❌ Bajarilmadi: ${reason}`;
    }
  }

  await callbackAnswer(cq.id, resultText.slice(0, 190));
  if (a.tg_message_id) {
    await callTelegram('editMessageReplyMarkup', {
      chat_id: ADMIN_CHAT_ID, message_id: a.tg_message_id, reply_markup: { inline_keyboard: [] },
    }).catch(() => {});
  }
  await notify(ADMIN_CHAT_ID, resultText);
}

module.exports = { handleAdminSummary, handleAdminActionRequest, handleAdminActionStatus, handleAdminActionCallback };
