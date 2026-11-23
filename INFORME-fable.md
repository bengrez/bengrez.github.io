# Informe: versión realista del sitio personal (Fable)

Agente A20-sitio-teal-falcon, 2026-11-21. Rama `feat/realista-fable`, desde `origin/main` `b61e387` (iteración 056). Sin push ni
publicación. Contraste con la versión de Codex: mismas seis respuestas de diseño; aquí, además, visualizaciones realistas en las
tres formas pedidas (A datos públicos, B simulación creíble, C realismo visual).

## Cómo verla

**ThinkPad:**

```bash
cd ~/LLM-devs/Personal/sitio-personal-fable && python3 -m http.server 8042 --bind 127.0.0.1
```

Queda en `http://127.0.0.1:8042/` (sólo este equipo; el puerto 8042 estaba libre). El fondo vivo sólo carga con mouse y 1024 px o
más de ancho. Para comparar el fondo nuevo con el dibujo plano de la 056, en la consola del navegador:
`Quimiotaxis.microscopia({activa:false})` y `Quimiotaxis.microscopia({activa:true})`.

## Qué cambió y por qué

| Respuesta de Benjamin | Qué hice |
|---|---|
| 1. En 10 segundos: ecólogo microbiano que hoy aplica esa formación en otros ámbitos | Titular «Ecólogo microbiano. Hoy trabajo con datos.» El párrafo parte del doctorado (suelos mineros de Western Australia, pocas muestras y mucho ruido) y llega a los buses, el colegio y los agentes. La descripción para buscadores y redes dice lo mismo. |
| 2. Público: quien podría contratarlo o colaborar en datos y tecnología | Data science sigue primero y ahora tiene la única pieza interactiva. El orden de las secciones no cambió. |
| 3. Voz más suya, más detalle concreto; simulaciones más realistas | Menos frases de presentación («Aplicaciones en transporte, investigación doctoral y educación escolar» pasó a «Lo aprendí con suelos y hoy lo uso con buses y en un colegio»). Los detalles nuevos salen de sus artículos: 12 semanas, n = 3, la especie, la emergencia de plántulas. El fondo y los gráficos, abajo. |
| 4. Un solo gráfico simulado, interactivo; el resto, evidencia pública | Queda simulado el de Data science, con un control. Ecología usa datos publicados. Docencia muestra una captura de una herramienta que se puede abrir. |
| 5. Agentes de IA dentro de los proyectos, sin sección propia | Se quitó la sección, su enlace en la barra y su caja de pruebas. Los agentes están en Data science (párrafo «Con agentes de IA» y una fila de la ficha) y en Docencia (el asistente de gestión escolar, con embeddings y búsqueda vectorial). La portada conserva «Trabajo con agentes de IA, en entornos controlados». |
| 6. Misma estética; contenido editado a fondo | Paleta, tipografías, dos columnas, figura fija, estados y Recorrido quedan igual. No se agregó ningún color. |

Pedido de Benjamin durante la sesión («sembrar la raíz y todo lo que teníamos como background»): la simulación del fondo es la
misma, con su raíz, sus colonias, la matriz, la arena, los protistas y el *C. elegans* que empuja el párrafo. Sólo cambió cómo se
termina de dibujar cada cuadro.

Texto visible: 1736 → 2079 palabras. El aumento son los pies con fuente de cada visualización y el control de la demostración. En la segunda ronda el texto se acortó (ver «Segunda ronda»).

## Las visualizaciones

