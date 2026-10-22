---
name: kit-alex
description: Edita un vídeo de YouTube 16:9 amb el kit d'edició del mateix Alex DiLorenzo (WhisperX, gràfics HyperFrames, talls, QA i efectes de so del kit), amb l'editor web perquè l'usuari retoqui talls, gràfics i sons, i l'exportació a projecte de CapCut. Fes-la servir quan l'usuari demani editar «amb el kit d'Alex», amb HyperFrames, l'editor web dels clips o passar el vídeo a CapCut.
---

# Kit d'Alex — com el munto i el faig servir

El kit és un producte de pagament de l'Alex. **No és al repositori i no s'hi ha de pujar mai** (el repo és públic i el kit no té llicència). Aquí hi ha només la nostra feina: `kit_alex/`.

Abans de res llegeix `docs/KIT_ALEX.md` (regles del kit) i `docs/ESTIL_ALEX.md` (estil). Comunicació amb l'usuari en català; text en pantalla en castellà.

## Compromisos (fixos, no es negocien)
- **No activis mai** el `.claude/settings.json` ni el hook `SessionStart` del kit. El kit és una carpeta de feina dins el scratchpad, no el projecte obert.
- Telemetria apagada sempre: `DO_NOT_TRACK=1 HYPERFRAMES_NO_TELEMETRY=1`. No facis servir la telemetria de `media-use` ni enviïs el «feedback» públic de HyperFrames.
- Exporta a **1080p** (`VE_LONG_1080=1`), mai 4K.
- No pugis cap fitxer del kit a GitHub. Els nostres scripts sí (`kit_alex/`).
- Sense emojis. Els gràfics d'exemple porten «Ejemplo ilustrativo»; els resultats reals, l'etiqueta de real. No inventis resultats.

## 1. Muntar el kit en una sessió nova
1. Busca el zip al Drive de l'usuari amb `mcp__Google_Drive__search_files` (`title contains 'DILORENZO' or title contains 'EDITOR DE VIDEO'`): «EDITOR DE VIDEO | ALEX DILORENZO v1.0.1.zip». Baixa'l al scratchpad amb `curl -sSL "https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t"`. Si el proxy el bloqueja, demana a l'usuari que el pugi al xat.
2. `bash kit_alex/munta_kit.sh <zip> <scratchpad>`: descomprimeix a `<scratchpad>/video-editor`, aplica `kit_alex/pegats/kit.patch` i crea el venv de WhisperX (torch CPU) a `/home/user/tools/whisperx-venv`. És idempotent.
3. A cada ordre del kit: `export VIDEO_EDITOR_WHISPERX_VENV=/home/user/tools/whisperx-venv DO_NOT_TRACK=1 HYPERFRAMES_NO_TELEMETRY=1 VE_LANG=es VE_LONG_1080=1`.

Què canvia el pegat (7 fitxers del kit):
- `transcribe.sh`, `realign-spans.py`, `export-transcript.py`, `workflows/asr_cli.py`: l'idioma de l'ASR és `es` (`VE_LANG`), no anglès.
- `workflows/deliver.py`: `VE_LONG_1080=1` exporta el llarg a 1920×1080 en lloc de 4K.
- `splice.sh`: `VE_SPLICE_PER_SEGMENT=1` munta tram a tram (el graf únic esgota la memòria del contenidor).
- `workflows/voice-gain.py`: salta els clips sense paraules (veu en off provisional, buits de títol).

## 2. El pipeline (carril «chat-only»: Linux, sense programa d'edició)
Segueix el `CLAUDE.md` i `LANES.md` del kit; el job va a `video-editor/projects/<job>/`. L'exemple complet és `kit_alex/bot-trading/` (copia'n els scripts a `projects/<job>/hf-graphics/` i adapta'ls): `RUN.md` diu què es va fer a cada pas i amb quins números.

