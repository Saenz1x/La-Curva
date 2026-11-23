// Curvi: chat de asesoría con el asistente de IA de PVC La Curva (flujo de n8n en el VPS).
// Habla con el nodo «Chat Trigger» de n8n: POST { action: 'sendMessage', sessionId, chatInput } → { output }.
// Si CURVI.chatUrl está vacío o el servidor no responde, ofrece seguir con Curvi por WhatsApp.
import './curvi.css';
import { CURVI, waLink } from '../config.js';

const ICONO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v10H9.5L5 19.5v-4H4v-10Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
const CERRAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ENVIAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 20 4l-6 16-2.5-6.5L4 12Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8a9.2 9.2 0 0 0-7.9 13.9L3 21l4.4-1.1A9.2 9.2 0 1 0 12 2.8Zm0 16.7a7.5 7.5 0 0 1-3.9-1.1l-.3-.2-2.6.7.7-2.5-.2-.3A7.5 7.5 0 1 1 12 19.5Z" fill="currentColor"/></svg>';

const SUGERENCIAS = ['¿Qué piso me sirve para un baño?', '¿Cuántas láminas necesito para 20 m²?', '¿Cómo compro al por mayor?'];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Formato básico de las respuestas: **negrita**, enlaces y saltos de línea
const formato = (t) =>
  esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>')
    .replace(/\n/g, '<br>');

const guardado = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
};

let el = null;
let ocupado = false;

function sesion() {
  let id = guardado.get('curvi-sesion');
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    guardado.set('curvi-sesion', id);
  }
  return id;
}

const linkWa = (texto = 'Hola Curvi, vengo de la página web y quiero asesoría') => waLink(CURVI.whatsapp, texto);

function burbuja(html, quien) {
  const b = document.createElement('div');
  b.className = `curvi__msg curvi__msg--${quien}`;
  b.innerHTML = html;
  el.log.append(b);
  el.log.scrollTop = el.log.scrollHeight;
  return b;
}

function respaldoWa(texto) {
  return `Ahora no puedo responderte por aquí. Sigamos por WhatsApp:<br><a class="curvi__wa" href="${linkWa(texto ? `Hola Curvi, vengo de la página web: ${texto}` : undefined)}" target="_blank" rel="noopener">${WA}Escribirle a Curvi · ${esc(CURVI.whatsappTexto)}</a>`;
}

async function enviar(texto) {
  texto = texto.trim();
  if (!texto || ocupado) return;
  ocupado = true;
  el.sug.hidden = true;
  burbuja(esc(texto), 'yo');
  const pensando = burbuja('<span class="curvi__dots"><i></i><i></i><i></i></span>', 'bot');
  pensando.setAttribute('aria-label', 'Curvi está escribiendo');
  el.input.value = '';
  try {
    if (!CURVI.chatUrl) throw new Error('sin-url');
    const ctl = new AbortController();
    const reloj = setTimeout(() => ctl.abort(), 60000);
    const r = await fetch(CURVI.chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sendMessage', sessionId: sesion(), chatInput: texto, metadata: { origen: location.pathname } }),
      signal: ctl.signal,
    });
    clearTimeout(reloj);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    const salida = (Array.isArray(data) ? data[0] : data) || {};
    const out = salida.output ?? salida.text ?? salida.respuesta;
    if (!out) throw new Error('vacio');
    pensando.innerHTML = formato(out);
  } catch {
    pensando.innerHTML = respaldoWa(texto);
  } finally {
    pensando.removeAttribute('aria-label');
    el.log.scrollTop = el.log.scrollHeight;
    ocupado = false;
    el.input.focus({ preventScroll: true });
  }
}

export function abrirCurvi(pregunta = '') {
  if (!el) return;
  el.panel.hidden = false;
  el.btn.setAttribute('aria-expanded', 'true');
  el.root.classList.add('is-open');
  if (pregunta) enviar(pregunta);
  else el.input.focus({ preventScroll: true });
}

export function cerrarCurvi() {
  if (!el) return;
  el.panel.hidden = true;
  el.btn.setAttribute('aria-expanded', 'false');
  el.root.classList.remove('is-open');
}

export function initCurvi({ privacidad = 'politica-de-privacidad/' } = {}) {
  const root = document.createElement('div');
  root.className = 'curvi';
  // Se acomoda encima del botón de WhatsApp y de la barra inferior del celular, si la página los tiene
  if (document.getElementById('wa-float')) root.classList.add('curvi--sobre-wa');
  if (document.querySelector('.dock')) root.classList.add('curvi--dock');
  root.innerHTML = `
    <section class="curvi__panel" id="curvi-panel" role="dialog" aria-label="Asesoría con Curvi" hidden>
      <header class="curvi__head">
        <span class="curvi__avatar">${ICONO}</span>
        <div><b>Curvi</b><span>Asistente con IA de PVC La Curva</span></div>
        <button type="button" class="curvi__x" aria-label="Cerrar">${CERRAR}</button>
      </header>
      <div class="curvi__log" aria-live="polite">
        <div class="curvi__msg curvi__msg--bot">¡Hola! Soy <b>Curvi</b>. Te ayudo a escoger el producto, calcular cuánto material necesitas y cómo comprarlo. ¿Qué estás pensando hacer?</div>
      </div>
      <div class="curvi__sug">${SUGERENCIAS.map((s) => `<button type="button">${esc(s)}</button>`).join('')}</div>
      <form class="curvi__form">
        <label class="curvi__sr" for="curvi-input">Escribe tu pregunta</label>
        <input id="curvi-input" autocomplete="off" maxlength="500" placeholder="Escribe tu pregunta…" />
        <button type="submit" aria-label="Enviar">${ENVIAR}</button>
      </form>
      <p class="curvi__aviso">Curvi usa IA y puede equivocarse. No compartas datos sensibles. <a href="${esc(privacidad)}">Tratamiento de datos</a></p>
    </section>
    <button type="button" class="curvi__btn" aria-expanded="false" aria-controls="curvi-panel">${ICONO}<span>Asesoría</span></button>`;
  document.body.append(root);

  el = {
    root,
    panel: root.querySelector('.curvi__panel'),
    btn: root.querySelector('.curvi__btn'),
    log: root.querySelector('.curvi__log'),
    sug: root.querySelector('.curvi__sug'),
    input: root.querySelector('input'),
  };
  el.btn.addEventListener('click', () => (el.panel.hidden ? abrirCurvi() : cerrarCurvi()));
  root.querySelector('.curvi__x').addEventListener('click', cerrarCurvi);
  root.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    enviar(el.input.value);
  });
  el.sug.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) enviar(b.textContent);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !el.panel.hidden) {
      cerrarCurvi();
      el.btn.focus();
    }
  });
  // Cualquier botón con data-curvi abre el chat (con un primer mensaje si lo trae)
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-curvi]');
    if (c && !c.closest('.curvi')) {
      e.preventDefault();
      abrirCurvi(c.dataset.curvi || '');
    }
  });
}
