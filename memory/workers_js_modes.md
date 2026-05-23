---
name: workers-js-modes
description: Dua mod operasi workers.js — Google Sheets proxy dan Sink API proxy
metadata:
  type: project
---

`workers.js` menyokong dua mod via query parameter:

**Mod 1 — Google Sheets Proxy (`?url=<gsheet_url>`):**
- Hanya terima URL bermula `https://docs.google.com/spreadsheets/`
- Proxy fetch dengan User-Agent Mozilla/5.0
- Return content dengan CORS headers

**Mod 2 — Sink API Proxy (`?sink_target=<full_url>`):**
- Hanya terima URL bermula `https://`
- Forward Authorization + Content-Type headers
- Sokong GET (tanpa body) dan POST (dengan body)
- Return response dengan CORS headers

**CORS:** Handle OPTIONS preflight → 204. Header `Access-Control-Allow-Origin: *`.

**Why:** Browser tidak boleh fetch terus ke docs.google.com (CORS) mahupun ke Sink instance (CORS). Worker jadi perantara.

**How to apply:** Bila ada keperluan fetch ke URL luar lain dari browser, extend workers.js dengan mod baru — jangan buat Worker lain. Selepas ubah workers.js, **mesti deploy semula ke Cloudflare Workers**. [[project-overview]]
