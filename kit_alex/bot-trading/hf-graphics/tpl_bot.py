"""tpl_bot.py — the comp templates for bot-trading, each one the preset's look (presets/youtube/default):

  rec        a recording GRAPHIC: the real capture in a straight window on the light field, one eased zoom per target
             (never in its first or last second), the thing the line names MARKED (red box drawn clockwise for a figure,
             the yellow highlighter for a phrase), the corner cam's box kept clear when the creator is on camera.
  page       full-screen screen b-roll, the page IS the frame (creative-moves move 8): scan lines, a screen-blended
             blurred clone, a soft vignette, a slow push; rendered STEP_FPS=12 + grain.
  textlight  the bg-light TEXT punch-cut: one centred line per spoken beat, the power word in Playfair italic red with its
             underline drawn on, a light prop beside it.
  scene      a bg-dark full-screen SCENE (STEP_FPS=12 + the glow pass + grain): a title, then peers riding in, payoff
             popping; flows, stats, a logo hero, example charts (always labelled "Ejemplo ilustrativo").
  lower      a lower-third glass card (x120 y780 w900 h170) sliding in from the left (an alpha overlay).
"""
import json
from html import escape

from lib_bot import FPS, PIP, page, js_init

F = 1 / FPS


def _j(x):
    return json.dumps(x, ensure_ascii=False)


