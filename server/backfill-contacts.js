#!/usr/bin/env node
// ============ BIR MARTALIK: contacts.json → users.phone (2026-08-16) ============
// Telefon raqami endi FAQAT `users.phone` da yashaydi (`/api/me` shu ustundan
// o'qiydi). Ilgari u ikki joyda edi: `contacts.json` fayli (Mini App uchun) va
// `users.phone` (sayt uchun) — bazaga yozish esa faqat 2026-08-14 da qo'shildi.
//
// Ya'ni O'SHA SANAGACHA kontaktini ulashgan odamlarning raqami faqat FAYLDA
// qolgan bo'lishi mumkin. Fayl endi o'qilmaydi, shuning uchun bu skript uni
// bir marta bazaga ko'chiradi.
//
// ⚠️ FAQAT BO'SH joy to'ldiriladi (`WHERE phone IS NULL`). Bu ATAYLAB:
// bazadagi raqam yangiroq bo'lishi mumkin (foydalanuvchi keyin kontaktini
// qayta yuborgan bo'lsa, `webhook.js` uni USTIDAN yozgan). Fayl esa eski
// holatni saqlaydi — u yangi raqamni bosib ketmasin.
//
// ⚠️ SKRIPT SERVERDA ishlaydi. Ishga tushirish:
//     cd /opt/lolamarket-notify && node backfill-contacts.js [fayl yo'li]
// Ikki marta ishga tushirilsa zarar yo'q — ikkinchisida o'zgarish bo'lmaydi
// (idempotent, chunki to'ldirilgan qatorda `phone` endi `NULL` emas).
//
// 🔴 YO'L ARGUMENT BILAN BERILADI va bu O'LCHOVDAN kelib chiqqan
// (2026-08-16): tirik papkada `contacts.json` UMUMAN YO'Q edi. Sabab —
// papka egaligi `501:staff` (rsync `-a` lokal macOS UID'ini raqam bo'yicha
// ko'chirgan), servis esa `www-data` nomidan ishlaydi va u yerga fayl
// YARATA OLMAYDI: `EACCES` alerti aynan shundan kelgan. Ya'ni raqamlar
// faylga yozilmay kelgan.
// LEKIN ular YO'QOLMAGAN: eski nusxalar `/opt/lolamarket-notify.bak-*/`
// papkalarida qolgan (o'lchandi — eng to'lasida 9 yozuv, ulardan 3 tasi
// bazada yo'q edi). Shuning uchun yo'l qat'iy emas:
//     node backfill-contacts.js /opt/lolamarket-notify.bak-20260813-000746/contacts.json
//
// ⚠️ Zaxira nusxa TANLANGANDA eng TO'LASI olinsin, eng yangisi emas —
// fayl vaqti-vaqti bilan yo'qolib turgan, ya'ni yangiroq nusxa kamroq
// yozuvga ega bo'lishi mumkin:
//     ls -S /opt/lolamarket-notify.bak-*/contacts.json | head -1
//
// Bajarilgandan keyin bu fayl ham, `contacts.json` ham keraksiz.

const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const FAYL = process.argv[2] || path.join(__dirname, 'contacts.json');

async function main() {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(FAYL, 'utf8'));
  } catch (e) {
    console.log(`contacts.json o'qilmadi (${e.message}) — ko'chiradigan narsa yo'q.`);
    return;
  }

  const yozuvlar = Object.entries(data)
    .filter(([uid, v]) => /^\d+$/.test(uid) && v && typeof v.phone === 'string' && v.phone.trim());
  console.log(`Faylda ${yozuvlar.length} ta raqam topildi.`);

  let toldirildi = 0;
  let tegilmadi = 0;
  for (const [uid, v] of yozuvlar) {
    const { rowCount } = await pool.query(
      `UPDATE users SET phone = $2 WHERE tg_user_id = $1 AND phone IS NULL`,
      [uid, v.phone.trim()]
    );
    if (rowCount) { toldirildi++; } else { tegilmadi++; }
  }

  console.log(`✅ To'ldirildi: ${toldirildi} ta.`);
  console.log(`   Tegilmadi: ${tegilmadi} ta (bazada raqam allaqachon bor yoki foydalanuvchi topilmadi).`);
}

main()
  .then(() => pool.end())
  .catch((e) => {
    // Birinchi argument — o'zgarmas kalit (alert guruhlash qoidasi).
    console.error('backfill-contacts xatosi:', e.message);
    pool.end();
    process.exit(1);
  });
