# Sprint 5 — Mobil / PWA (Dars 12)

**Holat:** jarayonda

---

## Maqsad

Platformani mobil qurilmalarda ham qulay ishlashini ta'minlash. Ilovani telefonga qo'shib olish imkoniyati (PWA).

---

## Bajariladigan vazifalar

- [x] Barcha sahifalarni mobil ekran uchun moslashtirish (responsive) — landing va Mini App 320/375/740×360(yotiq)/768/1280 da audit qilindi, topilgan 6 nuqson tuzatildi. Admin panel (`admin/`) auditga kirmadi — u moderator uchun desktop vositasi
- [x] PWA sozlash: `manifest.json`, service worker, offline sahifa — `telegram-app/` (Mini App) uchun
- [x] "Uy ekraniga qo'shish" (Add to Home Screen) qo'llab-quvvatlash — `telegram-app/pwa.js`
- [x] Mobil navigatsiya: pastki tab bar (katalog, buyurtmalarim, profil) — Mini App'da `#nav`, landing'da `.m-nav` (880px dan tor ekranda)
- [ ] Rasm yuklash mobil dan ishlashi (kamera orqali) — sotuvchi formasida rasm yuklash umuman yo'q (Sprint 4 quyrug'i)
- [x] Sensorli ekran uchun tugmalar o'lchami (min 44px) — landing va Mini App'ning 15 ta ekrani tekshirildi, hammasi 44×44
- [ ] Telegram Mini App sifatida ochilish imkoniyatini tekshirish

---

## Qilingan ishlar

- [2026-09-04] **Katalog rasmlari joyida optimallashtirildi — papka 6.9 MB →
  3.26 MB (−53%), kod va bazaga TEGILMADI.** Avval tezlik o'lchandi (jonli
  `curl` + serverda ssh): backend 4–7 ms — juda tez, bot sog'lom (webhook
  ishlovdan oldin 200, navbat 0), ya'ni sekinlik tarmoq + og'ir rasmlarda edi.
  Eng katta og'irlik `textile-12.png` = 4.3 MB. To'rt fayl qayta siqildi
  (`telegram-app/assets/products/`): `textile-04.jpg` 649→337 KB,
  `textile-08.jpg` 167→107 KB, `textile-11.jpg` 426→223 KB, `textile-12.png`
  4277→962 KB (−78%, 256-rang palitra + Floyd–Steinberg dither). Usul:
  Pillow 11 (scratchpad venv, tizimga tegilmadi), maksimal kenglik 900px —
  PDP retina 2x uchun yetarli (428px CSS × 2 = 856); JPEG q74 progressive.
  `sips` ATAYLAB ishlatilmadi — uning kodeki faylni KATTALASHTIRDI
  (251→324 KB). Qolgan 8 fayl ham sinab ko'rildi: allaqachon zich (q~80,
  ≤850px), qayta siqish 6–9% berib avlod yo'qotishi qo'shardi — jami
  tejamning ~97% i shu 4 faylda edi, shuning uchun ular tegilmadi.
  ⚠️ **`?v=` va `CACHE_VERSION` ATAYLAB oshirilmadi va bu TO'G'RI:** hech
  qanday js/css/html o'zgarmagan; rasmlar versiyalanmaydi (`max-age=14400` —
  jonli sarlavhada tasdiqlandi, 4 soatdan keyin CDN o'zi yangilaydi, eski
  nusxa vizual jihatdan AYNI rasm — zarar yo'q) va PRECACHE ro'yxatida YO'Q
  (hisobotchi ikkala `sw.js` da grep bilan tekshirdi: 0 ta textile).
  Rasm yo'llari/nomlari o'zgarmagani uchun bazadagi e'lonlar ham, `app.js`
  zaxira massivi ham tegilmadi — kengaytma almashtirilsa (masalan .png→.webp)
  baza UPDATE kerak bo'lardi, joyida siqish nol kod / nol baza berdi.
  Sifat ko'z bilan tekshirildi (2 rasm ochib ko'rildi). 91 test yashil
  (hisobotchi o'zi yugurtirdi — birinchi sanoq 92 chiqqan edi, `grep -c "✅"`
  yakuniy «Hammasi PASS» qatorini ham qo'shgan; `✅ Test` bo'yicha qayta
  sanaldi, 2026-09-02 dagi ayni tuzoqning takrori). Botga tegilmadi.

