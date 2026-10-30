"""Línia de temps del vídeo de Camino de Dragones: on comença cada frase de la veu (i cada paraula), en fotogrames.

Ús: python3 scripts/cdd/muntatge.py projectes/camino-dragones

Llegeix vo.json (de scripts/unimatx/veu_linies.py) i escriu muntatge.json, que fan servir la composició i la música.
Les frases que obren una part (SECTIONS) comencen a temps, a 120 ppm (un temps = 15 fotogrames), perquè els cops de
la música hi caiguin a sobre; les altres segueixen l'anterior amb una pausa curta.
"""
import json
import math
import sys
from pathlib import Path

FPS = 30
BEAT = 15  # 120 ppm
LEAD = 12  # silenci abans de la primera frase
GAP = {"01": 6, "02": 4, "03": 6, "04": 3, "05": 2, "06": 2, "07": 2, "08": 6, "09": 5, "10": 3, "11": 6}
SECTIONS = {"02", "03", "04", "09", "12"}  # logo, xifres, ruta, desnivell, tancament
TAIL = 32


def main():
    root = Path(sys.argv[1])
    vo = json.loads((root / "vo.json").read_text())
    lines, f, prev = [], LEAD, None
    for ln in vo["lines"]:
        if prev is not None:
            f = prev["from"] + prev["frames"] + GAP.get(prev["id"], 4)
            if ln["id"] in SECTIONS:
                f = math.ceil(f / BEAT) * BEAT
        words = [{"text": w["text"], "f": f + round(w["start"] * FPS)} for w in ln["words"]]
        cur = {"id": ln["id"], "text": ln["text"], "from": f, "frames": ln["frames"], "words": words}
        lines.append(cur)
        prev = cur
    total = prev["from"] + prev["frames"] + TAIL
    out = {"fps": FPS, "beat": BEAT, "durationInFrames": total, "lines": lines}
    (root / "muntatge.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
    for ln in lines:
        print(ln["id"], ln["from"], ln["from"] + ln["frames"], ln["text"])
    print("total", total, "fotogrames =", round(total / FPS, 2), "s")


if __name__ == "__main__":
    main()
