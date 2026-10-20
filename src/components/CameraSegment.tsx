import {AbsoluteFill, Audio, OffthreadVideo} from 'remotion';
import {resolveSrc} from '../media';
import type {RenderSegment} from '../types';

// Pla de càmera. El canvi d'escala és tallat (mai animat) i s'ancora als ulls.
export const CameraSegment: React.FC<{segment: RenderSegment; audible?: boolean; person?: boolean; offset?: number}> = ({
  segment,
  audible = false,
  person = false,
  offset = 0,
}) => (
  <AbsoluteFill>
    {audible && !person && segment.audioSrc ? (
      <Audio src={resolveSrc(segment.audioSrc)} trimBefore={segment.trimBefore + offset} volume={Math.pow(10, (segment.volumeDb ?? 0) / 20)} />
    ) : null}
    <OffthreadVideo
      // person: la persona retallada (WebM amb alfa) del mateix tros, encaixada al mateix lloc i escala.
      src={resolveSrc(person && segment.personSrc ? segment.personSrc : segment.src)}
      transparent={person}
      // Si la persona retallada no es pot reproduir (p. ex. Safari no llegeix WebM amb alfa), es deixa d'ensenyar sense aturar el vídeo.
      onError={person ? () => undefined : undefined}
      trimBefore={segment.trimBefore + offset}
      muted={person || !audible || Boolean(segment.audioSrc)}
      volume={!person && audible && !segment.audioSrc ? Math.pow(10, (segment.volumeDb ?? 0) / 20) : 0}
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
