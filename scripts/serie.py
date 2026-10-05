#!/usr/bin/env python3
"""Genera los tres escenarios de la serie de la portada (iteración 009).

Es el mismo gráfico con otras variables, datos y palabras: medir (réplicas por muestreo),
detectar (la tendencia contra su referencia previa ± 2σ) y explicar y actuar (la curva
reducida a tramos, con la decisión). Orden: (a) data science, (b) docencia, (c) ecología.

Todo es sintético, con semilla fija (salida idéntica en cada corrida). Nada es dato de
estudiantes, de una empresa ni de un sitio real. Docencia usa sólo agregados del curso.

    python3 scripts/serie.py json   > /tmp/serie.json      # lo que lee el JS de index.html
    python3 scripts/serie.py html                          # el escenario inicial (a), para pegar en el HTML
    python3 scripts/serie.py meta                          # umbrales, alertas y chequeos

El escenario (c) reproduce, con la semilla original de senales.py, la serie de la 008.
"""
import json
import sys

import numpy as np

W, H = 1200.0, 260.0
K = 2.0  # banda de referencia: media previa ± K·sd


def f(v, nd=1):
    s = f"{v:.{nd}f}".rstrip("0").rstrip(".")
    return s if s not in ("-0", "") else "0"


def loess(ts, ys, half):
    out = []
    for x0 in ts:
        d = np.abs(ts - x0) / half
        w = np.where(d < 1, (1 - d**3) ** 3, 0)
        A = np.vstack([np.ones_like(ts), ts - x0]).T
        beta = np.linalg.lstsq(A * w[:, None] ** 0.5, ys * w**0.5, rcond=None)[0]
        out.append(beta[0])
    return np.array(out)


def dp(p, eps):
    a, b = p[0], p[-1]
    ab = b - a
    d = np.abs(ab[0] * (p[:, 1] - a[1]) - ab[1] * (p[:, 0] - a[0])) / np.hypot(*ab)
    k = int(d.argmax())
    if d[k] > eps:
        return np.vstack([dp(p[:k + 1], eps)[:-1], dp(p[k:], eps)])
    return np.vstack([a, b])


def path_line(p):
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in p)


def build(*, seed, n, rep, curve, sd_pre, sd_post, t_ref, t_split, top, bot, eps, hit, half,
          marks, words, proy=None, proy_from=None, fmt, **texts):
    """curve(t) -> valor verdadero en unidades reales; t_ref: último muestreo de la referencia;
    t_split: hasta dónde la tendencia es un nivel constante; hit(trend, lo, hi, t) -> índice."""
    rng = np.random.default_rng(seed)
    X = lambda t: 24 + t * (W - 48) / (n - 1)
    Y = lambda v: 18 + (top - v) / (top - bot) * (H - 36)
    t = np.arange(n, dtype=float)
    mu = np.array([curve(x) for x in t])
    sd = np.where(t <= t_ref, sd_pre, sd_post)
    samples = mu[:, None] + rng.normal(0, 1, (n, rep)) * sd[:, None]
    pre = samples[t <= t_ref].ravel()
    mu_ref, sd_ref = pre.mean(), pre.std(ddof=1)
    lo, hi = mu_ref - K * sd_ref, mu_ref + K * sd_ref
    means = samples.mean(axis=1)
    pre_i, post_i = t <= t_split, t > t_split
    trend = np.empty(n)
    trend[pre_i] = means[pre_i].mean()
    trend[post_i] = loess(t[post_i], means[post_i], half=half)
    z = (trend - mu_ref) / sd_ref
    h = hit(trend, lo, hi, z, t)
    pts = np.column_stack([[X(x) for x in t], [Y(v) for v in trend]])
    simple = dp(pts, eps)
    assert (pts >= 0).all() and (simple >= 0).all()
    d = {
        "n": n,
        "hit": int(h),
        "z": [round(float(v), 1) for v in z],
        "val": [round(float(v) * (100 if fmt.get("x100") else 1), 1) for v in trend],
        "dots": " ".join(f"M{f(X(ti))} {f(Y(v))}h0" for ti, row in zip(t, samples) for v in row),
        "trend": path_line(pts),
        "simple": path_line(simple),
        "ref": {"y": f(Y(hi)), "h": f(Y(lo) - Y(hi)), "mid": f(Y(mu_ref))},
        "marks": [f(X(m)) for m in marks],
        "alert": {"l": f(X(h) / W * 100, 2), "t": f(Y(trend[h]) / H * 100, 2)},
        "fmt": fmt,
        "words": [dict(x, l=f(X(x["t"]) / W * 100 + x.get("dx", 0), 1),
                       tp=f(Y(x["v"]) / H * 100 + x.get("dy", 0), 1)) if "v" in x else x for x in words],
        **texts,
    }
    for w in d["words"]:
        for k in ("t", "v", "dx", "dy"):
            w.pop(k, None)
    if proy:
        q = np.array([[X(x), Y(proy(x))] for x in np.arange(proy_from, n)])
        d["proy"] = path_line(q)
        d["proy_end"] = (X(n - 1) / W * 100, Y(proy(n - 1)) / H * 100)
    d["_meta"] = dict(mu_ref=float(mu_ref), sd_ref=float(sd_ref), lo=float(lo), hi=float(hi),
                      hit=int(h), z_hit=float(z[h]), trend_hit=float(trend[h]),
                      trend_min=float(trend.min()), trend_max=float(trend.max()))
    return d


