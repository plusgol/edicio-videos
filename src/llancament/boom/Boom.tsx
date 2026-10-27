import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BOOM, LAUNCH, WEB} from '../../../brand/unimatx';
import {clamp} from '../../unimatx/base';
import {duckVolume} from '../../vendor/launch-video-kit/audio';
import {fixed, moves, useCamera, type Cam} from '../../vendor/launch-video-kit/camera';
import {ESCENES, TORN_MSG_AT} from '../Escenes';
import {Button, Chip, Cursor, HeroBg, Logo, POP, easeIn, type CursorKey} from '../Ui';
import {BOOMS, CAPTIONS, DURATION, IMPACTS, SCENES, VO, sceneOf, voOf, wordAt, type BoomId} from './muntatge';

// Vídeo de presentació d'UniMatx, versió «BOOM» (v2): ganxo amb dolor (17 anys, 660 graus, +20%, un any perdut),
// silenci, «Fins ara.» i entrada amb cop; el producte a un pla per temps; el que t'emportes, el preu i el contrast
// «un any a la carrera equivocada o vint minuts». --public-dir=projectes/unimatx-llancament/remotion

const W = LAUNCH.width;
const H = LAUNCH.height;
const C = {fx: W / 2, fy: H / 2, s: 1};
const zoom = (fx: number, fy: number, s: number) => ({fx, fy, s});
const rel = (id: BoomId, abs: number) => abs - sceneOf(id).from;
const NOMS = ['ADE', 'Psicologia', 'Medicina', 'Disseny', 'Enginyeria', 'Dret', 'Educació', 'Infermeria', 'Arquitectura', 'Comunicació', 'Biotecnologia', 'Economia', 'Ciència de dades', 'Belles Arts', 'Física', 'Turisme', 'Publicitat', 'Química', 'Moda', 'Relacions Internacionals'];

// Una paraula o un bloc que «cau»: entra gran i desenfocat i s'assenta en BOOM.slam fotogrames.
const Slam: React.FC<{f: number; at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({f, at, children, style}) => {
  if (f < at) return null;
  const p = interpolate(f, [at, at + BOOM.slam], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return <div style={{...style, transform: `scale(${1.5 - 0.5 * p})`, filter: `blur(${(1 - p) * 10}px)`, opacity: Math.min(1, p * 2)}}>{children}</div>;
};

const Night: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', inset: 0, background: WEB.night, fontFamily: POP, color: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center'}}>{children}</div>
);

