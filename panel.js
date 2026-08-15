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
    { num: 4, nom: "Asosiy funksiya",           dars: "Dars 11", holat: "jarayonda",  sana: "2026-08-16" },
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
  updatedEl.textContent = "Yangilanish: 2026-08-16, ikkinchi commit (BANNER RASMI VA SHRIFTI TUZATILDI — VA ENG QIMMAT DARS TZ NING O'ZIDA CHIQDI. Founder: «Zo'r faqat rasm sifati xira hamda shiriftlar kichkina shularni fix qil. Dizayn uchun tz bersang olib kelman kerakli fayllarni» — keyin dizayn paketini keltirdi: «Shularni dizaynga ishlat, iloji boricha sifatlisini ishlat». SHRIFT: sarlavha clamp(19px, 2.9vw, 34px) → clamp(24px, 3.2vw, 42px), chip 9→12px va 11.5→14px. Yuqori chegara TANLANMADI, O'LCHANDI: founderning «sarlavha har doim ikki qator» qoidasi (2026-08-15) 26px da buzildi — eng uzun matn («24/7 buyurtma / berishingiz mumkin») uchinchi qatorga tushdi, ya'ni 24px chegaraning O'ZI; keng ekranda 44px gacha joy bor edi, 42px nafas uchun qoldirildi. Kattalashgan sarlavha eski matn zonasiga sig'magani uchun telefonda .ad-copy right: 35% → 28% (matn zonasi 65% → 72%) — bu KOSMETIK emas, RASM TZ SI AYNAN SHU RAQAMDAN kelib chiqadi (mato kadrning o'ng 28% ida boshlansin), ya'ni tipografiya va rasm brifi BOG'LANGAN. RASM XIRALIGI — SABAB O'LCHANDI, TAXMIN QILINMADI: nuqson rasmda emasdi, assets/ads/ad-*.{webp,jpg} 1200×338 va ular MINI APP uchun chizilgan (u yerda slayd ~358×101 CSS px, ya'ni ortig'i bilan yetadi); sayt slaydi esa ancha katta va brauzer faylni CHO'ZARDI — telefonda 1.30x, retina monitorda 2.08x. Founder Gemini bilan 4800×2000 masterlar keltirdi (design_handoff_sayt_banners) va kesish QO'LDA bajarildi (sips + cwebp) — paketdagi TAYYOR kesimlar ishlatilmadi, chunki o'z kesimimiz yaxshiroq chiqdi (ad-3: 80 KB → 25 KB). Natija brauzerda o'lchandi: cho'zilish 1.30x → 0.98x telefonda, 2.08x → 1.00x desktopda. TZ DA YO'Q EDI, ISH PAYTIDA QO'SHILDI: har kesim IKKI o'lchamda (keng 1400/2240, telefon 900/1800) + srcset + sizes — bitta o'lcham bo'lsa DPR1 noutbuk ham eng katta faylni tortardi; siqilish darajasi ham TANLANMADI, o'lchandi — q62 dan q86 gacha EKRANDAGI farq 255 dan atigi 1.4–2.2 (1% dan kam), ya'ni yuqori sifat faqat baytga tushadi va ko'zga tegmaydi, q72 olindi («hujjatdagi raqam — tekshirilmagan da'vo» qoidasining IJOBIY ko'rinishi: o'lchov qarorni ARZONLASHTIRDI). OG'IRLIK RAQAMLARI HISOBOTCHI TOMONIDAN QAYTA O'LCHANDI VA TUZATILDI — IKKINCHI COMMIT KETMA-KET: sessiyada «DPR2 telefon 46 KB, DPR1 noutbuk 78 KB, bitta o'lchamda ~272 KB» deyilgan; diskdagi baytdan qayta hisoblanganda DPR2 telefon 51 KB (46 emas), DPR1 noutbuk 79 KB, «~272 KB» esa hozirgi fayllardan UMUMAN chiqmaydi. Sabab aniq — birinchi ikki raqam telefon kesimi O'NGGA SURILISHIDAN OLDIN o'lchangan (surilgan kadrga ko'proq mato tushdi va fayl og'irlashdi), ya'ni raqam noto'g'ri emas, ESKIRGAN edi. UNDAN MUHIMI — O'LCHANMAGAN YO'L TOPILDI: DPR3 TELEFON 231 KB, ad-2 ning O'ZI 159 KB (paxta to'quv teksturasi boshqa ikkalasidan ~4x qimmat) va DPR3 iPhone Pro hamda ko'p Android flagmani demakdir, ya'ni bu nazariy yo'l emas — u hech qayerda yozilmagandi. To'liq jadval (o'nlik KB): DPR2 telefon 51, DPR3 telefon 231, DPR1 noutbuk 79, DPR2 monitor 201; srcset foydasi shundan qayta hisoblandi — kichik o'lchamlarsiz DPR2 telefon 4.5x, DPR1 noutbuk 2.5x ortiq tortardi. Raqamlar index.html izohida va TZ da TUZATILDI. ENG MUHIM DARS — TZ NING O'ZIDA XATO BOR EDI: birinchi urinishda telefonda banner deyarli BO'SH BEJ QUTI bo'lib chiqdi va sabab TZ dagi «telefon kesimi masterning O'RTASIDAN» jumlasi edi — u YOLG'ON, chunki kesim ekranga object-fit: cover bilan chiziladi va telefon slaydi 2:1 dan TORROQ (375px da 1.56), ya'ni brauzer kesimning yon tomonlaridan YANA ~22% ini oladi; ikki kesish ustma-ust tushdi va mato butunlay kadrdan chiqib ketdi. Tuzatish TAXMIN bilan emas: har masterda mato qayerdan boshlanishi ustunlarning RANGDORLIGI bilan o'lchandi (ad-1 77.9%, ad-2 68.0%, ad-3 70.9%) va kesim S = matoBoshi − 2686 formulasi bilan o'ngga surildi (800 / 578 / 717 px). TZ TUZATILDI — formula, jadval va dizaynerga eslatma yozildi (mato masterning 68–72% idan boshlansin; 78% KECH — ad-1 da maksimal surishda ham mato 28% o'rniga ~20% chiqdi); tuzatilmasa xato KEYINGI PARTIYADA aynan takrorlanardi, ya'ni hujjatdagi yolg'on bir marta emas HAR SAFAR zarar keltirardi («prompt — kod emas, MATN» bandi bilan bitta oila). VAQTINCHALIK CHORA OLIB TASHLANDI: telefondagi object-position: 62% — kechagi commitning O'Z tuzatishi — o'chirildi, chunki 2:1 telefon kesimida kadrning ~78% i ko'rinadi va surish endi foyda emas ZARAR berardi; kechagi qaror sprint faylida BEKOR QILINGAN deb belgilandi, O'CHIRILMADI. Bu naqsh bir hafta ichida IKKINCHI marta (touch-action: pan-y, 2026-08-14): vaqtinchalik chora asosiy nuqson tuzatilganda O'Z-O'ZIDAN yo'qolmaydi — uni ATAYLAB olib tashlash kerak. FAYL NOMLARI ATAYLAB YANGI (ad-1-w-1400.webp, ad-1-m-900.webp …), eskisining ustiga yozilmadi: sw.js rasmlarni cacheFirst bilan beradi va eski nom ustiga yozilsa qaytib kelgan foydalanuvchi ESKI XIRA rasmni ko'rardi, yangisi faqat KEYINGI tashrifda kelardi — ya'ni tuzatish o'zi tuzatayotgan odamga yetib bormasdi. Eski 6 fayl o'chdi, 15 yangi fayl qo'shildi, havola qolmagani tekshirildi; assets/ deploy source ro'yxatida allaqachon bor. Serverda eski fayllar QOLADI (deploy nusxalaydi, o'chirmaydi) — chaqirilmaydi, ya'ni zararsiz, lekin «deploy eski faylni tozalaydi» deb o'ylanmasin. QOROVUL — TEST 32 NING 5-BANDI QAYTA YOZILDI: ertalab u sayt va Mini App rasmlari BAYT-MA-BAYT bir xil ekanini tekshirardi va sayt o'z kesimlariga o'tgach bu shart YOLG'ON bo'lib qoldi; o'sha holicha qoldirish testni doim qizil ushlab turardi (qizil test esa o'qilmay qoladi), o'chirib yuborish esa qorovulni JIMGINA yo'qotardi — shuning uchun band ALMASHTIRILDI: endi sayt to'plamining TO'LIQLIGI (3 slayd × 5 fayl = 15), index.html havolalari va object-position vaqtinchalik chorasining QAYTMASLIGI tekshiriladi, ro'yxat qo'lda yozilmaydi va AD_SLIDES dan olinadi. UCH mutatsiya bilan sinaldi, uchtasi ham ushlandi. Yo'l-yo'lakay bilib olindi: style.css ga tegadigan mutatsiyada TEST 16 OLDINROQ otiladi, ya'ni Test 32 ni sinash uchun hash ham birga yangilanishi kerak (2026-08-14 dagi app.js bandining style.css uchun takrori). AGENTNING XATOSI — OCHIQ YOZILADI: mutatsiya sinovidan keyin tozalash uchun git checkout style.css index.html yozildi va o'sha paytdagi HALI COMMIT QILINMAGAN ish o'chib ketdi (shrift o'zgarishlari + yangi picture markupi); hammasi qaytadan yozildi, ya'ni yo'qotish yo'q, lekin bu CLAUDE.md dagi «almashtirishni QO'LGA KIRITMASDAN eskisini o'chirma» qoidasining aynan buzilishi — qoida rm -rf haqida yozilgan, git checkout esa O'SHA OILANING KO'RINMAYDIGAN A'ZOSI: u «o'chirish» so'zini ishlatmaydi, «tozalash» dek tuyuladi va zarari bir xil. Keyingi mutatsiyalar zaxira nusxa bilan qilindi. OCHIQ QOLGAN QAROR — IKKI YUZDA IKKI XIL MATO: sayt endi yangi masterlardan, Mini App esa 2026-08-15 dagi eski generatsiyadan oziqlanadi, holbuki KECHAGI COMMITNING BUTUN MAQSADI aynan ularni tenglashtirish edi; founder'ga ikki marta savol berildi — (a) Mini App ham shu masterlardan qayta kesilsinmi (TAVSIYA) yoki (b) eskisida qolsinmi — javob KELMADI, u «commit qil, deploy qil» dedi, shuning uchun Mini App'ga ATAYLAB tegilmadi (boshqa yuz va o'zgartirish tasdiqlanmagan). Savol Test 32 izohida ham yozilgan, ya'ni u hujjatda ham kodda ham ko'rinadi. Kesh: style.css 56→58, panel.js 38→39, admin/index.html birga, Test 16 jadvali birga; script.js 47 da QOLDI — unga tegilmadi. SINALGANI: 74 TEST YASHIL (hisobotchi mustaqil qayta yurgizdi); brauzerda O'LCHANDI — cho'zilish 0.98x/1.00x, tanlangan fayllar to'g'ri (DPR2 telefon → 900w, DPR2 desktop → 2240w), uchala slayd ko'z bilan ko'rildi telefonda va desktopda; konsolda faqat /api/ 404 lari (lokalda backend yo'q) — regressiya emas. TEKSHIRILMAGANI: avtomatik almashish (5 s) va silliq surish JONLI KO'RILMAGAN — brauzer panelida tab hidden turadi va u yerda scroll hodisasi umuman otilmaydi (kechagi yozuvning aynan takrori). Hujjat: docs/sprintlar/sprint-4.md, docs/dizayn-tizimi/banner-rasm-tz.md)";





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
