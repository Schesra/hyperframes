# Media operations: agent guidance

media-use resolves and remembers assets. For **operating** on them: cutting,
reframing, stitching, transforming, it does not wrap every action as a bespoke
command. Instead it points you at the right local tool (decision OP1). Run the
tool, then register the output with `resolve --from <output> --type <type>` so the
result lands in the ledger and the global cache like any other asset.

All tools below are local and free. ffmpeg is assumed present (it backs the
engine already).

## Cut / trim: keep a slice

```bash
ffmpeg -i in.mp4 -ss 00:00:12 -to 00:00:20 -c copy out.mp4   # 0:12–0:20, no re-encode
```

In-composition trimming usually needs **no new file**: a clip plays a sub-window
via `data-media-start` + `data-duration` (see hyperframes-core). Only cut a
physical file when exporting/assembling outside the composition.

## Reframe / crop: change aspect ratio

```bash
# 16:9 -> 9:16, crop centered
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" out.mp4
```

For a non-destructive crop, set a `clip-path` on the element in the composition
itself (render-time, source file untouched) instead of re-encoding with ffmpeg.

## Montage / stitch: join clips

```bash
printf "file '%s'\n" a.mp4 b.mp4 c.mp4 > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4
```

## Silence-cut / highlight: trim dead air, grab the best moment

```bash
auto-editor in.mp4 --edit audio:threshold=4% -o tight.mp4   # pip install auto-editor
scenedetect -i in.mp4 detect-adaptive list-scenes           # pip install scenedetect
```

## Transforms with a quality choice (process)

These have a local option AND a higher-quality HeyGen-CLI option. Run the local
one for free/offline; use the HeyGen CLI when quality matters. Showing the user
a **side-by-side** (local vs HeyGen) is the honest way to let them choose.

| Op                 | Local (free)                                       | HeyGen CLI (quality)        |
| ------------------ | -------------------------------------------------- | --------------------------- |
| Background removal | `hyperframes remove-background in.png` (u2net)     | `heygen background-removal` |
| Upscale            | `realesrgan-ncnn-vulkan -i in.png -o out.png -s 4` | n/a                         |
| Lipsync (dub)      | n/a                                                | `heygen lipsync`            |
| Translate          | n/a                                                | `heygen video-translate`    |

After any op: `resolve --from out.ext --type <type>` to register the derived
asset (it records provenance and auto-promotes to the global cache).

> ponytail: media-use doesn't re-wrap ffmpeg/heygen here, that's deliberate
> (OP1). The value it adds is the ledger + global reuse on the _output_, via
> `--from`. Add a thin `process` verb only if agents repeatedly fumble these
> recipes.

## Text-based editing (transcript cut)

`transcript-cut.mjs` is a compiler, not a wrapper: it turns word timestamps and
agent cut decisions into exact kept segments. It is provided even though the rest
of this file is guidance-only.

```bash
node <SKILL_DIR>/scripts/transcript-cut.mjs \
  --input talk.mp4 \
  --transcript talk.transcribe.json \
  --remove "12.41-15.02,88.3-91.7" \
  --remove-fillers "um,uh,like" \
  --cut-silence 0.8 \
  --out talk.cut.mp4

resolve --from talk.cut.mp4 --type video
```

Use `--plan` first when you want to inspect the kept segment JSON before encoding.

## Ducking (declare in-composition / bake for export)

B1, declare ducking in the composition. `audio-duck.mjs` emits GSAP volume
keyframes. Paste them into the composition timeline, the source file stays
untouched.

```bash
node <SKILL_DIR>/scripts/audio-duck.mjs \
  --meta audio_meta.json \
  --target "#bgm" \
  --composition index.html
```

```js
// auto-duck: #bgm under narration (generated; base volume 0.6)
tl.to("#bgm", { volume: 0.15, duration: 0.15 }, 3.42);
tl.to("#bgm", { volume: 0.6, duration: 0.4 }, 9.87);
```

B2, bake ducking only for exported or standalone files.

```bash
ffmpeg -i bgm.mp3 -i voice.wav \
  -filter_complex "[0][1]sidechaincompress=threshold=0.03:ratio=8:attack=200:release=400[ducked]" \
  -map "[ducked]" bgm.ducked.wav
```

Declare inside compositions. Bake only for assets leaving the hyperframes
pipeline.

## Publish loudness

Two-pass `loudnorm` measures first, then applies the measured values with the
target LUFS baked in.

Socials target, -14 LUFS:

```bash
ffmpeg -i mix.wav \
  -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json \
  -f null -

ffmpeg -i mix.wav \
  -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true:print_format=summary \
  mix.social.wav
```

Podcast target, -16 LUFS:

```bash
ffmpeg -i mix.wav \
  -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json \
  -f null -

ffmpeg -i mix.wav \
  -af loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true:print_format=summary \
  mix.podcast.wav
```
