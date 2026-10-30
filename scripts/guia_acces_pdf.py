"""Guia d'accés per a centres (PDF), l'acompanyant escrit de la demo per a centres, amb els codis d'invitació.

Ús: python3 scripts/guia_acces_pdf.py projectes/demo-escoles

Llegeix work/codis-invitacio.txt (un codi per línia; és a work/ perquè no vagi mai al repositori, que és públic) i
les fases de retols.json, i escriu out/UniMatx-guia-acces-centres.pdf (A4, dues pàgines) i una vista PNG de cada
pàgina a work/guia/. Tot el que diu surt de la demo: el que es veu a la pantalla de la gravació i el que s'hi explica.
Lletra i colors d'UniMatx (Poppins; brand/unimatx.ts → UNI); es dibuixa en HTML i el Chromium de Playwright en fa el PDF.
"""
import asyncio
import html
import json
import subprocess
import sys
from pathlib import Path

from playwright.async_api import async_playwright

E = html.escape

LOGO = """<svg viewBox="0 0 100 100" class="{cls}"><rect x="2" y="2" width="96" height="96" rx="24" fill="#FAFBF4" stroke="#E6E8EE" stroke-width="1.5"/>
<polygon points="14,36 50,22 86,36 50,50" fill="#16235A"/><path d="M30 42 L30 52 Q50 60 70 52 L70 42 L50 50 Z" fill="#16235A"/>
<line x1="80" y1="38" x2="80" y2="56" stroke="#5FA89A" stroke-width="2.5"/><polygon points="77,56 83,56 82,63 78,63" fill="#5FA89A"/>
<circle cx="35" cy="70" r="11" fill="none" stroke="#16235A" stroke-width="4.5"/><circle cx="65" cy="70" r="11" fill="none" stroke="#16235A" stroke-width="4.5"/>
<path d="M46 69 Q50 65 54 69" fill="none" stroke="#16235A" stroke-width="4"/><line x1="16" y1="67" x2="24" y2="68" stroke="#5FA89A" stroke-width="4"/>
<line x1="76" y1="68" x2="84" y2="67" stroke="#5FA89A" stroke-width="4"/></svg>"""

STEPS = [
    ("unimatx.cat", "Obriu <b>unimatx.cat</b> i cliqueu <b>«Compte»</b>, a dalt."),
    ("El vostre correu", "Escriviu el correu del centre o el personal, accepteu les condicions i cliqueu <b>«Envia'm el codi»</b>. No cal contrasenya."),
    ("Codi al correu", "Rebreu un codi de <b>6 xifres</b> d'acces@auth.unimatx.cat. Escriviu-lo i cliqueu <b>«Verifica el codi i entra»</b>. Caduca als 10 minuts."),
    ("El meu centre", "A <b>«El meu compte»</b>, cliqueu <b>«Obre el meu centre»</b>: hi veureu l'alumnat, el progrés i els informes compartits."),
]

GETS = [
    ("Informe en PDF", "Es genera dins del compte en uns 5 minuts després d'acabar el test. Tres versions:",
     ["<b>Curt</b> · 20–25 pàgines", "<b>Normal</b> · unes 50 pàgines", "<b>Extens</b> · de 70 a més de 100 pàgines"]),
    ("El meu centre", "El tauler del professorat, amb l'alumnat del centre:",
     ["Qui no ha començat, qui és en curs i qui ha acabat", "Els informes que cada alumne decideix compartir", "La llista exportable en CSV"]),
    ("Catàleg gratuït", "Tots els graus, també per àmbit (social, científic, artístic), amb una fitxa de cada un:",
     ["Nota de tall, places i assignatures", "Per què pot encaixar i què cal revisar", "Sortides i inserció laboral (dades d'AQU Catalunya)"]),
]

