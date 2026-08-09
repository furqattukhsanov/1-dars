'use strict';

// ============ AI RASMIGA BREND TASMASI (2026-08-09, founder qarori) ============
// "Shuni har bir AI bilan qilingan rasmni tagiga qo'y doim".
//
// Tasma rasm USTIGA QO'YILMAYDI, rasm TAGIGA QO'SHILADI: kadr 3:4 va uning
// pastki qismida kiyimning etagi turadi — ustiga yozilsa aynan shu joy
// yopilardi. Shuning uchun tuvalning bo'yi tasma balandligicha uzaytiriladi
// va rasmning o'zi butunligicha qoladi.
//
// ⚠️ TASMA MATNI KOD ICHIDA CHIZILMAYDI. Node'da shrift rasterizatori yo'q,
// bo'lganida ham serverda shrift fayliga bog'liqlik paydo bo'lardi. Shuning
// uchun tasma TAYYOR RASM sifatida `assets/lola-banner.png` da yotadi
// (1024×97, Hanken Grotesk, brend ranglari). Uni almashtirish uchun kod
// o'zgartirilmaydi — faqat fayl almashtiriladi va `BANNER_VERSION` oshiriladi.
//
// ⚠️ `BANNER_VERSION` — kesh kaliti bilan bog'langan (`lib/ai.js` →
// `imageSourceHash`). Fayl almashib, versiya qolsa: bazadagi kesh eski rasmni
// qaytaraverardi, R2 dagi obyekt esa `immutable, max-age=31536000` bilan
// yotgani uchun eski tasma BIR YIL ko'rinib turardi. Ya'ni versiyani oshirmaslik
// jimgina, uzoq muddatli yolg'on beradi.

const fs = require('fs');
const path = require('path');
const png = require('./png');

const BANNER_VERSION = 1;
const BANNER_YOLI = path.join(__dirname, '..', 'assets', 'lola-banner.png');

// Tasma bir marta o'qiladi va dekod qilinadi (har so'rovda emas): fayl
// o'zgarmaydi, dekod esa ~1024×97 uchun ham bekorga sarflangan ish bo'lardi.
let keshlangan = null;

function bannerImg() {
  if (!keshlangan) keshlangan = png.decode(fs.readFileSync(BANNER_YOLI));
  return keshlangan;
}

// PNG baytlariga brend tasmasini qo'shadi va YANGI PNG baytlarini qaytaradi.
// Xato bo'lsa TASHLAYDI — chaqiruvchi asl rasmga qaytishi kerak.
function addBanner(buf) {
  const rasm = png.decode(buf);
  const asl = bannerImg();

  // Tasma rasm eniga moslanadi, nisbati saqlanadi.
  const h = Math.max(1, Math.round(asl.height * (rasm.width / asl.width)));
  const tasma = png.resize(asl, rasm.width, h);

  const chiqish = Buffer.alloc(rasm.width * (rasm.height + h) * 4);
  rasm.data.copy(chiqish, 0);
  tasma.data.copy(chiqish, rasm.width * rasm.height * 4);

  return png.encode({ width: rasm.width, height: rasm.height + h, data: chiqish });
}

module.exports = { addBanner, BANNER_VERSION, BANNER_YOLI };
