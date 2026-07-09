# Audio layer — BGM + SFX over a real narration

The narration is recorded and untouchable; this layer adds the bed (BGM) and the hits (SFX). Everything is sourced through `/media-use`'s shared engine — never hand-download audio.

## Engine call (no TTS — lines stay empty)

```jsonc
// audio_request.json
{
  "lines": [],
  "bgm": { "query": "tense cluttered minimal underscore resolving to warm optimistic corporate" }
}
```

```bash
node <MEDIA_DIR>/scripts/audio.mjs --request ./audio_request.json --hyperframes . --out ./audio_meta.json --only bgm,sfx
```

HeyGen credential present → retrieval; absent → local generation (Lyria/MusicGen, detached: check `bgm_pending` and run `wait-bgm.mjs` before render). For a hard two-mood split, request two BGM cues and cut them at SWITCH instead of one evolving track.

## SFX event mapping (bundled 19-file library)

Map storyboard events to these names in the storyboard's audio-cues column; anchor each to a narration word:

| storyboard event | SFX |
|---|---|
| card/chip flies in | `whoosh-short` (fast) / `whoosh` (normal) |
| card slam, stamp hit, hard landing | `impact-bass-1` / `impact-bass-2` (alternate) |
| badge/chip/?-bubble pops | `pop` |
| UI select, small state change | `click-soft` / `click` |
| failure / wrong answer / warning | `error` |
| escalation into THE SWITCH | `riser` (start ≈1.5-2s before the switch) |
| reveal lands | `impact-bass-1` + `sparkle` (or `chime`) |
| AI/typing UI | `typing` (trim to the typed span) |
| notification/incoming question | `notification` / `ping` |
| glitch transition support | `glitch-1/2/3` |
| big cinematic cut | `whoosh-cinematic` |

Budget: 2-4 SFX per beat, every beat has at least one. Silence is a defect in Act 1; restraint is fine in Act 2.

## Mounting & mix

- BGM: one `<audio>` at track 5, `data-volume="0.14"`–`0.22` — must sit clearly under the voice. For precise ducking under speech, use the repo's audio-duck tooling instead of a flat volume.
- SFX: one `<audio>` per cue on tracks 6-9, `data-start` = cue time, `data-volume` 0.5-0.8 (impacts louder, clicks quieter).
- Narration stays at track 4, volume 1. Preview the loudest overlap (usually the SWITCH) before rendering.
