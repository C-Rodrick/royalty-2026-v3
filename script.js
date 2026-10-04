/* ============================================================
   EDIT THIS BLOCK: couple names, date, and RSVP delivery.
   ============================================================ */
const CONFIG = {
  bride: 'Bride',                       // TODO: bride's name
  groom: 'Groom',                       // TODO: groom's name
  date: '2026-12-19T14:00:00+01:00',    // TODO: main ceremony date/time (Cameroon is UTC+1)
  rsvpBy: '',                           // e.g. 'December 1st'
  whatsapp: '',                         // couple's number, digits only with country code, e.g. '237674139843'
  formEndpoint: '',                     // optional: a Formspree URL, e.g. 'https://formspree.io/f/xxxxxxx'
  maps: {                               // paste Google Maps links for each venue
    traditional: '', court: '', church: '', reception: ''
  }
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('js');

const when = new Date(CONFIG.date);
const dateLong = isNaN(when) ? '' : when.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
$$('[data-bind]').forEach(el => {
  const k = el.dataset.bind, v = k === 'dateLong' ? dateLong : CONFIG[k];
  if (v) el.textContent = v;
});
document.title = `${CONFIG.bride} & ${CONFIG.groom} · Royalty 2026`;

/* curtain: lift once the first screen is ready (never block longer than 2.6s) */
(function () {
  let done = false;
  const go = () => { if (!done) { done = true; root.classList.add('loaded'); } };
  if (reduce) return go();
  const t0 = performance.now();
  const ready = () => setTimeout(go, Math.max(0, 900 - (performance.now() - t0)));
  const hero = $('.hero__img img');
  const imgReady = !hero || (hero.complete && hero.naturalWidth) ? Promise.resolve() : new Promise(r => { hero.addEventListener('load', r, { once: true }); hero.addEventListener('error', r, { once: true }); });
  Promise.all([imgReady, document.fonts ? document.fonts.ready : 0]).then(ready);
  setTimeout(go, 2600);
})();

/* menu */
const menu = $('#menu'), menuBtn = $('#menuBtn');
const setMenu = open => {
  menu.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open);
  $('span', menuBtn).textContent = open ? 'Close' : 'Menu'; document.body.style.overflow = open ? 'hidden' : '';
};
menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });

/* countdown */
const pad = n => String(n).padStart(2, '0');
function tick() {
  const diff = when - Date.now();
  if (isNaN(diff)) return;
  if (diff <= 0) { $('#countdown').hidden = true; $('#cdNote').textContent = 'The royal celebration has begun'; return clearInterval(timer); }
  [['#cdD', Math.floor(diff / 864e5)], ['#cdH', Math.floor(diff / 36e5) % 24], ['#cdM', Math.floor(diff / 6e4) % 60], ['#cdS', Math.floor(diff / 1e3) % 60]].forEach(([s, v]) => {
    const el = $(s), t = pad(v);
    if (el.textContent !== t) { el.textContent = t; el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip'); }
  });
}
const timer = setInterval(tick, 1000); tick();

/* chapter marker in the top bar */
const chapNow = $('#chapterNow');
const roman = { 1: 'Chapter 1', 2: 'Chapter 2', 3: 'Chapter 3', 4: 'Chapter 4' };
let chapLabel = '';
const setChapter = sec => {
  const name = sec.dataset.chapterName, c = sec.dataset.chapter;
  const label = c ? `${roman[c]} · ${name}` : name;
  if (label === chapLabel) return; chapLabel = label;
  chapNow.innerHTML = ''; const s = document.createElement('span'); s.textContent = label; chapNow.appendChild(s);
};
if ('IntersectionObserver' in window) {
  const co = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setChapter(e.target); }), { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-chapter-name]').forEach(s => co.observe(s));
}

/* statement: words light up as you read */
const st = $('#statement');
if (st) {
  const words = st.textContent.trim().split(/\s+/);
  st.textContent = ''; st.setAttribute('aria-label', words.join(' '));
  words.forEach(w => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w + ' '; s.setAttribute('aria-hidden', 'true'); st.appendChild(s); });
}
const stWords = $$('.w');

/* reveal on scroll */
$$('.roll,.schedule,.ch__photos .col,.couple__grid').forEach(p => [...p.children].forEach((c, i) => c.style.transitionDelay = `${(i % 4) * 90}ms`));
const revealEls = () => $$('[data-reveal]:not(.in),.sec-head:not(.in)');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  revealEls().forEach(el => io.observe(el));
} else revealEls().forEach(el => el.classList.add('in'));

