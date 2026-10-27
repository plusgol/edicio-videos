import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {NIGHT, TIMING, TYPE, UNI} from '../../brand/unimatx';
import {ANTON, JAKARTA, POPPINS, beatAt, clamp, ease, type Guio, type Timing, type Word} from './base';
import {Scene} from './Scenes';
import {SERIE_SPECS} from './serieSpecs';

// Fórmula sèrie (vídeo del zombie): il·lustració 2D de nit, un pla per frase amb apropament lent, xip d'hora a dalt a
// l'esquerra, targetes d'avís, salts enrere amb ◀◀, subtítols karaoke (paraula que sona en groc) i cliffhanger.

const Chip: React.FC<{t: string; sub?: string; p: number}> = ({t, sub, p}) => (
  <div style={{position: 'absolute', left: 56, top: 120, transform: `translateY(${(1 - p) * -30}px)`, opacity: p, background: '#0B1026', border: `4px solid ${NIGHT.chipBorder}`, borderRadius: 14, padding: '10px 18px', fontFamily: JAKARTA, color: NIGHT.karaoke}}>
    <div style={{fontSize: TYPE.chip, fontWeight: 800, lineHeight: 1}}>{t}</div>
    {sub && <div style={{fontSize: TYPE.chipSub, fontWeight: 800, color: '#fff', letterSpacing: '0.1em', marginTop: 6}}>{sub}</div>}
  </div>
);

const Notif: React.FC<{head: string; body: string; p: number}> = ({head, body, p}) => (
  <div style={{position: 'absolute', left: 70, right: 70, top: 280, transform: `translateY(${(1 - p) * -60}px)`, opacity: p, background: 'rgba(255,255,255,0.96)', borderRadius: 28, padding: '22px 26px', fontFamily: POPPINS, boxShadow: '0 30px 70px rgba(0,0,0,0.45)'}}>
    <div style={{fontSize: 22, fontWeight: 700, color: '#C2412D', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 10}}>
      <span style={{width: 14, height: 14, borderRadius: 7, background: '#C2412D'}} />{head}
    </div>
    <div style={{fontSize: 36, fontWeight: 600, color: UNI.ink, marginTop: 6, lineHeight: 1.2}}>{body}</div>
    <div style={{fontSize: 18, color: UNI.inkSoft, marginTop: 8}}>avís fictici de la sèrie</div>
  </div>
);

// Paraules agrupades en trossos curts (2–3 paraules), com al vídeo de referència.
const groups = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    const len = cur.reduce((a, x) => a + x.text.length + 1, 0) + w.text.length;
    if (cur.length && (len > TIMING.captionMaxChars || cur.length >= 3)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.?!…:]$/.test(w.text)) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

