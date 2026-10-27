import React from 'react';

// Personatge pla, de cara (o d'esquena), estil il·lustració 2D de la sèrie. Origen: als peus, al mig.
export type Look = {skin: string; hair: string; style: 'long' | 'short' | 'curly' | 'bun'; top: string; pants: string; glasses?: boolean; coat?: boolean};
export type Pose = 'stand' | 'sit' | 'phone' | 'cheer' | 'point' | 'back';

export const CAST: Record<string, Look> = {
  laia: {skin: '#E8B796', hair: '#4A2E22', style: 'long', top: '#B33A4A', pants: '#2B3150'},
  pol: {skin: '#D9A57E', hair: '#1E1A1A', style: 'short', top: '#D9A23A', pants: '#2B3150'},
  marc: {skin: '#F0C4A0', hair: '#6B4A2A', style: 'curly', top: '#3D6FD9', pants: '#2B2B3A'},
  julia: {skin: '#C98E66', hair: '#2A1C16', style: 'bun', top: '#2F9E6E', pants: '#2B3150'},
  tutora: {skin: '#E8B796', hair: '#8A8A8A', style: 'bun', top: '#7A4FD0', pants: '#33334A', glasses: true},
  a: {skin: '#E8B796', hair: '#3B2A22', style: 'short', top: '#4E5A8A', pants: '#2B3150'},
  b: {skin: '#C98E66', hair: '#141010', style: 'long', top: '#8A4E7A', pants: '#2B3150'},
  c: {skin: '#F0C4A0', hair: '#B07A3A', style: 'curly', top: '#3E7A6A', pants: '#2B3150'},
  d: {skin: '#D9A57E', hair: '#2A1C16', style: 'bun', top: '#A0613A', pants: '#2B3150'},
};

const Hair: React.FC<{l: Look; back?: boolean}> = ({l, back}) => {
  const c = l.hair;
  switch (l.style) {
    case 'long':
      return (
        <g fill={c}>
          <path d="M-70 -540 Q-74 -620 0 -628 Q74 -620 70 -540 L76 -440 Q60 -420 44 -446 L44 -560 Q0 -590 -44 -560 L-44 -446 Q-60 -420 -76 -440 Z" />
          {back && <ellipse cx={0} cy={-545} rx={66} ry={70} />}
        </g>
      );
    case 'curly':
      return (
        <g fill={c}>
          {[-48, -24, 0, 24, 48].map((x, i) => <circle key={i} cx={x} cy={-598 + Math.abs(x) * 0.35} r={30} />)}
          <circle cx={-60} cy={-560} r={22} />
          <circle cx={60} cy={-560} r={22} />
          {back && <ellipse cx={0} cy={-545} rx={66} ry={68} />}
        </g>
      );
    case 'bun':
      return (
        <g fill={c}>
          <circle cx={0} cy={-628} r={30} />
          <path d="M-66 -548 Q-70 -616 0 -620 Q70 -616 66 -548 Q40 -584 0 -584 Q-40 -584 -66 -548 Z" />
          {back && <ellipse cx={0} cy={-545} rx={64} ry={66} />}
        </g>
      );
    default:
      return (
        <g fill={c}>
          <path d="M-66 -546 Q-72 -620 0 -624 Q72 -620 66 -546 Q54 -580 20 -588 Q-30 -590 -66 -546 Z" />
          {back && <ellipse cx={0} cy={-545} rx={64} ry={66} />}
        </g>
      );
  }
};

