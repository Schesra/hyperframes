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

Name `<project>` from the video's topic in kebab-case. Create `videos/<project>/` with `assets/`, `assets/img/`, `compositions/`, `work/`, and a `meta.json` (`width: 1080, height: 1920`). Copy the user's narration to `assets/narration.mp3` and save the script verbatim to `assets/script.txt`.

Pick the **skin** with the user (one line, don't over-ask): `bitsness` (two-act dusty-paper → cream, the default for B2B/product stories) or `escbase` (single-act dark starfield + neon icon chips, for tool/repo/tech topics). Full specs: `references/style-skins.md`. Copy the matching ambient template from `templates/` into `compositions/ambient-bg.html` and set its `DUR` (and `SWITCH` later, after Step 1 finds it).

Brand assets (logo, product marks) come from the user or existing `Source/` material — inventory them in `work/assets.md`. Never invent a brand mark; recreate simple geometry as inline SVG when the source image is too heavy.

**Gate:** project folder exists with narration + script + skin chosen; total duration known (`ffprobe`).

---

## Step 1: Audio truth

Goal: word-accurate global timings and a beat map. The narration is law; everything else synchronizes to it.

1. **Transcribe** with word timestamps: `ffmpeg` → 16kHz mono wav, then `PYTHONIOENCODING=utf-8 whisper --model small --language Vietnamese --word_timestamps True --output_format json`. Save words to `work/transcript_words.json`.
2. **Fix mis-transcriptions against the script** — mandatory, not optional: one wrong karaoke word is instantly visible. Diff every whisper word against `assets/script.txt`; record fixes in `work/fixes.json` (`{"i": <word index>, "text": "replacement" | null}` — `null` merges the word into its predecessor). Common Vietnamese fixes live in `references/caption-system.md` § Fix table (tim→team, Acorn→Arkon, phai→file, thoẳn→thuẫn…); append new ones you find.
3. **Cut beats.** Group the corrected transcript into beats of **5–15s, one idea each** (sentence boundaries + topic shifts). Find **THE SWITCH** — the sentence where the product/answer first appears; it splits Act 1 (problem/chaos) from Act 2 (system/resolution). Write `work/beats.json`: `[{"id": "s01-<slug>", "start", "end", "idea", "act": 1|2, "accent": "<hex>"}]` (accent per act per `style-skins.md`).

**Gate:** `beats.json` covers the full duration with no gaps; every fix applied; SWITCH time locked (skip SWITCH for single-act `escbase` pieces).

---

## Step 2: Storyboard 🚩 USER GATE

Goal: the full creative plan, approved before any HTML exists.

Write `DESIGN.md` (concept angle, skin values, act palettes, type stack) and `STORYBOARD.md` with **one row per beat, five columns**:

| beat | ẩn dụ micro-world | punch text | motion recipe | audio cues |
|---|---|---|---|---|

- **Ẩn dụ micro-world** — a concrete UI-simulation metaphor (claw machine, file rows with status badges, glass boxes, gates, conveyor…), never a text card. Rules and the motif catalog: `references/storyboard-rules.md`.
- **Punch text** — Be Vietnam Pro 800/900, punches the idea, **never transcribes the VO** (captions already carry the VO).
- **Motion recipe** — 2-3 *named* rules/blueprints from `/hyperframes-animation` (e.g. `kinetic-beat-slam` for punch text, `svg-path-draw` for converging arrows, `stat-bars-and-fills` for counters, `press-release-spring` for stamps, `motion-blur-streak` for fast card entries, `grid-card-assemble` for hub scenes). Skim `../hyperframes-animation/rules-index.md` + `blueprints-index.md` while writing this column — do not free-style motion.
- **Audio cues** — SFX events by name from the bundled library + the BGM arc note (see `references/audio-layer.md` for the event→SFX mapping table).

Hard rules (from the channel's own DESIGN.md, enforced at Step 6): every visual reads with sound off · each beat = one idea · no static frame > 3s · no robots/AI-brain clichés · no invented numbers/claims · CTA end-beat (Comment "<keyword>" / Follow Bitsness) · subtle loop back to the opening motif.

**Present `STORYBOARD.md` to the user and STOP. Do not build until they approve.** Fold their edits in before continuing.

**Gate:** user approved the storyboard.

---

## Step 3: Transition map

One transition per cut, chosen from `/hyperframes-animation`'s catalog (`transitions/overview.md` → `transitions/catalog.md`) — never a uniform fade everywhere. Selection rules per act: `references/transition-map.md`. In short: Act 1 = hard, varied, escalating (push slide, squeeze, staggered blocks, glitch); THE SWITCH = one earned spectacle (light leak / overexposure burn / blur-through, or a `@hyperframes/shader-transitions` shader); Act 2 = calm and consistent (crossfade, focus pull). Record the choice per cut in `STORYBOARD.md` (add a `transition` note per row).

**Gate:** every cut has a named transition; the SWITCH transition is unique in the piece.

---

## Step 4: Audio layer (BGM + SFX)

The narration is already real — this step adds the bed and the hits via the shared engine (no TTS):

1. Write `audio_request.json` with `lines: []` (no TTS), a `bgm` query matching the arc (two-act: tense/cluttered underscore that resolves warm — or two cues, switched at SWITCH), and run `node <MEDIA_DIR>/scripts/audio.mjs --request ./audio_request.json --hyperframes . --out ./audio_meta.json --only bgm,sfx`.
2. **SFX per storyboard cue** from the bundled 19-file library — mapping conventions in `references/audio-layer.md` (whoosh = card entry, impact-bass = slam/stamp, error = failure beat, riser = into SWITCH, sparkle/chime = reveal, typing = typed UI, pop = badges/chips).
3. Mount in `index.html`: BGM as one `<audio>` track **ducked under the voice** (volume ≈ 0.14–0.22; if precision ducking is needed use the repo's audio-duck tooling), each SFX as its own offset `<audio>` element on a high track. If BGM took the generate path (`bgm_pending: true`), run `wait-bgm.mjs` before Step 7.

**Gate:** `audio_meta.json` exists; every storyboard audio cue has a mounted file + offset.

---

## Step 5: Build

Assemble from the skill's templates (`templates/`) — don't re-derive the machinery:

1. **Captions** — run `scripts/build_captions.py` (reads `transcript_words.json` + `fixes.json` + `beats.json`, groups ≤7-word lines, injects into `templates/captions-template.html`) → `compositions/captions.html`. Spec: `references/caption-system.md`.
2. **Ambient** — set `DUR` and `SWITCH` in the copied ambient template.
3. **Scenes** — one sub-comp per beat from `templates/scene-skeleton.html`, implementing exactly the approved storyboard row: metaphor layout (paper cards / neon chips per skin), punch text, the named motion recipes, element timings anchored to the beat's narration words (relative time = global − beat start). Scene layout leaves the caption zone clear (`padding: 250px 56px 500px`). Seek-safety for anything fancy: `/hyperframes-keyframes` (+ `hyperframes keyframes` diagnostics).
4. **Index** — from `templates/index-skeleton.html`: ambient (track 3) + scenes (tracks 11+, each mounted at beat start, duration +0.4s for the outgoing fade) + captions (mounted after scenes in DOM) + narration (track 4) + BGM/SFX tracks; main timeline toggles scenes with the Step 3 transition per cut.

**Gate:** `npx hyperframes lint` 0 errors (root-relative asset paths; every scene registers its timeline on `window.__timelines`).

---

## Step 6: QA + contact-sheet self-review

1. `npx hyperframes lint` → 0 errors, then `validate --timeout 90000` → 0 console errors, then `inspect --timeout 90000` → no unexplained layout findings (mark intentional entrance-offset overflow with `data-layout-allow-overflow`).
2. **Animation-map audit** — `node <ANIM_DIR>/scripts/animation-map.mjs` and check motion density per beat: any span > 3s with nothing moving is a defect (violates the channel's no-static rule); fix it.
3. `npx hyperframes snapshot --at <beat midpoints> --timeout 90000` → **Read the contact sheets and review them yourself** against `STORYBOARD.md`: captions legible? punch text landed? metaphor reads with sound off? act colors correct? Fix any defect and re-snapshot until clean.
4. **Autonomous by default** — a clean contact sheet proceeds straight to Step 7; you do not need user sign-off to render. Escalate to the user only for a genuine judgment call (a creative choice that's theirs), or if the user explicitly asked to approve visuals for this run — then show the contact sheet and wait.

**Gate:** clean pipeline + contact sheet self-reviewed clean (user-approved only if they asked to review).

---

## Step 7: Render, self-review, deliver

`npx hyperframes render --quality high --output renders/video.mp4 --skill=bitsness-video .`

**Then self-review the actual rendered MP4** (not just the pre-render snapshots — this catches encode/A-V issues the composition snapshots can't). If the `watch` skill is installed (github.com/bradautomates/claude-video — `npx skills add bradautomates/claude-video`, or run its `scripts/watch.py` directly), run it frames-only on the render and Read a strategic handful of frames (hook, the SWITCH/reveal, the payoff/punch beats, CTA):

```bash
python <WATCH_DIR>/scripts/watch.py renders/video.mp4 --detail balanced --no-whisper --resolution 640
```

Read the listed frame paths, verify against `STORYBOARD.md`: reveal lands, punch text/brand render correctly, captions legible, act colors right, no encode artifact. `--no-whisper` is fine — you already hold the script. This is an **autonomous** check: fix and re-render silently on a real defect; only surface to the user if a judgment call is theirs. Then deliver the file path, duration, and the contact sheet, noting any post-approval judgment calls.

---

## Quick reference

| Artifact | Produced by | Consumed by |
|---|---|---|
| `assets/narration.mp3`, `assets/script.txt` | Step 0 | Steps 1, 4, 5 |
| `work/transcript_words.json`, `work/fixes.json` | Step 1 | `build_captions.py` |
| `work/beats.json` | Step 1 | Steps 2, 5 |
| `DESIGN.md`, `STORYBOARD.md` | Step 2 (user-approved) | Steps 3-5 |
| `audio_request.json` → `audio_meta.json` | Step 4 | Step 5 index |
| `compositions/*` + `index.html` | Step 5 | Steps 6-7 |
| `snapshots/contact-sheet-*.jpg` | Step 6 (self-reviewed) | Step 7 |
| `renders/video.mp4` + `watch` frames | Step 7 (self-reviewed) | delivery |

## Self-review (the "check without going through me" loop)

Two autonomous review passes bracket the render so the agent — not the user — catches defects:

- **Step 6, pre-render (composition):** contact-sheet snapshots at beat midpoints, read and checked against `STORYBOARD.md`. Cheap; catches layout/caption/color issues before spending a render.
- **Step 7, post-render (the actual MP4):** the `watch` skill (github.com/bradautomates/claude-video) extracts frames from `renders/video.mp4` via ffmpeg — `python <WATCH_DIR>/scripts/watch.py renders/video.mp4 --detail balanced --no-whisper --resolution 640` — which you Read to verify the encoded output (reveal, punch/brand, captions, act colors, no encode artifact). `--no-whisper` since you hold the script. Catches encode/A-V issues invisible to composition snapshots.

On a real defect at either pass: fix and re-run silently. Only the Step 2 storyboard is a hard user gate; visuals are self-approved unless the user asks otherwise.
