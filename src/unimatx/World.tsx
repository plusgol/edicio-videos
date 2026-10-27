import React, {useMemo} from 'react';
import {ISO} from '../../brand/unimatx';
import {JAKARTA} from './base';

// Ciutat isomètrica (projecció 2:1). Els llocs on passa la història (cases, institut, campus) són `Landmark`s.
export type LandmarkKind = 'house' | 'school' | 'campus' | 'home';
export type Landmark = {id: string; kind: LandmarkKind; gx: number; gy: number; roof?: string; label?: string};
export type WorldTheme = 'day' | 'dusk';

const {tileW: W, tileH: H, grid: G, roadEvery: R} = ISO;
export const iso = (x: number, y: number, z = 0): [number, number] => [((x - y) * W) / 2, ((x + y) * H) / 2 - z];

const rand = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const pts = (...p: [number, number][]) => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');

type Box = {x0: number; y0: number; x1: number; y1: number; h: number; roof: string; windows?: boolean[]; flag?: boolean; lawn?: boolean};

const BoxShape: React.FC<{b: Box; dusk: boolean}> = ({b, dusk}) => {
  const {x0, y0, x1, y1, h} = b;
  const top = pts(iso(x0, y0, h), iso(x1, y0, h), iso(x1, y1, h), iso(x0, y1, h));
  const left = pts(iso(x0, y1, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x0, y1, h));
  const right = pts(iso(x1, y0, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x1, y0, h));
  // Teulada a dues aigües: un carener al mig, de y0 a y1.
  const mx = (x0 + x1) / 2;
  const ridge = h + Math.min(26, (x1 - x0) * 30);
  const roofL = pts(iso(x0, y0, h), iso(mx, y0, ridge), iso(mx, y1, ridge), iso(x0, y1, h));
  const roofR = pts(iso(mx, y0, ridge), iso(x1, y0, h), iso(x1, y1, h), iso(mx, y1, ridge));
  const gable = pts(iso(x0, y1, h), iso(mx, y1, ridge), iso(x1, y1, h));
  const win: React.ReactNode[] = [];
  if (b.windows) {
    const n = b.windows.length / 2;
    const z0 = h * 0.3, z1 = h * 0.62;
    for (let i = 0; i < n; i++) {
      const a0 = (i + 0.25) / n, a1 = (i + 0.75) / n;
      const xa = x0 + (x1 - x0) * a0, xb = x0 + (x1 - x0) * a1;
      const ya = y0 + (y1 - y0) * a0, yb = y0 + (y1 - y0) * a1;
      win.push(<polygon key={`l${i}`} points={pts(iso(xa, y1, z0), iso(xb, y1, z0), iso(xb, y1, z1), iso(xa, y1, z1))} fill={b.windows[i] ? ISO.windowLit : '#6B7088'} opacity={dusk || b.windows[i] ? 1 : 0.45} />);
      win.push(<polygon key={`r${i}`} points={pts(iso(x1, ya, z0), iso(x1, yb, z0), iso(x1, yb, z1), iso(x1, ya, z1))} fill={b.windows[n + i] ? ISO.windowLit : '#5D627A'} opacity={dusk || b.windows[n + i] ? 1 : 0.45} />);
    }
  }
  return (
    <g>
      {b.lawn && <polygon points={pts(iso(x0 - 0.35, y0 - 0.35), iso(x1 + 0.35, y0 - 0.35), iso(x1 + 0.35, y1 + 0.35), iso(x0 - 0.35, y1 + 0.35))} fill={ISO.grass} />}
      <polygon points={left} fill={ISO.wallLeft} />
      <polygon points={right} fill={ISO.wallRight} />
      <polygon points={top} fill={ISO.wall} />
      {win}
      <polygon points={roofL} fill={b.roof} />
      <polygon points={roofR} fill={b.roof} style={{filter: 'brightness(0.86)'}} />
      <polygon points={gable} fill={ISO.wall} />
      {b.flag && (
        <g>
          <line x1={iso(x1 - 0.3, y1 - 0.3, ridge)[0]} y1={iso(x1 - 0.3, y1 - 0.3, ridge)[1]} x2={iso(x1 - 0.3, y1 - 0.3, ridge + 70)[0]} y2={iso(x1 - 0.3, y1 - 0.3, ridge + 70)[1]} stroke="#6B6F80" strokeWidth={3} />
          <rect x={iso(x1 - 0.3, y1 - 0.3, ridge + 70)[0]} y={iso(x1 - 0.3, y1 - 0.3, ridge + 70)[1]} width={34} height={20} fill={ISO.landmark} />
        </g>
      )}
    </g>
  );
};

