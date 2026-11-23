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

## Peso (transferido con gzip, sin fuentes, como en el guardrail 5)

| Caso | Antes (056) | Ahora | Diferencia |
|---|---|---|---|
| Celular, primera carga (sólo `index.html`; las imágenes son diferidas) | 33,5 KB | 34,8 KB | +1,3 KB |
| Celular, recorriendo toda la página | 82,6 KB | 96,9 KB | +14,3 KB |
| Escritorio desde 1200 px, recorriendo toda la página (con fondo y Pretext) | 164,9 KB | 187,8 KB | +22,9 KB |

Por archivo: `index.html` +1,3 KB; `quimiotaxis.min.js` +3,2 KB (sólo escritorio); `costras-biologicas.webp` 27,2 KB (nueva);
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

1. **Titular de la portada.** Puse «Ecólogo microbiano. Hoy trabajo con datos.» porque responde a tu respuesta 1 en dos frases.
   Opciones: (a) dejarlo; (b) «Ecólogo microbiano. Hoy mido buses y aprendizaje.», más concreto y menos claro para quien contrata;
   (c) volver a «Trabajo con datos, ecología y docencia.». Recomiendo (a).
2. **La caja de pruebas de Agentes** (la célula en el recuadro punteado, iteración 049) salió junto con la sección. Opciones:
   (a) dejarla fuera; (b) reponerla dentro de Data science, junto al párrafo «Con agentes de IA». Recomiendo (a): es un esquema
   plano y esta versión apunta a lo contrario. Reponerla son unos 5 KB.
3. **El artículo de crAssphage aparece por primera vez en el sitio**, en el gráfico de citas («donde soy uno de 117 autores»).
   Es casi la mitad de las citas de varios años, así que ocultarlo distorsionaría el gráfico. Opciones: (a) dejarlo como está,
   en gris y explicado; (b) graficar sólo las otras 14 publicaciones; (c) quitar el gráfico de citas. Recomiendo (a).
4. **Densidades del perfil de RNA-SIP.** Usé máximos en 1,79 g/ml (¹²C) y 1,82 g/ml (¹³C). ¿Son los que usarías tú? Si tienes un
   gradiente publicado con sus fracciones, lo reemplazo y pasa de simulado a dato real.
5. **Umbral por defecto de la demostración.** Con 2σ salen 2 falsas alarmas; con 2,5σ, ninguna y la alerta es el mismo día.
   Opciones: (a) partir en 2σ, que muestra el costo de la regla simple; (b) partir en 2,5σ, que se ve más limpio. Recomiendo (a).
6. **Sobre qué base se publica, si eliges esta versión.** `main` está en la 056 y la 057 sigue sin fusionar. Opciones:
   (a) publicar esta rama sobre la 056 y rehacer después la 057 encima; (b) fusionar antes la 057 y llevar esta rama encima
   (hay que resolver conflictos en el `<head>` y en el CSS de la barra). Recomiendo (b) si la 057 sigue en pie.
7. **Intensidad del campo del microscopio.** Bajo la luz del cursor los márgenes toman un 6 % de tinta y un grano fino. Si lo
   prefieres más o menos marcado es un número (`MIC.campo` y `MIC.grano` en `quimiotaxis.js`).
8. **La captura de la Tabla periódica se ve dos veces en escritorio**: en la figura fija y en la ficha de «Herramientas
   publicadas». Lo hice para no sumar otra imagen. Opciones: (a) dejarlo; (b) que la ficha lleve un recuadro tipográfico como el
   de Vacunas; (c) que la figura fija muestre otra herramienta. Recomiendo (a) hasta que lo veas.
9. **«del que soy coautor»** en el pie del perfil de RNA-SIP: el CV no dice el orden de autoría del capítulo de 2019. ¿Lo dejo así
   o eres primer autor?
10. **Cuánto más recortar el texto.** Quité los tres pasos y bajé el texto visible un 24 %. Opciones: (a) dejarlo así; (b) recortar
    más: sacar las filas «Con qué» y «Después» y dejar las fichas de herramientas en una línea cada una. Recomiendo (a) hasta que
    lo veas.
11. **La corrección del cuerpo de la raíz en `main`.** El error (un tubo delgado y cortado en vez del cuerpo con su ancho) existe
    en la versión publicada (056). Opciones: (a) llevarla a `main` aunque elijas la versión de Codex; (b) dejarla sólo en esta
    rama. Recomiendo (a).
12. **El retrato.** Respondiste que está en Downloads, pero no lo pude identificar: hay 342 imágenes, ninguna con nombre de
    retrato ni posterior al pedido, y no abrí fotos al azar (hay fotos de terceros y un archivo de fotos de curso). ¿Cuál es el
    nombre del archivo?
13. **La frase «Hoy vivo en Santiago»** de «Sobre mí» la deduje de «Santiago, Chile» en la portada. ¿Está bien dicha así?
14. ~~«Recorrido» fuera de la barra~~ Respondida: se queda fuera.
15. **Estructura de los textos** (antes de reescribir; elige una o mezcla):
    - **A. Persona primero.** Portada (quién eres y qué buscas, en dos frases); «Sobre mí» como historia en tres párrafos cortos
      (de dónde vienes, qué haces hoy, cómo trabajas); Recorrido; los tres trabajos como fichas iguales y breves (problema, qué
      hiciste, resultado, estado), con su figura y el detalle en desplegables; Contacto. Tono: primera persona, conversacional,
      frases cortas. Es la más cercana a lo que hay hoy.
    - **B. Lo que sabes hacer.** Portada (qué resuelves); «Sobre mí» breve; tres capacidades en vez de tres sectores (medir y
      monitorear sistemas; detectar lo raro con pocos datos; construir herramientas que otros usan), cada una con evidencia
      cruzada de buses, suelos y colegio; los tres trabajos quedan como casos de respaldo, muy cortos; Recorrido; Contacto. Tono:
      directo, orientado a quien contrata, sin jerga.
    - **C. Una sola historia.** La página entera es el Recorrido: Valparaíso, Perth (el doctorado, con el gráfico publicado y las
      fotos de terreno), los años de investigador y Santiago hoy (los buses, con el gráfico interactivo; el colegio, con las
      herramientas). Cada etapa dice qué aprendiste, qué construiste y muestra una evidencia. Cierra con «Qué busco hoy» y
      Contacto. Tono: narrativo y personal, en primera persona.
    Recomiendo B si la prioridad sigue siendo quien podría contratarte, y C si quieres que la página se lea como tu historia.
