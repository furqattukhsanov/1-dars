# Sprint 7 — Admin panel (Dars 14)

**Holat:** tugadi

---

## Maqsad

Founder sifatida platformani to'liq nazorat qilish: ishlab chiqaruvchilarni tasdiqlash, escrow boshqaruvi, bahsli holatlarni hal qilish.

---

## Bajariladigan vazifalar

### Ishlab chiqaruvchi boshqaruvi
- [x] Yangi ishlab chiqaruvchi so'rovlari ro'yxati — `/api/admin/summary` → `applications`, panelning "Sotuvchilar" sahifasi
- [x] Tasdiqlash / rad etish (sabab bilan) — panelda tugma, Telegram'da tasdiqlanadi (`seller_approve` / `seller_reject`)
- [x] Tasdiqlanganda ishlab chiqaruvchiga Telegram xabarnoma — `handleSellerApplicationReview()` (Sprint 0'dan beri bor edi, endi paneldan ham chaqiriladi)

### Escrow va To'lovlar
- [x] Barcha buyurtmalar ro'yxati (holat bo'yicha filtr) — 7 ta holat filtri, oxirgi 100 buyurtma
- [x] Har buyurtmada: tovar summasi, komissiya, ishlab chiqaruvchiga o'tkaziladigan summa — `COMMISSION_RATE` env, buyurtma yaratilganda snapshot
- [x] "Pul o'tkazildi" tugmasi → `completed` holati — faqat `delivered` va ochiq bahssiz buyurtmada
- [x] Refund qilish: to'liq yoki qisman, sabab yozish — `order_refund` (buxgalteriya yozuvi; o'tkazma qo'lda, Payme/Click hali yo'q)

### Bahsli holatlar
- [x] Barcha ochiq bahslar ro'yxati — panelning "Bahslar" sahifasi + botda `/bahslar`
- [x] Har bahsda: xaridor dalili (rasm/video), ishlab chiqaruvchi javobi — dalil bot orqali yig'iladi (Telegram `file_id`), sotuvchi kabinetdan javob yozadi
- [x] Moderator qarori: kim aybdor → logistika kim to'laydi — `dispute_resolve`
- [x] Qarordan keyin avtomatik holat yangilash va Telegram xabarnoma — qaytarish bo'lsa buyurtma `refunded`, xabar xaridorga ham sotuvchiga ham
- [x] 24 soat ichida hal qilinmagan bahslar uchun eslatma — `scanStaleDisputes()`, 15 daqiqada bir skanerlaydi, har bahsga bir marta

