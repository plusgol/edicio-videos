import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALEX} from '../../brand/estil';
import {resolveSrc} from '../media';
import {WORDS} from './fonts';
import {blurInOut} from './motion';
import {Stage} from './Stage';

export type EmojiPopProps = {
  src: string;
  label?: string;
  // none: sobre el pla de càmera, al costat de la persona · light/dark: sol al centre d'un escenari
  stage?: 'none' | 'light' | 'dark';
  side?: 'left' | 'right';
  faceX?: number;
  faceY?: number;
  size?: number;
};

// Objecte 3D que cau amb desenfocament de moviment, rebota una mica i sura (el cervell a la mà d'Alex).
export const EmojiPop: React.FC<EmojiPopProps> = ({src, label, stage = 'none', side = 'left', faceX, faceY, size}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const exit = blurInOut(frame, durationInFrames, 0);
  const drop = spring({frame, fps, config: {damping: 11, stiffness: 140, mass: 0.7}});
  const fall = interpolate(drop, [0, 1], [-260, 0]);
  const motionBlur = Math.max(0, 1 - frame / 6) * 10;
  const float = Math.sin((frame / fps) * 2.4) * 8;
  const s = size ?? (stage === 'none' ? 230 : 300);
  const fx = faceX ?? width / 2;
  const fy = faceY ?? height * 0.38;
  const x = stage === 'none' ? (side === 'left' ? fx - 420 : fx + 420) : width / 2;
  const y = stage === 'none' ? Math.min(height - s / 2 - 60, fy + 300) : height / 2 - (label ? 40 : 0);
  const item = (
    <AbsoluteFill style={{opacity: exit.opacity, filter: exit.filter}}>
      <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2 + fall + float, width: s, height: s, filter: `blur(${motionBlur}px) drop-shadow(0 0 30px rgba(255,255,255,.25)) drop-shadow(0 18px 24px rgba(0,0,0,.35))`}}>
        <Img src={resolveSrc(src)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </div>
      {label ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: y + s / 2 + 26,
            textAlign: 'center',
            fontFamily: WORDS,
            fontWeight: 500,
            fontSize: 44,
            color: stage === 'light' ? ALEX.ink : ALEX.white,
            textShadow: stage === 'light' ? 'none' : '0 2px 12px rgba(0,0,0,.6)',
            opacity: interpolate(frame, [6, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          }}
        >
          {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
  return stage === 'none' ? item : <Stage tone={stage}>{item}</Stage>;
};
