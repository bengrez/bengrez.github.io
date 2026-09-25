# Sitio personal — Benjamín Moreira-Grez

Página única, HTML autocontenido (`index.html`): CSS y JS en línea, tipografías desde Google
Fonts, sin otras dependencias. Pensada para GitHub Pages u hosting estático equivalente.

Guía normativa: el plan de diseño del 2026-09-17 (artifact `claude.ai/artifact/Biv24tvWaomvxFeu8jFvLs`)
y el brief `~/LLM-context/_vault/25_AGENT_COMMS/msg-030-2026-09-18-…`, con la decisión del dueño del
2026-09-22 (rediseño expresivo: parallax, esquemas por sección, sección de recursos). Contexto del
proyecto en `~/LLM-context/Personal/sitio-personal/`.

Publicado con GitHub Pages desde la rama `main`, raíz del repositorio: https://bengrez.github.io/

## Movimiento y esquemas

- **Todas las figuras son esquemas**, con datos simulados y semilla fija, y lo dicen en su rótulo.
  Las genera `scripts/senales.py` (numpy): la serie del hero (medir, detectar, explicar), las tramas
  CAN, el perfil RNA-SIP, la línea del año de Química de 8.º básico y la miniatura de la tabla
  periódica. `python3 scripts/senales.py` imprime bloques rotulados que se pegan a mano en
  `index.html`; no hay paso de build. La salida es idéntica en cada corrida.
- Si cambia la serie del hero, hay que actualizar juntos: los paths de las tres capas, `data-z`,
  `data-hit`, la posición de `.alerta` y la de las palabras de la capa *explicar*.
- Los paths que lee el JS (`.trend`) sólo usan comandos absolutos `M`/`L` con números positivos:
  el script los parsea con una expresión regular.
- **Parallax**: capas `[data-depth]` dentro de escenas `[data-scene]`, movidas sólo con `transform`
  en un cuadro de `requestAnimationFrame`, hasta 56 px en escritorio y 18 px en móvil. Con
  `prefers-reduced-motion` no se mueve nada; sin JS la página queda completa y quieta.
- `og.png` (1200×630) es una captura del hero con movimiento reducido; se rehace si cambia el hero.
- Anchos en `rem`/`em`, no en `ch`: `ch` depende de la fuente y hacía saltar la página al cargar
  Bricolage. Los respaldos `Bricolage Respaldo` y `Source Serif Respaldo` usan `size-adjust`
  medido contra Arial y Georgia por la misma razón.

## Tarjetas, esquema del sistema y capturas (2026-09-23)

- Las tres tarjetas de la portada llevan un arte SVG propio (mapa de telemetría, perfil RNA-SIP,
  fragmento de tabla periódica), dibujado en línea con las variables de color del sitio.
- `Ingeniería` ya no abre con la banda de tramas CAN (2026-09-23: un solo gráfico al principio, la
  serie de la portada, que la sección retoma como telemetría); el esquema del sistema (SVG en línea)
  va dentro del cuerpo y en pantallas angostas se desplaza en horizontal.
- `tabla-periodica.webp` y `autodiagnostico.webp` son recortes de las herramientas públicas de
  `aula-herramientas`, capturadas a 2x con Chrome headless y recortadas para no incluir cabeceras con
  nombres de instituciones. Regenerar: captura a 2560×1720, `convert … -crop 1200x1000+680+370` y
  `-crop 1960x540+300+810 -resize 1400x`, calidad WebP 80.

## Menos texto, misma información (2026-09-24)

- El caso de cada sección (Problema, Qué había, Qué hice, Resultado) y la formación son **rutas**
  (`.ruta`): estaciones sobre una regla continua en escritorio, espina vertical bajo 760 px.
- **Ingeniería**: el esquema del sistema (`.sistema.pegado`) queda fijo arriba desde 1024 px de ancho
  y 640 px de alto, y el bloque de la ficha que cruza el centro de la pantalla ilumina su nodo
  (`dd[data-nodo]` y `g[data-nodo]`, script al final del archivo). Sin JS, o con pantalla angosta o
  baja, el esquema es estático y cada rótulo nombra su nodo. Con `prefers-reduced-motion` no hay
  transiciones de color.
- **Aula**: el asistente de gestión escolar («medir un colegio») es un esquema escrito a mano con las
  mismas clases que el esquema del sistema; `scripts/senales.py` no lo genera.
- Las tres lecturas de Investigación (medir, detectar, explicar; `.tres`) reutilizan los glifos de
  la leyenda de la portada.

