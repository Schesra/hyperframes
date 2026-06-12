# Background music

Music is searched from HeyGen's catalog via the `hyperframes music` CLI — same wire shape as SFX, different content type (`type: "music"` on the search endpoint). Downloads land in `assets/music/` and embed as a single `<audio>` element on a dedicated track lane.

Music is **optional**. Most product demos do not need it. The decision to add music is creative, not mechanical.

## When music helps vs hurts

| Helps                                                                 | Hurts                                                            |
| --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Brand reels (atmosphere is the product)                               | Fast demos / tutorial walk-throughs (music distracts from VO)    |
| Cinematic teasers, launch trailers (mood-first)                       | Comparison / "vs competitor" videos (music blunts the contrast)  |
| Long-hold beats with low VO density                                   | Rapid-fire feature montages (music + SFX + VO = noise floor war) |
| Pure-visual sections (no narration)                                   | Anywhere captions are doing the work (music = mixing competition) |
| Loop-style social ads where the audio bed defines the brand           | Tight 5–15s social ads where every frame is information-dense    |

**Default to no music.** Add it only when you can name what mood it carries. _"It needs something under the silence"_ is not a reason. _"The reveal needs to feel ceremonial"_ is.

## Volume hierarchy

HyperFrames has **no automatic ducking** — you set static volumes per audio element. Layer levels so nothing fights the voice:

| Layer                                | data-volume                  |
| ------------------------------------ | ---------------------------- |
| Narration / VO                       | 1.0 (always)                 |
| Background music under VO            | 0.4 – 0.6                    |
| Sound effects (hits)                 | natural (omit `data-volume`) |
| Ambient bed (felt, not heard)        | 0.08 – 0.2                   |
| Pure music (no VO)                   | 0.7 – 0.9                    |

**Pure-music videos** (brand reels with no spoken narration) need music at near-full volume (0.7–0.9) or it disappears into the encoder noise floor. The `0.4–0.6` rule is for **music UNDER VO** only.

**SFX volume is natural by default — don't pre-duck them.** The canonical model lives in [`../../hyperframes/references/sound-effects.md`](../../hyperframes/references/sound-effects.md) ("Volume — default is natural, no auto-duck"). Catalog clips are loudness-normalized at the file level; omitting `data-volume` lets each SFX ring at the level the catalog committed to, even when stacking with VO or other SFX. The one exception in this table is the ambient bed (~0.1 explicit) — a "felt, not heard" texture is the rare case where a per-clip override is intentional.

## Manual ducking (when music + VO overlap)

When VO comes in over an already-playing music bed, the music keeps its `data-volume` for the whole VO span — the engine doesn't auto-duck. Two ways to handle this:

1. **Hold the bed low for the whole video** — pick `0.4–0.5` from the start; the VO sits cleanly above. Simplest. Loses some intro/outro impact.
2. **Two music slices with different volumes** — embed the same music file twice:
   - Slice A: `data-start="0"`, `data-duration="<intro_len>"`, `data-volume="0.75"` (the moody opener)
   - Slice B: `data-start="<intro_len>"`, `data-media-start="<intro_len>"`, `data-volume="0.45"` (under the VO)
   - Optional Slice C at the end with `data-volume="0.75"` again for the outro

Pattern 2 reads as ducking even though it's two static-volume clips back-to-back.

## The motif rule (one bed per scene)

**One music track per video, not one per scene.** Stacking two music beds at the same time muddies both — they fight for the same midrange. If the storyboard wants a "tense → triumphant" arc, that's one track with measured peaks, not two tracks crossfaded.

If the storyboard genuinely needs distinct music for distinct sections (a "before/after" video where the music itself is the transformation marker), the sections must be **back-to-back**, not overlapping. One bed at a time.

## Search prompts that work

The catalog is searched by meaning, not filename. Pick **mood + feel + (optional) instrument**. Verbs that land:

- `"moody ambient pad slow build"` — atmospheric, brand-reel
- `"upbeat lo-fi reel bed"` — social ad, sample-pack feel
- `"tense synth drone rising"` — teaser / suspense reveal
- `"warm acoustic guitar cozy"` — wellness / lifestyle brand
- `"epic cinematic orchestral swell"` — launch trailer, hero moment
- `"minimal piano introspective"` — premium / quiet luxury
- `"glitchy electronic future-tech"` — developer-tool / SaaS brand
- `"funk groove driving"` — high-energy social

What doesn't work: filename-style searches like `"music_03"` or `"BGM_01"` — there are no filenames in the catalog, only semantic descriptions. Search by **what the music does**, not what you'd call the file.

## Trim and embed

`music add <id>` writes the track to `assets/music/<id>.<ext>` and prints the same analysis as `sfx add` (LUFS, true peak, peak time, onset/tail, loudness sparkline). For a music bed:

- **Trim only if the catalog clip has dead air at the head** (slow attacks). Most music does not — beds usually start audible at t=0.
- **`data-duration`** — set to cover the full scene span. If the clip is shorter than the scene, the engine handles end-of-clip silence (it does NOT loop automatically — pick a clip ≥ scene duration, or embed the same id twice back-to-back).
- **`data-track-index`** — use a music-dedicated lane (e.g. `11` per the assembler's BGM lane convention). Does not affect mixing but keeps the timeline readable.

```html
<audio
  id="music-bed"
  src="assets/music/<id>.mp3"
  data-start="0"
  data-duration="25"
  data-track-index="11"
  data-volume="0.45"
></audio>
```

## How storyboard signals music

If a video should have music, the storyboard's Global Direction names it explicitly:

```markdown
**Music direction:** Moody ambient pad with a slow build. Already playing when the video starts. Sits at ~0.45 under VO; lifts to ~0.75 in the 2s pre-CTA stretch where there's no narration.
```

Without that line, no music is fetched in Step 3 and no BGM lane is added in Step 5. Silent absence is a deliberate choice, not a forgotten feature.

## Access

Music comes from the same free HeyGen catalog as SFX — needs a HeyGen API key (`HEYGEN_API_KEY` or `hyperframes auth login`). If the key isn't set when Step 3 runs `hyperframes music`, ask the user for one — never silently drop the music bed the storyboard called for.

See [`../../hyperframes/references/sound-effects.md`](../../hyperframes/references/sound-effects.md) for the audio contract (`data-start`/`data-duration`/`data-volume`/`data-media-start`) and the reading-the-analysis recipe — music and SFX share the same wire.
