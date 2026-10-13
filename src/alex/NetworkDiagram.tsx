import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALEX} from '../../brand/estil';
import {resolveSrc} from '../media';
import {DISPLAY, WORDS} from './fonts';
import {blurInOut, slowPush} from './motion';
import {Stage} from './Stage';

type Node = {label: string; icon?: string};
export type NetworkDiagramProps = {center: Node; nodes: Node[]; caption?: string};

// La «tela de araña» d'Alex: node central daurat, nodes al voltant i línies que es dibuixen cap al centre.
export const NetworkDiagram: React.FC<NetworkDiagramProps> = ({center, nodes, caption}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const exit = blurInOut(frame, durationInFrames, 0);
  const cx = width / 2;
  const cy = height / 2 - (caption ? 30 : 0);
  const r = Math.min(width, height) * 0.36;
  const pos = nodes.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / nodes.length;
    return {x: cx + Math.cos(a) * r * 1.35, y: cy + Math.sin(a) * r};
  });
  const pop = (delay: number) => spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 160}});
  const card = (n: Node, gold: boolean, scale: number) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: gold ? '22px 34px' : '16px 26px',
        borderRadius: 20,
        background: gold ? ALEX.gold : '#F4F4F2',
        boxShadow: gold ? '0 0 50px rgba(255,190,90,.45)' : '0 10px 30px rgba(0,0,0,.45)',
        transform: `translate(-50%, -50%) scale(${scale})`,
        whiteSpace: 'nowrap',
      }}
    >
      {n.icon ? <Img src={resolveSrc(n.icon)} style={{width: gold ? 70 : 54, height: gold ? 70 : 54, objectFit: 'contain'}} /> : null}
      <span style={{fontFamily: gold ? DISPLAY : WORDS, fontWeight: 600, fontSize: gold ? 64 : 40, color: ALEX.ink, textTransform: 'none'}}>{n.label}</span>
    </div>
  );
  return (
    <Stage tone="dark">
      <AbsoluteFill style={{opacity: exit.opacity, filter: exit.filter, transform: `scale(${slowPush(frame, fps) * 1.0})`}}>
        <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
          {pos.map((p, i) => {
            const len = Math.hypot(p.x - cx, p.y - cy);
            const draw = interpolate(frame - 6 - i * 4, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#EDEDED" strokeOpacity={0.75} strokeWidth={3} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: cx, top: cy}}>{card(center, true, pop(0))}</div>
        {nodes.map((n, i) => (
          <div key={i} style={{position: 'absolute', left: pos[i].x, top: pos[i].y, filter: `blur(${(1 - Math.min(1, pop(10 + i * 4))) * 10}px)`}}>
            {card(n, false, pop(10 + i * 4))}
          </div>
        ))}
        {caption ? (
          <div style={{position: 'absolute', left: 0, right: 0, bottom: height * 0.08, textAlign: 'center', fontFamily: WORDS, fontWeight: 500, fontSize: 44, color: ALEX.white, opacity: interpolate(frame, [26, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            {caption}
          </div>
        ) : null}
      </AbsoluteFill>
    </Stage>
  );
};
