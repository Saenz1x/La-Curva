// Directorio de sedes: arma en HTML las partes fijas de la página que salen de public/data/sedes.json
// (contadores, textos de ciudades, preguntas frecuentes y pie de página).
// Lo usa vite.config.js al compilar, así el contenido queda en el HTML y Google lo lee sin JavaScript.
import { waSede, fmtTel, numerosSede, sedesActivas, ciudadesActivas, correoSede, enumerar } from './config.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const mail = (c) => `<a href="mailto:${esc(c)}">${esc(c)}</a>`;
const telWa = (s, data) =>
  s.whatsapp
    ? numerosSede(s).map((n) => `<a class="nowrap" href="https://wa.me/${n}" target="_blank" rel="noopener">${fmtTel(n)}</a>`).join(' · ')
    : `Línea general <a class="nowrap" href="https://wa.me/${data.general.telefono}" target="_blank" rel="noopener">${esc(data.general.telefono_texto)}</a>`;

// Sedes activas agrupadas por ciudad, en el orden de sedes.json
const porCiudad = (data) => ciudadesActivas(data).map((c) => ({ c, sedes: sedesActivas(data).filter((s) => s.ciudad === c.nombre) }));

/* ---------- preguntas frecuentes ---------- */
function faqSedes(data) {
  const grupos = porCiudad(data);
  return `<p>Tenemos ${sedesActivas(data).length} sedes en ${enumerar(grupos.map((g) => g.c.nombre))}. Escríbele directo a la que te quede más cerca:</p>
            <div class="faq__dir">${grupos.map(({ c, sedes }) => `
              <div class="faq__city">
                <h4>${esc(c.nombre)} <span>${esc(c.departamento)}</span></h4>
                <ul>${sedes.map((s) => `
                  <li><b>${esc(s.nombre)}</b><span>${s.direccion ? esc(s.direccion) : 'Dirección por confirmar'}</span><span>WhatsApp ${telWa(s, data)}</span></li>`).join('')}
                </ul>
              </div>`).join('')}
            </div>
            <p>Míralas en el <a class="link" href="#sedes">mapa de sedes</a>.</p>`;
}

function faqCorreos(data) {
  const ciudades = ciudadesActivas(data);
  const conCorreo = ciudades.filter((c) => c.correo);
  const sinCorreo = ciudades.filter((c) => !c.correo).map((c) => c.nombre);
  return `<p>Sí. Para pedidos y cotizaciones escríbele al correo de tu ciudad; para todo lo demás, al correo general.</p>
            <ul class="faq__mails">
              <li><b>General · todo el país${sinCorreo.length ? ` y ${esc(enumerar(sinCorreo))}` : ''}</b>${mail(data.general.correo)}</li>${conCorreo.map((c) => `
              <li><b>${esc(c.nombre)}</b>${mail(c.correo)}</li>`).join('')}
            </ul>`;
}

/* ---------- pie de página ---------- */
function footerSedes(data) {
  return porCiudad(data).map(({ c, sedes }) => `
          <section class="footer__city">
            <header>
              <h4>${esc(c.nombre)}</h4>
              <span>${esc(c.departamento)} · ${sedes.length} ${sedes.length === 1 ? 'sede' : 'sedes'}</span>
              <p class="footer__mail"><svg><use href="#i-mail"/></svg>${mail(correoSede(sedes[0], data))}</p>
            </header>
            <ul>${sedes.map((s) => `
              <li><a href="${esc(waSede(s, data.general))}" target="_blank" rel="noopener">
                <b>${esc(s.nombre)}</b>
                <span class="footer__tel"><svg><use href="#i-wa"/></svg>${s.whatsapp ? numerosSede(s).map(fmtTel).join(' · ') : 'Línea general'}</span>
                <span class="footer__addr">${s.direccion ? esc(s.direccion) : 'Dirección por confirmar'}</span>
              </a></li>`).join('')}
            </ul>
          </section>`).join('');
}

function footerContacto(data) {
  const g = data.general;
  const principal = data.sedes.find((s) => s.id === g.sede_principal);
  return `
          <li><svg><use href="#i-pin"/></svg><span><b>Sede principal${principal ? ` · ${esc(principal.nombre)}` : ''}</b><br />${esc(g.direccion)}</span></li>
          <li><svg><use href="#i-phone"/></svg><span><b>Línea general</b><br /><a href="tel:+${g.telefono}">${esc(g.telefono_texto)}</a> · <a href="https://wa.me/${g.telefono}" target="_blank" rel="noopener">WhatsApp</a></span></li>
          <li><svg><use href="#i-mail"/></svg><span><b>Correo general</b><br />${mail(g.correo)}</span></li>
          <li><svg><use href="#i-truck"/></svg><span>Envíos a toda Colombia</span></li>`;
}

// Reemplaza las marcas {{sedes.*}} de las páginas (index.html, premium y páginas legales)
export function renderDirectorio(html, data) {
  const marcas = {
    total: String(sedesActivas(data).length),
    ciudades: esc(enumerar(ciudadesActivas(data).map((c) => c.nombre))),
    faq: faqSedes(data),
    'faq-correos': faqCorreos(data),
    footer: footerSedes(data),
    contacto: footerContacto(data),
    correo: esc(data.general.correo),
    telefono: esc(data.general.telefono),
    'telefono-texto': esc(data.general.telefono_texto),
    direccion: esc(data.general.direccion),
    'premium-whatsapp': esc(data.general.premium_whatsapp || data.general.telefono),
    'premium-whatsapp-texto': esc(data.general.premium_whatsapp_texto || data.general.telefono_texto),
    'ciudades-puntos': esc(ciudadesActivas(data).map((c) => c.nombre).join(' · ')),
    'opciones-ciudad': ciudadesActivas(data).map((c) => `<option>${esc(c.nombre)}</option>`).join(''),
  };
  return html.replace(/\{\{sedes\.([\w-]+)\}\}/g, (m, k) => {
    if (!(k in marcas)) throw new Error(`Marca desconocida en index.html: ${m}`);
    return marcas[k];
  });
}
