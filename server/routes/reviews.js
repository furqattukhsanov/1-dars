const { ADMIN_CHAT_ID } = require('../config');
const { pool } = require('../db');
const { authUser, requireSeller } = require('../lib/auth');
const { escapeHtml, dateLabel } = require('../lib/format');
const { validate, ClientError } = require('../lib/validate');
const { rateLimited, readBody, ok, fail } = require('../lib/http');
const { notify } = require('../lib/telegram-api');
const { webSessionUser } = require('./web-auth');

// ============ SHARHLAR VA REYTING (PRD story №2, №15) ============
// Sharh BUYURTMAGA bog'lanadi: xaridor faqat o'zi olgan matoga baho qo'yadi.
// Shu sababli moderatsiya darvozasi yo'q — sharh yozish uchun avval haqiqiy
// buyurtma berib, uni yetkazib olish kerak. Admin keyin yashira oladi
// (`review_hide`, Telegram'da tasdiqlanadi).

// Mato yetib kelmagan buyurtmaga baho qo'yib bo'lmaydi. `shipped` ATAYLAB
// ro'yxatda yo'q (bahsdan farqi shu) — yo'lda ketayotgan matoning sifatini
// xaridor hali ko'rmagan.
const REVIEW_ALLOWED_ORDER_STATUS = ['delivered', 'completed'];

// ---- Muallif kim? ----
// Ikki yo'l ham qabul qilinadi va ikkalasi ham Telegram ID bilan tugaydi:
//   Mini App — imzolangan initData;
//   sayt     — HttpOnly cookie sessiyasi.
// Klient yuborgan `tg_user_id` ga HECH QACHON ishonilmaydi (CLAUDE.md,
// 2026-07-29) — pastdagi ikkala manba ham serverda tekshiriladi.
async function reviewAuthor(req) {
  const tg = authUser(req);
  if (tg && tg.id) {
    return {
      tgId: String(tg.id),
      name: [tg.first_name, tg.last_name].filter(Boolean).join(' ') || tg.username || null,
    };
  }
  const web = await webSessionUser(req);
  if (web && web.tgUserId) return { tgId: String(web.tgUserId), name: web.name || null };
  return null;
}

// ---- Reytingni qayta hisoblash ----
// `products.rating` / `products.reviews` va `sellers.rating` — HOSILA ustunlar.
// Ularning YAGONA yozuvchisi shu funksiya (012_reviews.sql izohiga qarang).
// Agregat NULL qaytarsa (sharh qolmagan bo'lsa) reyting ham NULL bo'ladi —
// nol emas: "sharh yo'q" va "reytingi 0" bir xil narsa emas, katalog esa
// reytingi NULL mahsulotda reyting blokini UMUMAN ko'rsatmaydi.
async function recalcRating(client, productId, sellerId) {
  await client.query(
    `UPDATE products p
        SET rating  = agg.avg_stars,
            reviews = agg.n
       FROM (SELECT round(avg(stars)::numeric, 1) AS avg_stars, count(*)::int AS n
               FROM reviews WHERE product_id = $1 AND status = 'published') agg
      WHERE p.id = $1`,
    [productId]
  );
  if (sellerId) {
    await client.query(
      `UPDATE sellers s
          SET rating = (SELECT round(avg(stars)::numeric, 1)
                          FROM reviews WHERE seller_id = $1 AND status = 'published')
        WHERE s.id = $1`,
      [sellerId]
    );
  }
}

function reviewRowToVM(r) {
  return {
    id: r.id,
    productId: r.product_id,
    orderId: r.order_id,
    stars: Number(r.stars),
    body: r.body,
    author: r.author_name,
    date: dateLabel(new Date(r.created_at)),
  };
}