# ------------------------------------------------------------------ rec
def rec(cid, dur, src, aspect, *, still=False, url="", zooms=(), marks=(), tag=None, pip=False, dark_page=True, title=""):
    bar = 48
    L, T, R, B = 80, 70, 1840, 1010
    if pip:
        R = PIP[0] - 30
    cw = min(R - L, (B - T - bar) * aspect)
    ch = cw / aspect
    wl = L if pip else (1920 - cw) / 2
    wt = (1080 - (ch + bar)) / 2

    def pose(z, x=0.5, y=0.5):
        W, Hh = cw * z, ch * z
        lx = min(0, max(cw - W, cw / 2 - x * W))
        ty = min(0, max(ch - Hh, ch / 2 - y * Hh))
        return {"left": round(lx, 1), "top": round(ty, 1), "width": round(W, 1), "height": round(Hh, 1)}

    zs = sorted(zooms, key=lambda z: z.get("at", 0)) or [{"at": 0, "zoom": 1.0}]
    first = zs[0] if zs[0].get("at", 0) <= 0.05 else {"at": 0, "zoom": 1.0}
    moves = [z for z in zs if z is not first]
    js = js_init(dur)
    js += "float('#float', 0, DUR, 'subtle');\ncamera('.cam', 0, DUR, {scale: 1.00}, {scale: 1.03});\n"
    js += f"tl.set('.zm', {_j(pose(first['zoom'], first.get('x', .5), first.get('y', .5)))}, 0);\n"
    # one eased zoom per target, never in the take's first second nor its last (README § Recording sections)
    lo, hi = 1.0, dur - 1.0 - 18 * F
    for z in moves:
        at = min(max(z["at"], lo), hi)
        if at < lo - 1e-6:
            continue
        js += (f"tl.to('.zm', Object.assign({_j(pose(z['zoom'], z.get('x', .5), z.get('y', .5)))}, "
               f"{{duration: 18 * F, ease: 'power2.inOut'}}), {at:.3f});\n")
    mk = []
    for i, m in enumerate(marks):
        x, y, w, h = m["box"]
        at = max(m.get("at", 0.3), 0.15)
        if m.get("kind") == "mask":
            # a flat patch in the page's own colour over one glyph of the real capture (the creator's no-emoji rule)
            mk.append(f'<div class="mk" style="left:{x*100:.3f}%;top:{y*100:.3f}%;width:{w*100:.3f}%;height:{h*100:.3f}%;background:{m["color"]}"></div>')
            continue
        side = m.get("side") or ("r" if x + w / 2 > 0.6 else "l")
        pos = {"above": "ab", "below": "bl", "right": "rt"}.get(m.get("place"), "bl" if y < 0.62 else "ab")
        if pos == "rt":
            side = ""
        lab = (f'<div class="lab {side} {pos}" id="lab{i}">{escape(m["label"])}</div>' if m.get("label") else "")
        if m.get("kind", "box") == "hl":
            mk.append(f'<div class="mk" style="left:{x*100:.3f}%;top:{y*100:.3f}%;width:{w*100:.3f}%;height:{h*100:.3f}%">'
                      f'<div class="hl {"dk" if dark_page else "lt"}" id="hl{i}"></div>{lab}</div>')
            js += f"tl.set('#hl{i}', {{opacity: 0.9}}, {at:.3f});\ntl.to('#hl{i}', {{scaleX: 1, duration: 9 * F, ease: 'power2.out'}}, {at:.3f});\n"
            if m.get("label"):
                js += f"riseIn('#lab{i}', {at + 9 * F:.3f}, 22);\n"
        else:
            mk.append(f'<div class="mk" style="left:{x*100:.3f}%;top:{y*100:.3f}%;width:{w*100:.3f}%;height:{h*100:.3f}%">'
                      f'<div class="bx" id="bx{i}"><i class="e t"></i><i class="e r"></i><i class="e b"></i><i class="e l"></i></div>{lab}</div>')
            # the red box, drawn CLOCKWISE over 12 frames (top, right, bottom, left)
            for k, e in enumerate("trbl"):
                js += f"tl.set('#bx{i} .{e}', {{opacity: 1}}, {at + 3 * k * F:.4f});\n"
                js += f"tl.to('#bx{i} .{e}', {{scale: 1, duration: 3 * F, ease: 'none'}}, {at + 3 * k * F:.4f});\n"
            if m.get("label"):
                js += f"riseIn('#lab{i}', {at + 12 * F:.3f}, 22);\n"
        if m.get("to"):
            js += f"tl.to('#{'hl' if m.get('kind') == 'hl' else 'bx'}{i}, #lab{i}', {{opacity: 0, duration: 6 * F}}, {m['to']:.3f});\n"
    js += "H.finish();"
    media = (f'<img class="media" src="{src}"/>' if still else
             f'<video id="v" class="clip media" src="{src}" data-start="0" data-duration="{dur:.4f}" data-track-index="0" muted playsinline></video>')
    tagh = f'<div class="tag">{escape(tag)}</div>' if tag else ""
    body = (f'<div id="float"><div class="cam"><div class="win" style="left:{wl:.1f}px;top:{wt:.1f}px;width:{cw:.1f}px;height:{ch + bar:.1f}px">'
            f'<div class="bar"><i class="tl r"></i><i class="tl y"></i><i class="tl g"></i><div class="url">{escape(url)}</div>{tagh}</div>'
            f'<div class="vp" style="width:{cw:.1f}px;height:{ch:.1f}px"><div class="zm">{media}{"".join(mk)}</div></div>'
            f'</div></div></div>')
    css = f"""
.win{{position:absolute;border-radius:18px;overflow:hidden;background:#0f1014;box-shadow:0 30px 80px rgba(10,20,53,0.35),0 0 0 1px rgba(0,0,0,0.55);}}
.bar{{position:absolute;left:0;top:0;right:0;height:{bar}px;background:#e9eaee;border-bottom:1px solid rgba(10,20,53,0.10);}}
.tl{{position:absolute;top:17px;width:14px;height:14px;border-radius:7px;}}
.tl.r{{left:20px;background:#ff5f57;}} .tl.y{{left:42px;background:#febc2e;}} .tl.g{{left:64px;background:#28c840;}}
.url{{position:absolute;left:50%;top:9px;transform:translateX(-50%);height:30px;line-height:30px;padding:0 22px;border-radius:15px;background:#ffffff;
  color:#5b6070;font-weight:700;font-size:17px;white-space:nowrap;}}
.tag{{position:absolute;right:14px;top:9px;height:30px;line-height:30px;padding:0 16px;border-radius:15px;background:#0a1435;color:#e8f0ff;font-weight:700;font-size:16px;white-space:nowrap;}}
.vp{{position:absolute;left:0;top:{bar}px;overflow:hidden;background:#0f1014;}}
.zm{{position:absolute;left:0;top:0;}}
.media{{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:block;}}
.mk{{position:absolute;}}
.bx{{position:absolute;inset:-8px;}}
.bx .e{{position:absolute;background:#FF3B3B;opacity:0;box-shadow:0 0 5px rgba(255,59,59,0.55),0 0 12px rgba(255,59,59,0.25);}}
.bx .t{{left:0;top:0;right:0;height:4px;transform:scaleX(0);transform-origin:0 50%;}}
.bx .r{{right:0;top:0;bottom:0;width:4px;transform:scaleY(0);transform-origin:50% 0;}}
.bx .b{{left:0;bottom:0;right:0;height:4px;transform:scaleX(0);transform-origin:100% 50%;}}
.bx .l{{left:0;top:0;bottom:0;width:4px;transform:scaleY(0);transform-origin:50% 100%;}}
.hl{{position:absolute;inset:-3px -6px;background:#FFE14D;opacity:0;transform:scaleX(0);transform-origin:0 50%;border-radius:4px;}}
.hl.lt{{mix-blend-mode:multiply;}} .hl.dk{{mix-blend-mode:difference;}}
.lab{{position:absolute;white-space:nowrap;padding:9px 18px;border-radius:12px;background:#FF3B3B;color:#fff;font-weight:900;font-size:30px;letter-spacing:-0.6px;
  box-shadow:0 10px 26px rgba(0,0,0,0.35);opacity:0;}}
.lab.l{{left:-8px;}} .lab.r{{right:-8px;}} .lab.bl{{top:calc(100% + 18px);}} .lab.ab{{bottom:calc(100% + 18px);}} .lab.rt{{left:calc(100% + 18px);top:50%;margin-top:-26px;}}
"""
    return page(cid, title or f"{cid}: grabación ({url})", dur, "light", css, body, js)


