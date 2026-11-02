import {measureText} from '@remotion/layout-utils';
import {MG, type MgStyle} from '../../brand/mg';
import type {Box, FCount, FScreen, FWord, FabricaData, LineLayout, ScreenLayout} from './types';

// Com es reparteix el text de cada pantalla dins la zona segura. Es calcula una sola vegada, a calculateMetadata,
// amb les lletres ja carregades (mesurar abans donaria les mides de la lletra de recanvi).

/** Un número com l'escriu el guió: coma decimal i punt de milers si el guió en porta («1.200», «4,5»). */
export const formatCount = (c: FCount & {group?: boolean}, v: number) => {
  const [i, d] = Math.abs(v).toFixed(c.decimals).split('.');
  const int = c.group || Math.abs(c.to) >= 10000 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : i;
  return `${c.prefix}${v < 0 ? '-' : ''}${int}${d ? `,${d}` : ''}${c.suffix}`;
};

export const wordText = (w: Omit<FWord, 'f'>, s: MgStyle) => {
  const core = w.count ? formatCount(w.count, w.count.to) : w.t;
  const x = `${w.head}${core}${w.tail}`;
  return s.upper ? x.toUpperCase() : x;
};

export const safeBox = (d: FabricaData): Box => {
  const z = MG.safe[d.format];
  return {x: z.x0, y: z.y0, w: z.x1 - z.x0, h: z.y1 - z.y0};
};

const measure = (text: string, s: MgStyle, size: number, italic = false) =>
  measureText({
    text,
    fontFamily: s.font.head,
    fontSize: size,
    fontWeight: s.weight.head,
    validateFontIsLoaded: true,
    additionalStyles: italic ? {fontStyle: 'italic'} : undefined,
  }).width;

// Amplada d'una línia: les paraules clau d'Editorial van en cursiva; les de Pop Bold, dins d'un bloc amb marge.
const lineWidth = (ws: Omit<FWord, 'f'>[], idx: number[], s: MgStyle, size: number) => {
  const txt = idx.map((i) => wordText(ws[i], s)).join(' ');
  let w = measure(txt, s, size);
  if (s.layout === 'editorial' || s.layout === 'pop') {
    for (const i of idx) {
      if (!ws[i].accent) continue;
      const one = wordText(ws[i], s);
      if (s.layout === 'editorial') w += measure(one, s, size, true) - measure(one, s, size);
      else w += size * 0.36; // el marge del bloc de color
    }
  }
  return w;
};

const greedy = (ws: Omit<FWord, 'f'>[], s: MgStyle, size: number, maxW: number): number[][] => {
  const lines: number[][] = [];
  let cur: number[] = [];
  ws.forEach((_, i) => {
    const cand = [...cur, i];
    if (cur.length && lineWidth(ws, cand, s, size) > maxW) {
      lines.push(cur);
      cur = [i];
    } else cur = cand;
  });
  if (cur.length) lines.push(cur);
  return lines;
};

/** El text a la mida més gran que hi cap (amplada i alçada), amb les línies equilibrades. */
const fitUniform = (ws: Omit<FWord, 'f'>[], s: MgStyle, maxW: number, maxH: number, maxSize: number): LineLayout[] => {
  const lh = MG.text.lineHeight[s.layout];
  let size = maxSize;
  for (; size > MG.text.minSize; size *= 0.96) {
    if (ws.some((_, i) => lineWidth(ws, [i], s, size) > maxW)) continue;
    const lines = greedy(ws, s, size, maxW);
    if (lines.length * size * lh <= maxH) break;
  }
  // equilibrar: l'amplada més petita que manté el mateix nombre de línies
  const n = greedy(ws, s, size, maxW).length;
  let lo = Math.max(...ws.map((_, i) => lineWidth(ws, [i], s, size)));
  let hi = maxW;
  for (let k = 0; k < 12; k++) {
    const mid = (lo + hi) / 2;
    if (greedy(ws, s, size, mid).length <= n) hi = mid;
    else lo = mid;
  }
  return greedy(ws, s, size, hi + 1).map((words) => ({words, size}));
};

