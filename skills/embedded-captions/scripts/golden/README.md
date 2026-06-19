# Golden render-diff harness

A behavior-preservation safety net for refactoring the **Theme engine** (`scripts/make-theme.cjs`).
The generator emits GSAP/CSS strings that are byte- and PRNG-order-sensitive, so a structural
refactor that _looks_ harmless can silently change a rendered frame. This harness catches that.

## How it works

`scripts/golden-snapshot.sh <out-dir>` compiles **every** `themes/*.json` against a fixed,
self-contained fixture (here) and hashes each theme's generated output (`index.html` +
`rail.html` + `_postfx.sh`). `make-theme.cjs` is deterministic for fixed inputs (seeded
`mulberry32`, no `Date.now`/`Math.random` in the output), so **a changed hash == a changed frame**.

## Use it around any risky make-theme.cjs change

```bash
bash scripts/golden-snapshot.sh /tmp/before     # baseline, BEFORE your edit
#   ...refactor make-theme.cjs (or edit themes/*.json)...
bash scripts/golden-snapshot.sh /tmp/after      # AFTER
diff <(awk '{print $1,$NF}' /tmp/before/manifest.txt) \
     <(awk '{print $1,$NF}' /tmp/after/manifest.txt)
# empty diff == all 38 themes byte-identical == zero behavior degrade.
# any line == that theme's output changed → the refactor is NOT a no-op; revert or fix.
```

This is exactly how the 2026-06-19 "safe structural hygiene" commit proved 0 degrade.

## The two fixtures

The compile-time coverage check wants the hero/climax word placed differently per theme:

- **`fixtureA/`** — hero word **separate** from the body lines (what most themes expect).
- **`fixtureB/`** — hero word **inside** the lines (`lastpage` / `stardust` / `stomp` / `terminal`).

The harness tries A first, falls back to B, so all 38 themes compile. Each fixture is
`transcript.json` + `safe-zones.json` + `theme.auth.json` (the harness fills in `dna` per theme).

## Scope / not-yet-covered

Covers the **Theme** engine only. The **Cinematic** engine (`make-cinematic.cjs` /
`make-composition.cjs` over `dna/`) is not yet golden-tested — add a sibling fixture +
`cinematic.json` driver before refactoring those (see the audit's `needsCare` make-cinematic items).
