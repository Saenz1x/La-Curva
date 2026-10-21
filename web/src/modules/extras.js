import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { waSede, fmtTel, numerosSede } from '../config.js';
import { closeWa } from './whatsapp.js';

gsap.registerPlugin(ScrollTrigger);
const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- menú + barra inferior ---------- */
export function initNav() {
  const nav = document.getElementById('nav');
  const burger = nav.querySelector('.nav__burger');
  const menu = document.getElementById('menu-movil');
  const dock = document.querySelector('.dock');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    // en celular el menú se esconde al bajar y vuelve al subir
    const down = y > lastY + 4 && y > 400;
    const up = y < lastY - 4;
    if (menu.hidden && (down || up)) nav.classList.toggle('is-hidden', down);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const close = () => { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
  burger.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      closeWa();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(menu.querySelectorAll('a'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'power3.out' });
      }
    }
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) close(); });

  // enlace activo (menú de escritorio y barra inferior)
  const marcar = (links) => links.forEach((a) => {
    const sec = document.querySelector(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 55%', end: 'bottom 45%', onToggle: (s) => a.classList.toggle('is-active', s.isActive) });
  });
  marcar([...nav.querySelectorAll('.nav__links a')]);
  marcar([...dock.querySelectorAll('a')]);
}

/* ---------- hero ---------- */
export function initHero({ reduce }) {
  if (reduce) {
    // movimiento reducido: solo fundidos y el subrayado rojo
    gsap.from('.hero .kicker, .hero__lead, .hero__ctas, .hero__chips, .hero__side > *', { opacity: 0, duration: 0.8, stagger: 0.08, delay: 0.1 });
    gsap.fromTo('.hero__title em', { '--u': 0 }, { '--u': 1, duration: 0.9, ease: 'power3.inOut', delay: 0.4 });
    return;
  }
  const tl = gsap.timeline({ delay: 0.1 });
  // el titular sube con CSS (arranca en el primer pintado y no retrasa el LCP)
  tl.fromTo('.hero__title em', { '--u': 0 }, { '--u': 1, duration: 0.9, ease: 'power3.inOut' }, 0.6)
    .from('.hero .kicker, .hero__lead, .hero__ctas, .hero__chips', { y: 20, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.35)
    .from('.hero__side > *', { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.15 }, 0.6);
  // paralaje leve
  gsap.to('.hero__media', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { yPercent: -10, opacity: 0.3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: true } });
  gsap.to('.hero__side', { y: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

/* ---------- títulos palabra por palabra ---------- */
function split(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.innerHTML = `<span>${part}</span>`;
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  return el.querySelectorAll('.w > span');
}

/* ---------- animaciones de scroll ---------- */
export function initMotion({ reduce }) {
  // barra de progreso de lectura
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  // cinta de productos: avanza sola y acelera con la velocidad del scroll
  const track = document.querySelector('.marquee__track');
  track.innerHTML += track.innerHTML; // duplicado para el bucle
  const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  if (reduce) {
    // movimiento reducido: la cinta va muy lenta y las secciones aparecen con fundidos, sin desplazamientos
    loop.timeScale(0.25);
    document.querySelectorAll('[data-split], .section .kicker, .section .lead, .prod, .stat, .hum__top, .hum__why, .calc__form, .mayor__form, .faq__item, .reel, .gmap__frame, .ba__box').forEach((n) => {
      gsap.fromTo(n, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power1.out', scrollTrigger: { trigger: n, start: 'top 92%', once: true } });
    });
    document.querySelectorAll('[data-count]').forEach((n) => {
      const o = { v: 0 };
      gsap.to(o, { v: +n.dataset.count, duration: 1.4, scrollTrigger: { trigger: n, start: 'top 95%', once: true }, onUpdate: () => (n.textContent = Math.round(o.v)) });
    });
    return;
  }
  ScrollTrigger.create({
    onUpdate: (s) => {
      const dir = s.direction || 1;
      const speed = 1 + Math.min(4, Math.abs(s.getVelocity()) / 400);
      gsap.to(loop, { timeScale: speed * dir, duration: 0.2, overwrite: true, onComplete: () => gsap.to(loop, { timeScale: dir, duration: 0.9 }) });
    },
  });

  // títulos: las palabras suben desde una máscara
  document.querySelectorAll('[data-split]').forEach((h) => {
    const words = split(h);
    gsap.from(words, { yPercent: 110, duration: 0.9, ease: 'power4.out', stagger: 0.05, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });
  // kickers: las líneas rojas se dibujan
  document.querySelectorAll('.section .kicker').forEach((k) => {
    gsap.from(k, { opacity: 0, letterSpacing: '0.6em', duration: 1, ease: 'power3.out', scrollTrigger: { trigger: k, start: 'top 92%', once: true } });
  });
  gsap.utils.toArray('.section .lead').forEach((n) => {
    gsap.from(n, { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.15, scrollTrigger: { trigger: n, start: 'top 92%', once: true } });
  });

  // tarjetas de producto: entran y la foto se revela con cortina
  ScrollTrigger.batch('.prod', {
    start: 'top 90%', once: true,
    onEnter: (els) => {
      gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true });
      els.forEach((el, i) => {
        gsap.fromTo(el.querySelector('.prod__media'), { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power4.inOut', delay: i * 0.08 });
        gsap.fromTo(el.querySelector('.prod__media img'), { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'power3.out', delay: i * 0.08, clearProps: 'transform' });
      });
    },
  });

  gsap.utils.toArray('.stat, .hum__top, .hum__why, .calc__form, .mayor__form, .mayor__list li, .faq__item, .reel, .gmap__frame').forEach((n, i) => {
    gsap.from(n, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: (i % 4) * 0.06, scrollTrigger: { trigger: n, start: 'top 94%', once: true } });
  });
  document.querySelectorAll('[data-count]').forEach((n) => {
    const to = +n.dataset.count;
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: n, start: 'top 95%', once: true }, onUpdate: () => (n.textContent = Math.round(o.v)) });
  });

  // antes/después y mayoristas: la foto entra con zoom suave y paralaje
  gsap.fromTo('.ba__box', { clipPath: 'inset(8% 8% 8% 8% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 30px)', ease: 'none', scrollTrigger: { trigger: '.ba__box', start: 'top 95%', end: 'top 45%', scrub: true } });
  gsap.fromTo('.mayor__bg img', { yPercent: -8, scale: 1.1 }, { yPercent: 8, scale: 1, ease: 'none', scrollTrigger: { trigger: '.mayor', start: 'top bottom', end: 'bottom top', scrub: true } });

  // comparativo
  const t = document.querySelector('.comp__table');
  gsap.from(t.querySelectorAll('.comp__row:not(.comp__head)'), { opacity: 0, x: -20, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 75%', once: true } });
  gsap.from(t.querySelectorAll('.bars i.on'), { scaleX: 0, duration: 0.5, stagger: 0.03, ease: 'power2.out', delay: 0.3, scrollTrigger: { trigger: t, start: 'top 75%', once: true } });
}

/* ---------- microinteracciones de escritorio ---------- */
export function initPointer({ reduce }) {
  if (reduce || !fine()) return;
  // brillo de las tarjetas de vidrio
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('[data-spot]');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  // botones magnéticos
  document.querySelectorAll('[data-magnetic]').forEach((b) => {
    const x = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
    const y = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.25); y((e.clientY - r.top - r.height / 2) * 0.35); });
    b.addEventListener('pointerleave', () => { x(0); y(0); });
  });

}

/* ---------- guía de instalación (scrollytelling) ---------- */
export function initInstalacion({ reduce }) {
  const svg = document.querySelector('.install__svg');
  const stages = [1, 2, 3, 4].map((n) => svg.querySelector(`.st${n}`));
  const dots = [...document.querySelectorAll('.install__dots li')];
  const steps = [...document.querySelectorAll('.step[data-step]')];
  svg.querySelectorAll('.draw').forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.dataset.len = len;
  });
  let current = 0;
  const show = (n) => {
    if (n === current) return;
    current = n;
    dots.forEach((d, i) => d.classList.toggle('is-on', i < n));
    steps.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === n));
    stages.forEach((g, i) => {
      const on = i < n;
      const d = reduce ? 0 : 0.9;
      g.querySelectorAll('.draw').forEach((p) => gsap.to(p, { strokeDashoffset: on ? 0 : +p.dataset.len, duration: d, ease: 'power2.inOut' }));
      const lams = g.querySelectorAll('.lam');
      if (lams.length) gsap.to(lams, { opacity: on ? 1 : 0, y: on ? 0 : -30, duration: reduce ? 0 : 0.5, stagger: on ? 0.07 : 0, ease: 'power3.out' });
    });
  };
  svg.querySelectorAll('.draw').forEach((p) => (p.style.strokeDashoffset = p.dataset.len));
  gsap.set(svg.querySelectorAll('.lam'), { opacity: 0, y: -30 });
  steps.forEach((s) => {
    ScrollTrigger.create({
      trigger: s, start: 'top 62%', end: 'bottom 38%',
      onEnter: () => show(+s.dataset.step),
      onEnterBack: () => show(+s.dataset.step),
      onLeaveBack: () => { if (+s.dataset.step === 1) show(0); },
    });
  });
}

