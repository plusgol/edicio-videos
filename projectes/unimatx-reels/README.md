# Reels d'UniMatx

Vuit vídeos verticals (1080×1920, 30 fps) per a UniMatx, fets sencers en codi: no hi ha gravació de càmera.

| Codi | Fórmula | Títol |
|---|---|---|
| A1–A4 | A-B, com el vídeo de ClubOS: ciutat isomètrica, títols amb píndola, mòbil amb l'app, «mentrestant» de nit, logo i CTA | Mateixa nota · Dues tutories · Tres centèsimes · Dos sopars |
| S1–S4 | Sèrie, com el vídeo del zombie: il·lustració 2D de nit, xip d'hora, avisos, ◀◀, subtítols karaoke i «PART 2» | L'assignació · Vuit caselles · Quatre hores de laboratori · Un entre 661 |

## Com es fan
1. **Guió:** `guions.json` (veu i rètols de cada pla). La pàgina de guions es fa amb `scripts/unimatx/pagina/build.py`.
2. **Veu (la bona):** `ELEVENLABS_API_KEY=… python3 scripts/unimatx/veu_elevenlabs.py projectes/unimatx-reels FGY2WhTYpPnrIDTdsKH5 tots`
   (ElevenLabs, model `eleven_v3`, català, veu Laura). Cada pla es desa a `<codi>/el/` (no es versiona) i no es torna a pagar.
   «UniMatx» es llegeix «Uni Match»; on una frase sortia «un imatge», `<codi>/veu_say.json` hi posa una grafia comprovada amb transcripció.
   **Veu provisional sense clau:** `/home/user/tools/piper-venv/bin/python scripts/unimatx/veu.py projectes/unimatx-reels tots`
   (Piper, veu `ca_ES-upc_ona-medium`, dades CC BY-SA 3.0 ES). Escriu `<codi>/veu.wav` i `<codi>/timing.json`.
   Per posar-hi una veu real: grava-la per plans, substitueix `veu.wav` i torna a fer el `timing.json` amb els temps de cada pla.
3. **Música i efectes:** `python scripts/unimatx/so.py projectes/unimatx-reels/so` (sintetitzats, sense mostres de tercers).
4. **Imatge:** `src/unimatx/` (A-B: `AB.tsx`, `World.tsx`, `Night.tsx`, `Phone.tsx`; sèrie: `Serie.tsx`, `Scenes.tsx`, `Person.tsx`).
   Què es veu a cada pla: `specs.ts` (A-B) i `serieSpecs.ts` (sèrie). Colors i mides: `brand/unimatx.ts`.
5. **Render:** `scripts/unimatx/render.sh A1 S1 …` → `out/<codi>.mp4` (−14 LUFS A-B, −16 LUFS sèrie).

## Què és de veritat i què no
- Les pantalles del mòbil reprodueixen l'app de la demo (unimatx.cat): test, top 3, notes de tall, «Què hauràs d'acceptar», dades d'AQU, tauler del centre. Les xifres són les dels informes d'exemple de la demo i ho diuen a la pantalla.
- Els personatges, les notes dels alumnes i els avisos són de ficció; els avisos porten «avís fictici de la sèrie» i la sèrie acaba amb «Història de ficció».
- Pendents abans de publicar: veu real, comprovar el calendari i les regles de la preinscripció (S1, S2), canviar les activitats d'exemple del test per preguntes reals (S1), i decidir qui respon el CTA.
