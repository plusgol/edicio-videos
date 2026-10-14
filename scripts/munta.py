"""Converteix el pla de muntatge (edl.json) en una línia de temps exacta per a Remotion i en la pista de veu.

Ús: python3 -I scripts/munta.py projectes/<nom>

Llegeix   <projecte>/edl.json i els fitxers de work/ que hi cita (vídeo vertical, wav 48 kHz, track, transcripció).
Escriu    <projecte>/work/render.json   → segments, subtítols i recursos en fotogrames de sortida
          <projecte>/work/voice.wav     → veu muntada, netejada i normalitzada
          <projecte>/work/muntatge.txt  → resum llegible per revisar el muntatge

Tot el càlcul de temps viu aquí: Remotion només pinta el que diu render.json.
"""
import difflib
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

proj = Path(sys.argv[1])
edl = json.loads((proj / "edl.json").read_text())
FPS = edl["video"]["fps"]
C = edl["cuts"]
HOP_MS = 20


def ms_to_frame(ms):
    return int(round(ms * FPS / 1000))


# ---------- Fonts: energia, transcripció i seguiment de cara ----------
sources = {}
for name, s in edl["sources"].items():
    with wave.open(str(proj / s["audio"])) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    hop = sr * HOP_MS // 1000
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) + 1e-9 for i in range(0, len(x), hop)])
    db = 20 * np.log10(rms)
    floor = float(np.percentile(db, 10))
    words = json.loads((proj / s["transcript"]).read_text())["words"]
    words += edl.get("asrPatches", {}).get(name, [])
    words.sort(key=lambda w: w["startMs"])
    track = json.loads((proj / s["track"]).read_text())["frames"]
    sources[name] = {
        **s,
        "db": db, "floor": floor, "thr": floor + C["silenceThresholdDbAboveFloor"],
        "durMs": len(x) * 1000 / sr, "words": words, "track": track,
    }


def snap(src, ms):
    """Mou un punt de tall al moment més silenciós dins de ±snapWindowMs."""
    db = src["db"]
    a = max(0, int((ms - C["snapWindowMs"]) / HOP_MS))
    b = min(len(db), int((ms + C["snapWindowMs"]) / HOP_MS) + 1)
    return (a + int(np.argmin(db[a:b]))) * HOP_MS


def split_silences(src, a, b):
    """Retalla dins [a, b] els silencis més llargs que el límit i en deixa uns marges naturals."""
    db, thr = src["db"], src["thr"]
    i0, i1 = int(a / HOP_MS), int(b / HOP_MS)
    quiet = db[i0:i1] < thr
    parts, start, run = [], a, None
    for k, q in enumerate(list(quiet) + [False]):
        if q and run is None:
            run = k
        elif not q and run is not None:
            r0, r1 = (i0 + run) * HOP_MS, (i0 + k) * HOP_MS
            if r1 - r0 > C["shortenSilenceLongerThanMs"] and r0 > a and r1 < b:
                parts.append((start, r0 + C["keepAfterSpeechMs"]))
                start = r1 - C["keepBeforeSpeechMs"]
            run = None
    parts.append((start, b))
    return [p for p in parts if p[1] - p[0] > 80]


# ---------- Segments ----------
# Revisions de l'editor: un range amb keep=false es talla sencer; un recurs amb enabled=false no es pinta.
active_overlays = [o for o in edl["overlays"] if o.get("enabled", True)]

segments = []
for r in edl["ranges"]:
    src = sources[r["source"]]
    a, b = snap(src, r["inMs"]), snap(src, min(r["outMs"], src["durMs"]))
    for pa, pb in split_silences(src, a, b):
        # Talla també als límits dels punch-ins perquè el canvi d'escala caigui en un tall.
        # Un punt de punch-in massa a prop d'un extrem crearia un tros de < 0,5 s: llavors no es talla.
        cuts = sorted({pa, pb, *[p[k] for p in edl.get("punchIns", []) if p["source"] == r["source"]
                                 for k in ("fromMs", "toMs") if pa + 500 < p[k] < pb - 500]})
        for ca, cb in zip(cuts, cuts[1:]):
            segments.append({"range": r["id"], "source": r["source"], "inMs": ca, "outMs": cb, "block": r["block"],
                             "preferredScale": r.get("scale"), "keep": r.get("keep", True)})

