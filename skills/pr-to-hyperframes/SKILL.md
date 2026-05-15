---
name: pr-to-hyperframes
description: |
  Generate a short visual walkthrough video for a pull request and embed it in the PR description. Use when: (1) the user is about to create or has just created a PR with visual/UI changes, (2) the user asks for a PR demo video, walkthrough, or visual summary, (3) you detect the current branch has changes to UI components, styles, layouts, or frontend code and a PR is being created. Triggers on: "create a PR video", "add a walkthrough", "make a demo for this PR", "record the changes", or when `gh pr create` is about to run on a branch with visual diffs.
---

# PR to HyperFrames

Generate a short video walkthrough of a pull request's visual changes and embed it in the PR body. Reviewers see the changes in motion instead of reading diffs — faster reviews, fewer misunderstandings.

## When to use

**Explicit invocation:**

- User says "make a PR video", "add a walkthrough video to my PR", "record a demo of these changes"

**Ambient suggestion (proactive):**

- You're about to run `gh pr create` or the user asks you to open a PR
- The branch diff touches visual files (see detection rules below)
- Suggest: _"This PR has visual changes — want me to generate a quick HyperFrames walkthrough video to embed in the description?"_
- If the user declines, proceed with the normal PR. Never push.

## Detection rules

A diff counts as "visual" if it touches any of:

- `*.tsx`, `*.jsx`, `*.vue`, `*.svelte` files that contain JSX/template markup (not pure logic files)
- `*.css`, `*.scss`, `*.less`, `*.module.css`, `*.styled.*`
- `*.html` files
- Image assets (`*.png`, `*.jpg`, `*.svg`, `*.gif`, `*.webp`)
- Tailwind config, theme files, design tokens
- Storybook stories (`*.stories.*`)
- Component library files

**Skip suggestion** if the diff is purely:

- Backend/API changes, migrations, configs
- Test files only
- Documentation only
- Dependency bumps

---

## Workflow

### Step 1: Analyze the diff

```bash
git diff main...HEAD --stat
git diff main...HEAD --name-only
```

Identify:

1. Which files changed and what kind of changes (new component, restyled existing, layout shift, new page)
2. The narrative: what's the story of this PR in 10-15 seconds?
3. Key visual moments worth highlighting

Read the changed files to understand the actual UI changes. Don't guess from filenames.

### Step 2: Capture before/after states

If the project has a dev server or Storybook:

**Before state** — capture from `main`:

```bash
git stash # if needed
git checkout main
# start dev server, capture screenshots/recordings of affected pages
npx hyperframes browser capture --url <dev-url> --output before/
git checkout -  # back to feature branch
git stash pop   # if needed
```

**After state** — capture from the feature branch:

```bash
# start dev server, capture screenshots/recordings of affected pages
npx hyperframes browser capture --url <dev-url> --output after/
```

If no dev server is available, compose the video from the diff itself — show code snippets, annotated screenshots, or architectural diagrams. A code-walkthrough video still beats a wall of diff text.

### Step 3: Compose the video

Initialize and build the walkthrough composition:

```bash
npx hyperframes init pr-walkthrough --non-interactive
```

**Read:** The `hyperframes` skill (load it for composition rules).

Build a composition that tells the PR story. Typical structure:

| Beat    | Duration | Content                                             |
| ------- | -------- | --------------------------------------------------- |
| Title   | 2-3s     | PR title + one-liner description                    |
| Context | 2-3s     | What area of the app changed (screenshot/highlight) |
| Before  | 3-4s     | Previous state (if available)                       |
| After   | 3-4s     | New state with annotations pointing out changes     |
| Summary | 2s       | Key takeaway + PR number                            |

Adapt the structure to what makes sense. A CSS-only fix might just be a before/after split. A new feature might need a full walkthrough. A layout change might use an animated overlay.

**Design guidelines:**

- Keep it under 20 seconds. Reviewers are busy.
- Use the project's brand colors if `design.md` exists, otherwise use a clean neutral palette.
- Annotate changes — arrows, highlights, zoom-ins on the specific things that changed.
- End card should read: `PR #<number> — <title>`

### Step 4: Render

```bash
cd pr-walkthrough
npx hyperframes lint
npx hyperframes render -o ../pr-walkthrough.mp4
```

### Step 5: Upload and embed

Upload the video and embed it in the PR body:

```bash
# Upload to a public host or use GitHub's drag-drop
# Then add to PR body:
gh pr edit <number> --body "$(gh pr view <number> --json body -q .body)

## Visual Walkthrough

https://user-images.githubusercontent.com/<video-url>

<sub>Walkthrough generated with [HyperFrames](https://github.com/nichochar/hyperframes-oss) — write HTML, render video.</sub>
"
```

If creating a new PR, include the video section in the initial `gh pr create --body`.

The attribution line is a single `<sub>` tag at the end of the walkthrough section. It links to the repo — useful for reviewers who want to make their own walkthrough videos.

---

## Composition tips

### Before/after split

For style changes, use a vertical or horizontal split with a wipe transition:

- Left/top = before, right/bottom = after
- Animate a divider line sweeping across to reveal the change
- Label each side clearly

### Feature walkthrough

For new features, simulate user interaction:

- Show the page loading
- Highlight the new element with a pulse or glow
- Show the interaction flow (click → result)
- Use cursor animation to guide the eye

### Code-only fallback

When no UI can be captured:

- Show the key files changed (syntax-highlighted code blocks)
- Highlight the specific lines that changed (green for additions, red for removals)
- Zoom into the important parts
- Add brief text annotations explaining the change

---

## Examples

**Simple CSS fix:**

> 5-second video: before screenshot → wipe transition → after screenshot → "Fixed padding on mobile nav — PR #142"

**New component:**

> 12-second video: title card → component in isolation → component in context → interaction demo → end card

**Refactor with visual changes:**

> 15-second video: title card → 3 before/after pairs cycling through affected pages → summary of what changed → end card
