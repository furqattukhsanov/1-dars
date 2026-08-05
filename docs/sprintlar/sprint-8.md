# Sprint 8 — Sifat tekshiruvi (Dars 15)

**Holat:** jarayonda

---

## Maqsad

Platformaning barcha funksiyalarini real foydalanuvchilar bilan sinovdan o'tkazish, xatolarni topib tuzatish.

---

## Bajariladigan vazifalar

### Xato tekshiruvi
- [ ] To'liq xaridor oqimi: ro'yxatdan o'tish → katalog → buyurtma → to'lov → yetkazib olish
  — **QISMAN (2026-07-31):** saytdan buyurtma (`#LM-3011`, 2026-07-30) ustiga endi **Mini App'dan
  haqiqiy Telegram imzosi bilan buyurtma ham sinaldi** — buyurtma o'tdi va zaxira 20 → 19 bo'ldi,
  ya'ni atomik kamaytirish Mini App yo'lida ham ishlaydi. 30-iyuldagi "Mini App buyurtmasi
  sinalmagan" bo'shlig'i YOPILDI. Band OCHIQ qoladi: **to'lov (Payme/Click) va yetkazib olish (BTS)
  qismi hali umuman sinalmagan** — integratsiyalar Sprint 6'da tugallanmagan
- [ ] To'liq ishlab chiqaruvchi oqimi: kirish → mahsulot qo'shish → buyurtma qabul → jo'natish
  — **QISMAN (2026-07-31):** sotuvchi Mini App'dan mahsulot qo'shdi (`Yengi paplim`, 8 600 000 so'm,
  zaxira 20), bot rasm so'radi, sotuvchi botga rasm yubordi va rasm mahsulotga biriktirildi —
  **haqiqiy Telegram bilan, birinchi marta**. Bu kod 2026-07-30 da yozilgan edi, lekin faqat soxta
  ma'lumot bilan sinalgandi. Moderatsiyagacha mahsulot ommaviy katalogda ko'rinmadi (12 ta bo'lib
  qoldi) — moderatsiya darvozasi ishlaydi. 30-iyuldagi "botga rasm yuborish sinalmagan" bo'shlig'i
  YOPILDI.
  — **(2026-08-01) Oqimning ikkinchi yarmi ham sinaldi:** sotuvchining buyurtmani qabul
  qilishi, jo'natishi va rad etishi (accept / ship / reject) production'da haqiqiy Telegram
  va Mini App bilan o'tkazildi — 31-iyulda ochiq qolgan aynan shu bo'shliq YOPILDI (tafsilot
  "Qilingan ishlar"da). Band hamon OCHIQ, chunki oqimning quyrug'i qolyapti: **to'lov
  (Payme/Click) va yetkazib berish (BTS)** — ikkalasi ham Sprint 6 integratsiyalariga
  bog'liq va tashqi kalitsiz sinab bo'lmaydi
- [ ] Admin oqimi: tasdiqlash → escrow → bahsli holat → qaror
  — **QISMAN (2026-07-31):** moderatsiya navbatida rasm va zaxira ko'rindi, founder tasdiqladi,
  mahsulot katalogga chiqdi (13 ta). HMAC-imzolangan `/api/product-photo` havolasi ham tekshirildi:
  to'g'ri imzo bilan rasm keladi (590 KB, haqiqiy JPEG 1920×2560), soxta imzo bilan **401**.
  30-iyuldagi "navbatda rasm + zaxira ko'rinishi tekshirilmagan" bo'shlig'i YOPILDI. Band OCHIQ
  qoladi: **escrow, bahsli holat va bahs qarori oqimi hali sinalmagan**
  — **(2026-08-03) Bahsli holat va bahs qarori bo'shlig'i YOPILDI:** haqiqiy buyurtma
  `#LM-3001` ustida xaridor → bot → sotuvchi → admin panel → Telegram tasdiqlash zanjiri
  uchidan-uchiga sinaldi (tafsilot "Qilingan ishlar"da), `disputes.status='resolved'` va
  `orders.status='refunded'` bitta tranzaksiyada tasdiqlandi. Band hamon OCHIQ qoladi —
  **escrow (mablag'ni ushlab turish) mexanizmining o'zi alohida sinalmagan**, faqat bahs
  ochilishidan qarorgacha bo'lgan qism
- [ ] Sharhlar oqimi: buyurtma → yetkazildi → sharh → reyting → admin yashirishi
  — kod 2026-07-31 da yozildi va production'ga chiqdi (`rating` endi 13/13 mahsulotda
  `null`, `/api/reviews` 200 qaytaryapti, himoyalangan 4 endpoint 401). **Haqiqiy sharh
  bilan hali sinalmagan.** Qadamma-qadam reja: `docs/sinov-sharhlar.md`
  — **(2026-08-03) Zanjirning oxirgi bo'g'ini test bilan qamaldi:** "admin yashirishi →
  reyting qayta hisoblanishi" ulanishi endi Test 11 da tekshiriladi (tafsilot
  "Qilingan ishlar"da). Band HAMON OCHIQ: jonli bazada **0 ta sharh** bor, ya'ni
  reyting invariantlari trivial ravishda to'g'ri va production ma'lumotida hech narsa
  tasdiqlab bo'lmaydi — haqiqiy sharh kerak
