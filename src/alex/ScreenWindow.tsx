import {AbsoluteFill, Easing, interpolate, OffthreadVideo, useCurrentFrame, useVideoConfig} from 'remotion';
import {PANTALLA} from '../../brand/estil';
import {resolveSrc} from '../media';
import {WORDS} from './fonts';
import {blurInOut} from './motion';
import {Stage} from './Stage';

// Un zoom: a partir de atMs (des de l'inici del recurs) la càmera va cap a (x, y) —centre normalitzat 0–1 sobre la
// gravació retallada— amb el zoom indicat, i s'hi queda fins al següent. zoom 1 = tota la finestra.
export type ScreenZoom = {atMs: number; zoom: number; x?: number; y?: number};

// Rectangle normalitzat sobre la gravació retallada: [x, y, amplada, alçada], 0–1.
export type ScreenRect = [number, number, number, number];
// Nota: marca una zona (box) entre atMs i toMs i hi posa un rètol (label) a sobre o a sota.
export type ScreenNote = {atMs: number; toMs?: number; box: ScreenRect; label?: string; place?: 'above' | 'below'};

export type ScreenWindowProps = {
  // Clip de pantalla ja retallat i accelerat per munta.py (assets/pantalla/*.mp4).
  src: string;
  // Amplada / alçada del clip.
  aspect: number;
  zooms?: ScreenZoom[];
  // Etiqueta curta i honesta a baix a l'esquerra (p. ex. «Dinero ficticio · paper trading»).
  tag?: string;
  // Tapa el contingut (p. ex. resultats que es guarden per a la part 2): es veu la interfície però no es llegeix res.
  hidden?: boolean;
  // Zones tapades (xifres de resultats): es veu la resta de la interfície.
  masks?: ScreenRect[];
  notes?: ScreenNote[];
  // Entra amb tall sec, sense fos (plans ràpids de la intro i el primer fotograma del vídeo, que ha de ser contingut).
  cutIn?: boolean;
  // Pantalla comentada: deixa lloc per a la finestreta de la cara a aquest costat (la pinta Video.tsx).
  pip?: 'left' | 'right';
  tone?: 'light' | 'dark';
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Pose de càmera en un instant: cada zoom parteix de la pose real del moment en què comença (sense salts).
const poseAt = (ms: number, zooms: ScreenZoom[]) => {
  let pose = {zoom: 1, x: 0.5, y: 0.5};
  for (const z of [...zooms].sort((a, b) => a.atMs - b.atMs)) {
    if (ms < z.atMs) break;
    const target = {zoom: z.zoom, x: z.x ?? pose.x, y: z.y ?? pose.y};
    if (z.atMs <= 0) {
      // Un zoom a l'instant 0 és la pose inicial: el pla entra ja ampliat (tall sec, com a la intro de tef).
      pose = target;
      continue;
    }
    const p = interpolate(ms, [z.atMs, z.atMs + PANTALLA.zoomMoveMs], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
    pose = {zoom: pose.zoom + (target.zoom - pose.zoom) * p, x: pose.x + (target.x - pose.x) * p, y: pose.y + (target.y - pose.y) * p};
  }
  // El centre no pot portar la vora del clip dins de la finestra.
  const half = 0.5 / pose.zoom;
  return {zoom: pose.zoom, x: Math.min(1 - half, Math.max(half, pose.x)), y: Math.min(1 - half, Math.max(half, pose.y))};
};

// Gravació de pantalla en una finestra flotant sobre l'escenari (estil tef), amb zooms a les xifres.
export const ScreenWindow: React.FC<ScreenWindowProps> = ({src, aspect, zooms = [], tag, hidden, masks = [], notes = [], cutIn, pip, tone = 'light'}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const exit = blurInOut(frame, durationInFrames, cutIn ? -100 : 0);
  // Amb finestreta de cara, la gravació ocupa la resta de l'amplada (més gran que sense: és el pla principal).
  const reserve = pip ? PANTALLA.pip.w + PANTALLA.pip.margin + PANTALLA.pip.gap : 0;
  const w = pip
    ? Math.min(width - reserve - PANTALLA.edge, height * 0.9 * aspect)
    : Math.min(width * PANTALLA.maxW, height * PANTALLA.maxH * aspect);
  const h = w / aspect;
  const ms = (frame * 1000) / fps;
  const pose = poseAt(ms, zooms);
  const T = PANTALLA.tag;
  const N = PANTALLA.note;
  // Rectangle de la gravació → píxels dins de la finestra, amb el zoom del moment.
  const place = ([x, y, rw, rh]: ScreenRect) => ({
    left: w * (0.5 - pose.x * pose.zoom) + x * w * pose.zoom,
    top: h * (0.5 - pose.y * pose.zoom) + y * h * pose.zoom,
    width: rw * w * pose.zoom,
    height: rh * h * pose.zoom,
  });
  return (
    <Stage tone={tone}>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          opacity: exit.opacity,
          filter: exit.filter,
          // L'espai de la cara a un costat i el marge de la vora a l'altre: la gravació no toca mai la vora.
          ...(pip ? {[pip === 'right' ? 'paddingRight' : 'paddingLeft']: reserve, [pip === 'right' ? 'paddingLeft' : 'paddingRight']: PANTALLA.edge} : {}),
        }}
      >
        <div style={{width: w, height: h, position: 'relative', transform: `scale(${exit.scale})`}}>
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
              filter: hidden ? `blur(${PANTALLA.hiddenBlurPx}px)` : undefined,
            }}
          />
          {masks.map((m, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                ...place(m),
                borderRadius: 8,
                backdropFilter: `blur(${PANTALLA.hiddenBlurPx}px)`,
                WebkitBackdropFilter: `blur(${PANTALLA.hiddenBlurPx}px)`,
                background: PANTALLA.maskVeil,
              }}
            />
          ))}
        </div>
        {notes
          .filter((n) => ms >= n.atMs && ms < (n.toMs ?? Infinity))
          .map((n, i) => {
            const r = place(n.box);
            const p = interpolate(ms - n.atMs, [0, (N.inFrames * 1000) / fps], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
            const above = (n.place ?? (r.top > N.labelPx * 2.5 ? 'above' : 'below')) === 'above';
            return (
              <div key={i} style={{position: 'absolute', ...r, opacity: p}}>
                <div
                  style={{
                    position: 'absolute',
                    inset: -N.strokePx,
                    border: `${N.strokePx}px solid ${N.stroke}`,
                    borderRadius: N.radius,
                    boxShadow: N.glow,
                    transform: `scale(${1.08 - 0.08 * p})`,
                  }}
                />
                {n.label ? (
                  <div
                    style={{
                      position: 'absolute',
                      // A la meitat dreta de la finestra, el rètol s'alinea per la dreta perquè no en surti.
                      ...(r.left + r.width / 2 > w / 2 ? {right: -N.strokePx} : {left: -N.strokePx}),
                      ...(above ? {bottom: `calc(100% + ${N.labelGap + N.strokePx}px)`} : {top: `calc(100% + ${N.labelGap + N.strokePx}px)`}),
                      padding: `${N.labelPadY}px ${N.labelPadX}px`,
                      borderRadius: 999,
                      background: N.labelBg,
                      color: N.labelInk,
                      fontFamily: WORDS,
                      fontWeight: 600,
                      fontSize: N.labelPx,
                      whiteSpace: 'nowrap',
                      transform: `translateY(${(1 - p) * (above ? 12 : -12)}px)`,
                      boxShadow: '0 8px 20px rgba(0,0,0,.35)',
                    }}
                  >
                    {n.label}
                  </div>
                ) : null}
              </div>
            );
          })}
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
