# Informe — «en 4 minutos te cambiaré la vida con la IA» (vídeo en brut)

**v2 (estil Alex DiLorenzo + toc manual + logos)** · **2:45 (165,3 s)** · fitxer per pujar: `out/dame-3-minutos_1440p.mp4` (2560×1440, H.264 High CRF 13,6, bt709, AAC 320 kbps, 239 MB) · 30 fps · −16 LUFS
**Original:** `input/raw.mp4`, 6:38 (398,7 s), 832×464 a 60 fps
**Editor de vista prèvia:** https://claude.ai/artifact/QSyL459qMwkAmdczUU5JYb

## Títol
L'original diu «te lo explico en cuatro minutos», però el vídeo editat dura **2:45**. Per això:
- La frase «y te lo explico en cuatro minutos» **s'ha tret** del ganxo (tram `r00b`). Es pot recuperar a l'editor, a la pestanya Talls.
- **Títol triat**: **«Dame 165 segundos y te cambio la vida»** (37 caràcters).
  - Va amb la miniatura «165 SEG → [ChatGPT · Claude · OpenCode] → NEGOCIOS CON IA».
  - El títol posa la promesa i la miniatura diu de què va (IA i negocis); no es repeteixen.
  - El número és el mateix i és exacte: el vídeo dura 165 s.
- **Per provar amb Test & Compare:**
  - «Con estas 3 IAs es imposible fracasar» (la seva frase final);
  - «Las 3 IAs que uso para montar negocios».
- No cal allargar-lo ni tornar-lo a gravar. Per arribar als 4 minuts s'haurien de tornar a posar preses repetides.

## Preses triades i el que s'ha tret
| Bloc | Presa que es queda (original) | Què s'ha tret |
|---|---|---|
| Ganxo | 0:03,4–0:05,9 «Con estos tres modelos ya vas a poder crear cualquier proyecto» | 1a presa trencada («modelos de intelectual») i «te lo explico en cuatro minutos» |
| I · OpenCode | 1:08–1:57 | 1a presa sencera (0:06–1:08): «70 modelos», «gastando 20 veces más… no, menos, coño, perdón» i «estas tres sillas» repetit |
| II · ChatGPT | 2:46–3:29 | 1a presa (1:57–2:46): «Después tenemos chat GPT… modo work y códex…», que després tornes a començar |
| III · Claude | 4:20–4:31 i després 3:41–3:58 | «En primer lugar… cloth» (presa equivocada) i «Lo bueno de esto. Y en último lugar…» (2a presa) |
| III · Claude (vídeos, Sonnet) | 4:39–4:53 | «Siempre. O sea, este vídeo me ha gastado…» (repetició del 4%) |
| Flux de treball | 5:59–6:37 | 1a versió del flux (4:53–5:59) i el compte enrere «Tres, dos. Vale» |

- **Ordre dels trams a Claude:** el muntatge comença amb la 3a presa («Y en tercer lugar, Claude, con muchísima diferencia… en X High») i continua amb la 1a («y estoy gastando 10 millones, 15 millones de tokens…»), que és on la frase surt més neta.
- **Ritme d'Alex:** les pauses de més de 300 ms s'escurcen a ~70–90 ms. Hi ha 33 talls amb tres escales del pla que es van alternant (1,00 / 1,12 / 1,22), i dos apropaments a 1,30, a «Claude, con muchísima diferencia» i a «imposible fracasar».
- **Veu:** s'ha igualat (+7,9 dB), s'ha netejat amb passa-alts, reducció de soroll i de-esser, i s'ha deixat a −16 LUFS i −1,5 dBTP.

## Revisió v2 (sense revisió desada a l'editor)
- **Comprovació objectiva dels talls:**
  - s'ha retranscrit l'àudio del màster amb Parakeet i s'ha alineat amb el text previst de cada tram;
  - les diferències a menys de 0,45 s d'un tall s'han contrastat tornant a transcriure finestres de l'original, també amb Whisper.
- **Tres talls corregits** (cada un es menjava una part de paraula):
  - **«proyec|to»:** el tall queia a l'oclusió de la «t» i el màster sentia «precio». Ara el ganxo acaba a 6,08 s.
  - **«gas|tos»:** el tram r04 acaba ara a 98,96 s.
  - **«…bastante, bastante mal»:** es perdia «mal». Ara el tram r09 acaba a 198,44 s, abans del «va» de la represa.
