import { openWa } from './whatsapp.js';

// foto: imagen de referencia en img/ref (Unsplash). Cambiarla por foto propia cuando exista.
const PRODUCTOS = [
  {
    id: 'cielo', nombre: 'Cielo raso en PVC', chip: 'El más pedido', foto: 'img/ref/cielo-raso.webp',
    icons: [['i-drop', 'Resistente'], ['i-clean', 'Rápido de limpiar'], ['i-wrench', 'Fácil de instalar']],
    texto: 'El techo que aguanta el clima del Pacífico. No se daña como la pintura y se ve moderno en casa o negocio.',
    lista: [['i-shield', 'Resistente a la humedad'], ['i-clean', 'Se limpia con un trapo'], ['i-wrench', 'Instalación rápida'], ['i-home', 'Para casa o negocio']],
  },
  {
    id: 'panel3d', nombre: 'Paneles 3D en PVC', chip: 'Pared 3D', foto: 'img/ref/paneles-3d.webp',
    icons: [['i-panel', 'Relieve 3D'], ['i-sparkle', 'Estilo moderno']],
    texto: 'Paredes con relieve que cambian por completo un espacio, sin obra pesada.',
    lista: [['i-panel', 'Efecto de relieve'], ['i-drop', 'No le afecta la humedad'], ['i-store', 'Ideal para locales y salas']],
  },
  {
    id: 'spc', nombre: 'Pisos SPC', chip: 'Pisos de última', foto: 'img/ref/pisos-spc.webp',
    icons: [['i-floor', 'Acabado madera'], ['i-drop', 'Resistente']],
    texto: 'Pisos de última generación con apariencia de madera, para renovar sin romper.',
    lista: [['i-floor', 'Look de madera'], ['i-drop', 'Resistente a la humedad'], ['i-clean', 'Fácil de mantener']],
  },
  {
    id: 'marmol', nombre: 'Lámina marmolizada', chip: 'Acabado de lujo', foto: 'img/ref/marmol.webp',
    icons: [['i-gem', 'Elegancia'], ['i-sparkle', 'Brillo']],
    texto: 'El estilo del mármol sin pagar el precio del mármol. Elegancia, brillo y acabado de lujo.',
    lista: [['i-gem', 'Elegancia'], ['i-sparkle', 'Brillo'], ['i-marble', 'Acabado de lujo'], ['i-home', 'Pared, cocina, baño o negocio']],
  },
  {
    id: 'lamina', nombre: 'Láminas en PVC', chip: 'Muros y divisiones', foto: 'img/ref/laminas.webp',
    icons: [['i-sheet', 'Liviana'], ['i-drop', 'Resistente']],
    texto: 'Láminas para revestir muros y techos con acabados modernos y estructura liviana.',
    lista: [['i-feather', 'Estructura liviana'], ['i-drop', 'Resistente a la humedad'], ['i-wrench', 'Fácil de instalar']],
  },
  {
    id: 'adhesivo', nombre: 'Adhesivos decorativos', chip: 'Ladrillo y murales', foto: 'img/ref/ladrillo.webp',
    icons: [['i-brick', 'Tipo ladrillo'], ['i-sparkle', 'Murales']],
    texto: 'Adhesivos tipo ladrillo y murales para darle personalidad a una pared en minutos.',
    lista: [['i-brick', 'Tipo ladrillo'], ['i-sparkle', 'Murales decorativos'], ['i-clean', 'Se instala sin herramientas especiales']],
  },
  {
    id: 'tejas', nombre: 'Tejas', chip: 'Fabricación propia', foto: 'img/ref/tejas.webp',
    icons: [['i-roof', 'Venta directa']],
    texto: 'Fabricamos tejas y las vendemos directo en la sede María Eugenia.',
    lista: [['i-roof', 'Fabricamos tejas'], ['i-store', 'Venta directa en María Eugenia'], ['i-truck', 'Envíos a toda Colombia']],
  },
];

const icons = (arr) => arr.map(([i, t]) => `<span><svg><use href="#${i}"/></svg>${t}</span>`).join('');

