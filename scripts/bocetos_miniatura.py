"""Bocetos de pose (per passar a una IA d'imatges amb la foto de l'usuari) i de composició final de la miniatura.
Ús: python3 -I scripts/bocetos_miniatura.py <carpeta_sortida>   (vegeu projectes/en-4-minutos/miniatura_ia.md)"""
import math, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
OUT = sys.argv[1]
BLACK = "/usr/share/fonts/opentype/inter/Inter-Black.otf"

def bez(p0, p1, p2, n=40):
    return [((1-t)**2*p0[0]+2*(1-t)*t*p1[0]+t*t*p2[0], (1-t)**2*p0[1]+2*(1-t)*t*p1[1]+t*t*p2[1]) for t in [i/n for i in range(n+1)]]

def figure(d, pose, s=1.0, ox=0, oy=0, col=(20,20,20), w=6):
    P = lambda x, y: (ox + x*s, oy + y*s)
    W = max(2, int(w*s))
    line = lambda pts: d.line([P(*p) for p in pts], fill=col, width=W, joint="curve")
    ell = lambda a, b, c, e: d.ellipse([P(a, b), P(c, e)], outline=col, width=W)
    # cap, cabell i ulleres
    ell(840, 250, 1080, 540)
    line(bez((832, 400), (840, 200), (960, 215)) + bez((960, 215), (1085, 205), (1088, 400))[1:])
    line([(860, 300), (900, 330), (930, 300), (965, 335), (1000, 300), (1040, 330), (1070, 305)])
    for a in (870, 970):
        d.rounded_rectangle([P(a, 365), P(a + 80, 415)], radius=int(10*s), outline=col, width=W)
    line([(950, 388), (970, 388)]); line([(870, 380), (842, 375)]); line([(1050, 380), (1078, 375)])
    ell(822, 380, 848, 445); ell(1072, 380, 1098, 445)
    line([(925, 470), (995, 470)])  # boca
    # coll, espatlles i samarreta
    line([(915, 530), (905, 600)]); line([(1005, 530), (1015, 600)])
    line(bez((905, 600), (650, 640), (610, 1080))); line(bez((1015, 600), (1270, 640), (1310, 1080)))
    line(bez((905, 600), (960, 660), (1015, 600)))
    line([(300, 1010), (1620, 1010)])  # taula
    if pose == "manos":
        line([(690, 1010), (880, 650)]); line([(770, 1010), (930, 665)])
        line([(1230, 1010), (1040, 650)]); line([(1150, 1010), (990, 665)])
        ell(870, 560, 1050, 690)
        for k in range(4):
            x = 905 + k*30
            line(bez((x, 575), (x + 12, 625), (x + 4, 675)))
    else:  # dit amunt al costat de la cara, l'altre braç sobre la taula
        line([(730, 1010), (668, 640)]); line([(805, 1010), (742, 650)])
        ell(640, 545, 770, 660)
        d.rounded_rectangle([P(690, 390), P(728, 560)], radius=int(18*s), outline=col, width=W)
        line([(1010, 975), (1320, 990)]); line([(1010, 1035), (1320, 1045)])
        ell(930, 965, 1030, 1045)

for pose in ("manos", "dedo"):
    im = Image.new("RGB", (1920, 1080), "white"); d = ImageDraw.Draw(im)
    figure(d, pose)
    im.save(f"{OUT}/pose_{pose}.png")

    # Composició final: fons fosc amb focus a la cara, figura al centre, text als costats, cantonada de baix a la dreta lliure.
    W, H = 1280, 720
    bg = Image.new("RGB", (W, H), (14, 15, 17))
    glow = Image.new("L", (W, H), 0); gd = ImageDraw.Draw(glow)
    gd.ellipse([640-330, 260-300, 640+330, 260+300], fill=120); glow = glow.filter(ImageFilter.GaussianBlur(110))
    bg = Image.composite(Image.new("RGB", (W, H), (120, 96, 40)), bg, glow)
    d = ImageDraw.Draw(bg)
    figure(d, pose, s=0.62, ox=640 - 960*0.62, oy=40, col=(235, 235, 230), w=7)
    big = lambda px: ImageFont.truetype(BLACK, px)
    Y, Wt = (255, 229, 59), (245, 244, 238)
    d.text((215, 330), "3", font=big(230), fill=Y, anchor="mm")
    d.text((215, 480), "MIN", font=big(120), fill=Y, anchor="mm")
    d.text((1060, 330), "VIDA", font=big(118), fill=Wt, anchor="mm")
    d.text((1060, 450), "NUEVA", font=big(118), fill=Wt, anchor="mm")
    arc = bez((300, 170), (640, -40), (950, 200), 60)
    d.line(arc, fill=Wt, width=7, joint="curve")
    ang = math.atan2(arc[-1][1] - arc[-4][1], arc[-1][0] - arc[-4][0])
    for da in (2.6, -2.6):
        d.line([arc[-1], (arc[-1][0] + 34*math.cos(ang + da), arc[-1][1] + 34*math.sin(ang + da))], fill=Wt, width=7)
    d.rectangle([1150, 660, 1262, 704], outline=(90, 90, 90), width=2)
    d.text((1206, 682), "2:46", font=ImageFont.truetype(BLACK, 22), fill=(120, 120, 120), anchor="mm")
    bg.save(f"{OUT}/boceto_miniatura_{pose}.png")
print("ok")
