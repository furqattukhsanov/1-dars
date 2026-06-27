# PRD — LolaMarket B2B To'qima Platformasi

## Problem Statement

O'zbekistondagi to'qima xaridorlari (kiyim tikuvchilar, do'konlar, bozor savdogarlari) hozirda Telegram guruhlar va OLX orqali ishlab chiqaruvchilarni topadi. Bu jarayonda sifat kafolati yo'q, aldanish xavfi bor, va to'lov xavfsizligi ta'minlanmagan. Ishlab chiqaruvchilar esa yangi xaridorlar topish uchun shaxsiy aloqalarga tayanadi — kengayish qiyin.

## Solution

LolaMarket — tasdiqlangan to'qima ishlab chiqaruvchilar katalogi bo'lgan B2B web platforma. Xaridor katalogdan rulon tanlaydi, escrow orqali to'laydi, BTS Pochta orqali yetkazib oladi. Sifat kafolati, qaytarish imkoniyati va moderatsiya tizimi platformani Telegram/OLX dan ajratib turadi.

## User Stories

### Xaridor (Buyer)

1. Xaridor sifatida kategoriya va narx bo'yicha mahsulot filtrlashni xohlayman, shunda kerakli rulonni tez topay.
2. Xaridor sifatida har bir ishlab chiqaruvchining reytingi va sharhlarini ko'rishni xohlayman, shunda kim ishonchli ekanini bilaman.
3. Xaridor sifatida mahsulot kartochkasida rulon narxi, mavjud rulon soni va ishlab chiqaruvchi haqida ma'lumot ko'rishni xohlayman.
4. Xaridor sifatida minimum 1 rulon buyurtma bera olishni xohlayman.
5. Xaridor sifatida Payme yoki Click orqali to'lashni xohlayman, chunki ular men uchun qulay.
6. Xaridor sifatida pul escrow da saqlanishini bilishni xohlayman, shunda aldanib qolmasam.
7. Xaridor sifatida eng yaqin BTS Pochta punktini platformada ko'rishni xohlayman, shunda yetkazib olish qulay bo'lsin.
8. Xaridor sifatida sifatsiz mahsulot kelsa qaytarishni va to'liq pulni qaytarib olishni xohlayman.
9. Xaridor sifatida bahsli holatlarda moderator 24 soat ichida qaror berishini xohlayman.
10. Xaridor sifatida buyurtma tariximni ko'rishni xohlayman.

### Ishlab Chiqaruvchi (Seller)

11. Ishlab chiqaruvchi sifatida o'z mahsulotlarimni (kategoriya, narx, rulon soni, rasm) katalogga qo'shishni xohlayman.
12. Ishlab chiqaruvchi sifatida platformadan kelgan buyurtmalarni boshqarishni xohlayman.
13. Ishlab chiqaruvchi sifatida escrow dan 10-12% komissiya ayirib to'lovimni olishni xohlayman.
14. Ishlab chiqaruvchi sifatida xaridor tomonidan sifatsiz qaytarish da'vosiga javob berishni xohlayman.
15. Ishlab chiqaruvchi sifatida o'z reytingim va sharhlarimni ko'rishni xohlayman.

### Platforma Admin (Moderator)

16. Moderator sifatida yangi ishlab chiqaruvchi so'rovlarini ko'rib, tasdiqlash yoki rad etishni xohlayman.
17. Moderator sifatida bahsli buyurtmalarda ikki tomonning dalillarini ko'rib, 24 soat ichida qaror beraman.
18. Moderator sifatida escrow dagi pul harakatini nazorat qilishni xohlayman.

## Implementation Decisions

### Biznes Model
- **Komissiya:** Ishlab chiqaruvchi har bir bitimdan **10-12%** to'laydi
- **To'lov tizimi:** Payme + Click (escrow rejimida)
- **Escrow jarayoni:** Xaridor to'laydi → pul platformada saqlanadi → mahsulot yetkazilgach va muammo bo'lmasa ishlab chiqaruvchiga o'tkaziladi

### Logistika
- **Yetkazib berish:** BTS Pochta (200+ nuqta, butun O'zbekiston)
- **Logistika narxi:** Xaridor to'laydi
- **Interfeys:** Xaridor buyurtma berayotganda eng yaqin BTS nuqtasi ko'rsatiladi (BTS API integratsiyasi)

### Katalog va Filtrlar
- **O'lchov birligi:** Rulon (metr emas — har xil bo'ladi)
- **Minimum buyurtma:** 1 rulon
- **Filtrlar:** Kategoriya (chit, atlas, gilam, sitsa) + narx oralig'i
- **Mahsulot kartochkasi:** Rasm, narx/rulon, mavjud rulon soni, ishlab chiqaruvchi reytingi

### Ishlab Chiqaruvchi Onboarding
- **Kirish:** Founder tomonidan qo'lda tasdiqlov
- **Birinchi ishlab chiqaruvchilar:** Shaxsiy tanishlar orqali

### Qaytarish va Bahslar
- **Qaytarish:** To'liq pul qaytariladi, logistika xarajati aybdor tomon zimmasida
- **Bahsli holatlar:** Xaridor rasm/video yuboradi → ishlab chiqaruvchi javob beradi → moderator 24 soat ichida qaror beradi
- **Reyting tizimi:** 5 yulduz + qisqa matn sharh

### Texnologiya
- **MVP platforma:** Web (mobil keyinroq)
- **Marketing kanallari:** Telegram kanallar + Instagram targetted ads
- **Geografiya:** Butun O'zbekiston (BTS orqali)

## Testing Decisions

- **Escrow oqimi:** To'lov → saqlash → yetkazish → chiqarish har bir bosqichi alohida testlanadi
- **Qaytarish jarayoni:** Sifatli qaytarish (logistika xaridorda) va sifatsiz qaytarish (logistika ishlab chiqaruvchida) scenariylar
- **BTS integratsiyasi:** Eng yaqin nuqta aniqlash to'g'riligi
- **Komissiya hisoblash:** 10-12% to'g'ri ayirilishi

## Out of Scope

- Mobil ilova (iOS/Android) — MVP dan keyin
- Chat/xabar tizimi — katalog va buyurtma yetarli
- Ishlab chiqaruvchi o'z-o'zini ro'yxatdan o'tkazish — hozircha qo'lda
- Ko'p valyuta — faqat so'm
- Logistika integratsiyasi (Uzum, Yandex) — faqat BTS
- Onboarding rag'batlantirish tizimi — keyinroq qaror qilinadi

## Further Notes

- Asosiy differensiatsiya: **Zappos modeli** — sifat kafolati, oson qaytarish, ishonchli to'lov
- Raqobatchilar: Telegram guruhlar, OLX — ikkalasida ham sifat nazorati va xavfsizlik yo'q
- Birinchi bosqich muvaffaqiyat metrikasi: 20-30 tasdiqlangan ishlab chiqaruvchi, 50-100 birinchi buyurtma
