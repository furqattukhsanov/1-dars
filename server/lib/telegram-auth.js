const crypto = require('crypto');

// ============ TELEGRAM initData IMZOSINI TEKSHIRISH ============
// Telegram Mini App yuborgan initData'ni bot token bilan tekshiradi.
// Imzo to'g'ri bo'lsa foydalanuvchi obyektini qaytaradi, aks holda null.
// Hujjat: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
//
// Alohida modulga chiqarilgan — server.js ham, test.js ham shu bir joydan
// import qiladi, shuning uchun testlar production kodning nusxasini emas,
// haqiqiy kodni tekshiradi.
function verifyInitData(initData, botToken, maxAgeSec = 86400) {
  try {
    if (!initData || typeof initData !== 'string') return null;
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    params.delete('hash');

    // hash'dan tashqari barcha kalit=qiymat larni alifbo tartibida \n bilan birlashtiramiz
    const pairs = [];
    for (const [k, v] of params) pairs.push(`${k}=${v}`);
    pairs.sort();
    const dataCheckString = pairs.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    // Doimiy vaqtli taqqoslash (timing attack'dan himoya)
    const a = Buffer.from(computed, 'hex');
    const b = Buffer.from(hash, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    // auth_date eskirganmi? (standart 24 soat)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    if (maxAgeSec && authDate && Date.now() / 1000 - authDate > maxAgeSec) return null;

    const userJson = params.get('user');
    if (!userJson) return null;
    return JSON.parse(userJson); // { id, first_name, last_name, username, ... }
  } catch (e) {
    return null;
  }
}

module.exports = { verifyInitData };
