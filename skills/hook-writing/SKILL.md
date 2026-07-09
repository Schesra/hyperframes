---
name: hook-writing
description: "Write, pick, or audit a video's opening hook — the first ~3 seconds of spoken line and the first frame of visual, the single highest-leverage beat in any short-form or social video (retention data shows losing more than ~35% of viewers in the first 3 seconds means the hook failed, regardless of how good the rest of the video is). Use this skill whenever a workflow reaches its Hook / Frame 1 beat — /faceless-explainer, /facebook-post-to-video, /product-launch-video, /pr-to-video, /motion-graphics, /music-to-video, /general-video, or any composition that opens with a hook. Covers the five cognitive triggers, a hook-type taxonomy mapped to HyperFrames blueprints, platform timing rules, a picking method by content type, and a self-audit checklist. Not for the body/middle of a video (that's each workflow's own story-design.md) or for motion/visual craft once the hook's TYPE is chosen (that's hyperframes-animation)."
---

# Hook writing

A video's opening beat carries disproportionate weight: lose the viewer in the first ~3 spoken seconds (or the first visual frame) and nothing else in the video gets seen. This skill is the canonical place any HyperFrames workflow reaches for **when it writes or evaluates a hook** — the Hook beat in a storyboard, `type: hook` in the frame's metadata, the opening `## Frame 1` in any of `/faceless-explainer`, `/facebook-post-to-video`, `/product-launch-video`, `/pr-to-video`, `/motion-graphics`, `/music-to-video`, `/general-video`.

**What this skill does NOT do:** it doesn't plan the rest of the story (each workflow's own `references/story-design.md` owns beat sequencing after the hook), and it doesn't handle motion/layout craft once a hook TYPE is chosen (that's `../hyperframes-animation` + `../hyperframes-creative`). This skill's job ends at: *which hook type, what words, what's on screen at t=0* — the workflow then instantiates it as a time-coded shot sequence exactly like any other frame.

## Why the hook is worth this much attention

Retention data across TikTok / Reels / Shorts is consistent: **losing more than ~35% of viewers in the first 3 seconds means the hook failed**, independent of how good the rest of the video is — and videos that hold **65%+ of viewers past the 3-second mark** are what the algorithm actually pushes to the For You page / Reels feed / Shorts shelf. A viewer who drops in the first 1 second was lost to a **weak visual/audio pattern interrupt**; a viewer who drops right at 3 seconds was lost because **the promise itself was too weak**. If retention holds through ~5 seconds and drops after, the hook worked and the *content* didn't deliver — that's a body/pacing problem, not a hook problem, and it's out of scope here.

This is the concrete backing for the common creator heuristic that the hook alone decides most of a video's outcome — the visual execution (craft, motion, design) and the substance of the content both matter, but neither gets a chance to matter if the hook doesn't hold the first three seconds.

## The five cognitive triggers

Every hook that works pulls at least one of these five levers. **The strongest hooks stack two or more in a single line:**

1. **Curiosity / open loop** — present an incomplete piece of information (a question without an answer, a claim without its reason) that the brain wants to resolve. The itch has to feel resolvable *soon*, not abstractly someday.
2. **Pattern interrupt** — violate the viewer's expectation in the first frame or first second: an unexpected visual (hard cut, whip-pan, snap-zoom, jarring color/contrast), an unexpected sound (silence where music is expected, an abrupt statement), or a contextual mismatch (something that doesn't belong in this feed/niche).
3. **Self-relevance** — the viewer has to feel *this is about me* within the first line: a shared identity ("if you've ever…"), a shared pain, a direct address ("bạn" / "you"), a stake in the outcome.
4. **Emotional arousal** — controversy, a bold contrarian claim, a shocking stat, outrage, awe. High-arousal emotion (positive or negative) drives both the initial stop-scroll and the eventual share.
5. **Authority / name recognition** — leading with a famous, widely-recognized name or institution stops the scroll on its own, independent of what they actually said. Two compounding reasons: (a) viewers assume claims tied to a known name/institution are already vetted or newsworthy, lowering the perceived risk of "wasting time" on the video; (b) a recognizable name has a built-in audience who wants to hear about *them specifically*, regardless of topic. This is why a flat, neutral name-drop opener ("X just said Y") can outperform a punchier rewritten hook that buries or drops the name — the recognition itself is doing hook work that a generic curiosity/question framing would throw away. Prefer leading with the name, unobscured, whenever the subject is genuinely recognizable to the target audience; save curiosity-gap/question framing for when the subject itself isn't the draw.

