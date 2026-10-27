import React from 'react';
import {staticFile} from 'remotion';
import {REEL} from '../../brand/unimatx';
import {ABReel} from './AB';
import type {Guio, Timing} from './base';
import {SerieReel} from './Serie';

// Un sol component per als vuit reels: el codi (A1…S4) tria el guió, la veu i la fórmula.
// Es renderitza amb --public-dir=projectes/unimatx-reels --props='{"code":"A1"}'.
export type ReelProps = {code: string; guio: Guio | null; timing: Timing | null};

export const Reel: React.FC<ReelProps> = ({guio, timing}) => {
  if (!guio || !timing) return null;
  return guio.kind === 'ab' ? <ABReel guio={guio} timing={timing} /> : <SerieReel guio={guio} timing={timing} />;
};

export const reelMetadata = async ({props}: {props: ReelProps}) => {
  const all: {videos: Guio[]} = await fetch(staticFile('guions.json')).then((r) => r.json());
  const guio = all.videos.find((v) => v.code === props.code) ?? null;
  const timing: Timing = await fetch(staticFile(`${props.code}/timing.json`)).then((r) => r.json());
  return {durationInFrames: Math.ceil(timing.duration * REEL.fps), fps: REEL.fps, width: REEL.width, height: REEL.height, props: {...props, guio, timing}};
};
