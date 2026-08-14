/* ============================================================
   LolaMarket Telegram Mini App — dizayndan to'liq implement
   ============================================================ */

/* ── data-action / data-input delegatsiyasi ──
   Shartnoma `script.js` dagi bilan AYNI — ikki sahifa bitta naqshda bo'lsin:
     data-action="fn"              → fn()
     data-action="fn" data-arg="x" → fn('x')   (butun son bo'lsa Number)
     data-input="fn"               → fn(maydon qiymati)
   Ko'p argument `|` bilan kodlanadi va ingichka o'ram uni ajratadi.

   NEGA inline `onclick` o'rniga: CSP `script-src` dagi `'unsafe-inline'`
   shu hodisalar tufayli turibdi. U olib tashlanmaguncha CSP ikkinchi qatlam
   bo'la olmaydi — kelajakda biror joyda `esc()` unutilsa, xatoni HECH NARSA
   tutmaydi.

   ⚠️ `stopPropagation` KERAK EMAS: `closest` eng ICHKARIGI `[data-action]`
   elementni topadi, ya'ni kartochka ichidagi tugma bosilganda kartochkaning
   o'z amali umuman chaqirilmaydi. Faqat BO'SH o'ramlar (ilgari yolg'iz
   `event.stopPropagation()` turgan joylar) `data-action="noop"` oladi —
   aks holda ularning bo'sh joyiga bosilsa klik kartochkagacha ko'tarilardi. */
function noop() {}

// `location.reload()` — usul chaqiruvi, ya'ni delegatsiya topa oladigan
// global nom emas. Shuning uchun nomli o'ram.
function reloadApp() { location.reload(); }

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const fn = window[el.dataset.action];
  if (typeof fn !== 'function') return;
  const arg = el.dataset.arg;
  if (arg === undefined) { fn(); return; }
  fn(/^-?\d+$/.test(arg) ? Number(arg) : arg);
});

// Esc — to'liq ekran rasmni yopadi. Brauzerda sinash uchun kerak (Telegram
// ichida klaviatura yo'q, lekin Mini App sayt sifatida ham ochiladi).
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && S.photoView) closePhoto();
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  const fn = window[el.dataset.input];
  if (typeof fn === 'function') fn(e.target.value, el.dataset.arg);
});

// ============ TO'QIMA PATTERNLAR (CSS gradient) ============
const PATTERNS = {
  adras:      "repeating-linear-gradient(96deg,#E84B40 0 16px,#EFA91F 16px 27px,#119DAB 27px 42px,#FBF6EC 42px 48px,#571814 48px 58px,#54D7E1 58px 70px)",
  adrasCool:  "repeating-linear-gradient(94deg,#119DAB 0 15px,#0C656F 15px 26px,#54D7E1 26px 40px,#FBF6EC 40px 46px,#232842 46px 58px)",
  adrasWarm:  "repeating-linear-gradient(92deg,#E84B40 0 14px,#7C201A 14px 24px,#EFA91F 24px 38px,#FBF6EC 38px 44px,#F46A5F 44px 56px)",
  ikat:       "radial-gradient(circle at 20% 30%,rgba(232,75,64,.55) 0 9%,transparent 10%),radial-gradient(circle at 70% 60%,rgba(17,157,171,.55) 0 9%,transparent 10%),repeating-linear-gradient(45deg,#FBF6EC 0 14px,#F1E4CE 14px 28px)",
  suzani:     "radial-gradient(circle at 50% 50%,#E84B40 0 5%,transparent 6%),radial-gradient(circle at 0% 0%,#119DAB 0 5%,transparent 6%),radial-gradient(circle at 100% 100%,#119DAB 0 5%,transparent 6%),radial-gradient(circle at 0% 100%,#EFA91F 0 5%,transparent 6%),radial-gradient(circle at 100% 0%,#EFA91F 0 5%,transparent 6%),#1B1E3C",
  herringbone:"repeating-linear-gradient(45deg,#0C656F 0 4px,#119DAB 4px 8px),repeating-linear-gradient(-45deg,rgba(255,255,255,.06) 0 4px,transparent 4px 8px)",
  weave:      "repeating-linear-gradient(0deg,rgba(23,26,48,.05) 0 3px,transparent 3px 6px),repeating-linear-gradient(90deg,rgba(23,26,48,.06) 0 3px,transparent 3px 6px),#E9D9BE",
  plain:      "linear-gradient(135deg,#F46A5F,#E84B40)",
};
const PSIZES = {
  suzani: "34px 34px",
  ikat: "60px 60px,60px 60px,40px 40px",
  herringbone: "16px 16px,16px 16px",
  weave: "6px 6px,6px 6px,auto",
};
function pSize(k) { return PSIZES[k] || 'auto'; }

// ============ MATNLAR (ikki tillilik) ============
const STR = {
  uz: { brand: "LolaMarket", brandSub: "Ulgurji matolar bozori", miniApp: "mini ilova", greetSub: "Bugun qanday matolar kerak?",
    searchPh: "Mato yoki kategoriya qidiring", cats: "Kategoriyalar", all: "Barchasi", featured: "Tavsiya etiladi",
    verifiedMills: "28 tasdiqlangan fabrika · xavfsiz to'lov", catalog: "Katalog", filter: "Filtr", sort: "Saralash",
    priceT: "Narx oralig'i", priceMinPh: "Eng kam", priceMaxPh: "Eng ko'p", priceUnit: "so'm / rulon",
    priceApply: "Qo'llash", priceClear: "Tozalash", priceRangeHint: "Katalogdagi narxlar",
    priceBad: "Eng kam narx eng ko'pdan katta bo'lmasin", noProductsPrice: "Bu narx oralig'ida mato yo'q",
    somU: "so'm", priceFrom: "dan yuqori", priceTo: "gacha", priceRemove: "Narx filtrini olib tashlash",
    day: "kun", addCart: "Savatga qo'shish", order: "Buyurtma berish", specs: "Tafsilotlar", width: "Eni", weight: "Zichlik",
    comp: "Tarkibi", leadTime: "Yetkazish muddati", minOrder: "Minimal buyurtma (MOQ)", supplierL: "Yetkazib beruvchi",
    mediaPhoto: "Rasm", mediaVideo: "Video",
    // To'liq ekran ko'rish — matoning ipini ko'rish uchun
    pvHint: "Ikki marta bosing yoki barmoq bilan kattalashtiring",
    pvClose: "Yopish",
    verified: "Tasdiqlangan", reviews: "sharh", message: "Xabar yuborish", qty: "Miqdor", cart: "Savat", cartEmpty: "Savat bo'sh",
    // — AI kiyim RASMI (2026-08-07) —
    // ⚠️ `aiLimit` ("Bugungi N ta generatsiya tugadi. Ertaga 00:00 da
    // yangilanadi") O'CHIRILDI — kunlik limit LOLA CREDIT ga almashdi.
    // Matn dead-code bo'lib qolmadi, O'CHIRILDI: kredit qoldiq va u o'zi
    // tiklanmaydi, ya'ni o'sha jumla endi YOLG'ON. Kutilmaganda chizilib
    // qolsa, foydalanuvchi ertaga bekorga qaytardi.
    aiRetry: "Qayta urinish",
    aiErr: "Hozir generatsiya qilib bo'lmadi, birozdan keyin urinib ko'ring",
    // ⚠️ `kim` savoli va uning `ayol`/`bola` yorliqlari 2026-08-09 da
    // O'CHIRILDI — server tomonda butun guruh ketdi (founder: "defolt ayol
    // tura qolsin"). Yorliqlar dead-code bo'lib QOLDIRILMADI: Test 14j
    // faqat serverdagi kalitlar qoplanganini tekshiradi, ya'ni ortiqcha
    // yorliq testni QIZIL QILMASDI va shu yerda jimgina yotib qolardi.
    aiQ: {
      kiyim: "Nima tikilsin?", uslub: "Qayerga?",
      dizayn: "Dizayn yo'nalishi", rang: "Qo'shimcha rang", qoshimcha: "Qo'shimcha material",
    },
    aiO: {
      koylak_milliy: "Milliy ko'ylak", koylak: "Ko'ylak", kostyum: "Kostyum",
      palto: "Palto", yubka: "Yubka", romol: "Ro'mol",
      kundalik: "Kundalik", bayram: "Bayram / to'y", ish: "Ish",
      neoklassika: "Neoklassika", zamonaviy: "Zamonaviy",
      minimalistik: "Minimalistik", combo: "Combo",
      oq: "Oq", qora: "Qora", bej: "Bej", kok: "Ko'k",
      yashil: "Yashil", bordo: "Bordo", oltin: "Oltin",
      yoq: "Yo'q", charm: "Charm", jinsi: "Jinsi",
      bahmal: "Bahmal", dantel: "Dantel", trikotaj: "Trikotaj",
    },
    aiTextQ: "Yana nima qo'shilsin? (ixtiyoriy)",
    aiTextPh: "masalan: oltin tugma, qora yoqa",
    aiTextBad: "Matnda ruxsat etilmagan belgi bor — faqat harf, raqam, vergul va chiziqcha",
    // "Boshqa fason" (2026-08-09). ⚠️ Matnda narx AYTILADI: tugma yangi rasm
    // chizdiradi, ya'ni kredit yeydi. "Boshqacha chizish" (`aiAgain`) esa
    // TEKIN — u faqat savollarga qaytaradi. Ikkalasi yonma-yon turgani
    // uchun farqi ko'rinib turishi shart, aks holda xaridor bilmagan holda
    // pul sarflardi.
    aiOtherCut: "Boshqa fason",
    aiOtherCutHint: "Yangi fason — {n} credit",
    aiCredits: "Lola credit",
    aiCreditCost: "Bitta rasm — {n} credit",
    aiCreditLeft: "{n} credit qoldi",
    aiCreditNone: "Lola credit tugadi",
    aiCreditNoneSub: "Kredit qoldig'i tugadi — yangi rasm chizib bo'lmaydi.",
    aiUnlimited: "Cheksiz",
    aiTabFeed: "Lenta", aiTabMine: "Mening rasmlarim",
    aiNewBtn: "✦ Yangi rasm chizish",
    aiPickFabric: "Qaysi matodan?",
    aiOtherFabric: "Boshqa mato",
    aiMineEmpty: "Siz hali rasm chizmagansiz",
    aiShare: "Ulashish",
    aiOrder: "Shu matodan buyurtma",
    allFabrics: "Barcha matolar",
    aiJump: "Kiyimda ko'rish",
    aiHubT: "AI bilan chizilgan",
    aiHubSub: "Matolardan tikilgan kiyimlar — mahsulot suratidan chizilgan",
    aiHubEmpty: "Hali birorta rasm chizilmagan",
    aiHubEmptySub: "Mato sahifasini oching va «Kiyimda ko'rish» tugmasini bosing",
    aiHubBrowse: "Matolarni ko'rish",
    aiGo: "Rasmni chizish",
    aiPick: "{m} tadan {n} tasi tanlandi",
    aiAgain: "Boshqacha chizish",
    // `aiImgNote` MAJBURIY yorliq (sprint-10.md): mato haqiqiy bo'lsa ham
    // rasmda MAVJUD BO'LMAGAN buyum ko'rinadi. Uni olib tashlash mumkin emas.
    aiImgT: "AI kiyim rasmi", aiImgBtn: "Shu matodan kiyim rasmini ko'rish",
    aiImgSub: "Mahsulot suratidan chiziladi",
    aiImgLoading: "Mo'jiza tayyor bo'lmoqda… ✨",
    aiImgNote: "AI tasavvuri — haqiqiy mahsulot emas",
    aiImgNoPhoto: "Bu mahsulotda surat yo'q, shuning uchun rasm chizib bo'lmaydi",
    // ⚠️ "Kreditingiz qaytarildi" AYTILADI — server uni haqiqatan qaytaradi
    // va buni jim qoldirish xaridorni "pulim ketdi" degan shubhada
    // qoldirardi (2026-08-08 da aynan shu holat bo'lgan).
    aiBusy: "AI xizmati hozir band. Kreditingiz qaytarildi — bir necha daqiqadan keyin urinib ko'ring",
    aiBlocked: "AI bu so'rov bo'yicha rasm chizishdan bosh tortdi. Kreditingiz qaytarildi — javoblarni o'zgartirib ko'ring",
    // — Sharhlar —
    reviewsT: "Sharhlar", noReviews: "Hali sharh yo'q", noReviewsSub: "Birinchi sharhni siz yozishingiz mumkin",
    rateIt: "Baholash", rated: "Baholandi", revTitle: "Matoni baholang",
    revSub: "Faqat siz olgan mato haqida — bahoyingiz boshqa xaridorlarga yordam beradi",
    revPh: "Sifati haqida qisqacha yozing (ixtiyoriy)", revSend: "Yuborish", revCancel: "Bekor",
    revSent: "Rahmat! Sharhingiz qo'shildi", revStarsHint: "Yulduzni tanlang",
    sReviews: "Sharhlar", sNoReviews: "Sizga hali sharh yozilmagan",
    sNoReviewsSub: "Birinchi buyurtma yetkazilgandan keyin xaridorlar baho qo'ya boshlaydi",
    sRatingAvg: "O'rtacha baho",
    cartEmptySub: "Katalogdan mato tanlang", browse: "Katalogga o'tish", subtotal: "Oraliq jami", delivery: "Yetkazish",
    deliveryCalc: "Taxminan", deliveryNote: "BTS nuqtasida to'g'ridan-to'g'ri to'lanadi, buyurtma summasiga kirmaydi",
    total: "Jami", checkout: "Rasmiylashtirish", checkoutT: "Buyurtma berish",
    address: "Yetkazib berish manzili", changeAddr: "O'zgartirish", payment: "To'lov", commentL: "Izoh",
    orderItems: "Buyurtma tarkibi", pickupL: "Olish nuqtasi (BTS)", pickPoint: "Olish nuqtasini tanlang",
    pickSheetT: "Olish nuqtasini tanlang", pickSearchPh: "Nuqta yoki manzil qidiring",
    pointsFound: "nuqta topildi", pointsNone: "Bu viloyatda nuqta topilmadi", pickSelect: "Tanlash",
    changePoint: "O'zgartirish", workHours: "Ish vaqti",
    deliveryBts: "Yetkazish (BTS)",
    payNow: "Hozir to'lanadi", payLater: "Olishda to'lanadi", payNowBtn: "Hozir to'lash",
    needPoint: "Avval olish nuqtasini tanlang",
    commentPh: "Buyurtma uchun izoh (ixtiyoriy)", summary: "Buyurtma tarkibi", placeOrder: "Buyurtmani tasdiqlash",
    orders: "Buyurtmalarim", active: "Faol", past: "Tarix", noActive: "Faol buyurtma yo'q", track: "Kuzatish", reorder: "Qayta buyurtma",
    dispProblem: "Muammo bor", dispTitle: "Muammoni bildiring",
    dispSub: "Muammoni tanlang. Keyin bot rasm so'raydi — moderator ko'rib chiqadi.",
    dispCommentPh: "Qisqacha izoh (ixtiyoriy)", dispSend: "Yuborish", dispCancel: "Bekor qilish",
    dispSent: "Bahs ochildi — botga muammo rasmini yuboring",
    dispOpenBadge: "Bahs ko'rib chiqilmoqda", dispResolvedBadge: "Bahs hal qilindi",
    dispDecision: "Qaror", dispRefund: "Qaytarildi", dispNeedPhoto: "Botga rasm yuboring",
    profile: "Profil", editP: "Tahrirlash", ordersCount: "buyurtma", settings: "Sozlamalar", language: "Til", notifications: "Bildirishnomalar",
    // — Profil: mening manzilim —
    myAddr: "Mening manzilim", myAddrNone: "Doimiy olish nuqtasi tanlanmagan",
    myAddrHint: "Tanlansa, buyurtma berishda shu nuqta oldindan qo'yiladi",
    myAddrPick: "Kartadan tanlash", myAddrChange: "O'zgartirish",
    myAddrSaved: "Manzil saqlandi", myAddrErr: "Manzil saqlanmadi — qayta urinib ko'ring",
    myAddrGuest: "Saqlash uchun ilovani Telegram orqali oching",
    viewList: "Ro'yxat", viewMap: "Karta",
    mapApprox: "Belgi tuman markazi aniqligida — aniq joyni BTS bilan tekshiring",
    mapOff: "Karta yuklanmadi — nuqtani ro'yxatdan tanlang",
    mapLoading: "Karta yuklanmoqda…",
    // — Profil: biz bilan bog'lanish —
    contactT: "Biz bilan bog'lanish", contactCall: "Qo'ng'iroq qilish",
    contactTg: "Telegram orqali yozish",
    contactSub: "Qo'ng'iroq yoki Telegram", contactTgWay: "Telegram orqali",
    phoneCopied: "Raqam nusxalandi — qo'ng'iroq ochilmasa, qo'lda tering",
    phoneCopyErr: "Raqamni nusxalab bo'lmadi — uni qo'lda ko'chiring",
    search: "Qidiruv", recent: "So'nggi qidiruvlar", noResults: "Hech narsa topilmadi",
    noResultsSub: "Boshqa so'z bilan urinib ko'ring", resultsN: "natija topildi", // ⚠️ `tabHome` — `home` EKRANINING yorlig'i, u endi "Katalog" deb
    // o'qiladi: bosh sahifa katalogga birlashdi (2026-08-07). Kalit nomi
    // ekranga bog'langan, yorliq esa foydalanuvchi ko'radigan so'z.
    tabHome: "Katalog", tabAi: "AI",
    tabCart: "Savat", tabOrders: "Buyurtma", tabProfile: "Profil", added: "Savatga qo'shildi 🌷", liked: "Sevimlilarga qo'shildi",
    // Buyurtmadagi mahsulot katalogdan chiqib ketgan (e'lon yopilgan/o'chirilgan).
    // Tarix baribir ko'rsatiladi — xaridor NIMA buyurtma qilganini bilishi shart.
    itemGone: "Mahsulot endi mavjud emas", reorderPartial: "Mavjud matolar savatga qo'shildi",
    // Yoqtirilgan matolar. Ilgari ♡ bosilardi-yu, ular QAYERGA tushgani
    // hech qayerda ko'rinmasdi — ya'ni tugma ishlagandek tuyulib, natijasi
    // yo'q edi (founder, 2026-08-13).
    savedT: "Saqlangan matolar", savedEmpty: "Hali hech narsa saqlanmagan",
    savedEmptySub: "Yoqqan matoni ♡ bilan belgilang — shu yerda to'planadi", savedGo: "Katalogga o'tish",
    orderPlaced: "Buyurtma qabul qilindi", orderPlacedSub: "Ishlab chiqaruvchi tasdiqlaydi — tez orada xabar beramiz",
    viewOrders: "Buyurtmalarni ko'rish", continue: "Xaridni davom ettirish",
    items: "tur", panelU: "dona", mU: "m", product: "Mahsulot", noProducts: "Mahsulot topilmadi",
    tgVerified: "Telegram orqali tasdiqlangan", tgNotConnected: "Telegram orqali ochilganda profil avtomatik aniqlanadi", tgUserFallback: "Telegram foydalanuvchisi",
    shareContact: "Telefon raqamni ulashish", contactPending: "Raqam so'ralmoqda, biroz kuting…", contactDone: "Telefon raqami yangilandi",
    orderErr: "Buyurtma yuborilmadi", netErr: "Internet aloqasi yo'q — qayta urinib ko'ring",
    pricesStale: "Narxlar yangilanmadi — internetni tekshiring va qayta urinib ko'ring",
    authErr: "Buyurtma berish uchun ilovani Telegram orqali oching",
    // — Sotuvchi kabineti —
    sellerMode: "Sotuvchi rejimi", buyerMode: "Xaridor rejimiga qaytish", toSeller: "Sotuvchi rejimi",
    sProducts: "Mahsulotlarim", sOrders: "Buyurtmalar", sActive: "Faol", sHidden: "Yashirin",
    sNew: "Yangi", sProgress: "Jarayonda", sDone: "Yakunlangan",
    stPublished: "Sotuvda", stPending: "Moderatsiyada", stRejected: "Rad etildi", stDraft: "Yashirilgan",
    sNoProducts: "Hali mahsulot yo'q", sNoProductsSub: "Birinchi matongizni qo'shing",
    sNoOrders: "Bu bo'limda buyurtma yo'q",
    sAdd: "Mahsulot qo'shish", sEdit: "Tahrirlash", sHide: "Yashirish", sShow: "Qayta ko'rsatish",
    soldOut: "Zaxirada tugadi", soldOutSub: "Sotuvchi yangi rulon qo'shishini kuting",
    sStock: "Zaxira (rulon soni)", sStockPh: "Bo'sh qoldirilsa — cheksiz",
    sStockLabel: "Zaxira", sStockUnlimited: "cheksiz",
    sImgWaiting: "Rasm kutilmoqda — botga rasm yuboring", sImgAdd: "Rasm yuklash",
    sImgRequested: "So'raldi — botga rasm yuboring", sPhotoHint: "Saqlangach botga rasm yuboring — u katalogda ko'rinadi.",
    sVidOn: "Video qo'shilgan", sVidWaiting: "Video kutilmoqda — MP4, 30 soniyagacha",
    sVidAdd: "Video qo'shish", sVidReplace: "Videoni almashtirish",
    sVidRequested: "So'raldi — botga video yuboring",
    sDispute: "Xaridor shikoyati", sDisputeReplyPh: "Javobingiz — moderator va xaridor ko'radi",
    sDisputeSend: "Javob yuborish", sDisputeSent: "Javob yuborildi",
    sDisputeYours: "Sizning javobingiz", sDisputeNeed: "Javob matnini yozing",
    sSave: "Saqlash", sName: "Nomi", sPrice: "Narxi (so'm)", sMoq: "Minimal buyurtma", sCat: "Kategoriya",
    sComp: "Tarkibi", sSaved: "Saqlandi — moderatsiyaga yuborildi", sHidden2: "Mahsulot yashirildi",
    sShown: "Qayta ko'rsatishga yuborildi",
    sAccept: "Qabul qilish", sReject: "Rad etish", sShip: "Jo'natildi deb belgilash",
    sTracking: "BTS trek raqami", sTrackingPh: "Masalan: BTS-77410293",
    sPrepaid: "Oldindan to'lov tushdi", sRestWait: "Qolgani olishda",
    sBuyer: "Xaridor", sPickup: "Yetkazish", sYourPart: "Sizning qismingiz",
    sAccepted: "Buyurtma qabul qilindi", sRejected: "Buyurtma rad etildi", sShipped: "Jo'natildi deb belgilandi",
    sConfirmReject: "Buyurtmani rad etasizmi? Xaridorga xabar boradi.",
    sNeedTracking: "Trek raqamini kiriting",
    perUnit: "1 dona rulon narxi", notifTitle: "Bildirishnomalar", notifEmpty: "Hozircha xabarlar yo'q",
    notifEmptySub: "Yangi bildirishnomalar shu yerda ko'rinadi", social: "Ijtimoiy tarmoqlar" },
  ru: { brand: "LolaMarket", brandSub: "Оптовый рынок тканей", miniApp: "мини-приложение", greetSub: "Какие ткани нужны сегодня?",
    searchPh: "Поиск ткани или категории", cats: "Категории", all: "Все", featured: "Рекомендуем",
    verifiedMills: "28 проверенных фабрик · безопасная оплата", catalog: "Каталог", filter: "Фильтр", sort: "Сортировка",
    priceT: "Диапазон цены", priceMinPh: "Минимум", priceMaxPh: "Максимум", priceUnit: "сум / рулон",
    priceApply: "Применить", priceClear: "Сбросить", priceRangeHint: "Цены в каталоге",
    priceBad: "Минимум не может быть больше максимума", noProductsPrice: "В этом диапазоне тканей нет",
    somU: "сум", priceFrom: "и выше", priceTo: "и ниже", priceRemove: "Убрать фильтр по цене",
    day: "дн.", addCart: "В корзину", order: "Оформить заказ", specs: "Характеристики", width: "Ширина", weight: "Плотность",
    comp: "Состав", leadTime: "Срок поставки", minOrder: "Мин. заказ (MOQ)", supplierL: "Поставщик",
    mediaPhoto: "Фото", mediaVideo: "Видео",
    pvHint: "Нажмите дважды или разведите пальцами",
    pvClose: "Закрыть",
    verified: "Проверен", reviews: "отзыв.", message: "Написать", qty: "Количество", cart: "Корзина", cartEmpty: "Корзина пуста",
    // — Изображение одежды от AI (2026-08-07) —
    // ⚠️ Рисунок НЕ зависит от языка (в нём нет текста), поэтому кеш общий.
    aiRetry: "Повторить",
    aiErr: "Сейчас не удалось сгенерировать, попробуйте чуть позже",
    aiQ: {
      kiyim: "Что сшить?", uslub: "Куда?",
      dizayn: "Направление дизайна", rang: "Дополнительный цвет", qoshimcha: "Доп. материал",
    },
    aiO: {
      koylak_milliy: "Нац. платье", koylak: "Платье", kostyum: "Костюм",
      palto: "Пальто", yubka: "Юбка", romol: "Платок",
      kundalik: "Повседневно", bayram: "Праздник / свадьба", ish: "Работа",
      neoklassika: "Неоклассика", zamonaviy: "Современный",
      minimalistik: "Минимализм", combo: "Комбо",
      oq: "Белый", qora: "Чёрный", bej: "Бежевый", kok: "Синий",
      yashil: "Зелёный", bordo: "Бордовый", oltin: "Золотой",
      yoq: "Нет", charm: "Кожа", jinsi: "Джинса",
      bahmal: "Бархат", dantel: "Кружево", trikotaj: "Трикотаж",
    },
    aiTextQ: "Что ещё добавить? (необязательно)",
    aiTextPh: "например: золотые пуговицы, чёрный воротник",
    aiTextBad: "В тексте недопустимый символ — только буквы, цифры, запятая и дефис",
    aiOtherCut: "Другой фасон",
    aiOtherCutHint: "Новый фасон — {n} credit",
    aiCredits: "Lola credit",
    aiCreditCost: "Одно изображение — {n} credit",
    aiCreditLeft: "Осталось {n} credit",
    aiCreditNone: "Lola credit закончились",
    aiCreditNoneSub: "Остаток кредитов исчерпан — новое изображение не построить.",
    aiUnlimited: "Безлимит",
    aiTabFeed: "Лента", aiTabMine: "Мои изображения",
    aiNewBtn: "✦ Новое изображение",
    aiPickFabric: "Из какой ткани?",
    aiOtherFabric: "Другая ткань",
    aiMineEmpty: "Вы ещё не создавали изображений",
    aiShare: "Поделиться",
    aiOrder: "Заказать эту ткань",
    allFabrics: "Все ткани",
    aiJump: "Смотреть в одежде",
    aiHubT: "Нарисовано AI",
    aiHubSub: "Одежда из тканей — нарисована по фото товара",
    aiHubEmpty: "Пока ни одного изображения",
    aiHubEmptySub: "Откройте страницу ткани и нажмите «Смотреть в одежде»",
    aiHubBrowse: "Смотреть ткани",
    aiGo: "Нарисовать",
    aiPick: "Выбрано {n} из {m}",
    aiAgain: "Нарисовать иначе",
    aiImgT: "AI-изображение одежды", aiImgBtn: "Показать одежду из этой ткани",
    aiImgSub: "Рисуется по фото товара",
    aiImgLoading: "Чудо готовится… ✨",
    aiImgNote: "Представление AI — это не реальный товар",
    aiImgNoPhoto: "У этого товара нет фото, поэтому изображение не построить",
    aiBusy: "Сервис AI сейчас перегружен. Кредит возвращён — попробуйте через несколько минут",
    aiBlocked: "AI отказался рисовать по этому запросу. Кредит возвращён — попробуйте изменить ответы",
    // — Отзывы —
    reviewsT: "Отзывы", noReviews: "Отзывов пока нет", noReviewsSub: "Вы можете оставить первый отзыв",
    rateIt: "Оценить", rated: "Оценено", revTitle: "Оцените ткань",
    revSub: "Только о полученной вами ткани — ваша оценка поможет другим покупателям",
    revPh: "Коротко о качестве (необязательно)", revSend: "Отправить", revCancel: "Отмена",
    revSent: "Спасибо! Отзыв добавлен", revStarsHint: "Выберите оценку",
    sReviews: "Отзывы", sNoReviews: "Вам пока не оставляли отзывов",
    sNoReviewsSub: "Покупатели начнут оценивать после первой доставки",
    sRatingAvg: "Средняя оценка",
    cartEmptySub: "Выберите ткань в каталоге", browse: "В каталог", subtotal: "Подытог", delivery: "Доставка",
    deliveryCalc: "Примерно", deliveryNote: "Оплачивается напрямую в пункте BTS, не входит в сумму заказа",
    total: "Итого", checkout: "Оформить", checkoutT: "Оформление заказа",
    address: "Адрес доставки", changeAddr: "Изменить", payment: "Оплата", commentL: "Комментарий",
    orderItems: "Состав заказа", pickupL: "Пункт выдачи (BTS)", pickPoint: "Выберите пункт выдачи",
    pickSheetT: "Выберите пункт выдачи", pickSearchPh: "Поиск пункта или адреса",
    pointsFound: "пунктов найдено", pointsNone: "В этой области пунктов не найдено", pickSelect: "Выбрать",
    changePoint: "Изменить", workHours: "Часы работы",
    deliveryBts: "Доставка (BTS)",
    payNow: "К оплате сейчас", payLater: "Оплата при получении", payNowBtn: "Оплатить сейчас",
    needPoint: "Сначала выберите пункт выдачи",
    commentPh: "Комментарий к заказу (необязательно)", summary: "Состав заказа", placeOrder: "Подтвердить заказ",
    orders: "Мои заказы", active: "Активные", past: "История", noActive: "Нет активных заказов", track: "Отследить", reorder: "Повторить",
    dispProblem: "Есть проблема", dispTitle: "Сообщите о проблеме",
    dispSub: "Выберите проблему. Затем бот попросит фото — модератор рассмотрит.",
    dispCommentPh: "Краткий комментарий (необязательно)", dispSend: "Отправить", dispCancel: "Отмена",
    dispSent: "Спор открыт — отправьте фото боту",
    dispOpenBadge: "Спор рассматривается", dispResolvedBadge: "Спор решён",
    dispDecision: "Решение", dispRefund: "Возвращено", dispNeedPhoto: "Отправьте фото боту",
    profile: "Профиль", editP: "Изменить", ordersCount: "заказов", settings: "Настройки", language: "Язык", notifications: "Уведомления",
    // — Профиль: мой адрес —
    myAddr: "Мой адрес", myAddrNone: "Постоянный пункт выдачи не выбран",
    myAddrHint: "Выбранный пункт будет подставлен при оформлении заказа",
    myAddrPick: "Выбрать на карте", myAddrChange: "Изменить",
    myAddrSaved: "Адрес сохранён", myAddrErr: "Адрес не сохранён — попробуйте ещё раз",
    myAddrGuest: "Чтобы сохранить, откройте приложение через Telegram",
    viewList: "Список", viewMap: "Карта",
    mapApprox: "Метка с точностью до центра района — уточните адрес в BTS",
    mapOff: "Карта не загрузилась — выберите пункт из списка",
    mapLoading: "Карта загружается…",
    // — Профиль: связаться с нами —
    contactT: "Связаться с нами", contactCall: "Позвонить",
    contactTg: "Написать в Telegram",
    contactSub: "Звонок или Telegram", contactTgWay: "Через Telegram",
    phoneCopied: "Номер скопирован — если звонок не открылся, наберите вручную",
    phoneCopyErr: "Не удалось скопировать номер — скопируйте вручную",
    search: "Поиск", recent: "Недавние поиски", noResults: "Ничего не найдено",
    noResultsSub: "Попробуйте другой запрос", resultsN: "результатов", tabHome: "Каталог", tabAi: "AI",
    tabCart: "Корзина", tabOrders: "Заказы", tabProfile: "Профиль", added: "Добавлено в корзину 🌷", liked: "Добавлено в избранное",
    itemGone: "Товар больше недоступен", reorderPartial: "Доступные ткани добавлены в корзину",
    savedT: "Сохранённые ткани", savedEmpty: "Пока ничего не сохранено",
    savedEmptySub: "Отметьте понравившуюся ткань ♡ — она появится здесь", savedGo: "В каталог",
    orderPlaced: "Заказ принят", orderPlacedSub: "Производитель подтвердит — мы сообщим вам",
    viewOrders: "Посмотреть заказы", continue: "Продолжить покупки",
    items: "поз.", panelU: "шт", mU: "м", product: "Товар", noProducts: "Товары не найдены",
    tgVerified: "Подтверждено через Telegram", tgNotConnected: "При открытии через Telegram профиль определится автоматически", tgUserFallback: "Пользователь Telegram",
    shareContact: "Поделиться номером телефона", contactPending: "Запрашивается номер, подождите…", contactDone: "Номер телефона обновлён",
    orderErr: "Заказ не отправлен", netErr: "Нет соединения — попробуйте ещё раз",
    pricesStale: "Цены не обновились — проверьте интернет и попробуйте снова",
    authErr: "Чтобы оформить заказ, откройте приложение через Telegram",
    // — Кабинет продавца —
    sellerMode: "Режим продавца", buyerMode: "Вернуться в режим покупателя", toSeller: "Режим продавца",
    sProducts: "Мои товары", sOrders: "Заказы", sActive: "Активные", sHidden: "Скрытые",
    sNew: "Новые", sProgress: "В работе", sDone: "Завершённые",
    stPublished: "В продаже", stPending: "На модерации", stRejected: "Отклонён", stDraft: "Скрыт",
    sNoProducts: "Товаров пока нет", sNoProductsSub: "Добавьте первую ткань",
    sNoOrders: "В этом разделе заказов нет",
    sAdd: "Добавить товар", sEdit: "Изменить", sHide: "Скрыть", sShow: "Показать снова",
    soldOut: "Нет в наличии", soldOutSub: "Дождитесь новых рулонов от продавца",
    sStock: "Запас (кол-во рулонов)", sStockPh: "Пусто — без ограничений",
    sStockLabel: "Запас", sStockUnlimited: "без ограничений",
    sImgWaiting: "Ожидается фото — отправьте его боту", sImgAdd: "Загрузить фото",
    sImgRequested: "Запрошено — отправьте фото боту", sPhotoHint: "После сохранения отправьте фото боту — оно появится в каталоге.",
    sVidOn: "Видео добавлено", sVidWaiting: "Ожидается видео — MP4, до 30 секунд",
    sVidAdd: "Добавить видео", sVidReplace: "Заменить видео",
    sVidRequested: "Запрошено — отправьте видео боту",
    sDispute: "Жалоба покупателя", sDisputeReplyPh: "Ваш ответ — увидят модератор и покупатель",
    sDisputeSend: "Отправить ответ", sDisputeSent: "Ответ отправлен",
    sDisputeYours: "Ваш ответ", sDisputeNeed: "Напишите текст ответа",
    sSave: "Сохранить", sName: "Название", sPrice: "Цена (сум)", sMoq: "Мин. заказ", sCat: "Категория",
    sComp: "Состав", sSaved: "Сохранено — отправлено на модерацию", sHidden2: "Товар скрыт",
    sShown: "Отправлено на повторную проверку",
    sAccept: "Принять", sReject: "Отклонить", sShip: "Отметить отправленным",
    sTracking: "Трек-номер BTS", sTrackingPh: "Например: BTS-77410293",
    sPrepaid: "Предоплата получена", sRestWait: "Остаток при получении",
    sBuyer: "Покупатель", sPickup: "Доставка", sYourPart: "Ваша часть",
    sAccepted: "Заказ принят", sRejected: "Заказ отклонён", sShipped: "Отмечено как отправленное",
    sConfirmReject: "Отклонить заказ? Покупатель получит уведомление.",
    sNeedTracking: "Введите трек-номер",
    perUnit: "Цена за 1 рулон", notifTitle: "Уведомления", notifEmpty: "Пока нет уведомлений",
    notifEmptySub: "Новые уведомления появятся здесь", social: "Соцсети" },
};