/* ---------- antes / después ---------- */
export function initAntesDespues({ reduce }) {
  const box = document.getElementById('ba-box');
  const range = box.querySelector('.ba__range');
  const after = document.getElementById('ba-after');
  const FOTOS = { panel: ['img/ref/despues-panel.webp', 'Después: pared con panel 3D'], marmol: ['img/ref/despues-marmol.webp', 'Después: pared con lámina marmolizada'] };
  const setPos = (p) => { box.style.setProperty('--pos', `${p}%`); range.value = p; };
  range.addEventListener('input', () => setPos(+range.value)); // teclado
  // arrastre con dedo o mouse en cualquier punto de la foto (el scroll vertical sigue funcionando)
  let drag = false;
  const fromX = (x) => { const r = box.getBoundingClientRect(); setPos(Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100))); };
  box.addEventListener('pointerdown', (e) => { drag = true; box.classList.add('is-drag'); box.setPointerCapture(e.pointerId); fromX(e.clientX); });
  box.addEventListener('pointermove', (e) => { if (drag) fromX(e.clientX); });
  const end = () => { drag = false; box.classList.remove('is-drag'); };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  document.querySelectorAll('.ba__tabs button').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('.ba__tabs button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      const [src, alt] = FOTOS[b.dataset.finish];
      gsap.to(after, { opacity: 0, duration: reduce ? 0 : 0.25, onComplete: () => { after.srcset = `${src.replace('.webp', '-sm.webp')} 520w, ${src} 1400w`; after.src = src; after.alt = alt; after.onload = () => gsap.to(after, { opacity: 1, duration: 0.35 }); } });
    })
  );
  // "guiño" la primera vez que aparece, para que se entienda que se arrastra
  if (reduce) return;
  ScrollTrigger.create({
    trigger: box, start: 'top 60%', once: true,
    onEnter: () => {
      const o = { p: 50 };
      gsap.timeline()
        .to(o, { p: 25, duration: 0.7, ease: 'power2.inOut', onUpdate: () => setPos(o.p) })
        .to(o, { p: 70, duration: 0.9, ease: 'power2.inOut', onUpdate: () => setPos(o.p) })
        .to(o, { p: 50, duration: 0.6, ease: 'power2.out', onUpdate: () => setPos(o.p) });
    },
  });
}

