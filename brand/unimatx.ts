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
} as const;

export const TYPE = {
  title: 78, // títols del terç de dalt (A-B)
  titleBig: 120,
  crumb: 25,
  caption: 82, // subtítols karaoke (sèrie)
  chip: 40,
  chipSub: 22,
} as const;
