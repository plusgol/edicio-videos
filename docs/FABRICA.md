# Fàbrica de vídeos

D'un brief a un vídeo acabat i comprovat, amb una ordre. Per a reels de text, promos curtes i vídeos de producte
amb captures reals. Les regles i el vocabulari són els de la skill `motion-graphics` (guia de Damiano Caudullo).

```
[ELEVENLABS_API_KEY=…] python3 scripts/fabrica/fabrica.py projectes/<nom> [--estils kinetic,glass] [--sense-veu]
                                                                    [--sense-render] [--escala 2]
```

Surt a `projectes/<nom>/out/`: un `<nom>-<estil>.mp4` per estil, un full de Reels per estil
(`<nom>-<estil>-zona.jpg`, en vertical) i `informe.md`. Uns 2–3 minuts per estil per a 30 s de vídeo.

## El brief (`projectes/<nom>/brief.json`)

```json
{
  "title": "UniMatx · demo per a centres",
  "why": "per què existeix aquest vídeo i d'on surt cada dada",
  "format": "vertical",
  "language": "ca",
  "styles": ["unimatx", "kinetic"],
  "voice": {"id": "FGY2WhTYpPnrIDTdsKH5", "speed": 1.08},
  "pronounce": {"UniMatx": "Uni Match"},
  "logo": "assets/logo.png",
  "screens": [
    "Una frase amb la *paraula clau*.",
    "En *7* minuts ho veureu tot.",
    {"text": "Què hi veureu:", "items": ["Com s'hi entra", "El test en sis fases", "L'informe del centre"]},
    {"text": "L'informe del *centre*", "image": "input/informe.png", "focus": {"x": 0.5, "y": 0.3, "zoom": 1.4}, "reframe": true},
    {"text": "Un *87 %* hi encaixa", "bar": {"value": 0.87}},
    {"text": "*unimatx.cat/demo*", "say": "unimatx punt cat barra demo", "sub": "Demaneu-nos accés per al vostre centre", "end": true}
  ]
}
```

| Clau | Què fa |
| --- | --- |
| `format` | `vertical` (1080×1920, Reels/TikTok/Shorts), `horizontal` (1920×1080) o `square` (1080×1080) |
| `styles` | estils de `brand/mg.ts` → `STYLES`: `kinetic`, `glass`, `editorial`, `pop`, `unimatx`, `cdd`. Es fa un vídeo per estil amb la mateixa veu |
| `voice` | veu d'ElevenLabs (`id`, `speed`); `null` = sense veu, al ritme de lectura i amb un so a cada pantalla |
| `pronounce` | com s'han de dir algunes paraules (només canvia el que es diu, no el que es veu) |
| `logo` | imatge per a la targeta final |

A cada pantalla, `*així*` marca la paraula clau (color d'accent, cursiva amb retall de paper, bloc de color, segons
l'estil). Si la paraula clau és un número, roda fins al seu valor (`"from": 40` perquè comenci a 40;
`"count": false` perquè no rodi). Altres claus: `say` (què diu la veu), `label` (etiqueta petita a sobre),
`items` (llista amb marques), `bar` (barra que s'omple), `image` (captura **real**; `focus` hi fa un apropament
lent; `reframe` la fa entrar a pantalla sencera i encongir-se), `punch` (punch-in a la paraula clau),
`sub` i `end` (targeta final).

## Què fa, pas a pas
1. **Guió** (`scripts/fabrica/guio.py`): una frase per pantalla; paraules, signes, números i llistes.
2. **Veu** (`scripts/fabrica/so.py`): una crida a ElevenLabs per pantalla, amb el temps de cada caràcter. Es desa a
   `projectes/<nom>/el/` i no es torna a pagar si el text no canvia. Totes les frases a la mateixa sonoritat.
3. **Línia de temps** (`guio.py`): cada paraula surt al fotograma en què es diu (alineada amb el que es veu encara
   que `say` sigui diferent); cada frase es queda quieta sencera almenys 0,7 s; una llista dona temps a cada marca, un
   número a rodar i una barra a omplir-se. Sense veu, els talls cauen a temps de la música (120 ppm).
4. **So** (`so.py`, `musica.py`): un llit sintetitzat (`drive`, `soft` o `paper` segons l'estil) que entra amb la
   segona pantalla i fa un cop a la targeta final; els efectes de la regla de la guia; la música s'abaixa sota la veu
   fins que la veu queda 12 LU per sobre; màster a −14 LUFS amb limitador.
5. **Render**: `remotion/fabrica.json` → composició `Fabrica` (`src/fabrica/Fabrica.tsx`), mides de text calculades
   amb les lletres carregades (`src/fabrica/layout.ts`): la més gran que hi cap, línies equilibrades; en Kinetic Type,
   cada línia tan ampla com la zona segura.
6. **QA** (`scripts/fabrica/qa.py`): un segon render petit amb `{"qa": true}` pinta en magenta tot el que s'ha de
   llegir i es comprova que, quan cada pantalla està quieta, cap píxel surt de la zona segura; full de Reels amb
   `scripts/zona_segura.py`; sonoritat i pic real; veu sobre el llit; trams negres de més de mig segon; i la veu
   transcrita amb faster-whisper contra el guió.

## Retocar un punt
Canvia només aquella pantalla al brief i torna a passar la fàbrica: la veu de les altres pantalles ja és desada.
Si una paraula no s'entén a l'informe de la veu, posa-li `pronounce` o `say`. Per provar un estil nou sense
gastar res: `--sense-veu` o `--estils <un>`.

## Un estil nou
Una entrada a `STYLES` de `brand/mg.ts` (colors, lletres de `src/mg/fonts.ts`, moviment, sons, música) amb un dels
quatre `layout`. Comprova'l amb el catàleg: `MGMoviments` amb `--props='{"style":"<nom>"}'`.
