# Dizayn spetsifikatsiyasi — Sprint 0'ning qolgan ekranlari

**Sana:** 2026-07-25
**Manba:** dizayner agenti auditi
**Maqsad:** Sprint 0'ni yopish uchun qolgan 3 ish — ishlab chiqaruvchi user flow, buyurtma/checkout ekrani, ishlab chiqaruvchi kabineti.

> Dizayn tizimining yagona manbasi — `telegram-app/styles.css`. Quyidagi ekranlar yangi
> komponent yaratmaydi, mavjud naqshlarni qayta ishlatadi (PAY radio, STATUS_STAGES
> stepper, segmented tab, glass kartochka, main-btn-bar, CATS chiplari).

---

## 1. Ishlab chiqaruvchi user flow

**Chegara (PRD §9):** o'z-o'zini ro'yxatdan o'tkazish MVP'dan tashqarida — founder qo'lda
tasdiqlaydi, birinchilar shaxsiy tanishlar. Barcha bildirishnomalar mavjud
`@lolamarketbot` + `lolamarket-notify` relay orqali.

| Qadam | Nima bo'ladi | Qayerda |
|---|---|---|
| Q1. Ariza | Bot 4 savol beradi: korxona nomi → shahar → mahsulot turi → telefon (`request_contact`) | Bot suhbati, Mini App'siz |
| Q2. Tasdiqlash | Founder admin panelda tasdiqlaydi → bot "Tabriklaymiz, tasdiqlangan sotuvchisiz" + Mini App tugmasi. Kutish holati profilda sariq pill (`tone-saffron`) | Admin panel + bot |
| Q3. Mahsulot qo'shish | Rol `initData` orqali keladi, nav "Sotuvchi rejimi"ga o'tadi. Birinchi kirishda bo'sh holat ekrani | Mini App |
| Q4. Buyurtma olish | Bot: "Yangi buyurtma #LM-3012 … escrow'da saqlanmoqda" + deep link. Kabinetda **Qabul qilish / Rad etish** | Bot + kabinet |
| Q5. Jo'natish | "Jo'natildi" holatiga o'tkazadi + BTS trek-raqamini kiritadi (`--font-mono`). Xaridorga bot xabari | Kabinet |
| Q6. Pul olish | Escrow ozod: bot "1 314 000 so'm o'tkazildi (komissiya 10%: −146 000)" | Bot + Balans |

### Taqqoslama diagramma

```
XARIDOR (kodda mavjud)                 ISHLAB CHIQARUVCHI (yangi)
──────────────────────                 ──────────────────────────
Katalog → mahsulot → savat             Bot ariza (4 savol)
        ↓                                      ↓
Checkout: BTS + to'lov                 [Admin tasdiqlaydi] ← yagona qo'lda qadam
        ↓                                      ↓
To'lov escrow'ga tushadi ──────────►   Bot: "Yangi buyurtma" xabari
        ↓                                      ↓
Kutadi (stepper: tasdiq)   ◄────────   Qabul qiladi / rad etadi
        ↓                                      ↓
Bot: "Jo'natildi" + trek   ◄────────   Jo'natadi, trek kiritadi
        ↓                                      ↓
BTS'dan oladi, qabul qiladi ────────►  Escrow ozod: bot "pul o'tkazildi"
        ↓                                      ↓
Reyting qoldiradi ─────────────────►   Reytingda ko'rinadi
```

**Simmetriya qoidasi:** har holat o'zgarishi ikkala tomonga bot xabari yuboradi; ekranlar
bitta `STATUS_STAGES` / `STATUS_TXT` lug'atini ishlatadi, faqat fe'l boshqacha
("Tasdiq kutilmoqda" → "Qabul qiling").

---

## 2. Buyurtma berish ekrani (checkout)

Ko'p qadamli wizard EMAS — bitta skrollda tartiblangan bo'limlar; faqat BTS tanlash
bottom-sheet'ga chiqadi (200+ nuqtani inline joylashtirib bo'lmaydi).

