# LolaMarket — Loyiha Qoidalari

## Majburiy qoidalar

- **Har git commit'dan oldin majburiy `hisobotchi` agentini ishga tushir.**
- **Barcha commit xabarlari o'zbek tilida bo'lsin.**
- Commit format: `tip: tavsif` (feat / fix / docs / style / refactor / chore)

## Arxitektura qoidalari

- **Admin panelning YOZUV amallari Telegram'da tasdiqlanadi** (2026-07-27 founder
  qarori). Panel faqat so'rov yaratadi (`POST /api/admin/action`), amal
  `ADMIN_CHAT_ID` chatidagi inline tugma bosilgandan keyin bajariladi; so'rov 30
  daqiqada eskiradi va tugmani bosgan odam `ADMIN_TG_IDS` ro'yxatida bo'lishi
  tekshiriladi. Sabab: panel tokeni brauzer `sessionStorage`ida yashaydi va
  o'g'irlanishi mumkin, pul o'tkazish/refund esa qaytarib bo'lmaydi.
  **Yangi yozuv amali qo'shilsa ham shu yo'ldan o'tsin** — paneldan
  to'g'ridan-to'g'ri DB'ga yozadigan endpoint qo'shilmasin.
- **Panelda o'ylab topilgan raqam ko'rsatilmasin.** Ma'lumot bazadan kelmasa,
  o'sha blok umuman ko'rsatilmaydi (mock raqam yoki soxta trend foizi emas).
