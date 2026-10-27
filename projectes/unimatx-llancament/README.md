# Vídeo de presentació d'UniMatx

Horitzontal 1920×1080, 30 fps. Fet sencer en codi amb el mètode del launch-video-kit (vegeu `BRIEF.md` i la skill
`video-presentacio`). Dues versions:

| Versió | Composició | Durada | Codi | Veu | Música |
|---|---|---|---|---|---|
| v1, explicativa | `UniLlancament` | 58 s | `src/llancament/` | `veu.json` | `musica.wav` |
| v2, «BOOM» | `UniLlancamentBoom` | 50 s | `src/llancament/boom/` | `veu-v2.json` | `musica-boom.wav` |

La v2 surt de la valoració de la v1 («esperava més BOOM, 7/10»): ganxo amb dolor (17 anys, 660 graus, +20%, un any
perdut), silenci i «Fins ara.», entrada amb cop i flaix, el producte a un pla per temps (reutilitza les pantalles de la
v1 amb el temps comprimit), el que t'emportes, «Des de 9,99 €» i el contrast «un any a la carrera equivocada o vint
minuts». La tensió del principi és uns 19 dB per sota de l'entrada; per això la música de la v2 es normalitza per pic i
no amb loudnorm, que comprimiria el contrast.

## Com es refà
1. **Veu:** `ELEVENLABS_API_KEY=… python3 scripts/unimatx/veu_linies.py projectes/unimatx-llancament [--nom v2]`
   (Laura, `eleven_v3`, català). Text a `veu.json`; durades i paraules a `vo.json`. Les línies 03 i 06 porten un `say`
   comprovat amb transcripció («Iuni Match», «un torn de feina, simulat»).
   A la v2, les frases curtes s'han revisat en context (enganxades), perquè soles el transcriptor salta a l'anglès;
   «Tot comparat» i «Tu tries» es van canviar per «Comparats un a un» i «Tu decideixes».
2. **Música i efectes:** `python3 scripts/unimatx/musica_llancament.py projectes/unimatx-llancament/remotion` (v1) i
   `python3 scripts/unimatx/musica_boom.py projectes/unimatx-llancament/remotion` (v2). Sintetitzada, 120 ppm.
3. **Render:** `scripts/unimatx/render_llancament.sh` (v1) o
   `scripts/unimatx/render_llancament.sh UniLlancamentBoom unimatx-presentacio-boom` (v2). −14 LUFS, pic −1,2 dB.

`remotion/` (veu, música) i `out/` no es versionen; `work/TEST_REAL.md` tampoc (detall del test del client).

## Comprovat
- v1: veu sobre música −16,2 dB / veu sola −15,9 dB (la música no es menja la veu). Pic global −1,2 dB.
- v1: transcripció de la mescla final, s'entenen les 12 línies.
- v2: l'entrada sense veu −11,6 dB contra el ganxo −15,3 dB; veu sobre l'entrada −18,0 dB. −14,1 LUFS, pic −1,2 dB.
