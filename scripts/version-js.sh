#!/usr/bin/env bash
# version-js.sh — pone en index.html el hash de quimiotaxis.js y el de empuje.js (053) como ?v=…, para que cada publicación obligue a los
# navegadores a bajar el script nuevo (GitHub Pages lo cachea 10 min). Correr antes de cada commit que cambie el script.
set -euo pipefail
cd "$(dirname "$0")/.."
h=$(sha256sum quimiotaxis.js | cut -c1-10)
sed -i -E "s#s\.src='quimiotaxis\.js(\?v=[0-9a-f]+)?'#s.src='quimiotaxis.js?v=$h'#" index.html
grep -q "quimiotaxis.js?v=$h" index.html && echo "index.html → quimiotaxis.js?v=$h"
h2=$(sha256sum empuje.js | cut -c1-10)
sed -i -E "s#e\.src='empuje\.js(\?v=[0-9a-f]+)?'#e.src='empuje.js?v=$h2'#" index.html
grep -q "empuje.js?v=$h2" index.html && echo "index.html → empuje.js?v=$h2"
