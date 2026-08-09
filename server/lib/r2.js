const https = require('https');
const crypto = require('crypto');
const {
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
  R2_BUCKET, R2_ENABLED, R2_ENDPOINT, R2_PUBLIC_BASE,
} = require('../config');

// ============ R2 — fayl ombori (S3 mos API) ============
// R2 kalitlari faqat shu modulda ishlatiladi — `telegram-api.js` da bot
// tokeni bilan bir xil naqsh: sir bitta joyda yashaydi va tarqamaydi.
//
// KUTUBXONA QO'SHILMADI (`@aws-sdk/client-s3` ~20 MB). Bizga S3 ning butun
// yuzasi kerak emas — ikkita amal (qo'yish, o'chirish) kerak, ularning
// imzolash tartibi esa quyida ~40 qator. Katta bog'liqlik qo'shilsa u
// yangilanishi, auditdan o'tishi va deploy hajmini ko'tarishi kerak bo'lardi.
//
// Imzo — AWS Signature V4. R2 da hudud har doim `auto`, xizmat nomi `s3`.

const REGION = 'auto';
const SERVICE = 's3';

function sha256hex(x) {
  return crypto.createHash('sha256').update(x).digest('hex');
}

function hmac(key, str) {
  return crypto.createHmac('sha256', key).update(str, 'utf8').digest();
}