# ------------------------------------------------------------------ page (move 8)
def page_broll(cid, dur, src, title=""):
    js = js_init(dur, step=True) + "camera('.cam', 0, DUR, {scale: 1.00}, {scale: 1.04});\nH.finish();"
    body = (f'<div class="cam"><video id="v" class="clip pg" src="{src}" data-start="0" data-duration="{dur:.4f}" data-track-index="0" muted playsinline></video>'
            f'<video id="v2" class="clip pg glow" src="{src}" data-start="0" data-duration="{dur:.4f}" data-track-index="1" muted playsinline></video></div>'
            '<div id="scan"></div><div id="edge"></div>')
    css = """
.pg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.glow{filter:blur(14px) brightness(1.25);opacity:0.16;mix-blend-mode:screen;}
#scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px);}
#edge{position:absolute;inset:0;background:radial-gradient(ellipse 85% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%);}
"""
    return page(cid, title or f"{cid}: b-roll de pantalla", dur, "dark", css, body, js)


# ------------------------------------------------------------------ textlight
PROPS = {
    "pie": '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#ffa12e"/><path class="slice" d="M50 50 L50 6 A44 44 0 0 1 88.1 28 Z" fill="#f2478f"/></svg>',
    "checkx": '<svg viewBox="0 0 200 100"><circle cx="50" cy="50" r="42" fill="#2fb7c9"/><path d="M30 52 L45 66 L72 36" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>'
              '<circle cx="150" cy="50" r="42" fill="#ff4d5e"/><path d="M134 34 L166 66 M166 34 L134 66" stroke="#fff" stroke-width="10" stroke-linecap="round"/></svg>',
    "plan": '<svg viewBox="0 0 100 100"><rect x="18" y="10" width="64" height="80" rx="8" fill="#0a1435"/><rect x="30" y="28" width="40" height="7" rx="3" fill="#e8eaef"/>'
            '<rect x="30" y="44" width="40" height="7" rx="3" fill="#e8eaef"/><rect x="30" y="60" width="26" height="7" rx="3" fill="#e8eaef"/></svg>',
    "chip": '<svg viewBox="0 0 100 100"><rect x="8" y="22" width="84" height="56" rx="12" fill="#1e48ff"/><path d="M28 50 L44 50 M56 50 L72 50" stroke="#fff" stroke-width="8" stroke-linecap="round"/></svg>',
}


def textlight(cid, dur, beats, prop=None, title=""):
    """beats: [{at, text, em?}] — one centred line each, stacked; the em word slams and its underline draws on."""
    n = len(beats)
    # the composed box (prop + lines) centred: the prop's ink starts 268 px above the first line, a line's ink ends 126 px in
    top0 = (611 - (n - 1) * 75) if prop else 540 - (n * 150) / 2
    rows, js = [], js_init(dur) + "for (const p of document.querySelectorAll('.ul path')) { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; }\nfloat('#float', 0, DUR, 'subtle');\ncamera('.cam', 0, DUR, {scale: 1.00}, {scale: 1.05});\n"
    for i, b in enumerate(beats):
        ws = []
        for k, wd in enumerate(b["text"].split()):
            em = b.get("em") and wd.strip(".,¿?¡!") == b["em"]
            wid = f"w{i}_{k}"
            ul = ('<svg class="ul" viewBox="0 0 100 16" preserveAspectRatio="none"><path d="M 4 8 L 96 8"/></svg>' if em else "")
            ws.append(f'<span class="w{" em" if em else ""}" id="{wid}">{escape(wd)}{ul}</span>')
            t = b["at"] + 0.06 * k
            if em:
                js += f"slam('#{wid}', {t:.3f});\ntl.set('#{wid} .ul', {{opacity: 1}}, {t + 0.12:.3f});\ntl.to('#{wid} .ul path', {{strokeDashoffset: 0, duration: 9 * F, ease: 'power2.out'}}, {t + 0.12:.3f});\n"
            else:
                js += f"riseIn('#{wid}', {t:.3f}, 27);\n"
        rows.append(f'<div class="ln" style="top:{top0 + i * 150:.0f}px">{" ".join(ws)}</div>')
    ph = ""
    if prop:
        ph = f'<div class="prop" id="prop" style="top:{top0 - 300:.0f}px">{PROPS[prop]}</div>'
        js += "pop('#prop', 0.0);\n"
        if prop == "pie":
            js += "tl.to('#prop .slice', {x: 9, y: -9, duration: 10 * F, ease: 'power2.out'}, 0.5);\n"
    js += "H.finish();"
    css = """
#content{position:absolute;inset:0;transform:scale(0.92);transform-origin:50% 50%;}
.ln{position:absolute;left:0;width:1920px;height:140px;line-height:140px;text-align:center;white-space:nowrap;font-weight:900;font-size:112px;letter-spacing:-4.5px;color:#0a1435;}
.ln .w{display:inline-block;opacity:0;position:relative;margin:0 10px;will-change:transform,opacity;}
.ln .em{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:118px;letter-spacing:-3px;color:#ff4d5e;}
.ul{position:absolute;left:0;bottom:4px;width:100%;height:16px;opacity:0;overflow:visible;}
.ul path{stroke:#ff4d5e;stroke-width:12;fill:none;stroke-linecap:round;}
.prop{position:absolute;left:810px;top:150px;width:300px;height:220px;opacity:0;}
.prop svg{width:100%;height:100%;overflow:visible;filter:drop-shadow(10px 12px 0 rgba(10,20,53,0.18));}
"""
    body = f'<div id="float"><div class="cam"><div id="content">{ph}{"".join(rows)}</div></div></div>'
    return page(cid, title or f"{cid}: punch-cut de texto (bg-light)", dur, "light", css, body, js)


