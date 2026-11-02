import type {Format} from '../../brand/mg';

// El que escriu scripts/fabrica/fabrica.py a remotion/fabrica.json. Tots els fotogrames de les paraules, la llista, la
// barra i el punch-in són relatius a l'inici de la pantalla.
export type FCount = {prefix: string; to: number; decimals: number; suffix: string; from?: number; group?: boolean};
export type FWord = {t: string; head: string; tail: string; accent: boolean; f: number; count?: FCount};
export type FImage = {src: string; w: number; h: number};
export type FScreen = {
  id: string;
  kind: 'text' | 'list' | 'bar' | 'image' | 'end';
  from: number;
  frames: number;
  words: FWord[];
  label?: string;
  sub?: string;
  items?: string[];
  itemWords?: Omit<FWord, 'f'>[][];
  itemAt?: number[];
  bar?: {value: number; label?: string};
  barAt?: number;
  image?: FImage;
  focus?: {x: number; y: number; zoom: number};
  reframe?: boolean;
  punchAt?: number;
};
export type FabricaData = {
  title: string;
  format: Format;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  logo: FImage | null;
  screens: FScreen[];
  audio: Record<string, string>; // estil → mescla (veu, música i efectes)
};

export type Box = {x: number; y: number; w: number; h: number};
export type LineLayout = {words: number[]; size: number};
export type ScreenLayout = {
  lines: LineLayout[];
  lineHeight: number;
  textW: number;
  item?: number;
  sub?: number;
  label?: number;
  image?: Box; // on queda la captura (coordenades del pla)
  textTop?: number; // amb captura, on comença el bloc de text
  logoH?: number;
};
export type FabricaProps = {style: string; qa: boolean; data: FabricaData | null; layout: ScreenLayout[] | null};
