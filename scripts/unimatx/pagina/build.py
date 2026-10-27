import re, sys, html
sys.path.insert(0, sys.argv[1])
from data import AB, SERIE

def mk(s, cls="pill"):
    s = html.escape(s, quote=False).replace("&lt;br&gt;", "<br>")
    return re.sub(r"\*\*(.+?)\*\*", rf'<mark class="{cls}">\1</mark>', s)

def plain(s):
    return s.replace("**", "")

def tile(t):
    k = t["k"]
    if k == "b":
        notif = ""
        if t.get("notif"):
            h, b = t["notif"]
            notif = f'<div class="ntf"><b><i></i>{html.escape(h)}</b>{html.escape(b)}<small>avís fictici de la sèrie</small></div>'
        sub = f'<span>{html.escape(t["sub"])}</span>' if t.get("sub") else ""
        end = '<div class="p2">PART 2</div>' if t.get("end") else ""
        return (f'<figure class="fr fr-b" aria-hidden="true"><div class="chip">{html.escape(t["chip"])}{sub}</div>{notif}'
                f'<div class="win"></div><div class="cap">{mk(t["cap"], "kw")}</div>{end}</figure>')
    phone = ""
    if t.get("phone"):
        rows = "".join(f"<li>{html.escape(r)}</li>" for r in t["phone"][1:])
        phone = f'<div class="ph"><b>{html.escape(t["phone"][0])}</b><ul>{rows}</ul></div>'
    big = " big" if t.get("big") else ""
    return f'<figure class="fr fr-{k}" aria-hidden="true"><div class="ttl{big}">{mk(t["t"])}</div><div class="iso"></div>{phone}</figure>'

RATE = {"ab": (3.2, 0.35), "serie": (2.45, 0.55)}  # paraules/s i pausa per pla, mesurats als dos vídeos de referència

def retime(s, kind):
    r, pause = RATE[kind]
    t, out = 0.0, []
    for tc, vis, veu, txt in s["beats"]:
        out.append((f"{int(t // 60)}:{int(t % 60):02d}", vis, veu, txt))
        t += len(veu.split()) / r + pause
    s["beats"] = out
    s["dur"] = f"≈ {round(t / 5) * 5} s" + (" · part 1 de 2" if kind == "serie" else "")

def script(s, kind):
    retime(s, kind)
    vo = " ".join(b[2] for b in s["beats"])
    words = len(vo.split())
    tiles = "".join(tile(t) for t in s["tiles"])
    col4 = "Text en pantalla" if kind == "ab" else "Xip, targeta o rètol"
    rows = []
    for tc, vis, veu, txt in s["beats"]:
        t4 = mk(txt.replace(" / ", "<br>")) if kind == "ab" else html.escape(txt)
        rows.append(f'<div class="row"><div class="tc">{tc}</div><div class="vis">{html.escape(vis)}</div>'
                    f'<div class="veu">{html.escape(veu)}</div><div class="osd">{t4 or "<span class=dash>—</span>"}</div></div>')
    notes = "".join(f"<li>{html.escape(n)}</li>" for n in s.get("notes", []))
    p2 = f'<p class="p2txt"><b>Part 2.</b> {html.escape(s["part2"])}</p>' if s.get("part2") else ""
    meta = f'<span>{html.escape(s["who"])}</span><span>{s["dur"]}</span><span>{words} paraules de veu</span>'
    if s.get("cta"):
        meta += f'<span>CTA: comenta {s["cta"]}</span>'
    return f'''
<article class="sc" id="{s['code'].lower()}">
  <header class="sch"><span class="code">{s['code']}</span><h3>{html.escape(s['title'])}</h3>
    <button class="copy" type="button" data-vo="{html.escape(vo)}">Copia la veu en off</button></header>
  <div class="meta">{meta}</div>
  <div class="body">
    <div class="media"><video controls playsinline preload="metadata" poster="v/{s['code']}.jpg" src="v/{s['code']}.mp4"></video>
      <div class="vnote">Veu: ElevenLabs · Laura</div></div>
    <div class="tbl" role="table" aria-label="Guió {s['code']}">
      <div class="row hd" role="row"><div>Temps</div><div>Imatge</div><div>Veu en off</div><div>{col4}</div></div>
      {''.join(rows)}
    </div>
  </div>
  {p2}
  {f'<ul class="nts">{notes}</ul>' if notes else ''}
</article>'''

tpl = open(sys.argv[2]).read()
nav = "".join(f'<a href="#{s["code"].lower()}"><b>{s["code"]}</b>{html.escape(s["title"])}</a>' for s in AB + SERIE)
out = (tpl.replace("{{NAV}}", nav)
          .replace("{{AB}}", "".join(script(s, "ab") for s in AB))
          .replace("{{SERIE}}", "".join(script(s, "serie") for s in SERIE)))
open(sys.argv[3], "w").write(out)
print(len(out))
