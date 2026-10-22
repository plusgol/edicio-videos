# kit_alex — la nostra feina sobre el kit d'edició d'Alex DiLorenzo

El kit (de pagament, sense llicència) **no és aquí**: és al Drive de l'usuari. Aquí hi ha el que hi hem posat nosaltres. Com fer-ho servir: `.claude/skills/kit-alex/SKILL.md`.

| Ruta | Què és |
|---|---|
| `munta_kit.sh` | Descomprimeix el kit, hi aplica els pegats i prepara WhisperX (torch CPU) |
| `pegats/kit.patch` | Els nostres canvis a 7 fitxers del kit: ASR en castellà, export a 1080p, splice per trams, voice-gain sense clips muts |
| `bot-trading/` | El job del vídeo «bot de trading»: `RUN.md` (què es va fer i amb quins números), `cuts.json` final, i `hf-graphics/` amb els scripts del job (plantilles i plànol dels gràfics, color, sons, editor, CapCut) |
| `editor/` | La pàgina de l'editor web (`index.html`) i `prepara_editor.sh`, que en fa les dades i el vídeo per publicar-la |
| `eines/` | `rerender.sh` (torna a renderitzar gràfics ja col·locats), `grab_review.py` (fotogrames de revisió), `gridframe.py` (graella sobre una captura) |
