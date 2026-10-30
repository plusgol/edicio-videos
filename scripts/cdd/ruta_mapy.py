"""Traçat dels 32 trams de Camino de Dragones des de Mapy.com (els enllaços de cada tram de caminodedragones.es/en/routes).

Ús: python3 scripts/cdd/ruta_mapy.py <legs-raw.json> projectes/camino-dragones/work/ruta-mapy.json

legs-raw.json: els enllaços i el text de cada targeta de tram, en ordre. Per a cada tram obre l'enllaç amb Playwright,
agafa la resposta del planificador (FRPC) i la descodifica amb JAK.FRPC i SMap.Coords dins d'una pàgina de Mapy.com.
Desa els punts [lon, lat] i el perfil d'altitud [distància, altitud, lon, lat]."""
import asyncio, base64, os, sys, json
from playwright.async_api import async_playwright
legs = json.load(open(sys.argv[1])); out = sys.argv[2]
JS = """async (resp) => {
  const bin = atob(resp); const arr = new Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  const d = JAK.FRPC.parse(arr); const r = d.altRoutes[0]; const pts = [];
  for (const seg of r.routes) for (const sub of seg.routes) {
    for (const c of SMap.Coords.stringToCoords(sub.data.geometry)) pts.push([+c.x.toFixed(6), +c.y.toFixed(6)]);
  }
  const alt = (r.altitude && r.altitude.data || []).map(p => [+p.dist.toFixed(1), Math.round(p.niceAlt), +p.lon.toFixed(6), +p.lat.toFixed(6)]);
  return {length: r.totalLength, gain: r.altitude && r.altitude.gain, pts, alt};
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args=["--no-sandbox"],
                                    proxy={"server": os.environ['HTTPS_PROXY']})
        ctx = await b.new_context(ignore_https_errors=True, viewport={"width": 1280, "height": 900})
        dec = await ctx.new_page()
        await dec.goto("https://mapy.com/en/turisticka", wait_until='networkidle', timeout=90000)
        assert await dec.evaluate("!!(window.JAK && JAK.FRPC && window.SMap && SMap.Coords)")
        res = []
        for i, l in enumerate(legs):
            pg = await ctx.new_page()
            async with pg.expect_response(lambda r: 'api/tplanner' in r.url and r.request.method == 'POST', timeout=60000) as ri:
                await pg.goto(l['href'], wait_until='domcontentloaded', timeout=60000)
            body = await (await ri.value).body()
            await pg.close()
            d = await dec.evaluate(JS, base64.b64encode(body).decode())
            t = l['text']
            res.append({'n': int(t[0]), 'name': t[1], 'km': t[3], 'gain': t[5], 'municipalities': t[6].replace('Municipalities: ', ''),
                        'mapy_length_m': d['length'], 'mapy_gain_m': d['gain'], 'pts': d['pts'], 'alt': d['alt'], 'src': l['href']})
            print(t[0], t[1], t[3], d['length'], len(d['pts']), flush=True)
        json.dump(res, open(out, 'w'), ensure_ascii=False)
        await b.close()
asyncio.run(main())
