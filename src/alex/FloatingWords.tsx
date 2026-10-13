import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALEX} from '../../brand/estil';
import {WORDS} from './fonts';
import {blurInOut} from './motion';

export type FloatingWordsProps = {
  text: string;
  side?: 'left' | 'right';
  // Posició de la cara en el moment del recurs (munta.py la calcula del seguiment de cara).
  faceX?: number;
  faceY?: number;
  faceH?: number;
};

// Paraules en minúscula al costat del cap, que apareixen una a una, com si les escrigués la veu.
export const FloatingWords: React.FC<FloatingWordsProps> = ({text, side = 'left', faceX, faceY, faceH}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const fx = faceX ?? width / 2;
  const fy = faceY ?? height * 0.38;
  const words = text.split(/\s+/).filter(Boolean);
  const exit = blurInOut(frame, durationInFrames, 0);
  // Separació proporcional a la cara: en un selfie molt a prop, la cara ocupa mitja pantalla.
  const gap = Math.max(170, (faceH ?? 300) * 0.48 + 30);
  const boxW = 560;
  const left = side === 'left' ? Math.max(60, fx - gap - boxW) : Math.min(width - 60 - boxW, fx + gap);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left,
          top: Math.max(120, Math.min(height - 300, fy - 30)),
          width: boxW,
          textAlign: side === 'left' ? 'right' : 'left',
          fontFamily: WORDS,
          fontWeight: 500,
          fontSize: ALEX.floatingWordsPx,
          lineHeight: 1.18,
          color: ALEX.white,
          textShadow: '0 2px 12px rgba(0,0,0,.55)',
          textTransform: 'lowercase',
          opacity: exit.opacity,
          filter: exit.filter,
        }}
      >
        {words.map((w, i) => {
          const p = interpolate(frame - i * ALEX.wordStagger, [0, ALEX.blurInFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <span key={i} style={{display: 'inline-block', marginRight: '0.28em', opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 8}px)`}}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
