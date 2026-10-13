import {AbsoluteFill, Audio, Sequence} from 'remotion';
import {resolveSrc} from './media';
import {COLOR} from '../brand/estil';
import {CameraSegment} from './components/CameraSegment';
import {Captions} from './components/Captions';
import {OverlayView} from './Overlays';
import type {RenderPlan} from './types';

export const Video: React.FC<{plan: RenderPlan | null}> = ({plan}) => {
  if (!plan) {
    return null;
  }
  return (
    <AbsoluteFill style={{backgroundColor: COLOR.ink}}>
      {plan.segments.map((s) => (
        <Sequence key={s.fromFrame} from={s.fromFrame} durationInFrames={s.durationInFrames} premountFor={30}>
          <CameraSegment segment={s} audible={plan.audioFromSegments} />
        </Sequence>
      ))}
      <Captions pages={plan.captions} />
      {plan.overlays.map((o) => (
        <Sequence key={o.id} from={o.fromFrame} durationInFrames={o.durationInFrames} layout="none">
          <OverlayView overlay={o} theme={plan.theme} />
        </Sequence>
      ))}
      {/* Veu muntada a part (scripts/munta.py): sense clics als talls i ja normalitzada. */}
      {plan.audioFromSegments ? null : <Audio src={resolveSrc(plan.voice)} />}
    </AbsoluteFill>
  );
};
