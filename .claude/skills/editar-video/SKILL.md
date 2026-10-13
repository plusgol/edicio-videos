---
name: editar-video
description: Edita un vídeo vertical de marca personal (IA + negocis, en castellà) amb Remotion seguint l'estil natural i no saturat de la casa. Fes-la servir quan l'usuari demani editar, muntar, subtitular o renderitzar un vídeo de projectes/<nom>/input.
---

# Editar vídeo — estil de la casa

Llegeix `docs/GUIA_EDICIO.md` sencera la primera vegada. Aquest fitxer és el resum operatiu. Si hi ha conflicte, mana la guia.

## Identitat
Marca personal sobre IA i negocis. Vídeos verticals (1080×1920, 30 fps) en castellà, d'entre 60 i 180 s.
**Estil:** natural, clar, ben editat, no saturat. La persona al centre. Les pantalles són proves, no decoració.
**Fórmula:** presència d'Alex DiLorenzo + demostració i orientació de mirada de Kallaway − decoració de tots dos.

## Flux obligatori (eines reals del repositori)
0. **Una sola vegada:** `npm install`, `python3 -m pip install -r requirements.txt` i `scripts/models.sh` (Parakeet per transcriure + YuNet per a la cara).
1. **Ingesta i preparació:** `scripts/prepara.sh projectes/<nom>`. Fa `ffprobe`, extreu els WAV (16 kHz per transcriure, 48 kHz per mesclar), transcriu amb marques per paraula (`work/<presa>.transcript.json`) i genera la versió vertical 1080×1920 amb seguiment de cara (`work/<presa>.vertical.mp4` + `track.json`). Els originals de `input/` no es toquen mai.
2. **Comprova la transcripció.** El model es pot saltar frases en trossos sorollosos. Busca buits de més d'1 s amb energia de veu i retranscriu aquella finestra sola. Si cal, contrasta-ho amb un segon model (Whisper small via sherpa-onnx). Les paraules recuperades van a `asrPatches` de l'EDL. Corregeix els noms amb `brand/glossari.json`. **No inventis mencions.**
3. **Marques verbals:** «corta» retira la presa anterior fins a l'inici de la frase. Una pausa de ≥ 2 s seguida de la mateixa frase indica una repetició: queda't amb l'última presa completa. «marca» assenyala la frase com a candidata a èmfasi. Elimina sempre les paraules de marca.
4. **Pla:** escriu `projectes/<nom>/edl.json` (model: `projectes/ias-que-uso/edl.json`).
   - `ranges` són els trossos de contingut, en ms de l'original, amb el text corregit dels subtítols (amb puntuació: els punts tallen pàgines), els `highlight` i el `reason`.
   - `punchIns` són els canvis d'escala d'èmfasi.
   - `overlays` són el ganxo i les etiquetes, ancorades a un temps de l'original (`anchorMs`).
   - Els silencis llargs dins de cada `range` els retalla `munta.py` sol.
5. **Muntatge:** `python3 -I scripts/munta.py projectes/<nom>`. Escriu `work/render.json` (fotogrames de sortida), `work/voice.wav` (fosos de 12 ms, neteja i −16 LUFS / −1,5 dBTP) i `work/muntatge.txt`.
6. **Revisió:** mostra a l'usuari `work/muntatge.txt`: durada, segments, subtítols i recursos.
7. **Fotogrames de prova:** `npx remotion still src/index.ts Video qa.png --public-dir=projectes/<nom> --frame=N`. Fes-ne un de cada tipus d'escena i mira'ls: ulls i boca lliures, contrast, desbordaments.
8. **Render:** `scripts/render.sh projectes/<nom>`. A l'entorn al núvol cal afegir `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`.
9. **QA:** recorre la checklist (§21 de la guia). Comprova la sonoritat amb `ebur128` i que la durada coincideixi amb el títol.
10. **Entrega:** deixa a `out/` el `video.mp4` i l'`informe.md` (decisions, dubtes i pendents concrets). L'`edl.json` va a git.

## Ritme
- Silenci < 250 ms: no el toquis. De 250 a 600 ms: redueix-lo a 150–250 ms. > 600 ms: talla-hi i deixa 150 ms després de l'última paraula i 120 ms abans de la següent.
- Conserva les pauses expressives (400–800 ms) i les reaccions (somriures, mirades). No treguis totes les respiracions.
- **No acceleris mai la veu.** No enganxis dues preses dins d'una mateixa frase.
- Jump cuts: alterna l'escala (1,00 ↔ 1,08). Fes servir 1,15–1,20 només per a l'èmfasi, i com a màxim 3–4 vegades per vídeo. Dos segments seguits del mateix pla no poden tenir la mateixa escala. El canvi d'escala és **tallat, no animat**. Ancora l'escala als ulls.
- J-cut: la demo entra 4–8 fotogrames després de la frase que la presenta. L-cut: la demo es queda 8–15 fotogrames després de la frase.
- Pla base sense canvi: màxim de 8–10 s al cos. Cap segment pot durar menys de 15 fotogrames (excepte les proves ràpides del ganxo).

