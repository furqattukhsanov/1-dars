const { BOT_TOKEN, ADMIN_TG_IDS, SELLER_TG_IDS, ADMIN_PANEL_TOKEN } = require('../config');
const { pool } = require('../db');
const { verifyInitData: verifyInitDataCore } = require('./telegram-auth');
const { safeEqual } = require('./format');
const { fail } = require('./http');

// ============ KIM BU SO'ROV EGASI ============
// Barcha domen modullari shu qatlamga tayanadi — shuning uchun ular
// bir-biriga bog'lanmaydi (sikl bo'lmaydi).

// ---- Telegram Mini App: imzolangan initData ----
// Haqiqiy imzo tekshiruvi lib/telegram-auth.js da — server va testlar
// bir xil kodni ishlatishi uchun (testlar nusxani emas, haqiqiy kodni sinaydi).
function verifyInitData(initData, maxAgeSec = 86400) {
  return verifyInitDataCore(initData, BOT_TOKEN, maxAgeSec);
}

// So'rov header'idagi initData'dan tasdiqlangan foydalanuvchini qaytaradi (yoki null).
// Himoyalangan endpointlar shu orqali "bu kim" ekanini BILADI — mijozga ishonmaydi.
function authUser(req) {
  return verifyInitData(req.headers['x-telegram-init-data']);
}

// ---- Ikki kanal uchun BITTA kimlik (2026-08-12) ----
// Xaridor bir xil ishni ikki joydan qiladi: Mini App'da imzolangan initData
// bilan, saytda esa HttpOnly cookie sessiyasi bilan. Endpointlar shulardan
// faqat BIRINCHISINI bilardi, ya'ni bahs ochish kabi amallar saytda umuman
// ishlamasdi — sayt xaridori 401 olardi.
//
// ⚠️ Ikkala yo'l ham kimlikni SERVER tomonda hal qiladi va bu shart:
//   * initData — Telegram imzolagan, soxtalashtirib bo'lmaydi;
//   * cookie — HttpOnly, bazada `sha256` shaklida, JS o'qiy olmaydi.
// Klient yuborgan `tg_user_id` ga hech qachon ishonilmaydi (CLAUDE.md).
//
// Qaytadi: `{ id }` — Telegram ID satr ko'rinishida, `authUser` bilan AYNI
// maydonda, shunda chaqiruvchi kodda shart tarmoqlanmaydi. Topilmasa `null`.
async function requestUser(req) {
  const tg = authUser(req);
  if (tg && tg.id) return { id: String(tg.id), source: 'miniapp' };

  // Marshrut emas, kutubxona — qatlam buzilmaydi (`lib/web-session.js`).
  const { webSessionUser } = require('./web-session');
  const web = await webSessionUser(req);
  if (web && web.tgUserId) return { id: String(web.tgUserId), source: 'web' };

  return null;
}

// Foydalanuvchi admin (moderator)mi? Kimlik imzolangan initData'dan olinadi,
// so'ng ADMIN_TG_IDS ro'yxati bilan SERVER tomonda solishtiriladi.
// MUHIM (Dars 11): bu tekshiruv hech qachon faqat frontendda (masalan tugmani
// yashirish) bo'lmasligi kerak — aks holda har kim to'g'ridan-to'g'ri so'rov
// yuborib admin funksiyalarini chaqira olardi.
function isAdmin(tgUser) {
  return !!(tgUser && tgUser.id && ADMIN_TG_IDS.has(String(tgUser.id)));
}

// ---- Admin panel tokeni ----
// O'QISH shu token bilan yetarli. YOZUV amallari qo'shimcha ravishda Telegram'da
// tasdiqlanadi (handleAdminAction) — token o'g'irlansa ham pul o'tkazilmaydi.
function adminPanelAuth(req, res) {
  const token = req.headers['x-admin-token'];
  if (!ADMIN_PANEL_TOKEN || !token || !safeEqual(token, ADMIN_PANEL_TOKEN)) {
    fail(res, 'unauthorized', 401);
    return false;
  }
  return true;
}

