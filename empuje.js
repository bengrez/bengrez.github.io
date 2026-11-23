/* empuje.js (063) — el nematodo se entierra en el párrafo de la portada y aparta las palabras de su cuerpo.

   Reemplaza al empuje de la 053, que rehacía el párrafo entero con Pretext y lo dejaba partido en dos columnas alrededor del nematodo
   (Benjamin, 2026-11-23: que el nematodo mueva el texto es intencional; lo que cambia es la forma). Ahora no hay reflujo: cada palabra del
   párrafo es una caja (<span class="pal">) que se desplaza con transform, como una partícula de suelo, y vuelve sola a su lugar.

   - quimiotaxis.js lleva al nematodo hasta el párrafo: entra por un costado, se entierra unos segundos hurgando y sale por donde entró.
     Su silueta (puntos del eje con su semiancho, en píxeles de la ventana) se lee con Quimiotaxis.silueta().
   - Campo de desplazamiento (065, Benjamin: más conectividad entre las letras y que se muevan menos mientras dejan pasar al nematodo):
     las palabras ya no se apartan una por una del cuerpo que ondula, sino del eje del cuerpo sin la ondulación (una media móvil), todas
     las de un mismo lado hacia ese lado, con u = U · e^(−(d/LAM)²). U es lo justo para que pase (semiancho, media ondulación y un margen:
     ≈ 18 px, antes 26–31) y el campo muere a ≈ 2 · LAM, así que se mueven las líneas vecinas y no el párrafo. El desplazamiento se evalúa
     en los dos extremos de cada palabra: la media la traslada y la diferencia la inclina, de modo que las palabras vecinas siguen unidas
     por sus extremos y la línea se curva alrededor del nematodo como una cuerda, sin romperse. Sin giros al azar. Respuesta de TAU s.
     Cuando el nematodo se va, todas vuelven a cero y se quitan las transformaciones.
   - 074: el nematodo ya no entra al párrafo: empuja contra su borde izquierdo. Frente a la punta de la cabeza las palabras se corren hasta
     10 px, alejándose de ella, con un alcance largo para que las vecinas se muevan casi lo mismo.
   - El texto no cambia: mismas palabras, mismos espacios, mismo orden; se puede seleccionar y lo leen igual los lectores de pantalla.
   - Con prefers-reduced-motion no hace nada (y quimiotaxis.js tampoco se carga): el texto queda quieto. */
