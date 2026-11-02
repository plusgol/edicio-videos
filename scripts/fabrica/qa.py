"""Fàbrica de vídeos · la comprovació, perquè cap vídeo surti sense mirar.

Per a cada estil:
  - zona segura, mesurada: el render de QA (Fabrica amb {"qa": true}) pinta en magenta sobre negre tot el que s'ha de
    llegir; en els fotogrames on cada pantalla està quieta, cap píxel magenta pot sortir de MG.safe (la regla 07 de
    la guia: «nothing in the top 10 %, the bottom 20 % or the right 15 %»);
  - en vertical, el full de Reels de scripts/zona_segura.py (amb els botons pintats) per mirar-ho a ull;
  - sonoritat i pic real del vídeo final; la veu, quants LU per sobre de la música i els efectes;
  - fotogrames negres;
  - la veu transcrita (faster-whisper large-v3) contra el que havia de dir.
Escriu out/informe.md i retorna el resum.
"""
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
WHISPER_PY = "/home/user/tools/whisperx-venv/bin/python"
sys.path.insert(0, str(HERE))
from guio import norm  # noqa: E402

FPS = 30


def settled(sc: dict, MG: dict) -> list:
    """Fotogrames (absoluts) en què la pantalla està quieta: tot ha entrat i encara no marxa."""
    s = max(w["f"] for w in sc["words"]) + 24
    if sc.get("itemAt"):
        s = max(s, sc["itemAt"][-1] + MG["move"]["tick"] + 6)
    if "barAt" in sc:
        s = max(s, sc["barAt"] + MG["move"]["fill"])
    if sc.get("reframe"):
        s = max(s, MG["factory"]["pre"] + MG["move"]["reframe"] + 2)
    for w in sc["words"]:
        if "count" in w:
            s = max(s, w["f"] + MG["move"]["count"])
    if "punchAt" in sc:
        s = max(s, sc["punchAt"] + MG["move"]["punch"] + 2)
    e = sc["frames"] - 14
    pts = sorted({min(s, e), (min(s, e) + e) // 2, e}) if e > 0 else [sc["frames"] // 2]
    return [sc["from"] + p for p in pts]


def frames_rgb(video: Path, frames: list, w: int, h: int) -> np.ndarray:
    sel = "+".join(f"eq(n\\,{f})" for f in frames)
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(video), "-vf", f"select='{sel}'", "-fps_mode", "passthrough",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)


def safe_check(qa_mp4: Path, plan: dict, MG: dict, fmt: str, W: int, H: int, scale: float) -> list:
    w, h = round(W * scale), round(H * scale)
    z = MG["safe"][fmt]
    x0, y0, x1, y1 = (z["x0"] * scale, z["y0"] * scale, z["x1"] * scale, z["y1"] * scale)
    checks = [(sc, f) for sc in plan["screens"] for f in settled(sc, MG)]
    imgs = frames_rgb(qa_mp4, [f for _, f in checks], w, h)
    out = []
    for (sc, f), im in zip(checks, imgs):
        r, g, b = (im[..., k].astype(int) for k in range(3))
        m = (r > 120) & (b > 120) & (g < 110)
        if not m.any():
            out.append({"screen": sc["id"], "f": f, "ok": False, "why": "no hi ha res a llegir (pantalla buida?)"})
            continue
        ys, xs = np.nonzero(m)
        bx = (xs.min() / scale, ys.min() / scale, (xs.max() + 1) / scale, (ys.max() + 1) / scale)
        tol = 2
        outside = (xs < x0 - tol) | (xs > x1 + tol) | (ys < y0 - tol) | (ys > y1 + tol)
        ok = int(outside.sum()) <= 2
        out.append({"screen": sc["id"], "f": f, "ok": ok, "box": [round(v) for v in bx],
                    "why": "" if ok else f"{int(outside.sum())} píxels fora de la zona segura"})
    return out


def loudness(mp4: Path) -> dict:
    err = subprocess.run(["ffmpeg", "-nostdin", "-v", "info", "-i", str(mp4), "-af", "loudnorm=print_format=json", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    m = json.loads(err[err.rindex("{"):err.rindex("}") + 1])
    return {"lufs": float(m["input_i"]), "tp": float(m["input_tp"])}


def black(mp4: Path) -> list:
    err = subprocess.run(["ffmpeg", "-nostdin", "-v", "info", "-i", str(mp4), "-vf", "blackdetect=d=0.5:pix_th=0.06", "-an", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", err)


def asr(mp4: Path, lang: str) -> str:
    code = ("import sys\nfrom faster_whisper import WhisperModel\n"
            "m = WhisperModel('large-v3', device='cpu', compute_type='int8')\n"
            f"segs, _ = m.transcribe(sys.argv[1], language='{lang}', beam_size=5)\n"
            "print(' '.join(s.text.strip() for s in segs))\n")
    return subprocess.run([WHISPER_PY, "-c", code, str(mp4)], capture_output=True, text=True, check=True).stdout.strip()


def compare(said: str, heard: str):
    a = [norm(x) for x in said.split() if norm(x)]
    b = [norm(x) for x in heard.split() if norm(x)]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    diffs = [(" ".join(a[i1:i2]), " ".join(b[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal"]
    return round(sm.ratio(), 3), diffs


def run(root: Path, plan: dict, MG: dict, videos: dict, fmt: str, W: int, H: int, qa_scale: float) -> str:
    name = root.name
    lines = [f"# Informe de la fàbrica · {name}", "", f"Durada: {plan['total'] / FPS:.2f} s · {len(plan['screens'])} pantalles · format {fmt} ({W}×{H})", ""]
    ok_all = True
    first = None
    for st, (mp4, qa_mp4) in videos.items():
        first = first or mp4
        lines += [f"## Estil `{st}`", "", f"Vídeo: `out/{mp4.name}`", ""]
        res = safe_check(qa_mp4, plan, MG, fmt, W, H, qa_scale)
        bad = [r for r in res if not r["ok"]]
        ok_all &= not bad
        lines.append(f"- Zona segura: {'tot a dins' if not bad else 'FORA'} ({len(res)} fotogrames quiets mesurats)")
        for r in bad:
            lines.append(f"  - pantalla {r['screen']}, fotograma {r['f']}: {r['why']} (caixa {r.get('box')})")
        if fmt == "vertical":
            sheet = root / "out" / f"{name}-{st}-zona.jpg"
            mids = [settled(sc, MG)[1 if len(settled(sc, MG)) > 1 else 0] / FPS for sc in plan["screens"]]
            subprocess.run(["python3", str(REPO / "scripts" / "zona_segura.py"), str(mp4), str(sheet), "1", ",".join(f"{t:.2f}" for t in mids)],
                           check=True, capture_output=True)
            lines.append(f"- Full de Reels: `out/{sheet.name}`")
        ld = loudness(mp4)
        okl = abs(ld["lufs"] - MG["mix"]["lufs"]) <= 1 and ld["tp"] <= MG["mix"]["truePeak"] + 0.3
        ok_all &= okl
        lines.append(f"- So: {ld['lufs']:.1f} LUFS, pic real {ld['tp']:.1f} dBTP ({'bé' if okl else 'REVISAR'})")
        s = plan["stats"][st]
        if "voiceOverBed" in s:
            okv = s["voiceOverBed"] >= MG["mix"]["voiceOverBed"]
            ok_all &= okv
            lines.append(f"- Veu per sobre de música i efectes: {s['voiceOverBed']} LU ({'bé' if okv else 'POC'}; mínim {MG['mix']['voiceOverBed']})")
        lines.append(f"- Efectes ({len(s['sfx'])}): " + ("; ".join(f"{e['name']} a {e['f'] / FPS:.1f} s ({e['why']})" for e in s["sfx"]) or "cap"))
        bl = black(mp4)
        ok_all &= not bl
        lines.append(f"- Negres: {'cap' if not bl else ', '.join(f'{a}–{b} s' for a, b in bl)}")
        lines.append("")
    if plan["brief"].get("voice") and first is not None and plan.get("voiceAt"):
        heard = asr(first, plan["brief"].get("language", "es"))
        said = " ".join(plan["spoken"])
        for k, v in plan["brief"].get("pronounce", {}).items():
            said = said.replace(k, v)
        ratio, diffs = compare(said, heard)
        lines += ["## Veu escoltada (transcripció automàtica contra el guió)", "", f"Coincidència: {ratio:.0%}", "", f"> {heard}", ""]
        if diffs:
            lines.append("Diferències (guió → s'entén):")
            lines += [f"- «{a}» → «{b}»" for a, b in diffs]
        lines.append("")
    lines.append("Resultat: " + ("tot correcte." if ok_all else "hi ha coses a revisar (a dalt, en majúscules)."))
    text = "\n".join(lines)
    (root / "out" / "informe.md").write_text(text + "\n")
    return text
