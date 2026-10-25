import { waLink, waSede, msgSede, fmtTel, sedesActivas } from '../config.js';

let state = { data: null, tema: null };
const panel = () => document.getElementById('wa-panel');
const btn = () => document.getElementById('wa-btn');

function render() {
  const { data, tema } = state;
  const list = document.getElementById('wa-list');
  const temaTxt = tema || '…';
  const activas = sedesActivas(data);
  const items = [];
  for (const c of data.ciudades) {
    const sedes = activas.filter((s) => s.ciudad === c.nombre);
    if (!sedes.length) continue;
    items.push(`<li class="wa-panel__group">${c.nombre}</li>`);
    sedes.forEach((s) => {
      items.push(`<li><a href="${waSede(s, data.general, temaTxt)}" target="_blank" rel="noopener">
        <div><b>Sede ${s.nombre}</b><span>${[s.whatsapp ? fmtTel(s.whatsapp) : 'Por la línea general', s.direccion].filter(Boolean).join(' · ')}</span></div><svg><use href="#i-wa"/></svg></a></li>`);
      (s.whatsapp_extra || []).forEach((n, k) =>
        items.push(`<li><a href="${waLink(n, msgSede(s.nombre, temaTxt))}" target="_blank" rel="noopener">
          <div><b>Sede ${s.nombre} · línea ${k + 2}</b><span>${fmtTel(n)}</span></div><svg><use href="#i-wa"/></svg></a></li>`)
      );
    });
  }
  items.push(
    `<li><a class="is-general" href="${waLink(data.general.telefono, `Hola PVC La Curva, vengo de la página web y quiero información sobre ${temaTxt}`)}" target="_blank" rel="noopener">
      <div><b>Línea general</b><span>${data.general.telefono_texto} · envíos a toda Colombia</span></div><svg><use href="#i-wa"/></svg></a></li>`
  );
  list.innerHTML = items.join('');
  document.getElementById('wa-tema').textContent = tema ? `Sobre: ${tema}` : 'Te respondemos por WhatsApp';
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
