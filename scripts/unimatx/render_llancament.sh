#!/usr/bin/env bash
# Renderitza el vídeo de presentació d'UniMatx.
# Ús: scripts/unimatx/render_llancament.sh                                   (v1 → out/unimatx-presentacio.mp4)
#     scripts/unimatx/render_llancament.sh UniLlancamentBoom unimatx-presentacio-boom   (v2)
# Abans: la veu (veu_linies.py) i la música (musica_llancament.py, musica_boom.py) a projectes/unimatx-llancament/remotion.
# Sortida: 1920×1080, 30 fps, H.264, so a −14 LUFS amb pic per sota de −1 dB.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
P="$ROOT/projectes/unimatx-llancament"
COMP="${1:-UniLlancament}"
NOM="${2:-unimatx-presentacio}"
mkdir -p "$P/out" "$P/work"
cd "$ROOT"
npx remotion render src/index.ts "$COMP" "$P/work/$NOM.raw.mp4" --public-dir="$P/remotion" \
  --crf=18 --concurrency=4 --ignore-certificate-errors \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --log=error
J=$(ffmpeg -hide_banner -nostats -i "$P/work/$NOM.raw.mp4" -af "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$P/work/$NOM.raw.mp4" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,alimiter=limit=0.84:level=false" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$P/out/$NOM.mp4"
rm -f "$P/work/$NOM.raw.mp4"
echo "$NOM: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$P/out/$NOM.mp4") s"
