import React from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DEMO_PRO as P} from '../../brand/unimatx';
import R from '../../projectes/demo-escoles/retols.json';
import {POP} from '../llancament/Ui';
import {UniMark, clamp} from '../unimatx/base';

// Demo per a centres amb marc: la pantalla dins una finestra amb una barra neta, la càmera (amb el fons canviat) a
// dalt a la dreta on era la de l'OBS, fosos curts als talls i rètols a la franja de baix. Les pistes i els plans
// surten de scripts/demo_pro_pistes.py (remotion-pro/dades.json, ja sense les pauses de pauses.json); els rètols, de
// retols.json, en temps de la línia sencera.
// --public-dir=projectes/demo-escoles/remotion-pro --props='{"variant":"fosc"}'

type Shot = {piece: number; from: number; dur: number; file: number; freeze?: boolean; jump?: boolean};
type Face = {run: number; clip: string; from: number; dur: number; file: number};
export type ProData = {fps: number; durationInFrames: number; screen: {w: number; h: number}; cuts: [number, number][]; shots: Shot[]; faces: Face[]};
export type Variant = keyof typeof P.variants;
export type DemoProProps = {variant: Variant; data: ProData | null};

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

// Un pla d'una pista amb fos d'entrada: comença «pre» fotogrames abans i s'allarga «post» després, amb el marge
// que les pistes porten a banda i banda de cada tros.
const Clip: React.FC<{src: string; from: number; dur: number; file: number; pre: number; post: number; fade: number; freeze?: boolean; style: React.CSSProperties}> = ({src, from, dur, file, pre, post, fade, freeze, style}) => {
  const V = <OffthreadVideo src={staticFile(src)} muted trimBefore={Math.max(0, file - pre)} style={style} />;
  return (
    <Sequence from={from - pre} durationInFrames={dur + pre + post} layout="none">
      <FadeIn frames={pre > 0 ? fade : 0}>{freeze ? <Freeze frame={0}>{V}</Freeze> : V}</FadeIn>
    </Sequence>
  );
};
const FadeIn: React.FC<{frames: number; children: React.ReactNode}> = ({frames, children}) => {
  const f = useCurrentFrame();
  return <div style={{position: 'absolute', inset: 0, opacity: frames ? ease(f, 0, frames) : 1}}>{children}</div>;
};

const Track: React.FC<{items: (Shot | Face)[]; src: string; fade: number; cut: (a: Shot | Face, b: Shot | Face) => boolean; style: React.CSSProperties}> = ({items, src, fade, cut, style}) => (
  <>
    {items.map((s, i) => {
      const fadeIn = i > 0 && cut(items[i - 1], s);
      const fadeOut = i + 1 < items.length && cut(s, items[i + 1]);
      return <Clip key={i} src={src} from={s.from} dur={s.dur} file={s.file} pre={fadeIn ? fade / 2 : 0} post={fadeOut ? fade / 2 : 0} fade={fade} freeze={'freeze' in s && s.freeze} style={style} />;
    })}
  </>
);

// Rètol de la franja de baix: entra pujant i se'n va fonent-se.
const Strip: React.FC<{t: number; from: number; to: number; children: React.ReactNode; align?: 'left' | 'center'}> = ({t, from, to, children, align = 'center'}) => {
  if (t < from - 0.1 || t > to + 0.6) return null;
  const fps = 30;
  const p = ease((t - from) * fps, 0, P.enter) * (1 - ease((t - to) * fps, 0, 12));
  return (
    <div style={{position: 'absolute', left: P.win.x, width: P.win.w, top: P.strip, transform: `translateY(calc(-50% + ${(1 - p) * 16}px))`, opacity: p, display: 'flex', justifyContent: align === 'left' ? 'flex-start' : 'center'}}>
      {children}
    </div>
  );
};

// Captures del test (retols.json → fotos): cada una entra pujant quan toca i les anteriors queden darrere, una mica
// més petites i girades (la de davant, recta, perquè es llegeixi); mentrestant la pantalla s'esvaeix. Totes surten
// juntes al final del grup.
const Photos: React.FC<{t: number; group: (typeof R.fotos)[number]; v: (typeof P.variants)[Variant]; top: number; h: number}> = ({t, group, v, top, h}) => {
  if (t < group.from - 0.1 || t > group.to + 0.6) return null;
  const fps = 30;
  const F = P.photo;
  const out = 1 - ease((t - group.to) * fps, 0, F.exit);
  const prog = group.items.map((it) => (t >= it.at ? ease((t - it.at) * fps, 0, F.enter) : 0));
  return (
    <div style={{position: 'absolute', left: P.win.x, top, width: P.win.w, height: h, zIndex: 3, opacity: out}}>
      <div style={{position: 'absolute', inset: 0, background: v.canvas, opacity: Math.max(...prog) * F.dim, borderBottomLeftRadius: P.win.radius, borderBottomRightRadius: P.win.radius}} />
      {group.items.map((it, i) => {
        if (!prog[i]) return null;
        const depth = prog.slice(i + 1).reduce((a, b) => a + b, 0);
        const s = (1 - depth * F.step.scale) * (0.96 + 0.04 * prog[i]);
        return (
          <Img
            key={it.file}
            src={staticFile(`fotos/${it.file}`)}
            style={{
              position: 'absolute', left: '50%', top: '50%', width: F.w, borderRadius: F.radius, border: `1px solid ${v.winBorder}`, boxShadow: v.shadow,
              opacity: prog[i], filter: `brightness(${1 - depth * 0.06})`,
              transform: `translate(-50%, -50%) translate(${-depth * F.step.x}px, ${-depth * F.step.y + (1 - prog[i]) * F.rise}px) scale(${s}) rotate(${(i % 2 ? 1 : -1) * F.tilt * Math.min(depth, 1)}deg)`,
            }}
          />
        );
      })}
    </div>
  );
};