- [2026-09-02] **Maxfiylik siyosati sahifasi (`privacy.html`) — App Store yo'lining
  birinchi kod qadami.** Founder App Store'ga ilova chiqarishni boshladi; Apple
  Developer enrollment jarayoni Privacy Policy URL talab qiladi — endi u
  `https://lolamarket.uz/privacy.html` bo'ladi. Sahifa IKKI tilda (o'zbekcha +
  inglizcha — Apple ko'rikchisi o'qiy olishi uchun), ildizdagi `style.css?v=65`
  tokenlaridan foydalanadi (`index.html` va `admin/index.html` bilan BIR XIL
  versiya — «bitta fayl hamma sahifada bir xil versiya» qoidasi; hisobotchi
  grep bilan o'lchadi), hujjat-maketi esa sahifaning o'z inline `<style>` ida.
  **Matn faqat REAL amaliyotni aytadi** («jimgina yolg'on» oilasidagi qoidalar
  bilan bitta yo'nalish): kimlik faqat Telegram'ning imzolangan kanallari orqali,
  telefon faqat botda o'zi ulashsa, trafik statistikasida xom IP saqlanmasligi va
  kunlik hash (db/028 qarori aynan shu), karta ma'lumoti UMUMAN yig'ilmasligi,
  parol yo'qligi, uchinchi tomonlar ro'yxati (Telegram, Cloudflare, Yandex Maps,
  Google Gemini — hammasi kodda haqiqatan ishlatiladi), HttpOnly sessiya cookie
  bazada hash ko'rinishida. Operator rekviziti: «LOLAMARKET GROUP» MCHJ, STIR
  313296186; bog'lanish — `info@lolamarket.uz` (bugun Cloudflare Email Routing
  bilan ochilgan yangi korporativ pochta). Deploy tekshiruvi uchun sahifada
  unikal belgi `id="privacy-lm"`. **`deploy.yml` ga ikki o'zgarish:** (1) `source`
  ro'yxatiga `privacy.html` qo'shildi — ma'lum tuzoq: yangi ildiz fayli ro'yxatga
  qo'lda qo'shilmasa serverga UMUMAN chiqmaydi va nginx fallback 200 bilan buni
  yashiradi; (2) `check_html /privacy.html 'privacy-lm'` — o'sha qadam
  bajarilganini har deploy'da isbotlaydi. **Hisobotchi mustaqil o'lchadi:** 91
  test yashil (`✅ Test` satrlari sanaldi — Test 16 yangi HTML'ni avtomatik
  qamrab versiya mosligini tasdiqladi); sahifa tayangan ikkala resurs
  (`style.css`, `Photo/logo/lola-mark.png`) diskda bor. **Tekshirilmadi:**
  brauzerda chizilish da'vosi (chaqiruvchi agent lokal serverda ko'rgan) va
  tashqi qadamlar — Apple developer profili, D-U-N-S so'rovi (D&B Tracking
  #10843400, Case #10903271, javob kutilmoqda), pochta ishlashi. **Halol
  chegara:** sahifa production'da hali yo'q — CI push'dan keyin chiqaradi;
  App Store'ga havola sifatida berishdan oldin jonli URL ko'z bilan ochilsin
  (CSP jimgina bloklash darsi).

