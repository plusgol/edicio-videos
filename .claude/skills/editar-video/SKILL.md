---
name: editar-video
description: Edita un vídeo de marca personal (IA + negocis, en castellà) per a YouTube 16:9 amb Remotion, amb l'estil d'Alex DiLorenzo (docs/ESTIL_ALEX.md). Fes-la servir quan l'usuari demani editar, muntar, renderitzar o revisar un vídeo de projectes/<nom>/input.
---

# Editar vídeo — estil de la casa

Llegeix `docs/GUIA_EDICIO.md` sencera la primera vegada. Aquest fitxer és el resum operatiu. Si hi ha conflicte, mana la guia.

## Identitat
Marca personal sobre IA i negocis, en castellà. **Format principal: YouTube llarg, horitzontal 1920×1080 a 30 fps.**
**Estil (decidit per l'usuari): el del vídeo d'Alex DiLorenzo «mis +10.000 horas de YouTube explicados en 15 minutos».** Llegeix `docs/ESTIL_ALEX.md` abans d'editar: hi ha el catàleg de recursos, el ritme i les regles de context. En resum:
- **Ritme:** pauses molt curtes (> 300 ms → 70–90 ms de marge) i un canvi visual cada 2–4 s. Les escales del pla base es van alternant entre 1,00, 1,12 i 1,22.
- **Cada xifra** → `GoldWord` (or condensat; `placement: "behind"` la posa darrere de la persona retallada). **Cada concepte fort** → `GoldWord` blanc o daurat.
  Una xifra curta («4%», «20€», «100€») darrere del cap queda tapada: afegeix-hi `side: "right"` (o `"left"`) i va al costat de la cara. Comprova-ho sempre en un fotograma.
- **Cada pas** → `SectionNumeral` (I, II, III + títol). **Cada metàfora o objecte** → `EmojiPop` (emoji 3D a la mà o sobre l'escenari).
- **Comparacions de preus o xifres** → `StageStat`. **Connexions entre eines** → `NetworkDiagram`. **Resum de llista** → `SlotsRow`.
- **Frases clau** → `FloatingWords` al costat del cap (cada 10–20 s).
- Totes les entrades i sortides amb desenfocament ràpid. Res d'imatges generades presentades com a reals ni de captures inventades.
- Icones: `emoji:<codi>` (Fluent Emoji 3D, `node_modules/@lobehub/fluent-emoji-3d/assets`) i `logo:<nom>` (`node_modules/@lobehub/icons-static-svg/icons`). `munta.py` les copia a `projectes/<nom>/assets/`.

## Insercions gràfiques (snapcn, `src/vendor/snapcn`)
Són components de [snapcn](https://snapcn.dev) amb llicència MIT, copiats al projecte. A l'EDL es declaren com a `overlays` amb `type` = nom del component i `props`. `src/Overlays.tsx` els pinta a pantalla completa amb el tema de l'EDL (`video.theme`: mode i accent).
| Necessitat | Component |
|---|---|
| Ganxo / rètol de secció («01 / OpenCode») / xifra («1.000 $ / en APIs») | `PunchLines` (`script` amb `/` per a línies i `\|` per a targetes; `fontSize` 120–160) |
| Eina de terminal o llista de models/ordres | `TerminalSimulator` (`intro`, `lines` de ≤ 24 caràcters; necessita ~5–6 s) |
| Canvi d'una dada («Plan de 100 €» → «Plan de 20 €») | `TextSwap` |
| Frase clau amb una paraula marcada | `TextHighlight` (`preset: "marker"`) |
| Flux o automatització pas a pas (n8n, agents) | `AgentSteps` (`scale` ~1,8 en 1080p) |
| Prompt que s'escriu en un xat | `PromptSend`, `AnswerStream` |
| Gravació de pantalla real | `ScreenRecording` (crop + zoom automàtic) |
Si una inserció mostra una interfície **il·lustrativa** (un terminal, un xat), el `reason` ho ha de dir i no pot presentar-se com una captura real. Abans de fer servir un component nou, prova'l al banc `Galeria` (`npx remotion still src/index.ts Galeria …`).

## Flux obligatori (eines reals del repositori)
0. **Una sola vegada:** `npm install`, `python3 -m pip install -r requirements.txt` i `scripts/models.sh` (Parakeet per transcriure + YuNet per a la cara).
1. **Ingesta i preparació:** a més de `prepara.sh`, retalla la persona per als textos «darrere»: `python3 -I scripts/retalla_persona.py work/<presa>.1920x1080.mp4 work/<presa>.persona.webm` (Robust Video Matting) i posa `"person": "work/<presa>.persona.webm"` a la font de l'EDL.
   **Preparació bàsica:** `scripts/prepara.sh projectes/<nom>`. Fa `ffprobe`, extreu els WAV (16 kHz per transcriure, 48 kHz per mesclar), transcriu amb marques per paraula (`work/<presa>.transcript.json`) i reenquadra amb seguiment de cara a 1920×1080 (`work/<presa>.1920x1080.mp4` + `.track.json`; per a Shorts, `scripts/prepara.sh projectes/<nom> 1080x1920`). Els originals de `input/` no es toquen mai.
2. **Comprova la transcripció.** El model es pot saltar frases en trossos sorollosos. Busca buits de més d'1 s amb energia de veu i retranscriu aquella finestra sola. Si cal, contrasta-ho amb un segon model (Whisper small via sherpa-onnx). Les paraules recuperades van a `asrPatches` de l'EDL. Corregeix els noms amb `brand/glossari.json`. **No inventis mencions.**
3. **Marques verbals:** «corta» retira la presa anterior fins a l'inici de la frase. Una pausa de ≥ 2 s seguida de la mateixa frase indica una repetició: queda't amb l'última presa completa. «marca» assenyala la frase com a candidata a èmfasi. Elimina sempre les paraules de marca.
4. **Pla:** escriu `projectes/<nom>/edl.json` (model: `projectes/ias-que-uso/edl.json`).
   - `ranges` són els trossos de contingut, en ms de l'original, amb el text corregit dels subtítols (amb puntuació: els punts tallen pàgines), els `highlight` i el `reason`.
   - `punchIns` són els canvis d'escala d'èmfasi.
   - `overlays` són el ganxo i les etiquetes, ancorades a un temps de l'original (`anchorMs`).
   - Els silencis llargs dins de cada `range` els retalla `munta.py` sol.
5. **Muntatge:** `python3 -I scripts/munta.py projectes/<nom>`. Escriu `work/render.json` (fotogrames de sortida), `work/voice.wav` (fosos de 12 ms, neteja i −16 LUFS / −1,5 dBTP) i `work/muntatge.txt`.
6. **Revisió (editor de vista prèvia):** `scripts/editor.sh projectes/<nom>` (títol de la pestanya amb `EDITOR_TITLE=...`; ajusta els mitjans al límit de 15 MB per fitxer segons la durada) i publica `out/editor/index.html` com a artefacte (amb `files` i `capabilities: {db: {}}`; mateix fitxer = mateixa URL). L'usuari hi revisa, edita i aprova. Després llegeix el document `revisio/actual` (ArtifactData `get` amb `out_dir`) i aplica'l amb `python3 -I scripts/aplica_revisio.py projectes/<nom> <fitxer.json>`. Els comentaris els has de resoldre tu. Torna a muntar i renderitza.
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

## Layouts permesos en vertical (Shorts; no n'inventis d'altres)
`CARA`, `CARA_ETIQUETA`, `SPLIT` (demo a dalt ~1080×1000, cara a baix, subtítols a la unió), `DEMO_COMPLETA` (≤ 6–10 s), `FOCUS` (màscara del 55–65 % + rectangle), `FRASE_CLAU` (≤ 1–2 per vídeo), `PASSOS` (només si el discurs descriu etapes).

## Text
- **YouTube 16:9:** sense subtítols cremats (`video.captions: false`; van com a CC a YouTube). El text en pantalla són els rètols de secció, les insercions i els rètols inferiors.
- **Shorts 9:16:** zona segura: x 60–940, y 220–1500. Subtítols a L1/L2 amb el centre a y ≈ 1250–1350.
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
**Prohibit:** zooms periòdics sobre la cara, glitch, flaixos, sacsejades, partícules, neó, halos, pluja de signes de moneda, desenfocar la persona, *whooshes*, *risers*. Les animacions pròpies dels components de snapcn sí que estan permeses: són el llenguatge visual del canal.

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
- En horitzontal, `ToolLabel` és un rètol inferior esquerre. En vertical i amb plans tancats (selfie), va al terç inferior, a sobre dels subtítols, mai a dalt sobre els ulls.
- En aquest entorn al núvol, el render necessita `--ignore-certificate-errors` (Google Fonts passa per un proxy). Al teu ordinador no cal.