## Hook-type taxonomy → HyperFrames blueprint

Each type below names its dominant trigger(s) and the blueprint (`../hyperframes-animation/blueprints-index.md`) that already builds it as a time-coded shot. Pick the type first from content fit, then let the blueprint's own template carry the shot — don't invent new motion vocabulary here.

| Hook type | What it does | Triggers | Best fit | Blueprint |
| --- | --- | --- | --- | --- |
| **Contrarian claim** | State a belief the audience holds, then flatly contradict it | curiosity + emotional arousal | fact-check/reaction content, myth-busting explainers | `kinetic-type-beats` |
| **Mistake warning** | "You're doing X wrong" / "X is costing you Y" | self-relevance + curiosity | tutorials, how-to, product pain-points | `kinetic-type-beats` or `typewriter-reveal` |
| **List tease** | Name the count before the content ("3 things about X nobody tells you") | curiosity + self-relevance | listicles, feature roundups, pattern/evidence beats | `grid-card-assemble` |
| **Curiosity gap / open loop** | Hint at an outcome without revealing it ("what happened next surprised everyone") | curiosity | storytelling, drama-recap, narrative explainers | `typewriter-reveal`, `ticker-takeover` |
| **Problem / pain** | Name a shared frustration directly, no setup | self-relevance + emotional arousal | product pain-points, workflow explainers | `kinetic-type-beats` |
| **Outcome / transformation** | Open on the result, work backward to how | curiosity | demo-driven product content, before/after | `dataviz-countup`, `video-text-pivot` |
| **Data / shocking fact** | Lead with a stat that reframes the topic | emotional arousal + curiosity | fact-check, data-driven explainers | `dataviz-countup` |
| **Question (direct address)** | Ask the viewer a real question, not rhetorical filler | self-relevance | reaction content, discussion-bait, closes doubling as hooks | `kinetic-type-beats` |
| **Storytelling cold-open** | Drop into a scene/moment already in motion, no throat-clearing | curiosity + self-relevance | narrative explainers, recap content | `spatial-pan-stations` |
| **Visual / sensory** | The image itself is the interrupt — no words needed for the first beat | pattern interrupt | anything with a striking real asset (a screenshot, a photo, a chart) | `titlecard-reveal`, `constellation-hub` |
| **Authority / name-drop** | Lead flatly with a recognizable name/institution + what they said or did, unobscured | authority/recognition (+ curiosity if the claim itself is notable) | reaction/fact-check content about a specific public figure or brand, news-adjacent explainers | `kinetic-type-beats`, `titlecard-reveal` |

Two or more rows can combine in one hook (e.g. a **contrarian claim** delivered as a **direct question** stacks curiosity + emotional arousal + self-relevance) — that stacking is exactly what the research shows the strongest hooks do.

## Timing — non-negotiable

- **Spoken hook: lands inside the first 3 seconds**, budget **~10–14 words**. Longer than that and the promise arrives too late.
- **Visual hook: hits in the first frame** — at `t=0`, not eased into. This is the same rule `../hyperframes-animation`'s motion doctrine already enforces (no front-loading *after* t=0, but the hook's core promise must be legible instantly, not revealed word-by-word over 2 seconds).
- **Bake the hook as on-screen text, not spoken-only.** Viewers scroll with sound off far more often than workflows assume; text-visible hooks measurably outperform audio-only ones. In HyperFrames terms: the hook's headline is real DOM content in the frame (short motion-graphics copy, per each workflow's frame-worker rules), not something the viewer only gets from the caption track syncing up a beat later.
- **Platform tightens the window, never loosens it:** short-form vertical (TikTok-style) wants the interrupt in the first ~1.5s; Reels/Shorts-style content tolerates 2–3s; a longer explainer (30–90s+) still needs the promise landed by 3s even though the piece itself has more room later. Longer runtime is not license for a slower hook.
- **One promise. Not two, not three.** A hook that tries to set up multiple ideas dilutes all of them. If the content genuinely has two hooks worth using, that's two frames (a cold-open hook, then a second escalation beat) — never one frame carrying both.

