import { waLink, waSede, msgSede, fmtTel, numerosSede, sedesActivas, ciudadesActivas, correoSede } from '../config.js';

let state = { data: null, tema: null };
const panel = () => document.getElementById('wa-panel');
const btn = () => document.getElementById('wa-btn');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function render() {
  const { data, tema } = state;
  const list = document.getElementById('wa-list');
  const temaTxt = tema || '…';
  const g = data.general;
  // Línea general primero: atiende todo el país
  const items = [
    `<li class="wa-sede wa-sede--general">
      <div class="wa-sede__info"><b>Línea general</b><span>Todo el país · envíos a toda Colombia</span></div>
      <div class="wa-sede__nums"><a href="${waLink(g.telefono, `Hola PVC La Curva, vengo de la página web y quiero información sobre ${temaTxt}`)}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>${esc(g.telefono_texto)}</a></div>
    </li>`,
  ];
  for (const c of ciudadesActivas(data)) {
    const correo = correoSede({ ciudad: c.nombre }, data);
    items.push(`<li class="wa-panel__group"><span>${esc(c.nombre)}</span><a href="mailto:${esc(correo)}">${esc(correo)}</a></li>`);
    sedesActivas(data).filter((s) => s.ciudad === c.nombre).forEach((s) => {
      // Cada número de la sede es un botón; sin número propio va a la línea general
      const nums = s.whatsapp
        ? numerosSede(s).map((n) => `<a href="${waLink(n, msgSede(s.nombre, temaTxt))}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>${fmtTel(n)}</a>`)
        : [`<a href="${waSede(s, g, temaTxt)}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Línea general</a>`];
      items.push(`<li class="wa-sede">
        <div class="wa-sede__info"><b>Sede ${esc(s.nombre)}</b><span>${s.direccion ? esc(s.direccion) : 'Dirección por confirmar'}</span></div>
        <div class="wa-sede__nums">${nums.join('')}</div>
      </li>`);
    });
  }
  list.innerHTML = items.join('');
  document.getElementById('wa-tema').textContent = tema ? `Sobre: ${tema}` : 'Toca el número y te respondemos por WhatsApp';
}

export function openWa(tema = null) {
  state.tema = tema;
  render();
  panel().hidden = false;
  btn().setAttribute('aria-expanded', 'true');
  panel().querySelector('a')?.focus({ preventScroll: true });
}

export function closeWa() {
  panel().hidden = true;
  btn().setAttribute('aria-expanded', 'false');
}

export function initWhatsapp(data) {
  state.data = data;
  btn().addEventListener('click', () => (panel().hidden ? openWa() : closeWa()));
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-wa-open]');
    if (opener) {
      e.preventDefault();
      if (!panel().hidden && !opener.dataset.waTema && opener.closest('.dock')) return closeWa();
      openWa(opener.dataset.waTema || null);
      return;
    }
    if (e.target.closest('[data-wa-close]')) return closeWa();
    if (!panel().hidden && !e.target.closest('#wa-float')) closeWa();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel().hidden) {
      closeWa();
      btn().focus();
    }
  });
}
