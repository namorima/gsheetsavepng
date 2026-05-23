# Tutorial: Integrasi Sink Shortlink

Panduan lengkap untuk AI merujuk cara ciri Sink Shortlink dilaksanakan dalam projek ini, dan cara menambahnya ke halaman baharu.

---

## Gambaran Keseluruhan

Ciri ini membenarkan pengguna menjana URL pendek (shortlink) daripada URL kongsi yang panjang, menggunakan instance Sink yang di-host sendiri. Konfigurasi (URL instance + API token) disimpan dalam `localStorage` peranti sahaja — tiada data dihantar ke pelayan projek.

**Sebab CORS proxy diperlukan:** Browser tidak boleh fetch terus ke Sink instance kerana CORS. Semua panggilan API Sink dihalakan melalui Cloudflare Worker dengan parameter `?sink_target=`.

---

## Prasyarat

1. **Instance Sink** — pengguna mesti ada instance Sink sendiri (repo: miantiao-me/sink)
2. **`workers.js` dikemas kini** — mesti ada Mod Sink Proxy (`?sink_target=`) — rujuk `workers_js_modes.md`
3. **`showToast(msg, isError)`** — fungsi toast sedia ada dalam halaman

---

## Arkitektur Panggilan API

```
Browser → fetch(SINK_WORKER + "?sink_target=" + encodeURIComponent(sinkUrl + path))
                    ↓
         Cloudflare Worker (gsheetproxy.uncle.workers.dev)
                    ↓ forward dengan Authorization header
         Sink Instance (https://s.yourdomain.com/api/link/...)
```

---

## localStorage Keys

| Key | Nilai |
|---|---|
| `sink_instance_url` | URL instance tanpa trailing slash (cth: `https://s.domain.com`) |
| `sink_api_key` | API token Sink |
| `sink_slug_map` | JSON string: `{ "<longUrl>": "<slug>", ... }` — cache slug per URL panjang |

---

## Sink API Endpoints

| Method | Path | Body / Query | Tujuan |
|---|---|---|---|
| POST | `/api/link/create` | `{ url, slug }` | Cipta shortlink baru dengan slug tersuai |
| POST | `/api/link/upsert` | `{ url, slug }` | Kemas kini URL untuk slug sedia ada |
| GET | `/api/link/query` | `?slug=<slug>` | Semak sama ada slug wujud; return `{ link: { slug, url } }` |

Response `create` dan `upsert`: `{ link: { slug: "...", url: "..." } }`

---

## HTML Yang Diperlukan

### 1. Butang dalam baris URL Kongsi

Susunan: `[Input] [⚙ Tetapan] [🔗 Jana] [SALIN]`

```html
<div class="share-row">
  <input type="text" class="share-url-input" id="shareUrlInput" readonly
    placeholder="Muatkan imej dahulu..." />

  <!-- Butang tetapan — sentiasa kelihatan -->
  <button class="btn-icon" onclick="openSinkModal()" title="Tetapan Shortlink (Sink)">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  </button>

  <!-- Butang jana shortlink — tersembunyi jika tiada konfigurasi -->
  <button class="btn-icon" id="btnShorten" onclick="createShortlink()"
    title="Jana shortlink" style="display:none">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  </button>

  <button class="btn-load" onclick="copyShareUrl()">SALIN</button>
</div>
```

> **Nota kelas SALIN:** `sheet-viewer.html` guna `.btn-load`, `multisheet.html` guna `.btn-primary`. Guna kelas yang sedia ada dalam halaman.

### 2. Modal Tetapan (letakkan sebelum `</body>`)

```html
<div class="sink-modal-overlay" id="sinkModal" style="display:none"
  onclick="if(event.target===this)closeSinkModal()">
  <div class="sink-modal">
    <div class="sink-modal-header">
      <span class="sink-modal-title">Tetapan Shortlink</span>
      <button class="sink-modal-close" onclick="closeSinkModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="sink-modal-body">
      <p class="sink-note">Kunci API disimpan dalam peranti ini sahaja (localStorage). Tidak dihantar ke mana-mana pelayan.</p>
      <span class="sec-label">URL Sink Instance</span>
      <input type="text" id="sinkUrlInput" class="sink-input"
        placeholder="https://s.yourdomain.com" autocomplete="off" />
      <span class="sec-label" style="margin-top:8px">API Token</span>
      <input type="password" id="sinkKeyInput" class="sink-input"
        placeholder="••••••••••••••••" autocomplete="off" />
    </div>
    <div class="sink-modal-footer">
      <button class="btn-modal-dismiss" onclick="clearSinkConfig()">Kosongkan</button>
      <button class="btn-modal-save" onclick="saveSinkModal()">Simpan</button>
    </div>
  </div>
</div>
```

