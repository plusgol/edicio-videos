import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALEX} from '../../brand/estil';
import {DISPLAY, WORDS} from './fonts';
import {blurInOut, slowPush} from './motion';
import {Stage} from './Stage';

export type SectionNumeralProps = {numeral: string; title: string; sub?: string};

// Número romà daurat que puja des de baix i el títol de la secció entrant lletra a lletra amb perspectiva (II · DEFINIR).
export const SectionNumeral: React.FC<SectionNumeralProps> = ({numeral, title, sub}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const exit = blurInOut(frame, durationInFrames, 0);
  const goldText = {backgroundImage: ALEX.gold, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', padding: ALEX.goldClipPad} as const;
  const titleStart = 10;
  return (
    <Stage tone="light">
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 6, opacity: exit.opacity, filter: exit.filter, transform: `scale(${slowPush(frame, fps)})`}}>
        <div style={{display: 'flex', fontFamily: DISPLAY, fontSize: 170, lineHeight: 1, filter: ALEX.goldGlowLight}}>
          {[...numeral].map((c, i) => {
            const p = interpolate(frame - i * 3, [0, 7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <span key={i} style={{...goldText, display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 12}px)`, transform: `translateY(${(1 - p) * 120}px)`}}>
                {c}
              </span>
            );
          })}
        </div>
        <div style={{display: 'flex', fontFamily: DISPLAY, fontSize: 200, lineHeight: 0.95, textTransform: 'uppercase', perspective: 900, filter: ALEX.goldGlowLight}}>
          {[...title].map((c, i) => {
            const p = interpolate(frame - titleStart - i * ALEX.letterStagger, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <span
                key={i}
                style={{
                  ...goldText,
                  display: 'inline-block',
                  whiteSpace: 'pre',
                  opacity: p,
                  filter: `blur(${(1 - p) * 14}px)`,
                  transform: `translateX(${(1 - p) * 260}px) translateY(${(1 - p) * 60}px) rotateY(${(1 - p) * -70}deg)`,
                }}
              >
                {c}
              </span>
            );
          })}
        </div>
        {sub ? (
          <div style={{fontFamily: WORDS, fontWeight: 500, fontSize: 40, color: ALEX.ink, opacity: interpolate(frame, [titleStart + 12, titleStart + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            {sub}
          </div>
        ) : null}
      </AbsoluteFill>
    </Stage>
  );
};
