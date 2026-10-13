#!/usr/bin/env bash
# version-js.sh — pone en index.html el hash de quimiotaxis.js como ?v=…, para que cada publicación obligue a los
# navegadores a bajar el script nuevo (GitHub Pages lo cachea 10 min). Correr antes de cada commit que cambie el script.
set -euo pipefail
cd "$(dirname "$0")/.."
h=$(sha256sum quimiotaxis.js | cut -c1-10)
sed -i -E "s#s\.src='quimiotaxis\.js(\?v=[0-9a-f]+)?'#s.src='quimiotaxis.js?v=$h'#" index.html
grep -q "quimiotaxis.js?v=$h" index.html && echo "index.html → quimiotaxis.js?v=$h"
