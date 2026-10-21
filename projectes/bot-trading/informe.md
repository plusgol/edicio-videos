# Informe — «Construí un bot de trading con IA»

## Material
- **Cara (iPhone, HDR HLG 1080p60):**
  - IMG_5866: el prompt.
  - IMG_5867: el truc, el fondeig, el backtesting i el límit de Claude.
  - IMG_5883: 24 hores després.
  - IMG_5885: selfie camí de la uni.
  - **No es fa servir** IMG_5863: és un primer intent de l'inici, superat per la 5866.
  - **La veu sempre és la de l'iPhone.** OBS només grava la pantalla.
- **Pantalla (OBS, AV1 2880×1620):**
  - OBS1 (10:25): Claude i la web d'Ibero Funding.
  - OBS2 (0:44): «hazlo todo».
  - OBS3 (3:13): el bot i el panell.
- **Sincronització per contingut:**
  - OBS1 = 5866 + 93 s i 5867 + 344 s.
  - OBS3 = 5883 − 9 s.
  - Comprovada en diversos punts: el selector de models, «Preguntas antes de la fase 2», la taula de plans, la calculadora i el panell «Uso».

## Estil
Estil Alex (`docs/ESTIL_ALEX.md`) barrejat amb el de *tef* (`docs/FORMATS.md`):
- cara a càmera per a les idees i les opinions;
- seccions I–V: El prompt, El truco, Cuentas de fondeo, Backtesting, 24 horas después;
- lletra a mà i xifres en or;
- gravacions de pantalla reals en finestra flotant amb zoom a la zona que s'esmenta (`ScreenWindow`);
- targetes d'eina a pantalla completa (`LogoCard`) per a Claude i Claude Code.

