import type {Overlay, RenderPlan, RenderSegment} from '../types';

// Format de work/editor.json (l'escriu scripts/munta.py).
export type EditorData = {
  fps: number;
  width: number;
  height: number;
  title: string;
  theme: RenderPlan['theme'];
  sources: Record<string, {gainDb: number}>;
  ranges: {id: string; source: string; block: string; captions: string; reason: string; keep: boolean}[];
  segments: (Omit<RenderSegment, 'src' | 'fromFrame' | 'volumeDb'> & {range: string; source: string})[];
  overlays: {
    id: string;
    type: string;
    props: Record<string, unknown>;
    reason: string;
    anchor: {source: string; ms: number} | null;
    atOutputMs: number | null;
    durationMs: number;
    offsetMs: number;
    enabled: boolean;
  }[];
};

// El que canvia la persona que revisa. És el que es desa i el que Claude aplica a l'EDL.
export type Revision = {
  overlays: Record<string, {enabled: boolean; props: Record<string, unknown>; offsetMs: number; durationMs: number; comment: string}>;
  ranges: Record<string, {keep: boolean; comment: string}>;
  note: string;
};

export const initialRevision = (d: EditorData): Revision => ({
  overlays: Object.fromEntries(
    d.overlays.map((o) => [o.id, {enabled: o.enabled, props: o.props, offsetMs: o.offsetMs, durationMs: o.durationMs, comment: ''}]),
  ),
  ranges: Object.fromEntries(d.ranges.map((r) => [r.id, {keep: r.keep, comment: ''}])),
  note: '',
});

// Una revisió desada abans pot no conèixer recursos o talls nous: es combina amb la inicial.
export const mergeRevision = (base: Revision, saved: Partial<Revision> | undefined): Revision => ({
  overlays: Object.fromEntries(
    Object.entries(base.overlays).map(([id, o]) => [id, {...o, ...(saved?.overlays?.[id] ?? {})}]),
  ),
  ranges: Object.fromEntries(Object.entries(base.ranges).map(([id, r]) => [id, {...r, ...(saved?.ranges?.[id] ?? {})}])),
  note: saved?.note ?? base.note,
});

export type Timing = {fromFrame: number; durationInFrames: number};

// Mateix càlcul que scripts/munta.py: segments conservats en ordre i temps de l'original → temps de sortida.
export const buildPlan = (d: EditorData, rev: Revision, media: Record<string, string>) => {
  const maxGain = Math.max(...Object.values(d.sources).map((s) => s.gainDb));
  let out = 0;
  const segments: (RenderSegment & {range: string; source: string})[] = [];
  for (const s of d.segments) {
    if (!rev.ranges[s.range]?.keep) {
      continue;
    }
    segments.push({
      ...s,
      src: media[s.source],
      fromFrame: out,
      volumeDb: d.sources[s.source].gainDb - maxGain,
    });
    out += s.durationInFrames;
  }
  const total = Math.max(out, 1);

  const srcToOutMs = (source: string, ms: number): number | null => {
    for (const s of segments) {
      if (s.source !== source) {
        continue;
      }
      const a = (s.trimBefore * 1000) / d.fps;
      const b = ((s.trimBefore + s.durationInFrames) * 1000) / d.fps;
      if (ms < a) {
        return (s.fromFrame * 1000) / d.fps;
      }
      if (ms < b) {
        return (s.fromFrame * 1000) / d.fps + (ms - a);
      }
    }
    return null;
  };

  const toFrame = (ms: number) => Math.round((ms * d.fps) / 1000);
  const overlayTimes: Record<string, Timing | null> = {};
  const overlays: Overlay[] = [];
  for (const o of d.overlays) {
    const r = rev.overlays[o.id];
    const base = o.atOutputMs ?? (o.anchor ? srcToOutMs(o.anchor.source, o.anchor.ms) : null);
    if (base === null) {
      overlayTimes[o.id] = null;
      continue;
    }
    const at = Math.max(0, base + r.offsetMs);
    const fromFrame = toFrame(at);
    const durationInFrames = Math.min(toFrame(at + r.durationMs) - fromFrame, total - fromFrame);
    overlayTimes[o.id] = durationInFrames > 0 ? {fromFrame, durationInFrames} : null;
    if (r.enabled && durationInFrames > 0) {
      overlays.push({id: o.id, type: o.type, fromFrame, durationInFrames, props: r.props});
    }
  }

  const rangeTimes: Record<string, Timing | null> = {};
  for (const rg of d.ranges) {
    const own = segments.filter((s) => s.range === rg.id);
    rangeTimes[rg.id] = own.length
      ? {fromFrame: own[0].fromFrame, durationInFrames: own[own.length - 1].fromFrame + own[own.length - 1].durationInFrames - own[0].fromFrame}
      : null;
  }

  const plan: RenderPlan = {
    fps: d.fps,
    width: d.width,
    height: d.height,
    durationInFrames: total,
    voice: '',
    audioFromSegments: true,
    theme: d.theme,
    segments,
    captions: [],
    overlays,
  };
  return {plan, segments, overlayTimes, rangeTimes};
};