Ordre i trampes conegudes:
1. **Ingesta**: preses iPhone HDR → Rec.709 SDR una vegada, 1920×1080, a `raw/`. Els originals de `projectes/*/input/` no es toquen.
2. **Retall**: `transcribe.sh` → `cuts.json` (des de l'EDL del repo amb `scripts/`) → refine/polish → `cut-audit.py` → `splice.sh`. Després d'editar `transcript/cuts.json` a mà, copia'l a `/tmp/video-editor/<job>/cuts.json` abans del splice.
3. **Àudio**: `voice-gain.py` (−17 LUFS de parla), `audio-qa`.
4. **Color**: a mà amb ffmpeg (`footage_bot.py`: LUT Autumn-Rec709 al 80 % + saturació 1,20, i els zooms d'èmfasi cuits a la base).
5. **Gràfics**: `build_bot.py` escriu `graphics-plan.json` i les comps a partir de les plantilles de `tpl_bot.py`/`lib_bot.py` → `render_all.sh` → `placement.py --write` → `graphics-qa.py` (gate; desviacions justificades a `qa-waivers.json`) → `assemble.py`.
   - `render.sh` no sobreescriu un render ja col·locat: torna a renderitzar amb `VER=b`, `c`… (`kit_alex/eines/rerender.sh <ids>` tria la lletra). `placement` agafa la versió més nova.
   - Revisió de gràfics: `kit_alex/eines/grab_review.py <job> <render>` fa els fotogrames i fulls de contacte; `gridframe.py` ajuda a situar caixes sobre una captura.
6. **SFX**: `sfx-plan.py` → `sfx_tame.py` (el pla del kit satura: deixa un tall d'entrada + els 2 sons més forts per gràfic, separació mínima 0,35 s, el mateix so no es repeteix en 1,2 s; desa el pla original a `sfx-plan.kit.json`) → `mix-sfx.py` → `flash-scan.py`.
   - L'usuari va dir primer «massa soroll, repeteixes moltíssim» i després «ara n'hi ha pocs»: el punt bo són ~100 sons en 7,5 min.
7. **Final**: `finalize.sh --apply --keep-drafts` → `outputs/<job>.final.mp4`.

## 3. L'editor web (perquè l'usuari retalli i demani coses ell mateix)
- `bash kit_alex/editor/prepara_editor.sh <job> <scratchpad>/editor` prepara la pàgina (`kit_alex/editor/index.html`), les dades (`editor_kit.py`), la base i els gràfics en HLS fMP4, i les tandes `batchN.json` (≤ 48 MB cadascuna).
- Publica-la amb l'eina Artifact: primer publish amb `capabilities: {db: {}, comments: {}}` i la primera tanda a `files`; les altres tandes, publish al mateix `url`. Els artefactes no serveixen `.m3u8` ni `.ts`: per això `playlist.txt` i trossos `.mp4`.
- L'usuari hi veu el vídeo i cada presa sencera, mou vores de talls, elimina clips (botó o tecla Supr), desfà (Ctrl+Z), apaga o mou gràfics, activa/silencia sons, i escriu peticions en un moment precís. Les peticions arriben com a comentaris a Claude.
- Per aplicar-ho: llegeix el doc `editor/edits` amb `ArtifactData`, desa'l en un fitxer i `python3 hf-graphics/aplica_editor.py <fitxer>`. Diu quins passos cal tornar a córrer (splice si ha canviat un tall; build/placement/assemble si han canviat gràfics; sfx si han canviat sons).

## 4. Projecte de CapCut
- `capcut_media.py <media>` (preses graduades senceres, gràfics, textos animats amb alfa premultiplicat, sons) → `capcut_draft.py <media> <carpeta del projecte>` (fa servir `lanes/capcut/capcut-bridge.py` del kit; cal simular els mòduls de macOS, ja ho fa) → `capcut_check.py <carpeta>` (compara fotogrames del projecte amb el màster).
- Lliura en zips de ≤ 400 MB amb `CAPCUT-LLEGEIX-ME.txt` (a `kit_alex/bot-trading/`). Els zooms d'èmfasi no hi van (a CapCut es fan amb fotogrames clau). Encara no s'ha provat en un CapCut real: si l'usuari diu que no s'obre, demana-li una captura.

## 5. Lliurament
- Màster 1080p a 16 Mbps. Per enviar-lo amb `SendUserFile` (límit 400 MiB) fes un segon encode a dues passades que hi càpiga.
- Abans del render final l'usuari revisa a l'editor (punt 3). No declaris revisat un àudio que no s'ha escoltat.