// RFC 3986. `encodeURIComponent` ning O'ZI yetarli emas — u `!'()*` ni
// qochirmaydi, AWS imzosi esa ularni qochirilgan holda kutadi. Nomuvofiqlik
// imzoni buzadi va xato `SignatureDoesNotMatch` bo'lib keladi, ya'ni sababi
// "kalit noto'g'ri" ga o'xshab ko'rinadi — aslida kalit joyida bo'ladi.
function uriEncode(s) {
  return encodeURIComponent(String(s))
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

// Kalitdagi `/` yo'l AJRATKICHI bo'lib qolishi kerak (`ai/2026/xxx.png`),
// shuning uchun butun kalitga emas, HAR BO'LAKKA alohida qo'llanadi.
function encodeKey(key) {
  return String(key).split('/').map(uriEncode).join('/');
}

function signingKey(dateStamp) {
  let k = hmac('AWS4' + R2_SECRET_ACCESS_KEY, dateStamp);
  k = hmac(k, REGION);
  k = hmac(k, SERVICE);
  return hmac(k, 'aws4_request');
}

// `20260809T101112Z` — imzo aynan shu shaklni kutadi (tire, ikki nuqta va
// millisekundsiz).
function amzTimestamp(now) {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Kalit — bizning tomondan yasaladi (`ai/<id>.png`), foydalanuvchidan
// KELMAYDI. Shunga qaramay tekshiriladi: kelajakda kimdir uni tashqi
// qiymatdan yasasa, `..` bilan bucket ichida boshqa joyga yozish yo'li
// ochilardi va buni hech narsa ushlamasdi.
function tekshirKalit(key) {
  const v = String(key || '');
  if (!v || v.length > 512) throw new Error('R2 kaliti yaroqsiz: uzunlik');
  if (v.startsWith('/') || v.includes('..') || v.includes('//')) {
    throw new Error('R2 kaliti yaroqsiz: yo\'l shakli');
  }
  return v;
}

function imzolangan(method, key, payload, extraHeaders) {
  const now = new Date();
  const amzDate = amzTimestamp(now);
  const dateStamp = amzDate.slice(0, 8);
  const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${R2_BUCKET}/${encodeKey(key)}`;
  const payloadHash = sha256hex(payload);

  const headers = Object.assign({
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  }, extraHeaders || {});

  // Imzolangan sarlavhalar ALIFBO tartibida va kichik harfda bo'lishi shart.
  const names = Object.keys(headers).map((h) => h.toLowerCase()).sort();
  const lower = {};
  for (const h of Object.keys(headers)) lower[h.toLowerCase()] = String(headers[h]).trim();

  const canonicalHeaders = names.map((h) => `${h}:${lower[h]}\n`).join('');
  const signedHeaders = names.join(';');
  const canonicalRequest = [
    method, canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash,
  ].join('\n');

  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256', amzDate, scope, sha256hex(canonicalRequest),
  ].join('\n');
  const signature = crypto.createHmac('sha256', signingKey(dateStamp))
    .update(stringToSign, 'utf8').digest('hex');

  // `Authorization` imzodan KEYIN qo'shiladi — u imzolangan sarlavhalar
  // ro'yxatiga kirmaydi.
  headers.Authorization = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${scope}, `
    + `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { host, path: canonicalUri, headers };
}

function sorov(method, key, payload, extraHeaders) {
  // ⚠️ TARTIB: kalit AVVAL, sozlama KEYIN. Yaroqsiz kalit — DASTUR xatosi va
  // u sozlamaga bog'liq emas; sozlama tekshiruvi oldinda tursa, R2 o'chiq
  // muhitda kalit qorovulini sinab ham bo'lmasdi (u har doim "R2 sozlanmagan"
  // deb qaytarardi va qorovul sinovsiz qolardi).
  tekshirKalit(key);
  if (!R2_ENABLED) return Promise.reject(new Error('R2 sozlanmagan'));
  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload || '');
  const { host, path, headers } = imzolangan(method, key, body, extraHeaders);

  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: host, path, method, headers }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, etag: res.headers.etag || '', body: data });
          return;
        }
        // ⚠️ Javob TANASI xato sababini aytadi (`SignatureDoesNotMatch`,
        // `NoSuchBucket`) va usiz tashxis qo'yib bo'lmaydi. Sir emas —
        // kalitning o'zi javobda qaytmaydi.
        reject(new Error(`R2 ${method} ${res.statusCode}: ${String(data).slice(0, 300)}`));
      });
    });
    req.on('error', reject);
    req.setTimeout(30_000, () => req.destroy(new Error('R2 so\'rovi vaqti tugadi')));
    if (body.length) req.write(body);
    req.end();
  });
}

// Faylni bucket'ga qo'yadi. `contentType` MAJBURIY va bu ataylab:
// `/api/product-photo` da aynan shu narsa tishlagan edi — Telegram
// `application/octet-stream` qaytarardi va Cloudflare rasm optimizatsiyasi
// ishlamay qolardi. Bu yerda turni BIZ yozamiz, ya'ni taxmin qolmaydi.
function r2Put(key, buf, contentType, cacheControl) {
  // Zaxira qiymat ATAYLAB yo'q (`application/octet-stream` ga tushib
  // qolmasin): aynan shu tur `/api/product-photo` da Cloudflare rasm
  // optimizatsiyasini o'ldirgan edi. Tur noma'lum bo'lsa — chaqiruvchi
  // aniqlasin, biz taxmin qilmaymiz.
  if (!contentType) throw new Error('R2: contentType majburiy');
  const body = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return sorov('PUT', key, body, {
    'content-type': contentType,
    'content-length': String(body.length),
    // Ommaviy katalog rasmi — CDN uzoq keshlasin. Kalit tarkibga bog'liq
    // (`sourceHash`), ya'ni fayl o'zgarsa kalit ham o'zgaradi va eski kesh
    // hech qachon noto'g'ri rasm ko'rsatmaydi.
    'cache-control': cacheControl || 'public, max-age=31536000, immutable',
  });
}

function r2Delete(key) {
  return sorov('DELETE', key, Buffer.alloc(0), {});
}

// Ommaviy manzil. `null` qaytishi NORMAL holat — domen ulanmagan bo'lsa
// chaqiruvchi eski Telegram proksisiga qaytadi. Zaxira sifatida "taxminiy"
// URL YASALMAYDI: ishlamaydigan havola yo'q havoladan yomonroq, chunki u
// buzilgan rasm bo'lib ko'rinadi va sababini hech kim ko'rmaydi.
function r2PublicUrl(key) {
  if (!R2_PUBLIC_BASE || !key) return null;
  return `${R2_PUBLIC_BASE}/${encodeKey(key)}`;
}

module.exports = {
  r2Put, r2Delete, r2PublicUrl,
  // `tekshirKalit` va `encodeKey` ichki funksiyalar, lekin ATAYLAB
  // eksport qilinadi: qorovulni to'g'ridan-to'g'ri sinash mumkin bo'lsin
  // (loyiha darsi — yozilgan qoida himoya emas, uni tekshiradigan test himoya).
  tekshirKalit, encodeKey,
  R2_ENABLED, R2_ENDPOINT, R2_BUCKET,
};