## Estructura
Ganxo (0–3 s) → context (fins a ~12 s) → mapa d'eines → blocs → idea final → un sol CTA.
**Mòdul de cada eina:** problema (cara) → eina + etiqueta → prova (demo: què demano / què surt / focus) → criteri personal (cara).
Si una demo no existeix, deixa cara + etiqueta i afegeix `pending` a l'EDL. **No facis servir mai B-roll genèric ni captures inventades.**

## Ganxo
- El fotograma 0 ja és contingut: ni negre, ni fos, ni logo, ni salutació.
- La primera paraula ha de sonar en < 0,3 s.
- `HookText` (4–8 paraules) visible des del fotograma 0 durant 2,5–3,5 s. Mentre es veu, amaga el subtítol si diu el mateix.
- Opcional: una prova real de 0,8–1,5 s dins dels primers 3 s.

## Layouts permesos (no n'inventis d'altres)
`CARA`, `CARA_ETIQUETA`, `SPLIT` (demo a dalt ~1080×1000, cara a baix, subtítols a la unió), `DEMO_COMPLETA` (≤ 6–10 s), `FOCUS` (màscara del 55–65 % + rectangle), `FRASE_CLAU` (≤ 1–2 per vídeo), `PASSOS` (només si el discurs descriu etapes).

## Text
- Zona segura: x 60–940, y 220–1500. Subtítols a L1/L2 amb el centre a y ≈ 1250–1350.
- Subtítols: font i mides de `brand/estil.ts`. 3–6 paraules per pàgina, per blocs de sentit. ≤ 2 línies, ≤ 30 caràcters per línia, sense punts finals, i durada mínima de ~0,7 s. **Sense karaoke ni rebots.** Com a molt una paraula en color d'accent per pàgina, i amb motiu.
- Etiqueta d'eina: `Nom · funció de 3–6 paraules`. Entrada de 6–7 fotogrames (opacitat + 16–24 px), es queda 2–3,5 s i surt en 4–5 fotogrames.
- No dupliquis la mateixa frase alhora a la veu, al subtítol i en una targeta.
- Comprova els desbordaments amb `@remotion/layout-utils`.

## Demos
- Amplia la zona rellevant fins que el text faci ≥ 28 px efectius. El retall es queda quiet mentre es llegeix.
- Temps de lectura: 0,35 s per paraula rellevant + 1 s (mínim 2 s).
- Retalla les esperes i els clics. Fes servir `FOCUS` per assenyalar la part que menciona la veu.

## Moviment
Tall directe per defecte. Fes servir `spring({damping: 200})` o `Easing.out(Easing.cubic)`. Tot ha de dependre de `useCurrentFrame()`: res de CSS transitions, timers ni aleatorietat sense llavor.
**Prohibit:** zooms periòdics, rebots, glitch, flaixos, sacsejades, partícules, neó, halos, xifres gegants, signes de moneda, desenfocar la persona, separadors complets per a cada eina, *whooshes*, *risers*.

## Temps (sense errors acumulats)
Calcula els límits de cada segment en fotogrames sobre el temps acumulat (`Math.round(ms*fps/1000)`). La durada és la diferència entre els límits. Tota posició de recurs es deriva de `sourceMsToOutputFrame()`. Recalcula-ho tot després de cada canvi de tall.

## So
Veu per sobre de tot. La música és opcional, instrumental i amb llicència, clarament per sota de la veu i amb ducking. Efectes de so: gairebé cap.
**No certifiquis mai que un empalmament sona natural si no l'has escoltat.** Posa a `informe.md`: «Escolta humana pendent: …».

## Títol
El títol, el text del ganxo i la primera frase s'han de reforçar entre ells. **La durada i el número d'eines del títol han de coincidir amb el vídeo final.** Res de promeses que el vídeo no pugui complir. Proposa'n 3–5 opcions a `informe.md` (vegeu §7 de la guia).

## Remotion (versió fixada: 4.0.528)
- Composició `Video` (`src/Root.tsx`). El pla es llegeix de `work/render.json` amb `calculateMetadata`, i el projecte es tria amb `--public-dir`.
- Components: `CameraSegment` (`OffthreadVideo` muted + `trimBefore`, escala ancorada als ulls), `Captions`, `HookText` i `ToolLabel`. Tot el disseny surt de `brand/estil.ts`.
- La veu és un únic `<Audio>` amb `work/voice.wav`. Els clips de vídeo van sempre `muted`.
- Font Inter local (`@fontsource/inter` + `@remotion/fonts`): el render no depèn de Google Fonts.
- **En plans tancats (selfie)**, el ganxo i les etiquetes van al terç inferior, a sobre dels subtítols (`LABEL.top`), mai a dalt sobre els ulls.
