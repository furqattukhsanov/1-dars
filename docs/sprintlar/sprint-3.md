# Sprint 3 — Auth + backend biznes logikasi (Dars 10–11)

**Holat:** tugadi — 2026-07-29 da saytdagi (lolamarket.uz) kirish oqimi qo'shildi, deploy
yakunlandi va production'da uchidan-uchiga sinovdan o'tdi (ISHLADI)

> ⚠️ **Moslashtirish izohi:** dars matni asli Supabase + Next.js (email magic link, RLS)
> uchun edi. Biz esa **Telegram Mini App + o'z serverdagi PostgreSQL** stackda ishlaymiz,
> shu sabab auth boshqacha qurildi: **email/parol YO'Q, SMS OTP YO'Q** — kirish
> Telegram yuborgan `initData` imzosini bot token bilan HMAC-SHA256 orqali serverda
> tekshirish bilan bo'ladi. Postgres RLS o'rniga API qatlamida himoya (bitta DB
> foydalanuvchi bo'lgani uchun to'g'ri yondashuv) qo'llandi.

---

## Maqsad

Platformaga xavfsiz kirish: foydalanuvchi kimligi mijozdan emas, Telegram imzolagan
ma'lumotdan aniqlanadi. Har kim faqat o'z buyurtmalarini ko'radi.

---

## Bajariladigan vazifalar

- [x] Telegram `initData` imzosini serverda tekshirish (`verifyInitData` — HMAC-SHA256,
      `crypto.timingSafeEqual`, `auth_date` 24 soatdan eski bo'lsa rad)
- [x] `POST /api/auth/telegram` — imzoni tekshirib, foydalanuvchini `users` jadvaliga upsert
- [x] `users.tg_user_id` ustuniga UNIQUE constraint (bir Telegram = bitta hisob)
- [x] `authUser()` middleware: kimlik `X-Telegram-Init-Data` header'idan olinadi,
      mijoz yuborgan `uid` EMAS — eski `?uid=` hujum yo'li yopildi (401)
- [x] Frontend auth oqimi: ochilganda `loginTelegram()`, so'rovlarga imzolangan header
- [x] Izolyatsiya sinovi: ikki foydalanuvchi bir-birining buyurtmasini ko'rmasligi isbotlandi
- [x] Saytda (lolamarket.uz) Telegram orqali kirish — bir martalik kod (deep-link) +
      HttpOnly cookie sessiya; sayt xaridorida imzolangan `initData` yo'q, shuning uchun
      Mini App'nikidan alohida oqim (2026-07-29 qo'shimcha)
- [ ] ~~Telefon + SMS OTP~~ → Telegram identifikatsiyasi bilan almashtirildi (SMS shart emas)
- [ ] Murakkab rollar (menejer/buxgalter), sotuvchi kabineti → Sprint 7 (Admin panel)
- [ ] Postgres RLS → bu arxitekturada (bitta DB user) ixtiyoriy, API himoyasi yetarli

### Dars 11 — backend biznes logikasi

- [x] Server tomon validatsiya: `validate()`/`checkField()` (Zod'siz minimal validator),
      `POST /api/orders`da MOQ biznes qoidasi + maydon uzunlik cheklovlari (klient
      validatsiyasi faqat UX — server har doim qaytadan tekshiradi)
- [x] Moderatsiya (approval) workflow: `products.status` (draft/pending/published/rejected),
      `GET /api/products` faqat published, `POST /api/products` → pending
- [x] Server tomon `isAdmin()` ruxsati (`ADMIN_TG_IDS` env, default `ADMIN_CHAT_ID`):
      `GET/POST /api/admin/moderation` (401=kirmagan, 403=admin emas), bot buyruqlari
      `/moderatsiya`, `/nashr <id>`, `/rad <id>`
- [x] `ClientError` klassi: faqat validatsiya/biznes xatolari klientga ko'rinadi,
      DB/ichki xatolar umumiy "server error" bilan yashiriladi (stack/DB detallari chiqmaydi)
- [x] Standart API dizayni: `ok()`/`fail()` helper, barcha XATO javoblari `{ok:false,error}`
      envelope'da, to'g'ri HTTP status kodlar (200/201/400/401/403/404/429/500)
- [x] Backend kodi endi repoda (`server/server.js`) — ichida sir yo'q; sirlar faqat
      serverdagi `.env`da (deploy qadamlari `server/README.md`)
- [ ] `/admin/moderation` VEB SAHIFA emas → Telegram bot buyruqlari + HTTP API
      (mavjud admin panel soxta client-side parolli; moderatsiya Telegram initData talab qiladi)

---

## Qilingan ishlar

- [2026-07-23] `verifyInitData()` — Telegram initData imzosi bot token bilan HMAC-SHA256
  orqali tekshiriladi (`timingSafeEqual`), 24 soatdan eski `auth_date` rad etiladi
  (serverda `/opt/lolamarket-notify/server.js`, sirlik uchun git'da yo'q)
- [2026-07-23] `POST /api/auth/telegram` qo'shildi — imzoni tekshirib `users`ga upsert
- [2026-07-23] `db/001_schema.sql`: `users.tg_user_id`ga UNIQUE constraint (idempotent DO-blok)
- [2026-07-23] Xavfsizlik teshigi yopildi — `GET/POST /api/orders` kimlikni header'dagi
  imzolangan initData'dan oladi; header'siz yoki soxta imzo → 401, eski `?uid=` ishlamaydi
- [2026-07-23] `telegram-app/app.js`: `loginTelegram()` + so'rovlarga `X-Telegram-Init-Data`
  header, `?uid=` olib tashlandi; `index.html` app.js keshi v=30→v=31
- [2026-07-23] Izolyatsiya isbotlandi — Aziz va Bekzod har biri faqat o'z buyurtmasini
  ko'rdi, header'siz/soxta-uid so'rovlar 401 qaytardi, sinov ma'lumoti tozalandi

### Dars 11 — backend biznes logikasi (jonli deploy tasdiqlandi)

- [2026-07-23] Server tomon validatsiya qo'shildi — `validate()`/`checkField()` (Zod'siz
  minimal validator), `POST /api/orders`da MOQ biznes qoidasi va maydon uzunlik cheklovlari;
  klient validatsiyasi faqat UX, server har doim qaytadan tekshiradi
- [2026-07-23] Moderatsiya (approval) workflow — `db/003_moderation.sql`: `products.status`
  (draft/pending/published/rejected, mavjud 12 mahsulot bir martalik `published`),
  `reject_reason`/`submitted_by_tg`/`reviewed_at`, status indeksi. `GET /api/products`
  faqat published, `POST /api/products` (auth'd) → pending
- [2026-07-23] Server tomon `isAdmin()` ruxsati (`ADMIN_TG_IDS` env) — `GET/POST /api/admin/moderation`
  (401=kirmagan, 403=admin emas), Telegram bot buyruqlari `/moderatsiya`, `/nashr <id>`, `/rad <id>`
- [2026-07-23] `ClientError` klassi — faqat validatsiya/biznes xatolari klientga ko'rinadi,
  DB/ichki xatolar umumiy "server error" bilan yashiriladi. Frontend `submitOrder` server rad
  etsa do'stona toast ko'rsatadi (avval jimgina soxta "muvaffaqiyat" ko'rsatardi)
- [2026-07-23] Standart API dizayni — `ok()`/`fail()` helper, barcha XATO javoblari
  `{ok:false,error}` envelope'da, to'g'ri HTTP status kodlar (200/201/400/401/403/404/429/500)
- [2026-07-23] Backend kodi repoga qo'shildi — `server/server.js` (ichida sir yo'q),
  `server/package.json`, `server/README.md` (deploy qadamlari). Sirlar faqat serverdagi `.env`da
- [2026-07-23] `telegram-app/app.js`: `apiData()` helper (yangi `{ok,data}` envelopini ham,
  eski yalang'och massiv/obyektni ham o'qiydi), `submitOrder` server xatosida do'stona toast;
  `index.html` app.js keshi v=31→v=32
- [2026-07-23] Jonli sinov (127.0.0.1:3001 + lolamarket.uz): auth'siz/soxta so'rov → 401;
  moderatsiya end-to-end (pending yashirin katalog 12 → nashr → 13 → tozalash → 12);
  xatolar `{ok:false,error}` + to'g'ri status; products yalang'och massiv; konsol xatosiz

### Saytda (lolamarket.uz) Telegram orqali kirish

- [2026-07-29] **Sayt xaridori endi Telegram orqali kira oladi — bir martalik kod (deep-link)
  + HttpOnly cookie sessiya.** Muammo: saytda Telegram imzolagan `initData` yo'q, shuning uchun
  006 dagi sayt buyurtmasi faqat telefon bilan yozilardi, `orders.tg_user_id` NULL qolardi va
  `/tasdiqla`, `/yolga`, `/yetdi` buyruqlari "Telegram ID topilmadi" derdi. Oqim: (1) brauzer
  `POST /api/auth/web/start` — server `code` va `verifier` yasaydi; (2) brauzer
  `t.me/<bot>?start=web_<code>` ni ochadi; (3) foydalanuvchi botda "Boshlash" bosadi —
  Telegram webhook'ga ID'ni **o'zi** yuboradi, ya'ni kimlik brauzerdan kelmaydi va
  soxtalashtirib bo'lmaydi; (4) brauzer `GET /api/auth/web/poll` bilan code+verifier ni
  sessiyaga almashtiradi. Yangi migratsiya `db/007_web_auth.sql` (idempotent):
  `web_login_codes` (`code` + `verifier_hash`, `pending`/`confirmed`/`used`, 10 daqiqada
  eskiradi), `web_sessions` (30 kun), `users.tg_username`. Yangi endpointlar:
  `/api/auth/web/start`, `/api/auth/web/poll`, `/api/auth/web/me`, `/api/auth/web/logout`,
  `GET /api/web/orders` (sessiyasiz 401). Eskirgan kodlar `start` da yo'l-yo'lakay tozalanadi —
  alohida cron kerak emas
- [2026-07-29] **Sayt buyurtmasi endi xaridorga bog'lanadi.** `POST /api/web-orders` cookie
  sessiyasini o'qiydi va `orders.buyer_id` / `tg_user_id` / `tg_username` ni to'ldiradi
  (Telegram ID mijozdan SO'RALMAYDI). Natijada: xaridorga buyurtma tasdig'i botda keladi,
  `/tasdiqla`, `/yolga`, `/yetdi` sayt buyurtmalarida ham xaridorga xabar yuboradi, admin
  xabarida `@username` va "xaridor Telegram'da" belgisi ko'rinadi (ilgari doim "telefon qiling")
- [2026-07-29] **Botga yuborilgan telefon `users.phone` ga ham yoziladi** (ilgari faqat
  `contacts.json` da qolardi, ya'ni saytdagi profil uni ko'rmasdi). Kirgandan keyin telefon
  yo'q bo'lsa bot uni bir marta so'raydi; checkout formasi kirgan foydalanuvchida ism va
  telefon bilan o'zi to'ladi. Yon nuqson tuzatildi — bitta kontakt xabariga ikkita javob
  ketardi: `handleSellerApplicationContact()` endi `true`/`false` qaytaradi va sotuvchi arizasi
  oqimi ishlagan bo'lsa umumiy javob yuborilmaydi
- [2026-07-29] **Landing drawer'ida ikkita yangi ko'rinish** — Kirish (Telegram tugmasi,
  tasdiqni kutish holati, bekor qilish) va Profil (ism/username, mening buyurtmalarim,
  chiqish). Yangi sahifa yaratilmadi, mavjud drawer qayta ishlatildi. Savatdan kirilsa
  kirishdan keyin checkout'ga qaytariladi (`afterLoginView`). Kesh-bust: `style.css?v=33`,
  `script.js?v=19`
- [2026-07-29] **Deploy tugadi — production'da ishlayapti.** `db/007_web_auth.sql` production
  bazasiga qo'llanildi, `BOT_USERNAME` `.env` ga qo'shildi, `server.js` serverga ko'chirildi,
  `lolamarket-notify` servisi restart qilindi, nginx'ga `/api/web/orders` proxy bloki qo'shildi
  (`/api/web-orders` bloki uni qamramasdi) va statik fayllar (`index.html`, `style.css?v=33`,
  `script.js?v=19`) saytga chiqarildi. Qadamlar `server/README.md` da yozib qo'yilgan edi
- [2026-07-29] **Production'da uchidan-uchiga sinaldi — ISHLADI.** Kirish oqimi haqiqiy
  telefonda tekshirildi: lolamarket.uz → Kirish → botda "Boshlash" → sayt profilga o'tdi;
  bazada 1 ta faol sessiya (`web_sessions`) bor, `users.tg_username` to'ldi. Ya'ni Sprint 3
  ning saytdagi kirish qismi endi faqat kod emas, **production'da tasdiqlangan** holatda

> 🔴 **2026-08-13 — YUQORIDAGI "TASDIQLANGAN" DA'VOSIGA ILOVA (sprint yopilgandan
> keyin qo'shildi, o'chirilmadi).** O'sha kuni bu oqim production'da **butunlay
> o'lgan** edi va sabab shu sprintdagi kodning birortasida ham emas: bot tokeni
> almashtirilganda Telegram **webhook manzili ham o'chgan** va qayta ro'yxatdan
> o'tkazilmagan. Ya'ni oqimning 3-qadami — "Telegram webhook'ga ID'ni **o'zi**
> yuboradi" — jimgina uzilib qolgan: bot «Start» ni oladi, uzatadigan joyi
> yo'q (`getWebhookInfo` → `url: ""`, navbatda 6 ta yangilanish).
> **Dars aynan bu sprintga tegishli:** kirishning eng kuchli tomoni — kimlik
> brauzerdan emas, Telegram'dan kelishi — ayni paytda uning **eng nozik
> tomoni**: oqim repodan TASHQARIDAGI holatga (webhook ro'yxati) bog'liq va
> u yerdagi uzilishni na test, na deploy tekshiruvi ko'radi. Batafsil tashxis,
> o'lchov va tiklash tartibi: `sprint-9.md` (2026-08-13) va `CLAUDE.md` →
> "Server va Deploy".

### Chiqish tugmasi (sprint yopilgandan keyin, 2026-08-14)

- [2026-08-14] **Mini App'dan "Hisobdan chiqish" tugmasi OLIB TASHLANDI** —
  founder shikoyati: "mini appda hisobdan chiqish ishlamayapti shuni ishlaydigan
  qil, va boshqattan kirganda to'liq kirsin, yokida ... olib tashlash kerakmi
  mantiqan?". Shikoyat **o'lchandi va rost bo'lib chiqdi**: `telegram-app/app.js`
  dagi tugmada `data-action` UMUMAN yo'q edi, hodisa delegatsiyasi esa faqat
  `[data-action]` ni ushlaydi — ya'ni tugma tug'ilganidan beri o'lik edi.
  **Lekin tuzatish uni "ishlaydigan qilish" emas, olib tashlash bo'ldi**
  (founder ikki variantdan "Olib tashlansin" ni tanladi). Sabab shu sprintning
  o'z arxitekturasida: Mini App'da chiqiladigan **sessiyaning O'ZI yo'q** —
  kimlik har ochilishda Telegram imzolagan `initData` dan olinadi va u har
  so'rov bilan ketadi (token ham, cookie ham yo'q). Ya'ni o'chiradigan narsa
  mavjud emas: "Chiqdingiz" ekrani server sizni AYNAN o'sha odam deb tanib
  turganda ko'rsatilardi va keyingi ochilishda kirish o'zi tiklanardi —
  tugma FAQAT KO'RINISH bo'lardi. Founderning ikkinchi talabi ("boshqattan
  kirganda to'liq kirsin") esa **allaqachon shunday ishlayapti** — tuzatadigan
  narsa yo'q edi. `logout` tarjima kaliti ikkala tildan (uz/ru) o'chirildi,
  `renderProfile` ustidagi izoh blokiga sabab yozildi
- [2026-08-14] **Saytda tugma QOLADI va u yerda HAQIQIY** — lolamarket.uz da
  kimlik HttpOnly cookie sessiyada yuradi (yuqoridagi 2026-07-29 oqimi),
  `POST /api/auth/web/logout` esa `web_sessions` dagi yozuvni O'CHIRADI.
  Umumiy kompyuterda hisobni yopish yo'li shu, ya'ni ikki yuz bir xil
  ko'rinishi SHART EMAS: **farq uslubda emas, KIMLIK MANBAIDA**
- [2026-08-14] **Qorovul — `server/test.js` → Test 33**, ikki tomonga qaraydi:
  (a) Mini App'ga chiqish tugmasi qaytmasin (4 ta taqiq namunasi — `logout`,
  `signOut`, "Hisobdan chiqish", "Выйти"); (b) saytdan yo'qolmasin
  (`data-action="logout"`, endpoint, `handleWebLogout` TANASIDA
  `DELETE FROM web_sessions` + `clearSessionCookie`, `server.js` marshruti).
  **10 mutatsiya bilan sinaldi, 10 tasi ham ushlandi.** Sinov qorovulning
  O'ZIDA ikkita teshik ochdi va ikkalasi ham tuzatildi: (1) `Вы(?:йти)\b`
  hech qachon mos kelmasdi — JS da `\b` ASCII chegara, kirill harfidan keyin
  u YO'Q; (2) server tomonida NOMNI qidirish yetarli emas edi — e'lon qayta
  nomlanganda `module.exports` dagi so'z qorovulni yashil ushlab turardi,
  endi funksiya TANASI ochib ko'riladi
- [2026-08-14] Kesh-bust: `telegram-app/app.js?v=92 → ?v=93`, Test 16 dagi
  KUTILGAN jadval yangilandi (`a658d67a00ff` → `ffc41bc7c089`) — **buni
  Test 16 ning O'ZI ushladi**. `node server/test.js` — hammasi PASS.
  Profil ekrani brauzerda 375×812 da ko'z bilan emas, `getBoundingClientRect`
  bilan O'LCHANDI: kesilgan blok yo'q, chiqish matni yo'q, oxirgi ikki blok —
  "Ijtimoiy tarmoqlar" va brend izi

---

## Qarorlar

- [2026-07-23] Qaror: auth uchun email/parol va SMS OTP EMAS, Telegram `initData` imzosi —
  chunki mahsulot Telegram Mini App, foydalanuvchi allaqachon Telegram'da autentifikatsiya
  qilingan; qo'shimcha SMS gateway (xarajat, ishqalanish) shart emas
- [2026-07-23] Qaror: kimlik hech qachon mijozdan (`uid`) olinmaydi, faqat server tomonda
  tekshirilgan imzodan — aks holda har kim `uid` almashtirib begona buyurtmani ko'rardi
- [2026-07-23] Qaror: Postgres RLS ixtiyoriy qoldirildi — bitta DB foydalanuvchi bilan
  ishlaganda himoya API qatlamida (`authUser` middleware) to'g'ri joy; RLS keraksiz murakkablik
- [2026-07-23] Qaror: klient validatsiyasi hech qachon ishonchli emas — server har bir
  so'rovni (MOQ, maydon uzunligi) qaytadan tekshiradi; klient tekshiruvi faqat UX uchun
- [2026-07-23] Qaror: xato javoblarida DB/stack detallari klientga hech qachon chiqmaydi —
  `ClientError` bilan belgilangan biznes xatolarigina ko'rinadi, qolgani umumiy "server error"
  (ma'lumot sizib chiqishining oldini oladi)
- [2026-07-23] Qaror: kolleksiya GET'lari (`/api/products`, `/api/orders`) ATAYLAB yalang'och
  massiv qoldirildi (envelope EMAS) — Cloudflare/Telegram keshidagi eski mijozlar shu kontraktga
  bog'liq; frontend `apiData()` ikkala shaklni ham o'qiydi (buzilmasin uchun)
- [2026-07-23] Qaror: moderatsiya `/admin/moderation` VEB SAHIFA qilinmadi — Telegram bot
  buyruqlari + HTTP API orqali; mavjud admin panel soxta client-side parolli, moderatsiya API esa
  Telegram initData imzosini talab qiladi (yagona xavfsiz yo'l)
- [2026-07-23] Qaror: backend kodi endi git repoda (`server/`) — sirlar YO'Q, faqat serverdagi
  `.env`da; ilgari server.js butunlay git tashqarisida edi, endi kod versiyalanadi
- [2026-07-29] Qaror: saytdagi kirish uchun **Telegram Login Widget EMAS**, deep-link + bir
  martalik kod. Sabab: widget BotFather'da domen sozlashni talab qiladi va ba'zi ichki
  brauzerlarda (Instagram, Telegram) umuman ochilmaydi; deep-link esa telefonda bir bosishda
  ishlaydi va mavjud botning o'zidan foydalanadi (yangi integratsiya kerak emas)
- [2026-07-29] Qaror: kirish kodi **ikkita sirdan** iborat — `code` deep-link'da (Telegram
  xabarida ko'rinadi, guruhga ulashilishi yoki yelka ortidan o'qilishi mumkin), `verifier` esa
  faqat brauzerda qoladi va bazada sha256 shaklida saqlanadi. Kodni bilgan begona odam
  sessiyani o'g'irlay olmasin uchun almashtirishda ikkalasi ham talab qilinadi
- [2026-07-29] Qaror: sayt sessiya tokeni **HttpOnly cookie**da yuradi va bazada faqat sha256
  shaklida saqlanadi. Admin panel tokenidan (`sessionStorage`) farqi shu: XSS bo'lsa ham
  sahifadagi JS uni o'qiy olmaydi, baza nusxasi sizib chiqsa ham tayyor token chiqmaydi
- [2026-07-29] Qaror: kimlik saytda ham hech qachon mijozdan olinmaydi — Telegram ID kodni
  tasdiqlash paytida **webhook orqali Telegram'ning o'zidan** keladi (2026-07-23 dagi "uid
  mijozdan olinmaydi" qarorining sayt uchun davomi)
- [2026-07-29] Qaror: mavjud kodni taxmin qilib bo'lmasin uchun `poll` javobi bir xil bo'ladi —
  topilmagan, eskirgan va allaqachon ishlatilgan kodning uchalasi ham `expired` deb qaytadi
- [2026-07-29] Qaror: yuqoridagi kimlik qoidalari `CLAUDE.md` ning arxitektura bo'limiga
  doimiy qoida sifatida yozildi — **foydalanuvchi kimligi hech qachon brauzerdan olinmaydi**
  (Mini App'da imzolangan `initData`, saytda bir martalik kod orqali Telegram webhook'i),
  klient yuborgan `tg_user_id` ga ishonadigan endpoint qo'shilmasin, sayt sessiyasi HttpOnly
  cookie'da yuradi va bazada faqat `sha256` shaklida saqlanadi. Sabab: bu qaror bitta sprint
  ichidagi tafsilot emas, keyingi barcha endpointlarga tegishli — sprint faylida qolsa
  unutiladi
- [2026-08-14] Qaror: **"Hisobdan chiqish" — saytda BOR, Mini App'da YO'Q.**
  Ishlamayotgan tugma "tuzatilmadi", olib tashlandi: Mini App'da chiqiladigan
  sessiya mavjud emas (kimlik har ochilishda `initData` dan olinadi), ya'ni
  har qanday "ishlaydigan" variant ham faqat KO'RINISH bo'lardi — server sizni
  tanib turgan holda "chiqdingiz" deyish **jimgina yolg'on**, u loyihada
  yo'qlikdan yomonroq deb hisoblanadi (`NULL` reyting, `ALERT_CHAT_ID`, tarix
  qoidalari bilan bitta oila). Ikki yuz bir xil ko'rinishi shart emas — farq
  uslubda emas, kimlik manbaida. Qurilmadagi keshni tozalash kerak bo'lsa, u
  ALOHIDA amal va nomi ham boshqacha bo'lsin, "chiqish" deb atalmasin.
  Qoida `CLAUDE.md` ning arxitektura bo'limiga ham yozildi — chunki u bitta
  tugma haqida emas, ikki yuzning kimlik farqi haqida
