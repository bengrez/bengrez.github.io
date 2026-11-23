# uso: python3 -I scripts/retrato.py <dir-originales> <dir-salida>  — recortes del retrato de la portada, por tema (los originales no se suben al repo)
import sys, os
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np
src, out = sys.argv[1], sys.argv[2]
W0,H0=4000,1844; CX=.58
def cielo_menos_sat(im, f):
    """baja la saturación sólo en los azules del cielo (matiz 190–255°, saturación > 0,2), con borde suave"""
    hsv=np.asarray(im.convert('HSV')).astype(float); h=hsv[...,0]*360/255; s=hsv[...,1]/255
    m=np.clip((h-185)/15,0,1)*np.clip((258-h)/15,0,1)*np.clip((s-.18)/.15,0,1)
    hsv[...,1]=hsv[...,1]*(1-m*(1-f)); return Image.fromarray(hsv.astype('uint8'),'HSV').convert('RGB')
def recorte(im, cy0, cy1, asp):   # asp = ancho/alto
    y0=int(H0*cy0); y1=int(H0*cy1); h=y1-y0; w=int(h*asp); x0=int(W0*CX-w/2); x0=max(0,min(W0-w,x0)); return im.crop((x0,y0,x0+w,y1))
for tema, nombre in (('claro','20251115_145517.jpg'),('oscuro','20251115_145517-EDIT.jpg')):
    im=Image.open(os.path.join(src,nombre)).convert('RGB'); assert im.size==(W0,H0)
    if tema=='claro': im=cielo_menos_sat(im,.78)
    # 1) retrato vertical 4:5, figura centrada
    r=recorte(im,.13,.95,4/5).resize((560,700),Image.LANCZOS)
    r.save(os.path.join(out,'retrato-%s.webp'%tema),'WEBP',quality=63,method=6)
    # 2) celular: recorte apaisado 3:2
    m=recorte(im,.06,.96,3/2).resize((600,400),Image.LANCZOS)
    m.save(os.path.join(out,'retrato-%s-m.webp'%tema),'WEBP',quality=56,method=6)
for f in sorted(os.listdir(out)): print(f, os.path.getsize(os.path.join(out,f)))
