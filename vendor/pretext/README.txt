Pretext (Cheng Lou) — https://github.com/chenglou/pretext — versión 1.0.0 (paquete npm @chenglou/pretext), licencia MIT (ver LICENSE, que incluye los avisos de Chromium).

pretext.min.js es el paquete sin cambios en su código, empaquetado con esbuild en un solo archivo (IIFE, expone window.Pretext con
prepareWithSegments y layoutNextLine, las dos funciones que usa empuje.js; hasta la 055 exponía también layoutWithLines, measureNaturalWidth y
clearCache). Lo carga empuje.js sólo cuando el nematodo cruza el párrafo de la portada. Pesa 92,6 KB (39,7 KB con gzip): casi todo son las
tablas de saltos de línea de Chromium, que no se pueden quitar sin tocar el código de la librería.

Cómo rehacerlo (Node ≥ 18):
  npm pack @chenglou/pretext@1.0.0 && npm i esbuild@0.24.2 ./chenglou-pretext-1.0.0.tgz
  echo "export { prepareWithSegments, layoutNextLine } from '@chenglou/pretext'" > entry.js
  esbuild entry.js --bundle --minify --format=iife --global-name=Pretext --target=es2020 --legal-comments=none --banner:js='/*! @chenglou/pretext 1.0.0 (MIT, c) 2026 Pretext contributors; ... */' --outfile=pretext.min.js
