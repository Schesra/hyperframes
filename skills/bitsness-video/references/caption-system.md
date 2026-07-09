# Karaoke caption system

Word-level captions synced to the real narration are the formula's signature. They live in ONE overlay sub-comp (`compositions/captions.html`), generated — never hand-written — by `scripts/build_captions.py`.

## Visual spec (bitsness skin)

- Montserrat 900, 54px, line-height 1.16, centered, max-width 940px, anchored `bottom: 380px`.
- Fill navy `#102033` with a thick white outline via 8-direction `text-shadow` (±3/±4px) + soft drop `0 6px 16px rgba(16,32,51,0.20)`.
- Karaoke states: **unspoken** dim `rgba(16,32,51,0.34)` → **active** word pops `scale 1.13` + the beat's accent color (`back.out(3)`, 0.09s) → **spoken** settles navy (`power2.out`, 0.13s).
- Line = ≤7 words or sentence end; fades in 0.14s slightly before its first word, out 0.12s before the next line.
- `escbase` skin: same mechanics, light-on-dark values per `style-skins.md`.

## Pipeline

```
whisper word json ──► work/transcript_words.json
assets/script.txt ──► work/fixes.json   (human-verified corrections)
work/beats.json   ──► accent color per word's beat
        └────────────► scripts/build_captions.py ──► compositions/captions.html
```

`build_captions.py --project <dir>` reads the three inputs, applies fixes, groups lines, and injects the `SEGMENTS` array into `templates/captions-template.html`. Re-run any time an input changes; never edit `captions.html` by hand.

## Fix table — Vietnamese whisper (model `small`) recurring errors

Diff EVERY word against the script before building; one wrong karaoke word is instantly visible. Known recurring fixes (append as you find more):

| whisper heard | correct |
|---|---|
| tim | team |
| Acorn / A-con | Arkon (any product name gets mangled — check all brand mentions) |
| phai | file |
| bao giá / Phải báo giá | báo giá / File báo giá |
| bạn nào (khi nói về tài liệu) | bản nào |
| pháo đở | founder |
| gốc dễ | gốc rễ |
| chi thức | tri thức |
| giải giác | rải rác |
| dry | Drive |
| chác / đoạn chác | chat / đoạn chat |
| trackbot | chatbot |
| Đầu lòng | Đâu là |
| mâu thoẳn | mâu thuẫn |
| kiểm trứng | kiểm chứng |

Convention: `work/fixes.json` is a list of `{"i": <global word index>, "text": "replacement"}`; `"text": null` drops the word and extends the previous word's end time over it (for 2-words-heard-as-1 cases like "pháo đở" → "founder").

## Console encoding

Always run whisper with `PYTHONIOENCODING=utf-8` on Windows — Vietnamese output crashes cp1252 consoles otherwise. Python scripts that print Vietnamese: wrap stdout in a UTF-8 `TextIOWrapper`.
