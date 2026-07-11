# Transition recipes — paper/editorial + overlay set, 9:16

GSAP blocks for the transitions **not** in the `/hyperframes-animation` catalog, pre-adapted to the 1080×1920 vertical canvas and the index-level scene-layer architecture. Conventions:

- `old` / `new` = the scene layer wrapper selectors in `index.html` (e.g. `"#L-s03"`, `"#L-s04"`); `T` = the cut time (outgoing beat's end).
- All blocks go on the single paused main timeline (`tl`). `tl.set` / `tl.fromTo` only — never immediate `gsap.set`, never `onComplete`.
- Overlay elements (`#stamp-obj`, `#overlay-card`, `#wipe-obj`, `#marker-tip`, `#panel-a/b`, `#flash-overlay`) are mounted **once** in `index.html` at `z-index ≥ 90`, CSS `opacity: 0` or parked off-screen, and reused across cuts.
- Scene wrappers need `overflow: hidden` (for crumple's borderRadius) — the skeleton already has it.

## Marker Wipe (LIGHT)

The swept area is a `clip-path` mask revealing the new scene; a highlighter tip rides the reveal edge.

```html
<div id="marker-tip"></div>
<style>#marker-tip { position: absolute; top: -110px; left: 0; width: 130px; height: 2140px;
  background: #d9c227; border-radius: 65px; opacity: 0; z-index: 95; }</style>
```

```js
tl.set(new, { autoAlpha: 1, clipPath: "inset(0% 100% 0% 0%)" }, T);
tl.fromTo(new, { clipPath: "inset(0% 100% 0% 0%)" },
  { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.inOut" }, T);
tl.set("#marker-tip", { opacity: 1 }, T);
tl.fromTo("#marker-tip", { x: -160, rotation: -4 },
  { x: 1140, rotation: -4, duration: 0.5, ease: "power2.inOut" }, T);
tl.set("#marker-tip", { opacity: 0 }, T + 0.51);
tl.set(old, { autoAlpha: 0 }, T + 0.51);
tl.set(new, { clipPath: "none" }, T + 0.55);
```

## Page Turn (MEDIUM)

Old scene turns around its left edge like a page; `backfaceVisibility: "hidden"` makes it vanish past 90°, revealing the new scene.

```js
tl.set(new, { autoAlpha: 1 }, T);
tl.set(old, { zIndex: 10, transformPerspective: 2000, transformOrigin: "left center",
  backfaceVisibility: "hidden" }, T);
tl.to(old, { rotationY: -115, duration: 0.7, ease: "power2.inOut" }, T);
tl.set(old, { autoAlpha: 0, zIndex: "auto", rotationY: 0 }, T + 0.72);
```

## Paper Slide Out (MEDIUM)

Old scene is a paper sheet pulled off; the box-shadow on the wrapper sells the paper edge.

```js
tl.set(new, { autoAlpha: 1 }, T);
tl.set(old, { zIndex: 10 }, T);
tl.to(old, { x: -1400, rotation: -5, duration: 0.45, ease: "power3.in" }, T);
tl.set(old, { autoAlpha: 0, zIndex: "auto", x: 0, rotation: 0 }, T + 0.47);
```

## Sticker Peel Reveal (MEDIUM)

Old scene lifts from the bottom-right corner (rotationX bend), then flies off like a peeled sticker.

```js
tl.set(new, { autoAlpha: 1 }, T);
tl.set(old, { zIndex: 10, transformPerspective: 1800, transformOrigin: "right bottom" }, T);
tl.to(old, { rotationX: 32, rotation: -8, y: -200, duration: 0.35, ease: "power2.in" }, T);
tl.to(old, { y: -2400, x: 260, rotation: -16, duration: 0.4, ease: "power2.in" }, T + 0.35);
tl.set(old, { autoAlpha: 0, zIndex: "auto", rotationX: 0, rotation: 0, x: 0, y: 0 }, T + 0.77);
```

## Paper Tear Reveal (STRONG)

Sub-comp-safe variant: the old scene's clip-path is a jagged edge swept upward — the scene "tears off" the frame. (The two-half `cloneNode` variant from `videos/transition-showcase-paper/` is for standalone compositions only; never clone a mounted sub-comp layer.)

```js
tl.set(new, { autoAlpha: 1 }, T);
tl.set(old, { zIndex: 10 }, T);
tl.fromTo(old,
  { clipPath: "polygon(0% 0%, 100% 0%, 100% 103%, 88% 106%, 76% 102%, 64% 107%, 52% 103%, 40% 108%, 28% 103%, 16% 107%, 6% 104%, 0% 106%)" },
  { clipPath: "polygon(0% 0%, 100% 0%, 100% -9%, 88% -6%, 76% -10%, 64% -5%, 52% -9%, 40% -4%, 28% -9%, 16% -5%, 6% -8%, 0% -6%)",
    duration: 0.6, ease: "power2.in" }, T);
tl.to(old, { y: -80, rotation: -2, duration: 0.6, ease: "power2.in" }, T);
tl.set(old, { autoAlpha: 0, zIndex: "auto", clipPath: "none", y: 0, rotation: 0 }, T + 0.62);
```

## Stamp Transition (STRONG)

Stamp slams down, the scene swap hides under the impact + a 2–4-frame shake. Change the stamp text per video (Approved / Quan trọng / the verdict word). Pair with `impact-bass`.

```html
<div id="stamp-obj">XÁC NHẬN</div>
<style>#stamp-obj { position: absolute; top: 680px; left: 90px; width: 900px; height: 560px;
  background: #f6efe0; border: 14px double #b3402e; border-radius: 36px;
  display: flex; align-items: center; justify-content: center;
  font-size: 110px; font-weight: 800; letter-spacing: 0.12em; color: #b3402e;
  opacity: 0; z-index: 96; }</style>
```

```js
tl.fromTo("#stamp-obj", { scale: 3.4, opacity: 0, rotation: -10 },
  { scale: 1, opacity: 1, rotation: -10, duration: 0.25, ease: "power4.in" }, T);
tl.set(old, { autoAlpha: 0 }, T + 0.25);
tl.set(new, { autoAlpha: 1 }, T + 0.25);
tl.to(new, { x: 12, duration: 0.05, ease: "none" }, T + 0.26);
tl.to(new, { x: -8, duration: 0.05, ease: "none" }, T + 0.31);
tl.to(new, { x: 4,  duration: 0.05, ease: "none" }, T + 0.36);
tl.to(new, { x: 0,  duration: 0.05, ease: "none" }, T + 0.41);
tl.to("#stamp-obj", { scale: 1.9, opacity: 0, duration: 0.4, ease: "power2.in" }, T + 0.6);
```

## Crumple Transition (STRONG)

Old scene squashes, twists, and rounds into a paper ball. Needs `overflow: hidden` + `transformOrigin: "50% 50%"` on the wrapper.

```js
tl.set(new, { autoAlpha: 1 }, T);
tl.set(old, { zIndex: 10, transformOrigin: "50% 50%" }, T);
tl.to(old, { scale: 0.5, rotation: -8, skewX: 10, borderRadius: "120px",
  duration: 0.25, ease: "power2.in" }, T);
tl.to(old, { scale: 0.07, rotation: 30, skewX: -16, y: 260, borderRadius: "50%",
  duration: 0.3, ease: "power3.in" }, T + 0.25);
tl.to(old, { autoAlpha: 0, duration: 0.12, ease: "none" }, T + 0.5);
tl.set(old, { zIndex: "auto", scale: 1, rotation: 0, skewX: 0, y: 0, borderRadius: "0px" }, T + 0.64);
```

## Graphic Overlay (MEDIUM)

A large card sweeps across; the cut hides in a fast crossfade while the card covers center-frame.

```html
<div id="overlay-card">…card content…</div>
<style>#overlay-card { position: absolute; top: 280px; left: 0; width: 880px; height: 1260px;
  background: #fffaf0; border: 5px solid #211c15; border-radius: 24px;
  box-shadow: 18px 18px 0 rgba(33, 28, 21, 0.35); opacity: 1; z-index: 92; }</style>
```

```js
tl.fromTo("#overlay-card", { x: -1500, rotation: -5 },
  { x: 1500, rotation: -5, duration: 0.8, ease: "power2.inOut" }, T);
tl.to(old, { autoAlpha: 0, duration: 0.12, ease: "none" }, T + 0.36);
tl.fromTo(new, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, ease: "none" }, T + 0.36);
```

## Foreground Wipe (STRONG)

A full-cover shape crosses the frame; scenes swap while fully covered. Pair with `whoosh`.

```html
<div id="wipe-obj"></div>
<style>#wipe-obj { position: absolute; top: -340px; left: 0; width: 1500px; height: 2600px;
  background: #2e4b3f; border-radius: 100px; opacity: 1; z-index: 93; }</style>
```

```js
tl.fromTo("#wipe-obj", { x: -1700, rotation: -8 },
  { x: 1300, rotation: -8, duration: 0.6, ease: "power2.inOut" }, T);
tl.set(old, { autoAlpha: 0 }, T + 0.3);
tl.set(new, { autoAlpha: 1 }, T + 0.3);
```

## Fast Horizontal Pan / whip (STRONG)

CSS whip-pan: both scenes fly the same direction under heavy blur. Pair with `whoosh`.

```js
tl.to(old, { x: -1080, filter: "blur(14px)", duration: 0.32, ease: "power4.in" }, T);
tl.fromTo(new, { x: 1080, autoAlpha: 1, filter: "blur(14px)" },
  { x: 0, filter: "blur(0px)", duration: 0.38, ease: "power4.out" }, T + 0.16);
tl.set(old, { autoAlpha: 0, x: 0, filter: "none" }, T + 0.56);
```
