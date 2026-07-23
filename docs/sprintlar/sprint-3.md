# Sprint 3 — Auth: Telegram orqali kirish + ruxsatlar (Dars 10)

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

---

## Qarorlar

- [2026-07-23] Qaror: auth uchun email/parol va SMS OTP EMAS, Telegram `initData` imzosi —
  chunki mahsulot Telegram Mini App, foydalanuvchi allaqachon Telegram'da autentifikatsiya
  qilingan; qo'shimcha SMS gateway (xarajat, ishqalanish) shart emas
- [2026-07-23] Qaror: kimlik hech qachon mijozdan (`uid`) olinmaydi, faqat server tomonda
  tekshirilgan imzodan — aks holda har kim `uid` almashtirib begona buyurtmani ko'rardi
- [2026-07-23] Qaror: Postgres RLS ixtiyoriy qoldirildi — bitta DB foydalanuvchi bilan
  ishlaganda himoya API qatlamida (`authUser` middleware) to'g'ri joy; RLS keraksiz murakkablik
