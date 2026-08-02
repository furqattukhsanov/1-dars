const { PREPAY_RATE, COMMISSION_RATE, DELIVERY_FEE_ESTIMATE } = require('../config');
const { pool } = require('../db');
const { authUser } = require('../lib/auth');
const { escapeHtml, money, dateLabel } = require('../lib/format');
const { validate, ClientError } = require('../lib/validate');
const { rateLimited, readBody, sendJson, fail } = require('../lib/http');
const { sendOrderNotifyMessage, sendBuyerConfirmMessage } = require('../lib/telegram-api');
const { recordStatusChange } = require('../lib/order-history');
const { webSessionUser } = require('./web-auth');

// ============ ZAXIRANI KAMAYTIRISH ============
// Buyurtma tranzaksiyasi ICHIDA chaqiriladi (BEGIN ... COMMIT orasida).
//
// Nega oddiy "avval o'qib, keyin yozish" emas: ikki xaridor bir vaqtda oxirgi
// rulonni olsa, ikkalasi ham "1 ta bor" deb o'qiydi va ikkalasi ham o'tib
// ketadi (race condition). Shuning uchun tekshiruv va kamaytirish BITTA
// atomik `UPDATE ... WHERE stock >= qty` da bo'ladi — Postgres qatorni
// qulflaydi, ikkinchi tranzaksiya kutadi va yangilangan sonni ko'radi.
// Agar shart bajarilmasa UPDATE 0 qator qaytaradi — bu "zaxira yetmadi" degani.
//
// `stock IS NULL` = CHEKSIZ (011 migratsiyasi): `made` ("buyurtmaga
// tayyorlanadi") mahsulotlar va sotuvchi hali son kiritmagan eski e'lonlar.
// NULL - qty = NULL, ya'ni ular hech qachon tugamaydi.
//
// Qatorlar ID bo'yicha TARTIBLANADI: ikki buyurtma bir xil ikki mahsulotni
// teskari tartibda qulflasa Postgres deadlock beradi. Bir xil tartib buni
// butunlay yo'q qiladi.
async function decrementStock(client, items) {
  for (const it of [...items].sort((a, b) => String(a.id).localeCompare(String(b.id)))) {
    const { rows } = await client.query(
      `UPDATE products SET stock = stock - $2
        WHERE id = $1 AND (stock IS NULL OR stock >= $2)
        RETURNING stock`,
      [it.id, it.qty]
    );
    if (rows.length) continue;

    // Yetmadi. Qolgan sonni xabar uchun o'qiymiz — tranzaksiya baribir
    // ROLLBACK bo'ladi, shuning uchun bu qo'shimcha o'qish zararsiz.
    const { rows: cur } = await client.query(
      `SELECT stock, name_uz, unit FROM products WHERE id = $1`, [it.id]);
    const left = cur.length && cur[0].stock !== null ? Number(cur[0].stock) : 0;
    const name = cur.length ? cur[0].name_uz : it.name;
    const unit = (cur.length ? cur[0].unit : it.unit) || 'dona';
    throw new ClientError(
      left > 0
        ? `"${name}" — zaxirada faqat ${left} ${unit} qoldi`
        : `"${name}" — zaxirada tugadi`
    );
  }
}

// Bekor qilingan buyurtmaning zaxirasini QAYTARISH.
//
// Faqat `cancelled` uchun: sotuvchi yangi buyurtmani rad etganda mato hali
// jo'natilmagan — rulonlar omborda turibdi va yana sotilishi kerak.
//
// `refunded` uchun ATAYLAB chaqirilmaydi: pul qaytarish bahs qarori bilan
// bo'ladi, mato esa odatda xaridorda qoladi yoki shikastlangan. U yerda
// zaxirani avtomatik qaytarish omborda YO'Q matoni "bor" deb ko'rsatardi.
// Kerak bo'lsa sotuvchi kabinetdan qo'lda tiklaydi (2026-07-30 qarori).
//
// NULL (cheksiz) zaxiraga tegilmaydi: NULL + qty = NULL bo'lgani uchun
// SQL o'zi to'g'ri ishlaydi, alohida shart kerak emas.
async function restoreStock(client, orderId) {
  await client.query(
    `UPDATE products p SET stock = p.stock + oi.qty
       FROM order_items oi
      WHERE oi.order_id = $1 AND oi.product_id = p.id`,
    [orderId]
  );
}

