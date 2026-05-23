---
name: project-overview
description: Gambaran projek gsheet-pdf-png — fail, senibina, deployment workflow
metadata:
  type: project
---

Projek web tool untuk tukar eksport Google Sheets (PDF) kepada imej PNG. Empat fail utama:

- `index.html` — landing page navigasi
- `sheet-viewer.html` — viewer satu sheet
- `multisheet.html` — viewer berbilang sheet
- `workers.js` — Cloudflare Worker (proksi CORS + Sink API)

**Why:** Tool peribadi untuk kongsi data sheet ke WhatsApp/Telegram tanpa screenshot manual.

**How to apply:** Setiap kali ubah `workers.js`, ingatkan user untuk deploy semula ke Cloudflare Workers secara manual — tiada CI/CD. HTML files boleh terus dibuka dari filesystem atau GitHub Pages.

Worker URL hardcoded: `https://gsheetproxy.uncle.workers.dev`

Semua logik dalam HTML sahaja — tiada framework, tiada build step.
