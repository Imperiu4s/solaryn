/* A főoldal saját működése: élő adatok a backendről, játékmódok, karakter, GYIK-kereső. */
(function () {
  'use strict';

  function init() {
    const S = window.SolarSite;
    const { $, $$, ico, esc, store, discover, loadCharacter, reduced } = S;
    const API = window.SolarTheme.BACKEND;
    const HU = 'hu-HU';
    const fmtDate = (d) => new Date(d).toLocaleDateString(HU, { year: 'numeric', month: 'long', day: 'numeric' });
    const fmtNum = (n) => Number(n).toLocaleString(HU);

    // ---- Felirat az égi betűk mellett ------------------------------------------------------------
    const SPLASH = [
      'Saját anticheat!', 'Nem Pay2Win!', '100% ingyenes!', 'Saját kliens!', '60 BedWars-aréna!', 'Van zene modul!', 'Rajzolj célkeresztet!',
      '200+ bővítmény!', 'Falfutás!', 'Igazi labda!', 'Dalszöveg az égen!', 'Bibircsók a legjobb!', 'Magyar közösség!', 'Nyomd meg a T-t!', 'Üstökös-zuhanás!'
    ];
    const splash = $('#heroSplash');
    function placeSplash() {
      const w = window.solarWorld;
      if (!splash || !w || !w.lettersPos) return;
      const x = (w.lettersPos.x + w.lettersW - 12) * w.scale;
      const y = (w.lettersPos.y + 22) * w.scale;
      splash.style.left = `${Math.round(x)}px`;
      splash.style.top = `${Math.round(y)}px`;
      splash.classList.add('on');
    }
    if (splash) {
      splash.textContent = SPLASH[Math.floor(Math.random() * SPLASH.length)];
      setTimeout(placeSplash, 200);
      document.addEventListener('solar:worldready', () => setTimeout(placeSplash, 60));
    }

    // ---- A tulajdonosok a spawnon állnak ------------------------------------------------------------
    function loadOwners() {
      const w = window.solarWorld;
      if (!w) return;
      const owners = [['Kisskorboy', 'kisskorboy'], ['Imperiussss', 'imperiussss'], ['Distance', 'distance']];
      Promise.all(owners.map(([name, file]) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ name, img });
        img.onerror = () => resolve(null);
        img.src = `assets/team/${file}.png`;
      }))).then((list) => w.setFriends(list.filter(Boolean)));
    }
    loadOwners();

    // ---- Saját karakter -----------------------------------------------------------------------------
    const form = $('#joinForm');
    if (form) {
      const input = $('#joinName');
      const msg = $('#joinMsg');
      const sug = $('#joinSug');
      const saved = store.get('solaryn.player', null);
      if (saved) { input.value = saved; msg.textContent = `${saved} a spawnon áll.`; }
      let t = null;
      let seq = 0;
      const closeSug = () => { sug.hidden = true; sug.innerHTML = ''; };
      input.addEventListener('input', () => {
        clearTimeout(t);
        const q = input.value.trim();
        if (q.length < 2) { closeSug(); return; }
        t = setTimeout(async () => {
          const my = ++seq;
          try {
            const res = await fetch(`${API}/api/players/search?q=${encodeURIComponent(q)}&limit=5`);
            const data = await res.json();
            if (my !== seq) return;
            const players = (data.players || []).slice(0, 5);
            sug.innerHTML = players.map((p) => `<button type="button" role="option" data-name="${esc(p.username)}">${esc(p.username)}</button>`).join('');
            sug.hidden = !players.length;
          } catch { closeSug(); }
        }, 220);
      });
      sug.addEventListener('click', (e) => {
        const b = e.target.closest('[data-name]');
        if (!b) return;
        input.value = b.dataset.name;
        closeSug();
        form.requestSubmit();
      });
      document.addEventListener('click', (e) => { if (!form.contains(e.target)) closeSug(); });
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        closeSug();
        const name = input.value.trim();
        if (!/^[A-Za-z0-9_]{3,16}$/.test(name)) { msg.textContent = 'A név 3-16 karakter: betű, szám, aláhúzás.'; return; }
        msg.textContent = 'Keresünk...';
        let exact = null;
        try {
          const res = await fetch(`${API}/api/players/search?q=${encodeURIComponent(name)}&limit=20`);
          const data = await res.json();
          exact = (data.players || []).find((p) => p.username.toLowerCase() === name.toLowerCase());
        } catch {
          msg.textContent = 'Most nem érjük el a szervert. Próbáld újra később.';
          return;
        }
        if (!exact) { msg.textContent = 'Nincs ilyen játékos. Regisztrálj a SolarCenterben!'; return; }
        loadCharacter(exact.username, (ok) => {
          if (!ok) { msg.textContent = 'A karaktert most nem sikerült betölteni.'; return; }
          store.set('solaryn.player', exact.username);
          input.value = exact.username;
          msg.textContent = `${exact.username} a spawnon áll.`;
          discover('character');
        });
      });
    }

    // ---- Élő verzióadatok -----------------------------------------------------------------------------
    (async function liveVersion() {
      try {
        const res = await fetch(`${API}/updates/latest.yml`);
        if (!res.ok) return;
        const yml = await res.text();
        const version = (yml.match(/^version:\s*(.+)$/m) || [])[1];
        const size = (yml.match(/size:\s*(\d+)/) || [])[1];
        const date = (yml.match(/^releaseDate:\s*'?([^'\n]+)'?$/m) || [])[1];
        if (!version) return;
        const mb = size ? Math.round(Number(size) / 1048576) : null;
        const v = $('[data-live="version"]');
        if (v) v.textContent = `SolarClient ${version.trim()}${date ? ', ' + fmtDate(date) : ''}`;
        const d = $('[data-live="details"]');
        if (d) d.textContent = `Windows 10/11, 64 bit, a telepítő ${mb ? mb + ' MB' : 'kb. 80 MB'}, a játékfájlokat az első indításkor tölti le.`;
        const m = $('[data-live="meta"]');
        if (m) m.textContent = `Windows 10/11, 64 bit, ${mb ? mb + ' MB' : 'kb. 80 MB'}, verzió: ${version.trim()}`;
      } catch {}
    })();

    // ---- Játékmódok: blokkonként omlik le az előző kép ------------------------------------------------
    (function modes() {
      const root = $('#modes');
      if (!root) return;
      const tabs = $$('.mode-tab', root);
      const panels = $$('.mode', root);
      const wipe = $('.modes-wipe', root);
      const stage = $('.modes-stage', root);
      let raf = 0;

      function drawCover(ctx, img, w, h) {
        const ir = img.naturalWidth / img.naturalHeight;
        const r = w / h;
        const sw = ir > r ? img.naturalHeight * r : img.naturalWidth;
        const sh = ir > r ? img.naturalHeight : img.naturalWidth / r;
        ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, w, h);
      }

      function runWipe(fromImg, fromShot) {
        cancelAnimationFrame(raf);
        wipe.classList.remove('on');
        if (reduced() || !fromImg || !fromImg.complete || !fromImg.naturalWidth) return;
        const r = fromShot.getBoundingClientRect();
        const st = stage.getBoundingClientRect();
        const w = Math.round(r.width), h = Math.round(r.height);
        if (!w || !h) return;
        wipe.width = w; wipe.height = h;
        wipe.style.left = `${Math.round(r.left - st.left)}px`;
        wipe.style.top = `${Math.round(r.top - st.top)}px`;
        wipe.style.width = `${w}px`;
        wipe.style.height = `${h}px`;
        const ctx = wipe.getContext('2d');
        drawCover(ctx, fromImg, w, h);
        wipe.classList.add('on');
        const size = 40;
        const cells = [];
        for (let y = 0; y < h; y += size) {
          for (let x = 0; x < w; x += size) cells.push({ x, y, at: (y / h) * 0.6 + Math.random() * 0.4 });
        }
        cells.sort((a, b) => a.at - b.at);
        const dur = 460;
        const t0 = performance.now();
        let i = 0;
        const step = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          while (i < cells.length && cells[i].at <= p) { ctx.clearRect(cells[i].x, cells[i].y, size, size); i++; }
          if (p < 1) raf = requestAnimationFrame(step);
          else wipe.classList.remove('on');
        };
        raf = requestAnimationFrame(step);
      }

      function select(key, focus) {
        const tab = tabs.find((t) => t.dataset.mode === key);
        const next = $(`#mode-${key}`, root);
        const prev = panels.find((p) => p.classList.contains('active'));
        if (!tab || !next || next === prev) return;
        const prevShot = prev ? $('.mode-shot', prev) : null;
        const prevImg = prevShot ? $('img', prevShot) : null;
        runWipe(prevImg, prevShot);
        panels.forEach((p) => p.classList.toggle('active', p === next));
        tabs.forEach((t) => {
          const on = t === tab;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
        });
        if (focus) tab.focus();
      }

      tabs.forEach((t, i) => {
        t.addEventListener('click', () => select(t.dataset.mode));
        t.addEventListener('keydown', (e) => {
          const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!dir) return;
          e.preventDefault();
          const n = tabs[(i + dir + tabs.length) % tabs.length];
          select(n.dataset.mode, true);
        });
      });

      // Mire odaér a látogató, a képek már ott legyenek, különben nincs mit lebontani.
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((en) => {
          if (!en.some((e) => e.isIntersecting)) return;
          $$('img', root).forEach((img) => { img.loading = 'eager'; });
          io.disconnect();
        }, { rootMargin: '600px 0px' });
        io.observe(root);
      }
    })();

    // ---- Inventory: a kiválasztott slot leírása ---------------------------------------------------------
    (function inventory() {
      const box = $('#inv');
      const detail = $('#invDetail');
      if (!box || !detail) return;
      const slots = $$('.inv-slot', box);
      const show = (slot) => {
        slots.forEach((s) => {
          const on = s === slot;
          s.classList.toggle('active', on);
          s.setAttribute('aria-pressed', String(on));
        });
        detail.innerHTML = $('.inv-text', slot.parentElement).innerHTML;
      };
      slots.forEach((s) => {
        s.addEventListener('pointerenter', () => show(s));
        s.addEventListener('focus', () => show(s));
        s.addEventListener('click', () => show(s));
      });
      if (slots[0]) show(slots[0]);
    })();

    // ---- Frissítési napló --------------------------------------------------------------------------------
    (async function changelog() {
      const box = $('#changelog');
      const more = $('#changelogMore');
      if (!box) return;
      let entries = [];
      try {
        const res = await fetch('data/changelog.json');
        const data = await res.json();
        entries = data.entries || [];
      } catch { return; }
      if (!entries.length) return;
      const PAGE_SIZE = 4;
      let shown = 0;
      box.innerHTML = '';
      const render = () => {
        const part = entries.slice(shown, shown + PAGE_SIZE);
        part.forEach((e, i) => {
          const d = document.createElement('details');
          d.className = 'log-entry';
          if (shown === 0 && i === 0) d.open = true;
          d.innerHTML = `<summary><b class="log-v">${esc(e.version)}</b><span class="log-title">${esc(e.title)}</span><time datetime="${esc(e.date)}">${esc(fmtDate(e.date))}</time>${ico('arrow')}</summary><ul>${e.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>`;
          box.appendChild(d);
        });
        shown += part.length;
        more.hidden = shown >= entries.length;
      };
      render();
      more.addEventListener('click', render);
    })();

    // ---- Élő bolt-előzetes: rangok és akciós csomag -----------------------------------------------------
    const RANK_THEMES = {
      helios: { c1: '#ffb347', c2: '#ff6a1a', ink: '#2b1203' },
      chronovoid: { c1: '#b197fc', c2: '#5b4bdb', ink: '#ffffff' },
      immortal: { c1: '#ff6b86', c2: '#c8163f', ink: '#ffffff' },
      young: { c1: '#5ee29a', c2: '#0fa3b8', ink: '#032a22' },
      solaryn: { c1: '#ffe27a', c2: '#ff9d17', ink: '#2e1c02' }
    };
    (async function ranks() {
      const box = $('#ranks');
      if (!box) return;
      try {
        const res = await fetch(`${API}/api/shop/ranks`);
        const data = await res.json();
        const list = (data.ranks || []).filter((r) => r && r.id);
        if (!list.length) return;
        box.innerHTML = list.map((r) => {
          const t = RANK_THEMES[r.id] || RANK_THEMES.solaryn;
          const perk = (r.perms || [])[0] || '';
          const price = r.priceCoins != null ? `${fmtNum(r.priceCoins)} PP` : '';
          return `<a class="rank" href="https://center.solaryn.hu" style="--rank-c1:${t.c1};--rank-c2:${t.c2};--rank-ink:${t.ink}">
            <span class="rank-flag">${window.pxRankBanner ? window.pxRankBanner(r.id) : ''}</span>
            <b class="rank-name">${esc(r.label || r.id)}</b>
            <span class="rank-price">${esc(price)}${r.duration ? ` <small>/ ${esc(r.duration)}</small>` : ''}</span>
            <span class="rank-perk">${esc(perk)}</span>
          </a>`;
        }).join('');
        box.hidden = false;
        document.dispatchEvent(new CustomEvent('solar:layout'));
      } catch {}
    })();

    (async function bundle() {
      const slot = $('#bundleSlot');
      if (!slot) return;
      try {
        const res = await fetch(`${API}/api/bundles`);
        const data = await res.json();
        const now = Date.now();
        const b = (data.bundles || []).find((x) => (!x.endsAt || new Date(x.endsAt).getTime() > now) && (!x.startsAt || new Date(x.startsAt).getTime() <= now));
        if (!b) return;
        const ends = b.endsAt ? new Date(b.endsAt).getTime() : null;
        slot.innerHTML = `<a class="bundle card" href="https://center.solaryn.hu">
          ${b.imageUrl ? `<img src="${esc(API + b.imageUrl)}" alt="" width="320" height="320" loading="lazy">` : ''}
          <div class="bundle-body">
            <p class="bundle-kicker">Most kapható</p>
            <h3>${esc(b.name)}</h3>
            <p>${esc(b.description || '')}</p>
            <p class="bundle-price">${b.pricePp != null ? esc(fmtNum(b.pricePp)) + ' PP' : ''}${ends ? ' · <span id="bundleLeft"></span>' : ''}</p>
          </div>
        </a>`;
        slot.hidden = false;
        if (ends) {
          const left = $('#bundleLeft');
          const tick = () => {
            const ms = ends - Date.now();
            if (ms <= 0) { slot.hidden = true; clearInterval(timer); return; }
            const s = Math.floor(ms / 1000);
            const d = Math.floor(s / 86400);
            const pad = (n) => String(n).padStart(2, '0');
            left.textContent = `még ${d > 0 ? d + ' nap ' : ''}${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
          };
          const timer = setInterval(tick, 1000);
          tick();
        }
      } catch {}
    })();

    // ---- A csapat 3D-s karakterei, csak ha látszanak -----------------------------------------------------
    (function team() {
      if (typeof SkinPreview === 'undefined') return;
      const canvases = $$('canvas[data-skin]');
      const start = (c) => {
        if (c.dataset.started) return;
        c.dataset.started = '1';
        const img = new Image();
        img.onload = () => SkinPreview.start(c, img, false);
        img.src = c.dataset.skin;
      };
      if (!('IntersectionObserver' in window)) { canvases.forEach(start); return; }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          en.target.dataset.offscreen = en.isIntersecting ? '0' : '1';
          if (en.isIntersecting) start(en.target);
        });
      }, { rootMargin: '200px 0px' });
      canvases.forEach((c) => io.observe(c));
    })();

    // ---- GYIK-kereső ---------------------------------------------------------------------------------------
    (function faq() {
      const input = $('#faqSearch');
      const none = $('#faqNone');
      if (!input) return;
      const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const items = $$('#faqList .faq-item').map((el) => ({ el, text: norm(el.textContent) }));
      input.addEventListener('input', () => {
        const terms = norm(input.value.trim()).split(/\s+/).filter(Boolean);
        let hits = 0;
        items.forEach(({ el, text }) => {
          const hit = terms.every((t) => text.includes(t));
          el.hidden = !hit;
          if (hit) hits++;
        });
        none.hidden = hits > 0;
      });
    })();

  }

  if (window.SolarSite) init();
  else document.addEventListener('solar:ready', init);
})();
