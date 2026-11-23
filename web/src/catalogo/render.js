// Catálogo de productos: arma en HTML el contenido de catalogo/index.html desde public/data/catalogo.json.
// Lo usa vite.config.js al compilar, así el catálogo queda en el HTML y Google lo lee sin JavaScript.
import { waLink } from '../config.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ico = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;

// Mensajes de WhatsApp
const msgCompra = (p, l) => `Hola PVC La Curva, vengo del catálogo web y quiero comprar en línea: ${p}${l ? ` (${l})` : ''}`;
const msgMayor = (l) => `Hola PVC La Curva, vengo del catálogo web y quiero cotizar al por mayor: ${l}`;

// Foto de la línea: la portada, o si no tiene, la del primer producto con foto
const portada = (l) => l.portada || l.grupos.flatMap((g) => g.productos).find((p) => p.imagen)?.imagen;

const badge = (l) =>
  l.venta === 'en-linea'
    ? `<span class="badge badge--online">${ico('i-cart')}Venta en línea</span>`
    : `<span class="badge">${ico('i-store')}Al por mayor</span>`;

function tarjetaLinea(l) {
  return `<a class="linea-card" href="#${esc(l.id)}" data-cat="${esc(slug(l.categoria))}" data-venta="${esc(l.venta)}">
          ${portada(l) ? `<img src="../${esc(portada(l))}" alt="" loading="lazy" width="320" height="200" />` : `<span class="foto-vacia">${ico('i-box')}</span>`}
          <span class="linea-card__cat">${esc(l.categoria)}</span>
          <b>${esc(l.nombre)}</b>
          ${badge(l)}
        </a>`;
}

function producto(p, l, ventas) {
  const texto = [p.nombre, p.codigo].filter(Boolean).join(' · ');
  const buscar = [p.nombre, p.codigo, p.detalle, l.nombre].filter(Boolean).join(' ').toLowerCase();
  const pedir = l.venta === 'en-linea'
    ? `<a class="prod__cta" href="${waLink(ventas.whatsapp, msgCompra(texto, l.nombre))}" target="_blank" rel="noopener">${ico('i-wa')}Pedir</a>`
    : '';
  return `<li class="prod" data-q="${esc(buscar)}">
                ${p.imagen
                  ? `<button class="prod__img" type="button" data-zoom="../${esc(p.imagen)}" aria-label="Ampliar foto de ${esc(p.nombre)}"><img src="../${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy" width="240" height="180" /></button>`
                  : `<span class="prod__img prod__img--vacia">${ico('i-box')}</span>`}
                <div class="prod__body">
                  <b>${esc(p.nombre)}</b>
                  ${p.codigo ? `<span class="prod__cod">${esc(p.codigo)}</span>` : ''}
                  ${p.detalle ? `<span class="prod__det">${esc(p.detalle)}</span>` : ''}
                  <span class="prod__precio">Precio próximamente</span>
                  ${pedir}
                </div>
              </li>`;
}

function seccionLinea(l, ventas, general) {
  const total = l.grupos.reduce((n, g) => n + g.productos.length, 0);
  const cta = l.venta === 'en-linea'
    ? `<a class="btn btn--red" href="${waLink(ventas.whatsapp, msgCompra(l.nombre))}" target="_blank" rel="noopener">${ico('i-wa')}Comprar en línea · ${esc(ventas.texto)}</a>`
    : `<a class="btn btn--red" href="${waLink(general.telefono, msgMayor(l.nombre))}" target="_blank" rel="noopener">${ico('i-wa')}Cotizar al por mayor</a>`;
  return `
      <section class="linea" id="${esc(l.id)}" data-cat="${esc(slug(l.categoria))}" data-venta="${esc(l.venta)}" aria-labelledby="t-${esc(l.id)}">
        <div class="linea__head">
          ${portada(l) ? `<img class="linea__portada" src="../${esc(portada(l))}" alt="" loading="lazy" width="640" height="400" />` : `<span class="linea__portada foto-vacia">${ico('i-box')}</span>`}
          <div class="linea__info">
            <p class="kicker">${esc(l.categoria)} · ${total} referencia${total === 1 ? '' : 's'}</p>
            <h2 id="t-${esc(l.id)}">${esc(l.nombre)}</h2>
            ${badge(l)}
            <p>${esc(l.resumen)}</p>
            <ul class="chips">${l.beneficios.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
            <div class="linea__ctas">
              ${cta}
              <button class="btn btn--ghost" type="button" data-curvi="${esc(`Quiero asesoría sobre ${l.nombre}`)}">${ico('i-chat')}Asesoría con Curvi</button>
            </div>
          </div>
        </div>
        <details class="ficha">
          <summary>Ficha técnica</summary>
          <dl>${l.ficha.map(([c, v]) => `<div><dt>${esc(c)}</dt><dd${v ? '' : ' class="muted"'}>${v ? esc(v) : 'Por confirmar'}</dd></div>`).join('')}</dl>
        </details>
        ${l.grupos.map((g) => `
        <div class="grupo">
          <h3>${esc(g.titulo)}</h3>
          <ul class="prods">${g.productos.map((p) => producto(p, l, ventas)).join('')}
          </ul>
        </div>`).join('')}
      </section>`;
}

export function renderCatalogo(html, cat, sedes) {
  const ventas = cat.venta_en_linea;
  const general = sedes.general;
  const categorias = [...new Set(cat.lineas.map((l) => l.categoria))];
  const enLinea = cat.lineas.filter((l) => l.venta === 'en-linea').map((l) => l.nombre);
  const total = cat.lineas.reduce((n, l) => n + l.grupos.reduce((m, g) => m + g.productos.length, 0), 0);
  const filtros = [
    `<button type="button" class="filtro" data-filtro="todas" aria-pressed="true">Todas</button>`,
    `<button type="button" class="filtro filtro--online" data-filtro="en-linea" aria-pressed="false">${ico('i-cart')}Venta en línea</button>`,
    ...categorias.map((c) => `<button type="button" class="filtro" data-filtro="${esc(slug(c))}" aria-pressed="false">${esc(c)}</button>`),
  ].join('');

  return html
    .replaceAll('{{catalogo.lineas}}', String(cat.lineas.length))
    .replaceAll('{{catalogo.referencias}}', String(total))
    .replaceAll('{{catalogo.en-linea}}', enLinea.join(' y '))
    .replaceAll('{{catalogo.ventas-tel}}', esc(ventas.texto))
    .replaceAll('{{catalogo.ventas-wa}}', waLink(ventas.whatsapp, 'Hola PVC La Curva, vengo del catálogo web y quiero comprar en línea'))
    .replaceAll('{{catalogo.mayor-wa}}', waLink(general.telefono, 'Hola PVC La Curva, vengo del catálogo web y quiero cotizar al por mayor'))
    .replaceAll('{{catalogo.mayor-tel}}', esc(general.telefono_texto))
    .replace('<!--CATALOGO_FILTROS-->', filtros)
    .replace('<!--CATALOGO_INDICE-->', cat.lineas.map(tarjetaLinea).join(''))
    .replace('<!--CATALOGO_LINEAS-->', cat.lineas.map((l) => seccionLinea(l, ventas, general)).join(''));
}
