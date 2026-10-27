import React from 'react';
import {AbsoluteFill, Audio, Easing, Loop, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ISO, TIMING, TYPE, UNI} from '../../brand/unimatx';
import {JAKARTA, Pill, UniLogo, beatAt, clamp, ease, parseMarks, type Guio, type Timing} from './base';
import {Night} from './Night';
import {Phone, type Screen} from './Phone';
import {AB_SPECS, type ABBeat} from './specs';
import {PinLabel, World, iso, landmarkCenter, type Cam, type Landmark} from './World';

// Fórmula A-B (vídeo de ClubOS): una sola ciutat de dia, càmera que vola, títols al terç de dalt amb la paraula clau en
// píndola, el mòbil amb l'app per la dreta, el «mentrestant» de nit, logo, pregunta i CTA. Acaba al pla de l'inici.

const ANCHOR = {x: 540, y: 1160, xPhone: 300};
const ZOOM = 1.35; // tota la ciutat més a prop: cases grans com a ClubOS

const Title: React.FC<{text: string; f: number; color: string; size: number; top: number}> = ({text, f, color, size, top}) => {
  const lines = text.split(' / ');
  let k = 0;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: JAKARTA, fontWeight: 800, fontSize: size, lineHeight: 1.12, color, letterSpacing: '-0.015em'}}>
      {lines.map((line, li) => (
        <div key={li}>
          {parseMarks(line).map((part, pi) =>
            (part.mark ? [part.text] : part.text.split(/(\s+)/)).map((w, wi) => {
              if (!w.trim()) return w;
              const i = k++;
              const p = interpolate(f, [i * TIMING.wordStagger, i * TIMING.wordStagger + 8], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.8))});
              const style: React.CSSProperties = {display: 'inline-block', opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 26}px) scale(${0.9 + 0.1 * p})`};
              return part.mark ? (
                <span key={`${pi}-${wi}`} style={style}><Pill p={interpolate(f, [i * TIMING.wordStagger + 3, i * TIMING.wordStagger + 12], [0, 1], clamp)}>{w}</Pill></span>
              ) : (
                <span key={`${pi}-${wi}`} style={style}>{w}</span>
              );
            }),
          )}
        </div>
      ))}
    </div>
  );
};

const Sky: React.FC<{t: number; dusk: boolean}> = ({t, dusk}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: `linear-gradient(${dusk ? ISO.duskTop : ISO.skyTop} 0%, ${dusk ? ISO.duskBottom : ISO.skyBottom} 62%, rgba(244,247,251,0) 100%)`}} />
    {!dusk &&
      [[140, 90, 260], [560, 60, 320], [900, 140, 240], [330, 220, 200]].map(([x, y, w], i) => (
        <div key={i} style={{position: 'absolute', left: ((x + t * (8 + i * 3)) % 1400) - 200, top: y, width: w, height: w * 0.42, borderRadius: '50%', background: '#FFFFFF', filter: 'blur(6px)', opacity: 0.92}} />
      ))}
    <div style={{position: 'absolute', left: 0, right: 0, top: 430, height: 420, background: `linear-gradient(rgba(244,247,251,0), ${dusk ? 'rgba(233,162,107,0.55)' : 'rgba(244,247,251,0.85)'} 45%, rgba(244,247,251,0))`}} />
  </>
);

export const ABReel: React.FC<{guio: Guio; timing: Timing}> = ({guio, timing}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const spec = AB_SPECS[guio.code];
  const t = frame / fps;
  const bi = beatAt(timing.beats, t);
  const startF = (i: number) => Math.round(Math.max(0, timing.beats[i].start - 0.08) * fps);
  const B = (i: number): ABBeat => spec.beats[i] ?? {};
  const beat = B(bi);
  const scene = beat.scene ?? 'world';
  const lm = (id: string) => spec.landmarks.find((l) => l.id === id) as Landmark;
  const dusk = spec.theme === 'dusk';

  // Càmera: cada beat té un objectiu; s'hi va amb una corba suau des del del beat anterior.
  const camOf = (i: number): Cam => {
    let j = i;
    while (j > 0 && !B(j).cam) j--;
    const b = B(j);
    const id = b.cam ?? 'all';
    let x: number, y: number;
    if (id === 'all') [x, y] = iso(17, 17, 60);
    else if (id === 'pair') {
      const a = landmarkCenter(spec.landmarks[0]);
      const c = landmarkCenter(spec.landmarks[1]);
      [x, y] = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
    } else [x, y] = landmarkCenter(lm(id));
    const phone = Boolean(B(i).phone);
    return {x, y, zoom: (b.zoom ?? 0.8) * ZOOM, ax: phone ? ANCHOR.xPhone : ANCHOR.x, ay: ANCHOR.y};
  };
  const prev = camOf(Math.max(0, bi - 1));
  const cur = camOf(bi);
  const k = bi === 0 ? 1 : ease(frame - startF(bi), 0, TIMING.camEase);
  const drift = Math.sin(t / 3.2) * 22;
  const cam: Cam = {
    x: prev.x + (cur.x - prev.x) * k + drift,
    y: prev.y + (cur.y - prev.y) * k,
    zoom: (prev.zoom + (cur.zoom - prev.zoom) * k) * (1 + 0.012 * Math.sin(t / 2.1)),
    ax: prev.ax + (cur.ax - prev.ax) * k,
    ay: prev.ay + (cur.ay - prev.ay) * k,
  };
  const toScreen = (p: [number, number]) => [(p[0] - cam.x) * cam.zoom + cam.ax, (p[1] - cam.y) * cam.zoom + cam.ay];

  // El títol torna a entrar només quan canvia el text.
  let titleFrom = bi;
  while (titleFrom > 0 && guio.beats[titleFrom - 1].text === guio.beats[bi].text) titleFrom--;
  const tf = frame - startF(titleFrom);

  // Mòbil: entra quan apareix, i el contingut torna a entrar a cada canvi de pantalla.
  let phoneFrom = bi;
  while (phoneFrom > 0 && B(phoneFrom - 1).phone) phoneFrom--;
  let screenFrom = bi;
  while (screenFrom > 0 && B(screenFrom - 1).phone === beat.phone) screenFrom--;
  const phoneIn = ease(frame - startF(phoneFrom), 0, TIMING.phoneIn, 0, 1, Easing.out(Easing.cubic));

  let nightFrom = bi;
  while (nightFrom > 0 && B(nightFrom - 1).scene === 'night') nightFrom--;

  const ctaWord = guio.cta ?? '';
  const ctaSub = guio.beats[guio.beats.length - 1].veu.replace(new RegExp(`^Comenta ${ctaWord}\\s*`), '').replace(/\.$/, '');

  // Efectes: un per canvi, mai dos alhora.
  const sfx: {at: number; src: string; v: number}[] = [];
  spec.beats.forEach((b, i) => {
    if (i >= timing.beats.length) return;
    const at = startF(i);
    const p = B(i - 1);
    if (b.scene === 'night' && p.scene !== 'night') sfx.push({at, src: 'whoosh', v: 0.8});
    else if (b.scene === 'logo') sfx.push({at, src: 'notif', v: 0.6});
    else if (b.phone && !p.phone) sfx.push({at, src: 'whoosh', v: 0.6});
    else if (b.phone && b.phone !== p.phone) sfx.push({at, src: 'tick', v: 0.9});
    else if (b.pins?.length) sfx.push({at: at + 4, src: 'pop', v: 0.7});
    else if (i > 0 && guio.beats[i].text !== guio.beats[i - 1].text) sfx.push({at, src: 'pop', v: 0.45});
  });

  return (
    <AbsoluteFill style={{background: dusk ? '#C9A88E' : ISO.ground, overflow: 'hidden'}}>
      {(scene === 'world' || scene === 'cta') && (
        <>
          <World landmarks={spec.landmarks} theme={spec.theme} cam={cam} t={t} active={beat.cam && beat.cam !== 'all' && beat.cam !== 'pair' ? beat.cam : undefined} />
          {dusk && <div style={{position: 'absolute', inset: 0, background: 'rgba(40,36,90,0.32)', mixBlendMode: 'multiply'}} />}
          <Sky t={t} dusk={dusk} />
          {(beat.pins ?? []).map((p, i) => {
            const [x, y] = toScreen(landmarkCenter(lm(p.at)));
            return <PinLabel key={i} x={x} y={y - 60 * cam.zoom} text={p.text} tone={p.tone} p={ease(frame - startF(bi), 4 + i * 3, 16 + i * 3)} />;
          })}
          {beat.phone && (
            <>
              <div style={{position: 'absolute', left: 0, right: 0, top: 104, display: 'flex', justifyContent: 'center', gap: 12, fontFamily: JAKARTA, fontWeight: 800, fontSize: TYPE.crumb, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: phoneIn}}>
                {spec.crumbs.map((c, i) => (
                  <span key={c} style={{color: i === beat.crumb ? UNI.indigo : 'rgba(21,24,51,0.55)'}}>
                    {c}
                    {i < spec.crumbs.length - 1 && <span style={{color: 'rgba(21,24,51,0.25)', marginLeft: 14}}>·</span>}
                  </span>
                ))}
              </div>
              <Phone screen={beat.phone as Screen} since={startF(screenFrom)} inP={phoneIn} style={{left: 560, top: 860}} />
            </>
          )}
          {scene === 'cta' ? (
            <>
              <Title text="Comenta" f={tf} color={UNI.ink} size={TYPE.title} top={300} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', fontFamily: JAKARTA, fontWeight: 800, fontSize: TYPE.titleBig}}>
                <span style={{display: 'inline-block', transform: `scale(${ease(tf, 4, 16, 0.6, 1, Easing.out(Easing.back(2)))})`, background: `linear-gradient(90deg, ${UNI.mint}, #4FD1C5)`, color: UNI.mintInk, borderRadius: 28, padding: '6px 40px'}}>{ctaWord}</span>
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center', fontFamily: JAKARTA, fontWeight: 700, fontSize: 40, color: UNI.ink, opacity: ease(tf, 14, 24)}}>{ctaSub}</div>
            </>
          ) : (
            <Title text={guio.beats[bi].text} f={tf} color={dusk ? '#FFFFFF' : UNI.ink} size={TYPE.title} top={beat.phone ? 190 : 260} />
          )}
        </>
      )}
      {scene === 'night' && (
        <>
          <Night variant={spec.night} f={frame - startF(nightFrom)} />
          <Title text={guio.beats[bi].text} f={tf} color="#FFFFFF" size={TYPE.title} top={300} />
        </>
      )}
      {scene === 'logo' && (
        <AbsoluteFill style={{background: '#F7F8FB', alignItems: 'center', justifyContent: 'center', gap: 40}}>
          <div style={{transform: `scale(${ease(frame - startF(bi), 0, 14, 0.85, 1, Easing.out(Easing.back(1.6)))})`, opacity: ease(frame - startF(bi), 0, 8)}}>
            <UniLogo size={150} />
          </div>
          <div style={{fontFamily: JAKARTA, fontWeight: 800, fontSize: 56, color: UNI.ink, opacity: ease(frame - startF(bi), 10, 20)}}>
            Troba la teva <span style={{color: '#2F9E6E', fontStyle: 'italic'}}>carrera ideal</span>
          </div>
        </AbsoluteFill>
      )}
      <Audio src={staticFile(`${guio.code}/veu.wav`)} />
      <Loop durationInFrames={Math.round(38.4 * fps)}>
        <Audio src={staticFile('so/musica-ab.wav')} volume={TIMING.musicAB} />
      </Loop>
      {sfx.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={Math.round(1.3 * fps)}>
          <Audio src={staticFile(`so/${s.src}.wav`)} volume={TIMING.sfx * s.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
