# Transition map — per-cut selection

One named transition per cut, chosen from `/hyperframes-animation` (`transitions/overview.md` for the seek-safe mechanics, `transitions/catalog.md` for the menu) plus the paper/editorial set in `references/transition-recipes.md`. A uniform crossfade everywhere is the tell of a lazy build — the reference videos vary cuts by act and escalate them.

Work through the four steps below for **every cut** (beat k → beat k+1). Steps 1–3 narrow the menu; step 4 sanity-checks the whole map.

## 0 · Prerequisites (or transitions read as no-ops)

Two things gate whether a transition is even *visible* — both learned the hard way:

1. **Every scene must carry its own opaque act background** (dusty in Act 1, cream in Act 2, with grid). The `ambient-bg` is a **chrome-only overlay** (progress bar + label + dots) on top, plus a thin base layer that only fills the split-second transition gap with the right act color. If scenes are transparent over one shared background, a `push`/`wipe`/`slide` only moves the sparse scene *content* over a fixed backdrop — it barely reads. With per-scene backgrounds, the whole frame moves and every transition family works. **Set this up in Step 5, not as an afterthought.**
2. **The transition needs a matching sound in the palette** (`audio-layer.md`). Rubber-stamp, sticker-peel, and marker-stroke foley were dropped — so **do not pick `stamp`, `sticker peel`, or `paper tear`-as-peel as a cut** expecting a sound. The paper cuts that *do* have foley: **page turn** (`page flip`), **paper slide** (`soft whoosh`), **paper tear** (`paper tear`). Prefer those; for UI cuts use panel swipe / `digital sweep`.

Also: **actually run steps 1-4 for every cut** — the #1 quality regression is defaulting to one basic autoAlpha fade for the whole video instead of selecting per cut.

## 1 · Intensity — how do the two beats relate?

Classify the narrative relationship first; it sets the transition level:

| Relationship between the two beats | Level | Base menu |
|---|---|---|
| Same idea continues (next sentence of the same point) | **LIGHT** | crossfade, blur crossfade, focus pull, marker wipe |
| New point, next step, next list item | **MEDIUM** | push slide, vertical push, squeeze, zoom through (push-in), zoom out (pull-back), panel swipe, graphic overlay, page turn, paper slide out, sticker peel |
| Hook, reveal, verdict, section change, THE SWITCH | **STRONG** | whip pan, light flash / overexposure burn, shape-mask iris, foreground wipe, speed-ramp push, staggered blocks, glitch, paper tear, stamp, crumple |

Most beats in a Bitsness script are "new point" cuts — MEDIUM is the workhorse; LIGHT stitches sentences that share a beat's idea across two scenes; STRONG is rationed to the hook, THE SWITCH, and the payoff.

## 2 · Act modulation

The act tunes *which members* of the level's menu you pick and how fast they run:

- **Act 1 (chaos) — hard, varied, escalating.** Prefer the harsher members (squeeze, staggered blocks, glitch, gravity drop over plain push slide) and escalate as the problem compounds: early cuts gentler, late Act-1 cuts harshest. Fast: 0.25–0.35s. Never the same transition twice in a row. Pair the harshest cuts with a `glitch-*` or `impact-bass` SFX.
- **THE SWITCH — one earned spectacle, unique in the piece.** Light leak, overexposure burn, blur through, focus pull — or a WebGL shader from `@hyperframes/shader-transitions` (read the package source; don't paste raw GLSL). Slower: 0.7–1.0s. The ambient palette crossfade (1.6s) runs underneath; `riser` SFX leads into it, `impact-bass` + `sparkle` land it. This is the only place a shader transition is worth its render cost by default.
- **Act 2 (system) — calm, consistent, decisive.** Crossfade, blur crossfade, focus pull, gentle zoom-out. 0.4s, `sine/power2.inOut`. At most two kinds across all of Act 2 — consistency reads as order (the story's point).

## 3 · Semantic override — match the incoming beat's metaphor

When the incoming beat's micro-world metaphor names a surface or material, a matched transition lands harder than a generic one. Within the level chosen in step 1, prefer:

| Incoming beat is about | Prefer |
|---|---|
| Document, SOP, checklist, contract, book | page turn, paper slide out, paper tear |
| UI, dashboard, software, browser, workflow | panel swipe, shape-mask iris, graphic overlay |
| Verdict, confirmation, "this is the answer" | stamp |
| An insight or solution being *revealed* | paper tear, sticker peel, shape-mask iris |
| Story progression, time passing, before/after | page turn, zoom out, visual match cut |
| Discarding the old way / failed approach | crumple, paper slide out |

**Skin gate:** the paper family (page turn, paper slide out, paper tear, sticker peel, stamp, crumple) belongs to the `bitsness` paper skin only. On `escbase` (dark neon) paper is off-brand — substitute the UI/tech members (panel swipe, shape-mask iris, glitch, graphic overlay).

## 4 · Whole-video budget check

After mapping all cuts, verify:

- **≤ 3–4 transition families** in the piece; one primary family covers **60–70%** of cuts.
- **Paper/material effects: 10–20% of cuts, never two in a row** — they're high-recognition and go template-y fast.
- The SWITCH transition appears **exactly once**.
- Act-1 cuts never repeat back-to-back; Act 2 uses ≤ 2 kinds.
- If in doubt, repeat the primary — consistency beats variety.

Record the result per storyboard row: `transition: <name> · <LIGHT|MEDIUM|STRONG>`, so Step 5 is mechanical.

## Recipes

- **Base set** (push, zoom, dissolve, cover, light, distortion, iris): `/hyperframes-animation` → `transitions/catalog.md` → the per-category `css-*.md` file. Adapt constants to the vertical canvas: horizontal travel ±1080, vertical travel ±1920.
- **Paper/editorial + overlay set**, pre-adapted to 1080×1920 and the sub-comp layer architecture: `references/transition-recipes.md` (this skill).
- **Rendered previews** (if present in the checkout — local, gitignored): `videos/transition-showcase/` (13 base effects) and `videos/transition-showcase-paper/` (7 paper effects) plus their MP4s in `renders/`. Watching them is the fastest way to choose.

## Implementation notes

- Transitions run on the **main timeline** in `index.html`, toggling scene layers with `autoAlpha` (+ transform per the chosen type) — the reference pattern (`hardCut`/`softFade` helpers) generalizes: write one helper per transition type used.
- The outgoing scene's mount extends +0.4s past its beat end so it exists during the fade; the incoming mounts exactly at its beat start.
- Complex transitions (blinds, staggered blocks, iris) need the per-type recipe from the catalog's reference file (e.g. `transitions/css-cover.md`) — read it, don't improvise the clip-path math.
- Overlay-based transitions (stamp, graphic overlay, foreground wipe, marker tip, panels, flash) mount their overlay element **once** in `index.html` at `z-index ≥ 90`, reused across cuts.