### Statistika
- [x] Umumiy buyurtmalar soni va summasi — `totals` + 30 kunlik kunlik seriya (real, `generate_series` bilan bo'sh kunlar ham)
- [x] Komissiya daromadi (kunlik / oylik) — `daily` va `monthly` agregatsiya
- [x] Eng faol ishlab chiqaruvchilar — `topSellers`, 30 kunlik GMV bo'yicha
- [x] Foydalanuvchilar soni — `users` (jami, rol bo'yicha, 7/30 kunlik yangi, telefon raqami borlar). ⚠️ 2026-08-08 dagi ikkinchi yozuvdan keyin bu raqam **botga `/start` bosganlarning hammasi**; ichida `engaged` (ilova/sayt/ariza orqali foydalangan) va `startOnly` alohida ko'rsatiladi — pastdagi qarorlarga qarang
- [x] `/start` bosgan odam bazaga yoziladi — `server/routes/webhook.js` da `INSERT ... ON CONFLICT DO UPDATE`, `engaged_at` esa `db/020` bilan ikki tushunchani ajratadi

---

## Qilingan ishlar

- [2026-08-23] **«BOT USERLAR» SAHIFASI — foydalanuvchilar jadvali, «Oxirgi
  harakatlar» lentasi, AI kredit berish; Trafik sahifasida 7/30/90 kun va
  mahsulot jadvali (ko'rish/savat/sevimli/buyurtma/konv.).** Founder boshqa
  botining admin panelini referens qilib ko'rsatdi; founder qarori —
  **«Premium» YO'Q, faqat AI kredit.** Testlar: 89 → **90** `✅ Test` satri
  (hisobotchi MUSTAQIL sanadi; ish hisobotidagi «91» yakuniy «Hammasi PASS»
  qatorini ham qo'shib sanagan — raqam 90). `db/029_bot_userlar.sql`,
  yangi `server/lib/user-events.js`, `GET /api/admin/users?days=7`,
  `credit_grant` admin amali; kesh `admin.js?v=32`, `admin.css?v=21`,
  `panel.js?v=52`.

  **Nima qo'shildi:** (1) `users.last_seen_at` — «oxirgi kirish» `lib/auth.js`
  → `requestUser()` ning IKKALA tarmog'ida (`touchLastSeen`), bir foydalanuvchi
  uchun 5 daqiqada bir UPDATE, xato yutilmaydi; (2) `user_events` jadvali
  (`tg_user_id`, `kind` — bazada faqat SHAKL tekshiruvi, ro'yxat KODDA
  `KINDS`: favorite_add / favorite_remove / ai_image / order / web_login),
  `OWNER TO lola` + sekvensiya (db/028 darsi); (3) hodisa nuqtalari:
  sevimli faqat HAQIQIY o'zgarishda (`rowCount`), AI so'rov keshdan kelgani
  ham, buyurtma ikkala yo'lda **COMMIT dan KEYIN**, saytga kirish;
  (4) `credit_grant` — Telegram tasdig'idan o'tadi (panel faqat so'rov
  yaratadi), balans QO'SHILADI (ustiga yozilmaydi), qator yo'q bo'lsa
  `AI_CREDITS_START` dan boshlanadi (`takeCredits` bilan ayni mantiq),
  cheksiz ro'yxatdagiga rad; `admin_actions_kind_check` qayta yozildi
  (Test 23 qamraydi); (5) panelda yangi sahifa — jadval (ism / @username /
  ID / rol / kredit / AI 7 kun / buyurtma / oxirgi kirish / «Kredit berish»)
  + lenta + tur chiplari; yorliqlar SERVERDAN, frontendda ikkinchi ro'yxat
  yo'q; tana FAQAT server javob berganda ochiladi, xato SABAB bilan.

  **Qorovul — Test 51 (5 band):** `touchLastSeen` ikkala tarmoqda; `KINDS`
  dagi har tur kamida bir joyda yoziladi va teskarisi; buyurtma hodisasi
  COMMIT dan keyin; kredit QO'SHILADI; yorliqlar serverdan. Ish hisobotida
  «4 mutatsiya, 4/4 ushlandi»; **hisobotchi mustaqil 2 mutatsiya qildi**
  (sayt tarmog'idan `touchLastSeen` olib tashlandi; buyurtma hodisasi COMMIT
  oldiga ko'chirildi) — ikkalasi ham ushlandi, fayllar `cp` nusxadan
  tiklandi (`git checkout` EMAS), yakunda `git status` toza.
  ⚠️ Nomerlash: qorovul avval «Test 44», keyin «48» deb yozilgan — ikkalasi
  ham band ekan (`data-action` nishonlari, `Cloudflare bloki halol`).
  Hisobotchi o'lchab topdi; yakunda **Test 51** (bo'sh raqam) qilindi.

  🔴 **HALOL CHEGARA:** (a) `db/029` haqiqiy Postgres'da HALI ishlamagan
  va u backend restartidan **OLDIN** qo'llanishi SHART (README'da qadamlar;
  ustun yo'q bo'lsa har 5 daqiqada alert tushadi — ataylab jim emas);
  (b) `server/` rsync + restart founder tomonidan (`--no-owner --no-group`);
  (c) **founder panelni ko'z bilan ko'rmagan** — brauzerda SOXTA holat bilan
  sinaldi, jonli ma'lumot bilan emas; (d) `credit_grant` Telegram tugmasi
  jonli bosilmagan; (e) topbar'dagi «Oxirgi 30 kun» pill'i Trafik 7/90
  tanlovida o'zgarmaydi (u dashboard uchun). **PUSH QILINMADI.**

- [2026-08-19] **Cloudflare Web Analytics panelga ULANDI — bir yildan beri
  yig'ilib yotgan raqamlar birinchi marta KO'RILDI** (yangi
  `server/lib/cf-analytics.js`, `GET /api/admin/cf-traffic`, panelda alohida
  blok; kesh `admin.js?v=31`, `admin.css?v=20`). Bu 2026-08-18 yozuvida
  ATAYLAB ochiq qoldirilgan bandning yopilishi: o'shanda beacon'ning
  **2026-08-02 dan beri ishlab turgani** aniqlangan, lekin ma'lumotning O'ZI
  hech qachon ochilmagan edi. Bugun founder `Account Analytics: Read`
  tokenini yasadi va manba ochildi. **Birinchi o'lchov:** 29 kunda ~1700
  sahifa ko'rishi, ~1520 tashrif, eng gavjum kun 13-avgust (~270).

  🔴 **ENG QIMMAT TOPILMA — `siteTag` beacon tokeni EMAS.** Sahifadagi
  `data-cf-beacon` da `6acaeab5…` turadi (2026-08-18 da aynan shu qiymat
  o'lchab yozilgan), GraphQL esa `0d0ad786…` ni kutadi. **Beacon qiymati
  bilan so'ralganda javob XATOSIZ va BO'SH keladi** — HTTP 200, `errors`
  yo'q, `data` bor, ichi bo'sh. Ya'ni panel «hech kim kelmadi» deb
  turardi. Bu bizning eng qimmat xato turimiz: raqam yo'q emas, YOLG'ON
  (`ALERT_CHAT_ID`, `NULL` reyting va tarix darslari bilan bitta oila).
  To'g'ri qiymat GraphQL javobining O'ZIDAN o'lchab olindi, hujjatdan emas.

  ⚠️ **Admin panel tashriflari HISOBGA OLINMAYDI** (founder qarori, pastda).
  O'lchandi: 1700 ko'rishning **310 tasi** `/admin/` va `/loyiha-panel.html`
  edi — ya'ni **18%** o'zimizniki. Filtr **GraphQL TOMONIDA** qo'llanadi
  (`requestPath_notlike`), serverda emas: serverda kesilsa kunlik yig'indi
  baribir admin tashriflarini o'z ichiga olardi va «tozalangan» raqam
  aslida tozalanmagan bo'lardi. Filtr ishlagani o'lchandi: **1700 → 1390**.

  ⚠️ **Raqamlar NAMUNAVIY va panel buni AYTADI.** O'lchandi: qaytgan
  qiymatlarning HAMMASI 10 ga bo'linadi (10, 20, 60, 270…) — Cloudflare
  bepul tarifda tashriflarning bir qismini olib koeffitsiyentga
  ko'paytiradi. Panelda «aniq son emas, DARAJA sifatida o'qing» deb
  yozilgan.

  ⚠️ **Ikki manba YONMA-YON QO'YILMADI** (CLAUDE.md, 2026-08-18 qarori):
  Cloudflare bloki `trafficBody` DAN TASHQARIDA, o'z sarlavhasi va o'z
  ogohlantirishi bilan turadi. Endpoint ham ALOHIDA — bitta javobga
  qo'shilsa Cloudflare yiqilgan kuni butun Trafik sahifasi qulardi; endi
  har biri o'z holicha yiqiladi va panel qaysi manba yo'qligini AYTADI.
  Chizuvchi ham o'z `try` sida (2026-08-18 «chizuvchi tartibi» darsi).

  ⚠️ Javob 10 daqiqa keshlanadi, lekin **xato KESHLANMAYDI** — aks holda
  bir marta yiqilgan so'rov 10 daqiqa «xato» qaytarib turardi va
  tuzatilgani ko'rinmasdi. Sozlama IXTIYORIY: to'liq bo'lmasa blok
  UMUMAN chizilmaydi (nol ko'rsatilmaydi) va `process.exit` qilinmaydi
  (R2/AI/karta naqshi). Qisman to'ldirilgan `.env` jurnalda qichqiradi.

  **Qorovul: Test 48** — MATN emas, XATTI-HARAKAT sinovi: `fetch`
  almashtirilib 5 xil javob shakli yurgiziladi (GraphQL `errors` + qisman
  `data`, bo'sh natija, haqiqiy ma'lumot, HTTP xatosi, tarmoq uzilishi).
  Testlar **86 → 87**.

  🟠 **OCHIQ QARZ — QOROVULDA TESHIK BOR (hisobotchi o'lchadi, 2026-08-19).**
  Test 48 ning 1-bandi admin filtrini **matn bo'yicha** tekshiradi
  (`requestPath_notlike` va `/admin%` manba faylda bormi). Mutatsiya bilan
  sinaldi: `umumiy` satridan `AND: [${notlike}]` olib tashlanganda —
  ya'ni filtr GraphQL so'roviga UMUMAN bormaganda — `ICHKI_YOLLAR` va
  `notlike` quruvchisi faylda QOLGANI uchun **butun to'plam YASHIL
  qoldi**. Chiquvchi so'rov tanasi bilan tasdiqlandi:
  `requestPath_notlike` → yo'q, `/admin%` → yo'q. Ya'ni founder qarori
  jimgina buzilishi va panel yana 1700 (18% o'zimizniki) ko'rsatishi
  mumkin, hech narsa qizarmasdan. Kodning O'ZI to'g'ri — teshik faqat
  qorovulda. Tuzatish tayyor turibdi: test allaqachon `fetch` ni
  almashtiryapti, ya'ni so'rov tanasini ushlab (`JSON.parse(o.body).query`)
  filtrni XATTI-HARAKAT darajasida tekshirish mumkin. Bu Test 3f va
  Test 23 darsining AYNAN takrori: **qorovul matnni emas, KODNI o'qishi
  kerak.**

  🟠 OCHIQ: server kodi rsync qilingan va egalik to'g'irlangan, lekin
  **servis hali qayta ishga tushirilmagan** — ya'ni endpoint production'da
  hali tirik emas va founder blokni ko'z bilan ko'rmagan.

- [2026-08-18] **Sayt va Mini App trafigi endi O'LCHANADI va panelda ko'rinadi —
  yangi «Trafik» sahifasi (`db/028_traffic.sql`).** Band `users.src` (2026-08-13)
  ochib qoldirgan savolni yopadi: o'shanda odam QAYSI kanaldan kelgani
  o'lchanardi, **kelgandan keyin nima qilgani** esa umuman yo'q edi. Yangi
  `traffic_events` jadvali ikki hodisani yozadi — `view` (ekran ochildi) va
  `cart` (savatga qo'shildi); buyurtma ATAYLAB yozilmaydi, u `orders` da
  yashaydi va u yerda pulga bog'langan (nusxa ikki xil son berardi).

  🔴 **AVVAL TEKSHIRILDI VA ESKIRGAN DA'VO TOPILDI — ISH SHUNDAN BOSHLANDI:**
  panelning O'ZIDA «loyihada veb-analitika ulanmagan» deb yozilib turgandi
  (2026-07-27 qarori, pastda). Amalda **Cloudflare Web Analytics beacon'i
  2026-08-02 dan beri IKKALA yuzda ishlab turibdi**. Hisobotchi buni
  MUSTAQIL ikkinchi usul bilan qayta tasdiqladi (`curl`, brauzer
  sarlavhalari bilan): `static.cloudflareinsights.com/beacon.min.js`,
  token `6acaeab5…`, `lolamarket.uz/` va `lolamarket.uz/mini-app/` da AYNI
  token, `script-src` da host RUXSAT ETILGAN, beacon esa `/cdn-cgi/rum` ga
  — ya'ni O'Z originimizga — yozadi, shuning uchun `connect-src 'self'`
  ham to'sib qo'ymaydi. Ya'ni tekshirilmaganda **allaqachon o'lchanayotgan
  narsa ikkinchi marta qurilardi** (2026-08-13 dagi «`/start` hisoblagichi
  yo'q» darsining aynan takrori).
  ⚠️ **YO'L-YO'LAKAY TUZOQ, KELAJAKDA QAYTA TEKSHIRADIGAN ODAM UCHUN:**
  **oddiy `curl` beacon'ni KO'RSATMAYDI** — Cloudflare uni faqat so'rov
  brauzerga o'xshaganda (`Accept: text/html…`, `Sec-Fetch-Dest: document`)
  qo'shadi. Sarlavhasiz `curl` bo'sh javob beradi va u **«beacon yo'q»**
  degan YOLG'ON xulosaga olib keladi (bu ish paytida aynan shunday bo'ldi,
  ikkinchi urinishda ochildi).

  **Ikkalasi bir narsani o'lchamaydi va shuning uchun ikkinchi yo'l ochildi**
  (CLAUDE.md — «mavjud funksiya ustiga ikkinchi yo'l» qoidasi: ortiqchalik
  SANALDI): Cloudflare biladi — necha kishi keldi, qaysi mamlakat, qaysi
  havola, lekin **qaysi MATO ko'rilganini bilmaydi** (bizning `products.id`
  unga noma'lum) va ko'rish→savat konversiyasini hisoblay olmaydi. Ustiga
  Cloudflare raqami 7 kundan keyin ~10% ga siyraklashadi (namunaviy),
  bizniki esa har hodisaning o'zi (aniq).

  **Backend:** yangi `server/lib/traffic.js` (sof mantiq — ekran ro'yxati,
  bot filtri, tashrifchi belgisi, ref host, yuz aniqlash), yangi
  `server/routes/track.js` (`POST /api/track` — anonim, rate-limit, 400
  kunlik tozalash), `server/routes/admin.js` → `handleAdminTraffic`
  (`GET /api/admin/traffic?days=`, 7 so'rov: kunlik qator, yuz, ekranlar,
  mahsulotlar, referrer, voronka, o'lchov boshlangan sana), `server.js` da
  ikkita marshrut, `config.js` da `TRAFFIC_SALT`.
  ⚠️ **Endpoint kimlikni UMUMAN so'ramaydi va bu e'tibordan qolgan joy
  emas, QAROR:** `authUser()` ham, `requestUser()` ham chaqirilmaydi —
  kirmagan mehmon trafikning katta qismi, kimlik so'ralsa u butunlay
  o'lchanmasdi; ustiga bazada «kim qaysi sahifani ochdi» degan yozuv paydo
  bo'lardi. Klient `credentials: 'omit'` yuboradi, ya'ni «bu endpoint
  kimligingizni yozmaydi» degan gap va'da emas, KOD bilan tasdiqlangan.
  ⚠️ **Trafik `/api/admin/summary` ga QO'SHILMADI** — u panelning eng issiq
  so'rovi (har ochilishda va har amaldan keyin qayta yuklanadi), trafik esa
  vaqt oralig'i bilan so'raladi va og'irroq.

  **Frontend:** `script.js` va `telegram-app/app.js` da bir xil beacon
  (`keepalive: true` — sahifa yopilayotganda ham yetib boradi; xato JIM
  yutiladi, chunki o'lchov vositasi o'lchayotgan narsani sindirmasin, lekin
  SERVER tomonda xato ko'rinadi). `admin/index.html` + `admin/admin.js` —
  yangi «Trafik» sahifasi: 4 KPI, kunlik ustunlar, top matolar, ekranlar,
  ikki yuz, referrer, voronka. Statistika sahifasidagi eskirgan
  «veb-analitika ulanmagan» izohi almashtirildi.

  🔴 **BRAUZERDA O'LCHASH NUQSON TOPDI — VA U KOD O'QIGANDA KO'RINMASDI:**
  o'lchov avval faqat `renderDrawer()` da edi va «tortma ochiqmi» deb
  tekshirardi, `openCart()` esa AVVAL chizadi, `.open` klassini KEYIN
  qo'yadi — ya'ni **tortmaning birinchi ochilishi hech qachon sanalmasdi**
  va «Savat» ekrani faqat ochiq tortma ichida ko'rinish almashtirilgandagina
  yozilardi. Kod to'g'ri ko'rinardi, konsolda xato yo'q edi, testlar yashil
  edi (`flex: none` va `<picture>` qoidalari bilan bitta oila). Endi
  o'lchov `openDrawerEl()` da, takrorni `track()` ning o'zi to'sadi.

  **Sinov:** `node server/test.js` — **81 test PASS, 0 xato** (hisobotchi
  MUSTAQIL yurgizdi va `^✅ Test` satrlarini sanadi; 80 → 81, chunki Test 42
  yangi raqam). **Test 42** — 8 band, **13 mutatsiya bilan sinaldi, 13 tasi
  ham ushlandi**; ekran ro'yxati qo'lda yozilmaydi, ikkala frontend
  manbasidan yig'iladi (28 ekran, 15 sayt + 15 Mini App).
  ⚠️ **Yo'l-yo'lakay QOROVULNING O'ZIDA teshik topildi:** Test 23 `db/`
  dagi eng katta raqamli faylni SO'ZGA qarab tanlardi va `db/028` IZOHIDA
  `admin_actions_kind_check` eslatilgani uchun uni «ro'yxat manbai» deb
  qabul qilib QIZIL bo'ldi — kod esa mutlaqo to'g'ri edi. Endi SQL izohlari
  tahlildan oldin olib tashlanadi (`sqlSofi`). Bu Test 3f dagi «izohdagi
  `requestUser()` qorovulni aldardi» darsining AYNAN takrori: **qorovul
  matnni emas, KODNI o'qishi kerak.**

  **Kesh:** `script.js` 53 → 55, `admin/admin.js` 25 → 26,
  `telegram-app/app.js` 99 → 100, `panel.js` 46 → 47 (Test 16 jadvali birga).

  🔴 **HALI BAJARILMAGAN — ISH TUGALLANMAGAN HISOBLANADI:** (1) `db/028`
  haqiqiy Postgres'da HALI ishlamagan (lokalda baza yo'q — `pglite` AYNI
  dvigatel emas) va u backenddan **OLDIN** qo'llanishi SHART, aks holda
  `/api/track` va `/api/admin/traffic` birdan yiqiladi (27-iyul insidenti
  naqshi); (2) `server/` rsync qilinmagan va servis restart qilinmagan
  (`--no-owner --no-group` SHART — 2026-08-16 darsi); (3) frontend
  push/deploy qilinmagan; (4) **panel bloki JONLI ma'lumot bilan hech
  qachon ko'rilmagan** — bugungi hamma ekran bo'sh holatda sinaldi;
  (5) `TRAFFIC_SALT` serverdagi `.env` ga qo'yilmagan (qo'yilmasa
  `BOT_TOKEN` hosilasi ishlatiladi — ishlaydi, lekin token almashsa o'sha
  kungi TASHRIFCHI soni bir oz shishadi).

- [2026-08-14] **Manba belgisi endi JIMGINA rad etilmaydi — noto'g'ri havola
  ALERTGA chiqadi** (`server/routes/webhook.js` → yangi `manbaAniqla()`).
  🔴 **Band «`src` hech qachon yozilmagan — nuqson» deb ochilgandi va
  TA'RIF NOTO'G'RI bo'lib chiqdi:** `sprint-4.md` da o'z qo'limiz bilan
  «manba belgisining O'ZI jonli sinalmagan: haqiqiy `?start=guruh_ipak`
  havolasi hali bosilmagan» deb yozilgan, ya'ni **23/23 bo'sh bo'lishi
  KUTILGAN natija** edi. Buzilgan narsa yo'q, ishlatilmagan narsa bor.
  Tekshirilmasdan boshlanganda ishlab turgan mexanizm «tuzatilardi».

  **Tekshirish esa HAQIQIY nuqson topdi:** shakl qat'iy (`[a-z0-9_]{2,32}`),
  Telegram esa deep-link'da katta harf va chiziqchaga RUXSAT beradi — ya'ni
  `t.me/<bot>?start=Instagram` havolasi **ishlaydi**: odam kiradi, manba
  yo'qoladi va o'sha kanal shu paneldagi «Qaysi kanaldan kelishdi» blokida
  **«nol berdi»** bo'lib ko'rinadi. Bu blokning butun maqsadiga zid:
  raqam yo'q emas, **YOLG'ON**, va reklama byudjeti aynan shunga qarab
  taqsimlanardi (`NULL` reyting / `ALERT_CHAT_ID` oilasi).

  Shakl QAT'IY qoldirildi (founder qarori — pastdagi qarorga qara), o'zgargani
  JIMLIK. Ikkita hol ATAYLAB jim: payloadsiz `/start` (odatdagi kirish) va
  `web_...` (saytga kirish kodi, manba emas) — aks holda har kirish alert
  yuborib tomni to'ldirardi. Yo'l-yo'lakay `INSERT` parametri ham tuzatildi:
  endi TOZALANGAN `manba` uzatiladi, hisoblab tashlab yuborilmaydi.
  ⚠️ **Qorovul (Test 27) MATN emas XATTI-HARAKAT sinaydi va bu sababsiz
  emas:** birinchi variant `console.error(...` satrini qidirardi va
  mutatsiyada `if (false)` qo'yilganda YASHIL qoldi — Test 3f darsining
  takrori. Hujjat: **`docs/manba-havolalari.md`** (havola shakli, kanal
  ro'yxati jadvali, uchidan-uchigacha tekshirish buyruqlari).
  🔴 **Ochiq qolgani:** blok hamon HAQIQIY havola bilan sinalmagan — bitta
  `?start=guruh_ipak` bosilib `users.src` yozilishi o'lchansin; `db/025`
  production'da qo'llanganini tasdiqlash ham shu bandning ichida.

- [2026-08-13] **Statistika sahifasiga IKKI yangi blok — «Qaysi kanaldan
  kelishdi» va «AI kiyim rasmi».** Sabab jamoa muhokamasidan keldi va u
  yagona band bo'yicha UCHALA agent (PM, marketolog, investor) bir joyga
  ishora qilgan yagona holat edi: reklama boshlansa qaysi kanal odam olib
  kelayotganini o'lchash imkoni YO'Q edi, ya'ni byudjet ko'r-ko'rona
  ketardi. Mexanizm — Telegram deep-link: `t.me/<bot>?start=guruh_ipak`,
  belgi `users.src` ga yoziladi (`db/025`).

  🔴 **YO'L-YO'LAKAY TOPILGAN ESKIRGAN DA'VO, VA U ISHNI BOSHLASHDAN OLDIN
  TUTILDI:** QOLDIQ xotirasida "`/start` hisoblagichi yo'q" deb turardi —
  aslida u **`db/020` bilan 2026-08-08 da qo'shilgan** (10 kun oldin), ya'ni
  yozuv eskirgan edi. Agar tekshirilmasdan ish boshlanganda **allaqachon
  mavjud hisoblagich ikkinchi marta qurilardi**. Bu «hujjatdagi raqam —
  tekshirilmagan da'vo» qoidasining aynan o'zi, faqat raqam emas, MAVJUDLIK
  da'vosi bo'yicha.

  ⚠️ **`src IS NULL` KANALLAR RO'YXATIGA QO'SHILMAYDI** va bu qarorning
  o'zi blokdan muhimroq: u "manba noma'lum" degani, "to'g'ridan-to'g'ri
  keldi" DEGANI EMAS. Bitta ro'yxatga qo'yilsa **eng katta "kanal"
  o'lchanmagan qatorlar bo'lib chiqardi** va panel jimgina yolg'on gapirardi
  (`NULL` reyting qoidasi bilan bitta oila). Shuning uchun noma'lumlar soni
  ALOHIDA maydonda (`users.srcUnknown`) — ko'rinadi, lekin aralashmaydi.
  Ekrandagi izohda hisob **qaysi kundan boshlangani** ham yozilgan: raqamni
  ko'radigan odam hujjatni o'qimaydi (2026-08-08 qarori bilan bitta naqsh).
  ⚠️ Kanal qatorida `count` yonida **`engaged`** turadi — havola odamni OLIB
  KELGANI bilan uning ilovani OCHGANI bir narsa emas: bosilishi ko'p,
  ochilishi kam kanal reklama pulini yeb natija bermasligi mumkin va bu
  faqat ikki raqam yonma-yon turganda ko'rinadi.
  **AI bloki** hammasini HAQIQIY jadvallardan oladi (`product_ai_image` —
  chizilgan rasmlar, jami / 7 kun / noyob foydalanuvchi; `ai_credits` —
  sarflangan kredit). Nol ham haqiqiy javob; ma'lumot yo'q bo'lsa blok
  butunlay YASHIRINADI (2026-08-08 dagi "eski backend bo'lsa nol
  ko'rsatilmaydi" qarorining takrori).
  **Kesh:** `admin/admin.js?v=25`, `style.css?v=52` (`admin/index.html` va
  ildizdagi `index.html` da BIR XIL raqam). Batafsil: `sprint-4.md`.
  🔴 **HALOL CHEGARA:** ikkala so'rov ham pglite'da bajarib ko'rildi, lekin
  **haqiqiy Postgres'da hali ishlamagan va pglite AYNI dvigatel emas**;
  `db/025` serverda ishga tushirilmagan — u `webhook.js` deploy'idan OLDIN
  bajarilishi shart. ⚠️ Oqibat O'LCHANDI: webhook YIQILMAYDI va saytga
  kirish ishlayveradi (`INSERT` `.catch()` ichida), lekin `users` yozuvi
  butunlay to'xtaydi va hisob JIMGINA yolg'on gapira boshlaydi. Batafsil
  va nega "bot o'ladi" degan birinchi baho noto'g'ri edi — `sprint-4.md`.

- [2026-08-13] **Panelga TO'QQIZINCHI yozuv amali qo'shildi — "Videoni
  o'chirish" (`video_remove`), va u ham AYNI yo'ldan o'tadi.** Panel faqat
  `POST /api/admin/action` bilan so'rov yaratadi, haqiqiy o'chirish
  `ADMIN_CHAT_ID` chatidagi inline tugma bosilgandan keyin bo'ladi
  (2026-07-27 qarori — paneldan to'g'ridan-to'g'ri DB'ga yozadigan endpoint
  qo'shilmaydi). Tugma "Kelgan videolar" ro'yxatidagi kartochkada, sabab
  maydoni bilan; sabab sotuvchiga yuboriladi. **Mahsulot o'chmaydi.**
  Migratsiya `db/024` — `admin_actions_kind_check` ro'yxatiga `video_remove`
  qo'shildi va production'da ishga tushirildi. Endi bu ro'yxat ODATGA emas,
  **Test 23** ga tayanadi: u `ADMIN_ACTIONS` kalitlarini `db/` dagi eng
  oxirgi CHECK migratsiyasi bilan solishtiradi. Sabab shu sprintning O'Z
  darsi — `db/014` da `review_hide` CHECK'ga qo'shilmagani uchun sharh
  yashirish production'da JIMGINA ishlamagan. Batafsil: `sprint-4.md`
  (video ishi o'sha yerda yuritiladi). Kesh: `admin/admin.js?v=24`

- [2026-07-25] **Operatsion insident: admin panel production'da (lolamarket.uz/admin) kira olmasdi — tuzatildi (faqat server, repo'da diff yo'q).** Sabab zanjiri uch qavatli edi: (1) oldingi commit `0b5d09e` (Sprint 7 real API'ga o'tish) `ADMIN_PANEL_TOKEN`ni production `.env`ga hali qo'shmagan edi ("Hali qilinmagan" deb yozilgan edi) — token bo'sh bo'lgani uchun endpoint doim 401 qaytargan; (2) token qo'yilgandan keyin ham kirmadi, chunki `/etc/nginx/sites-available/lolamarket`da `/api/admin/` uchun proxy bloki umuman yo'q edi — so'rov Node backend'ga (127.0.0.1:3001) yetib bormay statik fayl serverga tushib, 200 status bilan landing HTML qaytarardi (frontend buni "kalit noto'g'ri" deb ko'rsatardi); (3) proxy qo'shilgach backend `relation "seller_applications" does not exist` xatosi berdi — `db/004_seller_applications.sql` migratsiyasi (repo'da bor, `0b5d09e` bilan qo'shilgan) production bazada hali ishga tushirilmagan edi, ishga tushirilgach jadval egasi noto'g'ri bo'lib `permission denied` chiqdi (`lola` user emas, `postgres` egalik qildi). Barcha tuzatish to'g'ridan-to'g'ri Hetzner serverda (65.21.180.44) SSH orqali bajarildi: `.env`ga `ADMIN_PANEL_TOKEN=lolamarket` qo'yildi va `lolamarket-notify` restart qilindi; nginx'ga `/api/admin/` proxy bloki qo'shildi (`.bak` nusxa olingandan keyin, `nginx -t` bilan tekshirilib, `reload` qilindi); migratsiya `scp` + `psql -f` orqali qo'lda qo'llandi (idempotent); jadval egaligi `ALTER TABLE ... OWNER TO lola` bilan tuzatildi, `lola_ro`ga `GRANT SELECT` va sequence uchun `GRANT USAGE, SELECT` berildi. Tekshirildi: `curl` va brauzer orqali `lolamarket.uz/admin`ga `lolamarket` kodi bilan kirish, statistika kartalari, so'nggi buyurtmalar va kategoriya diagrammasi to'liq ishlayapti. **Muhim:** bu safar repo'da hech qanday fayl o'zgarmadi (`git status` clean) — nginx konfiguratsiyasi, `.env` qiymati va DB grant'lari CLAUDE.md qoidasiga ko'ra git'ga kirmaydi; faqat shu hujjatlashtirish commit qilindi
- [2026-07-25] **Admin panel mock ma'lumotlardan real API'ga o'tkazildi (2-variant: real ma'lumot, harakatlar hamon bot orqali).** Sabab: Sprint 0'da admin panel yangi dizaynga o'tkazilganda funksionallik ataylab o'zgartirilmagan edi — mock parol (`PASSWORD='lolamarket'`, brauzer konsolida ochiq ko'rinardi) va hardcoded mock massiv qolgan edi, chunki standalone veb-sahifa Telegram `initData` ishlab chiqara olmaydi. Backend (`server/server.js`): yangi `ADMIN_PANEL_TOKEN` env o'zgaruvchisi (Telegram initData'dan mustaqil alohida sir, `.env`da; berilmasa endpoint doim 401), `safeEqual()` doimiy vaqtli taqqoslash helperi (timing attack himoyasi), yangi **faqat o'qish uchun** `GET /api/admin/summary` endpoint (`X-Admin-Token` header + rate limit) — moderatsiyadagi mahsulotlar soni, ko'rib chiqilmagan sotuvchi arizalari soni, bugungi buyurtmalar soni, tasdiqlangan sotuvchilar soni, kategoriya statistikasi, so'nggi 20 buyurtma; `cors()`ga `X-Admin-Token` header ruxsati qo'shildi; `server/README.md`ga hujjatlashtirildi. Frontend (`admin/`): `admin.js` to'liq qayta yozildi — mock parol va hardcoded massiv olib tashlandi, login formasi kiritilgan qiymatni `X-Admin-Token` sifatida yuboradi, tasdiqlansa token `sessionStorage`da saqlanadi (sahifa ochilganda avtomatik kirish sinaladi); `admin/index.html` statistika kartalari va buyurtma filtrlari real status kalitlariga (`pending/confirmed/shipped/delivered/cancelled`) o'tkazildi, kategoriya diagrammasi JS orqali to'ldiriladi, login maydoni "Admin kaliti"ga o'zgartirildi (kesh `v=2`); `admin/admin.css`ga `.empty-cell` qo'shildi. Brauzerda mock `fetch` bilan to'liq test qilindi (login xatosi, statistika, jadval, filtr, bo'sh holat, kategoriya diagrammasi, noma'lum kategoriya fallback) — 0 konsol xatosi. **Hali qilinmagan:** haqiqiy backend (Postgres + real token) bilan test — production DB lokal muhitda yo'q, deploy vaqtida tasdiqlanadi; `server.js` production serverga hali ko'chirilmagan; `ADMIN_PANEL_TOKEN` production `.env`ga hali qo'shilmagan. Sprint 7dagi qolgan vazifalar (tasdiqlash/rad etish amallari, escrow/refund, bahsli holatlar, statistika sahifasi) hali bot buyruqlari orqali va boshlanmagan holicha qoladi

---

- [2026-07-26] **Admin panel UI qayta qurildi: bitta sahifalik header o'rniga to'liq sidebar-navigatsiyali ilova qobig'i.** `admin/index.html`, `admin/admin.css`, `admin/admin.js` uch fayl ham qayta ishlandi (`.app-shell` = `.sidebar` + `.main-col`). Chap tomonda `.sidebar` bilan 5 bo'lim: Dashboard, Buyurtmalar, Sotuvchilar, Moderatsiya, Statistika (`.nav-item[data-page]`, JS bilan almashtiriladi, `.page.active` ko'rinadi). Yuqorida `.topbar` — sahifa sarlavhasi/subtitr va vaqt oralig'i tugmasi. Dashboard sahifasida yangi vizual qatlamlar qo'shildi: daromad (GMV) va tashrifchi/xaridor chiziqli grafiklar (`renderLineChart`, oddiy inline SVG), stat-kartalarga ikonka/trend belgisi. Sotuvchilar, Moderatsiya va sotuvchi arizalari bo'limlari hozircha **`MOCK_APPLICATIONS` / `MOCK_SELLERS` / `MOCK_MOD_QUEUE` va GMV/tashrifchi/xaridor sonlari uchun `MOCK_*` konstantalar bilan to'ldirilgan** (`admin.js` boshida "backend endi'cha ro'yxat qaytarmaydi" izohi bilan belgilangan) — faqat `/api/admin/summary`dan kelgan moderatsiya/sotuvchi arizasi/buyurtma/sotuvchi hisoblagichlari, so'nggi buyurtmalar va kategoriya statistikasi real qoladi. **Hali qilinmagan:** sotuvchilar/moderatsiya/statistika sahifalari uchun real backend endpointlari (hozircha faqat vizual maket), shundan keyin mock massivlarni almashtirish kerak.

- [2026-07-26] **Admin panelga yangi "Reja/Fakt" sahifasi qo'shildi: tasdiqlangan 12 oylik savdo rejasi bilan joriy holatni solishtirish.** `admin/admin.js`ga LolaMarketning tasdiqlangan 12 oylik savdo rejasini (`future/lolamarket-future.html`dan ko'chirilgan — bu fayl untracked, alohida, commit'ga kirmaydi) tashuvchi yangi konstantalar qo'shildi: `PLAN_MONTHS`, `PLAN_UNITS_PER_DAY`, `PLAN_UNITS_PER_MONTH`, `PLAN_ESTIMATED`, `PLAN_PRICE_PER_UNIT` ($82 o'rtacha chek), `PLAN_COMMISSION_RATE` (12%) va bularni render qiluvchi `renderPlanFakt()` funksiyasi. Reja Sentabrdan boshlanadi (`currentPlanIndex()` joriy kalendar oyni reja siklidagi mos oyga moslaydi); Iyul/Avgust uchun haqiqiy reja yo'q — naqsh asosida taxminiy hisoblangan (`PLAN_ESTIMATED`). `admin/index.html`da sidebar'ga yangi "Reja/Fakt" nav-item va yangi `#page-planfakt` sahifasi qo'shildi: joriy oy uchun reja (kunlik birlik) vs fakt (bugungi real buyurtmalar soni, `/api/admin/summary`dan) solishtiruvchi 3 ta stat-karta va to'liq 12 oylik reja jadvali (oy, kunlik/oylik birlik, o'rtacha chek, GMV, komissiya). Summalar hozircha manbadagi kabi $ da — so'mdagi haqiqiy GMV bilan bevosita solishtirilmaydi, bu UI'da eslatma sifatida yozilgan. Brauzerda mock ma'lumot bilan tekshirilgan — konsol xatosi yo'q. **Hali qilinmagan:** Fakt ustuni hozircha faqat joriy oy uchun ishlaydi — backend hali oylik agregatsiya bermaydi, bu qo'shilgach o'tgan oylar uchun ham real fakt ko'rsatiladi

- [2026-07-26] **Admin panel dashboard'i qayta dizayn qilindi: hero "Savdo dinamikasi" grafigi, yashirin "Bizning daromad" kartasi va butun panel bo'ylab shisha (glass) qatlam.** Dizayner agenti feedback'i va founder'ning bir necha bosqichli talablari asosida `admin/index.html`, `admin/admin.css`, `admin/admin.js` qayta ishlandi. **Grafik:** eski 150px balandlikdagi 7 kunlik kichik grafik o'rniga to'liq kenglikdagi 260px hero panel, 30 kunlik oyna. Oraliq bosqichda fakt ustunlari (bar) + reja chizig'i combo qilib ko'rilgan edi, ammo founder rad etdi ("ustun kerak emas, eski silliq chiziqqa o'xshasin") — YAKUNIY holat: FAKT silliq chiziq + gradient to'ldirish (Statistika sahifasidagi grafik uslubi, `smoothPath()`), oxirida nuqta marker. Reja chizig'i founder talabi bilan grafikdan BUTUNLAY olib tashlandi ("plan chizig'ini olib tashla") — reja endi faqat matn sifatida ko'rinadi: panel ichidagi xulosa qatorida "Aylanma — reja" va "Bajarilish %", hamda hover tooltip'da (sana / fakt / reja / bajarilish %). Ustunlar bilan birga rejadan past kunlarni saffron rangda ajratuvchi ogohlantirish ham olib tashlandi. Tooltip chekka kunlarda panel tashqarisiga chiqmasligi uchun cheklab qo'yilgan. Xulosa qatori: O'rtacha kunlik · Aylanma—reja · Bajarilish · Bugun — summalar founder talabiga ko'ra BALANS uslubida to'liq raqamlarda va mono shriftda ("1 342 086 001 so'm"); stat kartalarda joy tor bo'lgani uchun ixcham format ("1,34 mlrd so'm") qoldirildi. **Yangi "Bizning daromad" (komissiya) kartasi:** hero panelning o'ng yuqori burchagida glass karta — yopiq holatda summa `blur(7px)` ostida va raqamlar 70ms intervalda tasodifiy aylanib turadi ("biji-bijir" effekti), shuning uchun haqiqiy summa bilinmaydi; bosilganda 45ms da tez aylanadi, 550ms dan keyin haqiqiy qiymatga qo'nadi, blur ochiladi va ustidan yorug'lik yugurib o'tadi (`earnShine`), qayta bosilsa yopiladi. `prefers-reduced-motion` qo'llab-quvvatlanadi. Qiymat = 30 kunlik fakt GMV × 12% komissiya. **Ikonkalar:** barcha SVG'lar stroke-kontur o'rniga to'ldirilgan (filled) silhouette'ga o'tkazildi — 13 xil ikonka, jami 18 ta joyda; qalqon va check-square ikonkalarining ichki belgisi `fill-rule="evenodd"` bilan kesma qilingan; CSS'da `.nav-item svg` / `.sidebar-logout svg` / `.icon-btn svg` / `.stat-icon svg` `stroke` o'rniga `fill: currentColor`. **Sidebar:** faol band avval yorqin bordo gradient edi — endi iPhone uslubidagi "bosilgan shisha" pill: pom tusli yarim shaffof qatlam + `blur-lg` + `glass-edge` chegara + ichki nur (`glass-spec`) + soya, `:active` da `scale(.965)`, hover'da yengil oq shisha qatlam, `nav-badge` faol holatda `pom-600`. **Glassmorphism** barcha qatlamlarga tarqatildi: `.stat-card` / `.panel` / `.orders-table-wrap` / `.app-card` / `.mod-card` — `blur-lg`, `glass-edge`, `glass-cast` soya + `glass-spec`, hover'da soya kuchayadi. **Stat kartalar** founder ikki marta qaytargandan keyin bir xil dizaynga keltirildi: yuqoridagi 3px yorqin rangli aksent chizig'i olib tashlandi ("ko'zni itarayabdi"), birinchi kartaning to'q bordo gradienti ham olib tashlandi ("qolgan 3 tasiga o'xshat") — `stat-card accent` klassi Dashboard, Statistika va Reja/Fakt sahifalarining hammasidan chiqarildi, hamma karta yengil shisha; rang endi faqat juda yumshoq fon tusi orqali beriladi (`tone-pom` / `tone-teal` / `tone-saffron`, glass fill ustiga qatlanadi). **Login ekrani** brendlashtirildi: ikki yumshoq blur rang dog'i (pom + teal) fon, logo bordo gradient "crest" ichida. **Mock ma'lumot mantiqi:** `MOCK_GMV_TOTAL` / `MOCK_GMV_TREND` / `MOCK_COMMISSION_TOTAL` / `MOCK_ORDERS_THIS_MONTH` qattiq kodlangan konstantalar olib tashlandi — `buildDailySeries()` 30 kunlik deterministik seriya quradi: fakt joriy oyning kunlik reja bazisidan hosil qilinadi (o'sish trendi + sinus to'lqin + kichik shovqin), ammo ataylab kunlik rejaga qattiq bog'lanmagan, chunki oy chegarasida reja pog'ona bo'lib sakraydi va chiziq "jar" bo'lib tushardi; GMV / komissiya / buyurtma soni shu seriyadan hisoblanadi, shuning uchun grafik va stat kartalar bir-biriga mos. `USD_TO_SOM = 12600` konstantasi qo'shildi (reja $ da, fakt so'mda), `fmtSomShort()` helperi katta summalarni "1,34 mlrd" / "46,2 mln" ko'rinishida beradi. Kesh `admin.css?v=6`, `admin.js?v=6` (v=5 dan oshirildi — founder brauzerida eski CSS keshda qolib ketgan edi); topbar pill "Oxirgi 7 kun" → "Oxirgi 30 kun". Lokal serverda stub `fetch` bilan tekshirildi: Dashboard / Statistika / Reja/Fakt sahifalari, tooltip aniq reja qiymatini ko'rsatishi, daromad kartasi ochilishi (161 050 320 so'm = 1 342 086 001 × 12%), barcha stat kartalar DOM'da `glass` ekani — 0 konsol xatosi. **Hali qilinmagan:** fakt raqamlari HOZIRCHA MOCK (founder: "Plan faktni hozircha raqamlarini havodan olib tur") — backend'da kunlik GMV agregatsiyasi yo'q, `/api/admin/summary` faqat `ordersToday` qaytaradi; qo'shilgach `buildDailySeries()`dagi `fakt` maydonini real ma'lumotga almashtirish kifoya. Shuningdek `USD_TO_SOM` qattiq kodlangan kurs — kelajakda real kurs kerak; Reja/Fakt sahifasidagi jadval hamon faqat oylik ko'rinishda

- [2026-07-26] **Admin panel dizayni founder bilan iterativ qayta ishlandi: asosiy rang kuchaytirildi, sidebar oq bo'ldi, kontent foni to'liq oq, dashboard vizual kartochkalarga o'tdi.** `admin/index.html`, `admin/admin.css`, `admin/admin.js` (kesh `v=6` → `v=16`). **1) Asosiy rang (anor) kuchaytirildi** — founder: "asosiy rang kamlik qilayabdi": jadval sarlavhalari anor tintga o'tdi (`pom-700` yozuv, anor hairline), qator hover'ida anor tus; bo'lim sarlavhalari oldiga tik 3px anor chizig'i; stat ikonka chiplari yumshoq fon o'rniga to'ldirilgan gradientga o'tdi (anor / teal / saffron, oq glif); `panel-value` bosh summalari `pom-700` rangda, faqat Statistika sahifasidagi teal/saffron grafik panellarida qora qoldirildi; filtr pill'lari, `range-pill`, `icon-btn` anor chegara/hover oldi; login ekrani fonidagi anor dog'lar 16% → 30% ga kuchaytirildi. **2) Sidebar** bir necha iteratsiyadan o'tdi: avval to'q anor gradient (`#85180f`→`#3d0a04`), keyin "yumshoq rang qil" bo'yicha yengillashtirildi, keyin "logoning backgroundini ishlat" bo'yicha `Photo/logo/IMG_0408.JPG` fonidan aniq rang olinib mat va tekis `#510100` (`--pom-800`) qo'yildi — YAKUNIY holat founder qarori bilan **oq sidebar**: faol nav band to'ldirilgan anor gradient + oq matn (`nav-badge` faol holatda oq fon, `pom-700` yozuv), logotip endi invert qilinmaydi. **3) Kontent foni to'liq OQ** — `.main-col` `#FFFFFF`, topbar oq shisha. Yo'l-yo'lakay nuqson tuzatildi: karta chegarasi `--glass-edge` (OQ rang) edi — krem fonda ko'rinardi, oq fonda butunlay yo'qolardi; yumshoq issiq hairline `rgba(133,24,15,.11)` bilan almashtirildi. **4) Dashboard vizual kartochkalarga o'tdi** — founder: "dashboardni ham ma'lumotlarini hammasi shunaqa kartochkalarda visual chiroyli ko'rsat": YANGI "Reja bajarilishi — 30 kun" doira (donut) ko'rsatkichi (`renderPlanGauge()`, SVG `stroke-dasharray`, markazda foiz, yonida Fakt / Reja / Farq qatori — farq manfiy bo'lsa saffron, ijobiy bo'lsa yashil); YANGI "Oxirgi 7 kun — kunlik GMV" ustunlar diagrammasi (`renderWeekBars()`, har kun uchun punktir reja chizig'i `.wb-plan`, rejani bajargan kun ustuni yashil; shkalaga 8% bo'sh joy qo'shildi, aks holda reja chizig'i track tepasiga qadalib oddiy chegaraga o'xshab ko'rinmay qolardi); "Buyurtma holatlari taqsimoti" Statistikadan dashboardga ham qo'shildi (`renderStatusDist()` endi ikki elementga render qiladi — `statusDist` + `statusDistDash`); "So'nggi buyurtmalar" jadval o'rniga kartochkalarga o'tdi (`.order-card`: ID, holat pill, avatar + ism, tarkib/sana); Kategoriyalar paneli yarim kenglikka o'tib bir ustunli ro'yxatga aylandi (`cat-list-wide` → `cat-list`). **5) Olib tashlandi** (founder qarori): hero paneldagi 4 ta xulosa raqami — O'rtacha kunlik / Aylanma—reja / Bajarilish / Bugun ("umuman kerak emas") HTML, JS va CSS'dan butunlay o'chirildi; "Bizning daromad" kartasi ("shun ham kerak emas") — HTML, `initEarnCard()`, raqam aylantirish taymerlari, `earnShine` animatsiyasi va barcha `.earn-*` uslublari o'chirildi. Ma'lumot yo'qolmadi: reja/bajarilish doira kartochkasida, komissiya daromadi esa stat kartasida qoldi. **6) Nuqson tuzatildi** — founder: "qolgani nimaga disbalance bo'lib qoldi dashboardda": `.earn-card` CSS'ini o'chirishda o'sha izoh diapazoniga tushib qolgan dashboard kartochkalari CSS'i (`.gauge`, `.week-bars`, `.order-cards`, `.dash-grid-even`) ham o'chib ketgan edi — natijada `.gauge` o'lchami yo'qolib donut SVG 577px ga cho'zildi, panel 755px bo'ldi, yonidagi panelda 371px bo'sh joy qoldi; CSS qaytarildi. Qo'shimcha: `dash-grid-even` panellari flex-ustun bo'ldi, oxirgi blok o'sadi va qatorlar tekis taqsimlanadi — ikkinchi qatordagi 114px balandlik farqi yo'qoldi. Brauzerda barcha sahifalar tekshirildi (Dashboard, Buyurtmalar, Sotuvchilar, Moderatsiya, Statistika, Reja/Fakt), konsolda xato yo'q, panel balandliklari o'lchandi va teng (267/267, 304/304). **Hali qilinmagan:** fakt raqamlari hamon mock — backend kunlik GMV agregatsiyasini bermaydi, doira va 7 kunlik ustunlar ham shu `buildDailySeries()` seriyasidan oziqlanadi

- [2026-07-27] **Sprint 7 yakunlandi: bahslar, komissiya, to'lov/refund va real statistika qo'shildi — admin panel mock'dan butunlay chiqdi.** Yangi migratsiya `db/005_sprint7_admin.sql`: `disputes` skeleti ish oqimiga kengaytirildi (status, `opened_by_tg`, `seller_id`, `seller_response`, `evidence_file_ids TEXT[]`, `awaiting_evidence`, `logistics_payer`, `refund_amount`, `resolved_at`, `reminded_at`), bitta buyurtmada bitta ochiq bahs bo'lishi uchun qisman unikal indeks; `orders`ga `commission_rate` / `commission_amount` / `payout_amount` / `paid_out_at` / `refund_amount` / `refund_reason` / `refunded_at` va status CHECK'ga `disputed` / `completed` / `refunded`; yangi `admin_actions` jadvali. **Yo'l-yo'lakay bo'shliq yopildi:** `prepay_amount` / `rest_amount` / `tracking_code` ustunlari 2026-07-25 da to'g'ridan-to'g'ri production bazada ALTER bilan qo'shilgan, hech qaysi migratsiya faylida yo'q edi — toza bazada loyiha ishga tushmasdi; 005'da rasmiylashtirildi. **Backend** (`server/server.js`): `COMMISSION_RATE` env (default 0.10), buyurtma yaratilganda stavka snapshot qilinadi va sotuvchiga o'tkaziladigan summa qat'iylashadi; `POST /api/admin/action` + `GET /api/admin/action?id=` (panel so'rovi → `admin_actions` pending → ADMIN_CHAT_ID'ga inline tugmali xabar → `callback_query` → ijro, 30 daqiqadan keyin eskiradi); webhook endi `update.callback_query` ni ham o'qiydi (ilgari faqat `message`); yetti amal turi ro'yxatga olindi (`seller_approve/reject`, `product_publish/reject`, `order_payout`, `order_refund`, `dispute_resolve`), har biri oldindan tekshiriladi — mantiqsiz so'rov Telegram'ga umuman bormaydi; `POST/GET /api/disputes` (xaridor), `POST /api/seller/dispute` (sotuvchi javobi), `GET /api/admin/disputes`, `GET /api/admin/dispute-photo` (dalil rasmi HMAC imzo bilan proksi qilinadi — Telegram fayl URL'ida bot tokeni bor, u panelga chiqmaydi); dalil rasmi bot suhbatida yig'iladi (10 tagacha, "tayyor" deb yozilsa yopiladi); `scanStaleDisputes()` 24 soatlik eslatma; `/api/admin/summary` kengaytirildi — kunlik/oylik agregatsiya, `topSellers`, arizalar/sotuvchilar/moderatsiya navbati RO'YXATLARI, `payoutDue`; `/api/seller/orders` javobiga ochiq bahs qo'shildi; botga `/bahslar` buyrug'i. **Admin panel** (`admin/`, kesh `v=17`): `admin.js` qayta yozildi — `MOCK_APPLICATIONS` / `MOCK_SELLERS` / `MOCK_MOD_QUEUE` / `MOCK_VISITORS_*` / `MOCK_BUYERS_*` va `buildDailySeries()` mock generatori butunlay olib tashlandi, hammasi bazadan; yangi "Bahslar" sahifasi (ochiq/hal qilingan, dalil rasmlari, 24 soatdan oshgani qizil chiziq bilan, qaror modali); buyurtmalar jadvaliga Jami / Komissiya / Sotuvchiga ustunlari va "Pul o'tkazish" / "Refund" tugmalari; har yozuv amali "Telegram'da tasdiqlash kutilmoqda" oynasi bilan natijani so'raydi; Reja/Fakt jadvaliga real Fakt va Bajarilish ustunlari qo'shildi. **Mini App** (`telegram-app/`, `app.js?v=47`): xaridor buyurtma kartochkasida "Muammo bor" tugmasi va bahs holati bloki, sabab tanlash sheet'i; sotuvchi kabinetida shikoyatga javob yozish; `STATUS_TXT` / `STATUS_TONE` ga `completed` / `refunded` / `cancelled` qo'shildi — bularsiz yangi holatdagi buyurtma kartochkasi chizilayotganda JS xatosi bo'lardi (`cancelled` uchun bu allaqachon mavjud nuqson edi). **Olib tashlandi:** Statistika sahifasidagi tashriflar/xaridorlar/konversiya bloklari va stat kartalardagi qattiq kodlangan "+12% / +18% / +9%" trend belgilari — loyihada veb-analitika yo'q, bu raqamlar o'ylab topilgan edi. Sinov: `pg` va Telegram stub qilingan tayanch bilan 23 ta tekshiruv o'tdi (ruxsat, validatsiya, ikki bosqichli tasdiq, begona odam tugmani bosishi, ikki marta bosish, holat qoidalari, bahs egaligi); admin panel va Mini App brauzerda soxta API bilan ko'zdan kechirildi — 0 konsol xatosi. **Deploy (o'sha kuni bajarildi va tasdiqlandi):** 005 migratsiyasi production bazada qo'llandi (`admin_actions` egaligi `lola`ga, `lola_ro`ga `GRANT SELECT`); `COMMISSION_RATE=0.10` server `.env`ga qo'shildi; nginx'ga `/api/disputes` proxy bloki qo'shildi (`.bak` olindi, `nginx -t` o'tdi, reload) — qolgan yangi yo'llar mavjud `/api/admin/` va `/api/seller/` prefikslariga tushadi; `server.js` `/opt/lolamarket-notify/` ga ko'chirildi va servis restart qilindi; `admin/`, `mini-app/`, `loyiha-panel.html` rsync bilan `/var/www/lolamarket/` ga. Jonli tekshiruv: yangi endpointlar tokensiz to'g'ri 401 JSON qaytardi (landing HTML emas), token bilan `summary` 15 ta kalit + 30 kunlik va 12 oylik seriya qaytardi, `/api/admin/disputes` bo'sh massiv, deploy qilingan fayllarda `MOCK_` qoldig'i 0. **Hali qilinmagan:** SQL'ning o'zi lokal Postgres'da sinalmadi (lokal baza yo'q) — faqat production'da tasdiqlandi; eski 6 ta buyurtmada `commission_amount` bo'sh (NULL) — ular komissiya hisobotida 0 bo'lib ko'rinadi

- [2026-07-30] **2026-07-27 dagi "eski buyurtmalarda commission_amount NULL" bo'shlig'ini yopuvchi migratsiya yozildi va production bazasida ishga tushirildi — `db/008_backfill_commission.sql`.** 005 migratsiyasidan oldin yaratilgan buyurtmalarda `commission_rate`/`commission_amount`/`payout_amount` ustunlari keyin qo'shilgani uchun NULL qolgan, komissiya hisobotida ular 0 bo'lib ko'rinardi (haqiqiy GMV o'zgarmagan, faqat hisobot chalg'itardi). O'sha paytdagi haqiqiy stavkani bilib bo'lmaydi (`commission_rate` umuman yozilmagan edi) — default qiymat (server/config.js `COMMISSION_RATE`, 0.10) ishlatiladi. Idempotent: faqat `commission_amount IS NULL` qatorlarga tegadi, qayta ishga tushirilsa hech narsa o'zgarmaydi. Production'da ishga tushirildi: `UPDATE 6` qator. Tasdiqlash so'rovi: bazada jami 9 buyurtma, barchasida komissiya to'ldirilgan (0 ta NULL), jami summa 24 530 000 so'm, jami komissiya 2 453 000 so'm, sotuvchiga to'lov 22 077 000 so'm. Shu kuni serverda eski nginx zaxira fayli (`/etc/nginx/sites-enabled/lolamarket.bak-20260729-130700`) ham tozalandi, `nginx -t` bilan tekshirildi — config sog'lom

- [2026-08-02] **Platforma komissiyasi 10% dan 12% ga ko'tarildi — kod, hujjatlar va MAVJUD buyurtmalar birga o'tkazildi (`db/013_commission_12.sql`).** Founder qarori. **Kod:** `server/config.js` da `COMMISSION_RATE` default `0.10` → `0.12`; `server/test.js` Test 2 yangi stavkaga o'tkazildi (1 000 000 so'mdan komissiya 120 000, sotuvchiga 880 000) — `npm test` 0 xato bilan o'tdi. **Hujjatlar:** `docs/prd.md` da to'rt joyda "10–12%" → "12%" (escrow tavsifi, sotuvchi hikoyasi 13, biznes qarorlar jadvali, qabul mezonlari); `docs/texnik-topshiriq.md` da ikki joyda **15%** yozilgan edi (na 10%, na 12% — hujjat hech qachon kod bilan mos kelmagan ekan) → 12%; `docs/dizayn-qolgan-ekranlar.md` Q6 "Pul olish" bot matni namunasi qayta hisoblandi ("1 284 800 so'm o'tkazildi (komissiya 12%: −175 200)"); `server/README.md` env jadvalida default 12%, Sprint 7 deploy qadamiga ogohlantirish qo'shildi (`grep -q ... ||` faqat QO'SHADI, mavjud qatorni YANGILAMAYDI — eski serverda qiymat o'z-o'zidan almashmaydi) va yangi "Komissiya stavkasini o'zgartirish" bo'limi (`.env` ni `sed` bilan almashtirish + servis restart, oldin `.env.bak-` nusxasi bilan). **Migratsiya `db/013_commission_12.sql`:** mavjud buyurtmalarni ham 12% ga qayta hisoblaydi. Bu Sprint 7 dagi "snapshot o'zgarmaydi" qoidasidan ATAYLAB chekinish (pastdagi qarorga qarang). Xavfsizlik choralari: avval `orders_commission_bak_20260802` zaxira jadvali `CREATE TABLE IF NOT EXISTS ... AS SELECT` bilan — migratsiya qayta ishga tushsa zaxira ustidan yozilmaydi, aks holda birinchi ijrodagi asl 10% qiymatlar yo'qolardi; summalar har safar `total_amount` dan QAYTA hisoblanadi (o'suvchi emas), ya'ni idempotent; hammasi `BEGIN/COMMIT` ichida; oxirida tekshiruv bloki — 0.12 ga mos kelmagan bitta qator topilsa `RAISE EXCEPTION` bilan to'xtaydi va hech narsa yozilmaydi; fayl oxirida tiklash so'rovi. **Buxgalteriya ogohlantirishi yozib qo'yildi:** `paid_out_at IS NOT NULL` buyurtmalar ham qamraladi — ularda sotuvchiga pul ALLAQACHON eski 10% bo'yicha (summaning 90% i) o'tkazilgan, baza esa endi 88% deb turadi, ya'ni yozuv haqiqiy bank o'tkazmasi bilan zid. Founder'ga aytildi va u ataylab tasdiqladi; `WHERE paid_out_at IS NULL` filtri SHU SABAB yo'q va fayl sarlavhasida "kelajakda kimdir unutilgan deb qo'shib qo'ymasin" deb yozilgan. Migratsiyadagi `DO` bloki bunday qatorlarni `NOTICE` bilan ro'yxatlaydi, farq qo'lda hisobga olinadi. `db/008_backfill_commission.sql` da faqat IZOH o'zgardi — undagi 0.10 QASDDAN qoldirildi, chunki u fayl 2026-07-30 da production'da bajarilgan migratsiyaning qaydi, izohda endi 013 ga ishora bor. **Yo'l-yo'lakay hujjat ziddiyati tuzatildi:** `server/README.md` ning yangi bo'limida "eski buyurtmalar tegilmaydi, retroaktiv o'zgarmaydi" deb yozib qo'yilgan edi — o'sha kuni 013 aynan buning teskarisini qilgan; matn to'g'rilandi (snapshot "o'zgarmas" emas, "o'z-o'zidan o'zgarmaydi"; retroaktiv o'zgartirish alohida migratsiya bilan qilinadi). **Production holati:** 013 production bazasida BAJARILDI (founder o'zi ishga tushirdi — `psql` menda ruxsat klassifikatori tomonidan bloklanadi). Tasdiq so'rovi natijasi: `commission_rate` 0.1200, 9 ta buyurtma, bitta guruh, ya'ni 10% da qolgan qator yo'q. **Hali qilinmagan (MUHIM):** serverdagi `/opt/lolamarket-notify/.env` dagi `COMMISSION_RATE` hamon 0.10 bo'lishi mumkin va servis restart qilinmagan — usiz YANGI buyurtmalar yana 10% da hisoblanadi va baza aralash stavkaga qaytadi; buyruqlar founder'ga berildi, `systemctl restart` menda bloklanadi. Shuningdek `server/config.js` hali serverga ko'chirilmagan — amalda `.env` qiymati default'dan ustun turgani uchun bu kritik emas, lekin ikkalasi ham bajarilmaguncha ish tugallanmagan hisoblanadi

- [2026-08-08] **Admin panelning Statistika sahifasiga foydalanuvchilar bloki qo'shildi — va yorliq ATAYLAB "ilovani ochganlar" deb yozildi.** Sabab savoldan boshlandi: founder "botda qancha user borligini qanday bilaman" deb so'radi. Tekshirilganda ma'lum bo'ldiki, **`/start` bosgan odam bazaga UMUMAN yozilmaydi** — `users` qatori faqat uchta joyda tug'iladi: Mini App ochilganda (`server/routes/catalog.js`, imzolangan `initData`), saytga kirilganda (`server/routes/web-auth.js`) va sotuvchi arizasi to'ldirilganda (`server/routes/seller-application.js`). Telegram Bot API ham botning obunachilar sonini bermaydi. Ya'ni bu raqamni "bot obunachilari" deb yozish jimgina yolg'on bo'lardi va u eng yomon turdagi yolg'on — ishonch uyg'otadigani. **Backend** (`server/routes/admin.js`): `/api/admin/summary` ning `Promise.all` ro'yxatiga bitta `users` so'rovi qo'shildi — jami, rol bo'yicha (`buyer`/`seller`/`admin`, `count(*) FILTER` bilan), oxirgi 7 va 30 kunda qo'shilganlar, telefon raqami borlar; javobga `users` obyekti. Destrukturizatsiya ro'yxatiga qo'shilgani uchun indeks siljishi tekshirildi. **Frontend** (`admin/admin.js`, `admin/index.html`, kesh `admin.js?v=20` → `?v=21`): `renderUsers()` — rol taqsimoti mavjud `.cat-row` uslubida, 7/30 kun va telefon raqami esa `.status-dist` ustunlarida (jamiga nisbatan, ya'ni "oxirgi 30 kunda kelganlar ulushi" bitta qarashda ko'rinadi); ikkala panel ham `hidden` bilan boshlanadi va **backend eski bo'lsa (`users` maydoni yo'q) blok BUTUNLAY yashiriladi — nol ko'rsatilmaydi**, chunki "ma'lumot yo'q" bilan "hech kim yo'q" bir xil ko'rinmasligi kerak (`NULL` reyting qoidasining aynan o'zi). Panel ostiga ogohlantiruvchi izoh bloki qo'yildi — raqam nimani bildirmasligi ekranning O'ZIDA yozildi, hujjatda emas. **Sinov:** `node server/test.js` — hammasi PASS (Test 16 ham); `npx eslint .` — 0 xato; panel lokal stendda haqiqiy `handleAdminSummary` kodi orqali sinaldi (faqat `db.js` soxta) — ma'lumot yetib bordi, indeks siljimadi, eski backend holatida blok yashirindi, mobil (375px) joylashuv to'g'ri, 0 konsol xatosi. **Hali qilinmagan:** SQL so'rovining O'ZI haqiqiy Postgres'da ishlatilmadi (lokalda baza yo'q) — bu 2026-08-08 dagi `takeCredits` darsining aynan o'sha ochiq tomoni: taqlid qilingan `pool.query` SQL matnini tekshirmaydi, shuning uchun so'rov production'da BIRINCHI marta ishlaydi va deploy'dan keyin `/api/admin/summary` javobida `users` kaliti borligi QO'LDA tasdiqlansin. Shuningdek `/start` bosganni yozib borish hali yo'q, ya'ni haqiqiy bot auditoriyasi hamon hech qayerda hisoblanmaydi

- [2026-08-08] **`/start` bosgan odam endi bazaga yoziladi — va shu bilan birga panel raqami IKKIGA ajratildi (`db/020_user_engagement.sql`).** Bu yuqoridagi yozuvda ATAYLAB ochiq qoldirilgan bandning yopilishi: o'shanda panel "ilovani ochganlar" ni ko'rsatardi, haqiqiy bot auditoriyasi esa hech qayerda hisoblanmasdi. **Nega shunchaki qator qo'shish YETARLI EMAS edi:** `/start` qatorlarini mavjud `users` ga qo'shsak, panelda allaqachon turgan "ilovani ochganlar" raqami jimgina yolg'onga aylanardi — ichiga ilovani hech qachon ochmagan odamlar qo'shilib ketardi va buni HECH NARSA ko'rsatmasdi (raqam ko'paygani o'sish bo'lib ko'rinardi). Shuning uchun migratsiya bitta ustun qo'shadi: `users.engaged_at TIMESTAMPTZ` — `NULL` = faqat `/start` bosgan, `NOT NULL` = ilova / sayt / sotuvchi arizasi orqali BIRINCHI marta foydalangan vaqt; ustiga `users_engaged_at_idx` (panel har so'rovda `count(*) FILTER (WHERE engaged_at IS NULL)` hisoblaydi). **Backfill to'g'ri va uni ISBOTLASH mumkin:** migratsiyagacha `/start` hech qachon qator YARATMAGAN (`webhook.js` da `INSERT` umuman yo'q edi), ya'ni mavjud har bir qator albatta uchta foydalanish yo'lidan biri orqali kelgan — shuning uchun `UPDATE users SET engaged_at = created_at` taxmin emas, xulosadir. **Yozuv joyi** (`server/routes/webhook.js`): `/start` da `INSERT ... ON CONFLICT (tg_user_id) DO UPDATE`. Uch qaror shu yerda: (a) `DO NOTHING` emas, `DO UPDATE` — ism/username o'zgargan bo'lishi mumkin; (b) `role` TEGILMAYDI — aks holda sotuvchi `/start` bossa `buyer` ga tushib qolardi; (c) `engaged_at` na `INSERT` da, na `UPDATE` da qo'yiladi — bu qator "ilovani ochgan" degani EMAS. Telegram ID bu yerda ishonchli: uni klient emas, Telegram'ning O'ZI webhook orqali yuboradi va so'rov `WEBHOOK_SECRET` bilan tekshirilgan (CLAUDE.md — foydalanuvchi kimligi brauzerdan olinmaydi). Yozuv xatosi `/start` javobini yiqitmaydi (`.catch`), alert kaliti birinchi argumentda qat'iy — Test 10c qoidasi saqlandi. **Uchta foydalanish yo'li** (`catalog.js`, `web-auth.js`, `seller-application.js`) endi `engaged_at = COALESCE(users.engaged_at, now())` qo'yadi — `COALESCE` majburiy, aks holda maydon "birinchi foydalanish" o'rniga jimgina "oxirgi kirish" ga aylanardi va u boshqa ma'noli raqam bo'lardi. **Backend** (`server/routes/admin.js`): `users` so'roviga `engaged` va `start_only` sanoqlari, javobga `engaged` / `startOnly`. **Frontend** (`admin/admin.js`, `admin/index.html`, `admin.js?v=21` → `?v=22`): sarlavha "ilovani ochganlar" → "botga kirganlar", ostida ajratuvchi qator (`806 foydalangan (65%) · 437 faqat /start` ko'rinishida), faollik ustunlariga ikkita yangi qator. **Qorovul kengaytirildi va bu bekorga emas:** ilgari `users` maydonining O'ZI tekshirilardi, endi `engaged` ham — deploy oynasida frontend yangi, backend bir qadam orqada bo'lsa `engaged` `undefined` bo'lib ekranda "NaN%" chiqardi, ya'ni eski qorovulning ko'r nuqtasi aynan shu o'zgarish bilan ochildi. **Sinov:** `node server/test.js` — 42 test PASS (raqam sanaldi, taxmin emas); `npx eslint .` (`server/`) — 0 xato, 28 ogohlantirish; stendda haqiqiy `handleAdminSummary` orqali sinaldi — ajratuvchi qator va 5 qatorli faollik ustunlari chizildi, mobil 375px da gorizontal siljish yo'q, ikkala qorovul holati (backend butunlay eski / bir qadam orqada) blokni yashirdi. **Hali qilinmagan (deploy tartibi MUHIM):** `db/020` haqiqiy Postgres'da HALI ishlamagan (lokalda baza yo'q) va u backenddan OLDIN qo'llanishi SHART — teskari tartibda `engaged_at` ga murojaat qiladigan `/api/admin/summary` va uchala auth yo'li birdan yiqiladi, ya'ni bu 27-iyuldagi "migratsiya qo'llanmagan" insidentining aynan takroriga olib kelardi. Shuningdek `engaged_at = COALESCE(...)` qoidasini tekshiradigan TEST YO'Q: yangi foydalanish yo'li qo'shilib uni unutsa, odam abadiy "faqat /start bosgan" bo'lib qolardi va buni hech narsa ko'rsatmasdi — "yozilgan qoida himoya emas, uni tekshiradigan test himoya" qoidasi bu bandda hali bajarilmagan

## Qarorlar

- [2026-08-23] Qaror (founder): **«Premium» tushunchasi YO'Q — faqat AI
  kredit.** Referens paneldagi «Premium berish» tugmasi ko'chirilmadi;
  o'rniga `credit_grant` (Telegram tasdig'i bilan, balans QO'SHILADI).
- [2026-08-23] Qaror: **`traffic_events` ANONIMLIGI O'ZGARMADI** (Test 42).
  «Kim nima qildi» uchun ALOHIDA `user_events` jadvali ochildi — unga faqat
  KIRGAN foydalanuvchining O'ZI bajargan amal tushadi; «mato ko'rildi»
  lentada YO'Q, chunki ko'rish anonim beacon orqali keladi. Ikki jadval
  ikki xil va'da beradi va bitta jadvalga QO'SHILMAYDI.
- [2026-08-23] Qaror: **«Oxirgi kirish» eski foydalanuvchilarda `NULL` → «—».**
  `created_at` bilan to'ldirish jimgina yolg'on bo'lardi — o'lchov
  2026-08-23 dan (`NULL` reyting va `src IS NULL` qoidalari bilan bitta oila).
- [2026-08-23] Qaror: **«AI / 7 kun» — `user_events` dagi SO'ROVLAR soni**,
  `ai_credits.spent` emas: u sanasiz va cheksiz ro'yxatdagilarda ham
  o'sadi, ya'ni «7 kun» savoliga javob bera olmaydi. Keshdan kelgan so'rov
  ham sanaladi — u foydalanuvchining amali.
- [2026-08-23] Qaror: `user_events.kind` uchun bazada RO'YXAT yo'q, faqat
  shakl (`^[a-z_]+$`); ro'yxat bitta joyda — `lib/user-events.js` →
  `KINDS`. Sabab `to_status` / `admin_actions_kind_check` darsi (db/014):
  ikkinchi ro'yxat himoya emas, tuzoq. `users` ga FK ham ataylab yo'q —
  hodisa o'tmishdagi fakt, foydalanuvchi qatori o'chsa ham qolsin.
- [2026-08-19] Qaror (founder): **admin panel tashriflari trafik
  hisobiga KIRMAYDI.** O'lchandi — 29 kunda 1700 ko'rishning 310 tasi
  `/admin/` va `/loyiha-panel.html` edi (18%), ya'ni panel o'z
  tashriflarimizni «foydalanuvchi» deb ko'rsatib turardi. Filtr
  **GraphQL TOMONIDA** (`requestPath_notlike`), serverda EMAS: serverda
  kesilsa kunlik yig'indi baribir admin tashriflarini o'z ichiga olardi.
  Ro'yxat bitta joyda — `lib/cf-analytics.js` → `ICHKI_YOLLAR`; yangi
  ichki sahifa qo'shilsa shu yerga yoziladi. O'lchandi: 1700 → 1390

- [2026-08-19] Qaror: **`CF_SITE_TAG` sahifadagi beacon tokeni EMAS va
  bu farq hujjatga YOZILDI.** Beacon `data-cf-beacon` da `6acaeab5…`,
  GraphQL esa `0d0ad786…` kutadi. 🔴 Noto'g'ri qiymatda javob XATOSIZ va
  BO'SH keladi — ya'ni nosozlik «hech kim kelmadi» niqobida keladi va uni
  na test, na jurnal ko'rsatadi. Qiymat GraphQL javobining O'ZIDAN
  o'lchab olinadi. `config.js` shaklni tekshiradi (32 hex, `cfZone`
  qayta ishlatildi — ikkinchi nusxa yozilmadi)

- [2026-08-19] Qaror: **Cloudflare ALOHIDA endpoint va ALOHIDA blok.**
  `/api/admin/cf-traffic` `/api/admin/traffic` ga qo'shilmadi: bitta
  javobga yig'ilsa Cloudflare yiqilgan kuni butun Trafik sahifasi
  qulardi. Panelda ham blok `trafficBody` DAN TASHQARIDA — bizning
  o'lchov bo'sh bo'lsa ham Cloudflare chiziladi. Raqamlar YONMA-YON
  qo'yilmaydi (2026-08-18 qarorining davomi): biri namunaviy, biri
  aniq — mos kelmagan ikki raqam «biri buzuq» degan yolg'on xulosa
  beradi. Sayt va Mini App bitta belgi ostida yuradi, ular faqat
  sahifa yo'li bo'yicha ajraladi (`/mini-app/`)

- [2026-08-19] Qaror: **raqamlar TAXMINIY ekani panelda YOZILADI.**
  O'lchandi: qiymatlarning hammasi 10 ga bo'linadi — Cloudflare bepul
  tarifda namuna olib koeffitsiyentga ko'paytiradi. «1700» aniq son
  emas. Ogohlantirish olib tashlanmasin: xarita `mapApprox` bandi bilan
  bitta oila — aniq ko'rinadigan taxmin noto'g'ri ishonch beradi.
  Sozlanmagan/xato/bo'sh — uchalasi BOSHQACHA yoziladi, hech qaysisi
  nol ko'rsatmaydi

- [2026-08-18] Qaror: **o'z trafik jadvalimiz Cloudflare Web Analytics ning
  O'RNINI BOSMAYDI — u ATAYLAB ikkinchi yo'l.** Ortiqchalik CLAUDE.md
  qoidasi bo'yicha oldin SANALDI va farq aniq bo'lgani uchun yo'l ochildi:
  Cloudflare mahsulot darajasini bera OLMAYDI (`products.id` unga noma'lum)
  va ko'rish→savat konversiyasini hisoblay olmaydi, chunki bizning
  jadvallarimiz bilan bir bazada emas. 🔴 **Panelda ikkalasi YONMA-YON
  QO'YILMAYDI:** Cloudflare raqami namunaviy (7 kundan keyin ~10%),
  bizniki har hodisaning o'zi — mos kelmagan ikki raqam «biri buzuq»
  degan yolg'on nosozlik tug'dirardi

- [2026-08-18] Qaror: **xom IP hech qachon saqlanmaydi** — `visitor` =
  `sha256(ip|user-agent|sir|KUN)` ning 16 belgisi. **Kun HASH ICHIDA
  turadi**, ya'ni odam kunlar bo'ylab kuzatilmaydi. Bu qulaylik emas,
  maxfiylik qarori: baza zaxirasi Telegram chatiga ketadi
  (`BACKUP_CHAT_ID` bandi — o'sha chatdagi har kim butun bazani yuklab
  oladi), ya'ni xom IP bo'lsa u TARQARDI. Sir serverda yashaydi, aks holda
  O'zbekiston IP fazosi kichik bo'lgani uchun hammasini birma-bir hash
  qilib solishtirish arzon ish bo'lardi

- [2026-08-18] Qaror: **«ko'rishlar» ANIQ, «tashrifchi» TAXMINIY — va buni
  PANELNING O'ZI aytadi**, hujjat emas. Bitta odam wifi'dan 4G'ga o'tsa ikki
  marta sanaladi, bitta ofisdagi bir necha kishi ko'pincha ajraladi (har xil
  user-agent). ⚠️ **Kunlik tashrifchilarni QO'SHIB BO'LMAYDI** (belgi
  kunlik) — panel o'rtachani ko'rsatadi; yig'indi «30 kunda 900 kishi keldi»
  degan yolg'onni tug'dirardi. Bu 2026-08-08 dagi «yorliq raqamdan
  muhimroq» qarori bilan bitta oilada

- [2026-08-18] Qaror: **ma'lumot bo'lmasa panel NOL emas, SABAB ko'rsatadi.**
  Sabab shu sahifaning O'Z tarixi: 2026-07-27 da bu yerdan aynan o'ylab
  topilgan tashrif raqamlari olib tashlangan edi — nol ham xuddi shunday
  yolg'on, chunki «o'lchanmadi» ≠ «hech kim kelmadi» (`NULL` reyting va
  `ALERT_CHAT_ID` oilasi)

- [2026-08-18] Qaror: trafik hodisasi endpointi **kimlikni UMUMAN
  so'ramaydi** — `authUser()` ham, `requestUser()` ham chaqirilmaydi va
  klient `credentials: 'omit'` bilan yuboradi. Sabab ikkitalik: kimlik
  so'ralsa kirmagan mehmon (trafikning katta qismi) o'lchanmasdi, ustiga
  bazada «kim qaysi sahifani ochdi» degan yozuv paydo bo'lardi. CLAUDE.md
  dagi `requestUser()` qoidasi «kimlik olinsa BITTA nuqtadan olinsin»
  deydi — bu yerda kimlik umuman olinmaydi, ya'ni qoidaga zid emas

- [2026-08-18] Qaror: `GET /api/admin/traffic` **`/api/admin/summary` dan
  ALOHIDA endpoint.** Sabab: `summary` panel har ochilganda va har amaldan
  keyin qayta yuklanadi, trafik esa vaqt oralig'i bilan so'raladi va
  og'irroq — bittaga qo'shilsa panelning eng issiq so'rovi sekinlashardi

- [2026-08-14] Qaror (founder): **manba belgisining shakli QAT'IY qoladi —
  kengaytirilmaydi, LEKIN rad etish endi QICHQIRADI.** Telegram katta harf
  va chiziqchaga ruxsat bergani uchun ikki yo'l bor edi: (a) shaklni
  kengaytirish, (b) rad etishni ko'rinadigan qilish. (a) rad etildi — `IG`
  va `ig` panelda IKKI qatorga bo'linib, bitta kanal ikkita bo'lib
  ko'rinardi, ya'ni o'lchovni boshqa tomondan buzardi. Tanlangan (b):
  noto'g'ri havola bir kunda tuzatiladi, chunki alert o'sha kuni keladi —
  «kanal nol berdi» degan oy oxiridagi yolg'on hisobot orqali emas.
  ⚠️ Shu qarordan kelib chiqadigan MAJBURIYAT: yangi kanal ochilganda havola
  `docs/manba-havolalari.md` jadvaliga **yozilsin**, aks holda paneldagi
  `guruh_ipak` qatori olti oydan keyin nimani anglatishi noma'lum qoladi.

- [2026-08-13] Qaror: manba belgisi (`users.src`) **BIRINCHI teginishda
  qulflanadi** — `COALESCE(users.src, EXCLUDED.src)`, keyin HECH QACHON
  o'zgarmaydi. Sabab: odamni platformaga OLIB KELGAN kanal — birinchisi.
  ⚠️ **Tartib teskari bo'lsa raqam o'zini o'zi tasdiqlaydigan yolg'onga
  aylanardi:** oxirgi manba yozilganda, eng ko'p ESLATMA yuborgan kanal eng
  samarali ko'rinib qolardi va reklama byudjeti aynan shu yolg'onga qarab
  taqsimlanardi. Qorovul — Test 25 (shakl, `COALESCE` tartibi, migratsiya
  mavjudligi) va migratsiyaning O'ZIDAGI `RAISE EXCEPTION` bloki
- [2026-08-13] Qaror: manba payload i **RO'YXAT bilan emas, SHAKL bilan**
  tekshiriladi (`/^[a-z0-9_]{2,32}$/`, `web_` band). Sabab: kanallar
  ro'yxatini kodga ko'chirish `admin_actions_kind_check` tuzog'ining aynan
  o'zi bo'lardi — yangi kanal ochilganda deploy talab qilinardi va marketing
  muhandisga bog'lanib qolardi. Payload IXTIYORIY matn bo'lishi mumkin
  (havolani har kim yasay oladi), shuning uchun shakl tekshiruvi MAJBURIY
- [2026-08-13] Qaror: panelda `src IS NULL` **kanal sifatida ko'rsatilmaydi**
  — u alohida "o'lchanmagan" maydonida turadi. Sabab: aralashtirilsa eng
  katta "kanal" bilmaslik bo'lib chiqardi. Bu 2026-08-08 dagi "obunachilar
  emas, ilovani ochganlar" qarori bilan bitta oilada — **yorliq raqamdan
  muhimroq**
- [2026-08-08] Qaror: `users` qatori endi **`/start` da ham tug'iladi**, ikki tushuncha esa bitta jadvalda `engaged_at` ustuni bilan ajratiladi — alohida `bot_users` jadvali QILINMADI. Sabab: ikkinchi jadval bo'lsa ayni odam ikki joyda yashardi va ular jimgina bir-biridan uzoqlashardi (`db/014` darsi — ikkinchi ro'yxat himoya emas, kelajakdagi tuzoq). `NULL` = faqat `/start`, `NOT NULL` = birinchi haqiqiy foydalanish vaqti; bu `NULL` reyting qoidasining aynan o'zi — "baholanmagan" ≠ "yomon baholangan", "faqat kirgan" ≠ "foydalanmagan"
- [2026-08-08] Qaror: `/start` da `role` TEGILMAYDI va `engaged_at` QO'YILMAYDI. Sabab: `DO UPDATE SET role='buyer'` sotuvchini `/start` bosgan kuni xaridorga aylantirardi; `engaged_at` ni o'sha yerda qo'yish esa butun ajratishni ma'nosiz qilardi — hamma qator "foydalangan" bo'lib chiqardi
- [2026-08-08] Qaror: panel yorlig'i **"Foydalanuvchilar — botga kirganlar"** — bu 4 soat oldingi "ilovani ochganlar" qarorining O'RNINI BOSADI (eski qaror pastda ataylab o'chirilmadi: u o'sha paytdagi haqiqiy holat edi). Yorliq o'zgardi, chunki MANBA o'zgardi — endi `/start` bosgan odam ham qatorda bor. Ekrandagi izoh esa yangi cheklovni AYTADI: `/start` hisobi 2026-08-08 dan boshlanadi, undan oldin bosgan va ilovani ochmaganlar bu yerda YO'Q. Ya'ni raqam hamon to'liq emas, lekin endi nimasi to'liq emasligi ekranning O'ZIDA yozilgan
- [2026-08-08] Qaror: foydalanuvchilar bloki yorlig'i **"Foydalanuvchilar — ilovani ochganlar"**, "bot obunachilari" EMAS. ⚠️ **ESKIRGAN — o'sha kuni yuqoridagi qaror bilan almashtirildi** (`/start` yozila boshlagach yorliq "botga kirganlar" bo'ldi). Sabab: `users` qatori `/start` da emas, faqat Mini App / sayt / sotuvchi arizasi orqali tug'iladi, ya'ni haqiqiy bot auditoriyasi bundan kattaroq va bizda umuman hisoblanmaydi. Yorliqni "obunachilar" deb yozish raqamni tekshirib bo'lmaydigan yolg'onga aylantirardi. Yonida ekranning o'zida ogohlantirish turadi — hujjatga emas, PANELGA yozildi, chunki raqamni ko'radigan odam hujjatni o'qimaydi. Bu `NULL` reyting, `ALERT_CHAT_ID` va "hujjatdagi raqam — tekshirilmagan da'vo" qoidalari bilan bitta oilada: **jimgina yolg'on yo'qlikdan yomonroq**
- [2026-08-08] Qaror: `/summary` javobida `users` maydoni bo'lmasa (eski backend) blok butunlay yashiriladi, nol ko'rsatilmaydi. Sabab: `0 ta` degan raqam "hech kim yo'q" degan MA'LUMOT bo'lib ko'rinadi, aslida esa "backend yangilanmagan" degani — deploy oynasida panel jimgina yolg'on gapirardi
- [2026-08-02] Qaror (founder): platforma komissiyasi **12%** — ilgari 10% edi. Bu 2026-07-27 dagi "default 10%" qarorining stavka qismini almashtiradi (bitta yagona stavka tamoyili o'z kuchida qoladi)
- [2026-08-02] Qaror (founder): stavka o'zgarganda **mavjud buyurtmalar ham qayta hisoblanadi** — bazada bitta yagona stavka bo'lsin. Bu 2026-07-27 dagi "`orders.commission_rate` snapshot, stavka keyin o'zgarsa eski buyurtmalar hisoboti buzilmaydi" qoidasidan ongli chekinish: o'tgan davr hisoboti retroaktiv o'zgaradi. Sabab — founder aralash stavkali bazani (bir qism 10%, bir qism 12%) hisobot uchun chalg'ituvchi deb topdi. Snapshot mexanizmi saqlanadi, ya'ni stavka o'z-o'zidan o'zgarmaydi; retroaktiv o'zgartirish faqat alohida migratsiya bilan, zaxira jadval va tekshiruv bloki bilan qilinadi
- [2026-08-02] Qaror (founder): pul o'tkazilgan buyurtmalar (`paid_out_at IS NOT NULL`) ham yangi stavkaga o'tkaziladi, garchi bu bazani haqiqiy bank o'tkazmasi bilan ziddiyatga solsa ham (sotuvchiga 90% o'tgan, bazada 88% deb turadi). Ogohlantirish aytilgandan keyin ataylab tanlandi: bazada bitta yagona stavka bo'lishi buxgalteriya aniqligidan ustun qo'yildi, farq qo'lda hisobga olinadi. Migratsiya bunday qatorlarni `NOTICE` bilan ro'yxatlab beradi
- [2026-07-27] Qaror: admin panelning YOZUV amallari ikki bosqichli — panel faqat so'rov yaratadi, amal Telegram'dagi tugma bosilgandan keyin bajariladi (founder tanlovi: "panelda tugma, tasdiq botda"). Sabab: panel tokeni brauzer `sessionStorage`da yashaydi va o'g'irlanishi mumkin; pul o'tkazish va refund qaytarib bo'lmaydigan amallar, ular uchun bitta token yetarli emas. Tugmani bosgan shaxs `ADMIN_TG_IDS` ro'yxatida bo'lishi ham tekshiriladi. Bu 2026-07-25dagi "panel faqat o'qish uchun" qarorini almashtiradi
- [2026-07-27] Qaror: komissiya butun platformaga BITTA stavka — `COMMISSION_RATE` env (default 10%), sotuvchi bo'yicha alohida stavka emas. Buyurtma yaratilganda o'sha paytdagi qiymat `orders.commission_rate` ga snapshot qilinadi, shuning uchun stavka keyin o'zgarsa eski buyurtmalar hisoboti buzilmaydi. Komissiya foizi xaridor va sotuvchi UI'sida ko'rsatilmaydi (Sprint 0 qaroriga mos) — faqat admin panel va admin chatida. **⚠️ QISMAN ESKIRGAN (2026-08-02):** stavka endi 12%, va "eski buyurtmalar hisoboti buzilmaydi" qismi ham amal qilmaydi — o'sha kuni mavjud buyurtmalar ataylab qayta hisoblandi. Yuqoridagi 2026-08-02 qarorlariga qarang. "Bitta yagona stavka" va "foiz UI'da ko'rsatilmaydi" qismlari o'z kuchida
- [2026-07-27] Qaror: bahs dalili (rasm/video) Telegram bot orqali yig'iladi — bizda faqat `file_id` saqlanadi, fayl Telegram serverida qoladi. Sabab: loyihada fayl yuklash mexanizmi umuman yo'q edi; bu yo'l disk boshqaruvi, hajm/tur validatsiyasi va zaxira nusxa muammosini butunlay chetlab o'tadi. Panelda rasm ko'rsatish uchun server proksi qiladi va havola `file_id` dan HMAC bilan imzolanadi — bot tokeni hech qachon brauzerga chiqmaydi
- [2026-07-27] Qaror: bahs ochilganda buyurtma holati O'ZGARMAYDI — buyurtma o'z logistika holatida qoladi (`shipped` / `delivered`), bahs esa alohida kuzatiladi. Sabab: holatni `disputed` ga o'tkazish avvalgi haqiqiy holatni yo'qotardi. Ochiq bahsli buyurtma panelda ⚖️ belgisi bilan ajratiladi va "Pul o'tkazish" tugmasi unda ko'rinmaydi
- [2026-07-27] Qaror: refund hozircha faqat buxgalteriya yozuvi — Payme/Click ulanmagani uchun pul o'tkazmasi qo'lda bajariladi, tizim faqat faktni qayd etadi va xaridorga xabar beradi. Bu Telegram tasdiq xabarida ham ochiq yozilgan
- [2026-07-27] Qaror: Statistika sahifasidan sayt tashriflari, xaridorlar dinamikasi va konversiya ko'rsatkichlari olib tashlanadi — loyihada veb-analitika ulanmagan, o'sha raqamlar to'liq o'ylab topilgan edi. Panel faqat bazadan keladigan raqamni ko'rsatadi. **⚠️ QISMAN ESKIRGAN (2026-08-18):** «veb-analitika ulanmagan» qismi endi NOTO'G'RI — Cloudflare Web Analytics 2026-08-02 dan beri ikkala yuzda ishlab turibdi va tekshirilganda topildi, ya'ni panelning O'ZIDA eskirgan da'vo yozilib turgan edi. Tashrif/konversiya raqamlari **QAYTDI, lekin boshqa asosda**: endi ular o'ylab topilmaydi, `traffic_events` jadvalidan keladi va ma'lumot bo'lmasa nol emas, SABAB ko'rsatiladi. «Panel faqat bazadan keladigan raqamni ko'rsatadi» qismi o'z kuchida — u aslida buzilmadi, chunki yangi raqam ham bazadan keladi

- [2026-07-26] Qaror: sidebar foni OQ bo'ladi, faol nav band esa to'ldirilgan anor gradient + oq matn bilan ajratiladi (founder: "rangini oq qilaylik backgroundni, panellar bosilganda esa asosiy rang bilan chiqsin"). Shu bilan oldingi to'q anor sidebar (`#85180f`→`#3d0a04`) va logotip fonidan olingan mat `#510100` variantlari bekor qilindi
- [2026-07-26] Qaror: admin panelning butun kontent foni to'liq oq (`#FFFFFF`) — krem fon olib tashlandi. Natijada karta chegarasi uchun oq `--glass-edge` ishlamay qoldi; barcha kartalarda yumshoq issiq hairline `rgba(133,24,15,.11)` ishlatiladi
- [2026-07-26] Qaror: dashboard ma'lumotlari jadval emas, vizual kartochkalarda ko'rsatiladi (founder) — reja bajarilishi doira (donut) ko'rsatkichi, oxirgi 7 kun ustunlari, buyurtma holatlari taqsimoti, so'nggi buyurtmalar kartochkalari
- [2026-07-26] Qaror: hero paneldagi 4 ta xulosa raqami (O'rtacha kunlik / Aylanma—reja / Bajarilish / Bugun) olib tashlanadi (founder: "umuman kerak emas") — reja va bajarilish ma'lumoti "Reja bajarilishi" doira kartochkasiga, bugungi GMV esa 7 kunlik ustunlarga ko'chdi
- [2026-07-26] Qaror: "Bizning daromad" (yashirin komissiya) kartasi butunlay olib tashlanadi (founder: "shun ham kerak emas") — 2026-07-26dagi "daromad blur ostida turadi" qarori bekor qilinadi; komissiya daromadi endi oddiy stat kartada ko'rinadi
- [2026-07-26] Qaror: dashboard grafigida REJA chizig'i ko'rsatilmaydi (founder: "plan chizig'ini olib tashla") — grafikda faqat fakt silliq chiziq + gradient to'ldirish qoladi, ustun (bar) ham ishlatilmaydi (founder: "ustun kerak emas, eski silliq chiziqqa o'xshasin"). Reja ma'lumoti yo'qolmaydi, matn sifatida beriladi: xulosa qatoridagi "Aylanma — reja" va "Bajarilish %", hamda hover tooltip. Shu bilan birga rejadan past kunlarni saffron rangda ajratuvchi ogohlantirish ham olib tashlandi
- [2026-07-26] Qaror: stat kartalar hamma sahifada bir xil ko'rinishda bo'ladi — rangli aksent chizig'i yo'q (founder: "ko'zni itarayabdi"), to'q bordo gradientli "accent" karta ham yo'q (founder: "qolgan 3 tasiga o'xshat"). Rang faqat juda yumshoq fon tusi (`tone-pom` / `tone-teal` / `tone-saffron`) orqali, shisha qatlam ustiga qo'yiladi
- [2026-07-26] Qaror: pul summalari ikki xil formatda — hero panel xulosa qatorida BALANS uslubida to'liq raqamlar, mono shriftda ("1 342 086 001 so'm", founder talabi); stat kartalarda joy tor bo'lgani uchun ixcham format ("1,34 mlrd so'm")
- [2026-07-26] Qaror: komissiya daromadi ("Bizning daromad") dashboard'da ochiq turmaydi — yopiq holatda blur ostida va raqamlari doim tasodifiy aylanib turadi, faqat bosilganda ochiladi. Sabab: ekran boshqalarga ko'rinib qolganda platformaning daromadi tasodifan oshkor bo'lmasin
- [2026-07-26] Qaror: kunlik reja qiymati oylik rejani o'sha oydagi kunlar soniga tekis bo'lish orqali hisoblanadi (founder qarori) — hafta kunlari bo'yicha og'irlik berilmaydi. 30 kunlik oyna ikki kalendar oyni qamragani uchun kunlik reja oy chegarasida keskin sakraydi (masalan Iyun 80 → Iyul 53 birlik/kun), shuning uchun fakt seriyasi ataylab kunlik rejaga qattiq bog'lanmagan — aks holda fakt chizig'i oy chegarasida "jar" bo'lib tushardi. Tooltip, bajarilish % va jami reja hamma joyda aniq kunlik reja qiymatidan hisoblanadi
- [2026-07-26] Qaror: dashboard grafigidagi fakt raqamlari hozircha havodan olingan mock (founder: "Plan faktni hozircha raqamlarini havodan olib tur") — maqsad vizual va mantiqni tasdiqlash; backend kunlik GMV agregatsiyasini bergach almashtiriladi
- [2026-07-26] Qaror: dashboard 7 kunlik oyna o'rniga 30 kunlik oynaga o'tdi — oylik reja bilan solishtirish uchun mazmunli oraliq
- [2026-07-25] Qaror: admin panel `/api/admin/summary` endpointi faqat O'QISH uchun — tasdiqlash/rad etish kabi yozuvchi harakatlar hamon Telegram bot buyruqlari orqali (`/sotuvchi_tasdiqla`, `/nashr` va h.k.) amalga oshiriladi. Sabab: standalone veb-sahifa Telegram `initData` avtorizatsiyasini ishlab chiqara olmaydi, shuning uchun yozuvchi amallarni web panelga o'tkazish xavfsizlik teshigi ochardi; o'qish uchun esa alohida `ADMIN_PANEL_TOKEN` siri yetarli. Bu mavjud "tasdiqlash bot orqali" qaroriga (Sprint 0, 2026-07-25) mos keladi va uni davom ettiradi
