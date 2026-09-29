/* IT'S GIVING — site interactions */
(() => {
  const STORE = 'https://www.itsgivingdrinks.com';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- Flavour hero */
  const FLAVOURS = ['mango', 'apple', 'cherry'];
  const WORDS = { mango: 'MANGO', apple: 'APPLE', cherry: 'CHERRY' };
  const THEME = { mango: '#f0a412', apple: '#3f8a47', cherry: '#8d5b9c' };
  const giant = $('[data-giant]');
  const progress = $('.hero__progress span');
  const themeMeta = $('meta[name="theme-color"]');
  let current = 'mango';
  let timer;

  function setFlavour(name, user = false) {
    if (name === current && !user) return;
    current = name;
    document.body.dataset.flavour = name;
    themeMeta.setAttribute('content', THEME[name]);
    $$('[data-stage]').forEach(img => img.classList.toggle('is-active', img.dataset.stage === name));
    $$('[data-pick]').forEach(b => {
      const on = b.dataset.pick === name;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on);
    });
    giant.classList.add('out');
    setTimeout(() => { giant.textContent = WORDS[name]; giant.classList.remove('out'); }, 350);
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    if (reduced) return;
    progress.classList.remove('run');
    void progress.offsetWidth;
    progress.classList.add('run');
    timer = setTimeout(() => {
      setFlavour(FLAVOURS[(FLAVOURS.indexOf(current) + 1) % FLAVOURS.length]);
    }, 6000);
  }

  $$('[data-pick]').forEach(b => b.addEventListener('click', () => setFlavour(b.dataset.pick, true)));
  schedule();

  // Pause auto-rotate while hero is off screen
  const hero = $('.hero');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) schedule(); else clearTimeout(timer);
  }).observe(hero);

  /* ---------------------------------------------------------- Tilt */
  const stage = $('[data-tilt]');
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      stage.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
    });
    hero.addEventListener('pointerleave', () => { stage.style.transform = ''; });
  }

  /* ---------------------------------------------------------- Bubbles */
  const canvas = $('.bubbles');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, bubbles = [], running = true;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = hero.clientWidth * dpr;
      h = canvas.height = hero.clientHeight * dpr;
      const n = Math.round(Math.min(70, hero.clientWidth / 18));
      bubbles = Array.from({ length: n }, () => spawn(true));
    };
    const spawn = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 20 * dpr,
      r: (2 + Math.random() * 9) * dpr,
      v: (0.3 + Math.random() * 1.1) * dpr,
      wob: Math.random() * Math.PI * 2,
      a: 0.25 + Math.random() * 0.45,
    });
    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const b of bubbles) {
        b.y -= b.v; b.wob += 0.03; b.x += Math.sin(b.wob) * 0.4 * dpr;
        if (b.y < -20 * dpr) Object.assign(b, spawn(false));
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${b.a})`;
        ctx.lineWidth = 1.5 * dpr;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.a + 0.2})`;
        ctx.fill();
      }
      requestAnimationFrame(tick);
    };
    resize();
    addEventListener('resize', resize);
    new IntersectionObserver(([e]) => {
      const was = running; running = e.isIntersecting;
      if (running && !was) tick();
    }).observe(hero);
    tick();
  }

  /* ---------------------------------------------------------- Nav */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > hero.offsetHeight - 80);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('[data-burger]');
  const menu = $('[data-mobile-menu]');
  const toggleMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggleMenu(menu.hidden));
  $$('a', menu).forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------------------------------------------------------- Reveal + counters */
  const countUp = (el) => {
    const to = +el.dataset.count;
    if (reduced) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const delay = el.classList.contains('card') ? $$('.card').indexOf(el) * 120 : 0;
      setTimeout(() => el.classList.add('is-in'), delay);
      $$('[data-count]', el).forEach(countUp);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .card').forEach(el => io.observe(el));

  /* ---------------------------------------------------------- Quantity steppers */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-qty] [data-step]');
    if (!btn || btn.closest('[data-line]')) return;
    const out = $('output', btn.closest('[data-qty]'));
    out.textContent = Math.max(1, Math.min(20, +out.textContent + +btn.dataset.step));
  });

  /* ---------------------------------------------------------- Cart */
  const KEY = 'itsgiving-cart';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch { /* storage unavailable */ } };
  const money = (n) => '£' + n.toFixed(2);

  const drawer = $('[data-drawer]');
  const scrim = $('.drawer-scrim');
  const itemsEl = $('[data-cart-items]');
  const countEl = $('[data-cart-count]');

  function render() {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    const total = cart.reduce((n, i) => n + i.qty * i.price, 0);
    countEl.textContent = count;
    $('[data-cart-total]').textContent = money(total);
    $('[data-cart-empty]').hidden = cart.length > 0;
    $('[data-cart-foot]').hidden = cart.length === 0;
    itemsEl.hidden = cart.length === 0;
    itemsEl.innerHTML = cart.map(i => `
      <div class="line-item" data-line="${i.id}">
        <img src="${i.img}" alt="">
        <div>
          <h4>${i.name}</h4>
          <small>${i.variant}</small>
          <div class="qty" data-qty>
            <button type="button" aria-label="Decrease quantity" data-step="-1">−</button>
            <output>${i.qty}</output>
            <button type="button" aria-label="Increase quantity" data-step="1">+</button>
          </div>
        </div>
        <div class="line-item__price">${money(i.qty * i.price)}
          <button type="button" class="line-item__remove" data-remove>Remove</button>
        </div>
      </div>`).join('');
    const perma = cart.map(i => `${i.id}:${i.qty}`).join(',');
    $('[data-checkout]').href = perma ? `${STORE}/cart/${perma}` : '#';
    save();
  }

  itemsEl.addEventListener('click', (e) => {
    const line = e.target.closest('[data-line]');
    if (!line) return;
    const item = cart.find(i => i.id === line.dataset.line);
    const step = e.target.closest('[data-step]');
    if (step) item.qty = Math.min(20, item.qty + +step.dataset.step);
    if (e.target.closest('[data-remove]') || item.qty < 1) cart = cart.filter(i => i !== item);
    render();
  });

  function openCart() {
    scrim.hidden = false;
    void scrim.offsetWidth; // commit the un-hidden state so the fade transitions
    scrim.classList.add('is-open');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('.drawer__close').focus();
  }
  function closeCart() {
    scrim.classList.remove('is-open');
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { scrim.hidden = true; }, 350);
  }
  $$('[data-open-cart]').forEach(b => b.addEventListener('click', openCart));
  $$('[data-close-cart]').forEach(b => b.addEventListener('click', closeCart));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCart(); if (!menu.hidden) toggleMenu(false); } });

  const toast = $('[data-toast]');
  let toastT;
  const say = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('is-on'), 2600);
  };

  $$('[data-add]').forEach(btn => btn.addEventListener('click', () => {
    const qtyEl = $('[data-qty] output', btn.parentElement);
    const qty = qtyEl ? +qtyEl.textContent : 1;
    const { add: id, name, variant, price, img } = btn.dataset;
    const found = cart.find(i => i.id === id);
    if (found) found.qty = Math.min(20, found.qty + qty);
    else cart.push({ id, name, variant, price: +price, img, qty });
    render();
    countEl.classList.remove('bump'); void countEl.offsetWidth; countEl.classList.add('bump');
    if (qtyEl) qtyEl.textContent = 1;
    const label = btn.textContent;
    btn.textContent = 'Added ✓';
    setTimeout(() => { btn.textContent = label; }, 1400);
    say(`${qty} × ${name} added to your basket`);
  }));

  render();

  /* ---------------------------------------------------------- Misc */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
