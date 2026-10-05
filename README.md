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
2. **Portada**: titular, una frase que dice quién es y qué hace, y dos acciones.
3. **La serie** (`#serie`): panel oscuro en los dos temas, con la curva en tres lecturas.
4. **Índice de casos** (`#casos`) con la leyenda de estados.
5. **Casos**: `#ingenieria`, `#investigacion`, `#educacion`. Título y estado en un riel (fijo desde
   960 px); en el cuerpo, el problema, el libro, la evidencia y el detalle plegado (`details.mas`).
6. **Agentes de IA** (`#agentes`): franja oscura entre Ingeniería e Investigación.
7. **Recorrido** (`.ruta`) y **Contacto**.

## La serie de la portada

- Es un **esquema con datos simulados** y semilla fija, y lo dice. La genera `scripts/senales.py`
  (numpy); `python3 scripts/senales.py` imprime bloques rotulados que se pegan a mano en
  `index.html`. Del script se usan hoy la serie y el perfil RNA-SIP; las demás salidas (tramas CAN,
  año de Química, miniatura de la tabla periódica) quedaron sin uso.
- Si cambia la serie hay que actualizar juntos: los paths de las tres capas, `data-z`, `data-hit`,
  la posición de `.alerta` y la de las palabras de la capa *explicar*.
- El path que lee el JS (`.trend`) sólo usa comandos absolutos `M`/`L` con números positivos: el
  script lo parsea con una expresión regular.
- **Pasos** (Medir, Detectar, Explicar): se dibujan solos al cargar y se pueden elegir a mano.
- **Cursor de lectura** (`.cursor`, `role="slider"`): recorre los 36 muestreos con el puntero, el
  dedo (`touch-action:pan-y`: el scroll vertical sigue libre) o las flechas, y muestra muestreo y
  desvío; desde el muestreo `data-hit`, si el desvío supera 2σ, marca «no vuelve a la referencia».
- Sin JS la figura se ve completa y quieta. Con `prefers-reduced-motion` no hay animación: parte
  completa, y los pasos y el cursor siguen funcionando.

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
  ocultando `.lede, .acciones, .lugar, .indice, .tema, .lectura` y con
  `.hero{padding-block:1.75rem 2rem}` para que quepan el nombre, el titular y la serie. Se rehace
  si cambia la portada.
- Anchos en `rem`/`em`, no en `ch`. Los respaldos `Bricolage Respaldo` y `Source Serif Respaldo`
  usan `size-adjust` medido contra Arial y Georgia para que la página no salte al cargar la fuente.
