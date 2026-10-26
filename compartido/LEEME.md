# /compartido: el diseño común del sitio y de Herramientas de aula

Desde la iteración 057 (2026-10-26), `bengrez.github.io` y `bengrez.github.io/aula-herramientas/` comparten una hoja de estilos y las fuentes. Las dos
páginas están en el mismo origen, así que el navegador las baja una vez y las reutiliza al pasar de una a otra.

| Archivo | Qué es |
|---|---|
| `base.css` | Fuentes, paleta clara y oscura, tipografía de base, estados, ficha de herramienta, cabecera (barra) y pie. Versión 1. |
| `barra.css` | Sólo la barra y el pie, acotados a `.barra-comun` y `.pie-comun`, para las páginas que no cargan `base.css` (cada herramienta del hub, que tiene su propio diseño). Versión 1. |
| `fuentes/*.woff2` | Bricolage Grotesque (variable: tamaño óptico 12–96, peso), Source Serif 4 (variable: tamaño óptico 8–60, peso; normal e itálica) e IBM Plex Mono 400 y 500. Subconjunto latino. |
| `fuentes/OFL-*.txt` | Licencias (SIL Open Font License 1.1; permiten incluirlas y redistribuirlas con la página). |

## Cómo se carga

Antes del `<style>` propio de la página (lo propio va encima y gana):

```html
<link rel="preload" href="/compartido/fuentes/bricolage-grotesque.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/compartido/fuentes/source-serif-4.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/compartido/base.css?v=HASH">
```

El sitio usa rutas relativas (`compartido/base.css`) porque vive en la raíz; el hub y sus herramientas usan la ruta desde la raíz (`/compartido/...`).
`?v=` es el hash de `base.css`: en el sitio lo pone `scripts/version-js.sh`; el hub lo copia del `index.html` del sitio cuando quiere forzar que los
navegadores bajen la versión nueva (GitHub Pages guarda la hoja 10 minutos, así que un cambio compatible llega igual al hub aunque no suba su `?v=`).

## Contrato de la versión 1

Lo que sigue no se renombra ni se quita en `base.css`. Un cambio que lo rompa va en un archivo nuevo (`base-2.css`), y `base.css` queda hasta que el
hub se cambie. Agregar variables o clases, o corregir un valor, se hace en el mismo archivo.

**Variables** (claro y oscuro; el tema sigue al sistema y `<html data-theme="light|dark">` lo fija):
`--bg --surface --ink --muted --rule --rule-strong --accent --accent-ink --e-uso --e-piloto --e-dev --display --body --mono --page --sesgo --gutter --bar`.
Cada página puede redefinir una variable en su `<style>` (por ejemplo, el hub, `--muted` más oscuro sobre su red), pero conviene anotarlo en la página.

**Estados** (un solo vocabulario):

| Clase | Símbolo | Textos |
|---|---|---|
| `estado e-uso` | punto lleno, verde apagado | «publicado», «publicada», «en uso», «en uso en clases» |
| `estado e-piloto` | medio punto del acento | «en piloto» |
| `estado e-dev` | anillo gris | «en desarrollo», «… en desarrollo» |

Un `.estado` sin una de las tres clases no es válido. `.estados` es la leyenda (una lista con los tres).

**Ficha de herramienta**: `article.herr` (imagen o `.tipo` arriba, texto abajo) y `article.herr.herr-a` (lado a lado; la columna de la imagen mide
`--herr-media`, 17 rem por omisión). Adentro: el título (`h3` o `h4`) con el enlace (toda la ficha es el enlace), `.sub`, `.estado`, `dl.campos`.
Opcional: `.herr-medio` envuelve la imagen o el `.tipo`. `.tipo` es el recuadro tipográfico para las fichas sin captura (`<b>` la fórmula o el título,
`<span>` la línea de abajo).

**Cabecera** (la misma en las dos páginas; ver abajo): `header.barra > .pagina.barra-in > nav.sitios + [nav.indice] + button.pausa + button.tema`.
En `nav.sitios` van siempre los dos sitios, en este orden; el de la página lleva `aria-current` y se ve en negrita. Bajo 640 px «Herramientas de aula»
se lee «Herramientas»: por eso « de aula» va en `<span class="largo">`.

**Pie**: `footer > .pagina > p` (el texto propio) `+ p.sitios-pie` (los dos sitios, igual que en la barra).

**Barra y pie de una herramienta** (`barra.css`): `nav.barra-comun` (arriba, `aria-label="Sitios"`) y `nav.pie-comun` (al final, `aria-label="Sitios, al pie"`), con el mismo par de sitios; son `<nav>` para no duplicar el `<header>` o el `<footer>` que la herramienta ya tenga. Es una franja
no fija sobre la cabecera propia de la herramienta. Si cambia la barra de `base.css` (orden, textos, separador, cortes de ancho), se cambia
también en `barra.css`.

**Utilidades**: `.pagina` (la columna, 72 rem, corrida a la izquierda), `.skip`, `.kicker`, `.lugar`, `.oculto` (sólo para lectores de pantalla).

## Cabecera y pie

En el sitio (`index.html`):

```html
<header class="barra">
  <div class="pagina barra-in">
    <nav class="sitios" aria-label="Sitios">
      <a href="#contenido" aria-current="page">Benjamín Moreira-Grez</a>
      <a href="https://bengrez.github.io/aula-herramientas/">Herramientas<span class="largo"> de aula</span></a>
    </nav>
    <nav class="indice" aria-label="Secciones de la página">…</nav>
    <button type="button" class="pausa" id="pausa" aria-label="Pausar animación" aria-pressed="false" hidden><i aria-hidden="true"></i></button>
    <button type="button" class="tema" id="tema" hidden><i aria-hidden="true"></i></button>
  </div>
</header>
…
<footer>
  <div class="pagina">
    <p>Texto propio de la página.</p>
    <p class="sitios-pie"><a href="#contenido" aria-current="page">Benjamín Moreira-Grez</a><a href="https://bengrez.github.io/aula-herramientas/">Herramientas de aula</a></p>
  </div>
</footer>
```

En la portada del hub cambian sólo los `href` y quién lleva `aria-current`; en una herramienta, «Herramientas de aula» lleva `aria-current="true"`
(estás dentro del hub) y es el enlace de vuelta a la portada del hub. El detalle está en el informe de la iteración 057 («Para el hub»).

Los botones parten con `hidden`. Los muestra el script de la página, y el script del `<head>` pone en `<html>` la clase `.js` (y `.sin-mov` con
movimiento reducido o ahorro de datos) para que su lugar quede reservado desde la primera pintura. Las claves de `localStorage` son comunes:
`tema` (`light` o `dark`) y `pausa` (`'1'` en pausa), y el estado de pausa vive en `<html data-pausa>`.

## Fuentes

Son los mismos archivos que Google Fonts entregaba al sitio hasta la 056 (descargados el 2026-10-26 de `fonts.gstatic.com`, subconjunto
`latin`), así que el dibujo no cambia. `base.css` las declara con el mismo `unicode-range` que usaba Google. Los caracteres fuera de él
(por ejemplo → ≥ ≈ σ ₀) salen de la fuente de respaldo, como antes. Para cambiar una fuente, reemplazar el archivo con otro nombre (los
archivos no llevan `?v=`) y declararlo en `base.css`.