```
┌──────────────────────────────────┐
│ ← Buyurtma berish        (header)│  mavjud header, o'zgarmaydi
├──────────────────────────────────┤
│ 1 · BUYURTMA TARKIBI             │  seksiya sarlavhasi 11px/700/uppercase
│ ┌──────────────────────────────┐ │
│ │ [rasm] Qo'lbola adras        │ │
│ │        2 rulon    1 460 000  │ │  glass kartochka rgba(255,255,255,.62)
│ │ [−]  2 rulon  [+]            │ │  miqdor shu yerda o'zgaradi —
│ └──────────────────────────────┘ │  savatga qaytish shart emas
│                                  │
│ 2 · OLISH NUQTASI (BTS)          │
│ ┌──────────────────────────────┐ │
│ │ 📍 BTS №112 — Chilonzor      │ │
│ │ Toshkent, Bunyodkor 45       │ │
│ │ 9:00–19:00     [O'zgartirish]│ │  teal-600 havola (changeAddr naqshi)
│ └──────────────────────────────┘ │  tanlanmagan holat: shtrix qirrali
│                                  │  "Nuqta tanlang ›" tugmasi
│ 3 · TO'LOV                       │
│ ( ) Payme     (•) Click          │  mavjud PAY radio, ro'yxat qisqaradi
│ ┌──────────────────────────────┐ │
│ │ 🛡 To'lovingiz escrow'da      │ │  escrow radio VARIANTI emas — rejim.
│ │ saqlanadi. Matoni qabul      │ │  Doimiy teal-50 banner, ikkala
│ │ qilgach sotuvchiga o'tadi.   │ │  usulda ham amal qiladi
│ └──────────────────────────────┘ │
│                                  │
│ 4 · IZOH (ixtiyoriy)             │  mavjud textarea
│                                  │
│ ─── hisob-kitob ───              │
│ Mahsulotlar          1 460 000   │
│ Yetkazish (BTS) BTS'da to'lanadi │  BTS ulangach raqam qo'yiladi
│ ─────────────────────────────    │
│ Hozir to'lanadi        730 000   │  50% oldindan — qalin, ink-900
│ Qabul qilganda         730 000   │  ink-500, yengilroq
├──────────────────────────────────┤
│ [ Hozir to'lash ]                │  mavjud main-btn-bar (suzuvchi glass)
│   730 000 so'm                   │  JAMI emas, oldindan to'lov summasi
└──────────────────────────────────┘
```

Tasdiqlash tugmasi BTS tanlanmaguncha o'chirilgan (`opacity: .45` + toast "Avval olish
nuqtasini tanlang").

### BTS bottom-sheet — 200+ nuqta muammosi

Ikki bosqichli filtr, bitta sheet ichida:

```
┌──────────────────────────────────┐
│ ━━ (tortish dastagi)             │  --radius-xl yuqori burchak,
│ Olish nuqtasini tanlang          │  --glass-fill-strong + --blur-lg
│ [ 🔍 Nuqta yoki manzil qidiring ]│  (suzuvchi element — shisha qoidasiga mos)
│ [Toshkent][Farg'ona][Buxoro][…]  │  1-bosqich: viloyat chiplari (CATS naqshi)
│ 27 nuqta topildi                 │  standart tanlov: profildagi shahar
│ ┌──────────────────────────────┐ │
│ │ BTS №112 — Chilonzor    (•)  │ │  2-bosqich: searchRow qatorlari +
│ │ Bunyodkor 45 · 9:00–19:00    │ │  PAY radio doirachasi
│ ├──────────────────────────────┤ │
│ │ BTS №097 — Yunusobod    ( )  │ │
│ └──────────────────────────────┘ │
│ [ Tanlash ]                      │  anor gradient, sheet ichida qadalgan
└──────────────────────────────────┘
```

- Geolokatsiya so'ralmaydi (BTS API'siz ham ishlashi kerak; "eng yaqini" saralash → Sprint 6).
- Oxirgi tanlangan nuqta `localStorage`'da saqlanadi (`loadOrders()` naqshi) — B2B xaridor
  deyarli doim bitta nuqtadan oladi, bu eng katta ishqalanish qisqartmasi.
- Sheet qatorlariga `backdrop-filter` qo'yilmaydi (shisha-ustida-shisha taqiqi).

**Yangi holat kalitlari:** `btsRegion`, `btsPoint`, `btsSheetOpen`.
**Yangi STR kalitlari:** `pickPoint`, `pointsFound`, `pickupPoint`, `escrowBanner`, `deliveryAtPickup`.

---

## 3. Ishlab chiqaruvchi kabineti

### Qaror: alohida sahifa emas — Mini App ichida rol-rejimi

Sabablari:
1. Auditoriya Telegramda, bot bitta, auth `initData` orqali allaqachon ishlaydi — ikkinchi
   ilova ikkinchi marta ishonch qozonishni talab qiladi;
2. Dizayn tizimi yagona manba qoidasi (2026-07-22) — alohida sahifa ikkinchi parallel tizim xavfi;
3. Ishlab chiqaruvchilarning ko'pi ayni paytda xaridor ham (fabrika boshqa fabrikadan ip-mato oladi).

Rol backend'dan keladi — oddiy foydalanuvchi sotuvchi UI'sini umuman ko'rmaydi.
Admin panel alohida qoladi (mavjud qaror).

