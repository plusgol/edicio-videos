---
name: motion-graphics
description: Motion graphics amb Remotion seguint la guia «Motion Graphics with Claude Code» de Damiano Caudullo: els 10 moviments (rise, pop, count-up, checklist, typewriter, slide-in, blur-in, punch-in, reframe, bar fill), els 4 estils (Kinetic Type, Liquid Glass, Editorial Grain, Pop Bold) i els de les marques (UniMatx, Camino de Dragones), la regla del so i les 7 correccions dels vídeos que semblen barats. Inclou la fàbrica de vídeos (un brief → un vídeo acabat i comprovat amb una ordre). Fes-la servir quan l'usuari demani un vídeo de text animat, un reel, una promo, gràfics sobre un vídeo seu, o «fes-ne uns quants» / «una factoria de vídeos».
---

# Motion graphics (guia de Damiano Caudullo)

Origen: la guia en PDF «Motion Graphics with Claude Code» i el seu starter kit (Damiano Caudullo,
instagram.com/damianodesu). La guia fa servir HyperFrames; aquí tot és a Remotion. Del kit hi ha a `src/mg/fonts/`
les lletres (OFL, llicència al costat) i a `src/mg/sfx/` els 9 sons («fets amb codi, sense llicència»). Els prompts
i el PDF no es pugen al repositori.

## Què hi ha
- `brand/mg.ts`: **tots** els valors. `MG` (durades dels moviments, quant es mouen, zona segura per format, mides de
  text, regles de so i mescla, temps de la fàbrica) i `STYLES` (un estil = una paraula: `kinetic`, `glass`,
  `editorial`, `pop`, `unimatx`, `cdd`). Un estil nou és una entrada nova aquí, no un component nou.
- `src/mg/moves.tsx`: els 10 moviments. `Enter` (rise, pop, slide, slideLeft, blur, stretch, fade), `CountUp`,
  `Typewriter`, `Checklist` (amb `Tick`), `BarFill`, `PunchIn`, `Reframe`, i `progress`/`EASE` (power4, power3,
  back, bouncy = back.out(2.5), gentle). Cada moviment comença a `at`: el fotograma de la paraula dita.
- `src/mg/Backdrop.tsx`: els fons (degradat, taques que es mouen, gra animat, adhesius que giren).
- `src/mg/Moviments.tsx`, composició `MGMoviments`: el catàleg dels 10 moviments (el PROMPT 03 de la guia) en
  qualsevol estil. Per ensenyar el vocabulari o comprovar un estil nou:
  `npx remotion render src/index.ts MGMoviments out.mp4 --props='{"style":"pop"}'`.
- **La fàbrica** (`scripts/fabrica/`, `src/fabrica/`, format del brief a `docs/FABRICA.md`): d'un brief a un vídeo
  acabat i comprovat. És el camí per defecte per a un reel de text o una promo curta.

## Com treballar (la manera de la guia)
1. **Pregunta-t'ho a tu mateix abans de fer**: què ha d'entendre qui ho mira, quina és la paraula clau de cada
   pantalla, on hi ha un número que pot rodar, una llista que es pot marcar, una captura real que ho demostra.
   L'usuari vol autonomia («let the model cook»): decideix tu i ensenya el resultat. No li facis preguntes que pots
   respondre mirant el projecte.
2. **Base primer, després un sol punt** («base first, then one spot»). Primer un vídeo sencer que funcioni; després,
   canvis d'un moment cada vegada, i la resta igual.
3. **Els moments es diuen amb paraules**, no amb segons: «quan dic *40 a la setmana*». La fàbrica i les eines de
   transcripció troben el fotograma.
4. **Les paraules de l'usuari, tal qual** («use my exact words»): no reescriguis ni escurcis el guió. Una frase per
   pantalla; si és llarga, en dues pantalles seguides.
5. **Res inventat**: captures, números i noms, de debò (si no hi són, a `pending`). Les captures, com són: no les
   redibuixis (fix 06).

## Regles de pantalla
- Text gran per llegir-lo al mòbil, dins el 80 % central de l'amplada. En vertical (Reels, TikTok, Shorts), dins
  `MG.safe.vertical` (x 60–940, y 220–1500): res a dalt del tot, res al 20 % de baix (nom i text), res al 15 % de la
  dreta (botons). Comprova-ho **sempre** amb `python3 scripts/zona_segura.py <vídeo> <full.jpg>` (fix 07); la fàbrica
  ho mesura a més píxel a píxel.
- Gràfics sobre un vídeo de l'usuari: **res els 3 primers segons** (el ganxo és ell), fora de la cara, fora del terç
  de baix (subtítols) i fora del 10 % de cada costat.
- Cada pantalla es queda quieta almenys 0,7 s sencera abans de marxar.
- Un sol estil per vídeo («so it looks designed, not random»).

## Regla del so
- **Sobre una veu**: només clics petits on importa. Un `tick` per element de llista, `counter` mentre roda un número,
  `fill` amb una barra, el so final (`chime` o `success`) a l'última targeta. **Cap so quan una targeta entra o surt,
  i cap whoosh.** Uns 20 dB per sota de la veu.
- **Sense veu** (un anunci, un reel només de text) el vídeo és «a film on its own»: cada moviment visible té el seu so
  (`STYLES[*].sfx.screen`).
- Mescla: veu ≥ 12 LU per sobre de música i efectes junts, màster a −14 LUFS, pic real < −1 dBTP (es mesura).

## Les 7 correccions (quan alguna cosa sembla barata)
1. Targetes planes → vidre de debò: transparent, amb el que hi ha a sota doblegant-se a les vores (filtre SVG de
   desplaçament), un 5 % de blanc i un filet de llum a dalt; mai `filter`, `opacity` ni `clip-path` al pare.
2. Cap parlant pla → retall net i targetes a tres profunditats (darrere borroses, al costat nítides, davant grans i
   borroses); la cara sense color ni halo.
3. 3D de joguina → no el falsegis al navegador: Blender, amb una prèvia en argila abans de renderitzar.
4. Efectes de plantilla → copia com es mou una referència real; cada repetició diferent, vores imperfectes, pes
   (reacciona, passa, s'assenta). Res que voli recte cap a la càmera.
5. Números avorrits → que tinguin personalitat (una moneda, una reacció quan baixen).
6. Interfície falsa → refés les pantalles reals des de captures (mateix text, mateix ordre) i mou la càmera a prop,
   seguint el cursor i els números.
7. Instagram tapa el text → zona segura i un fotograma amb els botons pintats a sobre (`scripts/zona_segura.py`).

## Exportar
- Més qualitat: `--scale=2` (4K) i `--crf` baix; més petit: `--crf=23`. 60 fps: canvia `fps` de la composició.
- Transparent (per posar-ho sobre un altre vídeo a Premiere o CapCut): fons transparent a la composició i
  `--codec=prores --prores-profile=4444 --pixel-format=yuva444p10le`, o `--sequence --image-format=png`.

## Fàbrica de vídeos (resum; tot a docs/FABRICA.md)
```
[ELEVENLABS_API_KEY=…] python3 scripts/fabrica/fabrica.py projectes/<nom> [--estils kinetic,glass] [--sense-veu]
```
Guió → veu per pantalla amb temps de paraula → línia de temps → música, efectes i mescla per estil → render →
QA (zona segura mesurada, full de Reels, sonoritat, veu sobre el llit, negres, veu transcrita contra el guió) →
`out/informe.md`. Llegeix l'informe i mira el full de Reels **abans** d'enviar res; si hi ha alguna cosa en
majúscules, arregla-la i torna a passar la fàbrica (la veu desada no es torna a pagar).
