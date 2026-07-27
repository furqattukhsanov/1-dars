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
| `ADMIN_PANEL_TOKEN` | `admin/index.html` kirish kaliti (`X-Admin-Token` header) — Telegram initData'dan mustaqil, alohida sir. Dalil rasmlari havolasini imzolash uchun ham ishlatiladi |
| `PREPAY_RATE` | Oldindan to'lov ulushi (default `0.5`) |
| `COMMISSION_RATE` | Platforma komissiyasi, 0..1 oralig'ida (default `0.10`). Buyurtma yaratilganda `orders.commission_rate` ga snapshot qilinadi |

## Sprint 7 deploy qadamlari (2026-07-27)

Odatdagi `server.js` deploy'idan tashqari uch narsa kerak. **Tartib muhim:**
avval migratsiya, keyin kod — aks holda yangi kod hali mavjud bo'lmagan
ustunlarga murojaat qiladi.

```bash
# 1. Baza migratsiyasi (idempotent — qayta ishga tushsa xatosiz o'tadi)
scp db/005_sprint7_admin.sql root@65.21.180.44:/tmp/
ssh root@65.21.180.44 "sudo -u postgres psql -d lolamarket -f /tmp/005_sprint7_admin.sql"

# 004 hali qo'llanilmagan bo'lsa avval o'sha (2026-07-25 insidenti):
#   scp db/004_seller_applications.sql root@65.21.180.44:/tmp/
#   ssh ... "sudo -u postgres psql -d lolamarket -f /tmp/004_seller_applications.sql"

# 2. Jadval egaligi — 004 da bo'lgani kabi, yangi jadval `lola` user'ga tegishli bo'lsin
ssh root@65.21.180.44 "sudo -u postgres psql -d lolamarket -c \
  'ALTER TABLE admin_actions OWNER TO lola; \
   ALTER SEQUENCE admin_actions_id_seq OWNER TO lola; \
   GRANT SELECT ON admin_actions TO lola_ro;'"

# 3. COMMISSION_RATE ni .env ga qo'shish (yozilmasa default 10% ishlatiladi)
ssh root@65.21.180.44 "grep -q COMMISSION_RATE /opt/lolamarket-notify/.env || \
  echo 'COMMISSION_RATE=0.10' >> /opt/lolamarket-notify/.env"

# 4. Kodni ko'chirish va restart (yuqoridagi odatdagi Deploy bo'limi)
```

### Nginx — yangi proxy bloklari

`/etc/nginx/sites-available/lolamarket` faylida quyidagi yo'llar backend'ga
o'tishi kerak. **Nginx konfiguratsiyasi CI/CD tomonidan boshqarilmaydi** —
qo'lda qo'shiladi (`.bak` nusxa oling, `nginx -t` bilan tekshiring, keyin `reload`):

- `/api/admin/action`
- `/api/admin/disputes`
- `/api/admin/dispute-photo`
- `/api/disputes`
- `/api/seller/dispute`

`/api/admin/` va `/api/seller/` prefiks bloklari allaqachon bo'lsa, birinchi
uchtasi va oxirgisi avtomatik qamraladi — faqat `/api/disputes` alohida kerak.

### Deploydan keyin tekshirish

```bash
# Token bilan summary ishlayaptimi (yangi maydonlar bilan)
curl -s -H "X-Admin-Token: <token>" https://lolamarket.uz/api/admin/summary | head -c 400

# Bahslar endpointi (bo'sh massiv qaytishi normal)
curl -s -H "X-Admin-Token: <token>" https://lolamarket.uz/api/admin/disputes

# Tokensiz 401 bo'lishi shart
curl -s -o /dev/null -w '%{http_code}\n' https://lolamarket.uz/api/admin/disputes
```

Keyin panelda bitta arizani tasdiqlashga urinib ko'ring — Telegram'da tugmali
xabar kelishi va bosilgandan keyin panel "bajarildi" deb ko'rsatishi kerak.