---

## CSS Yang Diperlukan

Tambah dalam blok `<style>`. Kelas `.btn-icon` **mesti ada** — jika halaman belum ada, tambah kesemuanya:

```css
/* ── Icon Button (gear + link) ── */
.btn-icon {
  background: var(--surface);
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 9px 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.btn-icon:hover { border-color: var(--accent); color: var(--accent); }
.btn-icon:active { transform: scale(0.95); }
.btn-icon:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-icon svg { width: 14px; height: 14px; }

/* ── Sink Modal ── */
.sink-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.78);
  z-index: 500;
  display: flex; align-items: flex-end; justify-content: center;
}
@media (min-height: 520px) {
  .sink-modal-overlay { align-items: center; padding: 16px; }
}
.sink-modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px 10px 0 0;
  width: 100%; max-width: 420px;
  display: flex; flex-direction: column;
  overflow: hidden;
}
@media (min-height: 520px) {
  .sink-modal { border-radius: 10px; }
}
.sink-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 16px; border-bottom: 1px solid var(--border);
}
.sink-modal-title {
  font-family: "IBM Plex Mono", monospace; font-size: 12px;
  color: var(--text); letter-spacing: 0.08em; text-transform: uppercase;
}
.sink-modal-close {
  background: none; border: none; cursor: pointer; color: var(--text-dim);
  display: flex; align-items: center; justify-content: center; padding: 4px;
}
.sink-modal-close:hover { color: var(--text); }
.sink-modal-close svg { width: 16px; height: 16px; }
.sink-modal-body {
  padding: 16px; display: flex; flex-direction: column; gap: 6px;
}
.sink-note {
  font-size: 11px; color: var(--text-dim); line-height: 1.6;
  background: var(--accent-dim); border-left: 2px solid var(--accent);
  padding: 8px 10px; border-radius: 3px; margin-bottom: 6px;
}
.sink-input {
  width: 100%; background: var(--bg);
  border: 1px solid var(--border); border-radius: var(--radius);
  padding: 9px 12px; color: var(--text);
  font-family: "IBM Plex Mono", monospace; font-size: 11px; outline: none;
  transition: border-color 0.2s;
}
.sink-input:focus { border-color: var(--accent); }
.sink-input::placeholder { color: var(--text-dim); }
.sink-modal-footer {
  display: flex; gap: 8px; padding: 12px 16px;
  border-top: 1px solid var(--border);
}
/* btn-modal-dismiss & btn-modal-save — rujuk multisheet.html jika belum ada */
```

> **Semak dahulu:** `multisheet.html` sudah ada `.btn-modal-dismiss` dan `.btn-modal-save`. `sheet-viewer.html` juga sudah ada. Jika halaman baru, salin dari mana-mana satunya.

---

## JavaScript — Kod Penuh

Tambah dalam `<script>`, selepas fungsi lain. Gantikan `buildLongShareUrl()` dengan nama fungsi yang membina URL kongsi panjang dalam halaman tersebut.

