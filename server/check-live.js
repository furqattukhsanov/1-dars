const https = require('https');
const { readRoutes } = require('./lib/routes-list');

// ============ JONLI TEKSHIRUV: nginx hamma route'ni uzatadimi? ============
// Ishlatish: npm run check:live
//
// MUAMMO shu vosita hal qiladi:
// nginx'da har bir /api yo'li ALOHIDA yozilgan. Router'ga yangi endpoint
// qo'shilsa-yu, nginx'ga qo'shilmasa — so'rov serverga umuman yetib bormaydi.
// nginx o'rniga oddiy sayt sahifasini (HTML) qaytaradi va HTTP 200 beradi.
//
// Ya'ni nosozlik "200 OK" niqobi ostida keladi: brauzerda xato ko'rinmaydi,
// faqat javob JSON emas, HTML bo'ladi. Aynan shu 2026-07-29 da /api/version
// bilan yuz berdi — endpoint yozilgan, deploy qilingan, lekin nginx uni
// bilmagani uchun ishlamagan.
//
// Tekshiruv mantig'i: javob Content-Type'i JSON bo'lsa — so'rov serverga
// yetdi (status 401/405/400 bo'lishi mumkin, muhimi emas). HTML bo'lsa —
// nginx uzatmadi.

const HOST = process.env.CHECK_HOST || 'lolamarket.uz';
const TIMEOUT_MS = 8000;

function head(path) {
  return new Promise((resolve) => {
    const req = https.request(
      { hostname: HOST, path, method: 'GET', timeout: TIMEOUT_MS },
      (res) => {
        res.resume(); // tanani tashlab yuboramiz — bizga faqat sarlavha kerak
        resolve({ status: res.statusCode, type: res.headers['content-type'] || '' });
      }
    );
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, type: 'timeout' }); });
    req.on('error', (e) => resolve({ status: 0, type: 'error: ' + e.message }));
    req.end();
  });
}

async function main() {
  const routes = readRoutes();
  console.log(`\n🌐 Jonli tekshiruv — ${HOST} (${routes.length} ta route)\n`);

  const results = await Promise.all(routes.map(async (p) => ({ path: p, ...(await head(p)) })));

  // Uch xil natijani ajratamiz. Tarmoq uzilishini "nginx uzatmadi" deb
  // ko'rsatish xato bo'lardi — u odamni bekorga nginx tahririga yuboradi.
  const reachable = results.filter((r) => /json/i.test(r.type));
  const netError  = results.filter((r) => !/json/i.test(r.type) && r.status === 0);
  const blocked   = results.filter((r) => !/json/i.test(r.type) && r.status !== 0);

  reachable.forEach((r) => console.log(`  ✅ ${r.path}  (${r.status})`));

  if (netError.length) {
    console.log('');
    netError.forEach((r) => console.log(`  ⚠️  ${r.path}  — tarmoq javob bermadi (${r.type})`));
    console.log('\n⚠️  Tarmoq nosozligi — bu nginx muammosi EMAS. Qayta yuguring.\n');
    process.exit(2);
  }

  if (blocked.length) {
    console.log('');
    blocked.forEach((r) => console.log(`  ❌ ${r.path}  — nginx uzatmadi (${r.status}, ${r.type})`));
    console.log(`\n❌ ${blocked.length} ta route serverga yetib bormayapti.`);
    console.log('   nginx konfiguratsiyasiga qo\'shish kerak — server/README.md ga qarang.\n');
    process.exit(1);
  }

  console.log(`\n✅ Hamma route serverga yetib boryapti (${reachable.length}/${routes.length})\n`);
}

main();
