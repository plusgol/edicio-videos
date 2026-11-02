"""Fàbrica de vídeos · el guió: del brief a les pantalles i la línia de temps.

Una pantalla = una frase (la guia de Damiano: «one sentence per screen»). Al text, *així* marca la paraula clau de la
pantalla; si la paraula clau és un número, roda (count-up). Cada pantalla pot ser:

  "text"                                  una frase
  {"text", "items": [...]}                una frase i una llista que es marca element a element
  {"text", "bar": {"value": 0.87}}        una frase i una barra que s'omple
  {"text", "image": "input/x.png",        una captura real (mai inventada) a sota del text; «focus» hi fa un apropament
   "focus": {"x": .5, "y": .3, "zoom": 1.6}, "reframe": true}   lent; «reframe» la fa entrar a pantalla sencera
  {"text", "end": true, "sub": "..."}     la targeta final (amb el logo del brief, si n'hi ha)

Altres claus de pantalla: "say" (el que diu la veu si no és el text: una URL, una sigla), "label" (etiqueta petita),
"punch": true (punch-in a la paraula clau), "from" (d'on comença a rodar el número), "count": false (la xifra
clau no roda: un any, un telèfon).

Amb veu, cada paraula surt al fotograma en què es diu (alineació d'ElevenLabs); sense veu, al ritme de lectura.
"""
import difflib
import math
import re
import unicodedata

FPS = 30


def norm(w: str) -> str:
    w = unicodedata.normalize("NFKD", w.lower())
    return "".join(c for c in w if c.isalnum())


NUM = re.compile(r"^(\D*?)(\d[\d.,]*)(\D*)$")


def parse_number(s: str):
    m = NUM.match(s)
    if not m:
        return None
    raw = m.group(2)
    dec = len(raw.split(",")[1]) if re.search(r",\d{1,2}$", raw) else 0
    try:
        value = float(raw.replace(".", "").replace(",", "."))
    except ValueError:
        return None
    return {"prefix": m.group(1), "to": value, "decimals": dec, "suffix": m.group(3), "group": bool(re.search(r"\d\.\d{3}", raw))}


def words_of(text: str):
    """Paraules del text de pantalla: {t, head, tail, accent}. «head»/«tail» són signes enganxats (¿ ? , .) que no
    agafen el color de la paraula clau."""
    out, pending = [], ""
    for seg in re.split(r"(\*[^*]+\*)", text):
        if not seg:
            continue
        acc = seg.startswith("*") and seg.endswith("*")
        body = seg[1:-1] if acc else seg
        glued_left = not seg[0].isspace() and not acc
        toks = body.split()
        for i, tok in enumerate(toks):
            m = re.match(r"^([¿¡«\"'(]*)(.*?)([.,;:!?»\"')…]*)$", tok)
            head, core, tail = m.group(1), m.group(2), m.group(3)
            if not core:
                if all(c in "¿¡«(\"'" for c in tok):  # «¿*sabías*?»: el ¿ obre la paraula següent
                    pending += tok
                elif out:  # només puntuació: s'enganxa a la paraula d'abans
                    out[-1]["tail"] += tok
                continue
            if out and not any(c.isalnum() for c in core) and core in "%€$£+ºª°":  # «100 %», «20 €»: amb el número
                out[-1]["t"] += "\u00a0" + core  # (si el número roda, passa a ser-ne el sufix: més avall)
                out[-1]["tail"] += tail
                continue
            if i == 0 and glued_left and out and not acc:
                out[-1]["tail"] += tok  # «*ciegas*?» → el ? va amb «ciegas»
                continue
            out.append({"t": core, "head": pending + head, "tail": tail, "accent": acc})
            pending = ""
    # una paraula clau que és un número sencer roda
    for w in out:
        if w["accent"]:
            n = parse_number(w["t"])
            if n:
                w["count"] = n
    return out


def plain(text: str) -> str:
    return re.sub(r"\*", "", text)


AND = {"ca": "i", "es": "y", "en": "and"}


def low(x: str) -> str:
    """Minúscula inicial dins la frase («L'espai» → «l'espai»), però no en sigles ni noms («UniMatx», «UAB»)."""
    return x[0].lower() + x[1:] if len(x) > 1 and (x[1].islower() or x[1] in "'’ ") else x


def spoken_text(sc: dict, lang: str) -> str:
    if sc.get("say"):
        return sc["say"]
    t = plain(sc["text"])
    if sc.get("items"):
        # una enumeració amb comes i «i»: separats per punts, la veu els diu com preguntes
        its = [low(plain(i)) for i in sc["items"]]
        tail = its[0] if len(its) == 1 else ", ".join(its[:-1]) + f" {AND.get(lang, 'i')} " + its[-1]
        t = t.rstrip(" :") + ": " + tail + "."
    return t


def screens_of(brief: dict):
    out = []
    for i, raw in enumerate(brief["screens"]):
        sc = {"text": raw} if isinstance(raw, str) else dict(raw)
        sc["id"] = f"{i + 1:02d}"
        sc["words"] = words_of(sc["text"])
        sc["kind"] = "end" if sc.get("end") else "list" if sc.get("items") else "bar" if sc.get("bar") else "image" if sc.get("image") else "text"
        if sc.get("items"):
            sc["itemWords"] = [words_of(it) for it in sc["items"]]
        if sc.get("count") is False:
            for w in sc["words"]:
                w.pop("count", None)
        if "from" in sc:
            for w in sc["words"]:
                if "count" in w:
                    w["count"]["from"] = sc["from"]
        sc["spoken"] = spoken_text(sc, brief.get("language", "es"))
        out.append(sc)
    return out