```js
// ── Sink Shortlink ──
const SINK_URL_KEY = "sink_instance_url";
const SINK_TOKEN_KEY = "sink_api_key";
const SINK_MAP_KEY = "sink_slug_map";
const SINK_WORKER = "https://gsheetproxy.uncle.workers.dev";
let sinkSlug = null;

function getSinkConfig() {
  return {
    url: (localStorage.getItem(SINK_URL_KEY) || "").replace(/\/$/, ""),
    key: localStorage.getItem(SINK_TOKEN_KEY) || "",
  };
}

function getSlugMap() {
  try { return JSON.parse(localStorage.getItem(SINK_MAP_KEY) || "{}"); } catch { return {}; }
}

function saveSlugMap(map) {
  localStorage.setItem(SINK_MAP_KEY, JSON.stringify(map));
}

function updateSinkBtn() {
  const { url, key } = getSinkConfig();
  const btn = document.getElementById("btnShorten");
  if (btn) btn.style.display = url && key ? "" : "none";
}

function openSinkModal() {
  const { url, key } = getSinkConfig();
  document.getElementById("sinkUrlInput").value = url;
  document.getElementById("sinkKeyInput").value = key;
  document.getElementById("sinkModal").style.display = "flex";
}

function closeSinkModal() {
  document.getElementById("sinkModal").style.display = "none";
}

function saveSinkModal() {
  const url = document.getElementById("sinkUrlInput").value.trim().replace(/\/$/, "");
  const key = document.getElementById("sinkKeyInput").value.trim();
  url ? localStorage.setItem(SINK_URL_KEY, url) : localStorage.removeItem(SINK_URL_KEY);
  key ? localStorage.setItem(SINK_TOKEN_KEY, key) : localStorage.removeItem(SINK_TOKEN_KEY);
  closeSinkModal();
  updateSinkBtn();
  showToast(url && key ? "✓ Tetapan shortlink disimpan" : "Tetapan shortlink dipadamkan");
}

function clearSinkConfig() {
  localStorage.removeItem(SINK_URL_KEY);
  localStorage.removeItem(SINK_TOKEN_KEY);
  localStorage.removeItem(SINK_MAP_KEY);
  sinkSlug = null;
  document.getElementById("sinkUrlInput").value = "";
  document.getElementById("sinkKeyInput").value = "";
  updateSinkBtn();
  showToast("Tetapan shortlink dipadamkan");
}

async function sinkFetch(path, body, method = "POST") {
  const { url: sinkUrl, key } = getSinkConfig();
  if (!sinkUrl || !key) return null;
  const proxyTarget = SINK_WORKER + "?sink_target=" + encodeURIComponent(`${sinkUrl}${path}`);
  const opts = { method, headers: { Authorization: `Bearer ${key}` } };
  if (method !== "GET" && body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const resp = await fetch(proxyTarget, opts);
  if (!resp.ok) {
    let detail = "";
    try { const t = await resp.text(); detail = t.slice(0, 120); } catch {}
    throw new Error(`HTTP ${resp.status}${detail ? ": " + detail : ""}`);
  }
  return resp.json();
}

async function createShortlink() {
  const { url: sinkUrl, key } = getSinkConfig();
  if (!sinkUrl || !key) return;
  const longUrl = buildLongShareUrl(); // ← GANTI dengan nama fungsi URL kongsi halaman ini
  if (!longUrl) return;
  const btn = document.getElementById("btnShorten");
  btn.disabled = true;
  try {
    const map = getSlugMap();
    const cached = map[longUrl];
    if (cached) {
      // Sahkan slug masih wujud dalam Sink
      try {
        const data = await sinkFetch(`/api/link/query?slug=${encodeURIComponent(cached)}`, undefined, "GET");
        if (data?.link?.slug) {
          sinkSlug = data.link.slug;
          document.getElementById("shareUrlInput").value = `${sinkUrl}/${sinkSlug}`;
          showToast("✓ Shortlink sedia ada");
          return;
        }
      } catch {
        delete map[longUrl];
        saveSlugMap(map);
      }
    }
    // Cipta shortlink baru
    const slug = "gspng-" + Math.random().toString(36).slice(2, 7);
    const data = await sinkFetch("/api/link/create", { url: longUrl, slug });
    sinkSlug = data.link.slug;
    map[longUrl] = sinkSlug;
    saveSlugMap(map);
    document.getElementById("shareUrlInput").value = `${sinkUrl}/${sinkSlug}`;
    showToast("✓ Shortlink dijana");
  } catch (err) {
    showToast("Gagal: " + (err.message || "Semak URL & Token"), true);
  } finally {
    btn.disabled = false;
  }
}

async function upsertShortlink(longUrl) {
  if (!sinkSlug) return;
  const { url: sinkUrl } = getSinkConfig();
  try {
    await sinkFetch("/api/link/upsert", { url: longUrl, slug: sinkSlug });
    const map = getSlugMap();
    map[longUrl] = sinkSlug;
    saveSlugMap(map);
    document.getElementById("shareUrlInput").value = `${sinkUrl}/${sinkSlug}`;
    showToast("✓ Shortlink dikemas kini");
  } catch {
    sinkSlug = null; // reset jika gagal
  }
}

// Tutup modal dengan Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.getElementById("sinkModal").style.display !== "none") {
    closeSinkModal();
  }
});

// Init — semak konfigurasi semasa halaman muat
updateSinkBtn();
```

---

## Integrasi dengan `updateShareUrl()`

Fungsi `updateShareUrl()` yang sedia ada **mesti diubah** supaya sedar tentang shortlink:

