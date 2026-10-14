// Tokens de marca i d'edició. Font única de veritat per a tots els components.
// Els valors són punts de partida (vegeu docs/GUIA_EDICIO.md); ajusta'ls després de veure'ls al mòbil.

// Per defecte YouTube llarg 16:9. Per a Shorts/Reels: 1080×1920 i subtítols activats a l'EDL.
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

export const COLOR = {
  ink: '#0E0E10',
  paper: '#F7F7F5',
  muted: '#8A8A93',
  // Tria UN accent i no el canviïs entre vídeos: '#FF5A36' coral · '#3D7BFF' blau · '#C6F432' llima
  accent: '#FF5A36',
  focusDim: 'rgba(0, 0, 0, 0.6)', // màscara del layout FOCUS (55–65 %)
} as const;

export const FONT = {
  // Carrega-la amb @remotion/google-fonts/<Familia> → loadFont('normal', {weights: ['500', '700', '800'], subsets: ['latin']})
  family: 'Inter',
  captionWeight: 700,
  highlightWeight: 800,
  labelNameWeight: 800,
  labelFnWeight: 500,
} as const;

export const SAFE = {
  left: 60,
  right: 940, // deixa ~140 px a la dreta per als botons de la plataforma
  top: 220,
  bottom: 1500,
} as const;

export const CAPTIONS = {
  fontSize: 60, // provar entre 58 i 64
  lineHeight: 1.18,
  maxLines: 2,
  maxCharsPerLine: 30,
  minPageMs: 700,
  combineTokensWithinMs: 1500, // 1200–1800 → blocs de 3–6 paraules
  centerY: 1340, // layouts CARA / CARA_ETIQUETA (a sota de la boca, sobre el coll o el pit)
  shadow: '0 2px 12px rgba(0,0,0,.55)',
  strokePx: 6, // contorn fosc (paint-order: stroke) perquè es llegeixi sobre cel, pell o samarreta
  splitBackground: 'rgba(14,14,16,0.65)', // suport al layout SPLIT
  fadeInFrames: 3,
} as const;

export const LABEL = {
  // Etiquetes i text del ganxo van al terç inferior, a sobre dels subtítols: en plans tancats (selfie)
  // la part de dalt és plena d'ulls i front, i el guió prohibeix tapar ulls i boca.
  top: 1100,
  enterFrames: 7,
  exitFrames: 5,
  offsetPx: 20,
  minHoldMs: 2000,
  maxHoldMs: 3500,
  radius: 18,
  paddingY: 20,
  paddingX: 28,
  iconSize: 48,
} as const;

export const FRAMING = {
  // Escales permeses per al pla de càmera. El canvi és tallat, no animat.
  wide: 1.0,
  medium: 1.08,
  tight: 1.15, // èmfasi: màxim 3–4 per vídeo
  maxTightPerVideo: 4,
  maxSegmentWithoutChangeMs: 10000,
  minSegmentFrames: 15,
} as const;

export const CUTS = {
  keepSilenceBelowMs: 250,
  shortenSilenceToMs: 200, // per a silencis de 250–600 ms
  longSilenceMs: 600,
  padBeforeWordMs: 120,
  padAfterWordMs: 150,
  expressivePauseMs: [400, 800] as const,
  audioFadeMs: 12, // 8–15 ms a cada empalmament, sense encavalcar
  jCutFrames: [4, 8] as const,
  lCutFrames: [8, 15] as const,
} as const;

export const MOTION = {
  springNoBounce: { damping: 200 },
  focusMoveFrames: 12,
  focusFadeFrames: 7,
  hookHoldMs: [2500, 3500] as const,
  emotionalPushIn: { from: 1.0, to: 1.04, frames: 105, maxPerVideo: 1 },
} as const;

export const READING = {
  msPerWord: 350,
  extraMs: 1000,
  minMs: 2000,
  minEffectiveTextPx: 28,
  maxFullDemoMs: 10000,
} as const;

export const AUDIO = {
  targetLufs: -16,
  maxTruePeakDb: -1.5,
  highpassHz: 80,
} as const;

export type Layout =
  | 'CARA'
  | 'CARA_ETIQUETA'
  | 'SPLIT'
  | 'DEMO_COMPLETA'
  | 'FOCUS'
  | 'FRASE_CLAU'
  | 'PASSOS';

// ---------- Estil Alex DiLorenzo (docs/ESTIL_ALEX.md) ----------
export const ALEX = {
  gold: 'linear-gradient(180deg, #F6DB98 0%, #E2B65E 45%, #B9862F 75%, #F0CF84 100%)',
  goldSolid: '#D6A84E',
  // Sobre el pla de càmera o fons fosc: resplendor càlida. Sobre l'escenari clar: només una vora fina, perquè no s'embruti.
  goldGlow: 'drop-shadow(0 0 16px rgba(255,190,90,.40)) drop-shadow(0 4px 8px rgba(0,0,0,.30))',
  goldGlowLight: 'drop-shadow(0 1px 0 rgba(120,80,20,.25))',
  white: '#FFFFFF',
  red: '#E5383B',
  stageLight: 'radial-gradient(ellipse at 50% 50%, #F4F4F2 0%, #ECECEA 38%, #C9C9C7 70%, #8E8E8E 100%)',
  stageDark: 'radial-gradient(ellipse at 50% 48%, #1C1C1E 0%, #0B0B0C 55%, #000000 100%)',
  ink: '#151515',
  fontDisplay: 'Anton',
  fontWords: 'Poppins',
  // Moviment (fotogrames a 30 fps)
  blurInFrames: 5,
  blurOutFrames: 4,
  blurPx: 16,
  letterStagger: 2,
  wordStagger: 5,
  pushPerSecond: 0.03, // zoom lent mentre un element és a pantalla
  floatingWordsPx: 52,
  // Aire a dalt dels textos amb degradat (background-clip retalla titlles i accents: Ñ, Á…).
  goldClipPad: '0.18em 0.04em 0.06em',
  // Escales del pla base: es van alternant a cada tall
  cameraScales: [1.0, 1.12, 1.22],
} as const;

// ---------- Toc manual (lletra a mà de l'usuari, mostra «Me gusta la IA») ----------
export const MANUAL = {
  // Fons gris clar quasi pla, com la mostra; vinyeta molt suau.
  stage: 'radial-gradient(ellipse at 50% 50%, #E4E4E4 0%, #DDDDDD 60%, #CDCDCD 100%)',
  ink: '#141414',
  accent: '#1D6BFF', // el blau de «la IA»
  inkOnCamera: '#FFFFFF',
  accentOnCamera: '#FFD34D', // sobre el cel blau del vídeo, el blau es perdria
  stageSize: 290,
  cameraSize: 124,
  writeSpeed: 3.2, // velocitat d'escriptura (1 = ritme natural de la font; Alex va ràpid)
  writeFitFraction: 0.55, // la frase ha d'acabar d'escriure's dins d'aquesta part del temps en pantalla
  stageLongTextChars: 22, // a partir d'aquí, la frase d'escenari es fa més petita perquè no surti de quadre
  stageSizeLong: 190,
  sticker: {radius: 30, padding: 26, logoPx: 150, tiltDeg: 4},
} as const;