// ============ POST /api/reviews — sharh yozish ============
async function handleCreateReview(req, res, ip) {
  if (rateLimited(`review:${ip}`, 20)) return fail(res, 'too many requests', 429);
  const me = await reviewAuthor(req);
  if (!me) return fail(res, 'unauthorized', 401);
  try {
    const data = JSON.parse(await readBody(req, 20_000));
    const v = validate(data, {
      orderId:   { type: 'string', required: true, max: 40 },
      productId: { type: 'string', required: true, max: 100 },
      stars:     { type: 'int',    required: true, min: 1, max: 5 },
      body:      { type: 'string', required: false, max: 1000 },
    });
    if (!v.ok) return fail(res, v.error, 400);
    const d = v.data;

    // Bitta so'rovda uchta shart tekshiriladi: buyurtma bor, u SHU xaridorniki
    // (imzolangan ID bo'yicha) va mahsulot HAQIQATAN shu buyurtmada bo'lgan.
    // Oxirgisi muhim: bo'lmasa har kim istalgan mahsulotga o'z buyurtmasining
    // raqamini ko'rsatib baho qo'yaverardi.
    const { rows: chk } = await pool.query(
      `SELECT o.status, o.buyer_name, p.seller_id, p.name_uz
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN products p     ON p.id = oi.product_id
        WHERE o.id = $1 AND o.tg_user_id = $2 AND p.id = $3
        LIMIT 1`,
      [d.orderId, me.tgId, d.productId]
    );
    if (!chk.length) return fail(res, 'buyurtma topilmadi', 404);
    const target = chk[0];
    if (!REVIEW_ALLOWED_ORDER_STATUS.includes(target.status)) {
      return fail(res, 'sharh mato yetib kelgandan keyin yoziladi', 400);
    }

    let client;
    let review;
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO reviews (order_id, product_id, seller_id, author_tg, author_name, stars, body)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, created_at`,
        [d.orderId, d.productId, target.seller_id, me.tgId,
         me.name || target.buyer_name || null, d.stars, d.body || null]
      );
      review = rows[0];
      await recalcRating(client, d.productId, target.seller_id);
      await client.query('COMMIT');
    } catch (e) {
      if (client) await client.query('ROLLBACK').catch(() => {});
      // Unikal indeks: bitta buyurtmadagi bitta mahsulotga bitta sharh
      if (e.code === '23505') return fail(res, 'bu mahsulotga allaqachon sharh yozgansiz', 409);
      throw e;
    } finally {
      if (client) client.release();
    }

    const stars = '★'.repeat(d.stars) + '☆'.repeat(5 - d.stars);
    const text =
      `⭐️ <b>Yangi sharh</b>\n\n<b>${escapeHtml(target.name_uz)}</b>\n${stars} (${d.stars}/5)\n` +
      (d.body ? `\n${escapeHtml(d.body)}\n` : '') +
      `\nBuyurtma: <code>${escapeHtml(d.orderId)}</code>`;

    if (target.seller_id) {
      const { rows: stg } = await pool.query(
        `SELECT u.tg_user_id FROM sellers s JOIN users u ON u.id = s.user_id WHERE s.id = $1`,
        [target.seller_id]
      );
      if (stg.length) await notify(stg[0].tg_user_id, text);
    }
    // Adminga ham boradi — past bahoni founder darhol ko'rsin (sharh
    // moderatsiyasiz chiqadi, shuning uchun xabar yagona nazorat nuqtasi)
    await notify(ADMIN_CHAT_ID, `${text}\n\nSharh #${review.id}`);

    ok(res, { id: review.id, stars: d.stars }, 201);
  } catch (e) {
    console.error('createReview xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ GET /api/reviews — sharhlarni o'qish ============
// ?productId=... → mahsulotning ommaviy sharhlari (kirish shart emas)
// ?mine=1        → xaridorning O'Z sharhlari (ilova "qaysi mahsulotga
//                  allaqachon yozganman" ni shundan biladi)
async function handleGetReviews(req, res, ip) {
  if (rateLimited(`reviewlist:${ip}`, 120)) return fail(res, 'too many requests', 429);
  let productId, mine;
  try {
    const q = new URL(req.url, 'http://x').searchParams;
    productId = q.get('productId');
    mine = q.get('mine');
  } catch (_) { return fail(res, 'invalid', 400); }

  try {
    if (mine === '1') {
      const me = await reviewAuthor(req);
      if (!me) return fail(res, 'unauthorized', 401);
      const { rows } = await pool.query(
        `SELECT id, product_id, order_id, stars, body, author_name, created_at
           FROM reviews WHERE author_tg = $1 ORDER BY created_at DESC LIMIT 100`,
        [me.tgId]
      );
      return ok(res, rows.map(reviewRowToVM));
    }

    if (!productId) return fail(res, 'productId kerak', 400);
    const { rows } = await pool.query(
      `SELECT id, product_id, order_id, stars, body, author_name, created_at
         FROM reviews
        WHERE product_id = $1 AND status = 'published'
        ORDER BY created_at DESC LIMIT 50`,
      [productId]
    );
    ok(res, rows.map(reviewRowToVM));
  } catch (e) {
    console.error('getReviews xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ GET /api/seller/reviews — sotuvchi o'z sharhlarini ko'radi ============
// PRD story №15. Ruxsat requireSeller bilan — rol SERVER tomonda aniqlanadi.
async function handleSellerReviews(req, res, ip) {
  if (rateLimited(`sellerreviews:${ip}`, 60)) return fail(res, 'too many requests', 429);
  const me = await requireSeller(req, res);
  if (!me) return;
  try {
    const [listRes, aggRes] = await Promise.all([
      pool.query(
        `SELECT r.id, r.product_id, r.order_id, r.stars, r.body, r.author_name, r.created_at,
                p.name_uz, p.name_ru
           FROM reviews r JOIN products p ON p.id = r.product_id
          WHERE r.seller_id = $1 AND r.status = 'published'
          ORDER BY r.created_at DESC LIMIT 100`,
        [me.seller_id]
      ),
      pool.query(
        `SELECT round(avg(stars)::numeric, 1) AS avg_stars, count(*)::int AS n
           FROM reviews WHERE seller_id = $1 AND status = 'published'`,
        [me.seller_id]
      ),
    ]);
    ok(res, {
      // Sharh yo'q bo'lsa rating null — kabinet "0.0" emas, "hali sharh yo'q"
      // deb ko'rsatadi (o'ylab topilgan raqam ko'rsatilmaydi qoidasi)
      rating: aggRes.rows[0].avg_stars === null ? null : Number(aggRes.rows[0].avg_stars),
      count: Number(aggRes.rows[0].n || 0),
      items: listRes.rows.map((r) => ({
        ...reviewRowToVM(r),
        product: { uz: r.name_uz, ru: r.name_ru },
      })),
    });
  } catch (e) {
    console.error('sellerReviews xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ Admin: sharhni yashirish ============
// Panel to'g'ridan-to'g'ri o'chirmaydi — amal Telegram'da tasdiqlanadi
// (CLAUDE.md arxitektura qoidasi). Shu sabab bu yerda ikki bo'lak:
// `findReviewForAdmin` (tasdiq xabarida nima yozilishini beradi) va
// `hideReview` (tugma bosilgandan keyin bajariladi).
async function findReviewForAdmin(reviewId) {
  const { rows } = await pool.query(
    `SELECT r.id, r.stars, r.body, r.status, r.author_name, r.product_id, r.seller_id,
            p.name_uz
       FROM reviews r LEFT JOIN products p ON p.id = r.product_id
      WHERE r.id = $1`,
    [Number(reviewId) || 0]
  );
  if (!rows.length) throw new ClientError('sharh topilmadi');
  if (rows[0].status === 'hidden') throw new ClientError('bu sharh allaqachon yashirilgan');
  return rows[0];
}

async function hideReview(reviewId, reason) {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE reviews SET status='hidden', hidden_at=now(), hidden_reason=$1
        WHERE id=$2 AND status='published'
        RETURNING id, product_id, seller_id`,
      [reason || null, Number(reviewId) || 0]
    );
    if (!rows.length) throw new ClientError("sharh holati o'zgargan");
    // Yashirilgan sharh reytingdan ham chiqib ketishi SHART — aks holda
    // yulduz o'rnida qolib, o'chirilgan sharh reytingga ta'sir qilaverardi.
    await recalcRating(client, rows[0].product_id, rows[0].seller_id);
    await client.query('COMMIT');
    return rows[0];
  } catch (e) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    if (client) client.release();
  }
}

module.exports = {
  handleCreateReview, handleGetReviews, handleSellerReviews,
  findReviewForAdmin, hideReview, recalcRating, REVIEW_ALLOWED_ORDER_STATUS,
};
