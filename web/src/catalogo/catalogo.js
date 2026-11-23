// Página del catálogo: filtros por categoría, buscador, foto ampliada y chat de Curvi.
// El contenido (líneas y productos) ya viene en el HTML: lo arma vite.config.js desde public/data/catalogo.json.
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/montserrat/latin-800.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '../legal/legal.css';
import './catalogo.css';
import { initCookies } from '../cookies.js';
import { initCurvi, abrirCurvi } from '../curvi/curvi.js';

initCookies({ politica: '../politica-de-cookies/' });
initCurvi({ privacidad: '../politica-de-privacidad/' });
document.getElementById('year').textContent = new Date().getFullYear();

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const lineas = $$('.linea');
const tarjetas = $$('.linea-card');
const filtros = $$('.filtro');
const q = $('#q');
const resultado = $('#resultado');
const vacio = $('#vacio');
const indice = $('#indice');
let filtro = 'todas';

// Texto de búsqueda sin tildes, calculado una vez por producto
const prods = $$('.prod').map((el) => ({ el, txt: sinTildes(el.dataset.q) }));

const pasaFiltro = (el) => filtro === 'todas' || el.dataset.cat === filtro || el.dataset.venta === filtro;

function aplicar() {
  const termino = sinTildes(q.value);
  let hits = 0;
  for (const l of lineas) {
    const visible = pasaFiltro(l);
    let enLinea = 0;
    for (const p of prods.filter((p) => l.contains(p.el))) {
      const ok = visible && (!termino || p.txt.includes(termino));
      p.el.hidden = !ok;
      if (ok) enLinea++;
    }
    // Un grupo sin productos visibles se oculta
    for (const g of $$('.grupo', l)) g.hidden = !$$('.prod', g).some((p) => !p.hidden);
    l.hidden = !visible || (termino && enLinea === 0);
    if (!l.hidden) hits += enLinea;
  }
  for (const t of tarjetas) t.hidden = !pasaFiltro(t);
  indice.hidden = Boolean(termino);
  vacio.hidden = hits > 0;
  resultado.textContent = termino ? `${hits} resultado${hits === 1 ? '' : 's'} para «${q.value.trim()}»` : '';
  // Al buscar, la ficha técnica se cierra para dejar ver los productos
  if (termino) $$('.ficha').forEach((f) => (f.open = false));
}

filtros.forEach((b) =>
  b.addEventListener('click', () => {
    filtro = b.dataset.filtro;
    filtros.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    aplicar();
  }),
);

let t;
q.addEventListener('input', () => {
  clearTimeout(t);
  t = setTimeout(aplicar, 120);
});

// Foto ampliada
const zoom = $('#zoom');
const zoomImg = $('img', zoom);
document.addEventListener('click', (e) => {
  const z = e.target.closest('[data-zoom]');
  if (z) {
    zoomImg.src = z.dataset.zoom;
    zoomImg.alt = $('img', z)?.alt || '';
    zoom.showModal();
    return;
  }
  if (e.target === zoom || e.target.closest('.zoom__close')) zoom.close();

  // Sin resultados: le pasa la búsqueda a Curvi (los demás botones data-curvi los atiende curvi.js)
  if (e.target.closest('[data-curvi-busqueda]')) abrirCurvi(`Busco ${q.value.trim()} y no lo encuentro en el catálogo`);
});
