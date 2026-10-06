#!/usr/bin/env python3
"""Escena de Manim de la serie de la portada (iteración 012).

Una sola escena continua con los tres escenarios de `serie.py`, en este orden: Data science →
Docencia → Ecología. Se renderiza a cuadros PNG con fondo transparente y `empaquetar_cuadros.py`
los convierte a WebP y escribe el índice de fases que lee el JS de `index.html`, que avanza la
animación con el scroll (ver README, «La animación»).

Qué pasa, en el tiempo de la escena:
  1. Data science: aparecen los ejes finos y «datos simulados»; el rótulo «Data science · °C» se
     escribe (Write); la línea se traza de izquierda a derecha en color neutro; al llegar al punto
     de alerta un círculo pulsa una vez, queda un punto, y el resto de la línea se traza en el
     color de acento.
  2. Transformación a Docencia: la línea se deforma hasta ser la siguiente (Transform), en neutro;
     las marcas de los ejes cambian a la escala nueva con un fundido; el rótulo también; el punto se apaga.
  3. Docencia, la alerta: el círculo pulsa en el punto de alerta y, desde ahí, la línea pasa al
     acento hasta el final (un barrido).
  4. Transformación a Ecología y 5. su alerta, igual.
Lo que no se ve aquí (las pausas mientras se lee) no se renderiza: la página repite el cuadro.

Dos conjuntos de cuadros, elegidos con la variable de entorno SERIE_SET:
  w  ancho, 2400×300 (8:1), para pantallas de 900 px o más (se muestra a la mitad: 1152×144 máx.)
  n  angosto, 1200×340, para celular y tablet (se muestra a ~0,3: 358×101 en un celular de 390 px)

Render (entorno de ~/.local/share/manim-env, ver README):
  SERIE_SET=w SERIE_MARCAS=/tmp/anim/marcas-w.json manim render -t --format png --disable_caching \
      --media_dir /tmp/anim scripts/animacion.py Serie
Las marcas de fase (índices de cuadro) quedan en SERIE_MARCAS.

Todo lo que dibuja viene de serie.py (datos simulados, semilla fija): nada es dato real.
"""
import json
import os
import sys
from pathlib import Path

import numpy as np
from manim import (
    DOWN, LEFT, RIGHT, UP, CapStyleType, Circle, Create, Dot, FadeIn, FadeOut, Line, LineJointType, Scene, Text, Transform,
    UpdateFromAlphaFunc, VGroup, VMobject, Write, config, linear, rate_functions,
)

sys.path.insert(0, str(Path(__file__).resolve().parent))
from serie import H as SH  # noqa: E402  (viewBox 1200×260 de serie.py)
from serie import W as SW  # noqa: E402
from serie import escenarios  # noqa: E402

SET = os.environ.get("SERIE_SET", "w")
PX = {"w": (2400, 300), "n": (1200, 340)}[SET]
FH = 3.0                                   # alto del cuadro en unidades de Manim
FW = FH * PX[0] / PX[1]
PPU = PX[1] / FH                           # píxeles por unidad
config.pixel_width, config.pixel_height = PX
config.frame_width, config.frame_height = FW, FH
config.frame_rate = 24

# Paleta: la del panel oscuro de index.html (--panel y --p-*), que es el mismo en los dos temas.
NEUTRO, ACENTO, ALERTA = "#8E95A8", "#A7B5FF", "#FF8B57"
EJE, TINTA, APAGADO = "#4F5775", "#E9EBF2", "#A4ABC0"
FUENTE = os.environ.get("SERIE_FUENTE", "DejaVu Sans Mono")

# Tamaños en píxeles CSS que se quieren ver en pantalla, convertidos a píxeles del cuadro
# según cuánto se reduce cada conjunto al mostrarse (w: 1152/2400; n: ~358/1200).
ESCALA = {"w": 1152 / 2400, "n": 358 / 1200}[SET]
def px(css):  # píxeles del cuadro para `css` píxeles en pantalla
    return css / ESCALA
def sw(css):  # stroke_width de Manim (1 = 0,01 unidades) para un trazo de `css` píxeles en pantalla
    return px(css) / (PPU * 0.01)