- [2026-08-13] **PWA ikonkalari brend kvadratiga o'tdi** — `assets/pwa/` dagi
  uchala ikonka (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`)
  endi marun fon (`#7A140D`) ustida oq logo. Manba — yangi
  `Photo/logo/lola-mark-white.png` (asl logodan alfa kanali saqlangan holda
  oq qilingan). `index.html` dagi favicon va `apple-touch-icon` ham eski
  `Photo/logo/loga kvadrat/telegram-cloud-...jpg` dan `assets/pwa/icon-192.png`
  ga o'tkazildi — brauzer tabidagi belgi va uy ekranidagi ikonka endi bitta
  fayl. ⚠️ `icon-192.png` landing `sw.js` PRECACHE ro'yxatida turadi, tarkibi
  o'zgardi — shuning uchun `CACHE_VERSION v3 → v4` oshirildi (bu qoidani
  Test 17 qo'riqlaydi: ro'yxatdagi fayl ichi o'zgarsa versiya oshmaguncha
  test qizil). Ikonkalar serverga `scp` bilan chiqarilgan va jonli
  tasdiqlangan manifest, service worker, offline sahifa va "uy ekraniga qo'shish" taklifi.** Hammasi `telegram-app/` (serverda `mini-app/`) uchun. **`manifest.json`** (yangi): `start_url` va `scope` nisbiy (`./`) — shuning uchun serverdagi `/mini-app/` yo'l ostida ham to'g'ri ishlaydi, ildizga bog'lanib qolmaydi; `id: "/mini-app/"`, `display: standalone`, `orientation: portrait`, fon/tema rangi `#FFFDFB` (ilovaning krem foni bilan bir xil, ochilishda oq yaltirash bo'lmasin), `lang: uz`. Ikonkalar `assets/pwa/` da: `icon-192.png`, `icon-512.png` (`purpose: any`) va `icon-maskable-512.png` (`purpose: maskable`) — Android ikonkani doira/kvadratga kesganda logo qirqilib ketmasligi uchun alohida maskable variant. **`sw.js`** (yangi): kesh nomi versiyalangan (`lolamarket-mini-v1`, har deploy'da oshiriladi), `activate` da eski kesh butunlay tozalanadi, `skipWaiting` + `clients.claim`, panel/ilova `skip-waiting` xabari bilan yangi SW'ni kutmasdan ishga tushira oladi. Precache ataylab minimal (offline sahifa + ikkita rasm) va `Promise.allSettled` bilan — bitta fayl yuklanmasa ham SW o'rnatilishi buzilmaydi. Strategiya: `/api/` umuman ushlanmaydi, tashqi domenlar (shriftlar, telegram.org) brauzerga qoldiriladi, sahifa ochilishi faqat tarmoqdan (pastdagi qarorga qarang), JS/CSS network-first, rasm/shrift cache-first (orqa fonda yangilanadi). **`offline.html`** (yangi): tashqi shrift va CSS'siz mustaqil sahifa — internet yo'q paytda yuklanadigan sahifa tashqi resursga bog'liq bo'lishi mantiqsiz. **`pwa.js`** (yangi): SW ro'yxatga olish + "uy ekraniga qo'shish" banneri. Banner Telegram ichida ochilganda umuman ko'rsatilmaydi (`tg.platform` tekshiriladi — ilova allaqachon Telegram'ning o'zida turadi) va standalone rejimda ham ko'rsatilmaydi; Android/Chrome'da `beforeinstallprompt` ushlanadi va tugma brauzerning o'z taklifini chaqiradi; iOS Safari'da bunday hodisa yo'q, shuning uchun "Ulashish → Uy ekraniga qo'shish" maslahati beriladi; yopilsa 14 kun qayta chiqmaydi (`localStorage`). Banner pastki navigatsiya balandligini o'lchab uning ustiga qo'yiladi (nav balandligi safe-area padding'ini o'z ichiga oladi, shuning uchun `env()` ustiga qo'shilmaydi), tugmalar 44px, ochilish animatsiyasi `requestAnimationFrame`ga emas majburiy reflow'ga tayanadi — sahifa fonda bo'lsa rAF chaqirilmay banner ko'rinmay qolishi mumkin edi. **`index.html`**: manifest, `theme-color`, ikonka va `apple-mobile-web-app-*` meta teglari qo'shildi, `pwa.js?v=4` ulandi. Tekshirildi (lokal server, brauzer): SW `activated`, `manifest.json` va uchala ikonka 200; server to'xtatilganda sahifa yangilanishida `offline.html` chiqdi, server qayta yoqilganda ilova normal ochildi; banner pastki navigatsiyani to'smaydi, tugmalar 44px, "Qo'shish" bosilganda brauzer o'rnatish taklifi chaqirildi. **Hali qilinmagan (Sprint 5 qolgan vazifalari):** responsive audit, mobil pastki tab bar, kameradan rasm yuklash, 44px tugma auditi — bu commit ularga tegmadi

