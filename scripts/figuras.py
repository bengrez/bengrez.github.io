#!/usr/bin/env python3
"""Genera las tres figuras del sitio (iteración 013) con el look de una figura de paper.

Tres figuras estáticas con distinto nivel de detalle, en este orden: (1) Data science, la más
detallada (cuatro paneles A–D, réplicas, intervalos, letras de significancia, heatmap); (2) Ecología,
intermedia (dos paneles, media ± EE por profundidad, letras, leyenda en recuadro); (3) Docencia, la
mínima (un panel, una variable, un solo color de acento, sin leyenda).

Estilo tomado del paper de biocrust (Moreira-Grez et al., Frontiers in Microbiology 2019, 10:2143,
doi:10.3389/fmicb.2019.02143): ejes en L sin grilla (theme_classic), marcas cortas, puntos grandes
con barras de error ±1 EE con capuchón del mismo color, series desplazadas en x, letras de
significancia centradas sobre la barra, leyenda dentro del área con recuadro negro fino y título en
negrita, rótulos de panel en negrita fuera del área de datos, unidades entre paréntesis, coral
#F86848 y burdeos #900008 para las dos series, y un heatmap divergente RdYlBu invertido con celdas
separadas en blanco y dendrograma de filas.

Todo es sintético, con semilla fija (salida idéntica en cada corrida) y cada figura lo dice. Nada es
dato de estudiantes, de una empresa ni de un sitio real; Docencia usa sólo promedios del curso.

    python3 scripts/figuras.py              # escribe fig/{ds,ec,do}-{w,n}.svg (w: escritorio, n: celular)
    python3 scripts/figuras.py --png /tmp   # además, PNG de revisión en esa carpeta

Las SVG llevan el texto como texto (svg.fonttype none) con la familia Liberation Sans / Arial /
Helvetica, métricamente compatibles entre sí, como las figuras de ggplot del paper, y fondo
transparente: el color de la hoja lo pone el CSS (--paper).
"""
import argparse
import json
import os
import re

import numpy as np
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.lines import Line2D  # noqa: E402
from scipy.cluster import hierarchy  # noqa: E402

CORAL, BURDEOS, INK, GRIS = "#F86848", "#900008", "#1A1A1A", "#6A6A6A"
SELLO = "Datos simulados"
AQUI = os.path.dirname(os.path.abspath(__file__))
DESTINO = os.path.join(os.path.dirname(AQUI), "fig")


def estilo(pt):
    plt.rcParams.update({
        "font.family": "sans-serif",
        "font.sans-serif": ["Liberation Sans", "Arial", "Helvetica", "DejaVu Sans"],
        "font.size": pt, "axes.titlesize": pt, "axes.labelsize": pt + 1, "xtick.labelsize": pt - 0.5,
        "ytick.labelsize": pt - 0.5, "legend.fontsize": pt - 0.5, "legend.title_fontsize": pt + 0.5,
        "axes.spines.top": False, "axes.spines.right": False, "axes.edgecolor": INK, "axes.linewidth": 0.9,
        "axes.labelcolor": INK, "xtick.color": INK, "ytick.color": INK, "text.color": INK,
        "xtick.direction": "out", "ytick.direction": "out", "xtick.major.size": 3, "ytick.major.size": 3,
        "xtick.major.width": 0.9, "ytick.major.width": 0.9, "axes.grid": False, "figure.facecolor": "none",
        "axes.facecolor": "none", "savefig.facecolor": "none", "figure.edgecolor": "none", "svg.fonttype": "none", "svg.hashsalt": "sitio-013",
        "legend.frameon": True, "legend.edgecolor": INK, "legend.fancybox": False, "legend.framealpha": 1,
        "legend.borderpad": 0.45, "legend.handletextpad": 0.3, "legend.labelspacing": 0.25,
        "lines.markersize": 7, "errorbar.capsize": 4, "path.simplify": True,
    })


