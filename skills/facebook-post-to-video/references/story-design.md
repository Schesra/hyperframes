# Story design — facebook-post-to-video

Step 3 of the facebook-post-to-video flow. Output: `STORYBOARD.md` (the narrative plan, one frame per beat) and `SCRIPT.md` (the locked spoken narration).

This step decides **what the video says about the source post, in what order, and how each beat is said** — and it says each beat in the SHAPE of a proven script. It does not design layout, composition, or motion (that is Step 4). For exact file syntax follow `../hyperframes-core/references/storyboard-format.md` and `../hyperframes-core/references/script-format.md`.

## What story design produces

For every beat, four things:

1. **Position in the SEQUENCE** — the shot order. Story truth decides which beats exist and in what order (the arc).
2. **Voiceover written in a blueprint's script shape** — the spoken line, drafted to sound like the proven script for the shape this beat is reaching toward (see the reaction-structure catalog below).
3. **A candidate `blueprint:` id** — the proven shot SHAPE this beat leans toward (a tag, not a commitment; Step 4 confirms or overrides).
4. **`transition_in`** — how this beat enters from the one before it.

This is still a SOFT discipline. Story truth comes first: **never invent, bend, drop, or reorder a beat to fit a blueprint.** Reaction structures only shape HOW a beat is said and which proven shape it leans toward — they never decide which beats exist, and they never invent a fact the source post didn't contain.

## Read first

1. `hyperframes.json` — locked brief: angle, length, aspect ratio, language.
2. `frame.md` — tone, mood, design system, brand register.
3. `capture/extracted/visible-text.txt` — the post's text/caption, who posted it (as the user described them), and the user's own framing of why it's trending.
4. `capture/extracted/asset-descriptions.md` — the ONLY source for the real supplied asset inventory (screenshots, photos, logos, clips, memes).
5. `user_script.txt` and `VO_MODE`, when present.

Do not inspect `capture/assets/`, contact sheets, screenshots, or raw files in Step 3. Treat `asset-descriptions.md` as the canonical asset list. Never invent asset filenames.

## Guardrails (read before drafting)

This step turns a real person's real post into commentary content. Three rules override everything else in this file:

1. **Never fabricate a quote, statistic, or claim the user didn't actually paste in.** Paraphrase and summarize freely for pacing, but anything presented as "what the post said" must trace back to `visible-text.txt`. If a fact is missing, say it's unconfirmed rather than inventing it.
2. **Never research or expose information about a private individual beyond what the user already supplied.** Public figures, brands, and public institutions can be discussed using publicly known context; a private person's identity, location, workplace, or other personal details are off-limits unless the user's own pasted material already made them public knowledge in that post.
3. **Flag, don't silently proceed, when the post reads as harassment/pile-on fodder** — a private individual being dogpiled, content that's primarily mockery of someone's appearance/health/tragedy, or a "hot" post whose entire value is humiliating someone. Surface the concern to the user in one line and ask how they want to frame it (context/fact-check angle instead of pile-on, or a different post) rather than building the harassment-shaped video by default. This is not a blanket refusal on commentary or criticism — reacting to public discourse, calling out misinformation, or covering a genuinely public controversy is normal, legitimate content.

## Method

### 1. Extract the hot-post truth

From the brief and the pasted post, name:

- **The post** — what it actually says, in the user's own words (verbatim excerpt where it matters).
- **Who's involved** — a public figure, brand, institution, or an anonymous/private poster (per the guardrails above).
- **Why it's hot** — what made it spread: it's funny, it's outrageous, it's relatable, it contradicts something, it's a reveal, it's a trend/challenge, it's misleading and needs context.
- **The angle** — the creator's own take: hot-take/reaction, fact-check/context, recap+opinion, meme-remix/listicle, or drama-recap (see the catalog below).
- **The close** — what the viewer should think or do after watching (agree, reconsider, laugh, share, look something up).

Build the sequence around **the angle**, not a beat-by-beat retelling of the post. A repost is just the source material; a video is a take on it.

