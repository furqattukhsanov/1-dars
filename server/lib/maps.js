const { YANDEX_MAPS_KEY, MAPS_ENABLED } = require('../config');

// ============ KARTA VA OLISH NUQTASI ============
// Profildagi "Mening manzilim" bo'limining server tomoni (2026-08-13).

// ---- Nuqta id shakli ----
// ⚠️ RO'YXAT EMAS, SHAKL tekshiriladi. Nuqtalar ro'yxati hozir frontendda
// yashaydi (`BTS_POINTS` — `script.js` va `telegram-app/app.js`), chunki BTS
// API ulanmagan. Uni bu yerga UCHINCHI nusxa qilib ko'chirish CLAUDE.md
// ataylab ogohlantirgan naqsh bo'lardi: `admin_actions_kind_check` da aynan
// shu tishlagan — qiymat qo'shilgan, ikkinchi ro'yxat yangilanmay qolgan va
// funksiya production'da JIMGINA ishlamagan (`db/014`).
//
// Bu maydon xaridorning O'Z tanlovi, ya'ni noto'g'ri id — xavf emas, shunchaki
// frontend "tanlanmagan" ko'rsatadi. Shakl tekshiruvining vazifasi boshqa:
// bazaga uzun yoki begona matn tushmasin va bu qiymat keyin biror joyda
// yo'l/kalit sifatida ishlatilib qolmasin.
const PICKUP_ID_RE = /^bts-\d{3}$/;

function isPickupPointId(v) {
  return typeof v === 'string' && PICKUP_ID_RE.test(v);
}

// ---- Klientga ketadigan sozlama ----
// `aiClientConfig()` (`lib/ai.js`) bilan AYNI naqsh va AYNI sabab: blok qo'lda
// yig'ilsa u faqat bitta kanalga (Mini App yoki sayt) borib qolardi. Ikkala
// kanal ham SHU funksiyani chaqiradi.
//
// ⚠️ Kalit o'chiq bo'lsa `null` yuboriladi, bo'sh satr EMAS: bo'sh satr
// "kalit bor, lekin bo'sh" degan mavjud bo'lmagan holatni yaratardi
// (`NULL` reyting qoidasi bilan bitta oila — yo'qlik KO'RINSIN).
function mapsClientConfig() {
  return {
    mapsEnabled: MAPS_ENABLED,
    mapsKey: MAPS_ENABLED ? YANDEX_MAPS_KEY : null,
  };
}

module.exports = { isPickupPointId, mapsClientConfig, PICKUP_ID_RE };
