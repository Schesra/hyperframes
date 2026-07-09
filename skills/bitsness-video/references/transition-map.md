# Transition map — act-aware cut selection

One named transition per cut, chosen from `/hyperframes-animation` (`transitions/overview.md` for the seek-safe mechanics, `transitions/catalog.md` for the menu). A uniform crossfade everywhere is the tell of a lazy build — the reference videos vary cuts by act and escalate them.

## Selection rules

**Act 1 (chaos) — hard, varied, escalating.** Draw from: push slide, vertical push, squeeze, staggered blocks, horizontal blinds, glitch, chromatic aberration, gravity drop. Rules:
- Never the same transition twice in a row.
- Escalate: early cuts gentler (push slide), late Act-1 cuts harsher (glitch, squeeze) as the problem compounds.
- Keep them fast: 0.25-0.35s.
- Pair the harshest cuts with a `glitch-*` or `impact-bass` SFX.

**THE SWITCH — one earned spectacle, unique in the piece.** Light leak, overexposure burn, blur through, focus pull — or a WebGL shader from `@hyperframes/shader-transitions` (read the package source for available shaders; don't paste raw GLSL). Slower: 0.7-1.0s. The ambient palette crossfade (1.6s) runs underneath; `riser` SFX leads into it, `impact-bass` + `sparkle` land it. This is the only place a shader transition is worth its render cost by default.

**Act 2 (system) — calm, consistent, decisive.** Crossfade, blur crossfade, focus pull, gentle zoom-out. 0.4s, `sine/power2.inOut`. At most two kinds across all of Act 2 — consistency reads as order (the story's point).

## Implementation notes

- Transitions run on the **main timeline** in `index.html`, toggling scene layers with `autoAlpha` (+ transform per the chosen type) — the reference pattern (`hardCut`/`softFade` helpers) generalizes: write one helper per transition type used.
- The outgoing scene's mount extends +0.4s past its beat end so it exists during the fade; the incoming mounts exactly at its beat start.
- Complex transitions (blinds, staggered blocks, iris) need the per-type recipe from the catalog's reference file (e.g. `transitions/css-cover.md`) — read it, don't improvise the clip-path math.
- Record the final choice per cut as a `transition` note on the storyboard row, so Step 5 is mechanical.
