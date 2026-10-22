"""lib_bot.py — job-local helpers for bot-trading's graphics (chat-only lane, presets/youtube/default).

Timeline maths off the job's own files (transcript/cuts.json, outputs/<job>.transcript.json), capture prep off the
creator's OBS recordings, and the HTML templates every comp of this job is emitted from. One comp per cell; every
entrance and exit is a call into hf-anim.js (the registry), never a retyped helper.
"""
import json
import os
import re
import subprocess
import unicodedata
from html import escape
from pathlib import Path

JOB = Path(__file__).resolve().parents[1]
HF = JOB / "hf-graphics"
GFX = HF / "gfx"
FPS = 30
SRC = Path(os.environ.get("EDICIO_PROJECTE", "/home/user/edicio-videos/projectes/bot-trading"))  # els originals (input/, edl.json)
OBS = {"obs1": SRC / "input/2026-10-19_14-57-35.mkv", "obs2": SRC / "input/2026-10-19_16-36-40.mkv",
       "obs3": SRC / "input/2026-10-20_14-00-57.mkv"}
YT = {"yt1": SRC / "work/yt_bot_trading_ia.mp4", "yt2": SRC / "work/yt_claude_trading_bot.mp4",
      "yt3": SRC / "work/yt_ai_trading_bot.mp4", "yt4": SRC / "work/yt_rug_pull.mp4", "yt5": SRC / "work/yt_while_sleep.mp4"}
# Retalls de la pantalla d'OBS (2880x1620): l'app sense la barra de tasques; el navegador sense pestanyes, adreça ni
# adreces d'interès (s'hi veia el correu de l'usuari).
CROP = {"app": (0, 0, 2880, 1524), "browser": (0, 236, 2880, 1288)}


# ---------- the timeline ----------
def segments():
    segs, t = [], 0
    for s in json.load(open(JOB / "transcript/cuts.json"))["segments"]:
        n = round(s["end"] * FPS) - round(s["start"] * FPS)
        segs.append({**s, "t0": t / FPS, "t1": (t + n) / FPS})
        t += n
    return segs


SEGS = segments()
DURATION = SEGS[-1]["t1"]


def span(rid):
    """Timeline span of an EDL range (all its polished parts)."""
    xs = [s for s in SEGS if s.get("_range") == rid]
    if not xs:
        raise KeyError(rid)
    return xs[0]["t0"], xs[-1]["t1"]


def src2tl(rid, src_t):
    """Raw time inside range rid -> timeline time (the part that plays it, else the nearest part edge)."""
    xs = [s for s in SEGS if s.get("_range") == rid]
    for s in xs:
        if s["start"] - 1e-3 <= src_t <= s["end"] + 1e-3:
            return s["t0"] + (src_t - s["start"])
    best = min(xs, key=lambda s: min(abs(src_t - s["start"]), abs(src_t - s["end"])))
    return best["t0"] if src_t < best["start"] else best["t1"]


def _norm(w):
    w = unicodedata.normalize("NFKD", w.lower())
    return re.sub(r"[^a-z0-9%]", "", "".join(c for c in w if not unicodedata.combining(c)))


WORDS = [w for w in json.load(open(JOB / f"outputs/{JOB.name}.transcript.json"))["words"] if w.get("type", "word") == "word"]


def word(phrase, after=0.0, end=False):
    """Timeline time of the first spoken word of `phrase` at or after `after` (end=True: the last word's end)."""
    toks = [_norm(x) for x in phrase.split() if _norm(x)]
    ws = [(_norm(w["text"]), w) for w in WORDS]
    for i in range(len(ws) - len(toks) + 1):
        if ws[i][1]["start"] < after - 1e-3:
            continue
        if all(ws[i + k][0] == toks[k] for k in range(len(toks))):
            return ws[i + len(toks) - 1][1]["end"] if end else ws[i][1]["start"]
    raise KeyError(f"phrase not in transcript after {after:.2f}: {phrase!r}")


def snap(t):
    return round(t * FPS) / FPS


# ---------- captures ----------
def capture(cid, screen, from_s, dur, crop="app", speed=1.0, still=False, width=1920):
    """assets/captures/<cid>.{mp4,png}: the real recording (OBS or the YouTube search capture), cropped, CFR 30."""
    out_dir = JOB / "assets/captures"
    out_dir.mkdir(parents=True, exist_ok=True)
    if screen in OBS:
        x, y, w, h = CROP[crop]
        vf = f"crop={w}:{h}:{x}:{y},scale={width}:-2"
        src = OBS[screen]
    else:   # la columna de resultats de YouTube, a 16:9 (sense la barra lateral ni la capçalera)
        vf = "crop=1300:731:440:60,scale=1920:1080"
        src = YT[screen]
    if still:
        out = out_dir / f"{cid}.png"
        if not out.exists():
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{from_s:.3f}", "-i", str(src), "-frames:v", "1", "-vf", vf,
                            str(out)], check=True)
    else:
        out = out_dir / f"{cid}.mp4"
        if not out.exists():
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{from_s:.3f}", "-i", str(src), "-t", f"{dur * speed + 0.6:.3f}",
                            "-vf", f"{vf},setpts=PTS/{speed},fps={FPS}", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "16",
                            "-g", "15", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709",
                            "-colorspace", "bt709", "-movflags", "+faststart", str(out)], check=True)
    dst = GFX / "assets/captures" / out.name
    dst.parent.mkdir(parents=True, exist_ok=True)
    if not dst.exists():
        dst.write_bytes(out.read_bytes())
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0",
                        str(out)], capture_output=True, text=True).stdout.strip().split(",")
    return f"assets/captures/{out.name}", int(r[0]) / int(r[1])


