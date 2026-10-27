"""Zooms cap a on passa l'acció en una gravació de pantalla ja muntada (per a la composició DemoRapida de Remotion).

Ús: python3 scripts/zooms_accio.py <vídeo muntat> <trossos.json> <parts.json> <sortida.json>

- Mira el vídeo a 4 fotogrames per segon i, per a cada finestra de ~2,6 s, busca on canvia la imatge (clics, el
  ratolí, contingut nou). Hi apunta amb un zoom que ho encabeix amb marge (entre 1,0 i 1,4).
- Si dues finestres seguides demanarien el mateix pla, alterna obert/tancat: la imatge no s'atura mai més de 3 s.
- A l'inici de cada tros (on hi ha un tall) el canvi és sec; dins d'un tros, suau.
- No mira la càmera de la cantonada ni la barra del navegador.
parts.json: [{"src": segons a la gravació original, "label": "…"}] → es converteixen a temps de sortida amb trossos.json.
"""
import json
import subprocess
import sys

import numpy as np

FPS, W, H = 4, 360, 190
WIN = 2.6
CAM = (0.752, 0.0, 1.0, 0.265)  # x0, y0, x1, y1 (fracció) de la càmera de l'OBS
CHROME = 0.11  # barra del navegador


def frames(path, src_w, src_h):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={FPS},scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.int16)


def main():
    video, trossos, parts, out = sys.argv[1:5]
    probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height:format=duration",
                                       "-of", "json", video], capture_output=True, text=True).stdout)
    sw, sh = probe["streams"][0]["width"], probe["streams"][0]["height"]
    dur = float(probe["format"]["duration"])
    F = frames(video, sw, sh)
    mask = np.ones((H, W), bool)
    mask[: int(CHROME * H), :] = False
    mask[int(CAM[1] * H): int(CAM[3] * H), int(CAM[0] * W):] = False
    D = np.zeros_like(F, dtype=bool)
    D[1:] = (np.abs(F[1:] - F[:-1]) > 18) & mask
    vis_w = 1920 / max(1920 / sw, 1080 / sh)  # amplada visible a zoom 1, en píxels de la font (el 16:9 retalla els laterals)
    vis_h = 1080 / max(1920 / sw, 1080 / sh)
    rows = json.loads(open(trossos).read())
    zooms, prev = [], {"z": 1.0, "cx": sw / 2, "cy": sh / 2}
    for r in rows:
        a, b = r["out"]
        n = max(1, round((b - a) / WIN))
        for i in range(n):
            t0 = a + (b - a) * i / n
            t1 = a + (b - a) * (i + 1) / n
            heat = D[int(t0 * FPS): max(int(t0 * FPS) + 1, int(t1 * FPS))].sum(0)
            ys, xs = np.nonzero(heat)
            if len(xs) > 40:
                x0, x1 = np.percentile(xs, [8, 92]) * sw / W
                y0, y1 = np.percentile(ys, [8, 92]) * sh / H
                bw, bh = max(x1 - x0, sw * 0.12), max(y1 - y0, sh * 0.12)
                z = float(np.clip(min(vis_w / (bw * 1.9), vis_h / (bh * 1.9)), 1.0, 1.4))
                cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            else:
                z, cx, cy = prev["z"], prev["cx"], prev["cy"]
            if abs(z - prev["z"]) < 0.08 and abs(cx - prev["cx"]) < sw * 0.08 and abs(cy - prev["cy"]) < sh * 0.08:
                z = 1.0 if prev["z"] > 1.12 else 1.22
            zooms.append({"t": round(t0, 3), "z": round(z, 3), "cx": round(cx, 1), "cy": round(cy, 1), "cut": i == 0})
            prev = {"z": z, "cx": cx, "cy": cy}
    zooms[0].update({"z": 1.0, "cx": sw / 2, "cy": sh / 2})
    chapters = []
    for p in json.loads(open(parts).read()):
        hit = next((r for r in rows if r["src"][1] >= p["src"]), rows[-1])
        speed = (hit["src"][1] - hit["src"][0]) / max(1e-6, hit["out"][1] - hit["out"][0])
        off = max(0.0, p["src"] - hit["src"][0]) / speed  # dins d'un tros no hi ha talls: el temps hi corre lineal
        chapters.append({"t": round(hit["out"][0] + off, 3), "label": p["label"]})
    json.dump({"duration": round(dur, 3), "srcW": sw, "srcH": sh, "zooms": zooms, "chapters": chapters}, open(out, "w"), indent=0)
    print(len(zooms), "zooms,", len(chapters), "parts,", round(dur, 1), "s")


if __name__ == "__main__":
    main()
