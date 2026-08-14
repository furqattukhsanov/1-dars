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
  updatedEl.textContent = "Yangilanish: 2026-08-14 (KATALOG CHIPLARI TUZATILDI — founder shikoyati: kategoriya chiplari qatori barmoq bilan ushlanganda tepa-pastga QIMIRLAB yurardi. Sabab: .cat-chips gorizontal skroll qatori, lekin touch-action cheklanmagani uchun brauzer undan VERTIKAL surishni ham qabul qilardi. Tuzatish IKKI QATOR CSS: touch-action: pan-x (bu elementda barmoq faqat gorizontal suradi) va overscroll-behavior-x: contain (qator chetida skroll otaga toshib otmaydi). DIZAYNGA ATAYLAB TEGILMADI — founder referens beradi, dizayn alohida bosqich; bu faqat xatti-harakat tuzatishi. Brauzerda tekshirildi: ikkala qoida .cat-chips da haqiqatan qollangan, ?v=31 yuklanadi. || YOL-YOLAKAY: branch origin/main dan 4 commit orqada edi — birlashtirildi, server/test.js konfliktida upstream raqamlari (admin.js 25, app.js 88) olindi, styles.css birlashgan tarkib uchun 31 ga surildi. || Kesh: telegram-app/styles.css 30 → 31, panel.js 25 → 26, Test 16 jadvali birga. Barcha server testlari yashil. DEPLOY: faqat statik, servis restarti kerak emas. || Avvalgi sessiyadan qolgan hujjat ham commitga kiradi: CLAUDE.md dagi CSP qoidasi (YANGI RASM SXEMASI YOKI DOMENI — royxat shu zahoti tekshirilsin, Test 25 qorovuli) va yangi hr agenti (.claude/agents/hr.md) — kod allaqachon main da, hujjati qolib ketgan edi.)";




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