- [ ] To'lov xatolari: bekor qilish, vaqt tugashi, ikki marta to'lash
- [ ] Qaytarish oqimi: xaridor muammo bildiradi → moderator qaror beradi → pul qaytariladi
  — **QISMAN (2026-08-03):** aynan shu zanjir B2 dispute sinovida haqiqiy Telegram va admin
  panel bilan o'tdi — `#LM-3001` uchun qaytarish (1 000 000 so'm, aybdor=sotuvchi) tasdiqlandi
  va `orders.status='refunded'` bo'ldi. Band OCHIQ qoladi: bitta muvaffaqiyatli yo'l sinaldi,
  chegara holatlar (masalan aybdor=xaridor bo'lganda qaytarilmaslik) hali sinalmagan

### Pilot foydalanuvchilar
- [ ] 3–5 ta tanish xaridor bilan real buyurtma sinovlari
- [ ] 2–3 ta ishlab chiqaruvchi bilan kabinet sinovlari
- [ ] Xato va shikoyatlarni yig'ish

### Ishlash tekshiruvi
- [ ] Sahifalar yuklanish tezligi (3 soniyadan kam)
  — **QISMAN (2026-07-31):** birinchi marta HAQIQATAN o'lchandi va uchta sabab topib
  tuzatildi (pastdagi yozuvga qarang). Band OCHIQ qoladi, chunki o'lchov lokal va Wi-Fi
  bo'yicha — **sekin mobil internetda (O'zbekistondagi haqiqiy 3G/4G) hali sinalmagan**

  — **SEKIN TARMOQDA O'LCHANDI (2026-08-05), band HAMON OCHIQ — mezon o'tmadi.**
  Usul: `curl --limit-rate` bilan HAQIQIY throttling. Brauzer panelidagi FCP ATAYLAB
  ishlatilmadi — tab `hidden` bo'lganda u yolg'on ko'rsatadi (bu allaqachon yozilgan
  dars). Kod BU O'LCHOVDA O'ZGARTIRILMADI — bu tashxis, tuzatish emas.

  | | Landing | Mini App |
  |---|---|---|
  | Chizish uchun kerak bo'lgan qism | 342 KB | 73 KB |
  | Sekin 3G (50 KB/s) | **10.1 s** | ~1.5–2.5 s |
  | Tez 3G (200 KB/s) | **2.66 s** | ~1.6–3.4 s |
  | Birinchi tashrif jami | ~634 KB | ~356 KB |
  | Aylantirganda (14 ta lazy rasm) | ~2.87 MB | — |

  **Mezon bo'yicha hukm:** tez 3G'da landing 2.66 s — o'tadi, lekin ZO'RG'A; sekin
  3G'da 10.1 s — **O'TMAYDI**. Shu sabab band `[x]` QILINMAYDI.

  **Topilganlar:**
  1. `Photo/Main/banner-mato.jpg` — **305 KB**, ya'ni kritik yo'lning **78%i**.
     Sekin 3G'da yolg'iz o'zi ~6 s. WebP/AVIF + `srcset` bilan ~60 KB ga tushsa
     ~5 s tejaladi. **ENG KATTA YUTUQ AYNAN SHU** — qolgan hamma narsa shu bitta
     fayl yonida shovqin.
  2. Shriftlar — 250 KB, 13 ta `woff2`, 3 oila / 10 qalinlik. Mini App uchun
     nomutanosib: butun kritik yo'ldan (73 KB) **3.4 barobar** katta.
     `display=swap` to'g'ri qo'yilgan, ya'ni matn ko'rinmay turmaydi.
  3. **Mini App tarmoq kengligiga BOG'LIQ EMAS.** Ikkala tezlikda ham natija
     1.5–3.5 s oralig'ida sochildi — ya'ni o'lchovni bayt emas, ULANISH KECHIKISHI
     boshqaradi (uchta tashqi domenga ulanish). `fonts.googleapis.com` va
     `fonts.gstatic.com` ga `preconnect` bor, **`telegram.org` ga YO'Q.**
  4. Yaxshi tomoni: barcha skriptlar `defer` (2026-07-31 qoidasi bajarilyapti),
     17 rasmdan 14 tasi `lazy`.

  **Keyingi ishlar (BAJARILMAGAN, shu bandni yopish uchun):** banner rasmni
  WebP/AVIF ga o'tkazish + `srcset`; shrift qalinliklarini kamaytirish;
  `telegram.org` ga `preconnect` qo'shish
- [ ] Mobil da barcha funksiyalar ishlashi
- [ ] To'lov webhook larning ishonchliligi

### Tuzatishlar
- [ ] Pilot dan kelgan xatolarni tuzatish
- [ ] UX muammolarini hal qilish

---

## Qilingan ishlar

- [2026-08-05] **Sahifa yuklanish tezligi SEKIN MOBIL TARMOQDA birinchi marta
  o'lchandi (A1) — kod o'zgartirilmadi, bu tashxis.** 31-iyulda qolgan bo'shliq
  ("o'lchov lokal va Wi-Fi bo'yicha") yopildi: `curl --limit-rate` bilan haqiqiy
  throttling qo'llanib, 50 KB/s (sekin 3G) va 200 KB/s (tez 3G) da o'lchandi.
  Raqamlar va to'liq jadval yuqoridagi band yonida.

  Qisqasi: **landing sekin 3G'da 10.1 s** — sprint mezoni "3 soniyadan kam"
  O'TMAYDI; tez 3G'da 2.66 s bilan zo'rg'a o'tadi. Sabab bitta faylda to'plangan —
  `Photo/Main/banner-mato.jpg` **305 KB**, kritik yo'lning 78%i, yolg'iz o'zi sekin
  3G'da ~6 s. Shriftlar 250 KB (13 ta `woff2`, 3 oila / 10 qalinlik) —
  Mini App'ning butun kritik yo'lidan 3.4 barobar og'ir.

  **Kutilmagan topilma:** Mini App tarmoq kengligiga deyarli BOG'LIQ EMAS — 50 KB/s
  va 200 KB/s da natija bir xil oraliqda (1.5–3.5 s) sochildi, ya'ni uni bayt emas,
  uchta tashqi domenga ULANISH KECHIKISHI boshqaradi. Shu yerdan aniq qarz chiqdi:
  `fonts.googleapis.com` va `fonts.gstatic.com` ga `preconnect` bor,
  **`telegram.org` ga yo'q** — holbuki `telegram-web-app.js` aynan o'shandan keladi.

  Usul haqida: brauzer panelidagi FCP ATAYLAB ishlatilmadi — tab `hidden` bo'lganda
  u yolg'on ko'rsatadi va bu allaqachon bir marta chalg'itgan. O'lchov tashqi
  vositadan, tarmoq darajasida olindi.

  Band `[x]` QILINMADI. Yopilishi uchun kerak (BAJARILMAGAN): banner rasm →
  WebP/AVIF + `srcset` (~305 KB → ~60 KB, ~5 s tejaydi), shrift qalinliklarini
  kamaytirish, `telegram.org` ga `preconnect`

- [2026-08-05] **Test 2c qo'shildi — "bo'sh emas, lekin yaroqsiz" sozlama qiymati
  qo'riqlanadi (`server/test.js`).** Test `chatId()` qorovulini tekshiradi: butun son
  o'zgarmaydi, manfiy guruh id qabul qilinadi, bo'shliq kesiladi, bo'sh/berilmagan
  qiymat zaxiraga qaytadi. Asosiy bandi esa `<chat_id>` va `abc` kabi qiymatlar —
  ular ham zaxiraga qaytishi, ham `console.error` bilan IZ qoldirishi shart, va
  guruhlash kaliti (1-argument) o'zgarmasligi alohida tekshiriladi. `npm test` — 28
  test PASS. Sabab va tafsilot Sprint 9 dagi 2026-08-05 yozuvida: aynan shu tekshiruv
  yo'qligi xato monitoringini ikki kun jimgina o'lik qilib qo'ygan edi

