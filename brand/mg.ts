// Motion graphics (src/mg) i fàbrica de vídeos (src/fabrica, scripts/fabrica.py). Els quatre estils de la guia
// «Motion graphics with Claude Code» de Damiano Caudullo (kit a src/mg/fonts i src/mg/sfx) i els de les nostres
// marques, tots amb el mateix format: un vídeo canvia d'estil canviant una paraula del brief.
import {CDD} from './cdd';
import {UNI} from './unimatx';

export type SfxName = 'pop' | 'tick' | 'counter' | 'chime' | 'snap' | 'star' | 'switch' | 'fill' | 'success';
export type Layout = 'kinetic' | 'glass' | 'editorial' | 'pop';
export type Ease = 'power4' | 'power3' | 'back' | 'bouncy' | 'gentle';
export type Format = 'vertical' | 'horizontal' | 'square';

export type MgStyle = {
  layout: Layout; // com es presenta cada frase (src/fabrica/Fabrica.tsx)
  bg: string | string[]; // fons; una llista = un color per pantalla (pop)
  blobs?: string[]; // taques de color difuminades que es mouen a poc a poc (glass)
  grain?: number; // opacitat del gra de pel·lícula (editorial)
  cut?: string; // el retall de paper darrere les paraules clau (editorial)
  logoBg?: string; // rajola darrere el logo si el logo no es veu sobre el fons
  text: string;
  sub: string;
  accent: string; // la paraula important de cada pantalla (*així* al guió)
  accentText: string; // text a sobre d'un bloc de color d'accent
  tick: string; // marques de llista i barres que s'omplen
  tickInk: string; // el «✓» a sobre de la marca
  font: {head: string; body: string; label: string}; // famílies (src/mg/fonts.ts o Google Fonts)
  weight: {head: number; body: number};
  upper: boolean;
  card: {bg: string; border: string; shadow: string; radius: number} | null;
  motion: {enter: number; exit: number; ease: Ease; stagger: number; rise: number};
  // Sons (scripts/fabrica/so.py). Amb veu, només els de la regla de la guia: count (mentre roda un número), una marca
  // per element de llista i end a l'última targeta. Sense veu, «a film on its own»: també screen a cada pantalla.
  sfx: {screen: SfxName | null; word: SfxName | null; count: SfxName | null; end: SfxName | null};
  music: 'drive' | 'soft' | 'paper'; // el llit musical sintetitzat (scripts/fabrica/musica.py)
};

