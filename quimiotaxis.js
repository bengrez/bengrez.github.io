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
                                avanzar(seg) simula sin esperar (pruebas y videos); flujo(x, y) lee la corriente
     parar()                    detiene y quita el canvas */
(function(){
  'use strict';
  if(window.Quimiotaxis) return;

  // Niveles de calidad (se adapta la calidad, no el tamaño de la población): cuadros por segundo, tope de población, choques,
  // trazadores, órbitas de Jeffery, matriz (EPS), granos de arena por fuente del cursor y cada cuántos cuadros se actualiza la grilla de nutriente.
  var NIVELES=[{fps:20,cap:60,choques:false,traz:0,jeffery:false,eps:false,texto:false,grilla:3,gr:100},{fps:30,cap:120,choques:false,traz:24,jeffery:true,eps:true,texto:true,grilla:1,gr:260},
               {fps:30,cap:140,choques:true,traz:40,jeffery:true,eps:true,texto:true,grilla:1,gr:340},{fps:60,cap:160,choques:true,traz:40,jeffery:true,eps:true,texto:true,grilla:1,gr:420}];
  // Por tipo: 0 coco, 1 bacilo, 2 espirilo. Velocidad de nado (px/s), giros por segundo, desviación del giro (rad), radio de choque (px)
  // Por tipo: 0 coco, 1 bacilo, 2 espirilo, 3 cocobacilo (035), 4 vibrio depredador (036)
  var VEL=[0,25,38,20,35], LAM=[0,1,.35,.5,.7], GIRO=[0,1.1,.8,.9,1], RAD=[2.8,3.4,3.6,3.0,2.2];
  var ALFA=[.26,.37,.30,.33,.40], ALFA_COLA=.40, ALFA_TRAZ=.14, ALFA_SES=1.18, ALFA_EPS=[.07,.11,.16]; // opacidades (tinta del sitio); las adheridas, algo más; la matriz (EPS), muy tenue, en tres tramos de intensidad
  var PATRON=[1,3,1,0,1,3,2,1,3,1];  // de cada 10: 5 bacilos (A), 3 cocobacilos y 1 coco (B) y 1 espirilo (neutro)
  var TAU=.9, GAIN=6, C0=.02, DR=.15, BRO=7, HUECO=.6, RIGIDEZ=.45, LMIN=.08, LMAX=5;
  var ETA=.55, KONDA=[0,.95,.698,.95,1.2];  // propulsión: v = η·(ω/k); número de onda (rad/px) del flagelo del bacilo (λ 5 px) y del cuerpo del espirilo (λ 9 px)
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
  var EST=[1,0,2,1,3], MU=[.7,2,.4,.7,0], KS=[.06,.45,.2,.06,1], QS=[.17,.45,.28,.17,0], CADT=[.28,.55,.45,.28,9], KADT=[1.8,.7,1,1.8,0], CDT=[.05,.17,.12,.05,0], CPOB=[.008,.02,.02,.008,0], EPSK=[1.8,.7,1,1.8,1];
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
  var CRAD=90, CTURN=5, CATK=.65, PREF=[.35,1,.2], LT=20, LTV=.4, LIBC=.35, LIBP=.25, CHAMBRE=100, CINI=3, CMIN=2, CMAX=8, CIMM=.05, CM0=.01, CEXP=2;  // 037: CM0 = mortalidad basal de C (1/s), CEXP = exponente de la dependencia de la densidad de las crías
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
  // 029: agitación del scroll (px/s de la onda, de la deriva, velocidad de scroll que la satura, decaimiento en s), calma (espera en s, factor, constante en s),
  // repulsión del texto (px/s por unidad de gradiente), tiempo de reconstrucción de la máscara (ms)
  var AGIT_O=16, AGIT_D=12, AGIT_V=2500, AGIT_T=1.6, CALMA_ESPERA=4, CALMA_F=.6, CALMA_T=1.5, REP_T=36, MASC_MS=250;
  var SEL_TEXTO='.hero .lugar,.hero h1,.hero .lede,.hero .acciones,.riel-top,.riel-meta,.intro,.estados,.lista,.problema,.grafico,.metodo,.con-que,.mas,.metricas,h3.titulo,.pie,.herr,.practicas,.ruta,.correo,.perfiles,.nota,.evidencia figcaption,footer .pagina';
  var RESERVA=14, REFRACTARIA=20, NMAX=160, TMAX=40, GN=GX*GY;

  var cv=document.createElement('canvas'), ctx=cv.getContext('2d',{alpha:true});
  if(!ctx) return;
  cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;display:block';
  document.body.insertBefore(cv,document.body.firstChild);
  var raiz=document.documentElement;

  var W=0,H=0,dpr=1,hx=1,hy=1;
  var X=new Float32Array(NMAX), Y=new Float32Array(NMAX), TH=new Float32Array(NMAX), M=new Float32Array(NMAX), PH=new Float32Array(NMAX),
      SP=new Float32Array(NMAX), FI=new Float32Array(NMAX), BM=new Float32Array(NMAX), HM=new Float32Array(NMAX), T=new Uint8Array(NMAX), S=new Uint8Array(NMAX),
      NB=new Uint8Array(NMAX), NA=new Uint8Array(NMAX), IN=new Float32Array(NMAX), QL=new Float32Array(NMAX), QT=new Float32Array(NMAX), NP=new Uint8Array(NMAX), VX=new Float32Array(NMAX), VY=new Float32Array(NMAX), SZ=new Float32Array(NMAX), GR=new Float32Array(NMAX), ES=new Uint8Array(NMAX);
  // 034: matriz extracelular (EPS) como rastros cortos y alargados (ya no discos): un anillo de NE segmentos (x1, y1, x2, y2) con su intensidad y su
  // nacimiento (tiempo de la simulación). Se depositan a lo largo del eje de las adheridas (que en las colonias sigue el crecimiento radial y de la cadena),
  // en el eje de cada división y como rastro del deslizamiento de las nadadoras en zona de adhesión. Se desvanecen en EPS_VIDA s. Tamaño ≈ ⅓ de la 033.
  var NE=700, EPS_VIDA=45, EPS_L=7, EPS_T=3.5, EA=new Float32Array(NE*4), EW=new Float32Array(NE), EN=new Float32Array(NE), eneT=0;
  var ETM=new Float32Array(NMAX), LX=new Float32Array(NMAX), LY=new Float32Array(NMAX);
  function eps(x1,y1,x2,y2,w){ var o=eneT%NE, q=o*4; EA[q]=x1; EA[q+1]=y1; EA[q+2]=x2; EA[q+3]=y2; EW[o]=w>1?1:w; EN[o]=tiempo; eneT++; }
  var TX=new Float32Array(TMAX), TY=new Float32Array(TMAX), nt=0;
  var CA=new Float32Array(GN), CB=new Float32Array(GN), CP=new Float32Array(GN), CQ=new Float32Array(GN), CI=new Float32Array(GN), CJ=new Float32Array(GN), CK=new Float32Array(GN), CL=new Float32Array(GN), CF=new Float32Array(GN), CG=new Float32Array(GN), subp=true, mut=true, excl=[], depr=true, quor=true, SG=new Float32Array(GN), TXT=new Float32Array(GN), TXB=new Float32Array(GN), TXC=new Float32Array(GN), sucio=true, acum=0, cuadro=0;
  var n=0, nivel=0, raf=0, ultimo=0, vivo=true, tiempo=0, factor=1, colores=['','','','',''], coloresS=['','','','',''], bdel='', cola='', traza='', rgb='0,0,0';
  var relojC=0, agit=0, empuje=0, tScroll=0, ritmo=1, ultScroll={y:0,t:0}, textoEls=[], tMasc=-1e9, cur=[], ptr={x:0,y:0,ok:false}, anc={x:0,y:0,t:0}, creciendo=null, cid=0, ultHuella=-9, ev={adh:0,div:0,disp:0,hambre:0,pobre:0,sal:0,ent:0}, fuentes=[], campoFn=null, usuario=false, nNadan=0, nSesiles=0;
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
  function sentir(tp,x,y){ var e=EST[tp]; return e===1?WCB*campo(x,y)+WPB*leerP(x,y)+WFB*leerG(CF,x,y):e===2?WCB*campo(x,y)+WMN*leerG(CK,x,y):campo(x,y); } // lo que percibe la quimiotaxis: B sigue sobre todo el subproducto

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
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
    var fr=fuentes.filter(function(f){ return f.base; });
    if(!fr.length) fuentesBase(); else fr.forEach(function(f,i){ f.x=base[i][0]*W; f.y=base[i][1]*H; f.s=base[i][3]*H; });
    sucio=true;
  }

  function colorDeTinta(){
    // monocromo con la tinta del sitio; cada forma con su opacidad (se recalcula al cambiar de tema)
    var t=getComputedStyle(raiz).getPropertyValue('--ink').trim(), m=/^#([0-9a-f]{6})$/i.exec(t);
    if(m){ var v=parseInt(m[1],16); rgb=((v>>16)&255)+','+((v>>8)&255)+','+(v&255); }
    for(var k=0;k<5;k++){ colores[k]='rgba('+rgb+','+Math.min(1,ALFA[k]*factor).toFixed(3)+')'; coloresS[k]='rgba('+rgb+','+Math.min(1,ALFA[k]*ALFA_SES*factor).toFixed(3)+')'; }
    bdel='rgba('+rgb+','+Math.min(1,.62*factor).toFixed(3)+')'; cola='rgba('+rgb+','+Math.min(1,ALFA_COLA*factor).toFixed(3)+')'; traza='rgba('+rgb+','+Math.min(1,ALFA_TRAZ*factor).toFixed(3)+')';
  }

  // ---- Células ----
  function nueva(x,y,th,tp){
    var i=n++; T[i]=tp; X[i]=x; Y[i]=y; TH[i]=th; PH[i]=Math.random()*6.283185307; FI[i]=Math.random()*6.283185307; SP[i]=1; S[i]=0; BM[i]=1; HM[i]=0; NB[i]=0; NA[i]=0; NP[i]=0; IN[i]=0; QL[i]=0; QT[i]=0; ETM[i]=0; LX[i]=NaN; LY[i]=0;
    SZ[i]=.88+.3*Math.random(); GR[i]=.75+.5*Math.random(); ES[i]=tp===0?(Math.random()<.4?1:2):0; // tamaño y ritmo de crecimiento individuales; cocos: 1 diplococo, 2 estreptococo
    M[i]=Math.log(sentir(tp,x,y)+C0); return i;
  }
  function quitar(i){ // saca la célula i copiando la última en su lugar
    var u=--n; if(i===u) return;
    X[i]=X[u]; Y[i]=Y[u]; TH[i]=TH[u]; M[i]=M[u]; PH[i]=PH[u]; SP[i]=SP[u]; FI[i]=FI[u]; BM[i]=BM[u]; HM[i]=HM[u]; T[i]=T[u]; S[i]=S[u]; NB[i]=NB[u]; NA[i]=NA[u]; IN[i]=IN[u]; QL[i]=QL[u]; QT[i]=QT[u]; NP[i]=NP[u]; VX[i]=VX[u]; VY[i]=VY[u]; SZ[i]=SZ[u]; GR[i]=GR[u]; ES[i]=ES[u]; ETM[i]=ETM[u]; LX[i]=LX[u]; LY[i]=LY[u];
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
  function trazadores(k){ for(var i=nt;i<k;i++){ TX[i]=Math.random()*W; TY[i]=Math.random()*H; } nt=k; }

  var GIROS_DIV=[0,.3,-.3,.6,-.6,1,-1,1.57,-1.57,2.4,-2.4];
  function empujar(px,py,r,except){ // la célula que crece empuja a las vecinas que se le superponen (presión dentro de la colonia)
    var j, dx, dy, d, m, o;
    for(j=0;j<n;j++){ if(j===except[0]||j===except[1]) continue; dx=X[j]-px; dy=Y[j]-py; m=r+RAD[T[j]]*SZ[j]+HUECO*.5; d=dx*dx+dy*dy; if(d>=m*m) continue;
      d=Math.sqrt(d); if(d<.05){ dx=1; dy=0; d=1; } o=(m-d)*.8/d; X[j]+=dx*o; Y[j]+=dy*o; }
  }
  function dividir(i){ // división a lo largo del eje de la célula: la madre y la hija quedan donde terminan los dos lóbulos de la constricción
    var k, a, j, ok, tp=T[i], r=RAD[tp]*SZ[i], md=2*r+HUECO+.3, h=md/2, ex, ey, x0=X[i], y0=Y[i], ax=TH[i];
    for(k=0;k<GIROS_DIV.length;k++){
      a=ax+GIROS_DIV[k];                                 // si el eje apunta a un borde de la ventana, se prueba con el eje girado
      ex=Math.cos(a); ey=Math.sin(a);
      ok=x0-ex*h>r&&x0+ex*h<W-r&&y0-ey*h>r&&y0+ey*h<H-r&&x0+ex*h>r&&x0-ex*h<W-r&&y0+ey*h>r&&y0-ey*h<H-r;
      if(ok){
        ev.div++; X[i]=x0-ex*h; Y[i]=y0-ey*h; TH[i]=a; if(NIVELES[nivel].eps) eps(x0-ex*(h+r+3),y0-ey*(h+r+3),x0+ex*(h+r+3),y0+ey*(h+r+3),1); // la matriz sigue el eje de la división
        j=nueva(x0+ex*h,y0+ey*h,a,tp); S[j]=1; SP[j]=0; FI[j]=FI[i]; BM[i]=1; BM[j]=1+.1*Math.random(); SZ[j]=Math.max(.85,Math.min(1.2,SZ[i]+.06*normal())); GR[j]=Math.max(.7,Math.min(1.3,GR[i]+.1*normal()));
        if(tp===0){ ES[j]=ES[i]; if(ES[i]===1){ ES[i]=3; ES[j]=3; } else if(Math.random()<.15) TH[j]=Math.random()*6.283185307; } // diplococos: un solo par; estreptococos: cadena (a veces se rompe y cambia de eje)
        else TH[j]=a+.3*normal();                         // borde irregular: la hija sale con el eje algo desviado
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
    ptr.x=e.clientX; ptr.y=e.clientY; ptr.ok=true;
    var dx=ptr.x-anc.x, dy=ptr.y-anc.y;
    if(dx*dx+dy*dy>TOL*TOL){ anc.x=ptr.x; anc.y=ptr.y; anc.t=relojC; suelta(); } // se movió más que el temblor: reinicia la espera y suelta la fuente
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
    if(ptr.ok&&!creciendo&&!document.hidden&&relojC-anc.t>=ESPERA){ // 2 s quieto: nace una fuente
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
  raiz.addEventListener('mouseleave',function(){ ptr.ok=false; suelta(); });

  // El scroll: agita el fluido (según su velocidad) y marca que se está desplazando (la calma se levanta)
  window.addEventListener('scroll',function(){
    var t=performance.now(), y=window.pageYOffset||0, dt=(t-ultScroll.t)/1000, v;
    tScroll=t; tMasc=-1e9; // la máscara de los bloques de texto se rehace enseguida
    if(dt>.005&&dt<.5){ v=(y-ultScroll.y)/dt; agit=Math.max(agit,Math.min(1,Math.abs(v)/AGIT_V)); empuje=Math.max(-12,Math.min(12,-v*.012)); }
    ultScroll.y=y; ultScroll.t=t;
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

  // Medición (036): ataques por nivel de quorum y por exposición (segundos-célula de presa adherida en colonia, NB ≥ 3), dispersiones por quorum según la densidad
  var med={g:[[0,0],[0,0]],gt:[[0,0],[0,0]],expo:[0,0,0],inf:[0,0,0],expoNB:[0,0],infNB:[0,0],qx:[0,0,0],qd:[0,0,0],qlog:[],lisis:0,burst:0,cmuere:0,cent:0};
  function bin3(q){ return q<.1?0:q<.5?1:2; }
  function pesoPresa(j){ var w=PREF[EST[T[j]]]; return S[j]?w*(.3+.7*Math.min(NB[j],6)/6):w*.22; }
  // C (depredador): fase de ataque. Nada rápido, persigue la presa de más peso a su alcance y, en contacto, la ataca (el quorum de la presa reduce el acceso).
  // Devuelve 0 si sigue, 1 si entró en una presa (queda dentro: la presa se redondea) y 2 si murió de hambre.
  function cazar(i,dt,rel){
    var x=X[i], y=Y[i], j, best=-1, bw=0, bd=0, dx, dy, d2, w, a=TH[i], da, v, ta, e;
    HM[i]+=dt; if(HM[i]>CHAMBRE||Math.random()<CM0*dt){ med.cmuere++; return 2; }
    for(j=0;j<n;j++){ if(j===i||EST[T[j]]===3||IN[j]>0) continue; dx=X[j]-x; dy=Y[j]-y; d2=dx*dx+dy*dy; if(d2>CRAD*CRAD) continue;
      w=pesoPresa(j)/(1+Math.sqrt(d2)/40); if(w>bw){ bw=w; best=j; bd=d2; } }
    if(best>=0){ ta=Math.atan2(Y[best]-y,X[best]-x); da=ta-a; da-=6.283185307*Math.round(da/6.283185307); e=CTURN*dt; a+=da<-e?-e:da>e?e:da; }
    else{ a+=Math.sqrt(2*DR*dt)*normal(); if(Math.random()<LAM[4]*dt){ a+=GIRO[4]*normal(); SP[i]=FRENADA; } }
    TH[i]=a; SP[i]+=(1-SP[i])*rel; v=VEL[4]*SP[i]; FI[i]+=KONDA[4]*v/ETA*dt;
    flujo(x,y,tiempo,false); X[i]=x+(Math.cos(a)*v+fu)*dt; Y[i]=y+(Math.sin(a)*v+fv)*dt;
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
    for(j=0;j<m;j++) if(depr&&nc<CMAX&&n<NIVELES[nivel].cap&&Math.random()<(1-Math.pow(nc/CMAX,CEXP))*PREF[EST[T[i]]]){ nueva(X[i]+3*normal(),Y[i]+3*normal(),Math.random()*6.283185307,4); nc++; kk++; } // las crías sobreviven menos cuanto más C hay (dependencia de la densidad)
    m=kk;
    CA[k]=Math.min(1,CA[k]+LIBC*BM[i]); CP[k]=Math.min(1,CP[k]+LIBP*BM[i]); sucio=true;
    med.lisis++; med.burst+=m>0?m:0; ev.lisis=(ev.lisis||0)+1;
  }

  function paso(dt,real){
    var nv=NIVELES[nivel], fs=fuentes, i, c, l, s, a, p=1-Math.exp(-dt/TAU), sd=Math.sqrt(2*DR*dt), bro=Math.sqrt(2*BRO*dt), rel=1-Math.exp(-dt/RELAJA),
        tp, x, y, v, ex, ey, exy, th2, k, cl, q, cap=nv.cap, ns=0, viva, gi, gj, k2, ao, bx, bf, pl, rc, qp, gg, esB, esN, ek, ql, bn, nC=0, ml, vl, qm;
    tiempo+=dt; cuadro++; real=real==null?dt:real; relojC+=real;
    agit*=Math.exp(-real/AGIT_T); empuje*=Math.exp(-real/AGIT_T); ONDAS[3].a=AGIT_O*agit; // la agitación del scroll decae en ≈ 2 s
    if(nv.texto&&performance.now()-tMasc>MASC_MS) mascara();
    cursorPaso(real);
    acum+=dt; if(cuadro%nv.grilla===0){ difundir(acum); acum=0; } // nivel 0: la grilla se actualiza cada 3 cuadros
    nNadan=0; nSesiles=0;
    for(i=0;i<n;i++){
      tp=T[i]; x=X[i]; y=Y[i]; k=celda(x,y); cl=CA[k]; pl=CP[k]; ml=CK[k]; vl=CF[k]; viva=true; esB=EST[tp]===1; esN=EST[tp]===2; ek=EPSK[tp];
      if(IN[i]>0){ IN[i]-=dt; if(IN[i]<=0){ lisis(i,k); quitar(i); i--; continue; } }          // presa con un C dentro: cuando se cumple el plazo, lisis
      if(S[i]){ // ---- adherida: quieta, crece, se divide, deposita matriz o se dispersa ----
        nSesiles++;
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
        if(esB||esN){ bn=esB?0:1; ql=NP[i]>0?0:1; med.g[bn][ql]+=GROW*GR[i]*gg*dt; med.gt[bn][ql]+=dt; }  // medición: crecimiento con la pareja a < RP px (juntos) y sin ella (separados)
        if(IN[i]>0) gg=0;                                                              // bdeloplasto: la presa deja de crecer y de dividirse
        if(!(tp===0&&ES[i]===3&&BM[i]>=1.45)) BM[i]+=GROW*GR[i]*dt*gg;                  // ritmo individual (los diplococos se quedan en pares)
        if(NB[i]>=2){ ao=Math.atan2(-VY[i],-VX[i]); TH[i]+=dt*.4*Math.sin(2*(ao-TH[i])); } // los bastones y las cadenas se alinean con el radio de la colonia: crecimiento radial
        if(n>=cap-RESERVA){ if(BM[i]>1.69) BM[i]=1.69; }                                  // con la población al tope no hay divisiones (ni constricción a medias)
        else if(BM[i]>=2&&!dividir(i)){ BM[i]=1.55; ev.divFalla=(ev.divFalla||0)+1; }                                          // si no hay lugar, la constricción retrocede y se reintenta más tarde
        if(cl+(esB?WP*pl:esN?WMA*ml:0)<CDT[tp]) HM[i]+=dt; else { HM[i]-=2*dt; if(HM[i]<0) HM[i]=0; }
        if(HM[i]>THAMBRE){
          if(NB[i]<4&&Math.random()<KDISP*dt){ // dispersión: sale hacia afuera desde el borde de la colonia
            a=Math.atan2(-VY[i],-VX[i]); if(NB[i]===0) a=Math.random()*6.283185307;
            S[i]=0; TH[i]=a+.4*normal(); SP[i]=FRENADA; BM[i]=1; HM[i]=-REFRACTARIA; M[i]=Math.log(sentir(tp,x,y)+C0); ev.disp++;
            for(k=0;k<n;k++) if(S[k]&&k!==i&&(X[k]-x)*(X[k]-x)+(Y[k]-y)*(Y[k]-y)<VECINO*VECINO*1.7) HM[k]+=CASCADA; // la dispersión se contagia a las vecinas (señal de colonia)
          }else if(HM[i]>3*THAMBRE&&Math.random()<KMUERTE*dt){ viva=false; ev.hambre++; } // el hambre prolongada mata
        }
      }else{
        if(tp===4) nC++; else nNadan++; if(HM[i]<0) HM[i]+=dt;
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
          l=LAM[tp]*Math.exp(-GAIN*s); l=l<LAM[tp]*LMIN?LAM[tp]*LMIN:l>LAM[tp]*LMAX?LAM[tp]*LMAX:l;
          a=TH[i]+sd*normal();                     // ruido de rotación
          if(Math.random()<l*dt){ a+=GIRO[tp]*normal(); SP[i]=FRENADA; } // giro («tumble»): la célula frena un instante
          if(nv.jeffery){                          // órbita de Jeffery: gira con la vorticidad y se alinea con el corte
            ex=gux; exy=.5*(guy+gvx); th2=2*a;
            a+=dt*(.5*(gvx-guy)+LAMBDA_J*(exy*Math.cos(th2)-ex*Math.sin(th2)));
          }
          TH[i]=a;
          SP[i]+=(1-SP[i])*rel;                    // se recupera la velocidad
          v=VEL[tp]*SP[i];                         // velocidad real de nado
          FI[i]+=KONDA[tp]*v/ETA*dt;               // la fase de la onda avanza con la velocidad: ω = k·v/η
          if(tp===2) a+=.5*Math.sin(FI[i]/6+PH[i]); // tirabuzón: el vaivén sale de la misma fase que la onda del cuerpo
          x+=(Math.cos(a)*v+fu)*dt; y+=(Math.sin(a)*v+fv)*dt;
        }
        bx=0; // texto en «aguas tranquilas»: las células se alejan suavemente de los bloques de texto y no se adhieren bajo ellos
        if(nv.texto){ k2=celda(x,y); gi=k2%GX; gj=(k2/GX)|0; bx=TXT[k2];
          bf=REP_T*dt*.5;
          x-=(TXB[gj*GX+(gi<GX-1?gi+1:gi)]-TXB[gj*GX+(gi>0?gi-1:gi)])*bf; y-=(TXB[(gj<GY-1?gj+1:gj)*GX+gi]-TXB[(gj>0?gj-1:gj)*GX+gi])*bf; }
        // adhesión: en una zona rica, más probable junto a células ya adheridas
        rc=cl+(esB?WP*pl+WFA*vl:esN?WMA*ml:0); if(rc>1) rc=1;                                          // riqueza que percibe: c (y p, para B)
        if(tp===4){}                                                                  // C no se adhiere
        else if(rc>CADT[tp]&&Math.random()<KADH*KADT[tp]*dt*(rc-CADT[tp])/(1-CADT[tp])*(.06+1.6*NB[i])*(1-bx)/(esB?(1+NAK*NA[i])*(1+cl*cl/(KIB*KIB)):1)&&NB[i]<9&&HM[i]>=0){ S[i]=1; SP[i]=0; HM[i]=0; BM[i]=1+.4*Math.random(); ev.adh++; } // B se adhiere con menos nutriente y más seguido
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
    if(nNadan<NSWIM&&n<cap&&Math.random()<INMIG*dt){ entrante(); ev.ent++; }
    if(depr&&nC<CMIN&&n<cap&&Math.random()<CIMM*dt){ entranteC(); med.cent++; }          // el piso de C: si quedan menos de CMIN, entra una por un borde
    while(n>cap) quitar(n-1);
    vecinos(nv.choques);
  }

  // Vecindad y choques suaves (un solo recorrido de pares): cuenta las vecinas adheridas de cada célula (para la adhesión y la
  // dispersión) y, si el nivel lo permite, empuja a las que se superponen; las adheridas no se mueven.
  function vecinos(empujar){
    var i, j, dx, dy, d2, md, d, o, k, si, sj, r2=VECINO*VECINO;
    for(i=0;i<n;i++){ NB[i]=0; NA[i]=0; NP[i]=0; VX[i]=0; VY[i]=0; }
    for(i=0;i<n-1;i++) for(j=i+1;j<n;j++){
      dx=X[j]-X[i]; dy=Y[j]-Y[i];
      if(dx>RP||dx<-RP||dy>RP||dy<-RP) continue;
      d2=dx*dx+dy*dy; si=S[i]; sj=S[j];
      if(d2<RP*RP&&NP[i]<255&&NP[j]<255&&EST[T[i]]+EST[T[j]]===3&&EST[T[i]]*EST[T[j]]===2){ NP[i]++; NP[j]++; }  // pareja del mutualismo (espirilo y B) a < RP px
      if(d2<r2){ if(sj&&NB[i]<255){ NB[i]++; VX[i]+=dx; VY[i]+=dy; if(EST[T[j]]===0) NA[i]++; } if(si&&NB[j]<255){ NB[j]++; VX[j]-=dx; VY[j]-=dy; if(EST[T[i]]===0) NA[j]++; } }
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
    var k, j, e, g, w, sg, ng=nv.gr, c, tx, ty, p, vi, b, na=0, rel, ce, bajo, cx, cy, t, nb=0, kw, rho, sg0, ti, vi2, sol, al, rc, th, gr, m, fo;
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
        AX[na]=cx; AY[na]=cy; AS[na]=g.sz[j]; AB[na]=b*2+bajo; na++; nb+=bajo;
      }
      sol=(e.D-SOL0)/(SOL1-SOL0); sol=sol<0?0:sol>1?1:sol; sol=sol*sol*(3-2*sol); m=ti>0?vi2/ti:0; al=ALFA_NUC*sol*m*factor; // el núcleo: más sólido con lo depositado, más fino cuando se lo comen
      if(al>.01&&e.x>=0&&e.y>=0&&e.x<W&&e.y<H){
        rc=NUC_R*sg*Math.sqrt(m); if(nv.texto&&TXB[celda(e.x,e.y)]>.5) al*=ARENA_TXT;
        gr=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,rc*1.2); gr.addColorStop(0,'rgba('+rgb+','+al.toFixed(3)+')'); gr.addColorStop(.7,'rgba('+rgb+','+(al*.8).toFixed(3)+')'); gr.addColorStop(1,'rgba('+rgb+','+(al*.15).toFixed(3)+')');
        e.nr=rc; e.na=al; ctx.fillStyle=gr; ctx.beginPath();
        for(t=0;t<28;t++){ th=t*.2243995; fo=1+.12*Math.sin(2*th+g.f[0])+.08*Math.sin(3*th+g.f[1])+.05*Math.sin(5*th+g.f[2]); tx=e.x+Math.cos(th)*rc*fo; ty=e.y+Math.sin(th)*rc*fo; if(t) ctx.lineTo(tx,ty); else ctx.moveTo(tx,ty); }
        ctx.closePath(); ctx.fill();
      }
    }
    nGranos=na; nBajo=nb;
    for(b=0;b<6;b++){
      ctx.beginPath(); t=0;
      for(j=0;j<na;j++) if(AB[j]===b){ ctx.rect(AX[j]-AS[j]*.5,AY[j]-AS[j]*.5,AS[j],AS[j]); t=1; }
      if(t){ ctx.fillStyle='rgba('+rgb+','+(ALFA_AR[b>>1]*(b&1?ARENA_TXT:1)*factor).toFixed(3)+')'; ctx.fill(); }
    }
  }

  function dibujar(){
    var i, k, tp, c, s, a, x, y, sx, f, u, w, e, sesil, sz, pt, Le, g, r, d, nv=NIVELES[nivel], m, ex, ey, h, nf, hf;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H); ctx.globalAlpha=1;
    ctx.lineCap='round'; ctx.lineJoin='round';
    if(nv.eps&&eneT){ // matriz (EPS): rastros finos y alargados, en tres tramos de intensidad, que se desvanecen con la edad
      var b3, ne=eneT<NE?eneT:NE, ed;
      ctx.lineWidth=1.05;
      for(b3=0;b3<3;b3++){
        ctx.beginPath(); r=0;
        for(k=0;k<ne;k++){ ed=1-(tiempo-EN[k])/EPS_VIDA; if(ed<=0) continue; w=EW[k]*ed; if((w>.62?2:w>.3?1:0)!==b3) continue; ctx.moveTo(EA[k*4],EA[k*4+1]); ctx.lineTo(EA[k*4+2],EA[k*4+3]); r=1; }
        if(r){ ctx.strokeStyle='rgba('+rgb+','+(ALFA_EPS[b3]*factor).toFixed(3)+')'; ctx.stroke(); }
      }
    }
    if(cur.length) arena(nv);
    if(nt){ // trazadores: líneas finísimas, con una cola corta en el sentido contrario a la corriente
      ctx.strokeStyle=traza; ctx.lineWidth=.9; ctx.beginPath();
      for(i=0;i<nt;i++){ flujo(TX[i],TY[i],tiempo,false); ctx.moveTo(TX[i],TY[i]); ctx.lineTo(TX[i]-fu*.5,TY[i]-fv*.5); }
      ctx.stroke();
    }
    for(i=0;i<n;i++){
      tp=T[i]; x=X[i]; y=Y[i]; sesil=S[i]; sz=SZ[i];
      u=sesil&&BM[i]>1.7?(BM[i]-1.7)/.3:0; if(u>1) u=1;                       // avance de la constricción (la célula se alarga y se estrecha al medio)
      if(nv.texto){ m=1-.45*(TXB[celda(x,y)]>1?1:TXB[celda(x,y)]); ctx.globalAlpha=m; } // más tenues bajo el texto
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
        if(!sesil){                                                                                                                                 // flagelo: onda que viaja hacia atrás (largo en A, corto en B; detenido y sin dibujar si está adherida)
          nf=tp===1?12:6; hf=(h+r)*sz; ctx.strokeStyle=cola; ctx.lineWidth=.75; ctx.beginPath(); ctx.moveTo(-hf,0);
          for(k=1;k<=nf;k++){ pt=k*.75; w=-hf-pt; ctx.lineTo(w,1.5*(pt/9)*Math.sin(KONDA[1]*w+f)); }
          ctx.stroke();
        }
      }else if(tp===4){                                                                                                                              // vibrio (C): una coma de 5 px, mucho más chica que A y B, con un flagelo polar de onda rápida
        ctx.strokeStyle=colores[4]; ctx.lineWidth=1.7*sz; ctx.beginPath();
        for(k=0;k<=6;k++){ sx=(-2.4+k*.8); if(k) ctx.lineTo(sx*sz,.95*sz*(1-sx*sx/5.76)); else ctx.moveTo(sx*sz,0); }
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
  function fijarNivel(k){ nivel=Math.max(0,Math.min(NIVELES.length-1,k)); var nv=NIVELES[nivel]; while(n>nv.cap) quitar(n-1); if(nv.traz>nt) trazadores(nv.traz); else nt=nv.traz; }
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
    pausar(); cv.style.display='none'; raiz.classList.remove('fondo-vivo'); fallos++;
    if(fallos>=3){ parar(); return; }
    setTimeout(function(){ if(!vivo||window.innerWidth<1024) return; cv.style.display='block'; fijarNivel(0); st.techo=1; st.estables=0; st.ventana=2000; arrancar(); },60000*fallos);
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
  function parar(){ vivo=false; pausar(); raiz.classList.remove('fondo-vivo'); if(cv.parentNode) cv.parentNode.removeChild(cv); }

  document.addEventListener('visibilitychange',function(){ if(document.hidden) pausar(); else arrancar(); });
  window.addEventListener('resize',function(){
    if(window.innerWidth<1024){ pausar(); cv.style.display='none'; raiz.classList.remove('fondo-vivo'); return; }
    cv.style.display='block'; medir(); var i; for(i=0;i<n;i++){ if(X[i]>W) X[i]=Math.random()*W; if(Y[i]>H) Y[i]=Math.random()*H; }
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
            ritmo:+ritmo.toFixed(3),agitacion:+agit.toFixed(3),arena:{granos:cur.length?nGranos:0,bajoTexto:cur.length?nBajo:0},
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
    nivel:function(k){ if(k==null) return nivel; st.fijo=true; fijarNivel(k); st.t0=performance.now(); st.trab=0; st.cuadros=0; return nivel; },
    relaciones:function(o){ var k;
      if(o&&o.subproducto!=null){ subp=!!o.subproducto; if(!subp) CP.fill(0); }
      if(o&&o.depredador!=null){ depr=!!o.depredador; if(!depr){ for(k=n-1;k>=0;k--) if(T[k]===4) quitar(k); } }
      if(o&&o.excluir!=null){ excl=o.excluir.slice(); for(k=n-1;k>=0;k--) if(excl.indexOf(EST[T[k]])>=0) quitar(k); }
      if(o&&o.mutualismo!=null){ mut=!!o.mutualismo; if(!mut){ CK.fill(0); CF.fill(0); } }
      if(o&&o.quorum!=null){ quor=!!o.quorum; if(!quor){ CI.fill(0); for(k=0;k<n;k++){ QL[k]=0; QT[k]=0; } } }
      return {subproducto:subp,depredador:depr,quorum:quor,mutualismo:mut,excluir:excl.slice()}; },
    medicion:function(){ return JSON.parse(JSON.stringify(med)); },
    estado:function(){ var nv=NIVELES[nivel], co=colonias(), cs=0, k, mn=1, mx=0, ps=0, pm=0, mo=[[0,0],[0,0],[0,0],[0,0]], ninf=0; for(k=0;k<GN;k++){ cs+=CA[k]; ps+=CP[k]; if(CA[k]<mn) mn=CA[k]; if(CA[k]>mx) mx=CA[k]; if(CP[k]>pm) pm=CP[k]; }
      for(k=0;k<n;k++){ mo[EST[T[k]]][0]++; if(S[k]) mo[EST[T[k]]][1]++; if(IN[k]>0) ninf++; }
      return {morfos:{A:mo[0],B:mo[1],N:mo[2],C:mo[3]},infectadas:ninf,subproducto:{activo:subp,medio:+(ps/GN).toFixed(4),max:+pm.toFixed(3)},nivel:nivel,celulas:n,nadando:nNadan,adheridas:nSesiles,colonias:co.n,mayorColonia:co.max,coloniasGrandes:co.grandes,nutrienteMedio:+(cs/GN).toFixed(3),nutrienteMax:+mx.toFixed(2),eventos:JSON.parse(JSON.stringify(ev)),cursor:cursorEstado(),eps:epsEstado(),trazadores:nt,fps:+st.fps.toFixed(1),trabajoMs:+st.trabajoMs.toFixed(2),fijo:st.fijo,choques:nv.choques,jeffery:nv.jeffery,historial:st.historial.slice()}; },
    posiciones:function(){ var s=Array.prototype.slice, es=[], k; for(k=0;k<n;k++) es.push(EST[T[k]]); return {x:s.call(X,0,n),y:s.call(Y,0,n),th:s.call(TH,0,n),fi:s.call(FI,0,n),sp:s.call(SP,0,n),tipo:s.call(T,0,n),estrategia:es,infectada:s.call(IN,0,n).map(function(v){ return v>0?1:0; }),quorum:s.call(QL,0,n),sesil:s.call(S,0,n),biomasa:s.call(BM,0,n)}; },
    avanzar:function(seg){ var k=Math.round(seg*30); for(var i=0;i<k;i++) paso(1/30); dibujar(); },
    grilla:function(){ return {gx:GX,gy:GY,c:Array.prototype.slice.call(CA),p:Array.prototype.slice.call(CP),q:Array.prototype.slice.call(CI),m:Array.prototype.slice.call(CK),f:Array.prototype.slice.call(CF)}; },
    flujo:function(x,y,t){ flujo(x,y,t==null?tiempo:t,true); return {u:fu,v:fv,ux:gux,uy:guy,vx:gvx,vorticidad:gvx-guy}; },
    parar:parar
  };

  tScroll=performance.now(); ultScroll.y=window.pageYOffset||0; ultScroll.t=tScroll;
  medir(); colorDeTinta(); huella(); for(var q0=0;q0<GN;q0++) CA[q0]=Math.min(1,SG[q0]*.8); // el nutriente parte repartido cerca de las fuentes
  difundir(2); sembrar(90); fijarNivel(nivelInicial()); dibujar(); arrancar();
})();
