"""Música i efectes del vídeo de Camino de Dragones, sintetitzats aquí mateix (sense mostres de tercers ni llicències).

Ús: python3 scripts/cdd/musica_cdd.py projectes/camino-dragones

Tambors greus (tipus taiko), Re menor i 120 ppm; les parts surten de muntatge.json perquè els cops caiguin on comença
cada part del vídeo:

  llegenda (frase 01)        dron greu, batec de tambor cada dos temps i un cop a l'inici
  logo (02)                  cop gros; el tambor passa a cada temps
  xifres (03)                cop a cada xifra («doce», «trescientos», «treinta»), pujada cap a la ruta
  ruta (04–08)               ritme sencer per córrer: bombo, toms a corxeres, baix i acords
  desnivell (09)             cop gros i mig temps fins a les dates
  tancament (12)             últim cop i cua llarga

Escriu remotion/musica.wav (estèreo, 48 kHz, −14 LUFS) i els efectes whoosh, pop i hit.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "unimatx"))
from musica_llancament import BEAT, SR, add, env, fft_filter, hat, kick, note, rng, save, saw, t  # noqa: E402

CHORDS = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]  # Re m, Si♭, Fa, Do


def tom(f0=110, d=0.7, body=1.0):
    x = t(d)
    s = np.sin(2 * np.pi * np.cumsum(f0 * (0.55 + 0.45 * np.exp(-x * 9))) / SR) * np.exp(-x * 5)
    s += fft_filter(rng.uniform(-1, 1, len(x)), hi=1800) * np.exp(-x * 30) * 0.35
    return np.tanh(1.4 * s * body)


def impact(d=2.5):
    x = t(d)
    s = np.sin(2 * np.pi * np.cumsum(36 + 70 * np.exp(-x * 9)) / SR) * np.exp(-x * 1.5)
    s += fft_filter(rng.uniform(-1, 1, len(x)), hi=2200) * np.exp(-x * 4) * 0.5
    return np.tanh(1.3 * s)


def riser(d):
    n = int(d * SR)
    noise = rng.uniform(-1, 1, n)
    out = np.zeros(n)
    for c in range(32):
        a, z = c * n // 32, (c + 1) * n // 32
        k = (c / 32) ** 2
        out[a:z] = fft_filter(noise[a:z], lo=200 + 4000 * k, hi=1200 + 9000 * k)
    return out * np.linspace(0, 1, n) ** 2.2


def music(m):
    fps = m["fps"]
    L = {ln["id"]: ln for ln in m["lines"]}
    sec = lambda i: L[i]["from"] / fps  # noqa: E731
    word = lambda i, w: next(x["f"] for x in L[i]["words"] if x["text"].lower().startswith(w)) / fps  # noqa: E731
    total = m["durationInFrames"] / fps + 0.5
    n = int(total * SR)
    drums, bass, pad, fx = (np.zeros(n) for _ in range(4))
    logo, stats, run, alt, end = sec("02"), sec("03"), sec("04"), sec("09"), sec("12")
    # dron i acords de fons tota l'estona, més oberts a la ruta
    x = t(total)
    drone = fft_filter(saw(note(38), total, 3, 0.1), hi=300) * 0.6 + np.sin(2 * np.pi * note(26) * x) * 0.4
    add(pad, 0, drone * np.minimum(1, x / 1.5), 0.10)
    beat = 0.0
    k = 0
    while beat < total - 1:
        bar = int(beat / (4 * BEAT))
        ch = CHORDS[bar % 4]
        in_run = run <= beat < alt
        if beat % (4 * BEAT) < 1e-6 and beat >= logo:
            p = sum(saw(note(c), 4 * BEAT, 3, 0.15) for c in ch)
            p = fft_filter(p, hi=2600 if in_run else 1300)
            xx = t(4 * BEAT)
            p *= np.minimum(1, xx / 0.1) * np.minimum(1, (4 * BEAT - xx) / 0.1)
            add(pad, beat, p, 0.05 if in_run else 0.035)
        if beat < logo:
            if k % 2 == 0:
                add(drums, beat, tom(70, 0.9), 0.55)
        elif beat < stats:
            add(drums, beat, tom(80, 0.8), 0.6 if k % 2 == 0 else 0.35)
        elif beat < run:
            add(drums, beat, tom(90, 0.6), 0.45)
            add(drums, beat + BEAT / 2, tom(150, 0.3), 0.18)
        elif in_run:
            add(drums, beat, kick(), 0.85)
            add(drums, beat, tom(95, 0.5), 0.35 if k % 2 == 0 else 0.2)
            add(drums, beat + BEAT / 2, tom(160, 0.25), 0.25)
            add(drums, beat + BEAT / 2, hat(), 0.12)
            for i in range(2):
                r = ch[0] - 24
                bx = fft_filter(saw(note(r), BEAT / 2 * 0.9, 2, 0.05), hi=380) * env(int(BEAT / 2 * 0.9 * SR), 0.004, 0.3)
                add(bass, beat + i * BEAT / 2, bx, 0.5)
        elif beat < end:
            if k % 2 == 0:
                add(drums, beat, tom(75, 0.9), 0.55)
                add(drums, beat, kick(), 0.6)
            add(drums, beat + BEAT / 2, hat(), 0.06)
        beat += BEAT
        k += 1
    # cops i pujades
    add(fx, 0.25, impact(3.0), 0.55)
    add(fx, logo - 1.5, riser(1.5), 0.18)
    add(fx, logo, impact(), 0.7)
    for w in ("doce", "trescientos", "treinta"):
        add(fx, word("03", w), tom(60, 1.0, 1.3), 0.6)
    add(fx, run - 2.0, riser(2.0), 0.25)
    add(fx, run, impact(), 0.8)
    add(fx, alt, impact(), 0.75)
    add(fx, end, impact(3.5), 0.9)
    mix = drums + bass + pad + fx
    xs = np.arange(n) / SR
    fade_a = end + 0.6
    mix *= np.where(xs < fade_a, 1, np.clip((total - xs) / (total - fade_a), 0, 1) ** 1.5)
    return mix


def sfx():
    s = {}
    nn = int(0.5 * SR)
    sweep = np.linspace(0, 1, nn)
    s["whoosh"] = fft_filter(rng.uniform(-1, 1, nn), lo=200, hi=2400) * np.sin(np.pi * sweep) ** 2
    x = t(0.12)
    s["pop"] = np.sin(2 * np.pi * (700 + 1800 * np.exp(-x * 40)) * x) * env(len(x), 0.002, 0.04)
    s["hit"] = tom(65, 0.9, 1.2)
    return s


def main():
    root = Path(sys.argv[1])
    m = json.loads((root / "muntatge.json").read_text())
    out = root / "remotion"
    out.mkdir(parents=True, exist_ok=True)
    raw = out / "musica-raw.wav"
    save(raw, music(m), 0.35)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), str(out / "musica.wav")], check=True)
    raw.unlink()
    for k, v in sfx().items():
        save(out / f"{k}.wav", v)
    print("ok", sorted(p.name for p in out.iterdir() if p.suffix == ".wav"))


if __name__ == "__main__":
    main()