- [2026-08-03] **B4 — buyurtma holati tarixi (`order_status_history`) qo'shildi: endi har bir
  o'tish "qachon, qaysi holatdan qaysisiga, KIM" bo'lib yoziladi.**

  **Muammo:** `orders.status` faqat JORIY holatni saqlardi. Buyurtma qachon tasdiqlangani,
  kim jo'natgani, nega bekor qilingani hech qayerda qolmasdi — bahs chiqqanda "sotuvchi
  qachon jo'natdi?" degan savolga javob Telegram yozishmalarini qo'lda titishdan iborat edi.
  B2 dagi `#LM-3001` bahsi aynan shuni ko'rsatdi.

  **Sxema** (`db/015_order_status_history.sql`): `order_id`, `from_status` (NULL = buyurtma
  endi yaratildi), `to_status`, `actor_kind` (`buyer`/`seller`/`admin`/`bot`/`system`),
  `actor_tg`, `note`, `created_at`; `(order_id, created_at)` indeksi. Mavjud 13 buyurtma
  backfill qilindi, lekin **TIKLANGAN tarix sifatida emas**: oraliq qadamlar hech qayerda
  saqlanmagan va tiklab bo'lmaydi, shuning uchun har biriga bitta qator yoziladi —
  `from_status=NULL`, `actor_kind='system'` va ochiq izoh bilan, `created_at` esa
  buyurtmaning O'Z sanasi (aks holda 13 ta eski buyurtma "bugun o'zgargan" bo'lib
  ko'rinardi). Migratsiya idempotent va oxirida tarixsiz buyurtma qolmaganini tekshiradi.

  **`to_status` da CHECK ATAYLAB YO'Q** — bu o'sha kuni topilgan `review_hide` darsining
  bevosita natijasi: bitta ro'yxat ikki joyda yashagani uchun `admin_actions_kind_check`
  eskirib qolgan va funksiya butunlay ishlamas edi. Bu yerda qiymat baribir `orders` ning
  o'zidan keladi va `orders_status_check` dan o'tgan bo'ladi, ya'ni ikkinchi ro'yxat faqat
  kelajakda yangi holat qo'shilganda jimgina rad etadigan tuzoq bo'lardi. `actor_kind` da
  esa CHECK BOR — u shu jadvalda tug'iladi va takrorlanmaydi.

  **Yozuvchi** (`server/lib/order-history.js`, yangi fayl): `recordStatusChange()` — tarixning
  YAGONA yozuvchisi. U `pool` emas, **tranzaksiya klientini** talab qiladi va buni haqiqatan
  tekshiradi (`pool` da ham `.query` bor, shuning uchun farq `.release` mavjudligi bo'yicha
  aniqlanadi): `pool` uzatilsa yozuv tranzaksiyadan tashqarida ketib, modulning butun maqsadi
  jimgina yo'qolardi. Xato YUTILMAYDI — tarix yozilmasa butun o'tish ROLLBACK bo'ladi. Bu
  ongli kelishuv: teshikli tarix tarix yo'qligidan yomonroq, chunki unga qarab qaror qabul
  qilinadi. Narxi — tarix jadvali buzilsa buyurtma oqimi ham to'xtaydi, lekin bu B1 alerti
  orqali darhol Telegram'ga chiqadi.

  **Yozuv nuqtalari (5 ta):** `routes/orders.js` — Mini App va sayt buyurtmasi tug'ilishi
  (`from=NULL`, `actor_kind='buyer'`; saytda Telegram hisobi bo'lmasligi mumkin, u holda
  `actor_tg` NULL); `routes/seller.js` — accept/reject/ship; `routes/webhook.js` — bot
  buyruqlari (`/tasdiqla` `/yolga` `/yetdi`), bu yerda **ilgari tranzaksiya UMUMAN yo'q edi**;
  `routes/admin.js` — `order_payout`, `order_refund`, `dispute_resolve`. `UPDATE` lar `prev`
  CTE ga o'tkazildi, chunki `RETURNING` faqat YANGI qiymatni beradi, tarixga esa "qaysi
  holatdan" kerak — `FOR UPDATE` bilan qator qulflanadi va mavjud atomik qorovullar
  (`prev.status = ANY(...)`, `<> 'refunded'`, `status='delivered'`) ilgarigidek ishlaydi.
  Admin amallarida `run(a)` → `run(a, actorTg)` bo'ldi: tugmani BOSGAN adminning Telegram
  ID'si tarixga yoziladi (`a.decided_by` bu paytda hali NULL).

  **Sinov — uchta yangi test va uchta mutatsiya.** Test 12 yozuvchining o'zini qamraydi
  (`pool` rad etilishi, noma'lum `actorKind` rad etilishi, parametrlar, `from`/`actorTg` NULL
  ga aylanishi). **Test 12b eng muhimi:** u manba kodini skanerlaydi va har bir
  `UPDATE orders SET status` yozuvi yonida `recordStatusChange` borligini tekshiradi, ustiga
  aniq inventar (`HISTORY_INVENTORY`) bilan solishtiradi — yangi yozuv nuqtasi qo'shilsa test
  QIZIL bo'ladi va odam ongli qaror qabul qilishga majbur. Sabab: xavf funksiyada emas,
  QAMROVDA — unutilgan yozuv nuqtasi hech narsani buzmaydi, testlar yashil qoladi va tarixda
  jimgina teshik paydo bo'ladi. Test 12c CTE refaktoringidan keyin atomik qorovullar
  joyidaligini tekshiradi. Mutatsiya bilan tasdiqlandi: (a) `seller.js` dan tarix chaqiruvi
  olib tashlanganda 12b qizil; (b) tarixsiz yangi `UPDATE orders SET status` qo'shilganda
  inventar mos kelmadi va 12b qizil; (c) `prev.status = ANY(...)` olib tashlanganda 12c qizil.
  Hammasi qaytarildi. `npm test` — hammasi PASS, lint 0 xato.

  **OCHIQ QARZ (ataylab qoldirildi):** `webhook.js` dagi bot buyrug'ida holat qorovuli YO'Q —
  u `/yetdi` ni istalgan holatdagi buyurtmaga yozaveradi (`seller.js` dan farqi shu). Qorovul
  qo'shish founder'ning bot bilan ishlash odatini kutilmaganda buzardi, bu esa B4 doirasidan
  tashqari xatti-harakat o'zgarishi bo'lardi. Tarix endi `from_status` ni yozadi, ya'ni
  mantiqsiz o'tish KO'RINADI — tuzatilmaydi, lekin yashirinmaydi.

  **Deploy holati:** migratsiya production'da QO'LLANILDI va tasdiqlandi (13 buyurtma,
  13 tarix yozuvi, tarixsiz buyurtma 0, jadval egaligi `lola`), zaxira nusxa olindi.
  **Kod hali serverga ko'chirilmagan** — commit'dan keyin rsync + `systemctl restart
  lolamarket-notify` kerak. Ya'ni HOZIR production'da jadval bor, lekin unga yozadigan kod
  yo'q: bu vaqtinchalik holat, keyingi deploy'gacha yangi o'tishlar tarixga tushmaydi.
  Sprint bandi shu sabab `[x]` qilinmadi (30-iyul qarori: dalil jonli tekshiruvdan keladi).

