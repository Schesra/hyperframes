# Template Picker Skill Integration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Templatize the template picker prototype and integrate it into the hyperframes skill as an alternative to the moodboard-based design picker flow.

**Architecture:** The template picker becomes a second template file alongside `design-picker.html`. The agent generates prompt-contextual palettes and text pools, injects them via Python placeholder replacement (same pattern as the existing picker), and serves the result. Clicking a template bridges to the existing design-picker.html Phase 2 via postMessage/sessionStorage. The skill reference (`design-picker.md`) gains a new section describing when and how to use this flow.

**Tech Stack:** HTML/CSS/JS (single-file template), Python for placeholder injection, `beautiful-html-templates` repo as a runtime dependency.

---

### Task 1: Create templatized template-picker.html

**Files:**
- Create: `skills/hyperframes/templates/template-picker.html`
- Reference: `/Users/vanceingalls/src/rawblock/.hyperframes/template-picker.html`

- [ ] **Step 1: Copy the working prototype and replace hardcoded data with placeholders**

Take the current prototype at `/Users/vanceingalls/src/rawblock/.hyperframes/template-picker.html` and replace the three data blocks with placeholder tokens:

1. Replace the `PALETTES` array value (lines 189-197) with `__PALETTES_JSON__`
2. Replace the `PROMPT_TEXT` object value (lines 199-214) with `__PROMPT_TEXT_JSON__`
3. Replace the `ALL_TEMPLATES` array value (line 216 — the giant one-liner) with `__TEMPLATES_JSON__`
4. Replace the hardcoded prompt description in the header subtitle with `__PROMPT_DESC__`

The result in `skills/hyperframes/templates/template-picker.html`:

```js
var PALETTES = __PALETTES_JSON__;
var PROMPT_TEXT = __PROMPT_TEXT_JSON__;
var ALL_TEMPLATES = __TEMPLATES_JSON__;
```

And in the HTML header:
```html
<div class="sub">__PROMPT_DESC__ &middot; Pick palette &middot; Arrows cycle slides</div>
```

Keep ALL CSS, all JS functions (buildPalChips, applyPal, goSlide, onLoad, injectText, buildGrid, selectTemplate), and all HTML structure exactly as they are in the prototype. Only the data values change to placeholders.

- [ ] **Step 2: Verify placeholders are correct**

```bash
grep -c "__PALETTES_JSON__\|__PROMPT_TEXT_JSON__\|__TEMPLATES_JSON__\|__PROMPT_DESC__" skills/hyperframes/templates/template-picker.html
```

Expected: `4` (one of each).

```bash
grep -c "HeyGen\|heygen" skills/hyperframes/templates/template-picker.html
```

Expected: `0` (no hardcoded prompt content left).

- [ ] **Step 3: Commit**

```bash
git add skills/hyperframes/templates/template-picker.html
git commit -m "feat(skills): add template-picker.html with data placeholders"
```

---

### Task 2: Add template-picker generation script

**Files:**
- Create: `skills/hyperframes/scripts/build-template-picker.py`

- [ ] **Step 1: Write the script**

This script reads the `beautiful-html-templates` index.json, extracts color vars from each template, and is called by the agent with JSON data piped to stdin.

