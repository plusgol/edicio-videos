# Guia d'edició i format — Marca personal IA + negocis
### Basada en l'anàlisi d'Alex DiLorenzo i Kallaway, pensada perquè Claude editi amb Remotion

---

> **Actualització (13/10/2026):** el format principal és **YouTube llarg, horitzontal 16:9**, com els referents, i no el vertical. Les seccions 8–10 (layouts, zones segures i subtítols en 9:16) s'apliquen només als Shorts. Per a YouTube, el llenguatge visual són rètols de secció numerats i insercions gràfiques de snapcn a pantalla completa (vegeu `.claude/skills/editar-video/SKILL.md`), i els subtítols no es cremen al vídeo.

## 0. Què m'has demanat (perquè quedi clar que ho he entès)

1. Vols que **Claude editi els teus vídeos automàticament amb Remotion**.
2. Els vídeos són de **IA i negocis**, en **castellà**, en clau de **marca personal**: ets tu explicant què fas i què fas servir.
3. L'estil que busques és **natural, clar i ben editat, però no saturat**. Res d'efectes de pel·lícula, neons, glitches o xifres gegants cada cinc segons.
4. Has triat **dos referents** (Alex DiLorenzo i Kallaway). En vols agafar el bo i deixar l'excés.
5. El primer vídeo **dura 2:30** i explica ràpid les IA que fas servir. Vols un **títol emocional**, tipus *«en 90 segundos te cambiaré la vida con la IA»*.
6. Necessites una anàlisi **molt extensa** i prou concreta perquè Claude la pugui aplicar sense improvisar.

**Límit honest:** jo no he vist ni escoltat els dos vídeos. El que dic dels creadors surt del teu informe (444 fotogrames revisats, detecció de talls i mesura de sonoritat). **Totes les xifres, mides, temps i regles d'aquesta guia són propostes meves de criteri d'edició, no mesures dels referents.** Quan una cosa surt del teu informe, ho indico.

---

## 1. L'ADN de cada referent, en una taula

