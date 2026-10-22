#!/usr/bin/env python3
"""capcut_draft.py <media dir> <draft folder> — the creator's CapCut project of this job, every piece its own clip:

  main track        the cut: each kept stretch of a camera take (the WHOLE take is in the folder, so a cut trims
                    either way), and black for the voice-over and title gaps (CapCut's main track is magnetic)
  overlay layer 1   every full-screen graphic, as it plays in the final (corner cam included)
  overlay layer 2   every text animation (ProRes 4444, premultiplied)
  audio tracks      every sound effect, at its level

The draft is the kit bridge's own (lanes/capcut/capcut-bridge.py build_draft, video_material, segment, meta_entry:
validated on CapCut 8.9 macOS / 9.5 Windows); the audio segments follow pyCapCut's audio material. Media paths use
CapCut's draft-folder placeholder, so the folder can be copied into any machine's CapCut drafts folder.
"""
import importlib.util
import json
import subprocess
import sys
import time
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import lib_bot as L  # noqa: E402

MEDIA, FOLDER = Path(sys.argv[1]), Path(sys.argv[2])
NAME = FOLDER.name
import types
for _m in ("ApplicationServices", "Quartz"):        # the bridge's live (macOS AX) lane; only its file lane is used here
    _stub = types.ModuleType(_m)
    _stub.__getattr__ = lambda name: None
    sys.modules.setdefault(_m, _stub)
spec = importlib.util.spec_from_file_location("bridge", L.JOB.parents[1] / "lanes/capcut/capcut-bridge.py")
B = importlib.util.module_from_spec(spec)
spec.loader.exec_module(B)
PH = "##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##"
FR = 30.0
F = lambda s: int(round(s * FR))                 # seconds -> frame
US = lambda n: int(n * 1e6 / FR)                 # frames -> µs, CapCut's arithmetic
rel = lambda p: Path(p).relative_to(MEDIA).as_posix()

TAKES = {"cam-truco": "preses2/cam-truco.mp4", "cam-prompt": "preses1/cam-prompt.mp4",
         "cam-24h": "preses1/cam-24h.mp4", "cam-calle": "preses1/cam-calle.mp4"}
clips = {k: MEDIA / v for k, v in TAKES.items()}
clips["negre"] = MEDIA / "negre.mp4"
segs = []
for s in L.SEGS:
    c = s["clip"].removesuffix(".mov")
    if c in TAKES:
        segs.append({"clip": c, "start": s["start"], "end": s["end"]})
    else:                                        # the voice-over (still provisional) and the title gaps: black
        segs.append({"clip": "negre", "start": 0.0, "end": F(s["t1"]) / FR - F(s["t0"]) / FR})
draft, *_ = B.build_draft(NAME, clips, {"segments": segs}, 1920, 1080, fps=FR)
mats = draft["materials"]
for m in mats["videos"]:                         # every path inside the draft folder, by CapCut's own placeholder
    m["path"] = f"{PH}/{rel(m['path'])}"
assert draft["duration"] == US(F(L.DURATION)) or abs(draft["duration"] - L.DURATION * 1e6) < 1e5, (draft["duration"], L.DURATION)


def video_mat(path):
    w, h, dur, has_audio = B.probe(path)
    mid = B.uid()
    mats["videos"].append(B.video_material(mid, f"{PH}/{rel(path)}", w, h, dur, has_audio))
    mats["videos"][-1]["material_name"] = Path(path).name
    return mid, dur


def overlay(level, rows):
    t = {"id": B.uid(), "type": "video", "segments": [], "flag": 2, "attribute": 0, "name": "", "is_default_name": True}
    for path, t0, t1 in rows:
        mid, dur = video_mat(path)
        n = min(F(t1) - F(t0), int(dur * FR / 1e6))
        seg = B.segment(mid, 0, US(n), US(F(t0)), B.segment_extras(mats))
        seg["render_index"] = seg["track_render_index"] = level
        seg["volume"] = seg["last_nonzero_volume"] = 0.0
        t["segments"].append(seg)
    draft["tracks"].append(t)
    return len(t["segments"])


place = sorted(json.load(open(L.HF / "placement.json")), key=lambda r: r["start"])
fulls = [r for r in place if r.get("kind") == "full"]
n_full = overlay(1, [(MEDIA / "grafics" / f"{r['id']}.mp4", r["start"], r["end"]) for r in fulls])
texts = []
for r in place:
    if r.get("kind") != "text":
        continue
    end = r["end"]
    for f in fulls:                              # under a full-screen in the final: the full-screen is its exit here too
        if f["start"] > r["start"] and f["start"] < end:
            end = f["start"]
    texts.append((MEDIA / "textos" / f"{r['id']}.mov", r["start"], end))
