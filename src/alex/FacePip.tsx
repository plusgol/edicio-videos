import {interpolate, OffthreadVideo, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {PANTALLA} from '../../brand/estil';
import {resolveSrc} from '../media';
import type {RenderSegment} from '../types';

// La cara en una finestreta al costat de la pantalla (pantalla comentada, estil Adrián Sáez).
// Va per trossos (un per segment de càmera): sinceStart i total són del recurs sencer, perquè l'entrada i la sortida
// es facin un sol cop i no a cada tall.
export const FacePip: React.FC<{segment: RenderSegment; offset: number; side: 'left' | 'right'; sinceStart: number; total: number}> = ({
  segment,
  offset,
  side,
  sinceStart,
  total,
}) => {
  const frame = useCurrentFrame() + sinceStart;
  const {fps} = useVideoConfig();
  const P = PANTALLA.pip;
  const enter = spring({frame, fps, config: {damping: 16, stiffness: 160, mass: 0.6}});
  const exit = interpolate(frame, [total - 5, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        bottom: P.margin,
        [side]: P.margin,
        width: P.w,
        height: P.h,
        borderRadius: P.radius,
        overflow: 'hidden',
        border: P.border,
        boxShadow: P.shadow,
        background: '#000',
        opacity: Math.min(enter, exit),
        transform: `translateY(${(1 - enter) * 40}px) scale(${0.92 + 0.08 * enter})`,
      }}
    >
      <OffthreadVideo
        src={resolveSrc(segment.src)}
        muted
        trimBefore={segment.trimBefore + offset}
        style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${(100 * segment.originX) / 1920}% 50%`}}
      />
    </div>
  );
};
