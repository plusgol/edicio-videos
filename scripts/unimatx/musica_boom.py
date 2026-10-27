"""Música i efectes de la versió «BOOM» del vídeo de presentació d'UniMatx (v2), sintetitzats aquí mateix.

Ús: python3 scripts/unimatx/musica_boom.py projectes/unimatx-llancament/remotion

Mateix tempo que la v1 (120 ppm: un compàs = 60 fotogrames), més pes i un arc de tràiler:

  compassos 0–3   tensió: dron greu, rellotge a cada temps i un cor (el ganxo: 17 anys, 660 graus, +20%)
  compàs 4–5      pujada que es talla en sec just abans del xiuxiueig «Fins ara.» (fotograma 328)
  compàs 6–13     ENTRADA: bombo gros, baix que bomba, acords a contratemps (el producte)
  compàs 14       pujada cap al top 3
  compassos 15–18 segona entrada, amb melodia (top 3, el que t'emportes, el preu)
  compassos 19–20 respir fosc: torna el rellotge («un any a la carrera equivocada»)
  compàs 21       última pujada
  compàs 22       cop final i cua fins al compàs 25

Escriu musica-boom.wav (pic a −1 dB, la tensió uns 19 dB per sota de l'entrada) i els efectes boom, impact, tick, swish.
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from musica_llancament import BAR, BEAT, CHORDS, SR, add, clap, env, fft_filter, hat, kick, note, pluck, rng, save, saw, t  # noqa: E402

BARS = 25
DROP_A, BUILD_B, DROP_B, BREAK, BUILD_C, HIT = 6, 14, 15, 19, 21, 22
GAP = 328 / 30  # la pujada es talla aquí: silenci per al xiuxiueig


def section(b):
    if b < 4:
        return "tension"
    if b < DROP_A:
        return "rise"
    if b < BUILD_B:
        return "dropA"
    if b < DROP_B:
        return "build"
    if b < BREAK:
        return "dropB"
    if b < BUILD_C:
        return "break"
    if b < HIT:
        return "build"
    return "outro"


def big_kick():
    x = t(0.6)
    body = np.sin(2 * np.pi * np.cumsum(42 + 130 * np.exp(-x * 32)) / SR) * np.exp(-x * 5.2)
    click = fft_filter(rng.uniform(-1, 1, len(x)), lo=2500) * env(len(x), 0.0005, 0.004) * 0.5
    return np.tanh(1.6 * (body + click))


def riser(d, lo0=200, lo1=5000):
    n = int(d * SR)
    noise = rng.uniform(-1, 1, n)
    out = np.zeros(n)
    chunks = 40
    for c in range(chunks):
        a, z = c * n // chunks, (c + 1) * n // chunks
        k = (c / chunks) ** 2
        out[a:z] = fft_filter(noise[a:z], lo=lo0 + (lo1 - lo0) * k, hi=1200 + 10000 * k)
    tone = np.sin(2 * np.pi * np.cumsum(110 * 2 ** (3 * np.linspace(0, 1, n) ** 2)) / SR) * 0.35
    return (out + tone) * np.linspace(0, 1, n) ** 2.2


def music():
    total = BARS * BAR + 3
    L = int(total * SR)
    drums, bass, pad, arp, lead, fx = (np.zeros(L) for _ in range(6))
    kicks = []
    for b in range(BARS):
        s = section(b)
        ch = CHORDS[b % 4]
        b0 = b * BAR
        x = t(BAR)
        if s in ("tension", "rise", "break"):
            # dron: la fonamental de l'acord dues octaves avall, amb la quinta
            dr = np.sin(2 * np.pi * note(ch[0] - 24) * x) * 0.6 + np.sin(2 * np.pi * note(ch[0] - 17) * x) * 0.25
            dr *= np.minimum(1, x / 0.05) * np.minimum(1, (BAR - x) / 0.05)
            add(pad, b0, dr, 0.12)
            # rellotge: un tic a cada temps (a corxeres a la pujada)
            step = BEAT / 2 if s == "rise" else BEAT
            for i in range(int(round(BAR / step))):
                tk = fft_filter(rng.uniform(-1, 1, int(0.03 * SR)), lo=2500, hi=8000) * env(int(0.03 * SR), 0.0005, 0.006)
                add(drums, b0 + i * step, tk, 0.32 if i % 2 == 0 else 0.2)
            # cor: «pum-pum» a l'inici del compàs
            if s != "rise":
                for o, g in ((0, 0.55), (0.22, 0.36)):
                    hk = kick()[: int(0.3 * SR)]
                    add(drums, b0 + o, fft_filter(hk, hi=180), g)
        if s == "rise" and b == 4:
            r = riser(GAP - b0 - 0.02)
            add(fx, b0, r, 0.5)
        if s in ("dropA", "dropB", "build"):
            p = sum(saw(note(m), BAR, 3, 0.18) for m in ch)
            p = fft_filter(p, hi=900 if s == "build" else 3200)
            p *= np.minimum(1, x / 0.03) * np.minimum(1, (BAR - x) / 0.03)
            add(pad, b0, p, 0.035)
        if s in ("dropA", "dropB"):
            for i in range(4):
                kicks.append(b0 + i * BEAT)
                add(drums, b0 + i * BEAT, big_kick(), 0.95)
                add(drums, b0 + (i + 0.5) * BEAT, hat(True), 0.2)
            for i in (1, 3):
                add(drums, b0 + i * BEAT, clap(), 0.5)
            for i in range(16):
                add(drums, b0 + i * BEAT / 4, hat(), 0.07 + (0.05 if i % 2 else 0))
            for i in range(8):
                root = ch[0] - 24
                d = BEAT / 2 * 0.95
                bx = saw(note(root + (12 if i % 2 else 0)), d, 3, 0.1)
                bx = np.tanh(2.2 * fft_filter(bx, hi=650)) * env(len(bx), 0.003, 0.4)
                add(bass, b0 + i * BEAT / 2, bx, 0.5)
            # acords curts a contratemps
            for i in range(4):
                st = sum(saw(note(m + 12), BEAT * 0.3, 2, 0.08) for m in ch)
                st = fft_filter(st, hi=4200) * env(len(st), 0.002, 0.08)
                add(lead, b0 + (i + 0.5) * BEAT, st, 0.05)
            step = BEAT / 2
            pat = [0, 2, 1, 3, 2, 1, 3, 2]
            for i in range(8):
                add(arp, b0 + i * step, pluck(note(ch[pat[i]] + 24), 0.3), 0.14)
        if s == "dropB":
            mel = [ch[3] + 12, ch[2] + 12, ch[3] + 12, ch[1] + 24]
            for pos, m in zip((0, 1, 2, 3.5), mel):
                d = BEAT * 0.85
                lx = np.sign(np.sin(2 * np.pi * note(m) * t(d))) * 0.35 + np.sin(2 * np.pi * note(m) * t(d))
                lx = fft_filter(lx, hi=3600) * env(len(lx), 0.006, 0.25)
                add(lead, b0 + pos * BEAT, lx, 0.08)
        if s == "build":
            for i in range(4):
                kicks.append(b0 + i * BEAT)
                add(drums, b0 + i * BEAT, big_kick(), 0.7)
            for i in range(16):
                add(drums, b0 + i * BEAT / 4, clap(), 0.08 + 0.03 * i)
            add(fx, b0, riser(BAR - 0.05, 400, 7000), 0.35)
        if s == "break":
            for i in range(8):
                add(arp, b0 + i * BEAT / 2, pluck(note(ch[[0, 1, 2, 1][i % 4]] + 12), 0.4), 0.08)
    # cop final
    for i in range(2):
        add(drums, HIT * BAR + i * BAR, big_kick(), 0.9)
    pump = np.ones(L)
    xs = np.arange(L) / SR
    for k in kicks:
        a = int(k * SR)
        z = min(L, a + int(0.32 * SR))
        pump[a:z] = np.minimum(pump[a:z], 1 - 0.65 * np.exp(-(xs[a:z] - k) / 0.1))
    mix = drums + (bass + pad) * pump + arp * (0.5 + 0.5 * pump) + lead * (0.7 + 0.3 * pump) + fx
    # el forat abans de l'entrada: silenci net del fotograma 328 al 360, només un «swish» que hi porta
    a, z = int(GAP * SR), int(DROP_A * BAR * SR)
    f = int(0.012 * SR)
    mix[a - f:a] *= np.linspace(1, 0, f)
    mix[a:z] = 0
    sw = swish(0.45)
    add(mix, DROP_A * BAR - 0.45, sw, 0.35)
    fade_a, fade_z = HIT * BAR + 0.6, BARS * BAR
    mix *= np.clip((fade_z - xs) / (fade_z - fade_a), 0, 1) ** 1.5 * (xs >= fade_a) + (xs < fade_a)
    return mix[: int(BARS * BAR * SR)]


def swish(d):
    # «cimbal al revés»: soroll agut que creix i s'atura en sec
    n = int(d * SR)
    return fft_filter(rng.uniform(-1, 1, n), lo=3000) * np.linspace(0, 1, n) ** 3


def sfx():
    s = {}
    x = t(2.2)
    sub = np.sin(2 * np.pi * np.cumsum(28 + 70 * np.exp(-x * 7)) / SR) * np.exp(-x * 1.8)
    crack = fft_filter(rng.uniform(-1, 1, len(x)), hi=3500) * np.exp(-x * 9)
    tail = fft_filter(rng.uniform(-1, 1, len(x)), lo=200, hi=1500) * np.exp(-x * 2.2) * 0.25
    s["boom"] = np.tanh(1.5 * (sub + 0.7 * crack + tail))
    x = t(0.9)
    s["impact"] = np.tanh(1.3 * (np.sin(2 * np.pi * np.cumsum(40 + 90 * np.exp(-x * 14)) / SR) * np.exp(-x * 4.5) + fft_filter(rng.uniform(-1, 1, len(x)), hi=2500) * np.exp(-x * 16) * 0.6))
    x = t(0.14)
    s["tick"] = np.sin(2 * np.pi * 1975 * x) * env(len(x), 0.001, 0.04) + np.sin(2 * np.pi * 2637 * x) * env(len(x), 0.001, 0.03) * 0.5
    s["swish"] = swish(0.5)
    return s


def main():
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    # Normalitzada per pic, no amb loudnorm: el loudnorm d'una passada comprimeix i es menja el contrast entre la
    # tensió i l'entrada, que és justament el «BOOM».
    save(out / "musica-boom.wav", music(), 0.4)
    for k, v in sfx().items():
        save(out / f"{k}.wav", v)
    print("ok", sorted(p.name for p in out.iterdir() if p.suffix == ".wav"))


if __name__ == "__main__":
    main()