n_text = overlay(2, texts)

# ---- the sound effects: one audio material per file, segments spread over as few tracks as never overlap
index = json.load(open(MEDIA / "sons" / "_index.json"))
amat = {}
tracks = []
for r in sorted(json.load(open(L.HF / "sfx-plan.json")), key=lambda r: r["at"]):
    name = index[f"{r['file']}|{round(r['src_in'], 3)}|{round(r['src_out'], 3)}"]
    path = MEDIA / "sons" / name
    if name not in amat:
        dur = int(float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of",
                                                 "csv=p=0", str(path)]).decode()) * 1e6)
        mid = uuid.uuid4().hex
        mats["audios"].append({"app_id": 0, "category_id": "", "category_name": "local", "check_flag": 3,
                               "copyright_limit_type": "none", "duration": dur, "effect_id": "", "formula_id": "",
                               "id": mid, "local_material_id": mid, "music_id": mid, "name": name,
                               "path": f"{PH}/sons/{name}", "source_platform": 0, "type": "extract_music",
                               "wave_points": []})
        amat[name] = (mid, dur)
    mid, dur = amat[name]
    t0 = US(F(max(0.0, r["at"])))
    d = min(dur, US(F(dur / 1e6)) or dur)
    tr = next((t for t in tracks if t["_end"] <= t0), None)
    if tr is None:
        tr = {"id": B.uid(), "type": "audio", "segments": [], "flag": 0, "attribute": 0, "name": "", "is_default_name": True, "_end": 0}
        tracks.append(tr)
    sp = B.uid()
    mats["speeds"].append({"id": sp, "type": "speed", "mode": 0, "speed": 1.0, "curve_speed": None})
    tr["segments"].append({
        "id": B.uid(), "material_id": mid, "source_timerange": {"start": 0, "duration": d},
        "target_timerange": {"start": t0, "duration": d}, "render_timerange": {"start": 0, "duration": 0},
        "speed": 1.0, "volume": round(10 ** (r["level_db"] / 20), 4), "last_nonzero_volume": round(10 ** (r["level_db"] / 20), 4),
        "extra_material_refs": [sp], "clip": None, "hdr_settings": None, "uniform_scale": None, "render_index": 0,
        "track_render_index": 0, "track_attribute": 0, "visible": True, "reverse": False, "is_tone_modify": False,
        "enable_adjust": True, "enable_color_correct_adjust": False, "enable_color_curves": True,
        "enable_color_match_adjust": False, "enable_color_wheels": True, "enable_lut": True, "enable_smart_color_adjust": False,
        "common_keyframes": [], "keyframe_refs": [], "desc": "", "state": 0, "is_loop": False, "intensifies_audio": False,
        "cartoon": False, "group_id": "", "source": "segmentsourcenormal"})
    tr["_end"] = t0 + d
for t in tracks:
    t.pop("_end")
    draft["tracks"].append(t)

# ---- the folder: the draft (both platforms' file names), its meta, a cover
FOLDER.mkdir(parents=True, exist_ok=True)
body = json.dumps(draft, ensure_ascii=False, separators=(",", ":"))
for f in ("draft_info.json", "draft_content.json"):     # macOS reads the first, Windows the second
    (FOLDER / f).write_text(body, encoding="utf-8")
now_us = time.time_ns() // 1000
bin_media = []
for k, v in TAKES.items():
    w, h, dur, _ = B.probe(MEDIA / v)
    bin_media.append((f"{PH}/{v}", dur, w, h))
meta = B.meta_entry(NAME, FOLDER, B.uid(), bin_media, draft["duration"], now_us)
meta["draft_fold_path"] = ""
meta["draft_root_path"] = ""
(FOLDER / "draft_meta_info.json").write_text(json.dumps(meta, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "40", "-i", str(L.JOB / "outputs" / f"{L.JOB.name}.final.mp4"),
                "-frames:v", "1", "-vf", "scale=480:-2", str(FOLDER / "draft_cover.jpg")], check=True)
main = draft["tracks"][0]["segments"]
print(f"'{NAME}': {len(main)} cuts on the main track, {n_full} full-screen graphics, {n_text} text animations, "
      f"{sum(len(t['segments']) for t in tracks)} sounds on {len(tracks)} audio tracks, {draft['duration'] / 1e6:.2f} s")
