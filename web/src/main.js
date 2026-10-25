import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/montserrat/latin-800.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import './styles.css';
import { initWhatsapp } from './modules/whatsapp.js';
import { initSedes } from './modules/sedes.js';
import { initProductos } from './modules/productos.js';
import { initHumedad } from './modules/humedad.js';
import { initCalculadora } from './modules/calculadora.js';
import {
  initNav, initHero, initMotion, initPointer, initInstalacion, initAntesDespues, initComparativo,
  initReels, initFooter, initMayoristas,
} from './modules/extras.js';

document.documentElement.classList.add('js');
// ?movimiento en la URL fuerza todas las animaciones (útil para revisar en equipos con "reducir movimiento")
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches && !/[?&]movimiento/.test(location.search);
const opts = { reduce };

initNav();
initHero(opts);
initProductos();
initHumedad(opts);
initInstalacion(opts);
initAntesDespues(opts);
initComparativo();
initReels();
initPointer(opts);
initFooter();

fetch('data/sedes.json')
  .then((r) => r.json())
  .then((data) => {
    initWhatsapp(data);
    initSedes(data, opts);
    initCalculadora(data);
    initMayoristas(data);
  })
  .catch((err) => console.error('No se pudo cargar sedes.json', err))
  .finally(() => initMotion(opts));