/** Kinetic Type: una o dues paraules per línia, i cada línia tan gran com l'amplada (fins a la mida màxima). */
const fitKinetic = (ws: Omit<FWord, 'f'>[], s: MgStyle, maxW: number, maxH: number, maxSize: number): LineLayout[] => {
  const units: number[][] = [];
  let carry: number[] = [];
  ws.forEach((w, i) => {
    // una paraula curta va amb la següent («a ciegas»), però mai més de dues juntes: «NO LE / DIGÁIS»
    if (w.t.length <= MG.text.shortWord && i < ws.length - 1 && carry.length === 0) carry.push(i);
    else {
      units.push([...carry, i]);
      carry = [];
    }
  });
  if (carry.length) units.push(carry);
  // una paraula curta al final («3.», «ya.») no es queda sola en una línia
  const lastU = units[units.length - 1];
  if (units.length > 1 && lastU.length === 1 && ws[lastU[0]].t.length <= MG.text.shortWord) units[units.length - 2].push(...units.pop()!);
  const chars = (u: number[]) => u.map((i) => wordText(ws[i], s)).join(' ').length;
  const groups: number[][] = [];
  for (const u of units) {
    const last = groups[groups.length - 1];
    // dues unitats comparteixen línia si són curtes i del mateix color (la paraula clau no es barreja amb la resta)
    if (last && chars([...last, ...u]) <= MG.text.kineticChars && ws[last[0]].accent === ws[u[0]].accent) last.push(...u);
    else groups.push([...u]);
  }
  const lh = MG.text.lineHeight.kinetic;
  let lines = groups.map((words) => ({words, size: Math.min(maxSize, (maxW / lineWidth(ws, words, s, 100)) * 100)}));
  const h = lines.reduce((a, l) => a + l.size * lh, 0);
  if (h > maxH) lines = lines.map((l) => ({...l, size: (l.size * maxH) / h}));
  return lines;
};

export const layoutScreen = (sc: FScreen, s: MgStyle, d: FabricaData): ScreenLayout => {
  const box = safeBox(d);
  const pad = s.layout === 'glass' ? MG.text.cardPad : s.layout === 'editorial' ? box.w * 0.03 : 0;
  const textW = box.w - 2 * pad;
  const innerH = box.h - 2 * pad;
  const gap = box.h * MG.text.gap;
  const label = sc.label || s.layout === 'editorial' ? Math.round(box.w * MG.text.label) : undefined;
  const sub = Math.round(box.w * MG.text.sub);
  const item = Math.round(box.w * MG.text.item);
  // amb punch-in, el text es fa prou petit perquè, un cop acostat, encara càpiga a la zona segura
  const punch = sc.punchAt !== undefined ? 1 + MG.amount.punch : 1;
  // la targeta final sense logo ni subtítol és una pantalla de text com les altres
  const kind = sc.kind === 'end' && !d.logo && !sc.sub ? 'text' : sc.kind;
  const budget = ((kind === 'text' && s.layout === 'kinetic' ? MG.text.budget.kinetic : MG.text.budget[kind]) * innerH) / punch;
  const maxSize = MG.text.maxSize[s.layout] * box.w;
  const fit = s.layout === 'kinetic' ? fitKinetic : fitUniform;
  const lines = fit(sc.words, s, textW / punch, budget, maxSize);
  let itemSize = item;
  if (sc.itemWords?.length) {
    const longest = Math.max(...sc.itemWords.map((ws) => measureText({text: ws.map((w) => wordText(w, s)).join(' '), fontFamily: s.font.body,
      fontSize: 100, fontWeight: s.weight.body, validateFontIsLoaded: true}).width / 100));
    // la marca fa 1,15 vegades la lletra i deixa un espai de 0,45 de la marca
    itemSize = Math.min(item, Math.floor(textW / (longest + 1.15 * 1.45)));
    // i que tots hi càpiguen d'alt sota el titular (marca 1,15, espai 0,55 i marge de dalt 0,9 de la lletra)
    const n = sc.itemWords.length;
    const room = innerH * (1 - MG.text.budget.list) - gap;
    itemSize = Math.min(itemSize, Math.floor(room / (n * 1.15 + (n - 1) * 0.55 + 0.9)));
  }
  const out: ScreenLayout = {lines, lineHeight: MG.text.lineHeight[s.layout], textW, label, sub, item: itemSize};
  if (sc.kind === 'image' && sc.image) {
    const textH = lines.reduce((a, l) => a + l.size * out.lineHeight, 0);
    const availH = innerH - textH - gap - (label ? label * 2 : 0);
    const availW = textW;
    const k = Math.min(availW / sc.image.w, availH / sc.image.h);
    const w = sc.image.w * k;
    const h = sc.image.h * k;
    const top = box.y + pad + (innerH - (textH + gap + h + (label ? label * 2 : 0))) / 2 + (label ? label * 2 : 0) + textH + gap;
    out.image = {x: box.x + (box.w - w) / 2, y: top, w, h};
    out.textTop = top - gap - textH - (label ? label * 2 : 0);
  }
  if (sc.kind === 'end' && d.logo) out.logoH = Math.round(innerH * 0.12);
  return out;
};
