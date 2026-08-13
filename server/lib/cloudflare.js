const https = require('https');
const { CF_API_TOKEN, CF_ZONE_ID, CF_PURGE_ENABLED } = require('../config');

// ============ CLOUDFLARE CDN KESHINI TOZALASH ============
// NEGA UMUMAN KERAK: 2026-08-09 da o'lchangan — obyekt R2 dan o'chirilgandan
// KEYIN ham `cdn.lolamarket.uz` uni `cf-cache-status: HIT` bilan berib turadi.
// Ya'ni **o'chirish faylni internetdan olib tashlamaydi**. Video moderatsiyasi
// uchun bu farq hal qiluvchi: nomaqbul video ilovadan yo'qoladi-yu, to'g'ridan-
// to'g'ri havola bilan hamon ochilaveradi.
//
// Kutubxona qo'shilmadi — bitta POST so'rov (`lib/r2.js` dagi bilan bir xil
// mulohaza: katta bog'liqlik yangilanishi, auditdan o'tishi va deploy hajmini
// ko'tarishi kerak bo'lardi).
//
// ⚠️ Token faqat SHU modulda ishlatiladi — bot tokeni va R2 kalitlari bilan
// bitta naqsh: sir bitta joyda yashaydi va tarqamaydi.

const MAX_URLS = 30;

/* Berilgan URL larni keshdan tozalaydi.

   Qaytaradi: `{ ok, sabab }` — `ok:false` bo'lsa chaqiruvchi buni ODAMGA
   AYTISHI shart. Bu ataylab `throw` emas: purge yiqilishi videoni o'chirish
   amalini BEKOR QILMASLIGI kerak (video allaqachon bazadan va R2 dan ketgan,
   ya'ni ilovada ko'rinmaydi), lekin natija JIMGINA "muvaffaqiyat" ham
   bo'lmasligi kerak — aynan shu farq `ALERT_CHAT_ID` darsining o'zi. */
function purgeUrls(urls) {
  const ro = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
  if (!ro.length) return Promise.resolve({ ok: true, sabab: null });
  if (ro.length > MAX_URLS) return Promise.resolve({ ok: false, sabab: `juda ko'p URL (${ro.length})` });
  if (!CF_PURGE_ENABLED) return Promise.resolve({ ok: false, sabab: 'sozlanmagan' });

  const body = JSON.stringify({ files: ro });
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        // ⚠️ HTTP 200 YETARLI EMAS: Cloudflare xatoni ham 200 bilan qaytarib,
        // tanadagi `success: false` da aytishi mumkin. Faqat kodga qarash
        // "tozalandi" degan yolg'on ishonch berardi.
        let ok = false, sabab = `HTTP ${res.statusCode}`;
        try {
          const j = JSON.parse(data);
          ok = j.success === true;
          if (!ok) sabab = (j.errors && j.errors[0] && j.errors[0].message) || sabab;
        } catch (e) { sabab = 'javob buzuq'; }
        resolve({ ok, sabab: ok ? null : sabab });
      });
    });
    // Tarmoq xatosi ham JIM o'tmaydi — sababi qaytariladi.
    req.on('error', (e) => resolve({ ok: false, sabab: e.message }));
    req.setTimeout(15_000, () => req.destroy(new Error('purge vaqti tugadi')));
    req.write(body);
    req.end();
  });
}

module.exports = { purgeUrls, CF_PURGE_ENABLED };
