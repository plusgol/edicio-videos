import {Composition, staticFile} from 'remotion';
import {MINIATURA, VIDEO} from '../brand/estil';
import {GALERIA_SECCIONS, Galeria} from './Galeria';
import {Miniatura, type MiniaturaProps} from './miniatura/Miniatura';
import {Video} from './Video';
import type {RenderPlan} from './types';

// El projecte es tria amb --public-dir=projectes/<nom>; el pla ve de work/render.json.
export const Root: React.FC = () => (
  <>
  <Composition id="Galeria" component={Galeria} width={1920} height={1080} fps={30} durationInFrames={GALERIA_SECCIONS * 7 + 240} />
  <Composition
    id="Video"
    component={Video}
    width={VIDEO.width}
    height={VIDEO.height}
    fps={VIDEO.fps}
    durationInFrames={1}
    defaultProps={{plan: null as RenderPlan | null}}
    calculateMetadata={async () => {
      const plan: RenderPlan = await fetch(staticFile('work/render.json')).then((r) => r.json());
      return {durationInFrames: plan.durationInFrames, fps: plan.fps, width: plan.width, height: plan.height, props: {plan}};
    }}
  />
  {/* Miniatura de YouTube: les props (foto, cara, textos) surten de projectes/<nom>/miniatures.json via scripts/miniatures.sh */}
  <Composition
    id="Miniatura"
    component={Miniatura}
    width={MINIATURA.width}
    height={MINIATURA.height}
    fps={30}
    durationInFrames={1}
    defaultProps={{variant: 'cine', person: '', background: '', photoW: 1, photoH: 1, face: {x: 0, eyesY: 0, h: 1}} as MiniaturaProps}
  />
  </>
);
