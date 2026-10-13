import {staticFile} from 'remotion';

// Al render, els fitxers venen de --public-dir (staticFile). A l'editor web, de rutes relatives o URL.
export const resolveSrc = (src: string) => (/^(https?:|blob:|data:|\.{0,2}\/)/.test(src) ? src : staticFile(src));
