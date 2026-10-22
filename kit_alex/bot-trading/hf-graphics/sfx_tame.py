#!/usr/bin/env python3
"""sfx_tame.py — the creator's call on the kit's SFX plan (2026-10-21: «massa soroll, repeteixes moltíssim i satura»).
Runs after workflows/sfx-plan.py; keeps its rows and format, drops and lowers:

  · text animations: one scissors, on the key word (never one per word)
  · every graphic: its cut-in whoosh, plus its two strongest sounds of its own (payoff/slam/countUp > pop > drawOn > ...)
  · a run of screen recordings butt-joined (the VO F stills): one whoosh opens the run, not one per still
  · no two sounds closer than 0.35 s, and never the same file twice within 1.2 s
  · whooshes −2 dB, markers −3 dB, the rest −1 dB
  · edits.json (the editor's «so» rows, by «graphic|event|seconds into the graphic»): on, mute, a level offset; sfxGain on all

  python3 sfx_tame.py            # hf-graphics/sfx-plan.json (the kit's copy kept as sfx-plan.kit.json)
"""
import json
from pathlib import Path

HF = Path(__file__).parent
kit = HF / "sfx-plan.kit.json"
src = HF / "sfx-plan.json"
mark = HF / "sfx-plan.tamed.sha1"          # the hash of this script's own last output
import hashlib
cur = hashlib.sha1(src.read_bytes()).hexdigest()
if not kit.exists() or not (mark.exists() and mark.read_text().strip() == cur):
    kit.write_text(src.read_text())          # sfx-plan.json is a fresh kit plan (not our output): it becomes the kept copy
rows = json.loads(kit.read_text())
plan = {c["id"]: c for c in json.load(open(HF.parent / "graphics-plan.json"))["beats"]}
place = sorted(json.load(open(HF / "placement.json")), key=lambda r: r["start"])
edits = json.loads((HF / "edits.json").read_text()) if (HF / "edits.json").exists() else {}

PRIO = {"title-card": 9, "payoff": 8, "word-slam": 7, "slam": 7, "countUp": 6, "emphasis": 6, "pop": 5, "drawOn": 4,
        "highlighter": 4, "riseIn": 3, "word": 2, "cut-in": 1}
GAIN = {"whoosh": -2, "marker": -3}          # everything else −1 (2026-10-21, second pass: «ara n'hi ha pocs»)
OWN = 2                                       # sounds of a graphic's own, besides its cut-in
GAP, SAME = 0.35, 1.2                          # s between any two sounds; s before the same file again

fulls = [r for r in place if r.get("kind") == "full"]
chained = set()                               # a recording butt-joined to a recording (the VO F run): one whoosh opens the run
for a, b in zip(fulls, fulls[1:]):
    if b["start"] - a["end"] < 0.5 and a["id"].startswith("r-") and b["id"].startswith("r-"):
        chained.add(b["id"])


def skey(r):
    g = next((p["start"] for p in place if p["id"] == r["gid"]), 0)
    return f"{r['gid']}|{r['event']}|{r['at'] - g:.2f}"


ed_sfx = edits.get("sfx", {})
keep = []
by_gid = {}
for r in rows:
    by_gid.setdefault(r["gid"], []).append(r)
for gid, rs in by_gid.items():
    if gid.startswith("ta-"):                 # a text animation: one scissors, on its key word (the slam word, else the last)
        em = [r for r in rs if r["event"] in ("word", "word-slam", "emphasis")]
        if em:
            keep.append(dict(em[-1], event="word", file=next((r["file"] for r in rs if r["event"] == "word"), em[-1]["file"]))
                        if "Impact" in em[-1]["file"] and any(r["event"] == "word" for r in rs) else em[-1])
        continue
    cut = [r for r in rs if r["event"] == "cut-in"]
    if cut and gid not in chained:
        keep.append(cut[0])
    own = sorted([r for r in rs if r["event"] != "cut-in"], key=lambda r: (-PRIO.get(r["event"], 0), r["at"]))
    keep += own[:OWN]

forced = [r for r in rows if ed_sfx.get(skey(r), {}).get("on")]
keep = [r for r in keep if not ed_sfx.get(skey(r), {}).get("mute")]
keep.sort(key=lambda r: r["at"])
out = []
for r in keep:
    clash = [o for o in out if r["at"] - o["at"] < GAP or (o["file"] == r["file"] and r["at"] - o["at"] < SAME)]
    if clash:
        o = clash[-1]
        if PRIO.get(r["event"], 0) > PRIO.get(o["event"], 0):
            out.remove(o)
        else:
            continue
    out.append(r)
for r in forced:                              # the creator switched it on in the editor: it plays, whatever the rules say
    if r not in out:
        out.append(r)
out.sort(key=lambda r: r["at"])
for r in out:
    r["level_db"] = r["level_db"] + GAIN.get(r.get("cls"), -1) + edits.get("sfxGain", 0)
    e = ed_sfx.get(skey(r))
    if e:
        r["level_db"] += e.get("db", 0)
src.write_text(json.dumps(out, ensure_ascii=False, indent=1))
mark.write_text(hashlib.sha1(src.read_bytes()).hexdigest())
print(f"{len(rows)} → {len(out)} sounds")
import collections
print(dict(collections.Counter(r["event"] for r in out)))
