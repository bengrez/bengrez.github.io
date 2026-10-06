# Sitio personal — Benjamín Moreira-Grez

Página única, HTML autocontenido (`index.html`): CSS y JS en línea, tipografías desde Google
Fonts (Bricolage Grotesque, Source Serif 4, IBM Plex Mono), sin otras dependencias ni paso de
build. Desde la 013 las tres figuras son SVG estáticas en `fig/`, generadas con matplotlib (ver «Las
figuras»). Pensada para GitHub Pages u hosting estático equivalente.

Contexto del proyecto, guía normativa y guardrails (privacidad, no nombrar cliente ni colegio,
DOI verificados) en `~/LLM-context/Personal/sitio-personal/`.

Publicado con GitHub Pages desde la rama `main`, raíz del repositorio: https://bengrez.github.io/

## Estructura (desde la 008; dos columnas desde la 012; figuras de paper desde la 013)

La tesis de la portada («Resuelvo problemas con lo que hay disponible») se prueba con la forma de la
página: cada caso lleva arriba **su figura, con el look de una figura de paper y el detalle que su
evidencia permite** (cuatro paneles, dos, uno), se cuenta con los **tres pasos del método** (Medir · Ver la
desviación · Explicar y actuar) y cada cosa lleva su **estado real** (`.estado`: `e-uso` publicado o en
uso, `e-piloto` en piloto, `e-dev` en desarrollo; el glifo siempre va con su texto).

1. **Barra** fija: nombre, secciones (bajo 900 px sólo Contacto) y botón de tema.
2. **Portada**: titular, una frase que dice quién es y qué hace, y dos acciones. El titular se encoge
   con el scroll (ver «La serie fija y la portada que se encoge»).
3. **Las figuras** (`#serie`): tres «hojas» (`.hoja`, fondo claro en los dos temas) con la imagen y su pie
   al estilo de la revista («Figura 1 | …»), y una fila de botones «Fig. 1 Data science · Fig. 2 Ecología ·
   Fig. 3 Docencia». Se ve una a la vez, la del caso que se está leyendo (ver «Las figuras»). Con JS queda
   fija bajo la barra mientras se recorren los tres casos.
4. Desde la 012, **todo lo que va bajo el gráfico son dos columnas** (`.pagina.dos`): a la izquierda el
   **riel** (`header.riel`: rótulo, título, estado y lugar), fijo mientras dura la sección (`position:sticky`
   desde 960 px, bajo la barra y la serie); a la derecha el contenido, que avanza con el scroll. En celular
   (< 960 px) el riel se parte (`display:contents`): el título (`.riel-top`) queda fijo y chico bajo el
   gráfico (o bajo la barra en Recorrido y Contacto, `.fuera`) y el estado y el lugar (`.riel-meta`) pasan
   al flujo, sobre el contenido.
5. Secciones, en el orden de las figuras (desde la 013: **Data science → Ecología → Docencia**, la de
   menos detalle al final): **índice de casos** (`#casos`, con la leyenda de estados), **Data science**
   (`#ingenieria`), **Agentes de IA** (`#agentes`, franja oscura), **Ecología** (`#investigacion`),
   **Docencia** (`#educacion`), **Recorrido** (`.ruta`, vertical) y **Contacto**. Los id no cambiaron.
6. Un caso es: el problema (`.problema`), una nota sobre su figura (`.grafico`, mono, con «datos
   simulados»), el método en tres pasos (`ol.metodo`: Medir / Ver la desviación / Explicar y actuar, dos o
   tres frases cada uno), la evidencia (esquemas `.flujo`, herramientas `.herr`, métricas, RNA-SIP), «con
   qué» y el detalle plegado (`details.mas`). El libro Había / Hice / Quedó de la 008 se quitó en la 012.

## Las figuras (iteración 013)

Tres figuras **estáticas, sin animación**, con el look de una figura de paper científico y **distinto
nivel de detalle**: la más detallada es la de Data science (donde hay más datos), la intermedia la de
Ecología y la mínima la de Docencia, que va al final. La paradoja que cuenta la página es que la más simple
es la más difícil de lograr. Sólo cambian al pasar de sección con el scroll.