// ============ MAHSULOTLAR ============
// Zaxira ma'lumot — asosiy manba /api/products (bazadan). Tarmoq uzilsa do'kon buzilmaydi.
//
// `rating: null, reviews: 0` — ATAYLAB. 2026-07-31 gacha bu yerda o'ylab
// topilgan sonlar turardi (`4.9`, `42 sharh`) va tarmoq uzilganda xaridorga
// aynan o'sha yolg'on ko'rsatilardi. Reyting endi faqat haqiqiy sharhdan
// hisoblanadi (012_reviews.sql) — zaxira nusxada esa reyting UMUMAN yo'q,
// chunki zaxirada haqiqiy sharh bo'lishi mumkin emas. `null` bo'lsa
// mahsulot sahifasi reyting blokini ko'rsatmaydi.
let PRODUCTS = [
  { id:'ik-1402', pattern:'adras',      img:'assets/products/textile-01.jpg', price:850000, unit:'rulon', moq:1, lead:28, rating:null, reviews:0,  verified:true,  stockKey:'in',   catKey:'silk',   badgeTone:'primary',
    name:{ uz:"Marg'ilon ipak ikat", ru:"Шёлковый икат" }, supplier:{ uz:"Marg'ilon Ipak Co.", ru:"Маргилан Силк" }, city:{ uz:"Marg'ilon", ru:"Маргилан" },
    width:"0.9 m", weight:"90 g/m²", comp:{ uz:"100% tut ipagi", ru:"100% тутовый шёлк" }, badge:{ uz:"Tavsiya", ru:"Хит" } },
  { id:'ad-0890', pattern:'adrasWarm',  img:'assets/products/textile-02.jpg', price:730000, unit:'rulon', moq:1, lead:32, rating:null, reviews:0,  verified:true,  stockKey:'low',  catKey:'ikat',   badgeTone:'saffron',
    name:{ uz:"Qo'lbola adras", ru:"Ручной адрас" }, supplier:{ uz:"Buxoro Looms", ru:"Бухара Лумс" }, city:{ uz:"Buxoro", ru:"Бухара" },
    width:"1.0 m", weight:"150 g/m²", comp:{ uz:"50% ipak / 50% paxta", ru:"50% шёлк / 50% хлопок" }, badge:{ uz:"Kam qoldi", ru:"Мало" } },
  { id:'sz-3310', pattern:'suzani',     img:'assets/products/textile-03.jpg', price:890000, unit:'rulon', moq:1, lead:45, rating:null, reviews:0,  verified:true,  stockKey:'made', catKey:'suzani', badgeTone:'teal',
    name:{ uz:"So'zana panel — anor", ru:"Сюзане — гранат" }, supplier:{ uz:"Nurota Atelier", ru:"Нурата Ателье" }, city:{ uz:"Nurota", ru:"Нурата" },
    width:"1.4 × 1.8 m", weight:"—", comp:{ uz:"Paxta asos, ipak ip", ru:"Хлопок, шёлковая нить" }, badge:{ uz:"Hunarmand", ru:"Ручная" } },
  { id:'ck-2201', pattern:'adrasCool',  img:'assets/products/textile-04.jpg', price:700000, unit:'rulon', moq:1, lead:21, rating:null, reviews:0,  verified:false, stockKey:'in',   catKey:'cotton', badgeTone:'neutral',
    name:{ uz:"Paxta adras — indigo", ru:"Хлопковый адрас — индиго" }, supplier:{ uz:"O'sh Textile", ru:"Ош Текстиль" }, city:{ uz:"O'sh", ru:"Ош" },
    width:"1.5 m", weight:"180 g/m²", comp:{ uz:"100% paxta", ru:"100% хлопок" }, badge:null },
  { id:'hb-7740', pattern:'herringbone',img:'assets/products/textile-05.jpg', price:870000, unit:'rulon', moq:1, lead:35, rating:null, reviews:0,  verified:true,  stockKey:'in',   catKey:'wool',   badgeTone:'teal',
    name:{ uz:"Junli mato — yelkacha", ru:"Шерсть — ёлочка" }, supplier:{ uz:"Almati Weaving", ru:"Алматы Вивинг" }, city:{ uz:"Almati", ru:"Алматы" },
    width:"1.5 m", weight:"320 g/m²", comp:{ uz:"70% jun / 30% PES", ru:"70% шерсть / 30% ПЭ" }, badge:{ uz:"Yangi", ru:"Новинка" } },
  { id:'lk-5512', pattern:'weave',      img:'assets/products/textile-06.jpg', price:750000, unit:'rulon', moq:1, lead:24, rating:null, reviews:0,  verified:true,  stockKey:'in',   catKey:'linen',  badgeTone:'neutral',
    name:{ uz:"Zig'ir mato — natural", ru:"Лён — натуральный" }, supplier:{ uz:"Shymkent Mills", ru:"Шымкент Миллс" }, city:{ uz:"Shymkent", ru:"Шымкент" },
    width:"1.4 m", weight:"200 g/m²", comp:{ uz:"100% zig'ir", ru:"100% лён" }, badge:null },
  // `ik-9001` shu yerdan OLIB TASHLANDI (2026-08-02): u bazada hech qachon
  // bo'lmagan, ya'ni zaxira massiv haqiqatdan chetga chiqib ketgandi. Natijasi
  // ikki nuqson bo'ldi — bosh sahifa uni topa olmay butunlay qulardi, keyin esa
  // kartochkalar yuklanish paytida joyini almashtirardi. Zaxira massiv bazaning
  // MOSLASHGAN nusxasi bo'lsin: bu yerga bazada yo'q mahsulot qo'shilmasin.
  { id:'pl-3320', pattern:'plain',      img:'assets/products/textile-08.jpg', price:700000, unit:'rulon', moq:1, lead:18, rating:null, reviews:0,  verified:false, stockKey:'in',   catKey:'cotton', badgeTone:'neutral',
    name:{ uz:"Sodda to'qima — marjon", ru:"Простое плетение — коралл" }, supplier:{ uz:"Farg'ona Fabric", ru:"Фергана Фабрик" }, city:{ uz:"Farg'ona", ru:"Фергана" },
    width:"1.6 m", weight:"160 g/m²", comp:{ uz:"65% paxta / 35% PES", ru:"65% хлопок / 35% ПЭ" }, badge:null },
  { id:'tx-4401', pattern:'suzani',     img:'assets/products/textile-09.jpg', price:880000, unit:'rulon', moq:1, lead:40, rating:null, reviews:0,  verified:true,  stockKey:'made', catKey:'suzani', badgeTone:'saffron',
    name:{ uz:"Zar naqsh so'zana panel", ru:"Сюзане с золотым узором" }, supplier:{ uz:"Qarshi Hunarmand", ru:"Карши Хунармад" }, city:{ uz:"Qarshi", ru:"Карши" },
    width:"1.3 × 1.7 m", weight:"—", comp:{ uz:"Paxta asos, ipak ip", ru:"Хлопок, шёлковая нить" }, badge:{ uz:"Yangi", ru:"Новинка" } },
  { id:'tx-4402', pattern:'ikat',       img:'assets/products/textile-10.jpg', price:860000, unit:'rulon', moq:1, lead:26, rating:null, reviews:0,  verified:true,  stockKey:'in',   catKey:'silk',   badgeTone:'primary',
    name:{ uz:"Gulli ipak — lola", ru:"Шёлк с цветами — тюльпан" }, supplier:{ uz:"Andijon Ipak Uyi", ru:"Андижан Силк Хаус" }, city:{ uz:"Andijon", ru:"Андижан" },
    width:"1.1 m", weight:"95 g/m²", comp:{ uz:"100% tut ipagi", ru:"100% тутовый шёлк" }, badge:null },
  { id:'tx-4403', pattern:'plain',      img:'assets/products/textile-11.jpg', price:710000, unit:'rulon', moq:1, lead:19, rating:null, reviews:0,  verified:false, stockKey:'in',   catKey:'cotton', badgeTone:'neutral',
    name:{ uz:"Chit mato — sariq gul", ru:"Ситец — жёлтый цветок" }, supplier:{ uz:"Namangan Chit", ru:"Наманган Читтекс" }, city:{ uz:"Namangan", ru:"Наманган" },
    width:"1.5 m", weight:"140 g/m²", comp:{ uz:"100% paxta", ru:"100% хлопок" }, badge:null },
  { id:'tx-4404', pattern:'weave',      img:'assets/products/textile-12.png', price:760000, unit:'rulon', moq:1, lead:27, rating:null, reviews:0,  verified:true,  stockKey:'low',  catKey:'linen',  badgeTone:'teal',
    name:{ uz:"Vintage chit — krem atirgul", ru:"Винтажный ситец — кремовая роза" }, supplier:{ uz:"Xiva Tekstil", ru:"Хива Текстиль" }, city:{ uz:"Xiva", ru:"Хива" },
    width:"1.4 m", weight:"175 g/m²", comp:{ uz:"70% zig'ir / 30% paxta", ru:"70% лён / 30% хлопок" }, badge:{ uz:"Kam qoldi", ru:"Мало" } },
];

const CATS = [
  { key:'all',    label:{ uz:"Barchasi", ru:"Все" } },
  { key:'ikat',   label:{ uz:"Ikat va adras", ru:"Икат и адрас" } },
  { key:'suzani', label:{ uz:"So'zana", ru:"Сюзане" } },
  { key:'silk',   label:{ uz:"Ipak", ru:"Шёлк" } },
  { key:'cotton', label:{ uz:"Paxta", ru:"Хлопок" } },
  { key:'wool',   label:{ uz:"Jun", ru:"Шерсть" } },
  { key:'linen',  label:{ uz:"Zig'ir", ru:"Лён" } },
];

// ============ BUYURTMALAR — QURILMADA HAQIQIY SAQLASH (localStorage) ============
const MONTHS = {
  uz: ['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr'],
  ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
};
function orderDateLabel() {
  const d = new Date();
  return { uz: `${d.getDate()}-${MONTHS.uz[d.getMonth()]}`, ru: `${d.getDate()} ${MONTHS.ru[d.getMonth()]}` };
}
function nextOrderId() {
  const seq = parseInt(localStorage.getItem('lolamarket_order_seq') || '3000', 10) + 1;
  localStorage.setItem('lolamarket_order_seq', String(seq));
  return '#LM-' + seq;
}
function loadOrders() {
  try { return JSON.parse(localStorage.getItem('lolamarket_orders')) || []; }
  catch (e) { return []; }
}
function saveOrders() {
  try { localStorage.setItem('lolamarket_orders', JSON.stringify(ORDERS)); }
  catch (e) {}
}
let ORDERS = loadOrders();

const PAY = [
  { key:'payme', label:{ uz:"Payme", ru:"Payme" }, mark:'P', color:'#00CCCC' },
  { key:'click', label:{ uz:"Click", ru:"Click" }, mark:'C', color:'#0073E6' },
];

// Oldindan to'lov ulushi. Xaridor buyurtma berishda shuncha to'laydi,
// qolganini mato BTS'ga yetib kelgach to'laydi — to'lamaguncha BTS bermaydi.
const PREPAY_RATE = 0.5;
function prepayAmount(total) { return Math.round(total * PREPAY_RATE); }
function restAmount(total) { return total - prepayAmount(total); }

// Logistika (BTS Pochta) taxminiy narxi — server bilan bir xil qiymat
// (config.js DELIVERY_FEE_ESTIMATE). Mahsulot summasiga KIRMAYDI: xaridor
// buni BTS nuqtasida to'g'ridan-to'g'ri BTS'ga to'laydi, platforma
// escrow'iga (prepay/rest) qo'shilmaydi — shuning uchun "Jami"/"To'lanadi
// hozir" hisobiga qo'shilmaydi, faqat alohida qator sifatida ko'rsatiladi.
const DELIVERY_FEE_ESTIMATE = 25000;

// BTS olish nuqtalari. Vaqtinchalik ro'yxat — BTS integratsiyasi ulangach
// bu ma'lumot serverdan (/api/bts-points) keladi.
//
// 🔴 `lat`/`lng` — TUMAN/SHAHAR MARKAZI aniqligida, BTS eshigining aniq
// koordinatasi EMAS (2026-08-13). Ro'yxatning O'ZI namuna bo'lgani uchun
// aniq koordinata o'ylab topilgan raqam bo'lardi — CLAUDE.md ataylab
// taqiqlaydigan narsa, va bu yerda u ayniqsa qimmat: xarita nuqtani ANIQ
// ko'rsatayotgandek tuyuladi, ya'ni yolg'on ishonch uyg'otadi va xaridor
// noto'g'ri joyga borardi. Shuning uchun kartada `mapApprox` ogohlantirishi
// DOIM ko'rinadi va u BTS'dan haqiqiy koordinata kelganda olib tashlanadi.
const BTS_REGIONS = [
  { key:'tas', name:{ uz:"Toshkent",  ru:"Ташкент" } },
  { key:'far', name:{ uz:"Farg'ona",  ru:"Фергана" } },
  { key:'sam', name:{ uz:"Samarqand", ru:"Самарканд" } },
  { key:'bux', name:{ uz:"Buxoro",    ru:"Бухара" } },
  { key:'and', name:{ uz:"Andijon",   ru:"Андижан" } },
];
const BTS_POINTS = [
  { id:'bts-112', lat:41.2756, lng:69.2044, region:'tas', name:{ uz:"BTS №112 — Chilonzor", ru:"BTS №112 — Чиланзар" }, addr:{ uz:"Bunyodkor ko'ch. 45", ru:"ул. Бунёдкор 45" }, hours:"9:00–19:00" },
  { id:'bts-097', lat:41.3556, lng:69.2894, region:'tas', name:{ uz:"BTS №097 — Yunusobod", ru:"BTS №097 — Юнусабад" }, addr:{ uz:"Amir Temur ko'ch. 12", ru:"ул. Амира Темура 12" }, hours:"9:00–18:00" },
  { id:'bts-054', lat:41.2232, lng:69.2200, region:'tas', name:{ uz:"BTS №054 — Sergeli", ru:"BTS №054 — Сергели" }, addr:{ uz:"Yangi Sergeli 8", ru:"Янги Сергели 8" }, hours:"9:00–19:00" },
  { id:'bts-021', lat:41.3253, lng:69.3346, region:'tas', name:{ uz:"BTS №021 — Mirzo Ulug'bek", ru:"BTS №021 — Мирзо Улугбек" }, addr:{ uz:"Mustaqillik ko'ch. 78", ru:"ул. Мустакиллик 78" }, hours:"9:00–18:00" },
  { id:'bts-140', lat:40.3894, lng:71.7864, region:'far', name:{ uz:"BTS №140 — Farg'ona markaz", ru:"BTS №140 — Фергана центр" }, addr:{ uz:"Mustaqillik ko'ch. 24", ru:"ул. Мустакиллик 24" }, hours:"9:00–18:00" },
  { id:'bts-146', lat:40.4711, lng:71.7244, region:'far', name:{ uz:"BTS №146 — Marg'ilon", ru:"BTS №146 — Маргилан" }, addr:{ uz:"Toshkent ko'ch. 5", ru:"ул. Ташкентская 5" }, hours:"9:00–18:00" },
  { id:'bts-203', lat:39.6547, lng:66.9758, region:'sam', name:{ uz:"BTS №203 — Samarqand markaz", ru:"BTS №203 — Самарканд центр" }, addr:{ uz:"Registon ko'ch. 3", ru:"ул. Регистан 3" }, hours:"9:00–19:00" },
  { id:'bts-311', lat:39.7747, lng:64.4286, region:'bux', name:{ uz:"BTS №311 — Buxoro markaz", ru:"BTS №311 — Бухара центр" }, addr:{ uz:"Bahouddin Naqshband 17", ru:"ул. Бахоуддина Накшбанда 17" }, hours:"9:00–18:00" },
  { id:'bts-408', lat:40.7821, lng:72.3442, region:'and', name:{ uz:"BTS №408 — Andijon markaz", ru:"BTS №408 — Андижан центр" }, addr:{ uz:"Navoiy shoh ko'chasi 41", ru:"пр. Навои 41" }, hours:"9:00–18:00" },
];
function btsById(id) { return BTS_POINTS.find(p => p.id === id) || null; }

// Tanlangan nuqta saqlanadi — B2B xaridor deyarli doim bitta nuqtadan oladi,
// shuning uchun ikkinchi buyurtmada bu qadam allaqachon to'ldirilgan keladi.
function loadBtsPoint() {
  try { return localStorage.getItem('lolamarket_bts_point') || null; }
  catch (e) { return null; }
}
// ⚠️ Bo'sh qiymatda kalit O'CHIRILADI (2026-08-13). Aks holda boshqa
// qurilmada o'chirilgan tanlov bu yerda brauzer xotirasidan TIRILIB
// qolardi va buni hech narsa ko'rsatmasdi.
function saveBtsPoint(id) {
  try {
    if (id) localStorage.setItem('lolamarket_bts_point', id);
    else localStorage.removeItem('lolamarket_bts_point');
  } catch (e) {}
}

const RECENT_SEARCHES = {
  uz: ["adras","ipak","so'zana","jun","Marg'ilon"],
  ru: ["адрас","шёлк","сюзане","шерсть","Маргилан"],
};

// ============ BIZ BILAN BOG'LANISH ============
// LolaMarket qo'llab-quvvatlash kanallari (2026-08-13 founder qarori).
//
// ⚠️ AYNI blok saytda ham bor (`script.js` → `SUPPORT`) — BTS ro'yxati bilan
// bitta naqsh: nusxa BILIB QILINGAN, chunki uchinchi manba (server) hali yo'q.
// Raqam yoki username o'zgarsa IKKALASI birga yangilansin, aks holda ikki
// yuzda ikki xil raqam turib qolardi.
//
// ⚠️ `tel` — raqamning MOSHINA o'qiydigan shakli (probel va qavssiz): brauzer
// `tel:` havolasini aynan shu ko'rinishda ishonchli ochadi. `label` esa odam
// o'qiydigan shakl. Ikkalasi ALOHIDA saqlanadi — bittasidan ikkinchisini
// yasash (probellarni olib tashlash) bir kun kelib `+998 (93)` kabi shaklda
// jimgina buzilardi.
const SUPPORT = {
  tel: '+998939993996',
  telLabel: '+998 (93) 999-39-96',
  tgUser: 'furqattukhsanov',
  tgUrl: 'https://t.me/furqattukhsanov',
};

const COMPANY = {
  name:{ uz:"Muazzamxon Tekstil MChJ", ru:"ООО «Muazzamxon Tekstil»" },
  role:{ uz:"Xaridor · B2B", ru:"Покупатель · B2B" },
  addr:{ uz:"Toshkent, Yunusobod t., Amir Temur ko'ch. 12", ru:"Ташкент, Юнусабадский р-н, ул. Амира Темура 12" },
  since:{ uz:"2024 yildan beri", ru:"с 2024 года" },
  phone:"+998 90 123 45 67",
  email:"savdo@muazzamxon.uz", initials:"MT",
};

// ============ HOLAT ============
const S = {
  screen: 'home',
  history: [],
  selectedId: 'ik-1402',
  cart: [],
  qty: 300,
  search: '',
  cat: 'all',
  // — Narx oralig'i filtri —
  // null = chegara yo'q. Qo'llangan qiymat (priceMin/Max) sheet ichida
  // yozilayotgan qora nusxadan (priceDraft*) ATAYLAB ajratilgan: foydalanuvchi
  // yozayotganda katalog har harfda sakramaydi, faqat "Qo'llash" bosilganda o'zgaradi.
  priceMin: null,
  priceMax: null,
  priceSheet: false,
  priceDraftMin: '',
  priceDraftMax: '',
  priceErr: '',
  pay: 'payme',
  btsPoint: loadBtsPoint(),   // oxirgi tanlangan nuqta eslab qolinadi
  btsRegion: 'tas',
  btsSheet: false,
  btsQuery: '',
  // Nuqta tanlash oynasi qaysi ko'rinishda — ro'yxat yoki karta.
  // Ro'yxat BIRINCHI va bu ataylab: u kartaga, kalitga va tarmoqqa
  // bog'liq emas, ya'ni HAR DOIM ishlaydi (`mapsKey` yo'q bo'lsa karta
  // tugmasi umuman chizilmaydi).
  btsView: 'list',
  // Oyna QAYERDAN ochilgan — yopilganda qaysi ekran qayta chizilishini
  // shu hal qiladi (checkout / profil).
  btsFrom: 'checkout',
  // Karta sozlamasi SERVERDAN (`/api/auth/telegram` → `mapsClientConfig`).
  // Boshlang'ich `null` — javob kelmaguncha karta tugmasi ko'rinmaydi,
  // ya'ni bosilib "ishlamadi" deydigan tugma bo'lmaydi (AI tugmasi bilan
  // bitta mulohaza).
  mapsKey: null,
  // Manzil serverga saqlanmoqdami — tugma ikki marta bosilmasin.
  addrSaving: false,
  // "Biz bilan bog'lanish" oynasi ochiqmi. Ilgari bu bo'lim JOYIDA
  // ochilardi (2026-08-13), endi esa "Mening manzilim" kabi ALOHIDA oyna
  // (founder qarori): profil ro'yxati o'zgarmas balandlikda qoladi va ikki
  // bo'lim bir xil yo'l bilan ochiladi — bittasi joyida, ikkinchisi oynada
  // ochilishi qaysi biri "ichkariga olib kirishini" taxmin qildirardi.
  contactSheet: false,
  ordersTab: 'active',
  // — AI kiyim RASMI (2026-08-07) —
  // Serverdan keladi (`/api/auth/telegram` javobi): kalit yaroqsiz bo'lsa
  // tugma UMUMAN chizilmaydi. Boshlang'ich qiymat `false` — javob kelmaguncha
  // tugma ko'rinmaydi, ya'ni bosilib xato beradigan tugma bo'lmaydi.
  aiImageEnabled: false,
  // productId -> { state: 'loading'|'done'|'error'|'limit'|'nophoto', url, limit }
  // Kalit YO'Q bo'lsa — hali so'ralmagan (boshlang'ich holat).
  aiImages: {},
  // AI bo'limidagi galereya (`/api/ai/gallery`). `null` = hali yuklanmagan,
  // `[]` = yuklandi va BO'SH. Ikkisi bir xil emas: bo'shda "hali rasm yo'q"
  // deb aytiladi, yuklanmaganda esa hech narsa da'vo qilinmaydi.
  aiGallery: null,
  // Savol guruhlari va kalitlari SERVERDAN keladi (`aiImageChoices`).
  // Bu yerda qo'lda ro'yxat YO'Q — u serverda tug'iladi (db/014 darsi).
  aiChoiceKeys: null,
  // productId -> { kiyim, uslub, dizayn } — xaridor tanlagan javoblar.
  // Har mahsulotga alohida: bir matoga ko'ylak, boshqasiga palto so'ralishi
  // mumkin va biri ikkinchisini bosib ketmasligi kerak.
  aiChoices: {},
  // Combo qo'shimcha savollari — SERVERDAN (`aiComboChoices`). Faqat
  // `dizayn = combo` tanlanganda chiziladi.
  aiComboKeys: null,
  // Erkin matn chegarasi ham SERVERDAN: bu yerda 100, u yerda 60 bo'lib
  // qolsa xaridor yozib bo'lgach 400 xato ko'rardi (db/014 darsi).
  aiComboTextMax: 60,
  // "Boshqa fason" chegarasi — AYNI sabab bilan serverdan (`aiVariantMax`).
  // ⚠️ Boshlang'ich qiymat `0` va bu ATAYLAB: javob kelmaguncha tugma
  // UMUMAN chizilmaydi. Zaxira raqam qo'yilsa (masalan 5), server esa
  // boshqa chegara bilan ishlasa — xaridor tugmani bosib "javob yaroqsiz"
  // xatosini ko'rardi, ustiga bu pullik yo'l.
  aiVariantMax: 0,
  // productId -> nechanchi fason so'ralgan (0 = birinchisi). Kesh kalitiga
  // kiradi, ya'ni har oshirish YANGI rasm va YANGI kredit demak.
  aiVariant: {},
  aiText: {},            // productId -> combo erkin matni
  // Lola credit — { balance, cost, unlimited }. `null` = hali bilinmaydi va
  // shunda ko'rsatkich UMUMAN chizilmaydi (o'ylab topilgan raqam emas).
  aiCredits: null,
  aiMine: null,          // mening rasmlarim (/api/ai/my)
  aiTab: 'feed',         // AI ekrani: 'feed' | 'mine'
  aiWizard: null,        // AI ekranida tanlangan mato id (sehrgar)
  aiPickOpen: false,     // mato tanlash ro'yxati ochiqmi
  // Ochiq to'liq ekran rasm (mahsulot ekrani) — `null` = yopiq. Faqat URL
  // saqlanadi, masshtab esa modul o'zgaruvchisida (`_pv`).
  photoView: null,
  // — Bahsli holatlar (xaridor tomoni) —
  disputes: [],          // /api/disputes dan — o'z bahslari
  dispSheet: null,       // ochiq sheet: { orderId }
  dispReason: 'damaged',
  dispComment: '',
  sDispReply: {},        // bahs id → sotuvchi yozayotgan javob
  // — Sharhlar —
  myReviews: [],         // /api/reviews?mine=1 — "qaysi mahsulotni allaqachon baholaganman"
  prodReviews: {},       // mahsulot id → sharhlar ro'yxati (detail ekranida yuklanadi)
  revSheet: null,        // ochiq sheet: { orderId, productId }
  revStars: 5,
  revBody: '',
  sReviews: null,        // sotuvchi kabineti: { rating, count, items }
  // — Sotuvchi kabineti —
  role: 'buyer',        // serverdan (/api/me) keladi — mijoz o'zi belgilamaydi
  seller: null,         // { id, name, verified }
  sellerMode: false,    // kabinet ko'rinishi yoqilganmi
  sProducts: [],
  sOrders: [],
  sProdTab: 'active',   // active | hidden
  sOrdTab: 'new',       // new | progress | done
  sEditId: null,        // tahrirlanayotgan mahsulot (null = yangi qo'shish)
  sTracking: {},        // buyurtma id → kiritilayotgan trek raqami
  sLoading: false,
  liked: {},            // sevimlilar; `ik-9001` bazada yo'q edi — olib tashlandi
  lang: 'uz',
  notif: true,
  comment: '',
  tgUser: null,
  tgPhone: null,
  trackOpen: {},
};

// ============ YORDAMCHILAR ============
function money(n) {
  const v = Math.round(Number(n));
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
}
function num(n) { return Number(n).toLocaleString('en-US'); }
function uShort(u) { return (u === 'panel' || u === 'rulon') ? STR[S.lang].panelU : STR[S.lang].mU; }
function step(p) { return 1; }

function byId(id) { return PRODUCTS.find(x => x.id === id); }

// CSS `url('...')` ichiga tushadigan manzil uchun. `esc()` bu yerda YARAMAYDI —
// sabab uning tepasidagi izohda. DIQQAT: `encodeURI()` ning O'ZI ham yetarli
// emas — u bitta tirnoqni qochirmaydi (sinab ko'rilgan: hujum baribir o'tdi),
// shuning uchun tirnoq alohida `%27` ga almashtiriladi.
function cssUrl(u) {
  return encodeURI(String(u == null ? '' : u)).replace(/'/g, '%27');
}

// Bosh sahifadagi "Tanlangan" bloki. Bu ID'lar bazaga bog'liq EMAS — biror
// mahsulot o'chirilsa ro'yxat jimgina eskiradi, shuning uchun `renderHome()`
// yo'q ID'ni tashlab ketadi va o'rnini katalogdan to'ldiradi.
// ⚠️ Bu ID'lar HAM zaxira massivda, HAM bazada bo'lishi shart. Bittasi faqat
// zaxirada bo'lsa, ilova ochilganda avval u ko'rinadi, keyin katalog bazadan
// kelgach tushib qoladi va kartochkalar KO'Z OLDIDA joyini almashtiradi
// (2026-08-02: `ik-9001` aynan shunday edi — u bazada umuman yo'q).
const FEATURED_IDS = ['ik-1402','ad-0890','sz-3310','hb-7740'];

// ============ REKLAMA BANNERI (2026-08-14, founder qarori) ============
// Uch slayd, 5 soniyada almashadi. Fon rasmlari — `assets/ads/ad-N.jpg`
// (1200×338, Imagen bilan chizilgan yumshoq ipak, past kontrast).
//
// ⚠️ MATN RASMDA EMAS, shu yerda. Sabab: Mini App ikki tilli va sarlavha
// rasmga chizilsa rus xaridori o'zbekcha sarlavha ko'rardi. Bu yerda esa
// til bepul almashadi va matn tuzatish = bitta satr, rasm qayta
// chizilmaydi. Rasm faqat FON — chap yarmi ataylab tinch qoldirilgan.
//
// ⚠️ CTA tugmasi YO'Q — butun banner bosiladi (founder qarori). 101px
// balandlikda 38px tugma bannerning ~70% ini yeb, sarlavhaga joy
// qoldirmasdi.
//
// `go` — bosilganda chaqiriladigan amal. Yangi slayd qo'shilsa shu yerga
// qo'shiladi, chizish kodiga tegilmaydi.
const AD_SLIDES = [
  { img: 'assets/ads/ad-1.jpg', tone: 'rose', go: () => tab('ai'),
    eyebrow: { uz: 'AI xizmati',        ru: 'AI-сервис' },
    title:   { uz: 'Matolarni<br>jonlantiring', ru: 'Оживите ткани' } },
  { img: 'assets/ads/ad-2.jpg', tone: 'saffron', go: () => tab('home'),
    eyebrow: null,
    title:   { uz: '24/7 buyurtma<br>berishingiz mumkin', ru: 'Принимаем<br>заказы 24/7' } },
  { img: 'assets/ads/ad-3.jpg', tone: 'teal', go: () => tab('home'),
    eyebrow: { uz: 'Ilk 3 ta buyurtma', ru: 'Первые 3 заказа' },
    title:   { uz: 'Bepul yetkazib berish', ru: 'Доставка — бесплатно' } },
];

const BADGE_COLORS = {
  primary: ['var(--color-primary)','#fff'],
  teal:    ['var(--teal-50)','var(--teal-700)'],
  saffron: ['var(--saffron-50)','var(--saffron-700)'],
  neutral: ['var(--ink-100)','var(--ink-700)'],
};
const STOCK_COLOR = { in:'var(--success-500)', low:'var(--saffron-500)', made:'var(--teal-500)', out:'var(--danger-500)' };
const STOCK_TXT   = { in:{ uz:'Sotuvda', ru:'В наличии' }, low:{ uz:'Kam qoldi', ru:'Мало осталось' }, made:{ uz:'Buyurtmaga', ru:'Под заказ' }, out:{ uz:'Tugadi', ru:'Нет в наличии' } };

// "Kam qoldi" chegarasi — shundan past bo'lsa xaridorga sariq belgi ko'rsatiladi.
const LOW_STOCK = 5;

// Zaxira ko'rinishi HAQIQIY songa asoslanadi (011 migratsiyasi).
// `stock === null` — cheksiz: `made` mahsulotlar va sotuvchi hali son
// kiritmagan e'lonlar; ular uchun eski `stock_key` yorlig'i ishlatiladi.
// `stock === undefined` — eski/keshlangan API javobi, xuddi shu yo'l.
function stockView(p) {
  const L = S.lang;
  const n = p.stock;
  if (n === null || n === undefined) {
    const k = STOCK_TXT[p.stockKey] ? p.stockKey : 'made';
    return { txt: STOCK_TXT[k][L], col: STOCK_COLOR[k], soldOut: false };
  }
  if (n <= 0) return { txt: STOCK_TXT.out[L], col: STOCK_COLOR.out, soldOut: true };
  if (n <= LOW_STOCK) {
    return { txt: `${STOCK_TXT.low[L]} · ${n}`, col: STOCK_COLOR.low, soldOut: false };
  }
  return { txt: STOCK_TXT.in[L], col: STOCK_COLOR.in, soldOut: false };
}
const STATUS_TXT  = {
  production:{ uz:'Ishlab chiqarilmoqda', ru:'В производстве' },
  shipped:   { uz:"Yo'lda",              ru:'В пути' },
  delivered: { uz:'Yetkazildi',          ru:'Доставлено' },
  pending:   { uz:'Tasdiq kutilmoqda',   ru:'Ожидает' },
  confirmed: { uz:'Tasdiqlandi',         ru:'Подтверждено' },
  // Sprint 7 holatlari — bularsiz kartochka chizilayotganda xato bo'lardi
  completed: { uz:'Yakunlandi',          ru:'Завершён' },
  refunded:  { uz:'Pul qaytarildi',      ru:'Возвращено' },
  cancelled: { uz:'Bekor qilindi',       ru:'Отменён' },
};
const STATUS_COL  = {
  saffron: ['var(--saffron-50)','var(--saffron-700)'],
  teal:    ['var(--teal-50)','var(--teal-700)'],
  success: ['var(--success-100)','#0E6B47'],
  neutral: ['var(--ink-100)','var(--ink-700)'],
};
const STATUS_TONE = {
  production:'saffron', shipped:'teal', delivered:'success', pending:'neutral', confirmed:'saffron',
  completed:'success', refunded:'neutral', cancelled:'neutral',
};
const STATUS_STAGES = ['pending','confirmed','shipped','delivered'];

function vm(p) {
  // Mahsulot topilmasa `null` qaytariladi, xato tashlanmaydi. `byId()` bazadan
  // o'chirilgan yoki yashirilgan mahsulotda `undefined` beradi va ilgari shu yer
  // butun ekranni qulatardi (2026-08-02: bosh sahifa `ik-9001` ga bog'liq edi).
  if (!p) return null;
  const [bbg,bfg] = BADGE_COLORS[p.badgeTone] || BADGE_COLORS.neutral;
  const L = S.lang;
  // Matn maydonlari SHU YERDA tozalanadi, chizish joyida emas. Sabab: nom,
  // sotuvchi va shahar BAZADAN keladi (sotuvchi yozadi), ular esa o'nlab
  // joyda `innerHTML` ga qo'yiladi — har birini alohida `esc()` ga o'rash
  // ertami-kech esdan chiqadi. `vm()` — mahsulot ekranga chiqishidan oldin
  // o'tadigan YAGONA nuqta, shuning uchun himoya shu chegarada turadi.
  return {
    ...p,
    name: esc(p.name[L]), supplier: esc(p.supplier[L]), city: esc(p.city[L]), comp: esc(p.comp[L]),
    badge: p.badge ? esc(p.badge[L]) : null,
    bg: PATTERNS[p.pattern] || PATTERNS.plain,
    bgSize: pSize(p.pattern),
    // Bu yerda `esc()` EMAS, `cssUrl()` — qiymat `style` atributi ichidagi
    // CSS `url()` ga tushadi va u yerda HTML qochirilishi ish bermaydi
    // (sabab `esc()` tepasidagi izohda).
    bgStyle: p.img
      ? `background-image:url('${cssUrl(p.img)}');background-size:cover;background-position:center`
      : `background:${PATTERNS[p.pattern] || PATTERNS.plain};background-size:${pSize(p.pattern)}`,
    // Video ham SHU chegarada tozalanadi — nom/sotuvchi bilan bir xil sabab:
    // qiymat `src="..."` atributiga tushadi va chizish joyida `esc()` ni
    // eslab qolishga tayanib bo'lmaydi.
    video: p.video ? esc(p.video) : null,
    videoPoster: p.videoPoster ? esc(p.videoPoster) : null,
    priceLabel: money(p.price),
    unitLabel: '/' + uShort(p.unit),
    perUnitLabel: STR[L].perUnit,
    moqLabel: num(p.moq) + ' ' + uShort(p.unit),
    leadLabel: p.lead + ' ' + STR[L].day,
    stockTxt: stockView(p).txt,
    stockCol: stockView(p).col,
    soldOut: stockView(p).soldOut,
    badgeShow: !!p.badge,
    badgeBg: bbg, badgeFg: bfg,
    liked: !!S.liked[p.id],
    heartFill: S.liked[p.id] ? 'var(--color-primary)' : 'none',
    heartStroke: S.liked[p.id] ? 'var(--color-primary)' : 'var(--text-body)',
    meta: esc(p.city[L]) + ' · MOQ ' + num(p.moq) + uShort(p.unit) + ' · ' + p.lead + ' ' + STR[L].day,
  };
}

function cartTotal() { return S.cart.reduce((s,c) => s + byId(c.id).price * c.qty, 0); }
function cartCount() { return S.cart.length; }

// ============ NAVIGATSIYA ============
function navigate(screen) {
  if (S.screen !== screen) S.history.push(S.screen);
  S.screen = screen;
  render();
  const w = document.getElementById('screen-wrap');
  if (w) w.scrollTop = 0;
}
function goBack() {
  const prev = S.history.pop() || 'home';
  S.screen = prev;
  render();
}
// Saqlangan matolar — profildan ochiladi, ya'ni `navigate` (tarixga yozadi
// va ‹ profilga qaytaradi), `tab` EMAS: `tab` tarixni tozalab yuborardi va
// orqaga tugmasi bosh sahifaga olib chiqardi.
function openSaved() { navigate('saved'); }
function tab(k) {
  S.screen = k;
  S.history = [];
  render();
  if (k === 'orders') syncOrderStatuses();
  // Galereya faqat AI bo'limi ochilganda yuklanadi — boshqa ekranlarga
  // keraksiz so'rov qo'shmaydi. Har ochilishda yangilanadi: oradan vaqt
  // o'tib yangi rasm chizilgan bo'lishi mumkin.
  // AI ekrani ochilganda: lenta + kredit qoldig'i. Kredit `loadAiMine` bilan
  // BITTA javobda keladi, ya'ni ikkita so'rov emas, ikkitasi ham bir so'rovda.
  // ⚠️ Bu yerda HECH NARSA generatsiya qilinmaydi (Sprint 10 qarori) —
  // ekran ochilishi pul sarflamaydi.
  if (k === 'ai') { loadAiGallery(); loadAiMine(); }
}

// ============ SAVAT ============
function addToCart(id, qty) {
  const line = S.cart.find(x => x.id === id);
  if (line) line.qty += qty;
  else S.cart.push({ id, qty });
  showToast(STR[S.lang].added);
  render();
}
function incCart(id) {
  const p = byId(id);
  const line = S.cart.find(x => x.id === id);
  if (line) { line.qty += step(p); render(); }
}
function decCart(id) {
  const p = byId(id);
  const line = S.cart.find(x => x.id === id);
  if (line) { line.qty = Math.max(p.moq, line.qty - step(p)); render(); }
}
function removeCart(id) {
  S.cart = S.cart.filter(x => x.id !== id);
  render();
}

// ============ MAHSULOT OCHISH ============
function openProduct(id) {
  const p = byId(id);
  S.selectedId = id;
  S.qty = p ? p.moq : 300;
  if (S.screen !== 'detail') S.history.push(S.screen);
  S.screen = 'detail';
  render();
  const w = document.getElementById('screen-wrap');
  if (w) w.scrollTop = 0;
  loadProductReviews(id);
}

function incQty() {
  const p = byId(S.selectedId);
  S.qty += step(p);
  const el = document.getElementById('detail-qty');
  if (el) el.textContent = num(S.qty) + ' ' + uShort(p.unit);
  const el2 = document.getElementById('main-btn-sub');
  if (el2) el2.textContent = money(p.price * S.qty);
}
function decQty() {
  const p = byId(S.selectedId);
  S.qty = Math.max(p.moq, S.qty - step(p));
  const el = document.getElementById('detail-qty');
  if (el) el.textContent = num(S.qty) + ' ' + uShort(p.unit);
  const el2 = document.getElementById('main-btn-sub');
  if (el2) el2.textContent = money(p.price * S.qty);
}

// ============ TOAST ============
let _toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.add('hidden'), 2000);
}

