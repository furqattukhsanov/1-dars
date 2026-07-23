# Sprint 3 — Auth + backend biznes logikasi (Dars 10–11)

**Holat:** tugadi

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
