"""Comprova que res important quedi sota la interfície de Reels, TikTok o Shorts (vídeos verticals 9:16).

Ús: python3 scripts/zona_segura.py <vídeo.mp4> <full.jpg> [cada_s=2] [temps,temps,...]

Agafa un fotograma cada `cada_s` segons (o els temps que li passis) i hi pinta a sobre:
  - en vermell, el que tapa la interfície: el 10 % de dalt (pestanyes i càmera), el 20 % de baix (nom, text i
    música) i el 15 % de la dreta (m'agrada, comentaris, compartir), i uns botons de mostra perquè es vegi;
  - en verd, la zona segura pràctica de docs/GUIA_EDICIO.md (x 60–940, y 220–1500 a 1080×1920).
Ho enganxa tot en un full de contactes. Si un text o un element clau toca el vermell, s'ha de moure.
"""
import subprocess
import sys

COVER = {"top": 0.10, "bottom": 0.20, "right": 0.15}  # el que tapa la interfície, en fracció de l'alçada/amplada
SAFE = (60 / 1080, 220 / 1920, 940 / 1080, 1500 / 1920)  # x0, y0, x1, y1 de la zona segura pràctica
THUMB_W = 360


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True).stdout
    return float(out)


def overlay():
    t, b, r = COVER["top"], COVER["bottom"], COVER["right"]
    x0, y0, x1, y1 = SAFE
    red = "color=red@0.35:t=fill"
    f = [
        f"drawbox=x=0:y=0:w=iw:h=ih*{t}:{red}",
        f"drawbox=x=0:y=ih*{1 - b}:w=iw:h=ih*{b}:{red}",
        f"drawbox=x=iw*{1 - r}:y=ih*{t}:w=iw*{r}:h=ih*{1 - t - b}:{red}",
        f"drawbox=x=iw*{x0}:y=ih*{y0}:w=iw*{x1 - x0}:h=ih*{y1 - y0}:color=lime@0.9:t=6",
    ]
    # botons de mostra a la dreta (m'agrada, comentari, compartir) i la línia del nom a baix
    for i in range(3):
        f.append(f"drawbox=x=iw*0.885:y=ih*({0.56 + i * 0.075}):w=iw*0.08:h=iw*0.08:color=white@0.85:t=fill")
    f.append("drawbox=x=iw*0.04:y=ih*0.86:w=iw*0.45:h=ih*0.018:color=white@0.85:t=fill")
    f.append("drawbox=x=iw*0.04:y=ih*0.89:w=iw*0.7:h=ih*0.014:color=white@0.6:t=fill")
    return ",".join(f)


def main():
    src, out = sys.argv[1], sys.argv[2]
    step = float(sys.argv[3]) if len(sys.argv) > 3 else 2.0
    times = [float(x) for x in sys.argv[4].split(",")] if len(sys.argv) > 4 else None
    if times is None:
        d = duration(src)
        times = [round(k * step, 2) for k in range(int(d / step) + 1) if k * step < d - 0.05]
    cols = 6
    rows = -(-len(times) // cols)
    inputs, labels = [], []
    for i, ts in enumerate(times):
        inputs += ["-ss", str(ts), "-i", src]
        labels.append(f"[{i}:v]trim=end_frame=1,{overlay()},scale={THUMB_W}:-2,"
                      f"drawtext=text='{ts:.1f} s':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6[v{i}]")
    pad = [f"color=c=black:s={THUMB_W}x{THUMB_W * 16 // 9}:d=1[p{j}]" for j in range(rows * cols - len(times))]
    chain = ";".join(labels + pad)
    stack = "".join(f"[v{i}]" for i in range(len(times))) + "".join(f"[p{j}]" for j in range(len(pad)))
    fc = f"{chain};{stack}xstack=inputs={rows * cols}:layout=" + "|".join(
        f"{c * THUMB_W}_{r * (THUMB_W * 16 // 9)}" for r in range(rows) for c in range(cols)) + ":fill=black[out]"
    if rows * cols == 1:
        fc = f"{chain};[v0]null[out]"
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[out]", "-frames:v", "1", out],
                   check=True)
    print(out, len(times), "fotogrames")


if __name__ == "__main__":
    main()
