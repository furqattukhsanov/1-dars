# LolaMarket — Loyiha Qoidalari

## Majburiy qoidalar

- **Har git commit'dan oldin majburiy `hisobotchi` agentini ishga tushir.**
- **Barcha commit xabarlari o'zbek tilida bo'lsin.**
- Commit format: `tip: tavsif` (feat / fix / docs / style / refactor / chore)

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
- **Papka nomlari farqi:** repo'dagi `telegram-app/` serverda `mini-app/` deb ataladi — landing HTML'idan `telegram-app/...` yo'liga ishora qilmang, 404 bo'ladi

## Til

- Barcha commit xabarlari — o'zbekcha
- Sprint fayllari — o'zbekcha
- Kod izohlari — o'zbekcha yoki inglizcha
