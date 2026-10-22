# El kit d'edició d'Alex DiLorenzo: què n'hem après

Font: «EDITOR DE VIDEO | ALEX DILORENZO v1.0.1.zip», el paquet de la versió 2026.10.16 que l'usuari va compartir per Drive el 21/10/2026.
És el sistema d'edició amb Claude que fa servir Alex: 31 skills, uns 70 scripts de control de qualitat, presets de YouTube, efectes de so i LUT.

**El paquet no és al repositori.** No té llicència, i alguns efectes de so semblen trets de YouTube. Aquí només hi ha les regles, escrites amb paraules nostres.

**No el fem servir tal qual, per tres motius:**
- La transcripció (WhisperX) està fixada en anglès.
- Les animacions es fan amb un altre motor (HyperFrames).
- L'exportació en 4K amb x264 `slow` trigaria hores en aquest entorn.

Les regles que valen la pena les hem portat a `scripts/munta.py` i als components de `src/alex/`.

**Des del 21/10/2026 també el fem servir sencer**, amb tres pegats (castellà, 1080p, muntatge per trams): com muntar-lo en una sessió nova, l'editor web i el projecte de CapCut són a la skill `kit-alex` (`.claude/skills/kit-alex/SKILL.md`) i la nostra feina a `kit_alex/`. El kit continua fora del repositori.

On aquest document xoca amb `ESTIL_ALEX.md`, mana aquest: és el sistema del mateix Alex.

## 1. Talls de veu (el que fa que no soni robòtica)

### Pauses
- Només s'escurcen les pauses de **més de 0,65 s**.
- Les respiracions de 0,4–0,6 s a mitja frase són naturals. Tallar-les afegeix empalmaments, i cada empalmament és un defecte possible.
- Valor a `edl.cuts.shortenSilenceLongerThanMs`.

### Trossos
- Els trossos han de ser **frases senceres**. El ritme el donen els gràfics, no picar l'àudio.
- Al muntatge que Alex va aprovar, la mitjana era de 5,4 s per tros.

### Crosses
- Una crossa («eh», «pues») a mitja frase **es queda**. Només es treu a l'inici o al final d'un tros.

### Empalmaments
- A cada empalmament, **fosa de potència constant de 15 ms**, amb el tros que surt allargat 15 ms per sota del tall.
- Així la fosa barreja so de sala real. Fondre a zero deixava forats de 8–13 dB de so ambient.
- Un tall entre dos trossos seguits de la mateixa presa no porta fosa.
- Valor a `edl.audio.crossfadeMs`.

### Cadena d'àudio
- Una sola vegada sobre tota la pista: **guany fix → limitador a −6 dBFS**.
- Sense reducció de soroll, sense compressor i sense `loudnorm`: el primer fa la veu metàl·lica, i els altres dos fan bombar el fons.
- Valor a `edl.audio.chain = "static"`.

### Nivell de cada presa
- Es mesura **només sobre els trossos que es queden**. El temps mort abaixaria la mesura i la presa quedaria massa forta.

### Punts de tall
- Els talls cauen a la graella de fotogrames.
- Una vora de paraula es mesura en relació amb el pic de la paraula, no amb un llindar fix.
- **Entrada:** 40 ms abans de l'atac.
- **Sortida:** 70 ms després de la caiguda, o 250 ms si la frase «aterra» i necessita un respir.
- Els temps de l'ASR són una referència aproximada, no la vora exacta.

### Dues paraules enganxades
- Quan no hi ha silenci on encaixar el tall, es tria a mà i es comprova amb l'ASR.
- A l'EDL: `exactIn` / `exactOut`.

### Zoom de càmera per amagar un salt
- **Mínim ×1,15.** Per sota, sembla que la càmera tremola, no un pla nou.

## 2. Història (storytelling)

### Què es queda
- **Rellevant no vol dir necessari.** Una frase només es queda si l'espectador la necessita en aquell moment.
- Fora:
  - el context «bo de saber»;
  - els avançaments de com es farà una cosa;
  - la segona vegada que es diu una idea;
  - les introduccions per escalfar.

