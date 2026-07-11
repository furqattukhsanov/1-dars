# Sprint 1 — Telegram Mini App MVP (dizayndan implementatsiya)

**Holat:** jarayonda — asosiy ekranlar qurilgan, dizaynga moslashtirish va ikki tillilik ochiq

---

## Maqsad

`LolaMarket Mini App.dc.html` dizayn manbasida (Claude Design loyihasi `78717d70-ee33-47ed-957a-886c26a938ef`) belgilangan Telegram Mini App'ni ekran-ekran o'rganib, `telegram-app/` papkasida to'liq implement qilish — avval "Minimal MVP (1-iteratsiya)" ekranlari, keyin "Keyingi iteratsiya" ekranlari.

Dizayn manbasi: pure HTML/CSS/JS, glassmorphism dizayn tizimi, ikki tillilik (uz/ru), 8 ta ekran + pastki tab-bar + asosiy tugma footer + toast bildirishnomalar.

---

## Ekranlar ro'yxati (dizayndan)

### 1-iteratsiya — Minimal MVP (5 ekran)

- [x] **01. Bosh sahifa** — salomlashuv, qidiruv paneli, kategoriya tugmasi, "Tavsiya etiladi" grid (4 mahsulot)
- [x] **02. Katalog** — Filtr/Saralash tugmalari, kategoriya chip qatori (gorizontal skroll), mahsulot grid (2 ustun)
- [x] **03. Mahsulot detail** — rasm/pattern, badge, like tugmasi, narx, reyting, yetkazib beruvchi karta (tasdiqlangan belgisi + xabar tugmasi), tafsilotlar jadvali (eni, zichlik, tarkib, yetkazish muddati, MOQ), miqdor tanlash (+/-), escrow eslatma, pastki asosiy tugma ("Savatga qo'shish")
- [x] **04. Savat** — bo'sh holat, mahsulot qatorlari (miqdor +/-, o'chirish), jami hisob-kitob karta, "Rasmiylashtirish" tugmasi
- [x] **05. Buyurtma berish (Checkout)** — yetkazib berish manzili, to'lov usuli (Escrow / Bank o'tkazmasi / Click-Payme), izoh, buyurtma tarkibi xulosasi

### 2-iteratsiya — Keyingi bosqich (3 ekran)

- [x] **06. Qidiruv** — real-time qidiruv, so'nggi qidiruvlar chiplari, natijalar ro'yxati, "hech narsa topilmadi" holati
- [x] **07. Buyurtmalarim** — Faol/Tarix tab, buyurtma kartasi (status badge, mahsulot preview, "Kuzatish"/"Qayta buyurtma" tugmalari)
- [x] **08. Profil** — kompaniya karta (nom, rol, a'zo bo'lgan sana), telefon/email, Sozlamalar bo'limi (Til UZ/RU, Bildirishnomalar toggle, Yordam markazi), "Chiqish" tugmasi

### Qo'shimcha tizim elementlari (barcha ekranlarda)

- [x] Pastki tab-bar — pill shakldagi navigatsiya, 4 asosiy tab (Bosh/Katalog/Savat/Buyurtma) + alohida Profil tugmasi, "liquid glass lens" slayd effekti
- [x] Asosiy tugma footer — Detail va Checkout ekranlarida (narx bilan birga)
- [x] Toast bildirishnoma — "Savatga qo'shildi" va h.k.
- [x] Header — orqaga/qidiruv/bildirishnoma doira tugmalari, brend logotipi + sarlavha

---

## Bajariladigan vazifalar

### Dizaynga moslashtirish (bu sessiyada bajarilgan)
- [x] Header ikon tugmalar — kvadratdan **doira** (`border-radius:50%`) ga o'zgartirildi
- [x] Header logotip — SVG o'rniga haqiqiy LolaMarket tulip logotipi (`Photo/logo/loga kvadrat/`dan), doira ko'rinishda
- [x] Design tokenlari (`_ds/`) — ranglar, tipografiya, spacing, glassmorphism effektlar dizayn manbasidan aynan ko'chirildi va `telegram-app/_ds/` ga saqlandi
- [x] `styles.css` — glass-fill/border/highlight/shadow, radius-lg/xl, saffron/success/danger ranglar dizayn qiymatlariga moslashtirildi
- [x] Profil ekrani — soxta statistika kartalari olib tashlandi, dizayndagi haqiqiy tuzilma (Sozlamalar bloki) qo'yildi

### Ochiq qolgan ishlar
- [ ] **To'liq ikki tillilik (uz/ru)** — dizaynda barcha matn/mahsulot/kategoriya ikkala tilda tayyor (`STR` obyekti), joriy `app.js` faqat o'zbekcha qattiq kodlangan. RU tugmasi hozircha "tez orada" xabarini chiqaradi. ~80+ matn kalitini tarjima qilish kerak.
- [ ] Pastki tab-bar'dagi "liquid glass lens" slayd animatsiyasini dizayn bilan piksel-piksel solishtirish (`left` hisoblash formulasi, spring easing)
- [ ] Mahsulot ma'lumotlar modelini dizayndagi 8 ta haqiqiy mahsulot bilan qayta tekshirish (narx, MOQ, lead time, tarkib — barchasi mos kelishi kerak)
- [ ] Brauzerda 375px kenglikda ekran-ekran to'liq vizual regressiya testi (hozircha qisman qilingan — Bosh, Katalog, Detail, Profil)

