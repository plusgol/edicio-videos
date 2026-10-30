// Camino de Dragones (caminodedragones.es): colors i mides del vídeo vertical que explica la cursa i la ruta.
// El vermell és el de la web (#cd352d), una mica més viu per a la ruta sobre el mapa fosc. Lletres: Barlow Condensed
// (s'assembla a la del logo) per a títols i xifres, i Work Sans (la de la web) per al text.
export const CDD = {
  width: 1080,
  height: 1920,
  fps: 30,
  red: '#E5382C',
  redWeb: '#CD352D',
  ink: '#0A0E13',
  sea: '#060A0E',
  land: '#141B22',
  france: '#0F141A',
  muni: '#1E2831',
  prov: '#384652',
  cat: '#6A7B88',
  text: '#FFFFFF',
  sub: '#A7B3BE',
  route: {width: 7, ghost: 'rgba(255,255,255,0.24)', glow: 16},
  // Càmera sobre el mapa: escala 1 = la ruta sencera a la zona central (scripts/cdd/mapa_cdd.mjs → VIEW).
  cam: {runFrom: 2.5, runTo: 1.7, headY: 0.44, smooth: 8, move: 26, after: {s: 0.9, sy: 900}, closing: 0.85},
  // after: el pla general després de la ruta, més petit i més avall perquè la xifra del desnivell hi càpiga a dalt
  dragons: {size: 30, pop: 9},
  hud: {top: 150, shade: 420}, // la franja fosca de dalt, perquè els rètols del mapa que hi pugen no es llegeixin a sobre
  profile: {x: 90, y: 1452, w: 900, h: 150, max: 2100},
  climb: {top: 120}, // la xifra del desnivell, a dalt, on al pla general no hi ha ruta
  enter: 12,
  out: 10,
  label: {size: 34, in: 10},
  duck: {base: 0.85, under: 0.26, ramp: 8, pad: 5},
  sfx: 0.45,
} as const;
