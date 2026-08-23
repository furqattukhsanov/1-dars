const { pool } = require('../db');

// ============ FOYDALANUVCHI AMALLARI LENTASI (2026-08-23, db/029) ============
// Admin paneldagi «Bot userlar» → «Oxirgi harakatlar» shu jadvaldan chiziladi.
//
// `traffic_events` (db/028) bilan ARALASHTIRILMAYDI: u anonim va ko'rishni
// sanaydi; bu yerda esa KIRGAN foydalanuvchining O'ZI bajargan amal va uning
// Telegram ID'si. «Mato ko'rildi» shuning uchun bu yerga TUSHMAYDI —
// ko'rish anonim beacon orqali keladi va u kimlik so'ramaydi (Test 42).
//
// ⚠️ RO'YXAT FAQAT SHU YERDA. Bazada `kind` uchun faqat shakl tekshiruvi bor
// (db/029 izohi — `to_status` darsi). Panel yorlig'i ham shu yerdan
// (`LABELS`) — admin.js ga nusxalanmaydi, server javobda tayyor yorliq beradi.
const KINDS = Object.freeze({
  favorite_add:    "Sevimliga qo'shildi",
  favorite_remove: 'Sevimlidan olindi',
  ai_image:        "AI rasm so'raldi",
  order:           'Buyurtma berildi',
  web_login:       'Saytga kirdi',
});

// Eng yaxshi harakat: yozuv yiqilsa CHAQIRUVCHI amal yiqilmaydi (buyurtma
// lenta uchun to'xtamasin), lekin xato YUTILMAYDI — `console.error` alertga
// chiqadi (`ALERT_CHAT_ID` darsi: jimgina yiqilib turgan yozuv oylab
// sezilmasdi). Birinchi argument BARQAROR kalit (Test 10c).
//
// Qaytadi: Promise — chaqiruvchi uni KUTMAYDI (`void`), javob kechikmasin.
function recordUserEvent(tgUserId, kind, extra = {}) {
  if (!KINDS[kind]) {
    console.error('user_events noma\'lum tur:', kind);
    return Promise.resolve();
  }
  const id = String(tgUserId || '').trim();
  if (!/^-?\d{1,19}$/.test(id)) return Promise.resolve();

  const productId = typeof extra.productId === 'string' && /^[a-zA-Z0-9_-]{1,40}$/.test(extra.productId)
    ? extra.productId : null;
  const label = typeof extra.label === 'string' ? extra.label.slice(0, 80) : null;

  return pool.query(
    `INSERT INTO user_events (tg_user_id, kind, product_id, label) VALUES ($1, $2, $3, $4)`,
    [id, kind, productId, label]
  ).catch((e) => {
    console.error('user_events yozish xatosi:', e.message);
  });
}

module.exports = { KINDS, recordUserEvent };
