const { ADMIN_CHAT_ID } = require('../config');
const { pool } = require('../db');
const { requestUser } = require('../lib/auth');
const { escapeHtml } = require('../lib/format');
const { validate } = require('../lib/validate');
const { rateLimited, readBody, ok, fail } = require('../lib/http');
const { notify, sendOpenAppMessage } = require('../lib/telegram-api');

// ============ BOZOR TADQIQOTI FUNKSIYALARI (2026-09-05, db/030) ============
// Uch mexanizm bitta faylda, chunki uchalasi bitta savolga javob beradi:
// «xaridorni qaytarish» — namuna so'rovi (xaridni boshlaydi), «kelganda
// xabar ber» (tugagan matoga qaytaradi), savat eslatmasi (chala qolgan
// buyurtmaga qaytaradi). Kimlik HAMMA joyda `requestUser()` — ikkala kanal
// (CLAUDE.md, Test 3f).

// ---- POST /api/sample-request — namuna so'rovi ----
// Bu BUYURTMA EMAS: narx/o'lcham shartlari founder bilan hali kelishilmagan,
// shuning uchun so'rov yoziladi va sotuvchi + founder'ga boradi. Shartlar
// aniqlashgach buyurtma oqimiga ulanadi (db/030 izohi).
async function handleSampleRequest(req, res, ip) {
  if (rateLimited(`sample:${ip}`, 10)) return fail(res, 'too many requests', 429);
  const u = await requestUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  try {
    const data = JSON.parse(await readBody(req, 5_000));
    const v = validate(data, {
      productId: { type: 'string', required: true, max: 40 },
    });
    if (!v.ok) return fail(res, v.error, 400);

    // Mahsulot va sotuvchisi bitta so'rovda — yo'q mahsulotga so'rov yozilmaydi
    const { rows } = await pool.query(
      `SELECT p.id, p.name_uz, u2.tg_user_id AS seller_tg
         FROM products p
         LEFT JOIN sellers s ON s.id = p.seller_id
         LEFT JOIN users u2  ON u2.id = s.user_id
        WHERE p.id = $1 AND p.status = 'published'`,
      [v.data.productId]
    );
    if (!rows.length) return fail(res, 'mahsulot topilmadi', 404);
    const p = rows[0];

    // Ism BAZADAN: `requestUser` faqat `{ id }` qaytaradi — `initData`
    // maydonlariga tayanish sayt kanalida jimgina `undefined` bo'lardi
    // (lib/auth.js → requireSeller izohidagi qoida).
    const { rows: urows } = await pool.query(
      `SELECT full_name, phone FROM users WHERE tg_user_id = $1`, [String(u.id)]
    );
    const name = (urows[0] && urows[0].full_name) || null;
    const phone = (urows[0] && urows[0].phone) || null;
    const { rows: ins } = await pool.query(
      `INSERT INTO sample_requests (tg_user_id, buyer_name, product_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [String(u.id), name, p.id]
    );

    const text =
      `✂️ <b>Namuna so'rovi</b> #${ins[0].id}\n\n` +
      `<b>${escapeHtml(p.name_uz)}</b>\n` +
      `Xaridor: ${escapeHtml(name || `ID ${u.id}`)}` +
      (phone ? `\nTel: ${escapeHtml(phone)}` : '') +
      `\n\nXaridor bilan bog'lanib namuna shartlarini kelishing.`;
    // Bildirishnoma yetmasa so'rov baribir yozilgan — `notify` xatoni o'zi
    // yutadi (asosiy amal yiqilmasin, lib/telegram-api.js izohi).
    if (p.seller_tg) await notify(p.seller_tg, text);
    await notify(ADMIN_CHAT_ID, text);

    ok(res, { id: ins[0].id }, 201);
  } catch (e) {
    console.error('sampleRequest xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- POST /api/stock-alert — «kelganda xabar ber» obunasi ----
// Qayta obuna yangi qator ochmaydi: `notified_at` NULL ga qaytadi, ya'ni
// bitta juftlik eng ko'pi bilan bitta kutayotgan obuna (db/030).
async function handleStockAlert(req, res, ip) {
  if (rateLimited(`stockalert:${ip}`, 20)) return fail(res, 'too many requests', 429);
  const u = await requestUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  try {
    const data = JSON.parse(await readBody(req, 5_000));
    const v = validate(data, {
      productId: { type: 'string', required: true, max: 40 },
    });
    if (!v.ok) return fail(res, v.error, 400);

    const { rows } = await pool.query(
      `SELECT id FROM products WHERE id = $1 AND status = 'published'`,
      [v.data.productId]
    );
    if (!rows.length) return fail(res, 'mahsulot topilmadi', 404);

    await pool.query(
      `INSERT INTO stock_alerts (tg_user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (tg_user_id, product_id)
       DO UPDATE SET notified_at = NULL, created_at = now()`,
      [String(u.id), v.data.productId]
    );
    ok(res, { subscribed: true });
  } catch (e) {
    console.error('stockAlert xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ---- Restok: obunachilarga xabar ----
// Chaqiruvchi — routes/seller.js (stok 0 dan ko'tarilganda). Eng yaxshi
// harakat: xabar yetmasa stok yangilanishi YIQILMAYDI, lekin xato
// yutilmaydi — console.error alertga chiqadi (ALERT_CHAT_ID darsi).
//
// ⚠️ Belgilash YUBORISHDAN OLDIN: ikki parallel stok yangilanishi bitta
// obunachiga ikki xabar yubormasin. Teskari xavf (belgilandi, xabar
// yetmadi) arzonroq — xaridor keyingi restokda baribir ko'radi.
async function notifyRestock(productId) {
  try {
    const { rows: prod } = await pool.query(
      `SELECT name_uz FROM products WHERE id = $1`, [productId]
    );
    if (!prod.length) return;

    const { rows: subs } = await pool.query(
      `UPDATE stock_alerts SET notified_at = now()
        WHERE product_id = $1 AND notified_at IS NULL
        RETURNING tg_user_id`,
      [productId]
    );
    if (!subs.length) return;

    const text =
      `🔔 <b>${escapeHtml(prod[0].name_uz)}</b> yana sotuvda!\n\n` +
      `Siz kutgan mato zaxiraga qaytdi. Tugab qolmasidan buyurtma bering.`;
    for (const s of subs) {
      // `sendOpenAppMessage` — «Do'konni ochish» tugmasi bilan; xato bitta
      // obunachida qolgan hammasini to'xtatmasin.
      await sendOpenAppMessage(s.tg_user_id, text).catch((e) => {
        console.error('restok xabari ketmadi:', e.message);
      });
    }
  } catch (e) {
    console.error('notifyRestock xatosi:', e.message);
  }
}

// ---- Savat eslatmasi skaneri ----
// Savat brauzerda yashaydi — server tarkibni BILMAYDI. Eslatma faqat
// o'lchangan FAKTNI aytadi: «savatga solingan edi, buyurtma bo'lmadi»
// (user_events.cart_add, keyin order ham, cart_remove ham yo'q).
// Taxminiy tarkib yozilmaydi — jimgina yolg'on qoidasi.
//
// Chastota qulflari (spam = block = kanal butunlay yo'qoladi):
//   - hodisa 3 soatdan yangi bo'lsa tegilmaydi (odam hali xarid qilyapti);
//   - 48 soatdan eski bo'lsa tegilmaydi (eskirgan niyatga eslatma — shovqin);
//   - bitta foydalanuvchiga 72 soatda eng ko'pi bilan bitta eslatma
//     (`users.cart_reminded_at`, db/030).
const CART_REMINDER_MS = 30 * 60_000;

async function scanCartReminders() {
  try {
    const { rows } = await pool.query(`
      WITH cand AS (
        SELECT e.tg_user_id, max(e.at) AS last_add
          FROM user_events e
         WHERE e.kind = 'cart_add'
           AND e.at >= now() - interval '48 hours'
           AND e.at <= now() - interval '3 hours'
         GROUP BY e.tg_user_id
      )
      SELECT c.tg_user_id, c.last_add
        FROM cand c
        JOIN users u ON u.tg_user_id = c.tg_user_id
       WHERE (u.cart_reminded_at IS NULL OR u.cart_reminded_at < now() - interval '72 hours')
         AND NOT EXISTS (SELECT 1 FROM orders o
                          WHERE o.tg_user_id = c.tg_user_id AND o.created_at >= c.last_add)
         AND NOT EXISTS (SELECT 1 FROM user_events r
                          WHERE r.tg_user_id = c.tg_user_id
                            AND r.kind = 'cart_remove' AND r.at > c.last_add)
       LIMIT 50
    `);

    for (const cand of rows) {
      // Qulf YUBORISHDAN OLDIN — xabar yiqilsa keyingi skan qayta urinmaydi
      // (72 soat kutadi); teskarisi bitta odamga har yarim soatda xabar
      // yuborib turishi mumkin edi.
      await pool.query(
        `UPDATE users SET cart_reminded_at = now() WHERE tg_user_id = $1`,
        [cand.tg_user_id]
      );

      // Nomlar — FAKT: shu foydalanuvchi shu oynada savatga solgan matolar
      const { rows: prods } = await pool.query(
        `SELECT DISTINCT p.name_uz
           FROM user_events e JOIN products p ON p.id = e.product_id
          WHERE e.tg_user_id = $1 AND e.kind = 'cart_add'
            AND e.at >= now() - interval '48 hours'
          LIMIT 3`,
        [cand.tg_user_id]
      );
      const names = prods.map((p) => `• ${escapeHtml(p.name_uz)}`).join('\n');
      const text =
        `🛒 <b>Savat sizni kutyapti</b>\n\n` +
        (names ? `Savatga solingan edi:\n${names}\n\n` : '') +
        `Buyurtma yakunlanmagan — xohlasangiz bir necha bosishda yakunlang.`;
      await sendOpenAppMessage(cand.tg_user_id, text).catch((e) => {
        console.error('savat eslatmasi ketmadi:', e.message);
      });
    }
  } catch (e) {
    console.error('scanCartReminders xatosi:', e.message);
  }
}

module.exports = {
  handleSampleRequest, handleStockAlert, notifyRestock,
  scanCartReminders, CART_REMINDER_MS,
};
