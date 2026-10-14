import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {fitText} from '@remotion/layout-utils';
import {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, random, staticFile} from 'remotion';
import {MINIATURA} from '../../brand/estil';

const {fontFamily: BOLD, waitUntilDone: boldLoaded} = loadInter('normal', {
  weights: ['900'],
  subsets: ['latin', 'latin-ext'],
});
const {fontFamily: HAND} = loadCaveat('normal', {
  weights: ['700'],
  subsets: ['latin', 'latin-ext'],
});

// Miniatura de YouTube (1280×720), amb la llum fosca i cinematogràfica que va triar l'usuari (docs/MINIATURES.md):
// cine    — text blanc molt gruixut a la dreta i l'última paraula en groc («It's So F*cking Simple.»);
// pizarra — un esquema dibuixat amb retolador a la paret fosca (com la pissarra «CONFIDENCE / Pillar 1 2 3»).
export type MiniaturaProps = {
  variant: 'cine' | 'pizarra';
  // Rutes dins de --public-dir: persona retallada i fons sense la persona (scripts/retalla_foto.py).
  person: string;
  background: string;
  // Mida de la foto i posició de la cara a la foto, en píxels (YuNet): centre x, alçada dels ulls i alçada de la cara.
  photoW: number;
  photoH: number;
  face: {x: number; eyesY: number; h: number};
  // cine: una línia per element; entre *asteriscs*, en groc.
  lines?: string[];
  // pizarra: el requadre de dalt, els pilars de sota i el text del rellotge.
  board?: {box: string; pillars: string[]; clock: string};
};

// ---------- Traç a mà (retolador): línies amb una mica de tremolor, sempre la mateixa per a la mateixa llavor ----------
type Pt = [number, number];
const wobbly = (pts: Pt[], seed: string): string => {
  const out: Pt[] = [pts[0]];
  pts.slice(1).forEach(([x1, y1], i) => {
    const [x0, y0] = pts[i];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 70));
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      const j = k === n ? 0.4 : 1;
      out.push([
        x0 + (x1 - x0) * t + (random(`${seed}-${i}-${k}-x`) - 0.5) * 2 * MINIATURA.wobblePx * j,
        y0 + (y1 - y0) * t + (random(`${seed}-${i}-${k}-y`) - 0.5) * 2 * MINIATURA.wobblePx * j,
      ]);
    }
  });
  return out.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
};
// Una mica més de 360°: el retolador es passa de llarg on tanca el cercle.
const circlePts = (cx: number, cy: number, r: number, seed: string): Pt[] =>
  Array.from({length: 27}, (_, i) => {
    const a = -Math.PI / 2 + (i / 24) * Math.PI * 2;
    const rr = r * (1 + (random(`${seed}-${i}`) - 0.5) * 0.08);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as Pt;
  });
// Rectangle que comença una mica abans de la cantonada i es passa en tancar, com quan es dibuixa d'una tirada.
const rectPts = (x: number, y: number, w: number, h: number): Pt[] => [
  [x - 6, y + 2],
  [x + w, y],
  [x + w + 2, y + h],
  [x, y + h + 2],
  [x + 2, y - 8],
];

// Dos traços lleugerament diferents un sobre l'altre: sembla retolador, no vector.
const Stroke: React.FC<{d: (pass: number) => string; color: string}> = ({d, color}) => (
  <>
    <path d={d(0)} fill="none" stroke={color} strokeWidth={MINIATURA.strokePx} strokeLinecap="round" strokeLinejoin="round" />
    <path
      d={d(1)}
      fill="none"
      stroke={color}
      strokeWidth={MINIATURA.strokePx * 0.55}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.7}
    />
  </>
);

