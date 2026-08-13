/* LolaMarket — sprint progress paneli.
   Ilgari bu kod `loyiha-panel.html` ichida inline `<script>` blokida
   turardi. CSP dan `'unsafe-inline'` olinganda (C3) u jimgina o'lardi:
   sprint kartochkalari umuman chizilmasdi, progress bar bo'sh qolardi.
   Faylni `hisobotchi` agenti yangilaydi — sprint holati va sana shu yerda. */

  const sprintlar = [
    { num: 0, nom: "Dizayn va ekranlar",        dars: "Dars 7",  holat: "tugadi",  sana: "2026-07-29" },
    { num: 1, nom: "Telegram Mini App MVP",     dars: "Dars 8",  holat: "tugadi",  sana: "2026-07-31" },
    { num: 2, nom: "Ma'lumotlar bazasi / Backend", dars: "Dars 9",  holat: "tugadi", sana: "2026-07-23" },
    { num: 3, nom: "Foydalanuvchilar + rollar", dars: "Dars 10", holat: "tugadi", sana: "2026-07-29" },
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-13" },
    { num: 5, nom: "Mobil / PWA",               dars: "Dars 12", holat: "jarayonda",  sana: "2026-08-13" },
    { num: 6, nom: "Integratsiyalar",           dars: "Dars 13", holat: "jarayonda",  sana: "2026-07-22" },
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-13" },
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-07" },
    { num: 9, nom: "Production + launch",       dars: "Dars 16", holat: "jarayonda", sana: "2026-08-13" },
    { num: 10, nom: "AI kiyim rasmi",           dars: "Dars 17", holat: "tugadi", sana: "2026-08-13" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (MINI APP PROFILIDAGI BUYURTMALARIM QATORI OLIB TASHLANDI — oldingi commit (7d5e47f) ORQAGA QAYTARILDI. Founder buyurdi va sababi aniq: MINI APP DA BUYURTMALAR BOLIMI ALLAQACHON BOR EDI (pastdagi navigatsiya, renderOrders()), yani qator ORTIQCHA IKKINCHI ESHIK edi. 🔴 BU YOZUVNING ENG MUHIM QISMI FUNKSIYA HAQIDA EMAS, DARS HAQIDA: ortiqchalik BILIB TURIB qoshilgan. Oldingi commitning OZ izohida va sprint yozuvida mini appda buyurtmalar allaqachon oz ekranida yashaydi, yani KOCHIRILADIGAN NARSA YOQ deb YOZILGAN edi — fakt QOLDA EDI, XULOSA ESA CHIQARILMADI. Togri qadam qoshishdan OLDIN sorash edi: bu ortiqcha bolishi mumkin, kerakmi. Founder shunday qilgin degani foydali bolsa qil degani emas — MAVJUD FUNKSIYANING USTIGA IKKINCHI YOL QOSHILGANDA AVVAL SORALADI. QAYTARILGANI: telegram-app/app.js git checkout 384e28f bilan ozgarishdan OLDINGI holatga qaytdi va BAYT-BAYTGA mos (hash 193eb813a690, 384e28f dagi bilan bir xil — solishtirildi, koz bilan qaralmadi); renderOrdersRow, ICO.receipt, kvitansiya belgisi, ordersNone kaliti va profileRow ning arg qoshimchasi — hammasi ketdi, grep bilan har biri 0 marta uchraydi. KESH VERSIYASI ORQAGA TUSHDI — app.js?v=82 dan v=81 ga, VA BU YERDA TOGRI: fayl TARKIBI ham aynan v81 dagi tarkib, yani kesh kaliti tarkibga QAYTA MOS keldi; 2026-07-22 dagi versiya orqaga tushdi nosozligidan farqi shu — oshanda tarkib BOSHQA edi. SINALGANI: 60 TEST YASHIL (runner chiqishidagi satrlar SANALDI, hisobotdan kochirilmadi), Test 16 jadvalidagi app.js va panel.js hashlari birga tushirildi. Brauzerda jonli (mobil 375x812): profil qatorlari endi AVVALGI BESHTASI — Til, Bildirishnomalar, Mening manzilim, Biz bilan boglanish, Ijtimoiy tarmoqlar; Buyurtmalarim qatori YOQ. REGRESSIYA TEKSHIRUVI: pastdagi navigatsiyadagi Buyurtma tugmasi bosildi — S.screen orders ga OTDI va ekran togri chizildi (Faol / Tarix / LM-2481 / Yolda / Margilon ipak ikat), yani buyurtmalar bolimining OZI shikastlanmadi; konsolda JS xatosi yoq. Kesh: telegram-app/app.js?v=81, panel.js?v=20. 🔴 ENG MUHIM HALOL CHEGARA, VA U OLCHANDI: ORTIQCHA QATOR AYNI PAYTDA PRODUCTIONDA VA XARIDOR UNI KORIB TURADI — oldingi commit push qilingan, CI Deploy to Server yurishi SUCCESS bolgan (12:53:57Z) va jonli lolamarket.uz/mini-app/index.html hamon app.js?v=82 ni chaqiradi, jonli fayl hashi cca346ab4d3a, yani AYNAN qaytarilgan versiya. BU QAYTARISH PUSH QILINMAGUNCHA PRODUCTIONDA HECH NARSA OZGARMAYDI. Yol-yolakay: oldingi commitdagi DEPLOY QILINMAGAN dagvosi ENDI ESKIRGAN — u yozilgan lahzada togri edi va push CI ni ishga tushirgani bilan yolgonga aylandi, yani vaqtga boglangan gap yonida uni tekshiradigan buyruq turishi kerak degan dars (osha kuni video bandida yozilgan) IKKINCHI MARTA tasdiqlandi. Eski yozuvlar sprintda va panelda OCHIRILMADI — ustiga olib tashlangani va SABABI belgilandi.)";




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
