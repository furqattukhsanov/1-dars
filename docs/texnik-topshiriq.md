# TEXNIK TOPSHIRIQ (TTZ) — Rulon

**Loyiha:** B2B mato (rulon) marketplace — viloyat xaridorlari ↔ Toshkent ulgurji sotuvchilari
**Versiya:** v0.1 · **Asos:** brief.md + discovery javoblari
**Auditoriya:** asoschi (HTML/CSS biladi, Claude bilan vibe coding qiladi)

> Bu hujjat — qurilish xaritasi. `brief.md` "nima uchun" ni, bu hujjat "qanday" ni belgilaydi.

---

## 1. Discovery natijalari (qabul qilingan qarorlar)

| # | Qaror | Tanlov | Texnik ta'sir |
|---|---|---|---|
| A1 | Pul oqimi | **Escrow** — platforma ushlaydi, keyin sotuvchiga | Eng murakkab qism; MVP da soddalashtiriladi (q. §6) |
| A2 | Daromad | Sotuvchidan **15% komissiya** har buyurtmada | `commission_amount` har order'da hisoblanadi |
| A3 | Rad etish | **Qisman qaytarish** mumkin | Refund mantig'i + admin tasdig'i kerak |
| B1 | Sotuvchilar | **3–10 ta** (kichik multi-vendor) | Bitta order = bitta sotuvchi (soddalashtirish) |
| B2 | Qoldiq | Sotuvchi **qo'lda** kiritadi | Real-time sync shart emas |
| B3 | Narx birligi | **Faqat rulonlab** | Butun son; kasr metr hisobi yo'q ✅ |
| C1 | Logistika | **BTS** (outsource) | API emas, tracking raqami qo'lda kiritiladi (MVP) |
| C2 | ETA | **Oddiy status bosqichlari** | State machine, GPS yo'q ✅ |
| D1 | Platforma | TG Mini App + web + mobil → **bitta responsive PWA** | 1 kod bazasi, 3 muhit |
| D2 | Auth | **Telefon + SMS kod** | UZ SMS gateway kerak (q. §7) |
| E1 | Sotuvchi kabineti | **Ha, kerak** | Self-serve SKU/qoldiq/order boshqaruvi |
| E2 | Pilot | **30+ tikuvchi** | Yuk kam, lekin ishonchlilik muhim |

---

## 2. Scope reality check (halol baho)

8 hafta uchun yuqoridagi to'plam zич. Tavsiya: scope ni quyidagicha ajratamiz.

| Bloк | MVP (8 hafta ichida) | Keyinga qoldiriladi |
|---|---|---|
| Katalog | Ko'rish, qidirish, filtr (rang/eni/tarkib) | AI tavsiya, "o'xshash mato" |
| Buyurtma | Bitta sotuvchidan order, savat | Ko'p sotuvchili savat (split order) |
| To'lov | Payme **yoki** Click (bittasi) + escrow-hold yozuvi | Avtomatlashtirilgan split payout |
| Escrow | **Qo'lda settlement** (admin tasdiqlab pul o'tkazadi) | Avtomatik escrow release |
| Qaytarish | Admin qo'lda refund (provayder paneli orqali) + DB yozuv | Avtomatik qisman refund mantig'i |
| Yetkazib berish | BTS tracking raqami qo'lda + status bosqichlari | BTS API integratsiya, GPS |
| Sotuvchi kabineti | SKU qo'shish/tahrir, qoldiq, order ko'rish/status | Sotuvchi analitikasi, payout UI |
| Auth | Telefon + SMS OTP | Telegram bir-bosish login |

**Eng muhim soddalashtirish:** escrow ni MVP da *avtomatik* qilmang. Pul Payme/Click orqali platforma hisobiga tushadi → admin yetkazilganini tasdiqlaydi → admin sotuvchiga (komissiya chegirib) **qo'lda yoki haftalik** o'tkazadi. Bu sizni 8 haftaga sig'maydigan murakkab marketplace-payment infratuzilmasidan qutqaradi.

---

## 3. Foydalanuvchi rollari