# ---------------------------------------------------------------------------
# (a) Data science: telemetría de un bus. La temperatura del refrigerante deriva
# desde el día 10; la tendencia sale de la banda normal hacia el día 15 y se revisa
# el día 19, mucho antes de que llegara a niveles de falla. Sin la revisión (línea
# punteada) seguía subiendo.
# ---------------------------------------------------------------------------
DS_N, DS_D, DS_ACT, DS_BASE, DS_A = 30, 9, 18, 88.0, 12.0


def ds_drift(t):
    return DS_BASE + DS_A * ((t - DS_D) / (DS_N - 1 - DS_D)) ** 1.15 if t > DS_D else DS_BASE


def ds_curve(t):
    if t <= DS_ACT:
        return ds_drift(t)
    return DS_BASE + (ds_drift(DS_ACT) - DS_BASE) * np.exp(-(t - DS_ACT) / 1.6)


def ds_hit(trend, lo, hi, z, t):
    for i in range(DS_D + 1, len(t) - 1):
        if z[i] > K and z[i + 1] > K:
            return i
    raise AssertionError("no se alerta")


# ---------------------------------------------------------------------------
# (b) Docencia: logro agregado de un curso en un tema, a lo largo de ensayos. Un tema
# nuevo hace caer el logro; la tendencia sale de la banda en el ensayo 9 y se refuerza
# en el 11, antes de la evaluación final. Sólo promedios del curso, nunca estudiantes.
# ---------------------------------------------------------------------------
DO_N, DO_D, DO_ACT, DO_BASE = 14, 6.5, 10, 72.0


def do_decl(t):
    return DO_BASE - 16.0 * (1 - np.exp(-(t - DO_D) / 2.2)) if t > DO_D else DO_BASE


def do_curve(t):
    if t <= DO_ACT:
        return do_decl(t)
    return 71.0 - (71.0 - do_decl(DO_ACT)) * np.exp(-(t - DO_ACT) / 1.6)


def do_hit(trend, lo, hi, z, t):
    for i in range(int(DO_D) + 1, len(t) - 1):
        if z[i] < -K and z[i + 1] < -K:
            return i
    raise AssertionError("no se alerta")


# ---------------------------------------------------------------------------
# (c) Ecología: igual que en la 008 (misma semilla y mismo modelo que senales.py).
# ---------------------------------------------------------------------------
EC_TP, EC_TMIN, EC_VMIN, EC_PLAT, EC_TAU = 7.5, 11.0, 0.46, 0.845, 3.2


def ec_curve(t):
    if t <= EC_TP:
        return 1.0
    if t <= EC_TMIN:
        u = (t - EC_TP) / (EC_TMIN - EC_TP)
        return 1.0 - (1.0 - EC_VMIN) * (1 - np.cos(np.pi * u)) / 2
    return EC_PLAT - (EC_PLAT - EC_VMIN) * np.exp(-(t - EC_TMIN) / EC_TAU)


