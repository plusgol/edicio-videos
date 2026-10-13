#!/usr/bin/env bash
# Munta i renderitza un projecte. Ús: scripts/render.sh projectes/<nom> [--browser-executable=...]
set -euo pipefail
P="$1"; shift
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
python3 -I "$ROOT/scripts/munta.py" "$P"
npx remotion render src/index.ts Video "$P/out/video.mp4" --public-dir="$P" "$@"
ffmpeg -hide_banner -nostats -i "$P/out/video.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -A12 "Summary:"