# L'editor necessita també els trossos tallats (per poder-los recuperar); el muntatge només els conservats.
all_segments = segments
for s in all_segments:
    s["trimBefore"] = ms_to_frame(s["inMs"])
    s["durationInFrames"] = ms_to_frame(s["outMs"]) - s["trimBefore"]
segments = [s for s in all_segments if s["keep"]]

out = 0
prev_scale = None
scale_i = -1
for s in segments:
    s["fromFrame"] = out
    out += s["durationInFrames"]
    # Un punch-in s'aplica al segment el centre del qual cau dins del seu interval (els talls s'ajusten a silencis).
    mid = (s["inMs"] + s["outMs"]) / 2
    punch = next((p for p in edl.get("punchIns", []) if p["source"] == s["source"] and p["fromMs"] <= mid <= p["toMs"]), None)
    if punch:
        s["scale"] = punch["scale"]
    elif s["preferredScale"] and s["preferredScale"] != prev_scale:
        s["scale"] = s["preferredScale"]
    else:
        # Dos segments seguits mai amb la mateixa escala: amaga el salt del jump cut.
        # L'estil Alex fa servir tres escales (video.cameraScales); el de la casa, dues.
        cycle = edl["video"].get("cameraScales", [1.0, 1.08])
        scale_i = (scale_i + 1) % len(cycle)
        if cycle[scale_i] == prev_scale:
            scale_i = (scale_i + 1) % len(cycle)
        s["scale"] = cycle[scale_i]
    prev_scale = s["scale"]
    tr = sources[s["source"]]["track"][s["trimBefore"]:s["trimBefore"] + s["durationInFrames"]]
    s["originX"] = round(float(np.median([t["x"] for t in tr])), 1)
    s["originY"] = round(float(np.median([t["y"] for t in tr])), 1)
total_frames = out


def src_to_out_ms(source, ms):
    """Temps de l'original → temps de sortida. Si cau en un tros retallat, va al següent tros conservat."""
    for s in segments:
        if s["source"] != source:
            continue
        a, b = s["trimBefore"] * 1000 / FPS, (s["trimBefore"] + s["durationInFrames"]) * 1000 / FPS
        if ms < a:
            return s["fromFrame"] * 1000 / FPS
        if ms < b:
            return s["fromFrame"] * 1000 / FPS + (ms - a)
    return None


# ---------- Subtítols ----------
def norm(t):
    t = t.lower()
    t = re.sub(r"[^\wáéíóúüñ]+", "", t)
    return t


FUNCTION_WORDS = {"de", "la", "el", "a", "con", "y", "que", "por", "en", "los", "las", "un", "una", "mi", "te", "lo",
                  "se", "si", "es", "al", "del", "o", "para", "me", "tu", "su"}

caption_words = []  # (text, outMs, highlight)
for r in edl["ranges"]:
    src = sources[r["source"]]
    asr = [w for w in src["words"] if r["inMs"] - 250 <= w["startMs"] <= r["outMs"] + 50]
    toks = r["captions"].split()
    sm = difflib.SequenceMatcher(a=[norm(t) for t in toks], b=[norm(w["text"]) for w in asr], autojunk=False)
    times = [None] * len(toks)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = asr[blk.b + k]["startMs"]
    # Paraules corregides sense parella: interpolació proporcional als caràcters entre veïns coneguts.
    known = [(i, t) for i, t in enumerate(times) if t is not None]
    if not known:
        known = [(0, r["inMs"])]
    if known[0][0] != 0:
        known.insert(0, (0, max(r["inMs"], known[0][1] - 250 * known[0][0])))
    if known[-1][0] != len(toks) - 1:
        known.append((len(toks) - 1, min(r["outMs"] - 300, known[-1][1] + 280 * (len(toks) - 1 - known[-1][0]))))
    for i, t in known:
        times[i] = t
    for (i0, t0), (i1, t1) in zip(known, known[1:]):
        lens = np.cumsum([0] + [len(toks[k]) + 1 for k in range(i0, i1)])
        for k in range(i0 + 1, i1):
            times[k] = t0 + (t1 - t0) * lens[k - i0] / lens[-1]
    hl = set()
    for phrase in r.get("highlight", []):
        p = [norm(x) for x in phrase.split()]
        for i in range(len(toks) - len(p) + 1):
            if [norm(x) for x in toks[i:i + len(p)]] == p:
                hl.update(range(i, i + len(p)))
                break
    for i, (t, ms) in enumerate(zip(toks, times)):
        o = src_to_out_ms(r["source"], ms)
        if o is not None:
            caption_words.append({"text": t, "outMs": o, "highlight": i in hl, "range": r["id"]})

