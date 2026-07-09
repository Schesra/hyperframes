---
name: facebook-post-to-video
description: "turn a hot / trending social post (a Facebook post pasted or described by the user — text, caption, screenshot, or link) into reaction / commentary content: a hot-take, fact-check, recap-and-opinion, meme-remix listicle, or drama-recap video, short (15-60s, native/vertical) or longer (30-90s+), decided per post. The user supplies real source material (a screenshot of the post, photos, logos, video clips, memes); nothing about the post is scraped or invented. Use this skill when the user pastes in a specific real post they want to react to or explain. Do not use it for a generic topic with no specific real post as source (use /faceless-explainer), a product/brand promo (use /product-launch-video), a short unnarrated motion graphic with no post content (use /motion-graphics), or captions/overlays on existing talking-head footage (use /embedded-captions or /talking-head-recut). If the intent is unclear, route through /hyperframes first. This is the shot-sequence architecture: every frame is authored as a time-coded shot sequence picked from a menu of golden blueprints, so frames develop over their full duration instead of freezing after entrance."
---

> **media-use**: Before sourcing audio/images, call `/media-use` to resolve BGM/SFX/images from the HeyGen catalog, and to ingest any user-supplied file or URL (`resolve.mjs --from <path-or-url>`). Run `--adopt` first to register existing assets. See `/media-use` skill.

# Facebook Post to HyperFrames

Use this skill to turn a specific hot/trending social post into reaction or commentary content: lock the angle, plan a reaction story, and build it frame by frame in HyperFrames. **This is real content about a real post** — the source post's own words are never rewritten as fact, and every real asset (screenshot, photo, logo, clip, meme) comes from the user, never invented.

> **Confirm the route before Step 0.** You are the orchestrator. Run each step, verify its gate, and only then continue. This skill is for **a specific real post the user pastes or describes, being reacted to / explained / fact-checked / recapped**. Route other intents elsewhere: a general topic with no specific real post → `/faceless-explainer`; a product/brand being marketed → `/product-launch-video`; a short unnarrated motion graphic with no post content → `/motion-graphics`; captions or graphic overlays on existing talking-head footage → `/embedded-captions` / `/talking-head-recut`. If the user says only "make a video" or the route is uncertain, read `/hyperframes` first.

You are the orchestrator. Work in `videos/<project>/`. Run steps in order and pass each gate before continuing. User-gated steps are Step 0, Step 1, Step 3, and Step 6. Do every step yourself except Step 5, where you dispatch one sub-agent per frame. Do not put design or motion rules here; those live in the frame-worker sub-agent, this skill's local `../hyperframes-animation/rules/` + `../hyperframes-animation/blueprints/`, and `hyperframes-creative`.

Workflow: Step 0 setup → `hyperframes.json`; Step 1 post intake → `capture/`; Step 2 design system → `frame.md`; Step 3 storyboard/script → `STORYBOARD.md` and `SCRIPT.md`; Step 3.1 audio → `audio_meta.json`; Step 4 visual design → enriched `STORYBOARD.md`; Step 5 frames → `compositions/frames/NN-*.html` and `index.html`; Step 6 final render → `renders/video.mp4`.

**Facebook (and any social platform) is never scraped.** Auth-gated content and platform ToS make automated capture a non-starter here — the source is always the user's own pasted text/paraphrase plus files they hand you directly, exactly like a no-capture brief.

---

## Step 0: Setup and Brief

Goal: Lock the core video brief and create the HyperFrames project if needed.

Initialize only if `hyperframes.json` is missing. Name `<project>` from the post's topic in kebab-case, such as `coffee-review-drama`; never use workspace name or timestamp.

`npx hyperframes init "videos/<project>" --non-interactive --example=blank` — `init` checks the installed skills against the latest on GitHub and updates the global set if any are out of date.

