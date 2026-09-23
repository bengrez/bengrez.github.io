#!/usr/bin/env python3
"""Genera los esquemas SVG del sitio (hero y bandas de sección).

Todo es esquema, no dato publicado: series simuladas con semilla fija para que la
salida sea idéntica en cada corrida. Imprime bloques rotulados en stdout; se pegan a
mano en index.html (el sitio no tiene paso de build).

    python3 scripts/senales.py > /tmp/senales.txt

Coordenadas en unidades del viewBox de cada figura; los rótulos HTML se posicionan en %.
"""
import numpy as np

rng = np.random.default_rng(20260922)


def f(v, nd=1):
    s = f"{v:.{nd}f}".rstrip("0").rstrip(".")
    return s if s not in ("-0", "") else "0"


def block(name, text):
    print(f"==== {name}")
    print(text)


# ---------------------------------------------------------------------------
# Hero: una serie, tres lecturas (medir, detectar, explicar)
# Un sistema estable se perturba, cae, se recupera y se estabiliza bajo su
# referencia previa: parece recuperado y no lo está.
# ---------------------------------------------------------------------------
W, H = 1200.0, 260.0
N, REP = 36, 3                 # tiempos de muestreo y réplicas por tiempo
TP = 7.5                       # perturbación entre la muestra 7 y la 8
T_MIN, V_MIN = 11.0, 0.46      # fondo de la caída
PLATEAU, TAU = 0.845, 3.2      # meseta de recuperación y su constante de tiempo
SD_PRE, SD_POST = 0.028, 0.045
K = 2.0                        # banda de referencia: media previa ± K·sd
V_TOP, V_BOT = 1.12, 0.34      # rango vertical del viewBox


def true_curve(t):
    if t <= TP:
        return 1.0
    if t <= T_MIN:             # caída suave (medio coseno) desde 1.0 hasta el fondo
        u = (t - TP) / (T_MIN - TP)
        return 1.0 - (1.0 - V_MIN) * (1 - np.cos(np.pi * u)) / 2
    return PLATEAU - (PLATEAU - V_MIN) * np.exp(-(t - T_MIN) / TAU)


def X(t):
    return 24 + t * (W - 48) / (N - 1)


def Y(v):
    return 18 + (V_TOP - v) / (V_TOP - V_BOT) * (H - 36)


t = np.arange(N, dtype=float)
mu_true = np.array([true_curve(x) for x in t])
sd = np.where(t <= TP, SD_PRE, SD_POST)
samples = mu_true[:, None] + rng.normal(0, 1, (N, REP)) * sd[:, None]

pre = samples[t <= TP].ravel()
mu_ref, sd_ref = pre.mean(), pre.std(ddof=1)
lo, hi = mu_ref - K * sd_ref, mu_ref + K * sd_ref

# Tendencia: regresión local lineal (pesos tricúbicos) sobre las medias por tiempo,
# ajustada por separado antes y después de la perturbación para no suavizar el quiebre.
means = samples.mean(axis=1)


def loess(ts, ys, half=3.5):
    out = []
    for x0 in ts:
        d = np.abs(ts - x0) / half
        w = np.where(d < 1, (1 - d**3) ** 3, 0)
        A = np.vstack([np.ones_like(ts), ts - x0]).T
        beta = np.linalg.lstsq(A * w[:, None] ** 0.5, ys * w**0.5, rcond=None)[0]
        out.append(beta[0])
    return np.array(out)


pre_i, post_i = t <= TP, t > TP
trend = np.empty(N)
trend[pre_i] = means[pre_i].mean()                     # antes: nivel constante
trend[post_i] = loess(t[post_i], means[post_i], half=3.0)

# Detección: desviación de la tendencia respecto de la referencia, en unidades de sd_ref.
z = (trend - mu_ref) / sd_ref
# Confirmación de "no vuelve": primer tiempo, ya pasada la caída, en que las últimas
# 5 tendencias están bajo la banda y su pendiente es casi nula (se estabilizó ahí).
HIT = None
for i in range(int(T_MIN) + 5, N):
    win = trend[i - 4:i + 1]
    if (win < lo).all() and abs(np.polyfit(np.arange(5), win, 1)[0]) < 0.006:
        HIT = i
        break
assert HIT is not None, "la meseta no se confirma bajo la banda"
assert trend[HIT:].max() < lo, "la meseta debe quedar bajo la banda de referencia"

# Explicar: la misma curva reducida a pocos tramos (Douglas-Peucker sobre la tendencia).
pts = np.column_stack([[X(x) for x in t], [Y(v) for v in trend]])


def dp(p, eps):
    a, b = p[0], p[-1]
    ab = b - a
    d = np.abs(ab[0] * (p[:, 1] - a[1]) - ab[1] * (p[:, 0] - a[0])) / np.hypot(*ab)
    k = int(d.argmax())
    if d[k] > eps:
        return np.vstack([dp(p[:k + 1], eps)[:-1], dp(p[k:], eps)])
    return np.vstack([a, b])


