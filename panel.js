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
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-13" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-17, birinchi commit (SARALASH VA NARX VARAG'I (BOTTOM-SHEET) — IKKALA YUZDA, VA PRODUCTION'DA HECH QACHON ISHLAMAGAN ESKI NUQSON TUZATILDI. Ish IKKALA yuzga tegdi: sayt (index.html / script.js / style.css) va Mini App (telegram-app/app.js). NAMUNA: founder Shop ilovasining «Sort by» varag'ini referens berdi va «so'zlari bilan bizga moslab» dedi. Header'dagi filtr tugmasi (openSortSheet) endi VARAQ ochadi: «Saralash» + ×, to'rt radio (Tavsiya etilgan · Eng yangi · Arzondan → qimmatga · Qimmatdan → arzonga), pastda narx oralig'i, footer «Tozalash» / «Tayyor». Narx inputlari ilgari chiplar ostida edi — varaqqa KO'CHDI; chiplar ostida endi faqat qo'llangan holat izi (#sort-chip, #price-chip, har birida ×). ⚠️ QORALAMA QOIDASI IKKALA YUZDA BIR XIL: tanlov faqat «Tayyor» bosilganda qo'llanadi (Mini App'dagi narx varag'i 2026-07-31 dan shunday ishlardi — sayt UNGA tenglashtirildi). Saralash saytda CSS order bilan — DOM ko'chirilmaydi; narxi noma'lum kartochka ikkala yo'nalishda OXIRIDA. ⚠️ «ENG YANGI» — HALOL CHEKLOV: /api/products created_at QAYTARMAYDI, «yangi» faqat «Yangi» belgisi bo'yicha, sana o'ylab topilmadi (ochiq band). MINI APP: renderPriceSheet referens shakliga o'tdi, S.sortKey/S.sortDraft, sortProducts(), filterChipHtml(), clearSort(), clearPriceOnly(); T.sort kaliti HEAD da bor edi, tugma yo'q edi — «Saralash tugmasi hamon o'lik» yozuvi eskirdi. 🔴 FOUNDER QARORI: filtr yoki saralash qo'llanganda REKLAMA BANNERI CHIZILMAYDI. VARAQ IKKALA YUZDA MUALLAQ KARTA (12px havo, 28px burchak; desktopda 520px markazda). Webda varaq footeri krem fon (--pom-50) + hairline; qidiruv qutisi fondan ajraldi (fon .92 oq, ko'rinadigan chegara); ⚠️ × DOIM turadi — founder qarori, yashirilgani QAYTARILDI. 🔴 TOPILGAN ESKI NUQSON — 2026-08-13 QARORI PRODUCTION'DA HECH QACHON ISHLAMAGAN: .price-filter { display: flex } hidden atributidan KUCHLI edi, panel DOIM OCHIQ turgan; hisobotchi jonli style.css?v=63 da qayta tekshirdi (686-qator display: flex + index.html da hidden) — nuqson haqiqiy va hozir ham jonli. Endi .price-filter[hidden] { display: none }. IKKI TIL: saytda 9 yangi kalit, apply olib tashlandi, Test 20: 271 → 279 (HEAD bilan solishtirib o'lchandi); Mini App'da sortRec/New/Asc/Desc, sheetDone, sortRemove. SINALGANI: 80 TEST YASHIL (mustaqil yurgizildi, ❌ 0). ⚠️ Son O'ZGARMADI — yangi qorovul qo'shilmadi (varaq / saralash / [hidden] qoidasi qulflanmagan), qarz sprint-4 «Qarorlar» da. Layout o'lchovlari ish jarayonida olingan, hisobotchi qayta o'lchamadi. 🔴 DEPLOY QILINMAGAN, jonli saytda ko'rilmagan. DEPLOY: faqat STATIK — server kodiga tegilmadi (server/test.js faqat Test 16 jadvali), servis restarti va migratsiya KERAK EMAS. Kesh: style.css 63 → 64 (index.html va admin/index.html birga), script.js 52 → 53, telegram-app/app.js 98 → 99, panel.js 45 → 46, Test 16 jadvali birga. Hujjat: docs/sprintlar/sprint-4.md)";

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