**Show sign-in status before the brief** — run `npx hyperframes auth status` and **relay its output verbatim (don't paraphrase or rewrite it).** It reports whether voice/BGM will use HeyGen or local engines and, when not signed in, how to sign in. **If not signed in, STOP and wait for the user to choose — sign in, or say "go"/"offline" to continue with local engines — before asking the brief or anything else.** Treat it as a real decision point, not a passing note; don't fold the choice into the brief question, and don't write keys into a per-repo `.env`. (In autonomous mode, note the status and continue offline.) See `../media-use` → Preflight for the canonical guidance.

**Gate:** `hyperframes.json` exists, and length, aspect ratio, and language are locked; sign-in status was shown (signed in, or continuing offline).

---

## Step 1: Post Intake

Goal: Collect the source post, lock the angle, and inventory the real assets the user supplies. There is **no automated capture** — this is always a manual brief, like a faceless explainer's no-capture path, but asset-driven like a product launch's real capture inventory.

**Read the Guardrails section of `references/story-design.md` before this step** — it governs what you may and may not do with a real person's real post.

1. **Get the post.** Ask the user to paste the post's text/caption verbatim (or describe it faithfully if they can't paste it), who posted it (public figure / brand / institution / anonymous — never ask the user to identify a private individual beyond what they volunteer), and their own read on why it's trending.
2. **Lock the angle.** Ask which reaction structure fits: hot-take/reaction, fact-check/context, recap+opinion, meme-remix/listicle, or drama-recap (see `references/story-design.md` for the full catalog). If the user hasn't decided, recommend one from the post's shape and confirm in one line.
3. **Lock the format, per this post.** Ask short-form (9:16, 15-60s, native/viral pacing) or a longer reaction/explainer piece (16:9 or 9:16, 30-90s+) — this is decided fresh each time, not fixed by the skill.
4. **Request real assets.** Tell the user exactly what's useful: a screenshot of the post itself (always wanted), any photos/images the post references, logos of brands/people involved, video clips, and memes to reference or remix. For each file or URL they hand you, ingest it via `/media-use`'s `resolve.mjs --from <path-or-url>` so it's frozen and registered, then note it in the inventory below. A screenshot of the actual post is the one asset this workflow almost always needs — ask for it explicitly if not already offered.

Save the brief by hand:

