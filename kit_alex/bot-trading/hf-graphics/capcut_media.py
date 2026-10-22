#!/usr/bin/env python3
"""capcut_media.py <out> — the media of the creator's CapCut project, laid out as it sits inside the draft folder:

  preses1/  preses2/   each camera take WHOLE (so every cut can be trimmed either way), graded like the base
                       (Autumn-Rec709 at 80 % + saturation 1.20) and its voice at the splice's gain into the −6 dBFS limiter
  grafics/<id>.mp4     every full-screen graphic exactly as it plays in the final (corner cam and overlaps included)
  textos/<id>.mov      every text animation, ProRes 4444 PREMULTIPLIED (CapCut reads alpha premultiplied: lab notes)
  sons/<n>.wav         every sound effect's slice
  negre.mp4            black + silence, the voice-over and title gaps (the main track is magnetic: no holes)
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import lib_bot as L  # noqa: E402

OUT = Path(sys.argv[1])
KIT = L.JOB.parents[1]
LUT = KIT / "assets/luts/rec709/Autumn-Rec709.cube"
for d in ("preses1", "preses2", "grafics", "textos", "sons"):
    (OUT / d).mkdir(parents=True, exist_ok=True)
run = lambda *a: subprocess.run(["ffmpeg", "-v", "error", "-y", *a], check=True, stdin=subprocess.DEVNULL)
AMP = 5.0   # the splice's measured voice gain (RUN.md step 3: +5 dB, kept speech -21.9 -> -17 LUFS)
TAKES = {"cam-truco": "preses2", "cam-prompt": "preses1", "cam-24h": "preses1", "cam-calle": "preses1"}
grade = (f"split[o][g];[g]lut3d=file='{LUT}':interp=tetrahedral[l];[l][o]blend=all_mode=normal:all_opacity=0.80,"
         "eq=saturation=1.20,format=yuv420p")
what = sys.argv[2] if len(sys.argv) > 2 else "all"

if what in ("all", "preses"):
    for t, d in TAKES.items():
        dst = OUT / d / f"{t}.mp4"
        if dst.exists():
            continue
        run("-i", str(L.JOB / "raw" / f"{t}.mov"), "-filter_complex", f"[0:v]{grade}[v]", "-map", "[v]", "-map", "0:a",
            "-af", f"volume={AMP}dB,alimiter=limit=0.501:level=disabled,aresample=48000", "-ac", "2",
            "-c:v", "libx264", "-preset", "medium", "-b:v", "7500k", "-maxrate", "10000k", "-bufsize", "15000k", "-g", "30",
            "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(dst))
        print("take", dst.name)

if what in ("all", "rest"):
    run("-f", "lavfi", "-i", "color=c=black:s=1920x1080:r=30:d=200", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
        "-t", "200", "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "64k",
        "-shortest", str(OUT / "negre.mp4"))
    master = L.JOB / "outputs" / f"{L.JOB.name}.final.mp4"
    rows = json.load(open(L.HF / "placement.json"))
    for r in rows:
        if r.get("kind") == "full":
            dst = OUT / "grafics" / f"{r['id']}.mp4"
            if not dst.exists():
                run("-ss", f"{r['start']:.4f}", "-i", str(master), "-t", f"{r['end'] - r['start']:.4f}", "-an",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-g", "30", "-pix_fmt", "yuv420p",
                    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", str(dst))
        elif r.get("kind") == "text":
            dst = OUT / "textos" / f"{r['id']}.mov"
            if not dst.exists():
                subprocess.run(["bash", str(KIT / "lanes/capcut/premultiply.sh"), r["file"], str(dst)], check=True,
                               stdout=subprocess.DEVNULL, stdin=subprocess.DEVNULL)
    seen = {}
    for r in json.load(open(L.HF / "sfx-plan.json")):
        k = (r["file"], round(r["src_in"], 3), round(r["src_out"], 3))
        if k in seen:
            continue
        n = f"{Path(r['file']).stem.replace(' ', '-').replace('&', 'i')}-{len(seen):02d}.wav"
        seen[k] = n
        run("-ss", f"{r['src_in']:.3f}", "-to", f"{r['src_out']:.3f}", "-i", r["file"], "-ac", "2", "-ar", "48000",
            "-c:a", "pcm_s16le", str(OUT / "sons" / n))
    json.dump({f"{a}|{b}|{c}": n for (a, b, c), n in seen.items()}, open(OUT / "sons" / "_index.json", "w"), ensure_ascii=False)
    print("rest done")
