# uso: python3 -I scripts/retrato.py <dir-originales> <dir-salida>  — fotos del retrato de la portada, por tema (los originales no se suben al repo)
# Encuadre pedido por Benjamin (2026-11-23): apaisado, con él a la derecha (≈ 79 % del ancho) y las montañas y la nieve a la izquierda, que en la página se desvanecen hacia el texto.
import sys, os
from PIL import Image, ImageFilter
import numpy as np
src, out = sys.argv[1], sys.argv[2]
W0,H0=4000,1844; CX=.58
CAJA=(113,208,2907,1591)          # recorte apaisado (2794 × 1383, 2,02:1)
def cielo_menos_sat(im, f):
    """baja la saturación sólo en los azules del cielo (matiz 185–258°), con borde suave"""
    hsv=np.asarray(im.convert('HSV')).astype(float); h=hsv[...,0]*360/255; s=hsv[...,1]/255
    m=np.clip((h-185)/15,0,1)*np.clip((258-h)/15,0,1)*np.clip((s-.18)/.15,0,1)
    hsv[...,1]=hsv[...,1]*(1-m*(1-f)); return Image.fromarray(hsv.astype('uint8'),'HSV').convert('RGB')
def suaviza_izquierda(im, hasta=.5, radio=1.6):
    """la mitad izquierda se ve desvanecida en la página: se suaviza de a poco hacia el borde (pesa menos y no se nota)"""
    b=im.filter(ImageFilter.GaussianBlur(radio)); w,h=im.size
    x=np.linspace(0,1,w); m=np.clip(1-x/hasta,0,1)**1.2
    return Image.composite(b,im,Image.fromarray((np.tile(m,(h,1))*255).astype('uint8'),'L'))
def recorte(im, cy0, cy1, asp):
    y0=int(H0*cy0); y1=int(H0*cy1); h=y1-y0; w=int(h*asp); x0=int(W0*CX-w/2); x0=max(0,min(W0-w,x0)); return im.crop((x0,y0,x0+w,y1))
for tema, nombre in (('claro','20251115_145517.jpg'),('oscuro','20251115_145517-EDIT.jpg')):
    im=Image.open(os.path.join(src,nombre)).convert('RGB'); assert im.size==(W0,H0)
    if tema=='claro': im=cielo_menos_sat(im,.72)
    r=suaviza_izquierda(im.crop(CAJA).resize((1280,634),Image.LANCZOS))
    r.save(os.path.join(out,'portada-%s.webp'%tema),'WEBP',quality=50,method=6)
    m=recorte(im,.06,.96,3/2).resize((600,400),Image.LANCZOS)       # celular: apaisado 3:2, con él al centro
    m.save(os.path.join(out,'portada-%s-m.webp'%tema),'WEBP',quality=56,method=6)
for f in sorted(os.listdir(out)):
    if f.startswith('portada'): print(f, os.path.getsize(os.path.join(out,f)))
