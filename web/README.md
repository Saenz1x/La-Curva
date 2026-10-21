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

Cuando tengan dominio, cambia `og:image` en `index.html` por la URL absoluta (`https://dominio.com/img/og.jpg`) para que la vista previa en WhatsApp salga siempre.

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

- `whatsapp`: con 57 adelante, sin espacios ni `+`. Si todavía no hay número, `null`: la página manda el mensaje a la línea general diciendo de qué sede se trata (así están hoy Cali y Armenia).
- `tipo_venta`: `"detal"`, `"mayor"`, `"ambas"` o `null`.
- `foto`: ruta **sin extensión**; deja dos archivos en `public/img/` (`.jpg` y `.webp`). Si no hay foto, `null`.
- `lat` / `lng`: el pin del mapa y el botón "Cómo llegar". Se sacan en Google Maps con clic derecho sobre el local → copiar coordenadas.
- Cualquier dato que no tengas va en `null` y la página lo oculta.
- Una ciudad nueva se agrega en la lista `ciudades` (nombre, centro del mapa y zoom).

La constelación, el mapa, el botón de WhatsApp, la calculadora, el footer y los datos estructurados de Google (`LocalBusiness`, se generan al hacer `npm run build`) salen de este archivo. No hay que tocar código.

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
1. **Cali y Armenia:** dirección y número de WhatsApp de cada sede (mientras tanto, la página manda esos mensajes a la línea general). Con la dirección, también su ubicación en el mapa (hoy está el centro de cada ciudad).
2. **El Cambio y El Pascual:** dirección y ubicación exacta (hoy aproximadas).
3. ✔ Ubicación confirmada: Independencia (Cl. 6 #61-32), La Piña Madura (Calle 5 No. 14-41), María Eugenia (Cl. 6 #41B-56) y Kennedy (Calle 6). Falta el número exacto de la dirección de Kennedy.
4. Horario de atención de cada sede (salvo María Eugenia).
5. Horario de Independencia: Google Maps dice "cierra a las 5 a. m.", parece un error de la ficha.
6. Tipo de venta por sede (detal / mayor / ambas).
7. Fotos de fachada de El Cambio, Independencia, El Pascual, Cali y Armenia.
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
16. Dominio definitivo (para `og:image` absoluta y el `sitemap`).