# ------------------------------------------------------------------ scene (bg-dark)
SCENE_CSS = """
#content{position:absolute;inset:0;transform:scale(0.92);transform-origin:50% 50%;}
.eyebrow{position:absolute;left:0;width:100%;text-align:center;font-weight:700;font-size:23px;letter-spacing:3.4px;text-transform:uppercase;color:#8fa6d4;opacity:0;}
.hdl{position:absolute;left:0;width:100%;text-align:center;font-weight:900;font-size:78px;letter-spacing:-1.6px;color:#e8f0ff;opacity:0;line-height:1.05;}
.hdl .em{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;color:var(--amber);}
.note{position:absolute;right:70px;top:40px;font-weight:700;font-size:20px;letter-spacing:2px;text-transform:uppercase;color:#8fa6d4;opacity:0.85;}
.panel{position:absolute;background:linear-gradient(160deg,#12224e 0%,#0a1435 100%);border:2px solid rgba(96,146,255,0.42);border-radius:22px;
  box-shadow:0 26px 60px rgba(2,7,24,0.72),0 0 0 1px rgba(6,13,36,0.85),inset 0 2px 0 rgba(140,180,255,0.22);}
.node{position:absolute;opacity:0;text-align:center;}
.node .val{font-weight:900;font-size:66px;letter-spacing:-2px;line-height:1;}
.node .lbl{margin-top:14px;font-weight:700;font-size:30px;color:#e8f0ff;line-height:1.1;}
.node .sub{margin-top:8px;font-weight:400;font-size:22px;color:#8fa6d4;line-height:1.2;}
.node .ico{width:96px;height:96px;margin:0 auto;}
.node .ico img{width:100%;height:100%;object-fit:contain;}
.arw{position:absolute;opacity:0;overflow:visible;}
.arw path{stroke:#8fa6d4;stroke-width:6;fill:none;stroke-linecap:round;}
.arw .head{fill:#8fa6d4;}
.big{position:absolute;left:0;width:100%;text-align:center;font-weight:900;letter-spacing:-6px;color:#e8f0ff;opacity:0;line-height:1;}
.hero{position:absolute;opacity:0;}
.hero img{width:100%;height:100%;object-fit:contain;}
.glowc{position:absolute;inset:0;filter:blur(14px);opacity:0.30;}
"""


def _arrow(x1, y1, x2, y2, aid):
    w, h = abs(x2 - x1) + 40, abs(y2 - y1) + 40
    l, t = min(x1, x2) - 20, min(y1, y2) - 20
    return (f'<svg class="arw" id="{aid}" style="left:{l}px;top:{t}px;width:{w}px;height:{h}px" viewBox="0 0 {w} {h}">'
            f'<path d="M {x1 - l} {y1 - t} L {x2 - l} {y2 - t}"/><polygon class="head"/></svg>')


