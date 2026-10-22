#!/usr/bin/env bash
# render_all.sh — renders every planned graphic of bot-trading with the flags its field locks (backgrounds/README.md):
# bg-dark full-screen = STEP_FPS=12 + GLOW_FULL=0.26 + GRAIN_1080=5; bg-light = timeline rate, grain only; a comp that
# embeds a captured <video> never takes MBLUR. Title cards come from titles/ (copied to gfx/renders), text animations from
# text-animation/, the corner cams from footage_bot.py. Skips a render that already exists.
set -uo pipefail
cd "$(dirname "$0")"
export DO_NOT_TRACK=1 HYPERFRAMES_NO_TELEMETRY=1 FPS=30
python3 - <<'PY' > /tmp/video-editor/bot-trading/render-list.txt
import json
for c in json.load(open("../graphics-plan.json"))["beats"]:
    i = c["id"]
    if i.startswith(("pip-", "t-")) or c["kind"] == "text-animation":
        continue
    flags = "STEP_FPS=12 GLOW_FULL=0.26 GRAIN_1080=5" if c.get("bg") == "dark" and not i.startswith("b-") else \
            ("STEP_FPS=12 GRAIN_1080=5" if i.startswith("b-") else "")
    print(i, flags)
PY
cd gfx
while read -r id flags; do
  [ -f "renders/$id.mp4" ] && continue
  echo "== $id $flags"
  env $flags bash render.sh "$id" full < /dev/null > "renders/$id.log" 2>&1 || echo "!! $id failed (renders/$id.log)"
done < /tmp/video-editor/bot-trading/render-list.txt
cd ..
for t in titles/renders/t-*.mp4; do b=$(basename "$t"); [ -f "gfx/renders/$b" ] || cp -p "$t" "gfx/renders/$b"; done
echo "== done"
