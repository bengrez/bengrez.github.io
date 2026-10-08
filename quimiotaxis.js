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
  var NIVELES=[{fps:20,cap:60,choques:false,traz:0,jeffery:false,eps:false,grilla:3},{fps:30,cap:120,choques:false,traz:24,jeffery:true,eps:true,grilla:1},
               {fps:30,cap:140,choques:true,traz:40,jeffery:true,eps:true,grilla:1},{fps:60,cap:160,choques:true,traz:40,jeffery:true,eps:true,grilla:1}];
  // Por tipo: 0 coco, 1 bacilo, 2 espirilo. Velocidad de nado (px/s), giros por segundo, desviación del giro (rad), radio de choque (px)
  var VEL=[0,25,38], LAM=[0,1,.35], GIRO=[0,1.1,.8], RAD=[2.8,3.4,3.6];
  var ALFA=[.30,.42,.34], ALFA_COLA=.26, ALFA_TRAZ=.16, ALFA_SES=1.18, ALFA_EPS=.05; // opacidades (tinta del sitio); las adheridas, algo más; la matriz, muy tenue
  var PATRON=[0,1,1,2,1,0,1,2,1,0];  // 3 cocos, 5 bacilos y 2 espirilos de cada 10
  var TAU=.9, GAIN=6, C0=.02, DR=.15, BRO=7, HUECO=.6, RIGIDEZ=.45, LMIN=.08, LMAX=5;
  var ETA=.55, KONDA=[0,1.257,.698];  // propulsión: v = η·(ω/k); número de onda (rad/px) del flagelo del bacilo (λ 5 px) y del cuerpo del espirilo (λ 9 px)
  var FRENADA=.2, RELAJA=.35, LAMBDA_J=.9;  // tras un giro la velocidad cae al 20 % y se recupera en ≈ .35 s; Λ de Jeffery
  // Nutriente (c en [0, 1], por celda de la grilla): difusión (px²/s), reposición de las fuentes (1/s), constante de Monod, consumo por célula (1/s)
  var GX=64, GY=40, DIF=380, REPO=.2, DEC=.05, KM=.2, QNAD=.004, QSES=.28;
  // Ciclo de vida: adhesión (umbral de c, tasa 1/s), crecimiento (1/s de biomasa a c saturante), dispersión (umbral de c, segundos de hambre, tasa 1/s), muerte
  var CAD=.5, KADH=.25, GROW=1/15, CDISP=.17, THAMBRE=6, KDISP=1.2, KMUERTE=.012, CASCADA=4, VECINO=13;
  var SALIDA=.2, MUERTE_POBRE=.004, INMIG=.7, NSWIM=40;  // prob. de salir por un borde, muerte en medio pobre (1/s), entrada de nadadoras (1/s), nadadoras que se mantienen
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
      NB=new Uint8Array(NMAX), VX=new Float32Array(NMAX), VY=new Float32Array(NMAX);
  var TX=new Float32Array(TMAX), TY=new Float32Array(TMAX), nt=0;
  var CA=new Float32Array(GN), CB=new Float32Array(GN), SG=new Float32Array(GN), EPS=new Float32Array(GN), sucio=true, acum=0, cuadro=0;
  var n=0, nivel=0, raf=0, ultimo=0, vivo=true, tiempo=0, factor=1, colores=['','',''], coloresS=['','',''], cola='', traza='', rgb='0,0,0';
  var ev={adh:0,div:0,disp:0,hambre:0,pobre:0,sal:0,ent:0}, fuentes=[], campoFn=null, usuario=false, nNadan=0, nSesiles=0;
  // fuentes propias: fracción de la ventana (x, y), amplitud y ancho como fracción del alto; hacia los márgenes, para que las
  // colonias se vean sin pasar detrás del texto
  var base=[[.07,.30,1,.13],[.06,.72,.9,.12],[.94,.22,.9,.12],[.93,.62,1,.13],[.50,.93,.7,.12]];

  function normal(){ var u=1-Math.random(), v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185307*v); }

  // ---- El campo de nutriente: grilla gruesa con difusión, fuentes y consumo ----
  function huella(){ // perfil de las fuentes sobre la grilla (se recalcula cuando cambian las fuentes)
    var i, j, k, f, dx, dy, g, s;
    for(j=0;j<GY;j++) for(i=0;i<GX;i++){
      s=0;
      for(k=0;k<fuentes.length;k++){ f=fuentes[k]; dx=(i+.5)*hx-f.x; dy=(j+.5)*hy-f.y; s+=f.a*Math.exp(-(dx*dx+dy*dy)/(2*f.s*f.s)); }
      SG[j*GX+i]=s>1.5?1.5:s;
    }
    sucio=false;
  }
  function difundir(dt){
    var m=Math.max(1,Math.ceil(dt*DIF*(2/(hx*hx)+2/(hy*hy))/.8)), h=dt/m, ax=DIF*h/(hx*hx), ay=DIF*h/(hy*hy), r=REPO*h, de=DEC*h, s, i, j, k, a, c, t, u;
    if(sucio) huella();
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
  var ONDAS=[[620,.35,9,70],[430,1.75,7,45],[820,2.8,5,100]].map(function(o,i){ var k=6.283185307/o[0]; return {kx:k*Math.cos(o[1]),ky:k*Math.sin(o[1]),k:k,a:o[2],w:6.283185307/o[3],f:i*2.1}; });
  var fu=0, fv=0, gux=0, guy=0, gvx=0;
  function flujo(x,y,t,grad){
    var i, o, c, s, p, q; fu=0; fv=0; gux=0; guy=0; gvx=0;
    for(i=0;i<ONDAS.length;i++){
      o=ONDAS[i]; p=o.kx*x+o.ky*y+o.f+o.w*t; c=o.a*Math.cos(p); q=o.ky/o.k; fu+=c*q; fv-=c*o.kx/o.k;
      if(grad){ s=o.a*Math.sin(p); gux-=s*q*o.kx; guy-=s*q*o.ky; gvx+=s*(o.kx/o.k)*o.kx; }
    }
  }

  function fuentesBase(){
    base.forEach(function(b,i){ fuentes.push({id:'base'+i,base:true,x:b[0]*W,y:b[1]*H,a:b[2],s:b[3]*H}); });
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
    M[i]=Math.log(campo(x,y)+C0); return i;
  }
  function quitar(i){ // saca la célula i copiando la última en su lugar
    var u=--n; if(i===u) return;
    X[i]=X[u]; Y[i]=Y[u]; TH[i]=TH[u]; M[i]=M[u]; PH[i]=PH[u]; SP[i]=SP[u]; FI[i]=FI[u]; BM[i]=BM[u]; HM[i]=HM[u]; T[i]=T[u]; S[i]=S[u]; NB[i]=NB[u]; VX[i]=VX[u]; VY[i]=VY[u];
  }
  function entrante(){ // una nadadora entra por un borde, hacia adentro
    var lado=(Math.random()*4)|0, x, y, th;
    if(lado===0){ x=1; y=Math.random()*H; th=0; } else if(lado===1){ x=W-1; y=Math.random()*H; th=Math.PI; } else if(lado===2){ x=Math.random()*W; y=1; th=Math.PI/2; } else { x=Math.random()*W; y=H-1; th=-Math.PI/2; }
    nueva(x,y,th+.7*normal(),PATRON[(Math.random()*PATRON.length)|0]);
  }
  function sembrar(k){ for(var i=0;i<k;i++) nueva(Math.random()*W,Math.random()*H,Math.random()*6.283185307,PATRON[i%PATRON.length]); }
  function trazadores(k){ for(var i=nt;i<k;i++){ TX[i]=Math.random()*W; TY[i]=Math.random()*H; } nt=k; }

  function dividir(i){ // la hija queda al lado, sin superponerse; los bacilos y espirilos tienden a dividirse a lo largo de su eje
    var k, a, d, x, y, j, ok, tp=T[i], md=2*RAD[tp]+HUECO+.3, dx, dy, m;
    for(k=0;k<7;k++){
      a=(tp>0&&k<3?TH[i]+(Math.random()<.5?0:Math.PI):Math.random()*6.283185307)+.25*normal();
      x=X[i]+Math.cos(a)*md; y=Y[i]+Math.sin(a)*md; ok=x>RAD[tp]&&x<W-RAD[tp]&&y>RAD[tp]&&y<H-RAD[tp];
      for(j=0;j<n&&ok;j++){ if(j===i) continue; dx=X[j]-x; dy=Y[j]-y; m=RAD[tp]+RAD[T[j]]+.2; if(dx*dx+dy*dy<m*m) ok=false; }
      if(ok){ j=nueva(x,y,TH[i]+.15*normal(),tp); S[j]=1; SP[j]=0; FI[j]=FI[i]; BM[i]=1; BM[j]=1+.15*Math.random(); return true; }
    }
    return false;
  }

  function paso(dt){
    var nv=NIVELES[nivel], fs=fuentes, i, c, l, s, a, p=1-Math.exp(-dt/TAU), sd=Math.sqrt(2*DR*dt), bro=Math.sqrt(2*BRO*dt), rel=1-Math.exp(-dt/RELAJA),
        tp, x, y, v, ex, exy, th2, k, cl, q, cap=nv.cap, ns=0, viva;
    tiempo+=dt; cuadro++;
    acum+=dt; if(cuadro%nv.grilla===0){ difundir(acum); acum=0; } // nivel 0: la grilla se actualiza cada 3 cuadros
    for(k=0;k<GN;k++) EPS[k]*=1-dt/50; // la matriz se desvanece sola (≈ 50 s)
    nNadan=0; nSesiles=0;
    for(i=0;i<n;i++){
      tp=T[i]; x=X[i]; y=Y[i]; k=celda(x,y); cl=CA[k]; viva=true;
      if(S[i]){ // ---- adherida: quieta, crece, se divide, deposita matriz o se dispersa ----
        nSesiles++;
        q=QSES*BM[i]*dt*cl/(KM+cl); CA[k]=cl>q?cl-q:0;              // consumo de Monod
        if(nv.eps){ EPS[k]+=dt*.12; if(EPS[k]>1) EPS[k]=1; }
        BM[i]+=GROW*dt*cl/(KM+cl);                                    // crecimiento de Monod
        if(BM[i]>=2&&n<cap-RESERVA&&dividir(i)) ev.div++;
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
        // adhesión: en una zona rica, más probable junto a células ya adheridas
        if(cl>CAD&&Math.random()<KADH*dt*(cl-CAD)/(1-CAD)*(.06+1.6*NB[i])&&NB[i]<9&&HM[i]>=0){ S[i]=1; SP[i]=0; HM[i]=0; BM[i]=1+.4*Math.random(); ev.adh++; }
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
      if(!empujar||(si&&sj)) continue;
      md=RAD[T[i]]+RAD[T[j]]+HUECO; if(d2>=md*md) continue;
      d=Math.sqrt(d2); o=(md-d)*RIGIDEZ; if(d<.02){ dx=1; dy=0; k=o; } else k=o/d;
      if(si){ X[j]+=dx*k; Y[j]+=dy*k; } else if(sj){ X[i]-=dx*k; Y[i]-=dy*k; } else { X[i]-=dx*k*.5; Y[i]-=dy*k*.5; X[j]+=dx*k*.5; Y[j]+=dy*k*.5; }
    }
  }

  function dibujar(){
    var i, k, tp, c, s, a, x, y, sx, f, u, w, e, sesil;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
    ctx.lineCap='round'; ctx.lineJoin='round';
    if(NIVELES[nivel].eps){ // matriz (EPS): halos muy tenues sobre las celdas con colonia, que se desvanecen después de la dispersión
      for(k=0;k<GN;k++){ e=EPS[k]; if(e>.04){ ctx.fillStyle='rgba('+rgb+','+(ALFA_EPS*e*factor).toFixed(3)+')'; ctx.beginPath(); ctx.arc(((k%GX)+.5)*hx,(((k/GX)|0)+.5)*hy,.62*hx,0,6.283185307); ctx.fill(); } }
    }
    if(nt){ // trazadores: líneas finísimas, con una cola corta en el sentido contrario a la corriente
      ctx.strokeStyle=traza; ctx.lineWidth=.9; ctx.beginPath();
      for(i=0;i<nt;i++){ flujo(TX[i],TY[i],tiempo,false); ctx.moveTo(TX[i],TY[i]); ctx.lineTo(TX[i]-fu*.5,TY[i]-fv*.5); }
      ctx.stroke();
    }
    for(i=0;i<n;i++){
      tp=T[i]; x=X[i]; y=Y[i]; sesil=S[i];
      if(tp===0){ ctx.fillStyle=sesil?coloresS[0]:colores[0]; ctx.beginPath(); ctx.arc(x,y,2.8,0,6.283185307); ctx.fill(); continue; }
      a=TH[i]; c=Math.cos(a)*dpr; s=Math.sin(a)*dpr; ctx.setTransform(c,s,-s,c,x*dpr,y*dpr); f=FI[i];
      if(tp===1){
        ctx.strokeStyle=sesil?coloresS[1]:colores[1]; ctx.lineWidth=3.1; ctx.beginPath(); ctx.moveTo(-2.45,0); ctx.lineTo(2.45,0); ctx.stroke();    // bacilo: cápsula de 8 × 3,1 px
        if(!sesil){                                                                                                                              // flagelo: onda que viaja hacia atrás (detenido si está adherida)
          ctx.strokeStyle=cola; ctx.lineWidth=.8; ctx.beginPath(); ctx.moveTo(-4,0);
          for(k=1;k<=8;k++){ u=k*.75; w=-4-u; ctx.lineTo(w,1.2*(u/6)*Math.sin(KONDA[1]*w+f)); }
          ctx.stroke();
        }
      }else{                                                                                                                                      // espirilo: trazo ondulado de 9 px
        ctx.strokeStyle=sesil?coloresS[2]:colores[2]; ctx.lineWidth=1.35; ctx.beginPath();
        for(k=0;k<=12;k++){ sx=-4.5+k*.75; if(k) ctx.lineTo(sx,1.5*Math.sin(KONDA[2]*sx+f)); else ctx.moveTo(sx,1.5*Math.sin(KONDA[2]*sx+f)); }
        ctx.stroke();
      }
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
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
      if(st.trabajoMs>.6*interv||st.fps<.7*meta){ if(nivel===0){ parar(); return; } fijarNivel(nivel-1); st.techo=nivel; st.estables=0; } // al bajar, ese nivel pasa a ser el techo (sin vaivén)
      else if(st.trabajoMs<.25*interv&&st.fps>=.85*meta&&nivel<st.techo&&st.estables<3){ fijarNivel(nivel+1); st.estables=0; }
      else { st.estables++; if(st.estables>=2) st.ventana=4000; }
    }
    st.t0=ahora; st.trab=0; st.cuadros=0;
  }

  function bucle(t){
    raf=requestAnimationFrame(bucle);
    if(t-ultimo<1000/NIVELES[nivel].fps-2) return;
    var dt=Math.min(.05,(t-ultimo)/1000), a; ultimo=t;
    a=performance.now(); paso(dt); dibujar(); st.trab+=performance.now()-a; st.cuadros++;
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
      return {nivel:nivel,celulas:n,nadando:nNadan,adheridas:nSesiles,colonias:co.n,mayorColonia:co.max,coloniasGrandes:co.grandes,nutrienteMedio:+(cs/GN).toFixed(3),nutrienteMax:+mx.toFixed(2),eventos:JSON.parse(JSON.stringify(ev)),trazadores:nt,fps:+st.fps.toFixed(1),trabajoMs:+st.trabajoMs.toFixed(2),fijo:st.fijo,choques:nv.choques,jeffery:nv.jeffery,historial:st.historial.slice()}; },
    posiciones:function(){ var s=Array.prototype.slice; return {x:s.call(X,0,n),y:s.call(Y,0,n),th:s.call(TH,0,n),fi:s.call(FI,0,n),sp:s.call(SP,0,n),tipo:s.call(T,0,n),sesil:s.call(S,0,n),biomasa:s.call(BM,0,n)}; },
    avanzar:function(seg){ var k=Math.round(seg*30); for(var i=0;i<k;i++) paso(1/30); dibujar(); },
    grilla:function(){ return {gx:GX,gy:GY,c:Array.prototype.slice.call(CA)}; },
    flujo:function(x,y,t){ flujo(x,y,t==null?tiempo:t,true); return {u:fu,v:fv,ux:gux,uy:guy,vx:gvx,vorticidad:gvx-guy}; },
    parar:parar
  };

  medir(); colorDeTinta(); huella(); for(var q0=0;q0<GN;q0++) CA[q0]=Math.min(1,SG[q0]*.8); // el nutriente parte repartido cerca de las fuentes
  difundir(2); sembrar(90); fijarNivel(nivelInicial()); dibujar(); arrancar();
})();
