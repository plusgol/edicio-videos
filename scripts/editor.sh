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
  # Mateixa versió en WebM (VP9 + Opus) per als navegadors sense H.264; l'editor tria la que pot reproduir.
  ffmpeg -v error -y -i "$v" -i "$P/work/$n.48k.wav" -map 0:v -map 1:a -vf scale=960:540 \
    -c:v libvpx-vp9 -b:v 650k -deadline good -cpu-used 5 -row-mt 1 -g 30 -c:a libopus -b:a 64k -ac 1 "$OUT/media/$n.webm"
done
for w in "$P"/work/*.persona.webm; do
  [ -e "$w" ] || continue
  # Persona retallada (alfa) més lleugera per a la vista prèvia: el límit per fitxer de l'editor publicat és de 15 MB.
  ffmpeg -v error -y -c:v libvpx-vp9 -i "$w" -vf scale=640:360 -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 500k \
    -auto-alt-ref 0 -deadline good -cpu-used 5 -row-mt 1 -an "$OUT/media/$(basename "$w")"
done
rm -rf "$OUT/assets" && cp -r "$P/assets" "$OUT/assets" 2>/dev/null || true
cp "$P/work/editor.json" "$OUT/editor.json"
cp "$ROOT/src/editor/index.html" "$OUT/index.html"
(cd "$ROOT" && npx esbuild src/editor/app.tsx --bundle --minify --format=iife --target=es2020 \
  --loader:.woff2=file --asset-names=[name] --define:process.env.NODE_ENV='"production"' \
  --outfile="$OUT/editor.js" --log-level=warning)
ls -la "$OUT" "$OUT/media"
