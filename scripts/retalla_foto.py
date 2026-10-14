"""Retalla la persona d'una foto (PNG amb fons transparent), per a miniatures.

Ús: python3 -I scripts/retalla_foto.py <foto.jpg> <sortida.png>
Model: el mateix Robust Video Matting que scripts/retalla_persona.py (variable RVM_MODEL).

RVM és recurrent (pensat per a vídeo): amb una sola imatge, es passa unes quantes vegades la mateixa foto
perquè l'estat intern s'assenti i la vora (cabells, ulleres) surti neta.
Als píxels de vora (alfa parcial) es fa servir el primer pla que estima el model, sense el color del fons.
"""
import os
import sys

import cv2
import numpy as np
import onnxruntime as ort

src, dst = sys.argv[1:3]
MODEL = os.environ.get("RVM_MODEL", os.path.join(os.path.dirname(__file__), "..", "models", "rvm_mobilenetv3_fp32.onnx"))
PASSES = 8
INTERNAL_PX = 512  # costat llarg de la passada de baixa resolució del model

img = cv2.imread(src, cv2.IMREAD_COLOR)
h, w = img.shape[:2]
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
x = (rgb.astype(np.float32) / 255).transpose(2, 0, 1)[None]
ratio = np.array([min(1.0, INTERNAL_PX / max(h, w))], dtype=np.float32)
sess = ort.InferenceSession(MODEL, providers=["CPUExecutionProvider"])
rec = [np.zeros((1, 1, 1, 1), dtype=np.float32)] * 4
for _ in range(PASSES):
    fgr, pha, *rec = sess.run(None, {"src": x, "r1i": rec[0], "r2i": rec[1], "r3i": rec[2], "r4i": rec[3], "downsample_ratio": ratio})

a = np.clip(pha[0, 0], 0, 1)
fg = (np.clip(fgr[0].transpose(1, 2, 0), 0, 1) * 255).astype(np.uint8)
edge = (a > 0.02) & (a < 0.98)
out = rgb.copy()
out[edge] = fg[edge]
cv2.imwrite(dst, cv2.cvtColor(np.dstack([out, (a * 255).astype(np.uint8)]), cv2.COLOR_RGBA2BGRA))
print(f"{w}×{h} → {dst} (persona: {a.mean():.0%} de la imatge)")