export function initProductos() {
  const grid = document.getElementById('prod-grid');
  grid.innerHTML = PRODUCTOS.map(
    (p) => `
    <article class="prod" data-reveal>
      <div class="prod__inner">
        <div class="prod__face prod__front" role="button" tabindex="0" aria-label="${p.nombre}: ver detalle">
          <div class="prod__media"><img src="${p.foto}" srcset="${p.foto.replace('.webp', '-sm.webp')} 640w, ${p.foto} 900w" sizes="(max-width: 639px) 84vw, (max-width: 1039px) 46vw, 400px" alt="${p.nombre} (foto de referencia)" loading="lazy" /></div>
          <span class="chip">${p.chip}</span>
          <span class="icon-btn prod__flip" aria-hidden="true"><svg><use href="#i-plus"/></svg></span>
          <h3>${p.nombre}</h3>
          <div class="prod__icons">${icons(p.icons)}</div>
        </div>
        <div class="prod__face prod__back" aria-hidden="true">
          <button class="icon-btn" data-unflip aria-label="Volver" tabindex="-1"><svg><use href="#i-close"/></svg></button>
          <h3>${p.nombre}</h3>
          <p>${p.texto}</p>
          <ul>${p.lista.map(([i, t]) => `<li><svg><use href="#${i}"/></svg>${t}</li>`).join('')}</ul>
          <button class="btn btn--red" data-cotizar="${p.nombre}" tabindex="-1"><svg><use href="#i-wa"/></svg> Cotizar por WhatsApp</button>
        </div>
      </div>
    </article>`
  ).join('');

  const flip = (card, on) => {
    card.classList.toggle('is-flipped', on);
    card.querySelector('.prod__back').setAttribute('aria-hidden', String(!on));
    card.querySelectorAll('.prod__back button').forEach((b) => (b.tabIndex = on ? 0 : -1));
    card.querySelector('.prod__front').tabIndex = on ? -1 : 0;
    (on ? card.querySelector('[data-cotizar]') : card.querySelector('.prod__front')).focus({ preventScroll: true });
  };

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.prod');
    if (!card) return;
    const cot = e.target.closest('[data-cotizar]');
    if (cot) {
      e.stopPropagation();
      openWa(cot.dataset.cotizar);
      return;
    }
    if (e.target.closest('[data-unflip]')) return flip(card, false);
    if (e.target.closest('.prod__front')) flip(card, true);
  });
  grid.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('prod__front')) {
      e.preventDefault();
      flip(e.target.closest('.prod'), true);
    }
    if (e.key === 'Escape') {
      const card = e.target.closest('.prod.is-flipped');
      if (card) flip(card, false);
    }
  });

  // Carrusel (celular): flechas + puntos que muestran en cuál producto vas
  const cards = [...grid.children];
  const dots = document.querySelector('.prod-dots');
  dots.innerHTML = cards.map((_, i) => `<button role="tab" aria-label="Producto ${i + 1}" data-i="${i}"></button>`).join('');
  const go = (i) => {
    const c = cards[Math.max(0, Math.min(cards.length - 1, i))];
    grid.scrollTo({ left: c.offsetLeft - (grid.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' });
  };
  const actual = () => {
    const mid = grid.scrollLeft + grid.clientWidth / 2;
    return cards.reduce((best, c, i) => (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid) ? i : best), 0);
  };
  const upd = () => {
    const i = actual();
    dots.querySelectorAll('button').forEach((d, k) => d.setAttribute('aria-selected', String(k === i)));
    document.querySelector('[data-dir="-1"]').disabled = i === 0;
    document.querySelector('[data-dir="1"]').disabled = i === cards.length - 1;
  };
  dots.addEventListener('click', (e) => { const d = e.target.closest('[data-i]'); if (d) go(+d.dataset.i); });
  document.querySelectorAll('.prod-nav__btn').forEach((b) => b.addEventListener('click', () => go(actual() + +b.dataset.dir)));
  let t;
  grid.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(upd, 60); }, { passive: true });
  upd();
}
