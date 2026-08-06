const crypto = require('crypto');
const assert = require('assert');
const http = require('http');
const { verifyInitData } = require('./lib/telegram-auth');
const { readRoutes } = require('./lib/routes-list');

// ============ TESTLAR ============
// Ishga tushirish: npm test
//
// MUHIM: verifyInitData shu yerda qayta yozilmagan — lib/telegram-auth.js dan
// import qilinadi, xuddi server.js import qilgani kabi. Shunday qilib testlar
// production kodning bir xil nusxasini tekshiradi, alohida yozilgan
// "o'xshash" versiyani emas.

const BOT_TOKEN = 'test-bot-token-12345';

// ============ TEST 1: Oldindan to'lov (prepay) hisobi ============
// Buyurtma summasi 1 000 000 so'm, PREPAY_RATE = 0.5 (50%)
// Kutiladi: prepay = 500 000, rest = 500 000
function testPrepayCalculation() {
  const PREPAY_RATE = 0.5;

  const total1 = 1_000_000;
  const prepay1 = Math.round(total1 * PREPAY_RATE);
  const rest1 = total1 - prepay1;
  assert.strictEqual(prepay1, 500_000, 'prepay 50% bo\'lishi kerak');
  assert.strictEqual(rest1, 500_000, 'rest 50% bo\'lishi kerak');

  // Toq summa — Math.round yaxlitlashi va rest hech qachon manfiy/noaniq
  // bo'lmasligini tekshiradi (rest = total - prepay formulasi bilan emas,
  // aniq kutilgan sonlar bilan)
  const total2 = 333_333;
  const prepay2 = Math.round(total2 * PREPAY_RATE);
  const rest2 = total2 - prepay2;
  assert.strictEqual(prepay2, 166_667, 'toq summada prepay to\'g\'ri yaxlitlanishi kerak');
  assert.strictEqual(rest2, 166_666, 'toq summada rest to\'g\'ri qolishi kerak');
  assert.strictEqual(prepay2 + rest2, total2, 'prepay + rest jami summaga teng bo\'lishi kerak');

  console.log('✅ Test 1: Prepay hisobi — PASS (500k/500k va toq summa 333333)');
}

// ============ TEST 2: Komissiya hisobi ============
// Buyurtma summasi 1 000 000 so'm, COMMISSION_RATE = 0.12 (12%)
// Kutiladi: commission = 120 000, payout = 880 000
function testCommissionCalculation() {
  const COMMISSION_RATE = 0.12;
  const total = 1_000_000;

  const commissionAmount = Math.round(total * COMMISSION_RATE);
  const payoutAmount = total - commissionAmount;

  assert.strictEqual(commissionAmount, 120_000, 'komissiya 12% bo\'lishi kerak');
  assert.strictEqual(payoutAmount, 880_000, 'sotuvchiga o\'tkaziladigan summa 88% bo\'lishi kerak');
  assert.strictEqual(commissionAmount + payoutAmount, total, 'komissiya + payout jami summa bo\'lishi kerak');

  console.log('✅ Test 2: Komissiya hisobi — PASS (commission=120k, payout=880k)');
}

// ============ TEST 2b: Logistika taxminiy narxi config'dan keladi ============
// DELIVERY_FEE_ESTIMATE — COMMISSION_RATE bilan bir xil naqsh: son, manfiy
// emas, mahsulot summasidan MUSTAQIL (total'ga bog'liq emas — qat'iy qiymat).
function testDeliveryFeeConfig() {
  const { DELIVERY_FEE_ESTIMATE } = require('./config');
  assert.strictEqual(typeof DELIVERY_FEE_ESTIMATE, 'number', 'DELIVERY_FEE_ESTIMATE son bo\'lishi kerak');
  assert.ok(Number.isFinite(DELIVERY_FEE_ESTIMATE) && DELIVERY_FEE_ESTIMATE >= 0, 'DELIVERY_FEE_ESTIMATE manfiy/NaN bo\'lmasligi kerak');
  console.log(`✅ Test 2b: DELIVERY_FEE_ESTIMATE config — PASS (${DELIVERY_FEE_ESTIMATE})`);
}

// ============ TEST 3: Telegram initData imzosi ============
// Telegram imzo algoritmi:
// 1. Barcha kalit=qiymatlarni alifbo tartibida \n bilan birlashtiramiz (hash'siz)
// 2. Bot tokendan secretKey yaratamiz: HMAC-SHA256(BOT_TOKEN, "WebAppData")
// 3. secretKey orqali dataCheckString'ni HMAC-SHA256 qilamiz → hash
// 4. Imzo taqqoslanadi (timingSafeEqual)

function testVerifyInitData() {
  const user = { id: 123456789, first_name: 'Test', last_name: 'User' };
  const userJson = JSON.stringify(user);
  const now = Math.floor(Date.now() / 1000);

  // Alifbo tartibida: auth_date, user
  const pairs = [`auth_date=${now}`, `user=${userJson}`];
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const initData = `auth_date=${now}&hash=${hash}&user=${encodeURIComponent(userJson)}`;
  const verified = verifyInitData(initData, BOT_TOKEN, 86400); // 24 soat

  assert.notStrictEqual(verified, null, 'to\'g\'ri initData qabul qilinishi kerak');
  assert.strictEqual(verified.id, 123456789, 'user ID to\'g\'ri bo\'lishi kerak');
  assert.strictEqual(verified.first_name, 'Test', 'first_name to\'g\'ri bo\'lishi kerak');

  console.log('✅ Test 3: verifyInitData (to\'g\'ri imzo) — PASS');
}

function testVerifyInitDataInvalid() {
  // Noto'g'ri imzo — rad etilishi kerak. Hash to'g'ri uzunlikda (64 hex belgi =
  // 32 bayt) lekin noto'g'ri qiymat bilan — timingSafeEqual mos kelmasligi
  // aniq sinaladi, uzunlik tekshiruvi orqali emas.
  const fakeHash = '0'.repeat(64);
  const invalidInitData = `user=${encodeURIComponent('{"id":123}')}&hash=${fakeHash}`;
  const verified = verifyInitData(invalidInitData, BOT_TOKEN);

  assert.strictEqual(verified, null, 'noto\'g\'ri imzo rad etilishi kerak');

  console.log('✅ Test 3b: verifyInitData (noto\'g\'ri imzo) — PASS');
}

function testVerifyInitDataMissingHash() {
  const initDataNoHash = 'user={"id":123}&auth_date=1234567890';
  const verified = verifyInitData(initDataNoHash, BOT_TOKEN);

  assert.strictEqual(verified, null, 'hash yo\'q bo\'lsa rad etilishi kerak');

  console.log('✅ Test 3c: verifyInitData (hash yo\'q) — PASS');
}

function testVerifyInitDataStale() {
  // auth_date 25 soat oldin — eskirgan, rad etilishi kerak
  const user = { id: 1 };
  const userJson = JSON.stringify(user);
  const old = Math.floor(Date.now() / 1000) - 25 * 3600;

  const pairs = [`auth_date=${old}`, `user=${userJson}`];
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  const initData = `auth_date=${old}&hash=${hash}&user=${encodeURIComponent(userJson)}`;

  // Imzo TO'G'RI, lekin vaqti o'tgan — faqat auth_date sababli rad etilishi kerak
  assert.strictEqual(verifyInitData(initData, BOT_TOKEN, 86400), null, 'eskirgan initData rad etilishi kerak');
  // Bir xil ma'lumot, cheksiz muddat bilan — qabul qilinadi (ya'ni imzo haqiqatan to'g'ri edi)
  assert.notStrictEqual(verifyInitData(initData, BOT_TOKEN, 0), null, 'maxAge=0 bo\'lsa imzo o\'tishi kerak');

  console.log('✅ Test 3d: verifyInitData (eskirgan auth_date) — PASS');
}

// ============ TEST 4: ROUTE JADVALI (smoke test) ============
// Har bir endpoint uchun OPTIONS so'rovi yuboriladi — router uni tanishi va
// 204 qaytarishi kerak. 404 kelsa route yo'qolgan degani.
//
// Nega OPTIONS: CORS preflight auth va bazaga tegmaydi, shuning uchun bu
// tekshiruv DB'siz va sirlarsiz ishlaydi — refaktoring paytida route
// yo'qolib qolmaganini aniq ko'rsatadi.

// Ro'yxat router'ning O'ZIDAN o'qiladi — qo'lda yozilgani eskiradi.
// Webhook alohida: u faqat POST qabul qiladi, OPTIONS shohbasi yo'q.
const WEBHOOK = '/api/telegram-webhook';
const ROUTES = readRoutes().filter((p) => p !== WEBHOOK);

