# PRD — Rulon (Product Requirements Document)

**Loyiha:** B2B mato (rulon) marketplace
**Versiya:** v0.1 · **Asos:** brief.md + texnik-topshiriq.md + discovery
**O'qish tartibi:** Brief (nima uchun) → **PRD (nima qilinadi)** → TTZ (qanday quriladi)

---

## 1. Qisqacha (overview)

Viloyat tikuvchilari 10 rulon mato olish uchun Toshkentga borib-kelmoqda — vaqt, yo'l, tunash xarajati. **Rulon** bu offline bozorni bitta ilovaga ko'chiradi: katalog → buyurtma → oldindan to'lov (escrow) → kuzatuv → yetkazib berish. Sotuvchidan har buyurtmada **15% komissiya**.

---

## 2. Maqsad va muvaffaqiyat metrikalari

| Metrika | Ta'rif | Pilot maqsadi (taklif — tasdiqlanadi) |
|---|---|---|
| Order yakunlanish % | `paid` → `completed` ga yetgan orderlar ulushi | ≥ 70% |
| Takroriy buyurtma % | Pilot davrida 2+ marta order bergan xaridorlar | ≥ 30% |
| To'lov muvaffaqiyati % | Boshlangan to'lovlarning muvaffaqiyatli yakuni | ≥ 90% |

> Maqsad raqamlari taklif — birinchi 2 hafta ma'lumotidan keyin aniqlang.

---

## 3. Foydalanuvchi personalari

| Persona | Tavsif | Asosiy ehtiyoj | Og'riq nuqtasi |
|---|---|---|---|
| Tikuvchi (xaridor) | Viloyatdagi atelye/do'kon egasi | Toshkentga bormay mato olish | Yo'l xarajati, vaqt, trend mato kechikishi |
| Ulgurji sotuvchi | Toshkent bazasidagi sotuvchi | Yangi viloyat mijozlari | Yangi kanal, ishonchli to'lov |
| Admin (siz) | Platforma operatori | Escrow, refund, nizo boshqaruvi | Qo'lda jarayonlar (MVP da) |

---

## 4. Tasdiqlangan qarorlar va taxminlar

| Soha | Qaror |
|---|---|
| Pul oqimi | Escrow — platforma ushlaydi, qo'lda settlement (MVP) |
| Daromad | Sotuvchidan 15% komissiya |
| Qaytarish | Qisman qaytarish, admin qo'lda |
| Sotuvchilar | 3–10 ta, multi-vendor (1 order = 1 sotuvchi) |
| Qoldiq | Sotuvchi qo'lda kiritadi |
| Narx | Faqat rulonlab |
| Min. buyurtma | 1 rulondan |
| Logistika | BTS, tracking raqami qo'lda |
| To'lov | **Payme + Click ikkalasi MVP da** (sequencing tavsiya etiladi) |
| Yetkazib berish narxi | **Xaridor alohida to'laydi** (narxdan ajratilgan) |
| Platforma | Bitta responsive React/PWA = web + TG Mini App + mobil |
| Auth | Telefon + SMS OTP |
| Pilot hududi | **"Hamma viloyat" so'ralgan** — ⚠️ tavsiya: bitta hududdan (Xorazm) boshlash |

**Bog'liqliklar:** Payme & Click merchant akkaunt, UZ SMS gateway (Eskiz.uz/Play Mobile), BTS hamkorlik, Telegram bot.

---

## 5. Scope — MoSCoW

