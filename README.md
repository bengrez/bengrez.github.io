# Sitio personal — Benjamín Moreira-Grez

Página única, HTML autocontenido (`index.html`): CSS y JS en línea, tipografías desde Google
Fonts (Bricolage Grotesque, Source Serif 4, IBM Plex Mono), sin otras dependencias ni paso de
build. Desde la 012 el gráfico son cuadros de Manim ya rendidos en `anim/` (ver «La animación»).
Pensada para GitHub Pages u hosting estático equivalente.

Contexto del proyecto, guía normativa y guardrails (privacidad, no nombrar cliente ni colegio,
DOI verificados) en `~/LLM-context/Personal/sitio-personal/`.

Publicado con GitHub Pages desde la rama `main`, raíz del repositorio: https://bengrez.github.io/

## Estructura (desde la 008; dos columnas desde la 012)

La tesis de la portada («Resuelvo problemas con lo que hay disponible») se prueba con la forma de la
página: cada caso se cuenta con los **tres pasos del método** que muestra el gráfico (Medir · Ver la
desviación · Explicar y actuar) y cada cosa lleva su **estado real** (`.estado`: `e-uso` publicado o en
uso, `e-piloto` en piloto, `e-dev` en desarrollo; el glifo siempre va con su texto).

1. **Barra** fija: nombre, secciones (bajo 900 px sólo Contacto) y botón de tema.
2. **Portada**: titular, una frase que dice quién es y qué hace, y dos acciones. El titular se encoge
   con el scroll (ver «La serie fija y la portada que se encoge»).
3. **La serie** (`#serie`): panel oscuro en los dos temas, con los cuadros de Manim (ver «La animación»).
   Con JS queda fija bajo la barra mientras se recorren los tres casos.
4. Desde la 012, **todo lo que va bajo el gráfico son dos columnas** (`.pagina.dos`): a la izquierda el
   **riel** (`header.riel`: rótulo, título, estado y lugar), fijo mientras dura la sección (`position:sticky`
   desde 960 px, bajo la barra y la serie); a la derecha el contenido, que avanza con el scroll. En celular
   (< 960 px) el riel se parte (`display:contents`): el título (`.riel-top`) queda fijo y chico bajo el
   gráfico (o bajo la barra en Recorrido y Contacto, `.fuera`) y el estado y el lugar (`.riel-meta`) pasan
   al flujo, sobre el contenido.
5. Secciones, en el orden de la serie: **índice de casos** (`#casos`, con la leyenda de estados), **Data
   science** (`#ingenieria`), **Agentes de IA** (`#agentes`, franja oscura), **Docencia** (`#educacion`),
   **Ecología** (`#investigacion`), **Recorrido** (`.ruta`, vertical) y **Contacto**. Los id no cambiaron.
6. Un caso es: el problema (`.problema`), una nota del escenario del gráfico (`.grafico`, mono, con «datos
   simulados»), el método en tres pasos (`ol.metodo`: Medir / Ver la desviación / Explicar y actuar, dos o
   tres frases cada uno), la evidencia (esquemas `.flujo`, herramientas `.herr`, métricas, RNA-SIP), «con
   qué» y el detalle plegado (`details.mas`). El libro Había / Hice / Quedó de la 008 se quitó en la 012.

## La animación (iteración 012)

El gráfico lo rinde **Manim** (`scripts/animacion.py`) y la página lo avanza con el scroll. Qué pasa:
aparecen ejes finos y «datos simulados»; el rótulo «escenario · unidad» se escribe a mano (Write); la
línea de Data science se traza de izquierda a derecha en color neutro, al llegar a la alerta un círculo
pulsa una vez (queda un punto) y el resto de la línea sale en el color de acento; al final de la sección
la línea se **transforma** (Transform) en la de Docencia, en neutro, las marcas de la escala y el rótulo
cambian con un fundido; en la primera mitad de Docencia la alerta recorre la línea (pulso y barrido al
acento desde el punto de alerta); la segunda mitad queda quieta; igual hacia Ecología. Hacia arriba es lo
mismo en reversa. Los datos son los de `serie.py` (simulados).

