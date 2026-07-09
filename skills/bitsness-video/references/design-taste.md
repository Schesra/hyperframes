# Design taste — the anti-slop lens

Adapted from **taste-skill** ([github.com/Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), MIT) — its "anti-slop frontend" framework, retuned for HyperFrames **motion video**. taste-skill was built for static landing pages/portfolios; we take its *principles* (read the room, dials, anti-default discipline), not its literal landing-page rules. This is a **taste layer** over Step 2 (design) and Step 6 (review), not a new workflow.

## Step 2 — fold into `DESIGN.md` before locking palette/type

### 1. Design read (one line, before any color)
Extend the concept-angle we already write into a full read:
> *"Reading this as: `<topic kind>` for `<audience>`, with a `<vibe>` language, leaning `<aesthetic family>`."*

The **audience** picks the aesthetic, not our taste. Example: *"a dev-tool blast-radius explainer for engineers, technical/code-native language, leaning monospace-heavy dusty-paper → cream reveal."*

### 2. Three dials (tuned for video) — state the values in DESIGN.md
- **`DESIGN_VARIANCE` (1 symmetry ↔ 10 artsy-chaos)** — video baseline **6-8**. Chaos beats push higher, resolution beats lower.
- **`MOTION_INTENSITY` (1 static ↔ 10 cinematic/physics)** — the dial that matters most for video. It should *track the act*: bitsness Act 1 (chaos) ≈ **7-8**, Act 2 (order) ≈ **4-5**. A flat MOTION value across the whole piece is a tell.
- **`VISUAL_DENSITY` (1 airy ↔ 10 cockpit)** — ties to the "8-10 elements per scene" rule; ≈ **4-6**. Too low reads empty; too high reads cluttered.

Set them from the design read; if two beats have very different energy, note per-act dial values.

### 3. Anti-default discipline (the anti-slop guardrail)
**Never default to** the LLM-slop tells — reach past each one deliberately:
- AI-purple / teal gradients, centered stack over a dark mesh
- three equal feature cards, generic glassmorphism on everything
- Inter / slate-900 / system-ui as the "safe" type
- infinite-loop micro-animation everywhere (also breaks determinism)
- **walls of centered text carrying the VO** — this is the exact critique that motivated the whole Bitsness formula; captions carry the VO, scenes are micro-worlds

If a design choice matches a default above, it needs a reason from the design read, or a different choice.

## Step 6 — anti-slop audit (run on the contact sheet + rendered frames)

A scene can pass `lint`/`validate`/`inspect` and still be **slop**. This is a taste gate, not a correctness gate. For each scene ask:

1. **Templated?** Does it read as a generic AI card / stock layout rather than an authored micro-world?
2. **Default tells?** AI-gradient, centered-generic stack, glassmorphism, weak default type?
3. **Typography** — real hierarchy (weight/size/mono-vs-sans contrast), or one flat weight?
4. **Motion** — does the on-screen motion match the beat's `MOTION_INTENSITY` dial, or is it static / over-animated?
5. **Density** — matches the `VISUAL_DENSITY` dial (not empty, not cluttered)?

Fix taste failures before render, the same way you fix layout failures — silently, then re-check. Escalate to the user only if the fix is a creative call that's theirs.
