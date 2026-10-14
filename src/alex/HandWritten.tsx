import {useMemo} from 'react';
import {AbsoluteFill, Img, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {resolveSrc} from '../media';
import {TegakiRenderer} from 'tegaki';
import {computeTimeline} from 'tegaki/core';
import caveat from 'tegaki/fonts/caveat';
import {MANUAL} from '../../brand/estil';
import {blurInOut} from './motion';

export type HandWrittenProps = {
  // Text escrit a mà; les paraules entre *asteriscs* van en color d'accent (com «la IA» en blau).
  text: string;
  // stage: sobre el gris clar de la mostra · camera: al costat del cap, sobre el pla
  mode?: 'stage' | 'camera';
  side?: 'left' | 'right';
  faceX?: number;
  faceY?: number;
  faceH?: number;
  size?: number;
  // Logo de l'eina de què parla la frase, a sobre del text (només a l'escenari).
  logo?: string;
};

type Segment = {text: string; accent: boolean};
// Una peça per paraula: així el salt de línia sempre cau entre paraules i les línies queden centrades.
const parse = (text: string): Segment[] =>
  text
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .flatMap((t) => {
      const accent = t.startsWith('*');
      return (accent ? t.slice(1, -1) : t).split(/\s+/).filter(Boolean).map((w) => ({text: w, accent}));
    });

// Lletra a mà que s'escriu traç a traç (tegaki + Caveat), amb el temps controlat pel fotograma.
export const HandWritten: React.FC<HandWrittenProps> = ({text, mode = 'stage', side = 'left', faceX, faceY, faceH, size, logo}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const segments = useMemo(() => parse(text), [text]);
  const lengths = useMemo(() => segments.map((s) => computeTimeline(s.text, caveat).totalDuration), [segments]);
  // Ritme de la font accelerat, però sempre acabant dins de la primera part del temps en pantalla.
  const total = lengths.reduce((a, b) => a + b, 0);
  const writeFrames = Math.min((total * fps) / MANUAL.writeSpeed, durationInFrames * MANUAL.writeFitFraction);
  const t = (frame / Math.max(1, writeFrames)) * total;
  const exit = blurInOut(frame, durationInFrames, -100); // només la sortida: l'entrada és l'escriptura
  const onCamera = mode === 'camera';
  const plain = segments.map((x) => x.text).join(' ');
  const fontSize = size ?? (onCamera ? MANUAL.cameraSize : plain.length > MANUAL.stageLongTextChars ? MANUAL.stageSizeLong : MANUAL.stageSize);
  let start = 0;
  const line = (
    <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: onCamera && side === 'left' ? 'flex-end' : onCamera ? 'flex-start' : 'center', columnGap: '0.28em', fontSize}}>
      {segments.map((s, i) => {
        const local = Math.min(lengths[i], Math.max(0, t - start)) + (t - start > lengths[i] ? t - start - lengths[i] : 0);
        start += lengths[i];
        return (
          <TegakiRenderer
            key={i}
            font={caveat}
            text={s.text}
            time={{mode: 'controlled', value: local}}
            style={{
              fontSize,
              lineHeight: 1.15,
              whiteSpace: 'pre',
              color: s.accent ? (onCamera ? MANUAL.accentOnCamera : MANUAL.accent) : onCamera ? MANUAL.inkOnCamera : MANUAL.ink,
            }}
          />
        );
      })}
    </div>
  );
  if (!onCamera) {
    return (
      <AbsoluteFill style={{background: MANUAL.stage, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: 120, opacity: exit.opacity, filter: exit.filter}}>
        {logo ? (
          <Img
            src={resolveSrc(logo)}
            style={{width: 150, height: 150, objectFit: 'contain', transform: `scale(${spring({frame, fps, config: {damping: 12, stiffness: 170}})}) rotate(-4deg)`}}
          />
        ) : null}
        {line}
      </AbsoluteFill>
    );
  }
  const fx = faceX ?? width / 2;
  const fy = faceY ?? height * 0.38;
  const gap = Math.max(190, (faceH ?? 300) * 0.62 + 40);
  const boxW = 640;
  const left = side === 'left' ? Math.max(40, fx - gap - boxW) : Math.min(width - 40 - boxW, fx + gap);
  return (
    <AbsoluteFill style={{opacity: exit.opacity, filter: `${exit.filter} drop-shadow(0 3px 10px rgba(0,0,0,.55))`}}>
      <div style={{position: 'absolute', left, width: boxW, top: Math.max(90, Math.min(height - 320, fy - 60))}}>{line}</div>
    </AbsoluteFill>
  );
};
