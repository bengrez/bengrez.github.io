#!/usr/bin/env python3
"""Genera los tres escenarios de la serie de la portada (iteración 009, simplificada en la 011).

Es el mismo gráfico con otras variables y datos. Desde la 011 el gráfico muestra sólo la línea (la
tendencia) y la alerta; las réplicas, la referencia ± 2σ, la proyección, las marcas y las palabras se
siguen calculando aquí (la alerta depende de la referencia), pero no se dibujan: lo que significaban
vive en el texto de cada caso de index.html. Orden: (a) data science, (b) docencia, (c) ecología.

Todo es sintético, con semilla fija (salida idéntica en cada corrida). Nada es dato de
estudiantes, de una empresa ni de un sitio real. Docencia usa sólo agregados del curso.

    python3 scripts/serie.py json   > /tmp/serie.json      # lo que lee el JS de index.html (línea, alerta, rótulo)
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


def path_line(p):
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in p)


def build(*, seed, n, rep, curve, sd_pre, sd_post, t_ref, t_split, top, bot, hit, half, **texts):
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
    assert (pts >= 0).all()
    d = {
        "n": n,
        "hit": int(h),
        "trend": path_line(pts),
        "alert": {"l": f(X(h) / W * 100, 2), "t": f(Y(trend[h]) / H * 100, 2)},
        **texts,
    }
    d["_meta"] = dict(mu_ref=float(mu_ref), sd_ref=float(sd_ref), lo=float(lo), hi=float(hi),
                      hit=int(h), z_hit=float(z[h]), trend_hit=float(trend[h]),
                      trend_min=float(trend.min()), trend_max=float(trend.max()),
                      top=float(top), bot=float(bot), xs=[float(X(x)) for x in t], ys=[float(Y(v)) for v in trend])
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
        top=92.3, bot=87.4, hit=ds_hit, half=3.0,
        id="ds", tab="Data science", rotulo="Data science · °C",
        aria=("Gráfico con datos simulados: la temperatura del refrigerante de un bus se mantiene estable, empieza a "
              "derivar hacia arriba y sale de su banda normal; una marca señala la alerta. Se revisa el bus y la "
              "temperatura vuelve a lo normal."),
    )
    do = build(
        seed=20261002, n=DO_N, rep=3, curve=do_curve, sd_pre=2.0, sd_post=2.5, t_ref=6, t_split=6,
        top=73.0, bot=61.0, hit=do_hit, half=2.5,
        id="do", tab="Docencia", rotulo="Docencia · % de acierto",
        aria=("Gráfico con datos simulados, sólo promedios del curso: el logro en un tema se mantiene estable a lo largo "
              "de los primeros ensayos, cae cuando aparece un tema nuevo y sale de su banda de referencia; una marca "
              "señala la alerta. Se refuerza el tema y el logro vuelve a la referencia."),
    )
    ec = build(
        seed=20260922, n=36, rep=3, curve=ec_curve, sd_pre=0.028, sd_post=0.045, t_ref=EC_TP, t_split=EC_TP,
        top=1.04, bot=0.53, hit=ec_hit, half=3.0,
        id="ec", tab="Ecología", rotulo="Ecología · % de la referencia",
        aria=("Gráfico con datos simulados: un sistema estable se perturba, cae y se recupera, pero se estabiliza por "
              "debajo de la banda que marcaba su estado previo; una marca señala dónde se confirma que no vuelve."),
    )
    return [ds, do, ec]


def fragmento_html(d):
    """El escenario inicial, tal como lo deja el JS: se pega en index.html para que sin JS se vea completo."""
    return "\n".join([
        f'      <svg class="trazo" viewBox="0 0 1200 260" preserveAspectRatio="none" role="img" aria-label="{d["aria"]}"><path class="trend" d="{d["trend"]}"/></svg>',
        f'      <span class="alerta" style="left:{d["alert"]["l"]}%;top:{d["alert"]["t"]}%" aria-hidden="true"></span>'])


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
            print(e["id"], json.dumps(e["_meta"], indent=None), "alert", e["alert"])
