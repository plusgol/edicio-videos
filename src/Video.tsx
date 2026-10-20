import {AbsoluteFill, Audio, Sequence} from 'remotion';
import {resolveSrc} from './media';
import {COLOR} from '../brand/estil';
import {CameraSegment} from './components/CameraSegment';
import {Captions} from './components/Captions';
import {isBehind, OverlayView} from './Overlays';
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
      {/* Textos «darrere»: sobre el pla de càmera i sota la persona retallada. */}
      {plan.overlays.filter(isBehind).map((o) => (
        <Sequence key={o.id} from={o.fromFrame} durationInFrames={o.durationInFrames} layout="none">
          <OverlayView overlay={o} theme={plan.theme} />
        </Sequence>
      ))}
      {plan.overlays.filter(isBehind).flatMap((o) =>
        plan.segments
          .filter((s) => s.personSrc && s.fromFrame < o.fromFrame + o.durationInFrames && o.fromFrame < s.fromFrame + s.durationInFrames)
          .map((s) => {
            const from = Math.max(s.fromFrame, o.fromFrame);
            const to = Math.min(s.fromFrame + s.durationInFrames, o.fromFrame + o.durationInFrames);
            return (
              <Sequence key={`${o.id}-${s.fromFrame}`} from={from} durationInFrames={to - from}>
                <CameraSegment segment={s} person offset={from - s.fromFrame} />
              </Sequence>
            );
          }),
      )}
      {plan.overlays.filter((o) => !isBehind(o)).map((o) =>
        // Les gravacions de pantalla es munten 1 s abans perquè el vídeo ja estigui carregat quan entren.
        o.type === 'ScreenWindow' ? (
          <Sequence key={o.id} from={o.fromFrame} durationInFrames={o.durationInFrames} premountFor={30}>
            <OverlayView overlay={o} theme={plan.theme} />
          </Sequence>
        ) : (
          <Sequence key={o.id} from={o.fromFrame} durationInFrames={o.durationInFrames} layout="none">
            <OverlayView overlay={o} theme={plan.theme} />
          </Sequence>
        ),
      )}
      {/* Veu muntada a part (scripts/munta.py): sense clics als talls i ja normalitzada. */}
      {plan.audioFromSegments ? null : <Audio src={resolveSrc(plan.voice)} />}
    </AbsoluteFill>
  );
};
