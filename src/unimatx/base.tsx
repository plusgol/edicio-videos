import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadJakarta} from '@remotion/google-fonts/PlusJakartaSans';
import {loadFont as loadPoppins} from '@remotion/google-fonts/Poppins';
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {UNI} from '../../brand/unimatx';

export const {fontFamily: JAKARTA} = loadJakarta('normal', {weights: ['700', '800'], subsets: ['latin', 'latin-ext']});
export const {fontFamily: POPPINS} = loadPoppins('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin', 'latin-ext']});
export const {fontFamily: ANTON} = loadAnton('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

export type Word = {text: string; start: number; end: number};
export type BeatTiming = {start: number; end: number; words: Word[]};
export type Timing = {duration: number; beats: BeatTiming[]};
export type Beat = {visual: string; veu: string; text: string};
export type Guio = {code: string; kind: 'ab' | 'serie'; title: string; cta?: string | null; beats: Beat[]};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ease = (f: number, a: number, b: number, from = 0, to = 1, e = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing: e});

// «Mateix **institut**» → trossos amb la paraula clau marcada.
export const parseMarks = (s: string) =>
  s.split(/(\*\*.+?\*\*)/).filter(Boolean).map((p) => ({text: p.replace(/\*\*/g, ''), mark: p.startsWith('**')}));

// Índex del beat que sona al segon t (el beat dura fins que comença el següent).
export const beatAt = (beats: BeatTiming[], t: number) => {
  let i = 0;
  for (let k = 0; k < beats.length; k++) if (t >= beats[k].start - 0.08) i = k;
  return i;
};

// Logotip d'UniMatx refet en vectors a partir de la web (icona del birret amb ulleres + «Uni» fosc i «Matx» blau).
export const UniLogo: React.FC<{size?: number; dark?: boolean}> = ({size = 120, dark = false}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.28}}>
    <UniMark size={size} />
    <div style={{fontFamily: POPPINS, fontWeight: 700, fontSize: size * 0.72, letterSpacing: '-0.02em', lineHeight: 1}}>
      <span style={{color: dark ? '#FFFFFF' : '#1F2128'}}>Uni</span>
      <span style={{color: '#4A6CF0'}}>Matx</span>
    </div>
  </div>
);

// Només la icona (el birret amb ulleres), per al logotip de la web al vídeo de presentació.
export const UniMark: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x="2" y="2" width="96" height="96" rx="24" fill="#FAFBF4" stroke="#E6E8EE" strokeWidth="1.5" />
    <polygon points="14,36 50,22 86,36 50,50" fill="#16235A" />
    <path d="M30 42 L30 52 Q50 60 70 52 L70 42 L50 50 Z" fill="#16235A" />
    <line x1="80" y1="38" x2="80" y2="56" stroke="#5FA89A" strokeWidth="2.5" />
    <polygon points="77,56 83,56 82,63 78,63" fill="#5FA89A" />
    <circle cx="35" cy="70" r="11" fill="none" stroke="#16235A" strokeWidth="4.5" />
    <circle cx="65" cy="70" r="11" fill="none" stroke="#16235A" strokeWidth="4.5" />
    <path d="M46 69 Q50 65 54 69" fill="none" stroke="#16235A" strokeWidth="4" />
    <line x1="16" y1="67" x2="24" y2="68" stroke="#5FA89A" strokeWidth="4" />
    <line x1="76" y1="68" x2="84" y2="67" stroke="#5FA89A" strokeWidth="4" />
  </svg>
);

export const Pill: React.FC<{children: React.ReactNode; p?: number}> = ({children, p = 1}) => (
  <span
    style={{
      position: 'relative',
      display: 'inline-block',
      padding: '0 0.14em',
      margin: '0 0.02em 0 0',
      color: UNI.mintInk,
    }}
  >
    <span
      style={{
        position: 'absolute',
        inset: '0.06em 0',
        borderRadius: '0.22em',
        background: `linear-gradient(90deg, ${UNI.mint}, #4FD1C5)`,
        transform: `scaleX(${p})`,
        transformOrigin: 'left center',
      }}
    />
    <span style={{position: 'relative'}}>{children}</span>
  </span>
);
