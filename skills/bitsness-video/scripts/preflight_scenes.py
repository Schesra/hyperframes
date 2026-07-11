# preflight_scenes.py — catch the scene-authoring traps that pass lint/validate/
# inspect but render wrong. Run BEFORE `hyperframes lint` in Step 5/6.
#
#   python preflight_scenes.py --project <dir>       (exit 1 on any ERROR)
#
# Checks every compositions/*.html:
#   E1  leftover __PLACEHOLDER__ tokens        (bit us twice: __SWITCH__)
#   E2  missing window.__timelines registration
#   E3  missing data-composition-id
#   W1  the 0->0 autoAlpha trap: an element hidden up front (tl.set(...autoAlpha:0)
#       or CSS opacity:0) later animated with tl.from(...autoAlpha/opacity...) —
#       .from() captures the CURRENT (hidden) value as the end state, so the
#       element animates 0->0 and never appears (the invisible-stamp bug).
#       Fix: use fromTo with an explicit visible end state.
import argparse, io, re, sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

ap = argparse.ArgumentParser()
ap.add_argument("--project", required=True)
args = ap.parse_args()
proj = Path(args.project)

errors, warns = [], []
for f in sorted((proj / "compositions").glob("*.html")):
    s = f.read_text(encoding="utf-8")
    name = f.name

    for tok in sorted(set(re.findall(r"__[A-Z_]{2,}__", s))):
        errors.append(f"E1 {name}: leftover placeholder {tok}")
    if "window.__timelines" not in s:
        errors.append(f"E2 {name}: no window.__timelines registration")
    if "data-composition-id" not in s:
        errors.append(f"E3 {name}: no data-composition-id")

    # --- W1: 0->0 autoAlpha trap ---
    # selectors hidden by an early .set(...{...autoAlpha:0...}) or by CSS opacity:0
    hidden = set()
    for m in re.finditer(r"\.set\(\s*([^,]+?),\s*\{[^}]*(?:autoAlpha|opacity)\s*:\s*0[^}]*\}", s):
        hidden.add(m.group(1).strip())
    css_hidden_tokens = set()
    for m in re.finditer(r"([.#][\w-]+)(?:[^{}]*?)\{[^}]*opacity\s*:\s*0[\s;}]", s):
        css_hidden_tokens.add(m.group(1))
    # selectors later revealed via .set(...{autoAlpha:1|opacity:1}) — that combo is
    # empirically safe when the element is NOT CSS-hidden (set executes at play time)
    revealed = set()
    for m in re.finditer(r"\.set\(\s*([^,]+?),\s*\{[^}]*(?:autoAlpha|opacity)\s*:\s*1[^}]*\}", s):
        revealed.add(m.group(1).strip())
    # every .from( that animates autoAlpha/opacity on one of those selectors
    for m in re.finditer(r"\.from\(\s*([^,]+?),\s*(\{[^}]*\})", s):
        sel, props = m.group(1).strip(), m.group(2)
        if not re.search(r"(?:autoAlpha|opacity)\s*:", props):
            continue
        css_hit = any(tok.lstrip(".#") in sel for tok in css_hidden_tokens)
        js_hit = sel in hidden and sel not in revealed
        if css_hit:  # the proven-fatal case (the invisible-stamp bug): CSS opacity:0
            warns.append(f"W1 {name}: .from(autoAlpha/opacity) on CSS-hidden {sel} "
                         f"-> 0->0, never appears. Use fromTo with an explicit end state.")
        elif js_hit:  # hidden by set(0) and never set back to 1 before the from
            warns.append(f"W1 {name}: .from(autoAlpha/opacity) on {sel} hidden by set(0) "
                         f"with no set(1) — verify it appears; prefer fromTo.")

for w in warns: print("⚠ ", w)
for e in errors: print("✗ ", e)
n = len(list((proj / 'compositions').glob('*.html')))
print(f"preflight: {n} files, {len(errors)} error(s), {len(warns)} warning(s)")
sys.exit(1 if errors else 0)
