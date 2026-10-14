# Informe — «en 4 minutos te cambiaré la vida con la IA» (vídeo en brut)

**v2 (estil Alex DiLorenzo + toc manual + logos)** · 2:46 (165,9 s) · **màster per a YouTube: 2560×1440** (`out/video_youtube_1440p.mp4`, H.264 High CRF 12, bt709, AAC 320 kbps) · 30 fps · −16 LUFS
**Original:** `input/raw.mp4`, 6:38 (398,7 s), 832×464 a 60 fps
**Editor de vista prèvia:** https://claude.ai/artifact/QSyL459qMwkAmdczUU5JYb

## Títol
L'original diu «te lo explico en cuatro minutos», però el vídeo editat dura **2:45**. Per això:
- La frase «y te lo explico en cuatro minutos» **s'ha tret** del ganxo (tram `r00b`). Es pot recuperar a l'editor, a la pestanya Talls.
- Títol proposat, amb el format «Dame X minutos» (recerca a `docs/MINIATURES.md`), i 3 minuts és honest per a 2:46: **«Dame 3 minutos y te enseño las 3 IAs para montar cualquier negocio»**.
- Alternatives:
  - «Dame 3 minutos: las 3 IAs para montar cualquier negocio»
  - «Dame 3 minutos y te enseño las únicas 3 IAs que necesitas»
  - «Con estas 3 IAs puedes crear cualquier negocio» (sense minuts)
  - «OpenCode, ChatGPT y Claude: mi flujo de trabajo con IA»
- S'evita «te cambiaré la vida»: els vídeos d'aquest format que funcionen concreten el resultat.
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
- `scripts/miniatures.sh` renderitza les variants a partir de `miniatures.json`. Cada una surt en PNG i en JPG de menys de 2 MB, i `out/miniatures_petites.png` serveix per comprovar com es llegeixen a mida de llista i de mòbil.
- **Variants:**
  - **A:** «3 MIN» en or sobre negre i «cualquier *negocio*» a mà;
  - **B:** «3 IAs» amb els logos d'OpenCode, ChatGPT i Claude, i «las que *uso*»;
  - **C:** «Dame 3 *minutos*» amb la teva lletra (negre i blau sobre gris).
- La foto és teva (`input/foto_miniatura.jpg`) i s'ha retallat amb `scripts/retalla_foto.py`.
- Proposta: posa'n tres a prova amb «Test & Compare» de YouTube Studio.

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
