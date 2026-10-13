#!/usr/bin/env bash
# Prepara l'editor de vista prèvia d'un projecte (src/editor) a projectes/<nom>/out/editor/:
# versions lleugeres de les preses (960×540 amb so), editor.json (de munta.py), editor.js i la pàgina.
# Ús: scripts/editor.sh projectes/<nom>   (cal haver executat abans scripts/munta.py)
set -euo pipefail
P="$1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$P/out/editor"
mkdir -p "$OUT/media"
for v in "$P"/work/*.1920x1080.mp4; do
  n="$(basename "$v" .1920x1080.mp4)"
  ffmpeg -v error -y -i "$v" -i "$P/work/$n.48k.wav" -map 0:v -map 1:a -vf scale=960:540 \
    -c:v libx264 -preset slow -b:v 750k -maxrate 900k -bufsize 1800k -g 30 -pix_fmt yuv420p \
    -c:a aac -b:a 64k -ac 1 -movflags +faststart "$OUT/media/$n.mp4"
done
cp "$P/work/editor.json" "$OUT/editor.json"
cp "$ROOT/src/editor/index.html" "$OUT/index.html"
(cd "$ROOT" && npx esbuild src/editor/app.tsx --bundle --minify --format=iife --target=es2020 \
  --loader:.woff2=file --asset-names=[name] --define:process.env.NODE_ENV='"production"' \
  --outfile="$OUT/editor.js" --log-level=warning)
ls -la "$OUT" "$OUT/media"
