import type {SceneSpec} from './Scenes';

// Plans de cada episodi de la sèrie, un per beat del guió (projectes/unimatx-reels/guions.json).
export type SBeat = {
  scene: SceneSpec;
  chip?: {t: string; sub?: string};
  notif?: {head: string; body: string};
  rewind?: boolean;
  hit?: boolean; // cop sec a la revelació
};

const LAIA = '#B33A4A';
const POL = '#D9A23A';
const MARC = '#3D6FD9';
const JULIA = '#2F9E6E';

const POL8 = ['', 'Química · UAB', '', '', '', '', '', '']; // n'ha omplert una; la primera casella espera

export const SERIE_SPECS: Record<string, SBeat[]> = {
  S1: [
    {scene: {s: 'bedroom', phoneGlow: true, buzz: true}, chip: {t: 'JULIOL · 09:00', sub: 'ASSIGNACIÓ'}, notif: {head: 'PREINSCRIPCIÓ', body: 'Ja pots consultar la teva assignació.'}},
    {scene: {s: 'bedroom', who: 'laia', pose: 'phone', phoneGlow: true}},
    {scene: {s: 'hand', sleeve: LAIA, phone: {k: 'list', items: ['Medicina', 'Dret', 'ADE', 'Periodisme', 'Arquitectura'], keep: 0, strike: false}}, chip: {t: 'GENER', sub: '◀◀ ENRERE'}, rewind: true},
    {scene: {s: 'hand', sleeve: LAIA, phone: {k: 'list', items: ['Medicina', 'Dret', 'ADE', 'Periodisme', 'Arquitectura'], keep: 0, strike: true}}},
    {scene: {s: 'class'}, chip: {t: 'FEBRER'}, notif: {head: 'TUTORIA', body: 'Feu el test abans de divendres.'}},
    {scene: {s: 'desk', who: 'laia'}, chip: {t: 'DIJOUS · 00:04'}},
    {scene: {s: 'hand', sleeve: LAIA, phone: {k: 'likert', item: 'Muntar components electrònics'}}},
    {scene: {s: 'hand', sleeve: LAIA, phone: {k: 'likert', item: 'Escriure un reportatge'}}},
    {scene: {s: 'hand', sleeve: LAIA, phone: {k: 'phases'}}},
    {scene: {s: 'hand', sleeve: LAIA, phone: {k: 'app', screen: 'top3'}}, hit: true},
    {scene: {s: 'bedroom', phoneGlow: true, buzz: true}, chip: {t: 'JULIOL · 09:02'}},
    {scene: {s: 'monitor', memory: true, slots: ['Enginyeria biomèdica', 'Psicologia', 'Disseny', '', '', '', '', '']}},
    {scene: {s: 'monitor', memory: true, slots: ['Enginyeria biomèdica', 'Psicologia', 'Disseny', '', '', '', '', 'Medicina'], highlight: 7}},
    {scene: {s: 'hand', sleeve: LAIA, phone: {k: 'notif', time: '09:02', head: 'PREINSCRIPCIÓ', body: 'Ja pots consultar la teva assignació.'}}},
    {scene: {s: 'face', who: 'laia'}, hit: true},
  ],
  S2: [
    {scene: {s: 'monitor', slots: POL8, cursor: 0}, chip: {t: 'DIUMENGE · 23:41', sub: 'TANCA DEMÀ'}},
    {scene: {s: 'desk', who: 'pol', screen: 'monitor'}},
    {scene: {s: 'hand', sleeve: POL, phone: {k: 'notif', time: '10:00', head: 'RESULTATS', body: 'Ja pots consultar la teva qualificació.'}}, chip: {t: '◀◀ 3 SETMANES'}, rewind: true},
    {scene: {s: 'bedroom', who: 'pol', pose: 'cheer'}},
    {scene: {s: 'hand', sleeve: POL, phone: {k: 'msg', from: 'Marta', text: 'Mira on arribes abans d’omplir res.'}}},
    {scene: {s: 'bedroom', who: 'pol', pose: 'phone', phoneGlow: true}},
    {scene: {s: 'hand', sleeve: POL, phone: {k: 'app', screen: 'ofertes'}}, chip: {t: 'DIUMENGE · 23:20'}},
    {scene: {s: 'hand', sleeve: POL, phone: {k: 'app', screen: 'unis'}}},
    {scene: {s: 'hand', sleeve: POL, phone: {k: 'app', screen: 'unis', focusRow: 0}}, hit: true},
    {scene: {s: 'monitor', slots: POL8, cursor: 0}, chip: {t: 'DIUMENGE · 23:52'}},
    {scene: {s: 'monitor', slots: POL8, cursor: 0}},
    {scene: {s: 'desk', who: 'pol', screen: 'monitor'}},
    {scene: {s: 'face', who: 'pol'}, hit: true},
  ],
  S3: [
    {scene: {s: 'lab', who: 'marc', clock: '08:02'}, chip: {t: 'OCTUBRE · 08:02', sub: 'PRIMER CURS'}},
    {scene: {s: 'lab', who: 'marc', clock: '09:00'}, chip: {t: 'OCTUBRE · 09:00'}},
    {scene: {s: 'hand', sleeve: MARC, phone: {k: 'grades'}}, chip: {t: '◀◀ UN ANY ABANS'}, rewind: true},
    {scene: {s: 'hand', sleeve: MARC, phone: {k: 'grades'}}},
    {scene: {s: 'desk', who: 'marc'}, notif: {head: 'TUTORIA', body: "Teniu l'informe al correu."}},
    {scene: {s: 'hand', sleeve: MARC, phone: {k: 'inbox'}}},
    {scene: {s: 'hand', sleeve: MARC, phone: {k: 'inbox'}}, hit: true},
    {scene: {s: 'lab', who: 'marc', pose: 'phone', clock: '11:40'}, chip: {t: 'OCTUBRE · 11:40'}},
    {scene: {s: 'hand', sleeve: MARC, phone: {k: 'app', screen: 'acceptar'}}},
    {scene: {s: 'hand', sleeve: MARC, phone: {k: 'app', screen: 'acceptar'}}},
    {scene: {s: 'lab', who: 'marc', clock: '11:41'}},
    {scene: {s: 'hand', sleeve: MARC, phone: {k: 'app', screen: 'top3'}}},
    {scene: {s: 'face', who: 'marc'}, chip: {t: 'OCTUBRE · 11:42'}, hit: true},
  ],
  S4: [
    {scene: {s: 'hand', sleeve: JULIA, phone: {k: 'names'}}, chip: {t: 'DIMECRES · 00:12'}},
    {scene: {s: 'class', who: 'julia'}, chip: {t: '◀◀ AQUELLA TARDA'}, rewind: true},
    {scene: {s: 'class', who: 'julia', bubbles: ['Medicina', 'ADE', 'Dret', 'Psicologia']}},
    {scene: {s: 'class', who: 'julia', focus: 'julia'}},
    {scene: {s: 'desk', who: 'julia'}, chip: {t: 'DIMECRES · 23:48'}},
    {scene: {s: 'hand', sleeve: JULIA, phone: {k: 'phases'}}},
    {scene: {s: 'hand', sleeve: JULIA, phone: {k: 'oberta', typed: false}}},
    {scene: {s: 'hand', sleeve: JULIA, phone: {k: 'oberta', typed: true}}},
    {scene: {s: 'hand', sleeve: JULIA, phone: {k: 'loading'}}},
    {scene: {s: 'hand', sleeve: JULIA, phone: {k: 'app', screen: 'top3', blurFirst: true}}, hit: true},
    {scene: {s: 'face', who: 'julia'}},
    {scene: {s: 'face', who: 'julia', smile: true}, chip: {t: 'DIJOUS · 00:12'}, hit: true},
  ],
};