CSS = """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; font-family: Poppins, sans-serif; color: #151833; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; padding: 13mm 14mm 11mm; position: relative; overflow: hidden; background: #FFFFFF; page-break-after: always; }
.page:last-child { page-break-after: auto; }
.top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5.5mm; }
.brand { display: flex; align-items: center; gap: 3mm; font-weight: 700; font-size: 17pt; letter-spacing: -0.02em; }
.brand .m { color: #4A6CF0; }
.logo { width: 11mm; height: 11mm; }
.tag { font-size: 8.5pt; font-weight: 600; color: #4B3FD6; background: #EEF0FE; border-radius: 99px; padding: 1.6mm 4mm; }
.hero { background: linear-gradient(125deg, #3D2FB8 0%, #4B3FD6 45%, #5B6CF0 100%); border-radius: 6mm; color: #fff; padding: 7mm 8.5mm 6.5mm; }
.eyebrow { font-size: 8pt; font-weight: 700; letter-spacing: 0.18em; color: #6EE7A0; }
h1 { font-size: 23pt; line-height: 1.12; margin: 2mm 0 2.6mm; font-weight: 800; letter-spacing: -0.02em; }
.hero p { margin: 0; font-size: 10pt; line-height: 1.5; color: #E6E8FF; max-width: 150mm; }
.chips { display: flex; gap: 2.5mm; margin-top: 4.5mm; flex-wrap: wrap; }
.chips span { background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.28); border-radius: 99px; padding: 1.4mm 3.6mm; font-size: 8.5pt; font-weight: 600; }
.chips span b { color: #6EE7A0; font-weight: 700; }
h2 { font-size: 13.5pt; margin: 5.5mm 0 2.8mm; display: flex; align-items: center; gap: 3mm; letter-spacing: -0.01em; }
h2 .n { width: 7mm; height: 7mm; border-radius: 50%; background: #6EE7A0; color: #0B3B26; display: grid; place-items: center; font-size: 9.5pt; font-weight: 800; }
.steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
.step { border: 1px solid #E4E6F0; border-radius: 4mm; padding: 3.4mm 3.4mm; background: #FAFBFF; position: relative; }
.step .k { font-size: 7.5pt; font-weight: 700; color: #4A6CF0; letter-spacing: 0.08em; }
.step h3 { margin: 1mm 0 1.5mm; font-size: 10.5pt; }
.step p { margin: 0; font-size: 7.9pt; line-height: 1.45; color: #5B6180; }
.step p b { color: #151833; font-weight: 600; }
.step .arrow { position: absolute; right: -3mm; top: 50%; transform: translate(50%, -50%); width: 5mm; height: 5mm; border-radius: 50%; background: #4B3FD6; color: #fff; font-size: 7pt; display: grid; place-items: center; z-index: 2; }
.codes-use { display: grid; grid-template-columns: 1.55fr 1fr; gap: 4mm; align-items: stretch; }
.box { border: 1px solid #E4E6F0; border-radius: 4mm; padding: 4mm 5mm; }
.box p { margin: 0 0 2mm; font-size: 9.3pt; line-height: 1.5; color: #3A3F5C; }
.box ul { margin: 0; padding-left: 4.5mm; font-size: 8.8pt; line-height: 1.55; color: #5B6180; }
.box ul li::marker { color: #4A6CF0; }
.box b { color: #151833; font-weight: 600; }
.mint { background: #EAFBF1; border: 1px solid #BDEFD2; border-radius: 4mm; padding: 4.5mm 5mm; display: flex; flex-direction: column; justify-content: center; gap: 2mm; }
.mint .big { font-size: 24pt; font-weight: 800; color: #0B3B26; line-height: 1; }
.mint .t { font-size: 9.5pt; font-weight: 600; color: #0B3B26; }
.mint .s { font-size: 8.3pt; color: #2E6B4D; line-height: 1.45; }
.mint code { font-family: 'JetBrains Mono', monospace; font-size: 8.3pt; background: #fff; border-radius: 2mm; padding: 0.8mm 2mm; color: #0B3B26; border: 1px solid #BDEFD2; }
.phases { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
.phase { border-radius: 4mm; padding: 3mm 3.8mm; background: linear-gradient(135deg, #4B3FD6, #5B6CF0); color: #fff; }
.phase .f { display: flex; align-items: center; gap: 2.2mm; }
.phase .f span { width: 6mm; height: 6mm; border-radius: 50%; background: #6EE7A0; color: #0B3B26; font-size: 8pt; font-weight: 800; display: grid; place-items: center; }
.phase .f b { font-size: 10pt; }
.phase p { margin: 1.6mm 0 0; font-size: 8.4pt; line-height: 1.4; color: #E6E8FF; }
.gets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; }
.get { border: 1px solid #E4E6F0; border-radius: 4mm; padding: 4.2mm 4.2mm; background: #FAFBFF; }
.get h3 { margin: 0 0 1.4mm; font-size: 10.5pt; }
.get p { margin: 0 0 1.8mm; font-size: 8.3pt; line-height: 1.45; color: #5B6180; }
.get ul { margin: 0; padding-left: 4mm; font-size: 8.3pt; line-height: 1.55; color: #3A3F5C; }
.get ul li::marker { color: #6EE7A0; }
.get b { font-weight: 600; color: #151833; }
.codes { display: grid; grid-template-columns: 1fr 1fr; gap: 0 6mm; border: 1px solid #E4E6F0; border-radius: 4mm; padding: 2mm 5mm; }
.code { display: flex; align-items: center; gap: 3mm; padding: 2.35mm 0; border-bottom: 1px solid #EEF0F6; }
.code:nth-last-child(-n+2) { border-bottom: none; }
.code .i { width: 6mm; font-size: 8pt; font-weight: 700; color: #4A6CF0; }
.code .c { font-family: 'JetBrains Mono', monospace; font-size: 10.6pt; font-weight: 600; letter-spacing: 0.03em; color: #151833; }
.code .x { margin-left: auto; width: 4mm; height: 4mm; border: 1.3px solid #C9CDE0; border-radius: 1mm; }
.note { font-size: 8.5pt; color: #5B6180; margin: 0 0 3mm; line-height: 1.5; }
.contact { margin-top: 7mm; display: flex; align-items: center; gap: 5mm; background: linear-gradient(125deg, #3D2FB8 0%, #4B3FD6 45%, #5B6CF0 100%); border-radius: 5mm; padding: 6mm 7mm; color: #fff; }
.contact .logo { width: 14mm; height: 14mm; }
.contact .l { font-size: 9.5pt; color: #6EE7A0; font-weight: 600; }
.contact .m { font-size: 19pt; font-weight: 800; letter-spacing: -0.01em; }
.contact .s { margin-left: auto; text-align: right; font-size: 8.5pt; color: #E6E8FF; line-height: 1.5; }
.foot { position: absolute; left: 14mm; right: 14mm; bottom: 5.5mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #8A8FA8; }
"""