| Dimensió | Alex DiLorenzo | Kallaway | **TU (proposta)** |
|---|---|---|---|
| Pla base | Exterior, de nit, llum càlida, pla obert amb tors i braços, micro de mà | Interior estudi, gorra, micro de braç, llum cian vertical | Un **lloc fix teu** amb bona llum, pla mig (cap a cintura), sempre el mateix |
| Rol del pla base | Punt de retorn després de cada recurs | Punt de retorn, sobretot al tancament | **Pla dominant (65–75 % del temps)** |
| Introducció | Molt densa: vídeo antic, miniatures, placa YouTube, Darwin… (~21 canvis visuals al 1r minut) | Gràfica: targetes, icones, «CLAUDE-BASED WORKFLOWS» (~6 canvis al 1r minut) | Densa però **real**: la teva cara + 1–2 proves visuals de projectes teus |
| Desenvolupament | Persona + recursos curts que van i tornen | **Demostració llarga** a pantalla, el mateix sistema evolucionant | **Demos curtes** (5–12 s) de 3 moments: què demano → què surt → per què em serveix |
| Text en pantalla | Dues famílies: petit al costat / ENORME condensat daurat | Targetes amb icona i nom de bloc | **Una família**: subtítols + etiqueta d'eina + (molt de tant en tant) frase clau |
| Gràfics | Esquemes, numeració romana, caselles que s'omplen, xarxa de diners | Diana, matrius, graelles que es van omplint | **Només esquemes simples** quan simplifiquen (p. ex. 3–4 caselles) |
| Color | Fons fosc, càlid, accent daurat | Fons fosc, escenari cian, gràfics violeta | Neutre (blanc/negre/gris) + **1 accent teu** |
| Orientar la mirada | Poc: desenfoca la persona per posar xifres | **Molt**: enfosqueix tot menys la zona que importa | **Adoptar Kallaway**: màscara suau + rectangle de focus |
| Intensitat | Halos, vinyetes, signes € gegants | Resplendor violeta, targetes animades | **Gairebé zero decoració** |
| Sonoritat (mesura de l'informe) | −18,9 LUFS, 7,2 LU de rang (més dinàmic) | −14,3 LUFS, 1,4 LU de rang (molt comprimit) | **−16 LUFS, pic real ≤ −1,5 dBTP**, i veu molt clara |

### En una frase
> **La presència d'Alex + la claredat demostrativa de Kallaway − la decoració dels dos.**

---

## 2. Què és bo de l'informe que tens i què hi falta

### El que està molt bé (i es manté)
- Separa **observació** de **proposta**. Claude no ha d'«inventar» coses dels referents.
- Idea clau: **el pla base com a punt de retorn**. És el que fa que sigui marca personal i no un tutorial.
- Idea clau: **orientar la mirada** amb màscara o ressaltat en lloc de fer transicions.
- Rebutja el karaoke paraula per paraula com a obligació.
- Proposa **justificar cada recurs** amb un camp `reason`.
- Avisa que **horitzontal ≠ vertical**: no n'hi ha prou de retallar.
- Té una arquitectura de mapa de temps entre l'original i la sortida.

### El que hi falta (i aquesta guia cobreix)
1. **El ganxo dels 0–3 primers segons.** L'informe parla de 00:00–00:06, però en vertical els primers 1,5–3 s ho decideixen gairebé tot. Calen regles concretes per al primer fotograma, el text del ganxo i la primera frase.
2. **Tècniques per amagar els jump cuts de manera natural**, sobretot alternar l'escala del pla (1,00 ↔ 1,08). És el truc principal de l'edició «natural però editada».
3. **Mesures concretes**: silencis, marges als talls, fotogrames, mides de text, zones segures, durades de lectura, corbes d'animació.
4. **Layouts verticals amb nom**: Claude ha de triar entre un catàleg tancat, no dissenyar cada pantalla de zero.
5. **Protocol de gravació**: l'edició automàtica només és tan bona com el material. Fa falta una manera de marcar les preses dolentes perquè Claude les pugui retirar sola.
6. **Arquitectura d'àudio**: a Remotion, tallar l'àudio a cada `Sequence` provoca clics. Convé muntar la pista de veu a part (ffmpeg) i fer servir els clips de vídeo en silenci.
7. **Recursos ancorats a paraules**, no a segons. Si retalles un silenci, una etiqueta lligada a la paraula «Claude» es mou sola amb ella.
8. **Una resposta clara sobre el títol de «90 segundos»** en un vídeo de 2:30.
9. **Portada / primer fotograma** per a Reels i TikTok.
10. **Una checklist de control de qualitat** que Claude pugui executar de debò.

---

## 3. Filosofia d'edició: «natural però editat»

### 3.1 Les 7 regles mare
1. **Cada recurs ha de tenir una feina.** Ha de fer una d'aquestes quatre coses: *ajudar a entendre*, *demostrar una afirmació*, *identificar una eina* o *recuperar l'atenció en un canvi d'idea*. Si no en fa cap, fora.
2. **El tall directe és la transició.** No hi ha fosos, cortinetes ni zooms de transició.
3. **Un sol focus per pantalla.** Si cal llegir una captura, s'amaga tota la resta (etiqueta, frase clau…). Els subtítols es queden, però més petits o desplaçats si cal.
4. **Tu ets el vídeo.** Les pantalles són proves. Torna sempre a la cara.
5. **S'eliminen els errors, no la persona.** Fora: preses fallides, «ehhh», arrencades en fals, repeticions. Es queden: somriures, reaccions, una pausa abans d'una frase important.
6. **La velocitat no s'aconsegueix accelerant la veu**, sinó traient el que sobra. Mai `playbackRate` > 1,0 a la veu.
7. **La coherència és la marca.** El mateix pla, la mateixa font, el mateix accent i la mateixa manera de presentar les eines a tots els vídeos.

### 3.2 La prova del «saturat»
Abans d'afegir qualsevol cosa, Claude s'ha de preguntar: **«Si ho trec, l'espectador entén menys?»** Si la resposta és no, no s'afegeix.

### 3.3 Densitat visual orientativa (proposta, no quota)
| Tram | Canvi visual cada… | Què compta com a canvi |
|---|---|---|
| Ganxo (0–3 s) | 1–1,5 s | Canvi d'enquadrament, aparició del text del ganxo, primera prova visual |
| Arrencada (3–15 s) | 2–4 s | Jump cut amb canvi d'escala, prova de projecte, etiqueta |
| Cos | 4–8 s | Demo, etiqueta d'eina, canvi d'escala justificat, esquema |
| Tancament | 6–10 s | Gairebé tot pla base; com a molt, una frase clau |

L'informe deixa veure que Alex és molt més dens al primer minut (~21 canvis) que Kallaway (~6). Tu et quedes **al mig al principi** i **més a prop de Kallaway al cos**.

---

## 4. Ritme i talls: les mesures que ha d'aplicar Claude

### 4.1 Silencis i pauses
| Situació | Acció |
|---|---|
| Silenci < 250 ms dins d'una frase | **No es toca** (és respiració natural) |
| Silenci 250–600 ms entre frases | Es redueix a **~150–250 ms** |
| Silenci > 600 ms | Es talla i es deixen **~120 ms abans** de la paraula següent i **~150 ms després** de l'anterior |
| Pausa expressiva (abans d'una revelació, després d'una pregunta, amb una mirada o un somriure) | **Es conserva entre 400 i 800 ms**. Claude la marca com a `keep: expressive` |
| Respiració sonora just abans de parlar | Es redueix el volum de 6 a 10 dB o s'hi fa un tall net. **No s'eliminen totes** |

> Els llindars d'energia (dB) s'han de **calibrar per a cada gravació** a partir del soroll de fons real. Un valor fix no serveix per a tot.

### 4.2 Preses repetides i errors
- **Es fa servir sempre l'última presa completa** d'una frase, llevat que sigui pitjor de manera evident.
- **No s'enganxen dues preses dins d'una mateixa frase.** El canvi d'entonació es nota molt.
- Claude detecta les repeticions comparant el text transcrit (frases gairebé iguals i seguides) i les marques verbals del protocol de gravació (secció 13).

### 4.3 Amagar els jump cuts amb canvi d'escala (el truc principal)
Quan talles dins del mateix pla, la cara «salta». Hi ha tres maneres naturals de resoldre-ho:

1. **Alternar l'escala** a cada jump cut: `1,00 → 1,08 → 1,00 → 1,15 (només per èmfasi) → 1,00`.
   - Regla: **dos segments seguits del mateix pla no poden tenir la mateixa escala**, llevat que entre tots dos hi hagi un recurs a pantalla completa.
   - Escales permeses: **1,00 (obert)**, **1,08 (mig)** i **1,15–1,20 (èmfasi, màxim 3–4 per vídeo)**.
   - El punt d'ancoratge de l'escala ha de ser **entre els ulls**, perquè la cara no se'n vagi de lloc.
2. **Tapar el tall amb un recurs**: el tall cau just quan entra una demo o una etiqueta.
3. **Tallar quan hi ha moviment**: si fas un gest o gires el cap, el tall passa desapercebut.

> **Prohibit:** zooms animats lents i continus («Ken Burns») sobre la cara cada X segons. Els canvis d'escala són **tallats**, no animats. Excepció: un *push-in* molt lent (1,00 → 1,04 en 3–4 s) només en un moment emocional, com a màxim un cop per vídeo.

**Resolució necessària:** per fer un 1,20 sense perdre nitidesa en 1080×1920, el millor és gravar en **4K vertical (2160×3840)**. Si graves en 1080p, no passis de 1,10.

### 4.4 J-cuts i L-cuts (el ritme «professional» invisible)
- **J-cut** (la veu entra abans que la imatge): la demo apareix **4–8 fotogrames (a 30 fps) després** que comenci la frase que la presenta. Així sembla que la imatge «respon» al que dius.
- **L-cut** (la imatge es queda després de la frase): la demo es manté **8–15 fotogrames** quan ja has acabat de parlar d'ella i ja tornes a la cara. Així la pantalla té temps de ser llegida.
- No s'ha d'aplicar al **ganxo**: allà el canvi és sec.

### 4.5 Durada dels segments
- Un pla base sense cap canvi **no hauria de passar de 8–10 s** al cos del vídeo. Si dura més, Claude proposa un canvi d'escala justificat (canvi d'idea o èmfasi).
- **Cap segment pot durar menys de 0,5 s** (15 fotogrames), excepte en un muntatge ràpid de proves al ganxo.

