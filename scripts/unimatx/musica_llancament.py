"""Música del vídeo de presentació d'UniMatx, sintetitzada aquí mateix (sense mostres de tercers ni llicències).

Ús: python3 scripts/unimatx/musica_llancament.py projectes/unimatx-llancament/remotion

A 120 ppm un compàs dura 2 s, és a dir, 60 fotogrames a 30 fps: els talls del muntatge cauen a compàs sense
calcular res. L'arc segueix la història (com demana el launch-video-kit, la història mana i la música s'hi adapta):

  compassos 0–1   intro: pad i arpegi espaiat (logo i lema)
  compàs 2        pujada: arpegi a semicorxeres, soroll que puja i redoble
  compassos 3–12  entrada A: bombo, palmes, charles, baix (el test per dins)
  compassos 13–14 respir sense bombo, per a l'escena densa de llegir (els límits), i pujada
  compassos 15–21 entrada B, amb una melodia a sobre (resultat, informe, fitxes)
  compàs 22       cop final (tancament) i cua fins al compàs 25

Escriu musica.wav (estèreo, 48 kHz, −14 LUFS) i els efectes whoosh/click/pop.
"""
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
BARS = 25
rng = np.random.default_rng(11)

# vi – IV – I – V en Fa major (Re menor, Si bemoll, Fa, Do)
CHORDS = [[50, 53, 57, 62], [46, 50, 53, 58], [53, 57, 60, 65], [48, 52, 55, 60]]
INTRO, BUILD, DROP_A, BREAK, DROP_B, HIT, END = 0, 2, 3, 13, 15, 22, 25


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


def t(d):
    return np.arange(int(d * SR)) / SR


def fft_filter(x, lo=None, hi=None):
    """Filtre de fase zero al domini de freqüència, amb una caiguda suau d'una octava."""
    n = len(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if hi:
        g *= 1 / (1 + (f / hi) ** 4)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(np.fft.rfft(x) * g, n)


def env(n, a=0.005, r=0.2):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / r)


def add(buf, at_s, x, gain=1.0):
    a = int(at_s * SR)
    if a >= len(buf):
        return
    x = x[: len(buf) - a]
    buf[a:a + len(x)] += x * gain


def pluck(freq, dur):
    # Karplus-Strong vectoritzat per períodes: cada volta del buffer és la mitjana de l'anterior.
    p = max(2, int(SR / freq))
    n = int(dur * SR)
    buf = rng.uniform(-1, 1, p)
    for _ in range(3):
        buf = 0.5 * (buf + np.roll(buf, 1))
    out = np.empty(n + p)
    k = 0
    while k < n:
        out[k:k + p] = buf
        buf = 0.996 * 0.5 * (buf + np.roll(buf, -1))
        k += p
    return out[:n] * env(n, 0.002, dur / 3)


def saw(freq, d, voices=3, detune=0.12):
    x = t(d)
    out = np.zeros_like(x)
    for v in range(voices):
        fr = freq * 2 ** ((v - (voices - 1) / 2) * detune / 12)
        ph = rng.uniform(0, 1)
        out += 2 * ((x * fr + ph) % 1) - 1
    return out / voices


def kick():
    x = t(0.4)
    return np.sin(2 * np.pi * np.cumsum(45 + 95 * np.exp(-x * 28)) / SR) * np.exp(-x * 7.5)


def clap():
    n = int(0.22 * SR)
    noise = fft_filter(rng.uniform(-1, 1, n), lo=900, hi=7000)
    e = np.zeros(n)
    for i, o in enumerate((0, 0.011, 0.022)):
        a = int(o * SR)
        e[a:] = np.maximum(e[a:], env(n - a, 0.0008, 0.012 if i < 2 else 0.07))
    return noise * e


def hat(open_=False):
    n = int((0.16 if open_ else 0.05) * SR)
    return fft_filter(rng.uniform(-1, 1, n), lo=7000) * env(n, 0.001, 0.05 if open_ else 0.012)


def section(b):
    if b < BUILD:
        return "intro"
    if b < DROP_A:
        return "build"
    if b < BREAK:
        return "dropA"
    if b < DROP_B:
        return "break"
    if b < HIT:
        return "dropB"
    return "outro"


