#!/usr/bin/env python3
"""Genera las figuras del sitio. Desde la versión realista (059) cada una declara su tipo y su fuente:

  - Data science (fig:ds), SIMULADA: refrigerante de dos buses, con los recorridos de cada día (n = 3), la media diaria, la banda
    de referencia ± kσ y la alerta. Es la demostración interactiva del sitio: index.html trae un control que cambia k y recalcula
    la alerta y las falsas alarmas con estos mismos datos (bloque <script id="ds-datos">, que también sale de aquí).
  - Ecología (fig:ec), DATOS PUBLICADOS: amonio y nitrato del suelo por tratamiento, media ± DE, n = 3. Tabla suplementaria 1 de
    Moreira-Grez et al. 2019, Front. Microbiol. 10:1617, doi:10.3389/fmicb.2019.01617 (CC BY 4.0). Los valores están copiados abajo.
  - RNA-SIP (fig:sip), SIMULADA: ARN por fracción de un gradiente de densidad, control ¹²C y tratamiento ¹³C.
  - Citas (fig:citas), DATOS PÚBLICOS: citas por año de 15 publicaciones, de OpenAlex (consulta por DOI del 2026-11-21).

Docencia ya no lleva gráfico simulado: muestra una captura de una herramienta publicada (tabla-periodica-fig.webp).

Las SVG no llevan colores fijos: usan clases que el CSS de index.html pinta con las variables del sitio, así que se integran al
fondo en los dos temas. Los trazos llevan pathLength="1" para que el CSS los dibuje al entrar a la sección. Las figuras de la franja
salen en dos variantes, `w` (escritorio, viewBox 640 × 280) y `n` (celular, 400 × 220). Lo simulado usa semilla fija.

    python3 scripts/figuras.py            # imprime los bloques, rotulados, para pegar en index.html
    python3 scripts/figuras.py --pegar    # los pega en index.html entre <!-- fig:ID --> y <!-- /fig:ID -->
"""
import json
import os
import re
import sys

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(os.path.dirname(AQUI), "index.html")
VARIANTES = {"w": dict(W=640, H=280, ml=58, mr=14, mt=24, mb=46, tt=14),
             "n": dict(W=400, H=220, ml=50, mr=12, mt=22, mb=44, tt=13)}


def f(v, nd=1):
    s = f"{v:.{nd}f}".rstrip("0").rstrip(".")
    return s if s not in ("-0", "") else "0"


# ------------------------------------------------------------------ Data science: simulación (semilla fija)
# Parámetros plausibles para el circuito de refrigeración de un motor diésel en régimen (termostato en torno a 86 °C); no son datos
# de ningún cliente. Cada día hay tres recorridos por bus; el valor de un recorrido es su temperatura media en régimen.
DS_BASE, DS_INICIO, DS_REVISION, DS_REF, DS_K = 86.0, 13, 21, 10, 2.0     # la deriva empieza el día 13 y la revisión es el día 21; la referencia son los primeros 10 días


def datos_ds():
    rng = np.random.default_rng(13)
    dias = np.arange(1, 31)
    deriva = np.where((dias >= DS_INICIO) & (dias < DS_REVISION), 0.9 * (dias - DS_INICIO + 1), 0.0)   # +0,9 °C por día hasta la revisión; después, de vuelta a lo normal
    rec_a = np.round(DS_BASE + deriva[:, None] + rng.normal(0, 1.1, (30, 3)), 1)                     # el bus que deriva: tres recorridos por día
    rec_b = np.round(DS_BASE + rng.normal(0, 0.6, (30, 3)), 1)                                       # otro bus de la flota
    a, b = np.round(rec_a.mean(1), 2), np.round(rec_b.mean(1), 2)                                    # medias diarias (las que usa el control de index.html)
    return dict(dias=dias, rec_a=rec_a, rec_b=rec_b, a=a, b=b)


