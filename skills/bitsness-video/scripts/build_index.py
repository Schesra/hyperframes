# build_index.py — generate index.html mechanically from the beat/cue data.
# Kills the whole ad-hoc-heredoc class of bugs (leftover __PLACEHOLDER__, SFX
# track overlaps, hand-computed cue seconds).
#
#   python build_index.py --project <dir> --title "<video title>"
#
# Reads (inside --project):
#   work/beats.json            [{"id","start","end","act","accent","transition"?}]
#                              "transition" = the cut INTO this beat: push|hard|soft|reveal
#                              (first beat: none; the reveal beat marks THE SWITCH)
#   work/sfx_cues.json         optional; each cue:
#                              {"file":"soft whoosh","volume":0.5}
#                              + one of: {"time": 12.3}                       absolute seconds
#                                        {"word":"im lặng","nth":1,"offset":0} anchored to the Nth
#                                          occurrence of the word/phrase in transcript_words.json
#   work/transcript_words.json for word anchors
#   assets/audio/bgm.mp3       optional — the user adds their own music; mounted ducked if present
#
# Writes: index.html. Also patches compositions/ambient-bg.html __DUR__/__SWITCH__
# placeholders if still present (no more sed). Missing SFX files are auto-copied
# from the installed media-use library (--sfx-lib).
import argparse, io, json, re, shutil, subprocess, sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

ap = argparse.ArgumentParser()
ap.add_argument("--project", required=True)
ap.add_argument("--title", default="Bitsness video")
ap.add_argument("--product", default="VIDEO", help="HUD chrome label: BITSNESS · <PRODUCT>")
ap.add_argument("--sfx-lib", default=str(Path.home() / ".claude/skills/media-use/audio/assets/sfx"))
ap.add_argument("--overlap", type=float, default=0.4, help="outgoing scene mount overlap")
args = ap.parse_args()
proj = Path(args.project)

beats = json.loads((proj / "work/beats.json").read_text(encoding="utf-8"))
DUR = round(max(b["end"] for b in beats), 2)
switch_beats = [b for b in beats if b.get("transition") == "reveal"]
SWITCH = switch_beats[0]["start"] if switch_beats else DUR + 1  # past DUR = single-act

# ---- SFX cues: resolve word anchors + probe durations + ensure files ----
def ffprobe_dur(p):
    try:
        return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                     "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout.strip())
    except Exception:
        return 1.0

words = []
tw = proj / "work/transcript_words.json"
if tw.exists():
    words = json.loads(tw.read_text(encoding="utf-8"))

def resolve_anchor(cue):
    if "time" in cue: return float(cue["time"])
    phrase = cue["word"].split(); nth = cue.get("nth", 1); found = 0
    VN = r"àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ"
    n = lambda t: re.sub(rf"[^\w{VN}]", "", t.lower())
    for i in range(len(words) - len(phrase) + 1):
        if all(n(words[i + k]["text"]) == n(phrase[k]) for k in range(len(phrase))):
            found += 1
            if found == nth: return words[i]["start"] + cue.get("offset", 0)
    raise SystemExit(f"sfx cue anchor not found: {cue}")

cues = []
cue_file = proj / "work/sfx_cues.json"
if cue_file.exists():
    (proj / "assets/audio").mkdir(parents=True, exist_ok=True)
    for cue in json.loads(cue_file.read_text(encoding="utf-8")):
        dest = proj / "assets/audio" / f"{cue['file']}.mp3"
        if not dest.exists():
            src = Path(args.sfx_lib) / f"{cue['file']}.mp3"
            if not src.exists(): raise SystemExit(f"sfx not in library: {cue['file']} ({src})")
            shutil.copy(src, dest)
        t = round(resolve_anchor(cue), 2)
        cues.append({"t": t, "file": cue["file"], "dur": round(ffprobe_dur(dest), 2),
                     "vol": cue.get("volume", 0.45)})
    cues.sort(key=lambda c: c["t"])

