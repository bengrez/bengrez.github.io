# Sitio personal — Benjamín Moreira-Grez

Página única, HTML autocontenido (`index.html`): CSS y JS en línea, tipografías desde Google
Fonts (Bricolage Grotesque, Source Serif 4, IBM Plex Mono), sin otras dependencias ni paso de
build. Desde la 014 las tres figuras son SVG en línea, un panel por caso, generadas con
`scripts/figuras.py` y trazadas al entrar a cada sección (ver «Las figuras»). Pensada para GitHub Pages u
hosting estático equivalente.

Contexto del proyecto, guía normativa y guardrails (privacidad, no nombrar cliente ni colegio,
DOI verificados) en `~/LLM-context/Personal/sitio-personal/`.

Publicado con GitHub Pages desde la rama `main`, raíz del repositorio: https://bengrez.github.io/

## Estructura (desde la 008; dos columnas desde la 012; un panel por caso desde la 014; slides y gráfico a la izquierda desde la 015)

La tesis de la portada («Resuelvo problemas con lo que hay disponible») se prueba con la forma de la
página: cada caso lleva **su gráfico, con estilo de paper y el detalle que su evidencia permite** (dos
series con banda y alerta; dos series con barras de error; una línea y un acento), se cuenta como una
**slide** (un titular y tres viñetas: problema, qué hice, resultado) y cada cosa lleva su **estado real** (`.estado`: `e-uso` publicado o en
uso, `e-piloto` en piloto, `e-dev` en desarrollo; el glifo siempre va con su texto).

1. **Barra** fija: nombre, secciones (bajo 900 px sólo Contacto) y botón de tema.
2. **Portada**: titular, una frase que dice quién es y qué hace, y dos acciones. El titular se encoge
   con el scroll (ver «La serie fija y la portada que se encoge»).
3. **Las figuras**: tres SVG en línea integradas al fondo en los dos temas (ver «Las figuras»). En escritorio
   (≥ 960 px) cada una vive en el riel de su caso (`.riel-fig`), fija a la izquierda sobre el título; bajo
   960 px la franja fija de arriba (`#serie`, `.hoja > .plot > svg.fig`) muestra la del caso que se está
   leyendo. Sin botones: la navegación es la barra y el scroll.
4. **Dos columnas al 50 %** (`.pagina.dos`, desde 960 px): a la izquierda el **riel** (`header.riel`: el
   gráfico del caso, rótulo, título, estado y lugar), fijo mientras dura la sección (`position:sticky` bajo la
   barra); a la derecha la slide (`.slide`), que avanza con el scroll. Las secciones sin gráfico (índice,
   Agentes de IA, Recorrido, Contacto) muestran sólo el título a la izquierda. En celular (< 960 px) el riel
   se parte (`display:contents`): el título (`.riel-top`) queda fijo y chico bajo la franja del gráfico (o
   bajo la barra fuera de la escena, `.fuera`) y el estado y el lugar (`.riel-meta`) pasan al flujo.
5. Secciones, en el orden de las figuras (desde la 013: **Data science → Ecología → Docencia**, la de
   menos detalle al final; desde la 014 Agentes de IA va después de los tres casos): **índice de casos**
   (`#casos`, con la leyenda de estados), **Data science** (`#ingenieria`), **Ecología** (`#investigacion`),
   **Docencia** (`#educacion`), **Agentes de IA** (`#agentes`, franja oscura, fuera de la escena de la
   figura fija), **Recorrido** (`.ruta`, vertical) y **Contacto**. Los id no cambiaron.
6. Un caso es una slide: el titular (`.problema`) y tres viñetas (`ul.vinetas`: Problema / Qué hice /
   Resultado, de unas 8 a 15 palabras). Agentes de IA sigue el mismo formato. El detalle (método en tres
   pasos, esquemas, herramientas, publicaciones, plegables) se quitó en la 015: vive en el CV y, en parte,
   en el árbol del Recorrido. Palabras visibles: de 1549 (014) a 641 en escritorio, 993 con las ramas abiertas.
7. **Recorrido** (`ul.arbol`): un árbol al estilo de `tree`, con la tipografía y la paleta del sitio (las
   líneas ├ └ │ son bordes CSS en `li::before/::after`). Raíz por etapas (PUCV, doctorado en UWA, Research
   Associate en UWA, Santiago hoy); nivel 2, qué hizo en cada etapa; nivel 3, publicaciones con DOI (15, todas
   resueltas en CrossRef con Moreira-Grez entre los autores) y herramientas por etapa. Al cargar se ve
   abierto hasta el nivel 2; cada rama del nivel 3 se abre con su botón (`.abrir`, `aria-expanded`,
   `aria-controls`; clic o teclado). Sin JS, todo abierto. Fuente única: el CV del vault.

## Las figuras (iteración 014; la 013 tenía figuras de paper de 4, 2 y 1 paneles)

Tres gráficos, **un panel cada uno**, con estilo de paper (ejes en L, barras de error, coral y burdeos del
paper de biocrust, Moreira-Grez et al., *Frontiers in Microbiology* 2019, 10:2143) y un **gradiente de
detalle por elementos**, de más a menos, en el orden de la página:

- **Data science**: dos series (el bus que deriva, en coral, y otro bus, en burdeos), la banda de referencia
  de los primeros 10 días ± 2σ con su media punteada, y la alerta (guía vertical y anillo donde la serie
  sale de la banda).
- **Ecología**: dos series (superficie en coral, profundo en burdeos) de función microbiana como porcentaje
  de la referencia a 0, 3, 6, 12, 18 y 24 meses, con barras de error ± EE y la línea de referencia.
