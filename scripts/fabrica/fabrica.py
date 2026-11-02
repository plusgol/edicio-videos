"""Fàbrica de vídeos: d'un brief a un vídeo acabat i comprovat, amb una sola ordre.

Ús: [ELEVENLABS_API_KEY=…] python3 scripts/fabrica/fabrica.py projectes/<nom> [--estils kinetic,glass] [--sense-veu]
                                                                         [--sense-render] [--escala 2]

Llegeix projectes/<nom>/brief.json (format a docs/FABRICA.md) i fa, per ordre:
  1. el guió: una frase per pantalla, *paraules clau*, números que roden, llistes, barres, captures (guio.py);
  2. la veu, pantalla a pantalla, amb ElevenLabs i el temps de cada paraula (so.py; es desa a el/ i no es torna a
     pagar); sense veu, el ritme de lectura;
  3. la línia de temps: cada paraula surt quan es diu i cada frase es queda quieta prou per llegir-la (guio.py);
  4. per a cada estil, la música (musica.py), els efectes segons la regla de la guia i la mescla a −14 LUFS (so.py);
  5. remotion/fabrica.json i el render de la composició Fabrica (src/fabrica/Fabrica.tsx) a out/<nom>-<estil>.mp4;
  6. la QA (qa.py): zona segura mesurada píxel a píxel, full de Reels, sonoritat, veu per sobre del llit, negres i
     la veu transcrita contra el guió. Ho escriu a out/informe.md.
Tots els valors surten de brand/mg.ts (MG i STYLES).
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(HERE))
import guio  # noqa: E402
import qa  # noqa: E402
import so  # noqa: E402

CHROME = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"
RENDER_FLAGS = ["--ignore-certificate-errors", f"--browser-executable={CHROME}", "--log=error"]


def brand_tokens(work: Path) -> dict:
    """MG i STYLES de brand/mg.ts, tal com els veu Remotion (una sola font per als dos costats)."""
    out = work / "mg.mjs"
    subprocess.run(["npx", "esbuild", "brand/mg.ts", "--bundle", "--format=esm", "--platform=node", f"--outfile={out}", "--log-level=error"],
                   cwd=REPO, check=True)
    js = f"import('{out}').then(m => process.stdout.write(JSON.stringify({{MG: m.MG, STYLES: m.STYLES}})))"
    return json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)


def image_size(path: Path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True).stdout.strip()
    w, h = out.split(",")[:2]
    return int(w), int(h)


def publish(src: Path, pub: Path, name: str) -> dict:
    """Posa una imatge del projecte a la carpeta pública de Remotion (enllaç dur: no ocupa més disc)."""
    dst = pub / "img" / name
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        dst.unlink()
    try:
        os.link(src, dst)
    except OSError:
        shutil.copy2(src, dst)
    w, h = image_size(src)
    return {"src": f"img/{name}", "w": w, "h": h}


def main():
    root = Path(sys.argv[1]).resolve()
    args = sys.argv[2:]
    brief = json.loads((root / "brief.json").read_text())
    styles = args[args.index("--estils") + 1].split(",") if "--estils" in args else brief.get("styles", ["glass"])
    scale = args[args.index("--escala") + 1] if "--escala" in args else "1"
    no_voice = "--sense-veu" in args or not brief.get("voice")
    work, pub, out = root / "work", root / "remotion", root / "out"
    for d in (work, pub, out):
        d.mkdir(parents=True, exist_ok=True)
    tok = brand_tokens(work)
    MG, STYLES = tok["MG"], tok["STYLES"]
    for st in styles:
        if st not in STYLES:
            sys.exit(f"Estil desconegut: {st}. N'hi ha: {', '.join(STYLES)}")
    fmt = brief.get("format", "vertical")
    W, H = MG["size"][fmt]
    name = root.name

    print("1/6 guió", flush=True)
    screens = guio.screens_of(brief)
    for sc in screens:
        print(f"   {sc['id']} {sc['kind']:5s} {guio.plain(sc['text'])}")

    voice = None
    if not no_voice:
        print("2/6 veu (ElevenLabs, una crida per pantalla; les desades no es tornen a pagar)", flush=True)
        try:
            voice = so.voice_lines(screens, brief, root / "el")
        except KeyError:
            sys.exit("Falta ELEVENLABS_API_KEY (i hi ha frases sense veu desada). Passa-la per l'entorn o fes servir --sense-veu.")
        for sc in screens:
            v = voice[sc["id"]]
            print(f"   {sc['id']} {v['frames'] / 30:5.2f} s  {v['said']}")
    else:
        print("2/6 sense veu: ritme de lectura", flush=True)

    print("3/6 línia de temps", flush=True)
    screens, total, voice_at = guio.timeline(screens, voice, MG)
    for sc in screens:
        print(f"   {sc['id']} {sc['from'] / 30:6.2f} s  +{sc['frames'] / 30:5.2f} s")
    print(f"   total {total / 30:.2f} s")

    for sc in screens:
        if sc.get("image"):
            src = (root / sc["image"]).resolve()
            sc["image"] = publish(src, pub, f"{sc['id']}{src.suffix}")
    logo = publish((root / brief["logo"]).resolve(), pub, "logo" + Path(brief["logo"]).suffix) if brief.get("logo") else None

    print("4/6 música, efectes i mescla", flush=True)
    audio, stats = {}, {}
    for st in styles:
        wav = pub / f"mix-{st}.wav"
        stats[st] = so.mix(screens, total, voice, voice_at, STYLES[st], MG, wav)
        audio[st] = wav.name
        extra = f", veu {stats[st]['voiceOverBed']} LU per sobre del llit" if "voiceOverBed" in stats[st] else ""
        print(f"   {st}: {len(stats[st]['sfx'])} efectes{extra}")

    keep = ("id", "kind", "from", "frames", "words", "label", "sub", "items", "itemWords", "itemAt", "bar", "barAt", "image", "focus", "reframe", "punchAt")
    data = {"title": brief.get("title", name), "format": fmt, "width": W, "height": H, "fps": 30, "durationInFrames": total, "logo": logo,
            "screens": [{k: sc[k] for k in keep if k in sc} for sc in screens], "audio": audio}
    (pub / "fabrica.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    plan = {"brief": brief, "screens": screens, "voiceAt": voice_at, "total": total, "stats": stats,
            "spoken": [sc["spoken"] for sc in screens], "styles": styles}
    (work / "pla.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1, default=str))

    if "--sense-render" in args:
        print("fet (sense render): remotion/fabrica.json")
        return
    print("5/6 render", flush=True)
    bundle = work / "bundle"
    subprocess.run(["npx", "remotion", "bundle", "src/index.ts", f"--public-dir={pub}", f"--out-dir={bundle}", "--log=error"], cwd=REPO, check=True)
    env = {**os.environ, "TMPDIR": "/dev/shm/rtmp"}
    Path("/dev/shm/rtmp").mkdir(exist_ok=True)
    videos = {}
    for st in styles:
        mp4 = out / f"{name}-{st}.mp4"
        subprocess.run(["npx", "remotion", "render", str(bundle), "Fabrica", str(mp4), f"--props={json.dumps({'style': st, 'qa': False})}",
                        f"--scale={scale}", "--crf=16", "--x264-preset=slow", "--audio-codec=aac", "--audio-bitrate=320k", *RENDER_FLAGS],
                       cwd=REPO, env=env, check=True)
        qa_mp4 = work / f"qa-{st}.mp4"
        subprocess.run(["npx", "remotion", "render", str(bundle), "Fabrica", str(qa_mp4), f"--props={json.dumps({'style': st, 'qa': True})}",
                        f"--scale={MG['qaScale']}", "--muted", "--crf=12", *RENDER_FLAGS], cwd=REPO, env=env, check=True)
        videos[st] = (mp4, qa_mp4)
        print(f"   {mp4}")

    print("6/6 QA", flush=True)
    report = qa.run(root, plan, MG, videos, fmt, W, H, MG["qaScale"])
    print(report)


if __name__ == "__main__":
    main()