```js
function updateShareUrl() {
  const longUrl = buildLongShareUrl(); // fungsi URL panjang
  if (!longUrl) return;

  document.getElementById("shareSection").style.display = "block";

  if (sinkSlug) {
    // Ada shortlink aktif — tunjuk short URL dan upsert dengan URL panjang terbaru
    const { url: sinkUrl } = getSinkConfig();
    document.getElementById("shareUrlInput").value = `${sinkUrl}/${sinkSlug}`;
    upsertShortlink(longUrl);
  } else {
    // Tiada shortlink — tunjuk URL panjang biasa
    document.getElementById("shareUrlInput").value = longUrl;
  }
}
```

**Kesan:** Apabila pengguna ubah crop atau tetapan lain, `updateShareUrl()` dipanggil semula → jika shortlink aktif, `upsertShortlink()` dikemas kini URL dalam Sink → slug kekal sama, URL tujuan berubah.

---

## Aliran Lengkap

### Jana Shortlink Pertama Kali
```
User klik 🔗
  → createShortlink()
    → longUrl = buildLongShareUrl()
    → semak sink_slug_map[longUrl]
      → tiada cache
        → sinkFetch POST /api/link/create { url: longUrl, slug: "gspng-xxxxx" }
          → simpan slug ke sinkSlug + sink_slug_map
          → papar sinkUrl/slug dalam input
```

### Jana Shortlink (URL Sama, Pernah Dijanakan)
```
User klik 🔗
  → createShortlink()
    → longUrl = buildLongShareUrl()
    → semak sink_slug_map[longUrl]
      → ada cache: "gspng-xxxxx"
        → sinkFetch GET /api/link/query?slug=gspng-xxxxx
          → Sink return { link: { slug: "gspng-xxxxx" } }
            → set sinkSlug, papar short URL
            → toast "✓ Shortlink sedia ada"
```

### Crop Berubah Selepas Shortlink Dijana
```
User ubah crop
  → updateShareUrl()
    → sinkSlug ada ("gspng-xxxxx")
      → papar sinkUrl/gspng-xxxxx dalam input (segera)
      → upsertShortlink(longUrl baru)
        → sinkFetch POST /api/link/upsert { url: longUrl baru, slug: "gspng-xxxxx" }
          → Sink kemas kini URL tujuan → slug kekal sama
          → sink_slug_map[longUrl baru] = "gspng-xxxxx"
```

---

## Perbezaan antara sheet-viewer.html dan multisheet.html

| Perkara | sheet-viewer.html | multisheet.html |
|---|---|---|
| Fungsi URL panjang | `buildLongShareUrl()` | `buildShareUrl()` |
| Butang SALIN | kelas `.btn-load` | kelas `.btn-primary` |
| `sinkSlug` | module-level `let` | module-level `let` |
| `SINK_WORKER` | const | const |

Selain itu, logik JS adalah identik antara kedua-dua fail.

---

## Menambah ke Halaman Baharu

1. Pastikan `workers.js` sudah ada Mod Sink Proxy (`?sink_target=`) — deploy semula jika perlu
2. Tambah HTML butang dalam baris URL Kongsi (susunan: input → ⚙ → 🔗 → SALIN)
3. Tambah HTML modal sebelum `</body>`
4. Tambah CSS (`.btn-icon`, `.sink-modal-*`, `.sink-input`, `.sink-note`)
5. Tambah blok JS Sink Shortlink dalam `<script>`
6. Ganti `buildLongShareUrl()` dalam `createShortlink()` dengan fungsi URL panjang halaman tersebut
7. Ubah `updateShareUrl()` untuk sedar `sinkSlug` (tambah blok `if (sinkSlug)`)
8. Pastikan `showToast()` sudah ada dalam halaman

---

## Debugging

| Simptom | Punca Berkemungkinan |
|---|---|
| Butang 🔗 tidak muncul | `updateSinkBtn()` tidak dipanggil semasa init, atau `localStorage` kosong |
| `Gagal: Failed to fetch` | Worker belum di-deploy atau `sink_target` tidak betul |
| `Gagal: HTTP 403` | Token salah atau token tidak ada kebenaran |
| `Gagal: HTTP 404` | URL instance salah, atau endpoint tidak betul |
| Shortlink tidak dikemas kini bila crop berubah | `updateShareUrl()` tidak memanggil `upsertShortlink()`, atau `sinkSlug` null |
| Slug baru dijana walaupun URL sama | `sink_slug_map` kosong/rosak, atau slug lama sudah padam dari Sink |