/* scroll loop: progress line, statement, light parallax, sweep for skipped reveals */
const barLine = $('#barLine'), cols = $$('.chapter .col:nth-child(2)');
let ticking = false;
function frame() {
  ticking = false;
  const y = scrollY, max = root.scrollHeight - innerHeight;
  barLine.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  revealEls().forEach(el => { if (el.getBoundingClientRect().top < innerHeight * .94) el.classList.add('in'); });
  if (stWords.length) {
    const r = st.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .8 - r.top) / (r.height + innerHeight * .25)));
    const lit = p * stWords.length * 1.08;
    stWords.forEach((w, i) => w.style.opacity = reduce ? 1 : (i < lit ? 1 : .16));
  }
  if (!reduce && innerWidth > 1000) cols.forEach(c => {
    const r = c.parentElement.getBoundingClientRect();
    const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    c.style.transform = `translateY(${Math.max(-1, Math.min(1, p)) * -40}px)`;
  });
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
addEventListener('resize', frame); frame();

/* events: photo follows the cursor over each row */
const peek = $('#peek');
if (peek && matchMedia('(hover:hover)').matches && !reduce) {
  const pi = $('img', peek); let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  const loop = () => { x += (tx - x) * .14; y += (ty - y) * .14; peek.style.transform = `translate3d(${x}px,${y}px,0) rotate(${(tx - x) * .03}deg)`; raf = (Math.abs(tx - x) + Math.abs(ty - y) > .3 || peek.classList.contains('on')) ? requestAnimationFrame(loop) : 0; };
  $$('.row').forEach(r => {
    r.addEventListener('mouseenter', () => { pi.src = r.dataset.img; peek.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop); });
    r.addEventListener('mouseleave', () => peek.classList.remove('on'));
    r.addEventListener('mousemove', e => { tx = e.clientX + 36; ty = e.clientY - 150; });
  });
}

/* lightbox */
const tiles = $$('.ph button'), lb = $('#lb'), lbImg = $('#lbImg'); let cur = 0;
function show(i) {
  cur = (i + tiles.length) % tiles.length;
  const id = tiles[cur].dataset.i;
  lbImg.src = `img/${id}-1800.webp`; lbImg.alt = $('img', tiles[cur]).alt;
  const dl = $('#lbDl'); dl.href = `downloads/Royalty-2026-${id}.jpg`; dl.setAttribute('download', `Royalty-2026-${id}.jpg`);
  $('#lbCount').textContent = `${cur + 1} / ${tiles.length}`;
  [1, -1].forEach(d => { new Image().src = `img/${tiles[(cur + d + tiles.length) % tiles.length].dataset.i}-1800.webp`; });
}
const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; };
tiles.forEach((t, i) => t.addEventListener('click', () => { lb.hidden = false; document.body.style.overflow = 'hidden'; show(i); }));
$('.lb__x').onclick = closeLb; $('.lb__p').onclick = () => show(cur - 1); $('.lb__n').onclick = () => show(cur + 1);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1);
});

/* venue links */
$$('[data-map]').forEach(a => {
  const u = CONFIG.maps[a.dataset.map];
  if (u) { a.href = u; a.target = '_blank'; a.rel = 'noopener'; }
  else { a.addEventListener('click', e => e.preventDefault()); a.setAttribute('aria-disabled', 'true'); a.title = 'Add the Google Maps link in script.js'; }
});