| # | Dónde | Qué muestra | Tipo | Fuente declarada en la página |
|---|---|---|---|---|
| 1 | Figura fija, Data science | Refrigerante de dos buses en 30 días: tres recorridos por día (puntos), media diaria (líneas), banda de referencia ± kσ, alerta, revisión y falsas alarmas (cruces). El control «Umbral de alerta» (1σ a 4σ) recalcula todo. | B, interactiva | Sello «Datos simulados, n = 3 recorridos por día» en el gráfico; el párrafo dice que es una simulación y por qué (los datos de la flota son del cliente). |
| 2 | Figura fija, Ecología | Amonio y nitrato más nitrito del suelo (mg/kg), media ± DE, n = 3: el suelo antes de incubar (Basal) y los cuatro tratamientos a las 12 semanas. | A | Sello «Datos publicados: media ± DE, n = 3»; el párrafo enlaza la tabla suplementaria 1 de Moreira-Grez et al. 2019, *Front. Microbiol.* 10:1617, doi:10.3389/fmicb.2019.01617 (CC BY 4.0). |
| 3 | Figura fija, Docencia | Captura de la Tabla periódica reactiva (vista «Radio atómico», sodio seleccionado), tomada del sitio publicado el 2026-11-21. | A (evidencia pública) | Rótulo «captura de la herramienta» sobre la imagen; el párrafo enlaza la herramienta. |
| 4 | Ecología | Citas por año, 2017 a 2026, de 15 publicaciones; el artículo de consorcio va en gris. | A | Pie: OpenAlex, consulta por DOI del 21 de noviembre de 2026, 2026 incompleto. |
| 5 | Ecología | Cuatro fotos de terreno con tarjeta de escala: costra de cianobacterias, liquen crustoso, liquen folioso y suelo desnudo. | A y C (fotos reales) | Pie: figura 1 de Moreira-Grez et al. 2019, *Front. Microbiol.* 10:2143, doi:10.3389/fmicb.2019.02143 (CC BY), recortadas. |
| 6 | Ecología | Perfil de RNA-SIP: ARNr 16S por fracción (12 fracciones) contra la densidad de flotación, control ¹²C y tratamiento ¹³C. Antes eran dos curvas sin ejes. | B | Sello «Datos simulados, 12 fracciones» en el gráfico y «con datos simulados» en el pie, que enlaza su capítulo de métodos. |
| 7 | Fondo, sólo escritorio | La simulación de siempre con aspecto de micrografía dentro de la luz del cursor: campo con tono y grano en los márgenes, relieve y halo en todo lo dibujado, una de cada cinco nadadoras fuera de foco, y la raíz con volumen de tejido. En tema oscuro se lee como campo oscuro. | C | Rótulo fijo abajo a la izquierda desde 1440 px: «Fondo: simulación de microorganismos del suelo junto a una raíz. No es una micrografía.» El pie de página lo repite a todo ancho. |

Detalle de cada una:

- **1, simulación de buses.** Base 86 °C; deriva de 0,9 °C por día desde el día 13; revisión el día 21; ruido por recorrido de
  1,1 °C y 0,6 °C. Son valores plausibles para un motor diésel en régimen, no datos del cliente. La regla es la que describe el
  texto: referencia de los primeros 10 días, alerta cuando la media diaria supera la banda. Con 2σ avisa el día 15 con 2 falsas
  alarmas en 31 días-bus normales; con 1σ avisa el día 14 con 5; desde 2,5σ no hay falsas alarmas; con 4σ avisa el día 16.
  Comprobé que el control (JS) y `scripts/figuras.py` dan el mismo texto en los siete valores.
- **2, datos de Ecología.** Los diez valores están copiados en `scripts/figuras.py` con su referencia. Se grafican Basal y los
  cuatro tratamientos del diseño; la tabla trae además el suelo recién inoculado, que no se muestra (lo dice el comentario del
  script, no la página). Lo que el párrafo agrega (respiración duplicada, emergencia de 6,3 a cerca de 2 plántulas por maceta,
  *Acacia ancistrocarpa*, acopio de una mina del Pilbara) sale del texto del mismo artículo.
- **4, citas.** Suma de `counts_by_year` de OpenAlex para los 15 DOI de la tabla del CV. OpenAlex cuenta menos que Google Scholar
  (el pie lo dice); las tres cifras grandes siguen siendo las de Scholar de octubre.
- **6, RNA-SIP.** Máximos en 1,79 y 1,82 g/ml, con un hombro liviano en el tratamiento. Son densidades del orden de las de un
  gradiente de CsTFA; no pude contrastarlas con una fuente abierta (ver pregunta 4).
- **7, fondo.** Costo medido por cuadro: 0,17 ms con GPU (Radeon 860M, 2880 × 1800, 1780 cuadros); 2,8 ms sin GPU a 1×; 24 ms
  sin GPU a 2×. Por eso se apaga solo si el promedio pasa de 7 ms y queda el dibujo plano de la 056.

## Segunda ronda (pedidos de Benjamin del 21 de noviembre, después de ver la versión)

Tres pedidos, los tres hechos:

1. **«Que se vaya difuminando» el cambio entre el fondo con textura y el liso del centro.** El grano se cortaba en seco en el
   borde de la columna y el tono caía en 88 px. Ahora tono y grano se apagan juntos con una curva suave: a 1440 px la caída
   ocupa unos 240 px a la izquierda (empieza dentro del margen y termina 40 px dentro de la columna) y unos 130 px a la derecha.
   Medido en la captura: el fondo pasa de 241 a 249 (de 255) sin escalones, y donde empiezan los bloques de texto queda cerca
   del 10 % del tono.
2. **Uniones «más orgánicas» entre la raíz primaria y las laterales.** La causa principal era un error anterior a esta rama: el
   cuerpo de la primaria se dibujaba como un tubo de 5 px de radio, cortado a 300 px de la punta, y las laterales quedaban
   pegadas por fuera con dos rayas rectas. Ahora la primaria tiene su ancho real en todo el largo, cada lateral nace dentro de
   ella y sale por un cuello que se ensancha, la capa externa se abre en la unión y el haz vascular entra curvo. No hay pelos en
   la boca de la lateral. Con el cuerpo en su ancho real, las bacterias se adhieren a la superficie y ya no dentro de la raíz.
