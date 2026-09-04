# Statik kesh — `immutable` (versiyalangan fayllar uchun)

**Holat:** ✅ QO'LLANDI (2026-09-05, A yo'l — Cloudflare Transform Rule + Browser Cache TTL
«Respect existing headers»; 4/4 tekshiruv jonli o'tdi).
**Sana:** 2026-08-20 · **Turi:** unumdorlik (performance), xavfsizlik emas.

## Kontekst

Versiyalangan statik fayllar (`app.js?v=102`, `styles.css?v=36`, ...) hozir
`Cache-Control: max-age=14400` (4 soat) bilan yuradi. Ular **tarkib o'zgarsa
`?v=` HAM oshadigan** fayllar (Test 16 buni majburlaydi), ya'ni berilgan
`app.js?v=102` tarkibi hech qachon o'zgarmaydi — demak ularni **cheksiz**
(`immutable`) keshlash xavfsiz va foydali: qaytgan foydalanuvchi 4 soatdan
keyin ham qayta yuklamaydi, va `immutable` qo'lda qayta yuklaganda ham
revalidatsiyani (304) o'tkazib yuboradi.

`?v=` mexanizmi to'g'ri ishlashi 2026-08-20 da jonli o'lchandi (har xil query =
har xil kesh kaliti), shuning uchun `immutable` yangilanishni bloklamaydi:
tarkib o'zgarganda `?v=` yangi URL beradi va u yangi kalit sifatida keshdan
o'tadi.

## 🔴 Qamrov — FAQAT `?v=` bor URL

`immutable` **faqat query stringda `v=` bo'lgan** `.js`/`.css` ga qo'yiladi.
Quyidagilarga **QAT'IYAN qo'yilmasin** (aks holda ular muzlab, yangilanmay qoladi):

| Fayl | Nega immutable BO'LMASIN |
|---|---|
| HTML (`index.html`, `/mini-app/`) | Yangi `?v=` ni AYNAN HTML tarqatadi. Muzlasa foydalanuvchi yangi versiyani hech qachon ko'rmaydi. Hozir `Cache-Control`siz (DYNAMIC) — shunday qolsin. |
| `sw.js` | Service worker `?v=`siz yuradi, brauzer uni qayta tekshirishi shart. Hozir `must-revalidate` bilan — shunday qolsin. |
| `offline.js` va boshqa PRECACHE fayllari | ATAYLAB `?v=`siz (CLAUDE.md: `sw.js` keshdan `ignoreSearch`siz qidiradi). URL o'zgarmagani uchun immutable bo'lsa yangilanish yetib bormaydi. Eskirish `CACHE_VERSION` orqali. |

Shuning uchun **kengaytma bo'yicha (`.js`/`.css`) emas, query bo'yicha (`v=` bor)**
shart qo'yiladi — hozirgi qoida kengaytmaga qaraydi va ikkalasini birga tutadi.

## A yo'l — Cloudflare Response Header Transform Rule (TAVSIYA)

Xavfsizlik sarlavhalari bilan bir xil mexanizm (`docs/xavfsizlik-sarlavhalari.md`),
panelda bir bosishda qaytariladi, nginx'ga tegilmaydi.

**Yo'l:** Cloudflare → `lolamarket.uz` → **Rules** → **Overview** →
*Create rule* → **Response Header Transform Rule**

**Nomi:** `lolamarket — versiyalangan statik immutable`

**Qamrov (Custom filter expression):**
```
(http.request.uri.path.extension in {"js" "css"}) and (http.request.uri.query contains "v=")
```

**Amal:** `Set static` —
| Header name | Value |
|---|---|
| `Cache-Control` | `public, max-age=31536000, immutable` |

`sw.js`, `offline.js`, HTML — query'da `v=` yo'q, ya'ni qoidaga TUSHMAYDI va
o'z sarlavhasida qoladi.

⚠️ Agar Cloudflare'da **Browser Cache TTL** sozlamasi «Respect existing
headers» bo'lsa, bu Transform Rule ta'sir qiladi. Agar u qat'iy qiymatga
(masalan 4 soat) qo'yilgan bo'lsa, u origin `Cache-Control`ini bosib o'tishi
mumkin — u holda o'sha sozlama ham «Respect existing headers» ga o'tkazilsin.

## B yo'l — nginx (agar origin nazorati afzal ko'rilsa)

⚠️ Nginx CI tomonidan boshqarilmaydi (founder serverda qo'lda) va `add_header`
`location` bloklari orasida MEROS OLINMAYDI (CLAUDE.md) — ehtiyot shart.
Query bo'yicha ajratish uchun `map`:

```nginx
# http {} blokida:
map $arg_v $lm_static_cache {
    ""      "public, max-age=14400";                    # ?v= yo'q → qisqa
    default "public, max-age=31536000, immutable";       # ?v= bor → immutable
}

# .js/.css location'ida (sw.js uchun ALOHIDA location qoladi, must-revalidate bilan):
location ~* \.(js|css)$ {
    add_header Cache-Control $lm_static_cache always;
    # ⚠️ sw.js bu bloкка tushmasin — undan OLDIN alohida `location = /sw.js` bo'lsin,
    #    aks holda uning `must-revalidate`i yo'qoladi.
}
```

## Tekshiruv (qo'llagandan keyin)

```bash
UA="Mozilla/5.0"
# 1) Versiyalangan — immutable BO'LSIN:
curl -sI -A "$UA" "https://lolamarket.uz/mini-app/app.js?v=102" | grep -i cache-control
#   kutilgan: cache-control: public, max-age=31536000, immutable

# 2) sw.js — O'ZGARMASIN (must-revalidate qolsin):
curl -sI -A "$UA" "https://lolamarket.uz/mini-app/sw.js" | grep -i cache-control
#   kutilgan: max-age=14400, must-revalidate (immutable BO'LMASIN)

# 3) offline.js (?v=siz) — immutable BO'LMASIN:
curl -sI -A "$UA" "https://lolamarket.uz/mini-app/offline.js" | grep -i cache-control
#   kutilgan: immutable YO'Q

# 4) HTML — o'zgarmasin:
curl -sI -A "$UA" "https://lolamarket.uz/mini-app/" | grep -i cache-control
#   kutilgan: immutable YO'Q (DYNAMIC/qisqa)
```

Ikkinchi va uchinchi qadam eng muhim: agar ular ham `immutable` bo'lib qolsa,
qoida query o'rniga kengaytmaga tushган — filtrni tuzatib qayta qo'llansin.

## Rollback

Cloudflare: qoidani o'chirish (yoki disable). nginx: `map` va `add_header`
qatorlarini olib tashlab `nginx -t && systemctl reload nginx`.

## Foyda va xarj

- **Foyda:** qaytgan foydalanuvchi versiyalangan fayllarni 4 soatdan keyin ham
  qayta yuklamaydi; `immutable` reloadда revalidatsiyani (304) ham o'tkazib
  yuboradi. Modest, lekin real (takroriy tashrif ko'p bo'lsa sezilarli).
- **Xarj:** faqat konfiguratsiya, kod yo'q. Yagona xavf — qamrovni noto'g'ri
  qo'yib `?v=`siz fayllarni muzlatish; yuqoridagi tekshiruv aynan shuni tutadi.
