---
name: bitsness-video
description: "turn a pre-recorded narration MP3 + its script (typically Vietnamese, the Bitsness channel's format) into a 9:16 1080×1920 channel video: word-level karaoke captions synced to the real voice, one micro-world graphic scene per narration beat, a two-act palette switch at the product/idea reveal, act-aware scene transitions, and a BGM+SFX layer — the complete channel formula distilled from the reference projects. Use this skill when the user hands you a recorded voiceover (MP3/WAV) plus a script or shot-by-shot brief and wants 'a video like the Bitsness/Arkon ones'. The recorded audio is the timing backbone; nothing is re-voiced. Do not use it without a recorded narration (script-only or topic-only briefs route through /faceless-explainer or /general-video, optionally generating TTS via /media-use first and then coming back here), for reacting to a social post (/facebook-post-to-video), or for footage-based work (/embedded-captions, /talking-head-recut). If the intent is unclear, route through /hyperframes first."
---

> **media-use**: BGM + SFX come from `/media-use`'s shared engine (`scripts/audio.mjs`); never hand-roll audio sourcing. See Step 4.

# Bitsness Video — narration MP3 → channel-formula vertical video

Use this skill to turn a recorded narration plus its script into a finished 9:16 channel video in the Bitsness house formula: **karaoke word captions, one idea per beat, micro-world UI graphics (never walls of text), a two-act palette that switches at the reveal, act-aware transitions, and a full audio layer.** The recorded voice is the single source of timing truth — every scene, caption word, SFX cue, and transition lands on it.

> **Confirm the route before Step 0.** This skill needs a **recorded narration file**. Script-only → generate TTS via `/media-use` first (then this skill applies unchanged: the TTS file becomes the narration). Topic-only → write the script first (`/hook-writing` for the opener), record or TTS, then return. A social post to react to → `/facebook-post-to-video`. Existing footage → `/embedded-captions` / `/talking-head-recut`. Unclear → `/hyperframes`.

You are the orchestrator. Work in `videos/<project>/`. Run steps in order and pass each gate before continuing. **The one mandatory user gate is Step 2 (storyboard)** — creative direction is theirs to approve; stop and wait there. **Step 6 (pre-render contact sheet) and Step 7 (post-render MP4) are autonomous self-reviews by default** — you review the visuals yourself, fix defects silently, and only surface to the user for a genuine judgment call. This is the "self-check without going through me" default; if the user explicitly asks to approve the visuals too, treat Step 6 as a user gate for that run. Reference projects: `Source/bitsness-arkon/` (canonical two-act source), `videos/arkon-77-bitsness/` (first build), `videos/grapuco-78-bitsness/` (adds the Step-7 rendered-MP4 self-review via the `watch` skill).

Workflow: Step 0 scaffold → Step 1 audio truth (`work/beats.json`) → Step 2 storyboard 🚩 USER GATE → Step 3 transitions map → Step 4 audio layer (`audio_meta.json`) → Step 5 build → Step 6 QA + contact-sheet self-review → Step 7 render + rendered-MP4 self-review → deliver.

---

## Step 0: Scaffold & skin

Name `<project>` from the video's topic in kebab-case. Create `videos/<project>/` with `assets/`, `assets/img/`, `compositions/`, `work/`, and a `meta.json` (`width: 1080, height: 1920`). **Normalize the narration's loudness** while copying it in (social-standard −16 LUFS; raw recordings arrive at wildly different levels):

```bash
ffmpeg -y -i <user file> -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 44100 -b:a 192k assets/narration.mp3
```

Save the script verbatim to `assets/script.txt`.

