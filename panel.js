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
  updatedEl.textContent = "Yangilanish: 2026-08-16, uchinchi commit (MINI APP PROFIL KARTASINING BACKENDI TO'G'RILANDI — UCHTA NUQSON, UCHALASI HAM JIMGINA EDI. Karta 2026-08-15 da qayta chizilgan, ya'ni KO'RINISHI to'g'ri edi; bu commit uning ORTIDAGI ma'lumotni to'g'riladi. 🔴 BIRINCHISI XAVFSIZLIK: GET /api/telegram-contact?uid=<id> telefon raqamini SO'ROVDA KELGAN Telegram ID bo'yicha qaytarardi — imzo yo'q, sessiya yo'q, hech qanday tekshiruv yo'q. Telegram ID esa SIR EMAS (guruhdagi xabar, forward, @userinfobot), ya'ni ISTALGAN ODAM ISTALGAN FOYDALANUVCHINING TELEFON RAQAMINI bitta curl bilan o'qiy olardi. Bu CLAUDE.md ning eng tepasidagi qoidaning to'g'ridan-to'g'ri buzilishi («klient yuborgan tg_user_id ga ishonadigan endpoint qo'shilmasin») va u qoida YOZILGANDAN KEYIN ham shu holda turgan — loyihadagi UCHINCHI shunday holat (disputes, routes/ai.js, endi telegram-contact). Endpoint TUZATILMADI, BUTUNLAY OLIB TASHLANDI: imzo qo'shish mumkin edi, lekin u holda ayni faktni beradigan ikkita yo'l qolardi — /api/me allaqachon «men kimman» javobini beradi. IKKINCHISI: telefon Mini App'da localStorage dan o'qilardi (QURILMAGA bog'langan), sayt esa AYNI raqamni bazadan o'qirdi — yana o'sha «bir yuzda ishlab ikkinchisida ishlamaydigan» naqsh. Natijasi ikki tomonlama edi: raqam botda almashtirilganda (webhook users.phone ni ustidan yozadi va «endi shu raqam turadi» deb JAVOB BERADI) Mini App eskisini cheksiz ko'rsatib turardi, boshqa qurilmada esa «Raqam ulanmagan» deb turardi. Endi ikkala yuz ham users.phone dan oziqlanadi (/api/me, kimlik requestUser() dan — ikkala kanal), va loadMe() server «raqam yo'q» deganda localStorage dagi eskisini O'CHIRADI ham — pickup_point_id da aynan shu tuzoq bo'lgan (faqat yozib, o'chirmaslik). UCHINCHISI: profil kartasidagi «buyurtma» va «rulon» soni — va ular ustiga qurilgan UNVON (Mehmon→Mijoz→Hamkor→Qadrdon) — klientda ORDERS massividan hisoblanardi, massiv esa /api/orders dan LIMIT 50 bilan keladi. Ya'ni raqam umrbod emas, OXIRGI 50 BUYURTMA OYNASI edi: 51-buyurtmadan keyin rulon soni deyarli qotardi va 100 rulon sotib olgan xaridor «Qadrdon» BO'LOLMASDI. Nuqson ayni paytda ENG SODIQ xaridorda chiqardi — kam xarid qilganda hammasi to'g'ri ko'rinardi. Endi baza agregati (routes/seller.js → buyerStats, /api/me javobida stats): count(DISTINCT o.id) — oddiy count(*) EMAS, chunki order_items bilan birikma har MAHSULOT uchun qator beradi va 3 mahsulotli bitta buyurtma «3 ta buyurtma» bo'lib ko'rinardi (pglite'da nazorat sinovi buni tasdiqladi — count(*) 7 chiqardi, DISTINCT 5). ♡ soni ATAYLAB serverga ko'chirilmadi: u xaridor OCHA OLADIGAN ro'yxat bilan mos bo'lishi shart, aks holda bazada 12 ta ♡ turib katalogda 9 tasi chizilardi. Mezon shu — raqam ro'yxat bo'lib chizilsa ro'yxatdan, chizilmasa bazadan. YO'L-YO'LAKAY TOPILDI VA U ALOHIDA QIMMAT: orders jadvalida tg_user_id bo'yicha INDEKS HECH QACHON BO'LMAGAN, holbuki xaridor kanalidagi eng issiq ikki so'rov aynan shu ustundan boshlanadi — /api/orders (MINI APP HAR OCHILGANDA) va endi /api/me agregati; ya'ni har ochilishda butun jadval to'liq skanerlanardi. db/027 qo'shildi, ikki ustunli (tg_user_id, created_at DESC) — shunda ORDER BY ham shu indeksdan qanoatlanadi. Mavjud idx_orders_created (001) bu ishni BAJARMAYDI (u xaridorni ajratmaydi) — «indeks bor» degan taxmin tekshirilmagan da'vo edi. Bugungi hajmda sekinlik SEZILMAYDI va aynan shuning uchun ko'rinmay kelgan: nuqson jadval o'sgani sari yomonlashadi va hech qachon «buzildi» degan signal bermaydi. contacts.json FAYL BAZASI OLIB TASHLANDI (lib/contacts.js o'chirildi, config.js dan CONTACTS_FILE, webhook.js dan saveContact) — u IKKINCHI MANBA edi va o'sha endpointdan boshqa hech kim o'qimasdi. 🔴 UNING EACCES ALERTI TEKSHIRILGANDA HOLAT KUTILGANIDAN YOMONROQ CHIQDI: tirik papkada contacts.json UMUMAN YO'Q edi — papka egaligi 501:staff (rsync -a lokal macOS UID'ini RAQAM BO'YICHA ko'chirgan), servis esa www-data nomidan ishlaydi va u yerga fayl YARATA OLMAYDI. Ya'ni alert bir nosozlikni emas, RAQAMLAR UMUMAN YOZILMAYOTGANINI aytib turgan edi. Lekin ular yo'qolmagan: eski nusxalar /opt/lolamarket-notify.bak-*/ papkalarida qolgan — o'lchandi, eng to'lasida 9 yozuv va ULARDAN 3 TASI BAZADA YO'Q edi. Shuning uchun backfill-contacts.js ga yo'l ARGUMENT bilan beriladi va zaxira ENG TO'LASI bo'yicha tanlanadi, eng yangisi bo'yicha emas (fayl vaqti-vaqti bilan yo'qolib turgan, ya'ni yangiroq nusxa kamroq yozuvga ega bo'lishi mumkin). Skript faqat BO'SH joyni to'ldiradi (WHERE phone IS NULL) — bazadagi raqam yangiroq bo'lishi mumkin va u bosilmasin; idempotent. QOROVUL — YANGI TEST 36 (4 band): (1) telegram-contact na serverda na klientda qaytmasin VA Mini App hech qayerga uid= yubormasin — bu NAQSHNI ushlaydi, endpoint boshqa nom bilan qayta tug'ilsa birinchi ikki tekshiruv ko'rmasdi; (2) /api/me javobida phone bor, handleMe requestUser() da, currentSeller u.phone ni o'qiydi; (3) loadMe() server javobini QO'LLAYDI va «raqam yo'q» deganda localStorage ni tozalaydi; (4) statistika LIMIT siz va count(DISTINCT o.id) bilan. 11 MUTATSIYA BILAN SINALDI, 11 TASI HAM USHLANDI. ⚠️ SINOV QOROVULNING O'ZIDA TESHIK OCHDI (M11): dastlab faqat removeItem tekshirilardi va «S.tgPhone = d.phone» qatorini o'chirib yuborish qorovuldan JIMGINA o'tib ketdi — ya'ni server to'g'ri javob berib turib, klient uni qo'llamasdan eski qiymatda qolardi, TUZATILAYOTGAN NUQSONNING AYNAN O'ZI. Dars: serverni to'g'rilash yetarli emas, javob QO'LLANISHI ham tekshirilsin — «qildim» ≠ «sodir bo'ldi» (2026-08-14 darsining takrori). SQL HAQIQIY POSTGRES'DA (pglite) BAJARIB KO'RILDI, chunki test.js SQL ni BAJARMAYDI va yashil test «SQL to'g'ri» degani emas: agregat orders=5 / rolls=20 berdi, EXPLAIN yangi indeksni ishlatdi, backfill bazadagi mavjud raqamni bosmadi. Kesh: telegram-app/app.js v96 → v97, panel.js v39 → v40, Test 16 jadvali birga. SINALGANI: 75 TEST YASHIL (hisobotchi mustaqil qayta yurgizdi va sanadi). ⚠️ DEPLOY ESLATMASI: bu commit SERVER kodiga tegadi, ya'ni statik rsync YETARLI EMAS — servis restart kerak, VA db/027 migratsiyasi qo'lda ishga tushirilsin; backfill esa alohida, serverdagi zaxira fayl yo'li bilan. TAVSIYA (bajarilmadi, founder qaroriga qoldirildi): «rsync -a lokal UID ni raqam bo'yicha ko'chiradi» dalili CLAUDE.md ning Deploy bo'limiga yozilsin — u bitta faylning muammosi emas, deploy naqshi. Hujjat: docs/sprintlar/sprint-3.md (kimlik/telefon), docs/sprintlar/sprint-4.md (statistika va indeks))";





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
