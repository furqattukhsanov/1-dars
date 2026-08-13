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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (▶ BELGISI KARTOCHKADAN OLIB TASHLANDI — FOUNDER QARORI, VA YOZUVNING QIMMATLI QISMI KOD EMAS SABAB. Belgi bir necha soat oldin AYNI kunda qoshilgan edi va uni FOUNDER SORAMAGANDI: u 3 soniyalik hover funksiyasi yoniga, sensorli ekranda ham izsiz qolmasin degan mulohaza bilan ozimcha qoshilgan; oshanda buni ochiq aytgandim, founder esa endi ortiqcha deb topdi. Yani kod notogri emas edi, ORNI notogri edi — bu d680722 da CLAUDE.md ga yozilgan mavjud funksiyaga ikkinchi yol qoshilsa avval soralsin qoidasining amaldagi narxi. OLIB TASHLANGANI (faqat frontend, server TEGILMADI): script.js dagi apiCardHtml dan belgi qatori, telegram-app/app.js da AYNI narsa IKKI joydan (productCard va homeCard — ikkinchisi media-mark-lo variantida edi), style.css va telegram-app/styles.css dan .media-mark qoidalari. is-preview klassi ATAYLAB birga ochirildi: u FAQAT hover paytida ▶ belgisini yashirish uchun bor edi va belgi ketgach OLIK KOD bolib qolardi — olik CSS klassi zararsizdek korinadi, lekin keyingi odam uni korib demak preview holati bor deb oylardi va yoq mexanizmga tayanardi. Tekshirildi: media-mark, media-mark-lo va is-preview tortala faylda 0 MARTA uchraydi, faqat NEGA olib tashlangani yozilgan izohlarda nomi qolgan (ataylab — sabab qaytib kelishi mumkin). 3 SONIYALIK HOVER MEXANIZMIGA (.media-hover) TEGILMADI va bu alohida tekshirildi, chunki ikkovi bir-biriga yopishib turadi: hoverMediaArm va bindHoverMedia tanasi qayta oqildi, .media-hover tortala faylda joyida, node --check ikkalasida otdi. HALOL CHEGARA — NATIJA, NUQSON EMAS: endi TELEFONDA video borligi kartochkadan UMUMAN BILINMAYDI, u faqat mahsulot ekranidagi galereyada korinadi, 3 soniyalik korish esa faqat sichqonchali muhitda (Telegram Desktop, sayt). Bu bilib qilingan tanlov — kartochka tozaligi muhimroq deb topildi — lekin yozib qoyilishi shart, chunki kashf etilmaydigan funksiya keyinchalik funksiya ishlamayapti bolib qaytib kelishi mumkin. BRAUZERDA KOZ BILAN KORILMADI: Browser paneli bu sessiyada siyosat bilan yopiq edi, tekshiruv TUZILMA darajasida (qoldiq izlash, funksiya tanasini oqish, sintaksis, 62 test) va bu koz bilan korishning ornini BOSMAYDI. ESKIRGAN DAVO TUZATILDI: Ochish menyu tugmasi bandida Telegramda koz bilan korilmagan degan chegara turgandi — founder tugmani bot chatida OZ KOZI bilan kordi, yani chegara YOPILDI va sprint yozuvi yangilandi; eskirgan davo qoldirish bu loyihada takrorlangan nuqson (sayt-eski papkasi, shriftlar 250 KB, 32 test — hammasi shu oiladan). Kesh: style.css v52, script.js v43, telegram-app/styles.css v29, telegram-app/app.js v85, panel.js v22; admin/index.html dagi style.css ham 52 ga kotarildi. Test 16 jadvali birga, 62 TEST YASHIL. DEPLOY: faqat statik — server tegilmagani uchun rsync va servis restarti KERAK EMAS, push CI ni ishga tushiradi.)";




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
