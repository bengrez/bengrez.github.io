# Apoyo de la 075: lee de la figura 6 publicada (doi:10.3389/fmicb.2019.01617; el JPG no está en el repo) las posiciones de las muestras y prepara la detección de vectores y taxones.
# Los valores finales, revisados a mano contra la imagen, están en scripts/figuras.py (ORD_SITIOS, ORD_VEC, ORD_TAX). Uso: python3 -I scripts/digitaliza-fig6.py, con rec-g006.png en la carpeta actual.
import numpy as np, json
from PIL import Image
from collections import deque
im0=Image.open('rec-g006.png').convert('RGB'); W0,H0=im0.size
X0,KX,Y0,KY=2151.5,638.6,2193.0,638.3
ux=lambda px:(px-X0)/KX; uy=lambda py:(Y0-py)/KY
F=2; im=np.asarray(im0.resize((W0//F,H0//F),Image.LANCZOS)).astype(int); H,W,_=im.shape
r,g,b=im[...,0],im[...,1],im[...,2]
def comps(mask,minimo=4):
    visto=np.zeros(mask.shape,bool); out=[]
    ys,xs=np.where(mask)
    for y,x in zip(ys,xs):
        if visto[y,x]: continue
        q=deque([(y,x)]); visto[y,x]=True; c=[]
        while q:
            cy,cx=q.popleft(); c.append((cy,cx))
            for ny,nx in ((cy+1,cx),(cy-1,cx),(cy,cx+1),(cy,cx-1)):
                if 0<=ny<mask.shape[0] and 0<=nx<mask.shape[1] and mask[ny,nx] and not visto[ny,nx]: visto[ny,nx]=True; q.append((ny,nx))
        if len(c)>=minimo: out.append(np.array(c))
    return out
# 1) sitios: discos casi negros. Las líneas guía negras los unen a sus rótulos, así que se buscan ventanas cuadradas llenas (un disco de 24 px de diámetro contiene un cuadrado de 15 px; trazos y letras, no)
osc=((r<75)&(g<65)&(b<65)).astype(int)
def suma_ventana(m,k):
    I=np.zeros((m.shape[0]+1,m.shape[1]+1),int); I[1:,1:]=m.cumsum(0).cumsum(1)
    return I[k:,k:]-I[:-k,k:]-I[k:,:-k]+I[:-k,:-k]
K=15; sv=suma_ventana(osc,K); lleno=sv>=int(.97*K*K)
sit=[]
for c in comps(lleno,1):
    cy=c[:,0].mean()+K/2; cx=c[:,1].mean()+K/2
    sit.append((float(cx*F),float(cy*F),len(c)))
print('discos:',len(sit))
pts=sorted([(round(ux(x),3),round(uy(y),3)) for x,y,a in sit])
for p in pts: print('  ',p)
json.dump(pts,open('sitios.json','w'))
# 2) vectores: rojo. Para cada ángulo desde el origen, el píxel rojo más lejano; las puntas son máximos locales del radio
rojo=(r>190)&(g<125)&(b<115)&(r-g>80)
ox,oy=X0/F,Y0/F
ys,xs=np.where(rojo); dx=xs-ox; dy=oy-ys; rad=np.hypot(dx,dy); ang=np.degrees(np.arctan2(dy,dx))%360
nb=720; rmax=np.zeros(nb); 
for a_,r_ in zip(ang,rad):
    k=int(a_*nb/360)%nb
    if r_>rmax[k]: rmax[k]=r_
sm=np.convolve(np.r_[rmax[-6:],rmax,rmax[:6]],np.ones(5)/5,'same')[6:-6]
tips=[]
for k in range(nb):
    v=sm[k]; vec=[sm[(k+j)%nb] for j in range(-10,11)]
    if v>=max(vec) and v>60: tips.append((k*360/nb,v))
# une picos a menos de 4°
u=[]
for a_,v in tips:
    if u and abs(a_-u[-1][0])<4:
        if v>u[-1][1]: u[-1]=(a_,v)
    else: u.append((a_,v))
vec=[(round(v*F/KX*np.cos(np.radians(a_)),3), round(v*F/KY*np.sin(np.radians(a_)),3), round(a_,1)) for a_,v in u]
print('vectores:',len(vec))
for v in vec: print('  ',v)
json.dump(vec,open('vectores.json','w'))
# 3) especies: triángulos verdes semitransparentes. Correlación con una plantilla triangular sobre la máscara verde y máximos locales
verde=((g-r>25)&(g-b>25)&(g>120)).astype(float)
T=13                                        # lado del triángulo en esta escala (≈ 26 px en la original)
yy,xx=np.mgrid[0:T,0:T]; tri=((yy>=T-1-2*np.minimum(xx,T-1-xx)*1.0)).astype(float)   # triángulo con la punta arriba
tri=tri[::-1][::-1]
def corr(m,k):
    fm=np.fft.rfft2(m); fk=np.fft.rfft2(k[::-1,::-1],m.shape); return np.fft.irfft2(fm*fk,m.shape)
c=corr(verde,tri)/tri.sum()
print('plantilla',tri.sum(), 'máx',round(c.max(),2))
np.save('corr.npy',c.astype('float32')); np.save('verde.npy',verde.astype('uint8'))
