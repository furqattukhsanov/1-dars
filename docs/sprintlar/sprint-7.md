# Sprint 7 — Admin panel (Dars 14)

**Holat:** jarayonda

---

## Maqsad

Founder sifatida platformani to'liq nazorat qilish: ishlab chiqaruvchilarni tasdiqlash, escrow boshqaruvi, bahsli holatlarni hal qilish.

---

## Bajariladigan vazifalar

### Ishlab chiqaruvchi boshqaruvi
- [ ] Yangi ishlab chiqaruvchi so'rovlari ro'yxati
- [ ] Tasdiqlash / rad etish (sabab bilan)
- [ ] Tasdiqlanganda ishlab chiqaruvchiga Telegram xabarnoma

### Escrow va To'lovlar
- [ ] Barcha buyurtmalar ro'yxati (holat bo'yicha filtr)
- [ ] Har buyurtmada: tovar summasi, komissiya (10–12%), ishlab chiqaruvchiga o'tkaziladigan summa
- [ ] "Pul o'tkazildi" tugmasi → `completed` holati
- [ ] Refund qilish: to'liq yoki qisman, sabab yozish

### Bahsli holatlar
- [ ] Barcha ochiq bahslar ro'yxati
- [ ] Har bahsda: xaridor dalili (rasm/video), ishlab chiqaruvchi javobi
- [ ] Moderator qarori: kim aybdor → logistika kim to'laydi
- [ ] Qarordan keyin avtomatik holat yangilash va Telegram xabarnoma
- [ ] 24 soat ichida hal qilinmagan bahslar uchun eslatma

### Statistika
- [ ] Umumiy buyurtmalar soni va summasi
- [ ] Komissiya daromadi (kunlik / oylik)
- [ ] Eng faol ishlab chiqaruvchilar

---

## Qilingan ishlar

