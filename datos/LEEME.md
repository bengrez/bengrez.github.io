# Datos de la página

`sitio.json` guarda los datos de la página que cambian con el tiempo, ya filtrados y públicos:

- las cifras de Google Scholar de «Producción científica» (artículos, capítulos, patentes, índice h, citas), la fecha de lectura y
  la serie de citas por año que dibuja la miniatura;
- el estado de cada caso (Data science, Ecología, Docencia) y de cada herramienta enlazada, de un vocabulario cerrado
  (`ESTADOS` en `scripts/datos.py`).

`scripts/datos.py --pegar` los valida y los pega en `index.html`, entre marcadores `<!-- dato:ID -->` y `<!-- /dato:ID -->`
(y en la figura `<!-- fig:chispa -->`, con la misma función de `scripts/figuras.py`). Las cifras quedan en el HTML estático: la
página no carga datos en tiempo de ejecución y se ve igual sin JavaScript. Fuera de los marcadores, `index.html` se edita a mano
como siempre; no muevas ni borres un marcador sin cambiar `scripts/datos.py`.

Una sincronización mensual, que vive fuera de este repo, lee los valores de las fuentes y publica sólo si el cambio toca estos dos
archivos (`datos/sitio.json` e `index.html` dentro de los marcadores), pasa una lista negra privada, deja el HTML válido, la
página se ve sin JavaScript a 375 px, sin errores de consola y bajo 200 kB con gzip en escritorio. También se puede editar
`sitio.json` a mano y correr `python3 scripts/datos.py --pegar`. Los estados de Data science y Ecología no tienen fuente
automática: la sincronización los deja como estén aquí, así que se cambian a mano. Las cifras de Scholar sí las actualiza, y
nunca a una lectura más vieja que la publicada.