// ============ HEADER ============
function updateHeader() {
  const sc = S.screen;
  const T = STR[S.lang];
  const titles = {
    home:T.brand, ai:T.tabAi, detail:T.product,
    search:T.search, cart:T.cart, checkout:T.checkoutT,
    orders:T.orders, profile:T.profile, success:T.checkoutT,
    notifications:T.notifTitle, saved:T.savedT,
    's-products':T.sProducts, 's-orders':T.sOrders, 's-profile':T.profile,
    's-form':S.sEditId ? T.sEdit : T.sAdd,
  };

  document.getElementById('btn-back').classList.toggle('hidden', !['detail','checkout','s-form','saved'].includes(sc));
  document.getElementById('header-brand').style.display = sc === 'home' ? 'flex' : 'none';
  document.getElementById('btn-header-search').classList.toggle('hidden', !['home','orders','cart'].includes(sc));
  // Mahsulot ekranida qo'ng'iroq YASHIRINADI: rasm endi header ostidan
  // o'tadi va o'ng yuqori burchakni "sevimli" tugmasi egallaydi — ikkalasi
  // AYNI nuqtada ustma-ust tushardi (2026-08-13).
  document.querySelector('.notif-btn').classList.toggle('hidden', sc === 'detail');

  // ---- Mahsulot ekranining boshqaruvi: ✦ va ♡ ‹ bilan bitta qatorda ----
  // ⚠️ Ular `renderDetail()` dan SHU YERGA ko'chirildi (2026-08-13) va sabab
  // dizayndan kattaroq: hero ichidagi tugmalar shaffof header qutisi OSTIDA
  // qolardi, ya'ni "sevimli" rasm ustida turib BOSILMASDI — nuqson jimgina
  // edi, chunki tugma ko'rinib turardi.
  const detailmi = sc === 'detail' && !!S.selectedId;
  const like = document.getElementById('btn-like');
  const jump = document.getElementById('btn-ai-jump');
  like.classList.toggle('hidden', !detailmi);
  // ✦ faqat rasm bor ekranda ma'noga ega — sozlama o'chiq bo'lsa bo'lim ham
  // chizilmaydi va tugma faqat hech qayerga olib bormaydigan tugma bo'lardi.
  jump.classList.toggle('hidden', !(detailmi && S.aiImageEnabled && S.aiChoiceKeys));
  if (detailmi) {
    jump.textContent = `✦ ${T.aiJump}`;
    like.dataset.arg = S.selectedId;
    const yoq = !!S.liked[S.selectedId];
    like.style.color = yoq ? 'var(--color-primary)' : 'var(--text-body)';
    document.getElementById('btn-like-i').setAttribute('fill', yoq ? 'var(--color-primary)' : 'none');
    like.setAttribute('aria-label', T.savedT);
  }

  const titleEl = document.getElementById('header-title');
  const subEl   = document.getElementById('header-sub');
  if (sc === 'home') {
    titleEl.textContent = T.brand;
    subEl.style.display = 'block';
    subEl.textContent   = T.brandSub;
  } else if (sc === 'detail' && S.selectedId) {
    const p = byId(S.selectedId);
    titleEl.textContent = p ? p.name[S.lang] : T.product;
    subEl.style.display = 'block';
    subEl.textContent   = p ? p.city[S.lang] : '';
  } else {
    titleEl.textContent = titles[sc] || T.brand;
    subEl.style.display = 'none';
  }
}

// ============ NAVIGATSIYA PANELI ============
function updateNav() {
  const sc = S.screen;
  const T = STR[S.lang];
  // ⚠️ `saved` shu ro'yxatda va bu ataylab: u katalog kabi ko'rish ekrani,
  // pastki panelsiz esa berk ko'cha bo'lardi. Linza ko'rsatilmaydi —
  // `navMap` da yo'q, ya'ni "qaysi tabdaman" degan savol tug'ilmaydi.
  const TAB_SCREENS = ['home','ai','search','cart','orders','profile','notifications','saved'];
  const S_TABS = ['s-products','s-orders','s-profile'];
  const inSeller = S.sellerMode;
  const showTabBar = !inSeller && TAB_SCREENS.includes(sc);
  const showSellerBar = inSeller && S_TABS.includes(sc);
  // 's-form' ekranida pastda "Saqlash" tugmasi turadi (detail/checkout kabi)
  const showMainBtn = sc === 'detail' || sc === 'checkout' || sc === 's-form';

  document.getElementById('app-nav').classList.toggle('hidden', !showTabBar);
  document.getElementById('seller-nav').classList.toggle('hidden', !showSellerBar);
  document.getElementById('main-btn-bar').classList.toggle('hidden', !showMainBtn);

  if (showSellerBar) {
    const sIdx = { 's-products':0, 's-orders':1, 's-profile':2 }[sc] ?? 0;
    const lens = document.getElementById('snav-lens');
    lens.classList.remove('hidden');
    lens.style.left = `calc(7px + ${sIdx} * ((100% - 14px) / 3))`;
    const on = '#ffe9db', off = 'rgba(104,17,11,.68)';
    document.getElementById('snav-products').style.color = sc === 's-products' ? on : off;
    document.getElementById('snav-orders').style.color   = sc === 's-orders'   ? on : off;
    document.getElementById('snav-profile').style.color  = sc === 's-profile'  ? on : off;
    // Yangi buyurtmalar soni — sotuvchi darhol ko'radi
    const nNew = S.sOrders.filter(o => o.statusKey === 'pending').length;
    const b = document.getElementById('snav-badge');
    b.classList.toggle('hidden', nNew === 0);
    if (nNew) b.textContent = nNew;
  }

  document.querySelector('#nav-home .nav-label').textContent    = T.tabHome;
  document.querySelector('#nav-ai .nav-label').textContent      = T.tabAi;
  document.querySelector('#nav-cart .nav-label').textContent    = T.tabCart;
  document.querySelector('#nav-orders .nav-label').textContent  = T.tabOrders;

  if (showTabBar) {
    // Indekslar `index.html` dagi tugmalar TARTIBIGA mos: lens shu raqam
    // bo'yicha suriladi, ya'ni tartib o'zgarsa bu jadval ham o'zgarsin.
    const navMap = { home:0, cart:1, orders:2, ai:3 };
    const lensIdx = navMap[sc] ?? null;
    const lensEl = document.getElementById('nav-lens');
    const showLens = lensIdx !== null;
    lensEl.classList.toggle('hidden', !showLens);
    if (showLens) {
      lensEl.style.left = `calc(7px + ${lensIdx} * ((100% - 14px) / 4))`;
    }

    const activeColor = '#ffe9db';
    const inactiveColor = 'rgba(104,17,11,.68)'; // shisha ustida o'qilishi uchun quyuqroq
    document.getElementById('nav-home').style.color    = (sc==='home' || sc==='detail') ? activeColor : inactiveColor;
    document.getElementById('nav-ai').style.color      = (sc==='ai') ? activeColor : inactiveColor;
    // `detail` endi BOSH sahifadan ochiladi — yorug' nuqta o'sha yerda qolsin
    document.getElementById('nav-cart').style.color    = (sc==='cart' || sc==='checkout')  ? activeColor : inactiveColor;
    document.getElementById('nav-orders').style.color  = (sc==='orders')  ? activeColor : inactiveColor;
    document.getElementById('nav-profile').classList.toggle('active', sc === 'profile');

    const badge = document.getElementById('cart-badge');
    const cnt = cartCount();
    badge.classList.toggle('hidden', cnt === 0);
    if (cnt > 0) badge.textContent = cnt;
  }

  if (showMainBtn) {
    const p = byId(S.selectedId);
    const btn = document.getElementById('main-btn');
    if (sc === 'detail' && p) {
      // Zaxira tugagan bo'lsa savatga qo'shib bo'lmaydi — sabab tugmaning
      // o'zida yoziladi (server baribir rad etardi, lekin xaridor buni
      // checkout'ga yetgandan keyin emas, shu yerda bilishi kerak).
      const out = stockView(p).soldOut;
      document.getElementById('main-btn-label').textContent = out ? T.soldOut : T.addCart;
      document.getElementById('main-btn-sub').textContent   = out ? T.soldOutSub : money(p.price * S.qty);
      if (btn) btn.classList.toggle('disabled', out);
    } else if (sc === 'checkout') {
      // Nuqta tanlanmagunicha tugma o'chirilgan bo'ladi va sababi tugmaning
      // o'zida yoziladi — foydalanuvchi nima yetishmayotganini izlab yurmaydi.
      const ready = !!btsById(S.btsPoint);
      document.getElementById('main-btn-label').textContent = T.payNowBtn;
      document.getElementById('main-btn-sub').textContent   = ready ? money(prepayAmount(cartTotal())) : T.needPoint;
      if (btn) btn.classList.toggle('disabled', !ready);
    } else if (sc === 's-form') {
      document.getElementById('main-btn-label').textContent = T.sSave;
      document.getElementById('main-btn-sub').textContent   = '';
      if (btn) btn.classList.remove('disabled');
    }
  }
}

// ============ REKLAMA BANNERI: chizish va karusel ============
// Matn `esc()` dan O'TMAYDI va bu ATAYLAB: manba `AD_SLIDES` — bizning O'Z
// konstantamiz, foydalanuvchi kiritgan matn emas, va ichida `<br>` bor.
// Foydalanuvchi matni bu yerga hech qachon kelmaydi.
function adBannerHtml() {
  const L = S.lang;
  return `
  <button class="ad-banner" data-action="adTap" aria-label="${STR[L].brand}">
    ${AD_SLIDES.map((s, i) => `
      <span class="ad-slide${i === 0 ? ' on' : ''}" data-tone="${s.tone}"
            style="background-image:url('${s.img}')">
        <span class="ad-copy">
          ${s.eyebrow ? `<span class="ad-eyebrow">${s.eyebrow[L]}</span>` : ''}
          <span class="ad-title">${s.title[L]}</span>
        </span>
        <span class="ad-chev">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </span>`).join('')}
    <span class="ad-dots">
      ${AD_SLIDES.map((_, i) => `<span class="ad-dot${i === 0 ? ' on' : ''}" data-action="adGo" data-arg="${i}" role="button" aria-label="${i + 1}-banner"><i></i></span>`).join('')}
    </span>
  </button>`;
}

// Taymer MODUL darajasida — `mountAdBanner()` uni har chizishda tozalaydi.
// Tozalanmasa har kategoriya bosilganda yangi taymer qo'shilib, slaydlar
// tez-tez "titraydigan" bo'lib qolardi.
let adIdx = 0;
let adTimer = null;

function adPaint() {
  const slides = document.querySelectorAll('.ad-banner .ad-slide');
  const dots = document.querySelectorAll('.ad-banner .ad-dot');
  slides.forEach((s, i) => s.classList.toggle('on', i === adIdx));
  dots.forEach((d, i) => d.classList.toggle('on', i === adIdx));
}

function adGo(i) {
  adIdx = (i + AD_SLIDES.length) % AD_SLIDES.length;
  adPaint();
  adStart();          // sanoq qaytadan boshlansin
}

function adStart() {
  if (adTimer) clearInterval(adTimer);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  adTimer = setInterval(() => {
    if (document.hidden) return;          // fon tabda batareya yemasin
    adIdx = (adIdx + 1) % AD_SLIDES.length;
    adPaint();
  }, 5000);
}

// Bannerga bosilganda. ⚠️ Nuqta bosilganda BU CHAQIRILMAYDI — delegatsiya
// `closest('[data-action]')` bilan eng ICHKARIGI elementni topadi, ya'ni
// nuqtaning `adGo` si bannerning `adTap` ini bosib ketadi (app.js boshidagi
// izoh). Aynan shu sabab `stopPropagation` ham kerak emas.
// ⚠️ SURISH bosish deb hisoblanmasin: barmoq 45px dan ko'p surilgan bo'lsa
// `adSwiped` yoqiladi va bu klik tashlab yuboriladi — aks holda har
// surishda banner amali ishga tushardi.
let adSwiped = false;
function adTap() {
  if (adSwiped) { adSwiped = false; return; }
  const s = AD_SLIDES[adIdx];
  if (s && typeof s.go === 'function') s.go();
}

// DOM tayyor bo'lgandan keyin ulanadi (`mountDetailMedia` naqshi).
// ⚠️ `renderHome()` TO'RT joydan chaqiriladi va uchtasi `render()` dan
// o'tmaydi — shuning uchun hamma joy `paintHome()` orqali yuradi.
function mountAdBanner() {
  const el = document.querySelector('.ad-banner');
  if (!el) { if (adTimer) { clearInterval(adTimer); adTimer = null; } return; }
  adIdx = 0;
  adPaint();
  adStart();

  let x0 = null;
  el.addEventListener('touchstart', (e) => {
    x0 = e.changedTouches[0].clientX;
    adSwiped = false;
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 45) { adSwiped = true; adGo(adIdx + (dx < 0 ? 1 : -1)); }
  }, { passive: true });
}

// Bosh sahifani chizadigan YAGONA joy. Ilgari `innerHTML = renderHome()`
// to'rt joyda takrorlanardi va bannerni ulash uchun to'rttasini ham eslab
// qolish kerak bo'lardi — `authUser()` naqshi aynan shunday ikki marta
// takrorlangan. Beshinchi chaqiruv qo'shilsa u ham avtomatik qamraladi.
function paintHome(animateChip = false) {
  const w = document.getElementById('screen-wrap');
  if (!w) return;
  w.innerHTML = renderHome();
  focusCatChip(animateChip);
  mountAdBanner();
}

// ============ EKRAN: BOSH SAHIFA ============
function renderHome() {
  const T = STR[S.lang];
  // ⚠️ BOSH SAHIFA VA KATALOG BIRLASHTIRILDI (2026-08-07, founder qarori).
  // Ilgari ikkita alohida ekran bor edi va ular deyarli bir xil ishni
  // qilardi: bosh sahifa 4 ta mahsulot, katalog esa hammasini. Ajratma
  // foydalanuvchiga hech narsa bermasdi, lekin pastki paneldan bitta joy
  // yeb turardi — o'sha joy endi AI bo'limiga berildi.
  const byCat = S.cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.catKey === S.cat);
  const prods = byCat.filter(inPriceRange).map(vm);
  const priceOn = S.priceMin !== null || S.priceMax !== null;
  // Filtr yoki kategoriya tanlanmagan bo'lsa — "Tavsiya etiladi" bloki.
  // Tanlangan bo'lsa u YASHIRILADI: foydalanuvchi aniq narsa qidirayotganda
  // tavsiya faqat natijani pastga surib qo'yardi.
  const sof = S.cat === 'all' && !priceOn;
  const picked = FEATURED_IDS.map(byId).filter(Boolean);
  const filler = PRODUCTS.filter(p => !picked.includes(p));
  const featured = picked.concat(filler).slice(0, 4).map(vm);

  return `
  <div style="padding:10px 16px 28px;display:flex;flex-direction:column;gap:14px">
    <div>
      <div style="font-family:var(--font-display);font-size:19px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em;line-height:1.15">Salom, ${esc(S.tgUser?.first_name || 'Maryam')} 🌷</div>
      <div style="font-size:12.5px;color:var(--text-muted);margin-top:1px">${T.greetSub}</div>
    </div>

    <div style="display:flex;align-items:center;gap:9px;margin-top:2px">
      <button data-action="tab" data-arg="search" style="flex:1;min-width:0;display:flex;align-items:center;gap:10px;height:48px;padding:0 16px;border:1px solid rgba(255,255,255,.7);border-radius:var(--radius-md);background:rgba(255,255,255,.55);backdrop-filter:blur(20px) saturate(170%);-webkit-backdrop-filter:blur(20px) saturate(170%);box-shadow:0 8px 22px -10px rgba(81,1,0,.22),0 1px 2px rgba(23,26,48,.06),inset 0 1px 0 rgba(255,255,255,.9);cursor:pointer;color:var(--text-subtle);font-size:14.5px;font-family:var(--font-sans)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${T.searchPh}</span>
      </button>
      <!-- ⚠️ 2-EDIT (2026-08-07): bu tugma ilgari KATALOG ekraniga o'tkazardi,
           ya'ni "filtr" belgisi ostida aslida navigatsiya turardi. Endi u
           narx filtrini SHU YERNING O'ZIDA ochadi. Yoqilgan filtr tugmaning
           rangidan ko'rinadi — aks holda foydalanuvchi filtr ishlayotganini
           unutib, "mahsulotlar yo'qolibdi" deb o'ylardi. -->
      <button data-action="openPriceSheet" aria-label="${T.filter}" style="flex:none;width:48px;height:48px;border-radius:var(--radius-md);background:${priceOn ? 'var(--pom-100)' : 'linear-gradient(150deg,var(--pom-700),var(--pom-800))'};border:1px solid ${priceOn ? 'rgba(122,20,13,.35)' : 'rgba(255,229,210,.25)'};box-shadow:0 6px 16px -6px rgba(81,1,0,.6),inset 0 1px 0 rgba(255,229,210,.22);display:flex;align-items:center;justify-content:center;color:${priceOn ? 'var(--pom-700)' : '#ffe5d2'};position:relative">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
        ${priceOn ? '<span style="position:absolute;top:9px;right:9px;width:7px;height:7px;border-radius:50%;background:var(--pom-700)"></span>' : ''}
      </button>
    </div>

    ${priceOn ? `<div style="display:flex;align-items:center;gap:8px;align-self:flex-start;max-width:100%;height:34px;padding:0 6px 0 13px;border-radius:999px;background:var(--pom-100);border:1px solid rgba(122,20,13,.25)">
      <span style="font-size:12.5px;font-weight:600;color:var(--pom-700);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${priceFilterLabel()}</span>
      <button data-action="clearPriceFilter" aria-label="${T.priceRemove}" style="flex:none;width:24px;height:24px;border-radius:50%;border:none;background:rgba(122,20,13,.12);color:var(--pom-700);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
      </button>
    </div>` : ''}

    ${adBannerHtml()}

    <!-- Kategoriya chiplari — "ostki chiziq" (2026-08-14, founder tanlovi).
         Uslub styles.css dagi .cat-chip/.cat-line da. Chiziq ::after emas,
         alohida span: global button::after tap-maydon qoidasi ::after ni
         band qilgan. Tanlovdan keyin focusCatChip() qatorni markazlaydi. -->
    <div class="cat-chips">
      ${CATS.map(c => `<button class="cat-chip${c.key === S.cat ? ' on' : ''}" data-action="selectCat" data-arg="${c.key}">${c.label[S.lang]}<span class="cat-line"></span></button>`).join('')}
    </div>

    ${sof ? `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:2px">
      <span style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text-strong)">${T.featured}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      ${featured.map(p => homeCard(p)).join('')}
    </div>
    <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text-strong);margin-top:6px">${T.allFabrics}</div>` : ''}

    ${prods.length === 0
      ? `<div style="text-align:center;padding:40px;color:var(--text-muted)">${priceOn ? T.noProductsPrice : T.noProducts}
          ${priceOn ? `<div><button data-action="clearPriceFilter" style="margin-top:14px;cursor:pointer;height:40px;padding:0 18px;border-radius:var(--radius-md);border:1px solid var(--pom-700);background:none;color:var(--pom-700);font-family:var(--font-sans);font-size:13.5px;font-weight:600">${T.priceClear}</button></div>` : ''}
         </div>`
      : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${prods.map(p => productCard(p)).join('')}</div>`}
  </div>`;
}

// ============ EKRAN: SAQLANGAN MATOLAR (2026-08-13) ============
// ♡ bosilardi, toast chiqardi — va tamom: yoqtirilgan mato QAYERGA
// tushgani ilovaning hech bir joyida ko'rinmasdi (founder shikoyati).
// Ya'ni tugma ishlagandek tuyulib, natijasi yo'q edi.
//
// ⚠️ Ro'yxat `S.liked` dan chizilmaydi, PRODUCTS dan filtrlanadi va sabab
// bor: `S.liked` da bazadan o'chgan e'lonning id'si qolib ketishi mumkin
// (`ik-9001` bilan aynan shu bo'lgan — 696-qatordagi izoh). O'sha id
// bo'yicha chizilsa ekranda bo'sh kartochka turardi.
function renderSaved() {
  const T = STR[S.lang];
  const list = PRODUCTS.filter(p => S.liked[p.id]).map(vm);

  if (!list.length) {
    return `
    <div style="padding:64px 28px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px">
      <span style="width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--pom-100);color:var(--pom-700);margin-bottom:4px">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 20.8s-6.9-4.3-9-8a5.2 5.2 0 0 1-.5-3.7A4.8 4.8 0 0 1 6.3 5.5c1.9 0 3.4 1 4.3 2.3.4.6 1 .6 1.4 0 .9-1.3 2.4-2.3 4.3-2.3a4.8 4.8 0 0 1 3.8 3.6 5.2 5.2 0 0 1-.5 3.7c-2.1 3.7-9 8-9 8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </span>
      <div style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--text-strong)">${T.savedEmpty}</div>
      <div style="font-size:13px;color:var(--text-muted);line-height:1.45">${T.savedEmptySub}</div>
      <button data-action="tab" data-arg="home" style="margin-top:14px;height:42px;padding:0 20px;border-radius:var(--radius-md);border:none;background:linear-gradient(150deg,var(--pom-600),var(--pom-800));color:#fff;font-family:var(--font-sans);font-size:14px;font-weight:600;cursor:pointer">${T.savedGo}</button>
    </div>`;
  }

  return `
  <div style="padding:14px 16px 28px;display:flex;flex-direction:column;gap:14px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${list.map(p => productCard(p)).join('')}</div>
  </div>`;
}

// ============ NARX ORALIG'I FILTRI ============
// Chegara `null` bo'lsa o'sha tomon cheklanmaydi (BTS/zaxira'dagi `null = cheksiz`
// naqshi bilan bir xil). Narxi yo'q mahsulot filtr yoqilganda yashiriladi —
// "narxi noma'lum" ni "arzon" deb ko'rsatish xaridorni chalg'itadi.
function inPriceRange(p) {
  if (S.priceMin === null && S.priceMax === null) return true;
  const v = Number(p.price);
  if (!Number.isFinite(v)) return false;
  if (S.priceMin !== null && v < S.priceMin) return false;
  if (S.priceMax !== null && v > S.priceMax) return false;
  return true;
}

