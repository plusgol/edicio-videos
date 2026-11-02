import {loadFont} from '@remotion/fonts';
import {loadFont as loadBarlow} from '@remotion/google-fonts/BarlowCondensed';
import {loadFont as loadPoppins} from '@remotion/google-fonts/Poppins';
import {loadFont as loadWork} from '@remotion/google-fonts/WorkSans';
import archivo from './fonts/ArchivoBlack-400.woff2';
import bricolage from './fonts/BricolageGrotesque-800.woff2';
import interR from './fonts/Inter-400.woff2';
import interB from './fonts/Inter-700.woff2';
import serif from './fonts/InstrumentSerif-400.woff2';
import serifI from './fonts/InstrumentSerif-400-italic.woff2';
import mono from './fonts/JetBrainsMono-400.woff2';
import groteskM from './fonts/SpaceGrotesk-500.woff2';
import groteskB from './fonts/SpaceGrotesk-700.woff2';

// Lletres dels estils de motion graphics. Les del kit de Damiano (OFL, fonts/OFL.txt) van empaquetades: el render no
// depèn de Google Fonts; les de les marques (Poppins, Barlow Condensed, Work Sans) es carreguen de Google Fonts.
const kit: [string, string, string, 'normal' | 'italic'][] = [
  ['Archivo Black', archivo, '400', 'normal'],
  ['Bricolage Grotesque', bricolage, '800', 'normal'],
  ['Inter', interR, '400', 'normal'],
  ['Inter', interB, '700', 'normal'],
  ['Instrument Serif', serif, '400', 'normal'],
  ['Instrument Serif', serifI, '400', 'italic'],
  ['JetBrains Mono', mono, '400', 'normal'],
  ['Space Grotesk', groteskM, '500', 'normal'],
  ['Space Grotesk', groteskB, '700', 'normal'],
];
const loading: Promise<unknown>[] = kit.map(([family, url, weight, style]) => loadFont({family, url, weight, style}));
loading.push(loadPoppins('normal', {weights: ['500', '700', '800'], subsets: ['latin', 'latin-ext']}).waitUntilDone());
loading.push(loadBarlow('normal', {weights: ['700', '800'], subsets: ['latin', 'latin-ext']}).waitUntilDone());
loading.push(loadWork('normal', {weights: ['500', '600'], subsets: ['latin', 'latin-ext']}).waitUntilDone());

/** Espera que totes les lletres siguin a punt: cal abans de mesurar text (src/fabrica/layout.ts). */
export const fontsReady = () => Promise.all(loading);

export const family = (name: string) => `"${name}", system-ui, sans-serif`;
