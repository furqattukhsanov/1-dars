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
  yolg'onga aylantirardi
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
  1 ta test mahsuloti→NULL. **Hali qilinmagani:** backend kodining o'zi production'ga deploy qilinmagan,
  va uch oqim uchidan-uchigacha sinovi (Sprint 8) deploydan keyin o'tkaziladi

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