| Toifa | Funksiyalar |
|---|---|
| **Must (8 hafta)** | Telefon OTP auth · katalog (ko'rish/filtr/detal) · 1-sotuvchi savat · order (min 1 rulon) · oldindan to'lov (Payme+Click) · escrow-hold yozuvi · status bosqichlari · xaridor kuzatuvi · sotuvchi kabineti · admin settlement + qo'lda refund · yetkazib berish narxi alohida · Telegram bildirishnoma |
| **Should** | BTS tracking raqami kiritish · order tarixi · qidiruv |
| **Could** | Reyting/sharh · sotuvchi analitikasi |
| **Won't (bu reliz)** | App Store/Play native ilova · avtomatik escrow split · BTS API · GPS tracking · ko'p-sotuvchili savat · AI tavsiya |

---

## 6. User Story'lar va Acceptance Criteria

### Epic 1 — Auth va profil
| ID | User story | Pri | Acceptance criteria |
|---|---|---|---|
| US-1.1 | Xaridor sifatida telefon + SMS kod orqali kirmoqchiman | Must | OTP yuboriladi; 3 urinish; muvaffaqiyatda sessiya ochiladi |
| US-1.2 | Foydalanuvchi sifatida rolim (xaridor/sotuvchi) va profilim bo'lsin | Must | Profil: ism, telefon, viloyat; rol bazada saqlanadi |

### Epic 2 — Katalog
| ID | User story | Pri | Acceptance criteria |
|---|---|---|---|
| US-2.1 | Xaridor sifatida rulonlar ro'yxatini ko'rmoqchiman | Must | Har karta: foto, narx/rulon, sotuvchi, qoldiq holati |
| US-2.2 | Xaridor sifatida rang/eni/tarkib bo'yicha filtrlamoqchiman | Must | Filtr bir vaqtda bir nechta bo'lishi mumkin |
| US-2.3 | Xaridor sifatida detal sahifani ko'rmoqchiman | Must | Tarkib, eni, rulonda necha metr, narx, qoldiq, foto(lar) |

### Epic 3 — Buyurtma
| ID | User story | Pri | Acceptance criteria |
|---|---|---|---|
| US-3.1 | Xaridor sifatida rulonlarni savatga qo'shmoqchiman | Must | Savat **bitta sotuvchi** bilan cheklangan; aralash bo'lsa ogohlantiriladi |
| US-3.2 | Xaridor sifatida order xulosasini ko'rmoqchiman | Must | Tovar summasi + **yetkazib berish narxi alohida** ko'rsatiladi; min 1 rulon |
| US-3.3 | Xaridor sifatida buyurtma bermoqchiman | Must | Order `created` holatida yaratiladi |

### Epic 4 — To'lov va escrow
| ID | User story | Pri | Acceptance criteria |
|---|---|---|---|
| US-4.1 | Xaridor sifatida Payme yoki Click orqali oldindan to'lamoqchiman | Must | Ikki provayder ham ishlaydi; muvaffaqiyatda `paid` |
| US-4.2 | Tizim to'lovda escrow-hold yozsin va qoldiqni rezerv qilsin | Must | `paid` da `stock_rolls` rezerv; `cancelled` da qaytadi |
| US-4.3 | To'lov webhook'i takrorda ikki marta hisoblamasin | Must | `provider_txn_id` bo'yicha idempotentlik |
| US-4.4 | Admin sifatida yetkazilgach escrowni sotuvchiga (−15%) o'tkazmoqchiman | Must | Qo'lda tasdiq → `completed`; `commission_amount` yoziladi |
| US-4.5 | Admin sifatida qisman/to'liq refund qilmoqchiman | Must | Provayder paneli orqali; DB da `refunds` yozuvi; holat yangilanadi |

### Epic 5 — Yetkazib berish va kuzatuv
| ID | User story | Pri | Acceptance criteria |
|---|---|---|---|
| US-5.1 | Sotuvchi sifatida "yo'lga chiqdi" deb belgilab BTS raqamini kiritmoqchiman | Should | `shipped`; `bts_tracking_no` saqlanadi |
| US-5.2 | Xaridor sifatida status bosqichlarini ko'rmoqchiman | Must | `paid → confirmed → shipped → delivered` ko'rinadi |
| US-5.3 | Admin/sotuvchi sifatida "yetib keldi" deb belgilamoqchiman | Must | `delivered`; tarix log'ga yoziladi |

### Epic 6 — Sotuvchi kabineti
| ID | User story | Pri | Acceptance criteria |
|---|---|---|---|
| US-6.1 | Sotuvchi sifatida SKU qo'shish/tahrir/o'chirmoqchiman | Must | Foto, tarkib, eni, rang, metr/rulon, narx, qoldiq |
| US-6.2 | Sotuvchi sifatida kelgan orderlarni ko'rib tasdiqlamoqchiman | Must | Yangi order bildirishnomasi; `confirmed` ga o'tkazish |
| US-6.3 | Sotuvchi sifatida order statusini yangilamoqchiman | Must | Faqat o'z orderlari (RLS) |

### Epic 7 — Admin
| ID | User story | Pri | Acceptance criteria |
|---|---|---|---|
| US-7.1 | Admin sifatida barcha orderlarni ko'rib settlement qilmoqchiman | Must | Filtr holat bo'yicha; komissiya hisobi ko'rinadi |
| US-7.2 | Admin sifatida refund va nizolarni boshqarmoqchiman | Must | Refund yaratish; sabab yozish |

### Epic 8 — Bildirishnoma
| ID | User story | Pri | Acceptance criteria |
|---|---|---|---|
| US-8.1 | Xaridor sifatida status o'zgarganda Telegram xabar olmoqchiman | Must | Har holat o'zgarishida xabar |
| US-8.2 | Sotuvchi sifatida yangi orderda Telegram xabar olmoqchiman | Must | Order `paid` bo'lganda xabar |

---

## 7. Nofunksional talablar

| Soha | Talab |
|---|---|
| Xavfsizlik | Supabase RLS — har rol faqat o'z ma'lumotini ko'radi |
| To'lov | Idempotent webhook; ikki marta hisoblash bloklanadi |
| SMS | UZ gateway (Eskiz.uz/Play Mobile) — yetkazish kafolati |
| Ishlash | ~30+ foydalanuvchiga yetarli; og'ir yuk yo'q |
| Escrow/refund | MVP qo'lda; **productiondan oldin mustaqil audit** |
| Til | Interfeys o'zbekcha |

---

## 8. Xavflar va ochiq savollar

| Element | Status | Izoh / tavsiya |
|---|---|---|
| Payme + Click ikkalasi 8 haftada | Xavf | Bittasini hafta 4, ikkinchisini hafta 7 — sequencing |
| "Hamma viloyat" pilot | Ochiq | Bitta hududdan (Xorazm) boshlash kuchliroq — yakuniy qaror sizniki |
| 30+ tikuvchini qayerdan topish | Ochiq | Manba aniqlanmagan (tanish bazasi / Telegram guruh / bozor) |
| Pilot maqsad raqamlari | Ochiq | §2 dagi sonlar dastlabki ma'lumotdan keyin tasdiqlanadi |
| Escrow audit budjeti | Ochiq | Alohida budjetlanishi kerak |

---

## 9. Aniq scope tashqarisi (bu reliz emas)

App Store/Play native ilova · avtomatik escrow split/payout · BTS API & GPS · ko'p-sotuvchili savat · reyting/sharh · sotuvchi analitikasi · AI tavsiya.

---
*Keyingi qadam: §8 ochiq savollarini yopsangiz, PRD v1.0 ga o'tadi va Lovable uchun epic-ma-epic "build prompt" lar ketma-ketligini tayyorlayman.*