const Board: React.FC<{box: string; pillars: string[]; clock: string}> = ({box, pillars, clock}) => {
  const b = MINIATURA.board;
  const {chalk, yellow} = MINIATURA;
  const pw = (b.box.w - b.pillarGap * (pillars.length - 1)) / pillars.length;
  const top = b.box.y + b.box.h;
  const f = b.figure;
  const feet = b.box.y - 14;
  const rays = Array.from({length: 7}, (_, i) => -Math.PI + (i + 0.5) * (Math.PI / 7));
  const c = b.clock;
  const text = {fontFamily: HAND, fontWeight: MINIATURA.handWeight} as const;
  return (
    <svg width={MINIATURA.width} height={MINIATURA.height} style={{position: 'absolute', inset: 0, filter: MINIATURA.chalkShadow}}>
      {/* Rellotge amb les agulles a les 3: el «3 minuts» */}
      <Stroke d={(s) => wobbly(circlePts(c.x, c.y, c.r, `clock${s}`), `clock-l${s}`)} color={chalk} />
      <Stroke
        d={(s) =>
          wobbly(
            [
              [c.x, c.y],
              [c.x, c.y - c.r * 0.7],
            ],
            `h1${s}`,
          )
        }
        color={chalk}
      />
      <Stroke
        d={(s) =>
          wobbly(
            [
              [c.x, c.y],
              [c.x + c.r * 0.55, c.y],
            ],
            `h2${s}`,
          )
        }
        color={chalk}
      />
      <text x={c.x + c.r + 18} y={c.y + b.clockTextPx * 0.32} fill={yellow} fontSize={b.clockTextPx} {...text}>
        {clock}
      </text>
      {/* Ninot amb raigs (segur de si mateix) dalt del requadre */}
      <Stroke d={(s) => wobbly(circlePts(f.x, f.y, f.head, `head${s}`), `head-l${s}`)} color={chalk} />
      {rays.map((a, i) => (
        <Stroke
          key={i}
          d={(s) =>
            wobbly(
              [
                [f.x + Math.cos(a) * (f.head + 10), f.y + Math.sin(a) * (f.head + 10)],
                [f.x + Math.cos(a) * (f.head + 30), f.y + Math.sin(a) * (f.head + 30)],
              ],
              `ray${i}${s}`,
            )
          }
          color={yellow}
        />
      ))}
      <Stroke
        d={(s) =>
          wobbly(
            [
              [f.x, f.y + f.head],
              [f.x, feet - 40],
            ],
            `body${s}`,
          )
        }
        color={chalk}
      />
      <Stroke
        d={(s) =>
          wobbly(
            [
              [f.x - 34, f.y + f.head + 6],
              [f.x, f.y + f.head + 26],
              [f.x + 34, f.y + f.head + 6],
            ],
            `arms${s}`,
          )
        }
        color={chalk}
      />
      <Stroke
        d={(s) =>
          wobbly(
            [
              [f.x - 22, feet],
              [f.x, feet - 40],
              [f.x + 22, feet],
            ],
            `legs${s}`,
          )
        }
        color={chalk}
      />
      {/* Requadre (el resultat) i pilars (les eines) */}
      <Stroke d={(s) => wobbly(rectPts(b.box.x, b.box.y, b.box.w, b.box.h), `box${s}`)} color={yellow} />
      <text
        x={b.box.x + b.box.w / 2}
        y={b.box.y + b.box.h / 2 + b.boxTextPx * 0.3}
        textAnchor="middle"
        fill={yellow}
        fontSize={b.boxTextPx}
        {...text}
      >
        {box}
      </text>
      {pillars.map((label, i) => {
        const x = b.box.x + i * (pw + b.pillarGap);
        return (
          <g key={label}>
            <Stroke d={(s) => wobbly(rectPts(x, top + 8, pw, b.pillarsBottom - top - 8), `p${i}${s}`)} color={chalk} />
            <text
              x={x + pw / 2}
              y={(top + b.pillarsBottom) / 2 + b.pillarTextPx * 0.3}
              textAnchor="middle"
              fill={chalk}
              fontSize={b.pillarTextPx}
              {...text}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Cada línia ha de cabre sencera (sense salts sobrers): la mida surt de la línia més llarga, amb la font ja carregada.
const useFittedSize = (lines: string[]): number | null => {
  const [size, setSize] = useState<number | null>(null);
  const key = lines.join('\n');
  useEffect(() => {
    const handle = delayRender('Mida del text de la miniatura');
    boldLoaded().then(() => {
      const width = MINIATURA.width - MINIATURA.textLeft - MINIATURA.textRight;
      const fits = lines.map(
        (l) =>
          fitText({
            text: l.replaceAll('*', ''),
            withinWidth: width,
            fontFamily: BOLD,
            fontWeight: MINIATURA.fontWeight,
            letterSpacing: MINIATURA.letterSpacing,
          }).fontSize,
      );
      setSize(Math.min(MINIATURA.textMaxPx, ...fits));
      continueRender(handle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return size;
};

const Lines: React.FC<{lines: string[]}> = ({lines}) => {
  const fontSize = useFittedSize(lines);
  if (fontSize === null) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: MINIATURA.textLeft,
        right: MINIATURA.textRight,
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: BOLD,
        fontWeight: MINIATURA.fontWeight,
        fontSize,
        lineHeight: MINIATURA.textLineHeight,
        letterSpacing: MINIATURA.letterSpacing,
        color: MINIATURA.white,
        textShadow: MINIATURA.textShadow,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>
          {l
            .split(/(\*[^*]+\*)/)
            .filter(Boolean)
            .map((t, j) =>
              t.startsWith('*') ? (
                <span key={j} style={{color: MINIATURA.yellow}}>
                  {t.slice(1, -1)}
                </span>
              ) : (
                <span key={j}>{t}</span>
              ),
            )}
        </div>
      ))}
    </div>
  );
};

export const Miniatura: React.FC<MiniaturaProps> = ({variant, person, background, photoW, photoH, face, lines = [], board}) => {
  const {eyes} = MINIATURA;
  // Persona: la cara a la mida i el lloc del disseny. Fons (sense la persona): prou gran per cobrir tot el quadre.
  const k = MINIATURA.faceH / face.h;
  const kBg = Math.max(k, MINIATURA.bgMinScale, (MINIATURA.width - eyes.x) / (photoW - face.x));
  const at = (s: number) =>
    ({
      position: 'absolute',
      left: eyes.x - face.x * s,
      top: eyes.y - face.eyesY * s,
      width: photoW * s,
      height: photoH * s,
    }) as const;
  return (
    <AbsoluteFill style={{background: MINIATURA.base, overflow: 'hidden'}}>
      <Img src={staticFile(background)} style={{...at(kBg), filter: MINIATURA.bgFilter}} />
      <AbsoluteFill style={{background: MINIATURA.bgTint}} />
      <Img src={staticFile(person)} style={{...at(k), filter: MINIATURA.personFilter}} />
      <AbsoluteFill
        style={{
          background: MINIATURA.spot(eyes.x, eyes.y + MINIATURA.spotBelowEyes),
        }}
      />
      {variant === 'cine' ? <Lines lines={lines} /> : null}
      {variant === 'pizarra' && board ? <Board {...board} /> : null}
    </AbsoluteFill>
  );
};
