"""Pistes per a la demo per a centres «amb marc» (composició DemoPro de Remotion).

Ús: python3 scripts/demo_pro_pistes.py projectes/demo-escoles

Llegeix cara.json (quins clips de cara cobreixen cada tros i amb quin desfasament), work/trossos-sense-cara.json
(d'on surt cada tros de pantalla a la gravació original) i edl.json (on era la càmera de l'OBS). Escriu a
remotion-pro/ (la carpeta pública de la composició):

  pantalla.mp4  cada tros de pantalla amb H segons de més a banda i banda (per fer fosos entre talls), sense la barra
                del navegador, amb la càmera antiga tapada i ja a la mida de la finestra de DemoPro (SCREEN_W d'ample),
                perquè hi vagi píxel a píxel; poca compressió (CRF_SCREEN), 30 fps
  work/pro/cara.mp4  cada tros de cara, retallat al voltant de la cara (16:9, 960×540), també amb H segons de marge
                (només si encara no hi és: alfa.mp4 de retall_fons.py hi va lligat fotograma a fotograma)
  veu.wav       la veu ja muntada i normalitzada (la de out/demo-unimatx-escoles-amb-cara.mp4)
  dades.json    on va cada pla a la sortida i d'on es llegeix, en fotogrames, els temps de les paraules i la mida
                de pantalla.mp4 (DemoPro la llegeix d'aquí)
"""
import json
import subprocess
import sys
from pathlib import Path

FPS = 30
H = 0.5  # segons de marge per als fosos
SCREEN_W = 1600  # amplada de la finestra a DemoPro (brand/unimatx.ts → DEMO_PRO.win.w)
CRF_SCREEN = 10  # gairebé sense pèrdua: el text de la pantalla és el que més es nota
TRIM_TOP = 24  # files de la gravació just sota la barra del navegador: la cantonada fosca arrodonida de la pàgina


def run(cmd):
    subprocess.run(cmd, check=True)


def frames(t):
    return round(t * FPS)


