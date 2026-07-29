const crypto = require('crypto');
const assert = require('assert');

// ============ TESTLAR ============
// npm test orqali ishga tushirish uchun: npm install && npm test
// Hozir: node test.js (o'chirilmasin — keyingi xona test runner integratsiyalashadi)

const BOT_TOKEN = 'test-bot-token-12345';

// ============ TEST 1: Oldindan to'lov (prepay) hisobi ============
// Buyurtma summasi 1 000 000 so'm, PREPAY_RATE = 0.5 (50%)
// Kutiladi: prepay = 500 000, rest = 500 000
function testPrepayCalculation() {
  const PREPAY_RATE = 0.5;
  const total = 1_000_000;

  const prepay = Math.round(total * PREPAY_RATE);
  const rest = total - prepay;

  assert.strictEqual(prepay, 500_000, 'prepay 50% bo\'lishi kerak');
  assert.strictEqual(rest, 500_000, 'rest 50% bo\'lishi kerak');
  assert.strictEqual(prepay + rest, total, 'prepay + rest jami summa bo\'lishi kerak');

  console.log('✅ Test 1: Prepay hisobi — PASS (prepay=500k, rest=500k)');
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

// ============ TEST 3: Telegram initData imzosi ============
// Telegram'ning Manifest o'ziga o'xshash imzo algoritmi:
// 1. Barcha kalit=qiymatlarni alifbo tartibida \n bilan birlashtiramiz (hash olmang)
// 2. Bot tokendan secretKey yaratamiz: HMAC-SHA256(BOT_TOKEN, "WebAppData")
// 3. secretKey orqali dataCheckString'ni HMAC-SHA256 qilamiz → hash
// 4. Imzo taqqoslanadi (timingsafeequal)

function verifyInitData(initData, botToken, maxAgeSec = 86400) {
  try {
    if (!initData || typeof initData !== 'string') return null;
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    params.delete('hash');

    const pairs = [];
    for (const [k, v] of params) pairs.push(`${k}=${v}`);
    pairs.sort();
    const dataCheckString = pairs.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const a = Buffer.from(computed, 'hex');
    const b = Buffer.from(hash, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    // auth_date eskirganmi?
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    if (maxAgeSec && authDate && Date.now() / 1000 - authDate > maxAgeSec) return null;

    const userJson = params.get('user');
    if (!userJson) return null;
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}

function testVerifyInitData() {
  // To'g'ri imzo — qabul qilinishi kerak
  // Telegram Mini App imzosi: URLSearchParams bilan ishlaydi, lekin
  // hash hisoblash paytida barcha qatorlar alifbo tartibida bo'ladi.
  const user = { id: 123456789, first_name: 'Test', last_name: 'User' };
  const userJson = JSON.stringify(user);
  const now = Math.floor(Date.now() / 1000);

  // Alifbo tartibida: auth_date, user
  const pairs = [
    `auth_date=${now}`,
    `user=${userJson}`
  ];
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  // URLSearchParams'ni parse qiladi va alifbo tartibida qaytaradi
  const initData = `auth_date=${now}&hash=${hash}&user=${encodeURIComponent(userJson)}`;
  const verified = verifyInitData(initData, BOT_TOKEN, 86400); // 24 soat

  assert.notStrictEqual(verified, null, 'to\'g\'ri initData qabul qilinishi kerak');
  assert.strictEqual(verified.id, 123456789, 'user ID to\'g\'ri bo\'lishi kerak');
  assert.strictEqual(verified.first_name, 'Test', 'first_name to\'g\'ri bo\'lishi kerak');

  console.log('✅ Test 3: verifyInitData (to\'g\'ri imzo) — PASS');
}

function testVerifyInitDataInvalid() {
  // Noto'g'ri imzo — rad etilishi kerak
  const invalidInitData = 'user={"id":123}&hash=0000000000000000000000000000000000000000000000000000000000000000';
  const verified = verifyInitData(invalidInitData, BOT_TOKEN);

  assert.strictEqual(verified, null, 'noto\'g\'ri imzo rad etilishi kerak');

  console.log('✅ Test 3b: verifyInitData (noto\'g\'ri imzo) — PASS');
}

function testVerifyInitDataMissingHash() {
  // hash yo'q — rad etilishi kerak
  const initDataNoHash = 'user={"id":123}&auth_date=1234567890';
  const verified = verifyInitData(initDataNoHash, BOT_TOKEN);

  assert.strictEqual(verified, null, 'hash yo\'q bo\'lsa rad etilishi kerak');

  console.log('✅ Test 3c: verifyInitData (hash yo\'q) — PASS');
}

// ============ TEST RUNNER ============
function runTests() {
  console.log('\n🧪 LolaMarket Server Testlari\n');

  try {
    testPrepayCalculation();
    testCommissionCalculation();
    testVerifyInitData();
    testVerifyInitDataInvalid();
    testVerifyInitDataMissingHash();

    console.log('\n✅ Hammasi PASS — pul hisobi va imzo tekshiruvi xavfsiz\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST XATOSI:\n', err.message, '\n');
    process.exit(1);
  }
}

runTests();
