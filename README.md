# Sitio personal — Benjamín Moreira-Grez

Página única, HTML autocontenido (`index.html`): CSS y JS en línea, tipografías desde Google
Fonts (Bricolage Grotesque, Source Serif 4, IBM Plex Mono), sin otras dependencias ni paso de
build. Pensada para GitHub Pages u hosting estático equivalente.

Contexto del proyecto, guía normativa y guardrails (privacidad, no nombrar cliente ni colegio,
DOI verificados) en `~/LLM-context/Personal/sitio-personal/`.

Publicado con GitHub Pages desde la rama `main`, raíz del repositorio: https://bengrez.github.io/

## Estructura (rediseño del 2026-10-05, handoff 008)

La tesis de la portada («Resuelvo problemas con lo que hay disponible») se prueba con la forma de
la página: cada caso es un libro de tres columnas, **Había / Hice / Quedó**, y cada cosa lleva su
**estado real** (`.estado`: `e-uso` publicado o en uso, `e-piloto` en piloto, `e-dev` en desarrollo;
el glifo siempre va con su texto).

1. **Barra** fija: nombre, secciones (bajo 900 px sólo Contacto) y botón de tema.
2. **Portada**: titular, una frase que dice quién es y qué hace, y dos acciones. El titular se encoge
   con el scroll (ver «La serie fija y la portada que se encoge»).
3. **La serie** (`#serie`): panel oscuro en los dos temas, con la línea y la alerta. Con JS queda
   fija bajo la barra mientras se recorren los tres casos.
4. **Índice de casos** (`#casos`) con la leyenda de estados.
5. **Casos**, en el orden de la serie: **Data science** (`#ingenieria`), **Docencia** (`#educacion`) y
   **Ecología** (`#investigacion`); los títulos son esos, los id no cambiaron. Título y estado en un riel
   (fijo desde 960 px, bajo la serie fija); en el cuerpo, el problema, el libro, la evidencia y el detalle
   plegado (`details.mas`).
6. **Agentes de IA** (`#agentes`): franja oscura entre Ingeniería y Educación.
7. **Recorrido** (`.ruta`) y **Contacto**.

## La serie de la portada (minimalista desde la 011)

Un mismo gráfico con **tres escenarios**, en este orden: Data science (temperatura del refrigerante
de un bus, por día), Docencia (logro agregado de un curso en un tema, por ensayo) y Ecología (función
microbiana de un suelo post-minería frente a su referencia). El mensaje es el mismo: medir, ver la
desviación a tiempo, actuar.

**Desde la 011 el gráfico muestra sólo**: la **línea** (la tendencia), la **alerta** (anillo y punto de
alerta), el **escenario con su unidad** (`Data science · °C`, `Docencia · % de acierto`,
`Ecología · % de la referencia`) y «datos simulados» en chico, a la derecha. Salieron: las réplicas, la
banda de referencia y su línea central, las marcas de acción, la proyección «sin actuar», las palabras,
la cuadrícula, los tres pasos, la nota y el cursor de lectura. **Dónde quedó lo que decían**: los pasos
(Medir, Ver la desviación, Explicar y actuar) y los datos de cada paso van en un párrafo `.leer` bajo el
problema de cada caso (`#ingenieria`, `#educacion`, `#investigacion`).

- Es un **esquema con datos simulados** y semilla fija, y lo dice. Nada es dato de estudiantes, de una
  empresa ni de un sitio real; Docencia usa sólo promedios del curso.
- La genera `scripts/serie.py` (numpy): `python3 scripts/serie.py json` imprime el JSON de los tres
  escenarios (va en `<script type="application/json" id="escenarios">`), `html` imprime el escenario
  inicial (el bloque dentro de `.plot`, para que sin JS la figura se vea completa y quieta) y `meta`
  imprime umbrales y alertas. Para cambiar un escenario: editar `serie.py` y volver a pegar el JSON y
  el HTML. La alerta sigue dependiendo de la referencia ± 2σ, que se calcula pero ya no se dibuja.
  El escenario Ecología reproduce, con la semilla original, la serie de la 008. En la 011 sólo cambió
  la escala vertical (cada serie ocupa la altura disponible; sin proyección ya no hace falta el hueco).
