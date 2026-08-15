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
    { num: 9, nom: "Production + launch",       dars: "Dars 16", holat: "jarayonda", sana: "2026-08-14" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-15 (MINI APP PROFIL KARTASI FOUNDER REFERENSI ASOSIDA QAYTA DIZAYN QILINDI — renderTgCard() to'liq qayta yozildi: anor «mesh» gradient banner (faqat qizil oila — founder: «oq rangini yo'qot»; ranglar TOKENDAN, alpha color-mix bilan — Test 26 qoidasi), 66px dumaloq avatar oq halqa bilan bannerga chiqib turadi (mavjud 3 pog'onali mountAvatar yo'li saqlandi), galochka endi avatar burchagida (eski katta «Telegram orqali tasdiqlangan» pill o'rniga), ism tagida telefon (fmtPhone — faqat 998XXXXXXXXX chiroylanadi, boshqa shakl buzilmasdan xom qaytadi), stats qatori (Buyurtma / Yoqtirma / Rulon — chiziqsiz minimalistik) va keyingi unvongacha progress bar. O'CHIRILDI: «Muazzamxon Tekstil MChJ» kartasi, email, «2024 yildan beri» va o'lik ✏️ qalam tugmasi — HAMMASI kodga qo'lda yozilgan SOXTA ma'lumot edi (founder: «umuman kerak emas»); telefon yo'q bo'lsa soxta «+998 90 123 45 67» o'rniga «Raqam ulanmagan» + ulashish tugmasi. GEMIFIKATSIYA (founder g'oyasi): RANKS — 🌱 Mehmon 0+ → 🧵 Mijoz 10+ → 🤝 Hamkor 50+ → 🌷 Qadrdon 100+ rulon (🌷 = lola, brendning o'zi). Unvon YETKAZILGAN (delivered/completed) rulonlardan hisoblanadi — bekor qilingan / refunded ATAYLAB sanalmaydi: unvon xaridni mukofotlaydi, mojaroni emas. Chip glassmorphism + tovlanish animatsiyasi (chip-sheen, prefers-reduced-motion hurmat qilinadi), bosilganda unvonlar popoveri (o'tilganda ✓, hozirgisida «siz shu yerdasiz», kelajakdagisi xira), tashqariga bosilsa yopiladi. HALOLLIK — «O'YLAB TOPILGAN RAQAM KO'RSATILMASIN» QOIDASI KARTANING O'ZIGA HAM QO'LLANDI: buyerStats() — buyurtmalar serverdan sinxronlanmagan (S.ordersSynced bayrog'i loadOrdersFromServer da qo'yiladi) VA ro'yxat bo'sh bo'lsa null → stats ham, unvon chipi ham, progress ham UMUMAN chizilmaydi: yuklanmagan 0 haqiqiy 0 dek ko'rinmasin (NULL reyting oilasi). Yoqtirma soni «Saqlangan matolar» qatori bilan BITTA manba; Qadrdonda progress bar chizilmaydi — soxta 100% emas, intiladigan narsa qolmagani ko'rinadi. Yangi i18n kalitlar ikkala tilda (statOrders/statLikes/statRolls, rankPopTitle/rankHere/rankFoot/rankToGo, phoneNone). Kesh: styles.css 34→35, app.js 94→95, panel.js 35→36, Test 16 jadvali birga. SINALGANI: 74 TEST YASHIL — hisobotchi mustaqil qayta yurgizdi (74 ta ✅ satr); jonli brauzerda stub bilan: 62 rulon hisobi to'g'ri (bekor/refund sanalmadi), ma'lumot kelmaganda stats YO'Q, telefon yo'q holati, ruscha (Партнёр / «вы здесь»), Qadrdonda progress yo'q, popover ochish/yopish. Jonli Mini App'da (Telegram ichida) hali KO'RILMAGAN — deploy faqat statik, servis restarti kerak emas. Mockup docs/profil-karta-variantlar.html commitga KIRADI (ish materiali, deploy'ga chiqmaydi); docs/ishlash-sxemasi.html esa SHAXSIY fayl va ATAYLAB commitdan tashqarida. Hujjat: docs/sprintlar/sprint-0.md)";




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
