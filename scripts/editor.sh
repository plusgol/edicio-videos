#!/usr/bin/env bash
# Prepara l'editor de vista prèvia d'un projecte (src/editor) a projectes/<nom>/out/editor/:
# versions lleugeres de les preses (amb so), editor.json (de munta.py), editor.js i la pàgina.
# L'editor publicat admet com a molt 15 MB per fitxer: el bitrate (i, si cal, la mida) s'ajusta a la durada de cada presa.
# Ús: scripts/editor.sh projectes/<nom>   (cal haver executat abans scripts/munta.py)
set -euo pipefail
P="$1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$P/out/editor"
mkdir -p "$OUT/media"
BUDGET_KBIT=100000  # ~12,5 MB per fitxer, amb marge sota el límit de 15 MB
dur() { ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$1"; }
kbps() { python3 -c "import sys; print(min(int(sys.argv[2]), int($BUDGET_KBIT / float(sys.argv[1])) - int(sys.argv[3])))" "$@"; }
for v in "$P"/work/*.1920x1080.mp4; do
  n="$(basename "$v" .1920x1080.mp4)"
  vk="$(kbps "$(dur "$v")" 750 48)"
  if [ "$vk" -ge 600 ]; then size=960:540; else size=640:360; fi
  ffmpeg -v error -y -i "$v" -i "$P/work/$n.48k.wav" -map 0:v -map 1:a -vf "scale=$size" -shortest \
    -c:v libx264 -preset slow -b:v "${vk}k" -maxrate "$((vk * 6 / 5))k" -bufsize "$((vk * 2))k" -g 30 -pix_fmt yuv420p \
    -c:a aac -b:a 48k -ac 1 -movflags +faststart "$OUT/media/$n.mp4"
  # Mateixa versió en WebM (VP9 + Opus) per als navegadors sense H.264; l'editor tria la que pot reproduir.
  ffmpeg -v error -y -i "$v" -i "$P/work/$n.48k.wav" -map 0:v -map 1:a -vf "scale=$size" -shortest \
    -c:v libvpx-vp9 -b:v "$((vk * 9 / 10))k" -deadline good -cpu-used 5 -row-mt 1 -g 30 -c:a libopus -b:a 48k -ac 1 "$OUT/media/$n.webm"
done
for w in "$P"/work/*.persona.webm; do
  [ -e "$w" ] || continue
  # Persona retallada (alfa) més lleugera per a la vista prèvia. El canal alfa de VP9 va a banda i no compta al -b:v:
  # gairebé dobla la mida, per això el bitrate de color es queda en ~55% del pressupost.
  pk="$(kbps "$(dur "$w")" 500 0)"; pk=$((pk * 55 / 100)); [ "$pk" -ge 140 ] || pk=140
  if [ "$pk" -ge 400 ]; then size=640:360; else size=480:270; fi
  ffmpeg -v error -y -c:v libvpx-vp9 -i "$w" -vf "scale=$size" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v "${pk}k" \
    -auto-alt-ref 0 -deadline good -cpu-used 5 -row-mt 1 -an "$OUT/media/$(basename "$w")"
done
rm -rf "$OUT/assets" && cp -r "$P/assets" "$OUT/assets" 2>/dev/null || true
# Clips de pantalla (ScreenWindow): a la vista prèvia n'hi ha prou amb 960 px d'amplada. També en WebM (com les preses).
for c in "$OUT"/assets/pantalla/*.mp4; do
  [ -e "$c" ] || continue
  ffmpeg -v error -y -i "$c" -vf "scale='min(960,iw)':-2" -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -an -movflags +faststart "$c.tmp.mp4"
  mv "$c.tmp.mp4" "$c"
  ffmpeg -v error -y -i "$c" -c:v libvpx-vp9 -crf 40 -b:v 0 -deadline good -cpu-used 5 -row-mt 1 -an "${c%.mp4}.webm"
done
cp "$P/work/editor.json" "$OUT/editor.json"
# Títol de la pestanya (i de l'artifact publicat): EDITOR_TITLE, o «Editor «<projecte>»».
TITLE="${EDITOR_TITLE:-Editor «$(basename "$P")»}"
python3 -I -c 'import re, sys; s = open(sys.argv[1], encoding="utf-8").read(); open(sys.argv[2], "w", encoding="utf-8").write(re.sub(r"<title>.*?</title>", lambda m: "<title>" + sys.argv[3] + "</title>", s, count=1))' \
  "$ROOT/src/editor/index.html" "$OUT/index.html" "$TITLE"
# Font de la lletra a mà (tegaki la busca al costat de la pàgina; vegeu src/editor/import-meta-url.ts).
cp "$ROOT"/node_modules/tegaki/dist/fonts/caveat/*.ttf "$OUT/"
(cd "$ROOT" && npx esbuild src/editor/app.tsx --bundle --minify --format=iife --target=es2020 \
  --loader:.woff2=file --asset-names=[name] --define:process.env.NODE_ENV='"production"' \
  --inject:src/editor/import-meta-url.ts --define:import.meta.url=import_meta_url \
  --outfile="$OUT/editor.js" --log-level=warning)
ls -la "$OUT" "$OUT/media"