const Chip: React.FC<{v: (typeof P.variants)[Variant]; on?: boolean; done?: boolean; n?: number; small?: boolean; children: React.ReactNode}> = ({v, on, done, n, small, children}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: small ? 8 : 10, padding: small ? '9px 14px' : '10px 18px', borderRadius: 999, background: on ? v.chipOn : v.chip, border: `1px solid ${on ? v.chipOn : v.chipLine}`, color: on ? v.chipOnText : v.text, fontSize: small ? 17 : 19, fontWeight: 700, whiteSpace: 'nowrap', opacity: on || done ? 1 : 0.75}}>
    {n !== undefined && (
      <span style={{width: 26, height: 26, borderRadius: 13, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 800, background: on ? v.chipOnText : v.chipLine, color: on ? v.chipOn : v.text}}>{done ? '✓' : n}</span>
    )}
    {children}
  </div>
);

export const DemoPro: React.FC<DemoProProps> = ({variant, data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!data) return null;
  const v = P.variants[variant];
  // Temps de la línia sencera (el dels rètols): s'hi tornen a sumar les pauses tretes.
  let t = frame / fps;
  for (const [a, b] of data.cuts) {
    if (t >= a / fps) t += (b - a) / fps;
  }
  const W = P.win;
  // La pantalla ja ve sense la barra del navegador i a la mida de la finestra (demo_pro_pistes.py): hi va píxel a píxel.
  const contentH = data.screen.h;

  // Part on som (ruta de dalt).
  let ci = 0;
  R.chapters.forEach((c, i) => {
    if (t >= (c[1] as number)) ci = i;
  });
  const chT = (t - (R.chapters[ci][1] as number)) * fps;
  const chIn = ease(chT, 0, 12);

  const stepAt = (items: (string | number)[][], ti: number) => {
    let a = -1;
    items.forEach((it, i) => {
      if (t >= (it[ti] as number) - 0.15) a = i;
    });
    return a;
  };
  const login = stepAt(R.login.steps, 1);
  const inf = stepAt(R.informes.items, 2);
  const fase = stepAt(R.fases.items.map((f) => [f.name, f.t]), 1);
  const faseIn = fase < 0 ? 0 : ease((t - R.fases.items[fase].t + 0.15) * fps, 0, P.enter);

  return (
    <AbsoluteFill style={{background: v.canvas, fontFamily: POP, color: v.text}}>
      {/* ruta: marca i part del vídeo */}
      <div style={{position: 'absolute', left: W.x, top: P.crumb, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 14, fontSize: 21}}>
        <div style={{borderRadius: 10, overflow: 'hidden', display: 'flex'}}>
          <UniMark size={40} />
        </div>
        <span style={{fontWeight: 800}}>UniMatx</span>
        <span style={{color: v.sub, fontWeight: 600}}>Demo per a centres</span>
        <span style={{width: 1, height: 26, background: v.chipLine, margin: '0 6px'}} />
        <span style={{fontWeight: 700, color: v.accent, opacity: chIn, transform: `translateY(${(1 - chIn) * 10}px)`, display: 'inline-block'}}>{R.chapters[ci][0]}</span>
      </div>

      {/* finestra amb la pantalla */}
      <div style={{position: 'absolute', left: W.x, top: W.y, width: W.w, height: W.bar + contentH, borderRadius: W.radius, overflow: 'hidden', boxShadow: v.shadow, border: `1px solid ${v.winBorder}`, background: '#fff', zIndex: 1}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: W.bar, background: v.bar, display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px', zIndex: 1}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <span key={c} style={{width: 12, height: 12, borderRadius: 6, background: c}} />
          ))}
          <div style={{marginLeft: 18, padding: '5px 16px', borderRadius: 8, background: v.chip, border: `1px solid ${v.chipLine}`, color: v.barText, fontSize: 15, fontWeight: 600}}>unimatx.cat</div>
        </div>
        <div style={{position: 'absolute', left: 0, top: W.bar, width: W.w, height: contentH, overflow: 'hidden'}}>
          <Track items={data.shots} src="pantalla.mp4" fade={P.fade} cut={(a, b) => (a as Shot).piece !== (b as Shot).piece || !!(b as Shot).jump} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
        </div>
      </div>

      {R.fotos.map((g) => (
        <Photos key={g.fase} t={t} group={g} v={v} top={W.y + W.bar} h={contentH} />
      ))}

      {/* càmera: exactament on era la de l'OBS, perquè no tapi res més de la gravació */}
      <div style={{position: 'absolute', left: P.cam.x, top: P.cam.y, width: P.cam.w, height: P.cam.h, borderRadius: P.cam.radius, overflow: 'hidden', boxSizing: 'border-box', border: `3px solid ${v.camBorder}`, boxShadow: v.shadow, background: '#000', zIndex: 5}}>
        <Track items={data.faces} src={`cara-${variant}.mp4`} fade={P.faceFade} cut={() => true} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>

      {/* rètols de la franja de baix */}
      <Strip t={t} from={R.name.from} to={R.name.to} align="left">
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <span style={{width: 5, height: 58, borderRadius: 3, background: v.accent}} />
          <div>
            <div style={{fontSize: 30, fontWeight: 800, lineHeight: 1.1}}>{R.name.title}</div>
            <div style={{fontSize: 19, fontWeight: 600, color: v.sub}}>{R.name.sub}</div>
          </div>
        </div>
      </Strip>
      <Strip t={t} from={R.login.from} to={R.login.to}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{fontSize: 18, fontWeight: 700, color: v.sub, marginRight: 8, whiteSpace: 'nowrap'}}>{R.login.title}</span>
          {R.login.steps.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{color: v.sub, fontSize: 20}}>→</span>}
              <Chip v={v} n={i + 1} on={i === login} done={i < login}>{s[0]}</Chip>
            </React.Fragment>
          ))}
        </div>
      </Strip>
      <Strip t={t} from={R.informes.from} to={R.informes.to}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{fontSize: 18, fontWeight: 700, color: v.sub, marginRight: 8, whiteSpace: 'nowrap'}}>{R.informes.title}</span>
          {R.informes.items.map((s, i) => (
            <div key={i} style={{opacity: i <= inf ? 1 : 0.35}}>
              <Chip v={v} on={i === inf}>
                {s[0]} <span style={{fontWeight: 500, opacity: 0.85}}>· {s[1]}</span>
              </Chip>
            </div>
          ))}
        </div>
      </Strip>
      <Strip t={t} from={R.fases.from} to={R.fases.to}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{fontSize: 18, fontWeight: 700, color: v.sub, marginRight: 6, whiteSpace: 'nowrap'}}>{R.fases.title}</span>
            {R.fases.items.map((s, i) => (
              <Chip key={i} v={v} n={i + 1} on={i === fase} done={i < fase} small>
                {s.name}
              </Chip>
            ))}
          </div>
          {/* el tipus de preguntes de la fase, tal com el presenta el test */}
          <div style={{height: 34, display: 'flex', alignItems: 'center', gap: 10, opacity: faseIn, transform: `translateY(${(1 - faseIn) * 8}px)`}}>
            {fase >= 0 && (
              <>
                <span style={{fontSize: 17, fontWeight: 800, color: v.accent, whiteSpace: 'nowrap'}}>Fase {fase + 1}</span>
                <span style={{fontSize: 22, fontWeight: 700, whiteSpace: 'nowrap', marginRight: 6}}>{R.fases.items[fase].q}</span>
                {R.fases.items[fase].tags.map((tag) => (
                  <span key={tag} style={{fontSize: 15, fontWeight: 600, color: v.sub, padding: '4px 12px', borderRadius: 999, border: `1px solid ${v.chipLine}`, whiteSpace: 'nowrap'}}>
                    {tag}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
      </Strip>
      <Strip t={t} from={R.encaix.from} to={R.encaix.to}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{fontSize: 18, fontWeight: 700, color: v.sub, marginRight: 8, whiteSpace: 'nowrap'}}>{R.encaix.title}</span>
          {R.encaix.items.map((s, i) => (
            <Chip key={i} v={v} n={i + 1} on={i === R.encaix.items.length - 1}>
              {s[0]} <span style={{fontWeight: 800}}>· {s[1]}</span>
            </Chip>
          ))}
        </div>
      </Strip>
      <Strip t={t} from={R.email.from} to={999}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '14px 30px', borderRadius: 18, background: '#FFFFFF', color: '#252B2F', boxShadow: v.shadow}}>
          <UniMark size={52} />
          <div>
            <div style={{fontSize: 18, fontWeight: 600, color: '#116EEE'}}>{R.email.label}</div>
            <div style={{fontSize: 38, fontWeight: 800, lineHeight: 1.15}}>{R.email.mail}</div>
          </div>
        </div>
      </Strip>

      <Audio src={staticFile('veu.wav')} />
    </AbsoluteFill>
  );
};

export const demoProMetadata = async ({props}: {props: DemoProProps}) => {
  const data: ProData = await fetch(staticFile('dades.json')).then((r) => r.json());
  return {durationInFrames: data.durationInFrames, props: {...props, data}};
};
