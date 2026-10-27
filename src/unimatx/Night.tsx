import React from 'react';
import {Easing, interpolate} from 'remotion';
import {NIGHT} from '../../brand/unimatx';
import {POPPINS, clamp} from './base';

// L'habitació del «mentrestant»: isomètrica, fosca, una sola llum. Les targetes de sobre canvien segons el vídeo.
export type NightVariant = 'tabs' | 'sheet' | 'form' | 'dinner';

const pop = (f: number, at: number) => {
  const p = interpolate(f, [at, at + 10], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  return {opacity: Math.min(1, p * 1.4), transform: `scale(${0.85 + 0.15 * p}) translateY(${(1 - p) * 24}px)`};
};

const Card: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
  <div style={{position: 'absolute', background: '#FFFFFF', borderRadius: 18, boxShadow: '0 24px 60px rgba(0,0,0,0.45)', fontFamily: POPPINS, color: '#151833', ...style}}>
    {children}
  </div>
);

const Badge: React.FC<{n: number; style?: React.CSSProperties}> = ({n, style}) => (
  <div style={{position: 'absolute', minWidth: 84, height: 84, borderRadius: 42, background: NIGHT.badge, color: '#fff', fontFamily: POPPINS, fontWeight: 700, fontSize: 38, display: 'grid', placeItems: 'center', padding: '0 14px', boxShadow: '0 10px 30px rgba(229,72,77,0.5)', ...style}}>
    {n}
  </div>
);

const Bubble: React.FC<{who: string; text: string; style?: React.CSSProperties}> = ({who, text, style}) => (
  <div style={{background: '#FFFFFF', borderRadius: 16, padding: '10px 16px', boxShadow: '0 12px 30px rgba(0,0,0,0.4)', fontFamily: POPPINS, ...style}}>
    <div style={{fontSize: 17, fontWeight: 600, color: '#2F9E6E'}}>{who}</div>
    <div style={{fontSize: 24, color: '#151833'}}>{text}</div>
  </div>
);