3. **Sin «medir, ver la desviación, explicar y actuar»; texto más breve y más visual.** Salieron los tres pasos de las tres
   secciones y la frase que los anunciaba. Cada trabajo queda así: el problema en una frase, su figura, y filas cortas de rótulo
   y una línea. En Data science el esquema del sistema sube y cada caja lleva su anotación. En Ecología el resultado va en dos
   cifras grandes («×2» y «de 6,3 a cerca de 2») y un remate. Los pies de figura y las fichas de herramientas se acortaron. El
   texto visible bajó de 1719 a 1309 palabras (24 % menos), sin contar los desplegables. No se agregó ningún hecho: todo sale de
   frases que ya estaban.

Verificado otra vez: sin errores de consola ni desborde en las siete configuraciones; sin JavaScript a 375 px; en vivo con GPU
en tema claro y oscuro (0,22 ms por cuadro el aspecto de microscopía).

## Tercera ronda: «Sobre mí» antes de los trabajos

Pedido de Benjamin: hablar más de él antes de detallar los trabajos. Lo resolvió con preguntas de alternativas:

| Pregunta | Respuesta |
|---|---|
| Forma | Sección «Sobre mí» nueva y, pegado a ella, el Recorrido |
| Contenido | Formación y recorrido, cifras de investigación, cómo trabaja y qué busca hoy |
| Foto | Con un retrato suyo, que entrega después |
| Orden | El gráfico y el índice «Tres trabajos» van después de «Sobre mí» |
| Qué busca | Trabajo en datos, proyectos o consultoría, y colaboración en investigación |
| Tono | Abierto a conversar («Me interesa conversar sobre…») |

Qué quedó: portada, «Sobre mí», Recorrido, gráfico con el índice, los tres trabajos y Contacto. «Sobre mí» abre con la tesis que
Benjamin fijó el 2026-09-23 («Resuelvo problemas con lo que hay disponible»), una frase de presentación, tres cifras (15
publicaciones, 796 citas, índice h 13), «Cómo trabajo» y «Qué busco hoy», con enlace al correo. Las cifras salieron de Ecología,
donde sigue el gráfico de citas por año. En la barra, «Sobre mí» reemplaza a «Recorrido». El retrato tiene su lugar bajo el
título (columna izquierda) y su estilo, pero está desactivado hasta que exista el archivo.

Verificado: sin errores de consola ni desborde en las siete configuraciones y sin JavaScript a 375 px.

## Cuarta ronda: el fondo detrás del texto

Pedido de Benjamin (por el agente de contacto): una transición más sutil entre el fondo detrás del texto y el fondo animado, con
el mismo nivel de partículas a ambos lados y la animación más transparente detrás del texto, cuidando el contraste y el peso.

Qué había: cada bloque de texto llevaba un rectángulo del color de la página al 60 %, con 12 px de borde difuso; las células se
dibujaban al 55 % bajo el texto, se alejaban de los bloques y no se adherían ahí. El borde de cada bloque era un salto de
opacidad y de densidad.

Qué quedó:

- **Un solo velo continuo.** Ya no hay rectángulos por bloque. Detrás del texto el fondo queda al 16 % (antes, 22 % las células
  y 40 % la matriz) y vuelve al 100 % con una caída suave de unos 80 px hacia afuera de cada bloque. Se hace quitando opacidad a
  las células, no tapándolas con color de página, así que no deja contornos.
- **Misma densidad dentro y fuera del texto.** Quité la repulsión y el veto de adhesión bajo el texto, y puse tres fuentes de
  nutriente dentro de la columna (las cinco de los márgenes bajan al 80 %, con el mismo total). Medido a los 6 minutos, dos
  semillas, células que nadan por 100 × 100 px: bajo el texto 0,36 y en la columna sin texto 0,36 (antes, 0,17 y 0,41). Los
  márgenes siguen más poblados (0,9; antes 1,1) por la raíz y las colonias de partida.
- **Contraste del texto**, con una célula exactamente debajo (cálculo WCAG):

| Caso | Antes | Ahora |
|---|---|---|
| Claro, texto principal sobre la bacteria más oscura | 13,1:1 | 14,0:1 |
| Claro, texto secundario sobre la bacteria más oscura | 5,3:1 | 5,6:1 |
| Claro, texto secundario sobre un protista o el nematodo | 4,3:1 | 4,9:1 |
| Oscuro, texto principal sobre la bacteria más oscura | 12,2:1 | 13,1:1 |
| Oscuro, texto secundario sobre la bacteria más oscura | 5,6:1 | 6,0:1 |
| Oscuro, texto secundario sobre un protista o el nematodo | 4,3:1 | 5,1:1 |

