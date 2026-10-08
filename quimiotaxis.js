/* Fondo con quimiotaxis bacteriana (iteración 024). Sólo escritorio: lo carga index.html cuando hay puntero fino, el ancho
   es de 1024 px o más, no hay movimiento reducido ni ahorro de datos. Sin dependencias; no envía nada fuera del navegador.

   Modelo («run and tumble», como E. coli): cada célula nada recto a velocidad V y, a una tasa que depende de cómo cambia
   lo que percibe, gira a una dirección nueva al azar. Percibe el logaritmo de la concentración (ley de Weber-Fechner) y lo
   compara con su propia memoria (un promedio móvil de constante TAU): s = d(ln(c + C0))/dt. Si la concentración sube
   (s > 0) la tasa de giro baja, así que los tramos rectos se alargan; si baja, se acorta. Más un poco de ruido de rotación.
   El campo de nutriente es una función aparte (campo): hoy, fuentes fijas con perfil gaussiano, sin difusión ni consumo.

   API (window.Quimiotaxis), pensada para fuentes dinámicas (palabras clave que el usuario pueda mover):
     agregar({id, x, y, a, s})  agrega una fuente (x, y en px de la ventana; a amplitud; s ancho en px)
     mover(id, x, y)            cambia la posición de una fuente (puede llamarse en cada cuadro)
     quitar(id)                 la elimina
     fuentes                    arreglo vivo de fuentes
     opacidad(a)                opacidad de los puntos (por defecto .14; sólo para ajustar o demostrar)
     usarCampo(fn)              reemplaza la forma de calcular el campo: fn(x, y, fuentes) → concentración ≥ 0
     nivel(n) / estado()        diagnóstico y fijar el nivel de células (para medir); posiciones() copia las posiciones
     parar()                    detiene y quita el canvas */
