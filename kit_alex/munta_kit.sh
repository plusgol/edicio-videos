#!/usr/bin/env bash
# munta_kit.sh <zip del kit> [destí] — munta el kit d'edició d'Alex DiLorenzo en una sessió nova, amb els nostres canvis.
#
#   1. Descomprimeix el zip (el que l'usuari té al Drive: «EDITOR DE VIDEO | ALEX DILORENZO v1.0.1.zip»)
#      a <destí>/video-editor (per defecte: el scratchpad de la sessió, o ./kit si no se'n dona cap).
#   2. Hi aplica pegats/kit.patch (castellà a l'ASR, export a 1080p, splice per tram, voice-gain sense clips muts).
#   3. Crea el venv de WhisperX amb torch CPU a /home/user/tools/whisperx-venv si encara no hi és.
#   4. Desactiva la telemetria de HyperFrames.
#
# No activa mai el .claude/settings.json ni el hook SessionStart del kit: el kit és una carpeta de feina, no el projecte obert.
set -euo pipefail
ZIP=${1:?ús: munta_kit.sh <zip del kit> [destí]}
DEST=${2:-${CLAUDE_SCRATCHPAD:-$PWD/kit}}
AQUI=$(cd "$(dirname "$0")" && pwd)
VENV=${VIDEO_EDITOR_WHISPERX_VENV:-/home/user/tools/whisperx-venv}
export DO_NOT_TRACK=1 HYPERFRAMES_NO_TELEMETRY=1

mkdir -p "$DEST"
if [ ! -d "$DEST/video-editor" ]; then
  T=$(mktemp -d "$DEST/unzip.XXXX")
  unzip -q "$ZIP" -d "$T"
  KIT=$(dirname "$(find "$T" -maxdepth 3 -name workflows -type d | head -1)")
  mv "$KIT" "$DEST/video-editor" && rm -rf "$T"
fi
cd "$DEST/video-editor"
if patch -p1 -R --dry-run -s < "$AQUI/pegats/kit.patch" > /dev/null 2>&1; then
  echo "pegats: ja hi eren"
else
  patch -p1 -s < "$AQUI/pegats/kit.patch" && echo "pegats: aplicats"
fi

if [ ! -x "$VENV/bin/python" ]; then
  mkdir -p "$(dirname "$VENV")"
  uv venv --python 3.11 "$VENV" -q
  VIRTUAL_ENV=$VENV uv pip install -q --index-url https://download.pytorch.org/whl/cpu \
    torch==2.8.0 torchaudio==2.8.0 "torchvision==0.23.0+cpu"
  VIRTUAL_ENV=$VENV uv pip install -q whisperx==3.8.6 faster-whisper==1.2.1 ctranslate2==4.8.2 transformers==4.57.6
  # L'alineador vol el punkt_tab de NLTK i la descàrrega pel seu índex falla rere el proxy: el baixem directe.
  D=$VENV/nltk_data/tokenizers; mkdir -p "$D"
  curl -sSfL -o "$D/punkt_tab.zip" https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/tokenizers/punkt_tab.zip
  (cd "$D" && unzip -q -o punkt_tab.zip && rm punkt_tab.zip)
fi
"$VENV/bin/python" -c "import whisperx, torch; print('whisperx ok, torch', torch.__version__)"

npx --yes hyperframes@0.8.105 telemetry disable > /dev/null 2>&1 || true
echo
echo "Kit a punt: $DEST/video-editor"
echo "Exporta sempre: VIDEO_EDITOR_WHISPERX_VENV=$VENV DO_NOT_TRACK=1 HYPERFRAMES_NO_TELEMETRY=1 VE_LANG=es VE_LONG_1080=1"