- [2026-08-03] **B2 — bahs (dispute) oqimi jonli Telegram bilan uchidan-uchiga sinaldi, va
  yo'l-yo'lakay `review_hide` amalini BUTUNLAY ishlamas qilib turgan production nuqsoni
  topib tuzatildi.**

  `routes/disputes.js` (316 satr) hech qachon shu tarzda sinalmagan edi. Haqiqiy buyurtma
  `#LM-3001` (allaqachon `shipped` holatida) ustida: xaridor Mini App'dan bahs ochdi
  (sabab + izoh) → bot dalil rasmi so'radi → 1 ta rasm yuborildi → "tayyor" deyildi →
  sotuvchi kabinetdan javob yozildi → admin panelning "Bahslar" bo'limida "Qaror qabul
  qilish" bosildi (aybdor=sotuvchi, logistika=sotuvchi, qaytarish=1 000 000 so'm) →
  Telegram'ga tasdiq xabari keldi → "✅ Tasdiqlash" bosildi. Natija: `disputes.status='resolved'`
  VA `orders.status='refunded'` bitta tranzaksiyada, ikkalasi ham bir xil timestamp bilan
  (`03:56:57.517992`) — kod to'g'ri ishladi.

  **Bitta izohsiz hodisa:** birinchi urinishda admin panel so'rovi serverga umuman yetib
  bormadi (nginx jurnalida iz yo'q, `admin_actions` jadvalida yozuv yo'q — B1 alerti ham
  jim, chunki serverga hech narsa kelmagan, ya'ni bu client-side hodisa). Ikkinchi urinishda
  muammosiz o'tdi. Sabab aniqlanmadi (ehtimol validatsiya toast'i e'tiborsiz qolgan yoki
  tarmoq sekinligi) — takrorlanmadi, shuning uchun kod o'zgartirilmadi.

  **Yo'l-yo'lakay jiddiy production nuqsoni topildi va tuzatildi: `review_hide` amali
  BUTUNLAY ishlamas edi.** `routes/admin.js` da `review_hide` haqiqiy `ADMIN_ACTIONS` amali
  sifatida ro'yxatga olingan (sharh yashirish), lekin `db/005_sprint7_admin.sql` dagi
  `admin_actions_kind_check` CHECK cheklovida bu qiymat yo'q edi — `dispute_resolve`
  migratsiyaga kiritilgan, `review_hide` esa (sharhlar funksiyasi keyinroq, `012_reviews.sql`
  da qo'shilganda) unutilgan. Ya'ni **har safar admin panelda "Sharhni yashirish" bosilganda
  500 xato kelardi** — `INSERT INTO admin_actions` baza darajasida (23514, check constraint)
  rad etilardi. `db/014_review_hide_action.sql` yozildi (CHECK qayta yaratildi, `review_hide`
  qo'shildi), production'da qo'llanildi va ikki marta tasdiqlandi: (a) `BEGIN; INSERT ...;
  ROLLBACK;` bilan oldin xato ekanini ko'rsatdim, migratsiyadan keyin xatosiz o'tdi;
  (b) `\d admin_actions` cheklov ro'yxatida `review_hide` borligini ko'rsatadi. Test residue
  yo'q (`SELECT count(*) FROM admin_actions WHERE kind='review_hide'` = 0).

  **Ishonch darajasi:** ikkalasi ham jonli production'da, real Telegram va real admin panel
  orqali sinaldi va tasdiqlandi (bazadagi haqiqiy qatorlar bilan) — unit test emas.

  **Deploy holati:** migratsiya QO'LLANILDI (production). Kod tomonida o'zgarish yo'q —
  faqat bitta yangi migratsiya fayli (`db/014_review_hide_action.sql`), u allaqachon serverda
  `sudo -u postgres psql -f` bilan bajarilgan. `server/` papkasida O'ZGARISH YO'Q,
  rsync/restart kerak emas.

  **Ochiq narsa:** `#LM-3001` (haqiqiy buyurtma) foydalanuvchining ONGLI QARORI bilan
  `refunded` holatida QOLDIRILDI (tozalanmadi) — bu nuqson emas, buyurtma test qoldig'i
  sifatida ataylab saqlanmoqda.

- [2026-08-03] **"Sharh yashirilganda reyting qayta hisoblanadi" — kod to'g'ri edi, lekin
  bu ULANISH hech qachon tekshirilmagan ekan. Test 11 qo'shildi.**

  Test 8 `recalcRating()` ning O'ZINI sinardi va u o'tardi. Lekin uni `hideReview()`
  HAQIQATAN chaqirishini hech kim tekshirmagan — ya'ni chaqiruv kodda tasodifan olib
  tashlansa **butun test to'plami yashil qolardi**, admin sharhni yashirar, reyting esa
  yashirilgan sharhni hisobga olib abadiy yolg'on qolib ketardi. Bu CLAUDE.md dagi
  "reyting hosila, qo'lda yozilmasin" qoidasining ikkinchi yuzi: qoida bajarilishi
  ta'minlanmagan bo'lsa, u qoida emas, niyat.

  **Test 11 nimani tekshiradi** (`server/test.js`, soxta `pool.connect` klienti bilan —
  baza kerak emas):
  1. `hideReview()` haqiqatan `recalcRating()` ni chaqiradi (`UPDATE products ... avg(stars)`).
  2. **TARTIB:** `UPDATE reviews` → `recalcRating` → `COMMIT`, ya'ni qayta hisoblash
     `COMMIT` dan OLDIN va bitta tranzaksiyada. Keyin bo'lsa, hisoblash qulaganda sharh
     yashirilgan, reyting esa eski holida qolardi — baza o'zi bilan ziddiyatga tushardi.
  3. Faqat `status = 'published'` sharh yashiriladi — ikki marta yashirish sonni buzardi.
  4. Sotuvchi reytingi ham yangilanadi (`UPDATE sellers`).
  5. **Teskari holat:** sharh allaqachon yashirilgan bo'lsa (`UPDATE` 0 qator qaytardi)
     reyting UMUMAN tegilmaydi, `ROLLBACK` bo'ladi va ulanish poolga qaytariladi.

  **Mutatsiya bilan tasdiqlandi:** `hideReview` dagi `recalcRating` chaqiruvi olib
  tashlanganda Test 11 QIZIL bo'ldi, keyin qaytarildi. Ya'ni test haqiqatan shu ulanishni
  tutadi — "yozdim va yashil" degan gapga ishonilmadi.

  **Jonli bazada tekshirilgani va CHEGARASI:** bazada 14 mahsulot va **0 ta sharh** bor.
  Ya'ni reyting invariantlari hozir trivial ravishda to'g'ri va production ma'lumoti bu
  yerda hech narsani isbotlamaydi. Zanjirning qolgan qismi (buyurtma → yetkazildi →
  haqiqiy sharh → reyting) hamon keyingi `SINOV` sessiyasiga qoladi.

- [2026-08-02] **Xavfsizlik auditi Mini App'da saqlanuvchi XSS topdi — tafsilot va
  tuzatish `sprint-9.md` da, bu yerda faqat SINOV USULI qayd etilyapti.**

  Nuqson rejalashtirilgan bandlardan birortasida emas, "bu to'la qonligicha tugadimi?"
  degan savoldan keyingi auditda chiqdi. Sprint 8 uchun ahamiyatli qismi — **qanday
  tasdiqlangani**: teshik "bor ko'rinadi" deb emas, brauzerda to'rtta haqiqiy hujum
  yuki bilan sinaldi (`<img src=x onerror=...>`, `<script>`, `' onmouseover='`,
  `"><svg onload=...>`). Eski yo'lda **4 tadan 3 tasi haqiqiy TEG yaratdi va 3 tasi
  hodisa atributini kiritdi** — ya'ni bu nazariy xavf emas, ishlaydigan hujum edi.
  Tuzatishdan keyin 4 tasi ham 0 teg berdi va oddiy matn bo'lib ko'rindi.

  **Sprint 8 uchun dars:** oqim sinovlari (buyurtma, bahs) shu paytgacha faqat
  ODDIY ma'lumot bilan o'tkazilgan edi. Oqim "ishlaydi" degani uni **yomon niyatli
  kirish bilan** sinalgan degani emas — buyurtma izohi va bahs sababi barcha
  sinovlarda oddiy matn edi, shuning uchun teshik oqim sinovlaridan o'tib ketaverdi.
  Bu 2026-07-31 dagi "soxta ma'lumot o'zimiz kutgan shaklda keladi" darsining ikkinchi
  yuzi: bu safar ma'lumot foydalanuvchidan keladi, biz esa uni ham "kutgan shaklda"
  deb faraz qilgan edik.

- [2026-08-01] **Sotuvchining accept / ship / reject oqimi production'da haqiqiy Telegram va
  Mini App bilan sinaldi — 31-iyulda ochiq qolgan bo'shliq yopildi. Nuqson topilmadi.**

  Sinovda `p-ms8wy86z-r9c2` ("Tola", Marg'ilon Ipak Co., boshlang'ich zaxira 12) ishlatildi.
  To'rtta buyurtma ataylab har xil yo'ldan yuborildi:

  | Buyurtma | Mahsulot | Yo'l | Natija |
  |---|---|---|---|
  | `#LM-3016` | Tola ×1 | accept → ship | trek `test0001` bazaga yozildi |
  | `#LM-3017` | Tola ×1 | accept | `confirmed` da qoldi |
  | `#LM-3018` | Junli mato (`hb-7740`) ×2 | — | ataylab `pending` qoldirildi |
  | `#LM-3019` | Tola ×4 | reject | zaxira **+4 qaytdi** |

  **Tasdiqlangani.** `accept` (`pending` → `confirmed`) — xaridorga Telegram xabari va admin
  chatga bildirishnoma ketdi. `ship` (`confirmed` → `shipped`) — trek raqami saqlandi, va
  **trek raqamisiz jo'natish RAD ETILADI** (ya'ni "jo'natdim, raqamni keyin aytaman" degan
  holat bo'lmaydi — xaridor qo'lida kuzatadigan narsa qolmasdi). `reject`
  (`pending` → `cancelled`) — zaxira **aynan so'ralgan miqdorda** qaytdi: 4 so'raldi, 4 qaytdi.
  Oxirgisi muhim, chunki `restoreStock` buyurtma qatorlari ustidan ishlaydi; noto'g'ri yozilsa
  u zaxirani kam yoki ortiq qaytarardi va xatosi darrov ko'rinmasdi.

  **Sinov chiqindisi tozalandi** (2026-07-30 qaroriga muvofiq): to'rtala buyurtma o'chirildi,
  band turgan zaxira qaytarildi, ikkala mahsulot boshlang'ich holatiga qaytdi (Tola 12, Junli
  mato 49). Tozalash **ochiq API orqali mustaqil tasdiqlandi** — ya'ni "o'chirdim" degan gapga
  emas, bazadan qaytgan songa ishonildi.

  **Sprint 8 da HAMON sinalmagani:** to'lov (Payme/Click — tashqi merchant kaliti yo'q,
  bloklangan), yetkazib berish (BTS API), escrow, bahsli holat va bahs qarori.

  **Yo'l-yo'lakay ko'rilgan, kod O'ZGARTIRILMAGAN ikki narsa:**
  1. `server/routes/seller.js:197` dagi izoh yo'lni `/api/seller/order` deb yozgan, haqiqiy
     yo'l esa `/api/seller/orders` (ko'plikda) — kichik eskirgan izoh, xatti-harakatga ta'siri
     yo'q.
  2. `restoreStock` dagi `UPDATE ... FROM order_items` naqshi tekshirildi va **NUQSON EMAS**
     deb topildi. Shubha o'rinli edi (bir mahsulot ikki qatorda uchrasa `UPDATE` faqat bittasini
     hisobga olardi), lekin bunday holat yuzaga kelmaydi: `orders.js:106` dagi `qtyById` Map va
     `orders.js:121` dagi `prods` bitta buyurtmada bitta mahsulot faqat bir marta qator
     bo'lishini ta'minlaydi. Yozib qo'yilyapti, chunki bu tekshiruv keyin yana takrorlanmasin