(function(){
  'use strict';
  var Q=window.Quimiotaxis, p=document.querySelector('.hero .lede');
  if(!Q||!Q.silueta||!p) return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var HOLG=2, UMAX=20, LAM=62, TAU=.28, GMAX=.13, HIST=10, CERCA=70;   // holgura (px), desplazamiento máximo (px), alcance del campo (px), respuesta (s), inclinación máxima (rad), histéresis de lado (px), margen para activarse (px)
  var ex=null, ey=null, qd=0, qs=0, qnx=0, qny=1, qcab=false, UCAB=10, LCAB=110;   // 074: frente a la cabeza, las palabras se corren hasta UCAB px en la dirección en que empuja, con un alcance largo (LCAB) para que las vecinas las acompañen y no se monten
  var pal=[], N=0, cx, cy, hw, hh, ox, oy, og, sg, listo=false, activo=false, raf=0, ult=0;

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
    ox=new Float32Array(N); oy=new Float32Array(N); og=new Float32Array(N); sg=new Int8Array(N);
    listo=true;
  }
  function medir(){ // el lugar de cada palabra en reposo, relativo al párrafo
    var r, k, q;
    for(k=0;k<N;k++) pal[k].style.transform='';
    r=p.getBoundingClientRect();
    for(k=0;k<N;k++){ q=pal[k].getBoundingClientRect(); cx[k]=q.left+q.width/2-r.left; cy[k]=q.top+q.height/2-r.top; hw[k]=q.width/2; hh[k]=q.height/2; }
  }
  function soltar(){ var k; for(k=0;k<N;k++){ pal[k].style.transform=''; ox[k]=oy[k]=og[k]=0; } p.classList.remove('emp-on'); activo=false; }

  function eje(n,X,Y){ // el eje del cuerpo sin la ondulación (media móvil de ≈ 60 % del largo) y la amplitud de esa ondulación
    var w=Math.max(2,Math.round(n*.3)), j, k, a, c, sx, sy, m=0, d;
    if(!ex||ex.length<n){ ex=new Float32Array(n); ey=new Float32Array(n); }
    for(j=0;j<n;j++){ sx=0; sy=0; c=0; k=Math.min(w,j,n-1-j); a=j-k; k=j+k; for(;a<=k;a++){ sx+=X[a]; sy+=Y[a]; c++; } ex[j]=sx/c; ey[j]=sy/c; }   // ventana simétrica que se achica hacia las puntas: la cabeza y la cola quedan en su lugar
    for(j=0;j<n;j++){ d=Math.sqrt((X[j]-ex[j])*(X[j]-ex[j])+(Y[j]-ey[j])*(Y[j]-ey[j])); if(d>m) m=d; }
    return m;
  }
  function cerca(px,py,n){ // punto más cercano del eje suavizado: deja la distancia en qd, la distancia con signo (lado) en qs y la normal en qnx, qny
    var j, ax, ay, bx, by, l2, t, cx_, cy_, d, m=1e18, dx, dy;
    for(j=0;j<n-1;j++){ ax=ex[j]; ay=ey[j]; bx=ex[j+1]-ax; by=ey[j+1]-ay; l2=bx*bx+by*by||1; t=((px-ax)*bx+(py-ay)*by)/l2; t=t<0?0:t>1?1:t;
      cx_=ax+t*bx; cy_=ay+t*by; dx=px-cx_; dy=py-cy_; d=dx*dx+dy*dy; if(d<m){ m=d; l2=Math.sqrt(l2); qnx=-by/l2; qny=bx/l2; qs=dx*qnx+dy*qny; qcab=j===0&&t===0; } }   // qcab: lo más cercano es la punta de la cabeza
    qd=Math.sqrt(m);
  }
  function cuadro(t){
    var s=Q.silueta(), r=p.getBoundingClientRect(), dt=Math.min(.05,Math.max(.001,(t-ult)/1000)), a=1-Math.exp(-dt/TAU);
    var dentro=false, n=0, X, Y, Wd, j, k, px, py, U, A, u0, u1, lado, tx, ty, tg, mov=0, nx, ny, hwm=0;
    raf=0; ult=t;
    if(s&&s.cruza){ n=s.n; X=s.x; Y=s.y; Wd=s.w;
      for(j=0;j<n;j+=2) if(X[j]>r.left-CERCA&&X[j]<r.right+CERCA&&Y[j]>r.top-CERCA&&Y[j]<r.bottom+CERCA){ dentro=true; break; } }
    if(dentro&&!activo){ if(!listo) partir(); p.classList.add('emp-on'); medir(); r=p.getBoundingClientRect(); activo=true; }
    if(activo){
      if(dentro){ A=eje(n,X,Y); for(j=0;j<n;j++) if(Wd[j]>hwm) hwm=Wd[j]; }
      for(k=0;k<N;k++){ tx=0; ty=0; tg=0;
        if(dentro){ px=r.left+cx[k]; py=r.top+cy[k];
          cerca(px,py,n);
          if(qcab){ // 074: el nematodo empuja desde fuera del bloque: las palabras frente a su cabeza se apartan de ella (hacia adentro del párrafo y hacia arriba o abajo), poco y juntas
            nx=px-ex[0]; nx=nx>hw[k]?nx-hw[k]:nx<-hw[k]?nx+hw[k]:0; ny=py-ey[0]; u0=Math.sqrt(nx*nx+ny*ny);
            if(u0<2.2*LCAB){ u1=UCAB*Math.exp(-(u0/LCAB)*(u0/LCAB)); if(u0<.5){ nx=1; ny=0; u0=1; } tx=nx/u0*u1; ty=.6*ny/u0*u1; }
            sg[k]=0;
          } else if(qd<3*LAM){
            if(!sg[k]||qs*sg[k]<-HIST) sg[k]=qs<0?-1:qs>0?1:(k%2?1:-1);           // el lado por el que la palabra deja pasar al cuerpo; no cambia mientras el eje no la cruce por más de HIST px
            lado=sg[k]; nx=qnx; ny=qny;
            U=hwm+.5*A+.3*hh[k]+HOLG; if(U>UMAX) U=UMAX;                       // lo justo para que pase: el semiancho, media ondulación y un margen
            cerca(px-hw[k],py,n); u0=U*Math.exp(-(qd/LAM)*(qd/LAM));              // el desplazamiento se evalúa en los dos extremos de la palabra:
            cerca(px+hw[k],py,n); u1=U*Math.exp(-(qd/LAM)*(qd/LAM));              // la media la traslada y la diferencia la inclina, así los extremos de palabras vecinas siguen juntos (la línea se curva, no se rompe)
            tx=.3*lado*nx*(u0+u1)/2; ty=lado*ny*(u0+u1)/2;                            // casi todo en vertical: a lo largo de la línea las palabras no se acercan entre sí
            tg=Math.atan2(lado*ny*(u1-u0),2*hw[k]||1); if(tg>GMAX) tg=GMAX; else if(tg<-GMAX) tg=-GMAX;
          } else sg[k]=0;
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