// ============ /api/orders POST — buyurtma yaratish (bazaga) ============
async function handleCreateOrder(req, res, ip) {
  if (rateLimited(`createorder:${ip}`)) return fail(res, 'too many requests', 429);
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  let client;
  try {
    client = await pool.connect();
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body);

    // 1) Skalyar maydonlar — uzunlik cheklovlari (DB'ni suiiste'moldan himoya qiladi)
    const v = validate(data, {
      buyerName: { type: 'string', required: false, max: 200 },
      address:   { type: 'string', required: false, max: 500 },
      payment:   { type: 'string', required: false, max: 100 },
      comment:   { type: 'string', required: false, max: 1000 },
      lang:      { type: 'string', required: false, enum: ['uz', 'ru'], default: 'uz' },
    });
    if (!v.ok) throw new ClientError(v.error);

    // 2) Savat (items) — massiv, har element {id:string, qty:int}
    const lines = Array.isArray(data.items) ? data.items : [];
    if (!lines.length) throw new ClientError("Savat bo'sh");
    if (lines.length > 50) throw new ClientError("Juda ko'p tur (maksimum 50)");
    for (const l of lines) {
      if (!l || typeof l.id !== 'string' || !l.id.trim()) throw new ClientError("Mahsulot ID noto'g'ri");
      const q = parseInt(l.qty, 10);
      if (!Number.isInteger(q) || q < 1 || q > 100000) throw new ClientError("Miqdor 1..100000 oralig'ida bo'lishi kerak");
    }

    // Mahsulot narx/nom/moq'ni BAZADAN olamiz (klientga ishonmaymiz)
    const ids = lines.map((l) => String(l.id));
    const qtyById = new Map(lines.map((l) => [String(l.id), Math.max(1, parseInt(l.qty, 10) || 1)]));
    const { rows: prods } = await client.query(
      `SELECT id, price, name_uz, name_ru, unit, moq FROM products WHERE id = ANY($1)`,
      [ids]
    );
    if (!prods.length) throw new ClientError('Mahsulot topilmadi');

    // 3) MOQ (minimal buyurtma) — biznes qoidasi, faqat server tomonda ishonchli
    for (const p of prods) {
      const qty = qtyById.get(p.id) || 1;
      const moq = Number(p.moq) || 1;
      if (qty < moq) throw new ClientError(`"${p.name_uz}" uchun minimal buyurtma: ${moq} ${p.unit}`);
    }

    const lang = data.lang === 'ru' ? 'ru' : 'uz';
    const items = prods.map((p) => {
      const qty = qtyById.get(p.id) || 1;
      return {
        id: p.id,
        qty,
        unitPrice: Number(p.price),
        name: lang === 'ru' ? p.name_ru : p.name_uz,
        unit: p.unit,
      };
    });
    const total = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
    // Oldindan to'lov SERVER tomonda hisoblanadi — klient yuborgan `prepay`/`rest`
    // qiymatlariga ishonmaymiz (narx/MOQ kabi). Qolgan qism mato BTS'ga yetib
    // kelgach to'lanadi; to'lanmaguncha BTS mahsulotni bermaydi.
    const prepay = Math.round(total * PREPAY_RATE);
    const rest = total - prepay;
    // Komissiya ham SERVER tomonda: stavka snapshot qilinadi, sotuvchiga
    // o'tkaziladigan summa shu yerda qat'iylashadi. Admin "Pul o'tkazildi"
    // bosganda summa qaytadan hisoblanmaydi — buyurtmadagi qiymat ishlatiladi.
    const commissionAmount = Math.round(total * COMMISSION_RATE);
    const payoutAmount = total - commissionAmount;

    await client.query('BEGIN');
    // Zaxira ID olishdan OLDIN kamaytiriladi: ketma-ketlik (`nextval`)
    // ROLLBACK'da qaytmaydi, shuning uchun zaxira yetmagan urinish
    // buyurtma raqamini behuda yoqib yubormasin.
    await decrementStock(client, items);

    const { rows: idRows } = await client.query(`SELECT '#LM-' || nextval('order_seq') AS id`);
    const orderId = idRows[0].id;

    await client.query(
      `INSERT INTO orders (id, buyer_name, tg_user_id, tg_username, address, payment, comment,
                           total_amount, prepay_amount, rest_amount,
                           commission_rate, commission_amount, payout_amount, delivery_fee_estimate, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'pending')`,
      [
        orderId,
        data.buyerName || null,
        String(u.id),               // tasdiqlangan Telegram ID (mijozdan emas — imzodan)
        u.username || data.tgUser || null,
        data.address || null,
        data.payment || null,
        data.comment || null,
        total,
        prepay,
        rest,
        COMMISSION_RATE,
        commissionAmount,
        payoutAmount,
        DELIVERY_FEE_ESTIMATE,
      ]
    );
    for (const it of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, qty, unit_price) VALUES ($1,$2,$3,$4,$5)`,
        [orderId, it.id, it.name, it.qty, it.unitPrice]
      );
    }
    // Tarixning birinchi qatori — buyurtma tug'ilgan lahza (from = NULL)
    await recordStatusChange(client, {
      orderId, from: null, to: 'pending', actorKind: 'buyer', actorTg: u.id,
      note: 'Mini App',
    });
    await client.query('COMMIT');

    // Telegram xabarlari (baza yozilgach)
    const uShort = (u) => (u === 'rulon' ? 'rulon' : u || '');
    const itemsText = items
      .slice(0, 30)
      .map((it) => `• ${escapeHtml(it.name || '?')} — ${escapeHtml(it.qty)} ${escapeHtml(uShort(it.unit))} x ${escapeHtml(money(it.unitPrice))}`)
      .join('\n');
    const adminText = [
      '🛒 <b>Yangi buyurtma — LolaMarket</b>',
      '',
      `<b>ID:</b> ${escapeHtml(orderId)}`,
      `<b>Xaridor:</b> ${escapeHtml(data.buyerName || "Noma'lum")}`,
      u.username ? `<b>Telegram:</b> @${escapeHtml(u.username)}` : '',
      `<b>Manzil:</b> ${escapeHtml(data.address || '-')}`,
      `<b>To'lov:</b> ${escapeHtml(data.payment || '-')}`,
      data.comment ? `<b>Izoh:</b> ${escapeHtml(data.comment)}` : '',
      '',
      '<b>Tarkib:</b>',
      itemsText,
      '',
      `<b>Jami:</b> ${escapeHtml(money(total))}`,
      // Sotuvchi jo'natishdan oldin puli kelganini ko'rishi shart — modelning asosi shu
      `💰 <b>Oldindan to'landi:</b> ${escapeHtml(money(prepay))}`,
      `<b>Qolgani (BTS'da olishda):</b> ${escapeHtml(money(rest))}`,
      `🚚 <b>Yetkazish (taxminiy, BTS'ga to'lanadi):</b> ${escapeHtml(money(DELIVERY_FEE_ESTIMATE))}`,
      // Faqat ADMIN chatida — sotuvchi va xaridor komissiyani ko'rmaydi
      `📊 <b>Komissiya:</b> ${escapeHtml(money(commissionAmount))} · <b>Sotuvchiga:</b> ${escapeHtml(money(payoutAmount))}`,
      `\nTasdiqlash uchun: <code>/tasdiqla ${escapeHtml(orderId)}</code>`,
    ]
      .filter(Boolean)
      .join('\n');

    sendOrderNotifyMessage(adminText).catch((e) => console.error('admin notify:', e.message));
    sendBuyerConfirmMessage(u.id, itemsText, money(total), money(prepay), money(rest), money(DELIVERY_FEE_ESTIMATE)).catch(() => {});

    sendJson(res, 200, { ok: true, orderId, status: 'pending', total, prepay, rest, deliveryFeeEstimate: DELIVERY_FEE_ESTIMATE });
  } catch (e) {
    try { if (client) await client.query('ROLLBACK'); } catch (_) {}
    console.error('createOrder xatosi:', e.message);
    // Faqat foydalanuvchiga mo'ljallangan (validatsiya) xatolarnigina ko'rsatamiz;
    // DB/ichki xatolar umumiy "server error" bilan yashiriladi.
    if (e.userFacing) fail(res, e.message, 400);
    else fail(res, 'server error', 500);
  } finally {
    if (client) client.release();
  }
}