def scene_flow(cid, dur, title, steps, *, eyebrow="", pip=False, note="", title_at=0.0, arrows=True):
    """steps: [{at, value?|icon?, label, sub?, color?, payoff?}] — peers rise in left to right, the payoff pops."""
    n = len(steps)
    avail = 1920 - 2 * 110 - (PIP[2] + 60 if pip else 0)
    gap = 70
    cw = min(330, (avail - gap * (n - 1)) / n)
    total = cw * n + gap * (n - 1)
    x0 = 110 + (avail - total) / 2
    ytop = 520
    parts = []
    js = js_init(dur, step=True) + "float('#float', 0, DUR, 'subtle');\ncamera('.cam', 0, DUR, {scale: 1.00}, {scale: 1.05});\n"
    if eyebrow:
        parts.append(f'<div class="eyebrow" id="eb" style="top:300px">{escape(eyebrow)}</div>')
        js += f"riseIn('#eb', {title_at:.3f});\n"
    parts.append(f'<div class="hdl" id="hd" style="top:345px">{title}</div>')
    js += f"riseIn('#hd', {title_at:.3f});\n"
    palette = ["#ffa12e", "#a58fff", "#f2478f", "#2fb7c9", "#57c9f0"]
    k = min(1.0, cw / 330)
    for i, s in enumerate(steps):
        x = x0 + i * (cw + gap)
        col = s.get("color", palette[i % len(palette)])
        inner = ""
        if s.get("icon"):
            inner += f'<div class="ico"><img src="{s["icon"]}"/></div>'
        elif s.get("mark"):
            inner += f'<div class="val" style="color:{col};font-size:{54*k:.0f}px;letter-spacing:2px">{escape(s["mark"])}</div>'
        if s.get("value"):
            inner += f'<div class="val" style="color:{col};font-size:{66*k:.0f}px">{escape(s["value"])}</div>'
        inner += f'<div class="lbl" style="font-size:{30*k:.0f}px">{escape(s["label"])}</div>'
        if s.get("sub"):
            inner += f'<div class="sub" style="font-size:{22*k:.0f}px">{escape(s["sub"])}</div>'
        parts.append(f'<div class="panel node" id="n{i}" style="left:{x:.0f}px;top:{ytop}px;width:{cw:.0f}px;padding:{34*k:.0f}px {18*k:.0f}px;'
                     f'border-color:{col}88;box-shadow:0 26px 60px rgba(2,7,24,0.72),0 0 44px {col}55">{inner}</div>')
        js += (f"pop('#n{i}', {s['at']:.3f});\n" if s.get("payoff") else f"riseIn('#n{i}', {s['at']:.3f});\n")
        if i and arrows:
            ax1, ax2, ay = x - gap + 12, x - 28, ytop + 120
            parts.append(_arrow(ax1, ay, ax2, ay, f"a{i}"))
            js += f"drawOn('#a{i}', {max(0, s['at'] - 6 * F):.3f});\n"
    if note:
        parts.append(f'<div class="note">{escape(note)}</div>')
    js = js.replace("float('#float'", "arrow('.arw');\nfloat('#float'", 1) + "H.finish();"
    body = f'<div id="float"><div class="cam"><div id="content">{"".join(parts)}</div></div></div>'
    return page(cid, f"{cid}: escena (flujo, bg-dark)", dur, "dark", SCENE_CSS, body, js)


def scene_stat(cid, dur, value_to, caption, *, prefix="", suffix="", eyebrow="", count_at=0.2, count_dur=0.9, icon=None, pip=False):
    js = js_init(dur, step=True) + "float('#float', 0, DUR, 'medium');\ncamera('.cam', 0, DUR, {scale: 1.00}, {scale: 1.05});\n"
    parts = []
    if eyebrow:
        parts.append(f'<div class="eyebrow" id="eb" style="top:300px">{escape(eyebrow)}</div>')
        js += "riseIn('#eb', 0);\n"
    dy = 110 if icon else 0
    parts.append(f'<div class="big" id="num" style="top:{380 + dy}px;font-size:220px">{escape(prefix)}0{escape(suffix)}</div>')
    js += (f"riseIn('#num', 0.05, 54);\ncountUp('#num', {count_at:.3f}, {count_dur:.3f}, {value_to}, "
           f"v => {_j(prefix)} + v.toLocaleString('de-DE') + {_j(suffix)});\n")
    parts.append(f'<div class="hdl" id="cap" style="top:{640 + dy}px;font-size:56px">{caption}</div>')
    js += f"riseIn('#cap', {count_at + count_dur:.3f});\n"
    if icon:
        parts.append(f'<div class="hero" id="ic" style="left:860px;top:{150 + dy}px;width:200px;height:200px"><img src="{icon}"/></div>')
        js += "pop('#ic', 0.0);\n"
    js += "H.finish();"
    body = f'<div id="float"><div class="cam"><div id="content">{"".join(parts)}</div></div></div>'
    return page(cid, f"{cid}: escena (cifra, bg-dark)", dur, "dark", SCENE_CSS, body, js)


def scene_hero(cid, dur, img, lines, *, img_w=360, img_at=0.0, glow="#d97757"):
    """A logo / prop hero centred, the lines rising under it on their beats: [{at, html}]."""
    js = js_init(dur, step=True) + "float('#float', 0, DUR, 'medium');\ncamera('.cam', 0, DUR, {scale: 1.00}, {scale: 1.05});\n"
    top = 270
    parts = [f'<div class="hero" id="hero" style="left:{960 - img_w/2:.0f}px;top:{top}px;width:{img_w}px;height:{img_w}px">'
             f'<img class="glowc" src="{img}"/><img src="{img}" style="position:absolute;inset:0"/></div>']
    js += f"pop('#hero', {img_at:.3f});\n"
    for i, l in enumerate(lines):
        parts.append(f'<div class="hdl" id="l{i}" style="top:{top + img_w + 60 + i * 96}px">{l["html"]}</div>')
        js += (f"slam('#l{i}', {l['at']:.3f});\n" if l.get("slam") else f"riseIn('#l{i}', {l['at']:.3f});\n")
    js += "H.finish();"
    body = f'<div id="float"><div class="cam"><div id="content">{"".join(parts)}</div></div></div>'
    return page(cid, f"{cid}: escena (héroe, bg-dark)", dur, "dark", SCENE_CSS, body, js)


