import { gsap } from 'gsap';
import { waLink, msgSede, waSede, fmtTel, numerosSede, mapaSede, mapaCiudad, comoLlegar } from '../config.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const CX = 320;
const CY = 280;
const LOGO_R = 92;
const TIPO_VENTA = { detal: 'Venta al detal', mayor: 'Venta al por mayor', ambas: 'Al por mayor y al detal' };

let D; // datos
let ciudadActual;
let reduce = false;
let mapaListo = false;
let sedeMapa = null;

const $ = (sel) => document.querySelector(sel);
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Posiciones alrededor del logo (mismo esquema que Animaciones/_codigo/sedes_animacion.py)
function layout(n) {
  if (n === 6) {
    return [
      [-150, -170, 'up'], [150, -170, 'up'], [215, 0, 'dn'],
      [150, 170, 'dn'], [-150, 170, 'dn'], [-215, 0, 'dn'],
    ];
  }
  if (n === 1) return [[0, -175, 'up']];
  const a0 = n % 2 ? -90 : -90 + 180 / n;
  return Array.from({ length: n }, (_, i) => {
    const a = ((a0 + (360 * i) / n) * Math.PI) / 180;
    const dx = 215 * Math.cos(a);
    const dy = 172 * Math.sin(a);
    return [dx, dy, dy < -10 ? 'up' : 'dn'];
  });
}

const sedesDe = (ciudad) => D.sedes.filter((s) => s.ciudad === ciudad && s.estado === 'activa');

/* ---------- constelación ---------- */
function buildStatic(svg) {
  const defs = el('defs', {}, svg);
  const g = el('radialGradient', { id: 'c-glow' }, defs);
  el('stop', { offset: '0', 'stop-color': '#f90000', 'stop-opacity': '.45' }, g);
  el('stop', { offset: '1', 'stop-color': '#f90000', 'stop-opacity': '0' }, g);
  el('circle', { cx: CX, cy: CY, r: 170, class: 'c-glow' }, svg);
  for (let k = 0; k < 3; k++) {
    const c = el('circle', { cx: CX, cy: CY, r: LOGO_R + 4, class: 'c-orbit' }, svg);
    c.style.animationDelay = `${k * 1.2}s`;
  }
  el('g', { class: 'c-lines' }, svg);
  el('g', { class: 'c-pins' }, svg);
  const logo = el('g', { class: 'c-logo' }, svg);
  el('image', { href: 'img/logo-circulo.webp', x: CX - LOGO_R, y: CY - LOGO_R * 0.97, width: LOGO_R * 2, height: LOGO_R * 1.94 }, logo);
}

