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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (TORT AGENT LOYIHANI BAHOLADI, FOUNDER TORT BANDNI TANLADI — VA SESSIYANING ENG QIMMATLI NATIJASI KOD EMAS, UCH MARTA TAKRORLANGAN BITTA NAQSH: YOZILGAN QOIDA HIMOYA EMAS, UNI TEKSHIRADIGAN TEST HIMOYA. Uchala tasdiq ham AYNI shaklda keldi — qoida yozilgan edi, hech kim buzmoqchi bolmagan edi, va u shunday ham buzilgan holda turardi: (1) VIDEO CHEGARA QOROVULI (videoRadSababi) catalog.js da sinov uchun ATAYLAB ochiq degan izoh bilan eksport qilingan — testi esa HECH QACHON yozilmagan; (2) BREND RANGI TOKENDAN OLINSIN qoidasi telegram-app/styles.css da yozilgan, app.js uni 81 JOYDA buzardi (#7a140d 41, #510100 20, #8f1a10 20 — SANALDI); (3) QOLDIQ xotirasidagi IKKI YOZUV ESKIRGAN edi va ular boyicha ish boshlanayozdi. #3 ANALITIKA: db/025 — users.src ustuni, /start deep-link manba belgisi (t.me/bot?start=guruh_ipak). Belgi BIRINCHI TEGINISHDA QULFLANADI (COALESCE(users.src, EXCLUDED.src)) va tartib TESKARI bolsa raqam ozini ozi tasdiqlaydigan yolgonga aylanardi: oxirgi manba yozilganda eng kop ESLATMA yuborgan kanal eng samarali korinib qolardi va reklama byudjeti aynan shu yolgonga qarab taqsimlanardi. Payload RO'YXAT bilan emas SHAKL bilan tekshiriladi (manbaBelgisi) — kanallar royxatini kodga kochirish admin_actions_kind_check tuzogi bolardi, yangi kanal ochilganda deploy talab qilinardi. Admin panelda ikki yangi blok: Qaysi kanaldan kelishdi va AI kiyim rasmi. src IS NULL KANALLAR ROYXATIGA QOSHILMAYDI — u manba nomalum degani, TOGRIDAN-TOGRI KELDI DEGANI EMAS; aralashtirilsa eng katta kanal olchanmagan qatorlar bolib chiqardi (NULL reyting qoidasi). Kanal qatorida count yonida engaged turadi: havola odamni OLIB KELGANI bilan uning ilovani OCHGANI bir narsa emas. 🔴 YOL-YOLAKAY: QOLDIQ da /start hisoblagichi yoq deb turardi — aslida u db/020 bilan 2026-08-08 da qoshilgan, yani yozuv 10 KUN ESKIRGAN edi va tekshirilmasdan ish boshlanganda MAVJUD hisoblagich ikkinchi marta qurilardi. #5-C VIDEO: routes/seller.js javobida vid_ qatori 0 MARTA uchrardi (grep) — sotuvchi videosini yuborardi va undan keyin uning taqdiri haqida HECH NARSA bilmasdi. Endi videoVM(r) va awaitingVideo qaytadi (videoVM KATALOGDAGI AYNI funksiya, ikkinchi nusxa yozilmadi — R2 kaliti yoq bolsa video null qoidasi bu yerda ham OZIDAN keladi). Yangi request_video amali video oynasini QAYTA ochadi va bu YANGI YOL EMAS, MAVJUD BOSHLIQ: oyna birinchi video kelishi bilan YOPILARDI, yani moderator videoni olib tashlagan elon ABADIY videosiz qolardi. Ikkala yuzda uch holatli qator — video BOR / oyna OCHIQ / yol YOPIQ, tugma FAQAT uchinchisida (kechagi mavjud funksiyaga ikkinchi yol qoshilsa avval soraladi qoidasi SHU YERDA QOLLANDI, birinchi marta). #5-F QOROVUL TESTLAR: Test 24 video chegarasi (mp4, 30s, 12MB) — 8 yaroqsiz kombinatsiya rad etiladi, CHEGARA QIYMATINING OZI qabul qilinadi, tekshiruv R2 GA YUKLASHDAN OLDIN boladi va rad etish sababi sotuvchiga AYTILADI; Test 24b — R2 siz video null va TAXMINIY HAVOLA YASALMAYDI. #6 YOPILDI: founder AI rasmini chizdirdi va chat effektini JONLI kordi, yani effekt id endi hujjatdan olingan dagvo emas — DALIL TURI ALOHIDA YOZILDI VA U OLCHOV EMAS, FOUNDER SOZI (Telegram effekt otilganini API javobida qaytarmaydi, yani bu holatda odam kozi mavjud dalilning eng kuchlisi). #7 DIZAYN QARZI: 81 xom rang tokenga otdi va Test 26 qulfladi — U DARROV ISH BERDI: index.html da AYNI rang SVG fill= PREZENTATSIYA ATRIBUTIDA 11 MARTA turgan edi, 🔴 U YERDA var() UMUMAN ISHLAMAYDI va fill=var(--pom-700) JIMGINA QORA berardi, yani tozalash tasdiq belgisini butun saytda qora qilib qoyardi va konsolda hech qanday xato bolmasdi; togri yol — fill=currentColor + rang CSS klassida. Yandex Maps iconColor va KONFETTI_RANG ATAYLAB istisno (CSS emas, JS qiymati). Brend nomi tenglashtirildi: Mini App headerida JS kelguncha TELEGRAM MINI APP degan TEXNIK atama korinardi — endi app.js dagi brandSub bilan AYNI (Ulgurji matolar bozori); sayt title ham shu ibora bilan boshlanadi, LEKIN SEO IBORASI TASHLANMADI (to'qima materiallar B2B sarlavhaning ikkinchi yarmida qoldi). 🔴 user-scalable=no OLIB TASHLANMADI — OLCHOV TAVSIYANI RAD ETDI: html va body ikkalasida overflow hidden, sahifaning OZI umuman skroll qilmaydi (scrollHeight === clientHeight), yani zoom qilingan foydalanuvchi kattalashgan mazmun boylab surila olmasdi va QAMALIB qolardi, chiqish yoli ilovani yopish bolardi; ehtiyoj HAQIQIY, yechim boshqa — shrift olchamlari qatiy px da, haqiqiy tuzatish tipografiyani nisbiy birlikka otkazish, band OCHIQ qoldirildi. SINALGANI: 64 TEST YASHIL (avval 60 edi — 4 yangi: 24, 24b, 25, 26), raqam runner chiqishidagi satrlardan MUSTAQIL sanaldi; 12 MUTATSIYA BILAN SINALDI, 12 TASI HAM USHLANDI. db/025 pglite da HAQIQATAN BAJARILDI (migratsiya + birinchi teginish qoidasi + panel sorovlari) — taqlid qilingan pool.query SQL matnini TEKSHIRMAYDI, yani yashil test SQL togri degani emas; migratsiyaning OZIDA ham RAISE EXCEPTION bilan tekshiruv bloki bor. Brauzerda olchandi: verified belgisi currentColor dan keyin ham AYNAN rgb(122,20,13); .s-note bloklari kesilmagan; panel bloklari malumot yoq bolsa YASHIRINADI, bosh kanal royxatida esa halol bosh holat korsatadi. Kesh: style.css 50→52 (index.html va admin/index.html da BIR XIL raqam), script.js 41→43, admin.js 24→25, telegram-app/styles.css 25→26, telegram-app/app.js 81→82, panel.js 20→21, Test 16 jadvali birga; CACHE_VERSION TEGILMADI va bu TEKSHIRILDI — ozgargan fayllarning birortasi ham PRECACHE royxatida yoq, Test 17 yashil. 🔴 HALOL CHEGARA: PUSH QILINMAGAN; db/025 SERVERDA ISHGA TUSHIRILMAGAN va u webhook.js deployidan OLDIN bajarilishi shart — aks holda /start bosgan har bir odam column src does not exist xatosiga uchrardi, yani BOTGA KIRISH BUTUNLAY OLARDI; server/ rsync va servis restarti founder zimmasida; manba belgisining OZI jonli sinalmagan — haqiqiy t.me havolasi hali bosilmagan. Hisobot 2026-08-14 kun boshida yozildi, ish kuni esa 08-13.)";




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
