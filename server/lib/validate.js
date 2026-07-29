// ============ VALIDATSIYA (PROMPT 1 / Dars 11) ============
// Zod o'rnini bosuvchi minimal validator — tashqi dependency qo'shmasdan.
// Muhim: server HECH QACHON client tekshiruviga ishonmaydi. Client validatsiyasi
// (brauzerdagi forma) faqat UX uchun — DevTools orqali uni chetlab o'tish oson,
// shu sabab har bir yozuv shu yerda, server tomonda, qaytadan tekshiriladi.
//
// Qoida obyekti maydon uchun: { type:'string'|'int', required, min, max, enum, default }
//   string: min/max = belgilar soni
//   int:    min/max = qiymat chegarasi
function checkField(value, rule, field) {
  const isEmpty = value == null || value === '';
  if (isEmpty) {
    if (rule.required) return { error: `${field}: majburiy maydon` };
    return { value: rule.default !== undefined ? rule.default : null };
  }
  if (rule.type === 'int') {
    const n = typeof value === 'number' ? value : parseInt(value, 10);
    if (!Number.isInteger(n)) return { error: `${field}: butun son bo'lishi kerak` };
    if (rule.min != null && n < rule.min) return { error: `${field}: kamida ${rule.min}` };
    if (rule.max != null && n > rule.max) return { error: `${field}: ${rule.max} dan oshmasligi kerak` };
    return { value: n };
  }
  if (typeof value !== 'string') return { error: `${field}: matn bo'lishi kerak` };
  const s = value.trim();
  if (rule.min != null && s.length < rule.min) return { error: `${field}: kamida ${rule.min} belgi` };
  if (rule.max != null && s.length > rule.max) return { error: `${field}: ${rule.max} belgidan oshmasligi kerak` };
  if (rule.enum && !rule.enum.includes(s)) return { error: `${field}: ruxsat etilmagan qiymat` };
  return { value: s };
}

// Butun obyektni sxema bo'yicha tekshiradi.
// { ok:true, data:{...tozalangan} } yoki { ok:false, error:'birinchi xato', errors:[...] }
function validate(data, schema) {
  const out = {};
  const errors = [];
  for (const field in schema) {
    const res = checkField(data ? data[field] : undefined, schema[field], field);
    if (res.error) errors.push(res.error);
    else out[field] = res.value;
  }
  return errors.length ? { ok: false, error: errors[0], errors } : { ok: true, data: out };
}

// Foydalanuvchiga ko'rsatish mumkin bo'lgan xato (validatsiya / biznes qoidasi).
// Server ICHKI xatolari (DB, tarmoq) bu belgiga ega bo'lmaydi — ular umumiy
// "server error" bilan yashiriladi, shunda stack trace yoki DB detallari
// hech qachon klientga chiqmaydi (Dars 11 — xato boshqaruvi).
class ClientError extends Error {
  constructor(message) {
    super(message);
    this.userFacing = true;
  }
}

module.exports = { checkField, validate, ClientError };
