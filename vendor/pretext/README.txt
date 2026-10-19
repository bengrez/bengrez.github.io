Pretext (Cheng Lou) — https://github.com/chenglou/pretext — versión 1.0.0 (paquete npm @chenglou/pretext), licencia MIT (ver LICENSE, que incluye los avisos de Chromium).

pretext.min.js es el paquete sin cambios en su código, empaquetado con esbuild en un solo archivo (IIFE, expone window.Pretext con
prepareWithSegments, layoutNextLine, layoutWithLines, measureNaturalWidth y clearCache). Lo carga empuje.js sólo cuando el nematodo cruza el párrafo de la portada.

Cómo rehacerlo (Node ≥ 18):
  npm pack @chenglou/pretext@1.0.0 && npm i esbuild @chenglou/pretext-1.0.0.tgz
  echo "export { prepareWithSegments, layoutNextLine, layoutWithLines, measureNaturalWidth, clearCache } from '@chenglou/pretext'" > entry.js
  esbuild entry.js --bundle --minify --format=iife --global-name=Pretext --target=es2020 --legal-comments=none --banner:js='/*! @chenglou/pretext 1.0.0 (MIT, c) 2026 Pretext contributors; ... */' --outfile=pretext.min.js
