#!/usr/bin/env bash
# prepara_editor.sh <job> <carpeta de sortida> — tot el que necessita la pàgina editor (index.html) per publicar-la com a artefacte.
#
#   data/editor.json, takes/, sfx/   amb hf-graphics/editor_kit.py del job
#   hlsb/  la base (càmera + veu, sense gràfics) en HLS fMP4, amb so
#   hlsf/  el render amb gràfics, mut (la pàgina el sincronitza sobre hlsb i hi posa els efectes amb WebAudio)
#   batchN.json  els fitxers repartits en tandes de ≤ 48 MB (un publish admet 64 MB)
#
# Els artefactes no serveixen .m3u8 ni .ts: la llista va com a playlist.txt i els trossos són .mp4 (fMP4).
set -euo pipefail
J=$(cd "${1:?ús: prepara_editor.sh <job> <sortida>}" && pwd); OUT=${2:?}
AQUI=$(cd "$(dirname "$0")" && pwd); N=$(basename "$J")
mkdir -p "$OUT" && cp "$AQUI/index.html" "$OUT/index.html"
python3 "$J/hf-graphics/editor_kit.py" "$OUT"
hls() {  # <entrada> <dir> <prefix> <opcions ffmpeg...>
  local in=$1 d=$2 p=$3; shift 3
  rm -rf "${OUT:?}/$d" && mkdir -p "$OUT/$d"
  ffmpeg -v error -y -i "$in" "$@" -g 30 -keyint_min 30 -sc_threshold 0 -pix_fmt yuv420p -f hls -hls_time 6 \
    -hls_playlist_type vod -hls_segment_type fmp4 -hls_fmp4_init_filename init.mp4 \
    -hls_segment_filename "$OUT/$d/$p%03d.mp4" "$OUT/$d/playlist.m3u8" < /dev/null
  mv "$OUT/$d/playlist.m3u8" "$OUT/$d/playlist.txt"
}
hls "$J/outputs/$N.mp4" hlsb b -c:v libx264 -preset medium -crf 28 -maxrate 1400k -bufsize 2800k -c:a aac -b:a 128k -ar 48000
hls "$J/hf-graphics/renders/final.mp4" hlsf f -an -c:v libx264 -preset medium -crf 27 -maxrate 2000k -bufsize 4000k
python3 - "$OUT" <<'PY'
import json, os, sys
K = sys.argv[1]
for f in os.listdir(K):
    if f.startswith("batch"): os.remove(f"{K}/{f}")
fs = ["data/editor.json"] + [f"{d}/{f}" for d in ("sfx", "takes", "hlsb", "hlsf") for f in sorted(os.listdir(f"{K}/{d}"))]
bs, sz = [[]], 0
for f in fs:
    s = os.path.getsize(f"{K}/{f}")
    if sz + s > 48e6: bs.append([]); sz = 0
    bs[-1].append(f); sz += s
for i, b in enumerate(bs):
    json.dump({f: f for f in b}, open(f"{K}/batch{i + 1}.json", "w"))
    print(f"batch{i + 1}.json", len(b), "fitxers", round(sum(os.path.getsize(f"{K}/{f}") for f in b) / 1e6, 1), "MB")
PY
