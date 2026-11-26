# Informe: el sitio contra el estado real de los proyectos (2026-11-25)

Rama `feat/sync-vault`, sobre `main` = `a948c9a` (la versión realista publicada el 25 de noviembre). Dos encargos de Benjamin:
revisar qué del sitio no calza con el estado real de los proyectos, y un sistema que mantenga el sitio al día cuando avanzan.

## Cómo se hizo la revisión

Cuatro revisores, uno por sección («Sobre mí» y cifras; Data science; Ecología; Docencia), leyeron el sitio frase por frase contra las
fuentes: el CV y los registros de cada proyecto, los artículos por su DOI, Google Scholar, ORCID, Google Patents y el hub público de
Herramientas de aula. Ante dos fuentes que se contradicen, gana la más reciente con fecha. Cada hallazgo de severidad media o alta
pasó por un verificador independiente que intentó refutarlo abriendo él mismo las fuentes: los 10 sobrevivieron, 4 tal cual y 6
con la corrección ajustada. Los de severidad baja quedan sin verificar y no se aplicaron.

Las fuentes internas se citan aquí por tipo y fecha, sin rutas ni nombres de proyectos internos, porque este repo es público. Las
rutas exactas están en el registro privado del proyecto.

## Discrepancias

Severidad: **alta**, la frase es falsa; **media**, desactualizada, imprecisa o sin respaldo; **baja**, un matiz de redacción.

| # | Sección y texto del sitio | Qué dicen las fuentes (fecha) | Veredicto | Corrección o pregunta |
|---|---|---|---|---|
| D1 | Data science, estado: «en piloto» | Registros del trabajo en Andes, 23–25 nov 2026, e informe mensual de noviembre: el primer equipo que leerá el motor está en pruebas sobre un vehículo con señales simuladas y todavía no se instala en un bus. Ningún proyecto está en piloto con detección de fallas. | alta, confirmado | **Aplicada**: «en desarrollo». |
| D2 | Data science: «Hoy funciona en piloto, con datos reales.» | Registros de octubre y noviembre de 2026: el banco donde corría el detector se detuvo el 20 de octubre y el simulador quedó congelado el 26. El detector nunca procesó datos del motor de un bus real. | alta, confirmado (con la corrección ajustada) | **Aplicada**: «Hoy pruebo el primer equipo que leerá el motor de un bus, antes de instalarlo.» |
| D3 | Data science: «un detector que estima el riesgo de falla» | Registros de septiembre de 2026: lo que se evaluó a ciegas fue un detector de fallas, que avisa cuando la falla ya empezó. No pronostica, y el modelo de riesgo quedó diferido. | media, confirmado | **Aplicada**: «un detector de fallas». |
| D4 | Data science: «Una empresa de transporte no tenía datos del estado de sus buses ni aviso de las fallas que venían.» | Registros del sistema en tiempo real, 9 nov 2026: la empresa ya veía la posición y la velocidad de sus buses. Le faltaban las señales del motor y los avisos. | media, confirmado (con la corrección ajustada) | **Aplicada**: «Una empresa de transporte veía la posición y la velocidad de sus buses, pero no tenía aviso de las fallas que venían.» |
| D5 | Data science, pie de la figura: «Simulación. Los datos de la flota son del cliente y no se publican.» | Registros del 9 y el 24 nov 2026: hoy ningún bus envía la temperatura del motor. El pie da a entender que esos datos existen y sólo se ocultan. | media, confirmado (queda como pregunta) | **Pregunta 2.** |
| E1 | Ecología: «Lo medí en terreno y en invernadero, en Western Australia.» | Moreira-Grez et al. 2019, doi:10.3389/fmicb.2019.01617, Métodos: ensayo de invernadero en Perth (dic 2015 – feb 2016) con suelo de acopio de una mina del Pilbara. No hubo mediciones en terreno. | media, confirmado | **Aplicada**: «Lo medí en invernadero, con suelo de acopio de una mina de Western Australia.» |
| C1 | Docencia, ficha del Autodiagnóstico de Bienestar y Salud: «en uso en clases» | Cronograma del semestre del curso para el que se preparó (nota del 8 jul 2026): la herramienta quedó «sin uso para esta secuencia». Ningún registro posterior documenta que se usara. El hub dice lo mismo que el sitio. | alta, confirmado (queda como pregunta) | **Pregunta 1.** El sitio toma el estado del hub, así que la corrección va en el hub. |
| C2 | Docencia: «Hoy se usan en clases y están publicadas.» | De las tres herramientas del desplegable, sólo la Tabla periódica tiene uso en clase documentado (julio y agosto de 2026). En noviembre sí se usaron otras piezas del hub. | media, confirmado | **Aplicada**: «Están publicadas, y varias las he usado en mis clases este año.» |
| C3 | Docencia: «También sigo las notas y la asistencia de cada curso, para ver a tiempo a quién acompañar.» | La frase la confirmó Benjamin el 24 nov 2026, pero los registros no documentan un seguimiento de la asistencia en todos los cursos. | media, confirmado en parte (queda como pregunta) | **Pregunta 3.** |
| C4 | Docencia, desplegable: «Tres herramientas publicadas» | Hub, 25 nov 2026: 17 fichas para la sala de clases. Desde la iteración 056, el sitio no da una cifra de herramientas. | baja (el verificador la bajó de media) | **Pregunta 4.** |
| S4 | Sobre mí: «citas 801», «102 en 2026», «al 24 de noviembre de 2026» | Google Scholar, leído el 25 nov 2026: 802 citas, 103 en 2026; índice h 13. | baja (exacto a su fecha) | **Aplicada** con la sincronización: 802 citas, 103 en 2026, al 25 de noviembre. |