ALTO_ROTULO, ALTO_SIM = px(12.5) / PPU, px(9.5) / PPU   # alto de «Hg» en unidades
M_IZQ, M_DER, M_SUP, M_INF = 0.16, 0.10, ALTO_ROTULO + 0.16, 0.20
ANCHO_LINEA, ANCHO_EJE, ANCHO_TICK = sw(2.6), sw(1), sw(1)
TICK = 0.07                                # largo de las marcas de los ejes, en unidades
PASO_Y = {"ds": 1.0, "do": 2.0, "ec": 0.1}  # separación de las marcas del eje vertical, en la unidad de cada escenario
N_STOPS = 240                               # resolución del degradado neutro → acento a lo largo de la línea

T_EJES, T_ROTULO, T_LINEA, T_PULSO, T_TRANSF, T_BARRIDO = 0.6, 0.8, 2.0, 0.6, 1.2, 1.5


def a_cuadro(x, y):
    """De coordenadas del viewBox de serie.py (1200×260) al cuadro de Manim."""
    fx = -FW / 2 + M_IZQ + x / SW * (FW - M_IZQ - M_DER)
    fy = FH / 2 - M_SUP - y / SH * (FH - M_SUP - M_INF)
    return np.array([fx, fy, 0.0])


def texto(s, alto, color):
    t = Text(s, font=FUENTE, color=color)
    ref = Text("Hg", font=FUENTE)
    return t.scale(alto / ref.height)


def ejes():
    """Los dos ejes finos (son los mismos en los tres escenarios)."""
    x0, x1 = a_cuadro(0, SH), a_cuadro(SW, SH)
    y0, y1 = a_cuadro(0, SH), a_cuadro(0, 0)
    return VGroup(Line(x0, x1, color=EJE, stroke_width=ANCHO_EJE), Line(y0, y1, color=EJE, stroke_width=ANCHO_EJE))


def marcas_ejes(e):
    """Las marcas de la escala: una por muestreo en x; en y, cada PASO_Y unidades del escenario."""
    m = e["_meta"]
    g = VGroup()
    for x in m["xs"]:
        p = a_cuadro(x, SH)
        g.add(Line(p, p + DOWN * TICK, color=EJE, stroke_width=ANCHO_TICK))
    top, bot, paso = m["top"], m["bot"], PASO_Y[e["id"]]
    for v in np.arange(np.ceil(bot / paso) * paso, top, paso):
        y = 18 + (top - v) / (top - bot) * (SH - 36)
        p = a_cuadro(0, y)
        g.add(Line(p, p + LEFT * TICK, color=EJE, stroke_width=ANCHO_TICK))
    return g


def puntos(e):
    m = e["_meta"]
    return [a_cuadro(x, y) for x, y in zip(m["xs"], m["ys"])]


def fraccion_alerta(e):
    """Dónde cae la alerta a lo largo del ancho de la línea (0 = inicio, 1 = fin)."""
    xs = e["_meta"]["xs"]
    return (xs[e["hit"]] - xs[0]) / (xs[-1] - xs[0])


def stops(a, barrido):
    """Colores del degradado: neutro antes de la alerta; acento desde la alerta hasta donde llegó el barrido."""
    out = []
    for i in range(N_STOPS):
        u = i / (N_STOPS - 1)
        out.append(ACENTO if a <= u <= a + barrido * (1 - a) + 1e-9 else NEUTRO)
    return out


def linea(e, barrido):
    """La línea entera como un solo trazo con degradado horizontal (Cairo lo tiende de borde a borde)."""
    v = VMobject()
    v.set_points_as_corners(puntos(e))
    v.set_stroke(color=stops(fraccion_alerta(e), barrido), width=ANCHO_LINEA)
    v.set_sheen_direction(RIGHT)  # el degradado va de izquierda a derecha (por defecto es diagonal)
    v.joint_type = LineJointType.ROUND; v.cap_style = CapStyleType.ROUND
    return v


def tramo(e, desde, hasta, color):
    v = VMobject()
    v.set_points_as_corners(puntos(e)[desde:hasta + 1])
    v.set_stroke(color=color, width=ANCHO_LINEA)
    v.joint_type = LineJointType.ROUND; v.cap_style = CapStyleType.ROUND
    return v