// Mur de noms de graus: el ganxo dels 660.
const Mur: React.FC<{f: number; dim?: number}> = ({f, dim = 0}) => (
  <div style={{position: 'absolute', inset: -40, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: 16, padding: 30, filter: dim ? `blur(${dim * 4}px)` : undefined, opacity: 1 - dim * 0.55}}>
    {Array.from({length: 66}, (_, i) => {
      const at = 2 + ((i * 7) % 44);
      const p = easeIn(f, at, at + 4);
      return (
        <div key={i} style={{opacity: p, transform: `scale(${0.6 + 0.4 * p})`, padding: '10px 24px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', fontSize: 30, fontWeight: 700, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap'}}>
          {NOMS[(i * 3) % NOMS.length]}
        </div>
      );
    })}
  </div>
);

const Pagina: React.FC<{kicker: string; title: string; rot: number; x: number; y: number; p: number}> = ({kicker, title, rot, x, y, p}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 340, height: 480, borderRadius: 14, background: '#fff', boxShadow: '0 30px 70px rgba(20,10,80,0.3)', transform: `rotate(${rot * p}deg) translateY(${(1 - p) * 90}px)`, opacity: Math.min(1, p * 1.5), padding: 30, boxSizing: 'border-box', color: WEB.ink}}>
    <div style={{fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', color: WEB.blue}}>{kicker.toUpperCase()}</div>
    <div style={{marginTop: 8, fontSize: 26, fontWeight: 800, lineHeight: 1.15}}>{title}</div>
    {[0.95, 0.88, 0.92, 0.7, 0.9, 0.82, 0.6, 0.86, 0.5].map((w, i) => (
      <div key={i} style={{marginTop: i === 0 ? 24 : 13, height: 10, width: `${w * 100}%`, borderRadius: 5, background: '#E9EDF4'}} />
    ))}
  </div>
);

type Shot = {Body: React.FC<{f: number}>; cam?: Cam; cursor?: CursorKey[]; remap?: (f: number) => number};

// Les pantalles del test reutilitzen els cossos de la v1 amb el temps comprimit (remap) per caure a temps.
const v1 = (id: keyof typeof ESCENES, remap: (f: number) => number, cam: Cam, overlay?: React.FC<{f: number}>): Shot => {
  const E = ESCENES[id];
  const O = overlay;
  return {
    Body: ({f}) => (
      <>
        <E.Body f={remap(f)} />
        {O && <O f={f} />}
      </>
    ),
    cam,
    cursor: E.cursor,
    remap,
  };
};
const lin = (k: number, o = 0) => (f: number) => o + f * k;
const pw = (a: number[], b: number[]) => (f: number) => interpolate(f, a, b, clamp);

const Badge20: React.FC<{f: number}> = ({f}) => {
  const at = rel('p20', wordAt('07', 0));
  const ring = easeIn(f, at, at + 40);
  return (
    <Slam f={f} at={at} style={{position: 'absolute', left: 1180, top: 300, width: 460, height: 460, borderRadius: 230, background: '#fff', boxShadow: '0 40px 90px rgba(20,24,60,0.25)', display: 'grid', placeItems: 'center', fontFamily: POP}}>
      <svg width={460} height={460} style={{position: 'absolute', inset: 0}}>
        <circle cx={230} cy={230} r={206} fill="none" stroke="#EEF1F6" strokeWidth={20} />
        <circle cx={230} cy={230} r={206} fill="none" stroke={WEB.mint} strokeWidth={20} strokeLinecap="round" strokeDasharray={2 * Math.PI * 206} strokeDashoffset={2 * Math.PI * 206 * (1 - ring)} transform="rotate(-90 230 230)" />
      </svg>
      <div style={{textAlign: 'center', color: WEB.ink}}>
        <div style={{fontSize: 200, fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em'}}>20</div>
        <div style={{fontSize: 48, fontWeight: 800, color: WEB.blue}}>MINUTS</div>
      </div>
    </Slam>
  );
};

const SHOTS: Record<BoomId, Shot> = {
  h17: {
    Body: ({f}) => (
      <Night>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 40}}>
          <Slam f={f} at={rel('h17', wordAt('01', 0))} style={{fontSize: 120, fontWeight: 800}}>Tens</Slam>
          <Slam f={f} at={rel('h17', wordAt('01', 1))} style={{fontSize: 320, fontWeight: 900, color: WEB.mint, letterSpacing: '-0.04em'}}>17</Slam>
          <Slam f={f} at={rel('h17', wordAt('01', 2))} style={{fontSize: 120, fontWeight: 800}}>anys.</Slam>
        </div>
      </Night>
    ),
  },
  h660: {
    Body: ({f}) => (
      <Night>
        <Mur f={f} />
        <div style={{position: 'relative', padding: '30px 70px', borderRadius: 36, background: 'rgba(18,10,58,0.88)', boxShadow: '0 0 120px 60px rgba(18,10,58,0.9)'}}>
          <div style={{fontSize: 240, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em'}}>{Math.round(660 * easeIn(f, 2, 40))}</div>
          <div style={{fontSize: 56, fontWeight: 700}}>graus</div>
        </div>
      </Night>
    ),
  },
  hTriar: {
    Body: ({f}) => (
      <Night>
        <Mur f={60} dim={easeIn(f, 0, 10)} />
        <div style={{position: 'relative'}}>
          <div style={{fontSize: 110, fontWeight: 800}}>I n’has de triar</div>
          <Slam f={f} at={rel('hTriar', wordAt('03', 4))} style={{fontSize: 260, fontWeight: 900, color: WEB.mint, lineHeight: 1}}>UN.</Slam>
        </div>
        <Cursor f={f} camScale={1} keys={[0, 6, 12, 18, 24, 30, 36].map((at, i) => ({at: at + 4, x: [520, 1380, 760, 1250, 640, 1460, 980][i], y: [260, 820, 760, 240, 880, 520, 300][i]}))} />
      </Night>
    ),
  },
  h20: {
    Body: ({f}) => {
      const ab = rel('h20', wordAt('04', 5));
      return (
        <Night>
          <div>
            <Slam f={f} at={rel('h20', wordAt('04', 2))} style={{fontSize: 330, fontWeight: 900, color: BOOM.danger, lineHeight: 1, letterSpacing: '-0.04em'}}>+20%</Slam>
            <div style={{marginTop: 26, fontSize: 64, fontWeight: 700, opacity: easeIn(f, ab - 4, ab + 4)}}>abandona o canvia d’estudis</div>
          </div>
          <div style={{position: 'absolute', bottom: 54, fontSize: 18, color: 'rgba(255,255,255,0.45)'}}>Font: unimatx.cat · Qui som</div>
        </Night>
      );
    },
  },
  hAny: {
    Body: ({f}) => {
      const end = sceneOf('hAny').to - sceneOf('hAny').from;
      const tense = easeIn(f, 40, end);
      const j = tense * 6;
      return (
        <Night>
          <div style={{transform: `scale(${1 + 0.15 * tense}) translate(${Math.sin(f * 2.1) * j}px, ${Math.cos(f * 1.7) * j}px)`, opacity: 1 - easeIn(f, end - 10, end)}}>
            <Slam f={f} at={rel('hAny', wordAt('05', 2))} style={{fontSize: 300, fontWeight: 900, color: BOOM.danger, lineHeight: 1, letterSpacing: '-0.04em'}}>1 ANY</Slam>
            <Slam f={f} at={rel('hAny', wordAt('05', 4))} style={{marginTop: 20, display: 'inline-block', fontSize: 110, fontWeight: 900, letterSpacing: '0.08em', border: '10px solid #fff', borderRadius: 18, padding: '0 34px', transform: 'rotate(-6deg)'}}>
              PERDUT
            </Slam>
          </div>
        </Night>
      );
    },
  },
  forat: {
    Body: ({f}) => (
      <Night>
        <div style={{fontSize: 46, fontWeight: 600, letterSpacing: '0.12em', opacity: easeIn(f, rel('forat', wordAt('06', 0)) - 2, rel('forat', wordAt('06', 0)) + 6)}}>Fins ara.</div>
      </Night>
    ),
  },
  logo: {
    Body: ({f}) => (
      <div style={{position: 'absolute', inset: 0, fontFamily: POP}}>
        <HeroBg f={f * 3} />
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
          <div style={{textAlign: 'center'}}>
            <Slam f={f} at={0} style={{display: 'inline-block', background: '#fff', borderRadius: 44, padding: '40px 64px', boxShadow: '0 40px 100px rgba(20,10,80,0.45)'}}>
              <Logo size={160} />
            </Slam>
            <div style={{marginTop: 40, fontSize: 40, fontWeight: 700, color: '#fff', opacity: easeIn(f, 14, 24)}}>Orientació universitària</div>
          </div>
        </div>
      </div>
    ),
  },
  p20: v1('context', lin(1.4), moves([{at: 0, ...C}, {at: 34, ...zoom(1100, 560, 1.12)}], BOOM.camEase), Badge20),
  pCasos: v1('pregunta', lin(1.35), moves([{at: 0, ...zoom(960, 420, 1.15)}, {at: 40, ...zoom(960, 700, 1.25)}, {at: 76, ...C}], BOOM.camEase)),
  pTorn: v1('torn', pw([0, 50, 90], [0, 40, 95]), moves([{at: 0, ...zoom(960, 520, 1.1)}, {at: 46, ...zoom(900, 820, 1.22)}], BOOM.camEase)),
  pMates: v1('limits', pw([0, 15, 45, 90], [0, 30, 60, 105]), moves([{at: 0, ...zoom(960, 560, 1.15)}, {at: 45, ...zoom(960, 330, 1.2)}], BOOM.camEase)),
  pXifres: {
    Body: ({f}) => {
      const a = rel('pXifres', wordAt('11', 0));
      const b = rel('pXifres', wordAt('12', 0));
      const c = rel('pXifres', wordAt('13', 0));
      const rush = easeIn(f, c - 6, c + 30);
      return (
        <div style={{position: 'absolute', inset: 0, fontFamily: POP, color: '#fff'}}>
          <HeroBg f={f * 4} words={false} />
          {Array.from({length: 18}, (_, i) => {
            const col = [WEB.social, WEB.cientific, WEB.artistic][i % 3];
            const x = W + 200 - ((f * (14 + (i % 5) * 4) + i * 260) % (W + 600));
            return (
              <div key={i} style={{position: 'absolute', left: x, top: 40 + (i % 6) * 170, width: 300, padding: '18px 22px', borderRadius: 18, background: 'rgba(255,255,255,0.95)', borderTop: `6px solid ${col}`, color: WEB.ink, fontSize: 24, fontWeight: 800, opacity: 0.15 + 0.4 * rush, transform: `scale(${0.7 + 0.2 * rush})`}}>
                {NOMS[(i * 5) % NOMS.length]}
              </div>
            );
          })}
          <div style={{position: 'absolute', inset: 0, background: `rgba(30,16,110,${0.55 - 0.25 * rush})`}} />
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 110}}>
            <Slam f={f} at={a} style={{textAlign: 'center'}}>
              <div style={{fontSize: 230, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em'}}>{Math.round(660 * easeIn(f, a, a + 14))}</div>
              <div style={{fontSize: 48, fontWeight: 700}}>graus</div>
            </Slam>
            <Slam f={f} at={b} style={{textAlign: 'center'}}>
              <div style={{fontSize: 230, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: WEB.mint}}>
                {Math.round(40 * easeIn(f, b, b + 14))}.000<span style={{fontSize: 140}}>+</span>
              </div>
              <div style={{fontSize: 48, fontWeight: 700}}>assignatures</div>
            </Slam>
          </div>
          <Slam f={f} at={c} style={{position: 'absolute', left: 0, right: 0, bottom: 120, textAlign: 'center', fontSize: 64, fontWeight: 800}}>
            comparats un a un
          </Slam>
        </div>
      );
    },
  },
  top3: v1('top3', lin(1), moves([{at: 0, ...zoom(960, 420, 1.15)}, {at: 34, ...C}], BOOM.camEase)),
  valor: {
    Body: ({f}) => {
      const items: [string, string][] = [
        ['15', 'Els motius de cada grau'],
        ['16', 'Les notes de tall'],
        ['17', 'Els preus'],
        ['18', 'Les sortides'],
      ];
      return (
        <div style={{position: 'absolute', inset: 0, fontFamily: POP, color: '#fff'}}>
          <HeroBg f={f * 2 + 300} words={false} />
          <div style={{position: 'absolute', left: 150, top: 200}}>
            <div style={{fontSize: 34, fontWeight: 800, letterSpacing: '0.14em', color: WEB.mint}}>AMB EL TEU TOP 3</div>
            {items.map(([id, t]) => (
              <Slam key={id} f={f} at={rel('valor', voOf(id).at)} style={{marginTop: 34, display: 'flex', alignItems: 'center', gap: 28, fontSize: 60, fontWeight: 800, transformOrigin: 'left center'}}>
                <div style={{width: 74, height: 74, borderRadius: 37, background: WEB.mint, color: WEB.mintInk, display: 'grid', placeItems: 'center', fontSize: 44, fontWeight: 900}}>✓</div>
                {t}
              </Slam>
            ))}
          </div>
          <Pagina kicker="El teu informe" title="El teu top 3" rot={-8} x={1170} y={250} p={easeIn(f, 4, 18)} />
          <Pagina kicker="Per què encaixa" title="Les assignatures que t’agraden" rot={-2} x={1310} y={230} p={easeIn(f, 30, 44)} />
          <Pagina kicker="Futur professional" title="Feina i sortides" rot={5} x={1460} y={220} p={easeIn(f, 70, 84)} />
          <div style={{position: 'absolute', left: 1200, top: 800, fontSize: 30, fontWeight: 700, opacity: easeIn(f, 90, 100)}}>Informe en web i PDF</div>
        </div>
      );
    },
  },
  preu: {
    Body: ({f}) => (
      <div style={{position: 'absolute', inset: 0, fontFamily: POP, color: '#fff', background: WEB.night, display: 'grid', placeItems: 'center', textAlign: 'center'}}>
        <div>
          <Slam f={f} at={rel('preu', wordAt('19', 0))} style={{fontSize: 64, fontWeight: 700}}>Des de</Slam>
          <Slam f={f} at={rel('preu', wordAt('19', 2))} style={{fontSize: 330, fontWeight: 900, color: WEB.mint, lineHeight: 1, letterSpacing: '-0.04em'}}>9,99 €</Slam>
          <div style={{marginTop: 24, fontSize: 32, fontWeight: 600, opacity: easeIn(f, 30, 40)}}>Pagament únic · IVA inclòs · test de 20 minuts amb top 3 i informe</div>
        </div>
      </div>
    ),
  },
  contrast: {
    Body: ({f}) => {
      const l = rel('contrast', voOf('20').at);
      const r = rel('contrast', wordAt('21', 0));
      const d = rel('contrast', voOf('22').at);
      const lp = easeIn(f, l - 4, l + 6);
      const rp = easeIn(f, r - 2, r + 6);
      return (
        <div style={{position: 'absolute', inset: 0, fontFamily: POP, background: '#000'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: W / 2, height: H, background: '#1A0E2E', display: 'grid', placeItems: 'center', textAlign: 'center', opacity: lp, transform: `translateX(${(1 - lp) * -80}px)`}}>
            <div>
              <div style={{fontSize: 210, fontWeight: 900, color: BOOM.danger, lineHeight: 1}}>1 any</div>
              <div style={{marginTop: 16, fontSize: 46, fontWeight: 700, color: '#fff'}}>a la carrera equivocada</div>
            </div>
          </div>
          <div style={{position: 'absolute', left: W / 2, top: 0, width: W / 2, height: H, background: WEB.mint, display: 'grid', placeItems: 'center', textAlign: 'center', transform: `translateX(${(1 - rp) * 120}px)`, opacity: rp}}>
            <Slam f={f} at={r} style={{color: WEB.mintInk}}>
              <div style={{fontSize: 210, fontWeight: 900, lineHeight: 1}}>20 min</div>
              <div style={{marginTop: 16, fontSize: 46, fontWeight: 700}}>amb UniMatx</div>
            </Slam>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 110, display: 'flex', justifyContent: 'center'}}>
            <Slam f={f} at={d} style={{padding: '22px 54px', borderRadius: 999, background: WEB.ink, color: '#fff', fontSize: 64, fontWeight: 800, boxShadow: '0 20px 60px rgba(0,0,0,0.4)'}}>
              Tu decideixes.
            </Slam>
          </div>
        </div>
      );
    },
  },
  final: {
    Body: ({f}) => {
      const troba = rel('final', wordAt('23', 1));
      const len = sceneOf('final').to - sceneOf('final').from;
      return (
        <div style={{position: 'absolute', inset: 0, fontFamily: POP, color: '#fff'}}>
          <HeroBg f={f + 1800} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 160, display: 'flex', justifyContent: 'center'}}>
            <Slam f={f} at={0} style={{background: '#fff', borderRadius: 34, padding: '26px 44px', boxShadow: '0 30px 80px rgba(20,10,80,0.35)'}}>
              <Logo size={100} />
            </Slam>
          </div>
          <Slam f={f} at={troba} style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontSize: 112, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05}}>
            Troba la teva <span style={{color: WEB.mint, fontStyle: 'italic'}}>carrera ideal</span>
          </Slam>
          <div style={{position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', opacity: easeIn(f, troba + 16, troba + 24)}}>
            <Button size={36}>unimatx.cat</Button>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', gap: 18, opacity: easeIn(f, troba + 30, troba + 40)}}>
            <Chip size={24}>Test de 20 o 60 min</Chip>
            <Chip size={24}>Des de 9,99 €</Chip>
            <Chip size={24}>Centres: prova gratuïta amb 10 alumnes</Chip>
          </div>
          <div style={{position: 'absolute', inset: 0, background: '#000', opacity: interpolate(f, [len - 20, len], [0, 1], clamp)}} />
        </div>
      );
    },
  },
};