### Los tres datos sueltos del handoff 090

- **Año de la patente** (Scholar dice 2021 y el CV, 2020). Google Patents, consultado el 25 nov 2026: la prioridad europea es del
  13 de marzo de 2020 y la solicitud internacional se publicó el 16 de septiembre de 2021 (WO2021180941). Además, está concedida en
  Australia (AU2021235144, 2026). Los dos años son correctos, según qué fecha se use. El sitio no muestra el año, así que en la
  página no hay nada que corregir. **Pregunta 5**: qué año va en el CV.
- **Flota de 40 o 25 buses.** El 40 nunca fue una cifra real: es un parámetro de la simulación, y el 25 se propuso sólo para ahorrar
  3,7 KB. Ninguna de las dos describe una flota real, así que no revela cifras del cliente. El hecho queda resuelto. La elección por
  peso sigue abierta en el handoff 090 (§5.10) y no se tocó.
- **«Ocho años analizando comunidades microbianas del suelo».** El CV respalda la duración (de agosto de 2014 a octubre de 2022) y
  los métodos. El matiz está en «del suelo»: como Research Associate trabajó con residuos de bauxita. **Pregunta 6.**

### Hallazgos de severidad baja, sin verificar y sin aplicar

| # | Texto del sitio | Observación | Propuesta |
|---|---|---|---|
| M1 | «¿…se recupera al devolverle microorganismos…?» | El inóculo era un producto comercial de origen agrícola, no los microorganismos propios del suelo. | «al agregarle microorganismos de fuera» |
| M2 | «Con inóculo y nitrógeno el suelo respiró el doble» | Es literal, pero el inóculo solo también duplicó la respiración. | «Con el inóculo, solo o con nitrógeno, el suelo respiró el doble» |
| M3 | Descripción accesible del gráfico de Ecología | No menciona el amonio, que es lo que el artículo destaca de la figura 6. | Agregar «amonio, hacia Microbios y Microbios más nitrógeno» |
| M4 | Descripción accesible: «comunidades bacterianas» | Los cebadores amplifican bacterias y arqueas. | «comunidades microbianas (bacterias y arqueas)» |
| M5 | «…y se vea qué falta reforzar.» | Las herramientas no guardan respuestas: lo ve cada estudiante, o el curso con el modo docente. | «…y cada estudiante vea qué le falta reforzar.» |
| M6 | «Las imágenes son fragmentos de cada interfaz.» | Vacunas lleva un panel tipográfico, no una captura. | «Las capturas son fragmentos de cada interfaz.» |
| M7 | «Doctorado, con la beca Becas Chile…» | Repite «beca». | «Doctorado con Becas Chile…» |
| M8 | «También dicté talleres de análisis de datos en Australia y China.» | El CV dice que los talleres fueron de análisis de amplicones 16S y metagenómica. | Pregunta 7 |
| M9 | «también en ORCID» | ORCID lista sólo 3 obras. | Pregunta 8 |
| M10 | «Hoy lo hago con una flota de buses» | El trabajo abarca flotas de varias empresas. | Pregunta 9 |

