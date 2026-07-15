# Sprint 6 — Integratsiyalar (Dars 13)

**Holat:** jarayonda

---

## Maqsad

Tashqi servislarni (Payme, Click, BTS Pochta) to'liq ishga tushirish va Telegram bildirishnomalarini ulash.

---

## Bajariladigan vazifalar

### Payme
- [ ] Merchant akkaunt ochish va API kalitlarini olish
- [ ] To'lov yaratish, webhook qabul qilish, holat yangilash
- [ ] Test rejimida to'liq oqimni sinovdan o'tkazish
- [ ] Production ga o'tish

### Click
- [ ] Merchant akkaunt ochish va API kalitlarini olish
- [ ] To'lov yaratish, webhook qabul qilish, holat yangilash
- [ ] Test rejimida sinovdan o'tkazish
- [ ] Production ga o'tish

### BTS Pochta API
- [ ] BTS API ulanish va autentifikatsiya
- [ ] Xaridor manziliga eng yaqin BTS nuqtasini aniqlash
- [ ] Jo'natma kuzatuv raqami saqlash va ko'rsatish
- [ ] BTS nuqtalari ro'yxatini bazaga yuklash (200+ nuqta)

### Telegram Bot
- [ ] Bot yaratish va token olish
- [ ] Xaridorga: buyurtma tasdiqlandi, yo'lga chiqdi, yetib keldi
- [ ] Ishlab chiqaruvchiga: yangi buyurtma keldi
- [ ] Adminga: yangi bahsli holat yaratildi

---

## Qilingan ishlar

- [2026-06-30] MVP Telegram Mini App ekranlar ro'yxati tuzildi — 8 ta ekran aniqlandi, minimal MVP uchun 5 ta ekran belgilandi
- [2026-06-30] LolaMarket Telegram Mini App to'liq implement qilindi — telegram-app/index.html, styles.css, app.js yaratildi (8 ekran: Bosh sahifa, Katalog, Mahsulot detail, Qidiruv, Savat, Buyurtma berish, Muvaffaqiyat, Buyurtmalarim; Glassmorphism dizayn tizimi asosida)
- [2026-06-30] app.js to'liq qayta yozildi — 8 ta haqiqiy mahsulot (ik-1402, ad-0890, sz-3310, ck-2201, hb-7740, lk-5512, ik-9001, pl-3320), CSS textile pattern (adras, ikat, suzani, herringbone, weave), USD narxlar, Dilnoza Tekstil MChJ kompaniya ma'lumotlari, to'g'ri kategoriyalar va buyurtmalar, to'lov usullari
- [2026-06-30] index.html qayta yozildi — dark pomegranate pill nav (4 tab + alohida profil tugmasi), main action button footer (detail/checkout), to'g'ri HTML tuzilmasi
- [2026-06-30] styles.css to'liq qayta yozildi — dizayn tokenlar, dark pomegranate pill, sliding lens effekti, glassmorphism
- [2026-06-30] Server deploy: telegram-app/ rsync orqali 65.21.180.44:/var/www/lolamarket/mini-app/ ga yuklandi
- [2026-06-30] Telegram bot menu button URL https://lolamarket.uz/mini-app/ ga sozlandi
- [2026-06-30] Bilingual (uz/ru) interfeys qo'shildi
- [2026-07-12] Buyurtma tasdiqlanganda Telegram bot bildirishnomasi yuborish ishga tushirildi — `telegram-app/app.js`ga `sendOrderNotify()` qo'shildi (checkout yakunlanganda `/api/telegram-notify`ga POST yuboradi). Serverda (`65.21.180.44`) Node.js relay xizmati (`/opt/lolamarket-notify/server.js`, systemd servis `lolamarket-notify`) va nginx'da `/api/telegram-notify` proxy location o'rnatildi
- [2026-07-15] Mahsulotlarga haqiqiy mato rasmlari qo'shildi — `Photo/textile/`dagi 12 ta rasm `telegram-app/assets/products/textile-01..12` nomlari bilan ko'chirildi, `app.js`dagi 8 ta mavjud mahsulotga `img` maydoni qo'shildi va 4 ta yangi mahsulot (tx-4401..tx-4404) yaratildi, `vm()` funksiyasiga rasm bo'lsa haqiqiy fon, bo'lmasa CSS pattern fallback beruvchi `bgStyle` qo'shildi
- [2026-07-15] 3 ta kichik UI tuzatish: Buyurtmalarim ekranidagi jami narx endi so'mda ko'rsatiladi (`app.js`ga `som()` funksiyasi qo'shildi, `USD_TO_UZS=12700` kursi bilan, faqat shu ekran uchun), pastki nav tugmalaridagi `.nav-lens` yaltiroq soyasi soddalashtirilib Profil tugmasi bilan bir xil qilindi va `.nav-lens-sheen` gloss elementi olib tashlandi (`styles.css`, `index.html`), mahsulot kartochkalaridagi rasm balandligi 104px'dan 150px'ga oshirildi (`productCard()` va `homeCard()`, Bosh sahifa va Katalog ekranlari)
- [2026-07-15] Profil ekraniga muallif krediti qo'shildi — `STR.uz`/`STR.ru`ga `madeBy` kaliti va `renderProfile()` oxiriga "Ishlab chiqildi Furqat Tukhsanov" matni qo'shildi (`app.js`)

---

## Qarorlar

- [2026-06-30] Qaror: Telegram Mini App uchun pure HTML/CSS/JS tanlandi (Next.js emas) — tezroq deploy, Telegram SDK bilan to'g'ridan-to'g'ri integratsiya, server kerak emas
- [2026-06-30] Qaror: Glassmorphism dizayn tizimi — Telegram dark theme bilan uyg'un, zamonaviy ko'rinish uchun
- [2026-06-30] Qaror: Dark pomegranate pill nav (sliding lens) — Telegram Mini App uchun native ko'rinishli navigatsiya, UX yaxshilash uchun
- [2026-06-30] Qaror: USD narxlar — B2B bozor uchun dollar narx ko'rsatish qulay, eksport yo'nalishi hisobga olindi
- [2026-06-30] Qaror: CSS textile pattern (SVG) — mahsulot kartalarida haqiqiy to'qima patternlar, vizual identifikatsiya uchun
- [2026-07-12] Qaror: Telegram bot bildirishnomasi uchun alohida Node.js relay xizmati serverda ishlatiladi (bot token faqat server `.env`da, git repo'ga kirmaydi) — bot tokenini frontend/git orqali oshkor qilmaslik uchun
- [2026-07-15] Qaror: Mahsulot rasmlari uchun haqiqiy fayl (`img`) bo'lsa ustunlik beriladi, bo'lmasa eski CSS textile pattern fallback sifatida qoladi — barcha mahsulotlarga birdaniga rasm topish shart emas, bosqichma-bosqich almashtirish imkonini beradi
