import {Player, type PlayerRef} from '@remotion/player';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Video} from '../Video';
import {buildPlan, type EditorData, initialRevision, mergeRevision, type Revision, type Timing} from './plan';

// Editor de vista prèvia: el vídeo real (Remotion Player) + els gràfics i talls que es poden canviar abans del render final.
// La revisió es desa a la base de dades de l'artefacte (doc «revisio/actual») perquè Claude la llegeixi i l'apliqui.

type Claude = {use: (name: string) => Promise<unknown>};
type Db = {
  doc: (path: string) => {
    get: () => Promise<{exists: boolean; data: () => Record<string, unknown> | undefined}>;
    set: (data: Record<string, unknown>) => Promise<void>;
  };
};

// H.264 si el navegador el reprodueix (Chrome, Safari, Edge); si no, WebM VP9.
const EXT = document.createElement('video').canPlayType('video/mp4; codecs="avc1.4d401f"') ? 'mp4' : 'webm';
const MEDIA: Record<string, string> = {
  curt: `./media/curt.${EXT}`,
  llarg: `./media/llarg.${EXT}`,
  'curt:persona': './media/curt.persona.webm',
  'llarg:persona': './media/llarg.persona.webm',
};
const REV_DOC = 'revisio/actual';

const TYPE_LABEL: Record<string, string> = {
  PunchLines: 'Rètol',
  TerminalSimulator: 'Terminal',
  TextSwap: 'Canvi de text',
  TextHighlight: 'Frase clau',
  AgentSteps: 'Flux',
  ToolLabel: 'Rètol inferior',
  HookText: 'Ganxo',
  GoldWord: 'Paraula gegant',
  FloatingWords: 'Paraules',
  SectionNumeral: 'Secció',
  EmojiPop: 'Objecte 3D',
  StageStat: 'Xifra',
  NetworkDiagram: 'Xarxa',
  SlotsRow: 'Caselles',
};

const BLOCK_LABEL = (block: string) => {
  const [kind, name] = block.split(':');
  if (kind === 'eina') return name;
  if (kind === 'extra') return `extra · ${name}`;
  return kind;
};

