import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {UNI} from '../../brand/unimatx';
import {POPPINS, UniLogo, clamp} from './base';

// Pantalles de l'app tal com surten a la demo d'unimatx.cat (textos i xifres de la demo; les xifres són d'un informe d'exemple).
export type Screen =
  | 'test' | 'top3' | 'unis' | 'ofertes' | 'acceptar' | 'feina' | 'dada' | 'dashboard' | 'compartit' | 'grup';

const rise = (f: number, i: number, step = 4) => {
  const p = interpolate(f, [i * step, i * step + 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return {opacity: p, transform: `translateY(${(1 - p) * 18}px)`};
};

const Eyebrow: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', color: UNI.indigo, textTransform: 'uppercase'}}>{children}</div>
);
const H: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 30}) => (
  <div style={{fontSize: size, fontWeight: 700, lineHeight: 1.12, color: UNI.ink, letterSpacing: '-0.01em'}}>{children}</div>
);
const Tag: React.FC<{dark?: boolean; children: React.ReactNode}> = ({dark, children}) => (
  <span style={{fontSize: 14, fontWeight: 600, padding: '4px 9px', borderRadius: 6, background: dark ? UNI.ink : '#EEF0F6', color: dark ? '#fff' : UNI.ink}}>
    {children}
  </span>
);
const Demo: React.FC = () => (
  <div style={{background: UNI.banner, borderLeft: `4px solid ${UNI.bannerLine}`, padding: '8px 10px', fontSize: 14, color: UNI.ink, borderRadius: 4}}>
    Demostració · Alumnes ficticis i informes d'exemple
  </div>
);

const UNIS = [
  {u: 'UB', c: 'Barcelona', n: '9,234', p: 180, preu: '1.061 €', ok: false},
  {u: 'UAB', c: 'Bellaterra', n: '9,066', p: 120, preu: '1.061 €', ok: true},
  {u: 'URV', c: 'Tarragona', n: '8,528', p: 60, preu: '1.486 €', ok: true},
  {u: 'UdG', c: 'Girona', n: '8,202', p: 60, preu: '1.061 €', ok: true},
  {u: 'URV', c: 'Tarragona · anglès', n: '7,688', p: 30, preu: '1.486 €', ok: true},
];