(function(){
  'use strict';
  if(window.Quimiotaxis) return;

  var NIVELES=[200,500,1200,2400];   // células por nivel
  var FPS=30;                        // tope de cuadros por segundo
  var V=38, LAMBDA0=1, TAU=.9, GAIN=5, C0=.02, DR=.15, GIRO=1.1; // px/s, giros/s, s, —, —, rad²/s, rad
  var LMIN=.08*LAMBDA0, LMAX=5*LAMBDA0, DOT=1.6;

  var cv=document.createElement('canvas'), ctx=cv.getContext('2d',{alpha:true});
  if(!ctx) return;
  cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;display:block';
  document.body.insertBefore(cv,document.body.firstChild);

  var W=0,H=0,dpr=1;
  var N=NIVELES[NIVELES.length-1];
  var X=new Float32Array(N), Y=new Float32Array(N), TH=new Float32Array(N), M=new Float32Array(N);
  var n=0, nivel=0, raf=0, ultimo=0, vivo=true, color='rgba(0,0,0,.12)', alfa=.14; // alfa: opacidad de los puntos
  var fuentes=[], campoFn=campoGauss, base=[[.14,.28,1,.17],[.52,.12,.8,.14],[.86,.42,1,.16],[.30,.82,.9,.16],[.72,.80,.8,.15]];

  function normal(){ var u=1-Math.random(), v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185307*v); }

  // El campo de nutriente: función aparte, reemplazable con usarCampo().
  function campoGauss(x,y,fs){
    var c=0, i, f, dx, dy;
    for(i=0;i<fs.length;i++){ f=fs[i]; dx=x-f.x; dy=y-f.y; c+=f.a*Math.exp(-(dx*dx+dy*dy)/(2*f.s*f.s)); }
    return c;
  }

  function fuentesBase(){
    // las fuentes propias se reparten por fracciones de la ventana; las agregadas desde afuera (sin base) no se tocan
    base.forEach(function(b,i){ fuentes.push({id:'base'+i,base:true,x:b[0]*W,y:b[1]*H,a:b[2],s:b[3]*H}); });
  }

  function medir(){
    W=window.innerWidth; H=window.innerHeight; dpr=Math.min(window.devicePixelRatio||1,2);
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
    var fr=fuentes.filter(function(f){ return f.base; });
    if(!fr.length) fuentesBase(); else fr.forEach(function(f,i){ f.x=base[i][0]*W; f.y=base[i][1]*H; f.s=base[i][3]*H; });
  }

  function colorDeTinta(){
    // tono apenas distinto del fondo: la tinta del sitio, casi transparente (se recalcula al cambiar de tema)
    var t=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(), m=/^#([0-9a-f]{6})$/i.exec(t), a=alfa;
    if(m){ var v=parseInt(m[1],16); color='rgba('+((v>>16)&255)+','+((v>>8)&255)+','+(v&255)+','+a+')'; }
  }

  function crecer(hasta){
    for(var i=n;i<hasta;i++){ X[i]=Math.random()*W; Y[i]=Math.random()*H; TH[i]=Math.random()*6.283185307; M[i]=Math.log(campoFn(X[i],Y[i],fuentes)+C0); }
    n=hasta;
  }

  function paso(dt){
    var fs=fuentes, i, c, l, s, a, p=1-Math.exp(-dt/TAU), sd=Math.sqrt(2*DR*dt), d=V*dt;
    for(i=0;i<n;i++){
      c=Math.log(campoFn(X[i],Y[i],fs)+C0);
      s=(c-M[i])/TAU;                      // d(ln c)/dt según la memoria de la célula
      M[i]+=(c-M[i])*p;
      l=LAMBDA0*Math.exp(-GAIN*s); l=l<LMIN?LMIN:l>LMAX?LMAX:l;
      a=TH[i]+sd*normal();                 // ruido de rotación
      if(Math.random()<l*dt) a+=GIRO*normal(); // giro («tumble»)
      TH[i]=a;
      X[i]+=Math.cos(a)*d; Y[i]+=Math.sin(a)*d;
      if(X[i]<0){ X[i]=-X[i]; TH[i]=Math.PI-TH[i]; } else if(X[i]>W){ X[i]=2*W-X[i]; TH[i]=Math.PI-TH[i]; }
      if(Y[i]<0){ Y[i]=-Y[i]; TH[i]=-TH[i]; } else if(Y[i]>H){ Y[i]=2*H-Y[i]; TH[i]=-TH[i]; }
    }
  }

  function dibujar(){
    ctx.clearRect(0,0,W,H); ctx.fillStyle=color; ctx.beginPath();
    for(var i=0;i<n;i++) ctx.rect(X[i]-DOT/2,Y[i]-DOT/2,DOT,DOT);
    ctx.fill();
  }

  // Rendimiento adaptativo: nivel de partida por núcleos y memoria; cada ~2 s se mide el trabajo por cuadro y los cuadros por
  // segundo y se sube o baja de nivel; si ni el nivel más bajo alcanza, se detiene. Pausa con la pestaña oculta.
  var st={t0:0,trab:0,cuadros:0,ventana:2000,estables:0,trabajoMs:0,fps:0,fijo:false,historial:[]};
  function nivelInicial(){
    var c=navigator.hardwareConcurrency||4, m=navigator.deviceMemory, pts=c;
    if(m) pts=Math.min(pts,m*2);
    return pts<=2?0:pts<=8?1:2; // arranca con prudencia: la medición sube después
  }
  function fijarNivel(k){ nivel=Math.max(0,Math.min(NIVELES.length-1,k)); if(NIVELES[nivel]>n) crecer(NIVELES[nivel]); else n=NIVELES[nivel]; }
  function evaluar(ahora){
    var seg=(ahora-st.t0)/1000; st.fps=st.cuadros/seg; st.trabajoMs=st.trab/Math.max(1,st.cuadros);
    st.historial.push({nivel:nivel,celulas:n,fps:+st.fps.toFixed(1),trabajoMs:+st.trabajoMs.toFixed(2)});
    if(!st.fijo){
      if(st.trabajoMs>9||st.fps<.7*FPS){ if(nivel===0){ parar(); return; } fijarNivel(nivel-1); st.estables=0; }
      else if(st.trabajoMs<3.5&&st.fps>=.85*FPS&&nivel<NIVELES.length-1&&st.estables<3){ fijarNivel(nivel+1); st.estables=0; }
      else { st.estables++; if(st.estables>=2) st.ventana=4000; }
    }
    st.t0=ahora; st.trab=0; st.cuadros=0;
  }

  function bucle(t){
    raf=requestAnimationFrame(bucle);
    if(t-ultimo<1000/FPS-2) return;
    var dt=Math.min(.05,(t-ultimo)/1000); ultimo=t;
    var a=performance.now(); paso(dt); dibujar(); st.trab+=performance.now()-a; st.cuadros++;
    if(t-st.t0>=st.ventana) evaluar(t);
  }
  function arrancar(){ if(raf||!vivo||document.hidden) return; ultimo=performance.now(); st.t0=ultimo; st.trab=0; st.cuadros=0; raf=requestAnimationFrame(bucle); }
  function pausar(){ if(raf){ cancelAnimationFrame(raf); raf=0; } }
  function parar(){ vivo=false; pausar(); if(cv.parentNode) cv.parentNode.removeChild(cv); }

  document.addEventListener('visibilitychange',function(){ if(document.hidden) pausar(); else arrancar(); });
  window.addEventListener('resize',function(){
    if(window.innerWidth<1024){ pausar(); cv.style.display='none'; return; }
    cv.style.display='block'; medir(); for(var i=0;i<n;i++){ if(X[i]>W) X[i]=Math.random()*W; if(Y[i]>H) Y[i]=Math.random()*H; } arrancar();
  });
  new MutationObserver(colorDeTinta).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  if(window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',colorDeTinta);

  var api=window.Quimiotaxis={
    fuentes:fuentes,
    agregar:function(f){ fuentes.push({id:f.id,x:f.x,y:f.y,a:f.a==null?1:f.a,s:f.s||150}); },
    mover:function(id,x,y){ for(var i=0;i<fuentes.length;i++) if(fuentes[i].id===id){ fuentes[i].x=x; fuentes[i].y=y; return; } },
    quitar:function(id){ for(var i=0;i<fuentes.length;i++) if(fuentes[i].id===id){ fuentes.splice(i,1); return; } },
    opacidad:function(a){ alfa=a; colorDeTinta(); },
    usarCampo:function(fn){ campoFn=fn||campoGauss; },
    campo:function(x,y){ return campoFn(x,y,fuentes); },
    nivel:function(k){ if(k==null) return nivel; st.fijo=true; fijarNivel(k); st.t0=performance.now(); st.trab=0; st.cuadros=0; return nivel; },
    estado:function(){ return {nivel:nivel,celulas:n,fps:+st.fps.toFixed(1),trabajoMs:+st.trabajoMs.toFixed(2),fijo:st.fijo,historial:st.historial.slice()}; },
    posiciones:function(){ return {x:Array.prototype.slice.call(X,0,n),y:Array.prototype.slice.call(Y,0,n)}; },
    parar:parar
  };

  medir(); colorDeTinta(); fijarNivel(nivelInicial()); dibujar(); arrancar();
})();