def regla_ds(a, b, k):
    """La misma regla que el control de index.html: referencia = media ± k·σ de los primeros DS_REF días del bus; alerta = primer día de la
    deriva en que la media diaria supera la banda; falsas alarmas = días-bus normales (fuera de la deriva) que quedan fuera de la banda."""
    mu, sd = float(np.mean(a[:DS_REF])), float(np.std(a[:DS_REF], ddof=1))
    lo, hi = mu - k * sd, mu + k * sd
    alerta, falsas, normales = 0, [], 0
    for d in range(DS_REF + 1, 31):
        en_deriva = DS_INICIO <= d <= DS_REVISION
        va, vb = a[d - 1], b[d - 1]
        if en_deriva:
            if not alerta and va > hi:
                alerta = d
        else:
            normales += 1
            if va > hi or va < lo:
                falsas.append((d, va))
        normales += 1
        if vb > hi or vb < lo:
            falsas.append((d, vb))
    return dict(mu=mu, sd=sd, lo=lo, hi=hi, alerta=alerta, falsas=falsas, normales=normales)


def texto_ds(r, k):
    ks = f(k).replace(".", ",")
    fa = len(r["falsas"])
    cola = f"{'sin' if fa == 0 else fa} falsa{'' if fa == 1 else 's'} alarma{'' if fa == 1 else 's'} en {r['normales']} días-bus normales"
    if not r["alerta"]:
        return f"Umbral {ks}σ: la deriva no se detecta antes de la revisión; {cola}."
    n = r["alerta"] - DS_INICIO
    cuando = "el mismo día en que empieza la deriva" if n == 0 else f"{n} día{'' if n == 1 else 's'} después de que empieza la deriva"
    return f"Umbral {ks}σ: alerta el día {r['alerta']}, {cuando}; {cola}."


# ------------------------------------------------------------------ Ecología: datos publicados
# Moreira-Grez B, Muñoz-Rojas M, Kariman K, Storer P, O'Donnell AG, Kumaresan D, Whiteley AS (2019). Reconditioning Degraded Mine Site Soils
# With Exogenous Soil Microbes: Plant Fitness and Soil Microbiome Outcomes. Front. Microbiol. 10:1617. doi:10.3389/fmicb.2019.01617 (CC BY 4.0).
# Tabla suplementaria 1 (Data_Sheet_2.docx): media y desviación estándar por tratamiento, mg/kg, n = 3 (tres réplicas elegidas al azar por
# tratamiento, tras 12 semanas de incubación; «Basal» es el suelo antes de incubar). La tabla trae además el suelo recién inoculado
# («Inoculum»: NH4-N 6,00 ± 0,00; NOx-N 12,33 ± 5,51), que no se grafica.
EC = [  # (rótulo ancho, rótulo angosto, NH4-N media, DE, NOx-N media, DE)
    ("Basal", "Basal", 7.30, 1.70, 10.50, 3.41),
    ("Control", "Control", 4.20, 3.12, 20.00, 0.70),
    ("Nitrógeno", "N", 12.00, 2.96, 16.63, 3.67),
    ("Microbios", "Mic.", 11.00, 2.08, 23.17, 2.75),
    ("Microb. + N", "Mic.+N", 13.23, 3.88, 39.10, 2.57),
]

# ------------------------------------------------------------------ Citas por año: OpenAlex
# Consulta del 2026-11-21 a https://api.openalex.org/works/https://doi.org/<DOI> (campo counts_by_year) para los 15 DOI de la tabla
# «Publicaciones destacadas» del CV. `consorcio` es Edwards et al. 2019, Nature Microbiology (crAssphage, 117 autores); `propias`, la suma
# de las otras 14. 2026 es un año incompleto. OpenAlex cuenta menos citas que Google Scholar.
CITAS = {  # año: (propias, consorcio)
    2017: (2, 0), 2018: (7, 0), 2019: (14, 11), 2020: (29, 33), 2021: (53, 59), 2022: (76, 40),
    2023: (70, 45), 2024: (68, 27), 2025: (60, 23), 2026: (61, 30),
}


# ------------------------------------------------------------------ armado del SVG

