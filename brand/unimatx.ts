// Tokens dels reels d'UniMatx (vertical 1080×1920). Colors de la marca presos de la web (unimatx.cat) i de l'informe.
// Les dues fórmules surten de l'anàlisi de les referències: A-B (vídeo de ClubOS) i sèrie (vídeo del zombie).

export const REEL = {width: 1080, height: 1920, fps: 30} as const;

export const UNI = {
  indigo: '#4B3FD6',
  violet: '#6D3FD0',
  mint: '#6EE7A0',
  mintInk: '#0B3B26',
  ink: '#151833',
  inkSoft: '#5B6180',
  paper: '#FFFFFF',
  line: '#E4E6F0',
  bad: '#C2412D',
  good: '#1F8A55',
  banner: '#FFF7D6',
  bannerLine: '#E2B93B',
} as const;

// Món isomètric de dia (A-B): ciutat clara, teulades de colors, carrers grisos, un cel amb boira a l'horitzó.
export const ISO = {
  tileW: 120, // amplada d'una cel·la en projecció 2:1
  tileH: 60,
  grid: 34, // cel·les per costat
  roadEvery: 4, // cada quantes cel·les hi ha un carrer
  skyTop: '#3F8EF2',
  skyBottom: '#CFE6FF',
  haze: '#F4F7FB',
  ground: '#EDE7DD',
  road: '#C9C6C1',
  wall: '#F6F2EC',
  wallLeft: '#E3DCD2',
  wallRight: '#D2C9BD',
  roofs: ['#D9643E', '#E8875E', '#8FA1B8', '#F1E4D0', '#C7543A', '#F3EFE8'],
  tree: '#5DBB63',
  treeDark: '#3E9A4A',
  grass: '#7BCB7B',
  pitch: '#3FB56A',
  landmark: '#4B3FD6',
  duskTop: '#2B2F6B',
  duskBottom: '#E9A26B',
  windowLit: '#FFD27A',
} as const;

// Habitació de nit del «mentrestant» i escenes de la sèrie.
export const NIGHT = {
  bg: '#0A0F22',
  wall: '#1B2350',
  wallDark: '#141A3C',
  floor: '#10162F',
  lamp: '#FFC873',
  screen: '#BFE3FF',
  badge: '#E5484D',
  caption: '#FFFFFF',
  karaoke: '#FFD23F',
  chipBorder: '#FFD23F',
} as const;

export const TIMING = {
  camEase: 26, // fotogrames que triga la càmera a anar d'un lloc a l'altre
  wordStagger: 2, // fotogrames entre paraula i paraula al títol
  phoneIn: 14,
  rewind: 16, // durada de l'efecte ◀◀
  pushPerShot: 0.06, // apropament lent de cada pla de la sèrie
  musicAB: 0.16, // volum de la música sota la veu
  musicSerie: 0.22,
  sfx: 0.5,
  captionMaxChars: 16,
  // Ritme «dopamina»: res no s'aguanta quiet més d'un segon i mig.
  punch: 1.5, // segons entre cop i cop de càmera (A-B)
  punchZoom: 0.1, // quant s'apropa cada cop
  subShot: 1.5, // segons per pla abans d'un tall a pla tancat (sèrie)
  closeUp: 1.3, // escala del pla tancat (sèrie)
} as const;

export const TYPE = {
  title: 78, // títols del terç de dalt (A-B)
  titleBig: 120,
  crumb: 25,
  caption: 82, // subtítols karaoke (sèrie)
  chip: 40,
  chipSub: 22,
} as const;

// Demo per a centres en versió ràpida (projectes/demo-escoles): zooms a l'acció, càmera en bombolla, rètols de part.
export const DEMO = {
  width: 1920,
  height: 1080,
  fps: 30,
  ease: 12, // fotogrames del zoom dins d'un tros (entre trossos, el canvi és sec)
  drift: 0.012, // apropament lent per segon quan el pla s'aguanta
  bubble: 230, // diàmetre de la bombolla de la càmera
  bubbleMargin: 28,
  music: 0.05, // música de fons, molt per sota de la veu
  chip: 30, // mida del rètol de part
  progress: 6, // gruix de la barra de progrés
} as const;

// Vídeo de presentació (projectes/unimatx-llancament): colors exactes de la web, presos amb getComputedStyle i de
// les captures de pantalla del test (27-10-2026).
export const WEB = {
  gradient: 'linear-gradient(90deg, #3B1E90 0%, #5A3CC4 30%, #3A6EF0 100%)', // portada
  phase: 'linear-gradient(140deg, #3B1E90 0%, #4542AB 55%, #4B57D1 100%)', // targetes de fase del test
  night: '#120A3A', // fons del cold open
  purple: '#3B1E90',
  blue: '#116EEE', // «Matx», enllaços, opció triada
  mint: '#11EE92', // botons i «carrera ideal»
  mintInk: '#0D2A1C',
  ink: '#252B2F',
  inkSoft: '#5E6672',
  page: '#F2F7FD',
  card: '#FFFFFF',
  line: '#E3E8F0',
  warn: '#FFF6E5', // «Com hi intervenen els límits que has confirmat»
  warnLine: '#F0C979',
  social: '#DC714D',
  cientific: '#178478',
  artistic: '#7958A6',
} as const;

export const LAUNCH = {
  width: 1920,
  height: 1080,
  fps: 30,
  camEase: 24, // fotogrames del viatge de càmera (launch-video-kit: quieta i viatges curts)
  enter: 9, // entrada d'una pantalla nova (puja i apareix)
  flicker: 3, // fotogrames per nom de grau al cold open
  cursor: 46, // mida del cursor
  musicAt: 252, // la música entra amb la marca, a 120 ppm: un compàs = 60 fotogrames
  bar: 60,
  sfx: 0.35,
  duck: {base: 0.8, under: 0.22, ramp: 9, pad: 6},
} as const;

// Versió «BOOM» del vídeo de presentació (v2): més cop, talls a cada temps, sacsejades i flaixos a les entrades.
export const BOOM = {
  danger: '#FF4D5E', // el +20% i l'any perdut
  beat: 15, // 120 ppm a 30 fps
  bar: 60,
  camEase: 14, // viatges de càmera més curts que a la v1
  punch: 1.08, // escala d'entrada de cada pla, que torna a 1
  punchFrames: 10,
  slam: 7, // fotogrames que triga una paraula a caure
  shake: 18, // píxels de la sacsejada als cops
  shakeFrames: 12,
  flash: 8,
  caption: 62,
  duck: {base: 0.85, under: 0.3, ramp: 6, pad: 4},
  sfx: 0.45,
} as const;