---

## 5. Estructura narrativa

### 5.1 Plantilla universal (vídeo vertical d'1–3 min)
| Bloc | Funció | Durada (vídeo 2:30) | Durada (versió 90 s) |
|---|---|---|---|
| **Ganxo** | Aturar el dit: promesa + emoció + prova | 0–3 s | 0–3 s |
| **Context / credibilitat** | Per què m'has d'escoltar: què construeixo | 3–12 s | 3–8 s |
| **Mapa** | «Te enseño N herramientas: para X, Y y Z» | 12–18 s | 8–11 s |
| **Cos (N blocs)** | Per a cada eina: tasca → eina → exemple → criteri personal | 18 s – 2:05 | 11–75 s |
| **Idea final** | Com esculls: «primero el problema, luego la herramienta» | 2:05–2:20 | 75–84 s |
| **Tancament / CTA** | Una sola acció | 2:20–2:30 | 84–90 s |

### 5.2 Anatomia d'un bloc d'eina (el teu «mòdul» repetible)
Cada eina segueix sempre la **mateixa forma**. Aquesta repetició és la marca, l'equivalent als separadors de Kallaway però compacte:

1. **Problema (cara, 2–4 s):** *«Cuando tengo que escribir una propuesta para un cliente…»*
2. **Eina + etiqueta (cara + etiqueta, 1–2 s):** apareix `Claude · Pensar y redactar conmigo`.
3. **Prova (demo, 4–10 s):** què li demanes → què surt → ressaltat de la part que importa.
4. **Criteri personal (cara, 2–5 s):** *«Lo uso porque…»* o *«Lo que más me ahorra es…»*. **Aquí és on hi ha la marca personal**, no a la demo.

> Si una eina no té demo gravada, el bloc es fa amb la cara + etiqueta i **es marca la demo com a pendent**. Claude no s'inventa una captura ni posa B-roll genèric de robots.

### 5.3 Repartiment orientatiu
- 65–75 % de temps amb la cara (completa o en layout dividit).
- 25–35 % demos o gràfics.
- 3–5 demos curtes, 4–6 etiquetes i 3–5 canvis d'escala d'èmfasi en una peça de 2:30. **Són límits orientatius, no quotes.**

---

## 6. El ganxo (0–3 s): regles concretes

### 6.1 Primer fotograma
- **No comença en negre ni amb fos.** El fotograma 0 ja és la teva cara parlant, o la prova visual.
- **No hi ha intro, logo, «hola, ¿qué tal?» ni «en este vídeo…».**
- El **text del ganxo és visible des del fotograma 0** (molta gent mira sense so). Va a la part superior, de 4 a 8 paraules, i es queda **2,5–3,5 s**.
- La primera paraula que dius ha d'arribar **en menys de 0,3 s**. Si a la gravació hi ha silenci abans, es retalla.

### 6.2 Tipus de ganxo que encaixen amb el teu estil (sentimental, creïble)
| Tipus | Exemple parlat |
|---|---|
| Penediment / «ojalá» | *«Ojalá alguien me hubiera enseñado esto hace un año.»* |
| Confessió | *«Te voy a enseñar las IAs que uso de verdad. No las que están de moda.»* |
| Abans / després | *«Antes tardaba una semana en montar una web. Ahora, una tarde.»* |
| Promesa delimitada | *«Dame dos minutos y te enseño cómo trabajo con IA.»* |
| Identificació | *«Si sientes que vas tarde con la IA, este vídeo es para ti.»* |
| Contrari | *«No necesitas 50 IAs. Yo uso cinco.»* |

### 6.3 Ganxo visual
En els primers 3 s, Claude pot inserir **una prova real de 0,8–1,5 s** (un projecte teu, una web que has fet, un resultat) entre dues frases de la cara. És l'equivalent net del «vídeo antic + miniatures» d'Alex, però amb coses teves i sense decoració.

---

## 7. Títol: la resposta sobre «en 90 segundos te cambiaré la vida»

### 7.1 El problema
- Si el vídeo dura **2:30** i el títol diu **90 segons**, la gent ho nota. Pot ser que no ho comenti, però perd confiança, i amb la marca personal la confiança és l'actiu principal.
- **«Te cambiaré la vida»** és una promesa que un vídeo de 2 minuts no pot complir. Sona a venedor de cursos. El teu informe ho diu bé: *l'emoció pot venir de coses concretes (hores recuperades, projectes que abans no gosaves fer)*.

### 7.2 Dues sortides vàlides
**A) Fer de debò una versió de 90 s** (la meva recomanació per a Reels i TikTok). Treus 1–2 eines i deixes les 3 millors. Així el títol és veritat i el vídeo és més fort. La versió de 2:30 pot anar a YouTube o es pot partir en dues peces.

**B) Mantenir els 2:30** i canviar el títol perquè sigui emocional sense mentir.

### 7.3 Títols proposats (castellà)

