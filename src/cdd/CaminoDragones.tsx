import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as loadBarlow} from '@remotion/google-fonts/BarlowCondensed';
import {loadFont as loadWork} from '@remotion/google-fonts/WorkSans';
import {CDD as C} from '../../brand/cdd';
import M from '../../projectes/camino-dragones/muntatge.json';
import {duckVolume} from '../vendor/launch-video-kit/audio';

// Camino de Dragones en 44 s, vertical: la llegenda, què és, les xifres i la ruta real (els 32 trams de Mapy.com)
// dibuixant-se sobre el mapa mentre la veu diu per on passa. Tot el que surt és de caminodedragones.es/es i /rutas.
// Veu: projectes/camino-dragones/veu.json → vo.json → muntatge.json (scripts/cdd/muntatge.py); mapa i ruta:
// remotion/mapa.json (scripts/cdd/mapa_cdd.mjs); música: scripts/cdd/musica_cdd.py.
// --public-dir=projectes/camino-dragones/remotion

const {fontFamily: BAR} = loadBarlow('normal', {weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext']});
const {fontFamily: WORK} = loadWork('normal', {weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext']});

type Pt = [number, number, number];
type Leg = {n: number; name: string; km: number; gain: number; from: number; pts: Pt[]};
export type MapData = {
  view: [[number, number], [number, number]];
  land: {spain: string; france: string; andorra: string};
  catalonia: string;
  catBounds: [[number, number], [number, number]];
  dragons: Pt[];
  muniBorders: string;
  provBorders: string;
  legs: Leg[];
  relays: Pt[];
  totalKm: number;
  profile: [number, number][];
};
export type CddProps = {map: MapData | null};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
const inOut = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9áéíóúàèòïüçñ]/g, '');
const L = (id: string) => M.lines.find((l) => l.id === id)!;
const W = (id: string, w: string) => L(id).words.find((x) => norm(x.text).startsWith(w))!.f;
const end = (id: string) => L(id).from + L(id).frames;
const nf = (v: number, d = 0) => v.toLocaleString('es-ES', {minimumFractionDigits: d, maximumFractionDigits: d});

// Moments clau (fotogrames), tots de la veu.
const T = {
  legendOut: L('02').from + 45,
  full: L('03').from + 6,
  run: L('04').from,
  runEnd: end('08') - 24,
  fullAgain: L('09').from + 4,
};

type Cam = {x: number; y: number; s: number; sy: number};
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  x: a.x + (b.x - a.x) * k,
  y: a.y + (b.y - a.y) * k,
  s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * k),
  sy: a.sy + (b.sy - a.sy) * k,
});

