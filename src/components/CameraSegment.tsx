import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
import type {RenderSegment} from '../types';

// Pla de càmera. El canvi d'escala és tallat (mai animat) i s'ancora als ulls.
export const CameraSegment: React.FC<{segment: RenderSegment}> = ({segment}) => (
  <AbsoluteFill>
    <OffthreadVideo
      src={staticFile(segment.src)}
      trimBefore={segment.trimBefore}
      muted
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
