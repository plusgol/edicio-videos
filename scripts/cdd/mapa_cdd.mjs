// Geometria del mapa del vídeo de Camino de Dragones (composició CaminoDragones), ja projectada a píxels del vídeo.
//
// Ús: node scripts/cdd/mapa_cdd.mjs projectes/camino-dragones
//
// Llegeix work/ruta-mapy.json (els 32 trams tal com són a Mapy.com, de scripts/cdd/ruta_mapy.py) i escriu
// remotion/mapa.json: la terra (Espanya d'es-atlas, França i Andorra de world-atlas), les vores de municipis i
// províncies, el contorn de Catalunya, cada tram simplificat amb el quilòmetre de cada punt, els punts de relleu
// i el perfil d'altitud. La projecció (Mercator) encaixa la ruta sencera a VIEW, la zona del pla general.
import fs from 'node:fs';
import path from 'node:path';
import {geoBounds, geoContains, geoMercator, geoPath} from 'd3-geo';
import {feature, merge, mesh} from 'topojson-client';

const W = 1080;
const H = 1920;
const VIEW = [[150, 290], [930, 1390]]; // on cap la ruta sencera: a sota hi va el perfil d'altitud i, més avall, la interfície de Reels/TikTok
const SIMPLIFY = 0.12; // px al pla general: a la càmera més propera (×3) encara és menys d'un píxel
const R = (v) => Math.round(v * 10) / 10;

const root = process.argv[2];
const req = (p) => JSON.parse(fs.readFileSync(new URL(import.meta.resolve(p))));
const legs = JSON.parse(fs.readFileSync(path.join(root, 'work/ruta-mapy.json')));

const route = {type: 'LineString', coordinates: legs.flatMap((l) => l.pts)};
const proj = geoMercator().fitExtent(VIEW, route);
const pad = 1400; // el que es pot veure en moure la càmera
proj.clipExtent([[-pad, -pad], [W + pad, H + pad]]);
const gp = geoPath(proj);
const P = (lonlat) => proj(lonlat).map(R);

// Distància real (km) entre dos punts lon/lat.
const hav = ([a, b], [c, d]) => {
  const k = Math.PI / 180;
  const s = Math.sin(((d - b) * k) / 2) ** 2 + Math.cos(b * k) * Math.cos(d * k) * Math.sin(((c - a) * k) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(s));
};

// Ramer–Douglas–Peucker sobre punts projectats, conservant el km de cada punt.
const rdp = (pts, eps) => {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0];
  const [bx, by] = pts[pts.length - 1];
  const dx = bx - ax;
  const dy = by - ay;
  const L = Math.hypot(dx, dy) || 1;
  let im = 0;
  let dm = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / L;
    if (d > dm) [dm, im] = [d, i];
  }
  if (dm <= eps) return [pts[0], pts[pts.length - 1]];
  return [...rdp(pts.slice(0, im + 1), eps).slice(0, -1), ...rdp(pts.slice(im), eps)];
};

// Trams: el quilometratge és el de la web (la suma de trams fa 300,6 km); dins de cada tram es reparteix segons
// la distància real entre punts del traçat.
let km0 = 0;
const outLegs = legs.map((l) => {
  const webKm = parseFloat(l.km);
  let acc = 0;
  const raw = l.pts.map((p, i) => {
    if (i) acc += hav(l.pts[i - 1], p);
    return [...proj(p), acc];
  });
  const f = webKm / acc;
  const pts = rdp(raw, SIMPLIFY).map(([x, y, d]) => [R(x), R(y), Math.round((km0 + d * f) * 100) / 100]);
  const leg = {n: l.n, name: l.name, km: webKm, gain: parseInt(l.gain, 10), from: Math.round(km0 * 100) / 100, pts};
  km0 += webKm;
  return leg;
});

// Perfil d'altitud: un punt cada ~250 m, amb el quilometratge de la web.
const profile = [];
km0 = 0;
for (const l of legs) {
  const webKm = parseFloat(l.km);
  const tot = l.alt.reduce((s, a) => s + a[0], 0) || 1;
  let acc = 0;
  for (const a of l.alt) {
    acc += a[0];
    const k = km0 + (acc / tot) * webKm;
    if (!profile.length || k - profile[profile.length - 1][0] >= 0.25) profile.push([Math.round(k * 100) / 100, a[1]]);
  }
  km0 += webKm;
}

const es = req('es-atlas/es/municipalities.json');
const prov = req('es-atlas/es/provinces.json');
const ar = req('es-atlas/es/autonomous_regions.json');
const world = req('world-atlas/countries-10m.json');
const countries = feature(world, world.objects.countries).features;
const near = (f) => {
  const [[x0, y0], [x1, y1]] = geoPath(geoMercator().scale(proj.scale()).translate(proj.translate())).bounds(f);
  return x1 > -pad && x0 < W + pad && y1 > -pad && y0 < H + pad;
};
const spain = merge(ar, ar.objects.autonomous_regions.geometries);
const cat = feature(ar, ar.objects.autonomous_regions).features.find((f) => f.id === '09');
const munis = es.objects.municipalities.geometries.filter((g) => near(feature(es, g)));

// Els «milers de dracs» de la llegenda (escena d'obertura): punts a l'atzar dins de Catalunya, sempre els mateixos.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const [[lo0, la0], [lo1, la1]] = geoBounds(cat);
const dragons = [];
while (dragons.length < 90) {
  const p = [lo0 + rnd() * (lo1 - lo0), la0 + rnd() * (la1 - la0)];
  if (geoContains(cat, p)) dragons.push([...P(p), Math.round(rnd() * 100) / 100]);
}
const catB = geoPath(geoMercator().scale(proj.scale()).translate(proj.translate())).bounds(cat).map((q) => q.map(R));

const data = {
  w: W,
  h: H,
  view: VIEW,
  land: {
    spain: gp(spain),
    france: gp(countries.find((c) => c.id === '250')),
    andorra: gp(countries.find((c) => c.id === '020')),
  },
  catalonia: geoPath(geoMercator().scale(proj.scale()).translate(proj.translate()))(cat),
  catBounds: catB,
  dragons,
  muniBorders: gp(mesh(es, {type: 'GeometryCollection', geometries: munis}, (a, b) => a !== b)),
  provBorders: gp(mesh(prov, prov.objects.provinces, (a, b) => a !== b)),
  legs: outLegs,
  relays: [...outLegs.map((l) => l.pts[0]), outLegs[outLegs.length - 1].pts.at(-1)],
  totalKm: Math.round(outLegs.reduce((s, l) => s + l.km, 0) * 10) / 10,
  profile,
  source: 'Traçat i altituds: Mapy.com (enllaços de caminodedragones.es/rutas); terra: es-atlas i world-atlas (Natural Earth)',
};
fs.writeFileSync(path.join(root, 'remotion/mapa.json'), JSON.stringify(data));
console.log('trams', outLegs.length, 'punts', outLegs.reduce((s, l) => s + l.pts.length, 0), 'km', data.totalKm,
  'municipis', munis.length, 'perfil', profile.length, 'mida', (JSON.stringify(data).length / 1e6).toFixed(2), 'MB');
