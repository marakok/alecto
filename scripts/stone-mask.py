"""Make the stepping-stones mask for the path photo (stones.js).

  python3 scripts/stone-mask.py public/phase-2/move-path.jpg public/phase-2/move-path-stones.png preview.png

Draw a loose outline around each stone (STONES, image px, far to near); inside it, a pixel counts as stone when
it is light grey. Prints the outlines in % for STONES in src/phase-2/concept-2/stones.js. Needs Pillow.
"""
import sys, json
from PIL import Image, ImageDraw, ImageFilter, ImageChops
src, out, prev = sys.argv[1:4]
im = Image.open(src).convert('RGB'); W, H = im.size
# Stepping stones, far to near (image px). Loose outlines; the pixel test below finds the stone itself.
STONES = [
  [(380,1140),(480,1138),(510,1162),(392,1172)],
  [(405,1192),(520,1188),(548,1212),(418,1224)],
  [(712,1216),(830,1214),(862,1244),(728,1258)],
  [(798,1292),(905,1290),(915,1346),(830,1350)],
  [(990,1388),(1080,1392),(1105,1424),(1020,1448)],
  [(525,1345),(640,1342),(768,1372),(640,1396)],
  [(175,1420),(340,1414),(410,1452),(240,1498)],
  [(605,1468),(760,1462),(865,1505),(770,1545)],
  [(0,1476),(40,1480),(40,1505),(0,1505)],
  [(50,1540),(260,1538),(335,1590),(170,1642)],
]
px = im.load()
test = Image.new('L', (W, H), 0); tp = test.load()
region = Image.new('L', (W, H), 0); ImageDraw.Draw(region).polygon(sum(STONES, []), fill=0)
dr = ImageDraw.Draw(region)
for s in STONES: dr.polygon(s, fill=255); dr.line(s + [s[0]], fill=255, width=60, joint='curve')
# the white sock on the stone: left out by its own outline (it is as light as the stone)
SOCK = [(599,1350),(612,1361),(662,1363),(654,1377),(655,1406),(627,1407),(613,1393),(598,1388)]
dr.polygon(SOCK, fill=0); dr.line(SOCK + [SOCK[0]], fill=0, width=4)
for box in [(735,1425,790,1470), (686,1255,734,1302)]: dr.rectangle(box, fill=0)  # grass and a sock next to the stones
rp = region.load()
for y in range(1100, 1700):
  for x in range(W):
    if not rp[x, y]: continue
    r, g, b = px[x, y]; mx, mn = max(r, g, b), min(r, g, b)
    if mn > 120 and mx - mn < 26:
      tp[x, y] = 255
# close small holes (grain), soften the edge
test = test.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
m = Image.new('RGBA', (W, H), (255, 255, 255, 0)); m.putalpha(test)
m.resize((W // 2, H // 2), Image.LANCZOS).save(out, optimize=True)
# preview: periwinkle stones on the photo
tint = Image.new('RGB', (W, H), (130, 144, 232))
p = Image.composite(tint, im, test.point(lambda a: int(a * .85)))
p.crop((0, 1080, W, 1700)).save(prev)
# clip polygons in % of the photo, for CSS
# Clip outlines for CSS: per stone, the convex hull of its own mask pixels, pushed out a little.
def hull(pts):
  pts = sorted(set(pts))
  def half(seq):
    h = []
    for p in seq:
      while len(h) >= 2 and (h[-1][0]-h[-2][0])*(p[1]-h[-2][1]) - (h[-1][1]-h[-2][1])*(p[0]-h[-2][0]) <= 0: h.pop()
      h.append(p)
    return h
  return half(pts)[:-1] + half(pts[::-1])[:-1]
tl = test.load(); out = []
cores = Image.new('L', (W, H), 255); cd_ = ImageDraw.Draw(cores)
for i, s_ in enumerate(STONES): cd_.polygon(s_, fill=i)  # which stone's own outline a pixel is in (255: none)
cp = cores.load()
for i, s_ in enumerate(STONES):
  own = Image.new('L', (W, H), 0); d = ImageDraw.Draw(own)
  d.polygon(s_, fill=255); d.line(s_ + [s_[0]], fill=255, width=60, joint='curve'); op = own.load()
  xs = [p[0] for p in s_]; ys = [p[1] for p in s_]
  pts = [(x, y) for y in range(max(0, min(ys) - 40), min(H, max(ys) + 40)) for x in range(max(0, min(xs) - 40), min(W, max(xs) + 40))
         if op[x, y] and tl[x, y] > 40 and cp[x, y] in (i, 255)]  # not a neighbour's
  h = hull(pts); cx = sum(p[0] for p in h) / len(h); cy = sum(p[1] for p in h) / len(h)
  def push(p, d=10):
    vx, vy = p[0] - cx, p[1] - cy; n = (vx * vx + vy * vy) ** .5 or 1
    return (p[0] + vx / n * d, p[1] + vy / n * d)
  out.append(', '.join(f'{x/W*100:.2f}% {y/H*100:.2f}%' for x, y in map(push, h)))
print(json.dumps(out, indent=1))