- [2026-07-28] **Production'ga deploy qilindi va deploy paytida `sw.js` keshlanishi nuqsoni topildi — brauzer tomoni yopildi, server tomoni ochiq qoldi.** `telegram-app/` rsync orqali `/var/www/lolamarket/mini-app/` ga ko'chirildi; jonli tekshiruv: service worker `activated` (scope `https://lolamarket.uz/mini-app/`), `manifest.json` va uchala ikonka 200. **Topilgan nuqson:** serverdagi nginx `sw.js` ni `Cache-Control: max-age=14400` bilan beradi va Cloudflare uni keshlaydi (`cf-cache-status: HIT`) — ya'ni kelajakda `sw.js` o'zgartirilsa foydalanuvchilarda eski service worker soatlab qolib ketishi mumkin edi. Bu ayniqsa xavfli, chunki service worker o'zi keshlash siyosatini boshqaradi: eskisi qolib ketsa uni oddiy deploy bilan tuzatib ham bo'lmaydi. **Tuzatildi (brauzer tomoni):** `pwa.js` da ro'yxatga olish `navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })` ga o'tkazildi — brauzer SW faylini yangilash tekshiruvida HTTP keshdan olmaydi; `index.html` da kesh-bust `pwa.js?v=4` → `?v=5`. Ikkala fayl serverga ham yuklandi. **Hali qilinmagan (ochiq ish):** nginx/Cloudflare tomoni — `sw.js` uchun `Cache-Control: no-cache` (yoki `max-age=0, must-revalidate`) kerak, hozircha `max-age=14400` qolyapti. Nginx konfiguratsiyasi CLAUDE.md qoidasiga ko'ra qo'lda boshqariladi va CI/CD tegmaydi, shuning uchun bu commit'da o'zgartirilmadi — serverda alohida qilinishi kerak. `updateViaCache` faqat brauzer tomonini yopadi, CDN'dagi eski nusxani emas

