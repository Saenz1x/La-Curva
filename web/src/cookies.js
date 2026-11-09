// Aviso y preferencias de cookies (sitio principal y páginas legales).
// El sitio no usa cookies propias ni analítica. Lo único de terceros es el mapa de Google Maps,
// que se carga solo si la persona acepta. La elección se guarda en este navegador (localStorage).
import './cookies.css';

const CLAVE = 'lc-cookies';
const EVENTO = 'lc:cookies';

export function getConsent() {
  try { return localStorage.getItem(CLAVE); } catch { return null; }
}

function setConsent(valor) {
  try { localStorage.setItem(CLAVE, valor); } catch { /* sin almacenamiento: vale solo para esta visita */ }
  document.dispatchEvent(new CustomEvent(EVENTO, { detail: valor }));
}

export const mapasPermitidos = () => getConsent() === 'todas';
export const aceptarTodas = () => setConsent('todas');
export const onConsent = (fn) => document.addEventListener(EVENTO, (e) => fn(e.detail));

let banner;
function mostrar(politica) {
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'ck';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML = `
      <p><b>Cookies</b> Este sitio no usa cookies propias ni analítica. El mapa de sedes es de Google Maps y Google puede usar sus cookies cuando se muestra. <a href="${politica}">Más información</a></p>
      <div class="ck__btns">
        <button type="button" class="ck__btn" data-ck="necesarias">Solo necesarias</button>
        <button type="button" class="ck__btn ck__btn--ok" data-ck="todas">Aceptar todas</button>
      </div>`;
    banner.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ck]');
      if (!b) return;
      setConsent(b.dataset.ck);
      banner.hidden = true;
    });
    document.body.appendChild(banner);
  }
  banner.hidden = false;
  banner.querySelector('[data-ck="todas"]').focus({ preventScroll: true });
}

// politica: enlace a la política de cookies relativo a la página actual
export function initCookies({ politica = 'politica-de-cookies/' } = {}) {
  if (!getConsent()) mostrar(politica);
  // Cualquier botón con data-cookies-abrir vuelve a mostrar el aviso
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-cookies-abrir]')) return;
    e.preventDefault();
    mostrar(politica);
  });
}
