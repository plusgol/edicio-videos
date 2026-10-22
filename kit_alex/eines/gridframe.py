#!/usr/bin/env python3
"""gridframe.py <capture.mp4> <t> <out.jpg> [x0 y0 x1 y1]: one capture frame with a normalised 0.05 grid (labels every 0.1),
optionally cropped to the normalised window x0..x1, y0..y1 (grid labels stay in full-frame coords)."""
import subprocess, sys
from PIL import Image, ImageDraw
src, t, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
crop = [float(v) for v in sys.argv[4:8]] if len(sys.argv) >= 8 else [0, 0, 1, 1]
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "/tmp/_gf.png"], check=True)
im = Image.open("/tmp/_gf.png").convert("RGB"); W, H = im.size
x0, y0, x1, y1 = crop
im = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
cw, ch = im.size
s = min(1600 / cw, 1000 / ch, 3.0); im = im.resize((int(cw * s), int(ch * s)))
d = ImageDraw.Draw(im)
step = 0.05 if (x1 - x0) > 0.4 else 0.01
k = 0
v = round(x0 / step) * step
while v <= x1 + 1e-9:
    px = (v - x0) / (x1 - x0) * im.size[0]
    major = abs((v / (step * 2)) - round(v / (step * 2))) < 1e-6
    d.line([(px, 0), (px, im.size[1])], fill=(0, 255, 0) if major else (0, 120, 0), width=1)
    if major: d.text((px + 2, 2), f"{v:.2f}", fill=(0, 255, 0))
    v += step
v = round(y0 / step) * step
while v <= y1 + 1e-9:
    py = (v - y0) / (y1 - y0) * im.size[1]
    major = abs((v / (step * 2)) - round(v / (step * 2))) < 1e-6
    d.line([(0, py), (im.size[0], py)], fill=(255, 0, 255) if major else (120, 0, 120), width=1)
    if major: d.text((2, py + 2), f"{v:.2f}", fill=(255, 0, 255))
    v += step
im.save(out, quality=88)
print(W, H, "->", out)
