# LolaMarket — PRD

**Versiya:** v1.0 · **Asos:** Grill-me suhbati (2026-06-28)

---

## 1. Muammo va Yechim

**Muammo:**
O'zbekiston to'qima xaridorlari (tikuvchilar, do'konlar, savdogarlar) hozirda Telegram va OLX orqali ishlab chiqaruvchilarni topadi. Bu yerda sifat kafolati yo'q, aldanish xavfi bor, to'lov xavfsizligi ta'minlanmagan. Ishlab chiqaruvchilar esa yangi xaridorlar topish uchun shaxsiy aloqalarga tayanadi — kengayish qiyin.

**Yechim:**
LolaMarket — faqat tasdiqlangan ishlab chiqaruvchilar ishtirok etadigan B2B to'qima web platformasi. Zappos modelida — xaridor katalogdan rulon tanlaydi, escrow orqali xavfsiz to'laydi, BTS Pochta orqali oladi. Sifat yoqmasa pul qaytariladi.

**Raqobatchilar:** Telegram guruhlar, OLX — ikkalasida ham sifat nazorati va xavfsizlik yo'q.

---

## 2. Foydalanuvchilar

**Xaridor** — kiyim tikuvchilar, kichik do'konlar, bozor savdogarlari. Ulgurji to'qima qidiradi, lekin Telegramda aldanishdan qo'rqadi. Qulay to'lov va yetkazib olishni xohlaydi.

**Ishlab chiqaruvchi** — fabrikalar, ustaxonalar, to'qima ustalar. Yangi xaridorlar topishni xohlaydi, lekin marketing resurslari cheklangan. Platformaga faqat founder tasdiqidan keyin kiradi.

**Admin (Founder)** — ishlab chiqaruvchilarni qo'lda tasdiqlaydi, bahsli holatlarni hal qiladi, escrow harakatini nazorat qiladi.

---

## 3. Asosiy Funksiyalar (MVP)

**1. Katalog va Buyurtma**
Xaridor kategoriya (chit, atlas, gilam, sitsa) va narx bo'yicha filtrlaydi. Mahsulot kartochkasida rasm, narx/rulon, mavjud rulon soni, ishlab chiqaruvchi reytingi ko'rinadi. Minimum buyurtma — 1 rulon.

**2. Xavfsiz To'lov (Escrow)**
Xaridor Payme yoki Click orqali to'laydi. Pul platformada saqlanadi. Mahsulot yetib borgach va muammo bo'lmasa — ishlab chiqaruvchiga o'tadi, 10–12% komissiya ayirilib.

**3. Yetkazib Berish va Qaytarish**
BTS Pochta (200+ nuqta) orqali butun O'zbekistonga yetkaziladi. Xaridor eng yaqin BTS nuqtasini platformada ko'radi. Sifat yoqmasa to'liq pul qaytariladi. Logistika xarajatini aybdor tomon to'laydi. Bahsli holatlarda moderator 24 soat ichida qaror beradi.

---

## 4. User Stories

### Xaridor

1. Kategoriya va narx bo'yicha mahsulot filtrlashni xohlayman, shunda kerakli rulonni tez topay.
2. Har bir ishlab chiqaruvchining reytingi va sharhlarini ko'rishni xohlayman, shunda kim ishonchli ekanini bilaman.
3. Mahsulot kartochkasida rulon narxi, mavjud rulon soni va ishlab chiqaruvchi haqida ma'lumot ko'rishni xohlayman.
4. Minimum 1 rulon buyurtma bera olishni xohlayman.
5. Payme yoki Click orqali to'lashni xohlayman.
6. Pul escrow da saqlanishini bilishni xohlayman, shunda aldanib qolmasam.
7. Eng yaqin BTS Pochta punktini platformada ko'rishni xohlayman.
8. Sifatsiz mahsulot kelsa qaytarishni va to'liq pulni qaytarib olishni xohlayman.
9. Bahsli holatlarda moderator 24 soat ichida qaror berishini xohlayman.
10. Buyurtma tariximni ko'rishni xohlayman.

### Ishlab Chiqaruvchi

11. Mahsulotlarimni (kategoriya, narx, rulon soni, rasm) katalogga qo'shishni xohlayman.
12. Platformadan kelgan buyurtmalarni boshqarishni xohlayman.
13. Escrow dan 10–12% komissiya ayirib to'lovimni olishni xohlayman.
14. Xaridor tomonidan sifatsiz qaytarish da'vosiga javob berishni xohlayman.
15. O'z reytingim va sharhlarimni ko'rishni xohlayman.

### Admin

16. Yangi ishlab chiqaruvchi so'rovlarini ko'rib, tasdiqlash yoki rad etishni xohlayman.
17. Bahsli buyurtmalarda ikki tomonning dalillarini ko'rib, 24 soat ichida qaror beraman.
18. Escrow dagi pul harakatini nazorat qilishni xohlayman.

---

## 5. Implementatsiya Qarorlari

| Soha | Qaror |
|---|---|
| **Komissiya** | Ishlab chiqaruvchi har bir bitimdan 10–12% to'laydi |
| **To'lov** | Payme + Click, escrow rejimida |
| **Logistika** | BTS Pochta (200+ nuqta), xaridor to'laydi |
| **O'lchov** | Rulon (metr emas — har rulonda turli metr) |
| **Minimum buyurtma** | 1 rulon |
| **Filtrlar** | Kategoriya + narx oralig'i |
| **Onboarding** | Founder qo'lda tasdiqlaydi, birinchilar — shaxsiy tanishlar |
| **Qaytarish** | To'liq pul qaytariladi, logistika — aybdor tomon zimmasida |
| **Bahslar** | Rasm/video + moderator 24 soatda qaror |
| **Reyting** | 5 yulduz + qisqa matn sharh |
| **MVP platforma** | Faqat Web (mobil keyinroq) |
| **Marketing** | Telegram kanallar + Instagram targeted ads |

---

## 6. Ma'lumot Modeli

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

## 7. Tashqi Servislar

| Servis | Nima uchun |
|---|---|
| **Payme** | Xaridordan to'lov qabul qilish (escrow) |
| **Click** | Xaridordan to'lov qabul qilish (escrow) |
| **BTS Pochta API** | Eng yaqin yetkazish nuqtasini ko'rsatish va jo'natma kuzatuvi |

---

## 8. Test Qarorlari

- **Escrow oqimi:** To'lov → saqlash → yetkazish → chiqarish — har bosqich alohida testlanadi
- **Qaytarish:** Sifatli (logistika xaridorda) va sifatsiz (logistika ishlab chiqaruvchida) scenariylar
- **BTS integratsiyasi:** Eng yaqin nuqta aniqlash to'g'riligi
- **Komissiya:** 10–12% to'g'ri ayirilishi

---

## 9. Scope Tashqarisida (MVP uchun)

- Mobil ilova (iOS/Android)
- Chat/xabar tizimi — katalog va buyurtma yetarli
- Ishlab chiqaruvchi o'z-o'zini ro'yxatdan o'tkazish
- Ko'p valyuta — faqat so'm
- Uzum Logistics, Yandex Delivery — faqat BTS
- Onboarding rag'batlantirish — keyinroq qaror qilinadi

---

## 10. Sprint Xaritasi

| Sprint | Nima | Dars |
|---|---|---|
| 0 | Dizayn va ekranlar | 7 |
| 1 | MVP skelet + deploy | 8 |
| 2 | Ma'lumotlar bazasi | 9 |
| 3 | Foydalanuvchilar + rollar | 10 |
| 4 | Asosiy funksiya (katalog, buyurtma, escrow) | 11 |
| 5 | Mobil / PWA | 12 |
| 6 | Integratsiyalar (Payme, Click, BTS) | 13 |
| 7 | Admin panel | 14 |
| 8 | Sifat tekshiruvi | 15 |
| 9 | Production + launch | 16 |

---

## 11. Muvaffaqiyat Metrikalari (birinchi 30 kun)

- 20–30 tasdiqlangan ishlab chiqaruvchi
- 50–100 birinchi buyurtma
- 0 hal qilinmagan bahsli holat