- [2026-07-31] **Sharhlar tizimi production'ga chiqdi va DARVOZALARI sinaldi — asosiy
  oqim esa sinalmay qoldi (sabab quyida).**

  **Sinalgani (jonli, `curl` bilan):** soxta reyting yo'qoldi — `/api/products`
  **13/13 mahsulotda `"rating":null, "reviews":0`** qaytaryapti (ilgari `4.9`, `42`).
  `GET /api/reviews?productId=…` → **200** `{"ok":true,"data":[]}`; `productId`siz
  → **400**. Himoyalangan yo'llar: `POST /api/reviews` → **401**, `?mine=1` → **401**,
  `/api/seller/reviews` → **401**, `/api/web/orders` → **401**. **Soxta imzo bilan
  ham 401** (`X-Telegram-Init-Data` da 64 nol) — ya'ni initData tekshiruvi sharh
  yo'lida ham ishlayapti.

  **Sinab BO'LMAGANI va nega:** sharh yozish uchun imzolangan Telegram kimligi kerak,
  agent uni soxtalashtira olmaydi — himoya aynan shu uchun qurilgan. Lokal to'liq
  oqimni ishga tushirish ham imkonsiz: mashinada Postgres ham, Docker ham yo'q
  (`psql`/`docker` topilmadi). Ya'ni **buyurtma → yetkazildi → sharh → reyting
  qayta hisoblanishi → admin yashirishi** zanjiri hali HAQIQIY sharh bilan
  sinalmagan. Qadamma-qadam reja: `docs/sinov-sharhlar.md`, founder bajaradi.

  **Yo'l-yo'lakay yopilgan bo'shliq:** yulduz chegarasini (`stars` 0 yoki 6) jonli
  `curl` bilan sinab bo'lmadi — `/api/reviews` da autentifikatsiya validatsiyadan
  OLDIN ishlaydi, ya'ni so'rov yulduz qiymatiga yetib bormasdan 401 oladi. Chegara
  shu sababli unit test bilan qamaldi (`test.js` → Test 8c): sxema `REVIEW_SCHEMA`
  sifatida eksport qilindi va 0/6/−1/100, satr shaklidagi `"6"`, majburiy maydonlar
  hamda 1000 belgidan uzun matn tekshirildi. `npm test` — 8 ta test guruhi PASS.

