"""Música i efectes dels reels d'UniMatx, sintetitzats aquí mateix (sense mostres de tercers, sense llicències).

Ús: python scripts/unimatx/so.py projectes/unimatx-reels/so

  musica-ab.wav     100 ppm, to major: pad suau, arpegi pinçat, cop sord a 1 i 3, shaker. Fa bucle cada 4 compassos.
  musica-serie.wav  fons fosc: dron greu amb la quinta, soroll filtrat que respira i una nota alta que apareix i se'n va.
  pop, whoosh, hit, tick, rewind, notif .wav   els efectes.
"""
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.005, r=0.2):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / r)


def lowpass(x, cut):
    # Un pol simple, prou per arrodonir.
    k = np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - k) * v + k * acc
        y[i] = acc
    return y


def note(f):
    return 440 * 2 ** ((f - 69) / 12)


def pluck(freq, dur, damp=0.996):
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p)
    for _ in range(3):  # excitació suau: sense el clic de banda ampla de l'atac
        buf = 0.5 * (buf + np.roll(buf, 1))
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = damp * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * env(n, 0.002, dur / 3)


def save(path, x, stereo_width=0.0):
    x = x / max(1e-6, np.max(np.abs(x))) * 0.89
    if stereo_width:
        d = int(0.011 * SR)
        L, R = x, np.concatenate([np.zeros(d), x[:-d]])
        st = np.stack([L * (1 - stereo_width / 2) + R * stereo_width / 2, R * (1 - stereo_width / 2) + L * stereo_width / 2], 1)
    else:
        st = np.stack([x, x], 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


def music_ab(bars=16):
    bpm, beat = 100, 60 / 100
    bar = 4 * beat
    total = bars * bar
    out = np.zeros(int(total * SR) + SR)
    # I – V – vi – IV en Fa major
    chords = [[53, 57, 60, 65], [48, 52, 55, 60], [50, 53, 57, 62], [46, 50, 53, 58]]
    for b in range(bars):
        ch = chords[b % 4]
        s0 = int(b * bar * SR)
        n = int(bar * SR)
        x = t(bar)
        pad = sum(np.sin(2 * np.pi * note(m) * x) + 0.3 * np.sin(4 * np.pi * note(m) * x) for m in ch)
        pad *= np.minimum(1, x / 0.25) * np.minimum(1, (bar - x) / 0.25) * 0.05
        out[s0:s0 + n] += pad
        # arpegi a corxeres, dues octaves amunt
        for i in range(8):
            m = ch[[0, 1, 2, 3, 2, 1, 2, 3][i]] + 12
            p = pluck(note(m), beat * 0.9) * 0.16
            a = s0 + int(i * beat / 2 * SR)
            out[a:a + len(p)] += p
        # cop sord a 1 i 3, shaker a contratemps
        for i in (0, 2):
            k = t(0.35)
            kick = np.sin(2 * np.pi * (48 + 60 * np.exp(-k * 30)) * k) * np.exp(-k * 9) * 0.35
            a = s0 + int(i * beat * SR)
            out[a:a + len(kick)] += kick
        for i in range(4):
            sh = rng.uniform(-1, 1, int(0.06 * SR)) * env(int(0.06 * SR), 0.004, 0.02) * 0.05
            sh = sh - lowpass(sh, 4000)
            a = s0 + int((i + 0.5) * beat * SR)
            out[a:a + len(sh)] += sh
    return lowpass(out[: int(total * SR)], 7000)


def music_serie(d=80):
    x = t(d)
    drone = (np.sin(2 * np.pi * 55 * x) * 0.5 + np.sin(2 * np.pi * 82.4 * x) * 0.25 + np.sin(2 * np.pi * 110.3 * x) * 0.12)
    drone *= 0.75 + 0.25 * np.sin(2 * np.pi * x / 9)
    air = lowpass(rng.uniform(-1, 1, len(x)), 500) * (0.5 + 0.5 * np.sin(2 * np.pi * x / 6.5 + 1)) * 0.9
    high = np.sin(2 * np.pi * 880 * x) * np.clip(np.sin(2 * np.pi * x / 17), 0, 1) ** 3 * 0.035
    out = drone + air + high
    fade = np.minimum(1, x / 2) * np.minimum(1, (d - x) / 2)
    return out * fade


def sfx():
    s = {}
    x = t(0.09)
    s["pop"] = np.sin(2 * np.pi * (1100 - 5000 * x) * x) * env(len(x), 0.002, 0.03)
    n = int(0.45 * SR)
    noise = rng.uniform(-1, 1, n)
    sweep = np.linspace(0, 1, n)
    s["whoosh"] = (lowpass(noise, 1500) * np.sin(np.pi * sweep) ** 2) * 1.5
    x = t(1.2)
    s["hit"] = (np.sin(2 * np.pi * (40 + 40 * np.exp(-x * 12)) * x) * np.exp(-x * 3.2)
                + lowpass(rng.uniform(-1, 1, len(x)), 900) * np.exp(-x * 14) * 0.8)
    x = t(0.03)
    s["tick"] = rng.uniform(-1, 1, len(x)) * env(len(x), 0.001, 0.006)
    x = t(0.6)
    s["rewind"] = (np.sin(2 * np.pi * (300 + 900 * x ** 2) * x * (1 + 0.15 * np.sin(2 * np.pi * 23 * x)))
                   * 0.5 + lowpass(rng.uniform(-1, 1, len(x)), 3000) * 0.4) * np.sin(np.pi * x / 0.6)
    x = t(0.7)
    s["notif"] = (np.sin(2 * np.pi * 988 * x) * env(len(x), 0.004, 0.18)
                  + np.concatenate([np.zeros(int(0.11 * SR)), np.sin(2 * np.pi * 1319 * x[: len(x) - int(0.11 * SR)]) * env(len(x) - int(0.11 * SR), 0.004, 0.25)]))
    return s


def main():
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    save(out / "musica-ab.wav", music_ab(), 0.35)
    save(out / "musica-serie.wav", music_serie(), 0.5)
    for k, v in sfx().items():
        save(out / f"{k}.wav", v)
    print("ok", sorted(p.name for p in out.iterdir()))


if __name__ == "__main__":
    main()