- **Foydalanuvchi kimligi hech qachon brauzerdan olinmaydi** (2026-07-29).
  Mini App'da — imzolangan `initData`, saytda — bir martalik kod: Telegram ID
  bot webhook'iga Telegram'ning O'ZI yuboradi. Klient yuborgan `tg_user_id` ga
  ishonadigan endpoint qo'shilmasin. Sayt sessiyasi HttpOnly cookie'da yuradi
  va bazada faqat `sha256` shaklida saqlanadi (panel tokenidan farqi shu —
  u `sessionStorage`da yashaydi va XSS'da o'g'irlanishi mumkin).
- **Zaxira (`products.stock`) har doim ATOMIK kamaytiriladi** (2026-07-30).
  Tekshiruv va kamaytirish bitta `UPDATE ... WHERE stock >= qty` da bo'ladi
  (`routes/orders.js` → `decrementStock`), hech qachon alohida `SELECT` +
  `UPDATE` ga bo'linmasin: ikki xaridor bir vaqtda oxirgi rulonni olsa,
  ikkalasi ham "bor" deb o'qib o'tib ketardi. Qatorlar `id` bo'yicha
  tartiblangan holda qulflanadi (deadlock). `stock IS NULL` = CHEKSIZ —
  `made` mahsulotlar va son kiritilmagan e'lonlar. Bekor qilinganda zaxira
  qaytariladi, `refunded`da esa ATAYLAB qaytarilmaydi (mato xaridorda qoladi).
- **Buyurtma holati o'zgarishi TARIXSIZ bo'lmaydi** (2026-08-03). Har bir
  `UPDATE orders SET status` yonida `recordStatusChange()`
  (`server/lib/order-history.js`) turadi va u holat bilan **BITTA
  tranzaksiyada** bajariladi. Funksiya `pool` qabul qilmaydi — faqat
  `pool.connect()` dan olingan klient (`pool` da ham `.query` bor, shuning
  uchun `.release` bo'yicha farqlanadi): `pool` uzatilsa yozuv tranzaksiyadan
  tashqarida ketib, atomiklik jimgina yo'qolardi. Xato ham yutilmaydi — tarix
  yozilmasa butun o'tish ROLLBACK bo'ladi. Sabab: teshikli tarix tarix
  yo'qligidan YOMONROQ, chunki unga qarab qaror qabul qilinadi va u jimgina
  yolg'on gapiradi. Yangi yozuv nuqtasi qo'shilsa `server/test.js` dagi
  `HISTORY_INVENTORY` ham yangilansin — aks holda Test 12b qizil bo'ladi
  (u manba kodini skanerlab qamrovni tekshiradi).
  ⚠️ **Bir xil ro'yxat ikki jadvalda takrorlanmasin.** `to_status` ga CHECK
  ATAYLAB qo'yilmagan: qiymat baribir `orders_status_check` dan o'tgan bo'ladi.
  Aynan shu naqsh 2026-08-03 da tishlagan — `admin_actions_kind_check` da
  `review_hide` yo'q edi va sharh yashirish production'da BUTUNLAY ishlamasdi
  (`db/014`). Ikkinchi ro'yxat himoya emas, kelajakdagi tuzoq.
- **Reyting hosila — qo'lda yozilmasin** (2026-07-31). `products.rating`,
  `products.reviews` va `sellers.rating` ustunlarining YAGONA yozuvchisi —
  `routes/reviews.js` → `recalcRating()`, u qiymatni `reviews` jadvali ustidan
  `avg(stars)` / `count(*)` bilan hisoblaydi. `reviews = reviews + 1` kabi qo'lda
  oshirish TAQIQLANADI: sharh yashirilganda son kamaymay qoladi va reyting jimgina
  yolg'onga aylanadi. Sharh yo'q bo'lsa reyting `0` emas, **`NULL`** — UI `null`
  bo'lganda reyting blokini umuman ko'rsatmaydi ("baholanmagan" ≠ "yomon
  baholangan"). Xuddi shu sabab `telegram-app/app.js` dagi zaxira massivda ham
  reyting yo'q — u yerda haqiqiy sharh bo'lishi mumkin emas.
- **`innerHTML` ga boradigan HAR QANDAY tashqi matn `esc()` dan o'tsin**
  (2026-08-02). Foydalanuvchi yozgan matn — buyurtma izohi, manzil, bahs sababi,
  sotuvchi javobi, mahsulot nomi, Telegram ismi — shablon satriga xom qo'yilsa,
  u **kod bo'lib ishga tushadi**. Bu nazariy emas: xaridor buyurtma izohiga
  `<img src=x onerror=...>` yozsa, u SOTUVCHI ekranida sotuvchining sessiyasida
  bajarilardi. CSP to'xtatmaydi — u `'unsafe-inline'` bilan ishlaydi.
  **Mahsulot maydonlari uchun alohida `esc()` YOZILMASIN** — nom, sotuvchi,
  shahar, `img` `vm()` chegarasida bir marta tozalanadi (`telegram-app/app.js`),
  chunki ular o'nlab joyda chiziladi va har birini eslab qolish imkonsiz.
  `vm()` dan o'tmaydigan narsalar (buyurtma, bahs, profil) esa chizish joyida
  o'raladi.
  ⚠️ **`esc()` faqat matn va oddiy atribut uchun** (`<div>${esc(x)}</div>`,
  `<img src="${esc(x)}">`). Atribut ICHIDA boshqa til boshlansa —
  `style="...url('${x}')"` yoki `onclick="f('${x}')"` — **yaramaydi:** HTML
  tahlilchisi `&#39;` ni `'` ga qaytaradi va matn tirnoqdan chiqib ketadi
  (2026-08-02 da sinab ko'rilgan — `esc()` bilan ham CSS qo'llanib ketdi).
  Bunday joyda URL uchun `cssUrl()` ishlatilsin (`vm()` → `bgStyle` namunasi),
  qolgani esa umuman interpolatsiya qilinmasin — qiymat `dataset` orqali berilsin.
  `encodeURI()` ning O'ZI ham yetarli emas: u bitta tirnoqni qochirmaydi, shuning
  uchun `cssUrl()` uni alohida `%27` ga almashtiradi.
  **Serverda tozalanmaydi:** baza xom matn saqlaydi, chunki Telegram yo'li
  o'zining `escapeHtml` ini qo'llaydi (`routes/orders.js`) — ikki marta
  qochirilsa foydalanuvchi `&lt;` ko'rib qolardi. Himoya CHIQISHDA turadi.
- **`console.error` ning BIRINCHI argumenti — alert guruhlash KALITI**
  (2026-08-03). Server xatosi Telegram'ga boradi (`server/lib/alert.js`) va
  bosish tomi aynan shu birinchi argument bo'yicha guruhlaydi. Unga
  **o'zgaruvchan ma'lumot qo'yilmasin** — buyurtma raqami, ID, foydalanuvchi
  nomi: har xil kalit ALOHIDA alert bo'lib ketadi, tom ishlamay qoladi va
  bitta nosozlik Telegram'ni yuzlab xabar bilan to'ldiradi. To'g'ri shakl:
  `console.error('createOrder xatosi:', e.message)` — belgi birinchi, o'zgaruvchan
  qism ikkinchi argumentda.
  ⚠️ **Bu qoidani endi test qo'riqlaydi** (2026-08-05): `server/test.js` → Test 10c
  `server/`, `server/lib/`, `server/routes/` dagi hamma faylni skanerlab birinchi
  argument interpolatsiyali shablon satri (`` `...${x}` ``) yoki `'matn' + x`
  emasligini tekshiradi. Test qo'shilishining sababi qoidaning o'zidan muhimroq:
  qoida `b6e6b7d` bilan yozilgan va O'SHA commitdagi `server.js` →`requestCrashed`
  da buzilgan holda qolgan edi (birinchi argumentda `${req.method} ${path}`,
  ~26 xil kalit). Ya'ni **yozilgan qoida himoya emas — uni tekshiradigan test
  himoya.**
- **Almashtirishni QO'LGA KIRITMASDAN eskisini o'chirma** (2026-08-05).
  `rm -rf X && mv Y X` naqshi TAQIQLANADI: `rm` birinchi bajariladi va `mv`
  yiqilsa (nom xato, `<sana>` kabi namuna to'ldirilmagan, zaxira yo'q) —
  qaytib bo'lmaydigan yo'qotish qoladi, ustiga `&&` zanjiri uzilgani uchun
  ortidagi `systemctl restart` ham ishlamaydi va nosozlik JIMGINA qoladi.
  To'g'ri tartib: (1) `test -d` bilan almashtirish borligini tekshir,
  (2) eskisini `mv` bilan CHETGA SUR — o'chirma, (3) yangisini joyiga qo'y.
  Sabab: `server/README.md` dagi orqaga qaytarish buyrug'i aynan taqiqlangan
  naqshda yozilgan edi va 2026-08-03 da `/opt/lolamarket-notify/` ni
  o'chirib yubordi. Jarayon `rm -rf` dan O'LMAYDI (ochiq deskriptorlar va
  xotiradagi kod bilan ishlayveradi), shuning uchun sayt sog'lom ko'rinardi va
  nosozlik **~24 soat sezilmadi** — har qanday restart backendni butunlay
  o'ldiradigan holatda turib. Ikkala `.bak` omon qolgani `mv` bajarilmaganini
  isbotladi. Qorovul: `server/lib/self-check.js` (Test 13).
- **Sozlama qiymati BO'SH EMASLIGI uni haqiqiy qilmaydi** (2026-08-05).
  `.env` dan keladigan har bir qiymat `config.js` da SHAKLI bo'yicha
  tekshirilsin — `process.env.X || ZAXIRA` naqshining o'zi YETARLI EMAS.
  Sabab: `.env` da `ALERT_CHAT_ID=<chat_id>` namunasi to'ldirilmay qolgandi.
  U bo'sh emas, shuning uchun `||` uni haqiqiy qiymat deb qabul qildi va
  server xatolari haqidagi alertlar mavjud bo'lmagan chatga ketaverdi.
  `sendAlert` xatoni ATAYLAB yutgani uchun jurnalda ham iz qolmadi:
  **xato monitoringi ikki kun o'lik turdi va buni HECH NARSA ko'rsatmadi** —
  ustiga sprintda "production'da tasdiqlandi" deb yozib ham qo'yilgandi.
  Namuna: `chatId()` (`server/config.js`) — chat_id butun son bo'lishi
  tekshiriladi, yaroqsizi zaxiraga qaytadi VA jurnalda qichqiradi. Oxirgi
  zaxiraning o'zi (`ADMIN_CHAT_ID`) yaroqsiz bo'lsa — `process.exit(1)`,
  chunki uning ortida hech narsa yo'q. Qorovul Test 2c bilan qulflangan.
  Bu `NULL` reyting va tarix qoidalari bilan bitta oilada: **jimgina yolg'on
  yo'qlikdan yomonroq** — yo'qlik ko'rinadi, yolg'on esa ko'rinmaydi.
- **Statik fayl o'zgarsa `?v=` HAM oshadi** (2026-08-06). `script.js`, `app.js`,
  `style.css` kabi versiyalangan fayl tahrirlansa, uni chaqiradigan **HAMMA**
  HTML da `?v=` raqami ko'tarilishi shart. Sabab: brauzer keshining kaliti —
  to'liq URL, ya'ni raqam o'zgarmasa qaytib kelgan foydalanuvchida **yangi HTML
  + eski JS** birikmasi hosil bo'ladi. Bu kosmetik emas: 2026-08-06 da admin
  panelda `index.html` inline `onclick` dan mahrum bo'lgan holda `admin.js`
  keshda eski versiyada qolardi va **kirish tugmasi butunlay o'lik** bo'lardi.
  ⚠️ **Bitta fayl hamma sahifada BIR XIL versiya bilan chaqirilsin.** Xuddi shu
  kuni topilgan holat: `admin/index.html` ildizdagi `style.css` ni `?v=21` bilan
  chaqirardi, `index.html` esa AYNI faylni `?v=36` bilan — ya'ni admin panel
  15 versiya orqadagi keshni cheksiz ushlab turardi va buni hech narsa
  ko'rsatmasdi.
  **Istisno — service worker `PRECACHE` ro'yxatidagi fayllar** (`offline.js`):
  ular ATAYLAB `?v=` siz yuradi, chunki `sw.js` keshdan `ignoreSearch`siz
  qidiradi va versiya qo'shilsa so'rov keshdagi yozuvga mos kelmay qolardi.
  U yerda eskirish `CACHE_VERSION` orqali boshqariladi — u ham har deploy'da
  oshiriladi.
  **Qorovul: `server/test.js` → Test 16.** HTML larni O'ZI skanerlaydi (ro'yxat
  qo'lda yozilmaydi), har bir versiyalangan faylning `sha256` ini jadvaldagi
  qiymat bilan solishtiradi. Fayl o'zgarib versiya qolsa test QIZIL bo'ladi va
  nima qilish kerakligini aytadi. Yangi versiyalangan fayl qo'shilsa u ham
  avtomatik qamraladi. Bu qoida `console.error` va inline hodisa qoidalari
  bilan bitta oilada: **yozilgan qoida himoya emas — uni tekshiradigan test
  himoya**, va aynan bu qoida 2026-08-06 gacha faqat odat bo'lgani uchun
  buzilgan edi.
- **Hujjatdagi raqam — TEKSHIRILMAGAN DA'VO** (2026-08-06). Optimizatsiya yoki
  tuzatish bandi ochilganda **bazaviy raqamning O'ZI qayta o'lchansin**, undan
  ish boshlanmasin. Sabab: raqam bandning kattaligini va navbatdagi o'rnini
  belgilaydi, ya'ni u noto'g'ri bo'lsa **ish noto'g'ri narsaga yo'naltiriladi**.
  Bir kunda uch marta tasdiqlandi:
  «shriftlar 250 KB / 13 woff2» → aslida **131 KB / 3 fayl** (yozilgan raqam
  barcha `unicode-range` subsetlarining yig'indisi edi, brauzer esa faqat
  latinni oladi — band ikki barobar kattaroq ko'rinib turgan);
  «`sayt-eski/` o'chirilmasin, `demo/` va `admin/` unga bog'liq» → `demo/`
  repoda umuman yo'q, `admin/` esa ildizdagi `style.css` ni ishlatadi (papka
  yolg'on sabab bilan saqlanib turgan);
  «32 test» → aslida 33 ta.
  ⚠️ Raqam ikki MUSTAQIL usul bilan olinsa ishonchli bo'ladi — shrift bandida
  `curl` bilan yig'ish va brauzerdagi `performance` resurs yozuvlari bir xil
  javob bergani shuni berdi.
  Bu qoida `NULL` reyting, `ALERT_CHAT_ID` va tarix qoidalari bilan bitta
  oilada: **jimgina yolg'on yo'qlikdan yomonroq** — yo'q raqam savol tug'diradi,
  noto'g'ri raqam esa ishonch uyg'otadi.
- **Frontendda `window.addEventListener('load', ...)` ishlatilmasin** (2026-07-31,
  ikki marta kuyganimizdan keyin). `load` BARCHA rasm va shrift yuklanib bo'lgandan
  keyin otiladi — sekin tarmoqda bu soniyalar. Ikki marta zarar keltirdi:
  `pwa.js` service worker'ni ro'yxatdan o'tkazmadi (`5ffe1f0`), `script.js` esa
  butun ekranni yopib turgan `#page-loader`ni ochmay turdi. **O'rniga:**
  DOM kifoya bo'lsa — `DOMContentLoaded` (yoki skript `defer` bo'lsa to'g'ridan-
  to'g'ri chaqir). Haqiqatan `load` kerak bo'lsa — hodisa ALLAQACHON o'tgan
  bo'lishi mumkinligini hisobga ol: avval `document.readyState` tekshirilsin,
  aks holda listener hech qachon otilmaydi (`pwa.js` → `whenReady()` namunasi).
- **Rasmni `<picture>` ga o'rasangiz, konteynerini CSS ro'yxatiga qo'shing**
  (2026-08-05). `<picture>` rasm bilan uni o'rab turgan quti ORASIGA kiradi va
  u odatda `display: inline`, balandligi `auto`. Shuning uchun `img { height:
  100% }` tayanadigan narsasini yo'qotadi va **blok balandligi nolga tushadi**.
  Nuqson JIMGINA chiqadi: rasm yo'qolmaydi, konsolda xato yo'q, shunchaki blok
  yopiladi. Yechim `style.css` da: `.ad-slide picture, .product-media picture
  { display: block; width: 100%; height: 100% }` — yangi joy qo'shilsa shu
  selektorlar ro'yxatiga ham qo'shilsin.
  ⚠️ **Bir xil rasm ikki joyda ishlatilsa — ikkalasi BIRGA o'tkazilsin.**
  Bittasini `<picture>` ga o'rab, ikkinchisini `.jpg` qoldirsangiz brauzer
  AYNAN BIR rasmni ikki formatda ikki marta yuklaydi va o'zgarishingiz
  holatni yomonlashtiradi. 2026-08-05 da `d7928cec...` rasmi bilan aynan shu
  bo'lay dedi (banner slaydi + `tx-4402` kartochkasi).
- **Tashqi skript hech qachon `<head>`da `defer`siz turmasin.** `telegram.org`dan
  keladigan `telegram-web-app.js` 114 KB va HTML tahlilini ~613 ms to'xtatardi.
  Sahifadagi skriptlar `defer` bo'lsa — **HAMMASI birdan** `defer` bo'lsin:
  bittasi `defer`siz qolsa u parse paytida, ya'ni defer'liklardan OLDIN ishlaydi
  va tartib buziladi (`app.js` `window.Telegram`ni topa olmaydi).

## Loyiha haqida

LolaMarket — O'zbekistonda to'qima materiallar uchun B2B web platforma.
- PRD: `docs/prd.md`
- Sprintlar: `docs/sprintlar/sprint-N.md`
- Panel: `loyiha-panel.html`

## Fayl tuzilmasi

```
1-dars/
├── index.html, style.css, script.js  — landing (lolamarket.uz), Mini App dizayn tizimida
├── telegram-app/                      — Telegram Mini App (serverda `mini-app/`)
├── admin/                             — admin panel; ILDIZDAGI style.css + admin.css
├── docs/
│   ├── prd.md                         — Founder PRD
│   ├── prd-lolamarket.md              — Texnik PRD
│   └── sprintlar/sprint-0..9.md      — Sprint fayllar
├── lolamarket-next/                   — Next.js loyihasi (alohida repo)
│
│   ⚠️ 2026-08-06 da `sayt-eski/` va `demo/` OLIB TASHLANDI. Bu yerda ilgari
│   "sayt-eski/ o'chirilmasin — demo/ va admin/ uning style.css'iga bog'liq"
│   deb yozilgandi va TEKSHIRILGANDA YOLG'ON bo'lib chiqdi: `demo/` repoda
│   allaqachon yo'q edi, `admin/` esa ildizdagi `style.css` ni ishlatadi.
│   Ya'ni papkani saqlab turgan sabab hech qachon tekshirilmagan da'vo edi.
│   Eski sayt git tarixida qoladi (`git show 99fd084:sayt-eski/index.html`).
├── loyiha-panel.html                  — Sprint progress paneli
└── Photo/                             — Rasmlar
```

## Server va Deploy

- **Server:** Hetzner VPS `65.21.180.44`
- **Deploy:** rsync orqali `/var/www/lolamarket/`
- **Sayt:** lolamarket.uz (Cloudflare CDN)
- **GitHub:** `furqattukhsanov/1-dars` (statik sayt)
- **Next.js GitHub:** `furqattukhsanov/lolamarket-next`
- **Telegram bot bildirishnoma relay:** serverda `/opt/lolamarket-notify/server.js` (systemd servis `lolamarket-notify`), nginx'da `/api/telegram-notify` proxy — bot token faqat server `.env`da, git repo'ga kirmaydi
- **Zaxira (backup):** serverda `/opt/lolamarket-notify/pg-backup.sh`, cron `30 3 * * *`. Nusxa ikki joyda: serverda `/opt/lolamarket-backups/` (7 kun) va **Telegram'da** (`sendDocument`, chat — `.env` dagi `BACKUP_CHAT_ID`, bo'lmasa `ADMIN_CHAT_ID`; 2026-08-01 dan). Sabab: nusxalar bazaning o'zi bilan bitta diskda edi. Skript repoda YO'Q — serverda yashaydi va tokenni `.env` dan o'qiydi, shuning uchun `server/README.md` dagi rsync exclude ro'yxatida turishi shart. ⚠️ **Zaxira ichida mijoz ma'lumoti bor** — `BACKUP_CHAT_ID` chatidagi har kim butun bazani yuklab olishi mumkin
- **Nginx konfiguratsiyasi CI/CD tomonidan boshqarilmaydi** — deploy workflow faqat statik fayllarni rsync qiladi. (2026-07-22 gacha workflow nginx'ni qayta yozib, `/api/` proxy bloklarini o'chirib yuborardi va Telegram bildirishnomalarini ishdan chiqarardi.)
- **Papka nomlari farqi:** repo'dagi `telegram-app/` serverda `mini-app/` deb ataladi — landing HTML'idan `telegram-app/...` yo'liga ishora qilmang, 404 bo'ladi. CI'da u ALOHIDA qadam bilan ko'chiriladi (`strip_components: 1`) — birinchi ro'yxatga qo'shib bo'lmaydi
- **CI faqat `deploy.yml` dagi `source` ro'yxatidagi fayllarni chiqaradi** (2026-07-30). Ro'yxat aynan sanaydi: **repoda yangi ildiz fayli paydo bo'lsa, uni qo'lda qo'shish SHART**, aks holda u serverga umuman chiqmaydi. Buni sezish qiyin — nginx yo'q faylga `try_files ... /index.html` bilan HTML va **HTTP 200** qaytaradi, ya'ni `curl -w %{http_code}` bilan tekshirsangiz hammasi joyidek ko'rinadi. Shuning uchun deploy tekshiruvi HTTP kodiga emas, javob **TURIga** (`Content-Type`) qaraydi.
  **HTML fayl uchun esa `Content-Type` ham yaramaydi** (fallback ham `text/html`) —
  u yerda javob TARKIBIDAGI noyob satr tekshiriladi (`deploy.yml` → `check_html`). Shu tuzoq sababli landing PWA fayllari va butun Mini App uch sessiya davomida foydalanuvchiga yetib bormagan edi

## Til

- Barcha commit xabarlari — o'zbekcha
- Sprint fayllari — o'zbekcha
- Kod izohlari — o'zbekcha yoki inglizcha
