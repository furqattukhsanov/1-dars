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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (MINI APP PROFILIDA HAM BUYURTMALARIM QATORI PAYDO BOLDI — LEKIN ROYXAT KOCHIRILMADI, VA BU IKKI YUZ ORASIDAGI ATAYLAB QILINGAN FARQ. Founder: mini appda ham shunday qilgin — bugungi sayt ishining juftligi. Saytda qator YANGI korinish ochgan, chunki u yerda buyurtmalar profil ichida chizilib boshqa bolimlarni bosib turardi; Mini App da esa buyurtmalar ALLAQACHON OZ EKRANIDA yashaydi (pastdagi navigatsiya), yani kochiriladigan narsa YOQ va qator MAVJUD ekranga IKKINCHI ESHIK qoyadi. Bir xillik SHAKLDA (profil bolimlari royxati), mexanizmda emas: mini appdan navigatsiya tabini olib tashlash yoki ekranni profil ichiga solish REGRESSIYA bolardi. Yuqoridagi Mini App ga tegilmadi bandi ANIQLASHTIRILDI, ochirilmadi — u MEXANIZM haqida togri edi, bir xil bolmagan narsa PROFIL BOLIMLARI ROYXATI edi. QOSHILGANI: renderOrdersRow() — profileRow() orqali chizilgan qator, manzil va aloqa bilan bir xil shakl; ICO.receipt — saytdagi belgi bilan HARFMA-HARF bir xil (solishtirildi, koz bilan qaralmadi); yangi T.ordersNone kaliti (uz va ru). profileRow() ning CHEGARASI kengaytirildi — arg qoshildi: ilgari u FAQAT argumentsiz amalni chaqira olardi, yani tab('orders') kabi amalni qator orqali berish IMKONSIZ edi; delegatsiya data-arg ni allaqachon oqiydi, yetishmagan joy faqat uni CHIZISH edi. QATOR OSTIDAGI IZOH MALUMOTDAN KELADI, oylab topilgan son YOQ: bosh bolsa Hozircha buyurtma yoq, bolsa 2 buyurtma · Yolda (eng yangi buyurtma holati) — yorliq MAVJUD STATUS_TXT jadvalidan, yani yangi tarjima jadvali YARATILMADI. ORDERS[0] eng yangisi ekani IKKI manbada TEKSHIRILDI: unshift bilan boshiga qoyiladi va serverdan created_at DESC bilan keladi. T.ordersCount esa YANGI EMAS — bu ish OLIK KALITNI TIRILTIRDI: u ikkala tilda bor edi va hech qayerda ishlatilmayotgan qoldiq edi. OLCHANDI, KOZ BILAN QARALMADI (375x812, getBoundingClientRect): Buyurtmalarim 65.2px, Til 62px, Bildirishnomalar 62px, Mening manzilim 65.2px, Biz bilan boglanish 65.2px, Ijtimoiy tarmoqlar 62px — hech biri KESILMAGAN; 62 va 65.2 farqi naqshdan, izohli qatorlar ikki qatorli. 60 TEST YASHIL (satrlar SANALDI, hisobotdan kochirilmadi — kechagi 48 test darsi). Brauzerda jonli: qator bosilganda S.screen orders ga otdi va ekran chizildi, bosh holat, bitta buyurtma va RUSCHA yol alohida tekshirildi, konsolda JS xatosi yoq. app.js?v=82 haqiqatan yuklangani TARMOQ SOROVI bilan tasdiqlandi va CACHE_VERSION oshirilishi KERAK EMASLIGI ham tekshirildi — app.js service worker PRECACHE royxatida YOQ, Test 17 yashil. Kesh: telegram-app/app.js?v=82, panel.js?v=19, Test 16 jadvali birga. HALOL CHEGARA: DEPLOY QILINMAGAN; TELEGRAM ICHIDA KORILMAGAN — brauzerda sinaldi, Mini App ning haqiqiy muhiti WebView va buyurtmalari BOR haqiqiy xaridorda ham korilmagan; YANGI TEST YOZILMADI, qoshilgan test soni NOL — va bu yerda KONKRET KOR NUQTA bor: Mini App ning STR jadvali uz/ru toliqligini HECH QANDAY test qoriqlamaydi (Test 20 faqat script.js ni, Test 14j faqat serverdagi AI yorliqlarini qamraydi), yani yangi ordersNone kaliti bir tilda tushib qolsa buni hech narsa aytmaydi.)";




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