| Rol | Kim | Asosiy harakatlar |
|---|---|---|
| Xaridor (buyer) | Viloyat tikuvchisi/do'koni | Katalog ko'rish, order, to'lov, kuzatuv |
| Sotuvchi (seller) | Toshkent ulgurji bazasi | SKU/qoldiq kiritish, order qabul qilish, status yangilash |
| Admin | Siz | Escrow settlement, refund, BTS tracking, nizolar |

---

## 4. Asosiy oqimlar (user flows)

**Xaridor:**
`Ro'yxat (telefon+SMS) → katalog → rulon tanlash → savat (1 sotuvchi) → to'lov (Payme/Click) → "to'landi, ushlab turilibdi" → status kuzatuv → yetib keldi → tasdiq`

**Sotuvchi:**
`Kabinetga kirish → SKU qo'shish (foto, tarkib, eni, rang, rulonda necha metr, narx, qoldiq) → yangi order bildirishnomasi → tasdiqlash → BTS ga topshirish → tracking raqam kiritish → status: yo'lda`

**Admin (escrow):**
`Order yetkazildi → admin tasdiqlaydi → komissiya (15%) chegiriladi → sotuvchiga to'lov → order: yakunlandi`

---

## 5. Ma'lumotlar modeli (Supabase / Postgres)

| Jadval | Asosiy maydonlar | Izoh |
|---|---|---|
| `profiles` | id, role, phone, full_name, region, created_at | Auth bilan bog'liq |
| `sellers` | id, profile_id, business_name, phone, is_active | 3–10 ta |
| `products` | id, seller_id, title, photos[], composition, width_cm, color, meters_per_roll, price_per_roll, stock_rolls, status | "Faqat rulonlab" |
| `orders` | id, buyer_id, seller_id, status, total_amount, commission_amount, payment_status, delivery_status, bts_tracking_no, created_at | 1 order = 1 sotuvchi |
| `order_items` | id, order_id, product_id, qty_rolls, unit_price | Butun son qty |
| `payments` | id, order_id, provider, provider_txn_id, amount, status | Click/Payme |
| `refunds` | id, order_id, amount, reason, status, created_by | Admin yaratadi |
| `order_status_history` | id, order_id, status, note, created_at, created_by | State o'zgarishlari logi |

**RLS (Row Level Security) — kritik:** sotuvchi faqat **o'z** `products`/`orders` larini ko'radi; xaridor faqat o'zining order'larini. Buni Supabase RLS policy bilan bazada qulflang — frontendga ishonmang.

---

## 6. Order status modeli (state machine)

| Holat | Ma'no | Kim o'zgartiradi |
|---|---|---|
| `created` | Yaratildi, to'lov kutilmoqda | Xaridor |
| `paid` | To'landi, escrow ushlandi | To'lov webhook |
| `confirmed` | Sotuvchi qabul qildi | Sotuvchi |
| `shipped` | BTS ga topshirildi (tracking bor) | Sotuvchi |
| `delivered` | Yetib keldi | Admin/sotuvchi |
| `completed` | Escrow sotuvchiga o'tkazildi | Admin |
| `cancelled` | Bekor qilindi | Admin |
| `refunded` / `partially_refunded` | Qaytarildi | Admin |

Qoida: `paid` holatigacha qoldiq (`stock_rolls`) kamaytirilmaydi; `paid` bo'lganda rezerv qilinadi; `cancelled` bo'lsa qaytariladi.

---

## 7. Texnik stack (yakuniy)

