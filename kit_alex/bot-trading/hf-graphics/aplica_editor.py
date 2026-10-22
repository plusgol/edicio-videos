#!/usr/bin/env python3
"""aplica_editor.py — applies what the creator changed in the editor page (db doc `editor/edits`) to this job:

  python3 aplica_editor.py <edits.json>      # the doc as ArtifactData returns it (or just its body)

  · cuts      -> transcript/cuts.json (each segment by its key «take@start»: start/end moved, or the segment dropped);
                 a backup goes to transcript/cuts.pre-editor-<n>.json and /tmp/video-editor/<job>/cuts.json is synced
  · graphics  -> hf-graphics/edits.json «graphics» (build_bot.py: off, dStart, dEnd); a new text is printed, applied by hand
  · sounds    -> hf-graphics/edits.json «sfx», «sfxGain» (sfx_tame.py: mute, db, and the gain on every sound)
Prints what changed and which steps must run again (splice when a cut changed).
"""
import json
import shutil
import sys
from pathlib import Path

HF = Path(__file__).parent
JOB = HF.parent
doc = json.loads(Path(sys.argv[1]).read_text())
doc = doc.get("data", doc) if isinstance(doc.get("data"), dict) else doc
cuts_e, gfx_e, sfx_e, gain = doc.get("cuts", {}), doc.get("graphics", {}), doc.get("sfx", {}), doc.get("sfxGain", 0)

out, manual = [], []
cp = JOB / "transcript/cuts.json"
c = json.loads(cp.read_text())
segs = c if isinstance(c, list) else c["segments"]
if cuts_e:
    n = len(list((JOB / "transcript").glob("cuts.pre-editor-*.json")))
    shutil.copy(cp, JOB / f"transcript/cuts.pre-editor-{n}.json")
    keep = []
    for s in segs:
        key = f"{s['clip'].removesuffix('.mov')}@{s['start']:.3f}"
        e = cuts_e.get(key)
        if not e:
            keep.append(s)
            continue
        if e.get("drop"):
            out.append(f"tall fora: {key} «{s.get('transcript', '')[:60]}»")
            continue
        a, b = s["start"] + e.get("dIn", 0), s["end"] + e.get("dOut", 0)
        if b - a < 0.2:
            manual.append(f"tall {key}: inici {a:.2f} / final {b:.2f} no deixa res; no l'aplico")
            keep.append(s)
            continue
        out.append(f"tall {key}: {s['start']:.2f}–{s['end']:.2f} → {a:.2f}–{b:.2f}")
        s["start"], s["end"] = round(max(0.0, a), 3), round(b, 3)
        s["no_refine"] = True     # the creator placed this edge by ear: never moved again by refine/polish
        s["editor"] = True
        keep.append(s)
    if isinstance(c, list):
        c = keep
    else:
        c["segments"] = keep
    cp.write_text(json.dumps(c, ensure_ascii=False, indent=1))
    tmp = Path("/tmp/video-editor") / JOB.name
    if tmp.exists():
        shutil.copy(cp, tmp / "cuts.json")

ep = HF / "edits.json"
edits = json.loads(ep.read_text()) if ep.exists() else {}
g = edits.setdefault("graphics", {})
for k, e in gfx_e.items():
    g[k] = {**g.get(k, {}), **{x: e[x] for x in ("off", "dStart", "dEnd") if e.get(x)}}
    if e.get("off"):
        out.append(f"gràfic fora: {k}")
    if e.get("dStart") or e.get("dEnd"):
        out.append(f"gràfic {k}: entra {e.get('dStart', 0):+.1f} s, surt {e.get('dEnd', 0):+.1f} s")
    if (e.get("text") or "").strip():
        manual.append(f"gràfic {k}: text nou / contingut «{e['text'].strip()}»")
s = edits.setdefault("sfx", {})
plan_rows = {r["id"]: r for r in json.loads((HF / "sfx-plan.json").read_text())}
gstart = {r["id"]: r["start"] for r in json.loads((HF / "placement.json").read_text())}
for k, e in sfx_e.items():
    if "|" in k:                     # the editor already names a sound «graphic|event|seconds into the graphic»
        key = k
    else:
        r = plan_rows.get(k)
        if not r:
            manual.append(f"so {k}: ja no és al pla; no l'aplico")
            continue
        key = f"{r['gid']}|{r['event']}|{r['at'] - gstart.get(r['gid'], 0):.2f}"   # stable across re-plans (ids are not)
    s[key] = {**s.get(key, {}), **e}
    what = "silenciat" if e.get("mute") else " ".join(x for x in ("que soni" if e.get("on") else "", f"{e['db']:+d} dB" if e.get("db") else "") if x)
    out.append(f"so {key}: {what}")
if gain:
    edits["sfxGain"] = edits.get("sfxGain", 0) + gain
    out.append(f"volum de tots els efectes {gain:+d} dB")
ep.write_text(json.dumps(edits, ensure_ascii=False, indent=1))

print("\n".join(out) or "cap canvi automàtic")
if manual:
    print("\nA MÀ:\n" + "\n".join(manual))
print("\nPASSOS:", "splice → base → corner cams → build → renders → placement → assemble → sfx → mix" if cuts_e else
      ("build → renders → placement → assemble → sfx → mix" if gfx_e else "sfx → mix"))
