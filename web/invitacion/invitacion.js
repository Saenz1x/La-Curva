// Invitación a la fiesta de Navidad: fuentes, cuenta regresiva, nieve, calendario y confirmación por correo
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/playfair-display/latin-500.css';
import '@fontsource/playfair-display/latin-600.css';
import '@fontsource/playfair-display/latin-500-italic.css';
import '@fontsource/playfair-display/latin-600-italic.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import './invitacion.css';

// ===== Datos del evento =====
const EVENTO = {
  titulo: 'Fiesta de Navidad PVC La Curva',
  inicio: '2026-12-06T16:00:00-05:00', // hora de Colombia
  horas: 4, // duración estimada, solo para el calendario
  lugar: 'Salón de eventos Caramelo, Calle 5 #14-55, sector Isla, Buenaventura',
};
// Las confirmaciones llegan a gestionhumanapvclacurva@gmail.com por FormSubmit (formsubmit.co).
// FORM_ID es el correo o, mejor, el código que FormSubmit da al activarlo (así la dirección no queda a la vista).
// Para cambiar de correo, pon aquí la dirección nueva, activa el formulario desde el correo que llega
// y reemplázala por el código nuevo que FormSubmit indica.
const FORM_ID = 'gestionhumanapvclacurva@gmail.com';
const CORREO = 'gestionhumanapvclacurva@gmail.com'; // solo para el enlace de respaldo cuando falla el envío

const $ = (s) => document.querySelector(s);
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const inicio = new Date(EVENTO.inicio);

/* ---------- cuenta regresiva ---------- */
function cuenta() {
  const ms = inicio - Date.now();
  const box = $('#cuenta');
  if (ms <= 0) {
    box.innerHTML = `<p class="cuenta__fin">${ms > -EVENTO.horas * 3600e3 ? '¡La fiesta es hoy!' : '¡Gracias por celebrar con nosotros!'}</p>`;
    return false;
  }
  const d = Math.floor(ms / 864e5);
  const h = Math.floor((ms % 864e5) / 36e5);
  const m = Math.floor((ms % 36e5) / 6e4);
  const s = Math.floor((ms % 6e4) / 1e3);
  for (const [k, v] of Object.entries({ d, h, m, s })) box.querySelector(`[data-u="${k}"]`).textContent = String(v).padStart(2, '0');
  return true;
}
if (cuenta()) { const t = setInterval(() => { if (!cuenta()) clearInterval(t); }, 1000); }

/* ---------- agregar al calendario ---------- */
const fin = new Date(inicio.getTime() + EVENTO.horas * 3600e3);
const utc = (dt) => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
$('#cal-google').href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(EVENTO.titulo)}&dates=${utc(inicio)}/${utc(fin)}&location=${encodeURIComponent(EVENTO.lugar)}&ctz=America/Bogota`;
$('#cal-ics').addEventListener('click', () => {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PVC La Curva//Invitacion//ES', 'BEGIN:VEVENT',
    `UID:navidad-2026@pvclacurva.com`, `DTSTAMP:${utc(new Date())}`, `DTSTART:${utc(inicio)}`, `DTEND:${utc(fin)}`,
    `SUMMARY:${EVENTO.titulo}`, `LOCATION:${EVENTO.lugar.replace(/,/g, '\\,')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'fiesta-navidad-pvc-la-curva.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

/* ---------- nieve ---------- */
function nieve() {
  const c = $('#nieve');
  const ctx = c.getContext('2d');
  let w, h, copos;
  const crear = () => {
    w = c.width = innerWidth * devicePixelRatio;
    h = c.height = innerHeight * devicePixelRatio;
    copos = Array.from({ length: Math.min(60, Math.round(innerWidth / 18)) }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: (Math.random() * 1.4 + 0.5) * devicePixelRatio, a: Math.random() * 0.5 + 0.25,
      v: (Math.random() * 0.35 + 0.2) * devicePixelRatio, o: Math.random() * Math.PI * 2,
    }));
  };
  crear();
  addEventListener('resize', crear);
  (function paso() {
    ctx.clearRect(0, 0, w, h);
    for (const p of copos) {
      p.y += p.v; p.o += 0.01; p.x += Math.sin(p.o) * 0.3 * devicePixelRatio;
      if (p.y > h) { p.y = -5; p.x = Math.random() * w; }
      ctx.fillStyle = `rgba(255,248,235,${p.a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(paso);
  })();
}
if (!reduce) nieve();

/* ---------- confirmación de asistencia ---------- */
const f = $('#rsvp');
const msg = $('#rsvp-msg');
const btn = f.querySelector('button[type=submit]');
const digitos = (v) => (v || '').replace(/\D/g, '');

function error(campo, texto) {
  const w = campo.closest('.campo');
  w.classList.toggle('mal', !!texto);
  w.querySelector('.err').textContent = texto || '';
  return !texto;
}

function validar() {
  let ok = true;
  ok = error(f.nombre, f.nombre.value.trim().split(/\s+/).length < 2 ? 'Escribe tu nombre y apellido.' : '') && ok;
  ok = error(f.celular, /^3\d{9}$/.test(digitos(f.celular.value)) ? '' : 'Escribe un celular de 10 dígitos que empiece por 3.') && ok;
  ok = error(f.querySelector('[name=asistencia]'), f.asistencia.value ? '' : 'Cuéntanos si vas a asistir.') && ok;
  return ok;
}

f.addEventListener('input', () => { if (f.querySelector('.mal')) validar(); });
f.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  if (f._honey.value) return; // bot
  if (!validar()) { f.querySelector('.mal input')?.focus(); return; }
  const va = f.asistencia.value === 'Sí';
  const datos = {
    'Nombre': f.nombre.value.trim(),
    'Celular': digitos(f.celular.value),
    '¿Asistirá?': f.asistencia.value,
    'Comentario': f.comentario.value.trim() || '—',
    'Fecha de respuesta': new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
    _subject: `Fiesta de Navidad · ${va ? 'Confirma' : 'No asiste'}: ${f.nombre.value.trim()}`,
    _template: 'table',
    _captcha: 'false',
  };
  btn.disabled = true;
  btn.textContent = 'Enviando…';
  try {
    const r = await fetch(`https://formsubmit.co/ajax/${FORM_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(datos),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || r.status);
    $('#ok-nombre').textContent = datos.Nombre.split(' ')[0];
    $('#ok-texto').textContent = va
      ? 'Te esperamos el domingo 6 de diciembre a las 4:00 p. m. en el Salón de eventos Caramelo.'
      : 'Gracias por avisarnos. Te vamos a extrañar; ¡felices fiestas!';
    f.classList.add('listo');
    f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  } catch {
    btn.disabled = false;
    btn.textContent = 'Enviar confirmación';
    const cuerpo = Object.entries(datos).filter(([k]) => !k.startsWith('_')).map(([k, v]) => `${k}: ${v}`).join('\n');
    msg.innerHTML = `No pudimos enviar tu respuesta. Intenta de nuevo o <a href="mailto:${CORREO}?subject=${encodeURIComponent(datos._subject)}&body=${encodeURIComponent(cuerpo)}">envíala por correo</a>.`;
  }
});
