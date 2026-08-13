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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (FOUNDERNING ON BANDI BIR SESSIYADA YOPILDI — toqqiztasi Sprint 4 ga, oninchisi (AI rasmi) Sprint 10 ga yozildi. Bandlarning ozi kichik, lekin ostidan IKKITA JIMGINA NUQSON chiqdi va ular bandlardan qimmatroq. BIRINCHI: Mini App da sevimli (yurakcha) tugmasi UMUMAN BOSILMASDI — u .pd-hero ichida, SHAFFOF header qutisi OSTIDA turardi va elementFromPoint tugma MARKAZIDA header ni qaytarardi; koz bilan hammasi joyida korinardi (tugma chizilgan, konsolda xato yoq), shuning uchun nuqson qancha vaqt yashaganini bilib bolmaydi. Endi orqaga, yurakcha va Kiyimda korish chipi HEADER ning ozida, bitta qatorda (olchandi: uchalasi top:10px, 38px, header 58px da qoldi); chip position: absolute, chunki oqimda turganda korinmas sarlavhani ikki qatorga tushirib header ni 75px ga chozardi. IKKINCHI: saytdagi filtr tugmasida pointer-events: none turardi va yonida faqat bezak — bosilmaydi deb YOZIB QOYILGANDI, yani foydalanuvchi filtr belgisini korardi, bosardi va HECH NARSA bolmasdi; endi haqiqiy tugma (togglePriceFilter, is-on holati, aria-expanded). fade-up klassi OLIB TASHLANDI — u IntersectionObserver ga tayanadi va hidden element hech qachon korinmaydi, yani panel ochilganda opacity:0 da qotib qolardi. Panel JOYI ozgarmadi (olchandi: chips 391px, panel 433px, grid 566px) va filtr YOQILGAN bolsa majburan ochiq qoladi, chunki filtr chipi shu blok ichida — yopilsa katalog sababsiz kam mahsulot korsatardi. QOLGAN BANDLAR: profil surati endi TELEGRAM AVATARIDAN — yangi GET /api/me/photo, initDataUnsafe.photo_url ATAYLAB ishlatilmadi (u faqat biriktirma menyusidan ochilganda keladi, saytda esa initData UMUMAN yoq — bir yuzda ishlab ikkinchisida ishlamaydigan yechim), Telegram fayl MANZILI qaytarilmaydi chunki unda BOT TOKENI bor, faqat baytlar proksi qilinadi, Cache-Control: private (shaxsiy surat public bolsa Cloudflare boshqa odamga berib yuborishi mumkin edi), kesh 6 soat / 500 yozuv va surat YOQ ekani ham keshlanadi, olcham eng katta emas 160px dan kichigi (54px doira uchun 640px ortiqcha trafik), bosh harflar ZAXIRA bolib qoladi. SOTUVCHI KABINETI founder royxatiga cheklandi (SELLER_TG_IDS, zaxira ADMIN_TG_IDS → ADMIN_CHAT_ID, yani env ga tegilmasa kabinet FAQAT founderda) — tekshiruv YAGONA nuqtada, lib/auth.js → currentSeller, chunki /api/me, requireSeller va katalog filtri uchalasi shundan oziqlanadi; royxatda yoq odamda role buyer, seller_id null, LEKIN pickup_point_id QOLADI (u xaridorga tegishli, null qaytarilsa Mening manzilim ham ochardi). TASIRI: bazada role=seller bolgan mavjud sotuvchi ID si env ga yozilmaguncha kabinetni KORMAYDI va buni hech narsa korsatmaydi — qorovul Test 24. BOT CHATIDA Ochish menyu tugmasi (setChatMenuButton, chat_id UZATILMAYDI — usiz barcha shaxsiy chatlar uchun standart boladi) va u SERVER KOTARILGANDA avtomatik royxatdan otadi, chunki BOT_TOKEN almashtirilganda bu sozlama ham nolga qaytadi — webhook bilan AYNI TUZOQ, osha kuni saytga kirishni oldirgan. KARTOCHKA USTIDA 3 SONIYA — ikkinchi media, FAQAT (hover: hover) da armlanadi (telefonda hover barmoq bosilganda ham hosil boladi va mouseleave kelmasligi mumkin), video kechikib yuklanadi va chiqishda src boshatilib tugun OCHIRILADI (olchandi: 0 ta orphan), sensorli ekranda videoning BORLIGINI .media-mark korsatadi. KATEGORIYA CHIPLARI qayta dizayn: tanlangani anor gradientida (ilgari --ink-900 toq kok — butun ilovada YOLGIZ ozi shu rangda edi) va ikat rombi ::before dan (shrift belgisi emas, yani yuklanmaydi va tushib qolmaydi), hover endi javob beradi. WEB profil tugmasi qator OXIRIGA — ismi uzun foydalanuvchida u kengayib ikkita doira ikonkani surardi, yani qatorning ong qirrasi HAR foydalanuvchida boshqa joyda edi. MINI APP ga Saqlangan matolar ekrani — royxat PRODUCTS dan filtrlanadi, S.liked dan EMAS (ochirilgan elon id si qolib ketishi mumkin), son ham AYNI filtrdan va nol bolsa qator umuman chizilmaydi. AI RASM XATOSI (Sprint 10): production da javobda rasm yoq (IMAGE_OTHER) — HTTP 200, xato yoq, shunchaki rasm yoq. Bu UCHINCHI xil nosozlik: 5xx qayta urinilardi, rad etish ataylab urinilmasdi, bosh javob esa urinilMASDI — holbuki aynan U foyda koradi, chunki prompt DETERMINISTIK va tasodifiylik MODEL tomonda: ayni prompt ayni javobni bermaydi (rad etilgan prompt esa har safar rad etiladi). Endi 3 martagacha, 1.2 s kutish bilan, 75 s UMUMIY BUDJET ostida — budjetsiz javob Cloudflare ~100 s chegarasidan chiqib ketardi va foydalanuvchi 504 korardi, kredit esa sarflangan bolardi, yani tuzatilayotgan nuqsondan YOMONROQ holat. TESTLAR 60 → 62: Test 14q (bosh javob qayta uriniladi — generateImage ga SINOV TESHIGI qoshildi, chunki manba kodini skanerlaydigan qorovul tsikl BORLIGINI koradi, TOGRI ishlashini emas; 4 mutatsiya, 4 tasi ushlandi) va Test 24 (sotuvchi kabineti, 3 mutatsiya, 3 tasi ushlandi). Kesh: style.css v51, script.js v42, telegram-app/styles.css v28, telegram-app/app.js v84, panel.js v19; admin/index.html dagi style.css ham 51 ga kotarildi — bitta fayl ikkala sahifada BIR XIL versiya bilan chaqirilsin (2026-08-06 darsi). HALOL CHEGARA: DEPLOY QILINMAGAN va server/ CI orqali CHIQMAYDI — qolda rsync va SERVIS RESTARTI kerak (avatar endpointi va menyu tugmasi server tomonda), env ga tegish shart emas, /api/me/photo uchun nginx tahriri ham kerak emas chunki umumiy location ^~ /api/ bloki uni qamraydi.)";




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
