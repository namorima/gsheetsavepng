# Pelan: Multi-Sheet — Satu Spreadsheet, Banyak Tab (GID)

## Konsep Asas

```
SATU spreadsheet URL  +  BANYAK gid  =  BANYAK imej
```

Bukan berbilang fail Google Sheets — tapi berbilang **tab/sheet**
dalam **satu spreadsheet yang sama**, dibezakan oleh `gid`.

---

## Kenapa GID?

URL export Google Sheets mengandungi parameter `gid`:

```
https://docs.google.com/spreadsheets/d/{ID}/export
  ?format=pdf
  &gid=0          ← Tab pertama (Sheet1)
  &gid=123456     ← Tab kedua  (Sheet2)
  &gid=789012     ← Tab ketiga (Sheet3)
```

Setiap `gid` berbeza = tab berbeza = imej berbeza.

---

## UI Keseluruhan

```
┌──────────────────────────────────────────────────────┐
│ ◈ Sheet Viewer                          ● Sedia      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Spreadsheet                                         │
│  [https://docs.google.com/spreadsheets/d/... ──] [↺] │
│                                                      │
│  Sheet (GID)                            [+ Tambah]  │
│  ┌──────────────────────────────────────────────┐   │
│  │  #1  GID: [0      ]  Label: [Sheet1   ] [✕]  │   │
│  │  #2  GID: [123456 ]  Label: [Gaji     ] [✕]  │   │
│  │  #3  GID: [789012 ]  Label: [Ringkasan] [✕]  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [● Parameter PDF]  ← dikongsi untuk semua sheet    │
│  [● Tetapan Crop]   ← berasingan untuk setiap sheet │
│                                                      │
│                            [▶ MUAT SEMUA]           │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  ◀      Sheet1 (1/3)       ▶                 │   │
│  │  ┌────────────────────────────────────────┐  │   │
│  │  │                                        │  │   │
│  │  │         [ canvas imej ]                │  │   │
│  │  │                                        │  │   │
│  │  └────────────────────────────────────────┘  │   │
│  │              ●  ○  ○                          │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│   [Salin]   [Simpan]   [Kongsi Semua ↗]             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Bahagian 1 — Input Spreadsheet & GID

```
┌──────────────────────────────────────────────────────┐
│  Spreadsheet                                         │
│  [ URL atau ID spreadsheet ─────────────────── ] [↺] │
│                                                      │
│  Sheet (GID)                              [+ Tambah] │
│  ┌──────────────────────────────────────────────┐   │
│  │  #1  GID: [ 0       ]  Label: [ Sheet1  ] [✕]│   │
│  │  #2  GID: [ 123456  ]  Label: [ Gaji    ] [✕]│   │
│  │  #3  GID: [ 789012  ]  Label: [ Jumlah  ] [✕]│   │
│  └──────────────────────────────────────────────┘   │
│                             [▶ MUAT SEMUA]           │
└──────────────────────────────────────────────────────┘
```

| Elemen | Fungsi |
|--------|--------|
| URL/ID Spreadsheet | Satu URL dikongsi semua sheet |
| GID | ID unik setiap tab dalam spreadsheet |
| Label | Nama pilihan untuk senang kenali (tidak dihantar ke Google) |
| ✕ | Padam sheet ini dari senarai |
| + Tambah | Tambah baris GID baru |
| ↺ | Muat semula spreadsheet ID dari URL |
| ▶ MUAT SEMUA | Fetch & render semua GID serentak |

---

## Bahagian 2 — Parameter PDF (Dikongsi)

Parameter PDF **sama untuk semua sheet** dalam senarai.
Tidak perlu set satu-satu.

```
┌─────────────────────────────────────────────────┐
│  Parameter PDF  (dikongsi semua sheet)          │
│                                                 │
│  Format   Saiz    Orientasi   Skala   Margin    │
│  [PDF ▾]  [A4 ▾]  [Portrait▾] [1 ▾]  [Lanjutan]│
└─────────────────────────────────────────────────┘
```

---

## Bahagian 3 — Tetapan Crop (Berasingan Per-Sheet)

Crop **berbeza untuk setiap sheet** — kerana setiap tab
mungkin ada layout yang berlainan.

```
Swipe ke Sheet #2 (GID: 123456)
         ↓
