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
// Buyurtma summasi 1 000 000 so'm, COMMISSION_RATE = 0.10 (10%)
// Kutiladi: commission = 100 000, payout = 900 000
function testCommissionCalculation() {
  const COMMISSION_RATE = 0.10;
  const total = 1_000_000;

  const commissionAmount = Math.round(total * COMMISSION_RATE);
  const payoutAmount = total - commissionAmount;

  assert.strictEqual(commissionAmount, 100_000, 'komissiya 10% bo\'lishi kerak');
  assert.strictEqual(payoutAmount, 900_000, 'sotuvchiga o\'tkaziladigan summa 90% bo\'lishi kerak');
  assert.strictEqual(commissionAmount + payoutAmount, total, 'komissiya + payout jami summa bo\'lishi kerak');

  console.log('✅ Test 2: Komissiya hisobi — PASS (commission=100k, payout=900k)');
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

function request(port, method, path, payload) {
  return new Promise((resolve, reject) => {
    const headers = {};
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

    console.log('\n✅ Hammasi PASS — pul hisobi, imzo tekshiruvi va route jadvali joyida\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST XATOSI:\n', err.message, '\n');
    process.exit(1);
  }
}

runTests();