## Picking method

0. **Check for a recognizable subject first.** If the video is about a specific person, brand, or institution the target audience already knows, that recognition is usually the strongest available trigger — lead with the name unobscured (see **Authority / name-drop** above) rather than defaulting to a rewritten curiosity/question hook that buries it. Only reach for curiosity-gap/contrarian-question framing when the subject itself isn't the draw, or when the name-drop alone would be too flat for the content's energy.
1. **Name the content type** the workflow is building: explainer/educational, entertainment/narrative, product demo, reaction/fact-check, process/behind-the-scenes.
2. **Match to the taxonomy's "Best fit" column.** Educational content defaults to a direct promise, mistake-warning, or question; entertainment/narrative defaults to pattern interrupt or curiosity-gap; reaction/fact-check content (see `../facebook-post-to-video`) defaults to contrarian claim or data/shocking-fact; product demos default to outcome/transformation.
3. **Check for a stackable second trigger.** A single-trigger hook is usually weaker than a stacked one — can the same line also carry self-relevance (address the viewer directly) or emotional arousal (sharpen the claim)?
4. **If a real asset makes the interrupt for free** (a striking screenshot, an already-surprising photo, a chart that speaks for itself), prefer **visual/sensory** and let the image carry the first beat with minimal or no text competing with it.
5. **Confirm against the workflow's own angle/arc**, if one is already locked (e.g. `/facebook-post-to-video`'s hot-take vs. fact-check vs. drama-recap) — the hook type should telegraph the arc, not contradict it. A fact-check angle opening on a pure curiosity-gap tease (with no claim to contradict yet) undersells the video's actual value; a contrarian-claim hook undersells a gentle explainer's tone.

## Self-audit checklist

Before locking a hook, check every line:

- [ ] Spoken line is **≤ ~14 words** and lands its promise inside 3 seconds read aloud.
- [ ] The hook states **exactly one promise** — no compound setup.
- [ ] It stacks **at least one** cognitive trigger explicitly (name which one(s) — if you can't name it, the hook is probably generic).
- [ ] The **first frame** (not the first few seconds — the literal first frame) already shows the hook's subject, not a logo/intro/throat-clearing.
- [ ] It contains **no generic opener** — "hôm nay mình muốn nói về…", "so today I want to talk about…", "let's dive into…" are dead air; cut straight to the claim/question/stat.
- [ ] A stranger scrolling past would need **under 1 second** to know what this video is about, even with sound off (on-screen text carries it).
- [ ] The hook's promise is **something the rest of the video actually pays off** — a strong hook whose payoff never lands trains the audience to distrust the next hook.
- [ ] If this workflow's angle/arc is already locked, the hook type **matches it** rather than fighting it (see step 5 above).
- [ ] If the subject is a recognizable name/brand/institution, that recognition is **leading and unobscured** — not buried mid-sentence or replaced by a rewritten curiosity-question that trades away the recognition trigger for a different one.

## Integration notes for workflow authors

Each creation workflow's `references/story-design.md` still owns its own hook GUIDANCE tuned to that domain (e.g. `/facebook-post-to-video`'s hook catalog is angle-aware: hot-take vs. fact-check vs. drama-recap open differently). This skill is the **shared mechanics layer** underneath those: the five triggers, the timing rules, and the audit checklist are domain-agnostic and shouldn't be re-derived per workflow. When writing or revising a workflow's hook section, prefer citing this skill's taxonomy/checklist over restating it — and when auditing an already-drafted hook (in any workflow, at any point before Step 3's approval gate), run it through the self-audit checklist here before presenting it to the user.
