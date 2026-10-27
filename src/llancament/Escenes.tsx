import React from 'react';
import {Easing, interpolate} from 'remotion';
import {LAUNCH, WEB} from '../../brand/unimatx';
import {clamp} from '../unimatx/base';
import {moves, type Cam} from '../vendor/launch-video-kit/camera';
import {sceneOf, wordAt, type SceneId} from './muntatge';
import {AppFrame, Button, Chip, Enter, HeroBg, Kicker, Logo, Option, POP, PhaseCard, easeIn, pop, type CursorKey} from './Ui';

// Cada escena rep `f`, el fotograma dins l'escena. Les que mostren interfície tornen també la seva càmera (encuadres
// del kit amb viatges curts) i el recorregut del cursor, en fotogrames de l'escena.
export type Escena = {
  Body: React.FC<{f: number}>;
  cam?: Cam;
  cursor?: CursorKey[];
  dark?: boolean;
};

const W = LAUNCH.width;
const H = LAUNCH.height;
const C = {fx: W / 2, fy: H / 2, s: 1};
const local = (id: SceneId, abs: number) => abs - sceneOf(id).from;
const len = (id: SceneId) => sceneOf(id).to - sceneOf(id).from;

// ——— Cold open: noms de graus a tota velocitat, sense música ———
const NOMS = ['ADE', 'Psicologia', 'Medicina', 'Disseny', 'Enginyeria', 'Dret', 'Educació', 'Infermeria', 'Arquitectura', 'Comunicació', 'Biotecnologia', 'Economia', 'Ciència de dades', 'Belles Arts', 'Física', 'Turisme', 'Publicitat', 'Química', 'Moda', 'Relacions Internacionals'];
const Cold: React.FC<{f: number}> = ({f}) => {
  const vint = local('cold', wordAt('01', 2)); // «vint»
  const abandonen = local('cold', wordAt('01', 6));
  const triar = local('cold', wordAt('02', 0));
  const car = local('cold', wordAt('02', 6)); // «surt»
  const flick = f < vint;
  const nom = NOMS[Math.floor(f / LAUNCH.flicker) % NOMS.length];
  return (
    <div style={{position: 'absolute', inset: 0, background: WEB.night, fontFamily: POP, color: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center'}}>
      {flick && <div style={{fontSize: 150, fontWeight: 800, letterSpacing: '-0.03em', opacity: 0.92}}>{nom}</div>}
      {!flick && f < triar - 4 && (
        <div>
          <div style={{fontSize: 300, fontWeight: 900, lineHeight: 1, color: WEB.mint, transform: `scale(${0.9 + 0.1 * pop(f, vint, 8)})`}}>+20%</div>
          <div style={{marginTop: 30, fontSize: 58, fontWeight: 700, opacity: easeIn(f, abandonen - 6, abandonen + 4)}}>dels universitaris abandonen</div>
          <div style={{fontSize: 58, fontWeight: 700, opacity: easeIn(f, abandonen + 6, abandonen + 16)}}>o canvien d’estudis</div>
        </div>
      )}
      {f >= triar - 4 && (
        <div style={{fontSize: 96, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em'}}>
          <div>Triar només pel nom</div>
          <div>d’una carrera</div>
          <div style={{color: WEB.mint, opacity: easeIn(f, car - 6, car + 2), transform: `translateY(${(1 - easeIn(f, car - 6, car + 2)) * 20}px)`}}>surt car.</div>
        </div>
      )}
      <div style={{position: 'absolute', bottom: 60, fontSize: 18, color: 'rgba(255,255,255,0.45)', opacity: flick ? 0 : 1}}>Font: unimatx.cat · Qui som</div>
    </div>
  );
};

// ——— Marca: logo i lema ———
const Marca: React.FC<{f: number}> = ({f}) => {
  const lema = local('marca', wordAt('04', 0));
  const mirarem = local('marca', wordAt('04', 5));
  const logoUp = easeIn(f, lema - 10, lema + 4);
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: POP}}>
      <HeroBg f={f} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'grid', placeItems: 'center'}}>
        <div style={{transform: `translateY(${-logoUp * 250}px) scale(${(0.7 + 0.3 * pop(f, 0, 14)) * (1 - 0.45 * logoUp)})`, background: '#fff', borderRadius: 40, padding: '34px 54px', boxShadow: '0 30px 80px rgba(20,10,80,0.35)'}}>
          <Logo size={130} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 104, letterSpacing: '-0.025em', lineHeight: 1.12}}>
        <div style={{opacity: easeIn(f, lema - 2, lema + 8)}}>No et direm com ets.</div>
        <div style={{opacity: easeIn(f, mirarem - 2, mirarem + 8)}}>
          Mirarem <span style={{color: WEB.mint, fontStyle: 'italic'}}>què estudiaries.</span>
        </div>
      </div>
    </div>
  );
};

