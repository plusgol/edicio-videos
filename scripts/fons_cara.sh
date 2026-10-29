#!/usr/bin/env bash
# Posa la cara retallada (alfa de retall_fons.py) sobre el fons de cada variant de la demo amb marc.
# Ús: scripts/fons_cara.sh projectes/demo-escoles
#   fosc   fons blau marí d'estudi (work/pro/fons-fosc.png)
#   marca  fons gris clar d'estudi (work/pro/fons-marca.png)
#   clar   el despatx de debò, desenfocat i una mica apagat
# L'alfa es suavitza una mica (0,8 px) perquè la vora no quedi retallada.
set -euo pipefail
P="$1"
C="$P/work/pro/cara.mp4"; A="$P/work/pro/alfa.mp4"; O="$P/remotion-pro"
[ -f "$C" ] || C="$P/remotion-pro/cara.mp4"
enc=(-c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -movflags +faststart)
for V in fosc marca; do
  ffmpeg -nostdin -v error -y -i "$C" -i "$A" -loop 1 -i "$P/work/pro/fons-$V.png" -filter_complex \
    "[1:v]format=gray,gblur=sigma=0.8[a];[0:v][a]alphamerge[p];[2:v][p]overlay=shortest=1:format=auto" "${enc[@]}" "$O/cara-$V.mp4"
  echo "$O/cara-$V.mp4"
done
ffmpeg -nostdin -v error -y -i "$C" -i "$A" -filter_complex \
  "[0:v]split[o][b];[b]gblur=sigma=20,eq=saturation=0.7:brightness=-0.05[bb];[1:v]format=gray,gblur=sigma=0.8[a];[o][a]alphamerge[p];[bb][p]overlay=format=auto" \
  "${enc[@]}" "$O/cara-clar.mp4"
echo "$O/cara-clar.mp4"