// ---- Sotuvchi roli ----
// Rol SERVER tomonda aniqlanadi: imzolangan initData → users.role → sellers.
// Frontend faqat ko'rinishni boshqaradi; har bir sotuvchi endpointi rolni
// mustaqil qayta tekshiradi (tugmani yashirish himoya emas).
//
// ============ FOUNDER RO'YXATI (2026-08-13) ============
// Kabinet ikki shartda ochiladi: (1) Telegram ID founder ro'yxatida
// (`SELLER_TG_IDS`), (2) bazada rol va `sellers` yozuvi bor. Bittasi
// yetarli emas.
//
// ⚠️ Tekshiruv AYNAN SHU YERDA va bu ataylab: `currentSeller` — rol haqida
// ma'lumot beradigan YAGONA funksiya (`/api/me`, `requireSeller` va
// `catalog.js` ning "o'z mahsulotim" filtri — uchalasi ham shundan
// oziqlanadi). Chaqiruvchilarga tarqatilsa yangi chaqiruvchi qo'shilganda
// tekshiruvni eslab qolish kerak bo'lardi — `authUser()` naqshi aynan
// shunday takrorlangan edi (CLAUDE.md, 2026-08-13).
function sellerAllowed(tgUser) {
  return !!(tgUser && tgUser.id) && SELLER_TG_IDS.has(String(tgUser.id));
}

async function currentSeller(tgUser) {
  if (!tgUser || !tgUser.id) return null;
  const { rows } = await pool.query(
    // `pickup_point_id` shu yerdan olinadi, alohida so'rov bilan emas:
    // "men kimman" javobi (`/api/me`) baribir shu qatorni o'qiydi va
    // profil manzilni O'SHA javobdan ko'rsatadi (db/022).
    //
    // `phone` HAM shu qatordan (2026-08-16). Ilgari Mini App profil kartasi
    // raqamni `localStorage` dan va `/api/telegram-contact?uid=` dan olardi,
    // ya'ni qurilmaga bog'langan edi — sayt esa AYNI raqamni bazadan
    // ko'rsatardi (`web-session.js`). Bir yuzda ishlab ikkinchisida
    // ishlamaydigan naqsh (CLAUDE.md). Endi ikkala yuz ham bitta ustundan
    // oziqlanadi: `users.phone`.
    `SELECT u.id AS user_id, u.role, u.pickup_point_id, u.phone,
            s.id AS seller_id, s.business_name_uz, s.business_name_ru, s.is_verified
       FROM users u
       LEFT JOIN sellers s ON s.user_id = u.id
      WHERE u.tg_user_id = $1`,
    [String(tgUser.id)]
  );
  const qator = rows[0] || null;
  if (!qator) return null;
  // Ro'yxatda yo'q bo'lsa — sotuvchi maydonlari OLIB TASHLANADI, qator esa
  // qoladi: `pickup_point_id` va `user_id` HAR BIR foydalanuvchiga kerak
  // (profildagi "Mening manzilim"), ya'ni `null` qaytarish xaridorning
  // manzilini ham o'chirib yuborardi.
  if (!sellerAllowed(tgUser)) {
    return { ...qator, role: qator.role === 'seller' ? 'buyer' : qator.role, seller_id: null };
  }
  return qator;
}

// Sotuvchi endpointlari uchun yagona qorovul: rol 'seller' VA sellers yozuvi bo'lishi shart
//
// ⚠️ Kimlik IKKALA KANALDAN (2026-08-13, C2). Ilgari bu yerda `authUser()`
// turardi, ya'ni butun sotuvchi kabineti — mahsulotlar, buyurtmalar, bahs
// javobi, sharhlar — saytda JIMGINA 401 berardi. Bu C1 dagi AYNI tuzoq,
// faqat kengroq: bitta funksiya beshta endpointni qo'riqlaydi.
//
// ⚠️ `tg` endi FAQAT `{ id }` bo'ladi (`requestUser` shakli), `authUser`
// qaytaradigan `first_name`/`username` esa YO'Q. Bu tekshirilgan: chaqiruvchi
// kodda ulardan birortasi ishlatilmaydi — faqat `me.tg.id` (`routes/seller.js`
// da bildirishnoma manzili va tarix `actorTg`). Yangi joyda ism kerak bo'lsa
// u BAZADAN olinsin (`users.full_name`), `initData` dan emas: sayt kanalida
// `initData` umuman yo'q va ism jimgina `undefined` bo'lib qolardi.
async function requireSeller(req, res) {
  const u = await requestUser(req);
  if (!u || !u.id) { fail(res, 'unauthorized', 401); return null; }
  const me = await currentSeller(u);
  if (!me || me.role !== 'seller' || !me.seller_id) { fail(res, 'sotuvchi emas', 403); return null; }
  return { tg: u, ...me };
}

module.exports = {
  verifyInitData, authUser, requestUser, isAdmin, adminPanelAuth,
  currentSeller, requireSeller, sellerAllowed,
};
