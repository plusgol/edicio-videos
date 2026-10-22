#!/usr/bin/env python3
"""preview_kit.py — the HLS preview page for the kit build: chapters at the title cards, and the voice-over text the
creator has to record shown under the video while its (still silent) block plays.

  python3 preview_kit.py <preview_tpl.html> <out index.html>
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import lib_bot as L  # noqa: E402

names = {"I": "I · El prompt", "II": "II · El truco", "III": "III · Cuentas de fondeo", "IV": "IV · Backtesting",
         "V": "V · 24 horas después", "VI": "VI · Así funciona"}
labels = {"vo-intro": "Intro", "vo-P": "P · El truc del prompt", "vo-A": "A · El pla de Claude", "vo-B": "B · Estratègies i plataformes",
          "vo-D": "D · Què fa Claude Code", "vo-C": "C · El que van mostrar les dades", "vo-G": "G · Compte de fondeig: el 75 %",
          "vo-F": "F · Així funciona el bot"}
edl = {r["id"]: r for r in json.load(open(L.SRC / "edl.json"))["ranges"]}
chap = [{"t": 0, "name": "Intro"}]
vo = []
for s in L.SEGS:
    rid = s.get("_range", "")
    if rid.startswith("titulo-"):
        chap.append({"t": round(s["t0"], 2), "name": names[rid.split("-", 1)[1]]})
    elif rid in labels and not any(v["label"] == labels[rid] for v in vo):
        a, b = L.span(rid)
        vo.append({"a": round(a, 2), "b": round(b, 2), "label": labels[rid], "text": edl[rid]["captions"]})
chap.append({"t": round(L.span("e1")[0], 2), "name": "Final"})
data = {"total": round(L.DURATION, 2), "chapters": chap, "vo": vo}
Path(sys.argv[2]).write_text(open(sys.argv[1]).read().replace("__DATA__", json.dumps(data, ensure_ascii=False)), encoding="utf-8")
print(json.dumps(chap, ensure_ascii=False))
