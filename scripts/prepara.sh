#!/usr/bin/env bash
# Prepara totes les preses d'un projecte: àudio, transcripció i reenquadrament amb seguiment de cara.
# Ús: scripts/prepara.sh projectes/<nom> [AMPLExALT=1920x1080]   (1080x1920 per a Shorts)
set -euo pipefail
P="$1"
SIZE="${2:-1920x1080}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$P/work" "$P/out"
for f in "$P"/input/*.mp4 "$P"/input/*.mov "$P"/input/*.MOV; do
  [ -e "$f" ] || continue
  n="$(basename "${f%.*}")"
  echo "== $n"
  ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate:stream_side_data=rotation -of compact "$f"
  ffmpeg -v error -y -i "$f" -vn -ac 1 -ar 16000 -c:a pcm_s16le "$P/work/$n.16k.wav"
  ffmpeg -v error -y -i "$f" -vn -ac 1 -ar 48000 -c:a pcm_s16le "$P/work/$n.48k.wav"
  python3 -I "$ROOT/scripts/transcriu.py" "$P/work/$n.16k.wav" "$ROOT/models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8" "$P/work/$n.transcript.json"
  YUNET_MODEL="$ROOT/models/yunet.onnx" python3 -I "$ROOT/scripts/reencuadra.py" "$f" "$P/work/$n.$SIZE.mp4" "$P/work/$n.$SIZE.track.json" 30 "$SIZE"
done
