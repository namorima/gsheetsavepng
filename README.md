# GSheet Viewer — Google Sheets → PNG

Alat untuk memaparkan eksport Google Sheets (PDF) sebagai imej PNG, lengkap dengan fungsi crop, share URL, shortlink, dan hantar gambar terus ke aplikasi seperti WhatsApp atau Telegram.

---

## Alat Tersedia

| Alat | Fail | Kegunaan |
|---|---|---|
| **Sheet Viewer** | `sheet-viewer.html` | Satu sheet — crop, share URL, shortlink |
| **Multi Sheet** | `multisheet.html` | Berbilang sheet dari satu spreadsheet |
| **Multi URL Sheet** | `multiurlnsheet.html` | Berbilang sheet dari workbook berbeza |

Buka `index.html` untuk navigasi ke ketiga-tiga alat.

---

## Ciri Utama

- **Render PDF** — Google Sheets dimuatkan sebagai PDF dan dipaparkan sebagai gambar
- **Crop Auto** — tetapkan kawasan crop menggunakan nilai peratusan (%)
- **Crop Manual** — klik dan seret pada gambar untuk pilih kawasan
- **URL Builder** — bina URL eksport dengan mudah tanpa perlu tahu format URL Google Sheets
- **URL Kongsi** — jana pautan yang boleh dikongsi dengan parameter URL dan tetapan crop
- **Shortlink** — pendekkan URL kongsi menggunakan perkhidmatan Sink (optional, konfigurasi dalam peranti sendiri)
- **Salin / Simpan / Kongsi** — salin ke clipboard, muat turun PNG, atau kongsi terus ke WhatsApp/Telegram
- **Multi Workbook** — gabungkan sheet dari spreadsheet berbeza dalam satu pandangan

---

## Prasyarat

Google Sheets **mesti ditetapkan sebagai public** (boleh diakses tanpa log masuk):

1. Buka Google Sheets
2. **File → Share → Share with others**
3. Tukar kepada **Anyone with the link → Viewer**

---

## Cara Guna

### Sheet Viewer (`sheet-viewer.html`)

1. Tampal URL Google Sheets atau URL eksport PDF ke dalam kotak input
2. Atau guna **URL Builder** untuk bina URL eksport dengan mudah
3. Pilih **Tetapan Crop** (Auto / Manual / Tiada) — pilihan
4. Tekan **MUAT**
5. Salin, simpan, atau kongsi gambar

**URL Builder** menerima mana-mana URL Google Sheets dan akan auto-ekstrak Sheet ID (gid):
```
https://docs.google.com/spreadsheets/d/{ID}/edit?gid=123456789#gid=123456789
```

**Parameter URL untuk bookmark:**
```
sheet-viewer.html?url=<URL_ENCODED>&crop=x,y,lebar,tinggi
```

---

### Multi Sheet (`multisheet.html`)

Untuk memaparkan berbilang tab/sheet dari **satu spreadsheet yang sama**:

1. Masukkan URL/ID Spreadsheet di bahagian atas
2. Tambah GID sheet yang dikehendaki dalam senarai SHEET
3. Tetapkan crop berasingan bagi setiap sheet (klik ⚙)
4. Tekan **MUAT SEMUA**

---

### Multi URL Sheet (`multiurlnsheet.html`)

Untuk memaparkan sheet dari **spreadsheet yang berbeza**:

1. Klik **+ Tambah Sheet** untuk tambah baris baharu
2. Tampal URL Google Sheets (apa-apa format) ke setiap baris — sistem akan auto-tukar ke format eksport PDF
3. Beri nama (pilihan) bagi setiap sheet untuk kenalpasti dengan mudah
4. Tetapkan crop berasingan jika perlu (klik ⚙)
5. Tekan **MUAT SEMUA**

**URL Kongsi** dikodkan sebagai `?config=<base64(JSON)>` — boleh dikongsi dan di-bookmark.