// Narx uchun raqam formati — ilovadagi money() bilan bir xil (bo'sh joy bilan),
// lekin "so'm" qo'shimchasisiz. num() bu yerda yaramaydi: u vergul qo'yadi va
// u miqdor (dona) uchun ishlatiladi
function priceNum(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

// Yoqilgan filtrni to'liq yozuv bilan ko'rsatish: "850 000 – 890 000 so'm"
function priceFilterLabel() {
  const T = STR[S.lang], lo = S.priceMin, hi = S.priceMax;
  if (lo !== null && hi !== null) return `${priceNum(lo)} – ${priceNum(hi)} ${T.somU}`;
  if (lo !== null) return `${priceNum(lo)} ${T.somU} ${T.priceFrom}`;
  return `${priceNum(hi)} ${T.somU} ${T.priceTo}`;
}

// Faqat raqam qoldiradi (foydalanuvchi "700 000" yoki "700000" yozishi mumkin);
// bo'sh bo'lsa null = chegara yo'q
function parsePrice(v) {
  const digits = String(v).replace(/\D/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

function openPriceSheet() {
  S.priceDraftMin = S.priceMin === null ? '' : String(S.priceMin);
  S.priceDraftMax = S.priceMax === null ? '' : String(S.priceMax);
  S.priceErr = '';
  S.priceSheet = true;
  paintSheet();
}
function closePriceSheet() {
  S.priceSheet = false;
  paintSheet();
}
/* `data-input` uchun o'ramlar. Delegatsiya `fn(qiymat, arg)` tartibida
   chaqiradi (qiymat asosiy), bu funksiya esa `(which, v)` kutadi — shuning
   uchun tartibni shu yerda almashtiramiz. Asl imzo tegilmadi. */
function priceDraftInput(v, which) { onPriceDraft(which, v); }

/* Checkout izohi ilgari atributda TO'G'RIDAN-TO'G'RI o'zlashtirish edi
   (`S.comment` ga `this.value`). Delegatsiya esa funksiya chaqiradi, shuning
   uchun unga nom berildi. */
function setComment(v) { S.comment = v; }

function onPriceDraft(which, v) {
  if (which === 'min') S.priceDraftMin = v; else S.priceDraftMax = v;
  // Xato yozuvi yo'qoladi, lekin sheet QAYTA CHIZILMAYDI — paintSheet() bu yerda
  // chaqirilsa input DOM'dan yo'qolib fokus uchadi va klaviatura yopiladi
  if (S.priceErr) {
    S.priceErr = '';
    const el = document.getElementById('price-err');
    if (el) el.textContent = '';
  }
}
function applyPriceFilter() {
  const lo = parsePrice(S.priceDraftMin);
  const hi = parsePrice(S.priceDraftMax);
  if (lo !== null && hi !== null && lo > hi) {
    S.priceErr = STR[S.lang].priceBad;
    paintSheet();
    return;
  }
  S.priceMin = lo;
  S.priceMax = hi;
  S.priceSheet = false;
  paintSheet();
  paintHome();
}
function clearPriceFilter() {
  S.priceMin = null;
  S.priceMax = null;
  S.priceDraftMin = '';
  S.priceDraftMax = '';
  S.priceErr = '';
  S.priceSheet = false;
  paintSheet();
  paintHome();
}

// ============ EKRAN: AI BO'LIMI (2026-08-07) ============
// Bosh va katalog birlashgach pastki panelda bo'shagan joy shu bo'limga
// berildi. Hozircha ichida bitta narsa bor — allaqachon chizilgan rasmlar
// galereyasi. Keyingi AI funksiyalari shu yerga qo'shiladi.
//
// ⚠️ BU YERDA HECH NARSA GENERATSIYA QILINMAYDI: bo'lim ochilishi bilan
// rasm chizilsa, har kirgan odam pul sarflardi. Generatsiya faqat mato
// sahifasidagi tugmadan boshlanadi.
//
// Bo'sh holatda O'YLAB TOPILGAN namuna rasm ko'rsatilmaydi (CLAUDE.md) —
// nima qilish kerakligi aytiladi, xolos.
function renderAi() {
  const T = STR[S.lang];

  const sarlavha = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
      <div>
        <div style="font-family:var(--font-display);font-size:19px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em">✦ ${T.aiHubT}</div>
        <div style="font-size:12.5px;color:var(--text-muted);margin-top:2px;line-height:1.4">${T.aiHubSub}</div>
      </div>
      ${creditRozetka()}
    </div>`;

  // ---- Sehrgar: mato tanlangan bo'lsa mahsulot sahifasidagi AYNI blok ----
  // ⚠️ Blok NUSXALANMAYDI — `aiImageSection` o'sha-o'sha funksiya. Ikkinchi
  // nusxa yozilsa savol/holat mantiqi ikki joyda yashardi va biri
  // ikkinchisidan orqada qolardi (db/014 darsining UI dagi ko'rinishi).
  if (S.aiWizard) {
    const p = vm(byId(S.aiWizard));
    return `
    <div style="padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px">
      ${sarlavha}
      <button class="ai-ghost" data-action="aiWizardExit" style="align-self:flex-start">← ${T.aiOtherFabric}</button>
      ${p ? `<div style="display:flex;align-items:center;gap:10px">
        <span style="flex:none;width:44px;height:44px;border-radius:12px;${p.bgStyle}"></span>
        <span style="font-size:14px;font-weight:600;color:var(--text-strong)">${p.name}</span>
      </div>` : ''}
      ${aiImageSection(S.aiWizard)}
    </div>`;
  }

  // ---- Mato tanlash ----
  if (S.aiPickOpen) {
    return `
    <div style="padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px">
      ${sarlavha}
      <button class="ai-ghost" data-action="aiWizardExit" style="align-self:flex-start">← ${T.aiOtherFabric}</button>
      <div style="font-size:13px;font-weight:700;color:var(--text-strong)">${T.aiPickFabric}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${PRODUCTS.map(vm).filter(Boolean).map((p) => `
          <button class="ai-hub-card" data-action="aiWizardPick" data-arg="${esc(p.id)}">
            <span style="display:block;width:100%;aspect-ratio:1;border-radius:12px;${p.bgStyle}"></span>
            <span>${p.name}</span>
          </button>`).join('')}
      </div>
    </div>`;
  }

  // ---- Ro'yxat: lenta yoki mening rasmlarim ----
  const mine = S.aiTab === 'mine';
  const list = mine ? S.aiMine : S.aiGallery;
  const bosh = `
    <div style="text-align:center;padding:44px 24px;display:flex;flex-direction:column;align-items:center;gap:9px">
      <span style="width:66px;height:66px;border-radius:20px;background:linear-gradient(150deg,var(--pom-600),var(--pom-800));color:var(--pom-100);display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 12px 28px -10px rgba(81,1,0,.5)">✦</span>
      <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text-strong);margin-top:5px">${mine ? T.aiMineEmpty : T.aiHubEmpty}</div>
      <div style="font-size:13px;color:var(--text-muted);line-height:1.5;max-width:260px">${T.aiHubEmptySub}</div>
    </div>`;

  const tab = (k, matn) => `
    <button class="ai-chip${S.aiTab === k ? ' on' : ''}" data-action="aiTab" data-arg="${k}">${esc(matn)}</button>`;

  return `
  <div style="padding:14px 16px 28px;display:flex;flex-direction:column;gap:12px">
    ${sarlavha}
    ${S.aiImageEnabled ? `<button class="ai-cta" data-action="aiPickOpen">${T.aiNewBtn}</button>` : ''}
    <div class="ai-chips">${tab('feed', T.aiTabFeed)}${tab('mine', T.aiTabMine)}</div>
    ${!Array.isArray(list) || !list.length ? bosh : `
      <div style="font-size:11.5px;color:var(--text-muted)">${T.aiImgNote}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${list.map((it) => `
          <button class="ai-hub-card" data-action="openProduct" data-arg="${esc(it.productId)}">
            <img src="${esc(it.image)}" alt="" loading="lazy">
            <span>${esc(it.name && it.name[S.lang] ? it.name[S.lang] : (it.name && it.name.uz) || '')}</span>
          </button>`).join('')}
      </div>`}
  </div>`;
}

// Kredit rozetkasi (ekran tepasida). `null` bo'lsa UMUMAN chizilmaydi —
// bu Sprint 10 tavsiyasining asosiy bandi: foydalanuvchi chegarani u
// TUGAGANDA emas, PUL SARFLASHDAN OLDIN ko'rsin.
function creditRozetka() {
  const T = STR[S.lang];
  const c = S.aiCredits;
  if (!c) return '';
  const matn = c.unlimited ? `∞ ${T.aiUnlimited}` : `${c.balance} ✦`;
  const past = !c.unlimited && c.balance < c.cost;
  return `<span style="flex:none;padding:6px 11px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;
    background:${past ? 'rgba(160,30,20,.12)' : 'var(--glass-fill-strong)'};
    color:${past ? 'var(--pom-600)' : 'var(--text-strong)'};border:1px solid var(--border-hair)">${esc(past ? T.aiCreditNone : matn)}</span>`;
}

// Galereyani yuklaydi. Xato bo'lsa JIM o'tadi va bo'sh holat ko'rsatiladi —
// "yuklab bo'lmadi" bilan "hali rasm yo'q" o'rtasidagi farq foydalanuvchi
// uchun bir xil: ikkalasida ham qiladigan ishi bitta.
async function loadAiGallery() {
  try {
    const r = await fetch('/api/ai/gallery');
    const j = await r.json();
    S.aiGallery = j && j.ok && j.data && Array.isArray(j.data.items) ? j.data.items : [];
  } catch (e) {
    S.aiGallery = [];
  }
  if (S.screen === 'ai') render();
}

// ============ MAHSULOT MEDIASI — GALEREYA (1-slayd rasm, 2-slayd video) ============
// Founder qarori (2026-08-13): "bitta mahsulot ichida 1 rasm, ikkinchi video".
//
// ⚠️ Video BO'LMASA hech narsa o'zgarmaydi — o'ram avvalgidek `bgStyle` bilan
// chiziladi va bu funksiya bo'sh satr qaytaradi. Bitta slayd uchun skroll va
// nuqta shovqindan boshqa narsa emas, ustiga mavjud ekranga regressiya
// kiritish xavfi bekorga olinardi.
//
// ⚠️ NATIVE `controls` ISHLATILMAYDI. Pastdagi kartochka hero ustiga 22px
// chiqib turadi (`margin-top:-22px`), ya'ni brauzerning boshqaruv paneli
// aynan o'sha yerda YARIM YOPIQ qolardi — foydalanuvchi tugmani ko'radi-yu
// bosa olmaydi. O'rniga markazda bitta katta tugma: bosilsa o'ynaydi,
// yana bosilsa to'xtaydi. ≤30 s lik mahsulot klipida qidiruv chizig'i
// kerak emas.
//
// ⚠️ RASM SLAYDI IKKALA HOLATDA HAM SHU YERDA chiziladi — video bo'lsa ham,
// bo'lmasa ham (2026-08-13). Ilgari videosiz mahsulotda rasm hero divining
// `style` iga qo'yilardi, ya'ni rasm ikki xil joyda tug'ilardi. "Bosilsa
// kattalashsin" qo'shilganda bu darrov tuzoqqa aylanardi: amalni ikki joyga
// yozish kerak bo'lardi va bittasi ertami-kech esdan chiqardi.
function detailMedia(p, T) {
  // Naqsh (CSS gradient) bilan chizilgan mahsulotda kattalashtiradigan
  // SURAT yo'q — u yerda amal umuman qo'yilmaydi, aks holda bosilganda
  // hech narsa qilmaydigan tugma bo'lardi.
  const zoom = p.img ? ` data-action="openPhoto" data-arg="${p.id}"` : '';
  const photo = `<div class="pd-slide"${zoom} style="${p.bgStyle}"></div>`;
  if (!p.video) return `<div class="pd-media">${photo}</div>`;

  const poster = p.videoPoster || '';
  return `
    <div class="pd-slides" id="pd-slides">
      ${photo}
      <div class="pd-slide pd-vidwrap">
        <video id="pd-vid" class="pd-vid" src="${p.video}"${poster ? ` poster="${poster}"` : ''}
               playsinline preload="none" aria-label="${T.mediaVideo}"></video>
        <button class="pd-play" id="pd-play" data-action="pdPlay" aria-label="${T.mediaVideo}">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6L19 12z"/></svg>
        </button>
      </div>
    </div>
    <div class="pd-dots" id="pd-dots">
      <button class="pd-dot is-on" data-action="pdSlide" data-arg="0" aria-label="${T.mediaPhoto}"></button>
      <button class="pd-dot" data-action="pdSlide" data-arg="1" aria-label="${T.mediaVideo}"></button>
    </div>`;
}

/* Nuqta bosilishi va surish holatini BITTA funksiya belgilaydi.

   ⚠️ Bu yerda `render()` CHAQIRILMAYDI — u butun ekranni qayta chizadi va
   video boshidan boshlanib, surish joyi ham nolga tushardi. Galereya
   holati DOM da yashaydi, `S` da emas: u ekran holatining bir qismi emas,
   ko'rish lahzasining o'zi. */
function pdSync(i) {
  const dots = document.querySelectorAll('#pd-dots .pd-dot');
  dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
  const v = document.getElementById('pd-vid');
  // Video slayddan chiqilsa TO'XTAYDI: aks holda ko'rinmaydigan video
  // ovoz chiqarib o'ynayverardi.
  if (v && i !== 1 && !v.paused) { v.pause(); pdPlayIcon(); }
}

function pdSlide(i) {
  const sl = document.getElementById('pd-slides');
  if (!sl) return;
  // ⚠️ `behavior: 'smooth'` ISHLATILMAYDI — 2026-08-13 da o'lchandi: silliq
  // surish bajarilmaydigan muhitda so'rov jimgina yutiladi va nuqta BUTUNLAY
  // o'lik tugmaga aylanadi. Barmoq bilan surishning silliqligi tizimdan
  // keladi va bunga bog'liq emas.
  sl.scrollLeft = sl.clientWidth * i;
  // Holat hodisani KUTMAYDI — `scroll` otilmasa ham javob darrov ko'rinsin.
  pdSync(i);
}

function pdPlayIcon() {
  const b = document.getElementById('pd-play');
  const v = document.getElementById('pd-vid');
  if (b && v) b.style.display = v.paused ? 'flex' : 'none';
}

function pdPlay() {
  const v = document.getElementById('pd-vid');
  if (!v) return;
  if (v.paused) { v.play().catch(() => {}); } else { v.pause(); }
  pdPlayIcon();
}

// Galereya HTML bilan birga "jonlanmaydi" — surish hodisasi tugun DOM'ga
// tushgandan keyin ulanadi (har qayta chizishda tugun YANGI bo'ladi).
function mountDetailMedia() {
  const sl = document.getElementById('pd-slides');
  if (!sl) return;
  sl.addEventListener('scroll', () => {
    pdSync(Math.round(sl.scrollLeft / Math.max(1, sl.clientWidth)));
  }, { passive: true });
  const v = document.getElementById('pd-vid');
  if (v) {
    // Video o'zi tugasa yoki to'xtasa tugma qaytib chiqsin.
    v.addEventListener('pause', pdPlayIcon);
    v.addEventListener('play', pdPlayIcon);
    v.addEventListener('ended', pdPlayIcon);
  }
}

/* ═══ TO'LIQ EKRAN KO'RISH (2026-08-13, founder tanlovi) ═══

   Sabab UI'da emas, MAHSULOTDA: B2B xaridor mato zichligini va naqsh
   aniqligini KO'RISHI kerak — 469px lik kadrda ip ko'rinmaydi. Shuning
   uchun rasm bosilsa butun ekranga ochiladi va kattalashtirsa bo'ladi.

   ⚠️ Brauzerning O'Z pinch-zoomiga tayanib bo'lmaydi: `html` da
   `touch-action: manipulation` va `overflow: hidden` turibdi (Mini App
   ekrani sahifa emas, ilova), ya'ni sahifa masshtabi umuman ishlamaydi.
   Shu sabab masshtab shu yerda O'LCHANADI va `transform` bilan qo'llanadi.

   Holat `S` da EMAS, modul o'zgaruvchisida: u ekran holatining bir qismi
   emas (orqaga qaytish tarixiga tushmaydi, saqlanmaydi) — ko'rish
   lahzasining o'zi, xuddi galereya surilishi kabi. */
let _pv = { s: 1, x: 0, y: 0 };

function openPhoto(id) {
  const p = vm(byId(id));
  // Naqsh bilan chizilgan mahsulotda kattalashtiradigan surat YO'Q —
  // bunday mahsulotda `detailMedia` amalni umuman qo'ymaydi, bu ikkinchi
  // qatlam (ID boshqa joydan kelib qolsa).
  if (!p || !p.img) return;
  _pv = { s: 1, x: 0, y: 0 };
  S.photoView = p.img;
  paintSheet();
}

function closePhoto() {
  S.photoView = null;
  paintSheet();
}

function renderPhotoView() {
  const T = STR[S.lang];
  // `esc()` — qiymat oddiy atribut ichiga tushadi (`src="..."`), ya'ni bu
  // aynan `esc()` ishlaydigan holat. `cssUrl()` bu yerda KERAK EMAS: CSS
  // `url()` boshlanmaydi.
  return `
  <div class="pv" id="pv">
    <img class="pv-img" id="pv-img" src="${esc(S.photoView)}" alt="">
    <button class="pv-x" data-action="closePhoto" aria-label="${T.pvClose}">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
    </button>
    <div class="pv-hint" id="pv-hint"><span>${T.pvHint}</span></div>
  </div>`;
}

function mountPhotoView() {
  const box = document.getElementById('pv');
  const img = document.getElementById('pv-img');
  if (!box || !img) return;

  const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  function clamp() {
    _pv.s = Math.min(4, Math.max(1, _pv.s));
    if (_pv.s <= 1.01) { _pv.s = 1; _pv.x = 0; _pv.y = 0; return; }
    // Kattalashtirilgan rasm chetidan tashqariga sudralib ketmasin —
    // aks holda ekranda qora bo'shliq qolib, rasm yo'qolgandek tuyulardi.
    const maxX = Math.max(0, (img.offsetWidth  * _pv.s - box.clientWidth)  / 2);
    const maxY = Math.max(0, (img.offsetHeight * _pv.s - box.clientHeight) / 2);
    _pv.x = Math.min(maxX, Math.max(-maxX, _pv.x));
    _pv.y = Math.min(maxY, Math.max(-maxY, _pv.y));
  }

  function apply() {
    img.style.transform = `translate3d(${_pv.x}px,${_pv.y}px,0) scale(${_pv.s})`;
    const hint = document.getElementById('pv-hint');
    if (hint) hint.classList.toggle('is-off', _pv.s > 1.02);
  }

  // Qayta chizilganda (masalan serverdan ma'lumot kelib `render()` ishlasa)
  // masshtab tugun bilan birga nolga tushmasin — holat moduldan tiklanadi.
  clamp(); apply();

  let start = null, moved = false, lastTap = 0;

  box.addEventListener('touchstart', (e) => {
    moved = false;
    if (e.touches.length === 2) {
      start = { d: dist(e.touches), s: _pv.s, x: _pv.x, y: _pv.y };
    } else if (e.touches.length === 1) {
      start = { d: 0, px: e.touches[0].clientX, py: e.touches[0].clientY, x: _pv.x, y: _pv.y };
    }
  }, { passive: true });

  box.addEventListener('touchmove', (e) => {
    if (!start) return;
    if (e.touches.length === 2 && start.d) {
      _pv.s = start.s * (dist(e.touches) / start.d);
      moved = true;
    } else if (e.touches.length === 1 && _pv.s > 1) {
      const dx = e.touches[0].clientX - start.px;
      const dy = e.touches[0].clientY - start.py;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;
      _pv.x = start.x + dx;
      _pv.y = start.y + dy;
    } else {
      return;
    }
    clamp(); apply();
    e.preventDefault();
  }, { passive: false });

  box.addEventListener('touchend', (e) => {
    if (e.touches.length) return;           // hali barmoq bor — gest tugamagan
    clamp(); apply();
    // Sintetik `click` ni to'xtatamiz: aks holda u pastdagi kechikkan
    // yopishdan OLDIN otilib, ikki marta bosish umuman ishlamay qolardi.
    e.preventDefault();
    const wasMoved = moved;
    start = null;
    if (wasMoved) return;

    const now = Date.now();
    if (now - lastTap < 300) {              // ikki marta bosildi — kattalashtirish
      lastTap = 0;
      _pv.s = _pv.s > 1 ? 1 : 2.5;
      _pv.x = 0; _pv.y = 0;
      clamp(); apply();
      return;
    }
    lastTap = now;
    // Bir marta bosish: kattalashtirilgan bo'lsa qaytaradi, aks holda yopadi.
    // Kechikish — ikki marta bosishga fursat berish uchun.
    setTimeout(() => {
      if (lastTap !== now) return;          // ikkinchi bosish bo'ldi
      if (_pv.s > 1) { _pv.s = 1; _pv.x = 0; _pv.y = 0; apply(); }
      else closePhoto();
    }, 300);
  }, { passive: false });

  // Sichqoncha (brauzer, Telegram tashqarisida sinov) — bosilsa yopiladi.
  box.addEventListener('click', () => {
    if (_pv.s > 1) { _pv.s = 1; _pv.x = 0; _pv.y = 0; apply(); return; }
    closePhoto();
  });
}

/* Mahsulot ekranida header rasm USTIDA suzadi: tepada turganda shaffof
   (rasm ekran chetigacha borsin), rasmdan pastga tushilganda shishaga va
   nomga qaytadi.

   ⚠️ Hodisa `#screen-wrap` ga BIR MARTA ulanadi (`_hdrBound`) — u tugun
   qayta chizilmaydi, ya'ni har `render()` da ulansa listenerlar to'planib
   ketardi va skroll qimmatlashardi. */
let _hdrBound = false;

function syncDetailHeader() {
  const hdr  = document.getElementById('app-header');
  const wrap = document.getElementById('screen-wrap');
  if (!hdr || !wrap) return;
  const hero = S.screen === 'detail' ? document.getElementById('pd-hero') : null;
  if (!hero) { hdr.classList.remove('hdr-clear'); return; }
  // Chegara: rasm pastki qirrasi header ostiga kirgan payt.
  hdr.classList.toggle('hdr-clear', wrap.scrollTop < hero.offsetHeight - 76);
}

function bindDetailHeader() {
  if (_hdrBound) return;
  const wrap = document.getElementById('screen-wrap');
  if (!wrap) return;
  wrap.addEventListener('scroll', syncDetailHeader, { passive: true });
  _hdrBound = true;
}

// ============ EKRAN: DETAIL ============
function renderDetail() {
  const T = STR[S.lang];
  const p = vm(byId(S.selectedId));
  if (!p) return '';
  // Nom RASM USTIDA turadi (founder tanlovi 2026-08-13), shuning uchun
  // kartochka to'g'ridan-to'g'ri NARXdan boshlanadi. Ilgari nom bitta
  // ekranda ikki marta yozilgan edi — header'da ham, kartochkada ham.
  const rating = p.rating == null ? '' : `
    <span style="display:inline-flex;align-items:center;gap:3px">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="#EFA91F"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>
      <span style="font-family:var(--font-mono)">${p.rating}</span>
      <span style="font-weight:500;opacity:.8">· ${p.reviews} ${T.reviews}</span>
    </span>`;

  return `
  <div style="display:flex;flex-direction:column">
    <div class="pd-hero" id="pd-hero">
      ${detailMedia(p, T)}
      <div class="pd-scrim-t"></div>
      <div class="pd-scrim-b"></div>
      <div class="pd-cap">
        ${p.badgeShow ? `<span class="pd-cap-badge" style="background:${p.badgeBg};color:${p.badgeFg}">${p.badge}</span>` : ''}
        <h1 class="pd-cap-title">${p.name}</h1>
        <span class="pd-cap-sub">${p.city}${rating ? ' ·' : ''} ${rating}</span>
      </div>
    </div>

    <div class="pd-card">
      <div>
        <div style="display:flex;align-items:baseline;gap:4px">
          <span style="font-family:var(--font-mono);font-size:30px;font-weight:600;color:var(--text-strong);letter-spacing:-.02em">${money(p.price)}</span>
          <span style="font-size:15px;color:var(--text-muted)">/${uShort(p.unit)}</span>
          <span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--text-body)"><span style="width:7px;height:7px;border-radius:50%;background:${p.stockCol}"></span>${p.stockTxt}</span>
        </div>
      </div>

      <div class="pd-panel" style="display:flex;align-items:center;gap:12px;padding:13px 14px">
        <span style="flex:none;width:42px;height:42px;border-radius:12px;background:linear-gradient(150deg,var(--pom-700),var(--pom-800));color:#ffe9db;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:16px">${p.supplier[0]}</span>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px;font-size:14px;font-weight:700;color:var(--text-strong)">
            <span style="flex:1;min-width:0">${p.supplier}</span>
            ${p.verified ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="var(--pom-700)" style="flex:none"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.3l.9-2.9L3 10.5l2.6-1.5 1-2.8 3 .2z"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
          </div>
          <div style="font-size:12px;color:var(--text-muted)">${p.city} · ${T.verified}</div>
        </div>
        <button style="display:flex;align-items:center;gap:6px;height:34px;padding:0 13px;border-radius:var(--radius-sm);border:1px solid var(--glass-border);background:var(--glass-fill-strong);font-size:12.5px;font-weight:600;color:var(--text-strong);cursor:pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>${T.message}
        </button>
      </div>

      <div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pom-700);margin-bottom:10px">${T.specs}</div>
        <div style="border:1px solid var(--border-hair);border-radius:var(--radius-md);overflow:hidden">
          ${[[T.width, p.width],[T.weight, p.weight],[T.comp, p.comp],[T.leadTime, p.leadLabel],[T.minOrder, p.moqLabel]].map(([k,v],i) => `
          <div style="display:flex;justify-content:space-between;padding:11px 14px;background:${i%2===0?'#fff':'#F8F5F3'};${i>0?'border-top:1px solid var(--border-hair)':''}" >
            <span style="font-size:13px;color:var(--text-muted)">${k}</span>
            <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text-strong);text-align:right">${v}</span>
          </div>`).join('')}
        </div>
      </div>

      <div class="pd-panel" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px">
        <span style="font-size:14px;font-weight:700;color:var(--text-strong)">${T.qty}</span>
        <div style="display:flex;align-items:center;gap:14px">
          <button data-action="decQty" style="width:36px;height:36px;border-radius:50%;border:1px solid var(--glass-border);background:var(--glass-fill-strong);display:flex;align-items:center;justify-content:center;color:var(--text-strong);box-shadow:var(--glass-highlight);cursor:pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
          </button>
          <span id="detail-qty" style="font-family:var(--font-mono);font-size:16px;font-weight:600;color:var(--text-strong);min-width:80px;text-align:center">${num(S.qty)} ${uShort(byId(S.selectedId).unit)}</span>
          <button data-action="incQty" style="width:36px;height:36px;border-radius:50%;border:1px solid transparent;background:linear-gradient(150deg,var(--pom-600),var(--pom-800));display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:var(--shadow-sm);cursor:pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>

      ${aiImageSection(p.id)}

      ${reviewsSection(p.id)}

    </div>
  </div>`;
}

// ============ SHARHLAR (mahsulot sahifasidagi bo'lim) ============
function starsRow(n, size = 13) {
  return `<span style="letter-spacing:1px;font-size:${size}px;color:#EFA91F;line-height:1">${'★'.repeat(n)}<span style="color:var(--ink-200)">${'☆'.repeat(5 - n)}</span></span>`;
}

// ============ AI KIYIM RASMI (2026-08-07) ============
// Joyi: tarkib/xususiyatlar ostida, sharhlardan tepada — xaridor mato
// tavsifini o'qib bo'lgan payt aynan "bundan nima tikilardi?" savoli
// tug'iladigan payt.
//
// ⚠️ MATN G'OYALARI SHU YERDA TURARDI va 2026-08-07 da OLIB TASHLANDI
// (founder: "matn ai umuman kerak emas, faqat rasm qolsin"). Undan ikkita
// qaror KO'CHIB QOLDI, chunki ikkalasi ham matnga emas, XARAJATGA tegishli:
//
// 1) AVTOMATIK YUKLASH YO'Q. Sahifa ochilishi bilan rasm chizilsa, katalogni
//    kezib yurgan foydalanuvchi kunlik limitini o'zi bilmagan holda yeb
//    qo'yardi — har ochilgan yangi mato bitta birlik, ustiga rasm ~$0.04.
//    Kirish nuqtasi — TUGMA. Keshdagi natija baribir darrov chiqadi.
// 2) Yorliq MAJBURIY: mato haqiqiy bo'lsa ham rasmda MAVJUD BO'LMAGAN buyum
//    ko'rinadi (sprint-10.md, rasm bo'limi).
function aiImageSection(productId) {
  const T = STR[S.lang];
  // Sozlama yaroqsiz bo'lsa server `aiImageEnabled:false` qaytaradi va bo'lim
  // UMUMAN chizilmaydi — bosilgach xato beradigan tugma sozlama buzilganini
  // yashirardi.
  // Savol kalitlari serverdan kelmagan bo'lsa bo'lim UMUMAN chizilmaydi:
  // savolsiz so'rov yuborib bo'lmaydi (server 400 qaytaradi), ya'ni tugma
  // faqat bosilib xato beradigan tugma bo'lardi.
  if (!S.aiImageEnabled || !S.aiChoiceKeys) return '';

  const st = S.aiImages[productId];
  const head = `<div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pom-700);margin-bottom:10px">${T.aiImgT}</div>`;

  // Holat 1 — savollar. Founder qarori 2026-08-07: rasmdan OLDIN 2-3 savol.
  // ⚠️ Zaxira javob (`|| 'ayol'`) ATAYLAB YO'Q — hammasi tanlanmaguncha
  // tugma o'chiq turadi. Sabab pulda: oldindan to'ldirilgan javob bilan
  // xaridor o'zi tanlamagan narsani chizdirib yuborardi va bu ~$0.04.
  if (!st) {
    const tanlov = S.aiChoices[productId] || {};
    // Guruhlar SERVER bergan tartibda chiziladi va faqat server bergan
    // kalitlar ko'rsatiladi. Yorliq topilmasa kalitning O'ZI chiziladi —
    // jimgina yo'qolib qolgandan ko'ra ko'rinib turgani yaxshi.
    // ⚠️ Combo savollari SHARTLI: `dizayn = combo` tanlanmaguncha ular
    // umuman chizilmaydi va MAJBURIY ham emas. Doim chizilsa xaridor
    // o'ziga keraksiz ikki savolga javob berib o'tirardi.
    const combo = tanlov.dizayn === 'combo' && S.aiComboKeys;
    const guruhlar = Object.keys(S.aiChoiceKeys).concat(combo ? Object.keys(S.aiComboKeys) : []);
    const kalitlar = (g) => (S.aiChoiceKeys[g] || (S.aiComboKeys && S.aiComboKeys[g]) || []);

    const savollar = guruhlar.map((guruh, i) => `
      <div class="ai-q">
        <span class="ai-q-num">${i + 1}</span>
        <span class="ai-q-label">${esc((T.aiQ && T.aiQ[guruh]) || guruh)}</span>
      </div>
      <div class="ai-chips">
        ${kalitlar(guruh).map((k) => `
          <button class="ai-chip${tanlov[guruh] === k ? ' on' : ''}" data-action="pickAiChoice" data-arg="${esc(productId)}|${esc(guruh)}|${esc(k)}">${esc((T.aiO && T.aiO[k]) || k)}</button>`).join('')}
      </div>`).join('');

    // ---- Erkin matn (faqat combo) ----
    // ⚠️ Bu yerda belgilar RO'YXATI takrorlanMAYDI — tekshiruv faqat
    // serverda (`cleanComboText`). Ikkinchi ro'yxat ikkisi ajralib
    // ketadigan joy bo'lardi (db/014 darsi); `maxlength` ham serverdan
    // kelgan qiymatdan olinadi.
    const matnBlok = combo ? `
      <div class="ai-q" style="margin-top:12px">
        <span class="ai-q-num">✎</span>
        <span class="ai-q-label">${esc(T.aiTextQ)}</span>
      </div>
      <input type="text" data-input="setAiText" data-arg="${esc(productId)}"
             value="${esc(S.aiText[productId] || '')}"
             maxlength="${S.aiComboTextMax}" placeholder="${esc(T.aiTextPh)}"
             style="width:100%;padding:11px 13px;border:1px solid var(--border-hair);border-radius:var(--radius-sm);background:var(--glass-fill-strong);font-family:var(--font-sans);font-size:16px;color:var(--text-strong);outline:none">` : '';

    // Combo tanlansa qo'shimcha ikki savol ham MAJBURIY bo'ladi (erkin matn
    // esa ixtiyoriy — u yo'q bo'lsa ham rasm chiziladi).
    const nechta = guruhlar.filter((g) => tanlov[g]).length;
    const tayyor = nechta === guruhlar.length;

    return `<div id="ai-block">${head}
      <div class="ai-card">
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:13px">
          <span style="flex:none;width:30px;height:30px;border-radius:9px;background:linear-gradient(150deg,var(--pom-600),var(--pom-800));color:var(--pom-100);display:flex;align-items:center;justify-content:center;font-size:15px">🧵</span>
          <span style="font-size:12px;color:var(--text-muted);line-height:1.35">${T.aiImgSub}</span>
        </div>
        ${savollar}
        ${matnBlok}
        ${tayyor ? '' : `<div class="ai-count">${esc(T.aiPick.replace('{n}', nechta).replace('{m}', guruhlar.length))}</div>`}
        ${creditQator()}
        <button class="ai-cta" data-action="askAiImage" data-arg="${esc(productId)}"${tayyor ? '' : ' disabled'}>${tayyor ? '✦ ' : ''}${T.aiGo}</button>
      </div>
    </div>`;
  }

  // Holat 2 — yuklanmoqda: 3:4 skelet (rasm chiqadigan joyning o'zi) ichida
  // tikuv choki "tikilib boradi", pastda ~30 soniyaga mo'ljallangan sekin
  // to'ladigan chiziq (92% da to'xtaydi — javob kelganda blok almashadi).
  // Sayt bilan BIR XIL holat (`script.js` → `aiSection`).
  if (st.state === 'loading') {
    return `<div>${head}
      <div class="ai-wait">
        <div class="ai-skel" aria-hidden="true">
          <svg class="ai-stitch" viewBox="0 0 132 44" fill="none">
            <path class="ai-stitch-path" d="M6 30 C 30 10, 52 38, 78 20 S 114 26, 126 14" />
            <path class="ai-needle" d="M112 22 L127 13 L124 19 Z" />
          </svg>
        </div>
        <div class="ai-wait-msg">${T.aiImgLoading}</div>
        <div class="ai-bar30"><span></span></div>
      </div>
    </div>`;
  }

  // Holat 3 — surat yo'q. Bu XATO EMAS, shuning uchun qayta urinish tugmasi
  // ham YO'Q: qayta bosish natijani o'zgartirmasdi va kvota yeyilardi.
  if (st.state === 'nophoto') {
    return `<div>${head}
      <div class="ai-msg ai-msg-plain">${T.aiImgNoPhoto}</div>
    </div>`;
  }

  // Holat 4 — Lola credit tugadi.
  // ⚠️ "Ertaga yangilanadi" DEYILMAYDI (2026-08-07 da limit kreditga
  // almashdi): kredit qoldiq va u o'zi tiklanmaydi, ya'ni eski xabar
  // jimgina yolg'on bo'lardi.
  if (st.state === 'nocredit') {
    return `<div>${head}
      <div class="ai-msg ai-msg-warn">${esc(T.aiCreditNoneSub)}</div>
    </div>`;
  }

  // Holat 4b — matn rad etildi (server oq ro'yxati).
  if (st.state === 'badtext') {
    return `<div>${head}
      <div class="ai-msg ai-msg-warn">
        ${esc(T.aiTextBad)}
        <button class="ai-ghost" data-action="resetAiImage" data-arg="${esc(productId)}">${T.aiAgain}</button>
      </div>
    </div>`;
  }

  // Holat 4v — provayder band (2026-08-08). Alohida holat, chunki bu
  // NOSOZLIK EMAS: server allaqachon uch marta urinib ko'rgan va kredit
  // qaytarilgan. Xabar shuni aytadi — "xato" degan qizil blok bu yerda
  // yolg'on bo'lardi.
  if (st.state === 'busy') {
    return `<div>${head}
      <div class="ai-msg ai-msg-warn">
        ${T.aiBusy}
        <button class="ai-ghost" data-action="askAiImage" data-arg="${esc(productId)}">${T.aiRetry}</button>
      </div>
    </div>`;
  }

  // Holat 4g — model rad etdi. ⚠️ Tugma "qayta urinish" EMAS: ayni javoblar
  // ayni rad javobini beradi va takror bosish faqat kutish bo'lardi.
  // Yagona foydali harakat — javoblarni o'zgartirish.
  if (st.state === 'blocked') {
    return `<div>${head}
      <div class="ai-msg ai-msg-warn">
        ${T.aiBlocked}
        <button class="ai-ghost" data-action="resetAiImage" data-arg="${esc(productId)}">${T.aiAgain}</button>
      </div>
    </div>`;
  }

  // Holat 5 — texnik xato. Tugma QAYTA FAOLLASHADI.
  // ⚠️ Zaxira sifatida biror "namunaviy rasm" ATAYLAB ko'rsatilmaydi: u AI
  // ishlamayotganini yashirardi va bu loyihaning "jimgina yolg'on yo'qlikdan
  // yomonroq" darsining aynan takrori bo'lardi.
  if (st.state === 'error') {
    return `<div>${head}
      <div class="ai-msg ai-msg-err">
        ${T.aiErr}
        <button class="ai-ghost" data-action="askAiImage" data-arg="${esc(productId)}">${T.aiRetry}</button>
      </div>
    </div>`;
  }

  // Holat 6 — natija.
  // ⚠️ Yorliq rasm bilan BITTA blokda va uning ICHIDA turadi — pastda alohida
  // qatorda emas. Sabab: skrinshot olinganda yoki rasm uzun ekranda
  // aylantirilganda yorliq kadrdan chiqib ketmasin. U rasmning bir qismi.
  // URL server bergan `/api/product-photo?...` — `esc()` dan o'tadi, chunki
  // u `vm()` chegarasidan o'tmaydi (CLAUDE.md: `vm()` dan o'tmaydigan
  // narsalar chizish joyida o'raladi).
  // `fresh` bir MARTALIK: o'qilgach o'chiriladi — keyingi qayta chizishlar
  // (yorliq almashdi, ekran qaytdi) animatsiyani takrorlamaydi.
  const yangi = st.fresh; st.fresh = false;
  return `<div>${head}
    <figure class="ai-figure${yangi ? ' ai-reveal' : ''}">
      <img src="${esc(st.url)}" alt="${T.aiImgT}" loading="lazy">
      <figcaption class="ai-note"><span>⚠️</span><span>${T.aiImgNote}</span></figcaption>
    </figure>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${otherCutBtn(productId)}
      <button class="ai-ghost" data-action="resetAiImage" data-arg="${esc(productId)}">${T.aiAgain}</button>
      <button class="ai-ghost" data-action="shareAiImage" data-arg="${esc(st.url)}">${T.aiShare}</button>
      ${S.screen === 'ai' ? `<button class="ai-ghost" data-action="openProduct" data-arg="${esc(productId)}">${T.aiOrder}</button>` : ''}
    </div>
    ${creditQator()}
  </div>`;
}

// ============ "BOSHQA FASON" TUGMASI (2026-08-09) ============
// Founder bahosi: "ko'ylak fasonini zo'r qilmayapti har safar, bir xil
// defolt fason turibdi". Fason banki serverda buni MATOLAR ORASIDA hal
// qiladi, lekin BITTA mato uchun kesh qoidasi o'zgarmadi: ayni javoblar =
// ayni rasm, abadiy. Ya'ni fason yoqmasa xaridorning qo'lida hech narsa
// yo'q edi.
//
// ⚠️ Tugma YONIDAGI "Boshqacha chizish" dan farqi PULDA: bu yangi kesh
// kaliti, ya'ni yangi rasm va yangi kredit. Shuning uchun narx tugmaning
// O'ZIDA aytiladi — bosishdan OLDIN, keyin emas.
//
// ⚠️ Chegaraga yetganda tugma UMUMAN chizilmaydi (o'chirilgan holda
// qoldirilmaydi): bosilmaydigan tugma xaridorga nima qilish kerakligini
// aytmasdi, yo'q tugma esa savol tug'dirmaydi.
function otherCutBtn(productId) {
  const T = STR[S.lang];
  const joriy = S.aiVariant[String(productId)] || 0;
  if (!S.aiVariantMax || joriy >= S.aiVariantMax) return '';
  const narx = S.aiCredits && S.aiCredits.cost;
  const izoh = narx ? ` · ${T.aiOtherCutHint.replace('{n}', narx)}` : '';
  return `<button class="ai-ghost" data-action="otherCutAiImage" data-arg="${esc(productId)}">✦ ${esc(T.aiOtherCut + izoh)}</button>`;
}

// Kredit qatori. `null` bo'lsa UMUMAN chizilmaydi — CLAUDE.md: ma'lumot
// bazadan kelmasa blok ko'rsatilmaydi (o'ylab topilgan raqam qo'yilmaydi).
function creditQator() {
  const T = STR[S.lang];
  const c = S.aiCredits;
  if (!c) return '';
  const matn = c.unlimited
    ? `${T.aiCredits}: ∞ ${T.aiUnlimited}`
    : `${T.aiCreditLeft.replace('{n}', c.balance)} · ${T.aiCreditCost.replace('{n}', c.cost)}`;
  return `<div class="ai-count" style="margin-top:8px">✦ ${esc(matn)}</div>`;
}

// Chip bosilganda. Argument `productId|guruh|kalit` — delegatsiya bitta
// `data-arg` beradi, shuning uchun `|` bilan kodlanadi (app.js boshidagi
// izohga qara).
// ⚠️ Bu yerda TEKSHIRUV yo'q: serverdan kelmagan kalit umuman chizilmaydi,
// server esa har so'rovda o'z oq ro'yxatidan mustaqil o'tkazadi.
// Detal rasmidagi chip bosilganda AI blokiga olib tushadi. Blok tafsilotlar
// ostida turadi va ko'p foydalanuvchi u yergacha umuman aylantirmaydi —
// funksiya bor, lekin KO'RINMAYDI degan holat esa yo'q funksiyadan farq
// qilmaydi.
// ⚠️ `behavior: 'smooth'` ATAYLAB ISHLATILMAYDI. Sinab ko'rildi (2026-08-07,
// ilova brauzerida o'lchandi): `#screen-wrap` konteynerida u JIMGINA hech
// narsa qilmadi — `scrollTop` 0 da qoldi, konsolda esa xato yo'q. Aynan
// o'sha `auto` bilan 636 ga o'tdi. Ya'ni chip bosilardi va hech narsa
// bo'lmasdi. Silliq aylanish — bezak, ishlashi esa shart.
function scrollToAi() {
  const el = document.getElementById('ai-block');
  if (el) el.scrollIntoView({ behavior: 'auto', block: 'center' });
}

function pickAiChoice(arg) {
  const [productId, guruh, kalit] = String(arg).split('|');
  if (!productId || !guruh || !kalit) return;
  S.aiChoices[productId] = { ...(S.aiChoices[productId] || {}), [guruh]: kalit };
  // ⚠️ Javob o'zgarsa variant NOLGA qaytadi. Aks holda xaridor "palto" dan
  // "ko'ylak" ga o'tganda darrov 3-fason so'ralgan bo'lardi — ya'ni u
  // so'ramagan variant uchun kredit ketardi va sababi ko'rinmasdi.
  delete S.aiVariant[productId];
  repaintDetail(productId);
}

// "Boshqacha chizish" — natijani tozalaydi va savollarga QAYTARADI.
// Javoblar SAQLANADI: xaridor odatda bittasini o'zgartirmoqchi bo'ladi,
// uchalasini qaytadan tanlatish ortiqcha ish bo'lardi.
function resetAiImage(productId) {
  delete S.aiImages[String(productId)];
  // Variant ham nolga qaytadi — "boshqacha chizish" birinchi fasondan
  // boshlaydi, aks holda tekin bo'lishi kerak bo'lgan qaytish jimgina
  // pullik variantda qolib ketardi.
  delete S.aiVariant[String(productId)];
  repaintDetail(String(productId));
}

// "Boshqa fason" — javoblar SAQLANADI, faqat variant raqami oshadi va
// darrov yangi so'rov ketadi.
//
// ⚠️ Savollarga QAYTARILMAYDI (`resetAiImage` dan farqi shu): xaridor
// javoblaridan mamnun, unga yoqmagani — chizilgan fason. Uni yana uch
// savoldan o'tkazish o'zi javob bermagan savolga javob berishga majburlash
// bo'lardi.
//
// ⚠️ Chegara SERVERDAN kelgan qiymat bilan tekshiriladi va bu YAGONA
// tekshiruv emas: server ham `VARIANT_MAX` dan mustaqil o'tkazadi. Bu yerda
// tekshirilishining sababi — xatoni pul sarflanadigan yo'ldan OLDIN
// ushlash, himoya esa baribir serverda.
function otherCutAiImage(productId) {
  const id = String(productId);
  const keyingi = (S.aiVariant[id] || 0) + 1;
  if (!S.aiVariantMax || keyingi > S.aiVariantMax) return;
  S.aiVariant[id] = keyingi;
  askAiImage(id);
}

// Tugma bosilganda. Kimlik header'dagi imzolangan initData'dan — mahsulot
// id'sidan boshqa hech narsa yuborilmaydi (CLAUDE.md: `tg_user_id` klientdan
// olinmaydi).
async function askAiImage(productId) {
  const id = String(productId);
  const initData = tgInitData();
  if (!initData) { S.aiImages[id] = { state: 'error' }; repaintDetail(id); return; }

  S.aiImages[id] = { state: 'loading' };
  repaintDetail(id);

  try {
    const r = await fetch('/api/ai/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': initData },
      body: JSON.stringify({
        productId: id,
        // Matn har doim yuboriladi — server `dizayn = combo` bo'lmasa uni
        // O'ZI tashlaydi. Klientda "combo tanlanganmi" degan ikkinchi
        // tekshiruv yozilmadi: u serverdagi qoidaning nusxasi bo'lardi.
        // `variant` ham shu naqshda: `0` bo'lsa server uni O'ZI tashlaydi
        // va kesh kaliti variantsiz shakl bilan bir xil qoladi.
        choices: {
          ...(S.aiChoices[id] || {}),
          matn: S.aiText[id] || '',
          variant: S.aiVariant[id] || 0,
        },
      }),
    });
    const j = await r.json().catch(() => null);
    if (j && j.data && j.data.credits) S.aiCredits = j.data.credits;
    if (r.status === 429 && j && j.error === 'no_credit') {
      if (j.credits) S.aiCredits = { ...(S.aiCredits || {}), ...j.credits };
      S.aiImages[id] = { state: 'nocredit' };
    } else if (r.status === 400 && j && j.error === 'bad_choices') {
      // Serverning oq ro'yxati rad etdi — deyarli har doim erkin matn
      // sababli (chip kalitlari serverdan kelgan).
      S.aiImages[id] = { state: 'badtext' };
    } else if (j && j.error === 'ai_busy') {
      // Provayder O'Z tomonida band. Bu bizning nosozligimiz EMAS va u
      // vaqtinchalik — server allaqachon uch marta qayta urinib ko'rgan.
      // Umumiy "xato" dan ajratilgani ataylab: xabar boshqa, chunki bu
      // yerda qayta urinish HAQIQATAN yordam beradi.
      S.aiImages[id] = { state: 'busy' };
    } else if (r.status === 422 && j && j.error === 'ai_blocked') {
      // Model rasmni chizishdan bosh tortdi. Qayta urinish FOYDASIZ —
      // ayni javoblar ayni natijani beradi, shuning uchun tugma
      // "qayta urinish" emas, "javoblarni o'zgartirish" bo'ladi.
      S.aiImages[id] = { state: 'blocked' };
    } else if (r.status === 422 && j && j.error === 'no_source_photo') {
      // Alohida holat: "surat yo'q" texnik xato EMAS va uni umumiy xato
      // sifatida ko'rsatish foydalanuvchini foydasiz qayta urinishga
      // undardi (va har urinish kvota yeb ketardi).
      S.aiImages[id] = { state: 'nophoto' };
    } else if (j && j.ok && j.data && j.data.image) {
      // `fresh` — rasm HOZIR chizildi: ochilish animatsiyasi bir marta
      // o'ynaydi. Haptic ham shu yerda: Telegram'da telefon yengil
      // titraydi — "mo'jiza tayyor" hissi.
      S.aiImages[id] = { state: 'done', url: j.data.image, fresh: true };
      try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success'); } catch (e) { /* haptic ixtiyoriy */ }
      konfetti();
    } else {
      S.aiImages[id] = { state: 'error' };
    }
  } catch (e) {
    S.aiImages[id] = { state: 'error' };
  }
  repaintDetail(id);
}

// Erkin matn. ⚠️ Bu yerda QAYTA CHIZISH YO'Q: har harfda ekran qayta
// chizilsa kursor maydondan uchib ketardi (boshqa matn maydonlari ham shu
// naqshda — `setComment`, `setDispComment`).
function setAiText(qiymat, productId) {
  S.aiText[String(productId)] = String(qiymat || '');
}

// Ulashish — rasm allaqachon Telegram'da yashaydi, ya'ni bu deyarli tekin
// kanal. Havola bizning domendagi `/api/product-photo` proksisi.
// Qo'llab-quvvatlash Telegram'i. `shareAiImage` bilan AYNI mexanizm va
// AYNI sabab: Mini App Telegram WebView ichida yashaydi, oddiy `<a>` esa
// `t.me` ni ICHKI brauzerda ochib, foydalanuvchini chatga tushirmasdi.
// `openTelegramLink` uni Telegram'ning o'ziga uzatadi.
// Matnni buferga. Ikki yo'l ATAYLAB: `navigator.clipboard` xavfsiz
// kontekst va ruxsat talab qiladi hamda Telegram WebView'ida mavjud
// bo'lmasligi mumkin — o'shanda eski `execCommand` yo'li ishlaydi.
// Ikkalasi ham yiqilsa `false` qaytadi va foydalanuvchiga AYTILADI:
// jimgina "nusxalandi" deyish yolg'on bo'lardi.
function copyText(matn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(matn).then(() => true).catch(() => legacyCopy(matn));
  }
  return Promise.resolve(legacyCopy(matn));
}
function legacyCopy(matn) {
  try {
    const ta = document.createElement('textarea');
    ta.value = matn;
    ta.setAttribute('readonly', '');
    // Ko'rinmas, lekin ekranda: `display:none` bo'lsa tanlab bo'lmaydi,
    // ekrandan tashqariga chiqarilsa iOS sahifani sakratadi.
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, matn.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (e) {
    return false;
  }
}

// ⚠️ `preventDefault` YO'Q — havola o'z ishini qilaveradi, bu faqat
// USTIGA qo'shiladigan zaxira (yuqoridagi izohga qara).
function copySupportPhone() {
  const T = STR[S.lang];
  copyText(SUPPORT.tel).then((ok) => showToast(ok ? T.phoneCopied : T.phoneCopyErr));
}

function openSupportTg() {
  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg && tg.openTelegramLink) tg.openTelegramLink(SUPPORT.tgUrl);
  else window.open(SUPPORT.tgUrl, '_blank');
}

function shareAiImage(url) {
  const T = STR[S.lang];
  const toliq = String(url || '').startsWith('http') ? url : location.origin + url;
  const havola = 'https://t.me/share/url?url=' + encodeURIComponent(toliq) +
    '&text=' + encodeURIComponent(`${T.aiHubT} — lolamarket.uz`);
  const tg = window.Telegram && window.Telegram.WebApp;
  if (tg && tg.openTelegramLink) tg.openTelegramLink(havola);
  else window.open(havola, '_blank');
}

// ---- AI ekrani sehrgari ----
function aiTab(k) { S.aiTab = k === 'mine' ? 'mine' : 'feed'; if (k === 'mine') loadAiMine(); render(); }
function aiPickOpen() { S.aiPickOpen = true; render(); }
function aiWizardPick(id) { S.aiWizard = String(id); S.aiPickOpen = false; render(); }
function aiWizardExit() { S.aiWizard = null; S.aiPickOpen = false; render(); }

// "Mening rasmlarim" + kredit qoldig'i. Ikkalasi BITTA so'rovda keladi.
// Xato bo'lsa JIM o'tadi — galereya bilan bir xil mulohaza: foydalanuvchi
// uchun "yuklab bo'lmadi" va "hali rasm yo'q" o'rtasida farq yo'q.
async function loadAiMine() {
  const initData = tgInitData();
  if (!initData) return;
  try {
    const r = await fetch('/api/ai/my', { headers: { 'X-Telegram-Init-Data': initData } });
    const j = await r.json();
    if (j && j.ok && j.data) {
      S.aiMine = Array.isArray(j.data.items) ? j.data.items : [];
      if (j.data.credits) S.aiCredits = j.data.credits;
    } else {
      S.aiMine = [];
    }
  } catch (e) {
    S.aiMine = [];
  }
  if (S.screen === 'ai') render();
}

// Detal ekranini qayta chizish — `loadProductReviews` dagi bilan bir xil
// naqsh. Foydalanuvchi boshqa ekranga o'tib ketgan bo'lsa hech narsa qilmaydi.
// ⚠️ AI bloki endi IKKI joyda yashaydi: mahsulot sahifasida va AI ekranidagi
// sehrgarda. Shuning uchun qayta chizish ikkalasini ham biladi — aks holda
// AI ekranida tugma bosilardi va HECH NARSA o'zgarmasdi (holat yangilanadi,
// ekran esa eski qolardi).
//
// Bu yo'l bilan kutish holati ham SAQLANADI: rasm chizilayotganda boshqa
// tabga o'tib qaytsangiz, `S.aiImages` da holat turibdi va ekran uni
// qaytadan chizadi.
function repaintDetail(productId) {
  if (S.screen === 'ai') { render(); return; }
  if (S.screen !== 'detail' || S.selectedId !== productId) return;
  const w = document.getElementById('screen-wrap');
  if (w) w.innerHTML = renderDetail();
}

