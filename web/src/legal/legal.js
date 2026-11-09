// Páginas legales: fuentes propias, estilos y aviso de cookies
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/montserrat/latin-800.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import './legal.css';
import { initCookies, getConsent } from '../cookies.js';

initCookies({ politica: '../politica-de-cookies/' });

// En la política de cookies se muestra la elección actual
const estado = document.getElementById('ck-estado');
if (estado) {
  const pintar = () => {
    const c = getConsent();
    estado.textContent = c === 'todas' ? 'Aceptaste todas (el mapa de Google se muestra).' : c === 'necesarias' ? 'Solo necesarias (el mapa de Google no se carga).' : 'Aún no has elegido.';
  };
  pintar();
  document.addEventListener('lc:cookies', pintar);
}
document.getElementById('year').textContent = new Date().getFullYear();