```python
#!/usr/bin/env python3
"""Build a template picker HTML from the template and injected data.

Usage:
    python3 build-template-picker.py \
        --template skills/hyperframes/templates/template-picker.html \
        --templates-dir /path/to/beautiful-html-templates/templates \
        --output .hyperframes/template-picker.html \
        < data.json

data.json must contain:
    { "palettes": [...], "prompt_text": {...}, "prompt_desc": "..." }

The script reads index.json from templates-dir, extracts CSS color vars
from each template, and injects all data into the HTML template.
"""
import json, sys, re, os, argparse

def extract_color_vars(html_path):
    with open(html_path) as f:
        html = f.read()
    root_match = re.search(r':root\s*\{([^}]+)\}', html)
    if not root_match:
        return []
    return [m[0] for m in re.findall(r'(--[\w-]+)\s*:\s*([^;]+)', root_match.group(1))
            if '#' in m[1] or 'rgb' in m[1]]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--template', required=True)
    parser.add_argument('--templates-dir', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()

    data = json.load(sys.stdin)

    index_path = os.path.join(os.path.dirname(args.templates_dir), 'index.json')
    with open(index_path) as f:
        index = json.load(f)

    templates = []
    for t in index['templates']:
        html_path = os.path.join(args.templates_dir, t['slug'], 'template.html')
        if not os.path.exists(html_path):
            continue
        templates.append({
            'slug': t['slug'],
            'name': t['name'],
            'tagline': t['tagline'],
            'scheme': t['scheme'],
            'density': t['density'],
            'colorVars': extract_color_vars(html_path)
        })

    with open(args.template) as f:
        html = f.read()

    html = html.replace('__PALETTES_JSON__', json.dumps(data['palettes']))
    html = html.replace('__PROMPT_TEXT_JSON__', json.dumps(data['prompt_text']))
    html = html.replace('__TEMPLATES_JSON__', json.dumps(templates))
    html = html.replace('__PROMPT_DESC__', data.get('prompt_desc', ''))

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, 'w') as f:
        f.write(html)

    print(f"Written to {args.output} ({len(templates)} templates)")

if __name__ == '__main__':
    main()
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x skills/hyperframes/scripts/build-template-picker.py
```

- [ ] **Step 3: Commit**

```bash
git add skills/hyperframes/scripts/build-template-picker.py
git commit -m "feat(skills): add build-template-picker.py generation script"
```

---

### Task 3: Update design-picker.md with template-based flow

**Files:**
- Modify: `skills/hyperframes/references/design-picker.md`

- [ ] **Step 1: Add the template picker section**

Insert the following after the existing "Prompt-contextual backgrounds (generate 3)" section (after the camera rules block, before the step that says `2. mkdir -p .hyperframes`). This goes right before the existing step 2:

```markdown
## Alternative: Template-based picker

Use this flow instead of generated moodboards when the user wants to browse pre-built visual directions. The templates come from the `beautiful-html-templates` library (34 HTML slide decks with diverse visual identities).

### When to use

- User says "show me templates", "browse options", or "what styles are available"
- User brings an existing brand/design.md and wants to see it applied across templates
- User wants to skip the creative brainstorming and pick from proven designs
- The prompt is for a presentation deck rather than a video composition

### Step 1: Generate contextual data from the prompt

Generate a JSON object with three keys. This is the creative work — match everything to the prompt's subject and energy.

**`palettes`** — 6 color palettes themed to the prompt. Always include "Default" as the first entry (original template colors). Each non-default palette has: `name`, `bg`, `fg`, `ac` (accent), `mt` (muted). Name palettes after the prompt's world, not generic labels.

**`prompt_text`** — text pools for injecting into templates. Every template gets its placeholder text replaced with prompt-contextual content. The pools:

| Key | What it is | Count needed | Example (for a coffee brand) |
|-----|-----------|-------------|------------------------------|
| `taglines` | Object with 6 tone keys: `bold`, `editorial`, `playful`, `dark`, `technical`, `warm` | 6 strings | `{bold: "WAKE UP DIFFERENT", editorial: "The Art of the Morning Cup", ...}` |
| `headlines` | Slide-level headlines | 10+ strings | `"Single Origin. Zero Compromise."` |
| `body` | Paragraph-length descriptions | 8+ strings | `"We source from 12 farms across 3 continents..."` |
| `stats` | Short metrics with units | 10+ strings | `"12M+", "47°C", "98.6%"` |
| `statLabels` | Labels for the stats | 10+ strings | `"Cups Served", "Optimal Temp", "Satisfaction"` |
| `labels` | ALL-CAPS chip/tag labels | 12+ strings | `"ESPRESSO", "COLD BREW", "SUBSCRIPTION"` |
| `smalls` | CTAs, links, small UI text | 12+ strings | `"Shop Now →", "Free Shipping", "Our Story"` |

The `taglines` object controls the display-level text per template. Each template gets assigned a tone based on its metadata:
- `dark` — templates with `scheme: "dark"`
- `warm` — templates with `density: "low"`
- `technical` — templates with `density: "high"`
- `playful` — templates whose tagline matches playful/cheerful/friendly/fun
- `editorial` — templates whose tagline matches editorial/serif/literary/magazine
- `bold` — everything else (default)

**`prompt_desc`** — one-line description shown in the picker header. Example: `"Exciting promo video for HeyGen"`.

### Step 2: Ensure templates are available

```bash
# Clone if not cached
if [ ! -d /tmp/beautiful-html-templates ]; then
  git clone --depth 1 https://github.com/zarazhangrui/beautiful-html-templates.git /tmp/beautiful-html-templates
