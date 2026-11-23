/* empuje.js (063) — el nematodo se entierra en el párrafo de la portada y aparta las palabras de su cuerpo.

   Reemplaza al empuje de la 053, que rehacía el párrafo entero con Pretext y lo dejaba partido en dos columnas alrededor del nematodo
   (Benjamin, 2026-11-23: que el nematodo mueva el texto es intencional; lo que cambia es la forma). Ahora no hay reflujo: cada palabra del
   párrafo es una caja (<span class="pal">) que se desplaza con transform, como una partícula de suelo, y vuelve sola a su lugar.

   - quimiotaxis.js lleva al nematodo hasta el párrafo: entra por un costado, se entierra unos segundos hurgando y sale por donde entró.
     Su silueta (puntos del eje con su semiancho, en píxeles de la ventana) se lee con Quimiotaxis.silueta().
   - Campo de desplazamiento: cada palabra se aleja del cuerpo, casi sólo en vertical (así las de una misma línea no se montan entre sí),
     una distancia u = U · e^(−d/LAM), con d la distancia
     de la caja de la palabra al eje. U cubre el semiancho del cuerpo más una holgura, de modo que ninguna palabra queda debajo; como
     U/LAM < 1 el orden de las líneas se conserva (se aprietan, no se cruzan): junto al cuerpo el interlineado baja a ≈ 70 %.
   - Cada palabra gira además unos grados (fijos por palabra, proporcionales a su desplazamiento) y sigue a su destino con una respuesta de
     TAU s, así que entra y sale suave. Cuando el nematodo se va, todas vuelven a cero y se quitan las transformaciones.
   - El texto no cambia: mismas palabras, mismos espacios, mismo orden; se puede seleccionar y lo leen igual los lectores de pantalla.
   - Con prefers-reduced-motion no hace nada (y quimiotaxis.js tampoco se carga): el texto queda quieto. */
