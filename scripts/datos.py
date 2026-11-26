#!/usr/bin/env python3
"""Pega en index.html los datos públicos de datos/sitio.json (cifras de Google Scholar y estados de cada caso y herramienta).

Los datos viven en un solo archivo y van en el HTML estático: la página no los carga en tiempo de ejecución y se ve igual sin
JavaScript. Cada dato ocupa un tramo de index.html entre marcadores:

    <!-- dato:ID --> … <!-- /dato:ID -->

y la miniatura de citas por año es la figura <!-- fig:chispa --> de scripts/figuras.py, que lee los mismos datos. Fuera de esos
tramos este script no toca nada: el resto de la página se edita a mano, como siempre.

Quién escribe datos/sitio.json: la sincronización mensual con el vault (vive fuera de este repo, porque su lista de campos nombra
rutas internas) o una persona. En los dos casos este script valida el archivo antes de pegar: tipos, rangos, fechas y estados de un
vocabulario cerrado (ESTADOS). Un valor fuera de lo previsto detiene todo y no escribe nada.

    python3 scripts/datos.py --revisar   # valida y dice si index.html está al día (sale con 1 si no lo está)
    python3 scripts/datos.py --pegar     # valida y pega en index.html
"""
import datetime
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
INDEX = os.path.join(RAIZ, "index.html")
DATOS = os.path.join(RAIZ, "datos", "sitio.json")

# Vocabulario cerrado de estados: clave → (clase CSS del símbolo, texto visible). Las clases son las de index.html (055):
# e-uso verde apagado, e-piloto terracota, e-dev gris.
ESTADOS = {
    "piloto": ("e-piloto", "en piloto"),
    "produccion": ("e-uso", "en producción"),
    "desarrollo": ("e-dev", "en desarrollo"),
    "pausa": ("e-dev", "en pausa"),
    "publicado": ("e-uso", "publicado"),
    "publicada": ("e-uso", "publicada"),
    "en-uso": ("e-uso", "en uso en clases"),
}
# Qué estados admite cada marcador (concordancia de género y sentido: una herramienta no está «en piloto»).
ESTADOS_ADMITIDOS = {
    "data-science": {"piloto", "produccion", "desarrollo", "pausa"},
    "ecologia": {"publicado"},
    "docencia": {"en-uso", "publicada", "desarrollo"},
    "herr-tabla-periodica-reactiva": {"en-uso", "publicada", "desarrollo"},
    "herr-autodiagnostico-bienestar-salud": {"en-uso", "publicada", "desarrollo"},
    "herr-vacunas-rebano": {"en-uso", "publicada", "desarrollo"},
}
PRODUCCION = {  # clave: (singular, plural, mínimo, máximo)
    "articulos": ("artículo", "artículos", 1, 200),
    "capitulos": ("capítulo de libro", "capítulos de libro", 0, 50),
    "patentes": ("patente", "patentes", 0, 20),
    "indice_h": ("índice h", "índice h", 1, 150),
}
CITAS_MAX = 100000
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


class DatosInvalidos(ValueError):
    pass


def _entero(v, nombre, lo, hi):
    if not isinstance(v, int) or isinstance(v, bool) or not lo <= v <= hi:
        raise DatosInvalidos(f"{nombre}: se esperaba un entero entre {lo} y {hi}, llegó {v!r}")
    return v


def validar(d):
    """Devuelve los datos normalizados o lanza DatosInvalidos. Rechaza claves desconocidas: el archivo es una lista cerrada."""
    if not isinstance(d, dict):
        raise DatosInvalidos("la raíz debe ser un objeto")
    extra = set(d) - {"_nota", "scholar_leido", "produccion", "citas_por_anio", "estados"}
    if extra:
        raise DatosInvalidos(f"claves desconocidas: {sorted(extra)}")
    try:
        leido = datetime.date.fromisoformat(d["scholar_leido"])
    except (KeyError, TypeError, ValueError):
        raise DatosInvalidos("scholar_leido: se esperaba una fecha AAAA-MM-DD")
    if not datetime.date(2020, 1, 1) <= leido <= datetime.date.today() + datetime.timedelta(days=1):
        raise DatosInvalidos(f"scholar_leido fuera de rango: {leido}")
    p = d.get("produccion")
    if not isinstance(p, dict) or set(p) != set(PRODUCCION) | {"citas"}:
        raise DatosInvalidos(f"produccion: se esperaban exactamente {sorted(set(PRODUCCION) | {'citas'})}")
    for k, (_, _, lo, hi) in PRODUCCION.items():
        _entero(p[k], f"produccion.{k}", lo, hi)
    _entero(p["citas"], "produccion.citas", 1, CITAS_MAX)
    ca = d.get("citas_por_anio")
    if not isinstance(ca, dict) or not 1 <= len(ca) <= 40:
        raise DatosInvalidos("citas_por_anio: se esperaba un objeto año → citas")
    if not all(re.fullmatch(r"\d{4}", a) for a in ca):
        raise DatosInvalidos("citas_por_anio: los años van como texto de cuatro cifras")
    anios = sorted(int(a) for a in ca)
    if anios != list(range(anios[0], anios[-1] + 1)):
        raise DatosInvalidos("citas_por_anio: los años deben ser consecutivos")
    if anios[-1] != leido.year:
        raise DatosInvalidos(f"citas_por_anio: el último año ({anios[-1]}) debe ser el de la lectura ({leido.year})")
    for a, v in ca.items():
        _entero(v, f"citas_por_anio.{a}", 0, CITAS_MAX)
    if sum(ca.values()) > p["citas"]:
        raise DatosInvalidos("citas_por_anio suma más que produccion.citas (Scholar no fecha todas las citas, nunca suma de más)")
    e = d.get("estados")
    if not isinstance(e, dict) or set(e) != set(ESTADOS_ADMITIDOS):
        raise DatosInvalidos(f"estados: se esperaban exactamente {sorted(ESTADOS_ADMITIDOS)}")
    for k, v in e.items():
        if v not in ESTADOS_ADMITIDOS[k]:
            raise DatosInvalidos(f"estados.{k}: {v!r} no está entre {sorted(ESTADOS_ADMITIDOS[k])}")
    return {"leido": leido, "produccion": p, "citas_por_anio": {int(a): v for a, v in ca.items()}, "estados": e}


