# Sitio personal — Benjamín Moreira-Grez

Página única, HTML autocontenido (`index.html`): CSS y JS en línea, tipografías desde Google
Fonts (Bricolage Grotesque, Source Serif 4, IBM Plex Mono), sin otras dependencias ni paso de
build. Desde la 014 las tres figuras son SVG en línea, un panel por caso, generadas con
`scripts/figuras.py` y trazadas al entrar a cada sección (ver «Las figuras»). Pensada para GitHub Pages u
hosting estático equivalente.

Contexto del proyecto, guía normativa y guardrails (privacidad, no nombrar cliente ni colegio,
DOI verificados) en `~/LLM-context/Personal/sitio-personal/`.

Publicado con GitHub Pages desde la rama `main`, raíz del repositorio: https://bengrez.github.io/

## Estructura (desde la 008; dos columnas desde la 012; figuras de paper desde la 013, un panel desde la 014; gráfico en la columna izquierda y sin botones desde la 016)

La tesis de la portada («Resuelvo problemas con lo que hay disponible») se prueba con la forma de la
página: cada caso lleva **su gráfico, con estilo de paper y el detalle que su evidencia permite**
(dos series con banda y alerta; dos series con barras de error; una línea y un acento), se cuenta con los **tres pasos del método** (Medir · Ver la
desviación · Explicar y actuar) y cada cosa lleva su **estado real** (`.estado`: `e-uso` publicado o en
uso, `e-piloto` en piloto, `e-dev` en desarrollo; el glifo siempre va con su texto).

1. **Barra** fija: nombre, secciones (bajo 900 px sólo Contacto) y botón de tema.
2. **Portada**: titular, una frase que dice quién es y qué hace, y dos acciones. El titular se encoge
   con el scroll (ver «La serie fija y la portada que se encoge»).
3. **Las figuras** (`#serie`): tres SVG en línea (`.hoja > .plot > svg.fig`), integradas al fondo en los dos
   temas. Se ve una a la vez, la del caso que se está leyendo, y se traza al entrar (ver «Las figuras»).
   Con JS queda fija mientras se recorren los tres casos: desde 960 px en la columna izquierda, sobre el
   título; en celular, en una franja bajo la barra. Desde la 016 no hay botones: se navega con la barra y
   el scroll.
4. Desde la 012, **todo el sitio son dos columnas** (`.pagina.dos`), centradas 50/50 desde la 016: a la
   izquierda el **riel** (`header.riel`: rótulo, título, estado y lugar), fijo mientras dura la sección
   (`position:sticky` desde 960 px, bajo la figura); a la derecha el contenido, que avanza con el scroll.
   En los tres casos, la figura ocupa la misma columna izquierda: `#escena` es una rejilla de una columna
   con las cuatro secciones en filas explícitas y `#serie` abarca las cuatro filas (así su alto propio queda
   pegado bajo la barra y se va con la escena); la figura tiene fondo opaco para tapar el título que sube y la
   franja no recibe clics. En celular
   (< 960 px) el riel se parte (`display:contents`): el título (`.riel-top`) queda fijo y chico bajo el
   gráfico (o bajo la barra en Recorrido y Contacto, `.fuera`) y el estado y el lugar (`.riel-meta`) pasan
   al flujo, sobre el contenido.
5. Secciones, en el orden de las figuras (desde la 013: **Data science → Ecología → Docencia**, la de
   menos detalle al final; desde la 014 Agentes de IA va después de los tres casos): **índice de casos**
   (`#casos`, con la leyenda de estados), **Data science** (`#ingenieria`), **Ecología** (`#investigacion`),
   **Docencia** (`#educacion`), **Agentes de IA** (`#agentes`, franja oscura, fuera de la escena de la
   figura fija), **Recorrido** (`.ruta`, vertical) y **Contacto**. Los id no cambiaron.
6. Un caso es: el problema (`.problema`), una nota sobre su figura (`.grafico`, mono, con «datos
   simulados»), el método en tres pasos (`ol.metodo`: Medir / Ver la desviación / Explicar y actuar, dos o
   tres frases cada uno), la evidencia (esquemas `.flujo`, herramientas `.herr`, métricas, RNA-SIP), «con
   qué» y el detalle plegado (`details.mas`). El libro Había / Hice / Quedó de la 008 se quitó en la 012.

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

