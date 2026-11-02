import type {SfxName} from '../../brand/mg';
import chime from './sfx/chime.wav';
import counter from './sfx/counter.wav';
import fill from './sfx/fill.wav';
import pop from './sfx/pop.wav';
import snap from './sfx/snap.wav';
import star from './sfx/star.wav';
import success from './sfx/success.wav';
import switchSfx from './sfx/switch.wav';
import tick from './sfx/tick.wav';

// Els 9 sons del kit de Damiano Caudullo («fets amb codi, sense llicència de què preocupar-se»). La fàbrica no els fa
// sonar des d'aquí: scripts/fabrica/so.py llegeix els mateixos fitxers i els barreja amb la veu i la música.
export const SFX: Record<SfxName, string> = {chime, counter, fill, pop, snap, star, success, switch: switchSfx, tick};
