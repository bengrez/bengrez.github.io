/* Fondo con quimiotaxis bacteriana en un fluido (iteración 024; células visibles y corriente en la 025; acopladas al fluido en la
   026; nutriente que se consume y ciclo nadar → adherirse → colonia en la 027). Sólo escritorio: lo carga index.html cuando hay
   puntero fino, el ancho es de 1024 px o más, no hay movimiento reducido ni ahorro de datos. Sin dependencias; no envía nada
   fuera del navegador. (La biopelícula está inspirada en autómatas celulares con nutrientes que difunden y se consumen con
   cinética de Monod, como raphaelrubrice/Biofilm-Simulator, MIT; todo el código es propio.)

   Una muestra ambiental de hasta 100 a 160 células de 5 a 8 px, en cuatro formas y con cuatro comportamientos:
     cocos (círculos, 10 %)         casi no nadan: los lleva la corriente, con un poco de movimiento browniano;
     bacilos (cápsulas, 50 %)       «run and tumble» con quimiotaxis, como E. coli, orientados hacia donde nadan y con un flagelo largo;
     cocobacilos (cápsulas cortas, 30 %)  nadan despacio, con un flagelo corto (035);
     espirilos (ondas, 10 %)        nadan en tirabuzón, más rápido y con giros menos frecuentes.

   Nutriente (027): un campo c en una grilla gruesa de 64 × 40 celdas sobre la ventana, con difusión explícita (diferencias finitas,
   sin flujo por los bordes, con subpasos para ser estable), fuentes que lo reponen (c' = R·a·g·(1 − c), con g el perfil gaussiano de
   cada fuente) y consumo de Monod por las células cercanas (q·c/(K + c)). Los gradientes cambian a medida que las células comen.
   La quimiotaxis lee campo() (interpolación bilineal de la grilla): la célula percibe el logaritmo de la concentración
   (Weber-Fechner) y lo compara con su memoria (promedio móvil de constante TAU): s = d(ln(c + C0))/dt. Si sube, baja la tasa de giro.

   Ciclo de vida plancton ↔ biopelícula (027):
     nadando → adherida: en una zona rica (c > CAD) la célula se adhiere (más probable junto a otras ya adheridas): queda sésil, quieta,
       con el flagelo detenido;
     adherida: crece con Monod y, al duplicar su biomasa, se divide: la hija queda al lado, sin superponerse (microcolonia);
       deposita una matriz (EPS) tenue que se desvanece sola;
     agotada → dispersión: si el nutriente local se acaba durante un rato, las células del borde de la colonia vuelven a nadar hacia
       afuera; las del interior esperan su turno; si el hambre sigue, mueren;
     tope de población (100 a 160 según el nivel): no hay divisiones por encima; entran nadadoras por los bordes cuando faltan y
       algunas salen o mueren, así que el costo no crece sin límite.

   El cursor como fuente (028): si el cursor se queda quieto 2 s (con 6 px de tolerancia para el temblor de la mano), empieza a formarse
   una fuente de nutriente en ese punto, que crece mientras el cursor siga ahí (saturando con la permanencia). Al irse el cursor la
   fuente deja de crecer, se ensancha y decae poco a poco hasta desaparecer. El nutriente es finito: hay un presupuesto constante de
   caudal (suma de amplitud × (σ/σref)² de las fuentes) y lo que gana la fuente del cursor se le quita a las fuentes de fondo, en
   proporción a lo que tienen sobre su piso; ninguna baja del 15 % de la suya, así que siempre hay 5 fuentes de fondo activas (nunca
   menos de 3). Al apagarse la del cursor, el presupuesto vuelve a las de fondo despacio. Hasta 3 fuentes del cursor vivas: al crear
   otra, la más vieja se apaga más rápido. Se escucha `pointermove` en window; el canvas sigue sin capturar eventos.

   Interacción con el lector (029; 030): la velocidad del scroll agita el fluido (una onda corta y un empuje que decaen en ≈ 2 s). El único
   que da nutriente, además de las fuentes de fondo, es el cursor (028); las palabras clave y el pulso del clic de la 029 se quitaron.
   Calma y lectura (029): con el scroll quieto unos segundos (se está leyendo) el tiempo de la simulación baja un 40 %, y vuelve al
   desplazarse; las células se alejan suavemente de los bloques de texto (repulsión desde el gradiente de una máscara de los bloques
   con velo), no se adhieren bajo el texto y se dibujan más tenues allí: el texto queda en «aguas tranquilas».
   Realismo (029): flagelo ondulante visible en los bacilos que nadan (desaparece al adherirse); división con alargamiento y constricción
   (las hijas quedan exactamente donde terminan los dos lóbulos); cocos en pares (diplococos) y cadenas (estreptococos); colonias de
   crecimiento radial (los bastones y las cadenas se alinean con el radio), borde irregular, matriz (EPS) más densa en el centro y tamaños y
   velocidades de crecimiento con variación individual.

   El fluido y las células son el mismo medio (número de Reynolds bajo: no hay inercia, todo se mueve con el flujo):
   - Corriente: campo de velocidad sin divergencia (función de corriente: tres ondas planas que se desplazan despacio). Arrastra a
     las células que nadan y a unas partículas trazadoras finas que hacen visible el medio.
   - Propulsión ondulatoria: en espirilos (cuerpo) y bacilos (flagelo) hay una onda que viaja hacia atrás; su fase avanza en
     proporción a la velocidad real de nado (ω = k·v/η) y se frena con ella (tras cada giro). El vaivén del tirabuzón sale de la misma fase.
   - Órbitas de Jeffery: las células alargadas giran con la vorticidad del flujo y se alinean con el corte.
   Choques suaves: las células no se superponen; se empujan levemente (las adheridas no se mueven).
   Mientras el fondo está activo, <html> lleva la clase .fondo-vivo (el CSS pone un velo bajo cada bloque de texto).

   Relaciones ecológicas, etapa 1 (035): dos morfotipos con estrategias distintas, que se reconocen por la forma (el sitio es monocromo):
     A, estrategia r: el bacilo nadador con flagelo largo; μmax alto y Ks alto (crece rápido con nutriente abundante), poco eficiente (gasta
       el doble por biomasa), se adhiere tarde y poco;
     B, estrategia K: cocos (en pares y cadenas) y cocobacilos (bastones cortos, de nado lento y flagelo corto); μmax bajo y Ks bajo
       (gana con poco nutriente), eficiente, se adhiere antes, aguanta el hambre y deposita más matriz (EPS).
   Los espirilos quedan como un tercer grupo, fuera de las proporciones A:B (neutro en la 035 y la 036; en la 037 entran en un mutualismo con B).
   Competencia: ambos comen de la misma grilla c con Monod propio (μmax·c/(Ks + c)); con c alto manda A y con c bajo manda B (se cruzan en
   c ≈ 0,12, y B además se frena con exceso de nutriente y con vecinas A al adherirse); como los montones del cursor son ricos y las fuentes
   de fondo pobres, el resultado depende del régimen: A (r) coloniza primero y domina el montón, B (K) toma el relevo en las fuentes de fondo. Sintrofía
   (cross-feeding): al comer, A libera un subproducto en una segunda grilla p (misma resolución; difunde, decae; no se dibuja), que sólo B
   consume (además de c) y que atrae a los cocobacilos; alrededor de un montón que A está comiendo aparece, con retardo, un halo de colonias B.
   Relaciones ecológicas, etapa 2 (036): depredación tipo Bdellovibrio y quorum sensing.
     C (EST 3, tipo 4): un vibrio de 5 px en forma de coma, con un flagelo polar de onda rápida, de nado muy rápido (35 px/s; A, 25). Fase de ataque: persigue,
       dentro de 90 px, la presa de más peso (B adherida en colonias densas ≫ A ≫ nadadoras) y, en contacto, la ataca. Entra en la presa: ésta deja de crecer y de dividirse
       y se redondea (bdeloplasto: un círculo con un punto adentro). Tras ≈ 20 s, lisis: la presa se rompe, libera 2 a 6 C (sobreviven menos cuanto más C hay y según el peso de la presa, hasta 8) y devuelve
       nutriente y subproducto a las grillas. C muere de hambre tras 100 s sin presa (y con 0,01/s de mortalidad basal); el piso: con menos de 2, entra una por un borde. Ciclo lento: las colonias densas se vacían desde dentro y se recuperan.
     Quorum sensing: una tercera grilla (autoinductor; misma resolución, sin dibujar) que producen las adheridas y que difunde y decae. Con la señal local sobre un umbral la colonia
       deposita más matriz (hasta ×3,5) y se protege de C (el acceso de C cae con el cuadrado de 1 − 0,9·señal); con la señal sostenida 30 s, las células del borde se dispersan (0,05/s) y
       vuelven a nadar. Es un cambio de conducta, no un efecto gráfico nuevo.
   Relaciones ecológicas, etapa 3 (037): mutualismo espirilo (N) – B. Dos grillas nuevas de la misma resolución (no se dibujan): m, el carbono que B cede (lo exuda en proporción a su
     biomasa), y f, el factor de crecimiento (tipo vitamina o sideróforo) que da el espirilo. El espirilo es un auxótrofo parcial: con c solo crece a μmax = 0,4 (en la 036, 1,1) y m le suma
     μ = 0,5·m/(0,06 + m); B multiplica su crecimiento por 1 + 1,5·f/(0,05 + f). m y f decaen deprisa (0,25/s: alcance ≈ 40 px), así que el intercambio es local. Se siguen por quimiotaxis
     (el espirilo, a m; B suma f) y cuentan como alimento al adherirse: espirilos y colonias B se asocian en el espacio y a ambos les va mejor juntos que separados.
   Ajustes de la 036 en la 037: C nada a 35 px/s; ciclo presa–depredador más corto (≈ 8 min entre máximos de la B adherida: media 7,7, mediana 6) con C más dinámica (mortalidad basal 0,01/s, crías según el peso de la
     presa: B rinde más que A y que los neutros) y B adherida ≈ 75 con C.

   Movimiento realista y ritmo de la visita (038):
     Escala: 3 px/µm (el bacilo de 8 px ≈ 2,7 µm) y un reloj 2,5 veces más lento que el del laboratorio, de modo que 1 µm/s ≈ 1,2 px/s y 1 s de laboratorio ≈ 2,5 s aquí; con el scroll quieto
       el tiempo baja otro 40 % (calma). Valores en µm/s (laboratorio) → px/s: A 21 → 25; B 17 → 20; espirilo 32 → 38; vibrio C 29 → 35 (en el laboratorio nadan 50–100 µm/s: se dejó más lento, para la calma).
     Nado (cada estilo es una máquina de estados RS en nadar(): corrida, pausa, corrida hacia atrás):
       A y B, run-and-tumble (E. coli: Berg y Brown 1972, Nature 239:500–504): corridas rectas con el flagelo detrás (ruido rotacional DRT = 0,025 rad²/s, sin giro continuo), de duración exponencial con media de 2 s
         (≈ 50 px); la señal quimiotáctica (d ln c/dt con memoria) baja la tasa de tumbos, así que las corridas que suben por el gradiente se alargan (hasta ×12) y las que bajan se acortan. Un tumbo es una pausa de ≈ 0,35 s
         (el haz de flagelos se deshace: se dibujan dos filamentos abiertos) con un giro al azar de ángulo gamma (forma 3,5; media 68°, sd 36°) y a ambos lados, y luego la corrida recupera la velocidad en ≈ 0,35 s.
       Espirilo, run-reverse (tufos bipolares, como Spirillum): corre, se detiene ≈ 0,2 s y nada hacia atrás (180° ± 30°) sin cambiar de eje; la quimiotaxis modula la tasa de inversión.
       Vibrio C, run-reverse-flick (V. alginolyticus: Xie et al. 2011, PNAS 108:2246–2251): corrida hacia adelante, inversión (nada hacia atrás, a 0,8 de la velocidad, con el flagelo por delante), y un flick de ≈ 90° al retomar;
         si hay una presa a la vista corre hacia ella (giro suave) y los flicks apuntan a ella.
     Twitching (pili tipo IV: Merz, So y Sheetz 2000, Nature 407:98–102; Mattick 2002, Annu. Rev. Microbiol. 56:289–314): al adherirse, los bacilos y cocobacilos no se fijan de golpe: durante 6–14 s se tiran sobre la superficie
       en saltos espasmódicos de ≈ 2 px (0,28 s a 8 px/s) separados por esperas irregulares (media 1,1 s), con un pilo que se extiende antes de cada salto y se retrae al tirar; los bacilos saltan a lo largo de su eje y los cocobacilos hacia
       la colonia vecina; al chocar con una vecina se acoplan y se fijan.
     Forma de las colonias (cada una sale de la regla de crecimiento de su especie, ver Brock, Biology of Microorganisms): bacilos (A), empalizada: se alinean en paralelo con el director de sus vecinas y la hija nace en el mismo eje, así que
       crecen filas paralelas y la colonia se alarga; cocobacilos (B), compactas: ejes al azar y sin alineación, colonia redonda; cocos: diplococos (par), estreptococos (cadena: la división sigue el mismo eje, con una curva suave) y
       estafilococos (racimo: cada división en un plano perpendicular al anterior).
     Ajustes por el nuevo nado (para que la ecología quede como en la 037): el ataque de C sube de 0,65 a 0,72/s (correr hacia la presa con flicks acierta menos que el giro continuo de la 037); la ganancia quimiotáctica pasa a ser por tipo
       (A 5, espirilo 3,2, B 5; con 6 para todos las corridas largas hacían más eficientes a A y al espirilo, que desplazaban a B); y los cocobacilos (B) dividen a lo largo del borde de su colonia (eje tangencial) para que sea redonda.
       La deriva quimiotáctica en un gradiente exponencial (L = 150 px) queda en 3,1 (A), 3,4 (espirilo) y 2,0 px/s (B), frente a 3,5, 4,0 y 1,5 en la 037, y ≈ 0 sin gradiente.
     Estado inicial avanzado: la visita no parte de cero sino con cinco colonias ya formadas junto a las fuentes de fondo (donde hay menos texto encima), un par espirilo–B asociado, un depredador que ronda una colonia B y un bdeloplasto a punto de lisis
       (reiniciar({avanzado:false}) vuelve a la partida de la 037, para medir). Contraste: sobre fondo claro la opacidad se sube un 12 % y las adheridas se dibujan ×1,3 (antes ×1,18); el vibrio, de 0,40 a 0,46.

   La luz (039): el fondo sólo se ve alrededor del cursor, como el campo de un microscopio, para que quien lee explore el fondo con el mouse y descubra las interacciones donde apunta.
     (En la 041 el piso fue 0,2 en los márgenes y 0,05 en la columna, y la luz 28 %; en la 042, 0,4, 0,15 y 48 %: ver más abajo.) Una «tapa» del color de la página cubre el canvas con alfa 0,95 (piso de 0,05 afuera: el rastro que deja intuir que hay vida) salvo en la luz: diámetro = 10 % del ancho de la ventana (radio exterior
     0,05·ancho, 72 px a 1440), plena hasta el 35 % del radio y con caída suave (smoothstep, sin anillo) hasta el borde. (En la 042 la tapa pasó a canvas de baja resolución para poder dejar una estela: ver más abajo.) Eran seis capas (cuatro losas sólidas, un cuadrado con el degradado y un «tapón» que sube su opacidad
     para el fundido) que sólo se mueven con transform y opacidad: sin raster por cuadro. (Una máscara CSS —mask-image con un radial-gradient— sobre el canvas dejaba el nivel 3 en 36–51 de 60 fps con el compositor por software (y el nivel adaptativo no subía de 2), porque se
     re-rasteriza en cada cuadro; con capas el costo es nulo.) Siguen al cursor con un suavizado leve (τ = 45 ms, retraso de ≈ 37 ms·v) en su propio requestAnimationFrame, a la tasa de la pantalla aunque la simulación
     corra a 20 cuadros por segundo. dibujar() no pinta lo que cae fuera de la luz más un margen (36 px más 0,05 s de la velocidad del cursor, hasta 110 px; el recorte cubre la cápsula entre la luz y su objetivo), ni los
     rastros de la matriz, los trazadores, los granos de la arena ni los núcleos; las células se dibujan también afuera (así el piso de 0,05 es el rastro de toda la población), pero sin flagelo ni pilo. La simulación sigue entera en todo el fondo: las colonias evolucionan
     aunque no se las vea. Sin cursor, al cargar la luz nace sobre la colonia con el depredador (la más activa de las cinco iniciales) con un fundido de ≈ 1 s y, al primer movimiento del mouse, viaja suave hasta el cursor
     (τ = 0,4 s que baja a 45 ms en 1,2 s); si el cursor sale de la ventana (mouseleave, mouseout sin destino o blur) la luz queda donde estaba y se apaga en ≈ 3 s hasta el piso; al volver reaparece en ≈ 0,3 s y viaja
     hasta el cursor. La arena del cursor quieto nace justo donde está la luz. Calma, agitación del scroll, controles de cada relación y compuertas (sólo escritorio con puntero fino; con movimiento reducido el script no carga)
     no cambian. El velo bajo el texto (index.html) baja de 72 a 60 %: con el fondo apagado fuera de la luz sirve para que lo que pasa bajo el texto se vea dentro de ella, y el texto secundario conserva ≥ 5:1 con una célula debajo.

   La arena sólo en los márgenes y el scroll (040): la arena del cursor quieto nace únicamente si el cursor está en los márgenes laterales, fuera de la columna de texto (el contenido de .pagina: 184–1256 px a 1440), más ARENA_OV = 28 px hacia adentro
     (≈ un renglón de texto, 1,6 × 17 px): así se descubre al leer cerca del margen. Medido (arena40.js: fracción de los granos de la arena que cae bajo la máscara de los bloques con velo, que se extiende ≈ 1 celda, 22 px, más allá del texto): con el cursor
     a 40 px o más dentro del margen, 0 %; en el borde de la columna, 38 % (izquierda) y 28 % (derecha); a 10 px dentro, 53 % y 44 %; a 20–30 px dentro, 50–62 %, y desde ahí se queda en ≈ 61 % (la luz cubre entonces 42 % de texto). A 28 px entra algo más de la mitad
     de la arena bajo el texto (más tenue, ×0,55) y el resto en el margen. Sobre el texto la luz sigue igual: sólo deja de emanar nutriente. El scroll cuenta como movimiento: con el cursor quieto, desplazar la página más de TOL = 6 px lo deja sobre otro punto del
     documento, así que se rompe la quietud (la fuente que crecía se suelta, empieza a decaer, y se espera de nuevo ESPERA s para que nazca otra en la posición nueva, si el cursor está en un margen) y la luz se actualiza (sigue sobre el cursor y se enciende si estaba atenuada).

   La raíz y la rizosfera (040): ecología microbiana del suelo. Una raíz primaria fija a la pantalla, en el margen izquierdo y del alto de la ventana (el eje a 0,42 del margen, ≈ 77 px a 1440; el canvas de la silueta es sólo la franja del margen), con las zonas en orden desde la punta
     (px a 900 de alto; × alto/900): cofia (0–22, mucílago y células de borde), meristema (22–48), elongación (48–110), pelos radicales (110–280) y maduración (> 280, con las raíces laterales). Las laterales salen del periciclo (se dibuja su origen en el borde del cilindro vascular), 25° bajo la horizontal,
     se curvan hacia abajo y crecen con la edad del tejido ((s − 290)·0,35 px, más donde hay P), hasta donde cabe el margen. La raíz no está a escala de las bacterias (3 px/µm): una raíz real mide cientos de µm de diámetro (miles de px); aquí es un corte esquemático de ≈ 32 px de ancho con pelos
     de ≈ 37 px. La punta avanza RZ_V0 = 0,3 px/s (≈ 18 px por minuto, muy despacio) hasta 0,93 del alto. (041: ya no; toda la raíz se esconde fuera de la luz.) La silueta (contorno y relleno muy tenues) se dibujaba siempre, en un canvas propio sobre la tapa de la luz; el detalle (paredes de las células, cilindro vascular y xilema, pelos, mucílago, columela) se pinta
     en un canvas aparte que se copia al fondo y, como todo el fondo, sólo se ve bajo la luz. La geometría son cápsulas y pelos; la raíz es un obstáculo (las células no la atraviesan: se las saca por la normal y las nadadoras siguen por la superficie) y se reconstruye cada RZ_PAS = 3 px de crecimiento (silueta y detalle se dibujan en cuadros distintos).
     Interacciones raíz–bacteria:
       exudados (Bais et al. 2006, Annu. Rev. Plant Biol. 57:233; Jones, Nguyen y Finlay 2009, Plant Soil 321:5; McCully 1999, Annu. Rev. Plant Physiol. Plant Mol. Biol. 50:695): la raíz exuda carbono, más en la cofia (mucílago) y la elongación, menos en los pelos y poco en la zona madura, con otro máximo en la salida de cada lateral y en su punta.
         Dos formas: azúcares y aminoácidos a la grilla de nutriente c (AEC por unidad de exudación; sube el nutriente cerca de la raíz y atrae por quimiotaxis y adhesión: el efecto rizosfera de Hiltner 1904, en Hartmann et al. 2008, Plant Soil 312:7), y ácidos orgánicos (malato, citrato) en una grilla r de la misma resolución
         pero sólo de la franja de la raíz (GRR columnas; borde derecho abierto), que difunde como c, decae (DECR, la consumen los microbios) y sólo sigue y consume el especialista;
       colonización del rizoplano (Compant et al. 2010, Soil Biol. Biochem. 42:669): las nadadoras que tocan la superficie del cuerpo o de un pelo se adhieren con tasa KRZ × afinidad del morfotipo (AFIN: P 3, B 1, coco 0,5, espirilo 0,4, A 0,3) × lugar (más en las salidas de las laterales y en la punta, donde sale más exudado y hay mucílago) × (0,5 + 0,5·vecinas),
         y quedan orientadas a lo largo de la superficie o del pelo (la microcolonia crece en fila sobre la raíz);
       el especialista (P, tipo 5, EST 4: PGPR tipo Azospirillum, un bastón curvo con un flagelo polar; Okon y Labandera-Gonzalez 1994, Soil Biol. Biochem. 26:1591) está en un mutualismo con la raíz: sigue el exudado r por quimiotaxis (peso WRP), crece con él (MUR·r/(KR + r), su carbono; en c solo, μmax 0,35) y lo gasta (QR).
         A cambio promueve el crecimiento de la raíz (auxina: Spaepen, Vanderleyden y Remans 2007, FEMS Microbiol. Rev. 31:425): la punta avanza RZ_V0·(1 + 0,9·n/(n + 4)), con n las P adheridas a menos de 200 px de la punta, y donde hay P los pelos y las laterales crecen más (hasta +35 % y +50 %, local, por franjas de 30 px).
         Mínimo de P que nadan: PMIN = 3 (entran por el borde izquierdo); tope PMAX = 18; la depreda C como a A (peso 0,5);
       Ganchos para los hongos (041), que quedarán limitados a la rizosfera: la franja alrededor de la raíz (banda = largo de los pelos × 1,35 + 12 px ≈ 62 px desde la superficie) está en rizosfera(x, y) → {d, w, dentro, zona, punto, normal} y en la grilla RZB (grilla().rizosfera: 1 en la franja, cae a 0 en 1,2 × banda);
         rzCerca(x, y) entrega la distancia al cuerpo y a los pelos, el punto de contacto y la normal (lo que necesitan las hifas para adherirse a la epidermis y los pelos); RZS es el perfil de exudación y CR el exudado r; el tipo 6 y EST 5 quedan libres en las tablas.
     Población: la superficie de la raíz es un hábitat más, así que sus células (las adheridas a ella, RZc) no cuentan para el tope del nivel y tienen el suyo, RZ_MAXN = 12 / 30 / 45 / 55 por nivel (la superficie es finita: con ese número ya no se adhieren más ni dividen);
       el resto sigue con 60 / 120 / 140 / 160 como en la 039 (sin esto la raíz llegaba a ocupar 60–85 de las 160 plazas y las divisiones de toda la visita caían de 150 a 40 en 5 min; con 20 min, el depredador C se extinguía por falta de plazas para sus crías). NMAX pasa de 160 a 240.
     Medido (dens40b.js, colon40.js, esp40.js; 4–6 semillas, estado inicial avanzado, reloj de la calma y tiempo real para la raíz): densidad de células por 100 × 100 px a lo largo de la raíz (y de 40 a 520), con y sin raíz: 27 frente a 4,7 a 0–8 px de la superficie (× 5,7), 13 frente a 4,8 a 8–16 (× 2,7), 7,9 frente a 4,2 a 16–32 (× 1,9),
       2,8 frente a 1,7 a 32–64 y casi igual desde los 64 px (la franja de la rizosfera es de ≈ 62 px). El exudado r cae de 0,5 en la superficie a 0,2 a 64–128 px y a 0,03 a 128–256. El nutriente c no sube (0,51 frente a 0,60 junto a la raíz: las fuentes de fondo del margen ya lo dejan en ≈ 0,6 y las colonias lo consumen):
       el efecto rizosfera se ve en la densidad y en r, no en c. Colonización del rizoplano: 23 células a los 30 s, 40 a los 60 s y 55 (el tope) a los 90–150 s; por 100 px de superficie a los 300 s: elongación 4–6, pelos 2–3, zona madura 1,0–1,4, laterales 2,2 y 3,1–4,7 en las uniones de las laterales (≈ 3 veces la zona madura).
       El especialista: en 360 s la punta avanza 165 px con P y 110 sin ellas (+ 49 %); las laterales crecen + 27 % y el largo de los pelos + 4 %.
     Con raiz({activa:false}) no hay raíz, exudados, franja ni especialista (vuelve la partida de la 039: 62 nadadoras en vez de 54); raiz({especialista:false}) quita las P y no entran más.

   La luz más amplia, los márgenes y la raíz generada (041): tres cambios sobre la 039 y la 040 (los valores de la luz y del fondo fueron cambiados por la 042, más abajo).
     Luz: el diámetro pasa de 10 a 28 % del ancho (LUZ_FRAC = 0,14: radio 201,6 px y diámetro 403 px a 1440) para ver bien la interacción entre bacterias; sigue plena hasta el 35 % del radio y con caída suave, sin anillo.
     Opacidad por zona (LUZ_PISO = 0,2 y LUZ_COL = 0,25): la tapa deja el fondo al 20 % en los márgenes, a los lados de la columna de texto, de modo que las bacterias se ven ligeramente interactuando; sobre la columna
       (el contenido de .pagina, con una transición de 2·LUZ_BORDE = 24 px en sus bordes) dibujar() pinta los cuerpos con alfa × LUZ_COL, así que quedan al 5 % (0,2 × 0,25), el rastro de la 039; y la luz los revela
       (el factor sube de 0,25 a 1 entre 1 y 0,75 del radio, así que no hay un anillo). Medido (piso41.js, cuadro congelado, tinta con luz / tinta sin luz de cada cuerpo; 1440 y 1920, claro y oscuro): margen 0,19–0,20; columna 0,04–0,05; centro de la luz 1,00; entre 0,3 y 0,7 del radio 0,6–0,96.
       Fuera de la luz sólo se dibujan los cuerpos (sin flagelo ni pilo, matriz, trazadores, arena ni núcleos) y no los de las células de la raíz (RZc), que la delatarían; con la luz apagada (el cursor fuera de la ventana) tampoco hay detalle. Bajo la luz se ve todo:
       bacterias con flagelos, colonias, matriz, arena, raíz y rizoplano. La técnica de la 039 no cambió en la 041 (capas movidas sólo con transform y opacidad, ahora dos juegos (la tapa del fondo, sobre el canvas de las bacterias, y una segunda tapa para la raíz); la 042 la reemplazó.)
     La raíz se esconde entera: ya no hay silueta siempre visible. La raíz (primaria, laterales, cofias, pelos y paredes) se pinta una vez en su propio canvas fuera de pantalla (el de trabajo) y se publica a un canvas fijo que va por DEBAJO del de las bacterias y de
       la segunda tapa, que es casi opaca fuera del hueco (alfa 0,985 en la 041 y 0,995 desde la 042: con el fondo fuera de la luz al 40 %, la raíz queda detrás de dos tapas y sólo se le escapa (1 − 0,995)·(1 − 0,6) = 0,2 % de su contraste; hueco hasta el 82 % del radio; desde la 042 es un canvas de baja resolución sólo en la franja del margen izquierdo): la raíz sólo aparece bajo la luz y no cuesta nada por cuadro (la 040 copiaba su detalle al fondo en cada cuadro). Se redibuja sólo al crecer (cada 3 px de la punta).
       Queda centrada en el margen izquierdo (eje medio en colIzq/2: 20 px a 1024, 92 a 1440, 212 a 1920) y se regenera con la misma semilla al cambiar el ancho o el alto de la ventana.
     La raíz generada (puntas activas con tropismos; referencias citadas de memoria: Drew 1975, New Phytol. 75:479, sobre la proliferación de laterales en un parche rico en nutriente; Hodge 2004, New Phytol. 162:9, sobre el forrajeo de nutrientes; Eapen et al. 2005, Trends Plant Sci. 10:44, sobre los tropismos;
       Péret et al. 2009, Trends Plant Sci. 14:399, sobre las laterales y el periciclo): una semilla por carga (Math.random; ?semilla=N en la URL la reproduce, y raiz({semilla}) la cambia en vivo) y un generador mulberry32 propio. Al cargar se pre-simula fuera de pantalla hasta la punta de la 040 (0,64 del alto)
       y después sigue creciendo muy despacio. La primaria es una punta activa con ángulo, gravitropismo (restitución hacia abajo RZ_KG), serpenteo (ruido RZ_ST), quimiotropismo (dos sensores a ±0,8·RZ_PERC: se curva hacia el lado con más nutriente c; RZ_KC) y un resorte hacia el centro del margen (RZ_KR); no cruza la columna de texto.
       Las laterales NO salen de bifurcaciones de la punta: nacen del periciclo, detrás de ella (a RZ_SB = 290 px × alto/900, en la zona de maduración), una cada 62–116 px (menos donde hay más c) en orden acrópeto (las más viejas, arriba, son las más largas), y el lado se elige hacia el nutriente más rico (forrajeo).
       Cada lateral es una punta activa con su cofia: ángulo plagiotrópico (sale a 46–80° de la vertical y se cierra con el largo), gravitropismo débil, quimiotropismo propio, velocidad RZ_LV = 0,35 de la de la punta primaria × (1 + 0,5 del especialista) × (1 + 1,2 min(1, c/0,5)); se detiene en el borde del margen.
       La raíz no come bacterias: son ellas las que se acercan a sus exudados, como en la 040. El grosor de las laterales baja con el largo; pelos radicales sólo en su zona, y exudados, rizoplano, especialista y franja de la rizosfera (para los hongos) salen de la geometría generada.
       Medido (t41.js): 5 semillas dan 5 raíces distintas y la misma semilla la reproduce igual; 5,3 laterales por raíz, todas ≥ 290 px detrás de la punta y la más vieja es la más larga en el 85 % de los pares (por lado); con un parche de c a un lado (24 semillas × 2 lados) hay 75 laterales a la derecha frente a 33 con el parche a la izquierda.
       El especialista sigue funcionando (esp40.js: +50 % de avance de la punta y +52 % de crecimiento de las laterales en 360 s); la colonización del rizoplano llega al tope (55) a los 90–150 s y las salidas de las laterales concentran adhesiones.

   La luz más grande, perfectamente circular, con estela y más fondo visible fuera de ella (042); además, el gráfico ya no tiene panel opaco y la raíz queda centrada en su espacio.
     Luz: LUZ_FRAC = 0,325 (042 parte 3; en la parte 1 era 0,2425 y en la 041 0,14): diámetro 65 % del ancho = 936 px a 1440, 1248 px a 1920 y 666 px a 1024 (área ×1,8 sobre la parte 1 y ×5,4 sobre la 041). El borde difuso escala con el radio (plena hasta 0,35·r y smoothstep hasta r).
     Fondo fuera de la luz: LUZ_PISO = 0,4 (márgenes al 40 %, alfa de la tapa 0,6) y LUZ_COL = 0,375 (sobre la columna 0,4 × 0,375 = 15 %). Cada bloque de texto lleva su velo (--velo, el color de la página al 60 %): bajo el texto el rastro queda en ≈ 6 % y entre bloques en 15 %.
       Desde la parte 3 no hay ningún panel opaco detrás del gráfico (index.html: .serie .hoja sin fondo y sin la franja de 100 vw), así que su texto SVG también queda sobre el fondo al 15 %: ver el contraste medido en el README (contraste42.js incluye el texto de los gráficos).
     La estela: el campo de visión sigue activo después de que pasa el cursor. Si el cursor recorre el costado derecho, ese costado se mantiene iluminado LUZ_RET = 0,7 s y se apaga de forma continua (smoothstep) en LUZ_CAE = 0,8 s hasta el piso (1,5 s en total; 044: eran 2,0 + 1,5 = 3,5 s y se acortó para fomentar la interacción), en el orden en que pasó el cursor.
       Como la unión de dos huecos no se puede hacer apilando capas (la opacidad de dos tapas se multiplica: el hueco de una queda tapado por la otra), la tapa dejó de ser la de capas movidas con transform (039–041) y pasó a dos canvas de baja resolución (1 píxel por LUZ_ESC = 12 px, escalados con suavizado por el navegador, de modo que el
       borde sigue siendo difuso): cada cuadro de la luz se calcula el mapa I(x, y) = máximo de «sellos» (un círculo con el perfil de la luz: tabla analítica de 512 entradas en función de d², con peso 1 la cabeza y w(edad) cada punto del recorrido) y se escribe el alfa del fondo A0·(1 − I) con putImageData.
       La luz deja un sello cada LUZ_PASO_F·r = 0,22·r px del recorrido (≈ 103 px a 1440; con varios por cuadro si el cursor salta; hasta LUZ_NE = 96, descartados al apagarse), y con esa separación el festoneado de la unión es < 0,01 de alfa. dibujar() también usa los sellos: dibuja el detalle (flagelos, matriz, trazadores, arena)
       dentro de cada sello vivo más el margen, y el factor de la columna depende de I, así que el costado recorrido se ve con todo el detalle mientras dura la estela. La tapa de la raíz usa el mismo mapa con el perfil de la raíz (hueco hasta 0,82·r, alfa 0,995) pero sólo en la franja del margen izquierdo (x < colIzq): con la tapa de la raíz a ventana completa
       los fps de la simulación bajaban a 47–57 en el compositor por software. luz({estela:false}) quita la estela (luz().estela informa los sellos vivos y luz().costoMs el costo medio de cada cuadro de la luz en JS).
       Con 16 px por celda la circularidad empeoraba (desvío 0,013 de alfa por la interpolación bilineal en las diagonales); con 12 px queda en ≤ 0,008.
     La raíz centrada en su espacio (parte 3): el eje primario se centra en el punto medio entre el borde de la ventana y el de la columna (rz.x = colIzq/2, con colIzq medido del ancho de la ventana y recalculado en cada resize), y rzCentra() corrige el corrimiento del serpenteo moviendo el eje (y las laterales ya generadas)
       para que su media quede exactamente ahí. Medido (centro42.js): media del eje 52, 92 y 212 px a 1280, 1440 y 1920 px de ventana (mitad del margen: 52, 92 y 212); también a 1100 px (20) y tras cambiar el tamaño.
     Circularidad (circ42.js: fondo negro, contenido y canvas de las bacterias ocultos, así que el color de cada píxel es el alfa de la tapa; perfil radial del alfa de 0 a 1,3·r en las 8 direcciones de 45°; 5 tamaños de ventana —1024×700, 1025×701, 1440×900, 1920×1080 y 1337×811 a dpr 2—,
       la luz al centro, pegada a cada borde y a dos esquinas y en una posición fraccionaria): la tapa del fondo da un desvío máximo de 0,008 de alfa entre las 8 direcciones (2 niveles de 8 bits, ≈ 2,7 px de radio sobre un radio de 468 px) y, fuera del círculo, el alfa vale 0,600 en todos los píxeles
       (sin costuras, esquinas ni rayas), incluida la luz pegada a los bordes. Diámetro efectivo de la tapa del fondo (1024, 1440 y 1920 px): exterior 666, 936 y 1248 px; al 50 % del alfa 453, 636 y 849 px; llega al 99 % del alfa a 652, 917 y 1217 px.
     Costo (ms42.js, var42.js, adapt42.js; cursor en movimiento, nivel 3, máquina tranquila): ≈ 1,1–1,2 ms de JS por cuadro de la luz (con 23 sellos vivos; 0,2 ms sin estela); fps de la simulación 59,5–60 y nivel 3 que no baja (4 de 4 corridas, 1,55 ms por cuadro frente a 1,44 ms de la 041).

   La raíz por colonización del espacio (043): la generación de la 041 (una punta que sigue c) se reemplazó por el algoritmo de space colonization (Runions, Lane y Prusinkiewicz 2007, Eurographics Workshop on Natural Phenomena), adaptado a la biología:
     hay atractores de nutriente repartidos por el margen (RZ_DA = 1 por 2200 px² × (alto/900)²; más donde hay más c), y cada punta activa (la primaria y cada lateral) se orienta hacia el promedio de los que percibe a RZ_AM = 120 px × alto/900,
     delante de ella (cono: coseno > RZ_CONO) y que ninguna otra punta tiene más cerca (compiten); los alcanzados (RZ_AC = 8 px) se consumen. La primaria suma gravitropismo fuerte (RZ_GP) y las laterales siguen su ángulo plagiotrópico con los atractores
     pesando RZ_PAT = 1,4 veces. No se usó un quadtree: con ≈ 65 atractores y ≈ 10 puntas, el recorrido directo cuesta menos que reconstruirlo (la pre-simulación entera tarda ≈ 12 ms). Las laterales siguen naciendo sólo del periciclo, en la zona
     de maduración y en orden acrópeto, no de cualquier nodo como en el algoritmo original; el lado se elige hacia el c más rico y hacia donde quedan más atractores. La raíz no come bacterias: los atractores son nutriente del suelo.
     Fuente de nutriente: un racimo de RZ_NF = 22 atractores y un punto de exudación a la misma altura (RZ_YF = 27 % del alto) y a un ancho que cambia con la semilla (dentro de ±0,7 del semiancho del margen); raiz({fuente: 0–1}) lo fija (0 = a la izquierda,
     1 = a la derecha) y raiz().fuente informa su posición y la x del eje a esa altura. Medido (fuente43.js): con la fuente forzada, el eje en esa altura queda a +16, +6, −2, −10 y −21 px de la fuente para 0, .25, .5, .75 y 1 (el eje se curva ≈ la mitad
     del camino hacia ella); con 12 semillas libres la correlación entre la posición de la fuente y la del eje es 0,99 (el eje queda entre −23 y +17 px del centro).
     Más chica y corta: la escala de la raíz se multiplica por RZ_ESC = 0,7 (radio, zonas, pelos y laterales: ≈ 11 px de radio a 1440 en vez de 16), la punta parte en RZ_TIP0 = 42 % del alto (era 64 %) y crece hasta RZ_TIPMAX = 62 % (era 93 %).
     Los márgenes quedan libres de fondos: la barra de navegación y la franja oscura «Agentes de IA» sólo pintan su fondo sobre la columna (background-clip: content-box), de modo que el fondo vivo se ve a los lados (margen43.js: 0 de 38 400 puntos con fondo).
     La colisión de las células con la raíz revisa una segunda vez la salida (en el rincón entre una lateral y el eje una sola salida podía dejar a la célula dentro de la otra cápsula).
   La estela más corta y la raíz sólo si hay lugar (044): LUZ_RET = 0,7 s y LUZ_CAE = 0,8 s (1,5 s en total, eran 3,5 s) para que el rastro no se quede y el usuario tenga que seguir moviendo el cursor. La raíz sólo se genera si el margen izquierdo mide al menos RZ_COLMIN = 140 px
     (colIzq: ≈ 1366 px de ancho en adelante; a 1280 mide 104 y a 1024 mide 40, donde el radio quedaba en el mínimo de 4 px y la raíz era una raya) y la ventana al menos RZ_ALTOMIN = 480 px de alto. Si no cabe, rz.on = false: no hay geometría, ni exudado, ni especialista, ni colonistas (como raiz({activa:false})),
     y al cambiar el tamaño de la ventana rzEspacio() la quita o la vuelve a generar (con la misma semilla y sus colonistas). raiz({activa:true}) sólo la pide: aparece si cabe (raiz().pedida, .cabe y .espacio informan por qué no está).
   Raíz más realista (047): la cofia es un domo (una elipse, punta roma; antes una ojiva casi cónica) y el diámetro casi no cambia detrás de ella (rzR); las laterales mantienen su radio (rzRL; antes bajaba de .42 a .15 del radio de la primaria) y terminan en punta roma.
     Los pelos radicales ya no son iguales: cada uno nace a su propia distancia de la punta (z), crece en 54–94 px, tiene su curvatura y algunos quedan cortos; y las laterales también los tienen, más densos que la primaria (uno por lado cada 4 px de largo, RZ_PHL, de largo RZ_HL × el de la primaria), en su propia zona de diferenciación (desde 6–14 px de su punta, crecen en 28 px). Los pelos de las dos
     se juntan y se ordenan por la y de su base (rzPelo, rzBuild; la bisección de rzCerca usa ahora el alto vertical máximo de los pelos, rz.hv, porque los de las laterales pueden ir en vertical). Las paredes celulares son del tejido: una retícula fija en y, no se vuelven a sortear al crecer la punta (hU). El nematodo se dibuja más ancho y con el borde más grueso (fuera de la luz era una raya casi invisible) y el nivel 0 también tiene un eucariota (EU_CAPN = 1, 2, 4, 8).
   Eucariotas (045, ajustados en la 046): a las bacterias se suman flagelados heterótrofos, dinoflagelados, amebas, paramecios y euglenas (hasta 8 en el nivel 3, 4 en el 2, 2 en el 1 y ninguno en el 0; 047: 1 en el 0) y, muy de vez en cuando, un nematodo cerca de la punta de la raíz (el primero 12–22 s después de cargar; después, cada ≈ 185 s en promedio, mínimo 25 s desde que se fue el anterior).
     Es un módulo aparte (euPaso, euMover, euDibujar, nemPaso, nemDibujar), sin tocar los arreglos de las bacterias: los protistas depredan sobre ellas (las sacan con quitar()), se comen entre sí (dinoflagelado, ameba y paramecio comen flagelados y euglenas; el nematodo, a todos), huyen a ráfagas de sus depredadores, ganan energía con cada presa, se dividen
     al llegar al umbral (si hay lugar) o mueren de hambre (la euglena hace fotosíntesis), y cada presa digerida devuelve nutriente a la grilla CA (lazo microbiano). Las bacterias del rizoplano (RZc) están protegidas de los protistas; el nematodo las ramonea. 046: viven sobre todo en los márgenes (nacen ahí, entran por los bordes laterales y, si no cazan, se desvían hacia el margen más cercano),
     se dibujan ≈ 1,55 veces más oscuros que las bacterias (EU_AL) y con el núcleo, los flagelos y los cilios siempre visibles; el detalle fino sólo bajo la luz. Se dibujan en el mismo canvas que las bacterias (euDibujar al final de dibujar). Quimiotaxis.euca() informa y controla (activa, nematodo, agregar, reiniciar).
     Medido con t46.js: a los 10 y 20 s hay ≈ 5 protistas en los márgenes (la 045 publicada: 0,3 y 0,5) y su borde contrasta ≈ 80/255 contra el fondo (la 045: 50/255).
   El cursor repele levemente a las bacterias nadadoras (046; CUR_R = 75 px, CUR_V = 40 px/s en el centro, que cae con el cuadrado de la distancia: ≈ 18 px/s a 25 px y ≈ 4 px/s a 50 px) y no a los eucariotas: con el cursor quieto, la densidad de nadadoras a menos de 60 px baja ≈ 40 % (rep46.js). Quimiotaxis.repulsion({radio, fuerza}) lo ajusta (fuerza 0 lo apaga).
   La columna de texto ya no está centrada (046, index.html): del espacio que sobra a los lados, el 75 % va a la izquierda (--sesgo = .75): a 1440 px el margen izquierdo mide 256 px y el derecho 112 (antes 184 y 184), sin tocar el ancho del texto.
   Resumen de las relaciones (035–037), sus interruptores (para medir; todos encendidos por defecto) y sus controles:
     competencia r/K (A bacilo, B cocobacilo y cocos)    sin interruptor: es la cinética de cada morfotipo (tablas EST, MU, KS…); control: A y B sin las demás relaciones
     sintrofía A → B por p                                relaciones({subproducto:false})  (B sigue sintiendo la misma señal, con p = 0)
     depredación de C (tipo Bdellovibrio)                 relaciones({depredador:false})   (quita los C y no entran más)
     quorum sensing (q: matriz, protección, dispersión)   relaciones({quorum:false})       (q = 0, sin respuesta)
     mutualismo espirilo – B por m y f                    relaciones({mutualismo:false})   (m = f = 0)
     monocultivos                                         relaciones({excluir:[EST…]})    quita ese morfotipo (EST 0 A, 1 B, 2 espirilo, 3 C) y no vuelve a entrar
     medicion() entrega los contadores (ataques, lisis, dispersiones, crecimiento junto a la pareja o sin ella); grilla() entrega c, p, q, m y f; posiciones() entrega el morfotipo (estrategia),
     las infectadas y el quorum de cada célula. Esta es la última etapa planificada de las relaciones.

   API (window.Quimiotaxis), pensada para fuentes dinámicas (por ahora sin consumidores en el sitio; las fuentes agregadas se suman encima del presupuesto):
     agregar({id, x, y, a, s})  agrega una fuente que repone nutriente (x, y en px de la ventana; a amplitud; s ancho en px)
     mover(id, x, y)            cambia la posición de una fuente (puede llamarse en cada cuadro)
     quitar(id)                 la elimina
     fuentes                    arreglo vivo de fuentes
     usarCampo(fn)              reemplaza lo que lee la quimiotaxis: fn(x, y, fuentes) → concentración ≥ 0 (la grilla sigue
                                existiendo: es lo que se consume y donde se adhieren y crecen las células)
     opacidad(f)                factor sobre la opacidad de cada forma (1 por defecto)
     nivel(k) / estado()        diagnóstico y fijar el nivel de calidad (para medir); posiciones() copia las posiciones;
     relaciones({subproducto, depredador, quorum, mutualismo, excluir})  enciende o apaga cada relación (controles de las mediciones); grilla() entrega también p, q, m y f; medicion() entrega los contadores de ataque y de quorum;
                                avanzar(seg, r) simula sin esperar (pruebas y videos; r = factor del reloj, 0,6 con la lectura en calma); flujo(x, y) lee la corriente
     arena({sobrelapamiento})   (040) dónde nace la arena del cursor quieto: márgenes y ARENA_OV px hacia el texto (sin argumentos sólo informa); estado().cursor trae también quietoS (s de quietud) y margen
     raiz({activa, especialista, punta, semilla, parche, fuente})  (040, 041, 043) la raíz: sin argumentos informa (semilla, eje, laterales con su base y su punta, zonas, colonización, velocidad de la punta); activa:false la quita con sus exudados y el especialista; especialista:false quita las P; punta fija la punta (fracción del alto);
                                semilla la regenera con esa semilla; parche:[{x, y, r, v}] suma nutriente c sólo mientras se genera (para medir el quimiotropismo)
     rizosfera(x, y)           (040) la franja de la rizosfera: {d, w, dentro, zona, punto, normal}; avanzar(seg, r, pared) con pared:true hace avanzar 1/30 s de tiempo real por paso aunque r < 1 (la raíz y el cursor usan el tiempo real)
     luz({activa, r, x, y, fija, estela})  la luz (039; estela:false quita la que deja el recorrido, 042): activa:false la apaga (el fondo se ve entero, como en la 038); r es el radio exterior en px (0 = 32,5 % del ancho, 042 p3); x, y la fijan (salta ahí y no sigue al cursor hasta fija:false); sin argumentos sólo informa
     reiniciar({avanzado})      vuelve al comienzo de una visita (avanzado:false = partida desde cero, como en la 037); movimiento(reset) entrega las corridas (duración y largo), los ángulos de tumbo, la velocidad propia media y los saltos del twitching
     parar()                    detiene y quita el canvas */