def cargar(ruta=DATOS):
    with open(ruta, encoding="utf-8") as fh:
        return validar(json.load(fh))


def fecha_larga(f):
    return f"{f.day} de {MESES[f.month - 1]} de {f.year}"


def tramos(v):
    """Contenido de cada marcador dato:ID, en el mismo formato que tenía la página escrita a mano."""
    p = v["produccion"]
    filas = []
    for k, (sing, plur, _, _) in PRODUCCION.items():
        n = p[k]
        if n == 0 and k in ("capitulos", "patentes"):
            continue
        filas.append(f'        <div><dt>{sing if n == 1 else plur}</dt><dd>{n}</dd></div>')
    out = {
        "produccion": "\n" + "\n".join(filas) + "\n        ",
        "citas": str(p["citas"]),
        "mes-scholar": f"{MESES[v['leido'].month - 1]} de {v['leido'].year}",
        "fecha-scholar": fecha_larga(v["leido"]),
    }
    for k, est in v["estados"].items():
        cls, txt = ESTADOS[est]
        out[f"estado:{k}"] = f'<p class="estado {cls}">{txt}</p>'
    return out


MARCA = re.compile(r"(<!-- dato:([a-z0-9:-]+) -->)(.*?)(<!-- /dato:\2 -->)", re.S)


def aplicar(html, v):
    """Reemplaza el contenido de cada marcador. Falla si falta un marcador, si sobra uno desconocido o si alguno se repite."""
    t = tramos(v)
    vistos = []

    def rep(m):
        k = m.group(2)
        if k not in t:
            raise DatosInvalidos(f"marcador desconocido en index.html: dato:{k}")
        vistos.append(k)
        return m.group(1) + t[k] + m.group(4)

    nuevo = MARCA.sub(rep, html)
    faltan = set(t) - set(vistos)
    if faltan:
        raise DatosInvalidos(f"faltan marcadores en index.html: {sorted(faltan)}")
    repetidos = {k for k in vistos if vistos.count(k) > 1}
    if repetidos:
        raise DatosInvalidos(f"marcadores repetidos: {sorted(repetidos)}")
    # La miniatura de citas por año: la misma función que usa scripts/figuras.py, con estos datos.
    sys.path.insert(0, AQUI)
    import figuras  # noqa: E402  (numpy; sólo se importa al pegar)
    chispa = figuras.chispa_citas(v["citas_por_anio"], fecha_larga(v["leido"]))
    nuevo, n = re.subn(r"(<!-- fig:chispa -->)\n.*?\n(\s*<!-- /fig:chispa -->)", lambda m: f"{m.group(1)}\n{chispa}\n{m.group(2)}", nuevo, flags=re.S)
    if n != 1:
        raise DatosInvalidos("index.html debe tener exactamente un marcador fig:chispa")
    return nuevo


def main(argv):
    if not {"--pegar", "--revisar"} & set(argv):
        print(__doc__)
        return 64
    try:
        v = cargar()
        html = open(INDEX, encoding="utf-8").read()
        nuevo = aplicar(html, v)
    except (DatosInvalidos, KeyError, json.JSONDecodeError) as e:
        print(f"datos.py: {e}", file=sys.stderr)
        return 2
    if "--pegar" in argv:
        if nuevo != html:
            open(INDEX, "w", encoding="utf-8").write(nuevo)
            print("datos.py: index.html actualizado")
        else:
            print("datos.py: index.html ya estaba al día")
        return 0
    if nuevo != html:
        print("datos.py: index.html NO está al día con datos/sitio.json (correr --pegar)")
        return 1
    print("datos.py: datos válidos e index.html al día")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