def ec_hit(trend, lo, hi, z, t):
    for i in range(int(EC_TMIN) + 5, len(t)):
        win = trend[i - 4:i + 1]
        if (win < lo).all() and abs(np.polyfit(np.arange(5), win, 1)[0]) < 0.006:
            assert trend[i:].max() < lo
            return i
    raise AssertionError("la meseta no se confirma bajo la banda")


def escenarios():
    ds = build(
        seed=20261001, n=DS_N, rep=3, curve=ds_curve, sd_pre=0.7, sd_post=0.8, t_ref=DS_D, t_split=DS_D,
        top=102.0, bot=85.0, eps=7.0, hit=ds_hit, half=3.0, marks=[DS_D + 0.5, DS_ACT],
        proy=ds_drift, proy_from=DS_ACT, fmt={"suf": " °C", "dec": 1},
        id="ds", tab="Data science",
        titulo="Un bus: temperatura del refrigerante, por día",
        pasos=["3 lecturas por día", "banda normal: primeros 10 días ± 2σ", "deriva, alerta y revisión"],
        nota="Un bus de la flota: la temperatura empieza a derivar y se revisa antes de que falle.",
        unidad="día", hit_txt="alerta: sale de la banda normal",
        aria=("Esquema con datos simulados: la temperatura del refrigerante de un bus se mantiene estable, empieza a "
              "derivar hacia arriba, sale de su banda normal y dispara una alerta; se revisa el bus y la temperatura "
              "vuelve a lo normal, mientras que sin la revisión habría seguido subiendo hasta la falla. Se muestra "
              "tres veces a la vez: como lecturas de cada día, como una tendencia comparada con su banda normal, con "
              "la alerta, y como la misma curva reducida a tramos con palabras."),
        words=[
            {"t": 0.6, "v": 90.4, "txt": "estable", "m": 0},
            {"t": DS_D + 0.5, "v": 100.6, "txt": "empieza a derivar", "dx": 0.6, "m": 0},
            {"t": 14, "v": 86.2, "txt": "alerta", "m": 1, "dx": 0},
            {"t": DS_ACT, "v": 100.6, "txt": "se revisa el bus", "dx": 0.6, "m": 1},
            {"t": 28.5, "v": 101.3, "txt": "sin revisar, falla", "izq": 1, "m": 0},
            {"t": 26, "v": 86.2, "txt": "vuelve a lo normal", "izq": 1, "m": 0},
        ],
    )
    do = build(
        seed=20261002, n=DO_N, rep=3, curve=do_curve, sd_pre=2.0, sd_post=2.5, t_ref=6, t_split=6,
        top=80.0, bot=50.0, eps=7.0, hit=do_hit, half=2.5, marks=[DO_D, DO_ACT],
        proy=do_decl, proy_from=DO_ACT, fmt={"suf": " % de acierto", "dec": 0},
        id="do", tab="Docencia",
        titulo="Un curso: logro en un tema, por ensayo",
        pasos=["3 preguntas del tema por ensayo", "referencia: primeros 7 ensayos ± 2σ", "caída, alerta y refuerzo"],
        nota="Un curso a lo largo de varios ensayos: un tema se cae y se refuerza antes de la evaluación. Sólo promedios del curso.",
        unidad="ensayo", hit_txt="alerta: el tema se cae",
        aria=("Esquema con datos simulados, sólo promedios del curso: el logro en un tema se mantiene estable a lo largo de "
              "los primeros ensayos, cae cuando aparece un tema nuevo, sale de su banda de referencia y dispara una alerta; "
              "se refuerza el tema y el logro vuelve a la banda, mientras que sin refuerzo habría seguido bajando. Se muestra "
              "tres veces a la vez: como el logro en cada pregunta, como una tendencia comparada con su referencia, con la "
              "alerta, y como la misma curva reducida a tramos con palabras."),
        words=[
            {"t": 0.3, "v": 76.5, "txt": "estable", "m": 0},
            {"t": DO_D, "v": 78.4, "txt": "tema nuevo", "dx": 0.6, "m": 1},
            {"t": 8, "v": 55.5, "txt": "alerta", "izq": 1, "m": 1, "dx": -0.8},
            {"t": DO_ACT, "v": 78.4, "txt": "se refuerza", "dx": 0.6, "m": 1},
            {"t": 12.8, "v": 54.3, "txt": "sin refuerzo, sigue cayendo", "izq": 1, "m": 0},
            {"t": 12.8, "v": 74.6, "txt": "vuelve a la referencia", "izq": 1, "m": 0},
        ],
    )
    ec = build(
        seed=20260922, n=36, rep=3, curve=ec_curve, sd_pre=0.028, sd_post=0.045, t_ref=EC_TP, t_split=EC_TP,
        top=1.12, bot=0.34, eps=9.0, hit=ec_hit, half=3.0, marks=[EC_TP + 0.0],
        fmt={"suf": " % de la referencia", "dec": 0, "x100": 1},
        id="ec", tab="Ecología",
        titulo="Un suelo después de la minería: función microbiana frente a su referencia",
        pasos=["réplicas por muestreo", "referencia previa ± 2σ", "se recupera, pero no del todo"],
        nota="Un suelo restaurado frente a su referencia: se recupera, pero no del todo, y no se da por restaurado.",
        unidad="muestreo", hit_txt="no vuelve a la referencia",
        aria=("Esquema con datos simulados: un sistema estable se perturba, cae y se recupera, pero se estabiliza por "
              "debajo de la banda que marcaba su estado previo. Se muestra tres veces a la vez: como réplicas medidas en "
              "cada muestreo, como una tendencia comparada con esa banda de referencia, con una alerta donde se confirma "
              "que no vuelve, y como la misma curva reducida a tramos con palabras: estable, perturbación, cae, se "
              "recupera, pero no del todo."),
        words=[
            {"t": 0.6, "v": 1.07, "txt": "estable", "m": 0},
            {"t": 8.3, "v": 1.1, "txt": "perturbación", "dx": 0.7, "m": 1},
            {"t": 10.4, "v": 0.67, "txt": "cae", "izq": 1, "m": 0},
            {"t": 15.5, "v": 0.58, "txt": "se recupera", "m": 1},
            {"t": 26.6, "v": 0.58, "txt": "pero no del todo", "m": 1, "fin": 1},
            {"t": 19.8, "v": 1.1, "txt": "no se da por restaurado", "m": 0},
        ],
    )
    return [ds, do, ec]