type Item = {key: string; depth: number; node: React.ReactNode};

const CityStatic: React.FC<{landmarks: Landmark[]; theme: WorldTheme; seed: number}> = ({landmarks, theme, seed}) => {
  const dusk = theme === 'dusk';
  const items = useMemo(() => {
    const r = rand(seed);
    const used = new Set<string>();
    const out: Item[] = [];
    for (const l of landmarks) {
      const size = l.kind === 'campus' ? [3, 3] : l.kind === 'school' ? [3, 2] : [1, 1];
      for (let x = l.gx; x < l.gx + size[0]; x++) for (let y = l.gy; y < l.gy + size[1]; y++) used.add(`${x},${y}`);
      const hgt = l.kind === 'campus' ? 150 : l.kind === 'school' ? 110 : 64;
      const inset = l.kind === 'house' || l.kind === 'home' ? 0.12 : 0.15;
      const b: Box = {
        x0: l.gx + inset, y0: l.gy + inset, x1: l.gx + size[0] - inset, y1: l.gy + size[1] - inset, h: hgt,
        roof: l.roof ?? (l.kind === 'school' ? '#5D6BD8' : l.kind === 'campus' ? '#7A4FD0' : ISO.roofs[0]),
        windows: dusk || l.kind !== 'house' ? Array.from({length: l.kind === 'house' || l.kind === 'home' ? 4 : 10}, () => dusk ? r() < 0.75 : false) : undefined,
        flag: l.kind === 'school' || l.kind === 'campus',
        lawn: l.kind === 'campus' || l.kind === 'school',
      };
      out.push({key: l.id, depth: b.x1 + b.y1, node: <BoxShape b={b} dusk={dusk} />});
    }
    for (let x = 0; x < G; x++) {
      for (let y = 0; y < G; y++) {
        if (x % R === 0 || y % R === 0 || used.has(`${x},${y}`)) continue;
        const v = r();
        if (v < 0.12) {
          const [tx, ty] = iso(x + 0.5, y + 0.5);
          out.push({
            key: `t${x},${y}`, depth: x + y + 1,
            node: (
              <g>
                <ellipse cx={tx} cy={ty} rx={16} ry={8} fill="rgba(0,0,0,0.08)" />
                <line x1={tx} y1={ty} x2={tx} y2={ty - 18} stroke="#8A6A4A" strokeWidth={4} />
                <circle cx={tx} cy={ty - 30} r={17} fill={v < 0.06 ? ISO.tree : ISO.treeDark} />
              </g>
            ),
          });
          continue;
        }
        const h = 34 + Math.floor(r() * 4) * 14;
        const b: Box = {
          x0: x + 0.12, y0: y + 0.12, x1: x + 0.88, y1: y + 0.88, h,
          roof: ISO.roofs[Math.floor(r() * ISO.roofs.length)],
          windows: dusk ? Array.from({length: 4}, () => r() < 0.35) : undefined,
        };
        out.push({key: `b${x},${y}`, depth: b.x1 + b.y1, node: <BoxShape b={b} dusk={dusk} />});
      }
    }
    return out.sort((a, b) => a.depth - b.depth);
  }, [landmarks, seed, dusk]);

  const blocks: React.ReactNode[] = [];
  for (let bx = 0; bx < G; bx += R)
    for (let by = 0; by < G; by += R)
      blocks.push(<polygon key={`k${bx},${by}`} points={pts(iso(bx + 1, by + 1), iso(bx + R, by + 1), iso(bx + R, by + R), iso(bx + 1, by + R))} fill={ISO.ground} />);

  return (
    <g>
      <polygon points={pts(iso(-6, -6), iso(G + 6, -6), iso(G + 6, G + 6), iso(-6, G + 6))} fill={ISO.road} />
      {blocks}
      {items.map((i) => <React.Fragment key={i.key}>{i.node}</React.Fragment>)}
    </g>
  );
};
const City = React.memo(CityStatic);