Sense tier list ni formats de contingut curt (decisió de l'usuari).

## Versió 2 (revisió de l'usuari: «la veu és robòtica», «intro com tef», «no ensenyar resultats»)
- **Veu:** els talls eren massa agressius per a una manera de parlar pausada (pauses retallades a 160 ms, i paraula per paraula mentre tecleja). Ara les pauses de menys de 450 ms no es toquen, i les llargues deixen 170 ms després de parlar i 130 ms abans (unes 300 ms). Els trams on tecleja tenen un llindar més suau.
- **Intro estil tef:** cerques reals de YouTube («ai trading bot», «claude trading bot», «bot de trading con ia»), capturades des d'aquí el 20/10/2026 amb `scripts/captura_youtube.py`. Plans de ~1,5 s amb zoom a les miniatures i una reacció 🤨, mentre diu «no tengo mucha idea de esto, me fío completamente de la IA». Després, el títol.
- **Resultats fora:**
  - no surten «casi 50 euros» ni «50 dólares», ni el panell amb xifres;
  - el panell només surt al final, difuminat, amb «Resultados en la parte 2», mentre diu «es que de verdad funciona».

## Versió 3 («se'm talla», «mai emojis», intro amb veu en off com tef, 8–9 min)
- **So que s'entretalla a l'editor:** el so anava dins de cada vídeo; quan el vídeo es quedava enrere carregant, el reproductor el tornava a situar i el so saltava. Ara l'editor reprodueix el so de fitxers només d'àudio i precarrega les gravacions de pantalla.
- **Sense emojis** (regla fixa, a `SKILL.md` i `ESTIL_ALEX.md`).
- **Intro amb veu en off:** traducció literal dels primers 32 s de tef (`guio_veu_en_off.md`), amb les animacions muntades. Font `vo` **provisional i muda** fins que arribi la gravació.
- **Durada:** blocs extra de veu en off sobre la pantalla, amb text tret del que es veu a les gravacions.

## Versió 4 («com funciona el bot», vídeo sencer maquetat, vista prèvia fluida)
- **VI · Así funciona:** el panell real del bot amb requadres i rètols («En marcha · riesgo OK», els quatre mercats, «Media rápida / lenta», «Stop-loss», «Pierde como máximo un 0,5 %», «Pérdida diaria máx.: 3 %», «Kill switch: −8 %», registre). Les xifres de guanys i pèrdues van tapades (`masks`).
- **Blocs de veu en off A–D** muntats amb captures reals aturades i rètols (l'avís de Claude, les hipòtesis, Claude Code treballant, les dades).
- **Durada:** 9:01, amb els buits de veu en off encara muts.
- **Vista prèvia:** vídeo renderitzat a 720p i servit en trossos de 10 s (HLS): es reprodueix d'una tirada, sense dependre de l'editor.

## Versió 6 (revisió: «pantalla comentada», més dinàmic i educatiu, resultats visibles)
- **Pantalla comentada (estil Adrián Sáez):** mentre parla de la pantalla, la gravació és el pla principal i la seva cara va en una finestreta a la dreta (`pip`). Ja no hi ha salts bruscos cara ↔ pantalla.
- **Intro:** només la columna de vídeos de YouTube, fent scroll (×1,5), sense barra lateral ni capçalera.
- **Prompt:** fora els 20 s de dictat; el prompt es veu accelerat ×4 amb el bloc de veu en off P.
- **Explicacions animades:** el pla de Claude (5 passos), les 3 estratègies amb gràfics d'exemple, les plataformes (Alpaca amb el logo del seu web; Bybit amb el nom), què fa Claude Code, el compte de fondeig (28 $ → 5.000 $ → +8 % → −6 % → 75 %, xifres de la web d'Ibero) i el backtesting.
- **Resultats visibles:** el panell sense tapar i, al final, +46,54 $ en ~22 h (diners ficticis).
- **So de la selfie del carrer:** filtre propi (passaalt a 140 Hz i reducció de soroll adaptativa). **Retirat a la v7:** el reconeixement de veu entenia pitjor la veu filtrada.

## Versió 7 (revisió: «errors amb els talls», «bon storytelling, no repeteixis», «la cara mal retallada»; kit d'Alex)
Aplica les regles del kit d'edició d'Alex DiLorenzo (resum a `docs/KIT_ALEX.md`).

- **Talls de veu:**
  - només s'escurcen les pauses de més de 0,65 s (abans, 0,45 s): les respiracions a mitja frase es queden i hi ha molts menys talls;
  - fosa de 15 ms a cada empalmament (abans, una fosa a zero que deixava un forat de so);
  - fora la reducció de soroll i el compressor, que feien la veu metàl·lica; ara la cadena és passaalt, guany fix i limitador;
  - el nivell de cada presa es mesura només sobre el que es queda.
- **Talls revisats amb reconeixement de veu:**
  - «no hace falta» ja no es menja el «falta»;
  - els trams seguits de la mateixa presa s'enganxen sense micro-salts;
  - fora dues ensopegades: «en versión, en formato o en esfuerzo, es un» (queda «el modo Opus 5.5 en esfuerzo medio») i «un altabaño de» (queda «con una cuenta de 5.000 dólares»).
- **Zoom de càmera als talls:** ×1,15 / ×1,25 (abans ×1,12). Per sota de ×1,15 sembla que tremoli.
- **Sense repeticions:**
  - fora «yo no tengo mucha idea, me fío de la IA» just després de la intro, que ja ho diu; el títol surt quan apareix la cara per primer cop;
  - «mandadlo directamente a Claude Code» només surt un cop;
  - «con este prompt tan sencillo nos da el paso a paso» només surt un cop;
  - «iniciar bot» només surt un cop;
  - «este 5 % puede que aumente» fora: ja ho diu just abans;
  - la targeta de Claude, un sol cop; fora el logo repetit de Claude Code;
  - la intro ja no ensenya la consola «Bot iniciado» (surt a la secció V): ara ensenya la capçalera del panell.
- **Bloc F de la veu en off reescrit** (~38 s, abans ~44 s): ja no torna a explicar com s'arrenca ni el creuament de mitjanes.
- **Cara a la finestreta:**
  - es retalla amb el seguiment de la cara: pla obert de cap i espatlles, centrat;
  - finestreta quadrada de 300 px a la cantonada, com fa Alex;
  - la gravació queda a 80 px de la vora.
- **Durada:** 8:20 (els blocs de veu en off encara són muts).

## Decisions
- **Reordenat:** el límit del pla de 20 $ (5867, 214–251 s) va just després del truc, perquè tot el que és «construir amb Claude» quedi junt.
- **Represes retirades:**
  - 5866: 54–59 s i 77–81 s.
  - 5867: 131–145 s i 198–214 s.
- **Frases retirades per honestedat:**
  - «a la mayoría de traders les sale muy rentable» (5867, 89–99 s): no ho podem sostenir.
  - «no lo hemos puesto» (5867, 15–23 s): contradiu el que s'ha vist, perquè sí que havia demanat diners ficticis.
  - «máximo 1060» i «mínimo 9080 o 9980» (5885): no es veuen a cap pantalla i ell mateix dubta.
- **Etiquetes d'honestedat a la pantalla:**
  - «Dinero ficticio · paper trading» sobre el panell (el panell mateix diu «Dinero ficticio · precios reales»);
  - «Simulación de la web, no es una promesa» sobre la calculadora (ho diu la mateixa web);
  - rètol final «Aviso: No es consejo financiero · dinero ficticio».
- **Dades personals fora de quadre:**
  - els inserts del navegador es retallen per sota de les pestanyes, l'adreça i les adreces d'interès (es veia el teu correu);
  - no surt el WhatsApp (OBS1 4:56), ni el selector de finestres (6:00), ni el terminal d'un altre projecte (OBS3 0:45–0:58).
- **El nom de la prop firm** és **Ibero Funding** (iberofunding.com), tal com es veu a la pantalla. L'ASR sentia «IB lo founding» i «Ibrofound».
- **Imatge:** les preses de l'iPhone són HDR (HLG). Es converteixen a SDR amb mapatge de tons; sense, la imatge quedaria pàl·lida.

## Títol
Recomanat: **«Construí un bot de trading con IA (sin tener ni idea)»**.

Alternatives:
- «Construí un bot de trading con Claude sin saber programar»
- «Construí un bot de trading con IA: 24 horas después»
- «Construí un bot de trading con IA y esto es lo que ganó (dinero ficticio)»

**No posaria «10K al mes»** com la referència: el bot ha fet uns +46 $ ficticis en paper trading.

## Pendent
- **Escolta humana pendent:**
  - empalmaments entre preses (h3→p1, t1→t2, f6a→f6, h2→e3);
  - el so de la selfie de 5885, al carrer.
- **Si Ibero Funding és col·laboració o enllaç d'afiliat:** marca «Incluye promoción pagada» a YouTube.
