import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {EXPLICA, PANTALLA} from '../../brand/estil';
import {WORDS} from './fonts';
import {blurInOut} from './motion';
import {Stage} from './Stage';

// Gràfic explicatiu d'una estratègia o del backtesting, amb dades d'exemple (sempre marcat «Ejemplo ilustrativo»):
//  cruce: preu + mitjana ràpida i lenta; on es creuen, COMPRA / VENDE
//  reversion: preu al voltant de la seva mitjana; quan cau de cop, COMPRA, i quan torna, VENDE
//  momentum: rendiment del mes de tres actius; s'inverteix en el que més puja
//  backtest: la mateixa estratègia jugada sobre el passat (fins a «HOY») i el resultat que hauria tingut
export type ChartExplainerProps = {
  mode: 'cruce' | 'reversion' | 'momentum' | 'backtest';
  title: string;
  caption?: string;
  bars?: {label: string; value: number}[];
  pip?: 'left' | 'right';
};

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const sma = (a: number[], n: number) => a.map((_, i) => (i + 1 < n ? NaN : a.slice(i + 1 - n, i + 1).reduce((x, y) => x + y, 0) / n));

const N = 140;
const series = (mode: ChartExplainerProps['mode']) => {
  const r = rng(mode === 'reversion' ? 7 : 3);
  if (mode === 'reversion') {
    return Array.from({length: N}, (_, i) => {
      const dip = (c: number) => -14 * Math.exp(-((i - c) ** 2) / 18);
      return 100 + 2.2 * Math.sin(i / 3.1) + 1.4 * (r() - 0.5) + dip(45) + dip(102);
    });
  }
  return Array.from({length: N}, (_, i) => 100 + 14 * Math.sin(i / 22) + 5 * Math.sin(i / 7.5) + 0.12 * i + 2 * (r() - 0.5));
};