- **Figura 1, Data science** (cuatro paneles A–D): (A) temperatura del refrigerante de un bus, media ± EE de
  tres lecturas por día, banda de referencia de los primeros 10 días ± 2σ y la alerta; (B) heatmap del
  riesgo de falla (puntaje z) por bus y semana, con dendrograma de filas; (C) anticipación a la falla y
  (D) falsas alertas (eje logarítmico) por método y tipo de falla, media ± EE con letras de significancia
  y leyenda en recuadro.
- **Figura 2, Ecología** (dos paneles): (A) índice de Shannon por tratamiento y profundidad, media ± EE,
  letras y leyenda «Profundidad» en recuadro; (B) función microbiana como porcentaje de la referencia a 0,
  6, 12 y 24 meses, con la línea de referencia. Es un homenaje directo a la Fig. 4 del paper.
- **Figura 3, Docencia** (un panel): logro del curso (% de acierto) en tres momentos, media ± EE, un solo
  color de acento en el punto que importa, sin leyenda. Sólo promedios del curso.

**Estilo tomado del paper de biocrust** (Moreira-Grez et al., *Frontiers in Microbiology* 2019, 10:2143,
doi:10.3389/fmicb.2019.02143): ejes en L sin grilla (`theme_classic`), marcas cortas, puntos grandes con
barras de error ±1 EE con capuchón del mismo color, series desplazadas en x, letras de significancia
centradas sobre la barra, leyenda dentro del área en recuadro negro fino con título en negrita, rótulos de
panel en negrita fuera del área de datos, unidades entre paréntesis, texto en sans (Arial / Helvetica /
Liberation Sans, como ggplot), las dos series en coral `#F86848` y burdeos `#900008`, y el heatmap en
RdYlBu invertido con celdas separadas en blanco (Fig. 2 del paper). El sello «Datos simulados» va dentro
de cada imagen, además del pie.

- **Generación**: `python3 scripts/figuras.py` (numpy, scipy, matplotlib; semilla fija, salida idéntica)
  escribe `fig/{ds,ec,do}-{w,n}.svg`. `w` es el tamaño de escritorio (900 px o más; la Figura 1 mide
  11,6 × 3,2 pulgadas) y `n` el de celular y tablet (la Figura 1 en 2 × 2, 5,6 × 3,6 pulgadas, con letra más
  grande y rótulos más cortos). `--png <carpeta>` deja PNG de revisión. Las SVG llevan el texto como texto
  (`svg.fonttype none`, familia Liberation Sans / Arial / Helvetica), así que pesan poco (9–90 KB) y se ven
  nítidas a cualquier escala; `width`/`height` de `<img>` y `<source>` son el `viewBox` recortado que
  imprime el script.
- **En la página**: cada `.hoja` tiene un `<picture>` que elige `-w` o `-n` por `min-width:900px`, un `alt`
  que describe la figura y un `<figcaption>` «Figura N | …». La imagen se contiene en un alto fijo (`.plot`:
  `clamp(9rem,28vh,14rem)` desde 900 px, `clamp(9rem,31vh,14.5rem)` entre 640 y 899, `clamp(8rem,26vh,12rem)`
  bajo 640) para que la figura fija no cambie de alto al pasar de una a otra. Desde 1200 px el pie va al
  costado, como en la revista, y la hoja mide lo que mide su figura; bajo eso va debajo, recortado a dos
  líneas (una en celular): el pie completo está en el `alt` y en escritorio, y lo esencial en el párrafo
  `.grafico` de cada caso. Las hojas son claras también en tema oscuro (`--paper`), porque son figuras de
  paper; las SVG tienen fondo transparente y el color lo pone la hoja.
- **Cuál se muestra** (JS de `index.html`): «línea de lectura» al 35 % del espacio visible bajo la barra y
  la figura; la figura es la de la última sección cuyo borde superior la pasó (Data science, incluida la
  franja de agentes → 1; Ecología → 2; Docencia → 3; antes de la primera, 1). El cambio es instantáneo. Los
  botones `.esc` llevan a la sección. Sin JS: Figura 1, suelta, sin botones.
