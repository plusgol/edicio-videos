import {AbsoluteFill} from 'remotion';
import {AgentSteps} from '@/components/snap-cn/agent-steps';
import {PunchLines} from '@/components/snap-cn/punch-lines';
import {TerminalSimulator} from '@/components/snap-cn/terminal-simulator';
import {TextHighlight} from '@/components/snap-cn/text-highlight';
import {TextSwap} from '@/components/snap-cn/text-swap';
import {COLOR} from '../brand/estil';
import {EmojiPop} from './alex/EmojiPop';
import {FloatingWords} from './alex/FloatingWords';
import {GoldWord} from './alex/GoldWord';
import {HandWritten} from './alex/HandWritten';
import {LogoCard} from './alex/LogoCard';
import {LogoPop} from './alex/LogoPop';
import {NetworkDiagram} from './alex/NetworkDiagram';
import {ScreenWindow} from './alex/ScreenWindow';
import {SectionNumeral} from './alex/SectionNumeral';
import {SlotsRow} from './alex/SlotsRow';
import {StageStat} from './alex/StageStat';
import {HookText} from './components/HookText';
import {ToolLabel} from './components/ToolLabel';
import type {Overlay, RenderPlan} from './types';

// Estil Alex (docs/ESTIL_ALEX.md): cada component porta el seu propi fons (escenari) o va sobre el pla de càmera.
const ALEX_COMPONENTS: Record<string, React.FC<any>> = {
  GoldWord,
  FloatingWords,
  SectionNumeral,
  EmojiPop,
  StageStat,
  NetworkDiagram,
  SlotsRow,
  HandWritten,
  LogoPop,
  ScreenWindow,
  LogoCard,
};

export const isBehind = (o: Overlay) => o.type === 'GoldWord' && ((o.props.placement as string | undefined) ?? 'behind') === 'behind';

// Insercions a pantalla completa (snapcn) i rètols propis. Tots reben el mateix tema: mode i un sol accent.
const FULL_SCREEN: Record<string, React.FC<any>> = {
  PunchLines,
  TerminalSimulator,
  TextSwap,
  TextHighlight,
  AgentSteps,
};

export const OverlayView: React.FC<{overlay: Overlay; theme: RenderPlan['theme']}> = ({overlay, theme}) => {
  const {scale, ...props} = overlay.props as {scale?: number} & Record<string, unknown>;
  if (overlay.type === 'ToolLabel') {
    return <ToolLabel {...(props as React.ComponentProps<typeof ToolLabel>)} />;
  }
  const Alex = ALEX_COMPONENTS[overlay.type];
  if (Alex) {
    return <Alex {...props} />;
  }
  if (overlay.type === 'HookText') {
    return <HookText {...(props as React.ComponentProps<typeof HookText>)} />;
  }
  const Component = FULL_SCREEN[overlay.type];
  if (!Component) {
    throw new Error(`Recurs desconegut a render.json: ${overlay.type}`);
  }
  return (
    <AbsoluteFill style={{backgroundColor: theme.mode === 'light' ? COLOR.paper : COLOR.ink}}>
      <AbsoluteFill style={{transform: scale ? `scale(${scale})` : undefined}}>
        <Component
          mode={theme.mode ?? 'dark'}
          accentColor={theme.accent}
          theme={theme.accent ? {primary: theme.accent} : undefined}
          {...props}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
