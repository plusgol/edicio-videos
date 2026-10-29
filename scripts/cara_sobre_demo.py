"""Posa la cara (clips del mòbil) en una bombolla sobre la demo sense càmera.

Ús: python3 scripts/cara_sobre_demo.py projectes/demo-escoles/cara.json

cara.json:
  demo     vídeo de pantalla (la demo sense càmera, 1920×1014 a 30 fps)
  clips    carpeta dels clips de cara (input/, només lectura)
  bubble   {"d": diàmetre, "margin": marge, "border": vora blanca}  — bombolla a baix a la dreta
  crop     {clip: [cx, cy, costat]} quadrat de la cara dins del clip (1920×1080)
  runs     [{"clip", "v0", "v1", "hold", "c", "reason"}]: el tros [v0, v1] de la demo es cobreix amb el clip, on
           temps_clip = temps_demo − c (el clip es va gravar amb el teleprompter en marxa, així que c és fix).
           «hold»: quan la presa nova comença abans que l'anterior acabi la frase, la pantalla s'atura els últims
           «hold» segons del tros (es queda quieta) perquè la imatge no faci un salt enrere.

Cada tros es fa amb el nombre exacte de fotogrames i el so ajustat a la mateixa durada; després es concatenen
i el so es normalitza en dues passades a −16 LUFS. Escriu out/<output>.
"""
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

FPS = 30
VOICE = ("aresample=48000,highpass=f=90,equalizer=f=250:t=q:w=1:g=-3,equalizer=f=3500:t=q:w=1:g=3,"
         "deesser,acompressor=threshold=-21dB:ratio=3:attack=8:release=160")


def run(cmd):
    subprocess.run(cmd, check=True)


def bubble_assets(work: Path, d: int, border: int):
    s = d + 2 * border + 40
    c = s // 2
    r = d // 2 + border
    shadow = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).ellipse((c - r, c - r + 6, c + r, c + r + 6), fill=(0, 0, 0, 110))
    ring = shadow.filter(ImageFilter.GaussianBlur(10))
    ImageDraw.Draw(ring).ellipse((c - r, c - r, c + r, c + r), fill=(255, 255, 255, 255))
    ring.save(work / 'vora.png')
    m = Image.new('L', (d * 4, d * 4), 0)
    ImageDraw.Draw(m).ellipse((0, 0, d * 4 - 1, d * 4 - 1), fill=255)
    m.resize((d, d), Image.LANCZOS).save(work / 'mascara.png')
    return s


def main():
    cfg_path = Path(sys.argv[1])
    root = cfg_path.parent
    cfg = json.loads(cfg_path.read_text())
    work = root / 'work' / 'cara' / 'trossos'
    work.mkdir(parents=True, exist_ok=True)
    b = cfg['bubble']
    d, margin, border = b['d'], b['margin'], b['border']
    s = bubble_assets(work, d, border)
    x, y = 1920 - margin - d, 1080 - margin - d
    pad_top = (1080 - cfg['demo_h']) // 2
    parts = []
    for k, r in enumerate(cfg['runs']):
        n = round((r['v1'] - r['v0']) * FPS)
        dur = n / FPS
        cx, cy, side = cfg['crop'][r['clip']]
        out = work / f'tros_{k:02d}.mkv'
        hold = r.get('hold', 0)
        fc = (f"[0:v]fps={FPS},trim=duration={dur - hold:.4f},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration={hold + 0.5:.3f},"
              f"pad=1920:1080:0:{pad_top}:color=0x16161c[bg];"
              f"[1:v]fps={FPS},crop={side}:{side}:{cx - side // 2}:{cy - side // 2},scale={d}:{d},format=rgba[c];"
              f"[3:v]format=gray[m];[c][m]alphamerge[cm];"
              f"[bg][2:v]overlay={x - (s - d) // 2}:{y - (s - d) // 2}[b1];[b1][cm]overlay={x}:{y},format=yuv420p[v];"
              f"[1:a]{VOICE},afade=t=in:d=0.02,afade=t=out:st={max(0, dur - 0.03):.3f}:d=0.03,apad,atrim=0:{dur:.4f}[a]")
        run(['ffmpeg', '-nostdin', '-v', 'error', '-y',
             '-ss', f"{r['v0']:.3f}", '-t', f'{dur + 1:.3f}', '-i', cfg['demo'],
             '-ss', f"{r['v0'] - r['c']:.3f}", '-t', f'{dur + 1:.3f}', '-i', str(Path(cfg['clips']) / f"{r['clip']}.mov"),
             '-i', str(work / 'vora.png'), '-i', str(work / 'mascara.png'),
             '-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-frames:v', str(n),
             '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-c:a', 'pcm_s16le', '-ar', '48000', str(out)])
        parts.append(out)
        print(f"{k:2d} {r['clip']} {r['v0']:7.2f}-{r['v1']:7.2f} ({dur:5.2f} s, pantalla quieta {hold:.2f} s)  {r.get('reason', '')}", flush=True)
    (work / 'llista.txt').write_text(''.join(f"file '{p.name}'\n" for p in parts))
    joined = work / 'junt.mkv'
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(work / 'llista.txt'), '-c', 'copy', str(joined)])
    ln = "loudnorm=I=-16:TP=-1.5:LRA=11"
    j = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(joined), '-af', ln + ':print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    m = json.loads(j[j.rindex('{'):j.rindex('}') + 1])
    af = (f"{ln}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
          f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,alimiter=limit=0.84:level=false")
    final = root / 'out' / cfg['output']
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(joined), '-c:v', 'copy', '-af', af,
         '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', str(final)])
    joined.unlink()
    print('->', final)


if __name__ == '__main__':
    main()
