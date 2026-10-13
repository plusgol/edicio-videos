// Format de work/render.json (l'escriu scripts/munta.py).
export type RenderSegment = {
  src: string;
  fromFrame: number;
  durationInFrames: number;
  trimBefore: number;
  scale: number;
  originX: number;
  originY: number;
};

export type CaptionPage = {
  fromFrame: number;
  toFrame: number;
  words: {text: string; highlight: boolean}[];
};

export type Overlay =
  | {id: string; type: 'HookText'; fromFrame: number; durationInFrames: number; props: {text: string}}
  | {id: string; type: 'ToolLabel'; fromFrame: number; durationInFrames: number; props: {badge?: string; name: string; fn: string}};

export type RenderPlan = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  voice: string;
  segments: RenderSegment[];
  captions: CaptionPage[];
  overlays: Overlay[];
};
