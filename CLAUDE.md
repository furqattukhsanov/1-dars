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
  ⚠️ **Kimlik IKKI KANALDA ham bitta nuqtadan olinadi** (2026-08-12):
  `lib/auth.js` → `requestUser()`. U avval imzolangan `initData` ni, keyin
  cookie sessiyasini ko'radi va ikkalasini BITTA shaklga (`{ id }` — Telegram
  ID satr ko'rinishida) keltiradi. Endpoint `authUser()` ni TO'G'RIDAN-TO'G'RI
  chaqirsa u faqat Mini App'ni biladi va **sayt xaridori jimgina 401 oladi** —
  aynan shu bo'lgan: bahs ochish (`/api/disputes`) saytda UMUMAN ishlamasdi,
  ya'ni kafolat va'da qilingan, mexanizmi esa bir kanalda edi. Nuqson
  ko'rinmasdi, chunki Mini App'da hammasi joyida ishlardi.
  Faqat Mini App uchun mo'ljallangan endpoint (`initData` majburiy bo'lgan
  joy) `authUser()` da qolishi mumkin — lekin bu ATAYLAB tanlov bo'lsin.
  Sessiya o'qish `lib/web-session.js` da turadi, `routes/` da EMAS: marshrutda
  qolsa `lib/auth.js` uni ishlata olmasdi (qatlam `routes/ → lib/` bir tomonga
  qaraydi). Qorovul: `server/test.js` → Test 3e — soxta imzo cookie yo'lini
  ochib yubormasligini ham tekshiradi (3 mutatsiya bilan sinaldi).
  ⚠️ **Qoida yozilgan bo'lsa ham NAQSH TAKRORLANDI** (2026-08-13): AI rasm
  endpointi (`routes/ai.js`) hamon `authUser()` da edi va sayt xaridori
  o'sha 401 ni olardi — ya'ni qoida yozilgani uni bajarilgan qilmadi.
  Shuning uchun **Test 3f** qo'shildi: u `script.js` dan saytning O'Z
  chaqiruvlarini yig'adi (yo'l + METOD), `server.js` router'idan handler
  nomini topadi va `routes/` dagi funksiya TANASINI o'qiydi — tanada
  `authUser(` bo'lib `requestUser(`/`webSessionUser(` bo'lmasa test QIZIL.
  Ro'yxat qo'lda yozilmaydi: saytga yangi `fetch('/api/...')` qo'shilsa u
  avtomatik qamraladi. Beshta mutatsiya bilan sinaldi, beshtasi ham ushlandi.
  Sinov ikkita teshik ochdi va ikkalasi ham tuzatildi: (1) IZOHDAGI
  `requestUser()` so'zi qorovulni aldardi — endi tahlildan oldin izohlar
  olib tashlanadi; (2) o'ram funksiyaning NOMIGA ishonish yetarli emas —
  `reviewAuthor` ning cookie yo'li o'chirilganda ham test yashil qolardi,
  endi o'ramning ichi ochib ko'riladi.
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
  oshiriladi. **Buni Test 17 qo'riqlaydi** (2026-08-07): u ikkala `sw.js` dan
  `PRECACHE` ro'yxatining O'ZINI o'qiydi va ro'yxat + fayllar tarkibining
  `sha256` ini jadval bilan solishtiradi, ya'ni ro'yxatga fayl qo'shilsa ham,
  fayl ichi o'zgarsa ham `CACHE_VERSION` oshirilmaguncha test QIZIL bo'ladi.
  Yonida ikki qorovul: PRECACHE yozuvida `?v=` bo'lmasin (yuqoridagi istisno
  aynan shu) va ro'yxatdagi har bir fayl diskda mavjud bo'lsin. Sabab: bu
  ko'rsatma `sw.js` faylining O'ZIDA yozilgan edi va shunga qaramay raqam
  `v1` da qotib qolgandi — Test 16 esa buni QAMRAMASDI, chunki u HTML dagi
  `?v=` ga qaraydi, PRECACHE esa ataylab `?v=` siz yuradi.
  **Qorovul: `server/test.js` → Test 16.** HTML larni O'ZI skanerlaydi (ro'yxat
  qo'lda yozilmaydi), har bir versiyalangan faylning `sha256` ini jadvaldagi
  qiymat bilan solishtiradi. Fayl o'zgarib versiya qolsa test QIZIL bo'ladi va
  nima qilish kerakligini aytadi. Yangi versiyalangan fayl qo'shilsa u ham
  avtomatik qamraladi. Bu qoida `console.error` va inline hodisa qoidalari
  bilan bitta oilada: **yozilgan qoida himoya emas — uni tekshiradigan test
  himoya**, va aynan bu qoida 2026-08-06 gacha faqat odat bo'lgani uchun
  buzilgan edi.
