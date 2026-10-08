/* Fondo con quimiotaxis bacteriana en un fluido (iteración 024; células visibles y corriente en la 025; acopladas al fluido en la
   026; nutriente que se consume y ciclo nadar → adherirse → colonia en la 027). Sólo escritorio: lo carga index.html cuando hay
   puntero fino, el ancho es de 1024 px o más, no hay movimiento reducido ni ahorro de datos. Sin dependencias; no envía nada
   fuera del navegador. (La biopelícula está inspirada en autómatas celulares con nutrientes que difunden y se consumen con
   cinética de Monod, como raphaelrubrice/Biofilm-Simulator, MIT; todo el código es propio.)

   Una muestra ambiental de hasta 100 a 160 células de 5 a 8 px, en tres formas y con tres comportamientos:
     cocos (círculos, 30 %)      casi no nadan: los lleva la corriente, con un poco de movimiento browniano;
     bacilos (cápsulas, 50 %)    «run and tumble» con quimiotaxis, como E. coli, orientados hacia donde nadan y con un flagelo;
     espirilos (ondas, 20 %)     nadan en tirabuzón, más rápido y con giros menos frecuentes.

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

   Interacción con el lector (029): (1) las palabras marcadas con data-nutriente en el HTML liberan nutriente mientras están a la vista, y
   su fuente sigue a la palabra con el scroll; (2) la velocidad del scroll agita el fluido (una onda corta y un empuje que decaen en
   ≈ 2 s); (3) un clic sobre una zona no interactiva (sin selección de texto) deja un pulso de nutriente. Las fuentes del cursor, de las
   palabras y de los pulsos comparten el MISMO presupuesto finito: lo que toman se lo quitan a las de fondo, en proporción, y si piden más
   de lo disponible se recortan todas por igual.
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

   API (window.Quimiotaxis), pensada para fuentes dinámicas (palabras clave que el usuario pueda mover):
     agregar({id, x, y, a, s})  agrega una fuente que repone nutriente (x, y en px de la ventana; a amplitud; s ancho en px)
     mover(id, x, y)            cambia la posición de una fuente (puede llamarse en cada cuadro)
     quitar(id)                 la elimina
     fuentes                    arreglo vivo de fuentes
     usarCampo(fn)              reemplaza lo que lee la quimiotaxis: fn(x, y, fuentes) → concentración ≥ 0 (la grilla sigue
                                existiendo: es lo que se consume y donde se adhieren y crecen las células)
     opacidad(f)                factor sobre la opacidad de cada forma (1 por defecto)
     nivel(k) / estado()        diagnóstico y fijar el nivel de calidad (para medir); posiciones() copia las posiciones;
                                avanzar(seg) simula sin esperar (pruebas y videos); flujo(x, y) lee la corriente
     parar()                    detiene y quita el canvas */