// ============ /api/web-orders POST — SAYT buyurtmasi (bazaga) ============
// lolamarket.uz savatidan keladi. Mini App'dan ikki farqi bor:
//   1) Telegram imzosi YO'Q — sayt xaridorida Telegram hisobi bo'lmasligi mumkin.
//      Shuning uchun kimligi telefon orqali aniqlanadi va u MAJBURIY.
//   2) `source='web'` bilan yoziladi — panelda buyurtma qayerdan kelgani ko'rinadi.
// Narx, MOQ, oldindan to'lov va komissiya — hammasi SERVER tomonda, xuddi
// Mini App'dagidek. Klient yuborgan summaga hech qachon ishonilmaydi.
//
// MUHIM (2026-07-29): ilgari sayt buyurtmasi faqat `/api/telegram-notify` ga
// borardi, u esa bazaga yozmaydi — buyurtma Telegram'ga tushib, admin panelda
// umuman ko'rinmasdi. Shu endpoint o'sha teshikni yopadi.
async function handleCreateWebOrder(req, res, ip) {
  // Imzo yo'q — spamga ochiq. Shuning uchun limit Mini App'nikidan qattiqroq.
  if (rateLimited(`weborder:${ip}`, 5)) return fail(res, 'too many requests', 429);
  // Saytda Telegram orqali kirgan bo'lsa — kimligini cookie sessiyasidan olamiz.
  // Telegram ID mijozdan SO'RALMAYDI: u sessiyaga botdagi tasdiqda yozilgan.
  const session = await webSessionUser(req).catch((e) => {
    console.error('webOrder sessiya xatosi:', e.message);
    return null;
  });
  let client;
  try {
    client = await pool.connect();
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body);

    const v = validate(data, {
      buyerName: { type: 'string', required: true,  max: 200 },
      phone:     { type: 'string', required: true,  max: 30 },
      company:   { type: 'string', required: false, max: 200 },
      address:   { type: 'string', required: true,  max: 500 },
      comment:   { type: 'string', required: false, max: 1000 },
    });
    if (!v.ok) throw new ClientError(v.error);

    // Telefon: faqat raqamlar sanaladi (format erkin — +998, probel, qavs mayli)
    const digits = String(v.data.phone).replace(/\D/g, '');
    if (digits.length < 9) throw new ClientError("Telefon raqami to'liq emas");

    // Savat — Mini App bilan bir xil shakl: [{id, qty}]
    const lines = Array.isArray(data.items) ? data.items : [];
    if (!lines.length) throw new ClientError("Savat bo'sh");
    if (lines.length > 50) throw new ClientError("Juda ko'p tur (maksimum 50)");
    for (const l of lines) {
      if (!l || typeof l.id !== 'string' || !l.id.trim()) throw new ClientError("Mahsulot ID noto'g'ri");
      const q = parseInt(l.qty, 10);
      if (!Number.isInteger(q) || q < 1 || q > 100000) throw new ClientError("Miqdor 1..100000 oralig'ida bo'lishi kerak");
    }

    const ids = lines.map((l) => String(l.id));
    const qtyById = new Map(lines.map((l) => [String(l.id), Math.max(1, parseInt(l.qty, 10) || 1)]));
    const { rows: prods } = await client.query(
      `SELECT id, price, name_uz, unit, moq FROM products WHERE id = ANY($1)`,
      [ids]
    );
    if (!prods.length) throw new ClientError('Mahsulot topilmadi');

    for (const p of prods) {
      const qty = qtyById.get(p.id) || 1;
      const moq = Number(p.moq) || 1;
      if (qty < moq) throw new ClientError(`"${p.name_uz}" uchun minimal buyurtma: ${moq} ${p.unit}`);
    }

    const items = prods.map((p) => ({
      id: p.id,
      qty: qtyById.get(p.id) || 1,
      unitPrice: Number(p.price),
      name: p.name_uz,
      unit: p.unit,
    }));
    const total = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
    const prepay = Math.round(total * PREPAY_RATE);
    const rest = total - prepay;
    const commissionAmount = Math.round(total * COMMISSION_RATE);
    const payoutAmount = total - commissionAmount;

    // ID Mini App bilan BIR XIL ketma-ketlikdan olinadi — shunda `/tasdiqla #LM-...`
    // buyrug'i sayt buyurtmalarida ham ishlaydi (webhook regex faqat raqam kutadi).
    await client.query('BEGIN');
    // Mini App yo'lidagi kabi — zaxira ID olishdan oldin kamaytiriladi
    await decrementStock(client, items);

    const { rows: idRows } = await client.query(`SELECT '#LM-' || nextval('order_seq') AS id`);
    const orderId = idRows[0].id;

    const buyerName = v.data.company ? `${v.data.buyerName} (${v.data.company})` : v.data.buyerName;

    await client.query(
      `INSERT INTO orders (id, buyer_id, buyer_name, buyer_phone, tg_user_id, tg_username,
                           address, payment, comment,
                           total_amount, prepay_amount, rest_amount,
                           commission_rate, commission_amount, payout_amount, delivery_fee_estimate, status, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending','web')`,
      [
        orderId,
        session ? session.id : null,
        buyerName,
        v.data.phone,
        session ? session.tgUserId : null,
        session ? session.username : null,
        v.data.address,
        'Kelishilgan holda',
        v.data.comment || null,
        total,
        prepay,
        rest,
        COMMISSION_RATE,
        commissionAmount,
        payoutAmount,
        DELIVERY_FEE_ESTIMATE,
      ]
    );
    for (const it of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, qty, unit_price) VALUES ($1,$2,$3,$4,$5)`,
        [orderId, it.id, it.name, it.qty, it.unitPrice]
      );
    }
    // Saytda Telegram hisobi bo'lmasligi mumkin — u holda actorTg NULL qoladi,
    // xaridor kimligi `orders.buyer_phone` da saqlanadi.
    await recordStatusChange(client, {
      orderId, from: null, to: 'pending', actorKind: 'buyer',
      actorTg: session ? session.tgUserId : null,
      note: 'sayt (web)',
    });
    await client.query('COMMIT');

    const uShort = (u) => (u === 'rulon' ? 'rulon' : u || '');
    const itemsText = items
      .slice(0, 30)
      .map((it) => `• ${escapeHtml(it.name || '?')} — ${escapeHtml(it.qty)} ${escapeHtml(uShort(it.unit))} x ${escapeHtml(money(it.unitPrice))}`)
      .join('\n');
    const adminText = [
      '🌐 <b>Yangi buyurtma — SAYTDAN</b>',
      '',
      `<b>ID:</b> ${escapeHtml(orderId)}`,
      `<b>Xaridor:</b> ${escapeHtml(buyerName)}`,
      `<b>Telefon:</b> ${escapeHtml(v.data.phone)}`,
      session && session.username ? `<b>Telegram:</b> @${escapeHtml(session.username)}` : '',
      `<b>Manzil:</b> ${escapeHtml(v.data.address)}`,
      v.data.comment ? `<b>Izoh:</b> ${escapeHtml(v.data.comment)}` : '',
      '',
      '<b>Tarkib:</b>',
      itemsText,
      '',
      `<b>Jami:</b> ${escapeHtml(money(total))}`,
      `💰 <b>Oldindan to'lov:</b> ${escapeHtml(money(prepay))}`,
      `<b>Qolgani:</b> ${escapeHtml(money(rest))}`,
      `🚚 <b>Yetkazish (taxminiy, BTS'ga to'lanadi):</b> ${escapeHtml(money(DELIVERY_FEE_ESTIMATE))}`,
      `📊 <b>Komissiya:</b> ${escapeHtml(money(commissionAmount))} · <b>Sotuvchiga:</b> ${escapeHtml(money(payoutAmount))}`,
      // Telegram orqali kirmagan xaridor bilan bog'lanish faqat qo'ng'iroq orqali
      session
        ? "\n💬 Xaridor Telegram'da — holat o'zgarishi unga avtomatik boradi."
        : "\n☎️ Xaridor Telegram'da emas — telefon qiling.",
      `Tasdiqlash uchun: <code>/tasdiqla ${escapeHtml(orderId)}</code>`,
    ]
      .filter(Boolean)
      .join('\n');

    sendOrderNotifyMessage(adminText).catch((e) => console.error('web order notify:', e.message));

    // Telegram orqali kirgan xaridorga tasdiq xabari — endi uning ID'si bor
    if (session) {
      sendBuyerConfirmMessage(session.tgUserId, itemsText, money(total), money(prepay), money(rest), money(DELIVERY_FEE_ESTIMATE))
        .catch((e) => console.error('web order buyer confirm:', e.message));
      // Telefon profilda yo'q bo'lsa — keyingi buyurtmada forma o'zi to'lsin
      pool.query(`UPDATE users SET phone = COALESCE(phone, $2) WHERE id = $1`, [session.id, v.data.phone])
        .catch((e) => console.error('users.phone yangilashda xato:', e.message));
    }

    sendJson(res, 200, { ok: true, orderId, status: 'pending', total, prepay, rest, deliveryFeeEstimate: DELIVERY_FEE_ESTIMATE });
  } catch (e) {
    try { if (client) await client.query('ROLLBACK'); } catch (_) {}
    console.error('createWebOrder xatosi:', e.message);
    if (e.userFacing) fail(res, e.message, 400);
    else fail(res, 'server error', 500);
  } finally {
    if (client) client.release();
  }
}


