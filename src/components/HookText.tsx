import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLOR, FONT, LABEL, SAFE} from '../../brand/estil';
import {fontFamily} from '../fonts';

// Text del ganxo: visible des del fotograma 0 (sense entrada) i surt amb una opacitat curta.
export const HookText: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  // En vertical va al terç inferior (LABEL.top); en horitzontal, sota la cara (LABEL.hookTopLandscape, en fracció de l'alçada).
  const landscape = width > height;
  const opacity = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: landscape ? height * LABEL.hookTopLandscape : LABEL.top - 20,
          maxWidth: landscape ? width * LABEL.hookMaxWidthLandscape : SAFE.right - SAFE.left,
          padding: '22px 34px',
          borderRadius: 22,
          backgroundColor: COLOR.paper,
          color: COLOR.ink,
          fontFamily,
          fontWeight: FONT.labelNameWeight,
          fontSize: 64,
          lineHeight: 1.12,
          textAlign: 'center',
          textWrap: 'balance',
          boxShadow: '0 8px 30px rgba(0,0,0,.25)',
          opacity,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
