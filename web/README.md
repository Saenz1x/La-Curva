# Sitio web PVC La Curva

Sitio estático de una sola página (Vite + JavaScript, GSAP para animaciones, Google Maps embebido para el mapa, sin API key).
Todo lo del sitio vive en esta carpeta `web/`. Los videos y fotos originales no se tocan.

## Correrlo en local

```bash
cd web
npm install
npm run dev        # http://localhost:5173
```

Versión de producción:

```bash
npm run build      # genera web/dist/
npm run preview    # sirve dist en http://localhost:4173
```

## Publicarlo

`npm run build` deja todo en `web/dist/`. Es HTML/CSS/JS estático con rutas relativas, así que funciona en cualquier hosting:

- **Netlify:** arrastra la carpeta `dist/` en app.netlify.com → "Deploy manually". O conecta el repo con *Base directory* `web`, *Build command* `npm run build`, *Publish directory* `web/dist`.
- **Vercel:** importa el repo, *Root Directory* `web`, framework "Vite". Vercel detecta el resto.
- **GitHub Pages:** sube el contenido de `dist/` a la rama `gh-pages` (o usa la acción oficial "Deploy static content to Pages" apuntando a `web/dist`).

El dominio es **pvclacurva.com** (DNS en Hostinger apuntando a GitHub Pages). Si algún día cambia, actualiza `public/CNAME`, `public/sitemap.xml`, `public/robots.txt` y las etiquetas `canonical` / `og:` de `index.html`.

## Agregar o editar una sede

Todo está en **`public/data/sedes.json`**. Para una sede nueva copia un objeto de la lista `sedes` y cambia los datos:

```json
{
  "id": "cali-centro",
  "ciudad": "Cali",
  "nombre": "Centro",
  "whatsapp": "573001234567",
  "direccion": "Calle 10 # 5-20",
  "horario": "Lun a sáb 8:00 a. m. – 6:00 p. m.",
  "tipo_venta": "ambas",
  "productos": ["Cielo raso", "Pisos SPC"],
  "foto": "img/sede-cali-centro",
  "lat": 3.4516,
  "lng": -76.5320,
  "estado": "activa"
}
```

- `whatsapp`: con 57 adelante, sin espacios ni `+`. Si todavía no hay número, `null`: la página manda el mensaje a la línea general diciendo de qué sede se trata.
- `tipo_venta`: `"detal"`, `"mayor"`, `"ambas"` o `null`.
- `foto`: ruta **sin extensión**; deja dos archivos en `public/img/` (`.jpg` y `.webp`). Si no hay foto, `null`.
- `lat` / `lng`: el pin del mapa y el botón "Cómo llegar". Se sacan en Google Maps con clic derecho sobre el local → copiar coordenadas.
- Cualquier dato que no tengas va en `null` y la página lo oculta.
- `correo` (opcional): solo si la sede tiene un correo propio distinto al de su ciudad.
- Una ciudad nueva se agrega en la lista `ciudades`: `nombre`, `departamento`, `correo` (o `null` para usar el general), centro del mapa (`lat`, `lng`) y `zoom`.
- `general`: línea general, **correo nacional**, sede principal (`sede_principal`) con su dirección, y redes.

Todo sale de este archivo, sin tocar código:

| Dónde se ve | Qué muestra |
| --- | --- |
| Inicio y franja de datos | Número de sedes y ciudades |
| Título y descripción para Google | Lista de ciudades |
| Sedes (constelación, tarjeta y Google Maps) | Dirección, ciudad y departamento, WhatsApp y correo de cada sede |
| Botón de WhatsApp | Sedes por ciudad con número y dirección |
| Calculadora | Sedes por ciudad para enviar el pedido |
| Mayoristas | Ciudades sugeridas y correo general |
| Preguntas frecuentes | Directorio de sedes por ciudad y lista de correos |
| Pie de página | Contacto general y una tarjeta por ciudad con su correo y sus sedes |
| Datos estructurados (`LocalBusiness`) | Dirección, teléfono, correo y coordenadas por sede |

Los contadores, textos de ciudades, preguntas frecuentes, pie de página y datos estructurados se escriben en el HTML al hacer `npm run build` (`src/directorio.js` y `vite.config.js`), así Google los lee sin JavaScript. En `index.html` aparecen como marcas `{{sedes.…}}`.

## Tarjeta Cliente Premium (`premium/`)

