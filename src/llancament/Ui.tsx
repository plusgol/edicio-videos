import {loadFont} from '@remotion/google-fonts/Poppins';
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {LAUNCH, WEB} from '../../brand/unimatx';
import {UniMark, clamp} from '../unimatx/base';

// Peces de la interfície d'UniMatx refetes en HTML a partir de la web i de la gravació del test (demo per a centres).
// Tot viu en un espai de disseny de 1920×1080: la càmera del kit hi fa plans tancats i el text continua nítid.

export const {fontFamily: POP} = loadFont('normal', {weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin', 'latin-ext']});

export const easeIn = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
export const pop = (f: number, a: number, d = 10) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});

// Entrada d'una pantalla nova: puja una mica i apareix (com el pas de pregunta a pregunta del test).
export const Enter: React.FC<{f: number; at?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at = 0, children, style}) => {
  const p = easeIn(f, at, at + LAUNCH.enter);
  return <div style={{...style, opacity: p, transform: `translateY(${(1 - p) * 36}px)`}}>{children}</div>;
};

export const Logo: React.FC<{size?: number; light?: boolean}> = ({size = 46, light = false}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.28}}>
    <div style={{borderRadius: size * 0.24, boxShadow: '0 4px 14px rgba(20,24,60,0.12)'}}>
      <UniMark size={size} />
    </div>
    <div style={{fontFamily: POP, fontWeight: 900, fontSize: size * 0.62, letterSpacing: '-0.02em', lineHeight: 1}}>
      <span style={{color: light ? '#FFFFFF' : WEB.ink}}>Uni</span>
      <span style={{color: light ? WEB.mint : WEB.blue}}>Matx</span>
    </div>
  </div>
);

const STEPS = ['Context', 'RIASEC', 'Casos', 'Grau', 'Sortides', 'Missió', 'Propostes', 'Resultats'];

// Capçalera del test: logo, «EL TEU RECORREGUT» i la barra de fases. La comparteixen totes les pantalles del test
// (regla del kit: mateixa interfície a banda i banda d'un tall, mateix component).
export const AppFrame: React.FC<{step: number; children: React.ReactNode}> = ({step, children}) => (
  <div style={{position: 'absolute', inset: 0, background: WEB.page, fontFamily: POP, color: WEB.ink}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 150, background: '#fff', borderBottom: `1px solid ${WEB.line}`}}>
      <div style={{position: 'absolute', left: 120, top: 26, display: 'flex', alignItems: 'center', gap: 26}}>
        <Logo size={44} />
        <div style={{fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: WEB.inkSoft}}>EL TEU RECORREGUT</div>
      </div>
      <div style={{position: 'absolute', right: 120, top: 32, fontSize: 15, fontWeight: 600, color: WEB.inkSoft, border: `1px solid ${WEB.line}`, borderRadius: 999, padding: '8px 18px'}}>Surt del test ↗</div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 98, display: 'flex', gap: 34}}>
        {STEPS.map((s, i) => {
          const on = i === step;
          const done = i < step;
          return (
            <div key={s} style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: on ? 700 : 500, color: on ? WEB.blue : done ? WEB.ink : '#9AA1AD'}}>
              <div style={{width: 30, height: 30, borderRadius: 15, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, background: on ? WEB.blue : done ? '#DCE6FB' : '#EEF1F6', color: on ? '#fff' : done ? WEB.blue : '#9AA1AD'}}>
                {done ? '✓' : String(i).padStart(2, '0')}
              </div>
              {s}
            </div>
          );
        })}
      </div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, bottom: 0}}>{children}</div>
  </div>
);

export const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = WEB.blue}) => (
  <div style={{fontSize: 15, fontWeight: 800, letterSpacing: '0.12em', color, textTransform: 'uppercase'}}>{children}</div>
);

// Opció de resposta amb lletra (A, B, C…), tal com al test.
export const Option: React.FC<{letter: string; text: string; on?: boolean; hover?: boolean; w?: number}> = ({letter, text, on, hover, w = 560}) => (
  <div
    style={{
      width: w,
      minHeight: 92,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: '18px 24px',
      borderRadius: 18,
      background: on ? '#EEF4FF' : '#fff',
      border: `2px solid ${on ? WEB.blue : hover ? '#B9C9F2' : WEB.line}`,
      boxShadow: on ? '0 10px 30px rgba(17,110,238,0.16)' : '0 2px 6px rgba(20,24,60,0.04)',
      fontSize: 23,
      fontWeight: 500,
      lineHeight: 1.3,
    }}
  >
    <div style={{flex: 'none', width: 34, height: 34, borderRadius: 17, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 800, background: on ? WEB.blue : '#EEF1F6', color: on ? '#fff' : WEB.inkSoft}}>{letter}</div>
    {text}
  </div>
);

export const Button: React.FC<{children: React.ReactNode; dark?: boolean; size?: number}> = ({children, dark, size = 22}) => (
  <div style={{display: 'inline-block', padding: `${size * 0.7}px ${size * 1.5}px`, borderRadius: 999, background: dark ? WEB.purple : WEB.mint, color: dark ? '#fff' : WEB.mintInk, fontFamily: POP, fontWeight: 800, fontSize: size, boxShadow: dark ? 'none' : '0 10px 28px rgba(17,238,146,0.28)'}}>
    {children}
  </div>
);

