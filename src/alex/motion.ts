import {Easing, interpolate} from 'remotion';
import {ALEX} from '../../brand/estil';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Entrada i sortida «a l'Alex»: desenfocat i una mica gran → nítid; a la sortida, a l'inrevés.
export const blurInOut = (frame: number, duration: number, delay = 0) => {
  const t = frame - delay;
  const inP = interpolate(t, [0, ALEX.blurInFrames], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const outP = interpolate(frame, [duration - ALEX.blurOutFrames, duration], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const blur = ALEX.blurPx * (1 - inP) + ALEX.blurPx * outP;
  return {
    opacity: Math.min(inP, 1 - outP * 0.9),
    filter: `blur(${blur.toFixed(2)}px)`,
    scale: 1.06 - 0.06 * inP + 0.05 * outP,
  };
};

// Zoom lent i constant mentre l'element és a pantalla: res queda quiet.
export const slowPush = (frame: number, fps: number) => 1 + (ALEX.pushPerSecond * frame) / fps;
