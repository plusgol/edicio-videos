// Format de work/render.json (l'escriu scripts/munta.py).
export type RenderSegment = {
  src: string;
  fromFrame: number;
  durationInFrames: number;
  trimBefore: number;
  scale: number;
  originX: number;
  originY: number;
  // Persona retallada (WebM amb alfa) del mateix tros, per posar textos darrere seu.
  personSrc?: string;
  // Només a l'editor: l'àudio surt de cada tros (igualat en dB) en lloc de voice.wav.
  volumeDb?: number;
  // Només a l'editor: fitxer només d'àudio de la presa. El so va a part del vídeo: si el vídeo es queda enrere carregant,
  // el reproductor el torna a situar i, si el so hi anés a dins, s'entretallaria.
  audioSrc?: string;
};

export type CaptionPage = {
  fromFrame: number;
  toFrame: number;
  words: {text: string; highlight: boolean}[];
};

// type: HookText, ToolLabel (propis) o un component de snapcn (PunchLines, TerminalSimulator, TextSwap, TextHighlight, AgentSteps).
export type Overlay = {
  id: string;
  type: string;
  fromFrame: number;
  durationInFrames: number;
  props: Record<string, unknown>;
};

export type RenderPlan = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  voice: string;
  // Editor de vista prèvia: àudio de cada segment en lloc de la veu muntada (que no sap res dels canvis).
  audioFromSegments?: boolean;
  theme: {mode?: 'light' | 'dark'; accent?: string};
  segments: RenderSegment[];
  captions: CaptionPage[];
  overlays: Overlay[];
};
