import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

// Inyecta en el HTML los datos estructurados LocalBusiness de cada sede activa,
// leídos de public/data/sedes.json en cada build (agregar una sede no requiere tocar código).
function sedesJsonLd() {
  return {
    name: 'sedes-jsonld',
    transformIndexHtml(html) {
      const data = JSON.parse(readFileSync(new URL('./public/data/sedes.json', import.meta.url), 'utf8'));
      const g = data.general;
      const items = data.sedes
        .filter((s) => s.estado === 'activa')
        .map((s) => ({
          '@type': 'HardwareStore',
          name: `${g.nombre} – Sede ${s.nombre}`,
          telephone: s.whatsapp ? `+${s.whatsapp}` : `+${g.telefono}`,
          email: g.correo,
          image: s.foto ? `${s.foto}.jpg` : 'img/logo-circulo.png',
          areaServed: 'CO',
          address: {
            '@type': 'PostalAddress',
            ...(s.direccion ? { streetAddress: s.direccion } : {}),
            addressLocality: s.ciudad,
            addressRegion: s.ciudad === 'Armenia' ? 'Quindío' : 'Valle del Cauca',
            addressCountry: 'CO',
          },
          ...(s.lat != null ? { geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng } } : {}),
          sameAs: [g.instagram, g.facebook, g.youtube],
        }));
      const ld = { '@context': 'https://schema.org', '@graph': items };
      return html.replace('<!--SEDES_JSONLD-->', `<script type="application/ld+json">${JSON.stringify(ld)}</script>`);
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
  plugins: [sedesJsonLd(), preloadFuenteTitular()],
  build: { target: 'es2019', assetsInlineLimit: 0 },
});