| Qatlam | Texnologiya | Nega aynan shu |
|---|---|---|
| Vibe coding muhiti | **Lovable** | Texnik bo'lmagan asoschi uchun eng mos; React generatsiya qiladi |
| Frontend | **React + Vite + Tailwind**, responsive | 1 kod bazasi |
| TG Mini App | Telegram Web App SDK (o'sha React ilova) | Alohida kod yozilmaydi |
| Mobil | **PWA** (manifest + service worker) | "Telefonga o'rnatish"; native App Store keyin |
| Backend | **Supabase** (Postgres, Auth, Storage, RLS, Edge Functions) | Serversiz baza + fayl + webhook |
| Auth | Supabase Auth + **telefon OTP** | ⚠️ pastdagi eslatma |
| SMS gateway | **Eskiz.uz** yoki **Play Mobile** | Supabase default (Twilio) UZ raqamlarga yetkazmasligi mumkin — lokal gateway Edge Function orqali |
| To'lov | **Payme yoki Click** (MVP da bittasi) | Webhook'lar Supabase Edge Function da; idempotentlik majburiy |
| Bildirishnoma | **Telegram Bot API** | Auditoriya Telegramda |
| Hosting | **Vercel** (frontend) + Supabase (backend) | Bepul boshlanadi |

**Eng muhim 3 texnik eslatma:**
1. **SMS** — UZ raqamlariga yetkazish Supabase'ning standart provayderi bilan ishlamasligi mumkin. Eskiz.uz/Play Mobile ni alohida budjetlang va Edge Function orqali ulang.
2. **To'lov webhook idempotentligi** — Payme/Click bir xil bildirishnomani bir necha marta yuborishi mumkin; `provider_txn_id` bo'yicha takrorni bloklang, aks holda ikki marta hisoblanadi.
3. **Escrow/refund** — bu joy **mustaqil texnik audit** talab qiladi (productiondan oldin). MVP da qo'lda settlement bilan boshlang.

---

## 8. 8 haftalik reja

| Hafta | Maqsad | Natija |
|---|---|---|
| 1 | Setup + data model + auth | Telefon OTP kirish ishlaydi, jadvallar + RLS |
| 2 | Katalog (o'qish) | Rulon ro'yxati, detal sahifa, filtr |
| 3 | Savat + order yaratish | `created` order, 1 sotuvchi cheklovi |
| 4 | To'lov integratsiya | Payme/Click + webhook → `paid`, escrow yozuvi |
| 5 | Kuzatuv + bildirishnoma | Status bosqichlari, Telegram xabar |
| 6 | Sotuvchi kabineti | SKU/qoldiq CRUD, kelgan order, status yangilash |
| 7 | Admin panel | Settlement, refund, BTS tracking kiritish |
| 8 | Test + pilot | 30+ tikuvchi onboarding, bug-fix, soft launch |

> Agar hafta 4 (to'lov) kechiksa — bu odatiy holat. To'lov + escrow odatda butun loyihaning eng ko'p vaqt yeyadigan 20% i. Buni oldindan rejaga qo'shing.

---

## 9. Xavflar va audit

| Xavf | Ehtimol | Yumshatish |
|---|---|---|
| To'lov ikki marta hisoblanishi | Yuqori | Idempotent webhook (`provider_txn_id`) |
| Sotuvchi begona ma'lumot ko'rishi | Yuqori | Supabase RLS policy |
| SMS yetib bormasligi (UZ) | Yuqori | Lokal gateway + zaxira kanal |
| Escrow/refund xatosi (pul) | O'rta-yuqori | Qo'lda settlement + **mustaqil audit** |
| 8 haftaga sig'maslik | O'rta | Scope kesish (§2), kabinetni admin-boshqaruvga vaqtincha tushirish |

---

## 10. Ochiq savollar (keyingi darsda hal qilamiz)

1. **Qaysi viloyatdan** boshlaysiz va 30+ tikuvchini qayerdan topasiz (jamoa/Telegram guruh/tanish)?
2. To'lovda **Payme yoki Click** — qaysi birini birinchi qilamiz? (Sotuvchilaringiz qaysi birini ko'proq ishlatadi?)
3. **Minimal buyurtma** bormi (masalan kamida 1 rulon / kamida X so'm)?
4. Yetkazib berish narxini **kim to'laydi** — xaridormi, yoki narxga qo'shilganmi?
5. Pilotning **muvaffaqiyat metrikasi** nima? (masalan: order yakunlanish %, takroriy buyurtma %)

---
*Keyingi qadam: yuqoridagi 5 ochiq savolga javob bersangiz, TTZ ni v0.2 ga yangilab, Lovable uchun aniq "build prompt" lar ketma-ketligini tayyorlayman.*