# ---------- HTML ----------
HEAD = """<!doctype html>
<html lang="es"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=1920, height=1080"/>
<title>{title}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script src="hf-anim.js"></script>
<style>
@font-face{{font-family:'Inter';src:url('assets/Inter-Black.otf') format('opentype');font-weight:900;}}
@font-face{{font-family:'Inter';src:url('assets/Inter-Bold.otf') format('opentype');font-weight:700;}}
@font-face{{font-family:'Inter';src:url('assets/Inter-Regular.otf') format('opentype');font-weight:400;}}
@font-face{{font-family:'Playfair Display';src:url('assets/PlayfairDisplay-Italic-VF.ttf') format('truetype');font-weight:400 900;font-style:italic;}}
@font-face{{font-family:'Plex Mono';src:url('assets/IBMPlexMono-Bold.ttf') format('truetype');font-weight:700;}}
*{{margin:0;padding:0;box-sizing:border-box;}}
:root{{--royal:#1e48ff;--sky:#57c9f0;--txt:#e8f0ff;--muted:#8fa6d4;--green:#2ff58a;--red:#ff4d5e;--ink:#0a1435;
  --amber:#ffa12e;--lav:#a58fff;--pink:#f2478f;--teal:#2fb7c9;--orange:#d97757;}}
#root{{position:relative;width:1920px;height:1080px;overflow:hidden;font-family:'Inter',sans-serif;}}
#float{{position:absolute;inset:0;will-change:transform;}}
.cam{{position:absolute;inset:0;will-change:transform;}}
{css}
</style></head>
<body style="margin:0;background:#000;">
<div id="root" data-composition-id="main" data-width="1920" data-height="1080" data-start="0" data-duration="{dur:.5f}">
{body}
</div>
<script>
{script}
</script></body></html>
"""

# The two locked fields (backgrounds/README.md): bg-light, and bg-dark (near-black, the 90 px royal grid, a centre light).
LIGHT = """#base{position:absolute;inset:0;background:radial-gradient(ellipse 120% 95% at 50% 42%, #f2f3f6 0%, #e8eaef 55%, #dde0e7 100%);}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse 78% 72% at 50% 50%, rgba(16,24,50,0) 22%, rgba(16,24,50,0.05) 40%, rgba(16,24,50,0.12) 54%, rgba(16,24,50,0.22) 66%, rgba(16,24,50,0.33) 77%, rgba(16,24,50,0.44) 88%, rgba(16,24,50,0.55) 100%);}"""
DARK = """#base{position:absolute;inset:0;background:#010102;}
#grid{position:absolute;inset:0;background-image:linear-gradient(rgba(74,124,255,0.17) 1px,transparent 1px),linear-gradient(90deg,rgba(74,124,255,0.17) 1px,transparent 1px);
  background-size:90px 90px;background-position:-15px -45px;-webkit-mask:radial-gradient(ellipse 75% 70% at 50% 46%,#000 30%,transparent 92%);mask:radial-gradient(ellipse 75% 70% at 50% 46%,#000 30%,transparent 92%);}
#lift{position:absolute;inset:0;background:radial-gradient(ellipse 48% 44% at 50% 44%, rgba(30,72,255,0.30) 0%, rgba(30,72,255,0.10) 45%, rgba(1,1,2,0) 75%);}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%);}"""
FIELD = {"light": '<div id="base"></div><div id="vig"></div>', "dark": '<div id="base"></div><div id="grid"></div><div id="lift"></div><div id="vig"></div>'}
# THE CORNER CAM's box (README § Recording sections, 1080 frame): 300x300, 30 px off the bottom-right. Nothing a graphic is
# there to show sits under it.
PIP = (1590, 750, 300, 300)


def page(cid, title, dur, field, css, body, script):
    html = HEAD.format(title=escape(title), dur=dur, css=(LIGHT if field == "light" else DARK) + "\n" + css,
                       body=FIELD[field] + "\n" + body, script=script)
    p = GFX / "compositions" / f"{cid}.html"
    p.write_text(html, encoding="utf-8")
    return p


def js_init(dur, step=False, extra=""):
    return (f"const DUR = {dur:.5f};\nconst H = HF.init({{fps: {FPS}, dur: DUR{', stepFps: 12' if step else ''}}});\n"
            "const {tl, F, SF, pop, slam, riseIn, riseOut, exit, slideIn, slideOut, float, camera, arrow, drawOn, countUp, reveal} = H;\n" + extra)
