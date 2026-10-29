"""Targeta de contacte (PNG amb transparència) per sobreposar al final de la demo per a centres.

Ús: python3 scripts/targeta_correu.py <sortida.png> "<rètol petit>" "<correu>"

Es dibuixa en HTML amb la lletra i els colors d'UniMatx (Poppins, blau #116EEE, tinta #252B2F) i es captura amb
el Chromium de Playwright; així la lletra és la de la marca sense instal·lar-la.
"""
import asyncio
import html
import sys

from playwright.async_api import async_playwright

PAGE = """<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&display=swap" rel="stylesheet">
<style>
  html, body {{ margin: 0; background: transparent; }}
  .card {{ display: inline-flex; flex-direction: column; gap: 6px; padding: 26px 44px 30px; margin: 30px;
    background: #fff; border-radius: 26px; box-shadow: 0 18px 50px rgba(20, 16, 70, 0.35); font-family: Poppins, sans-serif; }}
  .label {{ font-weight: 600; font-size: 26px; color: #116EEE; }}
  .mail {{ font-weight: 800; font-size: 58px; color: #252B2F; letter-spacing: -0.01em; line-height: 1.1; }}
</style></head><body><div class="card"><div class="label">{label}</div><div class="mail">{mail}</div></div></body></html>"""


async def main(out, label, mail):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1400, "height": 400}, ignore_https_errors=True)
        await pg.set_content(PAGE.format(label=html.escape(label), mail=html.escape(mail)), wait_until="networkidle")
        await pg.evaluate("document.fonts.ready")
        box = await pg.locator(".card").bounding_box()
        m = 30  # marge per a l'ombra
        await pg.screenshot(path=out, omit_background=True,
                            clip={"x": box["x"] - m, "y": box["y"] - m, "width": box["width"] + 2 * m, "height": box["height"] + 2 * m})
        fam = await pg.evaluate("getComputedStyle(document.querySelector('.mail')).fontFamily")
        ok = await pg.evaluate("document.fonts.check('800 58px Poppins')")
        print(out, int(box["width"] + 2 * m), int(box["height"] + 2 * m), fam, "Poppins carregada" if ok else "SENSE Poppins")
        await b.close()


if __name__ == "__main__":
    asyncio.run(main(*sys.argv[1:4]))
