# Sprint 5 — Mobil / PWA (Dars 12)

**Holat:** jarayonda

---

## Maqsad

Platformani mobil qurilmalarda ham qulay ishlashini ta'minlash. Ilovani telefonga qo'shib olish imkoniyati (PWA).

---

## Bajariladigan vazifalar

- [ ] Barcha sahifalarni mobil ekran uchun moslashtirish (responsive)
- [x] PWA sozlash: `manifest.json`, service worker, offline sahifa — `telegram-app/` (Mini App) uchun
- [x] "Uy ekraniga qo'shish" (Add to Home Screen) qo'llab-quvvatlash — `telegram-app/pwa.js`
- [ ] Mobil navigatsiya: pastki tab bar (katalog, buyurtmalarim, profil)
- [ ] Rasm yuklash mobil dan ishlashi (kamera orqali)
- [ ] Sensorli ekran uchun tugmalar o'lchami (min 44px)
- [ ] Telegram Mini App sifatida ochilish imkoniyatini tekshirish

---

## Qilingan ishlar

- [2026-07-28] **Mini App PWA'ga aylandi: manifest, service worker, offline sahifa va "uy ekraniga qo'shish" taklifi.** Hammasi `telegram-app/` (serverda `mini-app/`) uchun. **`manifest.json`** (yangi): `start_url` va `scope` nisbiy (`./`) — shuning uchun serverdagi `/mini-app/` yo'l ostida ham to'g'ri ishlaydi, ildizga bog'lanib qolmaydi; `id: "/mini-app/"`, `display: standalone`, `orientation: portrait`, fon/tema rangi `#FFFDFB` (ilovaning krem foni bilan bir xil, ochilishda oq yaltirash bo'lmasin), `lang: uz`. Ikonkalar `assets/pwa/` da: `icon-192.png`, `icon-512.png` (`purpose: any`) va `icon-maskable-512.png` (`purpose: maskable`) — Android ikonkani doira/kvadratga kesganda logo qirqilib ketmasligi uchun alohida maskable variant. **`sw.js`** (yangi): kesh nomi versiyalangan (`lolamarket-mini-v1`, har deploy'da oshiriladi), `activate` da eski kesh butunlay tozalanadi, `skipWaiting` + `clients.claim`, panel/ilova `skip-waiting` xabari bilan yangi SW'ni kutmasdan ishga tushira oladi. Precache ataylab minimal (offline sahifa + ikkita rasm) va `Promise.allSettled` bilan — bitta fayl yuklanmasa ham SW o'rnatilishi buzilmaydi. Strategiya: `/api/` umuman ushlanmaydi, tashqi domenlar (shriftlar, telegram.org) brauzerga qoldiriladi, sahifa ochilishi faqat tarmoqdan (pastdagi qarorga qarang), JS/CSS network-first, rasm/shrift cache-first (orqa fonda yangilanadi). **`offline.html`** (yangi): tashqi shrift va CSS'siz mustaqil sahifa — internet yo'q paytda yuklanadigan sahifa tashqi resursga bog'liq bo'lishi mantiqsiz. **`pwa.js`** (yangi): SW ro'yxatga olish + "uy ekraniga qo'shish" banneri. Banner Telegram ichida ochilganda umuman ko'rsatilmaydi (`tg.platform` tekshiriladi — ilova allaqachon Telegram'ning o'zida turadi) va standalone rejimda ham ko'rsatilmaydi; Android/Chrome'da `beforeinstallprompt` ushlanadi va tugma brauzerning o'z taklifini chaqiradi; iOS Safari'da bunday hodisa yo'q, shuning uchun "Ulashish → Uy ekraniga qo'shish" maslahati beriladi; yopilsa 14 kun qayta chiqmaydi (`localStorage`). Banner pastki navigatsiya balandligini o'lchab uning ustiga qo'yiladi (nav balandligi safe-area padding'ini o'z ichiga oladi, shuning uchun `env()` ustiga qo'shilmaydi), tugmalar 44px, ochilish animatsiyasi `requestAnimationFrame`ga emas majburiy reflow'ga tayanadi — sahifa fonda bo'lsa rAF chaqirilmay banner ko'rinmay qolishi mumkin edi. **`index.html`**: manifest, `theme-color`, ikonka va `apple-mobile-web-app-*` meta teglari qo'shildi, `pwa.js?v=4` ulandi. Tekshirildi (lokal server, brauzer): SW `activated`, `manifest.json` va uchala ikonka 200; server to'xtatilganda sahifa yangilanishida `offline.html` chiqdi, server qayta yoqilganda ilova normal ochildi; banner pastki navigatsiyani to'smaydi, tugmalar 44px, "Qo'shish" bosilganda brauzer o'rnatish taklifi chaqirildi. **Hali qilinmagan (Sprint 5 qolgan vazifalari):** responsive audit, mobil pastki tab bar, kameradan rasm yuklash, 44px tugma auditi — bu commit ularga tegmadi

---

## Qarorlar

- [2026-07-28] Qaror: service worker sahifa ochilishini (navigation) HECH QACHON keshdan bermaydi — faqat tarmoqdan, tarmoq yo'q bo'lsa `offline.html`. Sabab: `app.js` ichida qattiq yozilgan namuna katalog bor (narxlari bilan), keshlangan HTML qaytarilsa internetsiz foydalanuvchi soxta narxlarni haqiqiy deb ko'rardi — bu CLAUDE.md dagi "panelda/ilovada o'ylab topilgan raqam ko'rsatilmasin" qoidasiga zid. Shu sababdan offline holatda ilova "yarim ishlaydigan" ko'rinishda emas, ochiq-oydin "internet yo'q" sahifasi bilan to'xtaydi
- [2026-07-28] Qaror: JS va CSS ham network-first (kesh faqat tarmoq uzilganda zaxira) — deploy'dan keyin foydalanuvchida eski `app.js` keshda qolib ketmasin. `/api/` esa umuman keshlanmaydi: narx, zaxira va buyurtma holati eskirgan bo'lishi mumkin emas. Faqat rasm va shriftlar cache-first
- [2026-07-28] Qaror: manifestda `start_url`/`scope` nisbiy yo'l (`./`) bilan yoziladi, ildizdan boshlanadigan `/` emas. Sabab: repo'dagi `telegram-app/` papkasi serverda `mini-app/` deb ataladi — qattiq yozilgan ildiz yo'li ikkala muhitda ham noto'g'ri bo'lardi
