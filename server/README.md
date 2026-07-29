# LolaMarket Backend (`lolamarket-notify`)

Vanilla Node.js server (`http` + `pg`) — Telegram bot relay, katalog API, buyurtma API,
auth (Telegram initData imzosi) va admin moderatsiya.

## Muhim

- **Sirlar bu repoda YO'Q.** `BOT_TOKEN`, `DATABASE_URL`, `ADMIN_CHAT_ID`, `WEBHOOK_SECRET`,
  `ADMIN_TG_IDS` — hammasi faqat serverdagi `/opt/lolamarket-notify/.env` faylida (600, git'ga kirmaydi).
- Bu papka faqat **kod** — deploy paytida `.env` va `node_modules` tegilmaydi.

## Kod tuzilmasi (2026-07-29 dan beri)

Ilgari hammasi bitta `server.js` (2971 satr) edi. Endi:

```
server/
├── server.js       — FAQAT router: qaysi yo'l qaysi modulga
├── config.js       — env sirlari va biznes doimiylari
├── db.js           — umumiy pg pool
├── lib/            — domenga bog'liq bo'lmagan yordamchilar
│   ├── auth.js         — kim bu so'rov egasi (initData, admin token, sotuvchi roli)
│   ├── telegram-auth.js — initData imzosini tekshirish
│   ├── telegram-api.js — bot API (bot tokeni FAQAT shu yerda)
│   ├── http.js         — rate limit, cors, ok/fail, readBody
│   ├── format.js       — escapeHtml, money, sha256 …
│   ├── validate.js     — sxema validatori va ClientError
│   └── contacts.js     — telefon raqamlari fayl bazasi
└── routes/         — domen mantig'i
    ├── catalog.js, orders.js, seller.js, admin.js,
    ├── disputes.js, web-auth.js, seller-application.js
    └── webhook.js
```

Qatlamlar bir tomonga qaraydi: `routes/ → lib/ → config/db`. Domen modullari
bir-birini chaqirmaydi (`webhook.js` dan tashqari — u dispetcher).

## Server joylashuvi

- Server: Hetzner VPS `65.21.180.44`
- Yo'l: `/opt/lolamarket-notify/`
- Systemd servis: `lolamarket-notify`
- Nginx: `/api/*` → `127.0.0.1:3001` proxy

## Deploy

> ⚠️ **DIQQAT — 2026-07-29 dan keyin o'zgardi.** Kod endi bitta fayl emas.
> Faqat `server.js` ni ko'chirsangiz servis `MODULE_NOT_FOUND` bilan qulaydi
> va qayta ko'tarilmaydi. **Butun papkani** ko'chirish shart.

```bash
# 1. Backup — endi butun papka
ssh root@65.21.180.44 "cp -r /opt/lolamarket-notify /opt/lolamarket-notify.bak-$(date +%Y%m%d-%H%M%S)"

# 2. Lokal tekshiruv — lint (yo'qolgan import) + testlar (route jadvali)
cd server && npm test

# 3. Ko'chirish — BUTUN papka (.env, node_modules va logs tegilmaydi)
rsync -av --delete \
  --exclude='.env' --exclude='node_modules' --exclude='contacts.json' \
  --exclude='*.bak-*' \
  server/ root@65.21.180.44:/opt/lolamarket-notify/

# 4. Qayta ishga tushirish
ssh root@65.21.180.44 "systemctl restart lolamarket-notify && systemctl is-active lolamarket-notify"

# 5. Serverda qaysi kod turganini tasdiqlash (git SHA)
curl -s https://lolamarket.uz/api/version

# 6. Log tekshiruvi
ssh root@65.21.180.44 "journalctl -u lolamarket-notify -n 20 --no-pager"
```

**Orqaga qaytarish** (5-qadam kutilmagan SHA bersa yoki servis ko'tarilmasa):

```bash
ssh root@65.21.180.44 "rm -rf /opt/lolamarket-notify && mv /opt/lolamarket-notify.bak-<sana> /opt/lolamarket-notify && systemctl restart lolamarket-notify"
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
| `BOT_USERNAME` | Saytdagi "Telegram orqali kirish" deep-link'i uchun bot nomi, `@`siz (default `lolamarketbot`) |
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

## Saytda Telegram orqali kirish deploy qadamlari (2026-07-29)

**Tartib muhim:** avval migratsiya, keyin kod.

```bash
# 1. Baza migratsiyasi (idempotent)
scp db/007_web_auth.sql root@65.21.180.44:/tmp/
ssh root@65.21.180.44 "sudo -u postgres psql -d lolamarket -f /tmp/007_web_auth.sql"

# 2. Jadval egaligi — yangi jadvallar `lola` user'ga tegishli bo'lsin
ssh root@65.21.180.44 "sudo -u postgres psql -d lolamarket -c \
  'ALTER TABLE web_login_codes OWNER TO lola; \
   ALTER TABLE web_sessions OWNER TO lola;'"

# 3. BOT_USERNAME ni .env ga qo'shish (yozilmasa default `lolamarketbot`)
ssh root@65.21.180.44 "grep -q BOT_USERNAME /opt/lolamarket-notify/.env || \
  echo 'BOT_USERNAME=lolamarketbot' >> /opt/lolamarket-notify/.env"

# 4. Kodni ko'chirish va restart (yuqoridagi odatdagi Deploy bo'limi)
```

### Nginx — yangi proxy yo'llari

- `/api/auth/web/start`, `/api/auth/web/poll`, `/api/auth/web/me`, `/api/auth/web/logout`
  (`/api/auth/` prefiks bloki bo'lsa — avtomatik qamraladi)
- `/api/web/orders` — **alohida kerak**, `/api/web-orders` bloki buni qamramaydi

Proxy blokida `Set-Cookie` va `Cookie` header'lari o'tishi shart (nginx buni
standart holatda o'zi qiladi — `proxy_hide_header Set-Cookie` YOZILMASIN).

### Deploydan keyin tekshirish

```bash
# Kod yaratiladimi (JSON'da code, verifier, url bo'lishi kerak)
curl -s -X POST https://lolamarket.uz/api/auth/web/start

# Sessiyasiz "user": null qaytishi normal
curl -s https://lolamarket.uz/api/auth/web/me

# Sessiyasiz buyurtmalar 401 bo'lishi shart
curl -s -o /dev/null -w '%{http_code}\n' https://lolamarket.uz/api/web/orders
```

Keyin saytda "Kirish" tugmasini bosing — Telegram ochilib "Boshlash" bosilgandan
keyin sahifa o'zi profilingizga o'tishi kerak.