export const Chip: React.FC<{children: React.ReactNode; color?: string; bg?: string; size?: number}> = ({children, color = '#fff', bg = 'rgba(255,255,255,0.12)', size = 17}) => (
  <div style={{display: 'inline-block', padding: `${size * 0.45}px ${size * 1}px`, borderRadius: 999, background: bg, border: `1px solid ${color === '#fff' ? 'rgba(255,255,255,0.35)' : color}`, color, fontSize: size, fontWeight: 600}}>{children}</div>
);

// Targeta lila que obre cada fase del test, amb la pàgina difuminada al darrere.
export const PhaseCard: React.FC<{f: number; n: string; title: string; q: string; body: string; chips: string[]}> = ({f, n, title, q, body, chips}) => {
  const p = pop(f, 0, 12);
  return (
    <div style={{position: 'absolute', inset: 0, background: 'rgba(242,247,253,0.55)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', fontFamily: POP}}>
      <div style={{width: 1000, padding: '64px 80px 56px', borderRadius: 40, background: WEB.phase, color: '#fff', textAlign: 'center', transform: `scale(${0.85 + 0.15 * p})`, opacity: Math.min(1, p * 1.4), boxShadow: '0 40px 90px rgba(59,30,144,0.35)'}}>
        <div style={{margin: '0 auto', width: 112, height: 112, borderRadius: 56, border: '2px solid rgba(255,255,255,0.25)', display: 'grid', placeItems: 'center'}}>
          <div style={{width: 80, height: 80, borderRadius: 40, background: WEB.mint, color: WEB.mintInk, display: 'grid', placeItems: 'center', fontSize: 32, fontWeight: 800}}>{n}</div>
        </div>
        <div style={{marginTop: 22, fontSize: 18, fontWeight: 800, letterSpacing: '0.24em', color: WEB.mint}}>FASE {Number(n)}</div>
        <div style={{marginTop: 6, fontSize: 84, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05}}>{title}</div>
        <div style={{marginTop: 14, fontSize: 30, fontWeight: 600}}>{q}</div>
        <div style={{margin: '18px auto 0', maxWidth: 760, fontSize: 20, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)'}}>{body}</div>
        <div style={{marginTop: 26, display: 'flex', gap: 12, justifyContent: 'center'}}>
          {chips.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>
        <div style={{marginTop: 30}}>
          <Button>Comença ara</Button>
        </div>
      </div>
    </div>
  );
};

// Cursor amb clic: es mou d'un punt a l'altre i fa una ona quan clica. Viu dins l'espai de disseny i compensa
// l'escala de la càmera perquè no creixi amb el zoom (README del kit).
export type CursorKey = {at: number; x: number; y: number; click?: boolean};
export const Cursor: React.FC<{f: number; keys: CursorKey[]; camScale: number}> = ({f, keys, camScale}) => {
  if (!keys.length || f < keys[0].at - 12) return null;
  let i = 0;
  while (i + 1 < keys.length && f >= keys[i + 1].at - 14) i++;
  const k = keys[i];
  const prev = keys[Math.max(0, i - 1)];
  const m = i === 0 ? 1 : interpolate(f, [k.at - 14, k.at - 2], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const x = prev.x + (k.x - prev.x) * m;
  const y = prev.y + (k.y - prev.y) * m;
  // Apareix abans del primer punt i se'n va quan ja ha fet la feina.
  const last = keys[keys.length - 1].at;
  const fade = easeIn(f, keys[0].at - 12, keys[0].at - 4) * (1 - easeIn(f, last + 24, last + 32));
  const lastClick = [...keys].reverse().find((c) => c.click && f >= c.at);
  const r = lastClick ? interpolate(f - lastClick.at, [0, 12], [0, 1], clamp) : 1;
  const press = lastClick && f - lastClick.at < 5 ? 0.85 : 1;
  const s = 1 / camScale;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: fade, pointerEvents: 'none', zIndex: 50}}>
      {r < 1 && <div style={{position: 'absolute', left: -40 * s, top: -40 * s, width: 80 * s, height: 80 * s, borderRadius: '50%', border: `${3 * s}px solid ${WEB.blue}`, opacity: 1 - r, transform: `scale(${0.3 + r})`}} />}
      <svg width={LAUNCH.cursor * s} height={LAUNCH.cursor * s} viewBox="0 0 24 24" style={{transform: `scale(${press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))'}}>
        <path d="M3 2 L3 19 L7.5 15 L10.5 22 L13.5 20.7 L10.6 14 L17 14 Z" fill="#fff" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// Fons de la portada: degradat de la marca amb noms de graus que suren, com a la web.
const FLOAT = ['Psicologia', 'Enginyeria', 'Dret', 'Disseny', 'Medicina', 'Física', 'Belles Arts', 'Turisme', 'Economia', 'Química', 'Comunicació', 'Ciència de dades'];
export const HeroBg: React.FC<{f: number; words?: boolean}> = ({f, words = true}) => (
  <div style={{position: 'absolute', inset: 0, background: WEB.gradient, overflow: 'hidden', fontFamily: POP}}>
    {words &&
      FLOAT.map((w, i) => {
        const row = i % 4;
        const x = ((i * 433 + f * (0.6 + row * 0.15)) % 2400) - 300;
        return (
          <div key={w} style={{position: 'absolute', left: x, top: 120 + row * 230 + (i % 3) * 30, transform: `rotate(${-6 + (i % 3) * 3}deg)`, fontSize: 64, fontWeight: 800, color: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.06)', borderRadius: 999, padding: '4px 30px', whiteSpace: 'nowrap'}}>
            {w}
          </div>
        );
      })}
  </div>
);