(function(){
  'use strict';
  if(window.Quimiotaxis) return;

  // Niveles de calidad (se adapta la calidad, no el tamaño de la población): cuadros por segundo, tope de población, choques,
  // trazadores, órbitas de Jeffery, matriz (EPS), granos de arena por fuente del cursor y cada cuántos cuadros se actualiza la grilla de nutriente.
  var NIVELES=[{fps:20,cap:60,choques:false,traz:0,jeffery:false,eps:false,texto:false,grilla:3,gr:100},{fps:30,cap:120,choques:false,traz:24,jeffery:true,eps:true,texto:true,grilla:1,gr:260},
               {fps:30,cap:140,choques:true,traz:40,jeffery:true,eps:true,texto:true,grilla:1,gr:340},{fps:60,cap:160,choques:true,traz:40,jeffery:true,eps:true,texto:true,grilla:1,gr:420}];
  // Por tipo: 0 coco, 1 bacilo, 2 espirilo, 3 cocobacilo (035), 4 vibrio depredador (036). Velocidad de nado (px/s) y radio de choque (px)
  var VEL=[0,25,38,20,35,30], RAD=[2.8,3.4,3.6,3.0,2.2,3.3];   // (038: la tasa de giros y su ángulo pasaron a LAMR, PAUSA y angTumbo(); ver «movimiento»)
  var ALFA=[.26,.37,.30,.33,.46,.40], ALFA_COLA=.40, ALFA_TRAZ=.14, ALFA_SES=1.3, GANA_CLARO=1.12, ALFA_EPS=[.07,.11,.16]; // opacidades (tinta del sitio); las adheridas, algo más; la matriz (EPS), muy tenue, en tres tramos de intensidad
  var PATRON=[1,3,1,0,1,3,2,1,3,1];  // de cada 10: 5 bacilos (A), 3 cocobacilos y 1 coco (B) y 1 espirilo (neutro)
  var TAU=.9, GAIN=[0,5,3.2,5,0,5], C0=.02, BRO=7, HUECO=.6, RIGIDEZ=.45, LMIN=.08, LMAX=5;
  var ETA=.55, KONDA=[0,.95,.698,.95,1.2,.8];  // propulsión: v = η·(ω/k); número de onda (rad/px) del flagelo del bacilo (λ 5 px) y del cuerpo del espirilo (λ 9 px)
  var FRENADA=.2, RELAJA=.35, LAMBDA_J=.9;  // tras un giro la velocidad cae al 20 % y se recupera en ≈ .35 s; Λ de Jeffery
  // Nutriente (c en [0, 1], por celda de la grilla): difusión (px²/s), reposición de las fuentes (1/s), constante de Monod, consumo por célula (1/s)
  var GX=64, GY=40, DIF=380, REPO=.2, DEC=.05, KM=.2, QNAD=.004;
  // Ciclo de vida: adhesión (tasa 1/s; el umbral de c es de cada morfotipo), crecimiento (1/s de biomasa a c saturante), dispersión (segundos de hambre, tasa 1/s), muerte
  var KADH=.25, GROW=1/15, THAMBRE=6, KDISP=1.2, KMUERTE=.012, CASCADA=4, VECINO=13;
  var SALIDA=.2, MUERTE_POBRE=.004, INMIG=.7, NSWIM=64;  // prob. de salir por un borde, muerte en medio pobre (1/s), entrada de nadadoras (1/s), nadadoras que se mantienen
  // Cursor como fuente: quietud (px y s), amplitud máxima, constantes de crecimiento y de decaimiento (s), tope de fuentes del cursor, piso de las de fondo, retorno (s)
  var TOL=6, ESPERA=1.5, AMAX=1.8, SIGMA=.78, TAUD=40, MAXC=3, PISO=.15, TAUR=20;
  // 033: emisión con forma de pulso. La tasa r(τ) = (τ/TP)^KP·e^(KP·(1−τ/TP)) (gamma normalizada a 1 en TP) sube, llega al máximo en TP y decae con cola;
  // lo depositado D = ∫r crece como una S. La fuente deposita en un montón M (M' = r − M/TAUL, TAUL = disolución lenta) y su amplitud es
  // a = AMAX·(1 − e^(−M/M0)): el montón sigue engordando después del máximo de la tasa. El nutriente disuelto también se extiende
  // (σ de la fuente en la grilla × (1 + HW·(1 − e^(−M/M0)))), que es lo que atrae a más y más bacterias de lejos; los granos (el núcleo) no se ensanchan. Consumo en el núcleo denso: factor 1/(1 + BLIND·c²).
  var TP=20, KP=2, TAUL=400, M0=8, BLIND=4, HW=.8;
  // 031: arena bajo el cursor quieto. σ de los granos (fracción del σ de la fuente), tope de granos (el mayor de NIVELES), tamaño (px), nivel de fondo de c (el que había en su celda al nacer la fuente),
  // umbral de c sobre ese fondo (mínimo y máximo, para que se vea un grano), alfa por tramo de concentración (tope en el centro) y bajo el texto (factor)
  var GSIG=.25, GMAX=420, GSZ0=1, GSZ1=1.6, GTH0=.002, GTH1=.75, ALFA_AR=[.2,.34,.45], ARENA_TXT=.55, ARENA_K=.3, GV0=2.5, GV1=5;
  // 034: el núcleo crece con lo depositado (σ de los granos × ρ(D), ρ = RHO0 + (RHO1 − RHO0)·√(D/DREF): el área sigue a la masa y avanza al ritmo del pulso) y se vuelve
  // una masa sólida: un cuerpo continuo e irregular (radio NUC_R σ, ×√ fracción de granos del centro que quedan) cuya opacidad sube con D hasta ALFA_NUC.
  var RHO0=.5, RHO1=1.7, DREF=36.9, NUC_R=1.15, ALFA_NUC=.3, SOL0=2, SOL1=26;  // GV: duración del viaje de cada grano (s)
  // 035: morfotipos. EST: 0 = A (estrategia r), 1 = B (K), 2 = neutro. Por tipo [coco, bacilo, espirilo, cocobacilo]:
  // μmax (crecimiento relativo a la 034), Ks (constante de Monod), consumo (por biomasa: A gasta ≈ el doble que B por lo que crece), umbral de c para adherirse,
  // prob. de adhesión (factor), umbral de hambre (c bajo el cual cuenta como hambre), umbral de muerte en medio pobre, matriz (EPS: factor de frecuencia).
  // 036: EST 3 = C (depredador); el tipo 4 no crece, no se adhiere ni come nutriente (valores de relleno).
  var EST=[1,0,2,1,3,4], MU=[.7,2,.4,.7,0,.35], KS=[.06,.45,.2,.06,1,.12], QS=[.17,.45,.28,.17,0,.2], CADT=[.28,.55,.45,.28,9,.95], KADT=[1.8,.7,1,1.8,0,1.2], CDT=[.05,.17,.12,.05,0,.06], CPOB=[.008,.02,.02,.008,0,.01], EPSK=[1.8,.7,1,1.8,1,1.6];
  // 035: subproducto (cross-feeding). p en la misma grilla: lo libera A al comer (FP por unidad de c consumida), difunde como c y decae (DECP, 1/s);
  // sólo B lo consume: crecimiento MUP·p/(KPS + p) (se suma al de c), gasto QP, y cuenta como alimento para adherirse y no pasar hambre (peso WP); los
  // cocobacilos lo siguen por quimiotaxis (peso WCB de c y WPB de p en la señal).
  // Espacio: las vecinas A adheridas frenan la adhesión de B (A, de crecimiento rápido, ocupa el espacio; B queda en torno a sus colonias): divide por 1 + NAK·(vecinas A)
  // Exceso de nutriente: B (K) se frena (crece y se adhiere menos) donde c es alto: divide por 1 + (c/KIB)²; así B no ocupa el núcleo rico del montón.
  var KIB=.5, NAK=1.5, FP=3, DECP=.06, MUP=2, KPS=.08, QP=.3, WP=1.2, WCB=.3, WPB=2.5;
  // 036: depredador C (tipo Bdellovibrio, tipo 4): vibrio de nado muy rápido que persigue presas (preferentemente B adherida en colonias densas), entra en una
  // presa, que deja de dividirse y se redondea (bdeloplasto); dentro, C crece LT s y se produce la lisis: la presa se rompe y libera 2 a 6 C (hasta CMAX en total)
  // y devuelve nutriente (LIBC por biomasa) y subproducto (LIBP) a las grillas. C muere de hambre tras CHAMBRE s sin presa; piso: si hay menos de CMIN, entra una por un borde (CIMM, 1/s).
  // Alcance de detección (px), giro de persecución (rad/s), ataque (1/s en contacto con una presa de peso 1), preferencia por presa (A, B, neutro; adherida en colonia
  // densa ×(.3 + .7·vecinas/6), nadando ×.22).
  var CRAD=90, CTURN=2.6, CATK=.72, PREF=[.35,1,.2,0,.5], LT=20, LTV=.4, LIBC=.35, LIBP=.25, CHAMBRE=100, CINI=3, CMIN=2, CMAX=8, CIMM=.05, CM0=.01, CEXP=2;  // 037: CM0 = mortalidad basal de C (1/s), CEXP = exponente de la dependencia de la densidad de las crías
  // 036: quorum sensing. Autoinductor q en una tercera grilla (la misma resolución; no se dibuja): lo producen las adheridas (PQ por s), difunde como c y decae (DECQ).
  // Respuesta local ql = smoothstep((a − Q0)/(Q1 − Q0)): más matriz (×(1 + QEPS·ql)), protección frente a C (el ataque se multiplica por 1 − QPROT·ql) y, con la señal
  // sostenida (ql > QSD durante TQ s), dispersión: las adheridas del borde de la colonia (≤ QNB vecinas) vuelven a nadar con tasa KQD.
  var PQ=.09, DECQ=.08, Q0=.3, Q1=.65, QEPS=2.5, QPROT=.9, QSD=.6, TQ=30, KQD=.05, QNB=6;
  // 037: mutualismo espirilo (N, tipo 2) – B, por dos grillas nuevas de la misma resolución (no se dibujan): m = carbono cedido por B (lo exuda en proporción a su biomasa: PM por s)
  // y f = factor de crecimiento del espirilo (tipo vitamina o sideróforo: lo produce el espirilo, PF por s). El espirilo es un auxótrofo parcial: con c solo crece a μmax = 0,4 (en la
  // 036 era 1,1) y m le suma μ = MUM·m/(KMM + m); gasta QMN. B multiplica su crecimiento por 1 + VBG·f/(KVF + f) y gasta QVF. m y f difunden como c y decaen (DECM, DECF).
  // Asociación espacial: ambos se siguen por quimiotaxis (el espirilo, a m: peso WMN; B suma f: peso WFB) y cuentan como alimento para adherirse (pesos WMA y WFA).
  // Con relaciones({mutualismo:false}) no se producen m ni f: cada uno queda como en la 036 salvo el espirilo, que no recibe el carbono de B.
  var PM=.2, PF=.5, DECM=.25, DECF=.25, MUM=.5, KMM=.06, QMN=.25, VBG=1.5, KVF=.05, QVF=.1, WMN=2.5, WFB=2.5, WMA=1.2, WFA=1.2, RP=28;
  // 038: movimiento. Escala: 3 px/µm (el bacilo de 8 px ≈ 2,7 µm) y un reloj 2,5 veces más lento que el del laboratorio: 1 µm/s ≈ 1,2 px/s y 1 s de laboratorio ≈ 2,5 s aquí (para que se lea con calma).
  // Run-and-tumble de A y B (E. coli: Berg y Brown 1972, nada a ≈ 20 µm/s, corre ≈ 0,9 s, tumba ≈ 0,14 s y gira en promedio 68° con sd 36°, distribución gamma; difusión rotacional ≈ 0,06 rad²/s):
  // aquí 25 px/s (≈ 21 µm/s), corridas de ≈ 2 s (≈ 50 px) que alargan o acortan la señal quimiotáctica, pausa de ≈ 0,35 s con giro gamma de forma 3,5 y escala 19,4° (GK, rad) y DRT = 0,025 rad²/s.
  // Espirilo, run-reverse (como Spirillum volutans, de tufos bipolares): corre, se detiene y se invierte (180° ± ≈ 30°) sin cambiar de eje. Vibrio (C), run-reverse-flick (V. alginolyticus, Xie et al. 2011; Bdellovibrio nada a 50–100 µm/s):
  // corre hacia adelante, se invierte (nada hacia atrás con el flagelo por delante, TREV s de media y VREV de la velocidad) y da un «flick» de ≈ 90° al retomar. ESTILO: 0 run-and-tumble, 1 run-reverse, 2 run-reverse-flick, −1 sin nado propio.
  var ESTILO=[-1,0,1,0,2,0], LAMR=[0,.5,.3,.4,.5,.4], PAUSA=[0,.35,.22,.4,.18,.3], DRT=[0,.025,.02,.03,.02,.025], TREV=1.1, VREV=.8, GK=.3386, FLICK=1.5708, REVR=.55;
  // 038: twitching. Las adheridas con pili tipo IV (bacilos y cocobacilos) se tiran sobre la superficie en saltos de ≈ 2 px (HOP s a VTW px/s) con esperas irregulares (media ESP_TW s) durante TW0–TW1 s, y después se fijan del todo;
  // con ≥ 4 vecinas adheridas se fijan de inmediato. PILO: largo (px) del pilo que se extiende antes de cada salto.
  var VTW=8, HOP=.28, ESP_TW=1.1, TW0=6, TW1=14, PILO=5;
  // 029: agitación del scroll (px/s de la onda, de la deriva, velocidad de scroll que la satura, decaimiento en s), calma (espera en s, factor, constante en s),
  // repulsión del texto (px/s por unidad de gradiente), tiempo de reconstrucción de la máscara (ms)
  var AGIT_O=16, AGIT_D=12, AGIT_V=2500, AGIT_T=1.6, CALMA_ESPERA=4, CALMA_F=.6, CALMA_T=1.5, REP_T=36, MASC_MS=250;
  var SEL_TEXTO='.hero .lugar,.hero h1,.hero .lede,.hero .acciones,.riel-top,.riel-meta,.intro,.estados,.lista,.problema,.grafico,.metodo,.con-que,.mas,.metricas,h3.titulo,.pie,.herr,.practicas,.ruta,.correo,.perfiles,.nota,.evidencia figcaption,footer .pagina';
  var CUR_R=75, CUR_V=40;   // 046: el cursor repele levemente a las bacterias nadadoras (no a los eucariotas): radio (px) y velocidad de empuje en el centro (px/s); el empuje cae con el cuadrado de la distancia
  var RESERVA=14, REFRACTARIA=20, NMAX=240, TMAX=40, GN=GX*GY;
  // 039: la luz (radio = LUZ_FRAC del ancho; plena hasta LUZ_R0 del radio; piso de alfa fuera; τ del seguimiento, del viaje y del fundido; margen del recorte)
  var LUZ_FRAC=.325, LUZ_R0=.35, LUZ_PISO=.4, LUZ_COL=.375, LUZ_RAIZ0=.82, LUZ_RAIZA=.995, LUZ_BORDE=12, LUZ_ESC=12, LUZ_RET=.7, LUZ_CAE=.8, LUZ_PASO_F=.22, LUZ_NE=96, LUZ_LUTN=512, LUZ_TAU=.045, LUZ_TAU_VIAJE=.4, LUZ_VIAJE_T=1.2, LUZ_TAU_ENTRA=.33, LUZ_TAU_VUELVE=.12, LUZ_TAU_SALE=.85, LUZ_MARGEN=36, LUZ_MARGEN_V=110, LUZ_MUESTRA=1;
  // 040: arena sólo en los márgenes (ARENA_OV = cuánto entra, hacia el texto, la zona donde nace) y la raíz: punta (px/s sin el especialista; +RZ_PG a plena colonización, con media saturación RZ_KP células P en la punta),
  // saturación del efecto local (RZ_KB), posición inicial y tope de la punta (fracción del alto), paso de reconstrucción (px), largo de los pelos (px, × escala) y su aumento local (RZ_HB), σ de la exudación (px).
  // Exudados: AEC = aporte a la grilla de nutriente c (sube el nutriente cerca de la raíz: el efecto rizosfera); r = exudado de la raíz (ácidos orgánicos), con reposición REPOR y decaimiento DECR (1/s), en una franja de GRR columnas.
  // Rizoplano: KRZ = tasa de adhesión al contacto (1/s) × afinidad por tipo (AFIN) × lugar (salidas de laterales y punta) × vecinas. P (PGPR tipo Azospirillum, tipo 5): crece con r (MUR, KR), lo gasta (QR), lo sigue (WRP); entran PIMM/s si hay menos de PMIN; tope PMAX.
  var ARENA_OV=28, GRR=40, RZ_V0=.3, RZ_PG=.9, RZ_KP=4, RZ_KB=2.5, RZ_COLMIN=130, RZ_ALTOMIN=480, RZ_TIP0=.42, RZ_TIPMAX=.62, RZ_ESC=.7, RZ_AM=120, RZ_AC=8, RZ_DA=2200, RZ_YF=.27, RZ_NF=22, RZ_CONO=.1, RZ_GP=.6, RZ_PAT=1.4, RZ_PAS=3, RZ_PS=3, RZ_LS=4, RZ_SB=290, RZ_LV=.35, RZ_LB=.5, RZ_LF=1.2, RZ_PERC=40, RZ_KG=.06, RZ_KC=.05, RZ_KR=.06, RZ_ST=.03, RZ_HAIR=30, RZ_RC=.92, RZ_HL=1, RZ_PHL=1, RZ_HB=.35, RZ_SIG=24, AEC=.45, REPOR=.35, DECR=.1,
      KRZ=.6, AFIN=[.5,.3,.4,1,0,3], MUR=.8, KR=.08, QR=.5, WRP=4, PMIN=3, PMAX=18, PIMM=.08,
      RZ_MAXN=[12,30,45,55];   // la superficie de la raíz es un hábitat más: sus células (adheridas con RZc) no cuentan para el tope del nivel (el resto sigue como en la 039) y tienen su propio tope por nivel (la superficie es finita)

  var cv=document.createElement('canvas'), ctx=cv.getContext('2d',{alpha:true});
  if(!ctx) return;
  cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;display:block';
  document.body.insertBefore(cv,document.body.firstChild);
  var raiz=document.documentElement;

  var W=0,H=0,dpr=1,hx=1,hy=1;
  var X=new Float32Array(NMAX), Y=new Float32Array(NMAX), TH=new Float32Array(NMAX), M=new Float32Array(NMAX), PH=new Float32Array(NMAX),
      SP=new Float32Array(NMAX), FI=new Float32Array(NMAX), BM=new Float32Array(NMAX), HM=new Float32Array(NMAX), T=new Uint8Array(NMAX), S=new Uint8Array(NMAX),
      NB=new Uint8Array(NMAX), NA=new Uint8Array(NMAX), IN=new Float32Array(NMAX), QL=new Float32Array(NMAX), QT=new Float32Array(NMAX), NP=new Uint8Array(NMAX), VX=new Float32Array(NMAX), VY=new Float32Array(NMAX), SZ=new Float32Array(NMAX), GR=new Float32Array(NMAX), ES=new Uint8Array(NMAX),
      RS=new Uint8Array(NMAX), RN=new Uint8Array(NMAX), RT=new Float32Array(NMAX), RD=new Float32Array(NMAX), RTM=new Float32Array(NMAX), RLN=new Float32Array(NMAX), TW=new Float32Array(NMAX), TWD=new Float32Array(NMAX), TWA=new Float32Array(NMAX), DX=new Float32Array(NMAX), DY=new Float32Array(NMAX), C2=new Float32Array(NMAX), S2=new Float32Array(NMAX), RZc=new Uint8Array(NMAX);
  // 034: matriz extracelular (EPS) como rastros cortos y alargados (ya no discos): un anillo de NE segmentos (x1, y1, x2, y2) con su intensidad y su
  // nacimiento (tiempo de la simulación). Se depositan a lo largo del eje de las adheridas (que en las colonias sigue el crecimiento radial y de la cadena),
  // en el eje de cada división y como rastro del deslizamiento de las nadadoras en zona de adhesión. Se desvanecen en EPS_VIDA s. Tamaño ≈ ⅓ de la 033.
  var NE=700, EPS_VIDA=45, EPS_L=7, EPS_T=3.5, EA=new Float32Array(NE*4), EW=new Float32Array(NE), EN=new Float32Array(NE), eneT=0;
  var ETM=new Float32Array(NMAX), LX=new Float32Array(NMAX), LY=new Float32Array(NMAX);
  function eps(x1,y1,x2,y2,w){ var o=eneT%NE, q=o*4; EA[q]=x1; EA[q+1]=y1; EA[q+2]=x2; EA[q+3]=y2; EW[o]=w>1?1:w; EN[o]=tiempo; eneT++; }
  var TX=new Float32Array(TMAX), TY=new Float32Array(TMAX), nt=0;
  var CA=new Float32Array(GN), CB=new Float32Array(GN), CP=new Float32Array(GN), CQ=new Float32Array(GN), CI=new Float32Array(GN), CJ=new Float32Array(GN), CK=new Float32Array(GN), CL=new Float32Array(GN), CF=new Float32Array(GN), CG=new Float32Array(GN), subp=true, mut=true, excl=[], depr=true, quor=true, SG=new Float32Array(GN), TXT=new Float32Array(GN), TXB=new Float32Array(GN), TXC=new Float32Array(GN), sucio=true, acum=0, cuadro=0;
  var n=0, nivel=0, raf=0, ultimo=0, vivo=true, tiempo=0, factor=1, colores=['','','','','',''], coloresS=['','','','','',''], bdel='', cola='', traza='', rgb='0,0,0', euF=1;
  var relojC=0, agit=0, empuje=0, tScroll=0, ritmo=1, ultScroll={y:0,t:0}, textoEls=[], tMasc=-1e9, cur=[], ptr={x:0,y:0,ok:false}, anc={x:0,y:0,t:0,sy:0}, creciendo=null, cid=0, ultHuella=-9, ev={adh:0,div:0,disp:0,hambre:0,pobre:0,sal:0,ent:0}, fuentes=[], campoFn=null, usuario=false, nNadan=0, nSesiles=0;
  // fuentes propias: fracción de la ventana (x, y), amplitud y ancho como fracción del alto; hacia los márgenes, para que las
  // colonias se vean sin pasar detrás del texto
  var base=[[.07,.30,1,.13],[.06,.72,.9,.12],[.94,.22,.9,.12],[.93,.62,1,.13],[.50,.93,.7,.12]];

  function normal(){ var u=1-Math.random(), v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185307*v); }

  // ---- El campo de nutriente: grilla gruesa con difusión, fuentes y consumo ----
  function huella(){ // perfil de las fuentes sobre la grilla (se recalcula cuando cambian las fuentes)
    var i, j, k, f, dx, dy, s, clave, ft, a, v;
    for(k=0;k<fuentes.length;k++){ // el perfil unitario de cada fuente se guarda y sólo se recalcula si cambian su posición o su ancho
      f=fuentes[k]; clave=f.x.toFixed(1)+'|'+f.y.toFixed(1)+'|'+f.s.toFixed(1);
      if(f.clave!==clave){
        ft=f.pie||(f.pie=new Float32Array(GN));
        for(j=0;j<GY;j++) for(i=0;i<GX;i++){ dx=(i+.5)*hx-f.x; dy=(j+.5)*hy-f.y; ft[j*GX+i]=Math.exp(-(dx*dx+dy*dy)/(2*f.s*f.s)); }
        f.clave=clave;
      }
    }
    for(i=0;i<GN;i++) SG[i]=0;
    for(k=0;k<fuentes.length;k++){ f=fuentes[k]; ft=f.pie; a=f.a; for(i=0;i<GN;i++) SG[i]+=a*ft[i]; }
    for(i=0;i<GN;i++) if(SG[i]>1.5) SG[i]=1.5;
    if(rz.on) for(i=0;i<GN;i++) if(RZS[i]>0){ SG[i]+=AEC*RZS[i]; if(SG[i]>1.5) SG[i]=1.5; }   // 040: la raíz exuda nutriente
    sucio=false;
  }
  function difundir(dt){
    var m=Math.max(1,Math.ceil(dt*DIF*(2/(hx*hx)+2/(hy*hy))/.8)), h=dt/m, ax=DIF*h/(hx*hx), ay=DIF*h/(hy*hy), r=REPO*h, de=DEC*h, dp=DECP*h, dq=DECQ*h, dm=DECM*h, df=DECF*h, s, i, j, k, a, c, t, u;
    if(sucio&&cuadro-ultHuella>=4){ huella(); ultHuella=cuadro; } // el perfil de las fuentes se recalcula cada 4 cuadros como máximo
    for(s=0;s<m;s++){
      for(j=0;j<GY;j++) for(i=0;i<GX;i++){
        k=j*GX+i; c=CA[k];
        a=c+ax*((i>0?CA[k-1]:c)+(i<GX-1?CA[k+1]:c)-2*c)+ay*((j>0?CA[k-GX]:c)+(j<GY-1?CA[k+GX]:c)-2*c)+r*SG[k]*(1-c)-de*c;
        CB[k]=a<0?0:a>1?1:a;
        c=CP[k]; // el subproducto p: misma difusión, sin fuentes (lo ponen las células), decae
        a=c+ax*((i>0?CP[k-1]:c)+(i<GX-1?CP[k+1]:c)-2*c)+ay*((j>0?CP[k-GX]:c)+(j<GY-1?CP[k+GX]:c)-2*c)-dp*c;
        CQ[k]=a<0?0:a>1?1:a;
        c=CI[k]; // el autoinductor del quorum sensing: lo ponen las adheridas, difunde y decae
        a=c+ax*((i>0?CI[k-1]:c)+(i<GX-1?CI[k+1]:c)-2*c)+ay*((j>0?CI[k-GX]:c)+(j<GY-1?CI[k+GX]:c)-2*c)-dq*c;
        CJ[k]=a<0?0:a>1?1:a;
        c=CK[k]; // m: el carbono que cede B al espirilo
        a=c+ax*((i>0?CK[k-1]:c)+(i<GX-1?CK[k+1]:c)-2*c)+ay*((j>0?CK[k-GX]:c)+(j<GY-1?CK[k+GX]:c)-2*c)-dm*c;
        CL[k]=a<0?0:a>1?1:a;
        c=CF[k]; // f: el factor de crecimiento que da el espirilo a B
        a=c+ax*((i>0?CF[k-1]:c)+(i<GX-1?CF[k+1]:c)-2*c)+ay*((j>0?CF[k-GX]:c)+(j<GY-1?CF[k+GX]:c)-2*c)-df*c;
        CG[k]=a<0?0:a>1?1:a;
      }
      t=CA; CA=CB; CB=t; t=CP; CP=CQ; CQ=t; t=CI; CI=CJ; CJ=t; t=CK; CK=CL; CL=t; t=CF; CF=CG; CG=t;
    }
    if(rz.on) difundirR(m,ax,ay,h);
  }
  function leer(x,y){ // interpolación bilineal de la grilla (los valores están en los centros de las celdas)
    var gx=x/hx-.5, gy=y/hy-.5, i=Math.floor(gx), j=Math.floor(gy), fx=gx-i, fy=gy-j, i1=i+1, j1=j+1;
    if(i<0){ i=0; fx=0; } if(j<0){ j=0; fy=0; } if(i1>GX-1) i1=GX-1; if(j1>GY-1) j1=GY-1; if(i>GX-1) i=GX-1; if(j>GY-1) j=GY-1;
    return (CA[j*GX+i]*(1-fx)+CA[j*GX+i1]*fx)*(1-fy)+(CA[j1*GX+i]*(1-fx)+CA[j1*GX+i1]*fx)*fy;
  }
  function leerP(x,y){ // lo mismo para el subproducto
    var gx=x/hx-.5, gy=y/hy-.5, i=Math.floor(gx), j=Math.floor(gy), fx=gx-i, fy=gy-j, i1=i+1, j1=j+1;
    if(i<0){ i=0; fx=0; } if(j<0){ j=0; fy=0; } if(i1>GX-1) i1=GX-1; if(j1>GY-1) j1=GY-1; if(i>GX-1) i=GX-1; if(j>GY-1) j=GY-1;
    return (CP[j*GX+i]*(1-fx)+CP[j*GX+i1]*fx)*(1-fy)+(CP[j1*GX+i]*(1-fx)+CP[j1*GX+i1]*fx)*fy;
  }
  function leerG(G,x,y){ // interpolación bilineal de una grilla extra (m o f)
    var gx=x/hx-.5, gy=y/hy-.5, i=Math.floor(gx), j=Math.floor(gy), fx=gx-i, fy=gy-j, i1=i+1, j1=j+1;
    if(i<0){ i=0; fx=0; } if(j<0){ j=0; fy=0; } if(i1>GX-1) i1=GX-1; if(j1>GY-1) j1=GY-1; if(i>GX-1) i=GX-1; if(j>GY-1) j=GY-1;
    return (G[j*GX+i]*(1-fx)+G[j*GX+i1]*fx)*(1-fy)+(G[j1*GX+i]*(1-fx)+G[j1*GX+i1]*fx)*fy;
  }
  function celda(x,y){ var i=(x/hx)|0, j=(y/hy)|0; i=i<0?0:i>GX-1?GX-1:i; j=j<0?0:j>GY-1?GY-1:j; return j*GX+i; }
  function campo(x,y){ return campoFn?campoFn(x,y,fuentes):leer(x,y); }
  function sentir(tp,x,y){ var e=EST[tp]; return e===1?WCB*campo(x,y)+WPB*leerP(x,y)+WFB*leerG(CF,x,y):e===2?WCB*campo(x,y)+WMN*leerG(CK,x,y):e===4?WCB*campo(x,y)+WRP*leerR(x,y):campo(x,y); } // lo que percibe la quimiotaxis: B sigue sobre todo el subproducto

  // La corriente: u = dψ/dy, v = −dψ/dx con ψ = Σ (a/k)·sen(kx·x + ky·y + φ). Sin divergencia. Tres ondas (longitud, dirección,
  // amplitud en px/s y periodo en s) que se desplazan despacio, así que el flujo cambia sin prisa. También calcula el gradiente
  // (ux, uy, vx, vy), que usan las órbitas de Jeffery.
  var ONDAS=[[620,.35,9,70],[430,1.75,7,45],[820,2.8,5,100],[260,1.1,0,3]].map(function(o,i){ var k=6.283185307/o[0]; return {kx:k*Math.cos(o[1]),ky:k*Math.sin(o[1]),k:k,a:o[2],w:6.283185307/o[3],f:i*2.1}; });
  var fu=0, fv=0, gux=0, guy=0, gvx=0;
  function flujo(x,y,t,grad){
    var i, o, c, s, p, q; fu=0; fv=0; gux=0; guy=0; gvx=0;
    for(i=0;i<ONDAS.length;i++){
      o=ONDAS[i]; p=o.kx*x+o.ky*y+o.f+o.w*t; c=o.a*Math.cos(p); q=o.ky/o.k; fu+=c*q; fv-=c*o.kx/o.k;
      if(grad){ s=o.a*Math.sin(p); gux-=s*q*o.kx; guy-=s*q*o.ky; gvx+=s*(o.kx/o.k)*o.kx; }
    }
    fv+=empuje; // el scroll empuja el medio (una deriva uniforme, sin divergencia)
  }

  function fuentesBase(){
    base.forEach(function(b,i){ fuentes.push({id:'base'+i,base:true,x:b[0]*W,y:b[1]*H,a:b[2],a0:b[2],s:b[3]*H}); });
  }

  function medir(){
    W=window.innerWidth; H=window.innerHeight; dpr=Math.min(window.devicePixelRatio||1,2); hx=W/GX; hy=H/GY;
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); luzRadio(); columna(); rzEspacio(); if(rz.H0) rzGeom(false);
    var fr=fuentes.filter(function(f){ return f.base; });
    if(!fr.length) fuentesBase(); else fr.forEach(function(f,i){ f.x=base[i][0]*W; f.y=base[i][1]*H; f.s=base[i][3]*H; });
    sucio=true;
  }

  function colorDeTinta(){
    // monocromo con la tinta del sitio; cada forma con su opacidad (se recalcula al cambiar de tema)
    var t=getComputedStyle(raiz).getPropertyValue('--ink').trim(), m=/^#([0-9a-f]{6})$/i.exec(t);
    if(m){ var v=parseInt(m[1],16); rgb=((v>>16)&255)+','+((v>>8)&255)+','+(v&255); }
    var lum=m?(((parseInt(m[1],16)>>16)&255)*.2126+((parseInt(m[1],16)>>8)&255)*.7152+(parseInt(m[1],16)&255)*.0722)/255:0, gc=lum<.5?GANA_CLARO:1, f=factor*gc;  // 038: sobre fondo claro la misma opacidad se lee menos (contraste 1,8–2,8:1 frente a 2,1–3,8:1 en oscuro); se compensa un 12 %
    for(var k=0;k<6;k++){ colores[k]='rgba('+rgb+','+Math.min(1,ALFA[k]*f).toFixed(3)+')'; coloresS[k]='rgba('+rgb+','+Math.min(1,ALFA[k]*ALFA_SES*f).toFixed(3)+')'; }
    if(luz.el) luzColor();
    euF=f; rz.gana=f; if(rz.cvR&&rz.nb) rzPintar();
    bdel='rgba('+rgb+','+Math.min(1,.62*f).toFixed(3)+')'; cola='rgba('+rgb+','+Math.min(1,ALFA_COLA*f).toFixed(3)+')'; traza='rgba('+rgb+','+Math.min(1,ALFA_TRAZ*factor).toFixed(3)+')';
  }

  // ---- Células ----
  function nueva(x,y,th,tp){
    var i=n++, u; T[i]=tp; X[i]=x; Y[i]=y; TH[i]=th; PH[i]=Math.random()*6.283185307; FI[i]=Math.random()*6.283185307; SP[i]=1; S[i]=0; BM[i]=1; HM[i]=0; NB[i]=0; NA[i]=0; NP[i]=0; IN[i]=0; QL[i]=0; QT[i]=0; ETM[i]=0; LX[i]=NaN; LY[i]=0; RZc[i]=0;
    SZ[i]=.88+.3*Math.random(); GR[i]=.75+.5*Math.random(); ES[i]=tp===0?(u=Math.random(),u<.3?1:u<.65?2:4):0; RS[i]=0; RN[i]=0; RT[i]=0; RD[i]=0; RTM[i]=0; RLN[i]=0; TW[i]=0; TWD[i]=0; TWA[i]=0; // tamaño y ritmo de crecimiento individuales; cocos: 1 diplococo, 2 estreptococo (cadena), 4 estafilococo (racimo)
    M[i]=Math.log(sentir(tp,x,y)+C0); return i;
  }
  function quitar(i){ // saca la célula i copiando la última en su lugar
    var u=--n; if(i===u) return;
    X[i]=X[u]; Y[i]=Y[u]; TH[i]=TH[u]; M[i]=M[u]; PH[i]=PH[u]; SP[i]=SP[u]; FI[i]=FI[u]; BM[i]=BM[u]; HM[i]=HM[u]; T[i]=T[u]; S[i]=S[u]; NB[i]=NB[u]; NA[i]=NA[u]; IN[i]=IN[u]; QL[i]=QL[u]; QT[i]=QT[u]; NP[i]=NP[u]; VX[i]=VX[u]; VY[i]=VY[u]; SZ[i]=SZ[u]; GR[i]=GR[u]; ES[i]=ES[u]; ETM[i]=ETM[u]; LX[i]=LX[u]; LY[i]=LY[u]; RS[i]=RS[u]; RN[i]=RN[u]; RT[i]=RT[u]; RD[i]=RD[u]; RTM[i]=RTM[u]; RLN[i]=RLN[u]; TW[i]=TW[u]; TWD[i]=TWD[u]; TWA[i]=TWA[u]; RZc[i]=RZc[u];
  }
  function entrante(){ // una nadadora entra por un borde, hacia adentro
    var lado=(Math.random()*4)|0, x, y, th;
    if(lado===0){ x=1; y=Math.random()*H; th=0; } else if(lado===1){ x=W-1; y=Math.random()*H; th=Math.PI; } else if(lado===2){ x=Math.random()*W; y=1; th=Math.PI/2; } else { x=Math.random()*W; y=H-1; th=-Math.PI/2; }
    var tp; do tp=PATRON[(Math.random()*PATRON.length)|0]; while(excl.indexOf(EST[tp])>=0);  // (excl: sólo para las mediciones de monocultivo)
    nueva(x,y,th+.7*normal(),tp);
  }
  function entranteC(){ // un depredador entra por un borde (el piso de la población de C)
    var lado=(Math.random()*4)|0, x, y, th;
    if(lado===0){ x=1; y=Math.random()*H; th=0; } else if(lado===1){ x=W-1; y=Math.random()*H; th=Math.PI; } else if(lado===2){ x=Math.random()*W; y=1; th=Math.PI/2; } else { x=Math.random()*W; y=H-1; th=-Math.PI/2; }
    nueva(x,y,th+.7*normal(),4);
  }
  function sembrar(k){ for(var i=0;i<k;i++) nueva(Math.random()*W,Math.random()*H,Math.random()*6.283185307,PATRON[i%PATRON.length]); if(depr) for(i=0;i<CINI;i++) nueva(Math.random()*W,Math.random()*H,Math.random()*6.283185307,4); }
  // ---- 038: estado inicial avanzado ----
  // En vez de partir de cero (las relaciones tardaban 8–15 min en verse), la visita empieza con cinco colonias ya formadas junto a las fuentes de fondo, cada una con la forma de su especie
  // (bacilos A: empalizada de filas paralelas; cocobacilos B: racimo compacto y redondo; cocos: cadena y racimo), un par espirilo–B asociado (mutualismo), un depredador C
  // que ronda una colonia B, un bdeloplasto ya a punto de lisis (con otra infección más tarde) y las grillas p, q, m y f con la señal que esas colonias habrían acumulado en ≈ 10 s.
  // Las colonias se ubican donde la máscara de los bloques de texto tiene menos cobertura. Todo sigue las mismas reglas que el resto (crece, se divide, se ataca, se dispersa).
  function cel(x,y,th,tp,bm){ var i=nueva(x,y,th,tp); S[i]=1; SP[i]=0; BM[i]=bm; return i; }
  function paliza(cx,cy,N,phi){ // bacilos en filas paralelas (empalizada): colonia alargada
    var rows=N>8?3:2, k=Math.ceil(N/rows), u=Math.cos(phi), w=Math.sin(phi), c=0, r, j, L, d;
    for(r=0;r<rows;r++) for(j=0;j<k&&c<N;j++){ L=(j-(k-1)/2)*8.9+(r%2?3:0)+1.2*normal(); d=(r-(rows-1)/2)*4.1+.5*normal(); cel(cx+u*L-w*d,cy+w*L+u*d,phi+.08*normal(),1,1+.3*Math.random()); c++; }
  }
  function racimo(cx,cy,N,tp,sp,es){ // espiral de Vogel: colonia redonda y compacta (cocobacilos: ejes radiales; cocos: estafilococos)
    var i, r, t, j, ph=6.283185307*Math.random();
    for(i=0;i<N;i++){ r=sp*Math.sqrt(i+.5); t=i*2.39996+ph; j=cel(cx+r*Math.cos(t),cy+r*Math.sin(t),tp===0?6.283185307*Math.random():t+.35*normal(),tp,1+.3*Math.random()); if(tp===0) ES[j]=es; }
  }
  function cadena(cx,cy,N,phi){ // estreptococos: cocos en fila, con una curvatura suave
    var x=cx-(N-1)*3.15*Math.cos(phi), y=cy-(N-1)*3.15*Math.sin(phi), i, j;
    for(i=0;i<N;i++){ j=cel(x,y,phi,0,1+.3*Math.random()); ES[j]=2; x+=6.3*Math.cos(phi); y+=6.3*Math.sin(phi); phi+=.2*normal(); }
  }
  function espiriloAl(cx,cy,R,ang){ var a=ang+.2*normal(); return cel(cx+(R+7)*Math.cos(a),cy+(R+7)*Math.sin(a),a+1.5708+.5*normal(),2,1+.4*Math.random()); } // espirilo adherido pegado a la colonia B
  function lugarLibre(cx,cy,rad){ // el punto cercano con menos texto encima (máscara TXT): las colonias no quedan bajo un bloque de texto
    var mejor=[cx,cy], bv=1e9, t, r, x, y, v, k;
    for(t=0;t<16;t++) for(r=0;r<=3;r++){ x=cx+Math.cos(t*.3927)*r*28; y=cy+Math.sin(t*.3927)*r*28; if(x<rad+4||x>W-rad-4||y<rad+4||y>H-rad-4) continue;
      v=TXT[celda(x,y)]+TXT[celda(x+rad,y)]+TXT[celda(x-rad,y)]+TXT[celda(x,y+rad)]+TXT[celda(x,y-rad)]+r*.02; if(v<bv){ bv=v; mejor=[x,y]; } }
    return mejor;
  }
  function calentar(seg){ // las grillas p, q, m y f parten con la señal que las colonias ya habrían acumulado (las células no se mueven)
    var s, dt=.25, i, k, e;
    for(s=0;s<seg/dt;s++){
      for(i=0;i<n;i++) if(S[i]){ k=celda(X[i],Y[i]); e=EST[T[i]];
        if(quor) CI[k]=Math.min(1,CI[k]+PQ*dt);
        if(mut){ if(e===1) CK[k]=Math.min(1,CK[k]+PM*BM[i]*dt); else if(e===2) CF[k]=Math.min(1,CF[k]+PF*dt); } }
      difundir(dt);
    }
  }
  function sembrarAvanzado(){
    var bs=fuentes.filter(function(f){ return f.base; }), pos=[], i, j, k, p, a, cx, cy, bmax, c2, ang, bi, b2, mejor, segundo;
    mascara();
    for(i=0;i<bs.length;i++) pos.push(lugarLibre(bs[i].x,bs[i].y,30));
    p=pos[0]; paliza(p[0],p[1],6,6.283185307*Math.random());                                                                                 // 1: bacilos (A) en empalizada
    p=pos[1]; racimo(p[0],p[1],11,3,3,0); espiriloAl(p[0],p[1],12,6.283185307*Math.random()); espiriloAl(p[0],p[1],12,6.283185307*Math.random()); // 2: cocobacilos (B), compactos, con dos espirilos asociados
    p=pos[2]; a=6.283185307*Math.random(); cadena(p[0],p[1]-14,7,a); racimo(p[0]+8,p[1]+16,5,0,3.4,4);                                          // 3: cocos: una cadena y un racimo
    p=pos[3]; racimo(p[0],p[1],12,3,3,0); cx=p[0]; cy=p[1];                                                                                    // 4: cocobacilos (B) con un depredador y un bdeloplasto
    p=pos[4]; paliza(p[0]-18,p[1],3,6.283185307*Math.random()); racimo(p[0]+16,p[1],5,3,3,0); espiriloAl(p[0]+16,p[1],8,3.1416);               // 5: A y B pequeñas juntas, con un espirilo
    for(i=0;i<(rz.on?54:62);i++) nueva(Math.random()*W,Math.random()*H,Math.random()*6.283185307,PATRON[i%PATRON.length]);                    // nadadoras (040: 8 menos si hay raíz, que trae sus colonistas)
    rzSembrar();
    if(depr&&n<NMAX-3) for(i=0;i<2;i++){ ang=6.283185307*Math.random(); j=nueva(cx+(70+30*Math.random())*Math.cos(ang),cy+(70+30*Math.random())*Math.sin(ang),ang+3.1416+.4*normal(),4); }
    luzFoco(cx+(depr&&j>=0?.3*(X[j]-cx):0),cy+(depr&&j>=0?.3*(Y[j]-cy):0));                                                                    // 039: la luz de la carga cae sobre la colonia con el depredador (la más activa), un poco hacia él
    vecinos(false); mejor=-1; segundo=-1;
    if(depr) for(i=0;i<n;i++){ if(!S[i]||T[i]!==3||(X[i]-cx)*(X[i]-cx)+(Y[i]-cy)*(Y[i]-cy)>40*40||NB[i]<3) continue; if(mejor<0||NB[i]>NB[mejor]){ segundo=mejor; mejor=i; } else if(segundo<0||NB[i]>NB[segundo]) segundo=i; }
    if(mejor>=0) IN[mejor]=7+4*Math.random(); if(segundo>=0) IN[segundo]=19+8*Math.random();                                                    // lisis hacia los 7–11 s y otra hacia los 19–27 s
    calentar(2);
  }
  function reiniciar(avanzado){ // vuelve al comienzo de una visita (al cargar y para las mediciones)
    var k;
    n=0; fuentes.length=0; cur.length=0; creciendo=null; fuentesBase(); CA.fill(0); CB.fill(0); CP.fill(0); CQ.fill(0); CI.fill(0); CJ.fill(0); CK.fill(0); CL.fill(0); CF.fill(0); CG.fill(0); CR.fill(0); CR2.fill(0); rz.hot.length=0; rz.lat.length=0; rz.hel.length=0; rz.H0=0; RZS.fill(0); huella(); for(k=0;k<GN;k++) CA[k]=Math.min(1,SG[k]*.8); rzGeom(true);   // (041b: el nutriente de partida existe antes de generar la raíz, que lo percibe)
    eneT=0; tiempo=0; relojC=0; acum=0; cuadro=0; sucio=true; ultHuella=-9; for(k in ev) ev[k]=0;
    huella(); for(k=0;k<GN;k++) CA[k]=Math.min(1,SG[k]*.8); difundir(2); if(rz.on) for(k=0;k<6;k++) difundir(1);   // 040: el exudado de la raíz parte en equilibrio
    if(avanzado) sembrarAvanzado(); else sembrar(90);
    euInicio();
    while(n>NIVELES[nivel].cap+RZ_MAXN[nivel]) quitar(n-1);
    nSesiles=0; nNadan=0; for(k=0;k<n;k++){ if(S[k]) nSesiles++; else if(T[k]!==4) nNadan++; }
    for(k in ev) ev[k]=0; mov.tw.saltos=0; mov.tw.dist=0; mov.tw.seg=0; mov.tw.fijadas=0;
  }
  function trazadores(k){ for(var i=nt;i<k;i++){ TX[i]=Math.random()*W; TY[i]=Math.random()*H; } nt=k; }

  var GIROS_DIV=[0,.3,-.3,.6,-.6,1,-1,1.57,-1.57,2.4,-2.4];
  function empujar(px,py,r,except){ // la célula que crece empuja a las vecinas que se le superponen (presión dentro de la colonia)
    var j, dx, dy, d, m, o;
    for(j=0;j<n;j++){ if(j===except[0]||j===except[1]) continue; dx=X[j]-px; dy=Y[j]-py; m=r+RAD[T[j]]*SZ[j]+HUECO*.5; d=dx*dx+dy*dy; if(d>=m*m) continue;
      d=Math.sqrt(d); if(d<.05){ dx=1; dy=0; d=1; } o=(m-d)*.8/d; X[j]+=dx*o; Y[j]+=dy*o; }
  }
  function dividir(i){ // división a lo largo del eje de la célula: la madre y la hija quedan donde terminan los dos lóbulos de la constricción
    if(n>=NMAX-2) return false;
    var k, a, j, ok, tp=T[i], r=RAD[tp]*SZ[i], md=2*r+HUECO+.3, h=md/2, ex, ey, x0=X[i], y0=Y[i], ax=TH[i];
    if(tp===3&&NB[i]>=2) ax=Math.atan2(VY[i],VX[i])+1.5708+.6*normal();   // cocobacilos (colonia compacta): la hija nace a lo largo del borde de la colonia (tangencial), no hacia afuera en una fila
    for(k=0;k<GIROS_DIV.length;k++){
      a=ax+GIROS_DIV[k];                                 // si el eje apunta a un borde de la ventana, se prueba con el eje girado
      ex=Math.cos(a); ey=Math.sin(a);
      ok=x0-ex*h>r&&x0+ex*h<W-r&&y0-ey*h>r&&y0+ey*h<H-r&&x0+ex*h>r&&x0-ex*h<W-r&&y0+ey*h>r&&y0-ey*h<H-r;
      if(ok){
        ev.div++; X[i]=x0-ex*h; Y[i]=y0-ey*h; TH[i]=a; if(NIVELES[nivel].eps) eps(x0-ex*(h+r+3),y0-ey*(h+r+3),x0+ex*(h+r+3),y0+ey*(h+r+3),1); // la matriz sigue el eje de la división
        j=nueva(x0+ex*h,y0+ey*h,a,tp); S[j]=1; SP[j]=0; RZc[j]=RZc[i]; FI[j]=FI[i]; BM[i]=1; BM[j]=1+.1*Math.random(); SZ[j]=Math.max(.85,Math.min(1.2,SZ[i]+.06*normal())); GR[j]=Math.max(.7,Math.min(1.3,GR[i]+.1*normal()));
        if(tp===0){ ES[j]=ES[i]; if(ES[i]===1){ ES[i]=3; ES[j]=3; } else if(ES[i]===4){ TH[i]=a+1.5708*(Math.random()<.5?-1:1)+.25*normal(); TH[j]=TH[i]+.25*normal(); } // diplococos: un solo par; estafilococos: cada división en un plano perpendicular a la anterior (racimo)
          else TH[j]=a+(Math.random()<.04?3.1416*Math.random():.2*normal()); }                                                                                         // estreptococos: la cadena sigue el mismo eje y se curva apenas (a veces se rompe)
        else TH[j]=tp===3?a+2.4*(Math.random()-.5):a+(tp===1||tp===5?.08:.3)*normal();           // bacilos: la hija en el mismo eje (empalizada); cocobacilos: eje al azar (colonia redonda)
        empujar(X[i],Y[i],r,[i,j]); empujar(X[j],Y[j],r,[i,j]);
        return true;
      }
    }
    return false;
  }

  // ---- El cursor como fuente de nutriente, con presupuesto finito ----
  function sref(){ return .125*H; }
  function peso(f){ var r=f.s/sref(); return f.a*r*r; } // caudal de una fuente (su aporte al presupuesto)
  function suelta(){ if(creciendo){ creciendo.crece=false; creciendo.sr=creciendo.s; creciendo=null; } }
  function alMover(e){
    if(e.pointerType==='touch') return;
    ptr.x=e.clientX; ptr.y=e.clientY; ptr.ok=true; luzSigue(ptr.x,ptr.y);
    var dx=ptr.x-anc.x, dy=ptr.y-anc.y;
    if(dx*dx+dy*dy>TOL*TOL){ anc.x=ptr.x; anc.y=ptr.y; anc.t=relojC; anc.sy=window.pageYOffset||0; suelta(); } // se movió más que el temblor: reinicia la espera y suelta la fuente
  }
  // Granos de la fuente: posiciones (en σ de los granos) con distribución radial gaussiana, de modo que el centro queda denso y el borde con granos sueltos.
  // Con semilla (mulberry32), así el montón es el mismo mientras vive la fuente. Cada grano trae su umbral de concentración, su puerta de crecimiento
  // (los del centro nacen antes), su duración de viaje y su tamaño.
  function granos(sem){
    var fo, g={f:[0,0,0],x:new Float32Array(GMAX),y:new Float32Array(GMAX),th:new Float32Array(GMAX),pu:new Float32Array(GMAX),d:new Float32Array(GMAX),sz:new Float32Array(GMAX),
           c0:new Float32Array(GMAX),ini:false,v:new Uint8Array(GMAX),tv:new Float32Array(GMAX)}, j, u, r, a, q, st=sem>>>0;
    function az(){ st=(st+0x6D2B79F5)>>>0; var t=st; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }
    for(j=0;j<3;j++) g.f[j]=6.283185307*az();
    for(j=0;j<GMAX;j++){
      u=az(); q=u<.999?u:.999; r=Math.sqrt(-2*Math.log(1-q)); if(r>2.6){ r=2.6; q=1-Math.exp(-r*r/2); } // radio (en σ) y su acumulada q
      a=6.283185307*az(); fo=1+.12*Math.sin(2*a+g.f[0])+.08*Math.sin(3*a+g.f[1])+.05*Math.sin(5*a+g.f[2]); g.x[j]=r*fo*Math.cos(a); g.y[j]=r*fo*Math.sin(a); // forma algo irregular, sin anillos
      g.pu[j]=.9*q; g.th[j]=GTH0+(GTH1-GTH0)*Math.pow(.15*az()+.85*q,1.6); g.d[j]=GV0+(GV1-GV0)*(.5*az()+.5*q); g.sz[j]=GSZ0+(GSZ1-GSZ0)*az();
    }
    return g;
  }
  function pesoAd(f){ var r=f.s/sref(); return f.ad*r*r; } // caudal deseado de una fuente del cursor
  function cursorPaso(dt){
    var i, f, bs=[], Bt=0, Ft=0, Ct=0, w, r, esc, tar, k, tom=[], e, u;
    if(ptr.ok&&!creciendo&&!document.hidden&&relojC-anc.t>=ESPERA&&enMargen(anc.x)){ // 2 s quieto: nace una fuente
      for(i=0,k=0;i<cur.length;i++) if(!cur[i].rapido) k++;                              // si ya hay MAXC, las más viejas se apagan antes (decaimiento rápido)
      for(i=0;i<cur.length&&k>=MAXC;i++) if(!cur[i].rapido){ cur[i].rapido=true; k--; }
      f={id:'cursor'+(cid++),cursor:true,x:anc.x,y:anc.y,a:0,ad:0,s:SIGMA*sref(),s0:SIGMA*sref(),t0:relojC,tf:0,crece:true,rapido:false,M:0,D:0,r:0};
      f.g=granos(f.id.length+cid*7919+1); fuentes.push(f); cur.push(f); creciendo=f;
    }
    for(i=cur.length-1;i>=0;i--){
      f=cur[i];
      if(f.crece){                                                                         // emisión en pulso: r sube, llega al máximo y decae; el montón M acumula
        u=(relojC-f.t0)/TP; f.r=Math.pow(u,KP)*Math.exp(KP*(1-u)); f.D+=f.r*dt; f.M+=(f.r-f.M/TAUL)*dt; if(f.M<0) f.M=0;
        u=1-Math.exp(-f.M/M0); f.ad=AMAX*u; f.s=f.s0*(1+HW*u);
      }
      else{
        f.tf+=dt; f.ad*=Math.exp(-dt/(f.rapido?4:TAUD)); f.s=f.sr*(1+.7*(1-Math.exp(-f.tf/30))); // se difumina: decae y se ensancha
        if(f.ad<.015){ k=fuentes.indexOf(f); if(k>=0) fuentes.splice(k,1); cur.splice(i,1); sucio=true; continue; }
      }
      tom.push(f);
    }
    for(i=0;i<fuentes.length;i++){ f=fuentes[i]; if(f.base){ bs.push(f); r=f.s/sref(); w=r*r; Bt+=f.a0*w; Ft+=PISO*f.a0*w; } }
    for(i=0;i<tom.length;i++) Ct+=pesoAd(tom[i]);
    k=Ct>Bt-Ft&&Ct>0?(Bt-Ft)/Ct:1; Ct*=k;                                                // el presupuesto no alcanza para más: se recorta todo por igual
    for(i=0;i<tom.length;i++) tom[i].a=tom[i].ad*k;
    esc=Bt>Ft?(Bt-Ct-Ft)/(Bt-Ft):1; esc=esc<0?0:esc>1?1:esc;
    for(i=0;i<bs.length;i++){ f=bs[i]; tar=f.a0*(PISO+(1-PISO)*esc);
      if(f.a>tar) f.a=tar; else f.a+=(tar-f.a)*(1-Math.exp(-dt/TAUR));                  // baja de inmediato (se la quitan), vuelve despacio
    }
    if(tom.length||bs.some(function(b){ return Math.abs(b.a-b.a0)>.002; })) sucio=true;
  }
  window.addEventListener('pointermove',alMover,{passive:true});
  function salida(){ ptr.ok=false; suelta(); luzSale(); }
  raiz.addEventListener('mouseleave',salida);
  document.addEventListener('mouseout',function(e){ if(!e.relatedTarget) salida(); });   // respaldo: el cursor sale de la ventana
  window.addEventListener('blur',salida);

  // ---- 039: la luz ----
  // El fondo sólo se ve alrededor del cursor, como el campo de un microscopio. Una tapa del color de la página (alfa 1 − LUZ_PISO, con un hueco de caída suave)
  // lo recorta: sigue al cursor a la tasa de la pantalla (su propio requestAnimationFrame, aunque la simulación corra a 20 cuadros por segundo)
  // y no cuesta nada del presupuesto del canvas. Además dibujar() no pinta lo que cae fuera de la luz (más un margen): la simulación sigue entera, las colonias
  // evolucionan donde no se las ve, y fuera sólo se pintan las células, sin flagelos (LUZ_MUESTRA = 1 de cada n), para el rastro. Diámetro = LUZ_FRAC·2 del ancho de la ventana (042: 48,5 %; en la 039 era 10 %).
  // Sin cursor (al cargar) la luz nace sobre la colonia más activa (fundido de ≈ 1 s) y al primer movimiento viaja hasta el cursor; si el cursor sale de la ventana
  // la luz se queda donde estaba y se apaga en ≈ 3 s hasta el piso.
  var luz={el:null,bg:'',activa:true,fija:false,estela:true,r:72,r2i:0,rEsp:0,x:0,y:0,tx:0,ty:0,pico:1,meta:1,viaje:0,visto:false,fuera:false,raf:0,ult:0,vel:0,ptT:0,ptX:0,ptY:0,foco:null,
           exc:-1e9,nt:0,ms:0,pasos:0,c:false,ch:false,wh:1,ns:0,ax:0,ay:0,bx:0,by:0,dx:0,dy:0,l2:0,R2:0,n:0,gw:0,gh:0,gw2:0,I:null,lut:null,lutR:null,
           sx:new Float32Array(LUZ_NE),sy:new Float32Array(LUZ_NE),st:new Float64Array(LUZ_NE),e0:0,en:0,lx:0,ly:0,lt:0,lok:false,
           qx:new Float32Array(LUZ_NE),qy:new Float32Array(LUZ_NE),qw:new Float32Array(LUZ_NE)};
  // 042: la tapa ya no son capas movidas con transform sino dos canvas de baja resolución (1 píxel por LUZ_ESC × LUZ_ESC px de la ventana, escalados por el navegador con suavizado) que se
  // rellenan con el alfa de la tapa en cada cuadro de la luz: A·(1 − I(x,y)), con I el máximo de los «sellos» (un círculo con el perfil de la luz: plena hasta LUZ_R0·r y smoothstep hasta r). Un sello es la cabeza
  // (en la posición suavizada del cursor, con peso (pico − piso)/(1 − piso)) o un punto del recorrido: la luz deja un sello cada LUZ_PASO_E px y cada uno se mantiene entero LUZ_RET s y después se apaga con un smoothstep en
  // LUZ_CAE s (la estela: el costado por donde pasó el cursor sigue iluminado un par de segundos). Con una tapa de capas no se podía: dos hoyos apilados se multiplican en vez de unirse (y la unión de hoyos es el máximo).
  // El perfil es analítico (tabla de 512 entradas en función de d²), así que el círculo es exacto a cualquier tamaño de ventana. La tapa de la raíz usa el mismo mapa I con otro perfil (hueco hasta LUZ_RAIZ0·r).
  function luzRadio(){
    var L=luz.el, k, N=LUZ_LUTN, dn, t, I, lo, hi, m, tr;
    luz.r=luz.rEsp>0?luz.rEsp:LUZ_FRAC*W; luz.r2i=1/(luz.r*luz.r);
    if(!luz.lut){ luz.lut=new Float32Array(N); luz.lutR=new Float32Array(256); }
    for(k=0;k<N;k++){ dn=Math.sqrt((k+.5)/N); t=(dn-LUZ_R0)/(1-LUZ_R0); t=t<0?0:t>1?1:t; luz.lut[k]=1-t*t*(3-2*t); }          // perfil del fondo: 1 hasta LUZ_R0·r y 1 − smoothstep hasta r
    for(k=0;k<256;k++){ I=k/255;                                                                                                // perfil de la raíz como función del mismo I (se invierte el del fondo): hueco hasta LUZ_RAIZ0·r
      if(I>=1){ luz.lutR[k]=1; continue; } if(I<=0){ luz.lutR[k]=0; continue; }
      lo=0; hi=1; for(m=0;m<30;m++){ t=(lo+hi)/2; if(1-t*t*(3-2*t)>I) lo=t; else hi=t; }
      dn=LUZ_R0+t*(1-LUZ_R0); tr=(dn-LUZ_RAIZ0)/(1-LUZ_RAIZ0); tr=tr<0?0:tr>1?1:tr; luz.lutR[k]=1-tr*tr*(3-2*tr); }
    if(!L) return;
    luzTapas();
  }
  function luzTapas(){ // tamaño de los dos canvas y de sus ImageData: la tapa del fondo cubre la ventana; la de la raíz sólo la franja del margen izquierdo (donde está la raíz: x < colIzq), que es ≈ 7 veces menos área que componer
    var L=luz.el, k, c, d, i, rgb3=luz.bg.split(','), gw;
    luz.gw=Math.ceil(W/LUZ_ESC)+1; luz.gh=Math.ceil(H/LUZ_ESC)+1; luz.gw2=Math.min(luz.gw,Math.ceil((colIzq+8)/LUZ_ESC)+1); luz.I=new Float32Array(luz.gw*luz.gh);
    for(k=0;k<2;k++){ c=L.cv[k]; gw=k?luz.gw2:luz.gw; c.width=gw; c.height=luz.gh; c.style.width=gw*LUZ_ESC+'px'; c.style.height=luz.gh*LUZ_ESC+'px';
      L.im[k]=L.cx[k].createImageData(gw,luz.gh); d=L.im[k].data; for(i=0;i<d.length;i+=4){ d[i]=+rgb3[0]; d[i+1]=+rgb3[1]; d[i+2]=+rgb3[2]; } }
  }
  function luzColor(){ // el color de la página (--bg) para la tapa; se recalcula con el tema
    var t=getComputedStyle(raiz).getPropertyValue('--bg').trim(), m=/^#([0-9a-f]{6})$/i.exec(t), v, c;
    if(m){ v=parseInt(m[1],16); c=((v>>16)&255)+','+((v>>8)&255)+','+(v&255); } else c='250,249,246';
    if(c===luz.bg) return; luz.bg=c; luzRadio(); luzEstilo();
  }
  function luzCrear(){ // dos tapas: la del fondo (encima del canvas de las bacterias) y la de la raíz (debajo de él, encima del canvas de la raíz); cada una es un div fijo con un canvas de baja resolución
    var L={cv:[],cx:[],im:[],caja:null,caja2:null}, k, c, d;
    for(k=0;k<2;k++){ d=document.createElement('div'); d.setAttribute('aria-hidden','true'); d.style.cssText='position:fixed;inset:0;z-index:-1;pointer-events:none;display:block;overflow:hidden';
      c=document.createElement('canvas'); c.style.cssText='position:absolute;left:0;top:0;pointer-events:none;image-rendering:auto'; d.appendChild(c); L.cv.push(c); L.cx.push(c.getContext('2d')); if(k) L.caja2=d; else L.caja=d; }
    cv.parentNode.insertBefore(L.caja2,cv); cv.parentNode.insertBefore(L.caja,cv.nextSibling); luz.el=L; luz.bg=''; luzColor();
  }
  function luzEstelas(now){ // sellos vivos (descarta los que ya se apagaron): llena qx, qy, qw (peso 1 durante LUZ_RET s y después 1 − smoothstep en LUZ_CAE s) y devuelve cuántos son
    var k, i, n=0, a, w, t, tot=LUZ_RET+LUZ_CAE;
    while(luz.en>0&&now-luz.st[luz.e0]>=tot){ luz.e0=(luz.e0+1)%LUZ_NE; luz.en--; }
    for(k=0;k<luz.en;k++){ i=(luz.e0+k)%LUZ_NE; a=now-luz.st[i]; if(a<=LUZ_RET) w=1; else { t=(a-LUZ_RET)/LUZ_CAE; w=1-t*t*(3-2*t); }
      luz.qx[n]=luz.sx[i]; luz.qy[n]=luz.sy[i]; luz.qw[n]=w; n++; }
    return n;
  }
  function luzSello(x,y,w){ // I = máx(I, w · perfil) en las celdas del mapa dentro del radio (por filas: sólo el tramo del círculo)
    var gw=luz.gw, gh=luz.gh, e=LUZ_ESC, gr=luz.r/e, cx=x/e-.5, cy=y/e-.5, j0=Math.max(0,Math.ceil(cy-gr)), j1=Math.min(gh-1,Math.floor(cy+gr)),
        I=luz.I, lut=luz.lut, k2=luz.r2i*e*e*LUZ_LUTN, N=LUZ_LUTN, i, j, dx, dy, h, i0, i1, d2, v, row, g2=gr*gr;
    for(j=j0;j<=j1;j++){ dy=j-cy; h=g2-dy*dy; if(h<=0) continue; h=Math.sqrt(h); i0=Math.max(0,Math.ceil(cx-h)); i1=Math.min(gw-1,Math.floor(cx+h)); row=j*gw;
      for(i=i0;i<=i1;i++){ dx=i-cx; d2=(dx*dx+dy*dy)*k2; if(d2>=N) continue; v=lut[d2|0]*w; if(v>I[row+i]) I[row+i]=v; } }
  }
  function luzEstilo(){ // redibuja las dos tapas: el mapa I (estela + cabeza) → alfa del fondo A0·(1 − I) y de la raíz A1·(1 − perfilRaíz(I))
    var L=luz.el, I=luz.I, n, k, p, v, d0, d1, A0=1-LUZ_PISO, A1=LUZ_RAIZA, lr=luz.lutR, ns, i, j, row, gw, gw2;
    if(!L) return;
    v=luz.activa&&cv.style.display!=='none'?'block':'none'; L.caja.style.display=v; L.caja2.style.display=v; if(rz.cvR) rz.cvR.style.display=cv.style.display==='none'?'none':'block'; if(!luz.activa) return;
    I.fill(0); ns=luzEstelas(performance.now()/1000);
    for(k=0;k<ns;k++) luzSello(luz.qx[k],luz.qy[k],luz.qw[k]);
    luz.wh=(luz.pico-LUZ_PISO)/(1-LUZ_PISO); luz.wh=luz.wh<0?0:luz.wh>1?1:luz.wh; if(luz.wh>.002) luzSello(luz.x,luz.y,luz.wh);
    if(luz.gw2!==Math.min(luz.gw,Math.ceil((colIzq+8)/LUZ_ESC)+1)) luzTapas();
    d0=L.im[0].data; d1=L.im[1].data; n=I.length; gw=luz.gw; gw2=luz.gw2;
    for(p=0,k=3;p<n;p++,k+=4){ v=I[p]; d0[k]=(A0*(1-v)*255+.5)|0; }
    for(j=0;j<luz.gh;j++){ row=j*gw; k=3+4*j*gw2; for(i=0;i<gw2;i++,k+=4){ v=I[row+i]; d1[k]=(A1*(1-lr[(v*255+.5)|0])*255+.5)|0; } }
    L.cx[0].putImageData(L.im[0],0,0); L.cx[1].putImageData(L.im[1],0,0);
    luz.n++;
  }
  function luzEstela(){ // 042: deja un sello cada LUZ_PASO_E px del recorrido de la luz (con varios por cuadro si el cursor saltó), con la hora a la que la luz pasó por ahí
    var now=performance.now()/1000, d, n, k, f, i, x0, y0, t0, pe;
    if(!luz.estela||luz.fija||!luz.activa||luz.wh<.5){ luz.lok=false; return; }
    if(!luz.lok){ luz.lx=luz.x; luz.ly=luz.y; luz.lt=now; luz.lok=true; return; }
    x0=luz.lx; y0=luz.ly; t0=luz.lt; d=Math.hypot(luz.x-x0,luz.y-y0); pe=Math.max(40,LUZ_PASO_F*luz.r); if(d<pe) return;
    n=Math.floor(d/pe);
    for(k=1;k<=n;k++){ f=k*pe/d; i=(luz.e0+luz.en)%LUZ_NE; luz.sx[i]=x0+(luz.x-x0)*f; luz.sy[i]=y0+(luz.y-y0)*f; luz.st[i]=t0+(now-t0)*f;
      if(luz.en<LUZ_NE) luz.en++; else luz.e0=(luz.e0+1)%LUZ_NE; }
    f=n*pe/d; luz.lx=x0+(luz.x-x0)*f; luz.ly=y0+(luz.y-y0)*f; luz.lt=t0+(now-t0)*f;
  }
  function luzPaso(ts){
    var dt=Math.min(.05,Math.max(.001,(ts-luz.ult)/1000)), tau, mov, ta, t0;
    luz.ult=ts;
    if(luz.viaje>0) luz.viaje=Math.max(0,luz.viaje-dt/LUZ_VIAJE_T);
    tau=LUZ_TAU+(LUZ_TAU_VIAJE-LUZ_TAU)*luz.viaje;
    luz.x+=(luz.tx-luz.x)*(1-Math.exp(-dt/tau)); luz.y+=(luz.ty-luz.y)*(1-Math.exp(-dt/tau));
    ta=luz.meta>luz.pico?(luz.visto&&!luz.fuera?LUZ_TAU_VUELVE:LUZ_TAU_ENTRA):LUZ_TAU_SALE; luz.pico+=(luz.meta-luz.pico)*(1-Math.exp(-dt/ta));
    mov=Math.abs(luz.tx-luz.x)+Math.abs(luz.ty-luz.y)>.2||Math.abs(luz.meta-luz.pico)>.002||luz.viaje>0;
    if(!mov){ luz.x=luz.tx; luz.y=luz.ty; luz.pico=luz.meta; }
    if(luz.ch){ ta=Math.sqrt(luzDist2(luz.x,luz.y))-(Math.sqrt(luz.R2)-luz.r); if(ta>luz.exc) luz.exc=ta; luz.nt++; }  // diagnóstico: cuánto se salió el disco de la luz de lo dibujado en el último cuadro (px; ≤ 0 = nada sin dibujar)
    t0=performance.now(); luz.wh=(luz.pico-LUZ_PISO)/(1-LUZ_PISO); luzEstela(); luzEstilo(); luz.ms+=performance.now()-t0; luz.pasos++; if(mov||luz.en>0) luz.raf=requestAnimationFrame(luzPaso); else luz.raf=0;
  }
  function luzMueve(){ if(!luz.raf){ luz.ult=performance.now(); luz.raf=requestAnimationFrame(luzPaso); } }
  function luzSigue(x,y){
    var t=performance.now(), dt=(t-luz.ptT)/1000;
    if(dt>0&&dt<.25&&luz.ptT){ luz.vel+=(Math.hypot(x-luz.ptX,y-luz.ptY)/dt-luz.vel)*.4; } else luz.vel=0;
    luz.ptT=t; luz.ptX=x; luz.ptY=y;
    if(luz.fija) return;
    if(!luz.visto||luz.fuera||luz.pico<.5) luz.viaje=1;                      // el primer movimiento, o la vuelta a la ventana: la luz viaja suave hasta el cursor
    luz.visto=true; luz.fuera=false; luz.tx=x; luz.ty=y; luz.meta=1; luzMueve();
  }
  function luzSale(){ if(luz.fija) return; luz.fuera=true; luz.meta=LUZ_PISO; luz.vel=0; luzMueve(); }  // la luz queda donde estaba y se apaga
  function luzFoco(cx,cy){ luz.foco={x:cx,y:cy}; if(!luz.visto&&!luz.fija){ luz.x=luz.tx=cx; luz.y=luz.ty=cy; luz.pico=LUZ_PISO; luz.meta=1; luzEstilo(); luzMueve(); } }
  function luzPrep(){ // recorte de dibujar(): la cápsula entre la luz y su objetivo y los sellos de la estela, más el radio exterior y un margen (la simulación se dibuja a menos cuadros que la tapa)
    var m, R;
    luz.ch=luz.activa&&luz.pico>LUZ_PISO+.02; luz.wh=(luz.pico-LUZ_PISO)/(1-LUZ_PISO); luz.wh=luz.wh<0?0:luz.wh>1?1:luz.wh;
    luz.ns=luz.activa?luzEstelas(performance.now()/1000):0;
    luz.c=luz.ch||luz.ns>0;
    if(!luz.c) return false;
    if(luz.ch){ m=LUZ_MARGEN+Math.min(LUZ_MARGEN_V,luz.vel*.05); R=luz.r+m; luz.R2=R*R;
      luz.ax=luz.x; luz.ay=luz.y; luz.bx=luz.tx; luz.by=luz.ty; luz.dx=luz.bx-luz.ax; luz.dy=luz.by-luz.ay; luz.l2=luz.dx*luz.dx+luz.dy*luz.dy; }
    return true;
  }
  function luzDist2(x,y){
    var px=x-luz.ax, py=y-luz.ay, t=luz.l2>.01?(px*luz.dx+py*luz.dy)/luz.l2:0;
    if(t<0) t=0; else if(t>1) t=1; px-=t*luz.dx; py-=t*luz.dy; return px*px+py*py;
  }
  function enLuz(x,y){
    var k, dx, dy, Rt=luz.r+LUZ_MARGEN;
    if(luz.ch&&luzDist2(x,y)<luz.R2) return true;
    Rt*=Rt; for(k=0;k<luz.ns;k++){ if(luz.qw[k]<.05) continue; dx=x-luz.qx[k]; dy=y-luz.qy[k]; if(dx*dx+dy*dy<Rt) return true; }
    return false;
  }
  function fuera(x,y){ return luz.activa&&(!luz.c||!enLuz(x,y)); }       // 041: con la luz apagada no se dibuja el detalle (los márgenes sólo dejan ver los cuerpos de las células)
  function luzI(x,y){ // 042: la intensidad de la luz en un punto (0..1): el máximo de la cabeza (cápsula hasta el objetivo) y de los sellos de la estela, con el mismo perfil que la tapa
    var v=0, k, d2, u, r2=luz.r*luz.r, N=LUZ_LUTN, lut=luz.lut, k2=luz.r2i*N;
    if(luz.ch){ d2=luzDist2(x,y); if(d2<r2){ v=lut[(d2*k2)|0]*luz.wh; } }
    for(k=0;k<luz.ns;k++){ d2=(x-luz.qx[k])*(x-luz.qx[k])+(y-luz.qy[k])*(y-luz.qy[k]); if(d2<r2){ u=lut[(d2*k2)|0]*luz.qw[k]; if(u>v) v=u; } }
    return v;
  }
  function colF(x){ // 041: 1 en los márgenes, 0 en la columna de texto (con una transición de 2·LUZ_BORDE px en sus bordes)
    var u=(x-(colIzq-LUZ_BORDE))/(2*LUZ_BORDE), v=((colDer+LUZ_BORDE)-x)/(2*LUZ_BORDE);
    u=v<u?v:u; if(u<=0) return 0; if(u>=1) return 1; return u*u*(3-2*u);
  }


  // ---- 040: la raíz (rizosfera) ----
  // Una raíz primaria fija a la pantalla, en el margen izquierdo y del alto de la ventana, con las zonas en orden desde la punta (distancias en px, × hz = alto/900): cofia (0–22), meristema (22–48),
  // elongación (48–110), pelos radicales (110–280) y maduración (> 280, con raíces laterales que salen del periciclo). No está a escala de las bacterias (3 px/µm): una raíz real mide cientos de µm de
  // diámetro (miles de px); aquí es un corte esquemático de ≈ 26 px de ancho, y los pelos de ≈ 40 px. La punta avanza RZ_V0 px/s (muy despacio) y algo más donde el especialista (P) la coloniza.
  // (041: la raíz entera —silueta y detalle— va en su propio canvas, bajo la segunda tapa de la luz, y sólo se ve bajo la luz.) La geometría son cápsulas (RB: x1, y1, x2, y2, r) y
  // pelos (RH: x1, y1, x2, y2); rzCerca() da la distancia a la superficie, la normal y el punto de contacto, y es lo único que usan el choque, la adhesión y (041) los hongos.
  var colIzq=0, colDer=0, nPc=0, nPn=0, nPs=0, nPsn=0, nRz=0, nRzn=0, oX=0, oY=0, qx_=0, qy_=0, bD=1e9, bX=0, bY=0, bNx=1, bNy=0, bK=-1, hD=1e9, hX=0, hY=0, hK=-1;
  var RB=new Float32Array(5*460), RH=new Float32Array(4*720), RHC=new Float32Array(720), HK=new Float32Array(5*720), HI=new Int32Array(720), CR=new Float32Array(GY*GRR), CR2=new Float32Array(GY*GRR), RZS=new Float32Array(GN), RZB=new Float32Array(GN);
  var rz={on:true,pide:true,esp:true,sc:1,hz:1,x:0,rr:13,tipY:0,v:0,nb:0,nbCuerpo:0,nh:0,hmax:0,xmax:0,ncr:6,ph:0,ph2:0,H0:0,lat:[],latN:0,hv:0,nhPri:0,nhLat:0,hel:[],hot:[],pend:0,tCol:0,cvR:null,cxR:null,tmp:null,cxT:null,cache:null,cxC:null,anchoD:0,
          pTip:0,nP:0,nCol:0,nColP:0,colBin:null,banda:60,gana:1,reb:0,fase:0,pri:null,priN:0,th:0,hw:60,xl:4,xr:150,nextPY:0,s:1,sem:0,W0:0,col0:0,
          ax:null,ay:null,av:null,na:0,am:120,ac:8,fuente:null,fuenteF:null};
  var rzMx=0, rzMy=0, rzMn=0;
  function columna(){ // los márgenes laterales: la columna de texto es el contenido de .pagina (la arena sólo nace fuera, más ARENA_OV hacia adentro)
    var els=document.querySelectorAll('.pagina'), a=1e9, b=-1e9, k, r, cs;
    for(k=0;k<els.length;k++){ r=els[k].getBoundingClientRect(); cs=getComputedStyle(els[k]); a=Math.min(a,r.left+(parseFloat(cs.paddingLeft)||0)); b=Math.max(b,r.right-(parseFloat(cs.paddingRight)||0)); }
    if(!(b>a)){ a=.12*W; b=.88*W; } colIzq=a; colDer=b;
  }
  function rzCabe(){ return colIzq>=RZ_COLMIN&&H>=RZ_ALTOMIN; }   // 044: la raíz sólo existe si el margen izquierdo tiene el ancho y la ventana el alto que necesita (si no, ni se genera ni exuda ni trae colonistas)
  function rzEspacio(){ // 044: reconcilia rz.on con el espacio disponible (lo pedido por el usuario con raiz({activa}) y que quepa); devuelve true si cambió
    var on=rz.pide&&rzCabe(), k;
    if(on===rz.on) return false;
    rz.on=on;
    if(!on){ for(k=n-1;k>=0;k--) if(T[k]===5) quitar(k); for(k=0;k<n;k++) RZc[k]=0; CR.fill(0); rz.nP=0; rz.nCol=0; rz.nColP=0; rz.pTip=0; }   // (los contadores de la raíz sólo se recalculan con ella activa: quedarían con los de la última vez)
    else if(n>0){ rz.H0=0; rzGeom(true); rzSembrar(); }                                 // vuelve a haber lugar (al agrandar la ventana): se genera de nuevo, con sus colonistas
    sucio=true; return true;
  }
  function enMargen(x){ return x<colIzq+ARENA_OV||x>colDer-ARENA_OV; }
  function rzXc(y){ // x del eje primario a la altura y (el eje se guarda cada RZ_PS px de y)
    var k=y/RZ_PS, i=k|0, a;
    if(k<=0) return rz.pri[0]; if(i>=rz.priN-1) return rz.pri[rz.priN-1];
    a=rz.pri[i]; return a+(rz.pri[i+1]-a)*(k-i);
  }
  // 041b: la raíz se genera con un algoritmo de puntas activas con tropismos (una semilla por carga o ?semilla=). Cada punta tiene posición, ángulo, velocidad y grosor: la primaria sigue el gravitropismo (hacia abajo),
  // serpentea (ruido), se curva suave hacia el lado más rico en nutriente c dentro de un radio de percepción (quimiotropismo, forrajeo) y un resorte la mantiene en el centro del margen. Las laterales NO salen de bifurcaciones
  // de la punta: nacen del periciclo, detrás de la punta (a RZ_SB·hz px, en la zona de maduración), en orden acrópeto (las más viejas, arriba, son las más largas); son puntas activas con gravitropismo débil
  // (ángulo plagiotrópico que se va cerrando) y su cofia; crecen más rápido donde hay más c y donde el especialista coloniza, y nacen más seguido hacia el lado rico. La raíz no come bacterias: son ellas las que se
  // acercan a sus exudados.
  function rzC(x,y){ return leer(x<0?0:x>W?W:x,y<0?0:y>H?H:y); }   // el nutriente c que percibe la raíz (leer() no admite puntos muy fuera de la ventana)
  function rzU(){ var t=(rz.s=(rz.s+0x6D2B79F5)|0); t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }   // mulberry32 (la semilla vive en rz.s)
  function rzN(){ return Math.sqrt(-2*Math.log(1-rzU()))*Math.cos(6.283185307*rzU()); }
  // 043: la raíz crece por colonización del espacio (space colonization: Runions, Lane y Prusinkiewicz 2007, Eurographics Workshop on Natural Phenomena; adaptada): hay atractores de nutriente repartidos en el margen (más donde hay más c) y cada punta activa
  // —la de la primaria y la de cada lateral— se orienta hacia el promedio de los atractores que percibe dentro de RZ_AM px, delante de ella (un cono) y que ninguna otra punta tiene más cerca (compiten); los atractores
  // que alcanza se consumen (se agota el nutriente). La primaria suma gravitropismo fuerte (RZ_GP); las laterales siguen su ángulo plagiotrópico y los atractores pesan RZ_PAT veces más. Las laterales no salen de cualquier
  // nodo, como en el algoritmo original: sólo del periciclo, en la zona de maduración, en orden acrópeto. Hay además una fuente de nutriente (rz.fuente) a la misma altura (RZ_YF · alto) y a un ancho distinto en cada
  // carga: un racimo de RZ_NF atractores y un punto de exudación, para que cada raíz se curve distinto. La estructura de datos (eje rz.pri y laterales rz.lat) es la de la 041: el resto (cuerpo, pelos, colonización) no cambia.
  function rzAtrae(x,y,hx_,hy_,yo){ // suma los vectores unitarios hacia los atractores que ve la punta (x, y) con rumbo (hx_, hy_); yo: su lateral (null: la primaria). Deja la suma en rzMx, rzMy y la cuenta en rzMn
    var k, q, la, t, d2, d, ux, uy, dx, dy, tx, ty, ok, am2=rz.am*rz.am, ax=rz.ax, ay=rz.ay, av=rz.av, na=rz.na, lat=rz.lat, nl=lat.length, px=rz.pri[rz.priN-1], py=(rz.priN-1)*RZ_PS;
    rzMx=0; rzMy=0; rzMn=0;
    for(k=0;k<na;k++){ if(!av[k]) continue; dx=ax[k]-x; dy=ay[k]-y; d2=dx*dx+dy*dy; if(d2>am2||d2<1e-6) continue; d=Math.sqrt(d2); ux=dx/d; uy=dy/d; if(ux*hx_+uy*hy_<RZ_CONO) continue;
      ok=true;
      if(yo){ tx=px-ax[k]; ty=py-ay[k]; if(tx*tx+ty*ty<d2) ok=false; }
      for(q=0;ok&&q<nl;q++){ la=lat[q]; if(la===yo||!la.vivo) continue; t=la.pts; tx=t[t.length-2]-ax[k]; ty=t[t.length-1]-ay[k]; if(tx*tx+ty*ty<d2) ok=false; }
      if(ok){ rzMx+=ux; rzMy+=uy; rzMn++; } }
  }
  function rzCome(x,y){ // la punta consume los atractores que alcanza
    var k, dx, dy, r2=rz.ac*rz.ac;
    for(k=0;k<rz.na;k++){ if(!rz.av[k]) continue; dx=rz.ax[k]-x; dy=rz.ay[k]-y; if(dx*dx+dy*dy<r2) rz.av[k]=0; }
  }
  function rzAtractores(){ // los atractores de la raíz (con la semilla): dispersos, más densos donde hay más c, y la fuente (un racimo a una altura fija y a un ancho que cambia con la semilla)
    var w=rz.xr-rz.xl, h=RZ_TIPMAX*H+60, hzr=rz.hz/RZ_ESC, n0=Math.min(200,Math.round(w*h/(RZ_DA*hzr*hzr))), k=0, t, x, y, u0, u, xf, sg;
    if(!rz.ax){ rz.ax=new Float32Array(260); rz.ay=new Float32Array(260); rz.av=new Uint8Array(260); }
    for(t=0;k<n0&&t<n0*8;t++){ x=rz.xl+4+(w-8)*rzU(); y=14+(h-14)*rzU(); if(rzU()<Math.min(1,.3+1.2*rzC(x,y))){ rz.ax[k]=x; rz.ay[k]=y; rz.av[k]=1; k++; } }
    u0=rzU(); u=rz.fuenteF!=null?rz.fuenteF:u0; xf=rz.x+rz.hw*.7*(2*u-1); sg=9*hzr; rz.fuente={x:xf,y:RZ_YF*H};
    for(t=0;t<RZ_NF;t++){ x=xf+sg*rzN(); y=rz.fuente.y+sg*rzN(); x=x<rz.xl+3?rz.xl+3:x>rz.xr-3?rz.xr-3:x; rz.ax[k]=x; rz.ay[k]=y; rz.av[k]=1; k++; }
    rz.na=k;
  }
  function rzNace(yb){ // un primordio lateral del periciclo a la altura yb (el lado se elige hacia el nutriente más rico y hacia donde hay más atractores)
    var x=rzXc(yb), dd=Math.max(20,.7*rz.hw), cL=rzC(x-dd,yb), cR=rzC(x+dd,yb), con=(cR-cL)/(cR+cL+.1), rich=Math.min(1,(cL+cR)/.8), prev=rz.lat.length?rz.lat[rz.lat.length-1].lado:1, hz=rz.hz, p, lado, ox, mx, f0, k, nL=0, nR=0, na2;
    for(k=0;k<rz.na;k++) if(rz.av[k]&&Math.abs(rz.ay[k]-yb)<rz.am&&Math.abs(rz.ax[k]-x)<rz.am){ if(rz.ax[k]>x) nR++; else nL++; }
    na2=(nR-nL)/(nR+nL+1); rich=Math.min(1,rich+.15*(nL+nR)/6);
    p=.5+.42*Math.tanh(4*con+3*na2)-.1*prev; p=p<.05?.05:p>.95?.95:p; lado=rzU()<p?1:-1;
    ox=x+lado*rz.rr*.85; mx=lado>0?rz.xr-ox:ox-rz.xl; f0=1.1+.2*rzN(); f0=f0<.8?.8:f0>1.4?1.4:f0;
    rz.lat.push({id:rz.latN++,y:yb,lado:lado,len:0,pts:[ox,yb],phi:f0,phi0:f0,acc:0,vivo:true,max:Math.max(0,Math.min(mx*1.6,150*hz)),bloq:0});
    rz.nextPY+=(62+54*rzU())*hz*(1-.4*rich);
  }
  function rzLat(la){ // avanza la punta de una lateral lo que le toca por el paso de la primaria (más rápido con más c y con el especialista); se orienta por su ángulo plagiotrópico y por los atractores que percibe
    var p=la.pts, m=p.length, x=p[m-2], y=p[m-1], lado=la.lado, phi=la.phi, ca, cb, ch, t, xn, yn, ux, uy, pd;
    la.acc+=RZ_LV*RZ_PS*(1+RZ_LB*rzBoost(la.y))*(1+RZ_LF*Math.min(1,rzC(x,y)/.5));
    while(la.acc>=RZ_LS&&la.vivo){
      la.acc-=RZ_LS;
      ca=rzC(x+lado*Math.sin(phi+.7)*RZ_PERC,y+Math.cos(phi+.7)*RZ_PERC); cb=rzC(x+lado*Math.sin(phi-.7)*RZ_PERC,y+Math.cos(phi-.7)*RZ_PERC); ch=(ca-cb)/(ca+cb+.15);
      t=.35+(la.phi0-.35)*Math.exp(-la.len/110);
      rzAtrae(x,y,lado*Math.sin(phi),Math.cos(phi),la);
      ux=lado*Math.sin(t); uy=Math.cos(t); if(rzMn){ ux+=RZ_PAT*rzMx/rzMn; uy+=RZ_PAT*rzMy/rzMn; }
      pd=Math.atan2(lado*ux,uy); pd=pd<.1?.1:pd>1.5?1.5:pd;
      phi+=.3*(pd-phi)+.06*ch+.04*rzN(); phi=phi<.1?.1:phi>1.5?1.5:phi;
      xn=x+lado*Math.sin(phi)*RZ_LS; yn=y+Math.cos(phi)*RZ_LS;
      if(lado>0?xn>rz.xr:xn<rz.xl){ xn=lado>0?rz.xr:rz.xl; phi=Math.max(.1,phi-.3); la.bloq++; if(la.bloq>5) la.vivo=false; }   // el borde del margen (el texto o la ventana): se endereza hacia abajo y, si sigue chocando, se detiene
      if(yn>H-4) la.vivo=false;
      p.push(xn,yn); la.len+=RZ_LS; x=xn; y=yn; rzCome(x,y); if(la.len>=la.max) la.vivo=false;
    }
    la.phi=phi;
  }
  function rzPaso(){ // un paso de RZ_PS px de la punta primaria (hacia los atractores y hacia abajo) y el avance de las laterales
    var k=rz.priN, y=(k-1)*RZ_PS, x=rz.pri[k-1], th=rz.th, cl, cr, ch, i, lo=rz.x-.7*rz.hw, hi=rz.x+.7*rz.hw, dx, dy, td;
    cl=rzC(x-.8*RZ_PERC,y+.6*RZ_PERC); cr=rzC(x+.8*RZ_PERC,y+.6*RZ_PERC); ch=(cr-cl)/(cr+cl+.15);
    rzAtrae(x,y,Math.sin(th),Math.cos(th),null);
    dx=(rzMn?rzMx/rzMn:0)+.3*ch; dy=(rzMn?rzMy/rzMn:0)+RZ_GP; td=Math.atan2(dx,dy); td=td<-.6?-.6:td>.6?.6:td;
    th+=.3*(td-th)-RZ_KR*.5*(x-rz.x)/rz.hw+RZ_ST*rzN(); th=th<-.6?-.6:th>.6?.6:th;
    x+=Math.tan(th)*RZ_PS; if(x<lo){ x=lo; if(th<0) th=0; } else if(x>hi){ x=hi; if(th>0) th=0; }
    rz.pri[k]=x; rz.priN=k+1; rz.tipY=k*RZ_PS; rz.th=th; rzCome(x,rz.tipY);
    if(rz.tipY-RZ_SB*rz.hz>=rz.nextPY) rzNace(rz.nextPY);
    for(i=0;i<rz.lat.length;i++) if(rz.lat[i].vivo) rzLat(rz.lat[i]);
  }
  function rzGenera(tip){ // pre-simula el crecimiento fuera de pantalla hasta que la punta llega a tip (px), con la semilla rz.sem
    var y, k, hel=rz.hel;
    rz.s=(rz.sem>>>0)||1; rz.pri=new Float32Array(Math.ceil(H/RZ_PS)+24); rz.pri[0]=rz.x+.1*rz.hw*rzN(); rz.priN=1; rz.tipY=0; rz.th=.05*rzN();
    rz.ph=6.28318*rzU(); rz.ph2=6.28318*rzU(); rz.pend=0; rz.fase=0; rz.colBin=new Float32Array(Math.ceil(H/30)+2); rz.lat.length=0; rz.latN=0; hel.length=0; rz.nextPY=(24+40*rzU())*rz.hz;
    rz.am=RZ_AM*rz.hz/RZ_ESC; rz.ac=RZ_AC*rz.hz/RZ_ESC; rzAtractores();
    for(y=3,k=0;y<RZ_TIPMAX*H;y+=7,k++){ hel.push(rzPeloGen(y+4*rzU(),1,.62+.5*rzU(),-.1+.5*rzU(),k*2)); hel.push(rzPeloGen(y+4*rzU(),-1,.62+.5*rzU(),-.1+.5*rzU(),k*2+1)); }   // 047: los mismos sorteos que antes (la raíz de cada semilla no cambia); lo nuevo sale de un hash, no del generador
    hel.sort(function(a,b){ return a.y-b.y; });   // por la y de la base (rzCerca busca los pelos cercanos por bisección)
    while(rz.tipY<tip&&rz.priN<rz.pri.length-2) rzPaso();
    rzCentra();
  }
  function rzCentra(){ // 042 p3: la media del eje primario queda exactamente en el punto medio del margen (rz.x = colIzq/2): se corrige el corrimiento que deja el serpenteo, moviendo también las laterales, los atractores y la fuente
    var k, j, m=0, dx, la;
    for(k=0;k<rz.priN;k++) m+=rz.pri[k];
    dx=rz.x-m/rz.priN; if(Math.abs(dx)<.05) return;
    for(k=0;k<rz.priN;k++) rz.pri[k]+=dx;
    for(k=0;k<rz.lat.length;k++){ la=rz.lat[k]; for(j=0;j<la.pts.length;j+=2) la.pts[j]=Math.max(rz.xl,Math.min(rz.xr,la.pts[j]+dx)); }   // (y sin pasarse de los bordes del margen)
    for(k=0;k<rz.na;k++) rz.ax[k]+=dx;
    if(rz.fuente) rz.fuente.x+=dx;
  }
  function hU(a){ a=Math.imul(a^(a>>>16),0x45d9f3b); a=Math.imul(a^(a>>>15),0x2c1b3c6d); a^=a>>>16; return (a>>>0)/4294967296; }   // 047: hash → [0, 1): lo que es del tejido (pelos, paredes celulares) no se vuelve a sortear cada vez que la raíz crece
  function rzPeloGen(y,lado,f,tilt,id){ var q=(id*5+(rz.sem|0))|0; return {y:y,lado:lado,f:hU(q+1)<.14?f*(.45+.25*hU(q+2)):f,tilt:tilt,z:hU(q+3),cv:2*hU(q+4)-1}; }   // 047: cada pelo nace a su propia distancia de la punta (z), con su curvatura (cv) y algunos quedan cortos
  function rzRL(l,np,ls){ var r=rz.rr*(.40-.12*Math.min(1,l*RZ_LS/ls)); if(l>=np-3) r*=l>=np-2?.66:.85; return r; }   // 047: el radio de una lateral baja poco con el largo (antes de .42 a .15: una aguja) y su punta es roma
  function rzR(s){ var c=22*rz.hz, u; if(s<=0) return 0; if(s<c){ u=1-s/c; return RZ_RC*rz.rr*Math.sqrt(1-u*u); } u=(s-c)/(70*rz.hz); u=u>1?1:u; return rz.rr*(RZ_RC+(1-RZ_RC)*u*u*(3-2*u)); }  // 047: cofia en domo (una elipse: punta roma, como en las raíces de verdad; antes una ojiva casi cónica) y un diámetro casi constante detrás de ella
  function rzEps(s){ var t=[[0,1.3],[30,1.2],[48,1],[110,.95],[200,.6],[280,.4],[400,.2],[1500,.12]], k, h=rz.hz; if(s<=0) return 1.3; for(k=1;k<t.length;k++) if(s<=t[k][0]*h) return t[k-1][1]+(t[k][1]-t[k-1][1])*(s-t[k-1][0]*h)/((t[k][0]-t[k-1][0])*h); return .12; }
  function rzBoost(y){ var b=rz.colBin, k, c; if(!b) return 0; k=Math.max(0,Math.min(b.length-1,(y/30)|0)); c=b[k]; return c/(c+RZ_KB); }
  function ssm(u){ return u*u*(3-2*u); }
  function dseg(px,py,ax,ay,bx,by){ var dx=bx-ax, dy=by-ay, l2=dx*dx+dy*dy, t=l2>1e-6?((px-ax)*dx+(py-ay)*dy)/l2:0; t=t<0?0:t>1?1:t; qx_=ax+t*dx; qy_=ay+t*dy; return Math.sqrt((px-qx_)*(px-qx_)+(py-qy_)*(py-qy_)); }
  var nhk=0, hvk=0, xmk=0;
  function rzPelo(x,y,ex,ey,hl,cv){ // 047: agrega un pelo (base x, y; dirección unitaria ex, ey; largo hl; curvatura cv entre -1 y 1) a la lista, recortado por los bordes del margen
    var x2=x+ex*hl, o, t;
    if(x2>rz.xr){ if(x>=rz.xr-2.5) return; hl*=(rz.xr-x)/(x2-x); x2=x+ex*hl; } else if(x2<rz.xl){ if(x<=rz.xl+2.5) return; hl*=(x-rz.xl)/(x-x2); x2=x+ex*hl; }
    if(hl<2.5||nhk>=720) return;
    o=nhk*5; HK[o]=x; HK[o+1]=y; HK[o+2]=x2; HK[o+3]=y+ey*hl; HK[o+4]=cv; nhk++; t=ey*hl; if(t<0) t=-t; if(t>hvk) hvk=t; if(x2>xmk) xmk=x2;
  }
  function rzBuild(){ // cápsulas del cuerpo y de las laterales, y pelos, a partir de la punta, las laterales (que crecen con la edad del tejido) y la colonización
    var nb=0, nh=0, y, y0, x0, r0, x, r, s, k, l, u, xx, yy, la, ls, p, np, ang, ox, oy, h, hl, c=22*rz.hz, xm=0, o, lado, ex, ey, hot=rz.hot, Lh=RZ_HAIR*rz.sc, sMad=280*rz.hz, s0, sL, nx, ny, d, q, ang;
    hot.length=0; y0=rz.tipY; x0=rzXc(y0); r0=0; hot.push({x:x0,y:y0-10*rz.hz,w:1});   // el mucílago de la cofia: un sitio de adhesión
    for(y=y0-2;y>-14&&nb<150;y-=(y0-y<c+6?2:12)){ s=y0-y; r=rzR(s); x=rzXc(y); o=nb*5; RB[o]=x0; RB[o+1]=y0; RB[o+2]=x; RB[o+3]=y; RB[o+4]=Math.max(.6,(r+r0)/2); nb++; x0=x; y0=y; r0=r; if(x+r>xm) xm=x+r; }
    rz.nbCuerpo=nb;
    for(k=0;k<rz.lat.length;k++){ la=rz.lat[k]; lado=la.lado; p=la.pts; np=p.length>>1;
      ox=rzXc(la.y)+lado*rz.rr*.85; oy=la.y; hot.push({x:ox,y:oy,w:2.2});
      if(np<2) continue;
      x0=p[0]; y0=p[1]; r0=rzRL(0,np,40); ls=Math.max(la.len,40);
      for(l=1;l<np&&nb<440;l++){ xx=p[2*l]; yy=p[2*l+1]; r=rzRL(l,np,ls); o=nb*5; RB[o]=x0; RB[o+1]=y0; RB[o+2]=xx; RB[o+3]=yy; RB[o+4]=Math.max(.6,(r+r0)/2); nb++; x0=xx; y0=yy; r0=r; if(xx+r>xm) xm=xx+r; }
      hot.push({x:x0,y:y0,w:1});
    }
    rz.nb=nb;
    nhk=0; hvk=0; xmk=xm;                                                                                   // 047: los pelos de la primaria y los de las laterales se juntan y se ordenan por la y de su base
    for(k=0;k<rz.hel.length;k++){ h=rz.hel[k]; s=rz.tipY-h.y; s0=(96+36*h.z)*rz.hz; if(s<s0) continue;                // cada pelo sale a su propia distancia de la punta y crece hasta su largo en 54–94 px
      hl=Lh*h.f*ssm(Math.min(1,(s-s0)/((54+40*h.z)*rz.hz)))*(s>sMad?1-.45*Math.min(1,(s-sMad)/(220*rz.hz)):1)*(1+RZ_HB*rzBoost(h.y));
      r=rzR(s); rzPelo(rzXc(h.y)+h.lado*(r-.4),h.y,h.lado*Math.cos(h.tilt),Math.sin(h.tilt),hl,h.cv); }
    rz.nhPri=nhk;
    for(k=0;k<rz.lat.length;k++){ la=rz.lat[k]; p=la.pts; np=p.length>>1; ls=Math.max(la.len,40);                  // 047: las laterales también tienen pelos radicales, y más densos que la primaria (RZ_PHL por punto y lado, cada 4 px de largo)
      for(l=3;l<np-1;l++){ sL=la.len-l*RZ_LS; if(l*RZ_LS<rz.rr*1.05) continue;
        for(lado=-1;lado<2;lado+=2){ q=(((la.id+1)*9973+l)*2+(lado>0?1:0)+(rz.sem|0)*7)|0; if(hU(q)>=RZ_PHL) continue;
          s0=(6+8*hU(q+1))*rz.hz; if(sL<s0) continue; ey=p[2*l+3]-p[2*l-1]; ex=p[2*l+2]-p[2*l-2]; d=Math.sqrt(ex*ex+ey*ey)||1; ex/=d; ey/=d;    // tangente (hacia la punta)
          ang=-.05+.45*hU(q+2); nx=-ey*lado; ny=ex*lado; r=rzRL(l,np,ls);
          hl=Lh*RZ_HL*(hU(q+3)<.14?.35+.3*hU(q+4):.6+.5*hU(q+4))*ssm(Math.min(1,(sL-s0)/(28*rz.hz)))*(1+RZ_HB*rzBoost(p[2*l+1]));
          rzPelo(p[2*l]+nx*(r-.3),p[2*l+1]+ny*(r-.3),nx*Math.cos(ang)+ex*Math.sin(ang),ny*Math.cos(ang)+ey*Math.sin(ang),hl,2*hU(q+5)-1); } } }
    nh=nhk; rz.nhLat=nh-rz.nhPri; for(k=0;k<nh;k++) HI[k]=k; HI.subarray(0,nh).sort(function(a,b){ return HK[a*5+1]-HK[b*5+1]; });
    for(k=0;k<nh;k++){ o=HI[k]*5; RH[k*4]=HK[o]; RH[k*4+1]=HK[o+1]; RH[k*4+2]=HK[o+2]; RH[k*4+3]=HK[o+3]; RHC[k]=HK[o+4]; }
    xm=xmk; rz.hv=hvk;
    if(rz.fuente) xm=Math.max(xm,Math.min(rz.fuente.x+18*rz.sc,rz.xr));
    rz.nh=nh; rz.hmax=Lh*1.55; rz.xmax=xm+6; rz.anchoD=Math.ceil((rz.xmax+16)/24)*24;   // el ancho de los canvases sube de 24 en 24 px (cambiarlo borra el canvas)
    rz.ncr=Math.min(GRR,Math.max(3,Math.ceil((rz.xmax+130)/hx)));
    rz.banda=Lh*1.35+12;
  }
  function rzGeom(nuevo){ // geometría de la raíz para el ancho y el alto actuales (nuevo: pre-simula una raíz con la semilla actual, al empezar una visita; si cambia el tamaño, la regenera con la misma semilla)
    var sc, hz, tip;
    sc=Math.max(.45,Math.min(1.3,colIzq/150))*RZ_ESC; hz=Math.max(.7,Math.min(1.6,H/900))*RZ_ESC;
    rz.sc=sc; rz.hz=hz; rz.rr=13*sc; rz.x=Math.max(rz.rr+6,colIzq/2); rz.hw=Math.max(8,rz.x-rz.rr-6); rz.xl=4; rz.xr=Math.max(rz.x+rz.rr+10,colIzq-26);   // centrada en el margen izquierdo (entre el borde de la ventana y la columna)
    if(!rz.on){ rz.H0=H; rz.nb=0; rz.nh=0; rz.xmax=0; RZS.fill(0); RZB.fill(0); CR.fill(0); rzTamano(); rzPintar(); return; }
    if(nuevo||!rz.H0||!rz.pri||rz.H0!==H||rz.W0!==W||rz.col0!==colIzq){
      tip=(nuevo||!rz.H0||!rz.pri)?RZ_TIP0*H:Math.min(RZ_TIPMAX*H,rz.tipY/rz.H0*H);
      rz.H0=H; rz.W0=W; rz.col0=colIzq; rzGenera(tip);
    }
    rzBuild(); rzFuente(); rzTamano(); rzPintar();
  }
  function rzFuente(){ // exudación sobre la grilla (RZS, entre 0 y 1,2): intensa en la cofia (mucílago) y la elongación, menos en los pelos y poco en la zona madura, con un aumento en la salida de cada lateral y en sus puntas; RZB: la franja de la rizosfera (peso 0–1)
    var i, j, k, o, cx, cy, d, v, e, dm, vm, cap=rz.nbCuerpo, sg=RZ_SIG*rz.sc, w, ht;
    RZS.fill(0); RZB.fill(0);
    for(j=0;j<GY;j++) for(i=0;i<rz.ncr&&i<GX;i++){
      cx=(i+.5)*hx; cy=(j+.5)*hy; vm=0; dm=1e9;
      for(k=0;k<rz.nb;k++){ o=k*5; if((RB[o+1]>cy+130&&RB[o+3]>cy+130)||(RB[o+1]<cy-130&&RB[o+3]<cy-130)) continue;   // las cápsulas a más de 130 px en vertical no cuentan (la exudación vale ≈ 0 a 3σ y la franja es de < 100 px)
        d=dseg(cx,cy,RB[o],RB[o+1],RB[o+2],RB[o+3])-RB[o+4]; if(d<0) d=0; if(d<dm) dm=d;
        if(k<cap) e=rzEps(rz.tipY-.5*(RB[o+1]+RB[o+3])); else e=(k+1<rz.nb&&RB[(k+1)*5]===RB[o+2]&&RB[(k+1)*5+1]===RB[o+3])?.6:1;     // laterales: .6 a lo largo y 1 en la punta
        v=e*Math.exp(-d*d/(2*sg*sg)); if(v>vm) vm=v; }
      for(k=0;k<rz.hot.length;k++){ ht=rz.hot[k]; if(ht.w>1.5){ d=Math.hypot(cx-ht.x,cy-ht.y); v=.9*Math.exp(-d*d/(2*(1.3*sg)*(1.3*sg))); if(v>vm) vm=v; } }
      if(rz.fuente){ d=Math.hypot(cx-rz.fuente.x,cy-rz.fuente.y); v=.85*Math.exp(-d*d/(2*(1.5*sg)*(1.5*sg))); if(v>vm) vm=v; }      // 043: la fuente de nutriente exuda aunque la raíz aún no llegue
      RZS[j*GX+i]=vm>1.2?1.2:vm; w=(dm-.7*rz.banda)/(.5*rz.banda); w=w<0?0:w>1?1:w; RZB[j*GX+i]=1-w*w*(3-2*w);
    }
    sucio=true;
  }
  function rzCerca(x,y){ // distancia a la superficie del cuerpo (bD, negativa adentro; punto bX, bY y normal bNx, bNy) y a la del pelo más cercano (hD; punto hX, hY). Descarta lo lejano sin calcular la distancia (es lo más caro de la raíz)
    var k, o, d, bk=-1, nx, ny, l, y1, y2, dy, lo, hi, md, w;
    bD=1e9; hD=1e9; hK=-1;
    for(k=0;k<rz.nb;k++){ o=k*5; y1=RB[o+1]; y2=RB[o+3];
      dy=y<y1&&y<y2?(y1<y2?y1:y2)-y:y>y1&&y>y2?y-(y1>y2?y1:y2):0; if(dy-RB[o+4]>=bD) continue;
      d=dseg(x,y,RB[o],y1,RB[o+2],y2)-RB[o+4]; if(d<bD){ bD=d; bk=k; bX=qx_; bY=qy_; } }
    bK=bk;
    if(bk>=0){ nx=x-bX; ny=y-bY; l=Math.sqrt(nx*nx+ny*ny); if(l<1e-4){ nx=1; ny=0; l=1; } bNx=nx/l; bNy=ny/l; bX+=bNx*RB[bk*5+4]; bY+=bNy*RB[bk*5+4]; }
    if(bD<rz.hmax+4){                                                                          // sólo hay pelos cerca si el cuerpo está a menos de su largo máximo; los pelos van ordenados por la y de su base
      w=rz.hv+8; lo=0; hi=rz.nh; while(lo<hi){ md=(lo+hi)>>1; if(RH[md*4+1]<y-w) lo=md+1; else hi=md; }
      for(k=lo;k<rz.nh&&RH[k*4+1]<=y+w;k++){ o=k*4; d=dseg(x,y,RH[o],RH[o+1],RH[o+2],RH[o+3])-.7; if(d<hD){ hD=d; hK=k; hX=qx_; hY=qy_; } }
    }
  }
  function rzHot(x,y){ var k, h, s=1, d2; for(k=0;k<rz.hot.length;k++){ h=rz.hot[k]; d2=(x-h.x)*(x-h.x)+(y-h.y)*(y-h.y); s+=h.w*Math.exp(-d2/(2*22*22*rz.sc*rz.sc)); } s+=1.2*Math.exp(-Math.pow((rz.tipY-70*rz.hz-y)/(50*rz.hz),2)); return s; }
  function rzCelda(i,x,y,nado,dt){ // la raíz como obstáculo (saca a la célula del cuerpo) y como superficie de adhesión (devuelve 1 si la célula quedó adherida); fija oX, oY
    var tp=T[i], rad=RAD[tp]*SZ[i], d, ux, uy, ct, pr, hot, a, bh, oo;
    rzCerca(x,y); oX=x; oY=y;
    if(bD<rad+.2){ d=rad+.3-bD; oX=x+bNx*d; oY=y+bNy*d;
      if(nado){ ux=Math.cos(TH[i]); uy=Math.sin(TH[i]); ct=ux*bNx+uy*bNy; if(ct<0){ ux-=ct*bNx; uy-=ct*bNy; TH[i]=Math.atan2(uy,ux); } }                       // sigue por la superficie
      rzCerca(oX,oY); if(bD<rad+.2){ d=rad+.3-bD; oX+=bNx*d; oY+=bNy*d; bD=rad+.3; } }          // 043: en el rincón entre una lateral y el eje una sola salida podía dejarla dentro de la otra cápsula: se revisa una vez más
    if(!nado||tp===4||NB[i]>=9||HM[i]<0||nRz>=RZ_MAXN[nivel]) return 0;                         // (la superficie es finita: con RZ_MAXN células en la raíz ya no se adhieren más)
    bh=hD<bD-.5; ct=bh?hD:bD;
    if(ct<rad+2.4&&AFIN[tp]>0){ hot=rzHot(oX,oY); pr=KRZ*AFIN[tp]*hot*(.5+.5*NB[i])*dt;
      if(Math.random()<pr){
        if(bh){ oo=hK*4; a=Math.atan2(RH[oo+3]-RH[oo+1],RH[oo+2]-RH[oo]); ux=oX-hX; uy=oY-hY; d=Math.sqrt(ux*ux+uy*uy)||1; oX=hX+ux/d*(rad+.8); oY=hY+uy/d*(rad+.8); if(Math.cos(a-TH[i])<0) a+=3.14159; TH[i]=a; }
        else{ oX=bX+bNx*(rad+.1); oY=bY+bNy*(rad+.1); a=Math.atan2(bNx,-bNy); if(Math.cos(a-TH[i])<0) a+=3.14159; TH[i]=a; }
        S[i]=1; SP[i]=0; HM[i]=0; BM[i]=1+.4*Math.random(); RS[i]=0; RZc[i]=1; ev.adh++; ev.rz=(ev.rz||0)+1; if(tp===5) ev.rzP=(ev.rzP||0)+1; return 1; } }
    return 0;
  }
  function rzIdx(x,y){ var i=(x/hx)|0, j; if(i<0||i>=rz.ncr) return -1; j=(y/hy)|0; j=j<0?0:j>GY-1?GY-1:j; return j*GRR+i; }
  function leerR(x,y){ // interpolación bilineal del exudado r (sólo existe en la franja de la raíz)
    if(!rz.on||x>=rz.ncr*hx) return 0;
    var gx=x/hx-.5, gy=y/hy-.5, i=Math.floor(gx), j=Math.floor(gy), fx=gx-i, fy=gy-j, i1=i+1, j1=j+1, n_=rz.ncr;
    if(i<0){ i=0; fx=0; } if(j<0){ j=0; fy=0; } if(i1>n_-1) i1=n_-1; if(j1>GY-1) j1=GY-1; if(i>n_-1) i=n_-1; if(j>GY-1) j=GY-1;
    return (CR[j*GRR+i]*(1-fx)+CR[j*GRR+i1]*fx)*(1-fy)+(CR[j1*GRR+i]*(1-fx)+CR[j1*GRR+i1]*fx)*fy;
  }
  function difundirR(m,ax,ay,h){ // exudado r (ácidos orgánicos y azúcares de la raíz): difunde como c en la franja de la raíz (borde derecho abierto), decae (lo comen los microbios) y lo consume P
    var s, i, j, k, c, a, t, nc=rz.ncr, rr=REPOR*h, dr=DECR*h;
    for(s=0;s<m;s++){
      for(j=0;j<GY;j++) for(i=0;i<nc;i++){ k=j*GRR+i; c=CR[k];
        a=c+ax*((i>0?CR[k-1]:c)+(i<nc-1?CR[k+1]:0)-2*c)+ay*((j>0?CR[k-GRR]:c)+(j<GY-1?CR[k+GRR]:c)-2*c)+rr*RZS[j*GX+i]*(1-c)-dr*c; CR2[k]=a<0?0:a>1?1:a; }
      t=CR; CR=CR2; CR2=t;
    }
  }
  function rzColoniza(){ // cuenta la colonización del rizoplano y la del especialista, por franja de 30 px y cerca de la punta
    var i, b=rz.colBin, k, np=0, nc=0, ncp=0, pt=0, s, nb_=b.length, t, aux;
    for(k=0;k<nb_;k++) b[k]=0;
    for(i=0;i<n;i++){ if(T[i]===5) np++; if(!RZc[i]||!S[i]) continue; nc++; if(T[i]===5){ ncp++; k=(Y[i]/30)|0; if(k>=0&&k<nb_) b[k]++; s=rz.tipY-Y[i]; if(s<200*rz.hz) pt++; } }
    aux=new Float32Array(nb_); for(k=0;k<nb_;k++) aux[k]=.25*(b[k>0?k-1:k])+.5*b[k]+.25*(b[k<nb_-1?k+1:k]); for(k=0;k<nb_;k++) b[k]=aux[k];
    rz.nP=np; rz.nCol=nc; rz.nColP=ncp; rz.pTip=pt;
  }
  function rzCrece(real){ // la punta avanza (más rápido donde el especialista la coloniza); la geometría crece de a RZ_PS px de y
    var pasos=0;
    if(!rz.on) return;
    rz.tCol+=real; if(rz.tCol>=.5){ rz.tCol=0; rzColoniza(); }
    rz.v=RZ_V0*(1+(rz.esp?RZ_PG*rz.pTip/(rz.pTip+RZ_KP):0));
    if(rz.tipY<RZ_TIPMAX*H) rz.pend+=rz.v*real;
    if(rz.fase===1){ rz.fase=2; rzSil(); } else if(rz.fase===2){ rz.fase=0; rzDet(); }                                  // el dibujo de la silueta y el del detalle van en cuadros distintos (sin tirón)
    else if(rz.pend>=RZ_PS){ while(rz.pend>=RZ_PS&&pasos<6){ rz.pend-=RZ_PS; rzPaso(); pasos++; } rz.reb++; rzBuild(); rzFuente(); if(rzTamano()){ rzPintar(); rz.fase=0; } else rz.fase=1; }
  }
  function entranteP(){ var y=H*(.3+.65*Math.random()); nueva(1,y,.7*normal(),5); }
  // Sembrado del estado inicial de la raíz: dos microcolonias del especialista (en la elongación y en la salida de la primera lateral), un racimo de B sobre un pelo, A y B sueltas en la zona madura y dos P nadando junto a la punta
  function rzPunto(y,lado,off){ var s=rz.tipY-y; return [rzXc(y)+lado*(rzR(s)+off),y]; }
  function rzSembrar(){
    var k, p, a, y, h, o, j, hot=rz.hot, dx, dy, ph, rad, la;
    if(!rz.on) return;
    for(k=n-1;k>=0&&n>NMAX-24;k--) if(!S[k]&&T[k]!==4&&T[k]!==5) quitar(k);                                   // si la población está llena (al volver a crear la raíz), se hace lugar quitando nadadoras
    if(n>NMAX-24) return;
    y=rz.tipY-84*rz.hz; p=rzPunto(y,1,3.5); for(k=0;k<4;k++){ j=cel(p[0],p[1]+(k-1.5)*6.8,1.5708,rz.esp?5:1,1+.3*Math.random()); RZc[j]=1; }                         // P en la elongación (o A, sin el especialista, para comparar)
    h=null; la=null; for(k=0;k<rz.lat.length;k++) if(rz.lat[k].len>6&&(!la||rz.lat[k].y>la.y)) la=rz.lat[k]; for(k=0;k<hot.length&&la&&!h;k++) if(hot[k].w>1.5&&Math.abs(hot[k].y-la.y)<1) h=hot[k];
    if(h){ p=rzPunto(h.y,1,3.5); for(k=0;k<3;k++){ j=cel(p[0],h.y-7-6.8*k,1.5708,rz.esp?5:1,1+.3*Math.random()); RZc[j]=1; } }                          // P sobre la raíz, justo encima de la salida de la primera lateral
    y=rz.tipY-190*rz.hz; for(k=0;k<rz.nh;k++){ o=k*4; if(Math.abs(RH[o+1]-y)<14&&RH[o+2]>RH[o]){ ph=Math.atan2(RH[o+3]-RH[o+1],RH[o+2]-RH[o]); for(j=0;j<3;j++){ a=.45+.2*j; dx=RH[o]+(RH[o+2]-RH[o])*a; dy=RH[o+1]+(RH[o+3]-RH[o+1])*a; rad=RAD[3]; p=cel(dx+Math.sin(ph)*(rad+.6),dy-Math.cos(ph)*(rad+.6),ph+.3*normal(),3,1+.3*Math.random()); RZc[p]=1; } break; } }   // B sobre un pelo
    y=rz.tipY-340*rz.hz; p=rzPunto(y,-1,3.5); j=cel(p[0],p[1],1.5708,1,1.2); RZc[j]=1; p=rzPunto(y-60*rz.hz,1,3.2); j=cel(p[0],p[1],1.5708,3,1.2); RZc[j]=1; j=cel(p[0],p[1]-6.2,1.5708,3,1.1); RZc[j]=1;
    if(rz.esp) for(k=0;k<2;k++) nueva(rzXc(rz.tipY)+rz.rr+14+10*k,rz.tipY-30*rz.hz-20*k,.5*normal(),5);
  }
  function rzTamano(){ // tamaño de los canvases de la raíz (el visible, bajo la segunda tapa de la luz; el de trabajo y el de la silueta)
    var w=rz.anchoD||60, wd=Math.round(w*dpr), hd=Math.round(H*dpr);
    var cambio=false;
    if(!rz.cvR) return false;
    if(rz.cvR.width!==wd||rz.cvR.height!==hd){ rz.cvR.width=wd; rz.cvR.height=hd; rz.tmp.width=wd; rz.tmp.height=hd; rz.cache.width=wd; rz.cache.height=hd; cambio=true; }
    rz.cvR.style.width=w+'px'; rz.cvR.style.height=H+'px'; return cambio;   // true si cambió el tamaño (cambiarlo borra los canvases: hay que repintar de una vez)
  }
  function rzTinta(a){ return 'rgba('+rgb+','+Math.min(1,a*rz.gana).toFixed(3)+')'; }
  function rzCapsulas(c,extra,r0,hasta){ var k, o; c.lineCap='round'; for(k=0;k<hasta;k++){ o=k*5; c.lineWidth=Math.max(.2,2*RB[o+4]+extra); c.beginPath(); c.moveTo(RB[o],RB[o+1]); c.lineTo(RB[o+2],RB[o+3]); c.stroke(); } }
  function rzPintar(){ rz.fase=0; rzSil(); rzDet(); }   // silueta y detalle de una vez (al empezar, al cambiar el tema o el tamaño); al crecer la raíz se reparten en cuadros distintos (rzCrece)
  function rzSil(){ // silueta (contorno y relleno tenues); se dibuja en el canvas de trabajo y se publica al terminar el detalle (rzDet)
    var c, t, w, d=dpr, nb_, ci;
    if(!rz.cvR||!rz.cxR) return;
    w=rz.anchoD; c=rz.cxC; t=rz.cxT; c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,rz.cache.width,rz.cache.height);
    if(!rz.on||!rz.nb){ rzPub(); return; }
    nb_=rz.nb; ci='rgb('+rgb+')';
    t.setTransform(d,0,0,d,0,0); t.clearRect(0,0,w,H); t.strokeStyle=ci;                                   // contorno: las cápsulas ensanchadas menos las cápsulas
    rzCapsulas(t,2.4,0,nb_); t.globalCompositeOperation='destination-out'; rzCapsulas(t,0,0,nb_); t.globalCompositeOperation='source-over';
    c.globalAlpha=Math.min(1,.26*rz.gana); c.drawImage(rz.tmp,0,0);
    t.clearRect(0,0,w,H); rzCapsulas(t,-.4,0,nb_);                                                        // relleno muy tenue
    c.globalAlpha=Math.min(1,.045*rz.gana); c.drawImage(rz.tmp,0,0); c.globalAlpha=1;
  }
  function rzPub(){ var c=rz.cxR; if(!c) return; c.setTransform(1,0,0,1,0,0); c.clearRect(0,0,rz.cvR.width,rz.cvR.height); c.drawImage(rz.cache,0,0); }
  function rzDet(){ // detalle (paredes celulares, pelos, mucílago, cofias): se suma a la silueta y se publica (la raíz entera sólo se ve bajo la luz)
    var c, w, d=dpr, k, o, y, s, r, x, e, u, hz=rz.hz, sc=rz.sc, a, sg, j, dy, hx_, hy_, hl, nx, ny;
    if(!rz.cvR||!rz.cxC) return;
    w=rz.anchoD; c=rz.cxC;
    if(!rz.on||!rz.nb){ rzPub(); return; }
    c.setTransform(d,0,0,d,0,0); c.lineCap='round'; c.lineJoin='round';
    // mucílago de la cofia (un halo de gel) y células de borde que se desprenden
    x=rzXc(rz.tipY); y=rz.tipY-8*hz; sg=c.createRadialGradient(x,y,2,x,y,40*sc); sg.addColorStop(0,rzTinta(.16)); sg.addColorStop(.6,rzTinta(.07)); sg.addColorStop(1,rzTinta(0)); c.fillStyle=sg; c.beginPath(); c.arc(x,y,40*sc,0,6.2832); c.fill();
    c.strokeStyle=rzTinta(.34); c.lineWidth=.8; for(k=0;k<8;k++){ a=1.1+k*.42+.2*Math.sin(k*5.1+rz.ph); r=(24+7*((k*37)%5)/4)*sc*(1+.12*Math.sin(k*2.3)); c.beginPath(); c.arc(x+Math.cos(a)*r*.9,rz.tipY+Math.sin(a)*r*.75-6*hz,1.5*sc,0,6.2832); c.stroke(); }
    // cofia: columela (arcos) y su borde con el meristema; centro quiescente
    c.strokeStyle=rzTinta(.28); c.lineWidth=.7; for(k=0;k<3;k++){ u=.34+.26*k; c.beginPath(); c.ellipse(x,rz.tipY-22*hz,RZ_RC*rz.rr*u,22*hz*u,0,0,3.14159); c.stroke(); }
    c.strokeStyle=rzTinta(.4); c.beginPath(); c.moveTo(x-RZ_RC*rz.rr+1,rz.tipY-22*hz+1.5); c.quadraticCurveTo(x,rz.tipY-22*hz-3,x+RZ_RC*rz.rr-1,rz.tipY-22*hz+1.5); c.stroke();
    c.beginPath(); c.arc(x,rz.tipY-25*hz,1.7*sc,0,6.2832); c.stroke();
    // paredes de las células: transversales (más cortas hacia la punta) y las capas (epidermis, endodermis, cilindro vascular)
    c.strokeStyle=rzTinta(.24); c.lineWidth=.6; c.beginPath();
    dy=3.2*hz;   // 047: las paredes son del tejido: una retícula fija en y (no depende de dónde esté la punta) y cada pared está o no según el largo de célula de su zona; al avanzar la punta sólo cambian las que cruzan un umbral
    for(j=Math.floor((rz.tipY-24*hz)/dy);j>-2;j--){ y=j*dy; s=rz.tipY-y; e=s<48*hz?3.6:s<110*hz?3.6+11.4*(s-48*hz)/(62*hz):s<280*hz?15:19; if(hU(j*7+(rz.sem|0))>=Math.min(1,dy/e)) continue;
      y+=(hU(j*7+(rz.sem|0)+3)-.5)*dy*.7; r=rzR(rz.tipY-y); x=rzXc(y);
      c.moveTo(x-r+1.2,y); c.lineTo(x-.32*r,y); c.moveTo(x+.32*r,y); c.lineTo(x+r-1.2,y); }
    c.stroke();
    c.strokeStyle=rzTinta(.28); c.lineWidth=.7;
    [[.74,48],[-.74,48],[.32,48],[-.32,48]].forEach(function(l){ c.beginPath(); for(y=rz.tipY-l[1]*hz,k=0;y>-4;y-=6,k++){ s=rz.tipY-y; r=rzR(s); x=rzXc(y)+l[0]*r; if(k) c.lineTo(x,y); else c.moveTo(x,y); } c.stroke(); });
    c.setLineDash([3,3]); c.strokeStyle=rzTinta(.3); c.beginPath(); for(y=rz.tipY-110*hz,k=0;y>-4;y-=6,k++){ x=rzXc(y); if(k) c.lineTo(x,y); else c.moveTo(x,y); } c.stroke(); c.setLineDash([]);     // xilema
    // laterales: su origen en el periciclo (del borde del cilindro vascular hacia afuera) y las paredes de su corteza
    rz.lat.forEach(function(la){ var ox=rzXc(la.y), s0=rz.tipY-la.y, r0=rzR(s0), lado=la.lado; c.strokeStyle=rzTinta(.36); c.lineWidth=.8;
      c.beginPath(); c.moveTo(ox+lado*.32*r0,la.y-3.2*sc); c.lineTo(ox+lado*r0*.88,la.y-3.4*sc); c.moveTo(ox+lado*.32*r0,la.y+3.2*sc); c.lineTo(ox+lado*r0*.88,la.y+3.4*sc); c.stroke();
      if(la.len<3){ c.beginPath(); c.arc(ox+lado*.45*r0,la.y,3.4*sc,lado>0?-1.6:1.5,lado>0?1.6:4.6); c.stroke(); } });
    // la cofia de cada lateral (punta activa): un arco de columela detrás de la punta, células de borde y un halo de mucílago
    rz.lat.forEach(function(la){ var q=la.pts, m=q.length, tx, ty, dx, dy, dl, ux, uy, an, rg;
      if(m<6) return; tx=q[m-2]; ty=q[m-1]; dx=tx-q[m-6]; dy=ty-q[m-5]; dl=Math.sqrt(dx*dx+dy*dy)||1; ux=dx/dl; uy=dy/dl; an=Math.atan2(uy,ux);
      rg=c.createRadialGradient(tx,ty,1,tx,ty,13*sc); rg.addColorStop(0,rzTinta(.14)); rg.addColorStop(1,rzTinta(0)); c.fillStyle=rg; c.beginPath(); c.arc(tx,ty,13*sc,0,6.2832); c.fill();
      c.strokeStyle=rzTinta(.34); c.lineWidth=.7; c.beginPath(); c.arc(tx-ux*2.2,ty-uy*2.2,3*sc,an-1.35,an+1.35); c.stroke();
      c.beginPath(); c.arc(tx+ux*5*sc+uy*3,ty+uy*5*sc-ux*3,.9,0,6.2832); c.arc(tx+ux*7*sc-uy*2,ty+uy*7*sc+ux*2,.9,0,6.2832); c.stroke(); });
    // pelos radicales (curvos, con un engrosamiento en la base)
    c.strokeStyle=rzTinta(.4); c.lineWidth=.8; c.beginPath();
    for(k=0;k<rz.nh;k++){ o=k*4; hx_=RH[o+2]-RH[o]; hy_=RH[o+3]-RH[o+1]; hl=Math.sqrt(hx_*hx_+hy_*hy_)||1; e=RHC[k]*.2*hl; nx=-hy_/hl; ny=hx_/hl; c.moveTo(RH[o],RH[o+1]); c.quadraticCurveTo((RH[o]+RH[o+2])/2+nx*e,(RH[o+1]+RH[o+3])/2+ny*e,RH[o+2],RH[o+3]); }   // 047: la curvatura es del pelo (RHC), perpendicular a él
    c.stroke();
    c.strokeStyle=rzTinta(.3); c.lineWidth=1.5; c.beginPath(); for(k=0;k<rz.nh;k++){ o=k*4; c.moveTo(RH[o],RH[o+1]); c.lineTo(RH[o]+(RH[o+2]-RH[o])*.14,RH[o+1]+(RH[o+3]-RH[o+1])*.14); } c.stroke();
    if(rz.fuente){ // 043: la fuente de nutriente (un parche de materia orgánica: halo y granos)
      x=rz.fuente.x; y=rz.fuente.y; sg=c.createRadialGradient(x,y,1,x,y,22*sc); sg.addColorStop(0,rzTinta(.14)); sg.addColorStop(1,rzTinta(0)); c.fillStyle=sg; c.beginPath(); c.arc(x,y,22*sc,0,6.2832); c.fill();
      c.fillStyle=rzTinta(.5); c.beginPath(); for(k=0;k<16;k++){ a=k*2.399+rz.ph; r=(3+13*Math.sqrt((k+.5)/16))*sc; c.moveTo(x+Math.cos(a)*r+1.1,y+Math.sin(a)*r); c.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,(.9+.5*((k*7)%3))*Math.max(.7,sc),0,6.2832); } c.fill(); }
    rzPub();
  }
  function rzCrear(){
    var mk=function(){ var e=document.createElement('canvas'); return e; };
    rz.cvR=mk(); rz.cvR.setAttribute('aria-hidden','true'); rz.cvR.style.cssText='position:fixed;left:0;top:0;z-index:-1;pointer-events:none;display:block';
    rz.cxR=rz.cvR.getContext('2d'); rz.tmp=mk(); rz.cxT=rz.tmp.getContext('2d'); rz.cache=mk(); rz.cxC=rz.cache.getContext('2d');
    cv.parentNode.insertBefore(rz.cvR,luz.el&&luz.el.caja2?luz.el.caja2:cv);   // debajo de la segunda tapa de la luz (que la esconde fuera del hueco) y del canvas de las bacterias
  }

  // El scroll: agita el fluido (según su velocidad) y marca que se está desplazando (la calma se levanta)
  window.addEventListener('scroll',function(){
    var t=performance.now(), y=window.pageYOffset||0, dt=(t-ultScroll.t)/1000, v;
    tScroll=t; tMasc=-1e9; // la máscara de los bloques de texto se rehace enseguida
    if(dt>.005&&dt<.5){ v=(y-ultScroll.y)/dt; agit=Math.max(agit,Math.min(1,Math.abs(v)/AGIT_V)); empuje=Math.max(-12,Math.min(12,-v*.012)); }
    ultScroll.y=y; ultScroll.t=t;
    if(ptr.ok){ luzSigue(ptr.x,ptr.y);                                                                  // 040: con el cursor quieto, el scroll lo deja sobre otro punto del documento: cuenta como movimiento
      if(Math.abs(y-anc.sy)>TOL){ anc.sy=y; anc.x=ptr.x; anc.y=ptr.y; anc.t=relojC; suelta(); } }          // se rompe la quietud, la arena deja de crecer donde estaba y vuelve a empezar (si el cursor está en un margen)
  },{passive:true});
  window.addEventListener('resize',function(){ tMasc=-1e9; });

  // Máscara de los bloques de texto (la misma lista que lleva velo): fracción de cada celda de la grilla cubierta por texto, y una versión
  // suavizada cuyo gradiente aleja a las células de los bloques
  function mascara(){
    var i, j, k, e, r, i0, i1, j0, j1, ov, p, t, a;
    if(!textoEls.length) textoEls=[].slice.call(document.querySelectorAll(SEL_TEXTO)).filter(function(x){ return !x.closest('.agentes'); });
    TXT.fill(0);
    for(k=0;k<textoEls.length;k++){
      r=textoEls[k].getBoundingClientRect(); if(r.width<2||r.height<2||r.bottom<0||r.top>H||r.right<0||r.left>W) continue;
      i0=Math.max(0,Math.floor(r.left/hx)); i1=Math.min(GX-1,Math.floor(r.right/hx)); j0=Math.max(0,Math.floor(r.top/hy)); j1=Math.min(GY-1,Math.floor(r.bottom/hy));
      for(j=j0;j<=j1;j++) for(i=i0;i<=i1;i++){
        ov=(Math.min(r.right,(i+1)*hx)-Math.max(r.left,i*hx))*(Math.min(r.bottom,(j+1)*hy)-Math.max(r.top,j*hy))/(hx*hy);
        if(ov>0){ e=TXT[j*GX+i]+ov; TXT[j*GX+i]=e>1?1:e; }
      }
    }
    TXB.set(TXT);
    for(p=0;p<3;p++){ // suavizado (caja de 3 × 3, tres pasadas): el gradiente se siente a ≈ 3 celdas (≈ 65 px) del borde
      for(j=0;j<GY;j++) for(i=0;i<GX;i++){
        a=0; t=0;
        for(k=-1;k<=1;k++) for(e=-1;e<=1;e++){ if(i+e>=0&&i+e<GX&&j+k>=0&&j+k<GY){ a+=TXB[(j+k)*GX+i+e]; t++; } }
        TXC[j*GX+i]=a/t;
      }
      TXB.set(TXC);
    }
    tMasc=performance.now();
  }

  // ---- 038: nado con estados (run-and-tumble, run-reverse, run-reverse-flick) y twitching ----
  // Medición del movimiento: largo y duración de cada corrida y ángulo de cada tumbo (o inversión) por tipo, velocidad propia media (deriva quimiotáctica) y saltos del twitching.
  var mov={run:[[],[],[],[],[],[]],giro:[[],[],[],[],[],[]],der:[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],tw:{saltos:0,dist:0,seg:0,fijadas:0},n:[0,0,0,0,0,0]};
  function gamma35(){ var z=normal(); return (-Math.log(1-Math.random())-Math.log(1-Math.random())-Math.log(1-Math.random())+.5*z*z)*GK; }  // gamma de forma 3,5 y escala 19,4°: media 68°, sd 36°
  function angTumbo(){ var a, k=0; do a=gamma35(); while(a>3.14159&&++k<8); return a>3.14159?3.14159:a; }
  function finRun(i){ var tp=T[i]; mov.n[tp]++; if(mov.run[tp].length<4000) mov.run[tp].push([+RTM[i].toFixed(2),+RLN[i].toFixed(1)]); }
  function regGiro(tp,a){ if(mov.giro[tp].length<4000) mov.giro[tp].push(+Math.abs(a).toFixed(3)); }
  function difAng(a){ return a-6.283185307*Math.round(a/6.283185307); }
  var mvx=0, mvy=0;
  // RS: 0 corrida, 1 pausa (tumbo, giro o inversión: la célula casi no avanza y gira RD rad/s durante RT s; luego pasa al estado RN), 2 corrida hacia atrás (espirilo y vibrio: el eje no cambia, nada con el flagelo por delante).
  // l: tasa de tumbos o inversiones (1/s, ya modulada por la quimiotaxis); aim: rumbo del objetivo del depredador (NaN si no hay). Fija mvx, mvy (velocidad propia, px/s).
  function nadar(i,dt,l,aim,rel){
    var tp=T[i], e=ESTILO[tp], s=RS[i], a=TH[i], v, d, dur, ad, dd;
    if(s===1){
      a+=RD[i]*dt+(e===0?Math.sqrt(1.2*dt)*normal()*.5:0); RT[i]-=dt; SP[i]+=(.05-SP[i])*(1-Math.exp(-dt/.08));
      if(RT[i]<=0){ RS[i]=RN[i]; RTM[i]=0; RLN[i]=0; }
    }else{
      a+=Math.sqrt(2*DRT[tp]*dt)*normal(); RTM[i]+=dt; SP[i]+=(1-SP[i])*rel;
      if(e===2&&s===2){ if(Math.random()<dt/TREV){ finRun(i); d=aim===aim?difAng(aim-a)+.4*normal():(Math.random()<.5?-1:1)*(FLICK+.4*normal()); dur=PAUSA[tp]*(.5+Math.random()); RD[i]=d/dur; RT[i]=dur; RN[i]=0; RS[i]=1; regGiro(tp,d); } }
      else if(Math.random()<l*dt){
        finRun(i); dur=PAUSA[tp]*(.5+Math.random());
        if(e===0){ d=angTumbo()*(Math.random()<.5?-1:1); RD[i]=d/dur; RN[i]=0; regGiro(tp,d); }
        else{ d=REVR*normal(); RD[i]=d/dur; RN[i]=s===0?2:0; if(e===2) dur*=.6; regGiro(tp,3.14159-Math.min(3.14159,Math.abs(d))); }
        RT[i]=dur; RS[i]=1;
      }
    }
    TH[i]=a; v=VEL[tp]*SP[i]; if(e===2&&s===2) v*=VREV; d=RS[i]===2?-1:1;
    FI[i]+=KONDA[tp]*v*d/ETA*dt; RLN[i]+=v*dt; ad=tp===2?a+.5*Math.sin(FI[i]/6+PH[i]):a; // el vaivén del tirabuzón sale de la misma fase que la onda del cuerpo
    mvx=Math.cos(ad)*v*d; mvy=Math.sin(ad)*v*d; dd=mov.der[tp]; dd[0]+=mvx; dd[1]+=mvy; dd[2]++;
  }
  // Twitching: el próximo salto es a lo largo del eje de la célula, hacia la colonia vecina con probabilidad .75
  function planTw(i){ var a=TH[i], d=NB[i]>0?Math.atan2(VY[i],VX[i]):a, sg=Math.cos(d-a)>=0?1:-1;
    if(T[i]===3&&NB[i]>0&&Math.random()<.75){ TWA[i]=d+.4*normal(); TH[i]=TWA[i]; }                // cocobacilos: tiran hacia la colonia (cohesión: colonia compacta)
    else{ if(Math.random()>.75) sg=-sg; TWA[i]=a+(sg>0?0:3.14159); }
    RT[i]=ESP_TW*(-Math.log(1-Math.random()))+.45; TWD[i]=0; }
  function twitch(i,dt){
    var x=X[i], y=Y[i], tp=T[i], j, dx, dy, m, nx, ny, ok=true, rr=RAD[tp]*SZ[i];
    TW[i]-=dt; mov.tw.seg+=dt;
    if(TW[i]<=0||IN[i]>0){ S[i]=1; TWD[i]=0; mov.tw.fijadas++; return; }
    if(TWD[i]>0){
      TWD[i]-=dt; nx=x+Math.cos(TWA[i])*VTW*dt; ny=y+Math.sin(TWA[i])*VTW*dt;
      if(nx<rr||nx>W-rr||ny<rr||ny>H-rr) ok=false;
      for(j=0;j<n&&ok;j++){ if(j===i) continue; dx=X[j]-nx; dy=Y[j]-ny; m=(rr+RAD[T[j]]*SZ[j])*.9; if(dx*dx+dy*dy<m*m) ok=false; } // no se monta sobre otra
      if(ok){ X[i]=nx; Y[i]=ny; mov.tw.dist+=VTW*dt; } else{ TWD[i]=0; if(TW[i]>.8&&NB[i]>0) TW[i]=.8; } // al chocar con una vecina se acopla y se fija en seguida
      if(TWD[i]<=0){ mov.tw.saltos++; TH[i]+=.3*normal(); planTw(i); }
    }else{ RT[i]-=dt; if(RT[i]<=0) TWD[i]=HOP*(.7+.6*Math.random()); }
  }

  // Medición (036): ataques por nivel de quorum y por exposición (segundos-célula de presa adherida en colonia, NB ≥ 3), dispersiones por quorum según la densidad
  var med={g:[[0,0],[0,0]],gt:[[0,0],[0,0]],expo:[0,0,0],inf:[0,0,0],expoNB:[0,0],infNB:[0,0],qx:[0,0,0],qd:[0,0,0],qlog:[],lisis:0,burst:0,cmuere:0,cent:0};
  function bin3(q){ return q<.1?0:q<.5?1:2; }
  function pesoPresa(j){ var w=PREF[EST[T[j]]]; return S[j]?w*(.3+.7*Math.min(NB[j],6)/6):w*.22; }
  // C (depredador): fase de ataque. Nada rápido, persigue la presa de más peso a su alcance y, en contacto, la ataca (el quorum de la presa reduce el acceso).
  // Devuelve 0 si sigue, 1 si entró en una presa (queda dentro: la presa se redondea) y 2 si murió de hambre.
  function cazar(i,dt,rel){
    var x=X[i], y=Y[i], j, best=-1, bw=0, bd=0, dx, dy, d2, w, a=TH[i], da, ta=NaN, e;
    HM[i]+=dt; if(HM[i]>CHAMBRE||Math.random()<CM0*dt){ med.cmuere++; return 2; }
    for(j=0;j<n;j++){ if(j===i||EST[T[j]]===3||IN[j]>0) continue; dx=X[j]-x; dy=Y[j]-y; d2=dx*dx+dy*dy; if(d2>CRAD*CRAD) continue;
      w=pesoPresa(j)/(1+Math.sqrt(d2)/40); if(w>bw){ bw=w; best=j; bd=d2; } }
    if(best>=0){ ta=Math.atan2(Y[best]-y,X[best]-x); if(RS[i]===0){ da=difAng(ta-a); e=CTURN*dt; a+=da<-e?-e:da>e?e:da; TH[i]=a; } } // 038: con una presa a la vista corre hacia ella (giro suave); si no, run-reverse-flick
    nadar(i,dt,best>=0?LAMR[4]*.3:LAMR[4],ta,rel);
    flujo(x,y,tiempo,false); X[i]=x+(mvx+fu)*dt; Y[i]=y+(mvy+fv)*dt;
    if(best>=0){ j=best; e=RAD[4]+RAD[T[j]]*SZ[j]+HUECO+1.6;
      if(bd<e*e){ w=1-QPROT*QL[j]; w*=w; // QL: quorum de la presa (0 sin señal, 1 colonia protegida): el acceso de C cae con el cuadrado del margen
        if(Math.random()<CATK*dt*pesoPresa(j)*(S[j]&&NB[j]>=3?1:.4)*w){
          IN[j]=LT*(1-LTV*.5+LTV*Math.random()); ev.inf=(ev.inf||0)+1; if(S[j]&&NB[j]>=3){ med.inf[bin3(QL[j])]++; med.infNB[NB[j]<6?0:1]++; } return 1; } } }
    return 0;
  }
  function lisis(i,k){ // la presa se rompe: libera 2 a 6 C (hasta CMAX en total) y devuelve parte de su contenido a las grillas
    var nc=0, j, kk, m;
    for(j=0;j<n;j++) if(T[j]===4) nc++;
    m=2+((Math.random()*5)|0); kk=0;
    for(j=0;j<m;j++) if(depr&&nc<CMAX&&n<NMAX-2&&n-nRz<NIVELES[nivel].cap&&Math.random()<(1-Math.pow(nc/CMAX,CEXP))*PREF[EST[T[i]]]){ nueva(X[i]+3*normal(),Y[i]+3*normal(),Math.random()*6.283185307,4); nc++; kk++; } // las crías sobreviven menos cuanto más C hay (dependencia de la densidad)
    m=kk;
    CA[k]=Math.min(1,CA[k]+LIBC*BM[i]); CP[k]=Math.min(1,CP[k]+LIBP*BM[i]); sucio=true;
    med.lisis++; med.burst+=m>0?m:0; ev.lisis=(ev.lisis||0)+1;
  }

  function paso(dt,real){
    var nv=NIVELES[nivel], fs=fuentes, i, c, l, s, a, p=1-Math.exp(-dt/TAU), bro=Math.sqrt(2*BRO*dt), rel=1-Math.exp(-dt/RELAJA),
        tp, x, y, v, ex, ey, exy, th2, k, cl, q, cap=nv.cap, ns=0, viva, gi, gj, k2, ao, bx, bf, pl, rc, qp, gg, esB, esN, ek, ql, bn, nC=0, ml, vl, qm, rk=-1, rl=0, rzAd, cdx, cdy, cd2, cdd;
    tiempo+=dt; cuadro++; real=real==null?dt:real; relojC+=real;
    agit*=Math.exp(-real/AGIT_T); empuje*=Math.exp(-real/AGIT_T); ONDAS[3].a=AGIT_O*agit; // la agitación del scroll decae en ≈ 2 s
    if(nv.texto&&performance.now()-tMasc>MASC_MS) mascara();
    cursorPaso(real);
    acum+=dt; if(cuadro%nv.grilla===0){ difundir(acum); acum=0; } // nivel 0: la grilla se actualiza cada 3 cuadros
    nNadan=0; nSesiles=0; nPn=0; nPsn=0; nRzn=0;
    for(i=0;i<n;i++){
      tp=T[i]; x=X[i]; y=Y[i]; if(tp===5) nPn++; k=celda(x,y); cl=CA[k]; pl=CP[k]; ml=CK[k]; vl=CF[k]; viva=true; esB=EST[tp]===1; esN=EST[tp]===2; ek=EPSK[tp];
      if(IN[i]>0){ IN[i]-=dt; if(IN[i]<=0){ lisis(i,k); quitar(i); i--; continue; } }          // presa con un C dentro: cuando se cumple el plazo, lisis
      if(S[i]){ // ---- adherida: quieta, crece, se divide, deposita matriz o se dispersa ----
        nSesiles++; if(RZc[i]) nRzn++; if(S[i]===2) twitch(i,dt);
        if(rz.on&&X[i]<rz.xmax&&((cuadro+i)&3)===0){ rzCelda(i,X[i],Y[i],false,dt); X[i]=oX; Y[i]=oY; x=oX; y=oY; }                // 040: la raíz es un obstáculo (las hijas no la atraviesan)
        q=QS[tp]*BM[i]*dt*cl/(KS[tp]+cl)/(1+BLIND*cl*cl); if(q>cl) q=cl; CA[k]=cl-q; // consumo de Monod propio de cada morfotipo, frenado en el núcleo denso (sólo se accede bien al borde)
        if(subp){ if(EST[tp]===0){ rc=CP[k]+FP*q; CP[k]=rc>1?1:rc; }                  // A libera el subproducto al comer; B lo consume
          else if(esB){ qp=QP*BM[i]*dt*pl/(KPS+pl); if(qp>pl) qp=pl; CP[k]=pl-qp; } }
        if(mut){ if(esB){ rc=CK[k]+PM*BM[i]*dt; CK[k]=rc>1?1:rc; qm=QVF*BM[i]*dt*vl/(KVF+vl); CF[k]=vl>qm?vl-qm:0; }                 // B cede carbono (m) y consume el factor (f)
          else if(esN){ rc=CF[k]+PF*dt; CF[k]=rc>1?1:rc; qm=QMN*BM[i]*dt*ml/(KMM+ml); if(qm>ml) qm=ml; CK[k]=ml-qm; } }           // el espirilo da el factor y consume el carbono
        if(quor){ rc=CI[k]; ql=rc<=Q0?0:rc>=Q1?1:(rc-Q0)/(Q1-Q0); ql=ql*ql*(3-2*ql); QL[i]=ql; CI[k]=rc+PQ*dt>1?1:rc+PQ*dt; // quorum sensing: lee el autoinductor local y lo produce
          bn=NB[i]<3?0:NB[i]<6?1:2; med.qx[bn]+=dt; if(ql>QSD) QT[i]+=dt; else{ QT[i]-=2*dt; if(QT[i]<0) QT[i]=0; }
          if(QT[i]>TQ&&NB[i]<=QNB&&IN[i]<=0&&Math.random()<KQD*dt){ // señal sostenida: la colonia se dispersa (suelta nadadoras desde el borde)
            a=Math.atan2(-VY[i],-VX[i]); if(NB[i]===0) a=Math.random()*6.283185307;
            if(med.qlog.length<600) med.qlog.push([+tiempo.toFixed(1),NB[i],+ql.toFixed(2),+QT[i].toFixed(1)]);
            S[i]=0; TH[i]=a+.4*normal(); SP[i]=FRENADA; BM[i]=1; HM[i]=-REFRACTARIA; M[i]=Math.log(sentir(tp,x,y)+C0); QT[i]=0; QL[i]=0; ev.qdisp=(ev.qdisp||0)+1; med.qd[bn]++;
            continue; }
          ek*=1+QEPS*ql; }
        if(IN[i]<=0&&NB[i]>=3&&EST[tp]!==3){ med.expo[bin3(QL[i])]+=dt; med.expoNB[NB[i]<6?0:1]+=dt; }
        if(nv.eps){ ETM[i]+=dt; if(ETM[i]>EPS_T/(ek*(1+.3*Math.min(NB[i],8)))){ ETM[i]=0;    // la matriz se deposita más seguido (y más fuerte) donde hay más vecinas (el centro); B, más que A
          if(NB[i]>0){ l=Math.sqrt(VX[i]*VX[i]+VY[i]*VY[i])+1e-6; ex=VX[i]/l; ey=VY[i]/l; } else{ ex=Math.cos(TH[i]); ey=Math.sin(TH[i]); } // hacia el centro de la colonia (crecimiento radial); sola, a lo largo de su eje
          eps(x+ex*3,y+ey*3,x+ex*(3+EPS_L),y+ey*(3+EPS_L),(.45+.1*Math.min(NB[i],5))*(.8+.2*ek)); } }
        gg=MU[tp]*cl/(KS[tp]+cl); if(esB) gg=(gg+MUP*pl/(KPS+pl))/(1+cl*cl/(KIB*KIB))*(1+VBG*vl/(KVF+vl)); else if(esN) gg+=MUM*ml/(KMM+ml);  // crecimiento de Monod: cada morfotipo con su μmax y su Ks; B suma el subproducto, se frena con exceso de c y se beneficia del factor f; el espirilo suma el carbono m
        else if(tp===5){ rk=rz.on?rzIdx(x,y):-1; if(rk>=0){ rl=CR[rk]; gg+=MUR*rl/(KR+rl); qm=QR*BM[i]*dt*rl/(KR+rl); CR[rk]=rl>qm?rl-qm:0; } else rl=0; }   // 040: el especialista crece con el exudado de la raíz (su carbono)
        if(esB||esN){ bn=esB?0:1; ql=NP[i]>0?0:1; med.g[bn][ql]+=GROW*GR[i]*gg*dt; med.gt[bn][ql]+=dt; }  // medición: crecimiento con la pareja a < RP px (juntos) y sin ella (separados)
        if(IN[i]>0) gg=0;                                                              // bdeloplasto: la presa deja de crecer y de dividirse
        if(!(tp===0&&ES[i]===3&&BM[i]>=1.45)) BM[i]+=GROW*GR[i]*dt*gg;                  // ritmo individual (los diplococos se quedan en pares)
        if(tp===1){ if(NB[i]>=1){ ao=.5*Math.atan2(DY[i],DX[i]); TH[i]+=dt*.5*Math.sin(2*(ao-TH[i])); } }       // 038: bacilos (A): se alinean con el director de sus vecinas, en paralelo: colonias alargadas, en empalizada
        else if(tp===2&&NB[i]>=2){ ao=Math.atan2(-VY[i],-VX[i]); TH[i]+=dt*.4*Math.sin(2*(ao-TH[i])); }           // espirilos: crecimiento radial; los cocobacilos (B) no se alinean (colonia redonda y compacta) y los cocos conservan su eje (cadenas, racimos)
        if((RZc[i]?nRz>=RZ_MAXN[nivel]:n-nRz>=cap-RESERVA)||(tp===5&&nPc>=PMAX)){ if(BM[i]>1.69) BM[i]=1.69; }                                  // con la población al tope no hay divisiones (ni constricción a medias)
        else if(BM[i]>=2&&!dividir(i)){ BM[i]=1.55; ev.divFalla=(ev.divFalla||0)+1; }                                          // si no hay lugar, la constricción retrocede y se reintenta más tarde
        if(cl+(esB?WP*pl:esN?WMA*ml:tp===5?WRP*rl*.3:0)<CDT[tp]) HM[i]+=dt; else { HM[i]-=2*dt; if(HM[i]<0) HM[i]=0; }
        if(HM[i]>THAMBRE){
          if(NB[i]<4&&Math.random()<KDISP*dt){ // dispersión: sale hacia afuera desde el borde de la colonia
            a=Math.atan2(-VY[i],-VX[i]); if(NB[i]===0) a=Math.random()*6.283185307;
            S[i]=0; TH[i]=a+.4*normal(); SP[i]=FRENADA; BM[i]=1; HM[i]=-REFRACTARIA; M[i]=Math.log(sentir(tp,x,y)+C0); ev.disp++;
            for(k=0;k<n;k++) if(S[k]&&k!==i&&(X[k]-x)*(X[k]-x)+(Y[k]-y)*(Y[k]-y)<VECINO*VECINO*1.7) HM[k]+=CASCADA; // la dispersión se contagia a las vecinas (señal de colonia)
          }else if(HM[i]>3*THAMBRE&&Math.random()<KMUERTE*dt){ viva=false; ev.hambre++; } // el hambre prolongada mata
        }
      }else{
        if(tp===4) nC++; else nNadan++; if(tp===5) nPsn++; if(HM[i]<0) HM[i]+=dt; RZc[i]=0;
        if(nv.eps&&tp>0&&tp<4){ if(NB[i]>0){ ETM[i]+=dt; if(LX[i]!==LX[i]){ LX[i]=x; LY[i]=y; ETM[i]=0; } // deslizamiento junto a una colonia, previo a adherirse: un rastro tenue y corto del desplazamiento
          else if(ETM[i]>.3&&(x-LX[i])*(x-LX[i])+(y-LY[i])*(y-LY[i])>6){ eps(LX[i],LY[i],x,y,.4); LX[i]=x; LY[i]=y; ETM[i]=0; } } else LX[i]=NaN; }
        flujo(x,y,tiempo,nv.jeffery&&tp>0);
        if(tp!==4){ q=QNAD*dt*cl/(KM+cl)/(1+BLIND*cl*cl); if(q>cl) q=cl; CA[k]=cl-q;    // consumo de Monod (pequeño)
          if(subp&&EST[tp]===0){ rc=CP[k]+FP*q; CP[k]=rc>1?1:rc; } }
        if(tp===0){ // coco: lo lleva la corriente, más movimiento browniano
          x+=fu*dt+bro*normal(); y+=fv*dt+bro*normal();
        }else if(tp===4){ // depredador: persigue y ataca
          ao=cazar(i,dt,rel); if(ao===1){ ev.cEntra=(ev.cEntra||0)+1; viva=false; } else if(ao===2){ ev.cMuere=(ev.cMuere||0)+1; viva=false; } x=X[i]; y=Y[i];
        }else{
          c=Math.log(sentir(tp,x,y)+C0);
          s=(c-M[i])/TAU;                          // d(ln c)/dt según la memoria de la célula
          M[i]+=(c-M[i])*p;
          l=LAMR[tp]*Math.exp(-GAIN[tp]*s); l=l<LAMR[tp]*LMIN?LAMR[tp]*LMIN:l>LAMR[tp]*LMAX?LAMR[tp]*LMAX:l;   // la señal quimiotáctica baja la tasa de tumbos (alarga la corrida) si sube la concentración
          a=TH[i];
          if(nv.jeffery){                          // órbita de Jeffery: gira con la vorticidad y se alinea con el corte
            ex=gux; exy=.5*(guy+gvx); th2=2*a;
            a+=dt*(.5*(gvx-guy)+LAMBDA_J*(exy*Math.cos(th2)-ex*Math.sin(th2)));
          }
          TH[i]=a;
          nadar(i,dt,l,NaN,rel);                   // 038: corrida, tumbo o inversión; la fase de la onda avanza con la velocidad (ω = k·v/η)
          x+=(mvx+fu)*dt; y+=(mvy+fv)*dt;
        }
        bx=0; // texto en «aguas tranquilas»: las células se alejan suavemente de los bloques de texto y no se adhieren bajo ellos
        if(nv.texto){ k2=celda(x,y); gi=k2%GX; gj=(k2/GX)|0; bx=TXT[k2];
          bf=REP_T*dt*.5;
          x-=(TXB[gj*GX+(gi<GX-1?gi+1:gi)]-TXB[gj*GX+(gi>0?gi-1:gi)])*bf; y-=(TXB[(gj<GY-1?gj+1:gj)*GX+gi]-TXB[(gj>0?gj-1:gj)*GX+gi])*bf; }
        if(CUR_V>0&&ptr.ok&&!S[i]&&!RZc[i]){ cdx=x-ptr.x; cdy=y-ptr.y; cd2=cdx*cdx+cdy*cdy; if(cd2<CUR_R*CUR_R){ cdd=Math.sqrt(cd2)||1; bf=1-cdd/CUR_R; bf=CUR_V*bf*bf*dt/cdd; x+=cdx*bf; y+=cdy*bf; } }   // 046: repulsión leve del cursor sobre las nadadoras (empujan hacia afuera del cursor: a 25 px ≈ 18 px/s, a 50 px ≈ 4 px/s)
        // adhesión: en una zona rica, más probable junto a células ya adheridas
        rzAd=0; if(rz.on&&x<rz.xmax){ rzAd=rzCelda(i,x,y,true,dt); x=oX; y=oY; }                         // 040: obstáculo y adhesión al rizoplano (superficie de la raíz y de sus pelos)
        rc=cl+(esB?WP*pl+WFA*vl:esN?WMA*ml:0); if(rc>1) rc=1;                                          // riqueza que percibe: c (y p, para B)
        if(rzAd){}
        else if(tp===4){}                                                                  // C no se adhiere
        else if(rc>CADT[tp]&&Math.random()<KADH*KADT[tp]*dt*(rc-CADT[tp])/(1-CADT[tp])*(.06+1.6*NB[i])*(1-bx)/(esB?(1+NAK*NA[i])*(1+cl*cl/(KIB*KIB)):1)&&NB[i]<9&&HM[i]>=0){ S[i]=(tp===1||tp===3)?2:1; SP[i]=0; HM[i]=0; BM[i]=1+.4*Math.random(); ev.adh++; RS[i]=0; if(S[i]===2){ TW[i]=TW0+(TW1-TW0)*Math.random(); planTw(i); } } // (038: bacilos y cocobacilos: twitching antes de fijarse) B se adhiere con menos nutriente y más seguido
        else if(rc<CPOB[tp]&&Math.random()<MUERTE_POBRE*dt){ viva=false; ev.pobre++; }   // muerte en medio pobre (B aguanta más)
        if(x<0||x>W||y<0||y>H){
          if(tp!==4&&Math.random()<SALIDA){ viva=false; ev.sal++; }                         // sale por el borde (C no)
          else{ if(x<0){ x=-x; TH[i]=Math.PI-TH[i]; } else if(x>W){ x=2*W-x; TH[i]=Math.PI-TH[i]; } if(y<0){ y=-y; TH[i]=-TH[i]; } else if(y>H){ y=2*H-y; TH[i]=-TH[i]; } }
        }
        X[i]=x; Y[i]=y;
      }
      if(!viva){ quitar(i); i--; }
    }
    for(i=0;i<nt;i++){ // trazadores: sólo la corriente (envuelven por los bordes)
      flujo(TX[i],TY[i],tiempo,false); TX[i]+=fu*dt; TY[i]+=fv*dt;
      if(TX[i]<-10) TX[i]+=W+20; else if(TX[i]>W+10) TX[i]-=W+20; if(TY[i]<-10) TY[i]+=H+20; else if(TY[i]>H+10) TY[i]-=H+20;
    }
    // población: entran nadadoras por los bordes cuando faltan; si se pasa del tope por el nivel, se retiran las sobrantes
    if(nNadan<NSWIM&&n-nRz<cap&&Math.random()<INMIG*dt){ entrante(); ev.ent++; }
    if(depr&&nC<CMIN&&n-nRz<cap&&Math.random()<CIMM*dt){ entranteC(); med.cent++; }          // el piso de C: si quedan menos de CMIN, entra una por un borde
    if(rz.on&&rz.esp&&nPs<PMIN&&nPc<PMAX&&n-nRz<cap&&Math.random()<PIMM*dt) entranteP();           // 040: el piso del especialista en el suelo: si nadan menos de PMIN P, entra una por el borde izquierdo (la colonización de la punta nueva depende de ellas)
    nPc=nPn; nPs=nPsn; nRz=nRzn; rzCrece(real);
    while(n-nRz>cap) quitar(n-1);
    euPaso(dt);                                                                                      // 045: los eucariotas (depredan sobre las bacterias: van antes del recuento de vecinas)
    if(nRz>RZ_MAXN[nivel]+3){ for(k=n-1;k>=0;k--) if(RZc[k]&&S[k]){ quitar(k); break; } }                  // si baja el nivel (o el tope) la raíz suelta de a una las células que le sobran
    vecinos(nv.choques);
  }

  // Vecindad y choques suaves (un solo recorrido de pares): cuenta las vecinas adheridas de cada célula (para la adhesión y la
  // dispersión) y, si el nivel lo permite, empuja a las que se superponen; las adheridas no se mueven.
  function vecinos(empujar){
    var i, j, dx, dy, d2, md, d, o, k, si, sj, r2=VECINO*VECINO;
    for(i=0;i<n;i++){ NB[i]=0; NA[i]=0; NP[i]=0; VX[i]=0; VY[i]=0; DX[i]=0; DY[i]=0; if(S[i]){ C2[i]=Math.cos(2*TH[i]); S2[i]=Math.sin(2*TH[i]); } }
    for(i=0;i<n-1;i++) for(j=i+1;j<n;j++){
      dx=X[j]-X[i]; dy=Y[j]-Y[i];
      if(dx>RP||dx<-RP||dy>RP||dy<-RP) continue;
      d2=dx*dx+dy*dy; si=S[i]; sj=S[j];
      if(d2<RP*RP&&NP[i]<255&&NP[j]<255&&EST[T[i]]+EST[T[j]]===3&&EST[T[i]]*EST[T[j]]===2){ NP[i]++; NP[j]++; }  // pareja del mutualismo (espirilo y B) a < RP px
      if(d2<r2){ if(sj&&NB[i]<255){ NB[i]++; VX[i]+=dx; VY[i]+=dy; DX[i]+=C2[j]; DY[i]+=S2[j]; if(EST[T[j]]===0) NA[i]++; } if(si&&NB[j]<255){ NB[j]++; VX[j]-=dx; VY[j]-=dy; DX[j]+=C2[i]; DY[j]+=S2[i]; if(EST[T[i]]===0) NA[j]++; } }
      if(!empujar) continue;
      md=RAD[T[i]]*SZ[i]+RAD[T[j]]*SZ[j]+HUECO; if(d2>=md*md) continue;
      d=Math.sqrt(d2); o=(md-d)*RIGIDEZ; if(d<.02){ dx=1; dy=0; k=o; } else k=o/d;
      if(si&&!sj){ X[j]+=dx*k; Y[j]+=dy*k; } else if(sj&&!si){ X[i]-=dx*k; Y[i]-=dy*k; } else { X[i]-=dx*k*.5; Y[i]-=dy*k*.5; X[j]+=dx*k*.5; Y[j]+=dy*k*.5; }
    }
  }

  // Arena: un montón visto desde arriba. Cada grano nace en el cursor y viaja a su sitio (ease-out, 2,5–5 s), del centro hacia afuera. Se ve mientras la
  // concentración de su celda, por encima del fondo, supera su umbral: así el consumo (Monod) y el decaimiento lo adelgazan grano a grano. Más tenue bajo el texto.
  var AX=new Float32Array(GMAX*8), AY=new Float32Array(GMAX*8), AS=new Float32Array(GMAX*8), AB=new Uint8Array(GMAX*8), nGranos=0, nBajo=0;
  function arena(nv){
    var k, j, e, g, w, sg, ng=nv.gr, c, tx, ty, p, vi, b, na=0, ntot=0, rel, ce, bajo, cx, cy, t, nb=0, kw, rho, sg0, ti, vi2, sol, al, rc, th, gr, m, fo;
    for(k=0;k<cur.length;k++){
      e=cur[k]; g=e.g; if(!g||na+ng>GMAX*8) continue; w=e.a/AMAX; rho=RHO0+(RHO1-RHO0)*Math.sqrt(Math.min(1,e.D/DREF)); sg0=GSIG*e.s0; sg=sg0*rho; ti=0; vi2=0; kw=e.crece?ARENA_K*w:0; // mientras el cursor sigue ahí, el flujo de la fuente basta para los primeros granos (la grilla tarda en subir)
      if(!g.ini){ for(j=0;j<GMAX;j++){ tx=e.x+g.x[j]*sg0; ty=e.y+g.y[j]*sg0; g.c0[j]=tx<0||ty<0||tx>=W||ty>=H?0:CA[celda(tx,ty)]; } g.ini=true; }
      for(j=0;j<ng;j++){
        tx=e.x+g.x[j]*sg; ty=e.y+g.y[j]*sg; if(tx<0||ty<0||tx>=W||ty>=H) continue;
        ce=celda(tx,ty); c=CA[ce]-g.c0[j]; if(c<kw) c=kw;
        if(g.v[j]===1){ if(c<.8*g.th[j]) g.v[j]=2; }                                         // consumido: se apaga con algo de histéresis
        else if(c>g.th[j]&&(g.v[j]===2||w>=g.pu[j])){ g.v[j]=1; g.tv[j]=relojC; }            // nace (la puerta de crecimiento sólo cuenta la primera vez)
        if(g.pu[j]<.4){ ti++; if(g.v[j]===1) vi2++; }
        if(g.v[j]!==1) continue;
        p=(relojC-g.tv[j])/g.d[j]; if(p>1) p=1; p=1-(1-p)*(1-p);
        cx=e.x+(tx-e.x)*p; cy=e.y+(ty-e.y)*p;
        rel=c/.6; b=rel<.34?0:rel<.67?1:2; bajo=nv.texto&&TXB[ce]>.5?1:0;
        nb+=bajo; ntot++; if(fuera(cx,cy)) continue;                                  // 039: los granos fuera de la luz se cuentan pero no se dibujan
        AX[na]=cx; AY[na]=cy; AS[na]=g.sz[j]; AB[na]=b*2+bajo; na++;
      }
      sol=(e.D-SOL0)/(SOL1-SOL0); sol=sol<0?0:sol>1?1:sol; sol=sol*sol*(3-2*sol); m=ti>0?vi2/ti:0; al=ALFA_NUC*sol*m*factor; // el núcleo: más sólido con lo depositado, más fino cuando se lo comen
      if(al>.01&&e.x>=0&&e.y>=0&&e.x<W&&e.y<H){
        rc=NUC_R*sg*Math.sqrt(m); if(nv.texto&&TXB[celda(e.x,e.y)]>.5) al*=ARENA_TXT;
        gr=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,rc*1.2); gr.addColorStop(0,'rgba('+rgb+','+al.toFixed(3)+')'); gr.addColorStop(.7,'rgba('+rgb+','+(al*.8).toFixed(3)+')'); gr.addColorStop(1,'rgba('+rgb+','+(al*.15).toFixed(3)+')');
        e.nr=rc; e.na=al; if(fuera(e.x,e.y)) continue; ctx.fillStyle=gr; ctx.beginPath();
        for(t=0;t<28;t++){ th=t*.2243995; fo=1+.12*Math.sin(2*th+g.f[0])+.08*Math.sin(3*th+g.f[1])+.05*Math.sin(5*th+g.f[2]); tx=e.x+Math.cos(th)*rc*fo; ty=e.y+Math.sin(th)*rc*fo; if(t) ctx.lineTo(tx,ty); else ctx.moveTo(tx,ty); }
        ctx.closePath(); ctx.fill();
      }
    }
    nGranos=ntot; nBajo=nb;
    for(b=0;b<6;b++){
      ctx.beginPath(); t=0;
      for(j=0;j<na;j++) if(AB[j]===b){ ctx.rect(AX[j]-AS[j]*.5,AY[j]-AS[j]*.5,AS[j],AS[j]); t=1; }
      if(t){ ctx.fillStyle='rgba('+rgb+','+(ALFA_AR[b>>1]*(b&1?ARENA_TXT:1)*factor).toFixed(3)+')'; ctx.fill(); }
    }
  }

  function dibujar(){
    var i, k, tp, c, s, a, x, y, sx, f, u, w, e, sesil, sz, pt, Le, g, r, d, nv=NIVELES[nivel], m, ex, ey, h, nf, hf, sg, rec=luzPrep(), det, lz=luz.activa, d2, mc, r1=luz.r;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H); ctx.globalAlpha=1;
    ctx.lineCap='round'; ctx.lineJoin='round';
    if(nv.eps&&eneT){ // matriz (EPS): rastros finos y alargados, en tres tramos de intensidad, que se desvanecen con la edad
      var b3, ne=eneT<NE?eneT:NE, ed;
      ctx.lineWidth=1.05;
      for(b3=0;b3<3;b3++){
        ctx.beginPath(); r=0;
        for(k=0;k<ne;k++){ ed=1-(tiempo-EN[k])/EPS_VIDA; if(ed<=0||fuera(EA[k*4],EA[k*4+1])) continue; w=EW[k]*ed; if((w>.62?2:w>.3?1:0)!==b3) continue; ctx.moveTo(EA[k*4],EA[k*4+1]); ctx.lineTo(EA[k*4+2],EA[k*4+3]); r=1; }
        if(r){ ctx.strokeStyle='rgba('+rgb+','+(ALFA_EPS[b3]*factor).toFixed(3)+')'; ctx.stroke(); }
      }
    }
    if(cur.length) arena(nv);
    if(nt){ // trazadores: líneas finísimas, con una cola corta en el sentido contrario a la corriente
      ctx.strokeStyle=traza; ctx.lineWidth=.9; ctx.beginPath();
      for(i=0;i<nt;i++){ if(fuera(TX[i],TY[i])) continue; flujo(TX[i],TY[i],tiempo,false); ctx.moveTo(TX[i],TY[i]); ctx.lineTo(TX[i]-fu*.5,TY[i]-fv*.5); }
      ctx.stroke();
    }
    for(i=0;i<n;i++){
      x=X[i]; y=Y[i]; det=!lz||(rec&&enLuz(x,y)); if(!det&&(i%LUZ_MUESTRA||RZc[i])) continue;       // 039: fuera de la luz sólo se dibuja el cuerpo (041: y no el de las células de la raíz, que la delatarían)
      tp=T[i]; sesil=S[i]; sz=SZ[i];
      mc=1; if(lz){ u=colF(x); if(u>0){ d2=rec?luzI(x,y):0; d2=d2>=.33?0:1-d2/.33; d2=d2*d2*(3-2*d2); mc=1-(1-LUZ_COL)*u*d2; } }   // 041: sobre la columna de texto el fondo queda casi oculto (LUZ_PISO·LUZ_COL), y la luz lo revela
      u=sesil&&BM[i]>1.7?(BM[i]-1.7)/.3:0; if(u>1) u=1;                       // avance de la constricción (la célula se alarga y se estrecha al medio)
      m=mc; if(nv.texto) m*=1-.45*(TXB[celda(x,y)]>1?1:TXB[celda(x,y)]); ctx.globalAlpha=m; // más tenues bajo el texto
      if(IN[i]>0&&tp!==4){ // bdeloplasto: la presa con un C dentro se redondea (un círculo algo mayor, con un punto adentro)
        r=(tp===0?2.9:3.5)*sz; ctx.fillStyle=sesil?coloresS[tp]:colores[tp]; ctx.beginPath(); ctx.arc(x,y,r,0,6.283185307); ctx.fill();
        ctx.fillStyle=bdel; ctx.beginPath(); ctx.arc(x,y,r*.34,0,6.283185307); ctx.fill(); continue;
      }
      if(tp===0){
        ctx.fillStyle=sesil?coloresS[0]:colores[0]; r=2.8*sz; ctx.beginPath();
        if(u>0){ d=3.25*u*sz; ex=Math.cos(TH[i])*d; ey=Math.sin(TH[i])*d; ctx.arc(x-ex,y-ey,r,0,6.283185307); ctx.moveTo(x+ex+r,y+ey); ctx.arc(x+ex,y+ey,r,0,6.283185307); } // dos lóbulos que se separan
        else ctx.arc(x,y,r,0,6.283185307);
        ctx.fill(); continue;
      }
      a=TH[i]; c=Math.cos(a)*dpr; s=Math.sin(a)*dpr; ctx.setTransform(c,s,-s,c,x*dpr,y*dpr); f=FI[i];
      if(tp===1||tp===3){
        h=tp===1?2.45:.9; r=tp===1?1.55:1.75;                                                                                                       // bacilo (A): cápsula de 8 × 3,1 px; cocobacilo (B): 5,3 × 3,5 px, casi tan ancho como largo
        ctx.strokeStyle=sesil?coloresS[tp]:colores[tp]; ctx.lineWidth=2*r*sz; ctx.beginPath();
        if(u>0){ Le=(h+r)*(1+.9625*u)*sz; g=.97*r*u*sz; ctx.moveTo(-(Le-r*sz),0); ctx.lineTo(-g,0); ctx.moveTo(g,0); ctx.lineTo(Le-r*sz,0); }       // constricción: dos lóbulos con cintura
        else{ ctx.moveTo(-h*sz,0); ctx.lineTo(h*sz,0); }
        ctx.stroke();
        if(!sesil&&det){                                                                                                                            // flagelo: onda que viaja hacia atrás (largo en A, corto en B; detenido y sin dibujar si está adherida)
          nf=tp===1?12:6; hf=(h+r)*sz; ctx.strokeStyle=cola; ctx.lineWidth=.75; ctx.beginPath();
          if(RS[i]===1){                                                                                                                            // tumbo: el haz de flagelos se deshace en dos filamentos que se abren
            for(sg=-1;sg<=1;sg+=2){ ctx.moveTo(-hf,0); for(k=1;k<=nf;k++){ pt=k*.75; w=-hf-pt*.9; ctx.lineTo(w,sg*pt*.5+1.1*(pt/9)*Math.sin(KONDA[1]*w+f)); } }
          }else{ ctx.moveTo(-hf,0); for(k=1;k<=nf;k++){ pt=k*.75; w=-hf-pt; ctx.lineTo(w,1.5*(pt/9)*Math.sin(KONDA[1]*w+f)); } }
          ctx.stroke();
        }else if(S[i]===2&&(TWD[i]>0||RT[i]<.3)){                                                                                                   // twitching: el pilo tipo IV se extiende hacia adelante y se retrae al tirar de la célula
          pt=TWD[i]>0?PILO*Math.min(1,TWD[i]/HOP):PILO*(1-RT[i]/.3); w=TWA[i]-a; ex=Math.cos(w); ey=Math.sin(w); hf=(h+r)*sz*(ex>=0?1:-1);
          ctx.strokeStyle=cola; ctx.lineWidth=.6; ctx.beginPath(); ctx.moveTo(hf,0); ctx.lineTo(hf+ex*pt,ey*pt); ctx.stroke();
        }
      }else if(tp===5){                                                                                                                              // PGPR (040, tipo Azospirillum): bastón curvo de ≈ 8 px con un flagelo polar (nadando)
        ctx.strokeStyle=sesil?coloresS[5]:colores[5]; ctx.lineWidth=2.5*sz; ctx.beginPath(); ctx.moveTo(-3.7*sz,1.1*sz); ctx.quadraticCurveTo(0,-2.3*sz,3.7*sz,1.1*sz); ctx.stroke();
        if(!sesil&&det){ ctx.strokeStyle=cola; ctx.lineWidth=.7; ctx.beginPath(); ctx.moveTo(-3.7*sz,1.1*sz); for(k=1;k<=9;k++){ pt=k*.75; w=-3.7*sz-pt; ctx.lineTo(w,1.1*sz+1.3*(pt/7)*Math.sin(KONDA[5]*w+f)); } ctx.stroke(); }
      }else if(tp===4){                                                                                                                              // vibrio (C): una coma de 5 px, mucho más chica que A y B, con un flagelo polar de onda rápida
        ctx.strokeStyle=colores[4]; ctx.lineWidth=1.7*sz; ctx.beginPath();
        for(sg=RS[i]===1?2.1:.95,k=0;k<=6;k++){ sx=(-2.4+k*.8); if(k) ctx.lineTo(sx*sz,sg*sz*(1-sx*sx/5.76)); else ctx.moveTo(sx*sz,0); }    // (en el flick la coma se dobla más)
        ctx.stroke(); ctx.strokeStyle=cola; ctx.lineWidth=.7; ctx.beginPath(); ctx.moveTo(-2.4*sz,0);
        for(k=1;k<=9;k++){ pt=k*.75; w=-2.4*sz-pt; ctx.lineTo(w,1.3*(pt/7)*Math.sin(KONDA[4]*w+f)); }
        ctx.stroke();
      }else{                                                                                                                                         // espirilo: trazo ondulado de 9 px (con constricción: dos mitades)
        ctx.strokeStyle=sesil?coloresS[2]:colores[2]; ctx.lineWidth=1.35*sz; ctx.beginPath();
        if(u>0){ Le=4.5*(1+.9*u)*sz; g=.7*u*sz; for(k=0;k<=8;k++){ sx=-Le+(Le-g)*k/8; if(k) ctx.lineTo(sx,1.5*sz*Math.sin(KONDA[2]*sx+f)); else ctx.moveTo(sx,1.5*sz*Math.sin(KONDA[2]*sx+f)); }
          for(k=0;k<=8;k++){ sx=g+(Le-g)*k/8; if(k) ctx.lineTo(sx,1.5*sz*Math.sin(KONDA[2]*sx+f)); else ctx.moveTo(sx,1.5*sz*Math.sin(KONDA[2]*sx+f)); } }
        else for(k=0;k<=12;k++){ sx=(-4.5+k*.75)*sz; if(k) ctx.lineTo(sx,1.5*sz*Math.sin(KONDA[2]*sx+f)); else ctx.moveTo(sx,1.5*sz*Math.sin(KONDA[2]*sx+f)); }
        ctx.stroke();
      }
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    if(eu.length||nem) euDibujar(rec,lz,nv);                                                         // 045: los eucariotas, sobre las bacterias
    ctx.globalAlpha=1;
  }

  // ------------------------------------------------------------------------------------------------------------------------------------------------------------
  // Eucariotas (045, ajustados en la 046). Arriba de la cadena alimenticia, en el mismo medio: flagelados heterótrofos (tipo Bodo), dinoflagelados heterótrofos (tipo Oxyrrhis), amebas, paramecios (Paramecium) y
  // euglenas (flagelados con cloroplastos), más, muy de vez en cuando, un nematodo que visita la punta de la raíz. No reemplazan a las bacterias: son aparte (arreglos propios, ≤ 8 + el nematodo), se mueven por su cuenta y se
  // dibujan en el mismo canvas, así que quedan bajo la luz igual que ellas (cuerpo, núcleo, flagelos y cilios también fuera de ella, más oscuros que las bacterias; el detalle fino, bajo la luz). Escala: no es la real (un paramecio mide ≈ 50× una bacteria).
  //   Cadena: bacterias → flagelados, dinoflagelados (sobre todo flagelados), amebas (sobre todo colonias adheridas) y paramecios (flagelados y euglenas) → nematodo (que también come a todos ellos).
  //   Interacciones entre ellos: depredación (dinoflagelado, ameba y paramecio comen flagelados y euglenas; el nematodo, a todos), huida (los flagelados y las euglenas escapan a ráfagas de sus depredadores; todos, del nematodo), energía y división (cada presa da
  //   energía; al llegar al umbral se dividen si hay lugar; sin presas se mueren de hambre en ≈ 1–2 min; la euglena hace fotosíntesis y no come) y el lazo microbiano: cada presa digerida devuelve nutriente a la grilla (CA), que atrae de nuevo a las bacterias.
  //   Las bacterias del rizoplano (RZc) quedan protegidas de los protistas (biopelícula); el nematodo sí las ramonea. 046: viven sobre todo en los márgenes (donde se ve la simulación): nacen ahí, entran por los bordes izquierdo y derecho y, si no cazan, se desvían hacia el margen más cercano.
  //   El nematodo llega por el borde izquierdo hacia la punta de la raíz (quimiotaxis a los exudados), la rodea 28–45 s comiendo y se va. El primero llega 12–22 s después de cargar la página (para que se vea); desde entonces, en promedio cada ≈ 185 s (mínimo 25 s desde que se fue el anterior).
  var EU_CAPN=[1,2,4,8], EU_MAX=[4,2,2,2,2], EU_MIN=[1,1,1,1,1];                    // tope de protistas por nivel de calidad, por tipo, y piso (si bajan de él, entra uno por un borde). Tipos: 0 flagelado, 1 dinoflagelado, 2 ameba, 3 paramecio, 4 euglena
  var EU_R=[3.9,8.2,13,15,8], EU_V=[42,50,9,58,28], EU_PER=[44,72,42,76,0], EU_W=[6,4,1.3,5,3], EU_SIG=[2.4,1.5,.9,1.5,1.2];   // radio (px), velocidad de crucero (px/s), percepción de presas (px), giro máximo (rad/s) y ruido del rumbo
  var EU_E0=[3,4,4,4,3], EU_EDIV=[7,9,9,10,6], EU_MET=[.0125,.01,.007,.011,-.006], EU_MANEJO=[.8,1.2,.35,.3,0], EU_DIG=7, EU_HUIDA=44, EU_AL=1.55;   // energía inicial y de división, gasto (1/s; la euglena gana), tiempo de manejo (s), digestión (s), radio de alarma (px) y factor de opacidad (más oscuros que las bacterias)
  // probabilidad de captura por segundo de contacto: [bacteria nadadora, bacteria adherida, flagelado, dinoflagelado, ameba, paramecio, euglena]
  var EU_COME=[[.9,0,0,0,0,0,0],[.5,.2,.9,0,0,0,.5],[.5,.9,.45,0,0,0,.3],[.9,.5,.7,0,0,0,.5],[0,0,0,0,0,0,0]], EU_VALOR=[1,2.5,4,6,5,3];   // energía que da una presa: bacteria, flagelado, dinoflagelado, ameba, paramecio, euglena
  var EU_NS=18, EU_NL=96, EU_NV=15, EU_NT0=25, EU_NMEDIA=160, EU_NPRIM=12, EU_NCOME=[.8,.6,.7,.5,.35,.35,.5];   // nematodo: puntos del cuerpo, largo (px), velocidad (px/s), espera mínima y media (s), primera visita (s tras cargar), captura por segundo [nadadora, adherida, flagelado, dino, ameba, paramecio, euglena]
  var eu=[], nem=null, euOn=true, euTn=0, euEv={comio:[0,0,0,0,0,0],div:0,muere:0,ent:0,huida:0,nem:0,nemComio:[0,0,0,0,0,0],exc:0};
  function angd(a,b){ var d=a-b; d=(d+Math.PI)%6.283185307; if(d<0) d+=6.283185307; return d-Math.PI; }
  function euC(a){ return 'rgba('+rgb+','+Math.min(1,a*EU_AL*(euF||1)).toFixed(3)+')'; }
  function euNuevo(tp,x,y,th,E){
    var o={t:tp,x:x,y:y,th:th,ph:Math.random()*6.2832,E:E==null?EU_E0[tp]:E,h:0,burst:0,cd:0,dead:0,vac:[],R:EU_R[tp]*(.9+.22*Math.random()),f1:Math.random()*6.28,f2:Math.random()*6.28,f3:Math.random()*6.28,pa:0,vg:0};
    eu.push(o); return o;
  }
  function euMargen(R){ // un punto al azar en los márgenes (el izquierdo, 60 %; el derecho, 40 %), donde se ve la simulación
    var izq=colIzq>2*R+16&&(Math.random()<.6||W-colDer<2*R+16), x;
    if(izq) x=R+6+Math.random()*(colIzq-2*R-12); else x=colDer+R+6+Math.random()*Math.max(1,W-colDer-2*R-12);
    return [x,R+8+Math.random()*(H-2*R-16)];
  }
  function euInicio(){ // población de partida (una visita): 1 flagelado, 1 dinoflagelado, 1 ameba, 1 paramecio y 1 euglena en los márgenes
    var tps=[0,1,2,3,4], k, q, g, o;
    eu.length=0; nem=null; for(k=0;k<6;k++){ euEv.comio[k]=0; euEv.nemComio[k]=0; } euEv.div=0; euEv.muere=0; euEv.ent=0; euEv.huida=0; euEv.nem=0; euEv.exc=0;
    if(!euOn||EU_CAPN[nivel]===0) return;
    for(k=0;k<tps.length;k++){ g=0; do{ q=euMargen(EU_R[tps[k]]); g++; }while(g<40&&rz.on&&q[0]<rz.xmax+24&&Math.abs(q[1]-rz.tipY)<400); euNuevo(tps[k],q[0],q[1],Math.random()*6.2832); }
    euTn=tiempo+EU_NPRIM+10*Math.random();                                                      // el primer nematodo, pronto (para que se vea); los siguientes, muy de vez en cuando
  }
  function euEntra(tp){ // entra uno por un borde lateral (85 %) o por arriba o abajo, hacia adentro
    var lado=Math.random()<.85?(Math.random()<.55?0:1):2+((Math.random()*2)|0), x, y, th;
    if(lado===0){ x=2; y=Math.random()*H; th=0; } else if(lado===1){ x=W-2; y=Math.random()*H; th=Math.PI; } else if(lado===2){ x=Math.random()*(colIzq>40?colIzq:W); y=2; th=Math.PI/2; } else { x=Math.random()*(colIzq>40?colIzq:W); y=H-2; th=-Math.PI/2; }
    euNuevo(tp,x,y,th+.4*normal()); euEv.ent++;
  }
  function euVac(o,v,r){ if(o.vac.length>=9) o.vac.shift(); o.vac.push({t0:tiempo,dig:EU_DIG*(.8+.4*Math.random())*(1+.25*r),a:Math.random()*6.28,r:.15+.5*Math.random(),val:v,s:r}); }
  function euMover(o,dt){
    var tp=o.t, R=o.R, x=o.x, y=o.y, k, j, dx, dy, d2, best=1e9, bk=-1, bj=-1, bx=0, by=0, w, sc, per=EU_PER[tp], per2=per*per, fl=false, fx=0, fy=0, phi, v, thE, d, col=EU_COME[tp], ce, m, ct, g, hab=false, xm;
    o.E-=EU_MET[tp]*dt; if(tp===4&&o.E>EU_EDIV[4]*1.15) o.E=EU_EDIV[4]*1.15; if(o.E<=0){ o.dead=tiempo; euEv.muere++; return; }
    o.h-=dt; o.burst-=dt; o.cd-=dt;
    // amenazas: el nematodo (todos) y los protistas que se los comen (flagelados y euglenas)
    if(nem){ for(k=0;k<EU_NS;k+=3){ dx=x-nem.p[2*k]; dy=y-nem.p[2*k+1]; d2=dx*dx+dy*dy; if(d2<(EU_HUIDA*1.5)*(EU_HUIDA*1.5)){ d=Math.sqrt(d2)+.1; fx+=dx/d; fy+=dy/d; fl=true; } } }
    if(tp===0||tp===4) for(k=0;k<eu.length;k++){ j=eu[k]; if(j===o||j.dead||EU_COME[j.t][2+tp]<=0) continue; dx=x-j.x; dy=y-j.y; d2=dx*dx+dy*dy; if(d2<EU_HUIDA*EU_HUIDA){ d=Math.sqrt(d2)+.1; fx+=dx/d; fy+=dy/d; fl=true; } }
    if(fl&&o.cd<=0&&tp!==2){ o.burst=.7; o.cd=2.2; euEv.huida++; }
    // presas: la más cercana (ponderada por la tasa de captura): bacterias (no C ni P, ni las del rizoplano) y, si las come, otros protistas
    if((!fl||tp===2)&&per>0){
      for(k=0;k<n;k++){ if(T[k]>=4||RZc[k]) continue; w=col[S[k]?1:0]; if(w<=0) continue; dx=X[k]-x; dy=Y[k]-y; d2=dx*dx+dy*dy; if(d2>per2) continue; sc=d2/(w*w); if(sc<best){ best=sc; bk=k; bx=X[k]; by=Y[k]; bj=-1; } }
      for(k=0;k<eu.length;k++){ j=eu[k]; if(j===o||j.dead||col[2+j.t]<=0) continue; dx=j.x-x; dy=j.y-y; d2=dx*dx+dy*dy; if(d2>per2) continue; sc=d2/(col[2+j.t]*col[2+j.t]); if(sc<best){ best=sc; bk=-1; bj=k; bx=j.x; by=j.y; } }
    }
    // hábitat: sin presa a la vista ni amenaza, si están en la columna de texto (donde casi no se ve la simulación) se desvían hacia el margen más cercano
    if(!fl&&bk<0&&bj<0&&x>colIzq+R&&x<colDer-R){ hab=true; xm=x<(colIzq+colDer)*.5?(colIzq>2*R+16?colIzq*.5:-1):(W-colDer>2*R+16?(colDer+W)*.5:-1); if(xm<0) hab=false; }
    // rumbo: huida > presa > hábitat > deambular
    if(fl&&tp!==2) phi=Math.atan2(fy,fx); else if(bk>=0||bj>=0) phi=Math.atan2(by-y,bx-x); else if(hab) phi=Math.atan2((H*.5-y)*.15,xm-x); else phi=o.th;
    w=EU_W[tp]*(o.burst>0?1.8:1)*dt*(hab&&!fl?.6:1); d=angd(phi,o.th); o.th+=d>w?w:d<-w?-w:d;
    o.th+=EU_SIG[tp]*(bk>=0||bj>=0||hab?.35:1)*normal()*Math.sqrt(dt);
    o.vg+=dt; thE=o.th; v=EU_V[tp];
    if(tp===3) thE+=.5*Math.sin(tiempo*6.9+o.ph); else if(tp===1) thE+=.7*Math.sin(tiempo*10+o.ph);                                  // espiral al nadar (paramecio y dinoflagelado)
    else if(tp===0) v*=.25+.75*Math.max(0,Math.sin(tiempo*4.2+o.ph));                                                                  // el flagelado avanza a tirones
    else if(tp===4) thE+=.35*Math.sin(tiempo*3.1+o.ph);                                                                                // la euglena nada ondulando
    else v*=.35+.9*Math.max(0,Math.sin(tiempo*.9+o.ph));                                                                               // la ameba avanza con el seudópodo que se extiende
    if(o.h>0) v*=tp===2?.7:.3; if(o.burst>0) v*=2.6; if(bk<0&&bj<0&&!fl) v*=.8;
    x+=Math.cos(thE)*v*dt; y+=Math.sin(thE)*v*dt;
    if(x<R){ x=R; o.th=Math.PI-o.th; } else if(x>W-R){ x=W-R; o.th=Math.PI-o.th; } if(y<R){ y=R; o.th=-o.th; } else if(y>H-R){ y=H-R; o.th=-o.th; }
    if(rz.on&&x<rz.xmax+R+6){ rzCerca(x,y); if(bD<R*.9){ d=R*.9-bD; x+=bNx*d; y+=bNy*d; ct=Math.cos(o.th)*bNx+Math.sin(o.th)*bNy; if(ct<0){ o.th=Math.atan2(Math.sin(o.th)-ct*bNy,Math.cos(o.th)-ct*bNx); } } }
    o.x=x; o.y=y;
    // captura: la presa elegida si está al alcance (la boca está al frente; la ameba rodea)
    if(o.h<=0||tp===2){
      if(bk>=0&&bk<n){ dx=X[bk]-x; dy=Y[bk]-y; d=R*(tp===2?1.05:.9)+2.2; if(dx*dx+dy*dy<d*d&&Math.random()<col[S[bk]?1:0]*dt){ g=(.8+.2*BM[bk])*(tp===1?.6:1); euVac(o,g,0); o.E+=g*EU_VALOR[0]; o.h=EU_MANEJO[tp]; euEv.comio[0]++; quitar(bk); } }
      else if(bj>=0&&eu[bj]&&!eu[bj].dead){ j=eu[bj]; dx=j.x-x; dy=j.y-y; d=R*.9+j.R*.5; if(dx*dx+dy*dy<d*d&&Math.random()<col[2+j.t]*dt){ j.dead=tiempo; euEv.muere++; euEv.comio[1+j.t]++; euVac(o,EU_VALOR[1+j.t],2); o.E+=EU_VALOR[1+j.t]; o.h=EU_MANEJO[tp]*3; } }
    }
    // digestión: al terminar cada vacuola devuelve nutriente a la grilla (lazo microbiano: las bacterias vuelven a ese sitio)
    for(k=o.vac.length-1;k>=0;k--){ m=o.vac[k]; if(tiempo-m.t0>m.dig){ ce=celda(o.x,o.y); CA[ce]=Math.min(1,CA[ce]+.03*m.val); euEv.exc++; o.vac.splice(k,1); } }
  }
  function euPaso(dt){
    var cap=EU_CAPN[nivel], i, o, k, cnt=[0,0,0,0,0], tot=0, mx, mk;
    if(!euOn||cap===0){ if(eu.length||nem){ eu.length=0; nem=null; } return; }
    for(i=0;i<eu.length;i++) if(!eu[i].dead){ cnt[eu[i].t]++; tot++; }
    while(tot>cap){ mx=-1; mk=0; for(k=0;k<5;k++) if(cnt[k]>mx){ mx=cnt[k]; mk=k; } for(i=eu.length-1;i>=0;i--) if(eu[i].t===mk&&!eu[i].dead){ eu.splice(i,1); cnt[mk]--; tot--; break; } }
    for(i=eu.length-1;i>=0;i--){ o=eu[i]; if(o.dead){ if(tiempo-o.dead>1.6) eu.splice(i,1); continue; } euMover(o,dt); }
    for(i=0;i<eu.length;i++){ o=eu[i]; if(o.dead||o.E<EU_EDIV[o.t]||cnt[o.t]>=EU_MAX[o.t]||tot>=cap) continue;     // división: la hija nace al lado y se reparten la energía
      o.E*=.5; cnt[o.t]++; tot++; euNuevo(o.t,o.x-Math.cos(o.th)*o.R*1.6,o.y-Math.sin(o.th)*o.R*1.6,o.th+3.1416+.5*normal(),o.E); euEv.div++; }
    for(k=0;k<5;k++) if(cnt[k]<EU_MIN[k]&&tot<cap&&Math.random()<.05*dt){ euEntra(k); tot++; cnt[k]++; }                          // el piso: entra uno por un borde (llegan de afuera)
    if(nem) nemPaso(dt); else if(tiempo>=euTn) nemNace();
  }
  function nemNace(){ // un nematodo entra por el borde izquierdo, a la altura de la zona de la punta de la raíz, y va hacia la punta (o hacia el margen si no hay raíz)
    var y, k, th=0, hz=rz.hz||1, sy;
    euTn=1e12;                                                                                           // el siguiente se programa cuando éste se va (la espera se cuenta desde que se fue)
    if(rz.on&&rz.pri){ y=Math.max(70,Math.min(H-70,rz.tipY-40-Math.random()*160)); sy=rz.tipY-30*hz; nem={tx:Math.max(20,rzXc(rz.tipY)-rz.rr-14*rz.sc),ty:sy}; }
    else { y=H*(.25+.4*Math.random()); nem={tx:Math.max(40,colIzq*.5),ty:y}; }
    nem.p=new Float32Array(2*EU_NS); nem.x=-4; nem.y=y; nem.th=th; nem.ph=Math.random()*6.28; nem.st=0; nem.t0=tiempo; nem.tf=0; nem.dir=Math.random()<.5?1:-1; nem.vac=[]; nem.h=0; nem.E=5; nem.salio=0;
    for(k=0;k<EU_NS;k++){ nem.p[2*k]=-4-k*EU_NL/(EU_NS-1); nem.p[2*k+1]=y; }
    euEv.nem++;
  }
  function nemPaso(dt){
    var p=nem.p, seg=EU_NL/(EU_NS-1), k, dx, dy, d, phi, w, v, x, y, ang, r0=24+4*rz.sc, nw=0, ct, ce, o, m;
    x=nem.x; y=nem.y; nem.h-=dt;
    if(nem.st===0){ phi=Math.atan2(nem.ty-y,nem.tx-x); dx=nem.tx-x; dy=nem.ty-y; if(dx*dx+dy*dy<(r0+16)*(r0+16)){ nem.st=1; nem.tf=tiempo+28+17*Math.random(); } }
    else if(nem.st===1){ dx=x-nem.tx; dy=y-nem.ty; d=Math.sqrt(dx*dx+dy*dy); ang=Math.atan2(dy,dx); phi=ang+nem.dir*(1.5708+Math.max(0,Math.min(.9,(d-r0)*.04)))-(d<r0*.7?nem.dir*.5:0); if(tiempo>nem.tf) nem.st=2; }
    else { phi=Math.atan2(0,-1)+.25*Math.sin(tiempo*.4); }
    w=1.3*dt; d=angd(phi,nem.th); nem.th+=d>w?w:d<-w?-w:d;
    v=EU_NV*(nem.st===1?.7:1)*(nem.h>0?.5:1); nem.ph+=6.283*.8*dt;
    x+=Math.cos(nem.th)*v*dt; y+=Math.sin(nem.th)*v*dt; if(y<8){ y=8; nem.th=-nem.th; } else if(y>H-8){ y=H-8; nem.th=-nem.th; }
    p[0]=x; p[1]=y;
    for(k=1;k<EU_NS;k++){ dx=p[2*k]-p[2*k-2]; dy=p[2*k+1]-p[2*k-1]; d=Math.sqrt(dx*dx+dy*dy)||1; p[2*k]=p[2*k-2]+dx/d*seg; p[2*k+1]=p[2*k-1]+dy/d*seg; }
    if(rz.on&&x<rz.xmax+EU_NL){ for(k=0;k<EU_NS;k+=2){ rzCerca(p[2*k],p[2*k+1]); if(bD<4){ d=4-bD; p[2*k]+=bNx*d; p[2*k+1]+=bNy*d; if(k===0){ x=p[0]; y=p[1]; ct=Math.cos(nem.th)*bNx+Math.sin(nem.th)*bNy; if(ct<0) nem.th=Math.atan2(Math.sin(nem.th)-ct*bNy,Math.cos(nem.th)-ct*bNx); } } } }
    nem.x=x; nem.y=y;
    // come con la cabeza (la boca en el punto 0): bacterias (hasta las del rizoplano, que ramonea) y protistas
    if(nem.h<=0){
      for(k=0;k<n;k++){ if(T[k]===4) continue; dx=X[k]-x; dy=Y[k]-y; if(dx*dx+dy*dy>64) continue; if(Math.random()<(RZc[k]?.25:EU_NCOME[S[k]?1:0])*dt){ euVac(nem,.9,0); nem.E+=.9; nem.h=.35; euEv.nemComio[0]++; quitar(k); break; } }
      for(k=0;k<eu.length;k++){ o=eu[k]; if(o.dead) continue; dx=o.x-x; dy=o.y-y; if(dx*dx+dy*dy>(10+o.R*.5)*(10+o.R*.5)) continue; if(Math.random()<EU_NCOME[2+o.t]*dt){ o.dead=tiempo; euEv.muere++; euEv.nemComio[1+o.t]++; euVac(nem,EU_VALOR[1+o.t],2); nem.E+=EU_VALOR[1+o.t]; nem.h=2.2; break; } }
    }
    for(k=nem.vac.length-1;k>=0;k--){ m=nem.vac[k]; if(tiempo-m.t0>m.dig){ ce=celda(x,y); CA[ce]=Math.min(1,CA[ce]+.03*m.val); euEv.exc++; nem.vac.splice(k,1); } }
    if(nem.st===2&&tiempo-nem.tf>3){ nw=1; for(k=0;k<EU_NS;k++) if(p[2*k]>-2) { nw=0; break; } if(nw){ nem=null; euTn=tiempo+EU_NT0+EU_NMEDIA*-Math.log(1-Math.random()); } }       // se fue por el borde izquierdo: el siguiente tarda al menos EU_NT0 s
  }
  function euM(x,y,rec,lz,nv){ // opacidad como la de las bacterias: más tenue bajo el texto y en la columna (la luz los revela)
    var u, d2, mc=1, m, ce;
    if(lz){ u=colF(x); if(u>0){ d2=rec?luzI(x,y):0; d2=d2>=.33?0:1-d2/.33; d2=d2*d2*(3-2*d2); mc=1-(1-LUZ_COL)*u*d2; } }
    m=mc; if(nv.texto){ ce=TXB[celda(x,y)]; m*=1-.45*(ce>1?1:ce); } return m;
  }
  function euVacD(o,det,sx){ // vacuolas alimentarias (en el marco del cuerpo): un anillo que se achica al digerir
    var k, m, f, r, a, rr;
    for(k=0;k<o.vac.length;k++){ m=o.vac[k]; f=(tiempo-m.t0)/m.dig; if(f>1) f=1; r=(m.s===0?1.5:m.s===1?2.2:3.4)*(1-.65*f); a=m.a+.1*Math.sin(tiempo+k); rr=m.r*o.R*sx;
      ctx.beginPath(); ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr*.7,r,0,6.2832); ctx.strokeStyle=euC(.5*(1-.5*f)); ctx.lineWidth=.8; ctx.stroke(); if(f<.5){ ctx.fillStyle=euC(.25); ctx.fill(); } }
  }
  function euNucleo(x,y,rx,ry,a){ // el núcleo: relleno oscuro con borde (siempre se ve)
    ctx.beginPath(); ctx.ellipse(x,y,rx,ry,a||0,0,6.2832); ctx.fillStyle=euC(.34); ctx.fill(); ctx.strokeStyle=euC(.8); ctx.lineWidth=.9; ctx.stroke();
  }
  function euDibujar(rec,lz,nv){
    var i, k, o, tp, R, x, y, c, s, det, al, a, t=tiempo, ph, u, q, nk, rr, th, e, px, py, ex, ey, ox, oy, ry, nx, ny, l;
    ctx.lineCap='round'; ctx.lineJoin='round';
    for(i=0;i<eu.length;i++){
      o=eu[i]; tp=o.t; R=o.R; x=o.x; y=o.y; det=!lz||(rec&&enLuz(x,y)); al=euM(x,y,rec,lz,nv); if(o.dead){ u=1-(t-o.dead)/1.6; if(u<=0) continue; al*=u; }
      ctx.globalAlpha=al; th=o.th; c=Math.cos(th)*dpr; s=Math.sin(th)*dpr; ctx.setTransform(c,s,-s,c,x*dpr,y*dpr); ph=o.ph;
      if(tp===0){ // flagelado heterótrofo: ovoide con núcleo, un flagelo largo que ondula al frente y otro corto atrás
        ctx.beginPath(); ctx.ellipse(0,0,R*1.2,R*.8,0,0,6.2832); ctx.fillStyle=euC(.16); ctx.fill(); ctx.strokeStyle=euC(.9); ctx.lineWidth=1.05; ctx.stroke();
        euNucleo(R*.3,0,R*.36,R*.34); euVacD(o,det,.6);
        ctx.strokeStyle=euC(.8); ctx.lineWidth=.9; ctx.beginPath(); ctx.moveTo(R*1.2,0); for(k=1;k<=12;k++){ ex=R*1.2+k*1.1; ctx.lineTo(ex,2.1*(k/12)*Math.sin(t*38-k*.9+ph)); } ctx.stroke();
        ctx.strokeStyle=euC(.65); ctx.beginPath(); ctx.moveTo(-R*1.1,R*.25); for(k=1;k<=8;k++){ ex=-R*1.1-k*.95; ctx.lineTo(ex,R*.25+1.4*(k/8)*Math.sin(t*30-k*.8+ph)); } ctx.stroke();
      }else if(tp===1){ // dinoflagelado: cuerpo con cíngulo (cinturón transversal) y sulco, núcleo grande con cromosomas en bandas y dos flagelos (uno ondula en el cíngulo y el otro arrastra)
        ctx.beginPath(); ctx.ellipse(0,0,R*1.05,R*.92,0,0,6.2832); ctx.fillStyle=euC(.14); ctx.fill(); ctx.strokeStyle=euC(.9); ctx.lineWidth=1.05; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(R*.12,0,R*.22,R*.98,0,0,6.2832); ctx.strokeStyle=euC(.6); ctx.lineWidth=.9; ctx.stroke();                      // el cíngulo: un surco que rodea al cuerpo
        ctx.beginPath(); ctx.moveTo(-R*.15,0); ctx.lineTo(-R*1.0,R*.3); ctx.strokeStyle=euC(.55); ctx.lineWidth=.8; ctx.stroke();                     // el sulco hacia atrás
        euNucleo(-R*.38,-R*.1,R*.38,R*.38);                                                                                                          // el núcleo (dinocarion)
        ctx.beginPath(); for(k=-1;k<=1;k++){ ctx.moveTo(-R*.38+k*R*.14,-R*.1-R*.26); ctx.lineTo(-R*.38+k*R*.14,-R*.1+R*.26); } ctx.strokeStyle=euC(.4); ctx.lineWidth=.6; ctx.stroke(); euVacD(o,det,.55);
        ctx.strokeStyle=euC(.55); ctx.lineWidth=.7; ctx.beginPath(); for(k=0;k<5;k++){ a=ph+t*5+k*1.2566; px=R*.12+R*.22*Math.cos(a); py=R*.98*Math.sin(a); ctx.moveTo(px,py); ctx.lineTo(px+Math.cos(a)*2,py+Math.sin(a)*2.4); } ctx.stroke();   // los cilios del cíngulo giran
        ctx.strokeStyle=euC(.8); ctx.lineWidth=.9; ctx.beginPath(); ctx.moveTo(-R*1.0,R*.3); for(k=1;k<=18;k++){ ex=-R*1.0-k*1.05; ctx.lineTo(ex,R*.3+2.8*(k/18)*Math.sin(t*26-k*.7+ph)); } ctx.stroke();
      }else if(tp===2){ // ameba: contorno irregular con seudópodo al frente, núcleo, vacuola contráctil que pulsa y gránulos en el citoplasma
        nk=16; u=.5+.5*Math.sin(t*.9+ph); ctx.beginPath();
        for(k=0;k<nk;k++){ a=k*6.2832/nk; rr=R*(1+.13*Math.sin(2*a+t*.5+o.f1)+.09*Math.sin(3*a-t*.4+o.f2)+.55*u*Math.pow(Math.max(0,Math.cos(a)),3)+.3*Math.pow(Math.max(0,Math.cos(a-1.9-.4*Math.sin(t*.3+o.f3))),4)*(1-u)); ox=Math.cos(a)*rr; oy=Math.sin(a)*rr;
          if(k===0){ px=ox; py=oy; ex=ox; ey=oy; ctx.moveTo(ox,oy); } else{ ctx.quadraticCurveTo(px,py,(px+ox)/2,(py+oy)/2); px=ox; py=oy; } }
        ctx.quadraticCurveTo(px,py,(px+ex)/2,(py+ey)/2); ctx.closePath(); ctx.fillStyle=euC(.12); ctx.fill(); ctx.strokeStyle=euC(.88); ctx.lineWidth=1.1; ctx.stroke();
        euNucleo(-R*.12,0,R*.3,R*.28); ctx.beginPath(); ctx.arc(-R*.12,0,R*.09,0,6.2832); ctx.fillStyle=euC(.7); ctx.fill();
        ctx.beginPath(); ctx.arc(-R*.62,R*.32,R*.12*(.6+.4*Math.abs(Math.sin(t*.8+ph))),0,6.2832); ctx.strokeStyle=euC(.6); ctx.lineWidth=.8; ctx.stroke(); euVacD(o,det,.62);
        if(det){ ctx.fillStyle=euC(.35); ctx.beginPath(); for(k=0;k<9;k++){ a=k*2.4+o.f1; rr=(.3+.5*((k*37)%7)/7)*R; ctx.moveTo(Math.cos(a)*rr+.7,Math.sin(a)*rr*.8); ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr*.8,.7,0,6.2832); } ctx.fill();
          ctx.beginPath(); ctx.arc(0,0,R*(1.05+.5*u),-.7,.7); ctx.strokeStyle=euC(.4); ctx.lineWidth=.8; ctx.stroke(); }
      }else if(tp===3){ // Paramecium: cuerpo en zapatilla (más ancho atrás), surco oral con citostoma, dos vacuolas contráctiles estrelladas (una en cada extremo), macronúcleo con micronúcleo y una cubierta de cilios con onda metacrónica
        ry=R*.44; nk=40; ctx.beginPath();
        for(k=0;k<=nk;k++){ a=k*6.2832/nk; px=R*Math.cos(a); py=ry*Math.sin(a)*(1-.22*Math.cos(a)); if(k) ctx.lineTo(px,py); else ctx.moveTo(px,py); }
        ctx.closePath(); ctx.fillStyle=euC(.15); ctx.fill(); ctx.strokeStyle=euC(.9); ctx.lineWidth=1.1; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(R*.8,ry*.3); ctx.quadraticCurveTo(R*.35,ry*.55,R*.0,ry*.28); ctx.strokeStyle=euC(.65); ctx.lineWidth=.9; ctx.stroke();                      // el surco oral
        ctx.beginPath(); ctx.ellipse(-R*.02,ry*.3,R*.09,ry*.14,0,0,6.2832); ctx.strokeStyle=euC(.7); ctx.lineWidth=.8; ctx.stroke();                                       // el citostoma
        euNucleo(-R*.02,-ry*.28,R*.24,ry*.26); ctx.beginPath(); ctx.arc(R*.24,-ry*.2,R*.05,0,6.2832); ctx.fillStyle=euC(.85); ctx.fill();                                // macronúcleo y micronúcleo
        for(l=0;l<2;l++){ px=l?-R*.6:R*.58; u=.5+.5*Math.sin(t*1.7+ph+l*3.14); ctx.beginPath(); ctx.arc(px,0,R*.09*(.5+.7*u),0,6.2832); ctx.strokeStyle=euC(.6); ctx.lineWidth=.8; ctx.stroke();
          ctx.beginPath(); for(k=0;k<6;k++){ a=k*1.0472+ph; ctx.moveTo(px+Math.cos(a)*R*.1*u,Math.sin(a)*R*.1*u*.8); ctx.lineTo(px+Math.cos(a)*R*.24,Math.sin(a)*R*.24*.55); } ctx.strokeStyle=euC(.45); ctx.lineWidth=.6; ctx.stroke(); }
        euVacD(o,det,.7);
        ctx.strokeStyle=euC(.55); ctx.lineWidth=.7; ctx.beginPath();                                                                                                    // los cilios: ondas que viajan por el cuerpo
        for(k=0;k<44;k++){ a=k*.1428; px=R*Math.cos(a); py=ry*Math.sin(a)*(1-.22*Math.cos(a)); nx=Math.cos(a); ny=Math.sin(a)*1.1; q=.5+.5*Math.sin(t*20-k*.6+ph); ctx.moveTo(px,py); ctx.lineTo(px+nx*2.8-q*1.1,py+ny*2.8); }
        ctx.stroke();
        if(det){ ctx.strokeStyle=euC(.3); ctx.lineWidth=.55; ctx.beginPath(); for(k=0;k<14;k++){ a=.4+k*.44; px=R*.86*Math.cos(a); py=ry*.8*Math.sin(a); ctx.moveTo(px,py); ctx.lineTo(px*.9,py*.88); } ctx.stroke(); }   // tricocistos bajo la superficie
      }else{ // euglena: flagelado fusiforme con un flagelo largo, mancha ocular, núcleo y cloroplastos; el cuerpo cambia de forma al nadar (metabolia)
        nk=28; ctx.beginPath(); ry=R*.34*(1+.15*Math.sin(t*3+ph));
        for(k=0;k<=nk;k++){ a=k*6.2832/nk; u=Math.cos(a); px=R*u*(1+.06*Math.sin(t*3+ph+u)); py=ry*Math.sin(a)*(u>=0?1:Math.pow(1+u,.6)); if(k) ctx.lineTo(px,py); else ctx.moveTo(px,py); }
        ctx.closePath(); ctx.fillStyle=euC(.15); ctx.fill(); ctx.strokeStyle=euC(.9); ctx.lineWidth=1.05; ctx.stroke();
        euNucleo(-R*.1,0,R*.25,ry*.55); ctx.beginPath(); ctx.arc(R*.62,-ry*.3,1.1,0,6.2832); ctx.fillStyle=euC(.95); ctx.fill();                                          // núcleo y mancha ocular
        ctx.fillStyle=euC(.32); ctx.beginPath(); for(k=0;k<5;k++){ px=R*(.1+.14*k)*(k%2?1:-1)-R*.15; py=ry*(k%2?.38:-.38); ctx.moveTo(px+1.6,py); ctx.ellipse(px,py,1.6,1,0,0,6.2832); } ctx.fill();   // cloroplastos
        ctx.strokeStyle=euC(.8); ctx.lineWidth=.9; ctx.beginPath(); ctx.moveTo(R,0); for(k=1;k<=22;k++){ ex=R+k*1.1; ctx.lineTo(ex,2.6*Math.min(1,k/8)*Math.sin(t*30-k*.55+ph)); } ctx.stroke();                    // flagelo largo
      }
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    if(nem) nemDibujar(rec,lz,nv);
    ctx.globalAlpha=1;
  }
  function nemDibujar(rec,lz,nv){ // el nematodo: cuerpo largo y fino que se mueve con ondas, con la cutícula (anillos), el bulbo faríngeo, el intestino y la boca
    var p=nem.p, k, N=EU_NS, L=[], R=[], ax, ay, nx, ny, d, w, wv, am, x, y, det, al, sx=[], sy=[], u, m;
    x=p[0]; y=p[1]; det=!lz||(rec&&enLuz(x,y)); al=euM(x,y,rec,lz,nv);
    for(k=0;k<N;k++){ u=k/(N-1); ax=p[2*Math.min(N-1,k+1)]-p[2*Math.max(0,k-1)]; ay=p[2*Math.min(N-1,k+1)+1]-p[2*Math.max(0,k-1)+1]; d=Math.sqrt(ax*ax+ay*ay)||1; nx=-ay/d; ny=ax/d;
      am=5.5*Math.min(1,u*5)*(1-.4*u); wv=am*Math.sin(nem.ph*2-u*7.2); sx[k]=p[2*k]+nx*wv; sy[k]=p[2*k+1]+ny*wv;
      w=1.45*(u<.06?1.4+u*35:u<.8?3.7:Math.max(.6,3.7*(1-(u-.8)/.2)+.6)); L[k]=[sx[k]+nx*w*.5,sy[k]+ny*w*.5]; R[k]=[sx[k]-nx*w*.5,sy[k]-ny*w*.5]; }
    ctx.globalAlpha=al; ctx.beginPath(); ctx.moveTo(L[0][0],L[0][1]); for(k=1;k<N;k++) ctx.lineTo(L[k][0],L[k][1]); for(k=N-1;k>=0;k--) ctx.lineTo(R[k][0],R[k][1]); ctx.closePath();
    ctx.fillStyle=euC(.3); ctx.fill(); ctx.strokeStyle=euC(.95); ctx.lineWidth=1.6; ctx.stroke();   // 047: más ancho, más relleno y borde más grueso (fuera de la luz se ve al 40 % y era una raya casi invisible)
    ctx.beginPath(); ctx.moveTo(sx[3],sy[3]); for(k=4;k<N-2;k++) ctx.lineTo(sx[k],sy[k]); ctx.strokeStyle=euC(.6); ctx.lineWidth=1.1; ctx.stroke();                          // el intestino
    ctx.beginPath(); ctx.arc(sx[2],sy[2],2.6,0,6.2832); ctx.fillStyle=euC(.3); ctx.fill(); ctx.strokeStyle=euC(.8); ctx.lineWidth=.9; ctx.stroke();                          // bulbo de la faringe
    if(det){ ctx.strokeStyle=euC(.4); ctx.lineWidth=.6; ctx.beginPath(); for(k=3;k<N-2;k+=1){ ctx.moveTo(L[k][0],L[k][1]); ctx.lineTo(R[k][0],R[k][1]); } ctx.stroke(); }
    for(k=0;k<nem.vac.length;k++){ m=nem.vac[k]; u=(tiempo-m.t0)/m.dig; if(u>1) u=1; ctx.beginPath(); ctx.arc(sx[5+(k%6)],sy[5+(k%6)],(m.s===0?1.4:m.s===1?2:2.6)*(1-.6*u),0,6.2832); ctx.strokeStyle=euC(.6*(1-.5*u)); ctx.lineWidth=.8; ctx.stroke(); }
    ctx.globalAlpha=1;
  }

  // Rendimiento adaptativo: nivel de partida por núcleos y memoria; cada ~2 s se miden el trabajo por cuadro y los cuadros por segundo
  // y se sube o baja de nivel; si ni el nivel más bajo alcanza, se detiene. Pausa con la pestaña oculta.
  var st={t0:0,trab:0,cuadros:0,ventana:2000,estables:0,trabajoMs:0,fps:0,fijo:false,techo:NIVELES.length-1,historial:[]};
  function nivelInicial(){
    var c=navigator.hardwareConcurrency||4, m=navigator.deviceMemory, pts=c;
    if(m) pts=Math.min(pts,m*2);
    return pts<=2?0:pts<=4?1:2; // arranca con prudencia: la medición sube después
  }
  function fijarNivel(k){ nivel=Math.max(0,Math.min(NIVELES.length-1,k)); var nv=NIVELES[nivel]; while(n>nv.cap+RZ_MAXN[nivel]) quitar(n-1); if(nv.traz>nt) trazadores(nv.traz); else nt=nv.traz; }
  function evaluar(ahora){
    var seg=(ahora-st.t0)/1000, meta=NIVELES[nivel].fps, interv=1000/meta;
    st.fps=st.cuadros/seg; st.trabajoMs=st.trab/Math.max(1,st.cuadros);
    st.historial.push({nivel:nivel,celulas:n,fps:+st.fps.toFixed(1),trabajoMs:+st.trabajoMs.toFixed(2)});
    if(!st.fijo){
      if(st.trabajoMs>.6*interv||st.fps<.7*meta){ if(nivel===0){ pesado(); return; } fijarNivel(nivel-1); st.techo=nivel; st.estables=0; } // al bajar, ese nivel pasa a ser el techo (sin vaivén)
      else if(st.trabajoMs<.25*interv&&st.fps>=.85*meta&&nivel<st.techo&&st.estables<3){ fijarNivel(nivel+1); st.estables=0; }
      else { st.estables++; if(st.estables>=2) st.ventana=4000; }
    }
    st.t0=ahora; st.trab=0; st.cuadros=0;
  }

  // Si ni el nivel más bajo alcanza (equipo lento o sobrecargado un momento), se esconde el fondo y se reintenta al minuto, a los 2 y a los 3
  // minutos; a la tercera falla se detiene del todo. Así una sobrecarga pasajera (otra aplicación) no lo apaga para siempre.
  var fallos=0;
  function pesado(){
    pausar(); cv.style.display='none'; luzEstilo(); raiz.classList.remove('fondo-vivo'); fallos++;
    if(fallos>=3){ parar(); return; }
    setTimeout(function(){ if(!vivo||window.innerWidth<1024) return; cv.style.display='block'; luzEstilo(); fijarNivel(0); st.techo=1; st.estables=0; st.ventana=2000; arrancar(); },60000*fallos);
  }

  function bucle(t){
    raf=requestAnimationFrame(bucle);
    if(t-ultimo<1000/NIVELES[nivel].fps-2) return;
    var dt=Math.min(.05,(t-ultimo)/1000), a, ult0=ultimo; ultimo=t; // dt para la física (acotado); el reloj del cursor usa el tiempo real
    var real=(t-ult0)/1000;                                                       // calma: con el scroll quieto unos segundos (se está leyendo) el tiempo de la simulación baja un 40 %
    ritmo+=((performance.now()-tScroll>CALMA_ESPERA*1000?CALMA_F:1)-ritmo)*(1-Math.exp(-real/CALMA_T));
    a=performance.now(); paso(dt*ritmo,real); dibujar(); st.trab+=performance.now()-a; st.cuadros++;
    if(t-st.t0>=st.ventana) evaluar(t);
  }
  function arrancar(){ if(raf||!vivo||document.hidden) return; raiz.classList.add('fondo-vivo'); ultimo=performance.now(); st.t0=ultimo; st.trab=0; st.cuadros=0; raf=requestAnimationFrame(bucle); }
  function pausar(){ if(raf){ cancelAnimationFrame(raf); raf=0; } }
  function parar(){ vivo=false; pausar(); raiz.classList.remove('fondo-vivo'); if(luz.el&&luz.el.caja.parentNode){ luz.el.caja.parentNode.removeChild(luz.el.caja); luz.el.caja2.parentNode.removeChild(luz.el.caja2); } if(rz.cvR&&rz.cvR.parentNode) rz.cvR.parentNode.removeChild(rz.cvR); if(cv.parentNode) cv.parentNode.removeChild(cv); }

  document.addEventListener('visibilitychange',function(){ if(document.hidden) pausar(); else arrancar(); });
  window.addEventListener('resize',function(){
    if(window.innerWidth<1024){ pausar(); cv.style.display='none'; luzEstilo(); raiz.classList.remove('fondo-vivo'); return; }
    cv.style.display='block'; medir(); luzEstilo(); var i; for(i=0;i<n;i++){ if(X[i]>W) X[i]=Math.random()*W; if(Y[i]>H) Y[i]=Math.random()*H; }
    for(i=0;i<nt;i++){ if(TX[i]>W) TX[i]=Math.random()*W; if(TY[i]>H) TY[i]=Math.random()*H; } arrancar();
  });
  new MutationObserver(colorDeTinta).observe(raiz,{attributes:true,attributeFilter:['data-theme']});
  if(window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',colorDeTinta);

  function colonias(){ // cuenta las colonias (componentes conexas de células adheridas, vecinas a < 1,6 × VECINO) y su tamaño máximo
    var vis=new Uint8Array(n), nc=0, mx=0, grandes=0, i, j, p, pila, tam, dx, dy, r2=(VECINO*1.2)*(VECINO*1.2);
    for(i=0;i<n;i++){ if(!S[i]||vis[i]) continue; nc++; tam=0; pila=[i]; vis[i]=1;
      while(pila.length){ p=pila.pop(); tam++; for(j=0;j<n;j++){ if(!S[j]||vis[j]) continue; dx=X[j]-X[p]; dy=Y[j]-Y[p]; if(dx*dx+dy*dy<r2){ vis[j]=1; pila.push(j); } } }
      if(tam>mx) mx=tam; if(tam>=8) grandes++; }
    return {n:nc,max:mx,grandes:grandes};
  }

  function ver(g,q0,q1){ var j, v=0, t=0, ng=NIVELES[nivel].gr; for(j=0;j<ng;j++) if(g.pu[j]>=q0*.9&&g.pu[j]<q1*.9){ t++; if(g.v[j]===1) v++; } return [v,t]; } // granos visibles / totales de un tramo de radio
  function epsEstado(){ var k, ne=eneT<NE?eneT:NE, v=0, L=0, ed; for(k=0;k<ne;k++){ ed=1-(tiempo-EN[k])/EPS_VIDA; if(ed>0){ v++; L+=Math.hypot(EA[k*4+2]-EA[k*4],EA[k*4+3]-EA[k*4+1]); } } return {vivos:v,largoMedio:v?+(L/v).toFixed(2):0}; }
  function cursorEstado(){
    var i, f, Bt=0, Tot=0, bs=[], r;
    for(i=0;i<fuentes.length;i++){ f=fuentes[i]; r=f.s/sref(); if(f.base){ Bt+=f.a0*r*r; Tot+=peso(f); bs.push(+(f.a/f.a0).toFixed(3)); } else if(f.cursor) Tot+=peso(f); }
    return {presupuesto:+Bt.toFixed(3),total:+Tot.toFixed(3),fondo:bs,fondoMin:bs.length?Math.min.apply(null,bs):0,activasFondo:bs.length,
            ritmo:+ritmo.toFixed(3),agitacion:+agit.toFixed(3),quietoS:+(relojC-anc.t).toFixed(2),margen:{izq:+colIzq.toFixed(1),der:+colDer.toFixed(1),sobrelapamiento:ARENA_OV,nace:ptr.ok?enMargen(anc.x):false},arena:{granos:cur.length?nGranos:0,bajoTexto:cur.length?nBajo:0},
            cursores:cur.map(function(c){ return {x:Math.round(c.x),y:Math.round(c.y),a:+c.a.toFixed(3),s:Math.round(c.s),crece:c.crece,rapido:c.rapido,r:+c.r.toFixed(3),dep:+c.D.toFixed(2),M:+c.M.toFixed(2),centro:c.g?ver(c.g,0,.45):[0,0],borde:c.g?ver(c.g,.45,1):[0,0],nucleo:[+(c.nr||0).toFixed(1),+(c.na||0).toFixed(3)],granos:c.g?Array.prototype.reduce.call(c.g.v.subarray(0,NIVELES[nivel].gr),function(m,v){ return m+(v===1?1:0); },0):0,edad:+(relojC-c.t0).toFixed(1)}; })};
  }

  window.Quimiotaxis={
    fuentes:fuentes,
    agregar:function(f){ fuentes.push({id:f.id,x:f.x,y:f.y,a:f.a==null?1:f.a,s:f.s||150}); sucio=true; },
    mover:function(id,x,y){ for(var i=0;i<fuentes.length;i++) if(fuentes[i].id===id){ fuentes[i].x=x; fuentes[i].y=y; sucio=true; return; } },
    quitar:function(id){ for(var i=0;i<fuentes.length;i++) if(fuentes[i].id===id){ fuentes.splice(i,1); sucio=true; return; } },
    usarCampo:function(fn){ campoFn=fn||null; },
    campo:function(x,y){ return campo(x,y); },
    opacidad:function(f){ factor=f; colorDeTinta(); },
    repulsion:function(o){ // 046: repulsión del cursor sobre las bacterias: repulsion({radio, fuerza}) (fuerza 0 la apaga); sin argumento informa
      if(o){ if(o.radio!=null) CUR_R=Math.max(1,+o.radio); if(o.fuerza!=null) CUR_V=Math.max(0,+o.fuerza); }
      return {radio:CUR_R,fuerza:CUR_V,activa:CUR_V>0};
    },
    euca:function(o){ // 045: los eucariotas. {activa, nematodo:true (lo hace entrar ya), agregar:[tipos 0 flagelado, 1 dinoflagelado, 2 ameba, 3 paramecio, 4 euglena], reiniciar}
      var k, c=[0,0,0,0,0], vac=0, lst=[], q;
      if(o){
        if(o.activa!=null&&!!o.activa!==euOn){ euOn=!!o.activa; if(euOn) euInicio(); else { eu.length=0; nem=null; } }
        if(o.reiniciar) euInicio();
        if(o.agregar&&euOn) for(k=0;k<o.agregar.length;k++){ q=o.agregar[k]; euNuevo(q.t!=null?q.t:q,q.x!=null?q.x:Math.random()*W,q.y!=null?q.y:Math.random()*H,Math.random()*6.2832); }
        if(o.nematodo&&euOn&&!nem) nemNace();
      }
      for(k=0;k<eu.length;k++) if(!eu[k].dead){ c[eu[k].t]++; vac+=eu[k].vac.length; lst.push({t:eu[k].t,x:+eu[k].x.toFixed(1),y:+eu[k].y.toFixed(1),E:+eu[k].E.toFixed(2),h:+Math.max(0,eu[k].h).toFixed(2)}); }
      return {activa:euOn,total:c[0]+c[1]+c[2]+c[3]+c[4],porTipo:{flagelado:c[0],dinoflagelado:c[1],ameba:c[2],paramecio:c[3],euglena:c[4]},tope:EU_CAPN[nivel],vacuolas:vac,lista:lst,
        nematodo:nem?{x:+nem.x.toFixed(1),y:+nem.y.toFixed(1),estado:['llega','come en la punta','se va'][nem.st],edad:+(tiempo-nem.t0).toFixed(1),objetivo:[+nem.tx.toFixed(1),+nem.ty.toFixed(1)],comio:euEv.nemComio.slice(),largo:EU_NL}:null,
        proximoNematodoEn:+Math.max(0,euTn-tiempo).toFixed(1),eventos:{comioBacterias:euEv.comio[0],comioFlagelados:euEv.comio[1],comioDinoflagelados:euEv.comio[2],comioAmebas:euEv.comio[3],comioParamecios:euEv.comio[4],comioEuglenas:euEv.comio[5],divisiones:euEv.div,muertes:euEv.muere,entradas:euEv.ent,huidas:euEv.huida,nematodos:euEv.nem,excrecion:euEv.exc}};
    },
    nivel:function(k){ if(k==null) return nivel; st.fijo=true; fijarNivel(k); st.t0=performance.now(); st.trab=0; st.cuadros=0; return nivel; },
    relaciones:function(o){ var k;
      if(o&&o.subproducto!=null){ subp=!!o.subproducto; if(!subp) CP.fill(0); }
      if(o&&o.depredador!=null){ depr=!!o.depredador; if(!depr){ for(k=n-1;k>=0;k--) if(T[k]===4) quitar(k); } }
      if(o&&o.excluir!=null){ excl=o.excluir.slice(); for(k=n-1;k>=0;k--) if(excl.indexOf(EST[T[k]])>=0) quitar(k); }
      if(o&&o.mutualismo!=null){ mut=!!o.mutualismo; if(!mut){ CK.fill(0); CF.fill(0); } }
      if(o&&o.quorum!=null){ quor=!!o.quorum; if(!quor){ CI.fill(0); for(k=0;k<n;k++){ QL[k]=0; QT[k]=0; } } }
      return {subproducto:subp,depredador:depr,quorum:quor,mutualismo:mut,excluir:excl.slice()}; },
    medicion:function(){ return JSON.parse(JSON.stringify(med)); },
    estado:function(){ var nv=NIVELES[nivel], co=colonias(), cs=0, k, mn=1, mx=0, ps=0, pm=0, mo=[[0,0],[0,0],[0,0],[0,0],[0,0]], ninf=0; for(k=0;k<GN;k++){ cs+=CA[k]; ps+=CP[k]; if(CA[k]<mn) mn=CA[k]; if(CA[k]>mx) mx=CA[k]; if(CP[k]>pm) pm=CP[k]; }
      for(k=0;k<n;k++){ mo[EST[T[k]]][0]++; if(S[k]) mo[EST[T[k]]][1]++; if(IN[k]>0) ninf++; }
      return {morfos:{A:mo[0],B:mo[1],N:mo[2],C:mo[3],P:mo[4]},infectadas:ninf,subproducto:{activo:subp,medio:+(ps/GN).toFixed(4),max:+pm.toFixed(3)},nivel:nivel,celulas:n,nadando:nNadan,adheridas:nSesiles,colonias:co.n,mayorColonia:co.max,coloniasGrandes:co.grandes,nutrienteMedio:+(cs/GN).toFixed(3),nutrienteMax:+mx.toFixed(2),eventos:JSON.parse(JSON.stringify(ev)),cursor:cursorEstado(),eps:epsEstado(),trazadores:nt,fps:+st.fps.toFixed(1),trabajoMs:+st.trabajoMs.toFixed(2),fijo:st.fijo,choques:nv.choques,jeffery:nv.jeffery,historial:st.historial.slice()}; },
    posiciones:function(){ var s=Array.prototype.slice, es=[], k; for(k=0;k<n;k++) es.push(EST[T[k]]); return {x:s.call(X,0,n),y:s.call(Y,0,n),th:s.call(TH,0,n),fi:s.call(FI,0,n),sp:s.call(SP,0,n),tipo:s.call(T,0,n),estrategia:es,infectada:s.call(IN,0,n).map(function(v){ return v>0?1:0; }),quorum:s.call(QL,0,n),sesil:s.call(S,0,n),forma:s.call(ES,0,n),estado:s.call(RS,0,n),biomasa:s.call(BM,0,n)}; },
    avanzar:function(seg,r,pared){ var k=Math.round(seg*30), dt=1/30*(r||1); for(var i=0;i<k;i++) paso(dt,pared?1/30:undefined); dibujar(); },   // r: factor del reloj (0,6 = lectura en calma; seg son segundos de pared); pared:true hace que el reloj de la raíz y del cursor (tiempo real) avance 1/30 s por paso aunque r < 1
    luz:function(o){ // 039: la luz. luz({activa, r, x, y, fija, estela}) para pruebas y videos (estela:false quita la estela, 042): activa:false la apaga (el fondo se ve entero, como en la 038); r es el radio exterior en px (0 = 24,25 % del ancho, 042); x, y la fijan (salta y no sigue al cursor hasta fija:false)
      if(o){
        if(o.activa!=null){ luz.activa=!!o.activa; if(!luz.activa) luz.c=false; }
        if(o.r!=null){ luz.rEsp=o.r>0?+o.r:0; luzRadio(); }
        if(o.estela!=null){ luz.estela=!!o.estela; if(!luz.estela){ luz.en=0; luz.lok=false; } }
        if(o.x!=null&&o.y!=null){ luz.fija=true; luz.en=0; luz.x=luz.tx=+o.x; luz.y=luz.ty=+o.y; luz.pico=luz.meta=1; luz.viaje=0; luz.fuera=false; }
        if(o.fija===false){ luz.fija=false; luz.meta=ptr.ok?1:luz.meta; luzMueve(); }
        if(o.reiniciarDiag){ luz.exc=-1e9; luz.nt=0; luz.ms=0; luz.pasos=0; }
        luzEstilo(); sucio=true;
      }
      return {activa:luz.activa,fija:luz.fija,r:+luz.r.toFixed(1),x:+luz.x.toFixed(1),y:+luz.y.toFixed(1),objetivoX:+luz.tx.toFixed(1),objetivoY:+luz.ty.toFixed(1),pico:+luz.pico.toFixed(3),meta:+luz.meta,piso:LUZ_PISO,visto:luz.visto,fuera:luz.fuera,recorta:luz.c,foco:luz.foco,estilos:luz.n,excesoMax:luz.exc<-1e8?null:+luz.exc.toFixed(1),ticks:luz.nt,opacidadTapon:+Math.min(1,Math.max(0,(1-luz.pico)/(1-LUZ_PISO))).toFixed(3),costoMs:luz.pasos?+(luz.ms/luz.pasos).toFixed(3):0,pasos:luz.pasos,estela:{activa:luz.estela,sellos:luz.en,retiene:LUZ_RET,cae:LUZ_CAE,paso:+Math.max(40,LUZ_PASO_F*luz.r).toFixed(1)}}; },
    arena:function(o){ // 040: dónde nace la arena del cursor quieto: arena({sobrelapamiento}) cambia cuántos px hacia el texto entra la zona de los márgenes (para medirlo); sin argumentos sólo informa
      if(o&&o.sobrelapamiento!=null) ARENA_OV=+o.sobrelapamiento;
      return {izq:+colIzq.toFixed(1),der:+colDer.toFixed(1),sobrelapamiento:ARENA_OV,zonaIzq:[0,+(colIzq+ARENA_OV).toFixed(1)],zonaDer:[+(colDer-ARENA_OV).toFixed(1),W]};
    },
    raiz:function(o){ // 040: la raíz. raiz({activa, especialista, punta}) para pruebas: activa:false la quita (con sus exudados y el especialista); especialista:false quita las P y no entran más; punta: fracción del alto; sin argumentos sólo informa
      var k, hz=rz.hz;
      if(o){
        if(o.activa!=null&&!!o.activa!==rz.pide){ rz.pide=!!o.activa; rzEspacio(); }                    // al volver a crearla trae sus colonistas
        if(o.especialista!=null){ rz.esp=!!o.especialista; if(!rz.esp) for(k=n-1;k>=0;k--) if(T[k]===5) quitar(k); }
        if(o.fuente!==undefined) rz.fuenteF=o.fuente;
        if((o.semilla!=null||o.parche!=null||o.punta!=null||o.fuente!==undefined)&&rz.on){ // semilla: regenera la raíz con esa semilla; parche: [{x,y,r,v}] suma nutriente c sólo mientras se genera (para medir el quimiotropismo); punta: fracción del alto
          var cA=null, pa, q, gx, gy, dd;
          if(o.semilla!=null) rz.sem=(+o.semilla)>>>0;
          if(o.parche){ cA=CA.slice(); for(q=0;q<o.parche.length;q++){ pa=o.parche[q]; for(gy=0;gy<GY;gy++) for(gx=0;gx<GX;gx++){ dd=Math.hypot((gx+.5)*hx-pa.x,(gy+.5)*hy-pa.y); if(dd<pa.r*2.5) CA[gy*GX+gx]=Math.min(1,CA[gy*GX+gx]+(pa.v==null?1:pa.v)*Math.exp(-dd*dd/(2*pa.r*pa.r))); } } }
          rz.H0=H; rz.W0=W; rz.col0=colIzq; rzGenera(o.punta!=null?Math.max(.3*H,Math.min(RZ_TIPMAX*H,o.punta*H)):(o.tip!=null?o.tip*H:RZ_TIP0*H)); if(cA) CA.set(cA); rzBuild(); rzFuente(); rzTamano(); rzPintar(); sucio=true; }
        dibujar();
      }
      return {activa:rz.on,pedida:rz.pide,cabe:rzCabe(),espacio:{margen:+colIzq.toFixed(1),minimo:RZ_COLMIN,alto:H,minimoAlto:RZ_ALTOMIN},semilla:rz.sem,especialista:rz.esp,x:+rz.x.toFixed(1),centro:+rz.x.toFixed(1),margen:[+rz.xl.toFixed(1),+rz.xr.toFixed(1)],eje:(function(){ var k, mn=1e9, mx=-1e9, sm=0, v; for(k=0;k<rz.priN;k++){ v=rz.pri[k]; if(v<mn) mn=v; if(v>mx) mx=v; sm+=v; } return {min:+mn.toFixed(1),max:+mx.toFixed(1),media:+(sm/Math.max(1,rz.priN)).toFixed(1)}; })(),lados:{izq:rz.lat.filter(function(l){ return l.lado<0; }).length,der:rz.lat.filter(function(l){ return l.lado>0; }).length},radio:+rz.rr.toFixed(1),escala:+rz.sc.toFixed(2),escalaAlto:+hz.toFixed(2),punta:+rz.tipY.toFixed(1),puntaFrac:+(rz.tipY/H).toFixed(3),velocidad:+rz.v.toFixed(3),velocidadBase:RZ_V0,
        pelosDet:{total:rz.nh,primaria:rz.nhPri,laterales:rz.nhLat,altoVertical:+rz.hv.toFixed(1),lista:!(o&&o.pelos)?null:(function(){ var o=[], k; for(k=0;k<rz.nh;k++) o.push([+RH[4*k].toFixed(1),+RH[4*k+1].toFixed(1),+RH[4*k+2].toFixed(1),+RH[4*k+3].toFixed(1)]); return o; })()},
        zonas:{cofia:[0,+(22*hz).toFixed(1)],meristema:[+(22*hz).toFixed(1),+(48*hz).toFixed(1)],elongacion:[+(48*hz).toFixed(1),+(110*hz).toFixed(1)],pelos:[+(110*hz).toFixed(1),+(280*hz).toFixed(1)],maduracion:[+(280*hz).toFixed(1),null]},
        fuente:rz.fuente?{x:+rz.fuente.x.toFixed(1),y:+rz.fuente.y.toFixed(1),ejeX:rz.pri?+rzXc(rz.fuente.y).toFixed(1):null}:null,atractores:(function(){ var k, v=0; for(k=0;k<rz.na;k++) if(rz.av[k]) v++; return {total:rz.na,vivos:v}; })(),laterales:rz.lat.map(function(l){ var q=l.pts; return {y:+l.y.toFixed(1),lado:l.lado,largo:+l.len.toFixed(1),x:+q[0].toFixed(1),punta:[+q[q.length-2].toFixed(1),+q[q.length-1].toFixed(1)],viva:l.vivo}; }),pelos:rz.nh,largoPelos:+(function(){ var k, t=0; for(k=0;k<rz.nh;k++) t+=Math.hypot(RH[k*4+2]-RH[k*4],RH[k*4+3]-RH[k*4+1]); return rz.nh?t/rz.nh:0; })().toFixed(2),capsulas:rz.nb,xmax:+rz.xmax.toFixed(1),banda:+rz.banda.toFixed(1),columnasR:rz.ncr,
        colonizacion:{rizoplano:rz.nCol,especialistaAdherido:rz.nColP,especialistaTotal:rz.nP,especialistaPunta:rz.pTip},reconstrucciones:rz.reb,eventos:{rizoplano:ev.rz||0,rizoplanoP:ev.rzP||0},columna:{izq:+colIzq.toFixed(1),der:+colDer.toFixed(1),sobrelapamiento:ARENA_OV}}; },
    rizosfera:function(x,y){ // 040, gancho para los hongos (041): la franja de la rizosfera alrededor de la raíz. Devuelve la distancia d a la superficie del cuerpo (px), el peso w (1 en la franja, cae a 0 en 1,2 × banda), la zona de la raíz más cercana y el punto de la superficie
      var w, s, zona, hz=rz.hz;
      if(!rz.on||!rz.nb) return {d:null,w:0,dentro:false,zona:null};
      rzCerca(x,y); w=(bD-.7*rz.banda)/(.5*rz.banda); w=w<0?0:w>1?1:w; w=1-w*w*(3-2*w); s=rz.tipY-bY;
      zona=bK>=rz.nbCuerpo?'lateral':s<22*hz?'cofia':s<48*hz?'meristema':s<110*hz?'elongacion':s<280*hz?'pelos':'maduracion';
      return {d:+bD.toFixed(1),w:+w.toFixed(3),dentro:w>0,zona:zona,punto:[+bX.toFixed(1),+bY.toFixed(1)],normal:[+bNx.toFixed(3),+bNy.toFixed(3)],pelo:hD<1e8?+hD.toFixed(1):null};
    },
    reiniciar:function(o){ reiniciar(!o||o.avanzado!==false); dibujar(); },
    movimiento:function(reset){ var o=JSON.parse(JSON.stringify(mov)); if(reset){ for(var k=0;k<6;k++){ mov.run[k]=[]; mov.giro[k]=[]; mov.der[k]=[0,0,0]; mov.n[k]=0; } mov.tw={saltos:0,dist:0,seg:0,fijadas:0}; } return o; },
    grilla:function(){ return {gx:GX,gy:GY,c:Array.prototype.slice.call(CA),p:Array.prototype.slice.call(CP),q:Array.prototype.slice.call(CI),m:Array.prototype.slice.call(CK),f:Array.prototype.slice.call(CF),r:Array.prototype.slice.call(CR),columnasR:rz.ncr,anchoR:GRR,rizosfera:Array.prototype.slice.call(RZB)}; },
    flujo:function(x,y,t){ flujo(x,y,t==null?tiempo:t,true); return {u:fu,v:fv,ux:gux,uy:guy,vx:gvx,vorticidad:gvx-guy}; },
    parar:parar
  };

  tScroll=performance.now(); ultScroll.y=window.pageYOffset||0; ultScroll.t=tScroll;
  try{ var mS=/[?&]semilla=(\d+)/.exec(location.search); rz.sem=mS?(+mS[1]>>>0):Math.floor(Math.random()*4294967296); }catch(e){ rz.sem=Math.floor(Math.random()*4294967296); }   // 041b: la semilla de la raíz (una por carga, o ?semilla=N para reproducirla)
  medir(); luzCrear(); rzCrear(); colorDeTinta(); fijarNivel(nivelInicial()); luzEstilo(); reiniciar(true); dibujar(); arrancar();  // el nutriente parte repartido cerca de las fuentes y la visita, con colonias ya formadas
})();