- **Peso**: el celular no carga el fondo; su página sube 0,1 KB. En escritorio el script sube 1,1 KB.
- **Costo**: con GPU no se nota (el aspecto de microscopía sigue en 0,2 ms por cuadro; rehacer el mapa cuesta 0,5 ms, cuatro
  veces por segundo y al desplazar). Sin GPU cuesta algo: a 1× el fondo quedó entre el nivel 2 y el 3 de calidad (antes, 3) y a
  2× bajó del nivel 1 al 0.
- Con la animación en pausa el velo sigue al texto al desplazar la página. El párrafo de la portada lleva medio velo mientras el
  nematodo lo empuja, para que se siga viendo.

Sin tocar: la luz del cursor sigue usando una capa del color de la página, que deja escalones de 1 nivel de 255 (se ven sólo
realzando el contraste de una captura). Si molestan en tu pantalla, se puede pasar al mismo método del velo.

## Quinta ronda: un espacio quieto por bloque, empuje nuevo y textos con la estructura A

Encargo del 2026-11-23, después de que Benjamin viera la cuarta ronda a unos 1900 px y en oscuro.

1. **Fondo sin franja al medio.** El tono y el grano del microscopio cubren ahora toda la zona iluminada, también la columna
   central. Detrás de cada bloque de texto hay un espacio sin animación, ceñido al texto (no a la caja de la columna), con una
   caída suave que termina a unos 48 px. Entre bloques la animación sigue; por ejemplo, bajo el título «Sobre mí» ya no queda un
   espacio vacío. Los gráficos, los esquemas y el rótulo del fondo tienen su propio espacio. Como detrás del texto ya no se ve
   nada del fondo, el contraste del texto es el del texto sobre la página (16,5:1 y 6,6:1 en claro; 15,4:1 y 7,1:1 en oscuro).
2. **El nematodo empuja palabras, sin partir el párrafo.** El error era del empuje anterior, que rehacía el párrafo entero
   alrededor del nematodo. Ahora el nematodo entra al párrafo de la portada, se entierra unos 9 segundos y sale por donde entró.
   Cada palabra se aparta de su cuerpo, casi sólo hacia arriba o hacia abajo, y vuelve sola a su lugar. Las palabras no cambian de
   orden ni se montan, y ninguna queda bajo el cuerpo. Con movimiento reducido no pasa nada: ni el fondo ni el empuje se cargan.
   Ya no se usa la librería Pretext (40 KB menos en escritorio cuando pasaba el nematodo).
3. **Textos con la estructura A (persona primero).**
   - Portada: quién es y qué busca, en cuatro frases cortas.
   - «Sobre mí»: tres párrafos con rótulo (de dónde vengo, qué hago hoy, cómo trabajo) y las tres cifras.
   - Recorrido: sin cambios.
   - Tres fichas iguales: el problema, «Qué hice», «En qué quedó» y «Con qué». Cada una con su figura.
   - El detalle va en desplegables: el esquema del sistema (Data science); citas por año, perfil de RNA-SIP y publicaciones
     (Ecología); las tres herramientas y el asistente de gestión escolar (Docencia). Las fotos de terreno siguen a la vista.
   - Texto visible sin desplegables: 1411 → 1106 palabras. Sin hechos nuevos.

Verificado: sin errores de consola ni desborde en las siete configuraciones; sin JavaScript a 375 px; con los desplegables
abiertos cargan todas las imágenes; en vivo con GPU a 1920 px en oscuro (nivel 3, 60 cuadros por segundo; rehacer el mapa de
bloques cuesta 1,7 ms); la secuencia del nematodo completa, con el texto de vuelta en su lugar al final.

## Sexta ronda: más fondo quieto, más aire, barra fundida y rótulo tenue

Encargo del 2026-11-23 después de la quinta ronda. No cambian los textos ni el nematodo.

**Proporción propuesta** (escala con el ancho de la ventana, entre 1440 y 1920 px):

| Medida | A 1440 px | A 1920 px | Quinta ronda |
|---|---|---|---|
| Fondo del todo quieto alrededor del texto | 14 px | 19 px | 0 (empezaba 12 px dentro del texto) |
| Caída hasta la animación plena | 60 px | 80 px | 60 px |
| Dónde termina la caída, desde el texto | 74 px | 99 px | 48 px |
| Separación entre grupos de una sección | 112 px | 150 px | 24 a 36 px |
| Separación entre secciones | 202 px | 269 px | 128 px |

La separación entre grupos es dos veces el borde quieto más un tramo libre, así que entre el problema, la ficha y los
desplegables de cada sección queda una banda de fondo animado de unos 40 px. Los espacios nuevos sólo aplican donde corre el
fondo (escritorio con mouse, sin movimiento reducido); el celular no cambia. La página queda más larga: 7359 px de alto a
1440 px y 8171 px a 1920 px.

