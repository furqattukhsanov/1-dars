# Sprint 4 — Asosiy funksiya (Dars 11)

**Holat:** jarayonda

---

## Maqsad

LolaMarket ning yuragi — xaridor rulonni topadi, buyurtma beradi, escrow orqali to'laydi, BTS orqali oladi. Bu sprintdan keyin platforma ishlaydi.

---

## Bajariladigan vazifalar

### Katalog (Xaridor)

> **Bu bo'lim 2026-07-31 da qayta o'qildi.** Bandlar Next.js rejasi uchun yozilgan
> (`/katalog`, `/mahsulot/[slug]` marshrutlari), mahsulot esa statik landing + Telegram
> Mini App bo'lib chiqdi. Quyida marshrut nomi emas, FUNKSIYA bor-yo'qligi belgilangan —
> har biri brauzerda tekshirildi.

- [x] Mahsulotlar ro'yxati — **alohida `/katalog` marshruti kerak emas va qurilmaydi.**
  Landing'da `#product-grid` bo'limi (12 mahsulot), Mini App'da "Katalog" tabi
- [x] Filtr: kategoriya (chit / atlas / gilam / sitsa) + narx oralig'i
  — **TO'LIQ (2026-07-31):** kategoriya chipi ikkala klientda ishlaydi (landing'da
  brauzerda tekshirildi: "Ikat va adras" bosilganda 12 tadan 2 tasi qoldi, chip `is-active`
  bo'ldi), landing'da qidiruv ham bor. **Narx oralig'i shu kuni qo'shildi** — Mini App'da
  bottom-sheet (`openPriceSheet`), landing'da chiplar ostidagi "dan – gacha" maydonlari;
  uchala filtr (kategoriya + qidiruv + narx) kesishib ishlaydi. Pastdagi "Qilingan
  ishlar"ga qarang. ⚠️ Mini App'dagi **"Saralash" tugmasi hamon o'lik** — u bu bandga
  kirmaydi, alohida ish sifatida ochiq qoladi
- [x] Mahsulot kartochkasi: rasm, kategoriya, narx/rulon, rulon soni, ishlab chiqaruvchi
  reytingi — hammasi bor (zaxira soni 2026-07-30 da qo'shilgan `stockView(p)` bilan).
  Reyting 2026-07-31 da HAQIQIYga aylantirildi — soxta seed sonlari o'chirildi,
  reyting endi faqat sharhlardan hisoblanadi (pastdagi yozuvga qarang)
- [x] Mahsulot detail sahifasi: to'liq ma'lumot + "Buyurtma berish" tugmasi
  — **Mini App'da bor** (`openProduct(id)` → `S.screen='detail'`), **landing'da ham
  bor** (2026-07-31 da qurildi — founder "albatta kerak" dedi): `openDetail(id)`,
  drawer'ning yangi ko'rinishi. Alohida sahifa ATAYLAB qurilmadi — marshrutlash,
  yangi HTML fayl va CI `source` ro'yxati tuzog'i kerak bo'lmasin

### Buyurtma oqimi
- [x] Rulon soni tanlash (minimum 1)
- [ ] Eng yaqin BTS nuqtasini ko'rsatish (telefon/manzil asosida)
  — **YARIM (2026-08-12): nuqta ro'yxatdan TANLANADI, lekin "eng yaqini" hamon
  o'zi topilmaydi.** Shu kunga qadar saytda umuman ro'yxat yo'q edi — xaridor
  manzilni erkin matn bilan yozardi va u BTS nuqtasi bo'lishi ham shart emasdi.
  Endi ikkala kanalda AYNI ro'yxat turadi (5 viloyat, 9 nuqta) va tanlov ikkalasi
  uchun umumiy (`localStorage` → `lolamarket_bts_point`). Band OCHIQ qoladi, chunki
  bandda yozilgani "ko'rsatish" emas, **"eng yaqinini telefon/manzil asosida
  aniqlash"** — u hozir ham yo'q va uni "bajarildi" deb belgilash bandning o'zini
  yolg'onga aylantirardi.
  — **YANA BIR QADAM (2026-08-13):** nuqta endi KARTADA ko'rinadi (profil →
  "Mening manzilim") va tanlov `localStorage` dan BAZAGA ko'chdi
  (`users.pickup_point_id`, `db/022`), ya'ni u telefon va kompyuterda bir xil.
  Kartada `geolocationControl` bor — xaridor O'ZI qayerdaligini ko'radi va
  eng yaqinini KO'Z bilan tanlaydi. Band baribir OCHIQ: bu "ko'rsatish",
  **avtomatik aniqlash emas**. 🔴 Ustiga koordinatalar TAXMINIY (tuman markazi
  aniqligida, BTS API ulanmagan) — shuning uchun karta ustida doimiy
  ogohlantirish turadi va u haqiqiy koordinata kelmaguncha olinmaydi
- [x] Buyurtma xulosasi: mahsulot narxi + logistika narxi alohida — taxminiy summa (`DELIVERY_FEE_ESTIMATE`), jamiga qo'shilmaydi
- [ ] Buyurtma tasdiqlash → `orders` jadvalida `created` holati

### To'lov (Escrow)
- [x] 50% oldindan to'lov modeli serverda hisoblanadi — `PREPAY_RATE` (env orqali sozlanadi, default 0.5), `orders.prepay_amount` / `orders.rest_amount` ustunlari, `/api/orders` javobida `total` / `prepay` / `rest`
- [ ] Payme integratsiyasi: to'lov tugmasi → Payme → webhook → `paid` holati
- [ ] Click integratsiyasi: xuddi shunday oqim
- [ ] To'lov muvaffaqiyatli bo'lsa escrow-hold yoziladi
- [ ] Idempotent webhook: ikki marta hisoblashni bloklash

### Ishlab chiqaruvchi kabineti
- [x] Yangi buyurtma bildirishnomasi (Telegram) — sotuvchiga xabar boradi, unda oldindan to'langan va qolgan summa alohida qatorlarda
- [x] Buyurtmani tasdiqlash: `confirmed` holati — `POST /api/seller/orders` (`accept`), rad etish ham (`reject`)
- [x] "Yo'lga chiqdi" + BTS tracking raqami kiritish: `shipped` holati — `ship` amali trek raqamini `orders.tracking_code` ga yozadi va xaridorga xabar yuboradi

### Mahsulot boshqaruvi (Ishlab chiqaruvchi)
- [x] Mahsulot qo'shish: kategoriya, narx, MOQ, tarkib — Mini App'dagi `s-form` ekrani orqali
- [x] Mahsulot rasmi — bot orqali (Telegram file_id, disputes bilan bir xil HMAC-proksi naqshi)
- [ ] Mahsulot **videosi** — bot orqali (qisqa video: matoning tovlanishi va to'qimasi
  rasmdan yaxshi ko'rinadi)
  — **QABUL, SAQLASH, KO'RSATISH va O'CHIRISH TAYYOR (2026-08-13).**
  Sotuvchi botga video yuboradi, u R2 ga tushadi va bazaga yoziladi (`db/023`),
  admin panelda ko'rinadi, xaridor uni media galereyaning 2-slaydida ko'radi
  (D bosqichi), nomaqbul video esa `video_remove` amali bilan olib tashlanadi
  (`db/024`). **Band OCHIQ qoladi BITTA sabab bilan:** C bosqichi — sotuvchi
  O'Z videosini kabinetda ko'rmaydi va qayta yubora olmaydi (faqat bot orqali
  bilvosita). O'lchandi: `renderProductForm()` tanasida `video` so'zi **0
  marta** uchraydi. Bandni hozir `[x]` qilish "hammasi ishlayapti" degan
  yolg'on tasavvur berardi. Pastdagi "Qilingan ishlar"ga qarang

  ✅ **DEPLOY QILINGAN va PRODUCTION'DA O'LCHANDI (2026-08-13).** Bu yerda
  ilgari ikkinchi sabab sifatida «deploy qilinmagan — repodagi kod xaridor
  uchun mavjud emas» deb yozilgandi va u ESKIRGAN da'voga aylangan edi.
  Jonli o'lchov: `/api/products` javobida `video`, `videoPoster`,
  `videoBytes`, `videoSeconds` kalitlari BOR — ya'ni `db/023` production
  bazasida qo'llangan (aks holda so'rov ustun topolmay yiqilardi va endpoint
  javob bermasdi). **24 e'londan 2 tasida HAQIQIY video bor va ular CDN'dan
  ochiladi:** `cdn.lolamarket.uz/mahsulot/.../video/*.mp4` —
  `content-type: video/mp4`, **2.13 MB / 11 s** va **1.76 MB / 15 s**, poster
  ham bor, `cf-cache-status: HIT`. (Oddiy GET `200` qaytaradi, `Range`
  sarlavhasi bilan `206` — `<video>` elementi Range yuboradi, ya'ni qism-qism
  yuklash ishlaydi; yozuvning birinchi nusxasida `206` SHARTSIZ yozilgan edi.) Ya'ni butun quvur jonli: bot → R2 → baza →
  API → galereya. Galereya kodi ikkala yuzda ham chiqarilgan (Mini App
  `app.js?v=81`, sayt `script.js?v=40` — o'lchandi).
  ⚠️ Ikkala video ham **«Test video»** nomli e'londa — quvur ishlayapti,
  lekin haqiqiy sotuvchi mazmuni hali yo'q.
  ⚠️ Bu yozuv nima uchun kerak bo'ldi: da'vo yozilgan kunida to'g'ri edi va
  KEYIN eskirdi — hech kim uni buzmadi, shunchaki dunyo o'zgardi. Shuning
  uchun «deploy qilinmagan» kabi VAQTGA bog'liq gap yozilganda, uni
  tekshiradigan buyruq ham yoniga yozilsin (bu yerda: `/api/products`
  javobidagi `video` kaliti).
- [x] Mahsulot tahrirlash va yashirish — `PATCH /api/seller/products`; tahrirlangan e'lon qayta moderatsiyaga (`pending`) tushadi, "yashirish" `draft` ga o'tkazadi (haqiqiy o'chirish yo'q)
- [x] Rulon soni avtomatik kamayishi (buyurtma berilganda) — `products.stock` soni, buyurtma tranzaksiyasi ichida atomik `UPDATE ... WHERE stock >= qty`

### Sharhlar va reyting (PRD story №2, №15)
- [x] `reviews` jadvali — sharh buyurtmaga bog'lanadi (`db/012_reviews.sql`)
- [x] Xaridor yetkazilgan buyurtmadagi matoga 5 yulduz + matn qoldiradi (`POST /api/reviews`)
- [x] Mahsulot va sotuvchi reytingi sharhlardan HISOBLANADI (`recalcRating`)
- [x] Sotuvchi o'z reytingi va sharhlarini kabinetda ko'radi (`GET /api/seller/reviews`)
- [x] Admin sharhni yashira oladi (`/sharhlar`, `/sharh_yashir N sabab` + panel `review_hide`)
- [x] Saytdagi (landing) katalogda sharhlar — mahsulot detali drawer ko'rinishi sifatida
  qurildi (`openDetail`), sharh yozish profildagi yetkazilgan buyurtmadan

---

## Qilingan ishlar

- [2026-08-13] **To'rt agent (PM, dizayner, marketolog, investor) loyihani
  baholadi, founder ulardan TO'RT bandni tanladi — va sessiyaning eng qimmatli
  natijasi kod emas, UCH MARTA TAKRORLANGAN BITTA NAQSH: «yozilgan qoida himoya
  emas, uni tekshiradigan test himoya».** Uchala tasdiq ham AYNI shaklda keldi:
  qoida yozilgan edi, hech kim buzmoqchi bo'lmagan edi, va u shunday ham
  buzilgan holda turardi. (1) **Video chegara qorovuli** (`videoRadSababi`)
  `catalog.js` da "sinov uchun ATAYLAB ochiq" degan izoh bilan eksport
  qilingan — testi esa HECH QACHON yozilmagan. (2) **Brend rangi tokendan
  olinsin** qoidasi `telegram-app/styles.css` da yozilgan — `app.js` uni **81
  joyda** buzardi. (3) **QOLDIQ xotirasidagi ikki yozuv eskirgan** edi va ular
  bo'yicha ish boshlanayozdi (pastda). Ya'ni naqsh bir kunda uch xil qatlamda
  chiqdi: testda, uslubda va hujjatda.

  ⚠️ **Bu yozuvda TANLANMAGAN bandlar ham bor va ular ATAYLAB yozilmoqda:**
  founder to'rttasini tanladi (#3 analitika, #5 video C+F, #6 yopish,
  #7 dizayn qarzi) — ya'ni qolgan takliflar RAD ETILMADI, navbat kutmoqda.
  Yopilmagan band yopilgan ko'rinmasin.

  ---
  **#5-C — SOTUVCHI O'Z VIDEOSINI KO'RA OLMASDI, VA BU O'LCHANDI:**
  `routes/seller.js` javobida `vid_` qatori **0 marta** uchrardi (`grep`).
  Ya'ni sotuvchi videosini Telegram'ga yuborardi va undan keyin uning
  taqdiri haqida HECH NARSA bilmasdi: yetib bordimi, moderator olib
  tashladimi, qayta yuborsa bo'ladimi. Endi ro'yxat `videoVM(r)` va
  `awaitingVideo` ni qaytaradi — ⚠️ `videoVM` **katalogdagi AYNI funksiya**,
  ikkinchi nusxa yozilmadi: shu sababli "R2 kaliti yo'q bo'lsa video `null`"
  qoidasi bu yerda ham O'ZIDAN kelib chiqadi va ikki joy jimgina
  uzoqlashmaydi. Yangi `request_video` amali video oynasini QAYTA ochadi —
  ⚠️ **bu YANGI yo'l emas, MAVJUD bo'shliq:** oyna rasm yuborilganda o'zi
  ochilardi (`db/023`) va birinchi video kelishi bilan YOPILARDI, ya'ni
  moderator videoni olib tashlagan e'lon **abadiy videosiz** qolardi —
  yangisini yuborish yo'li umuman yo'q edi. Ikkala yuzda uch holatli qator
  ko'rinadi: video BOR / oyna OCHIQ / yo'l YOPIQ, va **tugma faqat
  uchinchisida** chiziladi.
  ⚠️ **«Mavjud funksiyaga ikkinchi yo'l qo'shilsa avval so'raladi» qoidasi
  (kechagi dars) SHU YERDA QO'LLANDI, birinchi marta:** oyna ochiq
  turganda tugma qo'yilsa u ayni ishni ikkinchi marta qiladigan tugma
  bo'lardi — qo'yilmadi.

  **#5-F — QOROVUL TESTLAR (2 ta):** **Test 24** video chegarasini qulfladi
  (`mp4` · ≤30 s · ≤12 MB) va u to'rt narsani ALOHIDA tekshiradi: 8 ta
  yaroqsiz kombinatsiya rad etiladi, **chegara qiymatining O'ZI qabul
  qilinadi** (30 s va 12 MB — "kichik bo'lsin" emas, "oshmasin"),
  tekshiruv **R2 ga yuklashdan OLDIN** bo'ladi (aks holda rad etilgan
  video baribir trafik va joy yeb bo'lardi) va rad etish sababi
  sotuvchiga AYTILADI. **Test 24b** — R2 sozlanmagan bo'lsa video `null`
  bo'ladi va **taxminiy havola YASALMAYDI**: kalitdan URL "yig'ib" qo'yish
  ekranda ishlaydigan video bordek ko'rsatib, bosilganda sinadigan
  havola berardi (`NULL` reyting qoidasi bilan bitta oila).

  ---
  **#7 — DIZAYN QARZI. RAQAM: 81 TA XOM BREND RANGI** (`#7a140d` 41,
  `#510100` 20, `#8f1a10` 20 — SANALDI, taxmin emas) tokenga o'tdi
  (`var(--pom-*)`). **Test 26** uni qulfladi va u **DARROV ish berdi** —
  yozilgan zahoti, qamrov HTML larga kengaytirilganda: `index.html` da AYNI
  rang SVG `fill=` **prezentatsiya atributida 11 marta** turgan edi.
  🔴 **U yerda `var()` UMUMAN ISHLAMAYDI va bu tuzatishni nuqsonga
  aylantirardi:** `fill="var(--pom-700)"` jimgina QORA beradi, ya'ni
  "tozalash" tasdiq belgisini butun saytda qora qilib qo'yardi va konsolda
  hech qanday xato bo'lmasdi. To'g'ri yo'l — `fill="currentColor"` + rang
  CSS klassida (`.verified`, `.verified-legend svg`). Ataylab qoldirilgan
  istisnolar: Yandex Maps `iconColor` (JS API parametri, CSS emas) va
  `KONFETTI_RANG` (nomlangan palitra) — ikkalasi ham testda SATR bo'yicha
  tanaladi.
  **Brend nomi tenglashtirildi:** Mini App header'ida JS kelguncha
  **«Telegram Mini App»** degan TEXNIK atama ko'rinardi — foydalanuvchiga
  ko'rsatiladigan matn emas, ichki tushuncha; endi `app.js` dagi `brandSub`
  bilan AYNI: «Ulgurji matolar bozori». Sayt `<title>` i ham shu ibora bilan
  boshlanadi, ⚠️ lekin **SEO iborasi TASHLANMADI** — "to'qima materiallar B2B
  platformasi" sarlavhaning ikkinchi yarmida qoldi (brend izchilligi uchun
  qidiruv trafigini qurbon qilish teng almashuv emas). Takrorlanadigan inline
  naqsh `.s-note` / `.s-mini` klasslariga chiqdi va ikkala yuzda AYNI nom
  bilan AYNI ma'noni bildiradi.
  🔴 **`user-scalable=no` OLIB TASHLANMADI — VA BU YOZUVNING MUHIM QISMI:
  O'LCHOV TAVSIYANI RAD ETDI.** Dizayn tavsiyasi "matn zoomini oching"
  degandi va u odatda to'g'ri tavsiya. Lekin Mini App'da `html` va `body`
  ikkalasida ham `overflow: hidden`, sahifaning O'ZI umuman skroll qilmaydi
  (`scrollHeight === clientHeight`) — skroll faqat `#screen-wrap` ichida.
  Ya'ni foydalanuvchi sahifani kattalashtirsa, kattalashgan mazmun bo'ylab
  **surilib yurish yo'li yo'q**: u zoomlangan holatda QAMALIB qolardi va
  yagona chiqish yo'li ilovani yopish bo'lardi. Rasm zoomi baribir alohida
  ishlaydi (`.pv` — pinch, `transform`). ⚠️ **Ehtiyoj HAQIQIY, yechim
  noto'g'ri edi:** shrift o'lchamlari qat'iy `px` da yozilgan, ya'ni haqiqiy
  tuzatish — tipografiyani nisbiy birlikka o'tkazish. Band OCHIQ qoldirildi,
  "bajarildi" deb belgilanmadi.

  ---
  **SINALGANI: 64 TEST YASHIL** (avval 60 edi — 4 yangi: 24, 24b, 25, 26).
  ⚠️ Raqam runner chiqishidagi `✅ Test` satrlaridan MUSTAQIL sanaldi,
  hisobotdan ko'chirilmadi; worktree'da `server/node_modules` yo'qligi
  yurishni yarim yo'lda yiqitishi mumkinligi (kechagi «48 test» darsi)
  hisobga olindi. **12 mutatsiya bilan sinaldi, 12 tasi ham USHLANDI** —
  yashil test isbot emas, buzib ko'rilgan test isbot.
  ✅ **`db/025` pglite'da HAQIQATAN BAJARILDI** (migratsiya + birinchi
  teginish qoidasi + panel so'rovlari) — bu `takeCredits` (`unknown -
  unknown`) va `GROUP BY json` darslarining davomi: **taqlid qilingan
  `pool.query` SQL matnini TEKSHIRMAYDI**, ya'ni yashil test "SQL to'g'ri"
  degani emas. Migratsiyaning O'ZIDA ham tekshiruv bloki bor — ikkinchi
  `/start` boshqa kanaldan kelganda qiymat o'zgarmasligi `RAISE EXCEPTION`
  bilan qulflangan.
  Brauzerda o'lchandi: `verified` belgisi `currentColor` ga o'tgandan keyin
  ham AYNAN `rgb(122,20,13)`; `.s-note` bloklari kesilmagan (flex ustun
  qoidasi); admin paneldagi yangi bloklar ma'lumot yo'q bo'lsa YASHIRINADI,
  kanal ro'yxati bo'sh bo'lsa esa halol bo'sh holat ko'rsatadi.
  **Kesh:** `style.css` 50→**52** (`index.html` va `admin/index.html` da
  BIR XIL raqam — 06-avgustdagi 15 versiyalik farq darsi), `script.js`
  41→**43**, `admin/admin.js` 24→**25**, `telegram-app/styles.css` 25→**26**,
  `telegram-app/app.js` 81→**82**, Test 16 jadvali birga. ⚠️ `CACHE_VERSION`
  TEGILMADI va bu TEKSHIRILDI, taxmin qilinmadi — o'zgargan fayllarning
  birortasi ham service worker `PRECACHE` ro'yxatida yo'q, Test 17 yashil.

  🔴 **HALOL CHEGARA, ATAYLAB YOZILADI:** (a) **PUSH QILINMAGAN** — ish
  faqat repoda, xaridor uchun mavjud emas; (b) **`db/025` serverda ISHGA
  TUSHIRILMAGAN** va u `server/routes/webhook.js` dan OLDIN bajarilishi
  shart.
  ⚠️ **OQIBAT O'LCHANDI (pglite), TAXMIN QILINMADI** — va birinchi yozilgan
  baho MUBOLAG'A bo'lib chiqdi. To'g'ri manzara: `INSERT` `column "src" does
  not exist` bilan yiqiladi, LEKIN u `.catch()` ichida — ya'ni **webhook
  yiqilmaydi**, `/start` javob beradi va **saytga kirish (`/start web_<kod>`)
  ISHLAYVERADI**. Yo'qoladigan narsa boshqa: `users` qatori UMUMAN
  yozilmaydi, ya'ni `/start` hisobi va manba belgisi **jimgina to'xtaydi**.
  Xato alertga chiqadi (`/start foydalanuvchini yozishda xato:`) — kalit
  barqaror, ya'ni tom ishlaydi.
  🔴 **Shuning uchun tartib baribir SHART:** nuqson ko'rinmaydi, faqat
  jurnalda qoladi va hisob jimgina yolg'on gapira boshlaydi — bu loyihaning
  eng qimmat xato turi. Lekin "bot o'ladi" deb yozish ham noto'g'ri edi:
  **deploy ko'rsatmasidagi mubolag'a ham tekshirilmagan da'vo.**;
  (c) `server/` rsync va servis restarti hali qilinmagan (founder
  bajaradi — deploy qoidasi); (d) manba belgisining O'ZI jonli
  sinalmagan: haqiqiy `t.me/<bot>?start=guruh_ipak` havolasi hali
  bosilmagan, ya'ni oqim uchidan-uchigacha faqat pglite'da ko'rilgan.

  Batafsil: analitika bloklari — `sprint-7.md`, AI bandining yopilishi —
  `sprint-10.md`.
- [2026-08-13] 🔴 **NUQSON: profil avatari PRODUCTION'DA UMUMAN CHIZILMAGAN —
  sabab kodda emas, CSP SARLAVHASIDA edi.** Founder telefonda ko'rsatdi:
  profil kartochkasida avatar o'rniga "singan rasm" belgisi, refresh ham
  yordam bermagan. Ya'ni `6cf4b12` bilan chiqqan avatar funksiyasi
  **birinchi kunidan beri o'lik** turgan.

  **Sabab O'LCHANDI, taxmin qilinmadi** — jonli javob sarlavhasi o'qildi:
  `img-src 'self' data: https://cdn.lolamarket.uz https://*.maps.yandex.net …`
  — ro'yxatda **`blob:` YO'Q**. Avatar esa `URL.createObjectURL()` bilan
  qo'yilgandi, ya'ni aynan `blob:` havola yasalardi va brauzer uni bloklardi.
  `esc()` gumon qilindi va OQLANDI: u faqat `&<>"'` ni qochiradi, blob
  havolasiga tegmaydi.

  🔴 **NUQSON TURI — LOYIHADA TANISH VA ENG YOMON XILI:** konsolda JS xatosi
  YO'Q, `fetch` **200** qaytargan, kod "ishlagan" — faqat rasm chizilmagan.
  Bu CLAUDE.md dagi karta bandi bilan **BITTA OILA**: «CSP qo'llanganda
  `api-maps.yandex.ru` qo'shilmasa karta JIMGINA o'ladi». Naqsh AYNAN o'sha,
  ya'ni qoida yozilgan bo'lsa ham ikkinchi marta tishladi — bu loyihaning
  «yozilgan qoida himoya emas, uni tekshiradigan test himoya» darsining
  navbatdagi tasdig'i.

  **Tuzatish:** `blob:` o'rniga **`data:`** — u CSP ro'yxatida ALLAQACHON
  bor, ya'ni **nginx'ga TEGILMADI**. Yangi `blobToDataUrl()` (`FileReader` →
  `readAsDataURL`) ikkala yuzda ham.
  ⚠️ **CSP ni kengaytirish varianti ATAYLAB rad etildi:** mavjud ruxsat
  yetarli bo'lganda yangi ruxsat ochish noto'g'ri bo'lardi — har bir qo'shilgan
  sxema CSP ning himoya qiymatini kamaytiradi va uni qaytarib olish qiyin.
  Avatar kichik (≤160px), ya'ni base64 qilib inline qo'yish arzon.

  **Yangi qorovul — Test 25** (`testImageSchemeAllowedByCsp`), uch bandi:
  (1) `script.js` va `telegram-app/app.js` da `createObjectURL` UMUMAN
  bo'lmasin (izohlar tahlildan oldin olib tashlanadi — 2026-08-12 dagi
  «izohdagi so'z qorovulni aldadi» darsi); (2) hujjatdagi CSP `img-src` da
  `data:` QOLSIN — avatar shunga tayanadi va kimdir CSP ni "qattiqlashtirsa"
  avatar yana jimgina o'lardi; (3) ikkala frontend `readAsDataURL` ishlatsin.

  ⚠️ **QOROVULNI SINASHDA O'LCHOV XATOSI CHIQDI VA U YOZIB QO'YILADI.**
  Birinchi urinishda M1/M2 mutatsiyalarini **Test 16** (kesh versiyasi) tutdi,
  Test 25 emas — chunki faylni tahrirlash `sha256` ni o'zgartiradi va Test 16
  oldinroq yiqiladi. Ya'ni "mutatsiya ushlandi" degan xulosa **NOTO'G'RI
  NARSANI** o'lchagan bo'lardi va Test 25 umuman ishlamasa ham xuddi shunday
  ko'rinardi. Qayta sinaldi: mutatsiya bilan BIRGA jadvaldagi hash ham
  yangilanib, Test 16 YASHIL qoldirildi — o'shanda uchala mutatsiya ham
  AYNAN Test 25 tomonidan ushlandi. Bu `MEMORY.md` dagi «tekshirdim ≠ to'g'ri
  narsani tekshirdim» darsining yana bir holati.

  🔴 **HALOL CHEGARA — tuzatish brauzerda KO'Z BILAN KO'RILMADI.** Browser
  paneli bu sessiyada siyosat bilan yopiq va founder sessiyasi bilan kirib
  bo'lmaydi. Ya'ni «`data:` CSP dan o'tadi» degan gap **sarlavha o'qilishiga
  asoslangan mantiqiy xulosa**, jonli o'lchov EMAS. ⚠️ Aynan shu turdagi
  ishonch bu nuqsonni tug'dirgan edi — o'shanda ham kod to'g'ri ko'rinardi.
  **Tasdiq faqat founder profilni ochib avatarni ko'rganda bo'ladi.**

  **Kesh:** `script.js v43→44`, `telegram-app/app.js v85→86`.
  `style.css` (v52) va `telegram-app/styles.css` (v29) **TEGILMADI** — ular
  o'zgarmagan, ya'ni versiyasi ham oshirilmaydi. Test 16 jadvali yangilandi.
  **Testlar 62 → 63, hammasi yashil.**
  **Deploy:** faqat statik — servis restarti KERAK EMAS

