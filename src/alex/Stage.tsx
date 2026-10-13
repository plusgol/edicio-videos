import {AbsoluteFill} from 'remotion';
import {ALEX} from '../../brand/estil';

// Escenaris de les insercions: clar amb vinyeta forta (pantalles, seccions) o negre amb una mica de llum (icones, xarxes).
export const Stage: React.FC<{tone: 'light' | 'dark'; children: React.ReactNode}> = ({tone, children}) => (
  <AbsoluteFill style={{background: tone === 'light' ? ALEX.stageLight : ALEX.stageDark}}>{children}</AbsoluteFill>
);