def build(phases, codes):
    steps = ''.join(
        f'<div class="step"><div class="k">PAS {i + 1}</div><h3>{E(t)}</h3><p>{d}</p>{"<div class=arrow>→</div>" if i < 3 else ""}</div>'
        for i, (t, d) in enumerate(STEPS))
    ph = ''.join(f'<div class="phase"><div class="f"><span>{i + 1}</span><b>{E(f["name"])}</b></div><p>{E(f["q"])}</p></div>'
                 for i, f in enumerate(phases))
    gets = ''.join(f'<div class="get"><h3>{E(t)}</h3><p>{E(p)}</p><ul>{"".join(f"<li>{x}</li>" for x in xs)}</ul></div>' for t, p, xs in GETS)
    rows = ''.join(f'<div class="code"><span class="i">{i + 1:02d}</span><span class="c">{E(c)}</span><span class="x"></span></div>'
                   for i, c in enumerate(codes))
    head = f'<div class="top"><div class="brand">{LOGO.format(cls="logo")}<span>Uni<span class="m">Matx</span></span></div><div class="tag">Guia d\'accés per a centres</div></div>'
    foot = '<div class="foot"><span>UniMatx · Orientació universitària · unimatx.cat</span><span>{}</span></div>'
    return f"""<!doctype html><html lang="ca"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<section class="page">{head}
<div class="hero"><div class="eyebrow">DEMO PER A CENTRES</div><h1>Com provar UniMatx<br>al vostre centre</h1>
<p>UniMatx és una plataforma en línia que ajuda l'alumnat de 1r i 2n de batxillerat a escollir carrera: un test en 6 fases i un informe amb els graus que més hi encaixen.</p>
<div class="chips"><span><b>661</b> graus comparats</span><span>Test de <b>20</b> o <b>60</b> minuts</span><span>Dades d'<b>AQU Catalunya</b></span></div></div>
<h2><span class="n">1</span>Entreu al compte</h2><div class="steps">{steps}</div>
<h2><span class="n">2</span>Feu servir els codis d'invitació</h2>
<div class="codes-use"><div class="box"><p>Els codis d'invitació <b>UMX</b> es bescanvien <b>dins del compte</b>, un cop hi heu entrat. Amb aquests codis podeu fer el test de forma <b>completament gratuïta</b>.</p>
<ul><li>Abans de començar trieu la durada: <b>20 minuts</b> (fins a 33 preguntes) o <b>60 minuts</b> (fins a 43).</li>
<li>El progrés es desa al compte i es pot reprendre des d'un altre dispositiu.</li><li>Un compte escolar pot començar fins a tres tests al dia.</li></ul></div>
<div class="mint"><div class="big">{len(codes)} codis</div><div class="t">Els trobareu a la pàgina 2</div><div class="s">Tenen aquesta forma:<br><code>UMX-XXXXX-XXXXX-XXXXX-XXXXX</code></div></div></div>
<h2><span class="n">3</span>El test, en 6 fases</h2><div class="phases">{ph}</div>
{foot.format('1 / 2')}</section>
<section class="page">{head}
<h2 style="margin-top:0"><span class="n">4</span>Què obteniu</h2><div class="gets">{gets}</div>
<h2><span class="n">5</span>Els vostres codis d'invitació</h2>
<p class="note">Són per al vostre centre: no els publiqueu. Podeu marcar cada codi a mesura que el doneu.</p>
<div class="codes">{rows}</div>
<div class="contact">{LOGO.format(cls="logo")}<div><div class="l">Voleu provar-ho al vostre centre? Dubtes?</div><div class="m">xavier@unimatx.cat</div></div>
<div class="s">Xavier Ayats<br>Creador d'UniMatx<br>unimatx.cat</div></div>
{foot.format('2 / 2')}</section>
</body></html>"""


async def render(page_html, pdf, png_dir):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=["--no-sandbox"])
        pg = await b.new_page(ignore_https_errors=True)
        await pg.set_content(page_html, wait_until="networkidle")
        await pg.evaluate("document.fonts.ready")
        for f in ("700 12px Poppins", "600 12px 'JetBrains Mono'"):
            print(f, 'carregada' if await pg.evaluate(f"document.fonts.check(\"{f}\")") else 'NO CARREGADA')
        await pg.pdf(path=str(pdf), format="A4", print_background=True, prefer_css_page_size=True)
        await b.close()
    png_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(['pdftoppm', '-png', '-r', '110', str(pdf), str(png_dir / 'pagina')], check=True)


def main():
    root = Path(sys.argv[1])
    codes = [c.strip() for c in (root / 'work' / 'codis-invitacio.txt').read_text().splitlines() if c.strip()]
    phases = json.loads((root / 'retols.json').read_text())['fases']['items']
    pdf = root / 'out' / 'UniMatx-guia-acces-centres.pdf'
    asyncio.run(render(build(phases, codes), pdf, root / 'work' / 'guia'))
    print(pdf, len(codes), 'codis')


if __name__ == '__main__':
    main()
