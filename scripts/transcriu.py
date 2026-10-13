"""Transcripció amb marques de temps per paraula (sherpa-onnx + NVIDIA Parakeet TDT v3, local).

Ús: python3 -I scripts/transcriu.py <wav 16 kHz mono> <model_dir> <sortida.json>
El model es baixa de https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
(sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8). Multilingüe, inclou castellà.
"""
import json
import sys
import wave

import numpy as np
import sherpa_onnx

wav_path, model_dir, out_path = sys.argv[1:4]

rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{model_dir}/encoder.int8.onnx",
    decoder=f"{model_dir}/decoder.int8.onnx",
    joiner=f"{model_dir}/joiner.int8.onnx",
    tokens=f"{model_dir}/tokens.txt",
    model_type="nemo_transducer",
    num_threads=4,
)

with wave.open(wav_path) as w:
    assert w.getframerate() == 16000 and w.getnchannels() == 1
    samples = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768

# Trossos curts (8–16 s) tallats al punt més silenciós: amb trossos llargs el model es salta frases.
SR = 16000
HOP = SR // 50  # finestres de 20 ms
rms = np.array([np.sqrt(np.mean(samples[i:i + HOP] ** 2)) + 1e-9 for i in range(0, len(samples), HOP)])
cuts = [0]
while len(samples) - cuts[-1] > 16 * SR:
    lo, hi = (cuts[-1] + 8 * SR) // HOP, (cuts[-1] + 16 * SR) // HOP
    cuts.append(int((lo + np.argmin(rms[lo:hi])) * HOP))
cuts.append(len(samples))
total = len(samples) / SR

tokens = []
for a, b in zip(cuts, cuts[1:]):
    s = rec.create_stream()
    s.accept_waveform(SR, samples[a:b])
    rec.decode_stream(s)
    tokens += [(t, a / SR + ts) for t, ts in zip(s.result.tokens, s.result.timestamps)]

# Agrupa subparaules (SentencePiece: '▁' marca inici de paraula) en paraules.
words = []
for t, ts in tokens:
    if t.startswith(("▁", " ")) or not words:
        words.append({"text": t.lstrip("▁ "), "startMs": round(ts * 1000)})
    else:
        words[-1]["text"] += t
words = [w for w in words if w["text"].strip()]
for i, w in enumerate(words):
    w["id"] = f"w{i:04d}"
    # El model dona l'inici de cada token; el final és l'inici de la paraula següent, limitat a 900 ms.
    nxt = words[i + 1]["startMs"] if i + 1 < len(words) else round(total * 1000)
    w["endMs"] = min(nxt, w["startMs"] + 900)

json.dump({"durationMs": round(total * 1000), "words": words}, open(out_path, "w"), ensure_ascii=False, indent=1)
print(" ".join(w["text"] for w in words))