const fmt = (frames: number, fps: number) => {
  const s = frames / fps;
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, '0').replace('.', ',')}`;
};
const secs = (ms: number) => `${(ms / 1000).toFixed(1).replace('.', ',')} s`;

type Line = {text: string; type: string};
type Step = {running: string; done: string; icon?: string; hold?: number};

const summary = (type: string, p: Record<string, unknown>) => {
  switch (type) {
    case 'PunchLines':
      return String(p.script ?? '').replaceAll(' | ', ' · ').replaceAll('|', ' · ').replaceAll(' / ', ' ').replaceAll('/', ' ');
    case 'TerminalSimulator':
      return String(p.intro ?? (p.lines as Line[] | undefined)?.[0]?.text ?? '');
    case 'TextSwap':
      return `${p.fromText} → ${p.toText}`;
    case 'TextHighlight':
      return `${p.before ?? ''}${p.highlight ?? ''}`;
    case 'AgentSteps':
      return String(p.query ?? '');
    case 'ToolLabel':
      return `${p.name} · ${p.fn}`;
    case 'GoldWord':
      return `${p.sub ? `${p.sub} ` : ''}${p.text}${p.placement === 'behind' || !p.placement ? ' (darrere)' : ''}`;
    case 'SectionNumeral':
      return `${p.numeral} · ${p.title}`;
    case 'EmojiPop':
      return String(p.label ?? 'objecte 3D');
    case 'StageStat':
      return `${p.title ? `${p.title}: ` : ''}${p.from ? `${p.from} → ` : ''}${p.value}${p.caption ? ` · ${p.caption}` : ''}`;
    case 'NetworkDiagram':
      return `${(p.center as {label: string}).label} ← ${((p.nodes as {label: string}[]) ?? []).map((n) => n.label).join(', ')}`;
    case 'SlotsRow':
      return `${p.title ?? ''} · ${((p.items as {label?: string}[]) ?? []).map((n) => n.label).join(', ')}`;
    default:
      return String(p.text ?? '');
  }
};

const Field: React.FC<{id: string; label: string; hint?: string; value: string; multiline?: boolean; onChange: (v: string) => void}> = ({
  id,
  label,
  hint,
  value,
  multiline,
  onChange,
}) => (
  <label className="field" htmlFor={id}>
    <span className="field-label">{label}</span>
    {multiline ? (
      <textarea id={id} rows={Math.max(3, value.split('\n').length)} value={value} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} />
    )}
    {hint ? <span className="field-hint">{hint}</span> : null}
  </label>
);

// Camps editables per tipus de gràfic. Només textos: la resta de propietats es conserven tal com les va decidir el pla.
const OverlayFields: React.FC<{id: string; type: string; props: Record<string, unknown>; set: (p: Record<string, unknown>) => void}> = ({
  id,
  type,
  props: p,
  set,
}) => {
  const text = (key: string, label: string, hint?: string) => (
    <Field id={`${id}-${key}`} label={label} hint={hint} value={String(p[key] ?? '')} onChange={(v) => set({...p, [key]: v})} />
  );
  switch (type) {
    case 'PunchLines':
      return text('script', 'Text', '«/» salta de línia · «|» passa a una altra targeta');
    case 'TerminalSimulator': {
      const lines = (p.lines as Line[] | undefined) ?? [];
      return (
        <>
          {text('intro', 'Títol inicial')}
          <Field
            id={`${id}-lines`}
            label="Línies del terminal"
            hint="La primera és l'ordre. Màxim ~24 caràcters per línia perquè no es talli."
            multiline
            value={lines.map((l) => l.text).join('\n')}
            onChange={(v) =>
              set({
                ...p,
                lines: v.split('\n').map((t, i) => ({...(lines[i] ?? {}), text: t, type: lines[i]?.type ?? (i === 0 ? 'command' : 'log')})),
              })
            }
          />
        </>
      );
    }
    case 'TextSwap':
      return (
        <>
          {text('fromText', 'Abans')}
          {text('toText', 'Després')}
        </>
      );
    case 'TextHighlight':
      return (
        <>
          {text('before', 'Frase')}
          {text('highlight', 'Paraula marcada')}
        </>
      );
    case 'AgentSteps': {
      const steps = (p.steps as Step[] | undefined) ?? [];
      return (
        <>
          {text('query', 'Petició')}
          <Field
            id={`${id}-steps`}
            label="Passos"
            hint="Un per línia: «mentre treballa | quan acaba»"
            multiline
            value={steps.map((s) => `${s.running} | ${s.done}`).join('\n')}
            onChange={(v) =>
              set({
                ...p,
                steps: v.split('\n').map((line, i) => {
                  const [running, done] = line.split('|').map((x) => x.trim());
                  return {...(steps[i] ?? {icon: 'check'}), running: running ?? '', done: done ?? running ?? ''};
                }),
              })
            }
          />
          {text('result', 'Resultat')}
        </>
      );
    }
    case 'ToolLabel':
      return (
        <>
          {text('name', 'Nom')}
          {text('fn', 'Funció')}
        </>
      );
    case 'GoldWord':
      return (
        <>
          {text('text', 'Paraula o xifra')}
          {text('sub', 'Frase petita a sobre (opcional)')}
        </>
      );
    case 'SectionNumeral':
      return (
        <>
          {text('numeral', 'Número romà')}
          {text('title', 'Títol')}
        </>
      );
    case 'EmojiPop':
      return text('label', 'Text sota l\'objecte (opcional)');
    case 'StageStat':
      return (
        <>
          {text('title', 'Títol')}
          {text('from', 'Abans (opcional)')}
          {text('value', 'Xifra')}
          {text('caption', 'Frase')}
        </>
      );
    case 'NetworkDiagram': {
      const center = (p.center as {label: string; icon?: string}) ?? {label: ''};
      const nodes = (p.nodes as {label: string; icon?: string}[]) ?? [];
      return (
        <>
          <Field id={`${id}-center`} label="Node central" value={center.label} onChange={(v) => set({...p, center: {...center, label: v}})} />
          <Field
            id={`${id}-nodes`}
            label="Nodes"
            hint="Un per línia"
            multiline
            value={nodes.map((n) => n.label).join('\n')}
            onChange={(v) => set({...p, nodes: v.split('\n').map((label, i) => ({...(nodes[i] ?? {}), label}))})}
          />
          {text('caption', 'Frase')}
        </>
      );
    }
    case 'SlotsRow':
      return text('title', 'Títol');
    default:
      return text('text', 'Text');
  }
};

const Nudge: React.FC<{label: string; value: string; onStep: (deltaMs: number) => void}> = ({label, value, onStep}) => (
  <div className="nudge">
    <span className="field-label">{label}</span>
    <div className="nudge-row">
      <button type="button" onClick={() => onStep(-500)} aria-label={`${label} −0,5 s`}>
        −0,5
      </button>
      <button type="button" onClick={() => onStep(-100)} aria-label={`${label} −0,1 s`}>
        −0,1
      </button>
      <output className="nudge-value">{value}</output>
      <button type="button" onClick={() => onStep(100)} aria-label={`${label} +0,1 s`}>
        +0,1
      </button>
      <button type="button" onClick={() => onStep(500)} aria-label={`${label} +0,5 s`}>
        +0,5
      </button>
    </div>
  </div>
);

const Toggle: React.FC<{id: string; on: boolean; onLabel: string; offLabel: string; onChange: (on: boolean) => void}> = ({
  id,
  on,
  onLabel,
  offLabel,
  onChange,
}) => (
  <button id={id} type="button" role="switch" aria-checked={on} className={`toggle ${on ? 'is-on' : ''}`} onClick={() => onChange(!on)}>
    <span className="toggle-dot" />
    <span>{on ? onLabel : offLabel}</span>
  </button>
);

const Timeline: React.FC<{
  data: EditorData;
  total: number;
  frame: number;
  segments: {range: string; fromFrame: number; durationInFrames: number}[];
  overlayTimes: Record<string, Timing | null>;
  rev: Revision;
  selected: string | null;
  onSeek: (f: number) => void;
  onSelect: (id: string) => void;
}> = ({data, total, frame, segments, overlayTimes, rev, selected, onSeek, onSelect}) => {
  const ref = useRef<HTMLDivElement>(null);
  const blockOf = Object.fromEntries(data.ranges.map((r) => [r.id, r.block.split(':')[0]]));
  const pct = (f: number) => `${(f / total) * 100}%`;
  return (
    <div
      className="timeline"
      ref={ref}
      onClick={(e) => {
        const box = ref.current?.getBoundingClientRect();
        if (box) onSeek(Math.round(((e.clientX - box.left) / box.width) * total));
      }}
    >
      <div className="tl-row tl-overlays">
        {data.overlays.map((o) => {
          const t = overlayTimes[o.id];
          if (!t) return null;
          return (
            <button
              key={o.id}
              type="button"
              title={`${TYPE_LABEL[o.type] ?? o.type}: ${summary(o.type, rev.overlays[o.id].props)}`}
              className={`tl-ov ${rev.overlays[o.id].enabled ? '' : 'is-off'} ${selected === o.id ? 'is-selected' : ''}`}
              style={{left: pct(t.fromFrame), width: pct(t.durationInFrames)}}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(o.id);
                onSeek(t.fromFrame);
              }}
            />
          );
        })}
      </div>
      <div className="tl-row tl-segments">
        {segments.map((s, i) => (
          <div
            key={i}
            className={`tl-seg tl-${blockOf[s.range]} ${selected === s.range ? 'is-selected' : ''}`}
            style={{left: pct(s.fromFrame), width: pct(s.durationInFrames)}}
          />
        ))}
      </div>
      <div className="tl-head" style={{left: pct(frame)}} />
      <div className="tl-ticks">
        {Array.from({length: Math.floor(total / data.fps / 10) + 1}, (_, i) => (
          <span key={i} style={{left: pct(i * 10 * data.fps)}}>
            {fmt(i * 10 * data.fps, data.fps).replace(',0', '')}
          </span>
        ))}
      </div>
    </div>
  );
};

const App: React.FC<{data: EditorData}> = ({data}) => {
  const [rev, setRev] = useState<Revision>(() => initialRevision(data));
  const [tab, setTab] = useState<'grafics' | 'talls' | 'notes'>('grafics');
  const [selected, setSelected] = useState<string | null>(null);
  const [frame, setFrame] = useState(0);
  const [db, setDb] = useState<Db | null | undefined>(undefined);
  const [saved, setSaved] = useState<{status: string; savedAt: string} | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const player = useRef<PlayerRef>(null);

  const {plan, segments, overlayTimes, rangeTimes} = useMemo(() => buildPlan(data, rev, MEDIA), [data, rev]);

  // Base de dades de l'artefacte: si no hi és (vista sense permís), l'editor funciona igual però no desa.
  useEffect(() => {
    const claude = (window as unknown as {claude?: Claude}).claude;
    if (!claude) {
      setDb(null);
      return;
    }
    claude.use('db').then(async (d) => {
      const store = d as Db | null;
      setDb(store);
      if (!store) return;
      try {
        const snap = await store.doc(REV_DOC).get();
        if (snap.exists) {
          const body = snap.data() ?? {};
          setRev((r) => mergeRevision(r, body.revision as Partial<Revision>));
          setSaved({status: String(body.status ?? 'draft'), savedAt: String(body.savedAt ?? '')});
        }
      } catch {
        setMessage('No s\'ha pogut llegir la revisió desada.');
      }
    });
  }, []);

  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const onFrame = (e: {detail: {frame: number}}) => setFrame(e.detail.frame);
    p.addEventListener('frameupdate', onFrame);
    return () => p.removeEventListener('frameupdate', onFrame);
  }, []);

  const seek = useCallback((f: number) => {
    player.current?.seekTo(Math.max(0, Math.min(f, plan.durationInFrames - 1)));
  }, [plan.durationInFrames]);

  const change = (fn: (r: Revision) => Revision) => {
    setRev(fn);
    setDirty(true);
  };
  const setOverlay = (id: string, patch: Partial<Revision['overlays'][string]>) =>
    change((r) => ({...r, overlays: {...r.overlays, [id]: {...r.overlays[id], ...patch}}}));
  const setRange = (id: string, patch: Partial<Revision['ranges'][string]>) =>
    change((r) => ({...r, ranges: {...r.ranges, [id]: {...r.ranges[id], ...patch}}}));

  const save = async (status: 'draft' | 'approved') => {
    if (!db) return;
    setBusy(true);
    setMessage('');
    const savedAt = new Date().toISOString();
    try {
      await db.doc(REV_DOC).set({revision: rev, status, savedAt, durationFrames: plan.durationInFrames});
      setSaved({status, savedAt});
      setDirty(false);
      setMessage(status === 'approved' ? 'Aprovat. Digues a Claude que faci el render final.' : 'Canvis desats.');
    } catch (e) {
      const code = (e as {code?: string}).code;
      setMessage(code === 'not_granted' ? 'Aquesta vista no pot desar canvis.' : 'No s\'ha pogut desar. Torna-ho a provar.');
    } finally {
      setBusy(false);
    }
  };

  const copyJson = async () => {
    const text = JSON.stringify({revision: rev}, null, 1);
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Revisió copiada. Enganxa-la al xat amb Claude.');
    } catch {
      setMessage('No s\'ha pogut copiar automàticament.');
    }
  };

  const changedOverlays = data.overlays.filter((o) => {
    const r = rev.overlays[o.id];
    return !r.enabled || r.offsetMs !== o.offsetMs || r.durationMs !== o.durationMs || JSON.stringify(r.props) !== JSON.stringify(o.props) || r.comment;
  }).length;
  const cutRanges = data.ranges.filter((r) => !rev.ranges[r.id].keep).length;

  const statusText =
    saved === null
      ? db === null
        ? 'Només vista prèvia'
        : 'Sense desar'
      : saved.status === 'approved' && !dirty
        ? 'Aprovat per al render'
        : dirty
          ? 'Canvis sense desar'
          : 'Esborrany desat';

  return (
    <div className="app">
      <header className="bar">
        <div className="bar-title">
          <span className="eyebrow">Editor de vista prèvia</span>
          <h1>{data.title}</h1>
        </div>
        <div className="bar-actions">
          <span className={`chip ${saved?.status === 'approved' && !dirty ? 'chip-ok' : dirty ? 'chip-warn' : ''}`}>{statusText}</span>
          {db ? (
            <>
              <button type="button" className="btn" disabled={busy || !dirty} onClick={() => save('draft')}>
                Desar
              </button>
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => save('approved')}>
                Aprovar per al render final
              </button>
            </>
          ) : (
            <button type="button" className="btn" onClick={copyJson}>
              Copiar la revisió
            </button>
          )}
        </div>
      </header>
      {message ? (
        <p className="message" role="status">
          {message}
        </p>
      ) : null}

      <main className="layout">
        <section className="stage" aria-label="Vista prèvia">
          <div className="player-wrap">
            <Player
              ref={player}
              component={Video}
              inputProps={{plan}}
              durationInFrames={plan.durationInFrames}
              compositionWidth={plan.width}
              compositionHeight={plan.height}
              fps={plan.fps}
              controls
              clickToPlay
              doubleClickToFullscreen
              style={{width: '100%', aspectRatio: '16 / 9'}}
            />
          </div>
          <div className="stage-meta">
            <span className="tc">
              {fmt(frame, plan.fps)} / {fmt(plan.durationInFrames, plan.fps)}
            </span>
            <span>
              {changedOverlays} gràfics retocats · {cutRanges} talls nous
            </span>
          </div>
          <Timeline
            data={data}
            total={plan.durationInFrames}
            frame={frame}
            segments={segments}
            overlayTimes={overlayTimes}
            rev={rev}
            selected={selected}
            onSeek={seek}
            onSelect={(id) => {
              setSelected(id);
              setTab('grafics');
            }}
          />
          <p className="legend">
            <span className="lg lg-ov" /> gràfics <span className="lg lg-eina" /> eines <span className="lg lg-extra" /> extres{' '}
            <span className="lg lg-ganxo" /> inici i tancament
          </p>
        </section>

        <aside className="panel" aria-label="Revisió">
          <div className="tabs" role="tablist">
            {(
              [
                ['grafics', `Gràfics (${data.overlays.length})`],
                ['talls', `Talls (${data.ranges.length})`],
                ['notes', 'Notes'],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'is-active' : ''}`} onClick={() => setTab(k)}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'grafics' ? (
            <ol className="list">
              {data.overlays.map((o) => {
                const r = rev.overlays[o.id];
                const t = overlayTimes[o.id];
                const open = selected === o.id;
                return (
                  <li key={o.id} className={`card ${open ? 'is-open' : ''} ${r.enabled ? '' : 'is-off'}`}>
                    <div className="card-head">
                      <button type="button" className="card-main" onClick={() => {
                        setSelected(open ? null : o.id);
                        // Uns fotogrames endins: a l'inici exacte el gràfic encara està desenfocat i transparent.
                        if (t) seek(t.fromFrame + Math.min(12, Math.floor(t.durationInFrames / 3)));
                      }}>
                        <span className="tc">{t ? fmt(t.fromFrame, plan.fps) : '—'}</span>
                        <span className="type">{TYPE_LABEL[o.type] ?? o.type}</span>
                        <span className="sum">{summary(o.type, r.props)}</span>
                      </button>
                      <Toggle id={`on-${o.id}`} on={r.enabled} onLabel="Visible" offLabel="Amagat" onChange={(on) => setOverlay(o.id, {enabled: on})} />
                    </div>
                    {open ? (
                      <div className="card-body">
                        <OverlayFields id={o.id} type={o.type} props={r.props} set={(props) => setOverlay(o.id, {props})} />
                        <div className="nudges">
                          <Nudge label="Inici" value={`${r.offsetMs >= 0 ? '+' : ''}${secs(r.offsetMs)}`} onStep={(d) => setOverlay(o.id, {offsetMs: r.offsetMs + d})} />
                          <Nudge label="Durada" value={secs(r.durationMs)} onStep={(d) => setOverlay(o.id, {durationMs: Math.max(500, r.durationMs + d)})} />
                        </div>
                        <p className="reason">
                          <span className="field-label">Per què hi és</span> {o.reason}
                        </p>
                        <Field id={`c-${o.id}`} label="Comentari per a Claude" multiline value={r.comment} onChange={(v) => setOverlay(o.id, {comment: v})} />
                        <button type="button" className="btn btn-ghost" onClick={() => t && seek(t.fromFrame)}>
                          Tornar a veure'l
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          ) : null}

          {tab === 'talls' ? (
            <ol className="list">
              {data.ranges.map((rg) => {
                const r = rev.ranges[rg.id];
                const t = rangeTimes[rg.id];
                const open = selected === rg.id;
                return (
                  <li key={rg.id} className={`card ${open ? 'is-open' : ''} ${r.keep ? '' : 'is-off'}`}>
                    <div className="card-head">
                      <button type="button" className="card-main" onClick={() => {
                        setSelected(open ? null : rg.id);
                        if (t) seek(t.fromFrame);
                      }}>
                        <span className="tc">{t ? fmt(t.fromFrame, plan.fps) : 'tallat'}</span>
                        <span className="type">{BLOCK_LABEL(rg.block)}</span>
                        <span className="sum quote">«{rg.captions}»</span>
                      </button>
                      <Toggle id={`keep-${rg.id}`} on={r.keep} onLabel="Es queda" offLabel="Fora" onChange={(on) => setRange(rg.id, {keep: on})} />
                    </div>
                    {open ? (
                      <div className="card-body">
                        <p className="reason">
                          <span className="field-label">Per què hi és</span> {rg.reason}
                        </p>
                        <Field id={`rc-${rg.id}`} label="Comentari per a Claude" multiline value={r.comment} onChange={(v) => setRange(rg.id, {comment: v})} />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          ) : null}

          {tab === 'notes' ? (
            <div className="notes">
              <Field
                id="note"
                label="Comentaris generals per a Claude"
                hint="Estil, ritme, coses que falten o sobren. Es desen amb la revisió."
                multiline
                value={rev.note}
                onChange={(v) => change((r) => ({...r, note: v}))}
              />
              <p className="help">
                L'àudio d'aquesta vista surt directament de cada presa, perquè puguis provar talls al moment. El render final porta la veu
                netejada i igualada.
              </p>
            </div>
          ) : null}
        </aside>
      </main>
    </div>
  );
};

fetch('./editor.json')
  .then((r) => r.json())
  .then((data: EditorData) => {
    createRoot(document.getElementById('root')!).render(<App data={data} />);
  })
  .catch(() => {
    document.getElementById('root')!.textContent = 'No s\'han pogut carregar les dades del vídeo.';
  });
