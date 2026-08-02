# LolaMarket — Loyiha Qoidalari

## Majburiy qoidalar

- **Har git commit'dan oldin majburiy `hisobotchi` agentini ishga tushir.**
- **Barcha commit xabarlari o'zbek tilida bo'lsin.**
- Commit format: `tip: tavsif` (feat / fix / docs / style / refactor / chore)

## Arxitektura qoidalari

- **Admin panelning YOZUV amallari Telegram'da tasdiqlanadi** (2026-07-27 founder
  qarori). Panel faqat so'rov yaratadi (`POST /api/admin/action`), amal
  `ADMIN_CHAT_ID` chatidagi inline tugma bosilgandan keyin bajariladi; so'rov 30
  daqiqada eskiradi va tugmani bosgan odam `ADMIN_TG_IDS` ro'yxatida bo'lishi
  tekshiriladi. Sabab: panel tokeni brauzer `sessionStorage`ida yashaydi va
  o'g'irlanishi mumkin, pul o'tkazish/refund esa qaytarib bo'lmaydi.
  **Yangi yozuv amali qo'shilsa ham shu yo'ldan o'tsin** — paneldan
  to'g'ridan-to'g'ri DB'ga yozadigan endpoint qo'shilmasin.
- **Panelda o'ylab topilgan raqam ko'rsatilmasin.** Ma'lumot bazadan kelmasa,
  o'sha blok umuman ko'rsatilmaydi (mock raqam yoki soxta trend foizi emas).