class Panel:
    def __init__(self, var, x0, x1, y0, y1):
        self.v = VARIANTES[var]
        self.var = var
        self.x0, self.x1, self.y0, self.y1 = x0, x1, y0, y1
        self.L, self.R = self.v["ml"], self.v["W"] - self.v["mr"]
        self.T, self.B = self.v["mt"], self.v["H"] - self.v["mb"]
        self.partes = []

    def X(self, x):
        return self.L + (x - self.x0) / (self.x1 - self.x0) * (self.R - self.L)

    def Y(self, y):
        return self.B - (y - self.y0) / (self.y1 - self.y0) * (self.B - self.T)

    def ejes(self, xt, yt, xl, yl, sello, rotulos=None):
        p = [f'<path class="eje" d="M{f(self.L)} {f(self.T)}V{f(self.B)}H{f(self.R)}"/>']
        for j, t in enumerate(xt):
            p.append(f'<path class="eje" d="M{f(self.X(t))} {f(self.B)}v4"/>')
            p.append(f'<text class="tick" x="{f(self.X(t))}" y="{f(self.B + 16)}" text-anchor="middle">{rotulos[j] if rotulos else t}</text>')
        for t in yt:
            p.append(f'<path class="eje" d="M{f(self.L)} {f(self.Y(t))}h-4"/>')
            p.append(f'<text class="tick" x="{f(self.L - 7)}" y="{f(self.Y(t) + 4)}" text-anchor="end">{t}</text>')
        p.append(f'<text class="titulo" x="{f((self.L + self.R) / 2)}" y="{f(self.v["H"] - 7)}" text-anchor="middle">{xl}</text>')
        cy = (self.T + self.B) / 2
        p.append(f'<text class="titulo" transform="translate({f(self.v["tt"])} {f(cy)}) rotate(-90)" text-anchor="middle">{yl}</text>')
        p.append(f'<text class="sello" x="{f(self.R)}" y="{f(self.T - 9)}" text-anchor="end">{sello}</text>')
        self.partes.extend(p)

    def linea(self, xs, ys, cls):
        d = "M" + " L".join(f"{f(self.X(x))} {f(self.Y(y))}" for x, y in zip(xs, ys))
        self.partes.append(f'<path class="linea {cls}" pathLength="1" d="{d}"/>')

    def svg(self, cls, aria, extra=""):
        v = self.v
        cuerpo = "\n  ".join(self.partes)
        return (f'<svg class="fig {self.var} {cls}" viewBox="0 0 {v["W"]} {v["H"]}" role="img" aria-label="{aria}"{extra}>\n  {cuerpo}\n</svg>')


