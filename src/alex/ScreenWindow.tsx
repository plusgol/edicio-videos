import {AbsoluteFill, Easing, interpolate, OffthreadVideo, useCurrentFrame, useVideoConfig} from 'remotion';
import {PANTALLA} from '../../brand/estil';
import {resolveSrc} from '../media';
import {WORDS} from './fonts';
import {blurInOut} from './motion';
import {Stage} from './Stage';

// Un zoom: a partir de atMs (des de l'inici del recurs) la càmera va cap a (x, y) —centre normalitzat 0–1 sobre la
// gravació retallada— amb el zoom indicat, i s'hi queda fins al següent. zoom 1 = tota la finestra.
export type ScreenZoom = {atMs: number; zoom: number; x?: number; y?: number};

export type ScreenWindowProps = {
  // Clip de pantalla ja retallat i accelerat per munta.py (assets/pantalla/*.mp4).
  src: string;
  // Amplada / alçada del clip.
  aspect: number;
  zooms?: ScreenZoom[];
  // Etiqueta curta i honesta a baix a l'esquerra (p. ex. «Dinero ficticio · paper trading»).
  tag?: string;
  tone?: 'light' | 'dark';
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Pose de càmera en un instant: cada zoom parteix de la pose real del moment en què comença (sense salts).
const poseAt = (ms: number, zooms: ScreenZoom[]) => {
  let pose = {zoom: 1, x: 0.5, y: 0.5};
  for (const z of [...zooms].sort((a, b) => a.atMs - b.atMs)) {
    if (ms < z.atMs) break;
    const target = {zoom: z.zoom, x: z.x ?? pose.x, y: z.y ?? pose.y};
    const p = interpolate(ms, [z.atMs, z.atMs + PANTALLA.zoomMoveMs], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
    pose = {zoom: pose.zoom + (target.zoom - pose.zoom) * p, x: pose.x + (target.x - pose.x) * p, y: pose.y + (target.y - pose.y) * p};
  }
  // El centre no pot portar la vora del clip dins de la finestra.
  const half = 0.5 / pose.zoom;
  return {zoom: pose.zoom, x: Math.min(1 - half, Math.max(half, pose.x)), y: Math.min(1 - half, Math.max(half, pose.y))};
};

// Gravació de pantalla en una finestra flotant sobre l'escenari (estil tef), amb zooms a les xifres.
export const ScreenWindow: React.FC<ScreenWindowProps> = ({src, aspect, zooms = [], tag, tone = 'light'}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const exit = blurInOut(frame, durationInFrames, 0);
  const w = Math.min(width * PANTALLA.maxW, height * PANTALLA.maxH * aspect);
  const h = w / aspect;
  const pose = poseAt((frame * 1000) / fps, zooms);
  const T = PANTALLA.tag;
  return (
    <Stage tone={tone}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: exit.opacity, filter: exit.filter}}>
        <div
          style={{
            width: w,
            height: h,
            borderRadius: PANTALLA.radius,
            overflow: 'hidden',
            boxShadow: PANTALLA.shadow,
            position: 'relative',
            background: '#000',
            // Sense zoom lent: una finestra de 15 s creixeria un 45 % i sortiria de quadre. El moviment el donen els zooms.
            transform: `scale(${exit.scale})`,
          }}
        >
          <OffthreadVideo
            src={resolveSrc(src)}
            muted
            style={{
              position: 'absolute',
              width: w,
              height: h,
              transformOrigin: '0 0',
              transform: `translate(${w * (0.5 - pose.x * pose.zoom)}px, ${h * (0.5 - pose.y * pose.zoom)}px) scale(${pose.zoom})`,
            }}
          />
        </div>
      </AbsoluteFill>
      {tag ? (
        <div
          style={{
            position: 'absolute',
            left: T.left,
            bottom: T.bottom,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: `${T.padY}px ${T.padX}px`,
            borderRadius: T.radius,
            background: T.bg,
            color: T.ink,
            fontFamily: WORDS,
            fontWeight: 600,
            fontSize: T.fontPx,
            opacity: interpolate(frame, [4, 10], [0, 1], clamp) * exit.opacity,
          }}
        >
          <span style={{width: 14, height: 14, borderRadius: 7, background: T.dot}} />
          {tag}
        </div>
      ) : null}
    </Stage>
  );
};