// Sacsejada als cops i als impactes, flaix blanc a les entrades.
const hitsNear = (frame: number, list: number[]) => list.filter((h) => frame >= h && frame < h + BOOM.shakeFrames).map((h) => frame - h);
const shakeAt = (frame: number) => {
  let dx = 0;
  let dy = 0;
  for (const [list, amp] of [
    [BOOMS, BOOM.shake],
    [IMPACTS, BOOM.shake * 0.45],
  ] as const) {
    for (const d of hitsNear(frame, list as number[])) {
      const k = (1 - d / BOOM.shakeFrames) ** 2 * amp;
      dx += Math.sin(d * 2.7 + 1) * k;
      dy += Math.cos(d * 3.3) * k;
    }
  }
  return [dx, dy];
};

const ShotView: React.FC<{id: BoomId}> = ({id}) => {
  const f = useCurrentFrame();
  const s = SHOTS[id];
  const cam = useCamera(s.cam ?? fixed(W / 2, H / 2, 1), f, {width: W, height: H});
  const punch = interpolate(f, [0, BOOM.punchFrames], [BOOM.punch, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const g = s.remap ? s.remap(f) : f;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${punch})`}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: cam.transform, transformOrigin: '0 0'}}>
          <s.Body f={f} />
          {s.cursor && <Cursor f={g} keys={s.cursor} camScale={cam.s} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Subtítols grans, paraula a paraula (la que sona, en verd).
const Caption: React.FC<{id: string}> = ({id}) => {
  const frame = useCurrentFrame();
  const l = voOf(id);
  const t = frame / 30;
  const out = easeIn(frame, l.frames + 6, l.frames + 14);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, background: 'linear-gradient(to top, rgba(8,6,30,0.85), rgba(8,6,30,0))', opacity: 1 - out}} />
      <div style={{position: 'absolute', left: 120, right: 120, bottom: 70, textAlign: 'center', fontFamily: POP, fontSize: BOOM.caption, fontWeight: 800, lineHeight: 1.15, color: '#fff', opacity: 1 - out, textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>
        {l.words.map((w, i) => {
          const on = t >= w.start - 0.03;
          const cur = on && (i === l.words.length - 1 || t < l.words[i + 1].start - 0.03);
          const p = easeIn(frame, w.start * 30 - 2, w.start * 30 + 3);
          return (
            <span key={i} style={{display: 'inline-block', marginRight: '0.28em', opacity: on ? 1 : 0.0, transform: `translateY(${(1 - p) * 18}px) scale(${0.9 + 0.1 * p})`, color: cur ? WEB.mint : '#fff'}}>
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Fotograma (de l'escena) en què el temps comprimit arriba a `g`.
const inv = (s: Shot, g: number) => {
  for (let f = 0; f < 400; f++) if ((s.remap ? s.remap(f) : f) >= g) return f;
  return 0;
};

const SFX: {at: number; src: string; v: number}[] = (() => {
  const out: {at: number; src: string; v: number}[] = [];
  BOOMS.forEach((at) => out.push({at, src: 'boom', v: 1}));
  IMPACTS.forEach((at) => out.push({at, src: 'impact', v: 0.75}));
  for (const id of ['p20', 'pCasos', 'pTorn', 'pMates', 'pXifres', 'valor', 'preu', 'contrast'] as BoomId[]) out.push({at: sceneOf(id).from - 6, src: 'whoosh', v: 0.6});
  for (const id of ['15', '16', '17', '18']) out.push({at: voOf(id).at, src: 'tick', v: 0.55});
  for (const s of SCENES) {
    const sh = SHOTS[s.id];
    for (const k of sh.cursor ?? []) if (k.click) out.push({at: s.from + inv(sh, k.at), src: 'click', v: 0.5});
  }
  TORN_MSG_AT.forEach((g) => out.push({at: sceneOf('pTorn').from + inv(SHOTS.pTorn, g), src: 'pop', v: 0.5}));
  [10, 20, 30].forEach((g) => out.push({at: sceneOf('top3').from + inv(SHOTS.top3, g), src: 'pop', v: 0.55}));
  return out;
})();

export const Boom: React.FC = () => {
  const frame = useCurrentFrame();
  const [dx, dy] = shakeAt(frame);
  const flash = Math.max(0, ...BOOMS.map((b) => interpolate(frame - b, [0, BOOM.flash], [0.9, 0], clamp) * (frame >= b ? 1 : 0)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${dx || dy ? 1.03 : 1})`}}>
        {SCENES.map((s) => (
          <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from}>
            <ShotView id={s.id} />
          </Sequence>
        ))}
      </AbsoluteFill>
      {CAPTIONS.map((id) => (
        <Sequence key={id} from={voOf(id).at} durationInFrames={voOf(id).frames + 16}>
          <Caption id={id} />
        </Sequence>
      ))}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      {VO.map((l) => (
        <Sequence key={l.id} from={l.at} durationInFrames={l.frames + 6}>
          <Audio src={staticFile(`vo-v2/vo-${l.id}.wav`)} />
        </Sequence>
      ))}
      <Audio src={staticFile('musica-boom.wav')} volume={(f) => duckVolume(f, VO, BOOM.duck, {total: DURATION, fadeOut: 20})} />
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={70}>
          <Audio src={staticFile(`${s.src}.wav`)} volume={BOOM.sfx * s.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const BOOM_DURATION = DURATION;