export const MG = {
  // Els 10 moviments: durades per defecte en fotogrames a 30 fps (el «quan» el dona la paraula dita).
  move: {rise: 18, pop: 14, slide: 14, blur: 16, stretch: 10, punch: 8, count: 45, tick: 8, type: 2, fill: 40, reframe: 22},
  // Quant es mou cada moviment (els valors de la pàgina 7 de la guia de Damiano).
  amount: {
    rise: 40, // px que puja
    popFrom: 0.6, // escala de sortida del pop
    slide: 0.6, // fracció de l'amplada des d'on entra
    blur: 24, // px de desenfocament inicial
    stretch: 0.25, // alçada inicial d'una paraula «aixafada»
    punch: 0.15, // quant s'acosta el pla sencer en un punch-in
    reframe: {scale: 0.62, y: 0.27, radius: 36}, // on acaba el pla sencer: escala, desplaçament (fracció d'alçada)
    exitRise: 24, // px que es mou un element en sortir
    glassFrom: 0.96, // escala inicial d'una targeta de vidre
  },
  overshoot: 1.7, // back.out dels pops
  bounce: 2.5, // back.out(2.5) de l'estil Pop Bold
  // Zona segura: en vertical, la de docs/GUIA_EDICIO.md (comprovada amb scripts/zona_segura.py); en horitzontal i
  // quadrat, el 80 % central de l'amplada (el que demana la guia perquè els mòbils no tallin el text).
  safe: {
    vertical: {x0: 60, x1: 940, y0: 220, y1: 1500},
    horizontal: {x0: 192, x1: 1728, y0: 150, y1: 930},
    square: {x0: 108, x1: 972, y0: 108, y1: 900},
  },
  size: {vertical: [1080, 1920], horizontal: [1920, 1080], square: [1080, 1080]} as Record<Format, [number, number]>,
  // So (regla de la guia): sobre la veu, només clics petits on importa (una marca, un comptador, l'últim cop), cap
  // «whoosh» en entrar o sortir, i uns 20 dB per sota de la veu.
  sfxGain: 0.1,
  sfxSolo: 0.5, // sense veu (un catàleg, un anunci sense locució): cada moviment té el seu so, més fort
  readWps: 3.2, // sense veu: paraules per segon que es deixen llegir
  minHold: 36, // fotogrames mínims per pantalla
  beat: 15, // 120 ppm: un temps = 15 fotogrames
  // Mida del text de cada pantalla (src/fabrica/layout.ts): la mida màxima, en fracció de l'amplada de la zona segura;
  // l'interlineat; i quina part de l'alçada de la zona segura pot ocupar el titular segons el que l'acompanya.
  text: {
    maxSize: {kinetic: 0.26, glass: 0.12, editorial: 0.2, pop: 0.17},
    minSize: 28,
    lineHeight: {kinetic: 0.92, glass: 1.12, editorial: 1.02, pop: 1.04},
    budget: {text: 0.62, kinetic: 0.86, list: 0.26, bar: 0.4, image: 0.22, end: 0.28},
    item: 0.055, // mida dels elements de llista (fracció de l'amplada)
    sub: 0.042, // subtítol de la targeta final i etiquetes
    label: 0.03,
    shortWord: 2, // en Kinetic Type, una paraula de fins a 2 lletres va amb la següent («a», «de», «tu»)
    kineticChars: 11, // i dues paraules comparteixen línia només si junts no passen d'aquestes lletres
    cardPad: 56, // marge interior de les targetes de vidre
    gap: 0.035, // espai entre blocs (fracció de l'alçada de la zona segura)
  },
  // QA: tot el que s'ha de llegir es pinta d'aquest color sobre negre i scripts/fabrica/qa.py comprova que no surti de
  // la zona segura.
  qaColor: '#FF00FF',
  qaScale: 0.25, // el pas de QA es renderitza petit: només es miren els píxels magenta
  // Fàbrica (scripts/fabrica/guio.py), en fotogrames: silenci abans de la primera frase, aire entre frases, quant abans
  // de la primera paraula entra la pantalla, quant queda la targeta final després de la veu, i el mínim que una frase
  // sencera es queda quieta abans de marxar (la guia: «0.7 s or more»).
  factory: {lead: 6, gap: 8, pre: 4, tail: 54, readable: 21, wordStep: 5, endLead: 10},
  // Mescla (scripts/fabrica/so.py): veu almenys 12 LU per sobre de música i efectes; màster a −14 LUFS i pic real per
  // sota de −1 dB (la guia, PROMPT 15).
  mix: {voiceOverBed: 12, sfxUnderVoice: 20, lufs: -14, truePeak: -1.0},
};

const glassCard = {bg: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.95)', shadow: '0 24px 60px rgba(40,40,90,0.14)', radius: 32};

