"""Pàgina de vista prèvia del vídeo sencer (HLS) amb capítols i el text de la veu en off que toca en cada moment.

Ús: python3 -I scripts/preview_page.py projectes/<nom> scripts/preview_tpl.html  → projectes/<nom>/out/preview/index.html
(el vídeo va a out/preview/hls/: playlist.txt (= playlist.m3u8) + init.mp4 + seg_NNN.mp4)
"""
import json, re, sys
proj = sys.argv[1]
r = json.load(open(f"{proj}/work/render.json"))
edl = json.load(open(f"{proj}/edl.json"))
fps = r["fps"]; total = r["durationInFrames"] / fps
chap = [{"t": round(o["fromFrame"] / fps, 2), "name": f'{o["props"]["numeral"]} · {o["props"]["title"]}'} for o in r["overlays"] if o["type"] == "SectionNumeral"]
chap = [{"t": 0, "name": "Intro"}] + chap + [{"t": 0, "name": "Final"}]
# Final = primer segment del bloc final
segs = [l for l in open(f"{proj}/work/muntatge.txt").read().split("\n") if "←" in l]
def seg_start(rid):
    for l in segs:
        if re.search(rf"\s{re.escape(rid)}\s", l): return float(l.split("s")[0])
chap[-1]["t"] = seg_start("h2")
vo = []
labels = {"vo-intro": "Intro", "vo-A": "A · L'avís de Claude", "vo-B": "B · Les tres hipòtesis", "vo-D": "D · Claude Code treballant sol",
          "vo-C": "C · El que van mostrar les dades", "vo-F": "F · Així funciona el bot"}
for rg in edl["ranges"]:
    if rg["source"] != "vo": continue
    starts = [float(l.split("s")[0]) for l in segs if re.search(rf"\s{re.escape(rg['id'])}\s", l)]
    durs = [float(l.split()[1].rstrip("s")) for l in segs if re.search(rf"\s{re.escape(rg['id'])}\s", l)]
    a = min(starts); b = max(s + d for s, d in zip(starts, durs))
    vo.append({"a": round(a, 2), "b": round(b, 2), "label": labels[rg["id"]], "text": rg["captions"]})
data = {"total": round(total, 2), "chapters": chap, "vo": vo}
page = open(sys.argv[2]).read().replace("__DATA__", json.dumps(data, ensure_ascii=False))
open(f"{proj}/out/preview/index.html", "w").write(page)
print(json.dumps(data, ensure_ascii=False)[:600])