simple = dp(pts, 9.0)
assert (simple >= 0).all() and (pts >= 0).all()


def path_line(p):
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in p)


dots = " ".join(f"M{f(X(ti))} {f(Y(v))}h0" for ti, row in zip(t, samples) for v in row)
xp = (X(7) + X(8)) / 2
block("hero.meta", "\n".join([
    f"mu_ref={mu_ref:.4f} sd_ref={sd_ref:.4f} band=[{lo:.4f},{hi:.4f}]",
    f"HIT={HIT} x={X(HIT):.1f} y={Y(trend[HIT]):.1f} "
    f"left={X(HIT) / W * 100:.2f}% top={Y(trend[HIT]) / H * 100:.2f}% z={z[HIT]:.2f}",
    f"perturbacion x={xp:.1f} left={xp / W * 100:.2f}%",
    f"plateau trend min/max after HIT: {trend[HIT:].min():.3f}/{trend[HIT:].max():.3f}",
    f"simple vertices: {len(simple)} -> " + " ".join(
        f"({x / W * 100:.1f}%,{y / H * 100:.1f}%)" for x, y in simple),
]))
block("hero.band", f'<rect class="ref" x="0" y="{f(Y(hi))}" width="1200" height="{f(Y(lo) - Y(hi))}"/>'
      f'<path class="ref-mid" d="M0 {f(Y(mu_ref))}H1200"/>'
      f'<path class="perturb" d="M{f(xp)} 6V254"/>')
block("hero.trend", path_line(pts))
block("hero.dots", dots)
block("hero.simple", path_line(simple))
block("hero.z", " ".join(f(v, 1) for v in z))

# ---------------------------------------------------------------------------
# Ingeniería: tramas en un bus CAN (formato estándar, 11 bits), con CRC-15 y
# relleno de bits reales. CAN_H sube y CAN_L baja en bit dominante (0); en
# recesivo (1) ambas quedan al centro.
# ---------------------------------------------------------------------------


def crc15(bits):
    crc = 0
    for b in bits:
        nxt = b ^ ((crc >> 14) & 1)
        crc = (crc << 1) & 0x7FFF
        if nxt:
            crc ^= 0x4599
    return [(crc >> (14 - i)) & 1 for i in range(15)]


def frame(ident, data):
    bits = [0]                                             # SOF
    bits += [(ident >> (10 - i)) & 1 for i in range(11)]   # identificador
    bits += [0, 0, 0]                                      # RTR, IDE, r0
    bits += [(len(data) >> (3 - i)) & 1 for i in range(4)]  # DLC
    for byte in data:
        bits += [(byte >> (7 - i)) & 1 for i in range(8)]
    bits += crc15(bits)
    stuffed, run, last = [], 0, None                       # relleno: tras 5 iguales, el complemento
    for b in bits:
        stuffed.append(b)
        run = run + 1 if b == last else 1
        last = b
        if run == 5:
            stuffed.append(1 - b)
            last, run = 1 - b, 1
    return stuffed + [1, 0, 1] + [1] * 7                   # delim. CRC, ACK, delim. ACK, EOF


stream = [1] * 6
for n in range(4):
    ident = int(rng.integers(0x080, 0x6FF))
    data = [int(v) for v in rng.integers(0, 256, int(rng.integers(1, 3)))]
    stream += frame(ident, data) + [1] * int(rng.integers(8, 20))
BW = W / len(stream)


def can_path(level_dom, level_rec):
    d, y0 = [f"M0 {level_rec}"], level_rec
    x = 0.0
    for b in stream:
        y = level_dom if b == 0 else level_rec
        if y != y0:
            d.append(f"H{f(x)}V{y}")
            y0 = y
        x += BW
    d.append("H1200")
    return "".join(d)


block("can.meta", f"bits={len(stream)} bit_width={BW:.2f}")
block("can.h", can_path(22, 50))
block("can.l", can_path(78, 50))

# ---------------------------------------------------------------------------
# Investigación: RNA-SIP. Abundancia relativa de ARN por fracción del gradiente
# de densidad; el control con ¹²C y el tratamiento con ¹³C, cuyo ARN marcado se
# desplaza hacia fracciones más pesadas.
# ---------------------------------------------------------------------------
NF = 16
dens = np.linspace(1.765, 1.825, NF)                      # g/mL, CsTFA


def gauss(x, m, s):
    return np.exp(-0.5 * ((x - m) / s) ** 2)


c12 = gauss(dens, 1.786, 0.0065)
c13 = 0.62 * gauss(dens, 1.786, 0.0065) + 0.55 * gauss(dens, 1.806, 0.0070)
c12 = c12 / c12.max() * (1 + rng.normal(0, 0.03, NF))
c13 = c13 / c13.max() * 0.92 * (1 + rng.normal(0, 0.03, NF))