- **Barra superior**: ya no se ve como un rectángulo. Su fondo sigue opaco, para que el texto pase por debajo y se lea, pero
  tiene alrededor el mismo espacio quieto con caída suave que los bloques, y abajo una franja de 16 px que se desvanece.
- **Rótulo del fondo**: al 45 % en reposo; al 100 % con el mouse encima o con el foco del teclado (ahora es enfocable).
- Respuestas de Benjamin del mismo día: el retrato lo entrega él (en espera), los desplegables se quedan como están y el
  entierro del nematodo de 9 segundos está bien.

Verificado: siete configuraciones sin errores ni desborde; sin JavaScript a 375 px; GPU a 1920 px en oscuro (nivel 3, 60
cuadros por segundo); la secuencia del nematodo sigue completa.

## Séptima ronda: más fondo quieto, retrato en la portada y empuje más unido

Encargo del 2026-11-23 y dos pedidos directos de Benjamin durante la ronda.

1. **Fondo quieto del texto.**

| Medida | A 1440 px | A 1920 px | Sexta ronda (1440 / 1920) |
|---|---|---|---|
| Fondo del todo quieto alrededor del texto | 40 px | 53 px | 14 / 19 px |
| Caída hasta la animación plena | 126 px | 168 px | 60 / 80 px |
| Dónde termina la caída, desde el texto | 166 px | 221 px | 74 / 99 px |
| Separación entre secciones | 259 px | 346 px | 202 / 269 px |

   La caída es más difuminada: tres pasadas de desenfoque en vez de dos (una campana en lugar de un triángulo). La mitad de la
   animación se ve a 103 px del texto (137 px a 1920). Con este margen, los grupos de una misma sección quedan dentro de un solo
   espacio quieto; la animación corre en los márgenes, en la columna vacía junto a los títulos y entre secciones.
2. **Retrato en la portada.** Título más chico y la foto a la derecha. En el celular, la foto apaisada va arriba y el título
   debajo. En el tema claro, la foto en color con el cielo un 22 % menos
   saturado; en el oscuro, la versión en blanco y negro. Cada tema baja sólo su foto, también al usar el botón de tema.
   Pasó por tres versiones el mismo día, a pedido de Benjamin: panorámica difuminada detrás del título; recorte vertical
   limpio; y la que quedó, según una captura suya: **foto apaisada con él a la derecha y las montañas desvaneciéndose hacia
   el texto, a la izquierda**. El título y el párrafo van un poco más chicos junto a la foto. Probado en ocho anchos, de 900 a
   2560 px: la figura queda completa y la foto no se deforma ni se amplía. Contraste del párrafo sobre la foto: 10,6:1 o más.
   Archivos: `portada-claro.webp` 70,4 KB, `portada-oscuro.webp` 53,1 KB y las de celular, 31,1 y 24,6 KB. Sin metadatos.
   Los originales no están en el repo.
3. **Empuje del nematodo, más unido.** Pedido de Benjamin: más conexión entre las letras y menos movimiento mientras dejan pasar
   al nematodo. Las palabras ya no se apartan una por una del cuerpo que ondula: siguen el eje del cuerpo, todas las de un lado
   hacia ese lado, y cada una se inclina para seguir unida a sus vecinas, así que la línea se curva como una cuerda. El
   desplazamiento máximo bajó de unos 26 a 31 px a 20 px. A cambio, las crestas de la ondulación rozan alguna palabra.

Verificado: siete configuraciones sin errores ni desborde; sin JavaScript a 375 px; contraste del texto de la portada igual
que antes (no queda nada detrás); al pulsar el botón de tema se baja recién entonces la otra foto; secuencia del nematodo
completa, con el texto de vuelta en su lugar.

## Octava ronda: textura pareja en toda la página

Benjamin, al ver la séptima: el fondo todavía no lo convencía. Entre cuatro opciones eligió **textura pareja en toda la página**
y marcó dos molestias: las manchas de textura y que se veía demasiado vacío.

- **Sin manchas.** El tono y el grano ya no se pintan con los organismos ni se recortan alrededor del texto. Son una capa fija,
  igual en toda la página (también sobre el texto y las fotos), muy tenue: 3 % de tono y un grano fino. No depende de la luz
  del cursor. Sólo los organismos se desvanecen al acercarse al texto.
- **Menos vacío.** Tres ajustes, todos reversibles con un número:

| Medida | Séptima ronda | Ahora |
|---|---|---|
| Fondo quieto alrededor del texto, a 1440 / 1920 px | 40 / 53 px | 24 / 32 px |
| Caída hasta los organismos a plena vista, a 1440 / 1920 px | 126 / 168 px | 90 / 120 px |
| Tope de organismos (nivel de calidad más alto) | 160 | 220 |
| Nadadoras que se mantienen | 64 | 96 |
| Visibilidad del fondo lejos del cursor | 10 % | 18 % |