Panel Crop auto-update → load crop untuk GID 123456
```

```
┌─────────────────────────────────────────────────┐
│  Tetapan Crop — Sheet2 (GID: 123456)           │
│                                                 │
│  [Auto]  [Manual]  [Tiada]                     │
│                                                 │
│  PRATETAP: [½ Atas] [½ Bawah] [½ Kiri] [Penuh]│
│  ▸ Lanjutan                                    │
└─────────────────────────────────────────────────┘
```

---

## Bahagian 4 — Navigasi Swipe

```
         ┌──────────────────────────────────┐
         │                                  │
  [  ◀  ]│        [ canvas semasa ]         │[  ▶  ]
         │                                  │
         │        ←  swipe  →               │
         └──────────────────────────────────┘
                    ●  ○  ○
              Sheet1  Sheet2  Sheet3
```

| Cara | Tindakan |
|------|----------|
| Klik ◀ / ▶ | Tukar sheet |
| Swipe kiri | Sheet seterusnya |
| Swipe kanan | Sheet sebelumnya |
| Dot indicator | Tunjuk kedudukan semasa |

**Status setiap dot:**
```
●  = imej semasa
○  = imej lain (berjaya)
⟳  = masih loading
✗  = gagal
```

---

## Bahagian 5 — Tindakan Imej

```
┌──────────┬──────────┬──────────────────────────┐
│  Salin   │  Simpan  │    Kongsi Semua ↗        │
│ (semasa) │ (semasa) │  (semua sheet yang siap) │
└──────────┴──────────┴──────────────────────────┘
```

**Kongsi Semua:**
```
Kumpul canvas semua GID yang status = ready
        ↓
Setiap canvas → toBlob() → File("sheet-{label}.jpg")
        ↓
navigator.share({ files: [file1, file2, file3] })
        ↓
Picker: WhatsApp / Telegram / dll.
```

---

## Struktur Data

```javascript
const state = {
  spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",

  // Parameter PDF — dikongsi semua sheet
  params: {
    format: "pdf",
    size: "7",
    portrait: "true",
    scale: "1",
    margins: { top: "", bottom: "", left: "", right: "" }
  },

  // Senarai sheet — setiap satu ada gid, label, hasil, crop
  sheets: [
    {
      gid: "0",
      label: "Sheet1",
      status: "ready",     // idle | loading | ready | error
      canvas: <Canvas>,
      errorMsg: null,
      crop: { mode: "auto", x: 0, y: 0, w: 100, h: 100 }
    },
    {
      gid: "123456",
      label: "Gaji",
      status: "loading",
      canvas: null,
      crop: { mode: "none" }
    },
    {
      gid: "789012",
      label: "Ringkasan",
      status: "error",
      errorMsg: "Sheet tidak ditemui",
      crop: { mode: "auto", x: 0, y: 50, w: 100, h: 50 }
    }
  ],

  currentIndex: 0   // sheet yang sedang dipapar
}
```

---

## URL Export Yang Dijana

Untuk setiap sheet, URL dibina seperti ini:

```
https://docs.google.com/spreadsheets/d/{spreadsheetId}/export
  ?format=pdf
  &gid={gid}
  &size=7
  &portrait=true
  &scale=1
```

---

## Aliran Penuh

```
1. User isi URL spreadsheet
        ↓
2. User tambah GID: 0, 123456, 789012
        ↓
3. User set parameter PDF (saiz, orientasi, dll.)
        ↓
4. Tekan ▶ MUAT SEMUA
        ↓
5. Fetch semua GID serentak (Promise.allSettled)
        ↓
6. Setiap GID render ke canvas masing-masing
        ↓
7. Papar sheet pertama
        ↓
8. ┌─ User adjust crop untuk sheet ini
   ├─ Salin / Simpan imej ini
   ├─ Swipe → sheet seterusnya
   └─ Ulang 8
        ↓
9. Kongsi Semua → hantar ke WhatsApp/Telegram
```

---

## URL Kongsi — Format Parameter

### Mod Tunggal (sedia ada, dikekalkan)

```
sheet-viewer.html?url={URL_ENCODED}&crop=x,y,w,h
```

### Mod Multi-Sheet (baru)

```
sheet-viewer.html
  ?id={spreadsheetId}
  &sheets={senarai sheet}
  &size=7
  &portrait=true
  &scale=1
  &top_margin=0.75
  &bottom_margin=0.75
  &left_margin=0.7
  &right_margin=0.7