# ---- assemble ----
A1 = "radial-gradient(ellipse 92% 60% at 50% 32%, #EFEADE 0%, #E7E2D6 50%, #DBD4C4 100%)"
A2 = "radial-gradient(ellipse 92% 60% at 50% 30%, #FCF7EC 0%, #F7F1E6 52%, #F0E7D6 100%)"

scene_divs, tl_calls, skeys = [], [], []
for i, b in enumerate(beats):
    sid = "s-" + b["id"].split("-", 1)[1]
    skeys.append(sid[2:])
    mount = round((beats[i + 1]["start"] - b["start"] + args.overlap) if i + 1 < len(beats) else DUR - b["start"], 2)
    scene_divs.append(f'      <div id="{sid}" class="scene-layer" data-composition-id="{b["id"]}" '
                      f'data-composition-src="compositions/{b["id"]}.html" data-start="{b["start"]}" '
                      f'data-duration="{mount}" data-track-index="{11+i}" data-width="1080" data-height="1920"></div>')
    tr = b.get("transition")
    if tr:
        prev = "s-" + beats[i - 1]["id"].split("-", 1)[1]
        fn = {"push": "pushSlide", "hard": "hardCut", "soft": "softFade", "reveal": "reveal"}[tr]
        dur = "" if tr == "reveal" else (", 0.3" if tr in ("push", "hard") else ", 0.4")
        tl_calls.append(f'        {fn}(S.{prev[2:]}, S.{sid[2:]}, {b["start"]}{dur});')

short = 0; sfx_tags = []
for j, c in enumerate(cues):
    trk = 9 + (0 if c["dur"] <= 3 else 1) if c["dur"] > 3 else 6 + (short % 3)
    if c["dur"] <= 3: short += 1
    else: trk = 9
    sfx_tags.append(f'      <audio id="sfx-{j}" data-start="{c["t"]}" data-duration="{c["dur"]}" '
                    f'data-track-index="{trk}" data-volume="{c["vol"]}" src="assets/audio/{c["file"]}.mp3"></audio>')

bgm_tag = ""
if (proj / "assets/audio/bgm.mp3").exists():
    bgm_tag = (f'      <audio id="bgm" data-start="0" data-duration="{DUR}" data-track-index="5" '
               f'data-volume="0.16" src="assets/audio/bgm.mp3"></audio>\n')

Slines = ",\n          ".join(f'{k}: "#s-{k}"' for k in skeys)
switch_fade = (f'        tl.to("#basebg2",{{autoAlpha:1,duration:1.2,ease:"sine.inOut"}},{SWITCH});\n'
               if SWITCH <= DUR else "")

