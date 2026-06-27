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
├── index.html, style.css, script.js  — joriy statik sayt (lolamarket.uz)
├── demo/                              — katalog demo
├── admin/                             — admin panel
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

## Til

- Barcha commit xabarlari — o'zbekcha
- Sprint fayllari — o'zbekcha
- Kod izohlari — o'zbekcha yoki inglizcha
