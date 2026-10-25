// Constantes editables del sitio.

// Productos de la calculadora. Medidas por pieza en metros.
// [PENDIENTE: confirmar medida real] de cada producto con La Curva.
export const PRODUCTOS_CALC = [
  { id: 'cielo', nombre: 'Cielo raso en PVC', unidad: 'láminas', ancho: 0.25, largo: 5.95 }, // [PENDIENTE: confirmar medida real]
  { id: 'panel3d', nombre: 'Panel 3D en PVC', unidad: 'paneles', ancho: 0.5, largo: 0.5 }, // [PENDIENTE: confirmar medida real]
  { id: 'spc', nombre: 'Piso SPC', unidad: 'cajas', m2PorPieza: 2.2 }, // [PENDIENTE: confirmar m² por caja]
  { id: 'marmol', nombre: 'Lámina marmolizada', unidad: 'láminas', ancho: 1.22, largo: 2.44 }, // [PENDIENTE: confirmar medida real]
  { id: 'lamina', nombre: 'Lámina en PVC', unidad: 'láminas', ancho: 1.22, largo: 2.44 }, // [PENDIENTE: confirmar medida real]
  { id: 'adhesivo', nombre: 'Adhesivo decorativo', unidad: 'rollos', ancho: 0.45, largo: 10 }, // [PENDIENTE: confirmar medida real]
];

export const DESPERDICIO_DEFECTO = 10; // %

export const waLink = (numero, texto) =>
  `https://wa.me/${numero}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;

export const msgSede = (nombre, tema = '…') =>
  `Hola PVC La Curva sede ${nombre}, vengo de la página web y quiero información sobre ${tema}`;

// Enlace de WhatsApp de una sede. Si la sede aún no tiene número propio, va a la línea general.
export const waSede = (s, general, tema = '…') =>
  s.whatsapp
    ? waLink(s.whatsapp, msgSede(s.nombre, tema))
    : waLink(general.telefono, `Hola PVC La Curva, vengo de la página web. Quiero hablar con la sede ${s.nombre} (${s.ciudad}) sobre ${tema}`);

// Todos los números de WhatsApp de una sede (principal + adicionales)
export const numerosSede = (s) => [s.whatsapp, ...(s.whatsapp_extra || [])].filter(Boolean);

export const fmtTel = (n) => (n ? `${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}` : '');

// Google Maps (sin API key): embebido y "cómo llegar"
// Se usan coordenadas: el buscador de Google no siempre ubica bien las direcciones de Buenaventura.
const lugar = (s) => `${s.lat},${s.lng}`;
export const mapaSede = (s) => `https://maps.google.com/maps?q=${encodeURIComponent(lugar(s))}&z=16&hl=es&output=embed`;
export const mapaCiudad = (c, hayFichas) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(hayFichas ? `PVC La Curva ${c.nombre}` : `${c.nombre}, Colombia`)}&z=${c.zoom}&hl=es&output=embed`;
export const comoLlegar = (s, origen) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lugar(s))}${origen ? `&origin=${origen.lat},${origen.lng}` : ''}`;

// ----- Datos de sedes (public/data/sedes.json) -----
export const sedesActivas = (data) => data.sedes.filter((s) => s.estado === 'activa');

// Ciudades con al menos una sede activa, en el orden de sedes.json
export const ciudadesActivas = (data) => data.ciudades.filter((c) => sedesActivas(data).some((s) => s.ciudad === c.nombre));

export const ciudadDe = (s, data) => data.ciudades.find((c) => c.nombre === s.ciudad) || {};

// Correo de una sede: el propio, si no el de su ciudad, si no el nacional
export const correoSede = (s, data) => s.correo || ciudadDe(s, data).correo || data.general.correo;

// "Buenaventura, Cali y Armenia"
export const enumerar = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);
