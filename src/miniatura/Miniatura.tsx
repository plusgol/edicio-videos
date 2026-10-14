import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadPixel} from '@remotion/google-fonts/PressStart2P';
import {fitText} from '@remotion/layout-utils';
import {useEffect, useRef, useState} from 'react';
import {AbsoluteFill, Img, cancelRender, continueRender, delayRender, random, staticFile} from 'remotion';
import {MINIATURA} from '../../brand/estil';

const {fontFamily: BOLD, waitUntilDone: boldLoaded} = loadInter('normal', {
  weights: ['900'],
  subsets: ['latin', 'latin-ext'],
});
const {fontFamily: PIXEL, waitUntilDone: pixelLoaded} = loadPixel('normal', {weights: ['400'], subsets: ['latin']});
const {fontFamily: HAND} = loadCaveat('normal', {
  weights: ['700'],
  subsets: ['latin', 'latin-ext'],
});

// Miniatura de YouTube (1280×720), amb la llum fosca i cinematogràfica que va triar l'usuari (docs/MINIATURES.md):
// cine    — text blanc molt gruixut a la dreta i l'última paraula en groc («It's So F*cking Simple.»);
// pizarra — un esquema dibuixat amb retolador a la paret fosca (com la pissarra «CONFIDENCE / Pillar 1 2 3»);
// centro  — la persona al mig (la foto sencera, sense retallar), la xifra en groc a l'esquerra, el resultat a la dreta
//           i una fletxa a mà per sobre del cap (boceto aprovat per l'usuari);
// lliure  — la mateixa foto centrada i una llista d'elements (text, logo pixelat, fletxa) amb la posició a les props:
//           per fer prototips de composició des de miniatures.json sense tocar codi.
export type Element =
  | {
      type: 'text';
      lines: string[];
      x: number;
      y: number;
      w: number;
      h: number;
      align?: 'left' | 'center';
      maxPx: number;
      font?: 'bold' | 'pixel';
    }
  | {type: 'logo'; src: string; x: number; y: number; size: number; grid: number; tint?: string}
  | {type: 'arrow'; from: [number, number]; ctrl: [number, number]; to: [number, number]};

