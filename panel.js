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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (SAYTDA BUYURTMALAR TARIXI PROFILDAN CHIQARILDI — endi Mening manzilim va Biz bilan boglanish bilan BIR XIL qator, royxatning ozi esa alohida korinishda. Sabab TAXMIN emas, eski tartib brauzerda OLCHANDI (375x812, oyna tanasi 750px, uchta buyurtma): buyurtma bloki 500px egallardi (oddiy qator 98px, bahs va ikki baholash qatori bolgani 259px), Mening manzilim qatorining TEPASI 723px da — ekran chegarasidan atigi 27px oldin, Biz bilan boglanish esa BUTUNLAY pastda qolgan, jami skroll 1047px/750px. Ustiga nuqson VAQT BILAN YOMONLASHARDI: buyurtma soni osgani sari bolimlar yanada pastga siljiydi. Yangi holatda profil tanasi 750/750 (skroll YOQ), uchala qator 64.5px — teng. Bu osha kundagi royxat YUQORIGA kochdi degan qarorni ALMASHTIRADI va eski yozuv ochirilmadi: mazmun avval qoidasi amalda BOSHQA mazmunni yashirgani korinib turishi kerak. Qator ostidagi izoh BAZADAN keladi — Yuklanmoqda / Hozircha buyurtma yoq / 3 buyurtma · Yolda (eng yangi buyurtma holati), oylab topilgan son YOQ. .order-list va .order-row ga flex: none qoyildi: oyna tanasi flex ustun, ya'ni bolasi QOLGAN JOYGA qarab siqiladi va buyurtma qatorining balandligi tarix ochilganda OZGARADI — osha kuni yozilgan qoidaning TORTINCHI a'zosi. YOL-YOLAKAY TOPILGAN NUQSON: backToProfile() fayl ichida IKKI MARTA, aynan bir xil tanada e'lon qilingan edi — ikkinchi e'lon birinchisini JIMGINA bekor qiladi, tahrirlagan odam hech narsa ozgarmaganini koradi va sababini topa olmaydi; endi ikkita ALOHIDA nishon. ORDER_STATUS yorliqlari faqat ozbekcha edi, ruscha saytda buyurtma holati ozbekcha chiqardi — endi {uz, ru} va L() bilan; jadval ATAYLAB STR ga kochirilmadi, kalitlari bazadagi orders.status qiymatlari. 60 TEST YASHIL (satrlar sanaldi, hujjatdan kochirilmadi), brauzerda uz va ru til, tort holat va formalardan qaytish jonli sinaldi, getBoundingClientRect() bilan kesilgan blok yoqligi olchandi (tarix ochilganda ham oshgan: 0). Kesh: script.js?v=41, style.css?v=50 (ikkala HTML da bir xil), Test 16 jadvali birga. HALOL CHEGARA: DEPLOY QILINMAGAN; Mini App ga tegilmadi (u yerda buyurtmalar allaqachon alohida ekranda — tekshirildi); bu ish uchun yangi test YOZILMADI, qoshilgan test soni NOL; ishlatilmagan tarjima kalitlari soni 16 da QOLDI.)";




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