Verificado: siete configuraciones sin errores ni desborde; sin JavaScript a 375 px; GPU a 1750 px en oscuro y en claro, a 60
cuadros por segundo con 156 organismos; el nematodo sigue empujando el párrafo y el texto vuelve a su lugar.

## Novena ronda: texto rediseñado

Benjamin pidió rediseñar el texto completo antes de ejecutar, guiando con preguntas de alternativas. Sus decisiones:

| Tema | Decisión |
|---|---|
| Qué fallaba | Sonaba a ficha o CV, se repetía, mucha jerga y no se veía qué ofrece |
| Voz | Directa y sobria |
| Largo | La mitad o menos (quedó en unas 300 palabras visibles; eran 1100) |
| Objetivo | Que le escriban |
| Oferta | «Medir lo que nadie mide» |
| Estructura | Oferta, tres pruebas, «Sobre mí», contacto |
| Jerga | Fuera del todo |
| Titular | El actual: «Ecólogo microbiano. Hoy trabajo con datos.» |
| Pruebas | Un párrafo: qué faltaba, cómo lo midió, qué cambió |
| Títulos | Cortos: «Fallas en una flota de buses», «Suelos mineros», «Ciencias en un colegio» |
| Estados | Sólo la etiqueta junto al título; sin leyenda ni índice |
| Desplegables | Sólo publicaciones y herramientas |
| Ecología | Sin cifras grandes ni fotos de terreno |
| Docencia | Párrafo mínimo; el asistente escolar sale del sitio |
| Demostración | Sólo el control y el gráfico, sin frase de resultado |
| «Sobre mí» | Lema arriba, formación en una frase, agentes de IA, tres cifras; recorrido plegado en cuatro líneas |
| Contacto | Sólo correo y perfiles |

Un hecho nuevo, dictado por Benjamin: en Ecología, el resultado fue identificar «las especies de bacterias que importan para la
estabilidad del ecosistema». Lo enlacé al artículo de 2019 que él indicó (doi:10.3389/fmicb.2019.01617); no lo contrasté con
el texto del artículo.

Verificado: siete configuraciones sin errores ni desborde; sin JavaScript a 375 px; desplegables con sus imágenes; página en
vivo con GPU a 60 cuadros por segundo. La página mide 3254 px de alto a 1440 px (antes, más de 7000).

## Décima ronda: logos en el recorrido

Pedido de Benjamin: al expandir «Mi recorrido», un logo chico a la izquierda de cada punto. Decidió por alternativas: los tres
en un solo tono (el color del texto), que los bajara yo, y de Andes sólo el símbolo «AE», sin las palabras.

| Logo | Origen | Condición |
|---|---|---|
| PUCV (sello) | Sitio oficial, pucv.cl: el logo vigente, en su versión de un color | Marca de la universidad |
| UWA (escudo) | Sitio oficial de la UWA: `uwacrest-white.svg` | Marca de la universidad |
| Andes («AE») | Tu equipo, `Andes/dashboard/frontend/public/AE-logo-BW.svg` | Logo de tu empleador; le quité las palabras «Andes» y «Electrónica» |

**Corrección del mismo día.** Benjamin avisó que los logos no eran los correctos y pidió bajar los de la PUCV y la UWA y
hacerlos el doble de grandes. Los primeros venían de Wikimedia: el de la UWA era el blasón antiguo. Ahora son los vigentes,
tomados de los sitios de cada universidad: de la PUCV usé el sello (su logo actual lleva además «100 años» y el nombre, que
ya va escrito al lado) y de la UWA, el escudo sin el nombre. Miden 56 px, van en un solo tono y se ven igual en claro y en
oscuro. En el celular la línea de tiempo se corre para dejarles lugar. Pesan 18,1, 13,8 y 5,9 KB y se bajan recién al abrir
el desplegable.

**Docencia y logo del IDE (pedido de Benjamin, mismo día).** El recorrido tiene ahora cinco hitos. El último se separó en dos:
«Instituto Domingo Eyzaguirre: Docente de ciencias, 2023–hoy», con el escudo del colegio en un solo tono, y «Andes: Ingeniero de
desarrollo y análisis de datos, 2025–hoy». Cargo y fechas salen del CV del vault. El escudo estaba en tu equipo (proyecto
`aula-herramientas`); pesa 17,9 KB y se baja al abrir el desplegable. Con esto el sitio nombra el colegio por primera vez, sólo
en el recorrido: la portada y Docencia siguen diciendo «un colegio».

**Ajuste posterior (pedido de Benjamin).** Los logos bajaron de 56 a 42 px y el cargo en Andes pasó a «Agentic engineer,
2025–hoy», dictado por él (el CV del vault dice «Ingeniero de desarrollo · análisis de datos»).

## Undécima ronda: portada, nematodo fuera del texto y gráfico de la flota

Tres pedidos de Benjamin.

