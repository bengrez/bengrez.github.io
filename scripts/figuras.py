#!/usr/bin/env python3
"""Genera las tres figuras del sitio (iteración 014): un panel por caso, SVG en línea, con estilo de
paper (ejes en L, barras de error, coral y burdeos) y un gradiente de detalle por elementos:

  - Data science: dos series (dos buses), banda ± 2σ y la alerta.
  - Ecología: dos series (dos profundidades) con barras de error.
  - Docencia: una línea y un acento.

Las SVG no llevan colores fijos: usan clases que el CSS de index.html pinta con las variables del
sitio (tinta, apagado, coral, burdeos), así que se integran al fondo en los dos temas. Los trazos
llevan pathLength="1" para que el CSS los dibuje con stroke-dashoffset al entrar a la sección.
Cada figura sale en dos variantes, `w` (escritorio, viewBox 640 × 280) y `n` (celular, 400 × 220).

Todo es sintético, con semilla fija (salida idéntica en cada corrida) y cada figura lleva el sello
«Datos simulados». Nada es dato de estudiantes, de una empresa ni de un sitio real; Docencia usa sólo
promedios del curso.

    python3 scripts/figuras.py            # imprime los seis SVG, rotulados, para pegar en index.html
    python3 scripts/figuras.py --pegar    # los pega en index.html entre <!-- fig:ID --> y <!-- /fig:ID -->
"""
import os
import re
import sys

import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(os.path.dirname(AQUI), "index.html")
SELLO = "Datos simulados"
VARIANTES = {"w": dict(W=640, H=280, ml=58, mr=14, mt=24, mb=46, tt=14),
             "n": dict(W=400, H=220, ml=50, mr=12, mt=22, mb=44, tt=13)}


def f(v, nd=1):
    s = f"{v:.{nd}f}".rstrip("0").rstrip(".")
    return s if s not in ("-0", "") else "0"


# ------------------------------------------------------------------ datos simulados (semilla fija)

def datos_ds():
    rng = np.random.default_rng(13)
    dias = np.arange(1, 31)
    base = 86.0
    mu = base + np.where(dias >= 13, 0.9 * np.clip(dias - 12, 0, 8), 0) - np.where(dias >= 21, 0.85 * np.clip(dias - 20, 0, 9), 0)
    mu = np.clip(mu, base - 0.3, None)
    bus_a = (mu[:, None] + rng.normal(0, 1.1, (30, 3))).mean(1)          # el bus que deriva
    bus_b = (base + rng.normal(0, 0.6, (30, 3))).mean(1)                # otro bus, que se queda dentro
    mu_ref, sd_ref = bus_a[:10].mean(), bus_a[:10].std(ddof=1)
    lo, hi = mu_ref - 2 * sd_ref, mu_ref + 2 * sd_ref
    assert ((bus_b >= lo) & (bus_b <= hi)).all(), "el otro bus debe quedarse dentro de la banda"
    alerta = int(dias[bus_a > hi][0])
    return dict(dias=dias, a=bus_a, b=bus_b, lo=lo, hi=hi, mu=mu_ref, alerta=alerta)


def datos_ec():
    meses = np.array([0, 3, 6, 12, 18, 24])
    sup = (np.array([34, 44, 52, 66, 72, 74]), np.array([4, 4, 5, 5, 4, 4]))
    pro = (np.array([30, 36, 41, 54, 58, 60]), np.array([4, 5, 5, 6, 5, 5]))
    return dict(meses=meses, sup=sup, pro=pro)


def datos_do():
    rng = np.random.default_rng(7)
    ensayos = np.arange(1, 9)
    logro = np.array([70, 72, 71, 73, 48, 56, 66, 70]) + rng.normal(0, 1.2, 8).round(1)
    return dict(ensayos=ensayos, logro=logro, caida=5)


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

    def ejes(self, xt, yt, xl, yl):
        p = [f'<path class="eje" d="M{f(self.L)} {f(self.T)}V{f(self.B)}H{f(self.R)}"/>']
        for t in xt:
            p.append(f'<path class="eje" d="M{f(self.X(t))} {f(self.B)}v4"/>')
            p.append(f'<text class="tick" x="{f(self.X(t))}" y="{f(self.B + 16)}" text-anchor="middle">{t}</text>')
        for t in yt:
            p.append(f'<path class="eje" d="M{f(self.L)} {f(self.Y(t))}h-4"/>')
            p.append(f'<text class="tick" x="{f(self.L - 7)}" y="{f(self.Y(t) + 4)}" text-anchor="end">{t}</text>')
        p.append(f'<text class="titulo" x="{f((self.L + self.R) / 2)}" y="{f(self.v["H"] - 7)}" text-anchor="middle">{xl}</text>')
        cy = (self.T + self.B) / 2
        p.append(f'<text class="titulo" transform="translate({f(self.v["tt"])} {f(cy)}) rotate(-90)" text-anchor="middle">{yl}</text>')
        p.append(f'<text class="sello" x="{f(self.R)}" y="{f(self.T - 9)}" text-anchor="end">{SELLO}</text>')
        self.partes.extend(p)

    def linea(self, xs, ys, cls):
        d = "M" + " L".join(f"{f(self.X(x))} {f(self.Y(y))}" for x, y in zip(xs, ys))
        self.partes.append(f'<path class="linea {cls}" pathLength="1" d="{d}"/>')

    def svg(self, cls, aria):
        v = self.v
        cuerpo = "\n  ".join(self.partes)
        return (f'<svg class="fig {self.var} {cls}" viewBox="0 0 {v["W"]} {v["H"]}" role="img" aria-label="{aria}">\n  {cuerpo}\n</svg>')


