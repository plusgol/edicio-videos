import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {MG, STYLES, type MgStyle} from '../../brand/mg';
import {Backdrop, GrainLayer, bgOf} from '../mg/Backdrop';
import {family, fontsReady} from '../mg/fonts';
import {BarFill, Checklist, EASE, PunchIn, enterStyle, exitStyle, progress, type MoveName} from '../mg/moves';
import {formatCount, layoutScreen, safeBox, wordText} from './layout';
import type {FScreen, FWord, FabricaData, FabricaProps, ScreenLayout} from './types';

// La fàbrica de vídeos: un brief (projectes/<nom>/brief.json) → scripts/fabrica/fabrica.py → remotion/fabrica.json →
// aquest vídeo, en qualsevol dels estils de brand/mg.ts. Una frase per pantalla, cada paraula al fotograma en què es
// diu, i els moviments de src/mg. Amb {"qa": true}, tot el que s'ha de llegir surt en magenta sobre negre perquè
// scripts/fabrica/qa.py comprovi que no surt de la zona segura.

export const fabricaMetadata: CalculateMetadataFunction<FabricaProps> = async ({props}) => {
  const data: FabricaData = await fetch(staticFile('fabrica.json')).then((r) => r.json());
  await fontsReady();
  const s = STYLES[props.style] ?? STYLES.glass;
  const layout = data.screens.map((sc) => layoutScreen(sc, s, data));
  return {durationInFrames: data.durationInFrames, fps: data.fps, width: data.width, height: data.height, props: {...props, data, layout}};
};

const QA_CSS = `
.mg-qa * { color: ${MG.qaColor} !important; -webkit-text-fill-color: ${MG.qaColor} !important; text-shadow: none !important;
  box-shadow: none !important; background: transparent !important; border-color: transparent !important; backdrop-filter: none !important; }
.mg-qa .mg-key { background: ${MG.qaColor} !important; }
.mg-qa .mg-deco { display: none !important; }
.mg-qa svg circle { fill: ${MG.qaColor} !important; }
.mg-qa img { opacity: 0 !important; }
`;

const KINETIC_MOVES: MoveName[] = ['slide', 'stretch', 'slideLeft', 'pop'];
const JITTER = [0, 2, 1, 3]; // Editorial: entrades de línia una mica desiguals, com fetes a mà

type Ctx = {s: MgStyle; d: FabricaData; L: ScreenLayout; sc: FScreen; idx: number; qa: boolean};

const popCardBg = (c: Ctx) => {
  const cols = Array.isArray(c.s.bg) ? c.s.bg : [c.s.accent];
  return cols[(c.idx + 1) % cols.length];
};

/** Una paraula: el color o el bloc de la paraula clau, i el número que roda si ho és. */
const WordText: React.FC<{w: FWord; c: Ctx; size: number}> = ({w, c, size}) => {
  const f = useCurrentFrame();
  const {s} = c;
  const core = w.count
    ? formatCount(w.count, (w.count.from ?? 0) + (w.count.to - (w.count.from ?? 0)) * progress(f, w.f, MG.move.count, 'power3'))
    : w.t;
  const txt = s.upper ? core.toUpperCase() : core;
  const head = s.upper ? w.head.toUpperCase() : w.head;
  const tail = s.upper ? w.tail.toUpperCase() : w.tail;
  if (!w.accent) return <>{head}{txt}{tail}</>;
  const num: React.CSSProperties = w.count ? {fontVariantNumeric: 'tabular-nums'} : {};
  if (s.layout === 'pop' && s.card) {
    return (
      <>
        {head}
        <span className="mg-key" style={{display: 'inline-block', background: popCardBg(c), color: s.accentText, border: s.card.border, boxShadow: s.card.shadow,
          borderRadius: s.card.radius, padding: `0 ${size * 0.14}px`, transform: 'rotate(-2deg)', ...num}}>{txt}</span>
        {tail}
      </>
    );
  }
  if (s.layout === 'editorial') {
    const rot = ((w.t.length * 7) % 5) - 2.5; // entre −2,5° i 2,5°, sempre igual per a la mateixa paraula
    return (
      <>
        {head}
        <span style={{position: 'relative', display: 'inline-block', fontStyle: 'italic', color: s.accent, ...num}}>
          <span className="mg-deco" style={{position: 'absolute', inset: `${size * 0.08}px ${-size * 0.12}px ${size * 0.02}px`, background: s.cut,
            transform: `rotate(${rot}deg)`, boxShadow: '0 2px 0 rgba(0,0,0,0.07)', zIndex: -1}} />
          {txt}
        </span>
        {tail}
      </>
    );
  }
  return <>{head}<span style={{color: s.accent, ...num}}>{txt}</span>{tail}</>;
};

