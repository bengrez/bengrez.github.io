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

`quimiotaxis.js` (≈ 43 KB, sin dependencias, aparte de `index.html`: la única excepción a «JS en línea») dibuja detrás del
contenido un canvas 2D con unas 100 células de 5 a 8 px que se mueven por quimiotaxis bacteriana en una corriente suave. Un
cargador mínimo en `index.html` lo pide al terminar la página sólo si hay puntero fino (`(pointer: fine)`), el ancho es de
1024 px o más y no hay `prefers-reduced-motion` ni `saveData`: en celular y tabletas no se descarga ni el script ni el canvas.

- **Muestra ambiental** (monocromo con la tinta del sitio, cada forma con su opacidad): 30 % **cocos** (círculos de 5,6 px,
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
  se alinean con el radio), borde irregular (la hija sale con el eje desviado ±0,3 rad), matriz más densa en el centro (acumulación proporcional a las
  vecinas más un halo por célula, que se superponen) y variación individual de tamaño (×0,88–1,18) y de ritmo de crecimiento (×0,75–1,25).
- **Choques suaves**: las células no se superponen; cada una cede la mitad del solape (rigidez .45, hueco de .6 px).
- **Nutriente que difunde y se consume** (027): un campo `c` en [0, 1] sobre una grilla gruesa de 64 × 40 celdas (≈ 22 px) con
  difusión explícita (D = 380 px²/s; subpasos para ser estable; sin flujo por los bordes), reposición de las fuentes
  (c' = 0,2·a·g·(1 − c), con `g` el perfil gaussiano de cada fuente), un decaimiento uniforme (0,05/s) y consumo de Monod por las
  células de su celda (q·c/(K + c), K = 0,2; q = 0,28/s por unidad de biomasa adherida y 0,004/s por nadadora). La quimiotaxis
  lee `campo(x, y)` (interpolación bilineal de la grilla); `usarCampo(fn)` reemplaza lo que lee la quimiotaxis, pero la grilla
  sigue siendo lo que se consume y donde se adhieren y crecen las células. Las fuentes de la API reponen nutriente en la grilla.
- **El cursor como fuente de nutriente** (028): si el cursor se queda quieto 1,5 s (tolerancia de 6 px para el temblor de la mano; se
  escucha `pointermove` en `window`, el canvas sigue sin capturar eventos), nace una fuente en ese punto (σ = 1,3 veces la de fondo) que
  crece con la permanencia: a(t) = 1,8·(1 − e^(−t/6 s)), o sea ≈ 90 % a los 15 s (032; en la 031 eran 0,5 s y 2 s). Al irse el cursor la fuente deja de crecer, se ensancha (hasta ×1,7 en ≈ 1 min) y
  decae (τ = 40 s) hasta desaparecer. **Nutriente finito**: hay un presupuesto constante de caudal (Σ amplitud·(σ/σref)² de las cinco fuentes
  de fondo = 4,47) y lo que gana la del cursor se le quita a las de fondo, en proporción a lo que tienen sobre su piso (15 % de la suya);
  las de fondo bajan de inmediato y recuperan con τ = 20 s, así que **siempre hay 5 fuentes de fondo (nunca menos de 3)**. Hasta 3 fuentes del
  cursor vivas: al crear otra, la más vieja se apaga con τ = 4 s. Señal visual (031): **arena**, un montón visto desde arriba, sin círculos. Cada fuente del cursor lleva un conjunto fijo de granos con semilla (posiciones con distribución radial gaussiana, σ = 0,25 del de la fuente: centro denso, borde con granos sueltos; 1–1,6 px, en tinta del sitio). Cada grano nace en el cursor y viaja a su sitio con *ease-out* (cuadrático) en 2,5–5 s, del centro hacia afuera, repartido a lo largo de los ~15 s de crecimiento. Un grano se ve mientras la concentración de la grilla en su celda, por encima de la que había al nacer la fuente, supera su umbral propio (umbrales de 0,002 a 0,75, más bajos hacia el centro); mientras el cursor sigue ahí, 0,3·a/AMAX también cuenta, porque la grilla tarda en subir. Al irse, el montón queda y el consumo de Monod, el decaimiento y la difusión lo adelgazan grano a grano; la fuente decae con τ = 40 s (la vía rápida, τ = 4 s, es sólo para la que sobra del tope). Opacidad por tramo de concentración, con tope de 0,45 en el centro, y ×0,55 bajo el texto (misma máscara que las células). Tope de granos por nivel: 100 / 260 / 340 / 420; un `path` por tramo de alfa y por zona (libre o bajo texto). El tiempo de quietud y de crecimiento se mide con el reloj real (no con el de la simulación), así que no cambia si el equipo va corto de cuadros. Sin cursor (celular, tabletas, movimiento reducido) no existe.
- **Ciclo plancton ↔ biopelícula** (027): una nadadora se adhiere (queda sésil, quieta y con el flagelo detenido) con tasa
  0,25·(c − 0,5)/0,5·(0,06 + 1,6·vecinas adheridas)/s si c > 0,5; la adherida crece (biomasa ×2 en ≈ 15 s a c saturante, Monod) y
  se divide con la hija al lado, sin superponerse (a lo largo del eje en bacilos y espirilos); deposita una matriz (EPS) tenue que
  se desvanece (≈ 50 s). Si c < 0,17 durante 6 s, las del borde de la colonia (< 4 vecinas) se dispersan (1,2/s) y vuelven a nadar hacia
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
