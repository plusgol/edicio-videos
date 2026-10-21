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
