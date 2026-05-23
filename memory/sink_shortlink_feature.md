---
name: sink-shortlink-feature
description: Implementasi ciri shortlink Sink — API flow, localStorage keys, slug dedup, upsert
metadata:
  type: project
---

Ciri shortlink menggunakan self-hosted Sink (miantiao-me/sink). Konfigurasi disimpan `localStorage` sahaja.

**localStorage keys:**
- `sink_instance_url` — URL instance (cth: `https://s.domain.com`)
- `sink_api_key` — API token
- `sink_slug_map` — JSON `{ longUrl: slug }` cache

**Slug format:** `gspng-` + 5 char rawak (cth: `gspng-x7k2m`)

**API endpoints (via Worker `?sink_target=`):**
- `POST /api/link/create` — cipta baru
- `POST /api/link/upsert` — kemas kini URL untuk slug sedia ada
- `GET /api/link/query?slug=<slug>` — semak kewujudan slug

**Dedup flow `createShortlink()`:**
1. Semak `sink_slug_map[longUrl]` — ada cache?
2. Ya → verify via `GET /api/link/query` → return existing jika masih wujud
3. Tidak / verify gagal → cipta baru dengan `POST /api/link/create`
4. Simpan ke map

**Upsert flow:** bila `updateShareUrl()` dipanggil dan `sinkSlug` ada → `upsertShortlink(newLongUrl)` → slug kekal sama, URL dikemas kini.

**Why:** CORS block kalau fetch Sink terus dari browser — kena route melalui Cloudflare Worker (`?sink_target=<full_sink_url>`).

**How to apply:** Bila tambah Sink feature ke halaman lain, pastikan `sinkFetch()` helper guna Worker URL, bukan fetch terus. [[workers-js-modes]]