pages, cur = [], []


def flush():
    if cur:
        pages.append(list(cur))
        cur.clear()


for i, w in enumerate(caption_words):
    if cur:
        text_len = len(" ".join(x["text"] for x in cur + [w]))
        prev = cur[-1]
        sentence_end = re.search(r"[.?!:]$", prev["text"])
        comma = prev["text"].endswith(",")
        gap = w["outMs"] - prev["outMs"] > 900
        new_range = w["range"] != prev["range"] and (sentence_end or comma or gap)
        # Si només queda una paraula per acabar la frase, s'hi admet fins a 40 caràcters per no deixar-la sola.
        closes = re.search(r"[.?!]$", w["text"]) and text_len <= 40 and len(cur) < 7
        too_long = (len(cur) >= 6 or text_len > 34) and not closes
        if too_long or sentence_end or gap or new_range or (comma and len(cur) >= 3):
            # No deixis una paraula funcional penjant al final d'una pàgina.
            carry = []
            while len(cur) > 1 and norm(cur[-1]["text"]) in FUNCTION_WORDS and not re.search(r"[.,?!:]$", cur[-1]["text"]):
                carry.insert(0, cur.pop())
            flush()
            cur.extend(carry)
    cur.append(w)
flush()

hook = next((o for o in active_overlays if o["type"] == "HookText"), None)
hook_end = (hook["atOutputMs"] + hook["durationMs"]) if hook and hook.get("hideCaptions") else -1

captions = []
# Subtítols cremats: sí per a Shorts/Reels; per a YouTube llarg es desactiven (video.captions = false) i van com a CC.
if not edl["video"].get("captions", True):
    pages = []
for k, p in enumerate(pages):
    start = p[0]["outMs"]
    last_end = p[-1]["outMs"] + max(250, 70 * len(p[-1]["text"]))
    nxt = pages[k + 1][0]["outMs"] if k + 1 < len(pages) else total_frames * 1000 / FPS
    end = min(nxt, last_end + 200) if nxt - last_end > 400 else nxt
    end = max(end, min(nxt, start + 700))
    if start < hook_end:
        continue
    words = [{"text": re.sub(r"[.,;:]$", "", w["text"]) if j == len(p) - 1 else w["text"], "highlight": w["highlight"]}
             for j, w in enumerate(p)]
    captions.append({"fromFrame": ms_to_frame(start), "toFrame": ms_to_frame(end), "words": words})

# ---------- Recursos ----------
ROOT = Path(__file__).resolve().parent.parent
ASSET_DIRS = {
    "emoji": (ROOT / "node_modules/@lobehub/fluent-emoji-3d/assets", ".webp"),  # Fluent Emoji 3D (MIT)
    "logo": (ROOT / "node_modules/@lobehub/icons-static-svg/icons", ".svg"),  # @lobehub/icons (MIT)
}


def resolve_assets(v):
    """«emoji:1f9e0» o «logo:claude-color» → copia el fitxer a <projecte>/assets/ i en retorna la ruta."""
    if isinstance(v, dict):
        return {k: resolve_assets(x) for k, x in v.items()}
    if isinstance(v, list):
        return [resolve_assets(x) for x in v]
    if isinstance(v, str) and v.split(":", 1)[0] in ASSET_DIRS and ":" in v:
        kind, name = v.split(":", 1)
        folder, ext = ASSET_DIRS[kind]
        src_file = folder / f"{name}{ext}"
        if not src_file.exists():
            raise SystemExit(f"No existeix el recurs {v} ({src_file})")
        dst = proj / "assets" / kind / src_file.name
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists():
            dst.write_bytes(src_file.read_bytes())
        return f"assets/{kind}/{src_file.name}"
    return v