function drawCity(ciudad, animate = true) {
  const svg = $('.constellation__svg');
  const gl = svg.querySelector('.c-lines');
  const gp = svg.querySelector('.c-pins');
  const sedes = sedesDe(ciudad);
  const pos = layout(sedes.length);

  const build = () => {
    svg.setAttribute('viewBox', sedes.length === 1 ? '0 40 640 400' : '0 0 640 560');
    gl.innerHTML = '';
    gp.innerHTML = '';
    sedes.forEach((s, i) => {
      const [dx, dy, side] = pos[i];
      const px = CX + dx;
      const py = CY + dy;
      const L_ = Math.hypot(dx, dy);
      const ux = dx / L_;
      const uy = dy / L_;
      const line = el('line', {
        class: 'c-line', x1: CX + ux * (LOGO_R + 6), y1: CY + uy * (LOGO_R + 6),
        x2: px - ux * 40, y2: py - uy * 40,
      }, gl);
      line.dataset.x2 = px - ux * 40;
      line.dataset.y2 = py - uy * 40;

      // Cada pin vive en su propio sistema de coordenadas (centrado en 0,0) para que
      // halo, ícono y animaciones escalen siempre desde el mismo centro.
      const g = el('g', { class: 'c-pin', tabindex: '0', role: 'button', 'aria-label': `Sede ${s.nombre}`, 'data-id': s.id, transform: `translate(${px} ${py})` }, gp);
      const pinG = el('g', { class: 'pin-wrap' }, g);
      const hov = el('g', { class: 'pin-hov' }, pinG);
      el('circle', { class: 'halo', cx: 0, cy: 0, r: 34 }, hov);
      el('use', { href: '#i-pin', x: -20, y: -22, width: 40, height: 40, class: 'pin' }, hov);
      const t = el('text', { x: 0, y: side === 'up' ? -50 : 62, 'text-anchor': 'middle' }, g);
      t.textContent = sedes.length === 1 ? `Sede ${s.nombre}` : s.nombre;
      g.addEventListener('click', () => selectSede(s));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectSede(s);
        }
      });
    });

    if (!animate || reduce) return;
    const tl = gsap.timeline();
    tl.fromTo(svg.querySelector('.c-logo'), { scale: 0.4, opacity: 0, rotate: -40, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.8)' });
    gl.querySelectorAll('line').forEach((ln, i) => {
      const x1 = +ln.getAttribute('x1');
      const y1 = +ln.getAttribute('y1');
      tl.fromTo(ln, { attr: { x2: x1, y2: y1 } }, { attr: { x2: +ln.dataset.x2, y2: +ln.dataset.y2 }, duration: 0.5, ease: 'power3.out' }, 0.25 + i * 0.16);
    });
    gp.querySelectorAll('.c-pin').forEach((p, i) => {
      const at = 0.45 + i * 0.16;
      const w = p.querySelector('.pin-wrap');
      tl.fromTo(w, { scale: 0, y: 0 }, { scale: 1, duration: 0.55, ease: 'back.out(2.2)' }, at);
      tl.to(w, { y: -8, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, at + 0.35);
      tl.fromTo(p.querySelector('text'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, at + 0.15);
    });
  };

  if (animate && !reduce && gp.children.length) {
    gp.style.pointerEvents = 'none'; // evita tocar un pin de la ciudad anterior mientras se va
    gsap.to([gl, gp], { opacity: 0, duration: 0.25, onComplete: () => { gsap.set([gl, gp], { opacity: 1 }); gp.style.pointerEvents = ''; build(); } });
  } else build();
}

/* ---------- tarjeta ---------- */
function foto(s) {
  if (!s.foto) return `<div class="sede-card__noimg"><img src="img/logo-circulo-sm.webp" alt="" /></div>`;
  return `<picture><source srcset="${s.foto}.webp" type="image/webp" /><img class="sede-card__img" src="${s.foto}.jpg" alt="Fachada de la sede ${esc(s.nombre)} de PVC La Curva" loading="lazy" /></picture>`;
}

function cardOverview(ciudad) {
  const sedes = sedesDe(ciudad);
  if (sedes.length === 1) return selectSede(sedes[0], { quiet: true });
  const card = $('#sede-card');
  card.innerHTML = `
    <div class="sede-card__noimg"><img src="img/logo-circulo-sm.webp" alt="" /></div>
    <div>
      <p class="sede-card__kicker">${esc(ciudad)}</p>
      <h3>${sedes.length} sedes para atenderte</h3>
      <p class="small muted" style="margin:0">Toca un pin o elige aquí:</p>
    </div>
    <div class="chips" style="grid-column:1/-1">${sedes.map((s) => `<button class="chip" data-sede="${s.id}">${esc(s.nombre)}</button>`).join('')}</div>`;
  card.hidden = false;
  card.querySelectorAll('[data-sede]').forEach((b) => b.addEventListener('click', () => selectSede(D.sedes.find((x) => x.id === b.dataset.sede))));
}

function selectSede(s, { quiet = false, origen = null } = {}) {
  document.querySelectorAll('.c-pin').forEach((p) => p.classList.toggle('is-active', p.dataset.id === s.id));
  const card = $('#sede-card');
  const info = [
    s.direccion && `<li><svg><use href="#i-pin"/></svg><span>${esc(s.direccion)}</span></li>`,
    s.horario && `<li><svg><use href="#i-clock"/></svg><span>${esc(s.horario)}</span></li>`,
    s.tipo_venta && TIPO_VENTA[s.tipo_venta] && `<li><svg><use href="#i-store"/></svg><span>${TIPO_VENTA[s.tipo_venta]}</span></li>`,
    Array.isArray(s.productos) && s.productos.length && `<li><svg><use href="#i-box"/></svg><span>${s.productos.map(esc).join(' · ')}</span></li>`,
    s.whatsapp
      ? `<li><svg><use href="#i-wa"/></svg><span>${numerosSede(s).map((n) => `<a class="nowrap" href="${waLink(n, msgSede(s.nombre))}" target="_blank" rel="noopener">${fmtTel(n)}</a>`).join(' · ')}</span></li>`
      : `<li><svg><use href="#i-wa"/></svg><span>Te atendemos por la línea general <span class="nowrap">${esc(D.general.telefono_texto)}</span></span></li>`,
    `<li><svg><use href="#i-mail"/></svg><a class="nowrap" href="mailto:${esc(s.correo || D.general.correo)}">${esc(s.correo || D.general.correo)}</a></li>`,
  ].filter(Boolean);
  card.innerHTML = `
    ${foto(s)}
    <div>
      <p class="sede-card__kicker">Sede · ${esc(s.ciudad)}</p>
      <h3>${esc(s.nombre)}</h3>
      <ul>${info.join('')}</ul>
    </div>
    <div class="sede-card__actions">
      <a class="btn btn--red" href="${waSede(s, D.general)}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg> Escribir por WhatsApp</a>
      <a class="btn btn--glass" href="${comoLlegar(s, origen)}" target="_blank" rel="noopener"><svg><use href="#i-route"/></svg> Cómo llegar</a>
    </div>`;
  card.hidden = false;
  showOnMap(s, origen);
  if (quiet) return;
  if (!reduce) gsap.fromTo(card, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' });
  if (window.matchMedia('(max-width: 999px)').matches) {
    const r = card.getBoundingClientRect();
    if (r.top > window.innerHeight * 0.75 || r.bottom > window.innerHeight) card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }
}

/* ---------- selector de ciudad (píldora deslizante) ---------- */
function movePill() {
  const tabs = $('.city-tabs');
  const on = tabs.querySelector('.city-tab[aria-selected="true"]');
  if (!on) return;
  const pill = tabs.querySelector('.city-tabs__pill');
  pill.style.width = `${on.offsetWidth}px`;
  pill.style.transform = `translateX(${on.offsetLeft}px)`;
}

function buildTabs() {
  const tabs = $('.city-tabs');
  tabs.insertAdjacentHTML('beforeend', D.ciudades
    .filter((c) => sedesDe(c.nombre).length)
    .map((c) => `<button class="city-tab" role="tab" aria-selected="false" data-ciudad="${esc(c.nombre)}">${esc(c.nombre)}</button>`)
    .join(''));
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ciudad]');
    if (b) setCity(b.dataset.ciudad);
  });
  tabs.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const all = [...tabs.querySelectorAll('.city-tab')];
    const i = all.findIndex((b) => b.dataset.ciudad === ciudadActual);
    const n = all[(i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length];
    n.focus();
    setCity(n.dataset.ciudad);
  });
  window.addEventListener('resize', movePill);
  document.fonts?.ready.then(movePill);
}

