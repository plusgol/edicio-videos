"""Neteja la vora d'una persona retallada per posar-la sobre un fons negre.

Ús: python3 -I scripts/vora_neta.py <persona.png> <sortida.png>

Les vores semitransparents del retall porten color del fons original (una paret clara): sobre negre es veuen com un
halo. Aquí s'estreny la vora (l'alfa baixa més de pressa) i els píxels de vora s'enfosqueixen en proporció.
"""
import sys

import cv2
import numpy as np

src, dst = sys.argv[1:3]
CHOKE = 0.35  # part baixa de l'alfa que es descarta (0 = sense canvi)

img = cv2.imread(src, cv2.IMREAD_UNCHANGED)
a = img[..., 3].astype(np.float32) / 255
a2 = np.clip((a - CHOKE) / (1 - CHOKE), 0, 1)
a2 = cv2.GaussianBlur(a2, (3, 3), 0)
rgb = img[..., :3].astype(np.float32) * (0.35 + 0.65 * a2[..., None])  # vora enfosquida, interior igual
out = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), (a2 * 255).astype(np.uint8)])
cv2.imwrite(dst, out)
print(f"{img.shape[1]}×{img.shape[0]} → {dst}")
