import React from 'react';
import {Easing, interpolate} from 'remotion';
import {NIGHT, UNI} from '../../brand/unimatx';
import {POPPINS, clamp} from './base';
import {CAST, Person, type Pose} from './Person';
import {Phone, type Screen} from './Phone';

// Escenes 2D de la sèrie, totes en un llenç de 1080×1920. El text del mòbil en primer pla és l'app real (Phone) o
// pantalles del sistema (avís, missatge, correu…), sempre marcades com a ficció quan imiten un avís.

export type PhoneKind =
  | {k: 'notif'; head: string; body: string; time: string}
  | {k: 'list'; items: string[]; keep: number; strike: boolean}
  | {k: 'likert'; item: string}
  | {k: 'phases'}
  | {k: 'msg'; from: string; text: string}
  | {k: 'inbox'}
  | {k: 'names'}
  | {k: 'oberta'; typed: boolean}
  | {k: 'loading'}
  | {k: 'grades'}
  | {k: 'app'; screen: Screen; blurFirst?: boolean; focusRow?: number};

export type SceneSpec =
  | {s: 'bedroom'; who?: string; pose?: Pose; phoneGlow?: boolean; buzz?: boolean}
  | {s: 'desk'; who: string; screen?: 'laptop' | 'monitor'}
  | {s: 'class'; who?: string; bubbles?: string[]; focus?: string}
  | {s: 'lab'; who: string; pose?: Pose; clock?: string}
  | {s: 'hand'; phone: PhoneKind; sleeve: string}
  | {s: 'monitor'; slots: string[]; cursor?: number; highlight?: number; memory?: boolean}
  | {s: 'face'; who: string; smile?: boolean}
  | {s: 'black'};

const Glow: React.FC<{cx: number; cy: number; r: number; color: string; o: number}> = ({cx, cy, r, color, o}) => (
  <circle cx={cx} cy={cy} r={r} fill={color} opacity={o} style={{filter: `blur(${r * 0.35}px)`, mixBlendMode: 'screen'}} />
);

const NightWindow: React.FC<{x: number; y: number; w: number; h: number; f: number}> = ({x, y, w, h, f}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#0B1230" stroke="#3A4580" strokeWidth={12} />
    <circle cx={x + w * 0.78} cy={y + h * 0.22} r={26} fill="#E9E4D8" />
    {[0.05, 0.28, 0.5, 0.7].map((p, i) => (
      <rect key={i} x={x + w * p} y={y + h * (0.55 - (i % 2) * 0.12)} width={w * 0.18} height={h} fill="#141C44" />
    ))}
    {Array.from({length: 10}, (_, i) => (
      <rect key={i} x={x + w * (0.08 + (i % 5) * 0.18)} y={y + h * (0.62 + Math.floor(i / 5) * 0.14)} width={10} height={14} fill={NIGHT.lamp} opacity={(i * 7) % 3 === 0 ? 0.9 : 0.15 + 0.1 * Math.sin(f / 20 + i)} />
    ))}
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#3A4580" strokeWidth={8} />
  </g>
);