**Emocionals i de marca personal**
- *Ojalá alguien me hubiera enseñado estas IAs antes*
- *Las IAs que me devolvieron horas de mi vida*
- *Esto es lo que me habría gustado saber de la IA hace un año*
- *La IA no me quitó el trabajo. Me quitó lo que odiaba de él*
- *Así trabajo con IA cuando nadie me ve*
- *Las herramientas que me hacen sentir que trabajo con un equipo (y estoy solo)*

**Promesa delimitada amb durada (només si la durada quadra)**
- *Dame 90 segundos y te enseño las IAs que uso de verdad* (← versió 90 s)
- *En 90 segundos: las IAs que cambiaron cómo trabajo* (← versió 90 s)
- *Dame 2 minutos y te enseño mi equipo de IAs* (← versió 2:30)

**Concrets i de negoci**
- *Las 5 IAs con las que monto mis proyectos*
- *Mi stack de IA para emprender, sin humo*
- *No necesitas 50 IAs. Yo uso estas 5*
- *Si empezara hoy con la IA, usaría solo estas*

**Versions «prudents» de la teva idea original**
- ~~En 90 segundos te cambiaré la vida con la IA~~ → *En 90 segundos te enseño las IAs que cambiaron mi forma de trabajar*
- → *90 segundos que me habría encantado ver hace un año*

> Quan tinguis el número real d'eines del vídeo, substitueix el «5». **El número del títol ha de coincidir amb el vídeo.**

### 7.4 Títol ≠ text del ganxo ≠ primera frase
Són tres peces diferents i s'han de reforçar entre elles, no repetir-se:
- **Títol** (YouTube/descripció): *Las IAs que me devolvieron horas de mi vida*
- **Text en pantalla (0–3 s)**: *Las IAs que uso de verdad 👇* (sense emoji si no encaixa amb la marca)
- **Primera frase parlada**: *«Ojalá alguien me hubiera enseñado esto hace un año.»*

---

## 8. Format vertical 1080×1920: layouts amb nom

Claude **només** pot fer servir aquests layouts. Així els vídeos són coherents i les decisions són senzilles.

### L1 · `CARA`
- Ets tu a pantalla completa (escala 1,00 / 1,08 / 1,15).
- Els ulls, aproximadament a **1/3 de l'altura** (y ≈ 600–700 px).
- Subtítols a la zona inferior segura.

### L2 · `CARA_ETIQUETA`
- Com L1, amb una **etiqueta d'eina** a la part superior (y ≈ 260–420 px) o just per sobre dels subtítols. **Mai sobre la cara.**
- L'etiqueta entra, es queda **2–3,5 s** i surt. No acompanya tot el bloc.

### L3 · `SPLIT` (demo a dalt, cara a baix)
- **Demo**: rectangle superior d'uns **1080 × 1000 px** (o una targeta de 1000 × 900 amb marge de 40 px i cantonades de 24–32 px) sobre fons neutre.
- **Cara**: la part inferior, retallada perquè es vegin ulls i boca.
- **Subtítols** a la línia d'unió entre les dues meitats (y ≈ 1000–1100), amb un suport fosc discret.
- És el layout principal de les demos, perquè **conserva la teva presència**.