export const STYLES: Record<string, MgStyle> = {
  // Paraules enormes en majúscules que cauen al ritme: per a ganxos i guions curts.
  kinetic: {
    layout: 'kinetic', bg: '#000000', text: '#FFFFFF', sub: '#9A9A9A', accent: '#C6FF3D', accentText: '#000000', tick: '#C6FF3D', tickInk: '#000000', logoBg: '#FFFFFF',
    font: {head: 'Archivo Black', body: 'Inter', label: 'JetBrains Mono'}, weight: {head: 400, body: 700}, upper: true, card: null,
    motion: {enter: 9, exit: 4, ease: 'power4', stagger: 4, rise: 60}, sfx: {screen: 'snap', word: null, count: 'counter', end: 'chime'}, music: 'drive',
  },
  // L'aspecte d'Apple: targetes de vidre esmerilat, colors suaus, moviment tranquil. El verd de la guia queda per a les
  // marques de llista; les paraules clau, en indi perquè no es confonguin amb un «fet».
  glass: {
    layout: 'glass', bg: 'linear-gradient(160deg, #EEF2FF 0%, #F7F2FF 50%, #FFF5EE 100%)', blobs: ['#A9C7FF', '#D9C6FF', '#FFD3B8'],
    text: '#1D1D1F', sub: '#6E6E73', accent: '#5E5CE6', accentText: '#FFFFFF', tick: '#34C759', tickInk: '#FFFFFF',
    font: {head: 'Inter', body: 'Inter', label: 'Inter'}, weight: {head: 700, body: 400}, upper: false, card: glassCard,
    motion: {enter: 18, exit: 10, ease: 'power3', stagger: 3, rise: 30}, sfx: {screen: null, word: null, count: 'counter', end: 'chime'}, music: 'soft',
  },
  // Pàgina de revista: paper, gra, serif, retalls de paper darrere les paraules clau.
  editorial: {
    layout: 'editorial', bg: '#EFE8DC', grain: 0.12, cut: '#FBF7EF', text: '#1A1A1A', sub: '#6B655B', accent: '#C2412D', accentText: '#FFFFFF', tick: '#C2412D', tickInk: '#FFFFFF',
    font: {head: 'Instrument Serif', body: 'Instrument Serif', label: 'Inter'}, weight: {head: 400, body: 400}, upper: false, card: null,
    motion: {enter: 22, exit: 12, ease: 'gentle', stagger: 5, rise: 18}, sfx: {screen: null, word: null, count: 'counter', end: 'chime'}, music: 'paper',
  },
  // Sorollós a propòsit: colors plans, contorns negres, tot rebota. Per aturar el scroll.
  pop: {
    layout: 'pop', bg: ['#8A3CFF', '#C6FF3D', '#FF4FD8'], text: '#111111', sub: '#111111', accent: '#FF4FD8', accentText: '#111111', tick: '#111111', tickInk: '#C6FF3D',
    font: {head: 'Bricolage Grotesque', body: 'Bricolage Grotesque', label: 'JetBrains Mono'}, weight: {head: 800, body: 800}, upper: false,
    card: {bg: '#C6FF3D', border: '4px solid #111111', shadow: '8px 8px 0 #111111', radius: 18},
    motion: {enter: 12, exit: 8, ease: 'bouncy', stagger: 3, rise: 40}, sfx: {screen: 'pop', word: null, count: 'counter', end: 'success'}, music: 'drive',
  },
  // UniMatx: el degradat índigo de la web, menta per a l'accent i targetes de vidre fosc.
  unimatx: {
    layout: 'glass', bg: `linear-gradient(150deg, #2B2190 0%, ${UNI.indigo} 50%, #5B6CF0 100%)`, blobs: ['#6D3FD0', '#4A6CF0', '#3BC4A0'],
    text: '#FFFFFF', sub: '#C9CCF5', accent: UNI.mint, accentText: UNI.mintInk, tick: UNI.mint, tickInk: UNI.mintInk, logoBg: '#FFFFFF',
    font: {head: 'Poppins', body: 'Poppins', label: 'Poppins'}, weight: {head: 800, body: 500}, upper: false,
    card: {bg: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.28)', shadow: '0 24px 60px rgba(10,6,60,0.35)', radius: 32},
    motion: {enter: 16, exit: 10, ease: 'power3', stagger: 3, rise: 30}, sfx: {screen: null, word: null, count: 'counter', end: 'chime'}, music: 'soft',
  },
  // Camino de Dragones: fosc, vermell de la web, lletra condensada com la del logo.
  cdd: {
    layout: 'kinetic', bg: CDD.ink, text: '#FFFFFF', sub: CDD.sub, accent: CDD.red, accentText: '#FFFFFF', tick: CDD.red, tickInk: '#FFFFFF', logoBg: '#FFFFFF',
    font: {head: 'Barlow Condensed', body: 'Work Sans', label: 'Work Sans'}, weight: {head: 800, body: 600}, upper: true, card: null,
    motion: {enter: 10, exit: 4, ease: 'power4', stagger: 4, rise: 50}, sfx: {screen: 'snap', word: null, count: 'counter', end: 'chime'}, music: 'drive',
  },
};
