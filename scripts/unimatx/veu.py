"""Veu en off provisional dels reels d'UniMatx, amb Piper (ca_ES-upc_ona, dades CC BY-SA 3.0 ES).

Ús: /home/user/tools/piper-venv/bin/python scripts/unimatx/veu.py projectes/unimatx-reels <codi|tots>

Per a cada vídeo escriu <codi>/veu.wav (48 kHz, mono) i <codi>/timing.json:
  {"duration": s, "beats": [{"start", "end", "words": [{"text", "start", "end"}]}]}
Cada frase es sintetitza per trossos (fins a cada signe de puntuació), de manera que les vores de cada tros són exactes;
dins del tros, les paraules es reparteixen per síl·labes. És una veu de guia: la definitiva la grava una persona.
"""
import json
import re
import sys
import wave
from pathlib import Path

import numpy as np
from piper import PiperVoice, SynthesisConfig

MODEL = "/home/user/models/piper/ca_ES-upc_ona-medium.onnx"
SR = 48000
# Ritme mesurat als vídeos de referència: l'A-B va de pressa (3,4 paraules/s), la sèrie, a poc a poc (2,45).
STYLE = {
    "ab": dict(length_scale=0.86, comma=0.12, stop=0.22, beat=0.18, silence=0.7),
    "serie": dict(length_scale=1.02, comma=0.22, stop=0.38, beat=0.5, silence=1.4),
}
# Com s'ha de llegir el que el sintetitzador diria malament.
SAY = {"ADE": "A, D, E", "amb dades d'AQU Catalunya": "amb dades oficials", "UniMatx": "Unimatx", "TEST": "test", "CENTRE": "centre",
       "NOTA": "nota", "INFORME": "informe"}
CHUNK = re.compile(r"[^,.;:?!…]+[,.;:?!…]*")
SYL = re.compile(r"[aeiouàèéíïòóúüAEIOUÀÈÉÍÏÒÓÚÜ]+")


def spoken(text: str) -> str:
    for k, v in SAY.items():
        text = text.replace(k, v)
    return text


def synth(voice: PiperVoice, text: str, cfg: SynthesisConfig) -> np.ndarray:
    audio = np.concatenate([c.audio_float_array for c in voice.synthesize(spoken(text), cfg)])
    sr = voice.config.sample_rate
    # Fora el silenci de les vores: les pauses les posem nosaltres.
    loud = np.flatnonzero(np.abs(audio) > 0.02)
    if len(loud):
        audio = audio[max(0, loud[0] - int(0.01 * sr)): loud[-1] + int(0.03 * sr)]
    n = int(round(len(audio) * SR / sr))
    return np.interp(np.linspace(0, len(audio) - 1, n), np.arange(len(audio)), audio).astype(np.float32)


def weights(words):
    return [max(1, len(SYL.findall(w))) + 0.15 * len(w) for w in words]


def build(root: Path, video: dict, voice: PiperVoice):
    st = STYLE[video["kind"]]
    cfg = SynthesisConfig(length_scale=st["length_scale"], noise_scale=0.6, noise_w_scale=0.7, normalize_audio=True)
    pieces, beats, t = [], [], 0.25
    pieces.append(np.zeros(int(0.25 * SR), np.float32))
    for b in video["beats"]:
        start, words = t, []
        for chunk in CHUNK.findall(b["veu"]):
            chunk = chunk.strip()
            if not chunk:
                continue
            a = synth(voice, chunk, cfg)
            d = len(a) / SR
            ws = chunk.split()
            wt = weights(ws)
            acc = 0.0
            for w, k in zip(ws, wt):
                words.append({"text": w, "start": round(t + d * acc / sum(wt), 3), "end": round(t + d * (acc + k) / sum(wt), 3)})
                acc += k
            pieces.append(a)
            t += d
            gap = st["stop"] if chunk[-1] in ".?!…:" else st["comma"] if chunk[-1] in ",;" else 0.05
            pieces.append(np.zeros(int(gap * SR), np.float32))
            t += gap
        end = words[-1]["end"] if words else t
        extra = st["silence"] if "Silenci" in b["visual"] else st["beat"]
        pieces.append(np.zeros(int(extra * SR), np.float32))
        t += extra
        beats.append({"start": round(start, 3), "end": round(end, 3), "words": words})
    tail = 2.2 if video["kind"] == "serie" else 1.2  # la sèrie acaba amb «PART 2» en negre
    pieces.append(np.zeros(int(tail * SR), np.float32))
    t += tail
    audio = np.concatenate(pieces)
    audio = audio / max(1e-6, np.max(np.abs(audio))) * 0.7
    out = root / video["code"]
    out.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out / "veu.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((audio * 32767).astype(np.int16).tobytes())
    (out / "timing.json").write_text(json.dumps({"duration": round(len(audio) / SR, 3), "beats": beats}, ensure_ascii=False, indent=1))
    return len(audio) / SR


def main():
    root = Path(sys.argv[1])
    want = sys.argv[2]
    voice = PiperVoice.load(MODEL)
    for v in json.loads((root / "guions.json").read_text())["videos"]:
        if want in ("tots", v["code"]):
            print(v["code"], round(build(root, v, voice), 1), "s")


if __name__ == "__main__":
    main()
