import {AbsoluteFill, Img, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALEX} from '../../brand/estil';
import {resolveSrc} from '../media';
import {DISPLAY, WORDS} from './fonts';
import {blurInOut, slowPush} from './motion';
import {Stage} from './Stage';

export type SlotsRowProps = {title?: string; items: {icon: string; label?: string}[]; slots?: number};

// Fila de caselles que s'omplen una a una (el resum d'Alex amb peça, diana, llibreta, VHS…).
export const SlotsRow: React.FC<SlotsRowProps> = ({title, items, slots}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const exit = blurInOut(frame, durationInFrames, 0);
  const n = Math.max(slots ?? items.length, items.length);
  const box = 230;
  const each = Math.max(6, Math.floor((durationInFrames - 30) / Math.max(1, items.length)));
  return (
    <Stage tone="light">
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 34, opacity: exit.opacity, filter: exit.filter, transform: `scale(${slowPush(frame, fps)})`}}>
        {title ? (
          <div style={{fontFamily: DISPLAY, fontSize: 120, lineHeight: 1, textTransform: 'uppercase', backgroundImage: ALEX.gold, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', padding: ALEX.goldClipPad, filter: ALEX.goldGlowLight}}>
            {title}
          </div>
        ) : null}
        <div style={{display: 'flex', border: `6px solid ${ALEX.goldSolid}`, borderRadius: 6, background: 'rgba(255,255,255,.55)'}}>
          {Array.from({length: n}, (_, i) => {
            const it = items[i];
            const p = it ? spring({frame: frame - 8 - i * each, fps, config: {damping: 12, stiffness: 170}}) : 0;
            return (
              <div key={i} style={{width: box, height: box, borderLeft: i ? `6px solid ${ALEX.goldSolid}` : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
                {it ? (
                  <>
                    <Img src={resolveSrc(it.icon)} style={{width: 120, height: 120, objectFit: 'contain', opacity: Math.min(1, p), transform: `scale(${p})`, filter: `blur(${(1 - Math.min(1, p)) * 8}px)`}} />
                    {it.label ? <div style={{fontFamily: WORDS, fontWeight: 600, fontSize: 30, color: ALEX.ink, opacity: Math.min(1, p)}}>{it.label}</div> : null}
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