function reviewsSection(productId) {
  const T = STR[S.lang];
  const list = S.prodReviews[productId];

  return `
  <div>
    <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pom-700);margin-bottom:10px">${T.reviewsT}</div>
    ${list === undefined
      // Hali yuklanmagan — bo'sh joy turadi, "sharh yo'q" DEB YOZILMAYDI.
      // Aks holda yuklanish paytida yolg'on gap ko'rsatilardi.
      ? `<div style="height:44px"></div>`
      : list.length === 0
      ? `<div style="padding:16px;border:1px dashed var(--border-hair);border-radius:var(--radius-md);text-align:center">
           <div style="font-size:13px;font-weight:600;color:var(--text-body)">${T.noReviews}</div>
           <div style="font-size:12px;color:var(--text-muted);margin-top:3px">${T.noReviewsSub}</div>
         </div>`
      : `<div style="display:flex;flex-direction:column;gap:9px">
           ${list.map(r => `
           <div style="padding:12px 13px;border:1px solid var(--border-hair);border-radius:var(--radius-md);background:var(--glass-fill)">
             <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
               ${starsRow(r.stars)}
               <span style="font-size:11.5px;color:var(--text-subtle)">${r.date[S.lang]}</span>
             </div>
             ${r.body ? `<div style="font-size:13px;color:var(--text-body);line-height:1.5;margin-top:7px">${esc(r.body)}</div>` : ''}
             <div style="font-size:11.5px;color:var(--text-muted);margin-top:6px">${esc(r.author || '—')}</div>
           </div>`).join('')}
         </div>`}
  </div>`;
}

// HTML'ga qo'yiladigan HAR QANDAY foydalanuvchi matni shu yerdan o'tishi shart.
// (Ilgari bu yerda "boshqa hamma matn o'zimizniki" deb yozilgandi — bu NOTO'G'RI
// edi va aynan shu taxmin sababli buyurtma izohi, manzil va bahs sababi
// tozalanmay qolgan edi: 2026-08-02 da to'rttala joy ham yopildi.)
//
// ⚠️ CHEGARASI: bu faqat MATN va ODDIY ATRIBUT uchun ishlaydi
// (`<div>${esc(x)}</div>`, `<img src="${esc(x)}">`).
// Atribut ICHIDA boshqa til boshlansa — `style="...url('${x}')"` yoki
// `onclick="f('${x}')"` — YARAMAYDI: HTML tahlilchisi `&#39;` ni `'` ga
// QAYTARADI, keyin uni CSS/JS o'qiydi va matn tirnoqdan chiqib ketadi.
// Sinab ko'rilgan (2026-08-02): `esc()` bilan ham `background:red` qo'llanib ketdi.
// Bunday joyda URL uchun `cssUrl()`, qolgani uchun esa umuman
// interpolatsiya qilinmasin — qiymat `dataset` orqali berilsin.
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/* ── Konfetti (2026-08-13) ───────────────────────────────────────────
   AI rasmi tayyor bo'lganda "quiz javobi to'g'ri" hissini beradi.
   Saytdagi bilan AYNI funksiya (`script.js` → `konfetti`).

   ⚠️ NIMA UCHUN O'ZIMIZ CHIZAMIZ: Telegram'ning quizdagi konfettisi Mini
   App'ga BERILMAGAN — jonli SDK'da faqat `HapticFeedback` ning uchta
   metodi bor (2026-08-13 da production'da o'qib tekshirildi). Telegram'ning
   HAQIQIY konfettisi alohida keladi: server tayyor rasmni foydalanuvchi
   chatiga `message_effect_id` bilan yuboradi (`server/routes/ai.js`).

   Uslub JS'da qo'yiladi, shablon satriga INTERPOLATSIYA QILINMAYDI. */
const KONFETTI_RANG = ['#C9362D', '#E84B40', '#7A140D', '#F4C049', '#EFE3D0'];

function konfetti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const qatlam = document.createElement('div');
  qatlam.className = 'konfetti';
  qatlam.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < 42; i++) {
    const b = document.createElement('i');
    b.style.left = (Math.random() * 100) + '%';
    b.style.background = KONFETTI_RANG[i % KONFETTI_RANG.length];
    b.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
    b.style.animationDuration = (1.6 + Math.random() * 1.1).toFixed(2) + 's';
    b.style.setProperty('--x', (Math.random() * 160 - 80).toFixed(0) + 'px');
    b.style.setProperty('--r', (Math.random() * 900 - 450).toFixed(0) + 'deg');
    if (i % 3 === 0) b.style.borderRadius = '50%';
    qatlam.appendChild(b);
  }

  document.body.appendChild(qatlam);
  setTimeout(() => qatlam.remove(), 3200);
}

// ============ EKRAN: QIDIRUV ============
function renderSearch() {
  const T = STR[S.lang];
  const q = S.search.trim().toLowerCase();
  const results = q ? PRODUCTS.filter(p => (p.name[S.lang]+p.supplier[S.lang]+p.city[S.lang]).toLowerCase().includes(q)).map(vm) : [];
  const hasSearch = q.length > 0;
  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;align-items:center;gap:10px;height:48px;padding:0 16px;border:1px solid var(--pom-700);border-radius:var(--radius-md);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);box-shadow:0 0 0 4px rgba(122,20,13,.2),var(--glass-highlight)">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="color:var(--text-subtle)"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input id="search-inp" type="text" value="${S.search}" placeholder="${T.searchPh}" data-input="onSearch" autocomplete="off" style="flex:1;align-self:stretch;border:none;outline:none;background:transparent;font-family:var(--font-sans);font-size:16px;color:var(--text-strong)">
      ${S.search ? `<button data-action="clearSearch" style="color:var(--text-subtle);background:none;border:none;display:flex;align-items:center;cursor:pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>` : ''}
    </div>

    ${hasSearch ? `
      <div style="display:flex;flex-direction:column;gap:11px">
        ${results.length === 0 ? `
          <div style="text-align:center;padding:40px 20px;display:flex;flex-direction:column;align-items:center;gap:8px">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style="color:var(--ink-300)"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <div style="font-size:15px;font-weight:700;color:var(--text-strong)">${T.noResults}</div>
            <div style="font-size:13px;color:var(--text-muted)">${T.noResultsSub}</div>
          </div>
        ` : `
          <div style="font-size:12.5px;color:var(--text-muted);font-weight:600">${results.length} ${T.resultsN}</div>
          ${results.map(p => searchRow(p)).join('')}
        `}
      </div>
    ` : `
      <div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-subtle);margin-bottom:11px">${T.recent}</div>
        <div style="display:flex;flex-wrap:wrap;gap:9px;margin-bottom:24px">
          ${RECENT_SEARCHES[S.lang].map(r => `
            <button data-action="pickSearch" data-arg="${r}" style="display:flex;align-items:center;gap:7px;height:36px;padding:0 14px;border-radius:999px;border:1px solid var(--glass-border-soft);background:var(--glass-fill);font-family:var(--font-sans);font-size:13.5px;font-weight:500;color:var(--text-body);cursor:pointer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style="color:var(--text-subtle)"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${r}
            </button>
          `).join('')}
        </div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pom-700);margin-bottom:11px">${T.featured}</div>
        ${PRODUCTS.slice(0,3).map(p => searchRow(vm(p))).join('')}
      </div>
    `}
  </div>`;
}

function searchRow(p) {
  return `
  <div data-action="openProduct" data-arg="${p.id}" style="display:flex;gap:12px;align-items:center;cursor:pointer;padding:10px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
    <span style="flex:none;width:60px;height:60px;border-radius:var(--radius-sm);${p.bgStyle}"></span>
    <div style="flex:1;min-width:0">
      <div style="font-family:var(--font-display);font-size:14.5px;font-weight:700;color:var(--text-strong);line-height:1.2">${p.name}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${p.supplier} · ${p.city}</div>
      <div style="margin-top:4px"><span style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-strong)">${p.priceLabel}</span><span style="font-size:11px;color:var(--text-muted)">/${uShort(p.unit)}</span></div>
    </div>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-subtle)"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>`;
}

// ============ EKRAN: SAVAT ============
function renderCart() {
  const T = STR[S.lang];
  if (S.cart.length === 0) return `
  <div style="padding:60px 24px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">
    <span style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.6);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;color:var(--ink-300)">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M3 6h18" stroke="currentColor" stroke-width="1.7"/><path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
    </span>
    <div style="font-size:16px;font-weight:700;color:var(--text-strong)">${T.cartEmpty}</div>
    <div style="font-size:13px;color:var(--text-muted)">${T.cartEmptySub}</div>
    <button data-action="tab" data-arg="home" style="margin-top:6px;height:42px;padding:0 22px;border-radius:var(--radius-md);border:none;background:linear-gradient(135deg,var(--pom-600),var(--pom-800));color:#ffe9db;font-size:14px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">${T.browse}</button>
  </div>`;

  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:13px">
    ${S.cart.map(c => {
      const p = vm(byId(c.id));
      return `
      <div style="display:flex;gap:12px;padding:12px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
        <span style="flex:none;width:64px;height:64px;border-radius:var(--radius-sm);${p.bgStyle}"></span>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div style="display:flex;justify-content:space-between;gap:8px">
            <div style="font-family:var(--font-display);font-size:14px;font-weight:700;color:var(--text-strong);line-height:1.2">${p.name}</div>
            <button data-action="removeCart" data-arg="${p.id}" style="flex:none;color:var(--text-subtle);background:none;border:none;cursor:pointer;width:22px;height:22px;display:flex;align-items:center;justify-content:center">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:1px">${p.supplier}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:8px">
            <div style="display:flex;align-items:center;gap:10px">
              <button data-action="decCart" data-arg="${p.id}" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--glass-border);background:var(--glass-fill-strong);display:flex;align-items:center;justify-content:center;color:var(--text-strong);cursor:pointer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
              </button>
              <span style="font-family:var(--font-mono);font-size:13px;font-weight:600;color:var(--text-strong);min-width:60px;text-align:center">${num(c.qty)} ${uShort(p.unit)}</span>
              <button data-action="incCart" data-arg="${p.id}" style="width:28px;height:28px;border-radius:8px;border:1px solid var(--glass-border);background:var(--glass-fill-strong);display:flex;align-items:center;justify-content:center;color:var(--text-strong);cursor:pointer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
              </button>
            </div>
            <span style="font-family:var(--font-mono);font-size:15px;font-weight:600;color:var(--text-strong)">${money(p.price * c.qty)}</span>
          </div>
        </div>
      </div>`;
    }).join('')}

    <div style="padding:16px;border-radius:var(--radius-lg);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);border:1px solid var(--glass-border);box-shadow:var(--glass-shadow)">
      <div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text-muted);margin-bottom:8px"><span>${T.subtotal}</span><span style="font-family:var(--font-mono);font-weight:600;color:var(--text-body)">${money(cartTotal())}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--text-muted);margin-bottom:10px"><span>${T.delivery}</span><span style="font-family:var(--font-mono)">${T.deliveryCalc} ${money(DELIVERY_FEE_ESTIMATE)}</span></div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:10px;border-top:1px solid var(--border-hair)">
        <span style="font-size:15px;font-weight:700;color:var(--text-strong)">${T.total}</span>
        <span style="font-family:var(--font-mono);font-size:21px;font-weight:600;color:var(--text-strong)">${money(cartTotal())}</span>
      </div>
      <button data-action="navigate" data-arg="checkout" style="margin-top:14px;width:100%;height:50px;border-radius:var(--radius-md);border:none;background:linear-gradient(135deg,var(--pom-600),var(--pom-800));color:#ffe9db;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 10px 26px -10px rgba(81,1,0,.55),inset 0 1px 0 rgba(255,229,210,.2)">${T.checkout}</button>
    </div>
  </div>`;
}

// ============ EKRAN: CHECKOUT ============
// Ko'p qadamli wizard emas — bitta skrollda tartiblangan 4 bo'lim.
// Faqat BTS nuqtasi tanlash bottom-sheet'ga chiqadi (200+ nuqta inline sig'maydi).
const SEC_LABEL = 'font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pom-700)';
const CARD_BOX = 'padding:14px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)';

function secHead(n, label) {
  return `<div style="display:flex;align-items:center;gap:7px;margin-bottom:9px">
    <span style="flex:none;width:17px;height:17px;border-radius:50%;background:var(--pom-100);color:var(--pom-700);display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:700">${n}</span>
    <span style="${SEC_LABEL}">${label}</span>
  </div>`;
}

function renderCheckout() {
  const T = STR[S.lang];
  const total = cartTotal();
  const point = btsById(S.btsPoint);

  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:16px">
    <div>
      ${secHead(1, T.orderItems)}
      <div style="${CARD_BOX}">
        ${S.cart.map(c => {
          const p = byId(c.id);
          return `<div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;margin-bottom:8px"><span style="color:var(--text-body)">${p.name[S.lang]} · ${num(c.qty)} ${uShort(p.unit)}</span><span style="font-family:var(--font-mono);font-weight:600;color:var(--text-strong);flex:none">${money(p.price * c.qty)}</span></div>`;
        }).join('')}
      </div>
    </div>

    <div>
      ${secHead(2, T.pickupL)}
      ${point ? `
      <div style="${CARD_BOX};display:flex;gap:12px">
        <span style="flex:none;width:34px;height:34px;border-radius:11px;background:var(--teal-50);display:flex;align-items:center;justify-content:center;color:var(--teal-600)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s-6-5.7-6-10a6 6 0 0 1 12 0c0 4.3-6 10-6 10z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.2" stroke="currentColor" stroke-width="2"/></svg>
        </span>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:var(--text-strong)">${point.name[S.lang]}</div>
          <div style="font-size:12.5px;color:var(--text-muted);line-height:1.45;margin-top:2px">${point.addr[S.lang]}<br>${T.workHours} ${point.hours}</div>
          <button data-action="openBtsSheet" style="font-size:12.5px;font-weight:700;color:var(--teal-600);background:none;border:none;cursor:pointer;padding:6px 0 0">${T.changePoint}</button>
        </div>
      </div>` : `
      <button data-action="openBtsSheet" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;cursor:pointer;padding:15px 13px;border-radius:var(--radius-md);border:1.5px dashed var(--ink-200);background:rgba(255,255,255,.4)">
        <span style="flex:none;width:34px;height:34px;border-radius:11px;background:var(--ink-100);display:flex;align-items:center;justify-content:center;color:var(--ink-400)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s-6-5.7-6-10a6 6 0 0 1 12 0c0 4.3-6 10-6 10z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.2" stroke="currentColor" stroke-width="2"/></svg>
        </span>
        <span style="flex:1;font-size:13.5px;font-weight:600;color:var(--text-muted)">${T.pickPoint}</span>
        <span style="color:var(--ink-300);font-size:17px">›</span>
      </button>`}
    </div>

    <div>
      ${secHead(3, T.payment)}
      <div style="display:flex;flex-direction:column;gap:9px">
        ${PAY.map(o => {
          const sel = S.pay === o.key;
          return `<button data-action="setPay" data-arg="${o.key}" style="display:flex;align-items:center;gap:12px;width:100%;text-align:left;cursor:pointer;padding:11px 13px;border-radius:var(--radius-md);background:${sel ? '#fff' : 'rgba(255,255,255,.55)'};backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1.5px solid ${sel ? 'var(--pom-700)' : 'var(--border-hair)'};transition:border-color 200ms">
            <div style="flex:none;width:20px;height:20px;border-radius:50%;border:2px solid ${sel ? 'var(--pom-700)' : 'var(--ink-300)'};display:flex;align-items:center;justify-content:center">
              <div style="width:9px;height:9px;border-radius:50%;background:${sel ? 'var(--pom-700)' : 'transparent'}"></div>
            </div>
            <span style="flex:none;width:30px;height:30px;border-radius:8px;background:${o.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800">${o.mark}</span>
            <div style="flex:1;font-size:14px;font-weight:600;color:var(--text-strong)">${o.label[S.lang]}</div>
          </button>`;
        }).join('')}
      </div>
    </div>

    <div>
      ${secHead(4, T.commentL)}
      <textarea id="checkout-comment" data-input="setComment" placeholder="${T.commentPh}" rows="3" style="width:100%;resize:none;padding:12px 14px;border:1px solid var(--border-hair);border-radius:var(--radius-md);background:var(--glass-fill-strong);font-family:var(--font-sans);font-size:16px;color:var(--text-strong);outline:none;box-shadow:var(--glass-highlight)">${S.comment || ''}</textarea>
    </div>

    <div style="padding-top:2px">
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-muted);padding:5px 2px">
        <span>${T.subtotal}</span><span style="font-family:var(--font-mono)">${money(total)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-muted);padding:5px 2px">
        <span>${T.deliveryBts}</span><span style="font-family:var(--font-mono)">${T.deliveryCalc} ${money(DELIVERY_FEE_ESTIMATE)}</span>
      </div>
      <div style="font-size:11px;color:var(--text-subtle);padding:0 2px 5px;line-height:1.4">${T.deliveryNote}</div>
      <div style="height:1px;background:var(--border-hair);margin:8px 2px"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 2px">
        <span style="font-size:15px;font-weight:700;color:var(--text-strong)">${T.payNow}
          <span style="font-size:10px;font-weight:700;background:var(--pom-100);color:var(--pom-700);padding:2px 6px;border-radius:999px;margin-left:5px;vertical-align:1px">${Math.round(PREPAY_RATE * 100)}%</span>
        </span>
        <span style="font-family:var(--font-mono);font-size:15px;font-weight:700;color:var(--pom-700)">${money(prepayAmount(total))}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-muted);padding:5px 2px">
        <span>${T.payLater}</span><span style="font-family:var(--font-mono)">${money(restAmount(total))}</span>
      </div>
    </div>
  </div>`;
}

// ============ BTS NUQTASI TANLASH (bottom-sheet) ============
// Ikki ko'rinish: RO'YXAT (har doim ishlaydi) va KARTA (kalit bo'lsa).
// Karta tugmasi `S.mapsKey` bo'lmasa UMUMAN chizilmaydi — bosilgach
// "ishlamadi" deydigan tugma bo'lmasin (AI tugmasi bilan bitta mulohaza).
function btsViewTabs() {
  const T = STR[S.lang];
  if (!S.mapsKey) return '';
  const btn = (k, matn) => {
    const on = S.btsView === k;
    return `<button data-action="setBtsView" data-arg="${k}" style="flex:1;cursor:pointer;height:32px;border-radius:999px;border:none;font-family:var(--font-sans);font-size:12.5px;font-weight:700;background:${on ? 'var(--ink-900)' : 'transparent'};color:${on ? '#fff' : 'var(--text-muted)'}">${matn}</button>`;
  };
  return `<div style="display:flex;gap:3px;padding:3px;margin-bottom:10px;border-radius:999px;background:var(--ink-50,var(--ink-100));flex:none">
    ${btn('list', T.viewList)}${btn('map', T.viewMap)}
  </div>`;
}

// Karta ko'rinishi. Tugma `#bts-map` ga Yandex tomonidan chiziladi
// (`mountBtsMap`), pastdagi kartochka esa tanlangan nuqtani ko'rsatadi va
// TO'LIQ QAYTA CHIZISHSIZ yangilanadi (`paintMapPick`) — aks holda har
// belgi bosilganda karta qaytadan yuklanardi va ekran sakrardi.
function renderBtsMapView() {
  const T = STR[S.lang];
  return `
    <div id="bts-map" style="flex:none;height:min(46vh,300px);border-radius:var(--radius-md);overflow:hidden;background:var(--ink-50,var(--ink-100));display:flex;align-items:center;justify-content:center;font-size:12.5px;color:var(--text-muted)">${T.mapLoading}</div>
    <div style="display:flex;align-items:flex-start;gap:6px;font-size:11px;line-height:1.4;color:var(--text-subtle);margin:8px 2px 0;flex:none">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style="flex:none;margin-top:1px"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 8h.01M11 12h1v4h1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <span>${T.mapApprox}</span>
    </div>
    <div id="bts-map-pick" style="flex:none;margin-top:10px">${btsMapPickHtml()}</div>`;
}

// Kartadagi tanlov kartochkasi. Alohida funksiya, chunki u ikki joydan
// chiziladi: sheet ochilganda va belgi bosilganda (qayta chizishsiz).
function btsMapPickHtml() {
  const T = STR[S.lang];
  const p = btsById(S.btsPoint);
  if (!p) {
    return `<div style="text-align:center;font-size:12.5px;color:var(--text-muted);padding:13px 0">${T.pickPoint}</div>`;
  }
  return `
    <div style="padding:12px;border-radius:var(--radius-md);background:#fff;box-shadow:0 0 0 1.5px var(--pom-700)">
      <div style="font-size:13.5px;font-weight:700;color:var(--text-strong)">${p.name[S.lang]}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${p.addr[S.lang]} · ${p.hours}</div>
    </div>
    <button data-action="pickBts" data-arg="${p.id}" style="margin-top:9px;width:100%;height:48px;border:none;border-radius:var(--radius-md);background:linear-gradient(135deg,var(--pom-600),var(--pom-800));color:#ffe9db;font-family:var(--font-sans);font-size:15px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">${T.pickSelect}</button>`;
}

function renderBtsSheet() {
  const T = STR[S.lang];
  const q = S.btsQuery.trim().toLowerCase();
  const list = BTS_POINTS.filter(p => {
    if (q) return (p.name[S.lang] + ' ' + p.addr[S.lang]).toLowerCase().includes(q);
    return p.region === S.btsRegion;
  });

  return `
  <div data-action="closeBtsSheet" style="position:absolute;inset:0;background:rgba(23,26,48,.34);z-index:60;animation:fade var(--dur-base) var(--ease-out)"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;z-index:61;max-height:80%;display:flex;flex-direction:column;border-radius:var(--radius-xl) var(--radius-xl) 0 0;padding:10px 14px calc(18px + env(safe-area-inset-bottom));backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);background:var(--glass-tint);box-shadow:var(--glass-spec),0 -12px 40px -8px rgba(81,1,0,.28);animation:sheetUp var(--dur-base) var(--ease-out)">
    <div style="width:38px;height:4px;border-radius:99px;background:var(--ink-200);margin:0 auto 12px;flex:none"></div>
    <div style="font-family:var(--font-display);font-size:17px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em;margin-bottom:11px;flex:none">${T.pickSheetT}</div>

    ${btsViewTabs()}
    ${S.btsView === 'map' && S.mapsKey ? renderBtsMapView() : `
    <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.8);border-radius:999px;height:44px;padding:0 14px;flex:none;box-shadow:var(--shadow-sm)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--ink-400)"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      <input id="bts-search" value="${S.btsQuery}" data-input="onBtsSearch" placeholder="${T.pickSearchPh}" style="flex:1;align-self:stretch;border:none;background:none;outline:none;font-family:var(--font-sans);font-size:16px;color:var(--text-strong)">
    </div>

    ${q ? '' : `<div style="display:flex;gap:7px;margin:5px 0 3px;padding:6px 0;overflow-x:auto;flex:none;scrollbar-width:none">
      ${BTS_REGIONS.map(r => {
        const on = S.btsRegion === r.key;
        return `<button data-action="setBtsRegion" data-arg="${r.key}" style="flex:none;cursor:pointer;font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:999px;background:${on ? 'var(--ink-900)' : 'rgba(255,255,255,.66)'};color:${on ? '#fff' : 'var(--ink-700)'};border:1px solid ${on ? 'var(--ink-900)' : 'rgba(255,255,255,.8)'}">${r.name[S.lang]}</button>`;
      }).join('')}
    </div>`}

    <div style="font-size:11.5px;color:var(--text-muted);font-weight:600;margin:${q ? '11px' : '2px'} 2px 9px;flex:none">${list.length ? `${list.length} ${T.pointsFound}` : T.pointsNone}</div>

    <div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch">
      ${list.map(p => {
        const sel = S.btsPoint === p.id;
        return `<button data-action="pickBts" data-arg="${p.id}" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;cursor:pointer;padding:12px;border-radius:var(--radius-md);margin-bottom:7px;border:none;background:${sel ? '#fff' : 'rgba(255,255,255,.6)'};box-shadow:${sel ? '0 0 0 1.5px var(--pom-700)' : 'none'}">
          <div style="flex:1">
            <div style="font-size:13.5px;font-weight:700;color:var(--text-strong)">${p.name[S.lang]}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${p.addr[S.lang]} · ${p.hours}</div>
          </div>
          <div style="flex:none;width:20px;height:20px;border-radius:50%;border:2px solid ${sel ? 'var(--pom-700)' : 'var(--ink-200)'};display:flex;align-items:center;justify-content:center">
            <div style="width:9px;height:9px;border-radius:50%;background:${sel ? 'var(--pom-700)' : 'transparent'}"></div>
          </div>
        </button>`;
      }).join('')}
    </div>

    <button data-action="closeBtsSheet" style="flex:none;margin-top:10px;width:100%;height:50px;border:none;border-radius:var(--radius-md);background:linear-gradient(135deg,var(--pom-600),var(--pom-800));color:#ffe9db;font-family:var(--font-sans);font-size:15px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">${T.pickSelect}</button>`}
  </div>`;
}

// ============ NARX ORALIG'I (bottom-sheet) ============
function renderPriceSheet() {
  const T = STR[S.lang];
  // Yo'l-yo'riq raqami KATALOGDAN olinadi, o'ylab topilmaydi — mahsulot bo'lmasa
  // qator umuman ko'rsatilmaydi (CLAUDE.md: "o'ylab topilgan raqam ko'rsatilmasin")
  const prices = PRODUCTS.map(p => Number(p.price)).filter(Number.isFinite);
  const lo = prices.length ? Math.min(...prices) : null;
  const hi = prices.length ? Math.max(...prices) : null;

  const inputBox = 'flex:1;min-width:0;display:flex;flex-direction:column;gap:5px';
  const inputSt = "width:100%;height:48px;padding:0 14px;border-radius:var(--radius-md);border:1px solid rgba(255,255,255,.8);background:rgba(255,255,255,.7);outline:none;font-family:var(--font-sans);font-size:16px;font-weight:600;color:var(--text-strong);box-shadow:var(--shadow-sm)";
  const lblSt = 'font-size:11.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--text-muted);padding-left:2px';

  return `
  <div data-action="closePriceSheet" style="position:absolute;inset:0;background:rgba(23,26,48,.34);z-index:60;animation:fade var(--dur-base) var(--ease-out)"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;z-index:61;display:flex;flex-direction:column;border-radius:var(--radius-xl) var(--radius-xl) 0 0;padding:10px 14px calc(18px + env(safe-area-inset-bottom));backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);background:var(--glass-tint);box-shadow:var(--glass-spec),0 -12px 40px -8px rgba(81,1,0,.28);animation:sheetUp var(--dur-base) var(--ease-out)">
    <div style="width:38px;height:4px;border-radius:99px;background:var(--ink-200);margin:0 auto 12px;flex:none"></div>
    <div style="font-family:var(--font-display);font-size:17px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em;margin-bottom:4px">${T.priceT}</div>
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:13px">${T.priceUnit}</div>

    <div style="display:flex;gap:10px;align-items:flex-end">
      <label style="${inputBox}">
        <span style="${lblSt}">${T.priceMinPh}</span>
        <input id="price-min" type="text" inputmode="numeric" value="${S.priceDraftMin}" data-input="priceDraftInput" data-arg="min" placeholder="${lo === null ? '' : priceNum(lo)}" style="${inputSt}">
      </label>
      <div style="flex:none;height:48px;display:flex;align-items:center;color:var(--text-muted);font-weight:700">–</div>
      <label style="${inputBox}">
        <span style="${lblSt}">${T.priceMaxPh}</span>
        <input id="price-max" type="text" inputmode="numeric" value="${S.priceDraftMax}" data-input="priceDraftInput" data-arg="max" placeholder="${hi === null ? '' : priceNum(hi)}" style="${inputSt}">
      </label>
    </div>

    <div id="price-err" style="min-height:17px;margin-top:7px;font-size:12px;font-weight:600;color:var(--danger-500)">${S.priceErr}</div>

    ${lo === null ? '' : `<div style="font-size:12px;color:var(--text-muted);margin-bottom:14px">${T.priceRangeHint}: ${priceNum(lo)} – ${priceNum(hi)} ${T.somU}</div>`}

    <div style="display:flex;gap:10px">
      <button data-action="clearPriceFilter" style="flex:none;padding:0 18px;height:50px;border-radius:var(--radius-md);border:1px solid rgba(122,20,13,.3);background:none;color:var(--pom-700);font-family:var(--font-sans);font-size:15px;font-weight:600;cursor:pointer">${T.priceClear}</button>
      <button data-action="applyPriceFilter" style="flex:1;height:50px;border:none;border-radius:var(--radius-md);background:linear-gradient(135deg,var(--pom-600),var(--pom-800));color:#ffe9db;font-family:var(--font-sans);font-size:15px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">${T.priceApply}</button>
    </div>
  </div>`;
}

// Sheet #screen-wrap dan tashqarida chiziladi — aks holda skroll konteyneri uni kesadi
function paintSheet() {
  const wrap = document.getElementById('sheet-wrap');
  if (!wrap) return;
  wrap.innerHTML = S.photoView ? renderPhotoView()
    : S.btsSheet ? renderBtsSheet()
    : S.dispSheet ? renderDisputeSheet()
    : S.revSheet ? renderReviewSheet()
    : S.priceSheet ? renderPriceSheet()
    : S.contactSheet ? renderContactSheet()
    : '';
  // Masshtab hodisalari HTML bilan kelmaydi — tugun DOM'ga tushgandan keyin
  // ulanadi (kartadagi bilan bitta sabab: har chizishda tugun YANGI).
  if (S.photoView) mountPhotoView();
  // Karta HTML bilan birga kelmaydi — u `#bts-map` tuguni DOM'ga
  // tushgandan keyin chiziladi. Shuning uchun mount aynan shu yerda:
  // sheet qayta chizilgan har safar tugun YANGI bo'ladi.
  if (S.btsSheet && S.btsView === 'map' && S.mapsKey) mountBtsMap();
}
function openBtsSheet() {
  S.btsSheet = true;
  S.btsQuery = '';
  S.btsFrom = 'checkout';
  paintSheet();
}

// Profildagi "Mening manzilim" — AYNI sheet, lekin kartadan boshlanadi va
// yopilganda checkout emas, PROFIL qayta chiziladi. `S.btsFrom` shuning
// uchun bor: usiz yopish har doim `renderCheckout()` chaqirardi va profildan
// ochilgan oyna yopilganda ekran jimgina checkout'ga sakrab ketardi.
function openAddrPicker() {
  S.btsSheet = true;
  S.btsQuery = '';
  S.btsFrom = 'profile';
  S.btsView = S.mapsKey ? 'map' : 'list';
  paintSheet();
}

function closeBtsSheet() {
  const qayerdan = S.btsFrom;
  S.btsSheet = false;
  paintSheet();
  document.getElementById('screen-wrap').innerHTML =
    qayerdan === 'profile' ? renderProfile() : renderCheckout();
  updateNav();
}
function setBtsView(k) {
  S.btsView = k === 'map' ? 'map' : 'list';
  paintSheet();
}
function setBtsRegion(k) {
  S.btsRegion = k;
  paintSheet();
}
function onBtsSearch(v) {
  S.btsQuery = v;
  paintSheet();
  const inp = document.getElementById('bts-search');
  if (inp) { inp.focus(); const l = inp.value.length; inp.setSelectionRange(l, l); }
}
function pickBts(id) {
  S.btsPoint = id;
  saveBtsPoint(id);
  const p = btsById(id);
  if (p) S.btsRegion = p.region;
  // Tanlov BAZAGA ham yoziladi (`db/022`) — shunda u boshqa qurilmada va
  // saytda ham topiladi. `localStorage` qolaveradi: server javobi kelgunicha
  // va kirmagan (mehmon) foydalanuvchi uchun zaxira.
  savePickupPoint(id, S.btsFrom === 'profile');
  closeBtsSheet();
}

// ---- Kartadagi belgini bosish ----
// ⚠️ Bu yerda QAYTA CHIZISH YO'Q: butun sheet qayta chizilsa karta o'chib,
// qaytadan yuklanardi va ekran har bosishda sakrardi (bu naqsh loyihada
// allaqachon bor — `paintBtsInfo`, `setAiText`). Faqat pastdagi kartochka
// almashtiriladi.
function mapPickBts(id) {
  if (!btsById(id)) return;
  S.btsPoint = id;
  paintMapPick();
  paintMapMarkers();
}
function paintMapPick() {
  const box = document.getElementById('bts-map-pick');
  if (box) box.innerHTML = btsMapPickHtml();
}

// ============ MANZILNI SERVERGA SAQLASH ============
// ⚠️ Xato YUTILMAYDI, lekin JOYIGA qarab boshqacha ko'rsatiladi:
//   * profildan tanlangan bo'lsa — xaridor aynan "manzilimni saqlayapman"
//     deb turibdi, ya'ni jimgina muvaffaqiyatsizlik YOLG'ON bo'lardi
//     (u keyingi kirishda manzilini topmasdi). Toast chiqadi.
//   * checkout'dan bo'lsa — nuqta buyurtmaga baribir ketadi (`address`
//     matni bilan), ya'ni xaridor uchun hech narsa buzilmaydi. Uni ortiqcha
//     xato bilan qo'rqitmaymiz, lekin jurnalga yozamiz.
async function savePickupPoint(id, koRsat) {
  if (!tgInitData()) {
    if (koRsat) showToast(STR[S.lang].myAddrGuest);
    return;
  }
  if (S.addrSaving) return;
  S.addrSaving = true;
  try {
    const r = await fetch('/api/pickup-point', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tgInitData() },
      body: JSON.stringify({ pointId: id }),
    });
    const d = await r.json().catch(() => null);
    if (!d || d.ok !== true) throw new Error((d && d.error) || 'saqlanmadi');
    if (koRsat) showToast(STR[S.lang].myAddrSaved);
  } catch (e) {
    // Birinchi argument — alert guruhlash kaliti (CLAUDE.md).
    console.error('pickupPoint saqlanmadi:', e.message);
    if (koRsat) showToast(STR[S.lang].myAddrErr);
  } finally {
    S.addrSaving = false;
  }
}

// ============ YANDEX KARTA ============
// ⚠️ Skript DINAMIK yuklanadi — `<head>` ga qo'yilmaydi. Ikki sabab:
// (1) CLAUDE.md qoidasi — tashqi skript HTML tahlilini to'xtatmasin
// (`telegram-web-app.js` bir marta ~613 ms yegan); (2) karta profil
// oynasi ochilmaguncha umuman kerak emas, ya'ni ko'pchilik foydalanuvchi
// uni HECH QACHON yuklamaydi.
//
// ⚠️ Til skript MANZILIGA yoziladi va keyin o'zgarmaydi: Yandex tilni
// yuklashda oladi. Foydalanuvchi tilni almashtirsa karta eski tilda
// qolaveradi — bu bilib qilingan murosa, alternativa sahifani qayta
// yuklash bo'lardi.
let ymapsPromise = null;
function loadYmaps() {
  if (ymapsPromise) return ymapsPromise;
  if (!S.mapsKey) return Promise.reject(new Error('kalit yo\'q'));
  ymapsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://api-maps.yandex.ru/2.1/?apikey=' + encodeURIComponent(S.mapsKey) +
      '&lang=' + (S.lang === 'ru' ? 'ru_RU' : 'en_US');
    s.async = true;
    s.onload = () => {
      if (window.ymaps && window.ymaps.ready) window.ymaps.ready(() => resolve(window.ymaps));
      else reject(new Error('ymaps topilmadi'));
    };
    // ⚠️ Yiqilgan urinish ESLAB QOLINMAYDI: `ymapsPromise` bo'shatiladi,
    // aks holda bir marta uzilgan tarmoq kartani sessiya oxirigacha
    // o'lik qoldirardi.
    s.onerror = () => { ymapsPromise = null; reject(new Error('skript yuklanmadi')); };
    document.head.appendChild(s);
  });
  return ymapsPromise;
}

let btsMap = null;
let btsMarkers = {};

async function mountBtsMap() {
  const box = document.getElementById('bts-map');
  if (!box || !S.mapsKey) return;
  btsMap = null;
  btsMarkers = {};
  try {
    const ymaps = await loadYmaps();
    // Kutish paytida oyna yopilgan bo'lishi mumkin — o'shanda kartani
    // mavjud bo'lmagan tugunga chizishga urinmaymiz.
    if (!document.body.contains(box)) return;
    box.innerHTML = '';

    const tanlangan = btsById(S.btsPoint);
    btsMap = new ymaps.Map(box, {
      center: tanlangan ? [tanlangan.lat, tanlangan.lng] : [41.3111, 69.2797],
      zoom: tanlangan ? 12 : 6,
      // `geolocationControl` — "eng yaqin nuqta" savoliga tayyor javob:
      // xaridor o'z joyini bir bosishda ko'radi va yonidagini tanlaydi.
      controls: ['zoomControl', 'geolocationControl'],
    }, { suppressMapOpenBlock: true });

    for (const p of BTS_POINTS) {
      const m = new ymaps.Placemark([p.lat, p.lng], {
        hintContent: p.name[S.lang],
        // ⚠️ XOM HEX ATAYLAB — Yandex Maps JS API si CSS o'zgaruvchisini
        // tushunmaydi (pastdagi `iconColor` izohiga qara).
      }, { preset: 'islands#dotIcon', iconColor: '#7a140d' });
      m.events.add('click', () => mapPickBts(p.id));
      btsMarkers[p.id] = m;
      btsMap.geoObjects.add(m);
    }
    paintMapMarkers();
  } catch (e) {
    // Xato YUTILMAYDI, lekin xaridor tiqilib qolmaydi: ro'yxat yonida
    // turibdi va u kartaga umuman bog'liq emas.
    console.error('Karta yuklanmadi:', e.message);
    if (document.body.contains(box)) {
      box.textContent = STR[S.lang].mapOff;
    }
  }
}