(function(){
  'use strict';
  if(window.Quimiotaxis) return;

  // Niveles de calidad (se adapta la calidad, no el tamaño de la población): cuadros por segundo, tope de población, choques,
  // trazadores, órbitas de Jeffery, matriz (EPS) y cada cuántos cuadros se actualiza la grilla de nutriente.
  var NIVELES=[{fps:20,cap:60,choques:false,traz:0,jeffery:false,eps:false,texto:false,grilla:3},{fps:30,cap:120,choques:false,traz:24,jeffery:true,eps:true,texto:true,grilla:1},
               {fps:30,cap:140,choques:true,traz:40,jeffery:true,eps:true,texto:true,grilla:1},{fps:60,cap:160,choques:true,traz:40,jeffery:true,eps:true,texto:true,grilla:1}];
  // Por tipo: 0 coco, 1 bacilo, 2 espirilo. Velocidad de nado (px/s), giros por segundo, desviación del giro (rad), radio de choque (px)
  var VEL=[0,25,38], LAM=[0,1,.35], GIRO=[0,1.1,.8], RAD=[2.8,3.4,3.6];
  var ALFA=[.26,.37,.30], ALFA_COLA=.40, ALFA_TRAZ=.14, ALFA_SES=1.18, ALFA_EPS=.035, ALFA_HALO=.024; // opacidades (tinta del sitio); las adheridas, algo más; la matriz, muy tenue
  var PATRON=[0,1,1,2,1,0,1,2,1,0];  // 3 cocos, 5 bacilos y 2 espirilos de cada 10
  var TAU=.9, GAIN=6, C0=.02, DR=.15, BRO=7, HUECO=.6, RIGIDEZ=.45, LMIN=.08, LMAX=5;
  var ETA=.55, KONDA=[0,.95,.698];  // propulsión: v = η·(ω/k); número de onda (rad/px) del flagelo del bacilo (λ 5 px) y del cuerpo del espirilo (λ 9 px)
  var FRENADA=.2, RELAJA=.35, LAMBDA_J=.9;  // tras un giro la velocidad cae al 20 % y se recupera en ≈ .35 s; Λ de Jeffery
  // Nutriente (c en [0, 1], por celda de la grilla): difusión (px²/s), reposición de las fuentes (1/s), constante de Monod, consumo por célula (1/s)
  var GX=64, GY=40, DIF=380, REPO=.2, DEC=.05, KM=.2, QNAD=.004, QSES=.28;
  // Ciclo de vida: adhesión (umbral de c, tasa 1/s), crecimiento (1/s de biomasa a c saturante), dispersión (umbral de c, segundos de hambre, tasa 1/s), muerte
  var CAD=.5, KADH=.25, GROW=1/15, CDISP=.17, THAMBRE=6, KDISP=1.2, KMUERTE=.012, CASCADA=4, VECINO=13;
  var SALIDA=.2, MUERTE_POBRE=.004, INMIG=.7, NSWIM=64;  // prob. de salir por un borde, muerte en medio pobre (1/s), entrada de nadadoras (1/s), nadadoras que se mantienen
  // Cursor como fuente: quietud (px y s), amplitud máxima, constantes de crecimiento y de decaimiento (s), tope de fuentes del cursor, piso de las de fondo, retorno (s)
  var TOL=6, ESPERA=2, AMAX=1.8, SIGMA=1.3, TAUG=12, TAUD=18, MAXC=3, PISO=.15, TAUR=20;
  // 029: palabras clave (amplitud, ancho relativo, constante de subida/bajada en s), pulso del clic (amplitud, ancho, decaimiento en s, tope),
  // agitación del scroll (px/s de la onda, de la deriva, velocidad de scroll que la satura, decaimiento en s), calma (espera en s, factor, constante en s),
  // repulsión del texto (px/s por unidad de gradiente), tiempo de reconstrucción de la máscara (ms)
  var AKW=.4, SKW=.8, TKW=1.2, APUL=1.1, SPUL=.55, TPUL=5, MAXP=4, AGIT_O=16, AGIT_D=12, AGIT_V=2500, AGIT_T=1.6, CALMA_ESPERA=4, CALMA_F=.6, CALMA_T=1.5, REP_T=36, MASC_MS=250;
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
      NB=new Uint8Array(NMAX), VX=new Float32Array(NMAX), VY=new Float32Array(NMAX), SZ=new Float32Array(NMAX), GR=new Float32Array(NMAX), ES=new Uint8Array(NMAX);
  var TX=new Float32Array(TMAX), TY=new Float32Array(TMAX), nt=0;
  var CA=new Float32Array(GN), CB=new Float32Array(GN), SG=new Float32Array(GN), EPS=new Float32Array(GN), TXT=new Float32Array(GN), TXB=new Float32Array(GN), TXC=new Float32Array(GN), sucio=true, acum=0, cuadro=0;
  var n=0, nivel=0, raf=0, ultimo=0, vivo=true, tiempo=0, factor=1, colores=['','',''], coloresS=['','',''], cola='', traza='', rgb='0,0,0';
  var palEls=null, tPal=-1e9, relojC=0, kws=[], pul=[], pid=0, agit=0, empuje=0, tScroll=0, ritmo=1, ultScroll={y:0,t:0}, textoEls=[], tMasc=-1e9, cur=[], ptr={x:0,y:0,ok:false}, anc={x:0,y:0,t:0}, creciendo=null, cid=0, ultHuella=-9, ev={adh:0,div:0,disp:0,hambre:0,pobre:0,sal:0,ent:0}, fuentes=[], campoFn=null, usuario=false, nNadan=0, nSesiles=0;
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
    var m=Math.max(1,Math.ceil(dt*DIF*(2/(hx*hx)+2/(hy*hy))/.8)), h=dt/m, ax=DIF*h/(hx*hx), ay=DIF*h/(hy*hy), r=REPO*h, de=DEC*h, s, i, j, k, a, c, t, u;
    if(sucio&&cuadro-ultHuella>=4){ huella(); ultHuella=cuadro; } // el perfil de las fuentes se recalcula cada 4 cuadros como máximo
    for(s=0;s<m;s++){
      for(j=0;j<GY;j++) for(i=0;i<GX;i++){
        k=j*GX+i; c=CA[k];
        a=c+ax*((i>0?CA[k-1]:c)+(i<GX-1?CA[k+1]:c)-2*c)+ay*((j>0?CA[k-GX]:c)+(j<GY-1?CA[k+GX]:c)-2*c)+r*SG[k]*(1-c)-de*c;
        CB[k]=a<0?0:a>1?1:a;
      }
      t=CA; CA=CB; CB=t;
    }
  }
  function leer(x,y){ // interpolación bilineal de la grilla (los valores están en los centros de las celdas)
    var gx=x/hx-.5, gy=y/hy-.5, i=Math.floor(gx), j=Math.floor(gy), fx=gx-i, fy=gy-j, i1=i+1, j1=j+1;
    if(i<0){ i=0; fx=0; } if(j<0){ j=0; fy=0; } if(i1>GX-1) i1=GX-1; if(j1>GY-1) j1=GY-1; if(i>GX-1) i=GX-1; if(j>GY-1) j=GY-1;
    return (CA[j*GX+i]*(1-fx)+CA[j*GX+i1]*fx)*(1-fy)+(CA[j1*GX+i]*(1-fx)+CA[j1*GX+i1]*fx)*fy;
  }
  function celda(x,y){ var i=(x/hx)|0, j=(y/hy)|0; i=i<0?0:i>GX-1?GX-1:i; j=j<0?0:j>GY-1?GY-1:j; return j*GX+i; }
  function campo(x,y){ return campoFn?campoFn(x,y,fuentes):leer(x,y); }

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
    for(var k=0;k<3;k++){ colores[k]='rgba('+rgb+','+Math.min(1,ALFA[k]*factor).toFixed(3)+')'; coloresS[k]='rgba('+rgb+','+Math.min(1,ALFA[k]*ALFA_SES*factor).toFixed(3)+')'; }
    cola='rgba('+rgb+','+Math.min(1,ALFA_COLA*factor).toFixed(3)+')'; traza='rgba('+rgb+','+Math.min(1,ALFA_TRAZ*factor).toFixed(3)+')';
  }

  // ---- Células ----
  function nueva(x,y,th,tp){
    var i=n++; T[i]=tp; X[i]=x; Y[i]=y; TH[i]=th; PH[i]=Math.random()*6.283185307; FI[i]=Math.random()*6.283185307; SP[i]=1; S[i]=0; BM[i]=1; HM[i]=0; NB[i]=0;
    SZ[i]=.88+.3*Math.random(); GR[i]=.75+.5*Math.random(); ES[i]=tp===0?(Math.random()<.4?1:2):0; // tamaño y ritmo de crecimiento individuales; cocos: 1 diplococo, 2 estreptococo
    M[i]=Math.log(campo(x,y)+C0); return i;
  }
  function quitar(i){ // saca la célula i copiando la última en su lugar
    var u=--n; if(i===u) return;
    X[i]=X[u]; Y[i]=Y[u]; TH[i]=TH[u]; M[i]=M[u]; PH[i]=PH[u]; SP[i]=SP[u]; FI[i]=FI[u]; BM[i]=BM[u]; HM[i]=HM[u]; T[i]=T[u]; S[i]=S[u]; NB[i]=NB[u]; VX[i]=VX[u]; VY[i]=VY[u]; SZ[i]=SZ[u]; GR[i]=GR[u]; ES[i]=ES[u];
  }
  function entrante(){ // una nadadora entra por un borde, hacia adentro
    var lado=(Math.random()*4)|0, x, y, th;
    if(lado===0){ x=1; y=Math.random()*H; th=0; } else if(lado===1){ x=W-1; y=Math.random()*H; th=Math.PI; } else if(lado===2){ x=Math.random()*W; y=1; th=Math.PI/2; } else { x=Math.random()*W; y=H-1; th=-Math.PI/2; }
    nueva(x,y,th+.7*normal(),PATRON[(Math.random()*PATRON.length)|0]);
  }
  function sembrar(k){ for(var i=0;i<k;i++) nueva(Math.random()*W,Math.random()*H,Math.random()*6.283185307,PATRON[i%PATRON.length]); }
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
        ev.div++; X[i]=x0-ex*h; Y[i]=y0-ey*h; TH[i]=a;
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
  function suelta(){ if(creciendo){ creciendo.crece=false; creciendo=null; } }
  function alMover(e){
    if(e.pointerType==='touch') return;
    ptr.x=e.clientX; ptr.y=e.clientY; ptr.ok=true;
    var dx=ptr.x-anc.x, dy=ptr.y-anc.y;
    if(dx*dx+dy*dy>TOL*TOL){ anc.x=ptr.x; anc.y=ptr.y; anc.t=relojC; suelta(); } // se movió más que el temblor: reinicia la espera y suelta la fuente
  }
  function pesoAd(f){ var r=f.s/sref(); return f.ad*r*r; } // caudal deseado de una fuente que toma del presupuesto
  function cursorPaso(dt){
    var i, f, bs=[], Bt=0, Ft=0, Ct=0, w, r, esc, tar, k, tom=[], e;
    if(ptr.ok&&!creciendo&&!document.hidden&&relojC-anc.t>=ESPERA){ // 2 s quieto: nace una fuente
      for(i=0,k=0;i<cur.length;i++) if(!cur[i].rapido) k++;                              // si ya hay MAXC, las más viejas se apagan antes (decaimiento rápido)
      for(i=0;i<cur.length&&k>=MAXC;i++) if(!cur[i].rapido){ cur[i].rapido=true; k--; }
      f={id:'cursor'+(cid++),cursor:true,x:anc.x,y:anc.y,a:0,ad:0,s:SIGMA*sref(),s0:SIGMA*sref(),t0:relojC,tf:0,crece:true,rapido:false};
      fuentes.push(f); cur.push(f); creciendo=f;
    }
    for(i=cur.length-1;i>=0;i--){
      f=cur[i];
      if(f.crece) f.ad=AMAX*(1-Math.exp(-(relojC-f.t0)/TAUG));                           // crece con la permanencia
      else{
        f.tf+=dt; f.ad*=Math.exp(-dt/(f.rapido?4:TAUD)); f.s=f.s0*(1+.7*(1-Math.exp(-f.tf/30))); // se difumina: decae y se ensancha
        if(f.ad<.015){ k=fuentes.indexOf(f); if(k>=0) fuentes.splice(k,1); cur.splice(i,1); sucio=true; continue; }
      }
      tom.push(f);
    }
    for(i=0;i<kws.length;i++){ // palabras clave: sueltan nutriente mientras están a la vista
      f=kws[i]; e=1-Math.exp(-dt/TKW); f.ad+=((f.visible?AKW:0)-f.ad)*e;
      if(f.visible||f.ad>=.01){ if(!f.activa){ fuentes.push(f); f.activa=true; } tom.push(f); }
      else if(f.activa){ k=fuentes.indexOf(f); if(k>=0) fuentes.splice(k,1); f.activa=false; f.a=0; sucio=true; }
    }
    for(i=pul.length-1;i>=0;i--){ // pulsos de clic: decaen solos
      f=pul[i]; f.ad*=Math.exp(-dt/TPUL); f.tf+=dt; f.s=f.s0*(1+.6*(1-Math.exp(-f.tf/6)));
      if(f.ad<.02){ k=fuentes.indexOf(f); if(k>=0) fuentes.splice(k,1); pul.splice(i,1); sucio=true; continue; }
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

  // Un clic sobre una zona no interactiva (y sin selección de texto) deja un pulso pequeño de nutriente, del mismo presupuesto
  window.addEventListener('click',function(e){
    var el=e.target, sel, f, k;
    if(!vivo||e.button!==0||e.pointerType==='touch'||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.defaultPrevented) return;
    if(el&&el.closest&&el.closest('a,button,input,textarea,select,summary,label,details,[role="button"],[contenteditable],[tabindex],video,audio,svg a')) return;
    sel=window.getSelection&&window.getSelection(); if(sel&&!sel.isCollapsed) return; // el clic cerró una selección de texto
    if(pul.length>=MAXP){ f=pul.shift(); k=fuentes.indexOf(f); if(k>=0) fuentes.splice(k,1); }
    f={id:'pulso'+(pid++),pulso:true,x:e.clientX,y:e.clientY,a:0,ad:APUL,s:SPUL*sref(),s0:SPUL*sref(),tf:0};
    fuentes.push(f); pul.push(f); sucio=true;
  },{passive:true});

  // Palabras clave: cada [data-nutriente] visible suelta nutriente cerca de su posición en pantalla; la fuente sigue a la palabra con el scroll
  function palabras(){
    var els=palEls||(palEls=[].slice.call(document.querySelectorAll('[data-nutriente]'))), i, e, r, f, vis, ahora=performance.now();
    if(ahora-tPal<90) return; tPal=ahora; // se mide a lo sumo cada 90 ms (lecturas de layout)
    for(i=0;i<els.length;i++){
      e=els[i]; f=e._kw; if(!f){ f=e._kw={id:'kw'+i,kw:true,x:0,y:0,a:0,ad:0,s:SKW*sref(),visible:false,activa:false}; kws.push(f); }
      r=e.getBoundingClientRect(); vis=r.width>1&&r.height>1&&r.bottom>60&&r.top<H-20&&r.right>0&&r.left<W&&!e.closest('.agentes');
      f.visible=vis; if(vis){ f.x=r.left+r.width/2; f.y=r.top+r.height/2; sucio=true; }
    }
  }

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

  function paso(dt,real){
    var nv=NIVELES[nivel], fs=fuentes, i, c, l, s, a, p=1-Math.exp(-dt/TAU), sd=Math.sqrt(2*DR*dt), bro=Math.sqrt(2*BRO*dt), rel=1-Math.exp(-dt/RELAJA),
        tp, x, y, v, ex, exy, th2, k, cl, q, cap=nv.cap, ns=0, viva, gi, gj, k2, ao, bx, bf;
    tiempo+=dt; cuadro++; real=real==null?dt:real; relojC+=real;
    agit*=Math.exp(-real/AGIT_T); empuje*=Math.exp(-real/AGIT_T); ONDAS[3].a=AGIT_O*agit; // la agitación del scroll decae en ≈ 2 s
    if(cuadro%3===0) palabras();
    if(nv.texto&&performance.now()-tMasc>MASC_MS) mascara();
    cursorPaso(real);
    acum+=dt; if(cuadro%nv.grilla===0){ difundir(acum); acum=0; } // nivel 0: la grilla se actualiza cada 3 cuadros
    for(k=0;k<GN;k++) EPS[k]*=1-dt/50; // la matriz se desvanece sola (≈ 50 s)
    nNadan=0; nSesiles=0;
    for(i=0;i<n;i++){
      tp=T[i]; x=X[i]; y=Y[i]; k=celda(x,y); cl=CA[k]; viva=true;
      if(S[i]){ // ---- adherida: quieta, crece, se divide, deposita matriz o se dispersa ----
        nSesiles++;
        q=QSES*BM[i]*dt*cl/(KM+cl); CA[k]=cl>q?cl-q:0;              // consumo de Monod
        if(nv.eps){ EPS[k]+=dt*.05*(1+.6*Math.min(NB[i],8)); if(EPS[k]>1) EPS[k]=1; } // la matriz se acumula más donde hay más vecinas (el centro)
        if(!(tp===0&&ES[i]===3&&BM[i]>=1.45)) BM[i]+=GROW*GR[i]*dt*cl/(KM+cl);          // crecimiento de Monod, con ritmo individual (los diplococos se quedan en pares)
        if(NB[i]>=2){ ao=Math.atan2(-VY[i],-VX[i]); TH[i]+=dt*.4*Math.sin(2*(ao-TH[i])); } // los bastones y las cadenas se alinean con el radio de la colonia: crecimiento radial
        if(n>=cap-RESERVA){ if(BM[i]>1.69) BM[i]=1.69; }                                  // con la población al tope no hay divisiones (ni constricción a medias)
        else if(BM[i]>=2&&!dividir(i)){ BM[i]=1.55; ev.divFalla=(ev.divFalla||0)+1; }                                          // si no hay lugar, la constricción retrocede y se reintenta más tarde
        if(cl<CDISP) HM[i]+=dt; else { HM[i]-=2*dt; if(HM[i]<0) HM[i]=0; }
        if(HM[i]>THAMBRE){
          if(NB[i]<4&&Math.random()<KDISP*dt){ // dispersión: sale hacia afuera desde el borde de la colonia
            a=Math.atan2(-VY[i],-VX[i]); if(NB[i]===0) a=Math.random()*6.283185307;
            S[i]=0; TH[i]=a+.4*normal(); SP[i]=FRENADA; BM[i]=1; HM[i]=-REFRACTARIA; M[i]=Math.log(campo(x,y)+C0); ev.disp++;
            for(k=0;k<n;k++) if(S[k]&&k!==i&&(X[k]-x)*(X[k]-x)+(Y[k]-y)*(Y[k]-y)<VECINO*VECINO*1.7) HM[k]+=CASCADA; // la dispersión se contagia a las vecinas (señal de colonia)
          }else if(HM[i]>3*THAMBRE&&Math.random()<KMUERTE*dt){ viva=false; ev.hambre++; } // el hambre prolongada mata
        }
      }else{
        nNadan++; if(HM[i]<0) HM[i]+=dt;
        flujo(x,y,tiempo,nv.jeffery&&tp>0);
        q=QNAD*dt*cl/(KM+cl); CA[k]=cl>q?cl-q:0;                      // consumo de Monod (pequeño)
        if(tp===0){ // coco: lo lleva la corriente, más movimiento browniano
          x+=fu*dt+bro*normal(); y+=fv*dt+bro*normal();
        }else{
          c=Math.log(campo(x,y)+C0);
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
        if(cl>CAD&&Math.random()<KADH*dt*(cl-CAD)/(1-CAD)*(.06+1.6*NB[i])*(1-bx)&&NB[i]<9&&HM[i]>=0){ S[i]=1; SP[i]=0; HM[i]=0; BM[i]=1+.4*Math.random(); ev.adh++; }
        else if(cl<.02&&Math.random()<MUERTE_POBRE*dt){ viva=false; ev.pobre++; }   // muerte en medio pobre
        if(x<0||x>W||y<0||y>H){
          if(Math.random()<SALIDA){ viva=false; ev.sal++; }                         // sale por el borde
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
    while(n>cap) quitar(n-1);
    vecinos(nv.choques);
  }

  // Vecindad y choques suaves (un solo recorrido de pares): cuenta las vecinas adheridas de cada célula (para la adhesión y la
  // dispersión) y, si el nivel lo permite, empuja a las que se superponen; las adheridas no se mueven.
  function vecinos(empujar){
    var i, j, dx, dy, d2, md, d, o, k, si, sj, r2=VECINO*VECINO;
    for(i=0;i<n;i++){ NB[i]=0; VX[i]=0; VY[i]=0; }
    for(i=0;i<n-1;i++) for(j=i+1;j<n;j++){
      dx=X[j]-X[i]; dy=Y[j]-Y[i];
      if(dx>VECINO||dx<-VECINO||dy>VECINO||dy<-VECINO) continue;
      d2=dx*dx+dy*dy; si=S[i]; sj=S[j];
      if(d2<r2){ if(sj&&NB[i]<255){ NB[i]++; VX[i]+=dx; VY[i]+=dy; } if(si&&NB[j]<255){ NB[j]++; VX[j]-=dx; VY[j]-=dy; } }
      if(!empujar) continue;
      md=RAD[T[i]]*SZ[i]+RAD[T[j]]*SZ[j]+HUECO; if(d2>=md*md) continue;
      d=Math.sqrt(d2); o=(md-d)*RIGIDEZ; if(d<.02){ dx=1; dy=0; k=o; } else k=o/d;
      if(si&&!sj){ X[j]+=dx*k; Y[j]+=dy*k; } else if(sj&&!si){ X[i]-=dx*k; Y[i]-=dy*k; } else { X[i]-=dx*k*.5; Y[i]-=dy*k*.5; X[j]+=dx*k*.5; Y[j]+=dy*k*.5; }
    }
  }

  function dibujar(){
    var i, k, tp, c, s, a, x, y, sx, f, u, w, e, sesil, sz, pt, Le, g, r, d, nv=NIVELES[nivel], m, ex, ey;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H); ctx.globalAlpha=1;
    ctx.lineCap='round'; ctx.lineJoin='round';
    if(nv.eps){ // matriz (EPS): halos muy tenues sobre las celdas con colonia, que se desvanecen después de la dispersión; más densa donde hay más células
      for(k=0;k<GN;k++){ e=EPS[k]; if(e>.04){ ctx.fillStyle='rgba('+rgb+','+(ALFA_EPS*e*factor).toFixed(3)+')'; ctx.beginPath(); ctx.arc(((k%GX)+.5)*hx,(((k/GX)|0)+.5)*hy,.62*hx,0,6.283185307); ctx.fill(); } }
      ctx.fillStyle='rgba('+rgb+','+(ALFA_HALO*factor).toFixed(3)+')'; // un halo por célula adherida: donde se superponen (el centro) la matriz se ve más densa
      for(i=0;i<n;i++) if(S[i]){ ctx.beginPath(); ctx.arc(X[i],Y[i],6.5*SZ[i],0,6.283185307); ctx.fill(); }
    }
    for(i=0;i<cur.length;i++){ // señal muy sutil: un halo tenue que crece bajo el cursor mientras se forma la fuente y se apaga con ella
      e=cur[i]; w=Math.min(1,e.a/AMAX); if(w<.03) continue;
      ctx.strokeStyle='rgba('+rgb+','+(.2*w*factor).toFixed(3)+')'; ctx.lineWidth=.9; ctx.beginPath(); ctx.arc(e.x,e.y,5+24*w,0,6.283185307); ctx.stroke();
    }
    if(nt){ // trazadores: líneas finísimas, con una cola corta en el sentido contrario a la corriente
      ctx.strokeStyle=traza; ctx.lineWidth=.9; ctx.beginPath();
      for(i=0;i<nt;i++){ flujo(TX[i],TY[i],tiempo,false); ctx.moveTo(TX[i],TY[i]); ctx.lineTo(TX[i]-fu*.5,TY[i]-fv*.5); }
      ctx.stroke();
    }
    for(i=0;i<n;i++){
      tp=T[i]; x=X[i]; y=Y[i]; sesil=S[i]; sz=SZ[i];
      u=sesil&&BM[i]>1.7?(BM[i]-1.7)/.3:0; if(u>1) u=1;                       // avance de la constricción (la célula se alarga y se estrecha al medio)
      if(nv.texto){ m=1-.45*(TXB[celda(x,y)]>1?1:TXB[celda(x,y)]); ctx.globalAlpha=m; } // más tenues bajo el texto
      if(tp===0){
        ctx.fillStyle=sesil?coloresS[0]:colores[0]; r=2.8*sz; ctx.beginPath();
        if(u>0){ d=3.25*u*sz; ex=Math.cos(TH[i])*d; ey=Math.sin(TH[i])*d; ctx.arc(x-ex,y-ey,r,0,6.283185307); ctx.moveTo(x+ex+r,y+ey); ctx.arc(x+ex,y+ey,r,0,6.283185307); } // dos lóbulos que se separan
        else ctx.arc(x,y,r,0,6.283185307);
        ctx.fill(); continue;
      }
      a=TH[i]; c=Math.cos(a)*dpr; s=Math.sin(a)*dpr; ctx.setTransform(c,s,-s,c,x*dpr,y*dpr); f=FI[i];
      if(tp===1){
        ctx.strokeStyle=sesil?coloresS[1]:colores[1]; ctx.lineWidth=3.1*sz; ctx.beginPath();                                                        // bacilo: cápsula de 8 × 3,1 px
        if(u>0){ Le=(4+3.85*u)*sz; g=1.5*u*sz; r=1.55*sz; ctx.moveTo(-(Le-r),0); ctx.lineTo(-g,0); ctx.moveTo(g,0); ctx.lineTo(Le-r,0); }       // constricción: dos lóbulos con cintura
        else{ ctx.moveTo(-2.45*sz,0); ctx.lineTo(2.45*sz,0); }
        ctx.stroke();
        if(!sesil){                                                                                                                                 // flagelo: onda que viaja hacia atrás (detenido y sin dibujar si está adherida)
          ctx.strokeStyle=cola; ctx.lineWidth=.75; ctx.beginPath(); ctx.moveTo(-4*sz,0);
          for(k=1;k<=12;k++){ pt=k*.75; w=-4*sz-pt; ctx.lineTo(w,1.5*(pt/9)*Math.sin(KONDA[1]*w+f)); }
          ctx.stroke();
        }
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

  function cursorEstado(){
    var i, f, Bt=0, Tot=0, bs=[], r;
    for(i=0;i<fuentes.length;i++){ f=fuentes[i]; r=f.s/sref(); if(f.base){ Bt+=f.a0*r*r; Tot+=peso(f); bs.push(+(f.a/f.a0).toFixed(3)); } else if(f.cursor||f.kw||f.pulso) Tot+=peso(f); }
    return {presupuesto:+Bt.toFixed(3),total:+Tot.toFixed(3),fondo:bs,fondoMin:bs.length?Math.min.apply(null,bs):0,activasFondo:bs.length,
            palabras:{total:kws.length,visibles:kws.filter(function(k){ return k.visible; }).length,activas:kws.filter(function(k){ return k.activa; }).length,ad:kws.map(function(k){ return +k.ad.toFixed(2); })},pulsos:pul.map(function(q){ return {x:Math.round(q.x),y:Math.round(q.y),a:+q.a.toFixed(3)}; }),ritmo:+ritmo.toFixed(3),agitacion:+agit.toFixed(3),
            cursores:cur.map(function(c){ return {x:Math.round(c.x),y:Math.round(c.y),a:+c.a.toFixed(3),s:Math.round(c.s),crece:c.crece,rapido:c.rapido,edad:+(relojC-c.t0).toFixed(1)}; })};
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
    estado:function(){ var nv=NIVELES[nivel], co=colonias(), cs=0, k, mn=1, mx=0; for(k=0;k<GN;k++){ cs+=CA[k]; if(CA[k]<mn) mn=CA[k]; if(CA[k]>mx) mx=CA[k]; }
      return {nivel:nivel,celulas:n,nadando:nNadan,adheridas:nSesiles,colonias:co.n,mayorColonia:co.max,coloniasGrandes:co.grandes,nutrienteMedio:+(cs/GN).toFixed(3),nutrienteMax:+mx.toFixed(2),eventos:JSON.parse(JSON.stringify(ev)),cursor:cursorEstado(),trazadores:nt,fps:+st.fps.toFixed(1),trabajoMs:+st.trabajoMs.toFixed(2),fijo:st.fijo,choques:nv.choques,jeffery:nv.jeffery,historial:st.historial.slice()}; },
    posiciones:function(){ var s=Array.prototype.slice; return {x:s.call(X,0,n),y:s.call(Y,0,n),th:s.call(TH,0,n),fi:s.call(FI,0,n),sp:s.call(SP,0,n),tipo:s.call(T,0,n),sesil:s.call(S,0,n),biomasa:s.call(BM,0,n)}; },
    avanzar:function(seg){ var k=Math.round(seg*30); for(var i=0;i<k;i++) paso(1/30); dibujar(); },
    grilla:function(){ return {gx:GX,gy:GY,c:Array.prototype.slice.call(CA)}; },
    flujo:function(x,y,t){ flujo(x,y,t==null?tiempo:t,true); return {u:fu,v:fv,ux:gux,uy:guy,vx:gvx,vorticidad:gvx-guy}; },
    parar:parar
  };

  tScroll=performance.now(); ultScroll.y=window.pageYOffset||0; ultScroll.t=tScroll;
  medir(); colorDeTinta(); huella(); for(var q0=0;q0<GN;q0++) CA[q0]=Math.min(1,SG[q0]*.8); // el nutriente parte repartido cerca de las fuentes
  difundir(2); sembrar(90); fijarNivel(nivelInicial()); dibujar(); arrancar();
})();
