#!/usr/bin/env python3
"""Evidence frames for the edit-review round off the assembled render (chat-only lane):
per graphic in+2, mid, out-2, plus +2/+4 after each registry call/box start; a contact sheet per graphic."""
import json, re, subprocess, sys
from pathlib import Path
JOB = Path(sys.argv[1]); RENDER = Path(sys.argv[2]); FPS = 30
OUT = JOB / "hf-graphics/review/round1"; (OUT / "frames").mkdir(parents=True, exist_ok=True); (OUT / "sheets").mkdir(exist_ok=True)
rows = json.load(open(JOB / "hf-graphics/placement.json"))
want = {}  # frame -> [(id, why)]
def add(fr, gid, why): want.setdefault(int(fr), []).append((gid, why))
calls = re.compile(r"(riseIn|riseOut|pop|slam|drawOn|countUp|reveal|slideIn|exit)\(\s*'[^']*'\s*,\s*([0-9.]+)")
boxes = re.compile(r"tl.set\('#(?:bx\d+ \.t|hl\d+)', \{opacity: [0-9.]+\}, ([0-9.]+)\)")
for r in rows:
    a, b = round(r["start"] * FPS), round(r["end"] * FPS)
    add(a + 2, r["id"], "in+2"); add((a + b) // 2, r["id"], "mid"); add(b - 2, r["id"], "out-2")
    comp = next((p for p in (JOB / "hf-graphics").glob(f"*/compositions/{r['id']}.html")), None)
    if comp and not r["id"].startswith("pip-"):
        h = comp.read_text()
        ts = sorted({float(m.group(2)) for m in calls.finditer(h)} | {float(m.group(1)) for m in boxes.finditer(h)})
        for t in ts:
            f = a + round(t * FPS)
            for k in (2, 4):
                if a <= f + k < b: add(f + k, r["id"], f"call@{t:.2f}+{k}")
frames = sorted(want)
sel = "+".join(f"eq(n\\,{f})" for f in frames)
tmp = OUT / "frames/_%05d.jpg"
gf = OUT / "select.txt"; gf.write_text(f"select='{sel}',scale=960:-2")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(RENDER), "-filter_script:v", str(gf), "-vsync", "0", "-q:v", "3", str(tmp)], check=True)
got = sorted((OUT / "frames").glob("_*.jpg"))
assert len(got) == len(frames), (len(got), len(frames))
idx = ["# Round 1 evidence (chat-only: ffmpeg frames off hf-graphics/renders/final.mp4, 960 px wide)", "", "frame file · timeline s · graphic · why", ""]
per = {}
for f, p in zip(frames, got):
    name = f"f{f:05d}.jpg"; p.rename(OUT / "frames" / name)
    for gid, why in want[f]:
        per.setdefault(gid, []).append(name); idx.append(f"{name} · {f / FPS:.3f} · {gid} · {why}")
(OUT / "INDEX.md").write_text("\n".join(idx) + "\n")
for gid, names in per.items():
    names = list(dict.fromkeys(names))[:12]
    cols = min(3, len(names)); rows_n = -(-len(names) // cols)
    ins = sum([["-i", str(OUT / "frames" / n)] for n in names], [])
    lay = "|".join(f"{(i % cols)}*960_{(i // cols)}*540".replace("0*960", "0").replace("_0*540", "_0") for i in range(len(names)))
    lay = "|".join(f"{'0' if i % cols == 0 else '+'.join(['w0'] * (i % cols))}_{'0' if i // cols == 0 else '+'.join(['h0'] * (i // cols))}" for i in range(len(names)))
    if len(names) == 1:
        subprocess.run(["cp", str(OUT / "frames" / names[0]), str(OUT / "sheets" / f"{gid}.jpg")]); continue
    subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", f"xstack=inputs={len(names)}:layout={lay}:fill=black", str(OUT / "sheets" / f"{gid}.jpg")], check=True)
print(len(frames), "frames,", len(per), "sheets ->", OUT)
