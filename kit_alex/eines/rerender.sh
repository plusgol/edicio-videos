#!/usr/bin/env bash
# rerender.sh <ids...> (from <job>/hf-graphics): a new version of each placed graphic (VER = the next unused letter), the flags its field locks
set -uo pipefail
HF="${HF:-$PWD}"  # <job>/hf-graphics: run it from there, or set HF
cd "$HF/gfx"
export DO_NOT_TRACK=1 HYPERFRAMES_NO_TELEMETRY=1 FPS=30
for id in "$@"; do
  flags=$(python3 -c "
import json,sys
c={b['id']:b for b in json.load(open('../../graphics-plan.json'))['beats']}['$id']
i=c['id']
print('STEP_FPS=12 GLOW_FULL=0.26 GRAIN_1080=5' if c.get('bg')=='dark' and not i.startswith('b-') else ('STEP_FPS=12 GRAIN_1080=5' if i.startswith('b-') else ''))")
  ver=b; for v in b c d e f; do [ -f "renders/$id-$v.mp4" ] && ver=$(echo $v | tr 'bcde' 'cdef'); done
  echo "== $id VER=$ver $flags"
  env $flags VER=$ver bash render.sh "$id" full < /dev/null > "renders/$id-$ver.log" 2>&1 || { echo "!! $id failed"; tail -3 "renders/$id-$ver.log"; }
done
echo "== done"
