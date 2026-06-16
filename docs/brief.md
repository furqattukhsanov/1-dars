# BRIEF — Rulon (ishchi nom)

> Har dars boshida shu hujjatni oching. Bu loyihaning "shimoliy yulduzi" — qaror qabul qilishda mezon.

---

## Loyiha nomi (taklif)
**Rulon** (asosiy taklif)
Muqobillar: *MatoBozor*, *Tola*, *RulonHub*

## 1 gapli tavsif
Viloyatdagi tikuvchilar va mato sotuvchilarini Toshkent ulgurji mato bazasi bilan bevosita ulovchi B2B platforma — buyurtma, oldindan to'lov va yetkazib berish kuzatuvini bir ilovada birlashtiradi, shuning uchun xaridor Toshkentga borib-kelishi shart emas.

## Target auditoriya

| Segment | Kim | Rol | Nega muhim |
|---|---|---|---|
| Asosiy (P0) | Xorazm va boshqa viloyat tikuvchilari, atelyelar, kichik mato do'konlari | Xaridor | Takroriy buyurtma, yuqori LTV, og'riq nuqtasi eng kuchli |
| Ikkilamchi (P1) | Toshkent ulgurji mato sotuvchilari / bazalar | Sotuvchi | Talab tomonidan kelganda jalb qilinadi (cold start) |

## Asosiy muammo va yechim

| | Hozir (offline) | Rulon bilan (online) |
|---|---|---|
| Logistika | 10 rulon olish uchun Xorazm → Toshkent → Xorazm shaxsan borish | Ilovadan buyurtma, mato o'zi yetib keladi |
| Xarajat | Yo'l, vaqt, tunash, dallol haqi | Faqat tovar + yetkazib berish |
| Trend mato | Uzoq muddat, noaniqlik | Katalog + aniq ETA |
| Ishonch | Faqat shaxsan ko'rib | Foto/spetsifikatsiya + (keyinroq) namuna/swatch |

**Bir gapda:** offline mavjud bozorni onlinega ko'chirish orqali borib-kelish xarajatini nolga tushirish.

## MVP funksiyalari (8 hafta, prioritet bilan)

| # | Funksiya | Prioritet | Izoh |
|---|---|---|---|
| 1 | Katalog: foto, tarkib, eni, rang, narx (metr/rulon) | **P0** | Ishonchning yarmi shu yerda |
| 2 | Buyurtma berish (rulon yoki metrlab) | **P0** | Asosiy harakat |
| 3 | Ilovada oldindan to'lov (Click/Payme) | **P0** | Pul oqimi + jiddiylik filtri |
| 4 | Buyurtma kuzatuvi + yetkazib berish ETA | **P0** | "Qachon keladi?" — eng ko'p so'raladigan savol |
| 5 | Sotuvchi kabineti (SKU, qoldiq, buyurtma boshqaruvi) | P1 | Sotuvchini avtomatlashtirish |
| 6 | Ro'yxatdan o'tish + rollar (xaridor/sotuvchi) | P1 | Telegram orqali soddalashtirish mumkin |
| 7 | Bildirishnomalar (Telegram/SMS) status o'zgarganda | P2 | Retention vositasi |

## Texnik stack tavsiya (boshlang'ich — chatda aniqlashtiramiz)

| Qatlam | Tavsiya | Nega (siz HTML/CSS bilasiz + Claude bilan ishlaysiz) |
|---|---|---|
| Frontend | Telegram Mini App **yoki** React (Lovable orqali vibe coding) | Kod yozishni Claude bajaradi; siz UI/mantiqqa fokuslanasiz |
| Backend | Supabase (Postgres + Auth + Storage) | Server kodisiz baza, autentifikatsiya, fayl saqlash |
| To'lov | Click / Payme | O'zbekiston-lokal, B2B uchun standart |
| Bildirishnoma | Telegram Bot API | Auditoriya allaqachon Telegramda |
| Hosting | Vercel (frontend) + Supabase (backend) | Bepul boshlanadi, oson deploy |

> ⚠️ **Eslatma:** to'lov/escrow mantig'i — bu yagona joy bo'lib, productionga chiqishdan oldin mustaqil texnik audit talab qiladi. Buni alohida budjetlang.

---
*Versiya: v0.1 — talab validatsiyasidan keyin yangilanadi.*
