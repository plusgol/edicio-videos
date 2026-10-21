# Guió de la veu en off — «Construí un bot de trading con IA»

**Com gravar-ho**
- Amb l'iPhone, a l'habitació en silenci, amb el mòbil a uns 20 cm de la boca.
- **Un fitxer per bloc:** Intro, P, A, B, D, C, G i F.
- Llegeix-ho amb naturalitat, no cal que sigui perfecte: les pauses i els errors els retallo jo.
- Si t'equivoques, torna a dir la frase sencera.
- Quan ho tinguis, puja-ho al Drive.

A la pàgina de vista prèvia, sota el vídeo, surt el text de cada bloc en el moment que toca: pots gravar mirant el vídeo.

---

## INTRO (0:00) — els primers 30 s de *tef*, traduïts literalment
Les animacions ja estan muntades amb aquest ritme. Entre parèntesis, què surt a la pantalla.

1. «Veo a mucha gente ganando mucho dinero con las criptomonedas,» *(cerques reals de YouTube: «+$2,629/DAY», «$400/Day», «+0.85 ETH»)*
2. «y hay un montón de escándalos, ya sabes, rug pulls.» *(cerca «rug pull crypto»: «RUGGED?», «RUG PULL IN 6 MINUTES»)*
3. «Hay muchísimo dinero en las cripto.» *(MUCHÍSIMO DINERO, en or)*
4. «Así que quiero un trozo de ese pastel.» *(lletra a mà)*
5. «Y ganan ese dinero mientras duermen, con bots.» *(cerca «trading bot make money while you sleep»)*
6. «A veces funciona, a veces no,» *(rètol)*
7. «pero sé una cosa: dormir es mi habilidad número uno.» *(lletra a mà)*
8. «Entonces, ¿tengo un plan para hacer este bot?» *(rètol)*
9. «No, para nada.» *(NO)*
10. «Pero ¿tengo acceso a la IA? Sí.» *(targeta de Claude)*
11. «Así que, al final de este vídeo, tendremos un bot que funciona,» *(la capçalera del teu panell: el bot en marcha)*
12. «le daremos datos del mercado en directo» *(«Fase 2 terminada: descarga y limpieza de datos»)*
13. «y operará por nosotros y nos hará ganar dinero real.» *(el panell, difuminat)*
14. «Y mi objetivo son 10.000 dólares en un mes.» *(10.000 $, en or)*
15. «De verdad quiero llegar a ese objetivo.»

> **Compte amb la frase 13.** El teu bot opera amb **diners ficticis** (paper trading), i al vídeo ho diem i ho etiquetem. Si dius «nos hará ganar dinero real», contradiu la resta del vídeo. Et recomano aquesta variant:
> «…y operará por nosotros. De momento, con dinero ficticio.»
> La frase 14 sí que la pots dir tal qual: és un objectiu, no un resultat. Si vols suavitzar-la: «Y mi objetivo: ver si llega a 10.000 dólares en un mes».

---

## Blocs de veu en off
Mentre parles, a la pantalla hi ha una explicació animada (o la teva pantalla accelerada). Tot el que diuen surt a les teves gravacions o a la web d'Ibero Funding.

### P — El truco del prompt (va després de «Entonces yo he escrito, tal cual:»), ~8 s
«Fijaos en el truco: no le pido el bot directamente. Le pido a Claude que me escriba el prompt perfecto para pedírselo.»
*(La teva pantalla escrivint el prompt, accelerada ×4, amb el rètol «Le pido el prompt, no el bot».)*

### A — El plan de Claude (va després de «como lo haría, el paso a paso»), ~14 s
«Y antes de nada, Claude me avisa: ningún prompt te garantiza ganar dinero, y la mayoría de bots de particulares pierden. Su plan tiene cinco pasos: una hipótesis simple, datos históricos, backtesting, control del riesgo y, como mínimo, dos o tres meses con dinero ficticio.»
*(L'avís de Claude i després els cinc passos en targetes.)*

### B — Les estratègies i les plataformes (va després de «va creando hipótesis»), ~42 s
«Me propone tres estrategias. La primera: seguir la tendencia con dos medias, una rápida y una lenta. Cuando la rápida cruza por encima de la lenta, el precio está cogiendo fuerza: compra. Cuando cruza por debajo: vende. La segunda: reversión a la media. Si un activo cae mucho en pocos días, apuesta a que vuelva a su precio normal. La tercera: momentum. Cada mes mira qué ha subido más entre Bitcoin, Ethereum y el SPY, y pone el dinero ahí. Y para practicar sin arriesgar, dos plataformas con dinero ficticio: Alpaca Paper para las acciones y Bybit Demo para las cripto.»
*(Un gràfic animat per a cada estratègia, marcat «Ejemplo ilustrativo», i les dues plataformes amb el logo.)*

### D — Què fa Claude Code (va després de «nos da para crear este bot»), ~15 s
«Luego Claude Code se pone a trabajar solo: descarga los datos de Bybit y de Alpaca, los limpia, monta el backtesting y lo conecta todo a las cuentas de dinero ficticio. Y al final, un panel para verlo.»
*(Els passos en targetes i la llista real de tasques de Claude Code.)*

### C — El que van mostrar les dades (va just després de D), ~12 s
«Y con los datos encontró cosas que yo no habría visto: mantener una posición larga en Bitcoin ha costado, de media, un 12,7 % al año en funding.»

### G — El final del compte de fondeig (va després de «has perdido 28 dólares»), ~6 s
«Y si pasas el reto, te quedas el 75 % de lo que ganes.»
*(Última targeta de l'explicació del compte de fondeig.)*

### F — Així funciona el bot (va després de «me está creando un servidor local, con páginas»), ~38 s
«Este es el panel que me ha montado: el bot en marcha, el riesgo bajo control, y todo con precios reales pero dinero ficticio. Opera en cuatro mercados: el oro, el SPY, Bitcoin y Ethereum. Usa la estrategia de las dos medias que os he explicado, y cada operación lleva su stop-loss: si el precio llega ahí, se cierra perdiendo solo un 0,5 % de la cuenta. Además, tiene un límite de pérdida diaria del 3 % y un kill switch: si cae un 8 % desde el máximo, se apaga solo. Y cada vez que se cierra una vela, calcula la señal y lo apunta todo en este registro.»
*(El teu panell amb un requadre i un rètol a cada part que expliques. Ja no torna a explicar com s'arrenca ni el creuament de mitjanes: això ja surt abans.)*