Sin cambios, ya abiertos en el handoff 090: «especies de bacterias» y el gráfico de órdenes (§5.2), y qué mostrar en «Con qué
trabajo», incluido RNA-SIP (§5.3).

Fuera del sitio (en el hub de Herramientas de aula, otro repo): la introducción dice «Once herramientas y presentaciones» y hay 17
fichas; el pie dice «Sin cookies ni servicios externos» y la Tabla periódica carga Google Fonts.

## Lo que se confirmó

Los siete DOI enlazados (seis publicaciones y la tesis) resuelven al título, el año y la revista que muestra el sitio, con
Moreira-Grez entre los autores (guardrail 4). Coinciden con Scholar 14 artículos, 1 capítulo, 1 patente e índice h 13, y con el CV
las etapas del recorrido y sus fechas, el cargo en Andes, las asignaturas y el país de los talleres. Se cumplen la privacidad (sin
estudiantes, cursos ni personas) y el trato genérico de Andes y sus clientes. «Respiró el doble» y «emergieron menos plántulas»
calzan con el artículo, y la licencia de la figura es CC BY 4.0.

## El sistema que mantiene el sitio al día

- **En este repo**: `datos/sitio.json` guarda las cifras de Scholar y el estado de cada caso y herramienta. `scripts/datos.py` lo
  valida (tipos, rangos y un vocabulario cerrado de estados) y lo pega en `index.html` entre marcadores `<!-- dato:ID -->`, en el
  HTML estático. Con los datos de antes la página no cambiaba: sólo se agregaron los marcadores. Ver `datos/LEEME.md`.
- **Fuera del repo** (privado, del agente de contacto): un extractor que lee sólo una lista cerrada de campos (cifras, fechas y
  estados; nunca texto libre), una lista negra y la compuerta. Una vez al mes, o a pedido, escribe `datos/sitio.json`, regenera la
  página y la publica sólo si pasan todos los controles:
  1. el cambio toca sólo esos dos archivos, `index.html` sólo dentro de los marcadores, y está bajo el tope de tamaño;
  2. no trae ningún término de la lista negra, y la guardia de seudónimos no encuentra nombres de estudiantes;
  3. el HTML queda válido;
  4. pasa las ocho configuraciones de la verificación (320 a 1440 px, claro y oscuro, movimiento reducido y 375 px sin
     JavaScript) con 0 errores de consola;
  5. pesa menos de 200 kB con gzip en escritorio.

  Si algo falla, no publica y avisa.

## Verificación de esta rama

Repetí la verificación del handoff 090 en las ocho configuraciones: 1440 px claro, oscuro y con movimiento reducido; 1024 px; 375 px
claro, oscuro y sin JavaScript; y 320 px. Resultado: 0 errores de consola, sin desborde horizontal y todas las imágenes cargan. Sin
JavaScript a 375 px se ven el titular, los tres casos, las cifras y los estados. Peso con gzip, sin fuentes, en escritorio: 170,5 kB
en el tema claro y 153,1 kB en el oscuro (antes, 170,4 y 153,1).
