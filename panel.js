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
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-14" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-14 (KATEGORIYA CHIPLARI YANGI DIZAYNGA OTDI — founder 3 lokal variantdan OSTKI CHIZIQ (B) ni tanladi (avval A anor linza tanlangan, keyin fikr ozgardi). Quti chiplar orniga qutisiz tablar: matn --text-muted, tanlangani --pom-700 + qalin + ikat rombi + markazdan ochiladigan gradient chiziq (.cat-line), ranglar tokendan (Test 26). CHIZIQ ::after EMAS, ALOHIDA ELEMENT — global button::after (44x44 tap-maydon) har tugmaning ::after ini band qilgan, unga chizilgan narsa 44px blok bolib chiqardi (lokal demoda olchab topildi). SAYTDAGI .chip BILAN BIR XIL qoidasi shu yerda ATAYLAB buzildi — founder Mini App uchun alohida korinishni tanladi, sayt eski retseptda; sayt ham otsinmi — alohida qaror kutilmoqda. touch-action: pan-x (ertalabki tuzatish) saqlangan. app.js da yangi focusCatChip(): tanlangan chipni qatorda markazlaydi va chiziq animatsiyasini innerHTML almashgandan keyin qayta oynatadi — scrollIntoView ATAYLAB ishlatilmadi, u #screen-wrap ni vertikal surib yuborardi. YOL-YOLAKAY NUQSON TUZALDI: katalogga qaytganda chiplar qatori boshiga qaytib qolardi — endi tanlangan chip markazda qoladi. Kesh: telegram-app/styles.css 31 → 32, app.js 88 → 89, panel.js 26 → 27, Test 16 jadvali birga. Brauzerda tekshirildi (skrinshot bilan): tanlov, animatsiya, markazlash, filtr. 67 test yashil. DEPLOY: faqat statik, servis restarti kerak emas. Lokal demo fayl (_ds/chips-variantlar.html) ATAYLAB commitdan tashqarida.)";




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
