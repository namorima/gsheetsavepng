---
name: ios-share-fix
description: Penyelesaian untuk iOS Web Share API error "This item cannot be shared"
metadata:
  type: feedback
---

iOS Web Share API untuk fail (PNG/JPEG) sangat sensitif — mudah fail dengan "This item cannot be shared."

**Punca dan penyelesaian:**

1. **User gesture timing** — `await` berjujukan dalam loop memutuskan gesture chain. Penyelesaian: sediakan semua canvas/blob secara SELARI (`Promise.all`) SEBELUM panggil `navigator.share()`.

2. **Saiz fail terlalu besar** — canvas 3× scale terlalu besar. Penyelesaian: scale down ke max 1600px (`scaleCanvasForShare(canvas, 1600)`), JPEG 0.85 quality.

3. **Field `title` dalam shareData** — iOS overlay teks title pada imej. Penyelesaian: jangan masukkan `title` dalam shareData objek, guna `files` sahaja.

**Why:** Ketiga-tiga isu ini ditemui semasa debugging iOS Safari share. Semuanya silent fail tanpa error message yang jelas.

**How to apply:** Bila tambah atau ubah fungsi share gambar, pastikan: (1) semua blob disiapkan dengan Promise.all dahulu, (2) max 1600px, (3) tiada `title` field dalam shareData.
