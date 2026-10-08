/* Fondo con quimiotaxis bacteriana en un fluido (iteración 024; células visibles y corriente en la 025; células acopladas al
   fluido en la 026). Sólo escritorio: lo carga index.html cuando hay puntero fino, el ancho es de 1024 px o más, no hay movimiento
   reducido ni ahorro de datos. Sin dependencias; no envía nada fuera del navegador.

   Una muestra ambiental de unas 100 células de 5 a 8 px, en tres formas y con tres comportamientos:
     cocos (círculos, 30 %)      casi no nadan: los lleva la corriente, con un poco de movimiento browniano;
     bacilos (cápsulas, 50 %)    «run and tumble» con quimiotaxis, como E. coli, orientados hacia donde nadan y con un flagelo;
     espirilos (ondas, 20 %)     nadan en tirabuzón, más rápido y con giros menos frecuentes.
   Quimiotaxis: la célula percibe el logaritmo de la concentración (Weber-Fechner) y lo compara con su memoria (promedio móvil
   de constante TAU): s = d(ln(c + C0))/dt. Si sube, baja la tasa de giro y los tramos rectos se alargan; si baja, se acorta.

   El fluido y las células son el mismo medio (número de Reynolds bajo: no hay inercia, todo se mueve con el flujo):
   - Corriente: campo de velocidad sin divergencia (función de corriente: tres ondas planas que se desplazan despacio). Arrastra a
     todas las células y a unas partículas trazadoras finas que hacen visible el medio.
   - Propulsión ondulatoria: en espirilos (cuerpo) y bacilos (flagelo) hay una onda que viaja hacia atrás; su fase avanza en
     proporción a la velocidad real de nado (ω = k·v/η), así que la célula avanza porque la onda avanza, y si se frena (tras cada
     giro frena un instante) la onda se frena. El vaivén de la trayectoria del tirabuzón sale de la misma fase.
   - Órbitas de Jeffery: las células alargadas giran con la vorticidad del flujo y se alinean con el corte (θ' = ω/2 + Λ(E_xy cos2θ −
     E_xx sen2θ), Λ ≈ 0,9): la corriente las orienta y no sólo las desplaza.
   Choques suaves: las células no se superponen; se empujan levemente.
   El campo de nutriente es una función aparte (campo): fuentes fijas e invisibles con perfil gaussiano, sin difusión ni consumo.
   Mientras el fondo está activo, <html> lleva la clase .fondo-vivo (el CSS pone un velo bajo cada bloque de texto).

   API (window.Quimiotaxis), pensada para fuentes dinámicas (palabras clave que el usuario pueda mover):
     agregar({id, x, y, a, s})  agrega una fuente (x, y en px de la ventana; a amplitud; s ancho en px)
     mover(id, x, y)            cambia la posición de una fuente (puede llamarse en cada cuadro)
     quitar(id)                 la elimina
     fuentes                    arreglo vivo de fuentes
     usarCampo(fn)              reemplaza la forma de calcular el campo: fn(x, y, fuentes) → concentración ≥ 0
     opacidad(f)                factor sobre la opacidad de cada forma (1 por defecto)
     nivel(k) / estado()        diagnóstico y fijar el nivel de calidad (para medir); posiciones() copia las posiciones;
                                avanzar(seg) simula sin esperar (pruebas y videos); flujo(x, y) lee la corriente
     parar()                    detiene y quita el canvas */
