# gsheet-pdf-png

Alat untuk menukar eksport Google Sheets (format PDF) kepada imej PNG, dengan sokongan crop, share URL, dan kongsi gambar ke aplikasi.

## Gambaran Keseluruhan

Projek ini terdiri daripada dua komponen:

1. **`workers.js`** — Cloudflare Worker yang bertindak sebagai proksi CORS untuk URL Google Sheets. Digunakan untuk mengatasi sekatan CORS semasa mengambil PDF dari `docs.google.com`.
2. **`sheet-viewer.html`** — Aplikasi web satu halaman yang merender PDF eksport Google Sheets sebagai kanvas, membenarkan crop, dan menyimpan/menyalin/mengongsi hasilnya sebagai PNG.

## Senibina

```
Browser → sheet-viewer.html
             ↓ fetch PDF
         Cloudflare Worker (gsheetproxy.uncle.workers.dev)
             ↓ proxy request
         Google Sheets Export URL (docs.google.com/spreadsheets/...)
```

- Worker URL dikodkan keras dalam HTML: `https://gsheetproxy.uncle.workers.dev`
- Rendering PDF menggunakan **PDF.js** (CDN, v3.11.174) — hanya halaman pertama dirender buat masa ini
- Tiada backend selain Worker — semua logik ada dalam HTML sahaja

## Deployment

| Komponen | Platform | Status |
|---|---|---|
| `workers.js` | Cloudflare Workers | Sudah deploy |
| `sheet-viewer.html` | GitHub Pages | **Belum** — dirancang |

## Cara Guna

1. Buka `sheet-viewer.html` dalam browser
2. Masukkan URL eksport Google Sheets, atau gunakan **URL Builder** untuk bina URL
3. Pilih mod crop (Auto / Manual / Tiada) dalam **Tetapan Crop**
4. Tekan **MUAT**
5. Salin, simpan, atau kongsi gambar sebagai PNG

### Parameter URL

Boleh pra-isi melalui query string:
```
sheet-viewer.html?url=<URL_ENCODED>&crop=x,y,w,h
```
- `crop` dalam peratusan (%) — format: `x,y,lebar,tinggi`
- Contoh: `&crop=0,50,100,50` → separuh bawah gambar
- URL kongsi dijana secara automatik dalam bahagian **URL Kongsi**

## Ciri-ciri

### URL Builder *(collapsed by default)*
- Bina URL eksport tanpa perlu tahu format URL Google Sheets
- Input: URL/ID Spreadsheet, Format (PDF/CSV/XLSX/ODS/TSV), Sheet ID (gid), Range
- **Auto-ekstrak gid** daripada URL yang ditampal — termasuk dari query param (`?gid=`) dan hash fragment (`#gid=`)
- Butang **Parse dari URL** — urai URL sedia ada dalam input utama ke dalam field builder
- URL eksport dikemas kini secara langsung (real-time) apabila mana-mana field diubah

### Tetapan Crop *(collapsed by default)*
Tiga mod crop, boleh tukar tanpa reload:

| Mod | Cara |
|---|---|
| **Auto** | Nilai dalam peratusan (%) — X, Y, Lebar, Tinggi. Ada butang pratetap (½ Atas, ½ Bawah, dll.) |
| **Manual** | Klik dan seret pada gambar untuk pilih kawasan secara visual |
| **Tiada** | Gambar penuh tanpa crop |

- **Eksport ke Auto** — tukar koordinat piksel manual crop kepada nilai peratusan dalam tab Auto
- Tab boleh ditukar tanpa menutup/membuka section

### URL Kongsi
- Jana URL yang boleh dikongsi dengan parameter `?url=` dan `&crop=`
- Dikemas kini secara automatik apabila URL atau tetapan crop berubah
- Butang **SALIN** untuk salin ke clipboard

### Tindakan Gambar
- **Salin Gambar** — salin ke clipboard (fallback: buka tab baru)
- **Simpan Gambar** — muat turun sebagai PNG dengan nama `sheet-YYYY-MM-DD.png`
- **Kongsi Gambar** — guna Web Share API untuk kongsi ke WhatsApp, Telegram, dll. *(hanya muncul pada peranti/browser yang sokong — Android Chrome, iOS Safari)*

## Struktur JavaScript (sheet-viewer.html)

| Fungsi | Tujuan |
|---|---|
| `loadSheet()` | Fetch PDF via Worker, render dengan PDF.js |
| `applyCurrentCrop()` | Guna crop auto (%) pada `renderedCanvas` |
| `applyManualCrop()` | Guna crop dari `manualCropRect` |
| `exportToAutoCrop()` | Tukar manual rect → nilai % dalam field Auto |
| `switchTab(tab)` | Tukar mod crop, kemas kini UI dan share URL |
| `setupDrag()` | Daftarkan event listeners drag (AbortController) |
| `buildExportUrl()` | Bina URL eksport dari field builder |
| `parseUrlToBuilder()` | Urai URL → isi field builder |
| `extractGidFromUrl()` | Ekstrak gid dari query param atau hash fragment |
| `updateShareUrl()` | Jana dan papar URL kongsi |
| `shareImage()` | Kongsi gambar via Web Share API |
| `toggleCrop()` | Expand/collapse Tetapan Crop |
| `toggleBuilder()` | Expand/collapse URL Builder |

## Nota Teknikal

- **Drag fix**: `mouseup` dan `mousemove` dilisten pada `document` (bukan canvas) — mencegah `isDragging` tersangkut apabila tetikus keluar dari canvas
- **Canvas clone bug**: `cloneNode()` tidak memindahkan piksel canvas — guna `AbortController` untuk remove listeners tanpa klon
- **Web Share API**: Semak `navigator.canShare({ files })` sebelum tunjuk butang Kongsi — API hanya tersedia pada HTTPS dan peranti yang sokong

## Batasan Semasa

- Hanya **halaman pertama** PDF yang dirender
- Worker hanya menerima URL bermula dengan `https://docs.google.com/spreadsheets/` (keselamatan)
- Google Sheets mesti ditetapkan sebagai **public** (boleh diakses tanpa log masuk)
- Butang **Kongsi Gambar** tidak muncul di desktop Chrome (Web Share API tidak sokong fail)

## Ciri Dirancang

- [ ] Sokongan **berbilang halaman** — render dan navigasi antara halaman PDF
- [ ] **Format selain PDF** — sokongan eksport lain jika memungkinkan
- [ ] **Simpan tetapan crop** — ingat tetapan crop untuk URL tertentu (localStorage)
- [ ] **UI mobile** — layout responsif yang lebih baik untuk paparan telefon

## Fail

```
workers.js          # Cloudflare Worker (proksi CORS)
sheet-viewer.html   # Aplikasi web (HTML + CSS + JS dalam satu fail)
```
