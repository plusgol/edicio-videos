import type {NightVariant} from './Night';
import type {Screen} from './Phone';
import type {Landmark, WorldTheme} from './World';

// Indicacions de cada pla. El text (veu i rètols) és a projectes/unimatx-reels/guions.json; aquí, només el que es veu.

export type ABBeat = {
  scene?: 'world' | 'night' | 'logo' | 'cta';
  cam?: string; // id d'un landmark, o 'all' (vista general), o 'pair' (entre els dos primers)
  zoom?: number;
  phone?: Screen;
  crumb?: number;
  pins?: {at: string; text: string; tone?: 'light' | 'mint'}[];
};
export type ABSpec = {theme: WorldTheme; landmarks: Landmark[]; crumbs: string[]; night: NightVariant; beats: ABBeat[]};

const OVER = {cam: 'all', zoom: 0.62} as const;

export const AB_SPECS: Record<string, ABSpec> = {
  A1: {
    theme: 'day',
    crumbs: ['Test', 'Top 3', 'Notes', 'Acceptar'],
    night: 'tabs',
    landmarks: [
      {id: 'institut', kind: 'school', gx: 17, gy: 17},
      {id: 'casaA', kind: 'house', gx: 14, gy: 18, roof: '#D9643E'},
      {id: 'casaB', kind: 'house', gx: 22, gy: 18, roof: '#D9643E'},
    ],
    beats: [
      {cam: 'institut', zoom: 0.78},
      {cam: 'institut', zoom: 0.9, pins: [{at: 'casaA', text: '9,1'}, {at: 'casaB', text: '9,1'}]},
      {cam: 'casaA', zoom: 1.25, pins: [{at: 'casaA', text: 'sap què hi trobarà', tone: 'mint'}]},
      {cam: 'casaA', zoom: 1.32},
      {cam: 'casaA', zoom: 1.2, phone: 'test', crumb: 0},
      {cam: 'casaA', zoom: 1.2, phone: 'test', crumb: 0},
      {cam: 'casaA', zoom: 1.2, phone: 'top3', crumb: 1},
      {cam: 'casaA', zoom: 1.2, phone: 'unis', crumb: 2},
      {cam: 'casaA', zoom: 1.2, phone: 'acceptar', crumb: 3},
      {scene: 'night'},
      {scene: 'night'},
      {scene: 'logo'},
      {...OVER},
      {scene: 'cta', ...OVER},
    ],
  },
  A2: {
    theme: 'day',
    crumbs: ['Test', 'Progrés', 'Informes', 'Grup'],
    night: 'sheet',
    landmarks: [
      {id: 'aulaA', kind: 'school', gx: 13, gy: 17},
      {id: 'aulaB', kind: 'school', gx: 21, gy: 17},
    ],
    beats: [
      {cam: 'pair', zoom: 0.8},
      {cam: 'pair', zoom: 0.9, pins: [{at: 'aulaA', text: '17 alumnes'}, {at: 'aulaB', text: '17 alumnes'}]},
      {cam: 'aulaA', zoom: 1.15, pins: [{at: 'aulaA', text: 'ho sap', tone: 'mint'}]},
      {cam: 'aulaA', zoom: 1.22},
      {cam: 'aulaA', zoom: 1.1, phone: 'dashboard', crumb: 1},
      {cam: 'aulaA', zoom: 1.1, phone: 'test', crumb: 0},
      {cam: 'aulaA', zoom: 1.1, phone: 'dashboard', crumb: 1},
      {cam: 'aulaA', zoom: 1.1, phone: 'compartit', crumb: 2},
      {cam: 'aulaA', zoom: 1.1, phone: 'grup', crumb: 3},
      {scene: 'night'},
      {scene: 'night'},
      {scene: 'logo'},
      {cam: 'pair', zoom: 0.7},
      {scene: 'cta', cam: 'pair', zoom: 0.7},
    ],
  },
  A3: {
    theme: 'day',
    crumbs: ['Ofertes', 'Notes', 'La teva nota', 'Fonts'],
    night: 'form',
    landmarks: [
      {id: 'casaA', kind: 'house', gx: 14, gy: 18, roof: '#D9643E'},
      {id: 'casaB', kind: 'house', gx: 18, gy: 14, roof: '#D9643E'},
      {id: 'ub', kind: 'campus', gx: 13, gy: 9, roof: '#7A4FD0'},
      {id: 'uab', kind: 'campus', gx: 21, gy: 13, roof: '#2F9E6E'},
      {id: 'urv', kind: 'campus', gx: 9, gy: 21, roof: '#3D7BFF'},
      {id: 'udg', kind: 'campus', gx: 21, gy: 21, roof: '#E8875E'},
    ],
    beats: [
      {cam: 'pair', zoom: 1.0, pins: [{at: 'casaA', text: '9,20'}, {at: 'casaB', text: '9,20'}]},
      {cam: 'all', zoom: 0.46, pins: [{at: 'ub', text: 'UB'}, {at: 'uab', text: 'UAB'}, {at: 'urv', text: 'URV'}, {at: 'udg', text: 'UdG'}]},
      {cam: 'ub', zoom: 0.9, pins: [{at: 'ub', text: '−0,03'}]},
      {cam: 'casaA', zoom: 1.1, phone: 'ofertes', crumb: 0},
      {cam: 'casaA', zoom: 1.1, phone: 'ofertes', crumb: 0},
      {cam: 'casaA', zoom: 1.1, phone: 'ofertes', crumb: 1},
      {cam: 'casaA', zoom: 1.1, phone: 'unis', crumb: 2},
      {cam: 'casaA', zoom: 1.1, phone: 'dada', crumb: 3},
      {scene: 'night'},
      {scene: 'night'},
      {scene: 'logo'},
      {cam: 'all', zoom: 0.46},
      {scene: 'cta', cam: 'all', zoom: 0.46},
    ],
  },
  A4: {
    theme: 'dusk',
    crumbs: ['Top 3', 'Feina', 'Fonts', 'Acceptar'],
    night: 'dinner',
    landmarks: [
      {id: 'casaA', kind: 'home', gx: 14, gy: 18, roof: '#D9643E'},
      {id: 'casaB', kind: 'home', gx: 22, gy: 18, roof: '#D9643E'},
    ],
    beats: [
      {cam: 'pair', zoom: 0.85},
      {cam: 'pair', zoom: 0.95, pins: [{at: 'casaA', text: 'Què estudiaràs?'}, {at: 'casaB', text: 'Què estudiaràs?'}]},
      {cam: 'casaA', zoom: 1.25, pins: [{at: 'casaA', text: 'un pla', tone: 'mint'}]},
      {cam: 'casaA', zoom: 1.3},
      {cam: 'casaA', zoom: 1.2, phone: 'top3', crumb: 0},
      {cam: 'casaA', zoom: 1.2, phone: 'top3', crumb: 0},
      {cam: 'casaA', zoom: 1.2, phone: 'feina', crumb: 1},
      {cam: 'casaA', zoom: 1.2, phone: 'dada', crumb: 2},
      {cam: 'casaA', zoom: 1.2, phone: 'acceptar', crumb: 3},
      {scene: 'night'},
      {scene: 'night'},
      {scene: 'logo'},
      {cam: 'pair', zoom: 0.8},
      {scene: 'cta', cam: 'pair', zoom: 0.8},
    ],
  },
};