def letra_panel(ax, letra, pt, dx=-0.06, dy=1.04):
    ax.text(dx, dy, letra, transform=ax.transAxes, fontsize=pt + 2, fontweight="bold", ha="right", va="bottom")


def sello(fig, pt):
    fig.text(0.995, 0.985, SELLO, ha="right", va="top", fontsize=pt - 1.5, color=GRIS, style="italic")


def puntos_ee(ax, x, medias, ees, letras, color, dodge=0.0, lw=1.3, ms=None, pt=9, letra_dy=0.04):
    """Media ± EE con capuchón, del color del punto, y la letra de significancia sobre la barra."""
    xs = np.asarray(x, dtype=float) + dodge
    ax.errorbar(xs, medias, yerr=ees, fmt="o", color=color, ecolor=color, elinewidth=lw, capsize=4,
                capthick=lw, markersize=ms or plt.rcParams["lines.markersize"], zorder=3)
    y0, y1 = ax.get_ylim()
    for xi, m, e, l in zip(xs, medias, ees, letras):
        if l:
            ax.text(xi, m + e + letra_dy * (y1 - y0), l, ha="center", va="bottom", fontsize=pt + 1)


def leyenda(ax, titulo, etiquetas, colores, loc, pt, chica=False):
    manejos = [Line2D([0], [0], marker="o", color="none", markerfacecolor=c, markeredgecolor=c,
                      markersize=6.5 if not chica else 5.5) for c in colores]
    lg = ax.legend(manejos, etiquetas, title=titulo, loc=loc, handlelength=1.0, borderaxespad=0.6,
                   fontsize=pt - 0.5 if not chica else pt - 2, title_fontsize=pt + 0.5 if not chica else pt - 1)
    lg.get_title().set_fontweight("bold")
    lg.get_title().set_ha("left")
    lg.get_frame().set_linewidth(0.9)
    return lg


# ------------------------------------------------------------------ datos simulados (semilla fija)

def datos_ds():
    rng = np.random.default_rng(13)
    dias = np.arange(1, 31)
    # A: temperatura del refrigerante, 3 lecturas por día; deriva desde el día 14, revisión el día 21.
    base = 86.0
    mu = base + np.where(dias >= 13, 0.9 * np.clip(dias - 12, 0, 8), 0) - np.where(dias >= 21, 0.85 * np.clip(dias - 20, 0, 9), 0)
    mu = np.clip(mu, base - 0.5, None)
    lecturas = mu[:, None] + rng.normal(0, 1.1, (30, 3))
    media, ee = lecturas.mean(1), lecturas.std(1, ddof=1) / np.sqrt(3)
    mu_ref, sd_ref = media[:10].mean(), media[:10].std(ddof=1)  # referencia: medias diarias de los primeros 10 días
    fuera = media > mu_ref + 2 * sd_ref
    alerta = int(dias[fuera][0])
    # B: puntaje de riesgo (z) por bus y semana.
    buses = [f"Bus {i:02d}" for i in range(1, 13)]
    semanas = [f"S{i}" for i in range(1, 11)]
    z = rng.normal(0, 0.55, (12, 10))
    z[2, 5:9] += np.array([1.2, 2.0, 2.4, 1.1])      # un bus que se calienta y se revisa
    z[7, 1:5] += np.array([0.8, 1.6, 2.1, 0.9])
    z[9, 7:] += np.array([0.9, 1.5, 2.2])
    z[4, :] -= 0.6
    z[11, 3:7] -= 0.9
    z = (z - z.mean()) / z.std()  # z contra la flota entera: las rachas se ven; por fila se diluían
    enlace = hierarchy.linkage(z, "average")
    orden = hierarchy.leaves_list(enlace)
    # C y D: anticipación y falsas alertas por método y tipo de falla (banco de evaluación a ciegas).
    metodos = ["Reglas", "Modelo", "Reglas + modelo"]
    antic = {"Refrigeración": ([9.5, 22.0, 27.5], [1.6, 2.4, 2.1], ["a", "b", "b"]),
             "Eléctrica": ([5.0, 16.5, 19.0], [1.3, 2.6, 2.2], ["a", "b", "b"])}
    falsas = {"Refrigeración": ([2.4, 11.0, 3.1], [0.5, 2.2, 0.7], ["a", "b", "a"]),
              "Eléctrica": ([4.0, 15.5, 4.6], [0.8, 2.8, 0.9], ["a", "b", "a"])}
    return dict(dias=dias, media=media, ee=ee, mu_ref=mu_ref, sd_ref=sd_ref, alerta=alerta, fuera=fuera,
                z=z, buses=buses, semanas=semanas, enlace=enlace, orden=orden, metodos=metodos, antic=antic, falsas=falsas)


