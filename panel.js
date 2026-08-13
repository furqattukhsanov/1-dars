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
  updatedEl.textContent = "Yangilanish: 2026-08-13 (PROFIL AVATARI PRODUCTIONDA UMUMAN CHIZILMAGAN — SABAB KODDA EMAS, CSP SARLAVHASIDA EDI. Founder telefonda korsatdi: profil kartochkasida avatar orniga singan rasm belgisi, refresh ham yordam bermagan — yani 6cf4b12 bilan chiqqan avatar funksiyasi BIRINCHI KUNIDAN BERI OLIK turgan. Sabab OLCHANDI, taxmin qilinmadi: jonli javob sarlavhasi oqildi va img-src royxatida self, data:, cdn.lolamarket.uz, maps.yandex.net bor, blob: esa YOQ — avatar aynan URL.createObjectURL bilan qoyilgandi, yani blob: havola yasalardi va brauzer uni bloklardi. esc() gumon qilindi va OQLANDI: u faqat besh belgini qochiradi va blob havolasiga tegmaydi. NUQSON TURI — LOYIHADA TANISH VA ENG YOMON XILI: konsolda JS xatosi YOQ, fetch 200 qaytargan, kod ishlagan — faqat rasm chizilmagan. Bu CLAUDE.md dagi karta bandi bilan BITTA OILA (CSP qollanganda api-maps.yandex.ru qoshilmasa karta JIMGINA oladi) — naqsh AYNAN osha, yani qoida yozilgan bolsa ham IKKINCHI MARTA tishladi. TUZATISH: blob: orniga data: — u CSP royxatida ALLAQACHON bor, yani nginx ga TEGILMADI; yangi blobToDataUrl (FileReader → readAsDataURL) ikkala yuzda ham. CSP ni kengaytirish varianti ATAYLAB rad etildi: mavjud ruxsat yetarli bolganda yangi ruxsat ochish notogri bolardi — har qoshilgan sxema CSP ning himoya qiymatini kamaytiradi va uni qaytarib olish qiyin; avatar kichik (160px), base64 arzon. YANGI QOROVUL TEST 25, uch bandi: (1) script.js va telegram-app/app.js da createObjectURL UMUMAN bolmasin (izohlar tahlildan oldin olib tashlanadi — 2026-08-12 dagi izohdagi soz qorovulni aldadi darsi), (2) hujjatdagi CSP img-src da data: QOLSIN chunki avatar shunga tayanadi va kimdir CSP ni qattiqlashtirsa avatar yana jimgina olardi, (3) ikkala frontend readAsDataURL ishlatsin. QOROVULNI SINASHDA OLCHOV XATOSI CHIQDI VA U YOZIB QOYILADI: birinchi urinishda M1 va M2 mutatsiyalarini TEST 16 (kesh versiyasi) tutdi, Test 25 emas — chunki faylni tahrirlash sha256 ni ozgartiradi va Test 16 oldinroq yiqiladi, yani mutatsiya ushlandi degan xulosa NOTOGRI NARSANI olchagan bolardi va Test 25 umuman ishlamasa ham xuddi shunday korinardi. Qayta sinaldi: mutatsiya bilan BIRGA jadvaldagi hash ham yangilanib Test 16 YASHIL qoldirildi — oshanda uchala mutatsiya ham AYNAN Test 25 tomonidan ushlandi. Bu tekshirdim teng emas togri narsani tekshirdim darsining yana bir holati. HALOL CHEGARA: tuzatish brauzerda KOZ BILAN KORILMADI — Browser paneli bu sessiyada siyosat bilan yopiq va founder sessiyasi bilan kirib bolmaydi, yani data: CSP dan otadi degan gap SARLAVHA oqilishiga asoslangan mantiqiy xulosa, jonli olchov EMAS. Aynan shu turdagi ishonch bu nuqsonni tugdirgan edi — oshanda ham kod togri korinardi. Tasdiq faqat founder profilni ochib avatarni korganda boladi. Kesh: script.js v44, telegram-app/app.js v86; style.css (v52) va telegram-app/styles.css (v29) TEGILMADI chunki ozgarmagan. Test 16 jadvali yangilandi, TESTLAR 62 → 63 va hammasi yashil. DEPLOY: faqat statik, servis restarti KERAK EMAS.)";




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