const Content: React.FC<{screen: Screen; f: number}> = ({screen, f}) => {
  switch (screen) {
    case 'test':
      return (
        <>
          <div style={rise(f, 0)}><Eyebrow>01 · El teu punt de partida</Eyebrow></div>
          <div style={rise(f, 1)}><H size={33}>Què vols aclarir sobre els teus estudis?</H></div>
          <div style={{...rise(f, 2), fontSize: 18, fontWeight: 600, color: UNI.ink}}>Com prefereixes explorar?</div>
          {[
            ['Exploració guiada', 'Casos i preguntes concretes, amb opcions per triar.'],
            ['Exploració oberta', 'Explica experiències i dubtes amb les teves paraules.'],
          ].map(([t, d], i) => {
            const sel = i === 0 && f > 34;
            return (
              <div key={t} style={{...rise(f, 3 + i), border: `2px solid ${sel ? UNI.indigo : UNI.line}`, borderRadius: 14, padding: '14px 16px', background: sel ? '#F1F0FF' : '#fff'}}>
                <div style={{fontSize: 20, fontWeight: 700, color: UNI.ink}}>{t}</div>
                <div style={{fontSize: 15.5, color: UNI.inkSoft, marginTop: 4, lineHeight: 1.35}}>{d}</div>
              </div>
            );
          })}
          <div style={{...rise(f, 6), display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 13, color: UNI.inkSoft}}>
            {['Context', 'RIASEC', 'Casos', 'Grau', 'Sortides', 'Missió', 'Propostes'].map((s, i) => (
              <span key={s} style={{padding: '3px 8px', borderRadius: 99, background: i === 0 ? UNI.indigo : '#EEF0F6', color: i === 0 ? '#fff' : UNI.inkSoft}}>{s}</span>
            ))}
          </div>
        </>
      );
    case 'top3':
      return (
        <>
          <div style={rise(f, 0)}>
            <span style={{fontSize: 15, fontWeight: 700, padding: '6px 12px', borderRadius: 99, background: UNI.indigo, color: '#fff', letterSpacing: '0.08em'}}>EL TEU TOP 3</span>
          </div>
          <div style={{...rise(f, 1), fontSize: 16, color: UNI.inkSoft}}>20 o 60 min i tens el teu top 3</div>
          {[
            ['01', 'Psicologia', 'Persones i societat', 86, '#D9643E'],
            ['02', 'Enginyeria biomèdica', 'Tecnologia i salut', 78, '#2F9E6E'],
            ['03', 'Disseny', 'Creativitat i projectes', 71, '#7A4FD0'],
          ].map(([n, t, s, v, c], i) => {
            const w = interpolate(f, [12 + i * 6, 36 + i * 6], [0, Number(v)], {...clamp, easing: Easing.out(Easing.cubic)});
            return (
              <div key={String(n)} style={{...rise(f, 2 + i * 1.5), display: 'grid', gap: 6, paddingBottom: 12, borderBottom: `1px solid ${UNI.line}`}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <span style={{width: 36, height: 36, borderRadius: 9, background: String(c), color: '#fff', fontWeight: 700, fontSize: 15, display: 'grid', placeItems: 'center'}}>{n}</span>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 21, fontWeight: 700, color: UNI.ink, lineHeight: 1.1}}>{t}</div>
                    <div style={{fontSize: 14.5, color: UNI.inkSoft}}>{s}</div>
                  </div>
                  <span style={{fontSize: 20, fontWeight: 700, color: String(c)}}>{Math.round(w)}/99</span>
                </div>
                <div style={{height: 7, borderRadius: 9, background: '#EEF0F6'}}>
                  <div style={{height: 7, borderRadius: 9, width: `${w}%`, background: String(c)}} />
                </div>
              </div>
            );
          })}
          <div style={{...rise(f, 7), fontSize: 13, color: UNI.inkSoft}}>Exemple · índex d'encaix amb les teves respostes</div>
        </>
      );
    case 'unis':
    case 'ofertes': {
      const verdict = screen === 'unis';
      return (
        <>
          <div style={rise(f, 0)}><Eyebrow>Química · on es pot estudiar</Eyebrow></div>
          <div style={rise(f, 1)}><H size={27}>Quatre universitats públiques, cinc ofertes.</H></div>
          {verdict && (
            <div style={{...rise(f, 2), fontSize: 16, color: UNI.ink}}>
              Amb la teva nota: <b>9,20</b>
            </div>
          )}
          <div style={{display: 'grid', gap: 0}}>
            <div style={{display: 'grid', gridTemplateColumns: '1.3fr 0.8fr 0.6fr 0.9fr', fontSize: 12.5, color: UNI.inkSoft, padding: '4px 0', borderBottom: `1.5px solid ${UNI.ink}`}}>
              <span>Universitat</span><span>Nota tall</span><span>Places</span><span>Preu/curs</span>
            </div>
            {UNIS.map((r, i) => (
              <div key={i} style={{...rise(f, 3 + i, 3), borderBottom: `1px solid ${UNI.line}`, padding: '8px 0'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1.3fr 0.8fr 0.6fr 0.9fr', alignItems: 'baseline', fontSize: 17, color: UNI.ink}}>
                  <span><b>{r.u}</b> <span style={{fontSize: 12, color: UNI.inkSoft}}>{r.c}</span></span>
                  <span>{r.n}</span><span>{r.p}</span><span>{r.preu}</span>
                </div>
                {verdict && (
                  <div style={{fontSize: 15, fontWeight: 700, color: r.ok ? UNI.good : UNI.bad, marginTop: 2, opacity: interpolate(f, [22 + i * 4, 28 + i * 4], [0, 1], clamp)}}>
                    {r.ok ? 'Hi arribaries' : 'Et falten 0,03'}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{...rise(f, 9), display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: UNI.inkSoft}}>
            <Tag>Dada oficial</Tag> Nota de tall 2026 i places · informe d'exemple
          </div>
        </>
      );
    }
    case 'acceptar':
      return (
        <>
          <div style={rise(f, 0)}><Eyebrow>Decidir</Eyebrow></div>
          <div style={rise(f, 1)}><H size={31}>Què hauràs d'acceptar de Química.</H></div>
          <div style={{...rise(f, 2), fontSize: 16, color: UNI.inkSoft, lineHeight: 1.4}}>Cap dada diu si és per a tu. Sí que mostra el que hi trobaràs.</div>
          {[
            ['Matemàtiques i física', 'Hi ha Matemàtiques, Física i Estadística aplicada.'],
            ['Molt laboratori', 'Cada àrea té una experimentació pròpia.'],
            ['Exàmens amb pes', 'La prova parcial pesa molt a la nota.'],
            ['Poques optatives de pràctiques', 'Les pràctiques en empresa són optatives.'],
          ].map(([t, d], i) => (
            <div key={t} style={{...rise(f, 3 + i, 5), borderTop: `3px solid ${UNI.indigo}`, paddingTop: 8}}>
              <div style={{fontSize: 19, fontWeight: 700, color: UNI.ink}}>{t}</div>
              <div style={{fontSize: 14.5, color: UNI.inkSoft, lineHeight: 1.35}}>{d}</div>
            </div>
          ))}
          <div style={rise(f, 8)}><Tag dark>Lectura UniMatx</Tag></div>
        </>
      );
    case 'feina':
      return (
        <>
          <div style={rise(f, 0)}><Tag>Dada oficial · enquesta d'AQU</Tag></div>
          <div style={rise(f, 1)}><H size={27}>Quant triguen a trobar feina</H></div>
          {[
            ['Menys de 3 mesos', 83.7],
            ['Entre 3 mesos i 1 any', 16.3],
          ].map(([t, v], i) => {
            const w = interpolate(f, [10 + i * 5, 34 + i * 5], [0, Number(v)], {...clamp, easing: Easing.out(Easing.cubic)});
            return (
              <div key={String(t)} style={{...rise(f, 2 + i), display: 'grid', gap: 5}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 17, color: UNI.ink}}>
                  <span>{t}</span><b>{w.toFixed(1).replace('.', ',')} %</b>
                </div>
                <div style={{height: 14, background: '#EEF0F6', borderRadius: 3}}><div style={{height: 14, width: `${w}%`, background: '#4F74D9', borderRadius: 3}} /></div>
              </div>
            );
          })}
          <div style={{...rise(f, 4), marginTop: 6}}><H size={27}>Quin contracte tenen</H></div>
          {[
            ['Fix o indefinit', '81,4 %'],
            ['Autònom', '9,3 %'],
            ['Temporal', '7,0 %'],
            ['Becari', '2,3 %'],
          ].map(([t, v], i) => (
            <div key={t} style={{...rise(f, 5 + i, 3), display: 'flex', justifyContent: 'space-between', fontSize: 17, color: UNI.ink, borderBottom: `1px solid ${UNI.line}`, paddingBottom: 6}}>
              <span>{t}</span><b>{v}</b>
            </div>
          ))}
          <div style={{...rise(f, 10), fontSize: 12.5, color: UNI.inkSoft}}>Informe d'exemple</div>
        </>
      );
    case 'dada':
      return (
        <>
          <div style={rise(f, 0)}><H size={29}>Cada dada, amb la seva font.</H></div>
          <div style={{...rise(f, 2), display: 'grid', gap: 8, borderTop: `1px solid ${UNI.line}`, paddingTop: 12}}>
            <div><Tag>Dada oficial</Tag></div>
            <div style={{fontSize: 17, color: UNI.ink, lineHeight: 1.4}}><u>F01</u> Nota de tall i places de l'oferta. Fonts: Canal Universitats i AQU Catalunya.</div>
          </div>
          <div style={{...rise(f, 5), display: 'grid', gap: 8, borderTop: `1px solid ${UNI.line}`, paddingTop: 12}}>
            <div><Tag dark>Lectura UniMatx</Tag></div>
            <div style={{fontSize: 17, color: UNI.ink, lineHeight: 1.4}}>Marcada sempre així: és el nostre criteri, no la font.</div>
          </div>
          <div style={{...rise(f, 8), fontFamily: 'Georgia, serif', fontSize: 19, lineHeight: 1.4, color: UNI.ink}}>
            Totes publiquen nota de tall. El 2026 anava del 7,688 de la URV al 9,234 de la UB.
          </div>
        </>
      );
    case 'dashboard': {
      const n = (v: number, i: number) => Math.round(interpolate(f, [8 + i * 3, 30 + i * 3], [0, v], {...clamp, easing: Easing.out(Easing.cubic)}));
      return (
        <>
          <div style={rise(f, 0)}><Demo /></div>
          <div style={rise(f, 1)}><H size={29}>La teva classe, d'un cop d'ull</H></div>
          <div style={{...rise(f, 2), fontSize: 15, color: UNI.inkSoft, lineHeight: 1.35}}>El progrés de cada alumne i els informes que ha decidit compartir amb tu.</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
            {[
              [17, 'alumnes'],
              [2, 'sense començar'],
              [2, 'en curs'],
              [13, 'amb el test acabat'],
            ].map(([v, t], i) => (
              <div key={String(t)} style={{...rise(f, 3 + i, 3), border: `1px solid ${UNI.line}`, borderRadius: 10, padding: '10px 12px'}}>
                <div style={{fontSize: 30, fontWeight: 700, color: UNI.ink}}>{n(Number(v), i)}</div>
                <div style={{fontSize: 14, color: UNI.inkSoft}}>{t}</div>
              </div>
            ))}
          </div>
          {[
            ['Aina Prats', 'En curs · fase 3 de 6', UNI.indigo],
            ['Arnau Puig', 'Informe disponible', UNI.good],
            ['Berta Oliver', 'Sense començar', UNI.inkSoft],
          ].map(([a, b, c], i) => (
            <div key={a} style={{...rise(f, 8 + i, 3), display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${UNI.line}`, paddingBottom: 7}}>
              <span style={{fontSize: 18, fontWeight: 700, color: UNI.ink}}>{a}</span>
              <span style={{fontSize: 14.5, fontWeight: 600, color: c}}>{b}</span>
            </div>
          ))}
        </>
      );
    }
    case 'compartit':
      return (
        <>
          <div style={rise(f, 0)}><Demo /></div>
          <div style={{...rise(f, 1), border: `1px solid ${UNI.line}`, borderRadius: 14, padding: 16, display: 'grid', gap: 10}}>
            <div style={{fontSize: 23, fontWeight: 700, color: UNI.ink}}>Arnau Puig</div>
            <div style={{fontSize: 15, color: UNI.inkSoft}}>2n de batxillerat · Grup B</div>
            <div style={{fontSize: 16, fontWeight: 700, color: UNI.good}}>Informe disponible</div>
            <div style={{fontSize: 15, color: UNI.ink, lineHeight: 1.4}}>Ha decidit compartir el seu informe amb tu.</div>
            <div style={{justifySelf: 'start', fontSize: 16, fontWeight: 700, color: '#fff', background: UNI.indigo, borderRadius: 10, padding: '9px 14px'}}>Veure fitxa</div>
          </div>
          <div style={{...rise(f, 3), border: `1px dashed ${UNI.line}`, borderRadius: 14, padding: 14, fontSize: 15, color: UNI.inkSoft, lineHeight: 1.4}}>
            Berta Oliver · No ha compartit l'informe. Només en veus el progrés.
          </div>
        </>
      );
    case 'grup':
      return (
        <>
          <div style={rise(f, 0)}><Demo /></div>
          <div style={rise(f, 1)}><H size={25}>Interessos i opcions del grup</H></div>
          <div style={{...rise(f, 2), fontSize: 15, color: UNI.inkSoft}}>10 alumnes amb informe compartit</div>
          {[
            ['Enginyeries', 4],
            ['Salut', 3],
            ['Arts i disseny', 2],
            ['Ciències socials', 1],
          ].map(([t, v], i) => {
            const w = interpolate(f, [10 + i * 4, 30 + i * 4], [0, Number(v) * 25], {...clamp, easing: Easing.out(Easing.cubic)});
            return (
              <div key={String(t)} style={{...rise(f, 3 + i, 3), display: 'grid', gap: 4}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 17, color: UNI.ink}}><span>{t}</span><b>{v}</b></div>
                <div style={{height: 12, background: '#EEF0F6', borderRadius: 6}}><div style={{height: 12, width: `${w}%`, background: UNI.indigo, borderRadius: 6}} /></div>
              </div>
            );
          })}
        </>
      );
  }
};

// El mòbil entra per la dreta; `since` és el fotograma on ha canviat la pantalla (perquè el contingut torni a entrar).
export const Phone: React.FC<{screen: Screen; since: number; inP: number; style?: React.CSSProperties}> = ({screen, since, inP, style}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        width: 430,
        height: 880,
        borderRadius: 58,
        background: '#111320',
        padding: 14,
        boxShadow: '0 40px 80px rgba(20,24,60,0.35)',
        transform: `translateX(${(1 - inP) * 620}px) rotate(${(1 - inP) * 6}deg)`,
        ...style,
      }}
    >
      <div style={{width: '100%', height: '100%', borderRadius: 46, background: UNI.paper, overflow: 'hidden', position: 'relative', fontFamily: POPPINS}}>
        <div style={{position: 'absolute', top: 12, left: '50%', width: 120, height: 30, marginLeft: -60, borderRadius: 20, background: '#111320'}} />
        <div style={{padding: '56px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <UniLogo size={30} />
          <span style={{fontSize: 13, color: UNI.inkSoft}}>9:41</span>
        </div>
        <div style={{padding: '18px 24px 24px', display: 'grid', gap: 12}}>
          <Content screen={screen} f={frame - since} />
        </div>
      </div>
    </div>
  );
};