function setCity(ciudad, animate = true) {
  if (ciudad === ciudadActual && animate) return;
  ciudadActual = ciudad;
  document.querySelectorAll('.city-tab').forEach((b) => {
    const on = b.dataset.ciudad === ciudad;
    b.setAttribute('aria-selected', on);
    b.tabIndex = on ? 0 : -1;
  });
  movePill();
  drawCity(ciudad, animate);
  renderMapList();
  sedeMapa = null;
  cardOverview(ciudad);
  if (sedesDe(ciudad).length > 1) showCityOnMap();
}

/* ---------- Google Maps ---------- */
function renderMapList() {
  const list = $('#gmap-list');
  list.innerHTML = sedesDe(ciudadActual)
    .map((s) => `<li class="gmap__item"><button aria-pressed="false" data-map="${s.id}"><b>${esc(s.nombre)}</b><span>${s.direccion ? esc(s.direccion) : 'Ubicación aproximada'}</span></button></li>`)
    .join('');
  list.querySelectorAll('[data-map]').forEach((b) => b.addEventListener('click', () => selectSede(D.sedes.find((x) => x.id === b.dataset.map), { quiet: true })));
}

function setFrame(src) {
  const f = $('#gmap-frame');
  if (!mapaListo) { f.dataset.src = src; return; }
  if (f.getAttribute('src') !== src) f.src = src;
}