Sotuvchi rejimida 5 tab: **Do'kon · Mahsulotlar · Buyurtmalar · Balans · Profil**.
Profil ichida "Xaridor rejimiga qaytish" qatori. `nav-lens` mexanikasi o'zgarmaydi.

### 3a. Mahsulotlar

```
┌──────────────────────────────────┐
│ Mahsulotlarim            (header)│
│ [Faol 6] [Yashirin 2]            │  segmented tab (renderOrders naqshi)
│ ┌──────────────────────────────┐ │
│ │ [rasm] Qo'lbola adras        │ │
│ │ 730 000 so'm · 14 rulon      │ │  searchRow + qoldiq soni
│ │ ● Sotuvda        [✎] [⋯]    │ │  STOCK_COLOR nuqtasi;
│ └──────────────────────────────┘ │  [⋯]: Yashirish / O'chirish
│                       ( + )      │  suzuvchi FAB, anor gradient
└──────────────────────────────────┘
```

- **Forma ekrani** (`screen: 'p-form'`): rasm (Telegram orqali yuklash), nom UZ/RU,
  kategoriya (CATS chiplari), narx/rulon (`--font-mono`), rulon soni, eni/zichlik/tarkib,
  yetkazish muddati. Pastda main-btn-bar: "Saqlash".
- **O'chirish** faol buyurtmasi bo'lmasa darhol; bo'lsa faqat "Yashirish" (buyurtma
  tarixini buzmaslik uchun). Tasdiq — Telegram native `showConfirm`.

### 3b. Buyurtmalar

Xaridorning `renderOrders()` skeleti, tab'lar: **Yangi · Jarayonda · Yakunlangan**.

- "Yangi": **Qabul qilish** (anor gradient) / **Rad etish** (`danger-500` konturli) +
  nisbiy vaqt "12 daqiqa oldin" (qaytasanoq YO'Q — avtomatik bekor qilish yo'q).
  Kartochkada "Oldindan to'lov tushdi — 730 000 so'm" qatori (`--success-100` pill).
- "Jarayonda": "Jo'natildi deb belgilash" → trek-raqam maydoni inline ochiladi.
- Har kartochkada xaridor korxonasi va BTS nuqtasi ko'rinadi.
- Yangi buyurtma soni nav badge'ida (`cart-badge` qayta ishlatiladi).

### 3c. Balans

```
┌──────────────────────────────────┐
│ ┌──────────────────────────────┐ │  bosh karta: to'q anor gradient,
│ │ Escrow'da kutilmoqda         │ │  oq matn — ilovadagi yagona to'q
│ │ 1 460 000 so'm               │ │  "hero" karta, diqqatni pulga qaratadi
│ │ Chiqarilgan (jami) 14.6 mln  │ │
│ └──────────────────────────────┘ │
│ TARIX                            │
│ │ #LM-3012  +1 314 000   ✓     │   --font-mono summa, komissiya so'mda
│ │ komissiya −146 000 · 24-iyul │   ochiq (foiz yozilmaydi — offlayn
│ │ #LM-3015  oldindan  730 000  │   kelishiladi). kutilmoqda=tone-saffron,
│ │ qolgani kutilmoqda  730 000  │   chiqarilgan=success-100
└──────────────────────────────────┘
```