- [2026-08-13] **▶ belgisi (`.media-mark`) kartochkadan OLIB TASHLANDI —
  founder qarori.** Belgi bir necha soat oldin, AYNI kunda qo'shilgan edi va
  uni **founder so'ramagandi**: u 3 soniyalik hover funksiyasining yonida,
  «sensorli ekranda ham izsiz qolmasin» degan mulohaza bilan o'zimcha
  qo'shilgan. O'shanda buni ochiq aytgan edim, founder esa endi ortiqcha deb
  topdi. ⚠️ Yozuvning qimmatli qismi shu: **kod noto'g'ri emas edi, o'rni
  noto'g'ri edi** — bu `d680722` da CLAUDE.md ga yozilgan «mavjud funksiyaga
  ikkinchi yo'l qo'shilsa avval so'ralsin» qoidasining amaldagi narxi.

  **Olib tashlangani** (faqat frontend, `server/` TEGILMADI):
  `script.js` → `apiCardHtml` dan belgi qatori; `telegram-app/app.js` da AYNI
  narsa **IKKI** joydan (`productCard` va `homeCard` — ikkinchisi
  `.media-mark-lo` variantida edi); `style.css` va `telegram-app/styles.css`
  dan `.media-mark` qoidalari.
  ⚠️ **`is-preview` klassi ATAYLAB birga o'chirildi.** U FAQAT hover paytida
  ▶ belgisini yashirish uchun bor edi — belgi ketgach o'lik kodga aylanardi.
  O'lik CSS klassi zararsizdek ko'rinadi, lekin keyingi odam uni ko'rib
  «demak preview holati bor» deb o'ylardi va yo'q mexanizmga tayanardi.
  Tekshirildi: `media-mark`, `media-mark-lo` va `is-preview` to'rtala faylda
  **0 marta** uchraydi — faqat NEGA olib tashlangani yozilgan izohlarda nomi
  qolgan (ataylab: sabab qaytib kelishi mumkin).

  ⚠️ **3 soniyalik hover mexanizmiga (`.media-hover`) TEGILMADI.** Bu ikkitasi
  bir-biriga yopishib turgani uchun alohida tekshirildi: ikkala funksiya
  (`hoverMediaArm`, `bindHoverMedia`) tanasi qayta o'qildi, `.media-hover`
  to'rtala faylda joyida, `node --check` ikkalasida o'tdi.

  🔴 **HALOL CHEGARA — natija, nuqson emas:** endi **telefonda video borligi
  kartochkadan UMUMAN bilinmaydi**. U faqat mahsulot ekranidagi galereyada
  ko'rinadi, 3 soniyalik ko'rish esa faqat sichqonchali muhitda (Telegram
  Desktop, sayt). Bu bilib qilingan tanlov — kartochka tozaligi muhimroq deb
  topildi — lekin yozib qo'yilishi shart, chunki «kashf etilmaydigan funksiya»
  keyinchalik «funksiya ishlamayapti» bo'lib qaytib kelishi mumkin.

  ⚠️ **Brauzerda KO'Z BILAN ko'rilmadi** — Browser paneli bu sessiyada siyosat
  bilan yopiq edi. Tekshiruv TUZILMA darajasida: qoldiq izlash, funksiya
  tanasini o'qish, sintaksis tekshiruvi va 62 test. Bu ko'z bilan ko'rishning
  o'rnini BOSMAYDI va shunday belgilanadi.

  **Kesh:** `style.css v51→52`, `script.js v42→43`,
  `telegram-app/styles.css v28→29`, `telegram-app/app.js v84→85`,
  `panel.js v21→22`; `admin/index.html` dagi `style.css` ham **52** ga
  ko'tarildi. Test 16 jadvali birga yangilandi. **62 test yashil.**
  **Deploy:** faqat statik — `server/` tegilmagani uchun rsync va servis
  restarti KERAK EMAS, push CI'ni ishga tushiradi

