/* empuje.js (053): el C. elegans que cruza el párrafo de presentación de la portada empuja sus líneas.
   Cuando el nematodo del fondo (quimiotaxis.js, Quimiotaxis.silueta()) pasa por el párrafo, las líneas se reacomodan alrededor de su silueta en cada
   cuadro, sin cortar palabras: se usa Pretext (Cheng Lou, MIT; vendor/pretext/) con layoutNextLine() y un ancho distinto para cada tramo de cada línea. Cuando el
   nematodo se va, los bordes del hueco se cierran en ≈ 2 s y el texto vuelve a su lugar.
   El texto real nunca se toca: el <p> conserva su contenido y su diseño (lectores de pantalla, buscadores, selección y copia). Mientras dura el empuje sólo se
   pinta encima una copia decorativa por líneas (aria-hidden, sin selección) y el texto original se hace transparente; al terminar se quita la copia.
   Sólo corre con el fondo vivo (escritorio, puntero fino, ≥ 1024 px) y sin movimiento reducido; si no, el texto queda quieto y esta librería ni se descarga.
   API de prueba: window.Empuje {estado(), medir(), activar(bool), config()}. */
(function(){
  'use strict';
  if(window.Empuje) return;
  var SEL='.hero .lede', BASE=(document.currentScript&&document.currentScript.src)||'', LIB=BASE?BASE.replace(/[^\/]*(\?.*)?$/,'')+'vendor/pretext/pretext.min.js?v=1.0.0':'vendor/pretext/pretext.min.js?v=1.0.0';
  var DESPEJE=14, HUECO=16, HUECO_Y=22, EXTRA=2, EXT_MAX=240, V_ABRE=900, T_ABRE=.06, T_CIERRA=2, SLOT_EM=7, CERCA=90, SOLO_ANCHO=900;   // holgura a cada lado del cuerpo (px), anticipación vertical (la línea se aparta cuando el cuerpo está a menos de HUECO_Y px de ella, para que el hueco ya esté abierto cuando llegue), líneas extra de reserva, espacio máximo a la derecha del párrafo (px), velocidad máxima con que se abre un hueco (px/s) y constantes de tiempo (s) con que se abre (T_ABRE) y se cierra (T_CIERRA = 2: el borde que queda atrás sigue al cuerpo con ≈ 2 s de retraso, y por eso el texto termina de volver ≈ 2 s después de que la cola sale) y SLOT_EM, el ancho mínimo de un tramo en em (más angosto que eso se deja vacío: no quedan palabras sueltas), distancia a la que se despierta, ancho mínimo de ventana
  var P=null, acc=null, dy=0, lib=null, pedida=false, corre=0, activo=false, ov=null, rows=[], bd=[], prep=null, fKey='', txt='', minw=60, colorOrig='', ult=0, apagado=false, forz=false, mqR=null, mqF=null;
  var est={cuadros:0,ms:0,msMax:0,activaciones:0,lineas:0,lineasMax:0,extraMax:0,reacomodos:0,versionLib:'',cargada:false,errores:0,vigila:0,llamadas:0,cambios:0};

  function ancho(){ return window.innerWidth>=SOLO_ANCHO; }
  function permitido(){ return !apagado&&ancho()&&!(mqR&&mqR.matches)&&!(mqF&&mqF.matches); }   // sin movimiento reducido ni colores forzados (con éstos el texto original no se puede poner transparente)
  function cargarLib(){
    if(lib||pedida) return; pedida=true;
    var s=document.createElement('script'); s.src=LIB; s.async=true;
    s.onload=function(){ lib=window.Pretext||null; est.cargada=!!lib; if(lib) est.versionLib='1.0.0'; };
    s.onerror=function(){ est.errores++; pedida=false; apagado=true; };
    document.head.appendChild(s);
  }
  function preparar(cs){ // un solo análisis por texto + fuente (prepare es lo caro; layoutNextLine es aritmética sobre anchos ya medidos)
    var fk=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily+'|'+cs.letterSpacing+'|'+txt, c, m, i, w;
    if(prep&&fk===fKey) return; fKey=fk;
    prep=lib.prepareWithSegments(txt,cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily,{letterSpacing:parseFloat(cs.letterSpacing)||0});
    c=document.createElement('canvas').getContext('2d'); c.font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;   // la palabra más ancha (con su guion si lo lleva): ningún tramo es más angosto, así no se parte una palabra
    m=txt.match(/[^\s-]+-?/g)||[]; w=0; for(i=0;i<m.length;i++){ var t=c.measureText(m[i]).width; if(t>w) w=t; } minw=Math.ceil(w)+4;
  }
  function crearOv(){
    ov=document.createElement('span'); ov.className='emp'; ov.setAttribute('aria-hidden','true'); ov.style.cssText='position:absolute;left:0;top:0;width:100%;height:0;pointer-events:none;user-select:none;-webkit-user-select:none';
  }
  // Cada línea es una fila en el flujo de la copia (alto = interlineado, así el navegador las apila igual que las líneas del párrafo y el texto cae en los mismos píxeles que el original) con hasta dos tramos absolutos
  // (a la izquierda y a la derecha del cuerpo del nematodo).
  function fila(i,LH){ var f=rows[i], k; if(!f){ f=document.createElement('span'); f.style.cssText='display:block;position:relative;white-space:pre'; f.s=[]; f.h=-1; for(k=0;k<2;k++){ var e=document.createElement('span'); e.style.cssText='position:absolute;left:0;top:0;display:none'; e.t=''; e.x=-1; e.v=false; f.s.push(e); f.appendChild(e); } ov.appendChild(f); rows[i]=f; } if(f.h!==LH){ f.style.height=LH+'px'; f.h=LH; } return f; }
  function tramo(f,k,txt0,x){ var e=f.s[k]; if(e.t!==txt0){ e.textContent=txt0; e.t=txt0; est.cambios++; } x=Math.round(x*10)/10; if(e.x!==x){ e.style.left=x+'px'; e.x=x; } if(!e.v){ e.style.display=''; e.v=true; } }
  function activar(){
    var cs=getComputedStyle(P); colorOrig=cs.color; if(!ov) crearOv();
    ov.style.color=colorOrig; P.appendChild(ov); P.classList.add('emp-on'); activo=true; est.activaciones++;
    acc=document.querySelector('.hero .acciones'); dy=0;
  }
  function desactivar(){
    if(!activo) return; activo=false; P.classList.remove('emp-on'); if(ov&&ov.parentNode) ov.parentNode.removeChild(ov);
    if(acc){ acc.style.transform=''; } dy=0;
    var k; for(k=0;k<rows.length;k++){ rows[k].s[0].style.display='none'; rows[k].s[1].style.display='none'; rows[k].s[0].v=rows[k].s[1].v=false; rows[k].s[0].t=rows[k].s[1].t=''; } bd.length=0;
  }
  function caja(s,out){ // la caja que envuelve al cuerpo (con su ancho): [x0, x1, y0, y1]. Los tramos de todas las líneas que toca son los mismos, así el hueco se mueve con el nematodo y no salta con la ondulación
    var i, x0=1e9, x1=-1e9, y0=1e9, y1=-1e9, w;
    for(i=0;i<s.n;i++){ w=s.w[i]; if(s.x[i]-w<x0) x0=s.x[i]-w; if(s.x[i]+w>x1) x1=s.x[i]+w; if(s.y[i]-w<y0) y0=s.y[i]-w; if(s.y[i]+w>y1) y1=s.y[i]+w; }
    out[0]=x0-HUECO; out[1]=x1+HUECO; out[2]=y0-HUECO_Y; out[3]=y1+HUECO_Y;
  }
  function cuadro(now){
    corre=0; est.llamadas++; if(!lib||!P){ if(forz&&P) corre=requestAnimationFrame(cuadro); return; }
    var cb=[0,0,0,0], EXT=0, ms, cp, d1, d2, vm, t0=performance.now(), dt=Math.min(.05,Math.max(.001,(now-(ult||now-16))/1000)), r, cs, LH, n0, nb, s, i, hay=false, abre, cierra, b, a1, a2, cur, k, sl, ns, ln, W, L0, usadas=0, f, ymax=0, seguir=false, extra;
    ult=now;
    if(!permitido()){ desactivar(); return; }
    r=P.getBoundingClientRect(); cs=getComputedStyle(P); LH=parseFloat(cs.lineHeight)||1.5*parseFloat(cs.fontSize);
    n0=Math.max(1,Math.round(r.height/LH)); nb=n0+EXTRA; W=r.width; L0=r.left;   // la altura del párrafo (con su texto real, que no se toca) fija cuántas líneas tiene
    s=(r.bottom>-80&&r.top<window.innerHeight+80)?(window.Quimiotaxis&&Quimiotaxis.silueta&&Quimiotaxis.silueta()):null;
    abre=1-Math.exp(-dt/T_ABRE); cierra=1-Math.exp(-dt/T_CIERRA); if(s) caja(s,cb);
    cp=P.parentElement; if(cp){ EXT=cp.getBoundingClientRect().right-(parseFloat(getComputedStyle(cp).paddingRight)||0)-r.right-6; EXT=Math.max(0,Math.min(EXT_MAX,EXT)); }   // el espacio libre a la derecha del párrafo, dentro de la columna: ahí caben las palabras que el nematodo desplaza
    for(i=0;i<nb;i++){
      b=bd[i]||(bd[i]={A:0,B:0,w:0}); a1=r.top+i*LH;
      if(s&&a1+LH>cb[2]&&a1<cb[3]&&cb[1]>L0&&cb[0]<L0+W+EXT){ hay=true;
        if(b.w<.5){ b.A=b.B=(cb[0]+cb[1])/2; b.w=1; }
        d1=(cb[0]-b.A)*(cb[0]<b.A?abre:cierra); d2=(cb[1]-b.B)*(cb[1]>b.B?abre:cierra); vm=V_ABRE*dt; if(d1<-vm) d1=-vm; if(d2>vm) d2=vm; b.A+=d1; b.B+=d2; b.w=b.B-b.A; b.obj=true;   // el borde que avanza se abre rápido (no toca al nematodo); el que queda atrás se cierra despacio (el texto vuelve suave)
      }else if(b.w>=.5){ a2=(b.A+b.B)/2; b.A+=(a2-b.A)*cierra; b.B+=(a2-b.B)*cierra; b.w=b.B-b.A; b.obj=false; if(b.w<.5) b.w=0; }
      else{ b.w=0; b.obj=false; }
      if(b.w>0&&b.B>L0&&b.A<L0+W+EXT) seguir=true;
    }
    if(!activo){ if(!hay&&!forz){ if(cerca(s,r)) corre=requestAnimationFrame(cuadro); return; } activar(); }
    if(!seguir&&!hay&&!forz){ desactivar(); return; }
    preparar(cs); ms=Math.max(minw,SLOT_EM*(parseFloat(cs.fontSize)||20)); cur={segmentIndex:0,graphemeIndex:0};
    for(i=0;i<nb;i++){
      b=bd[i]; sl=[]; f=fila(i,LH); ns=0;
      if(b.w>=.5&&b.B>L0&&b.A<L0+W+EXT){ a1=Math.max(0,Math.min(W,b.A-L0)); a2=Math.max(0,b.B-L0); if(a1>=ms) sl.push(0,a1); if(W+EXT-a2>=ms) sl.push(a2,W+EXT); }   // a la izquierda y a la derecha del cuerpo; un tramo más angosto que SLOT_EM em (y siempre que la palabra más ancha) no se usa
      else sl.push(0,W);
      for(ns=0;ns<2;ns++){
        if(cur&&ns*2<sl.length){ ln=lib.layoutNextLine(prep,sl[ns*2+1]-sl[ns*2],cur); if(!ln) cur=null; }
        else ln=null;
        if(ln){ tramo(f,ns,ln.text,sl[ns*2]); cur=ln.end; usadas++; if(i*LH+LH>ymax) ymax=i*LH+LH; }
        else if(f.s[ns].v){ f.s[ns].style.display='none'; f.s[ns].v=false; f.s[ns].t=''; }
      }
    }
    extra=Math.max(0,ymax-r.height);
    if(cur) est.excede=(est.excede||0)+1;                                                      // quedó texto sin lugar (no debería: hay EXTRA líneas de reserva)
    k=extra>1?Math.min(DESPEJE,.45*extra):0; if(k!==dy){ dy=k; if(acc) acc.style.transform=k?'translateY('+k+'px)':''; }   // si hace falta una línea más, los botones de abajo bajan unos píxeles (sólo visual: no cambia el flujo de la página) para que el texto no los toque
    est.lineas=usadas; if(usadas>est.lineasMax) est.lineasMax=usadas; if(extra>est.extraMax) est.extraMax=extra;
    est.cuadros++; k=performance.now()-t0; est.ms+=k; if(k>est.msMax) est.msMax=k;
    corre=requestAnimationFrame(cuadro);
  }
  function cerca(s,r){ // ¿la silueta está a menos de CERCA px del párrafo?
    var i, x0=1e9, x1=-1e9, y0=1e9, y1=-1e9;
    if(!s) return false;
    for(i=0;i<s.n;i++){ if(s.x[i]<x0) x0=s.x[i]; if(s.x[i]>x1) x1=s.x[i]; if(s.y[i]<y0) y0=s.y[i]; if(s.y[i]>y1) y1=s.y[i]; }
    return x1>r.left-CERCA&&x0<r.right+CERCA&&y1>r.top-CERCA&&y0<r.bottom+CERCA;
  }
  function precalentar(){ // con el nematodo en camino: el análisis del texto y la copia por líneas ya están listos cuando llegue (así el primer cuadro del empuje no se atrasa)
    var cs; if(!ov) crearOv(); cs=getComputedStyle(P); preparar(cs); fila(0,parseFloat(cs.lineHeight)||31);
  }
  function vigila(){ // cada 250 ms, barato: ¿el nematodo que cruza el párrafo está cerca del párrafo?
    var s, r;
    est.vigila++;
    if(corre||!P||!window.Quimiotaxis||!Quimiotaxis.silueta||!permitido()||document.hidden) return;
    s=Quimiotaxis.silueta(); if(!s||!s.cruza) return;
    cargarLib(); if(!lib) return;
    precalentar();
    r=P.getBoundingClientRect(); if(r.bottom<0||r.top>window.innerHeight) return;
    if(cerca(s,r)){ ult=0; corre=requestAnimationFrame(cuadro); }
  }
  function iniciar(){
    P=document.querySelector(SEL); if(!P||!window.matchMedia) return;
    txt=(P.textContent||'').replace(/\s+/g,' ').trim(); mqR=window.matchMedia('(prefers-reduced-motion: reduce)'); mqF=window.matchMedia('(forced-colors: active)');
    setInterval(vigila,250);
    new MutationObserver(function(){ if(activo){ P.classList.remove('emp-on'); colorOrig=getComputedStyle(P).color; ov.style.color=colorOrig; P.classList.add('emp-on'); } }).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    if(mqR.addEventListener) mqR.addEventListener('change',function(){ if(mqR.matches) desactivar(); });
  }
  window.Empuje={
    estado:function(){ return {activo:activo,corre:!!corre,cargada:est.cargada,lineas:[].concat.apply([],rows.map(function(f,i){ return f.s.filter(function(e){ return e.v; }).map(function(e){ return {t:e.t,x:e.x,fila:i}; }); })),huecos:bd.map(function(b){ return b.w>=.5?{A:+b.A.toFixed(1),B:+b.B.toFixed(1)}:null; }),objetivos:bd.filter(function(b){ return b&&b.obj; }).length,minw:minw,texto:txt,permitido:permitido()}; },
    medir:function(){ return {cuadros:est.cuadros,msMedio:est.cuadros?+(est.ms/est.cuadros).toFixed(3):0,msMax:+est.msMax.toFixed(3),activaciones:est.activaciones,lineasMax:est.lineasMax,extraMax:+est.extraMax.toFixed(1),excede:est.excede||0,errores:est.errores,vigila:est.vigila,llamadas:est.llamadas,cambios:est.cambios,version:est.versionLib}; },
    activar:function(v){ apagado=!v; if(apagado){ if(corre){ cancelAnimationFrame(corre); corre=0; } desactivar(); } return !apagado; },
    config:function(o){ if(o){ if(o.hueco!=null) HUECO=+o.hueco; if(o.cierra!=null) T_CIERRA=+o.cierra; if(o.abre!=null) T_ABRE=+o.abre; } return {hueco:HUECO,abre:T_ABRE,cierra:T_CIERRA,extra:EXTRA,cerca:CERCA}; },
    forzar:function(v){ forz=!!v; if(forz){ cargarLib(); if(!corre) corre=requestAnimationFrame(cuadro); } return forz; },   // pruebas: pinta la copia por líneas aunque no haya nematodo (para comparar con el texto original)
    cargar:cargarLib
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciar); else iniciar();
})();
