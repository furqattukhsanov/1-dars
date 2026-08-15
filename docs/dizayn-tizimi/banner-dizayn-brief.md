# LolaMarket Mini App — reklama banneri: DIZAYN BRIEFI

**Kimga:** Claude Design · **Sana:** 2026-08-15
**Vazifa:** Telegram Mini App bosh sahifasidagi 3 ta banner slaydining
FON RASMINI qayta chizish. Hozirgi rasmlar — oddiy pastel mato teksturasi
(pushti/sariq/ko'k atlas), ular ishlayapti, lekin brend xarakteri yo'q.

---

## 1. Rasm nima va nima EMAS

Rasm — **FAQAT FON.** Matn (sarlavha, kichik yorliq), strelka va nuqtalar
rasm ustiga ilova o'zi chizadi va til (uz/ru) almashganda o'zi almashadi.

Shuning uchun:
- Rasmda **hech qanday matn, harf, raqam, logo yozuvi bo'lmasin**
- Rasmda **tugma, strelka, nuqta chizilmasin** — ular ustidan qo'yiladi
- Rasm o'z-o'zidan «tugallangan reklama» emas — u sahna, ustiga so'z tushadi

---

## 2. Tuval

| | |
|---|---|
| O'lcham | **1200 × 338 px** |
| Nisbat | **32:9** (16:4.5) — ingichka gorizontal tasma, qat'iy |
| Rang profili | sRGB |
| Fayl | WebP (asosiy) + JPEG (zaxira), har biri **≤ 55 KB** |
| Soni | **3 slayd** |
| Burchak | ekranda 20px radius bilan yumaloqlanadi — har burchakdan 67px ichkarida muhim detal bo'lmasin |

⚠️ **Masshtab:** rasm telefonda 328–398 px kenglikda ko'rinadi, ya'ni
**~3.5 barobar kichrayadi** (tuvaldagi 100px → ekranda 27px). Nozik detal,
ingichka chiziq, mayda naqsh — hammasi yo'qoladi. Ingichka tasmada mato
«foto» emas, **tekstura/kayfiyat** bo'lib ko'rinadi. Shunga chizing: yirik
shakllar, silliq o'tishlar, bitta kuchli rang kayfiyati.

---

## 3. Zonalar (1200 × 338 tuvalda)

```
x=0            x=780                    x=1200
┌──────────────┼────────────────────────┐
│              │                        │
│  MATN ZONASI │   TINCH ZONA (o'ng 35%)│
│  (chap 65%)  │   strelka + nuqtalar   │
│  fon O'RTACHA│   shu yerda turadi     │
│  kontrastda  │                        │
└──────────────┴────────────────────────┘
```

| Zona | Talab |
|---|---|
| **Chap 65%** (x 0→780) | Ustiga **to'q rangli matn** tushadi (`#171A30` — indigo-qora). Fon shu yerda **och va tinch** bo'lsin, matn o'qilsin. Naqsh bo'lsa — juda yumshoq, kontrast past |
| **O'ng 35%** (x 780→1200) | Ustiga **oq nuqtalar** va **rangli strelka** tushadi. Fon shu yerda **bir tekis** — mato burmasi, soya, gradient. Kontrastli chiziq/naqsh bo'lmasin |
| Vertikal | tuvalning yuqori va pastki 47px'i — nafas, muhim detal bo'lmasin |

Ya'ni kompozitsiya: **chapda och, tinch, matn uchun «havo»; o'ngda mato
o'zi «gapiradi»** — burma, yorug'lik, chuqurlik. Hozirgi rasmlar aynan shu
tuzilishda va u to'g'ri ishlayapti — saqlansin.

---

## 4. Uch slayd — mazmun va rang kayfiyati

Har slaydning o'z **urg'u rangi** bor — ilova o'sha rangda kichik yorliq va
strelka chizadi. Fon shu rangga hamohang bo'lsin (bir xil emas — hamohang).

| # | Nima haqida | Ustiga tushadigan matn (uz) | Urg'u rangi | Fon kayfiyati |
|---|---|---|---|---|
| 1 | AI xizmati — mato suratini jonli modelga kiydirish | yorliq: *AI XIZMATI* · sarlavha: **Matolarni jonlantiring** | Anor `#7a140d` | Iliq, pushti-anor tonlar. Ipak/atlas — yaltiroq, harakatli burma. «Jonlanish» hissi |
| 2 | 24/7 buyurtma | sarlavha: **24/7 buyurtma berishingiz mumkin** | Za'faron `#89540C` | Iliq sariq-oltin. Paxta/adras — tinch, ishonchli, «har doim ochiq» |
| 3 | Ilk 3 buyurtmaga bepul yetkazish | yorliq: *ILK 3 TA BUYURTMA* · sarlavha: **Bepul yetkazib berish** | Feruza `#0C656F` | Salqin ko'k-feruza. Ikat/so'zana ohangi — Samarqand koshini rangi, sovg'a hissi |

Sarlavha shrifti (ma'lumot uchun, chizilmaydi): Bricolage Grotesque 800,
ekranda 17px, 1–2 qator. Yorliq: Hanken Grotesk 700, kichik, katta harf.

---

## 5. Brend

- **LolaMarket** — O'zbekiston to'qima matolari uchun B2B bozor. Auditoriya:
  tikuvchilar, ateliyelar, mato do'konlari — professional xaridorlar
- **Mavzu:** ikat, adras, so'zana, ipak, paxta, atlas — O'zbek matolari.
  Xitoycha «stok foto» hissi emas, mahalliy mato, mahalliy nur
- **Palitra:** anor `#7a140d` (asosiy brend), lola-qizil `#E84B40`, feruza
  `#119DAB`, za'faron `#D98E0C`, indigo-qora `#171A30`, iliq oq `#FBF6EC`
- **Uslub:** yumshoq, premium, tabiiy nur. Glassmorphism ilova — rasm uning
  ichida «shisha» kartochka ostida turadi. Qattiq neon, og'ir grafika,
  3D render hissi — yo'q
- **Ton:** ishonchli savdo hamkori, «hype» emas

---

## 6. Qilinmasin

- ❌ Matn, harf, raqam, logo (ilova o'zi yozadi)
- ❌ Tugma, strelka, nuqta, ramka (ilova o'zi chizadi)
- ❌ Odam yuzi, qo'l — 338px balandlikda tanilmaydi, faqat chalg'itadi
- ❌ Mayda naqsh — 3.5x kichrayganda «shovqin» bo'ladi
- ❌ O'ng 35% da kontrastli detal — nuqtalar yo'qoladi
- ❌ Chap 65% da to'q fon — qora matn o'qilmaydi
- ❌ 3 slayd 3 xil dunyo bo'lib qolishi — bitta oila, uch kayfiyat

---

## 7. Topshiriladigan narsa

3 ta rasm, har biri 1200×338, WebP + JPEG, ≤ 55 KB.
Fayl nomlari: `ad-1`, `ad-2`, `ad-3` (AI / 24-7 / bepul yetkazish tartibida).

Ko'rish uchun mockup foydali bo'ladi: rasm 358×101 px o'lchamda, chapda
17px qora sarlavha, o'ngda 3 ta oq nuqta va strelka bilan — shunda
telefondagi haqiqiy ko'rinish darhol baholanadi.
