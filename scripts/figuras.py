#!/usr/bin/env python3
"""Genera las figuras del sitio. Desde la versión realista (059) cada una declara su tipo y su fuente:

  - Data science (fig:ds), SIMULADA. Desde la 074: la flota completa (40 buses, 30 días; uno se desvía y llega el aviso), fija y con rótulos llanos.
    Hasta la 073: refrigerante de dos buses, con los recorridos de cada día (n = 3), la media diaria, la banda
    de referencia ± kσ y la alerta. Es la demostración interactiva del sitio: index.html trae un control que cambia k y recalcula
    la alerta y las falsas alarmas con estos mismos datos (bloque <script id="ds-datos">, que también sale de aquí).
  - Ecología (fig:ec), DATOS PUBLICADOS. Desde la 075: la ordenación (CCA) de la figura 6 del mismo artículo, redibujada (ver ORD_*).
    Hasta la 074: amonio y nitrato del suelo por tratamiento, media ± DE, n = 3. Tabla suplementaria 1 de
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
import math
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


# ---- 074: la flota completa (Benjamin: un gráfico más global al tema «mido lo que nadie está midiendo»; fijo, sin control, con rótulos llanos).
# FLOTA_N buses durante 30 días (media diaria de la temperatura del motor). Cada bus tiene su nivel propio y su ruido de día a día; uno se desvía
# desde el día DS_INICIO hasta la revisión del día DS_REVISION. El aviso es el primer día en que ese bus queda a más de FLOTA_Z desviaciones
# robustas (mediana y MAD de la flota de ese día) sobre la mediana de la flota. Semilla fija. No son datos de ningún cliente.
FLOTA_N, FLOTA_Z = 40, 3.5


def datos_flota():
    rng = np.random.default_rng(74)
    dias = np.arange(1, 31)
    nivel = DS_BASE + rng.normal(0, 0.75, FLOTA_N)                                                   # cada bus anda un poco más frío o más caliente
    t = nivel[:, None] + rng.normal(0, 0.45, (FLOTA_N, 30))
    deriva = np.where((dias >= DS_INICIO) & (dias < DS_REVISION), 0.9 * (dias - DS_INICIO + 1), 0.0)
    k = int(np.argsort(nivel)[FLOTA_N // 2])                                                         # el que se desvía es un bus del medio, no uno ya caliente
    t[k] += deriva
    med = np.median(t, axis=0)
    mad = 1.4826 * np.median(np.abs(t - med), axis=0)
    z = (t[k] - med) / mad
    sobre = np.where(z > FLOTA_Z)[0]
    aviso = int(dias[sobre[0]]) if len(sobre) else None
    return dict(dias=dias, t=np.round(t, 2), k=k, aviso=aviso)


def figura_ds(var):
    d = datos_flota()
    assert d["aviso"] and DS_INICIO <= d["aviso"] < DS_REVISION, "la regla debe avisar durante la deriva"
    y0, y1 = 82, 96
    p = Panel(var, 1, 30, y0, y1)
    p.ejes([1, 10, 20, 30], [], "Día", "Temperatura del motor",
           f"Simulación: {FLOTA_N} buses, 30 días" if var == "w" else f"Simulación: {FLOTA_N} buses")
    g = (lambda v: f(v)) if var == "w" else (lambda v: str(int(round(v))))                          # la variante angosta, en píxeles enteros (pesa menos)
    otros = "".join("M" + " ".join(f"{g(p.X(x))} {g(p.Y(min(y1, max(y0, y))))}" for x, y in zip(d["dias"], fila))
                    for i, fila in enumerate(d["t"]) if i != d["k"])
    p.partes.append(f'<path class="flota" d="{otros}"/>')
    p.linea(d["dias"], [min(y1, v) for v in d["t"][d["k"]]], "a")
    xr = p.X(DS_REVISION)
    p.partes.append(f'<g class="rev"><path d="M{f(xr)} {f(p.B)}v-9"/><text x="{f(xr)}" y="{f(p.B - 13)}" text-anchor="middle">revisión</text></g>')
    xa, ya = p.X(d["aviso"]), p.Y(d["t"][d["k"]][d["aviso"] - 1])
    p.partes.append(f'<g class="alerta"><path class="guia" d="M{f(xa)} {f(p.T)}V{f(p.B)}"/><circle cx="{f(xa)}" cy="{f(ya)}" r="5"/>'
                    f'<text x="{f(xa + 8)}" y="{f(p.T + 13)}">aviso</text></g>')
    lx, ly = p.L + 14, p.T + 14
    p.partes.append(f'<g class="leyenda"><circle class="a" cx="{f(lx)}" cy="{f(ly)}" r="4"/><text x="{f(lx + 9)}" y="{f(ly + 4)}">un bus se desvía</text>'
                    f'<path class="flota-l" d="M{f(lx - 5)} {f(ly + 18)}h10"/><text x="{f(lx + 9)}" y="{f(ly + 22)}">los otros {FLOTA_N - 1}</text></g>')
    aria = (f"Gráfico con datos simulados: temperatura del motor de una flota de {FLOTA_N} buses durante 30 días. {FLOTA_N - 1} buses, en gris, se mantienen juntos "
            f"dentro de lo normal. Uno, en coral, empieza a subir el día {DS_INICIO}; el aviso llega el día {d['aviso']} y, tras la revisión del día {DS_REVISION}, vuelve a lo normal.")
    return p.svg("ds", aria)


def datos_ds_json():
    d = datos_ds()
    r = regla_ds(d["a"], d["b"], DS_K)
    js = json.dumps(dict(a=[float(v) for v in d["a"]], b=[float(v) for v in d["b"]], ref=DS_REF, ini=DS_INICIO, rev=DS_REVISION, y=[82, 96]), separators=(",", ":"))
    return f'<script type="application/json" id="ds-datos">{js}</script>\n<!-- texto por defecto del control: {texto_ds(r, DS_K)} -->'


# ---- 075: ordenación (Benjamin: un gráfico de ordenación con vectores, el mismo de un artículo, redibujado con la estética del sitio).
# Figura 6 de Moreira-Grez et al. 2019, Frontiers in Microbiology 10:1617 (doi:10.3389/fmicb.2019.01617, CC BY 4.0): análisis de correspondencia
# canónica (CCA) con las muestras (18: seis grupos por tres réplicas), los taxones (órdenes) y los vectores de la química del suelo.
# Las posiciones NO vienen de recalcular el análisis: se leyeron de la figura publicada (imagen de 3793 × 3416 px, ejes calibrados con su rejilla,
# 638,6 px por unidad): las muestras, por sus discos; los vectores, por la punta de cada flecha; los taxones, por correlación con una plantilla
# triangular (214 detectados; en la nube densa del centro hay triángulos superpuestos que no se separan). Error típico: ± 0,01 unidades.
# Dos de las tres réplicas de Control aparecen superpuestas en la figura original; aquí van separadas 0,04 unidades.
ORD_SITIOS = {  # grupo: (clase del marcador, [(CCA1, CCA2) × 3])
    "Inóculo":       ("m rom", [(-2.772, 0.815), (-2.151, 0.41), (-1.53, -0.475)]),
    "Microbios + N": ("m tri", [(0.961, 3.205), (0.62, 1.443), (0.4, 0.54)]),
    "Microbios":     ("m cir", [(0.351, 0.432), (0.438, 0.461), (0.479, 0.1)]),
    "Nitrógeno":     ("s tri", [(0.509, -0.318), (0.42, -0.416), (0.551, -0.489)]),
    "Basal":         ("s cir", [(0.326, -0.804), (0.412, -0.836), (0.499, -0.555)]),
    "Control":       ("s cua", [(0.095, -1.208), (0.17, -1.19), (0.21, -1.19)]),
}
ORD_CORTO = {"Microbios + N": "Mic. + N", "Microbios": "Microb.", "Nitrógeno": "Nitróg."}
ORD_VEC = [  # (rótulo, CCA1, CCA2, se rotula en la variante ancha, en la angosta)
    ("pH", 2.109, -0.063, 1, 1), ("Ca", 1.495, 0.058, 1, 0), ("NH₄", 0.896, 0.775, 1, 1), ("NOx", 0.813, -0.302, 1, 1), ("Cu", -0.015, 0.373, 0, 0),
    ("Al", -0.873, 0.597, 1, 0), ("Na", -1.665, 0.94, 1, 1), ("C org.", -2.085, 0.346, 1, 0), ("K", -1.961, 0.149, 0, 0), ("Mn", -1.919, -0.023, 1, 0),
    ("Fe", -0.86, 0.16, 0, 0), ("Zn", -0.906, -0.318, 0, 0), ("CE", -0.939, -0.467, 1, 0), ("Mg", -0.58, -1.18, 1, 1), ("S", 0.004, -1.15, 1, 0),
]
ORD_TAX = [(-0.11, -0.36), (-1.21, -0.17), (-2.56, 0.72), (-0.62, -0.65), (-0.28, 0.1), (0.56, 1.07), (0.19, -0.52), (0.36, 0.21), (0.1, -0.45), (-0.12, -0.48), (0.14, 0.19), (-0.95, -0.1), (-1.0, -0.16), (-1.51, 0.43), (0.58, 1.55), (-1.15, -0.08), (0.32, -0.31), (-0.98, 0.33), (-0.25, -0.31), (-0.96, -0.23), (0.23, 0.34), (-0.42, -0.31), (-0.04, 0.85), (0.18, 0.08), (-0.35, -0.75), (-0.5, -0.12), (0.7, 1.36), (-1.99, 0.24), (-0.32, -0.43), (0.41, -0.63), (-1.56, -0.57), (-0.05, -0.43), (0.48, 0.59), (0.23, -0.63), (-1.8, 0.24), (-1.66, 0.34), (-0.74, -0.96), (0.11, -0.1), (-2.29, 0.52), (-0.67, 0.51), (0.4, 0.29), (-0.11, -0.08), (-0.28, -0.37), (0.59, 0.8), (-2.39, 0.53), (-2.45, 0.67), (0.67, 1.78), (0.25, -0.86), (-2.25, 0.6), (-2.21, 0.5), (-2.14, 0.51), (0.33, -0.85), (0.08, -1.35), (0.52, 0.53), (0.21, -0.98), (0.47, 0.31), (-0.21, -0.47), (-0.03, -0.16), (0.03, -0.49), (0.26, -1.03), (0.55, 1.02), (0.42, 0.21), (0.19, 0.29), (0.11, 0.32), (0.21, -0.23), (0.41, 0.15), (-2.3, 0.59), (-0.06, -0.52), (0.61, 0.75), (0.12, -0.22), (-0.64, 0.08), (0.04, -0.03), (-1.26, -0.2), (-0.27, -0.48), (0.31, 0.12), (0.24, 0.17), (0.26, 0.12), (0.02, -0.8), (0.3, -0.18), (0.21, -0.11), (0.35, -0.05), (0.1, -0.28), (0.08, 0.1), (0.33, 0.7), (0.45, -0.26), (0.55, 0.16), (0.15, -0.23), (-0.86, 0.1), (0.38, 0.61), (0.33, -0.56), (-2.22, 0.38), (0.14, -0.02), (-0.34, -0.13), (0.24, -0.91), (0.25, -0.02), (0.39, -0.17), (0.25, -0.37), (0.48, 0.44), (0.39, -0.32), (0.48, 0.39), (0.54, 0.26), (0.24, -0.26), (0.28, -0.02), (-0.79, 0.3), (0.57, 0.7), (0.36, 0.16), (0.13, -0.32), (0.17, 0.43), (0.4, -0.03), (0.35, -0.5), (0.45, -0.07), (0.27, 0.05), (0.47, -0.1), (0.09, -0.49), (0.14, -0.15), (-0.07, 0.47), (0.37, -0.92), (0.34, -0.63), (-2.47, 0.63), (0.1, -0.15), (0.49, -0.14), (0.18, -0.31), (0.3, -0.57), (0.39, -0.26), (-0.38, 0.27), (0.37, -0.44), (0.18, -0.16), (0.33, -0.2), (0.22, -0.08), (0.44, 0.37), (0.09, 0.29), (0.31, -0.37), (-0.01, -0.25), (0.13, 0.3), (0.19, -0.38), (0.35, -0.42), (0.5, 0.29), (0.59, 0.69), (0.47, 0.07), (0.45, -0.03), (0.41, -0.45), (0.25, -0.13), (0.48, 0.17), (0.47, 0.21), (0.22, -0.29), (0.45, -0.2), (0.44, 0.08), (0.3, -0.04), (0.44, -0.01), (0.33, -0.34), (0.2, 0.18), (0.35, -0.89), (0.45, 0.29), (0.37, -0.23), (0.3, -0.07), (0.02, -0.2), (0.3, -0.62), (-0.51, -0.17), (0.12, -0.12), (0.09, -1.33), (0.51, -0.19), (-0.65, 0.54), (0.01, -0.47), (0.41, -0.5), (-1.67, 0.36), (-1.98, 0.26), (-0.06, -0.49), (-0.24, -0.29), (-2.4, 0.56), (-0.01, -0.14), (-0.97, 0.35), (-1.14, -0.06), (-2.47, 0.69), (-2.13, 0.53), (0.25, -0.28), (0.18, -0.54), (-1.52, 0.46), (0.31, -0.29), (0.22, -0.6), (-0.75, -0.93), (-0.06, 0.49), (0.44, -0.17), (-2.19, 0.52), (-1.79, 0.26), (0.53, 0.28), (0.18, -0.49), (-0.13, -0.45), (0.59, 1.57), (-0.1, -0.06), (0.61, 0.82), (-1.27, -0.17), (0.12, -0.07), (0.5, 0.62), (0.27, -0.84), (0.4, -0.61), (0.68, 1.38), (0.37, -0.03), (-0.04, -0.14), (-0.34, -0.73), (0.56, 1.1), (-1.57, -0.54), (-1.82, 0.26), (-0.04, -0.41), (-2.24, 0.63), (0.69, 1.8), (-0.26, -0.46), (0.22, 0.37), (-0.43, -0.29), (0.09, 0.12), (-1.95, 0.15), (-0.49, -0.1), (0.25, 0.19), (0.39, -0.08), (0.11, -0.43)]
ORD_X, ORD_Y = (-3.0, 2.45), (-1.5, 1.8)          # la réplica 1 de «Microbios + N» (CCA2 = 3,2) queda fuera de escala y se marca en el borde superior


def _marca(cls, x, y, r, extra=""):
    forma = cls.split()[1]
    if forma == "cir":
        return f'<circle class="pt {cls}" cx="{f(x)}" cy="{f(y)}" r="{f(r)}"{extra}/>'
    if forma == "cua":
        return f'<rect class="pt {cls}" x="{f(x - r * .9)}" y="{f(y - r * .9)}" width="{f(1.8 * r)}" height="{f(1.8 * r)}"{extra}/>'
    if forma == "tri":
        return f'<path class="pt {cls}" d="M{f(x)} {f(y - 1.2 * r)}L{f(x + 1.1 * r)} {f(y + .85 * r)}H{f(x - 1.1 * r)}Z"{extra}/>'
    return f'<path class="pt {cls}" d="M{f(x)} {f(y - 1.3 * r)}L{f(x + 1.1 * r)} {f(y)}L{f(x)} {f(y + 1.3 * r)}L{f(x - 1.1 * r)} {f(y)}Z"{extra}/>'


def figura_ec(var):
    v = VARIANTES[var]
    ancho = var == "w"
    L, T, B = v["ml"], v["mt"], v["H"] - v["mb"]
    k = (B - T) / (ORD_Y[1] - ORD_Y[0])                         # misma escala en los dos ejes (px por unidad)
    R = L + k * (ORD_X[1] - ORD_X[0])
    X = lambda x: L + (x - ORD_X[0]) * k
    Y = lambda y: B - (y - ORD_Y[0]) * k
    r = 4.2 if ancho else 3.4
    p = [f'<path class="eje" d="M{f(L)} {f(T)}V{f(B)}H{f(R)}"/>']
    for t in (-3, -2, -1, 0, 1, 2):
        p.append(f'<path class="eje" d="M{f(X(t))} {f(B)}v4"/><text class="tick" x="{f(X(t))}" y="{f(B + 16)}" text-anchor="middle">{str(t).replace("-", "−")}</text>')
    for t in (-1, 0, 1):
        p.append(f'<path class="eje" d="M{f(L)} {f(Y(t))}h-4"/><text class="tick" x="{f(L - 7)}" y="{f(Y(t) + 4)}" text-anchor="end">{str(t).replace("-", "−")}</text>')
    p.append(f'<text class="titulo" x="{f((L + R) / 2)}" y="{f(v["H"] - 7)}" text-anchor="middle">CCA1</text>')
    ROT = {"S": (9, 6, "start"), "C org.": (-4, -5, "end"), "Mn": (-4, 13, "end"), "Ca": (2, -6, "end"), "pH": (4, 13, "end") if not ancho else (6, 4, "start")}   # rótulos que se corren para no chocar
    p.append(f'<text class="titulo" transform="translate({f(v["tt"])} {f((T + B) / 2)}) rotate(-90)" text-anchor="middle">CCA2</text>')
    p.append(f'<text class="sello" x="{f(v["W"] - v["mr"])}" y="{f(v["H"] - 7)}" text-anchor="end">{"Datos publicados, fig. 6 redibujada" if ancho else "Publicado"}</text>')
    p.append(f'<path class="cero" d="M{f(X(0))} {f(T)}V{f(B)}M{f(L)} {f(Y(0))}H{f(R)}"/>')
    p.append('<path class="tax" d="' + "".join(f"M{f(X(x))} {f(Y(y))}h0" for x, y in ORD_TAX if ORD_Y[0] < y < ORD_Y[1]) + '"/>')
    vec, rot = [], []
    for nombre, x, y, rw, rn in ORD_VEC:
        x1, y1 = X(x), Y(y)
        dx, dy = x1 - X(0), y1 - Y(0)
        n = math.hypot(dx, dy)
        ux, uy = dx / n, dy / n
        a = 4.5 if ancho else 3.6                                # punta de flecha
        vec.append(f"M{f(X(0))} {f(Y(0))}L{f(x1)} {f(y1)}M{f(x1 - a * (ux + .55 * uy))} {f(y1 - a * (uy - .55 * ux))}L{f(x1)} {f(y1)}L{f(x1 - a * (ux - .55 * uy))} {f(y1 - a * (uy + .55 * ux))}")
        if rw if ancho else rn:
            tx, ty, anc = x1 + 6 * ux, y1 + 6 * uy + 4, ("start" if ux > .3 else "end" if ux < -.3 else "middle")
            if nombre in ROT:
                tx, ty, anc = x1 + ROT[nombre][0], y1 + ROT[nombre][1], ROT[nombre][2]
            rot.append(f'<text x="{f(tx)}" y="{f(ty)}" text-anchor="{anc}">{nombre}</text>')
    p.append(f'<path class="vec" d="{"".join(vec)}"/>')
    p.append(f'<g class="vecr">{"".join(rot)}</g>')
    i = 0
    for grupo, (cls, pts) in ORD_SITIOS.items():
        for x, y in pts:
            if y > ORD_Y[1]:                                    # fuera de escala: en el borde superior, con una flecha
                p.append(_marca(cls, X(x), T + r + 1, r, f' style="--i:{i}"') + f'<path class="fuera" d="M{f(X(x))} {f(T - 7)}v-5m-3 3l3 -3l3 3"/>')
            else:
                p.append(_marca(cls, X(x), Y(y), r, f' style="--i:{i}"'))
            i += 1
    lx, ly, paso = R + (26 if ancho else 12), T + (10 if ancho else 6), (19 if ancho else 16)
    ley = []
    for j, (grupo, (cls, _)) in enumerate(ORD_SITIOS.items()):
        ley.append(_marca(cls, lx, ly + j * paso, r).replace('class="pt ', 'class="') + f'<text x="{f(lx + 10)}" y="{f(ly + j * paso + 4)}">{grupo if ancho else ORD_CORTO.get(grupo, grupo)}</text>')
    yb = ly + 6 * paso + 4
    ley.append(f'<path class="tax" d="M{f(lx)} {f(yb)}h0"/><text class="men" x="{f(lx + 10)}" y="{f(yb + 4)}">{"taxones (órdenes)" if ancho else "taxones"}</text>')
    ley.append(f'<path class="vec" d="M{f(lx - 5)} {f(yb + paso)}h10m-3 -2.5l3 2.5l-3 2.5"/><text class="men" x="{f(lx + 10)}" y="{f(yb + paso + 4)}">{"química del suelo" if ancho else "química"}</text>')
    if ancho:
        ley.append(f'<text class="men" x="{f(lx - 6)}" y="{f(B - 16)}">↑ una réplica queda</text><text class="men" x="{f(lx + 6)}" y="{f(B - 1)}">fuera de escala</text>')
    p.append(f'<g class="leyenda">{"".join(ley)}</g>')
    aria = ("Gráfico de ordenación redibujado de la figura 6 de Moreira-Grez y otros, 2019: análisis de correspondencia canónica de las comunidades bacterianas de un suelo de acopio minero. "
            "Cada marcador es una muestra, en seis grupos de tres réplicas: Inóculo, Microbios más nitrógeno, Microbios, Nitrógeno, Basal y Control. Las tres muestras del inóculo quedan lejos, a la izquierda; "
            "las demás se agrupan a la derecha, ordenadas de arriba abajo desde Microbios más nitrógeno hasta Control. Los puntos tenues son los taxones y las flechas, la química del suelo: "
            "pH y calcio apuntan hacia las muestras de suelo; sodio, carbono orgánico, potasio y manganeso, hacia el inóculo.")
    cuerpo = "\n  ".join(p)
    return f'<svg class="fig {var} ec ord" viewBox="0 0 {v["W"]} {v["H"]}" role="img" aria-label="{aria}">\n  {cuerpo}\n</svg>'


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
    out["sip"] = figura_sip()
    out["citas"] = figura_citas()
    return out


def main():
    svgs = todas()
    if "--pegar" in sys.argv:
        s = open(INDEX, encoding="utf-8").read()
        for k, v in svgs.items():
            s, n = re.subn(rf"(<!-- fig:{k} -->)\n.*?\n(\s*<!-- /fig:{k} -->)", lambda m: f"{m.group(1)}\n{v}\n{m.group(2)}", s, flags=re.S)
            assert n in (0, 1), k   # 068: las figuras que ya no están en la página (sip, citas) se saltan
        open(INDEX, "w", encoding="utf-8").write(s)
        print("pegado:", {k: len(v) for k, v in svgs.items()})
    else:
        for k, v in svgs.items():
            print(f"<!-- fig:{k} -->\n{v}\n<!-- /fig:{k} -->")
    d = datos_flota()
    print(f"flota: {FLOTA_N} buses; se desvía el bus {d['k']}; aviso el día {d['aviso']} (la deriva empieza el {DS_INICIO}; revisión el {DS_REVISION})", file=sys.stderr)

if __name__ == "__main__":
    main()
