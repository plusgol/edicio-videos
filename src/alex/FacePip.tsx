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
  // Les preses reenquadrades tenen la mida del vídeo (scripts/reencuadra.py).
  const {fps, width: W, height: H} = useVideoConfig();
  const P = PANTALLA.pip;
  const enter = spring({frame, fps, config: {damping: 16, stiffness: 160, mass: 0.6}});
  // Enquadrament amb el seguiment de la cara: la cara ocupa faceFill de l'alçada i el seu centre cau a faceY.
  // L'escala mai deixa forat (el vídeo sempre cobreix la finestreta) i el desplaçament es limita a les vores.
  const k = Math.max((P.h * P.faceFill) / (segment.faceH ?? H * 0.27), P.h / H, P.w / W);
  const clamp = (v: number, min: number) => Math.min(0, Math.max(min, v));
  const left = clamp(P.w / 2 - segment.originX * k, P.w - W * k);
  const top = clamp(P.h * P.faceY - segment.originY * k, P.h - H * k);
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
        style={{position: 'absolute', left, top, width: W * k, height: H * k, maxWidth: 'none'}}
      />
    </div>
  );
};
