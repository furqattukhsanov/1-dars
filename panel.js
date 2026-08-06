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
  updatedEl.textContent = "Yangilanish: 2026-08-06 (SHRIFT BANDI YOPILDI — LEKIN ASOSIY TOPILMA TEJOV EMAS, HUJJATDAGI RAQAMNING O'ZI YOLG'ON CHIQQANI. Sprint 8 va qoldiq ro'yxatida \"shriftlar 250 KB, 13 ta woff2\" deb yozilgan edi va butun band shu raqamga qarab ustuvorlashtirilgandi; o'lchaganda bu BARCHA unicode-range subsetlarining YIG'INDISI ekani ma'lum bo'ldi, brauzer esa faqat kerakli (latin) subsetni oladi — haqiqiy xarajat 131 KB / 3 fayl, ya'ni muammo hujjatda yozilganidan IKKI BAROBAR kichik edi. Ikki MUSTAQIL usul bir xil javob berdi: curl bilan latin subsetlarini yig'ish = 131 KB, brauzerdagi performance resurs yozuvlari = 131 KB / 3 fayl. ISROFNING MANBAI: Bricolage Grotesque IKKI o'qli o'zgaruvchan shrift sifatida so'ralardi — opsz (optik o'lcham) butun 12..96 oralig'i + qalinlik, va ikkinchi o'q butun oralig'i bilan yolg'iz o'zi 75 KB turardi. Yana ikkita mayda nuqson: Geist Mono 400 va 500 so'ralardi lekin hech qayerda ishlatilmasdi, Geist Mono 700 esa ISHLATILADI lekin so'ralmasdi — ya'ni brauzer soxta qalin (faux bold) chizardi. QAROR: opsz o'qi TASHLANMADI, bitta qiymatga QOTIRILDI. Sabab — o'qni butunlay olib tashlash ham, bitta qiymatga qotirish ham AYNI 40 KB beradi, demak tanlov bayt haqida emas KO'RINISH haqida edi; o'lchov opsz haqiqatan ishlayotganini ko'rsatdi (bir xil matnning px boshiga kengligi 14px da 11.74, 24px da 11.58, 48px da 11.20, 96px da 10.45 — 11% farq). Qaysi qiymatga qotirish TAXMIN QILINMADI, O'LCHANDI: Bricolage haqiqatan mobil'da 14–24px (belgi og'irligi bo'yicha o'rtacha 16.3px), desktopda 15–38px (o'rtacha 21.9px) chiziladi — ikkala uchning o'rtasi sifatida 24 tanlandi. NATIJA: latin subseti 131 KB → 96 KB (−35 KB, −27%); 3 ta alohida yuz (7 ta yuz e'loni) o'rniga 3 ta o'zgaruvchan fayl; Geist Mono 700 soxta qalindan HAQIQIYga o'tdi. O'zgarish jismonan bitta qator, uch faylda (index.html, telegram-app/index.html, admin/index.html), boshqa hech narsaga tegilmadi. DALIL — ko'rinish buzilmagani TAXMIN emas O'LCHOV: lokal (yangi) va production (eski) yonma-yon solishtirildi, 1280px va 375px da. 34px sarlavha 438.6 → 445.0 px (+1.5%), ikkinchisi 583.3 → 591.5 px (+1.4%), 17px nav 91.1 → 90.2 px (−1.0%). ENG MUHIM DALIL ESA BALANDLIKLAR: ular AYNAN bir xil qoldi (mobil'da 18.7 / 43.3 / 21.7 / 43.3 / 16.2; desktopda 18.7 / 77.5 / 38.8) — ya'ni matn hech qayerda QAYTA O'RALMAGAN va joylashuv siljimagan, kenglikdagi 1.5% farq bitta sarlavhada ~6 piksel va o'ram chizig'ini o'zgartirmaydi. Mini App va admin ekranlari ham chizilib ko'rildi; zaxira shriftga tushib qolgan element yo'q (Times faqat bitta joyda, u O'ZGARISHDAN OLDIN ham shunday edi — regressiya emas). npm test — 33 test PASS (yo'l-yo'lakay: kechagi hujjatlarda \"32 test\" deb yozilgandi, sanab ko'rilganda HEAD dagi server/test.js da ham 33 ta yorliq bor — ya'ni bugun test qo'shilmagan, kechagi raqam noto'g'ri sanalgan; mayda, lekin shu yozuvning O'Z mavzusi bilan bitta oiladan). HALOL CHEGARA, ATAYLAB YOZILDI: bu 35 KB tejov, lekin TEZLIK MEZONI UCHUN SEZILARLI O'ZGARISH KUTILMAYDI va \"tezlik yaxshilandi\" deb YOZILMAYDI. 5-avgust yakuniy o'lchovi landing tarmoq kengligiga bog'liq bo'lishdan chiqqanini ko'rsatgan edi (sekin va tez 3G natijalari ustma-ust tushdi, vaqtni endi ULANISH KECHIKISHI belgilaydi), ya'ni bu bayt tozaligi va Geist Mono sifatining tuzatilishi — sekundomer raqami emas; aks holda bu o'lchanmagan da'vo bo'lardi. OCHIQ QOLGANI: telegram.org ga preconnect — hamon ochiq, xuddi shu sababdan katta foyda bermaydi. DARS: hujjatdagi RAQAM ham tekshirilmagan da'vo bo'lishi mumkin, shuning uchun optimizatsiya bandi ochilganda birinchi qadam — bazaviy raqamni o'z usuling bilan qayta o'lchash. Bu o'sha kungi sayt-eski/ darsining aynan takrori: hujjatga yozilgan narsa haqiqatdek ko'rinadi va qaror shunga qarab qabul qilinadi.) | Oldingi: 2026-08-06 (KESH QOROVULI (Test 16) QO'SHILDI VA sayt-eski/ PAPKASI O'CHIRILDI — C3 ning bevosita davomi. 1) TEST 16: statik fayl o'zgarsa `?v=` ham oshishi shu paytgacha faqat ODAT edi va aynan shu kuni buzilgan edi — uchala JS o'zgargan, `?v=` qolgan; admin'da bu yangi HTML + keshdagi eski JS, ya'ni O'LIK KIRISH TUGMASI degani bo'lardi. O'sha safar hisobotchi tutdi, lekin ODAMGA TAYANGAN QOROVUL QOROVUL EMAS. Test git tarixiga QARAMAYDI (tarix npm test ishlaydigan hamma sharoitda mavjud emas): 6 ta HTML skanerlanadi va topilgan har bir `?v=` havolasi uchun faylning sha256 i jadvaldagi qiymat bilan solishtiriladi. Havolalar ro'yxati QO'LDA yozilmaydi — yangi versiyalangan fayl avtomatik qamraladi (Test 10c bilan bitta naqsh: qorovulning o'zi kengayadi). Jadval kaliti SAHIFA emas FAYL, chunki bitta fayl bir necha sahifadan chaqirilganda versiya hamma joyda bir xil bo'lishi SHART. Uch xil buzilishni tutadi: (a) fayl o'zgardi versiya qolgan, (b) bitta fayl ikki sahifada TURLI versiya bilan chaqirilgan, (c) jadvalga kirmagan yangi versiyalangan fayl — uch mutatsiya bilan sinaldi, uchalasi ham qizil. 2) QOROVUL DARROV HAQIQIY NUQSON TOPDI: admin/index.html:13 ildizdagi style.css ni ?v=21 bilan chaqirardi, index.html esa AYNI faylni ?v=36 bilan — brauzer keshining kaliti to'liq URL bo'lgani uchun admin panelni ilgari ochgan odamda 15 VERSIYA ORQADAGI CSS keshda CHEKSIZ qotib qolgan edi va buni hech narsa ko'rsatmasdi; ?v=36 ga tuzatildi va lokal brauzerda tekshirildi (600 ta CSS qoidasi yuklandi, sahifa joyida chizildi). 3) sayt-eski/ O'CHIRILDI (founder: \"eski saytni o'chirvor, kerakmas\") va bu yerda MUHIMI qarorning o'zi emas, uni qabul qilish YO'LI: o'chirishdan OLDIN bog'liqlik tekshirildi va CLAUDE.md dagi saqlash sababi YOLG'ON bo'lib chiqdi — hujjat \"o'chirilmasin, demo/ va admin/ uning style.css'iga bog'liq\" derdi, aslida demo/ repoda UMUMAN YO'Q edi (lekin deploy.yml source ro'yxatida turgan) va admin/ ILDIZDAGI style.css ni ishlatadi (admin/index.html:13 → ../style.css); sayt-eski/style.css ni faqat sayt-eski/index.html ishlatardi va papkadagi hamma rasm boshqa joyda ham ishlatiladi, ya'ni yetim fayl qolmadi. Kod git tarixida qoladi (git show 99fd084:sayt-eski/index.html), demak o'chirish qaytarib bo'lmaydigan emas. Birga yangilangan joylar: deploy.yml (source dan sayt-eski/ VA o'lik demo/ olib tashlandi), server/test.js (Test 15 nishonlari va Test 16 jadvali), CLAUDE.md, docs/xavfsizlik-sarlavhalari.md. 4) NATIJA — TEST 15 NING ISTISNOLAR RO'YXATI BO'SH: ilgari bitta yozuv bor edi (sayt-eski/index.html:69 dagi onsubmit, founder qarori bilan tegilmagan va C3 dan keyin jimgina o'lishi qabul qilingan edi), papka o'chirilishi bilan istisno O'Z-O'ZIDAN yopildi — endi deploy qilinadigan kodda inline hodisa, inline skript bloki va javascript: URL UMUMAN yo'q. DALIL: npm test — 32 test PASS; Test 15: 16 fayl / 551 KB / 0 istisno; Test 16: 9 versiyalangan fayl / 6 sahifa. OCHIQ QOLGANI: serverdagi /var/www/lolamarket/sayt-eski/ rsync bilan O'CHMAYDI — deploy --delete ishlatmaydi, ya'ni hozir https://lolamarket.uz/sayt-eski/ hamon HTTP 200 qaytaradi; papkani FOUNDER qo'lda olib tashlaydi. Umumiy qoida shu yerdan: \"repodan o'chirdim\" deyish \"saytdan yo'qoldi\" degani EMAS, ikkinchisi ALOHIDA tekshiriladi. DARS: ikkala topilma ham bitta oiladan — TEKSHIRILMAGAN DA'VO HUJJATGA YOZILSA, U HAQIQATDEK KO'RINADI va qaror shunga qarab qabul qilinadi; sayt-eski/ yillar davomida yolg'on sabab bilan saqlangan, admin'dagi eskirgan versiya esa hech kimga ko'rinmagan chunki uni tekshiradigan narsa yo'q edi — IKKALASINI HAM QOROVUL TOPDI, ODAM EMAS.)";



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
