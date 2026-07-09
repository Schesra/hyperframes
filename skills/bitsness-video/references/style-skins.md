# Style skins

Two proven skins. A skin fixes the palette, chrome, and type — the storyboard fixes everything else. Both are 1080×1920, both keep the caption zone (bottom ≈380–560px) and top chrome (0–100px) clear of scene content.

## `bitsness` — two-act paper → cream (default)

Distilled from `Source/bitsness-arkon/` (canonical) and `videos/arkon-77-bitsness/`.

**Act 1 — chaos (problem half):**

| token | value | use |
|---|---|---|
| bg | `#E7E2D6` (radial to `#DBD4C4`) | ambient base |
| card | `#F4EFE3`, border `#C9B98E`, radius 14-16px | paper cards |
| hot card | `#FFFFFF`, border `#D0492F` | the one card in trouble |
| text | `#3A3327`, muted `#6b6354` / `#8a7f6a` | body / labels |
| red | `#D0492F` | warnings, ?-badges, act-1 accent A |
| amber | `#C99A3A` | secondary accent B |
| file blue | `#9FB2C0` / `#5f7a89` | neutral badges, org lines |
| shadow | `0 12px 28px rgba(90,70,40,0.16)` | every card |

**Act 2 — system (resolution half):** bg cream `#F7F1E6`/`#FCF7EC`; brand terracotta `#E2722C`, deep `#C2410C` (use deep for text-on-cream — better contrast); cyan `#2FA8B8` **sparingly**; navy text `#1E2A3A`; cards `#FFFDF7` with `rgba(226,114,44,0.5)` borders.

**THE SWITCH:** ambient crossfades act1→act2 over ~1.6s at the reveal; incoming scene gets the one spectacle transition (see `transition-map.md`). HUD dot recolors `#D0492F` → `#E2722C`.

**Chrome (lives in ambient-bg, never in scenes):** top 5px progress bar filling 0→100% over the full duration with gradient `#D0492F → #C99A3A → #E2722C → #2FA8B8`; label `BITSNESS · ARKON ●` (swap the product name per video) top-left, Roboto Mono 600 22px `#8a7f6a`; faint 92-104px drifting grid; 2 blurred color blobs; 20 seeded drifting dust dots (mulberry32 — never `Math.random()`).

**Type:** Be Vietnam Pro 800/900 punch headlines (46-64px); Roboto Mono 500-700 for filenames, tags, badges, chrome; captions Montserrat 900 (see `caption-system.md`). Google Fonts CSS2 `<link>` per sub-comp is acceptable for local renders; self-host via `@font-face` if rendering in the cloud.

## `escbase` — dark starfield + neon chips (single act)

Distilled from `Source/Example-1.mp4` (720×1280 reference; build at 1080×1920).

| token | value | use |
|---|---|---|
| bg | `#0b0d12` with faint radial warm glow top + scattered 2-3px star dots | ambient |
| chip | rounded-square 96-120px icon chips, one hue each: purple `#8b7cf6`, yellow `#f2c94c`, cyan `#2dd4bf`, green `#4ade80`, red `#f87171`, orange `#fb923c` | pipeline/icon rows |
| accent | orange `#fb923c` | caption keyword + hero numbers |
| text | `#f4f4f5`, muted `#9ca3af` | body / labels |
| chrome | `@<handle>` + small logo top-left AND bottom-right; thin multicolor gradient bar at the very top | channel branding |

Motifs: icon-chip pipelines connected by dashes (`URL → yt-dlp → ffmpeg → Read`), big stat lockups (`4.8K ★`), arc gauges, dotted progress rows, warning triangles, terminal command pills (Roboto Mono on `#1f2430`), circular play/feature buttons. One hero graphic per beat, centered in the upper 2/3. End card: rainbow-gradient headline + brand URL pill.

Captions: same karaoke system, but light text on dark — `#f4f4f5` fill, dim `rgba(244,244,245,0.35)`, active word in orange, **no white outline** (use `0 4px 18px rgba(0,0,0,0.65)` shadow instead).

## Shared rules (both skins)

- Every visual reads with sound off; each beat = one idea; no static frame > 3s.
- No robots / glowing-brain AI clichés / stock-office imagery; no invented statistics.
- Wrap any `<img>` in a div and animate the div, never the img.
- Deterministic only: seeded PRNG (mulberry32), no `Date.now()`, no unbounded `repeat: -1` outside duration-capped ambient loops (`repeat: Math.ceil(DUR/cycle)` is the house pattern).
