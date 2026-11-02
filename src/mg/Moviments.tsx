import React from 'react';
import {AbsoluteFill, Audio, Sequence, useCurrentFrame} from 'remotion';
import {MG, STYLES, type MgStyle, type SfxName} from '../../brand/mg';
import {Backdrop, GrainLayer} from './Backdrop';
import {family} from './fonts';
import {BarFill, Checklist, CountUp, Enter, PunchIn, Reframe, Typewriter, type MoveName} from './moves';
import {SFX} from './sfx';

// Catàleg dels 10 moviments (l'equivalent del PROMPT 03 de la guia de Damiano), en qualsevol estil:
// npx remotion render src/index.ts MGMoviments out.mp4 --props='{"style":"pop"}'
// Serveix per ensenyar el vocabulari («fes-hi un pop», «que entri amb blur») i per comprovar la biblioteca.

export const MOV = {width: 1080, height: 1920, fps: 30, each: 42};

type Seg = {name: string; es: string; sfx?: SfxName; sfxAt?: number};
const SEGS: Seg[] = [
  {name: 'Rise', es: 'entra subiendo'},
  {name: 'Pop', es: 'crece con rebote', sfx: 'pop', sfxAt: 6},
  {name: 'Count-up', es: 'el número rueda', sfx: 'counter', sfxAt: 6},
  {name: 'Checklist', es: 'una marca tras otra', sfx: 'tick'},
  {name: 'Typewriter', es: 'se escribe sola'},
  {name: 'Slide-in', es: 'entra de lado'},
  {name: 'Blur-in', es: 'de borroso a nítido'},
  {name: 'Punch-in', es: 'el plano se acerca', sfx: 'snap', sfxAt: 10},
  {name: 'Reframe', es: 'la pantalla se encoge'},
  {name: 'Bar fill', es: 'la barra se llena', sfx: 'fill', sfxAt: 6},
];
const TICKS = [8, 16, 24];

export type MovProps = {style: string};

const Card: React.FC<{s: MgStyle; children?: React.ReactNode; w?: number; h?: number}> = ({s, children, w = 640, h = 380}) => {
  const c = s.card ?? {bg: s.text, border: 'none', shadow: 'none', radius: 28};
  return (
    <div
      style={{
        width: w, height: h, background: c.bg, border: c.border, boxShadow: c.shadow, borderRadius: c.radius,
        backdropFilter: s.layout === 'glass' ? 'blur(30px)' : undefined, display: 'grid', placeItems: 'center',
        color: s.card ? s.text : (Array.isArray(s.bg) ? s.bg[0] : s.bg), fontFamily: family(s.font.head), fontWeight: s.weight.head,
        fontSize: 64, boxSizing: 'border-box', padding: 40, textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
};

const Segment: React.FC<{i: number; s: MgStyle}> = ({i, s}) => {
  const f = useCurrentFrame();
  const at = 4;
  const ink = s.card ? s.text : (Array.isArray(s.bg) ? s.bg[0] : s.bg);
  const moves: Record<number, MoveName> = {0: 'rise', 1: 'pop', 5: 'slide', 6: 'blur'};
  const body = (() => {
    switch (i) {
      case 2:
        return <Card s={s}><CountUp at={at + 2} to={500} dur={MOV.each - 12} style={{fontSize: 150}} /></Card>;
      case 3:
        return (
          <Card s={s}>
            <Checklist size={56} color={s.tick} ink={s.tickInk} items={['Guion', 'Voz', 'Render'].map((t, k) => ({text: t, at: TICKS[k]}))}
              style={{alignItems: 'flex-start', fontSize: 54}} />
          </Card>
        );
      case 4:
        return <Card s={s}><Typewriter at={at} text="Una frase que se escribe sola." style={{fontSize: 56}} /></Card>;
      case 7:
        return <PunchIn at={at + 6}><AbsoluteFill style={{display: 'grid', placeItems: 'center'}}><Card s={s}>Punch-in</Card></AbsoluteFill></PunchIn>;
      case 8:
        return (
          <Reframe
            at={at + 4}
            panel={<AbsoluteFill style={{background: s.text, display: 'grid', placeItems: 'center', color: ink, fontFamily: family(s.font.head), fontSize: 90}}>Pantalla</AbsoluteFill>}
          >
            <AbsoluteFill style={{display: 'grid', placeItems: 'start center', paddingTop: MG.safe.vertical.y0 + 120}}>
              <Card s={s} w={560} h={220}>Lo nuevo</Card>
            </AbsoluteFill>
          </Reframe>
        );
      case 9:
        return <Card s={s}><BarFill at={at + 2} value={1} width={520} height={44} color={s.tick} track={`${ink}22`} /></Card>;
      default:
        return (
          <Enter move={moves[i]} at={at} ease={i === 1 ? 'back' : 'power3'} width={MOV.width}>
            <Card s={s}>{SEGS[i].name}</Card>
          </Enter>
        );
    }
  })();
  const full = i === 7 || i === 8;
  return (
    <AbsoluteFill>
      {full ? body : <AbsoluteFill style={{display: 'grid', placeItems: 'center', paddingBottom: MOV.height - MG.safe.vertical.y1 - MG.safe.vertical.y0}}>{body}</AbsoluteFill>}
      <div
        style={{
          position: 'absolute', top: MG.safe.vertical.y0, left: MG.safe.vertical.x0, right: MOV.width - MG.safe.vertical.x1,
          textAlign: 'center', color: s.layout === 'pop' ? s.text : s.sub, fontFamily: family(s.font.label), fontSize: 34,
          letterSpacing: '0.08em', textTransform: 'uppercase', opacity: Math.min(1, f / 4),
        }}
      >
        {String(i + 1).padStart(2, '0')} · {SEGS[i].name} · {SEGS[i].es}
      </div>
    </AbsoluteFill>
  );
};

export const Moviments: React.FC<MovProps> = ({style}) => {
  const s = STYLES[style] ?? STYLES.glass;
  return (
    <AbsoluteFill>
      {SEGS.map((seg, i) => (
        <Sequence key={i} from={i * MOV.each} durationInFrames={MOV.each}>
          <Backdrop s={s} screen={i} w={MOV.width} h={MOV.height} />
          <Segment i={i} s={s} />
          {seg.sfx === 'tick'
            ? TICKS.map((t) => <Sequence key={t} from={t}><Audio src={SFX.tick} volume={MG.sfxSolo} /></Sequence>)
            : seg.sfx ? <Sequence from={seg.sfxAt}><Audio src={SFX[seg.sfx]} volume={MG.sfxSolo} /></Sequence> : null}
        </Sequence>
      ))}
      <Sequence from={SEGS.length * MOV.each - 12}><Audio src={SFX[s.sfx.end ?? 'chime']} volume={MG.sfxSolo} /></Sequence>
      <GrainLayer s={s} />
    </AbsoluteFill>
  );
};
