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
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-17" },
    { num: 5, nom: "Mobil / PWA",               dars: "Dars 12", holat: "jarayonda",  sana: "2026-08-13" },
    { num: 6, nom: "Integratsiyalar",           dars: "Dars 13", holat: "jarayonda",  sana: "2026-07-22" },
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-18" },
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-07" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-18, birinchi commit (SAYT VA MINI APP TRAFIGI ENDI O'LCHANADI — ADMIN PANELDA YANGI «TRAFIK» SAHIFASI, db/028_traffic.sql. Band users.src (2026-08-13) ochib qoldirgan savolni yopadi: odam QAYSI kanaldan kelgani o'lchanardi, KELGANDAN KEYIN NIMA QILGANI esa yo'q edi. Ikki hodisa yoziladi — view (ekran ochildi) va cart (savatga qo'shildi); buyurtma ATAYLAB yozilmaydi, u orders da yashaydi va pulga bog'langan. 🔴 AVVAL TEKSHIRILDI VA ESKIRGAN DA'VO TOPILDI: panelning O'ZIDA «loyihada veb-analitika ulanmagan» deb yozilib turgandi (2026-07-27 qarori) — amalda Cloudflare Web Analytics 2026-08-02 dan beri IKKALA yuzda ishlaydi. Hisobotchi MUSTAQIL ikkinchi usul bilan tasdiqladi (curl + brauzer sarlavhalari): token 6acaeab5…, lolamarket.uz/ va /mini-app/ da AYNI token, CSP script-src da host ruxsat etilgan, beacon /cdn-cgi/rum ga — o'z originimizga — yozadi, ya'ni connect-src 'self' ham to'smaydi. Tekshirilmaganda allaqachon o'lchanayotgan narsa IKKINCHI MARTA qurilardi. ⚠️ TUZOQ: ODDIY curl BEACON'NI KO'RSATMAYDI — Cloudflare uni faqat so'rov brauzerga o'xshaganda (Accept: text/html, Sec-Fetch-Dest: document) qo'shadi; sarlavhasiz curl bo'sh javob beradi va «beacon yo'q» degan YOLG'ON xulosaga olib keladi (bu ish paytida aynan shunday bo'ldi, ikkinchi urinishda ochildi). IKKALASI BIR NARSANI O'LCHAMAYDI va shuning uchun ikkinchi yo'l ochildi (ortiqchalik CLAUDE.md bo'yicha SANALDI): Cloudflare biladi — necha kishi keldi, qaysi mamlakat, qaysi havola; BILMAYDI — qaysi MATO ko'rildi va ko'rish→savat konversiyasi (bizning products.id unga noma'lum). Ustiga Cloudflare raqami 7 kundan keyin ~10% ga siyraklashadi (namunaviy), bizniki har hodisaning o'zi (aniq) — shuning uchun panelda YONMA-YON QO'YILMAYDI. BACKEND: yangi server/lib/traffic.js (sof mantiq — ekran ro'yxati, bot filtri, tashrifchi belgisi, ref host, yuz aniqlash), yangi server/routes/track.js (POST /api/track — anonim, rate-limit, 400 kunlik tozalash), routes/admin.js → handleAdminTraffic (GET /api/admin/traffic?days=, 7 so'rov), server.js da ikkita marshrut, config.js da TRAFFIC_SALT. ⚠️ ENDPOINT KIMLIKNI UMUMAN SO'RAMAYDI va bu QAROR: authUser() ham, requestUser() ham chaqirilmaydi, klient credentials: 'omit' yuboradi — kimlik so'ralsa kirmagan mehmon (trafikning katta qismi) o'lchanmasdi va bazada «kim qaysi sahifani ochdi» yozuvi paydo bo'lardi. ⚠️ XOM IP SAQLANMAYDI: visitor = sha256(ip|user-agent|sir|KUN) ning 16 belgisi, kun HASH ICHIDA — odam kunlar bo'ylab kuzatilmaydi (baza zaxirasi Telegram chatiga ketadi). Shuning uchun «ko'rishlar» ANIQ, «tashrifchi» TAXMINIY va panel buni AYTADI; kunlik tashrifchilar QO'SHILMAYDI — o'rtacha ko'rsatiladi. ⚠️ Trafik summary GA QO'SHILMADI: u panelning eng issiq so'rovi, trafik esa og'irroq va oraliq bilan so'raladi. FRONTEND: script.js va telegram-app/app.js da bir xil beacon (keepalive: true — sahifa yopilayotganda ham yetadi; xato JIM yutiladi, chunki o'lchov vositasi o'lchayotgan narsani sindirmasin, server tomonda esa KO'RINADI); admin/index.html + admin/admin.js — yangi «Trafik» sahifasi (4 KPI, kunlik ustunlar, top matolar, ekranlar, ikki yuz, referrer, voronka); Statistika sahifasidagi eskirgan «veb-analitika ulanmagan» izohi almashtirildi. Panel ma'lumot bo'lmasa NOL emas, SABAB ko'rsatadi — bu sahifadan 2026-07-27 da aynan o'ylab topilgan tashrif raqamlari olib tashlangan edi. 🔴 BRAUZERDA O'LCHASH NUQSON TOPDI VA U KOD O'QIGANDA KO'RINMASDI: o'lchov avval faqat renderDrawer() da edi va «tortma ochiqmi» deb tekshirardi, openCart() esa AVVAL chizadi, .open klassini KEYIN qo'yadi — ya'ni tortmaning BIRINCHI ochilishi hech qachon sanalmasdi. Kod to'g'ri ko'rinardi, konsolda xato yo'q edi, testlar yashil edi (flex: none va <picture> oilasi). Endi o'lchov openDrawerEl() da. SINALGANI: 81 TEST PASS, 0 XATO — hisobotchi MUSTAQIL yurgizdi va ^✅ Test satrlarini sanadi (80 → 81, Test 42 yangi raqam). TEST 42 — 8 band, 13 MUTATSIYA bilan sinaldi, 13 tasi ham ushlandi; ekran ro'yxati qo'lda yozilmaydi, ikkala frontend manbasidan yig'iladi (28 ekran, 15 sayt + 15 Mini App). ⚠️ QOROVULNING O'ZIDA teshik topildi: Test 23 db/ dagi eng katta raqamli faylni SO'ZGA qarab tanlardi va db/028 IZOHIDA admin_actions_kind_check eslatilgani uchun uni «ro'yxat manbai» deb qabul qilib QIZIL bo'ldi — kod esa to'g'ri edi; endi SQL izohlari tahlildan oldin olib tashlanadi (sqlSofi). Bu Test 3f darsining takrori: qorovul MATNNI emas, KODNI o'qishi kerak. Kesh: script.js 53 → 55, admin/admin.js 25 → 26, telegram-app/app.js 99 → 100, panel.js 46 → 47, Test 16 jadvali birga. 🔴 DEPLOY QILINMAGAN VA ISH TUGALLANMAGAN HISOBLANADI: (1) db/028 haqiqiy Postgres'da HALI ishlamagan (pglite AYNI dvigatel emas) va u backenddan OLDIN qo'llanishi SHART, aks holda /api/track va /api/admin/traffic birdan yiqiladi; (2) server/ rsync qilinmagan va servis restart qilinmagan (--no-owner --no-group SHART); (3) frontend push qilinmagan; (4) PANEL BLOKI JONLI MA'LUMOT BILAN HECH QACHON KO'RILMAGAN — hamma ekran bo'sh holatda sinaldi; (5) TRAFFIC_SALT serverdagi .env ga qo'yilmagan (qo'yilmasa BOT_TOKEN hosilasi ishlatiladi — ishlaydi, lekin token almashsa o'sha kungi TASHRIFCHI soni bir oz shishadi). Hujjat: docs/sprintlar/sprint-7.md)";


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
