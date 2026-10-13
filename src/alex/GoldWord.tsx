import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALEX} from '../../brand/estil';
import {DISPLAY, WORDS} from './fonts';
import {blurInOut, slowPush} from './motion';
import {Stage} from './Stage';

export type GoldWordProps = {
  text: string;
  // Frase petita a sobre (com «yo sé cuando alguien está» sobre FACTURANDO).
  sub?: string;
  tone?: 'gold' | 'white';
  // behind: darrere de la persona (Video.tsx hi posa la persona retallada a sobre) · front: davant, a la part baixa
  // stage-light / stage-dark: sola sobre un escenari
  placement?: 'behind' | 'front' | 'stage-light' | 'stage-dark';
  size?: number;
};

// Paraula o xifra gegant en condensada daurada; les lletres entren escalonades i desenfocades.
export const GoldWord: React.FC<GoldWordProps> = ({text, sub, tone = 'gold', placement = 'behind', size}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, height} = useVideoConfig();
  const fontSize = size ?? (placement === 'front' ? 190 : placement === 'behind' ? 420 : 300);
  const exit = blurInOut(frame, durationInFrames, 0);
  const chars = [...text];
  const word = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        fontFamily: DISPLAY,
        fontSize,
        lineHeight: 0.92,
        letterSpacing: '-0.01em',
        textTransform: 'uppercase',
        filter: tone === 'gold' ? (placement === 'stage-light' ? ALEX.goldGlowLight : ALEX.goldGlow) : 'drop-shadow(0 6px 14px rgba(0,0,0,.35))',
        transform: `scale(${slowPush(frame, fps) * (placement === 'behind' ? 1 : 1)})`,
      }}
    >
      {chars.map((c, i) => {
        const d = i * ALEX.letterStagger;
        const p = interpolate(frame - d, [0, ALEX.blurInFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: p,
              filter: `blur(${(1 - p) * ALEX.blurPx}px)`,
              transform: `translateY(${(1 - p) * 0.12 * fontSize}px) scale(${1.15 - 0.15 * p})`,
              ...(tone === 'gold'
                ? {backgroundImage: ALEX.gold, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', padding: ALEX.goldClipPad}
                : {color: ALEX.white}),
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
  const subLine = sub ? (
    <div style={{fontFamily: WORDS, fontWeight: 500, fontSize: 40, color: ALEX.white, textShadow: '0 2px 10px rgba(0,0,0,.6)', marginBottom: -8}}>{sub}</div>
  ) : null;
  const wrapStyle = {opacity: exit.opacity, filter: exit.filter} as const;

  if (placement === 'stage-light' || placement === 'stage-dark') {
    return (
      <Stage tone={placement === 'stage-light' ? 'light' : 'dark'}>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', ...wrapStyle}}>
          {word}
          {sub ? <div style={{fontFamily: WORDS, fontWeight: 500, fontSize: 44, color: placement === 'stage-light' ? ALEX.ink : ALEX.white, marginTop: 12}}>{sub}</div> : null}
        </AbsoluteFill>
      </Stage>
    );
  }
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: placement === 'front' ? 'flex-end' : 'center',
        paddingBottom: placement === 'front' ? height * 0.08 : 0,
        paddingTop: placement === 'behind' ? 0 : 0,
        ...wrapStyle,
      }}
    >
      {subLine}
      {word}
    </AbsoluteFill>
  );
};
