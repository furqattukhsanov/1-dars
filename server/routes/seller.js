const { ADMIN_CHAT_ID } = require('../config');
const { pool } = require('../db');
const { authUser, isAdmin, currentSeller, requireSeller } = require('../lib/auth');
const { escapeHtml, dateLabel } = require('../lib/format');
const { validate } = require('../lib/validate');
const { rateLimited, readBody, ok, fail } = require('../lib/http');
const { callTelegram, notify } = require('../lib/telegram-api');
const { recordStatusChange } = require('../lib/order-history');
const { productPhotoUrl } = require('./catalog');
const { restoreStock } = require('./orders');

// ============ SOTUVCHI KABINETI ============
// Rol tekshiruvi (currentSeller / requireSeller) lib/auth.js da.

// ============ /api/me — men kimman (rol + sotuvchi profili) ============
async function handleMe(req, res, ip) {
  if (rateLimited(`me:${ip}`, 60)) return fail(res, 'too many requests', 429);
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  try {
    const me = await currentSeller(u);
    ok(res, {
      role: me ? me.role : 'buyer',
      isAdmin: isAdmin(u),
      seller: me && me.seller_id
        ? { id: me.seller_id, name: { uz: me.business_name_uz, ru: me.business_name_ru || me.business_name_uz }, verified: me.is_verified }
        : null,
    });
  } catch (e) {
    console.error('me xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/seller/products GET — sotuvchining o'z mahsulotlari ============
// Ommaviy katalogdan farqi: bu yerda BARCHA holatlar ko'rinadi
// (pending — moderatsiyada, rejected — rad etilgan, draft — yashirilgan).
async function handleSellerProducts(req, res, ip) {
  if (rateLimited(`sellerprod:${ip}`, 60)) return fail(res, 'too many requests', 429);
  const me = await requireSeller(req, res);
  if (!me) return;
  try {
    const { rows } = await pool.query(
      `SELECT id, name_uz, name_ru, price, unit, moq, cat_key, img, img_file_id, awaiting_image, stock, status, reject_reason, created_at
         FROM products WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 200`,
      [me.seller_id]
    );
    ok(res, rows.map((r) => ({
      id: r.id,
      name: { uz: r.name_uz, ru: r.name_ru || r.name_uz },
      price: Number(r.price),
      unit: r.unit,
      moq: Number(r.moq),
      catKey: r.cat_key,
      img: r.img_file_id ? productPhotoUrl(r.img_file_id) : r.img,
      awaitingImage: r.awaiting_image,
      stock: r.stock === null ? null : Number(r.stock),
      status: r.status,
      rejectReason: r.reject_reason,
    })));
  } catch (e) {
    console.error('sellerProducts xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/seller/product PATCH — tahrirlash / yashirish ============
// Yashirish = status 'draft' (katalogdan chiqadi). Qayta ko'rsatish moderatsiyaga
// qaytadi ('pending') — narx yoki nom o'zgargan bo'lishi mumkin, qayta ko'riladi.
async function handleSellerProductUpdate(req, res, ip) {
  if (rateLimited(`sellerpatch:${ip}`, 30)) return fail(res, 'too many requests', 429);
  const me = await requireSeller(req, res);
  if (!me) return;
  try {
    const data = JSON.parse(await readBody(req, 20_000));
    const id = String(data.id || '').trim();
    if (!id) return fail(res, 'id kerak', 400);

    // Mahsulot shu sotuvchiniki ekanini tasdiqlaymiz (boshqaniki tahrirlanmasin)
    const { rows: own } = await pool.query(
      `SELECT id, status, name_uz FROM products WHERE id = $1 AND seller_id = $2`,
      [id, me.seller_id]
    );
    if (!own.length) return fail(res, 'mahsulot topilmadi', 404);

    // Rasm yo'q yoki almashtirish kerak — bot yana rasm so'raydi (yangi
    // e'lon oqimi bilan bir xil: submitted_by_tg orqali topiladi).
    if (data.action === 'request_image') {
      await pool.query(
        `UPDATE products SET awaiting_image=true WHERE id=$1`, [id]);
      notify(me.tg.id,
        `🖼 <b>${escapeHtml(own[0].name_uz || '')}</b> uchun rasm yuboring.`);
      return ok(res, { id, awaitingImage: true });
    }

    if (data.action === 'hide') {
      const { rows } = await pool.query(
        `UPDATE products SET status = 'draft' WHERE id = $1 RETURNING id, status`, [id]);
      return ok(res, rows[0]);
    }
    if (data.action === 'show') {
      const { rows } = await pool.query(
        `UPDATE products SET status = 'pending' WHERE id = $1 RETURNING id, status`, [id]);
      return ok(res, rows[0]);
    }

    // Tahrirlash — o'zgargan e'lon qayta moderatsiyaga tushadi
    const v = validate(data, {
      name_uz: { type: 'string', required: true, min: 2, max: 200 },
      name_ru: { type: 'string', required: false, max: 200 },
      price:   { type: 'int', required: true, min: 1, max: 100000000000 },
      moq:     { type: 'int', required: false, min: 1, max: 100000, default: 1 },
      comp_uz: { type: 'string', required: false, max: 500 },
      stock:   { type: 'int', required: false, min: 0, max: 1000000 },
    });
    if (!v.ok) return fail(res, v.error, 400);
    const d = v.data;
    // `stock` faqat so'rovda AYNAN yuborilgan bo'lsa yangilanadi. Sabab: eski
    // keshlangan klient bu maydonni umuman yubormaydi — `d.stock` esa null
    // (= cheksiz) bo'lib chiqadi va tahrirlash jimgina zaxira cheklovini
    // o'chirib yuborardi. Yangi klient bo'sh maydonni ataylab null yuboradi.
    const stockSent = Object.prototype.hasOwnProperty.call(data, 'stock');
    const { rows } = await pool.query(
      `UPDATE products SET name_uz=$1, name_ru=$2, price=$3, moq=$4, comp_uz=$5,
              stock = CASE WHEN $7::boolean THEN $8::int ELSE stock END,
              status='pending', reject_reason=NULL
         WHERE id=$6 RETURNING id, status`,
      [d.name_uz, d.name_ru || null, d.price, d.moq, d.comp_uz || null, id, stockSent, d.stock]
    );
    ok(res, rows[0]);
  } catch (e) {
    console.error('sellerProductUpdate xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/seller/orders GET — sotuvchiga kelgan buyurtmalar ============
// Buyurtma bir nechta sotuvchining mahsulotini o'z ichiga olishi mumkin —
// shuning uchun faqat SHU sotuvchining qatorlari va ular bo'yicha summa qaytadi.
async function handleSellerOrders(req, res, ip) {
  if (rateLimited(`sellerorders:${ip}`, 60)) return fail(res, 'too many requests', 429);
  const me = await requireSeller(req, res);
  if (!me) return;
  try {
    const { rows } = await pool.query(
      // Ochiq bahs ham qo'shiladi — sotuvchi kabinetidan javob yoza olishi kerak
      `SELECT o.id, o.status, o.created_at, o.buyer_name, o.address, o.comment,
              o.total_amount, o.prepay_amount, o.rest_amount, o.tracking_code,
              oi.product_id, oi.name AS item_name, oi.qty, oi.unit_price,
              d.id AS dispute_id, d.reason AS dispute_reason, d.seller_response
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p ON p.id = oi.product_id
         LEFT JOIN LATERAL (
           SELECT id, reason, seller_response FROM disputes
            WHERE order_id = o.id AND status = 'open' LIMIT 1
         ) d ON true
        WHERE p.seller_id = $1
        ORDER BY o.created_at DESC
        LIMIT 300`,
      [me.seller_id]
    );
    const byOrder = new Map();
    for (const r of rows) {
      if (!byOrder.has(r.id)) {
        byOrder.set(r.id, {
          id: r.id,
          statusKey: r.status,
          date: dateLabel(new Date(r.created_at)),
          createdAt: r.created_at,
          buyerName: r.buyer_name,
          address: r.address,
          comment: r.comment,
          tracking: r.tracking_code,
          dispute: r.dispute_id
            ? { id: r.dispute_id, reason: r.dispute_reason, sellerResponse: r.seller_response }
            : null,
          // Butun buyurtma summasi (barcha sotuvchilar bo'yicha) — ma'lumot uchun
          orderTotal: r.total_amount === null ? null : Number(r.total_amount),
          prepay: r.prepay_amount === null ? null : Number(r.prepay_amount),
          rest: r.rest_amount === null ? null : Number(r.rest_amount),
          items: [],
          sellerTotal: 0,   // faqat shu sotuvchining qatorlari yig'indisi
        });
      }
      const o = byOrder.get(r.id);
      const line = Number(r.unit_price) * Number(r.qty);
      o.items.push({ id: r.product_id, name: r.item_name, qty: Number(r.qty), unitPrice: Number(r.unit_price) });
      o.sellerTotal += line;
    }
    ok(res, [...byOrder.values()]);
  } catch (e) {
    console.error('sellerOrders xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/seller/order POST — qabul / rad etish / jo'natish ============
const SELLER_ORDER_ACTIONS = {
  accept: {
    from: ['pending'], to: 'confirmed',
    buyerText: (id) => `✅ <b>Buyurtmangiz tasdiqlandi!</b>\n\nBuyurtma: <code>${escapeHtml(id)}</code>\nIshlab chiqaruvchi qabul qildi — tez orada jo'natiladi.`,
  },
  reject: {
    from: ['pending'], to: 'cancelled',
    // Mato hali jo'natilmagan — zaxira omborga qaytariladi
    restoresStock: true,
    buyerText: (id) => `❌ <b>Buyurtma bekor qilindi</b>\n\nBuyurtma: <code>${escapeHtml(id)}</code>\nIshlab chiqaruvchi qabul qila olmadi. Oldindan to'lov qaytariladi — savdo bo'limi bog'lanadi.`,
  },
  ship: {
    from: ['confirmed'], to: 'shipped',
    buyerText: (id, tracking) =>
      `🚚 <b>Buyurtmangiz yo'lga chiqdi</b>\n\nBuyurtma: <code>${escapeHtml(id)}</code>` +
      (tracking ? `\nBTS trek: <code>${escapeHtml(tracking)}</code>` : '') +
      `\n\nBTS'ga yetib kelgach qolgan to'lovni amalga oshirasiz.`,
  },
};

async function handleSellerOrderAction(req, res, ip) {
  if (rateLimited(`sellerorderact:${ip}`, 30)) return fail(res, 'too many requests', 429);
  const me = await requireSeller(req, res);
  if (!me) return;
  try {
    const data = JSON.parse(await readBody(req, 20_000));
    const orderId = String(data.orderId || '').trim();
    const cmd = SELLER_ORDER_ACTIONS[data.action];
    if (!orderId || !cmd) return fail(res, "noto'g'ri so'rov", 400);

    const tracking = cmd.to === 'shipped' ? String(data.tracking || '').trim().slice(0, 60) : null;
    if (cmd.to === 'shipped' && !tracking) return fail(res, 'BTS trek raqamini kiriting', 400);

    // Buyurtma shu sotuvchining mahsulotini o'z ichiga oladimi? (begona buyurtma boshqarilmasin)
    const { rows: mine } = await pool.query(
      `SELECT 1 FROM order_items oi JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1 AND p.seller_id = $2 LIMIT 1`,
      [orderId, me.seller_id]
    );
    if (!mine.length) return fail(res, 'buyurtma topilmadi', 404);

    // Holat o'zgarishi va zaxira qaytishi BITTA tranzaksiyada: rad etish
    // yozilib, zaxira qaytmay qolsa rulonlar butunlay yo'qolardi.
    // `WHERE status = ANY(...)` qatorni qulflaydi — ikki marta bosilsa
    // ikkinchisi 0 qator qaytaradi va zaxira ikki marta qaytmaydi.
    let row;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // `prev` CTE oldingi holatni tarix uchun olib qoladi: RETURNING faqat
      // YANGI qiymatni bera oladi, tarixga esa "qaysi holatdan" kerak.
      // `FOR UPDATE` qatorni qulflaydi, ya'ni atomik qorovul (`prev.status =
      // ANY(...)`) ilgarigidek ishlaydi — ikki marta bosilsa ikkinchisi 0 qator
      // qaytaradi va zaxira ikki marta qaytmaydi.
      const { rows } = await client.query(
        `WITH prev AS (SELECT id, status FROM orders WHERE id = $3 FOR UPDATE)
         UPDATE orders o SET status = $1, tracking_code = COALESCE($2, o.tracking_code)
           FROM prev
          WHERE o.id = prev.id AND prev.status = ANY($4)
          RETURNING o.id, o.status, o.tg_user_id, prev.status AS from_status`,
        [cmd.to, tracking, orderId, cmd.from]
      );
      if (!rows.length) {
        await client.query('ROLLBACK');
        return fail(res, "buyurtma holati mos emas (allaqachon o'zgargan)", 409);
      }
      // Rad etildi — mato jo'natilmagan, rulonlar omborga qaytadi
      if (cmd.restoresStock) await restoreStock(client, orderId);
      await recordStatusChange(client, {
        orderId,
        from: rows[0].from_status,
        to: rows[0].status,
        actorKind: 'seller',
        actorTg: me.tg && me.tg.id,
        note: tracking ? `BTS trek: ${tracking}` : null,
      });
      await client.query('COMMIT');
      row = rows[0];
    } catch (e) {
      try { await client.query('ROLLBACK'); } catch (_) {}
      throw e;
    } finally {
      client.release();
    }
    if (row.tg_user_id) {
      callTelegram('sendMessage', {
        chat_id: row.tg_user_id,
        text: cmd.buyerText(orderId, tracking),
        parse_mode: 'HTML',
      }).catch(() => {});
    }
    if (ADMIN_CHAT_ID) {
      callTelegram('sendMessage', {
        chat_id: ADMIN_CHAT_ID,
        text: `ℹ️ ${escapeHtml(orderId)} — sotuvchi (${escapeHtml(me.business_name_uz || '?')}) holatni "${escapeHtml(row.status)}" ga o'zgartirdi.`,
        parse_mode: 'HTML',
      }).catch(() => {});
    }
    ok(res, { id: row.id, status: row.status });
  } catch (e) {
    console.error('sellerOrderAction xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

module.exports = { handleMe, handleSellerProducts, handleSellerProductUpdate, handleSellerOrders, handleSellerOrderAction };
