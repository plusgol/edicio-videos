"""Aplica a l'EDL la revisió desada a l'editor de vista prèvia (document «revisio/actual» de l'artefacte).

Ús: python3 -I scripts/aplica_revisio.py projectes/<nom> <revisio.json>
     (<revisio.json>: el document tal com el desa l'editor, p. ex. baixat amb ArtifactData get + out_dir)

Canvia a edl.json: recursos visibles o amagats, textos, inici (offsetMs) i durada; talls que es queden o surten.
Els comentaris no s'apliquen sols: s'imprimeixen perquè Claude els llegeixi i decideixi.
"""
import json
import sys
from pathlib import Path

proj, rev_path = Path(sys.argv[1]), Path(sys.argv[2])
doc = json.loads(rev_path.read_text())
rev = doc.get("revision", doc)
edl_path = proj / "edl.json"
edl = json.loads(edl_path.read_text())

canvis, comentaris = [], []
for o in edl["overlays"]:
    r = rev.get("overlays", {}).get(o["id"])
    if not r:
        continue
    for key in ("enabled", "offsetMs", "durationMs"):
        if key in r and r[key] != o.get(key, {"enabled": True, "offsetMs": 0}.get(key, o.get(key))):
            canvis.append(f"{o['id']}: {key} {o.get(key)} → {r[key]}")
            o[key] = r[key]
    if "props" in r and r["props"] != o["props"]:
        # Les rutes d'emojis i logos ja resoltes (assets/...) no substitueixen les originals (emoji:/logo:).
        props = {k: v for k, v in r["props"].items() if not (isinstance(v, str) and v.startswith(("assets/", "./assets/")))}
        props = {k: v for k, v in props.items() if k not in ("faceX", "faceY", "faceH")}
        new = {**o["props"], **props}
        if new != o["props"]:
            canvis.append(f"{o['id']}: textos {json.dumps(o['props'], ensure_ascii=False)} → {json.dumps(new, ensure_ascii=False)}")
            o["props"] = new
    if r.get("comment"):
        comentaris.append(f"[gràfic {o['id']}] {r['comment']}")
for rg in edl["ranges"]:
    r = rev.get("ranges", {}).get(rg["id"])
    if not r:
        continue
    if r.get("keep", True) != rg.get("keep", True):
        canvis.append(f"{rg['id']}: {'es queda' if r['keep'] else 'fora'} («{rg['captions'][:50]}…»)")
        rg["keep"] = r["keep"]
    if r.get("comment"):
        comentaris.append(f"[tall {rg['id']}] {r['comment']}")
if rev.get("note"):
    comentaris.append(f"[general] {rev['note']}")

edl_path.write_text(json.dumps(edl, ensure_ascii=False, indent=1))
print(f"Estat de la revisió: {doc.get('status', '?')} · desada {doc.get('savedAt', '?')}")
print("\nCANVIS APLICATS" if canvis else "\nCap canvi automàtic.")
print("\n".join(f"- {c}" for c in canvis))
print("\nCOMENTARIS PER A CLAUDE" if comentaris else "\nSense comentaris.")
print("\n".join(f"- {c}" for c in comentaris))
