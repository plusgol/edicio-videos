import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadPoppins} from '@remotion/google-fonts/Poppins';

export const {fontFamily: DISPLAY} = loadAnton('normal', {weights: ['400'], subsets: ['latin']});
export const {fontFamily: WORDS} = loadPoppins('normal', {weights: ['500', '600'], subsets: ['latin']});
