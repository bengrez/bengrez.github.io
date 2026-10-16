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
- **El trazo**: las líneas llevan `pathLength="1"` y el CSS las dibuja con `stroke-dashoffset` (1 s); la banda, la referencia y la leyenda aparecen con un fundido corto, con la curva común y escalonados (ver «Movimiento de
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

## Celular: más aire y menos información (iteración 022)

Bajo 640 px: margen lateral de 1,3 rem (`--gutter`), interlineado de 1,7 (`body`, `.metodo p`), un hilo de `letter-spacing` y
`word-spacing`, más espacio entre bloques (método, evidencia, herramientas, esquemas, secciones) y la franja del gráfico más
ancha (casi a los bordes) y con más aire arriba y abajo. La descripción de cada gráfico (`.grafico`) queda plegada en un
`<details class="mas grafico-d">` con el rótulo «Cómo leer el gráfico»: lo arma el JS al cargar, sólo en celular; sin JS, o en
pantallas anchas, el párrafo se ve completo. No cambia ningún texto ni gráfico; todo vive en un bloque de CSS «celular» antes del
`footer` y en un IIFE de JS.

## Fondo con quimiotaxis en un fluido, sólo escritorio (iteraciones 024 y 025)

> **Caché (2026-10-12):** `index.html` carga `quimiotaxis.js?v=<hash>`. Cada vez que cambie el script, corre
> `scripts/version-js.sh` antes del commit para actualizar el hash; si no, los navegadores siguen con la versión vieja
> hasta 10 min (GitHub Pages).

`quimiotaxis.js` (≈ 168 KB, 65 KB gzip, sin dependencias, aparte de `index.html`: la única excepción a «JS en línea») dibuja detrás del
contenido un canvas 2D con unas 100 células de 5 a 8 px que se mueven por quimiotaxis bacteriana en una corriente suave. Un
cargador mínimo en `index.html` lo pide al terminar la página sólo si hay puntero fino (`(pointer: fine)`), el ancho es de
1024 px o más y no hay `prefers-reduced-motion` ni `saveData`: en celular y tabletas no se descarga ni el script ni el canvas.

- **Muestra ambiental** (desde la 035: 50 % bacilos, 30 % cocobacilos, 10 % cocos y 10 % espirilos; ver abajo) (monocromo con la tinta del sitio, cada forma con su opacidad): 30 % **cocos** (círculos de 5,6 px,
  opacidad .30), 50 % **bacilos** (cápsulas de 8 × 3,1 px orientadas hacia donde nadan, .42) y 20 % **espirilos** (trazo ondulado
  de 9 px, .34). Dibujo en canvas, sin imágenes.
- **Comportamiento**: bacilos, «run and tumble» como *E. coli* a 25 px/s, 1 giro/s; espirilos, tirabuzón (el rumbo ondula
  ±0,55 rad), 38 px/s y 0,35 giros/s; cocos casi no nadan: los lleva la corriente más un movimiento browniano (D = 7 px²/s).
  Quimiotaxis: tasa de giro λ = λ₀·exp(−6·s) con `s = d(ln(c + c₀))/dt` respecto de la memoria de la célula (promedio móvil de
  0,9 s), acotada entre 0,08 y 5 veces λ₀; ruido de rotación de 0,15 rad²/s.
- **Fluido**: corriente lenta (campo de velocidad sin divergencia: u = ∂ψ/∂y, v = −∂ψ/∂x con ψ suma de tres ondas planas de
  820, 560 y 1100 px y periodos de 70, 45 y 100 s; 5 a 8 px/s por onda, ≈ 7 px/s de media) que arrastra a todas las células.
- **Acoplamiento con el fluido** (026; número de Reynolds bajo: todo se mueve con el medio):
  - *Propulsión ondulatoria*: los espirilos (onda del cuerpo, λ 9 px) y los bacilos (flagelo de 6 px, λ 5 px) llevan una onda
    que viaja hacia atrás, con una fase que avanza como ω = k·v/η (η = .55) con `v` la velocidad real de nado; el avance sale de
    la onda. Tras cada giro («tumble») la célula frena al 20 % y se recupera en ≈ .35 s, y la onda se frena con ella. El vaivén de
    la trayectoria del tirabuzón usa la misma fase (fase/6), así que va acompasado con la espiral.
  - *Órbitas de Jeffery*: las células alargadas giran con θ' = ω/2 + Λ(E_xy cos2θ − E_xx sen2θ), Λ = .9, con el gradiente de la
    corriente calculado analíticamente: la corriente las orienta y no sólo las desplaza.
  - *Medio visible*: 24 a 40 partículas trazadoras (líneas de .9 px, opacidad .16 con una cola corta) llevadas sólo por la corriente.
- **Texto protegido** (026): mientras el fondo está activo, `quimiotaxis.js` pone `.fondo-vivo` en `<html>` y el CSS da a cada bloque
  de texto (párrafos, listas, títulos, fichas; no los gráficos ni la franja de Agentes) un velo del color de la página al 72 %
  (`--velo`), sin borde, con una sombra del mismo color y desenfoque (`0 0 12px 9px`) que lo difumina hacia afuera sin tocar el
  diseño. Las células pasan «por detrás» y se atenúan bajo el texto sin desaparecer. Sin el fondo (celular, tabletas, movimiento
  reducido, sin JS) no hay clase y no hay velo.
- **El scroll agita el fluido** (029): su velocidad (saturada a 2500 px/s) suma una cuarta onda de corriente corta (260 px, periodo 3 s, hasta
  16 px/s) y un empuje uniforme opuesto al scroll (hasta 12 px/s); decaen con τ = 1,6 s. (En la 029 también había palabras clave y pulsos de clic
  como fuentes; la 030 los quitó: **sólo el cursor** da nutriente, además de las cinco fuentes de fondo, y el clic y la selección de texto quedan
  como en cualquier página.) La API `agregar`/`mover`/`quitar` sigue, sin consumidores en el sitio.
- **Calma y lectura** (029): con el scroll quieto 4 s, el tiempo de la simulación baja un 40 % (factor 0,6, constante de 1,5 s) y vuelve al
  desplazarse. Una máscara de los bloques de texto (los mismos que llevan velo; se rehace cada 250 ms y al hacer scroll) aleja a las nadadoras
  (repulsión de 12 px/s por unidad de gradiente de la máscara suavizada), impide que se adhieran bajo el texto y las dibuja un 45 % más
  tenues allí. La opacidad general bajó un 12 % (cocos .26, bacilos .37, espirilos .30).
- **Realismo biológico** (029): el flagelo de los bacilos que nadan es una onda de 9 px (λ ≈ 6,6 px) que viaja hacia atrás y no se dibuja en los
  adheridos; la **división** alarga la célula y la estrecha al medio (constricción) y las hijas quedan exactamente donde terminan los dos lóbulos
  (a lo largo del eje; si no cabe, se prueba con el eje girado y la célula empuja a las vecinas); **cocos** en pares (diplococos, 40 %: una sola
  división) y cadenas (estreptococos, 60 %: el eje se mantiene y a veces se rompe); **colonias** de crecimiento radial (los bastones y las cadenas
  se alinean con el radio), borde irregular (la hija sale con el eje desviado ±0,3 rad), matriz (EPS) en rastros alargados, más densa en el centro (034: ver abajo) y variación individual de tamaño (×0,88–1,18) y de ritmo de crecimiento (×0,75–1,25).
- **Choques suaves**: las células no se superponen; cada una cede la mitad del solape (rigidez .45, hueco de .6 px).
- **Nutriente que difunde y se consume** (027): un campo `c` en [0, 1] sobre una grilla gruesa de 64 × 40 celdas (≈ 22 px) con
  difusión explícita (D = 380 px²/s; subpasos para ser estable; sin flujo por los bordes), reposición de las fuentes
  (c' = 0,2·a·g·(1 − c), con `g` el perfil gaussiano de cada fuente), un decaimiento uniforme (0,05/s) y consumo de Monod por las
  células de su celda (q·c/(K + c), K = 0,2; q = 0,28/s por unidad de biomasa adherida y 0,004/s por nadadora). La quimiotaxis
  lee `campo(x, y)` (interpolación bilineal de la grilla); `usarCampo(fn)` reemplaza lo que lee la quimiotaxis, pero la grilla
  sigue siendo lo que se consume y donde se adhieren y crecen las células. Las fuentes de la API reponen nutriente en la grilla.
- **El cursor como fuente de nutriente** (028): si el cursor se queda quieto 1,5 s (tolerancia de 6 px para el temblor de la mano; se
  escucha `pointermove` en `window`, el canvas sigue sin capturar eventos), nace una fuente en ese punto (033: σ = 0,78 veces la de fondo, un núcleo compacto) que
  **emite en pulso** (033). Se modela la *tasa* de emisión, una gamma normalizada: r(τ) = (τ/20 s)²·e^(2·(1 − τ/20 s)), con máximo 1 a los 20 s, 0,17 a los 60 s y 0,02 a los 90 s. Lo depositado D = ∫r crece como una S (36,9 en total; 0,5 a los 5 s, 11,9 a los 20 s, 34,7 a los 60 s). La fuente deposita en un montón M (M' = r − M/400 s) y su amplitud es a = 1,8·(1 − e^(−M/8)), así que el montón sigue engordando después del máximo de la tasa (a = 0,55 / 1,38 / 1,66 / 1,77 a los 10 / 20 / 30 / 60 s). Además el nutriente disuelto se extiende (σ en la grilla × (1 + 0,8·(1 − e^(−M/8)))), que es lo que atrae a más bacterias de lejos; los granos, el núcleo, no se ensanchan. Si la fuente se abandona antes de los ≈ 3 s (a < 0,015) no deja nada.
  Al irse el cursor la fuente deja de crecer, se ensancha (hasta ×1,7 en ≈ 1 min) y
  decae (τ = 40 s) hasta desaparecer. **Nutriente finito**: hay un presupuesto constante de caudal (Σ amplitud·(σ/σref)² de las cinco fuentes
  de fondo = 4,47) y lo que gana la del cursor se le quita a las de fondo, en proporción a lo que tienen sobre su piso (15 % de la suya);
  las de fondo bajan de inmediato y recuperan con τ = 20 s, así que **siempre hay 5 fuentes de fondo (nunca menos de 3)**. Hasta 3 fuentes del
  cursor vivas: al crear otra, la más vieja se apaga con τ = 4 s. Señal visual (031): **arena**, un montón visto desde arriba, sin círculos. Cada fuente del cursor lleva un conjunto fijo de granos con semilla (posiciones con distribución radial gaussiana, σ = 0,25 del de la fuente, 22 px a 900 de alto, 0,6 veces lo de la 032: centro denso, borde con granos sueltos; 1–1,6 px, en tinta del sitio). Cada grano nace en el cursor y viaja a su sitio con *ease-out* (cuadrático) en 2,5–5 s, del centro hacia afuera, repartido a lo largo de los ~15 s de crecimiento. Un grano se ve mientras la concentración de la grilla en su celda, por encima de la que había al nacer la fuente, supera su umbral propio (umbrales de 0,002 a 0,75, más bajos hacia el centro); mientras el cursor sigue ahí, 0,3·a/AMAX también cuenta, porque la grilla tarda en subir. Al irse, el montón queda y el consumo de Monod, el decaimiento y la difusión lo adelgazan grano a grano; la fuente decae con τ = 40 s (la vía rápida, τ = 4 s, es sólo para la que sobra del tope). Opacidad por tramo de concentración, con tope de 0,45 en el centro, y ×0,55 bajo el texto (misma máscara que las células). Tope de granos por nivel: 100 / 260 / 340 / 420; un `path` por tramo de alfa y por zona (libre o bajo texto). El tiempo de quietud y de crecimiento se mide con el reloj real (no con el de la simulación), así que no cambia si el equipo va corto de cuadros. Sin cursor (celular, tabletas, movimiento reducido) no existe.
- **Matriz extracelular (EPS) en rastros** (034): ya no hay discos por celda de la grilla ni halos circulares de 6,5 px. Un anillo de 700 segmentos (x, y, x, y, intensidad, nacimiento) que se desvanecen en 45 s, dibujados en tres tramos de intensidad (alfa 0,07 / 0,11 / 0,16) con trazo de 1 px: (a) cada adherida deposita cada 3,5 s (más seguido con más vecinas) un segmento de 7 px que parte de su borde hacia el centro de la colonia (el crecimiento radial; sola, a lo largo de su eje); (b) cada división deja un segmento sobre el eje de las dos hijas; (c) las nadadoras junto a una colonia dejan un rastro tenue de su desplazamiento (el previo a adherirse). Largo medio ≈ 7,5 px, contra halos de 13 px y discos de 25 px de la 033.
- **El aglomerado crece y se vuelve sólido** (034): mientras el cursor sigue quieto, el σ de los granos se multiplica por ρ(D) = 0,5 + 1,2·√(D/36,9) (el área sigue a la masa depositada: rápido cerca del máximo de r, lento en la cola; ≈ 11 px de σ a los 5 s y 37 px a los 60 s) y se dibuja un núcleo continuo e irregular (contorno con armónicos 2, 3 y 5, radio 1,15σ·√(fracción de granos del centro que quedan)) con gradiente suave y opacidad hasta 0,30 con D (se suma a los granos). Al mover el cursor más de `TOL`, el montón viejo queda como estaba (D congelada) y uno nuevo parte de cero, chico y suelto; una fuente abandonada antes de ≈ 3 s se borra sin dejar nada. El núcleo se come de afuera hacia adentro (φ de la 033 y umbrales de los granos más bajos hacia el centro).
- **Consumo frenado en el núcleo denso** (033): en un aglomerado las bacterias sólo acceden bien al borde, así que el consumo de Monod se multiplica por φ(c) = 1/(1 + 4·c²) (c es la concentración local, que hace de densidad): φ = 0,26 con c = 0,85, 0,5 con c = 0,5 y 0,86 con c = 0,2. El montón se degrada de afuera hacia adentro y dura más bajo el ataque.
- **Relaciones ecológicas, etapa 1: dos morfotipos, competencia r/K y sintrofía** (035). Las relaciones son sutiles y se distinguen por la **forma**, no por el color
  (el sitio es monocromo). La muestra pasa a 50 % bacilos, 30 % **cocobacilos** (cápsula corta de 5,3 × 3,5 px, nado lento de 20 px/s con flagelo corto), 10 % cocos y 10 % espirilos.
  - **A, estrategia r = el bacilo** (nadador rápido, flagelo largo): μmax = 2 y Ks = 0,45 (relativos a la 034: crece rápido con nutriente abundante), consume por biomasa 0,45 (poco eficiente), se adhiere
    con c > 0,55 y menos seguido (×0,7). **B, estrategia K = cocobacilos y cocos**: μmax = 0,7, Ks = 0,06, consumo 0,17 (eficiente), se adhiere con c > 0,28 y más seguido (×1,8), aguanta el hambre
    (umbral de c 0,05 en vez de 0,17) y la muerte en medio pobre (0,008 en vez de 0,02) y deposita más matriz (×1,8 de frecuencia). Los espirilos son un tercer grupo neutro (intermedio) fuera de las proporciones A:B.
  - **Competencia por la misma grilla c** con Monod propio: μ = μmax·c/(Ks + c); A gana con c alto, B con c bajo (se cruzan en c ≈ 0,12). B además se frena con exceso de nutriente (divide su
    crecimiento y su adhesión por 1 + (c/0,5)²) y las vecinas A adheridas frenan su adhesión (÷ (1 + 1,5·vecinas A)): A ocupa el núcleo rico del montón y B queda en torno. Resultado visible: con el
    cursor quieto manda A cerca del montón; en las fuentes de fondo, A coloniza primero (≈ 2 min) y B toma el relevo (≈ 4 min en adelante).
  - **Sintrofía (cross-feeding)**: una **segunda grilla p** (la misma resolución de 64 × 40 celdas; no se dibuja). Al comer, A libera subproducto (3 unidades de p por unidad de c consumida); p difunde como c y decae (0,06/s).
    Sólo B lo consume: crece con μ = 2·p/(0,08 + p) (se suma al de c), gasta 0,3, cuenta como alimento para adherirse y no pasar hambre (peso 1,2) y los cocobacilos lo siguen por quimiotaxis (señal 0,3·c + 2,5·p).
    Alrededor de un montón que A está comiendo aparece, con retardo (≈ 2 a 4 min), un halo de colonias B que viven del subproducto. `Quimiotaxis.relaciones({subproducto:false})` lo apaga (control de las mediciones).
  - **Preparado para la 036 y la 037** (sin implementar): tablas por tipo (`EST`, `MU`, `KS`…), `NA` (vecinas A) como ejemplo de relación entre pares dentro de `vecinos()`, y `p` como patrón para más grillas
    (una señal de quorum) en `difundir()`; depredación y simbiosis usarán `EST` y los mismos ganchos.
- **Relaciones ecológicas, etapa 2: depredador tipo *Bdellovibrio* y quorum sensing** (036). Todo sutil, monocromo, distinguible por la forma y sin cambiar la calma (C nada rápido, pero sólo cerca de las colonias).
  - **C, el depredador** (tipo 4; `EST` = 3): un vibrio de 5 px en forma de coma, con un flagelo polar de onda rápida, de nado muy rápido (48 px/s; A, 25). Son 3 al partir (≈ 5 % de las células; 7,7 ± 1,7 en promedio); tope de 10.
    **Ciclo de vida:** (1) *ataque*: nada, persigue (giro de 5 rad/s) a la presa de más peso a menos de 90 px (peso: B 1, A 0,35, neutros 0,2; adherida en colonia densa × (0,3 + 0,7·vecinas/6), nadando × 0,22) y, en contacto, ataca con tasa 1/s × peso;
    (2) *entra*: C desaparece dentro, la presa deja de crecer y de dividirse y se **redondea** (bdeloplasto: un círculo algo mayor con un punto adentro); (3) *crece dentro* ≈ 40 s (± 20 %); (4) *lisis*: la presa se rompe y libera 2 a 6 C (cada cría sobrevive con probabilidad
    1 − (C/10)², así que C no explota) y devuelve nutriente (0,35 por biomasa) y subproducto (0,25) a las grillas. C muere de hambre tras 150 s sin presa; **piso:** con menos de 2, entra una por un borde (0,05/s). Los choques y el texto (aguas tranquilas) valen igual para C.
  - **Efecto sobre la competencia de la 035:** C prefiere B, así que desplaza el equilibrio hacia A: a los 20 min, en las fuentes de fondo, A:B = 0,54 con C frente a 0,17 sin C (B adheridas 35 frente a 110); cerca de un montón a los 4 min, A:B = 2,4 con C frente a 0,9 sin C. Ciclos lentos: las colonias densas se vacían desde dentro y se recuperan (la autocorrelación de B adheridas baja a −0,27 hacia los 12 min; sin C no pasa de ≈ 0); el período es de ≈ 25 min y la amplitud, moderada.
  - **Quorum sensing:** una tercera grilla `q` (autoinductor; 64 × 40, sin dibujar). Las adheridas lo producen (0,09/s por célula), difunde como c y decae (0,08/s). Respuesta local ql = smoothstep((q − 0,3)/0,35): una colonia de ≈ 15 células o más la supera.
    (a) **más matriz:** frecuencia y fuerza de los rastros × (1 + 2,5·ql); (b) **protección:** el ataque de C se multiplica por (1 − 0,9·ql)²; (c) **dispersión:** con ql > 0,6 sostenido 30 s, las adheridas del borde de la colonia (≤ 6 vecinas) vuelven a nadar con tasa 0,05/s (20 s sin readherirse). No hay efecto gráfico propio: se ve como más matriz y como nadadoras que salen de la colonia.
  - **Controles y medición:** `Quimiotaxis.relaciones({depredador:false})` y `({quorum:false})` los apagan; `Quimiotaxis.medicion()` entrega ataques por nivel de quorum, lisis, crías y dispersiones por densidad. Preparado para la 037 (sin implementar): `EST` y `p`/`q` como punto de partida de la simbiosis.
- **Relaciones ecológicas, etapa 3: mutualismo espirilo–B, y ajustes de la 036** (037). Es la última etapa planificada; la cabecera de `quimiotaxis.js` resume todas las relaciones (035–037) y sus interruptores.
  - **Mutualismo:** el espirilo (que era neutro) intercambia con B por **dos grillas nuevas** de la misma resolución (64 × 40, sin dibujar). **m**, el carbono que B cede: lo exuda en proporción a su biomasa (0,2/s por unidad). **f**, el factor de crecimiento (tipo vitamina o sideróforo) que da el espirilo (0,5/s por célula adherida). Ambos difunden como c y decaen deprisa (0,25/s: alcance ≈ 40 px), así que el intercambio es local.
    El espirilo pasa a ser un **auxótrofo parcial:** con c solo crece a μmax = 0,4 (en la 036, 1,1) y m le suma μ = 0,5·m/(0,06 + m) (gasto 0,25). B multiplica su crecimiento por 1 + 1,5·f/(0,05 + f) (hasta ×2,5) y consume algo de f.
    **Asociación espacial:** el espirilo sigue m por quimiotaxis (señal 0,3·c + 2,5·m) y B suma f (+ 2,5·f); ambos cuentan el otro intercambio como alimento al adherirse (peso 1,2). Resultado sutil: espirilos y colonias B tienden a quedar juntos.
  - **Controles:** `relaciones({mutualismo:false})` (m = f = 0: cada uno queda como en la 036 salvo que el espirilo no recibe el carbono de B). `relaciones({excluir:[2]})` quita los espirilos y `({excluir:[1]})` quita B (monocultivos para medir). `medicion()` entrega el crecimiento por célula de B y del espirilo con la pareja a menos de 28 px (juntos) y sin ella (separados).
  - **Ajustes de la 036:** C nada a **35 px/s** (antes 48). Ciclo presa–depredador más corto, de ≈ 8 min entre máximos de la B adherida (media 7,7 min, mediana 6; con la 036 la media era de 10,6 min y se había leído como ≈ 25 min a partir de la autocorrelación): C vive 100 s sin presa y tiene una mortalidad basal de 0,01/s, el ataque es 0,65/s, la lisis llega a los 20 s, el tope es 8 y las crías se multiplican por el peso de la presa (B rinde más que A y que los neutros), con lo que C sigue a B. Con esto la B adherida queda en ≈ 75 (antes ≈ 48). La regulación dependiente de la densidad de las crías (≈ 1,1 C por lisis) queda como estaba.
- **Movimiento realista y ritmo de la visita** (038). Escala: 3 px/µm y un reloj 2,5 veces más lento que el del laboratorio (1 µm/s ≈ 1,2 px/s); la cabecera del archivo trae el respaldo bibliográfico (Berg y Brown 1972; Xie et al. 2011; Merz, So y Sheetz 2000; Mattick 2002).
  - **Nado con estados** (en vez de giro continuo): *run-and-tumble* en A y B (corridas rectas de ≈ 2 s —≈ 50 px— con ruido rotacional de 0,025 rad²/s; tumbo = pausa de ≈ 0,35 s con los flagelos abiertos y un giro gamma de media 68° y sd 36°); la señal quimiotáctica baja la tasa de tumbos y alarga las corridas que suben por el gradiente (hasta ×12). Espirilo, *run-reverse* (inversión de 155° ± 19° sin cambiar de eje). Vibrio C, *run-reverse-flick* (corre, nada hacia atrás con el flagelo por delante y da un flick de ≈ 90°); con una presa a la vista corre hacia ella. Velocidades en µm/s de laboratorio → px/s: A 21 → 25, B 17 → 20, espirilo 32 → 38, C 29 → 35 (el vibrio real nada a 50–100 µm/s; se dejó lento para la calma).
  - **Twitching:** al adherirse, bacilos y cocobacilos se tiran sobre la superficie 6–14 s con saltos espasmódicos de ≈ 2,2 px (pilo que se extiende antes de cada salto y se retrae al tirar; los cocobacilos saltan hacia la colonia vecina) y luego se fijan.
  - **Forma de las colonias por especie:** bacilos A, empalizada (filas paralelas; orden nemático 0,9–1,0 frente a 0,1–0,3 antes); cocobacilos B, compactas y redondas (aspecto 1,1–1,5 al partir, ≈ 2,0 a los 10 min frente a 2,1–2,6); cocos en cadena (estreptococos, división en el mismo eje), en racimo (estafilococos, divisiones en planos perpendiculares) o en pares.
  - **Ritmo:** la visita parte con cinco colonias ya formadas junto a las fuentes de fondo (menos texto encima), un par espirilo–B asociado, un depredador que ronda una colonia B y un bdeloplasto a punto de lisis; 116 células al partir (la 037 partía con 90) y ≈ 145 a los 60 s. En los primeros 60 s de pared (calma: reloj ×0,6) se ven ≈ 38 divisiones, 10 infecciones, 5,5 lisis y 7 espirilos junto a B (antes: 1, 3, 1 y 0); `Quimiotaxis.reiniciar({avanzado:false})` vuelve a la partida desde cero. Contraste: sobre fondo claro la opacidad sube un 12 % (la misma opacidad se lee menos que sobre oscuro: 1,8–2,8:1 frente a 2,1–3,8:1) y las adheridas se dibujan ×1,3 (antes ×1,18).
  - **Ecología de largo plazo sin cambios sustanciales** (medición entre 10 y 30 min): B adherida 73 (037: 77), C 4,5 (4,6), espirilos 26 (24), A 36 (29); para eso hubo que subir el ataque de C de 0,65 a 0,72/s y fijar la ganancia quimiotáctica por tipo (A 5, espirilo 3,2, B 5).
  - **Medición:** `Quimiotaxis.movimiento(reset)` entrega las corridas (duración y largo), los ángulos de tumbo, la velocidad propia media (deriva) y los saltos del twitching; `posiciones()` entrega también la forma de los cocos y el estado de nado de cada célula.
- **La luz del cursor** (039). El fondo sólo se ve alrededor del cursor, como el campo de un microscopio, y quien lee lo explora moviendo el mouse: afuera queda un rastro de ≈ 5 % (alfa 0,05) que deja intuir que hay vida. Diámetro = 10 % del ancho de la ventana (en la 041, 28 %; en la 042, 48 %), borde difuso (plena hasta el 35 % del radio y caída suave, sin anillo). Es una «tapa» del color de la página hecha de seis capas que sólo se mueven con `transform` y `opacity` (una máscara CSS sobre el canvas se re-rasteriza en cada cuadro y bajaba los fps), y `dibujar()` no pinta lo que cae fuera de la luz; la simulación sigue entera, así que las colonias evolucionan aunque no se las vea. La luz sigue al cursor a la tasa de la pantalla (suavizado de 45 ms). Sin cursor (al cargar) nace con un fundido de ≈ 1 s sobre la colonia con el depredador y, al primer movimiento, viaja hasta el cursor; si el cursor sale de la ventana (o la ventana pierde el foco) la luz queda donde estaba y se apaga en ≈ 3 s. `Quimiotaxis.luz({activa, r, x, y, fija})` la apaga, cambia su radio o la fija (pruebas y videos). El velo bajo el texto baja de 72 a 60 % (el texto secundario conserva ≥ 5:1).
- **La arena en los márgenes, el scroll y la raíz** (040). Tres cambios sobre la 039:
  - **La arena sólo nace en los márgenes.** Con el cursor quieto 1,5 s, la fuente de nutriente (la arena) sólo aparece si el cursor está en los márgenes laterales, fuera de la columna de texto (el contenido de `.pagina`: 184–1256 px a 1440), más un **sobrelapamiento de 28 px (≈ un renglón) hacia adentro**, para que se descubra al leer cerca del margen. Medido (fracción de los granos que cae bajo la máscara del texto): con el cursor a 40 px dentro del margen, 0 %; en el borde de la columna, 38 % (izquierda) y 28 % (derecha); a 10 px dentro, 53 % y 44 %; a 20–30 px dentro, 50–62 %, y de ahí en adelante ≈ 61 %. Sobre el texto la luz sigue igual: sólo deja de emanar nutriente. `Quimiotaxis.arena({sobrelapamiento})` cambia el valor (para medirlo).
  - **El scroll cuenta como movimiento.** Con el cursor quieto, desplazar la página más de 6 px lo deja sobre otro punto del documento: se rompe la quietud, la arena que crecía se suelta (decae) y, tras 1,5 s sin moverse ni desplazarse, nace otra en la posición nueva (si el cursor está en un margen); la luz se actualiza. Un scroll de 3 px no cuenta (tolerancia del temblor).
  - **Una raíz en el margen izquierdo** (ecología de la rizosfera). Fija a la pantalla, del alto de la ventana, con las zonas de la raíz primaria desde la punta (cofia, meristema, elongación, pelos radicales y maduración), cuatro raíces laterales que salen del periciclo en la zona madura y crecimiento muy lento (0,3 px/s ≈ 18 px/min). Monocromo con la tinta del sitio: la **silueta se ve siempre, tenue** (en la 041 ya no: toda la raíz se esconde fuera de la luz); el **detalle** (paredes de las células, cilindro vascular, pelos, mucílago, bacterias del rizoplano) sólo bajo la luz. No está a escala de las bacterias (una raíz real mide cientos de µm): es un corte esquemático de ≈ 32 px de ancho.
    **Interacciones:** la raíz exuda (más en la cofia, la elongación y la salida de las laterales) azúcares a la grilla de nutriente y ácidos orgánicos a una grilla propia r; las nadadoras que tocan la raíz o un pelo se adhieren (microcolonias en fila sobre la superficie, más en las uniones de las laterales: ≈ 3× más por unidad de superficie que en la zona madura); y un **especialista tipo PGPR (P, bastón curvo; Azospirillum)** sigue y come el exudado r (su carbono) y a cambio la punta avanza más (+49 % en 6 min: 165 px frente a 110 px; hasta 0,5 px/s con ≥ 8 P cerca de la punta) y los pelos y las laterales crecen algo más donde está colonizada. Los hongos (041) quedarán limitados a la rizosfera: la franja de ≈ 62 px alrededor de la raíz está definida (`rizosfera(x, y)`, `grilla().rizosfera`) con los ganchos que necesitan. Interruptores para medir: `raiz({activa:false})` (sin raíz, exudados ni P) y `raiz({especialista:false})`.
    **Población:** las células de la superficie de la raíz no cuentan para el tope del nivel (60 / 120 / 140 / 160) y tienen el suyo (12 / 30 / 45 / 55): sin eso la raíz le quitaba plazas al resto y las divisiones de la visita caían de 150 a 40 en 5 min; así el resto de la ecología queda como en la 039 (infecciones y lisis iguales, C ≈ 5) y con la raíz la visita parte con ≈ 125 células y en el primer minuto llega a ≈ 190. Costo medido (nivel 3, 60 fps): 1,5–1,7 ms por cuadro frente a 1,0–1,3 en la 039; el nivel adaptativo no baja.
- **Luz más amplia, márgenes que dejan ver el fondo y una raíz que se genera** (041). Cuatro cambios sobre la 039 y la 040:
  - **La luz mide 28 % del ancho** (`LUZ_FRAC = 0,14`: diámetro de 403 px a 1440; la 042 la llevó a 48 %), con el mismo borde difuso y la misma técnica de capas. Bajo ella se ve todo: bacterias con flagelo, colonias, matriz, arena, raíz y rizoplano.
  - **Los márgenes dejan ver el fondo al 20 %** (`LUZ_PISO = 0,2`; la 042 los subió a 40 % y la columna a 15 %): a los lados de la columna de texto las bacterias se ven ligeramente interactuando. **Sobre la columna** el fondo sigue casi oculto (5 %, `LUZ_COL = 0,25`: los cuerpos se pintan con un cuarto de su alfa y la luz los revela). Medido en cuadro congelado (tinta con luz / sin luz): margen 0,19–0,20, columna 0,04–0,05, centro de la luz 1,00.
  - **La raíz entera se esconde** (primaria, laterales, cofias, pelos): ya no hay silueta. Va en un canvas propio **bajo** el de las bacterias y bajo una segunda tapa casi opaca que se mueve con la luz, así que sólo aparece bajo ella y no cuesta nada por cuadro (se redibuja sólo al crecer). Las células de su superficie tampoco se dibujan fuera de la luz. Queda **centrada en el margen izquierdo** (eje a la mitad del margen: 20 px a 1024, 92 a 1440, 212 a 1920) y se reacomoda al cambiar el tamaño de la ventana.
  - **La raíz se genera con un algoritmo de puntas activas con tropismos**, distinta en cada carga (semilla al azar; `?semilla=N` en la URL la reproduce y `Quimiotaxis.raiz({semilla})` la cambia). La primaria tiene gravitropismo, serpenteo, quimiotropismo hacia el nutriente c y un resorte hacia el centro del margen. Las laterales **no** salen de bifurcaciones de la punta: nacen del periciclo, detrás de ella, en orden acrópeto (las más viejas, arriba, son las más largas), del lado más rico en c; cada una es una punta activa con ángulo plagiotrópico, su cofia y su propio quimiotropismo. La raíz **no come bacterias**: son ellas las que se acercan a los exudados y colonizan el rizoplano. Al cargar se pre-simula fuera de pantalla hasta un estado maduro y luego crece muy despacio. Las interacciones de la 040 (exudados, rizoplano, especialista, franja de la rizosfera) salen de la geometría generada.
  - **Medido:** 5 semillas dan 5 raíces distintas, la misma semilla la reproduce igual; ≈ 5 laterales por raíz; con un parche de nutriente a un lado hay 75 laterales de ese lado frente a 33 con el parche al otro (24 semillas). El especialista sigue funcionando (+ 50 % de avance de la punta en 6 min). Costo igual a la 040 (nivel 3, 60 fps, ≈ 1,2–1,6 ms por cuadro, el nivel adaptativo no baja). `quimiotaxis.js` pasa a ≈ 157 KB (60 KB gzip).
- **La luz más grande, perfectamente circular, con estela; el gráfico sin panel y la raíz centrada** (042, en tres partes). Cambios sobre la 041:
  - **Luz de 65 % del ancho** (`LUZ_FRAC = 0,325`; la parte 1 de la 042 la dejó en 48 %): diámetro exterior de 666 px a 1024, 936 px a 1440 y 1248 px a 1920 (área ×5,4 sobre la 041). El borde difuso escala con el radio (plena hasta el 35 %, smoothstep hasta el borde).
  - **Perfectamente circular, medido** (`circ42.js`: fondo negro y contenido oculto, de modo que el color de cada píxel es el alfa de la tapa; perfil radial en las 8 direcciones de 45°): a 5 tamaños de ventana (1024×700, 1025×701, 1440×900, 1920×1080 y 1337×811 a dpr 2), con la luz al centro, pegada a cada borde y a dos esquinas y en una posición fraccionaria, el alfa de la tapa del fondo difiere entre direcciones en ≤ 0,008 (2 niveles de 8 bits, ≈ 2,7 px sobre un radio de 468 px) y fuera del círculo vale 0,600 en todos los píxeles: no hay esquinas, bordes rectos ni costuras.
  - **Más fondo visible fuera de la luz:** márgenes al **40 %** (`LUZ_PISO = 0,4`) y columna de texto al **15 %** (`LUZ_COL = 0,375`). La raíz sigue oculta fuera de la luz (su tapa sube de 0,985 a 0,995 de alfa porque el fondo ya no la cubre casi).
  - **La estela:** el campo de visión sigue activo después de que pasa el cursor. Si el cursor recorre el costado derecho, ese costado queda iluminado 2,0 s (`LUZ_RET`) y se apaga de forma continua en 1,5 s más (`LUZ_CAE`; 3,5 s en total), en el orden en que pasó el cursor, y mientras dura se ve con todo el detalle (flagelos, matriz, arena). Para unir los huecos hubo que cambiar la técnica: dos tapas apiladas multiplican su opacidad en vez de unir sus huecos, así que la tapa pasó de capas con `transform` a dos canvas de baja resolución (1 píxel por 12 px, escalados con suavizado) cuyo alfa se calcula cada cuadro como `A·(1 − I)`, con `I` el máximo de «sellos» circulares (la cabeza y un punto del recorrido cada 0,22·r px, con tabla analítica del perfil). `Quimiotaxis.luz({estela:false})` la quita.
  - **El gráfico sin panel opaco:** la figura fija ya no tiene fondo (antes una franja de 100 vw a la izquierda y el hueco entre columnas lo escondían; en la parte 3 también se quitó el de la columna de la figura). La legibilidad la da el velo del texto (60 %): contraste medido otra vez con el fondo al 15 % debajo y el texto de los gráficos incluido (`contraste42.js`, claro y oscuro, 1440 y 1920, 12 posiciones del scroll × 2 tiempos): cuerpo ≥ 13,3:1 en claro y ≥ 8,4:1 en oscuro, texto secundario ≥ 5,8:1 (claro) y ≥ 6,5:1 (oscuro), vínculos ≥ 9,3:1; mínimo exigido 4,5:1. Otros fondos opacos que quedan sobre la simulación (`opacos42.js`): la barra de navegación, la sección oscura «Agentes de IA», y las cajas del diagrama y de las ilustraciones (contenido).
  - **La raíz centrada en su espacio:** el eje va en el punto medio entre el borde de la ventana y el de la columna de texto (`colIzq/2`, calculado con el ancho de la ventana y recalculado en cada resize) y la media del eje se corrige para que quede exactamente ahí. Medido (`centro42.js`): 52, 92 y 212 px a 1280, 1440 y 1920 (la mitad del margen: 52, 92 y 212).
  - **Costo:** ≈ 1,1–1,2 ms de JS por cuadro de la luz con 23 sellos vivos (0,2 ms sin estela); la simulación sigue en nivel 3 y 59,5–60 fps (4 corridas alternadas 041/042 con la máquina tranquila: nivel 3 en 4 de 4, 1,55 ms por cuadro frente a 1,44 ms). La tapa de la raíz sólo cubre la franja del margen izquierdo: a ventana completa los fps bajaban a 47–57 en el compositor por software. `quimiotaxis.js` pasa a ≈ 168 KB (65 KB gzip; la 041 era 157/60).
- **La raíz por colonización del espacio, más chica y corta, y los márgenes libres** (043). Cambios sobre la 042:
  - **El algoritmo:** la raíz se genera con *space colonization* (Runions, Lane y Prusinkiewicz 2007) en vez de la punta con tropismos de la 041. Hay atractores de nutriente en el margen (más donde hay más `c`), y la punta primaria y la de cada lateral se orientan hacia el promedio de los que perciben delante de ellas (compiten entre puntas) y los consumen al alcanzarlos. Las laterales siguen naciendo sólo del periciclo, en la zona de maduración y en orden acrópeto, y la raíz no come bacterias. Se generó con recorrido directo y no con un quadtree: con ≈ 65 atractores y ≈ 10 puntas cuesta menos (la pre-simulación entera tarda ≈ 12 ms). La estructura de datos es la de la 041, así que el cuerpo, los pelos, la colonización, el especialista y la rizosfera no cambian.
  - **La fuente de nutriente:** un racimo de atractores y un punto de exudación a la misma altura (27 % del alto) y a un ancho distinto en cada carga. `raiz({fuente: 0–1})` la fija. Medido (`fuente43.js`): con la fuente forzada, el eje a esa altura queda a +16, +6, −2, −10 y −21 px de ella (fuente a 0, .25, .5, .75 y 1 del ancho útil): se curva ≈ la mitad del camino; con 12 semillas libres la correlación entre la posición de la fuente y la del eje es 0,99. El eje queda entre −23 y +17 px del centro del margen.
  - **Más chica y corta** (`RZ_ESC = 0,7`, `RZ_TIP0 = 0,42`, `RZ_TIPMAX = 0,62`): radio ≈ 11 px a 1440 (era 16), la punta parte en 42 % del alto (era 64 %) y crece hasta 62 % (era 93 %); las laterales son más cortas y hay 4–5 al cargar.
  - **El margen izquierdo libre de fondos:** la barra de navegación y la franja oscura «Agentes de IA» pintan su fondo sólo sobre la columna (`background-clip: content-box`). Medido (`margen43.js`, 1280/1440/1920, claro y oscuro, varios scrolls): 0 de 38 400 puntos del margen con un fondo opaco. Quedan fondos opacos dentro de la columna (cajas de diagramas y tarjetas de ilustración).
  - **Medido:** pruebas de la 041/042 sobre la nueva raíz: 16/16, 26/26, 32/32 y las de la 038 (17, 14, 7, 8 y 12); matriz Playwright sin fallas; forrajeo con un parche de `c`: 63 laterales a la derecha frente a 29 con el parche a la izquierda (×2,2); células a ≥ 2,6 px del cuerpo (la colisión se revisa dos veces en el rincón entre una lateral y el eje); densidad de células ×12,5, ×7,9 y ×3,2 a 0–8, 8–16 y 16–32 px de la raíz; el especialista adelanta la punta +43 % (154 frente a 108 px en 150 s, t de Welch 10,4). Costo: nivel 3 y 60 fps en 4 de 4 corridas, 1,46 ms por cuadro frente a 1,51 ms de la 042 (máquina tranquila).
- **Estela más corta y raíz sólo si hay lugar** (044). Dos cambios sobre la 043:
  - **La estela dura 1,5 s** (`LUZ_RET` 2,0 → 0,7 s de luz plena y `LUZ_CAE` 1,5 → 0,8 s de apagado; antes 3,5 s en total; Benjamin pidió 1,5 s): el rastro desaparece antes, para que el usuario siga moviendo el cursor.
  - **La raíz sólo aparece si cabe:** necesita un margen izquierdo de al menos `RZ_COLMIN` = 140 px (desde ≈ 1366 px de ancho de ventana; a 1280 el margen mide 104 px y a 1024, 40 px, donde la raíz quedaba reducida a una raya de 4 px de radio) y una ventana de al menos `RZ_ALTOMIN` = 480 px de alto. Si no cabe no se genera ni exuda ni trae especialista ni colonistas (como `raiz({activa:false})`); al cambiar el tamaño de la ventana se quita o se vuelve a generar con la misma semilla. `Quimiotaxis.raiz({activa:true})` sólo la pide, y `raiz()` informa `pedida`, `cabe` y `espacio` (margen, mínimo, alto).
- **Eucariotas en la mezcla** (045). No reemplazan a las bacterias: se suman, arriba de la cadena alimenticia, con interacciones entre ellos y, muy de vez en cuando, un nematodo cerca de la raíz. Viven en un módulo propio de `quimiotaxis.js` (arreglos aparte, ≤ 9 protistas + el nematodo), se mueven por su cuenta, depredan sobre las bacterias (las sacan de la simulación) y se dibujan en el mismo canvas, así que quedan bajo la luz igual que ellas: el cuerpo se ve en los márgenes y los cilios y flagelos sólo bajo la luz. No están a escala real (un ciliado mide ≈ 50 veces una bacteria; aquí, 3–4).
  - **Quiénes:** flagelado heterótrofo (tipo *Bodo*, 7 px, dos flagelos, avanza a tirones), dinoflagelado heterótrofo (tipo *Oxyrrhis*, 15 px, cíngulo, sulco, núcleo grande con cromosomas en bandas, flagelo transversal y longitudinal, nada en espiral), ameba (24 px, contorno irregular con seudópodo, núcleo, vacuola contráctil, gránulos) y ciliado (tipo *Colpoda*, 26 px, surco oral, macronúcleo, corona de cilios con onda metacrónica). Nivel 0: ninguno; nivel 1: hasta 4; nivel 2: 6; nivel 3: 9. Arrancan 5 (2 flagelados, 1 dinoflagelado, 1 ameba, 1 ciliado) y si un tipo baja de su piso entra uno por un borde.
  - **Cadena alimenticia** (probabilidad de captura por segundo de contacto): flagelado → bacterias nadadoras; dinoflagelado → flagelados (0,9) y bacterias; ameba → bacterias adheridas (0,9; las colonias) y nadadoras, y flagelados; ciliado → bacterias (0,9 nadadoras) y flagelados (0,7); nematodo → todos. Las bacterias del rizoplano quedan protegidas de los protistas (biopelícula); el nematodo sí las ramonea (0,25/s).
  - **Interacciones entre ellos:** depredación (arriba), huida (los flagelados escapan a ráfagas de ×2,6 de los protistas que se los comen; todos, del nematodo), energía (cada presa da energía; se dividen al llegar al umbral si hay lugar, y sin presas se mueren de hambre en 1–2 min) y el **lazo microbiano**: cada presa digerida (≈ 7 s después de comerla, una vacuola visible que se achica) devuelve nutriente a la grilla, que atrae de nuevo a las bacterias.
  - **El nematodo** (96 px de largo, cuerpo que ondula, cutícula, intestino, bulbo faríngeo): entra por el borde izquierdo hacia la punta de la raíz (quimiotaxis a los exudados), la rodea 28–45 s comiendo bacterias y protistas, y se va por el mismo borde (≈ 50 s en total). Aparece en promedio cada ≈ 135 s (espera mínima de 25 s, contada desde que se fue el anterior). Sin raíz (ventana angosta) va al margen izquierdo.
  - **Control:** `Quimiotaxis.euca()` informa población, eventos (comidas, divisiones, huidas, excreción) y el nematodo; `euca({activa:false})` los quita, `euca({nematodo:true})` lo hace entrar ya, `euca({agregar:[tipos]})` suma individuos y `euca({reiniciar:true})` vuelve a la población de partida.
  - **Medido** (`t45.js`, 23/23): a 300 s las bacterias se mantienen (×0,99 de células frente a sin eucariotas) y el rizoplano también (×0,98); 489 bacterias comidas en 3 corridas de 300 s, 14 divisiones, 487 vacuolas digeridas, población entre 4 y 9 sin extinguirse; el nematodo llega a la punta en ≈ 4 s, come ≈ 40 s y se va.
- **Eucariotas visibles, columna sin centrar y repulsión del cursor** (046). Cambios sobre la 045 (publicada), tras ver que Benjamin no los veía: con la 045, a los 20 s había en promedio 0,5 protistas en los márgenes (la mayoría nacía bajo la columna de texto) y el primer nematodo tardaba entre 30 y 230 s.
  - **Se ven:** nacen y viven en los márgenes (entran por los bordes laterales y, si no cazan, se desvían hacia el margen más cercano): a los 10 y 20 s hay ≈ 5 en los márgenes. Se dibujan ≈ 1,55 veces más oscuros (borde contra fondo ≈ 80/255 frente a 50/255), con el núcleo relleno, los flagelos y los cilios siempre visibles (el detalle fino, bajo la luz). El primer nematodo llega 12–22 s después de cargar; los siguientes, cada ≈ 185 s en promedio (mínimo 25 s).
  - **Más diversos:** el ciliado pasa a ser un *Paramecium* (en zapatilla, surco oral con citostoma, dos vacuolas contráctiles estrelladas, macronúcleo y micronúcleo, cilios con onda metacrónica) y se suma la *Euglena* (flagelado fusiforme con flagelo largo, mancha ocular, núcleo y cloroplastos; hace fotosíntesis, no come; presa de dinoflagelados, amebas, paramecios y del nematodo). Arrancan 5 (1 de cada tipo) y el tope sube con el nivel de calidad: 0 / 2 / 4 / 8 (más diferencia entre un nivel y otro; antes 0 / 4 / 6 / 9).
  - **La columna de texto ya no está centrada** (`--sesgo: .75` en `index.html`): del espacio que sobra a los lados, el 75 % va a la izquierda; el ancho del texto no cambia. A 1440 px el margen izquierdo mide 256 px y el derecho 112 (antes 184 y 184); a 1280 el izquierdo pasa de 104 a 136 px, así que la raíz (`RZ_COLMIN` baja de 140 a 130 px) aparece desde 1280 px de ancho.
  - **El cursor repele levemente a las bacterias nadadoras** (`Quimiotaxis.repulsion({radio, fuerza})`; 75 px y 40 px/s en el centro, que cae con el cuadrado de la distancia; no afecta a las adheridas, a las del rizoplano ni a los eucariotas): con el cursor quieto, la densidad de nadadoras a menos de 60 px baja ≈ 40 %.
- **Sin solape título–gráfico, movimiento más lento y raíz más realista** (047). (1) En escritorio (≥ 960 px) el título de la sección que se iba hacia arriba pasaba por detrás del gráfico fijo (que no tiene fondo) y se montaba sobre él; ahora `cortar()` mide cuánto queda sobre el borde inferior de la figura (`--corte`) y el título se desvanece con una máscara de 30 px, así que nunca cruza el gráfico (los títulos pegados quedan a 2 rem de la figura, antes 1,5). Medido: 0 cuadros con solape en 641 posiciones de scroll a 6 anchos; la 046 tenía 153. (2) Todos los movimientos ligados al texto van ×1,8 más lentos con una sola variable (`--lento`, en `:root`): el trazado y la aparición de los gráficos, el ascenso de los bloques al entrar (el rango de scroll ×1,8), la compactación del título de la portada (160 → 288 px de scroll) y el salto con ancla (×1,5). (3) Raíz: cofia en domo y diámetro casi constante, pelos radicales irregulares (cada uno nace a su distancia, con su curvatura y su largo) y también en las laterales, más densos que en la primaria; paredes celulares fijas al tejido. (4) El nematodo se dibuja más ancho y oscuro, y el nivel 0 también tiene un eucariota. Ver `quimiotaxis.js` (cabecera) y el handoff 047.
- **Eucariotas más lentos, nematodo grande en los márgenes y opacidad compartida** (048). (1) Los protistas se mueven 30 % más lento (`EU_VEL = 0,7`; medido −31 %). (2) El nematodo se pide ×10 (`EU_NESC`) pero se limita a lo que cabe: ≤ 55 % del alto y dentro del margen lateral y entre el borde y la raíz, así que a 1440×900 mide 495 × 28 px (×5,2; ×10 serían 960 px, más que el alto de la ventana). Entra por arriba o por abajo, nunca entra a la columna de texto (0 puntos del cuerpo en 12 visitas a 3 tamaños). `Quimiotaxis.euca({escalaNematodo, velocidad, opacidad})` para probar otros valores. (3) Bacterias, protistas y nematodo usan la misma función de opacidad (`luzMod`) y la misma ganancia del tema; la opacidad base de los eucariotas ya no se satura en 1.
- **Franja de agentes integrada al fondo y caja de pruebas** (049). (1) La franja de «Agentes de IA, en entornos controlados» ya no es un panel marrón opaco: es un tinte translúcido con borde suave (`--panel-suave`, sombra del mismo color como el velo del texto) que sigue el tema (arena con tinta oscura en claro, marrón cálido con tinta clara en oscuro); las células pasan por detrás, la luz del cursor las revela, y cada bloque de texto (título, entradilla, prácticas) lleva su velo (`--panel`, 80 %) como en el resto del sitio. Contraste medido con el peor caso (una célula de tinta plena bajo el texto): texto 9,2 (claro) y 8,1 (oscuro), kicker 6,7 y 6,8, enlaces 7,1 y 5,6, etiquetas 7,1 y 5,6 (mín. 4,5). (2) Bajo el título, un recuadro «entorno aislado»: borde punteado con marcas de esquina y una célula grande que el cursor atrae pero no puede sacar (el objetivo se recorta a la caja; se frena y se desvía en el borde y el borde pulsa donde la toca); línea de copy «autonomía dentro de límites explícitos». Es decorativa (`role="img"` con una descripción corta, contenido `aria-hidden`, nada enfocable); su propio canvas chico (≈ 0,1 ms por cuadro), que sólo corre mientras se ve; con movimiento reducido o ahorro de datos queda quieta al centro; sin puntero fino (celular) deambula sola a 30 cuadros por segundo.
- **Ciclo plancton ↔ biopelícula** (027; desde la 035 el umbral de c, la tasa, el crecimiento y el hambre son de cada morfotipo, con los valores de A de abajo como referencia de la 034): una nadadora se adhiere (queda sésil, quieta y con el flagelo detenido) con tasa
  0,25·(c − 0,5)/0,5·(0,06 + 1,6·vecinas adheridas)/s si c > 0,5; la adherida crece (biomasa ×2 en ≈ 15 s a c saturante, Monod) y
  se divide con la hija al lado, sin superponerse (a lo largo del eje en bacilos y espirilos); deposita una matriz (EPS) tenue que
  se desvanece (≈ 45 s; 034: rastros, no discos). Si c < 0,17 durante 6 s, las del borde de la colonia (< 4 vecinas) se dispersan (1,2/s) y vuelven a nadar hacia
  afuera, con 20 s sin readherirse; la dispersión se contagia a las vecinas (señal de colonia); el hambre prolongada mata. Tope de
  población de 60 a 160 según el nivel; entran nadadoras por los bordes cuando hay menos de 40 (0,7/s) y salen o mueren algunas,
  así que el costo no crece sin límite. Ciclos de uno a dos minutos por fuente.

- **Rendimiento adaptativo por calidad** (con ~100 células la cantidad ya no es lo que pesa): cuatro niveles: 20 fps, tope de 60 células, sin choques, trazadores, Jeffery ni matriz, con la grilla actualizada cada 3 cuadros;
  30 fps, tope de 120, sin choques (24 trazadores); 30 fps, tope de 140, con choques (40 trazadores); 60 fps, tope de 160. Nivel de partida por `hardwareConcurrency` y
  `deviceMemory`; cada 2 s se mide el trabajo por cuadro y los cuadros por segundo y se sube o baja (al bajar, ese nivel es el techo,
  para evitar el vaivén); si ni el nivel 0 alcanza, se esconde el fondo y se reintenta al minuto, a los 2 y a los 3 minutos (una sobrecarga pasajera no lo apaga para siempre); a la tercera falla se detiene y quita el canvas. Pausa con la pestaña oculta; sin leer la GPU.

### Celular: el gráfico de la franja se encoge al bajar (iteración 023)

Bajo 640 px, con JS, la franja fija arranca con el gráfico más chico (76 % de su ancho, `.serie.enc .plot`) y, ligado a
la posición del scroll (no a la sección), se encoge hasta el 56 % y se aclara hasta el 45 % de opacidad entre los 260 y los
1460 px de scroll, con la curva común `suave()`; el alto que deja libre lo gana el texto. `--enc` (0 a 1) lo pone el JS en
`#serie`; al subir se recupera. Con movimiento reducido queda en el tamaño chico, fijo; sin JS, como en la 022 (a todo el ancho).

## Movimiento de las secciones (iteración 019; curva final y escalonado en la 020)

Todos los movimientos propios del sitio (trazo y fundidos de los gráficos, compactación del título de la portada, salto con
ancla y contenido ligado al scroll) comparten una curva de tres tramos: **lento y visible al partir** (35 % del tiempo a
pendiente 0,35, el 12 % del recorrido), **un tramo rápido** (otro 35 % a pendiente 1,75, cinco veces más rápido: el 61 %) y
**una llegada suave** (30 % de frenada cuadrática hasta cero: el 26 % restante). En CSS es
`linear(0,.123 35%,.737 70%,.832 76%,.905 82%,.958 88%,.989 94%,1)` con `cubic-bezier(.6,0,.4,1)` de respaldo; en JS, la función
`suave(p)`, que da lo mismo. (La 018 y la 019 tenían dos pendientes con contraste ≈ 10× y frenaban en seco.)

- **Escalonado de los gráficos** (más corto desde la 021, secuencia completa ≈ 1,4 s): banda, referencia y nota 0,4 s; las
  dos líneas 1 s, con retardos .05 s (b) y .15 s (a); leyenda 0,5 s (retardo .35 s); alerta y acento 0,5 s (.9 s); puntos
  con barras 0,4 s + 0,02 s por punto, con retardo .05 s + 0,05 s por punto.
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