const Karaoke: React.FC<{words: Word[]; t: number}> = ({words, t}) => {
  const gs = groups(words);
  let g = -1;
  for (let i = 0; i < gs.length; i++) if (t >= gs[i][0].start - 0.05) g = i;
  if (g < 0) return null;
  const cur = gs[g];
  const lastEnd = cur[cur.length - 1].end;
  if (g === gs.length - 1 && t > lastEnd + 0.6) return null;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1350, textAlign: 'center', fontFamily: ANTON, fontSize: TYPE.caption, lineHeight: 1.05, color: NIGHT.caption, textTransform: 'uppercase', letterSpacing: '0.01em', textShadow: '0 5px 0 rgba(6,9,24,0.9), 0 0 24px rgba(0,0,0,0.6)'}}>
      {cur.map((w, i) => {
        const on = t >= w.start - 0.03 && (i === cur.length - 1 || t < cur[i + 1].start - 0.03);
        return (
          <span key={i} style={{color: on ? NIGHT.karaoke : NIGHT.caption}}>
            {w.text}
            {i < cur.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};

const Bubbles: React.FC<{labels: string[]; f: number}> = ({labels, f}) => {
  const pos = [[90, 860], [600, 820], [700, 1040], [160, 1080]];
  return (
    <>
      {labels.map((l, i) => {
        const p = interpolate(f, [i * 7, i * 7 + 9], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
        return (
          <div key={l} style={{position: 'absolute', left: pos[i][0], top: pos[i][1], transform: `scale(${p})`, transformOrigin: 'bottom left', background: '#fff', borderRadius: 30, padding: '16px 30px', fontFamily: POPPINS, fontWeight: 700, fontSize: 48, color: UNI.ink, boxShadow: '0 16px 40px rgba(0,0,0,0.35)'}}>
            {l}
          </div>
        );
      })}
    </>
  );
};

export const SerieReel: React.FC<{guio: Guio; timing: Timing}> = ({guio, timing}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const spec = SERIE_SPECS[guio.code];
  const t = frame / fps;
  const bi = beatAt(timing.beats, t);
  const startF = (i: number) => Math.round(Math.max(0, timing.beats[i].start - 0.1) * fps);
  const endF = (i: number) => (i + 1 < timing.beats.length ? startF(i + 1) : durationInFrames);
  const b = spec[bi];
  const f = frame - startF(bi);
  const shotLen = endF(bi) - startF(bi);
  const lastWord = timing.beats[timing.beats.length - 1].end;
  const tail = t > lastWord + 0.35; // la cua: negre i «PART 2»

  // Apropament lent i constant de cada pla.
  const push = 1 + TIMING.pushPerShot * Math.min(1, f / Math.max(1, shotLen));

  // El xip es queda fins que un altre el canvia.
  let ci = bi;
  while (ci > 0 && !spec[ci].chip) ci--;
  const chip = spec[ci].chip;
  const chipP = ci === bi ? ease(f, 2, 12) : 1;

  const rw = b.rewind ? interpolate(f, [0, TIMING.rewind], [1, 0], clamp) : 0;

  const sfx: {at: number; src: string; v: number}[] = [];
  spec.forEach((s, i) => {
    if (i >= timing.beats.length) return;
    if (s.rewind) sfx.push({at: startF(i), src: 'rewind', v: 0.9});
    if (s.notif || (s.scene.s === 'hand' && s.scene.phone.k === 'notif')) sfx.push({at: startF(i) + 4, src: 'notif', v: 0.55});
    if (s.hit) sfx.push({at: Math.round(timing.beats[i].start * fps), src: 'hit', v: 0.8});
  });
  sfx.push({at: Math.round((lastWord + 0.35) * fps), src: 'hit', v: 1});

  return (
    <AbsoluteFill style={{background: NIGHT.bg, overflow: 'hidden'}}>
      {!tail && (
        <>
          <AbsoluteFill style={{transform: `scale(${push}) translateY(${rw * Math.sin(frame * 3) * 14}px)`, filter: rw ? `saturate(${1 - rw * 0.7}) contrast(${1 + rw * 0.2})` : undefined}}>
            <Scene spec={b.scene} f={f} />
            {b.scene.s === 'class' && b.scene.bubbles && <Bubbles labels={b.scene.bubbles} f={f} />}
          </AbsoluteFill>
          {rw > 0 && (
            <AbsoluteFill style={{opacity: rw, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 3px, transparent 3px 14px)'}}>
              <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: JAKARTA, fontWeight: 800, fontSize: 220, color: 'rgba(255,255,255,0.75)'}}>◀◀</div>
            </AbsoluteFill>
          )}
          {/* vinyeta perquè els subtítols es llegeixin sempre */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 1180, bottom: 0, background: 'linear-gradient(rgba(6,9,24,0), rgba(6,9,24,0.55) 40%, rgba(6,9,24,0.75))'}} />
          {b.notif && <Notif head={b.notif.head} body={b.notif.body} p={ease(f, 4, 16, 0, 1, Easing.out(Easing.back(1.4)))} />}
          {chip && <Chip t={chip.t} sub={chip.sub} p={chipP} />}
          <Karaoke words={timing.beats[bi].words} t={t} />
        </>
      )}
      {tail && (
        <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: JAKARTA, fontWeight: 800, fontSize: 64, letterSpacing: '0.2em', color: '#000', background: '#fff', padding: '18px 40px', borderRadius: 14, transform: `scale(${ease(frame - Math.round((lastWord + 0.35) * fps), 0, 10, 0.8, 1, Easing.out(Easing.back(2)))})`}}>
            PART 2
          </div>
          <div style={{position: 'absolute', bottom: 300, fontFamily: POPPINS, fontSize: 34, color: 'rgba(255,255,255,0.75)'}}>Història de ficció</div>
        </AbsoluteFill>
      )}
      <Audio src={staticFile(`${guio.code}/veu.wav`)} />
      <Audio src={staticFile('so/musica-serie.wav')} volume={TIMING.musicSerie} />
      {sfx.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={Math.round(1.4 * fps)}>
          <Audio src={staticFile(`so/${s.src}.wav`)} volume={TIMING.sfx * s.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
