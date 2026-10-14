import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TegakiRenderer} from 'tegaki';
import caveat from 'tegaki/fonts/caveat';
import {MANUAL} from '../../brand/estil';
import {resolveSrc} from '../media';
import {blurInOut} from './motion';

export type LogoPopProps = {
  // Logo de l'eina que s'acaba d'esmentar (SVG de @lobehub/icons), com un adhesiu enganxat al costat del cap.
  src: string;
  // Nom escrit a mà a sota (opcional).
  label?: string;
  side?: 'left' | 'right';
  faceX?: number;
  faceY?: number;
  faceH?: number;
};

export const LogoPop: React.FC<LogoPopProps> = ({src, label, side = 'right', faceX, faceY, faceH}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const exit = blurInOut(frame, durationInFrames, -100);
  const pop = spring({frame, fps, config: {damping: 11, stiffness: 170, mass: 0.6}});
  const {radius, padding, logoPx, tiltDeg} = MANUAL.sticker;
  const tilt = (side === 'left' ? -1 : 1) * tiltDeg * (2 - pop);
  const fx = faceX ?? width / 2;
  const fy = faceY ?? height * 0.38;
  const gap = Math.max(170, (faceH ?? 300) * 0.5 + 60);
  const cardW = logoPx + padding * 2;
  const x = side === 'left' ? Math.max(40, fx - gap - cardW) : Math.min(width - 40 - cardW * 1.6, fx + gap);
  const y = Math.max(80, Math.min(height - 380, fy - 40));
  // L'etiqueta s'escriu en ~0,5 s, just després que s'enganxi l'adhesiu.
  const labelT = Math.max(0, (frame - 6) / (fps * 0.5));
  return (
    <AbsoluteFill style={{opacity: exit.opacity, filter: exit.filter}}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          transform: `scale(${0.55 + 0.45 * pop}) rotate(${tilt}deg)`,
          opacity: interpolate(frame, [0, 3], [0, 1], {extrapolateRight: 'clamp'}),
          filter: `blur(${Math.max(0, 1 - frame / 4) * 8}px)`,
        }}
      >
        <div style={{padding, borderRadius: radius, background: '#FFFFFF', boxShadow: '0 14px 30px rgba(0,0,0,.35), 0 0 0 4px rgba(255,255,255,.6)'}}>
          <Img src={resolveSrc(src)} style={{width: logoPx, height: logoPx, objectFit: 'contain', display: 'block'}} />
        </div>
        {label ? (
          <div style={{filter: 'drop-shadow(0 3px 8px rgba(0,0,0,.6))', whiteSpace: 'nowrap', width: 'max-content'}}>
            <TegakiRenderer font={caveat} text={label} time={{mode: 'controlled', value: Math.min(1, labelT), unit: 'progress'}} style={{fontSize: 64, lineHeight: 1.1, whiteSpace: 'pre', display: 'inline-block', width: 'max-content', paddingRight: '0.35em', color: MANUAL.inkOnCamera}} />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