// Tanlangan belgi ajralib tursin. Belgilar QAYTA YARATILMAYDI — faqat
// rangi almashtiriladi, aks holda karta har bosishda "sakrardi".
function paintMapMarkers() {
  for (const id in btsMarkers) {
    const on = id === S.btsPoint;
    btsMarkers[id].options.set({
      preset: on ? 'islands#circleIcon' : 'islands#dotIcon',
      // ⚠️ XOM HEX ATAYLAB: bu qiymat CSS ga emas, Yandex Maps JS API siga
      // uzatiladi va u `var(--pom-700)` ni tushunmaydi — belgi rangini
      // JIMGINA yo'qotardi. Yuqoridagi `dotIcon` da ham shu sabab.
      iconColor: on ? '#7a140d' : '#9b8f88',
    });
  }
}

// ============ BAHSLI HOLAT (xaridor tomoni) ============
// Kalitlar SERVERDAGI DISPUTE_REASONS bilan bir xil bo'lishi shart — matn
// klientdan emas, kalit yuboriladi, sababni server o'zi yozadi.
const DISP_REASONS = [
  { key: 'not_delivered', uz: 'Mato yetib kelmadi',     ru: 'Ткань не пришла' },
  { key: 'damaged',       uz: 'Mato shikastlangan',     ru: 'Ткань повреждена' },
  { key: 'wrong_item',    uz: 'Boshqa mato keldi',      ru: 'Пришла другая ткань' },
  { key: 'quality',       uz: 'Sifat mos emas',         ru: 'Качество не соответствует' },
  { key: 'quantity',      uz: 'Miqdor kam chiqdi',      ru: 'Количество меньше' },
  { key: 'other',         uz: 'Boshqa muammo',          ru: 'Другая проблема' },
];

// Bahs faqat mato yo'lga chiqqandan keyin — serverdagi qoida bilan bir xil
const DISP_ALLOWED = ['shipped', 'delivered', 'completed'];

function disputeFor(orderId) {
  return S.disputes.find(d => d.orderId === orderId) || null;
}

function renderDisputeSheet() {
  const T = STR[S.lang];
  return `
  <div data-action="closeDisputeSheet" style="position:fixed;inset:0;z-index:60;background:rgba(24,10,8,.42);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)"></div>
  <div style="position:fixed;left:0;right:0;bottom:0;z-index:61;max-height:82vh;display:flex;flex-direction:column;padding:18px 16px calc(18px + env(safe-area-inset-bottom));border-radius:22px 22px 0 0;background:var(--surface-solid);box-shadow:0 -12px 40px -12px rgba(81,1,0,.3)">
    <span style="flex:none;width:38px;height:4px;border-radius:999px;background:var(--ink-100);margin:0 auto 14px"></span>

    <div style="flex:none;font-family:var(--font-display);font-size:19px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em">${T.dispTitle}</div>
    <div style="flex:none;font-size:12.5px;color:var(--text-muted);line-height:1.5;margin-top:5px">${T.dispSub}</div>

    <div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;margin-top:14px;display:flex;flex-direction:column;gap:7px">
      ${DISP_REASONS.map(r => {
        const on = S.dispReason === r.key;
        return `<button data-action="setDispReason" data-arg="${r.key}" style="display:flex;align-items:center;gap:10px;text-align:left;padding:13px;border-radius:var(--radius-sm);cursor:pointer;border:1.5px solid ${on ? 'var(--pom-600)' : 'var(--border-hair)'};background:${on ? 'rgba(143,26,16,.05)' : 'transparent'}">
          <span style="flex:none;width:18px;height:18px;border-radius:50%;border:1.5px solid ${on ? 'var(--pom-600)' : 'var(--ink-200)'};display:flex;align-items:center;justify-content:center">
            ${on ? '<span style="width:9px;height:9px;border-radius:50%;background:var(--pom-600)"></span>' : ''}
          </span>
          <span style="font-size:14px;font-weight:${on ? 700 : 500};color:var(--text-strong)">${r[S.lang]}</span>
        </button>`;
      }).join('')}

      <textarea data-input="setDispComment" placeholder="${T.dispCommentPh}" rows="3"
        style="margin-top:6px;width:100%;padding:12px;border:1px solid var(--border-hair);border-radius:var(--radius-sm);background:var(--glass-fill-strong);font-family:var(--font-sans);font-size:16px;color:var(--text-strong);outline:none;resize:none">${S.dispComment}</textarea>
    </div>

    <div style="flex:none;display:flex;gap:9px;margin-top:12px">
      <button data-action="closeDisputeSheet" style="flex:1;height:50px;border-radius:var(--radius-md);border:1px solid var(--border-hair);background:transparent;font-family:var(--font-sans);font-size:15px;font-weight:600;color:var(--text-muted);cursor:pointer">${T.dispCancel}</button>
      <button data-action="submitDispute" style="flex:1.4;height:50px;border:none;border-radius:var(--radius-md);background:linear-gradient(135deg,var(--pom-600),var(--pom-800));color:#ffe9db;font-family:var(--font-sans);font-size:15px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">${T.dispSend}</button>
    </div>
  </div>`;
}

function openDisputeSheet(orderId) {
  S.dispSheet = { orderId };
  S.dispReason = 'damaged';
  S.dispComment = '';
  paintSheet();
}
function closeDisputeSheet() {
  S.dispSheet = null;
  paintSheet();
}
function setDispReason(k) {
  S.dispReason = k;
  paintSheet();
}
function setDispComment(v) { S.dispComment = v; }

async function submitDispute() {
  const T = STR[S.lang];
  const orderId = S.dispSheet && S.dispSheet.orderId;
  if (!orderId) return;
  const body = { orderId, reasonKey: S.dispReason, comment: S.dispComment.trim() || undefined };
  closeDisputeSheet();
  try {
    // sellerFetch faqat nomi bo'yicha "sotuvchi" — aslida initData bilan
    // yuboradigan umumiy yordamchi, xaridor uchun ham shu ishlatiladi
    await sellerFetch('/api/disputes', { method: 'POST', body: JSON.stringify(body) });
    showToast(T.dispSent);
    await loadDisputes();
    if (S.screen === 'orders') document.getElementById('screen-wrap').innerHTML = renderOrders();
  } catch (e) {
    showToast(e.message);
  }
}

async function loadDisputes() {
  if (!tgInitData()) return;
  try {
    const d = await sellerFetch('/api/disputes');
    if (Array.isArray(d)) S.disputes = d;
  } catch (e) { /* bahs yo'q yoki kirilmagan — jim o'tamiz */ }
}

// Xaridor buyurtma kartochkasidagi bahs bloki
function disputeBlock(o) {
  const T = STR[S.lang];
  const d = disputeFor(o.id);

  if (!d) {
    if (!DISP_ALLOWED.includes(o.statusKey)) return '';
    return `<button data-action="openDisputeSheet" data-arg="${o.id}" style="width:100%;margin-top:9px;height:36px;border-radius:var(--radius-sm);border:1px solid var(--danger-500);background:transparent;font-size:12.5px;font-weight:600;color:var(--danger-500);cursor:pointer">${T.dispProblem}</button>`;
  }

  const open = d.status === 'open';
  return `
  <div style="margin-top:11px;padding-top:11px;border-top:1px solid var(--border-hair)">
    <div style="display:flex;align-items:center;gap:7px">
      <span style="display:inline-flex;align-items:center;height:22px;padding:0 10px;border-radius:999px;font-size:11px;font-weight:700;background:${open ? 'var(--saffron-50)' : 'var(--success-100)'};color:${open ? 'var(--saffron-700)' : '#0d6b45'}">
        ${open ? T.dispOpenBadge : T.dispResolvedBadge}
      </span>
    </div>
    <!-- reason = tayyor sabab + XARIDORNING erkin izohi (disputes.js:49),
         decision = admin matni. Ikkalasi ham tozalanadi. -->
    <div style="font-size:12px;color:var(--text-muted);margin-top:6px;line-height:1.5">${esc(d.reason || '')}</div>
    ${open && !d.photos ? `<div style="font-size:11.5px;color:var(--saffron-700);margin-top:5px">📸 ${T.dispNeedPhoto}</div>` : ''}
    ${d.decision ? `<div style="font-size:12px;color:var(--text-body);margin-top:6px;line-height:1.5"><b>${T.dispDecision}:</b> ${esc(d.decision)}</div>` : ''}
    ${d.refundAmount ? `<div style="font-size:12px;color:var(--text-body);margin-top:3px"><b>${T.dispRefund}:</b> <span style="font-family:var(--font-mono)">${money(d.refundAmount)}</span></div>` : ''}
  </div>`;
}

// ============ SHARH YOZISH (xaridor tomoni) ============
// Sharh faqat mato yetib kelgandan keyin — serverdagi qoida bilan bir xil
// (`REVIEW_ALLOWED_ORDER_STATUS`). `shipped` bu yerda YO'Q: yo'ldagi matoni
// xaridor hali ko'rmagan. Bahs esa `shipped` dan boshlanadi — farq ataylab.
const REV_ALLOWED = ['delivered', 'completed'];

function reviewFor(orderId, productId) {
  return S.myReviews.find(r => r.orderId === orderId && r.productId === productId) || null;
}

function renderReviewSheet() {
  const T = STR[S.lang];
  const sel = S.revSheet;
  const p = sel && byId(sel.productId);
  if (!p) return '';
  return `
  <div data-action="closeReviewSheet" style="position:fixed;inset:0;z-index:60;background:rgba(24,10,8,.42);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)"></div>
  <div style="position:fixed;left:0;right:0;bottom:0;z-index:61;max-height:82vh;display:flex;flex-direction:column;padding:18px 16px calc(18px + env(safe-area-inset-bottom));border-radius:22px 22px 0 0;background:var(--surface-solid);box-shadow:0 -12px 40px -12px rgba(81,1,0,.3)">
    <span style="flex:none;width:38px;height:4px;border-radius:999px;background:var(--ink-100);margin:0 auto 14px"></span>

    <div style="flex:none;font-family:var(--font-display);font-size:19px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em">${T.revTitle}</div>
    <div style="flex:none;font-size:12.5px;color:var(--text-muted);line-height:1.5;margin-top:5px">${T.revSub}</div>

    <div style="flex:none;display:flex;align-items:center;gap:11px;margin-top:14px;padding:11px;border-radius:var(--radius-md);background:var(--glass-fill-strong);border:1px solid var(--border-hair)">
      <span style="flex:none;width:44px;height:44px;border-radius:var(--radius-sm);${vm(p).bgStyle}"></span>
      <span style="flex:1;min-width:0;font-size:14px;font-weight:700;color:var(--text-strong);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name[S.lang]}</span>
    </div>

    <div style="flex:none;display:flex;justify-content:center;gap:6px;margin-top:18px">
      ${[1,2,3,4,5].map(n => `
      <button data-action="setRevStars" data-arg="${n}" aria-label="${n}" style="width:52px;height:52px;border:none;background:transparent;cursor:pointer;font-size:34px;line-height:1;color:${n <= S.revStars ? '#EFA91F' : 'var(--ink-200)'}">★</button>`).join('')}
    </div>
    <div style="flex:none;text-align:center;font-size:12px;color:var(--text-muted);margin-top:4px">${T.revStarsHint}</div>

    <textarea data-input="setRevBody" placeholder="${T.revPh}" rows="3"
      style="flex:none;margin-top:14px;width:100%;padding:12px;border:1px solid var(--border-hair);border-radius:var(--radius-sm);background:var(--glass-fill-strong);font-family:var(--font-sans);font-size:16px;color:var(--text-strong);outline:none;resize:none">${esc(S.revBody)}</textarea>

    <div style="flex:none;display:flex;gap:9px;margin-top:12px">
      <button data-action="closeReviewSheet" style="flex:1;height:50px;border-radius:var(--radius-md);border:1px solid var(--border-hair);background:transparent;font-family:var(--font-sans);font-size:15px;font-weight:600;color:var(--text-muted);cursor:pointer">${T.revCancel}</button>
      <button data-action="submitReview" style="flex:1.4;height:50px;border:none;border-radius:var(--radius-md);background:linear-gradient(135deg,var(--pom-600),var(--pom-800));color:#ffe9db;font-family:var(--font-sans);font-size:15px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">${T.revSend}</button>
    </div>
  </div>`;
}

function openReviewSheet(orderId, productId) {
  S.revSheet = { orderId, productId };
  S.revStars = 5;
  S.revBody = '';
  paintSheet();
}
// Ikki argument bitta `data-arg` ga sig'maydi — `|` bilan kodlanadi va
// shu ingichka o'ram uni ajratadi (`script.js` dagi `openReview` naqshi).
function openReviewArg(arg) {
  const [orderId, productId] = String(arg).split('|');
  openReviewSheet(orderId, productId);
}
function closeReviewSheet() {
  S.revSheet = null;
  paintSheet();
}
function setRevStars(n) {
  S.revStars = n;
  paintSheet();
}
function setRevBody(v) { S.revBody = v; }

async function submitReview() {
  const T = STR[S.lang];
  const sel = S.revSheet;
  if (!sel) return;
  const body = {
    orderId: sel.orderId,
    productId: sel.productId,
    stars: S.revStars,
    body: S.revBody.trim() || undefined,
  };
  closeReviewSheet();
  try {
    await sellerFetch('/api/reviews', { method: 'POST', body: JSON.stringify(body) });
    showToast(T.revSent);
    await loadMyReviews();
    // Mahsulot reytingi serverda qayta hisoblandi — katalogni ham yangilaymiz,
    // aks holda xaridor o'z sharhini yozib, eski reytingni ko'rib turardi
    delete S.prodReviews[sel.productId];
    await loadProductsFromServer();
    if (S.screen === 'orders') document.getElementById('screen-wrap').innerHTML = renderOrders();
  } catch (e) {
    showToast(e.message);
  }
}

async function loadMyReviews() {
  if (!tgInitData()) return;
  try {
    const d = await sellerFetch('/api/reviews?mine=1');
    if (Array.isArray(d)) S.myReviews = d;
  } catch (e) { /* kirilmagan — jim o'tamiz */ }
}

// Mahsulot sahifasidagi ommaviy sharhlar — kirish shart emas
async function loadProductReviews(productId) {
  if (S.prodReviews[productId] !== undefined) return;
  try {
    const r = await fetch('/api/reviews?productId=' + encodeURIComponent(productId));
    if (!r.ok) return;
    const data = apiData(await r.json());
    if (!Array.isArray(data)) return;
    S.prodReviews[productId] = data;
    // Foydalanuvchi hali shu sahifada bo'lsa — qayta chizamiz
    if (S.screen === 'detail' && S.selectedId === productId) {
      const w = document.getElementById('screen-wrap');
      if (w) w.innerHTML = renderDetail();
    }
  } catch (e) { /* sharhsiz ham sahifa ishlaydi */ }
}

// Buyurtma kartochkasidagi baholash bloki — har mahsulot uchun alohida qator
function reviewBlock(o) {
  const T = STR[S.lang];
  if (!REV_ALLOWED.includes(o.statusKey)) return '';

  return `
  <div style="margin-top:11px;padding-top:11px;border-top:1px solid var(--border-hair);display:flex;flex-direction:column;gap:7px">
    ${o.items.map(it => {
      const p = byId(it.id);
      if (!p) return '';
      const done = reviewFor(o.id, it.id);
      return `
      <div style="display:flex;align-items:center;gap:9px">
        <span style="flex:1;min-width:0;font-size:12.5px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name[S.lang]}</span>
        ${done
          ? `<span style="flex:none;display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--text-subtle)">${starsRow(done.stars, 11)} ${T.rated}</span>`
          : `<button data-action="openReviewArg" data-arg="${o.id}|${it.id}" style="flex:none;height:30px;padding:0 13px;border-radius:999px;border:1px solid var(--pom-700);background:transparent;font-size:12px;font-weight:600;color:var(--pom-700);cursor:pointer">★ ${T.rateIt}</button>`}
      </div>`;
    }).join('')}
  </div>`;
}

// ============ EKRAN: MUVAFFAQIYAT ============
function renderSuccess() {
  const T = STR[S.lang];
  return `
  <div style="padding:50px 28px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px">
    <span style="width:88px;height:88px;border-radius:50%;background:linear-gradient(155deg,#a51f13 0%,var(--pom-700) 48%,#480100 100%);display:flex;align-items:center;justify-content:center;color:#ffe9db;box-shadow:0 14px 34px -10px rgba(81,1,0,.5);animation:pop var(--dur-slow) var(--ease-spring)">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span>
    <div style="font-family:var(--font-display);font-size:23px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em">${T.orderPlaced}</div>
    <div style="font-size:14px;color:var(--text-muted);line-height:1.55;max-width:280px">${T.orderPlacedSub}</div>
    <div style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-strong);padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.62);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.55)">${ORDERS[0]?.id || '#LM-—'}</div>
    <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:300px;margin-top:14px">
      <button data-action="tab" data-arg="orders" style="height:50px;border-radius:var(--radius-md);border:none;background:linear-gradient(135deg,var(--pom-600),var(--pom-800));color:#ffe9db;font-size:15px;font-weight:600;cursor:pointer;box-shadow:var(--shadow-sm)">${T.viewOrders}</button>
      <button data-action="tab" data-arg="home" style="height:50px;border-radius:var(--radius-md);border:1px solid var(--glass-border);background:var(--glass-fill-strong);color:var(--text-strong);font-size:15px;font-weight:600;cursor:pointer">${T.continue}</button>
    </div>
  </div>`;
}

// ============ EKRAN: BUYURTMALAR ============
/* ══ BUYURTMA QATORI — KATALOGGA BOG'LANMAYDI (2026-08-14, founder shikoyati) ══
   "o'zimni telegramimdan kirsam buyurtmalar bo'limida hech narsa yo'q,
   boshqa tg'dan kirsam hammasi joyida".

   Sabab: qator BUGUNGI katalogdan chizilardi —
     `const p = byId(it.id); name: p.name[S.lang]`
   `/api/products` esa faqat `status='published'` mahsulotlarni qaytaradi
   (`routes/catalog.js`). Ya'ni buyurtmada e'londan olingan (yoki hali
   tasdiqlanmagan) mahsulot bo'lsa `byId()` `undefined` qaytarib,
   `renderOrders()` BUTUNLAY yiqilardi — ekranda bitta buyurtma ham
   qolmasdi. Nuqson AYNAN shu sababdan hisobga bog'liq edi: nimani
   buyurtma qilganingizga qarab bir hisobda chiqadi, boshqasida yo'q.

   ⚠️ Endi nom va narx BUYURTMA YOZUVIDAN olinadi (`order_items.name`,
   `unit_price` — buyurtma paytidagi snapshot). Katalog faqat RASM uchun
   ishlatiladi, ya'ni mahsulot yo'qolsa qator baribir chiziladi.
   Bu tuzatishning ikkinchi yuzi ham bor: narx o'zgarganda tarixda
   BUGUNGI narx emas, xaridor TO'LAGAN narx turadi.

   ⚠️ `vm()` va `reviewBlock()` bu darsni ALLAQACHON bilardi (`if (!p)`),
   asosiy qator esa bilmasdi — qoida bir joyda o'rganilib, ikkinchisiga
   tarqalmagan. Qorovul: `server/test.js` → Test 30. */
function orderLine(it) {
  const p = byId(it.id);
  const v = vm(p); // `vm()` `null` ni O'ZI qabul qiladi
  return {
    // ⚠️ `esc()` SHART: `it.name` bazadan keladi (sotuvchi yozgan) va `vm()`
    // chegarasidan O'TMAYDI, ya'ni bu yerda tozalanmasa xom matn `innerHTML`
    // ga tushardi. `v.name` esa `vm()` da allaqachon tozalangan — ikki marta
    // qochirilsa foydalanuvchi `&lt;` ko'rib qolardi.
    name: it.name ? esc(it.name) : (v ? v.name : STR[S.lang].itemGone),
    // Rasm faqat katalogda bo'lsa; bo'lmasa neytral fon (soxta rasm emas)
    bgStyle: v ? v.bgStyle : 'background:var(--ink-100)',
    qty: it.qty,
    unit: p ? uShort(p.unit) : '',
    total: (typeof it.unitPrice === 'number' ? it.unitPrice : (p ? p.price : 0)) * it.qty,
  };
}

function renderOrders() {
  const T = STR[S.lang];
  // Yakunlangan holatlar "Tarix"ga tushadi (Sprint 7 da completed/refunded qo'shildi)
  const DONE = ['delivered', 'completed', 'refunded', 'cancelled'];
  const activeOrders = ORDERS.filter(o => !DONE.includes(o.statusKey));
  const pastOrders   = ORDERS.filter(o => DONE.includes(o.statusKey));
  const list = S.ordersTab === 'active' ? activeOrders : pastOrders;

  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:14px">
    <div style="display:flex;gap:4px;padding:4px;border-radius:var(--radius-md);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55)">
      <button data-action="setOrdersTab" data-arg="active" style="flex:1;height:36px;border:none;border-radius:var(--radius-sm);font-size:13.5px;font-weight:600;cursor:pointer;background:${S.ordersTab==='active'?'var(--surface-solid)':'transparent'};color:${S.ordersTab==='active'?'var(--text-strong)':'var(--text-muted)'};box-shadow:${S.ordersTab==='active'?'0 3px 8px -3px rgba(81,1,0,.3)':'none'}">${T.active}</button>
      <button data-action="setOrdersTab" data-arg="past" style="flex:1;height:36px;border:none;border-radius:var(--radius-sm);font-size:13.5px;font-weight:600;cursor:pointer;background:${S.ordersTab==='past'?'var(--surface-solid)':'transparent'};color:${S.ordersTab==='past'?'var(--text-strong)':'var(--text-muted)'};box-shadow:${S.ordersTab==='past'?'0 3px 8px -3px rgba(81,1,0,.3)':'none'}">${T.past}</button>
    </div>

    ${list.length === 0 ? `<div style="text-align:center;padding:40px;color:var(--text-muted)">${T.noActive}</div>` :
    list.map(o => {
      const tone = STATUS_TONE[o.statusKey] || 'neutral';
      const [sbg,sfg] = STATUS_COL[tone];
      const stTxt = (STATUS_TXT[o.statusKey] || STATUS_TXT.pending)[S.lang];
      const lines = o.items.map(it => orderLine(it));
      // Summa SERVERDAN — u buyurtma paytida hisoblangan va o'zgarmaydi.
      // Zaxira (eski keshdagi buyurtmalar) qatorlardan yig'iladi.
      const total = typeof o.total === 'number'
        ? o.total
        : lines.reduce((s, l) => s + l.total, 0);
      return `
      <div style="padding:14px;border-radius:var(--radius-lg);background:rgba(255,255,255,.62);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:11px">
          <span style="font-family:var(--font-mono);font-size:13.5px;font-weight:600;color:var(--text-strong)">${o.id}</span>
          <span style="display:inline-flex;align-items:center;height:24px;padding:0 11px;border-radius:999px;font-size:11.5px;font-weight:600;background:${sbg};color:${sfg}">${stTxt}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="position:relative;flex:none;width:52px;height:52px;border-radius:var(--radius-sm);${lines[0].bgStyle}">
            ${lines.length>1 ? `<span style="position:absolute;right:-6px;bottom:-6px;min-width:24px;height:24px;padding:0 6px;border-radius:999px;background:var(--ink-900);color:#fff;font-family:var(--font-mono);font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;border:2px solid #fff">+${lines.length-1}</span>` : ''}
          </span>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:700;color:var(--text-strong);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${lines[0].name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${lines.length} ${T.items} · ${o.date[S.lang]}</div>
          </div>
          <span style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--text-strong)">${money(total)}</span>
        </div>
        <div style="display:flex;gap:9px;margin-top:13px">
          <button data-action="toggleTrack" data-arg="${o.id}" style="flex:1;height:38px;border-radius:var(--radius-sm);border:1px solid var(--glass-border);background:var(--glass-fill-strong);font-size:13px;font-weight:600;color:var(--text-strong);cursor:pointer">${T.track}</button>
          <button data-action="reorderOrder" data-arg="${o.id}" style="flex:1;height:38px;border-radius:var(--radius-sm);border:1px solid var(--border-hair);background:transparent;font-size:13px;font-weight:600;color:var(--teal-600);cursor:pointer">${T.reorder}</button>
        </div>
        ${S.trackOpen[o.id] ? (() => {
          const stageIdx = STATUS_STAGES.indexOf(o.statusKey);
          return `
        <div style="display:flex;margin-top:13px;padding-top:13px;border-top:1px solid var(--border-hair)">
          ${STATUS_STAGES.map((st,i) => `
          <div style="flex:1;text-align:center;position:relative">
            ${i>0 ? `<span style="position:absolute;z-index:0;top:9px;right:50%;width:100%;height:2px;background:${i<=stageIdx?'var(--pom-700)':'var(--ink-100)'}"></span>` : ''}
            <span style="position:relative;z-index:1;display:flex;width:20px;height:20px;margin:0 auto 5px;border-radius:50%;align-items:center;justify-content:center;font-size:10px;font-weight:700;background:${i<=stageIdx?'var(--pom-700)':'var(--ink-100)'};color:${i<=stageIdx?'#fff':'var(--text-subtle)'}">${i<stageIdx?'✓':i+1}</span>
            <div style="font-size:9.5px;line-height:1.3;color:${i<=stageIdx?'var(--text-strong)':'var(--text-subtle)'};font-weight:${i===stageIdx?700:500}">${STATUS_TXT[st][S.lang]}</div>
          </div>`).join('')}
        </div>`;
        })() : ''}
        ${disputeBlock(o)}
        ${reviewBlock(o)}
      </div>`;
    }).join('')}
  </div>`;
}

// ============ EKRAN: BILDIRISHNOMALAR ============
function renderNotifications() {
  const T = STR[S.lang];
  return `
  <div style="padding:60px 28px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px">
    <span style="width:64px;height:64px;border-radius:50%;background:var(--glass-fill-strong);border:1px solid var(--glass-border);display:flex;align-items:center;justify-content:center;color:var(--text-muted)">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M18 8.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10.2 19.5a2 2 0 0 0 3.6 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </span>
    <div style="font-size:15px;font-weight:700;color:var(--text-strong)">${T.notifEmpty}</div>
    <div style="font-size:13px;color:var(--text-muted);max-width:240px;line-height:1.5">${T.notifEmptySub}</div>
  </div>`;
}

// ============ TELEGRAM PROFIL KARTASI ============
// ============ PROFIL SURATI (2026-08-13) ============
// ⚠️ `<img src="/api/me/photo">` ISHLATIB BO'LMAYDI va sabab arxitekturaviy:
// Mini App'da kimlik `X-Telegram-Init-Data` SARLAVHASIDA yuradi, `<img>` esa
// sarlavha yubora olmaydi — so'rov 401 bilan qaytardi. Shuning uchun surat
// `fetch` bilan olinadi va blob havolasiga aylantiriladi.
//
// ⚠️ BIR MARTA so'raladi. `render()` profil har ochilganda chaqiriladi;
// holat kuzatilmasa har ochilishda yangi so'rov ketardi. `yoq` holati ham
// eslab qolinadi — avatari yo'q odam uchun bekor so'rov TAKRORLANMASIN.
let _avaUrl = null;
let _avaHolat = 'nomalum';        // nomalum | yuklanmoqda | bor | yoq

/* 🔴 `URL.createObjectURL` ISHLATILMAYDI — saytdagi bilan AYNI sabab
   (`script.js` → `blobToDataUrl` izohi): CSP dagi `img-src` ro'yxatida
   `blob:` YO'Q va brauzer rasmni jimgina bloklaydi. `data:` bor. */
function blobToDataUrl(b) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => rej(new Error('rasm o\'qilmadi'));
    fr.readAsDataURL(b);
  });
}

async function mountAvatar() {
  if (_avaHolat !== 'nomalum') return;
  if (!document.getElementById('tg-ava')) return;   // ekranda avatar joyi yo'q
  _avaHolat = 'yuklanmoqda';
  try {
    const initData = tgInitData();
    const r = await fetch('/api/me/photo', {
      credentials: 'same-origin',                   // saytda sessiya cookie'da
      headers: initData ? { 'X-Telegram-Init-Data': initData } : {},
    });
    // 404 — surat YO'Q, bu xato emas: Telegram'da avatar qo'ymagan odam.
    if (!r.ok) { _avaHolat = 'yoq'; return; }
    _avaUrl = await blobToDataUrl(await r.blob());
    _avaHolat = 'bor';
    // Faqat profil ekrani qayta chiziladi — butun `render()` chaqirilsa
    // ochiq sheet yoki skroll holati yo'qolardi.
    if (S.screen === 'profile') {
      const w = document.getElementById('screen-wrap');
      if (w) w.innerHTML = renderProfile();
    }
  } catch (e) {
    // Tarmoq uzilishi — bosh harf qoladi. Alertga CHIQARILMAYDI: avatar
    // bezak, uning yo'qligi nosozlik emas va Telegram'ni to'ldirardi.
    _avaHolat = 'yoq';
  }
}

function renderTgCard() {
  const T = STR[S.lang];
  const u = S.tgUser;
  if (!u) {
    return `
    <div style="display:flex;align-items:center;gap:10px;padding:13px 14px;border-radius:var(--radius-lg);background:rgba(255,255,255,.45);border:1px dashed var(--glass-border);color:var(--text-muted);font-size:12px">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-subtle)"><path d="M21 4L2.5 11.5l6 2 2 6.5L15 15l5-11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      ${T.tgNotConnected}
    </div>`;
  }
  const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || T.tgUserFallback;
  // Ism va rasm manzili Telegram profilidan keladi — foydalanuvchi ularni
  // o'zi yozadi, ya'ni ishonchsiz matn.
  //
  // ⚠️ Avatar UCH pog'onali (2026-08-13, founder: "profil egasini rasm
  // telegramdagi rasmdan olinsin"):
  //   1) `_avaUrl` — SERVERDAN olingan surat (`/api/me/photo`, `mountAvatar`),
  //      `data:` ko'rinishida.
  //   2) bosh harf — surat umuman bo'lmasa.
  // Bosh harf ZAXIRA sifatida qoladi va bu ataylab: surat kelmasa bo'sh
  // doira turardi, ya'ni "yuklanmadi" bilan "avatari yo'q" ajralmasdi.
  //
  // 🔴 `u.photo_url` ATAYLAB ISHLATILMAYDI va bu O'LCHOVDAN kelib chiqqan
  // qaror. Birinchi variantda u birinchi pog'ona edi
  // (`u.photo_url || _avaUrl`) va ikkita zarar keltirdi:
  //   • u TELEGRAM CDN havolasi, Mini App CSP sining `img-src` ro'yxatida
  //     esa faqat `'self' data: cdn.lolamarket.uz …` bor — brauzer rasmni
  //     BLOKLAYDI (o'lchandi: 2026-08-13, jonli sarlavha);
  //   • `photo_url` bor bo'lgani uchun zaxira `<span id="tg-ava">`
  //     chizilmasdi, ya'ni `mountAvatar()` darrov qaytib ketardi va
  //     bizning endpoint UMUMAN chaqirilmasdi — ikkinchi pog'ona ham
  //     yopilib qolardi.
  // Natijada avatar SAYTDA ishlab, MINI APP'da ishlamasdi — bir yuzda
  // ishlab ikkinchisida ishlamaydigan yechim, CLAUDE.md aynan shundan
  // ogohlantiradi.
  // ⚠️ Yozilgan izohning O'ZI ham noto'g'ri edi: «`photo_url` bizdagi
  // kirish nuqtalarida odatda YO'Q» deb TEKSHIRMASDAN yozilgandi —
  // amalda u BOR edi. Tekshirilmagan da'vo yana ish yo'nalishini
  // belgilab qo'ydi.
  const suratSrc = _avaUrl;
  const avatar = suratSrc
    ? `<img src="${esc(suratSrc)}" style="width:48px;height:48px;border-radius:14px;object-fit:cover;flex:none" alt="">`
    : `<span id="tg-ava" style="flex:none;width:48px;height:48px;border-radius:14px;background:linear-gradient(150deg,#37AEE2,#1E96C8);color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:18px">${esc(fullName[0].toUpperCase())}</span>`;
  return `
  <div style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:var(--radius-lg);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);border:1px solid var(--glass-border);box-shadow:var(--glass-shadow)">
    ${avatar}
    <div style="flex:1;min-width:0">
      <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--text-strong);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(fullName)}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:1px">${u.username ? '@' + esc(u.username) : ''}</div>
    </div>
    <span style="flex:none;display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 10px;border-radius:999px;background:rgba(55,174,226,.13);color:#1E96C8;font-size:11px;font-weight:600;white-space:nowrap">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 4L2.5 11.5l6 2 2 6.5L15 15l5-11z"/></svg>${T.tgVerified}
    </span>
  </div>`;
}

// ============ PROFIL QATORI ============
// Profildagi HAMMA bo'lim SHU funksiyadan chiqadi (founder 2026-08-13:
// "profilni shunday tartibla" — namunada bo'limlar bir xil balandlikdagi
// alohida kartalar bo'lib turadi). Sabab uslubdan kattaroq: bir xil
// qatorda ko'z faqat YOZUVni o'qiydi, har xil balandlikdagi bloklarda esa
// avval shaklni ajratadi.
//
// ⚠️ `flex:none` SHART. Profil tanasi `display:flex;flex-direction:column`,
// ya'ni qator O'Z mazmuniga emas, QOLGAN JOYGA qarab siqiladi — bu loyihada
// uch marta tishlagan (`<picture>`, `.addr-map`, `.contact-block`) va uchala
// safar ham JIMGINA bo'lgan: xato yo'q, DOM'da element bor, ekranda esa
// mazmun kesilgan.
const ROW_BOX = 'flex:none;display:flex;align-items:center;gap:13px;width:100%;box-sizing:border-box;min-height:62px;text-align:left;padding:13px 14px;border-radius:var(--radius-md);background:rgba(255,255,255,.6);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);border:1px solid rgba(255,255,255,.55);box-shadow:0 5px 16px -12px rgba(81,1,0,.12);font-family:var(--font-sans)';
const ROW_CHEV = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-subtle)"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Profil belgilari — TO'LDIRILGAN (founder 2026-08-13). Ingichka chiziqli
// belgi 21px da yorug' fonda yo'qolib ketardi; to'ldirilgani esa qator
// boshida aniq langar bo'lib turadi.
const ICO = {
  lang: '<svg width="21" height="21" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" fill="none" stroke="#fff" stroke-width="1.5" opacity=".92"/></svg>',
  bell: '<svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22a2.3 2.3 0 0 0 2.3-2.3H9.7A2.3 2.3 0 0 0 12 22zm7.4-5.6V11a7.4 7.4 0 0 0-5.6-7.2v-.6a1.8 1.8 0 1 0-3.6 0v.6A7.4 7.4 0 0 0 4.6 11v5.4L3 18v.9h18V18l-1.6-1.6z"/></svg>',
  pin: '<svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2a7.4 7.4 0 0 0-7.4 7.4C4.6 14.8 12 22 12 22s7.4-7.2 7.4-12.6A7.4 7.4 0 0 0 12 2zm0 10.1a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4z"/></svg>',
  chat: '<svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2c-5.1 0-9.2 3.5-9.2 7.9 0 2.4 1.2 4.6 3.2 6.1L4.9 21l4.3-1.8c.9.2 1.8.3 2.8.3 5.1 0 9.2-3.5 9.2-7.9s-4.1-7.9-9.2-7.9z"/></svg>',
  share: '<svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><circle cx="18" cy="5" r="2.7"/><circle cx="6" cy="12" r="2.7"/><circle cx="18" cy="19" r="2.7"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>',
  heart: '<svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.8s-6.9-4.3-9-8a5.2 5.2 0 0 1-.5-3.7A4.8 4.8 0 0 1 6.3 5.5c1.9 0 3.4 1 4.3 2.3.4.6 1 .6 1.4 0 .9-1.3 2.4-2.3 4.3-2.3a4.8 4.8 0 0 1 3.8 3.6 5.2 5.2 0 0 1-.5 3.7c-2.1 3.7-9 8-9 8z"/></svg>',
};

// Til — SAYTDAGI naqsh (`script.js` → `toggleLang`): bitta qator joriy tilni
// bayrog'i bilan ko'rsatadi, bosilsa ikkinchisiga o'tadi. Til NOMI tarjima
// jadvalida emas — har bir til O'Z tilida yoziladi va tarjimasi bo'lmaydi.
const LANGS = {
  uz: { flag: '🇺🇿', name: "O'zbek" },
  ru: { flag: '🇷🇺', name: 'Русский' },
};

function profileRow(o) {
  const teg = o.action ? 'button' : 'div';
  return `
  <${teg} ${o.action ? `data-action="${o.action}"` : ''} style="${ROW_BOX}${o.action ? ';cursor:pointer' : ''}">
    <span style="flex:none;width:22px;height:22px;display:flex;align-items:center;justify-content:center;color:var(--pom-700)">${o.ico}</span>
    <span style="flex:1;min-width:0">
      <span style="display:block;font-size:14.5px;font-weight:700;color:var(--text-strong);letter-spacing:-.01em">${o.label}</span>
      ${o.sub ? `<span style="display:block;font-size:12px;color:var(--text-muted);margin-top:2px;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${o.sub}</span>` : ''}
    </span>
    ${o.right || ''}
    ${o.chev ? ROW_CHEV : ''}
  </${teg}>`;
}

// ============ PROFIL: MENING MANZILIM ============
// Doimiy BTS olish nuqtasi. Tanlansa bazada saqlanadi (`/api/pickup-point`)
// va checkout uni oldindan qo'yadi — B2B xaridor deyarli doim bitta
// nuqtadan oladi.
//
// ⚠️ Nuqta TANLANMAGAN bo'lsa soxta manzil ko'rsatilmaydi: qator
// "tanlanmagan" deb turadi (`NULL` reyting qoidasi bilan bitta oila —
// yo'qlik KO'RINSIN). To'liq manzil, ish vaqti va karta bir bosishda —
// tanlash oynasida; qatorda esa xaridorga kerak bo'ladigan yagona javob
// turadi: "qaysi nuqta".
function renderMyAddress() {
  const T = STR[S.lang];
  const p = btsById(S.btsPoint);
  return profileRow({
    ico: ICO.pin,
    label: T.myAddr,
    sub: p ? p.name[S.lang] : T.myAddrNone,
    chev: true,
    action: 'openAddrPicker',
  });
}

// ============ PROFIL: BIZ BILAN BOG'LANISH ============
// ⚠️ TELEGRAM HAVOLASI ODDIY `<a>` EMAS. Mini App Telegram'ning O'Z
// WebView'i ichida ishlaydi va u yerdagi `t.me/...` havolasi ichki brauzerda
// ochilib, foydalanuvchi chatga TUSHMAY qolardi. `openTelegramLink()` esa
// Telegram'ning o'ziga uzatadi — chat HAQIQATAN ochiladi (founder sharti:
// "faqat telegramga haqiqatan o'tadigan qil"). Telegram tashqarisida
// (brauzerda ochilgan Mini App) zaxira yo'l — oddiy `window.open`.
//
// 🔴 **TELEFON — `tel:` NING O'ZI YETARLI EMAS** (2026-08-13, founder
// "qo'ng'iroq tugmasi ishlamayapti" deganidan keyin tuzatildi). Bu yerda
// ilgari "`tel:` ni WebView ham, brauzer ham o'zi to'g'ri boshqaradi" deb
// yozilgandi — TEKSHIRILMAGAN DA'VO edi: Telegram WebView'i `http(s)` dan
// boshqa sxemani ko'pincha umuman ochmaydi, kompyuter brauzerida esa
// telefon ilovasi bo'lmasa bosish jimgina hech narsa qilmaydi. Xato yo'q,
// konsol toza, tugma esa o'lik.
//
// Yechim muhitni ANIQLASHGA tayanmaydi (u yana bir taxmin bo'lardi):
// havola `tel:` bo'lib qoladi — qayerda ishlasa o'sha yerda ishlayveradi —
// va bosilganda raqam buferga HAM nusxalanadi. `preventDefault` yo'q.
// Profildagi qator — "Mening manzilim" bilan BIR XIL yo'l: bosilsa alohida
// oyna ochiladi (founder 2026-08-13). Ilgari bo'lim joyida ochilardi.
function renderContact() {
  const T = STR[S.lang];
  return profileRow({
    ico: ICO.chat,
    label: T.contactT,
    sub: T.contactSub,
    chev: true,
    action: 'openContactSheet',
  });
}

// Ikki yo'l — alohida oynada (`paintSheet` orqali, BTS oynasi bilan bitta
// mexanizm). Oyna ochilganda profil QAYTA CHIZILMAYDI: ekran ortida turaveradi
// va yopilganda skroll o'z joyida qoladi.
function renderContactSheet() {
  const T = STR[S.lang];
  const yol = 'display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;text-align:left;cursor:pointer;text-decoration:none;padding:13px;border:1px solid var(--glass-border-soft);border-radius:var(--radius-md);background:rgba(255,255,255,.62);font-family:var(--font-sans)';
  const belgi = 'flex:none;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center';
  const qiymat = 'display:block;font-size:15px;font-weight:700;color:var(--text-strong);letter-spacing:-.01em';
  const izoh = 'display:block;font-size:12px;color:var(--text-muted);margin-top:2px';
  const oq = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-subtle)"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  return `
  <div data-action="closeContactSheet" style="position:absolute;inset:0;background:rgba(23,26,48,.34);z-index:60;animation:fade var(--dur-base) var(--ease-out)"></div>
  <div style="position:absolute;left:0;right:0;bottom:0;z-index:61;display:flex;flex-direction:column;border-radius:var(--radius-xl) var(--radius-xl) 0 0;padding:10px 14px calc(18px + env(safe-area-inset-bottom));backdrop-filter:var(--glass-blur);-webkit-backdrop-filter:var(--glass-blur);background:var(--glass-tint);box-shadow:var(--glass-spec),0 -12px 40px -8px rgba(81,1,0,.28);animation:sheetUp var(--dur-base) var(--ease-out)">
    <div style="width:38px;height:4px;border-radius:99px;background:var(--ink-200);margin:0 auto 12px;flex:none"></div>
    <div style="flex:none;font-family:var(--font-display);font-size:17px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em">${T.contactT}</div>
    <div style="flex:none;font-size:12px;color:var(--text-muted);margin:3px 0 13px">${T.contactSub}</div>

    <div style="flex:none;display:flex;flex-direction:column;gap:9px">
      <a class="tap44" href="tel:${SUPPORT.tel}" data-action="copySupportPhone" style="${yol}">
        <span style="${belgi};background:var(--pom-100);color:var(--pom-700)">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 2.5a1.9 1.9 0 0 1 2.5.8l1.4 2.6a1.9 1.9 0 0 1-.4 2.3L8.6 9.6a14.6 14.6 0 0 0 5.8 5.8l1.4-1.5a1.9 1.9 0 0 1 2.3-.4l2.6 1.4a1.9 1.9 0 0 1 .8 2.5l-.8 1.7a2.4 2.4 0 0 1-2.7 1.3A19.6 19.6 0 0 1 3.6 5.2a2.4 2.4 0 0 1 1.3-2.7z"/></svg>
        </span>
        <span style="flex:1;min-width:0">
          <span style="${qiymat};font-family:var(--font-mono);font-weight:600;letter-spacing:0">${SUPPORT.telLabel}</span>
          <span style="${izoh}">${T.contactCall}</span>
        </span>${oq}
      </a>
      <button data-action="openSupportTg" style="${yol}">
        <span style="${belgi};background:rgba(55,174,226,.14);color:#1E96C8">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M21 4L2.5 11.5l6 2 2 6.5L15 15l5-11z"/></svg>
        </span>
        <span style="flex:1;min-width:0">
          <span style="${qiymat}">${T.contactTgWay}</span>
          <span style="${izoh}">@${SUPPORT.tgUser}</span>
        </span>${oq}
      </button>
    </div>
  </div>`;
}

function openContactSheet() {
  S.contactSheet = true;
  paintSheet();
}
function closeContactSheet() {
  S.contactSheet = false;
  paintSheet();
}

// ============ EKRAN: PROFIL ============
// TARTIB (founder namunasi, 2026-08-13) — uch qavat, aralashmaydi:
//   1) KIMLIGI      — Telegram kartasi + korxona kartasi (aloqa shu kartaning
//                     ICHIDA: telefon va pochta korxonaning o'z ma'lumoti,
//                     alohida karta bo'lib turishi shart emas edi);
//   2) BO'LIMLAR    — bir xil balandlikdagi alohida qatorlar (`profileRow`);
//   3) AMAL + IZ    — bitta to'ldirilgan tugma (sotuvchi kabineti) va eng
//                     pastda brend izi.
// "Sozlamalar" sarlavhasi OLIB TASHLANDI: qatorlarning o'zi nima ekanini
// aytadi, sarlavha esa ro'yxatni ikkiga bo'lib ko'rsatardi.
//
// ⚠️ BU YERDA "HISOBDAN CHIQISH" TUGMASI YO'Q va u ATAYLAB yo'q
// (2026-08-14, founder shikoyati "chiqish ishlamayapti" dan keyin).
// O'LCHANDI: tugma HAQIQATAN ham o'lik edi — unda `data-action` umuman
// yo'q edi, delegatsiya esa faqat `[data-action]` ni ushlaydi. Lekin
// tuzatish uni "ishlaydigan qilish" EMAS: Mini App'da chiqiladigan
// sessiya MAVJUD EMAS. Kimlik har ochilishda Telegram imzolagan
// `initData` dan olinadi (`loginTelegram()`), token ham, cookie ham
// yo'q — ya'ni o'chiradigan narsaning O'ZI yo'q va keyingi HAR BIR
// so'rov baribir `initData` bilan ketadi. "Chiqdingiz" degan ekran
// server sizni AYNAN o'sha odam deb tanib turganda ko'rsatilardi —
// bu **jimgina yolg'on**, ya'ni yo'qlikdan yomonroq.
// Saytda esa tugma QOLADI va u yerda HAQIQIY: `POST /api/auth/web/logout`
// HttpOnly cookie sessiyani o'ldiradi (`script.js` → `logout()`).
// Farq uslubda emas, KIMLIK MANBAIDA — ikki yuz bir xil ko'rinishi
// shart emas. Qorovul: `server/test.js` → Test 33.
//
// ⚠️ Bu yerda VERSIYA RAQAMI yo'q (namunada bor). Klientda haqiqiy versiya
// satri mavjud emas, o'ylab topilgani esa "panelda o'ylab topilgan raqam
// ko'rsatilmasin" qoidasiga tushadi: noto'g'ri raqam ishonch uyg'otadi,
// yo'qligi esa savol tug'diradi.
function renderProfile() {
  const T = STR[S.lang];
  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:10px">
    ${renderTgCard()}

    <div style="flex:none;display:flex;flex-direction:column;border-radius:var(--radius-lg);background:var(--glass-fill-strong);backdrop-filter:var(--blur-md);-webkit-backdrop-filter:var(--blur-md);border:1px solid var(--glass-border);box-shadow:var(--glass-shadow);overflow:hidden">
      <div style="display:flex;align-items:center;gap:14px;padding:16px">
        <span style="flex:none;width:54px;height:54px;border-radius:17px;background:linear-gradient(150deg,var(--pom-700),var(--pom-800));color:#ffe9db;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:21px">${COMPANY.initials}</span>
        <div style="flex:1;min-width:0">
          <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text-strong);letter-spacing:-.01em">${COMPANY.name[S.lang]}</div>
          <div style="font-size:12.5px;color:var(--text-muted);margin-top:2px">${COMPANY.role[S.lang]} · ${COMPANY.since[S.lang]}</div>
        </div>
        <button style="flex:none;width:36px;height:36px;border-radius:10px;border:1px solid var(--glass-border);background:var(--glass-fill);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-body)">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 20h4L18 10l-4-4L4 16v4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 6l4 4" stroke="currentColor" stroke-width="2"/></svg>
        </button>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-top:1px solid var(--border-hair)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-subtle)"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        <span style="flex:1;min-width:0;font-size:13.5px;color:var(--text-body)">${S.tgPhone || COMPANY.phone}</span>
        ${(!S.tgPhone && inTelegram) ? `<button data-action="shareContact" style="flex:none;font-size:12px;font-weight:600;color:var(--teal-600);background:none;border:none;cursor:pointer">${T.shareContact}</button>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-top:1px solid var(--border-hair)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="flex:none;color:var(--text-subtle)"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M4 7l8 6 8-6" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
        <span style="flex:1;min-width:0;font-size:13.5px;color:var(--text-body)">${COMPANY.email}</span>
      </div>
    </div>

    ${profileRow({
      ico: ICO.heart,
      label: T.savedT,
      // ⚠️ Son BAZADAN emas, ro'yxatning O'ZIDAN olinadi (`renderSaved`
      // bilan AYNI filtr) — aks holda "3 ta" deb turib ichida 2 tasi
      // chiqadigan holat bo'lardi: o'chgan e'lonning id'si `S.liked` da
      // qolib ketishi mumkin. Nol bo'lsa son UMUMAN ko'rsatilmaydi
      // (o'ylab topilgan raqam emas, YO'QLIK ko'rinsin).
      right: (() => {
        const n = PRODUCTS.filter(p => S.liked[p.id]).length;
        return n ? `<span style="flex:none;font-family:var(--font-mono);font-size:13.5px;font-weight:600;color:var(--text-muted)">${n}</span>` : '';
      })(),
      chev: true,
      action: 'openSaved',
    })}
    ${profileRow({
      ico: ICO.lang,
      label: T.language,
      right: `<span style="flex:none;display:flex;align-items:center;gap:7px;font-size:14px;font-weight:600;color:var(--text-muted)">
        <span aria-hidden="true" style="font-size:17px;line-height:1">${LANGS[S.lang].flag}</span>${LANGS[S.lang].name}
      </span>`,
      chev: true,
      action: 'toggleLangUi',
    })}
    ${profileRow({
      ico: ICO.bell,
      label: T.notifications,
      right: `<span class="tap44" data-action="toggleNotif" style="cursor:pointer;width:44px;height:26px;border-radius:999px;background:${S.notif?'var(--pom-700)':'var(--ink-200)'};position:relative;flex:none;transition:background var(--dur-base) var(--ease-out)"><span style="position:absolute;top:3px;${S.notif?'right':'left'}:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:var(--shadow-sm);transition:left var(--dur-base) var(--ease-out),right var(--dur-base) var(--ease-out)"></span></span>`,
    })}
    ${renderMyAddress()}
    ${renderContact()}
    ${profileRow({
      ico: ICO.share,
      label: T.social,
      right: `<a class="tap44" href="https://t.me/lolamarket_uz" target="_blank" rel="noopener" style="flex:none;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--text-strong);background:var(--glass-fill-strong);border:1px solid var(--glass-border);text-decoration:none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>
        </a>
        <a class="tap44" href="https://instagram.com/lolamarket.uz" target="_blank" rel="noopener" style="flex:none;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--text-strong);background:var(--glass-fill-strong);border:1px solid var(--glass-border);text-decoration:none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/></svg>
        </a>`,
    })}

    ${S.role === 'seller' ? `
    <button data-action="enterSellerMode" style="flex:none;display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;text-align:left;cursor:pointer;margin-top:6px;padding:16px;border:none;border-radius:var(--radius-md);background:linear-gradient(135deg,var(--pom-600),var(--pom-800));color:#ffe9db;box-shadow:0 10px 22px -14px rgba(81,1,0,.9);font-family:var(--font-sans)">
      <span style="flex:1;min-width:0">
        <span style="display:block;font-size:15px;font-weight:700;letter-spacing:-.01em">${T.toSeller}</span>
        ${S.seller?.name?.[S.lang] ? `<span style="display:block;font-size:12px;opacity:.78;margin-top:2px">${S.seller.name[S.lang]}</span>` : ''}
      </span>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style="flex:none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>` : ''}

    <div style="flex:none;display:flex;flex-direction:column;align-items:center;gap:7px;margin-top:14px">
      <img src="assets/lola-mark.png" width="40" height="40" alt="" style="border-radius:12px;opacity:.92">
      <div style="font-size:11px;color:var(--text-subtle)">© 2026 LolaMarket</div>
    </div>
  </div>`;
}

/* ══ ♡ TUGMASI — BITTA JOYDA (2026-08-14, founder shikoyati) ══
   "yoqtirma tugmasi mahsulot kartochkalarida yo'qolib qolgan ba'zilarida".
   O'LCHANDI va rost bo'lib chiqdi: bosh ekranda 15 kartochkadan 4 tasida
   ♡ bor edi ("Tavsiya etiladi" — `homeCard`), 11 tasida yo'q ("Barcha
   matolar" — `productCard`). Ya'ni tugma AYNI EKRANDA, aynan bir xil
   ko'rinishdagi kartochkalarning bir qismida bor, bir qismida yo'q edi.
   Saqlanganlar ekrani ham `productCard` chizadi — sevimlini o'sha yerning
   O'ZIDA ro'yxatdan chiqarib bo'lmasdi, mahsulotni ochish kerak bo'lardi.

   ⚠️ Sabab — tugmaning yo'qolishi emas, IKKI NUSXA kartochka funksiyasi:
   ♡ faqat `homeCard` ichiga yozilgan, `productCard` ga esa hech qachon
   qo'shilmagan. Shuning uchun tuzatish tugmani ikkinchi marta ko'chirib
   yozish EMAS — u shu yerga, bitta manbaga chiqarildi. Uchinchi kartochka
   turi paydo bo'lsa ham shu funksiyani chaqiradi.
   Qorovul: `server/test.js` → Test 29 (kartochka funksiyalarini o'zi
   topadi, ro'yxat qo'lda yozilmaydi). */
function likeButton(p) {
  return `
      <button data-action="toggleLike" data-arg="${p.id}" aria-label="${STR[S.lang].savedT}" aria-pressed="${p.liked}" style="position:absolute;top:8px;right:8px;width:32px;height:32px;border-radius:50%;border:1px solid rgba(255,255,255,.6);background:rgba(255,255,255,.42);backdrop-filter:blur(10px) saturate(160%);-webkit-backdrop-filter:blur(10px) saturate(160%);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px -2px rgba(23,26,48,.28),inset 0 1px 0 rgba(255,255,255,.8);cursor:pointer;padding:0">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="${p.heartFill}" style="color:${p.heartStroke}"><path d="M12 20.8s-6.9-4.3-9-8a5.2 5.2 0 0 1-.5-3.7A4.8 4.8 0 0 1 6.3 5.5c1.9 0 3.4 1 4.3 2.3.4.6 1 .6 1.4 0 .9-1.3 2.4-2.3 4.3-2.3a4.8 4.8 0 0 1 3.8 3.6 5.2 5.2 0 0 1-.5 3.7c-2.1 3.7-9 8-9 8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      </button>`;
}