const Clock: React.FC<{x: number; y: number; r?: number; h?: number; m?: number}> = ({x, y, r = 46, h = 11, m = 50}) => {
  const ah = ((h % 12) + m / 60) * 30 * (Math.PI / 180);
  const am = m * 6 * (Math.PI / 180);
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#E9E4D8" stroke="#2A2F4A" strokeWidth={5} />
      <line x1={x} y1={y} x2={x + Math.sin(ah) * r * 0.5} y2={y - Math.cos(ah) * r * 0.5} stroke="#151833" strokeWidth={6} strokeLinecap="round" />
      <line x1={x} y1={y} x2={x + Math.sin(am) * r * 0.78} y2={y - Math.cos(am) * r * 0.78} stroke="#151833" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

const parseClock = (s?: string) => {
  const m = s?.match(/(\d{2}):(\d{2})/);
  return m ? {h: Number(m[1]), m: Number(m[2])} : {h: 11, m: 50};
};

// ---- pantalles del mòbil que no són l'app ----
const SysScreen: React.FC<{p: PhoneKind; f: number}> = ({p, f}) => {
  const base: React.CSSProperties = {position: 'absolute', inset: 0, fontFamily: POPPINS};
  const inP = (d = 0) => interpolate(f, [d, d + 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  switch (p.k) {
    case 'notif':
      return (
        <div style={{...base, background: 'linear-gradient(#1D2A5C, #0E1430)', color: '#fff', display: 'grid', alignContent: 'start', justifyItems: 'center', paddingTop: 120}}>
          <div style={{fontSize: 30, opacity: 0.8}}>dijous</div>
          <div style={{fontSize: 120, fontWeight: 600, lineHeight: 1}}>{p.time}</div>
          <div style={{marginTop: 70, width: '88%', background: 'rgba(255,255,255,0.94)', color: UNI.ink, borderRadius: 26, padding: '20px 22px', opacity: inP(4), transform: `translateY(${(1 - inP(4)) * -40}px)`}}>
            <div style={{fontSize: 20, fontWeight: 700, color: '#C2412D', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 10}}>
              <span style={{width: 14, height: 14, borderRadius: 7, background: '#C2412D'}} />{p.head}
            </div>
            <div style={{fontSize: 30, fontWeight: 600, marginTop: 6, lineHeight: 1.2}}>{p.body}</div>
            <div style={{fontSize: 17, color: UNI.inkSoft, marginTop: 8}}>avís fictici de la sèrie</div>
          </div>
        </div>
      );
    case 'list':
      return (
        <div style={{...base, background: '#FFFDF6', padding: '110px 40px', display: 'grid', alignContent: 'start', gap: 22}}>
          <div style={{fontSize: 26, color: UNI.inkSoft}}>Notes · Carreres</div>
          {p.items.map((it, i) => {
            const s = p.strike && i !== p.keep ? interpolate(f, [4 + i * 5, 12 + i * 5], [0, 1], clamp) : 0;
            return (
              <div key={it} style={{position: 'relative', fontSize: 44, fontWeight: 600, color: i === p.keep && p.strike ? UNI.ink : '#3A3F5C'}}>
                {it}
                <div style={{position: 'absolute', left: -6, top: '52%', height: 6, width: `${s * 105}%`, background: '#C2412D', borderRadius: 3}} />
              </div>
            );
          })}
        </div>
      );
    case 'likert':
      return (
        <div style={{...base, background: '#fff', padding: '110px 34px', display: 'grid', alignContent: 'start', gap: 26}}>
          <div style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.12em', color: UNI.indigo}}>02 · RIASEC</div>
          <div style={{fontSize: 40, fontWeight: 700, color: UNI.ink, lineHeight: 1.1}}>Quant t'agradaria fer aquestes activitats?</div>
          <div key={p.item} style={{fontSize: 32, color: UNI.ink, border: `2px solid ${UNI.line}`, borderRadius: 18, padding: 22, opacity: inP(0)}}>{p.item}</div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            {['Gens', 'Poc', 'Força', 'Molt'].map((t, i) => (
              <div key={t} style={{fontSize: 22, padding: '12px 14px', borderRadius: 12, border: `2px solid ${i === 3 && f > 22 ? UNI.indigo : UNI.line}`, background: i === 3 && f > 22 ? '#F1F0FF' : '#fff', color: UNI.ink}}>{t}</div>
            ))}
          </div>
        </div>
      );
    case 'phases': {
      const steps = ['Context', 'RIASEC', 'Casos', 'Grau', 'Sortides', 'Missió', 'Propostes'];
      const done = interpolate(f, [0, 60], [0, steps.length], clamp);
      return (
        <div style={{...base, background: '#fff', padding: '120px 40px', display: 'grid', alignContent: 'start', gap: 18}}>
          <div style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.12em', color: UNI.indigo}}>EL TEU RECORREGUT</div>
          {steps.map((s, i) => (
            <div key={s} style={{display: 'flex', alignItems: 'center', gap: 18, fontSize: 32, color: UNI.ink}}>
              <span style={{width: 46, height: 46, borderRadius: 23, display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 700, background: i < done ? UNI.indigo : '#EEF0F6', color: i < done ? '#fff' : UNI.inkSoft}}>{i < done - 0.5 ? '✓' : `0${i + 1}`}</span>
              {s}
            </div>
          ))}
        </div>
      );
    }
    case 'msg':
      return (
        <div style={{...base, background: '#E9EDF5', padding: '120px 30px', display: 'grid', alignContent: 'start', gap: 18}}>
          <div style={{fontSize: 28, fontWeight: 700, color: UNI.ink, textAlign: 'center'}}>{p.from}</div>
          <div style={{justifySelf: 'start', maxWidth: '86%', background: '#fff', borderRadius: 24, padding: '18px 22px', fontSize: 34, color: UNI.ink, lineHeight: 1.25, opacity: inP(4), transform: `scale(${0.9 + 0.1 * inP(4)})`, transformOrigin: 'left top'}}>{p.text}</div>
          <div style={{justifySelf: 'start', background: '#fff', borderRadius: 24, padding: '16px 22px', fontSize: 26, color: UNI.indigo, opacity: inP(12)}}>unimatx.cat/test</div>
        </div>
      );
    case 'inbox':
      return (
        <div style={{...base, background: '#fff', padding: '110px 0'}}>
          <div style={{fontSize: 34, fontWeight: 700, color: UNI.ink, padding: '0 30px 18px'}}>Safata d'entrada</div>
          {[
            ['UniMatx', "El teu informe d'orientació", true],
            ['Institut', 'Calendari de proves', false],
            ['Club', "Entrenament de dimarts", false],
          ].map(([a, b, unread], i) => (
            <div key={i} style={{borderTop: `1px solid ${UNI.line}`, padding: '20px 30px', display: 'flex', gap: 16, alignItems: 'center', background: unread ? '#F4F6FF' : '#fff'}}>
              <span style={{width: 16, height: 16, borderRadius: 8, background: unread ? UNI.indigo : 'transparent'}} />
              <div>
                <div style={{fontSize: 28, fontWeight: unread ? 700 : 500, color: UNI.ink}}>{a}</div>
                <div style={{fontSize: 24, color: UNI.inkSoft}}>{b}</div>
              </div>
            </div>
          ))}
        </div>
      );
    case 'names': {
      const N = ['Medicina', 'Dret', 'Enginyeria química', 'Història', 'Física', 'Nutrició', 'Arquitectura', 'Filologia catalana', 'Biotecnologia', 'Infermeria', 'Economia', 'Belles Arts', 'Matemàtiques', 'Turisme', 'Geografia', 'Psicologia', 'Periodisme', 'Veterinària', 'Logopèdia', 'Disseny'];
      return (
        <div style={{...base, background: '#0E1430', overflow: 'hidden'}}>
          {Array.from({length: 40}, (_, i) => {
            const y = ((i * 97 + f * (6 + (i % 4) * 2)) % 1300) - 150;
            return <div key={i} style={{position: 'absolute', left: 30 + ((i * 53) % 300), top: y, fontSize: 26 + (i % 3) * 6, color: '#fff', opacity: 0.25 + (i % 4) * 0.18, whiteSpace: 'nowrap'}}>{N[i % N.length]}</div>;
          })}
          <div style={{position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center', fontSize: 72, fontWeight: 700, color: '#fff', textShadow: '0 4px 20px #0E1430'}}>661 graus</div>
        </div>
      );
    }
    case 'oberta':
      return (
        <div style={{...base, background: '#fff', padding: '110px 32px', display: 'grid', alignContent: 'start', gap: 18}}>
          <div style={{border: `2px solid ${UNI.indigo}`, borderRadius: 18, padding: 18}}>
            <div style={{fontSize: 28, fontWeight: 700, color: UNI.ink}}>Exploració oberta</div>
            <div style={{fontSize: 22, color: UNI.inkSoft, lineHeight: 1.3}}>Explica experiències i dubtes amb les teves paraules.</div>
          </div>
          <div style={{border: `2px solid ${UNI.line}`, borderRadius: 18, padding: 18, minHeight: 200, fontSize: 30, color: UNI.ink, lineHeight: 1.3, filter: p.typed ? 'blur(7px)' : 'none'}}>
            {p.typed ? "M'agrada més arreglar coses que estudiar-les.".slice(0, Math.floor(interpolate(f, [0, 50], [0, 46], clamp))) : ''}
            <span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0}}>|</span>
          </div>
          <div style={{background: '#EEF8F1', border: '1px solid #BFE3CB', borderRadius: 14, padding: 14, fontSize: 19, color: UNI.ink, lineHeight: 1.35}}>
            ☑ Permeto que una eina d'intel·ligència artificial analitzi les meves respostes i m'ajudi a trobar graus que poden encaixar amb mi.
          </div>
        </div>
      );
    case 'loading':
      return (
        <div style={{...base, background: '#fff', display: 'grid', placeItems: 'center', alignContent: 'center', gap: 30, padding: 40}}>
          <svg width={160} height={160} viewBox="0 0 100 100">
            <circle cx={50} cy={50} r={40} fill="none" stroke="#EEF0F6" strokeWidth={10} />
            <circle cx={50} cy={50} r={40} fill="none" stroke={UNI.indigo} strokeWidth={10} strokeDasharray="70 200" transform={`rotate(${f * 9} 50 50)`} strokeLinecap="round" />
          </svg>
          <div style={{fontSize: 34, fontWeight: 700, color: UNI.ink, textAlign: 'center'}}>Comparant 661 graus</div>
          <div style={{fontSize: 26, color: UNI.inkSoft, textAlign: 'center'}}>assignatura per assignatura</div>
        </div>
      );
    case 'grades':
      return (
        <div style={{...base, background: '#FFFDF6', padding: '110px 36px', display: 'grid', alignContent: 'start', gap: 12}}>
          <div style={{fontSize: 30, fontWeight: 700, color: UNI.ink}}>Butlletí · 2n de batxillerat</div>
          {[
            ['Química', '9,5'],
            ['Matemàtiques', '7,8'],
            ['Física', '7,1'],
            ['Llengua catalana', '7,4'],
            ['Anglès', '8,0'],
          ].map(([a, b], i) => (
            <div key={a} style={{display: 'flex', justifyContent: 'space-between', fontSize: 34, padding: '10px 14px', borderRadius: 10, color: UNI.ink, background: i === 0 && f > 20 ? '#FFE9A8' : 'transparent'}}>
              <span>{a}</span><b>{b}</b>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
};

const HandPhone: React.FC<{p: PhoneKind; f: number; sleeve: string}> = ({p, f, sleeve}) => {
  if (p.k === 'app') {
    return (
      <>
        <div style={{position: 'absolute', left: 250, top: 300, transform: 'scale(1.35)', transformOrigin: 'left top', filter: 'none'}}>
          <Phone screen={p.screen} since={0} inP={1} style={{left: 0, top: 0, position: 'relative'}} />
          {p.blurFirst && <div style={{position: 'absolute', left: 30, top: 192, width: 370, height: 78, backdropFilter: 'blur(9px)', background: 'rgba(255,255,255,0.3)', borderRadius: 16}} />}
          {p.focusRow !== undefined && <div style={{position: 'absolute', left: 30, top: 282 + p.focusRow * 70, width: 370, height: 74, border: `4px solid ${UNI.bad}`, borderRadius: 12, opacity: interpolate(f, [8, 16], [0, 1], clamp)}} />}
        </div>
        <Hand sleeve={sleeve} />
      </>
    );
  }
  return (
    <>
      <div style={{position: 'absolute', left: 250, top: 300, width: 580, height: 1188, borderRadius: 78, background: '#111320', padding: 18, boxShadow: '0 40px 90px rgba(0,0,0,0.55)'}}>
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 62, overflow: 'hidden'}}>
          <SysScreen p={p} f={f} />
          <div style={{position: 'absolute', top: 16, left: '50%', width: 150, height: 38, marginLeft: -75, borderRadius: 20, background: '#111320'}} />
        </div>
      </div>
      <Hand sleeve={sleeve} />
    </>
  );
};

const Hand: React.FC<{sleeve: string}> = ({sleeve}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {[0, 1, 2].map((i) => <rect key={i} x={800} y={930 + i * 92} width={70} height={78} rx={36} fill="#E0AC88" />)}
    <path d="M330 1920 L318 1360 Q320 1268 400 1256 L700 1256 Q790 1268 800 1360 L820 1920 Z" fill="#E8B796" />
    <ellipse cx={300} cy={1250} rx={46} ry={110} fill="#E8B796" transform="rotate(-28 300 1250)" />
    <path d="M300 1920 L330 1640 L800 1640 L840 1920 Z" fill={sleeve} />
  </svg>
);

export const Scene: React.FC<{spec: SceneSpec; f: number}> = ({spec, f}) => {
  switch (spec.s) {
    case 'bedroom': {
      const who = spec.who ? CAST[spec.who] : null;
      const buzz = spec.buzz ? Math.sin(f * 2.2) * 4 * (Math.floor(f / 10) % 3 === 0 ? 1 : 0) : 0;
      return (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <rect width={1080} height={1920} fill={NIGHT.wall} />
          <rect y={1260} width={1080} height={660} fill={NIGHT.floor} />
          <NightWindow x={600} y={420} w={380} h={420} f={f} />
          <rect x={60} y={1010} width={600} height={220} rx={20} fill="#3A2A44" />
          <rect x={60} y={960} width={600} height={90} rx={30} fill="#5A6496" />
          <rect x={80} y={910} width={170} height={80} rx={30} fill="#C9CCE0" />
          <rect x={300} y={980} width={360} height={140} rx={24} fill="#7A3B4A" />
          <rect x={720} y={1050} width={220} height={210} rx={12} fill="#4E3524" />
          <rect x={720} y={1030} width={220} height={30} rx={8} fill="#6B4A32" />
          {!who && (
            <g transform={`translate(${buzz} 0)`}>
              <rect x={790} y={1004} width={80} height={30} rx={8} fill="#111320" />
              {spec.phoneGlow && <rect x={796} y={1008} width={68} height={22} rx={5} fill={NIGHT.screen} />}
            </g>
          )}
          {spec.phoneGlow && !who && <Glow cx={830} cy={1000} r={220} color={NIGHT.screen} o={0.5} />}
          {who && <Person look={who} pose={spec.pose ?? 'phone'} x={420} y={1300} s={1.05} lit={spec.phoneGlow ? 1 : 0} />}
          {who && spec.phoneGlow && <Glow cx={420} cy={900} r={160} color={NIGHT.screen} o={0.22} />}
          <rect width={1080} height={1920} fill="#0A1030" opacity={0.28} />
        </svg>
      );
    }
    case 'desk': {
      const who = CAST[spec.who];
      return (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <rect width={1080} height={1920} fill={NIGHT.wall} />
          <rect y={1260} width={1080} height={660} fill={NIGHT.floor} />
          <NightWindow x={660} y={380} w={340} h={400} f={f} />
          <Clock x={200} y={460} />
          <Person look={who} pose="sit" x={540} y={1380} s={1} lit={1} />
          <rect x={90} y={1060} width={900} height={40} rx={8} fill="#6B4A32" />
          <rect x={130} y={1100} width={30} height={200} fill="#4E3524" />
          <rect x={920} y={1100} width={30} height={200} fill="#4E3524" />
          {spec.screen === 'monitor' ? (
            <g>
              <rect x={350} y={900} width={380} height={160} rx={14} fill="#1C2238" />
              <rect x={520} y={1060} width={40} height={20} fill="#1C2238" />
            </g>
          ) : (
            <g>
              <polygon points="400,1060 680,1060 710,1076 370,1076" fill="#2A3150" />
              <rect x={420} y={930} width={240} height={130} rx={10} fill="#1C2238" />
            </g>
          )}
          <Glow cx={540} cy={1000} r={200} color={NIGHT.screen} o={0.22} />
          <rect width={1080} height={1920} fill="#0A1030" opacity={0.22} />
        </svg>
      );
    }
    case 'class': {
      const kids = ['a', 'b', spec.who ?? 'c', 'd', 'c', 'a'];
      return (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <rect width={1080} height={1920} fill="#2C3A6E" />
          <rect y={1180} width={1080} height={740} fill="#202A52" />
          <rect x={300} y={330} width={700} height={400} rx={10} fill="#E9ECF2" stroke="#8A6A4A" strokeWidth={14} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={350} y={400 + i * 70} width={i === 3 ? 300 : 560} height={14} rx={7} fill="#9AA3C0" />)}
          <Person look={CAST.tutora} pose="point" x={190} y={1180} s={0.92} />
          {kids.map((k, i) => {
            const x = 150 + (i % 3) * 390;
            const y = 1530 + Math.floor(i / 3) * 260;
            const isFocus = spec.focus && i === 2;
            return (
              <g key={i} opacity={spec.focus && !isFocus ? 0.45 : 1}>
                {isFocus && <circle cx={x} cy={y - 60} r={110} fill="none" stroke="#FFD23F" strokeWidth={8} />}
                <Person look={CAST[k]} pose="back" x={x} y={y + 380} s={0.8} />
              </g>
            );
          })}
          <rect width={1080} height={1920} fill="#0A1030" opacity={0.18} />
        </svg>
      );
    }
    case 'lab': {
      const {h, m} = parseClock(spec.clock);
      return (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <rect width={1080} height={1920} fill="#3A5A86" />
          <rect y={1200} width={1080} height={720} fill="#2A4268" />
          {[0, 1].map((r) => (
            <g key={r}>
              <rect x={80} y={380 + r * 170} width={520} height={14} fill="#C9D6E8" />
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i}>
                  <rect x={110 + i * 100} y={300 + r * 170} width={40} height={80} rx={8} fill={['#6EE7A0', '#FFD27A', '#BFE3FF', '#F2A3B3', '#C9B8FF'][(i + r) % 5]} opacity={0.85} />
                  <rect x={120 + i * 100} y={280 + r * 170} width={20} height={24} fill="#E9ECF2" />
                </g>
              ))}
            </g>
          ))}
          <Clock x={860} y={420} r={70} h={h} m={m} />
          <Person look={{...CAST.a, coat: true}} pose="stand" x={180} y={1250} s={0.78} />
          <Person look={{...CAST.b, coat: true}} pose="stand" x={900} y={1250} s={0.78} />
          <Person look={{...CAST[spec.who], coat: true}} pose={spec.pose ?? 'stand'} x={540} y={1330} s={0.95} lit={spec.pose === 'phone' ? 1 : 0} />
          <rect x={40} y={1090} width={1000} height={60} rx={8} fill="#DDE3EC" />
          <rect x={60} y={1150} width={960} height={260} fill="#9FAEC4" />
          {[200, 420, 650, 860].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 1090 L${x - 30} 1010 L${x + 30} 1010 Z`} fill={['#6EE7A0', '#BFE3FF', '#FFD27A', '#F2A3B3'][i]} opacity={0.9} />
              <rect x={x - 10} y={960} width={20} height={52} fill="#E9ECF2" />
            </g>
          ))}
          <rect width={1080} height={1920} fill="#0A1030" opacity={0.12} />
        </svg>
      );
    }
    case 'hand':
      return (
        <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%, #1E2A5E, ${NIGHT.bg} 70%)`}}>
          <HandPhone p={spec.phone} f={f} sleeve={spec.sleeve} />
        </div>
      );
    case 'monitor': {
      return (
        <div style={{position: 'absolute', inset: 0, background: NIGHT.bg, filter: spec.memory ? 'saturate(0.6) brightness(0.9)' : 'none'}}>
          <div style={{position: 'absolute', left: 70, top: 300, width: 940, height: 1040, borderRadius: 24, background: '#1C2238', padding: 22, boxShadow: '0 0 160px rgba(191,227,255,0.25)'}}>
            <div style={{width: '100%', height: '100%', borderRadius: 12, background: '#F6F7FB', padding: '34px 36px', fontFamily: POPPINS, display: 'grid', alignContent: 'start', gap: 14}}>
              <div style={{fontSize: 30, fontWeight: 700, color: UNI.ink}}>Preinscripció universitària</div>
              <div style={{fontSize: 22, color: UNI.inkSoft}}>Ordena les teves preferències</div>
              {spec.slots.map((v, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <span style={{width: 44, fontSize: 26, fontWeight: 700, color: UNI.inkSoft}}>{i + 1}</span>
                  <div style={{flex: 1, height: 74, borderRadius: 10, border: spec.highlight === i ? `4px solid ${UNI.bad}` : spec.cursor === i ? `3px solid ${UNI.indigo}` : `2px ${v ? 'solid' : 'dashed'} #C3C7D6`, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 28, color: UNI.ink}}>
                    {v}
                    {spec.cursor === i && <span style={{marginLeft: 2, width: 3, height: 36, background: UNI.ink, opacity: Math.floor(f / 12) % 2 ? 1 : 0}} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case 'face': {
      const who = CAST[spec.who];
      return (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <rect width={1080} height={1920} fill={NIGHT.bg} />
          <Person look={who} pose="stand" x={540} y={2700} s={3.3} smile={spec.smile} />
          <Glow cx={540} cy={1620} r={300} color={NIGHT.screen} o={0.18} />
        </svg>
      );
    }
    case 'black':
      return <div style={{position: 'absolute', inset: 0, background: '#000'}} />;
  }
};
