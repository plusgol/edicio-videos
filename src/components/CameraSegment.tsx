import {AbsoluteFill, OffthreadVideo} from 'remotion';
import {resolveSrc} from '../media';
import type {RenderSegment} from '../types';

// Pla de càmera. El canvi d'escala és tallat (mai animat) i s'ancora als ulls.
export const CameraSegment: React.FC<{segment: RenderSegment; audible?: boolean}> = ({segment, audible = false}) => (
  <AbsoluteFill>
    <OffthreadVideo
      src={resolveSrc(segment.src)}
      trimBefore={segment.trimBefore}
      muted={!audible}
      volume={audible ? Math.pow(10, (segment.volumeDb ?? 0) / 20) : 0}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${segment.scale})`,
        transformOrigin: `${segment.originX}px ${segment.originY}px`,
      }}
    />
  </AbsoluteFill>
);
