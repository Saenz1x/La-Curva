import { PRODUCTOS_CALC, DESPERDICIO_DEFECTO, waLink, sedesActivas, ciudadesActivas } from '../config.js';

const fmt = (n, d = 1) => n.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });

export function initCalculadora(data) {
  const f = document.getElementById('calc-form');
  // Sedes agrupadas por ciudad; las que no tienen número propio van a la línea general, nombrando la sede en el mensaje
  const sedes = sedesActivas(data);
  f.producto.innerHTML = PRODUCTOS_CALC.map((p) => `<option value="${p.id}">${p.nombre}</option>`).join('');
  f.sede.innerHTML =
    ciudadesActivas(data).map((c) => `<optgroup label="${c.nombre}">${sedes
      .filter((s) => s.ciudad === c.nombre)
      .map((s) => `<option value="${s.whatsapp || data.general.telefono}" data-nombre="${s.nombre}">Sede ${s.nombre}${s.direccion ? ` · ${s.direccion}` : ''}</option>`)
      .join('')}</optgroup>`).join('') +
    `<optgroup label="Todo el país"><option value="${data.general.telefono}" data-nombre="">Línea general · ${data.general.telefono_texto}</option></optgroup>`;
  f.desperdicio.value = DESPERDICIO_DEFECTO;

  const out = {
    m2: document.getElementById('calc-m2'),
    piezas: document.getElementById('calc-piezas'),
    note: document.getElementById('calc-note'),
    desp: document.getElementById('desp-val'),
    wa: document.getElementById('calc-wa'),
    floor: document.getElementById('calc-floor'),
    fl: document.getElementById('calc-floor-l'),
    fa: document.getElementById('calc-floor-a'),
  };

  const update = () => {
    const largo = Math.max(0, parseFloat(String(f.largo.value).replace(',', '.')) || 0);
    const ancho = Math.max(0, parseFloat(String(f.ancho.value).replace(',', '.')) || 0);
    const desp = +f.desperdicio.value;
    const p = PRODUCTOS_CALC.find((x) => x.id === f.producto.value);
    const area = largo * ancho;
    const porPieza = p.m2PorPieza ?? p.ancho * p.largo;
    const piezas = area > 0 ? Math.ceil((area * (1 + desp / 100)) / porPieza) : 0;

    // piso en perspectiva que cambia de proporción con las medidas
    const mx = Math.max(largo, ancho, 0.1);
    out.floor.style.width = `${Math.max(36, (largo / mx) * 190)}px`;
    out.floor.style.height = `${Math.max(36, (ancho / mx) * 190)}px`;
    out.fl.textContent = `${fmt(largo)} m`;
    out.fa.textContent = `${fmt(ancho)} m`;

    f.desperdicio.style.setProperty('--fill', `${(desp / 25) * 100}%`);
    out.desp.textContent = `${desp}%`;
    out.m2.textContent = `${fmt(area)} m²`;
    out.piezas.textContent = piezas ? `${piezas} ${p.unidad}` : '—';
    out.note.textContent = p.m2PorPieza
      ? `Calculado con ${fmt(porPieza)} m² por caja (medida por confirmar en tienda).`
      : `Calculado con piezas de ${fmt(p.ancho, 2)} × ${fmt(p.largo, 2)} m (medida por confirmar en tienda).`;

    const opt = f.sede.selectedOptions[0];
    const nombre = opt.dataset.nombre;
    const saludo = nombre ? `Hola PVC La Curva sede ${nombre}` : 'Hola PVC La Curva';
    const texto =
      `${saludo}, vengo de la página web y quiero información sobre ${p.nombre}.\n` +
      `Mi espacio mide ${fmt(largo)} × ${fmt(ancho)} m = ${fmt(area)} m².\n` +
      `La calculadora me dio aprox. ${piezas} ${p.unidad} (con ${desp}% de desperdicio). ¿Me confirman disponibilidad y precio?`;
    out.wa.href = waLink(opt.value, texto);
    out.wa.toggleAttribute('aria-disabled', !piezas);
    out.wa.style.pointerEvents = piezas ? '' : 'none';
    out.wa.style.opacity = piezas ? '' : '0.5';
  };

  f.addEventListener('input', update);
  f.addEventListener('change', update);
  f.addEventListener('submit', (e) => e.preventDefault());
  update();
}
