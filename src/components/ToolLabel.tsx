import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLOR, FONT, LABEL, SAFE} from '../../brand/estil';
import {fontFamily} from '../fonts';

// Etiqueta d'eina: nom + funció curta. Entra amb opacitat i un desplaçament curt, sense rebot ni resplendor.
export const ToolLabel: React.FC<{badge?: string; name: string; fn: string}> = ({badge, name, fn}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  // Horitzontal: rètol inferior esquerre (lower third). Vertical: terç inferior, a sobre dels subtítols.
  const landscape = width > height;
  const enter = interpolate(frame, [0, LABEL.enterFrames], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const exit = interpolate(frame, [durationInFrames - LABEL.exitFrames, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: landscape ? 'flex-start' : 'center'}}>
      <div
        style={{
          position: 'absolute',
          ...(landscape ? {left: 96, bottom: 96} : {top: LABEL.top}),
          maxWidth: SAFE.right - SAFE.left,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: `${LABEL.paddingY}px ${LABEL.paddingX}px`,
          borderRadius: LABEL.radius,
          backgroundColor: 'rgba(14,14,16,0.88)',
          fontFamily,
          opacity: enter * exit,
          transform: `translateY(${(1 - enter) * LABEL.offsetPx}px)`,
        }}
      >
        {badge ? (
          <div
            style={{
              width: LABEL.iconSize,
              height: LABEL.iconSize,
              borderRadius: LABEL.iconSize / 2,
              backgroundColor: COLOR.accent,
              color: COLOR.ink,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: FONT.labelNameWeight,
              fontSize: 30,
              flexShrink: 0,
            }}
          >
            {badge}
          </div>
        ) : null}
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span style={{color: COLOR.paper, fontWeight: FONT.labelNameWeight, fontSize: 46, lineHeight: 1.1}}>{name}</span>
          <span style={{color: COLOR.paper, opacity: 0.72, fontWeight: FONT.labelFnWeight, fontSize: 32, lineHeight: 1.2}}>{fn}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
