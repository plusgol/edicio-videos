import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {MgStyle} from '../../brand/mg';

// El fons de cada estil: color o degradat (Pop Bold canvia de color a cada pantalla), taques de color que es mouen a
// poc a poc (Liquid Glass), gra de pel·lícula animat (Editorial Grain) i adhesius que giren (Pop Bold). Tot el que és
// decoració porta la classe mg-deco perquè el pas de QA (scripts/fabrica/qa.py) l'amagui.

export const bgOf = (s: MgStyle, screen: number) => (Array.isArray(s.bg) ? s.bg[screen % s.bg.length] : s.bg);

const Blobs: React.FC<{colors: string[]; w: number; h: number}> = ({colors, w, h}) => {
  const f = useCurrentFrame();
  const r = Math.max(w, h) * 0.38;
  return (
    <AbsoluteFill className="mg-deco" style={{overflow: 'hidden'}}>
      {colors.map((c, i) => {
        const a = f / 140 + i * 2.1;
        const x = w * (0.2 + 0.6 * ((i * 0.37) % 1)) + Math.cos(a) * w * 0.12;
        const y = h * (0.18 + 0.32 * i) + Math.sin(a * 1.3) * h * 0.06;
        return (
          <div key={i} style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: c, opacity: 0.55, filter: `blur(${r * 0.35}px)`}} />
        );
      })}
    </AbsoluteFill>
  );
};

const Grain: React.FC<{opacity: number}> = ({opacity}) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2); // el gra canvia cada dos fotogrames, com el de debò
  return (
    <AbsoluteFill className="mg-deco" style={{opacity, mixBlendMode: 'multiply', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

const Star: React.FC<{size: number; color: string; ink: string}> = ({size, color, ink}) => {
  const pts = Array.from({length: 16}, (_, i) => {
    const r = i % 2 ? 0.42 : 1;
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    return `${50 + 48 * r * Math.cos(a)},${50 + 48 * r * Math.sin(a)}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points={pts} fill={color} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
};

/** Adhesius de l'estil Pop Bold: una estrella i un cercle que giren tota l'estona, fora de la zona del text (a dalt a
 *  la dreta i a baix a l'esquerra, on en un Reel només hi ha interfície). */
const Stickers: React.FC<{s: MgStyle; screen: number; w: number; h: number}> = ({s, screen, w, h}) => {
  const f = useCurrentFrame();
  const cols = Array.isArray(s.bg) ? s.bg : [s.accent];
  const other = (k: number) => cols[(screen + k) % cols.length];
  const size = Math.min(w, h) * 0.15;
  return (
    <AbsoluteFill className="mg-deco">
      <div style={{position: 'absolute', right: w * 0.04, top: h * 0.035, transform: `rotate(${f * 0.9}deg)`}}>
        <Star size={size} color={other(1)} ink={s.text} />
      </div>
      <div
        style={{
          position: 'absolute', left: w * 0.06, bottom: h * 0.05, width: size * 0.8, height: size * 0.8, borderRadius: '50%',
          background: other(2), border: `4px solid ${s.text}`, boxShadow: `6px 6px 0 ${s.text}`, transform: `rotate(${-f * 0.6}deg)`,
          display: 'grid', placeItems: 'center',
        }}
      >
        <div style={{width: '30%', height: '30%', borderRadius: '50%', background: s.text}} />
      </div>
    </AbsoluteFill>
  );
};

export const Backdrop: React.FC<{s: MgStyle; screen?: number; w: number; h: number; qa?: boolean}> = ({s, screen = 0, w, h, qa}) => (
  <AbsoluteFill style={{background: qa ? '#000' : bgOf(s, screen)}}>
    {!qa && s.blobs ? <Blobs colors={s.blobs} w={w} h={h} /> : null}
    {!qa && s.layout === 'pop' ? <Stickers s={s} screen={screen} w={w} h={h} /> : null}
  </AbsoluteFill>
);

/** El gra va a sobre de tot (també del text), com en una pàgina impresa. */
export const GrainLayer: React.FC<{s: MgStyle; qa?: boolean}> = ({s, qa}) => (!qa && s.grain ? <Grain opacity={s.grain} /> : null);
