# Sprint 9 — Production + launch (Dars 16)

**Holat:** jarayonda

---

## Maqsad

LolaMarket ni rasmiy ishga tushirish. Birinchi haqiqiy xaridorlar va ishlab chiqaruvchilarni jalb qilish.

---

## Bajariladigan vazifalar

### Production tayyorgarligi
- [x] SSL sertifikat tekshiruvi (lolamarket.uz HTTPS)
  — **BAJARILDI (2026-08-01), 31-iyulda ochilgan ikkala teshik yopildi.** Sertifikatning
  o'zi 2026-07-31 da tekshirilgan edi: Google Trust Services (`CN=WE1`), 2026-09-15 gacha;
  sessiya cookie'si `HttpOnly; Secure; SameSite=Lax` (`server/routes/web-auth.js:25`).
  Bugun founder Cloudflare panelidan qolgan ikkalasini yoqdi va jonli tekshirildi:
  1. **"Always Use HTTPS" yoqildi** — `http://lolamarket.uz` → **301** →
     `https://lolamarket.uz/`. Redirect loop YO'Q: HTTPS'ning o'zi baribir **200** qaytaradi
     (bu alohida tekshirildi — noto'g'ri sozlangan proksida aynan shu yerda cheksiz
     aylanish paydo bo'ladi).
  2. **HSTS yoqildi** — javobda `strict-transport-security: max-age=2592000` (30 kun).
     `includeSubDomains` YO'Q va `preload` ATAYLAB yoqilmagan (sabab pastdagi qarorda).

  **OCHIQ QOLDI:** `max-age` ni 12 oyga (`31536000`) ko'tarish — **~2026-08-08 dan keyin**,
  30 kunlik muddat muammosiz o'tgani ko'ringach. Founder bajaradi.
- [x] Xavfsizlik sarlavhalari (`X-Content-Type-Options`, `X-Frame-Options`, `CSP`,
  `Referrer-Policy`) — **BAJARILDI (2026-08-02), CSP majburlash rejimida, jonli
  tekshirildi.** 2026-08-01 da ochilgan teshik: javobda bu sarlavhalarning birortasi
  ham yo'q edi. Endi uchta Cloudflare Transform Rule ishlaydi (founder panelda qo'lladi,
  agent qoidalarni yozib berdi va tekshirdi):
  1. **Barcha so'rovlarga:** `X-Content-Type-Options: nosniff`,
     `Referrer-Policy: strict-origin-when-cross-origin`,
     `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
  2. **`/mini-app` dan tashqari yo'llarga:** `X-Frame-Options: DENY`.
  3. **To'liq CSP** — `default-src 'self'` dan boshlab `connect-src 'self'`,
     `frame-ancestors 'self' https://telegram.org https://*.telegram.org`,
     `object-src 'none'` gacha. Kanonik nusxa: `docs/xavfsizlik-sarlavhalari.md`.

  **Jonli tasdiq (majburlash rejimida):** `/`, `/admin/`, `/mini-app/` ochildi —
  bloklangan manba 0 ta, rasm xatosi 0 ta, katalogda 85 kartochka chizildi,
  `window.Telegram` joyida, Mini App Telegram'da ochildi (ya'ni `frame-ancestors`
  haqiqatan ishlayapti).

  ⚠️ **Ochiq qolgan qarz:** CSP `'unsafe-inline'` bilan yozilgan (sabab pastdagi
  qarorda) — ~120 ta inline hodisa `addEventListener` ga o'tkazilgunicha CSP to'liq
  kuchga kirmaydi.

  **QARZ QAYTA BAHOLANDI (2026-08-02 kechqurun).** O'sha kuni "bu to'la qonligicha
  tugadimi?" degan savol audit qildirdi va audit HAQIQIY teshik topdi — Mini App'da
  saqlanuvchi XSS (pastdagi yozuv). Teshik yopilgach qarzning OG'IRLIGI kamaydi:
  `'unsafe-inline'` faqat "kod sahifaga kirib qolsa" holatida zarar qiladi, endi esa
  ma'lum bo'lgan kirish yo'li qolmadi. **Lekin qarzning O'ZI turibdi** — inventarizatsiya
  o'zgarmadi (`telegram-app/app.js` 76 inline `onclick`, `script.js` 24), ya'ni
  `'unsafe-inline'` hamon CSP'ning ikkinchi qatlam bo'lish qobiliyatini yo'q qiladi:
  kelajakda yangi bir joyda `esc()` unutilsa, CSP xatoni TUTMAYDI. Shu sababli
  himoyaning butun og'irligi hozir `esc()` ning izchil qo'llanishida. Yopilishi
  o'zgarmadi: ~120 ta inline hodisani `addEventListener` ga o'tkazish

  ✅ **QARZNING KOD TOMONI YOPILDI (2026-08-06).** Yuqoridagi inventarizatsiya
  endi eskirgan: ~120 ta inline hodisa uch bosqichda (C1, C2 1-qism, C2 2-qism)
  delegatsiyaga o'tkazildi va landing, Mini App, admin panelda inline hodisa
  qolmadi (batafsil — pastdagi 2026-08-06 yozuvi). **Lekin band hali TUGAMADI:**
  `'unsafe-inline'` CSP'ning O'ZIDA hamon turibdi. Uni Cloudflare Transform
  Rule'dan olib tashlash — C3, founder panelda qo'llaydi. Shu qadamgacha
  qarzning amaldagi ta'siri o'zgarmagan

  ✅ **C3 KOD TOMONI HAM YOPILDI (2026-08-06 kechqurun) — "tugadi" deb yozilgan
  ishdan keyin YANA UCHTA joy topildi.** Ya'ni yuqoridagi "inline hodisa
  qolmadi" xulosasi ham to'liq emas edi: `offline.html` (ILDIZ — egizagi C2 da
  tuzatilgan, ildizdagisi supurish ro'yxatiga umuman kirmagan),
  `loyiha-panel.html` (49 qatorlik inline `<script>`) va `index.html` narx
  filtridagi 2 ta `onkeydown` (C1 qidiruvi faqat `click|input|change|submit|
  error` ni sanardi). Uchalasi ham `offline.js` / `panel.js` ga chiqarildi va
  `script.js` ga uchinchi delegatsiya qatlami — `data-enter` — qo'shildi.
  Qamrovni endi ro'yxat emas **Test 15** belgilaydi (`server/test.js`).
  Kanonik CSP `docs/xavfsizlik-sarlavhalari.md` da yangilandi.
  **QOLGAN YAGONA QADAM — founder Cloudflare panelida qiymatni almashtiradi;
  tartib: DEPLOY OLDIN, CSP KEYIN.**
- [x] Muhit o'zgaruvchilari (env vars) production uchun sozlash
  — **YOPILDI (2026-08-05), TO'G'RIDAN-TO'G'RI TEKSHIRUV BILAN.** Oldingi yozuv
  bilvosita dalilga tayanardi ("`/api/products` ishlayapti, demak `.env` joyida")
  va SSH bloklangan deb hisoblardi. Bugun `.env` SSH orqali bevosita ko'rildi —
  va bilvosita dalil YOLG'ON bo'lib chiqdi: fayl "ishlayotgan"dek ko'rinsa ham
  ichida to'ldirilmagan namuna turgan edi.
  1. **Kalitlar sanaldi** — 11 ta: `BOT_TOKEN`, `ADMIN_CHAT_ID`, `ALLOWED_ORIGIN`,
     `PORT`, `WEBHOOK_SECRET`, `MINI_APP_URL`, `DATABASE_URL`, `ADMIN_PANEL_TOKEN`,
     `COMMISSION_RATE`, `BOT_USERNAME`, `ALERT_CHAT_ID`.
  2. **Nuqson topildi va tuzatildi** — `ALERT_CHAT_ID=<chat_id>`, ya'ni
     to'ldirilmay qolgan NAMUNA. U bo'sh emas, shuning uchun `config.js` dagi
     `|| ADMIN_CHAT_ID` zaxirasi uni haqiqiy deb qabul qilardi va xato alertlari
     mavjud bo'lmagan chatga ketardi. Qator o'chirildi (nusxa olingan holda),
     endi 10 ta kalit. Bash `source` ham shu qatorda qulardi — kunlik zaxira
     ikki kun aynan shuning ustiga ishlamadi.
  3. **Huquqlar tekshirildi** — `.env` `600 root:root`, `pg-backup.sh` `700
     root:root`, `.mcp-db-url` `600 root:root` (`server/README.md` jadvaliga mos).
     `bash -n` toza.
  4. **Kod darajasida qulflandi** — `config.js` → `chatId()` endi chat_id ning
     SHAKLINI tekshiradi; yaroqsizi zaxiraga qaytadi va jurnalda iz qoldiradi.
     `ADMIN_CHAT_ID` yaroqsiz bo'lsa `process.exit(1)`. Qorovul Test 2c bilan
     qulflangan (`5e9bb11`).

  ⚠️ **Tekshirilmagani (ataylab):** kalitlarning QIYMATLARI o'qilmadi — faqat
  nomlari sanaldi, chunki sirlarni chiqarishdan qochildi. Ya'ni "har bir qiymat
  to'g'ri" deb aytilmaydi; aytiladigani shu: kalitlar bor, fayl tahlil qilinadi,
  huquqlar to'g'ri, va shakli tekshirilishi mumkin bo'lgan yagona tur (chat_id)
  endi kod tomonidan qo'riqlanadi.
