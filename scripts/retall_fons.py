"""Retalla la persona del fons a la pista de cara (Robust Video Matting, model ONNX, amb onnxruntime).

Ús: python3 scripts/retall_fons.py <model.onnx> <cara.mp4> <alfa.mp4> [talls_en_fotogrames,...] [--prova N]

Escriu un vídeo en escala de grisos amb l'alfa (blanc = persona). El model és recurrent: arrossega memòria d'un
fotograma al següent, i es reinicia a cada canvi de clip (els talls que es passen com a llista).
"""
import subprocess
import sys
import time

import numpy as np
import onnxruntime as ort

W, H, FPS = 960, 540, 30


def main():
    model, src, dst = sys.argv[1:4]
    cuts = set(int(x) for x in sys.argv[4].split(',')) if len(sys.argv) > 4 and sys.argv[4] and not sys.argv[4].startswith('--') else set()
    limit = int(sys.argv[sys.argv.index('--prova') + 1]) if '--prova' in sys.argv else None
    so = ort.SessionOptions()
    so.intra_op_num_threads = 4
    sess = ort.InferenceSession(model, so, providers=['CPUExecutionProvider'])
    dec = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    enc = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', dst], stdin=subprocess.PIPE)
    ratio = np.array([0.4], dtype=np.float32)
    rec = [np.zeros((1, 1, 1, 1), dtype=np.float32)] * 4
    n, t0 = 0, time.time()
    while True:
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3 or (limit and n >= limit):
            break
        if n in cuts:
            rec = [np.zeros((1, 1, 1, 1), dtype=np.float32)] * 4
        x = np.frombuffer(buf, np.uint8).reshape(H, W, 3).transpose(2, 0, 1)[None].astype(np.float32) / 255
        fgr, pha, *rec = sess.run(None, {'src': x, 'r1i': rec[0], 'r2i': rec[1], 'r3i': rec[2], 'r4i': rec[3], 'downsample_ratio': ratio})
        enc.stdin.write((np.clip(pha[0, 0], 0, 1) * 255).astype(np.uint8).tobytes())
        n += 1
        if n % 500 == 0:
            print(f'{n} fotogrames, {(time.time() - t0) / n * 1000:.0f} ms/fotograma', flush=True)
    enc.stdin.close()
    enc.wait()
    dec.kill()
    print(f'{n} fotogrames en {time.time() - t0:.0f} s -> {dst}')


if __name__ == '__main__':
    main()
