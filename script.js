(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Countdown (resets each visit to end of local day) ---- */
  var cd = $('#cd');
  if (cd) {
    var end = new Date(); end.setHours(23, 59, 59, 999);
    var hEl = $('[data-h]', cd), mEl = $('[data-m]', cd), sEl = $('[data-s]', cd);
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var tick = function () {
      var d = Math.max(0, Math.floor((end - new Date()) / 1000));
      hEl.textContent = pad(Math.floor(d / 3600));
      mEl.textContent = pad(Math.floor((d % 3600) / 60));
      sEl.textContent = pad(d % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---- Gallery ---- */
  var thumbs = $('#thumbs'), stageImg = $('#stageImg'), order = [];
  if (thumbs) {
    order = $$('button', thumbs).map(function (b) { return b.dataset.src; });
    thumbs.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (b) select(b.dataset.src);
    });
  }
  function select(src) {
    if (stageImg) stageImg.src = src;
    $$('button', thumbs).forEach(function (b) { b.setAttribute('aria-current', b.dataset.src === src ? 'true' : 'false'); });
  }
  function step(dir) {
    var i = order.indexOf(stageImg.getAttribute('src')); if (i < 0) i = 0;
    select(order[(i + dir + order.length) % order.length]);
  }
  if ($('.stage .prev')) $('.stage .prev').addEventListener('click', function () { step(-1); });
  if ($('.stage .next')) $('.stage .next').addEventListener('click', function () { step(1); });

  /* ---- Bundle pricing ---- */
  var bundles = $('#bundles'), qtyInput = $('#qty');
  var state = { qty: 1, sets: 1, unit: 27.60, was: 35.70 };
  function eur(n) { return n.toFixed(2).replace('.', ',') + ' €'; }
  function activeBundle() { return $('[aria-pressed="true"]', bundles); }
  function recalc() {
    var b = activeBundle(); if (!b) return;
    var perSet = parseFloat(b.dataset.qty) * parseFloat(b.dataset.unit.replace(',', '.'));
    var total = perSet * state.sets;
    if ($('#ctaAmt')) $('#ctaAmt').innerHTML = eur(total);
    if ($('#stickyPrice')) $('#stickyPrice').innerHTML = eur(total);
  }
  if (bundles) {
    bundles.addEventListener('click', function (e) {
      var b = e.target.closest('.bundle'); if (!b) return;
      $$('.bundle', bundles).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      recalc();
    });
    recalc();
  }

  /* ---- Variant selectors ---- */
  function group(el, attr, out) {
    if (!el) return;
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', el).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      if (out) { var t = $(out); if (t) t.innerHTML = (b.dataset[attr] || '').replace(/ /g, ' '); }
    });
  }
  group($('#sizes'), 'v', '#sizeVal');
  group($('#swatches'), 'c', '#colorVal');

  /* ---- Quantity (number of sets) ---- */
  if (qtyInput) {
    var setQ = function (v) { v = Math.min(99, Math.max(1, v || 1)); qtyInput.value = v; state.sets = v; recalc(); };
    if ($('#qtyMinus')) $('#qtyMinus').addEventListener('click', function () { setQ((parseInt(qtyInput.value, 10) || 1) - 1); });
    if ($('#qtyPlus')) $('#qtyPlus').addEventListener('click', function () { setQ((parseInt(qtyInput.value, 10) || 1) + 1); });
    qtyInput.addEventListener('change', function () { setQ(parseInt(qtyInput.value, 10)); });
  }

  /* ---- Toast / add to cart ---- */
  var toast = $('#toast'), tt;
  function pop() { if (!toast) return; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 2200); }
  ['#addCart', '#stickyAdd', '#paypalBtn'].forEach(function (id) { var el = $(id); if (el) el.addEventListener('click', pop); });
  var cta = $('#ctaScroll');
  if (cta) cta.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(pop, 500); });

  /* ---- Video testimonial cards (placeholder feedback) ---- */
  var toastSpan = toast ? toast.querySelector('span') : null;
  function playVideo() {
    if (toastSpan) { toastSpan.textContent = 'Video folgt in Kürze'; }
    pop();
    setTimeout(function () { if (toastSpan) toastSpan.textContent = 'Zum Warenkorb hinzugefügt'; }, 2400);
  }
  $$('.vid').forEach(function (v) {
    v.addEventListener('click', playVideo);
    v.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playVideo(); } });
  });

  /* ---- Sticky announcement bar scroll shadow ---- */
  var topbar = $('.topbar');
  if (topbar) {
    var onScroll = function () { topbar.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* ---- Cart count bump on add ---- */
  var cartCount = $('#cartCount');
  function bumpCart() {
    if (!cartCount) return;
    var b = $('#bundles') ? $('[aria-pressed="true"]', $('#bundles')) : null;
    var per = b ? parseInt(b.dataset.qty, 10) : 1;
    cartCount.textContent = String((parseInt(cartCount.textContent, 10) || 0) + per * (state.sets || 1));
  }
  ['#addCart', '#stickyAdd', '#paypalBtn'].forEach(function (id) { var el = $(id); if (el) el.addEventListener('click', bumpCart); });

  /* ---- Newsletter form ---- */
  var news = $('#newsForm');
  if (news) news.addEventListener('submit', function (e) {
    e.preventDefault();
    if (toastSpan) toastSpan.textContent = 'Danke – du bist angemeldet!';
    pop();
    setTimeout(function () { if (toastSpan) toastSpan.textContent = 'Zum Warenkorb hinzugefügt'; }, 2400);
    news.reset();
  });

  /* ---- Sticky mobile bar ---- */
  var bar = $('#stickybar'), pdp = $('.pdp');
  if (bar && pdp && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) bar.classList.remove('show');
        else if (en.boundingClientRect.top < 0) bar.classList.add('show');
      });
    }, { threshold: 0 }).observe(pdp);
  }

  /* ---- Mobile drawer ---- */
  var drawer = $('#mDrawer'), scrim = $('#mScrim');
  function openDrawer(o) {
    if (!drawer) return;
    drawer.classList.toggle('open', o);
    scrim.classList.toggle('open', o);
    drawer.setAttribute('aria-hidden', o ? 'false' : 'true');
    document.body.style.overflow = o ? 'hidden' : '';
  }
  if ($('#menuBtn')) $('#menuBtn').addEventListener('click', function () { openDrawer(true); });
  if ($('#mClose')) $('#mClose').addEventListener('click', function () { openDrawer(false); });
  if (scrim) scrim.addEventListener('click', function () { openDrawer(false); });
  if (drawer) $$('nav a', drawer).forEach(function (a) { a.addEventListener('click', function () { openDrawer(false); }); });

  /* ---- Title highlight cycle ---- */
  var hls = $$('.p-title .hl');
  if (hls.length) {
    var hi = 0;
    var cycle = function () { hls.forEach(function (h, i) { h.classList.toggle('on', i === hi); }); hi = (hi + 1) % hls.length; };
    cycle(); setInterval(cycle, 2200);
  }

  /* ---- Reveal on scroll ---- */
  var reveals = $$('.section .shead, .trio, .anatomy, .moments, .compare, .steps, .rev-top, .founders, .kit, .split');
  reveals.forEach(function (r) { r.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es, o) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); o.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { ro.observe(r); });
  } else { reveals.forEach(function (r) { r.classList.add('in'); }); }

  /* ---- Animated stat rings ---- */
  var stats = $('#stats');
  if (stats && 'IntersectionObserver' in window) {
    var animated = false;
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting || animated) return; animated = true;
        $$('.ring', stats).forEach(function (ring) {
          var pct = parseInt(ring.dataset.pct, 10);
          var arc = $('.arc', ring), num = $('.num', ring);
          var circ = 327, t0 = null, dur = 1300;
          var frame = function (t) {
            if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur);
            var e = 1 - Math.pow(1 - p, 3);
            arc.style.strokeDashoffset = String(circ - circ * (pct / 100) * e);
            num.textContent = Math.round(pct * e) + '%';
            if (p < 1) requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        });
      });
    }, { threshold: 0.4 });
    so.observe(stats);
  }
})();