export type MiniaturaProps = {
  variant: 'cine' | 'pizarra' | 'centro' | 'lliure';
  // lliure: alçada dels ulls de la persona (centrada) i elements a sobre.
  eyesY?: number;
  elements?: Element[];
  // Rutes dins de --public-dir: persona retallada i fons sense la persona (scripts/retalla_foto.py)…
  person?: string;
  background?: string;
  // …o, per a centro, la foto sencera.
  photo?: string;
  // Mida de la foto i posició de la cara a la foto, en píxels (YuNet): centre x, alçada dels ulls i alçada de la cara.
  photoW: number;
  photoH: number;
  face: {x: number; eyesY: number; h: number};
  // cine i centro (a la dreta): una línia per element; entre *asteriscs*, en groc.
  lines?: string[];
  // centro: la xifra de l'esquerra, en groc (p. ex. la durada exacta del vídeo).
  big?: string;
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

// Fletxa feta a mà (retolador) de «from» a «to», corbada cap a «ctrl».
const Arrow: React.FC<{from: Pt; ctrl: Pt; to: Pt; color: string}> = ({from, ctrl, to, color}) => {
  const n = 24;
  const pts: Pt[] = Array.from({length: n + 1}, (_, i) => {
    const t = i / n;
    return [
      (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * ctrl[0] + t * t * to[0],
      (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * ctrl[1] + t * t * to[1],
    ];
  });
  const [px, py] = pts[n - 2];
  const ang = Math.atan2(to[1] - py, to[0] - px);
  const head = (da: number): Pt[] => [
    to,
    [to[0] - Math.cos(ang + da) * MINIATURA.centro.arrowHeadPx, to[1] - Math.sin(ang + da) * MINIATURA.centro.arrowHeadPx],
  ];
  return (
    <svg width={MINIATURA.width} height={MINIATURA.height} style={{position: 'absolute', inset: 0, filter: MINIATURA.chalkShadow}}>
      <Stroke d={(s) => wobbly(pts, `arrow${s}`)} color={color} />
      <Stroke d={(s) => wobbly(head(0.5), `ah1${s}`)} color={color} />
      <Stroke d={(s) => wobbly(head(-0.5), `ah2${s}`)} color={color} />
    </svg>
  );
};

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
const useFittedSize = (lines: string[], width: number, maxPx: number, font: 'bold' | 'pixel' = 'bold'): number | null => {
  const [size, setSize] = useState<number | null>(null);
  const key = `${lines.join('\n')}|${width}|${maxPx}|${font}`;
  useEffect(() => {
    const handle = delayRender('Mida del text de la miniatura');
    (font === 'pixel' ? pixelLoaded() : boldLoaded()).then(() => {
      const fits = lines.map(
        (l) =>
          fitText({
            text: l.replaceAll('*', ''),
            withinWidth: width,
            fontFamily: font === 'pixel' ? PIXEL : BOLD,
            fontWeight: font === 'pixel' ? MINIATURA.pixel.fontWeight : MINIATURA.fontWeight,
            letterSpacing: font === 'pixel' ? MINIATURA.pixel.letterSpacing : MINIATURA.letterSpacing,
          }).fontSize,
      );
      setSize(Math.min(maxPx, ...fits));
      continueRender(handle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return size;
};

type Box = {left: number; width: number; top?: number; height?: number; align?: 'left' | 'center'; maxPx: number; font?: 'bold' | 'pixel'};
const Lines: React.FC<{lines: string[]} & Box> = ({
  lines,
  left,
  width,
  top = 0,
  height = MINIATURA.height,
  align = 'left',
  maxPx,
  font = 'bold',
}) => {
  const fontSize = useFittedSize(lines, width, maxPx, font);
  const pixel = font === 'pixel';
  if (fontSize === null) {
    return null;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left,
        width,
        top,
        height,
        textAlign: align,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: pixel ? PIXEL : BOLD,
        fontWeight: pixel ? MINIATURA.pixel.fontWeight : MINIATURA.fontWeight,
        fontSize,
        lineHeight: pixel ? MINIATURA.pixel.lineHeight : MINIATURA.textLineHeight,
        letterSpacing: pixel ? MINIATURA.pixel.letterSpacing : MINIATURA.letterSpacing,
        color: MINIATURA.white,
        textShadow: pixel ? MINIATURA.pixel.textShadow : MINIATURA.textShadow,
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

// Persona al centre amb la foto sencera: l'amplada cobreix el quadre i, per sobre, un fons ambient (la mateixa foto,
// gran i desenfocada) deixa aire per al que va a dalt; la vora de dalt i la de l'esquerra de la foto es fonen amb ell.
type PhotoProps = Pick<MiniaturaProps, 'photo' | 'photoW' | 'photoH' | 'face'> & {eyesY: number};
const CenteredPhoto: React.FC<PhotoProps> = ({photo = '', photoW, photoH, face, eyesY}) => {
  const c = MINIATURA.centro;
  const k = MINIATURA.width / photoW;
  const kA = k * c.ambientScale;
  return (
    <>
      <Img
        src={staticFile(photo)}
        style={{
          position: 'absolute',
          left: MINIATURA.width / 2 - face.x * kA,
          top: eyesY - face.eyesY * kA,
          width: photoW * kA,
          height: photoH * kA,
          filter: c.ambientFilter,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: MINIATURA.width / 2 - face.x * k,
          top: eyesY - face.eyesY * k,
          width: photoW * k,
          height: photoH * k,
          WebkitMaskImage: c.featherTop,
          maskImage: c.featherTop,
        }}
      >
        <Img
          src={staticFile(photo)}
          style={{width: '100%', height: '100%', display: 'block', WebkitMaskImage: c.featherLeft, maskImage: c.featherLeft}}
        />
      </div>
      <AbsoluteFill style={{background: c.vignette}} />
    </>
  );
};

const Centro: React.FC<Pick<MiniaturaProps, 'photo' | 'photoW' | 'photoH' | 'face' | 'big' | 'lines'>> = ({big, lines = [], ...photo}) => {
  const c = MINIATURA.centro;
  return (
    <>
      <CenteredPhoto {...photo} eyesY={c.eyesY} />
      <Arrow from={c.arrow.from} ctrl={c.arrow.ctrl} to={c.arrow.to} color={MINIATURA.chalk} />
      {big ? (
        <Lines lines={[`*${big}*`]} left={c.left.x} width={c.left.w} top={c.textTop} height={c.textH} align="center" maxPx={c.bigMaxPx} />
      ) : null}
      <Lines lines={lines} left={c.right.x} width={c.right.w} top={c.textTop} height={c.textH} align="center" maxPx={c.linesMaxPx} />
    </>
  );
};

// Logo pixelat (com un objecte de videojoc retro): el vector es dibuixa a una graella petita (grid×grid), l'alfa es
// talla a 0/1 perquè les vores siguin esglaons nets, i s'amplia sense suavitzar. Els logos d'un sol color (currentColor,
// que en una imatge surt negre) es pinten del color «tint».
const PixelLogo: React.FC<{src: string; x: number; y: number; size: number; grid: number; tint?: string}> = ({
  src,
  x,
  y,
  size,
  grid,
  tint,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender(`Logo pixelat ${src}`));
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const small = document.createElement('canvas');
      small.width = grid;
      small.height = grid;
      const sctx = small.getContext('2d')!;
      sctx.drawImage(img, 0, 0, grid, grid);
      const data = sctx.getImageData(0, 0, grid, grid);
      const rgb = tint ? [1, 3, 5].map((i) => parseInt(tint.slice(i, i + 2), 16)) : null;
      for (let i = 0; i < data.data.length; i += 4) {
        const on = data.data[i + 3] >= MINIATURA.pixel.alphaThreshold;
        if (on && rgb) {
          [data.data[i], data.data[i + 1], data.data[i + 2]] = rgb;
        }
        data.data[i + 3] = on ? 255 : 0;
      }
      sctx.putImageData(data, 0, 0);
      const ctx = ref.current!.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, size, size);
      continueRender(handle);
    };
    img.onerror = () => cancelRender(new Error(`No s'ha pogut carregar ${src}`));
    img.src = staticFile(src);
  }, [src, grid, size, tint, handle]);
  return (
    <canvas ref={ref} width={size} height={size} style={{position: 'absolute', left: x, top: y, filter: MINIATURA.pixel.logoShadow}} />
  );
};

const Lliure: React.FC<Pick<MiniaturaProps, 'photo' | 'photoW' | 'photoH' | 'face' | 'eyesY' | 'elements'>> = ({
  eyesY = MINIATURA.centro.eyesY,
  elements = [],
  ...photo
}) => (
  <>
    <CenteredPhoto {...photo} eyesY={eyesY} />
    {elements.map((e, i) =>
      e.type === 'text' ? (
        <Lines key={i} lines={e.lines} left={e.x} width={e.w} top={e.y} height={e.h} align={e.align} maxPx={e.maxPx} font={e.font} />
      ) : e.type === 'logo' ? (
        <PixelLogo key={i} {...e} />
      ) : (
        <Arrow key={i} from={e.from} ctrl={e.ctrl} to={e.to} color={MINIATURA.chalk} />
      ),
    )}
  </>
);

export const Miniatura: React.FC<MiniaturaProps> = ({
  variant,
  person = '',
  background = '',
  photo,
  photoW,
  photoH,
  face,
  lines = [],
  big,
  board,
  eyesY,
  elements,
}) => {
  if (variant === 'lliure') {
    return (
      <AbsoluteFill style={{background: MINIATURA.base, overflow: 'hidden'}}>
        <Lliure photo={photo} photoW={photoW} photoH={photoH} face={face} eyesY={eyesY} elements={elements} />
      </AbsoluteFill>
    );
  }
  if (variant === 'centro') {
    return (
      <AbsoluteFill style={{background: MINIATURA.base, overflow: 'hidden'}}>
        <Centro photo={photo} photoW={photoW} photoH={photoH} face={face} big={big} lines={lines} />
      </AbsoluteFill>
    );
  }
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
      {variant === 'cine' ? (
        <Lines
          lines={lines}
          left={MINIATURA.textLeft}
          width={MINIATURA.width - MINIATURA.textLeft - MINIATURA.textRight}
          maxPx={MINIATURA.textMaxPx}
        />
      ) : null}
      {variant === 'pizarra' && board ? <Board {...board} /> : null}
    </AbsoluteFill>
  );
};
