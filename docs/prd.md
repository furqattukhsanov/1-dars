# LolaMarket — Founder PRD

**Versiya:** v1.0 · **Asos:** Grill-me suhbati (2026-06-28)
**Maqsad:** Non-texnik, sodda, founder uchun yo'l xaritasi

---

## 1. Muammo va Yechim

**Muammo:**
O'zbekiston to'qima xaridorlari (tikuvchilar, do'konlar, savdogarlar) hozirda Telegram va OLX orqali ishlab chiqaruvchilarni topadi. Bu yerda sifat kafolati yo'q, aldanish xavfi bor, to'lov xavfsizligi ta'minlanmagan.

**Yechim:**
LolaMarket — faqat tasdiqlangan ishlab chiqaruvchilar ishtirok etadigan B2B to'qima web platformasi. Zappos modelida — xaridor katalogdan rulon tanlaydi, escrow orqali xavfsiz to'laydi, BTS Pochta orqali oladi. Sifat yoqmasa pul qaytariladi.

---

## 2. Kim Uchun (Foydalanuvchilar)

**Xaridor** — kiyim tikuvchilar, kichik do'konlar, bozor savdogarlari. Ulgurji to'qima qidiradi, lekin Telegramda aldanishdan qo'rqadi. Qulay to'lov va yetkazib olishni xohlaydi.

**Ishlab chiqaruvchi** — fabrikalar, ustaxonalar, to'qima ustalar. Yangi xaridorlar topishni xohlaydi, lekin marketing resurslari cheklangan. Platformaga faqat founder tasdiqidan keyin kiradi.

**Admin (Founder)** — ishlab chiqaruvchilarni qo'lda tasdiqlaydi, bahsli holatlarni hal qiladi, escrow harakatini nazorat qiladi.

---

## 3. Asosiy Funksiyalar (MVP uchun 3 ta)

**1. Katalog va Buyurtma**
Xaridor kategoriya (chit, atlas, gilam, sitsa) va narx bo'yicha filtrlaydi. Mahsulot kartochkasida rasm, narx/rulon, mavjud rulon soni, ishlab chiqaruvchi reytingi ko'rinadi. Minimum buyurtma — 1 rulon.

**2. Xavfsiz To'lov (Escrow)**
Xaridor Payme yoki Click orqali to'laydi. Pul platformada saqlanadi. Mahsulot yetib borgach va muammo bo'lmasa — ishlab chiqaruvchiga o'tadi, 10–12% komissiya ayirilib.

**3. Yetkazib Berish va Qaytarish**
BTS Pochta (200+ nuqta) orqali butun O'zbekistonga yetkaziladi. Xaridor eng yaqin BTS nuqtasini platformada ko'radi. Sifat yoqmasa to'liq pul qaytariladi. Logistika xarajatini aybdor tomon to'laydi. Bahsli holatlarda moderator 24 soat ichida qaror beradi.

---

## 4. "Keyingi Versiya" Ro'yxati

- Mobil ilova (iOS va Android)
- Ishlab chiqaruvchi o'z-o'zini ro'yxatdan o'tkazishi (hozircha founder qo'lda qiladi)
- Onboarding rag'bati — birinchi N ta buyurtmada komissiyasiz (hali qaror qilinmagan)
- Qo'shimcha filtrlar: rang, mintaqa, mavjud rulon soni
- Ko'p logistika partnyor: Uzum Logistics, Yandex Delivery
- Ishlab chiqaruvchi analitika paneli
- Avtomatik moderatsiya (AI yordamida)

---

## 5. Ma'lumot Modeli

**Asosiy ob'ektlar va ular orasidagi bog'lanish:**

```
Foydalanuvchi (rol: xaridor / ishlab chiqaruvchi / admin)
    │
    ├── Ishlab chiqaruvchi ──► ko'p Mahsulot
    │                              │
    │                              ▼
    └── Xaridor ──────────► Buyurtma (1 rulon dan)
                                   │
                          ┌────────┴─────────┐
                          ▼                  ▼
                       To'lov           BTS Nuqtasi
                    (escrow holatda)   (yetkazish manzili)
                          │
                    Bahsli Holat (ixtiyoriy)
                    (rasm/video + moderator qarori)
```

| Ob'ekt | Asosiy ma'lumotlar |
|---|---|
| Foydalanuvchi | ism, telefon, rol |
| Ishlab chiqaruvchi | kompaniya, manzil, tasdiq holati, reyting |
| Mahsulot | kategoriya, narx/rulon, rulon soni, rasm |
| Buyurtma | xaridor, mahsulot, miqdor, holat |
| To'lov | summa, komissiya, escrow holati |
| Bahsli holat | sabab, dalil (rasm/video), qaror, kim aybdor |
| BTS Nuqtasi | manzil, shahar, kod |

---

## 6. Tashqi Servislar

| Servis | Nima uchun |
|---|---|
| **Payme** | Xaridordan to'lov qabul qilish (escrow) |
| **Click** | Xaridordan to'lov qabul qilish (escrow) |
| **BTS Pochta API** | Eng yaqin yetkazish nuqtasini ko'rsatish va jo'natma kuzatuvi |

---

## 7. Universal Pattern Jadvali

| Pattern | LolaMarket da aniq javob |
|---|---|
| **Kim foydalanuvchi va qanday rollar** (→ Dars 10) | **Xaridor** — katalogdan tanlaydi, to'laydi, yetkazib oladi · **Ishlab chiqaruvchi** — mahsulot qo'shadi, buyurtma qabul qiladi, komissiya to'laydi · **Admin** — tasdiqlaydi, bahslarni 24 soatda hal qiladi |
| **Asosiy amal — mahsulotning yuragi** (→ Dars 11) | Xaridor 1+ rulon tanlaydi → Payme/Click orqali escrow to'laydi → BTS Pochta yetkazadi → pul ishlab chiqaruvchiga o'tadi (−10–12%) |
| **Ma'lumot modeli: ob'ektlar va bog'lanishlar** (→ Dars 9) | Mahsulot (ishlab chiqaruvchiga tegishli) → Buyurtma (xaridor yaratadi) → To'lov (escrow) → BTS Nuqtasi (yetkazish) → ixtiyoriy Bahsli Holat |
| **Qaysi tashqi servislar kerak** (→ Dars 13) | Payme + Click (to'lov, escrow) · BTS Pochta API (logistika, nuqta ko'rsatish) |
| **Admin nimani boshqaradi** (→ Dars 14) | Yangi ishlab chiqaruvchilarni tasdiqlash · bahsli holatlarda qaror (24 soat) · escrow dan ishlab chiqaruvchiga pul o'tkazish · refund qilish |
