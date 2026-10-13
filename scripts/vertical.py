"""Converteix una gravació horitzontal en vertical 1080×1920 seguint la cara.

Ús: python3 -I scripts/vertical.py <entrada.mp4> <sortida.mp4> <track.json> [fps=30]
Variable opcional YUNET_MODEL: ruta a face_detection_yunet_2023mar.onnx (opencv/opencv_zoo).
Amb YuNet la detecció és molt més fiable en plans contrapicats i amb ulleres; sense, es fa servir Haar.

- Detecta la cara a cada fotograma, omple els buits i suavitza el recorregut
  (Gaussiana de ~0,7 s) perquè el retall es mogui com una càmera tranquil·la, no a batzegades.
- Retalla a 9:16 amb l'altura completa i escala amb lanczos. No toca el color.
- Escriu track.json amb la posició de la cara (en coordenades de sortida) per fotograma,
  que Remotion fa servir per ancorar els canvis d'escala als ulls.
"""
import json
import os
import subprocess
import sys

import cv2
import numpy as np

src, dst, track_path = sys.argv[1:4]
FPS = int(sys.argv[4]) if len(sys.argv) > 4 else 30
OUT_W, OUT_H = 1080, 1920

cap = cv2.VideoCapture(src)
src_fps = cap.get(cv2.CAP_PROP_FPS)
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
n_src = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = n_src / src_fps
n_out = int(round(duration * FPS))

# Fotogrames de sortida = mostreig del fotograma d'origen més proper.
frames = []
want = [min(n_src - 1, int(round(i * src_fps / FPS))) for i in range(n_out)]
idx, wi = 0, 0
while wi < len(want):
    ok, f = cap.read()
    if not ok:
        break
    while wi < len(want) and want[wi] == idx:
        frames.append(f)
        wi += 1
    idx += 1
while len(frames) < n_out:
    frames.append(frames[-1])

yunet_path = os.environ.get("YUNET_MODEL")
if yunet_path:
    yunet = cv2.FaceDetectorYN.create(yunet_path, "", (W, H), score_threshold=0.6)
else:
    haar = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


def detect(f):
    """Llista de (x, y, w, h, ulls_y)."""
    if yunet_path:
        _, faces = yunet.detect(f)
        if faces is None:
            return []
        # Columnes 4–7: ull dret i ull esquerre (x, y).
        return [(r[0], r[1], r[2], r[3], (r[5] + r[7]) / 2) for r in faces]
    g = cv2.equalizeHist(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY))
    rs = haar.detectMultiScale(g, scaleFactor=1.1, minNeighbors=6, minSize=(int(H * 0.15), int(H * 0.15)))
    return [(x, y, w, h, y + h * 0.42) for x, y, w, h in rs]


cx = np.full(n_out, np.nan)
cy = np.full(n_out, np.nan)
fh = np.full(n_out, np.nan)
prev = None
for i, f in enumerate(frames):
    faces = detect(f)
    if faces:
        # La cara més gran; si n'hi ha diverses, la més propera a l'anterior.
        if prev is not None and len(faces) > 1:
            x, y, w, h, ey = min(faces, key=lambda r: abs(r[0] + r[2] / 2 - prev))
        else:
            x, y, w, h, ey = max(faces, key=lambda r: r[2] * r[3])
        cx[i], cy[i], fh[i] = x + w / 2, ey, h
        prev = cx[i]

found = ~np.isnan(cx)
print(f"cara detectada a {found.mean():.0%} dels fotogrames")
t = np.arange(n_out)
for a in (cx, cy, fh):
    a[:] = np.interp(t, t[found], a[found]) if found.any() else {id(cx): W / 2, id(cy): H * 0.4, id(fh): H * 0.3}[id(a)]

def smooth(a, sigma):
    r = int(sigma * 3)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    return np.convolve(np.pad(a, r, mode="edge"), k, mode="valid")

sigma = 0.7 * FPS
cx, cy, fh = smooth(cx, sigma), smooth(cy, sigma), smooth(fh, sigma)

crop_w = int(round(H * OUT_W / OUT_H))
crop_w -= crop_w % 2
x0 = np.clip(cx - crop_w / 2, 0, W - crop_w)
k = OUT_H / H

ff = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{crop_w}x{H}", "-r", str(FPS), "-i", "-",
     "-vf", f"scale={OUT_W}:{OUT_H}:flags=lanczos", "-c:v", "libx264", "-preset", "slow", "-crf", "14",
     "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-an", dst],
    stdin=subprocess.PIPE,
)
for i, f in enumerate(frames):
    xi = int(round(x0[i]))
    ff.stdin.write(np.ascontiguousarray(f[:, xi:xi + crop_w]).tobytes())
ff.stdin.close()
ff.wait()

track = [
    {"x": round(float((cx[i] - x0[i]) * k), 1), "y": round(float(cy[i] * k), 1), "faceH": round(float(fh[i] * k), 1)}
    for i in range(n_out)
]
json.dump({"fps": FPS, "width": OUT_W, "height": OUT_H, "sourceUpscale": round(k, 2), "frames": track}, open(track_path, "w"))
print(f"{n_out} fotogrames → {dst} (ampliació ×{k:.2f} des de {crop_w}×{H})")