// ============ /api/orders GET — foydalanuvchi buyurtmalari (tarix) ============
async function handleGetOrders(req, res, ip) {
  if (rateLimited(`getorders:${ip}`, 60)) return fail(res, 'too many requests', 429);
  // Kimlik imzolangan initData'dan olinadi — mijoz uid'siga ISHONMAYMIZ.
  const u = authUser(req);
  if (!u || !u.id) return fail(res, 'unauthorized', 401);
  const uid = String(u.id);
  try {
    const { rows: orders } = await pool.query(
      `SELECT id, status, created_at, total_amount, prepay_amount, rest_amount, delivery_fee_estimate
         FROM orders WHERE tg_user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [uid]
    );
    if (!orders.length) return sendJson(res, 200, []);
    const orderIds = orders.map((o) => o.id);
    const { rows: itemRows } = await pool.query(
      `SELECT order_id, product_id, qty FROM order_items WHERE order_id = ANY($1)`,
      [orderIds]
    );
    const itemsByOrder = new Map();
    for (const it of itemRows) {
      if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, []);
      itemsByOrder.get(it.order_id).push({ id: it.product_id, qty: Number(it.qty) });
    }
    const out = orders.map((o) => ({
      id: o.id,
      date: dateLabel(new Date(o.created_at)),
      statusKey: o.status,
      total: o.total_amount === null ? null : Number(o.total_amount),
      // Eski buyurtmalarda (migratsiyagacha) bu ustunlar bo'sh — null qaytadi
      prepay: o.prepay_amount === null ? null : Number(o.prepay_amount),
      rest: o.rest_amount === null ? null : Number(o.rest_amount),
      deliveryFeeEstimate: o.delivery_fee_estimate === null ? null : Number(o.delivery_fee_estimate),
      items: itemsByOrder.get(o.id) || [],
    }));
    sendJson(res, 200, out); // orqaga moslik: yalang'och massiv
  } catch (e) {
    console.error('getOrders xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

// ============ /api/telegram-notify — ESKI klientlar uchun (faqat xabar, bazaga yozmaydi) ============
// Yangi klient /api/orders ishlatadi. Bu faqat orqaga moslik uchun qoldirilgan.
async function handleOrderNotify(req, res, ip) {
  if (rateLimited(`notify:${ip}`)) return fail(res, 'too many requests', 429);
  try {
    const body = await readBody(req, 20_000);
    const data = JSON.parse(body);
    const lines = Array.isArray(data.items) ? data.items : [];
    if (!lines.length) throw new Error("items bo'sh");
    const itemsText = lines
      .slice(0, 30)
      .map((it) => `• ${escapeHtml(it.name || '?')} — ${escapeHtml(it.qty ?? '?')} x ${escapeHtml(it.price ?? '?')}`)
      .join('\n');
    const text = [
      '🛒 <b>Yangi buyurtma — LolaMarket</b>',
      '',
      data.orderId ? `<b>ID:</b> ${escapeHtml(data.orderId)}` : '',
      `<b>Xaridor:</b> ${escapeHtml(data.buyerName || "Noma'lum")}`,
      data.tgUser ? `<b>Telegram:</b> @${escapeHtml(data.tgUser)}` : '',
      `<b>Manzil:</b> ${escapeHtml(data.address || '-')}`,
      `<b>To'lov:</b> ${escapeHtml(data.payment || '-')}`,
      data.comment ? `<b>Izoh:</b> ${escapeHtml(data.comment)}` : '',
      '',
      '<b>Tarkib:</b>',
      itemsText,
      '',
      `<b>Jami:</b> ${escapeHtml(data.total || '-')}`,
      data.orderId ? `\nTasdiqlash uchun: <code>/tasdiqla ${escapeHtml(data.orderId)}</code>` : '',
    ]
      .filter(Boolean)
      .join('\n');
    const result = await sendOrderNotifyMessage(text);
    if (data.tgUserId && /^\d+$/.test(String(data.tgUserId))) {
      sendBuyerConfirmMessage(data.tgUserId, itemsText, data.total).catch(() => {});
    }
    sendJson(res, result.status === 200 ? 200 : 502, { ok: result.status === 200 });
  } catch (e) {
    fail(res, e.message, 400);
  }
}

// ============ /api/order-status — holat (bazadan) ============
async function handleOrderStatus(req, res, ip) {
  if (rateLimited(`orderstatus:${ip}`, 60)) return fail(res, 'too many requests', 429);
  let id;
  try {
    id = new URL(req.url, 'http://x').searchParams.get('id');
  } catch (e) {
    id = null;
  }
  if (!id) return fail(res, 'invalid id', 400);
  try {
    const { rows } = await pool.query(`SELECT status FROM orders WHERE id = $1`, [id]);
    sendJson(res, 200, { status: rows.length ? rows[0].status : null });
  } catch (e) {
    console.error('orderStatus xatosi:', e.message);
    fail(res, 'server error', 500);
  }
}

module.exports = {
  handleCreateOrder, handleCreateWebOrder, handleGetOrders, handleOrderNotify, handleOrderStatus,
  decrementStock, restoreStock,
};
