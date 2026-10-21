import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALEX, EXPLICA, PANTALLA} from '../../brand/estil';
import {resolveSrc} from '../media';
import {DISPLAY, WORDS} from './fonts';
import {blurInOut} from './motion';
import {Stage} from './Stage';

export type FlowStep = {
  // Instant en què apareix (ms des de l'inici del recurs). munta.py el calcula a partir d'anchorMs si cal.
  atMs?: number;
  logo?: string;
  // Text de marca quan no hi ha logo (p. ex. «BYBIT»).
  mark?: string;
  value?: string;
  tone?: 'up' | 'down' | 'gold';
  label: string;
  sub?: string;
};

export type FlowStepsProps = {title?: string; steps: FlowStep[]; note?: string; pip?: 'left' | 'right'};

// Explicació en passos: targetes que surten una rere l'altra, unides amb fletxes (com funciona un compte de fondeig,
// què fa Claude Code, quines plataformes…). Pensat per a algú que no en sap.
export const FlowSteps: React.FC<FlowStepsProps> = ({title, steps, note, pip}) => {
  const frame = useCurrentFrame();
  const {fps, width, durationInFrames} = useVideoConfig();
  const exit = blurInOut(frame, durationInFrames, 0);
  const E = EXPLICA;
  const reserve = pip ? PANTALLA.pip.w + PANTALLA.pip.margin + PANTALLA.pip.gap : 0;
  const avail = width - reserve - 140;
  const n = steps.length;
  const arrow = 56;
  const cardW = Math.min(360, (avail - arrow * (n - 1)) / n);
  // Targetes estretes (moltes, o amb la finestreta de cara): la lletra s'ajusta a l'amplada perquè res no en surti.
  const k = Math.min(1, cardW / 330);
  const ms = (frame * 1000) / fps;
  const spread = (durationInFrames * 1000) / fps * 0.55;
  const at = (s: FlowStep, i: number) => s.atMs ?? (n > 1 ? (spread * i) / (n - 1) : 0) + 300;
  const valueColor = (t?: FlowStep['tone']) => (t === 'up' ? E.up : t === 'down' ? E.down : undefined);
  return (
    <Stage tone="light">
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          gap: 56,
          opacity: exit.opacity,
          filter: exit.filter,
          ...(pip ? {[pip === 'right' ? 'paddingRight' : 'paddingLeft']: reserve} : {}),
        }}
      >
        {title ? (
          <div style={{fontFamily: WORDS, fontWeight: 600, fontSize: E.titlePx, color: E.ink, textAlign: 'center', maxWidth: avail}}>{title}</div>
        ) : null}
        <div style={{display: 'flex', alignItems: 'stretch', gap: 0}}>
          {steps.map((s, i) => {
            const t = ms - at(s, i);
            const p = spring({frame: (t * fps) / 1000, fps, config: {damping: 15, stiffness: 170, mass: 0.6}});
            const shown = t >= 0;
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center'}}>
                {i > 0 ? (
                  <div style={{width: arrow, textAlign: 'center', fontFamily: WORDS, fontSize: 52, color: E.muted, opacity: shown ? p : 0}}>→</div>
                ) : null}
                <div
                  style={{
                    width: cardW,
                    minHeight: 300 * Math.max(k, 0.8),
                    boxSizing: 'border-box',
                    padding: `${30 * k}px ${Math.max(12, 22 * k)}px`,
                    borderRadius: 26,
                    background: E.card,
                    boxShadow: E.cardShadow,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 14,
                    textAlign: 'center',
                    opacity: shown ? p : 0,
                    transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`,
                  }}
                >
                  {s.logo ? <Img src={resolveSrc(s.logo)} style={{width: 120, height: 120, objectFit: 'contain'}} /> : null}
                  {s.mark ? (
                    <div style={{fontFamily: WORDS, fontWeight: 700, fontSize: 54, letterSpacing: '.04em', color: E.ink}}>{s.mark}</div>
                  ) : null}
                  {s.value ? (
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: E.valuePx * k,
                        lineHeight: 1,
                        ...(valueColor(s.tone)
                          ? {color: valueColor(s.tone)}
                          : {backgroundImage: ALEX.gold, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', padding: ALEX.goldClipPad}),
                      }}
                    >
                      {s.value}
                    </div>
                  ) : null}
                  <div style={{fontFamily: WORDS, fontWeight: 600, fontSize: Math.max(24, E.labelPx * k), lineHeight: 1.15, color: E.ink}}>{s.label}</div>
                  {s.sub ? <div style={{fontFamily: WORDS, fontWeight: 500, fontSize: Math.max(20, E.subPx * k), lineHeight: 1.25, color: E.muted}}>{s.sub}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
        {note ? (
          <div style={{fontFamily: WORDS, fontWeight: 500, fontSize: 28, color: E.muted, opacity: interpolate(frame, [10, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            {note}
          </div>
        ) : null}
      </AbsoluteFill>
    </Stage>
  );
};
