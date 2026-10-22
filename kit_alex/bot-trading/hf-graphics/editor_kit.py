#!/usr/bin/env python3
"""editor_kit.py — the data and media of the creator's editor (the artifact page editor.html):

  python3 editor_kit.py <out dir>

writes <out>/data/editor.json (the cut list on the timeline, the words of every camera take, the voice-over text,
the placed graphics, the sounds), <out>/takes/<take>.mp4 (each camera take, light, with its sound: to see and hear a cut's edges)
and <out>/sfx/<n>.mp3 (each effect's slice, to audition it). The video itself is the HLS of the final render.
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import lib_bot as L  # noqa: E402

out = Path(sys.argv[1])
(out / "data").mkdir(parents=True, exist_ok=True)
(out / "sfx").mkdir(exist_ok=True)
CAM = ["cam-prompt.mov", "cam-truco.mov", "cam-24h.mov", "cam-calle.mov"]
TAKE = {"cam-prompt.mov": "Presa 1 · el prompt", "cam-truco.mov": "Presa 2 · el truc", "cam-24h.mov": "Presa 3 · 24 h després",
        "cam-calle.mov": "Presa 4 · al carrer", "vo-provisional.mov": "Veu en off (provisional)", "pausa-titulos.mov": "Títol de secció"}

edl = {r["id"]: r for r in json.load(open(L.SRC / "edl.json"))["ranges"]}
segs = []
for i, s in enumerate(L.SEGS):
    rid = s.get("_range", "")
    text = s.get("transcript") or ""
    if s["clip"] == "vo-provisional.mov":
        text = edl.get(rid, {}).get("captions", "") or text
    segs.append({"key": f"{s['clip'].removesuffix('.mov')}@{s['start']:.3f}", "clip": s["clip"].removesuffix(".mov"),
                 "a": round(s["start"], 3), "b": round(s["end"], 3), "t0": round(s["t0"], 3), "t1": round(s["t1"], 3),
                 "range": rid, "text": text})

words = {}
for c in json.load(open(L.JOB / "transcript/words.json"))["clips"]:
    if c["clip"] in CAM:
        words[c["clip"].removesuffix(".mov")] = [[w["w"], round(w["start"], 3), round(w["end"], 3)] for w in c["words"]]

KIND = {"text-animation": "text", "screen-rec": "rec", "punch-cut": "full", "scene": "full", "title-card": "title", "overlay": "cam"}
gfx = []
for c in json.load(open(L.JOB / "graphics-plan.json"))["beats"]:
    k = "cam" if c["id"].startswith("pip-") else ("title" if c["id"].startswith("t-") else KIND.get(c.get("kind"), c.get("kind")))
    label = c.get("copy") or c.get("shows") or c.get("line") or ""
    gfx.append({"id": c["id"], "kind": k, "start": round(c["start"], 3), "end": round(c["end"], 3), "label": label,
                "line": c.get("line", ""), "reason": c.get("reason", "")})
place = {r["id"]: r for r in json.load(open(L.HF / "placement.json"))}
for g in gfx:                       # what actually plays: the placed in/out
    if g["id"] in place:
        g["start"], g["end"] = round(place[g["id"]]["start"], 3), round(place[g["id"]]["end"], 3)
titles = json.load(open(L.HF / "titles/titles.json"))
for g in gfx:
    if g["kind"] == "title" and g["id"] in titles:
        g["label"] = " · ".join(titles[g["id"]]["lines"])

sfx, files = [], {}
gs = {r["id"]: r["start"] for r in json.load(open(L.HF / "placement.json"))}
skey = lambda r: f"{r['gid']}|{r['event']}|{r['at'] - gs.get(r['gid'], 0):.2f}"
playing = {skey(r): r for r in json.load(open(L.HF / "sfx-plan.json"))}
for r in json.load(open(L.HF / "sfx-plan.kit.json")):
    f = r["file"]
    key = (f, round(r["src_in"], 3), round(r["src_out"], 3))
    if key not in files:
        n = f"s{len(files):02d}"
        files[key] = n
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{r['src_in']:.3f}", "-to", f"{r['src_out']:.3f}", "-i", f,
                        "-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "96k", str(out / "sfx" / f"{n}.mp3")], check=True)
    k = skey(r)
    on = playing.get(k)
    sfx.append({"id": k, "gid": r["gid"], "at": round(r["at"], 3), "event": r["event"], "cls": r.get("cls", ""),
                "file": Path(f).stem, "db": (on or r)["level_db"], "sample": files[key], "on": bool(on)})

(out / "takes").mkdir(exist_ok=True)
for c in CAM:
    src = L.JOB / "raw" / c
    dst = out / "takes" / f"{c.removesuffix('.mov')}.mp4"
    if dst.exists() and dst.stat().st_mtime > src.stat().st_mtime:
        continue
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)],
                               capture_output=True, text=True).stdout)
    vk = int(min(700, 14.5e6 * 8 / dur / 1000 - 56))          # the artifact serves files up to 16 MB
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf", "scale=640:-2,fps=30", "-c:v", "libx264", "-preset", "slow",
                    "-b:v", f"{vk}k", "-maxrate", f"{vk * 6 // 5}k", "-bufsize", f"{vk * 2}k", "-g", "15", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "48k", "-ac", "1", "-movflags", "+faststart", str(dst)], check=True)

chap = [{"t": 0, "name": "Intro"}]
names = {"I": "I · El prompt", "II": "II · El truc", "III": "III · Comptes de fondeig", "IV": "IV · Backtesting",
         "V": "V · 24 hores després", "VI": "VI · Així funciona"}
for s in L.SEGS:
    if s.get("_range", "").startswith("titulo-"):
        chap.append({"t": round(s["t0"], 2), "name": names[s["_range"].split("-", 1)[1]]})
chap.append({"t": round(L.span("e1")[0], 2), "name": "Final"})
data = {"duration": round(L.DURATION, 3), "fps": L.FPS, "takes": {k.removesuffix(".mov"): v for k, v in TAKE.items()},
        "segs": segs, "words": words, "graphics": gfx, "sfx": sfx, "chapters": chap}
(out / "data/editor.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
print(f"{len(segs)} cuts · {len(gfx)} graphics · {len(sfx)} sounds, {sum(x['on'] for x in sfx)} on ({len(files)} samples) · {sum(len(v) for v in words.values())} words")
