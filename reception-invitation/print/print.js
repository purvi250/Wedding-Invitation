/* ============================================================================
   PDF invitation + looping GIF — content and the hero's living details.
   Everything moving on page 1 (petals, fireflies, gold dust, sparkles round the portrait, the light that
   sweeps across the names) is a pure function of time that repeats exactly every LOOP seconds, so the GIF
   made from it loops without a seam. tools/make-invitation.mjs drives it through window.__hero.
   ============================================================================ */
(function () {
  'use strict';

  const CFG = window.INVITE_CONFIG || {};
  const TXT = CFG.TEXT || {};
  const MODE = new URLSearchParams(location.search).get('mode') || 'pdf';
  document.body.classList.add('mode-' + MODE);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const LOOP = 8, TAU = Math.PI * 2;

  /* ------------------------------------------------------------------ content (same rules as the film) */
  const first = (n) => String(n || '').trim().split(/\s+/)[0] || '';
  const SIGN = `${first(CFG.BRIDE_NAME)} & ${first(CFG.GROOM_NAME)}`;
  const DATE_LINE = [CFG.EVENT_DAY, CFG.EVENT_DATE].filter(Boolean).join(', ');
  const PROG = (CFG.PROGRAMME_EVENTS || []).filter((e) => e && e.name);
  const HAS_PROG = PROG.length > 0;
  const noYear = (s) => String(s || '').replace(/,?\s*\d{4}\s*$/, '');
  const andList = (a) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} & ${a[a.length - 1]}` : a[0] || '');
  // the same icons as on the back of the card in the film (script.js)
  const ICONS = {
    diya: '<svg viewBox="0 0 48 48" aria-hidden="true"><path class="ic-flame" d="M24 4.5c3.6 5 6.4 9.4 6.4 13.2 0 4-2.9 6.8-6.4 6.8s-6.4-2.8-6.4-6.8c0-3.8 2.8-8.2 6.4-13.2z"/><path class="ic-core" d="M24 13.2c1.6 2.4 2.7 4.3 2.7 6 0 1.7-1.2 2.9-2.7 2.9s-2.7-1.2-2.7-2.9c0-1.7 1.1-3.6 2.7-6z"/><path class="ic-line" d="M5 28.5c6 1.4 12.4 2 19 2s13-.6 19-2c-1.3 6.8-8.8 11.4-19 11.4S6.3 35.3 5 28.5zM5 28.5l-3.2-2.1M19 40.4l-1.6 3.6h13.2L29 40.4"/></svg>',
    dinner: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="ic-line" cx="24" cy="11.6" r="2.6"/><path class="ic-line" d="M7.5 33.5a16.5 16.5 0 0 1 33 0M3.5 36.5h41M9 40.5h30"/><path class="ic-shine" d="M14.6 26a10.6 10.6 0 0 1 6.2-6.4"/></svg>',
    gem: '<svg viewBox="0 0 48 48" aria-hidden="true"><path class="ic-flame" d="M24 9l7.5 15L24 39l-7.5-15z"/></svg>',
  };
  const iconFor = (e) => ICONS[e.icon] || ICONS[/sundar|path|puja|pooja|aarti|katha|havan|jagran/i.test(e.name) ? 'diya' : /dinner|lunch|bhoj|food|feast/i.test(e.name) ? 'dinner' : 'gem'];
  const mapUrl = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);

  const put = (sel, value) => $$(sel).forEach((el) => { el.textContent = value || ''; });
  const lines = (sel, arr) => $$(sel).forEach((el) => { el.textContent = ''; arr.filter(Boolean).forEach((l) => { const s = document.createElement('span'); s.textContent = l; el.append(s); }); });
  put('[data-kicker]', TXT.envelopeKicker);
  $$('[data-name]').forEach((el) => { el.textContent = el.dataset.name === 'bride' ? CFG.BRIDE_NAME : CFG.GROOM_NAME; });
  put('[data-invite-line]', TXT.inviteLine);
  put('[data-event-type]', CFG.EVENT_TYPE);
  put('[data-date]', DATE_LINE);
  put('[data-venue]', CFG.VENUE_NAME);
  put('[data-venue-label]', TXT.venueLabel);
  put('[data-message]', TXT.message);
  put('[data-sign]', SIGN);
  $$('[data-closing]').forEach((el) => { el.textContent = (TXT.closing || [])[+el.dataset.closing] || ''; });
  lines('[data-address]', CFG.VENUE_ADDRESS_LINES && CFG.VENUE_ADDRESS_LINES.length ? CFG.VENUE_ADDRESS_LINES : [CFG.VENUE_ADDRESS]);
  $$('[data-time]').forEach((el) => { el.hidden = !CFG.EVENT_TIME; el.textContent = CFG.EVENT_TIME || ''; });
  $$('[data-rsvp]').forEach((el) => { el.hidden = !CFG.RSVP_DETAILS; el.textContent = CFG.RSVP_DETAILS || ''; });

  // the hosts' invitation replaces the couple's line on the cover of the PDF (not in the GIF)
  const HOSTS = (CFG.PDF_HOSTS || []).filter(Boolean);
  if (MODE === 'pdf' && HOSTS.length) {
    $$('[data-hosts-names]').forEach((el) => HOSTS.forEach((h, i) => {
      if (i) { const amp = document.createElement('i'); amp.textContent = i === HOSTS.length - 1 ? '&' : ','; el.append(amp); }
      const s = document.createElement('span'); s.textContent = h; el.append(s);
    }));
    const [line, events] = CFG.PDF_HOSTS_INVITE || [];
    $$('[data-hosts-invite]').forEach((el) => {
      if (line) { const s = document.createElement('span'); s.textContent = line; el.append(s); }
      if (events) { const b = document.createElement('strong'); b.className = 'gold'; b.textContent = events; el.append(b); }
    });
    $$('.invite').forEach((el) => el.remove());
    document.body.classList.add('has-hosts');
  } else $$('[data-hosts]').forEach((el) => el.remove());

  // programme
  put('[data-prog-title]', CFG.PROGRAMME_TITLE || 'Programme');
  put('[data-prog-day]', CFG.PROGRAMME_DAY);
  put('[data-prog-date]', CFG.PROGRAMME_DATE);
  lines('[data-prog-address]', CFG.PROGRAMME_VENUE_LINES && CFG.PROGRAMME_VENUE_LINES.length ? CFG.PROGRAMME_VENUE_LINES : [CFG.PROGRAMME_VENUE_ADDRESS]);
  $$('[data-prog-rows]').forEach((ul) => {
    for (const e of PROG) {
      const li = document.createElement('li'), ic = document.createElement('span'), n = document.createElement('span');
      li.className = 'prog-row'; ic.className = 'prog-ic'; ic.innerHTML = iconFor(e); n.className = 'prog-name'; n.textContent = e.name;
      li.append(ic, n);
      if (e.time) { const d = document.createElement('i'), tm = document.createElement('b'); d.className = 'prog-dots'; tm.className = 'prog-time'; tm.textContent = e.time; li.append(d, tm); }
      ul.append(li);
    }
  });
  if (!HAS_PROG) $$('#programme .card, [data-map-programme]').forEach((el) => el.remove());

  // the two dates on the hero (one column when there is no programme)
  $$('[data-dates]').forEach((el) => {
    const col = (day, date, what) => {
      const c = document.createElement('div'); c.className = 'dt';
      for (const [cls, text] of [['dt-day', day], ['dt-date', noYear(date)], ['dt-what', what]]) { if (!text) continue; const p = document.createElement('p'); p.className = cls; p.textContent = text; c.append(p); }
      return c;
    };
    if (HAS_PROG) { const sep = document.createElement('i'); sep.className = 'dt-sep'; el.append(col(CFG.PROGRAMME_DAY, CFG.PROGRAMME_DATE, andList(PROG.map((e) => e.name))), sep); }
    else el.style.gridTemplateColumns = '1fr';
    el.append(col(CFG.EVENT_DAY, CFG.EVENT_DATE, CFG.EVENT_TYPE));
  });

  // links (live in the PDF) and the QR code for printed copies
  const map = $('[data-map-reception]');
  if (map) map.href = mapUrl([CFG.VENUE_NAME, CFG.VENUE_ADDRESS].filter(Boolean).join(', '));
  const mapP = $('[data-map-programme]');
  if (mapP) { if (CFG.PROGRAMME_VENUE_ADDRESS) mapP.href = mapUrl(CFG.PROGRAMME_VENUE_ADDRESS); else mapP.remove(); }
  if (CFG.SHARE_URL) $$('[data-watch]').forEach((a) => { a.href = CFG.SHARE_URL; });
  else $$('.watch, [data-qr-block]').forEach((el) => el.remove());
  const qrBox = $('[data-qr]');
  if (qrBox && CFG.SHARE_URL && window.qrcode) {
    const qr = window.qrcode(0, 'M'); qr.addData(CFG.SHARE_URL); qr.make();
    const n = qr.getModuleCount(), finder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
    let dots = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c) && !finder(r, c)) dots += `<circle cx="${c + 0.5}" cy="${r + 0.5}" r="0.46"/>`;
    const eye = (x, y) => `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" rx="1.6" fill="none" stroke="#5a1a2b" stroke-width="1"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.8"/>`;
    qrBox.innerHTML = `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" fill="#5a1a2b" role="img" aria-label="QR code: ${CFG.SHARE_URL}">${dots}${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}</svg>`;
  } else if (qrBox) $('[data-qr-block]').remove();

  /* ------------------------------------------------------------------ the hero's living details */
  const img = (el) => new Promise((res) => { if (el.complete && el.naturalWidth) return res(); el.addEventListener('load', res, { once: true }); el.addEventListener('error', res, { once: true }); });
  $$('img[data-char]').forEach((el) => { el.src = '../' + ((CFG.IMAGES || {})[el.dataset.char] || ''); });
  const petals = new Image(); petals.src = '../assets/effects/hd/petals.webp';
  const fonts = ['400 1em "Great Vibes"', '500 1em "Cormorant Garamond"', 'italic 500 1em "Cormorant Garamond"', '600 1em "Cormorant Garamond"', 'italic 600 1em "Cormorant Garamond"', '700 1em "Cormorant Garamond"', '500 1em "Cinzel"', '600 1em "Cinzel"'];
  const ready = Promise.all([...$$('img').map(img), img(petals), ...fonts.map((f) => document.fonts.load(f)), document.fonts.ready]).then(() => Promise.all($$('img').map((el) => (el.decode ? el.decode().catch(() => {}) : null))));

  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const R = mulberry32(20261126);
  const W = 1080, H = 1920, CX = W / 2, RING = 420;
  // the sparkles circle the portrait wherever print.css puts it (it sits higher on the PDF cover with the hosts)
  const CY = (() => { const p = $('.portrait'), h = $('#hero'); return p && h ? p.getBoundingClientRect().top - h.getBoundingClientRect().top + p.offsetHeight / 2 : H * 0.486; })();
  const n = (k) => 1 + Math.floor(R() * k);   // whole number of cycles per loop, so every motion repeats exactly
  const PETALS = Array.from({ length: 15 }, () => ({ k: Math.floor(R() * 6), x: R(), y: R() * 1.25, s: 30 + R() * 34, sway: 0.015 + R() * 0.03, m: n(2), ph: R() * TAU, rq: (R() < 0.5 ? -1 : 1) * n(2), r0: R() * TAU, fq: n(3), a: 0.72 + R() * 0.28 }));
  const FLIES = Array.from({ length: 24 }, () => ({ x: 0.08 + R() * 0.84, y: 0.26 + R() * 0.48, ax: 0.012 + R() * 0.025, ay: 0.01 + R() * 0.02, m1: n(2), m2: n(2), p1: R() * TAU, p2: R() * TAU, tq: n(3), pt: R() * TAU, s: 22 + R() * 26 }));
  const DUST = Array.from({ length: 34 }, () => ({ x: R(), y: R() * 1.1, sway: 0.01 + R() * 0.02, m: n(2), p: R() * TAU, tq: n(4), pt: R() * TAU, s: 12 + R() * 16 }));
  const SPARKS = Array.from({ length: 30 }, (_, i) => ({ a: (i / 30) * TAU + R() * 0.12, r: RING * (0.9 + R() * 0.2), tq: n(3), pt: R() * TAU, s: 26 + R() * 38 }));
  const fx = $('#fx'), g = fx.getContext('2d');
  const sprite = (size, draw) => { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size); return c; };
  const glow = sprite(96, (c, s) => { const gr = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, 'rgba(255,252,224,1)'); gr.addColorStop(0.16, 'rgba(255,236,160,0.85)'); gr.addColorStop(0.45, 'rgba(255,205,96,0.25)'); gr.addColorStop(1, 'rgba(255,190,80,0)'); c.fillStyle = gr; c.fillRect(0, 0, s, s); });
  const spark = sprite(128, (c, s) => {
    const h = s / 2, gr = c.createRadialGradient(h, h, 0, h, h, h * 0.5); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,244,200,0.7)'); gr.addColorStop(1, 'rgba(255,224,150,0)'); c.fillStyle = gr; c.fillRect(0, 0, s, s);
    for (const rot of [0, Math.PI / 2]) { c.save(); c.translate(h, h); c.rotate(rot); const lg = c.createLinearGradient(-h, 0, h, 0); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,253,240,1)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = lg; c.beginPath(); c.moveTo(-h, 0); c.quadraticCurveTo(0, -s * 0.035, h, 0); c.quadraticCurveTo(0, s * 0.035, -h, 0); c.fill(); c.restore(); }
  });
  const shimmers = $$('.shimmer');
  // the PDF is a single still frame, so it leaves out any petal that would sit on top of the words
  const hero = $('#hero').getBoundingClientRect();
  const CLEAR = MODE === 'pdf' ? $$('#hero .kicker, #hero .names, #hero .hosts > *, #hero .invite, #hero .dates, #hero .watch').map((el) => { const b = el.getBoundingClientRect(); return { l: b.left - hero.left, r: b.right - hero.left, t: b.top - hero.top, b: b.bottom - hero.top }; }) : [];
  const onWords = (x, y, pad) => CLEAR.some((b) => x > b.l - pad && x < b.r + pad && y > b.t - pad && y < b.b + pad);

  function seek(t) {
    const p = ((t % LOOP) + LOOP) % LOOP / LOOP;   // 0..1 through the loop
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';
    for (const d of DUST) { const y = (((d.y - 1.1 * p) % 1.1) + 1.1) % 1.1 - 0.05, x = d.x + d.sway * Math.sin(TAU * d.m * p + d.p), a = 0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(TAU * d.tq * p + d.pt), 2); g.globalAlpha = 0.8 * a; g.drawImage(glow, x * W - d.s / 2, y * H - d.s / 2, d.s, d.s); }
    for (const f of FLIES) { const x = f.x + f.ax * Math.sin(TAU * f.m1 * p + f.p1), y = f.y + f.ay * Math.cos(TAU * f.m2 * p + f.p2), a = 0.12 + 0.88 * Math.pow(0.5 + 0.5 * Math.sin(TAU * f.tq * p + f.pt), 3); g.globalAlpha = a; g.drawImage(glow, x * W - f.s / 2, y * H - f.s / 2, f.s, f.s); }
    for (const s of SPARKS) { const tw = Math.pow(0.5 + 0.5 * Math.sin(TAU * s.tq * p + s.pt), 6), sz = s.s * (0.55 + 0.9 * tw); g.globalAlpha = 0.15 + 0.85 * tw; g.drawImage(spark, CX + Math.cos(s.a) * s.r - sz / 2, CY + Math.sin(s.a) * s.r - sz / 2, sz, sz); }
    g.globalCompositeOperation = 'source-over';
    if (petals.naturalWidth) for (const q of PETALS) {
      const y = ((q.y + 1.25 * p) % 1.25) - 0.12, x = q.x + q.sway * Math.sin(TAU * q.m * p + q.ph), flip = Math.cos(TAU * q.fq * p + q.ph);
      if (onWords(x * W, y * H, q.s / 2)) continue;
      g.save(); g.globalAlpha = q.a; g.translate(x * W, y * H); g.rotate(q.r0 + TAU * q.rq * p); g.scale(1, 0.22 + 0.78 * Math.abs(flip));
      g.drawImage(petals, q.k * 160, 0, 160, 160, -q.s / 2, -q.s / 2, q.s, q.s); g.restore();
    }
    g.globalAlpha = 1;
    // the light sweeps across each name once per loop
    shimmers.forEach((el, i) => { const e = (p * LOOP - 0.7 - i * 0.28) / 1.7; el.style.setProperty('--sh', e > 0 && e < 1 ? (140 - 180 * (e * e * (3 - 2 * e))).toFixed(2) + '%' : '140%'); });
    return t;
  }

  window.__hero = { loop: LOOP, ready: ready.then(() => { seek(MODE === 'pdf' ? 3.6 : 0); return true; }), seek };
})();
