import React from 'react';
import {AbsoluteFill, Audio, Easing, Loop, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DEMO, UNI} from '../../brand/unimatx';
import {JAKARTA, UniLogo, clamp} from '../unimatx/base';

// Demo de pantalla amb ritme: la pantalla (sense la càmera) es mou cap a on passa l'acció, la càmera va en una bombolla,
// un rètol diu a quina part som i una barra fina marca el progrés. Els zooms i les parts surten de work/demo-rapida.json.
export type Zoom = {t: number; z: number; cx: number; cy: number; cut: boolean};
export type DemoData = {duration: number; srcW: number; srcH: number; zooms: Zoom[]; chapters: {t: number; label: string}[]};

const camAt = (zs: Zoom[], t: number, fps: number) => {
  let i = 0;
  for (let k = 0; k < zs.length; k++) if (zs[k].t <= t) i = k;
  const cur = zs[i];
  const prev = i > 0 ? zs[i - 1] : cur;
  const since = (t - cur.t) * fps;
  const k = cur.cut ? 1 : interpolate(since, [0, DEMO.ease], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const drift = 1 + DEMO.drift * Math.max(0, t - cur.t);
  return {z: (prev.z + (cur.z - prev.z) * k) * drift, cx: prev.cx + (cur.cx - prev.cx) * k, cy: prev.cy + (cur.cy - prev.cy) * k};
};

export const DemoRapida: React.FC<{data: DemoData | null}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps, width: W, height: H, durationInFrames} = useVideoConfig();
  if (!data) return null;
  const t = frame / fps;
  const {z, cx, cy} = camAt(data.zooms, t, fps);
  // Escala base: la pantalla omple l'alçada del 16:9 (els laterals queden una mica retallats).
  const base = Math.max(W / data.srcW, H / data.srcH);
  const s = base * z;
  const vw = data.srcW * s;
  const vh = data.srcH * s;
  let x = W / 2 - cx * s;
  let y = H / 2 - cy * s;
  x = Math.min(0, Math.max(W - vw, x));
  y = Math.min(0, Math.max(H - vh, y));

  let ci = 0;
  data.chapters.forEach((c, i) => {
    if (c.t <= t) ci = i;
  });
  const ch = data.chapters[ci];
  const chF = (t - ch.t) * fps;
  const chIn = interpolate(chF, [0, 10], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  const chBig = interpolate(chF, [0, 8, 45, 60], [0, 1, 1, 0], clamp);

  const R = DEMO.bubble;
  return (
    <AbsoluteFill style={{background: '#0B0F1E', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: x, top: y, width: vw, height: vh}}>
        <OffthreadVideo src={staticFile('pantalla.mp4')} muted style={{width: '100%', height: '100%'}} />
      </div>
      {/* càmera en bombolla */}
      <div style={{position: 'absolute', right: DEMO.bubbleMargin, top: DEMO.bubbleMargin, width: R, height: R, borderRadius: '50%', overflow: 'hidden', border: '5px solid #FFFFFF', boxShadow: '0 14px 40px rgba(0,0,0,0.35)', background: '#222'}}>
        <OffthreadVideo src={staticFile('camera.mp4')} muted style={{position: 'absolute', height: '100%', left: '50%', transform: 'translateX(-50%)'}} />
      </div>
      {/* rètol de la part */}
      <div style={{position: 'absolute', left: 28, top: 28, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 22px 12px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.96)', boxShadow: '0 10px 30px rgba(20,24,60,0.25)', transform: `translateX(${(1 - chIn) * -40}px) scale(${1 + 0.18 * chBig})`, transformOrigin: 'left center', opacity: chIn}}>
        <UniLogo size={36} />
        <span style={{width: 2, height: 30, background: UNI.line}} />
        <span style={{fontFamily: JAKARTA, fontWeight: 800, fontSize: DEMO.chip, color: UNI.ink}}>{ch.label}</span>
      </div>
      {/* barra de progrés */}
      <div style={{position: 'absolute', left: 0, bottom: 0, height: DEMO.progress, width: `${(100 * frame) / durationInFrames}%`, background: `linear-gradient(90deg, ${UNI.indigo}, ${UNI.mint})`}} />
      <Audio src={staticFile('pantalla.mp4')} />
      <Loop durationInFrames={Math.round(38.4 * fps)}>
        <Audio src={staticFile('musica.wav')} volume={(f) => DEMO.music * interpolate(f + 0, [0, 30], [0, 1], clamp)} />
      </Loop>
    </AbsoluteFill>
  );
};

export const demoMetadata = async () => {
  const data: DemoData = await fetch(staticFile('demo-rapida.json')).then((r) => r.json());
  return {durationInFrames: Math.ceil(data.duration * DEMO.fps), fps: DEMO.fps, width: DEMO.width, height: DEMO.height, props: {data}};
};
