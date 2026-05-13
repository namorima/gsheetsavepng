# Sheet Viewer — Google Sheets → PNG

Alat ringkas untuk memaparkan eksport Google Sheets (PDF) sebagai imej, dengan fungsi crop, kongsi URL, dan hantar gambar terus ke aplikasi seperti WhatsApp.

---

## Ciri Utama

- **Render PDF** — Google Sheets dimuatkan sebagai PDF dan dipaparkan sebagai gambar
- **Crop Auto** — tetapkan kawasan crop menggunakan nilai peratusan (%)
- **Crop Manual** — klik dan seret pada gambar untuk pilih kawasan
- **URL Builder** — bina URL eksport dengan mudah tanpa perlu tahu format URL Google Sheets
- **URL Kongsi** — jana pautan yang boleh dikongsi dengan parameter URL dan tetapan crop
- **Salin / Simpan / Kongsi** — salin ke clipboard, muat turun PNG, atau kongsi terus ke WhatsApp/Telegram

---

## Demo

> Buka `sheet-viewer.html` terus dalam browser — tiada pemasangan diperlukan.

Atau lawati: `https://namorima.github.io/gsheetsavepng/sheet-viewer.html` _(selepas GitHub Pages diaktifkan)_

---

## Prasyarat

Google Sheets **mesti ditetapkan sebagai public** (boleh diakses tanpa log masuk):

1. Buka Google Sheets
2. **File → Share → Share with others**
3. Tukar kepada **Anyone with the link → Viewer**

---

## Cara Guna

### Kaedah 1 — Tampal URL terus

1. Pergi ke Google Sheets anda
2. Klik **File → Download → PDF**
3. Salin URL dari penyemak imbas (atau bina URL eksport secara manual):
   ```
   https://docs.google.com/spreadsheets/d/{ID}/export?format=pdf&gid={SHEET_ID}
   ```
4. Tampal URL ke dalam kotak input
5. Tekan **MUAT**

---

### Kaedah 2 — Guna URL Builder

1. Klik **Parameter URL** untuk expand panel
2. Tampal URL Google Sheets (contoh: URL dari penyemak imbas semasa sheet dibuka)
3. Sistem akan **auto-ekstrak Sheet ID (gid)** dari URL
4. Tetapkan **Format**, **Sheet ID**, dan **Range** jika perlu
5. URL eksport dijana secara automatik dalam kotak input utama
6. Tekan **MUAT**

**Contoh URL yang boleh ditampal ke URL Builder:**

```
https://docs.google.com/spreadsheets/d/1solmh4Tuc.../edit?gid=123456789#gid=123456789
```

---

### Tetapan Crop

Klik **Tetapan Crop** untuk expand panel. Tiga mod tersedia:

#### Auto (nilai peratusan)

| Field    | Penerangan         | Contoh                  |
| -------- | ------------------ | ----------------------- |
| X — kiri | Mula dari kiri (%) | `50` = mula dari tengah |
| Y — atas | Mula dari atas (%) | `0` = dari atas sekali  |
| Lebar    | Lebar kawasan (%)  | `50` = separuh lebar    |
| Tinggi   | Tinggi kawasan (%) | `100` = penuh tinggi    |

**Pratetap tersedia:** ½ Atas, ½ Bawah, ½ Kiri, ½ Kanan, Penuh

#### Manual

1. Pastikan tab **Manual** dipilih
2. Klik dan seret pada gambar untuk pilih kawasan
3. Klik **Guna Crop** untuk guna crop
4. Klik **Eksport ke Auto** untuk simpan nilai ke tab Auto (dalam %)
5. Klik **Buang** untuk buang pilihan

#### Tiada

Gambar penuh tanpa sebarang crop.

---

### Kongsi URL

Selepas imej dimuatkan, bahagian **URL Kongsi** akan muncul secara automatik di bawah.

URL mengandungi parameter `?url=` dan `&crop=` — sesiapa yang buka URL ini akan terus melihat imej yang sama dengan tetapan crop yang sama.

```
sheet-viewer.html?url=https%3A%2F%2Fdocs.google.com%2F...&crop=0,25,100,50
```

---

### Kongsi Gambar ke Aplikasi

Butang **Kongsi Gambar** akan muncul secara automatik pada peranti yang menyokong Web Share API (Android, iOS). Klik butang ini untuk kongsi gambar terus ke:

- WhatsApp
- Telegram
- Email
- dan lain-lain aplikasi yang dipasang

> Butang ini tidak muncul pada desktop Chrome kerana API tidak disokong.

---

## Struktur Projek

```
gsheetsavepng/
├── sheet-viewer.html   # Aplikasi web (HTML + CSS + JS dalam satu fail)
├── workers.js          # Cloudflare Worker — proksi CORS
└── README.md
```

### workers.js — Proksi CORS

Worker ini diperlukan kerana browser menyekat permintaan langsung ke `docs.google.com` (CORS). Worker bertindak sebagai perantara:

```
Browser → Worker (gsheetproxy.uncle.workers.dev) → Google Sheets
```

Worker **hanya membenarkan** URL bermula dengan `https://docs.google.com/spreadsheets/` sebagai langkah keselamatan.

**Deploy ke Cloudflare Workers:**

1. Log masuk ke [dash.cloudflare.com](https://dash.cloudflare.com)
2. Pergi ke **Workers & Pages → Create**
3. Salin kandungan `workers.js` dan deploy
4. Kemas kini URL worker dalam `sheet-viewer.html` (cari `gsheetproxy.uncle.workers.dev`)

---

## Deploy GitHub Pages

1. Fork atau push repo ini ke GitHub
2. Pergi ke **Settings → Pages**
3. Source: `main` branch → `/ (root)`
4. Klik **Save**
5. Akses di: `https://{username}.github.io/gsheetsavepng/sheet-viewer.html`

---

## Had & Catatan

- Hanya **halaman pertama** PDF yang dirender
- Sheet mesti **public** — sheet peribadi tidak akan berfungsi
- Fungsi **Salin Gambar** mungkin memerlukan kebenaran clipboard pada sesetengah browser
- Fungsi **Kongsi Gambar** hanya berfungsi pada HTTPS (GitHub Pages sudah HTTPS)

---

## Teknologi

| Komponen      | Teknologi                                             |
| ------------- | ----------------------------------------------------- |
| PDF rendering | [PDF.js](https://mozilla.github.io/pdf.js/) v3.11.174 |
| CORS proxy    | Cloudflare Workers                                    |
| Hosting       | GitHub Pages                                          |
| Fon           | IBM Plex Sans & IBM Plex Mono                         |
