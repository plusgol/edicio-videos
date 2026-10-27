import {Composition, staticFile} from 'remotion';
import {MINIATURA, VIDEO} from '../brand/estil';
import {GALERIA_SECCIONS, Galeria} from './Galeria';
import {Miniatura, type MiniaturaProps} from './miniatura/Miniatura';
import {Video} from './Video';
import type {RenderPlan} from './types';
import {Reel, reelMetadata, type ReelProps} from './unimatx/Reel';
import {DemoRapida, demoMetadata} from './demo/DemoRapida';
import {LAUNCH} from '../brand/unimatx';
import {LLANCAMENT_DURATION, Llancament} from './llancament/Llancament';

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
  {/* Reels d'UniMatx (A1–A4, S1–S4): --public-dir=projectes/unimatx-reels --props='{"code":"A1"}' */}
  <Composition
    id="UniReel"
    component={Reel}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={1}
    defaultProps={{code: 'A1', guio: null, timing: null} as ReelProps}
    calculateMetadata={reelMetadata}
  />
  {/* Demo de pantalla amb ritme (projectes/demo-escoles): --public-dir=projectes/demo-escoles/remotion */}
  <Composition id="DemoRapida" component={DemoRapida} width={1920} height={1080} fps={30} durationInFrames={1} defaultProps={{data: null}} calculateMetadata={demoMetadata} />
  {/* Vídeo de presentació d'UniMatx (launch-video-kit): --public-dir=projectes/unimatx-llancament/remotion */}
  <Composition id="UniLlancament" component={Llancament} width={LAUNCH.width} height={LAUNCH.height} fps={LAUNCH.fps} durationInFrames={LLANCAMENT_DURATION} />
  </>
);
