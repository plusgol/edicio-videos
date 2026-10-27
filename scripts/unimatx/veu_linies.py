"""Locució per línies per al vídeo de presentació d'UniMatx (mètode del launch-video-kit, amb ElevenLabs en català).

Ús: ELEVENLABS_API_KEY=… python3 scripts/unimatx/veu_linies.py projectes/unimatx-llancament [--only 03,09] [--force]

Com `gen-voice.mjs` del kit: un fitxer per línia (`remotion/vo/vo-NN.wav`, carpeta pública de Remotion), sense silencis al cap i a la cua i
normalitzat amb loudnorm. A més desa `vo.json` amb la durada en fotogrames i el temps de cada paraula (per als
subtítols). Escriu la veu ABANS de muntar: els fotogrames que imprimeix fixen el muntatge.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from veu_elevenlabs import SR, decode, spoken, tts, words_from_alignment  # noqa: E402

FPS = 30


def main():
    root = Path(sys.argv[1])
    args = sys.argv[2:]
    only = set(args[args.index("--only") + 1].split(",")) if "--only" in args else None
    force = "--force" in args
    cfg = json.loads((root / "veu.json").read_text())
    ln = cfg["loudnorm"]
    out_dir = root / "remotion" / "vo"
    out_dir.mkdir(parents=True, exist_ok=True)
    meta_f = root / "vo.json"
    meta = {m["id"]: m for m in json.loads(meta_f.read_text())["lines"]} if meta_f.exists() else {}
    print("id   dur      frames  estat       text")
    for line in cfg["lines"]:
        lid, text = line["id"], line["text"]
        wav = out_dir / f"vo-{lid}.wav"
        state = "ja existia"
        if (only is None or lid in only) and (force or not wav.exists() or lid not in meta):
            d = tts(line.get("say", spoken(text)), cfg["voice"], root / "el")
            a = decode(d["audio_base64"], cfg["speed"])
            loud = np.flatnonzero(np.abs(a) > 0.01)
            lead = max(0, loud[0] - int(0.02 * SR))
            tail = min(len(a), loud[-1] + int(0.06 * SR))
            a = a[lead:tail]
            words = words_from_alignment(text, d["alignment"], cfg["speed"], 0.0, lead / SR)
            pcm = (a / max(1e-6, float(np.max(np.abs(a)))) * 0.5 * 32767).astype(np.int16).tobytes()
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
                            "-af", f"loudnorm=I={ln['I']}:TP={ln['TP']}:LRA={ln['LRA']}", "-ar", str(SR), "-c:a", "pcm_s16le", str(wav)],
                           input=pcm, check=True)
            dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)],
                                       capture_output=True, text=True, check=True).stdout)
            meta[lid] = {"id": lid, "text": text, "dur": round(dur, 3), "frames": int(np.ceil(dur * FPS)), "words": words}
            state = "generada"
        m = meta.get(lid)
        if m:
            print(f"{lid}   {m['dur']:.2f}s   {m['frames']:4d}   {state:10s}  {text}")
    lines = [meta[l["id"]] for l in cfg["lines"] if l["id"] in meta]
    meta_f.write_text(json.dumps({"fps": FPS, "voice": f"elevenlabs:eleven_v3:{cfg['voice']}", "lines": lines}, ensure_ascii=False, indent=1))
    print(f"\ntotal de veu: {sum(l['dur'] for l in lines):.2f}s")


if __name__ == "__main__":
    main()
