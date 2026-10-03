/* 9LORD OS — scene, power, boot, desktop, windows, terminal. Vanilla JS, no dependencies. */
(() => {
  'use strict';
  const { PROFILE, PROJECTS, PHILOSOPHY, LINKS, BOOT, TRASH } = window.LORD;
  const Audio = window.LordAudio;

  /* ---------------------------------------------------------------- helpers */
  const $ = (s, r = document) => r.querySelector(s);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function el(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k === 'style') n.style.cssText = v;
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null) n.append(kid.nodeType ? kid : document.createTextNode(kid));
    return n;
  }
  const SVG = {
    disk: '<rect x="3" y="9" width="26" height="14" rx="2"/><circle cx="24" cy="16" r="1.4" style="fill:var(--ph)"/><path d="M7 16h11"/>',
    folder: '<path d="M3 8h9l3 3h14v14H3z"/><path d="M3 13h26"/>',
    doc: '<path d="M8 3h11l6 6v20H8z"/><path d="M19 3v6h6"/><path d="M12 15h9M12 19h9M12 23h6"/>',
    link: '<path d="M13.5 18.5a4.5 4.5 0 0 0 6.4 0l4-4a4.5 4.5 0 0 0-6.4-6.4l-1.6 1.6"/><path d="M18.5 13.5a4.5 4.5 0 0 0-6.4 0l-4 4a4.5 4.5 0 0 0 6.4 6.4l1.6-1.6"/>',
    trash: '<path d="M7 9h18l-1.6 19H8.6z"/><path d="M4 9h24M12 9V5h8v4M13 13v11M19 13v11"/>',
    term: '<rect x="3" y="6" width="26" height="20" rx="2"/><path d="M8 12l5 4-5 4M15 20h8"/>',
    x: '<path d="M6 5h6.5l13.5 22H19.5z"/><path d="M25.5 5L6.5 27"/>',
    gh: '<circle cx="10" cy="8" r="3"/><circle cx="10" cy="24" r="3"/><circle cx="22" cy="12" r="3"/><path d="M10 11v10M22 15c0 6-12 3-12 10"/>',
    system: '<rect x="4" y="4" width="24" height="24" rx="3"/><circle cx="16" cy="16" r="5"/><path d="M16 4v4M16 24v4M4 16h4M24 16h4"/>',
    alert: '<path d="M16 4L29 27H3z"/><path d="M16 12v8M16 23v1"/>',
    info: '<circle cx="16" cy="16" r="12"/><path d="M16 14v8M16 10v1"/>',
    happy: '<rect x="2" y="2" width="36" height="44" rx="3"/><rect x="8" y="8" width="24" height="18"/><path d="M14 13v3M24 13v3"/><path d="M15 21q5 4 10 0"/><rect x="12" y="32" width="16" height="3"/><path d="M8 40h6"/>',
    nine: '<rect x="1" y="1" width="14" height="14" rx="3" style="fill:none;stroke:currentColor;stroke-width:1.6"/><path d="M8.2 4.2a2.6 2.6 0 1 1-.2 5.2 2.7 2.7 0 0 1-1.6-.5M10.6 7c0 2.6-1.3 4.4-3.6 5.1" style="fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round"/>',
  };
  const svg = (name, cls = '', vb = '0 0 32 32') => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', vb); if (cls) s.setAttribute('class', cls); s.innerHTML = SVG[name]; return s;
  };

  /* --------------------------------------------------------------- geometry */
  // Mac body in scene units; the front face is on z = 0 and the machine stands on the desk plane y = 1000.
  const MAC = { x: 50, y: 40, w: 680, h: 960, d: 760, chamfer: 120 };
  const RASTER = { x: MAC.x + 84, y: MAC.y + 139, w: 512, h: 342 };
  // The bezel recess plus a sliver of case around it — the "lean in" framing.
  const BEZEL = { x: MAC.x + 22, y: MAC.y + 44, w: 636, h: 534 };
  // The eye: CSS perspective + perspective-origin. Up and to the right, so the top and right faces show.
  const CAM = { P: 2400, ox: 1600, oy: -250 };
  const project = (x, y, z, ox = CAM.ox, oy = CAM.oy) => {
    const k = CAM.P / (CAM.P - z);
    return { x: ox + (x - ox) * k, y: oy + (y - oy) * k };
  };
  // Bounding box of the projected machine (plus a little desk and keyboard below it) for the room view.
  const FIT_BOX = (() => {
    const pts = [
      { x: MAC.x, y: MAC.y }, { x: MAC.x + MAC.w, y: MAC.y + MAC.h },
      project(MAC.x + MAC.w, MAC.y, -(MAC.d - MAC.chamfer)),
      project(MAC.x + MAC.w, MAC.y + MAC.h, -MAC.d),
      project(MAC.x, MAC.y, -(MAC.d - MAC.chamfer)),
    ];
    // the keyboard's near edge (y = 1000 on the desk, 467.6 toward the eye) sets the bottom of the picture
    const kbNear = project(MAC.x, 1000, 467.6);
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const x0 = Math.min(...xs) - 34, x1 = Math.max(...xs) + 24, y0 = Math.min(...ys) - 24, y1 = Math.max(...ys, kbNear.y) + 70;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  })();
  const room = $('#room'), scene = $('#scene'), world = $('#world'), crt = $('#crt'), display = $('#display');
  const bootEl = $('#boot'), desktop = $('#desktop'), hint = $('#hint'), powerBtn = $('#power');
  world.style.setProperty('--P', CAM.P + 'px');
  world.style.setProperty('--ox', CAM.ox + 'px');
  world.style.setProperty('--oy', CAM.oy + 'px');
  let zoomed = false, scale = 1, state = 'off';
  const isNarrow = () => Math.min(innerWidth, innerHeight) < 640 || innerWidth < 760;

  function layout() {
    const vw = innerWidth, vh = innerHeight;
    let s, tx, ty;
    if (zoomed) {
      // phones: fill with the raster. desktops: lean in on the bezel so the machine stays in the picture.
      const narrow = isNarrow();
      const box = narrow ? RASTER : BEZEL, pad = narrow ? 6 : 16;
      s = Math.min((vw - pad * 2) / box.w, (vh - pad * 2) / box.h);
      tx = vw / 2 - (box.x + box.w / 2) * s;
      ty = vh / 2 - (box.y + box.h / 2) * s;
    } else {
      s = Math.min(vw / FIT_BOX.w, vh / FIT_BOX.h) * 0.97;
      tx = vw / 2 - (FIT_BOX.x + FIT_BOX.w / 2) * s;
      ty = vh / 2 - (FIT_BOX.y + FIT_BOX.h / 2) * s;
    }
    scale = s;
    scene.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)})`;
    room.style.setProperty('--gx', (tx + (RASTER.x + RASTER.w / 2) * s).toFixed(1) + 'px');
    room.style.setProperty('--gy', (ty + (RASTER.y + RASTER.h / 2) * s).toFixed(1) + 'px');
  }
  function setZoom(v, animate = true) {
    zoomed = !!v;
    room.classList.toggle('is-zoomed', zoomed);
    scene.classList.toggle('animating', animate);
    layout();
    if (animate) setTimeout(() => scene.classList.remove('animating'), 1000);
    menubarRefresh();
  }
  addEventListener('resize', () => { scene.classList.remove('animating'); layout(); });
  layout();

  /* ------------------------------------------------------------------- dust */
  (function dust() {
    const c = $('#dust'), ctx = c.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    let W, H, ps = [];
    const resize = () => { W = c.width = innerWidth * devicePixelRatio; H = c.height = innerHeight * devicePixelRatio; };
    resize(); addEventListener('resize', resize);
    const N = 70;
    for (let i = 0; i < N; i++) ps.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.4, a: .03 + Math.random() * .09, vx: (Math.random() - .5) * .00004, vy: -(.00002 + Math.random() * .00005), ph: Math.random() * 6.28 });
    let last = 0;
    function frame(t) {
      requestAnimationFrame(frame);
      if (document.hidden || t - last < 33) return; last = t;
      ctx.clearRect(0, 0, W, H);
      const on = state !== 'off';
      const tint = on ? (getComputedStyle(room).getPropertyValue('--light').trim() || '112,220,228') : '';
      const gx = parseFloat(room.style.getPropertyValue('--gx')) * devicePixelRatio, gy = parseFloat(room.style.getPropertyValue('--gy')) * devicePixelRatio;
      for (const p of ps) {
        p.x += p.vx + Math.sin(t / 2600 + p.ph) * .00003; p.y += p.vy;
        if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < -.02) p.x = 1.02; if (p.x > 1.02) p.x = -.02;
        const X = p.x * W, Y = p.y * H;
        let a = p.a, col = '255,255,255';
        if (on) { const d = Math.hypot(X - gx, Y - gy) / Math.max(W, H); if (d < .35) { a *= 1 + (0.35 - d) * 6; col = tint; } }
        ctx.fillStyle = `rgba(${col},${Math.min(a, .5)})`;
        ctx.beginPath(); ctx.arc(X, Y, p.r * devicePixelRatio, 0, 6.283); ctx.fill();
      }
    }
    requestAnimationFrame(frame);
  })();

  /* ---------------------------------------------------------- desk props */
  // Keycaps on the keyboard's top plate (plate is 880 × 360; 1u = 54px pitch, caps 48px).
  (function keyboard() {
    // M0110 layout: five rows on a 15u grid, 1u = 54 scene px, caps 48 wide. Modifier caps are darker with small legends.
    const host = $('.kb-keys'); if (!host) return;
    const U = 54, CAP = 48, X0 = 15, Y0 = 14;
    const rows = [
      ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', ['Backspace', 2]],
      [['Tab', 1.5], 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', ['\\', 1.5]],
      [['Caps Lock', 1.75], 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', ['Return', 2.25]],
      [['Shift', 2.25], 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', ['Shift', 2.75]],
      [['Option', 1.75], ['\u2318', 1.25, 'cmd'], ['', 8.75, 'space'], ['Enter', 1.5], ['Option', 1.5]],
    ];
    const frag = document.createDocumentFragment();
    rows.forEach((r, ri) => {
      let x = X0;
      r.forEach((k) => {
        const [label, u, extra] = Array.isArray(k) ? k : [k, 1];
        const w = u * U - (U - CAP);
        const cls = 'key' + (u > 1.2 ? ' dark' : '') + (extra ? ' ' + extra : '');
        const key = el('div', { class: cls, style: `left:${x}px;top:${Y0 + ri * U}px;width:${w}px`, 'aria-hidden': 'true' }, label);
        frag.append(key); x += u * U;
      });
    });
    host.append(frag);
  })();
  // Cables lie on the desk plane. Desk-local coords = (scene x + 1200, scene z + 1200).
  (function cables() {
    const s = $('.cables'); if (!s) return;
    const NS = 'http://www.w3.org/2000/svg';
    const path = (d, cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', cls); s.append(p); };
    const bez = (P, t) => {
      const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t;
      return { x: a * P[0].x + b * P[1].x + c * P[2].x + e * P[3].x, y: a * P[0].y + b * P[1].y + c * P[2].y + e * P[3].y };
    };
    // mouse cord: out of the far end of the mouse, slack across the desk and away into the dark behind the machine
    const mouse = 'M2180 1300 C 2180 1230, 2236 1190, 2262 1110 S 2282 900, 2344 800 S 2430 690, 2460 600';
    path(mouse, 'cord-sh'); path(mouse, 'cord'); path(mouse, 'cord-hi'); path('M2180 1300 L2180 1284', 'relief');
    // coiled keyboard cord: from the port on the lower left of the case, out past the left end of the keyboard and
    // back under its left edge. Sampled along a bezier with a perpendicular sine for the coil.
    const P = [{ x: 1270, y: 1196 }, { x: 1090, y: 1222 }, { x: 880, y: 1430 }, { x: 1180, y: 1490 }];
    const N = 26, amp = 9, segs = 320;
    let d = '';
    for (let i = 0; i <= segs; i++) {
      const t = i / segs, p = bez(P, t), q = bez(P, Math.min(1, t + .004));
      const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1;
      const w = Math.sin(t * Math.PI * 2 * N) * amp * Math.sin(Math.PI / 2 * Math.min(1, t * 8, (1 - t) * 8));
      d += (i ? ' L' : 'M') + (p.x - dy / L * w).toFixed(1) + ' ' + (p.y + dx / L * w).toFixed(1);
    }
    path(d, 'cord-sh'); path(d, 'coil'); path(d, 'coil-hi'); path('M1270 1194 L1270 1212', 'relief');
  })();
  // The eye drifts a little with the pointer, which is what makes the body read as a solid object.
  (function parallax() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(pointer: fine)').matches) return;
    let tx = 0, ty = 0, raf = 0;
    const apply = () => {
      raf = 0;
      const amp = zoomed ? .3 : 1;
      world.style.setProperty('--ox', (CAM.ox + tx * 110 * amp).toFixed(1) + 'px');
      world.style.setProperty('--oy', (CAM.oy + ty * 70 * amp).toFixed(1) + 'px');
    };
    addEventListener('pointermove', (e) => {
      tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
  })();
  let hintTimer;
  function showHint(html, { ms = 0, clickable = false } = {}) {
    clearTimeout(hintTimer);
    hint.innerHTML = html; hint.classList.add('show'); hint.classList.toggle('clickable', clickable);
    if (ms) hintTimer = setTimeout(hideHint, ms);
  }
  function hideHint() { hint.classList.remove('show', 'clickable'); }
  function shakeHint() { hint.classList.remove('shake'); void hint.offsetWidth; hint.classList.add('shake'); }
  const OFF_HINT = 'it\u2019s dark in here \u00B7 <b>the power switch is on the right side of the machine</b> \u00B7 or press <kbd>enter</kbd>';
  setTimeout(() => { if (state === 'off') showHint(OFF_HINT, { clickable: true }); }, 2200);
  hint.addEventListener('click', () => { if (state === 'off') powerOn(); });

  /* ------------------------------------------------------------ GitHub live */
  const GH = { repos: PROFILE.stats.repos, followers: PROFILE.stats.followers, stars: {}, live: false };
  (async function loadGitHub() {
    try {
      const cached = sessionStorage.getItem('gh9');
      if (cached) { Object.assign(GH, JSON.parse(cached)); refreshStats(); return; }
      const [u, r] = await Promise.all([
        fetch('https://api.github.com/users/9lordisgod'),
        fetch('https://api.github.com/users/9lordisgod/repos?per_page=100&type=owner'),
      ]);
      if (!u.ok || !r.ok) return;
      const user = await u.json(), repos = await r.json();
      GH.repos = user.public_repos; GH.followers = user.followers; GH.live = true;
      GH.stars = Object.fromEntries(repos.map((x) => [x.name, x.stargazers_count]));
      GH.top = repos.filter((x) => !x.fork).sort((a, b) => b.stargazers_count - a.stargazers_count || (a.pushed_at < b.pushed_at ? 1 : -1)).slice(0, 6).map((x) => ({ name: x.name, stars: x.stargazers_count, desc: x.description || '', url: x.html_url }));
      sessionStorage.setItem('gh9', JSON.stringify(GH));
      refreshStats();
    } catch (e) { /* offline or rate-limited: static fallbacks stay */ }
  })();
  const starsOf = (p) => (GH.stars[p.repo] ?? p.stars);
  function refreshStats() {
    document.querySelectorAll('[data-gh]').forEach((n) => { n.textContent = GH[n.dataset.gh]; });
    document.querySelectorAll('[data-gh-star]').forEach((n) => { const v = GH.stars[n.dataset.ghStar]; if (v != null) n.textContent = '\u2605 ' + v; });
  }

  /* ------------------------------------------------------------------ power */
  let bootToken = 0;
  async function powerOn() {
    if (state !== 'off') return;
    state = 'booting';
    Audio.unlock(); Audio.click();
    room.classList.remove('is-off'); room.classList.add('is-on');
    powerBtn.setAttribute('aria-pressed', 'true');
    hideHint();
    if (isNarrow()) setZoom(true);
    await wait(380);
    if (state !== 'booting') return;
    crt.classList.add('warm'); Audio.degauss();
    await wait(650);
    if (state !== 'booting') return;
    crt.classList.add('lit');
    if (!zoomed) setZoom(true); // lean in as the tube comes alive
    runBoot();
  }
  async function runBoot() {
    const tok = ++bootToken;
    const alive = () => tok === bootToken && state === 'booting';
    const skip = () => el('div', { class: 'skip' }, 'click to skip');
    bootEl.hidden = false; bootEl.innerHTML = '';
    bootEl.append(svg('happy', 'happy', '0 0 40 48'), skip());
    Audio.chime();
    await wait(1500); if (!alive()) return;

    bootEl.innerHTML = '';
    bootEl.append(el('div', { class: 'welcome' }, 'Welcome to 9LORD OS.', el('small', {}, 'System 1.0 \u00B7 cypherpunk build')), skip());
    await wait(1400); if (!alive()) return;

    bootEl.innerHTML = '';
    const log = el('pre', { class: 'log' }); bootEl.append(log, skip());
    for (const [label, st] of BOOT) {
      const status = st.replace('{repos}', GH.repos);
      const line = el('div');
      if (!st) line.textContent = label;
      else line.append(label + ' ' + '.'.repeat(Math.max(2, 46 - label.length)) + ' ', el('span', { class: 'st' }, status));
      log.append(line); Audio.key();
      await wait(st ? 110 + Math.random() * 160 : 420); if (!alive()) return;
    }
    const bar = el('div', { class: 'bar' }, el('i'));
    bootEl.append(bar);
    requestAnimationFrame(() => { bar.firstChild.style.width = '100%'; });
    await wait(1150); if (!alive()) return;
    finishBoot();
  }
  function finishBoot() {
    if (state !== 'booting') return;
    bootToken++;
    bootEl.hidden = true; bootEl.innerHTML = '';
    state = 'on';
    showDesktop();
  }
  async function powerOff() {
    if (state === 'off' || state === 'dying') return;
    const wasOn = state === 'on';
    state = 'dying'; bootToken++;
    closeMenus(); hideHint();
    if (wasOn) { closeAll(false); desktop.hidden = true; }
    bootEl.hidden = true; bootEl.innerHTML = '';
    Audio.off();
    crt.classList.add('dying');
    await wait(650);
    crt.classList.remove('lit', 'warm', 'dying');
    room.classList.remove('is-on'); room.classList.add('is-off');
    powerBtn.setAttribute('aria-pressed', 'false');
    state = 'off';
    Audio.click();
    if (zoomed) setZoom(false);
    setTimeout(() => { if (state === 'off') showHint('powered down \u00B7 <b>flip the switch</b> to come back', { clickable: true }); }, 1200);
  }
  async function restart() { await powerOff(); await wait(500); powerOn(); }
  powerBtn.addEventListener('click', () => { state === 'off' ? powerOn() : powerOff(); });
  $('.f-right').addEventListener('click', (e) => { if (state === 'off' && !e.target.closest('.rocker')) powerOn(); });
  display.addEventListener('click', () => { if (state === 'booting') finishBoot(); });
  crt.addEventListener('click', () => {
    if (state !== 'off') return;
    Audio.unlock(); Audio.beep();
    showHint('the glass is cold \u00B7 <b>the switch is on the right side</b> \u2192', { clickable: true }); shakeHint();
  });

  /* ---------------------------------------------------------------- desktop */
  let desktopBuilt = false;
  function showDesktop() {
    desktop.hidden = false;
    if (!desktopBuilt) { buildMenubar(); buildIcons(); desktopBuilt = true; }
    menubarRefresh();
    showHint('<kbd>Z</kbd> zoom \u00B7 <kbd>T</kbd> terminal \u00B7 <kbd>Esc</kbd> close \u00B7 drag the windows', { ms: 7000 });
    setTimeout(() => { if (state === 'on' && !wins.size) openWindow('about'); }, 350);
  }

  const MENUS = {
    logo: () => [
      { l: 'About This Mac\u2026', a: () => openWindow('aboutmac') }, '-',
      { l: 'About Me', a: () => openWindow('about') },
      { l: 'Projects', a: () => openWindow('projects') },
      { l: 'Philosophy', a: () => openWindow('philosophy') },
      { l: 'Links', a: () => openWindow('links') }, '-',
      { l: 'Terminal', k: 'T', a: () => openWindow('terminal') },
    ],
    file: () => [
      { l: 'New Terminal', k: 'T', a: () => openWindow('terminal') },
      { l: 'Open 9LORD HD', a: () => openWindow('finder') }, '-',
      { l: 'Close Window', k: 'Esc', a: () => { const w = topWindow(); if (w) closeWindow(w); }, dis: !wins.size },
      { l: 'Close All', a: () => closeAll(), dis: !wins.size }, '-',
      { l: 'Print\u2026', a: () => { Audio.error(); dialog('No printer found.', 'The ImageWriter is in another castle. Everything here is already on GitHub anyway.'); } },
      { l: 'Text Version', a: showPlain },
    ],
    view: () => [
      { l: 'Zoom Screen', k: 'Z', a: () => setZoom(!zoomed), chk: zoomed },
      { l: 'Scanlines', a: () => room.classList.toggle('no-scanlines'), chk: !room.classList.contains('no-scanlines') },
      { l: 'Sound', k: 'M', a: toggleSound, chk: !Audio.muted }, '-',
      { l: 'Tiffany Blue', a: () => setPhosphor('tiffany'), chk: phosphor() === 'tiffany' },
      { l: 'Red Phosphor', a: () => setPhosphor('red'), chk: phosphor() === 'red' },
      { l: 'Amber Phosphor', a: () => setPhosphor('amber'), chk: phosphor() === 'amber' },
      { l: 'Green Phosphor', a: () => setPhosphor('green'), chk: phosphor() === 'green' },
    ],
    special: () => [
      { l: 'Clean Up Windows', a: () => closeAll(), dis: !wins.size },
      { l: 'Empty Trash\u2026', a: emptyTrash },
      { l: 'Eject Disk', a: () => { Audio.error(); dialog('There is no disk to eject.', 'Everything here lives on-chain or on GitHub.'); } }, '-',
      { l: 'Restart', a: restart },
      { l: 'Shut Down', a: powerOff },
    ],
  };
  const phosphor = () => room.dataset.phosphor || 'tiffany';
  function setPhosphor(p) { room.dataset.phosphor = p; localStorage.setItem('9lord_theme', p); }
  const savedPh = localStorage.getItem('9lord_theme'); if (savedPh && /^(tiffany|red|amber|green)$/.test(savedPh)) room.dataset.phosphor = savedPh;
  function toggleSound() { Audio.setMuted(!Audio.muted); menubarRefresh(); if (!Audio.muted) Audio.pop(); }

  let menubar, clockEl, sndBtn, zoomBtn, openMenu = null;
  function buildMenubar() {
    menubar = $('#menubar');
    const menus = el('div', { class: 'menus' });
    const mk = (id, label) => {
      const b = el('button', { class: 'menu-btn' + (id === 'logo' ? ' logo' : ''), 'data-menu': id, type: 'button', 'aria-haspopup': 'true' });
      if (id === 'logo') b.append(svg('nine', '', '0 0 16 16')); else b.textContent = label;
      b.addEventListener('click', (e) => { e.stopPropagation(); openMenu === id ? closeMenus() : showMenu(id, b); });
      b.addEventListener('mouseenter', () => { if (openMenu && openMenu !== id) showMenu(id, b); });
      return b;
    };
    menus.append(mk('logo'), mk('file', 'File'), mk('view', 'View'), mk('special', 'Special'));
    sndBtn = el('button', { class: 'menu-btn sym', type: 'button', title: 'Sound (M)', onclick: toggleSound });
    zoomBtn = el('button', { class: 'menu-btn sym', type: 'button', title: 'Zoom screen (Z)', onclick: () => setZoom(!zoomed) });
    clockEl = el('span', { class: 'clock' });
    menubar.append(menus, el('div', { class: 'status' }, sndBtn, zoomBtn, clockEl));
    tick(); setInterval(tick, 10000);
    document.addEventListener('click', (e) => { if (!e.target.closest('.dropdown')) closeMenus(); });
  }
  function tick() {
    if (!clockEl) return;
    const d = new Date(); let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0'); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    clockEl.textContent = `${h}:${m} ${ap}`;
  }
  function menubarRefresh() {
    if (!sndBtn) return;
    sndBtn.textContent = Audio.muted ? '\u266A\u0338' : '\u266A';
    sndBtn.style.opacity = Audio.muted ? .55 : 1;
    zoomBtn.textContent = zoomed ? '\u2921' : '\u2922';
  }
  function showMenu(id, btn) {
    closeMenus();
    openMenu = id; btn.classList.add('open');
    const dd = el('div', { class: 'dropdown', role: 'menu' });
    dd.style.left = btn.offsetLeft + 'px';
    for (const it of MENUS[id]()) {
      if (it === '-') { dd.append(el('div', { class: 'sep' })); continue; }
      const row = el('div', { class: 'item' + (it.dis ? ' disabled' : ''), role: 'menuitem' },
        it.chk ? el('span', { class: 'chk' }, '\u2713') : null, el('span', {}, it.l), it.k ? el('span', { class: 'k' }, it.k) : null);
      row.addEventListener('click', (e) => { e.stopPropagation(); closeMenus(); Audio.pop(); it.a(); });
      dd.append(row);
    }
    $('#dropdowns').append(dd);
  }
  function closeMenus() {
    openMenu = null; $('#dropdowns').innerHTML = '';
    desktop.querySelectorAll('.menu-btn.open').forEach((b) => b.classList.remove('open'));
  }

  const ICONS = [
    { id: 'finder', label: '9LORD HD', icon: 'disk', x: 442, y: 26 },
    { id: 'about', label: 'About Me', icon: 'doc', x: 442, y: 76 },
    { id: 'projects', label: 'Projects', icon: 'folder', x: 442, y: 126 },
    { id: 'philosophy', label: 'Philosophy', icon: 'doc', x: 442, y: 176 },
    { id: 'links', label: 'Links', icon: 'link', x: 442, y: 226 },
    { id: 'trash', label: 'Trash', icon: 'trash', x: 442, y: 292 },
    { id: 'terminal', label: 'Terminal', icon: 'term', x: 4, y: 292 },
    { id: 'x', label: 'X.app', icon: 'x', x: 70, y: 292 },
    { id: 'github', label: 'GitHub.app', icon: 'gh', x: 136, y: 292 },
  ];
  function makeIcon(ic, positioned = true) {
    const n = el('div', { class: 'icon', role: 'button', tabindex: '0', title: ic.label, 'data-id': ic.id }, svg(ic.icon), el('span', {}, ic.label));
    if (positioned) { n.style.left = ic.x + 'px'; n.style.top = ic.y + 'px'; }
    const open = () => {
      desktop.querySelectorAll('.icon.sel').forEach((i) => i.classList.remove('sel'));
      n.classList.add('sel', 'bounce'); Audio.pop();
      setTimeout(() => { n.classList.remove('bounce'); openWindow(ic.id); }, 120);
    };
    n.addEventListener('click', (e) => { e.stopPropagation(); open(); });
    n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    return n;
  }
  function buildIcons() {
    const host = $('#icons');
    ICONS.forEach((ic) => host.append(makeIcon(ic)));
    desktop.addEventListener('click', (e) => { if (e.target === desktop || e.target === host) desktop.querySelectorAll('.icon.sel').forEach((i) => i.classList.remove('sel')); });
  }

  /* ---------------------------------------------------------------- windows */
  const wins = new Map(); let cascade = 0, zTop = 10;
  const winHost = () => $('#windows');
  function topWindow() { let best = null; for (const w of wins.values()) if (!best || +w.style.zIndex > +best.style.zIndex) best = w; return best; }
  function focusWindow(w) {
    wins.forEach((x) => x.classList.remove('active'));
    w.classList.add('active'); w.style.zIndex = ++zTop;
    if (w._onFocus) w._onFocus();
  }
  function openWindow(kind, opts = {}) {
    if (!WINDOWS[kind]) return;
    const key = opts.key || kind;
    if (wins.has(key)) { focusWindow(wins.get(key)); return wins.get(key); }
    const spec = WINDOWS[kind](opts);
    const w = spec.w || 400, h = spec.h || 236;
    let x, y;
    if (spec.center) { x = Math.round((512 - w) / 2); y = Math.round((342 - h) / 2) + 6; }
    else { const c = cascade++ % 7; x = 14 + c * 16; y = 30 + c * 14; }
    x = clamp(x, 0, 512 - w); y = clamp(y, 20, 342 - 40);
    const win = el('div', { class: 'win' + (spec.cls ? ' ' + spec.cls : ''), role: 'dialog', 'aria-label': spec.title, 'data-kind': kind, style: `left:${x}px;top:${y}px;width:${w}px;height:${h}px` });
    const bar = el('div', { class: 'titlebar' },
      el('span', { class: 'closebox', title: 'Close', role: 'button', 'aria-label': 'Close' }),
      el('span', { class: 'title' }, spec.title),
      spec.noZoom ? null : el('span', { class: 'zoombox', title: 'Zoom', role: 'button', 'aria-label': 'Zoom window' }));
    const content = el('div', { class: 'content' });
    if (typeof spec.body === 'string') content.innerHTML = spec.body; else content.append(spec.body);
    win.append(bar, content);
    win._key = key; win._onFocus = spec.onFocus; win._onClose = spec.onClose;
    bar.querySelector('.closebox').addEventListener('click', (e) => { e.stopPropagation(); closeWindow(win); });
    const zb = bar.querySelector('.zoombox');
    if (zb) zb.addEventListener('click', (e) => {
      e.stopPropagation();
      if (win._big) { Object.assign(win.style, win._big); win._big = null; }
      else { win._big = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height }; Object.assign(win.style, { left: '4px', top: '24px', width: '504px', height: '314px' }); }
      Audio.pop();
    });
    win.addEventListener('pointerdown', () => { if (!win.classList.contains('active')) focusWindow(win); });
    makeDraggable(win, bar);
    winHost().append(win); wins.set(key, win); focusWindow(win);
    if (spec.onMount) spec.onMount(win, content);
    refreshStats();
    return win;
  }
  function closeWindow(win, sound = true) {
    if (!win || !wins.has(win._key)) return;
    wins.delete(win._key); win.remove();
    if (win._onClose) win._onClose();
    if (sound) Audio.close();
    const t = topWindow(); if (t) focusWindow(t);
  }
  function closeAll(sound = true) { [...wins.values()].forEach((w) => closeWindow(w, false)); if (sound) Audio.close(); }
  function makeDraggable(win, bar) {
    let drag = null;
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.closebox,.zoombox')) return;
      drag = { sx: e.clientX, sy: e.clientY, ox: win.offsetLeft, oy: win.offsetTop };
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', (e) => {
      if (!drag) return;
      win.style.left = clamp(drag.ox + (e.clientX - drag.sx) / scale, -win.offsetWidth + 60, 512 - 50) + 'px';
      win.style.top = clamp(drag.oy + (e.clientY - drag.sy) / scale, 20, 342 - 22) + 'px';
    });
    const end = () => { drag = null; };
    bar.addEventListener('pointerup', end); bar.addEventListener('pointercancel', end);
  }
  function dialog(title, text, icon = 'alert') {
    openWindow('dialog', { key: 'dlg' + Date.now(), title, text, icon });
  }
  function emptyTrash() {
    Audio.error();
    dialog('Empty Trash?', 'These files are already worthless; emptying changes nothing. We don\u2019t do custody here.', 'info');
  }

  /* --------------------------------------------------------- window bodies */
  const extA = (url, label, cls = '') => `<a href="${esc(url)}" target="_blank" rel="noopener" class="${cls}">${esc(label)}</a>`;
  const projectCard = (p) => `
    <div class="card" id="proj-${p.id}">
      <div class="row"><span class="name">${esc(p.name)}</span><span class="stars" data-gh-star="${esc(p.repo)}">\u2605 ${starsOf(p)}</span></div>
      <div class="kind">${esc(p.kind)} \u00B7 ${esc(p.lang)}</div>
      <p>${esc(p.blurb)}</p>
      <div class="tags">${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      ${extA('https://github.com/9lordisgod/' + p.repo, 'GitHub \u2197', 'btn')}${p.live ? extA(p.live, 'Launch \u2197', 'btn default') : ''}
    </div>`;
  const quoteHtml = (q) => typeof q === 'string'
    ? `<p class="maxim">${esc(q)}</p>`
    : `<blockquote class="quote">\u201C${esc(q.q)}\u201D<span class="by">\u2014 ${q.src ? extA(q.src, q.by) : esc(q.by)}</span></blockquote>`;

  const WINDOWS = {
    about: () => ({
      title: 'About Me', w: 404, h: 246, body: `
        <img class="avatar" src="${PROFILE.avatar}" alt="" width="68" height="68" loading="lazy">
        <h1>${esc(PROFILE.name)}</h1>
        <p class="dim">@${PROFILE.handle} \u00B7 ${esc(PROFILE.location)}</p>
        <p>${esc(PROFILE.company)}. <span class="hi">${esc(PROFILE.bio)}</span></p>
        <p>${esc(PROFILE.tagline)}</p>
        <div class="stat-row">
          <div><b data-gh="repos">${GH.repos}</b><span>public repos</span></div>
          <div><b data-gh="followers">${GH.followers}</b><span>followers</span></div>
          <div><b>2008</b><span>internet money</span></div>
        </div>
        <h2>Now</h2>
        <ul>${PROFILE.now.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
        <h2>Stack</h2>
        <p>${PROFILE.stack.map(esc).join(' \u00B7 ')}</p>
        <h2>Interests</h2>
        <p>${PROFILE.interests.map(esc).join(' \u00B7 ')}</p>
        <p>${extA(PROFILE.github, 'GitHub \u2197', 'btn')}${extA(PROFILE.xurl, 'X \u2197', 'btn')}<span class="btn" data-open="philosophy">Philosophy</span><span class="btn" data-open="projects">Projects</span></p>`,
    }),
    projects: () => ({
      title: 'Projects', w: 420, h: 256, body: `
        <p class="dim">Highlights, hand-picked. ${extA(PROFILE.github + '?tab=repositories', 'All repos \u2197')}</p>
        ${PROJECTS.map(projectCard).join('')}`,
    }),
    philosophy: () => ({
      title: 'Philosophy.txt', w: 416, h: 256, body: `
        <h2>On life</h2>${PHILOSOPHY.life.map(quoteHtml).join('')}
        <h2>On tech</h2>${PHILOSOPHY.tech.map(quoteHtml).join('')}
        <p class="dim">\u2014 EOF \u2014</p>`,
    }),
    links: () => ({
      title: 'Links', w: 380, h: 210, body: `
        <table class="filelist">${LINKS.map((l) => `<tr><td>${extA(l.url, l.label)}</td><td>${esc(l.note)}</td></tr>`).join('')}</table>
        <p class="dim" style="margin-top:8px">Links open in a new tab, outside the Mac.</p>`,
    }),
    x: () => ({
      title: 'X.app \u2014 @' + PROFILE.x, w: 380, h: 226, body: `
        <h1>@${PROFILE.x}</h1>
        <p class="dim">markets \u00B7 code \u00B7 the long game</p>
        <h2>Pinned thought</h2>
        ${quoteHtml(PHILOSOPHY.life[0])}
        <p>${extA(PROFILE.xurl, 'Open X \u2197', 'btn default')}<span class="btn" data-open="philosophy">More philosophy</span></p>`,
    }),
    github: () => ({
      title: 'GitHub.app \u2014 @' + PROFILE.handle, w: 400, h: 236, body: `
        <div class="stat-row">
          <div><b data-gh="repos">${GH.repos}</b><span>public repos</span></div>
          <div><b data-gh="followers">${GH.followers}</b><span>followers</span></div>
          <div><b>${PROFILE.since}</b><span>joined</span></div>
        </div>
        <p>${esc(PROFILE.bio)} ${GH.live ? '<span class="dim">\u00B7 live from api.github.com</span>' : ''}</p>
        <h2>Most starred</h2>
        <table class="filelist">${(GH.top || PROJECTS.slice(0, 6).map((p) => ({ name: p.repo, stars: starsOf(p), url: 'https://github.com/9lordisgod/' + p.repo })))
          .map((r) => `<tr><td>${extA(r.url, r.name)}</td><td>\u2605 ${r.stars}</td></tr>`).join('')}</table>
        <p style="margin-top:8px">${extA(PROFILE.github, 'Open GitHub \u2197', 'btn default')}</p>`,
    }),
    finder: () => {
      const body = el('div', { class: 'grid' });
      ICONS.filter((i) => i.id !== 'finder' && i.id !== 'trash').forEach((ic) => body.append(makeIcon(ic, false)));
      body.append(makeIcon({ id: 'aboutmac', label: 'System', icon: 'system' }, false));
      return { title: '9LORD HD', w: 330, h: 190, body };
    },
    trash: () => ({
      title: 'Trash', w: 330, h: 170, body: `
        <table class="filelist">${TRASH.map((t) => `<tr><td><svg viewBox="0 0 32 32">${SVG.doc}</svg>${esc(t.name)}</td><td>${esc(t.size)}</td></tr>`).join('')}</table>
        <p style="margin-top:8px"><span class="btn" data-act="empty">Empty Trash</span></p>`,
    }),
    aboutmac: () => ({
      title: 'About This Mac', w: 380, h: 214, center: true, body: `
        <h1>9LORD OS 1.0</h1>
        <p class="dim">\u201CCypherpunk\u201D \u00B7 \u00A9 2026 ${esc(PROFILE.name)}</p>
        <dl class="kv">
          <dt>Built-in Memory</dt><dd>4,096K</dd>
          <dt>Largest Unused Block</dt><dd>\u221E</dd>
          <dt>Display</dt><dd>512 \u00D7 342 \u00B7 ${phosphor()} phosphor</dd>
          <dt>System Software</dt><dd>HTML \u00B7 CSS \u00B7 vanilla JS \u00B7 no frameworks \u00B7 no trackers</dd>
          <dt>Audio</dt><dd>synthesized live (WebAudio)</dd>
          <dt>Source</dt><dd>${extA('https://github.com/9lordisgod/williemkingdom.ca', 'github.com/9lordisgod/williemkingdom.ca')}</dd>
        </dl>`,
    }),
    dialog: ({ title, text, icon }) => ({
      title, w: 320, h: 130, center: true, cls: 'dialog', noZoom: true,
      body: el('div', { style: 'display:flex;gap:12px;align-items:flex-start;width:100%' }, svg(icon),
        el('div', { style: 'flex:1' }, el('p', {}, text), el('div', { class: 'actions' }, el('span', { class: 'btn default', 'data-act': 'ok' }, 'OK')))),
    }),
    terminal: () => terminalWindow(),
  };
  // delegated buttons inside windows
  winHost().addEventListener('click', (e) => {
    const b = e.target.closest('[data-open],[data-act]'); if (!b) return;
    if (b.dataset.open) { Audio.pop(); openWindow(b.dataset.open); }
    else if (b.dataset.act === 'ok') closeWindow(b.closest('.win'));
    else if (b.dataset.act === 'empty') emptyTrash();
  });

  /* --------------------------------------------------------------- terminal */
  const FILES = {
    'about.txt': () => aboutText(),
    'philosophy.txt': () => philosophyText(),
    'links.txt': () => LINKS.map((l) => `${l.label.padEnd(16)} ${l.url}`).join('\n'),
    '.secret': () => 'nice try. the alpha is in the commits.',
    'readme.md': () => `# ${PROFILE.handle}\n${PROFILE.tagline}\n${PROFILE.bio}`,
  };
  const aboutText = () => [
    `${PROFILE.name} (@${PROFILE.handle})`, `${PROFILE.location} \u00B7 ${PROFILE.company}`, PROFILE.bio, PROFILE.tagline, '',
    `repos: ${GH.repos}   followers: ${GH.followers}`, `stack: ${PROFILE.stack.join(', ')}`, `now:   ${PROFILE.now.join('\n       ')}`,
  ].join('\n');
  const flat = (arr) => arr.map((q) => typeof q === 'string' ? `> ${q}` : `\u201C${q.q}\u201D\n  \u2014 ${q.by}`);
  const philosophyText = () => ['ON LIFE', ...flat(PHILOSOPHY.life), '', 'ON TECH', ...flat(PHILOSOPHY.tech)].join('\n');
  const allMaxims = () => [...PHILOSOPHY.life, ...PHILOSOPHY.tech].map((q) => typeof q === 'string' ? q : `\u201C${q.q}\u201D \u2014 ${q.by}`);
  const NEOFETCH = String.raw`
   .-----------.
   |  _______  |
   | |       | |
   | |  :)   | |
   | |_______| |
   |   ____    |
   |  |____| o |
   |     ==    |
   '-----------'`.split('\n').slice(1);

  const COMMANDS = {
    help: { d: 'this list', r: () => Object.entries(COMMANDS).filter(([, c]) => !c.hidden).map(([k, c]) => `  ${k.padEnd(12)} ${c.d}`).join('\n') },
    about: { d: 'who is this', r: () => aboutText() },
    whoami: { d: 'current user', r: () => 'anon' },
    projects: { d: 'highlight projects (open N to launch)', r: () => PROJECTS.map((p, i) => `  [${i + 1}] ${p.name.padEnd(28)} \u2605${starsOf(p)}  ${p.kind}`).join('\n') + '\n\n  open <n>      open on GitHub\n  launch <n>    open live site' },
    open: { d: 'open <n> \u2014 project on GitHub', r: (a) => { const p = pick(a[0]); if (!p) return 'open: no such project. try `projects`'; window.open('https://github.com/9lordisgod/' + p.repo, '_blank', 'noopener'); return `opening github.com/9lordisgod/${p.repo} \u2026`; } },
    launch: { d: 'launch <n> \u2014 live site', r: (a) => { const p = pick(a[0]); if (!p) return 'launch: no such project'; if (!p.live) return `${p.name} has no live site yet \u2014 try \`open\``; window.open(p.live, '_blank', 'noopener'); return `launching ${p.live} \u2026`; } },
    philosophy: { d: 'life & tech principles', r: () => philosophyText() },
    fortune: { d: 'a random maxim', r: () => { const m = allMaxims(); return m[Math.floor(Math.random() * m.length)]; } },
    links: { d: 'where to find me', r: () => LINKS.map((l) => `  ${l.label.padEnd(16)} <a href="${l.url}" target="_blank" rel="noopener">${l.url}</a>`).join('\n'), html: true },
    x: { d: 'open X profile', r: () => { window.open(PROFILE.xurl, '_blank', 'noopener'); return 'opening x.com/' + PROFILE.x + ' \u2026'; } },
    github: { d: 'open GitHub profile', r: () => { window.open(PROFILE.github, '_blank', 'noopener'); return 'opening github.com/' + PROFILE.handle + ' \u2026'; } },
    neofetch: {
      d: 'system info', html: true, r: () => {
        const info = [
          `<span class="hi">anon@9lord</span>`, `-----------------`,
          `<span class="hi">OS</span>       9LORD OS 1.0 (cypherpunk)`, `<span class="hi">Host</span>     Macintosh SE (imaginary)`,
          `<span class="hi">CPU</span>      MC68000 @ 7.83 MHz`, `<span class="hi">Memory</span>   4096 KB / \u221E KB`,
          `<span class="hi">Display</span>  512x342 \u00B7 ${phosphor()} phosphor`, `<span class="hi">Shell</span>    lordsh 1.0`,
          `<span class="hi">Uptime</span>   since 2008`, `<span class="hi">Repos</span>    ${GH.repos}  \u00B7  Followers ${GH.followers}`,
          `<span class="hi">Langs</span>    ${PROFILE.stack.join(' \u00B7 ')}`,
        ];
        return NEOFETCH.map((l, i) => `<span class="dim">${esc(l.padEnd(18))}</span>${info[i] || ''}`).join('\n') + '\n' + ' '.repeat(18) + (info[NEOFETCH.length] || '');
      },
    },
    ls: { d: 'list files', r: (a) => (a[0] || '').replace(/\/$/, '') === 'projects' ? PROJECTS.map((p) => p.repo + '/').join('\n') : (a[0] || '').replace(/\/$/, '') === 'trash' ? TRASH.map((t) => t.name).join('\n') : 'about.txt  philosophy.txt  links.txt  readme.md  projects/  trash/' },
    cat: { d: 'cat <file>', r: (a) => { const f = (a[0] || '').toLowerCase(); if (!f) return 'cat: missing file'; if (FILES[f]) return FILES[f](); if (f.startsWith('projects')) return 'cat: is a directory. try `projects`'; return `cat: ${f}: No such file`; } },
    pwd: { d: 'print working directory', r: () => '/Users/anon', hidden: true },
    date: { d: 'current date', r: () => new Date().toString() },
    uname: { d: 'system name', r: () => '9LORD OS 1.0 cypherpunk mc68000 #2008 (genesis build)', hidden: true },
    echo: { d: 'echo', r: (a) => a.join(' '), hidden: true },
    history: { d: 'command history', r: () => term.history.map((h, i) => `  ${String(i + 1).padStart(3)}  ${h}`).join('\n') },
    clear: { d: 'clear screen', r: () => { term.out.innerHTML = ''; return null; } },
    theme: { d: 'theme tiffany|red|amber|green', r: (a) => { if (!/^(tiffany|red|amber|green)$/.test(a[0] || '')) return 'usage: theme tiffany|red|amber|green'; setPhosphor(a[0]); return `phosphor set to ${a[0]}`; } },
    zoom: { d: 'toggle screen zoom', r: () => { setZoom(!zoomed); return zoomed ? 'zoomed in' : 'zoomed out'; } },
    mute: { d: 'toggle sound', r: () => { toggleSound(); return Audio.muted ? 'sound off' : 'sound on'; } },
    matrix: { d: 'follow the white rabbit', r: () => { matrix(); return 'wake up, anon\u2026'; } },
    ping: { d: 'ping <host>', hidden: true, r: (a) => { const h = a[0] || 'bitcoin'; return [1, 2, 3].map((i) => `64 bytes from ${h}: icmp_seq=${i} ttl=\u221E time=${h.includes('bitcoin') ? '10min' : h.includes('solana') ? '400ms' : '1ms'}`).join('\n'); } },
    sudo: { d: '', hidden: true, r: () => 'anon is not in the sudoers file. This incident will be reported to nobody \u2014 we don\u2019t do surveillance here.' },
    rm: { d: '', hidden: true, r: (a) => a.join(' ').includes('-rf') ? 'Permission denied. Open source everything, delete nothing.' : 'rm: nothing here is yours to delete' },
    hack: { d: '', hidden: true, r: () => { matrix(); return 'ACCESS GRANTED. just kidding \u2014 verify, don\u2019t trust.'; } },
    btc: { d: '', hidden: true, r: () => 'number go up. eventually. verify.' },
    exit: { d: 'close terminal', r: () => { setTimeout(() => closeWindow(wins.get('terminal')), 150); return 'bye.'; } },
    reboot: { d: 'restart the machine', r: () => { setTimeout(restart, 400); return 'rebooting\u2026'; } },
    shutdown: { d: 'power off', r: () => { setTimeout(powerOff, 500); return 'shutting down\u2026 flip the switch to come back.'; } },
  };
  COMMANDS.poweroff = { ...COMMANDS.shutdown, hidden: true }; COMMANDS.man = { d: '', hidden: true, r: () => 'no manual entry. the code is the documentation.' };
  COMMANDS['?'] = { ...COMMANDS.help, hidden: true }; COMMANDS.dir = { ...COMMANDS.ls, hidden: true };
  function pick(arg) {
    if (!arg) return null; const n = parseInt(arg, 10);
    if (!isNaN(n)) return PROJECTS[n - 1] || null;
    const s = arg.toLowerCase(); return PROJECTS.find((p) => p.id === s || p.repo.toLowerCase() === s || p.name.toLowerCase().startsWith(s)) || null;
  }
  let term = { history: [], out: null };
  function terminalWindow() {
    const out = el('pre', { class: 'out' });
    const typed = el('span', { class: 'typed' });
    const ghost = el('input', { class: 'ghost', type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': 'Terminal input' });
    const inLine = el('div', { class: 'in' }, el('span', { class: 'ps' }, 'anon@9lord:~$ '), typed, el('span', { class: 'cursor' }), ghost);
    const t = el('div', { class: 'term' }, out, inLine);
    term = { history: term.history, hi: term.history.length, out, typed, ghost, t };
    const print = (s, html = false) => { if (s == null) return; const d = el('div'); if (html) d.innerHTML = s; else d.textContent = s; out.append(d); };
    print(`9LORD OS 1.0 \u2014 lordsh. type <span class="hi">help</span> to begin.`, true);
    const run = (raw) => {
      const line = raw.trim();
      print(`anon@9lord:~$ ${line}`);
      if (line) { term.history.push(line); term.hi = term.history.length; }
      const [cmd, ...args] = line.split(/\s+/);
      if (!cmd) return;
      const c = COMMANDS[cmd.toLowerCase()];
      if (!c) { print(`lordsh: command not found: ${cmd}  (try \`help\`)`); Audio.error(); return; }
      const res = c.r(args);
      print(res, !!c.html);
    };
    ghost.addEventListener('input', () => { typed.textContent = ghost.value; Audio.key(); });
    ghost.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); Audio.enter(); run(ghost.value); ghost.value = ''; typed.textContent = ''; scrollEnd(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (term.hi > 0) { term.hi--; ghost.value = typed.textContent = term.history[term.hi]; } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (term.hi < term.history.length) { term.hi++; ghost.value = typed.textContent = term.history[term.hi] || ''; } }
      else if (e.key === 'Tab') { e.preventDefault(); const v = ghost.value; const m = Object.keys(COMMANDS).filter((k) => !COMMANDS[k].hidden && k.startsWith(v)); if (m.length === 1) ghost.value = typed.textContent = m[0] + ' '; else if (m.length > 1 && v) print(m.join('  ')); }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
      else if (e.key === 'c' && e.ctrlKey) { e.preventDefault(); print(`anon@9lord:~$ ${ghost.value}^C`); ghost.value = typed.textContent = ''; }
      e.stopPropagation();
    });
    const scrollEnd = () => { const c = t.closest('.content'); if (c) c.scrollTop = c.scrollHeight; };
    t.addEventListener('click', () => ghost.focus());
    ghost.addEventListener('focus', () => t.classList.remove('idle'));
    ghost.addEventListener('blur', () => t.classList.add('idle'));
    const obs = new MutationObserver(scrollEnd); obs.observe(out, { childList: true });
    return {
      title: 'Terminal', w: 430, h: 250, cls: 'terminal', body: t,
      onMount: () => setTimeout(() => ghost.focus({ preventScroll: true }), 50),
      onFocus: () => setTimeout(() => ghost.focus({ preventScroll: true }), 0),
      onClose: () => obs.disconnect(),
    };
  }

  /* ------------------------------------------------------------- matrix fx */
  function matrix(sec = 6) {
    const fx = $('#fx'); if (fx.querySelector('canvas')) return;
    const c = el('canvas', { width: 512, height: 342 }); fx.append(c);
    const ctx = c.getContext('2d'), cols = Math.floor(512 / 12), drops = Array.from({ length: cols }, () => Math.random() * -40);
    const chars = '01\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B39LORD\u20BF$\u00A5';
    const col = getComputedStyle(room).getPropertyValue('--ph-bright').trim() || '#b8f0f6';
    const bg = getComputedStyle(room).getPropertyValue('--ph-bg').trim() || '#020809';
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 342);
    const t0 = performance.now();
    (function frame(now) {
      ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(0, 0, 512, 342);
      ctx.fillStyle = col; ctx.font = '15px VT323, monospace';
      drops.forEach((y, i) => { ctx.fillText(chars[Math.random() * chars.length | 0], i * 12, y * 14); if (y * 14 > 342 && Math.random() > .97) drops[i] = 0; drops[i]++; });
      if (now - t0 < sec * 1000) requestAnimationFrame(frame);
      else { c.style.transition = 'opacity .7s'; c.style.opacity = 0; setTimeout(() => c.remove(), 700); }
    })(t0);
  }

  /* ------------------------------------------------------------ plain text */
  const plain = $('#plain');
  function showPlain() {
    if (!plain.dataset.built) {
      $('#plainBody').innerHTML = `
        <h1>${esc(PROFILE.name)}</h1>
        <p class="dim">@${PROFILE.handle} \u00B7 ${esc(PROFILE.location)} \u00B7 ${esc(PROFILE.company)}</p>
        <p>${esc(PROFILE.bio)} ${esc(PROFILE.tagline)}</p>
        <p>${extA(PROFILE.github, 'GitHub')} \u00B7 ${extA(PROFILE.xurl, 'X')}</p>
        <h2>Now</h2><ul>${PROFILE.now.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
        <h2>Projects</h2>${PROJECTS.map((p) => `<div class="card"><div class="name">${esc(p.name)}</div><div class="kind">${esc(p.kind)} \u00B7 ${esc(p.lang)}</div><p>${esc(p.blurb)}</p><div class="tags">${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div><p>${extA('https://github.com/9lordisgod/' + p.repo, 'GitHub \u2197')}${p.live ? ' \u00B7 ' + extA(p.live, 'Live \u2197') : ''}</p></div>`).join('')}
        <h2>Philosophy \u2014 on life</h2>${PHILOSOPHY.life.map(quoteHtml).join('')}
        <h2>Philosophy \u2014 on tech</h2>${PHILOSOPHY.tech.map(quoteHtml).join('')}
        <h2>Links</h2><ul>${LINKS.map((l) => `<li>${extA(l.url, l.label)} <span class="dim">\u2014 ${esc(l.note)}</span></li>`).join('')}</ul>
        <p class="dim">\u00A9 2026 ${esc(PROFILE.name)}. ${extA('https://github.com/9lordisgod/williemkingdom.ca', 'Source of this site')}.</p>`;
      plain.dataset.built = '1';
    }
    plain.hidden = false; plain.scrollTop = 0; plain.focus({ preventScroll: true });
    if (location.hash !== '#text') history.replaceState(null, '', '#text');
  }
  function hidePlain() { plain.hidden = true; if (location.hash === '#text') history.replaceState(null, '', location.pathname + location.search); }
  $('#plainLink').addEventListener('click', (e) => { e.preventDefault(); showPlain(); });
  $('#plainBack').addEventListener('click', (e) => { e.preventDefault(); hidePlain(); });
  addEventListener('hashchange', () => { location.hash === '#text' ? showPlain() : hidePlain(); });

  /* --------------------------------------------------------------- keyboard */
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!plain.hidden) { if (e.key === 'Escape') hidePlain(); return; }
    const typing = e.target.matches('input,textarea');
    if (state === 'off') { if (!typing && (e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'p')) { e.preventDefault(); powerOn(); } return; }
    if (state === 'booting') { if (['Escape', 'Enter', ' '].includes(e.key)) { e.preventDefault(); finishBoot(); } return; }
    if (state !== 'on') return;
    if (e.key === 'Escape') { if (openMenu) closeMenus(); else if (topWindow()) closeWindow(topWindow()); else if (zoomed) setZoom(false); return; }
    if (typing) return;
    const k = e.key.toLowerCase();
    if (k === 'z') setZoom(!zoomed);
    else if (k === 't') openWindow('terminal');
    else if (k === 'm') toggleSound();
  });

  /* ---------------------------------------------------------- URL switches */
  const q = new URLSearchParams(location.search);
  if (location.hash === '#text') showPlain();
  if (q.has('zoom')) setZoom(true, false);
  if (q.has('boot') || q.has('on')) setTimeout(powerOn, 200);
})();