Escrow summasi faqat **oldindan to'langan** qismni hisobga oladi. MVP'da "Pul yechish"
tugmasi YO'Q — escrow ozod bo'lishi avtomatik (xaridor qolgan qismni to'lagach).

---

## Founder qarorlari (2026-07-25)

**1. Qabul qilish muddati — avtomatik bekor YO'Q.** Buyurtmalar tez tasdiqlanadi, taymer
kerak emas. Dizaynga ta'siri: "Yangi" kartochkadagi `--saffron-700` qaytasanoq ("23 soat
qoldi") **olib tashlanadi**, o'rniga oddiy nisbiy vaqt ("12 daqiqa oldin") ko'rsatiladi.
Avtomatik bekor qilish mantig'i backend'da ham yozilmaydi. Kechikkan buyurtmalarni founder
qo'lda kuzatadi (MVP hajmida yetarli).

**2. BTS yetkazish narxi — hozircha hisoblanmaydi.** BTS integratsiyasi ulangandan keyin
tizim avtomatik hisoblab beradi. Dizaynga ta'siri: checkout hisob-kitobida "Yetkazish (BTS)"
qatori **"BTS'da to'lanadi"** matni bilan turadi, "Jami" faqat mahsulot summasi bo'ladi.
BTS API ulangach o'sha qatorga raqam qo'yiladi — tuzilma o'zgarmaydi (dizayn ikkala
holatni ko'taradi).

**3. Komissiya — har sotuvchi bilan offlayn kelishiladi.** Yagona qat'iy foiz yo'q.
Dizaynga ta'siri: hech qayerda "10–12%" yozilmaydi; balans ekrani foizni bazadagi shu
buyurtmaning **haqiqiy qiymatidan** oladi va so'mda ko'rsatadi ("komissiya −146 000").
Bazada komissiya foizi sotuvchi profilida saqlanadi (buyurtmada emas) — kelishuv
o'zgarsa keyingi buyurtmalarga qo'llanadi.

**5. Ikki rol — ruxsat etiladi (ixtiyoriy).** Tasdiqlangan sotuvchi xohlasa xaridor
sifatida ham buyurtma bera oladi. Tavsiya qilingan rejim-almashtirish
("Xaridor rejimiga qaytish") shu bilan tasdiqlandi.

**4. To'lov modeli — QISMAN OLDINDAN TO'LOV, qolgani BTS'dan olishdan OLDIN.**
Xaridor checkout'da 50% to'laydi. Mato BTS nuqtasiga yetib kelgach xaridor qolgan 50% ni
to'laydi — **to'lamaguncha BTS mahsulotni bermaydi**. To'lov tushgach xaridorga olish kodi
beriladi, u BTS'da shu kodni ko'rsatib mahsulotni oladi.

Muhim oqibat: alohida "qabul qildim" tugmasi kerak emas — ikkinchi to'lovning tushishi
holatni avtomatik keyingi bosqichga o'tkazadi va escrow'ni ozod qiladi. Ya'ni to'lov
mahsulotni ko'rishdan OLDIN bo'ladi; xaridorning himoyasi ko'rikdan keyingi bahs
mexanizmi orqali qoladi (PRD: to'liq pul qaytariladi, aybdor logistika to'laydi).

**Oldindan to'lov ulushi: 50%** (tanlangan variantdagi namunaga ko'ra). Bu qiymat kodda
bitta konstanta bo'ladi (`PREPAY_RATE = 0.5`) — keyinchalik o'zgartirish oson.

Dizaynga ta'siri — checkout hisob-kitobi va tugmasi qayta yoziladi:

```
─── hisob-kitob ───
Mahsulotlar               1 460 000
Yetkazish (BTS)      BTS'da to'lanadi
──────────────────────────────────
Hozir to'lanadi             730 000   ← 50%, qalin, ink-900
Qabul qilganda              730 000   ← ink-500, yengilroq
──────────────────────────────────
[ Hozir to'lash — 730 000 so'm ]      ← main-btn-bar summasi
                                        JAMI emas, OLDINDAN to'lov
```

Boshqa ekranlarga ta'siri:
- **Xaridor buyurtma kartochkasi:** mato BTS'ga yetib kelgach stepper oxirgi qadami
  **"Qolganini to'lash — 730 000 so'm"** tugmasi bo'ladi (anor gradient). Tugma ustida
  qulf ikonkasi bilan izoh: "To'lovdan keyin olish kodi beriladi". To'langach o'sha joyda
  **olish kodi** katta `--font-mono` raqam bilan chiqadi ("Olish kodi: 4821") + BTS nuqtasi
  manzili — xaridor shu ekranni BTS'da ko'rsatadi.
- **Sotuvchi Balans ekrani:** "Escrow'da kutilmoqda" summasi endi faqat oldindan to'langan
  qismni ko'rsatadi; buyurtma yozuvida ikki qatorli holat — "Oldindan olindi 730 000 ·
  Qolgani kutilmoqda 730 000".
- **Bot xabarlari:** sotuvchiga yangi buyurtma xabarida "Oldindan to'lov tushdi (50%)" deb
  aniq yoziladi — sotuvchi jo'natishga ishonch hosil qiladi. Xaridorga mato BTS'ga yetib
  kelganda: *"Matoingiz BTS №112 ga yetib keldi. Olish uchun qolgan 730 000 so'mni
  to'lang"* + ilovaga tugma. To'langach: *"Olish kodi: 4821 — BTS'da shu kodni
  ko'rsating"*.
- **Yangi holat bosqichi:** `STATUS_STAGES` ga "BTS'da — to'lov kutilmoqda" bosqichi
  qo'shiladi (jo'natildi va olindi orasiga).

**Qolgan aniqlanmagan nuqta:** xaridor qolgan qismni to'lamay qo'ysa nima bo'ladi
(muddat? oldindan to'lov kuyadimi? bahs ochiladimi?). Bu Sprint 6 (to'lov integratsiyasi)
da hal qilinadi — hozirgi dizaynga ta'sir qilmaydi.
