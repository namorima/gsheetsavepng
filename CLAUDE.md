# gsheet-pdf-png

Alat untuk menukar eksport Google Sheets (format PDF) kepada imej PNG, dengan sokongan crop, share URL, shortlink, dan kongsi gambar ke aplikasi.

## Gambaran Keseluruhan

Projek ini terdiri daripada empat fail utama:

1. **`workers.js`** — Cloudflare Worker proksi CORS untuk Google Sheets & Sink API.
2. **`index.html`** — Landing page dengan navigasi ke dua alat utama.
3. **`sheet-viewer.html`** — Viewer satu sheet: crop, share URL, shortlink, kongsi PNG.
4. **`multisheet.html`** — Viewer berbilang sheet sekaligus dalam satu pandangan.

## Senibina

```
Browser → index.html
            ↓ pilih alat
       sheet-viewer.html  /  multisheet.html
            ↓ fetch PDF / Sink API
       Cloudflare Worker (gsheetproxy.uncle.workers.dev)
            ├─ ?url=<gsheet>   → proxy ke docs.google.com
            └─ ?sink_target=<url> → proxy ke Sink instance
```

- Worker URL dikodkan keras: `https://gsheetproxy.uncle.workers.dev`
- Rendering PDF menggunakan **PDF.js** (CDN, v3.11.174) — halaman pertama sahaja
- Tiada backend selain Worker — semua logik ada dalam HTML sahaja

## Deployment

| Komponen | Platform | Status |
|---|---|---|
| `workers.js` | Cloudflare Workers | Sudah deploy — kena redeploy bila ada perubahan |
| `*.html` | GitHub Pages | Dirancang |

> **Penting:** Setiap kali `workers.js` diubah, kena deploy semula ke Cloudflare Workers secara manual.

## Cara Guna

1. Buka `index.html` → pilih **Sheet Viewer** atau **Multi Sheet**
2. Masukkan URL eksport Google Sheets (atau guna URL Builder)
3. Pilih mod crop → tekan **MUAT**
4. Salin, simpan, atau kongsi gambar sebagai PNG

### Parameter URL (sheet-viewer.html)

```
sheet-viewer.html?url=<URL_ENCODED>&crop=x,y,w,h
```
- `crop` dalam peratusan (%) — format: `x,y,lebar,tinggi`
- Contoh: `&crop=0,50,100,50` → separuh bawah gambar

## Ciri-ciri

### index.html
- Landing page dengan 2 kad navigasi (Sheet Viewer, Multi Sheet)
- 3 langkah cara guna + nota prasyarat (sheet mesti awam)

### URL Builder *(collapsed by default — sheet-viewer.html)*
- Input: URL/ID Spreadsheet, Format (PDF/CSV/XLSX/ODS/TSV), Sheet ID (gid), Range
- **Auto-ekstrak gid** daripada URL — query param (`?gid=`) dan hash fragment (`#gid=`)
- Butang **Parse dari URL** — urai URL sedia ada ke dalam field builder
- URL eksport dikemas kini secara langsung (real-time)

### Tetapan Crop *(collapsed by default)*
| Mod | Cara |
|---|---|
| **Auto** | Nilai dalam % — X, Y, Lebar, Tinggi. Ada butang pratetap (½ Atas, ½ Bawah, dll.) |
| **Manual** | Klik dan seret pada gambar untuk pilih kawasan |
| **Tiada** | Gambar penuh tanpa crop |

- **Eksport ke Auto** — tukar koordinat piksel manual crop kepada nilai %

### URL Kongsi
- Jana URL yang boleh dikongsi dengan parameter `?url=` dan `&crop=`
- Dikemas kini automatik apabila URL atau tetapan crop berubah
- Susunan butang: `[Input] [⚙ Tetapan Shortlink] [🔗 Jana Shortlink] [SALIN]`

### Shortlink (Sink) — Optional
- Guna perkhidmatan **Sink** (miantiao-me/sink) untuk jana URL pendek
- Konfigurasi disimpan dalam `localStorage` sahaja — tiada upload ke mana-mana
- Butang ⚙ buka modal tetapan (URL Instance + API Token)
- Butang 🔗 hanya muncul bila konfigurasi lengkap
- Slug dijana dengan prefix `gspng-` + 5 char rawak (cth: `gspng-a3f9k`)
- **Deduplication**: semak cache (`sink_slug_map`) → verify via API → cipta baru jika perlu
- **Upsert**: bila crop/URL berubah, shortlink yang sama dikemas kini (slug kekal sama)

### Tindakan Gambar
- **Salin Gambar** — salin ke clipboard (fallback: buka tab baru)
- **Simpan Gambar** — muat turun sebagai `sheet-YYYY-MM-DD.png`
- **Kongsi Gambar** — Web Share API (Android Chrome, iOS Safari)
  - iOS: gambar discale ke max 1600px, JPEG 0.85 untuk elak "cannot be shared" error
  - Blob disiapkan secara selari (Promise.all) untuk kekalkan gesture timing

