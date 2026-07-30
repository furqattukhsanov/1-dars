# Sprint 9 — Production + launch (Dars 16)

**Holat:** kutilmoqda

---

## Maqsad

LolaMarket ni rasmiy ishga tushirish. Birinchi haqiqiy xaridorlar va ishlab chiqaruvchilarni jalb qilish.

---

## Bajariladigan vazifalar

### Production tayyorgarligi
- [ ] SSL sertifikat tekshiruvi (lolamarket.uz HTTPS)
  — **QISMAN (2026-07-31 da jonli tekshirildi).** Sertifikatning o'zi joyida va yaroqli:
  Google Trust Services (`CN=WE1`), 2026-09-15 gacha; `https://lolamarket.uz/` → 200.
  Sessiya cookie'si ham to'g'ri yozilgan — `HttpOnly; Secure; SameSite=Lax`
  (`server/routes/web-auth.js:25`), ya'ni u shifrlanmagan ulanishda umuman yuborilmaydi.
  **Ikki teshik qoldi:**
  1. `http://lolamarket.uz/` HTTPS'ga **yo'naltirilmaydi** — sayt shifrlanmagan holda
     ochilaveradi (`curl -sI http://lolamarket.uz/` → `200 OK`, `Location` yo'q).
     Ochiq Wi-Fi'da sahifaga o'zga tarkib qo'shib qo'yish mumkin; bundan tashqari
     `Secure` cookie yuborilmagani uchun foydalanuvchi `http://` da jimgina
     tizimdan chiqqan bo'lib qoladi.
  2. **HSTS sarlavhasi yo'q** (`Strict-Transport-Security`) — brauzer keyingi safar ham
     avval `http://` ga urinadi.

  Ikkalasi ham **Cloudflare panelidagi sozlama**, kodda emas: SSL/TLS → Edge Certificates →
  "Always Use HTTPS" va "HSTS" yoqilsin. **Founder bajaradi** (agentga Cloudflare kirishi
  yo'q, `deploy-bloklanadigan-amallar` bilan bir toifada). Yoqilgandan keyin tekshirish:
  ```
  curl -sI http://lolamarket.uz/ | head -3          # 301 va Location: https://… bo'lsin
  curl -sI https://lolamarket.uz/ | grep -i strict  # HSTS sarlavhasi chiqsin
  ```
- [ ] Muhit o'zgaruvchilari (env vars) production uchun sozlash
  — **AMALDA BAJARILGAN, lekin bugun qayta tasdiqlanmadi.** `/opt/lolamarket-notify/.env`
  (600 huquq, git'ga kirmaydi) Sprint 2/3 da to'ldirilgan; bilvosita dalil — jonli
  `GET /api/products` bazadan haqiqiy ma'lumot qaytaryapti, ya'ni `DATABASE_URL` va bot
  tokeni joyida. To'g'ridan-to'g'ri tekshirish SSH talab qiladi va bu sessiyada bloklandi
- [ ] Ma'lumotlar bazasi zaxira nusxasi (backup) sozlash
  — **SOZLANGAN (2026-07-23), lekin ISHLAYOTGANI hech qachon tekshirilmagan.**
  `/opt/lolamarket-notify/pg-backup.sh`, cron har kuni 03:30, `/opt/lolamarket-backups/`,
  7 kun saqlanadi. ⚠️ "Sozladim ≠ ishlayapti" — bu Sprint 8 dagi PWA darsining aynan o'zi
  (CI muvaffaqiyatli tugagan edi, fayl esa serverga chiqmagandi). **Founder bir marta
  bajarsin** — oxirgi zaxira fayli bugungi sanada va bo'sh emasligi ko'rinsin:
  ```
  ssh root@65.21.180.44 'ls -lt /opt/lolamarket-backups/ | head -5'
  ```
  Zaxira faylining tiklanishi (restore) esa umuman sinalmagan — buzilgan zaxira zaxira emas
- [ ] Xato monitoring ulash (Sentry yoki shunga o'xshash) — **bloklangan:** akkaunt kerak
- [ ] Payme va Click production akkauntlarga o'tish — **bloklangan:** merchant kalitlari kerak.
  Launch'ning YAGONA haqiqiy to'sig'i — platformaning qolgan qismi uchidan-uchiga ishlaydi

### Ishlab chiqaruvchilarni yuklash
- [ ] 20–30 ta shaxsiy tanish ishlab chiqaruvchini taklif qilish
- [ ] Har birini qo'lda tasdiqlash va onboarding
- [ ] Mahsulotlarini katalogga qo'shishda yordam berish

### Marketing (birinchi to'lqin)
- [ ] Telegram kanalda e'lon: "LolaMarket ochildi"
- [ ] Instagram da targetted reklama: "to'qima ulgurji" auditoriyasi
- [ ] Birinchi 50 xaridorga maxsus taklif (agar qaror qilinsa)

### Launch
- [ ] Yumshoq ochilish (soft launch): faqat tanishlar
- [ ] Birinchi 10 buyurtma kuzatuvi va qo'lda yordam
- [ ] Muammolarni darhol tuzatish (hotfix rejimi)
- [ ] Rasmiy e'lon: ommaviy launch

### Muvaffaqiyat metrikalari (birinchi 30 kun)
- [ ] 20+ tasdiqlangan ishlab chiqaruvchi
- [ ] 50+ xaridor ro'yxatdan o'tgan
- [ ] 30+ muvaffaqiyatli buyurtma yakunlangan
- [ ] 0 hal qilinmagan bahsli holat

---

## Qilingan ishlar

- [2026-07-31] **"Production tayyorgarligi" bo'limi jonli tekshiruvdan o'tkazildi (TOZALASH).**
  Beshta band ham "kutilmoqda" bo'lib turardi, aslida uchtasi allaqachon qilingan edi — lekin
  ularni oddiygina `[x]` qilib qo'yish noto'g'ri bo'lardi, chunki tekshirganda ikkita
  haqiqiy teshik chiqdi: `http://` HTTPS'ga yo'naltirilmaydi va HSTS yo'q. Zaxira esa
  sozlangan, ammo ishlayotgani bir marta ham ko'z bilan ko'rilmagan. Har bandning yonida
  endi DALIL va kim bajarishi yozilgan

---

## Qarorlar

- [2026-07-31] Qaror: **sprint bandi "sozlandi" degani uchun `[x]` qilinmaydi — dalil
  ko'rsatilishi kerak.** Sprint 9 ning uchta bandi (SSL, env, backup) "allaqachon bajarilgan"
  deb hisoblanardi; jonli tekshiruv ikkitasida kamchilik borligini ko'rsatdi. Sabab: bu
  Sprint 8 dagi PWA darsining takrori — CI yashil edi, fayllar esa serverga chiqmagandi
  (`sprint-1.md`, `sprint-8.md`). Shu sababli har band yoniga (a) qanday tekshirilgani,
  (b) qachon, (c) tekshirilmagan qismi qaysi ekani yoziladi
