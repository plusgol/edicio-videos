#!/usr/bin/env python3
"""build_bot.py — bot-trading's graphics, emitted from ONE storyboard (graphics-build: "one comp per scene, generated
by a job-local script"). Writes graphics-plan.json (the plan contract), every comp under gfx/compositions/, the
text-animation text.json, the titles titles.json, and the captures under assets/captures/.

  python3 build_bot.py            # everything
Times are TIMELINE seconds, computed from transcript/cuts.json + the canonical transcript, never typed by hand: a camera
beat is anchored on its spoken word, a voice-over beat (the VO is not recorded yet: a silent placeholder) on its offset
inside the VO block, a recording from the creator's v7 storyboard (edicio-videos edl.json) on its raw source time.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import lib_bot as L  # noqa: E402
import tpl_bot as T  # noqa: E402

V7 = {o["id"]: o for o in json.load(open(L.SRC / "edl.json"))["overlays"]}
CLIP = {"c5866": "cam-prompt.mov", "c5867": "cam-truco.mov", "c5883": "cam-24h.mov", "c5885": "cam-calle.mov",
        "vo": "vo-provisional.mov"}
CAM = {"cam-prompt.mov", "cam-truco.mov", "cam-24h.mov", "cam-calle.mov"}


def src_any(clip, t):
    """Raw time of a clip -> timeline (the kept part that plays it; else the next kept part of that clip)."""
    xs = [s for s in L.SEGS if s["clip"] == clip]
    for s in xs:
        if s["start"] - 1e-3 <= t <= s["end"] + 1e-3:
            return s["t0"] + (t - s["start"])
    later = [s for s in xs if s["start"] > t]
    s = min(later, key=lambda s: s["start"]) if later else max(xs, key=lambda s: s["end"])
    return s["t0"] if later else s["t1"]


def barrier_after(t):
    """The next timeline time where the picture stops being camera (a VO block, a title gap) after t."""
    nxt = [s["t0"] for s in L.SEGS if s["t0"] > t + 1e-3 and s["clip"] not in CAM]
    return min(nxt) if nxt else L.DURATION


def vo(rid, off):
    """Timeline time `off` seconds into the VO block rid (offsets are the guion's own beats)."""
    a, _ = L.span(rid)
    return a + off


cells = []          # graphics-plan cells, timeline order
DEFER = {}          # comp builders held until the cell edges are final: id -> (fn, args, kwargs)


def _deferred(fn):
    def hold(cid, dur, *a, **k):
        DEFER[cid] = (fn, a, k)
    return hold


for _n in ("rec", "page_broll", "textlight", "scene_flow", "scene_stat", "scene_hero", "scene_words", "scene_chart", "scene_bars"):
    setattr(T, _n, _deferred(getattr(T, _n)))
texts = {}          # text-animation/text.json
titles = {}         # titles/titles.json
pips = []           # corner-cam spans: (id, start, end)


def add(cell):
    cell["start"], cell["end"] = L.snap(cell["start"]), L.snap(cell["end"])
    cells.append(cell)
    return cell


def v7rec(oid, *, start=None, end=None, pip=None, url="", marks=None, tag=None, dark_page=True, line="", reason="",
          clip=None, zooms=None, lead=0.0, dur=None):
    """A recording cell from the v7 storyboard overlay `oid`: same capture, same framing, the kit's look.
    clip: fields over the overlay's capture (fromMs, speed); zooms: the zoom poses instead of the overlay's;
    lead: start that many seconds earlier on the timeline AND in the source; dur: the cell length instead of the overlay's."""
    o = V7[oid]
    p, c = o["props"], dict(o["props"]["clip"], **(clip or {}))
    clip = CLIP[o["source"]]
    t0 = start if start is not None else src_any(clip, o["anchorMs"] / 1000)
    if lead:
        t0 -= lead
        c["fromMs"] = c["fromMs"] - lead * 1000 * c.get("speed", 1.0)
    t1 = end if end is not None else min(t0 + (dur if dur is not None else o["durationMs"] / 1000),
                                         barrier_after(t0) if clip in CAM else 1e9)
    dur = L.snap(t1) - L.snap(t0)
    cid = oid.replace("w-", "r-")
    src, aspect = L.capture(cid, c["screen"], c["fromMs"] / 1000, dur, crop=c.get("crop", "app"), speed=c.get("speed", 1.0),
                            still=bool(c.get("still")))
    zs = zooms if zooms is not None else [{"at": z["atMs"] / 1000, "zoom": z["zoom"], "x": z.get("x", .5), "y": z.get("y", .5)}
                                          for z in p.get("zooms", [])]
    ms = marks if marks is not None else [{"at": n["atMs"] / 1000, "box": n["box"], "label": n.get("label"),
                                           **({"to": n["toMs"] / 1000} if n.get("toMs") else {}),
                                           **({"place": n["place"]} if n.get("place") else {})} for n in p.get("notes", [])]
    has_pip = (clip in CAM) if pip is None else pip
    T.rec(cid, dur, src, aspect, still=bool(c.get("still")), url=url, zooms=zs, marks=ms, tag=tag or p.get("tag"), pip=has_pip,
          dark_page=dark_page, title=f"{cid}: {p.get('what', 'grabación')}")
    cell = add({"id": cid, "start": t0, "end": t1, "graphic": True, "kind": "screen-rec", "template": "screen-rec scene",
                "region": "full", "bg": "light", "line": line, "role": "evidence",
                "asset": src.replace("assets/captures/", "assets/captures/"),
                "shows": p.get("what", "la pantalla real"),
                "content": f"Demostración requerida (la pantalla real del creador, no decorativa). La grabación real ({c['screen']} {c['fromMs']/1000:.1f} s, recorte {c.get('crop')}, x{c.get('speed', 1)}) en una ventana recta"
                           f" sobre el campo claro; un zoom suave al objetivo; {len(ms)} marca(s).",
                "phases": [{"at": 0, "what": "la página real, entera"}, {"at": round(max(1.0, zs[1]['at']) if len(zs) > 1 else 0.3, 2),
                                                                         "what": "zoom / marca sobre lo que dice"}],
                "visuals": ["la captura real de la pantalla"], "reason": reason or o.get("reason", "")})
    if has_pip:
        pips.append((f"pip-{cid}", cell["start"], cell["end"]))
    return cell


def ta(tid, phrase, *, after_rid, lines=None, push=False, reason="", occurrence=None, extra=None):
    """A text animation (the default sprinkle) on the canonical transcript's words; push=True pairs the push-in."""
    a = L.span(after_rid)[0]
    plain = phrase.replace("*", "")
    t0 = L.word(plain, after=a)
    t1 = L.word(plain, after=a, end=True)
    spec = {"phrase": phrase}
    if lines:
        spec["lines"] = lines
    if extra:
        spec.update(extra)
    # the builder picks the occurrence itself: count the matches before ours
    n = 0
    toks = [L._norm(x) for x in plain.split() if L._norm(x)]
    ws = [(L._norm(w["text"]), w) for w in L.WORDS]
    for i in range(len(ws) - len(toks) + 1):
        if all(ws[i + k][0] == toks[k] for k in range(len(toks))):
            n += 1
            if abs(ws[i][1]["start"] - t0) < 1e-3:
                break
    if n > 1:
        spec["occurrence"] = n
    texts[tid] = spec
    # the builder owns the length (hold, exit, a V1 cut as the exit): the plan takes its built span once there is one
    meta = L.GFX.parent / "text-animation/compositions" / f"{tid}.meta.json"
    end = t1 + 0.8
    if meta.exists():
        m = json.load(open(meta))
        end = m["place"] + m["duration"]
    return add({"id": tid, "start": t0 - 0.08, "end": end, "graphic": True, "kind": "text-animation", "template": "text animation",
                "region": "low-band", "copy": plain.lower(), "push_in": push, "line": plain, "role": "point",
                "content": f"Texto animado en la banda baja, cada palabra en su palabra hablada (80 ms antes).",
                "reason": reason or "el ritmo: algo visual cada ~10 s en cámara"})


def title_card(rid, numeral, name):
    a, b = L.span("titulo-" + numeral)
    tid = f"t-{numeral.lower()}"
    titles[tid] = {"lines": [numeral, name[:1].upper() + name[1:]], "dur": round(b - a, 4)}
    add({"id": tid, "start": a, "end": b, "graphic": True, "kind": "kinetic-title", "template": "section title card",
         "region": "full", "line": "", "role": "transition", "copy": f"{numeral} {name}",
         "content": "Tarjeta de sección del preset (titles/): letras que suben, 12 fps, sobre el fondo de rejilla.", "bg": "dark",
         "phases": [{"at": 0, "what": "las letras del número suben"}, {"at": 0.4, "what": "sube el nombre de la sección"}],
         "visuals": ["el fondo de rejilla azul del preset (backgrounds/bg-dark)"],
         "reason": f"sección {numeral}: {name}", "anchor": "none"})


def full(cid, start, end, kind, reason, *, bg="dark", line="", phases=None, visuals=None, content="", pip=False, role="point", asset=None):
    c = add({**({"asset": asset, "shows": "la página real de resultados de YouTube, con miniaturas"} if asset else {}),"id": cid, "start": start, "end": end, "graphic": True, "kind": kind, "template": "scene" if kind == "scene" else "punch cut",
             "region": "full", "bg": bg, "line": line, "role": role, "reason": reason, "content": content or reason,
             "phases": phases or [{"at": 0, "what": "entra la escena"}, {"at": 0.5, "what": "llega el resto en su tiempo"}],
             "visuals": visuals or ["un elemento que no es texto"], "anchor": "none" if not line else None})
    if c["anchor"] is None:
        c.pop("anchor")
    if pip:
        pips.append((f"pip-{cid}", c["start"], c["end"]))
    return c


def build():
    # ===================== INTRO (voz en off provisional, sin cara) =====================
    for oid in ["w-gente1", "w-gente2", "w-rug"]:
        o, c = V7[oid], V7[oid]["props"]["clip"]
        t0, t1 = vo("vo-intro", o["anchorMs"] / 1000), vo("vo-intro", (o["anchorMs"] + o["durationMs"]) / 1000)
        cid = oid.replace("w-", "b-")
        src, _ = L.capture(cid, c["screen"], c["fromMs"] / 1000, L.snap(t1) - L.snap(t0), speed=1.5)
        T.page_broll(cid, L.snap(t1) - L.snap(t0), src)
        full(cid, t0, t1, "screen-rec", "la intro estilo tef: búsquedas REALES de YouTube haciendo scroll (capturadas el 20/10/2026)",
             line="veo a mucha gente ganando mucho dinero con las criptomonedas", visuals=["la página real de resultados de YouTube"], asset=src)
    t0, t1 = vo("vo-intro", 5.41), vo("vo-intro", 7.42)
    coins = ('<svg viewBox="0 0 200 200"><circle cx="70" cy="110" r="56" fill="#ffa12e"/><circle cx="70" cy="110" r="38" fill="#ffc46b"/>'
             '<circle cx="132" cy="80" r="56" fill="#ffa12e"/><circle cx="132" cy="80" r="38" fill="#ffc46b"/></svg>')
    T.scene_words("g-dinero", L.snap(t1) - L.snap(t0), [{"at": 0.15, "html": "MUCHÍSIMO DINERO", "size": 150, "slam": True},
                                                         {"at": 0.75, "html": "en las <span style=\"color:#ffa12e\">cripto</span>", "size": 90}],
                  prop_svg=coins)
    full("g-dinero", t0, t1, "punch-cut", "«hay muchísimo dinero en las cripto»", visuals=["monedas"])
    t0, t1 = vo("vo-intro", 7.42), vo("vo-intro", 8.9)
    T.textlight("g-pastel", L.snap(t1) - L.snap(t0), [{"at": 0.1, "text": "quiero un trozo de ese pastel", "em": "pastel"}], prop="pie")
    full("g-pastel", t0, t1, "punch-cut", "«quiero un trozo de ese pastel»", bg="light", visuals=["un pastel con su trozo saliendo"])
    # «ganan ese dinero mientras duermen, con bots»: the creator took the YouTube page out in the editor (2026-10-21,
    # «no vull que tornis a ensenyar YT»); the line itself, typed, in its place
    t0, t1 = vo("vo-intro", 8.9), vo("vo-intro", 11.24)
    T.textlight("g-bots", L.snap(t1) - L.snap(t0), [{"at": 0.1, "text": "ganan dinero"}, {"at": 0.7, "text": "mientras duermen,"},
                                                     {"at": 1.4, "text": "con bots", "em": "bots"}], prop="chip")
    full("g-bots", t0, t1, "punch-cut", "«ganan ese dinero mientras duermen, con bots»", bg="light", visuals=["un chip"])
    t0, t1 = vo("vo-intro", 11.24), vo("vo-intro", 12.72)
    T.textlight("g-funciona", L.snap(t1) - L.snap(t0), [{"at": 0.1, "text": "a veces funciona,"}, {"at": 0.75, "text": "a veces no", "em": "no"}], prop="checkx")
    full("g-funciona", t0, t1, "punch-cut", "«a veces funciona, a veces no»", bg="light", visuals=["un sí y un no"])
    t0, t1 = vo("vo-intro", 12.72), vo("vo-intro", 16.22)
    moon = '<svg viewBox="0 0 100 100"><path d="M62 8 A42 42 0 1 0 92 66 A34 34 0 1 1 62 8 Z" fill="#a58fff"/></svg>'
    T.scene_words("g-dormir", L.snap(t1) - L.snap(t0), [{"at": 0.2, "html": "dormir:", "size": 110},
                                                         {"at": 1.4, "html": "mi habilidad <span style=\"font-family:'Playfair Display';font-style:italic;color:#a58fff\">nº 1</span>", "size": 120, "slam": True}],
                  prop_svg=moon)
    full("g-dormir", t0, t1, "punch-cut", "«dormir es mi habilidad número uno»", visuals=["una luna"])
    t0, t1 = vo("vo-intro", 16.22), vo("vo-intro", 18.55)
    T.textlight("g-plan", L.snap(t1) - L.snap(t0), [{"at": 0.1, "text": "¿tengo un plan"}, {"at": 0.9, "text": "para este bot?", "em": "bot?"}], prop="plan")
    full("g-plan", t0, t1, "punch-cut", "«¿tengo un plan para hacer este bot?»", bg="light", visuals=["una hoja de plan"])
    t0, t1 = vo("vo-intro", 18.55), vo("vo-intro", 19.4)
    T.scene_words("g-no", L.snap(t1) - L.snap(t0), [{"at": 0.05, "html": "<span style=\"color:#ff4d5e\">NO.</span>", "size": 300, "slam": True}])
    full("g-no", t0, t1, "punch-cut", "«no, para nada»", visuals=["(solo la palabra; dura menos de un segundo)"])
    t0, t1 = vo("vo-intro", 19.4), vo("vo-intro", 22.26)
    T.scene_hero("g-ia", L.snap(t1) - L.snap(t0), "assets/claude-color.svg",
                 [{"at": 0.3, "html": "¿acceso a la IA?"}, {"at": 1.5, "html": "<span style=\"color:#d97757\">sí.</span>", "slam": True}], img_w=300)
    full("g-ia", t0, t1, "scene", "«pero ¿tengo acceso a la IA? sí»: Claude", visuals=["el logo de Claude"])
    # «tendremos un bot que funciona»: the bot panel capture taken out in the editor (2026-10-21); the promise, slammed
    t0, t1 = vo("vo-intro", 22.26), vo("vo-intro", 25.12)
    T.scene_words("g-bot", L.snap(t1) - L.snap(t0), [{"at": 0.2, "html": "un bot", "size": 130},
                                                     {"at": 0.9, "html": "que <span style=\"color:#57c9f0\">funciona</span>", "size": 130, "slam": True}])
    full("g-bot", t0, t1, "punch-cut", "«tendremos un bot que funciona»", visuals=["(solo el texto)"])
    v7rec("w-intro-datos", start=vo("vo-intro", 25.12), end=vo("vo-intro", 27.24), pip=False, url="Claude Code",
          line="le daremos datos del mercado en directo")
    v7rec("w-intro-opera", start=vo("vo-intro", 27.24), end=vo("vo-intro", 29.79), pip=False, url="Panel del bot · localhost",
          zooms=[{"at": 0, "zoom": 1.1, "x": 0.0, "y": 0.45}], tag="Dinero ficticio · no es consejo financiero", line="y operará por nosotros")
    t0, t1 = vo("vo-intro", 29.79), L.span("vo-intro")[1]
    T.scene_stat("g-objetivo", L.snap(t1) - L.snap(t0), 10000, "en un mes: <span class=\"em\">el objetivo</span>", suffix=" $",
                 count_at=0.2, count_dur=1.0)
    full("g-objetivo", t0, t1, "scene", "«mi objetivo son 10.000 dólares en un mes»", visuals=["la cifra contando"])

    # ===================== I · EL PROMPT =====================
    title_card("p1", "I", "el prompt")
    ta("ta-planes", "el gratis, el de *20*, el de 100", after_rid="p1", reason="los tres planes; él usa el de 20")
    ta("ta-modelos", "tenemos *dos* modelos", after_rid="p2")
    v7rec("w-home", url="claude.ai", line="vamos a entrar primero al chat normal")
    v7rec("w-modelos", url="claude.ai · selector de modelo", line="en vez de Opus 5.5 … no hace falta", end=L.span("vo-P")[0])
    a = L.span("vo-P")[0]
    v7rec("w-P", start=a, end=L.span("vo-P")[1], pip=False, url="claude.ai", line="(voz en off P) le pido el prompt, no el bot",
          marks=[{"at": 1.5, "to": 6.4, "box": [0.283, 0.505, 0.434, 0.115], "label": "Le pido el prompt, no el bot"}])
    v7rec("w-A1", start=vo("vo-A", 0), end=vo("vo-A", 3.5), pip=False, url="claude.ai", line="(voz en off A) Claude me avisa",
          marks=[{"at": 0.3, "box": [0.237, 0.172, 0.485, 0.158], "label": "El aviso de Claude", "place": "above"}])
    t0, t1 = vo("vo-A", 3.5), L.span("vo-A")[1]
    T.scene_flow("fs-plan", L.snap(t1) - L.snap(t0), "El plan de <span class=\"em\">Claude</span>", [
        {"at": 0.4, "value": "1", "label": "Hipótesis simple", "sub": "una idea que se pueda comprobar"},
        {"at": 1.9, "value": "2", "label": "Datos históricos", "sub": "precios de años atrás"},
        {"at": 3.2, "value": "3", "label": "Backtesting", "sub": "probarla en el pasado"},
        {"at": 4.6, "value": "4", "label": "Control del riesgo", "sub": "stop-loss y límites"},
        {"at": 6.0, "value": "5", "label": "Dinero ficticio", "sub": "2-3 meses antes de nada", "payoff": True}], eyebrow="Cinco pasos")
    full("fs-plan", t0, t1, "scene", "el plan de cinco pasos que propone Claude (voz en off A)", visuals=["cinco nodos con flechas"],
         content="Escena oscura: el título, y los cinco pasos entrando de izquierda a derecha en su beat; el último (dinero ficticio) con pop.")
    v7rec("w-prompt2", url="claude.ai · el prompt generado", line="Actúa como ingeniero cuantitativo senior")
    v7rec("w-claudecode", url="Claude Code", line="tenemos la opción de Claude Code … Opus 5.5 en esfuerzo medio", lead=2.7,
          zooms=[{"at": 0, "zoom": 1.0}, {"at": 3.0, "zoom": 1.7, "x": 0.65, "y": 0.81}, {"at": 6.1, "zoom": 1.94, "x": 0.65, "y": 0.81}])
    v7rec("w-ficticio", url="Claude Code", line="vincularlo con alguna plataforma … pero sin dinero",
          clip={"fromMs": 209500, "speed": 2.0})   # x2: the whole typed line, through «(por tanto, ficticio)», inside the cell
    ta("ta-ficticio", "por tanto, *ficticio*", after_rid="p9", push=True, reason="la idea clave: dinero ficticio")
    ta("ta-60", "el *60%* de las tareas hechas", after_rid="p11", push=True, reason="el progreso, con número")
    v7rec("w-hipotesis", url="Claude Code", line="va a ir creando hipótesis")
    b = L.span("vo-B")[0]
    T.scene_chart("ce-cruce", 14.0, "cruce", "1 · Seguir la tendencia", "Rápida cruza por encima → compra · por debajo → vende")
    full("ce-cruce", b, b + 14.0, "scene", "estrategia 1 (voz en off B): cruce de medias", visuals=["gráfico de ejemplo con dos medias y señales"])
    T.scene_chart("ce-reversion", 10.0, "reversion", "2 · Reversión a la media", "Cae mucho de golpe → compra · vuelve a su media → vende")
    full("ce-reversion", b + 14.0, b + 24.0, "scene", "estrategia 2: reversión a la media", visuals=["gráfico de ejemplo"])
    T.scene_bars("ce-momentum", 9.0, "3 · Momentum", "Cada mes, el dinero va al que más ha subido",
                 [{"label": "Bitcoin", "value": 8}, {"label": "Ethereum", "value": 3}, {"label": "SPY", "value": 1}])
    full("ce-momentum", b + 24.0, b + 33.0, "scene", "estrategia 3: momentum", visuals=["tres barras de ejemplo"])
    t1 = L.span("vo-B")[1]
    T.scene_flow("fs-plataformas", L.snap(t1) - L.snap(b + 33.0), "Para practicar con <span class=\"em\">dinero ficticio</span>", arrows=False, steps=[
        {"at": 0.6, "icon": "assets/alpaca.png", "label": "Alpaca Paper", "sub": "acciones y ETF", "color": "#ffa12e"},
        {"at": 2.0, "mark": "BYBIT", "label": "Bybit Demo", "sub": "criptomonedas", "color": "#57c9f0"}])
    full("fs-plataformas", b + 33.0, t1, "scene", "las dos plataformas que recomienda Claude", visuals=["el logo de Alpaca", "la marca de Bybit"])

    # ===================== II · EL TRUCO =====================
    title_card("t1", "II", "el truco")
    v7rec("w-preguntas", url="claude.ai", line="nos hace unas preguntas antes de la fase 2")
    ta("ta-tokens", "menos créditos, menos *tokens*", after_rid="t1", push=True)
    ta("ta-mejor", "un prototipo *muchísimo* mejor", after_rid="t2")
    a = L.word("cuenta de cloud de 20", after=L.span("l1")[0])
    T.scene_stat("g-20", 2.6, 20, "la cuenta de <span class=\"em\">Claude</span>", suffix=" $", count_at=0.15, count_dur=0.6,
                 icon="assets/claude-color.svg")
    full("g-20", a - 0.4, a + 2.2, "scene", "«¿qué pasa si tenemos la cuenta de Claude de 20 dólares?»", visuals=["el logo de Claude", "la cifra"])
    v7rec("w-limite", pip=False, url="claude.ai · Uso", line="tenemos un límite de sesión … un gasto semanal", end=L.span("l1b")[0])
    # «llevamos un 2 %»: el panel Uso real (OBS1 588.5 s), sin cámara, como le gustó al creador; el 2 % marcado
    a, b = L.span("l1b")
    src, aspect = L.capture("r-limite2", "obs1", 588.5, b - a, crop="app", still=True)
    T.rec("r-limite2", L.snap(b) - L.snap(a), src, aspect, still=True, url="claude.ai · Uso",
          zooms=[{"at": 0, "zoom": 1.0}, {"at": 1.0, "zoom": 1.9, "x": 0.65, "y": 0.8}],
          marks=[{"at": L.word("2%", after=a) - a, "box": [0.541, 0.770, 0.214, 0.082], "label": "2 % de la sesión"}], pip=False)
    add({"id": "r-limite2", "start": a, "end": b, "graphic": True, "kind": "screen-rec", "template": "screen-rec scene", "region": "full",
         "bg": "light", "asset": src, "shows": "el panel Uso con el límite de sesión al 2 %", "line": "como podéis ver, llevamos un 2%",
         "role": "evidence", "content": "La captura real del panel Uso; zoom a la barra de la sesión y el 2 % marcado con el recuadro rojo.",
         "phases": [{"at": 0, "what": "la página entera"}, {"at": 1.0, "what": "zoom al 2 % y recuadro"}],
         "visuals": ["la captura real"], "reason": "demostración requerida: el gasto real de crear el bot"})
    ta("ta-opus", "en esfuerzo *medio*", after_rid="l2")
    t0, t1 = L.span("vo-D")
    T.scene_flow("fs-claudecode", 11.0, "Lo que hace <span class=\"em\">Claude Code</span>, solo", [
        {"at": 0.5, "icon": "assets/claudecode-color.svg", "label": "Descarga datos", "sub": "Bybit y Alpaca"},
        {"at": 2.2, "value": "2", "label": "Los limpia", "sub": "huecos, duplicados"},
        {"at": 4.0, "value": "3", "label": "Backtesting", "sub": "prueba las estrategias"},
        {"at": 5.8, "value": "4", "label": "Lo conecta", "sub": "a las cuentas de prueba"},
        {"at": 7.6, "value": "5", "label": "Un panel", "sub": "para verlo todo", "payoff": True}])
    full("fs-claudecode", t0, t0 + 11.0, "scene", "voz en off D: qué hace Claude Code", visuals=["cinco nodos", "el logo de Claude Code"])
    v7rec("w-D", start=t0 + 11.0, end=t1, pip=False, url="Claude Code · tareas", line="(voz en off D)",
          clip={"fromMs": 602000, "still": True},   # a still of the task list: the recording scrolls away mid-cell
          marks=[{"at": 0.3, "box": [0.235, 0.55, 0.27, 0.2], "label": "Lo hace todo solo"}])
    t0, t1 = L.span("vo-C")
    v7rec("w-C2", start=t0, end=t1, pip=False, url="Claude Code", line="(voz en off C) 12,7 % al año en comisiones de financiación",
          marks=[{"at": 0.3, "to": 4.8, "box": [0.205, 0.298, 0.59, 0.036], "label": "Datos reales desde 2020", "place": "above", "side": "r"},
                 {"at": 5.2, "box": [0.205, 0.487, 0.59, 0.036], "label": "Funding ≈ 12,7 % al año", "place": "above", "side": "r"}])

    # ===================== III · CUENTAS DE FONDEO =====================
    title_card("f1", "III", "cuentas de fondeo")
    ta("ta-utilidad", "la utilidad *real* de esto", after_rid="f1")
    a = L.word("qué es una cuenta de fondeo", after=L.span("f3")[0])
    b = L.span("f3b")[1]
    p28 = L.word("28 dólares", after=a) - a
    p5k = L.word("5.000 dólares", after=a) - a
    T.scene_flow("fs-fondeo1", L.snap(b) - L.snap(a), "¿Qué es una <span class=\"em\">cuenta de fondeo</span>?", [
        {"at": max(0.4, p28 - 0.1), "value": "28 $", "label": "Pagas el reto", "sub": "plan de 5.000 $ (con descuento)"},
        {"at": max(1.2, p5k - 0.1), "value": "5.000 $", "label": "Operas con su dinero", "sub": "no con el tuyo", "payoff": True}], pip=True)
    full("fs-fondeo1", a, b, "scene", "qué es una cuenta de fondeo, mientras lo explica (cara en la esquina, lo pidió el creador)",
         pip=True, visuals=["dos nodos con flecha"], line="¿qué es una cuenta de fondeo?")
    v7rec("w-ibero", start=L.span("f1b")[0], end=L.span("f1b")[1], url="iberofunding.com", dark_page=False,
          line="la que más recomiendo siempre será Ibero Funding")
    a = L.word("8% de estos", after=L.span("f4")[0]) - 0.6
    g0, g1 = L.span("vo-G")
    p8 = L.word("8% de estos", after=a) - a
    p6 = L.word("pierdes un", after=a) - a
    T.scene_flow("fs-fondeo2", L.snap(g1) - L.snap(a), "Las <span class=\"em\">reglas</span> del reto", [
        {"at": max(0.3, p8 - 0.1), "value": "+8 %", "label": "Objetivo: +400 $", "sub": "si llegas, pasas", "color": "#2fb7c9"},
        {"at": max(1.0, p6 - 0.1), "value": "−6 %", "label": "Límite: −300 $", "sub": "si llegas, pierdes el reto", "color": "#ff4d5e"},
        {"at": (g0 - a) + 0.6, "value": "75 %", "label": "Te quedas el 75 %", "sub": "de lo que ganes", "color": "#2ff58a", "payoff": True}],
        pip=True)
    full("fs-fondeo2", a, g1, "scene", "las reglas del reto (8 %, 6 %) y el 75 % de la voz en off G", pip=True,
         visuals=["tres nodos"], line="¿cómo puede ser?")
    ta("ta-8", "hacer un *8%* con 5.000 dólares", after_rid="f6", push=True, reason="la dificultad del reto, con número")
    ta("ta-nivel", "mucho a nivel *mental*", after_rid="f6")
    ta("ta-mental", "por los *nervios* o por la presión", after_rid="f6", push=True)
    v7rec("w-calc5k", start=L.span("b3")[0], url="iberofunding.com · calculadora", dark_page=False, line="vamos a poner un ejemplo",
          dur=8.1)   # ends on the calculator, before the page scrolls to the price table
    ta("ta-200", "casi *200* dólares al mes", after_rid="b3b")
    v7rec("w-calc50k", url="iberofunding.com · calculadora", dark_page=False, line="si tenemos una cuenta de 50.000",
          clip={"fromMs": 552100})   # from the settled 50K state (no text-selection pop-up)

    # ===================== IV · BACKTESTING =====================
    title_card("b1", "IV", "backtesting")
    ta("ta-rentables", "si podemos llegar a ser *rentables*", after_rid="b1", push=True)
    ta("ta-probar", "para probar *diferentes* estrategias", after_rid="b1")
    a, b = L.span("b2a")[0], L.span("b2b")[1]
    T.scene_chart("ce-backtest", L.snap(b) - L.snap(a), "backtest", "Backtesting: probar en el pasado",
                  "¿Habría ganado dinero? Así lo sabes antes de arriesgar", pip=True)
    full("ce-backtest", a, b, "scene", "qué es el backtesting, mientras lo explica (cara en la esquina)", pip=True,
         visuals=["gráfico de ejemplo con el corte de HOY"], line="el backtesting básicamente sirve para comprobar estrategias")

    # ===================== V · 24 HORAS DESPUÉS =====================
    title_card("d1", "V", "24 horas después")
    ta("ta-uni", "la vida del universitario es muy *dura*", after_rid="d1")
    v7rec("w-hazlo", url="Claude Code", line="que no quería hacer nada y que lo haría todo él")
    v7rec("w-iniciar", url="Explorador de archivos", dark_page=True, line="en archivos, iniciar bot", clip={"fromMs": 16700}, dur=4.7,
          zooms=[{"at": 0, "zoom": 1.0}, {"at": 3.4, "zoom": 1.6, "x": 0.25, "y": 0.25}])   # the explorer and «Bot iniciado», no OBS, no chat
    ta("ta-5", "me ha gastado un *5%* semanal", after_rid="d4", push=True)
    v7rec("w-panel-crea", url="Claude Code", line="ahora me está creando un servidor local")

    # ===================== VI · ASÍ FUNCIONA =====================
    title_card("vo-F", "VI", "así funciona")
    for oid in ["w-F2", "w-F3", "w-F4a", "w-F5a", "w-F5b", "w-F6", "w-F7"]:
        o = V7[oid]
        t0 = src_any("vo-provisional.mov", o["anchorMs"] / 1000)
        t1 = t0 + o["durationMs"] / 1000
        extra = {}
        if oid == "w-F2":   # VO F has picture from its first frame (the placeholder VO is black)
            extra["clip"] = {"fromMs": o["props"]["clip"]["fromMs"] - (t0 - L.span("vo-F")[0]) * 1000}
            t0 = L.span("vo-F")[0]
        if oid == "w-F7":   # ... to its last, butt-joined to the street
            t1 = L.span("vo-F")[1]
        if oid == "w-F5b":
            extra["marks"] = [{"at": 0.3, "box": [0.578, 0.328, 0.225, 0.032], "label": "Pierde como máximo un 0,5 %", "place": "below"}]
        if oid == "w-F7":   # the real log line carries an emoji glyph: a patch in the log's own colour over it
            extra["marks"] = [{"kind": "mask", "box": [0.699, 0.955, 0.0115, 0.023], "color": "#121723"},
                              {"at": 0.3, "box": [0.505, 0.93, 0.47, 0.07], "label": "Cada vela cerrada → señal", "place": "above"}]
        v7rec(oid, start=t0, end=t1, pip=False, url="Panel del bot · localhost", line="(voz en off F)", tag="Dinero ficticio · no es consejo financiero", **extra)

    # ===================== FINAL (en la calle) =====================
    v7rec("w-resultado", start=L.span("e1")[0], end=L.span("e2")[1], url="Panel del bot · localhost",
          tag="Dinero ficticio · no es consejo financiero", marks=[{"at": 1.4, "box": [0.212, 0.11, 0.18, 0.16], "label": "+46,54 $ en ~22 h"}],
          line="ahora mismo está en positivo, con 50 dólares")
    ta("ta-funciona", "que de verdad *funciona*", after_rid="h2", push=True, extra={"y": 860, "width": 1100})

    # ===================== the creator's editor (hf-graphics/edits.json, written by aplica_editor.py) =====================
    ed = json.load(open(L.HF / "edits.json")).get("graphics", {}) if (L.HF / "edits.json").exists() else {}
    for c in list(cells):
        e = ed.get(c["id"])
        if not e:
            continue
        if e.get("off"):
            cells.remove(c)
            pips[:] = [p for p in pips if p[0] != f"pip-{c['id']}"]
            texts.pop(c["id"], None)
            DEFER.pop(c["id"], None)
            continue
        if c.get("kind") != "text-animation":      # a text animation's length is its builder's (its words); moved by hand
            c["start"], c["end"] = L.snap(c["start"] + e.get("dStart", 0)), L.snap(c["end"] + e.get("dEnd", 0))
    for pid, _, _ in list(pips):                   # a corner cam switched off on its own
        if ed.get(pid, {}).get("off"):
            pips[:] = [p for p in pips if p[0] != pid]

    # ===================== edges: no two full-screens overlap; an edge within 8 frames of a V1 cut lands ON it ======
    cuts = sorted({round(x, 6) for sg in L.SEGS for x in (sg["t0"], sg["t1"])})
    fulls = sorted([c for c in cells if c.get("region") == "full"], key=lambda c: c["start"])
    for x, y in zip(fulls, fulls[1:]):
        if x["end"] > y["start"] or 0 < y["start"] - x["end"] <= 2.5 / L.FPS:
            x["end"] = y["start"]
    for c in fulls:
        for k in ("start", "end"):
            near = min(cuts, key=lambda t: abs(t - c[k]))
            if 1e-6 < abs(near - c[k]) <= 8 / L.FPS:
                c[k] = L.snap(near)
    pips[:] = [(pid, next(c["start"] for c in cells if f"pip-{c['id']}" == pid), next(c["end"] for c in cells if f"pip-{c['id']}" == pid))
               for pid, _, _ in pips]
    # a corner cam is the camera: it ends where the camera does (a VO block or a title gap under its graphic)
    pips[:] = [(pid, s, min(e, barrier_after(s))) for pid, s, e in pips]
    # every comp is built now, with the length its cell finally has (an edge moved onto a V1 cut moves the comp's end too)
    for c in cells:
        if c["id"] in DEFER:
            fn, a_, k_ = DEFER.pop(c["id"])
            fn(c["id"], L.snap(c["end"]) - L.snap(c["start"]), *a_, **k_)
    for cid, (fn, a_, k_) in list(DEFER.items()):
        sys.exit(f"{cid}: built but never placed")
    # ===================== corner cam rows (after the graphic they sit on) =====================
    out = []
    for c in sorted(cells, key=lambda c: c["start"]):
        out.append(c)
        for pid, s, e in pips:
            if pid == f"pip-{c['id']}":
                out.append({"id": pid, "start": L.snap(s), "end": L.snap(e), "graphic": True, "kind": "overlay", "template": "corner cam",
                            "region": "corner-cam", "line": "", "role": "evidence",
                            "content": "La cámara del creador (graduada) en la caja cuadrada de 300 px, 30 px de la esquina inferior derecha, radio 54, sombra suave; centrada en su cara.",
                            "reason": "pantalla comentada: él sigue en pantalla mientras habla sobre la grabación"})
    return out


def main():
    cells_out = build()
    (L.HF / "text-animation" / "text.json").write_text(json.dumps(texts, ensure_ascii=False, indent=1), encoding="utf-8")
    (L.HF / "titles" / "titles.json").write_text(json.dumps(titles, ensure_ascii=False, indent=1), encoding="utf-8")
    import hashlib
    rev = hashlib.sha1(open(L.JOB / "transcript/cuts.json", "rb").read()).hexdigest()[:12]
    plan = {"job": L.JOB.name, "format": "long-form", "tier": "basic", "preset": "presets/youtube/default", "fps": "30/1",
            "duration": round(L.DURATION, 4), "cut_rev": rev,
            "arc": "Un universitario que no sabe de trading monta con Claude un bot que opera con dinero ficticio: el prompt, el truco, "
                   "las cuentas de fondeo, el backtesting y el bot funcionando 24 horas después.",
            "face_covered_seconds": 0,
            "graphics_scope": {"ranges": [[0, round(L.DURATION - 16, 3)]], "why": "el final (últimos 16 s) queda libre a la derecha y abajo para las tarjetas de pantalla final de YouTube"}, "low_band": json.load(open(L.HF / "low_band.json")) if (L.HF / "low_band.json").exists() else None,
            "beats": cells_out}
    if plan["low_band"] is None:
        plan.pop("low_band")
    (L.JOB / "graphics-plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1), encoding="utf-8")
    cov = sorted((c["start"], c["end"]) for c in cells_out)
    t, gaps = 0.0, []
    for a, b in cov:
        if a - t > 6:
            gaps.append((t, a))
        t = max(t, b)
    for a, b in gaps:
        ws = " ".join(w["text"] for w in L.WORDS if a <= w["start"] < b)
        print(f"  bare {a:6.1f}-{b:6.1f} ({b-a:4.1f}s): {ws[:150]}")
    print(f"{len(cells_out)} cells · {len(texts)} text animations · {len(titles)} title cards · {len(pips)} corner cams")


if __name__ == "__main__":
    main()
