import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALEX} from '../../brand/estil';
import {resolveSrc} from '../media';
import {DISPLAY, WORDS} from './fonts';
import {blurInOut, slowPush} from './motion';
import {Stage} from './Stage';

export type StageStatProps = {
  // Icona (emoji 3D o logo) a dalt, una xifra gran daurada i una frase curta, com el rellotge «1h / 2h» o «400€».
  icon?: string;
  title?: string;
  value: string;
  caption?: string;
  // Per comparar dues xifres (abans → després), com «Pagas 10 € → ~80 $ de uso».
  from?: string;
  tone?: 'light' | 'dark';
};

export const StageStat: React.FC<StageStatProps> = ({icon, title, value, caption, from, tone = 'light'}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const exit = blurInOut(frame, durationInFrames, 0);
  const ink = tone === 'light' ? ALEX.ink : ALEX.white;
  const appear = (delay: number) => {
    const p = interpolate(frame - delay, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return {opacity: p, filter: `blur(${(1 - p) * 12}px)`, transform: `translateY(${(1 - p) * 30}px)`};
  };
  const goldText = {backgroundImage: ALEX.gold, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', padding: ALEX.goldClipPad} as const;
  return (
    <Stage tone={tone}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 18, opacity: exit.opacity, filter: exit.filter, transform: `scale(${slowPush(frame, fps)})`}}>
        {icon ? (
          <div style={{filter: 'drop-shadow(0 14px 18px rgba(0,0,0,.25))'}}>
            <Img src={resolveSrc(icon)} style={{width: 150, height: 150, objectFit: 'contain', ...appear(0)}} />
          </div>
        ) : null}
        {title ? <div style={{fontFamily: WORDS, fontWeight: 600, fontSize: 52, color: ink, ...appear(3)}}>{title}</div> : null}
        <div style={{display: 'flex', alignItems: 'center', gap: 40, fontFamily: DISPLAY, fontSize: 210, lineHeight: 1, filter: ALEX.goldGlowLight}}>
          {from ? (
            <>
              <span style={{opacity: 0.35}}>
                <span style={{display: 'inline-block', color: ink, fontSize: 150, ...appear(5)}}>{from}</span>
              </span>
              <span style={{opacity: 0.5}}>
                <span style={{display: 'inline-block', fontFamily: WORDS, fontWeight: 500, fontSize: 120, lineHeight: 1, color: ink, ...appear(10)}}>→</span>
              </span>
            </>
          ) : null}
          <span style={{display: 'inline-block', ...goldText, ...appear(from ? 14 : 6)}}>{value}</span>
        </div>
        {caption ? <div style={{fontFamily: WORDS, fontWeight: 500, fontSize: 46, color: ink, ...appear(from ? 20 : 12)}}>{caption}</div> : null}
      </AbsoluteFill>
    </Stage>
  );
};
