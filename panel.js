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
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-18" },
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-19" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-19, ikkinchi commit (HISOBOTCHI AGENTINING O'Z TA'RIFI YANGILANDI — bu JARAYON o'zgarishi, KOD EMAS: 86 test o'zgarmadi va bu MUSTAQIL o'lchandi, ^✅ Test satrlari sanaldi. To'rt band. 1) Co-Authored-By QATORI SHABLONDAN OLIB TASHLANDI: model nomi ta'rifda QOTIB yozilgan va ESKIRGAN edi — bugun agent noto'g'ri nom taklif qildi va commit'da uni qo'lda to'g'irlashga to'g'ri keldi; endi qatorni muhitning O'ZI qo'shadi. Dars: vaqt bilan o'zgaradigan qiymat shablonga QOTIRILMASIN — u eskirganda hech narsa qichqirmaydi, faqat noto'g'ri natija chiqadi. 2) git push ENDI HISOBOTCHI ISHI EMAS: push tashqi dunyoga chiqadi va CI orqali production deploy'ini ishga tushiradi, ya'ni u hisobotning davomi emas, ALOHIDA QAROR — uni founder o'zi qabul qiladi. Agent endi git add va git commit gacha boradi, undan nariga emas. 3) YANGI 0-BO'LIM «DA'VONI KO'CHIRMA — O'LCHA»: chaqiruvchi agentning «testlar yashil», «bu qator faylda bor», «migratsiya kerak emas» degan gaplari TEKSHIRILMAGAN DA'VO deb qaraladi va muhimlari O'LCHANADI — test yurgiziladi, fayl ochib ko'riladi, yangi qorovul esa MUTATSIYA bilan buzib sinaladi; tekshira olinmagan da'vo hisobotda AYNAN shunday, «tekshirilmadi» deb belgilanadi. ⚠️ Bu qadamlarning hammasi 2026-08-19 ning BIRINCHI sessiyasida allaqachon bajarilgan edi, lekin ta'rifda YOZILMAGANI uchun TASODIFGA bog'liq edi — bir marta qilingan ish odat emas. 4) YANGI «XAVFSIZLIK QOIDALARI» BO'LIMI: git checkout <fayl> TAQIQLANADI va o'rniga cp bilan nusxa olib nusxadan tiklash ko'rsatildi; rm -rf va git reset --hard umuman yo'q; tekshirish uchun kiritilgan HAR QANDAY o'zgarish qaytariladi va oxirida git status bilan TASDIQLANADI. Sabab: o'sha kuni agent git checkout index.html bilan commit QILINMAGAN tahrirni o'chirib yuborgan — tiklandi, lekin TASODIFAN, chunki zaxira nusxa olinmagan edi. ⚠️ NEGA AYNAN ENDI: bu xato 2026-08-07 dagi Test 17 yozuvida ALLAQACHON ogohlantirilgan edi va shunga qaramay takrorlandi — ogohlantirish HISOBOTDA turgan, AGENT TA'RIFIDA esa turmagan; agent esa har chaqirilganda o'z ta'rifini o'qiydi, eski hisobotlarni emas. Shuning uchun dars yozilishi kerak bo'lgan joy — ISH BAJARUVCHINING KO'RSATMASI, ish natijasining hisoboti emas. YO'L-YO'LAKAY O'LCHANDI VA ESKI OGOHLANTIRISH YOPILDI: oldingi yozuvda «backend ko'tarilmasa Eng yangi ZAXIRA rejimda ishlaydi va buni hech narsa ko'rsatmaydi» deb turgandi — endi /api/version = 681a19f va /api/products da createdAt 24/24 mahsulotda BOR, ya'ni backend ko'tarilgan va saralash HAQIQIY sanada ishlayapti. ⚠️ LEKIN RAQAM ANIQLASHTIRILDI: «14 xil sana» degani 14 xil TIMESTAMP, kalendar KUNI esa atigi 6 ta (11 mahsulot bitta kunda, 2026-07-23) — ya'ni saralashda TENG qiymatlar bor va teng qiymatlar orasidagi tartib aniqlanmagan; bu nuqson emas, lekin «14 xil sana» iborasi kunlar deb o'qilsa YOLG'ON bo'lardi. 🔴 Founder panelni hali KO'Z BILAN ko'rmagan. DEPLOY: faqat STATIK (panel.js, loyiha-panel.html) — backend TEGILMADI, migratsiya YO'Q. PUSH QILINMADI: yangi ta'rif bo'yicha push hisobotchi ishi emas, founder qaroriga qoldirildi. Hujjat: docs/sprintlar/sprint-8.md)";


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