- `capture/extracted/visible-text.txt` — the post's text/caption verbatim, who posted it, why it's trending, and the locked angle. This is the source of **truth about the post**, not a story template (Step 3 reshapes the telling, never the facts).
- `capture/extracted/tokens.json` — `{ "title": "", "description": "", "colors": [], "fonts": [] }`. Fill `title`/`description` from the post/angle. Leave `colors`/`fonts` empty unless the user gave brand colors (e.g. reacting to a specific brand's post) — then add them.
- `capture/extracted/asset-descriptions.md` — the real asset inventory: each ingested file's frozen path + a short description (`assets/original-post.png — screenshot of the source post`). This is the **canonical** asset list Step 3 draws from.

If the user pasted a script or wants their own wording kept for the reaction voice, save it verbatim as `user_script.txt`, ask once "use it verbatim or restructure?", and store the answer as `VO_MODE` for Step 3 — this only governs the creator's own reaction lines, never the post's own quoted words (see Guardrails).

**Gate:** `capture/extracted/visible-text.txt`, `tokens.json`, and `asset-descriptions.md` exist; you can state the post, the angle, and the format in one clear sentence; any guardrail concern (see `story-design.md`) was surfaced to the user and resolved, not silently bypassed.

---

## Step 2: Design System

Goal: Choose one shipped frame preset; a script turns it into this video's `frame.md` + caption skin.

You make the one judgment call — **which preset**. Read `../hyperframes-creative/references/design-spec.md` and browse `../hyperframes-creative/frame-presets/`; pick the preset whose energy matches the locked angle and format (a punchier/bolder preset for a fast native hot-take, a calmer/editorial preset for a measured fact-check). Then run:

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes .
```

The script does the rest deterministically: copies the preset's `FRAME.md` → `frame.md` and **remixes** it onto any brand tokens in `capture/extracted/tokens.json` (mapped onto the preset's color keys by role, keeping keys/structure/components; the preset's display + body fonts swapped for the brand's), copies the preset's caption skin to `.hyperframes/caption-skin.html`, and self-validates (exits 1 on a broken mapping). Proceed as soon as it exits 0 — no hand-editing of the spec.

Most posts have **no brand colors/fonts** (`tokens.json` colors/fonts empty) → the script keeps the preset's own palette, a complete shippable design. Only when the post involves a specific brand whose colors the user named, add them to `tokens.json` before running.

**Gate:** `build-frame.mjs` exited 0 — `frame.md` exists from a named preset, and (when the preset ships one) `.hyperframes/caption-skin.html` exists as the caption skin source.

---

## Step 3: Storyboard and Script

Goal: Turn the post and the locked angle into an approved frame-by-frame reaction plan.

Read `references/story-design.md`, `../hyperframes-animation/blueprints-index.md`, `../hyperframes-core/references/storyboard-format.md`, and `../hyperframes-core/references/script-format.md`. Use them to write `STORYBOARD.md` and, when narration is needed, `SCRIPT.md`.

Use `story-design.md` for the reaction structure (hot-take / fact-check / recap+opinion / meme-remix-listicle / drama-recap), hook strategy, the guardrails, `VO_MODE`, and asset choices. As a **soft guide**, consult the role→blueprint menu in `../hyperframes-animation/blueprints-index.md`: for each beat, write the voiceover in the shape its candidate blueprint implies and tag that candidate `blueprint:` id when one fits. The post's own truth still decides which beats exist — never force a beat to fit a blueprint, and never invent a beat (or a fact) just because a proven shape is available. Choose each visual frame's `asset_candidates` from `capture/extracted/asset-descriptions.md` (the canonical inventory) — don't browse raw `capture/assets/`. Do not ask the user to pick assets unless that inventory is missing or unusable. Use the exact required fields from the storyboard and script references.

After drafting, show a frame-by-frame summary. In that same message ask the user two things: (a) to approve or request changes, and (b) whether they want a live preview of the storyboard scaffold (`npx hyperframes preview`) — open it only on a yes. Iterate until approved, and carry the preview choice to Step 6.

**Gate:** `STORYBOARD.md` exists, every visual frame has `asset_candidates`, `SCRIPT.md` exists when narration is needed, and the user approved the frame-by-frame plan.

---

## Step 3.1: Audio

Goal: Generate narration, word timings, music, and audio metadata from the approved script.

Start audio after Step 3 approval. Run it in the background, then continue to Step 4. (Sign-in status was already shown in Step 0; the engine falls back automatically.)

`node <SKILL_DIR>/scripts/audio.mjs --script ./SCRIPT.md --storyboard ./STORYBOARD.md --hyperframes . --out ./audio_meta.json &`

The audio script handles narration, word timings, BGM lookup from HeyGen's music library, and timing metadata. BGM mood comes from the storyboard's `music:` field. This uses the HeyGen Audio API for retrieval, not generation, and the same `~/.heygen` credential as TTS. For provider details, read `../media-use/audio/references/tts.md`.

If there is no narration and no `SCRIPT.md`, skip voice generation. BGM may still run if the storyboard has a music mood.

**Gate:** audio job has started, or the project is marked silent.

---

## Step 4: Frame Visual Design

Goal: Add the visual direction, layout intent, and motion choices to each storyboard frame.

Edit `STORYBOARD.md` in place. Do not create another storyboard. Use `frame.md` as source of truth for color, type, layout feel, and style.

Read `references/visual-design.md`, `../hyperframes-animation/blueprints-index.md`, `references/motion-language.md`, and `../hyperframes-animation/rules-index.md`. Use `visual-design.md` for the method (the time-coded shot sequence, the inline Layout vocabulary, the native-social pacing note, and the required `## Video direction` block). Use `../hyperframes-animation/blueprints-index.md` to pick each frame's shot shape. Use `motion-language.md` (the motion vocabulary + the motion doctrine) and `../hyperframes-animation/rules-index.md` (valid rule names) for motion — do not invent motion names.

For every visual frame, write a **time-coded shot sequence** into `STORYBOARD.md` per `visual-design.md`'s method: pick the frame's blueprint (or compose), instantiate it with THIS post's content, and pace each Scene's reveal to the voiceover so the frame develops across its full duration instead of front-loading then freezing. State layout and motion **inline** per Scene (vocabularies in `visual-design.md` and `motion-language.md`). Add one video-wide `## Video direction` block.

Do not change story, script, asset choices, `asset_candidates`, `transition_in`, or the source post's words. Do not write HTML in this step.

Stage named assets after visual design is locked:

`node <SKILL_DIR>/scripts/stage-assets.mjs --storyboard ./STORYBOARD.md --hyperframes .`

**Gate:** every visual frame has a time-coded shot sequence whose reveals are paced to the voiceover (no front-loading); `## Video direction` exists; `assets/` contains the named assets.

---

## Step 5: Build Frames

Goal: Build every storyboard frame as an HTML composition and assemble the playable video.

Wait for Step 3.1 audio to finish if audio was started. Then sync durations and fetch SFX; skip both if silent.

`node <SKILL_DIR>/scripts/audio.mjs sync-durations --audio-meta ./audio_meta.json --storyboard ./STORYBOARD.md`

`node <SKILL_DIR>/scripts/audio.mjs fetch-sfx --storyboard ./STORYBOARD.md --hyperframes .`

Duration sync is mechanical: real voice duration wins; silent frames keep estimates; never hand-edit synced durations.

Before dispatch, read `sub-agents/frame-worker.md` and `../hyperframes-core/references/subagent-dispatch.md`. Dispatch one sub-agent per frame, in parallel if possible; otherwise run workers in waves. Each worker gets exactly one frame.

Each worker context must include `PROJECT_DIR`, `frame_id`, canvas size, caption status and keep-out band if captions are enabled, and `RULES_DIR` as the absolute path to this skill's `../hyperframes-animation/rules/`. Each worker reads `frame.md`, its own `## Frame N` block from `STORYBOARD.md`, the local rule recipe (`../hyperframes-animation/rules/<id>.md`) for each cited motion, and the frame's blueprint template (`../hyperframes-animation/blueprints/<id>.md`). Each worker writes only `compositions/frames/NN-*.html`. Workers must never edit `STORYBOARD.md`.

**Full-bleed backgrounds ride on a `class="clip"` layer, never the `#root`.** A frame's ground (color field / gradient / grid) is its own full-duration background clip — a `background` set on the `#root` / `data-composition-id` element is clip-gated to the frame's window and is not a dependable ground, so dark content can land on the black host `body` and render invisible. The video's base ground is painted by the assembler from `frame.md`'s `canvas` color onto the index `#root`. (Full rule + self-check: `sub-agents/frame-worker.md`.)

As each worker returns, the orchestrator marks that frame as `animated` in `STORYBOARD.md`.

After audio timings exist, build captions in the background and assemble the index:

`node <SKILL_DIR>/scripts/captions.mjs build --storyboard ./STORYBOARD.md --audio-meta ./audio_meta.json --hyperframes . --out ./caption_groups.json &`

`node <SKILL_DIR>/scripts/assemble-index.mjs --storyboard ./STORYBOARD.md --hyperframes .`

`captions.mjs` uses the project's `.hyperframes/caption-skin.html` (copied in Step 2) as the caption look, injecting brand tokens from `frame.md`; with no skin present it renders the built-in default pill. `captions: skipped (<reason>)` is valid. Continue without captions when explicitly skipped.

**Gate:** every frame is marked `animated`, `index.html` exists, and captions are built or explicitly skipped.

---

## Step 6: Finalize

Goal: Verify the assembled video, get user approval, and render the final MP4.

Inject transitions, run checks, pause for review, then render.

`node <SKILL_DIR>/scripts/transitions.mjs inject --storyboard ./STORYBOARD.md --hyperframes .`

`node <SKILL_DIR>/scripts/transitions.mjs verify --storyboard ./STORYBOARD.md --index ./index.html`

`npx hyperframes lint`

`npx hyperframes validate`

`npx hyperframes inspect`

`npx hyperframes snapshot --at <frame-midpoints>`

`snapshot` stitches the captured frames into one contact sheet (`snapshots/contact-sheet.jpg`). Glance at it; if nothing is obviously broken, move on — don't linger here. This is also a good moment to re-check the Guardrails: does anything in the assembled video misrepresent the post, expose a private individual beyond what the user supplied, or read as pile-on rather than commentary? Flag it now if so.

If a command fails, surface stderr and stop — don't pile on recovery commands. Fix it yourself: the cheapest safe edit to `compositions/frames/NN-*.html`, then rerun the failed check.

**Known false-positive — do not chase it.** `inspect` may report a handful of `text_box_overflow` errors of ~1–4px on the **caption** highlight words (selector `#caption-word-*` / `.caption-line`). The caption pill uses a deliberately snug `line-height` (set once in `scripts/captions.mjs`) and has **no `overflow:hidden`**, so a heavy display glyph's ink spills a few px into the pill's own padding — nothing is actually clipped. Treat these as expected and proceed. Do **not** inflate the caption `line-height` (it balloons the pill, which is worse). Only act on a `text_box_overflow` when it names a **frame** element (`#el-NN-*`), not a caption word.

After checks pass, pause for user review. The video is assembled, viewable, and editable in Studio. Manage preview only once across Step 3 and Step 6: open it if the user asked earlier, offer it if they declined earlier, and do not ask again if they are already reviewing in Studio.

Preview: `npx hyperframes preview`

Render only after user approval:

`npx hyperframes render --skill=facebook-post-to-video --quality high --output renders/video.mp4`

Do not rerun `lint`, `validate`, `inspect`, or `snapshot` after rendering unless the user asks.

**Gate:** `lint`, `validate`, and `inspect` passed before render; user approved at the review pause; `renders/video.mp4` exists. Final reply states MP4 path and final duration.

---

## Quick Reference

**Formats:** portrait `1080x1920` (native/viral default for short-form); landscape `1920x1080`; square `1080x1080`. Set the format once in the storyboard frontmatter, per the Step 1 decision.

**Deltas vs a captured-website workflow:** no Step 1 web capture (Facebook is never scraped — always a manual, user-supplied brief); the real asset inventory (`asset-descriptions.md`) is built by hand from user-supplied files ingested via `/media-use`'s `resolve.mjs --from`, not from `npx hyperframes capture`; a dedicated Guardrails section governs quoting the post and handling real people's content, checked at Step 1 and again at Step 6.

**Background scripts:** the workflow ships only these under `scripts/`: `build-frame` for adopting + brand-remixing a frame preset into `frame.md` (+ caption skin); `audio` for TTS, transcription, BGM, SFX, and duration syncing; `captions`; `transitions` for inject and verify; `stage-assets` for copying frame-named assets into `assets/`; and `assemble-index`. Everything else is the `hyperframes` CLI.

The reusable, domain-agnostic shot shapes live in `../hyperframes-animation/blueprints/` (indexed by `../hyperframes-animation/blueprints-index.md`).

| Read                                                                                                                                                        | When                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `[../hyperframes-creative/frame-presets/](../hyperframes-creative/frame-presets/)`                                                                          | Step 2: choose and adopt a frame preset.                       |
| `[../hyperframes-creative/references/design-spec.md](../hyperframes-creative/references/design-spec.md)`                                                    | Step 2: apply brand tokens correctly.                          |
| `[references/story-design.md](references/story-design.md)`                                                                                                  | Step 1/3: guardrails, reaction structures, plan the story.     |
| `[../hyperframes-animation/blueprints-index.md](../hyperframes-animation/blueprints-index.md)`                                                              | Step 3: role→blueprint menu. Step 4: pick the shot shape.      |
| `[../hyperframes-core/references/storyboard-format.md](../hyperframes-core/references/storyboard-format.md)`                                                | Step 3: write `STORYBOARD.md`.                                 |
| `[../hyperframes-core/references/script-format.md](../hyperframes-core/references/script-format.md)`                                                        | Step 3: write `SCRIPT.md`.                                     |
| `[../media-use/audio/references/tts.md](../media-use/audio/references/tts.md)`                                                                              | Step 3.1: choose or understand TTS providers and voices.       |
| `[references/visual-design.md](references/visual-design.md)`                                                                                                | Step 4: write the frame's shot sequence (+ Layout vocabulary + native-social pacing). |
| `[references/motion-language.md](references/motion-language.md)`                                                                                            | Step 4: the motion vocabulary + the motion doctrine.           |
| `[references/cut-catalog.md](references/cut-catalog.md)`                                                                                                    | Step 4-5: the cut catalog (worker builds within-frame seams).  |
| `[../hyperframes-animation/rules-index.md](../hyperframes-animation/rules-index.md)` + `[../hyperframes-animation/rules/](../hyperframes-animation/rules/)` | Step 5: local rule recipe bodies for the cited motions.        |
| `[sub-agents/frame-worker.md](sub-agents/frame-worker.md)`                                                                                                  | Step 5: dispatch per-frame workers.                            |
| `[../hyperframes-core/references/subagent-dispatch.md](../hyperframes-core/references/subagent-dispatch.md)`                                                | Step 5: dispatch sub-agents safely.                            |