### L4 · `DEMO_COMPLETA`
- La demo ocupa tota la pantalla, amb la zona rellevant ampliada perquè es pugui llegir al mòbil.
- Es fa servir quan cal **llegir** de debò (text de resposta d'una IA, un formulari, un resultat).
- Màxim **6–10 s** seguits. Després es torna a L1 o L3.

### L5 · `FOCUS` (variant de L3 o L4)
- La mateixa demo amb una **màscara fosca semitransparent (55–65 % d'opacitat)** i un rectangle clar a la zona important, amb cantonades de 16–24 px i una vora fina d'1–2 px del color d'accent (opcional).
- El rectangle es pot **desplaçar** d'una zona a una altra en 10–14 fotogrames, amb corba suau. És el recurs de Kallaway del gràfic: la pantalla no canvia, canvia on mires.

### L6 · `FRASE_CLAU`
- Fons neutre (o el teu pla molt fosc, al 25–35 % de lluminositat, **sense desenfocar-te**) i una frase de **3–7 paraules** en gran.
- **Màxim 1–2 per vídeo.** Per a la idea central o el tancament.
- És la versió continguda del «5.000 €» gegant d'Alex.

### L7 · `PASSOS` (opcional)
- 3–4 caselles horitzontals o verticals que s'omplen d'una en una (idea → investigació → construcció → revisió). Ve de les caselles amb icones d'Alex.
- Només si el discurs parla literalment d'un procés per etapes.

### Prohibit en vertical
- Una finestra petita d'escriptori sobre la cara (picture-in-picture minúscul).
- Retallar una composició horitzontal pel centre i donar-la per bona.
- Captures senceres de pàgines web amb text de 10 px «perquè es vegi que existeix», si es queden més de 1,5 s.

---

## 9. Zones segures (1080×1920)

Valors inicials de treball. **Les interfícies de les apps canvien**, així que s'han de revisar amb una captura real de cada plataforma.

| Zona | Píxels a evitar per a contingut clau |
|---|---|
| Superior (nom d'usuari, pestanyes) | 0–220 px |
| Inferior (descripció, música, botons) | 1920 − 420 = per sota de **1500 px** |
| Lateral dret (likes, comentaris, compartir) | Els últims **140 px** (x > 940) a la meitat inferior |
| Lateral esquerre | 60 px de marge |

**Àrea segura pràctica per a text:** x 60–940, y 220–1500.
**Subtítols en L1/L2:** centre vertical aproximadament a **y = 1250–1350**.

---

## 10. Subtítols

### 10.1 Especificació
| Propietat | Valor |
|---|---|
| Font | Una sans serif llegible. Proposta: **Inter**, **Plus Jakarta Sans** o **Manrope** (Google Fonts, carregada amb `@remotion/google-fonts`) |
| Pes | 700 (subtítols), 800 (paraula destacada si cal) |
| Mida | **58–64 px** (provar a 60) |
| Interlineat | 1,15–1,2 |
| Línies | **1 per defecte, màxim 2** |
| Caràcters per línia | ≤ 26–30 |
| Paraules per «pàgina» | **3–6, per blocs de sentit** (no tallar «la / IA»; no deixar un article a final de línia) |
| Color | Blanc #FFFFFF |
| Contrast | Ombra suau (`0 2px 12px rgba(0,0,0,.55)`) **o** contorn fosc de 3–4 px (`paint-order: stroke`). En L3, un suport fosc de 60–70 % amb radi de 12–16 px |
| Destacat | **Com a molt una paraula per bloc**, només quan té pes semàntic (una xifra, el nom d'una eina, «gratis», «una tarde»). El color és l'accent. No cal cap animació |
| Animació d'entrada | Cap, o una opacitat de 0→1 en **3 fotogrames**. Res de rebots, escales ni karaoke |
| Majúscules | Tipus frase. No tot en majúscules |
| Puntuació | Fora els punts finals. Es mantenen els interrogants i els signes d'exclamació |

### 10.2 Temps
- Una pàgina de subtítol apareix **al mateix fotograma** que la primera paraula (o 1 fotograma abans) i es queda fins a la paraula següent. Si hi ha un buit de > 400 ms, desapareix.
- Durada mínima d'una pàgina: **~0,7 s**. Si és més curta, s'ajunta amb la següent.
- **Durant el ganxo**, si el text del ganxo i el subtítol diuen el mateix, **s'amaga el subtítol** (no es duplica).

### 10.3 Correcció de noms (glossari)
Claude ha de tenir un glossari i corregir **només** el que realment dius:
```
Claude (no «Clod», «Cloud», «Claud»)
ChatGPT (no «chat GPT», «chat de GPT»)
Gemini · Perplexity · Midjourney · Cursor · Lovable · n8n («n ocho n») · Make · Notion · ElevenLabs · Runway · HeyGen
```
> El glossari **no serveix per inventar mencions**. Si no s'entén quina eina dius, es marca com a dubte.

---

## 11. Etiquetes d'eines (el «separador» compacte)

- **Format:** `[icona/logo petit 44–56 px] Nom · Funció de 3 a 6 paraules`
  - `Claude · Pensar y redactar conmigo`
  - `Lovable · Montar webs en una tarde`
  - `Perplexity · Investigar con fuentes`
- **Estil:** targeta plana, fons blanc o negre al 85–92 %, radi de 16–20 px, padding de 20 × 28 px. Nom en pes 800 i funció en pes 500 al 70 % d'opacitat. **Sense resplendors ni contorns lluminosos.**
- **Entrada:** opacitat 0→1 + desplaçament de **16–24 px** cap amunt, en **6–7 fotogrames (~200–230 ms)**, amb `Easing.out(Easing.cubic)` o un `spring` amb `damping: 200` (sense rebot).
- **Sortida:** opacitat 1→0 en 4–5 fotogrames, sense moviment.
- **Durada en pantalla:** 2–3,5 s.
- **Logos:** només si els tens en local i en bona qualitat. Si no, una inicial dins d'un cercle o res. **No s'han de descarregar logos d'internet automàticament** sense revisar-los.

---

## 12. Demostracions i captures de pantalla

### 12.1 Els tres moments de cada demo
1. **Què li demano**: el prompt o l'acció (1,5–3 s, ampliat perquè es llegeixi).
2. **Què surt**: el resultat (2–5 s).
3. **El que importa**: ressaltat (L5 `FOCUS`) de la part concreta que menciones.

No cal mostrar els clics, les esperes ni les càrregues. Es retallen, i si cal, es fa un tall directe de «demano» a «resultat».

### 12.2 Regles de lectura
- Temps mínim en pantalla per a text que s'ha de llegir: **~0,35 s per paraula visible rellevant + 1 s**, amb un mínim de 2 s.
- **El retall es queda quiet mentre es llegeix.** El moviment de càmera sobre la captura és lent, només per revelar una segona zona, i mai mentre el text és clau.
- Mida mínima del text de la captura un cop ampliat: l'equivalent a **~28–32 px** en el llenç de 1080 d'amplada.
- Desplaçament vertical (scroll) d'una resposta llarga: velocitat constant i lenta, d'uns **150–250 px per segon** de llenç. Millor encara, fes dos talls entre dues zones.

### 12.3 Prova d'existència vs contingut per llegir
- **Prova d'existència** (es veu que tens un projecte, una web o un document): 0,8–1,5 s, i no cal que es llegeixi.
- **Contingut per llegir**: ampliació + temps + focus. Mai les dues coses alhora.

### 12.4 Prohibit
- B-roll genèric de stock: robots, cervells digitals, mans en un teclat, codi Matrix.
- Imatges generades per IA fent veure que són captures reals.
- Desenfocar una captura que l'espectador està intentant llegir.

---

## 13. Protocol de gravació (el que fas tu abans que Claude toqui res)

Perquè l'edició automàtica surti bé, el material ha de ser «llegible» per a una màquina.

### 13.1 Càmera i pla
- **Vertical, 4K (2160×3840) si pots**, o com a mínim 1080×1920. A 30 fps (o 25 si ho prefereixes, però que no canviï).
- **Sempre el mateix lloc, la mateixa llum i la mateixa alçada de càmera.** És la teva «cuina» de marca, com l'exterior nocturn d'Alex o l'estudi cian de Kallaway.
- Pla des de la cintura o el pit fins a una mica per sobre del cap, perquè quedi aire per retallar a 1,08 o 1,15.
- Llum principal suau i lateral (45°), sense contrallum de finestra. La pell, natural.
- Ulls a càmera. Les mirades laterals, quan les fas a propòsit, donen varietat (Alex ho fa).

### 13.2 Àudio
- **Micròfon de solapa o de proximitat** (una mala veu no es pot arreglar a l'edició).
- Habitació sense eco, amb roba, cortines o un sofà al voltant.
- Grava **5 segons de silenci de sala** al principi. Serveixen per calibrar el soroll.

### 13.3 Senyals verbals per a Claude
- Si t'equivoques: **calla 2 segons i torna a començar la frase sencera**. Claude es queda amb l'última presa.
- Si vols marcar una cosa de manera explícita, digues (per exemple) **«corta»** després de l'error. Claude farà servir la paraula com a marca i la retirarà.
- Si una frase és especialment important: «**marca**» al final (Claude la marca com a candidata a frase clau o èmfasi, i retira la paraula).

> Defineix aquestes paraules al fitxer `glossari.json` del projecte, perquè Claude les reconegui.

### 13.4 Gravació de pantalla
- Resolució de pantalla 1920×1080 o superior. **Zoom del navegador al 125–150 %**.
- Amaga la barra d'adreces d'interès, les pestanyes personals i les notificacions. Treu dades sensibles.
- Mateix tema (clar o fosc) a totes les eines del vídeo, si pot ser.
- Cursor gran. Moviments lents i intencionats.
- **Un fitxer per eina**, amb el nom de l'eina: `demo_claude.mp4`, `demo_lovable.mp4`. Així Claude les pot associar al bloc.

---

## 14. Moviment i transicions

| Element | Durada a 30 fps | Corba |
|---|---|---|
| Tall entre plans | 0 (directe) | — |
| Entrada d'etiqueta | 6–7 fotogrames | `Easing.out(Easing.cubic)` / `spring({damping: 200})` |
| Sortida d'etiqueta | 4–5 fotogrames | lineal o `Easing.in(Easing.quad)` |
| Entrada de demo en L3 | 0 (tall) o 5–6 fotogrames d'opacitat + 2 % d'escala | `Easing.out(Easing.cubic)` |
| Desplaçament del rectangle de focus | 10–14 fotogrames | `Easing.inOut(Easing.cubic)` |
| Aparició de la màscara de focus | 6–8 fotogrames | lineal |
| Text del ganxo | Visible al fotograma 0 (sense entrada); sortida en 5 fotogrames | — |
| Push-in emocional (opcional, 1 per vídeo) | 90–120 fotogrames, 1,00 → 1,04 | `Easing.inOut(Easing.sin)` |

**Prohibit per defecte:** rebots, *overshoot*, *whip pans*, *glitch*, flaixos blancs, sacsejades, partícules, *light leaks*, resplendors de neó, transicions 3D, textos que escriuen lletra a lletra (excepte quan es mostra un prompt real que s'escriu, i llavors és la gravació de pantalla).

Totes les animacions han de dependre de `useCurrentFrame()`. **No es pot fer servir CSS `transition`/`animation`, `setTimeout` ni `Math.random()`** sense una llavor fixa, perquè la vista prèvia i el render han de ser idèntics.

---

## 15. Color i identitat visual

### 15.1 Correcció de color
- Primer **igualar** l'exposició i el balanç de blancs entre clips. Després, un aspecte suau.
- La pell ha de quedar natural. Saturació global entre −5 % i 0 %, sense res de verd-taronja de pel·lícula.
- Contrast moderat. Els negres no poden quedar aixafats.
- **Les captures conserven els seus colors.** No s'hi aplica cap «look».

> Remotion no és un gradador de color. La correcció es fa **abans**, amb ffmpeg (`eq`, `colorbalance` o una LUT `.cube` teva) o amb l'app de la càmera. A Remotion, com a molt, un filtre CSS molt lleuger i fix.

### 15.2 Paleta de marca (tria'n una i no la canviïs)
| Token | Valor |
|---|---|
| `ink` (text fosc / suports) | #0E0E10 |
| `paper` (fons clar / targetes) | #F7F7F5 |
| `muted` | #8A8A93 |
| **`accent`** (un sol color) | Opcions: **#FF5A36** (coral càlid, proper), **#3D7BFF** (blau confiança), **#C6F432** (llima, tech fresc) |

- L'accent **només** es fa servir per: la paraula destacada als subtítols, la vora del rectangle de focus i un detall de l'etiqueta. Res més.
- No s'ha de copiar el violeta de Kallaway ni el daurat d'Alex. Són seus.

---

## 16. So

### 16.1 Cadena de veu (proposta)
1. Filtre passa-alts a 70–90 Hz.
2. Reducció de soroll **moderada**, perquè no soni aigualida ni metàl·lica. Si cal triar, millor una mica de soroll que artefactes.
3. De-esser suau (5–8 kHz).
4. Compressió suau (ràtio de 2:1 a 3:1, i 3–6 dB de reducció a les puntes).
5. Normalització final: **−16 LUFS integrats, pic real ≤ −1,5 dBTP** (ffmpeg `loudnorm` en dues passades).

Referència de l'informe: Kallaway està a −14,3 LUFS amb un rang molt reduït, i Alex a −18,9 LUFS amb més dinàmica. −16 queda entre tots dos i és un bon punt de partida per a mòbil.

### 16.2 Empalmaments
- A cada tall de veu, **fos d'entrada i sortida de 8–15 ms** (sense encavalcar els clips, perquè no es desincronitzi la imatge). Això evita els clics.
- **No s'ha de declarar mai que un empalmament «sona natural» si no s'ha escoltat.** Claude ho ha de deixar marcat com a pendent de revisió humana.

### 16.3 Música
- **Opcional.** Per a un vídeo de marca personal molt parlat, sovint és millor **sense música** o amb un coixí molt baix.
- Si n'hi ha: instrumental, sense veu, **entre −20 i −26 dB per sota de la veu** (s'ha d'escoltar, no aplicar-ho com a número fix), i amb **ducking** quan parles.
- Ha de ser música amb llicència per a xarxes.

### 16.4 Efectes de so
- **Gairebé cap.** Com a màxim, un «tic» molt suau quan entra una etiqueta (−24 dB respecte a la veu) o un clic real de ratolí a la demo.
- Res de *whooshes*, *risers*, *bass drops* ni «ding» de notificació.

---

## 17. Marca personal: elements recurrents

Aquestes coses s'han de repetir **a tots els vídeos**, perquè la gent et reconegui sense veure el nom:

1. **El mateix pla base**, amb la mateixa llum i el mateix lloc.
2. **El mateix format d'etiqueta d'eina.**
3. **El mateix color d'accent.**
4. **El mateix mòdul de 4 passos** per presentar eines (problema → eina → prova → criteri).
5. **Una frase de tancament pròpia**, sempre igual o molt semblant. Per exemple: *«Primero el problema, luego la herramienta.»* o *«Construye cosas. Lo demás es ruido.»*
6. **Una manera pròpia d'obrir.** Opcional: una mateixa estructura de ganxo, com el «Ojalá alguien me hubiera…».

---

## 18. Pla concret per al teu vídeo de 2:30 (plantilla)

> No he vist el vídeo ni la transcripció. Els temps són una plantilla que Claude ha d'adaptar a la gravació real.

| Temps | Layout | Contingut | Recursos |
|---|---|---|---|
| 0:00–0:03 | L1 (1,08) | *«Ojalá alguien me hubiera enseñado esto antes»* | Text del ganxo a dalt des del fotograma 0. Subtítol amagat mentre el text del ganxo és visible |
| 0:03–0:05 | Prova (1 s) → L1 (1,00) | Flaix real d'un projecte teu | Tall directe |
| 0:05–0:12 | L1 (1,00 ↔ 1,08) | Qui ets i què construeixes amb IA | 1–2 jump cuts amb canvi d'escala |
| 0:12–0:18 | L1 | «Te enseño las N que uso para X, Y y Z» | Opcional: L7 `PASSOS` amb les N caselles, 2 s |
| 0:18–0:45 | L1 → L2 → L3/L5 → L1 | **Eina 1** (mòdul de 4 passos) | Etiqueta + demo + focus |
| 0:45–1:10 | Igual | **Eina 2** | |
| 1:10–1:35 | Igual | **Eina 3** | |
| 1:35–2:05 | Igual (més curt si cal) | **Eina 4 (i 5)** | Si una eina no té demo, només cara + etiqueta |
| 2:05–2:20 | L1 (1,15) o L6 | Com esculls les eines | Una sola `FRASE_CLAU` com a màxim |
| 2:20–2:30 | L1 (1,00) | CTA concret: *«Prueba una de estas con una tarea que llevas semanas aplazando.»* / *«Sígueme, que el próximo vídeo te enseño un proyecto real de principio a fin.»* | Sense targeta de subscripció animada. Deixar 0,5–1 s de cua amb la teva expressió i **cap fotograma negre al final** |

### Versió de 90 s (si la fas)
- Mateixa estructura, però **3 eines** de ~20 s cadascuna.
- Context de 3–8 s com a màxim.
- Idea final + CTA en ~12 s.
- Uns 230–250 paraules parlades (a un ritme de ~155–165 paraules per minut en castellà).

---

## 19. Arquitectura per a Claude + Remotion

### 19.1 El flux (pipeline)
```
1. INGESTA      → ffprobe: resolució, rotació, fps, pistes d'àudio. No es modifiquen els originals.
2. ÀUDIO        → extreure WAV mono a 16 kHz per transcriure + WAV a 48 kHz per a la mescla
3. TRANSCRIPCIÓ → whisper (whisper.cpp via @remotion/install-whisper-cpp, idioma «es»), amb marques per paraula
4. NETEJA TEXT  → glossari de noms d'eines, detecció de marques verbals («corta», «marca»)
5. PLA (EDL)    → Claude escriu edl.json: segments, escales, layouts, recursos (cadascun amb el seu «reason»)
6. REVISIÓ      → [opcional però recomanat] et mostra l'EDL en text llegible abans de renderitzar
7. VEU          → ffmpeg munta voice.wav a partir de l'EDL (fosos de 8–15 ms, cadena de veu, loudnorm)
8. RENDER       → Remotion llegeix edl.json + voice.wav. Els clips de vídeo van en silenci
9. QA           → fotogrames de prova de cada tipus d'escena i canvi + checklist (secció 21)
10. ENTREGA     → MP4 + edl.json + informe.md (decisions, pendents, dubtes)
```

### 19.2 Per què la veu va a part
A Remotion, cada `<Sequence>` amb vídeo i so talla l'àudio en sec i pot fer **clics** als talls. Si es munta la veu en un sol `voice.wav` amb ffmpeg (fosos de pocs ms i normalització) i es posa en un únic `<Audio>`, el so és net i continu. Els clips de vídeo van en silenci (`muted`) i es col·loquen amb el mateix càlcul de temps.

### 19.3 Recursos ancorats a paraules (clau per a l'automatització)
Els recursos **no es defineixen en segons de sortida**. Es defineixen **lligats a una paraula de la transcripció** (`anchorWordId`). Si Claude canvia un tall, el temps de sortida de cada recurs es torna a calcular sol. Ho fa una sola funció `sourceMsToOutputFrame()` que coneix tots els segments.

### 19.4 Càlcul de temps sense errors acumulats
- Es calculen els **límits** de cada segment en fotogrames (`Math.round(ms * fps / 1000)`) sobre el temps acumulat de sortida.
- La **durada** és sempre la diferència entre dos límits arrodonits. No s'arrodoneixen durades soltes que després se sumen.
- Les paraules mantenen la precisió en mil·lisegons fins que es pinten.

### 19.5 Components de Remotion (catàleg tancat)
```
<Video edl={...}/>                 // composició arrel; duration via calculateMetadata
  <CameraSegment/>                 // OffthreadVideo muted, escala 1.00/1.08/1.15, ancoratge als ulls
  <DemoSegment layout="SPLIT|FULL"/>
  <FocusMask rect={...}/>          // màscara + rectangle animat
  <ToolLabel name="" fn=""/>       // etiqueta d'eina
  <HookText text=""/>              // text del ganxo 0–3 s
  <KeyPhrase text=""/>             // L6
  <Steps items={[...]} active={n}/>// L7
  <Captions pages={...}/>          // @remotion/captions → createTikTokStyleCaptions (estil sobri)
  <Audio src="voice.wav"/>         // pista única
  <Audio src="music.mp3" volume={fn}/> // opcional, amb ducking
```

### 19.6 Peces tècniques de Remotion (cal comprovar-les amb la versió instal·lada)
- `@remotion/captions` → `createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds })` agrupa paraules en pàgines. Per a l'estil sobri, de **1200 a 1800 ms** (amb blocs de 3–6 paraules). El nom «TikTok» no obliga a fer karaoke.
- `@remotion/install-whisper-cpp` → `transcribe()` amb marques per paraula + `toCaptions()`.
- `@remotion/google-fonts/Inter` (o la font escollida) → `loadFont()` amb només els pesos necessaris.
- `@remotion/layout-utils` → `measureText()` / `fitText()` per comprovar desbordaments abans de renderitzar.
- `OffthreadVideo` amb `trimBefore`/`trimAfter` (a versions antigues es diuen `startFrom`/`endAt`), `muted`, `style={{transform: scale(...)}}`.
- `<Sequence from durationInFrames premountFor={30}>` per precarregar els clips.
- `calculateMetadata` per fixar la durada a partir de l'EDL.
- `spring({ frame, fps, config: { damping: 200 } })` per a moviments sense rebot.
- Render: `npx remotion render Video out.mp4 --codec=h264 --crf=18 --audio-bitrate=320k`, a 30 fps i 1080×1920.

### 19.7 Fitxers del projecte
```
/projecte-video/
  /input/            original intocable (cara.mov, demo_*.mp4, silenci.wav)
  /work/             wav, transcripció, edl.json, voice.wav, fotogrames de QA
  /brand/            estil.ts (tokens), glossari.json, logos/, lut.cube
  /src/              components de Remotion
  /out/              mp4 final + informe.md
  .claude/skills/editar-video/SKILL.md
```

---

## 20. Anti-patrons (llista negra per a Claude)

1. ❌ Zoom animat periòdic sobre la cara «perquè han passat X segons».
2. ❌ Subtítols tipus karaoke amb cada paraula rebotant o canviant de color.
3. ❌ Xifres gegants, signes €/$ voladors o pluges de diners.
4. ❌ Desenfocar-te a tu per posar un text.
5. ❌ Resplendors, neons, *glitch*, flaixos, partícules o *light leaks*.
6. ❌ B-roll genèric de stock o generat per IA fent veure que és real.
7. ❌ Separadors de bloc a pantalla completa de 2–3 s per a cada eina (en un vídeo de 2:30).
8. ❌ Duplicar la mateixa frase alhora a la veu, el subtítol i una targeta.
9. ❌ Accelerar la veu.
10. ❌ Enganxar dues preses dins d'una mateixa frase.
11. ❌ Treure totes les respiracions i totes les pauses.
12. ❌ Logos, intro o «hola, ¿qué tal?» abans del ganxo.
13. ❌ Fotograma negre al principi o al final.
14. ❌ Títol que promet una durada o un resultat que el vídeo no compleix.
15. ❌ Inventar un resultat, una captura o una menció d'eina que no hi és.
16. ❌ Declarar «revisat» un àudio que no s'ha escoltat.

---

## 21. Checklist de control de qualitat

**Estructura**
- [ ] La primera paraula sona en < 0,3 s. El text del ganxo és visible al fotograma 0.
- [ ] La durada final quadra amb el títol.
- [ ] Cada eina segueix el mòdul problema → eina → prova → criteri (o la demo està marcada com a pendent).
- [ ] Hi ha un sol CTA i no hi ha fotogrames negres finals.

**Imatge**
- [ ] No hi ha dos segments seguits del mateix pla amb la mateixa escala.
- [ ] Cap text ni element clau surt de la zona segura (x 60–940, y 220–1500).
- [ ] No hi ha desbordaments de text (`measureText`).
- [ ] Les captures que s'han de llegir fan ≥ 28 px efectius i duren prou.
- [ ] La cara, els ulls i la boca no queden tapats.
- [ ] El color és coherent entre clips.

**Text**
- [ ] Els noms d'eines estan bé escrits segons el glossari.
- [ ] Subtítols: ≤ 2 línies, ≤ 30 caràcters per línia, blocs amb sentit.
- [ ] Com a molt una paraula destacada per bloc, i amb motiu.

**So**
- [ ] −16 LUFS ±1 i pic real ≤ −1,5 dBTP (mesurat amb ffmpeg `ebur128`).
- [ ] Fosos a tots els empalmaments.
- [ ] La música (si n'hi ha) queda clarament per sota de la veu.
- [ ] ⚠️ **Escolta humana pendent**: síl·labes tallades, respiracions, naturalitat dels empalmaments.

**Entrega**
- [ ] MP4 a 1080×1920, 30 fps, H.264, AAC.
- [ ] `edl.json` amb un `reason` a cada recurs.
- [ ] `informe.md` amb decisions, dubtes i pendents.

---

## 22. Resum per enganxar-lo a la paret

> **Tu al centre. Talls directes. Una idea per pantalla. Demostra, no decoris. Un sol color. La veu, sagrada. El títol, veritat.**