def fragmento_html(d):
    """El escenario inicial, tal como lo deja el JS: se pega en index.html para que sin JS se vea completo."""
    marks = "".join(f'<path class="perturb" d="M{m} 6V254"/>' for m in d["marks"])
    ws = "\n".join(
        '        <span class="w%s%s" style="left:%s%%;top:%s%%">%s</span>' % (
            " izq" if w.get("izq") else "", (" sm" if w["m"] == 0 else "") + (" fin" if w.get("fin") else ""), w["l"], w["tp"], w["txt"])
        for w in d["words"])
    proy = f'<path class="proy" d="{d["proy"]}"/>' if d.get("proy") else ""
    return "\n".join([
        f'      <svg class="capa medir" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true"><path class="dots" d="{d["dots"]}"/></svg>',
        f'      <svg class="detectar" viewBox="0 0 1200 260" preserveAspectRatio="none" role="img" aria-label="{d["aria"]}"><rect class="ref" x="0" y="{d["ref"]["y"]}" width="1200" height="{d["ref"]["h"]}"/><path class="ref-mid" d="M0 {d["ref"]["mid"]}H1200"/>{marks}<path class="trend" d="{d["trend"]}"/></svg>',
        f'      <span class="alerta" style="left:{d["alert"]["l"]}%;top:{d["alert"]["t"]}%" aria-hidden="true"></span>',
        '      <div class="capa explicar" aria-hidden="true">',
        f'        <svg viewBox="0 0 1200 260" preserveAspectRatio="none">{proy}<path class="simple" d="{d["simple"]}"/></svg>',
        ws,
        '      </div>'])


if __name__ == "__main__":
    modo = sys.argv[1] if len(sys.argv) > 1 else "meta"
    esc = escenarios()
    if modo == "json":
        out = [{k: v for k, v in e.items() if not k.startswith("_")} for e in esc]
        print(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    elif modo == "html":
        print(fragmento_html(esc[0]))
    else:
        for e in esc:
            print(e["id"], json.dumps(e["_meta"], indent=None), "alert", e["alert"], "z[hit]", e["z"][e["hit"]])