(function(){
  'use strict';
  if(window.Quimiotaxis) return;

  // Niveles de calidad (con ~100 células el costo es bajo, así que se adapta la calidad y no la cantidad): cuadros por
  // segundo, cantidad de células, choques, trazadores y órbitas de Jeffery. El nivel más bajo es el único que reduce la cantidad.
  var NIVELES=[{fps:20,n:60,choques:false,traz:0,jeffery:false},{fps:30,n:100,choques:false,traz:24,jeffery:true},
               {fps:30,n:100,choques:true,traz:40,jeffery:true},{fps:60,n:100,choques:true,traz:40,jeffery:true}];
  // Por tipo: 0 coco, 1 bacilo, 2 espirilo. Velocidad de nado (px/s), giros por segundo, desviación del giro (rad), radio de choque (px)
  var VEL=[0,25,38], LAM=[0,1,.35], GIRO=[0,1.1,.8], RAD=[2.8,3.4,3.6];
  var ALFA=[.30,.42,.34], ALFA_COLA=.26, ALFA_TRAZ=.16; // opacidad de cada forma, del flagelo y de los trazadores (tinta del sitio)
  var PATRON=[0,1,1,2,1,0,1,2,1,0];  // 3 cocos, 5 bacilos y 2 espirilos de cada 10
  var TAU=.9, GAIN=6, C0=.02, DR=.15, BRO=7, HUECO=.6, RIGIDEZ=.45, LMIN=.08, LMAX=5;
  var ETA=.55, KONDA=[0,1.257,.698];  // propulsión: v = η·(ω/k); número de onda (rad/px) del flagelo del bacilo (λ 5 px) y del cuerpo del espirilo (λ 9 px)
  var FRENADA=.2, RELAJA=.35, LAMBDA_J=.9;  // tras un giro la velocidad cae al 20 % y se recupera en ≈ .35 s; Λ de Jeffery
  var NMAX=100, TMAX=40;

  var cv=document.createElement('canvas'), ctx=cv.getContext('2d',{alpha:true});
  if(!ctx) return;
  cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;display:block';
  document.body.insertBefore(cv,document.body.firstChild);
  var raiz=document.documentElement;

  var W=0,H=0,dpr=1;
  var X=new Float32Array(NMAX), Y=new Float32Array(NMAX), TH=new Float32Array(NMAX), M=new Float32Array(NMAX), PH=new Float32Array(NMAX),
      SP=new Float32Array(NMAX), FI=new Float32Array(NMAX), T=new Uint8Array(NMAX);
  var TX=new Float32Array(TMAX), TY=new Float32Array(TMAX), nt=0;
  var n=0, nivel=0, raf=0, ultimo=0, vivo=true, tiempo=0, factor=1, colores=['','',''], cola='', traza='', rgb='0,0,0';
  var fuentes=[], campoFn=campoGauss;
  // fuentes propias: fracción de la ventana (x, y), amplitud y ancho como fracción del alto; hacia los márgenes, para que los
  // agregados se vean sin pasar detrás del texto
  var base=[[.07,.30,1,.13],[.06,.72,.9,.12],[.94,.22,.9,.12],[.93,.62,1,.13],[.50,.93,.7,.12]];

  function normal(){ var u=1-Math.random(), v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185307*v); }

  // El campo de nutriente: función aparte, reemplazable con usarCampo().
  function campoGauss(x,y,fs){
    var c=0, i, f, dx, dy;
    for(i=0;i<fs.length;i++){ f=fs[i]; dx=x-f.x; dy=y-f.y; c+=f.a*Math.exp(-(dx*dx+dy*dy)/(2*f.s*f.s)); }
    return c;
  }

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
    W=window.innerWidth; H=window.innerHeight; dpr=Math.min(window.devicePixelRatio||1,2);
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
    var fr=fuentes.filter(function(f){ return f.base; });
    if(!fr.length) fuentesBase(); else fr.forEach(function(f,i){ f.x=base[i][0]*W; f.y=base[i][1]*H; f.s=base[i][3]*H; });
  }

  function colorDeTinta(){
    // monocromo con la tinta del sitio; cada forma con su opacidad (se recalcula al cambiar de tema)
    var t=getComputedStyle(raiz).getPropertyValue('--ink').trim(), m=/^#([0-9a-f]{6})$/i.exec(t);
    if(m){ var v=parseInt(m[1],16); rgb=((v>>16)&255)+','+((v>>8)&255)+','+(v&255); }
    for(var k=0;k<3;k++) colores[k]='rgba('+rgb+','+Math.min(1,ALFA[k]*factor).toFixed(3)+')';
    cola='rgba('+rgb+','+Math.min(1,ALFA_COLA*factor).toFixed(3)+')'; traza='rgba('+rgb+','+Math.min(1,ALFA_TRAZ*factor).toFixed(3)+')';
  }

  function crecer(hasta){
    for(var i=n;i<hasta;i++){
      T[i]=PATRON[i%PATRON.length]; X[i]=Math.random()*W; Y[i]=Math.random()*H; TH[i]=Math.random()*6.283185307; PH[i]=Math.random()*6.283185307;
      FI[i]=Math.random()*6.283185307; SP[i]=1; M[i]=Math.log(campoFn(X[i],Y[i],fuentes)+C0);
    }
    n=hasta;
  }
  function trazadores(k){ for(var i=nt;i<k;i++){ TX[i]=Math.random()*W; TY[i]=Math.random()*H; } nt=k; }

  function paso(dt){
    var nv=NIVELES[nivel], fs=fuentes, i, c, l, s, a, p=1-Math.exp(-dt/TAU), sd=Math.sqrt(2*DR*dt), bro=Math.sqrt(2*BRO*dt), rel=1-Math.exp(-dt/RELAJA),
        tp, x, y, v, ex, exy, th2;
    tiempo+=dt;
    for(i=0;i<n;i++){
      tp=T[i]; x=X[i]; y=Y[i]; flujo(x,y,tiempo,nv.jeffery&&tp>0);
      if(tp===0){ // coco: lo lleva la corriente, más movimiento browniano
        x+=fu*dt+bro*normal(); y+=fv*dt+bro*normal();
      }else{
        c=Math.log(campoFn(x,y,fs)+C0);
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
      if(x<0){ x=-x; TH[i]=Math.PI-TH[i]; } else if(x>W){ x=2*W-x; TH[i]=Math.PI-TH[i]; }
      if(y<0){ y=-y; TH[i]=-TH[i]; } else if(y>H){ y=2*H-y; TH[i]=-TH[i]; }
      X[i]=x; Y[i]=y;
    }
    for(i=0;i<nt;i++){ // trazadores: sólo la corriente (envuelven por los bordes)
      flujo(TX[i],TY[i],tiempo,false); TX[i]+=fu*dt; TY[i]+=fv*dt;
      if(TX[i]<-10) TX[i]+=W+20; else if(TX[i]>W+10) TX[i]-=W+20; if(TY[i]<-10) TY[i]+=H+20; else if(TY[i]>H+10) TY[i]-=H+20;
    }
    if(nv.choques) choques();
  }

  // Choques suaves: si dos células se superponen (con un huequito), cada una cede la mitad del solape, a rigidez parcial.
  function choques(){
    var i, j, dx, dy, d2, md, d, o, k;
    for(i=0;i<n-1;i++) for(j=i+1;j<n;j++){
      dx=X[j]-X[i]; dy=Y[j]-Y[i]; md=RAD[T[i]]+RAD[T[j]]+HUECO;
      if(dx>md||dx<-md||dy>md||dy<-md) continue;
      d2=dx*dx+dy*dy; if(d2>=md*md) continue;
      d=Math.sqrt(d2); o=(md-d)*.5*RIGIDEZ;
      if(d<.02){ dx=1; dy=0; k=o; } else k=o/d;
      X[i]-=dx*k; Y[i]-=dy*k; X[j]+=dx*k; Y[j]+=dy*k;
    }
  }

  function dibujar(){
    var i, k, tp, c, s, a, x, y, sx, f, u, w;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
    ctx.lineCap='round'; ctx.lineJoin='round';
    if(nt){ // trazadores: líneas finísimas, con una cola corta en el sentido contrario a la corriente
      ctx.strokeStyle=traza; ctx.lineWidth=.9; ctx.beginPath();
      for(i=0;i<nt;i++){ flujo(TX[i],TY[i],tiempo,false); ctx.moveTo(TX[i],TY[i]); ctx.lineTo(TX[i]-fu*.5,TY[i]-fv*.5); }
      ctx.stroke();
    }
    for(i=0;i<n;i++){
      tp=T[i]; x=X[i]; y=Y[i];
      if(tp===0){ ctx.fillStyle=colores[0]; ctx.beginPath(); ctx.arc(x,y,2.8,0,6.283185307); ctx.fill(); continue; }
      a=TH[i]; c=Math.cos(a)*dpr; s=Math.sin(a)*dpr; ctx.setTransform(c,s,-s,c,x*dpr,y*dpr); f=FI[i];
      if(tp===1){
        ctx.strokeStyle=colores[1]; ctx.lineWidth=3.1; ctx.beginPath(); ctx.moveTo(-2.45,0); ctx.lineTo(2.45,0); ctx.stroke();    // bacilo: cápsula de 8 × 3,1 px
        ctx.strokeStyle=cola; ctx.lineWidth=.8; ctx.beginPath(); ctx.moveTo(-4,0);                                                  // flagelo: onda que viaja hacia atrás
        for(k=1;k<=8;k++){ u=k*.75; w=-4-u; ctx.lineTo(w,1.2*(u/6)*Math.sin(KONDA[1]*w+f)); }
        ctx.stroke();
      }else{                                                                                                                         // espirilo: trazo ondulado de 9 px
        ctx.strokeStyle=colores[2]; ctx.lineWidth=1.35; ctx.beginPath();
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
  function fijarNivel(k){ nivel=Math.max(0,Math.min(NIVELES.length-1,k)); var nv=NIVELES[nivel]; if(nv.n>n) crecer(nv.n); else n=nv.n; if(nv.traz>nt) trazadores(nv.traz); else nt=nv.traz; }
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

  window.Quimiotaxis={
    fuentes:fuentes,
    agregar:function(f){ fuentes.push({id:f.id,x:f.x,y:f.y,a:f.a==null?1:f.a,s:f.s||150}); },
    mover:function(id,x,y){ for(var i=0;i<fuentes.length;i++) if(fuentes[i].id===id){ fuentes[i].x=x; fuentes[i].y=y; return; } },
    quitar:function(id){ for(var i=0;i<fuentes.length;i++) if(fuentes[i].id===id){ fuentes.splice(i,1); return; } },
    usarCampo:function(fn){ campoFn=fn||campoGauss; },
    campo:function(x,y){ return campoFn(x,y,fuentes); },
    opacidad:function(f){ factor=f; colorDeTinta(); },
    nivel:function(k){ if(k==null) return nivel; st.fijo=true; fijarNivel(k); st.t0=performance.now(); st.trab=0; st.cuadros=0; return nivel; },
    estado:function(){ var nv=NIVELES[nivel]; return {nivel:nivel,celulas:n,trazadores:nt,fps:+st.fps.toFixed(1),trabajoMs:+st.trabajoMs.toFixed(2),fijo:st.fijo,choques:nv.choques,jeffery:nv.jeffery,historial:st.historial.slice()}; },
    posiciones:function(){ var s=Array.prototype.slice; return {x:s.call(X,0,n),y:s.call(Y,0,n),th:s.call(TH,0,n),fi:s.call(FI,0,n),sp:s.call(SP,0,n),tipo:s.call(T,0,n)}; },
    avanzar:function(seg){ var k=Math.round(seg*30); for(var i=0;i<k;i++) paso(1/30); dibujar(); },
    flujo:function(x,y,t){ flujo(x,y,t==null?tiempo:t,true); return {u:fu,v:fv,ux:gux,uy:guy,vx:gvx,vorticidad:gvx-guy}; },
    parar:parar
  };

  medir(); colorDeTinta(); fijarNivel(nivelInicial()); dibujar(); arrancar();
})();