- **Docencia**: una línea (logro del curso en un tema, ocho ensayos; sólo promedios del curso) y un acento
  (el ensayo en que cae, en burdeos, «tema nuevo»).

- **Generación**: `python3 scripts/figuras.py --pegar` (numpy; semilla fija) escribe las seis SVG en
  `index.html`: la variante `.w` (viewBox 640 × 280) entre `<!-- figw:ds|ec|do -->` en el riel de cada caso, y la
  `.n` (400 × 220) entre `<!-- fig:ds|ec|do -->` en la franja de celular. Las SVG no llevan colores: usan clases (`eje`, `tick`, `titulo`, `banda`, `ref`,
  `linea a|b|ink`, `pt a|b`, `alerta`, `acento`, `leyenda`, `sello`) que el CSS pinta con las variables del
  sitio (`--ink`, `--muted`, `--serie-a` coral, `--serie-b` burdeos, que en oscuro es `#D9555A`), con la
  tipografía del sitio (Plex Mono en marcas y rótulos chicos, Bricolage en los títulos de eje). Cada SVG
  lleva `role="img"` y un `aria-label` que describe el gráfico, y el sello «Datos simulados». Peso: unos
  17 KB las seis.
- **El trazo**: las líneas llevan `pathLength="1"` y el CSS las dibuja con `stroke-dashoffset` (1,1 s); la
  banda, la referencia y la leyenda aparecen con un fundido corto, y la alerta, los puntos con sus barras y
  el acento después, en orden. Todo dentro de `@media (prefers-reduced-motion:no-preference)`: con movimiento
  reducido, o sin JS, el gráfico aparece completo y quieto. La clase `.traza` la pone el JS cada vez que la
  figura mostrada cambia (quitarla, forzar reflow y volver a ponerla reinicia las animaciones), así el gráfico
  se traza cada vez que se llega a su sección, también al volver.
- **En la página** (015): en escritorio el gráfico va en `.riel-fig .plot` (ancho de la columna, `aspect-ratio:
  640/280`, tope `38vh`); bajo 960 px, en la franja `#serie` (`.plot` con alto `clamp(8rem,24vh,11rem)` en
  tablet y ancho completo con `aspect-ratio:400/220` y tope `30vh` en celular). Sin pie de figura ni párrafo
  explicativo: la leyenda y los rótulos van dentro del gráfico.
- **Cuál se muestra y cuándo se traza** (JS de `index.html`): «línea de lectura» al 35 % del espacio visible
  bajo la barra y la franja; el caso actual es la última sección cuyo borde superior la pasó (Data science → 1;
  Ecología → 2; Docencia → 3; antes de la primera, 1). Al cambiar, se traza el gráfico de ese caso donde esté
  (`lugar(k)`: el riel en escritorio, la hoja de la franja en celular), sólo cuando está a la vista; cuando la
  escena sale por arriba se olvida el caso y al volver se vuelve a trazar. Sin JS: todos completos, franja suelta.
- Lo que salió: en la 013, los cuadros de Manim (`anim/`, `scripts/animacion.py`, `scripts/empaquetar_cuadros.py`),
  `scripts/serie.py` y `scripts/senales.py`; en la 014, las SVG externas de matplotlib (`fig/`) y sus pies; en la
  015, los botones de figura, el método en tres pasos, los esquemas de flujo, las fichas de herramientas, las
  métricas, el esquema RNA-SIP y los plegables (`tabla-periodica.webp` y `autodiagnostico.webp` ya no se usan).

## La serie fija y la portada que se encoge (iteración 010)

Todo lo que va de las figuras al final de Docencia está dentro de `div.escena`; con JS la figura gana la
clase `fijo` (`position:sticky` bajo la barra) y queda pegada hasta que termina la escena (antes de
Recorrido). Sin JS no se pega.

- **Alto de la figura.** El script publica `--fig-h` (alto medido); de él cuelgan `scroll-padding-top`, el
  riel de cada sección y las anclas, para que nada quede tapado (también al enfocar con teclado).
  `#recorrido` y `#contacto` lo restan porque ya no hay figura fija ahí.
- **Tamaños.** El `.plot` tiene alto fijo por tramo (ver «Las figuras») y el SVG se contiene dentro; en
  pantallas bajas (< 520 px de alto) mide 5,5 rem.
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
  `#F86848`. Series de los gráficos: `--serie-a` coral `#F86848` y `--serie-b` burdeos `#900008` (en oscuro
  `#D9555A`); los gráficos no tienen fondo propio. La franja de
  agentes (`--panel`) es tinta cálida `#231B1A` en los dos temas, con acento `#FF9A82`. Contrastes de texto
  ≥ 6,0:1 en claro y ≥ 6,6:1 en oscuro; el color de marca sólo marca, no es texto.
- `tabla-periodica.webp` y `autodiagnostico.webp` son recortes de las herramientas públicas de
  `aula-herramientas`, capturadas a 2x y recortadas para no incluir cabeceras con nombres de
  instituciones. Regenerar: captura a 2560×1720, `convert … -crop 1200x1000+680+370` y
  `-crop 1960x540+300+810 -resize 1400x`, calidad WebP 80.
- `og.png` (1200×630) es una captura de la portada a 1200×630, tema claro, ocultando `.lede, .acciones,
  .lugar, .indice, .tema, .escenarios` y con `.hero{padding-block:1.25rem 1.75rem}` para que quepan el
  nombre, el titular y el gráfico de Data science. Se rehace si cambia la portada (la 014 cambió el gráfico).
- Anchos en `rem`/`em`, no en `ch`. Los respaldos `Bricolage Respaldo` y `Source Serif Respaldo`
  usan `size-adjust` medido contra Arial y Georgia para que la página no salte al cargar la fuente.
