#!/usr/bin/env python3
"""Convierte los cuadros PNG que rinde animacion.py en los WebP que lee index.html.

    python3 scripts/empaquetar_cuadros.py --set w --cuadros /tmp/anim/images/animacion \
        --marcas /tmp/anim/marcas-w.json --destino anim/w [--calidad 82]

Escribe anim/<set>/0000.webp … (uno por cuadro, con transparencia), los tres cuadros fijos
anim/<set>/poster-{ds,do,ec}.webp (el escenario completo, para prefers-reduced-motion y sin JS)
y anim/<set>/anim.json. Al final imprime el bloque JSON de fases para pegar en
<script type="application/json" id="anim"> de index.html (los dos conjuntos deben dar las
mismas marcas: la escena es la misma, cambia sólo el tamaño).
"""
import argparse
import json
import re
from pathlib import Path

from PIL import Image

FASES = ["dsDraw", "tDsDo", "doAlerta", "tDoEc", "ecAlerta"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--set", required=True, choices=["w", "n"])
    ap.add_argument("--cuadros", required=True, help="carpeta con los PNG de Manim (Serie0000.png …)")
    ap.add_argument("--marcas", required=True, help="JSON que escribió animacion.py (SERIE_MARCAS)")
    ap.add_argument("--destino", required=True)
    ap.add_argument("--calidad", type=int, default=82)
    a = ap.parse_args()

    pngs = sorted(Path(a.cuadros).glob("Serie*.png"), key=lambda p: int(re.sub(r"\D", "", p.stem) or 0))
    assert pngs, "no hay cuadros"
    m = json.loads(Path(a.marcas).read_text())
    marcas = m["marcas"]
    n = marcas["fin"]
    assert len(pngs) >= n, f"hay {len(pngs)} cuadros y las marcas llegan a {n}"
    pngs = pngs[:n]

    dest = Path(a.destino)
    dest.mkdir(parents=True, exist_ok=True)
    for viejo in dest.glob("*.webp"):
        viejo.unlink()
    peso = 0
    for i, p in enumerate(pngs):
        im = Image.open(p).convert("RGBA")
        salida = dest / f"{i:04d}.webp"
        im.save(salida, "WEBP", quality=a.calidad, method=6, exact=False)
        peso += salida.stat().st_size

    bordes = [marcas[f] for f in FASES] + [n]
    fases = {f: [bordes[i], bordes[i + 1]] for i, f in enumerate(FASES)}
    posters = {"ds": fases["dsDraw"][1] - 1, "do": fases["doAlerta"][1] - 1, "ec": fases["ecAlerta"][1] - 1}
    for k, i in posters.items():
        im = Image.open(pngs[i]).convert("RGBA")
        im.save(dest / f"poster-{k}.webp", "WEBP", quality=a.calidad, method=6, exact=False)

    w, h = Image.open(pngs[0]).size
    info = {"set": a.set, "w": w, "h": h, "n": n, "fps": m["fps"], "fases": fases, "posters": posters,
            "bytes": peso}
    (dest / "anim.json").write_text(json.dumps(info, indent=1))
    print(f"{n} cuadros → {dest} ({peso / 1e6:.2f} MB, {peso / n / 1e3:.1f} KB por cuadro), {w}×{h}")
    print("fases para index.html:", json.dumps({"fps": m["fps"], "n": n, "fases": fases}, separators=(",", ":")))


if __name__ == "__main__":
    main()