function request(port, method, path, payload, extraHeaders) {
  return new Promise((resolve, reject) => {
    const headers = { ...(extraHeaders || {}) };
    if (payload !== undefined) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = http.request({ host: '127.0.0.1', port, method, path, headers }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (payload !== undefined) req.write(payload);
    req.end();
  });
}

async function testRouteTable() {
  // Server modulini yuklashdan OLDIN soxta sirlar — aks holda process.exit(1)
  process.env.BOT_TOKEN = BOT_TOKEN;
  process.env.ADMIN_CHAT_ID = '1';
  process.env.DATABASE_URL = 'postgres://test:test@127.0.0.1:1/test';

  // require.main !== module bo'lgani uchun server.js port tinglamaydi —
  // faqat handleRequest'ni beradi
  const { handleRequest } = require('./server.js');
  const srv = http.createServer(handleRequest);
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;

  try {
    for (const path of ROUTES) {
      const res = await request(port, 'OPTIONS', path);
      assert.strictEqual(res.status, 204, `${path} — OPTIONS 204 qaytarishi kerak (kelgan: ${res.status})`);
      assert.strictEqual(
        res.headers['access-control-allow-credentials'], 'true',
        `${path} — CORS credentials sarlavhasi bo'lishi kerak`
      );
    }
    console.log(`✅ Test 4: Route jadvali — PASS (${ROUTES.length} ta endpoint javob berdi)`);

    // Nazorat: mavjud bo'lmagan yo'l 404 qaytarishi SHART. Bu tekshiruvsiz
    // yuqoridagi test "hamma narsa 204" degan buzuq routerda ham yashil bo'lardi.
    const missing = await request(port, 'OPTIONS', '/api/yoq-bunday-narsa');
    assert.strictEqual(missing.status, 404, 'noma\'lum yo\'l 404 qaytarishi kerak');
    console.log('✅ Test 4b: Noma\'lum yo\'l 404 — PASS');

    // Webhook faqat POST qabul qiladi (OPTIONS shohbasi yo'q)
    const wh = await request(port, 'POST', '/api/telegram-webhook');
    assert.notStrictEqual(wh.status, 404, 'webhook route mavjud bo\'lishi kerak');
    console.log('✅ Test 4c: Webhook route mavjud — PASS');

    // GET /api/version haqiqiy javob beradi (bazaga tegmaydi)
    const ver = await request(port, 'GET', '/api/version');
    assert.strictEqual(ver.status, 200, '/api/version 200 qaytarishi kerak');
    const parsed = JSON.parse(ver.body);
    assert.strictEqual(parsed.ok, true, '/api/version { ok: true } qaytarishi kerak');
    assert.ok(parsed.data && typeof parsed.data.version === 'string', 'version satr bo\'lishi kerak');
    console.log(`✅ Test 4d: /api/version javobi — PASS (version=${parsed.data.version})`);

    await testNoBrokenReferences(port);
    await testProductPhotoSignature(port);
    await testRequestCrashIsolation(port);
  } finally {
    await new Promise((r) => srv.close(r));
  }
}

// ============ TEST 5: BUZUQ HAVOLA YO'QLIGI ============
// Har bir endpoint HAQIQATAN chaqiriladi. Baza yo'q — shuning uchun handlerlar
// xato beradi va uni console.error bilan yozadi. BIZ shu xatolarni ushlaymiz:
//
//   "X is not defined"      → modulga import qilinmagan bog'liqlik
//   "X is not a function"   → eksport qilinmagan yoki noto'g'ri nomlangan
//
// Bular refaktoringning ASOSIY xavfi: sintaksis to'g'ri, route javob beradi,
// lekin handler ichida yo'qolgan nom bor — u faqat o'sha endpoint ishlatilganda
// ko'rinadi (ya'ni production'da, foydalanuvchida). Baza xatolari (ECONNREFUSED)
// esa kutilgan va e'tiborsiz qoldiriladi.

const CALLS = [
  ['GET',   '/api/products'],
  ['POST',  '/api/products', '{}'],
  ['GET',   '/api/admin/moderation'],
  ['POST',  '/api/admin/moderation', '{}'],
  ['GET',   '/api/admin/summary'],
  ['POST',  '/api/admin/action', '{}'],
  ['GET',   '/api/admin/action?id=1'],
  ['GET',   '/api/admin/disputes'],
  ['GET',   '/api/admin/dispute-photo?f=1&s=1'],
  ['GET',   '/api/disputes'],
  ['POST',  '/api/disputes', '{}'],
  ['POST',  '/api/seller/dispute', '{}'],
  ['GET',   '/api/reviews?productId=p-x'],
  ['GET',   '/api/reviews?mine=1'],
  ['POST',  '/api/reviews', '{}'],
  ['GET',   '/api/seller/reviews'],
  ['GET',   '/api/orders'],
  ['POST',  '/api/orders', '{}'],
  ['POST',  '/api/web-orders', '{}'],
  ['GET',   '/api/me'],
  ['GET',   '/api/seller/products'],
  ['PATCH', '/api/seller/products', '{}'],
  ['PATCH', '/api/seller/products', '{"id":"p-x","action":"request_image"}'],
  ['GET',   '/api/product-photo?f=1&s=1'],
  ['GET',   '/api/seller/orders'],
  ['POST',  '/api/seller/orders', '{}'],
  ['POST',  '/api/telegram-notify', '{}'],
  ['GET',   '/api/order-status?id=1'],
  ['GET',   '/api/telegram-contact?uid=1'],
  ['POST',  '/api/auth/telegram', '{}'],
  ['POST',  '/api/auth/web/start', '{}'],
  ['GET',   '/api/auth/web/poll?code=1&verifier=1'],
  ['GET',   '/api/auth/web/me'],
  ['POST',  '/api/auth/web/logout', '{}'],
  ['GET',   '/api/web/orders'],
  ['POST',  '/api/telegram-webhook', '{"message":{"chat":{"id":1},"from":{"id":1},"text":"/start"}}'],
];

async function testNoBrokenReferences(port) {
  const logged = [];
  const realError = console.error;
  console.error = (...args) => { logged.push(args.map(String).join(' ')); };

  try {
    for (const [method, path, payload] of CALLS) {
      await request(port, method, path, payload);
    }
  } finally {
    console.error = realError;
  }

  const broken = logged.filter((l) => /is not defined|is not a function|Cannot read propert/.test(l));
  if (broken.length) {
    throw new Error(
      `Modullarda yo'qolgan bog'liqlik topildi (${broken.length} ta):\n   ` + broken.join('\n   ')
    );
  }

  console.log(`✅ Test 5: Buzuq havola yo'q — PASS (${CALLS.length} ta endpoint chaqirildi)`);
}

// ============ TEST 6: Mahsulot rasmi — imzo tekshiruvi ============
// disputes.js dagi HMAC naqshi mahsulot rasmiga ham qo'llanildi (009 migratsiya).
// Farqi: bu yerda maxfiylik emas, faqat begona Telegram faylini proksi
// qilishga majburlab bo'lmasin degan himoya tekshiriladi.
async function testProductPhotoSignature(port) {
  const { productPhotoUrl } = require('./routes/catalog.js');

  const url = productPhotoUrl('smoke-test-file-id');
  assert.strictEqual(url, productPhotoUrl('smoke-test-file-id'), 'bir xil file_id uchun imzo barqaror bo\'lishi kerak');
  assert.notStrictEqual(url, productPhotoUrl('boshqa-file-id'), 'boshqa file_id uchun imzo boshqacha bo\'lishi kerak');
  assert.strictEqual(productPhotoUrl(null), null, 'file_id yo\'q bo\'lsa null qaytishi kerak');

  const validRes = await request(port, 'GET', url);
  assert.notStrictEqual(validRes.status, 401, 'to\'g\'ri imzoli havola 401 qaytarmasligi kerak');

  const badRes = await request(port, 'GET', '/api/product-photo?f=smoke-test-file-id&s=' + '0'.repeat(32));
  assert.strictEqual(badRes.status, 401, 'noto\'g\'ri imzo 401 qaytarishi kerak');

  const emptyRes = await request(port, 'GET', '/api/product-photo');
  assert.strictEqual(emptyRes.status, 401, 'parametrsiz so\'rov 401 qaytarishi kerak');

  console.log('✅ Test 6: Mahsulot rasmi imzosi — PASS');
}

// ============ TEST 7: Rulon zaxirasi (decrementStock) ============
// Lokal Postgres yo'q, shuning uchun soxta klient ishlatiladi. U HAQIQIY
// SQL'ni oladi va Postgres'ning `WHERE stock >= qty` shartini taqlid qiladi —
// ya'ni test kamaytirish mantiqini emas, kamaytirish SHARTINI sinaydi.
//
// Nega bu mazmunli: zaxira bug'ining o'zagi — "avval o'qib, keyin yozish"
// naqshi. Agar kimdir kelajakda uni SELECT + UPDATE ga bo'lib yuborsa,
// quyidagi "atomik shart" tekshiruvi qulaydi.
function fakeStockClient(stockById) {
  const queries = [];
  return {
    queries,
    async query(sql, params) {
      queries.push({ sql, params });
      if (/UPDATE products SET stock = stock - /.test(sql)) {
        const [id, qty] = params;
        const cur = stockById[id];
        if (cur === null) return { rows: [{ stock: null }] };   // cheksiz
        if (cur >= qty) {
          stockById[id] = cur - qty;
          return { rows: [{ stock: stockById[id] }] };
        }
        return { rows: [] };                                     // shart bajarilmadi
      }
      if (/SELECT stock, name_uz, unit FROM products/.test(sql)) {
        const id = params[0];
        return { rows: [{ stock: stockById[id], name_uz: 'Test mato', unit: 'rulon' }] };
      }
      return { rows: [] };
    },
  };
}

async function testDecrementStock() {
  const { decrementStock } = require('./routes/orders.js');

  // 1) Yetarli zaxira — kamayadi
  const a = { 'p-1': 10 };
  const ca = fakeStockClient(a);
  await decrementStock(ca, [{ id: 'p-1', qty: 3 }]);
  assert.strictEqual(a['p-1'], 7, 'zaxira buyurtma miqdoricha kamayishi kerak');

  // Kamaytirish ATOMIK bo'lishi shart: shart UPDATE'ning WHERE'ida bo'lsin,
  // alohida SELECT bilan emas (aks holda race condition qaytadi).
  const upd = ca.queries.find((q) => /UPDATE products SET stock/.test(q.sql));
  assert.ok(/WHERE[\s\S]*stock IS NULL OR stock >= \$2/.test(upd.sql),
    'kamaytirish sharti UPDATE ning WHERE qismida bo\'lishi kerak (atomik)');

  // 2) NULL = cheksiz — hech qachon tugamaydi
  const b = { 'p-made': null };
  await decrementStock(fakeStockClient(b), [{ id: 'p-made', qty: 9999 }]);
  assert.strictEqual(b['p-made'], null, 'NULL zaxira (made) o\'zgarmasligi kerak');

  // 3) Yetmaydi — buyurtma rad etiladi va xato foydalanuvchiga ko'rsatiladi
  const c = { 'p-2': 2 };
  await assert.rejects(
    () => decrementStock(fakeStockClient(c), [{ id: 'p-2', qty: 5 }]),
    (e) => e.userFacing === true && /faqat 2 rulon qoldi/.test(e.message),
    'zaxira yetmasa ClientError va qolgan son bilan xato berilishi kerak'
  );
  assert.strictEqual(c['p-2'], 2, 'rad etilgan urinish zaxiraga tegmasligi kerak');

  // 4) Zaxira 0 — boshqacha xabar
  await assert.rejects(
    () => decrementStock(fakeStockClient({ 'p-3': 0 }), [{ id: 'p-3', qty: 1 }]),
    (e) => /tugadi/.test(e.message),
    'zaxira 0 bo\'lsa "tugadi" deyilishi kerak'
  );

  // 5) Deadlock himoyasi: qatorlar HAR DOIM id bo'yicha bir tartibda
  // qulflanadi. Ikki buyurtma teskari tartibda kelsa ham SQL ketma-ketligi
  // bir xil bo'lishi kerak.
  const d = { 'p-a': 5, 'p-b': 5 };
  const cd = fakeStockClient(d);
  await decrementStock(cd, [{ id: 'p-b', qty: 1 }, { id: 'p-a', qty: 1 }]);
  const order = cd.queries
    .filter((q) => /UPDATE products SET stock/.test(q.sql))
    .map((q) => q.params[0]);
  assert.deepStrictEqual(order, ['p-a', 'p-b'],
    'mahsulotlar id bo\'yicha tartiblangan holda qulflanishi kerak (deadlock oldini olish)');

  console.log('✅ Test 7: Rulon zaxirasi (atomik kamaytirish) — PASS');
}

// ============ TEST 8: Reyting hosila ustuni (recalcRating) ============
// `products.rating` / `products.reviews` — HOSILA ustunlar, yagona yozuvchisi
// recalcRating(). Xavf shundaki, kimdir kelajakda uni "tezroq" qilaman deb
// `reviews = reviews + 1` ko'rinishidagi qo'lda oshirishga aylantirishi
// mumkin — o'shanda sharh yashirilganda son kamaymay qoladi va reyting
// abadiy yolg'on bo'lib qoladi. Test aynan shu farqni ushlaydi: qiymat
// HAR DOIM `reviews` jadvali ustidan agregatdan kelishi kerak.
function fakeRatingClient() {
  const queries = [];
  return { queries, async query(sql, params) { queries.push({ sql, params }); return { rows: [] }; } };
}

async function testRecalcRating() {
  const { recalcRating } = require('./routes/reviews.js');

  const c = fakeRatingClient();
  await recalcRating(c, 'p-1', 7);

  const prod = c.queries.find((q) => /UPDATE products/.test(q.sql));
  assert.ok(prod, 'mahsulot reytingi yangilanishi kerak');
  assert.ok(/avg\(stars\)/.test(prod.sql) && /count\(\*\)/.test(prod.sql),
    'reyting va sharhlar soni agregatdan kelishi kerak (qo\'lda oshirish emas)');
  assert.ok(/status = 'published'/.test(prod.sql),
    'yashirilgan sharhlar reytingga kirmasligi kerak');
  assert.ok(!/reviews\s*=\s*reviews\s*[+-]/.test(prod.sql),
    'sonni qo\'lda oshirish/kamaytirish taqiqlanadi — yashirishda son buzilib qoladi');

  const sel = c.queries.find((q) => /UPDATE sellers/.test(q.sql));
  assert.ok(sel && /avg\(stars\)/.test(sel.sql), 'sotuvchi reytingi ham agregatdan hisoblanishi kerak');
  assert.strictEqual(sel.params[0], 7, 'sotuvchi reytingi to\'g\'ri sellerId uchun hisoblanishi kerak');

  // Sotuvchisi yo'q mahsulot (seller_id NULL) — sotuvchi so'rovi umuman
  // yuborilmasin, aks holda `WHERE s.id = NULL` bo'sh yugurish bo'lardi
  const c2 = fakeRatingClient();
  await recalcRating(c2, 'p-2', null);
  assert.ok(!c2.queries.some((q) => /UPDATE sellers/.test(q.sql)),
    'sotuvchisi yo\'q mahsulotda sellers so\'rovi yuborilmasligi kerak');

  console.log('✅ Test 8: Reyting hosila ustuni (recalcRating) — PASS');
}

// ============ TEST 8b: Sharh qachon yozilishi mumkin ============
// Yo'lda ketayotgan matoga baho qo'yib bo'lmaydi — xaridor uni hali ko'rmagan.
// Bahsdan (`shipped` dan boshlanadi) ATAYLAB farq qiladi.
function testReviewAllowedStatus() {
  const { REVIEW_ALLOWED_ORDER_STATUS } = require('./routes/reviews.js');
  assert.ok(REVIEW_ALLOWED_ORDER_STATUS.includes('delivered'), 'yetkazilgan buyurtmaga sharh mumkin');
  assert.ok(REVIEW_ALLOWED_ORDER_STATUS.includes('completed'), 'yakunlangan buyurtmaga sharh mumkin');
  for (const st of ['pending', 'confirmed', 'shipped', 'cancelled', 'refunded']) {
    assert.ok(!REVIEW_ALLOWED_ORDER_STATUS.includes(st), `${st} holatida sharh yozib bo'lmasligi kerak`);
  }
  console.log('✅ Test 8b: Sharh faqat yetkazilgandan keyin — PASS');
}

// ============ TEST 8c: Sharh kirishini tekshirish (yulduz chegarasi) ============
// Nega unit test, jonli `curl` emas: `/api/reviews` da autentifikatsiya
// validatsiyadan OLDIN ishlaydi, ya'ni kirmagan so'rov yulduz qiymatiga
// yetib bormasdan 401 oladi — chegarani HTTP orqali sinab bo'lmaydi.
// Klient faqat 1–5 beradi, lekin bu himoya EMAS: DevTools bilan istalgan
// qiymat yuborish mumkin, shuning uchun chegara serverda turadi.
function testReviewSchema() {
  const { validate } = require('./lib/validate');
  const { REVIEW_SCHEMA } = require('./routes/reviews.js');

  const ok = validate({ orderId: '#LM-3011', productId: 'ik-1402', stars: 4 }, REVIEW_SCHEMA);
  assert.strictEqual(ok.ok, true, "to'g'ri sharh qabul qilinishi kerak");
  assert.strictEqual(ok.data.stars, 4, 'yulduz soni saqlanishi kerak');
  assert.strictEqual(ok.data.body, null, 'matn ixtiyoriy — bo\'sh bo\'lsa null');

  for (const bad of [0, 6, -1, 100]) {
    const r = validate({ orderId: '#LM-3011', productId: 'ik-1402', stars: bad }, REVIEW_SCHEMA);
    assert.strictEqual(r.ok, false, `stars=${bad} rad etilishi kerak`);
  }
  // Satr sifatida kelgan raqam ham chegaraga bo'ysunadi (JSON'da "6" bo'lishi mumkin)
  assert.strictEqual(validate({ orderId: 'a', productId: 'b', stars: '6' }, REVIEW_SCHEMA).ok, false,
    'satr shaklidagi 6 ham rad etilishi kerak');
  assert.strictEqual(validate({ orderId: 'a', productId: 'b', stars: '3' }, REVIEW_SCHEMA).ok, true,
    'satr shaklidagi 3 qabul qilinishi kerak');

  // Majburiy maydonlar
  assert.strictEqual(validate({ productId: 'b', stars: 3 }, REVIEW_SCHEMA).ok, false, 'orderId majburiy');
  assert.strictEqual(validate({ orderId: 'a', stars: 3 }, REVIEW_SCHEMA).ok, false, 'productId majburiy');
  assert.strictEqual(validate({ orderId: 'a', productId: 'b' }, REVIEW_SCHEMA).ok, false, 'stars majburiy');

  // Juda uzun matn kesilmaydi — RAD ETILADI (jimgina qirqish ma'lumotni yo'qotardi)
  assert.strictEqual(validate({ orderId: 'a', productId: 'b', stars: 3, body: 'x'.repeat(1001) }, REVIEW_SCHEMA).ok,
    false, '1000 belgidan uzun matn rad etilishi kerak');

  console.log('✅ Test 8c: Sharh kirishi (yulduz chegarasi va majburiy maydonlar) — PASS');
}

// ---- Haqiqiy imzoli initData yasash (auth qorovulidan o'tish uchun) ----
function signedInitData(user) {
  const userJson = JSON.stringify(user);
  const now = Math.floor(Date.now() / 1000);
  const dataCheckString = [`auth_date=${now}`, `user=${userJson}`].sort().join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  return `auth_date=${now}&hash=${hash}&user=${encodeURIComponent(userJson)}`;
}

// ============ TEST 9: Qulagan so'rov serverni o'ldirmasligi ============
// To'qqizta handler `try` blokiga KIRISHDAN OLDIN `await` qiladi (auth
// tekshiruvi bazaga boradi). Baza javob bermasa, o'sha rad etilgan promise'ni
// hech kim ushlamaydi va Node BUTUN JARAYONNI o'ldiradi — bitta so'rovdagi
// uzilish o'sha paytdagi barcha so'rovlarni yiqitardi.
//
// Nega bu test haqiqiy: DATABASE_URL o'lik portga qaratilgan (127.0.0.1:1),
// imzo esa HAQIQIY — ya'ni so'rov 401 da to'xtamay, aynan `await pool.query`
// gacha yetib boradi va u yerda qulaydi. O'ram bo'lmasa test jarayoni
// `unhandledRejection` bilan o'lib, suite qizil bo'ladi.
async function testRequestCrashIsolation(port) {
  const initData = signedInitData({ id: 424242, first_name: 'Crash' });

  const res = await request(port, 'GET', '/api/seller/reviews', undefined, {
    'X-Telegram-Init-Data': initData,
  });
  assert.strictEqual(res.status, 500, 'baza qulaganda so\'rov 500 olishi kerak (jarayon o\'lmasin)');
  assert.strictEqual(JSON.parse(res.body).ok, false, 'javob { ok:false } shaklida bo\'lishi kerak');

  // Eng muhimi: server SHUNDAN KEYIN ham javob berayotgan bo'lsin
  const alive = await request(port, 'GET', '/api/version');
  assert.strictEqual(alive.status, 200, 'qulagan so\'rovdan keyin server ishlashda davom etishi kerak');

  console.log('✅ Test 9: Qulagan so\'rov izolyatsiyasi — PASS (500 qaytdi, server tirik)');
}

// ============ TEST 10: Xato alerti — bosish (throttle) ============
// Alert ikki qatlamli tomga ega. Birinchisi bir xil xatoni takrorlamaydi,
// ikkinchisi (soatlik tom) baza qulagan holat uchun: o'shanda HAR BIR so'rov
// boshqacha matnli xato beradi va birinchi filtr ularni bir guruh deb ko'rmaydi.
// Tomsiz bitta nosozlik Telegram'ni minglab xabar bilan to'ldirardi.
function testAlertThrottle() {
  const alert = require('./lib/alert');

  alert._reset();
  const t0 = 1_000_000;

  assert.deepStrictEqual(alert.shouldSend('createOrder xatosi:', t0), { send: true, suppressed: 0 },
    'birinchi xato darrov yuborilishi kerak');
  assert.strictEqual(alert.shouldSend('createOrder xatosi:', t0 + 1_000).send, false,
    'oyna ichidagi takror yuborilmasligi kerak');
  assert.strictEqual(alert.shouldSend('createOrder xatosi:', t0 + 2_000).suppressed, 2,
    'bosilgan xatolar SANALISHI kerak — yo\'qolib ketmasin');

  // Boshqa kalit mustaqil: bitta shovqinli xato boshqasini ko'mib qo'ymaydi
  assert.strictEqual(alert.shouldSend('getOrders xatosi:', t0 + 2_000).send, true,
    'boshqa xato turi alohida hisoblanishi kerak');

  // Oyna o'tgach — yana yuboriladi va bosilganlar soni xabarda boradi
  const after = alert.shouldSend('createOrder xatosi:', t0 + alert.WINDOW_MS + 1);
  assert.strictEqual(after.send, true, 'oyna tugagach qayta yuborilishi kerak');
  assert.strictEqual(after.suppressed, 2, 'xabarda bosilgan takrorlar soni ko\'rsatilishi kerak');
  assert.strictEqual(alert.shouldSend('createOrder xatosi:', t0 + alert.WINDOW_MS + 2).suppressed, 1,
    'yuborilgandan keyin hisoblagich nolga tushishi kerak');

  // ---- Soatlik tom ----
  alert._reset();
  for (let i = 0; i < alert.MAX_PER_HOUR; i++) {
    assert.strictEqual(alert.shouldSend(`xato-${i}`, t0).send, true, `${i}-alert tom ichida bo'lishi kerak`);
  }
  assert.strictEqual(alert.shouldSend('xato-oshib-ketdi', t0).send, false,
    'soatlik tomdan oshgan alert yuborilmasligi kerak');
  // Soat o'tgach tom bo'shaydi
  assert.strictEqual(alert.shouldSend('xato-oshib-ketdi', t0 + 60 * 60_000 + 1).send, true,
    'soat o\'tgach tom bo\'shashi kerak');

  alert._reset();
  console.log('✅ Test 10: Xato alerti — bosish tomlari PASS');
}

// ============ TEST 10b: Alert matni — HTML qochirish ============
// Alert `parse_mode: 'HTML'` bilan ketadi va xato tafsilotida FOYDALANUVCHI
// matni bo'lishi mumkin (buyurtma izohi, manzil — ular xato xabariga tushadi).
// Qochirilmasa Telegram xabarni rad etadi va aynan eng kerakli paytda alert
// yetib bormaydi. Bu CLAUDE.md dagi esc() qoidasining server tarafdagi ko'rinishi.
function testAlertTextEscaping() {
  const alert = require('./lib/alert');

  const text = alert.alertText('createOrder xatosi:', '<b onclick="x">mato</b> & 5 < 7', 0);
  assert.ok(!/<b onclick/.test(text), 'foydalanuvchi HTML\'i xom holda qolmasligi kerak');
  assert.ok(text.includes('&lt;b onclick'), 'burchakli qavs qochirilishi kerak');
  assert.ok(text.includes('&amp;'), 'ampersand qochirilishi kerak');

  // Bosilgan takrorlar soni matnda ko'rinsin (aks holda "yana necha marta" yo'qoladi)
  assert.ok(alert.alertText('x:', 'y', 4).includes('4 marta'), 'takrorlar soni matnda bo\'lishi kerak');
  assert.ok(!alert.alertText('x:', 'y', 0).includes('marta'), 'takror yo\'q bo\'lsa qator qo\'shilmasin');

  // Birinchi argument — guruhlash kaliti, qolgani tafsilot
  const parsed = alert.argsToKeyAndDetail(['getOrders xatosi:', new Error('ECONNREFUSED')]);
  assert.strictEqual(parsed.key, 'getOrders xatosi:', 'kalit birinchi argumentdan olinishi kerak');
  assert.ok(/ECONNREFUSED/.test(parsed.detail), 'Error tafsiloti saqlanishi kerak');

  console.log('✅ Test 10b: Alert matni (HTML qochirish) — PASS');
}

// ============ TEST 11: Sharh yashirilganda reyting qayta hisoblanadi ============
// Test 8 `recalcRating` ning O'ZINI sinaydi, lekin uni `hideReview` HAQIQATAN
// chaqirishini hech kim tekshirmasdi — chaqiruv olib tashlansa testlar yashil
// qolardi va yashirilgan sharh reytingda abadiy qolib ketardi.
//
// Tranzaksiya TARTIBI ham tekshiriladi: qayta hisoblash COMMIT'dan OLDIN
// bo'lishi shart. Keyin bo'lsa, hisoblash qulaganda sharh yashirilgan, reyting
// esa eski holida qolardi — ya'ni baza o'zi bilan ziddiyatga tushardi.
function fakeHideClient(updateRows) {
  const queries = [];
  return {
    queries,
    released: false,
    async query(sql, params) {
      queries.push({ sql, params });
      if (/UPDATE reviews/.test(sql)) return { rows: updateRows };
      return { rows: [] };
    },
    release() { this.released = true; },
  };
}

async function testHideReviewRecalculates() {
  const { hideReview } = require('./routes/reviews.js');
  const { pool } = require('./db');
  const realConnect = pool.connect;

  try {
    // ---- Muvaffaqiyatli yashirish ----
    const c = fakeHideClient([{ id: 5, product_id: 'ik-1402', seller_id: 7 }]);
    pool.connect = async () => c;
    const out = await hideReview(5, 'haqoratli matn');
    assert.strictEqual(out.product_id, 'ik-1402', 'yashirilgan sharh mahsuloti qaytishi kerak');

    const sqls = c.queries.map((q) => q.sql);
    const iUpdate = sqls.findIndex((s) => /UPDATE reviews/.test(s));
    const iRecalc = sqls.findIndex((s) => /UPDATE products/.test(s) && /avg\(stars\)/.test(s));
    const iCommit = sqls.findIndex((s) => /COMMIT/.test(s));

    assert.ok(iUpdate !== -1, 'sharh holati yangilanishi kerak');
    assert.ok(/status\s*=\s*'published'/.test(sqls[iUpdate]),
      'faqat chop etilgan sharh yashirilsin — ikki marta yashirish sonni buzardi');
    assert.ok(iRecalc !== -1, 'sharh yashirilganda reyting QAYTA HISOBLANISHI kerak');
    assert.ok(iRecalc > iUpdate, 'qayta hisoblash yashirishdan keyin bo\'lishi kerak');
    assert.ok(iCommit !== -1 && iRecalc < iCommit,
      'qayta hisoblash COMMIT dan OLDIN, ya\'ni bir xil tranzaksiyada bo\'lishi kerak');
    assert.ok(c.released, 'ulanish poolga qaytarilishi kerak');

    // Sotuvchi reytingi ham yangilanadi
    assert.ok(sqls.some((s) => /UPDATE sellers/.test(s)), 'sotuvchi reytingi ham yangilanishi kerak');

    // ---- Holati o'zgargan sharh: hech narsa qayta hisoblanmaydi ----
    const c2 = fakeHideClient([]);
    pool.connect = async () => c2;
    await assert.rejects(() => hideReview(5, null), /holati o'zgargan/,
      'allaqachon yashirilgan sharhda xato qaytishi kerak');
    const sqls2 = c2.queries.map((q) => q.sql);
    assert.ok(!sqls2.some((s) => /UPDATE products/.test(s)),
      'sharh yashirilmagan bo\'lsa reyting ham tegilmasligi kerak');
    assert.ok(sqls2.some((s) => /ROLLBACK/.test(s)), 'tranzaksiya orqaga qaytarilishi kerak');
    assert.ok(c2.released, 'xato bo\'lganda ham ulanish qaytarilishi kerak');
  } finally {
    pool.connect = realConnect;
  }

  console.log('✅ Test 11: Sharh yashirilganda reyting qayta hisoblanadi — PASS');
}

// ============ TEST 12: Buyurtma tarixi — yozuvchi funksiya ============
// `recordStatusChange` tarixning YAGONA yozuvchisi. Uning ikkita himoyasi
// muhim: (1) tranzaksiya klientini talab qiladi — `pool` uzatilsa yozuv
// tranzaksiyadan tashqarida ketib, atomiklik jimgina yo'qolardi;
// (2) noma'lum `actorKind` ni RAD ETADI — u jimgina o'tsa "kim qildi"
// degan savolga tarix yolg'on javob berardi.
function fakeHistoryClient() {
  const queries = [];
  return {
    queries,
    async query(sql, params) { queries.push({ sql, params }); return { rows: [] }; },
    release() {},
  };
}

async function testRecordStatusChange() {
  const { recordStatusChange, ACTOR_KINDS } = require('./lib/order-history');

  const c = fakeHistoryClient();
  await recordStatusChange(c, {
    orderId: '#LM-3001', from: 'confirmed', to: 'shipped',
    actorKind: 'seller', actorTg: 1378240226, note: 'BTS trek: AB123',
  });
  assert.strictEqual(c.queries.length, 1, 'bitta INSERT yuborilishi kerak');
  const q = c.queries[0];
  assert.ok(/INSERT INTO order_status_history/.test(q.sql), 'tarix jadvaliga yozilishi kerak');
  assert.deepStrictEqual(
    q.params,
    ['#LM-3001', 'confirmed', 'shipped', 'seller', '1378240226', 'BTS trek: AB123'],
    'parametrlar tartibi va qiymatlari to\'g\'ri bo\'lishi kerak');

  // Yaratilish: from NULL bo'ladi, actorTg yo'q bo'lsa ham NULL
  const c2 = fakeHistoryClient();
  await recordStatusChange(c2, { orderId: '#LM-1', from: null, to: 'pending', actorKind: 'buyer' });
  assert.strictEqual(c2.queries[0].params[1], null, 'yangi buyurtmada from NULL bo\'lishi kerak');
  assert.strictEqual(c2.queries[0].params[4], null, 'actorTg berilmasa NULL bo\'lishi kerak');
  // Bo'sh satr ham NULL — aks holda Postgres bigint xatosi berardi
  const c3 = fakeHistoryClient();
  await recordStatusChange(c3, { orderId: '#LM-1', to: 'pending', actorKind: 'buyer', actorTg: '' });
  assert.strictEqual(c3.queries[0].params[4], null, 'bo\'sh actorTg NULL ga aylanishi kerak');

  // ---- pool uzatilsa RAD ETILISHI kerak ----
  // pool'da `query` bor, lekin `release` yo'q — modul aynan shu farqqa tayanadi
  const poolLike = { query: async () => ({ rows: [] }) };
  await assert.rejects(
    () => recordStatusChange(poolLike, { orderId: '#LM-1', to: 'pending', actorKind: 'buyer' }),
    /tranzaksiya klienti kerak/,
    'pool uzatilsa xato berilishi kerak — aks holda yozuv tranzaksiyadan tashqarida ketardi');

  // ---- Noma'lum actorKind ----
  await assert.rejects(
    () => recordStatusChange(fakeHistoryClient(), { orderId: '#LM-1', to: 'pending', actorKind: 'kimdir' }),
    /noma'lum actorKind/,
    'ro\'yxatda yo\'q actorKind rad etilishi kerak');
  for (const kind of ACTOR_KINDS) {
    await recordStatusChange(fakeHistoryClient(), { orderId: '#LM-1', to: 'pending', actorKind: kind });
  }

  // ---- Majburiy maydonlar ----
  await assert.rejects(() => recordStatusChange(fakeHistoryClient(), { to: 'pending', actorKind: 'buyer' }),
    /orderId kerak/, 'orderId majburiy');
  await assert.rejects(() => recordStatusChange(fakeHistoryClient(), { orderId: '#LM-1', actorKind: 'buyer' }),
    /to \(yangi holat\) kerak/, 'to majburiy');

  console.log('✅ Test 12: Buyurtma tarixi yozuvchisi (recordStatusChange) — PASS');
}

// ============ TEST 12b: HAR BIR holat yozuvi tarixga tushadimi ============
// Bu B4 ning eng muhim testi. Xavf funksiyada emas — QAMROVDA: kimdir
// kelajakda yangi `UPDATE orders SET status` qo'shsa-yu tarix yozuvini
// unutsa, hech narsa buzilmaydi, testlar yashil qoladi va tarixda JIMGINA
// teshik paydo bo'ladi. Uni faqat bahs chiqqanda, ya'ni eng kerakli paytda
// sezardik.
//
// Shuning uchun test manba KODINI skanerlaydi: har bir faylda holat
// yozuvlari soni tarix chaqiruvlari sonidan OSHMASLIGI kerak. Ro'yxat
// ataylab aniq sanaladi — yangi yozuv nuqtasi qo'shilsa test "kutilgan son
// o'zgardi" deb qizil bo'ladi va odam ongli qaror qabul qilishga majbur.
const ORDER_STATUS_WRITE = /UPDATE\s+orders\s+(?:o\s+)?SET\s+status\s*=/g;
const HISTORY_CALL = /recordStatusChange\s*\(/g;

// Kutilgan inventar (2026-08-03). {status yozuvi, tarix chaqiruvi}
const HISTORY_INVENTORY = {
  'orders.js':  { writes: 0, records: 2 },  // ikkalasi INSERT (yaratish), UPDATE emas
  'seller.js':  { writes: 1, records: 1 },  // accept / reject / ship
  'webhook.js': { writes: 1, records: 1 },  // bot: /tasdiqla /yolga /yetdi
  'admin.js':   { writes: 3, records: 3 },  // payout, refund, dispute qarori
};

function testEveryStatusWriteIsRecorded() {
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, 'routes');

  let totalWrites = 0;
  let totalRecords = 0;
  const seen = {};

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(dir, file), 'utf8');
    const writes = (src.match(ORDER_STATUS_WRITE) || []).length;
    const records = (src.match(HISTORY_CALL) || []).length;
    if (writes === 0 && records === 0) continue;
    seen[file] = { writes, records };
    totalWrites += writes;
    totalRecords += records;

    assert.ok(records >= writes,
      `${file}: ${writes} ta holat yozuvi bor, lekin ${records} ta tarix chaqiruvi — ` +
      `har bir "UPDATE orders SET status" recordStatusChange bilan birga bo'lishi SHART`);
  }

  assert.deepStrictEqual(seen, HISTORY_INVENTORY,
    'Buyurtma holati yozuvlari inventari o\'zgardi. Yangi yozuv nuqtasi qo\'shgan ' +
    'bo\'lsangiz — tarix chaqiruvini ham qo\'shing va HISTORY_INVENTORY ni yangilang.\n' +
    '   Topilgan: ' + JSON.stringify(seen));

  // Tarix yozuvchisi FAQAT bitta modulda yashaydi — nusxa ko'chirilmasin
  const lib = fs.readFileSync(path.join(__dirname, 'lib', 'order-history.js'), 'utf8');
  assert.ok(/INSERT INTO order_status_history/.test(lib),
    'tarix INSERT\'i lib/order-history.js da bo\'lishi kerak');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(dir, file), 'utf8');
    assert.ok(!/INSERT INTO order_status_history/.test(src),
      `${file}: tarixga TO'G'RIDAN-TO'G'RI yozilmasin — recordStatusChange() ishlatilsin`);
  }

  console.log(`✅ Test 12b: Har bir holat yozuvi tarixga tushadi — PASS ` +
    `(${totalWrites} ta yozuv, ${totalRecords} ta tarix chaqiruvi)`);
}

