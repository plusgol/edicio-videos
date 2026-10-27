---
name: video-presentacio
description: Fa un vídeo de presentació o de llançament d'un producte (una plataforma, una app, una funció nova) amb Remotion i el mètode del launch-video-kit: veu per línies abans de muntar, música mapejada a la història, càmera quieta amb viatges curts sobre la interfície refeta en HTML, subtítols només del que no és en pantalla i verificació mesurada. Fes-la servir quan l'usuari demani un vídeo per anunciar, presentar o llançar una plataforma (p. ex. UniMatx), o esmenti el launch-video-kit.
---

# Vídeo de presentació (launch-video-kit)

Origen: [borjaperfra/launch-video-kit](https://github.com/borjaperfra/launch-video-kit) (MIT). Els helpers són copiats
a `src/vendor/launch-video-kit/` (càmera, ducking, subtítols). Exemple sencer: `projectes/unimatx-llancament/`
(composició `UniLlancament`, codi a `src/llancament/`).

## Ordre de treball (no te'l saltis)
1. **Brief** (`projectes/<nom>/BRIEF.md`): objectiu, què ha de pensar qui el mira, **què està prohibit dir** i d'on surt
   cada dada. Res d'inventat: si una dada no és a la web o al producte, no hi va. Resultats sempre marcats «Exemple».
2. **Mira el producte de debò** abans d'escriure: web pública amb Playwright i, si n'hi ha, gravacions de demo.
   No entris dades personals ni creïs comptes sense permís de l'usuari.
3. **Veu primer**: `veu.json` (una línia per fitxer) →
   `ELEVENLABS_API_KEY=… python3 scripts/unimatx/veu_linies.py projectes/<nom>`. Imprimeix els fotogrames de cada línia:
   aquests números fixen el muntatge. Revisa-la amb transcripció (faster-whisper a `/home/user/tools/whisperx-venv`);
   si una paraula no s'entén, posa-li un `say` a `veu.json` i torna-la a fer amb `--only NN --force`.
   La clau només per l'entorn, mai en fitxers.
4. **Música**: sintetitzada a 120 ppm (un compàs = 60 fotogrames a 30 fps), amb l'arc de la història: intro, pujada,
   entrada amb el producte, respir a l'escena densa de llegir, segona entrada al resultat, cop final al tancament.
   Exemple: `scripts/unimatx/musica_llancament.py`. Verifica-la amb `node <kit>/scripts/analyze-music.mjs --file …`.
5. **Muntatge** (`src/<nom>/muntatge.ts`): escenes a compàs; cada línia de veu té el seu `at`.
6. **Interfície refeta en HTML** en un espai de 1920×1080 amb els colors exactes de la web (`getComputedStyle`).
   Mateixa interfície a banda i banda d'un tall, **mateix component**.
7. **Càmera**: `moves()` del kit, quieta i amb viatges de 24 fotogrames. Cada escena comença on ha acabat l'anterior.
   `useCamera` dona per fet que l'espai de disseny fa la mida del llenç: per baixar per una pàgina, fes-hi scroll.
8. **Subtítols** al final, només de les frases que no són escrites en pantalla.
9. **Render**: `scripts/unimatx/render_llancament.sh` (adapta'l) → −14 LUFS i pic per sota de −1 dB.

## Verificar en lloc d'opinar
- Full de contactes de fotogrames clau abans d'ensenyar res.
- La veu sobre la música ha de mesurar com la veu sola:
  `ffmpeg -hide_banner -ss <s> -t 4 -i out.mp4 -af volumedetect -f null /dev/null`.
- Transcripció de la mescla final: totes les línies s'han d'entendre amb la música a sota.
- `DUCK.base` no passa de ~0,85.

## Prohibit
- Publicar al repositori (és públic) material de pagament del client, com ara el contingut sencer del seu test.
  Notes així van a `projectes/<nom>/work/` (no es versiona) o a la pàgina privada de l'usuari.
