const { ALERT_CHAT_ID, GIT_SHA } = require('../config');
const { callTelegram } = require('./telegram-api');
const { escapeHtml } = require('./format');

// ============ SERVER XATOSI → TELEGRAM ============
// Muammo: kodda 66 ta `console.error` bor va ularning hammasi journalctl'ga
// tushadi — ya'ni hech kim o'qimaydi. Bugun serverda xato bo'lsa, biz buni
// faqat foydalanuvchi shikoyat qilganda bilamiz.
//
// Nega har bir `console.error` ni alohida tahrirlamadik: 66 ta joyni
// o'zgartirish 66 ta regress imkoniyati, ustiga kelajakda yangi `console.error`
// qo'shgan odam alert qo'shishni unutadi. Shuning uchun ushlash BITTA joyda —
// `console.error` ning o'zida. Yangi xato yozuvi avtomatik alertga aylanadi.
//
// Sentry o'rniga shu: tashqi akkaunt kerak emas, bildirishnoma relayi
// (`callTelegram`) allaqachon ishlab turibdi.

// Bir xil xato shu muddat ichida QAYTA yuborilmaydi. Bosilgan xatolar soni
// keyingi xabarda ko'rsatiladi, ya'ni yo'qolmaydi — faqat jamlanadi.
const WINDOW_MS = 10 * 60_000;

// Umumiy tom: bir soatda shundan ko'p alert ketmaydi. Bu ikkinchi qatlam —
// baza qulasa, HAR BIR so'rov boshqacha matnli xato beradi va yuqoridagi
// "bir xil xato" filtri ularni bir guruh deb ko'rmaydi.
const MAX_PER_HOUR = 20;
const HOUR_MS = 60 * 60_000;

// Xato belgisi (birinchi argument) shu uzunlikda kesiladi — guruhlash kaliti
// sifatida ishlatiladi, to'liq matn xabarning o'zida boradi.
const KEY_MAX = 80;

const seen = new Map();   // kalit → { last, suppressed }
let sentAt = [];          // oxirgi soatdagi yuborilgan alertlar vaqti

// Alert yuborish yo'lining O'ZI xato bersa, u yana console.error chaqirib
// cheksiz halqa hosil qilmasin. Bu bayroq halqani uzadi.
let inAlert = false;

let installed = false;

// ---- Yuborish qarori (sof funksiya — test aynan shuni sinaydi) ----
// Qaytaradi: { send, suppressed } — `suppressed` shu kalit bo'yicha oxirgi
// yuborishdan keyin bosilgan xatolar soni.
function shouldSend(key, now = Date.now()) {
  const prev = seen.get(key);

  if (prev && now - prev.last < WINDOW_MS) {
    prev.suppressed += 1;
    return { send: false, suppressed: prev.suppressed };
  }

  sentAt = sentAt.filter((t) => now - t < HOUR_MS);
  if (sentAt.length >= MAX_PER_HOUR) {
    // Tom urildi — bosilganini SANAB boramiz, aks holda tom bo'shagach
    // "yana N marta" soni yo'qolgan bo'lardi.
    if (prev) prev.suppressed += 1;
    else seen.set(key, { last: 0, suppressed: 1 });
    return { send: false, suppressed: 0 };
  }

  const suppressed = prev ? prev.suppressed : 0;
  seen.set(key, { last: now, suppressed: 0 });
  sentAt.push(now);
  return { send: true, suppressed };
}

// Eskirgan kalitlarni tozalash — xotira oqishi bo'lmasin (http.js dagi
// rate-limit tozalashi bilan bir xil naqsh).
function sweep(now = Date.now()) {
  for (const [key, v] of seen.entries()) {
    if (now - v.last > HOUR_MS && v.suppressed === 0) seen.delete(key);
  }
}

// ---- Xabar matni ----
function alertText(key, detail, suppressed) {
  return [
    '🚨 <b>Server xatosi</b>',
    '',
    `<code>${escapeHtml(key)}</code>`,
    detail ? escapeHtml(detail).slice(0, 1500) : '',
    suppressed > 0 ? `\n<i>(oldingi xabardan keyin yana ${suppressed} marta takrorlandi)</i>` : '',
    '',
    `<i>versiya: ${escapeHtml(GIT_SHA)}</i>`,
  ].filter(Boolean).join('\n');
}

// ---- Yuborish ----
// Hech qachon `throw` qilmaydi va hech qachon `console.error` chaqirmaydi:
// alert yetib bormagani asosiy amalni buzmasligi kerak (telegram-api.js dagi
// `notify()` bilan bir xil qoida).
function sendAlert(key, detail) {
  if (!ALERT_CHAT_ID) return Promise.resolve(false);
  const { send, suppressed } = shouldSend(key);
  if (!send) return Promise.resolve(false);

  inAlert = true;
  return callTelegram('sendMessage', {
    chat_id: ALERT_CHAT_ID,
    text: alertText(key, detail, suppressed),
    parse_mode: 'HTML',
    disable_notification: false,
  })
    .then(() => true)
    .catch(() => false)
    .finally(() => { inAlert = false; });
}

// ---- console.error ni ushlash ----
// Birinchi argument — belgi (masalan "createOrder xatosi:"), qolgani tafsilot.
function argsToKeyAndDetail(args) {
  const first = args.length ? String(args[0]) : 'xato';
  const key = first.slice(0, KEY_MAX);
  const detail = args.slice(1).map((a) => (a instanceof Error ? a.stack || a.message : String(a))).join(' ');
  return { key, detail: detail || (first.length > KEY_MAX ? first : '') };
}

// ---- Halokatli xato ----
// Bugungi xatti-harakat SAQLANADI: bugun ham `uncaughtException` jarayonni
// o'ldiradi (Node'ning standart holati) va systemd uni qayta ko'taradi.
// Biz faqat KO'RINISH qo'shamiz — chiqishdan oldin xabar yuborilishiga
// ulguradigan qisqa muhlat beriladi.
function fatal(kind, err) {
  const detail = err instanceof Error ? (err.stack || err.message) : String(err);
  const done = sendAlert(`💀 ${kind}`, detail);
  const timeout = new Promise((r) => setTimeout(r, 3000).unref?.());
  Promise.race([done, timeout]).finally(() => process.exit(1));
}

// ---- O'rnatish ----
// FAQAT server to'g'ridan-to'g'ri ishga tushirilganda chaqiriladi
// (`require.main === module`). Testlar router'ni `require` qiladi va
// console.error'ni O'ZI ushlaydi (test.js → testNoBrokenReferences) —
// shuning uchun test muhitida bu o'rnatilmasligi SHART.
function install() {
  if (installed) return;
  installed = true;

  const realError = console.error;
  console.error = (...args) => {
    realError(...args);
    if (inAlert) return;
    try {
      const { key, detail } = argsToKeyAndDetail(args);
      sendAlert(key, detail);
    } catch (_) { /* alert hech qachon asosiy oqimni buzmaydi */ }
  };

  process.on('uncaughtException', (err) => fatal('uncaughtException', err));
  process.on('unhandledRejection', (reason) => fatal('unhandledRejection', reason));

  setInterval(sweep, 15 * 60_000).unref();
}

// `_reset` faqat test uchun — holat testlar orasida oqib ketmasin.
function _reset() {
  seen.clear();
  sentAt = [];
}

module.exports = { install, sendAlert, shouldSend, alertText, argsToKeyAndDetail, sweep, _reset, WINDOW_MS, MAX_PER_HOUR };