def datos_ec():
    tratamientos = ["Referencia", "Degradado", "Inoculado", "Inoculado\n+ mat. orgánica"]
    shannon = {"Superficie": ([3.9, 3.0, 3.35, 3.55], [0.08, 0.12, 0.14, 0.11], ["a", "c", "bc", "ab"]),
               "Profundo": ([3.75, 2.8, 2.95, 3.3], [0.09, 0.1, 0.13, 0.12], ["a", "b", "b", "ab"])}
    meses = [0, 6, 12, 24]
    funcion = {"Superficie": ([34, 52, 68, 74], [4, 5, 5, 4], ["a", "b", "c", "c"]),
               "Profundo": ([30, 41, 55, 60], [4, 5, 6, 5], ["a", "ab", "bc", "c"])}
    return dict(tratamientos=tratamientos, shannon=shannon, meses=meses, funcion=funcion)


def datos_do():
    etapas = ["Antes del\ntema nuevo", "Tema nuevo", "Tras el\nrefuerzo"]
    return dict(etapas=etapas, media=[71, 48, 68], ee=[3, 4, 3], letras=["a", "b", "a"])


# ------------------------------------------------------------------ figuras

def figura_ds(conjunto, pt):
    d = datos_ds()
    if conjunto == "w":
        fig, axs = plt.subplots(1, 4, figsize=(11.6, 3.2), gridspec_kw=dict(width_ratios=[1.25, 1.3, 1, 1], wspace=0.62))
        a, b, c, dd = axs
    else:
        fig, axs = plt.subplots(2, 2, figsize=(5.6, 3.6), gridspec_kw=dict(hspace=1.0, wspace=0.6))
        (a, b), (c, dd) = axs
    # A: serie con réplicas, referencia ± 2σ y alerta
    lo, hi = d["mu_ref"] - 2 * d["sd_ref"], d["mu_ref"] + 2 * d["sd_ref"]
    a.axhspan(lo, hi, color="#E8E8E8", lw=0, zorder=0)
    a.axhline(d["mu_ref"], color=GRIS, lw=0.9, ls=(0, (4, 3)), zorder=1)
    col = np.where(d["fuera"], CORAL, INK)
    a.errorbar(d["dias"], d["media"], yerr=d["ee"], fmt="none", ecolor=col.tolist() if False else INK, elinewidth=0.8, capsize=2, capthick=0.8, zorder=2)
    for xi, yi, ei, ci in zip(d["dias"], d["media"], d["ee"], col):
        a.errorbar([xi], [yi], yerr=[ei], fmt="o", color=ci, ecolor=ci, elinewidth=0.8, capsize=2, capthick=0.8, markersize=4.2, zorder=3)
    a.axvline(d["alerta"], color=BURDEOS, lw=0.9, ls=(0, (2, 2)), zorder=1)
    a.set_ylim(lo - (3.0 if conjunto == "w" else 3.8), d["media"].max() + 3.2)
    a.text(d["alerta"] - 0.5, a.get_ylim()[1], "alerta", color=BURDEOS, fontsize=pt - 0.5, ha="right", va="top")
    a.text(1, lo - 1.3, "referencia ± 2σ" if conjunto == "w" else "referencia\n± 2σ", color=GRIS, fontsize=pt - 2, ha="left", va="top", linespacing=1.0)
    a.set_xlabel("Día")
    a.set_ylabel("Temperatura del refrigerante (°C)" if conjunto == "w" else "Refrigerante (°C)")
    a.set_xticks([1, 10, 20, 30])
    # B: heatmap con dendrograma de filas (Fig. 2 del paper)
    orden = d["orden"]
    z = d["z"][orden]
    im = b.imshow(z, cmap="RdYlBu_r", vmin=-2, vmax=2, aspect="auto", interpolation="nearest")
    b.set_xticks(np.arange(10) - 0.5, minor=True)
    b.set_yticks(np.arange(12) - 0.5, minor=True)
    b.grid(which="minor", color="white", lw=1.2)
    b.tick_params(which="minor", length=0)
    b.set_xticks(range(10))
    b.set_xticklabels(d["semanas"], rotation=90)
    b.set_yticks(range(12))
    b.set_yticklabels([d["buses"][i] for i in orden])
    b.yaxis.tick_right()
    b.tick_params(axis="both", length=0)
    for s in b.spines.values():
        s.set_visible(False)
    b.set_xlabel("Semana")
    if conjunto == "n":
        b.set_yticks([])
        b.tick_params(axis="x", labelsize=pt - 3)
        b.set_xlabel("")
    fig.tight_layout(pad=0.6, rect=(0, 0.03, 1, 1))
    cb = fig.colorbar(im, ax=b, orientation="horizontal", fraction=0.05, pad=0.22 if conjunto == "w" else 0.3,
                      aspect=18, shrink=0.75, ticks=[-2, 0, 2])
    cb.ax.tick_params(labelsize=pt - 2, length=2)
    cb.outline.set_linewidth(0.6)
    cb.set_label("Riesgo de falla (z)" if conjunto == "w" else "Riesgo de falla (z), 12 buses × 10 semanas", fontsize=pt - 1.5, labelpad=1)
    # dendrograma a la izquierda, dibujado a mano sobre un eje pegado (después del layout, para que
    # mida lo mismo que el heatmap)
    pos = b.get_position()
    dw = 0.05 if conjunto == "w" else 0.07
    dax = fig.add_axes([pos.x0 - dw - 0.004, pos.y0, dw, pos.height])
    dn = hierarchy.dendrogram(d["enlace"], orientation="left", no_labels=True, ax=dax, color_threshold=0,
                              above_threshold_color=INK, link_color_func=lambda k: INK)
    dax.set_axis_off()
    dax.set_ylim(len(orden) * 10, 0)
    for ln in dax.collections:
        ln.set_linewidth(0.8)
    # C: anticipación, media ± EE por método y tipo de falla, con letras
    x = np.arange(3)
    c.set_xlim(-0.5, 2.5)
    c.set_ylim(0, 48)
    c.set_yticks([0, 10, 20, 30, 40])
    puntos_ee(c, x, *d["antic"]["Refrigeración"], CORAL, dodge=-0.14, pt=pt)
    puntos_ee(c, x, *d["antic"]["Eléctrica"], BURDEOS, dodge=0.14, pt=pt)
    c.set_xticks(x)
    c.set_xticklabels(["Reglas", "Modelo", "Reglas +\nmodelo"])
    c.set_ylabel("Anticipación a la falla (h)" if conjunto == "w" else "Anticipación (h)")
    c.set_xlabel("Método")
    if conjunto == "w":
        leyenda(c, "Tipo de falla", ["Refrigeración", "Eléctrica"], [CORAL, BURDEOS], "upper left", pt)
    else:  # en celular no cabe el recuadro dentro del panel: va en una fila sobre C, sin título
        manejos = [Line2D([0], [0], marker="o", color="none", markerfacecolor=col, markeredgecolor=col, markersize=5.5) for col in (CORAL, BURDEOS)]
        lg = c.legend(manejos, ["Refrigeración", "Eléctrica"], loc="lower left", bbox_to_anchor=(-0.3, 1.0), ncol=2,
                      fontsize=pt - 3, handlelength=0.9, columnspacing=0.7, handletextpad=0.25, borderaxespad=0.0, frameon=True)
        lg.get_frame().set_linewidth(0.9)
    # D: falsas alertas, eje y logarítmico (como la Fig. 6B)
    dd.set_xlim(-0.5, 2.5)
    dd.set_yscale("log")
    dd.set_ylim(1, 60)
    puntos_ee(dd, x, *d["falsas"]["Refrigeración"], CORAL, dodge=-0.14, pt=pt, letra_dy=0.0)
    puntos_ee(dd, x, *d["falsas"]["Eléctrica"], BURDEOS, dodge=0.14, pt=pt, letra_dy=0.0)
    # en escala log las letras van a un factor fijo sobre la barra
    for t in list(dd.texts):
        t.set_y(t.get_position()[1] * 1.25)
    dd.set_xticks(x)
    dd.set_xticklabels(["Reglas", "Modelo", "Reglas +\nmodelo"])
    dd.set_ylabel("Falsas alertas (por 100 buses·semana)" if conjunto == "w" else "Falsas alertas\n(por 100 buses·semana)")
    dd.set_xlabel("Método")
    dd.set_yticks([1, 3, 10, 30])
    dd.set_yticklabels(["1", "3", "10", "30"])
    dd.yaxis.set_minor_locator(matplotlib.ticker.NullLocator())
    for ax, L in zip((a, b, c, dd), "ABCD"):
        letra_panel(ax, L, pt, dx=(-0.3 if ax is b else -0.24) if conjunto == "w" else (-0.3 if ax is b else -0.5), dy=1.03)
    for ax in (c, dd):
        for lab in ax.get_xticklabels():
            lab.set_fontsize(pt - 1)
    sello(fig, pt)
    return fig


