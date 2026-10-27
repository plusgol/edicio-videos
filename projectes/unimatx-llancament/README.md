# Vídeo de presentació d'UniMatx

Horitzontal 1920×1080, 30 fps, 58 s. Fet sencer en codi amb el mètode del launch-video-kit (vegeu `BRIEF.md` i la
skill `video-presentacio`). Composició `UniLlancament`, codi a `src/llancament/`.

## Com es refà
1. **Veu:** `ELEVENLABS_API_KEY=… python3 scripts/unimatx/veu_linies.py projectes/unimatx-llancament`
   (Laura, `eleven_v3`, català). Text a `veu.json`; durades i paraules a `vo.json`. Les línies 03 i 06 porten un `say`
   comprovat amb transcripció («Iuni Match», «un torn de feina, simulat»).
2. **Música i efectes:** `python3 scripts/unimatx/musica_llancament.py projectes/unimatx-llancament/remotion`
   (sintetitzada, 120 ppm, sense llicències de tercers).
3. **Render:** `scripts/unimatx/render_llancament.sh` → `out/unimatx-presentacio.mp4` (−14 LUFS, pic −1,2 dB).

`remotion/` (veu, música) i `out/` no es versionen; `work/TEST_REAL.md` tampoc (detall del test del client).

## Comprovat
- Veu sobre música −16,2 dB / veu sola −15,9 dB (la música no es menja la veu). Pic global −1,2 dB.
- Transcripció de la mescla final: s'entenen les 12 línies.