- [2026-07-25] **Operatsion insident: admin panel production'da (lolamarket.uz/admin) kira olmasdi — tuzatildi (faqat server, repo'da diff yo'q).** Sabab zanjiri uch qavatli edi: (1) oldingi commit `0b5d09e` (Sprint 7 real API'ga o'tish) `ADMIN_PANEL_TOKEN`ni production `.env`ga hali qo'shmagan edi ("Hali qilinmagan" deb yozilgan edi) — token bo'sh bo'lgani uchun endpoint doim 401 qaytargan; (2) token qo'yilgandan keyin ham kirmadi, chunki `/etc/nginx/sites-available/lolamarket`da `/api/admin/` uchun proxy bloki umuman yo'q edi — so'rov Node backend'ga (127.0.0.1:3001) yetib bormay statik fayl serverga tushib, 200 status bilan landing HTML qaytarardi (frontend buni "kalit noto'g'ri" deb ko'rsatardi); (3) proxy qo'shilgach backend `relation "seller_applications" does not exist` xatosi berdi — `db/004_seller_applications.sql` migratsiyasi (repo'da bor, `0b5d09e` bilan qo'shilgan) production bazada hali ishga tushirilmagan edi, ishga tushirilgach jadval egasi noto'g'ri bo'lib `permission denied` chiqdi (`lola` user emas, `postgres` egalik qildi). Barcha tuzatish to'g'ridan-to'g'ri Hetzner serverda (65.21.180.44) SSH orqali bajarildi: `.env`ga `ADMIN_PANEL_TOKEN=lolamarket` qo'yildi va `lolamarket-notify` restart qilindi; nginx'ga `/api/admin/` proxy bloki qo'shildi (`.bak` nusxa olingandan keyin, `nginx -t` bilan tekshirilib, `reload` qilindi); migratsiya `scp` + `psql -f` orqali qo'lda qo'llandi (idempotent); jadval egaligi `ALTER TABLE ... OWNER TO lola` bilan tuzatildi, `lola_ro`ga `GRANT SELECT` va sequence uchun `GRANT USAGE, SELECT` berildi. Tekshirildi: `curl` va brauzer orqali `lolamarket.uz/admin`ga `lolamarket` kodi bilan kirish, statistika kartalari, so'nggi buyurtmalar va kategoriya diagrammasi to'liq ishlayapti. **Muhim:** bu safar repo'da hech qanday fayl o'zgarmadi (`git status` clean) — nginx konfiguratsiyasi, `.env` qiymati va DB grant'lari CLAUDE.md qoidasiga ko'ra git'ga kirmaydi; faqat shu hujjatlashtirish commit qilindi
- [2026-07-25] **Admin panel mock ma'lumotlardan real API'ga o'tkazildi (2-variant: real ma'lumot, harakatlar hamon bot orqali).** Sabab: Sprint 0'da admin panel yangi dizaynga o'tkazilganda funksionallik ataylab o'zgartirilmagan edi — mock parol (`PASSWORD='lolamarket'`, brauzer konsolida ochiq ko'rinardi) va hardcoded mock massiv qolgan edi, chunki standalone veb-sahifa Telegram `initData` ishlab chiqara olmaydi. Backend (`server/server.js`): yangi `ADMIN_PANEL_TOKEN` env o'zgaruvchisi (Telegram initData'dan mustaqil alohida sir, `.env`da; berilmasa endpoint doim 401), `safeEqual()` doimiy vaqtli taqqoslash helperi (timing attack himoyasi), yangi **faqat o'qish uchun** `GET /api/admin/summary` endpoint (`X-Admin-Token` header + rate limit) — moderatsiyadagi mahsulotlar soni, ko'rib chiqilmagan sotuvchi arizalari soni, bugungi buyurtmalar soni, tasdiqlangan sotuvchilar soni, kategoriya statistikasi, so'nggi 20 buyurtma; `cors()`ga `X-Admin-Token` header ruxsati qo'shildi; `server/README.md`ga hujjatlashtirildi. Frontend (`admin/`): `admin.js` to'liq qayta yozildi — mock parol va hardcoded massiv olib tashlandi, login formasi kiritilgan qiymatni `X-Admin-Token` sifatida yuboradi, tasdiqlansa token `sessionStorage`da saqlanadi (sahifa ochilganda avtomatik kirish sinaladi); `admin/index.html` statistika kartalari va buyurtma filtrlari real status kalitlariga (`pending/confirmed/shipped/delivered/cancelled`) o'tkazildi, kategoriya diagrammasi JS orqali to'ldiriladi, login maydoni "Admin kaliti"ga o'zgartirildi (kesh `v=2`); `admin/admin.css`ga `.empty-cell` qo'shildi. Brauzerda mock `fetch` bilan to'liq test qilindi (login xatosi, statistika, jadval, filtr, bo'sh holat, kategoriya diagrammasi, noma'lum kategoriya fallback) — 0 konsol xatosi. **Hali qilinmagan:** haqiqiy backend (Postgres + real token) bilan test — production DB lokal muhitda yo'q, deploy vaqtida tasdiqlanadi; `server.js` production serverga hali ko'chirilmagan; `ADMIN_PANEL_TOKEN` production `.env`ga hali qo'shilmagan. Sprint 7dagi qolgan vazifalar (tasdiqlash/rad etish amallari, escrow/refund, bahsli holatlar, statistika sahifasi) hali bot buyruqlari orqali va boshlanmagan holicha qoladi

---