1. **Sin el botón «Ver las tres pruebas».** En la portada queda sólo «Escríbeme».
2. **El nematodo no entra a los bloques de texto.** Llega por la izquierda al párrafo de la portada, empuja contra su borde
   durante 9 segundos subiendo y bajando, como buscando por dónde entrar, y se va por donde vino. En toda la secuencia medida su
   cuerpo quedó fuera del párrafo (a 9 px o más del borde). Las palabras que quedan frente a su cabeza se corren hasta 10 px y
   vuelven a su lugar. En el resto de la página el nematodo ya vivía sólo en los márgenes.
3. **Gráfico de Data science: la flota completa.** Entre cuatro direcciones Benjamin eligió esta, fija y con rótulos llanos.
   Ahora muestra 40 buses simulados durante 30 días: 39 en gris, juntos, y uno que empieza a subir el día 13. El aviso llega el
   día 16 y, tras la revisión del día 21, vuelve a lo normal. El eje dice «Temperatura del motor», sin unidades ni σ. Salió el
   control del umbral. Sigue rotulado como simulación en el gráfico y en su pie. La regla del aviso: el bus queda a más de 3,5
   desviaciones robustas sobre la mediana de la flota de ese día.

Verificado: siete configuraciones sin errores ni desborde; sin JavaScript a 375 px (cuatro figuras presentes); secuencia del
nematodo en vivo con GPU.

## Duodécima ronda: ordenación en Ecología

Pedido de Benjamin: un gráfico de ordenación con vectores para mostrar su experiencia en análisis de datos, el mismo de un
artículo pero rehecho con la estética del sitio.

- **Cuál**: la figura 6 de Moreira-Grez et al. 2019 (doi:10.3389/fmicb.2019.01617, CC BY 4.0), el artículo que ya respalda la
  sección. Es un análisis de correspondencia canónica (CCA), no un NMDS: muestras, taxones y vectores de la química del suelo.
- **Qué muestra**: 18 muestras en seis grupos de tres réplicas, 214 taxones como puntos tenues y 15 flechas de química. Las tres
  muestras del inóculo quedan lejos, a la izquierda; las del suelo se ordenan de arriba abajo, de «Microbios + N» a «Control».
- **Cómo se hizo**: no recalculé el análisis. Leí las posiciones de la imagen publicada (3793 × 3416 px), con los ejes
  calibrados por su rejilla. Las muestras y las puntas de las flechas tienen un error de unas 0,01 unidades.
- **Tres diferencias con el original**, declaradas:
  1. Taxones: detecté 214; en la nube densa del centro el original tiene más, superpuestos, que no se pueden separar.
  2. Una réplica de «Microbios + N» está en CCA2 = 3,2. Para no aplastar el resto, el eje llega a 1,8 y esa réplica va marcada
     en el borde superior con una flecha.
  3. Dos réplicas de Control están superpuestas en el original; aquí van separadas 0,04 unidades para que se vean las tres.
- **Rótulos**: los vectores van con el símbolo del elemento (pH, Ca, NH₄, NOx, Na, Mg…); algunos sin rótulo para que no se
  monten. Los grupos se distinguen por color (con microbios agregados, relleno coral; sin ellos, contorno burdeos) y por forma.
- Salió el gráfico anterior de amonio y nitrato.

Verificado: siete configuraciones sin errores ni desborde; sin JavaScript a 375 px; capturas en claro, oscuro y celular.

## Peso (transferido con gzip, sin fuentes, como en el guardrail 5)

| Caso | Antes (056) | Ahora | Diferencia |
|---|---|---|---|
| Celular, primera carga (sólo `index.html`; las imágenes son diferidas) | 33,5 KB | 70,3 KB | +36,8 KB |
| Celular, recorriendo toda la página | 82,6 KB | 81,9 KB | −0,7 KB |
| Escritorio desde 1200 px, recorriendo toda la página (con fondo y Pretext) | 164,9 KB | 171,4 KB | +6,5 KB |

Los valores son del tema claro; en el oscuro, 63,8, 75,4 y 154,0 KB. Desde la séptima ronda la primera carga incluye el retrato
(31,1 KB en el celular, 70,4 KB en escritorio). Desde la quinta ronda ya no se baja Pretext (39,9 KB) y la imagen del autodiagnóstico (23,2 KB) se carga sólo al abrir su
desplegable. Por archivo: `index.html` +1,7 KB; `quimiotaxis.min.js` +3,5 KB (sólo escritorio); `empuje.min.js` 3,4 → 1,6 KB; `costras-biologicas.webp` 27,2 KB (nueva);
`tabla-periodica-fig-n.webp` 11,6 KB o `tabla-periodica-fig.webp` 17,0 KB (nuevas, una según el ancho); se quitó
`tabla-periodica.webp` (25,9 KB), porque la ficha de la herramienta usa la captura nueva. El límite de 200 KB se cumple.