Página para clientes invitados: **https://pvclacurva.com/premium/**. No está enlazada desde el sitio, no aparece en el sitemap y tiene `noindex`, así que Google no la muestra. Ojo: cualquiera que tenga el enlace puede abrirla; la aprobación de cada solicitud la hace el equipo.

- Para saber de dónde llegó cada cliente, comparte el enlace con `?utm_source=`, por ejemplo `pvclacurva.com/premium/?utm_source=cali-mostrador`. El valor llega en el campo `origen`.
- **Envío de solicitudes:** mientras `window.N8N_WEBHOOK_URL` (al inicio de `premium/index.html`) esté vacío, el formulario abre WhatsApp con la solicitud lista para el número del programa Premium (**312 430 8996**, campo `general.premium_whatsapp` de `sedes.json`). Cuando el webhook de n8n esté listo, pega su URL ahí y las solicitudes llegarán por POST en JSON (`nombre`, `documento`, `whatsapp`, `correo`, `tipo_cliente`, `sede`, `intereses`, `autoriza_datos`, `fecha_registro`, `estado`, `origen`).
- La imagen de la tarjeta es `premium/tarjeta.webp`.

## Páginas legales

- `politica-de-privacidad/`: tratamiento de datos personales (Ley 1581 de 2012).
- `politica-de-cookies/`: qué guarda el sitio y cómo cambiar la elección.
- `terminos/`: términos del sitio y, en `#premium`, las condiciones de la Tarjeta Premium.

El correo, el teléfono y la dirección salen de `sedes.json` (marcas `{{sedes.correo}}`, `{{sedes.telefono-texto}}`, `{{sedes.direccion}}`). Al cambiar algo importante, actualiza la fecha de vigencia de cada página.

**Cookies:** el sitio no usa cookies propias ni analítica. El aviso (`src/cookies.js`) solo pregunta por el mapa de Google Maps, que no se carga hasta que la persona acepta. La elección se guarda en el navegador (`localStorage`, clave `lc-cookies`). Si algún día se agrega analítica (Google Analytics, píxel de Meta…), hay que cargarla también solo con consentimiento y sumarla a la política.

## Otras cosas editables

- `src/config.js`: medidas de cada producto para la calculadora, % de desperdicio y cómo se arman los enlaces de WhatsApp y Google Maps.
- `src/modules/productos.js`: textos, íconos y fotos de las tarjetas de producto.
- `src/modules/extras.js`: tabla comparativa (`COMP`) y animaciones.
- `scripts/assets.sh`: regenera fachadas, pósters, reels comprimidos y el logo sin fondo desde el material original (ffmpeg). Se corre desde la carpeta `La Curva`: `bash web/scripts/assets.sh`.

## Fotos de referencia

Las fotos de `public/img/ref/` son de **Unsplash** (licencia libre, permite uso comercial sin atribución obligatoria; igual se menciona en el footer). No se usaron imágenes de Pinterest porque allí las fotos tienen dueño y no se pueden usar en un sitio comercial. Cuando La Curva tenga fotos propias, se reemplazan con el mismo nombre de archivo.

| Archivo | Foto en Unsplash (`https://images.unsplash.com/<código>`) |
|---|---|
| hero-h / hero-v | photo-1724582586495-d050726cf354 |
| cielo-raso (y versiones -sm) | photo-1790356296734-0e65fadc944a |
| techo-blanco | photo-1570463155522-055d977847a8 |
| paneles-3d | photo-1657661181640-e40887d47882 |
| pisos-spc | photo-1716315325541-776e39f9725f |
| marmol | photo-1564540583246-934409427776 |
| laminas | photo-1723468364354-3c63c6141f28 |
| ladrillo | photo-1547056961-3c25e9140b05 |
| tejas | photo-1628002881911-8bcdfbdf320e |
| puerto | photo-1590497008432-598f04441de8 |
| antes | photo-1668079334321-e51822308968 |
| despues-panel | photo-1695066380132-139a0f26743f |
| despues-marmol | photo-1694378061058-bb6532de3bba |

## Animaciones y "reducir movimiento"

Si el equipo tiene activado *reducir movimiento* (en Windows: Configuración → Accesibilidad → Efectos visuales → **Efectos de animación** apagado), el sitio lo respeta: quedan fundidos suaves y se quitan los desplazamientos. La simulación de lluvia sí corre siempre, porque la inicia la persona. Para ver todas las animaciones en ese equipo, abre la página con `?movimiento` al final de la URL (ej. `http://localhost:5173/?movimiento`).

## Lighthouse (móvil, build de producción en local)

Rendimiento 92–93 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100.
