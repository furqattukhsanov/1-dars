# Sprint 2 — Ma'lumotlar bazasi va Backend/API (Dars 9)

**Holat:** tugadi

> **Diqqat — arxitektura o'zgarishi (2026-07-23):** Sprint dastlab Supabase asosida rejalashtirilgan edi (quyidagi stack jadvali eski rejani ko'rsatadi). Amalda **Supabase o'rniga o'z serverimizdagi (Hetzner) oddiy PostgreSQL 18** ishlatildi. Shu sabab:
> - **Auth / SMS OTP** (bo'lim 4) va **Row Level Security** (bo'lim 2) bu sprintda **QILINMADI** — ular **Sprint 3 (Dars 10)** ga o'tkazildi.
> - **Edge Functions** (bo'lim 5) o'rniga serverdagi Node.js CRUD (`server.js` + `pg`) ishlatildi.
> - Ma'lumot modeli, demo ma'lumot, backend CRUD va Mini App bog'lanishi (bo'lim 1, 6, 7) — **bajarildi**.

---

## Maqsad

LolaMarket uchun backend/API qatlamini qurish — barcha ob'ektlarni ma'lumotlar bazasida yaratish, ular o'rtasidagi bog'lanishlarni o'rnatish, va Mini App/web/mobil klientlar ulanadigan API'ni tayyorlash. Stack `docs/texnik-topshiriq.md` §5–7 da qaror qilingan (keyinchalik Supabase → o'z serverdagi PostgreSQL ga o'zgartirildi).

---

## Texnik stack

