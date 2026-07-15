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

- [2026-07-16] Telegram Mini App'da ikki marta bosishda (double-tap) sahifa zoom bo'lib ketishi oldini olindi — `index.html`dagi viewport meta tegiga `maximum-scale=1.0, user-scalable=no` qo'shildi, `styles.css`dagi `html, body` qoidasiga `touch-action: manipulation` qo'shildi; Mahsulot detail ekrani header'ining ikkinchi qatoriga endi shahar nomidan tashqari "1 dona rulon narxi" (`T.perUnit`) matni ham qo'shildi (`updateHeader()`, `app.js`); kesh chetlab o'tish uchun `index.html`da skript versiyasi `v=12`dan `v=13`ga, `styles.css` versiyasi `v=3`dan `v=4`ga oshirildi
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
- [2026-07-15] Telegram orqali ro'yxatdan o'tish (identifikatsiya) qo'shildi — `loadTgUser()` funksiyasi `window.Telegram.WebApp.initDataUnsafe.user`dan foydalanuvchi ma'lumotini o'qiydi va `localStorage`ga (`lolamarket_tg_user`) saqlaydi, Telegram tashqarisida keshdan qaytaradi; yangi `renderTgCard()` Profil ekranida avatar/ism/`@username`/"Telegram orqali tasdiqlangan" belgisini ko'rsatadi, ulanmagan holatda nozik bildirishnoma chiqadi; `sendOrderNotify()` endi bitta manba — `S.tgUser`dan foydalanadi (`app.js`); kesh chetlab o'tish uchun `index.html`da skript versiyasi `v=6`dan `v=7`ga oshirildi
- [2026-07-15] Profildagi telefon raqami endi Telegramning haqiqiy kontaktidan olinadigan qilindi — `app.js`ga `shareContact()` (`Telegram.WebApp.requestContact()` chaqiradi) va `pollForPhone()` (yangi `/api/telegram-contact?uid=` endpointini har 1.2 soniyada, max 6 marta so'raydi) funksiyalari qo'shildi; natija `S.tgPhone` holatiga va `localStorage`ga (`lolamarket_tg_phone`) saqlanadi; `renderProfile()`dagi telefon qatori endi `S.tgPhone || COMPANY.phone`ni ko'rsatadi, raqam yo'q va Telegram ichida bo'lsa "Telefon raqamni ulashish" tugmasi chiqadi; `STR.uz`/`STR.ru`ga `shareContact`/`contactPending`/`contactDone` kalitlari qo'shildi; kesh chetlab o'tish uchun `index.html`da skript versiyasi `v=7`dan `v=8`ga oshirildi. (Server tomoni — git'ga kirmaydi, faqat ma'lumot uchun: Hetzner serverda muhim bug topilib tuzatildi — nginx'da `/api/telegram-notify`, `/api/telegram-webhook`, `/api/telegram-contact` uchun proxy yo'nalishlari umuman yo'q edi, shu sabab buyurtma bildirishnomasi ishlamay turgan edi; `/opt/lolamarket-notify/server.js`ga kontakt saqlash (`contacts.json`, `saveContact`/`loadContacts`) va yangi `GET /api/telegram-contact` endpointi, real IP aniqlash (`clientIp()`) qo'shildi; barchasi serverga deploy qilinib, end-to-end tekshirildi)
- [2026-07-15] Katalog ekranidagi mahsulot kartochkasiga savat miqdor stepper qo'shildi — `app.js`da `productCard()` ichidagi eski doira "+" tugmasi `catalogQtyControl(p)` chaqiruviga almashtirildi; yangi `catalogQtyControl()` savatda bo'lmagan mahsulot uchun yumaloqlangan burchakli (rounded rectangle) pomegranate gradient "+" tugmasini, savatda bor mahsulot uchun "− [miqdor] +" kompakt stepperni qaytaradi; `catalogInc()`/`catalogDec()` funksiyalari savatga MOQ bilan qo'shish, `step()` qadar oshirish/kamaytirish va MOQ'ga yetganda savatdan butunlay olib tashlashni boshqaradi (faqat Katalog ekranida, Bosh sahifa kartochkalarida emas); kesh chetlab o'tish uchun `index.html`da skript versiyasi `v=8`dan `v=9`ga oshirildi
- [2026-07-15] Mini App narxlari to'liq so'mga o'tkazildi va Katalog/Bosh sahifa stepper birlashtirildi — `money()` funksiyasi qayta yozilib (`USD_TO_UZS=12700` bilan "123 456 so'm" formatida), ilgari faqat Buyurtmalarim ekrani uchun ishlatilgan alohida `som()` funksiyasi olib tashlandi va uning o'rniga hamma joyda `money()` chaqiriladi (`renderOrders()` endi `money(total)` ishlatadi); `index.html`dagi `main-btn-sub` boshlang'ich matni `$0.00`dan `0 so'm`ga o'zgartirildi; `catalogQtyControl(p)`dagi uchta alohida "−"/raqam/"+" tugma bitta yaxlit pomegranate gradient to'rtburchakka (`border-radius:9px`, ichki tugmalar shaffof) birlashtirildi va shu funksiya endi `homeCard()`da ham ishlatiladi (Bosh sahifa va Katalog bir xil stepper, eski doira "+" tugmasi olib tashlandi); "Savatga qo'shildi" bildirishnomasiga 🌷 emoji qo'shildi (`STR.uz.added`/`STR.ru.added`); Bosh sahifadagi qattiq yozilgan "Salom, Maryam" endi `S.tgUser?.first_name`dan olinadi, aks holda "Maryam" (demo) qoladi, ishlatilmay qolgan `STR.uz/ru.greet` kalitlari o'chirildi (`app.js`); kesh chetlab o'tish uchun `index.html`da skript versiyasi `v=9`dan `v=10`ga oshirildi
- [2026-07-15] Narxlash modeli metrdan rulon/donaga o'zgartirildi va mahsulot kartochkasi dizayni qayta qurildi — `app.js`dagi barcha 12 mahsulotda `unit:'m'`/`unit:'panel'` → `unit:'rulon'`, `moq` → `1`, `price` endi to'g'ridan-to'g'ri so'mda (700 000–900 000 oralig'ida, pozitsiyaga qarab taqsimlangan); `money()` `USD_TO_UZS` konvertatsiyasisiz to'g'ridan-to'g'ri so'mda formatlaydi, `uShort()` `'rulon'`ni ham "dona" deb qaytaradi, `step()` doim `1` qaytaradi; yangi `STR.uz/ru.perUnit` ("1 dona rulon narxi" / "Цена за 1 рулон") va `vm().perUnitLabel` qo'shildi; `productCard()`/`homeCard()`da rasm balandligi 150px → 230px, narx endi "1 DONA RULON NARXI" yorlig'i bilan alohida qatorda; `catalogQtyControl(p)` qayta yozildi — savatda bor mahsulot uchun endi butun kartochka kengligini egallaydigan ikki rangli panel ("−"/"+" pomegranate tugmalar + oq/shisha fon, o'rtada "N dona"), bu boshqaruv endi Bosh sahifa va Katalogda bir xil; `renderOrders()`dagi Faol/Tarix tab tugmalariga tanlangan holatda `box-shadow` qo'shildi; kesh chetlab o'tish uchun `index.html`da skript versiyasi `v=10`dan `v=11`ga oshirildi
- [2026-07-16] Mahsulot kartochkasiga 3 ta kichik UI tuzatish kiritildi — `catalogQtyControl()`dagi savatga qo'shilgan panel foni `var(--glass-fill-strong)`dan `var(--pom-100)` (`#FFE9DB`) ga, raqam rangi `var(--pom-800)` ga o'zgartirildi; ikkala holat (kichik "+" tugma va to'liq panel) endi bir xil `height:36px` konteynerda qaytariladi, "+" bosilganda kartochka balandligi sakramasligi uchun; `productCard()`/`homeCard()`dagi yetkazib beruvchi/shahar qatori olib tashlandi, narx bloki markazga olindi (`telegram-app/app.js`); kesh chetlab o'tish uchun `index.html`da skript versiyasi `v=11`dan `v=12`ga oshirildi
- [2026-07-16] Kartochkadagi yetkazib beruvchi/shahar qatori qaytarildi (bold matn), yoniga "1 dona rulon narxi" yozuvi qo'shilib bir necha bosqichda dizayni sozlandi — oxirgi holat: qator bold, narx yorlig'i alohida qatorda markazda, "1 dona rulon narxi" matni kulrang (`var(--text-subtle)`) va kichikroq (8px); Mini App'da ikkita bosishda zoom bo'lib ketishi butunlay o'chirildi (`telegram-app/app.js`, `index.html`, `styles.css`); kesh versiyasi ketma-ket `v=13`dan `v=18`gacha oshirildi
- [2026-07-16] Telegram Bot bildirishnomalariga birinchi qadam qo'shildi — buyurtma checkout qilinganda endi xaridorning o'ziga ham Telegram orqali tasdiqlovchi xabar ("Buyurtmangiz qabul qilindi!" + tarkib + jami summa) yuboriladi, avval faqat adminga borardi; frontend (`app.js`dagi `sendOrderNotify()`) endi `tgUserId`ni ham serverga jo'natadi, serverdagi `/opt/lolamarket-notify/server.js`ga yangi `sendBuyerConfirmMessage()` funksiyasi qo'shildi (git'ga kirmaydi, faqat serverda, eski nusxa `.bak-*` sifatida saqlangan); "yo'lga chiqdi"/"yetib keldi" statuslari va ishlab chiqaruvchi/admin bahsli-holat xabarlari hali qo'shilmagan, chunki buyurtma holatini real boshqaradigan backend hali yo'q (`ORDERS` hozircha qattiq yozilgan demo ma'lumot); kesh chetlab o'tish uchun `index.html`da skript versiyasi `v=18`dan `v=19`ga oshirildi
- [2026-07-16] **Muhim production bug tuzatildi:** serverda (`65.21.180.44`) nginx konfiguratsiyasida `/api/telegram-notify`, `/api/telegram-webhook`, `/api/telegram-contact` uchun proxy yo'nalishlari butunlay yo'qolgan ekan (07-12 va 07-15 backuplarida ham yo'q edi) — natijada so'rovlar statik fayl serveriga tushib, POST metodi `405` bilan rad etilardi, ya'ni bu vaqt ichida hech qanday Telegram bildirishnomasi (admin ham, xaridor ham) haqiqatda yetib bormagan edi. `/etc/nginx/sites-available/lolamarket` uchta `location /api/...` blok bilan qayta yozildi, `nginx -t` va `systemctl reload nginx` bilan tasdiqlandi, real test so'rovi bilan `200 OK` va admin chatga xabar kelishi tekshirildi. Eski config `.bak-*` sifatida saqlanib qoldi (git'ga kirmaydi, server-tomon o'zgarish)
- [2026-07-16] Buyurtmalarim ekrani haqiqiy ishlaydigan qilindi — avval `ORDERS` qattiq yozilgan demo massiv edi (hech qachon yangilanmasdi); endi checkout yakunlanganda `mainBtnAction()` ichida haqiqiy buyurtma obyekti yaratilib (`id`, bugungi sana, savat tarkibi, `statusKey:'pending'`) `ORDERS`ga qo'shiladi va `localStorage`ga (`lolamarket_orders`, ID ketma-ketligi `lolamarket_order_seq`) saqlanadi; yangi `loadOrders()`/`saveOrders()`/`nextOrderId()`/`orderDateLabel()` (uz/ru oy nomlari, `MONTHS`) funksiyalari qo'shildi (`app.js`); "Tasdiq kutilmoqda" (`pending`) holati allaqachon mavjud bo'lgan `STATUS_TXT`/`STATUS_TONE`dan foydalanildi; Faol/Tarix tablar avvalgidek `statusKey`ga qarab filtrlaydi, o'zgarishsiz; brauzerda end-to-end tekshirildi (buyurtma berilib, Faol tabida to'g'ri chiqishi tasdiqlandi); kesh chetlab o'tish uchun `index.html`da skript versiyasi `v=19`dan `v=20`ga oshirildi

---

## Qarorlar

- [2026-06-30] Qaror: Telegram Mini App uchun pure HTML/CSS/JS tanlandi (Next.js emas) — tezroq deploy, Telegram SDK bilan to'g'ridan-to'g'ri integratsiya, server kerak emas
- [2026-06-30] Qaror: Glassmorphism dizayn tizimi — Telegram dark theme bilan uyg'un, zamonaviy ko'rinish uchun
- [2026-06-30] Qaror: Dark pomegranate pill nav (sliding lens) — Telegram Mini App uchun native ko'rinishli navigatsiya, UX yaxshilash uchun
- [2026-06-30] Qaror: USD narxlar — B2B bozor uchun dollar narx ko'rsatish qulay, eksport yo'nalishi hisobga olindi
- [2026-06-30] Qaror: CSS textile pattern (SVG) — mahsulot kartalarida haqiqiy to'qima patternlar, vizual identifikatsiya uchun
- [2026-07-12] Qaror: Telegram bot bildirishnomasi uchun alohida Node.js relay xizmati serverda ishlatiladi (bot token faqat server `.env`da, git repo'ga kirmaydi) — bot tokenini frontend/git orqali oshkor qilmaslik uchun
- [2026-07-15] Qaror: Mahsulot rasmlari uchun haqiqiy fayl (`img`) bo'lsa ustunlik beriladi, bo'lmasa eski CSS textile pattern fallback sifatida qoladi — barcha mahsulotlarga birdaniga rasm topish shart emas, bosqichma-bosqich almashtirish imkonini beradi
- [2026-07-15] Qaror: Telegram orqali ro'yxatdan o'tish uchun alohida forma yaratilmaydi — Mini App ichida foydalanuvchi Telegram orqali allaqachon "login qilingan" hisoblanadi, faqat uning Telegram identifikatsiyasi (ism/username/rasm) Profilda ko'rsatiladi; ma'lumot faqat qurilmada (`localStorage`) saqlanadi, backend/server o'zgarishi kerak emas
- [2026-07-15] Qaror: Profildagi telefon raqami Telegramning haqiqiy kontakt ma'lumotidan (`requestContact`) olinadi, kompaniya nomi esa alohida, qo'lda kiritiladigan bo'lib qoladi — foydalanuvchi identifikatsiyasini ishonchliroq qilish uchun, lekin B2B kompaniya ma'lumotini avtomatlashtirish hali shart emas deb topildi
- [2026-07-15] Qaror: Narxlash modeli metrdan (USD/m) rulon/donaga (so'm/rulon) o'zgartirildi — B2B xaridorlar amalda "necha rulon kerak" deb o'ylaydi, metrga bo'lib hisoblash keraksiz qadam edi; shu bilan birga barcha narxlar to'g'ridan-to'g'ri so'mda ko'rsatiladi (avvalgi USD → so'm konvertatsiya qarori bekor qilindi), chunki B2B xaridorlar ham amalda so'mda gaplashadi va valyuta kursiga bog'liq bo'lmagan sodda narx ko'rsatish afzal topildi