### Multi Sheet (multisheet.html)
- Tambah berbilang sheet dengan URL eksport masing-masing
- Senarai SHEET (GID) collapsed by default, ada count badge
- Checkbox per sheet — pilih sheet mana yang dimasukkan dalam share URL
- Render semua sheet dalam satu pandangan
- Tetapkan crop berasingan bagi setiap sheet
- **Kongsi Semua** — share semua sheet aktif sebagai satu sesi share

## Struktur JavaScript

### sheet-viewer.html
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
| `buildLongShareUrl()` | Bina URL kongsi panjang (tanpa shortlink) |
| `updateShareUrl()` | Jana & papar URL kongsi (shortlink atau panjang) |
| `shareImage()` | Kongsi gambar via Web Share API |
| `toggleCrop()` | Expand/collapse Tetapan Crop |
| `toggleBuilder()` | Expand/collapse URL Builder |
| `openSinkModal()` | Buka modal tetapan Sink |
| `saveSinkModal()` | Simpan konfigurasi Sink ke localStorage |
| `createShortlink()` | Jana / ambil semula shortlink (dengan dedup) |
| `upsertShortlink(url)` | Kemas kini shortlink sedia ada dengan URL baharu |
| `sinkFetch(path, body, method)` | Helper fetch ke Sink via Worker proxy |

### multisheet.html
Fungsi utama sama, tambahan:
| Fungsi | Tujuan |
|---|---|
| `buildShareUrl()` | Bina URL kongsi untuk sheet aktif sahaja |
| `shareAll()` | Kongsi semua sheet aktif sebagai PNG |
| `onEnabledChange(idx)` | Toggle checkbox sheet → kemas kini share URL |
| `toggleGidList()` | Expand/collapse senarai GID |

## workers.js — Mod Operasi

### Mod 1: Google Sheets Proxy (`?url=<gsheet_url>`)
- Hanya terima URL bermula `https://docs.google.com/spreadsheets/`
- Proxy fetch dengan `User-Agent: Mozilla/5.0`
- Return PDF/content dengan CORS headers

### Mod 2: Sink API Proxy (`?sink_target=<sink_url>`)
- Hanya terima URL bermula `https://`
- Forward `Authorization` dan `Content-Type` headers
- Sokong GET dan POST (body dihantar untuk non-GET/HEAD)
- Return response dengan CORS headers

### CORS
- Handle `OPTIONS` preflight → 204
- Headers: `Access-Control-Allow-Origin: *`, Methods: GET, POST, OPTIONS

## localStorage Keys

| Key | Kandungan |
|---|---|
| `sink_instance_url` | URL instance Sink (cth: `https://s.domain.com`) |
| `sink_api_key` | API Token Sink |
| `sink_slug_map` | JSON `{ longUrl: slug }` — cache slug per URL panjang |

## Sink API Endpoints (via Worker proxy)

| Method | Endpoint | Tujuan |
|---|---|---|
| POST | `/api/link/create` | Cipta shortlink baru dengan slug tersuai |
| POST | `/api/link/upsert` | Kemas kini URL shortlink sedia ada |
| GET | `/api/link/query?slug=<slug>` | Semak kewujudan slug |

## Nota Teknikal

- **Drag fix**: `mouseup` dan `mousemove` dilisten pada `document` — mencegah `isDragging` tersangkut bila tetikus keluar canvas
- **Canvas clone bug**: `cloneNode()` tidak memindahkan piksel — guna `AbortController` untuk remove listeners
- **Web Share API**: Semak `navigator.canShare({ files })` — hanya tersedia HTTPS + peranti sokong
- **iOS share**: Blob disiapkan secara selari sebelum `navigator.share()` dipanggil — kekalkan user gesture timing
- **Sink slug prefix**: `gspng-` + 5 char rawak — contoh: `gspng-x7k2m`
- **Slug dedup flow**: cache hit → verify API → return existing / create new

## Batasan Semasa

- Hanya **halaman pertama** PDF yang dirender
- Google Sheets mesti ditetapkan sebagai **public**
- Butang **Kongsi Gambar** tidak muncul di desktop Chrome

## Ciri Dirancang

- [ ] Sokongan **berbilang halaman** PDF
- [ ] **Simpan tetapan crop** per URL (localStorage)
- [ ] **UI mobile** — layout responsif lebih baik

## Fail

```
workers.js          # Cloudflare Worker (proksi CORS + Sink)
index.html          # Landing page — navigasi ke dua alat
sheet-viewer.html   # Viewer satu sheet (HTML + CSS + JS)
multisheet.html     # Viewer berbilang sheet (HTML + CSS + JS)
```