def figura_ec(conjunto, pt):
    d = datos_ec()
    if conjunto == "w":
        fig, (a, b) = plt.subplots(1, 2, figsize=(8.2, 3.15), gridspec_kw=dict(width_ratios=[1.15, 1], wspace=0.38))
    else:
        fig, (a, b) = plt.subplots(1, 2, figsize=(5.6, 2.75), gridspec_kw=dict(width_ratios=[1.15, 1], wspace=0.42))
    x = np.arange(4)
    a.set_xlim(-0.5, 3.5)
    a.set_ylim(2.2 if conjunto == "w" else 2.0, 4.3)
    dg = 0.15 if conjunto == "w" else 0.2
    puntos_ee(a, x, *d["shannon"]["Superficie"], CORAL, dodge=-dg, pt=pt)
    puntos_ee(a, x, *d["shannon"]["Profundo"], BURDEOS, dodge=dg, pt=pt)
    a.set_xticks(x)
    a.set_xticklabels(d["tratamientos"] if conjunto == "w" else ["Ref.", "Degr.", "Inoc.", "Inoc.\n+ m. org."])
    a.set_xlabel("Tratamiento del suelo")
    a.set_ylabel("Índice de diversidad de Shannon")
    leyenda(a, "Profundidad", ["Superficie", "Profundo"], [CORAL, BURDEOS], "lower right", pt, chica=conjunto == "n")
    if conjunto == "n":
        a.set_yticks([2.5, 3.0, 3.5, 4.0])
    b.set_xlim(-0.5, 3.5)
    b.set_ylim(0, 110)
    b.axhline(100, color=GRIS, lw=0.9, ls=(0, (4, 3)), zorder=1)
    b.text(3.45, 101.5, "referencia", color=GRIS, fontsize=pt - 1.5, ha="right", va="bottom")
    puntos_ee(b, x, *d["funcion"]["Superficie"], CORAL, dodge=-dg, pt=pt)
    puntos_ee(b, x, *d["funcion"]["Profundo"], BURDEOS, dodge=dg, pt=pt)
    b.set_xticks(x)
    b.set_xticklabels([str(m) for m in d["meses"]])
    b.set_xlabel("Meses desde la inoculación")
    b.set_ylabel("Función microbiana (% de la referencia)" if conjunto == "w" else "Función microbiana\n(% de la referencia)")
    b.set_yticks([0, 25, 50, 75, 100])
    for ax, L in zip((a, b), "AB"):
        letra_panel(ax, L, pt, dx=-0.2 if conjunto == "w" else -0.3, dy=1.03)
    sello(fig, pt)
    return fig