def figura_ds(var):
    d = datos_ds()
    r = regla_ds(d["a"], d["b"], DS_K)
    assert r["alerta"], "con el umbral por defecto la deriva debe detectarse"
    p = Panel(var, 1, 30, 82, 96)
    p.ejes([1, 10, 20, 30], [84, 88, 92, 96], "Día", "Refrigerante (°C)",
           "Datos simulados, n = 3 recorridos por día" if var == "w" else "Simulado, n = 3 recorridos/día")
    p.partes.append(f'<rect class="banda" x="{f(p.L)}" y="{f(p.Y(r["hi"]))}" width="{f(p.R - p.L)}" height="{f(p.Y(r["lo"]) - p.Y(r["hi"]))}"/>')
    p.partes.append(f'<path class="ref" d="M{f(p.L)} {f(p.Y(r["mu"]))}H{f(p.R)}"/>')
    p.partes.append(f'<text class="nota" x="{f(p.L + 6)}" y="{f(p.Y(r["lo"]) + 13)}">referencia ± {f(DS_K).replace(".", ",")}σ</text>')
    for cls, rec in (("b", d["rec_b"]), ("a", d["rec_a"])):                                    # los recorridos de cada día: puntos tenues bajo la media
        pts = "".join(f"M{f(p.X(dia + dx))} {f(p.Y(min(96, max(82, v))))}h0" for dia, fila in zip(d["dias"], rec) for dx, v in zip((-.22, 0, .22), fila))
        p.partes.append(f'<path class="crudo {cls}" d="{pts}"/>')
    p.linea(d["dias"], d["b"], "b")
    p.linea(d["dias"], d["a"], "a")
    xr = p.X(DS_REVISION)
    p.partes.append(f'<g class="rev"><path d="M{f(xr)} {f(p.B)}v-9"/><text x="{f(xr)}" y="{f(p.B - 13)}" text-anchor="middle">revisión</text></g>')
    cruces = "".join(f"M{f(p.X(dd) - 3.5)} {f(p.Y(v) - 3.5)}l7 7m0 -7l-7 7" for dd, v in r["falsas"])
    p.partes.append(f'<path class="falsas" d="{cruces}"/>')
    xa, ya = p.X(r["alerta"]), p.Y(d["a"][r["alerta"] - 1])
    p.partes.append(f'<g class="alerta"><path class="guia" d="M{f(xa)} {f(p.T)}V{f(p.B)}"/><circle cx="{f(xa)}" cy="{f(ya)}" r="5"/>'
                    f'<text x="{f(xa + 8)}" y="{f(p.T + 13)}">alerta</text></g>')
    lx, ly = p.L + 14, p.T + 14
    p.partes.append(f'<g class="leyenda"><circle class="a" cx="{f(lx)}" cy="{f(ly)}" r="4"/><text x="{f(lx + 9)}" y="{f(ly + 4)}">bus que deriva</text>'
                    f'<circle class="b" cx="{f(lx)}" cy="{f(ly + 18)}" r="4"/><text x="{f(lx + 9)}" y="{f(ly + 22)}">otro bus</text></g>')
    aria = ("Gráfico con datos simulados: temperatura del refrigerante de dos buses durante 30 días, con tres recorridos por día y su media diaria. Un bus, en burdeos, "
            f"se mantiene dentro de la banda de referencia. El otro, en coral, deriva hacia arriba desde el día {DS_INICIO}, con el umbral inicial de {f(DS_K)} sigmas sale de la banda el día {r['alerta']}, donde está la alerta, "
            f"y vuelve a lo normal tras la revisión del día {DS_REVISION}. El control «Umbral de alerta», más abajo, cambia la banda.")
    return p.svg("ds", aria, f' data-g="{f(p.L)} {f(p.R)} {f(p.T)} {f(p.B)}"')


def datos_ds_json():
    d = datos_ds()
    r = regla_ds(d["a"], d["b"], DS_K)
    js = json.dumps(dict(a=[float(v) for v in d["a"]], b=[float(v) for v in d["b"]], ref=DS_REF, ini=DS_INICIO, rev=DS_REVISION, y=[82, 96]), separators=(",", ":"))
    return f'<script type="application/json" id="ds-datos">{js}</script>\n<!-- texto por defecto del control: {texto_ds(r, DS_K)} -->'