- [2026-07-31] **Uch oqim (sotuvchi → admin → xaridor) production'da haqiqiy Telegram bilan
  uchidan-uchiga sinaldi — 30-iyulda "founder qo'lda bajarishi kerak" deb qoldirilgan uchala
  bo'shliq yopildi, va sinov bitta nuqson topdi.**

  **1. Sotuvchi oqimi.** Sotuvchi Mini App'dan mahsulot qo'shdi (`Yengi paplim`, 8 600 000 so'm,
  zaxira 20), bot rasm so'radi, sotuvchi botga rasm yubordi va rasm mahsulotga biriktirildi.
  Bu kod 2026-07-30 da yozilgan edi, lekin **haqiqiy Telegram bilan hech qachon sinalmagandi** —
  faqat soxta ma'lumot bilan. Moderatsiyagacha mahsulot ommaviy katalogda ko'rinmadi (12 ta bo'lib
  qoldi), ya'ni moderatsiya darvozasi haqiqatan yopiq turadi.

  **2. Admin moderatsiyasi.** Navbatda rasm va zaxira ko'rindi, founder tasdiqladi, mahsulot
  katalogga chiqdi (13 ta). HMAC-imzolangan `/api/product-photo` havolasi alohida tekshirildi:
  to'g'ri imzo bilan rasm keladi (590 KB, haqiqiy JPEG 1920×2560), soxta imzo bilan **401** —
  bot tokeni chiqmaydi va havolani o'ylab topib bo'lmaydi.

  **3. Mini App buyurtmasi (Telegram imzosi bilan).** Buyurtma o'tdi, zaxira **20 → 19**
  (1 dona buyurtma qilingan). Ya'ni atomik `UPDATE ... WHERE stock >= qty` faqat sayt yo'lida
  emas, haqiqiy Mini App yo'lida ham ishlaydi — 30-iyulgi sinov buni qamrab olmagan edi.

  **Topilgan va tuzatilgan nuqson: `/api/product-photo` rasmni `application/octet-stream` deb
  qaytarardi.** Sabab: `catalog.js` Telegram fayl CDN'i bergan `content-type` ni shundoq uzatardi,
  u esa yo bo'sh, yo umumiy. Brauzer `<img>` ichida turni o'zi sezgani uchun rasm **ko'rinardi** —
  aynan shuning uchun nuqson uzoq sezilmadi — lekin Cloudflare rasm optimizatsiyasi ishlamasdi.
  Tuzatish (`server/routes/catalog.js`): yangi `usableMime()` bo'sh va `application/octet-stream`
  ni yaroqsiz deb qaytaradi, `mimeFromPath()` esa turni `getFile` qaytargan yo'l kengaytmasidan
  aniqlaydi. **Oddiy `|| ` fallback bu yerda ishlamasdi**: `application/octet-stream` "truthy",
  ya'ni u fallback'ni jimgina bosib o'tardi. Olti holat bilan sinaldi, `npm test` ham o'tdi.
  Kod serverga `scp` qilindi va jonli javob tasdiqlandi: endi `image/jpeg`.

  **Sinov chiqindisi tozalandi** — founder sinov mahsuloti va buyurtmasini bazadan o'chirdi,
  katalog 12 ta bazaviy holatga qaytdi (2026-07-30 dagi qarorga muvofiq).

  **Bilib qo'yish kerak:** `/api/version` hali `28f3b36` ko'rsatadi — bitta fayl `scp` qilingani
  uchun `version.txt` yangilanmadi. Serverda kod yangi, yorliq eski; keyingi to'liq deploy'da
  o'z-o'zidan to'g'rilanadi.