def face_at(out_frame):
    """Posició de la cara a la pantalla en un fotograma de sortida (amb l'escala del segment aplicada)."""
    for s in segments:
        if s["fromFrame"] <= out_frame < s["fromFrame"] + s["durationInFrames"]:
            tr = sources[s["source"]]["track"]
            p = tr[min(len(tr) - 1, s["trimBefore"] + out_frame - s["fromFrame"])]
            return (round(s["originX"] + s["scale"] * (p["x"] - s["originX"]), 1),
                    round(s["originY"] + s["scale"] * (p["y"] - s["originY"]), 1),
                    round(s["scale"] * p["faceH"], 1))
    return None


NEEDS_FACE = {"FloatingWords", "EmojiPop", "HandWritten", "LogoPop"}
overlays = []
for o in active_overlays:
    at = o["atOutputMs"] if "atOutputMs" in o else src_to_out_ms(o["source"], o["anchorMs"])
    at = max(0, at + o.get("offsetMs", 0))
    f0 = ms_to_frame(at)
    props = resolve_assets(o["props"])
    if o["type"] in NEEDS_FACE and "faceX" not in props:
        face = face_at(f0)
        if face:
            props = {**props, "faceX": face[0], "faceY": face[1], "faceH": face[2]}
    o["_resolvedProps"] = props
    overlays.append({"id": o["id"], "type": o["type"], "fromFrame": f0,
                     "durationInFrames": min(ms_to_frame(at + o["durationMs"]) - f0, total_frames - f0), "props": props})

# ---------- Veu ----------
A = edl["audio"]
work = proj / "work"


def loudness(path, filt=None):
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", str(path)]
    cmd += ["-af", (filt + "," if filt else "") + "loudnorm=print_format=json", "-f", "null", "-"]
    err = subprocess.run(cmd, capture_output=True, text=True).stderr
    return json.loads(err[err.rindex("{"):err.rindex("}") + 1])


# Iguala el nivell de cada presa abans de muntar (les preses poden venir de llocs i moments diferents).
gains = {n: -20 - float(loudness(proj / s["audio"])["input_i"]) for n, s in edl["sources"].items()}
names = list(edl["sources"])
inputs, chains, labels = [], [], []
for n in names:
    inputs += ["-i", str(proj / edl["sources"][n]["audio"])]
fade = A["fadeMs"] / 1000
for k, s in enumerate(segments):
    a = s["trimBefore"] / FPS
    d = s["durationInFrames"] / FPS
    chains.append(
        f"[{names.index(s['source'])}:a]atrim=start={a:.6f}:duration={d:.6f},asetpts=PTS-STARTPTS,"
        f"volume={gains[s['source']]:.2f}dB,afade=t=in:d={fade},afade=t=out:st={d - fade:.6f}:d={fade},"
        f"apad=whole_dur={d:.6f}[s{k}]"
    )
    labels.append(f"[s{k}]")
clean = f"highpass=f={A['highpassHz']},{A['denoise']},deesser=i=0.4,acompressor=threshold=-24dB:ratio=2.5:attack=10:release=150:makeup=2"
graph = ";".join(chains) + ";" + "".join(labels) + f"concat=n={len(labels)}:v=0:a=1,{clean}[v]"
raw = work / "voice.raw.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[v]", "-ar", "48000", "-ac", "1",
                "-c:a", "pcm_s24le", str(raw)], check=True)
m = loudness(raw)
ln = (f"loudnorm=I={A['targetLufs']}:TP={A['maxTruePeakDb']}:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
      f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", ln, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le",
                str(work / "voice.wav")], check=True)
final = loudness(work / "voice.wav")