// Cotxes i gent que es mouen pels carrers: la ciutat no queda mai quieta.
const Traffic: React.FC<{t: number}> = ({t}) => {
  const cars = useMemo(() => {
    const r = rand(99);
    return Array.from({length: 26}, (_, i) => ({lane: R * (1 + Math.floor(r() * (G / R - 1))), alongX: i % 2 === 0, off: r() * G, v: 0.5 + r() * 0.7, c: ['#FFFFFF', '#E5484D', '#3D7BFF', '#2C2F3A', '#F2C14E'][i % 5]}));
  }, []);
  return (
    <g>
      {cars.map((c, i) => {
        const p = (c.off + c.v * t) % G;
        const [x, y] = c.alongX ? iso(p, c.lane + 0.5) : iso(c.lane + 0.5, p);
        return <rect key={i} x={x - 9} y={y - 6} width={18} height={11} rx={3} fill={c.c} stroke="rgba(0,0,0,0.15)" />;
      })}
    </g>
  );
};

export const landmarkCenter = (l: Landmark): [number, number] => {
  const s = l.kind === 'campus' ? [3, 3] : l.kind === 'school' ? [3, 2] : [1, 1];
  return iso(l.gx + s[0] / 2, l.gy + s[1] / 2, l.kind === 'campus' ? 120 : l.kind === 'school' ? 80 : 40);
};

export type Cam = {x: number; y: number; zoom: number; ax: number; ay: number};

export const World: React.FC<{landmarks: Landmark[]; theme: WorldTheme; cam: Cam; t: number; active?: string; seed?: number}> = ({
  landmarks, theme, cam, t, active, seed = 11,
}) => {
  const act = landmarks.find((l) => l.id === active);
  const ring = act ? iso(act.gx + (act.kind === 'campus' ? 1.5 : act.kind === 'school' ? 1.5 : 0.5), act.gy + (act.kind === 'campus' ? 1.5 : act.kind === 'school' ? 1 : 0.5)) : null;
  const pulse = 1 + 0.08 * Math.sin(t * 5);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(${cam.ax} ${cam.ay}) scale(${cam.zoom}) translate(${-cam.x} ${-cam.y})`}>
        <City landmarks={landmarks} theme={theme} seed={seed} />
        {ring && (
          <ellipse cx={ring[0]} cy={ring[1]} rx={150 * pulse * (act!.kind === 'house' ? 0.6 : 1.3)} ry={75 * pulse * (act!.kind === 'house' ? 0.6 : 1.3)} fill="rgba(110,231,160,0.28)" stroke="#6EE7A0" strokeWidth={5} />
        )}
        <Traffic t={t} />
      </g>
    </svg>
  );
};

// Etiqueta que sura sobre un lloc (preu, nota, alumnes…), sempre de la mateixa mida a pantalla.
export const PinLabel: React.FC<{x: number; y: number; text: string; p: number; tone?: 'light' | 'mint'}> = ({x, y, text, p, tone = 'light'}) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) translateY(${(1 - p) * 20}px) scale(${0.8 + 0.2 * p})`,
      opacity: p, background: tone === 'mint' ? '#6EE7A0' : '#FFFFFF', color: '#151833', fontFamily: JAKARTA, fontWeight: 800, fontSize: 40,
      padding: '10px 22px', borderRadius: 12, boxShadow: '0 10px 24px rgba(20,24,60,0.18)', whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);