- [2026-07-31] **Yuklanish tezligi birinchi marta o'lchandi — sahifani sekinlashtirgan uchta
  sabab topildi va tuzatildi.** Ilgari bu band "rasmlar siqilgan" degan taxminga tayanardi;
  o'lchanganda ma'lum bo'ldiki, asosiy muammo rasm hajmi emas, **to'sib turuvchi kod** ekan.

  **1. Butun ekranni yopib turuvchi loader `window.load` ga bog'langan edi** (`script.js`).
  `#page-loader` — `position: fixed; inset: 0`, ya'ni u ochiq turganda foydalanuvchi
  sahifadan HECH NARSA ko'rmaydi. U esa `window.load` da yopilardi, `load` hodisasi esa
  yuqoridagi barcha rasm/shrift yuklanib bo'lgandan keyin otiladi. Natijada tarkib
  allaqachon tayyor bo'lsa ham (DOM ~240 ms) foydalanuvchi spinner ko'rib o'tirardi.
  Endi DOM tayyor bo'lishi kifoya. **Bu `pwa.js`dagi tuzoqning (`5ffe1f0`) AYNAN O'ZI —
  `load` hodisasiga bog'lanish.** Uchinchi marta takrorlanmasligi uchun CLAUDE.md ga
  qoida yozildi.

  **2. `telegram-web-app.js` `<head>`da `defer`siz turardi** (landing va Mini App'da ham) —
  114 KB ni uchinchi domendan (`telegram.org`) kutib HTML tahlilini **~613 ms** to'xtatib
  turardi (jonli o'lchov). Uchala skript ham `defer` qilindi. **Diqqat: uchalasi ham
  birdan** — bittasi `defer`siz qolsa u parse paytida, ya'ni defer'liklardan OLDIN ishlaydi
  va `script.js`/`app.js` `window.Telegram`ni topa olmay qoladi. Sinovda `defer`dan keyin
  `window.Telegram` hali ham `object`, filtr ishlaydi (12 tadan 2 tasi), konsolda 0 xato.

  **3. Katalogda 2.1 MB lik PNG turgan ekan** — `Photo/textile/Без названия (1).png`,
  yolg'iz o'zi jonli tarmoqdan **5.6 soniyada** kelardi. 2026-07-30 dagi rasm siqish
  sessiyasi uni o'tkazib yuborgan. `vintage-chit-krem-atirgul.jpg` ga aylantirildi
  (800×1422, sifat 55) — **220 KB, ya'ni −89%**; vizual farq ko'rinmaydi (naqsh mayda va
  bir xil). Kirill harfli va bo'sh joyli fayl nomi ham yo'qoldi — bu CI `source` ro'yxati
  tuzog'i bilan birga xavfli juftlik edi. **Eski PNG o'chirilmadi** — `sayt-eski/index.html`
  unga ishora qiladi (CLAUDE.md: `sayt-eski/` o'chirilmasin).

  **Natija:** sahifaning umumiy og'irligi ~4.93 MB → ~3.13 MB (−37%), birinchi chizishni
  to'sib turadigan narsa qolmadi. **Versiyalar:** `script.js?v=20→21`,
  `telegram-app/app.js?v=52→53`. **O'lchov usuli:** `curl` bilan har resursning jonli
  hajmi va vaqti, brauzerda `PerformanceNavigationTiming` + `fetch(cache:'reload')`.
  **Tekshirilmagani:** sekin mobil tarmoq — band shu sabab ochiq qoladi

- [2026-07-30] **Sprint 8 rasman boshlandi — zaxira oqimi production'da end-to-end sinaldi va sinov
  ikkita jiddiy DEPLOY teshigini ochib berdi.**

  **1. Zaxira oqimi sinovi (production, haqiqiy baza).** Sinalgani: haqiqiy sayt buyurtmasi `#LM-3011`
  zaxirani to'g'ri kamaytirgani tasdiqlandi (`ik-1402` 50→48 va boshqalar); zaxiradan ortiq buyurtma
  rad etiladi va sabab aniq son bilan qaytadi ("faqat 5 rulon qoldi"); **race condition** — 2 buyurtma
  ayni paytda oxirgi 1 rulonga yuborildi, birinchisi oldi, ikkinchisiga "tugadi" qaytdi, zaxira 0 bo'ldi
  (−1 EMAS, ya'ni atomik `UPDATE ... WHERE stock >= qty` haqiqatan himoya qilyapti); `made` mahsulot
  (`stock IS NULL` = cheksiz) 500 ta buyurtmada ham tugamadi; `restoreStock` SQL tranzaksiyada sinaldi
  (0→1, `ROLLBACK` bilan qaytarildi). Sinov buyurtmalari (`#LM-3012`, `#LM-3013`) o'chirildi va zaxira
  baseline'ga qaytarildi — production bazasida sinov chiqindisi qolmadi. Ruxsat darvozalari alohida
  tekshirildi: 6 ta himoyalangan endpoint tokensiz **401** qaytaradi.

  **2. Sinov davomida topilgan deploy teshiklari** (tafsilot `sprint-1.md`da, tuzatish `c6350a1`):
  CI landing PWA fayllarini serverga umuman chiqarmayotgan ekan, va Mini App uchun deploy qadami
  butunlay yo'q ekan — Mini App **27-iyuldan beri** eskirgan turgan (`app.js?v=47`, jonli kod `v52`).
  Ya'ni oxirgi uch sessiyaning BUTUN Mini App ishi (PWA, mahsulot rasmi UI, logistika narxi qatori,
  zaxira ko'rsatkichi) foydalanuvchilarga umuman yetib bormagan. Bu Sprint 8 ning asosiy qiymati:
  band sifatida rejalashtirilmagan, sinov paytida qo'lga tushgan.

  **3. Deploy tuzatilgandan keyin ikkinchi qatlam nuqson** (tafsilot `sprint-5.md`da, tuzatish `5ffe1f0`):
  fayllar joyiga yetib borgandan keyin ham jonli saytda service worker ro'yxatdan o'tmadi — `pwa.js`
  `load` hodisasiga bog'liq edi. Tuzatilgandan keyin jonli saytda yakuniy holat: `scope:
  https://lolamarket.uz/`, `active: true`, kesh `lolamarket-web-v1` yaratildi.

  **Founder qo'lda bajardi:** nginx'ga `/sw.js` va `/manifest.json` uchun no-cache qoidalari qo'shildi
  (kanonik nusxa serverda: `/etc/nginx/sites-available/lolamarket`) — bu `sprint-5.md`dagi 2026-07-28
  "ochiq ish"ni yopadi; Cloudflare keshi tozalandi.

  **Hali qilinmagan (founder qo'lda bajarishi kerak, agentda imkon yo'q):** sotuvchining botga mahsulot
  rasmini yuborishi; admin panel moderatsiyasida rasm + zaxira ko'rinishini tekshirish; Mini App'dan
  (Telegram imzosi bilan) buyurtma berish.

- [2026-07-30] _(shu kunning erta yozuvi — yuqoridagi sinovdan OLDINGI holat)_ Sprint 8 hali rasman boshlanmagan, lekin "Sahifalar yuklanish tezligi (3 soniyadan kam)" bandiga tegishli tayyorgarlik ko'rildi: bir nechta og'ir landing rasmi siqildi (masalan `Photo/Main/hero-fabrics.jpg` 7.8MB PNG → 413KB JPEG, tafsilot `sprint-5.md`da) va landing PWA'ga aylantirildi (service worker, offline sahifa — shu ham `sprint-5.md`da). Haqiqiy sahifa yuklanish tezligi hali o'lchanmagan/sinalmagan, band ochiq qoladi

---

## Qarorlar

- [2026-08-05] Qaror: **tezlik mezoni endi "tez 3G" emas, SEKIN 3G bo'yicha
  baholanadi, va o'lchov tarmoq darajasida (`curl --limit-rate`) olinadi.** Sabab:
  tez 3G'da landing 2.66 s bilan mezondan o'tadi, sekin 3G'da esa 10.1 s — ya'ni
  qulay o'lchovni tanlab band `[x]` qilinsa, hujjat rost gapirib turib yolg'on
  xulosa berardi. LolaMarket foydalanuvchisi Marg'ilon/Namangandagi ustaxonada
  telefondan kiradi, ofis Wi-Fi'sidan emas. Brauzer paneli FCP'si esa o'lchov
  MANBAI sifatida rad etildi — tab `hidden` bo'lganda u yolg'on ko'rsatadi
  (xotiradagi "tezlik o'lchash usuli" darsi)

- [2026-08-03] Qaror: **himoya faqat FUNKSIYAda emas, QAMROVda ham bo'lsin — inventar test
  bilan qotiriladi.** Test 12b manba kodini skanerlab, har bir `UPDATE orders SET status`
  yozuvi tarix chaqiruvi bilan birga ekanini tekshiradi va aniq ro'yxat bilan solishtiradi;
  yangi yozuv nuqtasi qo'shilsa test qizil bo'ladi. Sabab: unutilgan yozuv nuqtasi hech
  narsani BUZMAYDI — hamma test yashil qolaveradi va tarixda jimgina teshik paydo bo'ladi,
  keyin esa unga qarab qaror qabul qilinadi. Bu 8-avgustdagi "ulanish ham sinaladi"
  qarorining keyingi qadami: endi ulanish EMAS, ulanishlarning TO'LIQLIGI qamalyapti
- [2026-08-03] Qaror: **buyurtma holati o'zgarishi va uning tarixi BITTA tranzaksiyada.**
  `recordStatusChange()` `pool` qabul qilmaydi (imzoning o'zi noto'g'ri ishlatishni
  qiyinlashtiradi) va xatoni yutmaydi — tarix yozilmasa butun o'tish ROLLBACK bo'ladi.
  Ya'ni "holat o'zgardi, tarix yo'q" holati umuman yuzaga kelmaydi. Narxi ochiq tan olinadi:
  tarix jadvali buzilsa buyurtma oqimi ham to'xtaydi. Sabab — jimgina teshikli tarix eng
  yomon variant: u "ba'zan to'g'ri" bo'ladi va yolg'onligi bilinmaydi
- [2026-08-03] Qaror: **backfill tarix o'rniga o'tkazilmaydi.** Eski 13 buyurtmaning oraliq
  qadamlari hech qayerda saqlanmagan va ularni tiklab bo'lmaydi, shuning uchun har biriga
  bitta qator yoziladi — `from_status=NULL`, `actor_kind='system'` va ochiq izoh bilan, ya'ni
  bu yozuv haqiqiy o'tish EMASLIGI ko'rinib turadi. Taxmin qilingan oraliq holatlarni yozish
  "o'ylab topilgan raqam ko'rsatilmasin" qoidasining aynan buzilishi bo'lardi, faqat panelda
  emas, BAHS hal qilinadigan joyda
- [2026-08-03] Qaror: **bir xil ro'yxat ikki jadvalda takrorlanmaydi** — `to_status` da CHECK
  ATAYLAB qo'yilmadi, chunki qiymat `orders` ning o'zidan keladi va u yerda allaqachon
  tekshirilgan. Aynan shu naqsh o'sha kuni `review_hide` da tishlagan edi. CHECK faqat
  qiymat SHU jadvalda tug'ilganda qo'yiladi (`actor_kind`)
- [2026-08-03] Qaror: **funksiyaning O'ZI sinalgani yetarli emas — ULANISH ham sinaladi.**
  `recalcRating()` alohida sinalgan va o'tgan edi, lekin uni `hideReview()` chaqirishini
  hech narsa tekshirmasdi; chaqiruv yo'qolsa butun to'plam yashil qolardi va reyting
  jimgina yolg'onga aylanardi. Bundan keyin "A funksiyasi B ni chaqiradi" degan invariant
  ham, va kerak bo'lsa CHAQIRUV TARTIBI ham (bugun: qayta hisoblash `COMMIT` dan oldin,
  ya'ni bitta tranzaksiyada) test bilan qamaladi. Sabab: birlik testlari qismlarni
  tekshiradi, nuqson esa ko'pincha qismlar ORASIDA yashaydi — bu Sprint 8 ning takrorlanib
  turgan darsi (deploy, `Content-Type`, endi test)
- [2026-08-02] Qaror: **foydalanuvchi matni qabul qiladigan oqim HUJUM YUKI bilan ham
  sinaladi, faqat oddiy matn bilan emas.** Buyurtma va bahs oqimlari bir necha marta
  uchidan-uchiga sinalgan va "ishlaydi" deb yozilgan edi, lekin izoh/manzil/sabab
  maydonlariga har doim oddiy matn kiritilgandi — shuning uchun saqlanuvchi XSS
  hamma sinovlardan o'tib ketdi. Bundan keyin matn maydoni bor oqim sinovida kamida
  bitta `<img src=x onerror=...>` shaklidagi yuk bo'ladi, va natija "sahifa ochildi"
  emas, **yaratilgan TEG soni** bilan o'lchanadi (0 bo'lishi kerak)
- [2026-08-01] Qaror: **sinov chiqindisi tozalangani MUSTAQIL manbadan tasdiqlanadi.** 2026-07-30
  dagi "sinov o'z chiqindisini o'zi tozalaydi" qarorining davomi: tozalash amali bajarilgani
  yetarli emas, natija ochiq API'dan qayta o'qib solishtiriladi (bugun: Tola 12, Junli mato 49
  boshlang'ich holatiga qaytgani ko'rildi). Sabab: bu "CI yashil edi, fayllar esa serverga
  chiqmagandi" darsining aynan o'zi — amal muvaffaqiyatli tugagani natija to'g'ri ekanini
  ANGLATMAYDI; yarim tozalangan sinov esa zaxira sonini jimgina noto'g'ri qoldiradi
- [2026-07-30] Qaror: **production bazasida o'tkazilgan sinov o'z chiqindisini o'zi tozalaydi.** Sinov
  buyurtmalari (`#LM-3012`, `#LM-3013`) sinovdan keyin o'chirildi va zaxira baseline'ga qaytarildi.
  Sabab: bazada haqiqiy buyurtmalar bilan aralashgan sinov qatorlari komissiya hisobotini va zaxira
  sonini soxtalashtiradi — keyinchalik qaysi qator haqiqiy ekanini ajratib bo'lmay qoladi
- [2026-07-30] Qaror: **"deploy qilindi" degan gap jonli tekshiruvsiz yozilmaydi.** 2026-07-28 va
  2026-07-30 da PWA "deploy qilindi" deb yozilgan edi, aslida fayllar serverga umuman chiqmagan.
  Sabab: CI muvaffaqiyatli tugashi fayl yetib borganini ANGLATMAYDI — `source` ro'yxati aynan sanab
  o'tadi, unga tushmagan fayl jimgina tushib qoladi. Endi tekshiruv CI ning o'zida avtomatik
  (`sprint-1.md`dagi qarorga qarang)
- [2026-07-31] Qaror: **frontendda `window.addEventListener('load', ...)` ishlatilmaydi** (CLAUDE.md ga
  yozildi). `load` barcha rasm va shrift yuklangandan keyin otiladi, ustiga skript o'sha hodisadan
  KEYIN ishga tushsa listener umuman otilmaydi. Sabab: bu tuzoq ikki marta zarar keltirdi — `pwa.js`
  service worker'ni ro'yxatdan o'tkazmadi (`5ffe1f0`), `script.js` esa butun ekranni yopib turgan
  loader'ni ochmay turdi. Ikkalasi ham JIMGINA sindi, konsolda xato yo'q edi — aynan shuning uchun
  uzoq sezilmadi. O'rniga: `DOMContentLoaded`, yoki skript `defer` bo'lsa to'g'ridan-to'g'ri chaqirish;
  haqiqatan `load` kerak bo'lsa avval `document.readyState` tekshiriladi
- [2026-07-31] Qaror: **tashqi skript `<head>`da `defer`siz turmaydi, va sahifadagi skriptlar `defer`
  bo'lsa HAMMASI birdan bo'ladi** (CLAUDE.md ga yozildi). Sabab: `telegram-web-app.js` 114 KB ni
  uchinchi domendan kutib HTML tahlilini ~613 ms to'xtatib turardi. Ikkinchi yarmi ham majburiy —
  bitta skript `defer`siz qolsa u parse paytida, ya'ni `defer`liklardan OLDIN ishlaydi va yuklanish
  TARTIBI buziladi (`script.js` / `app.js` `window.Telegram`ni topa olmay qoladi)
- [2026-07-31] Qaror: **tashqi xizmat bergan `Content-Type` shundoq uzatilmaydi — tur o'zimizda
  aniqlanadi.** `/api/product-photo` Telegram CDN'i bergan sarlavhani uzatardi, u esa
  `application/octet-stream` bo'lib kelardi. Sabab ikkita: (1) brauzer `<img>` ichida turni o'zi
  sezgani uchun nuqson KO'RINMAYDI, faqat Cloudflare rasm optimizatsiyasi jimgina o'chib qoladi;
  (2) oddiy `qiymat || fallback` naqshi bu yerda yaramaydi — `application/octet-stream` "truthy",
  ya'ni u fallback'ni bosib o'tadi, shuning uchun umumiy tur ATAYLAB yaroqsiz deb hisoblanadi
  (`usableMime()`). Bundan keyin proksi qilingan har qanday faylda tur manbadan emas, fayl
  kengaytmasidan olinadi
- [2026-07-31] Qaror: **"haqiqiy Telegram bilan sinalmagan" kod sinalgan hisoblanmaydi.** Sotuvchining
  botga rasm yuborish oqimi 2026-07-30 da soxta ma'lumot bilan sinalgan va ishlaydi deb yozilgan edi;
  haqiqiy Telegram bilan o'tkazilganda esa `Content-Type` nuqsoni chiqdi. Sabab: soxta ma'lumot
  o'zimiz kutgan shaklda keladi, tashqi xizmat esa kutmagan shaklda — nuqsonlar aynan shu farqda
  yashiringan bo'ladi. Bu "CI yashil edi, fayllar esa serverga chiqmagandi" darsining aynan o'zi
