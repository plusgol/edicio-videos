#!/usr/bin/env python3
"""footage_bot.py — step 4 (grade) and the V1 footage moves BY HAND for the chat-only lane (LANES.md: grade ⛔ on
chat-only; the opening zoom-out and the emphasis push-ins have no chat-only recipe), plus THE CORNER CAM renders.

  python3 footage_bot.py base      # outputs/bot-trading.splice.mp4 (the splice's cut, untouched) -> outputs/bot-trading.mp4
                                   #   graded (Autumn-Rec709 cube at 80 %, saturation 120) + zoom-out + push-ins, audio copied
  python3 footage_bot.py pips      # every pip-* plan cell -> gfx/renders/pip-<id>-alpha.mov (ProRes 4444, straight alpha)

The numbers are the preset's (README § Grade, § Opening zoom-out, § Emphasis push-in, § Recording sections):
  grade      the cube as a Look at intensity 0.80 over the footage, then saturation 1.20; the graphics carry none of it
  zoom-out   115 -> 100 over 18 frames, quartic ease-out, from the first CAMERA frame
  push-in    100 -> 115 over 18 frames, cubic ease-in-out, 2 frames before the emphasized word, held to the next V1 cut
  corner cam a square 300 px box at x1590 y750 (1080 frame), radius 54, shadow 9 px down / blur 13 / black 45 %;
             the camera window as tall as 2125/2160 of the frame, top at 0, centred on the face (the face measured on the
             spans the cam sits on)
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
import lib_bot as L  # noqa: E402

KIT = L.JOB.parents[1]
LUT = KIT / "assets/luts/rec709/Autumn-Rec709.cube"
OUT = L.JOB / "outputs"
F = 1 / L.FPS
CAM = {"cam-prompt.mov": "IMG_5866", "cam-truco.mov": "IMG_5867", "cam-24h.mov": "IMG_5883", "cam-calle.mov": "IMG_5885"}


def plan():
    return json.load(open(L.JOB / "graphics-plan.json"))["beats"]


def moves():
    """[(start, end, kind)] on the timeline: the zoom-out on the first camera frame, a push-in per push_in cell."""
    first_cam = next(s["t0"] for s in L.SEGS if s["clip"] in CAM)
    out = [(first_cam, next(s["t1"] for s in L.SEGS if s["t0"] == first_cam), "out")]
    cuts = sorted({s["t0"] for s in L.SEGS} | {s["t1"] for s in L.SEGS})
    for c in plan():
        if c.get("push_in"):
            ts = L.snap(c["start"] + 0.08 - 2 * F)            # the cell starts 80 ms before its word
            te = min(t for t in cuts if t > ts + 1e-6)          # held to the next V1 cut, which resets it
            if te - ts >= 0.6:
                out.append((ts, te, "in"))
    out.sort()
    keep, last = [], -1
    for m in out:                                           # never two moves on one span
        if m[0] >= last - 1e-6:
            keep.append(m)
            last = m[1]
    return keep


def base():
    src = OUT / f"{L.JOB.name}.splice.mp4"
    dst = OUT / f"{L.JOB.name}.mp4"
    if not src.exists():
        dst.rename(src)
    grade = (f"split[o][g];[g]lut3d=file='{LUT}':interp=tetrahedral[l];[l][o]blend=all_mode=normal:all_opacity=0.80,"
             "eq=saturation=1.20,format=yuv420p")
    mv = moves()
    edges = [0.0]
    for a, b, _ in mv:
        edges += [a, b]
    edges.append(L.DURATION)
    pieces, chains, k = [], [], 0
    for i in range(len(edges) - 1):
        a, b = edges[i], edges[i + 1]
        if b - a < 0.5 * F:
            continue
        kind = next((m[2] for m in mv if abs(m[0] - a) < 1e-6), None)
        fa, fb = round(a * L.FPS), round(b * L.FPS)
        ch = f"[g{k}]trim=start_frame={fa}:end_frame={fb},setpts=PTS-STARTPTS"
        if kind:
            p = "min(on/18,1)"
            z = (f"1.15-0.15*(1-pow(1-{p},4))" if kind == "out" else
                 f"1+0.15*if(lt({p},0.5),4*pow({p},3),1-pow(-2*{p}+2,3)/2)")
            ch += (f",scale=3840:2160:flags=lanczos,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps={L.FPS}"
                   ",setsar=1")
        chains.append(ch + f"[p{k}]")
        pieces.append(f"[p{k}]")
        k += 1
    graph = f"[0:v]{grade},split={k}" + "".join(f"[g{i}]" for i in range(k)) + ";" + ";".join(chains) + ";" + \
        "".join(pieces) + f"concat=n={k}:v=1:a=0,format=yuv420p[v]"
    print(f"[footage] {len(mv)} moves: " + ", ".join(f"{m[2]}@{m[0]:.2f}" for m in mv))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-filter_complex", graph, "-map", "[v]", "-map", "0:a",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-g", "15", "-pix_fmt", "yuv420p",
                    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                    "-c:a", "copy", "-movflags", "+faststart", str(dst)], check=True)
    print(f"[footage] -> {dst}")


def face_x(t0, t1):
    """Median face centre (1080 frame) of the camera frames under [t0, t1]."""
    xs = []
    for s in L.SEGS:
        if s["clip"] not in CAM or s["t1"] <= t0 or s["t0"] >= t1:
            continue
        tr = json.load(open(L.SRC / f"work/{CAM[s['clip']]}.1920x1080.track.json"))["frames"]
        a = s["start"] + max(0, t0 - s["t0"])
        b = s["start"] + min(s["t1"], t1) - s["t0"]
        xs += [f["x"] for f in tr[int(a * L.FPS):int(b * L.FPS)]]
    return float(np.median(xs)) if xs else 960.0


def shadow_png():
    from PIL import Image, ImageDraw, ImageFilter
    p = L.GFX / "assets/pip-shadow.png"
    if p.exists():
        return p
    im = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x, y, w, h = L.PIP
    d.rounded_rectangle([x, y + 9, x + w, y + 9 + h], radius=54, fill=(0, 0, 0, int(255 * 0.45)))
    im = im.filter(ImageFilter.GaussianBlur(13))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=54, fill=255)
    mask.save(L.GFX / "assets/pip-mask.png")
    im.save(p)
    return p


def pips():
    base = OUT / f"{L.JOB.name}.mp4"
    sh = shadow_png()
    mask = L.GFX / "assets/pip-mask.png"
    x, y, w, h = L.PIP
    win = round(1080 * 2125 / 2160)
    for c in plan():
        if not c["id"].startswith("pip-"):
            continue
        out = L.GFX / "renders" / f"{c['id']}-alpha.mov"
        a, b = c["start"], c["end"]
        cx = face_x(a, b)
        left = int(min(1920 - win, max(0, cx - win / 2)))
        fa, fb = round(a * L.FPS), round(b * L.FPS)
        g = (f"[0:v]trim=start_frame={fa}:end_frame={fb},setpts=PTS-STARTPTS,crop={win}:{win}:{left}:0,scale={w}:{h}:flags=lanczos,"
             f"format=yuva444p[cam];[2:v]format=gray,scale={w}:{h}[m];[cam][m]alphamerge[cr];"
             f"[1:v]loop=loop=-1:size=1,trim=end_frame={fb - fa},setpts=N/{L.FPS}/TB,format=yuva444p[sh];"
             f"[sh][cr]overlay={x}:{y}:format=auto,format=yuva444p10le[v]")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(base), "-i", str(sh), "-i", str(mask), "-filter_complex", g, "-map", "[v]",
                        "-r", str(L.FPS), "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-alpha_bits", "16",
                        str(out)], check=True)
        print(f"[pip] {c['id']} {a:.2f}-{b:.2f} face x {cx:.0f} -> {out.name}")


if __name__ == "__main__":
    {"base": base, "pips": pips}[sys.argv[1]]()
