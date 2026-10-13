import {loadFont} from '@remotion/fonts';
import inter500 from '@fontsource/inter/files/inter-latin-500-normal.woff2';
import inter700 from '@fontsource/inter/files/inter-latin-700-normal.woff2';
import inter800 from '@fontsource/inter/files/inter-latin-800-normal.woff2';

// Font empaquetada amb npm: el render no depèn d'internet ni de Google Fonts.
export const fontFamily = 'Inter';

for (const [weight, url] of [
  ['500', inter500],
  ['700', inter700],
  ['800', inter800],
] as const) {
  loadFont({family: fontFamily, url, weight});
}
