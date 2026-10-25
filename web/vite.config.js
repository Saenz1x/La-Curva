import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { renderDirectorio } from './src/directorio.js';
import { sedesActivas, correoSede, ciudadDe } from './src/config.js';

const leerSedes = () => JSON.parse(readFileSync(new URL('./public/data/sedes.json', import.meta.url), 'utf8'));

// Arma desde public/data/sedes.json lo fijo de la página: contadores, ciudades, preguntas frecuentes,
// pie de página y los datos estructurados LocalBusiness de cada sede activa.
// Agregar o cambiar una sede no requiere tocar código.
function sedesHtml() {
  return {
    name: 'sedes-html',
    transformIndexHtml(html) {
      const data = leerSedes();
      const g = data.general;
      const items = sedesActivas(data).map((s) => ({
        '@type': 'HardwareStore',
        name: `${g.nombre} – Sede ${s.nombre}`,
        telephone: s.whatsapp ? `+${s.whatsapp}` : `+${g.telefono}`,
        email: correoSede(s, data),
        image: s.foto ? `${s.foto}.jpg` : 'img/logo-circulo.png',
        areaServed: 'CO',
        address: {
          '@type': 'PostalAddress',
          ...(s.direccion ? { streetAddress: s.direccion } : {}),
          addressLocality: s.ciudad,
          ...(ciudadDe(s, data).departamento ? { addressRegion: ciudadDe(s, data).departamento } : {}),
          addressCountry: 'CO',
        },
        ...(s.lat != null ? { geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng } } : {}),
        sameAs: [g.instagram, g.facebook, g.youtube],
      }));
      const ld = { '@context': 'https://schema.org', '@graph': items };
      return renderDirectorio(html, data).replace('<!--SEDES_JSONLD-->', `<script type="application/ld+json">${JSON.stringify(ld)}</script>`);
    },
  };
}

// Precarga la fuente del titular (es el elemento LCP en celular)
function preloadFuenteTitular() {
  return {
    name: 'preload-fuente-titular',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      const f = Object.keys(ctx.bundle).find((k) => /montserrat-latin-800-normal.*\.woff2$/.test(k));
      return f ? html.replace('</head>', `  <link rel="preload" as="font" type="font/woff2" href="./${f}" crossorigin />\n</head>`) : html;
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [sedesHtml(), preloadFuenteTitular()],
  build: { target: 'es2019', assetsInlineLimit: 0 },
});