export const Person: React.FC<{look: Look; pose?: Pose; x: number; y: number; s?: number; lit?: number; blink?: boolean; smile?: boolean; mouthOpen?: boolean}> = ({
  look: l, pose = 'stand', x, y, s = 1, lit = 0, blink = false, smile = false, mouthOpen = false,
}) => {
  const back = pose === 'back';
  const sit = pose === 'sit' || pose === 'phone';
  const top = l.coat ? '#F4F6FA' : l.top;
  const legs = sit ? (
    <g>
      <rect x={-92} y={-250} width={184} height={70} rx={34} fill={l.pants} />
      <rect x={-88} y={-200} width={60} height={200} rx={28} fill={l.pants} />
      <rect x={28} y={-200} width={60} height={200} rx={28} fill={l.pants} />
      <ellipse cx={-58} cy={-4} rx={44} ry={18} fill="#1A1D2B" />
      <ellipse cx={58} cy={-4} rx={44} ry={18} fill="#1A1D2B" />
    </g>
  ) : (
    <g>
      <rect x={-70} y={-270} width={62} height={270} rx={28} fill={l.pants} />
      <rect x={8} y={-270} width={62} height={270} rx={28} fill={l.pants} />
      <ellipse cx={-40} cy={-4} rx={46} ry={18} fill="#1A1D2B" />
      <ellipse cx={40} cy={-4} rx={46} ry={18} fill="#1A1D2B" />
    </g>
  );
  const torsoTop = sit ? -470 : -490;
  const arms = (() => {
    if (pose === 'cheer')
      return (
        <g fill={top}>
          <rect x={-150} y={torsoTop - 160} width={52} height={190} rx={26} transform={`rotate(-18 -124 ${torsoTop + 20})`} />
          <rect x={98} y={torsoTop - 160} width={52} height={190} rx={26} transform={`rotate(18 124 ${torsoTop + 20})`} />
          <circle cx={-170} cy={torsoTop - 150} r={28} fill={l.skin} />
          <circle cx={170} cy={torsoTop - 150} r={28} fill={l.skin} />
        </g>
      );
    if (pose === 'point')
      return (
        <g fill={top}>
          <rect x={-136} y={torsoTop + 20} width={52} height={200} rx={26} />
          <rect x={90} y={torsoTop + 10} width={210} height={50} rx={25} transform={`rotate(-24 100 ${torsoTop + 35})`} />
          <circle cx={-110} cy={torsoTop + 222} r={27} fill={l.skin} />
          <circle cx={300} cy={torsoTop - 50} r={26} fill={l.skin} />
        </g>
      );
    if (pose === 'phone')
      return (
        <g>
          <rect x={-136} y={torsoTop + 20} width={52} height={150} rx={26} fill={top} />
          <rect x={84} y={torsoTop + 20} width={52} height={150} rx={26} fill={top} />
          <rect x={-104} y={torsoTop + 120} width={110} height={46} rx={23} fill={top} />
          <rect x={-6} y={torsoTop + 120} width={110} height={46} rx={23} fill={top} />
          <rect x={-34} y={torsoTop + 60} width={68} height={112} rx={10} fill="#111320" />
          <rect x={-28} y={torsoTop + 66} width={56} height={100} rx={7} fill="#BFE3FF" opacity={0.95} />
          <circle cx={-30} cy={torsoTop + 150} r={24} fill={l.skin} />
          <circle cx={30} cy={torsoTop + 150} r={24} fill={l.skin} />
        </g>
      );
    return (
      <g fill={top}>
        <rect x={-136} y={torsoTop + 20} width={52} height={210} rx={26} />
        <rect x={84} y={torsoTop + 20} width={52} height={210} rx={26} />
        <circle cx={-110} cy={torsoTop + 232} r={27} fill={l.skin} />
        <circle cx={110} cy={torsoTop + 232} r={27} fill={l.skin} />
      </g>
    );
  })();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {legs}
      <rect x={-104} y={torsoTop} width={208} height={sit ? 260 : 250} rx={56} fill={top} />
      {!back && <path d={`M-30 ${torsoTop + 4} Q0 ${torsoTop + 44} 30 ${torsoTop + 4}`} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={8} />}
      {l.coat && <line x1={0} y1={torsoTop + 30} x2={0} y2={torsoTop + 240} stroke="#C9CEDA" strokeWidth={5} />}
      {arms}
      <rect x={-22} y={torsoTop - 40} width={44} height={50} fill={l.skin} />
      <ellipse cx={0} cy={-545} rx={64} ry={70} fill={l.skin} />
      {!back && (
        <g>
          <ellipse cx={-66} cy={-540} rx={10} ry={16} fill={l.skin} />
          <ellipse cx={66} cy={-540} rx={10} ry={16} fill={l.skin} />
          {blink ? (
            <g stroke="#1A1D2B" strokeWidth={5}>
              <line x1={-34} y1={-548} x2={-14} y2={-548} />
              <line x1={14} y1={-548} x2={34} y2={-548} />
            </g>
          ) : (
            <g fill="#1A1D2B">
              <ellipse cx={-24} cy={-548} rx={7} ry={10} />
              <ellipse cx={24} cy={-548} rx={7} ry={10} />
            </g>
          )}
          <path d="M-36 -574 Q-24 -582 -12 -576 M12 -576 Q24 -582 36 -574" fill="none" stroke={l.hair} strokeWidth={6} strokeLinecap="round" />
          <path d="M-4 -536 Q0 -520 6 -528" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={4} />
          {mouthOpen ? (
            <ellipse cx={0} cy={-504} rx={10} ry={12} fill="#5A2A2A" />
          ) : (
            <path d={smile ? 'M-20 -508 Q0 -488 20 -508' : 'M-14 -502 L14 -502'} fill="none" stroke="#5A2A2A" strokeWidth={5} strokeLinecap="round" />
          )}
          {l.glasses && (
            <g fill="none" stroke="#1A1D2B" strokeWidth={4}>
              <circle cx={-24} cy={-548} r={18} />
              <circle cx={24} cy={-548} r={18} />
              <line x1={-6} y1={-548} x2={6} y2={-548} />
            </g>
          )}
        </g>
      )}
      <Hair l={l} back={back} />
      {lit > 0 && <ellipse cx={0} cy={-530} rx={58} ry={62} fill="#BFE3FF" opacity={0.12 * lit} />}
    </g>
  );
};