| Qatlam | Texnologiya | Nega aynan shu |
|---|---|---|
| Backend | **Supabase** (Postgres, Auth, Storage, RLS, Edge Functions) | Serversiz baza + fayl + webhook, bepul boshlanadi |
| Auth | Supabase Auth + **telefon OTP** | Auditoriya SMS bilan tanish, parol emas |
| SMS gateway | **Eskiz.uz** yoki **Play Mobile** | Supabase default (Twilio) UZ raqamlariga yetkazmasligi mumkin |
| To'lov | **Payme / Click** webhook'lari | Escrow yozuvi shu orqali yangilanadi (Sprint 6 bilan bog'liq) |
| Bildirishnoma | **Telegram Bot API** | Auditoriya Telegramda (Sprint 6 bilan bog'liq) |
| Hosting | **Vercel** (frontend) + Supabase (backend) | — |

---

## Bajariladigan vazifalar

### 1. Ma'lumotlar modeli (jadvallar) — ✅ bajarildi (o'z serverda PostgreSQL, `db/001_schema.sql`)
- [x] `users` — id, full_name, phone, role (buyer/seller/admin), tg_user_id, created_at (`profiles` o'rniga; auth Sprint 3 da)
- [x] `sellers` — id, user_id, business_name, city, is_verified, rating
- [x] `products` — id, seller_id, title, photos, composition, width_cm, meters_per_roll, price_per_roll, stock_rolls, status
- [x] `orders` — id, buyer_id, seller_id, status, total_amount, commission_amount, payment_status, created_at (1 order = 1 sotuvchi)
- [x] `order_items` — id, order_id, product_id, qty_rolls, unit_price
- [x] `payments` — id, order_id, provider, provider_txn_id, amount, status
- [x] `disputes` — order_id, sabab, dalil URL, moderator qarori
- [x] `bts_points` — manzil, shahar, kod
- [x] Jadvallar orasidagi foreign key bog'lanishlar + indekslar
- [ ] `refunds`, `order_status_history` — MVP dan tashqarida qoldi (kerak bo'lsa keyin qo'shiladi)

### 2. Row Level Security (RLS) → **Sprint 3 (Dars 10)** ga o'tkazildi
- [ ] ~~Har jadval uchun RLS policy~~ — auth (foydalanuvchi sessiyasi) bilan birga Sprint 3 da qilinadi
- [ ] ~~Policy'lar bazada qulflanadi~~ — o'z serverda RLS o'rniga backend (server.js) darajasida ruxsat tekshiriladi

### 3. Order status state machine
- [x] Holatlar bazada: `pending` → `confirmed` → `shipped` → `delivered` (bot buyruqlari orqali yangilanadi: `/tasdiqla`, `/yolga`, `/yetdi`)
- [ ] Stock rezerv qoidasi (`paid`da kamaytirish) — to'lov integratsiyasi bilan Sprint 6 da

### 4. Auth → **Sprint 3 (Dars 10)** ga o'tkazildi
- [ ] ~~Telefon + SMS OTP oqimi~~ — Sprint 3
- [ ] ~~Sessiya boshqaruvi~~ — Sprint 3 (Supabase Auth o'rniga o'z yechim)

### 5. Backend mantiq (Edge Functions o'rniga — serverda Node.js `server.js` + `pg`)
- [x] `POST /api/orders` — savatdan order yaratish (bazaga yozadi)
- [x] `GET /api/products`, `GET /api/orders` — bazadan o'qish
- [x] `/api/order-status` + bot status buyruqlari — bazadan ishlaydi
- [x] `telegram-notify` — bot orqali bildirishnoma (avvaldan)
- [ ] `payme-webhook` / `click-webhook`, `admin-settle` — to'lov integratsiyasi bilan **Sprint 6**

### 6. Ma'lumot va sinov — ✅ bajarildi
- [x] Demo ma'lumotlar: 11 ta ishlab chiqaruvchi, 12 ta mahsulot (`db/002_seed.sql`, `app.js` PRODUCTS massividan generatsiya)
- [x] Saqlash sinovi: brauzerda buyurtma berildi, localStorage tozalab yangilandi, buyurtma faqat bazadan qaytib ko'rindi

### 7. Mini App bilan bog'lash — ✅ bajarildi
- [x] `telegram-app/app.js`dagi statik `PRODUCTS`/`ORDERS` `/api/products` va `/api/orders` so'rovlariga almashtirildi (qattiq kod zaxira sifatida qoldi), struktura qayta yozilmadi

---

## Sprint 2 doirasidan tashqarida

- To'lov provayder integratsiyasining o'zi (Payme/Click merchant sozlamalari, UI oqimi) — **Sprint 6**
- BTS Pochta API integratsiyasi — **Sprint 6**
- Sotuvchi kabineti UI, Admin panel UI — **Sprint 7**

---

## Qilingan ishlar

- [2026-07-11] Skaffold boshlandi (`lolamarket-next/`): `@supabase/supabase-js` o'rnatildi, `lib/supabase.ts` (browser + service-role klientlari), `.env.example`, `supabase/migrations/0001_init.sql` (to'liq sxema: 10 jadval, enum turlari, RLS policy'lar, `is_admin()`/`owns_seller()` helper funksiyalar), `supabase/README.md` (qo'lda bajariladigan qadamlar) yaratildi
- [2026-07-11] `npx tsc --noEmit` xatosiz o'tdi
- [2026-07-23] **PostgreSQL 18** Hetzner serverga (65.21.180.44) o'rnatildi: baza `lolamarket`, egasi `lola`, read-only user `lola_ro` (MCP uchun), faqat localhost'ga ochiq. `DATABASE_URL` serverdagi `/opt/lolamarket-notify/.env` da (git'ga kirmaydi)
- [2026-07-23] **8 jadval** yaratildi (PRD §6 asosida, Supabase EMAS): users, sellers, products, orders, order_items, payments, disputes, bts_points + FK + indekslar. Sxema repo'da versiyalandi: `db/001_schema.sql`, seed `db/002_seed.sql` (11 sotuvchi + 12 mahsulot, `app.js` PRODUCTS'idan generatsiya)
- [2026-07-23] **Backend CRUD** — serverdagi `server.js` (`pg` bilan) bazaga ulandi: `GET /api/products`, `GET/POST /api/orders`, `/api/order-status` va bot status buyruqlari bazadan ishlaydi; eski `orders.json` fayl-bazasi tashlab yuborildi
- [2026-07-23] **Mini App ulandi** (`telegram-app/app.js`): mahsulotlar `/api/products`dan yuklanadi (qattiq kod zaxira), buyurtmalar `/api/orders`ga yoziladi va bazadan qayta yuklanadi, success ekranidagi qattiq `#LM-2042` haqiqiy buyurtma raqamiga almashtirildi; nginx'ga `/api/products` va `/api/orders` proxy bloklari qo'shildi (jami 6 blok, deploy guard ≥4)
- [2026-07-23] **Saqlash sinovi o'tdi** — buyurtma berildi (#LM-3002), localStorage tozalab yangilandi, buyurtma faqat bazadan qaytib tarixda ko'rindi; sinov buyurtmalari tozalandi, order_seq 3000'ga tiklandi (keyingi haqiqiy buyurtma #LM-3001)
- [2026-07-23] **Kunlik backup** — serverda `pg-backup.sh` (pg_dump+gzip), cron har kuni 03:30, 7 kun saqlanadi (`/opt/lolamarket-backups/`)
- [2026-07-23] **DB MCP** — read-only user + SSH tunnel orqali ulanish yo'riqnomasi berildi (foydalanuvchi interaktiv sessiyada ulaydi)

---

## Qarorlar

- [2026-06-28] Qaror: Backend uchun Supabase (Postgres + Auth + Storage + Edge Functions) — serversiz, tez boshlash, RLS orqali xavfsizlik bazada ta'minlanadi (`docs/texnik-topshiriq.md`)
- [2026-06-28] Qaror: Auth — telefon + SMS OTP, standart Supabase SMS provayderi o'rniga Eskiz.uz/Play Mobile (UZ raqamlariga yetkazish ishonchliroq)
- [2026-06-28] Qaror: Escrow MVP'da **avtomatik emas** — pul Payme/Click orqali platforma hisobiga tushadi, admin yetkazilganini tasdiqlagach qo'lda/haftalik o'tkazadi (murakkab marketplace-payment infratuzilmasidan qochish uchun)
- [2026-06-28] Qaror: 1 order = 1 sotuvchi (ko'p sotuvchili savat/split order MVP'dan tashqarida)
- [2026-07-23] Qaror: **Supabase o'rniga o'z serverimizdagi (Hetzner) PostgreSQL 18** ishlatiladi — baza to'liq o'z nazoratimizda, tashqi provayderga bog'liqlik yo'q, xarajat qo'shimcha emas (server allaqachon bor), bildirishnoma relay ham shu serverda. Natijada RLS o'rniga backend (server.js) darajasida ruxsat tekshiriladi
- [2026-07-23] Qaror: **Auth / SMS OTP va RLS Sprint 2 dan Sprint 3 (Dars 10) ga o'tkazildi** — bu sprint faqat ma'lumot modeli, backend CRUD va Mini App bog'lanishiga qaratildi; foydalanuvchi sessiyasi keyingi darsda
- [2026-07-23] Qaror: **Edge Functions o'rniga serverdagi Node.js CRUD** (`server.js` + `pg`) — mavjud bildirishnoma servisiga tabiiy qo'shildi, alohida serversiz platforma kerak emas
- [2026-07-23] Qaror: **Kunlik pg_dump backup** (cron 03:30, 7 kun retention) — ma'lumot yo'qolishidan himoya, o'z serverda boshqariladigan baza uchun majburiy
