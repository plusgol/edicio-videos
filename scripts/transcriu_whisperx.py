"""Transcripció en castellà amb WhisperX (large-v3 + alineació per paraula), el mateix motor que el kit d'Alex
(docs/KIT_ALEX.md), però en castellà: el del kit està fixat en anglès.

Ús: /home/user/tools/whisperx-venv/bin/python scripts/transcriu_whisperx.py <àudio> <sortida.json> [model=large-v3]

Escriu el format de la casa ({"words": [{"text", "startMs", "endMs", "p"}]}) amb la confiança de cada paraula (p),
que serveix per saber on els temps de l'ASR són de fiar: amb p ≤ 0,35 la vora real pot ser ben lluny.
"""
import json
import sys

import whisperx

audio_path, out = sys.argv[1], sys.argv[2]
model_name = sys.argv[3] if len(sys.argv) > 3 else "large-v3"
LANG = "es"

audio = whisperx.load_audio(audio_path)
model = whisperx.load_model(model_name, "cpu", compute_type="int8", language=LANG)
result = model.transcribe(audio, batch_size=8, language=LANG)
align_model, meta = whisperx.load_align_model(language_code=LANG, device="cpu")
aligned = whisperx.align(result["segments"], align_model, meta, audio, "cpu", return_char_alignments=False)

words = []
for seg in aligned["segments"]:
    for w in seg.get("words", []):
        # Una paraula sense temps (p. ex. un número que l'alineador no sap llegir) pren els del veí.
        if "start" not in w:
            prev = words[-1]["endMs"] if words else int(seg["start"] * 1000)
            words.append({"text": w["word"], "startMs": prev, "endMs": prev, "p": 0.0, "untimed": True})
            continue
        words.append({"text": w["word"], "startMs": int(round(w["start"] * 1000)), "endMs": int(round(w["end"] * 1000)),
                      "p": round(float(w.get("score", 0.0)), 3)})
json.dump({"engine": f"whisperx {model_name} ({LANG})", "words": words}, open(out, "w"), ensure_ascii=False)
print(f"{out}: {len(words)} paraules")
print(" ".join(w["text"] for w in words))
