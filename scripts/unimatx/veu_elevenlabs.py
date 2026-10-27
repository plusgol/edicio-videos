"""Veu en off dels reels d'UniMatx amb ElevenLabs (model eleven_v3, català).

Ús: ELEVENLABS_API_KEY=… python3 scripts/unimatx/veu_elevenlabs.py projectes/unimatx-reels <veu_id> <codi|tots>

Un encàrrec per pla (endpoint with-timestamps): les vores de cada pla són exactes i el temps de cada paraula surt de
l'alineació per caràcters d'ElevenLabs. Cada pla es desa a <codi>/el/<hash>.mp3 i no es torna a pagar si el text i la
veu no canvien. Escriu <codi>/veu.wav i <codi>/timing.json en el mateix format que veu.py (la veu provisional).
La clau només es llegeix de l'entorn; no es desa enlloc.
"""
import base64
import hashlib
import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

import numpy as np

SR = 48000
MODEL = "eleven_v3"
STYLE = {
    # Ritme «dopamina» (l'usuari: «no pot estar 3 s sense passar res»): veu més àgil i gairebé sense aire entre plans.
    "ab": dict(beat=0.06, silence=0.3, speed=1.18),
    "serie": dict(beat=0.2, silence=0.6, speed=1.12),
}
SAY = {"amb dades d'AQU Catalunya": "amb dades oficials", "ADE": "A, D, E", "UniMatx": "Uni Match"}


def spoken(text: str) -> str:
    for k, v in SAY.items():
        text = text.replace(k, v)
    return text


def tts(text: str, voice: str, cache: Path) -> dict:
    key = hashlib.sha1(f"{MODEL}|{voice}|{text}".encode()).hexdigest()[:16]
    f = cache / f"{key}.json"
    if f.exists():
        return json.loads(f.read_text())
    body = json.dumps({"text": text, "model_id": MODEL, "language_code": "ca"}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
        data=body, headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        d = json.loads(r.read())
    cache.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(d))
    return d


def decode(mp3_b64: str, speed: float) -> np.ndarray:
    raw = base64.b64decode(mp3_b64)
    af = f"atempo={speed}" if abs(speed - 1) > 1e-3 else "anull"
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-af", af, "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                         input=raw, capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).copy()


def words_from_alignment(text: str, al: dict, speed: float, offset: float, trim: float):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out, cur, s0, e0 = [], "", None, None
    for c, a, b in zip(chars + [" "], st + [0], en + [0]):
        if c.isspace():
            if cur:
                out.append({"text": cur, "start": round(offset + (s0 / speed) - trim, 3), "end": round(offset + (e0 / speed) - trim, 3)})
            cur, s0 = "", None
            continue
        if s0 is None:
            s0 = a
        cur += c
        e0 = b
    # Les paraules del guió manen (el text llegit pot dur canvis de pronúncia): es reparteixen per ordre.
    shown = text.split()
    if len(shown) == len(out):
        for w, s in zip(out, shown):
            w["text"] = s
    else:
        t0, t1 = out[0]["start"], out[-1]["end"]
        n = len(shown)
        out = [{"text": s, "start": round(t0 + (t1 - t0) * i / n, 3), "end": round(t0 + (t1 - t0) * (i + 1) / n, 3)} for i, s in enumerate(shown)]
    return out


def build(root: Path, video: dict, voice: str):
    st = STYLE[video["kind"]]
    pieces = [np.zeros(int(0.25 * SR), np.float32)]
    t, beats = 0.25, []
    # Frases on cal una altra grafia perquè soni bé (comprovada amb transcripció): {índex del pla: text llegit}.
    say_file = root / video["code"] / "veu_say.json"
    say = {int(k): v for k, v in json.loads(say_file.read_text()).items()} if say_file.exists() else {}
    for i, b in enumerate(video["beats"]):
        d = tts(say.get(i, spoken(b["veu"])), voice, root / video["code"] / "el")
        a = decode(d["audio_base64"], st["speed"])
        loud = np.flatnonzero(np.abs(a) > 0.01)
        lead = max(0, loud[0] - int(0.02 * SR)) if len(loud) else 0
        tail = min(len(a), loud[-1] + int(0.06 * SR)) if len(loud) else len(a)
        a = a[lead:tail]
        words = words_from_alignment(b["veu"], d["alignment"], st["speed"], t, lead / SR)
        beats.append({"start": round(t, 3), "end": round(t + len(a) / SR, 3), "words": words})
        pieces.append(a)
        t += len(a) / SR
        gap = st["silence"] if "Silenci" in b["visual"] else st["beat"]
        pieces.append(np.zeros(int(gap * SR), np.float32))
        t += gap
    tail = 1.6 if video["kind"] == "serie" else 0.9
    pieces.append(np.zeros(int(tail * SR), np.float32))
    audio = np.concatenate(pieces)
    audio = audio / max(1e-6, float(np.max(np.abs(audio)))) * 0.7
    out = root / video["code"]
    pcm = (audio * 32767).astype(np.int16).tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", str(out / "veu.wav")], input=pcm, check=True)
    (out / "timing.json").write_text(json.dumps({"duration": round(len(audio) / SR, 3), "beats": beats, "voice": f"elevenlabs:{MODEL}:{voice}"}, ensure_ascii=False, indent=1))
    return len(audio) / SR


def main():
    root, voice, want = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
    for v in json.loads((root / "guions.json").read_text())["videos"]:
        if want in ("tots", v["code"]):
            print(v["code"], round(build(root, v, voice), 1), "s", flush=True)


if __name__ == "__main__":
    main()
