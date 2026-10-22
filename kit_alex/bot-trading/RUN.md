# RUN — bot-trading

**Next action:** step 5b — render de tots els gràfics (render_all.sh, text-animation/render.sh, footage_bot.py pips), placement, assemble, graphics-qa, edit-review

| | | |
|---|---|---|
| format | long-form YouTube | probed: 1920x1080 (preses reenquadrades, SDR) |
| lane | chat-only | Linux al núvol, sense programa d'edició |
| preset | `presets/youtube/default/` | |
| lane gaps | 4 ⛔ (grade a mà: cube amb ffmpeg) · 6 ⚠️ (mix-sfx.py) | de LANES.md |
| source | 30/1 fps · cam-prompt 161.9 s · cam-truco 252.8 s · cam-24h 72.9 s · cam-calle 55.9 s · vo-provisional 191 s | |
| constraints | export a 1920x1080, no 4K (l'usuari); idioma castellà (el kit està fixat en anglès: transcribe.sh, realign-spans.py, export-transcript.py i asr_cli.py canviats a "es"); venv de WhisperX propi amb torch CPU (/home/user/tools/whisperx-venv), no el del lock; la veu en off és provisional i muda fins que l'usuari la gravi | |
| cut locked | 72 segments · cut_rev 10437d1e59d9 | run through (whole-edit ask) |
| started | 2026-10-21 | |

## Steps

| # | Step | Status | What it produced / why not |
|---|------|--------|----------------------------|
| 1 | Intake | done | raw/cam-prompt.mov (IMG_5866), cam-truco.mov (IMG_5867), cam-24h.mov (IMG_5883), cam-calle.mov (IMG_5885), vo-provisional.mov: les preses iPhone HDR (HLG) convertides una vegada a Rec.709 SDR (tonemap hable) i reenquadrades a 1920x1080, amb el seu àudio original de 48 kHz; originals intactes a edicio-videos/projectes/bot-trading/input |
| 2 | Rough cut | done | words.json (WhisperX large-v3 es, venv propi) + coverage reparada (2 forats a cam-truco realineats amb realign-spans.py; 1 «vale» en tram tallat reconegut) · cuts.json des de l'EDL v7 · refine + polish (7 silencis partits) · revisió amb ulls nous (script-flow): 14 canvis aplicats a l'EDL mestre · cut-audit 3 passades (27 → 8 → 8 fix: 6 FUSED al mínim, 2 talls fets a mà i verificats amb ASR) · dead-air-qa passa · splice per tram (VE_SPLICE_PER_SEGMENT=1: el graf únic esgotava la memòria) → outputs/bot-trading.splice.mp4 455,37 s |
| 3 | Audio polish | done | voice-gain.py +5 dB (parla conservada −21,9 LUFS → −17) → limitador −6 dBFS, baked per splice; audio-qa: −17,6 LUFS integrats, pic −5,98 dBFS · voice-gain.py: s'ometen els clips sense paraules (veu en off provisional i buits de títol: silenci digital sense pic) |
| 4 | Color grade | done (a mà: chat-only ⛔) | footage_bot.py base: Autumn-Rec709.cube via lut3d al 80 % + saturació 1,20 sobre la base (els gràfics no en porten); + el zoom de sortida d'obertura (115→100, 18 f, quart) i 7 zooms d'èmfasi (100→115, 18 f, cubic in-out) cuits a la base → outputs/bot-trading.mp4; l'original del splice queda a outputs/bot-trading.splice.mp4 |
| 5 | Graphics | done | 92 cel·les (52 comps HyperFrames, 17 animacions de text, 6 títols, 17 càmeres a la cantonada) · placement 1:1 amb el pla · graphics-qa: 140 FAIL → 0 FAIL (93 desviacions amb motiu a qa-waivers.json) · edit-review: 1 ronda, 3 revisors (còpia ×2, moviment), ~35 troballes verificades a mà sobre els fotogrames i arreglades; gate dirigit verd · obertes (decisió del creador): emojis en títols de vídeos de tercers a la b-roll de YouTube; xifres F2→F3→F4a que pugen i baixen; escenes de flux que només s'acumulen, «NO.» i «10.000 $» sense prop |
| 6 | SFX | done | sfx-plan: 258 sons (37 files a mà: caixes vermelles, títols, càmeres mudes; whoosh del fotograma 0 tret) · mix-sfx → outputs/bot-trading-final.mp4 · −18,1 LUFS, pic −0,6 dBFS · flash-scan: 1 «flash» a 453,03 s = sacsejada del pla de mà al carrer (metratge, sense gràfics) |
| 7 | Review | en curs | vista prèvia publicada (HLS fMP4 1080p) a l'artefacte de l'editor (privat), v11 · esperant la revisió del creador i la seva veu en off |
| 8 | Export | — | |

## Request coverage
- Estructura i història: l'EDL v7 aprovat per l'usuari (edicio-videos/projectes/bot-trading/edl.json): intro amb veu en off (traducció dels primers 30 s de tef), seccions I–VI, final al carrer; sense repeticions (v7).
- Veu en off: blocs Intro, P, A, B, D, C, G, F (guio_veu_en_off.md), provisionals i muts.
- Pantalla comentada: gravació a pantalla completa amb la cara a la cantonada (corner cam).
- Explicacions animades: estratègies, plataformes amb logo, què fa Claude Code, compte de fondeig, backtesting.
- Resultats visibles (+46,54 $ ficticis en ~22 h), sense tapar.
- Sense emojis. Text en pantalla en castellà.
- Música: cap.

## Flags to report
- audio-qa: «clics» a 58,43 s i 119,10 s = talls càmera → veu en off provisional (silenci digital); desapareixen amb la veu real
- audio-qa: caigudes d'ambient a 97,30 s (p8b, pausa partida), 200,10 s (l1 → l1b), 369,87 s (d3, pausa partida): escoltar
- cut-audit: 2 talls fets a mà i verificats amb ASR: «el modo Opus 5.5 en | esfuerzo medio» (cam-prompt 107,733) i «has perdido el reto | has perdido 28 dólares» (cam-truco 85,200)
- realign-spans: «2.000» quedava aplegat (122 ms) a cam-truco 189,1 s; no és cap vora

## Skipped, and why
- scan-transcript.py: compara amb un diccionari anglès; en castellà marcaria totes les paraules.
- Lip sync a la ingesta: so i imatge surten del mateix iPhone (mateix fitxer), no hi ha segona càmera.

## Step 7 notes