Pick the **skin** with the user (one line, don't over-ask): `bitsness` (two-act dusty-paper → cream, the default for B2B/product stories) or `escbase` (single-act dark starfield + neon icon chips, for tool/repo/tech topics). Full specs: `references/style-skins.md`. Copy the matching ambient template from `templates/` into `compositions/ambient-bg.html` — its `__DUR__`/`__SWITCH__`/`__PRODUCT__` placeholders are patched automatically by `scripts/build_index.py` in Step 5 (don't sed them by hand; that's how `__SWITCH__` shipped broken twice).

Brand assets (logo, product marks) come from the user or existing `Source/` material — inventory them in `work/assets.md`. Never invent a brand mark; recreate simple geometry as inline SVG when the source image is too heavy.

**Gate:** project folder exists with narration + script + skin chosen; total duration known (`ffprobe`).

---

## Step 1: Audio truth

Goal: word-accurate global timings and a beat map. The narration is law; everything else synchronizes to it.

1. **Transcribe** with word timestamps: `ffmpeg` → 16kHz mono wav (`work/narration16k.wav`), then `PYTHONIOENCODING=utf-8 whisper --model small --language Vietnamese --word_timestamps True --output_format json --output_dir work`.
2. **Forced-align onto the script** (the default — proven cleaner than per-word fixes on every build): `python <SKILL_DIR>/scripts/align_captions.py --project .` maps whisper's *timings* onto the script's *exact words* (difflib) → `work/transcript_words.json` + empty `fixes.json`. **Eyeball the reconstructed text it prints** — it must read as the script verbatim. The manual fix-table (`references/caption-system.md`) is the fallback for narrations that ad-lib away from the script.
3. **Cut beats.** Group the transcript into beats of **5–15s, one idea each** (sentence boundaries + topic shifts). Find **THE SWITCH** — the sentence where the product/answer first appears; it splits Act 1 (problem/chaos) from Act 2 (system/resolution). Write `work/beats.json`: `[{"id": "s01-<slug>", "start", "end", "idea", "act": 1|2, "accent": "<hex>", "transition": "push|hard|soft|reveal"}]` — `transition` is the cut INTO that beat (first beat: none; exactly one `reveal` = THE SWITCH), filled in at Step 3; accents per `style-skins.md`.

**Gate:** `beats.json` covers the full duration with no gaps; every fix applied; SWITCH time locked (skip SWITCH for single-act `escbase` pieces).

---

## Step 2: Storyboard 🚩 USER GATE

Goal: the full creative plan, approved before any HTML exists.

**Apply the design-taste lens first** (`references/design-taste.md`, adapted from taste-skill): write the one-line **Design read**, set the **three dials** (VARIANCE / MOTION / DENSITY — MOTION tracks the act), and run the **anti-default checklist** (no AI-gradient/centered-slop/flat-type/wall-of-text). Fold all three into `DESIGN.md` — this is what keeps the piece from looking templated.

Write `DESIGN.md` (concept angle + Design read + dials, skin values, act palettes, type stack) and `STORYBOARD.md` with **one row per beat, five columns**:

| beat | ẩn dụ micro-world | punch text | motion recipe | audio cues |
|---|---|---|---|---|

- **Ẩn dụ micro-world** — a concrete UI-simulation metaphor (claw machine, file rows with status badges, glass boxes, gates, conveyor…), never a text card. Rules and the motif catalog: `references/storyboard-rules.md`.
- **Punch text** — Be Vietnam Pro 800/900, punches the idea, **never transcribes the VO** (captions already carry the VO).
- **Motion recipe** — 2-3 *named* rules/blueprints from `/hyperframes-animation` (e.g. `kinetic-beat-slam` for punch text, `svg-path-draw` for converging arrows, `stat-bars-and-fills` for counters, `press-release-spring` for stamps, `motion-blur-streak` for fast card entries, `grid-card-assemble` for hub scenes), **assigned by component role** per `references/component-animation.md`: tag each element PRIMARY / SECONDARY / DECORATIVE / INTERACTIVE (one PRIMARY per beat), pick the animation from the role's register + the element's content type, and order entrances primary → secondary → connectors, each anchored to its narration word. Whole-video budget: 5–7 component-animation types, 2–3 as workhorses, same element type = same animation. Skim `../hyperframes-animation/rules-index.md` + `blueprints-index.md` while writing this column — do not free-style motion.
- **Audio cues** — SFX events by name from the bundled library + the BGM arc note (see `references/audio-layer.md` for the event→SFX mapping table).

Hard rules (from the channel's own DESIGN.md, enforced at Step 6): every visual reads with sound off · each beat = one idea · no static frame > 3s · no robots/AI-brain clichés · no invented numbers/claims · CTA end-beat (Comment "<keyword>" / Follow Bitsness) · subtle loop back to the opening motif.

**Present `STORYBOARD.md` to the user and STOP. Do not build until they approve.** Fold their edits in before continuing.

**Gate:** user approved the storyboard.

---

## Step 3: Transition map

One transition per cut — never a uniform fade everywhere. Classify every cut with the four-step procedure in `references/transition-map.md`:

1. **Intensity** from the narrative relationship between the two beats: same idea continues → LIGHT (crossfade, blur crossfade, marker wipe) · new point / next step → MEDIUM (push slide, panel swipe, graphic overlay, page turn, paper slide out, sticker peel…) · hook / reveal / verdict / section change → STRONG (whip pan, light flash, shape-mask iris, foreground wipe, paper tear, stamp, crumple…).
2. **Act modulation**: Act 1 = hard, varied, escalating, 0.25-0.35s, never twice in a row; THE SWITCH = one earned spectacle (light leak / overexposure burn / blur-through, or a `@hyperframes/shader-transitions` shader), unique in the piece; Act 2 = calm and consistent, ≤2 kinds.
3. **Semantic override** when the incoming beat's metaphor names a surface: document/SOP → page turn / paper slide out · UI/dashboard → panel swipe / shape-mask iris · verdict → stamp · revealed insight → paper tear / sticker peel · discarded old way → crumple. Paper family is `bitsness`-skin only; `escbase` substitutes the UI/tech members.
4. **Budget check** across the whole map: ≤3-4 transition families, one primary on 60-70% of cuts, paper/material effects 10-20% and never consecutive.

Record `transition: <name> · <LIGHT|MEDIUM|STRONG>` per storyboard row. Recipes: base set in `/hyperframes-animation`'s catalog (`transitions/catalog.md` → `css-*.md`, constants adapted to ±1080/±1920); paper/editorial + overlay set pre-adapted to 9:16 in `references/transition-recipes.md`.

**Gate:** every cut has a named transition + level; the budget check passes; the SWITCH transition is unique in the piece.

---

## Step 4: Audio layer (SFX; BGM is user-supplied)

The narration is already real — this step adds the hits. **BGM is NOT generated: the user adds their own music in post** (their standing preference). Leave the mix headroom for it; if they drop a track at `assets/audio/bgm.mp3` before render, `build_index.py` mounts it ducked (volume 0.16) automatically — otherwise ship voice+SFX only.

1. **Write `work/sfx_cues.json`** from the storyboard's audio-cues column — one entry per cue, **anchored to a narration word** so the timing is exact without hand-computing seconds:
   ```jsonc
   [{ "file": "soft whoosh", "word": "tài liệu", "nth": 1, "offset": -0.05, "volume": 0.5 },
    { "file": "digital sweep", "time": 62.0, "volume": 0.5 }]   // absolute time also allowed
   ```
2. **Pick sounds from the curated palette only** — full mapping, sync points, and intensity budget in `references/audio-layer.md`. In short: soft-whoosh/page-flip = paper slide, digital sweep = UI reveal, ping/success-click = node/step, soft-pop = badges + soft impact, error-blip = failure, typing = typed UI; the SWITCH build is `digital sweep`+`soft pop` (the BGM swell is the user's to add). **The harsh cinematic hits (`impact-bass`, `riser`, `sparkle`, `whoosh-cinematic`) were removed — do not use them; stamp/sticker-peel/marker foley are out of palette.**
3. Mounting happens in Step 5 via `build_index.py` (it resolves word anchors, probes durations, copies missing files from the installed media-use library, and assigns non-overlapping tracks).

**Gate:** `work/sfx_cues.json` exists and every storyboard audio cue appears in it, palette-only.

---

## Step 5: Build

Assemble from the skill's templates (`templates/`) — don't re-derive the machinery:

1. **Captions** — run `scripts/build_captions.py` (reads `transcript_words.json` + `fixes.json` + `beats.json`, groups ≤7-word lines, injects into `templates/captions-template.html`) → `compositions/captions.html`. Spec: `references/caption-system.md`.
2. **Ambient** — the ambient template is a **chrome-only overlay** (progress bar + `BITSNESS · <PRODUCT>` label + drifting dots) mounted **on top of the scenes**; set `DUR` and the HUD-dot recolor time. Add a thin **base-bg** layer at the very bottom of `index.html` (act-1 color → act-2 color crossfade at SWITCH) that only shows through the split-second transition gap.
3. **Scenes** — one sub-comp per beat from `templates/scene-skeleton.html`, implementing exactly the approved storyboard row: metaphor layout, punch text, named motion recipes, element timings anchored to the beat's narration words (relative = global − beat start). **Each scene carries its OWN opaque act background** (a `.sbg` layer: act-1 dusty / act-2 cream + grid, `z-index:0`, with `.scene` above it) — this is what lets `push`/`wipe`/`slide` transitions move the whole frame instead of sliding sparse content over a fixed backdrop (see `transition-map.md` §0). Scene layout leaves the caption zone clear (`padding: 250px 56px 500px`). Seek-safety: `/hyperframes-keyframes`.
4. **Index** — generated, not hand-written: `python <SKILL_DIR>/scripts/build_index.py --project . --title "<title>" --product "<PRODUCT>"`. It reads `beats.json` (+ per-beat `transition`) and `sfx_cues.json`, resolves word anchors, mounts base-bg → scenes → chrome → flash → captions → narration (+ `bgm.mp3` if the user supplied one), emits the transition timeline, and patches the ambient template's placeholders. Scene files must be named `compositions/<beat-id>.html`.
5. **Pre-flight** — `python <SKILL_DIR>/scripts/preflight_scenes.py --project .` and fix everything it reports **before** lint. It catches the traps lint/validate/inspect all miss: leftover `__PLACEHOLDER__`s, missing timeline registration, and the CSS-hidden `.from(autoAlpha)` 0→0 bug (an element that silently never appears — shipped once before this check existed).

**Gate:** preflight clean + `npx hyperframes lint` 0 errors (root-relative asset paths; every scene registers its timeline on `window.__timelines`).

---

## Step 6: QA + contact-sheet self-review

1. `npx hyperframes lint` → 0 errors, then `validate --timeout 90000` → 0 console errors, then `inspect --timeout 90000` → no unexplained layout findings (mark intentional entrance-offset overflow with `data-layout-allow-overflow`).
2. **Animation-map audit** — `node <ANIM_DIR>/scripts/animation-map.mjs` and check motion density per beat: any span > 3s with nothing moving is a defect (violates the channel's no-static rule); fix it. Also run the component-animation anti-pattern list (`references/component-animation.md` § 5): everything-animates, animation off its narration word, effect zoo (> 7 types / same component entering different ways), over-strong motion on ordinary elements, unreadable animated text.
3. `npx hyperframes snapshot --at <beat midpoints> --timeout 90000` → **Read the contact sheets and review them yourself** against `STORYBOARD.md`: captions legible? punch text landed? metaphor reads with sound off? act colors correct? Fix any defect and re-snapshot until clean.
   - **Anti-slop audit** (`references/design-taste.md`): also judge *taste*, not just correctness — templated look? AI-default gradient / centered-generic stack / weak type? motion matches the beat's MOTION dial? density right? A scene can pass lint/inspect and still be slop; fix taste failures the same way.
4. **Autonomous by default** — a clean contact sheet proceeds straight to Step 7; you do not need user sign-off to render. Escalate to the user only for a genuine judgment call (a creative choice that's theirs), or if the user explicitly asked to approve visuals for this run — then show the contact sheet and wait.

**Gate:** clean pipeline + contact sheet self-reviewed clean (user-approved only if they asked to review).

---

## Step 7: Render (draft → review → high), self-review, deliver

**Draft first, high once.** The self-review loop runs on a fast draft render; the expensive high render happens exactly once, after the draft passes:

```bash
npx hyperframes render --quality draft --output renders/draft.mp4 --skill=bitsness-video .
```

**Self-review the draft MP4** (catches encode/A-V issues the composition snapshots can't). If the `watch` skill is installed (github.com/bradautomates/claude-video), run it frames-only and Read a strategic handful of frames (hook, the SWITCH/reveal, payoff/punch beats, CTA):

```bash
python <WATCH_DIR>/scripts/watch.py renders/draft.mp4 --detail balanced --no-whisper --resolution 640
```

Verify against `STORYBOARD.md`: reveal lands, punch text/brand render correctly, captions legible, act colors right, no encode artifact. **Audio spot-check** (the frames don't cover sound): `ffmpeg -i renders/draft.mp4 -af volumedetect -f null - 2>&1 | grep -E "max_volume|mean_volume"` — max_volume must stay ≤ −1 dB (no clipping from stacked SFX); then confirm by ear that the loudest overlap (usually the SWITCH) keeps the voice on top.

On a real defect: fix, re-draft, re-check — silently. When clean, render the final and delete the draft:

```bash
npx hyperframes render --quality high --output renders/video.mp4 --skill=bitsness-video .
```

Deliver the file path, duration, and the contact sheet, noting any post-approval judgment calls. Remind the user the mix leaves BGM headroom for the music they add themselves.

---

## Quick reference

| Artifact | Produced by | Consumed by |
|---|---|---|
| `assets/narration.mp3` (loudnorm'd), `assets/script.txt` | Step 0 | Steps 1, 5 |
| `work/transcript_words.json` + `fixes.json` | Step 1 (`align_captions.py`) | `build_captions.py`, `build_index.py` |
| `work/beats.json` (+ per-beat `transition`) | Steps 1+3 | Steps 2, 5 (`build_index.py`) |
| `DESIGN.md`, `STORYBOARD.md` | Step 2 (user-approved) | Steps 3-5 |
| `work/sfx_cues.json` (word-anchored) | Step 4 | `build_index.py` |
| `assets/audio/bgm.mp3` | **the user** (optional, post/pre-render) | `build_index.py` mounts if present |
| `compositions/*` + `index.html` | Step 5 (`build_index.py` + `preflight_scenes.py`) | Steps 6-7 |
| `snapshots/contact-sheet-*.jpg` | Step 6 (self-reviewed) | Step 7 |
| `renders/draft.mp4` → `renders/video.mp4` | Step 7 (draft reviewed, high once) | delivery |

## Self-review (the "check without going through me" loop)

Two autonomous review passes bracket the render so the agent — not the user — catches defects:

- **Step 6, pre-render (composition):** contact-sheet snapshots at beat midpoints, read and checked against `STORYBOARD.md`. Cheap; catches layout/caption/color issues before spending a render.
- **Step 7, post-render (the actual MP4):** the `watch` skill (github.com/bradautomates/claude-video) extracts frames from `renders/video.mp4` via ffmpeg — `python <WATCH_DIR>/scripts/watch.py renders/video.mp4 --detail balanced --no-whisper --resolution 640` — which you Read to verify the encoded output (reveal, punch/brand, captions, act colors, no encode artifact). `--no-whisper` since you hold the script. Catches encode/A-V issues invisible to composition snapshots.

On a real defect at either pass: fix and re-run silently. Only the Step 2 storyboard is a hard user gate; visuals are self-approved unless the user asks otherwise.