def align(shown: list, spoken: list) -> list:
    """Fotograma de cada paraula de pantalla a partir de les paraules dites (amb temps). Les que no es diuen tal qual
    s'interpolen entre les veïnes."""
    a = [norm(w["t"]) for w in shown]
    b = [norm(w["text"]) for w in spoken]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    f = [None] * len(shown)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            f[blk.a + k] = spoken[blk.b + k]["f"]
    known = [i for i, x in enumerate(f) if x is not None]
    if not known:
        t0, t1 = spoken[0]["f"], spoken[-1]["f"]
        return [round(t0 + (t1 - t0) * i / max(1, len(shown) - 1)) for i in range(len(shown))]
    for i in range(len(f)):
        if f[i] is None:
            lo = max([k for k in known if k < i], default=None)
            hi = min([k for k in known if k > i], default=None)
            if lo is None:
                f[i] = f[hi]
            elif hi is None:
                f[i] = f[lo] + (i - lo) * 4
            else:
                f[i] = round(f[lo] + (f[hi] - f[lo]) * (i - lo) / (hi - lo))
    return f


def item_frames(sc: dict, spoken: list) -> list:
    """El fotograma on es diu cada element de la llista: la primera paraula de l'element, buscada després del títol."""
    b = [norm(w["text"]) for w in spoken]
    pos, out = 0, []
    for iw in sc["itemWords"]:
        first = norm(iw[0]["t"])
        k = next((j for j in range(pos, len(b)) if b[j] == first), None)
        out.append(spoken[k]["f"] if k is not None else None)
        pos = (k + 1) if k is not None else pos
    # els que no s'han trobat, repartits
    t0, t1 = spoken[0]["f"], spoken[-1]["f"]
    n = len(out)
    return [x if x is not None else round(t0 + (t1 - t0) * (i + 1) / (n + 1)) for i, x in enumerate(out)]


def timeline(screens: list, voice: dict | None, MG: dict):
    """Posa cada pantalla a la línia de temps. `voice` = {id: {"frames", "words": [{text, start}]}} o None.
    Retorna (pantalles amb from/frames i fotogrames relatius, durada total, inici de la veu de cada pantalla)."""
    fx = MG["factory"]
    exit_max = 12  # la sortida més llarga dels estils (Editorial Grain)
    t = fx["lead"]
    voice_at = {}
    for i, sc in enumerate(screens):
        if sc["kind"] == "end":
            t += fx["endLead"]
        v = voice.get(sc["id"]) if voice else None
        start = t
        sc["from"] = max(0, start - fx["pre"])
        if v:
            voice_at[sc["id"]] = start
            spoken = [{"text": w["text"], "f": start + round(w["start"] * FPS)} for w in v["words"]]
            wf = align(sc["words"], spoken)
            end_voice = start + v["frames"]
        else:
            wf = [start + k * fx["wordStep"] for k in range(len(sc["words"]))]
            spoken = None
            n = len(sc["words"]) + sum(len(x) for x in sc.get("itemWords", []))
            end_voice = start + max(MG["minHold"], math.ceil(n / MG["readWps"] * FPS))
        for w, f in zip(sc["words"], wf):
            w["f"] = f
        last = max(wf)
        need = last + fx["readable"]
        if sc.get("items"):
            if spoken:
                itf = item_frames(sc, spoken)
            else:
                itf = [last + 10 + k * 14 for k in range(len(sc["items"]))]
            sc["itemAt"] = itf
            need = max(need, itf[-1] + MG["move"]["tick"] + fx["readable"])
        for w in sc["words"]:
            if "count" in w:
                need = max(need, w["f"] + MG["move"]["count"] + 8)
        if sc.get("bar"):
            sc["barAt"] = next((w["f"] for w in sc["words"] if w["accent"]), sc["words"][0]["f"])
            need = max(need, sc["barAt"] + MG["move"]["fill"] + 8)
        if sc.get("punch"):
            sc["punchAt"] = next((w["f"] for w in sc["words"] if w["accent"]), sc["words"][0]["f"])
        if sc["kind"] == "end":
            end = max(end_voice, need) + fx["tail"]
        else:
            end = max(end_voice + fx["gap"], need + exit_max + fx["pre"])
        if not voice:
            end = start + math.ceil((end - start) / MG["beat"]) * MG["beat"]  # sense veu, els talls cauen a temps
        t = end
    total = t
    for i, sc in enumerate(screens):
        nxt = screens[i + 1]["from"] if i + 1 < len(screens) else total
        sc["frames"] = nxt - sc["from"]
        # d'aquí en avall, fotogrames relatius a l'inici de la pantalla (el que veu useCurrentFrame dins la Sequence)
        for w in sc["words"]:
            w["f"] -= sc["from"]
        for k in ("barAt", "punchAt"):
            if k in sc:
                sc[k] -= sc["from"]
        if "itemAt" in sc:
            sc["itemAt"] = [x - sc["from"] for x in sc["itemAt"]]
    return screens, total, voice_at
