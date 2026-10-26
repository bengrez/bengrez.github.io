#!/usr/bin/env bash
# version-js.sh — minifica quimiotaxis.js y empuje.js (056) en quimiotaxis.min.js y empuje.min.js, que son los que carga index.html, y pone en
# index.html el hash de cada .min.js como ?v=…, para que cada publicación obligue a los navegadores a bajar el script nuevo (GitHub Pages lo cachea
# 10 min). Correr antes de cada commit que cambie uno de los dos scripts. Los .js sin .min son la fuente legible: se editan ésos, nunca los .min.js.
# Necesita Node ≥ 18 (npx baja esbuild 0.24.2 la primera vez).
set -euo pipefail
cd "$(dirname "$0")/.."
for f in quimiotaxis empuje; do
  npx --yes esbuild@0.24.2 "$f.js" --minify --target=es2017 --legal-comments=none --log-level=warning \
    --banner:js="/*! $f.js minificado con esbuild (056); la fuente legible es $f.js en https://github.com/bengrez/bengrez.github.io */" \
    --outfile="$f.min.js"
done
h=$(sha256sum quimiotaxis.min.js | cut -c1-10)
sed -i -E "s#s\.src='quimiotaxis(\.min)?\.js(\?v=[0-9a-f]+)?'#s.src='quimiotaxis.min.js?v=$h'#" index.html
grep -q "quimiotaxis.min.js?v=$h" index.html && echo "index.html → quimiotaxis.min.js?v=$h"
h2=$(sha256sum empuje.min.js | cut -c1-10)
sed -i -E "s#e\.src='empuje(\.min)?\.js(\?v=[0-9a-f]+)?'#e.src='empuje.min.js?v=$h2'#" index.html
grep -q "empuje.min.js?v=$h2" index.html && echo "index.html → empuje.min.js?v=$h2"
# 057: lo mismo para la hoja común (compartido/base.css, sin minificar: es la fuente). El hub lleva su propio ?v= (ver compartido/LEEME.md).
h3=$(sha256sum compartido/base.css | cut -c1-10)
sed -i -E "s#href=\"compartido/base\.css(\?v=[0-9a-f]+)?\"#href=\"compartido/base.css?v=$h3\"#" index.html
grep -q "compartido/base.css?v=$h3" index.html && echo "index.html → compartido/base.css?v=$h3"