## Verificación

- Sin errores ni advertencias de consola en siete configuraciones: 1440 px claro, oscuro y con movimiento reducido; 1024 px;
  375 px claro y oscuro; 320 px. Sin desborde horizontal en ninguna. Todas las imágenes cargan.
- A 375 px: la figura queda fija arriba, el control de la demostración está en el flujo del texto y mueve el gráfico de arriba.
- En vivo 30 s con GPU: el nematodo cruza el párrafo y el texto se aparta, como antes.
- Revisión independiente de hechos (un subagente): resultado en la sección «Revisión de hechos».

## Revisión de hechos

Un subagente independiente, de sólo lectura, comparó el commit con el `index.html` anterior, el CV, el CONTEXT y las fuentes
descargadas. Confirmó los diez valores del gráfico de Ecología contra la tabla suplementaria, las citas por año contra OpenAlex,
los hechos del párrafo de Ecología, el orden de las fotos, «uno de 117 autores», las tres menciones de «Andes», los DOI y que la
regla del control es la misma del generador. Encontró ocho cosas, todas corregidas en el segundo commit:

| # | Severidad | Hallazgo | Corrección |
|---|---|---|---|
| 1 | media | El texto decía que el gráfico de Data science era «la única» simulación de la página, y el perfil de RNA-SIP y el fondo también lo son. | Se quitó «la única de la página». |
| 2 | media | «Basal» es el suelo antes de incubar, y el eje decía «tras 12 semanas» para todo. | Eje «Suelo inicial (Basal) y tratamientos a las 12 semanas»; el párrafo y la descripción accesible lo aclaran. |
| 3 | baja | Siete rótulos nuevos con punto medio (antipatrón del guardrail 6). | Coma o dos puntos; `og.png` rehecho. |
| 4 | baja | Descripción accesible del gráfico de Ecología mal puntuada. | Frase rearmada. |
| 5 | baja | El artículo dice NOx-N, que es nitrato más nitrito, no sólo nitrato. | «nitrato + nitrito (NOx-N)» en la leyenda y el texto. |
| 6 | baja | Los textos fijos decían «2σ» aunque el control cambie el umbral. | «el umbral elegido (2σ al empezar)» y «con el umbral inicial de 2 sigmas». |
| 7 | baja | «para entrenar un modelo» no estaba en ninguna fuente. | Quitado: «No había suficientes fallas registradas.» |
| 8 | baja | «mi capítulo de 2019»: el CV no dice que sea primer autor. | «el capítulo de 2019 del que soy coautor». |

## Lo que no hice

- No toqué `aula-herramientas`, la carpeta de Codex ni `main`. No hay push.
- Esta rama parte de la 056. La 057 (fuentes locales y hoja compartida con el hub) está en `origin/iter/057-diseno-compartido` y
  no en `main`, así que aquí siguen las Google Fonts. Ver pregunta 6.
- No medí con Lighthouse ni con axe (no están instalados en este equipo). Revisé a mano los ids, `for` y `aria-*` nuevos.

## Preguntas para Benjamin

Lista depurada el 2026-11-23, al cierre de la duodécima ronda.

1. **Ecología, texto y figura.** El texto dice «las especies de bacterias que importan para la estabilidad del ecosistema» (frase
   tuya, enlazada al artículo de 2019, sin contrastar) y el gráfico muestra órdenes. ¿La frase describe bien el resultado?
2. **Ordenación.** ¿Rótulos de los grupos en español o como en el artículo? Si tienes las coordenadas originales del análisis,
   la rehago con los valores exactos.
3. **Base de publicación.** (a) Publicar sobre la 056 y rehacer después la 057 encima; (b) fusionar antes la 057 y llevar esta
   rama encima. Recomiendo (b) si la 057 sigue en pie.
4. **Corrección del cuerpo de la raíz en `main`.** El error existe en la versión publicada. ¿Se lleva aunque elijas la versión
   de Codex? Recomiendo que sí.
5. **Escalones de la luz del cursor.** Sin tocar, a la espera de tu decisión.
6. **Gráfico de la flota.** ¿40 buses, o 25 para recuperar 3,7 KB? Recomiendo dejarlo.
7. **Revisión antes de publicar.** El texto actual no tiene revisión independiente de hechos, y faltan Lighthouse y axe.
   Recomiendo hacerlas.

Cerradas o sin efecto: titular, caja de agentes, crAssphage, densidades de RNA-SIP, umbral de la demostración, intensidad del
campo, captura repetida, autoría del capítulo, cuánto recortar el texto, retrato y su forma, «Recorrido» en la barra, estructura
de los textos, desplegables, duración del nematodo, proporción del fondo, peso del escritorio, empuje dentro del párrafo, logos
y su permiso, colegio con nombre y título en el CV. El detalle de cada una está en el historial de este archivo.