- **Falses alarmes:**
  - «infinito» (el model sent «simple») i «no se me ha gastado» (sent «gusta») ja sonen així a l'original; no és culpa del tall;
  - «Entonces» abans del flux ja quedava fora.

## Miniatures
- **v1 i v2 rebutjades:** primer or, logos i lletra a mà sobre fons clar; després la variant cinematogràfica amb la persona al costat.
- **v3, el boceto que l'usuari va aprovar:** ell al centre, amb la seva foto de nit (`input/foto_miniatura_noche.webp`, mans juntes sota la barbeta).
  - **D:** **2:45** en groc (la durada exacta, que l'usuari vol sí o sí) → **VIDA NUEVA**, amb una fletxa a mà per sobre del cap.
  - **E:** el mateix amb **TE CAMBIO LA VIDA**.
- **Durada exacta:** perquè la miniatura i l'etiqueta de durada de YouTube diguin el mateix, s'ha tret el darrer tros de 0,7 s (una respiració després de «fracasar»). El vídeo dura 165,3 s, i YouTube marca 2:45 arrodoneixi com arrodoneixi.
- **Fitxers:** `out/miniatura_D_centro.jpg` i `out/miniatura_E_centro.jpg` (1280×720, menys de 2 MB). Es regeneren amb `scripts/miniatures.sh`.
- **Descàrrega** del vídeo, les miniatures i el títol: https://claude.ai/artifact/41XeRqHJWUfpuniU4ZUbhV

## Gràfics (45, un cada ~3,7 s)
- **Seccions** sobre l'escenari clar amb el logo: **I · OpenCode**, **II · ChatGPT**, **III · Claude**.
- **Logos quan parles d'una eina:** DeepSeek 4.1, GPT-6.1 Sol, Opus 5.5 i Sonnet. Al flux final hi tornen a sortir OpenCode, ChatGPT i Claude.
- **Lletra a mà**, com «Me gusta la IA», amb la paraula clau en color:
  - sobre la càmera: «cualquier *proyecto*», «una pequeña *base de datos*», «con *muchísima* diferencia», «imposible *fracasar*»;
  - sobre l'escenari: «como Astra, gastando *20 veces menos*», «razonar, bases de datos y *temas legales*», «este vídeo está creado con *Claude*» (amb el logo), «mi *flujo* de trabajo».
- **Xifres en or darrere teu:** «10€ / 40€», «INFINITO» i «BURRADA». Les curtes («100€», «4%», «20€») van al costat del cap perquè no quedin tapades.
- **Xifres sobre l'escenari:** +30 modelos, 10 $ → +1.000 $ de uso, 5 H (2 o 3 prompts con Astra), 15 M tokens cada hora, i els plans de ChatGPT (20 · 100 · 200 · 500).
- **Caselles:** les 3 IAs al ganxo, Kimi / GLM / Luna i «tu equipo de IA» al final.
- **Paraules flotants i objectes 3D:** 🚫, 🛠️ «side hustles», 👎 «diseño», 🎬, 🧠 i 📊.

## Pendent (revisa-ho tu)
1. **Escolta'l sencer abans de publicar.** Claude no pot escoltar l'àudio. La comprovació amb transcripció automàtica treu els talls que es mengen paraules, però no diu si un empalmament sona natural.
   - Empalmament de preses a Claude: «…en X High, | y estoy gastando…».
   - «…bastante, bastante mal | en este sentido»: els dos costats són nets, però en enganxar-los el reconeixement sent «mal va en».
   - Si vols canviar alguna cosa, fes-ho a l'editor (no s'hi ha desat cap revisió). Després digues-m'ho i torno a renderitzar.
3. **Vídeos fets amb Claude:** quan dius «ahora vais a ver por aquí vídeos que hace» només hi surt un 🎬. Si em passes 2 o 3 clips de vídeos reals, els hi poso.
4. **Noms i xifres** (surten de la transcripció automàtica):
   - DeepSeek 4.1, GPT-6.1 Sol, Astra, Opus 5.5 i Luna;
   - «más de 30 modelos»: a la 1a presa deies 70;
   - «+1.000 $ de uso» amb el pla de 10.
5. **Resolució:** el vídeo és de 832×464 (s'ha ampliat ×2,33 per a 1080p). Si tens l'original en més qualitat, el torno a renderitzar igual.
6. **Música:** opcional. Si en tens una amb llicència, la poso sota la veu, i baixa sola quan parles.