### Sprint 1 doirasidan tashqarida (keyingi sprintlar)
- Backend/API integratsiyasi — hozircha mahsulotlar `app.js` ichida statik JS massiv. Haqiqiy buyurtma/to'lov oqimi yo'q.
- Payme/Click, BTS Pochta, Telegram bot bildirishnomalari — **Sprint 6** doirasida alohida kuzatiladi (`docs/sprintlar/sprint-6.md`)

---

## Qilingan ishlar

- [2026-06-30] MVP Telegram Mini App ekranlar ro'yxati tuzildi — 8 ta ekran aniqlandi, minimal MVP uchun 5 ta ekran belgilandi
- [2026-06-30] `telegram-app/index.html`, `styles.css`, `app.js` yaratildi — 8 ekran to'liq implement qilindi (Bosh sahifa, Katalog, Mahsulot detail, Qidiruv, Savat, Buyurtma berish, Muvaffaqiyat, Buyurtmalarim, Profil)
- [2026-06-30] 8 ta haqiqiy mahsulot (ik-1402, ad-0890, sz-3310, ck-2201, hb-7740, lk-5512, ik-9001, pl-3320), CSS textile pattern (adras, ikat, suzani, herringbone, weave), USD narxlar, Dilnoza Tekstil MChJ kompaniya ma'lumotlari
- [2026-06-30] Dark pomegranate pill nav (4 tab + alohida profil tugmasi), main action button footer
- [2026-06-30] Server deploy: `telegram-app/` rsync orqali `65.21.180.44:/var/www/lolamarket/mini-app/` ga yuklandi, bot menu URL `https://lolamarket.uz/mini-app/` ga sozlandi
- [2026-07-11] Claude Design loyihasidan (`LolaMarket Mini App.dc.html`, 897 qator) to'liq dizayn manbasi o'qildi va joriy implementatsiya bilan solishtirildi
- [2026-07-11] Header ikon tugmalar doira shaklga, logotip haqiqiy LolaMarket tulip rasmiga (`Photo/logo/loga kvadrat/`) almashtirildi
- [2026-07-11] Design tokenlar (`tokens/colors.css`, `typography.css`, `spacing.css`, `effects.css`, `fonts.css`) dizayn manbasidan olinib `telegram-app/_ds/` ga saqlandi
- [2026-07-11] `styles.css` dagi glassmorphism va rang tokenlari dizayn qiymatlariga moslashtirildi, Profil ekrani qayta qurildi
- [2026-07-11] Tuzatilgan versiya serverga qayta deploy qilindi
- [2026-07-12] Dizayn manbasi bilan yana bir bor to'liq solishtirilib tuzatildi: pastki navigatsiya pill rangi to'g'rilandi (aktiv/nofaol holat teskari edi), teal→pomegranate rang xatosi (~14 joyda) tuzatildi, kompaniya nomi "Dilnoza Tekstil MChJ" → "Muazzamxon Tekstil MChJ" ga o'zgartirildi, Bosh sahifadagi o'ylab topilgan banner olib tashlandi, Bosh/Katalog uchun alohida kartochka shablonlari (`homeCard`/`productCard`) ajratildi, "Qayta buyurtma" tugmasi va fon gradienti dizaynga moslashtirildi
- [2026-07-12] Katta oynada (desktop brauzer) ko'rinish qo'shildi — Telegram tashqarisida 560px+ enda telefon-ramka ko'rinishi (`@media (min-width:560px)`), Telegram ichida hech narsa o'zgarmaydi. Cache-busting uchun fayl versiyalari (`?v=2`, `?v=3`) oshirildi. Serverga qayta deploy qilindi

---

## Qarorlar

- [2026-06-30] Qaror: Telegram Mini App uchun pure HTML/CSS/JS tanlandi (Next.js emas) — tezroq deploy, Telegram SDK bilan to'g'ridan-to'g'ri integratsiya, server kerak emas
- [2026-06-30] Qaror: Glassmorphism dizayn tizimi — Telegram dark theme bilan uyg'un, zamonaviy ko'rinish uchun
- [2026-06-30] Qaror: Dark pomegranate pill nav (sliding lens) — Telegram Mini App uchun native ko'rinishli navigatsiya
- [2026-06-30] Qaror: USD narxlar — B2B bozor uchun dollar narx ko'rsatish qulay, eksport yo'nalishi hisobga olindi
- [2026-07-11] Qaror: Dizayn manbasidagi token qiymatlarini (`_ds/`) loyihaga alohida saqlash — kelajakda dizayn yangilansa solishtirish oson bo'lishi uchun
- [2026-07-11] Qaror: Mini App logotipi sifatida AI generatsiya qilingan dizayn logotipi emas, `Photo/logo/` papkasidagi haqiqiy LolaMarket brend logotipi ishlatiladi

---

## Eslatma

Bu fayl avval `lolamarket-next` loyihasining texnik skelet rejasi uchun ishlatilgan edi (Next.js sahifalar, Vercel deploy) — u hali boshlanmagan edi (barcha vazifalar belgilanmagan, "Qilingan ishlar" bo'sh edi), shuning uchun endi Telegram Mini App MVP rejasi uchun qayta ishlatildi. Agar Next.js skelet rejasi kerak bo'lsa, alohida sprint fayl sifatida tiklab beraman.