export const ChartExplainer: React.FC<ChartExplainerProps> = ({mode, title, caption, bars, pip}) => {
  const frame = useCurrentFrame();
  const {fps, width, durationInFrames} = useVideoConfig();
  const exit = blurInOut(frame, durationInFrames, 0);
  const E = EXPLICA;
  const reserve = pip ? PANTALLA.pip.w + PANTALLA.pip.margin + PANTALLA.pip.gap : 0;
  const W = Math.min(1560, width - reserve - 160);
  const H = 560;
  const drawEnd = Math.max(1, durationInFrames * E.drawFraction);
  const prog = interpolate(frame, [6, drawEnd], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pad = 30;

  let body: React.ReactNode = null;
  if (mode === 'momentum') {
    const data = bars ?? [];
    const max = Math.max(...data.map((d) => Math.abs(d.value)), 1);
    const best = data.reduce((b, d) => (d.value > b.value ? d : b), data[0] ?? {label: '', value: 0});
    body = (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {data.map((d, i) => {
          const bw = (W - 2 * pad) / data.length - 80;
          const x = pad + i * ((W - 2 * pad) / data.length) + 40;
          const p = interpolate(frame, [8 + i * 8, 8 + i * 8 + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const h = ((H - 170) * Math.abs(d.value) * p) / max;
          const win = d === best && prog > 0.75;
          return (
            <g key={d.label}>
              <rect x={x} y={H - 90 - h} width={bw} height={h} rx={14} fill={win ? E.up : '#C9C9CF'} />
              <text x={x + bw / 2} y={H - 40} textAnchor="middle" fontFamily={WORDS} fontWeight={600} fontSize={40} fill={E.ink}>
                {d.label}
              </text>
              <text x={x + bw / 2} y={H - 110 - h} textAnchor="middle" fontFamily={WORDS} fontWeight={700} fontSize={44} fill={win ? E.up : E.muted} opacity={p}>
                {`${d.value > 0 ? '+' : ''}${d.value} %`}
              </text>
            </g>
          );
        })}
      </svg>
    );
  } else {
    const price = series(mode);
    const lo = Math.min(...price) - 6;
    const hi = Math.max(...price) + 6;
    const X = (i: number) => pad + ((W - 2 * pad) * i) / (N - 1);
    const Y = (v: number) => pad + ((H - 2 * pad) * (hi - v)) / (hi - lo);
    const path = (a: number[]) =>
      a
        .map((v, i) => (Number.isNaN(v) ? null : `${X(i).toFixed(1)},${Y(v).toFixed(1)}`))
        .filter(Boolean)
        .map((pt, k) => (k ? 'L' : 'M') + pt)
        .join(' ');
    const fast = sma(price, 6);
    const slow = sma(price, 24);
    const mean = sma(price, 30).map((v, i) => (Number.isNaN(v) ? 100 : v));
    const marks: {i: number; buy: boolean}[] = [];
    if (mode === 'cruce' || mode === 'backtest') {
      for (let i = 25; i < N; i++) {
        const a = fast[i - 1] - slow[i - 1];
        const b = fast[i] - slow[i];
        if (a <= 0 && b > 0) marks.push({i, buy: true});
        if (a >= 0 && b < 0) marks.push({i, buy: false});
      }
    } else {
      marks.push({i: 45, buy: true}, {i: 58, buy: false}, {i: 102, buy: true}, {i: 115, buy: false});
    }
    const today = mode === 'backtest' ? Math.round(N * 0.82) : N;
    const visibleTo = Math.round(prog * (today - 1));
    const clipW = X(visibleTo);
    body = (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <clipPath id={`reveal-${mode}`}>
            <rect x={0} y={0} width={clipW} height={H} />
          </clipPath>
        </defs>
        {mode === 'backtest' ? (
          <>
            <rect x={pad} y={pad} width={X(today) - pad} height={H - 2 * pad} fill={E.past} rx={10} />
            <line x1={X(today)} x2={X(today)} y1={pad} y2={H - pad} stroke={E.ink} strokeWidth={3} strokeDasharray="10 8" />
            <text x={X(today) + 14} y={pad + 36} fontFamily={WORDS} fontWeight={700} fontSize={34} fill={E.ink}>
              HOY
            </text>
            <text x={pad + 18} y={pad + 40} fontFamily={WORDS} fontWeight={600} fontSize={30} fill={E.muted}>
              Datos del pasado
            </text>
          </>
        ) : null}
        {mode === 'reversion' ? (
          <path d={path(mean)} fill="none" stroke={E.slow} strokeWidth={5} strokeDasharray="14 10" clipPath={`url(#reveal-${mode})`} />
        ) : null}
        <path d={path(price)} fill="none" stroke={E.price} strokeWidth={4} clipPath={`url(#reveal-${mode})`} />
        {mode === 'cruce' || mode === 'backtest' ? (
          <>
            <path d={path(fast)} fill="none" stroke={E.fast} strokeWidth={6} clipPath={`url(#reveal-${mode})`} />
            <path d={path(slow)} fill="none" stroke={E.slow} strokeWidth={6} clipPath={`url(#reveal-${mode})`} />
          </>
        ) : null}
        {marks
          .filter((m) => m.i <= visibleTo && m.i < today)
          .map((m) => {
            const x = X(m.i);
            const y = Y(price[m.i]) + (m.buy ? 46 : -46);
            const c = m.buy ? E.up : E.down;
            return (
              <g key={m.i}>
                <path d={m.buy ? `M${x},${y - 30} l-18,26 h36 z` : `M${x},${y + 30} l-18,-26 h36 z`} fill={c} />
                <text x={x} y={m.buy ? y + 30 : y - 14} textAnchor="middle" fontFamily={WORDS} fontWeight={700} fontSize={28} fill={c}>
                  {m.buy ? 'COMPRA' : 'VENDE'}
                </text>
              </g>
            );
          })}
      </svg>
    );
  }
  const legend =
    mode === 'cruce' || mode === 'backtest'
      ? [
          ['Precio', E.price],
          ['Media rápida', E.fast],
          ['Media lenta', E.slow],
        ]
      : mode === 'reversion'
        ? [
            ['Precio', E.price],
            ['Su media', E.slow],
          ]
        : [];
  return (
    <Stage tone="light">
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          gap: 22,
          opacity: exit.opacity,
          filter: exit.filter,
          ...(pip ? {[pip === 'right' ? 'paddingRight' : 'paddingLeft']: reserve} : {}),
        }}
      >
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', width: W}}>
          <div style={{fontFamily: WORDS, fontWeight: 600, fontSize: E.titlePx, color: E.ink}}>{title}</div>
          <div style={{fontFamily: WORDS, fontWeight: 500, fontSize: 24, color: E.muted}}>Ejemplo ilustrativo</div>
        </div>
        <div style={{background: E.card, borderRadius: 24, boxShadow: E.cardShadow}}>{body}</div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: W, gap: 16}}>
          <div style={{display: 'flex', gap: 26}}>
            {legend.map(([l, c]) => (
              <span key={l} style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: WORDS, fontWeight: 600, fontSize: 28, color: E.ink}}>
                <span style={{width: 34, height: 8, borderRadius: 4, background: c}} />
                {l}
              </span>
            ))}
          </div>
          {caption ? (
            <div
              style={{
                fontFamily: WORDS,
                fontWeight: 600,
                fontSize: 36,
                color: E.ink,
                textAlign: 'center',
                opacity: interpolate(frame, [drawEnd * 0.5, drawEnd * 0.5 + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
              }}
            >
              {caption}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};