const Room: React.FC<{f: number; table?: boolean}> = ({f, table}) => {
  const flicker = 0.92 + 0.08 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="lampglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={NIGHT.lamp} stopOpacity="0.55" />
          <stop offset="1" stopColor={NIGHT.lamp} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="screenglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={NIGHT.screen} stopOpacity="0.6" />
          <stop offset="1" stopColor={NIGHT.screen} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill={NIGHT.bg} />
      {/* parets i terra */}
      <polygon points="140,700 540,500 540,1080 140,1280" fill={NIGHT.wall} />
      <polygon points="540,500 940,700 940,1280 540,1080" fill={NIGHT.wallDark} />
      <polygon points="140,1280 540,1080 940,1280 540,1480" fill={NIGHT.floor} />
      {/* finestra amb estrelles */}
      <polygon points="640,640 840,740 840,920 640,820" fill="#0D1433" stroke="#3A4580" strokeWidth="6" />
      {[[680, 700], [760, 760], [800, 830], [700, 780]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#DDE6FF" opacity={0.5 + 0.5 * Math.sin(f / 9 + i)} />)}
      {/* rellotge */}
      <circle cx="330" cy="760" r="44" fill="#E9E4D8" />
      <line x1="330" y1="760" x2="330" y2="728" stroke="#151833" strokeWidth="5" />
      <line x1="330" y1="760" x2="354" y2="770" stroke="#151833" strokeWidth="5" />
      {/* llum de làmpada */}
      <circle cx="300" cy="900" r="300" fill="url(#lampglow)" opacity={flicker} />
      {table ? (
        <g>
          <polygon points="300,1170 540,1050 780,1170 540,1290" fill="#6B4A32" />
          <polygon points="300,1170 540,1290 540,1320 300,1200" fill="#4E3524" />
          <polygon points="540,1290 780,1170 780,1200 540,1320" fill="#3E2A1C" />
          {[[420, 1150], [540, 1210], [640, 1140]].map(([x, y], i) => <rect key={i} x={x} y={y} width={46} height={28} rx={6} fill="#1C2238" stroke={NIGHT.screen} strokeWidth="3" />)}
        </g>
      ) : (
        <g>
          {/* escriptori amb portàtil */}
          <polygon points="250,1120 470,1010 690,1120 470,1230" fill="#6B4A32" />
          <polygon points="250,1120 470,1230 470,1260 250,1150" fill="#4E3524" />
          <polygon points="470,1230 690,1120 690,1150 470,1260" fill="#3E2A1C" />
          <polygon points="400,1110 500,1060 560,1090 460,1140" fill="#2A3150" />
          <polygon points="400,1110 400,1010 500,960 500,1060" fill="#1C2238" />
          <polygon points="408,1100 408,1018 492,976 492,1058" fill={NIGHT.screen} opacity={0.85 * flicker} />
          <circle cx="450" cy="1040" r="220" fill="url(#screenglow)" opacity={0.7 * flicker} />
          {/* noi o noia, d'esquena */}
          <ellipse cx="560" cy="1150" rx="58" ry="74" fill="#2B2F4A" />
          <circle cx="562" cy="1060" r="40" fill="#3B2A22" />
        </g>
      )}
    </svg>
  );
};

export const Night: React.FC<{variant: NightVariant; f: number}> = ({variant, f}) => {
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Room f={f} table={variant === 'dinner'} />
      {variant === 'tabs' && (
        <>
          <Card style={{left: 80, top: 1330, width: 560, padding: 16, ...pop(f, 4)}}>
            <div style={{display: 'flex', gap: 4}}>
              {Array.from({length: 30}, (_, i) => <div key={i} style={{flex: 1, height: 22, borderRadius: '6px 6px 0 0', background: i === 29 ? '#FFFFFF' : '#D9DCE8', border: '1px solid #C3C7D6'}} />)}
            </div>
            <div style={{fontSize: 22, marginTop: 10, color: '#5B6180'}}>30 pestanyes obertes</div>
          </Card>
          <Card style={{left: 560, top: 1420, width: 440, padding: 18, ...pop(f, 14)}}>
            <div style={{fontSize: 22, fontWeight: 700}}>Grup 2n Batx</div>
            <div style={{display: 'grid', gap: 10, marginTop: 10}}>
              <Bubble who="Marta" text="tu què poses?" />
              <Bubble who="Pau" text="jo el mateix que tu" />
            </div>
          </Card>
          <Badge n={47} style={{left: 930, top: 1380, ...pop(f, 22)}} />
        </>
      )}
      {variant === 'sheet' && (
        <>
          <Card style={{left: 70, top: 1320, width: 600, padding: 16, ...pop(f, 4)}}>
            <div style={{display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 0, fontSize: 18}}>
              {['Alumne', 'Opció 1', 'Opció 2'].map((h) => <div key={h} style={{fontWeight: 700, background: '#E8F3EC', padding: 6, border: '1px solid #C8D6CC'}}>{h}</div>)}
              {Array.from({length: 18}, (_, i) => <div key={i} style={{height: 30, border: '1px solid #DDE0EA', background: i % 3 === 0 ? '#FFFFFF' : '#FAFBFD'}} />)}
            </div>
          </Card>
          <Card style={{left: 560, top: 1500, width: 460, padding: 18, ...pop(f, 14)}}>
            <div style={{fontSize: 18, color: '#5B6180'}}>Safata d'entrada</div>
            <div style={{fontSize: 23, fontWeight: 600, marginTop: 6}}>I el meu fill, què hauria de fer?</div>
          </Card>
          <Badge n={31} style={{left: 930, top: 1450, ...pop(f, 22)}} />
        </>
      )}
      {variant === 'form' && (
        <Card style={{left: 140, top: 1300, width: 800, padding: 22, ...pop(f, 4)}}>
          <div style={{fontSize: 22, fontWeight: 700}}>Preinscripció · preferències</div>
          <div style={{display: 'grid', gap: 8, marginTop: 12}}>
            {Array.from({length: 4}, (_, i) => (
              <div key={i} style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                <span style={{width: 36, fontSize: 20, fontWeight: 700, color: '#5B6180'}}>{i + 1}</span>
                <div style={{flex: 1, height: 46, borderRadius: 8, border: i === 0 ? '2px solid #151833' : '2px dashed #C3C7D6', fontSize: 22, display: 'flex', alignItems: 'center', padding: '0 12px'}}>
                  {i === 0 ? 'La universitat dels amics' : ''}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {variant === 'dinner' && (
        <>
          <Bubble who="El cosí" text="Fes el que fa diners." style={{position: 'absolute', left: 90, top: 1330, ...pop(f, 4)}} />
          <Bubble who="La tieta" text="Medicina, que té sortida." style={{position: 'absolute', left: 520, top: 1400, ...pop(f, 12)}} />
          <Card style={{left: 160, top: 1520, width: 520, padding: 16, ...pop(f, 20)}}>
            <div style={{fontSize: 20, fontWeight: 700}}>Rànquing d'internet</div>
            {[1, 2, 3].map((i) => <div key={i} style={{height: 18, marginTop: 8, borderRadius: 4, background: '#E4E6F0', width: `${90 - i * 15}%`}} />)}
          </Card>
        </>
      )}
    </div>
  );
};
