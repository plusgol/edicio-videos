import {LAUNCH} from '../../brand/unimatx';
import vo from '../../projectes/unimatx-llancament/vo.json';

// Muntatge del vídeo de presentació. La veu es va generar abans (scripts/unimatx/veu_linies.py) i les seves durades
// en fotogrames (vo.json) fixen els temps. Les escenes de la marca en endavant cauen a compàs: la música entra a
// LAUNCH.musicAt i cada compàs són LAUNCH.bar fotogrames.
const bar = (k: number) => LAUNCH.musicAt + k * LAUNCH.bar;

export type SceneId =
  | 'cold'
  | 'marca'
  | 'context'
  | 'faseRiasec'
  | 'pregunta'
  | 'radar'
  | 'faseTorn'
  | 'torn'
  | 'xifres'
  | 'limits'
  | 'top3'
  | 'informe'
  | 'cataleg'
  | 'final';

export const SCENES: {id: SceneId; from: number; to: number}[] = [
  {id: 'cold', from: 0, to: bar(0)},
  {id: 'marca', from: bar(0), to: bar(3)},
  {id: 'context', from: bar(3), to: bar(4.5)},
  {id: 'faseRiasec', from: bar(4.5), to: bar(5)},
  {id: 'pregunta', from: bar(5), to: bar(7)},
  {id: 'radar', from: bar(7), to: bar(8)},
  {id: 'faseTorn', from: bar(8), to: bar(8.5)},
  {id: 'torn', from: bar(8.5), to: bar(10.5)},
  {id: 'xifres', from: bar(10.5), to: bar(13)},
  {id: 'limits', from: bar(13), to: bar(15)},
  {id: 'top3', from: bar(15), to: bar(17)},
  {id: 'informe', from: bar(17), to: bar(19.5)},
  {id: 'cataleg', from: bar(19.5), to: bar(22)},
  {id: 'final', from: bar(22), to: bar(25)},
];

export const DURATION = SCENES[SCENES.length - 1].to;
export const sceneOf = (id: SceneId) => SCENES.find((s) => s.id === id)!;

// On entra cada línia de veu.
const AT: Record<string, number> = {
  '01': 38,
  '02': 166,
  '03': bar(0) + 10,
  '04': bar(1) + 24,
  '05': bar(4) + 18,
  '06': bar(8) + 10,
  '07': bar(10.5) + 5,
  '08': bar(13) + 8,
  '09': bar(15) + 8,
  '10': bar(17) + 8,
  '11': bar(19.5) + 8,
  '12': bar(22) + 10,
};

export type VoLine = {id: string; text: string; at: number; frames: number; words: {text: string; start: number; end: number}[]};
export const VO: VoLine[] = vo.lines.map((l) => ({id: l.id, text: l.text, at: AT[l.id], frames: l.frames, words: l.words}));
export const voOf = (id: string) => VO.find((l) => l.id === id)!;

// Fotograma (absolut) en què sona la paraula n-èsima d'una línia.
export const wordAt = (id: string, n: number) => {
  const l = voOf(id);
  return l.at + Math.round(l.words[Math.min(n, l.words.length - 1)].start * LAUNCH.fps);
};

// Subtítols només de les línies que no són escrites en pantalla (regla del kit). «dur» és temps de lectura: entra
// una mica abans que la veu i es queda després, sense trepitjar la línia següent.
const SUBS = ['05', '06', '08', '09'];
export const CUES = SUBS.map((id) => {
  const l = voOf(id);
  const at = l.at - 4;
  const next = VO.find((x) => x.at > l.at)?.at ?? DURATION;
  return {at, dur: Math.min(l.at + l.frames + 14, next - 4) - at, text: l.text};
});