- [2026-07-29] **Responsive audit va 44px sensorli maydon auditi — landing va Mini App.** Tekshiruv brauzerda o'lchov bilan o'tkazildi (har bir bosiladigan element `getBoundingClientRect` + `::after` qoplamasi bo'yicha; gorizontal toshib ketish ota-element chegarasiga nisbatan), kengliklar: 320, 375, 740×360 (yotiq), 768, 1280.

  **Landing — topilgan va tuzatilgan nuqsonlar (`style.css`):** (1) savat qatoridagi narx tanlagich yoniga sig'masdi va kartochkadan chiqib ketardi — 375px'da "2 550 000 so'm" qirqilgan holda ko'rinardi; `.cart-line-bot` endi o'raladi, narx o'z qatoriga tushadi. (2) Toast pastki navigatsiya ustiga tushardi (toast 756–798, nav 736–794) — endi `bottom: calc(var(--dock-h) + 10px)`, 880px'dan keyin eski 28px. (3) Toast `left:50% + translateX(-50%)` bilan yozilgani uchun qutining eni ekranning yarmi bilan cheklanardi va qisqa xabar ham ikki qatorga bo'linardi (uzunroq xabarda 42px fondan chiqib ketardi) — `left/right + margin:auto + min-height` ga o'tkazildi. (4) Kartochkadagi miqdor tanlagichda "7 dona" ikki qatorga bo'linardi (2 ustunli gridda kartochka ~166px) — `white-space:nowrap` + 640px'gacha ixchamroq tanlagich. (5) `viewport-fit=cover` bo'lsa ham `env(safe-area-inset-*)` ishlatilmagan edi — yotiq holatda "tishli" telefonda kontent kesik ostiga kirardi; `.container`, `.m-nav`, `.drawer`, `.drawer-body` ga qo'shildi. (6) Yotiq telefonda (≤430px bo'y) qadalgan header 115px + dock 86px ekranning uchdan ikkisini yeb qo'yardi — bunday ekranda header endi qadalmaydi. Yana: langar ofseti mobil header balandligiga moslandi (80px → 132px), `.drawer` eni `100vw` → `100%` (skrollbar bor brauzerda toshib ketardi), qidiruv inputi qutining butun bo'yini egallaydi (ilgari 21px edi, quti 42px — chekkasi "o'lik zona").

  **44px maydon (landing):** header boshqaruvlari 42 → 44px. Kichik ikonka tugmalar (kategoriya chipi 34, yurakcha 34, savat qatoridagi ×19, miqdor tugmalari 28–34, ijtimoiy tarmoq 36, "Savatga qaytish" 20) KATTALASHTIRILMADI — dizayn o'zgarmasin uchun ko'rinmas `::after` qoplamasi maydonni 44×44 ga yetkazadi. Istisno: qidiruvni tozalash tugmasi haqiqiy o'lchamda kattaytirildi, chunki qoplama input ustiga tushib matn oxiriga bosishni to'sardi.

  **Mini App:** tugmalarning ko'pi `app.js` ichida inline uslub bilan yasalgani uchun qoida global (`button::after` + `.tap44`). Tuzatildi: header ikonkasi 38, katalog yurakchasi 32, "+" 32, til tugmalari 26, "Barchasi ›" 17px, profildagi bildirishnoma tumbleri va ikkita ijtimoiy havola 32px, BTS qidiruv qutisi 41 → 44px. Yon ta'sir topildi va yopildi: gorizontal chip lentalarida 44px qoplama vertikal skroll hosil qilardi — lentalarga bo'y bo'shlig'i berildi. Mini App toasti ham landing'dagi kabi tuzatildi (`nowrap` + `left:50%` da uzun xabar ekrandan chiqardi).

  **Natija:** landing (katalog / savat / checkout / saralanganlar) va Mini App'ning 15 ta ekranida 44×44 dan kichik bosiladigan element qolmadi; gorizontal toshib ketish yo'q. Ataylab qoldirilgani: qidiruv inputining o'zi 42px (uni o'rab turgan quti 44px va input butun ichki maydonni egallaydi).

- [2026-07-30] **Landing (lolamarket.uz) ham PWA'ga aylantirildi** — 2026-07-28'dagi naqsh (ilgari faqat `telegram-app/`/Mini App uchun edi) endi root darajasida ham qo'llandi: yangi `manifest.json`, `sw.js`, `offline.html`, `pwa.js`, `assets/pwa/{icon-192,icon-512,icon-maskable-512}.png` (Mini App'dan ko'chirilgan, bir xil brend belgisi). `index.html`ga manifest/meta teglar va `pwa.js` skripti ulandi; "uy ekraniga qo'shish" banneri `.m-nav` (mobil pastki navigatsiya) ustida to'g'ri joylashadigan qilib moslashtirildi. Lokal serverda brauzerda tekshirildi: manifest to'g'ri o'qiladi, SW ro'yxatdan o'tadi va keshlaydi, offline.html to'g'ri ko'rsatiladi, banner mobil ekranda joyida. **Yo'l-yo'lakay** bir nechta og'ir landing rasmi siqildi/qayta o'lchamlandi (`Photo/Main/hero-fabrics.jpg` — eski 7.8MB PNG endi 413KB JPEG'ga almashtirildi, `banner-mato.jpg` 692K→300K, `IMG_0147.JPG` 161K→23K, `IMG_0408.JPG` 28K→3K, ikkita textile rasm ~150–100K kamaydi) — Sprint 8'dagi "Sahifalar yuklanish tezligi" bandiga tegishli tayyorgarlik, lekin haqiqiy yuklanish vaqti hali o'lchanmagan. **Hali qilinmagan:** production'ga deploy, kameradan rasm yuklash, Mini App'ning Telegram ichida ochilishini tekshirish

- [2026-07-30] **Service worker jonli saytda ro'yxatdan o'tmayotgan ekan — `load` hodisasiga
  bog'liqlik olib tashlandi** (commit `5ffe1f0`). CI va Cloudflare tuzatilib fayllar serverga yetib
  borgandan keyin ham (`sprint-1.md`ga qarang) landing PWA ishlamadi: fayllar joyida, konsolda xato
  yo'q, lekin SW ro'yxatdan o'tmagan. **Sabab:** `pwa.js` da ro'yxatdan o'tkazish faqat
  `window.addEventListener('load', ...)` ichida edi. Agar skript `load` hodisasidan KEYIN ijro etilsa
  (bfcache'dan tiklanish, skriptning kech ijro etilishi), listener hech qachon otilmaydi va SW jimgina
  ro'yxatdan o'tmay qoladi — **hech qanday xato chiqmaydi**, aynan shuning uchun uzoq vaqt sezilmagan.
  **Tuzatish:** `whenReady()` yordamchisi — `document.readyState === 'complete'` bo'lsa funksiya darhol
  chaqiriladi, aks holda odatdagidek `load` kutiladi. Bir xil mo'rtlik `telegram-app/pwa.js` da ham bor
  edi (u tasodifan ishlab turgandi) — ikkalasida ham, SW bloki bilan birga iOS "uy ekraniga qo'shish"
  banneri bloki ham `whenReady()` ga o'tkazildi. Kesh-bust: landing `pwa.js?v=1` → `?v=2`, Mini App
  `pwa.js?v=5` → `?v=6`. **Tasdiqlash:** `pwa.js` ataylab `load` dan KEYIN ishga tushirilib sinaldi —
  eski kodda SW ro'yxatdan o'tmaydi, yangisida o'tadi; oddiy sahifa yuklanishida ham alohida
  tasdiqlandi. Jonli saytdagi yakuniy natija: `scope: https://lolamarket.uz/`, `active: true`, kesh
  `lolamarket-web-v1` yaratildi. **Yopilgan ochiq ish:** 2026-07-28 dagi "nginx/Cloudflare tomonida
  `sw.js` uchun `Cache-Control: no-cache` kerak" bandini founder qo'lda bajardi — nginx'ga `/sw.js` va
  `/manifest.json` uchun no-cache qoidalari qo'shildi (kanonik nusxa serverda:
  `/etc/nginx/sites-available/lolamarket`) va Cloudflare keshi tozalandi

---

## Qarorlar

- [2026-09-02] Qaror: **App Store yo'li ochildi va maxfiylik siyosati FAQAT real
  amaliyotni yozadi.** Founder ilovani App Store'ga chiqarishni boshladi
  (developer profili, `info@lolamarket.uz` pochta, D-U-N-S so'rovi). Privacy
  Policy matniga «kelajakda qilamiz» yoki umumiy shablon bandlari ATAYLAB
  kiritilmadi — har band kodda hozir bor narsaga tayanadi (kunlik hash,
  HttpOnly cookie, karta yig'ilmasligi). Sabab: sahifa huquqiy va'da, kod esa
  o'zgaradi — amaliyot o'zgarsa SAHIFA HAM yangilanishi shart (sana bilan),
  aks holda u «jimgina yolg'on» oilasiga qo'shilardi.

- [2026-07-30] Qaror: **sahifa hayot sikliga bog'liq har qanday kod `load` hodisasiga BEVOSITA
  bog'lanmaydi** — avval `document.readyState` tekshiriladi (`whenReady()` naqshi). Sabab: `load`
  allaqachon o'tgan bo'lsa listener hech qachon otilmaydi va kod JIMGINA bajarilmay qoladi — xato ham,
  ogohlantirish ham chiqmaydi. Service worker'da bu ayniqsa yomon: PWA butunlay ishlamay turadi, lekin
  tashqaridan hammasi joyidagidek ko'rinadi
- [2026-07-29] Qaror: kichik ikonka tugmalar VIZUAL kattalashtirilmaydi — bosish maydoni ko'rinmas `::after` qoplamasi bilan 44×44 ga yetkaziladi. Sabab: dizayn tizimi (34px yurakcha, 32px "+") Mini App va landing'da bir xil, ularni kattalashtirish ikkala mahsulotning ko'rinishini buzardi. Qoplama tugmaning O'Z ichida yotadi, shuning uchun unga bosish baribir shu tugmani ishga tushiradi. Yonma-yon tiqilgan boshqaruvlarda (chip lentalari) faqat bo'y kengaytiriladi — kenglik oshsa qo'shni elementning maydoniga kirib ketardi
- [2026-07-29] Qaror: matn kiritish maydoni ustiga qoplama qo'yilmaydi. Sabab: qidiruvni tozalash tugmasining 44px qoplamasi input ustiga tushib, matn oxiriga kursor qo'yishni to'sardi — bunday joyda tugma haqiqiy o'lchamda kattaytiriladi va manfiy `margin` bilan ko'rinishi joyida qoldiriladi
- [2026-07-28] Qaror: service worker sahifa ochilishini (navigation) HECH QACHON keshdan bermaydi — faqat tarmoqdan, tarmoq yo'q bo'lsa `offline.html`. Sabab: `app.js` ichida qattiq yozilgan namuna katalog bor (narxlari bilan), keshlangan HTML qaytarilsa internetsiz foydalanuvchi soxta narxlarni haqiqiy deb ko'rardi — bu CLAUDE.md dagi "panelda/ilovada o'ylab topilgan raqam ko'rsatilmasin" qoidasiga zid. Shu sababdan offline holatda ilova "yarim ishlaydigan" ko'rinishda emas, ochiq-oydin "internet yo'q" sahifasi bilan to'xtaydi
- [2026-07-28] Qaror: JS va CSS ham network-first (kesh faqat tarmoq uzilganda zaxira) — deploy'dan keyin foydalanuvchida eski `app.js` keshda qolib ketmasin. `/api/` esa umuman keshlanmaydi: narx, zaxira va buyurtma holati eskirgan bo'lishi mumkin emas. Faqat rasm va shriftlar cache-first
- [2026-07-28] Qaror: manifestda `start_url`/`scope` nisbiy yo'l (`./`) bilan yoziladi, ildizdan boshlanadigan `/` emas. Sabab: repo'dagi `telegram-app/` papkasi serverda `mini-app/` deb ataladi — qattiq yozilgan ildiz yo'li ikkala muhitda ham noto'g'ri bo'lardi
- [2026-07-28] Qaror: `sw.js` ning o'zi hech qachon keshdan olinmasin — ro'yxatga olishda `updateViaCache: 'none'` majburiy. Sabab: service worker keshlash siyosatini o'zi boshqaradi, shuning uchun eski SW keshda qolib ketsa uni oddiy deploy bilan tuzatib bo'lmaydi — foydalanuvchi soatlab eski mantiq bilan qoladi. Buning to'liq bo'lishi uchun serverda ham `sw.js` uchun `Cache-Control: no-cache` kerak (hozircha `max-age=14400`, Cloudflare keshlayapti) — nginx qo'lda boshqarilgani uchun bu alohida bajariladigan ochiq ish
