const { pool } = require('../db');
const { verifyInitData, authUser, isAdmin, currentSeller } = require('../lib/auth');
const { escapeHtml, money } = require('../lib/format');
const { validate } = require('../lib/validate');
const { rateLimited, readBody, sendJson, ok, fail } = require('../lib/http');
const { loadContacts } = require('../lib/contacts');
const { sendOrderNotifyMessage } = require('../lib/telegram-api');

// ============ /api/auth/telegram — Telegram orqali kirish ============
// initData'ni tekshiradi, foydalanuvchini users jadvaliga yozadi (yoki topadi).
async function handleAuthTelegram(req, res, ip) {
  if (rateLimited(`auth:${ip}`, 30)) return fail(res, 'too many requests', 429);
  try {
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body || '{}');
    const tgUser = verifyInitData(data.initData);
    if (!tgUser || !tgUser.id) return fail(res, 'invalid initData', 401);

    const fullName =
      [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || null;
    const { rows } = await pool.query(
      `INSERT INTO users (tg_user_id, full_name, role)
       VALUES ($1, $2, 'buyer')
       ON CONFLICT (tg_user_id)
       DO UPDATE SET full_name = COALESCE(EXCLUDED.full_name, users.full_name)
       RETURNING id, tg_user_id, full_name, role, created_at`,
      [String(tgUser.id), fullName]
    );
    sendJson(res, 200, { ok: true, user: rows[0] });
  } catch (e) {
    console.error('auth xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}


// ============ /api/products — katalog (bazadan) ============
function productRowToVM(r) {
  return {
    id: r.id,
    catKey: r.cat_key,
    pattern: r.pattern,
    img: r.img,
    price: Number(r.price),
    unit: r.unit,
    moq: Number(r.moq),
    lead: r.lead_days == null ? null : Number(r.lead_days),
    rating: r.rating == null ? null : Number(r.rating),
    reviews: Number(r.reviews || 0),
    verified: !!r.is_verified,
    stockKey: r.stock_key,
    badgeTone: r.badge_tone,
    width: r.width,
    weight: r.weight,
    name: { uz: r.name_uz, ru: r.name_ru },
    supplier: { uz: r.business_name_uz, ru: r.business_name_ru },
    city: { uz: r.city_uz, ru: r.city_ru },
    comp: { uz: r.comp_uz, ru: r.comp_ru },
    badge: r.badge_uz ? { uz: r.badge_uz, ru: r.badge_ru } : null,
  };
}

async function handleGetProducts(req, res, ip) {
  if (rateLimited(`products:${ip}`, 60)) return fail(res, 'too many requests', 429);
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.cat_key, p.pattern, p.img, p.price, p.unit, p.moq, p.lead_days,
             p.rating, p.reviews, p.stock_key, p.badge_tone, p.width, p.weight,
             p.name_uz, p.name_ru, p.comp_uz, p.comp_ru, p.badge_uz, p.badge_ru,
             s.business_name_uz, s.business_name_ru, s.city_uz, s.city_ru, s.is_verified
      FROM products p
      LEFT JOIN sellers s ON s.id = p.seller_id
      WHERE p.status = 'published'
      ORDER BY p.sort_order NULLS LAST, p.id
    `);
    // Orqaga moslik: eski mijozlar yalang'och massiv kutadi (envelope EMAS)
    sendJson(res, 200, rows.map(productRowToVM));
  } catch (e) {
    console.error('products xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/products POST — yangi e'lon yuborish (moderatsiyaga) ============
// Autentifikatsiya qilingan foydalanuvchi mahsulot taklif qiladi. E'lon 'pending'
// holatida saqlanadi — admin tasdiqlamaguncha katalogda KO'RINMAYDI (approval workflow).
async function handleSubmitProduct(req, res, ip) {
  if (rateLimited(`submitproduct:${ip}`, 10)) return fail(res, 'too many requests', 429);
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  try {
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body);
    const v = validate(data, {
      name_uz: { type: 'string', required: true, min: 2, max: 200 },
      name_ru: { type: 'string', required: false, max: 200 },
      price:   { type: 'int', required: true, min: 1, max: 100000000000 },
      cat_key: { type: 'string', required: true, enum: ['silk', 'ikat', 'suzani', 'cotton', 'wool', 'linen'] },
      unit:    { type: 'string', required: false, max: 20, default: 'rulon' },
      moq:     { type: 'int', required: false, min: 1, max: 100000, default: 1 },
      comp_uz: { type: 'string', required: false, max: 500 },
    });
    if (!v.ok) return fail(res, v.error, 400);
    const d = v.data;
    const id = 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    // Yuboruvchi tasdiqlangan sotuvchi bo'lsa, e'lon o'sha sotuvchiga biriktiriladi —
    // shusiz mahsulot kabinetda ko'rinmaydi va buyurtma unga yetib bormaydi.
    const me = await currentSeller(u);
    const sellerId = me && me.role === 'seller' ? me.seller_id : null;
    await pool.query(
      `INSERT INTO products (id, seller_id, cat_key, price, unit, moq, name_uz, name_ru, comp_uz, status, submitted_by_tg)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10)`,
      [id, sellerId, d.cat_key, d.price, d.unit || 'rulon', d.moq || 1, d.name_uz, d.name_ru, d.comp_uz, String(u.id)]
    );
    sendOrderNotifyMessage(
      `🆕 <b>Yangi e'lon moderatsiyaga</b>\n\n<b>${escapeHtml(d.name_uz)}</b>\nNarx: ${escapeHtml(money(d.price))}\nID: <code>${escapeHtml(id)}</code>\n\nRo'yxat: <code>/moderatsiya</code>`
    ).catch(() => {});
    ok(res, { id, status: 'pending' }, 201);
  } catch (e) {
    console.error('submitProduct xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/admin/moderation — moderatsiya (FAQAT admin) ============
// GET  → 'pending' e'lonlar ro'yxati
// POST → { id, action:'approve'|'reject', reason? } bilan tasdiqlash/rad etish
// Ruxsat SERVER tomonda isAdmin() bilan tekshiriladi (401 = kirmagan, 403 = admin emas).
async function handleModerationList(req, res, ip) {
  if (rateLimited(`modlist:${ip}`, 60)) return fail(res, 'too many requests', 429);
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  if (!isAdmin(u)) return fail(res, 'forbidden', 403);
  try {
    const { rows } = await pool.query(
      `SELECT id, name_uz, name_ru, price, unit, moq, cat_key, comp_uz, submitted_by_tg, created_at
       FROM products WHERE status = 'pending' ORDER BY created_at DESC LIMIT 100`
    );
    ok(res, rows);
  } catch (e) {
    console.error('modList xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

async function handleModerationAction(req, res, ip) {
  if (rateLimited(`modaction:${ip}`, 30)) return fail(res, 'too many requests', 429);
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  if (!isAdmin(u)) return fail(res, 'forbidden', 403);
  try {
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body);
    const v = validate(data, {
      id:     { type: 'string', required: true, max: 100 },
      action: { type: 'string', required: true, enum: ['approve', 'reject'] },
      reason: { type: 'string', required: false, max: 500 },
    });
    if (!v.ok) return fail(res, v.error, 400);
    const newStatus = v.data.action === 'approve' ? 'published' : 'rejected';
    const { rows } = await pool.query(
      `UPDATE products SET status = $1, reject_reason = $2, reviewed_at = now()
       WHERE id = $3 AND status = 'pending'
       RETURNING id, status`,
      [newStatus, v.data.action === 'reject' ? (v.data.reason || null) : null, v.data.id]
    );
    if (!rows.length) return fail(res, "pending e'lon topilmadi", 404);
    ok(res, rows[0]);
  } catch (e) {
    console.error('modAction xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}




// ============ /api/telegram-contact — telefon (fayl bazasi) ============
function handleGetContact(req, res, ip) {
  if (rateLimited(`contact:${ip}`, 30)) return fail(res, 'too many requests', 429);
  let uid;
  try {
    uid = new URL(req.url, 'http://x').searchParams.get('uid');
  } catch (e) {
    uid = null;
  }
  if (!uid || !/^\d+$/.test(uid)) return fail(res, 'invalid uid', 400);
  const data = loadContacts();
  const entry = data[uid];
  sendJson(res, 200, { phone: entry ? entry.phone : null });
}




module.exports = { handleAuthTelegram, handleGetProducts, handleSubmitProduct, handleModerationList, handleModerationAction, handleGetContact };