def music():
    total = BARS * BAR + 2
    drums = np.zeros(int(total * SR))
    bass = np.zeros_like(drums)
    pad = np.zeros_like(drums)
    arp = np.zeros_like(drums)
    lead = np.zeros_like(drums)
    fx = np.zeros_like(drums)
    kicks = []
    for b in range(BARS):
        s = section(b)
        ch = CHORDS[b % 4]
        b0 = b * BAR
        # pad: tota l'estona, més obert a les entrades
        p = sum(saw(note(m), BAR, 3, 0.15) for m in ch)
        p = fft_filter(p, hi={"intro": 1200, "build": 1800, "break": 1500, "outro": 1100}.get(s, 2600))
        x = t(BAR)
        p *= np.minimum(1, x / 0.08) * np.minimum(1, (BAR - x) / 0.08)
        add(pad, b0, p, {"intro": 0.03, "build": 0.04, "break": 0.045, "outro": 0.04}.get(s, 0.05))
        # arpegi
        step = BEAT / 4 if s == "build" or (s == "break" and b == BREAK + 1) else BEAT / 2
        if s == "intro":
            step = BEAT
        n_steps = int(round(BAR / step))
        pat = [0, 1, 2, 3, 2, 1, 2, 3]
        for i in range(n_steps):
            if s == "outro" and b >= HIT + 2:
                break
            m = ch[pat[i % 8]] + 12 + (12 if s == "dropB" and i % 4 == 3 else 0)
            add(arp, b0 + i * step, pluck(note(m), min(0.6, step * 1.8)), 0.14 if s == "intro" else 0.22)
        # bateria i baix a les entrades
        if s in ("dropA", "dropB"):
            for i in range(4):
                kicks.append(b0 + i * BEAT)
                add(drums, b0 + i * BEAT, kick(), 0.9)
                add(drums, b0 + (i + 0.5) * BEAT, hat(i == 3), 0.22)
            for i in (1, 3):
                add(drums, b0 + i * BEAT, clap(), 0.45)
            for i in range(8):
                root = ch[0] - 24
                d = BEAT / 2 * 0.9
                bx = saw(note(root if i % 4 != 3 else root + 7), d, 2, 0.05)
                bx = fft_filter(bx, hi=420) * env(len(bx), 0.004, 0.35)
                add(bass, b0 + i * BEAT / 2, bx, 0.55)
        if s == "break":
            for i in range(8):
                add(drums, b0 + (i + 0.5) * BEAT / 2, hat(), 0.08)
        if s == "dropB":
            # melodia curta: les notes de dalt de l'acord, a negres amb síncope al final
            mel = [ch[3] + 12, ch[2] + 12, ch[3] + 12, ch[1] + 24]
            for i, (pos, m) in enumerate(zip((0, 1, 2, 3.5), mel)):
                d = BEAT * 0.8
                lx = (np.sign(np.sin(2 * np.pi * note(m) * t(d))) * 0.4 + np.sin(2 * np.pi * note(m) * t(d)))
                lx = fft_filter(lx, hi=3200) * env(len(lx), 0.006, 0.22)
                add(lead, b0 + pos * BEAT, lx, 0.07)
        # pujades: soroll que s'obre i redoble a la segona meitat
        if b in (BUILD, BREAK + 1):
            n = int(BAR * SR)
            noise = rng.uniform(-1, 1, n)
            rise = np.zeros(n)
            chunks = 32
            for c in range(chunks):
                a, z = c * n // chunks, (c + 1) * n // chunks
                rise[a:z] = fft_filter(noise[a:z], lo=300 + 6000 * (c / chunks) ** 2, hi=1500 + 9000 * (c / chunks) ** 2)
            add(fx, b0, rise * np.linspace(0, 1, n) ** 2, 0.25)
            for i in range(8):
                add(drums, b0 + BAR / 2 + i * BEAT / 4, clap(), 0.12 + 0.04 * i)
    # cop final
    x = t(2.5)
    impact = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-x * 10)) / SR) * np.exp(-x * 1.6)
    impact += fft_filter(rng.uniform(-1, 1, len(x)), hi=2500) * np.exp(-x * 5) * 0.6
    add(fx, HIT * BAR, impact, 0.7)
    for i in range(2):
        add(drums, HIT * BAR + i * BAR, kick(), 0.9)
    # «sidechain»: el pad i el baix s'aparten de cada cop de bombo
    pump = np.ones_like(drums)
    xs = np.arange(len(drums)) / SR
    for k in kicks:
        a = int(k * SR)
        z = min(len(pump), a + int(0.3 * SR))
        pump[a:z] = np.minimum(pump[a:z], 1 - 0.55 * np.exp(-(xs[a:z] - k) / 0.09))
    mix = drums + (bass + pad) * pump + arp * (0.6 + 0.4 * pump) + lead + fx
    # cua: fosa des del cop final fins al final
    fade_a, fade_z = HIT * BAR + 0.5, END * BAR
    mix *= np.clip((fade_z - xs) / (fade_z - fade_a), 0, 1) ** 1.5 * (xs >= fade_a) + (xs < fade_a)
    return mix[: int(END * BAR * SR)]


def sfx():
    s = {}
    n = int(0.42 * SR)
    noise = rng.uniform(-1, 1, n)
    sweep = np.linspace(0, 1, n)
    s["whoosh"] = fft_filter(noise, lo=250, hi=2600) * np.sin(np.pi * sweep) ** 2
    x = t(0.035)
    s["click"] = fft_filter(rng.uniform(-1, 1, len(x)), lo=1800, hi=9000) * env(len(x), 0.0005, 0.006) + np.sin(2 * np.pi * 1700 * x) * env(len(x), 0.0005, 0.008) * 0.6
    x = t(0.12)
    s["pop"] = np.sin(2 * np.pi * (900 + 2400 * np.exp(-x * 40)) * x) * env(len(x), 0.002, 0.035)
    return s


def save(path, x, width=0.0):
    x = x / max(1e-6, np.max(np.abs(x))) * 0.89
    d = int(0.012 * SR)
    r = np.concatenate([np.zeros(d), x[:-d]]) if width else x
    st = np.stack([x * (1 - width / 2) + r * width / 2, r * (1 - width / 2) + x * width / 2], 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


def main():
    out = Path(sys.argv[1])
    out.mkdir(parents=True, exist_ok=True)
    raw = out / "musica-raw.wav"
    save(raw, music(), 0.35)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), str(out / "musica.wav")], check=True)
    raw.unlink()
    for k, v in sfx().items():
        save(out / f"{k}.wav", v)
    print("ok", sorted(p.name for p in out.iterdir() if p.suffix == ".wav"))


if __name__ == "__main__":
    main()