### 2. Choose the arc (the sequence backbone)

Pick ONE arc — it fixes the beat order. Compound only when useful.

| Arc                    | Use when                                                          | Beat order                                                             |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `Hot Take`              | The post itself is the hook; the creator's opinion is the payoff. | hook → recap the post → the take → why (evidence/examples) → close      |
| `Fact-Check / Context`  | The post is misleading, missing context, or half the story.       | hook (the claim) → recap the post → what's missing/wrong → the fuller picture → close |
| `Recap + Opinion`       | A drama/story unfolded across several posts/replies/updates.       | hook → timeline beat 1 → beat 2 → beat 3 → opinion/verdict → close       |
| `Meme-Remix / Listicle` | The post is a jumping-off point for a broader pattern or list.     | hook → post as example #1 → example #2 → example #3 → the pattern → close |
| `Drama-Recap`           | A public back-and-forth (subtweet/reply chain) is the story.       | hook → who/what started it → escalation → the turn → current state → close |

Use a beat-by-beat cadence inside any arc when the post has several distinct parts worth calling out individually — always translate "what the post shows" into "what the viewer should notice," never just narrate the screenshot.

`frame.md` tunes the VOICE, not the arc: deadpan/dry → understated, few words; unhinged/loud → punchy, exclamatory; earnest/explainer → calm, measured; gossip/drama → conspiratorial, direct address.

### 3. Lay out the beats, each with a role

One clear job per beat — never "more recap" or "another screenshot." Beat `type` (= blueprint **role**):

`hook | recap | context | reaction | evidence | pattern | verdict | cta`

The opening 1–3s needs ONE hook that stops the scroll — restate the post's most surprising line, a rhetorical "wait, did you see this?", a direct address to the viewer, or the punchline landing early with the setup following. Never open with "so today I want to talk about a post I saw" — that's dead air on a feed.

A drama/timeline recap is usually a SEQUENCE of 2–4 consecutive `recap` / `context` beats on the same surface (screenshot → next screenshot → next reply), not one frame trying to hold the whole story.

### 4. Write each beat's VO in its structure's shape

For each beat, look up its **role** in the reaction-structure catalog below, find the blueprint whose SHAPE fits the beat you already chose, and **draft the voiceover to sound like that pattern.** Tag the candidate `blueprint:` id on the frame.

- If two blueprints fit the beat, prefer the one whose script shape matches the line you'd naturally write.
- If NO shape fits the beat, omit `blueprint:` and write the VO plainly — Step 4 composes that frame freely. Do not force a wrong shape.
- **Vary the shapes across the video.** Reaching for the same blueprint every beat re-creates the sameness this exists to avoid.
- **Write each VO as discrete cues, not one run-on breath.** Step 5 reveals each on-screen piece _when the voiceover names it_ (the anti-PowerPoint mechanism — `motion-language.md` Part 2). A line with clear phrase boundaries hands the shot its reveal cadence for free.

Step 3 only TAGS the candidate id and writes the shaped VO. Step 4 (visual design) picks and instantiates the blueprint into a time-coded shot; it may override or drop a Step 3 candidate. The full menu with picking guidance lives in `../hyperframes-animation/blueprints-index.md`.

---

## Reaction-structure catalog — what each beat's VO sounds like

> Grouped by **role → blueprint**, drawn from the general blueprint menu (`../hyperframes-animation/blueprints-index.md`) rather than a genre-specific clip bank — reaction content is too varied per-post for fixed golden examples, so these are shapes, not scripts to imitate word-for-word. Draft your beat's VO in the SHAPE described.

### HOOK

**kinetic-type-beats** — the words ARE the motion

- _Pattern:_ restate the post's single most surprising line as a punchy claim, or ask the viewer a direct rhetorical question ("Did you see what [X] just posted?").

**titlecard-reveal** — calm, deadpan cold-open

- _Pattern:_ one clean title card stating the setup in as few words as possible, held a beat before the recap starts — right for a dry/understated register.

