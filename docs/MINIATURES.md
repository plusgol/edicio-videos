# Miniatures i títols: el format «Dame X minutos y…»

Recerca de l'octubre de 2026 per al vídeo `projectes/en-4-minutos`. Es basa en cerques web: des d'aquest entorn no es poden obrir youtube.com ni les miniatures de i.ytimg.com, així que **cap miniatura de referència s'ha vist directament**. El que surt marcat com a *inferència* no està verificat.

## 1. El format
- **Anglès:** «Give me N minutes and I'll make you dangerously [confident / smart / consistent]», «… and I'll fix your life», «… I'll give you 10,000 hours of [Claude] knowledge», «… I'll teach you 80% of X».
- **Castellà:** «Dame N minutos y te [enseño / explicaré / ahorro / devuelvo / doy / voy a volver peligrosamente…]». També es veu el format exacte en segons: «Dame 1 min y 56 seg y te cambiaré la vida».
- **Per què funciona, segons les anàlisis citades:**
  - demana permís («dame») en lloc d'exigir atenció;
  - és una inversió petita a canvi d'un resultat gran;
  - un número poc rodó (24, 17) atura el desplaçament.
- **Els minuts del títol coincideixen amb la durada real** en els casos comprovats (8 min → 8:14).
  - YouTube mostra la durada sobre la miniatura, i una promesa inflada es veu a l'instant.
  - Un títol enganyós fa que la gent abandoni el vídeo, i això penalitza.
  - **Regla de la casa:** els minuts del títol han de ser ≥ la durada real, arrodonits cap amunt, i res més.
- **Al nínxol d'IA ja hi ha casos:** Iman Gadzhi («Give Me 26 minutes, I'll Give You 10,000 hours of Claude Knowledge»), «Give Me 20 Minutes. I'll Teach You 80% of Claude Cowork» i «Dame 14 Minutos y Te Doy 1000 Horas De Conocimiento Sobre IA».
- **Exemples amb dades:**
  - Leila Hormozi, «Give me 15 Minutes and I'll Make you Dangerously Confident»: ~7,4 M de visualitzacions;
  - theMITmonk, «Give Me 18 Minutes and I'll Make you Dangerously Smart (with AI)»: ~2 M;
  - «Give me 24 Minutes and I'll Teach You How to Make $1M»: 48 vegades la mitjana del canal en 12 dies.

## 2. Miniatures: el que diuen les dades
- **vidIQ** (500 vídeos que van superar la mitjana del canal):
  - hi ha cara en el 69% de les miniatures, i en el 80% de les 50 millors;
  - el 72% porten text, amb una mediana de 5 paraules; no posar-ne gens és l'opció més freqüent per si sola (28%);
  - només el 5% fan servir expressions exagerades;
  - el contrast alt és el mínim que s'espera, no el que marca la diferència.
- **1of10** (300.000 vídeos virals):
  - de mitjana, posar cara no canvia el rendiment, i **al nínxol de negocis va pitjor amb cara**;
  - els continguts educatius i de finances necessiten text;
  - el públic de tecnologia i finances rebutja les cares exagerades;
  - la paleta que creix el 2026 és fons quasi negre, un sol color d'accent i text blanc.
- **Estudi d'11.223 miniatures:** expressió neutra en el 35% de les cares, feliç en el 32% i sorpresa en l'11%. Contacte visual en el 49%.
- *Inferència* sobre aquest gènere: primer pla o pla mitjà, una sola persona, mirada seriosa a càmera, fons llis fosc o desenfocat, i 0–4 paraules (sovint el número, «15 MIN»).

## 3. Direcció triada per l'usuari (octubre de 2026)
- **Rebutjades:** les primeres variants (or sobre negre, logos sobre la foto i lletra a mà sobre gris clar). Massa clares i «vistes».
- **Referències que li agraden:**
  - **«It's So F*cking Simple.»:** persona a l'esquerra en una habitació real amb llum fosca, i a la dreta tres línies curtes de text blanc molt gruixut, amb l'última paraula en groc i ombra forta.
  - **Pissarra «CONFIDENCE / Pillar 1 2 3»:** esquema dibuixat a mà al costat de la persona.
