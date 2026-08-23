/* LolaMarket — sprint progress paneli.
   Ilgari bu kod `loyiha-panel.html` ichida inline `<script>` blokida
   turardi. CSP dan `'unsafe-inline'` olinganda (C3) u jimgina o'lardi:
   sprint kartochkalari umuman chizilmasdi, progress bar bo'sh qolardi.
   Faylni `hisobotchi` agenti yangilaydi — sprint holati va sana shu yerda. */

  const sprintlar = [
    { num: 0, nom: "Dizayn va ekranlar",        dars: "Dars 7",  holat: "tugadi",  sana: "2026-07-29" },
    { num: 1, nom: "Telegram Mini App MVP",     dars: "Dars 8",  holat: "tugadi",  sana: "2026-07-31" },
    { num: 2, nom: "Ma'lumotlar bazasi / Backend", dars: "Dars 9",  holat: "tugadi", sana: "2026-07-23" },
    { num: 3, nom: "Foydalanuvchilar + rollar", dars: "Dars 10", holat: "tugadi", sana: "2026-08-16" },
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-19" },
    { num: 5, nom: "Mobil / PWA",               dars: "Dars 12", holat: "jarayonda",  sana: "2026-08-13" },
    { num: 6, nom: "Integratsiyalar",           dars: "Dars 13", holat: "jarayonda",  sana: "2026-07-22" },
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-23" },
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-20" },
    { num: 9, nom: "Production + launch",       dars: "Dars 16", holat: "jarayonda", sana: "2026-08-14" },
    { num: 10, nom: "AI kiyim rasmi",           dars: "Dars 17", holat: "tugadi", sana: "2026-08-16" },
  ];

  const badgeLabels = {
    kutilmoqda: "⏳ kutilmoqda",
    jarayonda:  "🔄 jarayonda",
    tugadi:     "✅ tugadi",
  };

  const container = document.getElementById("sprints");
  const barEl     = document.getElementById("bar");
  const percentEl = document.getElementById("percent");
  const countEl   = document.getElementById("count");
  const updatedEl = document.getElementById("updated");

  const tugaganlar = sprintlar.filter(s => s.holat === "tugadi").length;
  const foiz = Math.round((tugaganlar / sprintlar.length) * 100);

  barEl.style.width = foiz + "%";
  percentEl.textContent = foiz + "%";
  countEl.textContent = tugaganlar + " / " + sprintlar.length + " sprint";
  updatedEl.textContent = "Yangilanish: 2026-08-23 («BOT USERLAR» — 30 dan 16 tasida @username yo'q edi: Mini App kirishi (routes/catalog.js → handleAuthTelegram) tg_username ni users upsert'iga UZATMASDI, imzolangan initData da u bor edi; /start bosmasdan kirgan odam username'siz tushardi. Endi COALESCE(EXCLUDED.tg_username, users.tg_username) — /start bilan bir naqsh, 16 qator keyingi ochilishda o'zi to'ladi, backfill yo'q; sotuvchi tasdig'i upsert'i ham username oladi. Founder: «oxirgi qachon kirganlarini ham hisobla» — kirish nuqtalari requestUser() dan o'tmasdi, touchLastSeen eksport qilinib Mini App kirishi va sayt sessiyasida to'g'ridan-to'g'ri chaqiriladi; «qachon qo'shilganini ham hisobini ol» — «Qo'shilgan» ustuni. Qorovullar: yangi Test 52 (har INSERT INTO users da tg_username + ON CONFLICT, 4 yo'l manbadan) va Test 51 → 1b (ikkala kirish touchLastSeen chaqiradi). HISOBOTCHI MUSTAQIL O'LCHADI: 90→91 ✅ Test, o'z mutatsiyasi Test 51 da ushlandi, fayl cp nusxadan tiklandi; jonli 30/16 da'vosi TEKSHIRILMADI. Kesh: admin.js v32→33, panel.js v53→54. 🔴 DEPLOY: statik + backend (routes/, lib/auth.js), rsync + restart, migratsiya YO'Q. PUSH YO'Q). Oldingi yangilanish 2026-08-23 (8136850 DEPLOY YAKUNI — production tasdiqlandi: /api/version = 8136850, /api/admin/users tokenli 200 / tokensiz 401, admin.css?v=21 va panel.js?v=52 hashlari mos. 🔴 CDN DARSI: admin.js?v=32 — CI rsync tugamasdan yangi URL ga so'rov ketdi va Cloudflare 71749 baytlik ESKI faylni yangi kalit ostida HIT qilib qulfladi (serverda 79066 bayt) — sayt yangi HTML + eski JS berardi. Purge serverda .env dagi token bilan, sir chiqmadi; hisobotchi mustaqil o'lchadi — jonli admin.js?v=32 79066 bayt, 3e38d951cf98, lokal bilan mos. Yangi qoida CLAUDE.md da: CI tugamay turib yangi ?v= manziliga so'rov yuborilmasin. ⚠️ Jurnalda Gemini 429 prepayment credits depleted (2026-08-22) — AI rasm production'da ishlamayapti, founder'ga aytildi. Kesh: panel.js v52→53. PUSH YO'Q). Oldingi yangilanish 2026-08-23 («BOT USERLAR» SAHIFASI ADMIN PANELGA QO'SHILDI — founder boshqa botining panelini referens qilib ko'rsatdi: foydalanuvchilar jadvali (ism / @username / ID / rol / AI kredit / AI 7 kun / buyurtma / oxirgi kirish / «Kredit berish»), «Oxirgi harakatlar» lentasi va tur chiplari; Trafik sahifasida 7/30/90 kun tanlovi (ikkala manbaga) va «Eng ko'p ko'rilgan matolar» jadvalga o'tdi — ko'rish/savat/sevimli/buyurtma/konv. FOUNDER QARORI: «Premium» YO'Q, faqat AI kredit. Baza: db/029 — users.last_seen_at + user_events (OWNER TO lola + sekvensiya, db/028 darsi) + admin_actions_kind_check ga credit_grant. «Oxirgi kirish» lib/auth.js → requestUser() ning IKKALA tarmog'ida yoziladi (5 daqiqada bir UPDATE, xato yutilmaydi). traffic_events ANONIMLIGI O'ZGARMADI — lentada «mato ko'rildi» YO'Q, faqat kirgan foydalanuvchining o'zi bajargan amallar (sevimli haqiqiy o'zgarishda, AI so'rov keshdan ham, buyurtma COMMIT dan KEYIN, saytga kirish). credit_grant Telegram tasdig'idan o'tadi, balans QO'SHILADI, yangi qator AI_CREDITS_START dan. Eski foydalanuvchilarda «oxirgi kirish» — «—» (NULL), sana o'ylab topilmaydi. YANGI QOROVUL Test 48 (5 band). HISOBOTCHI MUSTAQIL O'LCHADI: 90 ✅ Test yashil (89→90; ish hisobotidagi «91» yakuniy qatorni ham sanagan), 2 mutatsiya — sayt tarmog'idan touchLastSeen olib tashlash va buyurtma hodisasini COMMIT oldiga ko'chirish — ikkalasi ushlandi, fayllar cp nusxadan tiklandi, git status toza. ⚠️ Nomerlash 44→48 ga ko'chirildi, lekin 48 ham band (Cloudflare bloki) — takror qoldi, bo'sh raqam 51, ochiq qarz. Kesh: admin.js v31→32, admin.css v20→21, panel.js v51→52. 🔴 DEPLOY: migratsiya db/029 haqiqiy Postgres'da HALI ishlamagan va backend restartidan OLDIN qo'llanishi SHART; server/ rsync + restart founder tomonidan; founder panelni ko'z bilan KO'RMAGAN (soxta holat bilan sinaldi); PUSH QILINMADI. Hujjat: docs/sprintlar/sprint-7.md). Oldingi yangilanish 2026-08-20 (XAVFSIZLIK AUDITI — bitta HAQIQIY zaiflik topilib tuzatildi: /api/order-status IDOR. Endpoint autentifikatsiyasiz edi va so'rov faqat WHERE id=$1 bilan ketardi; buyurtma ID'si ketma-ket (#LM-1..N) bo'lgani uchun istalgan odam login'siz jami buyurtma sonini va har birining holatini sanay olardi — raqobatchiga biznes hajmi ochiq edi (jonli PoC: curl autentifikatsiyasiz 200 qaytardi). PII CHIQMAYDI, faqat status, shuning uchun 🟠 (🔴 emas). Tuzatish: handleOrderStatus endi authUser bilan kimlik oladi (kimliksiz 401) va so'rov EGAGA bog'landi — WHERE id=$1 AND tg_user_id=$2. authUser ATAYLAB tanlandi: endpointni faqat Mini App chaqiradi (CLAUDE.md qoidasi), sayt statusni /api/web/orders dan oladi. Mini App poll'i endi X-Telegram-Init-Data header yuboradi. YANGI QOROVUL — Test 50: handleOrderStatus tanasida (izohlar tozalangan) authUser/401/tg_user_id=$2 borligini talab qiladi. HISOBOTCHI MUSTAQIL SINADI: 89 ✅ Test yashil (88→89), qorovul 3 mutatsiya bilan buzib ko'rildi — egalikni olib tashlash va to'liq eski holatga qaytarish Test 50 ni QIZIL qildi, authUser'ni o'chirish bog'liqlik skanerini (u is not defined) qizartirdi; uchtasi ham ushlandi; fayl nusxadan tiklandi (cp, git checkout EMAS), git status toza. AI-guardrail «kibir hujum» sinovi ham o'tkazildi (11 raund, 33/33 — O'Z-O'ZINI sinov, ochiq yozilgan). Kesh: telegram-app/app.js v101→102, panel.js v50→51 (Test 16 jadvali birga). 🔴 DEPLOY: STATIK + BACKEND (server/routes/orders.js) — rsync + servis restart TALAB; migratsiya YO'Q; founder jonli tekshirmagan; PUSH QILINMADI, founder qaroriga qoldirildi. Hujjat: docs/xavfsizlik/00-xavfsizlik-xulosa.md)";


  sprintlar.forEach(s => {
    const card = document.createElement("div");
    card.className = "sprint-card " + s.holat;
    card.innerHTML = `
      <div class="sprint-num">${s.num}</div>
      <div class="sprint-info">
        <div class="sprint-name">${s.nom}</div>
        <div class="sprint-dars-label">${s.dars}</div>
      </div>
      <span class="sprint-badge badge-${s.holat}">${badgeLabels[s.holat]}</span>
    `;
    container.appendChild(card);
  });
