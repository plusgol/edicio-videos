// Tokens de marca i d'edició. Font única de veritat per a tots els components.
// Els valors són punts de partida (vegeu docs/GUIA_EDICIO.md); ajusta'ls després de veure'ls al mòbil.

export const VIDEO = {
  width: 1080,
  height: 1920,
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