- Cada escenario trae: la tendencia (`trend`), la alerta (`alert`, en % de la figura), el rótulo
  (`rotulo`), la descripción para lectores de pantalla (`aria`) y su `id`/`tab`.
- El path que lee el JS (`.trend`) sólo usa comandos absolutos `M`/`L` con números positivos.
- **Escenarios**: botones `.esc` (`aria-pressed`) sobre la figura; sólo existen con JS. Desde la 010 el
  escenario lo manda el scroll y los botones llevan a la sección correspondiente.
- La línea se dibuja sola al cargar y después salta la alerta. Sin JS la figura (escenario 1) se ve
  completa y quieta. Con `prefers-reduced-motion` no hay animación: parte completa.

## La serie fija y la portada que se encoge (iteración 010)

Todo lo que va de la serie al final de Ecología está dentro de `div.escena`; con JS la figura gana la
clase `fijo` (`position:sticky` bajo la barra) y queda pegada hasta que termina la escena (antes de
Recorrido). Sin JS no se pega y se ve como en la 009.

- **Escenario por scroll.** El escenario es el de la última sección (`#ingenieria`, `#educacion`,
  `#investigacion`) cuyo borde superior ya pasó la «línea de lectura»: el 35 % del espacio visible bajo la
  barra y la figura. Agentes de IA no tiene escenario propio y sigue el de Data science; Recorrido y
  Contacto siguen el de Ecología. El cambio espera 90 ms de calma, así un scroll rápido no parpadea.
- **Transición.** La línea se desplaza (800 ms, curva suave): se muestrea en la unión de las x de las dos
  curvas y la alerta se interpola; el rótulo cambia a los 320 ms. Con `prefers-reduced-motion` el cambio
  es instantáneo.
- **Botones de escenario.** Mantienen su lugar: al pulsarlos cambian el escenario y llevan a la sección
  (`portada.saltar`), así el gráfico y el texto no se contradicen. Los enlaces con ancla esperan a que
  termine el desplazamiento antes de evaluar, para no pasar por los escenarios intermedios.
- **Alto de la figura.** El script publica `--fig-h` (alto medido); de él cuelgan `scroll-padding-top`, el
  riel de cada caso y las anclas, para que nada quede tapado (también al enfocar con teclado).
  `#recorrido` y `#contacto` lo restan porque ya no hay figura fija ahí.
- **Tamaños.** En modo fijo el trazo mide `clamp(5.5rem, 9vw, 7.5rem)`; la figura entera (botones, rótulo
  y línea) ocupa unos 190–230 px (011; con los pasos eran 245–261). En pantallas bajas (< 520 px de alto)
  el trazo baja a 4,5 rem y los botones y el rótulo van en una fila.
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
  y lo recuerda en `localStorage` (clave `tema`). Los colores del panel (`--panel`, `--p-*`) son
  propios y casi iguales en ambos temas.
- `tabla-periodica.webp` y `autodiagnostico.webp` son recortes de las herramientas públicas de
  `aula-herramientas`, capturadas a 2x y recortadas para no incluir cabeceras con nombres de
  instituciones. Regenerar: captura a 2560×1720, `convert … -crop 1200x1000+680+370` y
  `-crop 1960x540+300+810 -resize 1400x`, calidad WebP 80.
- `og.png` (1200×630) es una captura de la portada con movimiento reducido, a 1200×630, tema claro,
  ocultando `.lede, .acciones, .lugar, .indice, .tema, .escenarios` y con
  `.hero{padding-block:1.25rem 1.75rem}` para que quepan el nombre, el titular y la serie. Muestra el primer
  escenario (data science). Se rehace si cambia la portada (la 010 achicó el gráfico; la 011 lo dejó en línea y alerta).
- Anchos en `rem`/`em`, no en `ch`. Los respaldos `Bricolage Respaldo` y `Source Serif Respaldo`
  usan `size-adjust` medido contra Arial y Georgia para que la página no salte al cargar la fuente.