def figura_ec(var):
    p = Panel(var, 0.4, 5.6, 0, 45)
    ancho = var == "w"
    p.ejes([1, 2, 3, 4, 5], [0, 10, 20, 30, 40], "Suelo inicial (Basal) y tratamientos a las 12 semanas" if ancho else "Basal y tratamientos (12 semanas)", "N mineral (mg/kg)",
           "Datos publicados: media ± DE, n = 3" if ancho else "Publicado: media ± DE, n = 3", [e[0] if ancho else e[1] for e in EC])
    i = 0
    for cls, col, dx in (("a", 2, -0.13), ("b", 4, 0.13)):
        for k, e in enumerate(EC):
            m, s = e[col], e[col + 1]
            cx, cy, c0, c1 = p.X(k + 1 + dx), p.Y(m), p.Y(max(0, m - s)), p.Y(m + s)
            p.partes.append(f'<g class="pt {cls}" style="--i:{i}"><path d="M{f(cx)} {f(c0)}V{f(c1)}M{f(cx - 4)} {f(c0)}h8M{f(cx - 4)} {f(c1)}h8"/>'
                            f'<circle cx="{f(cx)}" cy="{f(cy)}" r="4.5"/></g>')
            i += 1
    p.partes.append(f'<g class="leyenda"><circle class="a" cx="{f(p.L + 14)}" cy="{f(p.T + 12)}" r="4"/><text x="{f(p.L + 22)}" y="{f(p.T + 16)}">amonio (NH₄-N)</text>'
                    f'<circle class="b" cx="{f(p.L + 14)}" cy="{f(p.T + 30)}" r="4"/><text x="{f(p.L + 22)}" y="{f(p.T + 34)}">nitrato + nitrito (NOx-N)</text></g>')
    aria = ("Gráfico con datos publicados (Moreira-Grez y otros, 2019): nitrógeno mineral de un suelo de acopio minero, antes de incubar y tras 12 semanas, por tratamiento, media y desviación estándar de tres réplicas, en miligramos por kilo. "
            "Basal es el suelo antes de incubar. "
            + " ".join(f"{n}: amonio {f(e[2]).replace('.', ',')}; nitrato más nitrito {f(e[4]).replace('.', ',')}." for n, e in zip(("Basal", "Control", "Nitrógeno", "Microbios", "Microbios con nitrógeno"), EC)) +
            " El valor más alto de nitrato más nitrito es el del inóculo microbiano con nitrógeno.")
    return p.svg("ec", aria)


def figura_sip():
    """RNA-SIP, simulada: ARNr 16S por fracción de un gradiente de CsTFA (12 fracciones), control con sustrato ¹²C y tratamiento con ¹³C. El ARN que incorporó ¹³C
    queda en las fracciones más densas; una parte de la comunidad no usó el sustrato y sigue en la posición liviana. Densidades del orden de las que se usan en RNA-SIP."""
    rng = np.random.default_rng(3)
    W, H, L, R, T, B = 320, 210, 46, 310, 20, 164
    x0, x1 = 1.755, 1.845
    X = lambda v: L + (v - x0) / (x1 - x0) * (R - L)
    Y = lambda v: B - v / 1.08 * (B - T)
    dens = np.linspace(1.765, 1.835, 12)
    g = lambda mu, sd: np.exp(-((dens - mu) ** 2) / (2 * sd ** 2))
    c12 = g(1.789, 0.0085) + rng.normal(0, 0.018, 12)
    c13 = 0.34 * g(1.789, 0.0085) + g(1.818, 0.0095) + rng.normal(0, 0.018, 12)
    c12, c13 = np.clip(c12 / c12.max(), 0, 1), np.clip(c13 / c13.max(), 0, 1)
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Gráfico con datos simulados: ARN ribosomal por fracción de un gradiente de densidad, como proporción del máximo. El control con carbono 12 tiene su máximo cerca de 1,79 gramos por mililitro; '
           f'el tratamiento con carbono 13, cerca de 1,82, con un hombro en la posición liviana.">']
    eje = f"M{L} {T}V{B}H{R}" + "".join(f"M{f(X(t))} {B}v4" for t in (1.76, 1.78, 1.80, 1.82, 1.84)) + "".join(f"M{L} {f(Y(t))}h-4" for t in (0, .5, 1))
    out.append(f'<path class="ax" d="{eje}"/>')
    for t in (1.76, 1.78, 1.80, 1.82, 1.84):
        out.append(f'<text x="{f(X(t))}" y="{B + 16}" text-anchor="middle">{f"{t:.2f}".replace(".", ",")}</text>')
    for t, s in ((0, "0"), (.5, "0,5"), (1, "1")):
        out.append(f'<text x="{L - 7}" y="{f(Y(t) + 4)}" text-anchor="end">{s}</text>')
    out.append(f'<text class="tit" x="{(L + R) / 2}" y="{H - 6}" text-anchor="middle">Densidad de flotación (g/ml)</text>')
    out.append(f'<text class="tit" transform="translate(12 {(T + B) / 2}) rotate(-90)" text-anchor="middle">ARNr 16S (prop. del máximo)</text>')
    out.append(f'<text x="{R}" y="{T - 7}" text-anchor="end">Datos simulados, 12 fracciones</text>')
    for cls, ys in (("c12", c12), ("c13", c13)):
        d = "M" + " L".join(f"{f(X(a))} {f(Y(b))}" for a, b in zip(dens, ys))
        if cls == "c13":
            out.append(f'<path class="a13" d="{d} L{f(X(dens[-1]))} {B} L{f(X(dens[0]))} {B} Z"/>')
        out.append(f'<path class="{cls}" d="{d}"/>')
        out.append(f'<g class="p{cls[1:]}">' + "".join(f'<circle cx="{f(X(a))}" cy="{f(Y(b))}" r="2.6"/>' for a, b in zip(dens, ys)) + "</g>")
    out.append(f'<text class="tit" x="{f(X(1.789) - 16)}" y="{f(Y(.93))}" text-anchor="end">¹²C</text>')
    out.append(f'<text class="tit t13" x="{f(X(1.818) + 22)}" y="{f(Y(.93))}">¹³C</text>')
    out.append("</svg>")
    return "\n".join(out)