**ticker-takeover** — a guess-the-outcome tease

- _Pattern:_ a "was it X? Y? Z?" cycle before crashing into the real answer — good when the hook is "you won't believe what happened next."

### RECAP

**titlecard-reveal / device-surface-showcase** — the screenshot itself is the evidence

- _Pattern:_ the real post screenshot holds center-frame long enough to actually read, VO reading it aloud or paraphrasing the key line as it's highlighted.

**spatial-pan-stations** — a timeline of screenshots

- _Pattern:_ a march of named moments (post → reply → follow-up) traversed left-to-right or top-to-bottom, landing on "...and that's when it blew up."

### CONTEXT

**comparison-split** — the claim next to the correction

- _Pattern:_ two paired panels — "what the post said" beside "what actually happened" — equal visual weight, letting the contrast make the point.

**dataviz-countup** — the missing number

- _Pattern:_ a stat, date, or count-up that supplies the context the original post omitted, dramatizing the gap.

### REACTION

**kinetic-type-beats** — the take, stated plainly

- _Pattern:_ the creator's opinion delivered as 1–2 short, confident lines — no hedging, no "I just think that maybe."

**grid-card-assemble** — the reasons, enumerated

- _Pattern:_ a short list of "here's why" points populating one after another — used when the take needs backing, not just an assertion.

### EVIDENCE / PATTERN

**grid-card-assemble** — more examples, same shape

- _Pattern:_ additional examples of the same pattern populate a list/grid — "and it's not just this post" for a listicle/pattern beat.

**constellation-hub** — many examples, one throughline

- _Pattern:_ several related posts/moments orbit a center label naming the pattern they share.

### VERDICT / CLOSE

**titlecard-reveal** — the one-line verdict

- _Pattern:_ one clean closing line stating the takeaway, held still — the "so what" of the whole video.

**kinetic-type-beats** — punchy sign-off

- _Pattern:_ a short closing beat (agree/disagree prompt, "what do you think", a call to look something up) that snaps in and holds on a final frame.

---

## VO_MODE handling

**No pasted script** — write the VO yourself, in the matching blueprint's script shape:

- 1–2 sentences per spoken beat, usually 6–20 words.
- Concrete, in the creator's own voice; say what YOU think, not a neutral news-anchor summary (unless `frame.md`'s register is explicitly measured/explainer).
- Avoid: narrating the screenshot literally ("as you can see, this post says..."), hedged non-opinions, a whole beat that's just describing the UI chrome.
- Silent beats are allowed when the visual (the screenshot itself) proves the point — leave them out of `SCRIPT.md`.

**`VO_MODE = restructure`** — treat `user_script.txt` as source material. Rewrite, reorder, merge, or omit to fit the arc and target length. You may still shape each segment toward its beat's blueprint pattern.

**`VO_MODE = verbatim`** — do NOT change the user's words. Segment the script into beat-sized chunks at sentence/paragraph boundaries. Final duration follows the provided script.

**Quoting the source post itself is a separate concern from VO_MODE** — regardless of VO_MODE, any beat that reads the post's own words aloud must reproduce them exactly as pasted in `visible-text.txt` (see Guardrails). The creator's own reaction voice can restructure freely; the post's words cannot.

## Asset candidates

`asset_candidates` is the Step-3 → Step-4 handoff. Rules:

1. Read only `capture/extracted/asset-descriptions.md` to know what exists.
2. Use only filenames listed there; write as `assets/<basename>`.
3. One line, candidates separated by semicolons, a short description after `—`.
4. Prefer `[video]` assets when the clip itself is the point (e.g. a video post, not a static screenshot).
5. The recap/context beats almost always need the actual post screenshot as their `focal` asset — don't substitute an invented recreation for a real screenshot the user supplied.
6. Pure-typography beats (the hook, the verdict) may use an empty asset list. Do not use nested lists.

Example:

```md
- asset_candidates: assets/original-post.png — screenshot of the source post; assets/reply-thread.png — the follow-up reply that changed the story
```

