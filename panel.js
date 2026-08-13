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
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-08" },
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-07" },
    { num: 9, nom: "Production + launch",       dars: "Dars 16", holat: "jarayonda", sana: "2026-08-06" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (AI RASMI TAYYOR BOLGANDA ENDI BAYRAM — VA ASOSIY TOPILMA BOSHLANGICH TAXMIN NOTOGRI CHIQQANIDA EDI. Taxmin: Telegramning quizdagi konfettisi bor, uni chaqiramiz. Tekshirildi va NOTOGRI: productiondagi JONLI SDK oqildi — window.Telegram.WebApp da bayramga aloqador narsa faqat HapticFeedback ning uchta metodi, konfetti metodi YOQ; rasmiy changelog ham tasdiqladi — message_effect_id CHAT XABARI uchun qoshilgan (Bot API 7.4), Mini App SDKsiga berilmagan. Tekshirilmasa mavjud bolmagan metodni chaqiradigan kod try/catch ichida JIMGINA hech narsa qilmasdi: konsolda xato yoq, tugma ishlaydi, bayram esa yoq. Shuning uchun bayram IKKI KANALDAN keladi: ilova ichida ozimiz chizgan konfetti (42 bolak, brend ranglari, pointer-events none — aks holda ekran 3 soniya bosishni yutib turardi va bayram xaridorni ulashish tugmasidan uzardi; prefers-reduced-motion JS va CSSda ikki qatlam), Telegram chatida esa HAQIQIY effekt — yangi sendPhotoWithEffect() tayyor rasmni foydalanuvchining OZ chatiga message_effect_id bilan yuboradi va baytlar QAYTA YUKLANMAYDI (file_id, rasm Telegramda allaqachon yotibdi); yon foydasi rejalashtirilmagan edi: xaridor ilovani yopsa ham rasm chatida qoladi. ENG MUHIM QAROR: BAYRAM HECH QACHON XABARNI YOQOTMAYDI — Telegram notogri effekt idda BUTUN sendPhoto sorovini rad etadi, yani qaytarish yoli bolmasa xaridor tayyor rasmni chatda UMUMAN olmasdi va buni hech narsa korsatmasdi chunki ilovada rasm baribir korinadi; endi rad javobida bir marta effektSIZ takrorlanadi (R2 va tasma qarorlari bilan bitta oila: qoshimcha qulaylik asosiy natijani garovga qoymaydi). Chaqiruv kreditni qaytaradigan trydan TASHQARIDA va oz trysi bilan oralgan, xato esa YUTILMAYDI — console.error alertga chiqadi. Yangi sozlama AI_IMAGE_EFFECT_ID SHAKLI boyicha tekshiriladi (ALERT_CHAT_ID darsi: .env da namuna qolsa u bosh emas va || uni haqiqiy qiymat deb qabul qilardi) — yaroqsizi jurnalda qichqiradi va effektsiz ishlanadi. TEST 21 qoshildi va u BIR MARTA ALDANDI: effektsiz qayta urinish ochirilganda test YASHIL qolgan edi, chunki butun funksiya tanasidan qidirib effekt shoxidan TASHQARIDAGI chaqiruvni topib bor ekan degan; endi faqat if (effectId) blokining ichi qavs hisobi bilan ajratib oqiladi va qayta sinaganda beshala mutatsiya ham ushlandi — QOROVULNING OZI HAM MUTATSIYA BILAN SINALMASA QOROVUL EMAS darsi ikki kunda ikkinchi marta. 56 TEST PASS (edi 55), raqam ikki mustaqil usul bilan olindi. Kesh: mini-app styles.css v23, app.js v75, panel.js v14. HALOL CHEGARA: haqiqiy Telegram bilan chat xabari va effekt HECH QACHON otilmagan — effekt id hujjatdan olingan, jonli tasdiqlanmagan, va aynan shu sabab effektsiz qaytarish yoli yozildi; server/ deployi qolda — founder bajaradi.)";




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
