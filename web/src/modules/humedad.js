import { gsap } from 'gsap';

const ESTADOS = [
  [0.15, 'Todavía se ve bien'],
  [0.4, 'Empieza a marcarse'],
  [0.65, 'Manchas y hongos'],
  [0.85, 'Se descascara'],
  [1.01, 'Gotea y se daña'],
];
const DIA = 7; // segundos que dura el "día de lluvia"

const hora = (f) => {
  const m = Math.round(6 * 60 + f * 12 * 60); // 6:00 a. m. → 6:00 p. m.
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  return `${h > 12 ? h - 12 : h}:${mm} ${h >= 12 ? 'p. m.' : 'a. m.'}`;
};

export function initHumedad({ reduce }) {
  const range = document.getElementById('hum-range');
  const val = document.getElementById('hum-val');
  const ring = document.querySelector('.hum__ring');
  const yeso = document.querySelector('.ceil--yeso');
  const pvc = document.querySelector('.ceil--pvc');
  const estado = document.getElementById('yeso-estado');
  const clock = document.getElementById('hum-clock');
  const play = document.getElementById('hum-play');
  const flash = document.querySelector('.hum__flash');
  const canvas = document.querySelector('.hum__rain');
  let h = 0;
  let boost = 0; // lluvia extra durante la simulación

  const set = (v) => {
    v = Math.round(v);
    range.value = v;
    h = (v - 60) / 35;
    val.textContent = `${v}%`;
    range.setAttribute('aria-valuetext', `${v} por ciento`);
    range.style.setProperty('--fill', `${h * 100}%`);
    ring.style.strokeDasharray = `${v} 100`;
    ring.style.stroke = v >= 88 ? '#f90000' : v >= 80 ? '#ff8a3d' : '#4aa3ff';
    yeso.style.setProperty('--h', h.toFixed(3));
    pvc.style.setProperty('--h', h.toFixed(3));
    estado.textContent = ESTADOS.find(([t]) => h < t)[1];
  };
  set(77);

  /* ---- simulación: un botón que inicia, pausa, reanuda y repite ---- */
  const o = { t: 0 };
  let flashes = [];
  const tl = gsap.timeline({ paused: true, onComplete: () => setBtn('done') });
  tl.to(o, {
    t: 1, duration: DIA, ease: 'none',
    onUpdate: () => {
      const f = o.t;
      set(60 + 35 * Math.min(1, gsap.parseEase('sine.inOut')(Math.min(1, f * 1.15))));
      clock.textContent = `${hora(f)} · lloviendo`;
      boost = Math.sin(f * Math.PI);
      if (!reduce && f > 0.55 && flashes.length < 3 && Math.random() < 0.012) {
        flashes.push(f);
        gsap.fromTo(flash, { opacity: 0.9 }, { opacity: 0, duration: 0.6, ease: 'power2.out' });
      }
    },
  });

  const setBtn = (st) => {
    const ic = play.querySelector('use');
    const tx = play.querySelector('span');
    play.dataset.state = st;
    play.setAttribute('aria-pressed', String(st === 'run'));
    if (st === 'run') { ic.setAttribute('href', '#i-pause'); tx.textContent = 'Pausar'; }
    else if (st === 'pause') { ic.setAttribute('href', '#i-play'); tx.textContent = 'Continuar'; }
    else if (st === 'done') { ic.setAttribute('href', '#i-redo'); tx.textContent = 'Repetir el día'; clock.textContent = `6:00 p. m. · el yeso no aguantó, el PVC sí`; boost = 0; }
    else { ic.setAttribute('href', '#i-play'); tx.textContent = 'Simular un día de lluvia'; }
  };

  play.addEventListener('click', () => {
    const st = play.dataset.state || 'idle';
    if (st === 'run') { tl.pause(); setBtn('pause'); return; }
    if (st === 'pause') { tl.play(); setBtn('run'); return; }
    flashes = [];
    tl.restart();
    setBtn('run');
    // que se vea el efecto: lleva los techos a la vista si no lo están
    const panels = document.querySelector('.hum__panels').getBoundingClientRect();
    if (panels.bottom > window.innerHeight || panels.top < 60) {
      document.getElementById('hum').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  range.addEventListener('input', () => {
    if (tl.isActive() || play.dataset.state === 'pause') { tl.pause(); setBtn('idle'); }
    boost = 0;
    clock.textContent = 'Humedad manual';
    set(+range.value);
  });

  // Lluvia en canvas, solo mientras la sección se ve (con movimiento reducido, solo durante la simulación)
  const ctx = canvas.getContext('2d');
  let drops = [];
  let raf = null;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drops = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      l: 8 + Math.random() * 14,
      v: 6 + Math.random() * 8,
    }));
  };
  const tick = () => {
    const w = canvas.offsetWidth;
    const hh = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, hh);
    if (quieto()) { raf = requestAnimationFrame(tick); return; }
    const k = Math.min(1, h + boost * 0.6);
    const n = Math.floor(30 + k * 190);
    ctx.strokeStyle = `rgba(170, 200, 235, ${0.16 + k * 0.32})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const d = drops[i];
      d.y += d.v * (0.7 + k * 1.1);
      d.x -= 0.8 + boost * 1.5;
      if (d.y > hh) { d.y = -d.l; d.x = Math.random() * (w + 60); }
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1.5 - boost * 2, d.y + d.l);
    }
    ctx.stroke();
    raf = requestAnimationFrame(tick);
  };
  const quieto = () => reduce && !tl.isActive();
  window.addEventListener('resize', resize);
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!drops.length) resize(); if (!raf) raf = requestAnimationFrame(tick); }
    else { cancelAnimationFrame(raf); raf = null; }
  }).observe(canvas.parentElement);
}