- **Missatge:** «en 3 minuts et canvio la vida amb la IA i els negocis».
- **Implementat** a `src/miniatura/Miniatura.tsx`:
  - `cine`: la mida del text s'ajusta sola perquè cap línia es parteixi;
  - `pizarra`: retolador blanc i groc sobre la paret fosca, amb un rellotge i el text dels minuts, un ninot amb raigs, un requadre amb el resultat i les eines com a pilars.

- **Aprovat al final (`centro`):** persona **al centre**, amb una pose com la de les referències (mans juntes sota la barbeta) i una foto de nit amb llum càlida. A l'esquerra, **la durada exacta del vídeo** («2:45») en groc; a la dreta, el resultat («VIDA NUEVA») en blanc; una fletxa a mà per sobre del cap les uneix.
  - **El temps hi va sí o sí, amb els segons.** Ha de coincidir amb l'etiqueta de durada de YouTube: si cal, retalla el final del vídeo perquè no arrodoneixi al segon de més.
  - **Títol curt** (p. ex. «Dame 3 minutos: IA y negocios»), que digui IA **i** negocis. La promesa emocional va a la miniatura, no es repeteix al títol.

## 4. Regles per a les nostres miniatures
1. **Mida:** 1280×720, JPG de menys de 2 MB (ho fa `scripts/miniatures.sh`).
2. **Text:** 2–5 paraules. Una peça gran (xifra o paraula en or) i, com a molt, una frase curta a mà.
3. **Expressió i llum:** cara seriosa o neutra, sense ganyotes, que és el que funciona en IA i negocis. Llum fosca i cinematogràfica, amb el focus a la cara.
4. **Cantonada de baix a la dreta lliure:** YouTube hi posa la durada.
5. **Llegibilitat:** s'ha de poder llegir a 160×90. Mira-ho a `out/miniatures_petites.png`.
6. **Logos:** només els de les eines de què parla el vídeo. Res d'inventar resultats, xifres ni captures.
7. **Prova:** 2–3 variants amb **Test & Compare** a YouTube Studio (ordinador). Guanya la que fa més temps de visualització, no la que té més clics. La prova dura com a màxim dues setmanes.

## 5. Com es fan
1. Copia la foto de l'usuari a `projectes/<nom>/input/` (no es toca mai).
2. Retalla-la i treu-ne també el fons sense la persona: `RVM_MODEL=... python3 -I scripts/retalla_foto.py input/<foto>.jpg work/<foto>.persona.png work/<foto>.fons.jpg`.
3. Troba la cara amb YuNet (centre x, alçada dels ulls i alçada de la cara) i escriu `projectes/<nom>/miniatures.json`:
   - la foto, el retall, la mida i la cara;
   - les variants: `cine` amb `lines` (`*paraula*` en groc) o `pizarra` amb `board` (`clock`, `box`, `pillars`), i un `reason` per a cada una.
4. Executa `scripts/miniatures.sh projectes/<nom>`. Al núvol cal afegir `--ignore-certificate-errors --browser-executable=...`.
5. Els valors de disseny són a `brand/estil.ts` → `MINIATURA`, i el component a `src/miniatura/Miniatura.tsx`.

## Fonts
- https://glasp.co/youtube/7e6RSGdvHD8 · https://glasp.co/youtube/A8_nNYLTXEQ
- https://abhinavstellermedia.substack.com/p/give-me-24-minutes-and-ill-teach · https://humbleandbrag.com/blog/best-youtube-titles
- https://sozai.app/transcript/26-minutes-10000-hours-claude-knowledge/
- https://vidiq.com/research/youtube-thumbnail-study/ · https://www.netinfluencer.com/?p=53558
- https://www.searchenginejournal.com/do-faces-help-youtube-thumbnails-heres-what-the-data-says/563944/
- https://1of10.com/blog/youtube-thumbnail-trends-2026/ · https://1of10.com/blog/youtube-thumbnail-design/
- https://support.google.com/youtube/answer/72431 · https://support.google.com/youtube/answer/12340300
