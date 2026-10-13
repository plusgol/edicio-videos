# edicio-videos

Edició automàtica de vídeos verticals de marca personal (IA + negocis, en castellà) amb **Claude Code + Remotion**.

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
1. Crea `projectes/<nom-del-video>/input/` i hi poses la gravació de càmera i les demos (`demo_<eina>.mp4`).
2. A Claude Code: *«Edita el vídeo de projectes/<nom-del-video>»*.
3. Claude et mostra el pla de muntatge. El revises, el renderitza i et deixa a `out/` el MP4, l'EDL i un informe amb els pendents.

## Pendent
- Projecte Remotion (components `CameraSegment`, `ToolLabel`, `Captions`, `FocusMask`…) i scripts de ffmpeg/whisper.