/** El titular, línia a línia; cada estil fa entrar les paraules a la seva manera. */
const Headline: React.FC<{c: Ctx; align: 'center' | 'left'}> = ({c, align}) => {
  const f = useCurrentFrame();
  const {s, L, sc, idx} = c;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', width: L.textW, textAlign: align}}>
      {L.lines.map((line, li) => {
        const lineStyle: React.CSSProperties = {fontSize: line.size, lineHeight: L.lineHeight, whiteSpace: 'nowrap', fontFamily: family(s.font.head), fontWeight: s.weight.head};
        const at = sc.words[line.words[0]].f;
        if (s.layout === 'glass') {
          const p = progress(f, at - 2, 14, 'power3');
          return <div key={li} style={{...lineStyle, ...enterStyle('rise', p, c.d.width, s.motion.rise)}}>{line.words.map((wi, k) => <React.Fragment key={wi}>{k ? ' ' : ''}<WordText w={sc.words[wi]} c={c} size={line.size} /></React.Fragment>)}</div>;
        }
        if (s.layout === 'editorial') {
          const p = progress(f, at + JITTER[li % 4], s.motion.enter, s.motion.ease);
          return (
            <div key={li} style={{...lineStyle, clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`, transform: `translateX(${(1 - p) * 14}px)`}}>
              {line.words.map((wi, k) => <React.Fragment key={wi}>{k ? ' ' : ''}<WordText w={sc.words[wi]} c={c} size={line.size} /></React.Fragment>)}
            </div>
          );
        }
        // Kinetic i Pop: paraula a paraula, al fotograma en què es diu
        return (
          <div key={li} style={lineStyle}>
            {line.words.map((wi, k) => {
              const w = sc.words[wi];
              let st: React.CSSProperties;
              if (s.layout === 'pop') {
                const start = w.f - Math.round(s.motion.enter / 2); // la paraula aterra quan es diu
                const p = progress(f, start, s.motion.enter, 'bouncy');
                const lin = Math.min(1, Math.max(0, (f - start) / s.motion.enter));
                const sq = 0.14 * Math.sin(lin * Math.PI); // aixafar i estirar
                const base = MG.amount.popFrom + (1 - MG.amount.popFrom) * p;
                st = {opacity: Math.min(1, lin * 3), transform: `scale(${base * (1 + sq)}, ${base * (1 - sq)}) rotate(${(1 - p) * (wi % 2 ? 9 : -9)}deg)`};
              } else {
                const base = KINETIC_MOVES[idx % KINETIC_MOVES.length];
                const move: MoveName = base === 'slide' && wi % 2 ? 'slideLeft' : base;
                st = enterStyle(move, progress(f, w.f - Math.round(s.motion.enter / 2), s.motion.enter, s.motion.ease), c.d.width);
              }
              return (
                <React.Fragment key={wi}>
                  {k ? ' ' : ''}
                  <span style={{display: 'inline-block', ...st}}><WordText w={w} c={c} size={line.size} /></span>
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const Label: React.FC<{c: Ctx; text: string}> = ({c, text}) => (
  <div style={{fontFamily: family(c.s.font.label), fontSize: c.L.label, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.s.sub,
    marginBottom: (c.L.label ?? 0) * 0.9, fontWeight: 500}}>{text}</div>
);

const Items: React.FC<{c: Ctx}> = ({c}) => {
  const {s, sc, L} = c;
  const size = L.item ?? 40;
  const items = (sc.itemWords ?? []).map((ws, k) => ({
    at: sc.itemAt?.[k] ?? 0,
    text: ws.map((w, j) => <React.Fragment key={j}>{j ? ' ' : ''}{w.accent ? <span style={{color: s.accent}}>{wordText(w, s)}</span> : wordText(w, s)}</React.Fragment>),
  }));
  return (
    <Checklist items={items} size={size * 1.15} color={s.tick} ink={s.tickInk} gap={size * 0.55}
      style={{alignItems: 'flex-start', fontFamily: family(s.font.body), fontWeight: s.weight.body, fontSize: size, color: s.text, marginTop: size * 0.9, textAlign: 'left'}} />
  );
};

const Bar: React.FC<{c: Ctx}> = ({c}) => {
  const {s, sc, L} = c;
  const size = L.item ?? 40;
  return (
    <div className="mg-key" style={{marginTop: size * 1.1, borderRadius: size}}>
      <BarFill at={sc.barAt ?? 0} value={Math.min(1, Math.max(0, sc.bar?.value ?? 1))} width={L.textW * 0.9} height={size * 0.9}
        color={s.tick} track={`${s.text}26`} border={s.layout === 'pop' && s.card ? s.card.border : undefined} />
    </div>
  );
};

/** La captura: dins una targeta, amb un apropament lent cap al que importa; amb «reframe», entra a pantalla sencera. */
const Shot: React.FC<{c: Ctx}> = ({c}) => {
  const f = useCurrentFrame();
  const {s, sc, L, d} = c;
  if (!sc.image || !L.image) return null;
  const r = L.image;
  const p = sc.reframe ? progress(f, MG.factory.pre, MG.move.reframe, 'power4') : 1;
  const enter = sc.reframe ? 1 : progress(f, 0, s.motion.enter, s.motion.ease);
  const lerp = (a: number, b: number) => a + (b - a) * p;
  const box = {x: lerp(0, r.x), y: lerp(0, r.y), w: lerp(d.width, r.w), h: lerp(d.height, r.h)};
  const radius = (s.card?.radius ?? 24) * p;
  const z = sc.focus ? 1 + (sc.focus.zoom - 1) * EASE.gentle(Math.min(1, f / Math.max(1, sc.frames))) : 1;
  const frame: React.CSSProperties = s.layout === 'pop' && s.card ? {border: s.card.border, boxShadow: s.card.shadow}
    : {boxShadow: '0 30px 70px rgba(0,0,0,0.28)', border: s.card?.border};
  return (
    <div className="mg-key" style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: radius, overflow: 'hidden',
      ...(p > 0.02 ? frame : {}), ...enterStyle('rise', enter, d.width), boxSizing: 'border-box'}}>
      <Img src={staticFile(sc.image.src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`,
        transformOrigin: sc.focus ? `${sc.focus.x * 100}% ${sc.focus.y * 100}%` : '50% 50%'}} />
    </div>
  );
};

/** Capçalera i peu de pàgina de revista (Editorial Grain): títol, filets i número de pàgina, dins la zona segura. */
const Folio: React.FC<{c: Ctx; total: number}> = ({c, total}) => {
  const box = safeBox(c.d);
  const size = c.L.label ?? 28;
  const rule = `1.5px solid ${c.s.text}`;
  const common: React.CSSProperties = {position: 'absolute', left: box.x, width: box.w, fontFamily: family(c.s.font.label), fontSize: size,
    letterSpacing: '0.16em', textTransform: 'uppercase', color: c.s.sub, display: 'flex', justifyContent: 'space-between'};
  return (
    <>
      <div style={{...common, top: box.y}}>
        <span>{c.d.title}</span>
        <span>{String(c.idx + 1).padStart(2, '0')}</span>
      </div>
      <div className="mg-deco" style={{position: 'absolute', left: box.x, width: box.w, top: box.y + size * 1.8, borderTop: rule, opacity: 0.6}} />
      <div className="mg-deco" style={{position: 'absolute', left: box.x, width: box.w, top: box.y + box.h - size * 1.8, borderTop: rule, opacity: 0.6}} />
      <div style={{...common, top: box.y + box.h - size * 1.2}}>
        <span>{String(c.idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <span>№ {String(c.idx + 1).padStart(2, '0')}</span>
      </div>
    </>
  );
};

const ScreenView: React.FC<{c: Ctx; total: number}> = ({c, total}) => {
  const f = useCurrentFrame();
  const {s, sc, L, d} = c;
  const box = safeBox(d);
  const align = s.layout === 'editorial' ? 'left' : 'center';
  const isEnd = sc.kind === 'end';
  const out = isEnd ? {} : exitStyle(progress(f, sc.frames - s.motion.exit, s.motion.exit, 'power3'));
  const headline = (
    <>
      {sc.label ? <Label c={c} text={sc.label} /> : null}
      {isEnd && d.logo && L.logoH ? (
        <div className="mg-key" style={{background: s.logoBg, borderRadius: L.logoH * 0.22, padding: s.logoBg ? L.logoH * 0.16 : 0, marginBottom: L.logoH * 0.3,
          display: 'flex', ...enterStyle('pop', progress(f, 0, MG.move.pop, 'back'))}}>
          <Img src={staticFile(d.logo.src)} style={{height: L.logoH}} />
        </div>
      ) : null}
      <Headline c={c} align={align} />
      {sc.kind === 'list' ? <Items c={c} /> : null}
      {sc.kind === 'bar' ? <Bar c={c} /> : null}
      {isEnd && sc.sub ? (
        <div style={{fontFamily: family(s.font.body), fontWeight: s.weight.body, fontSize: L.sub, color: s.sub, marginTop: (L.sub ?? 30) * 0.8,
          ...enterStyle('rise', progress(f, (sc.words[sc.words.length - 1]?.f ?? 0) + 6, 16, 'power3'))}}>{sc.sub}</div>
      ) : null}
    </>
  );
  const glassCard = s.layout === 'glass' && s.card && sc.kind !== 'image';
  const cardP = progress(f, 0, s.motion.enter, s.motion.ease);
  const content = sc.kind === 'image' ? (
    <>
      <Shot c={c} />
      <div style={{position: 'absolute', left: box.x, width: box.w, top: L.textTop, display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start'}}>
        {headline}
      </div>
    </>
  ) : (
    <div style={{position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, display: 'flex', flexDirection: 'column',
      alignItems: align === 'center' ? 'center' : 'flex-start', justifyContent: 'center'}}>
      {glassCard && s.card ? (
        <div style={{background: s.card.bg, border: s.card.border, boxShadow: s.card.shadow, borderRadius: s.card.radius, backdropFilter: 'blur(30px)',
          padding: MG.text.cardPad, display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box', maxWidth: box.w,
          opacity: Math.min(1, cardP * 1.6), transform: `translateY(${(1 - cardP) * s.motion.rise}px) scale(${MG.amount.glassFrom + (1 - MG.amount.glassFrom) * cardP})`}}>
          {headline}
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', padding: s.layout === 'editorial' ? `0 ${box.w * 0.03}px` : 0}}>
          {headline}
        </div>
      )}
    </div>
  );
  const body = <AbsoluteFill style={{color: s.text, ...out}}>{content}</AbsoluteFill>;
  // el punch-in s'acosta des del centre del text (en Editorial, alineat a l'esquerra, des del marge): així el text,
  // fet un 15 % més petit a layout.ts, acaba just dins la zona segura
  const ox = align === 'left' ? box.x + box.w * 0.03 : box.x + box.w / 2;
  const punchOrigin = `${(ox / d.width) * 100}% ${((box.y + box.h / 2) / d.height) * 100}%`;
  return (
    <AbsoluteFill>
      <Backdrop s={s} screen={c.idx} w={d.width} h={d.height} qa={c.qa} />
      {sc.punchAt !== undefined ? <PunchIn at={sc.punchAt} origin={punchOrigin}>{body}</PunchIn> : body}
      {s.layout === 'editorial' ? <Folio c={c} total={total} /> : null}
    </AbsoluteFill>
  );
};

export const Fabrica: React.FC<FabricaProps> = ({style, qa, data, layout}) => {
  if (!data || !layout) return null;
  const s = STYLES[style] ?? STYLES.glass;
  return (
    <AbsoluteFill className={qa ? 'mg-qa' : undefined} style={{background: qa ? '#000' : bgOf(s, 0)}}>
      {qa ? <style>{QA_CSS}</style> : null}
      {data.screens.map((sc, i) => (
        <Sequence key={sc.id} from={sc.from} durationInFrames={sc.frames} name={`${sc.id} ${sc.words.map((w) => w.t).join(' ')}`}>
          <ScreenView c={{s, d: data, L: layout[i], sc, idx: i, qa}} total={data.screens.length} />
        </Sequence>
      ))}
      <GrainLayer s={s} qa={qa} />
      {!qa && data.audio[style] ? <Audio src={staticFile(data.audio[style])} /> : null}
    </AbsoluteFill>
  );
};