def scene_words(cid, dur, lines, *, prop_svg=None, prop_at=0.0):
    """Big type on the dark field, each line on its beat ([{at, html, size?, slam?}]), an optional solid prop."""
    js = js_init(dur, step=True) + "float('#float', 0, DUR, 'subtle');\ncamera('.cam', 0, DUR, {scale: 1.00}, {scale: 1.05});\n"
    n = len(lines)
    sizes = [l.get("size", 120) for l in lines]
    tot = sum(s * 1.1 for s in sizes) + (240 if prop_svg else 0)
    y = 540 - tot / 2
    parts = []
    if prop_svg:
        parts.append(f'<div class="hero" id="pr" style="left:860px;top:{y:.0f}px;width:200px;height:200px">{prop_svg}</div>')
        js += f"pop('#pr', {prop_at:.3f});\n"
        y += 240
    for i, l in enumerate(lines):
        parts.append(f'<div class="big" id="l{i}" style="top:{y:.0f}px;font-size:{sizes[i]}px;letter-spacing:{-sizes[i]/40:.1f}px">{l["html"]}</div>')
        js += (f"slam('#l{i}', {l['at']:.3f});\n" if l.get("slam") else f"riseIn('#l{i}', {l['at']:.3f}, {max(22, round(22 * sizes[i] / 90))});\n")
        y += sizes[i] * 1.1
    js += "H.finish();"
    body = f'<div id="float"><div class="cam"><div id="content">{"".join(parts)}</div></div></div>'
    return page(cid, f"{cid}: escena (texto, bg-dark)", dur, "dark", SCENE_CSS, body, js)


# ------------------------------------------------------------------ charts (bg-dark, ejemplo ilustrativo)
def _series(seed, n, start, drift, vol):
    import math
    out, v, s = [], start, seed
    for i in range(n):
        s = (s * 9301 + 49297) % 233280
        r = s / 233280 - 0.5
        v = v + drift(i) + r * vol
        out.append(v)
    return out


def _ma(xs, k):
    return [sum(xs[max(0, i - k + 1):i + 1]) / (i - max(0, i - k + 1) + 1) for i in range(len(xs))]


