"""Fàbrica de vídeos · el so: la veu per pantalles (ElevenLabs), els efectes i la mescla.

Regles (brand/mg.ts → MG.mix, i la guia de Damiano):
  - amb veu, només clics on importa: una marca per element de llista, el comptador mentre roda un número, la barra
    que s'omple i el so final a l'última targeta; cap so quan una pantalla entra o surt, i cap «whoosh»;
  - sense veu, el vídeo és «a film on its own»: també un so a cada pantalla (si l'estil en té);
  - els efectes, uns 20 dB per sota de la veu; la veu, almenys 12 LU per sobre de la música i els efectes junts
    (es mesura i s'ajusta); màster a −14 LUFS i pic real per sota de −1 dB.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "unimatx"))
from veu_elevenlabs import SR, decode, tts, words_from_alignment  # noqa: E402

import musica  # noqa: E402

FPS = 30
SFX_DIR = Path(__file__).resolve().parents[2] / "src" / "mg" / "sfx"


def read_wav(path: Path) -> np.ndarray:
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


def write_wav(path: Path, x: np.ndarray, channels: int = 1):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", str(channels), "-i", "pipe:0", str(path)],
                   input=pcm, check=True)


def lufs(x: np.ndarray) -> float:
    """Sonoritat integrada (EBU R128, amb les portes de silenci) mesurada per ffmpeg."""
    scale = float(np.max(np.abs(x))) if len(x) else 0.0
    if scale < 1e-6:
        return -70.0
    with tempfile.NamedTemporaryFile(suffix=".wav") as f:
        write_wav(Path(f.name), x / scale)
        err = subprocess.run(["ffmpeg", "-nostdin", "-v", "info", "-i", f.name, "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
                             capture_output=True, text=True).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", err)
    return float(m[-1]) + 20 * np.log10(scale) if m else -70.0


def limit(x: np.ndarray, ceiling_db: float) -> np.ndarray:
    """Limitador de pics (ffmpeg alimiter) a `ceiling_db` dBFS. Treballa en coma flotant: l'entrada pot passar d'1."""
    raw = x.astype(np.float32).tobytes()
    lim = 10 ** (ceiling_db / 20)
    out = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0",
                          "-af", f"alimiter=limit={lim:.4f}:attack=3:release=60:level=false:latency=true", "-f", "f32le", "pipe:1"],
                         input=raw, capture_output=True, check=True).stdout
    y = np.frombuffer(out, np.float32).astype(np.float64)
    return np.pad(y, (0, max(0, len(x) - len(y))))[: len(x)]


def voice_lines(screens: list, brief: dict, cache: Path) -> dict:
    """Una crida a ElevenLabs per pantalla (desada a `cache`: no es torna a pagar). Retorna {id: {frames, words, audio}}."""
    v = brief["voice"]
    speed = v.get("speed", 1.0)
    out = {}
    for sc in screens:
        text = sc["spoken"]
        for k, say in brief.get("pronounce", {}).items():
            text = text.replace(k, say)
        d = tts(text, v["id"], cache, brief.get("language", "es"))
        a = decode(d["audio_base64"], speed).astype(np.float64)
        loud = np.flatnonzero(np.abs(a) > 0.01)
        lead = max(0, loud[0] - int(0.02 * SR))
        tail = min(len(a), loud[-1] + int(0.06 * SR))
        a = a[lead:tail]
        words = words_from_alignment(text, d["alignment"], speed, 0.0, lead / SR)
        out[sc["id"]] = {"frames": int(np.ceil(len(a) / SR * FPS)), "words": words, "audio": a, "said": text}
    # mateixa sonoritat per a totes les frases
    target = np.mean([lufs(x["audio"]) for x in out.values()])
    for x in out.values():
        x["audio"] *= 10 ** ((target - lufs(x["audio"])) / 20)
    return out


def sfx_events(screens: list, style: dict, MG: dict, with_voice: bool) -> list:
    ev = []
    for sc in screens:
        f0 = sc["from"]
        if not with_voice and style["sfx"]["screen"] and sc["kind"] != "end":
            ev.append({"name": style["sfx"]["screen"], "f": f0 + sc["words"][0]["f"], "why": f"pantalla {sc['id']}"})
        for w in sc["words"]:
            if "count" in w and style["sfx"]["count"]:
                ev.append({"name": style["sfx"]["count"], "f": f0 + w["f"], "why": f"el {w['t']} roda"})
        for k, at in enumerate(sc.get("itemAt", [])):
            ev.append({"name": "tick", "f": f0 + at, "why": f"marca: {sc['items'][k]}"})
        if "barAt" in sc:
            ev.append({"name": "fill", "f": f0 + sc["barAt"], "why": "la barra s'omple"})
        if sc["kind"] == "end" and style["sfx"]["end"]:
            ev.append({"name": style["sfx"]["end"], "f": f0 + sc["words"][0]["f"], "why": "última targeta"})
    return sorted(ev, key=lambda e: e["f"])


def peak_rms_db(x: np.ndarray, win: float = 0.05) -> float:
    n = int(win * SR)
    if len(x) <= n:
        return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
    c = np.cumsum(np.concatenate([[0], x ** 2]))
    return 20 * np.log10(np.sqrt(np.max(c[n:] - c[:-n]) / n) + 1e-9)


def mix(screens: list, total: int, voice: dict | None, voice_at: dict, style: dict, MG: dict, out_wav: Path) -> dict:
    n = int(total / FPS * SR)
    vo = np.zeros(n)
    if voice:
        for sid, at in voice_at.items():
            a = voice[sid]["audio"]
            s = int(at / FPS * SR)
            vo[s:s + len(a)] += a[: max(0, n - s)]
    # música: bateria a partir de la segona pantalla, cop a la targeta final
    second = screens[1]["from"] / FPS if len(screens) > 1 else 0
    end = next((sc["from"] / FPS for sc in screens if sc["kind"] == "end"), None)
    bed = musica.bed(total / FPS, second, end, style["music"])
    bed = np.pad(bed, (0, max(0, n - len(bed))))[:n]
    # efectes
    ev = sfx_events(screens, style, MG, bool(voice))
    fx = np.zeros(n)
    voiced = np.abs(vo) > 0.003
    if voice:
        ref = 20 * np.log10(np.sqrt(np.mean(vo[voiced] ** 2)) + 1e-9)
        target = ref - MG["mix"]["sfxUnderVoice"]
    else:
        target = 20 * np.log10(np.sqrt(np.mean(bed ** 2)) + 1e-9) + 4
    for e in ev:
        clip = read_wav(SFX_DIR / f"{e['name']}.wav")
        g = 10 ** ((target - peak_rms_db(clip)) / 20)
        s = int(e["f"] / FPS * SR)
        fx[s:s + len(clip)] += (clip * g)[: max(0, n - s)]
    stats = {"sfx": ev}
    if voice:
        # la música s'abaixa sota la veu (i puja 6 dB als buits); es busca el guany que deixa la veu 12 LU per sobre
        k = int(0.2 * SR)
        act = np.convolve(voiced.astype(float), np.ones(k) / k, mode="same")
        act = np.clip(act * 3, 0, 1)
        duck = 1 - 0.5 * act
        v_l = lufs(vo)
        g = 1.0
        for _ in range(3):
            under = (bed * duck * g + fx) * voiced
            diff = v_l - lufs(under)
            g *= 10 ** ((diff - (MG["mix"]["voiceOverBed"] + 1)) / 20)
        bedmix = bed * duck * g + fx
        stats["voiceOverBed"] = round(v_l - lufs(bedmix * voiced), 1)
        stats["voiceLufs"] = round(v_l, 1)
    else:
        bedmix = bed * 0.5 + fx
    master = vo + bedmix
    # màster: guany fins a −14 LUFS i un limitador a −1,5 dBFS (pic real per sota de −1 dBTP); dues voltes perquè el
    # limitador treu una mica de sonoritat
    # la mescla és mono i es desa repetida a dos canals: en estèreo sona 3 dB més (BS.1770 suma els canals)
    I = MG["mix"]["lufs"] - 10 * np.log10(2)
    for _ in range(3):
        master = limit(master * 10 ** ((I - lufs(master)) / 20), MG["mix"]["truePeak"] - 0.5)
    stats["masterLufs"] = round(lufs(master) + 10 * np.log10(2), 1)
    write_wav(out_wav, np.repeat(master[:, None], 2, axis=1).ravel(), channels=2)
    return stats