// ============ MAHSULOT KARTA — KATALOG (badge + supplier/verified + meta) ============
function productCard(p) {
  return `
  <div data-action="openProduct" data-arg="${p.id}" style="cursor:pointer;background:var(--glass-fill);backdrop-filter:var(--blur-lg);-webkit-backdrop-filter:var(--blur-lg);border:1px solid var(--glass-border-soft);border-radius:var(--radius-lg);box-shadow:0 6px 16px -12px rgba(81,1,0,.16),0 1px 2px rgba(23,26,48,.04);overflow:hidden;display:flex;flex-direction:column">
    <div class="card-media"${p.video ? ` data-video="${p.video}"${p.videoPoster ? ` data-poster="${p.videoPoster}"` : ''}` : ''} style="height:230px;${p.bgStyle}">
      ${p.badgeShow ? `<span style="position:absolute;top:8px;left:8px;display:inline-flex;align-items:center;height:21px;padding:0 8px;border-radius:999px;font-size:10.5px;font-weight:600;background:${p.badgeBg};color:${p.badgeFg}">${p.badge}</span>` : ''}
      ${likeButton(p)}
    </div>
    <div style="padding:10px 11px 11px;display:flex;flex-direction:column;gap:6px">
      <div style="font-family:var(--font-display);font-size:13.5px;font-weight:700;color:var(--text-strong);line-height:1.2;letter-spacing:-.01em">${p.name}</div>
      <div style="display:flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--text-strong);line-height:1.3">
        <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.supplier}</span>
        ${p.verified ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="var(--pom-700)" style="flex:none"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.3l.9-2.9L3 10.5l2.6-1.5 1-2.8 3 .2z"/><path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:1px">
        <span style="font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;color:var(--text-subtle)">${p.perUnitLabel}</span>
        <span style="font-family:var(--font-mono);font-size:15.5px;font-weight:600;color:var(--text-strong)">${p.priceLabel}</span>
      </div>
      ${catalogQtyControl(p)}
    </div>
  </div>`;
}

/* ══ KARTOCHKA USTIDA 3 SONIYA — IKKINCHI MEDIA (2026-08-13, founder) ══
   "sichqoncha mahsulot ustida 3 sekund tursa, ikkinchi media bo'lsa
   ko'rsatilsin — video bo'lsa ham". Saytdagi `hoverMediaArm` bilan AYNI
   mantiq; ikkala yuz uchun bitta xulq.

   ⚠️ FAQAT SICHQONCHALI muhitda armlanadi (`hover: hover`). Telefonda
   "hover" barmoq bosilganda ham hosil bo'ladi, `mouseleave` esa
   kelmasligi mumkin — video ochilib qolib, yopilmasdi. Telegram
   DESKTOP'da sichqoncha bor, ya'ni funksiya u yerda ishlaydi.

   ⚠️ Video KECHIKIB yuklanadi va chiqishda O'CHIRILADI (`src` bo'shatiladi).
   Katalog bilan birga yuklansa o'nlab MB tortilardi; faqat `pause()`
   qilinsa dekodlangan videolar xotirada yig'ilib qolardi.

   ⚠️ Hodisa `document` ga BIR MARTA ulanadi — kartochkalar har `render()`
   da qayta chiziladi, ya'ni tugunlarga ulansa listenerlar to'planardi
   (`bindDetailHeader` bilan ayni sabab). */
const HOVER_MEDIA_MS = 3000;
let _hoverBound = false;

function bindHoverMedia() {
  if (_hoverBound) return;
  if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;
  _hoverBound = true;

  let timer = null;
  let ochiq = null;

  function yop() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!ochiq) return;
    const v = ochiq.querySelector('.media-hover');
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); v.remove(); }
    ochiq = null;
  }

  document.addEventListener('mouseover', (e) => {
    const box = e.target.closest && e.target.closest('.card-media[data-video]');
    if (!box || box === ochiq) return;
    yop();
    timer = setTimeout(() => {
      timer = null;
      // Sichqoncha shu orada chiqib ketgan yoki ekran qayta chizilgan
      // bo'lishi mumkin — DOM'dan so'raymiz, taxmin qilmaymiz.
      if (!box.isConnected || !box.matches(':hover')) return;
      const v = document.createElement('video');
      v.className = 'media-hover';
      v.src = box.dataset.video;
      if (box.dataset.poster) v.poster = box.dataset.poster;
      // `muted` SHART — ovozli avtomatik o'ynatish bloklanadi va video
      // jimgina ochilmay qolardi.
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('aria-hidden', 'true');
      box.appendChild(v);
      ochiq = box;
      const pr = v.play();
      if (pr && pr.catch) pr.catch(() => {});
    }, HOVER_MEDIA_MS);
  });

  document.addEventListener('mouseout', (e) => {
    const box = e.target.closest && e.target.closest('.card-media[data-video]');
    if (!box) return;
    // `mouseout` ichki elementga o'tganda ham otiladi — kartochkaning
    // O'ZIDAN chiqilganini tekshiramiz.
    if (e.relatedTarget && box.contains(e.relatedTarget)) return;
    yop();
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) yop(); });
}

// ============ KATALOG/BOSH KARTOCHKASI — SAVAT MIQDOR BOSHQARUVI ============
function catalogQtyControl(p) {
  const line = S.cart.find(x => x.id === p.id);
  const btnBg = 'background:linear-gradient(150deg,var(--pom-700),var(--pom-800))';
  if (!line) {
    return `
    <div style="width:100%;height:36px;display:flex;align-items:center;justify-content:flex-end">
      <button data-action="catalogInc" data-arg="${p.id}" style="flex:none;width:32px;height:32px;border-radius:10px;border:none;${btnBg};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px -4px rgba(81,1,0,.55);cursor:pointer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>
    </div>`;
  }
  return `
  <div data-action="noop" style="width:100%;height:36px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:3px;border-radius:11px;background:var(--pom-100);border:1px solid rgba(122,20,13,.12)">
    <button data-action="catalogDec" data-arg="${p.id}" style="flex:none;width:30px;height:30px;border-radius:8px;border:none;${btnBg};color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
    </button>
    <span style="font-family:var(--font-mono);font-size:13px;font-weight:700;color:var(--pom-800)">${num(line.qty)} ${uShort(p.unit)}</span>
    <button data-action="catalogInc" data-arg="${p.id}" style="flex:none;width:30px;height:30px;border-radius:8px;border:none;${btnBg};color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
    </button>
  </div>`;
}
function catalogInc(id) {
  const p = byId(id);
  const line = S.cart.find(x => x.id === id);
  if (line) { line.qty += step(p); }
  else { S.cart.push({ id, qty: p.moq }); showToast(STR[S.lang].added); }
  render();
}
function catalogDec(id) {
  const p = byId(id);
  const line = S.cart.find(x => x.id === id);
  if (!line) return;
  if (line.qty <= p.moq) { S.cart = S.cart.filter(x => x.id !== id); }
  else { line.qty = Math.max(p.moq, line.qty - step(p)); }
  render();
}

// ============ MAHSULOT KARTA — BOSH SAHIFA (badge + like, supplier/meta yo'q) ============
function homeCard(p) {
  return `
  <div data-action="openProduct" data-arg="${p.id}" style="cursor:pointer;background:var(--glass-fill);backdrop-filter:var(--blur-lg);-webkit-backdrop-filter:var(--blur-lg);border:1px solid var(--glass-border-soft);border-radius:var(--radius-lg);box-shadow:0 6px 16px -12px rgba(81,1,0,.16),0 1px 2px rgba(23,26,48,.04);overflow:hidden;display:flex;flex-direction:column">
    <div class="card-media"${p.video ? ` data-video="${p.video}"${p.videoPoster ? ` data-poster="${p.videoPoster}"` : ''}` : ''} style="height:230px;${p.bgStyle}">
      ${p.badgeShow ? `<span style="position:absolute;top:9px;left:9px;display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:999px;font-size:11px;font-weight:600;background:${p.badgeBg};color:${p.badgeFg}">${p.badge}</span>` : ''}
      ${likeButton(p)}
    </div>
    <div style="padding:11px 12px 12px;display:flex;flex-direction:column;gap:6px">
      <div style="font-family:var(--font-display);font-size:14.5px;font-weight:700;color:var(--text-strong);line-height:1.2;letter-spacing:-.01em">${p.name}</div>
      <div style="font-size:11.5px;font-weight:700;color:var(--text-strong);line-height:1.3">${p.city}</div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:1px">
        <span style="font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;color:var(--text-subtle)">${p.perUnitLabel}</span>
        <span style="font-family:var(--font-mono);font-size:16px;font-weight:600;color:var(--text-strong)">${p.priceLabel}</span>
      </div>
      ${catalogQtyControl(p)}
    </div>
  </div>`;
}

// ============ INTERAKSIYALAR ============
function setLangUi(l) {
  S.lang = l;
  render();
}
/* Bitta qator — ikki til (sayt bilan bitta naqsh: `script.js` → `toggleLang`).
   Uchinchi til qo'shilsa bu yer tanlov ro'yxatiga aylanadi; ikki til uchun
   ro'yxat ortiqcha bosish bo'lardi. */
function toggleLangUi() {
  setLangUi(S.lang === 'ru' ? 'uz' : 'ru');
}
function toggleNotif() {
  S.notif = !S.notif;
  document.getElementById('screen-wrap').innerHTML = renderProfile();
}
function toggleLike(id) {
  S.liked[id] = !S.liked[id];
  if (S.liked[id]) showToast(STR[S.lang].liked);
  render();
}
function selectCat(c) {
  const prev = S.cat;
  S.cat = c;
  paintHome(prev !== c);
}

// Tanlangan kategoriya chipini qatorda MARKAZGA suradi va (tanlov
// almashganda) ostki chiziq animatsiyasini qayta o'ynatadi — innerHTML
// almashganda element .on bilan tug'iladi, ya'ni o'tish o'z-o'zidan
// chiqmaydi: boshlang'ich holat qo'lda tiklanadi.
// ⚠️ scrollIntoView ISHLATILMAYDI — u #screen-wrap ni vertikal ham
// surishi mumkin; faqat qatorning o'z gorizontal skrolli boshqariladi.
function focusCatChip(animate) {
  const row = document.querySelector('.cat-chips');
  const on = row && row.querySelector('.cat-chip.on');
  if (!on) return;
  if (animate) {
    const line = on.querySelector('.cat-line');
    if (line) {
      line.style.transition = 'none';
      line.style.transform = 'scaleX(0)';
      void line.offsetWidth; // reflow — keyingi qiymat o'tish bilan borsin
      line.style.transition = '';
      line.style.transform = '';
    }
  }
  const left = on.offsetLeft - (row.clientWidth - on.offsetWidth) / 2;
  row.scrollTo({ left, behavior: animate ? 'smooth' : 'auto' });
}
function setPay(p) { S.pay = p; document.getElementById('screen-wrap').innerHTML = renderCheckout(); }
function setOrdersTab(t) { S.ordersTab = t; document.getElementById('screen-wrap').innerHTML = renderOrders(); }

function toggleTrack(id) {
  S.trackOpen[id] = !S.trackOpen[id];
  document.getElementById('screen-wrap').innerHTML = renderOrders();
}

function reorderOrder(id) {
  const o = ORDERS.find(x => x.id === id);
  if (!o) return;
  // ⚠️ Katalogda YO'Q mahsulot savatga QO'SHILMAYDI. Savat butunlay
  // katalogga tayanadi (`cartTotal()` → `byId(c.id).price`), ya'ni mavjud
  // bo'lmagan id qo'shilsa nuqson buyurtmalar ekranidan SAVATGA ko'chardi —
  // "takrorlash" tugmasi savatni o'ldirardi. Buyurtma tarixi mahsulotsiz
  // ham chizilaveradi, savat esa chizilmaydi: farq shundan.
  const yoq = o.items.filter(it => !byId(it.id));
  o.items.filter(it => byId(it.id)).forEach((it) => {
    const line = S.cart.find(x => x.id === it.id);
    if (line) line.qty += it.qty;
    else S.cart.push({ id: it.id, qty: it.qty });
  });
  if (yoq.length === o.items.length) { showToast(STR[S.lang].itemGone); return; }
  showToast(yoq.length ? STR[S.lang].reorderPartial : STR[S.lang].added);
  tab('cart');
}
function onSearch(v) {
  S.search = v;
  document.getElementById('screen-wrap').innerHTML = renderSearch();
  const inp = document.getElementById('search-inp');
  if (inp) { inp.focus(); const l=inp.value.length; inp.setSelectionRange(l,l); }
}
function clearSearch() { S.search=''; document.getElementById('screen-wrap').innerHTML=renderSearch(); document.getElementById('search-inp')?.focus(); }
function pickSearch(v) { S.search=v; document.getElementById('screen-wrap').innerHTML=renderSearch(); }

function sendOrderNotify(orderId) {
  try {
    const items = S.cart.map(c => {
      const p = byId(c.id);
      return { name: p.name[S.lang], qty: `${num(c.qty)} ${uShort(p.unit)}`, price: money(p.price * c.qty) };
    });
    const payOpt = PAY.find(o => o.key === S.pay);
    const tgUser = S.tgUser?.username;
    const point = btsById(S.btsPoint);
    const total = cartTotal();
    fetch('/api/telegram-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        buyerName: COMPANY.name[S.lang],
        tgUser: tgUser || undefined,
        tgUserId: S.tgUser?.id || undefined,
        address: point ? `${point.name[S.lang]}, ${point.addr[S.lang]}` : COMPANY.addr[S.lang],
        payment: payOpt ? payOpt.label[S.lang] : S.pay,
        comment: S.comment || '',
        items,
        total: money(total),
        prepay: money(prepayAmount(total)),
        rest: money(restAmount(total)),
      }),
    }).catch(() => {});
  } catch (e) {}
}

// ============ BUYURTMA HOLATINI SERVERDAN SINXRONLASH ============
function syncOrderStatuses() {
  // Yakunlangan buyurtmalar holati boshqa o'zgarmaydi — ularni so'ramaymiz
  const CLOSED = ['delivered', 'completed', 'refunded', 'cancelled'];
  const open = ORDERS.filter(o => !CLOSED.includes(o.statusKey));
  if (!open.length) return;
  open.forEach((o) => {
    fetch('/api/order-status?id=' + encodeURIComponent(o.id))
      .then((r) => r.json())
      .then((d) => {
        if (d && d.status && d.status !== o.statusKey) {
          o.statusKey = d.status;
          saveOrders();
          if (S.screen === 'orders') document.getElementById('screen-wrap').innerHTML = renderOrders();
        }
      })
      .catch(() => {});
  });
}

function mainBtnAction() {
  if (S.screen === 'detail') {
    addToCart(S.selectedId, S.qty);
    tab('cart');
  } else if (S.screen === 'checkout') {
    if (!btsById(S.btsPoint)) { showToast(STR[S.lang].needPoint); openBtsSheet(); return; }
    submitOrder();
  } else if (S.screen === 's-form') {
    saveProduct();
  }
}

// Buyurtmani serverga (bazaga) yuboradi. Optimistik: darhol success ekraniga o'tadi.
async function submitOrder() {
  const cartSnapshot = S.cart.map(c => ({ id: c.id, qty: c.qty }));
  const payOpt = PAY.find(o => o.key === S.pay);
  const point = btsById(S.btsPoint);
  const total = cartTotal();
  const payload = {
    items: cartSnapshot,
    buyerName: COMPANY.name[S.lang],
    tgUser: S.tgUser?.username || undefined,
    tgUserId: S.tgUser?.id || undefined,
    // Yetkazish manzili endi xaridor ofisi emas — tanlangan BTS olish nuqtasi
    address: point ? `${point.name[S.lang]}, ${point.addr[S.lang]}` : COMPANY.addr[S.lang],
    pickupPointId: point ? point.id : undefined,
    payment: payOpt ? payOpt.label[S.lang] : S.pay,
    prepay: prepayAmount(total),
    rest: restAmount(total),
    comment: S.comment || '',
    lang: S.lang,
  };

  let orderId = null;
  let serverError = null;   // API tushunarli javob qaytardi va RAD ETDI (validatsiya/MOQ/auth)
  try {
    const r = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tgInitData() },
      body: JSON.stringify(payload),
    });
    const d = await r.json().catch(() => null);
    if (d && d.ok && d.orderId) {
      orderId = d.orderId;
    } else if (d && d.error) {
      // API'ning o'zi javob berdi — sababi bor, foydalanuvchiga ko'rsatamiz.
      // 401 = Telegram tashqarisida ochilgan (imzo yo'q), buni tushunarli tilda aytamiz.
      serverError = (r.status === 401) ? STR[S.lang].authErr : d.error;
    }
    // JSON emas (404/501/502 — HTML sahifa): API umuman ulanmagan.
    // Bu server biznes xatosi EMAS, shuning uchun mahalliy zaxira yo'lidan ketamiz.
  } catch (e) {
    // tarmoq uzildi — serverga umuman yetmadik
  }

  // API buyurtmani RAD ETDI — success ko'rsatMAYMIZ, sababini aytamiz
  if (serverError) {
    showToast(serverError);
    return;
  }

  // API'ga yetmadik (offline yoki API ulanmagan) — zaxira: mahalliy id + bildirishnoma yo'li
  if (!orderId) {
    orderId = nextOrderId();
    sendOrderNotify(orderId);
  }

  ORDERS.unshift({
    id: orderId,
    date: orderDateLabel(),
    items: cartSnapshot,
    statusKey: 'pending',
  });
  saveOrders();
  S.cart = [];
  S.screen = 'success';
  S.history = [];
  S.comment = '';
  render();
}

// ============ ASOSIY RENDER ============
function render() {
  updateHeader();
  updateNav();

  const map = {
    home: renderHome, ai: renderAi, detail: renderDetail,
    search: renderSearch, cart: renderCart, checkout: renderCheckout,
    success: renderSuccess, orders: renderOrders, profile: renderProfile,
    notifications: renderNotifications, saved: renderSaved,
    // Sotuvchi kabineti
    's-products': renderSellerProducts, 's-orders': renderSellerOrders,
    's-profile': renderSellerProfile, 's-form': renderProductForm,
  };
  const fn = map[S.screen];
  const wrap = document.getElementById('screen-wrap');
  if (fn && wrap) {
    // `updateHeader()` va `updateNav()` ALLAQACHON yangi ekranni ko'rsatib
    // bo'ldi. Agar chizish funksiyasi xato tashlasa, `innerHTML` yangilanmay
    // qoladi va ekranda ESKI ekran turaveradi — sarlavhada "Bosh sahifa"
    // yozilgan holda katalog ko'rinadi. Foydalanuvchi buni "tugma ishlamadi"
    // deb tushunadi va nuqson hech qayerda ko'rinmaydi (2026-08-02).
    try {
      wrap.innerHTML = fn();
    } catch (e) {
      console.error('render() xatosi, ekran:', S.screen, e);
      wrap.innerHTML = `
      <div style="padding:48px 20px;text-align:center;color:var(--text-muted);font-size:14px;line-height:1.5">
        Ekranni ochib bo'lmadi.
        <div style="margin-top:14px">
          <button data-action="reloadApp" style="height:40px;padding:0 20px;border:none;border-radius:var(--radius-md);background:var(--color-primary);color:#fff;font-size:14px;font-weight:600;cursor:pointer">Qayta yuklash</button>
        </div>
      </div>`;
    }
  }
  // Galereya tugunlari HTML bilan kelmaydi — ular DOM'da bo'lgandan keyin
  // ulanadi. `try` dan TASHQARIDA: chizish yiqilsa mount qiladigan narsa
  // ham yo'q, lekin mount xatosi butun ekranni qulatmasligi kerak.
  if (S.screen === 'detail') { try { mountDetailMedia(); } catch (e) { console.error('mountDetailMedia xatosi:', e.message); } }
  // Katalogga qaytilganda tanlangan kategoriya qatorda ko'rinib tursin —
  // innerHTML har safar skrollni boshiga qaytaradi.
  // Banner ham shu yerda ulanadi: bosh sahifadan chiqilganda esa
  // `mountAdBanner()` bannerni topmay taymerni O'CHIRADI — aks holda u
  // boshqa ekranlarda ham ishlab, yo'q elementni chizishga urinardi.
  if (S.screen === 'home') { try { focusCatChip(false); } catch (e) { console.error('focusCatChip xatosi:', e.message); } }
  try { mountAdBanner(); } catch (e) { console.error('mountAdBanner xatosi:', e.message); }
  // Profil surati — DOM tayyor bo'lgandan keyin (o'zi bir marta so'raydi).
  if (S.screen === 'profile') mountAvatar();

  // Mahsulot ekranida rasm ekranning eng tepasidan boshlanadi va shaffof
  // header ostidan o'tadi — boshqa ekranlarda tepadagi joy QAYTADI, aks
  // holda kontent header ostida qolib ketardi.
  if (wrap) wrap.classList.toggle('flush', S.screen === 'detail');
  bindDetailHeader();
  bindHoverMedia();
  syncDetailHeader();

  // Ekran almashsa ochiq sheet qolib ketmasin
  if (S.screen !== 'checkout') S.btsSheet = false;
  if (S.screen !== 'home') S.priceSheet = false;
  if (S.screen !== 'detail') S.photoView = null;
  paintSheet();
}