def figura_do(conjunto, pt):
    d = datos_do()
    if conjunto == "w":
        fig, a = plt.subplots(figsize=(3.7, 3.15))
        fig.subplots_adjust(left=0.24, right=0.96, bottom=0.3, top=0.9)
    else:
        fig, a = plt.subplots(figsize=(3.4, 2.75))
        fig.subplots_adjust(left=0.3, right=0.96, bottom=0.34, top=0.88)
    x = np.arange(3)
    a.set_xlim(-0.5, 2.5)
    a.set_ylim(30, 85)
    cols = [INK, BURDEOS, INK]
    for xi, m, e, l, c in zip(x, d["media"], d["ee"], d["letras"], cols):
        puntos_ee(a, [xi], [m], [e], [l], c, pt=pt)
    a.set_xticks(x)
    a.set_xticklabels(d["etapas"] if conjunto == "w" else ["Antes del\ntema", "Tema\nnuevo", "Tras el\nrefuerzo"])
    a.get_xticklabels()[1].set_color(BURDEOS)
    a.set_xlabel("Momento del curso")
    a.set_ylabel("Logro del curso (% de acierto)" if conjunto == "w" else "Logro del curso\n(% de acierto)")
    a.set_yticks([30, 50, 70])
    sello(fig, pt)
    return fig


