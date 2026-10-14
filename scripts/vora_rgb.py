"""Llum de contorn de colors (com les tires LED d'un setup gamer) sobre una persona retallada.

Ús: python3 -I scripts/vora_rgb.py <persona.png> <sortida.png> [color_esquerra=#8B5CF6] [color_dreta=#22D3EE]

Agafa la franja de vora del retall (l'alfa menys l'alfa erosionada, difuminada) i la il·lumina amb un degradat de
l'esquerra a la dreta, sumant llum (com una llum de darrere). La resta de la persona no es toca.
"""
import sys

import cv2
import numpy as np

src, dst = sys.argv[1:3]
left = sys.argv[3] if len(sys.argv) > 3 else "#8B5CF6"
right = sys.argv[4] if len(sys.argv) > 4 else "#22D3EE"
BAND = 0.010  # gruix de la franja, en fracció de l'amplada
STRENGTH = 0.55
BOTTOM_FADE = 0.3  # la vora de baix (tall del retall, p. ex. un portàtil) no s'il·lumina: es fon en aquest tros final

img = cv2.imread(src, cv2.IMREAD_UNCHANGED)
h, w = img.shape[:2]
a = img[..., 3].astype(np.float32) / 255
k = max(3, int(w * BAND)) | 1
inner = cv2.erode(a, np.ones((k, k), np.uint8))
band = cv2.GaussianBlur(np.clip(a - inner, 0, 1), (k, k), 0) * a
rows = np.where(a.max(axis=1) > 0.5)[0]
top, bottom = rows.min(), rows.max()
fade = np.clip((bottom - np.arange(h, dtype=np.float32)) / max(1.0, BOTTOM_FADE * (bottom - top)), 0, 1)
band *= fade[:, None]
hexrgb = lambda c: np.array([int(c[i:i + 2], 16) for i in (5, 3, 1)], np.float32)  # BGR
t = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]
color = hexrgb(left) * (1 - t) + hexrgb(right) * t
bgr = img[..., :3].astype(np.float32)
out = np.clip(bgr + band[..., None] * color * STRENGTH, 0, 255).astype(np.uint8)
cv2.imwrite(dst, np.dstack([out, img[..., 3]]))
print(f"{w}×{h} → {dst}")
