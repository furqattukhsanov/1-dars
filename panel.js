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
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-02" },
    { num: 5, nom: "Mobil / PWA",               dars: "Dars 12", holat: "jarayonda",  sana: "2026-07-30" },
    { num: 6, nom: "Integratsiyalar",           dars: "Dars 13", holat: "jarayonda",  sana: "2026-07-22" },
    { num: 7, nom: "Admin panel",               dars: "Dars 14", holat: "tugadi",  sana: "2026-08-02" },
    { num: 8, nom: "Sifat tekshiruvi",          dars: "Dars 15", holat: "jarayonda", sana: "2026-08-06" },
    { num: 9, nom: "Production + launch",       dars: "Dars 16", holat: "jarayonda", sana: "2026-08-06" },
    { num: 10, nom: "AI kiyim g'oyalari",       dars: "Dars 17", holat: "jarayonda", sana: "2026-08-06" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-06 (SPRINT 8 NING OXIRGI OCHIQ TEZLIK BANDI YOPILDI — telegram.org ga preconnect qo'shildi. O'zgarish jismonan ikkita qator: index.html va telegram-app/index.html ga bittadan link rel=preconnect href=https://telegram.org. admin/ ga ATAYLAB qo'shilmadi — u telegram.org ni umuman ishlatmaydi, ya'ni u yerda preconnect faqat behuda ulanish ochardi. ASOS O'LCHANGAN, TAXMIN EMAS: sovuq ulanish curl bilan 5 marta o'lchandi — DNS ~4 ms, TCP ~100 ms, TLS ~100 ms, ya'ni ULANISHNING O'ZI ~200 ms turadi va bu SOF KECHIKISH, bayt emas. Aynan shu sabab bandning mantiqi bor: 5-avgust o'lchoviga ko'ra landing ham, Mini App ham tarmoq kengligiga bog'liq EMAS — ikkalasining ham vaqtini ulanish kechikishi belgilaydi, ya'ni shrift bandidan farqli o'laroq bu band TO'G'RI o'lchamga tegadi. QARORNING ENG NOZIK JOYI — crossorigin QO'YILMADI: pastdagi skriptda (script defer src=https://telegram.org/js/...) crossorigin atributi yo'q, ya'ni u CORS'siz olinadi. Preconnect'ga crossorigin qo'yilsa brauzer BOSHQA ulanish ochadi, skript esa undan foydalanmaydi va preconnect BUTUNLAY BEHUDA ketadi — bu preconnect'ning eng ko'p uchraydigan xatosi. Shrift preconnect'ida esa crossorigin BOR va u TO'G'RI, chunki shrift CORS bilan olinadi. Ikki qator bir xil ko'rinadi, lekin QARAMA-QARSHI — shuning uchun sabab kod izohiga yozib qo'yildi, kelajakda \"izchillik uchun\" tenglashtirilmasin. TASDIQLANGANI: ikkala sahifada preconnect chizildi, skriptning crossorigin i yo'qligi va preconnect'niki bilan MOS kelishi tekshirildi (mos_keladimi: true), window.Telegram.WebApp mavjud, Mini App'da 27 ta [data-action] joyida; npm test — 33 test PASS. HALOL CHEGARA, ATAYLAB YOZILDI: \"200 ms tejaldi\" DEB YOZILMAYDI — o'lchangani ulanish NARXI, tejovning O'ZI EMAS. Skript allaqachon head da turibdi va brauzerning preload skaneri uni baribir erta topadi, ya'ni haqiqiy yutuq 200 ms dan KICHIK bo'lishi mumkin; sovuq ulanishli oldin/keyin o'lchovini brauzerda ajratib bo'lmadi, chunki ulanish hovuzi issiq. Shuning uchun bu yerda faqat NARX yozilgan, YUTUQ emas. BIRGA KIRGAN IKKINCHI O'ZGARISH: CLAUDE.md ga yangi qoida — \"HUJJATDAGI RAQAM — TEKSHIRILMAGAN DA'VO\": optimizatsiya yoki tuzatish bandi ochilganda bazaviy raqamning O'ZI qayta o'lchansin, undan ish BOSHLANMASIN, chunki raqam bandning kattaligini va navbatdagi o'rnini belgilaydi — noto'g'ri bo'lsa ish noto'g'ri narsaga yo'naltiriladi. Qoida ichiga bir kunda topilgan UCH dalil yozildi: \"shriftlar 250 KB / 13 woff2\" → aslida 131 KB / 3 fayl; \"sayt-eski/ o'chirilmasin, demo/ va admin/ bog'liq\" → demo/ repoda umuman yo'q va admin/ ildizdagi CSS ni ishlatadi; \"32 test\" → 33. Amaliy talab: raqam IKKI MUSTAQIL usul bilan olinsa ishonchli. Ikkala o'zgarish mustaqil, bitta commitda — founder ataylab shunday qildi.) | Oldingi: 2026-08-06 (SHRIFT BANDI YOPILDI — LEKIN ASOSIY TOPILMA TEJOV EMAS, HUJJATDAGI RAQAMNING O'ZI YOLG'ON CHIQQANI. Sprint 8 va qoldiq ro'yxatida \"shriftlar 250 KB, 13 ta woff2\" deb yozilgan edi va butun band shu raqamga qarab ustuvorlashtirilgandi; o'lchaganda bu BARCHA unicode-range subsetlarining YIG'INDISI ekani ma'lum bo'ldi, brauzer esa faqat kerakli (latin) subsetni oladi — haqiqiy xarajat 131 KB / 3 fayl, ya'ni muammo hujjatda yozilganidan IKKI BAROBAR kichik edi. Ikki MUSTAQIL usul bir xil javob berdi: curl bilan latin subsetlarini yig'ish = 131 KB, brauzerdagi performance resurs yozuvlari = 131 KB / 3 fayl. ISROFNING MANBAI: Bricolage Grotesque IKKI o'qli o'zgaruvchan shrift sifatida so'ralardi — opsz (optik o'lcham) butun 12..96 oralig'i + qalinlik, va ikkinchi o'q butun oralig'i bilan yolg'iz o'zi 75 KB turardi. Yana ikkita mayda nuqson: Geist Mono 400 va 500 so'ralardi lekin hech qayerda ishlatilmasdi, Geist Mono 700 esa ISHLATILADI lekin so'ralmasdi — ya'ni brauzer soxta qalin (faux bold) chizardi. QAROR: opsz o'qi TASHLANMADI, bitta qiymatga QOTIRILDI. Sabab — o'qni butunlay olib tashlash ham, bitta qiymatga qotirish ham AYNI 40 KB beradi, demak tanlov bayt haqida emas KO'RINISH haqida edi; o'lchov opsz haqiqatan ishlayotganini ko'rsatdi (bir xil matnning px boshiga kengligi 14px da 11.74, 24px da 11.58, 48px da 11.20, 96px da 10.45 — 11% farq). Qaysi qiymatga qotirish TAXMIN QILINMADI, O'LCHANDI: Bricolage haqiqatan mobil'da 14–24px (belgi og'irligi bo'yicha o'rtacha 16.3px), desktopda 15–38px (o'rtacha 21.9px) chiziladi — ikkala uchning o'rtasi sifatida 24 tanlandi. NATIJA: latin subseti 131 KB → 96 KB (−35 KB, −27%); 3 ta alohida yuz (7 ta yuz e'loni) o'rniga 3 ta o'zgaruvchan fayl; Geist Mono 700 soxta qalindan HAQIQIYga o'tdi. O'zgarish jismonan bitta qator, uch faylda (index.html, telegram-app/index.html, admin/index.html), boshqa hech narsaga tegilmadi. DALIL — ko'rinish buzilmagani TAXMIN emas O'LCHOV: lokal (yangi) va production (eski) yonma-yon solishtirildi, 1280px va 375px da. 34px sarlavha 438.6 → 445.0 px (+1.5%), ikkinchisi 583.3 → 591.5 px (+1.4%), 17px nav 91.1 → 90.2 px (−1.0%). ENG MUHIM DALIL ESA BALANDLIKLAR: ular AYNAN bir xil qoldi (mobil'da 18.7 / 43.3 / 21.7 / 43.3 / 16.2; desktopda 18.7 / 77.5 / 38.8) — ya'ni matn hech qayerda QAYTA O'RALMAGAN va joylashuv siljimagan, kenglikdagi 1.5% farq bitta sarlavhada ~6 piksel va o'ram chizig'ini o'zgartirmaydi. Mini App va admin ekranlari ham chizilib ko'rildi; zaxira shriftga tushib qolgan element yo'q (Times faqat bitta joyda, u O'ZGARISHDAN OLDIN ham shunday edi — regressiya emas). npm test — 33 test PASS (yo'l-yo'lakay: kechagi hujjatlarda \"32 test\" deb yozilgandi, sanab ko'rilganda HEAD dagi server/test.js da ham 33 ta yorliq bor — ya'ni bugun test qo'shilmagan, kechagi raqam noto'g'ri sanalgan; mayda, lekin shu yozuvning O'Z mavzusi bilan bitta oiladan). HALOL CHEGARA, ATAYLAB YOZILDI: bu 35 KB tejov, lekin TEZLIK MEZONI UCHUN SEZILARLI O'ZGARISH KUTILMAYDI va \"tezlik yaxshilandi\" deb YOZILMAYDI. 5-avgust yakuniy o'lchovi landing tarmoq kengligiga bog'liq bo'lishdan chiqqanini ko'rsatgan edi (sekin va tez 3G natijalari ustma-ust tushdi, vaqtni endi ULANISH KECHIKISHI belgilaydi), ya'ni bu bayt tozaligi va Geist Mono sifatining tuzatilishi — sekundomer raqami emas; aks holda bu o'lchanmagan da'vo bo'lardi. OCHIQ QOLGANI: telegram.org ga preconnect — hamon ochiq, xuddi shu sababdan katta foyda bermaydi. DARS: hujjatdagi RAQAM ham tekshirilmagan da'vo bo'lishi mumkin, shuning uchun optimizatsiya bandi ochilganda birinchi qadam — bazaviy raqamni o'z usuling bilan qayta o'lchash. Bu o'sha kungi sayt-eski/ darsining aynan takrori: hujjatga yozilgan narsa haqiqatdek ko'rinadi va qaror shunga qarab qabul qilinadi.)";



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
