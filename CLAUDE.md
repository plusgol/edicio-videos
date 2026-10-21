# CLAUDE.md

Repositori per editar els vídeos de marca personal de l'usuari (IA + negocis, en castellà) amb Remotion. **Format principal: YouTube llarg, horitzontal 16:9. Estil: el d'Alex DiLorenzo (`docs/ESTIL_ALEX.md`)**, amb components propis a `src/alex/` (i snapcn a `src/vendor/snapcn` com a reserva).

- Abans d'editar res, carrega la skill `editar-video` i llegeix `docs/ESTIL_ALEX.md` (l'estil manat), `docs/KIT_ALEX.md` (les regles del kit d'edició del mateix Alex: talls, història, pantalla comentada; en talls i àudio mana aquest) i `docs/GUIA_EDICIO.md` (criteris generals: on hi hagi conflicte, mana ESTIL_ALEX).
- Abans del render final, publica l'editor de vista prèvia (`scripts/editor.sh`) perquè l'usuari revisi, i aplica la seva revisió (`scripts/aplica_revisio.py`).
- Tots els valors visuals i de temps surten de `brand/estil.ts`. No posis números màgics als components.
- Els originals de `projectes/*/input/` no es modifiquen mai.
- Cada recurs de l'EDL porta un `reason`. Si no en té cap de comprensible, es retira.
- No inventis demos, captures, mencions d'eines ni resultats. El que falti va a `pending`.
- No declaris revisat un àudio que no s'ha escoltat.
- Comunicació amb l'usuari en català. Text en pantalla i títols en castellà.
