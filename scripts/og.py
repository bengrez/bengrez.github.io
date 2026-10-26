#!/usr/bin/env python3
"""og.py (056): arma scripts/og.html, la composición de og.png (la vista previa al compartir el enlace), 1200 × 630, tema claro.

Lleva sólo lo que no envejece con los cambios de la portada: el nombre, el titular (el <h1> de index.html) y el gráfico de Data science
(la variante ancha de fig-1, que genera scripts/figuras.py), completo y sin animar. Nada de kicker, introducción, cifras ni fechas.
El titular y el gráfico se leen de index.html, así que basta volver a correrlo si cambian.

    python3 scripts/og.py
    npx --yes playwright@1.58.2 screenshot --viewport-size=1200,630 --wait-for-timeout=1500 scripts/og.html og.png

y subir el número de ?v= de og:image en index.html (WhatsApp y LinkedIn guardan la imagen en caché por URL).
"""
import html
import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
idx = (RAIZ / "index.html").read_text(encoding="utf-8")

h1 = re.search(r"<h1>(.*?)</h1>", idx, re.S).group(1).strip()
svg = re.search(r'<!-- fig:ds -->\s*(<svg class="fig w ds".*?</svg>)', idx, re.S).group(1)
svg = re.sub(r'\s(role|aria-label)="[^"]*"', "", svg)  # en la imagen no hace falta: el texto alternativo va en og:image:alt

pagina = f"""<!doctype html>
<html lang="es-CL">
<head>
<meta charset="utf-8">
<title>og.png</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Paleta clara de index.html (013) */
:root{{--bg:#FAF9F6;--ink:#1B1A17;--muted:#5B5955;--accent:#900008;--accent-ink:#7A0007;--serie-a:#EF5536;--serie-b:#900008;
  --display:"Bricolage Grotesque",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,monospace}}
html,body{{margin:0;width:1200px;height:630px;overflow:hidden;background:var(--bg);color:var(--ink)}}
.og{{box-sizing:border-box;width:1200px;height:630px;padding:56px 64px 40px;display:flex;flex-direction:column}}
.nombre{{font:600 30px/1.1 var(--display);letter-spacing:-.01em}}
h1{{margin:18px 0 0;font:600 54px/1.05 var(--display);letter-spacing:-.025em}}
.fig{{display:block;width:900px;height:auto;margin-top:auto}}
.sitio{{position:absolute;right:64px;bottom:44px;font:400 19px/1 var(--mono);color:var(--muted)}}
.fig text{{font-family:var(--mono);font-size:15px;fill:var(--muted)}}
.fig .titulo{{font-family:var(--display);font-size:17px;font-weight:500;fill:var(--ink)}}
.fig .sello{{font-size:14.5px;fill:var(--muted)}}
.fig .eje{{fill:none;stroke:var(--ink);stroke-width:1.1}}
.fig .banda{{fill:var(--ink);opacity:.07}}
.fig .ref{{fill:none;stroke:var(--muted);stroke-width:1;stroke-dasharray:5 4}}
.fig .nota{{font-size:14px}}
.fig .linea{{fill:none;stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}}
.fig .linea.a,.fig .leyenda .a{{stroke:var(--serie-a);fill:none}}
.fig .leyenda .a{{fill:var(--serie-a)}}
.fig .linea.b,.fig .leyenda .b{{stroke:var(--serie-b);fill:none}}
.fig .leyenda .b{{fill:var(--bg);stroke-width:2}}
.fig .linea.b{{stroke-width:1.7}}
.fig .alerta .guia{{fill:none;stroke:var(--serie-b);stroke-width:1;stroke-dasharray:3 3}}
.fig .alerta circle{{fill:none;stroke:var(--serie-b);stroke-width:2}}
.fig .alerta text{{font-family:var(--display);font-size:15px;fill:var(--accent-ink)}}
.fig .leyenda text{{font-size:14px;fill:var(--ink)}}
</style>
</head>
<body>
<div class="og">
  <div class="nombre">Benjamín Moreira-Grez</div>
  <h1>{h1}</h1>
  {svg}
  <div class="sitio">bengrez.github.io</div>
</div>
</body>
</html>
"""
(RAIZ / "scripts" / "og.html").write_text(pagina, encoding="utf-8")
print("scripts/og.html ←", html.unescape(h1))