## transition_in

Between-frame transition — how each frame ENTERS from the one before it. The harness's injector stamps it onto the two whole-frame clips (opacity / transform / filter on the frame wrappers). Name a **registry type** directly; optionally add a direction and/or a duration (`push-slide LEFT`, `crossfade 0.4s`). `cut` / `none` / empty = a hard cut.

The five registry types:

- **`crossfade`** — a plain opacity dissolve; the neutral choice when two frames sit in the same visual world.
- **`blur-crossfade`** — dissolve through a soft blur + slight scale; use when the two frames' backgrounds differ a lot, so the blur masks the color clash a plain crossfade would expose.
- **`push-slide`** `[LEFT|RIGHT|UP|DOWN]` — outgoing slides off, incoming pushes in from the opposite edge; a lateral "next beat" feel for a run of consecutive recap/timeline cards.
- **`zoom-through`** — outgoing scales up + blurs out, incoming scales up from small into focus; for a STATE CHANGE / turning to a new section (recap → reaction).
- **`squeeze`** — outgoing compresses to a line on one edge as incoming expands from the other; a snappy, mechanical beat change — reads well for a fast native-social cut.

Pick a small set and repeat them: default to `crossfade` (or `blur-crossfade` when the backgrounds clash), and reach for `zoom-through` at section boundaries (recap → reaction, reaction → close). Frame 1's `transition_in` is a placeholder.

## Frame template

Use the exact fields required by the core storyboard format. The narrative shape each frame satisfies:

```md
## Frame N — Short name

- scene: one clear visual idea
- voiceover: "spoken line, written in the candidate blueprint's script shape, or empty"
- duration: rough estimate in seconds
- transition_in: crossfade
- status: outline
- src: compositions/frames/NN-short-name.html
- type: recap
- angle: fact-check
- beat: skepticism
- blueprint: titlecard-reveal — candidate shape from the role→blueprint menu; omit when none fits
- asset_candidates: assets/original-post.png — short asset description

narrativeRole: what this beat does in the viewer's understanding of the story.
keyMessage: the one idea the viewer should remember.
```

- `angle` — the reaction-structure move this beat serves (Hot take, Fact-check, Context reveal, Timeline beat, Pattern example, Verdict). Never "show recap." Invent one if none fits and explain it in the prose.
- `beat` — a specific emotion (skepticism, outrage, amusement, secondhand-embarrassment, vindication, curiosity → clarity, disbelief → confirmation, empathy, schadenfreude-adjacent-but-not-cruel, relief). Compound allowed (e.g. `disbelief + amusement`).

## Final checklist

- The arc is named; the sequence is take-driven, not a literal screenshot-by-screenshot retelling.
- The opening uses one clear hook that survives a scroll — under ~3s to the first real beat.
- Each beat has one job; every beat has `type`, `angle`, `beat`.
- Each beat's `voiceover` is written in its candidate blueprint's script shape, with the candidate `blueprint:` tagged wherever a shape fits — and omitted where none does.
- Each `voiceover` is phrase-segmented into cues (each cue a piece Step 5 can reveal on) — not one long run-on clause.
- Shapes vary across the video; no single blueprint on every beat.
- Story truth was never bent to fit a blueprint — no beat invented/dropped/reordered for a shape, and nothing presented as fact that isn't in `visible-text.txt`.
- Every recap/context beat has suitable `asset_candidates` (filenames only from `asset-descriptions.md`), with the real post screenshot as `focal` where the point depends on seeing it.
- The Guardrails section was actually applied: no fabricated quotes, no exposed private-individual info beyond what the user supplied, and any harassment-shaped framing was flagged back to the user rather than built by default.
- `transition_in` is a registry type (`crossfade` / `blur-crossfade` / `push-slide` / `zoom-through` / `squeeze`) — default `crossfade` (`blur-crossfade` on a background clash), `zoom-through` at section boundaries, repeated across the video.
- `SCRIPT.md` contains only locked spoken narration; silent beats are intentional and omitted.
