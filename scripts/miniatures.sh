#!/usr/bin/env bash
# Renderitza les miniatures de YouTube d'un projecte (composició Miniatura, 1280×720) a partir de projectes/<nom>/miniatures.json.
# Deixa a out/: miniatura_<nom>.png (màxima qualitat), miniatura_<nom>.jpg (< 2 MB, per pujar) i miniatures_petites.png
# (totes a 320×180 i 160×90: si no es llegeixen així, no es llegiran al mòbil).
# Ús: scripts/miniatures.sh projectes/<nom> [opcions de remotion, p. ex. --browser-executable=...]
set -euo pipefail
P="$1"; shift
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
mkdir -p "$P/out"
python3 -I - "$P/miniatures.json" "$TMP" <<'PY'
import json, sys
cfg = json.load(open(sys.argv[1]))
# Les variants poden fer servir una altra foto: els camps de la variant manen sobre els generals.
KEYS = ("person", "background", "photo", "photoW", "photoH", "face")
base = {k: cfg[k] for k in KEYS if k in cfg}
for v in cfg["variants"]:
    props = {**base, **{k: v[k] for k in KEYS + ("variant", "lines", "board", "big", "eyesY", "elements") if k in v}}
    json.dump(props, open(f"{sys.argv[2]}/{v['name']}.json", "w"), ensure_ascii=False)
PY
for f in "$TMP"/*.json; do
  n="$(basename "$f" .json)"
  (cd "$ROOT" && npx remotion still src/index.ts Miniatura "$P/out/miniatura_$n.png" --props="$f" --public-dir="$P" --log=error "$@")
  ffmpeg -v error -y -i "$P/out/miniatura_$n.png" -q:v 2 "$P/out/miniatura_$n.jpg"
done
# Prova de llegibilitat: cada miniatura a mida de llista (320×180) al costat de la de mòbil petit (160×90).
args=(); filt=""; rows=""; i=0
for img in "$P"/out/miniatura_*.png; do
  args+=(-i "$img")
  filt+="[$i]split[s$i][t$i];[s$i]scale=320:180[a$i];[t$i]scale=160:90,pad=320:180:80:45:white[b$i];[a$i][b$i]hstack[r$i];"
  rows+="[r$i]"; i=$((i + 1))
done
if [ "$i" -gt 1 ]; then filt+="${rows}vstack=inputs=$i"; else filt="${filt%;}"; filt="${filt%\[r0\]}"; fi
ffmpeg -v error -y "${args[@]}" -filter_complex "$filt" -frames:v 1 "$P/out/miniatures_petites.png"
rm -rf "$TMP"
ls -la "$P"/out/miniatura_* "$P/out/miniatures_petites.png"
