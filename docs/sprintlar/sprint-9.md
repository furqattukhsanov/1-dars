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
  kuchga kirmaydi
- [ ] Muhit o'zgaruvchilari (env vars) production uchun sozlash
  — **AMALDA BAJARILGAN, lekin bugun qayta tasdiqlanmadi.** `/opt/lolamarket-notify/.env`
  (600 huquq, git'ga kirmaydi) Sprint 2/3 da to'ldirilgan; bilvosita dalil — jonli
  `GET /api/products` bazadan haqiqiy ma'lumot qaytaryapti, ya'ni `DATABASE_URL` va bot
  tokeni joyida. To'g'ridan-to'g'ri tekshirish SSH talab qiladi va bu sessiyada bloklandi
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
- [ ] Xato monitoring ulash (Sentry yoki shunga o'xshash) — **bloklangan:** akkaunt kerak
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