- **Generación**: `python3 scripts/figuras.py --pegar` (numpy; semilla fija) escribe las seis SVG entre los
  marcadores `<!-- fig:ds -->`, `<!-- fig:ec -->` y `<!-- fig:do -->` de `index.html`: dos variantes por
  figura, `.w` (viewBox 640 × 280, desde 900 px) y `.n` (400 × 220, celular y tablet; la que no corresponde
  va con `display:none`). Las SVG no llevan colores: usan clases (`eje`, `tick`, `titulo`, `banda`, `ref`,
  `linea a|b|ink`, `pt a|b`, `alerta`, `acento`, `leyenda`, `sello`) que el CSS pinta con las variables del
  sitio (`--ink`, `--muted`, `--serie-a` coral, `--serie-b` burdeos, que en oscuro es `#D9555A`), con la
  tipografía del sitio (Plex Mono en marcas y rótulos chicos, Bricolage en los títulos de eje). Cada SVG
  lleva `role="img"` y un `aria-label` que describe el gráfico, y el sello «Datos simulados». Peso: unos
  17 KB las seis.
- **El trazo**: las líneas llevan `pathLength="1"` y el CSS las dibuja con `stroke-dashoffset` (1,2 y 1,4 s según la
  línea); la banda, la referencia y la leyenda aparecen con un fundido corto, con la curva común y escalonados (ver «Movimiento de
  las secciones»), y la alerta, los puntos con sus barras y
  el acento después, en orden. Todo dentro de `@media (prefers-reduced-motion:no-preference)`: con movimiento
  reducido, o sin JS, el gráfico aparece completo y quieto. La clase `.traza` la pone el JS cada vez que la
  figura mostrada cambia (quitarla, forzar reflow y volver a ponerla reinicia las animaciones), así el gráfico
  se traza cada vez que se llega a su sección, también al volver.
- **En la página**: `.plot` tiene alto fijo por tramo (`clamp(10rem,28vh,14rem)` entre 900 y 959 px,
  `clamp(8rem,24vh,11rem)` entre 640 y 899, y en celular ancho completo con `aspect-ratio:400/220` y tope
  `30vh`; desde 960 px llena la columna izquierda con la variante angosta `.n` hasta 1199 px y la ancha `.w`
  desde 1200, con tope de `44vh`) para que la figura fija no cambie de alto al pasar de un gráfico a otro. Sin pie de figura: la
  explicación está en el párrafo `.grafico` de cada caso.
- **Cuál se muestra** (JS de `index.html`): «línea de lectura» al 35 % del espacio visible bajo la barra y
  la figura; la figura es la de la última sección cuyo borde superior la pasó (Data science → 1; Ecología →
  2; Docencia → 3; antes de la primera, 1). Desde 960 px la línea de lectura sólo descuenta la barra (la figura no tapa nada de la derecha). Sin JS: la primera, suelta.
- Lo que salió: en la 013, los cuadros de Manim (`anim/`, `scripts/animacion.py`, `scripts/empaquetar_cuadros.py`),
  `scripts/serie.py` y `scripts/senales.py`; en la 014, las SVG externas de matplotlib (`fig/`) y sus pies.

## Movimiento de las secciones (iteración 019; curva final y escalonado en la 020)

Todos los movimientos propios del sitio (trazo y fundidos de los gráficos, compactación del título de la portada, salto con
ancla y contenido ligado al scroll) comparten una curva de tres tramos: **lento y visible al partir** (35 % del tiempo a
pendiente 0,35, el 12 % del recorrido), **un tramo rápido** (otro 35 % a pendiente 1,75, cinco veces más rápido: el 61 %) y
**una llegada suave** (30 % de frenada cuadrática hasta cero: el 26 % restante). En CSS es
`linear(0,.123 35%,.737 70%,.832 76%,.905 82%,.958 88%,.989 94%,1)` con `cubic-bezier(.6,0,.4,1)` de respaldo; en JS, la función
`suave(p)`, que da lo mismo. (La 018 y la 019 tenían dos pendientes con contraste ≈ 10× y frenaban en seco.)