```

---

### Format Parameter `sheets`

Setiap sheet dipisahkan oleh `|`. Format setiap sheet:

```
{gid}:{label}:{cropMode}:{x},{y},{w},{h}
```

| Bahagian | Contoh | Penerangan |
|----------|--------|------------|
| `gid` | `0` | ID tab spreadsheet |
| `label` | `Gaji+Mei` | Nama sheet (space → `+`) |
| `cropMode` | `auto` / `none` | Mod crop |
| `x,y,w,h` | `0,50,100,50` | Nilai crop (% — hanya jika auto) |

**Contoh nilai `sheets`:**

```
Crop auto:   0:Sheet1:auto:0,50,100,50
Crop tiada:  123456:Gaji:none
Tanpa label: 789012::auto:0,0,100,100
```

---

### Contoh URL Kongsi Penuh

```
sheet-viewer.html
  ?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
  &sheets=0:Sheet1:auto:0,50,100,50|123456:Gaji:none|789012:Ringkasan:auto:0,0,100,100
  &size=7&portrait=true&scale=1
```

Bila URL ini dibuka → **semua sheet terus dimuatkan secara automatik**
dengan crop masing-masing sudah terset.

---

### Pengesanan Mod (Detection)

```
Buka URL
   │
   ├─ Ada ?id=    → Mod Multi-Sheet  (baru)
   │                 parse: id, sheets, params
   │
   └─ Ada ?url=   → Mod Tunggal     (lama, kekal sokong)
                     parse: url, crop
```

Ini memastikan **URL lama masih berfungsi** tanpa sebarang perubahan.

---

### Aliran Jana URL Kongsi

```
User siap set semua sheet + crop
         ↓
Klik butang [Salin URL Kongsi]
         ↓
Bina parameter:
  id = spreadsheetId
  sheets = join semua slot dengan "|"
    setiap slot → "{gid}:{label}:{mode}:{x},{y},{w},{h}"
  size, portrait, scale, margins (jika ada)
         ↓
encodeURIComponent untuk nilai yang perlu
         ↓
Salin ke clipboard → tunjuk toast ✓
```

---

### Contoh Decode Semula (sisi penerima)

```javascript
// Input URL:
// ?id=1Bxi...&sheets=0:Sheet1:auto:0,50,100,50|123456:Gaji:none&size=7

const p = new URLSearchParams(location.search)

// Spreadsheet ID
const spreadsheetId = p.get("id")

// Parse sheets
const sheets = p.get("sheets").split("|").map(s => {
  const [gid, label, mode, cropStr] = s.split(":")
  const [x, y, w, h] = (cropStr || "0,0,100,100").split(",").map(Number)
  return { gid, label, crop: { mode, x, y, w, h } }
})

// PDF params (dikongsi)
const params = {
  size: p.get("size") || "7",
  portrait: p.get("portrait") || "true",
  scale: p.get("scale") || "1"
}

// → Terus muat semua sheet secara automatik
```

---

## Fasa Pembangunan

```
FASA 1 — Input & Struktur Data
  ├─ Input spreadsheet ID (satu sahaja)
  ├─ Senarai GID (tambah/padam/label)
  └─ Bina URL export per-GID

FASA 2 — Load & Status
  ├─ Fetch semua GID serentak
  ├─ Status per-sheet (idle/loading/ready/error)
  └─ Render canvas per-sheet

FASA 3 — Navigasi Swipe
  ├─ Butang ◀ ▶ + dot indicator
  ├─ Swipe gesture (touch + mouse drag)
  └─ Auto-load tetapan crop bila swipe

FASA 4 — Tindakan
  ├─ Salin & Simpan (sheet semasa)
  └─ Kongsi Semua (multi-file share)

FASA 5 — URL Kongsi Multi-Sheet
  ├─ Jana URL dengan semua parameter
  ├─ Encode: id + sheets + pdf params
  ├─ Decode semula bila URL dibuka → auto load
  └─ Kekal sokong format URL lama (?url=...)
```

---

## Yang TIDAK Dibuat

- ✗ Berbilang spreadsheet URL
- ✗ Gabung/merge imej
- ✗ Export ZIP
- ✗ Crop batch (satu crop untuk semua sheet)
