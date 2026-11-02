import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {MG, type Ease} from '../../brand/mg';

// Els 10 moviments de la guia «Motion graphics with Claude Code» (Damiano Caudullo, pàgina 7), en Remotion:
// rise, pop, count-up, checklist tick, typewriter, slide-in, blur-in, punch-in, reframe i bar fill. A més, «stretch»,
// el de l'estil Kinetic Type (una paraula aixafada que s'estira fins a l'alçada sencera).
// Cada moviment comença en un fotograma (`at`), que ha de ser el de la paraula dita: «say the moment in words».

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const EASE: Record<Ease, (t: number) => number> = {
  power4: (t) => 1 - (1 - t) ** 5, // GSAP power4.out
  power3: (t) => 1 - (1 - t) ** 4, // GSAP power3.out
  back: (t) => 1 + (MG.overshoot + 1) * (t - 1) ** 3 + MG.overshoot * (t - 1) ** 2,
  bouncy: (t) => 1 + (MG.bounce + 1) * (t - 1) ** 3 + MG.bounce * (t - 1) ** 2,
  gentle: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};

/** Progrés 0→1 (amb la corba triada; «back» passa d'1 una estona) d'un moviment que comença a `at` i dura `dur`. */
export const progress = (frame: number, at: number, dur: number, ease: Ease = 'power3') =>
  EASE[ease](clamp01((frame - at) / Math.max(1, dur)));

export type MoveName = 'rise' | 'pop' | 'slide' | 'slideLeft' | 'blur' | 'stretch' | 'fade';

/** L'estil d'entrada d'un element: p = 0 (fora) → 1 (al lloc). `width` és l'amplada del pla, per a l'slide. */
export const enterStyle = (move: MoveName, p: number, width = 1080, rise: number = MG.amount.rise): React.CSSProperties => {
  const o = clamp01(p * 1.6);
  switch (move) {
    case 'rise':
      return {opacity: o, transform: `translateY(${(1 - p) * rise}px)`};
    case 'pop':
      return {opacity: clamp01(p * 3), transform: `scale(${MG.amount.popFrom + (1 - MG.amount.popFrom) * p})`};
    case 'slide':
      return {opacity: o, transform: `translateX(${(1 - p) * MG.amount.slide * width}px)`};
    case 'slideLeft':
      return {opacity: o, transform: `translateX(${-(1 - p) * MG.amount.slide * width}px)`};
    case 'blur':
      return {opacity: o, filter: `blur(${(1 - clamp01(p)) * MG.amount.blur}px)`};
    case 'stretch':
      return {opacity: clamp01(p * 4), transform: `scaleY(${MG.amount.stretch + (1 - MG.amount.stretch) * p})`, transformOrigin: '50% 100%'};
    case 'fade':
      return {opacity: clamp01(p)};
  }
};

/** Sortida ràpida: q = 0 (al lloc) → 1 (fora). Puja una mica i s'esvaeix. */
export const exitStyle = (q: number): React.CSSProperties =>
  q <= 0 ? {} : {opacity: 1 - clamp01(q), transform: `translateY(${-q * MG.amount.exitRise}px)`};

/** Un element que entra amb un moviment a `at` (i, si es passa `out`, que surt a partir d'aquell fotograma). */
export const Enter: React.FC<{
  move: MoveName;
  at: number;
  dur?: number;
  ease?: Ease;
  out?: number;
  outDur?: number;
  width?: number;
  rise?: number;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}> = ({move, at, dur, ease = 'power3', out, outDur = 6, width, rise, style, className, children}) => {
  const f = useCurrentFrame();
  const d = dur ?? MG.move[move === 'slideLeft' ? 'slide' : move === 'fade' ? 'rise' : move];
  const p = progress(f, at, d, ease);
  const e = enterStyle(move, p, width, rise);
  const x = out === undefined ? {} : exitStyle(progress(f, out, outDur, 'power3'));
  const transform = [e.transform, x.transform].filter(Boolean).join(' ') || undefined;
  const opacity = Number(e.opacity ?? 1) * Number(x.opacity ?? 1);
  return (
    <div className={className} style={{...style, ...e, transform, opacity, willChange: 'transform'}}>
      {children}
    </div>
  );
};