export const CaminoDragones: React.FC<CddProps> = ({map}) => {
  const f = useCurrentFrame();
  if (!map) return null;
  const legs = map.legs;
  const all: Pt[] = legs.flatMap((l) => l.pts);
  const kmEnd = (n: number) => legs[n - 1].from + legs[n - 1].km;
  const total = map.totalKm;

  // Per on passa la veu: on ha de ser el cap de la ruta quan es diu cada lloc.
  const places = [
    {name: 'Camprodon', km: kmEnd(2), at: W('05', 'camprodon')},
    {name: 'Olot', km: kmEnd(5), at: W('05', 'olot')},
    {name: 'Susqueda', km: kmEnd(10), at: W('06', 'susqueda')},
    {name: 'Sant Hilari Sacalm', km: kmEnd(12), at: W('06', 'hilari')},
    {name: 'Arbúcies', km: kmEnd(13), at: W('06', 'arbúcies')},
    {name: 'Montnegre', km: kmEnd(15), at: W('07', 'montnegre')},
    {name: 'El Corredor', km: kmEnd(17), at: W('07', 'corredor')},
    {name: 'Barcelona', km: kmEnd(30), at: W('08', 'barcelona')},
  ];
  const keys: [number, number][] = [[T.run + 14, 0], ...places.map((p) => [p.at, p.km] as [number, number]), [W('08', 'besòs'), total]];
  const headKm = (fr: number) => {
    if (fr <= keys[0][0]) return 0;
    for (let i = 0; i + 1 < keys.length; i++) {
      if (fr < keys[i + 1][0]) return interpolate(fr, [keys[i][0], keys[i + 1][0]], [keys[i][1], keys[i + 1][1]], {easing: Easing.inOut(Easing.sin)});
    }
    return total;
  };
  const at = (km: number): [number, number] => {
    let lo = 0;
    let hi = all.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (all[m][2] <= km) lo = m;
      else hi = m;
    }
    const a = all[lo];
    const b = all[hi];
    const k = b[2] > a[2] ? Math.min(1, Math.max(0, (km - a[2]) / (b[2] - a[2]))) : 0;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  };
  const D = f < T.run ? -1 : headKm(f);
  const head = at(Math.max(0, D));

  // Càmera
  const [[v0x, v0y], [v1x, v1y]] = map.view;
  const full: Cam = {x: (v0x + v1x) / 2, y: (v0y + v1y) / 2, s: 1, sy: (v0y + v1y) / 2};
  const after: Cam = {...full, ...C.cam.after};
  const [[c0x, c0y], [c1x, c1y]] = map.catBounds;
  const legend: Cam = {x: (c0x + c1x) / 2, y: (c0y + c1y) / 2, s: (C.width * 0.94) / (c1x - c0x), sy: 900};
  const runCam = (fr: number): Cam => {
    let x = 0;
    let y = 0;
    for (let i = 0; i < C.cam.smooth; i++) {
      const p = at(Math.max(0, headKm(fr - i)));
      x += p[0] / C.cam.smooth;
      y += p[1] / C.cam.smooth;
    }
    return {x, y, s: interpolate(fr, [T.run, T.runEnd], [C.cam.runFrom, C.cam.runTo], clamp), sy: C.height * C.cam.headY};
  };
  let cam: Cam;
  if (f < T.legendOut) cam = legend;
  else if (f < T.full) cam = mix(legend, full, inOut(f, T.legendOut, T.full));
  else if (f < T.run) cam = full;
  else if (f < T.run + C.cam.move) cam = mix(full, runCam(f), inOut(f, T.run, T.run + C.cam.move));
  else if (f < T.runEnd) cam = runCam(f);
  else if (f < T.fullAgain) cam = mix(runCam(T.runEnd), after, inOut(f, T.runEnd, T.fullAgain));
  else cam = {...after, s: interpolate(f, [L('12').from, M.durationInFrames], [after.s, C.cam.closing], clamp)};
  const k = 1 / cam.s;

  // Ruta dibuixada fins a D (km)
  const drawn = legs
    .filter((l) => l.from < D)
    .map((l) => {
      const pts = l.pts.filter((p) => p[2] <= D);
      const tail = D < l.from + l.km ? at(D) : null;
      return [...pts.map((p) => `${p[0]},${p[1]}`), ...(tail ? [`${tail[0]},${tail[1]}`] : [])].join(' ');
    });
  const ghost = legs.map((l) => l.pts.map((p) => `${p[0]},${p[1]}`).join(' '));
  const ghostOp = ease(f, T.full - 10, T.full + 10) * 1;
  const legendOp = 1 - ease(f, T.legendOut, T.legendOut + 20);
  const legLeg = D < 0 ? 0 : Math.min(32, legs.findIndex((l) => l.from + l.km >= D) + 1 || 32);
  const altNow = D < 0 ? 0 : (map.profile.find((p) => p[0] >= D) ?? map.profile[map.profile.length - 1])[1];

  const lbl = (x: number, y: number, title: string, sub: string | null, a: number, key: string, accent = false) => (
    <g key={key} transform={`translate(${x} ${y}) scale(${k})`} opacity={a}>
      <circle r={9} fill={accent ? C.red : '#fff'} stroke={C.ink} strokeWidth={3} />
      <g transform={`translate(18 ${-14 + (1 - a) * 10})`}>
        <text fontFamily={BAR} fontWeight={800} fontSize={C.label.size} fill="#fff" stroke={C.ink} strokeWidth={8} paintOrder="stroke" style={{textTransform: 'uppercase', letterSpacing: 0.5}}>
          {title}
        </text>
        {sub && (
          <text y={30} fontFamily={WORK} fontWeight={600} fontSize={22} fill={accent ? C.red : C.sub} stroke={C.ink} strokeWidth={6} paintOrder="stroke">
            {sub}
          </text>
        )}
      </g>
    </g>
  );

  return (
    <AbsoluteFill style={{background: C.sea, fontFamily: WORK, color: C.text}}>
      <svg width={C.width} height={C.height} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="vig" cx="50%" cy="45%" r="75%">
            <stop offset="60%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.65} />
          </radialGradient>
        </defs>
        <g transform={`translate(${C.width / 2} ${cam.sy}) scale(${cam.s}) translate(${-cam.x} ${-cam.y})`}>
          <path d={map.land.france} fill={C.france} />
          <path d={map.land.andorra} fill={C.france} />
          <path d={map.land.spain} fill={C.land} />
          <path d={map.muniBorders} fill="none" stroke={C.muni} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <path d={map.provBorders} fill="none" stroke={C.prov} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
          <path d={map.catalonia} fill={C.red} fillOpacity={0.07 * legendOp} stroke={C.cat} strokeWidth={2.5} strokeOpacity={0.35 + 0.5 * legendOp} vectorEffect="non-scaling-stroke" />
          {/* els dracs de la llegenda */}
          {legendOp > 0 &&
            map.dragons.map(([x, y, r], i) => {
              const a0 = L('01').from + r * L('01').frames * 0.9;
              const p = ease(f, a0, a0 + C.dragons.pop);
              if (!p) return null;
              const s = C.dragons.size * k * (0.6 + 0.4 * p) * (0.8 + 0.4 * ((i * 37) % 10) / 10);
              return <image key={i} href={staticFile('drac.png')} x={x - s / 2} y={y - s / 2} width={s} height={s} opacity={p * legendOp} />;
            })}
          {/* la ruta: primer tota en gris, i en vermell fins on ha arribat */}
          {ghost.map((g, i) => (
            <polyline key={i} points={g} fill="none" stroke={C.route.ghost} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={ghostOp} />
          ))}
          {drawn.map((g, i) => (
            <React.Fragment key={i}>
              <polyline points={g} fill="none" stroke={C.red} strokeOpacity={0.28} strokeWidth={C.route.glow} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <polyline points={g} fill="none" stroke={C.red} strokeWidth={C.route.width} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </React.Fragment>
          ))}
          {map.relays.map(([x, y, km], i) =>
            D >= km - 0.01 ? <circle key={i} cx={x} cy={y} r={5.5 * k} fill="#fff" stroke={C.red} strokeWidth={2.5 * k} /> : null,
          )}
          {D >= 0 && D < total && (
            <g transform={`translate(${head[0]} ${head[1]}) scale(${k})`}>
              <circle r={26 + 6 * Math.sin(f / 4)} fill={C.red} opacity={0.25} />
              <circle r={13} fill={C.red} stroke="#fff" strokeWidth={4} />
            </g>
          )}
          {/* llocs: surten quan la veu els diu i hi arriba la ruta */}
          {D >= 0 && lbl(all[0][0], all[0][1], 'Vallter 2000', 'Salida · 1.993 m', ease(f, T.run + 4, T.run + 4 + C.label.in), 'start', true)}
          {places.map((p, i) => {
            if (f < p.at - 2) return null;
            const [x, y] = at(p.km);
            const a = ease(f, p.at - 2, p.at - 2 + C.label.in) * (f > T.fullAgain ? 0.0 : 1);
            return lbl(x, y, p.name, `km ${nf(p.km, 1)}`, a, `p${i}`);
          })}
          {D >= total - 0.01 && lbl(all[all.length - 1][0], all[all.length - 1][1], 'Meta', 'Sant Adrià de Besòs · 3 m', ease(f, keys[keys.length - 1][0], keys[keys.length - 1][0] + C.label.in), 'meta', true)}
        </g>
        <rect width={C.width} height={C.height} fill="url(#vig)" />
      </svg>

      <Legend f={f} />
      <Logo f={f} />
      <Stats f={f} />
      <Hud f={f} km={D} leg={legLeg} alt={altNow} total={total} />
      <Profile f={f} km={D} data={map.profile} total={total} />
      <DateCard f={f} />
      <Closing f={f} />

      {M.lines.map((l) => (
        <Sequence key={l.id} from={l.from} durationInFrames={l.frames + 6}>
          <Audio src={staticFile(`vo/vo-${l.id}.wav`)} />
        </Sequence>
      ))}
      <Audio src={staticFile('musica.wav')} volume={(fr) => duckVolume(fr, M.lines.map((l) => ({at: l.from, frames: l.frames})), C.duck, {total: M.durationInFrames, fadeOut: 24})} />
      {[T.legendOut, T.run, T.runEnd].map((a, i) => (
        <Sequence key={`w${i}`} from={a - 4} durationInFrames={20}>
          <Audio src={staticFile('whoosh.wav')} volume={C.sfx * 0.7} />
        </Sequence>
      ))}
      {places.map((p, i) => (
        <Sequence key={`p${i}`} from={p.at - 2} durationInFrames={8}>
          <Audio src={staticFile('pop.wav')} volume={C.sfx * 0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// Bloc de text que entra pujant i se'n va fonent-se.
const Block: React.FC<{f: number; from: number; to: number; style?: React.CSSProperties; children: React.ReactNode}> = ({f, from, to, style, children}) => {
  if (f < from - 1 || f > to + C.out) return null;
  const p = ease(f, from, from + C.enter) * (1 - ease(f, to, to + C.out));
  return <div style={{position: 'absolute', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px)`, ...style}}>{children}</div>;
};

const Shade: React.FC<{f: number; from: number; to: number; level?: number}> = ({f, from, to, level = 0.55}) => {
  const p = ease(f, from - 6, from + 6) * (1 - ease(f, to, to + C.out));
  return p ? <AbsoluteFill style={{background: C.ink, opacity: p * level}} /> : null;
};

const Legend: React.FC<{f: number}> = ({f}) => {
  const l = L('01');
  return (
    <Block f={f} from={l.from} to={end('01') + 4} style={{top: 1380, padding: '0 90px'}}>
      <div style={{fontFamily: WORK, fontWeight: 600, fontSize: 58, lineHeight: 1.18, textAlign: 'center', textShadow: '0 4px 24px rgba(0,0,0,0.8)'}}>
        {l.words.map((w, i) => (
          <span key={i} style={{opacity: ease(f, w.f - 2, w.f + 4), color: norm(w.text).startsWith('dragon') ? C.red : C.text}}>
            {w.text}{' '}
          </span>
        ))}
      </div>
    </Block>
  );
};

const Logo: React.FC<{f: number}> = ({f}) => {
  const a = L('02').from;
  const b = L('03').from - 4;
  const s = 0.9 + 0.1 * ease(f, a, a + 18);
  return (
    <>
      <Shade f={f} from={a} to={b} level={0.6} />
      <Block f={f} from={a} to={b} style={{top: 560}}>
        <Img src={staticFile('logo-blanc.png')} style={{width: 640, transform: `scale(${s})`}} />
        <div style={{marginTop: 46, fontFamily: BAR, fontWeight: 800, fontSize: 66, letterSpacing: 1, textTransform: 'uppercase', opacity: ease(f, W('02', 'carrera'), W('02', 'carrera') + 8)}}>Carrera de relevos</div>
        <div style={{fontFamily: BAR, fontWeight: 700, fontSize: 54, color: C.red, textTransform: 'uppercase', opacity: ease(f, W('02', 'pirineos'), W('02', 'pirineos') + 8)}}>De los Pirineos a Barcelona</div>
        <div style={{marginTop: 30, padding: '10px 26px', border: `2px solid ${C.red}`, borderRadius: 99, fontFamily: WORK, fontWeight: 600, fontSize: 30, opacity: ease(f, a + 30, a + 42)}}>2.ª edición · 12-13 junio 2027</div>
      </Block>
    </>
  );
};

const Stat: React.FC<{f: number; at: number; big: string; unit: string; sub?: string}> = ({f, at: a, big, unit, sub}) => {
  const p = ease(f, a - 3, a + 9);
  return (
    <div style={{display: 'flex', alignItems: 'baseline', gap: 22, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: 'left center'}}>
      <span style={{fontFamily: BAR, fontWeight: 800, fontSize: 210, lineHeight: 0.95, minWidth: 330, textAlign: 'right'}}>{big}</span>
      <span style={{display: 'flex', flexDirection: 'column'}}>
        <span style={{fontFamily: BAR, fontWeight: 800, fontSize: 78, color: C.red, textTransform: 'uppercase', lineHeight: 1}}>{unit}</span>
        {sub && <span style={{fontFamily: WORK, fontWeight: 600, fontSize: 30, color: C.sub}}>{sub}</span>}
      </span>
    </div>
  );
};

const Stats: React.FC<{f: number}> = ({f}) => {
  const a = L('03').from;
  const b = L('04').from - 2;
  return (
    <>
      <Shade f={f} from={a} to={b} level={0.5} />
      <Block f={f} from={a} to={b} style={{top: 520, alignItems: 'flex-start', paddingLeft: 60, gap: 34}}>
        <Stat f={f} at={W('03', 'doce')} big="12" unit="corredores" sub="por equipo (mínimo 9)" />
        <Stat f={f} at={W('03', 'trescientos')} big="300" unit="km" sub="de los Pirineos al mar" />
        <Stat f={f} at={W('03', 'treinta')} big="32" unit="tramos" sub="33 puntos de relevo" />
      </Block>
    </>
  );
};

const Hud: React.FC<{f: number; km: number; leg: number; alt: number; total: number}> = ({f, km, leg, alt, total}) => {
  const a = L('04').from + 6;
  const b = T.fullAgain;
  if (f < a - 1 || f > b + C.out) return null;
  const p = ease(f, a, a + C.enter) * (1 - ease(f, b, b + C.out));
  return (
    <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: C.hud.shade, opacity: p, background: `linear-gradient(${C.sea} 0%, ${C.sea}EE 55%, ${C.sea}00 100%)`}} />
    <div style={{position: 'absolute', left: 60, right: 60, top: C.hud.top, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: p}}>
      <div>
        <div style={{fontFamily: BAR, fontWeight: 700, fontSize: 34, color: C.sub, letterSpacing: 2}}>TRAMO</div>
        <div style={{fontFamily: BAR, fontWeight: 800, fontSize: 92, lineHeight: 0.9}}>
          {String(Math.max(1, leg)).padStart(2, '0')}
          <span style={{fontSize: 46, color: C.sub}}> / 32</span>
        </div>
      </div>
      <div style={{textAlign: 'right'}}>
        <div style={{fontFamily: BAR, fontWeight: 700, fontSize: 34, color: C.sub, letterSpacing: 2}}>KM</div>
        <div style={{fontFamily: BAR, fontWeight: 800, fontSize: 92, lineHeight: 0.9, color: C.red}}>
          {nf(Math.max(0, Math.min(km, total)), 1)}
          <span style={{fontSize: 46, color: C.sub}}> / {nf(total, 1)}</span>
        </div>
        <div style={{fontFamily: WORK, fontWeight: 600, fontSize: 28, color: C.sub, marginTop: 6}}>{nf(alt)} m de altitud</div>
      </div>
    </div>
    </>
  );
};

const Profile: React.FC<{f: number; km: number; data: [number, number][]; total: number}> = ({f, km, data, total}) => {
  const a = L('04').from + 10;
  const b = L('10').from - 4;
  if (f < a - 1 || f > b + C.out) return null;
  const P = C.profile;
  const p = ease(f, a, a + C.enter) * (1 - ease(f, b, b + C.out));
  const X = (d: number) => P.x + (d / total) * P.w;
  const Y = (h: number) => P.y + P.h - (h / P.max) * P.h;
  const line = data.map(([d, h]) => `${X(d).toFixed(1)},${Y(h).toFixed(1)}`).join(' ');
  const area = `${P.x},${P.y + P.h} ${line} ${P.x + P.w},${P.y + P.h}`;
  const big = ease(f, L('09').from, L('09').from + 14);
  const shown = big > 0 ? total : Math.max(0, km);
  const head = data.find((q) => q[0] >= shown) ?? data[data.length - 1];
  return (
    <div style={{position: 'absolute', inset: 0, opacity: p}}>
      <svg width={C.width} height={C.height} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="done">
            <rect x={P.x} y={P.y - 20} width={X(shown) - P.x} height={P.h + 40} />
          </clipPath>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.red} stopOpacity={0.55} />
            <stop offset="100%" stopColor={C.red} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <polygon points={area} fill="rgba(255,255,255,0.06)" />
        <polyline points={line} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} />
        <g clipPath="url(#done)">
          <polygon points={area} fill="url(#fill)" />
          <polyline points={line} fill="none" stroke={C.red} strokeWidth={3.5} />
        </g>
        {big < 1 && <circle cx={X(head[0])} cy={Y(head[1])} r={9} fill="#fff" stroke={C.red} strokeWidth={4} />}
        <text x={P.x} y={P.y + P.h + 34} fontFamily={WORK} fontWeight={600} fontSize={22} fill={C.sub}>Vallter 2000 · 1.993 m</text>
        <text x={P.x + P.w} y={P.y + P.h + 34} textAnchor="end" fontFamily={WORK} fontWeight={600} fontSize={22} fill={C.sub}>Sant Adrià de Besòs · 3 m</text>
      </svg>
      {big > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: C.climb.top, textAlign: 'center', opacity: big, transform: `translateY(${(1 - big) * 30}px)`}}>
          <div style={{fontFamily: BAR, fontWeight: 800, fontSize: 170, lineHeight: 0.9, color: C.text, textShadow: '0 6px 30px rgba(0,0,0,0.8)'}}>
            8.842 <span style={{color: C.red}}>m</span>
          </div>
          <div style={{fontFamily: BAR, fontWeight: 700, fontSize: 48, color: C.sub, textTransform: 'uppercase', letterSpacing: 1}}>de desnivel positivo</div>
        </div>
      )}
    </div>
  );
};

const DateCard: React.FC<{f: number}> = ({f}) => {
  const a = L('10').from;
  const b = L('12').from - 4;
  return (
    <>
      <Shade f={f} from={a} to={b} level={0.6} />
      <Block f={f} from={a} to={b} style={{top: 640}}>
        <div style={{fontFamily: BAR, fontWeight: 700, fontSize: 44, color: C.sub, letterSpacing: 3}}>2.ª EDICIÓN</div>
        <div style={{fontFamily: BAR, fontWeight: 800, fontSize: 190, lineHeight: 0.9}}>12-13</div>
        <div style={{fontFamily: BAR, fontWeight: 800, fontSize: 96, color: C.red, lineHeight: 1}}>JUNIO 2027</div>
        <div style={{marginTop: 70, opacity: ease(f, L('11').from, L('11').from + 10), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{fontFamily: BAR, fontWeight: 700, fontSize: 44, color: C.sub, letterSpacing: 3}}>INSCRIPCIONES</div>
          <div style={{fontFamily: BAR, fontWeight: 800, fontSize: 76}}>8 NOV 2026 · 11:00</div>
        </div>
      </Block>
    </>
  );
};

const Closing: React.FC<{f: number}> = ({f}) => {
  const a = L('12').from;
  return (
    <>
      <Shade f={f} from={a} to={M.durationInFrames + 20} level={0.62} />
      <Block f={f} from={a} to={M.durationInFrames + 20} style={{top: 600}}>
        <Img src={staticFile('logo-blanc.png')} style={{width: 600}} />
        <div style={{marginTop: 50, fontFamily: BAR, fontWeight: 800, fontSize: 80, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1}}>
          Un reto, <span style={{color: C.red}}>mil leyendas</span>
        </div>
        <div style={{marginTop: 34, fontFamily: WORK, fontWeight: 600, fontSize: 36, color: C.sub, opacity: ease(f, a + 20, a + 32)}}>caminodedragones.es</div>
      </Block>
    </>
  );
};

export const cddMetadata = async ({props}: {props: CddProps}) => {
  const map: MapData = await fetch(staticFile('mapa.json')).then((r) => r.json());
  return {durationInFrames: M.durationInFrames, props: {...props, map}};
};
