# Sprint 2 — Ma'lumotlar bazasi va Backend/API (Dars 9)

**Holat:** kutilmoqda

---

## Maqsad

LolaMarket uchun Supabase asosida backend/API qatlamini qurish — barcha ob'ektlarni ma'lumotlar bazasida yaratish, ular o'rtasidagi bog'lanishlarni o'rnatish, va Mini App/web/mobil klientlar ulanadigan API'ni tayyorlash. Stack `docs/texnik-topshiriq.md` §5–7 da qaror qilingan.

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

### 1. Ma'lumotlar modeli (jadvallar)
- [ ] `profiles` — id, role, phone, full_name, region, created_at (Supabase Auth bilan bog'liq)
- [ ] `sellers` — id, profile_id, business_name, phone, is_active
- [ ] `products` — id, seller_id, title, photos[], composition, width_cm, color, meters_per_roll, price_per_roll, stock_rolls, status
- [ ] `orders` — id, buyer_id, seller_id, status, total_amount, commission_amount, payment_status, delivery_status, bts_tracking_no, created_at (1 order = 1 sotuvchi)
- [ ] `order_items` — id, order_id, product_id, qty_rolls, unit_price
- [ ] `payments` — id, order_id, provider, provider_txn_id, amount, status
- [ ] `refunds` — id, order_id, amount, reason, status, created_by
- [ ] `order_status_history` — id, order_id, status, note, created_at, created_by
- [ ] `disputes` — order_id, sabab, dalil URL (rasm/video), moderator qarori
- [ ] `bts_points` — manzil, shahar, kod
- [ ] Jadvallar orasidagi foreign key bog'lanishlar

### 2. Row Level Security (RLS)
- [ ] Har jadval uchun RLS policy: sotuvchi faqat **o'z** `products`/`orders` larini ko'radi; xaridor faqat **o'zining** order'larini
- [ ] Policy'lar bazada qulflanadi — frontendga ishonilmaydi

### 3. Order status state machine
- [ ] Holatlar: `created` → `paid` → `confirmed` → `shipped` → `delivered` → `completed` (yoki `cancelled`/`refunded`/`partially_refunded`)
- [ ] Qoida: `paid`gacha `stock_rolls` kamaytirilmaydi; `paid` bo'lganda rezerv qilinadi; `cancelled` bo'lsa qaytariladi

### 4. Auth
- [ ] Telefon + SMS OTP oqimi (Eskiz.uz/Play Mobile Edge Function orqali)
- [ ] Supabase Auth sessiya boshqaruvi

### 5. Edge Functions (maxsus mantiq)
- [ ] `create-order` — savatdan order yaratish, stock rezervi
- [ ] `payme-webhook` / `click-webhook` — to'lov holatini yangilash, **idempotentlik majburiy** (`provider_txn_id` bo'yicha takror bloklanadi)
- [ ] `send-sms-otp` — Eskiz.uz orqali SMS yuborish
- [ ] `telegram-notify` — bot orqali bildirishnoma
- [ ] `admin-settle` — qo'lda escrow chiqarish (komissiya ayirib sotuvchiga o'tkazish)

### 6. Ma'lumot va sinov
- [ ] Demo ma'lumotlar: 3 ta ishlab chiqaruvchi, 10 ta mahsulot
- [ ] Har bir Edge Function uchun asosiy oqim testi (order yaratish, to'lov webhook, OTP)

### 7. Mini App bilan bog'lash
- [ ] `telegram-app/app.js`dagi statik `PRODUCTS`/`ORDERS` massivlarini Supabase so'rovlariga (`supabase-js`) almashtirish — data shape allaqachon mos (id, name, price, moq...), struktura qayta yozilmaydi

---

## Sprint 2 doirasidan tashqarida

- To'lov provayder integratsiyasining o'zi (Payme/Click merchant sozlamalari, UI oqimi) — **Sprint 6**
- BTS Pochta API integratsiyasi — **Sprint 6**
- Sotuvchi kabineti UI, Admin panel UI — **Sprint 7**

---

## Qilingan ishlar

- [2026-07-11] Skaffold boshlandi (`lolamarket-next/`): `@supabase/supabase-js` o'rnatildi, `lib/supabase.ts` (browser + service-role klientlari), `.env.example`, `supabase/migrations/0001_init.sql` (to'liq sxema: 10 jadval, enum turlari, RLS policy'lar, `is_admin()`/`owns_seller()` helper funksiyalar), `supabase/README.md` (qo'lda bajariladigan qadamlar) yaratildi
- [2026-07-11] `npx tsc --noEmit` xatosiz o'tdi

---

## Qarorlar

- [2026-06-28] Qaror: Backend uchun Supabase (Postgres + Auth + Storage + Edge Functions) — serversiz, tez boshlash, RLS orqali xavfsizlik bazada ta'minlanadi (`docs/texnik-topshiriq.md`)
- [2026-06-28] Qaror: Auth — telefon + SMS OTP, standart Supabase SMS provayderi o'rniga Eskiz.uz/Play Mobile (UZ raqamlariga yetkazish ishonchliroq)
- [2026-06-28] Qaror: Escrow MVP'da **avtomatik emas** — pul Payme/Click orqali platforma hisobiga tushadi, admin yetkazilganini tasdiqlagach qo'lda/haftalik o'tkazadi (murakkab marketplace-payment infratuzilmasidan qochish uchun)
- [2026-06-28] Qaror: 1 order = 1 sotuvchi (ko'p sotuvchili savat/split order MVP'dan tashqarida)