// ============ TEST 12c: Atomik qorovul CTE dan keyin ham saqlanganmi ============
// `seller.js` dagi UPDATE tarix uchun CTE ga o'tkazildi (oldingi holatni olish
// kerak edi). Xavf: kimdir uni "soddalashtirib" `FOR UPDATE` yoki
// `prev.status = ANY(...)` shartini yo'qotishi mumkin — o'shanda ikki marta
// bosilgan "rad etish" zaxirani IKKI MARTA qaytarardi (2026-07-30 da aynan shu
// sabab atomik shart qo'yilgan edi).
function testStatusGuardsSurviveCte() {
  const fs = require('fs');
  const path = require('path');

  const seller = fs.readFileSync(path.join(__dirname, 'routes', 'seller.js'), 'utf8');
  assert.ok(/FOR UPDATE/.test(seller), 'seller.js: qator qulflanishi kerak (FOR UPDATE)');
  assert.ok(/prev\.status\s*=\s*ANY\(/.test(seller),
    'seller.js: holat qorovuli saqlanishi kerak — ikki marta bosilsa zaxira ikki marta qaytmasin');

  const admin = fs.readFileSync(path.join(__dirname, 'routes', 'admin.js'), 'utf8');
  assert.ok(/prev\.status\s*<>\s*'refunded'/.test(admin),
    'admin.js: ikki marta qaytarish qorovuli saqlanishi kerak');
  assert.ok(/status='delivered'/.test(admin),
    'admin.js: pul o\'tkazish faqat "yetkazildi" holatida bo\'lishi kerak');

  console.log('✅ Test 12c: Atomik qorovullar CTE dan keyin ham joyida — PASS');
}

// ============ TEST 2c: Yaroqsiz chat_id JIMGINA qabul qilinmaydi ============
// 2026-08-05: `.env` da `ALERT_CHAT_ID=<chat_id>` namunasi to'ldirilmay qolgandi.
// U bo'sh emas, shuning uchun eski `process.env.X || ADMIN_CHAT_ID` zaxirasi uni
// haqiqiy deb qabul qildi — alertlar mavjud bo'lmagan chatga ketdi va
// `sendAlert` xatoni yutgani uchun jurnalda ham iz qolmadi. Ya'ni xato
// monitoringi ikki kun o'lik turdi va buni hech narsa ko'rsatmadi.
// Shu sabab bu test aynan "bo'sh emas, lekin yaroqsiz" holatni qo'riqlaydi.
function testChatIdValidation() {
  const { chatId } = require('./config');
  const FB = '111';

  assert.strictEqual(chatId('123456789', 'X', FB), '123456789', 'butun son o\'zgarmasin');
  assert.strictEqual(chatId('-1001234567890', 'X', FB), '-1001234567890', 'guruh id manfiy bo\'ladi');
  assert.strictEqual(chatId('  123  ', 'X', FB), '123', 'bo\'shliq kesilsin');
  assert.strictEqual(chatId('', 'X', FB), FB, 'bo\'sh qiymat zaxiraga qaytsin');
  assert.strictEqual(chatId(undefined, 'X', FB), FB, 'berilmagan qiymat zaxiraga qaytsin');

  // Asosiy band: bo'sh EMAS, lekin yaroqsiz.
  const errs = [];
  const realError = console.error;
  console.error = (...a) => errs.push(a[0]);
  try {
    assert.strictEqual(chatId('<chat_id>', 'ALERT_CHAT_ID', FB), FB,
      'to\'ldirilmagan namuna zaxiraga qaytsin — jimgina qabul qilinmasin');
    assert.strictEqual(chatId('abc', 'ALERT_CHAT_ID', FB), FB, 'matn zaxiraga qaytsin');
  } finally {
    console.error = realError;
  }
  assert.strictEqual(errs.length, 2, 'yaroqsiz qiymat jurnalda IZ qoldirishi kerak');
  assert.ok(errs.every((k) => k === errs[0]),
    'alert guruhlash kaliti (1-argument) o\'zgarmas bo\'lishi kerak');

  console.log('✅ Test 2c: Yaroqsiz chat_id qorovuli — PASS');
}

// ============ TEST 10c: Alert guruhlash kaliti QAT'IY ============
// `console.error` ning birinchi argumenti alert kaliti bo'lib ishlaydi
// (`lib/alert.js` → `argsToKeyAndDetail(args)` uni aynan `args[0]` dan oladi).
// Unga o'zgaruvchan qism kirsa — yo'l, ID, buyurtma raqami — har chaqiruv
// ALOHIDA alert bo'ladi va bosish tomi ishlamay qoladi.
//
// 2026-08-05 da aynan shu topildi: `server.js` dagi `requestCrashed`
// birinchi argumentga `${req.method} ${path}` ni qo'yardi, ya'ni bitta
// nosozlik ~26 endpoint bo'ylab 26 xil kalit hosil qilardi. Qoida o'sha
// paytda CLAUDE.md da ikki kundan beri yozilgan edi — ya'ni qoidaning O'ZI
// yetarli emas, uni test qo'riqlashi kerak.
function testAlertKeyIsConstant() {
  const fs = require('fs');
  const path = require('path');

  const files = [];
  for (const dir of [__dirname, path.join(__dirname, 'lib'), path.join(__dirname, 'routes')]) {
    for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.js'))) {
      if (f === 'test.js' || f === 'eslint.config.js') continue;
      files.push(path.join(dir, f));
    }
  }

  // Birinchi argument: interpolatsiyali shablon satri, yoki `'...' +` birikma.
  const TEMPLATE_ARG = /console\.error\(\s*`[^`]*\$\{/;
  const CONCAT_ARG = /console\.error\(\s*'[^']*'\s*\+/;

  const bad = [];
  let checked = 0;
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    checked += (src.match(/console\.error\(/g) || []).length;
    if (TEMPLATE_ARG.test(src) || CONCAT_ARG.test(src)) bad.push(path.basename(file));
  }

  assert.strictEqual(bad.join(', '), '',
    'console.error ning BIRINCHI argumenti qat\'iy belgi bo\'lishi kerak — ' +
    'o\'zgaruvchan qism ikkinchi argumentga o\'tsin (alert guruhlash kaliti). ' +
    `Buzilgan fayllar: ${bad.join(', ')}`);
  assert.ok(checked > 50, 'skaner haqiqatan fayllarni ko\'rgan bo\'lishi kerak');

  console.log(`✅ Test 10c: Alert guruhlash kaliti qat'iy — PASS (${checked} ta console.error)`);
}

// ============ TEST 13: O'z-o'zini tekshirish qorovuli ============
// 2026-08-05: `/opt/lolamarket-notify/` serverdan o'chib ketgan, lekin Node
// jarayoni kodni xotiradan ishlatib turgani uchun sayt SOG'LOM ko'rinardi.
// Nosozlik ~24 soat ko'rinmadi. Qorovul aynan shu holatni tutadi.
// Test haqiqiy papkaga emas, vaqtinchalik papkaga qaraydi — shunda u
// joylashuv o'zgarsa ham ishlaydi va tekshirilayotgan MANTIQ sinaladi.
function testSelfCheck() {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const { missingFiles, REQUIRED } = require('./lib/self-check');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-selfcheck-'));
  try {
    // 1. Hammasi joyida → bo'sh ro'yxat
    for (const f of REQUIRED) {
      const p = path.join(tmp, f);
      if (f === 'node_modules') fs.mkdirSync(p);
      else fs.writeFileSync(p, 'x');
    }
    assert.deepStrictEqual(missingFiles(tmp), [],
      'hamma fayl joyida bo\'lsa ro\'yxat bo\'sh bo\'lishi kerak');

    // 2. Bittasi yo'qolsa — AYNAN o'sha qaytsin
    fs.unlinkSync(path.join(tmp, '.env'));
    assert.deepStrictEqual(missingFiles(tmp), ['.env'],
      'yo\'q fayl aniq ko\'rsatilishi kerak');

    // 3. Papkaning O'ZI yo'q bo'lsa — bu ASOSIY holat (2026-08-05 dagi)
    const yoq = path.join(tmp, 'umuman-yoq');
    const r = missingFiles(yoq);
    assert.strictEqual(r.length, 1, 'papka yo\'qligi bitta yozuv bilan aytilsin');
    assert.ok(/papka/i.test(r[0]), 'xabar papka yo\'qligini bildirishi kerak');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  // 4. Qorovul xatosi ALERT yo'liga tushsin va kaliti QAT'IY bo'lsin.
  //    (Test 10c manba kodini skanerlaydi; bu esa chaqiruvni haqiqatan
  //    kuzatadi — qorovul jimgina o'tib ketmasin.)
  const { runCheck } = require('./lib/self-check');
  const errs = [];
  const realError = console.error;
  console.error = (...a) => errs.push(a);
  let ok;
  try { ok = runCheck(); } finally { console.error = realError; }

  if (ok) {
    assert.strictEqual(errs.length, 0, 'hammasi joyida bo\'lsa jurnalga yozilmasin');
  } else {
    // Bu repo'da `.env` yo'q (u faqat serverda yashaydi) — shuning uchun
    // lokal ishga tushirishda qorovul ishlab ketishi KUTILGAN holat.
    assert.strictEqual(errs.length, 1, 'nosozlikda aynan bitta yozuv bo\'lsin');
    assert.strictEqual(typeof errs[0][0], 'string', 'kalit satr bo\'lishi kerak');
    assert.ok(!/\$\{|\+/.test(errs[0][0]),
      'birinchi argument QAT\'IY bo\'lsin — alert guruhlash kaliti');
    assert.ok(errs[0].length > 1, 'o\'zgaruvchan qism ikkinchi argumentda bo\'lsin');
  }

  console.log(`✅ Test 13: O'z-o'zini tekshirish qorovuli — PASS ` +
    `(${REQUIRED.length} ta fayl kuzatiladi)`);
}

// ============ TEST 15: Frontendda inline kod QOLMASIN ============
// C3 dan keyin CSP `script-src` da `'unsafe-inline'` yo'q. Ya'ni inline
// hodisa (`onclick="..."`), inline `<script>` bloki va `javascript:` URL
// brauzer tomonidan BAJARILMAYDI — tugma bosilmaydi, sahifa chizilmaydi.
//
// Nuqson JIMGINA chiqadi: HTML yetib boradi, xato faqat konsolda ko'rinadi,
// HTTP kod 200 qolaveradi. Shuning uchun uni odam emas, test tutishi kerak.
// Bu loyihaning o'z darsi: yozilgan qoida himoya emas — uni tekshiradigan
// test himoya (Test 2c va 10c ham shu sababdan tug'ilgan).
//
// Skaner FAQAT deploy qilinadigan fayllarga qaraydi (`deploy.yml` → `source`).
// `maket-yangi-ekranlar.html` ataylab yo'q — u serverga chiqmaydi, ya'ni
// CSP unga hech qachon tegmaydi.
function testNoInlineFrontendCode() {
  const fs = require('fs');
  const path = require('path');
  const root = path.join(__dirname, '..');

  const TARGETS = [
    'index.html', 'offline.html', 'loyiha-panel.html',
    'script.js', 'pwa.js', 'sw.js', 'offline.js', 'panel.js',
    'admin/index.html', 'admin/admin.js',
    'telegram-app/index.html', 'telegram-app/offline.html',
    'telegram-app/app.js', 'telegram-app/pwa.js',
    'telegram-app/sw.js', 'telegram-app/offline.js',
    'sayt-eski/index.html', 'sayt-eski/script.js',
  ];

  // `on[a-z]{3,}` — eng qisqa haqiqiy hodisa `oncut` (3 harf). Ikki harfli
  // chegara qo'yilsa `<div one="...">` kabi begona atribut ham tutilardi.
  // `inline <script>` faqat HTML'da qidiriladi: JS faylida `<script>` matni
  // izohda ham uchraydi va u brauzerga umuman bormaydi. Qolgan ikkitasi JS'ga
  // ham tegadi — shablon satri HTML chizadi, ya'ni hodisa o'sha yerdan ham
  // kirib kelishi mumkin (C1/C2 dagi ~120 hodisaning ko'pi aynan shunday edi).
  const PATTERNS = [
    { nom: 'inline hodisa', re: /<[a-z][a-z0-9-]*\s[^>]*?\son[a-z]{3,}\s*=/gi },
    { nom: 'inline <script>', re: /<script(?![^>]*\ssrc\s*=)[^>]*>/gi, faqatHtml: true },
    { nom: 'javascript: URL', re: /(?:href|src|action)\s*=\s*["']?\s*javascript:/gi },
  ];

  // ⚠️ ATAYLAB ruxsat berilgan YAGONA istisno — founder qarori (2026-08-06:
  // "kerakmas, unut"). `sayt-eski/` ishlatilmaydi va faqat `style.css` uchun
  // turibdi (`demo/` va `admin/` unga bog'liq), shuning uchun o'sha formadagi
  // email tugmasi C3 dan keyin jimgina o'lishi BILIB QILINGAN tanlov.
  // Ro'yxat AYNAN solishtiriladi: istisno yo'qolsa ham test qizil bo'ladi —
  // ya'ni eski sayt tozalangan kuni bu qatorni o'chirish esdan chiqmaydi.
  const ALLOWED = [
    'sayt-eski/index.html:69 — inline hodisa',
  ];

  const topilgan = [];
  let bayt = 0;
  for (const rel of TARGETS) {
    const file = path.join(root, rel);
    assert.ok(fs.existsSync(file),
      `skaner nishoni yo'qolgan: ${rel} — fayl ko'chirilgan bo'lsa TARGETS ham yangilansin`);
    const src = fs.readFileSync(file, 'utf8');
    bayt += src.length;

    for (const { nom, re, faqatHtml } of PATTERNS) {
      if (faqatHtml && !rel.endsWith('.html')) continue;
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(src)) !== null) {
        const qator = src.slice(0, m.index).split('\n').length;
        topilgan.push(`${rel}:${qator} — ${nom}`);
      }
    }
  }

  assert.deepStrictEqual(topilgan.sort(), ALLOWED.slice().sort(),
    'Frontendda inline kod topildi. CSP `script-src` da `\'unsafe-inline\'` YO\'Q, ' +
    'ya\'ni bu joy brauzerda umuman ishlamaydi va xato bermaydi.\n' +
    'Hodisani `data-action` delegatsiyasiga yoki `addEventListener` ga o\'tkazing, ' +
    'inline `<script>` blokini tashqi faylga chiqaring (va uni `deploy.yml` dagi ' +
    '`source` ro\'yxatiga QO\'SHING).\n' +
    '⚠️ Agar bu `loyiha-panel.html` dagi HISOBOT MATNI bo\'lsa — bu ham haqiqiy ' +
    'nuqson: xom `<img onerror=...>` matn emas, brauzer ochadigan HAQIQIY teg, ' +
    'ortidagi hisobot esa o\'sha teg ichiga tushib ko\'rinmay qoladi. `<` belgisini ' +
    '`&lt;` bilan yozing.\n' +
    `Topilgani: ${topilgan.join('; ') || '(yo\'q)'}`);

  assert.ok(bayt > 200000, 'skaner haqiqatan fayllarni o\'qigan bo\'lishi kerak');

  console.log(`✅ Test 15: Frontendda inline kod yo'q — PASS ` +
    `(${TARGETS.length} ta fayl, ${Math.round(bayt / 1024)} KB, ` +
    `${ALLOWED.length} ta ataylab qoldirilgan istisno)`);
}

// ============ TEST 14: Kesh mahsulot MATNI bo'yicha eskiradi ============
// Sprint 10, 3-qaror. Xavf konkret: mato tarkibi tahrirlansa (masalan
// "100% ipak" → "70% ipak, 30% paxta"), eski tarkibga qarab yozilgan g'oyalar
// sahifada QOLIB KETARDI va buni hech kim sezmasdi — reyting `NULL` va
// `ALERT_CHAT_ID` bilan bitta oiladagi JIMGINA YOLG'ON.
function testSourceHash() {
  const { sourceHash } = require('./lib/ai');

  const asl = { name_uz: 'Ipak ikat', comp_uz: '100% ipak', cat_key: 'silk', width: '0.9 m', weight: '90 g/m²' };
  const h = sourceHash(asl);

  // Bir xil kirish — bir xil hash (kesh keraksiz yerda buzilmasin)
  assert.strictEqual(sourceHash({ ...asl }), h, 'bir xil mato bir xil hash berishi kerak');

  // HAR BIR maydon hashga ta'sir qilishi shart. Bittasi tushib qolsa,
  // o'sha maydon tahrirlanganda kesh jimgina eskirmay qolardi.
  for (const k of ['name_uz', 'comp_uz', 'cat_key', 'width', 'weight']) {
    assert.notStrictEqual(sourceHash({ ...asl, [k]: 'boshqa' }), h,
      `${k} o'zgarsa hash ham o'zgarishi kerak — aks holda eskirgan g'oya qolib ketadi`);
  }

  // `null` va bo'sh satr ATAYLAB bir xil: "tarkib yozilmagan" va "tarkib bo'sh"
  // bir xil g'oya beradi, ya'ni ular orasida farq keshni buzishi shart emas.
  assert.strictEqual(
    sourceHash({ ...asl, comp_uz: null }),
    sourceHash({ ...asl, comp_uz: '' }),
    'null va bo\'sh satr bir xil qaralishi kerak'
  );

  // Maydon chegarasi surilib ketmasin: "a|b" va "a" + "|b" chalkashmasligi kerak
  assert.notStrictEqual(
    sourceHash({ ...asl, name_uz: 'A', comp_uz: 'B' }),
    sourceHash({ ...asl, name_uz: 'A B', comp_uz: '' }),
    'maydonlar chegarasi hashda saqlanishi kerak'
  );

  console.log('✅ Test 14: Kesh hash mahsulot matniga bog\'langan — PASS');
}

// ============ TEST 14b: AI javobi sxemasi ============
// Sprint 10, 6-qaror: mos kelmasa javob RAD ETILADI (keshga yozilmaydi).
// Bu tekshiruv bezak emas — Gemini'ning JSON rejimi bo'sh, ya'ni bu YAGONA
// qorovul. Shu bilan birga 5-qaror: NOTANISH kategoriya jimgina tashlanadi,
// butun javob rad etilMAYDI (bitta yomon tavsiya uchun uchta yaxshi g'oyani
// yo'qotish foydalanuvchiga zarar).
function testParseIdeas() {
  const { parseIdeas, MIN_IDEAS, MAX_IDEAS } = require('./lib/ai');
  const CATS = ['cotton', 'silk', 'linen'];

  const yaxshi = (n) => Array.from({ length: n }, (_, i) => ({
    nom: `G'oya ${i}`, izoh: 'izoh matni', sarf: '2.5 m',
    qiyinlik: 'oson', kerakli_kategoriyalar: ['cotton'],
  }));

  // 1) To'g'ri javob o'tadi
  const ok = parseIdeas(JSON.stringify(yaxshi(MIN_IDEAS)), CATS);
  assert.strictEqual(ok.length, MIN_IDEAS);
  assert.deepStrictEqual(ok[0].kerakli_kategoriyalar, ['cotton']);

  // 2) Markdown ramkasi — MAZMUN emas, TRANSPORT artefakti. Uni ochish
  //    "tuzatish" emas: modellar JSON rejimida ham ba'zan ramka qo'shadi.
  const ramkali = '```json\n' + JSON.stringify(yaxshi(MIN_IDEAS)) + '\n```';
  assert.strictEqual(parseIdeas(ramkali, CATS).length, MIN_IDEAS,
    'markdown ramkasi ichidagi JSON o\'qilishi kerak');

  // 3) Notanish kategoriya JIMGINA tushadi, javob esa BARIBIR chiqadi
  const aralash = yaxshi(MIN_IDEAS);
  aralash[0].kerakli_kategoriyalar = ['astar', 'cotton', 'tugma'];
  const f = parseIdeas(JSON.stringify(aralash), CATS);
  assert.deepStrictEqual(f[0].kerakli_kategoriyalar, ['cotton'],
    'oq ro\'yxatda yo\'q kalit tashlanishi kerak');
  assert.strictEqual(f.length, MIN_IDEAS, 'notanish kalit butun javobni rad etmasligi kerak');

  // 4) Sxemaga mos kelmagan javoblar — HAMMASI rad etiladi
  const yomon = [
    ['JSON emas', 'salom dunyo'],
    ['massiv emas', '{"nom":"x"}'],
    ['juda kam', JSON.stringify(yaxshi(MIN_IDEAS - 1))],
    ['juda ko\'p', JSON.stringify(yaxshi(MAX_IDEAS + 1))],
    ['nom yo\'q', JSON.stringify(yaxshi(MIN_IDEAS).map((x, i) => (i ? x : { ...x, nom: '' })))],
    ['izoh yo\'q', JSON.stringify(yaxshi(MIN_IDEAS).map((x, i) => (i ? x : { ...x, izoh: null })))],
    ['sarf yo\'q', JSON.stringify(yaxshi(MIN_IDEAS).map((x, i) => (i ? x : { ...x, sarf: 42 })))],
    ['qiyinlik notanish', JSON.stringify(yaxshi(MIN_IDEAS).map((x, i) => (i ? x : { ...x, qiyinlik: 'juda qiyin' })))],
    ['g\'oya obyekt emas', JSON.stringify([...yaxshi(MIN_IDEAS - 1), 'satr'])],
  ];
  for (const [nom, kirish] of yomon) {
    assert.throws(() => parseIdeas(kirish, CATS), undefined,
      `sxemaga mos kelmagan javob rad etilishi kerak: ${nom}`);
  }

  // 5) Matn uzunligi chegarasi — cheksiz matn sahifani buzmasin
  const uzun = yaxshi(MIN_IDEAS);
  uzun[0].izoh = 'a'.repeat(401);
  assert.throws(() => parseIdeas(JSON.stringify(uzun), CATS),
    undefined, 'juda uzun izoh rad etilishi kerak');

  console.log('✅ Test 14b: AI javobi sxemasi qat\'iy tekshiriladi — PASS');
}

// ============ TEST 14c: Kunlik limit ATOMIK ============
// `decrementStock` bilan AYNI sabab (CLAUDE.md, zaxira qoidasi): tekshiruv va
// oshirish alohida `SELECT` + `UPDATE` ga bo'linsa, bir vaqtda kelgan ikki
// so'rov IKKALASI ham "hali limit tugamagan" deb o'qib o'tib ketardi.
async function testAiQuotaAtomic() {
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(path.join(__dirname, 'routes', 'ai.js'), 'utf8');

  // 1) Shakl: shart INSERT ... ON CONFLICT ning WHERE qismida bo'lsin
  const m = src.match(/INSERT INTO ai_usage[\s\S]*?RETURNING used/);
  assert.ok(m, 'limit INSERT ... ON CONFLICT ... RETURNING naqshida bo\'lishi kerak');
  assert.ok(/ON CONFLICT[\s\S]*DO UPDATE SET used = ai_usage\.used \+ 1[\s\S]*WHERE ai_usage\.used < \$2/.test(m[0]),
    'limit sharti DO UPDATE ning WHERE qismida bo\'lsin (atomik)');

  // 2) Alohida o'qish BO'LMASIN — u qaytib kelsa poyga oynasi ochiladi
  assert.ok(!/SELECT[^;]*FROM ai_usage/i.test(src),
    'ai_usage dan alohida SELECT bo\'lmasin — tekshiruv va oshirish bitta gapda');

  // 3) Kun MAHALLIY mintaqada — UTC bo'lsa limit Toshkent vaqti bilan 05:00 da
  //    yangilanardi, foydalanuvchiga esa "ertaga 00:00 da" deyilardi (jimgina yolg'on)
  assert.ok(/now\(\) AT TIME ZONE 'Asia\/Tashkent'/.test(src),
    'kun mahalliy mintaqada hisoblanishi kerak — xabar "00:00" deydi');

  // 4) XATTI-HARAKAT: baza qoidasini taqlid qilib, limit haqiqatan to'xtatadimi
  const { takeQuota } = require('./routes/ai');
  const { pool } = require('./db');
  const asl = pool.query;
  let used = 0;
  const LIMIT = Number(process.env.AI_DAILY_LIMIT) || 10;
  pool.query = async (sql, params) => {
    // Postgres bitta gapda: shart bajarilsa oshiradi va qator qaytaradi
    if (used < params[1]) { used += 1; return { rows: [{ used }] }; }
    return { rows: [] };
  };
  try {
    let berildi = 0;
    // Parallel so'rovlar — bittasi ham chegaradan o'tib ketmasligi kerak
    const urinishlar = await Promise.all(
      Array.from({ length: LIMIT + 5 }, () => takeQuota('777'))
    );
    for (const r of urinishlar) if (r) berildi += 1;
    assert.strictEqual(berildi, LIMIT,
      `limitdan ortiq generatsiya berilmasligi kerak (berildi=${berildi})`);
    assert.strictEqual(used, LIMIT, 'hisoblagich limitdan oshib ketmasligi kerak');
  } finally {
    pool.query = asl;
  }

  console.log(`✅ Test 14c: Kunlik limit atomik — PASS (${LIMIT} ta berildi, ortig'i rad etildi)`);
}

// ============ TEST 14d: Yaroqsiz javob keshga YOZILMAYDI ============
// Sprint 10, 6-qaror. Bu yerda ikki narsa tekshiriladi va IKKALASI ham kerak:
// tartib (kesh yozuvi generatsiyadan KEYIN) va xatti-harakat (yaroqsiz javob
// xato tashlaydi, ya'ni yozuvgacha yetib bormaydi).
function testBadAnswerNeverCached() {
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(path.join(__dirname, 'routes', 'ai.js'), 'utf8');

  const iGen = src.indexOf('generateIdeas(');
  const iIns = src.indexOf('INSERT INTO product_ai_ideas');
  assert.ok(iGen > 0 && iIns > 0, 'ikkala qadam ham ai.js da bo\'lishi kerak');
  assert.ok(iGen < iIns,
    'keshga yozish generatsiyadan KEYIN bo\'lsin — sxema tekshiruvidan oldin yozilmasin');

  // Keshga faqat SHU joyda yoziladi — ikkinchi yozuv nuqtasi paydo bo'lsa,
  // u sxema tekshiruvini chetlab o'tishi mumkin.
  const yozuvlar = src.match(/INSERT INTO product_ai_ideas/g) || [];
  assert.strictEqual(yozuvlar.length, 1, 'keshga yozuv nuqtasi bitta bo\'lsin');

  // Xatti-harakat: yaroqsiz javobda `parseIdeas` xato tashlaydi, ya'ni
  // `generateIdeas` ham tashlaydi va INSERT ga umuman yetib borilmaydi.
  const { parseIdeas } = require('./lib/ai');
  assert.throws(() => parseIdeas('{"buzuq":true}', ['cotton']),
    undefined, 'yaroqsiz javob xato tashlashi kerak (jimgina bo\'sh natija emas)');

  console.log('✅ Test 14d: Sxemadan o\'tmagan javob keshga yozilmaydi — PASS');
}

// ============ TEST RUNNER ============
async function runTests() {
  console.log('\n🧪 LolaMarket Server Testlari\n');

  try {
    testPrepayCalculation();
    testCommissionCalculation();
    testVerifyInitData();
    testVerifyInitDataInvalid();
    testVerifyInitDataMissingHash();
    testVerifyInitDataStale();
    await testRouteTable();
    // config.js .env sirlarini talab qiladi (process.exit qiladi) — shuning
    // uchun uni talab qiladigan testlar testRouteTable'dan KEYIN, u soxta
    // sirlarni process.env'ga yozgandan keyin ishga tushirilishi kerak.
    testDeliveryFeeConfig();
    testChatIdValidation();
    await testDecrementStock();
    await testRecalcRating();
    testReviewAllowedStatus();
    testReviewSchema();
    testAlertThrottle();
    testAlertTextEscaping();
    testAlertKeyIsConstant();
    await testHideReviewRecalculates();
    await testRecordStatusChange();
    testEveryStatusWriteIsRecorded();
    testStatusGuardsSurviveCte();
    testSelfCheck();
    testNoInlineFrontendCode();
    testSourceHash();
    testParseIdeas();
    await testAiQuotaAtomic();
    testBadAnswerNeverCached();

    console.log('\n✅ Hammasi PASS — pul hisobi, imzo, route jadvali, xato alerti, buyurtma tarixi va AI g\'oyalari joyida\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST XATOSI:\n', err.message, '\n');
    process.exit(1);
  }
}

runTests();