- **Escalonado de los gráficos**: banda, referencia y nota 0,5 s; línea b 1,2 s (retardo .1 s); línea a 1,4 s (.2 s); leyenda
  0,6 s (.5 s); alerta y acento 0,7 s (1,3 s); puntos con barras 0,5 s + 0,03 s por punto, con retardo .1 s + 0,08 s por punto.
- **Salto con ancla** (barra, índice de casos, botones, enlaces `#…`): `portada.saltar` anima el scroll con
  `requestAnimationFrame` (0,8 a 1,5 s según la distancia). Recalcula el destino en cada cuadro (la portada y la figura cambian
  de alto, y el destino respeta `scroll-padding-top` y `scroll-margin-top`), se interrumpe con rueda, toque, teclado o clic, y
  se suelta si otra cosa mueve la página. Con movimiento reducido es inmediato; sin JS, anclas normales. La rueda, las flechas y
  Re Pág siguen siendo nativas.
- **Contenido ligado al scroll**: cada bloque de la columna derecha (`.dos>div:not(.riel)>*`, `.dos>.ruta`) sube 1,75 rem
  mientras entra, según el scroll y no el tiempo: `animation-timeline:view()` con `animation-range:entry 0% entry var(--rango)`.
  Escalonado: `--rango` es 12 rem para el primer bloque de la sección y suma 2 rem por posición (hasta 28 rem). La figura fija y
  el título (`.riel`) no se mueven. Sin soporte, un respaldo en JS calcula lo mismo en cada `scroll`. Con movimiento reducido,
  quieto. Excepción registrada del guardrail 6 del CONTEXT.

## La serie fija y la portada que se encoge (iteración 010)

Todo lo que va de las figuras al final de Docencia está dentro de `div.escena`; con JS la figura gana la
clase `fijo` (`position:sticky` bajo la barra) y queda pegada hasta que termina la escena (antes de
Recorrido). Sin JS no se pega.

- **Alto de la figura.** El script publica `--fig-h` (alto medido); de él cuelgan `scroll-padding-top`, el
  riel de cada sección y, en celular, las anclas, para que nada quede tapado (también al enfocar con
  teclado). `#recorrido` y `#contacto` lo restan porque ya no hay figura fija ahí. Desde 960 px las anclas
  sólo descuentan la barra.
- **Tamaños.** El `.plot` tiene alto fijo por tramo (ver «Las figuras») y el SVG se contiene dentro; en
  pantallas bajas (< 520 px de alto) mide 5,5 rem.
- **Titular que se encoge.** `.hero` define `--k` (0 a 1) y el tamaño de letra, el interlineado, los
  márgenes y el relleno van de su valor grande al compacto. `--k` depende sólo del scroll (los primeros
  160 px, con la curva común de los movimientos: lenta, rápida y de llegada suave) y se queda en 1. Al saltar con un ancla, la portada se compacta antes de medir
  (si no, se encogería en pleno salto y la sección quedaría tapada); `overflow-anchor:none` evita que el
  navegador compense el cambio de alto.

## Esquemas de flujo

`ol.flujo` (sistema de la flota, asistente del colegio) es HTML, no SVG: una columna con la flota
bifurcada en dos columnas bajo la base de datos. Hasta la 015 había además una fila con ramas desde
1100 px; con el contenido en media columna (016) ya no cabe y se quitó. Cada flecha es un
pseudo-elemento recortado con `clip-path` (`fb`/`fb2` hacia abajo). El texto de los nodos es texto real.

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
  .lugar, .indice, .tema` y con `.hero{padding-block:1.25rem 1.75rem}` para que quepan el
  nombre, el titular y el gráfico de Data science. Se rehace si cambia la portada (la 014 cambió el gráfico).
- Anchos en `rem`/`em`, no en `ch`. Los respaldos `Bricolage Respaldo` y `Source Serif Respaldo`
  usan `size-adjust` medido contra Arial y Georgia para que la página no salte al cargar la fuente.