def arreglar_svg(ruta):
    """Sin metadatos que cambien entre corridas. (La familia tipográfica ya sale portable: matplotlib
    escribe la lista completa de rcParams, 'Liberation Sans', 'Arial', 'Helvetica', …, métricamente
    compatibles entre sí.)"""
    s = open(ruta, encoding="utf-8").read()
    s = re.sub(r"<dc:date>[^<]*</dc:date>", "<dc:date></dc:date>", s)
    s = re.sub(r"<metadata>.*?</metadata>\s*", "", s, flags=re.S)
    open(ruta, "w", encoding="utf-8").write(s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--png", default=None, help="carpeta para PNG de revisión")
    ap.add_argument("--destino", default=DESTINO)
    args = ap.parse_args()
    os.makedirs(args.destino, exist_ok=True)
    medidas = {}
    for conjunto, pt in (("w", 9.0), ("n", 11.5)):
        estilo(pt)
        for nombre, fn in (("ds", figura_ds), ("ec", figura_ec), ("do", figura_do)):
            fig = fn(conjunto, pt)
            if nombre == "ec":
                fig.tight_layout(pad=0.6, rect=(0, 0.03, 1, 1))
            ruta = os.path.join(args.destino, f"{nombre}-{conjunto}.svg")
            fig.savefig(ruta, format="svg", bbox_inches="tight", pad_inches=0.06, transparent=True)
            arreglar_svg(ruta)
            if args.png:
                fig.savefig(os.path.join(args.png, f"{nombre}-{conjunto}.png"), dpi=200, bbox_inches="tight", pad_inches=0.06, facecolor="white")
            w, h = fig.get_size_inches()
            vb = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', open(ruta, encoding="utf-8").read())
            medidas[f"{nombre}-{conjunto}"] = dict(ancho_in=round(float(w), 2), alto_in=round(float(h), 2), bytes=os.path.getsize(ruta),
                                                   viewbox=[round(float(vb.group(1))), round(float(vb.group(2)))] if vb else None)
            plt.close(fig)
    print(json.dumps(medidas, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