- [2026-07-26] **Admin panel UI qayta qurildi: bitta sahifalik header o'rniga to'liq sidebar-navigatsiyali ilova qobig'i.** `admin/index.html`, `admin/admin.css`, `admin/admin.js` uch fayl ham qayta ishlandi (`.app-shell` = `.sidebar` + `.main-col`). Chap tomonda `.sidebar` bilan 5 bo'lim: Dashboard, Buyurtmalar, Sotuvchilar, Moderatsiya, Statistika (`.nav-item[data-page]`, JS bilan almashtiriladi, `.page.active` ko'rinadi). Yuqorida `.topbar` — sahifa sarlavhasi/subtitr va vaqt oralig'i tugmasi. Dashboard sahifasida yangi vizual qatlamlar qo'shildi: daromad (GMV) va tashrifchi/xaridor chiziqli grafiklar (`renderLineChart`, oddiy inline SVG), stat-kartalarga ikonka/trend belgisi. Sotuvchilar, Moderatsiya va sotuvchi arizalari bo'limlari hozircha **`MOCK_APPLICATIONS` / `MOCK_SELLERS` / `MOCK_MOD_QUEUE` va GMV/tashrifchi/xaridor sonlari uchun `MOCK_*` konstantalar bilan to'ldirilgan** (`admin.js` boshida "backend endi'cha ro'yxat qaytarmaydi" izohi bilan belgilangan) — faqat `/api/admin/summary`dan kelgan moderatsiya/sotuvchi arizasi/buyurtma/sotuvchi hisoblagichlari, so'nggi buyurtmalar va kategoriya statistikasi real qoladi. **Hali qilinmagan:** sotuvchilar/moderatsiya/statistika sahifalari uchun real backend endpointlari (hozircha faqat vizual maket), shundan keyin mock massivlarni almashtirish kerak.

- [2026-07-26] **Admin panelga yangi "Reja/Fakt" sahifasi qo'shildi: tasdiqlangan 12 oylik savdo rejasi bilan joriy holatni solishtirish.** `admin/admin.js`ga LolaMarketning tasdiqlangan 12 oylik savdo rejasini (`future/lolamarket-future.html`dan ko'chirilgan — bu fayl untracked, alohida, commit'ga kirmaydi) tashuvchi yangi konstantalar qo'shildi: `PLAN_MONTHS`, `PLAN_UNITS_PER_DAY`, `PLAN_UNITS_PER_MONTH`, `PLAN_ESTIMATED`, `PLAN_PRICE_PER_UNIT` ($82 o'rtacha chek), `PLAN_COMMISSION_RATE` (12%) va bularni render qiluvchi `renderPlanFakt()` funksiyasi. Reja Sentabrdan boshlanadi (`currentPlanIndex()` joriy kalendar oyni reja siklidagi mos oyga moslaydi); Iyul/Avgust uchun haqiqiy reja yo'q — naqsh asosida taxminiy hisoblangan (`PLAN_ESTIMATED`). `admin/index.html`da sidebar'ga yangi "Reja/Fakt" nav-item va yangi `#page-planfakt` sahifasi qo'shildi: joriy oy uchun reja (kunlik birlik) vs fakt (bugungi real buyurtmalar soni, `/api/admin/summary`dan) solishtiruvchi 3 ta stat-karta va to'liq 12 oylik reja jadvali (oy, kunlik/oylik birlik, o'rtacha chek, GMV, komissiya). Summalar hozircha manbadagi kabi $ da — so'mdagi haqiqiy GMV bilan bevosita solishtirilmaydi, bu UI'da eslatma sifatida yozilgan. Brauzerda mock ma'lumot bilan tekshirilgan — konsol xatosi yo'q. **Hali qilinmagan:** Fakt ustuni hozircha faqat joriy oy uchun ishlaydi — backend hali oylik agregatsiya bermaydi, bu qo'shilgach o'tgan oylar uchun ham real fakt ko'rsatiladi

## Qarorlar

- [2026-07-25] Qaror: admin panel `/api/admin/summary` endpointi faqat O'QISH uchun — tasdiqlash/rad etish kabi yozuvchi harakatlar hamon Telegram bot buyruqlari orqali (`/sotuvchi_tasdiqla`, `/nashr` va h.k.) amalga oshiriladi. Sabab: standalone veb-sahifa Telegram `initData` avtorizatsiyasini ishlab chiqara olmaydi, shuning uchun yozuvchi amallarni web panelga o'tkazish xavfsizlik teshigi ochardi; o'qish uchun esa alohida `ADMIN_PANEL_TOKEN` siri yetarli. Bu mavjud "tasdiqlash bot orqali" qaroriga (Sprint 0, 2026-07-25) mos keladi va uni davom ettiradi