/** Separa un número escrit en un text («+1.200 €», «87 %», «4,5») en prefix, valor, decimals i sufix. */
export const parseNumber = (s: string) => {
  const m = s.match(/^(\D*?)(\d[\d.,]*)(\D*)$/);
  if (!m) return null;
  const raw = m[2];
  const dec = /,\d{1,2}$/.test(raw) ? raw.split(',')[1].length : 0; // coma decimal (castellà i català)
  const value = Number(raw.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(value) ? {prefix: m[1], value, decimals: dec, suffix: m[3]} : null;
};

/** Count-up: un número que roda de `from` a `to` (punts de milers com en castellà: 1200, 12.000). */
export const CountUp: React.FC<{
  format?: (v: number) => string;
  at: number;
  to: number;
  from?: number;
  dur?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  style?: React.CSSProperties;
}> = ({at, to, from = 0, dur = MG.move.count, decimals = 0, prefix = '', suffix = '', locale = 'es-ES', style, format}) => {
  const f = useCurrentFrame();
  const v = from + (to - from) * progress(f, at, dur, 'power3');
  const txt = v.toLocaleString(locale, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  return <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>{format ? format(v) : `${prefix}${txt}${suffix}`}</span>;
};

/** Typewriter: el text s'escriu lletra a lletra (MG.move.type fotogrames per lletra), amb cursor mentre escriu. */
export const Typewriter: React.FC<{at: number; text: string; perChar?: number; caret?: string; style?: React.CSSProperties}> = ({
  at,
  text,
  perChar = MG.move.type,
  caret = '|',
  style,
}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((f - at) / perChar)));
  const typing = f >= at && n < text.length;
  return (
    <span style={style}>
      {text.slice(0, n)}
      <span style={{opacity: typing || Math.floor(f / 15) % 2 === 0 ? 1 : 0}}>{f >= at ? caret : ''}</span>
    </span>
  );
};

/** La marca de la llista: un cercle que fa pop i un «✓» que es dibuixa. */
export const Tick: React.FC<{at: number; size: number; color: string; ink: string}> = ({at, size, color, ink}) => {
  const f = useCurrentFrame();
  const p = progress(f, at, MG.move.tick, 'back');
  const draw = progress(f, at + MG.move.tick / 2, MG.move.tick, 'power3');
  const len = 30;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{transform: `scale(${Math.max(0, p)})`, flexShrink: 0}}>
      <circle cx="16" cy="16" r="16" fill={color} />
      <path d="M9 16.5l4.6 4.6L23.5 11" fill="none" stroke={ink} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
    </svg>
  );
};

/** Checklist tick: cada línia entra (rise) i rep la seva marca en el seu fotograma (`items[i].at`). */
export const Checklist: React.FC<{
  items: {text: React.ReactNode; at: number}[];
  size: number;
  color: string;
  ink: string;
  gap?: number;
  style?: React.CSSProperties;
  rowStyle?: React.CSSProperties;
}> = ({items, size, color, ink, gap = size * 0.5, style, rowStyle}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap, ...style}}>
    {items.map((it, i) => (
      <Enter key={i} move="rise" at={it.at - MG.move.tick} style={{display: 'flex', alignItems: 'center', gap: size * 0.45, ...rowStyle}}>
        <Tick at={it.at} size={size} color={color} ink={ink} />
        <span>{it.text}</span>
      </Enter>
    ))}
  </div>
);

/** Bar fill: una barra que s'omple fins a `value` (0–1). */
export const BarFill: React.FC<{
  at: number;
  value: number;
  width: number;
  height: number;
  color: string;
  track: string;
  dur?: number;
  radius?: number;
  border?: string;
}> = ({at, value, width, height, color, track, dur = MG.move.fill, radius = height / 2, border}) => {
  const f = useCurrentFrame();
  const p = progress(f, at, dur, 'power3');
  return (
    <div style={{width, height, borderRadius: radius, background: track, overflow: 'hidden', border, boxSizing: 'border-box'}}>
      <div style={{width: `${value * p * 100}%`, height: '100%', borderRadius: radius, background: color}} />
    </div>
  );
};

/** Punch-in: el pla sencer s'acosta un 15 % de cop i s'hi queda. Embolcalla tot el que s'ha d'acostar. */
export const PunchIn: React.FC<{at: number; scale?: number; dur?: number; origin?: string; children: React.ReactNode}> = ({
  at,
  scale = MG.amount.punch,
  dur = MG.move.punch,
  origin = '50% 45%',
  children,
}) => {
  const f = useCurrentFrame();
  const p = progress(f, at, dur, 'power4');
  return <AbsoluteFill style={{transform: `scale(${1 + scale * p})`, transformOrigin: origin}}>{children}</AbsoluteFill>;
};

/**
 * Reframe: un plafó a pantalla sencera (`panel`, p. ex. una captura o un vídeo) s'encongeix fins a una targeta
 * arrodonida a la meitat de baix mentre a dalt apareix el contingut nou (`children`).
 */
export const Reframe: React.FC<{
  at: number;
  panel: React.ReactNode;
  dur?: number;
  shadow?: string;
  children?: React.ReactNode;
}> = ({at, panel, dur = MG.move.reframe, shadow = '0 30px 80px rgba(0,0,0,0.35)', children}) => {
  const f = useCurrentFrame();
  const p = progress(f, at, dur, 'power4');
  const {scale, y, radius} = MG.amount.reframe;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `translateY(${p * y * 100}%) scale(${1 - (1 - scale) * p})`,
          borderRadius: radius * p / scale,
          overflow: 'hidden',
          boxShadow: p > 0 ? shadow : undefined,
        }}
      >
        {panel}
      </AbsoluteFill>
      {children ? <Enter move="rise" at={at + dur / 2} style={{position: 'absolute', inset: 0}}>{children}</Enter> : null}
    </AbsoluteFill>
  );
};