fi
```

### Step 3: Build and serve the picker

```bash
mkdir -p .hyperframes

# Symlink templates into the project for iframe access
ln -sf /tmp/beautiful-html-templates/templates templates

# Generate the picker HTML
cat data.json | python3 skills/hyperframes/scripts/build-template-picker.py \
  --template skills/hyperframes/templates/template-picker.html \
  --templates-dir /tmp/beautiful-html-templates/templates \
  --output .hyperframes/template-picker.html
```

Where `data.json` is the JSON object you generated in Step 1, written to a temp file via Python (same pattern as the moodboard picker — don't hand-escape quotes in sed).

Serve: `cd <project-dir> && python3 -m http.server 8723 &`

Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:8723/.hyperframes/template-picker.html` — only share the link if it returns 200.

### Step 4: User selects a template

The user browses templates, applies palette re-theming, cycles through slides, then clicks a template. The picker stores the selection in `sessionStorage` and navigates to `pick-design.html` for Phase 2 fine-tuning.

For the bridge to work, `pick-design.html` must exist in `.hyperframes/` with the standard design-picker data. Generate it using the normal moodboard flow (1 architecture, the prompt's palettes and type pairings) so Phase 2 has all the fine-tune controls. The bridge code in `pick-design.html` reads `sessionStorage.templatePick` and auto-advances to Phase 2 with the selected template's metadata applied to the overview.

### Phase 2 bridge setup

The template picker's `selectTemplate()` function posts a message to the parent (when embedded in an iframe) or stores to sessionStorage (when standalone):

```js
{
  type: "templatePick",
  slug: "studio",
  name: "Studio",
  tagline: "Black canvas with electric-yellow type...",
  scheme: "dark",
  palette: {bg: "#0F0A1A", fg: "#FFFFFF", accent: "#7C3AED", muted: "#9CA3AF"} // or null
}
```

Add this bridge code at the end of `pick-design.html`'s main `<script>` block (before `</script>`):

```js
function handleTemplatePick(pick) {
  if (!pick || !pick.slug) return;
  PROMPT.title = pick.name;
  PROMPT.headline = pick.name.toUpperCase();
  PROMPT.subline = pick.tagline;
  if (ARCHITECTURES[0]) {
    ARCHITECTURES[0].name = pick.name;
    ARCHITECTURES[0].description = pick.tagline;
    ARCHITECTURES[0].tag = pick.slug;
    ARCHITECTURES[0].mood = (pick.scheme === "dark" ? "Dark" : "Light") + " template — " + pick.tagline;
  }
  if (pick.palette) {
    var bestIdx = 0, bestDist = Infinity;
    PALETTES.forEach(function(p, i) {
      var d = Math.abs(parseInt(p.background.slice(1,3),16) - parseInt(pick.palette.bg.slice(1,3),16))
            + Math.abs(parseInt(p.foreground.slice(1,3),16) - parseInt(pick.palette.fg.slice(1,3),16))
            + Math.abs(parseInt(p.accent.slice(1,3),16) - parseInt(pick.palette.accent.slice(1,3),16));
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    overridePalette = bestIdx;
  }
  selectedMood = 0;
  setTimeout(function() { goToTune(); }, 300);
}
window.addEventListener("message", function(e) {
  if (e.data && e.data.type === "templatePick") handleTemplatePick(e.data);
});
(function() {
  var raw = sessionStorage.getItem("templatePick");
  if (!raw) return;
  sessionStorage.removeItem("templatePick");
  try { handleTemplatePick(JSON.parse(raw)); } catch(e) {}
})();
```

**Important:** The `pick-design.html` Phase 1 HTML elements (`mood-grid`, `pal-bar`, `mood-next-btn`, `mood-title`, `mood-subtitle`) may not exist if Phase 1 was replaced with an iframe to the template picker. Guard all references to these elements:

```js
var moodGrid = document.getElementById("mood-grid") || document.createElement("div");
var palBar = document.getElementById("pal-bar") || document.createElement("div");
```

And guard any `getElementById` calls in the moodboard rendering code that would crash if the elements are missing.
```

- [ ] **Step 2: Commit**

```bash
git add skills/hyperframes/references/design-picker.md
git commit -m "docs(skills): add template-based picker flow to design-picker.md"
```

---

### Task 4: Verify end-to-end with a test prompt

**Files:**
- No new files — validation only

- [ ] **Step 1: Generate test data for "coffee brand launch"**

Write a quick test JSON to `/tmp/test-picker-data.json`:

```json
{
  "palettes": [
    {"name":"Default", "bg":"__DEFAULT__"},
    {"name":"Espresso Dark", "bg":"#1A1008", "fg":"#F5E6D0", "ac":"#C8742E", "mt":"#8B7355"},
    {"name":"Latte Cream", "bg":"#FFF8F0", "fg":"#2C1810", "ac":"#8B4513", "mt":"#A08060"},
    {"name":"Cold Brew", "bg":"#0A0A0A", "fg":"#E8E0D8", "ac":"#4ECDC4", "mt":"#888888"}
  ],
  "prompt_text": {
    "taglines": {
      "bold": "WAKE UP DIFFERENT",
      "editorial": "The Art of the Morning Cup",
      "playful": "Life's too short for bad coffee.",
      "dark": "EVERY. SINGLE. BEAN.",
      "technical": "FROM FARM TO CUP IN 72 HOURS",
      "warm": "A Cup That Tells a Story"
    },
    "headlines": ["Single Origin. Zero Compromise.", "12 Farms. 3 Continents.", "Cold Brew Redefined"],
    "body": ["We source from 12 farms across 3 continents, roasting in small batches for maximum flavor."],
    "stats": ["12M+", "47°C", "98.6%"],
    "statLabels": ["Cups Served", "Optimal Temp", "Satisfaction"],
    "labels": ["ESPRESSO", "COLD BREW", "SUBSCRIPTION"],
    "smalls": ["Shop Now →", "Free Shipping", "Our Story"]
  },
  "prompt_desc": "Coffee brand launch"
}
```

- [ ] **Step 2: Run the build script**

```bash
cd /Users/vanceingalls/src/wt/hyperframes/one

# Ensure templates repo exists
if [ ! -d /tmp/beautiful-html-templates ]; then
  git clone --depth 1 https://github.com/zarazhangrui/beautiful-html-templates.git /tmp/beautiful-html-templates
fi

mkdir -p /tmp/coffee-test/.hyperframes
ln -sf /tmp/beautiful-html-templates/templates /tmp/coffee-test/templates

cat /tmp/test-picker-data.json | python3 skills/hyperframes/scripts/build-template-picker.py \
  --template skills/hyperframes/templates/template-picker.html \
  --templates-dir /tmp/beautiful-html-templates/templates \
  --output /tmp/coffee-test/.hyperframes/template-picker.html
```

Expected output: `Written to /tmp/coffee-test/.hyperframes/template-picker.html (34 templates)`

- [ ] **Step 3: Verify no hardcoded prompt content leaked**

```bash
grep -c "HeyGen\|heygen" /tmp/coffee-test/.hyperframes/template-picker.html
```

Expected: `0`

```bash
grep -c "Espresso Dark\|WAKE UP DIFFERENT\|Coffee brand" /tmp/coffee-test/.hyperframes/template-picker.html
```

Expected: `3` (one each in palettes, prompt_text taglines, prompt_desc)

- [ ] **Step 4: Serve and open in browser**

```bash
cd /tmp/coffee-test && python3 -m http.server 8724 &
curl -s -o /dev/null -w "%{http_code}" http://localhost:8724/.hyperframes/template-picker.html
```

Expected: `200`

Open `http://localhost:8724/.hyperframes/template-picker.html` in browser. Verify:
- Header shows "Coffee brand launch"
- Palette bar shows "Espresso Dark", "Latte Cream", "Cold Brew" specimens
- Template text shows coffee content ("WAKE UP DIFFERENT", etc.)
- Slide cycling works
- Palette switching re-themes all templates

Kill server: `kill $(lsof -ti:8724)`
