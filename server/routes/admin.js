const {
  ADMIN_CHAT_ID, ADMIN_TG_IDS, COMMISSION_RATE,
  AI_CREDITS_START, AI_UNLIMITED_TG_IDS,
} = require('../config');
const { pool } = require('../db');
const { cfTraffic } = require('../lib/cf-analytics');
const { adminPanelAuth, isAdmin } = require('../lib/auth');
const { escapeHtml, money, dateLabel } = require('../lib/format');
const { validate, ClientError } = require('../lib/validate');
const { rateLimited, readBody, ok, fail } = require('../lib/http');
const { callTelegram, callbackAnswer, notify } = require('../lib/telegram-api');
const { handleSellerApplicationReview } = require('./seller-application');
const { productPhotoUrl, videoVM } = require('./catalog');
const { r2Delete, r2PublicUrl } = require('../lib/r2');
const { purgeUrls, CF_PURGE_ENABLED } = require('../lib/cloudflare');
const { findReviewForAdmin, hideReview } = require('./reviews');
const { recordStatusChange } = require('../lib/order-history');
const { KINDS: USER_EVENT_KINDS } = require('../lib/user-events');

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
      appListRes, sellerListRes, modListRes, disputeRes, usersRes, videoListRes,
      srcRes, aiRes,
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
               p.vid_r2_key, p.vid_poster_r2_key, p.vid_seconds, p.vid_bytes,
               s.business_name_uz AS seller_name
          FROM products p
          LEFT JOIN sellers s ON s.id = p.seller_id
         WHERE p.status='pending' ORDER BY p.created_at DESC LIMIT 50`),

      pool.query(`SELECT count(*)::int AS n FROM disputes WHERE status='open'`),

      // ---- Foydalanuvchilar. `engaged_at` ikki tushunchani AJRATADI (db/020):
      // NULL = faqat `/start` bosgan, NOT NULL = ilova/sayt/ariza orqali
      // foydalangan. Bitta "jami" raqami bo'lsa u jimgina yolg'on gapirardi —
      // botga kirgan odam bilan ilovani ochgan odam bir xil ko'rinardi.
      pool.query(`
        SELECT count(*)::int                                                     AS total,
               count(*) FILTER (WHERE engaged_at IS NOT NULL)::int                AS engaged,
               count(*) FILTER (WHERE engaged_at IS NULL)::int                    AS start_only,
               count(*) FILTER (WHERE role='buyer')::int                          AS buyers,
               count(*) FILTER (WHERE role='seller')::int                         AS sellers,
               count(*) FILTER (WHERE role='admin')::int                          AS admins,
               count(*) FILTER (WHERE created_at >= now() - interval '7 days')::int  AS new7,
               count(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS new30,
               count(*) FILTER (WHERE phone IS NOT NULL)::int                     AS with_phone
          FROM users`),

      // ---- Kelgan videolar (db/023). ATAYLAB `status` bo'yicha FILTRLANMAYDI.
      // Moderatsiya navbati faqat `pending` e'lonlarni ko'rsatadi, video esa
      // ALLAQACHON NASHR QILINGAN mahsulotga ham kelishi mumkin (sotuvchi rasm
      // yuborgach bayroq ochiladi) — u holda video hech qanday navbatga
      // tushmasdan katalogga chiqib ketardi va uni hech kim ko'rmasdi.
      //
      // Tartib `vid_at` bo'yicha, `created_at` bo'yicha EMAS: eski e'longa
      // bugun kelgan video ro'yxatning tubida qolib ketardi.
      pool.query(`
        SELECT p.id, p.name_uz, p.status, p.vid_r2_key, p.vid_poster_r2_key,
               p.vid_seconds, p.vid_bytes, p.vid_at, p.img, p.img_file_id,
               s.business_name_uz AS seller_name
          FROM products p
          LEFT JOIN sellers s ON s.id = p.seller_id
         WHERE p.vid_r2_key IS NOT NULL
         ORDER BY p.vid_at DESC NULLS LAST LIMIT 50`),

      // ---- Foydalanuvchi MANBASI (db/025). Reklama boshlanishidan oldin
      // kerak: qaysi kanal odam olib kelayotganini o'lchamasdan byudjet
      // sarflash — ko'r-ko'rona sarflash.
      //
      // ⚠️ `src IS NULL` ATAYLAB CHIQARIB TASHLANMAYDI va alohida qator
      // bo'lib ham chiqmaydi: u "manba noma'lum" degani ("to'g'ridan-to'g'ri
      // keldi" EMAS), ya'ni kanallar bilan bitta ro'yxatga qo'yilsa eng
      // katta "kanal" o'lchanmagan qatorlar bo'lib chiqardi. Noma'lumlar
      // soni alohida maydonda beriladi — ko'rinsin, lekin aralashmasin.
      pool.query(`
        SELECT src, count(*)::int AS n,
               count(*) FILTER (WHERE engaged_at IS NOT NULL)::int AS engaged
          FROM users WHERE src IS NOT NULL
         GROUP BY src ORDER BY n DESC LIMIT 20`),

      // ---- AI rasm sanog'i. Hammasi HAQIQIY jadvallardan: `product_ai_image`
      // — chizilgan rasmlar, `ai_credits` — sarflangan kredit. Nol ham
      // haqiqiy javob (CLAUDE.md: o'ylab topilgan raqam ko'rsatilmasin).
      pool.query(`
        SELECT (SELECT count(*)::int FROM product_ai_image)                    AS images,
               (SELECT count(*)::int FROM product_ai_image
                 WHERE created_at >= now() - interval '7 days')                AS images7,
               (SELECT count(DISTINCT tg_user_id)::int FROM product_ai_image)  AS users,
               (SELECT COALESCE(sum(spent), 0)::int FROM ai_credits)           AS spent`),
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

      users: {
        total: usersRes.rows[0].total,
        engaged: usersRes.rows[0].engaged,
        startOnly: usersRes.rows[0].start_only,
        buyers: usersRes.rows[0].buyers,
        sellers: usersRes.rows[0].sellers,
        admins: usersRes.rows[0].admins,
        new7: usersRes.rows[0].new7,
        new30: usersRes.rows[0].new30,
        withPhone: usersRes.rows[0].with_phone,
        // Manbasi O'LCHANMAGAN qatorlar. Kanal ro'yxatidan TASHQARIDA
        // turadi — u kanal emas, bilmaslik (db/025 dagi izoh).
        srcUnknown: usersRes.rows[0].total - srcRes.rows.reduce((s, r) => s + r.n, 0),
      },

      // Manba bo'yicha taqsimot. `engaged` yonida turadi: havola odam OLIB
      // KELGANI bilan u ilovani OCHGANI bir narsa emas — bosilishi ko'p,
      // ochilishi kam kanal reklama pulini yeb, natija bermasligi mumkin.
      sources: srcRes.rows.map((r) => ({ src: r.src, count: r.n, engaged: r.engaged })),

      ai: {
        images: aiRes.rows[0].images,
        images7: aiRes.rows[0].images7,
        users: aiRes.rows[0].users,
        creditsSpent: aiRes.rows[0].spent,
      },

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

      moderationQueue: modListRes.rows.map((r) => Object.assign({
        id: r.id,
        name: r.name_uz,
        price: Number(r.price),
        unit: r.unit,
        catKey: r.cat_key,
        img: r.img_file_id ? productPhotoUrl(r.img_file_id) : r.img,
        stock: r.stock === null ? null : Number(r.stock),
        sellerName: r.seller_name,
        date: dateLabel(new Date(r.created_at)),
      }, videoVM(r))),

      videoQueue: videoListRes.rows.map((r) => Object.assign({
        id: r.id,
        name: r.name_uz,
        status: r.status,
        sellerName: r.seller_name,
        img: r.img_file_id ? productPhotoUrl(r.img_file_id) : r.img,
        date: r.vid_at ? dateLabel(new Date(r.vid_at)) : null,
      }, videoVM(r))),
    });
  } catch (e) {
    console.error('adminSummary xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/admin/traffic — SAYT VA MINI APP TRAFIGI (2026-08-18) ============
// Manba — `traffic_events` (db/028). Har qator bitta hodisa, ya'ni bu yerdagi
// "ko'rishlar" soni ANIQ (namuna emas, taxmin emas).
//
// ⚠️ CLOUDFLARE BILAN SOLISHTIRILMASIN. Cloudflare Web Analytics ham shu
// saytni o'lchaydi, lekin uning raqami 7 kundan keyin ~10% ga siyraklashadi
// va GraphQL javobi dinamik namuna bilan keladi. Ikki raqam YONMA-YON
// qo'yilsa "biri buzuq" degan yolg'on xulosa tug'ilardi — ular boshqa-boshqa
// narsani o'lchaydi (db/028 sarlavhasidagi jadval).
//
// ⚠️ O'LCHOV BOSHLANGAN SANA ALOHIDA QAYTARILADI (`since`). Sababi CLAUDE.md
// dagi `src IS NULL` darsi bilan bitta: o'lchov boshlanishidan OLDINGI kunlar
// "nol tashrif" emas, "O'LCHANMAGAN". Grafikda nol chizilsa panel o'sish
// bo'lmagan joyda o'sish ko'rsatardi.
async function handleAdminTraffic(req, res, ip) {
  if (rateLimited(`admintraffic:${ip}`, 30)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;

  // Oraliq — 7..90 kun. Qiymat SO'ROVGA to'g'ridan-to'g'ri qo'yilmaydi
  // (`interval` parametr bilan ishlamaydi), shuning uchun avval BUTUN SONGA
  // aylantiriladi va chegaralanadi — ya'ni satr sifatida hech qachon
  // o'tmaydi.
  const xom = parseInt(new URL(req.url, 'http://x').searchParams.get('days'), 10);
  const days = Number.isInteger(xom) ? Math.min(90, Math.max(7, xom)) : 30;

  try {
    const [dailyRes, faceRes, screenRes, productRes, refRes, funnelRes, sinceRes, actKindRes, actDailyRes] = await Promise.all([
      // ---- Kunlik qator. `generate_series` bo'sh kunlarni ham beradi (GMV
      // grafigidagi bilan bitta naqsh) — aks holda tashrifsiz kun grafikdan
      // tushib qolib, chiziq uzilardi.
      //
      // 🔴 KUN CHEGARASI TOSHKENT BO'YICHA, UTC BO'YICHA EMAS (2026-08-18 da
      // founder ekranida ko'rindi). Server UTC da yuradi, ya'ni `date_trunc`
      // kunni 05:00 Toshkent vaqtida almashtirardi: yarim tundan tonggacha
      // bo'lgan tashrif KECHAGI kunga tushardi. O'zbekistondagi bozor uchun
      // "bugun" — Toshkentning bugungi kuni.
      //
      // ⚠️ Sana SQL da SATRGA aylantiriladi (`to_char`), Node'ga `Date` bo'lib
      // O'TMAYDI: `date` tipini drayver MAHALLIY yarim tunda `Date` qilib
      // beradi va `toISOString()` uni UTC ga qaytarib bir kun ORQAGA suradi —
      // panelda bugungi 30 ta ko'rish "17.08" deb turgan edi.
      pool.query(`
        SELECT to_char(d, 'YYYY-MM-DD') AS day,
               count(t.id) FILTER (WHERE t.kind = 'view')::int AS views,
               count(DISTINCT t.visitor)::int                  AS visitors
          FROM generate_series(date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent')
                                 - ($1::int - 1) * interval '1 day',
                               date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent'),
                               interval '1 day') d
          LEFT JOIN traffic_events t
                 ON t.at >= d AT TIME ZONE 'Asia/Tashkent'
                AND t.at <  (d + interval '1 day') AT TIME ZONE 'Asia/Tashkent'
         GROUP BY d ORDER BY d`, [days]),

      // ---- Yuz bo'yicha. Sayt va Mini App ALOHIDA: ular bitta raqamga
      // qo'shilsa "sayt o'sdi" degan xulosa aslida Mini App o'sishi bo'lib
      // chiqishi mumkin edi.
      pool.query(`
        SELECT face,
               count(*) FILTER (WHERE kind = 'view')::int AS views,
               count(DISTINCT visitor)::int               AS visitors
          FROM traffic_events
         WHERE at >= now() - ($1::int * interval '1 day')
         GROUP BY face`, [days]),

      pool.query(`
        SELECT screen, count(*)::int AS views
          FROM traffic_events
         WHERE kind = 'view' AND at >= now() - ($1::int * interval '1 day')
         GROUP BY screen ORDER BY views DESC LIMIT 15`, [days]),

      // ---- Eng ko'p ko'rilgan matolar. AYNAN SHU savolga Cloudflare javob
      // BERA OLMAYDI — u bizning mahsulot id'imizni bilmaydi.
      // `LEFT JOIN` — mahsulot o'chirilgan bo'lsa ham qator yo'qolmasin
      // (db/028 da tashqi kalit ataylab yo'q).
      //
      // 2026-08-23 (founder referensi — «Eng ko'p ko'rilgan joylar»
      // jadvali): ko'rish yoniga SAVAT, SEVIMLI va BUYURTMA ustunlari.
      // Uchalasi UCH manbadan: savat — `traffic_events` (anonim, aniq),
      // sevimli — `user_favorites` (kirgan foydalanuvchi), buyurtma —
      // `order_items` + `orders` (pulga bog'langan haqiqat, bekor/qaytarilgan
      // chiqariladi). Bitta oyna — `days`. Konversiya panelda hisoblanadi
      // (buyurtma / ko'rish) va ko'rish nol bo'lsa chizilmaydi.
      pool.query(`
        WITH v AS (
          SELECT product_id,
                 count(*) FILTER (WHERE kind = 'view')::int AS views,
                 count(DISTINCT visitor) FILTER (WHERE kind = 'view')::int AS visitors,
                 count(*) FILTER (WHERE kind = 'cart')::int AS carts
            FROM traffic_events
           WHERE product_id IS NOT NULL
             AND at >= now() - ($1::int * interval '1 day')
           GROUP BY product_id
        )
        SELECT v.product_id, p.name_uz AS name, v.views, v.visitors, v.carts,
               (SELECT count(*) FROM user_favorites f
                 WHERE f.product_id = v.product_id
                   AND f.created_at >= now() - ($1::int * interval '1 day'))::int AS favorites,
               (SELECT count(DISTINCT oi.order_id) FROM order_items oi
                  JOIN orders o ON o.id = oi.order_id
                 WHERE oi.product_id = v.product_id
                   AND o.created_at >= now() - ($1::int * interval '1 day')
                   AND o.status NOT IN ('cancelled','refunded'))::int AS orders
          FROM v
          LEFT JOIN products p ON p.id = v.product_id
         WHERE v.views > 0
         ORDER BY v.views DESC LIMIT 15`, [days]),

      pool.query(`
        SELECT ref, count(*)::int AS views
          FROM traffic_events
         WHERE ref IS NOT NULL AND at >= now() - ($1::int * interval '1 day')
         GROUP BY ref ORDER BY views DESC LIMIT 10`, [days]),

      // ---- Voronka. Uchala pog'ona ham TASHRIFCHI bo'yicha sanaladi,
      // hodisa bo'yicha emas: bitta odam matoni 10 marta ochsa konversiya
      // 10 barobar yaxshi ko'rinib qolardi.
      //
      // ⚠️ Buyurtma soni `orders` dan olinadi, `traffic_events` dan EMAS.
      // Sabab: buyurtma — pulga bog'langan HAQIQAT va uning yagona manbai
      // `orders`. Ikkinchi joyga nusxalansa ikki raqam ikki xil bo'lardi
      // (reyting hosila qoidasi bilan bitta oila).
      //
      // 🔴 UCHALA POG'ONA BITTA OYNADAN OLINADI — aks holda voronka TESKARI
      // chiqadi (2026-08-18 da founder ekranida aynan shunday edi:
      // "ko'rgan 3 → savatga 2 → buyurtma 23"). Sabab: buyurtmalarning
      // TARIXI bor, o'lchov esa BUGUN yoqilgan. Oyna o'lchov boshlangan
      // paytdan oldinga o'tmaydi — `GREATEST` shuni qiladi.
      //
      // ⚠️ Bu "buyurtmani ham traffic_events dan sana" degani EMAS: buyurtma
      // pulga bog'langan haqiqat va uning yagona manbai `orders` bo'lib
      // qoladi (reyting hosila qoidasi bilan bitta oila). O'zgargani —
      // faqat SANALADIGAN ORALIQ.
      pool.query(`
        WITH w AS (
          SELECT GREATEST(now() - ($1::int * interval '1 day'),
                          COALESCE((SELECT min(at) FROM traffic_events), now())) AS boshi
        )
        SELECT (SELECT count(DISTINCT visitor) FROM traffic_events, w
                 WHERE kind = 'view' AND product_id IS NOT NULL
                   AND at >= w.boshi)::int                              AS viewed,
               (SELECT count(DISTINCT visitor) FROM traffic_events, w
                 WHERE kind = 'cart' AND at >= w.boshi)::int            AS carted,
               (SELECT count(*) FROM orders, w
                 WHERE created_at >= w.boshi
                   AND status NOT IN ('cancelled','refunded'))::int     AS ordered`, [days]),

      // ---- O'lchov QACHON boshlangan. Jadval bo'sh bo'lsa `NULL` — panel
      // shunda blokni UMUMAN ko'rsatmaydi (nol chizmaydi).
      //
      // ⚠️ `measured_days` — O'LCHANGAN kunlar soni, oyna kengligi EMAS.
      // Panel o'rtachani shunga bo'ladi: 30 ga bo'linsa o'lchov endi
      // boshlanganda "kuniga o'rtacha 1 · bugun 15" degan o'zi-o'ziga zid
      // raqam chiqardi (founder ekranida ko'rindi).
      pool.query(`
        SELECT min(at) AS since,
               to_char(min(at) AT TIME ZONE 'Asia/Tashkent', 'YYYY-MM-DD') AS since_day,
               count(*)::int AS total,
               GREATEST(1, LEAST($1::int,
                 (date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent')::date
                  - date_trunc('day', min(at) AT TIME ZONE 'Asia/Tashkent')::date) + 1))::int
                 AS measured_days
          FROM traffic_events`, [days]),

      // ---- Foydalanuvchi HARAKATLARI (db/029, 2026-08-23 founder referensi:
      // «umumiy muhim statistika»). `traffic_events` dan boshqa manba: bu
      // yerda KIRGAN foydalanuvchining amali (sevimli, AI, buyurtma, kirish).
      // Yorliq serverdan (`KINDS`). Kunlik qator — Toshkent kuni bo'yicha,
      // yuqoridagi bilan bir xil sabab.
      pool.query(`
        SELECT kind, count(*)::int AS n FROM user_events
         WHERE at >= now() - ($1::int * interval '1 day')
         GROUP BY kind ORDER BY n DESC`, [days]),
      pool.query(`
        SELECT to_char(d, 'YYYY-MM-DD') AS day, count(e.id)::int AS n
          FROM generate_series(date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent')
                                 - ($1::int - 1) * interval '1 day',
                               date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent'),
                               interval '1 day') d
          LEFT JOIN user_events e
                 ON e.at >= d AT TIME ZONE 'Asia/Tashkent'
                AND e.at <  (d + interval '1 day') AT TIME ZONE 'Asia/Tashkent'
         GROUP BY d ORDER BY d`, [days]),
    ]);

    const face = (n) => faceRes.rows.find((r) => r.face === n) || { views: 0, visitors: 0 };
    const f = funnelRes.rows[0];

    ok(res, {
      days,
      // O'lchov boshlangan payt — panel "bundan oldingi kunlar o'lchanmagan"
      // deb AYTISHI uchun. `null` bo'lsa hali birorta hodisa yo'q.
      since: sinceRes.rows[0].since ? new Date(sinceRes.rows[0].since).toISOString() : null,
      // Panel KO'RSATADIGAN sana — Toshkent bo'yicha va TAYYOR satr.
      // Panelda `toISOString()` bilan yasalsa u UTC ga o'tib bir kun orqaga
      // surilardi (yuqoridagi kunlik qator izohi bilan bitta sabab).
      sinceDay: sinceRes.rows[0].since_day || null,
      total: sinceRes.rows[0].total,
      measuredDays: sinceRes.rows[0].measured_days,

      daily: dailyRes.rows.map((r) => ({
        day: String(r.day),
        views: r.views,
        visitors: r.visitors,
      })),

      faces: {
        web: { views: face('web').views, visitors: face('web').visitors },
        miniapp: { views: face('miniapp').views, visitors: face('miniapp').visitors },
      },

      screens: screenRes.rows.map((r) => ({ screen: r.screen, views: r.views })),
      products: productRes.rows.map((r) => ({
        id: r.product_id, name: r.name, views: r.views, visitors: r.visitors,
        carts: r.carts, favorites: r.favorites, orders: r.orders,
      })),
      refs: refRes.rows.map((r) => ({ ref: r.ref, views: r.views })),

      funnel: { viewed: f.viewed, carted: f.carted, ordered: f.ordered },

      actions: {
        total: actKindRes.rows.reduce((s, r) => s + r.n, 0),
        kinds: actKindRes.rows.map((r) => ({ kind: r.kind, label: USER_EVENT_KINDS[r.kind] || r.kind, n: r.n })),
        daily: actDailyRes.rows.map((r) => ({ day: String(r.day), n: r.n })),
      },
    });
  } catch (e) {
    // ⚠️ Jadval hali yaratilmagan bo'lsa (migratsiya o'tkazilmagan) bu yerga
    // tushadi va panel blokni ko'rsatmaydi — sayt esa ishlayveradi.
    console.error('adminTraffic xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/admin/users — «BOT USERLAR» (2026-08-23, db/029) ============
// Founder referensi: har foydalanuvchi bir qator + pastida «Oxirgi
// harakatlar» lentasi. `summary` ga QO'SHILMADI — u panelning eng issiq
// so'rovi (`server.js` dagi trafik izohi bilan bitta sabab).
//
// ⚠️ Raqamlar HALOL bo'lsin:
//   * `aiWeek` — `user_events` dagi `ai_image` SO'ROVLARI (keshdan kelgani
//     ham). `ai_credits.spent` emas: u cheksiz ro'yxatdagilarda ham o'sadi,
//     lekin sanasiz — «7 kun» savoliga javob bera olmaydi;
//   * `lastSeen` — `users.last_seen_at`; NULL = o'lchov boshlangandan beri
//     kirmagan YOKI undan oldin kirgan (panel `—` ko'rsatadi, sana emas);
//   * `credits.balance` qator yo'q bo'lsa `AI_CREDITS_START` — `takeCredits`
//     bilan ayni mantiq; `unlimited` ro'yxatdan.
// Lenta yorliqlari SERVERDAN (`lib/user-events.js` → `KINDS`) — panelda
// ikkinchi ro'yxat yashamasin.
async function handleAdminUsers(req, res, ip) {
  if (rateLimited(`adminusers:${ip}`, 30)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;

  const xom = parseInt(new URL(req.url, 'http://x').searchParams.get('days'), 10);
  const days = Number.isInteger(xom) ? Math.min(90, Math.max(1, xom)) : 7;

  try {
    const [usersRes, feedRes, kindRes] = await Promise.all([
      pool.query(`
        SELECT u.tg_user_id, u.full_name, u.tg_username, u.role, u.phone, u.phone IS NOT NULL AS has_phone,
               u.created_at, u.last_seen_at, u.engaged_at IS NOT NULL AS engaged,
               c.balance, c.spent,
               (SELECT count(*) FROM user_events e
                 WHERE e.tg_user_id = u.tg_user_id AND e.kind = 'ai_image'
                   AND e.at >= now() - interval '7 days')::int AS ai_week,
               (SELECT count(*) FROM orders o
                 WHERE o.tg_user_id = u.tg_user_id
                   AND o.status NOT IN ('cancelled','refunded'))::int AS orders
          FROM users u
          LEFT JOIN ai_credits c ON c.tg_user_id = u.tg_user_id
         WHERE u.tg_user_id IS NOT NULL
         ORDER BY u.last_seen_at DESC NULLS LAST, u.created_at DESC
         LIMIT 500`),
      pool.query(`
        SELECT e.at, e.kind, e.product_id, e.label, e.tg_user_id,
               u.full_name, u.tg_username, p.name_uz AS product_name,
               CASE WHEN e.kind = 'order' THEN
                 (SELECT string_agg(oi.name || ' ×' || oi.qty, ', ' ORDER BY oi.id)
                    FROM order_items oi WHERE oi.order_id = e.label) END AS order_items
          FROM user_events e
          LEFT JOIN users u ON u.tg_user_id = e.tg_user_id
          LEFT JOIN products p ON p.id = e.product_id
         WHERE e.at >= now() - ($1::int * interval '1 day')
         ORDER BY e.at DESC LIMIT 150`, [days]),
      pool.query(`
        SELECT kind, count(*)::int AS n FROM user_events
         WHERE at >= now() - ($1::int * interval '1 day')
         GROUP BY kind ORDER BY n DESC`, [days]),
    ]);

    ok(res, {
      days,
      limits: { start: AI_CREDITS_START },
      users: usersRes.rows.map((r) => ({
        tgId: String(r.tg_user_id),
        name: r.full_name, username: r.tg_username, role: r.role,
        // Raqamning O'ZI — founder qarori (2026-08-23): panel admin tokeni
        // bilan yopiq, raqam buyurtma bo'yicha bog'lanish uchun kerak.
        phone: r.phone || null, hasPhone: r.has_phone, engaged: r.engaged,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
        lastSeen: r.last_seen_at ? new Date(r.last_seen_at).toISOString() : null,
        aiWeek: r.ai_week, orders: r.orders,
        credits: {
          balance: r.balance == null ? AI_CREDITS_START : r.balance,
          spent: r.spent || 0,
          unlimited: AI_UNLIMITED_TG_IDS.has(String(r.tg_user_id)),
        },
      })),
      feed: feedRes.rows.map((r) => ({
        at: new Date(r.at).toISOString(),
        kind: r.kind, label: USER_EVENT_KINDS[r.kind] || r.kind,
        tgId: String(r.tg_user_id),
        user: r.full_name || (r.tg_username ? '@' + r.tg_username : String(r.tg_user_id)),
        // Buyurtma: «#LM-104 — Ipak atlas ×2, Tafta ×1». Mahsulot
        // o'chirilgan bo'lsa xom id (db/028 naqshi).
        subject: r.order_items ? `${r.label} — ${r.order_items}` : (r.product_name || r.label || r.product_id || null),
      })),
      kinds: kindRes.rows.map((r) => ({ kind: r.kind, label: USER_EVENT_KINDS[r.kind] || r.kind, n: r.n })),
      total: kindRes.rows.reduce((s, r) => s + r.n, 0),
    });
  } catch (e) {
    console.error('adminUsers xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/admin/user-events — BITTA FOYDALANUVCHI HARAKATLARI (2026-08-23) ============
// Founder: «qaysi user nimalar qilganini». Umumiy lenta 150 qator bilan
// chegaralangan — bitta odamniki shu yerdan, o'z oynasi bilan.
async function handleAdminUserEvents(req, res, ip) {
  if (rateLimited(`adminuserev:${ip}`, 60)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;
  const u = new URL(req.url, 'http://x');
  const tg = String(u.searchParams.get('tg') || '').trim();
  if (!/^\d{1,19}$/.test(tg)) return fail(res, 'tg yaroqsiz', 400);
  const xom = parseInt(u.searchParams.get('days'), 10);
  const days = Number.isInteger(xom) ? Math.min(365, Math.max(1, xom)) : 30;
  try {
    const { rows } = await pool.query(`
      SELECT e.at, e.kind, e.product_id, e.label, p.name_uz AS product_name,
             CASE WHEN e.kind = 'order' THEN
               (SELECT string_agg(oi.name || ' ×' || oi.qty, ', ' ORDER BY oi.id)
                  FROM order_items oi WHERE oi.order_id = e.label) END AS order_items
        FROM user_events e
        LEFT JOIN products p ON p.id = e.product_id
       WHERE e.tg_user_id = $1 AND e.at >= now() - ($2::int * interval '1 day')
       ORDER BY e.at DESC LIMIT 300`, [tg, days]);
    ok(res, {
      tgId: tg, days,
      feed: rows.map((r) => ({
        at: new Date(r.at).toISOString(),
        kind: r.kind, label: USER_EVENT_KINDS[r.kind] || r.kind,
        subject: r.order_items ? `${r.label} — ${r.order_items}` : (r.product_name || r.label || r.product_id || null),
      })),
    });
  } catch (e) {
    console.error('adminUserEvents xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/admin/cf-traffic — CLOUDFLARE TRAFIGI (2026-08-19) ============
// Manba — Cloudflare Web Analytics (`lib/cf-analytics.js`). Yuqoridagi
// `/api/admin/traffic` ni ALMASHTIRMAYDI va u bilan SOLISHTIRILMAYDI:
// bizniki qaysi MATO ko'rilganini biladi (aniq), bu esa necha KISHI
// kelganini (taxminiy).
//
// ⚠️ Alohida endpoint ATAYLAB: bitta javobga qo'shilsa Cloudflare yiqilgan
// kuni butun trafik sahifasi qulardi. Endi har biri o'z holicha yiqiladi va
// panel qaysi manba yo'qligini AYTADI.
//
// ⚠️ Javob 10 daqiqa KESHLANADI: Cloudflare so'rovi sekin va panel har
// ochilganda chaqiriladi. Kesh xotirada — restart'da bo'shaydi, bu yetarli.
let cfKesh = null;   // { vaqt, days, data }
const CF_KESH_MS = 10 * 60 * 1000;

async function handleAdminCfTraffic(req, res, ip) {
  if (rateLimited(`admincftraffic:${ip}`, 20)) return fail(res, 'too many requests', 429);
  if (!adminPanelAuth(req, res)) return;

  const xom = parseInt(new URL(req.url, 'http://x').searchParams.get('days'), 10);
  const days = Number.isInteger(xom) ? Math.min(90, Math.max(7, xom)) : 30;

  // ⚠️ `ok()` ishlatiladi, `sendJson` EMAS: bu fayl `sendJson` ni import
  // qilmaydi (u `lib/http` ichida qoladi va tashqariga `ok`/`fail` orqali
  // chiqadi). 2026-08-19 da aynan shu production'da yiqilgan —
  // `sendJson is not defined`. Testlar yashil edi, chunki ular MODULNI
  // sinardi, ENDPOINTNI emas; nuqsonni alert tomi ko'rsatdi.
  if (cfKesh && cfKesh.days === days && Date.now() - cfKesh.vaqt < CF_KESH_MS) {
    return ok(res, cfKesh.data);
  }

  const data = await cfTraffic(days);
  // ⚠️ Xato KESHLANMAYDI — aks holda bir marta yiqilgan so'rov 10 daqiqa
  // «xato» qaytarib turardi va tuzatilgani ko'rinmasdi.
  if (!data.xato) cfKesh = { vaqt: Date.now(), days, data };
  ok(res, data);
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

  // ============ VIDEONI O'CHIRISH (db/024) ============
  // `db/023` bilan video xaridorga ko'rina boshladi, olib tashlash yo'li esa
  // yo'q edi — nomaqbul video chiqsa faqat BUTUN e'lonni rad etish qolardi,
  // ya'ni sotuvchi aybsiz mahsuloti bilan birga jazolanardi.
  video_remove: {
    schema: { reason: { type: 'string', required: false, max: 500 } },
    async check(targetId) {
      const { rows } = await pool.query(
        `SELECT id, name_uz, vid_seconds FROM products
          WHERE id = $1 AND vid_r2_key IS NOT NULL`, [String(targetId)]);
      if (!rows.length) throw new ClientError("video topilmadi — allaqachon o'chirilganmi?");
      return rows[0];
    },
    summary: (t, p) =>
      `🎬 <b>Videoni o'chirish</b>\n\n${escapeHtml(t.name_uz)}` +
      (t.vid_seconds ? ` — ${escapeHtml(String(t.vid_seconds))} s` : '') +
      (p.reason ? `\n<b>Sabab:</b> ${escapeHtml(p.reason)}` : '') +
      `\n\n<i>Mahsulot o'chmaydi — faqat video olib tashlanadi.</i>`,
    async run(a) {
      // ---- 1. BAZA BIRINCHI ----
      // Tartib ATAYLAB shunday: bazadan ketishi bilan video ilovada KO'RINMAY
      // qoladi. R2 yoki purge yiqilsa ham xaridor uni endi ko'rmaydi, ya'ni
      // eng muhim natija birinchi qadamda qo'lga kiritiladi.
      //
      // Kalitlar `WITH` bilan O'CHIRISHDAN OLDIN olinadi — `RETURNING` ustunni
      // `NULL` qilingandan keyin o'qiydi va kalitlar yo'qolib, R2 dagi obyekt
      // abadiy qolib ketardi.
      const { rows } = await pool.query(
        `WITH eski AS (
           SELECT id, name_uz, submitted_by_tg, vid_r2_key, vid_poster_r2_key
             FROM products WHERE id = $1 AND vid_r2_key IS NOT NULL FOR UPDATE)
         UPDATE products p
            SET vid_file_id=NULL, vid_r2_key=NULL, vid_poster_file_id=NULL,
                vid_poster_r2_key=NULL, vid_seconds=NULL, vid_bytes=NULL, vid_at=NULL,
                awaiting_video=false
           FROM eski WHERE p.id = eski.id
         RETURNING eski.name_uz, eski.submitted_by_tg,
                   eski.vid_r2_key, eski.vid_poster_r2_key`,
        [a.target_id]);
      if (!rows.length) throw new ClientError('video holati o\'zgargan');
      const e = rows[0];

      // ---- 2. R2 ----
      // Yiqilsa amal BEKOR QILINMAYDI (video allaqachon ko'rinmaydi), lekin
      // natija jimgina "muvaffaqiyat" ham bo'lmaydi — pastda aytiladi.
      const kalitlar = [e.vid_r2_key, e.vid_poster_r2_key].filter(Boolean);
      let r2Xato = null;
      for (const k of kalitlar) {
        try { await r2Delete(k); } catch (err) {
          r2Xato = err.message;
          // Birinchi argument — alert guruhlash KALITI (CLAUDE.md, Test 10c).
          console.error('video R2 dan o\'chirilmadi:', err.message);
        }
      }

      // ---- 3. CDN keshi ----
      // 🔴 R2 dan o'chirish YETARLI EMAS: 2026-08-09 da o'lchangan — obyekt
      // ketgandan keyin ham CDN uni `cf-cache-status: HIT` bilan berib turadi.
      const urls = kalitlar.map(r2PublicUrl).filter(Boolean);
      const purge = urls.length ? await purgeUrls(urls) : { ok: true, sabab: null };
      if (!purge.ok) console.error('video CDN keshi tozalanmadi:', purge.sabab || 'sabab yo\'q');

      await notify(e.submitted_by_tg,
        `🎬 <b>${escapeHtml(e.name_uz)}</b> videosi olib tashlandi.` +
        (a.payload.reason ? `\n\n<b>Sabab:</b> ${escapeHtml(a.payload.reason)}` : '') +
        `\n\nMahsulot o'z joyida — xohlasangiz yangi video yuborishingiz mumkin.`);

      // ⚠️ Natija HALOL aytiladi. "O'chirildi" deb qo'ya qolish eng yomon
      // variant bo'lardi: moderator ish tugadi deb o'ylaydi, video esa
      // to'g'ridan-to'g'ri havola bilan hamon ochilaveradi.
      let txt = `🎬 video olib tashlandi: ${e.name_uz}`;
      if (r2Xato) txt += `\n⚠️ R2 dan o'chirilmadi (${r2Xato}) — obyekt bucket'da qoldi`;
      if (!purge.ok) {
        txt += CF_PURGE_ENABLED
          ? `\n⚠️ CDN keshi tozalanmadi (${purge.sabab}) — havola bilan hamon ochilishi mumkin, Cloudflare'dan qo'lda purge qiling`
          : `\n⚠️ CDN purge sozlanmagan — video ilovada ko'rinmaydi, lekin TO'G'RIDAN-TO'G'RI havola bilan ochilaveradi. Cloudflare'dan qo'lda purge qiling`;
      }
      return txt;
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
    async run(a, actorTg) {
      // Tranzaksiya tarix uchun qo'shildi: holat o'zgarib, tarix yozilmay
      // qolishi mumkin bo'lmasin. `status='delivered'` qorovuli saqlanadi,
      // shuning uchun `from` har doim aynan 'delivered'.
      let rows;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const upd = await client.query(
          `UPDATE orders SET status='completed', paid_out_at=now()
            WHERE id=$1 AND status='delivered' RETURNING id, payout_amount`,
          [a.target_id]);
        rows = upd.rows;
        if (!rows.length) throw new ClientError("buyurtma holati o'zgargan");
        await recordStatusChange(client, {
          orderId: a.target_id, from: 'delivered', to: 'completed',
          actorKind: 'admin', actorTg, note: "sotuvchiga pul o'tkazildi",
        });
        await client.query('COMMIT');
      } catch (e) {
        try { await client.query('ROLLBACK'); } catch (_) {}
        throw e;
      } finally {
        client.release();
      }
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
    async run(a, actorTg) {
      // `prev` CTE — tarixga "qaysi holatdan qaytarildi" kerak. Qorovul
      // (`status <> 'refunded'`) prev ustida qoladi, ya'ni ikki marta
      // qaytarish ilgarigidek rad etiladi.
      let rows;
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const upd = await client.query(
          `WITH prev AS (SELECT id, status FROM orders WHERE id=$3 FOR UPDATE)
           UPDATE orders o SET status='refunded', refund_amount=$1,
                  refund_reason=$2, refunded_at=now()
             FROM prev
            WHERE o.id = prev.id AND prev.status <> 'refunded'
            RETURNING o.id, o.tg_user_id, prev.status AS from_status`,
          [a.payload.amount, a.payload.reason, a.target_id]);
        rows = upd.rows;
        if (!rows.length) throw new ClientError("buyurtma holati o'zgargan");
        await recordStatusChange(client, {
          orderId: a.target_id, from: rows[0].from_status, to: 'refunded',
          actorKind: 'admin', actorTg,
          note: `qaytarildi ${a.payload.amount}: ${a.payload.reason}`,
        });
        await client.query('COMMIT');
      } catch (e) {
        try { await client.query('ROLLBACK'); } catch (_) {}
        throw e;
      } finally {
        client.release();
      }
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
    async run(a, actorTg) {
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
          const upd = await client.query(
            `WITH prev AS (SELECT id, status FROM orders WHERE id=$3 FOR UPDATE)
             UPDATE orders o SET status='refunded', refund_amount=$1,
                    refund_reason=$2, refunded_at=now()
               FROM prev
              WHERE o.id = prev.id AND prev.status <> 'refunded'
              RETURNING prev.status AS from_status`,
            [p.refundAmount, `Bahs #${d.id}: ${p.decision}`.slice(0, 500), d.order_id]);
          // Buyurtma ALLAQACHON `refunded` bo'lsa UPDATE 0 qator qaytaradi —
          // bu xato emas (bahs baribir hal qilinadi), lekin holat O'ZGARMAGANI
          // uchun tarixga ham yozilmaydi: bo'lmagan o'tish yozilmasin.
          if (upd.rows.length) {
            await recordStatusChange(client, {
              orderId: d.order_id, from: upd.rows[0].from_status, to: 'refunded',
              actorKind: 'admin', actorTg,
              note: `bahs #${d.id} qarori bo'yicha qaytarildi ${p.refundAmount}`,
            });
          }
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

  // Sharhni yashirish. Sharh moderatsiyasiz chiqadi (uni faqat haqiqiy
  // buyurtma bergan xaridor yoza oladi), shuning uchun bu — keyingi
  // nazorat. O'CHIRILMAYDI, `status='hidden'` qilinadi: kim, qachon va
  // NEGA yashirganini keyin ko'rish mumkin bo'lsin.
  review_hide: {
    schema: { reason: { type: 'string', required: true, min: 3, max: 500 } },
    check: (targetId) => findReviewForAdmin(targetId),
    summary: (t, p) =>
      `🙈 <b>Sharhni yashirish</b>\n\n<b>${escapeHtml(t.name_uz || t.product_id)}</b>\n` +
      `${'★'.repeat(t.stars)}${'☆'.repeat(5 - t.stars)} — ${escapeHtml(t.author_name || "noma'lum")}\n` +
      (t.body ? `<i>${escapeHtml(t.body)}</i>\n` : '') +
      `\n<b>Sabab:</b> ${escapeHtml(p.reason)}\n\n` +
      `<i>Sharh o'chirilmaydi, faqat yashiriladi va reytingdan chiqariladi.</i>`,
    async run(a) {
      const r = await hideReview(a.target_id, a.payload.reason);
      return `🙈 Sharh #${r.id} yashirildi`;
    },
  },

  // AI kredit berish (2026-08-23, «Bot userlar» sahifasi). Founder qarori:
  // «Premium» tushunchasi YO'Q, faqat kredit. Bu PUL (bitta rasm ~$0.04),
  // shuning uchun boshqa yozuv amallari bilan bitta yo'l — Telegram tasdig'i.
  //
  // ⚠️ `balance` QO'SHILADI, ustiga yozilmaydi: ikki admin ketma-ket bersa
  // ikkinchisi birinchisini yo'qotmasin. Qator yo'q bo'lsa u `AI_CREDITS_START`
  // dan boshlab tug'iladi — `routes/ai.js` → `takeCredits` dagi bilan AYNI
  // mantiq, aks holda «hali rasm chizmagan odamga 10 kredit» 10 ga teng
  // bo'lib qolardi, boshqalarda esa 20+10.
  credit_grant: {
    schema: { amount: { type: 'int', required: true, min: 1, max: 1000 } },
    async check(targetId) {
      if (!/^\d{1,19}$/.test(targetId)) throw new ClientError('Telegram ID yaroqsiz');
      const { rows } = await pool.query(
        `SELECT u.tg_user_id, u.full_name, u.tg_username, c.balance, c.spent
           FROM users u LEFT JOIN ai_credits c ON c.tg_user_id = u.tg_user_id
          WHERE u.tg_user_id = $1`, [targetId]);
      if (!rows.length) throw new ClientError('foydalanuvchi topilmadi');
      if (AI_UNLIMITED_TG_IDS.has(String(targetId))) {
        throw new ClientError('bu foydalanuvchi cheksiz ro\'yxatda — kredit kerak emas');
      }
      return rows[0];
    },
    summary: (t, p) =>
      `🎨 <b>AI kredit berish</b>\n\n<b>${escapeHtml(t.full_name || t.tg_username || t.tg_user_id)}</b>` +
      (t.tg_username ? ` (@${escapeHtml(t.tg_username)})` : '') + ` · <code>${escapeHtml(String(t.tg_user_id))}</code>\n` +
      `<b>Hozir:</b> ${t.balance == null ? `${AI_CREDITS_START} (boshlang'ich)` : t.balance} kredit, sarflangan ${t.spent || 0}\n` +
      `<b>Qo'shiladi:</b> +${p.amount}`,
    async run(a) {
      const n = Number(a.payload.amount);
      // ⚠️ `::int` SHART: turi yozilmagan ikki parametr Postgres uchun
      // `unknown` bo'ladi va u qaysi `+` operatorini tanlashni bilmaydi
      // ("operator is not unique: unknown + unknown"). `DO UPDATE` qatorida
      // kerak emas — u yerda `ai_credits.balance` turi ma'lum va $3 shunga
      // keltiriladi. Aynan shu nuqson 2026-08-07 da `routes/ai.js` da
      // bo'lgan, 2026-08-31 da esa SHU YERDA takrorlandi: qorovul (Test 14o)
      // faqat `takeCredits` ga qarardi, ya'ni topilgan nuqson kengligida
      // yozilgan edi. Endi qorovul butun `server/` ni skanerlaydi.
      const { rows } = await pool.query(
        `INSERT INTO ai_credits (tg_user_id, balance, spent)
         VALUES ($1, $2::int + $3::int, 0)
         ON CONFLICT (tg_user_id)
         DO UPDATE SET balance = ai_credits.balance + $3, updated_at = now()
         RETURNING balance`,
        [a.target_id, AI_CREDITS_START, n]);
      await notify(a.target_id,
        `🎨 Sizga <b>${n}</b> ta AI rasm krediti berildi. Hozirgi qoldiq: <b>${rows[0].balance}</b>.`);
      return `🎨 +${n} kredit berildi, qoldiq ${rows[0].balance}`;
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
      // Tugmani BOSGAN odamning Telegram ID'si — tarixga "kim qildi" bo'lib
      // yoziladi. `a.decided_by` bu paytda hali NULL (u pastda, run'dan KEYIN
      // qo'yiladi), shuning uchun qiymat parametr sifatida uzatiladi.
      const out = await ADMIN_ACTIONS[a.kind].run(a, String(cq.from.id));
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

module.exports = {
  handleAdminSummary, handleAdminTraffic, handleAdminCfTraffic, handleAdminUsers, handleAdminUserEvents,
  handleAdminActionRequest, handleAdminActionStatus, handleAdminActionCallback,
};
