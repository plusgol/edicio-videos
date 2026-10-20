"""Grava una cerca real de YouTube fent scroll (per a intros a l'estil tef: «mira quants vídeos de X hi ha»).

Ús: python3 -I scripts/captura_youtube.py "<cerca>" <sortida.mp4> [segons=6] [px_per_fotograma=7]

Obre la cerca amb Chromium sense sessió (tema fosc, en castellà), fa captures fotograma a fotograma mentre baixa i les
munta a 30 fps. És una captura real dels resultats d'aquell moment: no s'hi toca res. Desa també <sortida>.json amb la
data i la cerca, per poder-ho citar.
"""
import json
import subprocess
import sys
import tempfile
import time
import urllib.parse
from pathlib import Path

from playwright.sync_api import sync_playwright

query, out = sys.argv[1], Path(sys.argv[2])
secs = float(sys.argv[3]) if len(sys.argv) > 3 else 6
step = int(sys.argv[4]) if len(sys.argv) > 4 else 7
FPS = 30
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

with tempfile.TemporaryDirectory() as tmp, sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    ctx = b.new_context(viewport={"width": 1920, "height": 1080}, locale="es-ES")
    # PREF f6=400: tema fosc de YouTube sense iniciar sessió.
    ctx.add_cookies([{"name": "PREF", "value": "f6=400&hl=es", "domain": ".youtube.com", "path": "/"}])
    pg = ctx.new_page()
    pg.goto("https://www.youtube.com/results?search_query=" + urllib.parse.quote_plus(query), wait_until="domcontentloaded", timeout=60000)
    pg.wait_for_timeout(5000)
    # Carrega les miniatures de tot el recorregut abans de gravar (YouTube les carrega en fer scroll).
    total = int(secs * FPS * step)
    for y in range(0, total + 1080, 540):
        pg.mouse.wheel(0, 540)
        pg.wait_for_timeout(250)
    pg.evaluate("window.scrollTo(0, 0)")
    pg.wait_for_timeout(1500)
    for i in range(int(secs * FPS)):
        pg.evaluate(f"window.scrollTo(0, {i * step})")
        pg.screenshot(path=f"{tmp}/f{i:05d}.png")
    b.close()
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", f"{tmp}/f%05d.png", "-c:v", "libx264", "-preset", "medium",
                    "-crf", "16", "-pix_fmt", "yuv420p", str(out)], check=True)
out.with_suffix(".json").write_text(json.dumps({"query": query, "capturedAt": time.strftime("%Y-%m-%d %H:%M"), "secs": secs}, ensure_ascii=False))
print(f"{out} ({secs} s)")