ARIA_DS = ("Gráfico con datos simulados: temperatura del refrigerante de dos buses durante 30 días. Un bus, en burdeos, se mantiene dentro de la banda normal. "
           "El otro, en coral, deriva hacia arriba desde el día 13, sale de la banda el día 15, donde está la alerta, y vuelve a lo normal tras la revisión.")
ARIA_EC = ("Gráfico con datos simulados: función microbiana de un suelo minero inoculado, como porcentaje de la referencia, a lo largo de 24 meses, en superficie (coral) y en profundidad (burdeos), "
           "con barras de error. Las dos series suben, pero a los 24 meses quedan en 74 y 60 por ciento, bajo la línea de referencia.")
ARIA_DO = ("Gráfico con datos simulados y sólo promedios del curso: logro en un tema a lo largo de ocho ensayos. Se mantiene cerca del 70 por ciento, cae al 48 en el quinto ensayo, marcado en burdeos "
           "porque aparece un tema nuevo, y vuelve al 70 tras el refuerzo.")


def figura_ds(var):
    d = datos_ds()
    p = Panel(var, 1, 30, 82, 96)
    p.ejes([1, 10, 20, 30], [84, 88, 92, 96], "Día", "Refrigerante (°C)")
    p.partes.append(f'<rect class="banda" x="{f(p.L)}" y="{f(p.Y(d["hi"]))}" width="{f(p.R - p.L)}" height="{f(p.Y(d["lo"]) - p.Y(d["hi"]))}"/>')
    p.partes.append(f'<path class="ref" d="M{f(p.L)} {f(p.Y(d["mu"]))}H{f(p.R)}"/>')
    p.partes.append(f'<text class="nota" x="{f(p.L + 6)}" y="{f(p.Y(d["lo"]) + 13)}">referencia ± 2σ</text>')
    p.linea(d["dias"], d["b"], "b")
    p.linea(d["dias"], d["a"], "a")
    xa, ya = p.X(d["alerta"]), p.Y(d["a"][d["alerta"] - 1])
    p.partes.append(f'<g class="alerta"><path class="guia" d="M{f(xa)} {f(p.T)}V{f(p.B)}"/><circle cx="{f(xa)}" cy="{f(ya)}" r="5"/>'
                    f'<text x="{f(xa + 8)}" y="{f(p.T + 13)}">alerta</text></g>')
    lx, ly = p.L + 14, p.T + 14
    p.partes.append(f'<g class="leyenda"><circle class="a" cx="{f(lx)}" cy="{f(ly)}" r="4"/><text x="{f(lx + 9)}" y="{f(ly + 4)}">bus que deriva</text>'
                    f'<circle class="b" cx="{f(lx)}" cy="{f(ly + 18)}" r="4"/><text x="{f(lx + 9)}" y="{f(ly + 22)}">otro bus</text></g>')
    return p.svg("ds", ARIA_DS)


def figura_ec(var):
    d = datos_ec()
    p = Panel(var, -1.5, 25.5, 0, 110)
    p.ejes([0, 6, 12, 18, 24], [0, 25, 50, 75, 100], "Meses desde la inoculación", "Función (% de la referencia)")
    p.partes.append(f'<path class="ref" d="M{f(p.L)} {f(p.Y(100))}H{f(p.R)}"/>')
    p.partes.append(f'<text class="nota" x="{f(p.R - 4)}" y="{f(p.Y(100) - 5)}" text-anchor="end">referencia</text>')
    i = 0
    for cls, (m, e), dx in (("a", d["sup"], -0.45), ("b", d["pro"], 0.45)):
        for x, y, ee in zip(d["meses"] + dx, m, e):
            cx, cy, c0, c1 = p.X(x), p.Y(y), p.Y(y - ee), p.Y(y + ee)
            p.partes.append(f'<g class="pt {cls}" style="--i:{i}"><path d="M{f(cx)} {f(c0)}V{f(c1)}M{f(cx - 4)} {f(c0)}h8M{f(cx - 4)} {f(c1)}h8"/>'
                            f'<circle cx="{f(cx)}" cy="{f(cy)}" r="4.5"/></g>')
            i += 1
    p.partes.append(f'<g class="leyenda"><circle class="a" cx="{f(p.L + 14)}" cy="{f(p.T + 30)}" r="4"/><text x="{f(p.L + 22)}" y="{f(p.T + 34)}">superficie</text>'
                    f'<circle class="b" cx="{f(p.L + 14)}" cy="{f(p.T + 48)}" r="4"/><text x="{f(p.L + 22)}" y="{f(p.T + 52)}">profundo</text></g>')
    return p.svg("ec", ARIA_EC)


def figura_do(var):
    d = datos_do()
    p = Panel(var, 0.5, 8.5, 30, 85)
    p.ejes(list(range(1, 9)), [30, 50, 70], "Ensayo", "Logro del curso (%)")
    p.linea(d["ensayos"], d["logro"], "ink")
    k = d["caida"]
    cx, cy = p.X(k), p.Y(d["logro"][k - 1])
    p.partes.append(f'<g class="acento"><circle cx="{f(cx)}" cy="{f(cy)}" r="5.5"/><text x="{f(cx)}" y="{f(cy + 20)}" text-anchor="middle">tema nuevo</text></g>')
    return p.svg("do", ARIA_DO)


def todas():
    out = {}
    for nombre, fn in (("ds", figura_ds), ("ec", figura_ec), ("do", figura_do)):
        out[nombre] = "\n".join(fn(v) for v in ("w", "n"))
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


if __name__ == "__main__":
    main()
