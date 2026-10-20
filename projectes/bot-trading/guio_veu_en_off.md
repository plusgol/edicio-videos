# Guió de la veu en off — «Construí un bot de trading con IA»

**Com gravar-ho**
- Amb l'iPhone, a l'habitació en silenci, amb el mòbil a uns 20 cm de la boca.
- **Un fitxer per bloc:** Intro, A, B, C, D i E.
- Llegeix-ho amb naturalitat, no cal que sigui perfecte: les pauses i els errors els retallo jo.
- Si t'equivoques, torna a dir la frase sencera.
- Quan ho tinguis, puja-ho al Drive.

Amb la intro i els cinc blocs, el vídeo passa de ~6:50 a **~8:30**.

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
11. «Así que, al final de este vídeo, tendremos un bot que funciona,» *(la teva consola: «Bot iniciado»)*
12. «le daremos datos del mercado en directo» *(«Fase 2 terminada: descarga y limpieza de datos»)*
13. «y operará por nosotros y nos hará ganar dinero real.» *(el panell, difuminat)*
14. «Y mi objetivo son 10.000 dólares en un mes.» *(10.000 $, en or)*
15. «De verdad quiero llegar a ese objetivo.»

> **Compte amb la frase 13.** El teu bot opera amb **diners ficticis** (paper trading), i al vídeo ho diem i ho etiquetem. Si dius «nos hará ganar dinero real», contradiu la resta del vídeo. Et recomano aquesta variant:
> «…y operará por nosotros. De momento, con dinero ficticio.»
> La frase 14 sí que la pots dir tal qual: és un objectiu, no un resultat. Si vols suavitzar-la: «Y mi objetivo: ver si llega a 10.000 dólares en un mes».

---

## Blocs extra (per arribar als 8–9 min)
Al vídeo es veu la teva pantalla mentre parles. Tot el que diuen aquests blocs **surt a les teves gravacions de pantalla**; no he afegit res que no hi sigui.

### A — L'avís de Claude (va després de «mandadlo directamente a Claude Code»), ~20 s
«Antes de darme el prompt, Claude me avisó de algo importante: ningún prompt te da “la mejor IA” ni rentabilidad garantizada. La mayoría de bots de particulares pierden dinero, y no es asesor financiero. Y me propuso hacerlo paso a paso: una hipótesis simple, datos históricos, un backtesting realista, gestión del riesgo y, como mínimo, dos o tres meses en paper trading.»

### B — Les tres hipòtesis (va després de «va creando hipótesis»), ~22 s
«En la fase 1 me propuso tres hipótesis de estrategia. La primera, seguir la tendencia. La segunda, reversión a la media a corto plazo: por ejemplo, comprar el SPY cuando cae mucho en pocos días. Y la tercera, momentum relativo: cada mes, invertir en lo que más ha subido entre Bitcoin, Ethereum y el SPY. Y para operar con dinero ficticio, Alpaca Paper para las acciones y Bybit Demo para las cripto.»

### D — Claude Code treballant sol (va després de «nos da para crear este bot»), ~18 s
«Y a partir de aquí, Claude Code se pone a trabajar solo: comprueba Python, crea la estructura del proyecto, escribe la descarga de datos de cripto y de ETF, la limpieza, los tests… y prueba a descargar datos reales de Bitcoin.»

### C — El que van mostrar les dades (va just després de D), ~22 s
«En la fase 2 descargó y limpió los datos: velas diarias de Bitcoin desde 2020 y de Ethereum desde 2021. Y encontró cosas que yo no habría visto nunca. Por ejemplo, que mantener una posición larga en el perpetuo de Bitcoin ha costado, de media, un 12,7 % al año en funding. Y me avisó de que en cripto solo hay unos seis años de historial, así que la confianza en los resultados es limitada.»

### E — El panell, sense resultats (va després de «siempre pueden haber errores»), ~18 s
«Y este es el panel que me ha montado. Opera con oro, el SPY, Bitcoin y Ethereum, con precios reales y dinero ficticio. Tiene un límite de pérdida diaria del 3 %, y un kill switch: si cae un 8 % desde el máximo, se apaga solo. ¿Los resultados? En la parte 2.»
*(Es veu el panell, però les xifres de guanys i pèrdues queden tapades.)*
