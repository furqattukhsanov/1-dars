// ============ BUYURTMA HOLATI TARIXI ============
// `orders.status` faqat JORIY holatni saqlaydi. Bu modul har bir o'tishni
// `order_status_history` ga yozadi: qachon, qaysi holatdan qaysisiga, kim.
//
// ---- Nega `client`, `pool` emas ----
// Funksiya HAR DOIM tranzaksiya klientini oladi va uni O'ZI ochmaydi. Bu
// ataylab: tarix yozuvi holat o'zgarishi bilan BITTA tranzaksiyada bo'lishi
// shart. Aks holda holat o'zgarib, tarix yozilmay qolishi mumkin edi —
// natijada tarix "ba'zan to'g'ri" bo'lardi, bu esa tarix umuman yo'qligidan
// YOMONROQ: unga qarab qaror qabul qilinadi va u jimgina yolg'on gapiradi.
// `pool` qabul qilinmaydi — imzoning o'zi noto'g'ri ishlatishni qiyinlashtiradi.
//
// ---- Nega xatoni yutmaydi ----
// Tarix yozilmasa butun o'tish ROLLBACK bo'ladi (chaqiruvchining tranzaksiyasi
// ichida `throw`). Ya'ni "holat o'zgardi, tarix yo'q" holati umuman yuzaga
// kelmaydi. Narxi: tarix jadvali buzilsa buyurtma oqimi ham to'xtaydi —
// bu ONGLI kelishuv (2026-08-03), chunki jimgina teshikli tarix eng yomon
// variant. Bunday nosozlik B1 alerti orqali darhol Telegram'ga chiqadi.

const ACTOR_KINDS = new Set(['buyer', 'seller', 'admin', 'bot', 'system']);

// `from` NULL bo'lishi mumkin — buyurtma endi yaratilgan bo'lsa.
// `actorTg` NULL bo'lishi mumkin — sayt buyurtmasida Telegram hisobi bo'lmasligi mumkin.
async function recordStatusChange(client, { orderId, from, to, actorKind, actorTg, note }) {
  // `pool` ham `.query` ga ega — ya'ni faqat uni tekshirish yetarli emas:
  // xato bilan `pool` uzatilsa yozuv tranzaksiyadan TASHQARIDA ketardi va
  // modulning butun maqsadi (atomiklik) jimgina yo'qolardi. Faqat pool'dan
  // olingan klientda `release()` bo'ladi — farqni shu ajratadi.
  if (!client || typeof client.query !== 'function' || typeof client.release !== 'function') {
    throw new Error('recordStatusChange: tranzaksiya klienti kerak (pool emas — pool.connect() dan olingan client)');
  }
  if (!orderId) throw new Error('recordStatusChange: orderId kerak');
  if (!to) throw new Error('recordStatusChange: to (yangi holat) kerak');
  // Noto'g'ri actorKind jimgina 'system' ga aylanmasin — u tarixni buzadi
  // (keyin "kim qildi" degan savolga javob yolg'on bo'lardi).
  if (!ACTOR_KINDS.has(actorKind)) {
    throw new Error(`recordStatusChange: noma'lum actorKind "${actorKind}"`);
  }

  await client.query(
    `INSERT INTO order_status_history (order_id, from_status, to_status, actor_kind, actor_tg, note)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      orderId,
      from || null,
      to,
      actorKind,
      // Telegram ID bigint — satr sifatida kelsa ham Postgres o'zi o'giradi,
      // lekin bo'sh satr NULL bo'lishi kerak (aks holda xato beradi).
      actorTg === undefined || actorTg === null || actorTg === '' ? null : String(actorTg),
      note ? String(note).slice(0, 1000) : null,
    ]
  );
}

module.exports = { recordStatusChange, ACTOR_KINDS };