### Repeticions
- **Represes:** es queda l'última presa completa. L'excepció és el ganxo, on es queda la lectura més expressiva.
- **Repeticions d'èmfasi:** es queda la versió més forta. La frase fluixa just abans d'una de més forta és l'eco.
- **Ensopegades i arrencades en fals:** fora, encara que sigui a mitja frase.

### Coherència
- Cada «entonces», «por eso» o «esto» ha de seguir apuntant a alguna cosa que s'ha quedat.

### Estructura
- Ganxo al primer fotograma.
- Tot el que es promet als primers 8 s es veu abans del final.
- La prova va abans de la tesi.
- No s'explica el que encara no s'ha vist.
- Un segon exemple ha d'ensenyar una cosa nova.

### Revisió amb ulls nous
- Es llegeix el que queda com un sol text seguit.
- Es busquen:
  - connectors orfes;
  - ecos;
  - informació sobrera;
  - ritme trencat;
  - un final tallat.

## 3. Pantalla comentada

### Finestreta de cara (la «corner cam» d'Alex)
- **Quadrada**, 300 px a 1080p, a 30 px de la cantonada.
- Radi 54 i ombra suau, sense vora.
- **Pla obert (cap i espatlles)**, centrat a la cara amb el seguiment de cara.
- Valors a `PANTALLA.pip`.

### Gravació
- Mai a menys de **80 px de la vora** del vídeo (`PANTALLA.edge`).
- Res important del que es veu a la pantalla queda sota la cara.

### Zooms
- **Un sol zoom suau per objectiu**, mai el primer ni l'últim segon de la presa.
- Si s'ensenya un prompt, que ocupi el 65–70 % de l'amplada.

### Els textos no es graven, es refan
- Un prompt o una ordre es mostra com a gràfic, **literal**, amb el tros que es diu ressaltat.
- Si no tenim el text exacte, va a `pending`.

### Marques sobre la gravació
- **Retolador groc** per a una frase.
- **Requadre vermell** dibuixat en sentit horari per a una xifra.

## 4. Gràfics (per a les properes versions)

### Densitat
| Mesura | Valor |
|---|---|
| Esdeveniments gràfics | 11–13 per minut |
| Tram sense res | màxim 6 s |
| Pantalla completa | 2–3 per minut, i mai més de 40 s sense cap |
| Temps de lectura d'un gràfic | 2–3 s |

### Entrades i sortides
| Moviment | Valors |
|---|---|
| Objectes: «pop» | 0,90 → 1,10 en 3 fotogrames, després 1,00 |
| Frase cop de puny: «slam» | 1,16 → 1,00 en 7 fotogrames |
| Text: puja | 22 px, 0,55 s |
| Sortida | 18 px amunt i fosa, 0,35 s |

- El text **mai** fa «pop».

### «Float»
- Tot gràfic que es queda a la pantalla es mou molt lleugerament: 6/8 px, períodes d'1,25/0,95 s.

### Pantalles completes
- Entren i surten amb tall sec.
- Centrades a 0,92, amb un moviment de càmera de 1,00 a 1,05.
- Com a mínim dues fases.

### Honestedat
- Un gràfic amb forma de dades i valors inventats és un defecte.
- Els nostres gràfics d'exemple porten «Ejemplo ilustrativo» (regla de `CLAUDE.md`).

### Efectes de so
- Surten dels gràfics, no del text.
- Màxim 3 per segon.
- Les sortides i els talls a cara van en silenci.

| Gràfic | So |
|---|---|
| pop | Pop |
| text que puja | Whoosh suau |
| xifra positiva | Campaneta, −10 dB |
| paraula negativa | Error, −7 dB |

### Color de càmera
- LUT Autumn-Rec709, intensitat 80, saturació 120, sota els gràfics.
- **No la tenim:** és un paquet comercial (CinePacks).