def SX(i):
    return 30 + i * (W - 60) / (NF - 1)


def SY(v):
    return 92 - v * 80


def sip(vals):
    p = [(SX(i), SY(v)) for i, v in enumerate(vals)]
    line = path_line(p)
    area = line + f" L{f(p[-1][0])} 92 L{f(p[0][0])} 92Z"
    pdots = " ".join(f"M{f(x)} {f(y)}h0" for x, y in p)
    return line, area, pdots


l12, a12, d12 = sip(c12)
l13, a13, d13 = sip(c13)
i12, i13 = int(c12.argmax()), int(c13[8:].argmax()) + 8
block("sip.meta", f"peak12 frac={i12} left={SX(i12) / W * 100:.1f}% top={SY(c12[i12]) / 100 * 100:.1f}%  "
      f"peak13 frac={i13} left={SX(i13) / W * 100:.1f}% top={SY(c13[i13]) / 100 * 100:.1f}%")
block("sip.c12", f'<path class="l12" d="{l12}"/><path class="dots d12" d="{d12}"/>')
block("sip.c13", f'<path class="a13" d="{a13}"/><path class="l13" d="{l13}"/><path class="dots d13" d="{d13}"/>')

# ---------------------------------------------------------------------------
# Tabla periódica reactiva (miniatura): grupos principales con el modelo propio de
# la herramienta, fuerza = tirón·1.5 − período (elementos.js), en 5 clases.
# ---------------------------------------------------------------------------
TIRON = {1: 0, 2: 1.2, 13: 3.5, 14: 4.3, 15: 5.0, 16: 5.6, 17: 6.2, 18: 6.8}
COLS = [1, 2, 13, 14, 15, 16, 17, 18]
cells = []
for per in range(1, 8):
    for ci, g in enumerate(COLS):
        if per == 1 and g not in (1, 18):
            continue
        cells.append((ci, per, TIRON[g] * 1.5 - per))
fz = np.array([c[2] for c in cells])
edges = np.quantile(fz, [0.2, 0.4, 0.6, 0.8])
classes = {k: [] for k in range(5)}
for ci, per, v in cells:
    classes[int(np.searchsorted(edges, v, side="right"))].append(
        f"M{ci * 11} {(per - 1) * 11}h10v10h-10z")
block("tabla.meta", f"cells={len(cells)} viewBox=0 0 87 76")
block("tabla.cells", "".join(f'<path class="c{k}" d="{"".join(v)}"/>' for k, v in classes.items()))
block("tabla.nacl", '<path class="pair" d="M0.5 22.5h10v10h-10zM66.5 22.5h10v10h-10z"/>')

# ---------------------------------------------------------------------------
# Aula: el año de Química en 8.º básico, 2026, unidad por unidad (cronograma del
# vault, IDE/docencia_2026). Fechas → x sobre marzo a noviembre.
# ---------------------------------------------------------------------------
from datetime import date

A0, A1 = date(2026, 3, 1), date(2026, 11, 30)


def AX(d):
    return 12 + (d - A0).days / (A1 - A0).days * (W - 24)


units = [
    ("nivelación", None, date(2026, 3, 4), date(2026, 3, 18)),
    ("modelos atómicos", "OA 12", date(2026, 3, 25), date(2026, 4, 15)),
    ("átomos e interacciones", "OA 13", date(2026, 4, 22), date(2026, 6, 10)),
    ("tabla periódica", "OA 14", date(2026, 7, 8), date(2026, 8, 5)),
    ("bioelementos", "OA 15", date(2026, 8, 26), date(2026, 9, 9)),
]
feria = (date(2026, 9, 9), date(2026, 10, 28))
segs = "".join(f"M{f(AX(a))} 34H{f(AX(b) + 3)}V52H{f(AX(a))}Z" for _, _, a, b in units[1:])
lev = f"M{f(AX(units[0][2]))} 40H{f(AX(units[0][3]) + 3)}V46H{f(AX(units[0][2]))}Z"
fer = f"M{f(AX(feria[0]))} 72H{f(AX(feria[1]) + 3)}"
months = "".join(f"M{f(AX(date(2026, m, 1)))} 86v6" for m in range(3, 12))
block("aula.svg", f'<path class="axis" d="M12 89H1188{months}"/><path class="lev" d="{lev}"/>'
      f'<path class="unit" d="{segs}"/><path class="feria" d="{fer}"/>')
block("aula.labels", "\n".join(
    [f"{lbl} {oa} left={AX(a) / W * 100:.2f}%" for lbl, oa, a, _ in units]
    + [f"feria left={AX(feria[0]) / W * 100:.2f}%"]
    + [f"mes {m} left={AX(date(2026, m, 1)) / W * 100:.2f}%" for m in range(3, 12)]))
