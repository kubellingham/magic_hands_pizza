# Marketing artboards

`posters.html` holds three true-size artboards in the Magic Hand's brand
(Bricolage Grotesque + Instrument Sans, midnight-oven and corner-counter palettes).

Open it in a browser to edit the copy, then re-export:

```bash
node scripts/export-posters.cjs      # writes marketing/exports/*.png
```

| File | Size | Use |
|---|---|---|
| `exports/story-1080x1920.png` | 1080×1920 | Instagram/WhatsApp story — late-night push |
| `exports/post-1080x1080.png` | 1080×1080 | Feed post — Tuesday deal |
| `exports/hostel-wall-a3.png` | A3 @150dpi | Hostel notice boards, with tear-off phone tabs |

Exports render at 2× device scale, so the story and post are print-sharp on
phones and the A3 is fine for a standard office printer.
