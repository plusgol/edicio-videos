# Formats de vídeo (referències de l'usuari, octubre de 2026)

Fonts, que es guarden a `referencies/` i no es versionen:
- **YouTube:** «Cómo edito mis videos usando Claude Code (totalmente automatizado)», 27:34, transcrit a `referencies/yt_lines.txt`. Un creador explica com edita amb Claude Code: una *skill* per a cada tipus de vídeo, revisió prèvia i render final.
- **Instagram:** reel de 22 s, sense veu, que ensenya els seus formats com a ordres de Claude.
- **Bot de trading** (`projectes/bot-trading/referencia/`): canal *tef*, «Construí un bot de trading… con IA», 9:54.

L'usuari els vol **copiar més o menys i barrejar-los amb l'estil actual** (`docs/ESTIL_ALEX.md`).

## 1. Catàleg de formats

| Format (nom a la referència) | Com és | Sortida | Què tenim | Què falta |
|---|---|---|---|---|
| **depth-ui-reel** | Interfícies (YouTube, xat, webs) **darrere del cap** i subtítols a l'altura del pit | Vertical 9:16 | Persona retallada (`retalla_persona.py`) i textos «darrere» (`GoldWord`) | Plantilla vertical amb panells d'UI i subtítols al pit |
| **ranking-format** (tier list) | Títol a dalt («BEST PLATFORMS TO SIGN CLIENTS»), taula S-A-B-C-D-E-F i logos que van caient a cada nivell quan en parla; ell a sota | Vertical i horitzontal | Logos (`@lobehub/icons`) i fitxes 3D (`PixelLogo`) | Component `TierList` |
| **personal-short-form-reels** | Pantalla partida: **B-roll a dalt**, cara a baix i subtítols a la unió; etiquetes de preu sobre objectes | Vertical | Layout `SPLIT` (guia), subtítols | Biblioteca de B-roll pròpia i etiquetes |
| **business-short-form-reels** | Ganxo en dues línies a dalt amb fons blanc («Make your videos / too sticky to skip»), targetes de reels flotant, fons de punts o partícules | Vertical | Ganxo i animacions d'entrada | Targetes flotants i fons de punts |
| **coaching-call-clips** | Una trucada llarga (OBS) es talla en clips amb subtítols | Vertical o horitzontal | Transcripció i talls | Selecció automàtica dels millors moments |
| **youtube-clips** | Els millors moments d'un vídeo llarg | Vertical | El mateix | El mateix |
| **educational-youtube-editor** | Cap parlant llarg, ben tallat | 16:9 | **És el nostre estil actual** | — |
| **Pantalla partida amb document + animacions** | Ell a la dreta i el document o la pantalla a l'esquerra quan mira la pantalla; a pantalla completa amb animacions quan mira a càmera | 16:9 | `CameraSegment` i gràfics | Layout partit, i triar el pla segons cap a on mira |
| **fitted stacked captions** | Subtítols en bloc: cada línia té la mida justa perquè ompli l'amplada | Vertical | `fitText` (miniatures) | Component de subtítols en bloc |
| **Abans/després i xifres** | Panells «Same clip. *Before* and after.», targetes de xifres (4:44 → 1:32 · 15 · 1) i passos («Install the *Claude* desktop app»). Fons fosc amb degradat taronja, serif cursiva per a la paraula clau i la càmera en bombolla a la dreta | 16:9 | `StageStat`, `SectionNumeral` | Bombolla de càmera i targetes de passos |
| **Estil *tef*** (bot de trading) | Gravacions de pantalla en **finestra flotant** sobre un fons (el de Windows XP), zooms a les xifres, targetes de logo a pantalla completa sobre paper arrugat, mems. Ritme: un canvi cada ~1,4 s; quasi sense càmera | 16:9 | Logos i zooms | Finestra de pantalla flotant, targeta de logo sobre paper |

## 2. Idees del flux de treball de la referència que ja fem o hem d'adoptar
- **Una skill per a cada tipus de vídeo:** cada format ha de tenir instruccions, scripts, estil i un exemple acabat, i s'ha de millorar a cada vídeo. A nosaltres ens toca fer-ne una per format a `.claude/skills/`.
- **Revisió abans del render:** ell té un visor amb línia de temps i notes amb el temps exacte (tecla N). Nosaltres ja tenim l'editor de vista prèvia; li falten les **notes amb el temps exacte**.
- **Previsualització en baixa qualitat i render final només quan està aprovat:** ja ho fem.
- **Talls ajustats sense menjar-se paraules:** fa servir ElevenLabs. Nosaltres fem servir Parakeet en local i comprovem els talls tornant a transcriure el màster (`SKILL.md`, pas 11).
- **El B-roll ha d'acabar alineat amb un tall de càmera**, perquè no es vegi mig segon de cara entre dos talls.
- **Zoom lent del 6 %** quan és a pantalla completa, i **imatges reals** (proves, documents i interfícies que semblin reals), mai inventades.
- **Estil propi:** agafar elements de diverses persones, no copiar-ne només una.

## 3. Decisió de l'usuari
- **Els formats del catàleg** (tier list, depth-ui, reels personals i de negoci, clips) són per al **contingut curt** (vertical). Es construiran com a skills quan toqui fer reels.
- **El vídeo del bot de trading** (16:9, llarg) **no** porta tier list ni aquests formats. Barreja el nostre estil (`docs/ESTIL_ALEX.md`: cara, ganxo, seccions, logos i lletra a mà) amb el de *tef*:
  - gravacions d'OBS en finestra flotant amb zoom a les xifres;
  - targetes de logo per a cada eina;
  - ritme més ràpid a les parts de pantalla.
