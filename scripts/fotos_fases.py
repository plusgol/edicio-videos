"""Captures de preguntes del test per a les fases de la demo que no n'ensenyen cap (composició DemoPro).

Ús: python3 scripts/fotos_fases.py projectes/demo-escoles

Per a cada foto de retols.json → fotos, treu el fotograma «src» (segons) de la gravació original (edl.json → source),
en retalla «crop» ([x, y, amplada, alçada] en píxels de la gravació, lluny de la càmera de l'OBS) i el deixa a
remotion-pro/fotos/ a l'amplada amb què es mostra, perquè hi vagi píxel a píxel.
"""
import json
import subprocess
import sys
from pathlib import Path

PHOTO_W = 960  # amplada de la foto a DemoPro (brand/unimatx.ts → DEMO_PRO.photo.w)


def main():
    root = Path(sys.argv[1])
    raw = root / json.loads((root / 'edl.json').read_text())['source']
    out = root / 'remotion-pro' / 'fotos'
    out.mkdir(parents=True, exist_ok=True)
    for group in json.loads((root / 'retols.json').read_text())['fotos']:
        for it in group['items']:
            x, y, w, h = it['crop']
            subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(it['src']), '-i', str(raw), '-frames:v', '1',
                            '-vf', f'crop={w}:{h}:{x}:{y},scale={PHOTO_W}:-2:flags=lanczos', str(out / it['file'])], check=True)
            print(out / it['file'])


if __name__ == '__main__':
    main()
