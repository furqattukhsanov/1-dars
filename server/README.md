# LolaMarket Backend (`lolamarket-notify`)

Vanilla Node.js server (`http` + `pg`) — Telegram bot relay, katalog API, buyurtma API,
auth (Telegram initData imzosi) va admin moderatsiya.

## Muhim

- **Sirlar bu repoda YO'Q.** `BOT_TOKEN`, `DATABASE_URL`, `ADMIN_CHAT_ID`, `WEBHOOK_SECRET`,
  `ADMIN_TG_IDS` — hammasi faqat serverdagi `/opt/lolamarket-notify/.env` faylida (600, git'ga kirmaydi).
- Bu papka faqat **kod** — deploy paytida `.env` va `node_modules` tegilmaydi.

## Server joylashuvi

- Server: Hetzner VPS `65.21.180.44`
- Yo'l: `/opt/lolamarket-notify/server.js`
- Systemd servis: `lolamarket-notify`
- Nginx: `/api/*` → `127.0.0.1:3001` proxy

## Deploy

```bash
# 1. Backup (serverda avtomatik ham bor, lekin qo'lda ham olamiz)
ssh root@65.21.180.44 "cp /opt/lolamarket-notify/server.js /opt/lolamarket-notify/server.js.bak-$(date +%Y%m%d-%H%M%S)"

# 2. Syntaksis tekshiruvi (lokal)
node --check server/server.js

# 3. Ko'chirish
scp server/server.js root@65.21.180.44:/opt/lolamarket-notify/server.js

# 4. Qayta ishga tushirish
ssh root@65.21.180.44 "systemctl restart lolamarket-notify && systemctl is-active lolamarket-notify"

# 5. Log tekshiruvi
ssh root@65.21.180.44 "journalctl -u lolamarket-notify -n 20 --no-pager"
```

## Env o'zgaruvchilari (`.env` serverda)

| Nom | Tavsif |
|---|---|
| `BOT_TOKEN` | Telegram bot tokeni |
| `ADMIN_CHAT_ID` | Buyurtma bildirishnomasi keladigan chat |
| `ADMIN_TG_IDS` | Vergul bilan ajratilgan admin Telegram ID'lari (moderatsiya ruxsati) |
| `DATABASE_URL` | PostgreSQL ulanish satri |
| `WEBHOOK_SECRET` | Telegram webhook maxfiy tokeni |
| `ALLOWED_ORIGIN` | CORS origin (default `https://lolamarket.uz`) |
| `MINI_APP_URL` | Mini App URL |
