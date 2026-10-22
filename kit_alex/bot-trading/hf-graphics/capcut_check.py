#!/usr/bin/env python3
"""capcut_check.py <draft folder> — replays the CapCut draft's picture without CapCut: at sample instants it finds the
top opaque layer (a full-screen graphic, else the main track's cut), grabs that frame from the draft's own media at the
draft's source time and compares it with the same instant of the final render (mean abs diff on a 160x90 grey frame).
Instants under a text animation or a push-in are skipped (an overlay or a move the draft does not carry on that layer)."""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
import lib_bot as L  # noqa: E402

FOLDER = Path(sys.argv[1])
PH = "##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##"
d = json.loads((FOLDER / "draft_info.json").read_text())
mat = {m["id"]: m["path"].replace(PH, str(FOLDER)) for m in d["materials"]["videos"]}
master = L.JOB / "outputs" / f"{L.JOB.name}.final.mp4"
place = json.load(open(L.HF / "placement.json"))
texts = [(r["start"], r["end"]) for r in place if r.get("kind") == "text"]
plan = json.load(open(L.JOB / "graphics-plan.json"))["beats"]
pushes = [(c["start"], c["start"] + 2.5) for c in plan if c.get("push_in")]


def frame(path, t):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{max(0, t):.4f}", "-i", path, "-frames:v", "1", "-vf",
                          "scale=160:90,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).astype(float) if len(raw) == 160 * 90 else None


def top(t):
    us = t * 1e6
    for tr in sorted([x for x in d["tracks"] if x["type"] == "video"], key=lambda x: -max([s.get("track_render_index", 0) for s in x["segments"]] or [0])):
        for s in tr["segments"]:
            a, n = s["target_timerange"]["start"], s["target_timerange"]["duration"]
            if a <= us < a + n and not mat[s["material_id"]].endswith(".mov"):
                return mat[s["material_id"]], (s["source_timerange"]["start"] + us - a) / 1e6
    return None, None


bad, n = [], 0
for t in np.arange(0.5, L.DURATION - 0.5, 2.37):
    if any(a - 0.1 <= t <= b + 0.1 for a, b in texts + pushes):
        continue
    p, st = top(float(t))
    if p is None:
        bad.append((t, "nothing on screen"))
        continue
    a, b = frame(p, st), frame(str(master), float(t))
    if a is None or b is None:
        bad.append((t, "no frame"))
        continue
    n += 1
    diff = float(np.abs(a - b).mean())
    if diff > 12:
        bad.append((round(float(t), 2), f"{Path(p).name}@{st:.2f} diff {diff:.1f}"))
print(f"{n} instants compared, {len(bad)} off")
for x in bad:
    print("  ", x)