def figura_citas():
    W, H, L, R, T, B = 320, 132, 34, 314, 16, 104
    an = sorted(CITAS)
    mx = 120
    paso = (R - L) / len(an)
    Y = lambda v: B - v / mx * (B - T)
    tot = {a: sum(CITAS[a]) for a in an}
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Gráfico con datos de OpenAlex: citas por año de 15 publicaciones, de 2017 a 2026. '
           + " ".join(f"{a}: {tot[a]}." for a in an) + ' El año 2026 está incompleto.">']
    out.append(f'<path class="ax" d="M{L} {T}V{B}H{R}' + "".join(f"M{L} {f(Y(t))}h-4" for t in (0, 50, 100)) + '"/>')
    for t in (0, 50, 100):
        out.append(f'<text x="{L - 7}" y="{f(Y(t) + 4)}" text-anchor="end">{t}</text>')
    for j, a in enumerate(an):
        pr, co = CITAS[a]
        x, w = L + j * paso + 3, paso - 6
        out.append(f'<rect class="cp" x="{f(x)}" y="{f(Y(pr))}" width="{f(w)}" height="{f(B - Y(pr))}"/>')
        if co:
            out.append(f'<rect class="cc" x="{f(x)}" y="{f(Y(pr + co))}" width="{f(w)}" height="{f(Y(pr) - Y(pr + co))}"/>')
        out.append(f'<text x="{f(x + w / 2)}" y="{B + 14}" text-anchor="middle">{str(a)[2:]}</text>')
    out.append(f'<text x="{R}" y="{H - 2}" text-anchor="end">año (20…); 2026 incompleto</text>')
    out.append("</svg>")
    return "\n".join(out)


def todas():
    out = {}
    for nombre, fn in (("ds", figura_ds), ("ec", figura_ec)):
        out[nombre] = "\n".join(fn(v) for v in ("w", "n"))
    out["ds-datos"] = datos_ds_json()
    out["sip"] = figura_sip()
    out["citas"] = figura_citas()
    return out


def main():
    svgs = todas()
    if "--pegar" in sys.argv:
        s = open(INDEX, encoding="utf-8").read()
        for k, v in svgs.items():
            s, n = re.subn(rf"(<!-- fig:{k} -->)\n.*?\n(\s*<!-- /fig:{k} -->)", lambda m: f"{m.group(1)}\n{v}\n{m.group(2)}", s, flags=re.S)
            assert n == 1, k
        open(INDEX, "w", encoding="utf-8").write(s)
        print("pegado:", {k: len(v) for k, v in svgs.items()})
    else:
        for k, v in svgs.items():
            print(f"<!-- fig:{k} -->\n{v}\n<!-- /fig:{k} -->")
    d = datos_ds()
    for k in (1, 1.5, 2, 2.5, 3, 3.5, 4):
        print(texto_ds(regla_ds(d["a"], d["b"], k), k), file=sys.stderr)


if __name__ == "__main__":
    main()