- **Foydalanuvchi kimligi hech qachon brauzerdan olinmaydi** (2026-07-29).
  Mini App'da — imzolangan `initData`, saytda — bir martalik kod: Telegram ID
  bot webhook'iga Telegram'ning O'ZI yuboradi. Klient yuborgan `tg_user_id` ga
  ishonadigan endpoint qo'shilmasin. Sayt sessiyasi HttpOnly cookie'da yuradi
  va bazada faqat `sha256` shaklida saqlanadi (panel tokenidan farqi shu —
  u `sessionStorage`da yashaydi va XSS'da o'g'irlanishi mumkin).
- **Zaxira (`products.stock`) har doim ATOMIK kamaytiriladi** (2026-07-30).
  Tekshiruv va kamaytirish bitta `UPDATE ... WHERE stock >= qty` da bo'ladi
  (`routes/orders.js` → `decrementStock`), hech qachon alohida `SELECT` +
  `UPDATE` ga bo'linmasin: ikki xaridor bir vaqtda oxirgi rulonni olsa,
  ikkalasi ham "bor" deb o'qib o'tib ketardi. Qatorlar `id` bo'yicha
  tartiblangan holda qulflanadi (deadlock). `stock IS NULL` = CHEKSIZ —
  `made` mahsulotlar va son kiritilmagan e'lonlar. Bekor qilinganda zaxira
  qaytariladi, `refunded`da esa ATAYLAB qaytarilmaydi (mato xaridorda qoladi).
- **Reyting hosila — qo'lda yozilmasin** (2026-07-31). `products.rating`,
  `products.reviews` va `sellers.rating` ustunlarining YAGONA yozuvchisi —
  `routes/reviews.js` → `recalcRating()`, u qiymatni `reviews` jadvali ustidan
  `avg(stars)` / `count(*)` bilan hisoblaydi. `reviews = reviews + 1` kabi qo'lda
  oshirish TAQIQLANADI: sharh yashirilganda son kamaymay qoladi va reyting jimgina
  yolg'onga aylanadi. Sharh yo'q bo'lsa reyting `0` emas, **`NULL`** — UI `null`
  bo'lganda reyting blokini umuman ko'rsatmaydi ("baholanmagan" ≠ "yomon
  baholangan"). Xuddi shu sabab `telegram-app/app.js` dagi zaxira massivda ham
  reyting yo'q — u yerda haqiqiy sharh bo'lishi mumkin emas.
- **`innerHTML` ga boradigan HAR QANDAY tashqi matn `esc()` dan o'tsin**
  (2026-08-02). Foydalanuvchi yozgan matn — buyurtma izohi, manzil, bahs sababi,
  sotuvchi javobi, mahsulot nomi, Telegram ismi — shablon satriga xom qo'yilsa,
  u **kod bo'lib ishga tushadi**. Bu nazariy emas: xaridor buyurtma izohiga
  `<img src=x onerror=...>` yozsa, u SOTUVCHI ekranida sotuvchining sessiyasida
  bajarilardi. CSP to'xtatmaydi — u `'unsafe-inline'` bilan ishlaydi.
  **Mahsulot maydonlari uchun alohida `esc()` YOZILMASIN** — nom, sotuvchi,
  shahar, `img` `vm()` chegarasida bir marta tozalanadi (`telegram-app/app.js`),
  chunki ular o'nlab joyda chiziladi va har birini eslab qolish imkonsiz.
  `vm()` dan o'tmaydigan narsalar (buyurtma, bahs, profil) esa chizish joyida
  o'raladi. `esc()` bitta tirnoqni ham qochiradi — `style="url('${x}')"` va
  `onclick="f('${x}')"` da faqat qo'shtirnoq yetarli emas.
  **Serverda tozalanmaydi:** baza xom matn saqlaydi, chunki Telegram yo'li
  o'zining `escapeHtml` ini qo'llaydi (`routes/orders.js`) — ikki marta
  qochirilsa foydalanuvchi `&lt;` ko'rib qolardi. Himoya CHIQISHDA turadi.
- **Frontendda `window.addEventListener('load', ...)` ishlatilmasin** (2026-07-31,
  ikki marta kuyganimizdan keyin). `load` BARCHA rasm va shrift yuklanib bo'lgandan
  keyin otiladi — sekin tarmoqda bu soniyalar. Ikki marta zarar keltirdi:
  `pwa.js` service worker'ni ro'yxatdan o'tkazmadi (`5ffe1f0`), `script.js` esa
  butun ekranni yopib turgan `#page-loader`ni ochmay turdi. **O'rniga:**
  DOM kifoya bo'lsa — `DOMContentLoaded` (yoki skript `defer` bo'lsa to'g'ridan-
  to'g'ri chaqir). Haqiqatan `load` kerak bo'lsa — hodisa ALLAQACHON o'tgan
  bo'lishi mumkinligini hisobga ol: avval `document.readyState` tekshirilsin,
  aks holda listener hech qachon otilmaydi (`pwa.js` → `whenReady()` namunasi).
- **Tashqi skript hech qachon `<head>`da `defer`siz turmasin.** `telegram.org`dan
  keladigan `telegram-web-app.js` 114 KB va HTML tahlilini ~613 ms to'xtatardi.
  Sahifadagi skriptlar `defer` bo'lsa — **HAMMASI birdan** `defer` bo'lsin:
  bittasi `defer`siz qolsa u parse paytida, ya'ni defer'liklardan OLDIN ishlaydi
  va tartib buziladi (`app.js` `window.Telegram`ni topa olmaydi).

## Loyiha haqida

LolaMarket — O'zbekistonda to'qima materiallar uchun B2B web platforma.
- PRD: `docs/prd.md`
- Sprintlar: `docs/sprintlar/sprint-N.md`
- Panel: `loyiha-panel.html`

## Fayl tuzilmasi

```
1-dars/
├── index.html, style.css, script.js  — landing (lolamarket.uz), Mini App dizayn tizimida
├── sayt-eski/                         — eski landing zaxirasi; ⚠️ o'chirilmasin —
│                                        demo/ va admin/ uning style.css'iga bog'liq
├── telegram-app/                      — Telegram Mini App (serverda `mini-app/`)
├── demo/                              — katalog demo (eski stilda)
├── admin/                             — admin panel (eski stilda)
├── docs/
│   ├── prd.md                         — Founder PRD
│   ├── prd-lolamarket.md              — Texnik PRD
│   └── sprintlar/sprint-0..9.md      — Sprint fayllar
├── lolamarket-next/                   — Next.js loyihasi (alohida repo)
├── loyiha-panel.html                  — Sprint progress paneli
└── Photo/                             — Rasmlar
```

## Server va Deploy

- **Server:** Hetzner VPS `65.21.180.44`
- **Deploy:** rsync orqali `/var/www/lolamarket/`
- **Sayt:** lolamarket.uz (Cloudflare CDN)
- **GitHub:** `furqattukhsanov/1-dars` (statik sayt)
- **Next.js GitHub:** `furqattukhsanov/lolamarket-next`
- **Telegram bot bildirishnoma relay:** serverda `/opt/lolamarket-notify/server.js` (systemd servis `lolamarket-notify`), nginx'da `/api/telegram-notify` proxy — bot token faqat server `.env`da, git repo'ga kirmaydi
- **Zaxira (backup):** serverda `/opt/lolamarket-notify/pg-backup.sh`, cron `30 3 * * *`. Nusxa ikki joyda: serverda `/opt/lolamarket-backups/` (7 kun) va **Telegram'da** (`sendDocument`, chat — `.env` dagi `BACKUP_CHAT_ID`, bo'lmasa `ADMIN_CHAT_ID`; 2026-08-01 dan). Sabab: nusxalar bazaning o'zi bilan bitta diskda edi. Skript repoda YO'Q — serverda yashaydi va tokenni `.env` dan o'qiydi, shuning uchun `server/README.md` dagi rsync exclude ro'yxatida turishi shart. ⚠️ **Zaxira ichida mijoz ma'lumoti bor** — `BACKUP_CHAT_ID` chatidagi har kim butun bazani yuklab olishi mumkin
- **Nginx konfiguratsiyasi CI/CD tomonidan boshqarilmaydi** — deploy workflow faqat statik fayllarni rsync qiladi. (2026-07-22 gacha workflow nginx'ni qayta yozib, `/api/` proxy bloklarini o'chirib yuborardi va Telegram bildirishnomalarini ishdan chiqarardi.)
- **Papka nomlari farqi:** repo'dagi `telegram-app/` serverda `mini-app/` deb ataladi — landing HTML'idan `telegram-app/...` yo'liga ishora qilmang, 404 bo'ladi. CI'da u ALOHIDA qadam bilan ko'chiriladi (`strip_components: 1`) — birinchi ro'yxatga qo'shib bo'lmaydi
- **CI faqat `deploy.yml` dagi `source` ro'yxatidagi fayllarni chiqaradi** (2026-07-30). Ro'yxat aynan sanaydi: **repoda yangi ildiz fayli paydo bo'lsa, uni qo'lda qo'shish SHART**, aks holda u serverga umuman chiqmaydi. Buni sezish qiyin — nginx yo'q faylga `try_files ... /index.html` bilan HTML va **HTTP 200** qaytaradi, ya'ni `curl -w %{http_code}` bilan tekshirsangiz hammasi joyidek ko'rinadi. Shuning uchun deploy tekshiruvi HTTP kodiga emas, javob **TURIga** (`Content-Type`) qaraydi.
  **HTML fayl uchun esa `Content-Type` ham yaramaydi** (fallback ham `text/html`) —
  u yerda javob TARKIBIDAGI noyob satr tekshiriladi (`deploy.yml` → `check_html`). Shu tuzoq sababli landing PWA fayllari va butun Mini App uch sessiya davomida foydalanuvchiga yetib bormagan edi

## Til

- Barcha commit xabarlari — o'zbekcha
- Sprint fayllari — o'zbekcha
- Kod izohlari — o'zbekcha yoki inglizcha