- [x] Ma'lumotlar bazasi zaxira nusxasi (backup) sozlash
  — **BAJARILDI (2026-08-01): ishlayotgani tekshirildi, TIKLANISHI birinchi marta sinaldi,
  va nusxa serverdan tashqariga chiqarildi.**
  1. **Cron ishlayapti.** `30 3 * * *` → `/opt/lolamarket-notify/pg-backup.sh`. Fayllar
     24-iyuldan buyon **9 kun uzilishsiz**, hajm o'sib borgan (ya'ni bo'sh dump emas).
  2. **Tiklash sinaldi** — zaxira alohida `lolamarket_restore_test` bazasiga tiklandi,
     **13 jadvalning qator soni jonli baza bilan to'liq mos** chiqdi, keyin sinov bazasi
     o'chirildi. ⚠️ Tekshirilmagani: qatorlarning ICHI (qiymatlar) va `sequence`
     hisoblagichlari — ya'ni "tiklandi" degani hali "hamma narsa joyida" degani emas.
  3. **Nusxa Telegram'ga chiqariladi** — `pg-backup.sh` endi zaxirani `sendDocument` bilan
     ham yuboradi (sinaldi, fayl yetib bordi). Serverda 7 kunlik nusxa, Telegram'da
     cheksiz. Chat: `.env` dagi `BACKUP_CHAT_ID`, bo'lmasa `ADMIN_CHAT_ID`. Eski skript
     `pg-backup.sh.bak` da saqlandi. Sabab: nusxalar bazaning O'ZI bilan bitta diskda edi —
     disk o'lsa zaxira ham birga ketardi, ya'ni zaxira nomigagina zaxira edi.

  ⚠️ **OGOHLANTIRISH:** zaxira ichida mijoz ma'lumotlari bor (telefon, buyurtma, Telegram
  ID). O'sha chatdagi HAR KIM butun bazani yuklab olishi mumkin — `BACKUP_CHAT_ID` ga odam
  qo'shishdan oldin shu o'ylansin. Skript repoda saqlanmaydi (serverda yashaydi, tokenni
  `.env` dan o'qiydi)
- [x] Xato monitoring ulash (Sentry yoki shunga o'xshash)
  — **BAJARILDI (2026-08-05): alert BIRINCHI MARTA HAQIQATAN uchidan-uchiga
  tasdiqlandi.** Kod 2026-08-03 da yozilgan edi, lekin quyidagi yozuvda ko'rsatilgani
  kabi u ikki kun MUTLAQO ishlamagan — 3-avgustdagi "tasdiqlandi" da'vosi yolg'on
  edi. Bugungi dalil zanjiri (tarix ATAYLAB o'chirilmadi, quyida turibdi):
  1. Founder servisni restart qildi (deploy qoidasi bo'yicha bu foydalanuvchi
     bosadigan amal). `systemctl is-active` → `active`, PID 642342,
     `ActiveEnterTimestamp=2026-08-05 15:07:47`.
  2. `/api/version` → `5e9bb11` — ya'ni jonli jarayon YANGI kodni ishlatyapti.
  3. `/proc/642342/cwd -> /opt/lolamarket-notify` — `(deleted)` yozuvisiz. Ya'ni
     papka haqiqatan tiklangan va servis undan ko'tarilgan; "xotiradan yuruvchi
     jarayon" holati tugadi.
  4. Jarayon muhitida `ALERT_CHAT_ID` UMUMAN YO'Q → `config.js` `ADMIN_CHAT_ID`
     ga qaytdi, ya'ni placeholder ketgani amalda tasdiqlandi. Jurnalda yangi
     `chatId()` qorovulining "Chat ID yaroqsiz" ogohlantirishi ham chiqmadi.
  5. ATAYLAB xato chiqarildi:
     `GET /api/auth/web/poll?code=%00sinov&verifier=sinov` — faqat-o'qish `SELECT`,
     NUL bayt Postgres'ni yiqitadi va hech narsa YOZILMAYDI (production bazasida
     iz qoldirmaslik uchun ataylab shunday tanlandi). Natija: HTTP 500, jurnalda
     `webLoginPoll xatosi: invalid byte sequence for encoding "UTF8": 0x00`,
     server esa tirik qoldi (ya'ni 3-avgustdagi `handleRequest` o'rami ham ishladi).
  6. **Founder Telegram'da alert xabarini KO'RDI va tasdiqladi.** Dalil aynan
     shu — kod emas, ko'rilgan xabar.

  ⚠️ Quyidagi tarix ATAYLAB saqlanadi: "2026-08-03 da tasdiqlandi" degan yozuv
  yolg'on bo'lgan va uni takrorlamaslik uchun sabab ko'rinib turishi kerak.

  — **KOD YOZILDI (2026-08-03), deploy ham qilindi, lekin band 2026-08-05 gacha
  OCHIQ turdi va o'sha kuni ma'lum bo'ldiki alert ikki kun MUTLAQO ishlamagan.**
  Sentry bloklangan edi (tashqi akkaunt kerak), shuning uchun boshqa yo'l tanlandi: server xatosi Telegram'ga xabar
  bo'lib boradi (`server/lib/alert.js`) — bildirishnoma relayi allaqachon ishlab turibdi,
  yangi hisob kerak emas.

  ⚠️ **YOLG'ON DA'VO TO'G'RILANDI (2026-08-05).** Bu band haqida boshqa joylarda
  "2026-08-03 da production'da TASDIQLANDI (`b6e6b7d`)" deb yozilgan edi — bu
  NOTO'G'RI. O'sha kunning O'ZIDA serverdagi `.env` ning 11-qatorida
  `ALERT_CHAT_ID=<chat_id>` — to'ldirilmay qolgan NAMUNA turgan. U bo'sh emas,
  shuning uchun `config.js` dagi `|| ADMIN_CHAT_ID` zaxirasi uni haqiqiy qiymat deb
  qabul qilgan va alertlar mavjud bo'lmagan chatga ketavergan; `sendAlert` esa xatoni
  ATAYLAB yutadi, ya'ni jurnalda ham iz qolmagan. Jonli jarayonning muhiti tekshirib
  tasdiqlandi. **Dars:** "tasdiqlandi" deb yozishdan oldin dalil qaysi kanaldan
  kelganini ayt — bu yerda xabar ko'rilmagan, faqat kod yozilgani ko'rilgan.

  O'sha kuni yozilgani: "Band `[x]` QILINMAYDI. Yopilishi: servis restarti (founder),
  keyin ataylab bitta xato chiqarib alert Telegram'ga HAQIQATAN yetib borgani
  ko'rilishi. Restartgacha alert HAMON o'lik — jarayon eski muhitni ushlab turibdi."
  **Aynan shu shart bajarildi va band yuqoridagi dalil bilan yopildi.**
- [ ] Payme va Click production akkauntlarga o'tish — **bloklangan:** merchant kalitlari kerak.
  Launch'ning YAGONA haqiqiy to'sig'i — platformaning qolgan qismi uchidan-uchiga ishlaydi

### Ishlab chiqaruvchilarni yuklash
- [ ] 20–30 ta shaxsiy tanish ishlab chiqaruvchini taklif qilish
- [ ] Har birini qo'lda tasdiqlash va onboarding
- [ ] Mahsulotlarini katalogga qo'shishda yordam berish

### Marketing (birinchi to'lqin)
- [ ] Telegram kanalda e'lon: "LolaMarket ochildi"
- [ ] Instagram da targetted reklama: "to'qima ulgurji" auditoriyasi
- [ ] Birinchi 50 xaridorga maxsus taklif (agar qaror qilinsa)

### Launch
- [ ] Yumshoq ochilish (soft launch): faqat tanishlar
- [ ] Birinchi 10 buyurtma kuzatuvi va qo'lda yordam
- [ ] Muammolarni darhol tuzatish (hotfix rejimi)
- [ ] Rasmiy e'lon: ommaviy launch

### Muvaffaqiyat metrikalari (birinchi 30 kun)
- [ ] 20+ tasdiqlangan ishlab chiqaruvchi
- [ ] 50+ xaridor ro'yxatdan o'tgan
- [ ] 30+ muvaffaqiyatli buyurtma yakunlangan
- [ ] 0 hal qilinmagan bahsli holat

---

## Qilingan ishlar

- [2026-08-06] **C3 — CSP `script-src` dan `'unsafe-inline'` OLIB TASHLANDI (kod
  tomoni). C1/C2 ning davomi va YAKUNI.**

  **Asosiy kuzatuv nuqsonlarning o'zidan muhimroq: uchala topilma ham "TUGADI"
  deb yozilgan ishdan keyin chiqdi va sababi bitta — qamrovni RO'YXAT belgilagan
  edi.** Supurish qaysi fayllarni sanasa o'shalar tekshirilgan, qidiruv naqshi
  qaysi hodisa nomlarini sanasa o'shalar topilgan. Ikkala ro'yxat ham to'liq
  emas edi va buni HECH NARSA ko'rsatmasdi — na test, na xato, na belgi. Bu
  loyihaning "yozilgan qoida himoya emas, uni tekshiradigan test himoya" darsi
  (`console.error` kaliti bilan bitta oila) yana takrorlangani.

  **Uchta topilma — uchalasi ham C1/C2 supurishlaridan O'TIB KETGAN:**
  1. **`offline.html` (ILDIZ)** — inline `onclick="location.reload()"` VA inline
     `<script>` bloki. `telegram-app/offline.html` egizagi C2 da tuzatilgan,
     ildizdagisi supurish ro'yxatiga UMUMAN kirmagan. Yangi `offline.js` ga
     chiqarildi; `sw.js` → `PRECACHE` ga `./offline.js` qo'shildi va
     `CACHE_VERSION` `v2` → `v3` ga oshirildi. **Ikkinchi qadam MAJBURIY** —
     keshda eski ro'yxat qolsa `offline.js` aynan oflayn holatda yuklanmasdi,
     ya'ni tuzatish O'ZI TUZATAYOTGAN holatda ishlamas edi.
  2. **`loyiha-panel.html`** — 49 qatorlik inline `<script>`. Yangi `panel.js`
     ga chiqarildi. Bu DEPLOY QILINADIGAN sahifa, ya'ni CSP unga ham tegadi.
  3. **`index.html` narx filtri** — 2 ta
     `onkeydown="if(event.key==='Enter')applyPrice()"`. C1 supurishi ko'rmagan,
     chunki o'sha qidiruv naqshi faqat `click|input|change|submit|error` ni
     sanardi. `script.js` ga **uchinchi delegatsiya qatlami** qo'shildi —
     `data-enter` (`data-action` va `data-submit` yonida). `keydown` ham `click`
     EMAS: mavjud tinglovchilarning hech biri uni ko'rmasdi — bu C2 dagi
     "submit hodisasi click emas" topilmasining aynan takrori.

  **Qorovul — Test 15 (`server/test.js`).** 18 ta deploy qilinadigan frontend
  faylini skanerlab uch narsani qidiradi: inline hodisa atributi,
  inline `<script>` bloki, `javascript:` URL. Istisnolar ro'yxati AYNAN
  solishtiriladi (`deepStrictEqual`) — ya'ni istisno YO'QOLSA ham test qizil
  bo'ladi, faqat qo'shilganda emas.

  **DALIL — hammasi o'lchandi, "test yashil" deb qabul qilinmadi.**
  Qorovulning o'zi **5 mutatsiya** bilan sinaldi va beshtasida ham QIZIL berdi:
  inline hodisa qaytarish · inline `<script>` qo'shish · `javascript:` URL ·
  istisno ro'yxatini o'chirish (eskirgan ro'yxat) · nishon fayl nomini
  o'zgartirish (qamrov JIMGINA qisqarishi).

  **Sahifalar HAQIQIY yangi CSP sarlavhasi ostida chizildi.** Usul keyingi safar
  asqotadi, chunki "CSP ni brauzerda sinab bo'lmaydi" degan taxmin NOTO'G'RI:
  kanonik CSP ni javobga qo'yadigan kichik Node statik serveri yozildi va
  beshala sahifa o'sha sarlavha ostida ochildi.
  - **Landing:** CSP buzilishi 0, Enter ikkala narx maydonida `applyPrice` ni
    chaqirdi (1 va 2), `'a'` bosilganda otilmadi (2 da qoldi), `[onkeydown]` 0 ta
  - **Oflayn sahifa:** `online` hodisasi hint'ni ko'rsatdi (`hidden`
    true→false), "Qayta urinish" tugmasi sahifani QAYTA YUKLADI (belgi
    yo'qolishi bilan o'lchandi), inline `<script>` 0, `[onclick]` 0
  - **Panel:** 11 kartochka, bar 45%, `panel.js?v=1` tashqi skript, begona
    `svg[onload]` 0 ta. **Eski nusxa O'SHA CSP ostida 0 KARTOCHKA berdi** —
    ya'ni "C3 nimani o'ldirardi" savoliga ham taxmin bilan emas o'lchov bilan
    javob berildi
  - **Mini App:** 27 ta `[data-action]`, 27 tasi otildi, o'lik tugma 0
  - **Admin:** kirish tugmasi `Kirish` → `...` (josus usuli admin'da ishlamaydi,
    shuning uchun TA'SIR o'lchandi)
  - **Toza yorliqda beshala sahifa:** CSP buzilishi **0 ta**

  `npm test` — **31 test PASS**. `node --check` uchala yangi/o'zgargan JS da toza.

  **`deploy.yml`:** `source` ro'yxatiga `offline.js` va `panel.js` QO'LDA
  qo'shildi (CI faqat sanab o'tilgan fayllarni chiqaradi) + deploy tekshiruviga
  `check /offline.js` va `check /panel.js`. Ular yetib bormasa nuqson JIMGINA
  chiqardi — nginx yo'q faylga `try_files` bilan HTML va **HTTP 200** qaytaradi.

  **YO'L-YO'LAKAY TOPILGAN ALOHIDA NUQSON.** `loyiha-panel.html` hisobot matnida
  xom `"&gt;&lt;svg onload=` turgan edi — proza deb yozilgan, brauzer esa
  HAQIQIY teg deb ochgan va ortidagi butun hisobot o'sha teg ichiga tushib
  ko'rinmay qolgan. Eski nusxa chizib O'LCHANDI va matn haqiqatan yutilgani
  tasdiqlandi. Endi Test 15 buni ham qo'riqlaydi. Dars: **panel matni HTML
  ichida yashaydi, ya'ni u proza emas — xom `&lt;` yozilmasin.**

  **ATAYLAB QOLDIRILGANI.** `sayt-eski/index.html:69` dagi
  `onsubmit="handleSubmit(event)"` — founder qarori (2026-08-06: "kerakmas,
  unut"), Test 15 ning istisnolar ro'yxatidagi YAGONA yozuv.
  `style-src` dagi `'unsafe-inline'` ga TEGILMADI — bu boshqa va ancha katta
  qarz (kodda yuzlab inline `style="..."`).

  **OCHIQ QOLGANI.** Cloudflare paneldagi CSP qiymatini **founder almashtiradi**
  — yagona qolgan qadam, tartibi hujjatda. **DEPLOY OLDIN, CSP KEYIN**: aks
  holda yangi fayllar yetib bormasdan oflayn sahifa va panel bir muddat
  ishlamay turadi. Founder tasdiqlagan lekin hali bajarilmagan: `?v=` bumb
  qoidasi CLAUDE.md ga + qorovul test.

- [2026-08-06] **INLINE HODISALAR TUGADI — `'unsafe-inline'` qarzining KOD tomoni
  yopildi, C3 (CSP'ni qattiqlashtirish) uchun zamin tayyor** (C1, C2 1-qism,
  C2 2-qism).

  **Nima qilindi.** Uch bosqichda ~120 ta inline hodisa `addEventListener` va
  hodisa delegatsiyasiga o'tkazildi: `C1` landing (26 ta), `C2` 1-qism Mini
  App'ning xaridor yo'li (53 ta), `C2` 2-qism qolgani (37 ta app.js da +
  admin 2 ta + landing formasi + oflayn sahifa). Yakuniy sweep bilan
  tasdiqlandi: **landing, Mini App va admin panelda inline hodisa UMUMAN
  qolmadi**, inline `<script>` bloki va `javascript:` URL ham yo'q.

  **Shartnoma uch sahifada AYNI:** `data-action` / `data-arg` / `data-input`.
  Ko'p argument `|` bilan kodlanadi va ingichka o'ram ajratadi (`openReviewArg`,
  `toggleProductArg`, `sellerOrderArg`). 2-qismda 9 ta yordamchi qo'shildi —
  yuqoridagi uchtasi va `setDispComment`, `setRevBody`, `setSTracking`,
  `setSDispReply`, `newProductForm`, `editProduct`, `reloadApp`.

  **`submit` `click` EMAS.** Landing to'lov formasidagi `onsubmit` ko'chirilganda
  ma'lum bo'ldiki mavjud delegatsiya uni umuman ko'rmaydi — `click` tinglovchisi
  `submit` hodisasini eshitmaydi. Shuning uchun `script.js` da ALOHIDA
  `data-submit` qatlami qurildi va u funksiyaga HODISANING O'ZINI uzatadi
  (`submitOrder` ichida `preventDefault()` chaqiriladi, aks holda sahifa qayta
  yuklanardi).

  **Oflayn sahifa — inline `<script>` bloki ham chiqarildi** (`telegram-app/offline.js`).
  `sw.js` da `PRECACHE` ga `./offline.js` qo'shildi va `CACHE_VERSION` `v2` → `v3`
  ga oshirildi. Bu ikkinchi qadam MAJBURIY: keshda eski ro'yxat qolsa oflayn
  holatda aynan oflayn sahifaning skripti yuklanmay qolardi, ya'ni tuzatish
  o'zi tuzatayotgan holatda ishlamas edi. `deploy.yml` dagi tekshiruv ro'yxatiga
  ham `/mini-app/offline.js` qo'shildi — fayl `telegram-app/*` bilan avtomatik
  ko'chadi, lekin yetib bormaganda nuqson AYNAN oflayn holatda chiqadi va
  kundalik tekshiruvda hech qachon ko'rinmaydi (2026-07-30 darsi).

  **Yo'l-yo'lakay yopilgan yashirin tuzoq.** Delegatsiya sof raqamli `data-arg` ni
  `Number` ga aylantiradi, `renderProductForm` esa mahsulotni `x.id === S.sEditId`
  bilan qidiradi. Bugungi ma'lumotda id lar matnli (`ik-1402`), lekin RAQAMLI id
  paydo bo'lgan kuni tahrirlash formasi **jimgina bo'sh ochilardi** — xato ham,
  belgi ham bermay. `editProduct()` o'rami turini `String()` bilan qulfladi.

  **Dalil (brauzerda, haqiqiy hodisalar bilan).** Eski yozuvdagi "bu qismni
  brauzerda sinab bo'lmaydi" da'vosi NOTO'G'RI bo'lib chiqdi: server javobi emas,
  aynan SIMLASH o'zgargani uchun uni o'lchash mumkin. Har bir render funksiyasi
  chizildi, har bir `[data-action]`/`[data-input]` elementiga haqiqiy klik/kiritish
  yuborildi, chaqirilgan funksiya josus bilan almashtirildi — **66 ta element,
  66 tasi otildi, o'lik tugma yo'q, argumentlar to'g'ri.** Yashirin yorliq ostidagi
  bloklar birinchi o'tishda chizilmagani uchun `S.ordersTab='past'`,
  `S.sOrdTab='progress'`, `S.sProdTab='hidden'` bilan ikkinchi o'tish qilindi.
  Admin panelda josus usuli ISHLAMAYDI (`addEventListener` havolani ro'yxatga olish
  paytida oladi), shuning uchun u yerda TA'SIR o'lchandi: kirish tugmasi matni `...`
  ga o'zgardi, chiqish panelni yopib `sessionStorage` tokenini tozaladi. Oflayn
  sahifada `offline.js` HTTP 200 bilan keldi va tugma sahifani yangiladi.
  `node --check` uchala JS faylda ham toza.

  ⚠️ **`?v=` versiyalari commit oldidan tuzatildi** (`hisobotchi` tutdi):
  `app.js?v=60→61`, `script.js?v=25→26`, `admin.js?v=19→20`. Admin'da bu
  kosmetik emas edi — `index.html` `onclick` ni yo'qotgan, `admin.js` esa eski
  versiya raqami bilan keshda qolardi, ya'ni qaytib kelgan adminda **kirish tugmasi
  o'lik** bo'lardi. Yangi HTML + eski JS birikmasi aynan shu o'zgarish sinfida
  eng xavfli holat.

  ⚠️ **`sayt-eski/index.html:69` dagi `onsubmit` ATAYLAB qoldirildi** — founder
  qarori (pastdagi qarorlar bo'limiga qara). CSP butun domen bo'ylab ishlaydi,
  ya'ni C3 dan keyin o'sha formadagi tugma jimgina o'ladi. Bu bilib qilingan
  tanlov, nuqson emas.

  ⚠️ **QOROVUL HALI YO'Q — bu ochiq qarz.** Inline hodisa qaytib kelsa buni hech
  narsa ushlamaydi, C3 esa o'shanda jimgina tugma o'ldiradi. Loyihaning o'z darsi
  ("yozilgan qoida himoya emas — test himoya") bu yerda hali bajarilmagan:
  C3 bilan BIRGA `index.html` / `script.js` / `telegram-app/` / `admin/` ni
  skanerlaydigan qorovul qo'shilsin.

  **Navbatdagi ish — C3:** CSP `script-src` dan `'unsafe-inline'` olib tashlash
  (Cloudflare Transform Rules, kanonik nusxa `docs/xavfsizlik-sarlavhalari.md`).

  **DEPLOY DALILI (commit `86c9b5d`, deploy 31 s, birinchi urinishda).** Yuqoridagi
  yozuv commit'dan OLDIN yozilgani uchun dalil qismi keyin to'ldirildi — bu sprint
  faylining o'z qoidasi (`[2026-07-31]` — "band `[x]` qilinmaydi, dalil ko'rsatilsin").
  CI yashil belgisiga emas, javobning O'ZIGA qaraldi:
  - `/mini-app/offline.js` → HTTP 200 va `content-type: application/javascript`
    (ya'ni nginx fallback tuzog'i emas — yo'q fayl ham 200 + `text/html` qaytaradi)
  - jonli fayllarda yangi kod bor: `mini-app/app.js` da `setDispReason`,
    `script.js` da `data-submit`, `mini-app/offline.js` da `retry`
  - to'rtala jonli HTML'da (`index.html`, `admin/`, `mini-app/`, `mini-app/offline.html`)
    inline hodisa **0 ta**
  - `?v=` jonli holatda: `script.js?v=26`, `app.js?v=61`, `admin.js?v=20`

  **OFLAYN SAHIFA HAQIQIY OFLAYN HOLATDA SINALDI.** Mahalliy server ATAYLAB
  o'chirildi va sahifa qayta yuklandi: service worker `offline.html` va `offline.js`
  ni keshdan berdi, "Qayta urinish" tugmasi ishladi. Bu shunchaki qulaylik emas —
  aynan shu sinov `CACHE_VERSION` va `PRECACHE` qadamlari bajarilganini isbotlaydi;
  ularsiz tuzatish O'ZI TUZATAYOTGAN holatda ishlamas edi va buni boshqa hech
  qanday tekshiruv ko'rsatmasdi.
  ⚠️ `offline.js` ATAYLAB `?v=` SIZ: `sw.js` → `networkFirst` keshdan
  `ignoreSearch` siz qidiradi, ya'ni versiya qo'shilsa so'rov keshdagi yozuvga
  mos kelmay qolardi — va nuqson aynan oflayn holatda chiqardi.

- [2026-08-05] **TERGOV: backend papkasi nega o'chgani ANIQLANDI — aybdor
  `server/README.md` dagi orqaga qaytarish buyrug'ining o'zi edi.**

  **Dalillar zanjiri.** `/opt` ning `mtime` i (tiklashdan OLDIN olingan
  ro'yxatda) — `Aug 3 04:32`, ya'ni papka ichidagi oxirgi o'zgarish o'sha
  daqiqada. Servis esa `04:32:17` da o'sha papkadan MUVAFFAQIYATLI ko'tarilgan,
  ya'ni o'shanda papka bor edi. Keyingi SSH ulanishi 4-avgust ertalabigacha
  yo'q — oyna **43 soniyaga** qisqardi. O'sha oynada faqat bitta manba faol
  edi (`94.158.61.70`, qisqa `ssh host 'buyruq'` sessiyalari); GitHub Actions
  runner `04:35:34` da, ya'ni oynadan KEYIN ulangan va CI `/opt` ga umuman
  tegmaydi (`deploy.yml` faqat `/var/www/lolamarket` ga yozadi).

  **Mexanizm.** Hujjatdagi buyruq shunday edi:
  `rm -rf /opt/lolamarket-notify && mv /opt/lolamarket-notify.bak-<sana> ... && systemctl restart`.
  `rm -rf` BIRINCHI bajariladi. `mv` yiqilsa — `<sana>` namunasi to'ldirilmasa
  yoki nom xato bo'lsa — papka allaqachon o'chgan bo'ladi va `&&` zanjiri
  uziladi, ya'ni ortidagi `systemctl restart` HAM ishlamaydi. Aynan shu sabab
  nosozlik jimgina qoldi: restart bo'lmagani uchun o'chgan holat oshkor
  bo'lmadi, jarayon esa `rm -rf` dan o'lmaydi.

  **Hal qiluvchi dalil — ikkala `.bak` omon qolgan.** Agar `mv` ishlaganda,
  ulardan biri iste'mol qilinib jonli papka nomiga o'tgan bo'lardi. Ikkalasi
  ham joyida turibdi, ya'ni `mv` bajarilmagan va `rm -rf` bajarilgan.
  Serverda bu yo'lni o'chiradigan boshqa hech qanday skript yoki cron yo'q —
  `grep` faqat `README.md` ning o'zini topdi.

  ⚠️ **Halol chegara:** buyruq MATNI hech qayerda yozilmaydi
  (`ssh host 'cmd'` `bash_history` ga tushmaydi, `auditd` o'rnatilmagan).
  Ya'ni "aynan shu buyruq ishlatilgan" deb 100% aytib bo'lmaydi. Aytilishi
  mumkin bo'lgani: o'sha 43 soniyada faqat bitta manba faol edi, loyihada shu
  yo'lni o'chiradigan yagona ma'lum buyruq shu, va uning nosozlik holati
  kuzatilgan yakuniy holatni AYNAN takrorlaydi.

  **Tuzatildi.** `server/README.md` dagi buyruq xavfsiz tartibga o'tkazildi:
  `test -d` bilan zaxira borligi tekshiriladi, jonli papka o'chirilmaydi
  balki `mv` bilan chetga suriladi, va deploydan keyin `/proc/PID/cwd` ni
  ko'rish qadami qo'shildi. Eski shakl o'chirilmadi — nima uchun xato ekani
  bilan birga qoldirildi. Qoida CLAUDE.md ga yozildi.

  **Yon kuzatuv:** `<sana>` — to'ldirilmagan NAMUNA. Bu o'sha kungi
  `ALERT_CHAT_ID=<chat_id>` bilan bir xil sinf: shablon to'ldirilgandek
  ko'rinadi, aslida yo'q. Bir kunda ikkinchi marta.

- [2026-08-05] **Backend fayllari diskdan yo'qolganini JARAYONNING O'ZI sezadigan
  qorovul qo'shildi** (`2512c6b`, `server/lib/self-check.js`).

  Bu o'sha kuni topilgan nosozlikning DAVOMI: papka o'chgan, jarayon esa kodni
  xotiradan ishlatib tirik qolgan va nosozlik ~24 soat KO'RINMAGAN edi. Qorovul
  soatiga bir marta to'rtta narsani tekshiradi — `server.js`, `config.js`,
  `.env`, `node_modules`. Bittasi yo'q bo'lsa `console.error` chaqiriladi va
  xato o'sha kuni tuzatilgan alert yo'lidan Telegram'ga o'zi boradi.

  **Nega cron EMAS, balki jarayonning ichida** (bu asosiy qaror):
  - papka ichidagi skript papka bilan BIRGA o'chadi — o'sha kuni `pg-backup.sh`
    bilan aynan shu bo'ldi va kunlik zaxira ikki kun jimgina ishlamadi;
  - papkadan tashqaridagi skript esa `BOT_TOKEN` ning IKKINCHI nusxasini talab
    qilardi, ya'ni sirni yana bir joyga ko'chirish kerak bo'lardi.
  Jarayonning o'zi esa yangi sirsiz, yangi cronsiz tekshira oladi.

  **Cheklovi ochiq yozildi:** bu FAQAT "papka yo'q, jarayon tirik" holatini
  tutadi. Jarayon o'lgan bo'lsa qorovul ham ishlamaydi — lekin u holat jimgina
  emas (sayt javob bermaydi), ya'ni boshqacha yo'l bilan ko'rinadi.

  **Dalil.** Test 13 mantiqni vaqtinchalik papkalar bilan sinaydi: hammasi
  joyida → bo'sh ro'yxat; bitta fayl yo'q → aynan o'sha qaytadi; papkaning
  O'ZI yo'q → maxsus yozuv. Qorovul xatosining birinchi argumenti qat'iy
  ekani ham tekshiriladi (alert guruhlash kaliti). `npm test` — 30 PASS
  (29 → 30). Production'da ham sinaldi: haqiqiy papkada `missingFiles()` → `[]`,
  mavjud bo'lmagan papkada → `["(papkaning O'ZI yo'q)"]`, fayllari yo'q
  papkada → to'rtalasi sanaldi. Servis restartdan keyin `active`, jurnalda
  ogohlantirish yo'q — ya'ni qorovul jim, demak hammasi joyida.

  ⚠️ **Bu yozuv keyinroq qo'shildi.** Commit `hisobotchi` SIZ qilingan
  (foydalanuvchi qarori), shuning uchun sprint fayli va panel o'sha paytda
  yangilanmay qolgandi — qarz keyin yopildi.

- [2026-08-05] **Alert tizimi BIRINCHI MARTA haqiqatan tasdiqlandi, va shu tasdiqlash
  yo'l-yo'lakay alertning O'ZIDA yangi nuqson ochib berdi.**

  **1. Uchidan-uchiga dalil (`server/` kodida o'zgarish yo'q).** Founder servisni
  restart qildi, keyin ataylab bitta xato chiqarildi va Telegram'ga alert yetib
  bordi. To'liq zanjir yuqoridagi band yonida yozilgan; qisqasi: `/api/version` →
  `5e9bb11`, `/proc/642342/cwd` `(deleted)` yozuvisiz, jarayon muhitida
  `ALERT_CHAT_ID` yo'q (ya'ni `ADMIN_CHAT_ID` zaxirasi ishladi),
  `GET /api/auth/web/poll?code=%00sinov&verifier=sinov` → HTTP 500 +
  `webLoginPoll xatosi: invalid byte sequence for encoding "UTF8": 0x00`, server
  tirik qoldi, **founder xabarni Telegram'da ko'rdi**.

  Sinov so'rovi ATAYLAB faqat-o'qish `SELECT` yo'lidan tanlandi: NUL bayt Postgres'ni
  yiqitadi, lekin hech narsa yozilmaydi — production bazasida sinov chiqindisi
  qolmasligi kerak edi (30-iyul qarori).

  **2. YANGI NUQSON: alert guruhlash kaliti buzilgan edi** (`server/server.js`).
  `requestCrashed` birinchi argumentga yo'lni qo'yardi:
  `` console.error(`so'rov qulashi ${req.method} ${path}:`, ...) ``. `lib/alert.js`
  guruhlash kalitini aynan `args[0]` dan oladi (`argsToKeyAndDetail`), ya'ni har
  endpoint ALOHIDA alert bo'lardi — bitta nosozlik ~26 xil kalit hosil qilardi va
  10 daqiqalik bosish tomi aynan shu yerda ishlamay qolardi. Falokat emas: soatlik
  tom (`MAX_PER_HOUR = 20`) Telegram'ni to'lib ketishdan saqlardi. Tuzatildi —
  belgi qat'iy, o'zgaruvchan qism ikkinchi argumentda:
  `console.error('so\'rov qulashi:', `${req.method} ${path}`, ...)`.

  ⚠️ **Darsi nuqsonning o'zidan muhimroq:** bu CLAUDE.md dagi qoidaning buzilishi
  edi va qoida o'sha commitning O'ZIDA yozilgan (`b6e6b7d`, 2026-08-03) — ya'ni
  qoidani yozgan odam o'sha faylda uni buzib qo'ygan. **Qoidaning o'zi himoya
  emas; uni test qo'riqlamasa, u qoida emas, niyat.** Bu 2026-08-03 dagi Test 11
  darsining (kod to'g'ri, ULANISH tekshirilmagan) aynan takrori.

  **3. Qulflandi: Test 10c — "Alert guruhlash kaliti qat'iy"** (`server/test.js`).
  `server/`, `server/lib/`, `server/routes/` dagi hamma `.js` faylni skanerlab
  `console.error` ning birinchi argumenti interpolatsiyali shablon satri
  (`` `...${x}` ``) yoki `'matn' + x` birikmasi emasligini tekshiradi. 64 ta
  `console.error` ko'rildi (skaner haqiqatan fayl o'qiganini `checked > 50`
  ta'minlaydi — aks holda `readdirSync` yo'li buzilsa test bo'sh ro'yxat ustida
  yashil qolardi). Qorovul haqiqiyligi alohida sinaldi: eski shakl ham,
  `'matn' + x` birikmasi ham TUTILDI, yangi shakl esa o'tdi. `npm test` — 29 test
  PASS (28 → 29).

  **HALI OCHIQ (bugun ham yopilmadi):**
  - ✅ ~~**Backend papkasi NEGA o'chgani ANIQLANMAGAN**~~ — **SABAB TOPILDI
    (2026-08-05 kechqurun), pastdagi tergov yozuviga qarang.** Aybdor —
    `server/README.md` dagi orqaga qaytarish buyrug'ining O'ZI:
    `rm -rf /opt/lolamarket-notify && mv ...bak-<sana>... && systemctl restart`.
    `rm` birinchi bajariladi, `mv` yiqilsa papka allaqachon yo'q. Buyruq
    tuzatildi, qoida CLAUDE.md ga yozildi. Sezish qismi esa `2512c6b` bilan
    yopilgan edi. Diqqat, bu kuzatuv kuchida qoladi: tashqi belgilar
    (`/api/products`, `/api/version`, `systemctl is-active`) bu holatni UMUMAN
    ko'rsatmaydi — tekshiruv fayl tizimiga qarashi shart.
  - **4-avgust zaxira nusxasi butunlay yo'qolgan** va uni qayta yaratib bo'lmaydi

- [2026-08-05] **Backend papkasi serverdan O'CHIB KETGANI topildi va tiklandi — sayt
  tashqaridan mutlaqo sog'lom ko'rinib turgan holda ikki kun "o'lgan odam yurgan"
  holatda ishlagan.**

  **1. Eng jiddiy topilma: `/opt/lolamarket-notify/` mavjud emasdi.**
  `/proc/604099/cwd -> /opt/lolamarket-notify (deleted)` — Node jarayoni 3-avgust
  04:32 dan beri butun kodni FAQAT xotiradan ishlatib turgan. Tashqi belgilar
  hammasi yashil edi: `/api/products` javob berardi, `/api/version` → `665c9fb`.
  Xavf esa to'liq edi — har qanday `systemctl restart` yoki server reboot'ida
  backend qayta ko'tarilmasdi: kod ham, `.env` ham, `node_modules` ham yo'q edi.
  Server uptime 6 hafta 5 kun, ya'ni portlash faqat vaqt masalasi edi.
  Sodir bo'lgan oyna: 3-avgust 04:32 (order-history deployi, `665c9fb`) bilan
  4-avgust 03:30 orasi. **Nega o'chgani ANIQLANMAGAN** — bu ochiq savol.

  Tiklash: `.bak-20260803-042350` dan `cp -a` bilan (sirlar `root:root 600/700`
  huquqi saqlangan holda) — `.env` (10 kalit), `node_modules` (14 paket),
  `pg-backup.sh`, `contacts.json` qaytdi. Keyin kod `b6e6b7d` dan `665c9fb` ga
  tenglashtirildi: repodagi `server/` dan `rsync`, `server/README.md` dagi exclude
  ro'yxati bilan (`.env`, `node_modules`, `contacts.json`, `.mcp-db-url`,
  `pg-backup.sh`, `*.bak-*` tegilmadi). `lib/order-history.js` shu bilan keldi.
  Fayl egaligi FAQAT kod fayllariga qo'yildi — `chown -R` ATAYLAB ishlatilmadi
  (2026-07-30 darsi: u sirlarning huquqini ham o'zgartirib yuborardi).

  **2. Kunlik zaxira ikki kundan beri JIMGINA ishlamayotgan edi.** `backup.log` da
  `/bin/sh: 1: /opt/lolamarket-notify/pg-backup.sh: not found` — 4 va 5-avgustda.
  Cron ishlab turgan, skript yo'q edi. Oxirgi muvaffaqiyatli nusxa: 3-avgust 03:30.
  **4-avgust nusxasi BUTUNLAY yo'qoldi va uni qayta yaratib bo'lmaydi.** Tiklangandan
  keyin skript qo'lda yurgizildi: chiqish kodi `0`,
  `lolamarket-20260805-145559.sql.gz` (9578 bayt — 3-avgustnikidan katta),
  `telegram: yuborildi`.

  **3. `.env` da to'ldirilmagan namuna ikki narsani birdan o'ldirgan.** 11-qator
  `ALERT_CHAT_ID=<chat_id>`. Birinchi oqibat: bash uni `source` qila olmasdi
  (`syntax error near unexpected token 'newline'` — `<` qayta yo'naltirish belgisi),
  ya'ni papka tiklangandan keyin ham zaxira ishlamas edi. Ikkinchi oqibat:
  `config.js:85` dagi `process.env.ALERT_CHAT_ID || ADMIN_CHAT_ID` zaxirasi
  ISHLAMASDI, chunki placeholder BO'SH EMAS — alertlar mavjud bo'lmagan chatga
  ketardi va `sendAlert` xatoni ataylab yutgani uchun jurnalda iz qolmasdi.
  Qator o'chirildi (vaqt tamg'ali nusxa olingan holda), natija tekshirildi:
  10 qator, `bash -n` toza, huquq `600 root:root`.

  **Kodda tuzatilgani (`server/config.js`, `server/test.js`).** Placeholder'ni
  serverda o'chirish yetarli emas — u yana yozilishi mumkin, shuning uchun qorovul
  KODGA qo'yildi. Yangi `chatId(raw, name, fallback)`: Telegram chat_id har doim
  butun son (guruhlarniki manfiy); bo'sh — zaxiraga qaytadi; **bo'sh EMAS lekin
  yaroqsiz** (`<chat_id>`, matn) — zaxiraga qaytadi VA `console.error` bilan
  jurnalda IZ qoldiradi. `console.error` ning birinchi argumenti o'zgarmas
  (alert guruhlash kaliti qoidasi). `ADMIN_CHAT_ID` butun son bo'lmasa esa endi
  `process.exit(1)` — u hamma narsaning oxirgi zaxirasi (alert, moderatsiya,
  backup) va zaxiraning zaxirasi yo'q, ya'ni bu ogohlantirish emas, TO'XTASH sababi.
  **Test 2c** aynan "bo'sh emas, lekin yaroqsiz" holatni qo'riqlaydi va
  `console.error` chaqirilganini hamda guruhlash kaliti o'zgarmasligini ham
  tekshiradi. `npm test` — 28 test PASS.

  ⚠️ **HALI BAJARILMAGAN:** servis `restart` qilinmagan (foydalanuvchi bosadigan
  amal). Restartgacha: (a) papka tiklangani AMALDA sinalmagan, (b) alert HAMON
  o'lik — jarayon eski muhitni ushlab turibdi, (c) yangi `config.js` qorovuli
  ishga tushmagan. Ya'ni "alert ishlayapti" deb yozib bo'lmaydi — dalil restartdan
  keyin keladi.

- [2026-08-03] **Xato monitoringi yozildi (Sentry o'rniga Telegram alerti), va shu ish
  yo'l-yo'lakay JIDDIYROQ nuqson ochib berdi: bitta so'rovdagi baza uzilishi BUTUN
  serverni o'ldirardi.**

  **1. Monitoring (`server/lib/alert.js`, yangi fayl).** Kodda 66 ta `console.error`
  bor edi va hammasi `journalctl` ga tushib yo'qolardi — ya'ni bugun serverda xato
  bo'lsa, biz buni faqat foydalanuvchi shikoyat qilganda bilardik. Endi xato
  Telegram'ga xabar bo'lib boradi.

  **Ushlash BITTA joyda — `console.error` ning o'zida.** 66 ta chaqiruvni alohida
  tahrirlash 66 ta regress imkoniyati bo'lardi, ustiga kelajakda yangi `console.error`
  yozgan odam alert qo'shishni unutardi. Shu yo'l bilan har qanday YANGI xato yozuvi
  ham avtomatik qamraladi.

  **Ikki qatlamli tom:** bir xil xato 10 daqiqada 1 marta, jami soatiga 20 ta. Bosilgan
  takrorlar SANALADI va keyingi xabarda ko'rsatiladi ("yana N marta takrorlandi") — ya'ni
  yo'qolmaydi, faqat jamlanadi. Ikkinchi qatlam aynan baza qulagan holat uchun: o'shanda
  har bir so'rov BOSHQACHA matnli xato beradi va birinchi filtr ularni bir guruh deb
  ko'rmaydi, ya'ni tomsiz bitta nosozlik Telegram'ni minglab xabar bilan to'ldirardi.
  `uncaughtException` / `unhandledRejection` ham ushlanadi, lekin **bugungi xatti-harakat
  SAQLANADI** — jarayon baribir o'ladi va systemd uni ko'taradi; faqat KO'RINISH qo'shildi.

  `install()` FAQAT `require.main === module` shohbasida chaqiriladi: testlar
  `console.error` ni o'zi ushlaydi (`testNoBrokenReferences`), shuning uchun test
  muhitida o'ram o'rnatilmasligi shart.

  **2. Yo'l-yo'lakay topilgan nuqson (tuzatildi, `server/server.js`).** To'qqizta handler
  `try` blokiga KIRISHDAN OLDIN `await` qiladi — auth tekshiruvi bazaga boradi
  (`handleSellerReviews`, `handleCreateWebOrder`, `handleCreateReview`,
  `handleSellerDisputeReply`, `handleSellerApplicationReview`, `handleSellerProducts`,
  `handleSellerProductUpdate`, `handleSellerOrders`, `handleSellerOrderAction`). Baza
  o'sha lahzada javob bermasa, rad etilgan promise'ni hech kim ushlamasdi va Node
  **BUTUN JARAYONNI o'ldirardi** — ya'ni bitta so'rovdagi uzilish o'sha paytdagi
  BARCHA so'rovlarni birga yiqitardi. Endi `handleRequest` ikkiga bo'lindi: `routeRequest`
  (eski router) va uni o'raydigan `handleRequest`. Xato so'rov chegarasida to'xtaydi —
  qulagan so'rov 500 oladi, qolganlari ishlayveradi. `res.headersSent` holati alohida
  qaralgan: javob boshlangan bo'lsa status qo'yilmaydi, faqat ulanish yopiladi (aks holda
  klient osilib qolardi).

  **Sinov — mutatsiya bilan tasdiqlandi, "test yozdim"ning o'zi hisoblanmadi.** Test 9
  `DATABASE_URL` ni o'lik portga qaratadi va HAQIQIY imzo bilan so'rov yuboradi, ya'ni
  so'rov 401 da to'xtamay aynan `await pool.query` gacha borib qulaydi. **O'ram olib
  tashlanganda test jarayonining O'ZI `unhandledRejection` bilan o'ldi** — ya'ni test
  haqiqatan shu nuqsonni tutadi. Test 10 va 10b tomlarni va alert matnini (HTML
  qochirish) qamraydi.

  ⚠️ **Deploy QILINMAGAN.** Migratsiya va nginx tahriri kerak emas. `.env` ga
  `ALERT_CHAT_ID` qo'shish ixtiyoriy (default — `ADMIN_CHAT_ID`), lekin alohida chat
  tavsiya etiladi: alert oqimi buyurtma xabarlarini ko'mib yubormasin. **Alert chatida
  xato tafsiloti bo'ladi va unda foydalanuvchi matni uchrashi mumkin** (buyurtma izohi,
  manzil) — zaxira nusxa chati bilan bir xil ehtiyot.

- [2026-08-02] **Mini App'da saqlanuvchi XSS topildi va yopildi — xaridor yozgan matn
  SOTUVCHINING ekranida kod bo'lib ishga tushardi.** Teshikni "bu to'la qonligicha
  tugadimi?" degan savol ochdi: o'sha kuni ertalab qo'yilgan CSP `'unsafe-inline'`
  bilan ishlagani uchun javob "yo'q" bo'ldi, va shu savol audit qildirdi.

  **Zanjir uchidan-uchiga tasdiqlandi:**
  1. Xaridor buyurtma izohiga / manziliga / bahs sababiga matn yozadi.
     `server/lib/validate.js` faqat TUR va UZUNLIKni tekshiradi — HTML tozalanmaydi.
  2. Matn bazaga xom tushadi.
  3. `server/routes/seller.js:170-173` uni sotuvchiga xom qaytaradi (`buyerName`,
     `address`, `comment`, `tracking`).
  4. `telegram-app/app.js` uni `innerHTML` ga XOM qo'yadi — `esc()` ishlatilmagan.
  5. CSP to'xtatmaydi, chunki u `'unsafe-inline'` bilan ishlaydi.

  Xuddi shu narsa bahs oqimida ham: `server/routes/disputes.js:49` da `reason` =
  tayyor sabab + xaridorning ERKIN izohi, u ham xom saqlanadi va sotuvchiga xom
  ko'rsatiladi. **Zararning chegarasi:** `connect-src 'self'` o'g'irlangan ma'lumotni
  tashqariga chiqarishga yo'l bermaydi, lekin zararli kod BIZNING O'Z API'imizga
  sotuvchi nomidan murojaat qila olardi — buyurtmani qabul qilish/rad etish, narx
  o'zgartirish. Ya'ni ma'lumot o'g'irlash emas, **sotuvchi nomidan amal bajarish**.

  **Eng muhim kuzatuv: yechim allaqachon loyihada bor edi.** `esc()` to'g'ri yozilgan
  va landing (`script.js`) uni 32 marta, admin panel (`admin/admin.js`) 48 marta
  ishlatadi — ularda teshik YO'Q. Mini App esa atigi 7 marta ishlatgan, faqat sharhlar
  tizimida (u yaqinda yozilgan). Buyurtma va bahs ekranlari eskiroq va e'tibordan
  chetda qolgan. Ya'ni bu noma'lum muammo emas edi — qoida bor edi, shunchaki bir
  necha joyda qo'llanmagan.

  **Tuzatilgani** (`telegram-app/app.js`, `esc()` ishlatilishi 7 → 28):
  - `esc()` ning O'ZI kengaytirildi — endi BITTA TIRNOQNI ham qochiradi
    (`'` → `&#39;`). Ilgari faqat `& < > "` qamralardi.
    ⚠️ **Bu o'zgarishga o'sha kuni berilgan IZOH noto'g'ri edi** — "shuning uchun
    `style="url('${x}')"` va `onclick="f('${x}')"` da ham himoya qiladi" deyilgandi.
    Bu yolg'on; pastdagi «Yolg'on da'vo tuzatildi» blokiga qara.
  - **`vm()` chegarasida tozalash** (arxitektura qarori, pastda): `name`, `supplier`,
    `city`, `comp`, `badge`, `img` (`bgStyle` ichida) va `meta`.
  - `vm()` dan o'tmaydigan joylar chizish joyida o'raldi: buyurtma (`buyerName`,
    `address`, `tracking`, `comment`), bahs (`reason`, `decision`, `sellerResponse`,
    javob qoralamasi), sotuvchi mahsulot ro'yxati (`name`, `rejectReason`, `img`),
    Telegram profili (`first_name`, `fullName`, `username`, `photo_url`).
  - `esc()` tepasidagi ESKI IZOH o'chirildi. U "bu ilovada boshqa hamma matn
    o'zimizniki" derdi — bu NOTO'G'RI edi va aynan shu taxmin sababli teshik ochiq
    qolgandi. Izohning o'zi nuqsonning bir qismi edi.

  `admin/admin.js` da bitta mayda joy: `initials(name)` ismning birinchi harfini xom
  qaytarardi, u `esc()` ga o'raldi. Panelning qolgan qismi allaqachon toza edi.

  **Sinov (brauzerda, to'rtta haqiqiy hujum yuki):** `<img src=x onerror=...>`,
  `<script>`, `' onmouseover='`, `"><svg onload=...>`. Eski yo'lda **4 tadan 3 tasi
  HAQIQIY TEG yaratdi va 3 tasi hodisa atributini kiritdi**; `esc()` bilan 4 tasi ham
  0 teg berdi va oddiy matn bo'lib ko'rindi. `node --check` ikkala faylda o'tdi.
  Yakuniy sweep: tozalanmagan tashqi matn qolmadi.

  **Versiyalar:** `telegram-app/app.js?v=56→57`, `admin/admin.js?v=18→19`.

  **Yo'l-yo'lakay o'zim kiritib o'zim tuzatgan nuqson:** HTML izohi ichiga teskari
  tirnoq yozganim shablon satrini uzib yubordi — `node --check` tutdi, izohlar
  tirnoqsiz qayta yozildi. Bu `node --check` ni har tahrirdan keyin ishlatishning
  arzon dalili.

  **Yolg'on da'vo tuzatildi (o'sha kuni kechroq, `app.js?v=57→58`).** Yuqoridagi
  tuzatish bilan birga kodga va CLAUDE.md ga yozib qo'yilgan sabab NOTO'G'RI edi:
  "`esc()` bitta tirnoqni qochiradi, shuning uchun `style="url('${x}')"` va
  `onclick="f('${x}')"` da ham himoya qiladi". Brauzerda sinab ko'rildi — himoya
  qilmaydi.

  1. **`esc()` ning haqiqiy CHEGARASI: faqat MATN va ODDIY ATRIBUT.**
     (`<div>${esc(x)}</div>`, `<img src="${esc(x)}">`.) Atribut ICHIDA boshqa til
     boshlansa — CSS yoki JS — yaramaydi, chunki qochirish YECHILADI: HTML
     tahlilchisi `&#39;` ni avval `'` ga QAYTARADI, keyin natijani CSS/JS o'qiydi.
     Ya'ni qochirilgan tirnoq CSS ga yetib borguncha oddiy tirnoqqa aylanib
     ulguradi. Sinovda `esc()` bilan ham hujum yuki `background:red` ni
     qo'llab yubordi.
  2. **`encodeURI()` ning O'ZI ham yetarli emas.** U bitta tirnoqni qochirmaydi —
     sinovda hujum baribir o'tdi. Tirnoq ALOHIDA `%27` ga almashtirilishi shart.

  **Tuzatilgani:** `telegram-app/app.js` ga `cssUrl()` yordamchisi qo'shildi
  (`encodeURI()` + tirnoq → `%27`), `vm()` dagi `bgStyle` endi `esc()` emas
  `cssUrl()` ishlatadi. `esc()` tepasidagi izoh chegarasi bilan qayta yozildi,
  CLAUDE.md dagi noto'g'ri jumla almashtirildi.

  **Bu foydalanib bo'ladigan teshik EMAS edi.** Yagona shunday joy — `vm()` dagi
  `bgStyle`, `p.img` esa sotuvchi nazoratida emas: mahsulot qo'shishda `img`
  maydoni umuman yo'q (`server/routes/catalog.js` INSERT), rasm yo'li serverda
  `encodeURIComponent` bilan yasaladi. Tuzatish — kelajak uchun va yolg'on izohni
  olib tashlash uchun.

  **Sinov:** brauzerda uch variant taqqoslandi — `esc()` (hujum O'TDI),
  `encodeURI()` (hujum O'TDI), `cssUrl()` (himoyalandi). Oddiy yo'llar buzilmadi
  (`assets/products/textile-01.jpg` va `/api/product-photo?f=..&s=..`
  o'zgarishsiz, haqiqiy mahsulot rasmi ishladi). `node --check` o'tdi. Barcha
  fayllarda `url(` interpolatsiyasi qayta qidirildi — boshqa joy yo'q (admin
  paneldagi ikkitasi SVG gradient havolasi).

  **Dars:** "sinab ko'rmasdan yozilgan xavfsizlik izohi — o'zi nuqson." Bu
  yozuvda ikkinchi marta shunday bo'ldi (birinchisi — o'chirilgan eski izoh,
  "boshqa hamma matn o'zimizniki").

- [2026-08-02] **Xavfsizlik sarlavhalari qo'yildi — 1-avgustda ochilgan teshik o'sha
  haftada yopildi, CSP bilan birga.**

  **Qilingani.** Uchta Cloudflare Transform Rule (founder panelda qo'lladi, agent
  qoidalarni yozib berdi va natijani jonli tekshirdi): (1) barcha so'rovlarga
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`; (2) `/mini-app` dan
  tashqari yo'llarga `X-Frame-Options: DENY`; (3) to'liq CSP. Qoidalar Cloudflare
  panelida yashaydi, ya'ni git'da emas — shuning uchun kanonik nusxasi yangi hujjatga
  yozildi: **`docs/xavfsizlik-sarlavhalari.md`**. Nginx tanlanmadi, chunki nginx'da
  `add_header` **meros olinmaydi**: biror `location` o'zining `add_header`ini e'lon
  qilsa, tepadagi hammasini tashlab yuboradi va o'sha yo'l jimgina himoyasiz qoladi.

  **Mini App ATAYLAB `X-Frame-Options` dan chiqarildi.** Telegram Web
  (`web.telegram.org`) Mini App'ni `<iframe>` ichida ochadi — `/mini-app/` ga `DENY`
  qo'yilsa brauzerdan kirgan foydalanuvchida ilova **bo'sh oq ekran** bo'lardi.
  Telefondagi Telegram va Telegram Desktop'da muammo ko'rinmasdi (u yerda native
  WebView), ya'ni nuqson foydalanuvchilarning faqat bir qismida chiqib, sezilmay
  yuraverardi. `X-Frame-Options` bir nechta manbaga ruxsat bera olmaydi — `ALLOW-FROM`
  brauzerlar tomonidan tashlab yuborilgan. Buni CSP hal qildi:
  `frame-ancestors 'self' https://telegram.org https://*.telegram.org`.

  **Kuzatuv (Report-Only) bosqichi bitta haqiqiy buzilish topdi:**
  `static.cloudflareinsights.com/beacon.min.js` — Cloudflare Web Analytics beacon'i.
  Uni sahifaga **Cloudflare O'ZI qo'shadi**, repodagi kodda yo'q, shuning uchun kodni
  qidirib topib bo'lmaydi — faqat jonli brauzerda ko'rinadi. `script-src` ga qo'shildi.
  Report-Only bosqichisiz to'g'ridan-to'g'ri majburlanganda sayt sinmagan, lekin
  **tashrif statistikasi jimgina o'lgan** bo'lardi. Bosqichning butun qiymati shu.
  Beacon ma'lumotni `lolamarket.uz/cdn-cgi/rum` ga, ya'ni o'z domenimizga yozadi —
  `connect-src 'self'` ga qo'shimcha kerak emas.

  **`X-Frame-Options` qoidasi CSP kuchga kirgach ham O'CHIRILMADI.** Zamonaviy
  brauzerda `frame-ancestors` ustun turadi va XFO e'tiborga olinmaydi; `frame-ancestors`
  ni tushunmaydigan eski brauzerda esa XFO yagona qolgan himoya bo'ladi. Ikkalasi
  qarama-qarshi emas — hujjatning dastlabki rejasida "3-qadamda XFO o'chiriladi"
  deb yozilgandi, amalda undan voz kechildi.

  **Jonli tasdiq (majburlash rejimida):** `/`, `/admin/`, `/mini-app/` — bloklangan
  manba 0 ta, rasm xatosi 0 ta, katalogda 85 kartochka chizildi, `window.Telegram`
  joyida; Mini App Telegram'da ochildi, bu `frame-ancestors` ishlayotganining dalili.

  ⚠️ **Ochiq qolgan qarz — `'unsafe-inline'`.** Inventarizatsiya: `telegram-app/app.js`
  da 76 ta inline `onclick=` va 455 ta `style=`, `script.js` da 24 va 15. `script-src`
  dan `'unsafe-inline'` olib tashlansa Mini App'dagi hamma tugma o'lik bo'lib qoladi;
  hash bilan ruxsat berish ham ishlamaydi, chunki hodisalar dinamik yaratiladi
  (`onclick="openProduct('ik-1402')"` — har mahsulotda boshqa hash). Bu CSP'ni
  **sezilarli zaiflashtiradi**: saytga kod kirib qolsa u baribir ishga tushadi.
  Kelajakdagi ish: ~120 ta inline hodisani `addEventListener` ga o'tkazish, keyin
  `'unsafe-inline'` olib tashlanadi.

- [2026-08-01] **HTTPS majburiy qilindi va HSTS yoqildi — 31-iyulda ochilgan ikkala teshik
  yopildi; yo'l-yo'lakay uchinchisi ochildi.**

  **Qilingani (founder Cloudflare panelidan, agent jonli tekshirdi).** "Always Use HTTPS":
  `http://lolamarket.uz` endi **301** bilan `https://lolamarket.uz/` ga yo'naltiriladi.
  HSTS: javobda `strict-transport-security: max-age=2592000` (30 kun). Ikkalasi ham kodda
  emas, Cloudflare sozlamasida — shuning uchun repoda hech narsa o'zgarmadi.

  **Alohida tekshirilgani — redirect loop.** Yo'naltirish yoqilgandan keyin HTTPS'ning
  o'zi ham **200** qaytarishi tasdiqlandi. Bu bekorga emas: proksi orqasidagi sayt
  o'zining HTTPS ekanini tanimasa, u har HTTPS so'rovni yana HTTPS'ga yo'naltiraveradi
  va sayt butunlay ochilmay qoladi. "301 keldi" degan tekshiruvning o'zi kifoya emas.

  **Yo'l-yo'lakay topilgan yangi teshik:** javobda `X-Content-Type-Options`,
  `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy` sarlavhalarining
  **birortasi ham yo'q**. HSTS ULANISHNI himoya qiladi, SAHIFANI emas — clickjacking va
  skript in'yeksiyasi hamon ochiq. Yangi band sifatida yuqoriga yozildi.

  **Reja:** `max-age` **~2026-08-08 dan keyin** 12 oyga ko'tariladi — 30 kun muammosiz
  o'tgani ko'ringach.

- [2026-08-01] **Zaxira "sozlangan" holatdan "ishlayapti va tiklanadi" holatiga o'tdi —
  ustiga nusxa serverdan tashqariga chiqarildi.**

  **1. Ishlayotgani ko'z bilan ko'rildi.** Cron (`30 3 * * *`) 24-iyuldan buyon **9 kun
  uzilishsiz** ishlagan, fayl hajmi o'sib borgan — ya'ni dump bo'sh emas. Bu 2026-07-31
  dagi "sozladim ≠ ishlayapti" bandini yopadi.

  **2. Tiklash BIRINCHI MARTA sinaldi.** Zaxira alohida `lolamarket_restore_test` bazasiga
  tiklandi, **13 jadvalning qator soni jonli baza bilan to'liq mos** chiqdi, so'ng sinov
  bazasi o'chirildi. Buzilgan zaxira zaxira emas — endi buzilmagani ma'lum. **Lekin
  tekshirilmagani ham bor:** qatorlarning ICHIDAGI qiymatlar va `sequence` hisoblagichlari
  solishtirilmadi (masalan `order_seq` noto'g'ri tiklansa keyingi buyurtma mavjud raqamni
  qayta ishlatib yuborishi mumkin).

  **3. Zaxira endi Telegram'ga ham yuboriladi** (`pg-backup.sh` → `sendDocument`; sinaldi,
  fayl yetib bordi). **Sabab:** nusxalar bazaning O'ZI bilan bitta diskda edi — disk
  o'lganda zaxira ham birga ketardi, ya'ni himoya faqat "faylni o'chirib qo'ydim"
  holatidan ishlardi, "server o'ldi" holatidan emas. Serverda 7 kunlik nusxa qoladi,
  Telegram'da cheksiz. Chat: `.env` dagi `BACKUP_CHAT_ID`, bo'lmasa `ADMIN_CHAT_ID`.
  Eski skript `pg-backup.sh.bak` da saqlandi.

  **Skript repoda yo'q** — u serverda yashaydi va tokenni `.env` dan o'qiydi (`server/README.md`
  dagi rsync exclude ro'yxatida turgani shu sabab, `sprint-1.md` 2026-07-30 yozuvi).

  ⚠️ **Yangi xavf ochildi:** zaxira ichida mijoz ma'lumoti bor va u endi Telegram chatida
  yotadi — o'sha chatdagi har kim butun bazani yuklab olishi mumkin.

- [2026-07-31] **"Production tayyorgarligi" bo'limi jonli tekshiruvdan o'tkazildi (TOZALASH).**
  Beshta band ham "kutilmoqda" bo'lib turardi, aslida uchtasi allaqachon qilingan edi — lekin
  ularni oddiygina `[x]` qilib qo'yish noto'g'ri bo'lardi, chunki tekshirganda ikkita
  haqiqiy teshik chiqdi: `http://` HTTPS'ga yo'naltirilmaydi va HSTS yo'q. Zaxira esa
  sozlangan, ammo ishlayotgani bir marta ham ko'z bilan ko'rilmagan. Har bandning yonida
  endi DALIL va kim bajarishi yozilgan

---

## Qarorlar

- [2026-08-06] Qaror: **qamrovni ro'yxat emas TEST belgilaydi — supurish
  natijasiga "tugadi" deb ishonilmaydi.** C3 da uchta topilma ham "TUGADI" deb
  yozilgan ishdan keyin chiqdi, chunki har ikkala ro'yxat (qaysi fayllar
  supuriladi, qaysi hodisa nomlari qidiriladi) to'liq emas edi va bu holat
  o'zini KO'RSATMASDI. Shuning uchun `server/test.js` → **Test 15** yozildi: u
  18 ta deploy qilinadigan faylni skanerlab inline hodisa / inline `<script>` /
  `javascript:` URL qidiradi, istisnolar ro'yxatini esa `deepStrictEqual` bilan
  AYNAN solishtiradi — istisno **yo'qolsa ham** qizil bo'ladi, ya'ni eskirgan
  ro'yxat ham nuqson deb qaraladi. Qorovulning o'zi 5 mutatsiya bilan sinaldi,
  jumladan "nishon fayl nomini o'zgartirish" — qamrov jimgina qisqarishi.
  Bu `console.error` kaliti qoidasi bilan bitta oila: **yozilgan qoida himoya
  emas, uni tekshiradigan test himoya**

- [2026-08-06] Qaror: **CSP almashtirish tartibi — DEPLOY OLDIN, CSP KEYIN.**
  Cloudflare paneldagi qiymat `offline.js` va `panel.js` serverga chiqishidan
  OLDIN almashtirilsa, oflayn sahifa va sprint paneli bir muddat jimgina
  ishlamay turadi (inline skript CSP bilan o'ldiriladi, tashqi fayl esa hali
  yo'q). Tartib `docs/xavfsizlik-sarlavhalari.md` dagi C3 bo'limida yozilgan.
  **Qadamni founder bajaradi** — panel sozlamasi agentga ochiq emas

- [2026-08-06] Qaror: **`loyiha-panel.html` matnida xom `<` belgisi
  ishlatilmaydi — `&lt;` / `&gt;` bilan yoziladi.** Panel matni HTML ichida
  yashaydi, ya'ni u proza EMAS: `"><svg onload=` kabi narsa yozilsa brauzer uni
  haqiqiy teg deb ochadi va ortidagi butun hisobot o'sha teg ichiga tushib
  ko'rinmay qoladi. Bu 2026-08-06 da HAQIQATAN sodir bo'lgan va eski nusxa
  chizib o'lchash bilan tasdiqlangan. Qoida Test 15 bilan qulflandi. Xuddi shu
  sabab: **paneldagi hisobot xavfsizlik nuqsoni haqida bo'lsa ham, uni
  ko'rsatadigan matn o'sha nuqsonni takrorlamasin**

- [2026-08-06] Qaror: **`loyiha-panel.html` ga inline `<script>` bloki QAYTA
  QO'SHILMASIN.** Sprint ma'lumotlari (massiv, foiz hisobi, `Yangilanish:`
  matni) endi `panel.js` da yashaydi va `hisobotchi` agenti aynan o'sha faylni
  tahrirlaydi; `loyiha-panel.html` da faqat `faoliyat-item` bloklari qoladi.
  `panel.js` o'zgarganda `loyiha-panel.html` dagi `panel.js?v=N` oshiriladi.
  Test 15 buni darrov qizil qiladi

- [2026-08-06] Qaror: **`sayt-eski/` inline hodisadan TOZALANMAYDI — u C3 dan keyin
  jimgina o'ladi va bu qabul qilinadi** (founder: "kerakmas, unut"). `sayt-eski/index.html:69`
  dagi `onsubmit="handleSubmit(event)"` — butun loyihada qolgan yagona inline hodisa.
  CSP domen bo'ylab ishlaydi, ya'ni `'unsafe-inline'` olib tashlangach o'sha formadagi
  email tugmasi ishlamay qoladi. Sabab: eski sayt ishlatilmaydi va faqat `style.css`
  uchun turibdi (`demo/` va `admin/` unga bog'liq), ya'ni papkani o'chirib ham
  bo'lmaydi. **Yozib qo'yilishining sababi qarordan muhimroq:** C3 da bu satr yana
  topiladi va "tuzataymi?" degan savol qayta tug'iladi — javob shu yerda turibdi,
  qayta so'ralmasin

- [2026-08-06] Qaror: **inline hodisa ko'chirilganda uch sahifa BITTA shartnomadan
  foydalanadi** — `data-action` / `data-arg` / `data-input`, ko'p argument `|` bilan.
  Sabab: landing, Mini App va admin panel har biri o'z naqshini o'ylab topsa, keyingi
  o'zgarish har birida boshqacha yoziladi va qorovul test yozish uch marta qiyinlashadi.
  `submit` uchun esa ALOHIDA qatlam kerak bo'ldi (`data-submit`) — `click`
  tinglovchisi `submit` hodisasini eshitmaydi, ya'ni bitta tinglovchi bilan
  "hammasini qamradim" deb bo'lmaydi

- [2026-08-05] Qaror: **CLAUDE.md dagi qoida test bilan qo'riqlanmasa, u qoida emas —
  niyat. Shuning uchun "yozilgan qoida" turkumidagi har bir band uchun manba kodini
  skanerlaydigan test yoziladi.** Sabab jonli misolda ko'rindi: "alert guruhlash
  kalitiga o'zgaruvchan ma'lumot qo'yilmasin" qoidasi `b6e6b7d` (2026-08-03) bilan
  yozilgan va O'SHA commitning o'zida `server.js` da buzilgan holda qolgan. Ya'ni
  qoidani bilgan, yozgan va yonidagi kodni tahrirlagan odam ham uni buzdi — bu
  e'tiborsizlik emas, naqsh. Yechim: qoidani qo'lda eslab qolish o'rniga
  `server/test.js` da skaner test (Test 10c). Bu 12b (tarix qamrovi) va 11
  (ULANISH tekshiruvi) bilan bitta oiladagi uchinchi test — himoya kodda emas,
  **kod haqidagi tekshiruvda** turadi

- [2026-08-05] Qaror: **jonli tizimni sinash uchun ATAYLAB chiqariladigan xato
  faqat-o'qish yo'ldan tanlanadi.** Alert tasdiqlashda `%00` NUL bayti bilan
  `GET /api/auth/web/poll` ishlatildi — u `SELECT` ga boradi, Postgres uni rad
  etadi va bazaga hech narsa yozilmaydi. Sabab: production bazasida sinov chiqindisi
  qolmasligi kerak (30-iyul qarori), lekin sinovning o'zidan voz kechib ham
  bo'lmaydi — "kod yozildi" dalil emasligi shu bandning o'zida ikki kun davomida
  isbotlangan. Yozuvchi yo'ldan (masalan soxta buyurtma) xato chiqarish keyin
  tozalashni talab qilardi va tozalash unutilishi mumkin

- [2026-08-05] Qaror: **`.env` dan keladigan chat_id JIMGINA qabul qilinmaydi — yaroqsiz
  qiymat zaxiraga qaytadi va jurnalda IZ qoldiradi; `ADMIN_CHAT_ID` yaroqsiz bo'lsa esa
  server umuman ko'tarilmaydi.** Sabab: `X || FALLBACK` naqshi faqat BO'SH qiymatni
  ushlaydi, to'ldirilmay qolgan `<chat_id>` namunasini esa haqiqiy deb qabul qiladi —
  aynan shu xato monitoringini ikki kun o'lik qilib qo'ydi va buni HECH NARSA
  ko'rsatmadi. Ya'ni nuqson sozlamada emas, uni tekshirmaslikda edi. `ALERT_CHAT_ID`
  uchun `console.error` + zaxira yetarli (alert yo'qolsa xizmat ishlayveradi),
  `ADMIN_CHAT_ID` uchun esa `process.exit(1)` tanlandi: u alert, moderatsiya va
  zaxira nusxaning oxirgi tayanchi — qaytadigan joyi yo'q, shuning uchun jimgina
  buzuq ishlagandan ko'ra ochiq to'xtagani yaxshi

- [2026-08-05] Qaror: **"production'da tasdiqlandi" deb yozish uchun DALIL qaysi
  kanaldan kelgani aytilsin.** 2026-08-03 da xato monitoringi haqida "production'da
  TASDIQLANDI" deb yozilgan edi, holbuki ko'rilgani faqat kod yozilgani — Telegram
  chatida bironta alert xabari KO'RILMAGAN. Yozuv ikki kun yolg'on ishonch berdi.
  Bundan keyin band yopilishi uchun "deploy qildim" ham, "test yashil" ham yetarli
  emas: natija KO'RINGAN kanal (Telegram xabari, jonli javob, jurnal qatori) aniq
  ko'rsatilsin — 2026-07-30 qoidasining kuchaytirilgan shakli

- [2026-08-03] Qaror: **xato monitoringi Sentry emas, Telegram alerti bo'ladi, va ushlash
  BITTA joyda — `console.error` ning o'zida.** Sentry bandi tashqi akkaunt talab qilgani
  uchun oylab bloklangan turdi, holbuki bildirishnoma relayi allaqachon ishlab turibdi.
  Ikkinchi qismi muhimroq: 66 ta `console.error` ni birma-bir tahrirlash 66 ta regress
  imkoniyati, ustiga kelajakda yangi `console.error` yozgan odam alert qo'shishni unutadi
  — ya'ni qamrov vaqt o'tishi bilan JIMGINA kamayardi. Bitta o'ram esa yangi xato
  yozuvlarini avtomatik qamraydi. Narxi: alert matnida foydalanuvchi ma'lumoti uchrashi
  mumkin, shuning uchun alert chati zaxira chati bilan bir xil ehtiyotni talab qiladi
- [2026-08-03] Qaror: **`try` blokidan TASHQARIDA `await` qiladigan handler serverni
  o'ldirmasin — router butun so'rov chegarasida o'raladi.** Handlerlarning har birini
  alohida to'g'rilash o'rniga `handleRequest` o'ram qilindi. Sabab: nuqson HANDLER'da
  emas, NAQSHDA edi — auth tekshiruvi `try` dan oldin turgani to'qqiz joyda takrorlangan,
  ya'ni to'qqizta joyni tuzatsak ham o'ninchisi yana shu tarzda yozilardi. O'ram bo'lsa
  yangi handler qanday yozilishidan qat'i nazar qulash so'rov bilan cheklanadi
- [2026-08-03] Qaror: **yangi test "yashil bo'ldi" degani bilan qabul qilinmaydi — u
  MUTATSIYA bilan tekshiriladi.** Ya'ni test tutishi kerak bo'lgan narsa ataylab buziladi
  va test QIZIL bo'lgani ko'riladi, keyin buzilgan joy qaytariladi. Bugun ikkalasi ham
  shu yo'ldan o'tdi: o'ram olib tashlanganda test jarayoni haqiqatan `unhandledRejection`
  bilan o'ldi, `recalcRating` chaqiruvi olib tashlanganda Test 11 qizil bo'ldi. Sabab —
  bu "CI yashil edi, fayllar esa serverga chiqmagandi" darsining test tarafdagi ko'rinishi:
  hech narsani tekshirmaydigan test ham har doim yashil bo'ladi va u eng xavflisi, chunki
  u himoya BOR degan yolg'on ishonch beradi
- [2026-08-02] Qaror: **mahsulot maydonlari `vm()` CHEGARASIDA bir marta tozalanadi,
  chizish joyida emas.** `name`, `supplier`, `city`, `comp`, `badge`, `img` o'nlab
  joyda `innerHTML` ga qo'yiladi — har birini alohida `esc()` ga o'rash ertami-kech
  esdan chiqadi va aynan shu tarzda unutilgan joy teshik bo'lib qoladi. `vm()` —
  mahsulot ekranga chiqishidan oldin o'tadigan YAGONA nuqta, shuning uchun himoya shu
  yerda turadi. Narxi ochiq: `vm()` dan o'tmaydigan ma'lumot (buyurtma, bahs, profil,
  sotuvchi mahsulot ro'yxati) chizish joyida qo'lda o'ralishi SHART — bu qoidaning
  istisnosi emas, boshqa chegarasi. CLAUDE.md ga yozildi
- [2026-08-02] Qaror: **`esc()` bitta tirnoqni ham qochiradi.** Faqat `& < > "` ni
  qochirish yetarli emas: matn oddiy atributdan `'` bilan chiqib, o'z hodisa
  atributini qo'sha olardi.
  ⚠️ **O'sha kuni kechroq TO'G'RILANDI:** bu qarorga dastlab "shuning uchun
  `style="url('${x}')"` va `onclick="f('${x}')"` da ham himoya qiladi" deb
  qo'shilgandi — bu NOTO'G'RI. `esc()` faqat MATN va ODDIY ATRIBUT uchun ishlaydi;
  atribut ichida CSS/JS boshlansa qochirish yechiladi (`&#39;` → `'`) va himoya
  qolmaydi. `encodeURI()` yolg'iz ham yetarli emas — tirnoqni qochirmaydi.
  CSS `url()` uchun `cssUrl()` (`encodeURI()` + tirnoq → `%27`) ishlatiladi
- [2026-08-02] Qaror: **HTML tozalash SERVERDA emas, CHIQISHDA bajariladi — baza xom
  matn saqlaydi.** Sabab: Telegram yo'li o'zining `escapeHtml` ini qo'llaydi
  (`server/routes/orders.js:192-196`); matn bazada allaqachon qochirilgan bo'lsa u
  ikki marta qochiriladi va foydalanuvchi Telegram xabarida `&lt;` ko'rib qoladi.
  Bitta manba, ikkita chiqish kanali — himoya har kanalning O'Z chegarasida turadi.
  Buning narxi: bazadagi matn ishonchsiz deb hisoblanishi kerak, ya'ni yangi chiqish
  kanali qo'shilsa u ham o'z tozalashini olib kelishi shart
- [2026-08-02] Qaror: **"tugadimi?" degan savolga "ha" deb javob berishdan oldin
  audit qilinadi.** Bugungi kun buni ikki marta oqladi: ertalabki CSP ishi "bajarildi"
  deb yozilgandi, savol berilganda `'unsafe-inline'` qarzi ochiq ekani ayon bo'ldi, va
  o'sha audit HAQIQIY, mustaqil teshik topdi (saqlanuvchi XSS). Bu 2026-07-31 dagi
  "dalil ko'rsatilishi kerak" qarorining aynan davomi, faqat boshqa tomondan: u yerda
  band `[x]` bo'lgani yetarli emas edi, bu yerda esa **band chindan bajarilgan bo'lsa
  ham qo'shni teshikni yopmaydi**
- [2026-08-02] Qaror: **CSP avval `Content-Security-Policy-Report-Only` bilan yoqiladi,
  majburlash faqat konsol toza bo'lgandan keyin.** Sabab: CSP noto'g'ri yozilsa saytni
  **jimgina** sindiradi — skript yuklanmaydi, xato faqat brauzer konsolida ko'rinadi,
  HTTP kodi esa 200 bo'lib qolaveradi. Bu qaror o'zini o'sha kuni oqladi: kuzatuv rejimi
  `static.cloudflareinsights.com` ni topdi — u Cloudflare sahifaga o'zi qo'shadigan
  analitika beacon'i, repodagi kodda YO'Q, ya'ni hech qanday grep uni topa olmasdi.
  Report-Only'siz majburlaganimizda sayt ishlab turaverib, tashrif statistikasi o'lardi
- [2026-08-02] Qaror: **`/mini-app` `X-Frame-Options` dan ATAYLAB chiqariladi, freym
  himoyasi u yerda CSP `frame-ancestors` bilan beriladi.** Sabab: Telegram Web Mini
  App'ni `<iframe>` ichida ochadi — `DENY` qo'yilsa brauzerdan kirgan foydalanuvchida
  oq ekran bo'lardi, telefondagi Telegram'da esa hammasi joyida ko'rinib turardi
  (nuqson foydalanuvchilarning bir qismida, sezilmay yuraverardi). `X-Frame-Options`
  bir nechta manbaga ruxsat bera olmaydi: `ALLOW-FROM` brauzerlar tomonidan tashlab
  yuborilgan. `frame-ancestors` esa ro'yxat qabul qiladi
- [2026-08-02] Qaror: **CSP kuchga kirgach ham `X-Frame-Options` qoidasi o'chirilmaydi.**
  Zamonaviy brauzerda `frame-ancestors` ustun turadi va XFO e'tiborga olinmaydi, ya'ni
  ziyoni yo'q; `frame-ancestors` ni tushunmaydigan eski brauzerda esa XFO yagona qolgan
  himoya bo'ladi. Hujjatning dastlabki rejasidagi "3-qadamda XFO o'chiriladi" bandidan
  ataylab voz kechildi
- [2026-08-02] Qaror: **CSP hozircha `'unsafe-inline'` bilan yoziladi va bu QARZ deb
  qayd etiladi.** Sabab: `telegram-app/app.js` da 76 ta inline `onclick=` va 455 ta
  `style=`, `script.js` da 24 va 15 — `'unsafe-inline'` olib tashlansa Mini App'dagi
  hamma tugma o'lik bo'lib qoladi. Hash bilan ruxsat berish ham imkonsiz: hodisalar
  dinamik yaratiladi, har mahsulotda boshqa hash chiqadi va ro'yxat cheksiz bo'lardi.
  Buning narxi ochiq yozildi — saytga kod kirib qolsa CSP uni to'xtata olmaydi; qolgan
  himoyalar (begona domendan skript yo'q, `connect-src 'self'`, `frame-ancestors`)
  kuchida qoladi. Yopilishi: ~120 ta inline hodisa `addEventListener` ga o'tkazilgach
- [2026-08-02] Qaror: **sarlavhalar nginx'da emas, Cloudflare Transform Rules'da
  qo'yiladi.** Sabab: nginx'da `add_header` **meros olinmaydi** — biror `location`
  bloki o'zining `add_header`ini e'lon qilsa tepadagi hammasini tashlab yuboradi, ya'ni
  sarlavhalarni har blokda takrorlash kerak va bittasi esdan chiqsa o'sha yo'l jimgina
  himoyasiz qoladi. Cloudflare'da qoida bitta joyda va hamma javobga (statik fayl ham,
  `/api/` ham) tegadi. Narxi: qoida git'da yashamaydi — shuning uchun kanonik nusxa
  `docs/xavfsizlik-sarlavhalari.md` da saqlanadi
- [2026-08-01] Qaror: **HSTS avval 30 kunlik `max-age` bilan yoqiladi, `preload` esa
  ATAYLAB yoqilmaydi.** Sabab: HSTS — bu QAYTARIB BO'LMAYDIGAN tomonga qarab ishlaydigan
  sozlama. Brauzer sarlavhani bir marta ko'rgach, muddat tugagunicha saytga faqat HTTPS
  orqali kiradi; sertifikat bilan muammo chiqsa foydalanuvchi saytni umuman ocha olmaydi
  va "bir daqiqaga o'chirib turaman" degan imkon YO'Q. 30 kun — xato qilsak qutulish
  narxi arzon bo'ladigan muddat; muammosiz o'tsa ~2026-08-08 dan keyin 12 oyga
  ko'tariladi. `preload` esa brauzer ishlab chiqaruvchilarining ro'yxatiga tushish
  demak — undan chiqish oylab davom etadi, shuning uchun u eng oxirida ko'riladi.
  `includeSubDomains` ham qo'yilmadi: hali qanday subdomenlar paydo bo'lishi noma'lum
- [2026-08-01] Qaror: **HSTS ni "yoqdim" deb yozishdan oldin HTTPS'ning O'ZI 200
  qaytarishi tekshiriladi.** Ya'ni tekshiruv ikki qadamli: `http://` → 301, va
  `https://` → 200. Sabab: proksi orqasidagi sayt o'z ulanishini HTTPS deb tanimasa
  yo'naltirish cheksiz aylanishga aylanadi va sayt butunlay ochilmay qoladi — birinchi
  qadamning o'zi yashil ko'rinaverib, ikkinchisi sindirilgan bo'lishi mumkin
- [2026-08-01] ⚠️ TUZOQ (qaror emas, eslatma): **Cloudflare panelidagi Max Age
  ro'yxatining eng kichigi `0` — u "eng qisqa muddat" EMAS, "O'CHIRILGAN" degani.**
  `max-age=0` brauzerga saqlangan HSTS yozuvini O'CHIR deb aytadi. Bir marta shunga
  tushib qolindi. Qisqa muddat kerak bo'lsa ro'yxatdan `0` emas, keyingi qiymat tanlansin
- [2026-08-01] Qaror: **zaxiraning nusxasi baza turgan diskdan TASHQARIDA bo'lishi shart** —
  shu sabab `pg-backup.sh` endi dump'ni Telegram'ga ham yuboradi. Sabab: nusxalar
  `/opt/lolamarket-backups/` da, ya'ni bazaning o'zi bilan bitta diskda edi — disk
  o'lganda ikkalasi birga ketardi. Telegram tanlandi, chunki u allaqachon ulangan
  (bot tokeni serverda bor), qo'shimcha akkaunt va xarajat talab qilmaydi.
  ⚠️ Buning narxi: zaxira ichidagi mijoz ma'lumoti endi chatda yotadi — `BACKUP_CHAT_ID`
  ga qo'shilgan har bir odam butun bazani yuklab ola oladi
- [2026-08-01] Qaror: **zaxira "ishlayapti" deb hisoblanishi uchun TIKLANISHI sinalgan
  bo'lishi kerak.** Fayl bor bo'lishi va hajmi o'sib borishi kifoya emas — buzilgan dump
  ham xuddi shunday ko'rinadi. Shu sababli zaxira alohida bazaga tiklanib, 13 jadvalning
  qator soni jonli baza bilan solishtirildi. Bu 2026-07-31 dagi "dalil ko'rsatilishi
  kerak" qarorining aynan davomi
- [2026-07-31] Qaror: **sprint bandi "sozlandi" degani uchun `[x]` qilinmaydi — dalil
  ko'rsatilishi kerak.** Sprint 9 ning uchta bandi (SSL, env, backup) "allaqachon bajarilgan"
  deb hisoblanardi; jonli tekshiruv ikkitasida kamchilik borligini ko'rsatdi. Sabab: bu
  Sprint 8 dagi PWA darsining takrori — CI yashil edi, fayllar esa serverga chiqmagandi
  (`sprint-1.md`, `sprint-8.md`). Shu sababli har band yoniga (a) qanday tekshirilgani,
  (b) qachon, (c) tekshirilmagan qismi qaysi ekani yoziladi
