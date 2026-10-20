import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALEX, PANTALLA} from '../../brand/estil';
import {resolveSrc} from '../media';
import {WORDS} from './fonts';
import {blurInOut, slowPush} from './motion';
import {Stage} from './Stage';

export type LogoCardProps = {logo: string; name: string; tone?: 'light' | 'dark'};

// Targeta d'eina a pantalla completa (estil tef): logo gran i el nom al costat, quan s'esmenta l'eina per primer cop.
export const LogoCard: React.FC<LogoCardProps> = ({logo, name, tone = 'light'}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const exit = blurInOut(frame, durationInFrames, 0);
  const pop = spring({frame, fps, config: {damping: 12, stiffness: 170, mass: 0.6}});
  const nameP = interpolate(frame - 4, [0, 7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const C = PANTALLA.logoCard;
  return (
    <Stage tone={tone}>
      <AbsoluteFill
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: C.gap,
          opacity: exit.opacity,
          filter: exit.filter,
          transform: `scale(${slowPush(frame, fps)})`,
        }}
      >
        <Img
          src={resolveSrc(logo)}
          style={{
            width: C.logoPx,
            height: C.logoPx,
            objectFit: 'contain',
            transform: `scale(${pop})`,
            filter: 'drop-shadow(0 14px 22px rgba(0,0,0,.22))',
          }}
        />
        <div
          style={{
            fontFamily: WORDS,
            fontWeight: 600,
            fontSize: C.namePx,
            letterSpacing: '-0.02em',
            color: tone === 'light' ? ALEX.ink : ALEX.white,
            opacity: nameP,
            filter: `blur(${(1 - nameP) * 12}px)`,
            transform: `translateX(${(1 - nameP) * 40}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
