"""Munta una gravació llarga a partir d'una llista de trams bons (EDL), sense efectes: talls nets i prou.

Ús: python3 scripts/talla_preses.py projectes/<nom>        (llegeix <nom>/edl.json i work/vad.json)

edl.json:
  {"source": "input/raw.mkv", "width": 1920, "fps": 30, "loudness": -16,
   "keep": [{"from": 0.0, "to": 25.2, "reason": "…"}, {"from": …, "to": …, "hardTo": true, "reason": "…"}, …]}

- Cada tram s'ajusta a la veu detectada (work/vad.json, Silero): comença 0,12 s abans de la primera síl·laba i acaba
  0,25 s després de l'última, sense menjar-se cap paraula.
- Dins d'un tram, les pauses de més de 0,8 s es deixen en 0,4 s (el silenci del mig es treu).
- Cada tros es codifica a part (busca exacta) i després s'enganxen; a cada unió, 15 ms de fosa d'àudio perquè no faci clic.
- Àudio final: filtre passa-alt a 80 Hz, reducció suau de soroll i volum a `loudness` LUFS.
"""
import json
import subprocess
import sys
from pathlib import Path

LEAD, TAIL, MAXPAUSE, KEEPPAUSE = 0.12, 0.25, 0.8, 0.4


def pieces(keep, vad):
    out = []
    for k in keep:
        a, b = k["from"], k["to"]
        hard = k.get("hardTo", False)  # tall exacte a «to» (a mitja frase, abans d'una part que es repeteix més tard)
        sp = [(max(s, a - 0.3), min(e, b if hard else b + 0.3)) for s, e in vad if e > a and s < b]
        if not sp:
            continue
        cur = [sp[0][0] - LEAD, sp[0][1]]
        for s, e in sp[1:]:
            if s - cur[1] > MAXPAUSE:
                cur[1] += KEEPPAUSE / 2
                out.append(cur)
                cur = [s - KEEPPAUSE / 2, e]
            else:
                cur[1] = e
        cur[1] = b if hard else cur[1] + TAIL
        out.append(cur)
    # cap tros no pot trepitjar l'anterior
    clean = []
    for s, e in out:
        s = max(s, clean[-1][1] if clean else 0.0)
        if e - s > 0.15:
            clean.append([round(s, 3), round(e, 3)])
    return clean


def main():
    root = Path(sys.argv[1])
    edl = json.loads((root / "edl.json").read_text())
    vad = json.loads((root / "work/vad.json").read_text())
    src = root / edl["source"]
    W, FPS = edl.get("width", 1920), edl.get("fps", 30)
    ps = pieces(edl["keep"], vad)
    tmp = root / "work/trossos"
    tmp.mkdir(parents=True, exist_ok=True)
    for f in tmp.glob("*.mkv"):
        f.unlink()
    lst = []
    for i, (s, e) in enumerate(ps):
        d = e - s
        f = tmp / f"{i:04d}.mkv"
        subprocess.run([
            "ffmpeg", "-v", "error", "-y", "-ss", f"{s:.3f}", "-i", str(src), "-t", f"{d:.3f}",
            "-vf", f"scale={W}:-2:flags=lanczos,fps={FPS},format=yuv420p",
            "-af", f"aresample=48000,afade=t=in:d=0.015,afade=t=out:st={max(0, d - 0.015):.3f}:d=0.015",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-g", str(FPS * 2),
            "-c:a", "pcm_s16le", "-ac", "2", str(f)], check=True)
        lst.append(f"file '{f.name}'")
        print(f"{i:3d} {s:8.2f}-{e:8.2f} ({d:5.1f} s)", flush=True)
    (tmp / "llista.txt").write_text("\n".join(lst) + "\n")
    joined = root / "work/muntat.mkv"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(tmp / "llista.txt"), "-c", "copy", str(joined)], check=True)
    L = edl.get("loudness", -16)
    out = root / "out" / edl.get("output", "video.mp4")
    out.parent.mkdir(exist_ok=True)
    pre = "highpass=f=80,afftdn=nf=-30"
    meas = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(joined), "-af", f"{pre},loudnorm=I={L}:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                          capture_output=True, text=True).stderr
    j = json.loads(meas[meas.rindex("{"): meas.rindex("}") + 1])
    ln = (f"loudnorm=I={L}:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
          f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.84:level=false")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(joined), "-c:v", "copy", "-af", f"{pre},{ln}", "-c:a", "aac", "-b:a", "192k",
                    "-movflags", "+faststart", str(out)], check=True)
    total = sum(e - s for s, e in ps)
    print(f"{len(ps)} trossos, {total / 60:.1f} min -> {out}")


if __name__ == "__main__":
    main()