/* add to calendar (.ics) */
$('#addCal').addEventListener('click', () => {
  if (isNaN(when)) return;
  const f = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Royalty 2026//EN', 'BEGIN:VEVENT',
    `UID:royalty2026-${+when}@royalty`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(when)}`, `DTEND:${f(new Date(+when + 6 * 36e5))}`,
    `SUMMARY:${CONFIG.bride} & ${CONFIG.groom}: Royalty 2026`, 'DESCRIPTION:Join us for the royal celebration.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), download: 'royalty-2026.ics' });
  a.click(); URL.revokeObjectURL(a.href);
});

/* RSVP */
$('#rsvpForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, st2 = $('#rsvpStatus'); st2.className = 'form__status';
  if (!f.elements.name.value.trim() || !f.elements.contact.value.trim()) { st2.textContent = 'Please add your name and a phone or email.'; st2.classList.add('err'); return; }
  const d = Object.fromEntries(new FormData(f));
  const text = `Royalty 2026 RSVP\nName: ${d.name}\nContact: ${d.contact}\nAttending: ${d.attending}\nGuests: ${d.guests}\nMeal: ${d.meal}\nMessage: ${d.message || '-'}`;
  const thanks = 'Thank you for being part of our Royalty. ';
  const done = () => { st2.textContent = thanks; st2.insertAdjacentHTML('beforeend', '<svg class="inl-crown" viewBox="0 0 208 123" aria-hidden="true"><use href="#crown"/></svg>'); };
  if (CONFIG.formEndpoint) {
    try {
      const r = await fetch(CONFIG.formEndpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      if (!r.ok) throw 0; done(); f.reset(); return;
    } catch { st2.textContent = 'Something went wrong. Please try again or message us on WhatsApp.'; st2.classList.add('err'); }
  }
  if (CONFIG.whatsapp) { open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener'); done(); }
  else if (!CONFIG.formEndpoint) { st2.textContent = 'RSVP delivery is not set up yet. Add a WhatsApp number or form link in script.js.'; st2.classList.add('err'); }
});

/* downloads: force a real file download instead of opening the image */
(function () {
  const toast = msg => {
    let t = $('#toast');
    if (!t) { t = Object.assign(document.createElement('div'), { id: 'toast', role: 'status' }); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 3600);
  };
  document.addEventListener('click', async e => {
    const a = e.target.closest('a.dl, #lbDl');
    if (!a) return;
    e.stopPropagation();
    if (location.protocol === 'file:') { toast('Downloads work once the site is online. For now, right-click the photo and choose Save image as.'); e.preventDefault(); return; }
    e.preventDefault();
    const name = a.getAttribute('download') || a.getAttribute('href').split('/').pop();
    toast('Downloading ' + name + '…');
    try {
      const r = await fetch(a.href); if (!r.ok) throw 0;
      const url = URL.createObjectURL(await r.blob());
      const l = Object.assign(document.createElement('a'), { href: url, download: name });
      document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch { location.href = a.href; }
  });
})();

/* closing: lazy photo + gold sparkles */
(function () {
  const bg = $('[data-bg]');
  if (bg) {
    const load = () => { const im = new Image(); im.onload = () => { bg.style.backgroundImage = `url(${bg.dataset.bg})`; bg.classList.add('bg-in'); }; im.src = bg.dataset.bg; };
    if ('IntersectionObserver' in window) { const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { load(); o.disconnect(); } }, { rootMargin: '800px 0px' }); o.observe(bg); } else load();
  }
  const c = $('.sparkle'); if (!c || reduce) return;
  const x = c.getContext('2d'); let w, h, ps = [], on = false;
  const spawn = () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + .4, v: Math.random() * .45 + .1, a: Math.random() * 6.28, d: (Math.random() - .5) * .3 });
  const size = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; ps = Array.from({ length: Math.round(w / 14) }, spawn); };
  size(); addEventListener('resize', size);
  new IntersectionObserver(e => on = e[0].isIntersecting).observe(c);
  (function loop() {
    if (on) {
      x.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.v; p.x += p.d; p.a += .035; if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
        const o = .2 + .7 * Math.abs(Math.sin(p.a)); x.globalAlpha = o; x.fillStyle = '#e8d6a6';
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill();
        if (p.r > 1.7) { x.globalAlpha = o * .6; x.fillRect(p.x - p.r * 2.5, p.y - .4, p.r * 5, .8); x.fillRect(p.x - .4, p.y - p.r * 2.5, .8, p.r * 5); }
      }
    }
    requestAnimationFrame(loop);
  })();
})();


/* copy buttons for account numbers */
(function () {
  const say = msg => {
    let t = $('#toast');
    if (!t) { t = Object.assign(document.createElement('div'), { id: 'toast', role: 'status' }); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2400);
  };
  $$('[data-copy]').forEach(dd => {
    const b = Object.assign(document.createElement('button'), { type: 'button', className: 'copy', textContent: 'Copy' });
    b.setAttribute('aria-label', 'Copy ' + dd.closest('div').querySelector('dt').textContent);
    dd.appendChild(b);
    b.addEventListener('click', async () => {
      const text = dd.firstChild.textContent.trim();
      try { await navigator.clipboard.writeText(text); }
      catch { const r = document.createRange(); r.selectNodeContents(dd.firstChild.parentNode); getSelection().removeAllRanges(); getSelection().addRange(r); say('Press Ctrl+C to copy'); return; }
      b.textContent = 'Copied'; b.classList.add('done'); say('Copied: ' + text);
      setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('done'); }, 1800);
    });
  });
})();