- **R2 — QO'SHIMCHA ombor, ALMASHTIRUVCHI emas** (2026-08-09). Rasm
  Cloudflare R2 ga (`lolamarket-storage`, `cdn.lolamarket.uz`) yoziladi, lekin
  Telegram nusxasi **O'CHIRILMAYDI**: `product_ai_image.file_id` `NOT NULL`
  bo'lib qoladi va `products.img_file_id` yoniga `img_r2_key` QO'SHILADI
  (`db/021`). Ombor almashtirish bir tomonlama eshik bo'lmasligi kerak —
  R2 yo'lida nimadir chiqsa kod bitta shart bilan eski yo'lga qaytadi.
  Chiqishda uch pog'ona: R2 → Telegram proksi → statik rasm.
  ⚠️ **R2 ga yozish ENG YAXSHI HARAKAT va u kreditni qaytaradigan `try` dan
  TASHQARIDA turadi.** Rasm Telegram'ga allaqachon yuklangan, ya'ni xaridor
  to'lagan narsasini olgan — R2 nosozligi butun so'rovni yiqitsa, xaridor
  mavjud rasm uchun xato ko'rardi. **Lekin xato YUTILMAYDI:** `console.error`
  alertga chiqadi, aks holda R2 har safar yiqilib turgan holat jimgina davom
  etardi va "R2 ga o'tdik" degan ishonch oylab yolg'on bo'lib qolardi
  (`ALERT_CHAT_ID` darsi).
  ⚠️ **Kalit TARKIBDAN yasaladi** (AI: manba+javoblar hash; sotuvchi rasmi:
  baytlarning `sha256` i) — tasodifiy yoki vaqtga bog'liq BO'LMASIN. Sabab:
  obyekt `immutable, max-age=31536000` bilan yotadi, ya'ni bitta kalit
  ostidagi rasm hech qachon o'zgarmasligi SHART. Tasodifiy kalitda surat
  almashgan kuni eski rasm bir yil davomida yangisi o'rniga ko'rinib turardi.
  🔴 **CDN keshi O'CHIRISHNI QAYTARMAYDI** — 2026-08-09 da o'lchandi: obyekt
  R2 dan o'chirilgandan keyin ham `cdn.lolamarket.uz` uni `cf-cache-status:
  HIT` bilan berib turdi. Ya'ni **rasmni o'chirish uni internetdan olib
  tashlamaydi**; moderatsiya uchun Cloudflare cache purge kerak.
  🔴 **Baza zaxirasi bu bucket'ga QO'YILMASIN** — unga custom domain ulangani
  uchun kalitni bilgan har kim o'qiy oladi, zaxirada esa mijoz ma'lumoti bor.
  Qorovul: `server/test.js` → Test 18 (sozlama shakli), 18b (kalit yo'li,
  `..` rad etilishi), 18c (R2 yiqilsa xaridor zarar ko'rmasligi + `file_id`
  saqlanishi), 18d (kalit tarkibga bog'langani). To'rttasi 6 mutatsiya bilan
  sinaldi, 6 tasi ushlandi.
- **AI rasmiga brend tasmasi — RASM TAGIGA, ustiga emas** (2026-08-09, founder
  qarori: "shuni har bir AI bilan qilingan rasmni tagiga qo'y doim"). Tasma
  (`server/assets/lola-banner.png`) rasm USTIGA qo'yilmaydi, tuvalning bo'yi
  uzaytirilib PASTGA qo'shiladi: kadr 3:4 va uning pastki qismida kiyimning
  etagi turadi — ustiga yozilsa aynan shu joy yopilardi.
  ⚠️ **Tasma qo'shish Telegram'ga yuklashdan OLDIN bo'ladi** — shunda
  Telegram, R2 va kesh AYNI baytlarni oladi. Keyin qo'yilsa uch joyda uch xil
  rasm qolardi. Lekin u kreditni qaytaradigan `try` ichida O'Z `try` si bilan
  o'raladi: rasm allaqachon chizilgan va pul ishlatilgan, tasma xatosi uni
  yo'qotmasin (R2 bandidagi bilan bitta qoida). Xato YUTILMAYDI —
  `console.error` alertga chiqadi.
  ⚠️ **Tasma fayli almashsa `BANNER_VERSION` HAM oshadi** (`lib/watermark.js`)
  va u `imageSourceHash` ichida turadi. Oshirilmasa: bazadagi kesh eski rasmni
  qaytaraverardi, R2 dagi nusxa esa `immutable, max-age=31536000` bilan
  yotgani uchun eski tasma **bir yil** ko'rinib turardi. Bu `?v=` va R2
  kaliti qoidalari bilan bitta oila.
  **Matn kod ichida chizilmaydi:** Node'da shrift rasterizatori yo'q, shuning
  uchun tasma TAYYOR PNG sifatida yotadi (1024×97, Hanken Grotesk). Uni
  yangilash — faqat faylni almashtirish va versiyani oshirish.
  **PNG kodeki sof Node** (`lib/png.js`, `zlib` ustida): `sharp` kabi nativ
  paket deploy'ga yangi sinish nuqtasi qo'shardi, kerak bo'lgani esa atigi
  uchta amal — dekod, miqyoslash, kodlash. O'lchandi (2026-08-09): 1365×762
  rasmda ~0.9 s, hajm **1.04x**.
  Qorovul: `server/test.js` → Test 19 (kodek yo'qotishsiz), 19b (tasma
  pastda, kadr tegilmagan), 19c (tasma yiqilsa xaridor zarar ko'rmaydi +
  Telegram tasmali nusxani oladi), 19d (fayl o'zgarsa versiya oshsin).
  Beshta mutatsiya bilan sinaldi, beshtasi ham ushlandi.
- **Prompt — kod emas, MATN: uni CHOP ETIB O'QISH kerak** (2026-08-09).
  AI prompti bo'laklardan yig'iladi (`server/lib/ai.js` → `buildImagePrompt`)
  va har bo'lak alohida to'g'ri bo'lishi mumkin, **birga o'qilganda esa zid**.
  Test bunday nuqsonni TUTMAYDI: u satrlar borligini tekshiradi, ma'nosini
  emas. Shuning uchun prompt o'zgarganda u HAR BIR kiyim turi uchun chop
  etilib ko'z bilan o'qilsin.
  Sabab: o'sha kuni ikkita ziddiyat aynan shu yo'l bilan topildi —
  ro'mol tanlanganda "sochi yig'ilgan va **ko'rinib turadi**" bandi qolib
  ketardi (ro'mol sochni yopadi), kostyumda esa "floor-skimming **hem**"
  deyilardi (shimda etak yo'q). Ikkalasi ham 44 ta yashil testdan o'tib
  kelgan edi. Ziddiyat modelni "o'z didiga" qaytaradi, ya'ni zid buyruq
  olgan model eng o'rtacha javobni beradi — aynan tuzatilayotgan nuqsonning
  o'zi.
  ⚠️ Buni test bilan qulflab bo'lmaydi va shuning uchun bu **qoida
  emas, ODAT**: `test.js` faqat ro'yxatlarni qamraydi (Test 14p —
  ODOB bilan zid so'zlar, o'qlar mustaqilligi), gapning MA'NOSI esa
  faqat o'qilganda ko'rinadi. Bu "yozilgan qoida himoya emas" oilasidan
  **istisno**: bu yerda test yozib bo'lmaydi, shuning uchun qadam qo'lda
  bajariladi.
- **Xaridor manzili — BAZADA, karta esa IXTIYORIY** (2026-08-13, founder
  qarori: profilda "Mening manzilim" bo'lsin va nuqta kartadan tanlansin).
  Yetkazish modeli O'ZGARMADI — mato baribir BTS nuqtasiga boradi; saqlanadigan
  narsa "men doim SHU nuqtadan olaman" degan tanlov (`users.pickup_point_id`,
  `db/022`). **Haqiqat manbai — BAZA:** server "tanlanmagan" desa
  `localStorage` dagi eski qiymat O'CHIRILADI, aks holda boshqa qurilmada
  o'chirilgan tanlov bu yerda jimgina TIRILARDI (ilgari `setBtsPoint` faqat
  yozardi, o'chirmasdi — shu tuzatildi).
  ⚠️ **Karta yiqilsa funksiya YIQILMASIN.** `YANDEX_MAPS_KEY` bo'lmasa yoki
  Yandex javob bermasa — karta tugmasi umuman chizilmaydi va nuqta ro'yxatdan
  tanlanadi. Ro'yxat HAR DOIM yonida turadi: manzil o'zgartirishni tashqi
  xizmatga bog'lab qo'yish "ishlamaydigan tugma" holatini yaratardi. Kalit
  shakli `config.js` da tekshiriladi va `process.exit` QILINMAYDI (AI kaliti
  bilan bitta naqsh — ixtiyoriy funksiya serverni o'ldirmaydi).
  🔴 **BTS koordinatalari TAXMINIY** — tuman/shahar markazi aniqligida, eshik
  koordinatasi EMAS, chunki ro'yxatning O'ZI namuna (BTS API ulanmagan). Karta
  ustidagi `mapApprox` ogohlantirishi BTS'dan haqiqiy koordinata kelmaguncha
  OLIB TASHLANMAYDI: "o'ylab topilgan raqam" qoidasi bu yerda ayniqsa qimmat —
  xarita nuqtani ANIQ ko'rsatayotgandek tuyuladi, ya'ni noto'g'ri joyga
  boradigan xaridorga yolg'on ishonch beradi.
  ⚠️ `BTS_POINTS` va `SUPPORT` (bog'lanish raqami) ikkala yuzda ALOHIDA
  yashaydi — bu bilib qilingan vaqtinchalik qaror, lekin endi **Test 22c**
  qo'riqlaydi: ro'yxatlar, koordinatalar va kontakt maydonlari harfma-harf
  bir xil bo'lishi shart (6 mutatsiya bilan sinaldi). Yangi nuqta qo'shilsa
  test uni avtomatik qamraydi.
  ⚠️ Mini App'da Telegram havolasi ODDIY `<a>` BO'LMAYDI — `openTelegramLink()`
  ishlatiladi, aks holda `t.me/...` WebView ichidagi brauzerda ochilib
  foydalanuvchi chatga TUSHMASDI. Saytda esa oddiy havola to'g'ri ishlaydi:
  farq WebView'dan, uslubdan emas.
  🔴 CSP qo'llanganda `api-maps.yandex.ru` qoidaga qo'shilmasa karta JIMGINA
  o'ladi — `docs/xavfsizlik-sarlavhalari.md` → **C4** (u yerdagi manba ro'yxati
  hujjatdan olingan, jonli o'lchovdan EMAS va shunday belgilangan).
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
- **Flex ustundagi YANGI blok — birinchi savol `flex: none` kerakmi**
  (2026-08-13, UCHINCHI marta tishlagandan keyin yozildi). `display: flex;
  flex-direction: column` konteynerining bolasi standart holda **siqiladi**
  (`flex-shrink: 1`), ya'ni `height: 300px` yoki mazmun balandligi
  KAFOLAT EMAS. Ustiga `overflow: hidden` qo'shilsa nuqson **jimgina**
  bo'ladi: element DOM'da bor, o'lchamlari "to'g'ri" ko'rinadi, konsolda
  xato yo'q — mazmun esa KESIB tashlanadi.
  Uch marta bir xil sabab bilan: (1) `<picture>` blok balandligini nolga
  tushirgan; (2) `.addr-map` 300px o'rniga 63px bo'lgan — karta chizilmagan;
  (3) `.contact-block` 127px ga siqilib, ichidagi 210px edi va **Telegram
  qatori butunlay ko'rinmay qolgan**.
  🔴 **Ko'z bilan qarash YETARLI EMAS** — uchalasi ham "shunchaki yo'q"
  bo'lib ko'ringan. Yagona ishonchli usul — o'lchash:
  `el.getBoundingClientRect()` ni ICHIDAGI element bilan solishtirish
  (bola pastki chegarasi ota pastki chegarasidan oshsa — kesilgan).
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