/* ---------- comparativo ---------- */
// Escala 1–3 (3 = mejor). Costo: $ a $$$ (relativo, sin cifras).
const COMP = [
  { label: 'Resistencia a la humedad', vals: [3, 1, 3] },
  { label: 'Limpieza', vals: [3, 1, 2] },
  { label: 'Instalación', vals: [3, 2, 1], notas: ['Rápida', 'Media', 'Lenta'] },
  { label: 'Peso', vals: [3, 2, 1], notas: ['Liviano', 'Medio', 'Pesado'] },
  { label: 'Costo relativo', costo: ['$', '$$', '$$$'] },
];
export function initComparativo() {
  const t = document.querySelector('.comp__table');
  t.insertAdjacentHTML('beforeend', COMP.map((r) => `
    <div class="comp__row" role="row">
      <span class="comp__label" role="rowheader">${r.label}</span>
      ${[0, 1, 2].map((i) => `<span class="comp__cell${i === 0 ? ' is-pvc' : ''}" role="cell">
        ${r.costo ? `<b role="img" aria-label="costo ${['bajo', 'medio', 'alto'][i]}">${r.costo[i]}</b>` : `<span class="bars" role="img" aria-label="${r.vals[i]} de 3">${[1, 2, 3].map((k) => `<i class="${k <= r.vals[i] ? 'on' : ''}"></i>`).join('')}</span>`}
        ${r.notas ? `<small>${r.notas[i]}</small>` : ''}
      </span>`).join('')}
    </div>`).join(''));
}

