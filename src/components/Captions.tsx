import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CAPTIONS, COLOR, FONT, SAFE} from '../../brand/estil';
import {fontFamily} from '../fonts';
import type {CaptionPage} from '../types';

// Subtítols sobris: blocs de sentit, sense karaoke ni rebots. Com a molt una paraula (o xifra) en color d'accent.
export const Captions: React.FC<{pages: CaptionPage[]}> = ({pages}) => {
  const frame = useCurrentFrame();
  const page = pages.find((p) => frame >= p.fromFrame && frame < p.toFrame);
  if (!page) {
    return null;
  }
  const opacity = interpolate(frame - page.fromFrame, [0, CAPTIONS.fadeInFrames], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          top: CAPTIONS.centerY,
          transform: 'translateY(-50%)',
          textAlign: 'center',
          textWrap: 'balance',
          fontFamily,
          fontWeight: FONT.captionWeight,
          fontSize: CAPTIONS.fontSize,
          lineHeight: CAPTIONS.lineHeight,
          color: COLOR.paper,
          textShadow: CAPTIONS.shadow,
          WebkitTextStroke: `${CAPTIONS.strokePx}px ${COLOR.ink}`,
          paintOrder: 'stroke fill',
          opacity,
        }}
      >
        {page.words.map((w, i) => (
          <span key={i} style={w.highlight ? {color: COLOR.accent, fontWeight: FONT.highlightWeight} : undefined}>
            {w.text}
            {i < page.words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
