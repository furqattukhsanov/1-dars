# Sprint 8 — Sifat tekshiruvi (Dars 15)

**Holat:** jarayonda

---

## Maqsad

Platformaning barcha funksiyalarini real foydalanuvchilar bilan sinovdan o'tkazish, xatolarni topib tuzatish.

---

## Bajariladigan vazifalar

### Xato tekshiruvi
- [ ] To'liq xaridor oqimi: ro'yxatdan o'tish → katalog → buyurtma → to'lov → yetkazib olish
  — **QISMAN (2026-07-30):** saytdan buyurtma berish va zaxira kamayishi production'da to'liq sinaldi
  (`#LM-3011`), lekin **Mini App'dan (Telegram imzosi bilan) buyurtma berish sinalmagan** va to'lov/
  yetkazib olish qismi ham sinalmagan. Band OCHIQ qoladi
- [ ] To'liq ishlab chiqaruvchi oqimi: kirish → mahsulot qo'shish → buyurtma qabul → jo'natish
  — **QISMAN (2026-07-30):** buyurtmani bekor qilishda zaxiraning qaytishi (`restoreStock`) SQL
  tranzaksiyada sinaldi, lekin **sotuvchining botga mahsulot rasmini yuborishi sinalmagan** (qo'lda
  bajarilishi kerak). Band OCHIQ qoladi
- [ ] Admin oqimi: tasdiqlash → escrow → bahsli holat → qaror
  — **QISMAN (2026-07-30):** 6 ta himoyalangan endpoint tokensiz 401 qaytarishi tasdiqlandi (ruxsat
  darvozalari), lekin **moderatsiya navbatida rasm + zaxira ko'rinishi tekshirilmagan**. Band OCHIQ qoladi
- [ ] To'lov xatolari: bekor qilish, vaqt tugashi, ikki marta to'lash
- [ ] Qaytarish oqimi: xaridor muammo bildiradi → moderator qaror beradi → pul qaytariladi

### Pilot foydalanuvchilar
- [ ] 3–5 ta tanish xaridor bilan real buyurtma sinovlari
- [ ] 2–3 ta ishlab chiqaruvchi bilan kabinet sinovlari
- [ ] Xato va shikoyatlarni yig'ish

### Ishlash tekshiruvi
- [ ] Sahifalar yuklanish tezligi (3 soniyadan kam)
- [ ] Mobil da barcha funksiyalar ishlashi
- [ ] To'lov webhook larning ishonchliligi

### Tuzatishlar
- [ ] Pilot dan kelgan xatolarni tuzatish
- [ ] UX muammolarini hal qilish

---

## Qilingan ishlar

