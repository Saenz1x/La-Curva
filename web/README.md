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

- `whatsapp`: con 57 adelante, sin espacios ni `+`. Si todavía no hay número, `null`: la página manda el mensaje a la línea general diciendo de qué sede se trata (hoy ninguna sede está así).
- `tipo_venta`: `"detal"`, `"mayor"`, `"ambas"` o `null`.
- `foto`: ruta **sin extensión**; deja dos archivos en `public/img/` (`.jpg` y `.webp`). Si no hay foto, `null`.
- `lat` / `lng`: el pin del mapa y el botón "Cómo llegar". Se sacan en Google Maps con clic derecho sobre el local → copiar coordenadas.
- Cualquier dato que no tengas va en `null` y la página lo oculta.
- `correo` (opcional): solo si la sede tiene un correo propio distinto al de su ciudad.
- Una ciudad nueva se agrega en la lista `ciudades`: `nombre`, `departamento`, `correo` (o `null` para usar el general), centro del mapa (`lat`, `lng`) y `zoom`.
- `general`: línea general, **correo nacional**, dirección de la sede principal y redes.

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

---

## [PENDIENTE] — lista para pedirle al cliente

**Sedes**
1. ✔ Cali (Cl. 25 #8-30, 313 774 8009) y Armenia (Carrera 19 #11-61, 312 331 3726 y 310 753 9445): datos y ubicación listos.
2. ✔ El Cambio (Cl. 1 #70-27) y El Pascual (Cl. 5 #10-04): dirección y ubicación listas.
   **Bucaramanga** (Cra. 17 #59-130, barrio Ricaurte, 310 378 7447): falta la ubicación exacta en Google Maps (hoy aproximada) y saber si tendrá correo propio (hoy usa el general).
3. ✔ Ubicación confirmada: Independencia (Cl. 6 #61-32), La Piña Madura (Calle 5 No. 14-41), María Eugenia (Cl. 6 #41B-56) , Kennedy (Calle 6) y Armenia (Carrera 19 #11-61). Falta el número exacto de la dirección de Kennedy.
4. Horario de atención de cada sede (salvo María Eugenia).
5. Horario de Independencia: Google Maps dice "cierra a las 5 a. m.", parece un error de la ficha.
6. Tipo de venta por sede (detal / mayor / ambas).
7. Fotos de fachada de El Cambio, Independencia, El Pascual, Cali, Armenia y Bucaramanga.
8. Sugerencia: crear o reclamar la ficha de Google Maps de cada sede, para que todas salgan en el mapa.

**Productos**
9. Medidas reales de cada pieza para la calculadora (`src/config.js`): lámina de cielo raso (hoy 0,25 × 5,95 m), panel 3D (0,50 × 0,50 m), m² por caja de piso SPC (2,2 m²), lámina marmolizada y lámina PVC (1,22 × 2,44 m), rollo de adhesivo (0,45 × 10 m).
10. Fotos propias de productos instalados, para reemplazar las de referencia.
11. Revisar los textos de producto y la tabla comparativa (PVC vs. yeso vs. mármol). Son generales y no traen cifras.
12. Validar con el equipo los 4 pasos de la guía de instalación.

**Contenido**
13. Fotos reales de antes y después de un cliente para el deslizador.
14. Condiciones de los envíos a otras ciudades (tiempos, transportadora, quién paga el flete), si quieren publicarlas.
15. Testimonios, cifras de clientes, años de experiencia: no se pusieron porque no hay datos.
16. ✔ Dominio: pvclacurva.com (ya configurado en `index.html`, `sitemap.xml`, `robots.txt` y `public/CNAME`).
