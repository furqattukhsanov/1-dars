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
  ishlar"ga qarang. ⚠️ ~~Mini App'dagi **"Saralash" tugmasi hamon o'lik** — u bu bandga
  kirmaydi, alohida ish sifatida ochiq qoladi~~ — **2026-08-17 da SARALASH IKKALA
  YUZDA qo'shildi** (bottom-sheet: Tavsiya etilgan / Eng yangi / arzon→qimmat /
  qimmat→arzon + narx oralig'i bitta varaqda). ⚠️ «Eng yangi» hozircha «Yangi»
  belgisi bo'yicha — `/api/products` `created_at` qaytarmaydi (ochiq band)
- [x] Mahsulot kartochkasi: rasm, kategoriya, narx/rulon, rulon soni, ishlab chiqaruvchi
  reytingi — hammasi bor (zaxira soni 2026-07-30 da qo'shilgan `stockView(p)` bilan).
  Reyting 2026-07-31 da HAQIQIYga aylantirildi — soxta seed sonlari o'chirildi,
  reyting endi faqat sharhlardan hisoblanadi (pastdagi yozuvga qarang)
- [x] Mahsulot detail sahifasi: to'liq ma'lumot + "Buyurtma berish" tugmasi
  — **Mini App'da bor** (`openProduct(id)` → `S.screen='detail'`), **saytda esa
  2026-08-16 da DRAWER'DAN TO'LIQ SAHIFAGA o'tdi** (`#pdp`, `/mahsulot/<id>`).
  ⚠️ **Bu banddagi eski yozuv 2026-08-16 gacha shunday turardi:** «Alohida sahifa
  ATAYLAB qurilmadi — marshrutlash, yangi HTML fayl va CI `source` ro'yxati
  tuzog'i kerak bo'lmasin». Qaror founder referensi bilan qayta ko'rildi va
  **sabablarning faqat BITTASI haqiqiy chiqdi:** yangi HTML fayl haqiqatan ham
  CI tuzog'i bo'lardi — shuning uchun sahifa `index.html` ICHIDA qoldi va
  `deploy.yml` ga tegilmadi. Marshrutlash esa tuzoq emas ekan: nginx
  `/mahsulot/<id>` ga allaqachon `index.html` beradi (o'lchandi). Ya'ni eski
  qaror uchta sababdan ikkitasi tekshirilmagan holda saqlanib turgan edi

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

- [2026-08-25] **SAYQAL TO'PLAMIDAN BITTA BAND QAYTARILDI — `.nav-lens`
  480ms sakrashga qaytdi (founder telefonda sinab rad etdi).** Quyidagi
  to'plamning 9-bandi (`.nav-lens` 480ms → 280ms «tez va aniq») founder
  sinovida YOQMADI — sakrash (spring, `cubic-bezier(.34,1.56,.64,1)`)
  brendga xos his ekan. `telegram-app/styles.css` da o'tish eski holatga
  qaytarildi va ustiga ATAYLAB ekanligi izohda yozildi (keyin yana
  «optimallashtirib» yuborilmasin). QOLGAN 9 sayqal (varaq drawer bilan
  chiqib pastga kuzatilib yopilishi, toast, badge, yurak, karta bosilishi,
  bo'sh holat, `.nav-profile-btn`) JOYIDA qoladi — rad faqat linzaga.
  Kesh: `styles.css` 37→**38** (`index.html` da), Test 16 jadvali birga.
  **Hisobotchi mustaqil o'lchadi:** 91 test yashil (sanab tasdiqlandi);
  Test 16 qorovuli mutatsiya bilan sinaldi — jadvalga eski hash qaytarilsa
  test QIZIL (`?v=38` vs `v=37` xabari bilan), keyin tiklandi.
  Bu NORMAL jarayon darsi: tavsiya qoidasi (Emil: tez-tez ko'rinadigan
  harakat qisqartirilsin) founder didi bilan to'qnashganda **did yutadi** —
  sinovda bir bandning rad etilishi to'plamning muvaffaqiyatsizligi emas,
  sinovning ishlagani.

- [2026-08-25] **MINI APP'GA DIZAYN-SAYQAL (ANIMATSIYA) TO'PLAMI — lokalda
  tekshirildi, PRODUCTION'GA HALI CHIQMAGAN** (deploy founder telefonda
  ko'rgandan keyin). Emil Kowalski dizayn-injiniring yondashuvi
  (`emil-design-eng`, `find-animation-opportunities` skill'lari) bilan
  10 ta sayqal, founder «hammasini qil» degan.

  **Nima qo'shildi** (`telegram-app/styles.css` v37, `app.js` v104):
  (1) uchala pastki varaq (narx/saralash, BTS, bog'lanish) endi iOS drawer
  egri chizig'i bilan chiqadi — `--ease-drawer: cubic-bezier(.32,.72,0,1)`,
  360ms; (2) varaq YOPILISHI ham kuzatiladi — `sheetYopib()` yordamchisi
  varaqni pastga qaytarib (200ms, kirishdan ATAYLAB tezroq) keyin holatni
  o'zgartiradi, beshta yopish nuqtasi shundan o'tadi; (3) toast endi bir
  kadrda g'oyib bo'lmaydi — ikki bosqichli chiqish (`.toast-exit`, 150ms);
  (4) savat belgisi son OSHGANDAGINA pop — `_oldingiSavatSoni` qorovuli
  bilan, ilova ochilishida va kamayishda jim; (5) yurak faqat YOQILGANDA
  pop (o'chirish — bekor qilish, jim); (6) mahsulot kartasi bosilganda
  `scale(.98)` javob; (7) `.icon-btn` bosilganda `scale(.94)`; (8) bo'sh
  holat (masalan bo'sh savat) bolalari 50ms zinama-zina kiradi; (9)
  `.nav-lens` va `.nav-profile-btn` 480ms sakrashdan 280ms `--ease-out` ga,
  `transition: all` aniq xossalarga almashdi; (10) hamma yangi harakatga
  `prefers-reduced-motion` bloklari.

  **Testlar:** Test 16 jadvalida ikkala faylning yangi `sha256` va `?v=`
  (37/104) yangilandi. Sevimlilar qorovuli `toggleLike` ni sandbox'da
  BAJARADI — yangi yurak-pop kodi `document` ga tegadi, sandbox'ga bo'sh
  `document` stubi qo'shildi (app kodiga tegilmadi). `sw.js` PRECACHE'da
  `app.js`/`styles.css` YO'Q — `CACHE_VERSION` ga tegilmadi (tekshirildi).
  Yakun: **91 test yashil, 0 xato.**

- [2026-08-19] **«ENG YANGI» ENDI HAQIQIY SANAGA TAYANADI — TUGMA O'Z NOMINI
  BAJARADI. 2026-08-17 da ochiq qoldirilgan band YOPILDI.**

  **1. Nima buzuq edi.** «Eng yangi» saralashi «Yangi» YORLIG'I bo'yicha
  ishlardi (`p.badge.uz === 'Yangi'`), yorliq esa QO'LDA qo'yiladi va sanaga
  UMUMAN bog'liq emas — ya'ni tugma o'z nomini bajarmasdi. 17-avgustda bu
  HALOL CHEKLOV sifatida yozilgan edi: sana o'ylab topilmadi, chunki
  `/api/products` `created_at` qaytarmasdi («o'ylab topilgan raqam»
  qoidasi).

  **2. Ma'lumot ALLAQACHON bor edi — faqat uzatilmasdi.**
  `products.created_at` `db/001` da (64-qator, `TIMESTAMPTZ NOT NULL DEFAULT
  now()`) — ya'ni **yangi migratsiya KERAK EMAS**, ustun yillar davomida
  to'lib turgan. O'zgargan uch joy: `SELECT` ga `p.created_at`,
  `productRowToVM` ga `createdAt` (millisekundda), ikkala yuzda `new`
  tarmog'i sana bo'yicha.

  **3. ⚠️ ZAXIRA ATAYLAB QOLDIRILDI — DEPLOY TARTIBI SHUNI TALAB QILADI.**
  Statik fayllar CI bilan AVTOMATIK chiqadi, backend esa QO'LDA ko'tariladi
  — ya'ni oraliqda yangi sayt ESKI serverdan javob oladi va `createdAt`
  umuman kelmaydi. O'shanda saralash buzilmaydi, eski (yorliq) usuliga
  qaytadi. Yorliq (`badge`) O'ZI ham QOLADI — u boshqa ish qiladi (ko'zga
  tashlanadigan belgi), saralash esa endi sanaga qaraydi.
  ⚠️ **Qaror BUTUN RO'YXAT bo'yicha qabul qilinadi (`some`), juftlik
  bo'yicha EMAS** — aks holda taqqoslash TRANZITIVLIGI buzilib, tartib
  tasodifiy bo'lardi (bir juftlikda sana, boshqasida yorliq bilan
  solishtirish `sort` ni aniqlanmagan holatga olib boradi).
  Sanasi yo'q kartochka OXIRIDA — u «eng yangi» ham, «eng eski» ham emas
  (narxi noma'lum kartochka qoidasi bilan bitta oila).

  **4. Test 47 — MATN emas, XATTI-HARAKAT sinovi.** `sortProducts` manbadan
  ajratib olinib HAQIQIY ro'yxatda yurgiziladi: sana bor / sana yo'q /
  aralash — uch holat. Satr qidiradigan test bunday nuqsonni tutmasdi:
  «sana bo'yicha saralayapman» degan kod ham, teskari tartibda saralaydigan
  kod ham AYNI satrlarni o'z ichiga oladi. Ish jarayonida 7 mutatsiya, 7 tasi
  ushlangan.

  **5. 🔴 TOPILGAN ESKI NUQSON — KOD YOLG'ON GAPIRARDI (`.search-x`).**
  Test 45 yozilayotganda ushlandi: `index.html` da `hidden` atributi,
  `script.js` da `x.hidden = !v` turardi, lekin `.search-x { display: flex }`
  (`style.css:1348`) ikkalasini ham BEKOR QILARDI — × HECH QACHON
  yashirilmagan. Founder 2026-08-17 da «x turaversin» degani uchun EKRANDAGI
  natija to'g'ri edi, faqat KOD boshqa narsani da'vo qilardi. Tuzatish
  ko'rinishga TEGMADI, kod QARORGA moslashtirildi (`hidden` va `x.hidden`
  olib tashlandi, sabab izohda). Teskarisi — kodni «tuzatib» `[hidden]`
  qatorini qo'shish — founder qarorini JIMGINA bekor qilardi.

  **6. Sinalgani va hisobotchi MUSTAQIL o'lchagani.** **82 → 86 test**
  (`git stash` bilan HEAD da 82, ishchi nusxada 86 — `^✅ Test` satrlari
  sanaldi). Hisobotchining O'Z **4 mutatsiyasi, 4 tasi ham ushlandi:**
  M1 `data-action="clearSearch"` → `clearSearchXX` (Test 44 qizil);
  M2 sayt saralashi eski yorliq usuliga qaytarildi (Test 47 qizil);
  M3 `SELECT` dan `p.created_at` olib tashlandi (qizil);
  M4 sanasi yo'q kartochka OXIRIGA emas, BOSHIGA — `return 1` → `return -1`
  (qizil). M4 muhim: u NOZIK tartib nuqsoni va uni faqat xatti-harakat
  sinovi tutadi.
  ⚠️ **Yo'l-yo'lakay hisobotchining O'ZI xato qildi va u yozib qo'yiladi:**
  mutatsiyani qaytarishda `git checkout index.html` ishlatilgan va u commit
  QILINMAGAN tahrirni (`hidden` olib tashlash + `?v=57`) o'chirib yuborgan —
  CLAUDE.md/`sprint-8` da ogohlantirilgan xatoning aynan o'zi. Tahrir qo'lda
  tiklandi va diff bayt-bayt solishtirildi; qolgan mutatsiyalar scratchpad
  zaxirasidan qaytarildi. **Dars: zaxira mutatsiyadan OLDIN olinsin, qaytarish
  esa `git` bilan EMAS, zaxiradan bo'lsin.**

  **Kesh:** `script.js` 55→**57**, `telegram-app/app.js` 100→**101** (Test 16
  jadvali birga). 🔴 **DEPLOY: statik + BACKEND** —
  `server/routes/catalog.js` o'zgardi, ya'ni rsync + servis restart TALAB
  QILINADI (migratsiya KERAK EMAS). Backend ko'tarilmasa «Eng yangi» zaxira
  rejimda, ya'ni eski yorliq usulida ishlab turaveradi va buni hech narsa
  ko'rsatmaydi. Hujjat: `docs/sprintlar/sprint-8.md` (Test 44–47).

- [2026-08-17] **SARALASH VA NARX VARAG'I (BOTTOM-SHEET) — IKKALA YUZDA, VA
  PRODUCTION'DA HECH QACHON ISHLAMAGAN ESKI NUQSON TUZATILDI** (bugungi
  BIRINCHI commit — `git log --since="2026-08-17"` bo'sh edi, o'lchandi).
  Ish IKKALA yuzga tegdi: sayt (`index.html` / `script.js` / `style.css`) va
  Mini App (`telegram-app/app.js`).

  **NAMUNA VA MANBA:** founder Shop ilovasining «Sort by» varag'ini referens
  qilib berdi va «so'zlari bilan bizga moslab» dedi. Header'dagi filtr
  tugmasi (`data-action="openSortSheet"`) endi VARAQ ochadi: sarlavha
  «Saralash» + ×, to'rt radio (Tavsiya etilgan · Eng yangi · Arzondan →
  qimmatga · Qimmatdan → arzonga), pastda narx oralig'i (min–max), footer
  «Tozalash» (chegarali) / «Tayyor» (anor gradient). Narx inputlari ILGARI
  chiplar ostidagi qatorda edi — varaqqa KO'CHDI; chiplar ostida endi faqat
  qo'llangan holat IZI turadi: `#sort-chip` va `#price-chip`, har birida ×.

  ⚠️ **QORALAMA QOIDASI IKKALA YUZDA BIR XIL:** varaqdagi tanlov (radio,
  inputlar) katalogni DARHOL o'zgartirmaydi — faqat «Tayyor» bosilganda
  qo'llanadi (saytda `applySortSheet`, Mini App'da `S.sortDraft` →
  `S.sortKey`). × yoki Escape bilan yopilsa qoralama tashlanadi. Mini
  App'dagi narx varag'i 2026-07-31 dan shunday ishlardi — sayt UNGA
  tenglashtirildi, yangi qoida o'ylab topilmadi.

  **SARALASH SAYTDA CSS `order` BILAN — DOM KO'CHIRILMAYDI** (`applySort`,
  `script.js`): kartochkalar joyida qoladi, ya'ni `productEl()` qidiruvi,
  filtr va boshqa kod tegilmaydi; `rec` da `order` bo'shatiladi. `rec` —
  katalogning O'Z tartibi (HTML / `sort_order`); `new` — «Yangi» belgili
  kartochkalar oldinda; narxi noma'lum kartochka IKKALA yo'nalishda ham
  OXIRIDA (u «eng arzon» ham, «eng qimmat» ham emas). Mini App'da esa
  ro'yxat `sortProducts()` bilan chizishdan oldin tartiblanadi (u yerda
  DOM baribir har safar qayta chiziladi).

  ⚠️ **«ENG YANGI» — HALOL CHEKLOV, O'YLAB TOPILMADI:** `/api/products`
  `created_at` QAYTARMAYDI, shuning uchun «yangi» faqat «Yangi» belgisi
  bo'yicha, haqiqiy sana bo'yicha EMAS. Kodga izoh yozildi, sana o'ylab
  topilmadi («o'ylab topilgan raqam» qoidasi). Haqiqiy sana bilan ishlashi
  uchun API'ga `created_at` qo'shish kerak — «Qarorlar» da ochiq band.

  **MINI APP:** mavjud `renderPriceSheet` referens shakliga o'tdi (Saralash
  sarlavhasi, radio qatorlar `data-action="pickSort"`, narx bo'limi,
  Tozalash/Tayyor). Yangi holat `S.sortKey` / `S.sortDraft`, yangi
  funksiyalar `sortProducts()`, `filterChipHtml()`, `clearSort()`,
  `clearPriceOnly()`. Filtr tugmasi saralash yoqilganda ham «yoniq»
  ko'rinadi (`filterOn = priceOn || sortOn`). ⚠️ `T.sort` kaliti HEAD da
  BOR edi, lekin uni ishlatadigan tugma YO'Q edi (`grep` bilan tekshirildi:
  faqat lug'atda) — ya'ni yuqoridagi «Mini App'dagi Saralash tugmasi hamon
  o'lik» yozuvi endi eskirdi; band yangilandi.
  🔴 **FOUNDER QARORI: filtr yoki saralash qo'llanganda REKLAMA BANNERI
  CHIZILMAYDI** (`filterOn ? '' : adBannerHtml()`; `mountAdBanner()`
  banner yo'qligini o'zi ko'radi va taymerni to'xtatadi — osilib qolgan
  interval yo'q). Sabab founder tomonidan alohida aytilmadi — qaror
  sifatida yozildi, oqlash o'ylab topilmadi.

  **VARAQ IKKALA YUZDA MUALLAQ KARTA** (founder: «tagi referensdagidek
  muallaq tursin») — pastki chetga yopishmaydi, 12px havo
  (`calc(12px + env(safe-area-inset-bottom))`), to'rt burchak 28px;
  desktopda 520px markazda, 24px pastdan. Sayt va Mini App'da bir xil
  o'lchov — 375px ekranda ikkalasi ham `[12, 363, …, 800]` (ish
  jarayonida brauzer panelida o'lchangan; hisobotchi bu o'lchovni QAYTA
  OLMADI — kod va testlarni tekshirdi).

  **WEBDA VARAQNING PASTKI QISMI** (founder: «oppoq bo'lib ozgina
  ko'rinmayapti») — footer krem fon (`--pom-50`) + ustida hairline;
  «Tozalash» anor chegara va anor matn (`--pom-700`).

  **QIDIRUV QUTISI FONDAN AJRALDI** (founder: «poisk background bilan
  birlashib ketgan») — `.search-box` fon `rgba(255,255,255,.92)`, chegara
  `rgba(23,26,48,.12)` (ilgari `--glass-border` — «shisha» oq chegara oq
  header'da yo'qolardi), soya yaqinroq. ⚠️ **× tugmasi avvalgidek DOIM
  turadi — founder qarori.** Ish jarayonida u yashirilgan edi va QAYTARILDI:
  «shunday qil» degan gapdan tashqarida o'zboshimchalik bilan olib tashlangan
  narsa foundersiz qaytarilmadi.

  🔴 **TOPILGAN ESKI NUQSON — 2026-08-13 QARORI PRODUCTION'DA HECH QACHON
  ISHLAMAGAN.** `.price-filter { display: flex }` `hidden` ATRIBUTIDAN
  KUCHLI edi (UA `[hidden] { display: none }` muallif qoidasidan yutqazadi),
  ya'ni «narx paneli yopiq tursin, tugma bilan ochilsin» qarori qabul
  qilingan kundan beri panel DOIM OCHIQ turgan. Hisobotchi jonli saytda
  QAYTA TEKSHIRDI: `curl https://lolamarket.uz/style.css?v=63` → 686-qator
  `.price-filter { display: flex; ... }`, `index.html` → `id="price-filter"
  hidden` — ikkalasi birga, ya'ni nuqson HAQIQIY va HOZIR HAM jonli. Endi
  `.price-filter[hidden] { display: none }` alohida qator bilan. Bu «yozilgan
  qoida himoya emas» oilasidan: qaror sprintga yozilgan, kod «to'g'ri»
  ko'ringan, testlar yashil — faqat KO'Z bilan ko'rilmagan.

  **IKKI TIL:** saytda 9 yangi kalit (uz+ru: `sortTitle`, `sortRec`,
  `sortNew`, `sortAsc`, `sortDesc`, `sheetReset`, `sheetDone`, `priceBad`,
  `close`), `apply` kaliti OLIB TASHLANDI (endi «Qo'llash» tugmasi yo'q).
  Test 20 sanadi: **271 → 279** (net +8 — hisobotchi HEAD bilan
  solishtirib o'lchadi, `git stash` bilan). Mini App'da `sortRec/New/Asc/
  Desc`, `sheetDone`, `sortRemove` (uz+ru). Til almashganda chip yozuvi
  yangilanadi (`applyLang` → `paintPriceState`).

  **SINALGANI: 80 TEST YASHIL** — hisobotchi mustaqil yurgizdi, `^✅ Test`
  takrorsiz sanaldi, ❌ soni 0. ⚠️ **Son O'ZGARMADI va bu KAMCHILIK:** bu
  ishga YANGI QOROVUL QO'SHILMADI (varaq / saralash / `[hidden]` qoidasi
  test bilan qulflanmagan). Aynan bugun topilgan `[hidden]` nuqsoni «test
  bo'lmasa qoida ishlamaydi» ning yangi misoli — qarz «Qarorlar» da.

  🔴 **Jonli saytda hali ko'rilmagan — DEPLOY QILINMAGAN.**
  **DEPLOY: faqat STATIK** — server kodiga tegilmadi (`server/test.js` faqat
  Test 16 jadvali), servis restarti va migratsiya kerak emas. Kesh:
  `style.css` 63→**64** (`index.html` va `admin/index.html` BIRGA),
  `script.js` 52→**53**, `telegram-app/app.js` 98→**99**, Test 16 jadvali
  birga (v + hash tekshirildi).

- [2026-08-16] **SAYTNING TAGIGA TO'LIQ FOOTER QO'SHILDI — HAVOLALARI SAHIFA
  EMAS, OYNA OCHADI** (bugungi TO'QQIZINCHI commit, `git log --since` bilan
  sanaldi). Ish FAQAT SAYTGA tegdi — Mini App'ga tegilmadi (u yerda pastda
  navigatsiya turadi, ya'ni footer uchun joy ham, ehtiyoj ham yo'q).

  **NAMUNA VA MANBA:** founder Uzum marketning footer'ini ko'rsatdi va
  kerakli bo'limlarni quiz orqali berdi. Ikki ustun oldi: «Biz haqimizda»
  (Topshirish punktlari, Loyiha haqida, Vakansiyalar, Hamkor bo'lish) va
  «Foydalanuvchilarga» (Biz bilan bog'lanish, Savol-Javob, Yetkazish va
  to'lov, Ommaviy oferta va maxfiylik). «Tadbirkorlarga» ustuni founder
  tomonidan TANLANMADI va o'zboshimchalik bilan qo'shilmadi.

  🔴 **QATORLAR HAVOLA EMAS, TUGMA — VA BU MAJBURIY TANLOV EDI.** Sayt bitta
  sahifadan iborat (`index.html`), ya'ni `/vakansiyalar` kabi manzil YO'Q va
  oddiy `<a href>` qo'yilsa har bir qator **404** berardi. Har qator
  `data-action` orqali savat/profil bilan BITTA mexanizmda oyna ochadi
  (`drawerView = 'info'`, `INFO_TOPICS` jadvali). Founder qarori:
  «kerak bo'lishi shartlarini ham qo'y keyin ichini to'ldiramiz» — ya'ni
  shakl bugun, mazmun keyin, lekin bo'shligi KO'RINIB tursin.

  ⚠️ **BO'SH BO'LIM BO'SHLIGINI AYTADI, «TEZ ORADA» DEMAYDI.** Matn —
  «Bu bo'lim matni hali yozilmagan» + bog'lanish tugmasi. Sana va'da
  qilinmadi: bajarilmagan va'da yo'q matndan yomonroq (`NULL` reyting va
  `ALERT_CHAT_ID` darslari bilan bitta oila — jimgina yolg'on). Har bo'limda
  «Biz bilan bog'lanish» tugmasi turadi: matn yo'q bo'lsa ham javob
  beradigan odam bor.

  **«YETKAZISH VA TO'LOV» — YAGONA TO'LIQ BO'LIM,** chunki uning mazmuni
  allaqachon kodda bor. ⚠️ Foiz `PREPAY_RATE` dan O'QILADI (u serverdan
  keladi), matnga qo'lda yozilmadi: stavka o'zgargan kuni sahifa jimgina
  yolg'on gapirardi va buni hech narsa ko'rsatmasdi (komissiya 10→12%
  o'tishida ayni tuzoq bo'lgan).

  ⚠️ **«TOPSHIRISH PUNKTLARI» YANGI RO'YXAT CHIZMAYDI** — profildagi
  «Mening manzilim» ochadigan AYNI ko'rinishni ochadi (`openPoints` →
  `drawerView = 'address'`). Ikkinchi nusxa ATAYLAB qilinmadi (CLAUDE.md:
  mavjud funksiya ustiga ikkinchi yo'l qo'shilmaydi) — nusxa yozilsa nuqta
  nomlari va koordinatalari vaqt o'tib ajralib ketardi. Farqi bitta va u
  yangi `addrFrom` o'zgaruvchisida: sarlavha footer'dan kelinganda
  «Topshirish punktlari», profildan kelinganda «Mening manzilim» (aks holda
  bosilgan so'z bilan ochilgan ekran boshqa-boshqa bo'lardi), nuqta
  tanlangandan keyin esa footer yo'lida oyna YOPILADI — profilga
  «qaytarish» mumkin emas, chunki foydalanuvchi u yerda umuman bo'lmagan va
  KIRMAGAN odam u yerda bo'sh karta bilan «Hisobdan chiqish» tugmasini
  ko'rardi.

  **QR BLOKI — founder so'ragan:** «ilovada qulayroq» emas, «Telegram botda
  xarid qilish qulayroq», QR generatsiya qilinsin, o'rtasida lolaning
  shaffof logosi tursin. Bajarildi: QR **INLINE SVG** (tashqi fayl CSP va
  `?v=` bilan yana bitta bog'liqlik bo'lardi), tashqi npm paket
  ishlatilmadi — kodlagich qo'lda yozildi (byte mode, ECC **H**). Rang CSS
  klassida va `fill="currentColor"`: `fill="var(...)"` SVG prezentatsiya
  atributida jimgina QORA berardi (CLAUDE.md — brend rangi bandi).

  🔴 **DEEP-LINK PAYLOAD'I `web_footer` EMAS, `sayt_footer` — VA BU FARQ
  O'LCHOVDAN CHIQDI.** Quiz javobida `web_footer` yozilgan edi;
  `server/routes/webhook.js` → `manbaBelgisi()` esa `web_` bilan
  boshlanadigan payloadni **RAD ETADI** (u saytga kirish kodi uchun band) va
  uni ATAYLAB JIM tashlaydi — alert ham chiqmaydi. Ya'ni asl variant bilan
  QR panelda **«nol odam keltirdi»** bo'lib turardi, ya'ni raqam yo'q emas,
  YOLG'ON bo'lardi. Serverning O'Z funksiyasida sinaldi: `sayt_footer` →
  qabul, `sayt_hamkor` → qabul, `web_footer` → `null`.

  ✅ **QR HISOBOTCHI TOMONIDAN MUSTAQIL QAYTA O'QILDI** (da'voga emas,
  o'lchovga ishonish): `index.html` dagi `<path d="...">` ning O'ZIDAN
  37×37 modul to'ri qayta yig'ildi (355 ta yugurish, 709 qora modul),
  `server/lib/png.js` bilan PNG ga chizildi va macOS Vision bilan
  dekodlandi → **`https://t.me/lolamarketbot?start=sayt_footer`**, ya'ni
  sahifadagi belgi bilan yonidagi `href` bir xil. Markazi yopilgan holda
  ham o'qildi: 22% (sahifadagi holat), 28% va hatto **34%** — ya'ni H
  darajasi tanlovi zaxira bilan ishlayapti.

  🔴 **TELEFONDA TOPILGAN VA TUZATILGAN JIMGINA NUQSON:** `.footer-top`
  bloki AYNI paytda `.container` ham edi va CSS'da `padding: 32px 0 8px`
  **QISQARTMASI** uning yon to'ldirmasini NOLGA tushirgan — `.container`
  faylning yuqorisida (154-qator) turgani uchun keyingi qoida uni bosib
  o'tardi. O'lchov: chap chegara **0px**, QR kartochkasi 375px ekranda
  **360px** joy egallagan, ustunlar ekran chetiga yopishib qolgan. Konsolda
  xato YO'Q edi, blok «bor» bo'lib ko'rinardi — nuqsonni faqat
  `getBoundingClientRect()` ko'rsatdi. Endi `padding-top` va
  `padding-bottom` ALOHIDA yoziladi.

  **IKKI TIL — 22 ta yangi kalit** (uz + ru; `Test 20` ni sanadi: 249 → 271
  kalit). ⚠️ **`INFO_TOPICS` da matn kaliti SATR emas, `t('...')`
  CHAQIRUVI:** Test 20 ishlatilishni `t('kalit')` shakli bo'yicha sanaydi,
  ya'ni kalitlar massivda satr bo'lib yotsa ular «o'lik» ro'yxatiga tushardi
  va bir kun kelib «ishlatilmayapti» deb o'chirilardi — o'shanda bo'lim matn
  o'rniga KALIT NOMINI ko'rsatardi.
  ⚠️ **RAQAM TEKSHIRILDI VA HISOBOTDAGI IKKITA DA'VO TUZATILDI**
  («hujjatdagi raqam — tekshirilmagan da'vo» qoidasi yana ish berdi):
  (1) «24 ta yangi kalit» → aslida **22** (271 − 249, ikkala tilda ham);
  (2) «o'lik ro'yxat 23 → 16 ga qaytdi» → HEAD da o'lik ro'yxat
  **ALLAQACHON 16** ta edi va shundayligicha **16** ta qoldi. To'g'ri
  o'qilishi: bu ish o'lik ro'yxatni QISQARTIRMADI — u **o'smasligini**
  ta'minladi (satr sifatida yozilganda 7 ta `...Body` kaliti qo'shilib 23
  bo'lardi). Farq muhim: «kamaydi» degan o'qish bu commitga o'ziniki
  bo'lmagan yutuqni yozib qo'yardi.

  **SINALGANI: 80 TEST YASHIL** — hisobotchi mustaqil yurgizdi va
  `^✅ Test` satrlarini takrorsiz sanadi. ⚠️ **Son O'ZGARMADI va bu safar bu
  KAMCHILIK:** bu ishga YANGI QOROVUL QO'SHILMADI. HEAD da ham 80 edi
  (o'lchandi). Ochiq qolgan teshik pastda, «Qarorlar» da yozilgan.

  ⚠️ **Tekshiruv ko'z bilan emas, O'LCHOV bilan** (brauzer paneli render
  qilmasligi mumkin — 2026-08-16 da shunday bo'lgan): 1280px da uch ustun
  **338/338/360**, 375px da bitta ustun, gorizontal siljish **0**, hech
  qayerda kesilish yo'q, havola bo'yi **40px** (barmoq uchun), QR logosi
  markazda. CSS tokenlari ham tekshirildi — `--saffron-50`,
  `--glass-fill-strong`, `--surface-solid` va qolgan 16 tasi `style.css` da
  MAVJUD (aniqlanmagan token jimgina yo'qoladi).
  🔴 **Jonli saytda hali ko'rilmagan.**
  **DEPLOY: faqat STATIK** — server kodiga tegilmadi, servis restarti ham,
  migratsiya ham kerak emas. Kesh: `style.css` 62→**63** (`index.html` va
  `admin/index.html` BIRGA), `script.js` 51→**52**, `panel.js` 44→**45**,
  Test 16 jadvali birga.

- [2026-08-16] **QADALGAN QATOR CHIQQANDA HEADER YUQORIGA SURILADI —
  IKKITA QADALGAN QATOR BIRGA TURMAYDI** (bugungi SAKKIZINCHI commit).
  Ish FAQAT SAYTGA tegdi — Mini App'ga tegilmadi.

  ⚠️ **Raqam TEKSHIRILDI va oldingi yozuvda XATO topildi:** bir oldingi
  yozuv o'zini «OLTINCHI commit» deb ataydi, `git log --since="2026-08-16"`
  esa o'sha paytda **yetti** ta commit ko'rsatadi — `2a93153` (`og:` meta
  tuzatishi) alohida sanalmay, beshinchining yozuviga qo'shib yuborilgan
  edi. Yozuvlar tuzatilmadi (tarix qayta yozilmaydi), lekin bu yerdagi
  raqam GIT dan olindi, oldingi yozuvdan emas. «Hujjatdagi raqam —
  tekshirilmagan da'vo» qoidasi bu safar xato TOPDI.

  **FOUNDER SHIKOYATI (skrinshot bilan):** «mahsulot qadalganda tepadagi
  doim qadaladigani qadalmasin». Kechagi commitda qo'shilgan `.pdp-bar`
  header'ning OSTIDA turardi, ya'ni ekranning yuqorisini **IKKITA** qadalgan
  qator egallardi: 1280px da 64 + 61 = **125px**, telefonda (375px)
  162 + 61 = **223px**. Ya'ni ekranning eng qimmat joyida mato emas,
  BOSHQARUV turardi.

  **YECHIM: bittasi ikkinchisining O'RNINI bosadi.** Qator ko'ringanda
  tanaga `pdp-bar-on` belgisi qo'yiladi va CSS header'ni yuqoriga suradi
  (`body.pdp-bar-on #nav { transform: translateY(-100%) }`), qator esa
  `top: 0` ga o'tadi. Qator yashiringanda header qaytadi. `#nav` ga
  `transition: transform` qo'shildi — o'tish silliq.
  ⚠️ **`position: static` EMAS, `transform`** — sabab harakat emas, IKKI
  TOMONLAMA: (a) `#nav` ustida `backdrop-filter` bor va `position`
  almashtirilsa paint qatlami qayta yig'iladi (sakrash); (b) `transform`
  oqimdagi joyni ham, `offsetHeight` ni ham TEGMASDAN qoldiradi — quyidagi
  aylanma bog'liqlik aynan shunga tayanadi.

  🔴 **AYLANMA BOG'LIQLIK OCHILDI VA U ENG NOZIK QISM.** `pdpBarSync()`
  ilgari header chegarasini `getBoundingClientRect().bottom` bilan olardi.
  Header endi qatorning holatiga qarab SURILADI, ya'ni rect chegarani
  o'zgartiradi: qator chiqadi → header suriladi → chegara siljiydi →
  qator yashirinadi → header qaytadi → chegara qaytadi… **ekran har kadrda
  miltillardi.** Endi balandlik `offsetHeight` dan olinadi — u oqimdagi
  o'lchov va `transform` dan TA'SIRLANMAYDI, ya'ni chegara qat'iy.

  **IKKITA JIMGINA NUQSON TOPILDI VA YOPILDI** — ikkalasi ham AYNI
  sessiyada yozilgan kodda edi va **jonli tekshiruvda** chiqdi, testda emas:
  **(a) Katalogga qaytgan odam HEADERSIZ qolardi.** `closePdp()`
  `pdp-bar-on` belgisini o'chirmasdi. Sabab tuzilishda: belgi **TANADA**,
  qator esa **`#pdp` ICHIDA** yashaydi — ular ALOHIDA yo'l bilan yo'qoladi
  va bittasi qolib ketsa qidiruv, savat, kirish — hammasi ko'rinmas bo'lardi.
  `pdpBarSync()` ga zaxira tozalash ham qo'shildi (`if (!bar)` shohbasida),
  ya'ni qator boshqa yo'l bilan yo'qolsa ham belgi qolib ketmaydi.
  **(b) O'xshash matodan yangi mahsulot ochilganda header surilgan holatda
  qolardi.** `openDetail` va `popstate` da qator skroll TIKLANMASDAN OLDIN
  hisoblanardi. Endi `pdpBarSync()` `window.scrollTo(0, 0)` dan KEYIN
  chaqiriladi. ⚠️ Skroll hodisasiga tayanib bo'lmaydi: `scrollY` 0 dan 0
  ga «o'zgarsa» hodisa UMUMAN otilmaydi.

  **QOROVUL — TEST 41 KENGAYDI (1 band → 4 band), 4 YANGI MUTATSIYA,
  4 TASI USHLANDI** (bu funksiya bo'yicha jami **11/11**):
  2-band — chegara `offsetHeight` dan olinsin va `pdpBarSync` ichida
  header uchun `getBoundingClientRect` BO'LMASIN (aylanma bog'liqlik);
  3-band — `closePdp()` `pdp-bar-on` ni o'chirsin VA `pdpBarSync` da
  `if (!bar)` zaxira tozalashi bo'lsin; 4-band — CSS tomonda
  `body.pdp-bar-on #nav` qoidasi haqiqatan header'ni yuqoridan olib
  tashlasin. ⚠️ 4-band **USLUBNI emas, NATIJANI** so'raydi:
  `translateY(-100%)` ham, `position: static` ham qabul qilinadi — test
  maqsadni qulflaydi, amalga oshirishni emas.

  **SINALGANI: 80 TEST YASHIL** — raqam runner chiqishidan MUSTAQIL
  sanaldi (`^✅ Test` satrlari, TAKRORSIZ). ⚠️ **Son O'ZGARMADI va bu
  to'g'ri:** yangi test raqami qo'shilmadi, mavjud Test 41 kengaydi.
  🔴 **JONLI SAYTDA HALI KO'RILMAGAN** — deploy faqat statik (server
  kodiga tegilmadi, servis restarti va migratsiya KERAK EMAS).

  ⚠️ **TEKSHIRUV KO'Z BILAN EMAS, O'LCHOV BILAN** (1280px va 375px):
  header surilgani (`navTop` 0 → **-64** / **-162**), qator `top: 0` ga
  o'tgani, `pdpBarSync()` ketma-ket chaqirilganda holat O'ZGARMAGANI
  (ya'ni tebranish yo'q — aylanma bog'liqlik haqiqatan uzilgan),
  katalogga qaytganda header tiklangani, o'xshash kartochkadan yangi
  mahsulot ochilganda holat to'g'ri bo'lgani.

  Kesh: `style.css` 61 → **62** (`index.html` va `admin/index.html`
  birga — bitta fayl hamma sahifada bir xil versiya), `script.js`
  50 → **51**, `panel.js` 43 → **44**, Test 16 jadvalidagi `sha256` lar
  birga (`style.css` `0a32cbfbbbce`, `script.js` `5d49be2ec8f6`).
  CLAUDE.md dagi mavjud band kengaytirildi (yangi qoida ochilmadi —
  bu o'sha qadalgan qator bandining davomi).

- [2026-08-16] **MAHSULOT SAHIFASIDA QADALGAN QUTI OLIB TASHLANDI VA
  O'XSHASH MATOLAR KATALOG O'LCHAMIGA QAYTDI** (bugungi OLTINCHI commit).
  Uchala o'zgarish ham founder shikoyati/qarori bo'yicha, ish FAQAT SAYTGA
  tegdi — Mini App'ga tegilmadi.

  **1) QUTI QADALMAYDI, O'RNINI YUQORIDAGI QATOR BOSADI.** Founder:
  «webda scroll qilsam shu qadalib pastga tushayabdi». `.pdp-aside` dan
  `position: sticky` OLIB TASHLANDI. Lekin narx va tugma yo'qolib qolmadi:
  yangi `.pdp-bar` — yuqorida ingichka qator (surat, nom, reyting, narx va
  AYNI «Savatga» tugmasi), u FAQAT sotib olish qutisi ekrandan chiqib
  ketganda ko'rinadi va sahifa mazmunini bosib turmaydi.
  ⚠️ **Tugma NUSXALANMADI** — ikkala joy ham `pdpActHtml()` dan oziqlanadi
  va `renderPdpAct()` endi IKKALA idishni ham yangilaydi. Nusxa yozilsa
  ekran o'z ustidan jimgina yolg'on gapirardi: bir joyda «savatda 2 dona»,
  ikkinchisida hamon «Savatga qo'shish».
  ⚠️ **Qatorning `top` i JS da O'LCHANADI** (`pdpBarSync`), `--header-h`
  dan OLINMAYDI. Sabab o'lchov: 880px dan tor ekranda qidiruv ikkinchi
  qatorga tushadi va header o'sha o'zgaruvchidan BALAND bo'ladi —
  **700px da 115px, 375px da 162px**. Qattiq yozilsa qator header ostiga
  kirib, umuman KO'RINMAY qolardi.
  ⚠️ `position: fixed`, `sticky` EMAS: qator `#pdp` ichida yashaydi va
  sticky bo'lsa sahifa oxirida (o'xshash matolar orasida) yuqoriga chiqib
  ketardi. Tinglovchilar HUJJAT umri bo'yicha bir marta ulanadi —
  `renderPdp` da ulansa har ochilishda yangi tinglovchi qo'shilardi.

  **2) O'XSHASH MATOLAR IKKI QATOR VA KATALOG O'LCHAMIDA.** Founder:
  «kartochkalar pastda ezilib o'z hajmini yo'qotayotgan edi, shunaqa
  yo'qotmasin hech qachon». Pastki qator endi UCHALA ustunni egallaydi
  (`"below below side"` → **`"below below below"`**).
  🔴 **O'LCHANDI (1280px):** o'xshash mato kartochkasi **179×394** edi,
  AYNI kartochka katalogda **264×501** — ya'ni tavsiya kartochkasi
  kengligining uchdan birini yo'qotardi. Endi **264×501**, harfma-harf
  bir xil.
  **`.pdp-sim` ustunlar sonini QAYTA YOZMAYDI** — u `.product-grid` dan
  keladi, ya'ni «kartochka o'z hajmini yo'qotmasin» qoidasi bitta joyda
  turadi. Ko'rinadigan kartochka soni ham ustunga bog'landi
  (2/3/4 ustun → **4/6/8**, ya'ni har doim ikki qator), `PDP_SIM_MAX`
  4 → **8** va u eng katta songa TENG. Ortiqchasi DOM'da qoladi va faqat
  yashiriladi: `pdpMountSimilar` sahifa ochilganda BIR marta ishlaydi,
  ya'ni ekran kengaysa qator qayta chizilmasdan to'ladi.

  **3) VARAQA NISHONI FONSIZ BELGIGA O'TDI.** Founder: «admin
  panelnikidek qilgin». `index.html` → `rel="icon"` =
  `/Photo/logo/lola-mark.png` (ilgari `assets/pwa/icon-192.png` — to'q
  qizil KVADRAT, varaqa tasmasida qora dog'day ko'rinardi).
  ⚠️ `apple-touch-icon` ATAYLAB kvadrat bo'lib QOLDI: uy ekranidagi nishon
  fonsiz bo'lsa iOS uni oq fonga qo'yadi va belgi rangsiz ko'rinardi —
  ikki nishon ikki xil ish qiladi, bir xillashtirilmasin. `Photo/`
  `deploy.yml` `source` ro'yxatida ALLAQACHON bor (tekshirildi) va fayl
  diskda mavjud — «yangi ildiz papkasi CI ga qo'shilmasa serverga chiqmaydi»
  tuzog'i bu safar otilmadi.

  **YANGI QOROVULLAR — 7 MUTATSIYA, 7 TASI USHLANDI.**
  **Test 40** — o'xshash matolar katalog o'lchamida: `.pdp-sim` da
  `grid-template-columns` QAYTA YOZILMASIN + ikki qator pog'onalari
  (`4 / 6 / 8`) + `PDP_SIM_MAX` eng katta pog'onaga teng bo'lsin.
  **Test 41** — sotib olish tugmasi HAMMA idishda yangilansin: idishlar
  ro'yxati qo'lda yozilmaydi, manbadan yig'iladi (2 ta topildi:
  `pdp-act`, `pdp-bar-act`), ya'ni uchinchi joy qo'shilsa avtomatik
  qamraladi. **Test 37** izohi yangi maydon tuzilmasiga moslandi (u
  kechagi commitda aynan qadalgan quti uchun yozilgan edi).

  **SINALGANI: 80 TEST YASHIL** — raqam runner chiqishidan MUSTAQIL
  sanaldi (`^✅ Test` satrlari, TAKRORSIZ; yakuniy «Hammasi PASS» qatori
  bu naqshga tushmaydi, ya'ni sanoqqa kirmaydi).
  ⚠️ Ish yozuvida raqam KELMAGAN edi («butun to'plam yashil») —
  shuning uchun zanjir git tarixidan tiklandi va TEKSHIRILDI:
  `5cd89cf` → 75, `e174291` → 77, `2a93153` (HEAD, Test 39 qo'shilgan)
  → **78**, bugun 2 ta (Test 40, 41) → **80**. Ya'ni oldingi hisobotlardagi
  raqamlar TO'G'RI bo'lib chiqdi; «hujjatdagi raqam — tekshirilmagan
  da'vo» qoidasi bu safar xato TOPMADI, lekin qadam baribir bajarildi

  ⚠️ **TEKSHIRUV KO'Z BILAN EMAS, O'LCHOV BILAN:** brauzer paneli render
  qilmadi (`document.hidden`), ya'ni skrinshotga ishonib bo'lmasdi —
  `getBoundingClientRect()` bilan **1280 / 900 / 700 / 500 / 375 / 320px**
  kengliklarda o'lchandi, gorizontal skroll yo'q. Bu CLAUDE.md dagi
  «flex ustunda ko'z bilan qarash yetarli emas» bandining amaliyoti.
  🔴 **JONLI SAYTDA HALI KO'RILMAGAN** — deploy faqat statik (servis
  restarti va migratsiya KERAK EMAS).

  Kesh: `style.css` 60 → **61** (`index.html` va `admin/index.html`
  birga — bitta fayl hamma sahifada bir xil versiya), `script.js`
  49 → **50**, `panel.js` 42 → **43**, Test 16 jadvalidagi `sha256` lar
  birga (`style.css` `0f2f51c38847`, `script.js` `3d02e03306f0`).
  CLAUDE.md ga ikkita yangi qoida yozildi (quyida).

- [2026-08-16] **MAHSULOT DETALI DRAWER'DAN TO'LIQ SAHIFAGA O'TDI — VA
  ENG QIMMAT NUQSONNI FOUNDER TOPDI, TEST EMAS** (bugungi BESHINCHI commit).
  Ish FAQAT SAYTGA tegdi — Mini App'ga tegilmadi, bu founder sharti edi.

  **1) DRAWER O'RNIGA SAHIFA** (`#pdp`, founder Uzum referensini berdi).
  Eski `drawerView === 'detail'` ko'rinishi **OLIB TASHLANDI** — ikkinchi yo'l
  qoldirilmadi (CLAUDE.md: «mavjud funksiyaning ustiga ikkinchi yo'l
  qo'shilsa — avval so'raladi»; bu yerda javob «eskisi ketsin» bo'ldi).
  Tarkib: galereya (eskiz + strelka + nuqta), nom/reyting/tasdiqlangan
  nishoni, qadalgan sotib olish qutisi, kafolat, sotuvchi kartochkasi,
  tavsif jadvali, AI bloki, sharhlar, o'xshash matolar.
  ⚠️ **Sahifa `index.html` ICHIDA yashaydi, yangi HTML fayl EMAS** — aks
  holda uni `deploy.yml` `source` ro'yxatiga QO'LDA qo'shish kerak bo'lardi
  va unutilsa nginx `try_files` tufayli **HTTP 200 + HTML** qaytarib,
  nosozlik sog'lom ko'rinardi (CLAUDE.md dagi soft-200 tuzog'i).
  ⚠️ Referensdagi **chegirma, taymer, bo'lib to'lash va «307 kishi oldi»
  QO'YILMADI** — bunday ma'lumot bazada YO'Q. «Panelda o'ylab topilgan raqam
  ko'rsatilmasin» qoidasi mahsulot sahifasiga ham tegishli: referensni
  ko'chirish uchun raqam TO'QIB chiqarilmaydi.

  **2) MANZIL HASH'DAN HAQIQIY YO'LGA:** `#/mahsulot/x` → `/mahsulot/x`.
  Eski hash havolalari `replaceState` bilan ko'chiriladi — tarqalgani
  o'lmasin. 🔴 **VA SHU YERDA SOFT-200 TUZOG'I QAYTA CHIQDI:** o'lchandi —
  `/mahsulot/ik-1402` → `200 text/html` (nginx allaqachon beradi, ya'ni
  sahifa ishlashi uchun server qadami SHART EMAS), LEKIN
  `/mahsulot/style.css` → **`200 text/html`**. Ya'ni sahifa endi bir pog'ona
  ichkarida ochilgani uchun har bir NISBIY yo'l HTML olib kelardi va HTTP
  kodi SOG'LOM ko'rinardi. Shuning uchun `index.html` dagi **hamma** nisbiy
  yo'l mutlaqqa o'tkazildi va `pwa.js` `/sw.js` ga (`scope: '/'` bilan —
  aks holda service worker qamrovi `/mahsulot/` bo'lib qolib **bosh sahifa
  SW'siz** qolardi). `document.title` ham mahsulot nomini oladi.

  **3) YANGI `server/routes/pdp.js` — `og:` meta** (Telegram oldindan
  ko'rishi). Robot HTML ni O'QIYDI, JS ni bajarmaydi — ya'ni buni
  frontendda qilib bo'lmaydi. 🔴 **Modul IXTIYORIY va shunday qolishi
  kerak:** nginx yo'naltirmasa sayt avvalgidek TO'LIQ ishlaydi, faqat
  oldindan ko'rish umumiy bo'ladi. Mahsulot sahifasini backend'ga bog'lab
  qo'yish xato bo'lardi — backend yiqilsa katalogdagi **har bir mato 502**
  ga aylanardi. nginx snippet'i `server/README.md` ga zaxira yo'li bilan
  yozildi (`error_page 502 = @static_index`). `WEB_ROOT` shakl bo'yicha
  tekshiriladi — papkada `index.html` HAQIQATAN turganiga qaraladi, «bo'sh
  emas» yetarli emas (`ALERT_CHAT_ID` darsi); topilmasa QICHQIRIB o'chadi.
  `index.html` har so'rovda diskdan o'qiladi, keshlanmaydi: deploy statik
  faylni almashtiradi-yu servisni qayta ishga tushirmaydi, ya'ni kesh
  qo'yilsa yangi deploy'dan keyin **eski HTML faqat mahsulot sahifalarida**
  tarqalib turardi.

  **4) QOLGANLARI:** rasmni kattalashtirish (to'liq ekran, desktopda 2x
  bosish; telefonda brauzerning o'z pinch'i — saytda `user-scalable=no`
  YO'Q); havolani nusxalash tugmasi (mavjud `copyText()`, yiqilsa AYTADI);
  **o'xshash matolar uch pog'ona bo'ldi** — toifa → sotuvchi → narx
  yaqinligi, sabab O'LCHOV: jonli katalogda `jun 1 · ikat 1`, ya'ni ilgari
  o'sha ikki matoda bo'lim UMUMAN chizilmasdi; **MOQ** endi savatga
  qo'shishda darrov MOQ dan boshlanadi va «−» undan pastga tushirmaydi
  (bugun zarari NOL — 24 mahsulotda ham `moq=1` — lekin sotuvchi 5 qo'ygan
  kuni tishlardi); `sellerRating` `/api/products` ga qo'shildi (bazada BOR
  edi, hech qayerda ko'rsatilmasdi — `NULL` bo'lsa qator chizilmaydi).

  **5) KARTOCHKA `id` DAN `data-*` GA:** `act-<id>`/`fav-<id>` →
  `data-act`/`data-fav`. Sabab: «o'xshash matolar» katalog kartochkasini
  `cloneNode` bilan NUSXALAYDI (founder: «kartochka o'zgarmasin, qanday
  holatda bo'lsa»), ya'ni bitta kartochka sahifada ikki joyda turadi va
  `id` TAKRORLANARDI.

  **TUZATILGAN NUQSONLAR — UCHALASI HAM O'LCHOV BILAN TOPILDI:**
  (a) o'xshash kartochka rasmi `aspect-ratio` ni yo'qotib har birida boshqa
  balandlik olardi (kutilgan 136px, o'lchangan **242/290/323**) — rasm
  oqimdan chiqarildi; (b) nusxalangan kartochkalar `opacity:0` da qotib
  qolardi (IntersectionObserver nusxaga otilmaydi) — ⚠️ **DOM tekshiruvi
  YASHIL edi, nuqson faqat RASMDA ko'rindi**; (c) 🔴 **UCHINCHISINI FOUNDER
  TOPDI:** 1000px kenglikda qadalgan sotib olish qutisi «o'xshash matolar»
  ustida SUZARDI (o'lchandi: quti 668→968, pastki qator 32→968 — 300px
  kesishma). **Sabab `sticky` da EMAS, MAYDON TUZILMASIDA edi:** tor
  ekranda pastki qator ikkala ustunni egallaydi, ya'ni qadalgan quti o'z
  ustunidan CHIQIB ketardi.

  **YANGI QOROVULLAR:** **Test 37** — qadalgan quti ostidan qator o'tmasin:
  `grid-template-areas` ni MATRITSA qilib yoyadi va «`side` turgan ustunda
  boshqa qatorda `below` bormi» deb so'raydi; media bloklari orasidagi
  MEROSNI ham hisoblaydi (aynan shu nuqson edi — media bloki maydonlarni
  almashtirib `position` ni qoldirgan). 3 mutatsiya, 3 tasi ushlandi.
  **Test 38** — `index.html` da nisbiy yo'l qolmasin (izohlar tahlildan
  oldin tashlanadi — Test 3f da IZOH qorovulni aldagan edi) + `pwa.js`
  `/sw.js` ni MUTLAQ yo'l bilan ro'yxatdan o'tkazsin. 2 mutatsiya, ikkalasi
  ham ushlandi.
  ⚠️ **Test 37 «ko'z bilan qarash yetarli emas» oilasidan:** nuqson faqat
  SKROLL qilinganda va faqat MA'LUM kenglikda ko'rinadi — konsolda xato
  yo'q, `overflow` yo'q, o'lchamlar «to'g'ri».

  **SINALGANI: 77 TEST YASHIL** (hisobotchi mustaqil qayta yurgizdi va
  sanadi). ⚠️ Ish yozuvida **78** deb kelgan edi — farq shundan: `test.js`
  oxirida «Hammasi PASS» degan YAKUNIY ✅ qator ham chiqadi, ya'ni `✅`
  belgisini sanash testni emas, **test + yakun** ni sanaydi. Tekshirildi:
  oldingi commit 75 ta edi, bugun 2 ta qo'shildi → 77. Bu «hujjatdagi
  raqam — tekshirilmagan da'vo» qoidasining aynan o'zi va u bir marta
  allaqachon tishlagan («32 test» → aslida 33 ta).
  Kesh: `style.css` v58 → **v60**, `script.js` v47 → **v49**, `pwa.js`
  v2 → **v3**, Test 16 jadvalidagi `sha256` lar birga; `admin/index.html`
  dagi `style.css` ham v60 ga ko'tarildi (u AYNI faylni chaqiradi —
  2026-08-06 da bu 15 versiya orqada qolib ketgan edi)

- [2026-08-16] **MINI APP TAFSILOTLAR JADVALIDA `null` SO'ZI TURARDI — VA
  SAYTDA BU ALLAQACHON TO'G'RI EDI** (`telegram-app/app.js`). Bazadan
  qiymati bo'sh kelgan mahsulotda (masalan `#lm1`) ekranda **«Zichlik null»,
  «Yetkazish muddati null kun»** va bo'sh «Tarkibi» qatori chizilardi.
  Endi qiymati yo'q qator **umuman chizilmaydi**, hamma qator bo'sh bo'lsa
  esa butun «Xususiyatlar» bloki tushib qoladi — bu CLAUDE.md ning
  «ma'lumot bazadan kelmasa, blok umuman ko'rsatilmaydi» qoidasi va
  `NULL` reyting bandi bilan bitta oila: **«aytilmagan» ≠ «nol»**, shuning
  uchun o'rniga «—» ham, «0 kun» ham QO'YILMADI.
  🔴 **Eng qimmat qismi — nuqsonning O'ZI emas, TARQALMAGANI:** saytda
  (`script.js` → `specs`) ayni tekshiruv allaqachon bor edi va **izohi ham
  yozilgan** edi. Ya'ni qoida bir yuzda o'rganilib, ikkinchisiga
  ko'chirilmagan — bu `authUser()` va avatar CSP naqshlari bilan bitta
  oila: **bir yuzda ishlab, ikkinchisida ishlamaydigan** nuqson.
  ⚠️ **Yo'l-yo'lakay:** `width` va `weight` `vm()` ning `esc()`
  chegarasidan CHETDA qolgan va xom holda `innerHTML` ga tushardi. Bugun
  ularni yozadigan endpoint YO'Q (faqat qo'lda SQL), ya'ni hujum yo'li
  ochilmagan edi — lekin himoya «kim yozadi» ga emas, **QAYERGA chiqadi**
  ga qarab qo'yiladi: e'lon shakliga bu maydonlar qo'shilgan kuni bu joyni
  eslab qolish kerak bo'lardi. Endi ikkalasi ham chegara ichida
  (`esc(null)` → `''`, ya'ni bo'sh qiymat qatorni ham o'chiradi).
  ⚠️ `meta` satri hozir HECH QAYERDA chizilmaydi (kartochka o'z qatorlarini
  o'zi yig'adi), lekin u ham tuzatildi: «ishlatilmayapti» degan sabab
  nuqsonni tayyor holda kutib turishga aylanardi.
  Kesh: `telegram-app/app.js?v=97 → v98`, Test 16 jadvalidagi versiya va
  `sha256` birga yangilandi

- [2026-08-16] **XARIDOR STATISTIKASI 50 TALIK OYNADAN CHIQDI — VA
  `orders` JADVALIDA XARIDOR INDEKSI UMUMAN YO'Q EKAN.** Bu **bugungi
  UCHINCHI commit** (birinchisi `6d8b56d`, ikkinchisi `8600362` — ikkalasi
  ham banner). Telefon/xavfsizlik qismi `sprint-3.md` da (kimlik qoidasi
  o'sha sprintniki), bu yerda **buyurtma domeniga tegishli** qismi.

  **1) RAQAM YOLG'ON EDI VA BUNI HECH NARSA KO'RSATMASDI.** Profil
  kartasidagi «buyurtma» va «rulon» soni — va ular ustiga qurilgan UNVON
  (🌱 Mehmon → 🧵 Mijoz → 🤝 Hamkor → 🌷 Qadrdon, 2026-08-15 qarori) —
  klientda `ORDERS` massividan hisoblanardi. Massiv esa `/api/orders` dan
  keladi va u **`LIMIT 50`** bilan yuradi. Ya'ni raqam umrbod emas,
  **oxirgi 50 buyurtma oynasi** edi: 51-buyurtmadan keyin eng eskisi
  oynadan chiqib yangisi kirgani uchun rulon soni deyarli joyida qotardi va
  **100 rulon sotib olgan xaridor «Qadrdon» bo'lolmasdi**. Xato yo'q,
  konsol toza, raqam esa yolg'on — `NULL` reyting va `ALERT_CHAT_ID` bilan
  bitta oila. ⚠️ Nuqson ayni paytda **eng sodiq xaridorda** chiqardi: kam
  xarid qilganda hammasi to'g'ri ko'rinardi.

  **2) YECHIM — BAZA AGREGATI** (`routes/seller.js` → yangi `buyerStats()`,
  `/api/me` javobiga `stats`). `count(DISTINCT o.id)` — oddiy `count(*)`
  EMAS: `order_items` bilan birikma har MAHSULOT uchun qator beradi, ya'ni
  3 mahsulotli bitta buyurtma «3 ta buyurtma» bo'lib ko'rinardi (bu
  pglite'da nazorat sinovi bilan tasdiqlandi — `count(*)` 7 chiqardi,
  `DISTINCT` 5). `refunded` ATAYLAB sanalmaydi — klientdagi qoida bilan
  AYNI: unvon xaridni mukofotlaydi, mojaroni emas.
  ⚠️ **♡ soni ataylab serverga KO'CHIRILMADI** — u ro'yxatning O'ZIDAN
  sanaladi, chunki xaridor OCHA OLADIGAN ro'yxat bilan mos bo'lishi shart:
  bazada 12 ta ♡ bo'lib katalogda 9 tasi qolgan bo'lsa (e'lon
  o'chgan/yashiringan), karta «12» deb turib ro'yxat 9 ta chiqarardi.
  Buyurtma va rulonda bunday chegara yo'q — ular hech qayerda ro'yxat
  bo'lib chizilmaydi.
  ⚠️ **So'rov yiqilsa `/api/me` QULAMAYDI** — `stats` `null` qaytadi va
  klient mahalliy hisobga tushadi (aniqroq bo'lmasa ham, o'ylab topilgan
  raqam emas). Xato YUTILMAYDI: `console.error('buyerStats xatosi:', ...)`
  — birinchi argument o'zgarmas kalit (alert guruhlash qoidasi).

  **3) 🔴 `db/027_orders_buyer_index.sql` — YANGI.** Tekshirilganda
  ma'lum bo'ldi: `orders` da `tg_user_id` bo'yicha indeks **HECH QACHON
  bo'lmagan**, holbuki xaridor kanalidagi eng issiq ikki so'rov aynan shu
  ustundan boshlanadi — `/api/orders` (**Mini App HAR OCHILGANDA**) va endi
  `/api/me` agregati. Ya'ni har ochilishda butun jadval to'liq skanerlanardi.
  Indeks ikki ustunli — `(tg_user_id, created_at DESC)` — shunda
  `/api/orders` dagi `ORDER BY` ham shu indeksdan qanoatlanadi va alohida
  sort bosqichi kerak bo'lmaydi. ⚠️ Mavjud `idx_orders_created` (001) bu
  ishni BAJARMAYDI: u xaridorni ajratmaydi — «indeks bor» degan taxmin
  tekshirilmagan da'vo edi. Bugungi hajmda sekinlik sezilmaydi va **aynan
  shuning uchun ko'rinmay kelgan**: nuqson jadval o'sgani sari yomonlashadi
  va hech qachon «buzildi» degan signal bermaydi.

  **4) SQL HAQIQIY POSTGRES'DA BAJARIB KO'RILDI** (pglite — `test.js`
  SQL'ni bajarmaydi, yashil test «SQL to'g'ri» degani emas): agregat
  `orders=5, rolls=20` berdi, `EXPLAIN` yangi indeksni ishlatdi, backfill
  esa bazadagi mavjud raqamni bosmadi.

- [2026-08-16] **BANNER RASMI VA SHRIFTI TUZATILDI — VA ENG QIMMAT DARS TZ
  NING O'ZIDA CHIQDI.** Founder: «Zo'r faqat rasm sifati xira hamda
  shiriftlar kichkina shularni fix qil. Dizayn uchun tz bersang olib kelman
  kerakli fayllarni» — keyin dizayn paketini keltirdi: «Shularni dizaynga
  ishlat, iloji boricha sifatlisini ishlat». Bu **bugungi IKKINCHI commit**;
  birinchisi (`6d8b56d`) allaqachon deploy bo'lgan.

  **1) SHRIFT.** Sarlavha `clamp(19px, 2.9vw, 34px)` → **`clamp(24px, 3.2vw,
  42px)`**, chip `9→12px` / `11.5→14px`. 🔴 **Yuqori chegara TANLANMADI,
  O'LCHANDI:** founder qarori bo'yicha sarlavha HAR DOIM ikki qatorda
  turishi shart (2026-08-15 bandi) — 26px da eng uzun matn («24/7 buyurtma /
  berishingiz mumkin») UCHINCHI qatorga tushdi, ya'ni 24px chegaraning
  o'zi. Keng ekranda 44px gacha joy bor edi, 42px nafas uchun qoldirildi.
  Kattalashgan sarlavha eski matn zonasiga sig'magani uchun telefonda
  `.ad-copy { right: 35% }` → **`28%`** (matn zonasi 65% → 72%).
  ⚠️ Bu raqam KOSMETIK emas — **rasm TZ si aynan shundan kelib chiqadi**
  (mato endi kadrning o'ng 28% ida boshlanishi kerak), ya'ni CSS va rasm
  brifi bir-biriga bog'langan va biri o'zgarsa ikkinchisi qayta hisoblansin.

  **2) RASM XIRALIGI — SABAB O'LCHANDI, TAXMIN QILINMADI.** Nuqson rasmda
  emas edi: `assets/ads/ad-*.{webp,jpg}` **1200 × 338** — ular **Mini App**
  uchun chizilgan va u yerda ortig'i bilan yetadi (slayd ~358×101 CSS px).
  Sayt slaydi esa ancha katta, ya'ni brauzer o'sha faylni CHO'ZARDI:
  telefonda **1.30x**, retina monitorda **2.08x**. Founder Gemini bilan
  **4800 × 2000** masterlar keltirdi (`design_handoff_sayt_banners`).
  Masterlardan kesish, kichraytirish va WebP'ga o'girish QO'LDA bajarildi
  (`sips` + `cwebp`) — paketdagi TAYYOR kesimlar ishlatilmadi, chunki o'z
  kesimlarimiz yaxshiroq chiqdi (ad-3: 80 KB → 25 KB).
  Natija (brauzerda o'lchandi): cho'zilish **1.30x → 0.98x** telefonda,
  **2.08x → 1.00x** desktopda.

  **TZ da yo'q edi, ish paytida qo'shildi:** har kesim IKKI o'lchamda
  (keng 1400/2240, telefon 900/1800) + `srcset` + `sizes`. Sababi
  o'lchovdan: bitta o'lcham bo'lsa DPR1 noutbuk ham eng katta faylni
  tortardi. Siqilish darajasi ham TANLANMADI, o'lchandi — `q62` dan `q86`
  gacha EKRANDAGI farq 255 dan atigi 1.4–2.2 (1% dan kam), ya'ni yuqori
  sifat faqat baytga tushadi va ko'zga tegmaydi; `q72` olindi.

  ⚠️ **OG'IRLIK RAQAMLARI HISOBOTCHI TOMONIDAN QAYTA O'LCHANDI VA
  TUZATILDI — IKKINCHI COMMIT KETMA-KET.** Sessiyada «DPR2 telefon 46 KB,
  DPR1 noutbuk 78 KB, bitta o'lchamda ~272 KB» deb yozilgan edi. Diskdagi
  baytdan qayta hisoblanganda: **DPR2 telefon 51 KB** (46 emas), DPR1
  noutbuk **79 KB**, va «~272 KB» hozirgi fayllardan UMUMAN chiqmaydi.
  Sabab aniq: birinchi ikki raqam telefon kesimi **o'ngga surilishidan
  OLDIN** o'lchangan — surilgan kadrga ko'proq mato tushdi va fayl
  og'irlashdi, ya'ni raqam noto'g'ri emas, **ESKIRGAN** edi.
  🔴 **Undan muhimi — o'lchanmagan yo'l topildi: DPR3 telefon 231 KB**
  (`ad-2` ning O'ZI 159 KB, paxta to'quv teksturasi boshqa ikkalasidan
  ~4x qimmat). DPR3 — iPhone Pro va ko'p Android flagmani, ya'ni bu
  nazariy yo'l emas. Hech qayerda yozilmagandi. To'liq jadval (o'nlik KB):
  DPR2 telefon 51 · DPR3 telefon **231** · DPR1 noutbuk 79 · DPR2 monitor
  201. `srcset` foydasi shu jadvaldan qayta hisoblandi: kichik o'lchamlar
  bo'lmasa DPR2 telefon 4.5x, DPR1 noutbuk 2.5x ortiq tortardi.
  Raqamlar `index.html` izohida va TZ da TUZATILDI. Bu «hujjatdagi raqam —
  tekshirilmagan da'vo» bandining aynan takrori va u bugun **ketma-ket
  ikkinchi commitda** otildi (kecha «186 KB → 56 KB» yo'l nomi
  yozilmagani uchun chala edi).

  🔴 **3) ENG MUHIM DARS — TZ NING O'ZIDA XATO BOR EDI.** Birinchi urinishda
  telefonda banner **deyarli bo'sh bej quti** bo'lib chiqdi. Sabab TZ da
  yozilgan «telefon kesimi masterning O'RTASIDAN» jumlasi edi va u YOLG'ON:
  kesim ekranga `object-fit: cover` bilan chiziladi, telefon slaydi esa 2:1
  dan TORROQ (375px da 1.56) — ya'ni brauzer kesimning yon tomonlaridan
  YANA ~22% ini oladi. **Ikki kesish ustma-ust tushdi** va mato butunlay
  kadrdan chiqib ketdi. Tuzatish TAXMIN bilan emas: har masterda mato
  qayerdan boshlanishi ustunlarning RANGDORLIGI bilan o'lchandi (ad-1
  77.9%, ad-2 68.0%, ad-3 70.9%) va kesim `S = matoBoshi − 2686` formulasi
  bilan o'ngga surildi (800 / 578 / 717 px). **TZ TUZATILDI** — formula,
  jadval va dizaynerga eslatma yozildi (mato masterning **68–72%** idan
  boshlansin; 78% KECH — ad-1 da maksimal surishda ham mato 28% o'rniga
  ~20% chiqdi). Tuzatilmasa keyingi partiyada AYNAN shu takrorlanardi.
  ⚠️ Dars: **TZ — kod emas, MATN, ya'ni u ham tekshirilmagan da'volar
  saqlaydi.** «Prompt — kod emas, MATN: uni chop etib o'qish kerak»
  bandi bilan bitta oila, faqat bu safar zarar ko'rinadigan bo'lgani
  uchun tez topildi.

  **4) VAQTINCHALIK CHORA OLIB TASHLANDI.** Telefondagi
  `object-position: 62%` — kechagi commitning o'z tuzatishi — O'CHIRILDI:
  u 32:9 rasm uchun yozilgan edi (o'sha kadrdan telefonda enining ~44% i
  ko'rinardi), 2:1 telefon kesimida esa ~78% i ko'rinadi va surish endi
  foyda emas, ZARAR berardi. Kechagi qaror sprint faylida **BEKOR
  QILINGAN** deb belgilandi, o'chirilmadi.

  🔴 **5) FAYL NOMLARI ATAYLAB YANGI** (`ad-1-w-1400.webp`, `ad-1-m-900.webp`
  …), eskisining ustiga yozilmadi. Sabab: `sw.js` rasmlarni `cacheFirst`
  bilan beradi — eski nom ustiga yozilsa qaytib kelgan foydalanuvchi ESKI
  XIRA rasmni ko'rib turardi va yangisi faqat KEYINGI tashrifda kelardi.
  Eski 6 fayl o'chirildi, 15 yangi fayl qo'shildi; havola qolmagani
  tekshirildi. `assets/` deploy `source` ro'yxatida allaqachon bor.
  ⚠️ Serverda eski fayllar QOLADI (deploy nusxalaydi, o'chirmaydi) — ular
  endi hech qayerdan chaqirilmaydi, ya'ni zararsiz, lekin bilib qo'yilsin.

  **QOROVUL — Test 32 ning 5-bandi QAYTA YOZILDI.** Ertalab u sayt va Mini
  App rasmlari **bayt-ma-bayt bir xil** ekanini tekshirardi; sayt o'z
  kesimlariga o'tgach bu shart YOLG'ON bo'lib qoldi. Uni o'sha holicha
  qoldirish testni qizil ushlab turardi, **o'chirib yuborish esa qorovulni
  JIMGINA yo'qotardi** — shuning uchun band almashtirildi: endi sayt
  to'plamining TO'LIQLIGI (3 slayd × 5 fayl = 15), `index.html` dagi
  havolalar va `object-position` vaqtinchalik chorasining QAYTMASLIGI
  tekshiriladi. Ro'yxat qo'lda yozilmaydi — `AD_SLIDES` dan olinadi.
  **UCH mutatsiya bilan sinaldi, uchtasi ham ushlandi.**
  ⚠️ Yo'l-yo'lakay bilib olindi: `style.css` ga tegadigan mutatsiyada
  **Test 16 OLDINROQ otiladi**, ya'ni Test 32 ni sinash uchun hash ham
  birga yangilanishi kerak — bu 2026-08-14 dagi «`app.js` mutatsiyasida
  Test 16 birinchi qulaydi» qarorining `style.css` uchun takrori.

  🔴 **MENING XATOM — OCHIQ YOZILADI.** Mutatsiya sinovidan keyin tozalash
  uchun `git checkout style.css index.html` yozildi va o'sha paytdagi
  **hali commit qilinmagan ish o'chib ketdi** (shrift o'zgarishlari +
  yangi `<picture>` markupi). Hammasi qaytadan yozildi, ya'ni yo'qotish
  yo'q — lekin bu CLAUDE.md dagi **«almashtirishni QO'LGA KIRITMASDAN
  eskisini o'chirma»** qoidasining aynan buzilishi. Qoida `rm -rf` haqida
  yozilgan, `git checkout` esa **o'sha oilaning KO'RINMAYDIGAN a'zosi**:
  u «o'chirish» so'zini ishlatmaydi, «tozalash» dek tuyuladi va zarari
  bir xil. Keyingi mutatsiyalar zaxira nusxa bilan qilindi.

  ⚠️ **OCHIQ QOLGAN QAROR — IKKI YUZDA IKKI XIL MATO.** Sayt endi yangi
  masterlardan, Mini App esa 2026-08-15 dagi eski generatsiyadan oziqlanadi.
  **Kechagi commitning butun maqsadi aynan ularni tenglashtirish edi.**
  Founder'ga ikki marta savol berildi — (a) Mini App ham shu masterlardan
  qayta kesilsinmi (TAVSIYA), (b) eskisida qolsinmi — javob KELMADI, u
  «commit qil, deploy qil» dedi. **Mini App'ga ATAYLAB tegilmadi:** bu
  boshqa yuz va founder tasdiqlamagan (2026-08-13 dagi «mavjud funksiya
  ustiga ikkinchi yo'l qo'shilsa — avval so'raladi» bandining ruhi).
  Savol OCHIQ qoladi va Test 32 ning izohida ham yozilgan.

  🔴 **HISOBOTCHI TOPGAN IKKINCHI BO'SHLIQ — MASTERLAR REPODA YO'Q.**
  TZ ning O'ZIDA «masterlar `docs/dizayn-tizimi/masters/` ga» deb yozilgan,
  amalda esa ular faqat `~/Downloads/design_handoff_sayt_banners/masters/`
  da (3 PNG, **47 MB**). Ya'ni o'sha papka o'chsa yoki kompyuter almashsa
  **kesimlarni qayta yasab bo'lmaydi** va TZ dagi `S = matoBoshi − 2686`
  formulasi shu partiya uchun ishlatib bo'lmas holga keladi — hujjat
  qoladi, manba yo'qoladi. ⚠️ Bu **`sayt-eski/` darsining teskarisi**: u
  yerda papka yolg'on sabab bilan SAQLANIB turgandi, bu yerda esa haqiqiy
  manba hech qayerda saqlanmayapti. 47 MB ni git'ga qo'yish arzon emas,
  shuning uchun qaror founder'ga qoldirildi (varianlar: repoga qo'yish /
  R2 ga yuklash / ataylab saqlamaslik va buni TZ da yozib qo'yish).
  **Bu commitda masterlar QO'SHILMADI** — founder mulki va joyi
  tasdiqlanmagan.

  **SINALGANI: 74 test yashil** (hisobotchi mustaqil qayta yurgizdi —
  `✅ Test` satrlari sanaldi). Brauzerda O'LCHANDI: cho'zilish 0.98x /
  1.00x, tanlangan fayllar to'g'ri (DPR2 telefon → `900w`, DPR2 desktop →
  `2240w`), uchala slayd ko'z bilan ko'rildi (telefon va desktop).
  Konsolda faqat `/api/` 404 lari (lokalda backend yo'q) — regressiya emas.
  ⚠️ **TEKSHIRILMAGANI:** avtomatik almashish (5 s) va silliq surish
  **jonli ko'rilmagan** — brauzer panelida tab `hidden` turadi va u yerda
  `scroll` hodisasi umuman otilmaydi (kechagi yozuvning aynan takrori).
  Kesh: `style.css` 56→**58**, `panel.js` 38→**39**; `script.js` 47 da
  QOLDI — unga tegilmadi.

- [2026-08-16] **SAYTDAGI BANNER MINI APP'NIKI BILAN TENGLASHTIRILDI — VA
  BIRINCHI URINISH YETARLI EMAS EDI.** Founder: «Mini appdagi banner
  dizaynindek webdagini ham o'zgartir, faqat o'lchamlarini mini appdikidek
  qilma, webdagini balandligini 20% ga qisqartir». Birinchi qadamda faqat
  **TUZILISH** ko'chirildi — karusel mexanikasi, klonlar, `scroll-snap` —
  rasm va matn esa saytnikida qoldirildi. Founder buni RAD ETDI: «dizayni
  hamda matnlarini ham o'zgartirmabsanu, + 10% balandligini katta qilgin».
  🔴 **Dars «shunday qilgin» ikki xil o'qilishi bandining (2026-08-13) TESKARI
  yuzi.** O'sha bandda «shaklni ko'chirish» ORTIQCHA ish tug'dirgan edi; bu
  yerda esa aksincha — «dizaynindek» faqat MEXANIKA deb o'qilib, YETMAGAN
  ish chiqdi. Ikkalasida ham ildiz bitta: buyruqning qamrovi
  BOSHLANISHIDA aniqlanmagan. To'g'ri qadam — nusxa olishdan oldin «nimasi
  ko'chadi: mexanikami, ko'rinishmi, matnmi?» deb SO'RASH.

  **YAKUNIY HOLAT (ikkinchi qadamdan keyin):**
  (1) **Karusel.** Slaydlar endi ustma-ust `opacity` bilan emas, YONMA-YON:
  `.ad-banner` ning O'ZI gorizontal skroller (`overflow-x` + `scroll-snap`).
  Surishni brauzer qiladi, qo'lda yozilgan `touchstart`/`touchend` surish
  kodi O'CHDI. Cheksiz aylanish ikki chetdagi KLON bilan; klonlar HTML da
  emas, `mountAdBanner()` da yasaladi — ya'ni bir xil matn manbada uch
  marta emas, BIR marta yoziladi va JS ishlamasa banner o'qiladigan holda
  qoladi (faqat aylanmaydi).
  (2) **Nuqtalar, ichki tugma va kichik matn (`ad-sub`) o'chdi** — Mini
  App'dagidek: ikki qatorli sarlavha + oxirgi so'zdan keyin chip.
  (3) **Rasm va matn Mini App'niki:** ad-1/2/3 (atlas / paxta-adras / ikat),
  «Matolarni AI bilan jonlantiring» + SINAB KO'RISH, «24/7 buyurtma
  berishingiz mumkin» (chipsiz), «Bepul yetkazib berish» + ILK 3 TA
  BUYURTMA. Ikkala tilda ham `AD_SLIDES` bilan AYNAN bir xil.
  (4) **Oq parda (`.ad-shade`) O'CHDI.** Rasmlarning chap 65% i brief
  bo'yicha CHIZILGANDA allaqachon ochiq va tinch — parda o'sha joyni yana
  bir marta oqartirib, rasmni xiralashtirardi.
  (5) **Balandlik ikki qadamda:** 220→176 (−20%) →**193.6**px;
  26vw→20.8→**22.88vw**; 400→320→**352**px; telefonda 250→200→**220**px.
  O'lchandi: hozirgisi eskisining **0.88** i (0.8 × 1.1).

  🔴 **RASMLAR `assets/ads/` GA NUSXALANDI — VA NUSXA MAJBURIY.** Landing
  HTML'i `telegram-app/...` yo'liga ishora QILA OLMAYDI: serverda o'sha
  papka `mini-app/` deb ataladi va havola 404 bo'lardi, CI esa ikkalasini
  ALOHIDA qadam bilan chiqaradi. Xavf `BTS_POINTS` bilan bitta oila — ikki
  nusxa JIMGINA ajralib ketadi: Mini App'da rasm yangilanadi, saytda eskisi
  qolaveradi, ikkala sahifa ham ochiladi, konsol toza, faqat ikki yuzda ikki
  xil banner turadi. **Qorovul — Test 32 ga 5-band:** ikki nusxaning
  `sha256` i solishtiriladi, ro'yxat `AD_SLIDES` dan olinadi (qo'lda
  yozilmaydi, to'rtinchi slayd qo'shilsa avtomatik qamraladi). **Ikki
  mutatsiya bilan sinaldi — fayl o'zgartirildi / o'chirildi — ikkalasi ham
  ushlandi.** `assets/` deploy `source` ro'yxatida ALLAQACHON bor (tekshirildi
  — `.github/workflows/deploy.yml`), ya'ni yangi ildiz papkasi tuzog'i bu
  safar otilmadi.

  🔴 **TELEFONDA RASM KESILISHI O'LCHANDI VA TUZATILDI.** Mini App rasmi
  32:9, sayt slaydi undan BALAND — 375px da `object-fit: cover` rasm enining
  atigi **~44%** ini kadrga sig'diradi. Standart `center` da oyna 28–72% ga
  tushadi va o'ngdagi mato burmasi (slaydning butun xarakteri) KESILIB
  ketardi: banner tekis bej quti bo'lib ko'rinardi. Birinchi urinishda aynan
  shunday chiqdi va buni **SCREENSHOT ko'rsatdi**. `object-position: 62%`
  ga surildi (oyna 34.8–78.7%) — chapda matn zonasi ochiq qoladi, o'ngdan
  mato o'z rangi bilan kiradi; uchala slaydda ham ko'z bilan tekshirildi.

  ⚠️ **1-SLAYD AI NI OCHMAYDI, KATALOGGA OLIB BORADI — ATAYLAB.** Saytda AI
  EKRANI YO'Q: AI bloki har mahsulotning o'z sahifasida yashaydi
  (`aiSection` → `detailHtml`), ya'ni AI ga yagona yo'l mato tanlashdan
  o'tadi va banner aynan o'sha qadamga olib boradi. Mini App'da esa u
  `tab('ai')` ga tushadi. «AI ochiladi» deb ko'rsatish SOXTA TUGMA bo'lardi
  («o'ylab topilgan raqam» qoidasining xatti-harakatdagi ko'rinishi).
  Founder'ga aytildi.

  ⚠️ **Telegram slaydi o'chdi, botga yo'l esa YO'QOLMADI** — pastdagi
  «CTA — Telegram bot» bo'limi joyida. `tgOrder` kaliti O'SHA bo'lim uchun
  saqlab qolindi: banner matnlari almashtirilganda u bilan birga o'chib
  ketishiga oz qolgan edi (`tgOrderSub` va `viewCatalog` esa haqiqatan
  ortiqcha bo'lgani uchun o'chdi).

  **QOLGAN QARORLAR:**
  - **Slayd `<button>` QILINMADI:** sarlavha `<h2>` va u `<button>` ichida
    yaramaydi (tugma faqat phrasing content oladi), sarlavhani tashlash esa
    landingning SEO matnini kamaytirardi — HTML dagi o'zbekcha matn bu
    sahifada qidiruv ko'radigan yagona tarkib. Bosish yuzasi — ustidagi
    shaffof `.ad-hit`; natija bir xil, butun slayd bosiladi.
  - **Sarlavhadagi qator uzilishi `\n` + `white-space: pre-line`** bilan.
    `<br>` YARAMAYDI: `applyLang()` tarjimani `textContent` bilan yozadi,
    ya'ni teg HARF bo'lib chiqib qolardi (Mini App'da `<br>` turadi — farq
    chizish usulidan, uslubdan emas).
  - **`behavior: 'smooth'` faqat brauzer bilganda beriladi** (`AD_SMOOTH`).
    2026-08-13 dagi `mountPdMedia` darsi: qo'llab-quvvatlanmagan muhitda
    so'rov JIMGINA yutiladi — u yerda nuqta o'lik tugmaga aylangandi, bu
    yerda esa karusel umuman almashmay qolardi.
  - **Klon ekran o'quvchisiga ko'rinmaydi va Tab bilan tanlanmaydi**
    (`aria-hidden`, `.ad-hit` `tabIndex = -1`) — aks holda bir xil sarlavha
    ikki marta o'qilardi va Tab bir joyda ikki marta to'xtardi.

  **RASM OG'IRLIGI — RAQAM HISOBOTCHI TOMONIDAN QAYTA O'LCHANDI VA
  ANIQLASHTIRILDI.** Sessiyada «186 KB → 56 KB» deb aytilgan; qayta
  o'lchovda bu raqam faqat **TELEFON** yo'liniki bo'lib chiqdi (eski
  1-slayd `srcset` da ikki nusxa bor edi va brauzer telefonda 800px
  variantini olardi: 50858 + 57306 + 78018 = 186 182 B). **Desktopda esa
  eski yo'l 132732 + 57306 + 78018 = 268 056 B = 268 KB (o'nlik KB — telefon raqami «186 KB» ham shu birlikda)** edi. Yangisi
  ikkala holatda ham bir xil: 19418 + 22516 + 13688 = **55 622 B ≈ 56 KB**.
  Ya'ni haqiqiy yutuq telefonda **3.3x**, desktopda **4.8x**. Raqam
  noto'g'ri emasdi — u YO'L NOMI YOZILMAGANI uchun chala edi
  («hujjatdagi raqam — tekshirilmagan da'vo» bandi).
  ⚠️ Eski `Photo/Main/banner-mato*` fayllari endi hech qayerda
  ishlatilmaydi (tekshirildi), lekin `Photo/` ga TEGILMADI — rasmlar
  founder mulki. `Photo/textile/d7928cec…` esa hamon KERAK: u `tx-4402`
  kartochkasida ishlatiladi (`index.html`), ya'ni bannerdan chiqqani bilan
  yetim qolmadi.

  **TEKSHIRILGANI:** `node server/test.js` — **74 test yashil** (hisobotchi
  mustaqil qayta yurgizdi, `✅ Test` satrlari sanaldi). Brauzerda
  O'LCHANDI: slayd balandligi eskisining 0.88 i (1280px va 375px da),
  `<picture>` balandligi slayd balandligiga TENG (blok yopilmagan —
  CLAUDE.md `<picture>` bandi), matn `.ad-copy` dan chiqib ketmagan,
  sahifada gorizontal skroll yo'q, qo'shni slayd cheti telefonda 6px /
  desktopda 14px. Cheksiz aylanish beshta pozitsiyada (−1→2, 3→0, qolgani
  joyida), bosish beshta slaydda ham (klonlarda ham) — `adGoCatalog`
  chaqirildi. Rus tilida: ikkala tilda ham sarlavha 2 qator, chip o'chib
  ketmadi, klonlar ham tarjima bo'ldi.
  ⚠️ **TEKSHIRILMAGANI — ATAYLAB OCHIQ YOZILADI:** (a) **avtomatik
  almashish (5 s) va silliq surish jonli ko'rilmagan.** Brauzer panelida
  tab `hidden` turadi, u yerda `scroll` hodisasi UMUMAN otilmaydi va
  `behavior: 'smooth'` bajarilmaydi — o'lchandi: 353→353 px, 1500 ms.
  Mantiq qo'lda chaqirib sinaldi, ya'ni KOD to'g'ri, XATTI-HARAKAT esa
  jonli saytda hali ko'rilmagan (bu «tezlik o'lchash usuli» xotira
  yozuvining aynan takrori). (b) Jonli lolamarket.uz da hali ko'rilmagan —
  deploy faqat statik, servis restarti kerak emas.

