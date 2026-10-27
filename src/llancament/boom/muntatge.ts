import {BOOM} from '../../../brand/unimatx';
import vo from '../../../projectes/unimatx-llancament/vo-v2.json';

// Muntatge de la versió «BOOM» (v2). La música comença al fotograma 0 i va a 120 ppm: cada escena cau a temps
// (BOOM.beat) o a compàs (BOOM.bar). Les durades de la veu surten de vo-v2.json (scripts/unimatx/veu_linies.py --nom v2).

export type BoomId =
  | 'h17'
  | 'h660'
  | 'hTriar'
  | 'h20'
  | 'hAny'
  | 'forat'
  | 'logo'
  | 'p20'
  | 'pCasos'
  | 'pTorn'
  | 'pMates'
  | 'pXifres'
  | 'top3'
  | 'valor'
  | 'preu'
  | 'contrast'
  | 'final';

const b = (beats: number) => beats * BOOM.beat;

export const SCENES: {id: BoomId; from: number; to: number}[] = [
  {id: 'h17', from: 0, to: b(4)},
  {id: 'h660', from: b(4), to: b(8)},
  {id: 'hTriar', from: b(8), to: b(11)},
  {id: 'h20', from: b(11), to: b(16.67)},
  {id: 'hAny', from: b(16.67), to: 328},
  {id: 'forat', from: 328, to: b(24)},
  {id: 'logo', from: b(24), to: b(28)},
  {id: 'p20', from: b(28), to: b(32)},
  {id: 'pCasos', from: b(32), to: b(38)},
  {id: 'pTorn', from: b(38), to: b(44)},
  {id: 'pMates', from: b(44), to: b(50)},
  {id: 'pXifres', from: b(50), to: b(60)},
  {id: 'top3', from: b(60), to: b(64)},
  {id: 'valor', from: b(64), to: b(73)},
  {id: 'preu', from: b(73), to: b(77)},
  {id: 'contrast', from: b(77), to: b(88)},
  {id: 'final', from: b(88), to: b(100)},
].map((s) => ({...s, from: Math.round(s.from), to: Math.round(s.to)})) as {id: BoomId; from: number; to: number}[];

export const DURATION = SCENES[SCENES.length - 1].to;
export const sceneOf = (id: BoomId) => SCENES.find((s) => s.id === id)!;

const AT: Record<string, number> = {
  '01': 8, '02': 62, '03': 122, '04': 168, '05': 255, '06': 332,
  '07': 425, '08': 485, '09': 578, '10': 665,
  '11': 752, '12': 808, '13': 858, '14': 906,
  '15': 962, '16': 992, '17': 1032, '18': 1058, '19': 1098,
  '20': 1160, '21': 1222, '22': 1256, '23': 1330,
};

export type Vo = {id: string; text: string; at: number; frames: number; words: {text: string; start: number; end: number}[]};
export const VO: Vo[] = vo.lines.map((l) => ({id: l.id, text: l.text, at: AT[l.id], frames: l.frames, words: l.words}));
export const voOf = (id: string) => VO.find((l) => l.id === id)!;
export const wordAt = (id: string, n: number) => {
  const l = voOf(id);
  return l.at + Math.round(l.words[Math.min(n, l.words.length - 1)].start * 30);
};

// Cops (boom gros): l'entrada, el top 3 i el final. Impactes: les paraules que cauen al ganxo i el preu.
export const BOOMS = [sceneOf('logo').from, sceneOf('top3').from, sceneOf('final').from];
export const IMPACTS = [wordAt('01', 1), wordAt('02', 0), wordAt('03', 4), wordAt('04', 2), wordAt('05', 2), wordAt('05', 4), wordAt('19', 2), wordAt('21', 1)];

// Subtítols grans, paraula a paraula, només de les frases que no són escrites en pantalla.
export const CAPTIONS = ['08', '09', '10'];