html = f'''<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
    <title>{args.title}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@500;600;700;800;900&family=Montserrat:wght@700;900&family=Roboto+Mono:wght@500;600;700&display=block" rel="stylesheet">
    <style>
      * {{ margin:0; padding:0; box-sizing:border-box; }}
      html, body {{ width:1080px; height:1920px; overflow:hidden; background:#E7E2D6; font-family:"Be Vietnam Pro",sans-serif; color:#1E2A3A; }}
      .scene-layer {{ position:absolute; top:0; left:0; width:1080px; height:1920px; }}
      #basebg1 {{ position:absolute; inset:0; background:{A1}; }}
      #basebg2 {{ position:absolute; inset:0; background:{A2}; opacity:0; }}
      #flash {{ position:absolute; inset:0; background:radial-gradient(ellipse 70% 55% at 50% 42%, #fff 0%, #ffe9d6 55%, rgba(226,114,44,0) 100%); opacity:0; pointer-events:none; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1080" data-height="1920">
      <div id="basebg1"></div>
      <div id="basebg2"></div>
{chr(10).join(scene_divs)}
      <div id="ambient-bg" class="scene-layer" data-composition-id="ambient-bg" data-composition-src="compositions/ambient-bg.html" data-start="0" data-duration="{DUR}" data-track-index="3" data-width="1080" data-height="1920"></div>
      <div id="flash"></div>
      <div id="captions" class="scene-layer" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{DUR}" data-track-index="2" data-width="1080" data-height="1920"></div>
      <audio id="narration" data-start="0" data-duration="{DUR}" data-track-index="4" data-volume="1" src="assets/narration.mp3"></audio>
{bgm_tag}{chr(10).join(sfx_tags)}
    </div>
    <script>
      (function () {{
        window.__timelines=window.__timelines||{{}};
        const tl=gsap.timeline({{paused:true}});
        const S={{
          {Slines}
        }};
        const all=Object.values(S);
        tl.set(all[0],{{autoAlpha:1}},0); all.slice(1).forEach((s)=>tl.set(s,{{autoAlpha:0}},0));
{switch_fade}        function hardCut(o,i,t,d){{ tl.to(o,{{autoAlpha:0,scale:1.05,duration:d,ease:"power2.in"}},t); tl.fromTo(i,{{autoAlpha:0,scale:0.97}},{{autoAlpha:1,scale:1,duration:d,ease:"power2.out"}},t); }}
        function pushSlide(o,i,t,d){{ tl.to(o,{{autoAlpha:0,xPercent:-100,duration:d,ease:"power2.inOut"}},t); tl.fromTo(i,{{autoAlpha:1,xPercent:100}},{{autoAlpha:1,xPercent:0,duration:d,ease:"power2.inOut"}},t); }}
        function softFade(o,i,t,d){{ tl.to(o,{{autoAlpha:0,duration:d,ease:"sine.inOut"}},t); tl.fromTo(i,{{autoAlpha:0,y:16}},{{autoAlpha:1,y:0,duration:d,ease:"sine.inOut"}},t); }}
        function reveal(o,i,t){{ tl.to(o,{{autoAlpha:0,scale:0.96,duration:0.6,ease:"power2.inOut"}},t); tl.to("#flash",{{opacity:0.92,duration:0.45,ease:"power2.out"}},t); tl.to("#flash",{{opacity:0,duration:0.7,ease:"power2.in"}},t+0.45); tl.fromTo(i,{{autoAlpha:0,scale:1.08}},{{autoAlpha:1,scale:1,duration:0.9,ease:"power3.out"}},t+0.2); }}
{chr(10).join(tl_calls)}
        tl.set(all[all.length-1],{{autoAlpha:1}},{DUR}-0.3); tl.set({{}},{{}},{DUR});
        window.__timelines["main"]=tl;
      }})();
    </script>
  </body>
</html>
'''
(proj / "index.html").write_text(html, encoding="utf-8")

# ---- patch ambient placeholders (kills the __SWITCH__-left-behind bug) ----
amb = proj / "compositions/ambient-bg.html"
if amb.exists():
    s = amb.read_text(encoding="utf-8")
    s2 = (s.replace("__DUR__", str(DUR)).replace("__SWITCH__", str(SWITCH if SWITCH <= DUR else DUR + 10))
            .replace("__PRODUCT__", args.product.upper()))
    if s2 != s:
        amb.write_text(s2, encoding="utf-8")
        print(f"ambient-bg.html: patched DUR={DUR} SWITCH={SWITCH if SWITCH<=DUR else 'n/a'}")
leftover = re.findall(r"__[A-Z_]{2,}__", (proj / "index.html").read_text(encoding="utf-8"))
print(f"index.html: {len(beats)} scenes, {len(cues)} SFX, {len(tl_calls)} transitions, DUR={DUR}, "
      f"SWITCH={'%.2f'%SWITCH if SWITCH<=DUR else 'none'}, bgm={'yes' if bgm_tag else 'no (user adds later)'}"
      + (f"  !! leftover placeholders: {leftover}" if leftover else ""))