(function(){
  'use strict';
  var Q=window.Quimiotaxis, p=document.querySelector('.hero .lede');
  if(!Q||!Q.silueta||!p) return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var HOLG=9, LAM=88, TAU=.16, GIRO=.002, CERCA=70;   // holgura sobre el semiancho (px), alcance del campo (px), respuesta (s), giro (rad por px), margen para activarse (px)
  var pal=[], N=0, cx, cy, hw, hh, ox, oy, og, az, sg, listo=false, activo=false, raf=0, ult=0;

  function partir(){ // cada palabra en un <span class="pal">; el texto y los espacios quedan igual
    var w=document.createTreeWalker(p,NodeFilter.SHOW_TEXT,null), nodos=[], n, k;
    while((n=w.nextNode())) if(n.nodeValue.trim()) nodos.push(n);
    nodos.forEach(function(nodo){
      var f=document.createDocumentFragment();
      nodo.nodeValue.split(/(\s+)/).forEach(function(t){
        if(!t) return;
        if(/^\s+$/.test(t)){ f.appendChild(document.createTextNode(t)); return; }
        var s=document.createElement('span'); s.className='pal'; s.textContent=t; f.appendChild(s); pal.push(s);
      });
      nodo.parentNode.replaceChild(f,nodo);
    });
    N=pal.length; cx=new Float32Array(N); cy=new Float32Array(N); hw=new Float32Array(N); hh=new Float32Array(N);
    ox=new Float32Array(N); oy=new Float32Array(N); og=new Float32Array(N); az=new Float32Array(N); sg=new Int8Array(N);
    for(k=0;k<N;k++) az[k]=((k*7919)%13)/6-1;   // un giro propio por palabra, entre −1 y 1, siempre el mismo
    listo=true;
  }
  function medir(){ // el lugar de cada palabra en reposo, relativo al párrafo
    var r, k, q;
    for(k=0;k<N;k++) pal[k].style.transform='';
    r=p.getBoundingClientRect();
    for(k=0;k<N;k++){ q=pal[k].getBoundingClientRect(); cx[k]=q.left+q.width/2-r.left; cy[k]=q.top+q.height/2-r.top; hw[k]=q.width/2; hh[k]=q.height/2; }
  }
  function soltar(){ var k; for(k=0;k<N;k++){ pal[k].style.transform=''; ox[k]=oy[k]=og[k]=0; } p.classList.remove('emp-on'); activo=false; }

  function cuadro(t){
    var s=Q.silueta(), r=p.getBoundingClientRect(), dt=Math.min(.05,Math.max(.001,(t-ult)/1000)), a=1-Math.exp(-dt/TAU);
    var dentro=false, n=0, X, Y, Wd, j, k, px, py, dx, dy, d, m, bx, by, u, U, tx, ty, tg, mov=0;
    raf=0; ult=t;
    if(s&&s.cruza){ n=s.n; X=s.x; Y=s.y; Wd=s.w;
      for(j=0;j<n;j+=2) if(X[j]>r.left-CERCA&&X[j]<r.right+CERCA&&Y[j]>r.top-CERCA&&Y[j]<r.bottom+CERCA){ dentro=true; break; } }
    if(dentro&&!activo){ if(!listo) partir(); p.classList.add('emp-on'); medir(); r=p.getBoundingClientRect(); activo=true; }
    if(activo){
      for(k=0;k<N;k++){ tx=0; ty=0; tg=0;
        if(dentro){ px=r.left+cx[k]; py=r.top+cy[k]; m=1e9; bx=0; by=1; U=0;
          for(j=0;j<n;j++){ dx=px-X[j]; dx=dx>hw[k]?dx-hw[k]:dx<-hw[k]?dx+hw[k]:0;      // del eje al punto más cercano de la caja de la palabra (a lo ancho)
            dy=py-Y[j]; d=dx*dx+dy*dy; if(d<m){ m=d; bx=dx; by=dy; U=Wd[j]; } }
          d=Math.sqrt(m);
          if(d<4*LAM){ U+=HOLG+.45*hh[k]; if(U>.72*LAM) U=.72*LAM; u=U*Math.exp(-d/LAM);
            if(!sg[k]||by*sg[k]<-7) sg[k]=by<0?-1:by>0?1:(k%2?1:-1);                        // hacia arriba o hacia abajo del cuerpo; no cambia de lado mientras el eje no la pase por más de 7 px (sin saltos)
            tx=d>.5?.22*bx/d*u:0; ty=sg[k]*u;                                               // casi todo en vertical: las palabras de una misma línea no se montan entre sí
            px+=tx; py+=ty; m=1e9;                                                          // segunda pasada: si en su destino todavía toca el cuerpo, se corre lo que falta
            for(j=0;j<n;j++){ dx=px-X[j]; dx=dx>hw[k]?dx-hw[k]:dx<-hw[k]?dx+hw[k]:0; dy=py-Y[j]; dy=dy>hh[k]*.6?dy-hh[k]*.6:dy<-hh[k]*.6?dy+hh[k]*.6:0; d=Math.sqrt(dx*dx+dy*dy)-Wd[j]; if(d<m) m=d; }
            if(m<3) ty+=sg[k]*(3-m);
            tg=az[k]*GIRO*u; }
        } else sg[k]=0;
        ox[k]+=(tx-ox[k])*a; oy[k]+=(ty-oy[k])*a; og[k]+=(tg-og[k])*a;
        if(Math.abs(ox[k])+Math.abs(oy[k])>.08){ mov=1; pal[k].style.transform='translate('+ox[k].toFixed(2)+'px,'+oy[k].toFixed(2)+'px) rotate('+og[k].toFixed(4)+'rad)'; }
        else if(pal[k].style.transform) pal[k].style.transform='';
      }
      if(!dentro&&!mov) soltar();
    }
    if(activo||(s&&s.cruza)) raf=requestAnimationFrame(cuadro);
  }
  function mirar(){ var s; if(raf||document.hidden) return; s=Q.silueta(); if(s&&s.cruza){ ult=performance.now(); raf=requestAnimationFrame(cuadro); } }
  setInterval(mirar,400);
  window.addEventListener('resize',function(){ if(activo) medir(); });
  window.Empuje={ estado:function(){ var k, mx=0; for(k=0;k<N;k++) mx=Math.max(mx,Math.abs(ox[k])+Math.abs(oy[k])); return {activo:activo,palabras:N,maximo:+mx.toFixed(1)}; } };
})();
