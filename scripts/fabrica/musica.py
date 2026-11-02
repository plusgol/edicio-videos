"""Fàbrica de vídeos · el llit musical, sintetitzat aquí mateix (sense mostres de tercers ni llicències).

120 ppm, Re menor (Re m, Si♭, Fa, Do), i un arc que segueix les pantalles:
  primera pantalla (el ganxo)   pad i arpegi, sense bateria
  de la segona a la penúltima   entra la bateria (si l'estil en porta) al primer temps després del tall
  targeta final                 la bateria para, un cop greu al tall i la cua del pad

Tres caràcters (brand/mg.ts → STYLES[*].music):
  drive   bombo a cada temps, palmes al 2 i al 4, charles, baix a corxeres (Kinetic Type, Pop Bold, Camino de Dragones)
  soft    bombo suau a l'1 i al 3, charles fluix, baix a blanques (Liquid Glass, UniMatx)
  paper   sense bateria: arpegi a negres tipus piano i pad càlid (Editorial Grain)
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "unimatx"))
from musica_llancament import BAR, BEAT, SR, add, clap, env, fft_filter, hat, kick, note, pluck, saw, t  # noqa: E402

CHORDS = [[50, 53, 57, 62], [46, 50, 53, 58], [53, 57, 60, 65], [48, 52, 55, 60]]


def impact(d=2.2):
    x = t(d)
    s = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-x * 10)) / SR) * np.exp(-x * 1.8)
    s += fft_filter(np.random.default_rng(3).uniform(-1, 1, len(x)), hi=2200) * np.exp(-x * 6) * 0.4
    return np.tanh(1.2 * s)


def bed(total_s: float, drums_from_s: float, end_s: float | None, mood: str) -> np.ndarray:
    n_bars = int(np.ceil(total_s / BAR)) + 1
    n = int((total_s + 3) * SR)
    pad, arp, drums, bass, fx = (np.zeros(n) for _ in range(5))
    # la bateria entra al primer temps després del tall de la segona pantalla i para a la targeta final
    d0 = np.ceil(drums_from_s / BEAT) * BEAT
    d1 = end_s if end_s is not None else total_s
    for b in range(n_bars):
        ch = CHORDS[b % 4]
        b0 = b * BAR
        if b0 > total_s + BAR:
            break
        p = sum(saw(note(m), BAR, 3, 0.15) for m in ch)
        p = fft_filter(p, hi={"drive": 2400, "soft": 1800, "paper": 1300}[mood])
        x = t(BAR)
        p *= np.minimum(1, x / 0.08) * np.minimum(1, (BAR - x) / 0.08)
        add(pad, b0, p, 0.045 if mood != "paper" else 0.06)
        step = BEAT if mood == "paper" else BEAT / 2
        pat = [0, 1, 2, 3, 2, 1, 2, 3]
        for i in range(int(round(BAR / step))):
            at = b0 + i * step
            m = ch[pat[i % 8]] + 12
            add(arp, at, pluck(note(m), min(0.9, step * 2)), 0.2 if mood != "paper" else 0.26)
        for i in range(4):
            at = b0 + i * BEAT
            if not (d0 <= at < d1) or mood == "paper":
                continue
            if mood == "drive" or i in (0, 2):
                add(drums, at, kick(), 0.85 if mood == "drive" else 0.5)
            add(drums, at + BEAT / 2, hat(i == 3), 0.2 if mood == "drive" else 0.1)
            if mood == "drive" and i in (1, 3):
                add(drums, at, clap(), 0.4)
        for i in range(8 if mood == "drive" else 2):
            at = b0 + i * (BEAT / 2 if mood == "drive" else BAR / 2)
            if not (d0 <= at < d1) or mood == "paper":
                continue
            d = (BEAT / 2 if mood == "drive" else BAR / 2) * 0.9
            bx = fft_filter(saw(note(ch[0] - 24), d, 2, 0.05), hi=420) * env(int(d * SR), 0.004, 0.35 if mood == "drive" else 0.8)
            add(bass, at, bx, 0.5)
    if end_s is not None:
        add(fx, end_s, impact(), 0.6)
    mix = pad + arp + drums + bass + fx
    out = mix[: int(total_s * SR)]
    fade = int(1.2 * SR)
    out[-fade:] *= np.linspace(1, 0, fade) ** 2
    return out / max(1e-6, float(np.max(np.abs(out)))) * 0.8
