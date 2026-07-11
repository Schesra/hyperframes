# Audio layer — BGM + SFX over a real narration

The narration is recorded and untouchable; this layer adds the **bed** (BGM) and the **hits** (SFX). Everything routes through `/media-use`'s engine — never hand-download audio. Guiding rule (from the channel's SFX spec): **a sound must answer the right motion, the right material, and the right importance.** Not every animation gets a sound; decoration is silent.

## The curated SFX palette (media-use bundled set)

The library was deliberately pruned of trailer-y hits — **`impact-bass-1/2`, `riser`, `sparkle`, `whoosh-cinematic` were removed on purpose. Do not reintroduce them** (they read as a movie trailer and kill the B2B/editorial feel). What's available, by material:

- **Paper / material (foley):** `paper tear`, `page flip`, `soft whoosh`, `short whoosh`, `whoosh`, `whoosh-short`, `fast swipe`
- **Digital / UI:** `digital sweep`, `UI click`, `UI mouse click`, `click`, `click-soft`, `key-press`, `success click`, `ping`, `notification ping`, `notification`, `pop`, `soft pop`, `typing`, `error blip`, `error`, `glitch-1/2/3`
- **Accent (use sparingly):** `chime`

**Out of the palette — do NOT design moments that need them** (no matching foley; the user dropped them): Rubber Stamp, Sticker Peel, Marker Stroke. If a beat wants a verdict/highlight, use the substitutes in the table (`soft pop` / `success click`) and keep the device visual-only, or pick a metaphor that has a sound.

## Two SFX roles

1. **Component SFX** — a sound on a *component's own animation* (a card slides, a node activates, a headline lands). Only on the beat's **PRIMARY** component (see `component-animation.md`); secondary/decorative elements stay silent.
2. **Transition SFX** — a sound on a *scene-to-scene cut* (see `transition-map.md`). One per cut, matched to the cut's material and intensity.

## Mapping — animation / transition → sound → sync point

| Motion (component or transition) | Sound (from palette) | Sync point | Intensity |
|---|---|---|---|
| Paper / card / doc slides in | `soft whoosh` (normal), `short whoosh`/`fast swipe` (fast) | animation_start | low-med |
| Page turn / doc→doc | `page flip` | animation_start | med |
| Paper tear reveal (transition) | `paper tear` | at the tear frame | med |
| UI panel / dashboard reveal · tech transition | `digital sweep` | animation_start | med |
| Node activates / signal reaches a point | `ping` / `success click` | node_active_frame | low |
| Workflow step complete | `success click` | animation_end | low |
| Small badge / chip / dot pops | `soft pop` / `pop` | animation_end | low |
| UI select / toggle / permission click | `UI click` / `click-soft` | contact/toggle frame | low |
| Typed text (chat, code) | `typing` (trim to the typed span) | over the type | low |
| Headline / insight / big card lands | `soft pop` or `soft whoosh` (soft — no boom) | animation_end | low-med |
| Failure / wrong answer / warning | `error blip` (soft) / `error` | on the beat | med |
| Glitch/harsh Act-1 cut | `glitch-1/2/3` | at the cut | med |
| Notification / incoming question | `notification ping` | on arrival | low |
| Verdict emphasis *(no stamp sound)* | `soft pop` + `success click` | animation_end | med |
| THE SWITCH / reveal *(no riser)* | `digital sweep` (rising) → `soft pop`, + let the BGM swell | transition_end | high |
| Section close / final beat | `chime` (once) | on the close | low |

## Sync points (get timing exact)

- **animation_start** — fire as the motion begins (slides, sweeps).
- **animation_end / contact_frame** — fire when the element lands/stops (impacts, toggles, headline settle). A sound that lands *before* the visual contact reads as a mistake.
- **follow_animation_duration** — the sound's length tracks the motion's length (a long slide → a longer whoosh); trim, don't let it ring after the motion stops.
- **node_active_frame / transition_end** — for workflow pulses and the reveal payoff.

## Intensity budget & discipline

- **High-intensity cues ≤ 10-15% of all animations.** With `riser`/`impact-bass` gone, "high" now means the reveal build (`digital sweep` + `soft pop` + BGM swell) — reserve it for the hook and THE SWITCH.
- **One component SFX per beat, on the PRIMARY element only.** Secondary elements and pure decoration are silent — stacking sounds makes it noisy and less premium.
- **Match material:** paper visuals → paper foley; UI visuals → digital; never a `digital sweep` on a paper card or a paper rustle on a UI panel.
- **2-4 SFX per beat max**, Act 1 denser, Act 2 restrained (the calm reads as control).

## BGM — user-supplied, never generated

**The user adds their own background music** (standing preference, 2026-07-11) — do NOT retrieve or generate BGM. The build's job is to leave room for it:

- If the user drops a track at `assets/audio/bgm.mp3` before render, `scripts/build_index.py` mounts it automatically (track 5, volume 0.16, ducked under the voice).
- Otherwise ship **voice + SFX only**, and say so at delivery ("mix leaves BGM headroom for your music").
- Keep the SFX mix conservative so their music has space: component SFX small, no wall-to-wall cues.

**Mix priority (loudest intent first):** `1. Voice-over → 2. BGM → 3. transition SFX → 4. component SFX → 5. ambient`. Voice is always the top layer.
- BGM `data-volume` ≈ 0.14-0.20, clearly under the voice.
- Transition SFX 0.4-0.6; component SFX 0.3-0.5 (small and tasteful); `error`/emphasis a touch louder.
- **Ducking:** on the reveal build or any emphasis hit, dip the BGM briefly, don't dip the voice, restore right after.

## Mounting

BGM = one `<audio>` track (track 5) ducked under the voice; each SFX = its own offset `<audio>` on tracks 6-9, `data-start` = its sync-point time. Narration stays track 4, volume 1. Preview the loudest overlap (usually the SWITCH) before rendering.
