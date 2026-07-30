# Sprint 1 — Telegram Mini App MVP (dizayndan implementatsiya)

**Holat:** yopildi (2026-07-25) — barcha ekranlar, dizaynga moslashtirish, ikki tillilik, tab-bar animatsiyasi, vizual regressiya testi va mahsulot ma'lumotlar modeli tekshiruvi yakunlandi

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
- [x] **To'liq ikki tillilik (uz/ru)** — tekshirilib tasdiqlandi (2026-07-25): `STR[S.lang]` obyekti uz/ru matnlari bilan to'liq, `setLangUi()` orqali til tugmasi ishlaydi, 20+ render funksiyasi `T = STR[S.lang]` patternidan foydalanadi. Eslatma eskirgan edi — RU allaqachon ulangan.
- [x] Pastki tab-bar'dagi "liquid glass lens" slayd animatsiyasi — tekshirilib tasdiqlandi (2026-07-25): `.nav-lens` da `transition: left 480ms cubic-bezier(.34,1.56,.64,1)` (`--ease-spring` tokeni) va indeksga asoslangan `left: calc(...)` formulasi bor. Dizayn manba fayli (`LolaMarket Mini App.dc.html`) diskda topilmadi, shu sabab so'z ma'nosida piksel-piksel solishtirish qilinmadi, lekin implementatsiya spring-easing bilan to'g'ri qurilgan.
- [x] Mahsulot ma'lumotlar modelini dizayndagi 8 ta haqiqiy mahsulot bilan qayta tekshirish — yopildi (2026-07-25): dizayn manba fayli (`LolaMarket Mini App.dc.html`) diskda topilmagani sabab, asl qiymatlar bilan piksel-piksel solishtirish qilinmadi. `PRODUCTS` massividagi (`app.js`) 8 mahsulotning barcha maydonlari (price/moq/lead/comp/width/weight) to'liq va ichki izchil to'ldirilganligi tekshirildi, shu holatda band yopiq deb belgilandi
- [x] Brauzerda 375px kenglikda ekran-ekran to'liq vizual regressiya testi — 2026-07-25 da barcha 8 ekran (Bosh, Katalog, Detail, Savat, Checkout, Buyurtmalarim, Qidiruv, Profil) 375px kenglikda tekshirildi, layout buzilishi topilmadi. Kichik kosmetik nuqson: mahsulot detail sahifasida yetkazib beruvchi nomi kesilib qolmoqda ("Marg'ilon Ipa...") — tuzatish kerak

### Sprint 1 doirasidan tashqarida (keyingi sprintlar)
- Backend/API integratsiyasi — hozircha mahsulotlar `app.js` ichida statik JS massiv. Haqiqiy buyurtma/to'lov oqimi yo'q.
- Payme/Click, BTS Pochta, Telegram bot bildirishnomalari — **Sprint 6** doirasida alohida kuzatiladi (`docs/sprintlar/sprint-6.md`)

---

## Qilingan ishlar