- [2026-08-13] **Founderning o'n bandi bir sessiyada yopildi — to'qqiztasi shu
  sprintga tegishli (o'ninchisi AI rasmi, `sprint-10.md` da).** Bandlar
  alohida-alohida kichik, lekin ikkitasi ostidan **JIMGINA nuqson** chiqdi va
  ular bandlarning o'zidan qimmatroq.

  🔴 **Yo'l-yo'lakay topilgan birinchi nuqson: Mini App'da ♡ tugmasi UMUMAN
  BOSILMASDI.** U `.pd-hero` ichida, shaffof header qutisi OSTIDA turardi —
  brauzerda `elementFromPoint` tugma MARKAZIDA header'ni qaytardi, ya'ni bosish
  header'ga tushardi. Ko'z bilan hammasi joyida ko'rinardi (tugma chizilgan,
  konsolda xato yo'q), shuning uchun nuqson qancha vaqt yashaganini bilib
  bo'lmaydi. Tuzatildi: `‹` (orqaga), `♡` (sevimli) va `✦ Kiyimda ko'rish`
  endi HEADER'ning o'zida, bitta qatorda (o'lchandi: uchalasi `top:10px`,
  38px balandlik, header 58px da qoldi).
  ⚠️ Chip `position: absolute` — oqimda turganda ko'rinmas sarlavhani ikki
  qatorga tushirib header'ni **75px** ga cho'zardi.

  🔴 **Yo'l-yo'lakay topilgan ikkinchi nuqson: saytdagi filtr tugmasida
  `pointer-events: none` turardi** va yonida «faqat bezak — bosilmaydi» deb
  yozib qo'yilgandi. Ya'ni foydalanuvchi filtr belgisini ko'rardi, bosardi va
  HECH NARSA bo'lmasdi. Endi u haqiqiy tugma: `togglePriceFilter()`,
  `is-on` holati va `aria-expanded`.
  ⚠️ `fade-up` klassi OLIB TASHLANDI — u `IntersectionObserver` ga tayanadi,
  `hidden` element esa hech qachon "ko'rinmaydi", ya'ni panel ochilganda
  `opacity: 0` da qotib qolardi (jimgina bo'sh joy). Panel JOYI o'zgarmadi —
  chiplar bilan katalog orasida (o'lchandi: chips 391px, panel 433px,
  grid 566px). Filtr YOQILGAN bo'lsa panel majburan ochiq qoladi: filtr chipi
  aynan shu blok ichida va yopilsa filtr ishlab turganini **hech narsa
  ko'rsatmasdi**.

  **Profil surati Telegram avataridan** — yangi endpoint `GET /api/me/photo`
  (`server/routes/profile.js` → `handleMyPhoto`), ikkala yuzda ham bosh
  harflar o'rniga. ⚠️ `initDataUnsafe.photo_url` ATAYLAB ishlatilmadi: u faqat
  biriktirma menyusidan ochilganda keladi (bizdagi kirish nuqtalarida —
  bot menyusi, inline tugma — YO'Q bo'lardi), saytda esa `initData` umuman
  yo'q. Bir yuzda ishlab ikkinchisida ishlamaydigan yechim — aynan CLAUDE.md
  ogohlantirgan naqsh, shuning uchun surat serverdan olinadi va ikkala kanal
  `requestUser()` dan yuradi.
  🔴 **Telegram fayl manzili QAYTARILMAYDI, faqat baytlar proksi qilinadi:**
  `api.telegram.org/file/bot<TOKEN>/...` manzilida BOT TOKENI turadi —
  redirect qilinsa u brauzer tarixiga, `Referer` ga va foydalanuvchi ko'chira
  oladigan havolaga tushardi. `Cache-Control: private` (katalog rasmidan farqi
  shu — shaxsiy surat `public` bo'lsa Cloudflare uni chetda keshlab boshqa
  odamga berib yuborishi mumkin edi). Kesh xotirada — 6 soat, 500 yozuv
  chegarasi, "surat yo'q" holati HAM keshlanadi (aks holda avatarsiz odam har
  ochilishda ikkita bekor chaqiruv qilardi). Eng katta emas, **≤160px**
  o'lcham olinadi — 54px doira uchun 640px ortiqcha trafik. Bosh harflar
  ZAXIRA bo'lib qoladi; frontend `fetch` + blob bilan oladi (`<img src>`
  sarlavha yubora olmaydi). `usableMime`/`mimeFromPath` `catalog.js` dan
  IMPORT qilindi, nusxa ko'chirilmadi (`db/014` darsi).
  🔴 **BU BAND PRODUCTION'DA ISHLAMADI** — avatar o'rniga "singan rasm"
  chiqdi. Sabab shu yozuvdagi «blob bilan oladi» qismining O'ZIDA edi:
  `blob:` sxemasi CSP ro'yxatida yo'q. Tuzatildi — tepadagi alohida
  yozuvga qara. Ya'ni bu bandni yozganda funksiya **sinalgan deb
  hisoblangan**, holbuki u faqat lokalda (CSP'siz) sinalgandi.

  **Sotuvchi kabineti founder ro'yxatiga cheklandi** (`SELLER_TG_IDS`,
  `config.js`; zaxira zanjiri `ADMIN_TG_IDS` → `ADMIN_CHAT_ID`). Endi ikki
  shart: Telegram ID ro'yxatda VA bazada rol + `sellers` yozuvi.
  ⚠️ Tekshiruv YAGONA nuqtada — `lib/auth.js` → `currentSeller`, chunki
  `/api/me`, `requireSeller` va katalogning "o'z mahsulotim" filtri uchalasi
  ham shundan oziqlanadi; chaqiruvchilarga tarqatilsa yangi chaqiruvchi
  qo'shilganda tekshiruvni eslab qolish kerak bo'lardi — `authUser()` naqshi
  aynan shunday takrorlangan edi. Ro'yxatda yo'q odamda `role` → `'buyer'`,
  `seller_id` → `null`, LEKIN qator `null` QAYTARILMAYDI: `pickup_point_id`
  har bir foydalanuvchiga kerak («Mening manzilim»), ya'ni `null` xaridorning
  manzilini ham o'chirib yuborardi.
  🔴 **Ta'siri:** bazada `role='seller'` bo'lgan mavjud sotuvchilar ID'si
  `.env` ga yozilmaguncha kabinetni KO'RMAYDI va buni hech narsa ko'rsatmaydi
  — ular oddiy xaridor ekranini ko'radi. Qorovul: **Test 24**.

  **Bot chatida «Ochish» menyu tugmasi** (`lib/telegram-api.js` →
  `registerMenuButton`, `setChatMenuButton`). Founder shikoyati: botni topgan
  odam Mini App'ga kirish uchun eski xabarlardagi inline tugmani QIDIRISHI
  kerak edi, chat bo'sh bo'lsa esa yo'l umuman yo'q edi. ⚠️ `chat_id`
  UZATILMAYDI — usiz Telegram tugmani barcha shaxsiy chatlar uchun standart
  qiladi (chat bo'yicha o'rnatilsa birinchi ochilishda tugma HALI yo'q
  bo'lardi). ⚠️ Server ko'tarilganda AVTOMATIK ro'yxatdan o'tadi, chunki
  `BOT_TOKEN` almashtirilganda bu sozlama ham nolga qaytadi — **webhook bilan
  ayni tuzoq** (2026-08-13, saytga kirish o'lgan kun). Qo'lda bajariladigan
  qadam unutiladi, ishga tushishga bog'langani esa unutilmaydi. Serverni
  to'xtatmaydi, xato alertga chiqadi.
  ✅ **JONLI TASDIQLANDI (2026-08-13, deploydan keyin):** founder tugmani bot
  chatida O'Z KO'ZI bilan ko'rdi. Bu yozuvda ilgari «Telegram'da ko'z bilan
  ko'rilmagan» degan halol chegara turgandi — u endi YOPILDI va aynan shuning
  uchun tuzatildi: bu loyihada eskirgan da'vo qoldirish takrorlangan nuqson
  (`sayt-eski/` papkasi, «shriftlar 250 KB», «32 test» — hammasi shu oiladan).

  **Kartochka ustida 3 soniya — ikkinchi media** (`hoverMediaArm()` saytda,
  `bindHoverMedia()` Mini App'da). ⚠️ FAQAT `(hover: hover)` da armlanadi:
  telefonda «hover» barmoq bosilganda ham hosil bo'ladi va `mouseleave`
  kelmasligi mumkin — video ochiq qolib ketardi. Telegram DESKTOP'da ishlaydi.
  Video KECHIKIB yuklanadi, chiqishda `src` bo'shatilib tugun O'CHIRILADI
  (brauzerda o'lchandi: 3 s dan keyin `.media-hover` yaratildi, chiqishda
  **0 ta** orphan qoldi). ~~Sensorli ekranda video BORLIGINI `.media-mark` (▶)
  ko'rsatadi.~~ 🔴 **▶ belgisi 2026-08-13 da founder qarori bilan OLIB
  TASHLANDI** — pastdagi alohida yozuvga qara. Ya'ni bu bandning «funksiya
  telefonda ham izsiz qolmaydi» degan qismi endi TO'G'RI EMAS.

  **Kategoriya chiplari qayta dizayn** (ikkala yuzda). Tanlangani anor
  gradientida — ilgari `--ink-900` to'q ko'k edi va butun ilovada **yolg'iz
  o'zi** shu rangda turardi; ustiga IKAT ROMBI (`::before` bo'sh qutidan
  yasalgan 45° kvadrat — shrift belgisi yoki rasm EMAS, ya'ni yuklanmaydi va
  tushib qolmaydi). Nofaol chip iliq qog'oz gradientida va hover'da javob
  beradi (ilgari hover HECH NARSA qilmasdi). Mini App'dagi satr ichidagi
  uslub `styles.css` → `.cat-chip` ga ko'chirildi — ilgari ikki joyda qo'lda
  moslanardi.

  **Web: profil tugmasi qator OXIRIGA** (til → ♡ → savat → profil). Sabab
  uslub emas: ismi uzun foydalanuvchida tugma kengayib ikkita doira ikonkani
  o'ngga surardi, ya'ni qatorning o'ng qirrasi HAR foydalanuvchida boshqa
  joyda edi. Oxirida turganda kenglik faqat o'zidan o'ngga o'sadi.

  **Mini App: «Saqlangan matolar»** — profilda yangi qator (son bilan) va
  `saved` ekrani (`renderSaved`). ⚠️ Ro'yxat `PRODUCTS` dan filtrlanadi,
  `S.liked` dan EMAS: o'chirilgan e'lonning id'si `liked` da qolib ketishi
  mumkin va ro'yxat "bor, lekin ochilmaydi" holatiga tushardi. Son ham AYNI
  filtrdan — nol bo'lsa qator umuman ko'rsatilmaydi. Tarjima kalitlari ikkala
  tilda: `savedT`, `savedEmpty`, `savedEmptySub`, `savedGo`.

  **Kesh:** `style.css v50→51`, `script.js v41→42`,
  `telegram-app/styles.css v25→28`, `telegram-app/app.js v81→84`.
  ⚠️ `admin/index.html` dagi `style.css?v=` ham **51** ga ko'tarildi — bitta
  fayl ikkala sahifada BIR XIL versiya bilan chaqirilsin (2026-08-06 darsi:
  admin panel 15 versiya orqadagi keshni ushlab turgandi). Test 16 jadvali
  yangilandi. **Testlar 60 → 62**, hammasi yashil.
  🔴 **Deploy:** `server/` CI orqali CHIQMAYDI — qo'lda rsync va **servis
  restarti** kerak (avatar endpointi va menyu tugmasi server tomonda).
  `.env` ga tegish shart emas; `/api/me/photo` uchun nginx tahriri ham kerak
  emas — umumiy `location ^~ /api/` bloki uni qamraydi

- [2026-08-13] **Mini App profilidagi «Buyurtmalarim» qatori OLIB TASHLANDI —
  `7d5e47f` ORQAGA QAYTARILDI.** Founder buyurdi va sababini aytdi:
  **Mini App'da buyurtmalar bo'limi ALLAQACHON BOR EDI** (pastdagi
  navigatsiya, `renderOrders()`), ya'ni qator ORTIQCHA IKKINCHI ESHIK edi.

  🔴 **BU YOZUVNING ENG MUHIM QISMI FUNKSIYA HAQIDA EMAS — DARS HAQIDA, VA U
  ISHNI BAJARGAN AGENT HAQIDA: o'sha ortiqchalik BILIB TURIB qo'shilgan.**
  `7d5e47f` commitining O'Z izohida va pastdagi sprint yozuvida «Mini App'da
  buyurtmalar allaqachon o'z ekranida yashaydi, ya'ni **ko'chiriladigan narsa
  yo'q**» deb yozilgan. Ya'ni **fakt aniq edi, xulosa esa chiqarilmadi:**
  o'sha jumlaning o'zi «demak bu qator ortiqcha» degan savolni berishi kerak
  edi va bermadi. To'g'ri qadam — qo'shishdan OLDIN so'rash: «bu ortiqcha
  bo'lishi mumkin, kerakmi?».
  ⚠️ **Founder «shunday qilgin» degani «foydali bo'lsa qil» degani emas** —
  buyruq bajarildi, foydasi esa TEKSHIRILMADI. **Qoida: MAVJUD funksiyaning
  ustiga IKKINCHI YO'L qo'shilganda avval SO'RALADI.** Bu yozuv
  o'chirilmasin — keyingi safar bir xil holat yuzaga kelganda qorovul shu
  bo'ladi, chunki bu yerda test yozib bo'lmaydi (prompt qoidasi bilan bitta
  oilada: qulflab bo'lmaydigan narsa ODAT bo'lib qoladi).

  **Nima qaytarildi:** (1) `telegram-app/app.js` — `git checkout 384e28f --`
  bilan o'zgarishdan OLDINGI holatga qaytarildi va **BAYT-BAYTGA** mos
  (`sha256` boshi `193eb813a690`, `384e28f` dagi bilan bir xil —
  SOLISHTIRILDI, ko'z bilan qaralmadi); `renderOrdersRow`, `ICO.receipt`,
  kvitansiya `path` i, `ordersNone` kaliti (uz + ru) va `profileRow()` ning
  `arg` qo'shimchasi — hammasi ketdi, `grep` bilan har biri **0 marta**
  uchraydi, ya'ni qoldiq yo'q. (2) `telegram-app/index.html` —
  `app.js?v=82` → **`?v=81`**. (3) `server/test.js` Test 16 jadvali — `v: 82,
  hash: cca346ab4d3a` → `v: 81, hash: 193eb813a690`.

  ⚠️ **KESH VERSIYASI ORQAGA TUSHIRILDI va bu YERDA TO'G'RI — bilib
  qilingan.** Odatda `?v=` faqat OSHADI, chunki kalit tarkibga bog'langan
  bo'lishi kerak; bu yerda fayl TARKIBI ham aynan v81 dagi tarkib, ya'ni
  kalit tarkibga QAYTA MOS keldi va Test 16 uni tasdiqlaydi. 2026-07-22 dagi
  «versiya orqaga tushib ketdi» nosozligidan farqi shu — **o'shanda tarkib
  BOSHQA edi**, ya'ni bir xil URL ostida ikki xil fayl yuz bergan.

  **Sinalgani: 60 test yashil** (runner chiqishidagi satrlar SANALDI,
  hisobotdan ko'chirilmadi). Brauzerda jonli (mobil 375×812): profil
  qatorlari endi AVVALGI beshtasi — Til, Bildirishnomalar, Mening manzilim,
  Biz bilan bog'lanish, Ijtimoiy tarmoqlar; «Buyurtmalarim» qatori YO'Q.
  ⚠️ **REGRESSIYA TEKSHIRUVI ALOHIDA QILINDI — olib tashlash ham buzishi
  mumkin:** pastdagi navigatsiyadagi «Buyurtma» tugmasi bosildi, `S.screen`
  `orders` ga O'TDI va ekran to'g'ri chizildi (`Faol / Tarix / LM-2481 /
  Yo'lda / Marg'ilon ipak ikat`) — ya'ni buyurtmalar bo'limining O'ZI
  shikastlanmadi (`profileRow()` ning `arg` i olinganda uni ishlatadigan
  boshqa qator qolmaganini ham shu tasdiqlaydi). Konsolda JS xatosi yo'q.

  **Kesh:** `telegram-app/app.js?v=81`, `panel.js?v=20` (panel matni
  yolg'onga aylangani uchun qayta yozildi), Test 16 jadvalidagi ikki hash
  birga.

  🔴 **ENG MUHIM HALOL CHEGARA, VA U O'LCHANDI — TAXMIN EMAS: ORTIQCHA QATOR
  AYNI PAYTDA PRODUCTION'DA VA XARIDOR UNI KO'RIB TURADI.** `7d5e47f` push
  qilingan (`origin/main` = `7d5e47f`), CI «Deploy to Server» yurishi
  **success** bo'lgan (12:53:57Z) va jonli `lolamarket.uz/mini-app/index.html`
  hamon `app.js?v=82` ni chaqiradi — jonli faylning hashi `cca346ab4d3a`,
  ya'ni AYNAN qaytarilgan versiya. **Bu qaytarish PUSH QILINMAGUNCHA
  production'da hech narsa o'zgarmaydi.**
  ⚠️ **Yo'l-yo'lakay topilgan ESKIRGAN DA'VO:** `7d5e47f` ning o'z
  yozuvidagi «DEPLOY QILINMAGAN» bandi yozilgan lahzada TO'G'RI edi va
  **push CI ni ishga tushirgani bilan yolg'onga aylandi** — hech kim da'voni
  buzmadi, u shunchaki eskirdi. Bu «vaqtga bog'liq gap yozilganda uni
  tekshiradigan buyruq ham yoniga yozilsin» darsining (o'sha kuni video
  bandida yozilgan) **ikkinchi tasdig'i**, va bu safar u bir kun emas,
  **bir necha soatda** eskirdi. Tekshirish buyrug'i:
  `curl -s https://lolamarket.uz/mini-app/index.html | grep -o 'app\.js?v=[0-9]*'`

- [2026-08-13] **Saytda buyurtmalar tarixi profil ekranidan CHIQARILDI —
  endi "Mening manzilim" va "Biz bilan bog'lanish" bilan BIR XIL qator,
  ro'yxatning o'zi esa alohida ko'rinishda.** Founder aytgani: «webda
  buyurtmalar tarixi profilni ochganda uzun turibdi boshqa ma'lumotlarni
  ko'rib bo'lmayabdi shunga rasmda berganimdaqa qilgin buyurmalarim
  bo'lmini» — ya'ni nafaqat "qisqartir", balki AYNAN o'sha kuni qo'yilgan
  qator shakliga keltir.

  🔴 **Sabab TAXMIN emas, ESKI TARTIB BRAUZERDA O'LCHANDI** (375×812, oyna
  tanasi 750px, uchta buyurtma bilan): buyurtma bloki **500px** egallardi
  (oddiy qator 98px, bahs + ikki baholash qatori bo'lgani **259px**),
  «Mening manzilim» qatorining TEPASI **723px** da — ekran chegarasidan
  atigi 27px oldin, «Biz bilan bog'lanish» esa **BUTUNLAY** pastda qolgan;
  jami skroll **1047px / 750px**. Ustiga nuqson vaqt bilan
  **YOMONLASHARDI**: buyurtma soni o'sgani sari bo'limlar yanada pastga
  siljiydi. Yangi holatda profil tanasi **750/750** (skroll YO'Q) va
  uchala qator **64.5px** — teng.

  **Nima qo'shildi** (`script.js` v40→v41): (1) `myOrdersRowHtml()` —
  profildagi yangi `.p-row` (ikonka + «Mening buyurtmalarim» + izoh +
  strelka), manzil va aloqa qatorlari bilan bir xil shakl va **BITTA
  mexanizm** (bosilsa alohida ko'rinish, o'sha kunning qarori); (2)
  `drawerView = 'orders'` ko'rinishi (`ordersViewHtml()`,
  `openOrdersView()`) — ro'yxat shu yerda, pastida «Profilga qaytish»
  tugmasi (oyna sarlavhasida "orqaga" yo'q, tugmasiz yagona chiqish yo'li
  butun oynani yopish bo'lardi); (3) sharh va bahs formalari endi
  RO'YXATGA qaytadi — yangi `backToOrders()`.

  ⚠️ **Qator ostidagi izoh BAZADAN keladi, o'ylab topilgan son YO'Q:**
  `myOrders === null` → «Yuklanmoqda…», bo'sh → «Hozircha buyurtma yo'q»,
  bor → `3 buyurtma · Yo'lda` (eng yangi buyurtmaning holati —
  `/api/web/orders` `created_at DESC` qaytaradi, ya'ni `[0]`). Shu sababli
  `loadMyOrders()` endi IKKALA ko'rinishni qayta chizadi (`profile` va
  `orders`) — biri qolib ketsa izoh «Yuklanmoqda…» da qotib qolardi;
  `loadMyDisputes` / `loadMyReviews` / `toggleHistory` esa aksincha,
  `profile` dan `orders` ga ko'chdi, chunki ular chizadigan narsa endi
  faqat o'sha yerda.

  ⚠️ **`.order-list` va `.order-row` ga `flex: none` QO'YILDI** —
  oyna tanasi `display:flex; flex-direction:column`, ya'ni bolasi o'z
  mazmuniga emas QOLGAN JOYGA qarab siqiladi. Buyurtma qatorining ichida
  ochiladigan tarix bloki bor, ya'ni balandligi bosilganda O'ZGARADI —
  aynan shunday blok kesiladi. Bu shu kuni yozilgan «flex ustundagi yangi
  blok» qoidasi (`<picture>` → `.addr-map` 63px → `.contact-block` 127px
  oilasining TO'RTINCHI a'zosi, CLAUDE.md).

  🔴 **Yo'l-yo'lakay topilgan nuqson — `backToProfile()` fayl ichida IKKI
  MARTA, aynan bir xil tanada e'lon qilingan edi.** Ikkinchi e'lon
  birinchisini JIMGINA bekor qiladi: birinchisini tahrirlagan odam hech
  narsa o'zgarmaganini ko'radi va sababini topa olmaydi (konsolda xato
  yo'q, `node --check` toza). Endi ikkita ALOHIDA nishon, ikkita ALOHIDA
  nom — `backToProfile()` (manzil/aloqa oynasidan) va `backToOrders()`
  (sharh/bahs formasidan).

  **Yo'l-yo'lakay tuzatildi: `ORDER_STATUS` yorliqlari faqat o'zbekcha
  edi** — ya'ni RUSCHA saytda buyurtma holati o'zbekcha chiqardi (til
  almashtirgich C3 da qo'shilgandan beri jimgina turgan qoldiq). Endi
  yorliq `{uz, ru}` va `L()` bilan o'qiladi, yangi `statusLabel()`
  orqali uch joyda (qator izohi, holat yorlig'i, holat tarixi); noma'lum
  holatda bazadagi qiymatning O'ZI ko'rinadi, bo'sh joy qolmaydi. Jadval
  ATAYLAB `STR` ga ko'chirilmadi — kalitlari bazadagi `orders.status`
  qiymatlari va ular bilan birga o'zgaradi, `STR` esa UI matnlari uchun.

  **Kesh:** `script.js?v=41`, `style.css?v=50` — `index.html` va
  `admin/index.html` da BIR XIL, Test 16 jadvalidagi hashlar yangilandi.
  `.profile-sec-title` o'chirildi (endi ishlatilmaydi), `.order-row +
  .order-row` margin'i `.order-list` gap'iga o'tdi.

  ⚠️ **`panel.js?v=17→18` — VA SABABI KESH QOIDASINING AYNAN O'ZI.** Bu ish
  `origin/main` bilan parallel bajarilgan va rebase paytida to'qnashdi:
  mahsulot ekrani ishi ham, bu ish ham `panel.js` ning "Yangilanish:"
  matnini almashtirib **IKKALASI v17 ga ko'targan** edi — ya'ni bitta
  versiya raqami ostida IKKI XIL tarkib. `origin` dan v17 ni olgan
  foydalanuvchida keshning kaliti o'zgarmasdi va u panelda **eski matnni
  abadiy** ko'rib turardi. Shuning uchun birlashtirilgan tarkib v18 ga
  ko'tarildi va Test 16 dagi hash qayta hisoblandi. Nizolar `panel.js`,
  `server/test.js`, `loyiha-panel.html` va shu faylda edi; hech qaysi
  tomonning yozuvi o'chirilmadi (ikkala faoliyat yozuvi ham, ikkala qaror
  ham joyida).

  **Sinalgani: 60 test yashil** (runner chiqishidagi `✅ Test` satrlari
  SANALDI, hujjatdan ko'chirilmadi). Brauzerda jonli: uz va ru til,
  «Yuklanmoqda…» / bo'sh / 1 ta / 4 ta buyurtma holatlari, tarix ochilishi
  (ikkitasi birga), baholash formasidan qaytish (`orders` ga qaytdi), bahs
  formasidan qaytish, «Profilga qaytish» (`profile` ga qaytdi). Konsolda
  JS xatosi yo'q. **O'LCHANDI, ko'z bilan qaralmadi:**
  `getBoundingClientRect()` bilan ichidagi element ota chegarasidan
  oshmasligi tekshirildi — tarix bloklari OCHILGAN holatda ham
  `oshgan: 0`. Ruscha yo'l alohida tasdiqlandi: `2 заказов · В пути`,
  sarlavha `Мои заказы`, tarix `В ожидании / В пути`, tugma
  `Назад в профиль`.

  🔴 **HALOL CHEGARA, ATAYLAB YOZILADI:** (a) **DEPLOY QILINMAGAN** —
  ish faqat repoda, xaridor uchun mavjud emas; (b) **Mini App'ga
  TEGILMADI** va bu tekshirilgan, taxmin emas: u yerda buyurtmalar
  allaqachon pastdagi navigatsiyadan ochiladigan alohida ekranda, ya'ni
  ikkala yuz endi bitta mantiqda; (c) bu ish uchun **YANGI TEST
  YOZILMADI — qo'shilgan test soni NOL**, qamrov faqat mavjud testlardan
  (Test 16 kesh, Test 20 tarjima); (d) uch yangi tarjima kaliti
  (`ordersNone`, `ordersCount`, `toProfile` — uz+ru) ISHLATILADI, ya'ni
  Test 20 dagi «ishlatilmagan kalitlar» soni **16 da QOLDI** (o'lchandi,
  taxmin emas) — kechagi to'rtta o'lik kalitning ustiga yangisi
  qo'shilmadi

- [2026-08-13] 🔴 **BU ISH O'SHA KUNNING O'ZIDA ORQAGA QAYTARILDI — yuqoridagi
  «qator OLIB TASHLANDI» yozuviga qarang.** Qator ORTIQCHA edi. Yozuv
  O'CHIRILMADI va bu ataylab: darsning ISBOTI aynan shu matnning ICHIDA
  turadi — «ko'chiriladigan narsa YO'Q» degan fakt quyida O'Z QO'LI bilan
  yozilgan va shunga qaramay qator qo'shilgan. ⚠️ Quyidagi «DEPLOY
  QILINMAGAN» bandi ham o'sha holatda qoldirildi — u keyin ESKIRGAN da'voga
  aylandi (commit push qilinib CI uni production'ga chiqargan).
  ~~**Mini App profilida ham «Buyurtmalarim» qatori paydo bo'ldi —
  lekin RO'YXAT KO'CHIRILMADI, va bu ikki yuz orasidagi ATAYLAB QILINGAN
  FARQ.**~~ Founder aytgani: «mini appda ham shunday qilgin» — yuqoridagi
  sayt ishining (`c1e309b`) juftligi.

  ⚠️ **Yuqoridagi yozuvning "(b) Mini App'ga TEGILMADI" bandiga ILOVA, va
  u banddagi da'vo ANIQLASHTIRILADI (o'chirilmaydi):** o'sha yerda "ikkala
  yuz endi bitta mantiqda" deyilgan va bu MEXANIZM haqida to'g'ri edi —
  Mini App'da buyurtmalar allaqachon O'Z EKRANIDA yashaydi (pastdagi
  navigatsiya, `renderOrders()`). Bir xil BO'LMAGAN narsa boshqa edi:
  **profil bo'limlari ro'yxati.** Saytda profilga kirgan xaridor
  «Mening buyurtmalarim» qatorini ko'radi, Mini App'da esa ko'rmasdi va
  buyurtmalarni faqat pastdagi tabdan topardi.

  🔴 **Shuning uchun bu yerda qator YANGI ko'rinish OCHMAYDI — MAVJUD
  ekranga IKKINCHI ESHIK qo'yadi** (`tab('orders')`). Saytda `drawerView =
  'orders'` yangi ko'rinish yaratish KERAK edi, chunki u yerda ro'yxat
  profil ichida chizilib boshqa bo'limlarni bosib turardi; bu yerda esa
  ko'chiriladigan narsa YO'Q. **«Ikkala yuzda bir xil qilaman» deb Mini
  App'dan navigatsiya tabini olib tashlash yoki ekranni profil ichiga
  solish REGRESSIYA bo'lardi** — bir xillik SHAKLDA (bo'limlar ro'yxati),
  mexanizmda emas.

  **Nima qo'shildi** (`telegram-app/app.js` v81→v82): (1) `renderOrdersRow()`
  — `profileRow()` orqali chizilgan qator (ikonka + «Buyurtmalarim» + izoh +
  strelka), manzil va aloqa qatorlari bilan bir xil shakl; (2) `ICO.receipt`
  — kvitansiya belgisi, saytdagi `myOrdersRowHtml()` dagi `path` bilan
  **harfma-harf bir xil** (solishtirildi, ko'z bilan qaralmadi); (3) yangi
  `T.ordersNone` kaliti (uz: «Hozircha buyurtma yo'q», ru: «Заказов пока
  нет»).

  ⚠️ **`profileRow()` ning CHEGARASI kengaytirildi — `arg` qo'shildi.**
  Ilgari u FAQAT argumentsiz amalni chaqira olardi (`data-arg` umuman
  chizilmasdi), ya'ni `tab('orders')` kabi amalni qator orqali berish
  IMKONSIZ edi. Bitta satr, lekin bu funksiyaning shartnomasi —
  delegatsiya `data-arg` ni allaqachon o'qiydi (`app.js` boshidagi
  shartnoma: butun son bo'lsa `Number`, aks holda satr), yetishmagan joy
  faqat uni CHIZISH edi.

  ⚠️ **Qator ostidagi izoh MA'LUMOTDAN keladi, o'ylab topilgan son YO'Q:**
  bo'sh bo'lsa «Hozircha buyurtma yo'q», bo'lsa `2 buyurtma · Yo'lda` —
  eng yangi buyurtmaning holati. Holat yorlig'i MAVJUD `STATUS_TXT`
  jadvalidan olinadi (u allaqachon `{uz, ru}`), ya'ni **yangi tarjima
  jadvali YARATILMADI** va ro'yxat ekranidagi yorliq bilan bitta manbadan
  keladi. `ORDERS[0]` ENG YANGISI ekani IKKI manbada TEKSHIRILDI, taxmin
  qilinmadi: yangi buyurtma `ORDERS.unshift(...)` bilan boshiga qo'yiladi
  va serverdan ro'yxat `ORDER BY created_at DESC` bilan keladi
  (`server/routes/orders.js:427`).

  **`T.ordersCount` esa YANGI EMAS — bu ish O'LIK KALITNI TIRILTIRDI.** U
  ikkala tilda allaqachon bor edi va HECH QAYERDA ishlatilmayotgan qoldiq
  edi. ⚠️ Nomi saytdagi kalit bilan bir xil, lekin jadval BOSHQA:
  `script.js` va `app.js` o'z `STR` larini yuritadi — yuqoridagi yozuvdagi
  «uch yangi tarjima kaliti» sayt jadvali haqida, bu yerda esa Mini App
  jadvali.

  **O'LCHANDI, KO'Z BILAN QARALMADI** (375×812, `getBoundingClientRect()`
  bilan ichidagi element ota chegarasidan oshmasligi tekshirildi —
  «flex ustundagi yangi blok» qoidasi, CLAUDE.md): Buyurtmalarim
  **65.2px**, Til 62px, Bildirishnomalar 62px, Mening manzilim 65.2px,
  Biz bilan bog'lanish 65.2px, Ijtimoiy tarmoqlar 62px — **hech biri
  KESILMAGAN**. 62 va 65.2 orasidagi farq naqshdan: izohli qatorlar
  (buyurtma, manzil, aloqa) ikki qatorli, izohsizlari bir qatorli — yangi
  qator MAVJUD naqshga mos tushdi.

  **Sinalgani: 60 test yashil** (runner chiqishidagi `✅ Test` satrlari
  SANALDI, hisobotdan ko'chirilmadi — kechagi «48 test» darsi). Brauzerda
  jonli (mobil 375×812): qator chizildi (`2 buyurtma · Yo'lda`), bosilganda
  `S.screen` `orders` ga o'tdi va ekran chizildi (`LM-2481 / Yo'lda`),
  pastdagi navigatsiyada «Buyurtma» yorildi; bo'sh holat, bitta buyurtma
  («1 buyurtma · Yetkazildi») va **ruscha** yo'l («Мои заказы», `2 заказов
  · В пути`) alohida tekshirildi. Konsolda JS xatosi yo'q.
  ⚠️ Yo'l-yo'lakay: `app.js?v=82` haqiqatan yuklangani TARMOQ SO'ROVI bilan
  tasdiqlandi, va `CACHE_VERSION` oshirilishi KERAK EMASLIGI ham
  tekshirildi — `app.js` service worker `PRECACHE` ro'yxatida YO'Q
  (`telegram-app/sw.js`), Test 17 yashil.

  **Kesh:** `telegram-app/app.js?v=82` (`index.html` bilan birga),
  Test 16 jadvalidagi hash yangilandi.

  🔴 **HALOL CHEGARA, ATAYLAB YOZILADI:** (a) **DEPLOY QILINMAGAN** —
  ish faqat repoda; (b) **TELEGRAM ICHIDA KO'RILMAGAN** — brauzerda
  sinaldi, Mini App'ning haqiqiy muhiti esa WebView va u yerda faqat
  founder ko'radi; buyurtmalari BOR haqiqiy xaridorda ham ko'rilmagan
  (`ORDERS` sinov ma'lumoti bilan to'ldirilgan); (c) **YANGI TEST
  YOZILMADI — qo'shilgan test soni NOL**, va bu yerda KONKRET KO'R NUQTA
  bor: **Mini App'ning `STR` jadvali uz/ru to'liqligini HECH QANDAY test
  qo'riqlamaydi** (Test 20 faqat `script.js` ni, Test 14j faqat serverdagi
  AI yorliqlarini qamraydi), ya'ni yangi `ordersNone` kaliti bir tilda
  tushib qolsa buni hech narsa aytmaydi. Bu «yozilgan qoida himoya emas —
  uni tekshiradigan test himoya» oilasidan ATAYLAB ochiq qoldirilgan joy.

- [2026-08-13] **Mahsulot ekrani (Mini App) qayta tartiblandi — rasm 2.1
  barobar kattalashdi va endi bosilsa to'liq ekranda ochiladi. Sabab
  O'LCHOV bilan topildi, "chiroyliroq bo'lsin" bilan emas.** Founder:
  «rasm kichikroq hamda orqada ko'ringandek tuyuladi». 375×812 da
  o'lchandi: hero 248px, ko'rinadigani 226px = ekranning **27.8%**;
  katalog kartochkasidagi AYNI rasm esa 164×230px — ya'ni mahsulotga
  KIRGAN sari rasm KICHRAYARDI (230 → 226). Ikkinchi sabab: mato TIK
  suratga olinadi (3:4), hero esa YOTIQ 3:2 edi va naqshning yupqa
  tasmasini qirqardi. Uchinchisi "orqada" hissini tushuntiradi: surat
  tepadan shisha header, pastdan shisha kartochka bilan siqilgan va
  kartochka ORQASIDAN ko'rinib turardi.

  **Tavsiyalar QUIZ orqali berildi** — to'rt savol ASCII maketlar bilan
  taklif qilindi va founder to'rttasida ham "Tavsiya" variantini tanladi:
  (1) **4:5 to'liq kenglikdagi hero** — 469px, ekranning **57.7%**,
  shaffof header OSTIDAN o'tadi; (2) rasm ustida faqat ikki gradient
  (`.pd-scrim-t/b`) — kartochka esa QATTIQ oq sirt bo'ldi, shisha va blur
  olib tashlandi; (3) **nom rasm USTIDA** (`.pd-cap`) — ilgari u bitta
  ekranda IKKI MARTA yozilardi (header + kartochka), endi kartochka
  to'g'ridan-to'g'ri narxdan boshlanadi, header'dagi nom esa skroll
  rasmdan pastga tushganda qaytadi (`syncDetailHeader`, `.hdr-clear`);
  (4) **rasmga bosilsa TO'LIQ EKRAN + zoom** — pinch, ikki marta bosish
  `1↔2.5`, chegara 4x, surish rasm chetida to'xtaydi (`openPhoto` /
  `closePhoto` / `renderPhotoView` / `mountPhotoView`, `S.photoView`).

  ⚠️ **Zoom brauzerning O'ZIniki EMAS va bo'la olmasdi:** `html` da
  `touch-action: manipulation` + `overflow: hidden` turibdi (Mini App
  ekrani sahifa emas, ilova), ya'ni sahifa masshtabi umuman ishlamaydi —
  shuning uchun masshtab qo'lda o'lchanadi va `transform` bilan
  qo'llaniladi. Masshtab holati `S` da EMAS, modul o'zgaruvchisida
  (`_pv`): u ekran holatining bir qismi emas — orqaga qaytish tarixiga
  tushmaydi va saqlanmaydi, ko'rish LAHZASINING o'zi.

  **Tuzoqlar, aytib o'tishga arziydigan:**
  🔴 `.pd-hero` ga `flex: none` — bu shu kuni yozilgan «flex ustunda
  siqiladigan blok» qoidasi (UCH marta tishlagan), `aspect-ratio` bola
  siqilishidan KAFOLAT bermaydi. O'lchab tekshirildi.
  ⚠️ **Rasm slaydi endi BITTA joyda chiziladi** (`detailMedia`) —
  videoli va videosiz holatda ham. Ilgari videosiz mahsulotda rasm hero
  divining `style` ida edi, ya'ni "bosilsa kattalashsin" amalini IKKI
  joyga yozish kerak bo'lardi va bittasi ertami-kech esdan chiqardi.
  ⚠️ **Naqsh (CSS gradient) bilan chizilgan mahsulotda zoom amali UMUMAN
  qo'yilmaydi** — bosilganda hech narsa qilmaydigan tugma bo'lmasin
  («ortida hech narsa yo'q qator qoldirilmaydi» qoidasi bilan bitta
  oila); `openPhoto` da ikkinchi qatlam tekshiruv ham bor.
  ⚠️ **Qo'ng'iroq tugmasi mahsulot ekranida YASHIRILADI** — rasm header
  ostidan o'tgani uchun o'ng yuqori burchakni "sevimli" egallaydi va
  ikkalasi AYNI nuqtada ustma-ust tushardi.
  ⚠️ Kartochka ichidagi bloklar `.pd-panel` (`#FCF8F6`) ga o'tdi: ilgari
  ular yarim shaffof oq + blur edi va QATTIQ oq sirt ustida ko'rinmay
  qolardi — fon o'zgarsa, uning ustidagi shisha ham qayta ko'riladi.
  ⚠️ Skroll qorovuli `#screen-wrap` ga BIR MARTA ulanadi (`_hdrBound`) —
  har `render()` da ulansa listenerlar to'planib skroll qimmatlashardi.

  **Kesh qoidasi bajarildi:** `telegram-app/styles.css?v=24→25`,
  `telegram-app/app.js?v=80→81`, `panel.js?v=15→16→17` (oxirgisi shu
  tuzatish bilan), Test 16 jadvalidagi UCHTA hash yangilandi.
  ⚠️ Bu yerda ilgari «ikki hash» deb yozilgan va `panel.js` umuman
  eslatilmagan edi — `b651722` ning O'ZIDA esa uchta qator o'zgargan.
  Yana bir marta: hujjatdagi raqam sanab tekshirilmasa — da'vo.

  **O'LCHANDI, ko'z bilan qaralmadi:** hero 469px / 57.7%; nom bloki hero
  chegarasidan chiqmaydi (0px); 3 qatorli uzun nomda ham nuqtalar bilan
  to'qnashmaydi; rasmsiz (naqshli) mahsulotda zoom ochilmaydi; videoli
  galereyada 2 slayd, nuqtalar joyida, video slaydi zoom ochmaydi; zoom
  mexanikasi — pinch 100→200px = **aniq 2x**, chegara 4x, surish chetda
  aniq (187.5 / 344) to'xtadi; header qorovuli 393px chegarada ikki
  tomonga ham to'g'ri ishladi. **60 test yashil** (`node server/test.js`).
  ⚠️ **Raqam MUSTAQIL qayta o'lchandi va ish hisobotidagi qiymat XATO
  chiqdi** («48 test»). Sabab worktree'da `server/node_modules` yo'q edi:
  `pg` topilmagani uchun test 6-chi qadamda YIQILARDI, ya'ni "yashil"
  deb sanalgan raqam to'liq bo'lmagan yurishdan olingan. Modullar
  ulangandan keyin `grep -c '^✅ Test'` → **60** (oldingi commitdagi
  qiymat bilan mos). Bu «hujjatdagi raqam — tekshirilmagan da'vo»
  qoidasining yana bir tasdig'i: raqam ko'chirilmaydi, qayta o'lchanadi

  ⚠️ **Brauzerda tekshirib BO'LMAGAN joy bor edi:** panel yashirin
  (`document.hidden`) bo'lgani uchun skroll hodisasi TABIIY otilmadi va
  CSS o'tishlari kadr olmadi — skroll SUN'IY hodisa bilan, header opacity
  esa HISOBLANGAN qiymat bilan tekshirilgan edi.

  ✅ **PRODUCTION'DA VA FOUNDER TELEFONDA TASDIQLADI** (2026-08-13,
  `b651722`, CI success): `lolamarket.uz/mini-app/` HTML da `?v=25`/`?v=81`
  va ikkala fayl repodagi bilan **hash bo'yicha bayt-baytga mos**
  (`193eb813a690` / `1e53e59ed3cf`). Founder Telegram ichida ochib
  ko'rdi — «hammasi joyida», ya'ni yuqoridagi uch nuqta (skroll bilan
  header qaytishi, ikki barmoq bilan kattalashtirish, rasmning Telegram
  paneli bilan to'qnashmasligi) JONLI tekshirildi. Servis restarti kerak
  emas — faqat frontend o'zgardi.

  🔴 Sayt (`script.js`) ATAYLAB tegilmagan: u yerda mahsulot yon oynada
  (`drawer`) ochiladi, bu ekranning juftligi yo'q.

- [2026-08-13] **Profil ekrani qayta tartiblandi — IKKALA yuzda, founder
  namunasi asosida. Namunadan FAQAT TARTIB olindi, mazmun emas.** Founder
  boshqa ilovaning profil ekrani rasmini berdi. Nusxa ko'chirish oson
  yo'l bo'lardi va u yerdagi har element bizga to'g'ri kelmasdi — shuning
  uchun namunadan **shakl grammatikasi** olindi (bo'limlar bir xil
  balandlikdagi alohida qatorlar), ichi esa LolaMarket'ning o'z mazmuni
  bo'lib qoldi.

  **Uch qavat, aralashmaydi** (`renderProfile()` — Mini App, `profileHtml()`
  — sayt): (1) **kimligi** — Telegram kartasi + korxona kartasi, telefon va
  pochta endi o'sha kartaning ICHIDA (ilgari alohida uchinchi karta edi:
  ular korxonaning o'z ma'lumoti, alohida turishi shart emasdi);
  (2) **bo'limlar** — bir xil balandlikdagi (`min-height: 62px`) qatorlar,
  yangi `profileRow()` yordamchisi (Mini App) va `.p-row` sinflari (sayt);
  (3) **amal + iz** — bitta to'ldirilgan CTA (sotuvchi kabineti) → chiqish →
  logotip + `© 2026 LolaMarket`. "Sozlamalar" sarlavhasi OLIB TASHLANDI:
  qatorlarning o'zi nima ekanini aytadi, sarlavha esa bitta ro'yxatni
  ikkiga bo'lib ko'rsatardi. Saytda buyurtmalar ro'yxati YUQORIGA ko'chdi —
  mazmun avval, bo'limlar keyin.

  ⚠️ **Namunada BOR, lekin ATAYLAB QO'SHILMAGANI — va sabab qoidada
  yozilgan:** ilova versiyasi raqami (klientda haqiqiy versiya satri MAVJUD
  EMAS, o'ylab topilgani esa «panelda o'ylab topilgan raqam ko'rsatilmasin»
  qoidasiga tushadi — noto'g'ri raqam ishonch uyg'otadi, yo'qligi esa savol
  tug'diradi), yulduzli baholash, "Faol sessiyalar" / "Biz haqimizda" /
  "FAQ" — ortida hech narsa yo'q qatorlar o'lik tugma bo'lardi.

  **Founder ikkinchi bosqichda uchta tuzatish so'radi:**
  🔴 **1) "Biz bilan bog'lanish" — endi ALOHIDA oyna, joyida ochiladigan
  bo'lim EMAS.** Bu AYNI SHU KUNDAGI `9cd3b9d` qarorini ALMASHTIRADI (u
  quyida, o'sha yozuvda turibdi — tarix uchun qoldirilyapti). Sabab uslub
  emas: profilda ikkita "ichkariga olib kiradigan" qator turardi va ular
  IKKI XIL ochilardi — biri joyida yoyilardi, ikkinchisi oyna chiqarardi.
  Foydalanuvchi qaysi biri qanday ochilishini TAXMIN QILISHGA majbur edi.
  Mini App'da `S.contactSheet` + `renderContactSheet()` (BTS oynasi bilan
  BITTA `paintSheet` mexanizmi), saytda `drawerView === 'contact'` +
  `contactWaysHtml()`. `contactOpen` / `toggleContact` ikkala yuzdan ham
  butunlay olib tashlandi (qoldiq yo'qligi grep bilan tekshirildi).
  **2) Qator belgilari TO'LDIRILGAN bo'ldi** (Mini App'da `ICO`
  konstantasi): ingichka chiziqli belgi 21px da yorug' fonda yo'qolib
  ketardi, to'ldirilgani esa qator boshida aniq langar bo'lib turadi.
  **3) Til qatori saytdagi naqshga o'tdi:** UZ/RU tugmachalari o'rniga
  bitta qator — `🇺🇿 O'zbek ›`, bosilsa `🇷🇺 Русский` (yangi
  `toggleLangUi()`, `LANGS` konstantasi). Til NOMI tarjima jadvalida EMAS:
  har bir til o'z tilida yoziladi. Uchinchi til qo'shilsa bu yer tanlov
  ro'yxatiga aylanadi — ikki til uchun ro'yxat ortiqcha bosish bo'lardi.

  **"Yordam markazi" qatori BUTUNLAY olib tashlandi** — ortida hech narsa
  yo'q edi, ya'ni u bosiladigandek ko'rinib hech qayerga olib bormaydigan
  qator edi. `help` tarjima kaliti ham ikkala tildan o'chirildi (qator
  ketib kalit qolsa, u keyin "bor ekan" deb qayta ishlatilardi).

  **Kesh qoidasi bajarildi:** `app.js?v=79→80`, `script.js?v=39→40`,
  `style.css?v=48→49` — oxirgisi `index.html` va `admin/index.html` da BIR
  XIL (bitta fayl ikki sahifada turli versiya bilan chaqirilgan holat
  2026-08-06 da aynan shu yerda tishlagan); Test 16 jadvalidagi uchta hash
  yangilandi.
  ⚠️ **Raqam IKKI MARTA oshirildi va sabab muhim.** Ish `main` dan
  shoxlangandan keyin media galereya (`1e17ccd`) va video o'chirish
  (`5b913cc`) o'sha uchala faylni tegib, `?v=` ni AYNAN shu raqamlarga
  (79 / 39 / 48) ko'targan edi. Rebase paytida faqat mazmun birlashadi —
  `?v=` esa jimgina "allaqachon to'g'ri" bo'lib ko'rinardi, holbuki o'sha
  raqam production'da BOSHQA tarkib bilan yotgan: qaytib kelgan
  foydalanuvchi yangi HTML + eski JS birikmasini olardi. Shoxlangan ish
  qo'shilganda `?v=` ni `main` dagi qiymatdan oshirish kerak, o'zining
  eski qiymatidan emas.

  **O'LCHANDI, ko'z bilan qaralmadi.** CLAUDE.md dagi "flex ustunda
  siqiladigan blok" qoidasi shu kuni yozilgan va u ko'rish yetarli emasligini
  aytadi — shuning uchun ikkala yuzda ham `getBoundingClientRect()` bilan
  har bir qatorning ichidagi element ota chegarasidan oshmasligi tekshirildi:
  **kesilgan blok YO'Q**, manzil va aloqa qatorlari **65.2px — teng**. Aloqa
  oynasi ochildi/yopildi, til `uz→ru→uz` almashtirildi (bayroq ham, butun
  profil tarjimasi ham yangilanadi), manzil tanlash oynasi yangi qatordan
  ochilishi tasdiqlandi. **59 test PASS** — raqam ikki mustaqil usul bilan
  olindi (test chiqishidagi `✅ Test` satrlari = 59, manbadagi noyob
  e'lonlar = 59).

  🔴 **OCHIQ QOLGANI, ataylab yoziladi:** (a) **to'rtta tarjima kaliti endi
  O'LIK** — `myAddrPick`, `myAddrChange`, `myAddrHint` (ikkala yuzda) va
  `workHoursL` (saytda): eski manzil kartasi ularni ishlatardi, yangi qator
  esa faqat "qaysi nuqta" degan javobni ko'rsatadi. **Test 20 buni QIZIL
  QILMAYDI** — u faqat ogohlantiradi, va o'lchandi: ishlatilmagan kalitlar
  **12 → 16** ga chiqdi. Ya'ni bu jimgina o'sadigan qoldiq; kalitlarni
  o'chirish yoki tanlash oynasida ishlatish alohida band **(a bandi HAMON
  ROST)**; (b) ✅ **production'ga chiqarildi** — bu yerda ilgari
  "chiqarilmagan, bu yozuv «yozildi», «ishlayapti» EMAS" deb turardi va
  da'vo ESKIRDI: o'lchandi (2026-08-13), jonli `script.js?v=40` repodagi
  bilan bayt-baytga mos (`d4a5ad5e9d22`), ichida `p-row` 14 marta va
  `toggleContact` **0 marta** — ya'ni yozuvda va'da qilingan o'zgarish
  aynan production'da; (c) ✅ `panel.js` dagi "Yangilanish:" matni ham
  yangilandi (`b651722`) — u da'vo ham eskirgan edi
- [2026-08-13] **Videoni O'CHIRISH amali (`video_remove`) — oldingi commit
  ochib qo'ygan teshik yopildi.** `1e17ccd` bilan video XARIDORGA ko'rina
  boshladi, olib tashlash yo'li esa YO'Q edi: nomaqbul video chiqsa faqat
  BUTUN e'lonni rad etish qolardi — ya'ni sotuvchi aybsiz mahsuloti bilan
  birga jazolanardi. Endi **mahsulot o'chmaydi**, faqat video maydonlari
  tozalanadi va sotuvchiga sabab bilan xabar ketadi ("yangi video
  yuborishingiz mumkin").
  **Amal panel → Telegram tasdiq yo'lidan o'tadi** (2026-07-27 qoidasi) —
  panel faqat so'rov yaratadi. Brauzerda tekshirildi: tugma bosilganda
  HECH QANDAY so'rov ketmadi, avval tasdiq oynasi chiqdi.
  **TARTIB: BAZA birinchi, keyin R2, keyin CDN purge** — bazadan ketishi
  bilan video ilovada ko'rinmay qoladi, ya'ni eng muhim natija BIRINCHI
  qadamda qo'lga kiritiladi va keyingi ikkitasi yiqilsa ham xaridor uni
  ko'rmaydi. Kalitlar `WITH ... FOR UPDATE` bilan O'CHIRISHDAN OLDIN
  olinadi: `RETURNING` ustunlar `NULL` qilingandan KEYIN o'qiydi va
  kalitlar yo'qolib, R2 dagi obyekt abadiy qolib ketardi.
  🔴 **NATIJA HALOL AYTILADI.** R2 o'chirish yoki purge yiqilsa amal bekor
  qilinmaydi, lekin admin javobida ANIQ yoziladi: "CDN keshi tozalanmadi —
  havola bilan hamon ochilishi mumkin, qo'lda purge qiling". Sabab
  2026-08-09 O'LCHOVI: R2 dan o'chirilgan obyekt `cdn.lolamarket.uz` da
  `cf-cache-status: HIT` bilan berilaveradi — **o'chirish faylni
  internetdan olib tashlamaydi**. Jimgina "o'chirildi" deyish eng yomon
  variant bo'lardi: moderator ish tugadi deb o'ylaydi, video esa qolaveradi
  (`NULL` reyting va `ALERT_CHAT_ID` darslari bilan bitta oila).
  `CF_API_TOKEN` / `CF_ZONE_ID` `config.js` da SHAKLI bo'yicha tekshiriladi
  va IXTIYORIY — `process.exit` YO'Q (R2/AI/karta kalitlari naqshi).
  **TEST 23 — bu ishning eng muhim qismi.** `ADMIN_ACTIONS` kalitlarini
  migratsiyadagi CHECK ro'yxati bilan solishtiradi. Migratsiya fayli QO'LDA
  ko'rsatilmaydi — `db/` dagi cheklovni belgilaydigan ENG KATTA raqamli
  fayl topiladi, ya'ni kelajakdagi migratsiya ham avtomatik qamraladi.
  Sabab `db/014` darsi: `review_hide` CHECK'ga qo'shilmagani uchun sharh
  yashirish production'da JIMGINA ishlamagan — kod yozilgan, tugma
  bosiladi, `INSERT` esa CHECK'da yiqiladi.
  **SINALGANI:** 60 test yashil (raqam mustaqil qayta o'lchandi, edi 59);
  Test 23 **5 mutatsiya bilan sinaldi, 5 tasi ham ushlandi** (SQL dan
  `video_remove` tushsa; kodda yangi amal bo'lib SQL da bo'lmasa; eski
  `review_hide` SQL dan yo'qolsa; `ADMIN_ACTIONS` nomi o'zgarsa;
  kelajakdagi migratsiya ro'yxatni qayta yozib `video_remove` ni tushirib
  qoldirsa). Migratsiya **pglite'da bajarildi** + nazorat sinovi (eski tur
  tushirilganda migratsiya HAQIQATAN yiqiladi) va **production'da ISHGA
  TUSHIRILDI** — jonli cheklov `video_remove` ni o'z ichiga olgani
  tasdiqlandi. Kesh: `admin/admin.js?v=24`, `panel.js?v=15`, Test 16 birga.
  🔴 **HALOL CHEGARA:** (a) `CF_API_TOKEN` / `CF_ZONE_ID` `.env` da YO'Q —
  purge O'CHIQ, ya'ni hozircha o'chirilgan video CDN keshida qolishi mumkin;
  admin buni har safar xabarda KO'RADI, jimgina qolmaydi; (b) C bosqichi
  (sotuvchi kabineti) hamon ochiq; (c) ✅ **deploy qilindi** — `b651722`
  (2026-08-13) `admin/admin.js` ni ham chiqardi. Bu yerda ilgari «deploy
  qilinmagan» deb turardi va da'vo ESKIRDI (yozilganda to'g'ri edi).

- [2026-08-13] **Mahsulot VIDEOSI — media galereya ikkala yuzda (D bosqichi):
  1-slayd rasm, 2-slayd video, va xaridor videoni ENDI ko'radi.** Founder
  qarori: "bitta mahsulot ichida 1 rasm, ikkinchi video bo'ladi". Video rasmni
  ALMASHTIRMAYDI — yoniga qo'shiladi: mato tanlashda ikkalasi ham kerak, rasm
  tarkibni, video tovlanish va to'qimani ko'rsatadi.
  Surish CSS `scroll-snap` bilan, JS bilan EMAS — barmoq harakati (inersiya,
  chekka qarshiligi) brauzerning O'ZINIKI bo'lib qolsin; JS faqat nuqtalarni
  holatga moslashtiradi.
  🔴 **Tekshiruvda IKKI nuqson topildi va ikkalasi ham "o'lik tugma"
  oilasidan** — razmetka joyida, konsolda xato yo'q, tugma esa ishlamaydi:
  (a) `scroll-behavior: smooth` — berilgan `scrollLeft` animatsiyaga
  topshiriladi va silliq surish bajarilmaydigan muhitda so'rov JIMGINA
  yutiladi; o'lchandi: 2 soniyadan keyin ham 0, ya'ni nuqta BUTUNLAY o'lik
  edi. Olib tashlandi — surishning silliqligi baribir tizimdan keladi.
  (b) Nuqta holati `scroll` HODISASIGA bog'langan edi: hodisa otilmasa nuqta
  noto'g'ri slaydni ko'rsatardi va video KO'RINMAGAN holda ovoz chiqarib
  o'ynayverardi. Endi holat bosishning O'ZIDA yangilanadi, `scroll` faqat
  barmoq yo'lini QO'SHIMCHA qamraydi — asosiy javob hech qachon hodisaga
  bog'lanmaydi.
  **Mini App'da native `controls` ISHLATILMADI** va bu ham shu oiladan:
  pastdagi kartochka hero ustiga 22px chiqib turadi (`margin-top:-22px`),
  ya'ni boshqaruv paneli YARIM YOPIQ qolardi — foydalanuvchi tugmani
  ko'radi-yu bosa olmaydi. O'rniga markazda ijro tugmasi (≤30 s lik klipda
  qidiruv chizig'i kerak emas). Saytda bunday to'siq yo'q va u yerda
  `controls` QOLDI — bir xil muammoga ikki xil yechim ATAYLAB.
  **Videosiz mahsulot AVVALGIDEK chiziladi** — galereya faqat video bor
  bo'lganda quriladi; regressiya sinovi bilan tasdiqlandi (hero 248px, fon
  joyida, yurak tugmasi bor). Bitta slayd uchun nuqta va skroll shovqindan
  boshqa narsa emas (`NULL` reyting qoidasi bilan bitta oila: yo'q narsa
  uchun bo'sh idish ko'rsatilmaydi).
  **`videoVM()` endi UCH joyga BITTA manbadan tarqaladi** (ommaviy katalog,
  moderatsiya navbati, "Kelgan videolar") — `routes/admin.js` dagi nusxa
  o'chirilib `routes/catalog.js` dan import qilinadi (`aiClientConfig`
  naqshi). **Kartochkada (ro'yxatda) video YO'Q** — ataylab: CSS fon slayd
  bo'la olmaydi va ro'yxatda avtoijro mobil trafikni yeb qo'yardi.
  Mini App'da `video`/`videoPoster` `vm()` CHEGARASIDA tozalanadi — nom va
  sotuvchi bilan bir xil sabab: qiymat `src` atributiga tushadi va chizish
  joyida `esc()` ni eslab qolishga tayanib bo'lmaydi.
  **SINALGANI:** 59 test yashil; ikkala yuz brauzerda JONLI sinaldi haqiqiy
  video bilan — nuqta bosilishi, barmoq yo'li, slayddan chiqilganda video
  to'xtashi, ijro tugmasi va videosiz regressiya.
  Kesh: `script.js?v=39`, `style.css?v=48` (ikkala HTML birga),
  `telegram-app/app.js?v=79`, `telegram-app/styles.css?v=24`, Test 16 birga.
  🔴 **HALOL CHEGARA:** (a) **video O'CHIRISH amali hali YO'Q va endi bu
  nazariy emas** — video shu commitdan keyin XARIDORGA ko'rinadi; amal uch
  qismli: Telegram tasdig'i, `admin_actions_kind_check` migratsiyasi
  (`db/014` tuzog'i) va Cloudflare purge (2026-08-09 o'lchovi: o'chirilgan
  obyekt `cf-cache-status: HIT` bilan berilaveradi); (b) C (sotuvchi
  kabineti) va F (qorovul testlar) OCHIQ — bu ish qo'shgan test soni yana
  NOL; (c) ✅ **deploy qilindi va production'da o'lchandi** (2026-08-13):
  24 e'londan 2 tasida haqiqiy video bor va CDN'dan ochiladi (2.13 MB / 11 s
  va 1.76 MB / 15 s), galereya ikkala yuzda jonli. Ilgari bu yerda «deploy qilinmagan — ungacha
  xaridor uchun u mavjud emas» deb turardi.

- [2026-08-13] **"Biz bilan bog'lanish" ochiladigan bo'lim bo'ldi, qo'ng'iroq
  tugmasi TIRILDI, va C4 (karta CSP'si) jonli o'lchov bilan tuzatildi.**
  To'rtta commit, bitta ip: **kod to'g'ri turgani uni ishlaydi qilmaydi.**
  Uchala nuqson ham jimgina edi — konsolda xato yo'q, razmetka joyida,
  foydalanuvchi uchun esa funksiya YO'Q.

  **1. C4 — karta production'da BLOKLANGAN edi** (`3d77443`). C4 bo'limining
  birinchi nusxasi "CSP hali qo'llanmagan, xavf KELAJAKDA" derdi va uning
  manbai hujjatning O'ZI edi (C3 founder qadamini kutmoqda deb turardi).
  Jonli `curl -sI` esa CSP **allaqachon majburlanayotganini** ko'rsatdi, ya'ni
  karta kelajakda emas, HOZIR o'lik edi. Bu «hujjatdagi raqam — tekshirilmagan
  da'vo» qoidasining HOLAT darajasidagi takrori: raqam emas, "qoida hali
  yoqilmagan" degan gap yolg'on bo'lib chiqdi.
  Kerakli mezbonlar endi TAXMIN emas, **O'LCHOV**: karta CSP'siz muhitda
  ochildi va brauzerning `performance` resurs yozuvlaridan mezbon + resurs
  TURI yig'ildi (tur direktivani belgilaydi). ⚠️ **O'lchov taxminni RAD ETDI** —
  `connect-src` kerak emas ekan: Yandex 2.1 modullarni `<script>`, plitkalarni
  `<img>` bilan oladi va XHR ishlatmaydi. Ya'ni taxmin bo'yicha yozilgan CSP
  keraksiz kengroq bo'lardi. Yangi kanonik qiymatga `media-src` ham kiritildi
  (mahsulot videosi uchun — alohida ish, lekin CSP bitta satr).
  Founder CSP ni yangiladi va **karta production'da chizilishi ko'z bilan
  tasdiqlandi.**

  **2. Qo'ng'iroq tugmasi o'lik edi** (`98539ca`). Founder aytdi. Razmetka
  to'g'ri (`tel:+998939993996`, hech narsa to'smagan) — nuqson `tel:` ning
  O'ZIDA: kompyuter brauzerida telefon ilovasi ro'yxatdan o'tmagan bo'lsa
  bosish JIMGINA hech narsa qilmaydi, Telegram WebView'i esa `http(s)` dan
  boshqa sxemani ko'pincha umuman ochmaydi.
  ⚠️ **Bu MENING tekshirilmagan da'vom edi:** kod izohida "`tel:` ni WebView
  ham, brauzer ham o'zi to'g'ri boshqaradi" deb yozilgandi. Izoh ham tuzatildi.
  Yechim muhitni ANIQLASHGA tayanmaydi — u yana bir taxmin bo'lardi: havola
  `tel:` bo'lib QOLADI va `preventDefault` chaqirilmaydi (qayerda ishlasa,
  o'sha yerda native qo'ng'iroq ochilaveradi), ustiga raqam **buferga
  nusxalanadi** va toast chiqadi. Nusxalash ikki yo'ldan — `navigator.clipboard`,
  u bo'lmasa `execCommand` (WebView'da birinchisi yo'q bo'lishi mumkin);
  **ikkalasi ham yiqilsa foydalanuvchiga AYTILADI**, chunki jimgina
  "nusxalandi" deyish yolg'on. Haqiqiy bosish bilan sinaldi.

  **3. "Biz bilan bog'lanish" — ochiladigan bo'lim** (`9cd3b9d`, founder
  qarori). Bitta bosiladigan qator (ikonka, sarlavha, "Qo'ng'iroq yoki
  Telegram" izohi, aylanadigan strelka); ochilganda ikki karta: 📞 raqam +
  "Qo'ng'iroq qilish" va ✈️ "Telegram orqali" + `@furqattukhsanov`. Yopiq
  holat boshlang'ich — profil ekrani allaqachon uzun edi. **Faqat blokning
  O'ZI qayta chiziladi, butun ekran EMAS:** `renderDrawer()` / `renderProfile()`
  skrollni boshiga qaytarardi va foydalanuvchi bo'limni ochib, ekran tepaga
  sakraganini ko'rardi.
  🔴 **Yo'l-yo'lakay JIMGINA nuqson va u UCHINCHI marta takrorlangan naqsh:**
  `.contact-block` flex ustunda **127px** ga siqilgan, ichidagi mazmun 210px
  edi va `overflow: hidden` bilan **TELEGRAM QATORI butunlay kesilgan** —
  DOM'da element bor, ekranda yo'q, konsolda xato yo'q. Faqat
  `getBoundingClientRect()` bilan o'lchaganda ko'rindi. `flex: none` bilan
  tuzatildi.

  **4. Tuzoq qoidaga yozildi** (`649be56`). `<picture>` → `.addr-map` (63px) →
  `.contact-block` (127px) — uchalasi bir xil sabab: flex bolasi standart
  holda siqiladi (`flex-shrink: 1`), `overflow: hidden` esa nuqsonni jimgina
  qiladi. CLAUDE.md ga qoida qo'shildi va unda **usul** ham yozildi: ko'z
  bilan qarash yetarli emas, `el.getBoundingClientRect()` ni ichidagi element
  bilan solishtirish kerak (bola pastki chegarasi otadan oshsa — kesilgan).
  Bu «yozilgan qoida himoya emas» oilasidan, lekin bu yerda test yozib
  bo'lmadi — shuning uchun u ODAT darajasida qoladi.

  **PRODUCTION'DA TASDIQLANGAN:** CI success, `script.js?v=38`,
  `style.css?v=47`, `mini-app/app.js?v=78` jonli ko'rildi; karta production'da
  chizildi.
  🔴 **OCHIQ QOLGANI, ataylab yoziladi:** (a) **Mini App ichidagi karta faqat
  Telegram ichida ochilganda ko'rinadi** — buni founder tasdiqlashi kerak,
  brauzerdan o'lchab bo'lmaydi; (b) **Yandex kaliti `lolamarket.uz` domeniga
  cheklanganini konsolda tekshirish kerak** — u localhostdan ishladi, ya'ni
  cheklov HOZIR yo'q bo'lishi mumkin va kalit boshqa saytda ishlatilishi
  mumkin; (c) `panel.js` dagi "Yangilanish:" matni eskirgan — parallel ish
  (video + media galereya) tugagach yopiladi, chunki `panel.js` tegilsa
  `?v=` va Test 16 jadvali ham birga o'zgarishi kerak.

- [2026-08-13] **Mahsulot VIDEOSI — qabul qilish, saqlash va moderatsiya
  (A+B+E bosqichlari).** Sotuvchi botga qisqa video yuboradi, u
  `cdn.lolamarket.uz` ga tushadi va admin panelda ko'riladi. Rasm yo'lining
  yonidagi ikkinchi tarmoq (`db/023_product_video.sql` — sakkiz ustun:
  `vid_file_id`, `vid_r2_key`, `vid_poster_file_id`, `vid_poster_r2_key`,
  `vid_seconds`, `vid_bytes`, `vid_at`, `awaiting_video`).
  **ENG MUHIM FARQ — TARTIB TESKARI: avval R2, KEYIN baza.** Rasmda R2 "eng
  yaxshi harakat" edi: yiqilsa ham `img_file_id` orqali Telegram proksisi
  rasmni ko'rsataverardi. **Videoda bu pog'ona YO'Q** — `handleProductPhoto`
  faylni butunlay `pipe` qiladi va `Range` (HTTP 206) bermaydi, iOS Safari esa
  `<video>` uchun aynan shuni talab qiladi. Ya'ni R2 siz yozilgan `vid_file_id`
  hech qachon ochilmaydigan videoni "bor" deb ko'rsatuvchi **jimgina yolg'on**
  bo'lardi. Endi R2 yiqilsa bazaga UMUMAN yozilmaydi va sotuvchi buni ESHITADI
  ("hozir saqlab bo'lmadi, qayta yuboring" — "qabul qilindi" DEYILMAYDI).
  `vid_file_id` shunga qaramay saqlanadi: R2 — qo'shimcha ombor, almashtiruvchi
  emas (2026-08-09 qoidasi).
  **Chegaralar — mp4, ≤30 s, ≤12 MB — va HAR RAD ETISH TUSHUNTIRILADI**
  (`videoRadSababi`): sotuvchi nima uchun o'tmaganini va nima qilishini
  o'qiydi ("fayl sifatida emas, oddiy video qilib yuboring"). Tekshiruv
  baytlarni YUKLASHDAN OLDIN bo'ladi — Telegram `duration`/`file_size`/
  `mime_type` ni xabarning o'zida beradi; keyin rad etish 12 MB ni bekorga
  tortib olish bo'lardi, ustiga Bot API 20 MB dan kattasini umuman bermaydi va
  xato "fayl topilmadi" bo'lib kelib sababi butunlay boshqa narsaga o'xshardi.
  Har rad etishda `awaiting_video` **ochiq qoladi** — qayta urinish darrov
  ishlasin.
  **`ffmpeg` QO'SHILMADI:** muqovani (birinchi kadr) Telegram o'zi beradi
  (`msg.video.thumbnail`) — `lib/png.js` da `sharp` dan voz kechilgani bilan
  bitta mulohaza, nativ paket deploy'ga yangi sinish nuqtasi qo'shardi.
  Muqova o'z `try` i bilan: u yo'qolsa video yo'qolmaydi (chiqishda mahsulot
  rasmiga tushamiz), xato esa YUTILMAYDI — alertga chiqadi.
  **Kalit TARKIBDAN** (baytlarning `sha256` i) — obyekt `immutable,
  max-age=31536000` bilan yotadi, tasodifiy kalitda video almashgan kuni
  eskisi bir yil ko'rinib turardi. Muqova ayni hashga bog'lanadi va video
  bilan birga eskiradi.
  **Admin panel (E):** moderatsiya kartochkasida `<video>` rasm TAGIDA (ustiga
  emas — moderator ikkalasini ham ko'rishi kerak), yonida davomiylik va hajm.
  **Alohida "Kelgan videolar" ro'yxati** qo'shildi va u ATAYLAB `status`
  bo'yicha filtrlanmaydi: navbat faqat `pending` e'lonlarni ko'rsatadi, video
  esa ALLAQACHON NASHR QILINGAN mahsulotga ham keladi — u holda video hech
  qanday navbatga tushmasdan katalogga chiqib ketardi va uni **hech kim
  ko'rmasdi**. Tartib `vid_at` bo'yicha, `created_at` bo'yicha EMAS: eski
  e'longa bugun kelgan video ro'yxat tubida qolib ketardi. `preload="none"` —
  ro'yxatda 50 tagacha video bo'lishi mumkin. Video bloki BITTA funksiyadan
  chiqadi (`videoVM` serverda, `videoBlock` panelda) — ikki joyda qo'lda
  yig'ilsa biri ortda qolardi. Havola yasab qo'yilmaydi: R2 domeni ulanmagan
  bo'lsa `video: null` va blok umuman chizilmaydi — ishlamaydigan pleyer yo'q
  pleyerdan yomonroq, moderator "video buzuq" deb o'ylab sababini hech qachon
  ko'rmasdi. Davomiylik yoki hajm kelmasa o'sha bo'lak tashlab ketiladi
  ("o'ylab topilgan raqam ko'rsatilmasin" qoidasi — `null` "0 soniya" emas).
  **Webhook'da video ALOHIDA yo'lga ajratildi:** ilgari `msg.video` ham
  `handleProductImage` ga tushardi va u videoni **jimgina tashlab yuborardi** —
  sotuvchi hech qanday javob olmasdi.
  **CSP:** `docs/xavfsizlik-sarlavhalari.md` ga `media-src 'self'
  https://cdn.lolamarket.uz` qo'shildi. `img-src` buni QAMRAMAYDI — `<video>`
  uchun brauzer `media-src` ga qaraydi, u aytilmasa `default-src 'self'` ga
  tushadi va R2 domeni rad etiladi. ⚠️ **BU YERDA AVVAL NOTO'G'RI YOZILGAN
  EDI:** "qoida hozir majburlanmagani uchun video ishlayveradi, bu kelajakdagi
  tuzoq" deyilgandi. CSP 2026-08-02 dan beri MAJBURLASH rejimida, ya'ni tuzoq
  kelajakda emas — O'SHA KUNI otilishi mumkin edi va faqat `media-src` o'z
  vaqtida qo'shilgani uchun otilmadi. Jonli o'lchandi: `curl -sI` javobida
  `media-src 'self' https://cdn.lolamarket.uz` BOR.
  **SINALGANI:** to'plam yashil — **59 test** (`server/test.js`). ⚠️ Raqam
  hisobot paytida TUZATILDI: ish davomida u **53** deb aytilgan edi, chunki
  `function test…` ta'riflari sanalgan — loyihada esa hisob RUNNER
  CHIQISHIDAGI `Test NN` belgilari bo'yicha yuritiladi va ikki usul ayni
  javobni berdi (59 va 59; funksiya ta'riflari esa 56 ta, ya'ni bir funksiya
  bir nechta belgini qamraydi). Farq zararsiz emasdi: yonidagi yozuvda 59
  turgani uchun 53 deb yozilsa **testlar KAMAYGANDEK ko'rinardi**. Bu ish
  qo'shgan test soni — **NOL**; migratsiya **pglite'da
  BAJARILDI** va o'zining ichki tekshiruvi 5 mutatsiya bilan sinaldi (ustun
  yetishmasa, `NOT NULL` qo'yilsa, `DEFAULT true` bo'lsa, eski qatorlar ochiq
  qolsa — beshtasi ham QIZIL berdi); admin paneli brauzerda jonli chizdirildi
  va XSS qorovuli ham sinaldi (mahsulot nomi va sotuvchi nomiga
  `<img src=x onerror=…>` — bajarilmadi).
  ⚠️ **Bu ish YANGI QOROVUL QO'SHMADI va bu ataylab belgilangan qarz:** F
  bandi (chegaralar, R2-avval tartibi va `awaiting_video` bayrog'i uchun
  testlar) OCHIQ. Loyihaning o'z darsi — "yozilgan qoida himoya emas, uni
  tekshiradigan test himoya" — bu yerda hali BAJARILMAGAN.
  Kesh: `admin/admin.css?v=18`, `admin/admin.js?v=23` — Test 16 jadvali
  birga yangilandi.
  🔴 **OCHIQ:** (a) `db/023` migratsiyasi **serverda hali ishga
  tushirilmagan** — ungacha video yuborilsa endpoint xato beradi (bayroq
  ustuni yo'q); (b) **C** — `/api/products` va sotuvchi kabineti video
  maydonlarini qaytarmaydi; (c) **D** — katalogda media galereya
  (1-slayd rasm, 2-slayd video); (d) **F** — qorovul testlar.
  ⚠️ **D dan OLDIN video O'CHIRISH amali kerak:** hozir kelgan videoni olib
  tashlashning YO'LI YO'Q, ya'ni nomaqbul video xaridorga ko'rsatila
  boshlagan zahoti uni to'xtatib bo'lmaydi. Amal uch qismdan iborat —
  Telegram tasdig'i (panel yozuvi qoidasi), `admin_actions_kind_check` ga
  yangi tur uchun migratsiya (`db/014` tuzog'i: ro'yxatga qo'shilmasa amal
  production'da JIMGINA ishlamaydi) va **Cloudflare cache purge**, chunki
  2026-08-09 da o'lchangan: obyekt R2 dan o'chirilgandan keyin ham CDN uni
  `cf-cache-status: HIT` bilan berib turadi — **o'chirish uni internetdan
  olib tashlamaydi**

- [2026-08-13] **Profilda "Mening manzilim" va "Biz bilan bog'lanish" —
  ikkala yuzda.** Founder so'ragan ish: xaridor doimiy BTS olish nuqtasini
  KARTADAN belgilasin. **Yetkazish modeli O'ZGARMADI** — mato baribir BTS
  nuqtasiga boradi (PRD, `db/010`); saqlanadigan yagona narsa "men doim SHU
  nuqtadan olaman" degan tanlov. **Bazaga ko'chdi:** `users.pickup_point_id`
  (`db/022_pickup_point.sql` — migratsiya o'zi ichida tekshiradi: ustun bormi,
  `NULL` qabul qiladimi, uzunlik chegarasi HAQIQATAN ishlaydimi). Yozuv —
  `POST /api/pickup-point` (`server/routes/profile.js`), o'qish — `/api/me`
  javobidagi `pickupPointId` (qo'shimcha so'rov qilinmaydi).
  **Kimlik `requestUser()` dan** — `authUser()` dan EMAS: C1 va C2 da ikki
  marta tishlagan naqsh uchinchi marta takrorlanmasin, aks holda manzil faqat
  Mini App'da saqlanib, sayt xaridori jimgina 401 olardi.
  **"Biz bilan bog'lanish":** telefon `+998 (93) 999-39-96` bosilsa qo'ng'iroq
  (`tel:`), `@furqattukhsanov` bosilsa Telegram ochiladi. ⚠️ Mini App'da bu
  oddiy `<a>` EMAS — `openTelegramLink()`, chunki `t.me/...` havolasi WebView
  ichidagi brauzerda ochilib foydalanuvchi chatga TUSHMASDI.
  **Karta IXTIYORIY:** `YANDEX_MAPS_KEY` (`server/config.js` da shakl
  tekshiruvi — `ALERT_CHAT_ID` darsi; `server/lib/maps.js` sozlamani IKKALA
  kanalga bitta funksiyadan tarqatadi). Kalitsiz karta tugmasi umuman
  chizilmaydi va nuqta ro'yxatdan tanlanadi — funksiya TO'LIQ ishlayveradi va
  server TO'XTAMAYDI. Bu ataylab: manzil o'zgartirishni tashqi xizmatga
  bog'lash "ishlamaydigan tugma" holatini yaratardi.
  **Yo'l-yo'lakay ikki JIMGINA nuqson tuzatildi:** (a) karta qutisi flex
  konteynerda 300px o'rniga **63px** ga siqilardi — karta "yuklanmayapti"dek
  ko'rinardi, aslida joyi yo'q edi; (b) nuqta bo'shatilganda `localStorage`
  dan O'CHIRILMASDI (`setBtsPoint` faqat yozardi) — boshqa qurilmada bekor
  qilingan tanlov bu yerda qayta yuklashda TIRILARDI.
  **Xavfsizlik:** `.gitignore` ga `.env` qo'shildi — ilgari YO'Q edi, ya'ni
  bitta `git add -A` `server/.env` ni (bot tokeni, admin kaliti, R2 sirlari)
  ommaviy repoga chiqarib yuborishi mumkin edi. Fayl lokal kompyuterda yo'q
  bo'lgani uchun bu xavf ko'rinmasdan turgan.
  **Qorovullar:** Test 22 (nuqta id SHAKLI — ro'yxat emas, `db/014` tuzog'i
  takrorlanmasin: `bts-12`, `BTS-112`, `bts-112\n`, `../../etc/passwd` va 13
  boshqa yaroqsiz qiymat rad etiladi; endpoint tekshiruvni HAQIQATAN
  chaqirishi ham o'qiladi), 22b (karta sozlamasi: `<key>` namunasi rad
  etiladi, o'chiq holatda `mapsKey` `null` — bo'sh satr EMAS, ikkala kanal
  bitta funksiyadan oladi, `process.exit` YO'Q), 22c (`BTS_POINTS` va
  `SUPPORT` ikki yuzda harfma-harf bir xil — ro'yxat MANBADAN o'qiladi, ya'ni
  yangi nuqta avtomatik qamraladi; koordinata almashib ketsa —
  kenglik/uzunlik 41/69 → 69/41 — chegara tekshiruvi ushlaydi).
  **12 mutatsiya bilan sinaldi, 12 tasi ham ushlandi. Jami 59 test yashil.**
  ⚠️ Ish davomida bu raqam **60** deb aytilgan edi va u NOTO'G'RI chiqdi —
  hisobot yozilayotganda ikki mustaqil usul bilan qayta o'lchandi: runner
  chiqishidagi noyob `Test NN` identifikatorlari = 59 va `test.js` manbasidagi
  sarlavhalar = 59; ustiga oldingi commit 56 ta edi va bu ishda 3 ta qo'shildi
  (56 + 3 = 59). Raqam INDEKSDAN alohida o'lchandi (`git show :server/test.js`),
  ya'ni u ish daraxtidagi boshqa o'zgarishlarga tayanmaydi. Bu CLAUDE.md dagi
  «hujjatdagi raqam — tekshirilmagan da'vo» qoidasining aynan o'zi va u
  «32 test → aslida 33 ta» darsining takrori: yozib qo'yilganda ishonch
  uyg'otadi, tekshirilganda esa yolg'on bo'lib chiqadi.
  Kesh: `style.css` v46, `script.js` v36, `telegram-app/app.js` v76 — Test 16
  jadvali bilan birga (uchala HTML'da bir xil raqam).
  **Hujjat:** CLAUDE.md ga qoida, `server/README.md` ga `YANDEX_MAPS_KEY`,
  `docs/xavfsizlik-sarlavhalari.md` ga **C4** — CSP yoqilganda
  `api-maps.yandex.ru` qo'shilmasa karta JIMGINA o'ladi (u yerdagi manba
  ro'yxati hujjatdan olingan, jonli o'lchovdan EMAS va shunday belgilangan).
  ⚠️ **BU IKKI GAP ERTASI KUNI TUZATILDI** (yuqoridagi 2026-08-13 yozuviga
  qarang): "CSP yoqilganda" NOTO'G'RI — u ALLAQACHON majburlanayotgan edi va
  karta production'da o'sha kuni o'lik turgan; manba ro'yxati ham endi
  o'lchovdan olingan va o'lchov `connect-src` ni RAD ETDI.
  🔴 **OCHIQ (founder qadamlari):** serverdagi `.env` ga `YANDEX_MAPS_KEY`
  qo'shilishi va `db/022` migratsiyasi ishga tushirilishi kerak. Ikkalasisiz
  ham sayt sinmaydi — karta chizilmaydi, manzil esa saqlanmaydi (endpoint
  ustun yo'qligidan xato beradi).

- [2026-08-13] **C2 — Sotuvchi kabineti SAYTDA.** C1 (AI saytda) bilan AYNI
  tuzoq, faqat kengroq: `requireSeller()` (`server/lib/auth.js`) `authUser()`
  da edi — **bitta funksiya beshta endpointni qo'riqlaydi**, ya'ni butun
  kabinet (mahsulotlar, buyurtmalar, bahs javobi) sayt sotuvchisiga JIMGINA
  401 berardi. `handleMe` (`routes/seller.js`) va `handleSubmitProduct`
  (`routes/catalog.js`) ham o'sha holatda edi — uchalasi `requestUser()` ga
  o'tkazildi. Moderatsiya endpointlari ATAYLAB `authUser()` da qoldi (sayt
  ularni chaqirmaydi — Mini App admin oqimi; CLAUDE.md dagi istisno aynan
  shu holat uchun). Saytga qo'shilgani (`script.js` sotuvchi bloki,
  `style.css` +~150 qator kabinet CSS'i): kabinet uch ko'rinishda (e'lonlar /
  forma / buyurtmalar), profilda kirish tugmasi, e'lon qo'shish va tahrirlash,
  yashirish (`draft`) / ko'rsatish (`pending`), buyurtma qabul / rad /
  jo'natish + kuzatuv raqami (raqamsiz so'rov KETMAYDI), bahs javobi.
  **Rasm yuklash saytga ATAYLAB qo'shilmadi** — bot orqali so'raladi
  (`awaiting_image` + Telegram xabari), Sprint 7 dagi "fayl yuklash o'rniga
  file_id" qarori bilan bitta chiziqda.
  🔴 **Qorovulda HAQIQIY teshik topildi va tuzatildi:** Test 3f faqat
  marshrut faylining ichini ochardi, `requireSeller` esa `lib/auth.js` da —
  uni chaqiradigan handler "kimlik so'ramaydi" (ochiq endpoint) deb sanalib,
  mutatsiya JIMGINA o'tib ketdi. Endi `kengaytir()` modul chegarasidan
  o'tadi (`lib/auth.js` ham qaraladi); shundan keyin mutatsiyalar ushlandi.
  **Dars: qorovulning o'zi ham mutatsiya bilan sinalmasa qorovul emas.**
  Brauzerda stub bilan o'lchandi: kabinet ochilishi, holat belgilari,
  yashirish/ko'rsatish, PATCH/POST tanalari, rad etishda tasdiq (bekor
  qilinsa so'rov ketmaydi), mobil ko'rinish; XSS sinovi — xaridor yozgan
  olti maydonga `<img src=x onerror=…>` qo'yildi, hech biri bajarilmadi.
  ⚠️ Haqiqiy backend bilan sinalmagan (lokal Postgres yo'q); `server/`
  deploy'i qo'lda — founder bajaradi

- [2026-08-13] **C3 boshlandi — sayt ikki tilli (UZ/RU).** Header'da til
  almashtirgich (`data-lang-btn`), tanlov `localStorage` da. **HTML o'zbekcha
  QOLADI (SEO)** — ruscha tarjima `data-i18n` / `data-i18n-ph` /
  `data-i18n-aria` atributlari orqali ustiga qo'yiladi (`applyLang()`);
  JS chizadigan matnlar `t('kalit')` bilan `STR` jadvalidan (Mini App'dagi
  naqshning o'zi). `index.html` da ~24 ta `data-i18n`, `script.js` da
  `STR.uz` / `STR.ru` jadvallari va `t()` / `L()` / `setLang()`.
  **Yangi Test 20** (`server/test.js`) — tarjima kalitlari to'liqligini
  qo'riqlaydi: kalit yo'q bo'lsa `t()` kalitning O'ZINI qaytaradi, ya'ni
  foydalanuvchi tugmada `sDisputeSend` degan yozuvni ko'radi — sahifa
  buzilmaydi, xato chiqmaydi, JIMGINA nuqson. Ro'yxat qo'lda yozilmaydi:
  `t('...')` chaqiruvlari va HTML `data-i18n` kalitlari KODDAN o'qiladi,
  ikkala jadvalda borligi, jadvallar bir xil kalitga egaligi va bo'sh
  tarjima yo'qligi tekshiriladi. ⚠️ Bu C3 ning BOSHI: bazadagi `ru`
  maydonlari (mahsulot nomi/tavsifi) hali saytda ishlatilmayapti.
  Kesh: `style.css?v=41 → 43` (index.html VA admin/index.html birga),
  `script.js?v=31 → 33`, Test 16 jadvali yangilandi. Testlar: 54 → **55**

- [2026-08-13] **AI kiyim rasmi saytga qo'shildi** — sayt xaridori endi Mini
  App'dagi AI oqimini to'liq oladi (savollar, kredit, natija, xato holatlari).
  ⚠️ **To'liq yozuv bu yerda EMAS** — `docs/sprintlar/sprint-10.md` →
  «2026-08-13 — AI kiyim rasmi SAYTDA (C1)» bo'limida. Bu yerda faqat ishora:
  bir xil ro'yxatni ikki hujjatga ko'chirish `db/014` naqshining hujjatdagi
  ko'rinishi bo'lardi — ikki nusxa jimgina ajralib ketadi. Sayt tomoniga
  tegishli qismi: `/api/auth/web/me` endi AI sozlamasini ham qaytaradi
  (kirmagan foydalanuvchiga ham), AI endpointlari sayt cookie sessiyasini
  tanidi (ilgari sayt xaridori jimgina 401 olardi), va saytning `input`
  delegatsiyasi `data-arg` ni uzatmagani tuzatildi

- [2026-08-12] **Sayt Mini App darajasiga tortildi — va ish davomida ma'lum
  bo'ldiki, sayt bilan Mini App orasidagi farq dizayn emas, IKKI XIL HAQIQAT edi.**

  **Boshlanish nuqtasi bitta kartochka bo'ldi.** `index.html` da `ik-9001`
  "Kelinlik ikat" savatga qo'shish tugmasi bilan turardi, `/api/products` da esa
  u YO'Q — bazada nashr etilmagan. Ya'ni xaridor uni savatga solib checkout'ga
  borsa, server e'lonni topa olmay buyurtmani rad etardi. **Mini App aynan shu
  nuqsonni 2026-08-02 da tuzatgan** (o'sha kungi ikkita yozuv yuqorida), sayt esa
  o'sha tuzatishni olmagan edi — chunki tuzatish `app.js` ga yozilgandi va saytga
  o'tishning hech qanday yo'li yo'q edi. Kartochka olib tashlandi (`ik-9001`
  bugun ham API'da yo'qligi `curl` bilan tasdiqlandi).

  **Lekin bitta kartochkani o'chirish nuqsonni EMAS, uning bugungi ko'rinishini
  yopardi.** Ildiz sabab shu: saytdagi katalog HTML ichida QO'LDA yozilgan, baza
  esa alohida yashaydi — ikkalasi orasida hech qanday bog' yo'q. Shuning uchun
  sotuvchilar qo'shgan e'lonlar saytda **hech qachon** ko'rinmasdi va HTML
  eskirganini bilish yo'li ham yo'q edi: u ekranni qulatmasdi, shunchaki jimgina
  yolg'on katalog ko'rsatib turardi.

  **Yechim — almashtirish emas, BIRLASHTIRISH** (`script.js` → `mergeCatalog`).
  HTML kartochkalari JOYIDA qoladi (SEO va birinchi chizilish tezligi shundan —
  ular bo'sh gridni almashtirsa sahifa API javobini kutib turardi), baza kelgach
  esa uch amal bajariladi: (1) bazada bor-u HTML da yo'q e'lon gridga QO'SHILADI;
  (2) ikkalasida bor e'lonning narxi bazadagiga TENGLASHTIRILADI; (3) bazada yo'q
  kartochka OLIB TASHLANADI. Uchinchi qadam muhim: u `ik-9001` toifasidagi
  nuqsonni **o'zini o'zi tuzatadigan** qiladi — kelajakda e'lon bazadan olinsa,
  saytda qolib ketmaydi va yana qo'lda tuzatish kerak bo'lmaydi.

  **Natija o'lchandi (taxmin emas, ikki manba solishtirildi):** `/api/products`
  da **22** e'lon, `index.html` da **11** kartochka, kesishmasi — 11 ta, ya'ni
  **11 ta sotuvchi e'loni saytda BIRINCHI marta ko'rinadi** va olib tashlanadigan
  kartochka qolmadi (`ik-9001` allaqachon ketgan).

  **Yo'l-yo'lakay uchta jimgina nuqson topildi va yopildi:**

  **(a) Rasm yo'li — soft-200 tuzog'ining aniq o'zi.** Bazadagi 11 ta eski
  e'londa `img` NISBIY (`assets/products/textile-01.jpg`) va u Mini App uchun
  yozilgan — serverda `/mini-app/assets/...` ostida yotadi, sayt ildizida esa
  bunday fayl YO'Q. Nisbiy yo'l shundoq qo'yilsa nginx `try_files ... /index.html`
  bilan javob beradi. **O'lchandi:** `lolamarket.uz/assets/products/textile-01.jpg`
  → `200 text/html` (rasm sindi, holat kodi sog'lom), `/mini-app/...` bilan esa
  → `200 image/jpeg`. Ya'ni `curl -w %{http_code}` bilan tekshirilsa hammasi
  joyidek ko'rinardi — CLAUDE.md dagi CI tuzog'ining aynan o'zi, faqat bu safar
  deploy emas, rasm yo'lida. `apiImgUrl()` nisbiy yo'lni `/mini-app/` ga
  yo'naltiradi; to'liq manzillar (`cdn.lolamarket.uz`, `/api/product-photo`)
  tegilmaydi.

  **(b) XSS teshigi — u BUGUN ochildi, o'zi turgan joyda emas.** `lineHtml` va
  `favLineHtml` da `<img src="${p.img}">` qochirilmagan edi va **kechagacha bu
  xavfsiz edi**: `p.img` HTML dagi o'z `data-*` idan kelardi. Katalog bazadan
  kela boshlagan ondan boshlab o'sha qiymat TASHQI manbaga aylandi. `esc()`
  qo'shildi. Dars aniq: xavfsiz kod xavfsizligini o'zidan emas, **ma'lumot
  manbaidan** oladi — manba o'zgarganda tegilmagan kod teshikka aylanadi.

  **(c) Savat sahifa yangilanganda o'chib ketardi.** Tozalash (savatdagi ID
  DOM'da bormi) sahifa yuklanayotganda ishlardi, o'sha ondagi DOM'da esa faqat
  HTML kartochkalari bor — sotuvchi e'loni hali kelmagan. Ya'ni xaridorning
  savatidagi HAQIQIY mahsulot "yo'q ekan" deb tashlab yuborilardi. Tozalash
  `settleCatalog()` ga ko'chirildi va u so'rov tugagach — **muvaffaqiyatda ham,
  xatoda ham** — bir marta chaqiriladi. Ikkinchi shart: tarmoq uzilsa tozalash
  umuman bo'lmay qolsa, savat abadiy eskirgan qolardi.

  **B BOSQICHI — saytda yo'q bo'lgan uchta narsa qo'shildi.**

  **BTS nuqtasi ro'yxatdan tanlanadi.** Ilgari saytda erkin matnli manzil maydoni
  bor edi va unga BTS nuqtasi bo'lmagan har qanday narsa yozilardi. Endi Mini
  App'dagi AYNI ro'yxat (5 viloyat, 9 nuqta) va **AYNI `localStorage` kaliti**
  (`lolamarket_bts_point`) — nuqta ikki kanal orasida umumiy, ya'ni saytda
  tanlagan odam Mini App'da qaytadan tanlamaydi. Serverga ham AYNI shaklda
  ketadi: `address` = "<nom>, <manzil>" + `pickupPointId`.

  **50% oldindan to'lov saytda KO'RSATILADI va stavka SERVERDAN keladi**
  (`/api/auth/web/me` javobiga `prepayRate` va `deliveryFee` qo'shildi). Saytda
  qo'lda yozilgan raqam qoldirilmadi: `PREPAY_RATE` `.env` dan o'zgarishi mumkin
  va o'zgargan kuni sayt xaridorga bitta raqam ko'rsatib, server boshqasini
  hisoblardi. ⚠️ Bu KO'RSATISH uchun — haqiqiy summa har doim serverda qayta
  hisoblanadi (2026-07-25 qarori o'zgarmadi).

  **Buyurtma holati tarixi profilda ko'rinadi** — `order_status_history`
  jadvalidan (03-avgustda qurilgan tarix birinchi marta XARIDORGA ko'rsatildi).
  Bu **soxta "1-2-3-4 bosqich" progress EMAS**: tarix yo'q bo'lsa blok umuman
  chizilmaydi. `actor_kind` va ichki `note` ataylab berilmaydi — xaridorga kim
  o'zgartirgani kerak emas.

  **Bahs (dispute) ochish saytda ishlaydi — va bu shunchaki tugma qo'shish
  emasdi.** `handleCreateDispute` faqat imzolangan `initData` ni bilardi, ya'ni
  sayt xaridori `401` olardi: **kafolat va'da qilingan, mexanizmi esa faqat bitta
  kanalda bor edi.** Yechim uchun `requestUser()` yaratildi (`server/lib/auth.js`)
  — u Mini App (Telegram imzolagan `initData`) va sayt (HttpOnly cookie sessiyasi)
  kimligini BITTA shaklga keltiradi, shunda chaqiruvchi kodda shart tarmoqlanmaydi.
  Ikkala yo'l ham kimlikni SERVER tomonda hal qiladi — klient yuborgan
  `tg_user_id` ga hech qachon ishonilmaydi (CLAUDE.md o'zgarmadi, kengaydi).
  Buning uchun sessiya o'qish kodi `routes/web-auth.js` dan yangi
  `server/lib/web-session.js` ga ko'chirildi: u marshrutda qolganda `lib/auth.js`
  uni ishlata olmasdi (kutubxona marshrutga bog'lanib qolardi). `web-auth.js`
  qayta eksport qiladi, ya'ni tashqi chaqiruvchilar tegilmadi.

  **`logout()` endi sharh va bahslarni ham tozalaydi** — aks holda chiqib ketgan
  odamning bahsi keyingi kirgan odamning ekranida qolardi.

  **IKKI NUQSON ISHLAB CHIQISH PAYTIDA TUTILDI — ikkalasi ham testdan o'tib
  ketgan bo'lardi:**

  **(1) Tarix SQL'i production'da 500 berardi.** Birinchi variantda
  `GROUP BY h.history` bor edi — PostgreSQL `json` turi uchun tenglik operatorini
  bilmaydi (*"could not identify an equality operator for type json"*), ya'ni
  so'rov umuman ishga tushmasdi. **`server/test.js` buni KO'RMASDI**, chunki
  lokalda `DATABASE_URL` o'lik portga qaraydi va SQL matni hech qachon haqiqiy
  Postgres'ga bormaydi — bu 08-avgustdagi `takeCredits` (`unknown - unknown`)
  darsining AYNAN takrori: **taqlid qilingan baza SQL ni tekshirmaydi.** Bu safar
  farq shunda: nuqson production'ga chiqmadi, chunki so'rov pglite (WASM Postgres)
  da bajarib ko'rildi. Qayta yozildi — ikkita LATERAL, `GROUP BY` umuman yo'q
  (yonidagi ikkinchi sabab: bitta `GROUP BY` da ikkita `json_agg` bo'lsa tarkib
  qatorlari tarix qatorlariga ko'payib ketardi — dekart ko'paytmasi).

  **(2) BTS nuqtasini tanlash yozilgan ism va telefonni o'chirib yuborardi** —
  tanlov butun checkout formasini qayta chizardi. Endi faqat izoh qatori
  almashtiriladi.

  **QOROVULLAR.** Yangi **Test 3e** (`server/test.js`) `requestUser()` ni
  qulflaydi: imzolangan `initData` qabul qilinadi; `initData` yo'q bo'lsa cookie
  yo'liga tushadi; ikkalasi ham yo'q bo'lsa `null` — "kirmagan" jimgina
  "kirgan"ga aylanmaydi; SOXTA `initData` cookie yo'lini ochib yubormaydi; soxta
  imzo + haqiqiy cookie birikmasida cookie EGASI qaytadi, soxta ID emas. Oxirgi
  ikkitasi bekorga emas — bu funksiya bahs ochishni himoya qiladi va u yerdagi
  xato "begona buyurtmaga bahs ochish" degani bo'lardi. **3 mutatsiya bilan
  sinaldi, 3 tasi ham ushlandi.**

  **SINOV.** `node server/test.js` — **53 test PASS, 0 ta ❌** (raqam
  `grep -c "^✅ Test"` bilan mustaqil sanaldi). Kesh-bust:
  `style.css?v=36→40` (**`index.html` VA `admin/index.html` da — ikkalasi bir
  xil raqamda**, 06-avgustdagi 15 versiyalik farq darsi), `script.js?v=27→30`,
  Test 16 hash jadvali yangilandi.

  ⚠️ **OCHIQ QOLGANI.** (a) `mergeCatalog` HAQIQIY brauzerda, jonli API bilan
  hali ko'rilmagan — 22 e'lonning gridga tushishi, 11 yangi kartochkaning
  rasmi va filtr bilan kesishishi **deploy'dan keyin QO'LDA tasdiqlansin**;
  o'lchangani API javobi va HTML tarkibi, ya'ni "chizilishi kerak", "chizildi"
  emas. (b) Sayt bahsi production'da hali ochilmagan — cookie yo'li `requestUser`
  orqali BIRINCHI marta ishlaydi. (c) Tarix SQL'i pglite'da tekshirildi, haqiqiy
  Postgres'da hali ishlamagan — pglite AYNI dvigatel emas.

- [2026-08-03] **Buyurtma oqimining har bir holat o'zgarishi endi tarixga yoziladi**
  (`order_status_history`). Buyurtma tug'ilishi (Mini App va sayt), sotuvchining
  accept/reject/ship amali, bot buyruqlari va admin panelning payout/refund/bahs qarori —
  beshala yozuv nuqtasi ham holat bilan BITTA tranzaksiyada tarixga "qachon, qaysi holatdan
  qaysisiga, kim" yozadi. Bu Sprint 4 dagi buyurtma oqimining o'zini o'zgartirmaydi —
  qorovullar va xatti-harakat aynan oldingidek qoldi, faqat `UPDATE` lar `prev` CTE ga
  o'tkazildi (oldingi holatni olish uchun). **To'liq tafsilot, qarorlar va ochiq qarz —
  Sprint 8 dagi 2026-08-03 "B4" yozuvida.**

- [2026-08-02] **Bosh sahifadagi kartochkalar refreshda joyini almashtirardi —
  yuqoridagi tuzatishning davomi, ildizi esa o'sha zaxira massiv edi.**

  **Shikoyat.** Foydalanuvchi: "ilovani refresh qilganda birinchi sahifadagi
  mahsulotlar joyni bir o'zgartirib olgandek". Tekshirildi — haqiqiy nuqson.

  **Sabab.** Ilova ikki marta chiziladi: avval kod ichidagi ZAXIRA massiv bilan
  (darhol), keyin katalog bazadan kelgach (`loadProductsFromServer()` `PRODUCTS`
  ni almashtiradi). `FEATURED_IDS` da `ik-9001` bor edi, u esa faqat zaxirada,
  bazada YO'Q. Natijada 1-chizish `ik-1402, ik-9001, sz-3310, hb-7740`,
  2-chizish esa `ik-1402, sz-3310, hb-7740, ad-0890` — **4 kartochkadan 3 tasi
  ko'z oldida joyini almashtirardi.** Narxlar solishtirildi: zaxira va baza
  narxlari bir xil, ya'ni yagona ko'rinadigan farq tartib edi.

  **Muhim: bu ertalabki tuzatish YARATGAN nuqson emas, u KO'RSATIB QO'YGAN
  nuqson.** Ilgari `renderHome()` `ik-9001` ni topa olmay xato tashlardi va bosh
  sahifa umuman yangilanmasdi — foydalanuvchi eskirgan, lekin QIMIRLAMAYDIGAN
  ekranni ko'rardi. Ekran ishlay boshlagach, ostidagi ma'lumot nomuvofiqligi
  ko'rinib qoldi.

  **Tuzatildi — `telegram-app/app.js`.** (1) `FEATURED_IDS` da `ik-9001` o'rniga
  `ad-0890` (u ham zaxirada, ham bazada bor); tepasiga izoh — bu ID'lar HAR
  IKKALASIDA bo'lishi shart, aks holda kartochkalar sakraydi. (2) `ik-9001`
  zaxira massivdan butunlay olib tashlandi: u bazada hech qachon bo'lmagan, ya'ni
  zaxira massiv haqiqatdan chetga chiqib ketgandi; o'rniga izoh qoldirildi.
  (3) `S.liked` boshlang'ich qiymati `{ 'ik-9001': true }` edi → `{}`.
  `renderHome()` dagi himoya (yo'q ID'ni tashlab, o'rnini katalogdan to'ldirish)
  ATAYLAB QOLDIRILDI — u endi kutilmagan holat uchun zaxira, kundalik yo'l emas.

  **DARS: zaxira massiv bazadan chetga chiqib ketsa, u nuqson MANBAIGA
  aylanadi.** Bugun bitta shu nomuvofiqlik ikki xil nuqson tug'dirdi — avval
  ekran qulashi, keyin kartochkalar sakrashi. Zaxira massivning vazifasi —
  baza javob bermaganda bir zumga o'rnini bosish, ya'ni u bazaning MOSLASHGAN
  nusxasi bo'lishi kerak; unga bazada yo'q mahsulot qo'shilsa, u zaxira emas,
  ikkinchi haqiqatga aylanadi.

  **Sinov:** brauzerda ikkala holat (zaxira massiv va baza) uchun yakuniy ro'yxat
  hisoblab solishtirildi — eski variantda mos kelmasdi, yangisida BIR XIL.
  `node --check` o'tdi. Zaxira massivda endi aynan bazadagi 11 ta seed mahsulot
  bor. Kesh-bust: `app.js?v=58` → `?v=59`.

- [2026-08-02] **Mini App bosh sahifasi katalog bazadan yuklangan ondan boshlab
  qulardi — foydalanuvchi topdi, sabab bitta bo'lib chiqdi.**

  **Ikki shikoyat, bitta ildiz.** Foydalanuvchi ikki narsani aytdi: (a) bosh
  sahifadagi kartochkada savat "+1" ko'rinmaydi — buyurtmaning o'zi ishlaydi;
  (b) katalogdan bosh sahifaga qaytilganda sarlavha "Bosh sahifa" bo'ladi, ekranda
  esa **katalog qolib ketadi**. Ikkalasi ham `renderHome()` dagi bitta satrdan
  chiqqan: tanlangan to'rtta mahsulot IDsi kodda qo'lda yozilgan edi va ulardan
  **`ik-9001` bazada YO'Q** — u faqat `app.js` ichidagi zaxira massivda bor.
  Shuning uchun nuqson ilova ochilishida ko'rinmasdi: avval zaxira massiv ishlaydi,
  keyin `loadProductsFromServer()` katalogni bazadan yuklaydi (12 mahsulot) va
  o'sha ondan boshlab `vm(byId('ik-9001'))` →
  `Cannot read properties of undefined (reading 'badgeTone')`.

  **Nega ekran eski qolardi.** `render()` sarlavha va navigatsiyani OLDIN yangilab,
  `#screen-wrap` ni KEYIN chizadi. Chizish xato tashlaganda `innerHTML` yangilanmay
  qoladi — natijada sarlavha yangi, ekran eski. Foydalanuvchi buni "tugma ishlamadi"
  deb tushunadi, xato esa faqat konsolda qoladi. Nuqson `5c29e19` dan beri turgan.

  **Tuzatildi — `telegram-app/app.js`, uch joy.** (1) `vm(p)` mahsulot topilmasa
  xato tashlamay `null` qaytaradi; bu `renderDetail()` dagi mavjud himoyani ishlatadi.
  (2) `renderHome()` da yangi `FEATURED_IDS` konstantasi — yo'q ID `.filter(Boolean)`
  bilan tashlab yuboriladi va o'rni katalogdan to'ldiriladi, ya'ni bosh sahifa endi
  katalog tarkibiga bog'liq emas. (3) `render()` ga `try/catch`: chizish xato bersa
  eski ekran qolib ketmaydi — "Ekranni ochib bo'lmadi" + qayta yuklash tugmasi
  ko'rsatiladi, xato konsolga yoziladi.

  **Yo'l-yo'lakay ikkinchi, hali sezilmagan nusxasi topildi va yopildi:**
  `renderDetail()` (`app.js:843`) da `vm()` himoyadan OLDIN chaqirilardi, ya'ni
  `if (!p) return ''` qatori hech qachon ishlamasdi — mahsulot o'chirilsa detal
  ekrani ham xuddi shunday qularardi.

  **Sinov:** jonli baza ma'lumoti (12 mahsulot) ustida brauzerda tekshirildi —
  4 kartochka chizildi (`ik-1402`, `sz-3310`, `hb-7740`, `ad-0890`), `null` yo'q,
  `homeCard` ishlaydi. Chegara holatlari: tanlangan ID'larning HAMMASI yo'qolsa ham
  4 ta to'ldiriladi; katalog bo'sh bo'lsa xato bermaydi. `node --check` o'tdi.
  Kesh-bust: `app.js?v=55` → `?v=56`.

- [2026-07-31] **Sharh tizimi qurildi — katalogdagi soxta reyting yolg'oni yopildi.**
  Shu kuni ochilgan "reyting o'ylab topilgan raqam" savoli (b) yo'li bilan hal qilindi:
  reytingni UI'dan olib tashlash o'rniga uni HAQIQIY qilish. Sabab — reyting PRD'ning
  ikkita user story'si (№2 xaridor sotuvchi reytingini ko'radi, №15 sotuvchi o'zinikini
  ko'radi), ya'ni uni olib tashlash muammoni yashirardi, yopmasdi.

  **Model:** sharh BUYURTMAGA bog'lanadi (`db/012_reviews.sql`). Xaridor faqat o'zi
  olgan matoga baho qo'yadi — buyurtma yetkazilgan bo'lishi shart. Shu sababli
  **moderatsiya darvozasi qurilmadi**: soxta sharh yozish uchun avval haqiqiy buyurtma
  berib, uni yetkazib olish kerak bo'ladi. Bitta buyurtmadagi bitta mahsulotga bitta
  sharh — bu qoida BAZADA, unikal indeksda turadi (ilova darajasida tekshirilsa, ikki
  bir vaqtdagi so'rov ikkita sharh yozib yuborardi — zaxira bug'ining aynan o'zi).

  **Reyting hosila:** `products.rating` / `products.reviews` va `sellers.rating`
  ustunlari saqlandi, lekin ularning yagona yozuvchisi endi `recalcRating()` —
  `avg(stars)` va `count(*)` dan hisoblaydi. Qo'lda `reviews = reviews + 1` qilish
  ATAYLAB taqiqlandi va test bilan qamaldi: sharh yashirilganda son kamaymay qolardi.
  Sharh yo'q bo'lsa reyting `0` emas, `NULL` — "baholanmagan" va "yomon baholangan"
  bir xil narsa emas; `NULL` bo'lsa UI reyting blokini UMUMAN ko'rsatmaydi.

  **Soxta sonlar tozalandi** ikki joyda: bazada (`012` migratsiyasi, faqat ortida
  haqiqiy sharh turmagan qatorlarga tegadi — shuning uchun qayta ishga tushirsa ham
  xavfsiz) va `telegram-app/app.js` dagi zaxira massivda (12 ta mahsulotda
  `rating:4.9, reviews:42` → `null, 0`). Ikkinchisisiz tarmoq uzilganda xaridor
  yana o'sha yolg'onni ko'rardi.

  **Admin nazorati:** sharh o'chirilmaydi, `status='hidden'` qilinadi (kim, qachon,
  nega — hammasi qoladi) va shu zahoti reytingdan chiqariladi. Ikki yo'l bor:
  Telegram'da `/sharhlar` → `/sharh_yashir N sabab`, yoki paneldan `review_hide`
  (Telegram'da tasdiqlanadi — CLAUDE.md arxitektura qoidasi).

  **Tekshirildi:** `npm test` — 26 ta route, 2 ta yangi test (`recalcRating` agregatdan
  hisoblashi va `shipped` holatida sharh yozib bo'lmasligi). Brauzerda (375×812, 0 konsol
  xatosi): reyting `null` bo'lganda yulduz bloki chiqmaydi; "sharh yo'q" holati; sharhli
  ro'yxat; buyurtma kartochkasida bir mahsulotga "Baholash" tugmasi, ikkinchisiga
  "★★★★☆ Baholandi"; `shipped` buyurtmada tugma umuman yo'q; sotuvchi kabinetida
  reyting kartasi. **XSS alohida sinaldi** — sharh matni foydalanuvchidan keladi va
  `innerHTML` ga tushadi: `<img src=x onerror=alert(1)>` yuborilganda element
  YARATILMADI, matn bo'lib ko'rindi (`esc()`).

  **Bitta nuqson sinov paytida topildi va tuzatildi:** sotuvchi kartasida `4.5` reyting
  `Math.round` sababli BESHTA to'la yulduz bo'lib ko'rinardi — ya'ni ko'rsatkich
  haqiqiy bahodan yuqori edi. `Math.floor` ga o'tkazildi: yulduz hech qachon
  reytingdan oshib ketmaydi.

  ⚠️ **Serverga chiqmagan.** CI faqat statik fayl va Mini App'ni deploy qiladi;
  `server/` va `db/` qo'lda. Founder bajarishi kerak: `012_reviews.sql` migratsiyasi,
  server fayllarini ko'chirish va `systemctl restart lolamarket-notify`

- [2026-07-31] **Landing'ga mahsulot detali qurildi — sharhlar endi saytda ham ko'rinadi.**
  Yuqoridagi ishdan keyin ochiq qolgan yagona band edi: sharh tizimi tayyor, lekin
  saytda uni KO'RSATADIGAN joy yo'q edi (kartochkadan to'g'ridan-to'g'ri savatga
  qo'shilardi). Founder "albatta kerak" dedi.

  **Detal alohida sahifa emas, mavjud drawer'ning yangi ko'rinishi** (`drawerView =
  'detail'`). Sabab: yangi HTML fayl marshrutlash talab qiladi va **CI `source`
  ro'yxatiga qo'lda qo'shilishi kerak bo'lardi** — o'sha tuzoq uch sessiya davomida
  fayllarni serverga chiqarmay turgan edi (CLAUDE.md). Drawer'da esa scrim, Escape
  va scroll-lock allaqachon ishlaydi, qayta yozilmadi.

  **Ma'lumot ikki manbadan:** kartochkaning `data-*` atributlari (nom, narx, sotuvchi,
  rasm — doim bor, tarmoqqa bog'liq emas) va `/api/products` (reyting, eni, zichlik,
  tarkib, muddat). API kelmasa detal baribir ochiladi, faqat qo'shimcha qatorlarsiz —
  tafsilot qatori qiymatsiz bo'lsa UMUMAN chizilmaydi ("Eni: —" ma'lumot emas, shovqin).

  **Sharh yozish** profildagi buyurtma qatoridan: yetkazilgan buyurtmadagi har
  mahsulotga alohida "Baholash" tugmasi, baholangani "★★★★☆ Baholandi" bo'lib
  qoladi. Buning uchun `/api/web/orders` endi buyurtma TARKIBINI ham qaytaradi
  (`json_agg` + `FILTER` — tarkibsiz buyurtmada bitta `null` elementli massiv
  qaytmasin). Kimlik cookie sessiyasidan, brauzer hech qanday ID yubormaydi.

  **Kartochka endi bosiladi:** delegatsiyaga `data-action` topilmagan holat uchun
  shoxcha qo'shildi — kartochkaning bo'sh joyi detalni ochadi, ichidagi tugmalar
  (savat, yurakcha) esa `closest('[data-action]')` da ushlanib avvalgidek ishlayveradi.
  Klaviatura uchun `tabindex`/`role`/`aria-label` HTML'da 12 marta takrorlanmaydi —
  init paytida bir joyda beriladi (yangi kartochka qo'shilganda unutilmasin).

  **Brauzerda tekshirildi, 0 konsol xatosi.** 375×812 va 1280×800: detal kartochka
  nomiga bosilganda ochiladi; reyting `4.5` → ★★★★☆ (floor, oshirib ko'rsatmaydi);
  reyting `null` bo'lsa blok chiqmaydi; 5 ta tafsilot qatori; API yo'q bo'lsa detal
  data-* bilan ochiladi; sharhlar yuklanmaguncha "sharh yo'q" YOZILMAYDI; savat
  tugmasi va yurakcha detalni OCHMAYDI, kartochka tanasi ochadi; Enter bilan ham
  ochiladi; uzun nom bilan ham gorizontal toshish yo'q. **Sharh yozish oqimi
  uchidan-uchiga:** tugma → forma → 3 yulduz + matn → POST tarkibi tekshirildi
  (`{orderId, productId, stars:3, body}`) → toast → profilga qaytish → keshlar
  bekor qilinadi (aks holda xaridor o'z sharhini yozib eski reytingni ko'rib
  turardi). **Xato yo'li ham:** server 409 qaytarganda sabab toast'da ko'rinadi
  va tugma qayta yoqiladi. **XSS:** `<img src=x onerror=…>` element YARATMADI,
  matn bo'lib ko'rindi.

  **Versiyalar:** `script.js?v=22→23`, `style.css?v=34→35`

- [2026-07-31] **Narx oralig'i filtri ikkala klientga qo'shildi — "Filtr: kategoriya + narx
  oralig'i" bandining ochiq qolgan yarmi yopildi.** Shu kuni ertalab TOZALASH paytida
  "narx oralig'i filtri hech qayerda yo'q" deb ochilgan bo'shliq (pastdagi yozuvga qarang)
  o'sha kuni yopildi. **Mini App** (`telegram-app/app.js`, v53→v54): katalogdagi "Filtr"
  tugmasi `onclick`siz, ya'ni butunlay O'LIK edi — endi u `openPriceSheet()` ni chaqiradi.
  Yangi `renderPriceSheet()` bottom-sheet BTS nuqtasi sheet'ining naqshi bo'yicha qurildi
  (`paintSheet()` ga uchinchi shoxcha), yordamchi funksiyalar `inPriceRange()`, `parsePrice()`,
  `priceNum()`, `priceFilterLabel()`, `applyPriceFilter()`, `clearPriceFilter()`,
  `onPriceDraft()`; `S` ga oltita maydon (`priceMin`, `priceMax`, `priceSheet`,
  `priceDraftMin`, `priceDraftMax`, `priceErr`), `STR` uz/ru ga 11 tadan kalit. Yoqilgan
  filtr tugmada nuqta va ostidagi olib tashlanadigan chip bilan ko'rinadi; ekran almashsa
  sheet yopiladi (`render()` da `if (S.screen !== 'catalog') S.priceSheet = false`).
  **Landing** (`script.js` v21→v22, `index.html`, `style.css` v33→v34): kategoriya chiplari
  ostida "dan – gacha" maydonlari va "Qo'llash" tugmasi; yangi `okPrice()` mavjud
  `applyFilter()` ga qo'shildi, ya'ni narx kategoriya va qidiruv bilan KESISHIB ishlaydi.
  Narx JS'da takrorlanmaydi — kartochkaning mavjud `data-price` atributidan o'qiladi.
  Header'dagi `#filter-btn` ham o'lik edi (`aria-hidden="true"`, hech qanday ishlov) —
  endi `focusPriceFilter()` bilan narx maydoniga olib boradi (qadalgan header balandligi
  hisobga olinadi). **Brauzerda tekshirildi, 0 konsol xatosi:** 800 000–890 000 → 6 mahsulot,
  hammasi haqiqatan oraliqda; faqat "gacha" (5 ta) va faqat "dan" (4 ta); teskari oraliq →
  xato yozuvi chiqadi va eski filtr o'zgarmaydi; bo'sh joyli "700 000" qabul qilinadi;
  natijasiz oraliq → bo'sh holat matni + tozalash tugmasi; kategoriya + qidiruv + narx
  uchalasi birga (paxta + 705k → 1 ta); rus tili; 375px da gorizontal toshish yo'q,
  input 16px (iOS zoom yo'q), chipdagi × tugmasi 24px ko'rinishda lekin 44×44 bosish
  maydoni (±20px tegadi, 30px tegmaydi). **Qamalmagan (ataylab):** Mini App'dagi "Saralash"
  tugmasi hamon o'lik — sprint bandiga kirmaydi, alohida ish

- [2026-07-31] **Sprint 4 katalog bo'limi haqiqatga moslandi (TOZALASH).** Bandlar Next.js
  marshrutlari (`/katalog`, `/mahsulot/[slug]`) uchun yozilgani sababli hammasi `[ ]` bo'lib
  turardi, aslida funksiyalarning ko'pi landing va Mini App'da allaqachon bor edi. Har band
  taxmin bilan emas, tekshirib belgilandi. Shu jarayonda ikkita haqiqiy bo'shliq ochildi:
  **narx oralig'i filtri hech qayerda yo'q** va **landing'da mahsulot detali umuman yo'q**;
  bitta jiddiyroq muammo esa yuqoridagi "Ochiq savollar"ga yozildi (soxta reyting)

- [2026-07-30] **Rulon zaxirasi endi haqiqatan kamayadi — Sprint 4 ning eng uzoq ochiq turgan quyrug'i
  (2026-07-27 dan beri) yopildi.** Muammo: `products` da faqat `stock_key TEXT` (in / low / made) bor edi —
  bu sotuvchi QO'LDA qo'yadigan yorliq, haqiqiy son emas. Natijada bitta rulondan 100 ta buyurtma qabul
  qilinardi va katalog "mavjud" deb ko'rsatib turaverardi. Yechim uch qavatli: **(1) Sxema** —
  `db/011_product_stock.sql`: sonli `products.stock INT`, `products_stock_nonneg` CHECK cheklovi
  (`stock IS NULL OR stock >= 0`, qo'lda UPDATE qilinsa ham buzilmasin), mavjud qatorlarni mavjud
  yorliqdan taxmin qilib to'ldirish (`in`→50, `low`→5, `made`→tegilmaydi) — shunda katalogdagi hozirgi
  "Kam qoldi" belgilari yolg'onga aylanmaydi. Migratsiya idempotent. **(2) Atomik kamaytirish** —
  `server/routes/orders.js` da yangi `decrementStock(client, items)`: tekshirish va kamaytirish BITTA
  `UPDATE products SET stock = stock - $2 WHERE id = $1 AND (stock IS NULL OR stock >= $2)` da bo'ladi.
  Shart UPDATE ning WHERE qismida bo'lgani uchun race condition yo'q — ikki xaridor bir vaqtda oxirgi
  rulonni olsa Postgres qatorni qulflaydi va faqat bittasi o'tadi, ikkinchisiga "zaxirada faqat N rulon
  qoldi" / "zaxirada tugadi" deb aniq sabab qaytadi. Mahsulotlar **id bo'yicha tartiblanadi** — ikki
  buyurtma bir xil mahsulotlarni teskari tartibda qulflasa Postgres deadlock berardi. Kamaytirish
  `nextval('order_seq')` dan OLDIN chaqiriladi: ketma-ketlik ROLLBACK'da qaytmaydi, shuning uchun rad
  etilgan urinish buyurtma raqamini behuda yoqib yubormasin. Ikkala buyurtma yo'lida ham
  (`handleCreateOrder` — Mini App, `handleCreateWebOrder` — sayt). **(3) Bekor qilishda qaytish** —
  yangi `restoreStock(client, orderId)`; `server/routes/seller.js` da sotuvchi `reject` qilganda
  (mato hali jo'natilmagan) rulonlar omborga qaytadi, holat o'zgarishi va zaxira qaytishi endi BITTA
  tranzaksiyada (ilgari oddiy `pool.query` edi — rad yozilib zaxira qaytmay qolsa rulonlar butunlay
  yo'qolardi); `WHERE status = ANY(...)` qatorni qulflagani uchun tugma ikki marta bosilsa zaxira ikki
  marta qaytmaydi. **UI:** `telegram-app/app.js` (v51→v52) da yangi `stockView(p)` — ko'rinish endi
  HAQIQIY songa asoslanadi (0 → "Tugadi" qizil, ≤5 → "Kam qoldi · N" sariq, aks holda "Sotuvda";
  `null`/`undefined` → eski `stock_key` yorlig'iga qaytadi, ya'ni keshlangan eski klient buzilmaydi);
  zaxira tugagan mahsulotda "Savatga" tugmasi bloklanadi va sababi tugmaning o'zida yoziladi (server
  baribir rad etardi, lekin xaridor buni checkout'ga yetgandan keyin emas, o'sha yerda bilishi kerak);
  sotuvchi formasiga zaxira maydoni qo'shildi (bo'sh = cheksiz) va kartochkada "Zaxira: N / cheksiz"
  ko'rinadi. `catalog.js` `stock` ni katalog javobiga qo'shdi va `POST /api/products` uni qabul qiladi;
  `admin.js` + `admin/admin.js` (v17→v18) moderatsiya navbatida zaxirani ko'rsatadi. **Yo'l-yo'lakay
  tutilgan tuzoq:** sotuvchi PATCH'ida `stock` faqat so'rovda AYNAN yuborilgan bo'lsa yangilanadi
  (`hasOwnProperty`) — aks holda eski keshlangan klient bu maydonni yubormasdi va oddiy tahrirlash
  jimgina zaxira cheklovini o'chirib yuborardi. **Test:** `server/test.js` ga Test 7 — soxta pg klienti
  bilan `decrementStock` sinaladi (yetarli zaxira kamayadi, NULL cheksiz, yetmasa `ClientError` + qolgan
  son, 0 bo'lsa "tugadi", qatorlar id bo'yicha tartiblanadi). Test ATAYLAB buzib sinaldi — `WHERE` dan
  zaxira sharti olib tashlanganda test qulaydi, ya'ni u haqiqiy himoya, bezak emas; `npm test` 0 xato
  bilan o'tadi. Frontend brauzerda tekshirildi: `stockView` ning barcha shohbalari (cheksiz / eski API /
  0 / 3 / 5 / 50), tugagan mahsulotda tugma bloklangani (screenshot), sotuvchi kartochkasidagi zaxira,
  forma maydonining bo'sh→null / 0→0 / 20→20 yuborishi. **Migratsiya production'da ALLAQACHON ishga
  tushirildi va tasdiqlandi** (zaxira olingandan keyin): 8 ta `in`→50, 2 ta `low`→5, 2 ta `made`→NULL,
  1 ta test mahsuloti→NULL.

  ✅ **BACKEND DEPLOY QILINGAN — o'lchandi (2026-08-13).** Bu yerda ilgari
  "**Hali qilinmagani:** backend kodining o'zi production'ga deploy qilinmagan"
  deb turardi va da'vo ESKIRDI. Dalil: jonli `/api/products` **24 ta e'lonning
  hammasida** `stock` va `stockKey` maydonlarini qaytaradi (13 tasi `NULL` =
  cheksiz, qolganlari 3–7997 oralig'ida) — ya'ni `catalog.js` ning zaxira
  qo'shadigan kodi production'da ishlayapti. Serverning o'zi ham joyida:
  `/api/version` = `5b913cc` va o'sha commitdan keyin `server/` ichida faqat
  `test.js` o'zgargan. Uch oqim uchidan-uchigacha sinovi (Sprint 8) HAMON
  ochiq — deploy uni almashtirmaydi.
  ⚠️ Tekshirish buyrug'i (da'vo yana eskirmasin):
  `curl -s https://lolamarket.uz/api/products | grep -c '"stockKey"'`

- [2026-07-30] **Mahsulotga rasm yuklash qo'shildi** — sotuvchi mahsulot qo'shganda forma rasmsiz edi
  (Sprint 4 quyrug'idagi bo'shliq). Yechim `disputes.js`dagi Telegram file_id + HMAC proksi naqshini
  takrorlaydi: fayl bizning serverga yuklanmaydi, faqat Telegram file_id saqlanadi (`db/009_product_image.sql`
  — `products.img_file_id`, `products.awaiting_image`). `handleSubmitProduct` endi `awaiting_image=true`
  bilan yaratadi va sotuvchiga botda "rasm yuboring" deb yozadi; `server/routes/webhook.js`da kelgan rasm
  avval bahs dalili (disputes) sifatida tekshiriladi, mos kelmasa mahsulot rasmi sifatida eng oxirgi
  kutayotgan mahsulotga biriktiriladi (`handleProductImage`/`openAwaitingProductImage`). Ko'rsatishda
  server file_id'ni yangi ommaviy `/api/product-photo` (HMAC-imzolangan havola) orqali proksi qiladi —
  bot tokeni chiqmaydi (`productPhotoUrl`/`productPhotoSig`, `server/routes/catalog.js`). Sotuvchi
  kabinetida rasmsiz mahsulotga qayta rasm so'rash uchun yangi PATCH amali `request_image`
  (`server/routes/seller.js`); moderatsiya navbatida (`admin.js`) ham rasm ko'rinadi. Mini App'da
  sotuvchi kartochkasida "Rasm kutilmoqda" belgisi va "Rasm yuklash" tugmasi qo'shildi
  (`telegram-app/app.js`, v50→v51). Lokal serverda brauzerda tekshirilmadi (haqiqiy Telegram bot/DB
  kerak), lekin `server/test.js`ga Test 6 (imzo tekshiruvi: to'g'ri imzo 401 bermaydi, soxta
  imzo/parametrsiz so'rov 401 beradi) qo'shildi va o'tdi. Hali production'ga deploy/migratsiya
  qilinmagan

- [2026-07-30] **Buyurtma xulosasida logistika narxi alohida qatorda ko'rsatiladi** — BTS API hali
  ulanmagani (Sprint 6) uchun `COMMISSION_RATE` bilan bir xil naqsh qo'llandi: bitta taxminiy summa
  (`server/config.js` — `DELIVERY_FEE_ESTIMATE`, env orqali sozlanadi, default 25 000 so'm), buyurtma
  yaratilganda `orders.delivery_fee_estimate` ustuniga snapshot qilinadi (`db/010_delivery_fee.sql`).
  PRD talabiga ko'ra bu summa mahsulot jamiga QO'SHILMAYDI — xaridor uni BTS nuqtasida to'g'ridan-to'g'ri
  to'laydi. `server/routes/orders.js`da ikkala buyurtma yo'lida (`handleCreateOrder`,
  `handleCreateWebOrder`) yoziladi va admin/xaridor Telegram xabarlariga qo'shildi
  (`server/lib/telegram-api.js` — `sendBuyerConfirmMessage`ga `deliveryFee` parametri). Mini App
  (`telegram-app/app.js`, v50→v51) va landing (`script.js`, v19→v20) checkout xulosasida "Yetkazish
  (taxminiy) 25 000 so'm" alohida qator + "BTS nuqtasida to'lanadi, jamiga kirmaydi" izohi bilan —
  ikkala joyda ham brauzerda vizual tekshirildi (screenshot), summa "Jami"/"Hozir to'lanadi"ga
  qo'shilmagani tasdiqlandi. `server/test.js`ga Test 2b (config sanity) qo'shildi

- [2026-07-29] **Sayt buyurtmasi endi xaridorga bog'lanadi va checkout formasi o'zi to'ladi** —
  batafsil `sprint-3.md` da (saytda Telegram orqali kirish). Bu yerga tegishli qismi: kirgan
  xaridorning buyurtmasida `orders.buyer_id` / `tg_user_id` / `tg_username` to'ladi, shuning
  uchun `/tasdiqla`, `/yolga`, `/yetdi` sayt buyurtmalarida ham xaridorga xabar yuboradi
  (ilgari "Telegram ID topilmadi" derdi va admin telefon qilishga majbur edi); checkout
  formasi ism va telefon bilan avtomatik to'ladi; drawer'ga "Mening buyurtmalarim" ro'yxati
  qo'shildi (`GET /api/web/orders`)

- [2026-07-29] **Nosozlik tuzatildi: lolamarket.uz saytidan berilgan buyurtma admin panelda umuman ko'rinmasdi — endi bazaga yoziladi.** Sabab zanjiri: saytdagi checkout faqat `/api/telegram-notify` ga yozardi, u endpoint esa ataylab bazaga yozmaydi (eski klientlar uchun qoldirilgan), admin panel esa `orders` jadvalidan o'qiydi — natijada 29-iyul 00:13 dagi haqiqiy buyurtma yo'qolgan. Ildiz sabab chuqurroq edi: saytda (`p1`…`p12`) va bazada (`ik-1402`, `ad-0890`…) **ikkita alohida katalog** bor edi, shuning uchun sayt buyurtmani bazadagi mahsulotga bog'lay olmasdi. Tuzatish: (1) yangi migratsiya `db/006_web_orders.sql` — `orders.source` ('miniapp'/'web', CHECK cheklovi bilan, eski qatorlarga DEFAULT `miniapp`), `orders.buyer_phone`, `idx_orders_source` indeksi, idempotent; (2) `server/server.js` da yangi `POST /api/web-orders` (`handleCreateWebOrder`) — Telegram imzosiz ishlaydi (sayt xaridorida Telegram hisobi yo'q), shuning uchun telefon MAJBURIY va rate limit Mini App'nikidan qattiqroq (5/oyna); narx, MOQ, oldindan to'lov va komissiya to'liq **server tomonda bazadan** hisoblanadi — klient faqat `{id, qty}` yuboradi; buyurtma `source='web'` bilan, ID esa Mini App bilan bir xil `order_seq` dan olinadi (shunda `/tasdiqla #LM-…` buyrug'i sayt buyurtmalarida ham ishlaydi); adminga "🌐 SAYTDAN" xabari ketadi va unda "xaridor Telegram'da emas — telefon qiling" eslatmasi bor; (3) `index.html` da 12 mahsulotning ID'si bazadagi haqiqiy ID'ga o'tkazildi (`data-id`, `addToCart`, `toggleFav`, `fav-*`, `act-*` havolalari bilan birga); (4) `script.js` savatni `/api/web-orders` ga yuboradi, brauzerda raqam o'ylab topadigan `nextOrderId()` va `SEQ_KEY` o'chirildi, buyurtma raqami endi faqat serverdan keladi va API xato bersa soxta "qabul qilindi" ekrani ko'rsatilmaydi (server aytgan aniq sabab — MOQ, telefon — ko'rsatiladi); (5) `admin/admin.js` + `admin.css` — buyurtma qatorida "sayt" belgisi va xaridor telefoni. Production'da uchidan uchigacha sinov buyurtmasi berildi (`#LM-3008`) — bazaga to'g'ri yozildi, summa bazadagi narxlardan hisoblandi, validatsiya bo'sh savat va kalta telefonni rad etdi; sinov buyurtmasi keyin o'chirildi. Migratsiya, kod va nginx (`/api/web-orders` proxy bloki) serverga deploy qilingan

- [2026-07-25] **50% oldindan to'lov modeli backend'ga tushdi va sotuvchi xabarida ko'rinadigan bo'ldi.** `server/server.js` ga `PREPAY_RATE` konstantasi qo'shildi (env orqali sozlanadi, default `0.5`); oldindan to'lov va qolgan summa **serverda** hisoblanadi — klient yuborgan `prepay`/`rest` qiymatlariga narx va MOQ kabi ishonilmaydi. Bazaga uch ustun qo'shildi (`orders.prepay_amount`, `orders.rest_amount`, `orders.tracking_code`; migratsiya qo'lda ishga tushirildi). Sotuvchi/admin Telegram xabariga ikki qator qo'shildi — "💰 Oldindan to'landi" va "Qolgani (BTS'da olishda)": ilgari sotuvchi faqat "Jami" ni ko'rardi va buyurtma to'liq to'langan deb o'ylashi mumkin edi, bu butun to'lov modelining asosiy bo'shlig'i edi. Xaridorning tasdiq xabari ham aniqlashtirildi ("Qolgani: X — mato BTS'ga yetib kelgach to'lanadi"). `GET /api/orders` javobiga `total` / `prepay` / `rest` qo'shildi (bu o'zgarishdan oldingi buyurtmalarda `null`)

- [2026-07-25] **Sotuvchi kabineti API'si qurildi (`server/server.js`) — beshta yangi endpoint.** `GET /api/me` rol va sotuvchi profilini qaytaradi (rol serverda aniqlanadi: `initData` → `users.role` → `sellers`). `GET /api/seller/products` sotuvchining o'z mahsulotlarini BARCHA holatlarda beradi (`published` / `pending` / `rejected` / `draft`) — ommaviy katalog esa faqat `published` ni ko'rsatadi. `PATCH /api/seller/products` tahrirlash, yashirish (`hide` → `draft`) va qayta ko'rsatish (`show` → `pending`) uchun; tahrirlangan e'lon qayta moderatsiyaga tushadi. `GET /api/seller/orders` kelgan buyurtmalarni beradi — bitta buyurtmada bir nechta sotuvchining matosi bo'lishi mumkin, shuning uchun faqat shu sotuvchining qatorlari va `sellerTotal` qaytadi. `POST /api/seller/orders` uchta amalni bajaradi: `accept` / `reject` / `ship` (trek raqami bilan), har biri xaridorga Telegram xabari yuboradi va adminga nusxa boradi. **Xavfsizlik:** `requireSeller()` har endpointda rolni mustaqil qayta tekshiradi, har amalda "bu mahsulot/buyurtma aynan shu sotuvchinikimi" tasdiqlanadi, holat o'zgarishi esa `status = ANY(from)` sharti bilan yoziladi — tugma ikki marta bosilsa ikkinchisi `409` qaytaradi. **Bug tuzatildi:** yangi e'lon `seller_id` bilan saqlanmasdi, ya'ni mahsulot hech qaysi sotuvchiga tegishli bo'lmay qolardi. Nginx'ga ikki yangi proxy blok qo'shildi (`/api/me`, `/api/seller/`) — qo'lda, chunki nginx CI/CD tomonidan boshqarilmaydi

- [2026-07-25] `.gitignore` kengaytirildi — xom ish materiallari va asboblar sozlamalari repoga tushmaydigan qilindi: `Mahsulotlar/` (33 MB xom telefon suratlari), `docs/prd.md.zip`, `.agents/`, `.claude/launch.json`, `.claude/skills/`, `skills-lock.json`. `.claude/agents/` (hisobotchi, dizayner, investor, marketolog, product-manager) ataylab repoda QOLDIRILDI — ular loyihaning bir qismi

- [2026-07-22] **lolamarket.uz landing sahifasi haqiqiy ecommerce'ga aylantirildi — savat va checkout ishga tushirildi.** Header'ga savat ikonkasi va son badge'i qo'shildi (Demo tugmasi o'rniga); har mahsulot kartochkasida "Savatga" tugmasi bor, mahsulot savatga tushgach bu tugma doimiy miqdor tanlagichga (`− N dona +`) aylanadi — retsept Mini App'dagi `catalogQtyControl()` dan olindi (`telegram-app/app.js:529`); o'ng tomondan chiquvchi savat paneli (drawer) miqdor o'zgartirish, o'chirish va jamini ko'rsatadi; checkout formasi ism*, telefon*, kompaniya, izoh maydonlaridan iborat, validatsiya bilan; buyurtma `/api/telegram-notify` orqali @lolamarketbot'dan admin chatga yuboriladi; savat va buyurtma ketma-ketligi `localStorage`da (`lolamarket_web_cart`, `lolamarket_web_order_seq`) saqlanadi, sahifa yangilangandan keyin ham qoladi; muvaffaqiyat ekrani va botga havola qo'shildi. Mahsulot ma'lumoti (id, nom, narx, ishlab chiqaruvchi) DOM'dagi `data-*` atributlaridan o'qiladi — JS'da mahsulotlar ro'yxati takrorlanmaydi (`index.html`, `script.js`, `style.css`)
- [2026-07-22] Buyurtma raqami formati ajratildi — landing'dan berilgan buyurtmalar `LM-W####` (W = web), Mini App'dagilar avvalgidek `LM-####`; admin xabaridan buyurtma qaysi kanaldan kelganini darrov ajratish uchun
- [2026-07-22] Landing'dan buyurtma oqimi brauzerda to'liq tekshirildi — savat matematikasi, miqdor tanlagich oqimi (qo'shish / kamaytirish / 0 ga tushganda "Savatga"ga qaytish), savat paneli bilan sinxronlik, sahifa yangilangandan keyin saqlanish, validatsiya (bo'sh ism, qisqa telefon), tarmoq uzilganda savat yo'qolmasligi, inputlar 16px (iOS zoom yo'q), gorizontal toshish yo'q, 0 konsol xatosi. **Sinalmagan qism:** formadan Telegram'ga haqiqiy xabar yuborish yakuniy bo'g'ini (avtomatik xavfsizlik filtri to'sdi) — buni foydalanuvchi o'zi sinab ko'rishi kerak
- [2026-07-22] **Landing'ga saralanganlar (wishlist) va haqiqiy qidiruv qo'shildi.** Har mahsulot kartochkasida yurakcha tugmasi (`toggleFav(id)`), header'da saralanganlar tugmasi va o'ngdan chiquvchi saralanganlar paneli (`openFav()`); tanlovlar `lolamarket_web_favs` kaliti bilan `localStorage`da saqlanadi, sahifa yangilangandan keyin ham qoladi. Header'dagi qidiruv maydoni ishga tushirildi — `onSearch()` kiritilgan matnni mahsulot nomi va ishlab chiqaruvchi bo'yicha filtrlaydi, `applyFilter()` uni kategoriya chipi bilan birgalikda qo'llaydi, `clearSearch()` tugmasi tozalaydi. Foydalanuvchi harakatlari uchun umumiy toast tizimi qo'shildi (`showToast()`). "Kirish" tugmasi qo'shildi — hozircha faqat dizayn, bosilganda toast chiqaradi, haqiqiy auth Sprint 3 ishi (`index.html`, `script.js`, `style.css`; `style.css?v=18`, `script.js?v=15`)
- [2026-07-22] Checkout formasiga majburiy "Yetkazish manzili" maydoni qo'shildi (`co-address`, validatsiya bilan) — avval Telegram'ga har buyurtmada qat'iy `address: 'Veb-sayt orqali — manzil aniqlanmagan'` matni ketardi va admin manzilni telefon orqali alohida so'rashga majbur edi; endi haqiqiy manzil xabarga tushadi. Izoh maydonining placeholder'idan "Yetkazish manzili" olib tashlandi (endi alohida maydon bor), manzil maydoni ostiga BTS Pochta nuqtasi haqida yo'l-yo'riq qo'shildi. Brauzerda sinab ko'rildi
- [2026-07-22] `demo/` papkasi butunlay o'chirildi — repo'dan (`git rm`) va serverdan (zaxira: `/root/demo-backup-20260722-180848.tar.gz`). Serverda nginx SPA fallback tufayli `/demo/` endi 404 emas, bosh sahifani ko'rsatadi

---

## Qarorlar

- [2026-08-13] Qaror: **Mini App'da `user-scalable=no` QOLADI — dizayn
  tavsiyasi O'LCHOV BILAN RAD ETILDI.** Tavsiya "matn zoomini oching" degandi
  va u odatda to'g'ri. Bu yerda esa `html` va `body` ikkalasida `overflow:
  hidden`, sahifa umuman skroll qilmaydi (`scrollHeight === clientHeight`) —
  ya'ni zoom qilingan foydalanuvchi kattalashgan mazmun bo'ylab surila
  olmasdi va **qamalib qolardi**, chiqish yo'li ilovani yopish bo'lardi.
  ⚠️ **Ehtiyoj HAQIQIY, yechim boshqa:** shrift o'lchamlari qat'iy `px` da,
  ya'ni haqiqiy tuzatish — tipografiyani nisbiy birlikka o'tkazish. Band
  OCHIQ qoldirildi. Dars ushbu qaror mazmunidan kengroq: **tavsiya
  qanchalik standart bo'lsa ham, u qo'llanadigan muhit o'lchanmaguncha
  tavsiya bo'lib qoladi** ("hujjatdagi raqam — tekshirilmagan da'vo"
  qoidasining UI dagi ko'rinishi)
- [2026-08-13] Qaror: **brend rangi faqat tokendan olinadi va buni Test 26
  qo'riqlaydi.** Qoida `telegram-app/styles.css` da ALLAQACHON yozilgan edi va
  `app.js` uni **81 joyda** buzardi — ya'ni bu qaror qoidani emas, uning
  QOROVULINI qo'shadi. ⚠️ **Ikki istisno ATAYLAB qoldirildi va ular
  uslub emas, TEXNIK chegara:** SVG `fill=` prezentatsiya atributida `var()`
  UMUMAN ishlamaydi (rang jimgina qora bo'ladi) — u yerda `currentColor` +
  CSS klass; Yandex Maps `iconColor` va `KONFETTI_RANG` esa CSS emas, JS
  qiymati. Istisnolar testda SATR bo'yicha tanaladi, ya'ni ro'yxat jimgina
  kengaymaydi
- [2026-08-13] Qaror (founder): **sotuvchi kabineti bazadagi rol bilan
  EMAS, founder bergan Telegram ID ro'yxati bilan ochiladi** («hozircha
  faqat menda»). Bazadagi `users.role = 'seller'` ikkinchi shart bo'lib
  qoldi. Sabab: rol bazada paydo bo'lishining bir nechta yo'li bor (ariza
  tasdig'i, qo'lda SQL, kelajakdagi avtomatik tasdiq) va ularning HAMMASINI
  eslab qolish kerak bo'lardi; ro'yxat esa BITTA joyda va ko'rinadi.
  ⚠️ Bu `db/014` («ikkinchi ro'yxat himoya emas, tuzoq») bilan zid EMAS:
  u yerdagi ro'yxat ikkinchi nusxa edi, bu yerda ro'yxat — YAGONA eshik.
  ⚠️ Zaxira ATAYLAB `ADMIN_TG_IDS` → `ADMIN_CHAT_ID`, ya'ni sozlama
  berilmasa kabinet **YOPIQ** qoladi (founder'dan tashqari). «Berilmasa
  hammaga ochiq» varianti rad etildi: e'tibordan chetda qolgan `.env`
  jimgina hammani ichkariga qo'yib yuborardi — xavfsizlik sozlamasining
  standart holati eng KENG emas, eng TOR bo'lishi kerak
- [2026-08-13] Qaror (founder): **narx filtri paneli boshlang'ich holatda
  YOPIQ**, filtr ikonkasi bosilganda **eski JOYIDA** ochiladi. Joyi
  o'zgarmagani ataylab: ochilgan panel foydalanuvchi kutgan yerda paydo
  bo'lsin. ⚠️ Filtr YOQILGAN paytda panel majburan ochiq qoladi — filtr
  chipi shu blok ichida, ya'ni yopilsa filtr ishlab turganini hech narsa
  ko'rsatmasdi va katalog "sababsiz kam mahsulot" ko'rsatardi
- [2026-08-13] Qaror: **profil surati SERVERDAN olinadi**
  (`GET /api/me/photo`), `initDataUnsafe.photo_url` dan EMAS. Muqobil
  arzonroq edi (qo'shimcha so'rov yo'q), lekin u ikki joyda yiqilardi:
  biriktirma menyusidan tashqari kirish nuqtalarida va SAYTDA (u yerda
  `initData` umuman yo'q). ⚠️ Telegram fayl MANZILI hech qachon
  qaytarilmaydi — unda bot tokeni bor, shuning uchun baytlar proksi
  qilinadi
- [2026-08-13] Qaror: **menyu tugmasi server ishga tushganda ro'yxatdan
  o'tadi**, qo'lda emas. Chaqiruv idempotent va tekin; foydasi esa
  `BOT_TOKEN` almashtirilgan kunda ko'rinadi — sozlama nolga qaytadi va
  qo'lda qadam unutiladi (webhook bilan AYNI tuzoq, o'sha kuni saytga
  kirishni o'ldirgan)
- [2026-08-13] Qaror (founder): **buyurtmalar tarixi profil ekranida
  CHIZILMAYDI — u ham "Mening manzilim" kabi QATOR bo'lib, alohida
  ko'rinishda ochiladi.** ⚠️ Bu AYNI SHU KUNDAGI «saytda buyurtmalar
  ro'yxati YUQORIGA ko'chdi — mazmun avval, bo'limlar keyin» qarorini
  ALMASHTIRADI (`2cfb240`; eski yozuv o'chirilmaydi — nima uchun tartib
  ikki marta o'zgargani ko'rinib turishi kerak). Sabab uslub emas,
  O'LCHOV: ro'yxat 500px egallagani uchun ostidagi ikki bo'lim skrollning
  tubida qolardi va «Biz bilan bog'lanish» umuman ko'rinmasdi — ya'ni
  "mazmun avval" qoidasi amalda BOSHQA mazmunni yashirardi. Ustiga
  nuqson buyurtma soni bilan o'sadi, ya'ni o'zidan tuzalmaydi. Qator
  ochilishi ham BITTA mexanizmdan: saytda `drawerView`, yangi yo'l
  qurilmaydi
- [2026-08-13] Qaror (founder): **Mini App profilida «Buyurtmalarim» qatori
  BO'LMAYDI — buyurtmalar bo'limi u yerda ALLAQACHON bor** (pastdagi
  navigatsiya, `renderOrders()`), ya'ni qator ORTIQCHA ikkinchi eshik.
  Bu pastdagi qarorni BEKOR QILADI (eski yozuv o'chirilmaydi).
  ⚠️ **Ustiga qo'yiladigan UMUMIY qoida, va u aynan shu xatodan
  tug'ildi: MAVJUD funksiyaning ustiga IKKINCHI YO'L qo'shilganda avval
  SO'RALADI — «bu ortiqcha bo'lishi mumkin, kerakmi?».** Sabab: pastdagi
  qarorda «Mini App'da buyurtmalar allaqachon o'z ekranida, ya'ni
  ko'chiriladigan narsa yo'q» deb YOZILGAN va shunga qaramay qator
  qo'shilgan — ya'ni **fakt qo'lda edi, xulosa chiqarilmadi**, va founder
  buyrug'i «foydali» degan tekshiruvni almashtirib qo'ydi. Bu qoidani test
  bilan qulflab BO'LMAYDI (prompt qoidasi bilan bitta oilada), shuning
  uchun u **odat** — va yozuv shu sababli o'chirilmaydi.
  ✅ [2026-08-13] Qoida endi `CLAUDE.md` → «Arxitektura qoidalari» da ham
  turadi (prompt matni bandining ostida — ikkalasi ham test bilan qulflanmaydigan
  ODAT). Sabab: sprint yozuvi bir marta o'qiladi, `CLAUDE.md` esa HAR SESSIYADA —
  qoida qorovulsiz bo'lsa, u hech bo'lmasa ko'z tegadigan joyda turishi kerak
- [2026-08-13] ~~Qaror: **Mini App'da «Buyurtmalarim» qatori qo'shiladi, lekin
  RO'YXAT PROFILGA KO'CHIRILMAYDI — ikkala yuz BIR XIL SHAKLDA bo'ladi,
  bir xil MEXANIZMDA emas.**~~ Founder: «mini appda ham shunday qilgin».
  Yuqoridagi qaror saytda YANGI ko'rinish ochishni talab qilgan, chunki
  u yerda ro'yxat profil ichida chizilardi; Mini App'da esa buyurtmalar
  ALLAQACHON o'z ekranida (pastdagi navigatsiya), ya'ni ko'chiriladigan
  narsa yo'q va qator MAVJUD ekranga ikkinchi eshik bo'ladi.
  ⚠️ **Teng ko'rinadigan, lekin RAD ETILGAN ikki yo'l:** (1) Mini App'dan
  buyurtma tabini olib tashlab ro'yxatni profil ichiga solish, (2) saytda
  ham tab qurish. Ikkalasi ham "bir xillik" nomi bilan ISHLAYOTGAN narsani
  buzardi — Mini App'da tab yo'qolsa buyurtmaga yetish bir bosish uzoqroq
  bo'lardi, saytda esa drawer'da tab uchun joy yo'q. **Bir xillik
  FOYDALANUVCHI KO'RADIGAN darajada (profil bo'limlari ro'yxati), kod
  yo'lida emas** — bu `BTS_POINTS` ikki yuzda alohida yashashi bilan bitta
  oilada: mazmun bir xil, mexanizm har yuzning o'ziga qulay
  🔴 **BEKOR QILINDI o'sha kunning o'zida — yuqoridagi qarorga qarang.**
  Yozuv tarix uchun qoldirildi va sababi bor: **bu qarorning O'ZI xatoni
  ochib turadi** — «ko'chiriladigan narsa yo'q» jumlasi shu yerda yozilgan,
  ya'ni ortiqchalik qaror qabul qilingan paytda KO'RINIB TURGAN. O'chirilsa,
  keyingi o'qigan odam nima uchun «avval so'ralsin» qoidasi paydo bo'lganini
  bilmasdi
- [2026-08-13] Qaror: **`ORDER_STATUS` jadvali `STR` tarjima jadvaliga
  KO'CHIRILMAYDI**, yorliq esa `{uz, ru}` shaklida o'sha jadvalning
  ichida turadi. Sabab: kalitlari — bazadagi `orders.status` qiymatlari
  (`pending`, `shipped`…), ya'ni ro'yxat baza bilan birga o'zgaradi va
  `orders_status_check` ga bog'langan; `STR` esa UI matnlari uchun. Ikkiga
  bo'lib qo'yilsa yangi holat qo'shilganda ikki joyni birga yangilash
  kerak bo'lardi — bu «bir xil ro'yxat ikki jadvalda takrorlanmasin»
  tuzog'i (`admin_actions_kind_check` darsi). Noma'lum holatda bazadagi
  qiymatning O'ZI ko'rsatiladi: bo'sh joy foydalanuvchiga hech narsa
  demaydi, xom qiymat esa hech bo'lmasa nimanidir aytadi

- [2026-08-13] Qaror (founder, QUIZ orqali): **mahsulot ekranida rasm —
  4:5 va to'liq kenglikda, nom esa rasm USTIDA.** To'rt savol ASCII
  maketlar bilan taklif qilindi va to'rttasida ham "Tavsiya" varianti
  tanlandi: (1) 4:5 hero, shaffof header ostidan o'tadi; (2) rasm ustida
  faqat gradient, kartochka QATTIQ oq sirt (shisha/blur emas); (3) nom
  rasm ustida — ilgari u bitta ekranda IKKI marta yozilardi; (4) rasmga
  bosilsa to'liq ekran + zoom. ⚠️ Qaror **o'lchovdan** tug'ildi, diddan
  emas: hero ekranning 27.8% i edi va katalog kartochkasidagi AYNI rasm
  undan KATTAROQ ko'rinardi (230px → 226px), ya'ni mahsulotga kirish
  rasmni kichraytirardi. Yangi o'lchov — 57.7%
- [2026-08-13] Qaror: **B2B xaridorga rasmni KATTALASHTIRISH kerak, chunki
  savdo predmeti — ipning o'zi.** 469px lik kadrda mato zichligi va naqsh
  aniqligi KO'RINMAYDI. Shu sabab to'liq ekran ko'rish qo'shildi, va u
  brauzerning O'Z pinch-zoomiga tayanmaydi: Mini App'da `touch-action:
  manipulation` + `overflow: hidden` sahifa masshtabini butunlay
  o'chiradi, ya'ni "brauzer o'zi kattalashtiradi" degan taxmin JIMGINA
  ishlamaydigan tugma bo'lardi
- [2026-08-13] Qaror: **naqsh bilan chizilgan (rasmsiz) mahsulotda zoom
  amali UMUMAN qo'yilmaydi.** Bosilganda hech narsa qilmaydigan tugma
  bo'lmasin — "Yordam markazi" qatori bilan bitta oila. Xuddi shu sabab
  qo'ng'iroq tugmasi mahsulot ekranida yashiriladi: rasm header ostidan
  o'tgani uchun u "sevimli" tugmasi bilan AYNI nuqtada ustma-ust tushardi
- [2026-08-13] Qaror: **bitta rasm — bitta chizish joyi.** `detailMedia`
  endi rasm slaydini videoli va videosiz holatda ham O'ZI chizadi. Ilgari
  videosiz mahsulotda rasm hero divining `style` ida edi va "bosilsa
  kattalashsin" amali IKKI joyga yozilishi kerak bo'lardi — bitta xatti-
  harakat ikki joyda tug'ilsa, biri ertami-kech ortda qoladi
- [2026-08-13] Qaror (founder): **profil tartibi namunadan olinadi, MAZMUNI
  esa YO'Q.** Founder boshqa ilovaning profil ekranini namuna qilib berdi.
  Undan faqat **shakl grammatikasi** ko'chirildi — bo'limlar bir xil
  balandlikdagi alohida qatorlar bo'lib turadi. Sabab uslubdan kattaroq:
  bir xil qatorda ko'z faqat YOZUVni o'qiydi, har xil balandlikdagi
  bloklarda esa avval SHAKLni ajratadi va har bo'lim qayta "o'rganiladi".
  ⚠️ Namunadagi versiya raqami, yulduzli baholash va "Faol sessiyalar" /
  "Biz haqimizda" / "FAQ" qatorlari **ATAYLAB ko'chirilmadi** — ortida hech
  narsa yo'q qator o'lik tugma, o'ylab topilgan versiya raqami esa
  «panelda o'ylab topilgan raqam ko'rsatilmasin» qoidasiga tushadi.
  Namuna — TARTIB manbai, mazmun manbai emas
- [2026-08-13] Qaror (founder): **"Biz bilan bog'lanish" — "Mening manzilim"
  bilan BIR XIL yo'l, ya'ni ALOHIDA oyna.** ⚠️ Bu quyidagi o'sha kungi
  «ochiladigan bo'lim» qarorini ALMASHTIRADI (`9cd3b9d`). Sabab: profilda
  ikkita "ichkariga olib kiradigan" qator turardi va ular IKKI XIL
  ochilardi — biri joyida yoyilardi, ikkinchisi oyna chiqarardi. Bir xil
  ko'rinishdagi ikki qator har xil ish qilsa, foydalanuvchi bosishdan oldin
  TAXMIN qilishga majbur bo'ladi. Mexanizm ham bitta: Mini App'da
  `paintSheet`, saytda `drawerView` — ikkinchi yo'l qurilmaydi
- [2026-08-13] Qaror: **ortida hech narsa yo'q qator QOLDIRILMAYDI.**
  "Yordam markazi" strelkasi bilan turardi va hech qayerga olib bormasdi;
  qator bilan birga `help` tarjima kaliti ham o'chirildi. Kalit qoldirilsa
  u keyin "allaqachon bor ekan" deb qayta ishlatilardi. Bu `NULL` reyting
  qoidasi bilan bitta oila: **bo'sh va'da yo'qlikdan yomonroq** —
  yo'qligi savol tug'diradi, o'lik tugma esa ishonch uyg'otadi
- [2026-08-13] Qaror: **til — bitta qator, ikki holat** (`toggleLangUi`),
  UZ/RU tugmachalari emas. Sayt allaqachon shu naqshda ishlardi
  (`script.js` → `toggleLang`) va ikki yuz bir xil bo'lishi kerak. Til NOMI
  tarjima jadvaliga QO'YILMAYDI — har bir til o'z tilida yoziladi
  (`LANGS`), aks holda "Русский" o'zbekcha interfeysda tarjima talab
  qilardi va bu ma'nosiz. Uchinchi til qo'shilganda bu yer tanlov ro'yxatiga
  aylanadi
- [2026-08-13] Qaror: **nomaqbul video uchun BUTUN e'lonni rad etish emas,
  faqat videoni o'chirish** (`video_remove`). Sabab: e'lonni rad etish
  sotuvchini aybsiz mahsuloti bilan birga jazolaydi va u qaytadan hamma
  narsani kiritishga majbur bo'lardi — jazo aybga mos kelmasdi. Mahsulot
  o'z joyida qoladi, sotuvchi sabab bilan xabar oladi va yangi video
  yuborishi mumkin

- [2026-08-13] Qaror: **o'chirish tartibi — BAZA → R2 → CDN purge**, va
  keyingi ikkitasi yiqilsa amal BEKOR QILINMAYDI. Sabab: bazadan ketishi
  bilan video ilovada ko'rinmay qoladi, ya'ni eng muhim natija birinchi
  qadamda bo'ladi; R2 xatosi tufayli butun amalni orqaga qaytarish esa
  ko'rinib turgan nomaqbul videoni ekranda QOLDIRARDI. Lekin xato
  YUTILMAYDI — `console.error` alertga chiqadi va natija matnida admin ga
  aytiladi

- [2026-08-13] Qaror: **CDN purge natijasi admin ga HALOL aytiladi**,
  "o'chirildi" deb qo'ya qolinmaydi. Sabab 2026-08-09 o'lchovi: R2 dan
  o'chirilgan obyekt `cf-cache-status: HIT` bilan berilaveradi — moderator
  ish tugadi deb o'ylaydi, video esa to'g'ridan-to'g'ri havola bilan
  ochilaveradi. Purge sozlanmagan bo'lsa ham ayni gap aytiladi
  (`ALERT_CHAT_ID` darsi: jimgina yolg'on yo'qlikdan yomonroq)

- [2026-08-13] Qaror: **`CF_API_TOKEN` / `CF_ZONE_ID` — IXTIYORIY,
  `process.exit` yo'q.** Sabab: purge sozlanmagan bo'lsa ham video bazadan
  va R2 dan o'chiriladi, ya'ni asosiy funksiya ishlaydi; ixtiyoriy sozlama
  serverni o'ldirmaydi (R2, AI va karta kalitlari bilan bitta naqsh).
  Qiymat baribir SHAKLI bo'yicha tekshiriladi — to'ldirilmagan `<token>`
  namunasi bo'sh emas va `||` uni haqiqiy deb qabul qilardi

- [2026-08-13] Qaror: **`tel:` havolasi QOLADI, lekin uning YONIDA zaxira
  turadi — muhit ANIQLANMAYDI.** "Kompyutermi yoki WebView'mi" deb tekshirish
  yana bir TAXMIN bo'lardi va u yangi qurilmada jimgina noto'g'ri chiqardi.
  Shuning uchun `preventDefault` chaqirilmaydi (native qo'ng'iroq qayerda
  ishlasa, o'sha yerda ochilaveradi) va ustiga raqam buferga nusxalanadi.
  Nusxalash ikki yo'ldan (`navigator.clipboard`, bo'lmasa `execCommand`),
  ikkalasi ham yiqilsa foydalanuvchiga AYTILADI — jimgina "nusxalandi" deyish
  `NULL` reyting va `ALERT_CHAT_ID` bilan bitta oiladagi yolg'on bo'lardi
- [2026-08-13] Qaror: **CSP mezbon ro'yxati HUJJATDAN emas, O'LCHOVDAN
  olinadi.** Karta CSP'siz muhitda ochilib brauzerning `performance` resurs
  yozuvlaridan mezbon + resurs TURI yig'iladi (tur direktivani belgilaydi).
  Sabab: taxmin bo'yicha yozilgan ro'yxat `connect-src` ni kiritgan bo'lardi
  va o'lchov uni RAD ETDI. Ro'yxat keraksiz kengaysa CSP himoya sifatida
  susayadi, tor bo'lsa — funksiya jimgina o'ladi; ikkala xato ham
  KO'RINMAYDI, shuning uchun bu yerda o'lchov ixtiyoriy emas
- [2026-08-13] ~~Qaror (founder): **"Biz bilan bog'lanish" — ochiladigan bo'lim,
  ikki yo'l ichida** (qo'ng'iroq va Telegram), yopiq holat boshlang'ich.
  Ochilganda faqat blokning O'ZI qayta chiziladi — butun ekranni qayta chizish
  skrollni boshiga qaytarardi va foydalanuvchi bo'limni ochib ekran tepaga
  sakraganini ko'rardi~~
  🔴 **ALMASHTIRILDI o'sha kuni** — yuqoridagi "alohida oyna" qaroriga qarang
  (profil qayta tartiblanganda). Yozuv tarix uchun qoldirildi: qaror
  o'chirilsa, keyingi o'qigan odam nima uchun ikki bo'lim bir xil ochilishini
  bilmasdi

- [2026-08-13] Qaror: **video uchun R2 MAJBURIY — rasmdagidan farqli o'laroq,
  va shu sababli TARTIB TESKARI: avval R2, keyin baza.** Rasmda R2 yiqilsa
  Telegram proksisi ishlab turadi, videoda esa bu pog'ona AMALDA YO'Q —
  `handleProductPhoto` faylni butunlay `pipe` qiladi va `Range` (HTTP 206)
  bermaydi, iOS Safari esa `<video>` uchun aynan shuni talab qiladi. Ya'ni
  R2 siz yozilgan `vid_file_id` hech qachon ochilmaydigan videoni "bor" deb
  ko'rsatardi. R2 yiqilsa bazaga UMUMAN yozilmaydi va sotuvchi buni ESHITADI —
  "qabul qilindi" DEYILMAYDI. Bu `NULL` reyting va `ALERT_CHAT_ID` qarorlari
  bilan bitta oilada: **jimgina yolg'on yo'qlikdan yomonroq**. `vid_file_id`
  baribir saqlanadi — R2 qo'shimcha ombor, almashtiruvchi emas
- [2026-08-13] Qaror: **video chegaralari — mp4, ≤30 s, ≤12 MB — va har rad
  etish SOTUVCHIGA TUSHUNTIRILADI, bayroq esa ochiq qoladi.** Chegaraga
  urilgan sotuvchi jim qoldirilsa "yubordim, ishlamadi" holatida qolardi va
  sababni faqat biz jurnaldan ko'rardik. Tekshiruv baytlarni yuklashdan OLDIN
  bo'ladi (Telegram `duration`/`file_size`/`mime_type` ni xabarda beradi):
  keyin rad etish 12 MB ni bekorga tortib olish bo'lardi, ustiga Bot API
  20 MB dan kattasini umuman bermaydi va xato "fayl topilmadi" bo'lib kelib
  sababi boshqa narsaga o'xshardi. Chegara raqami BITTA joyda
  (`MAX_DOWNLOAD_BYTES` eksport qilinadi) — ikki joyda qo'lda yozilsa, biri
  o'zgargan kuni sotuvchiga aytilgan chegara YOLG'ON bo'lib qolardi
- [2026-08-13] Qaror: **`ffmpeg` QO'SHILMAYDI — muqovani Telegram o'zi beradi**
  (`msg.video.thumbnail`). Nativ paket deploy'ga yangi sinish nuqtasi
  qo'shardi va kerak bo'lgani atigi bitta narsa — birinchi kadr. Bu `lib/png.js`
  da `sharp` dan voz kechilgan qaror bilan bitta naqsh. Muqova yo'qolsa video
  yo'qolmaydi (chiqishda mahsulot rasmiga tushamiz), lekin xato yutilmaydi
- [2026-08-13] Qaror: **admin paneldagi "Kelgan videolar" ro'yxati moderatsiya
  navbatidan ALOHIDA turadi va `status` bo'yicha FILTRLANMAYDI.** Navbat faqat
  `pending` e'lonlarni ko'rsatadi, video esa ALLAQACHON NASHR QILINGAN
  mahsulotga ham keladi (sotuvchi rasm yuborgach bayroq ochiladi) — u holda
  video hech qanday navbatga tushmasdan katalogga chiqib ketardi va uni hech
  kim ko'rmasdi. Tartib `vid_at` bo'yicha, `created_at` bo'yicha emas
- [2026-08-13] Qaror (founder): **mahsulot media GALEREYA bo'ladi — 1-slayd
  rasm, 2-slayd video** (D bosqichida quriladi). Video rasmni ALMASHTIRMAYDI:
  rasm katalog lentasida va qidiruvda ishlaydi, video esa faqat tafsilot
  ochilganda. ⚠️ **D dan OLDIN video o'chirish amali kerak** — hozir kelgan
  videoni olib tashlashning yo'li yo'q, ya'ni nomaqbul video xaridorga
  ko'rsatila boshlagan zahoti uni to'xtatib bo'lmaydi; amal Telegram tasdig'i,
  `admin_actions_kind_check` migratsiyasi va Cloudflare purge bilan birga
  qilinadi (CDN keshi o'chirishni QAYTARMAYDI — 2026-08-09 da o'lchangan)

- [2026-08-13] Qaror: **Mini App'da native `<video controls>` ISHLATILMAYDI,
  saytda esa QOLADI.** Sabab: Mini App'da pastdagi kartochka hero ustiga 22px
  chiqadi va boshqaruv paneli yarim yopiq qolardi — "ko'rinadigan, lekin bosib
  bo'lmaydigan" tugma. Saytda bunday to'siq yo'q, shuning uchun bir xil
  muammoga ATAYLAB ikki xil yechim

- [2026-08-13] Qaror: **galereyada `scroll-behavior: smooth` ISHLATILMAYDI va
  nuqta holati `scroll` hodisasini KUTMAYDI.** Sabab — O'LCHOV, taxmin emas:
  silliq surish bajarilmaydigan muhitda `scrollLeft` jimgina yutiladi
  (2 soniyadan keyin ham 0) va nuqta o'lik tugmaga aylanadi

- [2026-08-13] Qaror: **ro'yxat kartochkasida video ko'rsatilmaydi** — CSS fon
  slayd bo'la olmaydi va ro'yxatdagi avtoijro mobil trafikni yeb qo'yardi

- [2026-08-13] Qaror: **doimiy olish nuqtasi BAZADA saqlanadi
  (`users.pickup_point_id`), `localStorage` esa ZAXIRA bo'lib qoladi.** Haqiqat
  manbai — BAZA: server "tanlanmagan" desa brauzerdagi eski qiymat
  O'CHIRILADI. Sabab: tanlov bugungacha faqat brauzerda yotardi, B2B xaridor
  esa telefonda ham, kompyuterda ham kiradi — u har safar nuqtani qaytadan
  tanlardi, kesh tozalansa esa tanlov umuman yo'qolardi. `localStorage` OLIB
  TASHLANMAYDI: u kirmagan (mehmon) xaridor uchun va server javobi kelgunicha
  ko'rsatiladigan zaxira. ⚠️ Aynan shu yerda jimgina nuqson bor edi —
  `setBtsPoint` faqat YOZARDI, o'chirmasdi, ya'ni boshqa qurilmada bekor
  qilingan tanlov qayta yuklashda TIRILARDI. Bu `NULL` reyting va
  `ALERT_CHAT_ID` qarorlari bilan bitta oilada: **jimgina yolg'on yo'qlikdan
  yomonroq**
- [2026-08-13] Qaror: **karta IXTIYORIY funksiya — u yiqilsa manzil tanlash
  YIQILMAYDI.** `YANDEX_MAPS_KEY` bo'lmasa yoki Yandex javob bermasa karta
  tugmasi umuman chizilmaydi va nuqta ro'yxatdan tanlanadi; ro'yxat HAR DOIM
  yonida turadi. Kalit shakli `config.js` da tekshiriladi, lekin
  `process.exit` QILINMAYDI (AI kaliti bilan bitta naqsh). Sabab: xaridorning
  manzilini o'zgartirish qobiliyatini tashqi xizmatga bog'lab qo'yish
  "ishlamaydigan tugma" holatini yaratardi — bu funksiya yo'qligidan
  yomonroq. Qorovul: Test 22b
- [2026-08-13] Qaror: **nuqtalar ro'yxati SERVERGA ko'chirilmaydi — serverda
  faqat SHAKL tekshiriladi** (`lib/maps.js` → `isPickupPointId`, `bts-NNN`).
  BTS API ulanmagan, ro'yxat frontendda yashaydi; uni serverga yoki `CHECK`
  ga uchinchi nusxa qilish CLAUDE.md ataylab ogohlantirgan naqsh bo'lardi —
  `admin_actions_kind_check` da aynan shu tishlagan va sharh yashirish
  production'da JIMGINA ishlamagan (`db/014`). ⚠️ Ro'yxat baribir IKKI yuzda
  takrorlanadi (sayt + Mini App) — bu bilib qilingan vaqtinchalik qaror,
  lekin endi Test 22c uni harfma-harf qulflaydi
- [2026-08-13] Qaror: **BTS koordinatalari TAXMINIY deb BELGILANADI va
  ogohlantirish karta ustida DOIM turadi.** Nuqtalar tuman/shahar markazi
  aniqligida, eshik koordinatasi EMAS — ro'yxatning O'ZI namuna. Ogohlantirish
  BTS'dan haqiqiy koordinata kelmaguncha olib tashlanmaydi. Sabab: "o'ylab
  topilgan raqam ko'rsatilmasin" qoidasi bu yerda ayniqsa qimmat — xarita
  nuqtani ANIQ ko'rsatayotgandek tuyuladi va noto'g'ri joyga boradigan
  xaridorga yolg'on ishonch beradi
- [2026-08-12] Qaror: **sayt katalogi HTML dagi kartochkalarni bazaga
  ALMASHTIRMAYDI — ikkalasi BIRLASHTIRILADI** (`script.js` → `mergeCatalog`).
  HTML kartochkalari qoladi (SEO va birinchi chizilish: bo'sh grid API javobini
  kutib turardi), baza esa **HAKAM** bo'ladi — u yerda yo'q kartochka olib
  tashlanadi, narx bazadagiga tenglashtiriladi, yangi e'lon qo'shiladi. Sabab:
  ikkita mustaqil katalog (qo'lda yozilgan HTML va baza) 29-iyulda ID darajasida
  birlashtirilgandi, TARKIB darajasida esa hamon ikkiga bo'lingan edi va farqni
  hech narsa ko'rsatmasdi — `ik-9001` saytda savat tugmasi bilan turib, buyurtmasi
  serverda rad etilardi. Endi farq MUMKIN EMAS: baza nima desa, sayt shuni
  ko'rsatadi
- [2026-08-12] Qaror: **foydalanuvchi kimligi ikkala kanalda BITTA nuqtadan
  olinadi — `requestUser()`** (`server/lib/auth.js`). Mini App'da imzolangan
  `initData`, saytda HttpOnly cookie sessiyasi; funksiya ikkalasini AYNI shaklga
  (`{ id, source }`) keltiradi. Sabab: endpointlar faqat BIRINCHISINI bilardi va
  buning narxi ko'rinmasdi — bahs ochish saytda `401` qaytarardi, ya'ni **kafolat
  va'da qilingan, mexanizmi esa bitta kanalda bor edi**. Har endpointga
  `if (miniapp) ... else if (web) ...` yozish yo'li ATAYLAB tanlanmadi: u
  takrorlanadigan shart bo'lardi va yangi endpoint uni unutgan kuni jimgina
  bitta kanalni tashlab ketardi. Sessiya kodi shu sabab `routes/web-auth.js` dan
  `lib/web-session.js` ga ko'chirildi — kutubxona marshrutga bog'lanmasin.
  ⚠️ Ikkala yo'l ham kimlikni SERVER tomonda hal qiladi; klient yuborgan
  `tg_user_id` ga ishonadigan uchinchi yo'l qo'shilmasin (CLAUDE.md).
  Qorovul: Test 3e
- [2026-08-12] Qaror: **to'lov sozlamalari (`prepayRate`, `deliveryFee`) saytga
  SERVERDAN keladi** (`/api/auth/web/me`), frontendda qo'lda yozilmaydi. Sabab:
  `PREPAY_RATE` `.env` dan o'zgaradi va o'zgargan kuni sayt xaridorga bitta
  raqamni ko'rsatib, server ikkinchisini hisoblardi — xaridor buni faqat
  to'lov paytida bilardi. Bu KO'RSATISH uchun, HISOB uchun emas: haqiqiy summa
  har doim serverda qayta hisoblanadi (2026-07-25 qarori kuchida qoladi)
- [2026-08-12] Qaror: **buyurtma holati saytda HAQIQIY tarixdan ko'rsatiladi
  (`order_status_history`), soxta "1-2-3-4 bosqich" progress chizilmaydi.**
  Tarix yo'q bo'lsa blok UMUMAN ko'rsatilmaydi. Sabab: bosqich chizig'i eng
  ishonarli ko'rinadigan yolg'on shakli — u har doim to'la ko'rinadi va
  buyurtma qayerda qolganini bilmasa ham "ketyapti" deb turaveradi. Bu `NULL`
  reyting va `ALERT_CHAT_ID` qarorlari bilan bitta oilada
- [2026-08-12] Qaror: **BTS nuqtasi erkin matn emas, RO'YXATDAN tanlanadi va
  tanlov ikki kanal orasida UMUMIY** (`localStorage` → `lolamarket_bts_point`,
  Mini App bilan ayni kalit). Sabab: erkin matn maydoniga BTS nuqtasi bo'lmagan
  har qanday narsa yozilardi va admin uni telefon orqali qayta aniqlashi kerak
  edi (22-iyuldagi manzil qarori shu yerda oxiriga yetdi). Kalit ataylab bir xil:
  ikki xil kalit bir odamning ikkita nuqtasi bo'lib, ular jimgina bir-biridan
  uzoqlashardi — `db/014` darsi

- [2026-08-02] Qaror: **`app.js` ichidagi zaxira mahsulot massivi bazaning
  MOSLASHGAN nusxasi bo'lsin — unga bazada yo'q mahsulot qo'shilmasin.** Sabab:
  ilova ikki marta chiziladi (avval zaxira, keyin baza), shuning uchun ikkalasi
  orasidagi har qanday farq foydalanuvchining KO'Z OLDIDA yuz beradi. `ik-9001`
  faqat zaxirada bo'lgani uchun bitta shu nomuvofiqlik ikki xil nuqson tug'dirdi:
  avval bosh sahifa qulashi, keyin kartochkalarning sakrashi. Zaxira massivning
  vazifasi — baza javob bermaganda bir zumga o'rnini bosish; u haqiqatdan chetga
  chiqsa, zaxira emas, ikkinchi haqiqatga aylanadi
- [2026-08-02] Qaror: **`FEATURED_IDS` dagi har bir ID HAM zaxira massivda, HAM
  bazada bo'lishi shart.** Bu yuqoridagi "yo'q ID jimgina tashlanadi" qaroriga
  ZID emas, uni to'ldiradi: tashlash — kutilmagan holat uchun himoya, ikkala
  manbada bo'lish esa kundalik talab. Faqat bittasida bor ID qulatmaydi, lekin
  ro'yxatni ikki chizish orasida o'zgartiradi va kartochkalar sakraydi
- [2026-08-02] Qaror: **UI'da qo'lda yozilgan mahsulot IDsi hech qachon MAJBURIY
  bo'lmasin — yo'q bo'lsa jimgina tashlab ketilsin.** Bosh sahifadagi "Tanlangan"
  bloki to'rtta ID ga bog'langan edi, katalog esa BAZADAN keladi: mahsulot
  o'chirilishi, yashirilishi yoki hech qachon qo'shilmagan bo'lishi mumkin.
  Endi `FEATURED_IDS` dan topilmagani tashlanadi va o'rni katalogdan to'ldiriladi.
  Sabab: bunday ro'yxat vaqt o'tishi bilan MUQARRAR eskiradi va eskirganini bilish
  yo'li yo'q — u ekranni qulatib bildiradi
- [2026-08-02] Qaror: **`render()` chizishni `try/catch` ichida bajaradi.** Sabab:
  sarlavha va navigatsiya ekrandan OLDIN yangilanadi, shuning uchun chizish xatosi
  ekranni eski holida qoldirib, sarlavhani yangi qilib qo'yadi — foydalanuvchi buni
  "tugma ishlamadi" deb tushunadi va nuqson hech qayerda ko'rinmaydi. Endi xato
  bo'lsa ochiq-oydin "Ekranni ochib bo'lmadi" + qayta yuklash tugmasi chiqadi.
  Bu — CLAUDE.md dagi "jimgina yolg'on ko'rsatilmasin" chizig'ining davomi
- [2026-08-02] Qaror: **`vm(p)` topilmagan mahsulotda xato tashlamaydi, `null`
  qaytaradi.** Sabab: xato tashlash butun ekranni qulatadi, `null` esa chaqiruvchidagi
  mavjud `if (!p)` himoyalarini ishga tushiradi. `renderDetail()` da o'sha himoya
  allaqachon yozilgan edi, faqat `vm()` undan OLDIN chaqirilgani uchun hech qachon
  ishlamagan
- [2026-07-31] Qaror: **sharh BUYURTMAGA bog'lanadi va moderatsiyadan o'tmaydi.** Xaridor
  faqat o'zi olgan (yetkazilgan yoki yakunlangan buyurtmadagi) matoga baho qo'yadi.
  Sabab: soxta sharh yozish uchun avval haqiqiy buyurtma berib, uni yetkazib olish kerak —
  bu darvoza moderatsiyadan kuchliroq va founder ustiga qo'lda ish qo'ymaydi. Nazorat
  keyingi bosqichda: har sharh admin chatiga tushadi va `/sharh_yashir` bilan
  reytingdan chiqariladi
- [2026-07-31] Qaror: **reyting hech qachon qo'lda yozilmaydi — faqat `recalcRating()`
  orqali, `avg(stars)` dan hisoblanadi.** `products.rating` / `products.reviews` va
  `sellers.rating` — hosila ustunlar. Sabab: `reviews = reviews + 1` ko'rinishidagi
  "tezroq" yo'l sharh yashirilganda sonni kamaytirmaydi va reyting jimgina yolg'onga
  aylanadi. Test shu farqni ushlaydi (`test.js` → Test 8)
- [2026-07-31] Qaror: **sharhi yo'q mahsulotning reytingi `0` emas, `NULL`** va UI
  reyting blokini umuman ko'rsatmaydi. Sabab: "hali baholanmagan" bilan "yomon
  baholangan" ni bir xil ko'rsatish yangi sotuvchini asossiz jazolaydi. Shu sababli
  zaxira massivdagi (`app.js`) soxta sonlar ham `null` ga o'tkazildi — aks holda
  tarmoq uzilganda yolg'on qaytib kelardi
- [2026-07-22] Qaror: Demo katalog (`demo/`) butunlay olib tashlanadi, landing'ning o'zi haqiqiy do'kon bo'ladi — ikkita parallel katalog (demo + haqiqiy) tutish chalkash, sayt endi to'g'ridan-to'g'ri buyurtma qabul qiladi
- [2026-07-22] Qaror: Landing buyurtmasi uchun alohida backend/baza qurilmaydi — buyurtma to'g'ridan-to'g'ri mavjud Telegram relay (`/api/telegram-notify`) orqali admin chatga boradi, savat esa `localStorage`da saqlanadi. Sabab: MVP bosqichida buyurtma oqimini tez ishga tushirish muhim, haqiqiy `orders` jadvali Sprint 2/4 backend ishi bilan birga keladi
- [2026-07-22] Qaror: Landing'da (sayt) xaridorga Telegram tasdiq xabari yuborilmaydi, faqat adminga xabar ketadi — chunki oddiy brauzerda Telegram identifikatsiyasi yo'q, xaridorning chat ID'si noma'lum. Mini App'da esa ikkala xabar ham ishlaydi. Xaridor bilan aloqa hozircha formadagi telefon raqami orqali qo'lda bo'ladi
- [2026-07-22] Qaror: Yetkazish manzili buyurtma formasida majburiy maydon bo'ladi, ixtiyoriy izoh ichida emas — BTS Pochta orqali yetkazish uchun nuqta manzili shart, uni keyin telefon orqali so'rash admin ishini ikki barobar qiladi. BTS nuqtalarini avtomatik tanlash (ro'yxatdan) keyingi ish

- [2026-07-25] Qaror: oldindan to'lov summasi HAR DOIM serverda hisoblanadi, klient yuborgan `prepay`/`rest` qiymatlari e'tiborga olinmaydi (narx va MOQ bilan bir xil qoida). Sabab: aks holda so'rovni o'zgartirib 50% o'rniga 1% "to'lagan" bo'lib ko'rinish mumkin edi. `PREPAY_RATE` env orqali sozlanadi, ya'ni ulush o'zgarsa kod tegilmaydi

- [2026-07-25] Qaror: sotuvchi mahsulotni butunlay o'chira olmaydi — faqat "yashiradi" (`draft`). Sabab: o'chirilgan mahsulotga bog'langan buyurtma tarixi va hisob-kitob buzilmasligi kerak. Qayta ko'rsatilgan yoki tahrirlangan e'lon esa `pending` ga qaytadi va qayta moderatsiyadan o'tadi — sotuvchi tasdiqlangan e'lonni keyin jimgina boshqa narsaga almashtirib qo'ya olmasin

- [2026-07-29] Qaror: **2026-07-22 dagi "landing buyurtmasi uchun alohida backend qurilmaydi" qarori bekor qilindi** — sayt buyurtmasi ham `orders` jadvaliga yoziladi (`POST /api/web-orders`). Sabab: o'sha vaqtinchalik yechim buyurtmani faqat Telegram'ga yuborardi, admin panel esa bazadan o'qiydi — sayt buyurtmalari panelda hech qachon ko'rinmasdi va bittasi shu sababdan haqiqatan yo'qoldi. Endi bitta manba bor: baza. `/api/telegram-notify` eski klientlar uchun qoladi, lekin buyurtma oqimida ishlatilmaydi

- [2026-07-29] Qaror: sayt va Mini App **bitta katalogdan** ishlaydi — mahsulot ID'lari bazadagi ID bilan bir xil (`ik-1402`, `ad-0890`…), sayt uchun alohida `p1`…`p12` raqamlash tashlab yuborildi. Sabab: ikkita parallel ID to'plami bilan sayt buyurtmasini bazadagi mahsulotga bog'lash imkonsiz edi. **Yangi mahsulot qo'shilsa `index.html` dagi `data-id` bazadagi ID bo'lsin**

- [2026-07-29] Qaror: sayt buyurtmasi uchun alohida `LM-W####` raqamlash bekor qilindi (2026-07-22 qarori) — sayt ham Mini App ham bitta `order_seq` dan raqam oladi, kanal esa `orders.source` ustunida saqlanadi. Sabab: brauzerdagi `localStorage` sanog'i bazada mavjud bo'lmagan raqam yasardi; bitta ketma-ketlik esa `/tasdiqla #LM-…` bot buyrug'ini ikkala kanalda ham ishlatib yuboradi

- [2026-07-29] Qaror: sayt buyurtmasida telefon **majburiy** maydon. Sabab: sayt xaridorida Telegram hisobi bo'lmasligi mumkin (`tg_user_id` NULL qoladi), telefon — u bilan bog'lanishning yagona yo'li; shu sababli panelda ham ism ostida darhol ko'rinadi

- [2026-07-25] Qaror: sotuvchining har amali (qabul / rad / jo'natish) bazada `status = ANY(from)` sharti bilan yoziladi. Sabab: sekin tarmoqda tugma ikki marta bosilishi odatiy hol — shart bo'lmasa bitta buyurtma ikki marta "qabul qilindi" bo'lib xaridorga ikkita xabar ketardi; endi ikkinchi urinish `409` qaytaradi

- [2026-07-30] Qaror: mahsulot rasmi ham `disputes.js`dagi Telegram file_id + HMAC-proksi naqshi orqali saqlanadi — bizning serverga fayl yuklanmaydi, faqat `file_id` bazada, ko'rsatishda `/api/product-photo` imzolangan havola orqali proksi qilinadi. Sabab: 2026-07-27 dagi bahs dalili qaroriga o'xshash — o'z fayl serveri qurish (disk, backup, xavfsizlik) hozircha ortiqcha, Telegram buni bepul qiladi

- [2026-07-30] Qaror: **`products.stock = NULL` — CHEKSIZ zaxira**, 0 emas. Ikki holatda ishlatiladi:
  (a) `made` — "buyurtmaga tayyorlanadi" mahsulotlar: ular buyurtmadan keyin to'qiladi, ombor soni
  ularga ma'nosiz; (b) sotuvchi hali aniq son kiritmagan eski e'lonlar. Sabab: migratsiya kuni barcha
  mahsulotlarni 0 qilib qo'yish butun katalogni bir zumda "tugagan" holatga o'tkazardi, `made`
  mahsulotlarni esa umuman sotib bo'lmay qolardi. SQL'da bu bepul chiqadi — `NULL - qty = NULL`, ya'ni
  cheksiz zaxira o'z-o'zidan hech qachon tugamaydi va alohida shart yozish shart emas

- [2026-07-30] Qaror: **zaxira kamaytirish HAR DOIM atomik `UPDATE ... WHERE stock >= qty` bilan
  bo'ladi** — hech qachon "avval SELECT bilan tekshirib, keyin UPDATE bilan yozish" naqshi bilan emas.
  Sabab: ikki xaridor bir vaqtda oxirgi rulonni olsa, ikkalasi ham "1 ta bor" deb o'qiydi va ikkalasi
  ham o'tib ketadi — bu aynan shu bug'ning o'zagi. Qatorlar `id` bo'yicha tartiblanib qulflanadi
  (deadlock oldini olish). `server/test.js` Test 7 shu shartning UPDATE ichida qolishini qo'riqlaydi —
  shart olib tashlansa test qulaydi. **Kelajakda zaxiraga tegadigan har qanday yangi kod shu yo'ldan
  o'tsin**

- [2026-07-30] Qaror: **`refunded` (pul qaytarildi) holatida zaxira ATAYLAB qaytarilmaydi** — faqat
  sotuvchi `reject` qilganda (mato hali jo'natilmagan) qaytadi. Sabab: pul qaytarish bahs qarori bilan
  bo'ladi, mato esa odatda xaridorda qoladi yoki shikastlangan — avtomatik qaytarish omborda YO'Q
  matoni katalogda "bor" deb ko'rsatardi va uni ikkinchi marta sotib yuborardi. Kerak bo'lsa sotuvchi
  zaxirani kabinetdan qo'lda tiklaydi

- [2026-07-30] Qaror: sotuvchi PATCH'ida `stock` faqat so'rovda **aynan yuborilgan** bo'lsa yangilanadi
  (`hasOwnProperty` tekshiruvi), "yuborilmagan = null = cheksiz" deb talqin qilinmaydi. Sabab: Mini App
  agressiv keshlanadi, eski klient bu maydonni umuman yubormaydi — talqinsiz qoida oddiy tahrirlashda
  zaxira cheklovini jimgina o'chirib yuborardi. Bu naqsh **yangi ixtiyoriy maydonlarga ham qo'llansin**

- [2026-07-31] Qaror: **narx filtrida `null` — "chegara yo'q"**, 0 emas. Ikkala klientda ham
  bir xil (`S.priceMin`/`S.priceMax` va `priceMin`/`priceMax`). Sabab: bu zaxiradagi
  `stock = NULL = cheksiz` va BTS'dagi naqshning aynan o'zi — loyihada "chegara yo'q" ma'nosi
  har joyda bitta shaklda yozilsin, aks holda har filtrda alohida "bo'shmi?" sharti paydo
  bo'lardi. Foydalanuvchi faqat bitta tomonni to'ldirsa ("700 000 so'mdan yuqori") ikkinchi
  tomon `null` qoladi va tekshirilmaydi

- [2026-07-31] Qaror: **narxi noma'lum mahsulot narx filtri yoqilganda YASHIRILADI**
  (`Number.isFinite(v)` bo'lmasa `false`). Sabab: uni "arzon" deb ko'rsatish xaridorni
  chalg'itardi — u 700 000 gacha so'raganda narxsiz rulon chiqib kelib, keyin 1 200 000
  bo'lib chiqishi mumkin. Filtr o'chirilganda esa mahsulot avvalgidek ko'rinadi

- [2026-07-31] Qaror: sheet'dagi yo'l-yo'riq qatori ("Katalogdagi narxlar: 700 000 – 900 000
  so'm") **katalogdan hisoblanadi**, qo'lda yozilmaydi; mahsulot bo'lmasa yoki narxi
  o'qilmasa qator umuman ko'rsatilmaydi. Sabab: CLAUDE.md dagi "o'ylab topilgan raqam
  ko'rsatilmasin" qoidasi — qotirib yozilgan oraliq katalog o'zgarganda jimgina yolg'onga
  aylanardi

- [2026-07-31] Qaror: sheet ichida yozilayotgan qiymat (`priceDraftMin`/`priceDraftMax`)
  qo'llangan qiymatdan (`priceMin`/`priceMax`) **ataylab ajratilgan** — katalog faqat
  "Qo'llash" bosilganda o'zgaradi. Sabab: har harfda qayta filtrlash katalogni sakratadi va
  "7" yozilgan zahoti hamma mahsulotni yo'q qilib yuboradi. Shu bilan bog'liq tuzoq:
  `onPriceDraft()` da `paintSheet()` **chaqirilmasin** — chaqirilsa `input` DOM'dan yo'qolib
  qayta yaratiladi, fokus uchadi va telefonda klaviatura yopiladi; xato yozuvi shu sababli
  to'g'ridan-to'g'ri `textContent` orqali tozalanadi. **Qayta chizadigan yangi sheet
  qo'shilsa shu qoida hisobga olinsin**

- [2026-07-30] Qaror: logistika (BTS) narxi `DELIVERY_FEE_ESTIMATE` config orqali bitta taxminiy summa sifatida ko'rsatiladi va mahsulot jamiga QO'SHILMAYDI, faqat `orders.delivery_fee_estimate` ga snapshot qilinadi. Sabab: BTS API hali ulanmagan (Sprint 6 ishi), PRD esa logistikani xaridor BTS nuqtasida to'g'ridan-to'g'ri to'lashini talab qiladi — bu summani platforma escrow'iga qo'shish noto'g'ri bo'lardi
