# Storyboard rules

The storyboard is the contract: after the user approves it, Step 5 implements it verbatim. Every beat row must be buildable without further creative decisions.

## Beat anatomy

One row per beat from `work/beats.json`:

| field | rule |
|---|---|
| **ẩn dụ micro-world** | ONE concrete UI-simulation metaphor per beat. Name the objects and their states, not vibes ("4 file rows slam down, each gets a status badge, last one turns hot-red with a floating ?" — not "files feel chaotic"). |
| **punch text** | ≤ 8 words, Be Vietnam Pro 800/900, one keyword in the act accent. Punches the *idea*; never transcribes the VO (captions carry the VO verbatim). Appears in the beat's second half, after the metaphor lands. |
| **motion recipe** | 2-3 named entries from `/hyperframes-animation` (`rules-index.md`, `blueprints-index.md`), assigned by component role — tag each element `P:`/`S:`/`D:`/`I:` (PRIMARY / SECONDARY / DECORATIVE / INTERACTIVE, one PRIMARY per beat) and select per `component-animation.md`. Free-styled motion is the #1 quality regression — if no rule fits, say which rule you're adapting and how. |
| **audio cues** | SFX by library name + timing anchor word (see `audio-layer.md`). 2-4 per beat; the SWITCH beat also gets the riser. |
| **transition** (added in Step 3) | named transition into the NEXT beat. |

## Micro-world motif catalog

Proven motifs — reuse before inventing (chaos ↔ system pairs):

- **claw machine** grabbing the wrong file (random search) ↔ **ask box → light beam** into the right node
- **file rows + status badges** `Updated?/Archived?/Approved?/Unknown` (version conflict) ↔ **wiki tree / source tree** with one CURRENT SOURCE tag
- **chat-bubble flood** (questions ↑) ↔ **answer checklist + citation chips**
- **converging arrows onto one avatar** / human-shaped search bar with a loading bar (bottleneck person) ↔ **permission zones**: only the right zone lights up
- **glass boxes** trapping knowledge shards (`TRÍ NHỚ / INBOX / GROUP CHAT`) ↔ **ingest conveyor** → locked original store
- **org chart + boomerang token** (backups don't fix the root) ↔ **4-station pipeline** (Đọc → Ngữ cảnh → Gắn tag → Wiki)
- **rubber stamp slam** (`CHƯA PHẢI BÀI TOÁN CẦN AI`) for verdict beats
- **typing AI card that cracks/shatters + warning** (fast wrong answers)
- **OOO calendar card** for person-dependency beats
- **split verdict cards** (`TÌM ĐÚNG THÔNG TIN` ✓ vs `ĐI TÌM ĐÚNG NGƯỜI` ✗) for the closing question

## Motion-recipe starters (rule → typical beat)

| named rule / blueprint | use for |
|---|---|
| `kinetic-beat-slam` | punch text landings |
| `svg-path-draw` | converging arrows, org lines, citation pulls |
| `stat-bars-and-fills` / `counting-dynamic-scale` | queue counters, loading bars, stat lockups |
| `press-release-spring` / `physics-press-reaction` | stamps, badge pops, button hits |
| `motion-blur-streak` | fast card entries (Act 1 escalation) |
| `split-tilt-cards` | conflicting-document pairs |
| `grid-card-assemble` (blueprint) | hub/wiki assembly scenes |
| `dataviz-countup` (blueprint) | results/metrics beats (no invented numbers — qualitative fills only) |

## Hard rules (checked again at Step 6)

1. Reads with sound off — mute the storyboard in your head; if a beat needs the VO to make sense, the metaphor is wrong.
2. One idea per beat. Two ideas = two beats.
3. No static frame > 3s — every beat needs mid-beat motion (badge pops, dash-flow, drift), not just an entrance.
4. No robots, glowing brains, generic office stock; no invented numbers or % claims.
5. Structure: hook beat (first 3-4s must stop the scroll — see `/hook-writing`) → problem escalation → SWITCH → system beats → results (qualitative) → punchline contrast → CTA (`Comment "<keyword>"` + Follow) with a subtle visual loop back to the opening motif.
6. Act 1 motion register: imprecise, colliding, escalating pace. Act 2: grid-aligned, decisive, calm. The contrast IS the story.