- [2026-08-15] **REKLAMA BANNERI QAYTA DIZAYN QILINDI — YANGI FON RASMLARI,
  YANGI TIPOGRAFIYA VA KARUSEL MEXANIKASI.** Banner bir kun oldin
  (`2026-08-14`, quyidagi yozuv) qo'shilgan edi; bu sessiyada founder bilan
  LOKALDA bosqichma-bosqich ko'rib chiqildi va har qadam uning tahriri bilan
  yopildi. **Uchta 2026-08-14 qarori shu yerda BEKOR QILINDI** — quyida
  «BEKOR QILINGANLAR» bo'limida, chunki eskirgan qaror o'chirilmasa kelajakda
  qaytib keladi.

  **1) Fon rasmlari almashtirildi (dizayn handoff).** Dizaynerga brief
  yozildi — `docs/dizayn-tizimi/banner-dizayn-brief.md` (tuval, zonalar,
  uch slaydning rang kayfiyati, qilinmaydiganlar ro'yxati). Yangi rasmlar
  Gemini bilan chizilgan mato fotosuratlari: atlas / paxta-adras / ikat.
  **O'lchandi, hujjatdan ko'chirilmadi:** uchala rasm ham 1200×338,
  WebP 13–22 KB, JPEG 26–40 KB (brief chegarasi ≤ 55 KB).

  **2) Fon `background-image` EMAS, `<picture>`:** WebP asosiy, JPEG zaxira —
  brauzer o'zi tanlaydi, eskisi JPEG ga tushadi. Yig'indida 102 KB → 56 KB
  (~1.8x yengil, uchala slayd birga). `AD_SLIDES.img` endi KENGAYTMASIZ asos
  (`assets/ads/ad-1`), `.webp`/`.jpg` ni chizish kodi o'zi qo'shadi — yangi
  slayd qo'shilganda ikki yo'lni alohida yozish shart emas.
  ⚠️ `.ad-slide picture, .ad-slide img { display: block; … }` qoidasi
  BIRGA qo'shildi — CLAUDE.md dagi «`<picture>` blok balandligini nolga
  tushiradi» bandi (loyihada UCH marta tishlagan naqsh).

  **3) Tipografiya handoff bo'yicha:** chapdan 16px, sarlavha 17px/1.1,
  yorliq 8px/0.1em. Matn zonasi chap 65% da qoladi (o'ng 35% da mato burmasi).

  **FOUNDER TAHRIRLARI (ketma-ket, lokalda ko'rib):**
  (a) **Sarlavha HAR DOIM ikki qator** (`<br>` qo'lda yoziladi) — uch slayd
  bir xil balandlikda tursin, biri bir qator boshqasi ikki qator bo'lib
  «sakramasin».
  (b) **Qo'shimcha so'z sarlavha USTIDA emas** — sarlavhaning OXIRGI
  SO'ZIDAN KEYIN, o'sha qatorda kichik kartochka (chip) bo'lib chiziladi,
  foni urg'u rangida, matni oq (`eyebrow` → `tag`). Founder aynan shunday
  dedi: «berish so'zidan keyin joylashtir».
  (c) **1-slayd yorlig'i** `AI xizmati` → **`Sinab ko'rish`** (ru
  `Попробовать`), sarlavhasi `Matolarni AI bilan / jonlantiring`
  (ru `Оживите ткани / с помощью AI`).
  (d) **Pastdagi 3 ta nuqta va strelka BUTUNLAY olib tashlandi.**
  (e) **Banner KARUSEL bo'ldi** («qolgan bannerlar yonida ko'rinib tursin»):
  slaydlar yonma-yon, joriysi markazda, qo'shnilarining cheti ko'rinadi.
  (f) **Qo'shni slayd cheti IKKI MARTA kamaytirildi:** 18px → 10px → 6px
  (founder: «chalg'itadi», keyin «yana ozgina»). Joriy slayd sahifaning
  boshqa bloklari bilan bir chiziqda (343px).

  **KARUSEL MEXANIKASI — surishni BRAUZER qiladi, JS emas.** `.ad-banner`
  gorizontal skroller (`overflow-x: auto` + `scroll-snap`), ya'ni barmoq
  ortidan yuradi va inersiya bepul keladi. Cheksiz aylanish uchun ikki chetga
  KLON qo'yildi (`[n-1, ...haqiqiy, 0]`), skroll to'xtaganda haqiqiysiga
  sezdirmasdan sakraydi. ⚠️ To'xtash `scrollend` bilan EMAS, `scroll` +
  **120 ms tinchlik** bilan aniqlanadi: `scrollend` iOS WebView'da YO'Q va
  unga tayanilsa karusel aynan Telegram ichida (ya'ni yagona haqiqiy
  muhitda) klonda qotib qolardi. Har slayd O'ZI tugma, `data-arg` da
  HAQIQIY indeks (klon ham aslining indeksini olib yuradi). Avto-almashish
  5 s qoldi, barmoq tekkanda to'xtaydi va qo'yib yuborilganda qaytadan
  boshlanadi.

  **BEKOR QILINGANLAR (2026-08-14 dagi qarorlar, endi kuchda emas):**
  - `touch-action: pan-y` → **`pan-x pan-y`**. Sabab o'zgardi: ilgari
    gorizontalni JS boshqarardi, endi BRAUZER — faqat `pan-x` sahifa
    vertikal skrollini o'ldiradi, faqat `pan-y` esa karuselni.
  - **Nuqtalar va ular uchun 44px tegish maydoni** — element o'zi yo'q.
  - **`adSwiped` (surishni bosishdan ajratish, 45px chegara)** — endi kerak
    emas va bu kod qisqartirish emas, MEXANIKA farqi: surish brauzer skrolli,
    ya'ni surishdan keyin `click` UMUMAN kelmaydi.
  - `aspect-ratio: 32/9` **`.ad-banner` dan `.ad-slide` ga ko'chdi**
    (nisbat slaydniki), `flex: none` esa skrollerda QOLDI — bosh sahifa flex
    ustuni bolani baribir siqadi.

  🔴 **SINOV PAYTIDA TUTILGAN NUQSON — VA UNI KO'Z KO'RMADI.** CSS izohida
  ortiqcha `*/` qolib ketgan va `.ad-banner` qoidasi BUTUNLAY o'chib
  qolgandi. Ekranda banner «shunchaki biroz boshqacha» ko'rinardi, konsolda
  xato yo'q edi. Topilishiga yagona sabab — `getBoundingClientRect()` bilan
  O'LCHASH. Bu CLAUDE.md dagi flex bandining aynan takrori: «ko'z bilan
  qarash yetarli emas», va u endi CSS izohining o'ziga ham taalluqli.

  **QOROVUL — Test 32 kengaytirildi:** `.webp` VA `.jpg` ikkalasi diskda
  borligi, `AD_SLIDES.img` kengaytmasiz ekani, `<picture>` chizilishi,
  `.ad-slide picture { display: block }` borligi, `flex: 0 0 100%`,
  `scroll-snap`, klon tartibi va `data-arg`. Kesh: `styles.css?v=35→36`,
  `app.js?v=95→96` (`telegram-app/index.html`), Test 16 jadvali birga.

  **TEKSHIRILGANI:** `node server/test.js` — **74 test yashil** (hisobotchi
  mustaqil qayta yurgizdi). Lokal brauzerda 375px mobil kenglikda: uchala
  slayd ham ko'rildi, o'lchamlar `getBoundingClientRect` bilan o'lchandi,
  cheksiz aylanish IKKI tomonga sinaldi, slayd bosilganda AI ekraniga
  o'tishi va qaytganda banner 1-slayddan boshlanishi tekshirildi.
  ⚠️ **TEKSHIRILMAGANI:** jonli Mini App'da (Telegram WebView ichida) hali
  KO'RILMAGAN — ya'ni `scrollend` yo'qligi bo'yicha qaror TO'G'RI, lekin
  120 ms `settle` ning haqiqiy iOS inersiyasi bilan xatti-harakati faqat
  brauzerda o'lchangan.
  ⚠️ **Brief ENDI QISMAN ESKIRGAN:** unda o'ng 35% «strelka + nuqtalar
  turadigan joy» deb yozilgan, ular esa olib tashlandi (zonaning o'zi
  qoladi — u yerda mato burmasi turadi). Brief ISH MATERIALI, kod esa
  haqiqat manbai — `reklama-banner-spec.md` bilan bitta holat.
  ⚠️ **OCHIQ QOLDI:** 2-slayd matni hamon «24/7 buyurtma berishingiz
  mumkin» — founder bu bo'yicha javob bermadi, shuning uchun O'ZGARTIRILMADI.

- [2026-08-14] **QOLDIQDAGI UCHTA OCHIQ BAND YOPILDI — VA UCHALASI HAM BITTA
  OILADAN: «kod bor, lekin u JIM».** Founder yangi funksiya takliflarining
  HAMMASINI rad etdi («hech qaysi — faqat uchta bandni yopamiz»), ya'ni bu
  sessiyada bitta ham yangi ekran, tugma yoki maydon qo'shilmadi. Qo'shilgan
  yagona narsa — KO'RINISH.

  🔴 **ENG QIMMATLI NATIJA — IKKINCHI BANDNING TA'RIFI NOTO'G'RI BO'LIB
  CHIQDI VA BU ISH BOSHLANISHIDA TUTILDI.** QOLDIQ xotirasida deep-link
  manbasi «23/23 BO'SH — nuqson» deb turgandi. Tekshirilganda boshqacha
  chiqdi: `sprint-4.md` ning O'ZIDA (yuqoridagi `db/025` yozuvi, (d) bandi)
  o'z qo'limiz bilan «manba belgisining O'ZI jonli sinalmagan: haqiqiy
  `t.me/<bot>?start=guruh_ipak` havolasi hali bosilmagan» deb yozilgan.
  Ya'ni **bo'sh ustun KUTILGAN natija edi — havola hali yaratilmagan.**
  Buzilgan narsa yo'q, ISHLATILMAGAN narsa bor edi. Tekshirilmasdan ish
  boshlanganda mavjud va to'g'ri ishlaydigan mexanizm «tuzatilardi» — bu
  «hujjatdagi raqam — tekshirilmagan da'vo» qoidasining aynan o'zi,
  `photo_url` va «`/start` hisoblagichi yo'q» holatlari bilan bitta oila.

  **1-BAND — KO'RINMAYDIGAN SOTUVCHI ENDI QICHQIRADI** (`lib/self-check.js`).
  Bazada `role='seller'` + `sellers` yozuvi bor odam `SELLER_TG_IDS` da
  bo'lmasa kabinet OCHILMAYDI va buni **hech narsa ko'rsatmasdi**:
  `currentSeller` rolni jimgina `buyer` ga tushiradi, endpoint 403 beradi,
  jurnalda xato yo'q — sotuvchi «ilova buzilibdi» deb o'ylab odatda umuman
  yozmaydi. Bu holat 2026-08-13 da CLAUDE.md ga 🔴 belgisi bilan yozilgan
  edi va **yozilgani uni ko'rinadigan qilmadi.** Yangi `hiddenSellers()` +
  `runSellerCheck()`: soatiga bir marta bazani so'raydi va topilsa
  `console.error` orqali Telegram alertiga **AYNAN qaysi ID yetishmayotganini**
  yozadi (ID bo'lmasa founder uni qayerdan olishni bilmasdi).
  ⚠️ **Tekshiruv QAYTA YOZILMADI — `sellerAllowed()` chaqiriladi.** Ro'yxat
  shartini bu yerga ko'chirish `authUser()` naqshining o'zi bo'lardi: qoida
  ikki joyda yashaydi, biri o'zgarganda ikkinchisi jimgina eskiradi.
  ⚠️ Birinchi tekshiruv **30 soniya kechiktiriladi** — fayl qorovulidan
  farqli o'laroq bu bazaga boradi va ishga tushish onida pool tayyor
  bo'lmasligi mumkin; kechiktirilmasa har restartda «qorovul ishlamadi»
  alerti chiqib, haqiqiy signal shovqin ostida qolardi.

  **2-BAND — JIM RAD ETISH BUZILDI** (`routes/webhook.js`). Band noto'g'ri
  ta'riflangan bo'lsa ham, tekshirish HAQIQIY nuqson topdi: shakl qat'iy
  (`[a-z0-9_]{2,32}`), **Telegram esa deep-link'da katta harf va chiziqchaga
  RUXSAT beradi.** Ya'ni `?start=Instagram` havolasi ISHLAYDI — odam botga
  kiradi, manba jimgina yo'qoladi va o'sha kanal panelda «nol berdi» bo'lib
  ko'rinadi. Raqam yo'q emas, **YOLG'ON** — reklama byudjeti aynan shunga
  qarab taqsimlanardi. Yangi `manbaAniqla()` o'rami: tozalaydi va rad
  etilganini alertga chiqaradi. Payloadsiz `/start` (odatdagi kirish) va
  `web_...` (saytga kirish kodi) ATAYLAB jim — aks holda har kirish alert
  yuborib tomni to'ldirardi.
  ⚠️ **INSERT parametri ham tuzatildi:** ilgari `manbaBelgisi(startParam)`
  chaqiruv joyida hisoblanardi; endi natija `manba` o'zgaruvchisiga olinadi
  va Test 27 **tozalangan qiymat bazaga borishini alohida** tekshiradi —
  chaqiruv borligi yetarli emas edi.

  **3-BAND — AI QAYTA URINISHI KO'RINADIGAN BO'LDI** (`lib/ai.js`). Kod
  2026-08-13 dan ishlaydi va Test 14q uni soxta javoblar bilan isbotlaydi;
  isbotlanmagani JONLI holat edi. 🔴 **U hech qachon isbotlana OLMASDI,
  chunki tsikl butunlay JIM ishlardi:** bo'sh javob kelib keyin rasm
  chizilsa, foydalanuvchi ham, jurnal ham, alert ham hech narsa ko'rmasdi —
  ya'ni band kod tuzatilmaguncha MANGU ochiq qolardi. Endi bo'sh javobdan
  keyin rasm kelsa `console.error` («qayta urinish yordam berdi — kuzatuv,
  nuqson emas»), urinishlar orasidagi tafsilot esa `console.log`.
  ⚠️ `console.error` ATAYLAB, garchi bu nuqson bo'lmasa ham: alert — bizdagi
  yagona ko'radigan ko'z, `console.log` esa journalctl'da o'qilmay yotadi.
  Birinchi urinishdagi muvaffaqiyat esa JIM — har rasm alert yuborsa tom
  to'lardi (`ALERT_CHAT_ID` oilasi teskari tomondan).

  🔴 **SESSIYANING ENG MUHIM DARSI QOROVULNING O'ZIDA TOPILDI.** Deep-link
  qorovulining BIRINCHI varianti manba kodidan MATN qidirardi
  (`console.error('deep-link...` borligini). Mutatsiya sinovida chaqiruv
  oldiga `if (false)` qo'yilganda **matn joyida qolgani uchun test YASHIL
  qoldi** — ya'ni qorovul o'zi qo'riqlayotgan narsani qo'riqlamasdi. Shuning
  uchun ogohlantirish alohida `if` dan **qiymat qaytaradigan O'RAM** ichiga
  ko'chirildi va test MATNNI emas XATTI-HARAKATNI sinaydigan qilindi
  (`manbaAniqla` ni haqiqatan bajaradi, `console.error` ni ushlaydi). Bu
  Test 3f dagi «o'ramning NOMIGA ishonish yetarli emas, ichi ochib
  ko'riladi» darsining takrori — ya'ni **hujjatlangan tuzoq yana tishladi.**

  **SINALGANI: 74 test yashil** (73 → 74). **12 mutatsiya bilan sinaldi** —
  birinchi urinishda 11/12, yuqoridagi teshik tuzatilgandan keyin **12/12**.
  Qorovullar: **Test 35 YANGI** («Ko'rinmaydigan sotuvchi qichqiradi»,
  6 band — topish, jim qolish, `JOIN` sharti `requireSeller` bilan bir xil,
  `sellerAllowed` chaqirilishi, alert matnida ID, `install()` da rejaga
  qo'yilishi); **Test 27 kuchaytirildi** (jim rad etish + INSERT ga
  tozalangan qiymat); **Test 14q kuchaytirildi** (5-band: qayta urinish
  ko'rinishi + birinchi urinishda jimlik). `npx eslint` — 0 xato.

  **Frontend fayllariga TEGILMADI va bu TEKSHIRILDI, taxmin qilinmadi** —
  `?v=` kesh raqamlari oshirilmadi, chunki oshiriladigan fayl o'zgarmagan
  (Test 16 yashil). Yangi migratsiya YO'Q. Hujjat: **`docs/manba-havolalari.md`
  YANGI** — havola shakli, kanal ro'yxati jadvali, birinchi teginish qoidasi
  va uchidan-uchigacha tekshirish buyruqlari; jadval bo'sh emas, u
  «qaysi kanalga qaysi havola berilgan» savolini hujjatsiz qoldirmaydi.

  🔴 **HALOL CHEGARA — UCHALA BAND HAM FOUNDER QO'LIDA YOPILADI, KODDA
  EMAS.** Bu ish nuqsonni KO'RINADIGAN qildi, SODIR BO'LGANINI emas:
  (a) `db/025` production'da qo'llanganini tasdiqlash kerak
  (`\d users | grep src`) — qo'llanmagan bo'lsa har `/start` da foydalanuvchi
  bazaga UMUMAN yozilmayapti va manba ham, hisob ham to'xtagan;
  (b) deploy'dan keyin server O'ZI yuboradigan alertdagi ID `.env` →
  `SELLER_TG_IDS` ga ko'chirilsin + servis restarti — bazada 1 sotuvchi bor
  va u kabinetni HOZIR ko'rmayapti;
  (c) bitta haqiqiy deep-link havolasi bosilib `src` yozilishi o'lchansin.
  ⚠️ `server/` CI orqali chiqmaydi — rsync va restart founder zimmasida
  (deploy qoidasi), ya'ni push qilinishining o'zi hech narsani yoqmaydi.
  Batafsil: manba bandi — `sprint-7.md`, AI bandi — `sprint-10.md`.

- [2026-08-14] **SEVIMLI MATOLAR ENDI BAZADA — ♡ ilova yopilgandan keyin ham
  qoladi** (founder qarori: «sevimlilarni bazaga saqlaydigan qilamiz»).
  🔴 **Bu yozuvning eng muhim qismi funksiya emas, NUQSON QAYERDA
  YASHIRINGANI:** ♡ tugmasi AYNI KUNI tuzatilgan edi (yuqoridagi yozuv,
  4/15 → 15/15), ya'ni band «bajarildi» deb yopilgandek ko'rinardi. Lekin
  tugma ortidagi VA'DA hamon bajarilmasdi: `S.liked` FAQAT brauzer
  xotirasida yashardi — Mini App yopilishi bilan saqlangan mato yo'qolardi
  va boshqa qurilmada «Saqlangan matolar» ekrani BO'SH chiqardi. Ya'ni
  birinchi tuzatish nuqsonni yo'qotmadi, **bir qavat pastga surdi**:
  founder shikoyat qilgan naqshning o'zi («tugma ishlagandek tuyulib,
  natijasi yo'q») endi ko'rinmaydigan joyda davom etardi. Dars: **«tugma
  bor» bilan «tugma va'dasini bajaradi» ikki xil band.**

  **`db/026_favorites.sql`** — `user_favorites (tg_user_id, product_id,
  created_at)`, `PRIMARY KEY (tg_user_id, product_id)` va `products` ga
  `FK ... ON DELETE CASCADE` + `(tg_user_id, created_at DESC)` indeksi.
  Migratsiya O'ZINI tekshiradi (`db/022` naqshi): takroriy ♡ bitta qator
  berishi va soxta mahsulot id rad etilishi migratsiya ichida SINALADI.
  ⚠️ **Kalit `tg_user_id`, `users.id` EMAS** (`db/016`, `db/019` bilan bir
  xil tanlov): `users.id` ga FK qo'yilsa har yozuvdan oldin upsert kerak
  bo'lardi — bitta atomik `INSERT ... ON CONFLICT` o'rniga ikkita yozuv va
  yana bitta poyga oynasi. **`products` ga esa FK BOR va bu ziddiyat
  emas:** mahsulot id si MIJOZDAN keladi va o'ylab topilgan bo'lishi
  mumkin, ya'ni uni bazaning o'zi rad etsin — validatsiya ikki joyda
  takrorlanmasin.
  ⚠️ **E'lon yashirilganda (`status <> 'published'`) yozuv QOLADI** —
  sotuvchi matoni vaqtincha yashirib qayta ochishi mumkin, xaridorning
  tanlovi uning aybi bilan o'chmasin; ro'yxat chizilganda klient baribir
  katalog bo'yicha filtrlaydi, ya'ni yashirilgan mato ko'rinmaydi, lekin
  qaytganda o'z joyida turadi.

  **`GET/POST /api/favorites`** (`server/routes/profile.js`). Kimlik
  `requestUser()` dan — `authUser()` dan EMAS, garchi ♡ hozircha faqat Mini
  App'da bo'lsa ham: bu naqsh loyihada IKKI marta buzilgan (bahs ochish, AI
  rasmi) va ikkalasida ham sayt xaridori JIMGINA 401 olgan, ya'ni endpoint
  boshidanoq ikkala kanalni bilsin — saytga ♡ qo'shilganda bu yerga qaytib
  kelish shart bo'lmasin. **O'qish `/api/me` ga QO'SHILMADI** (ataylab):
  ro'yxat o'nlab id bo'lishi mumkin, `/api/me` esa har profil ochilishida
  chaqiriladi — birlashtirilsa profil ekrani sevimlilar uzunligiga bog'liq
  bo'lib qolardi.
  ⚠️ **`liked` — ANIQ bayroq, «teskarisiga o'zgartir» EMAS:** tez ikki
  bosishda yoki ikki qurilma bir vaqtda yozganda toggle natijasi bosish
  TARTIBIGA bog'liq bo'lardi; aniq holat bilan yozuv idempotent.
  ⚠️ **FK buzilishi (`23503`) ALOHIDA ushlanadi va jim 404 qaytaradi** —
  u MIJOZ xatosi, server nosozligi emas. `console.error` ga tushirilsa
  Telegram alertiga chiqib, bitta qiziquvchan mijoz alert tomini
  to'ldirib yuborardi (`ALERT_CHAT_ID` bandi bilan bitta oila).

  **Klient (`telegram-app/app.js`):** ekran DARROV o'zgaradi, server
  ORTIDAN yetadi — ♡ bir bosishlik ish va tarmoqni kutib turgan tugma
  «ishlamadi» deb o'qiladi. 🔴 **Lekin YOLG'ON ko'rsatilmaydi:** server rad
  etsa yoki tarmoq yiqilsa holat ORQAGA qaytariladi va xato AYTILADI —
  aks holda xaridor saqlanmagan matoni saqlangan deb o'ylab yurardi
  (jimgina yolg'on, CLAUDE.md). Kimlik yo'q bo'lsa server umuman
  chaqirilmaydi va ♡ xotirada qolaveradi: 401 ni xatoga aylantirish
  «tugma buzuq» taassurotini berardi.
  ⚠️ **`localStorage` ATAYLAB ishlatilmadi** — `pickup_point` darsi: ikkita
  haqiqat manbai bo'lsa, boshqa qurilmada olib tashlangan sevimli bu yerda
  JIMGINA tirilardi. Manba bitta — baza; server javob bermasa ro'yxat bo'sh
  qoladi (o'ylab topilgan mazmun ko'rsatilmaydi).

  **Qorovul — Test 33**, uch xavfni qamraydi va uchalasi ham loyihada
  ALLAQACHON ro'y bergan naqshlar: `authUser()` ga qaytish, optimistik UI
  yolg'on qolishi, `localStorage` ning ikkinchi manba bo'lib tanlovni
  tiriltirishi. Test klient funksiyasini BAJARADI (matn skanerlamaydi):
  soxta server javoblari bilan uch holat — qabul, rad, tarmoq yiqilishi.
  **9 mutatsiya bilan sinaldi, 9 tasi ham ushlandi.**
  ⚠️ **QOROVULNING O'ZIDA TESHIK TOPILDI (bu sessiyada UCHINCHI marta —
  Test 29 va Test 30 dan keyin):** `loadFavorites()` chaqiruvi qidirilganda
  naqsh funksiyaning O'Z SARLAVHASIGA mos kelardi, ya'ni chaqiruv butunlay
  olib tashlanganda ham test YASHIL qolardi va ro'yxat hech qachon
  yuklanmasdi. Tuzatildi: sarlavha avval olib tashlanadi, keyin qidiriladi.
  **Uch marta bitta naqsh: qorovul BELGISI noto'g'ri tanlansa, u tekshirmoqchi
  bo'lgan narsani tekshirmaydi va buni faqat mutatsiya ko'rsatadi.**

  **SINALGANI.** SQL **HAQIQATAN BAJARILDI** (pglite — xotiradagi
  «`server/test.js` SQL'ni BAJARMAYDI» qoidasi bo'yicha): migratsiya,
  idempotentlik (ikki marta yurdi), takroriy ♡ → 1 qator, o'chirish,
  CASCADE, foydalanuvchilar ajratilishi. Brauzerda 5 holat: qabul / rad
  (♡ qaytdi) / tarmoq yiqildi (qaytdi) / bazadan yuklash (2 ♡ tiklandi) /
  kimlik yo'q (server chaqirilmadi). **72 test yashil** (71 → 72).
  ✅ **HISOBOTCHI MUSTAQIL TEKSHIRDI, hisobotdan ko'chirmadi:** suite qayta
  yurgizildi — **72 ta `✅ Test` satri, chiqish kodi 0**; ikki mutatsiya
  QAYTA bajarildi (chaqiruvni olib tashlash, orqaga qaytarishni olib
  tashlash) va ikkalasini ham AYNAN Test 33 ushladi.
  ⚠️ **O'lchov tuzog'i IKKINCHI marta takrorlandi va yozib qo'yiladi:**
  birinchi mutatsiyani **Test 16 (kesh hashi) tutdi, Test 33 EMAS** —
  `app.js` tahriri `sha256` ni o'zgartiradi va Test 16 oldinroq yiqilib
  runner'ni to'xtatadi, ya'ni «mutatsiya ushlandi» degan xulosa NOTO'G'RI
  narsani o'lchagan bo'lardi va Test 33 umuman ishlamasa ham xuddi shunday
  ko'rinardi. Qayta sinaldi: mutatsiya bilan BIRGA jadvaldagi hash ham
  yangilanib, Test 16 YASHIL qoldirilgan holda — o'shanda ushlagani aynan
  Test 33 bo'ldi. **Bu tuzoq 2026-08-13 da Test 25 da AYNAN shu shaklda
  yozilgan edi** (panel yozuvida turibdi), ya'ni hujjatlangan tuzoq ham
  ikkinchi marta tishlaydi — `app.js` ga tegadigan HAR QANDAY mutatsiya
  sinovida hash birga yangilansin. Kesh: `telegram-app/app.js` v92 → v93,
  Test 16 jadvali birga.

  🔴 **HALOL CHEGARA — DEPLOY TARTIBI MUHIM VA U ODATDAGIDAN QAT'IYROQ:**
  (a) migratsiya PRODUCTION bazasida ISHGA TUSHIRILMAGAN; (b) backend
  deploy qilinmagan (rsync + restart founder zimmasida); (c) **frontend
  `/api/favorites` ni chaqiradi, CI esa FAQAT frontendni chiqaradi** — ya'ni
  `main` ga oldin push qilinsa eski backendda endpoint bo'lmaydi va har ♡
  bosilganda to'lib, keyin orqaga qaytadi va xato chiqadi, bu esa
  **HOZIRGI HOLATDAN YOMONROQ** (hozir ♡ hech bo'lmasa sessiya davomida
  turadi). To'g'ri tartib: **(1) migratsiya → (2) backend rsync + restart →
  (3) shundan keyin `main` ga push.** (d) Jonli Mini App'da (Telegram
  ichida) KO'RILMAGAN — brauzerda soxta server javobi bilan sinaldi.

- [2026-08-14] **Mini App'ga REKLAMA BANNERI qo'shildi — uch slaydli karusel,
  qidiruv qatoridan pastda, kategoriya chiplaridan tepada.** Bu ortiqcha yo'l
  EMAS va bu ATAYLAB tekshirildi: CLAUDE.md dagi «mavjud funksiyaga ikkinchi
  yo'l qo'shilmasin» qoidasi bo'yicha birinchi savol berildi — banner saytda
  (`index.html` → `.ad-banner`, 3 slayd) ALLAQACHON bor edi, Mini App'da esa
  UMUMAN yo'q, ya'ni bu haqiqiy bo'shliq, takror emas.

  **Founder qarorlari (shu sessiyada olindi):**
  (1) **Nisbat 16:9 dan 16:4.5 ga (= 32:9) tushirildi** — founder «juda baland,
  kartochkalarga halaqit beradi» dedi. **O'lchandi, hisoblab yozilmadi:**
  kartochka ko'rinishi **171px → 271px**, ya'ni endi to'liq bir qator kartochka
  banner ostida ko'rinadi.
  (2) **CTA tugmasi YO'Q — butun banner bosiladi** («cta tugmasini shart emas
  bannerga bosganda ishlaydigan qilamiz»). Sabab o'lchovdan chiqdi: 101px
  balandlikda 38px tugma bannerning ~70% ini yeb, sarlavhaga joy qoldirmasdi.
  (3) Uch slayd, uch pastel ohang, fon rasmli, «yengil sokin» fon.

  ⚠️ **MATN RASMDA EMAS, KODDA** (`AD_SLIDES`, `telegram-app/app.js`) — va bu
  qaror texnik emas, MAHSULOT qarori: Mini App ikki tilli, sarlavha rasmga
  chizilsa **rus xaridori o'zbekcha sarlavha ko'rardi** va uni tuzatish uchun
  rasm qayta chizilishi kerak bo'lardi. Kodda esa til bepul almashadi, matn
  tuzatish — bitta satr. Rasm faqat FON: chap yarmi ataylab tinch qoldirilgan.
  ⚠️ Bu **`docs/dizayn-tizimi/reklama-banner-spec.md` dagi jadval bilan zid** —
  u yerda hamon «Matn: sarlavha rasm ichida» deb turibdi. Spec ish materiali,
  kod esa haqiqat manbai; qator kelgusi tahrirlashda to'g'rilansin.

  **Slayd matnlari:** (1) AI xizmati — «Matolarni jonlantiring» (pushti-anor,
  `tab('ai')` ga olib boradi); (2) «24/7 buyurtma berishingiz mumkin»
  (za'faron-krem); (3) Ilk 3 ta buyurtma — «Bepul yetkazib berish» (feruza).
  3-slayd dastlab «Birinchi 3 ta buyurtma» edi va 48px minimumda zonaga
  sig'may ikki qatorga o'ralgani uchun «Ilk» ga qisqartirildi (ma'no o'sha).

  🔴 **ENG MUHIM TEXNIK QAROR — `paintHome()` va u nuqson EMAS, oldini
  OLISH:** `renderHome()` TO'RT joydan chaqirilardi (`render()`,
  `applyPriceFilter`, `clearPriceFilter`, `selectCat`) va **uchtasi `render()`
  dan O'TMASDI**. Bannerni ulash faqat `render()` ga qo'shilganda edi,
  foydalanuvchi **kategoriya bosishi bilan banner JIMGINA muzlab qolardi**:
  rasm turadi, nuqtalar o'lik, almashish yo'q — konsolda xato YO'Q. Ya'ni
  bu aynan `authUser()` → `requestUser()` naqshining UCHINCHI marta
  takrorlanishi bo'lardi. Hammasi bitta `paintHome()` ga o'tkazildi: bosh
  sahifani chizadigan yagona nuqta, ichida `focusCatChip()` + `mountAdBanner()`.
  Beshinchi chaqiruv qo'shilsa u ham avtomatik qamraladi.

  **Taymer:** modul darajasida (`adTimer`), `adStart()` da `clearInterval`
  `setInterval` dan OLDIN turadi va `mountAdBanner()` har chizishda tozalaydi —
  aks holda har kategoriya bosilganda yangi `setInterval` qo'shilib, slaydlar
  tobora tez «titraydigan» bo'lib qolardi (sekin-asta yomonlashadigan, ya'ni
  birinchi qarashda ko'rinmaydigan nuqson). Bosh sahifadan chiqilganda
  `mountAdBanner()` bannerni topmay taymerni O'CHIRADI. Fon tabda
  (`document.hidden`) almashish to'xtaydi, `prefers-reduced-motion` da
  avtomatik almashish umuman yoqilmaydi.

  **Surish bosish deb hisoblanmaydi:** barmoq 45px dan ko'p surilsa `adSwiped`
  yoqiladi va o'sha klik tashlab yuboriladi — aks holda har surishda banner
  amali ishga tushardi. Nuqta bosilganda banner amali chaqirilmaydi:
  delegatsiya `closest('[data-action]')` bilan eng ICHKARIDAGI elementni
  topadi, ya'ni `stopPropagation` ham kerak emas.

  **CSS (`styles.css`):** balandlik QO'LDA yozilmaydi — `aspect-ratio: 32/9`.
  `flex: none` SHART: bosh sahifa `flex-direction: column` va bolasi standart
  holda siqiladi, ya'ni `aspect-ratio` kafolat EMAS — bu naqsh loyihada UCH
  marta tishlagan (`<picture>`, `.addr-map`, `.contact-block`).
  `touch-action: pan-y` — gorizontalni JS boshqaradi, vertikal skroll
  brauzerda qoladi (kategoriya chiplaridagi `pan-x` ning aynan TESKARISI;
  `pan-x` yozilsa banner ustida sahifa umuman skroll qilmasdi). Nuqtalar
  ko'rinadigan qismi 7px, tegish maydoni esa **44px** (2026-07-29 qarori).
  Ranglar tokendan (`--pom-700` / `--saffron-700` / `--teal-700`) — Test 26
  qamrovida. Global `button::after` (44×44) bannerda `content: none` bilan
  o'chirildi: banner allaqachon 92–112px, ::after ichkarida ortiqcha qatlam
  bo'lib turardi.

  **Rasmlar:** `telegram-app/assets/ads/ad-1..3.jpg`, 1200×338, 31–35 KB.
  Founder bergan Google API kaliti bilan `gemini-3-pro-image` orqali chizildi
  (Imagen 4 yangi foydalanuvchilarga yopiq ekan). **Kalit repoga KIRMAGAN.**

  **BRAUZERDA O'LCHANDI, taxmin qilinmadi:** 360px → 328×92 · 390px → 343×96 ·
  430px → 398×112, nisbat hamma joyda 3.56. Nuqta bosilganda banner amali
  ishlamadi (0 chaqiruv). Bannerga bosilganda `tab()` ishladi. 3 marta
  kategoriya bosildi — taymer to'planmadi (netTimers 0). Bosh sahifadan
  chiqilganda taymer o'chdi. Avtomatik almashish 0→1→2, roppa-rosa 5 soniyada.
  Eng kichik telefonda matn zaxirasi 21px, ikkala tilda ham toshib chiqmadi.

  **QOROVUL — Test 32** (`testAdBannerWiring`), 4 band: (1) `innerHTML =
  renderHome()` faqat `paintHome()` ichida va `paintHome()` HAQIQATAN
  `mountAdBanner()` ni chaqiradi (nomiga ishonish yetarli emas — Test 3f
  darsi); (2) `adStart()` da `clearInterval` `setInterval` dan OLDIN; (3) slayd
  rasmlari DISKDA bor + har slaydda uz va ru (rasm yo'qligi CSP darsining
  aynan o'zi: brauzer JIMGINA bo'sh joy chizadi, JS xatosi yo'q); (4) CSS da
  `flex: none`, `aspect-ratio: 32/9`, `touch-action: pan-y`. Izohlar tahlildan
  OLDIN olib tashlanadi — Test 3f dagi teshik shu yerda takrorlanmasin.
  **8 mutatsiya bilan sinaldi: 7 tasi ushlandi, 1 tasi (izohdagi soxta
  chaqiruv) TO'G'RI e'tiborsiz qoldirildi.** Test manba kodini o'qiydi,
  brauzerni emas — ya'ni u «banner ishlayapti» demaydi, «banner ishlamay
  qoladigan TUZILISH qaytib kelmadi» deydi. Farqi ataylab yozib qo'yiladi.

  **Yo'l-yo'lakay hujjatlar:** `docs/dizayn-tizimi/` ga `reklama-banner-spec.md`
  (o'lchamlar, ekran byudjeti, qarorlar tarixi), `banner-olcham.html`,
  `banner-dizaynlar.html`, `banner-rasmlar.html` + `banner-rasmlar/` va ikki
  shrift (`bricolage.woff2`, `hanken.woff2`) — hammasi ISH MATERIALI va
  ataylab `docs/` da, `telegram-app/` da EMAS: `deploy.yml` Mini App papkasini
  butunlay serverga ko'chiradi (2026-08-14, `94c298e` darsi).

  **Kesh:** `telegram-app/styles.css` v33 → v34, `app.js` v89 → v90,
  Test 16 jadvali birga. **DEPLOY: faqat statik, servis restarti kerak emas.**
- [2026-08-14] **Founderning uchta shikoyati o'lchandi va uchalasi ham ROST
  bo'lib chiqdi — uchtasining ham ildizi bitta naqsh: BIR NARSA IKKI JOYDA
  YASHAYDI va ular jimgina uzoqlashgan.** Shikoyatlar bir-biriga o'xshamasdi
  (tugma, ekran, telefon raqami), ildizi esa bir xil edi: ikkita kartochka
  funksiyasi, ikkita nom manbai (snapshot va katalog), uchta telefon
  yozuvchisi. Har uchala holatda ham "ikkinchi nusxa" hech kim xato
  qilgani uchun emas, shunchaki YANGI MAYDON FAQAT BITTASIGA qo'shilgani
  uchun tug'ilgan.
  ⚠️ **Uchala shikoyat ham TEKSHIRILDI, ishonib olinmadi** — "hujjatdagi
  raqam tekshirilmagan da'vo" qoidasi shikoyatga ham tegishli ekan:
  founder aytgani rost bo'lib chiqdi, lekin SABAB uchala holatda ham
  taxmin qilinganidan boshqa joyda edi.

  ---
  **1. ♡ TUGMASI — "BA'ZI KARTOCHKALARDA YO'Q" (`telegram-app/app.js`)**
  Founder: "yoqtirma tugmasi mahsulot kartochkalarida yo'qolib qolgan
  ba'zilarida". **SANALDI, taxmin qilinmadi:** bosh ekranda 15 kartochkadan
  **4 tasida** ♡ bor edi ("Tavsiya etiladi" — `homeCard`), **11 tasida
  yo'q** ("Barcha matolar" — `productCard`). Ya'ni tugma AYNI EKRANDA,
  ko'rinishi bir xil kartochkalarning bir qismida bor, bir qismida yo'q edi.
  🔴 **Ikkinchi zarar o'zi ko'rinmaydigan joyda edi:** Saqlanganlar ekrani
  ham `productCard` chizadi — ya'ni sevimlini o'sha ro'yxatning O'ZIDA
  ro'yxatdan chiqarib bo'lmasdi, mahsulotni ochish kerak bo'lardi.
  Tuzatish: ♡ `likeButton(p)` ga chiqarildi va ikkala kartochka shuni
  chaqiradi — tugma IKKINCHI marta ko'chirib yozilmadi, chunki aynan
  nusxa ko'chirish shu nuqsonni tug'dirgan. Natija 15/15.
  Qorovul — **Test 29:** kartochka funksiyalarini O'ZI topadi
  (`class="card-media"` + `data-action="openProduct"` ikkalasi ham bor
  funksiya = mahsulot kartochkasi), ro'yxat qo'lda yozilmaydi, ya'ni
  uchinchi kartochka turi qo'shilsa u avtomatik qamraladi.
  ⚠️ **Testni sinashda uning O'ZIDA xato topildi va yozib qo'yiladi:**
  dastlab qorovul kartochka tanasidan `toggleLike` so'zini qidirardi —
  bu TUZATISHDAN KEYIN ham qizil qolardi, chunki markazlashtirilgan
  kartochka `toggleLike` ni o'z ichida saqlamaydi (uni `likeButton()`
  yozadi). Ya'ni qorovul TO'G'RI holatni nuqson deb ko'rsatib, tuzatishni
  ORQAGA QAYTARISHGA undardi. Belgi nusxa emas, CHAQIRUV bo'lishi kerak.
  **6 mutatsiya bilan sinaldi, 6 tasi ham ushlandi.**

  ---
  **2. BUYURTMALAR EKRANI BO'SH — VA U HISOBGA BOG'LIQ EDI
  (`telegram-app/app.js`, `server/routes/orders.js`)**
  Founder: "o'zimni telegramimdan kirsam buyurtmalar bo'limida hech narsa
  yo'q, boshqa tg'dan kirsam hammasi joyida". Shikoyatning eng qimmatli
  qismi — "boshqa tg'dan" bo'lagi: u nuqson AUTENTIFIKATSIYADA emasligini
  darrov ko'rsatdi, chunki ikkinchi hisob ishlayotgan edi.
  **Sabab QAYTA YARATILDI:** `renderOrders()` qatorni BUGUNGI katalogdan
  chizardi (`const p = byId(it.id); ... p.name`), `/api/products` esa faqat
  `status='published'` qaytaradi. Ya'ni buyurtmada katalogdan chiqqan
  (yopilgan yoki o'chirilgan) mahsulot bo'lsa `byId()` `undefined` berib,
  `renderOrders()` BUTUNLAY yiqilardi (`TypeError: Cannot read properties
  of undefined`) — ekranda bitta ham buyurtma qolmasdi. **Nuqson AYNAN
  shu sababdan hisobga bog'liq edi:** nimani buyurtma qilganingizga qarab
  bir hisobda chiqadi, boshqasida yo'q.
  Tuzatish: `order_items` dagi snapshot (`name`, `unit_price`) endi
  serverdan qaytariladi va yangi `orderLine()` qatorni BUYURTMA
  YOZUVIDAN chizadi; katalog faqat RASM uchun ishlatiladi.
  ⚠️ **Ma'lumot BAZADA ALLAQACHON BOR EDI** — `order_items.name` va
  `unit_price` buyurtma paytida yozilardi, shunchaki `handleGetOrders`
  ularni SO'RAMASDI. Ya'ni tuzatish yangi ustun qo'shmadi, mavjud
  snapshotni ishlatdi.
  🔴 **Tuzatishning IKKINCHI YUTUG'I birinchisidan jimroq, lekin
  xavfliroq narsani yopdi:** tarixda endi xaridor TO'LAGAN narx turadi.
  Ilgari summa bugungi katalog narxidan qayta hisoblanardi, ya'ni narx
  o'zgargan kuni **eski buyurtmalar jimgina boshqa summa ko'rsatardi** —
  bu xato bermaydi, shunchaki yolg'on gapiradi (CLAUDE.md — "jimgina
  yolg'on yo'qlikdan yomonroq").
  ⚠️ Nuqson SAVATGA ko'chmasligi uchun `reorderOrder` katalogda yo'q
  matoni savatga qo'shmaydi: savat butunlay katalogga tayanadi
  (`cartTotal()` → `byId(c.id).price`), ya'ni "Qayta buyurtma" tugmasi
  savatni o'ldirardi. Buyurtma tarixi mahsulotsiz ham chiziladi, savat
  esa chizilmaydi — farq shundan.
  ⚠️ `esc()` qo'shildi: snapshot nomi bazadan keladi (sotuvchi yozgan) va
  `vm()` chegarasidan O'TMAYDI, ya'ni tozalanmasa xom matn `innerHTML` ga
  tushardi.
  Qorovul — **Test 30:** `orderLine()` ning O'ZINI bajaradi, statik naqsh
  bilan cheklanmaydi (nuqson "so'z bor/yo'q" darajasida emas, XULQ
  darajasida edi).
  ⚠️ **Bu test ham sinovda teshik ko'rsatdi:** dastlab `renderOrders` da
  `byId(...).` naqshi qidirilardi, asl nuqson esa natijani AVVAL
  o'zgaruvchiga oladi (`const p = byId(it.id)`) — ya'ni naqsh unga tegmasdi
  va **aynan tuzatilayotgan nuqson qorovuldan jimgina o'tib ketardi.**
  Endi `byId` NOMINING o'zi qidiriladi: buyurtma qatori katalogni UMUMAN
  bilmaydi. **7 mutatsiya bilan sinaldi, 7 tasi ham ushlandi.**

  ---
  **3. PROFILDA BOSHQA TELEFON RAQAMI (`server/routes/webhook.js`,
  `server/routes/seller-application.js`)**
  Founder: "webdagi profilimda boshqa raqam turibdi telegram orqali login
  qilgan bo'lsam ham". **Sabab: `users.phone` ga UCH manba yozadi va
  ustuvorlik TESKARI qo'yilgan edi** — Telegram TASDIQLAGAN kontakt va
  checkout formasi `COALESCE` da turardi (ya'ni hech qachon yozmasdi),
  sotuvchi arizasi esa USTIDAN yozardi. Eng ishonchsiz manba g'olib edi.
  🔴 **Va bu YOPIQ TUZOQ edi:** formaga bir marta boshqa raqam tushsa
  (sinov raqami, hamkasb, ofis raqami) profil o'shani ko'rsatib
  turaverardi va uni **tuzatishning iloji yo'q** edi — bot raqamni faqat
  `!user.phone` bo'lganda so'raydi, ya'ni qayta ham so'ramasdi.
  Tuzatish: Telegram kontakti USTIDAN yozadi, ariza va checkout esa faqat
  BO'SH joyni to'ldiradi. Ustidan yozish huquqi `msg.contact.user_id ===
  msg.from.id` tekshiruviga tayanadi — u kontakt foydalanuvchining O'ZINIKI
  ekanini kafolatlaydi, aks holda begona raqam yozilardi.
  Bot javobi endi saqlangan raqamning O'ZINI ko'rsatadi va o'zgartirish
  yo'lini aytadi: "saqlandi" deyish yetarli emas edi — xato raqamni
  tuzatayotgan odam natijani ko'rmasdi.
  ⚠️ **`users.src` (Test 27) bilan ADASHTIRILMADI va bu ataylab yoziladi:**
  u yerda "birinchi teginish qulflanadi" TO'G'RI, chunki u analitika
  FAKTI; telefon esa fakt emas, JORIY aloqa ma'lumoti va o'zgarishi
  normal. Aynan bu o'xshashlik kelajakda "tartibga solish" vasvasasini
  tug'diradi — shuning uchun Test 31 va bu band bor.
  Qorovul — **Test 31:** `COALESCE` ning BORLIGI emas, TARTIBI ham
  tekshiriladi (`COALESCE(EXCLUDED.phone, users.phone)` "COALESCE bor"
  tekshiruvidan o'tib ketardi). **5 mutatsiya bilan sinaldi, 5 tasi ham
  ushlandi.**

  ---
  **SINALGANI: 70 test yashil** (avval 67 edi — 3 yangi: 29, 30, 31),
  raqam runner chiqishidagi satrlardan MUSTAQIL sanaldi, hisobotdan
  ko'chirilmadi. **18 mutatsiya bilan sinaldi, 18 tasi ham ushlandi** —
  yashil test isbot emas, buzib ko'rilgan test isbot.
  🔴 **HALOL CHEGARA, ATAYLAB YOZILADI:** uchala tuzatish ham **brauzerda
  yoki jonli Mini App'da KO'Z BILAN KO'RILMADI** — hammasi test va kod
  o'qish darajasida tasdiqlangan. ♡ soni (4/15 → 15/15) manba kodidan
  sanaldi, jonli ekrandan emas. Buyurtmalar ekrani nuqsoni pglite'da
  emas, `orderLine()` ni bajarish orqali qayta yaratildi — ya'ni SERVER
  so'rovi (`SELECT ... name, unit_price`) haqiqiy bazada ishga
  TUSHIRILMAGAN. Telefon tuzatishi esa faqat founder botga kontaktini
  qayta yuborganda tasdiqlanadi. Deploy: `server/` rsync va servis
  restarti founder zimmasida (statik fayllar CI orqali).

- [2026-08-14] **SAYT ham "ostki chiziq" chip dizayniga o'tdi — "ikkala yuz
  bitta ko'rinish" qoidasi TIKLANDI (founder qarori).** Pastdagi yozuvda
  "sayt ham o'tsinmi — alohida qaror kutilmoqda" deb turgan band shu kuniyoq
  yopildi. `style.css` dagi `.chip` Mini App `.cat-chip` bilan AYNAN bir xil
  retseptga o'tdi: `--text-muted` matn, `.active` da `--pom-700` + qalin +
  ikat rombi (gradient), yangi `.chip-line` elementi (gradient chiziq,
  `scaleX` 0→1). `.chips` qatoriga `touch-action: pan-x` +
  `overscroll-behavior-x: contain` ham qo'shildi — Mini App'dagi "qimirlash"
  tuzatishi saytda YO'Q edi, ayni nuqson bu yerda ham yashab turgan.
  Izohda ikkala tuzoq hujjatlandi: chiziq `::after` emas (44×44 tap-maydon
  qoidasi uni band qilgan) va saytda JS kerak emas (klass almashadi, markup
  qayta chizilmaydi — Mini App'dagi `focusCatChip()` ehtiyoji bu yerda yo'q).
  ⚠️ **`index.html` da 7 chip matni ichki `<span data-i18n>` ga ko'chirildi**
  va sababi muhim: `applyLang()` `textContent` yozadi — atribut tashqi
  tugmada tursa til almashtirilganda chiziq spani JIMGINA O'CHIB ketardi.
  Brauzerda tekshirildi: ruschaga o'tilganda 7 chiziq ham omon. Kesh:
  `style.css` v53 → v54 (`index.html` va `admin/index.html` da BIR XIL
  raqam — 15 versiya orqada qolgan admin darsi), `telegram-app/styles.css`
  v32 → v33 (izohdagi "sayt eski retseptda" bandi eskirgani uchun
  yangilandi — eskirgan da'vo qoldirilmaydi), Test 16 jadvali birga.
  Tekshirildi: 67 test yashil, mobil + desktop skrinshot, filtr ishlaydi,
  ranglar tokendan (Test 26).

- [2026-08-14] **Kategoriya chiplari yangi dizaynga o'tdi — founder 3 lokal
  variantdan "ostki chiziq" (B) ni tanladi.** Variantlar lokal demo faylda
  ko'rsatildi (`telegram-app/_ds/chips-variantlar.html` — ATAYLAB commit
  qilinmaydi); founder avval A ("anor linza") ni tanlab, keyin fikrini
  o'zgartirib B ni tanladi. Yangi ko'rinish: "quti" chiplar o'rniga qutisiz
  tab'lar — matn `--text-muted`, tanlangani `--pom-700` + qalin + ikat rombi +
  markazdan ochiladigan gradient chiziq (`.cat-line`), ranglar tokendan
  (Test 26 yashil). ⚠️ **Chiziq `::after` EMAS, alohida element** — global
  `button::after` (44×44 tap-maydon qoidasi) har tugmaning `::after` ini
  allaqachon band qilgan, unga chizilgan narsa 44px blok bo'lib chiqardi
  (lokal demoda o'lchab topildi). ⚠️ **"Saytdagi `.chip` bilan bir xil"
  qoidasi (2026-08-13) shu yerda ATAYLAB buzildi** — founder Mini App uchun
  alohida ko'rinishni tanladi, sayt eski retseptda qoldi; sayt ham o'tsinmi —
  alohida qaror kutilmoqda. `touch-action: pan-x` (ertalabki tuzatish)
  saqlangan. `app.js` da yangi `focusCatChip()`: tanlangan chipni qatorda
  markazlaydi va chiziq animatsiyasini `innerHTML` almashgandan keyin qayta
  o'ynatadi — `scrollIntoView` ATAYLAB ishlatilmadi, u `#screen-wrap` ni
  vertikal surib yuborardi; `selectCat`, narx filtri renderlari va `render()`
  home ilgagi shu funksiyani chaqiradi. Yo'l-yo'lakay nuqson tuzaldi:
  katalogga qaytganda chiplar qatori boshiga qaytib qolardi — endi tanlangan
  chip markazda qoladi. Kesh: `styles.css` v31 → v32, `app.js` v88 → v89,
  Test 16 jadvali birga. Brauzerda tekshirildi (skrinshot bilan): tanlov,
  animatsiya, markazlash va filtr ishlaydi. 67 test yashil.

- [2026-08-14] **Katalogdagi kategoriya chiplari qatori barmoq ostida
  "qimirlab" yurishi tuzatildi — founder shikoyati.** Sabab: `.cat-chips`
  gorizontal skroll qatori, lekin `touch-action` cheklanmagani uchun brauzer
  undan VERTIKAL surishni ham qabul qilardi — barmoq sal qiyshiq yursa qator
  tepa-pastga tebranib turardi. Tuzatish ikki qator CSS
  (`telegram-app/styles.css`): `touch-action: pan-x` (bu elementda barmoq
  faqat gorizontal suradi, vertikal harakat sahifaga beriladi) va
  `overscroll-behavior-x: contain` (qator chetiga yetganda skroll ota
  elementga "toshib" o'tmaydi). ⚠️ **Dizaynga ATAYLAB tegilmadi** — founder
  referens berishini aytdi, dizayn ishi alohida bosqichda bo'ladi; bu faqat
  xatti-harakat tuzatishi. Kesh qoidasi bo'yicha `styles.css` v30 → v31
  (`telegram-app/index.html`) va Test 16 jadvali birga yangilandi.
  Yo'l-yo'lakay: branch `origin/main` dan 4 commit orqada edi —
  birlashtirildi, `server/test.js` dagi konfliktda upstream raqamlari
  (admin.js v25, app.js v88) olindi, `styles.css` esa birlashgan tarkib
  uchun v31 ga surildi. Brauzerda tekshirildi: `.cat-chips` da ikkala qoida
  haqiqatan qo'llangan, `?v=31` yuklanadi. Barcha server testlari yashil.

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
- [2026-08-13] 🔴 **AVATAR NUQSONINING IKKINCHI SABABI: Mini App'da hamon
  chiqmasdi — birinchi tuzatish YARIM edi.** `d7d10a2` (`blob:` → `data:`)
  production'ga chiqdi va founder tekshirdi: **saytda ISHLADI, Mini App'da
  YO'Q.** Aynan shu farq tashxis berdi — server yo'li sog'lom (saytning o'zi
  buni isbotlaydi), nuqson faqat Mini App tomonida.

  **Ikkinchi sabab — mustaqil va o'lchandi:** kodda
  `const suratSrc = u.photo_url || _avaUrl;` turgan, ya'ni
  `initDataUnsafe.user.photo_url` **BIRINCHI pog'ona** edi. U esa Telegram
  CDN havolasi va Mini App CSP sining `img-src` ro'yxatida Telegram domeni
  YO'Q (jonli o'lchov, `curl -sI https://lolamarket.uz/mini-app/`:
  `img-src 'self' data: https://cdn.lolamarket.uz https://*.maps.yandex.net
  https://yastatic.net https://log.api-maps.yandex.ru`).

  ⚠️ **Ustiga u IKKINCHI zarar keltirgan va aynan shu nuqsonni ikki
  barobar qilgan:** `photo_url` bor bo'lgani uchun zaxira
  `<span id="tg-ava">` umuman chizilmasdi, `mountAvatar()` esa AYNAN o'sha
  id ni qidiradi va topmasa DARROV qaytadi — ya'ni bizning `/api/me/photo`
  **umuman chaqirilmagan**. Ikkinchi pog'ona ochilmay qolgan, ya'ni
  "uch pog'onali zaxira" amalda BIR pog'ona edi.

  **Nega bir yuzda ko'rinmagan:** saytda `initData` yo'q → `photo_url` ham
  yo'q → bizning yo'ldan yurgan → ishlagan. Bu CLAUDE.md dagi `authUser()`
  naqshining **uchinchi takrori**: bir kanalda ishlab, ikkinchisida jimgina
  o'ladigan yechim.

  🔴 **ENG MUHIM QISMI — ISH YO'NALISHINI YANA TEKSHIRILMAGAN DA'VO
  BELGILAB QO'YDI.** Kodda o'z qo'lim bilan yozilgan izohda «`photo_url`
  FAQAT biriktirma menyusidan ochilganda keladi, ya'ni bizdagi kirish
  nuqtalarida odatda YO'Q» deb turardi — bu **hech qachon tekshirilmagan**
  va **amalda u BOR edi**. Ya'ni da'vo faqat noto'g'ri bo'lib qolmadi, u
  `photo_url` ni birinchi pog'ona qilib qo'yishni ham OQLAB turdi. Bu
  CLAUDE.md dagi «hujjatdagi raqam — tekshirilmagan da'vo» qoidasining
  aynan o'zi, faqat raqam emas, **MAVJUDLIK** darajasida.

  **Tuzatish:** `const suratSrc = _avaUrl;` — `photo_url` butunlay olib
  tashlandi. Avatar endi IKKALA yuzda ham FAQAT `/api/me/photo` dan
  (`data:`), ya'ni **bitta yo'l**. Zaxira bosh harf o'z joyida qoldi.

  **Test 25 ga 4-band qo'shildi:** `telegram-app/app.js` da `photo_url`
  ishlatilmasin (izohlar tahlildan oldin olib tashlanadi — aks holda shu
  bandning O'ZIDAGI tushuntirish qorovulni aldardi). M4 mutatsiyasi bilan
  sinaldi: mutatsiya + jadvaldagi hash BIRGA yangilanib, **Test 16 yashil
  qolgan holda** — ushlagani AYNAN Test 25 bo'ldi.

  🔴 **HALOL CHEGARA — VA U ENDI OG'IRROQ:** bu tuzatish ham brauzerda ko'z
  bilan KO'RILMADI. **Ketma-ket IKKI marta «mantiqiy xulosa» bilan
  yuborildi va BIRINCHISI YETARLI BO'LMADI** — ya'ni usulning o'zi bir
  marta sinovdan o'tib yiqildi. Sabab tahlili jonli o'lchovga tayanadi
  (CSP sarlavhasi `curl` bilan o'qildi, ikki yuz farqi founder tomonidan
  kuzatildi), lekin **tuzatishning ishlashi** hamon o'lchanmagan.
  **Tasdiq faqat founder Mini App'ni ochib avatarni ko'rganda bo'ladi.**

  **Kesh:** `telegram-app/app.js v86→87` (boshqa fayllar TEGILMAGAN —
  o'zgarmagan, ya'ni versiyasi ham oshirilmaydi). Test 16 jadvali birga.
  **63 test yashil.** **Deploy:** faqat statik, restart kerak emas

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
  🔴 **BU TUZATISH YARIM BO'LGAN** — u SAYTNI tuzatdi, Mini App'ni EMAS
  (u yerda ikkinchi, mustaqil sabab bor edi). Tepadagi alohida yozuvga qara.
  Ya'ni quyidagi «tuzatildi» xulosasi o'sha paytda **to'liq tekshirilmagan
  da'vo** edi: bitta sabab topilgach ikkinchisi qidirilmagan.
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

- [2026-08-25] Qaror (founder): **`.nav-lens` surilishi 480ms sakrash
  (spring) bo'lib QOLADI — 280ms «tez va aniq» varianti telefonda sinovda
  rad etildi.** Tavsiya qoidasi (tez-tez ko'rinadigan harakat qisqartirilsin)
  founder didi bilan to'qnashganda did yutadi: sakrash brendga xos his.
  Izoh `styles.css` dagi `.nav-lens` ustida turadi — qayta
  «optimallashtirilmasin».

- [2026-08-25] Qaror: **uch joy ATAYLAB animatsiyasiz qoldirildi** —
  (1) pastki nav'dagi ekran almashishi (ekranlar `innerHTML` bilan butunlay
  qayta chiziladi, «kirish» animatsiyasi har bosishda butun sahifani
  o'ynatib charchatardi); (2) filtr/saralash qo'llanganda katalog qayta
  chizilishi (natija DARHOL ko'rinishi kerak — kutish hissi qo'shmaslik);
  (3) miqdor +/- tugmalari (raqam o'zgarishi o'zi yetarli fikr-aloqa).
  `find-animation-opportunities` hisobotining rad bandlari — «hamma narsani
  animatsiya qilish» sifat emas. Yopilish tezligi ham qaror: varaq chiqishi
  360ms, YOPILISHI 200ms — yo'qolayotgan narsani kutish shart emas.

- [2026-08-19] Qaror: **«Eng yangi» HAQIQIY sanaga tayanadi, yorliq esa
  ZAXIRA bo'lib qoladi.** 2026-08-17 dagi ochiq band yopildi — sana o'ylab
  topilmadi, `products.created_at` (`db/001`) API'ga qo'shildi. Yorliq
  bo'yicha saralash OLIB TASHLANMADI va bu ataylab: statik fayllar CI bilan
  avtomatik chiqadi, backend esa qo'lda ko'tariladi, ya'ni oraliqda yangi
  sayt eski serverdan javob oladi va `createdAt` kelmaydi. ⚠️ Zaxiraga
  o'tish qarori BUTUN RO'YXAT bo'yicha (`some`), juftlik bo'yicha EMAS —
  aks holda taqqoslash tranzitivligi buzilib `sort` aniqlanmagan tartib
  berardi

- [2026-08-19] Qaror: **ko'rinish TO'G'RI, kod YOLG'ON bo'lsa — kod
  qarorga moslashtiriladi, ko'rinishga tegilmaydi.** `.search-x` da `hidden`
  atributi va `x.hidden = !v` turardi, `.search-x { display: flex }` esa
  ikkalasini bekor qilardi — × hech qachon yashirilmagan. Founder qarori
  «x turaversin» bo'lgani uchun EKRAN to'g'ri edi. Kodni «tuzatib»
  `[hidden]` qatorini qo'shish founder qarorini JIMGINA bekor qilardi —
  shuning uchun teskari yo'l tanlandi: o'lik kod olib tashlandi, sabab
  izohda qoldirildi. Dars: **jimgina o'lik kod jimgina yolg'on bilan bitta
  oilada** — u keyingi odamni noto'g'ri «tuzatishga» chorlaydi

- [2026-08-19] ✅ **YOPILDI: 2026-08-16 va 2026-08-17 dagi qorovul qarzi.**
  Uchala qamrovsiz joy endi test ostida — `data-action` nomlari (**Test 44**,
  244 nishon), `[hidden]` qoidasi + `SORT_KEYS` mosligi (**Test 45**),
  deep-link `sayt_` prefiksi (**Test 46**). Ustiga «Eng yangi» uchun
  **Test 47** (xatti-harakat sinovi). 82 → 86 test. Tafsilot
  `sprint-8.md` → «Qilingan ishlar»

- [2026-08-19] ✅ **YOPILDI: `test.js` dagi izoh tozalash naqshi.** Yetti
  joyda qo'lda takrorlangan va oltitasida blok izoh birinchi olinardi —
  Test 39 ni bir marta ko'r qilgan naqsh. Endi bitta `jsSofi` (10 chaqiruv).
  ⚠️ Yo'l-yo'lakay `jsSofi` ning o'zida REGEX LITERAL nuqsoni topildi va
  tuzatildi. Dars: **takrorlangan qorovul kodi qorovulning eng zaif joyi** —
  bitta nusxa tuzatilsa qolgan oltitasi eski nuqson bilan qolaveradi

- [2026-08-19] Qaror: **dinamik `data-action` qorovuli NOMGA emas,
  TUZILMAGA qaraydi.** Test 44 ning birinchi varianti nom o'xshashligiga
  qarardi va shovqinli edi — serverga yuboriladigan `action: 'request_image'`
  va `segTabs` ning tab kaliti `'new'` ni ham «nishon» deb o'qigan. Endi
  o'ram funksiyaning nechanchi PARAMETRI nishon yozayotgani aniqlanib,
  chaqiruvdagi aynan o'sha pozitsiyadagi argument olinadi. Sabab: shovqinli
  qorovul uzoq yashamaydi — u yolg'on qizil beradi va bir kun o'chiriladi

- [2026-08-17] Qaror: **saralash va narx oralig'i BITTA varaqda, va varaq
  faqat «Tayyor» bilan qo'llanadi.** Founder Shop ilovasining «Sort by»
  varag'ini referens berdi va «so'zlari bilan bizga moslab» dedi —
  referensda saralash va narx bitta varaqda, shakl shundan olindi.
  Ilgari saytda narx inputlari chiplar ostidagi qatorda edi — endi
  varaqda; chiplar ostida faqat qo'llangan holat izi qoladi. Qoralama
  qoidasi (tanlov darhol qo'llanmaydi) IKKALA yuzda bir xil — Mini App'dagi
  narx varag'i shunday ishlardi, sayt unga tenglashtirildi, teskarisi emas

- [2026-08-17] Qaror: **«Eng yangi» — «Yangi» belgisi bo'yicha, sana
  O'YLAB TOPILMADI.** `/api/products` `created_at` qaytarmaydi, shuning
  uchun «yangi» faqat kartochkadagi «Yangi» belgisi bo'yicha va bu kodga
  izoh bilan yozildi. Boshqa maydonni «sana» o'rnida ishlatish
  qilinmadi — u haqiqiy sana emas va «eng yangi» deb ko'rsatilgan narsa
  yolg'on bo'lardi («o'ylab topilgan raqam» qoidasi). 🟠 **OCHIQ:** haqiqiy tartib uchun
  `/api/products` ga `created_at` qo'shish kerak — server tomonida bir
  ustun, klientda `new` tarmog'i o'zgaradi
  — ✅ **YOPILDI 2026-08-19:** `created_at` API'ga qo'shildi, yorliq usuli
  zaxira bo'lib qoldi, qorovul — Test 47

- [2026-08-17] Qaror (founder): **filtr yoki saralash qo'llanganda Mini
  App'da reklama banneri CHIZILMAYDI.** Foydalanuvchi aniq narsa
  qidiryapti — banner o'sha paytda halaqit. Texnik tomoni: `adBannerHtml()`
  chaqirilmaydi, `mountAdBanner()` esa banner yo'qligini o'zi ko'radi va
  aylanish taymerini to'xtatadi (osilib qolgan interval qolmaydi)

- [2026-08-17] Qaror (founder): **qidiruv qutisidagi × DOIM turadi.** Ish
  jarayonida u yashirilgan edi va QAYTARILDI — «qidiruv fondan ajralsin»
  degan gap × ni olib tashlashga ruxsat emas edi. Dars: tuzatish so'ralgan
  joyning YONIDAGI narsaga tegilsa, u alohida qaror va alohida so'raladi

- [2026-08-17] Qaror: **`.price-filter[hidden] { display: none }` — muallif
  `display` qoidasi bo'lgan har bir yashiriladigan blokka shu qator SHART.**
  Sabab: 2026-08-13 dagi «narx paneli yopiq tursin» qarori production'da
  hech qachon ishlamagan — `display: flex` `hidden` atributidan kuchli edi va
  panel doim ochiq turgan (jonli `style.css?v=63` da o'lchandi). Bu jimgina
  nuqson: konsolda xato yo'q, `hidden` atributi DOM'da bor, faqat KO'Z
  ko'radi. `<picture>` va flex `flex: none` qoidalari bilan bitta oila —
  «element bor, o'lchamlari to'g'ri ko'rinadi, natija esa boshqa»

- [2026-08-17] 🟠 **OCHIQ QOLDI: bu ishga qorovul test qo'shilmadi** (80 test
  yashil, soni HEAD dagidek). Qamrovsiz joylar: (1) varaq `data-action`
  nomlari (`openSortSheet`, `applySortSheet`, `resetSortSheet`, `pickSort`,
  `clearSort`, `clearPriceOnly`) — funksiya qayta nomlansa tugma jim o'lik;
  (2) `.price-filter[hidden] { display: none }` qatori — o'chirilsa nuqson
  aynan shu shaklda jimgina qaytadi; (3) `SORT_KEYS` ro'yxati bilan
  varaqdagi radio `value` lari mos-nomosligi. Footer ishidagi qarz bilan
  bitta ro'yxatda turadi; yopilishi founder qaroriga qoldi
  — ✅ **YOPILDI 2026-08-19:** (1) → Test 44, (2) va (3) → Test 45, footer
  qarzi (`sayt_` prefiksi) → Test 46. 82 → 86 test

- [2026-08-16] Qaror: **footer havolalari SAHIFA emas, OYNA ochadi.** Sayt
  bitta sahifadan iborat, ya'ni `/vakansiyalar` kabi manzil yo'q va oddiy
  havola qo'yilsa har qator 404 berardi. Muqobili — har bo'lim uchun alohida
  HTML fayl — RAD ETILDI: u `deploy.yml` ning `source` ro'yxatiga sakkizta
  yangi yozuv, `?v=` qatoriga esa sakkizta yangi kesh kaliti qo'shardi,
  mazmuni esa hozircha bir abzatsdan iborat. Bo'lim matnlari `INFO_TOPICS`
  jadvalida (`script.js`) — to'ldirilganda faqat shu jadval o'zgaradi

- [2026-08-16] Qaror: **bo'sh bo'lim BO'SHLIGINI aytadi, «tez orada»
  DEMAYDI.** Founder: «kerak bo'lishi shartlarini ham qo'y keyin ichini
  to'ldiramiz». «Tez orada» yozilsa u tekshirilmagan va'da bo'lardi va
  bajarilmagan kuni sahifa jimgina yolg'on gapirardi (`NULL` reyting
  qoidasi bilan bitta oila). O'rniga: nima bo'lishi aytiladi + hozir kim
  javob berishi ko'rsatiladi (bog'lanish tugmasi har bo'limda)

- [2026-08-16] Qaror: **«Yetkazish va to'lov» matnidagi foiz `PREPAY_RATE`
  dan o'qiladi, matnga yozilmaydi.** Sabab tarixdan: komissiya 10→12% ga
  o'tganda uch qatlam birga yangilangan edi; qo'lda yozilgan foiz esa
  stavka o'zgargan kuni yangilanmay qolardi va buni hech narsa
  ko'rsatmasdi

- [2026-08-16] Qaror: **deep-link payload'i `sayt_` bilan boshlanadi,
  `web_` bilan EMAS.** `web_` prefiksi saytga kirish kodi uchun band va
  `manbaBelgisi()` uni manba sifatida JIM rad etadi — QR panelda «nol odam
  keltirdi» bo'lib ko'rinardi. Yangi manba belgisi qo'shilganda birinchi
  qadam — `server/routes/webhook.js` dagi shu funksiyada SINAB ko'rish

- [2026-08-16] 🟠 **OCHIQ QOLDI: bu ishga qorovul test qo'shilmadi** (80 test
  yashil, lekin soni HEAD dagidek — ya'ni yangisi yo'q). Ikkita joy
  qamrovsiz va ikkalasi ham JIMGINA sinadigan turdan: (1) `data-action`
  nomlari (`openInfo`, `openPoints`) `window[action]` orqali chaqiriladi —
  funksiya qayta nomlansa tugma jim o'lik bo'ladi, konsolda xato yo'q;
  (2) deep-link payload'ining `sayt_` prefiksi — `manbaBelgisi()` ga qarshi
  tekshirilmaydi, ya'ni kelajakda `web_` ga qaytarilsa panel yana «nol»
  ko'rsatardi. Loyihaning o'z qoidasi bo'yicha («yozilgan qoida himoya emas
  — uni tekshiradigan test himoya») bu qarz sifatida yozib qo'yildi;
  yopilishi founder qaroriga qoldi

- [2026-08-16] Qaror: **qadalgan qator chiqqanda header YUQORIGA SURILADI —
  ikkita qadalgan qator ekranda birga turmaydi.** Founder shikoyati (skrinshot
  bilan): «mahsulot qadalganda tepadagi doim qadaladigani qadalmasin».
  O'lchov: 1280px da 64 + 61 = **125px**, 375px da 162 + 61 = **223px**.
  Muqobili — qatorni ingichkaroq qilish — RAD ETILDI: u ikkita qatorni
  BITTA muammoning kichikroq shakliga aylantirardi, founder esa aynan
  ikkitaligidan shikoyat qildi. Qator header'ning O'RNINI bosadi, unga
  qo'shimcha emas — bu kechagi «qator quti o'rnini bosadi» qarorining
  ayni mantig'i, faqat bir qavat yuqorida

- [2026-08-16] Qaror: **surish `transform` bilan bo'ladi, `position`
  almashtirish bilan EMAS.** Ikki sabab va ikkinchisi muhimroq:
  (a) `#nav` ustida `backdrop-filter` bor, `position` almashtirilsa paint
  qatlami qayta yig'iladi va o'tish sakraydi; (b) `transform` oqimdagi
  o'lchamga TEGMAYDI, ya'ni `offsetHeight` o'zgarmay qoladi — chegara
  hisobi aynan shunga tayanadi. Ya'ni uslub tanlovi emas, ARXITEKTURA
  tanlovi: `position` almashtirilsa quyidagi aylanma bog'liqlikni
  uzib bo'lmasdi

- [2026-08-16] Qaror: **header balandligi `offsetHeight` bilan o'lchanadi,
  `getBoundingClientRect()` bilan EMAS.** Sabab AYLANMA BOG'LIQLIK: header
  endi qatorning holatiga qarab suriladi, ya'ni rect chegarani o'zgartiradi —
  qator chiqadi → chegara siljiydi → qator yashirinadi → chegara qaytadi…
  ekran har kadrda miltillardi. Bu kechagi «`top` qattiq yozilmaydi,
  O'LCHANADI» qarorining davomi va uning tuzog'i: o'lchov to'g'ri qaror
  edi, lekin **QAYSI o'lchov** ekani endi ahamiyatli bo'lib qoldi

- [2026-08-16] Qaror: **`pdp-bar-on` belgisi ikkita mustaqil yo'l bilan
  tozalanadi** — `closePdp()` da ATAYLAB va `pdpBarSync()` ning `if (!bar)`
  shohbasida ZAXIRA sifatida. Sabab tuzilishda: belgi TANADA, qator esa
  `#pdp` ichida yashaydi, ya'ni ular alohida yo'l bilan yo'qoladi. Bitta
  tozalash yetarli deb qoldirilsa — va aynan shunday qoldirilgan edi —
  katalogga qaytgan foydalanuvchi **headersiz** qolardi: qidiruv, savat,
  kirish hammasi ko'rinmas. Nuqson JIMGINA edi: konsolda xato yo'q,
  DOM to'liq, element esa ekrandan tashqarida

- [2026-08-16] Qaror: **Test 41 ning 4-bandi USLUBNI emas, NATIJANI
  so'raydi** — `translateY(-100%)` ham, `position: static` ham qabul
  qilinadi. Sabab: test maqsadni qulflashi kerak («header yuqorida joy
  egallamasin»), amalga oshirishni emas. Qat'iy shakl talab qilinsa
  kelajakdagi to'g'ri yechim testni qizil qilardi va test himoyadan
  to'siqqa aylanardi

- [2026-08-16] Dars: **ikkala nuqsonni ham TEST emas, JONLI TEKSHIRUV
  topdi.** `closePdp` da belgi qolib ketishi va `openDetail` da tartib
  xatosi — ikkalasi ham AYNI sessiyada yozilgan kodda edi va Test 41
  ning birinchi bandi ularni ko'rmasdi (u tugmalar sinxronligiga
  qarardi). Test faqat SHUNDAN KEYIN yozildi. Ya'ni «yozilgan qoida
  himoya emas — uni tekshiradigan test himoya» oilasining yana bir
  yuzi: **test ham faqat O'ZI QARAYDIGAN narsani himoya qiladi**,
  yonidagi qatorni emas

- [2026-08-16] Qaror: **sotib olish qutisi QADALMAYDI; narx va tugmaning
  o'rnini yuqoridagi qator bosadi** (`.pdp-bar`). Founder shikoyati: «webda
  scroll qilsam shu qadalib pastga tushayabdi». Muqobili — qadalishni
  saqlab, faqat kesishmani tuzatish — RAD ETILDI: kechagi commitda aynan
  shunday qilingan edi (tor ekranda `position: static`) va nuqson keng
  ekranda QOLGAN edi, ya'ni tuzatish nuqsonning bir yuzini yopib
  ikkinchisini ochiq qoldirardi. Qator qutining O'RNINI bosadi, unga
  QO'SHIMCHA emas — shuning uchun quti ekranda turganda u chiqmaydi
  (aks holda bitta narx va bitta tugma ikki marta ko'rinardi)

- [2026-08-16] Qaror: **qadalgan qatorning `top` i har safar O'LCHANADI,
  `--header-h` dan olinmaydi.** Sabab o'lchov: 880px dan tor ekranda
  qidiruv ikkinchi qatorga tushadi va header o'sha o'zgaruvchidan baland
  bo'ladi (700px da 115px, 375px da 162px). Qattiq yozilgan qiymat qatorni
  header ostiga yashirardi — nuqson JIMGINA bo'lardi: konsolda xato yo'q,
  element DOM'da bor, shunchaki ko'rinmaydi. CSS dagi `top: var(--header-h)`
  faqat ZAXIRA sifatida qoldi

- [2026-08-16] Qaror: **o'xshash matolar `.product-grid` ustunlarini
  MEROS QILIB oladi — `.pdp-sim` ustunlar sonini qayta yozmaydi**, va
  ko'rinadigan kartochka soni ustunga BOG'LANADI (2/3/4 → 4/6/8), qattiq
  son yozilmaydi. Founder: «kartochkalar pastda ezilib o'z hajmini
  yo'qotayotgan edi, shunaqa yo'qotmasin hech qachon» + «2 qator bo'lib
  tursin». Sabab: kartochkaning O'ZI katalogdan NUSXALANADI, ya'ni uning
  o'lchami ham katalogdan kelishi TA'RIF bo'yicha kafolatlansin — ikkita
  mustaqil ro'yxat jimgina ajralib ketardi (`BTS_POINTS` oilasi). Qattiq
  son (masalan har doim 8) telefonda to'rt qator, desktopda ikki qator
  chiqarardi

- [2026-08-16] Qaror: **varaqa nishoni (`rel="icon"`) — FONSIZ belgi,
  `apple-touch-icon` esa KVADRAT bo'lib qoladi.** Founder: «admin
  panelnikidek qilgin». Ikkalasini tenglashtirish noto'g'ri bo'lardi: iOS
  uy ekranida fonsiz PNG ni oq fonga qo'yadi va anor rangdagi belgi
  rangsiz ko'rinardi. Ya'ni bu 2026-08-14 dagi «ikki yuz bir xil ko'rinishi
  SHART EMAS» mulohazasining takrori — farq uslubda emas, NISHONNI
  ISHLATADIGAN MUHITDA

- [2026-08-16] Qaror: **mahsulot detali saytda TO'LIQ SAHIFA, drawer emas —
  va eski ko'rinish OLIB TASHLANDI.** Founder Uzum referensini berdi. Ikkala
  yo'l qoldirilsa ayni mahsulot ikki xil ko'rinishda ochilardi va har
  o'zgarish ikki joyda takrorlanardi. ⚠️ Qaror FAQAT SAYTGA tegishli —
  **Mini App'ga tegilmadi va bu founder sharti edi**: u yerda mahsulot
  allaqachon o'z ekranida yashaydi, ya'ni ko'chiriladigan narsa yo'q
  (2026-08-13 dagi «shunday qilgin» darsi — ikkinchi yuzda muammo yo'q
  bo'lsa, shaklni ko'chirish ortiqcha ish tug'diradi)

- [2026-08-16] Qaror: **sahifa `index.html` ICHIDA, yangi HTML fayl
  OCHILMADI.** Sabab texnik va aniq: CI faqat `deploy.yml` `source`
  ro'yxatidagi fayllarni chiqaradi, yangi ildiz fayli QO'LDA qo'shilishi
  shart va unutilsa nginx `try_files` tufayli **HTTP 200 + HTML** qaytarib
  nosozlikni sog'lom ko'rsatardi. Eski banddagi boshqa ikki sabab
  (marshrutlash murakkabligi) esa TEKSHIRILGANDA yiqildi

- [2026-08-16] Qaror: **`og:` meta uchun server yo'li IXTIYORIY qoladi.**
  nginx `/mahsulot/` ni backend'ga yo'naltirmasa sayt TO'LIQ ishlaydi,
  faqat oldindan ko'rish umumiy bo'ladi. Sabab: mahsulot sahifasini
  backend'ga bog'lash butun katalogni bitta yiqilish nuqtasiga
  ulardi — hozir faqat `/api/*` yiqiladi, sahifa esa ochilaveradi.
  Shu naqsh R2 va brend tasmasi bandlarida ham qo'llanilgan: **qo'shimcha
  qulaylik asosiy yo'lni yiqitmasin**

- [2026-08-16] Qaror: **referensdagi chegirma, taymer, bo'lib to'lash va
  «307 kishi oldi» KO'CHIRILMADI.** Bunday ma'lumot bazada yo'q, ya'ni uni
  ko'rsatish TO'QISH bo'lardi. «Panelda o'ylab topilgan raqam
  ko'rsatilmasin» qoidasi paneldan tashqarida ham amal qiladi: referens
  raqamning MANBAINI keltirmaydi, faqat SHAKLINI

- [2026-08-16] Qaror: **kartochka `id` dan `data-*` ga o'tdi.** «O'xshash
  matolar» katalog kartochkasini `cloneNode` bilan nusxalaydi (founder:
  «kartochka o'zgarmasin»), ya'ni bitta kartochka sahifada ikki joyda
  turadi. `id` global va TAKROR bo'lolmaydi — `getElementById` ikkinchi
  nusxani ko'rmasdi. Nusxalash o'rniga kartochkani qayta chizish varianti
  rad etildi: o'shanda kartochka MANTIG'I ikki joyda yashardi

- [2026-08-16] Qaror: **qiymati yo'q tafsilot qatori CHIZILMAYDI —
  «—» ham, «0» ham qo'yilmaydi.** «Muddat aytilmagan» va «muddat nol» ikki
  xil fakt; o'rniga belgi qo'yish bo'shliqni MA'LUMOTGA aylantiradi.
  ⚠️ Qoida allaqachon saytda bajarilardi va Mini App'da bajarilmasdi —
  shuning uchun bu qaror emas, **TARQATISH**: «bir yuzda o'rganilgan qoida
  ikkinchi yuzda ham qidirilsin» (`authUser()` naqshi bilan bitta oila)

- [2026-08-16] Qaror: **`esc()` chegarasi «kim yozadi» ga emas, «qayerga
  chiqadi» ga qarab qo'yiladi.** `width`/`weight` ni bugun hech kim
  yozmaydi, ya'ni hujum yo'li ochilmagan — lekin ular `innerHTML` ga
  boradi, demak chegara ichida bo'lishi kerak. Aks holda himoya kelajakdagi
  e'lon shakliga qarzga qolardi

- [2026-08-16] Qaror: **xaridor statistikasi BAZADAN, umr bo'yi — klientdagi
  ro'yxatdan EMAS.** Sabab: ro'yxat `LIMIT 50` bilan keladi, ya'ni undan
  hisoblangan har qanday «jami» aslida OYNA. ⚠️ Lekin qoida hamma raqamga
  tarqatilmadi: ♡ soni ataylab ro'yxatdan sanaladi, chunki u xaridor OCHA
  OLADIGAN ro'yxat bilan mos bo'lishi shart — bazadagi 12 ta ♡ katalogda 9
  ta bo'lib chizilsa, karta bilan ekran zid bo'lardi. Mezon shu:
  **raqam ro'yxat bo'lib chizilsa — ro'yxatdan, chizilmasa — bazadan.**

- [2026-08-16] Qaror: **statistika `/api/me` ga qo'shildi, yangi endpoint
  OCHILMADI.** «Men kimman» javobi allaqachon o'sha qatorni o'qiydi va
  Mini App uni har ochilishda so'raydi — alohida yo'l qo'shilsa ikkinchi
  so'rov, ikkinchi rate limit va ikkinchi eskirish nuqtasi paydo bo'lardi
  (CLAUDE.md — mavjud funksiyaning ustiga ikkinchi yo'l qo'shilmasin).

- [2026-08-16] Qaror: **statistika yiqilsa `/api/me` yiqilmaydi** — `stats`
  `null` qaytadi, klient mahalliy hisobga tushadi. Sabab: rol, telefon va
  manzil kartaning KIMLIGI, statistika esa BEZAGI; bezak uchun kimlikni
  yo'qotib bo'lmaydi (R2 va tasma bandlari bilan bitta naqsh). Xato
  YUTILMAYDI — `console.error` alertga chiqadi, aks holda so'rov har safar
  yiqilib turgani oylab bilinmasdi (`ALERT_CHAT_ID` darsi).

- [2026-08-16] Qaror (founder): **rasm sifati SAYT o'lchoviga bog'lanadi —
  Mini App fayli qayta ishlatilmaydi.** Founder «rasm sifati xira» dedi va
  sabab o'lchandi: `1200 × 338` fayl Mini App uchun chizilgan, sayt uchun
  esa KICHIK (cho'zilish telefonda 1.30x, retina monitorda 2.08x). Founder
  `4800 × 2000` masterlar keltirdi va kesish BIZ tomonda bajarildi —
  paketdagi tayyor kesimlar ISHLATILMADI, chunki o'z kesimimiz yaxshiroq
  chiqdi (ad-3: 80 → 25 KB). ⚠️ Ya'ni «bir xil rasm» va «bir xil SIFAT»
  BOSHQA narsa: ikki yuz bir xil ko'rinishi kerak, bir xil FAYLdan
  oziqlanishi esa shart emas — kadr har yuzning O'Z o'lchoviga kesiladi.

- [2026-08-16] Qaror: **har kesim IKKI o'lchamda beriladi (`srcset` +
  `sizes`), bitta emas.** TZ da bu yo'q edi, o'lchov qo'shtirdi: bitta
  o'lcham bo'lsa DPR1 noutbuk ham eng katta faylni tortardi. Diskdan qayta
  o'lchandi (o'nlik KB): DPR2 telefon **51**, DPR3 telefon **231**, DPR1
  noutbuk **79**, DPR2 monitor **201**. Kichik o'lchamlarsiz DPR2 telefon
  4.5x, DPR1 noutbuk 2.5x ortiq tortardi. 🔴 **DPR3 telefon yo'li (231 KB)
  sessiyada UMUMAN o'lchanmagan edi va u eng og'iri** — `ad-2` ning o'zi
  159 KB; kelasi partiyada birinchi qaraladigan raqam shu.
  ⚠️ Siqilish darajasi ham TANLANMADI, o'lchandi: `q62`–`q86` orasida
  ekrandagi farq 255 dan 1.4–2.2 (1% dan kam), ya'ni yuqori sifat faqat
  baytga tushadi — `q72` olindi. Bu «hujjatdagi raqam — tekshirilmagan
  da'vo» qoidasining IJOBIY ko'rinishi: o'lchov qarorni arzonlashtirdi.

- [2026-08-16] Qaror: **TZ ham tekshirilmagan da'vo saqlaydi — u yozilgach
  NATIJASI bilan solishtirilsin.** TZ da «telefon kesimi masterning
  O'RTASIDAN» deb yozilgan edi va bu XATO bo'lib chiqdi: kesim ekranga
  `object-fit: cover` bilan chiziladi, telefon slaydi 2:1 dan torroq
  (375px da 1.56), ya'ni brauzer yon tomonlardan YANA ~22% ini oladi —
  ikki kesish ustma-ust tushib mato butunlay kadrdan chiqdi va banner bo'sh
  bej quti bo'lib ko'rindi. Tuzatish taxmin bilan emas: mato boshlanishi
  ustunlar RANGDORLIGI bilan o'lchandi va kesim `S = matoBoshi − 2686`
  formulasi bilan surildi. **TZ tuzatildi** — formula, jadval va dizaynerga
  eslatma (mato masterning **68–72%** idan boshlansin; 78% kech). ⚠️ Eng
  muhimi: TZ tuzatilmasa xato KEYINGI PARTIYADA aynan takrorlanardi, ya'ni
  hujjatdagi yolg'on bir marta emas, HAR SAFAR zarar keltirardi.
  «Prompt — kod emas, MATN» bandi bilan bitta oila.

- [2026-08-16] Qaror: **yangi rasm — YANGI NOM, eskisining ustiga
  yozilmaydi.** `sw.js` rasmlarni `cacheFirst` bilan beradi: eski nom
  ustiga yozilsa qaytib kelgan foydalanuvchi ESKI XIRA rasmni ko'rardi va
  yangisi faqat keyingi tashrifda kelardi — ya'ni tuzatish o'zi
  tuzatayotgan odamga yetib bormasdi. Bu `?v=` va R2 kaliti qoidalari
  bilan bitta oila (kesh kaliti — TO'LIQ URL). ⚠️ Serverda eski fayllar
  QOLADI: deploy nusxalaydi, o'chirmaydi — ular chaqirilmaydi, ya'ni
  zararsiz, lekin «deploy eski faylni tozalaydi» deb o'ylanmasin.

- [2026-08-16] Qaror: **da'vosi yolg'onga aylangan qorovul O'CHIRILMAYDI,
  ALMASHTIRILADI.** Test 32 ning 5-bandi sayt va Mini App rasmlarini
  bayt-ma-bayt solishtirardi; sayt o'z kesimlariga o'tgach shart yolg'on
  bo'ldi. Uch yo'ldan ikkitasi noto'g'ri edi — o'sha holicha qoldirish
  testni doim qizil ushlab turardi (va qizil test o'qilmay qoladi),
  o'chirib yuborish esa qorovulni JIMGINA yo'qotardi. Uchinchisi
  tanlandi: band **almashtirildi** — endi sayt to'plamining to'liqligi
  (15 fayl), `index.html` havolalari va vaqtinchalik choraning
  qaytmasligi tekshiriladi, ro'yxat `AD_SLIDES` dan olinadi. **3 mutatsiya
  bilan sinaldi, uchtasi ham ushlandi.** ⚠️ Yo'l-yo'lakay: `style.css`
  mutatsiyasida **Test 16 OLDINROQ otiladi**, ya'ni Test 32 ni sinash
  uchun hash birga yangilansin (2026-08-14 dagi `app.js` bandining
  `style.css` uchun takrori).

- 🔴 [2026-08-16] **OCHIQ QAROR — javob kutilmoqda: Mini App banneri ham
  yangi masterlardan qayta kesilsinmi?** Bugundan boshlab sayt yangi
  `4800 × 2000` masterlardan, Mini App esa 2026-08-15 dagi eski
  generatsiyadan oziqlanadi — ya'ni **ikki yuzda ikki xil mato**, va
  kechagi commitning butun maqsadi aynan ularni tenglashtirish edi.
  Founder'ga ikki marta savol berildi: **(a)** Mini App'ning `1200 × 338`
  lari ham shu masterlardan qayta kesilsin (**tavsiya** — aks holda «ikki
  yuz bir xil» qarori jimgina yo'qoladi), **(b)** eskisida qolsin.
  **Javob kelmadi** — founder «commit qil, deploy qil» dedi, shuning
  uchun Mini App'ga **ATAYLAB tegilmadi**: bu boshqa yuz va o'zgartirish
  tasdiqlanmagan (2026-08-13 dagi «mavjud narsa ustiga ikkinchi yo'l
  qo'shilsa — avval so'raladi» bandining ruhi). Savol Test 32 izohida ham
  yozilgan, ya'ni u hujjatda ham, kodda ham ko'rinadi.

- [2026-08-16] Qaror: **shrift chegarasi founder qoidasidan HISOBLANADI,
  didan tanlanmaydi.** Sarlavha `19→24px` (telefon), `34→42px` (keng
  ekran). 24px — TAXMIN emas, CHEGARA: founderning «sarlavha har doim ikki
  qator» qoidasi (2026-08-15) 26px da buzildi — eng uzun matn uchinchi
  qatorga tushdi. ⚠️ Kattalashgan sarlavha eski matn zonasiga sig'magani
  uchun telefonda `.ad-copy` 65% → **72%** ga kengaydi va **rasm TZ si ham
  shu raqamdan kelib chiqadi** (mato o'ng 28% da boshlansin): ya'ni
  tipografiya va rasm brifi BOG'LANGAN — biri o'zgarsa ikkinchisi qayta
  hisoblansin.

- [2026-08-16] Qaror: **`git checkout <fayl>` — «almashtirishni qo'lga
  kiritmasdan eskisini o'chirma» qoidasining KO'RINMAYDIGAN a'zosi.**
  Mutatsiya sinovidan keyin tozalash uchun `git checkout style.css
  index.html` yozildi va commit qilinmagan ish o'chib ketdi (qaytadan
  yozildi, yo'qotish yo'q). Qoida `rm -rf` naqshi haqida yozilgan edi,
  lekin `git checkout` aynan shu narsani qiladi: u «o'chirish» so'zini
  ishlatmaydi, «tozalash» dek tuyuladi va zarari bir xil —
  **almashtiriladigan narsa qo'lda YO'Q holda eskisi yo'q qilinadi.**
  Amaliy shakl: mutatsiya sinovidan OLDIN zaxira nusxa olinadi
  (`cp fayl fayl.bak`) va tiklash `git checkout` dan emas, o'sha nusxadan
  bo'ladi. Sinov davomida shunday qilindi.

- [2026-08-16] ~~Qaror: **telefonda `object-position: 62%`**~~ —
  🔴 **BEKOR QILINDI O'SHA KUNI KECHQURUN** (yuqoridagi «rasm sifati sayt
  o'lchoviga bog'lanadi» qarori). Asl matn: rasm 32:9, sayt slaydi undan
  baland, 375px da `cover` rasm enining atigi ~44% ini ko'rsatadi va
  `center` da mato butunlay kesilardi — shuning uchun kadr 62% ga surildi.
  **Nima uchun bekor bo'ldi:** qaror NOTO'G'RI emas edi — u tayangan
  MANBA o'zgardi. Telefon uchun ALOHIDA 2:1 kesim paydo bo'lgach kadrning
  ~78% i ko'rinadi, ya'ni `center` to'g'ri ishlaydi va surish endi foyda
  emas, ZARAR berardi. ⚠️ Bu naqsh bir hafta ichida IKKINCHI marta
  (`touch-action: pan-y`, 2026-08-14): **vaqtinchalik chora asosiy nuqson
  tuzatilganda o'z-o'zidan yo'qolmaydi — uni ATAYLAB olib tashlash
  kerak**, shuning uchun qaytmasligi Test 32 bilan qulflandi. Yozuv
  o'chirilmadi: bekor qilingan qarorni o'chirish uni kelajakda qaytadan
  «kashf qilinadigan» qiladi.

- [2026-08-16] Qaror (founder): **saytdagi banner Mini App'niki bilan
  TO'LIQ tenglashadi — dizayn, rasm va MATN — faqat BALANDLIK saytniki.**
  Founder o'lchamni ikki qadamda berdi: avval «20% ga qisqartir», keyin
  «+10% katta qilgin» — natija eskisining **0.88** i. ⚠️ Ya'ni «bir xil
  qil» bu yerda **shakl + mazmun, o'lcham esa ALOHIDA** degani. Buni
  boshida so'ramaslik bir marta ish qaytishiga olib keldi: birinchi
  urinishda faqat mexanika ko'chirilib, rasm va matn saytnikida qolgan
  edi. **Qoida sifatida:** «falonchidek qil» degan topshiriq olinganda
  QAMROV aniqlanadi — mexanikami, ko'rinishmi, matnmi, o'lchammi —
  va shundan keyin kod yoziladi (2026-08-13 dagi «shunday qilgin»
  bandining teskari yuzi: u yerda ORTIQCHA, bu yerda YETMAGAN ish chiqdi).

- [2026-08-16] Qaror: **banner rasmlari saytda `assets/ads/` da, ya'ni
  `telegram-app/assets/ads/` NUSXASI.** Nusxa MAJBURIY, chunki landing
  HTML'i `telegram-app/...` yo'liga ishora qila olmaydi — serverda o'sha
  papka `mini-app/` deb ataladi va havola 404 bo'lardi; CI ham ikkalasini
  alohida qadam bilan chiqaradi. Nusxaning xavfi `BTS_POINTS` bilan bitta
  oila — ikki yuz jimgina AJRALIB KETADI, buni na konsol, na testlar
  ko'rsatardi. Shuning uchun qaror **qorovul bilan birga qabul qilindi:**
  Test 32 → 5-band ikki nusxaning `sha256` ini solishtiradi, ro'yxatni
  `AD_SLIDES` dan oladi (yangi slayd avtomatik qamraladi) va ikki
  mutatsiya bilan sinaldi. «Yozilgan qoida himoya emas — uni tekshiradigan
  test himoya» oilasidan.

- [2026-08-16] Qaror: **saytdagi 1-slayd AI ekraniga EMAS, katalogga olib
  boradi.** Saytda AI ekrani YO'Q — AI bloki har mahsulotning o'z sahifasida
  (`aiSection` → `detailHtml`), ya'ni AI ga yagona yo'l mato tanlashdan
  o'tadi. Mini App'da o'sha slayd `tab('ai')` ga tushadi va **bu farq
  ATAYLAB:** «AI ochiladi» deb ko'rsatilgan, aslida boshqa joyga tushiradigan
  banner soxta tugma bo'lardi. Ikki yuz bir xil KO'RINISHI shart, bir xil
  ISHLASHI esa faqat orqasidagi narsa ikkalasida ham bor bo'lganda shart
  («Hisobdan chiqish» bandi bilan bitta mulohaza: farq uslubda emas,
  ortidagi mavjudlikda).

- [2026-08-16] ~~Qaror: **telefonda `object-position: 62%`** —
  `center` EMAS.~~ 🔴 **BEKOR QILINDI O'SHA KUNI KECHQURUN** — to'liq
  izohi yuqorida (Qarorlar ro'yxatining boshida). Asl matn: rasm 32:9,
  sayt slaydi undan baland, ya'ni 375px da
  `cover` rasm enining atigi ~44% ini ko'rsatadi va standart markazda
  o'ngdagi mato burmasi butunlay kesilib, banner tekis bej quti bo'lib
  qolardi. Raqam TAXMIN emas, o'lchovdan: 62% da oyna 34.8–78.7% ga
  tushadi — chapda matn zonasi ochiq, o'ngda mato ko'rinadi. ⚠️ Nuqson
  faqat **KO'Z** bilan ko'rindi (screenshot) — testda ham, konsolda ham
  izi yo'q edi: CSP va flex bandlaridagi «jimgina nuqson» oilasidan.
  ⚠️ **Nima uchun bekor bo'ldi:** telefon uchun ALOHIDA 2:1 kesim paydo
  bo'lgach kadr allaqachon shu shakl uchun tanlangan — surish foyda emas,
  ZARAR berardi. Qaror noto'g'ri emasdi, u tayangan RASM o'zgardi.

- [2026-08-15] Qaror (founder): **banner KARUSEL — qo'shni slaydning cheti
  ko'rinib tursin, nuqta va strelka esa YO'Q.** Ikkalasi bitta qarorning
  ikki yuzi: «yana banner bor» degan xabarni qo'shni slaydning O'ZI beradi,
  ya'ni buni takrorlaydigan nuqtalar ortiqcha qatlam bo'lib qoladi. Chet
  o'lchami ikki marta kamaytirildi (18 → 10 → **6px**): founder 18px ni
  «chalg'itadi» dedi, 10px da «yana ozgina». 6px — qo'shni BOR ekanini
  bildiradi, MATNINI esa ko'rsatmaydi (`.ad-copy` chapdan 16px da
  boshlanadi). Joriy slayd sahifaning boshqa bloklari bilan bir chiziqda
  qoladi — `margin: 0 -16px` + `padding: 0 16px` (`.cat-chips` naqshi).

- [2026-08-15] Qaror: **karusel skrollini BRAUZER qiladi, JS emas**
  (`overflow-x: auto` + `scroll-snap`). Sabab: barmoq ortidan yurish va
  inersiya bepul keladi, va yon foyda TEXNIK EMAS, XATTI-HARAKATDA —
  surishdan keyin `click` UMUMAN kelmaydi, ya'ni «surish bosish deb
  hisoblanmasin» uchun yozilgan qo'l kodi (`adSwiped`, 45px chegara) butunlay
  ortiqcha bo'ldi. Kod kamaydi, chunki MEXANIKA to'g'ri tanlandi.
  ⚠️ **`scrollend` ISHLATILMAYDI — iOS WebView'da YO'Q.** O'rniga `scroll` +
  120 ms tinchlik. Bu qoida, chunki unga tayanilsa karusel aynan Telegram
  ichida (yagona haqiqiy muhitda) klonda qotib qolardi, brauzerda esa
  hammasi joyida ko'rinardi — «bir yuzda ishlab ikkinchisida ishlamaydigan»
  oila.

- [2026-08-15] Qaror: **`touch-action: pan-x pan-y`** — 2026-08-14 dagi
  `pan-y` qarorining O'RNIGA (quyida BEKOR deb belgilangan). Qiymat
  mexanikaga ergashadi: gorizontal endi brauzernikiga qoldirildi, ya'ni faqat `pan-x`
  sahifa vertikal skrollini o'ldiradi, faqat `pan-y` — karuselni. Ikkalasi
  ham yozilishi SHART.

- [2026-08-15] Qaror: **`AD_SLIDES.img` — KENGAYTMASIZ asos
  (`assets/ads/ad-1`), `.webp`/`.jpg` ni chizish kodi qo'shadi.** Sabab:
  yangi slayd qo'shilganda ikki yo'lni alohida yozib qo'yish kerak bo'lardi
  va bittasi esdan chiqsa **brauzerning bir qismi rasm, boshqasi bo'sh joy**
  ko'rardi — jimgina, konsolda xatosiz. Qorovul — Test 32: ikkala kengaytma
  ham diskda borligi VA chizishda ishlatilishi tekshiriladi (faqat «diskda
  bor» tekshiruvi yolg'on ishonch berardi).

- [2026-08-15] Qaror (founder): **sarlavha HAR DOIM ikki qator, qo'shimcha
  so'z esa sarlavhaning OXIRGI SO'ZIDAN KEYIN chip bo'lib turadi** (ustidagi
  `eyebrow` qatori o'chirildi). Ikki qator — uch slayd bir xil balandlikda
  tursin, almashganda «sakramasin»; chip esa matn OQIMIDA, ya'ni
  `<br>` bilan bo'lingan sarlavhada u o'zi ikkinchi qatorga tushadi va
  joyini alohida hisoblash kerak emas.

- [2026-08-15] Qaror: **CSS izohi ham o'lchov bilan tekshiriladi.** Ortiqcha
  `*/` `.ad-banner` qoidasini BUTUNLAY o'chirib yuborgan edi va ko'z buni
  ko'rmadi — banner «biroz boshqacha» ko'rinardi, konsol toza edi. Topilishi
  faqat `getBoundingClientRect()` tufayli bo'ldi. Ya'ni CLAUDE.md dagi «flex
  bolasini KO'Z bilan emas, O'LCHOV bilan tekshir» bandi CSS ning O'ZI
  yo'qolib qolgan holatga ham taalluqli: yo'q qoida ham, siqilgan blok ham
  bir xil «shunchaki biroz boshqacha» bo'lib ko'rinadi.

- [2026-08-14] Qaror (founder): **deep-link manba belgisining shakli QAT'IY
  QOLADI, o'zgaradigan narsa — JIMLIK.** Telegram `?start=Instagram` va
  `?start=guruh-ipak` ga ruxsat beradi, biz esa faqat `[a-z0-9_]{2,32}` ni
  qabul qilamiz. Shaklni kengaytirish rad etildi: `IG` va `ig` panelda IKKI
  qatorga bo'linib, bitta kanal ikkita kanal bo'lib ko'rinardi — ya'ni
  «hammasini qabul qilamiz» yechimi o'lchovni tuzatmasdi, boshqa tomondan
  buzardi. O'rniga rad etish **alertga chiqadi** (`manbaAniqla`): havola
  noto'g'ri yozilgan bo'lsa biz buni o'sha kuni bilamiz, oy oxirida
  «kanal nol berdi» degan yolg'on hisobot orqali emas.

- [2026-08-14] Qaror: **`console.error` NUQSON BO'LMAGAN hodisa uchun ham
  ishlatiladi, agar u BIZ KO'RISHIMIZ KERAK bo'lgan yagona hodisa bo'lsa.**
  AI qayta urinishi yordam berganda alert ketadi, garchi bu muvaffaqiyat
  bo'lsa ham. Sabab: `console.log` journalctl'da yotadi va hech kim
  o'qimaydi — ya'ni «kod ishladi» degan fakt hech qachon ko'zga
  ko'rinmasdi va band mangu ochiq qolardi. ⚠️ **Chegara ham qat'iy:**
  odatdagi muvaffaqiyat (birinchi urinishda rasm) JIM qoladi — har hodisa
  alert yuborsa tom to'lib, haqiqiy signal ko'milib ketardi. Qoida:
  **alertga NODIR va MA'NOLI hodisa chiqadi, tez-tez bo'ladigani emas.**

- [2026-08-14] Qaror: **jimgina noto'g'ri ishlaydigan sozlama uchun QOROVUL
  YOZILADI, hujjatga ogohlantirish yozish YETARLI EMAS.** `SELLER_TG_IDS`
  🔴 ogohlantirishi CLAUDE.md da 2026-08-13 dan beri turardi va shunga
  qaramay ro'yxat `.env` da umuman to'ldirilmagan edi. Bu «yozilgan qoida
  himoya emas — uni tekshiradigan test himoya» oilasining yangi a'zosi,
  faqat bu safar tekshiruvchi test emas, **ishlab turgan serverning o'zi**:
  holat kod emas, MA'LUMOT darajasida buziladi, ya'ni testda ko'rinmaydi.

- [2026-08-14] Qaror: **qorovul manba kodidan MATN qidirmasin — XATTI-HARAKATNI
  bajarib ko'rsin, agar bajarish imkoni bo'lsa.** Deep-link ogohlantirishining
  birinchi qorovuli `console.error(...` satrini qidirardi va mutatsiyada
  `if (false)` qo'yilganda YASHIL qoldi. Endi test funksiyani haqiqatan
  chaqiradi va `console.error` ni ushlaydi. ⚠️ Buning ARXITEKTURAVIY narxi
  bor va u ataylab to'landi: ogohlantirish `/start` ichidagi oddiy `if`
  bo'lolmaydi — u **qiymat qaytaradigan o'ramga** ko'chirildi, aks holda
  chaqirib sinab bo'lmasdi. Ya'ni **sinaladigan qilish uchun kod shakli
  o'zgardi.** Matn skanerlash faqat bajarib bo'lmaydigan joyda qoladi
  (CSS, HTML, migratsiya tartibi) va u yerda ham mutatsiya bilan sinaladi.

- [2026-08-14] Qaror (founder): **sevimlilar BAZADA saqlanadi, brauzer
  xotirasida emas** («sevimlilarni bazaga saqlaydigan qilamiz»). Sabab
  mahsulotdan: B2B xaridor telefonda ham, kompyuterda ham kiradi, sevimli
  ro'yxati esa «Saqlangan matolar» ekranining YAGONA mazmuni — qurilmaga
  bog'liq bo'lsa ekran bir joyda to'la, boshqasida bo'sh ko'rinardi.
  ⚠️ **`localStorage` zaxira sifatida ham QO'SHILMAYDI:** ikkita haqiqat
  manbai bo'lsa, boshqa qurilmada olib tashlangan sevimli bu yerda jimgina
  TIRILARDI — `pickup_point` (`db/022`) da aynan shu tuzatilgan edi.

- [2026-08-14] Qaror: **optimistik yangilanish RUXSAT ETILADI, lekin u
  MAJBURAN orqaga qaytariladigan bo'lsin.** ♡ bosilganda ekran darrov
  o'zgaradi (tarmoqni kutib turgan tugma «ishlamadi» deb o'qiladi), server
  rad etsa yoki tarmoq yiqilsa holat ORQAGA qaytariladi VA foydalanuvchiga
  aytiladi. Sabab: qaytarilmasa xaridor saqlanmagan matoni saqlangan deb
  o'ylab yurardi — bu `NULL` reyting va `ALERT_CHAT_ID` bilan bitta oila
  (**jimgina yolg'on yo'qlikdan yomonroq**). Jim qaytarish ham yaramaydi:
  u «tugma o'zi o'chdi» bo'lib ko'rinardi. **Yangi optimistik UI qo'shilsa
  shu uchlik shart: darrov chiz → rad etilsa qaytar → ayt.**

- [2026-08-14] Qaror: **holat yozadigan endpoint «teskarisiga o'zgartir»
  emas, ANIQ QIYMAT qabul qiladi** (`{ liked: true|false }`). Sabab: toggle
  natijasi bosish TARTIBIGA bog'liq — tez ikki bosishda yoki ikki qurilma
  bir vaqtda yozganda holat oldindan aytib bo'lmaydigan bo'lardi; aniq
  qiymat esa yozuvni idempotent qiladi va qayta urinish xavfsiz bo'ladi.

- [2026-08-14] Qaror: **MIJOZ xatosini bildiruvchi baza kodi (`23503` — FK)
  `console.error` ga TUSHIRILMAYDI.** U alert guruhlash kaliti orqali
  Telegram'ga chiqadi, ya'ni o'ylab topilgan mahsulot id yuborgan bitta
  qiziquvchan mijoz alert tomini to'ldirib yuborardi va tom haqiqiy
  nosozlikni ko'rsatmay qolardi. Bunday xato jim `404` bilan qaytariladi.
  **Yangi endpoint qo'shilganda birinchi savol: bu xato SERVER nosozligimi
  (alertga chiqsin) yoki MIJOZ yuborgan noto'g'ri ma'lumotmi (chiqmasin)?**

- [2026-08-14] Qaror: **`app.js` ga tegadigan mutatsiya sinovida Test 16
  jadvalidagi hash MUTATSIYA BILAN BIRGA yangilanadi.** Aks holda kesh
  qorovuli oldinroq yiqilib runner'ni to'xtatadi va «mutatsiya ushlandi»
  degan xulosa NOTO'G'RI qorovulni o'lchagan bo'ladi — tekshirilayotgan
  test umuman ishlamasa ham natija bir xil ko'rinadi. Bu qoida 2026-08-13
  da Test 25 sinovida topilgan edi va **2026-08-14 da ikkinchi marta
  takrorlandi**, ya'ni u tasodif emas, `app.js` ga tegadigan har qanday
  sinovning doimiy tuzog'i («tekshirdim ≠ to'g'ri narsani tekshirdim»).

- [2026-08-14] Qaror (founder): **reklama banneri nisbati 16:9 EMAS, 16:4.5
  (= 32:9).** Dastlab 16:9 taklif qilingandi, founder «juda baland,
  kartochkalarga halaqit beradi» dedi. Qaror TAXMIN bilan emas, O'LCHOV bilan
  yopildi: kartochka ko'rinishi **171px → 271px**, ya'ni banner ostida to'liq
  bir qator kartochka qoladi. Balandlik CSS'da qat'iy yozilmaydi —
  `aspect-ratio` dan kelib chiqadi, shunda hamma qurilmada o'zi to'g'ri
  chiqadi va bitta joyda o'zgaradi.

- [2026-08-14] Qaror (founder): **CTA tugmasi YO'Q — butun banner bosiladi**
  («cta tugmasini shart emas bannerga bosganda ishlaydigan qilamiz»). Sabab
  yuqoridagi qarordan KELIB CHIQDI: 101px balandlikda 38px tugma bannerning
  ~70% ini yeb, sarlavhaga joy qoldirmasdi. Ya'ni nisbatni pasaytirish
  tugmani ham olib tashladi — bitta qaror ikkinchisini ergashtirdi va buni
  yozib qo'yish kerak, aks holda kelajakda «CTA qo'shaylik» degan taklif
  o'sha yopilgan bo'shliqqa qaytadi.

- [2026-08-14] Qaror: **banner matni RASMDA emas, KODDA
  (`AD_SLIDES` → `{ uz, ru }`).** Sabab mahsulotdan: Mini App ikki tilli va
  sarlavha rasmga chizilsa **rus xaridori o'zbekcha sarlavha ko'rardi** —
  uni tuzatish rasm qayta chizishni talab qilardi. Rasm faqat FON bo'lib
  qoladi (chap yarmi ataylab tinch). Yon foyda: matn tuzatish = bitta satr,
  yangi slayd = bitta obyekt, chizish kodiga tegilmaydi.
  ⚠️ `docs/dizayn-tizimi/reklama-banner-spec.md` dagi jadvalda hamon «Matn:
  sarlavha rasm ichida» deb turibdi — spec ISH MATERIALI, kod esa haqiqat
  manbai.

- [2026-08-14] Qaror: **bosh sahifa chizadigan YAGONA nuqta — `paintHome()`,
  va bu nuqsonni tuzatish emas, TAKRORLANISHINI oldini olish.**
  `renderHome()` to'rt joydan chaqirilardi va uchtasi `render()` dan
  o'tmasdi; mount faqat `render()` ga ulansa banner kategoriya bosilganda
  JIMGINA muzlab qolardi (rasm turadi, nuqtalar o'lik, konsol toza). Bu
  `authUser()` → `requestUser()` naqshining aynan o'zi, ya'ni loyihada
  IKKI marta takrorlangani isbotlangan naqsh — shuning uchun «eslab
  qolaman» yechim sifatida qabul qilinmadi. Qorovul — **Test 32**:
  yozilgan qoida himoya emas, uni tekshiradigan test himoya.

- [2026-08-14] ~~Qaror: **banner ustida `touch-action: pan-y`**~~ —
  🔴 **BEKOR QILINDI 2026-08-15** (yuqoridagi `pan-x pan-y` qarori).
  Asl matn: kategoriya chiplaridagi `pan-x` ning ataylab TESKARISI —
  chiplarda gorizontal skroll brauzernikiga qoldiriladi, bannerda esa
  gorizontalni JS boshqaradi va brauzerga vertikal qoladi.
  **Nima uchun bekor bo'ldi:** banner karuselga aylanganda gorizontal ham
  brauzerga o'tdi, ya'ni qaror noto'g'ri emas edi — u tayangan MEXANIKA
  o'zgardi. Yozuv o'chirilmadi: bekor qilingan qarorni o'chirish uni
  kelajakda qaytadan «kashf qilinadigan» qiladi.

- [2026-08-14] Qaror: **banner ish materiallari `docs/dizayn-tizimi/` da,
  `telegram-app/` da EMAS** (spec, uchta HTML demo, xom rasmlar, ikki
  shrift). Sabab bir kun oldin o'rganilgan: `deploy.yml` Mini App papkasini
  `telegram-app/*` bilan BUTUNLAY serverga ko'chiradi, ya'ni `telegram-app/`
  ichiga qo'yilgan ichki material `lolamarket.uz/mini-app/...` da hammaga
  ochiq turardi (`94c298e`). Production'ga faqat `assets/ads/ad-1..3.jpg`
  chiqadi. ⚠️ **2026-08-15 dan yoniga `ad-1..3.webp` ham qo'shildi** —
  qoida o'zgarmadi, ro'yxat kengaydi (`<picture>` zaxirasi); yangi brief
  (`banner-dizayn-brief.md`) esa o'sha ish materiali papkasida qoladi.
  ⚠️ **2026-08-16 dan sayt ro'yxati YANA o'zgardi va endi u qo'lda
  sanalmaydi:** eski 6 fayl o'chdi, o'rniga 15 ta kesim keldi
  (`ad-N-{w,m}-<en>.{webp,jpg}`) — ro'yxatni **Test 32** `AD_SLIDES` dan
  hosil qiladi. Qoidaning O'ZI o'zgarmadi: masterlar va TZ
  (`banner-rasm-tz.md`) ish materiali sifatida `docs/dizayn-tizimi/` da
  qoladi, production'ga faqat kesimlar chiqadi.
- [2026-08-14] Qaror: **buyurtma tarixi BUGUNGI KATALOGGA bog'lanmaydi —
  nom va narx BUYURTMA YOZUVIDAGI snapshotdan olinadi.** Katalog faqat
  RASM uchun ishlatiladi va u yo'q bo'lsa qator baribir chiziladi
  (`orderLine()`). Sabab ikkita va ikkinchisi jimroq: (1) katalogdan
  chiqqan mahsulot butun ekranni qulatardi, (2) narx o'zgargan kuni
  tarixda xaridor to'lagan summa emas, BUGUNGI summa ko'rinardi.
  ⚠️ **Qoida umumiy: tarix o'zi haqidagi ma'lumotni O'ZIDA saqlaydi.**
  Buyurtma, sharh, bahs kabi "sodir bo'lgan narsa" yozuvi hech qachon
  o'zgaruvchan jadvaldan qayta hisoblanmasin — bu `recordStatusChange()`
  va `NULL` reyting qoidalari bilan bitta oilada.
  ⚠️ Istisno ATAYLAB qoldirildi: **savat** katalogga bog'liq bo'lib
  qolaveradi va katalogda yo'q mahsulot savatga qo'shilmaydi
  (`reorderOrder`). Savat — kelajakdagi buyurtma, ya'ni mavjud narsadan
  yig'ilishi SHART; tarix esa o'tmish va u mahsulotsiz ham haqiqiy.
  Qorovul: `server/test.js` → Test 30.

- [2026-08-14] Qaror: **`users.phone` da TASDIQLANGAN manba USTUN, forma
  faqat BO'SH joyni to'ldiradi.** Telegram kontakti (`msg.contact`,
  `user_id === from.id` bilan tasdiqlangan) `SET phone = $2` bilan ustidan
  yozadi; checkout formasi va sotuvchi arizasi `COALESCE(users.phone,
  EXCLUDED.phone)` da qoladi. Sabab: ustuvorlik teskari bo'lganda YOPIQ
  TUZOQ hosil bo'lardi — formaga bir marta tushgan xato raqamni tuzatish
  yo'li UMUMAN yo'q edi (bot raqamni faqat `!user.phone` bo'lganda
  so'raydi).
  ⚠️ **Bu `users.src` qoidasining TESKARISI va farq ataylab yozilmoqda:**
  `src` da "birinchi teginish qulflanadi" to'g'ri, chunki u ANALITIKA
  FAKTI va o'zgarishi yolg'on bo'lardi; telefon esa JORIY aloqa ma'lumoti
  va o'zgarishi normal. Yangi maydon qo'shilganda birinchi savol: **bu
  sodir bo'lgan HODISAmi (qulflansin) yoki joriy HOLATmi (yangilansin)?**
  Qorovul: `server/test.js` → Test 31.

- [2026-08-14] Qaror: **takrorlanadigan UI bo'lagi (♡ kabi) IKKINCHI marta
  ko'chirib yozilmaydi — bitta funksiyaga chiqariladi va kartochkalar uni
  CHAQIRADI.** Sabab: `homeCard` va `productCard` ikki nusxa edi va ♡
  faqat bittasiga yozilgan — ya'ni nuqson "tugma yo'qoldi" emas, "yangi
  maydon faqat bitta nusxaga qo'shildi" edi. Bu `videoVM` qarori bilan
  bitta oila (ikkinchi nusxa yozilmasin, ikki joy jimgina uzoqlashmasin).
  ⚠️ Qorovul BELGISI ham shu qarorga moslashtirildi: test kartochka
  tanasida amal NOMINI emas, CHAQIRUVNI qidiradi — nom qidirilsa
  markazlashtirish O'ZI testni qizil qilardi, ya'ni qorovul to'g'ri
  yechimni jazolab, nusxa ko'chirishga undardi. **Qorovul qaysi holatni
  to'g'ri deb bilishi qaror bilan BIRGA tanlanadi.**

- [2026-08-14] Qaror: **"ostki chiziq" chip dizayni IKKALA yuzda ham —
  "ikkala yuz bitta ko'rinish" qoidasi TIKLANDI.** Qaror ikki bosqichda
  keldi va tarixi ataylab saqlanadi: avval founder 3 lokal variantdan
  "ostki chiziq" (B) ni faqat Mini App uchun tanladi va sayt eski retseptda
  qolib, "sayt ham o'tsinmi" alohida qarorga qoldirilgan edi; SHU KUNIYOQ
  founder saytni ham o'tkazishga qaror qildi. Ya'ni 2026-08-13 dagi "ikkala
  yuz bitta ko'rinishda" qoidasi bir necha soat buzilib turdi, xolos —
  endi `.chip` (sayt) va `.cat-chip` (Mini App) ayni bitta retseptda.

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