---

### Tetapan Crop

| Mod | Cara |
|---|---|
| **Auto** | Nilai dalam % — X, Y, Lebar, Tinggi. Ada pratetap (½ Atas, ½ Bawah, ½ Kiri, ½ Kanan) |
| **Manual** | Klik dan seret pada gambar untuk pilih kawasan; **Eksport ke Auto** untuk simpan nilai |
| **Tiada** | Gambar penuh tanpa crop |

---

### Shortlink (Pilihan)

Gunakan perkhidmatan **Sink** (self-hosted URL shortener) untuk memendekkan URL kongsi:

1. Klik butang **⚙** di bahagian URL Kongsi
2. Masukkan URL instance Sink dan API Token
3. Tetapan disimpan dalam peranti anda sahaja (localStorage) — tiada data dihantar ke mana-mana
4. Klik butang **🔗** untuk jana shortlink

> Butang 🔗 hanya muncul apabila konfigurasi Sink lengkap.

---

### Kongsi Gambar ke Aplikasi

Butang **Kongsi Gambar** muncul secara automatik pada peranti yang menyokong Web Share API (Android, iOS). Klik untuk kongsi gambar terus ke WhatsApp, Telegram, Email, dan lain-lain.

> Butang ini tidak muncul pada desktop Chrome.

---

## Struktur Projek

```
gsheet-pdf-png/
├── index.html              # Landing page — navigasi ke tiga alat
├── sheet-viewer.html       # Viewer satu sheet
├── multisheet.html         # Viewer berbilang sheet, satu spreadsheet
├── multiurlnsheet.html     # Viewer berbilang sheet, pelbagai workbook
├── workers.js              # Cloudflare Worker — proksi CORS + Sink API
├── CLAUDE.md               # Dokumentasi teknikal untuk AI
└── memory/                 # Memori AI (rujukan untuk sesi akan datang)
```

### workers.js — Proksi CORS

Worker ini diperlukan kerana browser menyekat permintaan langsung ke `docs.google.com` (CORS). Worker bertindak sebagai perantara:

```
Browser → Worker (gsheetproxy.uncle.workers.dev) → Google Sheets
```

Worker menyokong dua mod:
- `?url=<gsheet_url>` — proksi ke Google Sheets (hanya `docs.google.com/spreadsheets/`)
- `?sink_target=<url>` — proksi ke Sink API (untuk shortlink)

**Deploy ke Cloudflare Workers:**

1. Log masuk ke [dash.cloudflare.com](https://dash.cloudflare.com)
2. Pergi ke **Workers & Pages → Create**
3. Salin kandungan `workers.js` dan deploy
4. Kemas kini URL worker dalam fail HTML jika URL berubah (cari `gsheetproxy.uncle.workers.dev`)

---

## Deploy GitHub Pages

1. Fork atau push repo ini ke GitHub
2. Pergi ke **Settings → Pages**
3. Source: `main` branch → `/ (root)`
4. Klik **Save**
5. Akses di: `https://{username}.github.io/gsheet-pdf-png/`

---

## Had & Catatan

- Hanya **halaman pertama** PDF yang dirender
- Sheet mesti **public** — sheet peribadi tidak akan berfungsi
- **Salin Gambar** mungkin memerlukan kebenaran clipboard pada sesetengah browser
- **Kongsi Gambar** hanya berfungsi pada HTTPS (GitHub Pages sudah HTTPS)
- **Shortlink** memerlukan instance Sink yang anda uruskan sendiri

---

## Teknologi

| Komponen | Teknologi |
|---|---|
| PDF rendering | [PDF.js](https://mozilla.github.io/pdf.js/) v3.11.174 |
| CORS proxy | Cloudflare Workers |
| Hosting | GitHub Pages |
| Shortlink | [Sink](https://github.com/ccbikai/sink) (self-hosted, optional) |
| Fon | IBM Plex Sans & IBM Plex Mono |
