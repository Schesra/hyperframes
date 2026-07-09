# build_captions.py — generate compositions/captions.html for /bitsness-video.
#
# Inputs (all inside --project):
#   work/transcript_words.json  [{"text","start","end"}, ...]   whisper words, global time
#   work/fixes.json             [{"i": <index>, "text": "replacement"|null}, ...]
#                               null drops the word, extending the previous word's end
#   work/beats.json             [{"id","start","end","accent"}, ...]  accent hex per beat
#
# Output: compositions/captions.html (SEGMENTS + duration injected into the template).
# Re-run whenever an input changes; never hand-edit the output.
import argparse, io, json, sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

MAX_WORDS = 7  # words per caption line (reference style)

ap = argparse.ArgumentParser()
ap.add_argument("--project", required=True, help="video project dir")
ap.add_argument("--template", default=None, help="captions template (default: skill templates/)")
ap.add_argument("--duration", type=float, default=None, help="override composition duration")
args = ap.parse_args()

proj = Path(args.project)
tpl_path = Path(args.template) if args.template else Path(__file__).parent.parent / "templates" / "captions-template.html"

words_raw = json.loads((proj / "work/transcript_words.json").read_text(encoding="utf-8"))
fixes = {f["i"]: f["text"] for f in json.loads((proj / "work/fixes.json").read_text(encoding="utf-8"))} \
    if (proj / "work/fixes.json").exists() else {}
beats = json.loads((proj / "work/beats.json").read_text(encoding="utf-8"))

def accent_at(t):
    for b in beats:
        if b["start"] <= t < b["end"]:
            return b["accent"]
    return beats[-1]["accent"]

words = []
for i, w in enumerate(words_raw):
    t = fixes.get(i, w["text"])
    if t is None:
        if words:
            words[-1]["end"] = round(w["end"], 2)
        continue
    words.append({"w": t, "start": round(w["start"], 2), "end": round(w["end"], 2)})

segments, line = [], []
def flush():
    global line
    if line:
        segments.append({"active": accent_at(line[0]["start"]), "words": line})
        line = []
for w in words:
    line.append(w)
    if len(line) >= MAX_WORDS or w["w"].rstrip('"”').endswith((".", "?", ":", "!")):
        flush()
flush()

duration = args.duration or max(b["end"] for b in beats)
out = (tpl_path.read_text(encoding="utf-8")
       .replace("__SEGMENTS__", json.dumps(segments, ensure_ascii=False, separators=(",", ":")))
       .replace("__DURATION__", f"{duration:.2f}"))
out_path = proj / "compositions/captions.html"
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(out, encoding="utf-8")
print(f"{out_path}: {len(segments)} lines, {sum(len(s['words']) for s in segments)} words, dur {duration:.2f}s")