// ——— Context: el punt de partida del test ———
const CTX = {guiada: [580, 400], noSe: [470, 578], social: [325, 722], continua: [1450, 950]};
const Context: React.FC<{f: number}> = ({f}) => {
  const sel = (k: number) => f >= k;
  return (
    <AppFrame step={0}>
      <div style={{position: 'absolute', left: 260, top: 40, width: 1400}}>
        <Kicker>01 · El teu punt de partida</Kicker>
        <div style={{marginTop: 10, fontSize: 46, fontWeight: 800, letterSpacing: '-0.02em'}}>Què vols aclarir sobre els teus estudis?</div>
        <div style={{marginTop: 26, fontSize: 19, fontWeight: 700, color: WEB.inkSoft}}>Com prefereixes explorar?</div>
        <div style={{marginTop: 12, display: 'flex', gap: 24}}>
          {[
            ['Exploració guiada', 'Casos i preguntes concretes, amb opcions per triar i espais de reflexió.'],
            ['Exploració oberta', 'Explica experiències i dubtes amb les teves paraules.'],
          ].map(([t, d], i) => {
            const on = i === 0 && sel(16);
            return (
              <div key={t} style={{width: 640, padding: '22px 28px', borderRadius: 20, background: on ? '#EEF4FF' : '#fff', border: `2px solid ${on ? WEB.blue : WEB.line}`}}>
                <div style={{fontSize: 26, fontWeight: 800}}>{t}</div>
                <div style={{marginTop: 6, fontSize: 18, color: WEB.inkSoft}}>{d}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 26, fontSize: 19, fontWeight: 700, color: WEB.inkSoft}}>Què vols aclarir avui?</div>
        <div style={{marginTop: 12, display: 'flex', gap: 18}}>
          {[
            ['No sé quin grau triar', 'Vull descobrir opcions i provar activitats diferents.'],
            ['Tinc una idea i vull comprovar-la', 'M’atrau un àmbit, però vull entendre si m’encaixa.'],
            ['Dubto entre diverses opcions', 'Vull entendre què les diferencia en la pràctica.'],
          ].map(([t, d], i) => {
            const on = i === 0 && sel(38);
            return (
              <div key={t} style={{width: 420, padding: '18px 22px', borderRadius: 18, background: on ? '#EEF4FF' : '#fff', border: `2px solid ${on ? WEB.blue : WEB.line}`}}>
                <div style={{fontSize: 21, fontWeight: 700}}>
                  <span style={{color: on ? WEB.blue : '#B5BCC8'}}>{on ? '●' : '○'}</span> {t}
                </div>
                <div style={{marginTop: 6, fontSize: 16, color: WEB.inkSoft}}>{d}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 26, fontSize: 19, fontWeight: 700, color: WEB.inkSoft}}>
          Àmbit que vols explorar <span style={{fontSize: 14, color: WEB.blue, marginLeft: 8}}>Obligatori</span>
        </div>
        <div style={{marginTop: 12, display: 'flex', gap: 14}}>
          {['Social', 'Científic', 'Artístic', 'Tots / encara no ho sé'].map((a) => {
            const on = a === 'Social' && sel(58);
            return (
              <div key={a} style={{padding: '14px 28px', borderRadius: 999, fontSize: 21, fontWeight: 700, background: on ? WEB.blue : '#fff', color: on ? '#fff' : WEB.ink, border: `2px solid ${on ? WEB.blue : WEB.line}`}}>
                {a}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{position: 'absolute', right: 260, top: 770}}>
        <Button>Continua amb aquest context</Button>
      </div>
    </AppFrame>
  );
};

// ——— Fase 1: RIASEC, una pregunta real del test ———
const RIASEC_OPC: [string, string][] = [
  ['A', 'Recórrer el servei i comprovar qui fa cada pas'],
  ['B', 'Investigar on es poden produir retards'],
  ['C', 'Dissenyar un esquema visual dels passos del servei'],
  ['D', 'Cap d’aquestes opcions'],
];
const OPT_POS = (i: number): [number, number] => [380 + (i % 2) * 600 + 260, 150 + 470 + Math.floor(i / 2) * 116 + 46];
const Pregunta: React.FC<{f: number}> = ({f}) => {
  const tria = 74;
  return (
    <AppFrame step={1}>
      <Enter f={f} style={{position: 'absolute', left: 380, top: 46, width: 1180}}>
        <div style={{padding: '16px 22px', borderRadius: 16, background: '#EAF1FD', fontSize: 17, lineHeight: 1.5, color: WEB.inkSoft, width: 1100}}>
          <b style={{color: WEB.blue, letterSpacing: '0.08em', fontSize: 14}}>QUÈ ÉS EL RIASEC?</b>
          <br />
          És una manera d’explorar sis famílies d’interessos: pràctic, investigador, creatiu, social, emprenedor i organitzador. No mesurem capacitat ni encert.
        </div>
        <div style={{marginTop: 30, fontSize: 54, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em'}}>
          Una cooperativa obre un servei nou i necessita repartir responsabilitats. Quina feina voldries provar?
        </div>
        <div style={{marginTop: 14, fontSize: 19, color: WEB.inkSoft}}>Tria la tasca que més t’atrau, encara que no la sàpigues fer.</div>
      </Enter>
      <div style={{position: 'absolute', left: 380, top: 470, display: 'grid', gridTemplateColumns: '560px 560px', gap: '24px 40px'}}>
        {RIASEC_OPC.map(([l, t], i) => (
          <Enter key={l} f={f} at={6 + i * 3}>
            <Option letter={l} text={t} on={l === 'C' && f >= tria} hover={(l === 'A' && f >= 40 && f < 56) || (l === 'B' && f >= 56 && f < 70)} />
          </Enter>
        ))}
        <Enter f={f} at={18}>
          <Option letter="E" text="Encara no ho sé prou per triar" />
        </Enter>
      </div>
    </AppFrame>
  );
};

// ——— Radar: la primera fotografia dels interessos (exemple) ———
const RIASEC6: [string, string, number][] = [
  ['R', 'Provar i posar en pràctica', 0.92],
  ['I', 'Investigar i entendre', 0.55],
  ['A', 'Crear i expressar', 0.3],
  ['S', 'Acompanyar persones', 0.42],
  ['E', 'Impulsar i negociar', 0.66],
  ['C', 'Organitzar i revisar', 0.48],
];
const Radar: React.FC<{f: number}> = ({f}) => {
  const g = easeIn(f, 4, 30);
  const cx = 560;
  const cy = 440;
  const R = 230;
  const pt = (i: number, r: number) => [cx + Math.sin((i / 6) * Math.PI * 2) * r, cy - Math.cos((i / 6) * Math.PI * 2) * r];
  const poly = RIASEC6.map(([, , v], i) => pt(i, R * v * g).join(',')).join(' ');
  return (
    <AppFrame step={1}>
      <Enter f={f} style={{position: 'absolute', left: 260, top: 40}}>
        <div style={{fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em'}}>Això és el que has triat fins ara</div>
      </Enter>
      <Enter f={f} at={3} style={{position: 'absolute', left: 260, top: 130, width: 1400, height: 760, background: '#fff', borderRadius: 28, border: `1px solid ${WEB.line}`}}>
        <div style={{position: 'absolute', left: 50, top: 40}}>
          <Kicker>El que t’atrau fer</Kicker>
          <div style={{marginTop: 8, fontSize: 34, fontWeight: 800}}>La primera fotografia dels teus interessos</div>
        </div>
        <div style={{position: 'absolute', right: 40, top: 40}}>
          <Chip color={WEB.inkSoft} bg="#F2F4F8" size={15}>Exemple</Chip>
        </div>
        <svg width={1400} height={760} style={{position: 'absolute', left: 0, top: 0}}>
          {[0.33, 0.66, 1].map((k) => (
            <polygon key={k} points={RIASEC6.map((_, i) => pt(i, R * k).join(',')).join(' ')} fill="none" stroke="#E3E8F0" strokeWidth={2} />
          ))}
          <polygon points={poly} fill="rgba(17,110,238,0.18)" stroke={WEB.blue} strokeWidth={4} strokeLinejoin="round" />
          {RIASEC6.map(([k], i) => {
            const [x, y] = pt(i, R + 38);
            return (
              <text key={k} x={x} y={y + 9} textAnchor="middle" fontFamily={POP} fontWeight={800} fontSize={26} fill={WEB.ink}>
                {k}
              </text>
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: 860, top: 210, width: 470}}>
          {RIASEC6.map(([k, t, v], i) => (
            <div key={k} style={{marginBottom: 22}}>
              <div style={{fontSize: 19, fontWeight: 600}}>
                <b style={{color: WEB.blue}}>{k}</b> {t}
              </div>
              <div style={{marginTop: 8, height: 8, borderRadius: 4, background: '#EEF1F6'}}>
                <div style={{width: `${v * 100 * easeIn(f, 8 + i * 3, 30 + i * 3)}%`, height: 8, borderRadius: 4, background: WEB.blue}} />
              </div>
            </div>
          ))}
        </div>
      </Enter>
    </AppFrame>
  );
};

// ——— Fase 5: un torn a la feina (simulació real del test) ———
const MISSATGES = ['Missatge de l’equip', 'Confirmació de les sales', 'Consulta dels participants'];
const TASQUES = ['Acordar qui rep el públic i qui resol incidències', 'Reorganitzar les sales durant la primera hora', 'Confirmar les instruccions que rebran els participants'];
export const TORN_MSG_AT = [12, 22, 32];
export const TORN_TICK_AT = [62, 76, 90];
const Torn: React.FC<{f: number}> = ({f}) => (
  <AppFrame step={5}>
    <Enter f={f} style={{position: 'absolute', left: 260, top: 36, width: 1400}}>
      <Kicker>Simulació d’un torn de feina</Kicker>
      <div style={{marginTop: 8, fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em'}}>Impulsar iniciatives, coordinar recursos i millorar processos</div>
      <div style={{marginTop: 16, padding: '18px 24px', borderRadius: 18, background: '#fff', border: `1px solid ${WEB.line}`, fontSize: 20, lineHeight: 1.5}}>
        <b>El teu encàrrec:</b> deixar un pla de treball que l’equip pugui executar i revisar.
        <div style={{marginTop: 6, color: WEB.inkSoft}}>Formes part de l’equip que prepara l’obertura d’un servei dissabte. Hi ha dues sales, quatre persones i una previsió de trenta assistents. Divendres arriben tres missatges que canvien la preparació.</div>
      </div>
    </Enter>
    <div style={{position: 'absolute', left: 260, top: 330, display: 'flex', gap: 24}}>
      {MISSATGES.map((m, i) => {
        const p = pop(f, TORN_MSG_AT[i], 10);
        return (
          <div key={m} style={{width: 450, padding: '22px 26px', borderRadius: 20, background: '#fff', border: `2px solid ${WEB.line}`, transform: `scale(${p})`, opacity: Math.min(1, p * 2), boxShadow: '0 12px 30px rgba(20,24,60,0.08)'}}>
            <div style={{fontSize: 30}}>✉</div>
            <div style={{marginTop: 6, fontSize: 23, fontWeight: 800}}>{m}</div>
            <div style={{marginTop: 4, fontSize: 16, color: WEB.inkSoft}}>Obre aquest punt</div>
          </div>
        );
      })}
    </div>
    <Enter f={f} at={44} style={{position: 'absolute', left: 260, top: 540, width: 1400}}>
      <div style={{fontSize: 30, fontWeight: 800}}>El teu pla de treball</div>
      <div style={{marginTop: 4, fontSize: 19, color: WEB.inkSoft}}>Selecciona les tres tasques. Després ordena-les.</div>
      {TASQUES.map((t, i) => {
        const on = f >= TORN_TICK_AT[i];
        return (
          <div key={t} style={{marginTop: 14, display: 'flex', alignItems: 'center', gap: 18, padding: '18px 24px', borderRadius: 16, background: on ? '#EEF4FF' : '#fff', border: `2px solid ${on ? WEB.blue : WEB.line}`, fontSize: 22}}>
            <div style={{width: 30, height: 30, borderRadius: 8, border: `2px solid ${on ? WEB.blue : '#B5BCC8'}`, background: on ? WEB.blue : '#fff', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 800}}>{on ? i + 1 : ''}</div>
            {t}
          </div>
        );
      })}
    </Enter>
  </AppFrame>
);

// ——— Xifres: el contrast amb els graus reals ———
const Xifres: React.FC<{f: number}> = ({f}) => {
  const a = local('xifres', wordAt('07', 5)); // «sis-cents»
  const b = local('xifres', wordAt('07', 11)); // «quaranta»
  const n1 = Math.round(660 * easeIn(f, a - 4, a + 14));
  const n2 = Math.round(40 * easeIn(f, b - 4, b + 14));
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: POP, color: '#fff'}}>
      <HeroBg f={f + 400} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 120}}>
        <div style={{textAlign: 'center', opacity: easeIn(f, a - 8, a)}}>
          <div style={{fontSize: 230, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em'}}>{n1}</div>
          <div style={{fontSize: 46, fontWeight: 700}}>graus</div>
        </div>
        <div style={{width: 3, height: 300, background: 'rgba(255,255,255,0.3)', opacity: easeIn(f, b - 8, b)}} />
        <div style={{textAlign: 'center', opacity: easeIn(f, b - 8, b)}}>
          <div style={{fontSize: 230, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: WEB.mint}}>
            {n2}.000<span style={{fontSize: 140}}>+</span>
          </div>
          <div style={{fontSize: 46, fontWeight: 700}}>assignatures</div>
        </div>
      </div>
      <div style={{position: 'absolute', bottom: 90, left: 0, right: 0, textAlign: 'center', fontSize: 26, fontWeight: 600, opacity: easeIn(f, b + 10, b + 24)}}>de les universitats catalanes · plans d’estudis i dades d’AQU Catalunya</div>
    </div>
  );
};

// ——— Límits: la pregunta i, a sota, com ho té en compte el resultat. La pàgina fa scroll fins al resultat mentre la
// càmera viatja (useCamera del kit dona per fet que l'espai de disseny té la mida del llenç).
export const LIMITS_TRIA = 30;
const LIMITS_SCROLL = [36, 60];
const Limits: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 2 * H, transform: `translateY(${-H * interpolate(f, LIMITS_SCROLL, [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)})}px)`}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
      <AppFrame step={3}>
        <Enter f={f} style={{position: 'absolute', left: 380, top: 60, width: 1160}}>
          <Kicker>La realitat del grau</Kicker>
          <div style={{marginTop: 10, fontSize: 56, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.02em'}}>Quines activitats preferiries que tinguessin poc pes als estudis?</div>
          <div style={{marginTop: 12, fontSize: 19, color: WEB.inkSoft}}>Tria fins a 3 opcions.</div>
        </Enter>
        <div style={{position: 'absolute', left: 380, top: 400, display: 'grid', gridTemplateColumns: '560px 560px', gap: '24px 40px'}}>
          {[
            ['A', 'Estadística i incertesa'],
            ['B', 'Àlgebra i raonament matemàtic'],
            ['C', 'Lectura i interpretació de textos'],
            ['D', 'Cap d’aquestes opcions'],
          ].map(([l, t], i) => (
            <Enter key={l} f={f} at={4 + i * 3}>
              <Option letter={l} text={t} on={l === 'B' && f >= LIMITS_TRIA} />
            </Enter>
          ))}
        </div>
      </AppFrame>
    </div>
    <div style={{position: 'absolute', left: 0, top: H, width: W, height: H, background: WEB.page, fontFamily: POP, color: WEB.ink}}>
      <div style={{position: 'absolute', left: 260, top: 70, width: 1400}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Kicker>El teu informe · graus que poden encaixar amb tu</Kicker>
          <Chip color={WEB.inkSoft} bg="#F2F4F8" size={15}>Exemple</Chip>
        </div>
        <div style={{marginTop: 20, padding: '30px 36px', borderRadius: 24, background: '#fff', border: `1px solid ${WEB.line}`}}>
          <div style={{fontSize: 17, color: WEB.inkSoft}}>02 · URV · Barcelona · presencial</div>
          <div style={{marginTop: 6, fontSize: 38, fontWeight: 800}}>Direcció i Gestió d’Empreses en l’Àmbit Digital</div>
          <div style={{marginTop: 26, padding: '26px 30px', borderRadius: 20, background: WEB.warn, border: `2px solid ${WEB.warnLine}`}}>
            <div style={{fontSize: 26, fontWeight: 800}}>Com hi intervenen els límits que has confirmat</div>
            <div style={{marginTop: 10, fontSize: 24, lineHeight: 1.5}}>
              <b>Àlgebra i raonament matemàtic:</b> has dit que preferiries que tingués poc pes, i en aquest grau és obligatori a Matemàtiques Empresarials. Per això surt una mica més avall, però no l’hem tret: mira si et compensa.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ——— Top 3: l'exemple de la portada de la web ———
const TOP: [string, string, string, number, string][] = [
  ['01', 'Psicologia', 'Persones i societat', 86, WEB.social],
  ['02', 'Enginyeria biomèdica', 'Tecnologia i salut', 78, WEB.cientific],
  ['03', 'Disseny', 'Creativitat i projectes', 71, WEB.artistic],
];
const Top3: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'absolute', inset: 0, fontFamily: POP}}>
    <HeroBg f={f + 900} />
    <div style={{position: 'absolute', left: 560, top: 150, width: 800, padding: '40px 46px 34px', borderRadius: 34, background: '#fff', color: WEB.ink, transform: `scale(${0.9 + 0.1 * pop(f, 0, 14)})`, boxShadow: '0 40px 90px rgba(20,10,80,0.35)'}}>
      <div style={{display: 'inline-block', padding: '8px 20px', borderRadius: 999, background: WEB.blue, color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '0.1em'}}>EL TEU TOP 3</div>
      {TOP.map(([n, t, s, v, c], i) => {
        const p = easeIn(f, 10 + i * 10, 24 + i * 10);
        return (
          <div key={n} style={{marginTop: 24, display: 'flex', alignItems: 'center', gap: 22, paddingBottom: 22, borderBottom: i < 2 ? `1px solid ${WEB.line}` : 'none', opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
            <div style={{width: 54, height: 54, borderRadius: 14, background: c, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 800}}>{n}</div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 36, fontWeight: 700}}>{t}</div>
              <div style={{fontSize: 19, color: WEB.inkSoft}}>{s}</div>
            </div>
            <div style={{fontSize: 40, fontWeight: 800, color: c}}>
              {Math.round(v * p)}
              <span style={{fontSize: 26}}>/99</span>
            </div>
          </div>
        );
      })}
      <div style={{marginTop: 16, fontSize: 17, color: WEB.inkSoft}}>Exemple · índex d’encaix amb les teves respostes (el millor grau, 99)</div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', gap: 18}}>
      {['✓ Per què encaixa', '+ Punts a favor', '! Què cal revisar', '↗ Futur professional'].map((c, i) => (
        <div key={c} style={{transform: `scale(${pop(f, 50 + i * 6, 10)})`}}>
          <Chip size={24}>{c}</Chip>
        </div>
      ))}
    </div>
  </div>
);

// ——— Informe: web i PDF ———
const Pagina: React.FC<{title: string; kicker: string; rot: number; x: number; y: number; p: number}> = ({title, kicker, rot, x, y, p}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 380, height: 540, borderRadius: 14, background: '#fff', boxShadow: '0 30px 70px rgba(20,10,80,0.3)', transform: `rotate(${rot * p}deg) translateY(${(1 - p) * 80}px)`, opacity: Math.min(1, p * 1.5), padding: 34, boxSizing: 'border-box', fontFamily: POP, color: WEB.ink}}>
    <div style={{fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', color: WEB.blue}}>{kicker}</div>
    <div style={{marginTop: 8, fontSize: 28, fontWeight: 800, lineHeight: 1.15}}>{title}</div>
    {[0.95, 0.88, 0.92, 0.7, 0.9, 0.82, 0.6, 0.86, 0.9, 0.5].map((w, i) => (
      <div key={i} style={{marginTop: i === 0 ? 26 : 14, height: 10, width: `${w * 100}%`, borderRadius: 5, background: '#E9EDF4'}} />
    ))}
  </div>
);
const Informe: React.FC<{f: number}> = ({f}) => {
  const notes = local('informe', wordAt('10', 4));
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: POP, color: '#fff'}}>
      <HeroBg f={f + 1300} words={false} />
      <div style={{position: 'absolute', left: 150, top: 300, width: 700}}>
        <div style={{fontSize: 96, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, opacity: easeIn(f, 0, 10)}}>El teu informe</div>
        <div style={{marginTop: 18, fontSize: 46, fontWeight: 700, color: WEB.mint, opacity: easeIn(f, notes - 4, notes + 6)}}>notes, preus, feina i futur</div>
        <div style={{marginTop: 40, display: 'flex', gap: 14, opacity: easeIn(f, notes + 20, notes + 30)}}>
          <Chip size={21}>Resum · 20–25 p.</Chip>
          <Chip size={21}>Ampliat · fins a 50 p.</Chip>
          <Chip size={21}>Web i PDF</Chip>
        </div>
      </div>
      <Pagina kicker="El teu informe" title="El teu top 3" rot={-8} x={980} y={270} p={easeIn(f, 4, 18)} />
      <Pagina kicker="Per què encaixa" title="Les assignatures que t’agraden" rot={-2} x={1130} y={250} p={easeIn(f, 12, 26)} />
      <Pagina kicker="Futur professional" title="Feina, sous i inserció" rot={5} x={1290} y={240} p={easeIn(f, 20, 34)} />
    </div>
  );
};

// ——— Catàleg gratuït i una fitxa real ———
const BRANQUES: [string, string, string, string][] = [
  ['01', 'Social', '337 graus', WEB.social],
  ['02', 'Científic', '294 graus', WEB.cientific],
  ['03', 'Artístic', '30 graus', WEB.artistic],
  ['04', 'Tots', '660 ofertes amb currículum', WEB.blue],
];
export const CATALEG_CLICK = 40;
const Cataleg: React.FC<{f: number}> = ({f}) => {
  const fitxa = pop(f, CATALEG_CLICK + 4, 12);
  return (
    <div style={{position: 'absolute', inset: 0, background: WEB.page, fontFamily: POP, color: WEB.ink}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 96, background: '#fff', borderBottom: `1px solid ${WEB.line}`}}>
        <div style={{position: 'absolute', left: 90, top: 24}}>
          <Logo size={48} />
        </div>
        <div style={{position: 'absolute', right: 90, top: 26, display: 'flex', gap: 14, fontSize: 17, fontWeight: 600}}>
          {['Com funciona', 'Preus', 'Explora els graus', 'Qui som'].map((n) => (
            <div key={n} style={{padding: '9px 18px', borderRadius: 999, border: `1px solid ${n === 'Explora els graus' ? '#9FE8C6' : WEB.line}`, background: n === 'Explora els graus' ? '#E6FBF1' : '#fff'}}>{n}</div>
          ))}
        </div>
      </div>
      <Enter f={f} style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
        <div style={{fontSize: 20, fontWeight: 700, color: WEB.blue}}>Catàleg gratuït · consulta sense compte</div>
        <div style={{marginTop: 8, fontSize: 60, fontWeight: 800, letterSpacing: '-0.02em'}}>Per on vols explorar les fitxes?</div>
      </Enter>
      <div style={{position: 'absolute', left: 120, right: 120, top: 400, display: 'flex', gap: 24}}>
        {BRANQUES.map(([n, t, c, col], i) => (
          <Enter key={n} f={f} at={4 + i * 3} style={{flex: 1}}>
            <div style={{height: 330, borderRadius: 22, background: '#fff', border: `${t === 'Científic' && f >= CATALEG_CLICK ? 3 : 1}px solid ${t === 'Científic' && f >= CATALEG_CLICK ? col : WEB.line}`, borderTop: `6px solid ${col}`, padding: '26px 28px', boxSizing: 'border-box'}}>
              <div style={{fontSize: 15, fontWeight: 800, letterSpacing: '0.1em'}}>{n}</div>
              <div style={{marginTop: 14, width: 60, height: 60, borderRadius: 30, background: col}} />
              <div style={{marginTop: 18, fontSize: 40, fontWeight: 800}}>{t}</div>
              <div style={{marginTop: 22, display: 'inline-block', padding: '8px 16px', borderRadius: 999, border: `2px solid ${col}`, color: col, fontSize: 18, fontWeight: 800}}>{c}</div>
            </div>
          </Enter>
        ))}
      </div>
      {fitxa > 0 && (
        <div style={{position: 'absolute', inset: 0, background: `rgba(30,40,60,${0.45 * Math.min(1, fitxa)})`, display: 'grid', placeItems: 'center'}}>
          <div style={{width: 960, padding: '50px 64px', borderRadius: 30, background: '#fff', transform: `scale(${0.88 + 0.12 * fitxa})`, opacity: Math.min(1, fitxa * 1.5), boxShadow: '0 40px 90px rgba(0,0,0,0.3)'}}>
            <div style={{fontSize: 44, fontWeight: 800}}>Bioenginyeria</div>
            <div style={{marginTop: 8, fontSize: 22}}>UIC · Sant Cugat del Vallès · presencial</div>
            <div style={{marginTop: 26, display: 'flex', borderRadius: 18, background: '#F6F8FB', border: `1px solid ${WEB.line}`, padding: '22px 26px'}}>
              {[
                ['Nota de tall', '5,000'],
                ['Places', '40'],
                ['Primer curs', 'Aprox. 12.480 €'],
              ].map(([k, v]) => (
                <div key={k} style={{flex: k === 'Primer curs' ? 1.5 : 1}}>
                  <div style={{fontSize: 16, color: WEB.inkSoft}}>{k}</div>
                  <div style={{marginTop: 6, fontSize: 32, fontWeight: 800, whiteSpace: 'nowrap'}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop: 28, fontSize: 24, fontWeight: 800}}>Una mostra del que s’hi estudia</div>
            <div style={{marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 12}}>
              {['Anatomia i Fisiologia', 'Materials', 'Mecànica', 'Química/Bioquímica', 'Àlgebra'].map((a) => (
                <div key={a} style={{padding: '10px 18px', borderRadius: 999, background: '#EEF4FF', color: WEB.ink, fontSize: 20, fontWeight: 600}}>{a}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ——— Tancament ———
const Final: React.FC<{f: number}> = ({f}) => {
  const troba = local('final', wordAt('12', 1));
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: POP, color: '#fff'}}>
      <HeroBg f={f + 1800} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: '#fff', borderRadius: 34, padding: '26px 44px', transform: `scale(${0.8 + 0.2 * pop(f, 0, 14)})`, boxShadow: '0 30px 80px rgba(20,10,80,0.35)'}}>
          <Logo size={96} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontSize: 110, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, opacity: easeIn(f, troba - 4, troba + 6)}}>
        Troba la teva <span style={{color: WEB.mint, fontStyle: 'italic'}}>carrera ideal</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 590, textAlign: 'center', opacity: easeIn(f, troba + 16, troba + 26)}}>
        <Button size={34}>unimatx.cat</Button>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, display: 'flex', justifyContent: 'center', gap: 18, opacity: easeIn(f, troba + 34, troba + 44)}}>
        <Chip size={24}>Test de 20 o 60 min</Chip>
        <Chip size={24}>Des de 9,99 €</Chip>
        <Chip size={24}>Centres: prova gratuïta amb 10 alumnes</Chip>
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: interpolate(f, [len('final') - 20, len('final')], [0, 1], clamp)}} />
    </div>
  );
};

// ——— Taula d'escenes: cos, càmera i cursor ———
const zoom = (fx: number, fy: number, s: number) => ({fx, fy, s});
export const ESCENES: Record<SceneId, Escena> = {
  cold: {Body: Cold, dark: true},
  marca: {Body: Marca, dark: true},
  context: {
    Body: Context,
    cam: moves([
      {at: 0, ...C},
      {at: 30, ...zoom(820, 560, 1.32)},
      {at: 78, ...zoom(1000, 760, 1.2)},
    ]),
    cursor: [
      {at: 4, x: 900, y: 520},
      {at: 16, x: CTX.guiada[0], y: CTX.guiada[1], click: true},
      {at: 38, x: CTX.noSe[0], y: CTX.noSe[1], click: true},
      {at: 58, x: CTX.social[0], y: CTX.social[1], click: true},
      {at: 84, x: CTX.continua[0], y: CTX.continua[1], click: true},
    ],
  },
  faseRiasec: {
    Body: ({f}) => (
      <>
        <Context f={200} />
        <PhaseCard f={f} n="01" title="RIASEC" q="Quines tasques et desperten interès?" body="Valoraràs activitats de feina segons si t’agradaria fer-les. Respon per interès, no pel que ja sapis fer." chips={['Provar', 'Investigar', 'Crear', 'Acompanyar', 'Impulsar', 'Organitzar']} />
      </>
    ),
  },
  pregunta: {
    Body: Pregunta,
    cam: moves([
      {at: 0, ...C},
      {at: 30, ...zoom(980, 420, 1.18)},
      {at: 66, ...zoom(960, 700, 1.3)},
      {at: 112, ...C},
    ]),
    cursor: [
      {at: 30, x: 1300, y: 900},
      {at: 44, x: OPT_POS(0)[0], y: OPT_POS(0)[1]},
      {at: 60, x: OPT_POS(1)[0], y: OPT_POS(1)[1]},
      {at: 74, x: OPT_POS(2)[0], y: OPT_POS(2)[1], click: true},
    ],
  },
  radar: {
    Body: Radar,
    cam: moves([
      {at: 0, ...C},
      {at: 34, ...zoom(820, 590, 1.18)},
    ]),
  },
  faseTorn: {
    Body: ({f}) => (
      <>
        <Radar f={60} />
        <PhaseCard f={f} n="05" title="Un torn a la feina" q="Com organitzaries la feina en aquest cas?" body="Llegeix la situació, obre informació i ordena les tasques. És una simulació escrita." chips={['Informació', 'Pla de treball', 'Revisió']} />
      </>
    ),
  },
  torn: {
    Body: Torn,
    cam: moves([
      {at: 0, ...zoom(960, 420, 1.12)},
      {at: 40, ...zoom(960, 560, 1.12)},
      {at: 70, ...zoom(900, 820, 1.25)},
      {at: 118, ...C},
    ]),
    cursor: [
      {at: 50, x: 1300, y: 760},
      ...TORN_TICK_AT.map((at, i) => ({at, x: 300, y: 150 + 540 + 128 + i * 84, click: true})),
    ],
  },
  xifres: {Body: Xifres, dark: true},
  limits: {
    Body: Limits,
    cam: moves([
      {at: 0, ...C},
      {at: 22, ...zoom(960, 560, 1.2)},
      {at: LIMITS_SCROLL[1], ...zoom(960, 330, 1.2)},
    ]),
    cursor: [
      {at: 12, x: 1200, y: 900},
      {at: LIMITS_TRIA, x: 380 + 600 + 260, y: 150 + 400 + 46, click: true},
    ],
  },
  top3: {
    Body: Top3,
    dark: true,
    cam: moves([
      {at: 0, ...C},
      {at: 40, ...zoom(960, 330, 1.22)},
      {at: 100, ...C},
    ]),
  },
  informe: {Body: Informe, dark: true},
  cataleg: {
    Body: Cataleg,
    cam: moves([
      {at: 0, ...C},
      {at: 30, ...zoom(840, 560, 1.15)},
      {at: CATALEG_CLICK + 16, ...C},
    ]),
    cursor: [
      {at: 14, x: 1500, y: 900},
      {at: CATALEG_CLICK, x: 700, y: 640, click: true},
    ],
  },
  final: {Body: Final, dark: true},
};