- **Técnica**: secuencia de **cuadros WebP con transparencia** (229 cuadros a 24 fps) dibujados en un
  `<canvas>`; el scroll elige el cuadro. No es video (el *scrubbing* de video es brusco en Safari de
  iOS) ni SVG (el gráfico se hace con Manim, decisión del dueño). El fondo transparente deja el color del
  panel al CSS, así que en tablet el cuadro se centra en un alto fijo sin que se note el recorte.
- **Dos conjuntos**, porque un raster no se estira como el SVG anterior: `anim/w/` (2400×300, 8:1, para
  900 px o más; se ve a 1152×144 como máximo) y `anim/n/` (1200×340, para celular y tablet; a 358×101 en
  un celular de 390 px). Cada uno trae `0000.webp … 0228.webp`, `poster-{ds,do,ec}.webp` (el escenario
  completo, para `prefers-reduced-motion` y sin JS) y `anim.json`. Los cuadros se cuantizan a 64 colores y
  se guardan sin pérdida: unos 5–7 KB por cuadro, ~1,3 MB por conjunto; el navegador baja sólo el suyo.
- **Mapa del scroll** (JS de `index.html`): «línea de lectura» al 35 % del espacio visible bajo la barra y
  la figura; sección = la última cuyo borde superior la pasó; `p` = avance dentro de ella (0 a 1). Antes de
  Data science: escenario completo (al cargar, la línea se traza sola, en el tiempo, cuando los cuadros
  de esa fase llegaron). Data science (incluida la franja de agentes): quieto hasta `p = 0,86`, y en el
  último 14 % la transformación a Docencia. Docencia y Ecología: `p < 0,5` barrido de la alerta; después
  quieto; `p ≥ 0,86` transformación (Docencia). Las fases están en `<script type="application/json"
  id="anim">` (`dsDraw`, `tDsDo`, `doAlerta`, `tDoEc`, `ecAlerta`, como rangos de cuadros) y las escribe
  `empaquetar_cuadros.py`. El botón activo cambia a mitad de la transformación. Si cuatro cuadros fallan
  al cargar, o con `prefers-reduced-motion`, se muestra el poster del escenario (`picture.poster`); sin JS,
  el poster de Data science y nada de botones.
- **Regenerar** (entorno de Manim fuera del repo; se creó con micromamba porque ManimPango no trae rueda
  binaria para Linux y compilarla pide cabeceras del sistema):

      ~/.local/share/micromamba/bin/micromamba create -p ~/.local/share/manim-env -c conda-forge python=3.12 manim pillow
      OUT=/tmp/anim; for S in w n; do
        SERIE_SET=$S SERIE_MARCAS=$OUT/marcas-$S.json ~/.local/share/manim-env/bin/manim render -t --format png \
          --disable_caching --media_dir $OUT/$S scripts/animacion.py Serie
        python3 scripts/empaquetar_cuadros.py --set $S --cuadros $OUT/$S/images/animacion --marcas $OUT/marcas-$S.json --destino anim/$S
      done

  y pegar en `#anim` el JSON de fases que imprime el empaquetador. El rótulo del cuadro usa DejaVu Sans Mono
  (variable `SERIE_FUENTE` para otra fuente instalada); los colores de la escena son los del panel.
  `animacion.py` importa `serie.py` (que expone en `_meta` los puntos y el rango de cada serie).

## La serie: datos (serie.py)

Un mismo gráfico con **tres escenarios**, en este orden: Data science (temperatura del refrigerante
de un bus, por día), Docencia (logro agregado de un curso en un tema, por ensayo) y Ecología (función
microbiana de un suelo post-minería frente a su referencia). El mensaje es el mismo: medir, ver la
desviación a tiempo, actuar.

- Es un **esquema con datos simulados** y semilla fija, y lo dice. Nada es dato de estudiantes, de una
  empresa ni de un sitio real; Docencia usa sólo promedios del curso.
- La genera `scripts/serie.py` (numpy): `python3 scripts/serie.py json` imprime el JSON de los tres
  escenarios (va en `<script type="application/json" id="escenarios">`; desde la 012 el JS sólo usa `id`
  y `aria`; `trend`/`alert` quedan por si se vuelve al SVG), `html` imprime el escenario inicial como SVG y
  `meta` imprime umbrales, alertas, puntos (`xs`, `ys`) y rango vertical (`top`, `bot`), que son lo que
  usa `animacion.py`. La alerta sigue dependiendo de la referencia ± 2σ, que se calcula pero no se dibuja.
