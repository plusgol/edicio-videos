# edicio-videos

Edició automàtica de vídeos de marca personal (IA + negocis, en castellà) per a **YouTube (16:9)**, i opcionalment Shorts, amb **Claude Code + Remotion + snapcn**.

**Estil:** natural, clar, ben editat i sense saturar. La presència d'Alex DiLorenzo + la demostració de Kallaway − la decoració dels dos.

## Què hi ha
| Ruta | Què és |
|---|---|
| `docs/GUIA_EDICIO.md` | La guia completa: anàlisi dels referents, regles de ritme, layouts, subtítols, so, títols, arquitectura i QA |
| `docs/analisi_referents_original.txt` | L'informe visual original dels dos vídeos de referència |
| `docs/edl.exemple.json` | Exemple del pla de muntatge (EDL) que escriu Claude abans de renderitzar |
| `brand/estil.ts` | Tokens de marca i d'edició (colors, font, mides, temps) |
| `brand/glossari.json` | Noms d'eines, marques verbals («corta», «marca») i funcions de les etiquetes |
| `.claude/skills/editar-video/SKILL.md` | Instruccions operatives que Claude segueix per editar |
| `projectes/<nom>/` | Un vídeo per carpeta: `input/` (originals), `work/`, `out/` |

## Com s'utilitza

### Una sola vegada
```bash
npm install
python3 -m pip install -r requirements.txt
scripts/models.sh          # Parakeet (transcripció local, castellà) + YuNet (detecció de cara)
```
També cal tenir **ffmpeg** instal·lat.

### Per a cada vídeo
1. Copia les preses a `projectes/<nom>/input/`. **Envia't l'arxiu original del mòbil**: WhatsApp el redueix a 832×464.
2. A Claude Code: *«Edita el vídeo de projectes/<nom>»*. Claude:
   - executa `scripts/prepara.sh projectes/<nom>` (àudio, transcripció per paraula i versió vertical que segueix la cara);
   - escriu `projectes/<nom>/edl.json` (el pla de muntatge, amb el motiu de cada decisió);
   - munta i renderitza amb `scripts/render.sh projectes/<nom>`.
3. Resultat: `projectes/<nom>/out/video.mp4`, el resum `work/muntatge.txt` i `projectes/<nom>/informe.md`.

Per previsualitzar i retocar a mà: `npx remotion studio src/index.ts --public-dir=projectes/<nom>`.

## Estructura del codi
| Ruta | Què fa |
|---|---|
| `scripts/transcriu.py` | Transcripció local amb marques per paraula (sherpa-onnx + Parakeet TDT v3) |
| `scripts/reencuadra.py` | Reenquadra a 1920×1080 (o 1080×1920 per a Shorts) seguint la cara (YuNet) i desa la posició dels ulls |
| `src/vendor/snapcn` | Components de snapcn (MIT) per a les insercions gràfiques; banc de proves a la composició `Galeria` |
| `scripts/munta.py` | EDL → `render.json` (fotogrames) + `voice.wav` (veu neta, −16 LUFS). Tot el càlcul de temps és aquí |
| `src/` | Projecte Remotion: `CameraSegment`, `Captions`, `HookText`, `ToolLabel` |
| `brand/estil.ts` | Totes les mides, colors i temps |

## Vídeos
| Projecte | Estat |
|---|---|
| `projectes/ias-que-uso` | v2 per a YouTube 16:9 (84,6 s) amb insercions de snapcn, feta amb la versió de WhatsApp. Pendent: arxiu original i escolta |