// ============ TELEGRAM ORQALI RO'YXATDAN O'TISH ============
function loadTgUser() {
  try {
    const live = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (live) {
      localStorage.setItem('lolamarket_tg_user', JSON.stringify(live));
      return live;
    }
    const cached = localStorage.getItem('lolamarket_tg_user');
    return cached ? JSON.parse(cached) : null;
  } catch (e) { return null; }
}

function shareContact() {
  if (!window.Telegram?.WebApp?.requestContact) return;
  Telegram.WebApp.requestContact((shared) => {
    if (!shared) return;
    showToast(STR[S.lang].contactPending);
    pollForPhone();
  });
}
function pollForPhone(attempt) {
  attempt = attempt || 0;
  const uid = S.tgUser?.id;
  if (!uid || attempt > 6) return;
  fetch(`/api/telegram-contact?uid=${uid}`)
    .then((r) => r.json())
    .then((d) => {
      if (d && d.phone) {
        S.tgPhone = d.phone;
        localStorage.setItem('lolamarket_tg_phone', d.phone);
        showToast(STR[S.lang].contactDone);
        render();
      } else {
        setTimeout(() => pollForPhone(attempt + 1), 1200);
      }
    })
    .catch(() => {});
}

// ============ SERVERDAN (BAZADAN) YUKLASH ============
// Katalogni bazadan yuklaydi; muvaffaqiyatsiz bo'lsa zaxira massiv qoladi.
// API javobini ochib beradi: yangi standart { ok, data } envelopini ham,
// eski yalang'och shaklni (massiv/obyekt) ham qo'llaydi — deploy tartibidan
// va eski keshlangan mijozlardan qat'i nazar buzilmaydi (Dars 11).
function apiData(d) {
  if (d && typeof d === 'object' && 'ok' in d) return d.ok ? d.data : null;
  return d;
}

async function loadProductsFromServer() {
  try {
    const r = await fetch('/api/products');
    if (!r.ok) { showToast(STR[S.lang].pricesStale); return; }
    const data = apiData(await r.json());
    if (Array.isArray(data) && data.length) {
      PRODUCTS = data;
    } else {
      // Bazadan bo'sh/kutilmagan javob keldi — zaxira narxlar hali ko'rsatilmoqda,
      // foydalanuvchi buni bilishi kerak (buyurtma yaratishda server real narxni
      // qayta hisoblaydi, lekin ekrandagi narx eskirgan bo'lishi mumkin).
      showToast(STR[S.lang].pricesStale);
    }
  } catch (e) {
    showToast(STR[S.lang].pricesStale);
  }
}
// Telegram imzolangan initData (auth uchun). Telegram tashqarisida bo'sh.
function tgInitData() { return window.Telegram?.WebApp?.initData || ''; }

// Telegram orqali server tomonda kirish — foydalanuvchini bazaga yozadi/topadi.
async function loginTelegram() {
  const initData = tgInitData();
  if (!initData) return;
  try {
    const r = await fetch('/api/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    });
    const d = await r.json().catch(() => null);
    if (d && d.ok) {
      S.authUser = d.user;
      // AI rasm tugmasi chizilsinmi — qaror SERVERDA (config.js qorovuli).
      // Javob kelmasa `false` bo'lib qoladi, ya'ni tugma ko'rinmaydi.
      S.aiImageEnabled = !!d.aiImageEnabled;
      // Savol kalitlari serverdan. Kelmasa — savol chizilmaydi va tugma
      // ham chizilmaydi (pastdagi `aiImageSection` shuni tekshiradi).
      S.aiChoiceKeys = d.aiImageChoices || null;
      // Karta kaliti ham SHU javobdan (`mapsClientConfig`). Kelmasa
      // `null` da qoladi va profilda karta tugmasi chizilmaydi — nuqta
      // ro'yxatdan tanlanadi (funksiya ishlayveradi).
      S.mapsKey = (d.mapsEnabled && typeof d.mapsKey === 'string' && d.mapsKey) ? d.mapsKey : null;
      S.aiComboKeys = d.aiComboChoices || null;
      if (Number.isInteger(d.aiComboTextMax) && d.aiComboTextMax > 0) {
        S.aiComboTextMax = d.aiComboTextMax;
      }
      // ⚠️ Yaroqsiz javobda `0` da QOLADI (yuqoridagi izohga qara) — ya'ni
      // "boshqa fason" tugmasi umuman chizilmaydi. Bu jimgina yolg'ondan
      // ko'ra ko'rinadigan yo'qlik: funksiya yo'qligi sezilardi, noto'g'ri
      // chegara esa faqat bosilgandan keyin, kredit bilan bilinardi.
      if (Number.isInteger(d.aiVariantMax) && d.aiVariantMax > 0) {
        S.aiVariantMax = d.aiVariantMax;
      }
      // Javob kech kelsa foydalanuvchi allaqachon mahsulot sahifasida
      // bo'lishi mumkin — o'shanda tugma o'zi paydo bo'lsin.
      repaintDetail(S.selectedId);
    }
  } catch (e) {}
}

// Foydalanuvchi buyurtmalari tarixini bazadan yuklaydi.
// Kimlik header'dagi initData'dan — server o'zi aniqlaydi (uid yuborilmaydi).
async function loadOrdersFromServer() {
  const initData = tgInitData();
  if (!initData) return;
  try {
    const r = await fetch('/api/orders', { headers: { 'X-Telegram-Init-Data': initData } });
    if (!r.ok) return;
    const data = apiData(await r.json());
    if (Array.isArray(data)) { ORDERS = data; saveOrders(); }
  } catch (e) {}
}

// ============ SOTUVCHI KABINETI — EKRANLAR ============
const P_STATUS = {
  published: { key:'stPublished', bg:'var(--success-100)', fg:'#0d6b45', dot:'var(--success-500)' },
  pending:   { key:'stPending',   bg:'var(--saffron-50)',  fg:'var(--saffron-700)', dot:'var(--saffron-500)' },
  rejected:  { key:'stRejected',  bg:'var(--danger-100)',  fg:'#a3181c', dot:'var(--danger-500)' },
  draft:     { key:'stDraft',     bg:'var(--ink-100)',     fg:'var(--ink-500)', dot:'var(--ink-300)' },
};

function segTabs(items, current, fn) {
  return `<div style="display:flex;gap:4px;background:rgba(255,255,255,.55);border-radius:999px;padding:4px;margin-bottom:13px;box-shadow:var(--shadow-sm)">
    ${items.map(t => {
      const on = current === t.k;
      return `<button data-action="${fn}" data-arg="${t.k}" style="flex:1;cursor:pointer;border:none;text-align:center;font-family:var(--font-sans);font-size:12.5px;font-weight:700;padding:8px 4px;border-radius:999px;background:${on ? 'linear-gradient(135deg,var(--pom-600),var(--pom-800))' : 'transparent'};color:${on ? '#ffe9db' : 'var(--ink-500)'}">${t.label}</button>`;
    }).join('')}
  </div>`;
}

function emptyState(title, sub) {
  return `<div style="padding:44px 20px;text-align:center">
    <div style="font-size:15px;font-weight:700;color:var(--text-strong)">${title}</div>
    ${sub ? `<div style="font-size:13px;color:var(--text-muted);margin-top:5px">${sub}</div>` : ''}
  </div>`;
}

// Video holati sotuvchining O'ZIGA. Uch holat ATAYLAB ajratilgan: video BOR ·
// oyna OCHIQ · yo'l YOPIQ. Tugma FAQAT uchinchisida chiziladi — oyna
// allaqachon ochiq bo'lsa u ikkinchi yo'l bo'lardi (CLAUDE.md: mavjud
// funksiyaga ikkinchi yo'l qo'shilmasin), sotuvchi esa "yana so'rash kerak"
// deb o'ylardi.
//
// Bu bo'shliq haqiqiy edi: oyna rasm yuborilganda o'zi ochiladi va video
// kelishi bilan yopiladi — ya'ni video qabul qilingandan keyin YOKI moderator
// uni olib tashlagandan keyin (`video_remove` ham `awaiting_video=false`
// qo'yadi) sotuvchida yangisini yuborish yo'li UMUMAN qolmasdi.
function sellerVideoNote(p) {
  const T = STR[S.lang];
  // ⚠️ ESKI BACKEND — BLOK UMUMAN CHIZILMAYDI (sayt tomonidagi
  // `videoNoteHtml` bilan AYNI sabab): CI faqat frontendni chiqaradi, ya'ni
  // "yangi frontend + eski backend" oynasi har doim bo'ladi va o'shanda
  // tugma bosilsa `request_video` 400 qaytarardi — o'lik tugma.
  if (p.awaitingVideo === undefined) return '';
  // Oyna OCHIQ — tugma yo'q: yo'l allaqachon bor, tugma uni ikkilantirardi.
  if (p.awaitingVideo) return `<div class="s-note info">🎬 ${T.sVidWaiting}</div>`;
  return `<div class="s-note info">
    <span>${p.video ? `✅ ${T.sVidOn}` : ''}</span>
    <button class="s-mini" data-action="requestProductVideo" data-arg="${p.id}">${p.video ? T.sVidReplace : T.sVidAdd}</button>
  </div>`;
}

// ---- Mahsulotlarim ----
function renderSellerProducts() {
  const T = STR[S.lang];
  const active = S.sProducts.filter(p => p.status !== 'draft');
  const hidden = S.sProducts.filter(p => p.status === 'draft');
  const list = S.sProdTab === 'hidden' ? hidden : active;

  return `
  <div style="padding:14px 16px 28px">
    ${segTabs([
      { k:'active', label:`${T.sActive} ${active.length}` },
      { k:'hidden', label:`${T.sHidden} ${hidden.length}` },
    ], S.sProdTab, 'setSProdTab')}

    ${S.sLoading ? emptyState('…') : (list.length ? list.map(p => {
      const st = P_STATUS[p.status] || P_STATUS.draft;
      return `<div style="${CARD_BOX};margin-bottom:9px">
        <div style="display:flex;gap:11px;align-items:center">
          <div style="flex:none;width:46px;height:46px;border-radius:11px;background:linear-gradient(135deg,#e8c9b8,#c98f74);overflow:hidden">
            ${p.img ? `<img src="${esc(p.img)}" alt="" style="width:100%;height:100%;object-fit:cover">` : ''}
          </div>
          <div style="flex:1;min-width:0">
            <!-- Bu ro'yxat sotuvchi API'sidan XOM keladi, vm() dan o'tmaydi. -->
            <div style="font-size:14px;font-weight:700;color:var(--text-strong);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.name[S.lang])}</div>
            <div style="font-family:var(--font-mono);font-size:12px;color:var(--text-muted);margin-top:2px">${money(p.price)} · ${T.minOrder}: ${num(p.moq)}</div>
            <div style="font-size:11.5px;color:${p.stock === 0 ? 'var(--danger-500)' : 'var(--text-muted)'};margin-top:2px">${T.sStockLabel}: ${p.stock == null ? T.sStockUnlimited : num(p.stock)}</div>
            <div style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:${st.fg};margin-top:4px">
              <span style="width:6px;height:6px;border-radius:50%;background:${st.dot}"></span>${T[st.key]}
            </div>
          </div>
        </div>
        ${p.status === 'rejected' && p.rejectReason ? `<div style="margin-top:9px;padding:9px 11px;border-radius:var(--radius-sm);background:var(--danger-100);font-size:12px;color:#a3181c;line-height:1.45">${esc(p.rejectReason)}</div>` : ''}
        ${!p.img ? `<div class="s-note warn">
          <span>${p.awaitingImage ? T.sImgWaiting : ''}</span>
          ${p.awaitingImage ? '' : `<button class="s-mini" data-action="requestProductImage" data-arg="${p.id}">${T.sImgAdd}</button>`}
        </div>` : ''}
        ${sellerVideoNote(p)}
        <div style="display:flex;gap:8px;margin-top:11px">
          <button data-action="editProduct" data-arg="${p.id}" style="flex:1;cursor:pointer;padding:9px;border-radius:var(--radius-sm);border:1px solid var(--border-hair);background:rgba(255,255,255,.7);font-family:var(--font-sans);font-size:13px;font-weight:600;color:var(--text-strong)">${T.sEdit}</button>
          <button data-action="toggleProductArg" data-arg="${p.id}|${p.status === 'draft' ? 'show' : 'hide'}" style="flex:1;cursor:pointer;padding:9px;border-radius:var(--radius-sm);border:1px solid var(--border-hair);background:rgba(255,255,255,.7);font-family:var(--font-sans);font-size:13px;font-weight:600;color:var(--text-muted)">${p.status === 'draft' ? T.sShow : T.sHide}</button>
        </div>
      </div>`;
    }).join('') : emptyState(T.sNoProducts, S.sProdTab === 'active' ? T.sNoProductsSub : ''))}
  </div>

  <button data-action="newProductForm" aria-label="${T.sAdd}" style="position:absolute;right:16px;bottom:calc(var(--dock-h) + 12px);z-index:22;width:52px;height:52px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,var(--pom-600),var(--pom-800));color:#ffe9db;font-size:27px;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 28px -8px rgba(81,1,0,.55)">+</button>`;
}

// ---- Mahsulot formasi (qo'shish / tahrirlash) ----
const P_CATS = [
  { k:'silk',   uz:'Ipak',   ru:'Шёлк' },
  { k:'ikat',   uz:'Ikat',   ru:'Икат' },
  { k:'suzani', uz:"So'zana", ru:'Сюзане' },
  { k:'cotton', uz:'Paxta',  ru:'Хлопок' },
  { k:'wool',   uz:'Jun',    ru:'Шерсть' },
  { k:'linen',  uz:'Zig\'ir', ru:'Лён' },
];

function renderProductForm() {
  const T = STR[S.lang];
  const p = S.sEditId ? S.sProducts.find(x => x.id === S.sEditId) : null;
  const inp = 'width:100%;padding:12px 14px;border:1px solid var(--border-hair);border-radius:var(--radius-md);background:var(--glass-fill-strong);font-family:var(--font-sans);font-size:16px;color:var(--text-strong);outline:none';
  const lbl = 'font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pom-700);margin-bottom:7px;display:block';

  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:15px">
    <div><label style="${lbl}">${T.sName}</label>
      <input id="pf-name" value="${p ? String(p.name[S.lang]).replace(/"/g,'&quot;') : ''}" style="${inp}"></div>

    <div><label style="${lbl}">${T.sPrice}</label>
      <input id="pf-price" type="number" inputmode="numeric" value="${p ? p.price : ''}" style="${inp};font-family:var(--font-mono)"></div>

    <div><label style="${lbl}">${T.sMoq}</label>
      <input id="pf-moq" type="number" inputmode="numeric" value="${p ? p.moq : 1}" style="${inp};font-family:var(--font-mono)"></div>

    <div><label style="${lbl}">${T.sStock}</label>
      <input id="pf-stock" type="number" inputmode="numeric" min="0" placeholder="${T.sStockPh}" value="${p && p.stock != null ? p.stock : ''}" style="${inp};font-family:var(--font-mono)"></div>

    ${p ? '' : `<div><label style="${lbl}">${T.sCat}</label>
      <div style="display:flex;flex-wrap:wrap;gap:7px">
        ${P_CATS.map((c,i) => `<button data-action="pickPfCat" data-arg="${c.k}" id="pf-cat-${c.k}" data-cat="${c.k}" style="cursor:pointer;font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:999px;background:${i===0?'var(--ink-900)':'rgba(255,255,255,.66)'};color:${i===0?'#fff':'var(--ink-700)'};border:1px solid ${i===0?'var(--ink-900)':'rgba(255,255,255,.8)'}">${c[S.lang]}</button>`).join('')}
      </div></div>`}

    <div><label style="${lbl}">${T.sComp}</label>
      <textarea id="pf-comp" rows="2" placeholder="100% tut ipagi" style="${inp};resize:none"></textarea></div>

    <div style="font-size:12px;color:var(--text-muted);line-height:1.5;padding:11px 12px;border-radius:var(--radius-md);background:var(--saffron-50);border:1px solid rgba(217,142,12,.22)">
      ${S.lang === 'ru' ? 'После сохранения объявление отправится на модерацию и появится в каталоге после проверки.' : "Saqlangach e'lon moderatsiyaga yuboriladi va tekshiruvdan keyin katalogda ko'rinadi."}
      <br>${T.sPhotoHint}
    </div>
  </div>`;
}

function pickPfCat(k) {
  S.pfCat = k;
  P_CATS.forEach(c => {
    const el = document.getElementById('pf-cat-' + c.k);
    if (!el) return;
    const on = c.k === k;
    el.style.background = on ? 'var(--ink-900)' : 'rgba(255,255,255,.66)';
    el.style.color = on ? '#fff' : 'var(--ink-700)';
    el.style.borderColor = on ? 'var(--ink-900)' : 'rgba(255,255,255,.8)';
  });
}

function openProductForm(id) {
  S.sEditId = id;
  S.pfCat = 'silk';
  navigate('s-form');
}
// "+" tugmasi — yangi e'lon. `data-arg` siz chaqiruv `undefined` berardi,
// bu yerda esa ATAYLAB `null`: `saveProduct()` shu bo'yicha POST/PATCH ajratadi.
function newProductForm() { openProductForm(null); }

// ⚠️ `String()` ataylab: delegatsiya sof raqamli `data-arg` ni Number ga
// aylantiradi, `renderProductForm` esa `x.id === S.sEditId` bilan qidiradi.
// Bugungi id lar `p-…` prefiksli, ya'ni xavf yo'q — lekin raqamli id paydo
// bo'lgan kuni forma JIMGINA bo'sh ochilardi (PATCH esa to'g'ri id bilan
// ketaverardi), ya'ni nuqson hech qayerda ko'rinmasdi.
function editProduct(arg) { openProductForm(String(arg)); }

async function saveProduct() {
  const T = STR[S.lang];
  const name = document.getElementById('pf-name')?.value.trim() || '';
  const price = parseInt(document.getElementById('pf-price')?.value, 10);
  const moq = parseInt(document.getElementById('pf-moq')?.value, 10) || 1;
  const comp = document.getElementById('pf-comp')?.value.trim() || '';
  // Bo'sh qoldirilsa — cheksiz (null). 0 esa haqiqiy qiymat: "tugadi".
  const stockRaw = document.getElementById('pf-stock')?.value.trim() ?? '';
  const stock = stockRaw === '' ? null : parseInt(stockRaw, 10);
  if (name.length < 2) return showToast(T.sName);
  if (!Number.isInteger(price) || price < 1) return showToast(T.sPrice);
  if (stock !== null && (!Number.isInteger(stock) || stock < 0)) return showToast(T.sStock);

  try {
    if (S.sEditId) {
      await sellerFetch('/api/seller/products', {
        method: 'PATCH',
        body: JSON.stringify({ id: S.sEditId, name_uz: name, price, moq, comp_uz: comp, stock }),
      });
    } else {
      await sellerFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({ name_uz: name, price, moq, comp_uz: comp, stock, cat_key: S.pfCat || 'silk' }),
      });
    }
    showToast(T.sSaved);
    await loadSellerData();
    S.screen = 's-products';
    S.history = [];
    render();
  } catch (e) { showToast(e.message); }
}

function toggleProductArg(arg) {
  const [id, action] = String(arg).split('|');
  toggleProduct(id, action);
}

async function toggleProduct(id, action) {
  try {
    await sellerFetch('/api/seller/products', { method: 'PATCH', body: JSON.stringify({ id, action }) });
    showToast(action === 'hide' ? STR[S.lang].sHidden2 : STR[S.lang].sShown);
    await loadSellerData();
    render();
  } catch (e) { showToast(e.message); }
}

async function requestProductImage(id) {
  try {
    await sellerFetch('/api/seller/products', { method: 'PATCH', body: JSON.stringify({ id, action: 'request_image' }) });
    showToast(STR[S.lang].sImgRequested);
    await loadSellerData();
    render();
  } catch (e) { showToast(e.message); }
}

async function requestProductVideo(id) {
  try {
    await sellerFetch('/api/seller/products', { method: 'PATCH', body: JSON.stringify({ id, action: 'request_video' }) });
    showToast(STR[S.lang].sVidRequested);
    await loadSellerData();
    render();
  } catch (e) { showToast(e.message); }
}

// ---- Kelgan buyurtmalar ----
const ORD_GROUP = {
  new:      ['pending'],
  progress: ['confirmed', 'shipped'],
  done:     ['delivered', 'cancelled'],
};

function renderSellerOrders() {
  const T = STR[S.lang];
  const counts = {
    new: S.sOrders.filter(o => ORD_GROUP.new.includes(o.statusKey)).length,
    progress: S.sOrders.filter(o => ORD_GROUP.progress.includes(o.statusKey)).length,
    done: S.sOrders.filter(o => ORD_GROUP.done.includes(o.statusKey)).length,
  };
  const list = S.sOrders.filter(o => ORD_GROUP[S.sOrdTab].includes(o.statusKey));

  return `
  <div style="padding:14px 16px 28px">
    ${segTabs([
      { k:'new', label:`${T.sNew}${counts.new ? ' ' + counts.new : ''}` },
      { k:'progress', label:T.sProgress },
      { k:'done', label:T.sDone },
    ], S.sOrdTab, 'setSOrdTab')}

    ${S.sLoading ? emptyState('…') : (list.length ? list.map(o => {
      const isNew = o.statusKey === 'pending';
      const canShip = o.statusKey === 'confirmed';
      return `<div style="${CARD_BOX};margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:9px">
          <div>
            <div style="font-family:var(--font-mono);font-size:12.5px;font-weight:600;color:var(--text-muted)">${o.id}</div>
            <div style="font-size:11px;color:var(--text-subtle);margin-top:2px">${o.date[S.lang] || o.date}</div>
          </div>
          ${o.prepay ? `<span style="flex:none;font-size:11px;font-weight:700;padding:4px 9px;border-radius:999px;background:var(--success-100);color:#0d6b45">${T.sPrepaid}</span>` : ''}
        </div>

        ${o.items.map(it => `<div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;margin-bottom:6px">
          <span style="color:var(--text-body)">${it.name} · ${num(it.qty)}</span>
          <span style="font-family:var(--font-mono);font-weight:600;color:var(--text-strong);flex:none">${money(it.unitPrice * it.qty)}</span>
        </div>`).join('')}

        <div style="margin-top:9px;padding-top:9px;border-top:1px solid var(--border-hair);font-size:12px;color:var(--text-muted);line-height:1.6">
          <div>${T.sYourPart}: <b style="color:var(--text-strong);font-family:var(--font-mono)">${money(o.sellerTotal)}</b></div>
          ${o.prepay ? `<div>${T.sPrepaid}: <b style="color:var(--text-body);font-family:var(--font-mono)">${money(o.prepay)}</b> · ${T.sRestWait}: <span style="font-family:var(--font-mono)">${money(o.rest || 0)}</span></div>` : ''}
          <!-- Bu to'rttasini XARIDOR yozadi va ular SOTUVCHI ekranida chiziladi —
               tozalanmasa xaridor sotuvchining sessiyasida kod ishga tushira olardi. -->
          <div>${T.sBuyer}: <b style="color:var(--text-body)">${esc(o.buyerName || '—')}</b></div>
          <div>${T.sPickup}: <b style="color:var(--text-body)">${esc(o.address || '—')}</b></div>
          ${o.tracking ? `<div>${T.sTracking}: <b style="font-family:var(--font-mono);color:var(--text-body)">${esc(o.tracking)}</b></div>` : ''}
          ${o.comment ? `<div style="margin-top:4px;font-style:italic">"${esc(o.comment)}"</div>` : ''}
        </div>

        ${isNew ? `<div style="display:flex;gap:8px;margin-top:11px">
          <button data-action="sellerOrderArg" data-arg="${o.id}|reject" style="flex:1;cursor:pointer;padding:11px;border-radius:var(--radius-sm);border:1.5px solid var(--danger-500);background:transparent;font-family:var(--font-sans);font-size:13.5px;font-weight:700;color:var(--danger-500)">${T.sReject}</button>
          <button data-action="sellerOrderArg" data-arg="${o.id}|accept" style="flex:1;cursor:pointer;padding:11px;border-radius:var(--radius-sm);border:none;background:linear-gradient(135deg,var(--pom-600),var(--pom-800));font-family:var(--font-sans);font-size:13.5px;font-weight:700;color:#ffe9db">${T.sAccept}</button>
        </div>` : ''}

        ${canShip ? `<div style="margin-top:11px">
          <input id="trk-${o.id}" value="${S.sTracking[o.id] || ''}" data-input="setSTracking" data-arg="${o.id}" placeholder="${T.sTrackingPh}" style="width:100%;padding:11px 13px;border:1px solid var(--border-hair);border-radius:var(--radius-sm);background:var(--glass-fill-strong);font-family:var(--font-mono);font-size:16px;color:var(--text-strong);outline:none">
          <button data-action="sellerOrderArg" data-arg="${o.id}|ship" style="width:100%;margin-top:8px;cursor:pointer;padding:11px;border-radius:var(--radius-sm);border:none;background:linear-gradient(135deg,var(--pom-600),var(--pom-800));font-family:var(--font-sans);font-size:13.5px;font-weight:700;color:#ffe9db">${T.sShip}</button>
        </div>` : ''}

        ${o.dispute ? sellerDisputeBlock(o.dispute) : ''}
      </div>`;
    }).join('') : emptyState(T.sNoOrders))}
  </div>`;
}

// Sotuvchi kabinetidagi bahs bloki — shikoyat matni va javob maydoni.
// Javob bir marta yozilgach o'zgartirilmaydi (moderator ko'rgan matn qolsin).
function sellerDisputeBlock(d) {
  const T = STR[S.lang];
  return `
  <div style="margin-top:11px;padding:11px;border-radius:var(--radius-sm);background:var(--danger-100);border:1px solid rgba(163,24,28,.18)">
    <div style="font-size:12px;font-weight:700;color:#a3181c">⚖️ ${T.sDispute}</div>
    <!-- reason ni XARIDOR yozadi, bu blok esa SOTUVCHI ekranida chiziladi. -->
    <div style="font-size:12.5px;color:var(--text-body);margin-top:5px;line-height:1.5">${esc(d.reason || '')}</div>

    ${d.sellerResponse
      ? `<div style="margin-top:8px;font-size:12px;color:var(--text-muted);line-height:1.5"><b>${T.sDisputeYours}:</b> ${esc(d.sellerResponse)}</div>`
      : `<div style="margin-top:9px">
           <textarea data-input="setSDispReply" data-arg="${d.id}" placeholder="${T.sDisputeReplyPh}" rows="3"
             style="width:100%;padding:10px;border:1px solid var(--border-hair);border-radius:var(--radius-sm);background:var(--surface-solid);font-family:var(--font-sans);font-size:16px;color:var(--text-strong);outline:none;resize:none">${esc(S.sDispReply[d.id] || '')}</textarea>
           <button data-action="sendDisputeReply" data-arg="${d.id}" style="width:100%;margin-top:7px;cursor:pointer;padding:10px;border-radius:var(--radius-sm);border:none;background:linear-gradient(135deg,var(--pom-600),var(--pom-800));font-family:var(--font-sans);font-size:13px;font-weight:700;color:#ffe9db">${T.sDisputeSend}</button>
         </div>`}
  </div>`;
}

function setSDispReply(v, disputeId) { S.sDispReply[disputeId] = v; }

async function sendDisputeReply(disputeId) {
  const T = STR[S.lang];
  const text = (S.sDispReply[disputeId] || '').trim();
  if (text.length < 3) return showToast(T.sDisputeNeed);
  try {
    await sellerFetch('/api/seller/dispute', {
      method: 'POST',
      body: JSON.stringify({ disputeId, response: text }),
    });
    delete S.sDispReply[disputeId];
    showToast(T.sDisputeSent);
    await loadSellerData();
    render();
  } catch (e) { showToast(e.message); }
}

// Telegram ichida native dialog ishlatiladi (brauzerdagi confirm() u yerda ishonchsiz)
function askConfirm(text) {
  const tg = window.Telegram?.WebApp;
  if (tg?.showConfirm) return new Promise((res) => tg.showConfirm(text, (okd) => res(!!okd)));
  return Promise.resolve(window.confirm(text));
}

// Kuzatuv raqami maydoni — ilgari atributda to'g'ridan-to'g'ri o'zlashtirilardi
function setSTracking(v, orderId) { S.sTracking[orderId] = v; }

function sellerOrderArg(arg) {
  const [orderId, action] = String(arg).split('|');
  sellerOrder(orderId, action);
}

async function sellerOrder(orderId, action) {
  const T = STR[S.lang];
  if (action === 'reject' && !(await askConfirm(T.sConfirmReject))) return;
  const tracking = action === 'ship' ? (S.sTracking[orderId] || '').trim() : undefined;
  if (action === 'ship' && !tracking) return showToast(T.sNeedTracking);
  try {
    await sellerFetch('/api/seller/orders', {
      method: 'POST',
      body: JSON.stringify({ orderId, action, tracking }),
    });
    showToast(action === 'accept' ? T.sAccepted : action === 'reject' ? T.sRejected : T.sShipped);
    if (action === 'ship') delete S.sTracking[orderId];
    await loadSellerData();
    render();
  } catch (e) { showToast(e.message); }
}

// ---- Sotuvchi profili ----
function renderSellerProfile() {
  const T = STR[S.lang];
  const s = S.seller;
  return `
  <div style="padding:16px 16px 28px;display:flex;flex-direction:column;gap:14px">
    <div style="${CARD_BOX};display:flex;gap:13px;align-items:center">
      <span style="flex:none;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--pom-600),var(--pom-800));color:#ffe9db;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:19px;font-weight:800">${(s?.name?.[S.lang] || '?').slice(0,1)}</span>
      <div>
        <div style="font-family:var(--font-display);font-size:17px;font-weight:800;color:var(--text-strong);letter-spacing:-.02em">${s?.name?.[S.lang] || '—'}</div>
        <div style="display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:999px;margin-top:4px;background:${s?.verified ? 'var(--teal-50)' : 'var(--saffron-50)'};color:${s?.verified ? 'var(--teal-700)' : 'var(--saffron-700)'}">
          ${s?.verified ? T.verified : T.stPending}
        </div>
      </div>
    </div>

    <div style="${CARD_BOX};display:flex;gap:10px">
      <div style="flex:1;text-align:center">
        <div style="font-family:var(--font-mono);font-size:20px;font-weight:600;color:var(--text-strong)">${S.sProducts.length}</div>
        <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px">${T.sProducts}</div>
      </div>
      <div style="width:1px;background:var(--border-hair)"></div>
      <div style="flex:1;text-align:center">
        <div style="font-family:var(--font-mono);font-size:20px;font-weight:600;color:var(--text-strong)">${S.sOrders.length}</div>
        <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px">${T.sOrders}</div>
      </div>
    </div>

    ${sellerReviewsCard()}

    <button data-action="exitSellerMode" style="width:100%;cursor:pointer;padding:14px;border-radius:var(--radius-md);border:1px solid var(--glass-border);background:var(--glass-fill-strong);font-family:var(--font-sans);font-size:15px;font-weight:600;color:var(--text-strong)">${T.buyerMode}</button>
  </div>`;
}

// Sotuvchining o'z reytingi va sharhlari (PRD story №15).
// Sharh yo'q bo'lsa reyting o'rnida SON KO'RSATILMAYDI — "0.0" yozish
// yolg'on bo'lardi ("baholanmagan" ≠ "yomon baholangan").
function sellerReviewsCard() {
  const T = STR[S.lang];
  const r = S.sReviews;
  if (!r) return '';   // hali yuklanmagan

  return `
  <div style="${CARD_BOX}">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
      <span style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--pom-700)">${T.sReviews}</span>
      ${r.rating == null ? '' : `
      <span style="display:inline-flex;align-items:center;gap:6px">
        ${/* floor, round EMAS: 4.5 ni beshta to'la yulduz qilib ko'rsatish
             reytingni oshirib yuborardi. Yulduz hech qachon haqiqiy
             bahodan yuqori ko'rinmasin — aniq son yonida turibdi. */
          starsRow(Math.floor(r.rating), 12)}
        <span style="font-family:var(--font-mono);font-size:15px;font-weight:600;color:var(--text-strong)">${r.rating}</span>
        <span style="font-size:11.5px;color:var(--text-subtle)">· ${r.count} ${T.reviews}</span>
      </span>`}
    </div>

    ${r.items.length === 0
      ? `<div style="margin-top:11px;text-align:center;padding:14px 6px">
           <div style="font-size:13px;font-weight:600;color:var(--text-body)">${T.sNoReviews}</div>
           <div style="font-size:12px;color:var(--text-muted);margin-top:3px;line-height:1.5">${T.sNoReviewsSub}</div>
         </div>`
      : `<div style="margin-top:11px;display:flex;flex-direction:column;gap:8px">
           ${r.items.slice(0, 10).map(it => `
           <div style="padding:10px 11px;border:1px solid var(--border-hair);border-radius:var(--radius-sm)">
             <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
               <span style="flex:1;min-width:0;font-size:12.5px;font-weight:700;color:var(--text-strong);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(it.product[S.lang] || it.product.uz)}</span>
               ${starsRow(it.stars, 11)}
             </div>
             ${it.body ? `<div style="font-size:12.5px;color:var(--text-body);line-height:1.5;margin-top:6px">${esc(it.body)}</div>` : ''}
             <div style="font-size:11px;color:var(--text-subtle);margin-top:5px">${esc(it.author || '—')} · ${it.date[S.lang]}</div>
           </div>`).join('')}
         </div>`}
  </div>`;
}

// ============ SOTUVCHI KABINETI — MA'LUMOT ============
// Rol SERVERDAN keladi. Frontend uni faqat ko'rinish uchun ishlatadi —
// har bir sotuvchi endpointi rolni serverda mustaqil qayta tekshiradi.
function sellerFetch(path, opts) {
  return fetch(path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tgInitData(), ...(opts?.headers || {}) },
  }).then(async (r) => {
    const d = await r.json().catch(() => null);
    if (!d || d.ok !== true) throw new Error((d && d.error) || STR[S.lang].orderErr);
    return d.data;
  });
}

async function loadMe() {
  if (!tgInitData()) return;
  try {
    const d = await sellerFetch('/api/me');
    S.role = d.role || 'buyer';
    S.seller = d.seller || null;
    // Doimiy olish nuqtasi BAZADAN — u boshqa qurilmada tanlangan bo'lishi
    // mumkin. ⚠️ `localStorage` faqat server JAVOB BERMAGANDA yashaydi:
    // server "tanlanmagan" desa, brauzerdagi eski qiymat bosib turmasin,
    // aks holda xaridor boshqa qurilmada o'chirgan tanlov bu yerda tirilib
    // qolardi. Ya'ni haqiqat manbai — baza.
    if (d.pickupPointId !== undefined) {
      S.btsPoint = btsById(d.pickupPointId) ? d.pickupPointId : null;
      saveBtsPoint(S.btsPoint);
      if (S.btsPoint) S.btsRegion = btsById(S.btsPoint).region;
      if (S.screen === 'profile') {
        document.getElementById('screen-wrap').innerHTML = renderProfile();
      }
    }
  } catch (e) { /* rol aniqlanmadi — xaridor bo'lib qolaveradi */ }
}

async function loadSellerData() {
  if (S.role !== 'seller') return;
  S.sLoading = true;
  try {
    // Sharhlar alohida `catch` bilan: sharh so'rovi yiqilsa ham mahsulot va
    // buyurtma ro'yxati ochilaversin (kabinetning asosiy ishi ular)
    const [prods, orders, revs] = await Promise.all([
      sellerFetch('/api/seller/products'),
      sellerFetch('/api/seller/orders'),
      sellerFetch('/api/seller/reviews').catch(() => null),
    ]);
    S.sProducts = Array.isArray(prods) ? prods : [];
    S.sOrders = Array.isArray(orders) ? orders : [];
    S.sReviews = revs && Array.isArray(revs.items) ? revs : null;
  } catch (e) {
    showToast(e.message);
  } finally {
    S.sLoading = false;
  }
}

function enterSellerMode() {
  S.sellerMode = true;
  S.screen = 's-products';
  S.history = [];
  render();
  loadSellerData().then(render);
}
function exitSellerMode() {
  S.sellerMode = false;
  S.screen = 'home';
  S.history = [];
  render();
}
function sTab(k) { S.screen = k; S.history = []; render(); }
function setSProdTab(k) { S.sProdTab = k; render(); }
function setSOrdTab(k) { S.sOrdTab = k; render(); }

// ============ ISHGA TUSHIRISH ============
const inTelegram = !!(window.Telegram?.WebApp?.initData);
if (window.Telegram?.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  // iOS'da ekran yuqori chetidan pastga svayp qilinsa Mini App tasodifan yopilib
  // ketmasligi uchun — ro'yxatlar tepasida scroll bilan to'qnashadi
  try { Telegram.WebApp.disableVerticalSwipes(); } catch (e) {}
  // Telegramning o'z sarlavha panelini/fonini ilova dizayniga moslash (iOS/Android)
  try {
    Telegram.WebApp.setHeaderColor('#FFFDFB');
    Telegram.WebApp.setBackgroundColor('#FFFDFB');
  } catch (e) {}
}
document.documentElement.classList.toggle('in-telegram', inTelegram);
S.tgUser = loadTgUser();
S.tgPhone = localStorage.getItem('lolamarket_tg_phone') || null;
render();

// Bazadan yangi ma'lumot yuklab, kelgach qayta render qilamiz
(async () => {
  await loadProductsFromServer();
  await loginTelegram();          // Telegram orqali kirish (imzo serverda tekshiriladi)
  await loadOrdersFromServer();
  await loadDisputes();           // o'z bahslari — buyurtma kartochkasida ko'rsatiladi
  await loadMyReviews();          // qaysi mahsulotni allaqachon baholagan
  await loadMe();                 // rol: xaridormi yoki sotuvchi (serverda aniqlanadi)
  render();
  if (S.role === 'seller') loadSellerData().then(render);
})();