function showCityOnMap() {
  const c = D.ciudades.find((x) => x.nombre === ciudadActual);
  const conFichas = sedesDe(ciudadActual).some((s) => s.direccion);
  setFrame(mapaCiudad(c, conFichas));
  $('#gmap-open').href = `https://www.google.com/maps/search/${encodeURIComponent(`PVC La Curva ${c.nombre}`)}`;
  $('#gmap-open').lastChild.textContent = ' Abrir en Google Maps';
  $('#gmap-sub').textContent = 'Toca una sede para verla en el mapa.';
  document.querySelectorAll('[data-map]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
}

function showOnMap(s, origen = null) {
  sedeMapa = s;
  setFrame(mapaSede(s));
  $('#gmap-open').href = comoLlegar(s, origen);
  $('#gmap-open').lastChild.textContent = ' Cómo llegar';
  $('#gmap-sub').textContent = s.direccion ? `Sede ${s.nombre}: ${s.direccion}` : `Sede ${s.nombre} · ubicación aproximada`;
  document.querySelectorAll('[data-map]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.map === s.id)));
}

/* ---------- ¿cuál me queda más cerca? ---------- */
function km(a, b, c, d) {
  const R = 6371;
  const toR = (x) => (x * Math.PI) / 180;
  const dLat = toR(c - a);
  const dLng = toR(d - b);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a)) * Math.cos(toR(c)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function msg(html) {
  const m = $('#mapa-msg');
  m.innerHTML = html;
  m.hidden = false;
}

function nearest(lat, lng) {
  const activas = D.sedes.filter((s) => s.estado === 'activa' && s.lat != null);
  const best = activas.map((s) => ({ s, d: km(lat, lng, s.lat, s.lng) })).sort((a, b) => a.d - b.d)[0];
  if (!best) return;
  const dist = best.d < 1 ? `${Math.round(best.d * 1000)} m` : `${best.d.toFixed(1).replace('.', ',')} km`;
  if (best.s.ciudad !== ciudadActual) setCity(best.s.ciudad);
  const origen = { lat, lng };
  selectSede(best.s, { origen });
  msg(
    best.d > 60
      ? `La sede más cercana es <b>${esc(best.s.nombre)}</b> (${esc(best.s.ciudad)}, a unos ${dist}). Igual hacemos envíos a toda Colombia: <a class="link" href="${waSede(best.s, D.general, 'un envío')}" target="_blank" rel="noopener">escríbenos</a>.`
      : `Te queda más cerca la sede <b>${esc(best.s.nombre)}</b>, a unos ${dist} en línea recta. <a class="link" href="${comoLlegar(best.s, origen)}" target="_blank" rel="noopener">Ver la ruta en Google Maps</a>.`
  );
}

function initNearest() {
  $('#btn-cerca').addEventListener('click', () => {
    const manual = (t) => msg(`${t} Elige tu ciudad arriba y toca la sede de tu barrio para ver cómo llegar.`);
    if (!('geolocation' in navigator)) return manual('Tu navegador no comparte la ubicación.');
    msg('Buscando tu ubicación… (tu navegador te pedirá permiso)');
    navigator.geolocation.getCurrentPosition(
      (p) => nearest(p.coords.latitude, p.coords.longitude),
      () => manual('No pudimos ver tu ubicación, no pasa nada.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

export function initSedes(data, opts = {}) {
  D = data;
  reduce = !!opts.reduce;
  buildStatic($('.constellation__svg'));
  buildTabs();
  setCity(D.ciudades[0].nombre, false);
  initNearest();
  if (!reduce) gsap.set(['.c-lines', '.c-pins', '.c-logo'], { opacity: 0 });

  // Construye la constelación con animación cuando entra en pantalla
  const io = new IntersectionObserver((ents) => {
    if (ents.some((e) => e.isIntersecting)) {
      io.disconnect();
      drawCity(ciudadActual, true);
    }
  }, { threshold: 0.35 });
  io.observe($('.constellation'));

  // Carga Google Maps solo cuando el mapa se acerca
  const io2 = new IntersectionObserver((ents) => {
    if (!ents.some((e) => e.isIntersecting)) return;
    io2.disconnect();
    mapaListo = true;
    const f = $('#gmap-frame');
    if (f.dataset.src) f.src = f.dataset.src;
  }, { rootMargin: '500px' });
  io2.observe($('#mapa'));
}
