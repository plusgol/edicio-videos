"""Retalla la persona d'un vídeo (fons transparent) perquè els textos puguin anar DARRERE seu, com a l'estil d'Alex.

Ús: python3 -I scripts/retalla_persona.py <entrada.mp4> <sortida.webm> [AMPLExALT=960x540] [kbps=900]

Model: Robust Video Matting (MobileNetV3, ONNX) — github.com/PeterL1n/RobustVideoMatting, llicència GPL-3.0
del codi; el model es baixa amb scripts/models.sh i s'executa només en local (no es redistribueix).
Sortida: WebM VP9 amb canal alfa, mateixa durada i fps que l'entrada. Remotion l'escala a la mida del vídeo.
"""
import os
import subprocess
import sys

import cv2
import numpy as np
import onnxruntime as ort

src, dst = sys.argv[1:3]
W, H = map(int, (sys.argv[3] if len(sys.argv) > 3 else "960x540").split("x"))
KBPS = int(sys.argv[4]) if len(sys.argv) > 4 else 900
MODEL = os.environ.get("RVM_MODEL", os.path.join(os.path.dirname(__file__), "..", "models", "rvm_mobilenetv3_fp32.onnx"))

sess = ort.InferenceSession(MODEL, providers=["CPUExecutionProvider"])
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
rec = [np.zeros((1, 1, 1, 1), dtype=np.float32)] * 4
ratio = np.array([0.4], dtype=np.float32)

ff = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", f"{fps}", "-i", "-",
     "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", f"{KBPS}k", "-auto-alt-ref", "0", "-deadline", "good",
     "-cpu-used", "4", "-row-mt", "1", dst],
    stdin=subprocess.PIPE,
)
n = 0
while True:
    ok, f = cap.read()
    if not ok:
        break
    f = cv2.resize(f, (W, H), interpolation=cv2.INTER_AREA)
    rgb = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
    x = (rgb.astype(np.float32) / 255).transpose(2, 0, 1)[None]
    fgr, pha, *rec = sess.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": ratio})
    a = (np.clip(pha[0, 0], 0, 1) * 255).astype(np.uint8)
    ff.stdin.write(np.dstack([rgb, a]).tobytes())
    n += 1
ff.stdin.close()
ff.wait()
print(f"{n} fotogrames → {dst}")
