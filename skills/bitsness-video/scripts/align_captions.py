# align_captions.py — forced alignment: map whisper word TIMINGS onto the
# ground-truth SCRIPT text (difflib), so captions carry the exact script words.
#
# Proven superior to the per-word fix-table on grapuco-78 and arkon-710
# (whisper mangles Vietnamese tech terms; the script is always right).
#
#   python align_captions.py --project <dir> [--whisper-json work/narration16k.json]
#
# Reads : <whisper json> (whisper --output_format json, word_timestamps True)
#         assets/script.txt  (ground truth)
# Writes: work/transcript_words.json  [{"text","start","end"}, ...]  (script words, whisper timing)
#         work/fixes.json             []  (empty — alignment replaces the fix table)
import argparse, difflib, io, json, re, sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

ap = argparse.ArgumentParser()
ap.add_argument("--project", required=True)
ap.add_argument("--whisper-json", default="work/narration16k.json")
args = ap.parse_args()
proj = Path(args.project)

d = json.loads((proj / args.whisper_json).read_text(encoding="utf-8"))
wh = [{"text": w["word"].strip(), "start": round(w["start"], 2), "end": round(w["end"], 2)}
      for seg in d["segments"] for w in seg.get("words", [])]

script = (proj / "assets/script.txt").read_text(encoding="utf-8")
script = script.replace("“", "").replace("”", "").replace("’", "'").replace("…", "...")
sw = script.split()

VN = r"àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ"
def norm(t):
    return re.sub(rf"[^\w{VN}]", "", t.lower())

sm = difflib.SequenceMatcher(a=[norm(w["text"]) for w in wh], b=[norm(t) for t in sw], autojunk=False)
out = []
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    wb, sb = wh[i1:i2], sw[j1:j2]
    if tag in ("equal", "replace"):
        if tag == "equal" and len(wb) == len(sb):
            out += [{"text": s, "start": w["start"], "end": w["end"]} for w, s in zip(wb, sb)]
        else:  # distribute the whisper block's timespan across the script tokens
            t0 = wb[0]["start"] if wb else (out[-1]["end"] if out else 0.0)
            t1 = wb[-1]["end"] if wb else t0
            n = max(len(sb), 1); sp = (t1 - t0) / n
            out += [{"text": s, "start": round(t0 + sp * k, 2), "end": round(t0 + sp * (k + 1), 2)}
                    for k, s in enumerate(sb)]
    elif tag == "insert":  # script tokens whisper missed → borrow the gap
        t0 = out[-1]["end"] if out else 0.0
        t1 = wh[i1]["start"] if i1 < len(wh) else t0 + 0.3 * len(sb)
        n = max(len(sb), 1); sp = (t1 - t0) / n
        out += [{"text": s, "start": round(t0 + sp * k, 2), "end": round(t0 + sp * (k + 1), 2)}
                for k, s in enumerate(sb)]
    # "delete": whisper-only tokens are dropped

for i in range(1, len(out)):  # enforce monotonic timing
    if out[i]["start"] < out[i - 1]["end"]: out[i]["start"] = out[i - 1]["end"]
    if out[i]["end"] < out[i]["start"]: out[i]["end"] = round(out[i]["start"] + 0.1, 2)
out[0]["text"] = out[0]["text"].lstrip("﻿")

(proj / "work/transcript_words.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
(proj / "work/fixes.json").write_text("[]", encoding="utf-8")
print(f"{len(sw)} script tokens -> {len(out)} aligned words, span {out[0]['start']}-{out[-1]['end']}s")
print("EYEBALL THIS (must read as the exact script):")
print(" ".join(w["text"] for w in out))