- [2026-07-30] **Sprint 8 rasman boshlandi — zaxira oqimi production'da end-to-end sinaldi va sinov
  ikkita jiddiy DEPLOY teshigini ochib berdi.**

  **1. Zaxira oqimi sinovi (production, haqiqiy baza).** Sinalgani: haqiqiy sayt buyurtmasi `#LM-3011`
  zaxirani to'g'ri kamaytirgani tasdiqlandi (`ik-1402` 50→48 va boshqalar); zaxiradan ortiq buyurtma
  rad etiladi va sabab aniq son bilan qaytadi ("faqat 5 rulon qoldi"); **race condition** — 2 buyurtma
  ayni paytda oxirgi 1 rulonga yuborildi, birinchisi oldi, ikkinchisiga "tugadi" qaytdi, zaxira 0 bo'ldi
  (−1 EMAS, ya'ni atomik `UPDATE ... WHERE stock >= qty` haqiqatan himoya qilyapti); `made` mahsulot
  (`stock IS NULL` = cheksiz) 500 ta buyurtmada ham tugamadi; `restoreStock` SQL tranzaksiyada sinaldi
  (0→1, `ROLLBACK` bilan qaytarildi). Sinov buyurtmalari (`#LM-3012`, `#LM-3013`) o'chirildi va zaxira
  baseline'ga qaytarildi — production bazasida sinov chiqindisi qolmadi. Ruxsat darvozalari alohida
  tekshirildi: 6 ta himoyalangan endpoint tokensiz **401** qaytaradi.

  **2. Sinov davomida topilgan deploy teshiklari** (tafsilot `sprint-1.md`da, tuzatish `c6350a1`):
  CI landing PWA fayllarini serverga umuman chiqarmayotgan ekan, va Mini App uchun deploy qadami
  butunlay yo'q ekan — Mini App **27-iyuldan beri** eskirgan turgan (`app.js?v=47`, jonli kod `v52`).
  Ya'ni oxirgi uch sessiyaning BUTUN Mini App ishi (PWA, mahsulot rasmi UI, logistika narxi qatori,
  zaxira ko'rsatkichi) foydalanuvchilarga umuman yetib bormagan. Bu Sprint 8 ning asosiy qiymati:
  band sifatida rejalashtirilmagan, sinov paytida qo'lga tushgan.

  **3. Deploy tuzatilgandan keyin ikkinchi qatlam nuqson** (tafsilot `sprint-5.md`da, tuzatish `5ffe1f0`):
  fayllar joyiga yetib borgandan keyin ham jonli saytda service worker ro'yxatdan o'tmadi — `pwa.js`
  `load` hodisasiga bog'liq edi. Tuzatilgandan keyin jonli saytda yakuniy holat: `scope:
  https://lolamarket.uz/`, `active: true`, kesh `lolamarket-web-v1` yaratildi.

  **Founder qo'lda bajardi:** nginx'ga `/sw.js` va `/manifest.json` uchun no-cache qoidalari qo'shildi
  (kanonik nusxa serverda: `/etc/nginx/sites-available/lolamarket`) — bu `sprint-5.md`dagi 2026-07-28
  "ochiq ish"ni yopadi; Cloudflare keshi tozalandi.

  **Hali qilinmagan (founder qo'lda bajarishi kerak, agentda imkon yo'q):** sotuvchining botga mahsulot
  rasmini yuborishi; admin panel moderatsiyasida rasm + zaxira ko'rinishini tekshirish; Mini App'dan
  (Telegram imzosi bilan) buyurtma berish.

- [2026-07-30] _(shu kunning erta yozuvi — yuqoridagi sinovdan OLDINGI holat)_ Sprint 8 hali rasman boshlanmagan, lekin "Sahifalar yuklanish tezligi (3 soniyadan kam)" bandiga tegishli tayyorgarlik ko'rildi: bir nechta og'ir landing rasmi siqildi (masalan `Photo/Main/hero-fabrics.jpg` 7.8MB PNG → 413KB JPEG, tafsilot `sprint-5.md`da) va landing PWA'ga aylantirildi (service worker, offline sahifa — shu ham `sprint-5.md`da). Haqiqiy sahifa yuklanish tezligi hali o'lchanmagan/sinalmagan, band ochiq qoladi

---

## Qarorlar

- [2026-07-30] Qaror: **production bazasida o'tkazilgan sinov o'z chiqindisini o'zi tozalaydi.** Sinov
  buyurtmalari (`#LM-3012`, `#LM-3013`) sinovdan keyin o'chirildi va zaxira baseline'ga qaytarildi.
  Sabab: bazada haqiqiy buyurtmalar bilan aralashgan sinov qatorlari komissiya hisobotini va zaxira
  sonini soxtalashtiradi — keyinchalik qaysi qator haqiqiy ekanini ajratib bo'lmay qoladi
- [2026-07-30] Qaror: **"deploy qilindi" degan gap jonli tekshiruvsiz yozilmaydi.** 2026-07-28 va
  2026-07-30 da PWA "deploy qilindi" deb yozilgan edi, aslida fayllar serverga umuman chiqmagan.
  Sabab: CI muvaffaqiyatli tugashi fayl yetib borganini ANGLATMAYDI — `source` ro'yxati aynan sanab
  o'tadi, unga tushmagan fayl jimgina tushib qoladi. Endi tekshiruv CI ning o'zida avtomatik
  (`sprint-1.md`dagi qarorga qarang)
