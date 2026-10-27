import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {LAUNCH} from '../../brand/unimatx';
import {duckVolume} from '../vendor/launch-video-kit/audio';
import {fixed, useCamera} from '../vendor/launch-video-kit/camera';
import {Subtitles} from '../vendor/launch-video-kit/Subtitle';
import {CATALEG_CLICK, ESCENES, LIMITS_TRIA, TORN_MSG_AT, TORN_TICK_AT} from './Escenes';
import {CUES, DURATION, SCENES, VO, sceneOf, wordAt, type SceneId} from './muntatge';
import {Cursor, POP} from './Ui';

// Vídeo de presentació d'UniMatx (projectes/unimatx-llancament): --public-dir=projectes/unimatx-llancament/remotion

const SceneView: React.FC<{id: SceneId}> = ({id}) => {
  const f = useCurrentFrame();
  const esc = ESCENES[id];
  const design = {width: LAUNCH.width, height: LAUNCH.height};
  const cam = useCamera(esc.cam ?? fixed(design.width / 2, design.height / 2, 1), f, design);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: design.width, height: design.height, transform: cam.transform, transformOrigin: '0 0'}}>
        <esc.Body f={f} />
        {esc.cursor && <Cursor f={f} keys={esc.cursor} camScale={cam.s} />}
      </div>
    </AbsoluteFill>
  );
};

// Efectes: clic a cada clic del cursor, «whoosh» a l'entrada de les escenes de marca, «pop» a les targetes.
const SFX: {at: number; src: string; v: number}[] = (() => {
  const out: {at: number; src: string; v: number}[] = [];
  for (const s of SCENES) {
    for (const k of ESCENES[s.id].cursor ?? []) if (k.click) out.push({at: s.from + k.at, src: 'click', v: 0.5});
    if (['marca', 'xifres', 'top3', 'informe', 'final'].includes(s.id)) out.push({at: Math.max(0, s.from - 6), src: 'whoosh', v: 0.6});
    if (['faseRiasec', 'faseTorn'].includes(s.id)) out.push({at: s.from, src: 'pop', v: 0.6});
  }
  TORN_MSG_AT.forEach((at) => out.push({at: sceneOf('torn').from + at, src: 'pop', v: 0.5}));
  TORN_TICK_AT.forEach((at) => out.push({at: sceneOf('torn').from + at, src: 'click', v: 0.4}));
  out.push({at: sceneOf('limits').from + LIMITS_TRIA, src: 'click', v: 0.4});
  out.push({at: sceneOf('cataleg').from + CATALEG_CLICK + 4, src: 'pop', v: 0.5});
  // Cold open: un tic suau per cada nom de grau fins que surt «+20%».
  for (let f = 0; f < wordAt('01', 2); f += LAUNCH.flicker * 2) out.push({at: f, src: 'click', v: 0.18});
  return out;
})();

export const Llancament: React.FC = () => {
  const music = VO.map((l) => ({at: l.at - LAUNCH.musicAt, frames: l.frames}));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SCENES.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
          <SceneView id={s.id} />
        </Sequence>
      ))}
      <Subtitles cues={CUES} fontFamily={POP} />
      {VO.map((l) => (
        <Sequence key={l.id} from={l.at} durationInFrames={l.frames + 6}>
          <Audio src={staticFile(`vo/vo-${l.id}.wav`)} />
        </Sequence>
      ))}
      <Sequence from={LAUNCH.musicAt}>
        <Audio src={staticFile('musica.wav')} volume={(f) => duckVolume(f, music, LAUNCH.duck, {total: DURATION - LAUNCH.musicAt, fadeOut: 30})} />
      </Sequence>
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={20}>
          <Audio src={staticFile(`${s.src}.wav`)} volume={LAUNCH.sfx * s.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const LLANCAMENT_DURATION = DURATION;