- **Escenarios**: botones `.esc` (`aria-pressed`) sobre la figura; sólo existen con JS; llevan a la
  sección correspondiente (el escenario lo manda el scroll).

## La serie fija y la portada que se encoge (iteración 010)

Todo lo que va de la serie al final de Ecología está dentro de `div.escena`; con JS la figura gana la
clase `fijo` (`position:sticky` bajo la barra) y queda pegada hasta que termina la escena (antes de
Recorrido). Sin JS no se pega.

- **Alto de la figura.** El script publica `--fig-h` (alto medido); de él cuelgan `scroll-padding-top`, el
  riel de cada sección y las anclas, para que nada quede tapado (también al enfocar con teclado).
  `#recorrido` y `#contacto` lo restan porque ya no hay figura fija ahí.
- **Tamaños.** El `.plot` sigue la proporción del conjunto de cuadros: 8:1 desde 900 px (144 px de alto a
  la página máxima), 1200:340 bajo 640 px, y un alto fijo `clamp(7rem,13vw,9.5rem)` entre medio (tablet),
  donde el cuadro angosto se centra. En pantallas bajas (< 520 px de alto) el plot mide 4,5 rem.
- **Titular que se encoge.** `.hero` define `--k` (0 a 1) y el tamaño de letra, el interlineado, los
  márgenes y el relleno van de su valor grande al compacto. `--k` depende sólo del scroll (los primeros
  160 px, con curva suave) y se queda en 1. Al saltar con un ancla, la portada se compacta antes de medir
  (si no, se encogería en pleno salto y la sección quedaría tapada); `overflow-anchor:none` evita que el
  navegador compense el cambio de alto.

## Esquemas de flujo

`ol.flujo` (sistema de la flota, asistente del colegio) es HTML, no SVG: una fila con ramas desde
820 px y una columna en móvil (la flota se bifurca en dos columnas bajo la base de datos). Cada
flecha es un pseudo-elemento recortado con `clip-path` (`fd` a la derecha, `fb`/`fb2` hacia abajo;
bajo 820 px todas apuntan hacia abajo). El texto de los nodos es texto real.

## Temas, capturas y og.png

- Tema claro y oscuro por `prefers-color-scheme`; el botón de la barra fija `data-theme` en `<html>`
  y lo recuerda en `localStorage` (clave `tema`). **Paleta de la 012** («tinta y arcilla»): claro, piedra
  `#F5F5F2` con tinta `#171B22`, acento índigo `#3D4FB5` (`--accent-ink` `#2F3F9A`) y alerta arcilla
  `#D4531B`; oscuro, grafito `#0F1115` con tinta `#E8E9EC`, índigo claro `#9CACFF` y alerta `#FF8B57`. El
  panel (`--panel`, `--p-*`) es azul noche `#141826` en los dos temas: línea neutra `#8E95A8`, acento
  `#A7B5FF`, alerta `#FF8B57` (los mismos que usa `animacion.py`). Contrastes de texto ≥ 5,2:1 en claro y
  ≥ 6,9:1 en oscuro; el color de alerta sólo marca, no es texto.
- `tabla-periodica.webp` y `autodiagnostico.webp` son recortes de las herramientas públicas de
  `aula-herramientas`, capturadas a 2x y recortadas para no incluir cabeceras con nombres de
  instituciones. Regenerar: captura a 2560×1720, `convert … -crop 1200x1000+680+370` y
  `-crop 1960x540+300+810 -resize 1400x`, calidad WebP 80.
- `og.png` (1200×630) es una captura de la portada con movimiento reducido, a 1200×630, tema claro,
  ocultando `.lede, .acciones, .lugar, .indice, .tema, .escenarios` y con
  `.hero{padding-block:1.25rem 1.75rem}` para que quepan el nombre, el titular y la serie. Muestra el primer
  escenario (data science) con el poster de Manim (`prefers-reduced-motion` en la captura). Se rehace si
  cambia la portada (la 012 cambió la paleta y el gráfico).
- Anchos en `rem`/`em`, no en `ch`. Los respaldos `Bricolage Respaldo` y `Source Serif Respaldo`
  usan `size-adjust` medido contra Arial y Georgia para que la página no salte al cargar la fuente.