def main():
    root = Path(sys.argv[1])
    out = root / 'remotion-pro'
    tmp = root / 'work' / 'pro'
    out.mkdir(exist_ok=True)
    tmp.mkdir(parents=True, exist_ok=True)
    cfg = json.loads((root / 'cara.json').read_text())
    pieces = json.loads((root / 'work' / 'trossos-sense-cara.json').read_text())
    edl = json.loads((root / 'edl.json').read_text())
    raw = root / edl['source']

    # Pantalla: un tros per peça de l'EDL, amb marge. Es treu la barra del navegador (DemoPro hi posa una barra neta),
    # es tapa la càmera antiga com a talla_preses.py i s'escala un sol cop, a la mida de la finestra.
    rw, rh = (int(v) for v in subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
                                             '-of', 'csv=p=0', str(raw)], capture_output=True, text=True, check=True).stdout.split(','))
    c = edl['cover']
    x, w, h = c['x'], c['w'], c['h']
    top = c['chrome'] + TRIM_TOP
    sh = int(SCREEN_W * (rh - top) / rw) // 2 * 2
    crop_h = round(sh * rw / SCREEN_W)
    cover = (f"fps={FPS},crop={rw}:{crop_h}:0:{top},split=2[a][c];[c]crop={w}:4:{x}:{h - top + 3},scale={w}:{h - top}:flags=neighbor,"
             f"boxblur=1:1:4:1[m];[a][m]overlay={x}:0,scale={SCREEN_W}:{sh}:flags=lanczos,format=yuv420p[v]")
    lst, fpos, pmap = [], 0, []
    for p in pieces:
        a, b = p['src']
        s0 = max(0.0, a - H)
        n = frames((b + H) - s0)
        f = tmp / f"p{p['i']:02d}-{SCREEN_W}x{sh}.mp4"
        if not f.exists():
            run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f'{s0:.3f}', '-i', str(raw), '-t', f'{n / FPS + 0.2:.3f}',
                 '-filter_complex', cover, '-map', '[v]', '-frames:v', str(n), '-an', '-c:v', 'libx264', '-crf', str(CRF_SCREEN),
                 '-preset', 'slow', '-g', '30', str(f)])
        pmap.append({'i': p['i'], 'demo': [p['t0'], p['t1']], 'src': [a, b], 'file0': fpos, 'srcStart': s0})
        lst.append(f"file '{f.name}'")
        fpos += n
    (tmp / 'pantalla.txt').write_text('\n'.join(lst) + '\n')
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(tmp / 'pantalla.txt'), '-c', 'copy',
         '-movflags', '+faststart', str(out / 'pantalla.mp4')])

    # Sortida: els trossos de cara.json un darrere l'altre. Pla de pantalla = intersecció de cada tros amb cada peça.
    make_faces = not (tmp / 'cara.mp4').exists()
    shots, faces, O = [], [], 0
    lst, fpos = [], 0
    for r_i, r in enumerate(cfg['runs']):
        n = frames(r['v1'] - r['v0'])
        hold = r.get('hold', 0)
        vis_end = r['v1'] - hold
        for p in pmap:
            lo, hi = max(r['v0'], p['demo'][0]), min(vis_end, p['demo'][1])
            if hi - lo < 1 / FPS:
                continue
            src = p['src'][0] + (lo - p['demo'][0])
            shots.append({'piece': p['i'], 'from': O + frames(lo - r['v0']), 'dur': frames(hi - lo),
                          'file': p['file0'] + frames(src - p['srcStart'])})
        if hold > 0:
            last = shots[-1]
            shots.append({'piece': last['piece'], 'from': last['from'] + last['dur'], 'dur': O + n - (last['from'] + last['dur']),
                          'file': last['file'] + last['dur'] - 1, 'freeze': True})
        # cara: el tros sencer del clip, amb marge
        cx, cy, cw = cfg['crop'][r['clip']]
        chh = round(cw * 9 / 16 / 2) * 2
        c0 = max(0.0, r['v0'] - r['c'] - H)
        m = frames((r['v1'] - r['c'] + H) - c0)
        f = tmp / f"c{r_i:02d}.mp4"
        if make_faces and not f.exists():
            run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f'{c0:.3f}', '-i', str(Path(cfg['clips']) / f"{r['clip']}.mov"),
                 '-t', f'{m / FPS + 0.2:.3f}', '-vf', f"fps={FPS},crop={cw}:{chh}:{cx - cw // 2}:{cy - chh // 2},scale=960:540,format=yuv420p",
                 '-frames:v', str(m), '-an', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-g', '30', str(f)])
        faces.append({'run': r_i, 'clip': r['clip'], 'from': O, 'dur': n, 'file': fpos + frames((r['v0'] - r['c']) - c0)})
        lst.append(f"file '{f.name}'")
        fpos += m
        r['out0'] = O
        O += n
    if make_faces:
        (tmp / 'cara.txt').write_text('\n'.join(lst) + '\n')
        run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(tmp / 'cara.txt'), '-c', 'copy',
             '-movflags', '+faststart', str(tmp / 'cara.mp4')])
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(root / 'out' / cfg['output']), '-vn', '-ac', '2', '-ar', '48000',
         '-c:a', 'pcm_s16le', str(out / 'veu.wav')])

    # Paraules dites, en temps de sortida (per sincronitzar els rètols amb la veu).
    words = []
    for r in cfg['runs']:
        ws = json.loads((root / 'work' / 'cara' / f"{r['clip']}.words.json").read_text())
        for wd in ws:
            v = wd['s'] + r['c']
            if r['v0'] <= v < r['v1']:
                words.append({'w': wd['w'], 't': round((r['out0'] + frames(v - r['v0'])) / FPS, 2)})
    words.sort(key=lambda d: d['t'])
    # Temps de la demo (pantalla) → temps de sortida, per als canvis de part.
    def demo_to_out(v):
        for r in cfg['runs']:
            if r['v0'] <= v < r['v1'] - r.get('hold', 0):
                return round((r['out0'] + frames(v - r['v0'])) / FPS, 2)
        return None
    data = {'fps': FPS, 'durationInFrames': O, 'screen': {'w': SCREEN_W, 'h': sh}, 'shots': shots, 'faces': faces, 'words': words,
            'pieceStart': {p['i']: demo_to_out(p['demo'][0] + 0.01) for p in pmap}}
    (out / 'dades.json').write_text(json.dumps(data, ensure_ascii=False))
    print(len(shots), 'plans de pantalla,', len(faces), 'trossos de cara,', O, 'fotogrames')


if __name__ == '__main__':
    main()