render = {
    "fps": FPS, "width": edl["video"]["width"], "height": edl["video"]["height"], "durationInFrames": total_frames,
    "voice": "work/voice.wav",
    "theme": edl["video"].get("theme", {}),
    "segments": [{"src": sources[s["source"]]["video"], "fromFrame": s["fromFrame"], "durationInFrames": s["durationInFrames"],
                  "trimBefore": s["trimBefore"], "scale": s["scale"], "originX": s["originX"], "originY": s["originY"],
                  **({"personSrc": sources[s["source"]]["person"]} if sources[s["source"]].get("person") else {})}
                 for s in segments],
    "captions": captions,
    "overlays": overlays,
}
(work / "render.json").write_text(json.dumps(render, ensure_ascii=False, indent=1))

# Dades per a l'editor de vista prèvia (src/editor): tot ancorat a l'original perquè el navegador
# pugui recalcular la línia de temps quan es treu un tall o es mou un recurs.
editor = {
    "fps": FPS, "width": edl["video"]["width"], "height": edl["video"]["height"],
    "title": edl.get("title", {}).get("chosen", ""),
    "theme": edl["video"].get("theme", {}),
    "sources": {n: {"gainDb": round(g, 2), "person": bool(sources[n].get("person"))} for n, g in gains.items()},
    "ranges": [{"id": r["id"], "source": r["source"], "block": r["block"], "captions": r["captions"], "reason": r["reason"],
                "keep": r.get("keep", True)} for r in edl["ranges"]],
    "segments": [{"range": s["range"], "source": s["source"], "trimBefore": s["trimBefore"],
                  "durationInFrames": s["durationInFrames"], "scale": s.get("scale", 1.0),
                  "originX": s.get("originX", edl["video"]["width"] / 2), "originY": s.get("originY", edl["video"]["height"] * 0.4)}
                 for s in all_segments],
    "overlays": [{"id": o["id"], "type": o["type"], "props": o.get("_resolvedProps") or resolve_assets(o["props"]), "reason": o.get("reason", ""),
                  "anchor": None if "atOutputMs" in o else {"source": o["source"], "ms": o["anchorMs"]},
                  "atOutputMs": o.get("atOutputMs"), "durationMs": o["durationMs"], "offsetMs": o.get("offsetMs", 0),
                  "enabled": o.get("enabled", True)}
                 for o in edl["overlays"]],
}
(work / "editor.json").write_text(json.dumps(editor, ensure_ascii=False, indent=1))

lines = [f"Durada final: {total_frames / FPS:.2f} s ({total_frames} fotogrames a {FPS} fps)",
         f"Segments: {len(segments)} · Pàgines de subtítol: {len(captions)} · Recursos: {len(overlays)}",
         f"Veu: {final['input_i']} LUFS integrats, pic real {final['input_tp']} dBTP (objectiu {A['targetLufs']} / ≤ {A['maxTruePeakDb']})",
         f"Igualació de preses: " + ", ".join(f"{n} {g:+.1f} dB" for n, g in gains.items()),
         f"Llindar de silenci: " + ", ".join(f"{n} {s['thr']:.1f} dBFS (soroll {s['floor']:.1f})" for n, s in sources.items()),
         "", "SEGMENTS (sortida ← original)"]
for s in segments:
    lines.append(f"{s['fromFrame'] / FPS:6.2f}s  {s['durationInFrames'] / FPS:5.2f}s  ← {s['source']} {s['inMs'] / 1000:6.2f}–{s['outMs'] / 1000:6.2f}"
                 f"  escala {s['scale']:.2f}  {s['range']} {s['block']}")
lines += ["", "SUBTÍTOLS"]
for c in captions:
    lines.append(f"{c['fromFrame'] / FPS:6.2f}–{c['toFrame'] / FPS:6.2f}  " +
                 " ".join(("*" + w["text"] + "*") if w["highlight"] else w["text"] for w in c["words"]))
lines += ["", "RECURSOS"]
for o in overlays:
    lines.append(f"{o['fromFrame'] / FPS:6.2f}s  {o['durationInFrames'] / FPS:4.1f}s  {o['type']}  {json.dumps(o['props'], ensure_ascii=False)}")
(work / "muntatge.txt").write_text("\n".join(lines) + "\n")
print("\n".join(lines))