/* ---------- reels ---------- */
export function initReels() {
  const reels = [...document.querySelectorAll('.reel')];
  // pósters diferidos: se cargan cuando la galería se acerca
  const io = new IntersectionObserver((ents) => {
    if (!ents.some((e) => e.isIntersecting)) return;
    io.disconnect();
    reels.forEach((r) => { const v = r.querySelector('video'); v.poster = v.dataset.poster; });
  }, { rootMargin: '600px' });
  io.observe(document.querySelector('.reels'));

  const pauseOthers = (except) => reels.forEach((r) => { if (r !== except) r.querySelector('video').pause(); });
  reels.forEach((r) => {
    const v = r.querySelector('video');
    const btn = r.querySelector('.reel__play');
    // el botón solo arranca; una vez arrancado, tocar el video pausa/reanuda (y también los controles nativos)
    btn.addEventListener('click', () => { v.setAttribute('controls', ''); v.play(); });
    v.addEventListener('play', () => { pauseOthers(r); r.classList.add('is-playing', 'has-started'); });
    v.addEventListener('pause', () => r.classList.remove('is-playing'));
    v.addEventListener('ended', () => { r.classList.remove('is-playing', 'has-started'); v.removeAttribute('controls'); v.currentTime = 0; v.load(); });
  });
  // si el video sale de pantalla, se pausa
  const io2 = new IntersectionObserver((ents) => ents.forEach((e) => { if (!e.isIntersecting) e.target.querySelector('video').pause(); }), { threshold: 0.2 });
  reels.forEach((r) => io2.observe(r));
}

/* ---------- footer ---------- */
export function initFooter(data) {
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('footer-sedes').innerHTML = data.sedes.filter((s) => s.estado === 'activa').map((s) =>
    `<li><a href="${waSede(s, data.general)}" target="_blank" rel="noopener"><b>${s.nombre}</b><span>${s.whatsapp ? numerosSede(s).map(fmtTel).join(' · ') : 'Por la línea general'}</span></a></li>`
  ).join('');
}

/* ---------- formulario mayoristas ---------- */
export function initMayoristas(data) {
  const f = document.getElementById('mayor-form');
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const t = `Hola PVC La Curva, vengo de la página web. Soy ${f.nombre.value.trim()}${f.empresa.value.trim() ? ` de ${f.empresa.value.trim()}` : ''}, desde ${f.ciudad.value.trim()}.\nQuiero información de venta al por mayor: ${f.detalle.value.trim()}`;
    window.open(`https://wa.me/${data.general.telefono}?text=${encodeURIComponent(t)}`, '_blank', 'noopener');
  });
}