def scene_chart(cid, dur, mode, title, caption, *, pip=False, beats=None):
    """mode: cruce | reversion | backtest — a price line drawing on with its moving averages and the signals."""
    import math
    W, Hh = (1560 if not pip else 1340), 520
    x0, y0 = (1920 - W) / 2 if not pip else 110, 300
    n = 120
    if mode == "cruce":
        price = _series(7, n, 50, lambda i: 0.35 * math.sin(i / 18) + (0.25 if i > 60 else -0.1), 2.2)
    elif mode == "reversion":
        price = _series(11, n, 60, lambda i: (-2.2 if 48 <= i < 58 else (1.3 if 58 <= i < 75 else 0)), 1.6)
    else:
        price = _series(5, n, 40, lambda i: 0.3 * math.sin(i / 14) + 0.15, 2.0)
    fast, slow = _ma(price, 8), _ma(price, 30)
    lo, hi = min(price + slow) - 4, max(price + slow) + 4
    X = lambda i: i / (n - 1) * W
    Y = lambda v: Hh - (v - lo) / (hi - lo) * Hh
    path = lambda s: "M " + " L ".join(f"{X(i):.1f} {Y(v):.1f}" for i, v in enumerate(s))
    sig = []
    if mode in ("cruce", "backtest"):
        for i in range(12 if mode == "cruce" else 31, n):
            if (fast[i - 1] - slow[i - 1]) * (fast[i] - slow[i]) < 0:
                sig.append((i, "COMPRA" if fast[i] > slow[i] else "VENDE"))
    elif mode == "reversion":
        sig = [(57, "COMPRA"), (76, "VENDE")]
    js = js_init(dur, step=True) + "float('#float', 0, DUR, 'subtle');\ncamera('.cam', 0, DUR, {scale: 1.00}, {scale: 1.04});\n"
    draw_end = dur * 0.55
    marks = []
    seg = [0.0]
    for i in range(1, n):
        seg.append(seg[-1] + math.hypot(X(i) - X(i - 1), Y(price[i]) - Y(price[i - 1])))
    for k, (i, kind) in enumerate(sig[:5]):
        up = kind == "COMPRA"
        cx, cy = X(i), Y(price[i]) + (34 if up else -34)
        col = "#2fb7c9" if up else "#ff4d5e"
        marks.append(f'<g class="sg" id="s{k}" style="opacity:0"><polygon points="{cx-14:.0f},{cy + (12 if up else -12):.0f} {cx+14:.0f},{cy + (12 if up else -12):.0f} {cx:.0f},{cy + (-12 if up else 12):.0f}" fill="{col}"/>'
                     f'<text x="{cx:.0f}" y="{cy + (48 if up else -30):.0f}" fill="{col}" font-size="26" font-weight="900" text-anchor="middle" font-family="Inter">{kind}</text></g>')
        js += f"pop('#s{k}', {0.3 + draw_end * seg[i] / seg[-1] + 2 * F:.3f});\n"   # once the price line has reached it
    extra = ""
    if mode == "backtest":
        extra = (f'<line x1="{X(84):.0f}" y1="-10" x2="{X(84):.0f}" y2="{Hh + 10}" stroke="#8fa6d4" stroke-width="3" stroke-dasharray="10 8"/>'
                 f'<text x="{X(84) + 14:.0f}" y="30" fill="#e8f0ff" font-size="24" font-weight="900" font-family="Inter">MOMENTO ELEGIDO</text>'
                 f'<text x="{X(84) + 14:.0f}" y="60" fill="#8fa6d4" font-size="21" font-weight="700" font-family="Inter">lo que pasó después</text>'
                 f'<text x="14" y="30" fill="#8fa6d4" font-size="24" font-weight="700" font-family="Inter">LO QUE VE EL BOT</text>')
    svg = (f'<svg class="ch" style="left:{x0:.0f}px;top:{y0}px;width:{W}px;height:{Hh}px" viewBox="0 0 {W} {Hh}" overflow="visible">'
           f'<rect x="0" y="0" width="{W}" height="{Hh}" rx="18" fill="rgba(18,34,78,0.55)" stroke="rgba(96,146,255,0.35)" stroke-width="2"/>{extra}'
           f'<path class="ln p" d="{path(price)}" stroke="#e8f0ff" stroke-width="4" fill="none"/>'
           + ("" if mode == "reversion" else f'<path class="ln f" d="{path(fast)}" stroke="#ffa12e" stroke-width="5" fill="none"/>')
           + f'<path class="ln s" d="{path(slow)}" stroke="#a58fff" stroke-width="5" fill="none"/>{"".join(marks)}</svg>')
    leg = ('<div class="leg"><span><i style="background:#e8f0ff"></i>Precio</span>'
           + ("" if mode == "reversion" else '<span><i style="background:#ffa12e"></i>Media rápida</span>')
           + f'<span><i style="background:#a58fff"></i>{"Media" if mode == "reversion" else "Media lenta"}</span></div>')
    js += ("for (const p of document.querySelectorAll('.ln')) { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; }\n"
           f"tl.to('.ln', {{strokeDashoffset: 0, duration: {draw_end:.3f}, ease: 'none'}}, 0.3);\n"
           "riseIn('#ti', 0);\nriseIn('#cap', 0.3);\n")
    js += "H.finish();"
    css = SCENE_CSS + """
.ch{position:absolute;overflow:visible;}
.ti{position:absolute;left:110px;top:150px;font-weight:900;font-size:64px;letter-spacing:-1.5px;color:#e8f0ff;opacity:0;}
.ex{position:absolute;right:120px;top:172px;font-weight:700;font-size:22px;letter-spacing:2.6px;text-transform:uppercase;color:#8fa6d4;}
.cap{position:absolute;left:110px;top:860px;font-weight:700;font-size:38px;color:#e8f0ff;opacity:0;}
.leg{position:absolute;left:110px;top:240px;font-weight:700;font-size:24px;color:#8fa6d4;}
.leg span{margin-right:36px;} .leg i{display:inline-block;width:28px;height:6px;border-radius:3px;margin-right:10px;vertical-align:middle;}
"""
    if pip:
        css += ".ex{right:auto;left:110px;top:112px;}\n"
    body = (f'<div id="float"><div class="cam"><div id="content"><div class="ti" id="ti">{escape(title)}</div>'
            f'<div class="ex">Ejemplo ilustrativo</div>{leg}{svg}<div class="cap" id="cap">{escape(caption)}</div></div></div></div>')
    return page(cid, f"{cid}: escena (gráfico de ejemplo, bg-dark)", dur, "dark", css, body, js)


