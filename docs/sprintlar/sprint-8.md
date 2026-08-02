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
- [ ] Sharhlar oqimi: buyurtma → yetkazildi → sharh → reyting → admin yashirishi
  — kod 2026-07-31 da yozildi va production'ga chiqdi (`rating` endi 13/13 mahsulotda
  `null`, `/api/reviews` 200 qaytaryapti, himoyalangan 4 endpoint 401). **Haqiqiy sharh
  bilan hali sinalmagan.** Qadamma-qadam reja: `docs/sinov-sharhlar.md`
- [ ] To'lov xatolari: bekor qilish, vaqt tugashi, ikki marta to'lash
- [ ] Qaytarish oqimi: xaridor muammo bildiradi → moderator qaror beradi → pul qaytariladi

### Pilot foydalanuvchilar
- [ ] 3–5 ta tanish xaridor bilan real buyurtma sinovlari
- [ ] 2–3 ta ishlab chiqaruvchi bilan kabinet sinovlari
- [ ] Xato va shikoyatlarni yig'ish

### Ishlash tekshiruvi
- [ ] Sahifalar yuklanish tezligi (3 soniyadan kam)
  — **QISMAN (2026-07-31):** birinchi marta HAQIQATAN o'lchandi va uchta sabab topib
  tuzatildi (pastdagi yozuvga qarang). Band OCHIQ qoladi, chunki o'lchov lokal va Wi-Fi
  bo'yicha — **sekin mobil internetda (O'zbekistondagi haqiqiy 3G/4G) hali sinalmagan**
- [ ] Mobil da barcha funksiyalar ishlashi
- [ ] To'lov webhook larning ishonchliligi

### Tuzatishlar
- [ ] Pilot dan kelgan xatolarni tuzatish
- [ ] UX muammolarini hal qilish

---

## Qilingan ishlar

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