- [2026-07-30] **CI landing PWA fayllarini va Mini App'ni umuman deploy qilmasdi — ikkala teshik
  yopildi va CI ga haqiqiy tekshiruv qadami qo'shildi** (`.github/workflows/deploy.yml`, commit
  `c6350a1`). Ikkala nuqson Sprint 8 ning end-to-end sinovida qo'lga tushdi (`sprint-8.md`).

  **Teshik 1 — landing PWA fayllari.** `deploy.yml` dagi `source` ro'yxati fayllarni AYNAN sanab
  o'tadi. 2026-07-30 da yaratilgan landing PWA fayllari (`manifest.json`, `sw.js`, `pwa.js`,
  `offline.html`, `assets/`) unga qo'shilmagandi — ular serverga umuman chiqmadi. Eng yomoni, buni
  sezish qiyin edi: nginx yo'q faylga `try_files ... /index.html` bilan **HTML qaytardi va HTTP 200
  ko'rsatdi**, Cloudflare esa o'sha HTML'ni `sw.js` sifatida 4 soatga keshladi. Ya'ni landing PWA
  "deploy qilingan" ko'rinib turib, aslida umuman ishlamayotgan edi. Endi bu fayllar ro'yxatda va
  ro'yxat ustiga ogohlantirish izohi yozildi: **repoda yangi ildiz fayli paydo bo'lsa, uni shu yerga
  QO'LDA qo'shish shart.**

  **Teshik 2 — Mini App uchun deploy qadami umuman yo'q edi.** Repoda papka `telegram-app/`, serverda
  `mini-app/`. Nomlar mos kelmagani uchun uni birinchi ro'yxatga qo'shib bo'lmaydi — papka serverga o'z
  nomi bilan yotardi va `/mini-app/` bo'sh qolardi. Natijada Mini App **27-iyuldan beri** eskirgan
  turgan: production'da `app.js?v=47`, holbuki jonli kod `v52` bo'lishi kerak edi. Ya'ni oxirgi uch
  sessiyaning BUTUN Mini App ishi (PWA, mahsulot rasmi UI, logistika narxi qatori, zaxira ko'rsatkichi)
  foydalanuvchilarga yetib bormagan. Endi Mini App uchun `strip_components: 1` bilan **alohida scp
  qadami** bor — u papka nomini olib tashlaydi va target to'g'ri joyni ko'rsatadi.

  **Yangi tekshiruv qadami — "Verify static files actually deployed".** Statik fayllar HAQIQATAN yetib
  borganini tekshiradi: `/manifest.json`, `/sw.js`, `/pwa.js`, `/script.js`, `/mini-app/app.js` — har
  biri kutilgan `Content-Type` bilan javob berishi shart, aks holda deploy xato bilan to'xtaydi va
  xabarda `source` ro'yxatini tekshirish tavsiya qilinadi

- [2026-07-30] **Deploy ko'rsatmasidagi `rsync --delete` serverdagi fayllarni o'chirib yuborardi —
  `server/README.md` tuzatildi.** `--delete` repoda YO'Q hamma narsani o'chiradi, `pg-backup.sh` va
  `.mcp-db-url` esa exclude ro'yxatida yo'q edi. Bugungi deploy paytida aynan shu bo'ldi: ikkala fayl
  o'chdi — zaxiradan darhol tiklandi va kunlik backup cron'i zarar ko'rmadi, lekin uni ishdan
  chiqarishga bir qadam qolgandi. Endi ikkalasi exclude ro'yxatida va sabab buyruq ustida izoh sifatida
  yozilgan: **serverda yashaydigan, repoda bo'lmagan HAR BIR fayl shu ro'yxatda bo'lishi shart**

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
- [2026-07-25] "Ochiq qolgan ishlar" bo'limidan 3 band ko'rib chiqildi va yopildi: to'liq ikki tillilik (uz/ru) kodda allaqachon to'liq ulanganligi tasdiqlandi, "liquid glass lens" tab-bar animatsiyasi spring-easing bilan to'g'ri qurilganligi tasdiqlandi, 375px kenglikda barcha 8 ekranning vizual regressiya testi o'tkazildi
- [2026-07-25] Vizual testda topilgan kosmetik nuqson tuzatildi: `telegram-app/app.js` mahsulot detail sahifasida yetkazib beruvchi nomini kesib ko'rsatuvchi `overflow:hidden;text-overflow:ellipsis;white-space:nowrap` olib tashlandi, uzun nomlar endi ikki qatorga o'raladi (`app.js?v=46`)

---

## Qarorlar

- [2026-07-30] Qaror: **statik fayl deploy'i HTTP kodiga emas, javob TURIga (`Content-Type`) qarab
  tekshiriladi.** Sabab: nginx `try_files ... /index.html` bilan sozlangan — yo'q faylga ham **200**
  qaytaradi, faqat tanasi HTML bo'ladi. Shu sabab `curl -o /dev/null -w '%{http_code}'` hamma joyda
  200 ko'rsatdi va bizni chalg'itdi, holbuki fayllar serverda umuman yo'q edi. Endi CI `%{content_type}`
  ni o'qiydi: `/sw.js` `application/javascript` qaytarmasa — fayl yetib bormagan, deploy xato bilan
  to'xtaydi
- [2026-07-30] Qaror: **Mini App alohida deploy qadami bilan ko'chiriladi** (`strip_components: 1`),
  asosiy `source` ro'yxatiga qo'shilmaydi. Sabab: repoda `telegram-app/`, serverda `mini-app/` — ro'yxatga
  qo'shilsa papka serverga o'z nomi bilan yotadi va `/mini-app/` bo'sh qoladi. Papka nomlarini
  tenglashtirish (repo yoki serverni qayta nomlash) qilinmadi: server yo'li bot menu URL'iga,
  manifest `id`iga va foydalanuvchilarda o'rnatilgan PWA'larga bog'lanib ketgan
- [2026-06-30] Qaror: Telegram Mini App uchun pure HTML/CSS/JS tanlandi (Next.js emas) — tezroq deploy, Telegram SDK bilan to'g'ridan-to'g'ri integratsiya, server kerak emas
- [2026-06-30] Qaror: Glassmorphism dizayn tizimi — Telegram dark theme bilan uyg'un, zamonaviy ko'rinish uchun
- [2026-06-30] Qaror: Dark pomegranate pill nav (sliding lens) — Telegram Mini App uchun native ko'rinishli navigatsiya
- [2026-06-30] Qaror: USD narxlar — B2B bozor uchun dollar narx ko'rsatish qulay, eksport yo'nalishi hisobga olindi
- [2026-07-11] Qaror: Dizayn manbasidagi token qiymatlarini (`_ds/`) loyihaga alohida saqlash — kelajakda dizayn yangilansa solishtirish oson bo'lishi uchun
- [2026-07-11] Qaror: Mini App logotipi sifatida AI generatsiya qilingan dizayn logotipi emas, `Photo/logo/` papkasidagi haqiqiy LolaMarket brend logotipi ishlatiladi

---

## Eslatma

Bu fayl avval `lolamarket-next` loyihasining texnik skelet rejasi uchun ishlatilgan edi (Next.js sahifalar, Vercel deploy) — u hali boshlanmagan edi (barcha vazifalar belgilanmagan, "Qilingan ishlar" bo'sh edi), shuning uchun endi Telegram Mini App MVP rejasi uchun qayta ishlatildi. Agar Next.js skelet rejasi kerak bo'lsa, alohida sprint fayl sifatida tiklab beraman.