def scene_bars(cid, dur, title, caption, bars, *, win_at=1.4):
    js = js_init(dur, step=True) + "float('#float', 0, DUR, 'subtle');\ncamera('.cam', 0, DUR, {scale: 1.00}, {scale: 1.04});\nriseIn('#ti', 0);\n"
    mx = max(b["value"] for b in bars)
    parts = [f'<div class="ti" id="ti">{escape(title)}</div><div class="ex">Ejemplo ilustrativo</div>']
    cols = ["var(--amber)", "var(--lav)", "var(--teal)"]
    for i, b in enumerate(bars):
        h = 420 * b["value"] / mx
        x = 520 + i * 320
        parts.append(f'<div class="bar" id="b{i}" style="left:{x}px;top:{760 - h:.0f}px;height:{h:.0f}px;background:{cols[i % 3]};box-shadow:0 0 24px {cols[i % 3]}"></div>'
                     f'<div class="bl" style="left:{x - 40}px">{escape(b["label"])}</div>')
        js += f"tl.fromTo('#b{i}', {{scaleY: 0}}, {{scaleY: 1, duration: 12 * F, ease: 'power2.out', immediateRender: false}}, {0.3 + 0.25 * i:.3f});\ntl.set('#b{i}', {{opacity: 1}}, {0.3 + 0.25 * i:.3f});\n"
    parts.append('<div class="win" id="win">aquí va el dinero</div>')
    js += f"slam('#win', {win_at:.3f});\nriseIn('#cap', {win_at + 0.3:.3f});\nH.finish();"
    parts.append(f'<div class="cap" id="cap">{escape(caption)}</div>')
    css = SCENE_CSS + """
.ti{position:absolute;left:110px;top:150px;font-weight:900;font-size:64px;letter-spacing:-1.5px;color:#e8f0ff;opacity:0;}
.ex{position:absolute;right:120px;top:172px;font-weight:700;font-size:22px;letter-spacing:2.6px;text-transform:uppercase;color:#8fa6d4;}
.bar{position:absolute;width:200px;border-radius:14px 14px 4px 4px;transform-origin:50% 100%;opacity:0;}
.bl{position:absolute;top:790px;width:280px;text-align:center;font-weight:900;font-size:40px;color:#e8f0ff;}
.win{position:absolute;left:470px;top:250px;padding:12px 26px;border-radius:14px;background:#2ff58a;color:#04220f;font-weight:900;font-size:34px;opacity:0;box-shadow:0 0 24px rgba(47,245,138,0.6),0 0 48px rgba(47,245,138,0.28);}
.cap{position:absolute;left:110px;top:900px;width:1700px;text-align:center;font-weight:700;font-size:38px;color:#e8f0ff;opacity:0;}
"""
    body = f'<div id="float"><div class="cam"><div id="content">{"".join(parts)}</div></div></div>'
    return page(cid, f"{cid}: escena (barras de ejemplo, bg-dark)", dur, "dark", css, body, js)


# ------------------------------------------------------------------ lower third (alpha overlay)
def lower(cid, dur, eyebrow, head):
    js = js_init(dur) + "float('#float', 0, DUR, 'subtle');\nslideIn('#card', 0.0, 'left');\nexit('#card');\nH.finish();"
    css = """
#card{position:absolute;left:120px;top:780px;width:900px;height:170px;opacity:0;isolation:isolate;border-radius:28px;padding:30px 40px;
  background:linear-gradient(150deg,rgba(255,255,255,0.20) 0%,rgba(255,255,255,0.07) 38%,rgba(255,255,255,0.03) 62%,rgba(255,255,255,0.11) 100%),rgba(14,16,24,0.20);
  box-shadow:0 24px 60px rgba(0,0,0,0.26),inset 0 1.5px 0 rgba(255,255,255,0.50),inset 0 -1px 0 rgba(255,255,255,0.16),inset 0 0 26px rgba(255,255,255,0.07);}
#card .eb{font-weight:700;font-size:23px;letter-spacing:3.4px;text-transform:uppercase;color:rgba(255,255,255,0.74);text-shadow:0 1px 2px rgba(0,0,0,0.4);}
#card .hd{margin-top:12px;font-weight:900;font-size:44px;letter-spacing:-1px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.40),0 0 14px rgba(0,0,0,0.28);}
#card .dot{display:inline-block;width:12px;height:12px;border-radius:6px;background:#ff4d5e;margin-right:12px;box-shadow:0 0 20px rgba(255,77,94,0.62),0 0 40px rgba(255,77,94,0.30);}
"""
    body = f'<div id="float"><div id="card"><div class="eb"><span class="dot"></span>{escape(eyebrow)}</div><div class="hd">{escape(head)}</div></div></div>'
    html = page(cid, f"{cid}: lower-third (overlay)", dur, "dark", css, body, js)
    # an overlay has no field: strip the dark field's layers back out
    s = html.read_text(encoding="utf-8").replace('<div id="base"></div><div id="grid"></div><div id="lift"></div><div id="vig"></div>', "")
    s = s.replace("<body style=\"margin:0;background:#000;\">", "<body style=\"margin:0;background:transparent;\">")
    html.write_text(s, encoding="utf-8")
    return html