class Serie(Scene):
    def construct(self):
        esc = escenarios()
        marcas = {}
        fps = config.frame_rate

        def marca(nombre):
            marcas[nombre] = int(round(self.renderer.time * fps))

        ds, do, ec = esc
        rotulos = {e["id"]: texto(e["rotulo"], ALTO_ROTULO, TINTA) for e in esc}
        for r in rotulos.values():
            r.align_to(a_cuadro(0, 0) + LEFT * M_IZQ, LEFT).align_to(np.array([0, FH / 2 - 0.06, 0]), UP)
        sim = texto("datos simulados", ALTO_SIM, APAGADO)
        sim.align_to(np.array([FW / 2 - M_DER, 0, 0]), RIGHT).align_to(rotulos["ds"], DOWN)

        def punto_alerta(e):
            return puntos(e)[e["hit"]]

        def radio(css):
            return px(css) / PPU

        def pulso(e):
            """Un círculo que pulsa una vez en el punto de alerta y un punto que queda."""
            c = punto_alerta(e)
            anillo = Circle(radius=radio(5), color=ALERTA, stroke_width=sw(2)).move_to(c)
            punto = Dot(c, radius=radio(4), color=ALERTA)
            return anillo, punto

        # ---- 1. Data science: ejes, rótulo, trazo con alerta ----
        marca("dsDraw")
        ej, tk = ejes(), marcas_ejes(ds)
        self.play(Create(ej), FadeIn(tk), FadeIn(sim), run_time=T_EJES)
        rot = rotulos["ds"]
        self.play(Write(rot), run_time=T_ROTULO)
        a = fraccion_alerta(ds)
        pre = tramo(ds, 0, ds["hit"], NEUTRO)
        post = tramo(ds, ds["hit"], ds["n"] - 1, ACENTO)
        self.play(Create(pre), run_time=T_LINEA * a, rate_func=linear)
        anillo, punto = pulso(ds)
        self.add(punto)
        self.play(anillo.animate.scale(3.2).set_stroke(opacity=0), run_time=T_PULSO)
        self.remove(anillo)
        self.play(Create(post), run_time=T_LINEA * (1 - a), rate_func=linear)
        lin = linea(ds, 1.0)
        self.remove(pre, post)
        self.add(lin)

        # ---- 2 a 5. transformación y alerta de los siguientes ----
        def transformar(nombre, e_sig):
            nonlocal tk, rot, lin, punto
            marca(nombre)
            tk2, rot2, lin2 = marcas_ejes(e_sig), rotulos[e_sig["id"]], linea(e_sig, 0.0)
            # Las marcas de la escala se funden (transformarlas una a una deja trazos sueltos); los ejes no cambian.
            self.play(
                Transform(lin, lin2), FadeOut(tk), FadeIn(tk2),
                FadeOut(rot), FadeIn(rot2), FadeOut(punto),
                run_time=T_TRANSF, rate_func=rate_functions.ease_in_out_cubic,
            )
            self.remove(punto, tk)
            rot, tk = rot2, tk2

        def alerta(nombre, e):
            nonlocal lin, punto
            marca(nombre)
            a = fraccion_alerta(e)
            anillo, punto = pulso(e)
            self.add(punto)

            def barrer(m, t):
                m.set_stroke(color=stops(a, t), width=ANCHO_LINEA)

            self.play(
                UpdateFromAlphaFunc(lin, barrer, run_time=T_BARRIDO, rate_func=linear),
                anillo.animate(run_time=T_PULSO).scale(3.2).set_stroke(opacity=0),
            )
            self.remove(anillo)

        transformar("tDsDo", do)
        alerta("doAlerta", do)
        transformar("tDoEc", ec)
        alerta("ecAlerta", ec)
        marca("fin")

        ruta = os.environ.get("SERIE_MARCAS")
        if ruta:
            Path(ruta).write_text(json.dumps({"set": SET, "px": PX, "fps": fps, "marcas": marcas}))
        print("marcas", marcas)