- Lo que salió en la 013: los cuadros de Manim (`anim/`, `scripts/animacion.py`, `scripts/empaquetar_cuadros.py`),
  `scripts/serie.py` y `scripts/senales.py` (los esquemas de la 004, que ya no existían en la página). El entorno de Manim (`~/.local/share/manim-env`) queda fuera del repo y no se usa.

## La serie fija y la portada que se encoge (iteración 010)

Todo lo que va de las figuras al final de Docencia está dentro de `div.escena`; con JS la figura gana la
clase `fijo` (`position:sticky` bajo la barra) y queda pegada hasta que termina la escena (antes de
Recorrido). Sin JS no se pega.

- **Alto de la figura.** El script publica `--fig-h` (alto medido); de él cuelgan `scroll-padding-top`, el
  riel de cada sección y las anclas, para que nada quede tapado (también al enfocar con teclado).
  `#recorrido` y `#contacto` lo restan porque ya no hay figura fija ahí.
- **Tamaños.** El `.plot` tiene alto fijo por tramo (ver «Las figuras») y la imagen se contiene dentro; en
  pantallas bajas (< 520 px de alto) mide 5,5 rem y el pie se oculta.
- **Titular que se encoge.** `.hero` define `--k` (0 a 1) y el tamaño de letra, el interlineado, los
  márgenes y el relleno van de su valor grande al compacto. `--k` depende sólo del scroll (los primeros
  160 px, con curva suave) y se queda en 1. Al saltar con un ancla, la portada se compacta antes de medir
  (si no, se encogería en pleno salto y la sección quedaría tapada); `overflow-anchor:none` evita que el
  navegador compense el cambio de alto.

## Esquemas de flujo

`ol.flujo` (sistema de la flota, asistente del colegio) es HTML, no SVG: una fila con ramas desde
1100 px y una columna en móvil (la flota se bifurca en dos columnas bajo la base de datos). Cada
flecha es un pseudo-elemento recortado con `clip-path` (`fd` a la derecha, `fb`/`fb2` hacia abajo;
bajo 1100 px todas apuntan hacia abajo). El texto de los nodos es texto real.

## Temas, capturas y og.png

- Tema claro y oscuro por `prefers-color-scheme`; el botón de la barra fija `data-theme` en `<html>`
  y lo recuerda en `localStorage` (clave `tema`). **Paleta de la 013**, tomada de las figuras del paper:
  claro, papel `#FAF9F6` con tinta `#1B1A17`, acento burdeos `#900008` (`--accent-ink` `#7A0007`) y marca
  coral `#D9481F`; oscuro, `#131211` con tinta `#ECE9E2`, acento coral `#FF8F74` (`#FFA893`) y marca
  `#F86848`. Las hojas de las figuras son `--paper` (`#FFFFFF` en claro, `#F4F2EC` en oscuro). La franja de
  agentes (`--panel`) es tinta cálida `#231B1A` en los dos temas, con acento `#FF9A82`. Contrastes de texto
  ≥ 6,0:1 en claro y ≥ 6,6:1 en oscuro; el color de marca sólo marca, no es texto.
- `tabla-periodica.webp` y `autodiagnostico.webp` son recortes de las herramientas públicas de
  `aula-herramientas`, capturadas a 2x y recortadas para no incluir cabeceras con nombres de
  instituciones. Regenerar: captura a 2560×1720, `convert … -crop 1200x1000+680+370` y
  `-crop 1960x540+300+810 -resize 1400x`, calidad WebP 80.
- `og.png` (1200×630) es una captura de la portada a 1200×630, tema claro, ocultando `.lede, .acciones,
  .lugar, .indice, .tema, .escenarios` y con `.hero{padding-block:1.25rem 1.75rem}` para que quepan el
  nombre, el titular y la Figura 1. Se rehace si cambia la portada (la 013 cambió la paleta y la figura).
- Anchos en `rem`/`em`, no en `ch`. Los respaldos `Bricolage Respaldo` y `Source Serif Respaldo`
  usan `size-adjust` medido contra Arial y Georgia para que la página no salte al cargar la fuente.
