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
- **Nginx konfiguratsiyasi CI/CD tomonidan boshqarilmaydi** — deploy workflow faqat statik fayllarni rsync qiladi. (2026-07-22 gacha workflow nginx'ni qayta yozib, `/api/` proxy bloklarini o'chirib yuborardi va Telegram bildirishnomalarini ishdan chiqarardi.)
- **Papka nomlari farqi:** repo'dagi `telegram-app/` serverda `mini-app/` deb ataladi — landing HTML'idan `telegram-app/...` yo'liga ishora qilmang, 404 bo'ladi. CI'da u ALOHIDA qadam bilan ko'chiriladi (`strip_components: 1`) — birinchi ro'yxatga qo'shib bo'lmaydi
- **CI faqat `deploy.yml` dagi `source` ro'yxatidagi fayllarni chiqaradi** (2026-07-30). Ro'yxat aynan sanaydi: **repoda yangi ildiz fayli paydo bo'lsa, uni qo'lda qo'shish SHART**, aks holda u serverga umuman chiqmaydi. Buni sezish qiyin — nginx yo'q faylga `try_files ... /index.html` bilan HTML va **HTTP 200** qaytaradi, ya'ni `curl -w %{http_code}` bilan tekshirsangiz hammasi joyidek ko'rinadi. Shuning uchun deploy tekshiruvi HTTP kodiga emas, javob **TURIga** (`Content-Type`) qaraydi. Shu tuzoq sababli landing PWA fayllari va butun Mini App uch sessiya davomida foydalanuvchiga yetib bormagan edi

## Til

- Barcha commit xabarlari — o'zbekcha
- Sprint fayllari — o'zbekcha
- Kod izohlari — o'zbekcha yoki inglizcha
