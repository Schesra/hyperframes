# Component animation — role-based selection

How to fill the storyboard's **motion recipe** column so every element inside a beat moves for a reason. Component animation is what makes a frame feel designed: it leads the eye, syncs picture to voice, and shows process/state without cutting. This file gives the selection procedure; the named implementations live in `/hyperframes-animation` (`rules-index.md`, `blueprints-index.md`).

## 1 · Assign every scene element a role

Before picking any animation, tag each element in the beat's metaphor with one of four roles:

| Role | What it is | Animation register |
|---|---|---|
| **PRIMARY** | The one element carrying the beat's idea (the punch text, the hero card, the verdict stamp) | Clear, fast, unmistakable entrance: fade up, scale in, mask reveal, `kinetic-beat-slam` |
| **SECONDARY** | Elements that explain or support (labels, sub-cards, connector lines, badges) | Enters *after* primary: slide in, stagger reveal, `svg-path-draw` |
| **DECORATIVE** | Depth and life (background shapes, grids, particles, gradients) | Light continuous motion only: slow float, parallax drift, slow pan — never competes with content |
| **INTERACTIVE** | Elements simulating real UI behavior (cursor, toggle, progress, typing, notification) | Animates like the real behavior: click + ripple, toggle switch, progress fill, autofill, scroll |

One PRIMARY per beat. If two elements feel primary, the beat has two ideas — split it (storyboard hard rule 2).

## 2 · Pick by content type

Within the role's register, match the element's content:

| Element is… | Use | Named rule / recipe |
|---|---|---|
| Headline / punch text | Text fade up, scale pop | `kinetic-beat-slam` |
| Explanation lines | Line-by-line reveal (never whole paragraphs at once) | stagger fromTo |
| Keyword to stress | Highlight sweep behind the word, underline draw | scaleX sweep, `svg-path-draw` |
| List / checklist | Item-by-item reveal + tick bounce, each on its narration word | stagger + `press-release-spring` |
| Process / workflow | Node appear → connector draw → sequential activation, in VO order | `svg-path-draw`, `grid-card-assemble` |
| Number / metric | Count up + bar/chart build (qualitative only — no invented numbers) | `stat-bars-and-fills`, `counting-dynamic-scale`, `dataviz-countup` |
| Warning / error | Micro shake or error pulse — short, once | `physics-press-reaction` |
| Verdict / conclusion | Stamp slam, check bounce, spotlight | `press-release-spring` |
| CTA | Button pulse (subtle) or cursor-click simulation | cursor move + ripple + state change |
| Document / sticky note | Paper drop (settle with rotation), paper slide, sticker peel | drop + settle chain |
| UI window / dashboard | Window open (scale + opacity), scroll, toggle, autofill | behavior-true tweens |
| Image / illustration | Mask reveal, slow zoom, gentle pan | clip-path inset/circle |

## 3 · Order inside the beat (timing skeleton)

Anchor each step to the narration word it belongs to (relative time = global − beat start):

1. Background / ambient layer settles (often carried over from the previous beat)
2. PRIMARY enters — on the beat's key narration word
3. SECONDARY enters — staggered after primary
4. Connectors / explanations activate as the VO reaches them
5. One emphasis hit on the PRIMARY mid-beat (highlight sweep, number pop) if the beat runs long
6. DECORATIVE keeps drifting (this is what satisfies the no-static-frame > 3s rule)
7. Elements that must leave use a light exit (fade/slide); strong exits (crumple, cross-out) only when removal *is* the meaning

Never animate more than one region at the same moment; leave a breath between motion beats.

## 4 · Budget (whole video)

- **5–7 component-animation types total**; 2–3 of them are the workhorses, the rest reserved for special elements (verdict stamp, CTA cursor).
- Same element type → same animation, every time (all cards enter one way; all ticks bounce the same).
- Not every element needs its own animation — supporting elements can simply be present.
- Emphasis effects (shake, pulse, glow) fire once and stop; nothing loops attention-seeking motion.
- Act register still applies on top (storyboard hard rule 6): Act 1 entrances collide and overshoot, Act 2 entrances align and settle.

## 5 · Anti-patterns (audited at Step 6 alongside the animation map)

- **Everything animates** → viewer doesn't know where to look. Only the element being narrated moves; decoration stays near-still.
- **Animation off-VO** → element appears before/after its sentence. Re-anchor to the word timestamp from `work/beats.json` / transcript.
- **Effect zoo** → more than ~7 types, or the same component entering three different ways. Consolidate.
- **Over-strong motion** → hard zoom/shake/bounce on ordinary elements. Reduce amplitude, soften ease, keep emphasis short.
- **Unreadable text** → per-character animation on long text, moving/rotating body copy. Animate titles, keywords, numbers, and a few focal lines only; text is static once landed.

## Preview

Rendered demo of the core set (if present in the checkout — local, gitignored): `videos/component-showcase/` + its MP4 in `renders/` — 11 effects (text fade up, card slide in, icon pop in, highlight sweep, line draw, checklist tick, progress fill, cursor click, slow parallax, paper drop, workflow activation), each a numbered copy-paste block.
