import {AbsoluteFill, Sequence} from 'remotion';
import {AgentSteps} from '@/components/snap-cn/agent-steps';
import {PromptSend} from '@/components/snap-cn/prompt-send';
import {PunchLines} from '@/components/snap-cn/punch-lines';
import {TerminalSimulator} from '@/components/snap-cn/terminal-simulator';
import {TextHighlight} from '@/components/snap-cn/text-highlight';
import {TextSwap} from '@/components/snap-cn/text-swap';
import {COLOR} from '../brand/estil';

// Banc de proves: els components de snapcn amb contingut del vídeo, per veure'ls abans de fer-los servir.
export const GALERIA_SECCIONS = 150;
const accent = COLOR.accent;

export const Galeria: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLOR.ink}}>
    <Sequence durationInFrames={GALERIA_SECCIONS}>
      <PunchLines mode="dark" accentColor={accent} script="Las 3 IAs / que uso de verdad | OpenCode" styles="slide,punch" accentBeat={2} />
    </Sequence>
    <Sequence from={GALERIA_SECCIONS} durationInFrames={GALERIA_SECCIONS}>
      <TerminalSimulator
        mode="dark"
        intro="*OpenCode* por 10 €"
        command={null}
        lines={[
          {text: 'opencode models', type: 'command'},
          {text: 'DeepSeek      ≈ 80 $ de uso pagando 10', type: 'success'},
          {text: 'Big Pickle    gratis', type: 'log'},
          {text: 'GPT-5.6 Luna', type: 'log'},
        ]}
      />
    </Sequence>
    <Sequence from={GALERIA_SECCIONS * 2} durationInFrames={GALERIA_SECCIONS}>
      <TextSwap mode="dark" fromText="Plan de 100 €" toText="Plan de 20 €" fontSize={120} />
    </Sequence>
    <Sequence from={GALERIA_SECCIONS * 3} durationInFrames={GALERIA_SECCIONS}>
      <PromptSend mode="dark" text="Edita este vídeo con Remotion" chips={['Cortes', 'Subtítulos', 'Rótulos']} />
    </Sequence>
    <Sequence from={GALERIA_SECCIONS * 4} durationInFrames={GALERIA_SECCIONS * 2}>
      <AgentSteps
        mode="dark"
        query="Conecta mis 3 IAs con n8n"
        steps={[
          {running: 'Conectando OpenCode…', done: 'OpenCode conectado', icon: 'check'},
          {running: 'Conectando ChatGPT…', done: 'ChatGPT conectado', icon: 'check'},
          {running: 'Conectando Claude…', done: 'Claude conectado', icon: 'check'},
          {running: 'Montando el flujo…', done: 'Flujo listo', icon: 'check'},
        ]}
        result="Flujo de trabajo perfecto"
      />
    </Sequence>
    <Sequence from={GALERIA_SECCIONS * 6} durationInFrames={GALERIA_SECCIONS}>
      <TextHighlight mode="dark" before="Este vídeo está editado con " highlight="Claude" preset="marker" accentColor={accent} fontSize={96} />
    </Sequence>
  </AbsoluteFill>
);
