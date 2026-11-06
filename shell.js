/* A weboldal kerete minden oldalon: világ, felső sáv, hotbar, világválasztó, felfedezések, parancssor.
   A világmotor (world.js) és a pixel-ikonok a SolarCenterből jönnek, hogy a kettő egy világ legyen. */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const ico = (n) => (window.pxIcon ? window.pxIcon(n) : '');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  const root = document.documentElement;
  const BASE = document.body.dataset.root || '';
  const PAGE = document.body.dataset.page || 'home';
  const IS_HOME = PAGE === 'home';
  const IP = 'play.solaryn.hu';
  const DISCORD = 'https://dc.solaryn.hu';
  const CENTER = 'https://center.solaryn.hu';
  const themeKey = () => window.SolarTheme.current();
  let world = null;

  // Az index.html ne maradjon a címsorban.
  if (window.history && history.replaceState && /\/index\.html$/i.test(location.pathname)) {
    history.replaceState(null, '', location.pathname.replace(/index\.html$/i, '') + location.search + location.hash);
  }

  // ---- Helyek -------------------------------------------------------------------------------------
  const anchor = (id) => (IS_HOME ? '#' + id : BASE + '#' + id);
  const SLOTS = [
    { id: 'kezdolap', icon: 'home', label: 'Kezdőlap', href: anchor('kezdolap') },
    { id: 'jatekmodok', icon: 'sword', label: 'Játékmódok', href: anchor('jatekmodok') },
    { id: 'kliens', icon: 'download', label: 'Kliens', href: anchor('kliens') },
    { id: 'ujdonsagok', icon: 'list', label: 'Újdonságok', href: anchor('ujdonsagok') },
    { id: 'solarcenter', icon: 'crown', label: 'SolarCenter', href: anchor('solarcenter') },
    { id: 'csapat', icon: 'people', label: 'Csapat', href: anchor('csapat') },
    { id: 'gyik', icon: 'book', label: 'GYIK', href: anchor('gyik') },
    { id: 'solarnet', icon: 'network', label: 'SolarNet', href: BASE + 'solarnet/' },
    { id: 'szabalyzat', icon: 'hammer', label: 'Szabályzat', href: BASE + 'szabalyzat/' }
  ];
  const PLACES = [
    { id: 'kezdolap', label: 'Kezdőlap', icon: 'home', href: anchor('kezdolap') },
    { id: 'rolunk', label: 'Rólunk', icon: 'sun', href: anchor('rolunk') },
    { id: 'jatekmodok', label: 'Játékmódok', icon: 'sword', href: anchor('jatekmodok') },
    { id: 'kliens', label: 'Kliens', icon: 'download', href: anchor('kliens') },
    { id: 'ujdonsagok', label: 'Újdonságok', icon: 'list', href: anchor('ujdonsagok') },
    { id: 'solarcenter', label: 'SolarCenter', icon: 'crown', href: anchor('solarcenter') },
    { id: 'csapat', label: 'Csapat', icon: 'people', href: anchor('csapat') },
    { id: 'gyik', label: 'GYIK', icon: 'book', href: anchor('gyik') },
    { id: 'kozosseg', label: 'Közösség', icon: 'discord', href: anchor('kozosseg') }
  ];
  const ELSEWHERE = [
    { id: 'solarnet', label: 'SolarNet partnerprogram', icon: 'network', href: BASE + 'solarnet/' },
    { id: 'szabalyzat', label: 'Játékszabályzat', icon: 'hammer', href: BASE + 'szabalyzat/' },
    { id: 'jogi', label: 'Jogi dokumentumok', icon: 'book', href: BASE + 'jogi/' },
    { id: 'center', label: 'SolarCenter megnyitása', icon: 'crown', href: CENTER, ext: true },
    { id: 'discord', label: 'Discord', icon: 'discord', href: DISCORD, ext: true }
  ];

  // ---- Világ ---------------------------------------------------------------------------------------
  function syncGeometry() {
    if (!world) return;
    root.style.setProperty('--ground-css', `${world.groundCss}px`);
    const foot = $('.foot');
    if (foot) root.style.setProperty('--bed-h', `${foot.offsetHeight + 40}px`);
    placeTorches();
  }

  function applyShadow() {
    if (!world) return;
    const sol = world.solarNow();
    const p = sol.sunP >= 0 && sol.sunP <= 1 ? sol.sunP : 0.5;
    root.style.setProperty('--sh-x', `${Math.round((0.5 - p) * 10)}px`);
  }

  function refreshRunning() {
    if (!world) return;
    if (!document.hidden && !reduced()) world.start();
    else { world.stop(); world.drawOnce(); }
  }

  function placeTorches() {
    const shaft = $('.shaft');
    if (!shaft) return;
    $$('.torch', shaft).forEach((t) => t.remove());
    const h = shaft.offsetHeight;
    let side = 0;
    for (let y = 150; y < h - 480; y += 440) {
      const t = document.createElement('i');
      t.className = 'torch ' + (side++ % 2 ? 'torch-r' : 'torch-l');
      t.style.top = `${y}px`;
      t.style.setProperty('--d', `${(y % 7) / 10}s`);
      shaft.appendChild(t);
    }
  }

  function mountWorld() {
    const sky = $('#worldSky');
    if (!sky || !window.SolarWorld) return;
    world = new window.SolarWorld.World(sky, { groundRows: 18 });
    window.solarWorld = world;
    world.showLetters = IS_HOME;
    world.setView(document.body.dataset.view || 'home', { instant: true });
    const onTheme = () => {
      world.setTheme(themeKey());
      window.SolarWorld.applyStrata(root, themeKey(), world.scale);
      applyShadow();
      refreshRunning();
      document.dispatchEvent(new CustomEvent('solar:worldready'));
    };
    new MutationObserver(onTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    onTheme();
    syncGeometry();
    let resizeT = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        world.resize();
        window.SolarWorld.applyStrata(root, themeKey(), world.scale);
        syncGeometry();
        document.dispatchEvent(new CustomEvent('solar:worldready'));
      }, 120);
    });
    document.addEventListener('visibilitychange', refreshRunning);
    setInterval(() => { if (world.running) world.rebuild(); applyShadow(); }, 5 * 60 * 1000);
    // A lap hossza a képek betöltése után még változik.
    window.addEventListener('load', syncGeometry);
    if (window.ResizeObserver) {
      let t = null;
      new ResizeObserver(() => { clearTimeout(t); t = setTimeout(syncGeometry, 200); }).observe(document.body);
    }
  }

  // ---- Saját karakter a világban ---------------------------------------------------------------------
  function loadCharacter(name, done) {
    if (!world) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { world.setSkin(img, name); if (done) done(true); };
    img.onerror = () => {
      const def = new Image();
      def.onload = () => { world.setSkin(def, name); if (done) done(true); };
      def.onerror = () => { if (done) done(false); };
      def.src = BASE + 'assets/default-skin.png';
    };
    img.src = `${window.SolarTheme.BACKEND}/api/skin/${encodeURIComponent(name)}`;
  }

  // ---- Felfedezések -----------------------------------------------------------------------------------
  const KEY = 'solaryn.discoveries';
  const THEME_NAMES = {
    solaryn: 'Solaryn sötét', 'solaryn-light': 'Solaryn világos', ice: 'Jégkék', crimson: 'Bíbor', emerald: 'Smaragd', amethyst: 'Ametiszt', turquoise: 'Türkiz',
    halloween: 'Halloween', christmas: 'Karácsony', newyear: 'Újév', valentine: 'Valentin-nap', carnival: 'Farsang', easter: 'Húsvét', national: 'Nemzeti ünnep', summer: 'Nyár'
  };
  const TREASURE_ICON = { sun: 'gem', nugget: 'gem', star: 'gem', ember: 'gem', gem: 'gem', geode: 'gem', pearl: 'gem', skull: 'skull', gift: 'gift', cork: 'coin', heart: 'heart', mask: 'mask', egg: 'egg', cockade: 'shield', chest: 'chest' };
  // Hol van elásva az adott világ kincse: a lap hosszának hányadik részénél, melyik oldalon.
  const TREASURE_AT = { solaryn: [0.34, 0], 'solaryn-light': [0.62, 1], ice: [0.2, 1], crimson: [0.48, 0], emerald: [0.72, 0], amethyst: [0.28, 1], turquoise: [0.55, 1], halloween: [0.42, 1], christmas: [0.38, 0], newyear: [0.66, 1], valentine: [0.5, 0], carnival: [0.24, 0], easter: [0.58, 0], national: [0.3, 1], summer: [0.46, 1] };
  const SECRETS = {
    'solaryn-light': { hit: 'sun', n: 3, id: 's:light', t: 'Naptej', d: 'Háromszor belenéztél a Napba a világos világban.', h: 'A Napos dombokon.' },
    ice: { hit: 'prop:snowman', n: 3, id: 's:ice', t: 'Olvadáspont', d: 'Addig bökdösted a hóembert, amíg megunta.', h: 'Valaki áll a hóban.' },
    crimson: { hit: 'moon', n: 3, id: 's:crimson', t: 'Vérhold', d: 'Megbámultad a vörös Holdat. Ő is téged.', h: 'Nézz fel a parázsföldön.' },
    emerald: { hit: 'firefly', n: 5, id: 's:emerald', t: 'Befőttesüveg', d: 'Elkaptál öt szentjánosbogarat.', h: 'Az erdőben valami világít.' },
    amethyst: { hit: 'prop:crystal', n: 4, id: 's:amethyst', t: 'Kristályhárfa', d: 'Négy kristályt szólaltattál meg.', h: 'A völgyben minden csendül.' },
    turquoise: { hit: 'bubble', n: 20, id: 's:turquoise', t: 'Buborékpukkasztó', d: 'Húsz buborék. Remek délután volt.', h: 'A víz alatt mindig van mit pukkasztani.' },
    halloween: { hit: 'prop:pumpkin', n: 3, id: 's:halloween', t: 'Tökfej', d: 'Három tököt zörgettél meg.', h: 'Ki faragta ezeket?' },
    christmas: { hit: 'prop:present', n: 3, id: 's:christmas', t: 'Korai kibontás', d: 'Még nincs is karácsony este.', h: 'Valami a fa alatt vár.' },
    newyear: { hit: 'sky', n: 10, id: 's:newyear', t: 'Tűzszerész', d: 'Tíz rakétát lőttél fel kézzel.', h: 'Az ég a határ. Szó szerint.' },
    valentine: { hit: 'prop:heart', n: 3, id: 's:valentine', t: 'Szívtipró', d: 'Három szívbokrot simogattál meg.', h: 'A rózsakertben.' },
    carnival: { hit: 'prop:mask', n: 2, id: 's:carnival', t: 'Álarcosbál', d: 'Felpróbáltad az álarcokat.', h: 'Ki van mögötte?' },
    easter: { hit: 'prop:egg', n: 3, id: 's:easter', t: 'Tojásvadász', d: 'Három hímes tojást találtál a réten.', h: 'A fűben keresd.' },
    national: { hit: 'prop:flag', n: 1, id: 's:national', t: 'Zászlófelvonás', d: 'Tisztelegtél a zászló előtt.', h: 'Az ünnepi téren leng valami.' },
    summer: { hit: 'prop:sandcastle', n: 3, id: 's:summer', t: 'Homokvár-építész', d: 'Háromszor javítottad ki a vár bástyáját.', h: 'A parton.' }
  };
  const GLOBAL = [
    { id: 'ip', t: 'Készen a csatlakozásra', d: 'Kimásoltad a szerver címét.', h: 'A cím ott van a főoldal tetején.', i: 'copy' },
    { id: 'download', t: 'Indulhat a játék', d: 'Letöltötted a hivatalos klienst.', h: 'Ez a legfontosabb gomb.', i: 'download' },
    { id: 'character', t: 'Ez te vagy', d: 'Beléptetted a karakteredet a világba.', h: 'A spawnon van még hely.', i: 'skin' },
    { id: 'depths', t: 'Az aljáig', d: 'Leértél a világ legaljára, az alapkőzetig.', h: 'Görgess. Sokáig.', i: 'pick' },
    { id: 'console', t: 'Parancssor', d: 'Kiadtad az első parancsodat.', h: 'Nyomd meg a T gombot.', i: 'terminal' },
    { id: 'sun', t: 'Ne nézz bele', d: 'Ötször megböktéd a Napot.', h: 'Valami fényes van az égen.', i: 'sun' },
    { id: 'moon', t: 'Holdkóros', d: 'Ötször megböktéd a Holdat.', h: 'Éjszaka keresd.', i: 'moon' },
    { id: 'star', t: 'Kívánság', d: 'Elkaptál egy hullócsillagot.', h: 'Ritka, és gyors.', i: 'sun' },
    { id: 'portal', t: 'Átjáró', d: 'Átléptél a portálon.', h: 'A főkapu nem csak dísz.', i: 'key' },
    { id: 'critter', t: 'Állatbarát', d: 'Tízszer megsimogattad a jószágokat.', h: 'Ők is itt élnek.', i: 'heart' },
    { id: 'letters', t: 'Bontási engedély', d: 'Lebontottad a feliratot az égről. Reméljük, örülsz.', h: 'A betűk csak lazán állnak.', i: 'hammer' },
    { id: 'konami', t: 'Régi iskola', d: 'Ismered a klasszikus kódot.', h: 'Fel, fel, le, le...', i: 'wrench' },
    { id: 'builder', t: 'Építőmester', d: 'Tíz blokkot raktál a világba.', h: 'Először kreatív mód kell.', i: 'menu' },
    { id: 'f3', t: 'Hibakereső', d: 'Belenéztél a világ számaiba.', h: 'Egy régi billentyű.', i: 'list' },
    { id: 'kill', t: 'Újjászületés', d: 'Parancsba adtad a saját halálodat.', h: 'Van rá parancs.', i: 'skull' },
    { id: 'bedrock', t: 'Törhetetlen', d: 'Ötször csákányoztad az alapkőzetet.', h: 'Görgess le a legaljára.', i: 'hammer' },
    { id: 'photo', t: 'Fotómód', d: 'Eltüntetted a felületet, hogy lásd a tájat.', h: 'Néző módba is kapcsolhatsz.', i: 'search' },
    { id: 'word', t: 'Varázsszó', d: 'Kimondtad a szerver nevét.', h: 'Gépeld be, hogy hová tartozol.', i: 'pen' },
    { id: 'midnight', t: 'Éjszakai műszak', d: 'Éjfél után is itt vagy.', h: 'Gyere el nagyon későn.', i: 'moon' },
    { id: 'dawn', t: 'Korán kelő', d: 'Hajnalban néztél be.', h: 'Gyere el nagyon korán.', i: 'sun' },
    { id: 'fullmoon', t: 'Telihold', d: 'Teliholdkor jártál erre.', h: 'A valódi Holdat figyeld.', i: 'moon' },
    { id: 'tourist', t: 'Világjáró', d: 'Végignézted az összes alap világot.', h: 'Válts világot többször.', i: 'globe' },
    { id: 'miner', t: 'Bányász', d: 'Tizenhat blokkot bontottál ki a kőzetből.', h: 'Az akna fala mögött nem csak dísz a kő.', i: 'pick' }
  ];

  function catalog() {
    const items = GLOBAL.map((g) => Object.assign({ group: 'Világszerte' }, g));
    const S = window.SolarWorld ? window.SolarWorld.STRATA : {};
    Object.keys(THEME_NAMES).forEach((k) => {
      const st = S[k];
      if (st) items.push({ id: 't:' + k, group: THEME_NAMES[k], t: st.name, d: 'Kiástad a föld alól.', h: 'A főoldalon, valahol az akna falán túl, ebben a világban.', i: TREASURE_ICON[st.treasure] || 'gem' });
      const sc = SECRETS[k];
      if (sc) items.push({ id: sc.id, group: THEME_NAMES[k], t: sc.t, d: sc.d, h: sc.h, i: 'trophy' });
    });
    return items;
  }
  const found = store.get(KEY, {});
  const has = (id) => !!found[id];

  let audio = null;
  const soundOn = () => store.get('solaryn.sound', false);
  function blip(notes, type, vol) {
    if (!soundOn()) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      let t = audio.currentTime;
      notes.forEach(([f, d]) => {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.type = type || 'square';
        o.frequency.value = f;
        g.gain.setValueAtTime(vol || 0.04, t);
        g.gain.linearRampToValueAtTime(0, t + d);
        o.connect(g).connect(audio.destination);
        o.start(t);
        o.stop(t + d);
        t += d * 0.9;
      });
    } catch {}
  }
  const CHIME = [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.16]];

  function discover(id) {
    if (has(id)) return false;
    const item = catalog().find((c) => c.id === id);
    if (!item) return false;
    found[id] = Date.now();
    store.set(KEY, found);
    const el = document.createElement('div');
    el.className = 'discover-toast';
    el.setAttribute('role', 'status');
    el.innerHTML = `${ico(item.i)}<div><small>Felfedezés</small><b>${esc(item.t)}</b><p>${esc(item.d)}</p></div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5200);
    blip(CHIME);
    return true;
  }

  function openList() {
    closeList();
    const items = catalog();
    const groups = [];
    items.forEach((c) => { if (!groups.includes(c.group)) groups.push(c.group); });
    const done = items.filter((c) => has(c.id)).length;
    const wrap = document.createElement('div');
    wrap.className = 'quest-overlay';
    wrap.id = 'questOverlay';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Felfedezések');
    const bars = 40;
    const on = Math.round((done / items.length) * bars);
    wrap.innerHTML = `<div class="quest-card">
      <button type="button" class="btn quest-close" id="questClose">Bezárás</button>
      <h2>Felfedezések</h2>
      <p>${done} / ${items.length}. Ebben a böngészőben tartjuk nyilván, nem küldjük el sehová.</p>
      <div class="quest-bar" aria-hidden="true">${Array.from({ length: bars }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('')}</div>
      ${groups.map((g) => `<div class="quest-group">${esc(g)}</div><div class="quest-grid">${items.filter((c) => c.group === g).map((c) => `
        <div class="quest-item${has(c.id) ? ' found' : ''}">${ico(has(c.id) ? c.i : 'menu')}<div><b>${esc(has(c.id) ? c.t : '???')}</b><span>${esc(has(c.id) ? c.d : c.h)}</span></div></div>`).join('')}</div>`).join('')}
    </div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', (e) => { if (e.target === wrap) closeList(); });
    $('#questClose', wrap).addEventListener('click', closeList);
    $('#questClose', wrap).focus();
  }
  function closeList() { const o = $('#questOverlay'); if (o) o.remove(); }

  // ---- Játék a világgal ----------------------------------------------------------------------------
  const counters = {};
  const bump = (key) => { counters[key] = (counters[key] || 0) + 1; return counters[key]; };
  const CLICK_FX = {
    solaryn: ['#ffd25a', '#ffb732', '#fff0b0'], 'solaryn-light': ['#ffd25a', '#ffffff'], ice: ['#ffffff', '#bfe8ff'], crimson: ['#ff7a2a', '#ffc14a', '#ff3b1f'],
    emerald: ['#7fd070', '#e6f58a'], amethyst: ['#e6d0ff', '#b565ff', '#ffffff'], turquoise: ['#bff4f4', '#ffffff'], halloween: ['#ff8a1f', '#b46cff'],
    christmas: ['#ffffff', '#ff4f4f', '#7ae07a'], newyear: ['#f5cf5b', '#ffffff'], valentine: ['#ff5c8a', '#ffc0d4'], carnival: ['#ffd23f', '#43d3ff', '#ff5a6e', '#7ae07a'],
    easter: ['#f7b3d4', '#9be3a8', '#ffe28a'], national: ['#e8343f', '#ffffff', '#3fae5a'], summer: ['#ffcf3a', '#2fd0e3']
  };

  function bindWorld(w) {
    w.on('placed', (d) => { if (d.count >= 10) discover('builder'); blip([[320, 0.03]], 'square', 0.02); });
    w.on('broken', () => blip([[160, 0.05]], 'square', 0.03));
    w.on('land', () => blip([[120, 0.06]], 'square', 0.03));
    w.on('sky', (d) => {
      const key = themeKey();
      const cfg = window.SolarWorld.THEMES[key] || {};
      if (cfg.fireworks) w.firework(d.m.x, d.m.y);
      else w.burst(d.m.x, d.m.y, CLICK_FX[key] || CLICK_FX.solaryn, 12, { v: 0.7, life: 26, g: key === 'crimson' ? -0.01 : 0.02 });
      blip([[880, 0.03]], 'square', 0.015);
      const sc = SECRETS[key];
      if (sc && sc.hit === 'sky' && bump('sky') >= sc.n) discover(sc.id);
    });
    w.on('hit', (h) => {
      const key = themeKey();
      const sc = SECRETS[key];
      const colors = CLICK_FX[key] || CLICK_FX.solaryn;
      switch (h.id) {
        case 'sun':
          w.sunWobble = 3;
          w.burst(h.m.x, h.m.y, ['#ffd25a', '#fff6d0'], 18, { v: 1, life: 28 });
          blip([[660, 0.05], [880, 0.05]]);
          if (bump('sun') >= 5) discover('sun');
          break;
        case 'moon':
          w.burst(h.m.x, h.m.y, ['#e9edf6', '#a8c8ff'], 14, { v: 0.7, life: 30, g: 0 });
          blip([[330, 0.1], [262, 0.14]], 'triangle', 0.05);
          if (bump('moon') >= 5) discover('moon');
          break;
        case 'star':
          w.meteor = null;
          w.burst(h.m.x, h.m.y, ['#ffffff', '#ffe8b0'], 30, { v: 1.2, life: 40 });
          discover('star');
          break;
        case 'portal': {
          w.portalFlash = 0.9;
          blip([[220, 0.08], [330, 0.08], [494, 0.08], [740, 0.12]], 'sawtooth', 0.03);
          discover('portal');
          const places = PLACES.filter((p) => p.id !== 'kezdolap');
          const to = places[Math.floor(Math.random() * places.length)];
          setTimeout(() => { location.href = to.href; }, 320);
          break;
        }
        case 'critter':
          h.critter.jump = 8;
          h.critter.pets = (h.critter.pets || 0) + 1;
          w.burst(h.m.x, h.m.y - 6, ['#ff7a9a', '#ffc0d4'], 6, { v: 0.4, up: 0.5, g: 0.01, life: 24 });
          blip([[587, 0.06], [784, 0.08]], 'square', 0.03);
          if (bump('critter') >= 10) discover('critter');
          break;
        case 'letter':
          w.dropBlock(h.block);
          blip([[196, 0.05]], 'square', 0.03);
          if (bump('letter') >= 12) discover('letters');
          break;
        case 'friend':
          location.href = anchor('csapat');
          break;
        case 'doll':
          w.dollWalk += 1;
          w.burst(h.m.x, h.m.y, colors, 8, { v: 0.5, life: 20 });
          break;
        case 'bubble':
          w.removeParticle(h.index);
          w.burst(h.m.x, h.m.y, ['#ffffff', '#bff4f4'], 5, { v: 0.5, life: 12, g: 0 });
          blip([[1200, 0.02]], 'square', 0.02);
          break;
        case 'firefly':
          w.removeParticle(h.index);
          w.burst(h.m.x, h.m.y, ['#e6f58a'], 4, { v: 0.3, life: 14, g: 0 });
          blip([[1047, 0.04]], 'triangle', 0.04);
          break;
        default:
          if (h.id && h.id.startsWith('prop:')) {
            w.burst(h.m.x, h.m.y, colors, 14, { v: 0.8, life: 26 });
            if (h.id === 'prop:crystal') blip([[[523, 587, 659, 784, 880][h.tone || 0], 0.25]], 'triangle', 0.06);
            else blip([[660, 0.04], [523, 0.05]], 'square', 0.03);
          }
      }
      if (sc && sc.hit === h.id) {
        if (sc.hit === 'prop:egg') {
          counters.eggs = counters.eggs || new Set();
          counters.eggs.add(h.uid);
          if (counters.eggs.size >= sc.n) discover(sc.id);
        } else if (bump('secret:' + key) >= sc.n) discover(sc.id);
      }
    });
  }

  // ---- Elásott kincs --------------------------------------------------------------------------------
  function placeTreasure() {
    const old = $('.treasure');
    if (old) old.remove();
    if (!IS_HOME || !window.SolarWorld) return;
    const key = themeKey();
    const st = window.SolarWorld.STRATA[key];
    const under = $('.world-under');
    if (!st || has('t:' + key) || !under) return;
    const shaft = $('.shaft');
    const gutter = shaft ? shaft.getBoundingClientRect().left : 0;
    if (gutter < 96) return;
    const [at, side] = TREASURE_AT[key] || [0.4, 0];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'treasure';
    b.setAttribute('aria-label', 'Valami csillog a földben');
    b.style.setProperty('--vein', st.vein);
    b.innerHTML = ico(TREASURE_ICON[st.treasure] || 'gem');
    b.style.top = `${Math.round(under.offsetHeight * at)}px`;
    b.style[side ? 'right' : 'left'] = `${Math.round((gutter - 48) / 2)}px`;
    b.addEventListener('click', () => {
      discover('t:' + key);
      blip([[392, 0.08], [523, 0.08], [659, 0.12]]);
      b.remove();
    });
    under.appendChild(b);
  }

  // ---- Konzol ---------------------------------------------------------------------------------------
  let con, input, sug, log, sel = -1, history_ = store.get('solaryn.console', []), histPos = -1;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '');
  const ALL_PLACES = () => PLACES.concat(ELSEWHERE.filter((p) => !p.ext));
  const findPlace = (q) => {
    const n = norm(q);
    return ALL_PLACES().find((v) => norm(v.label) === n || norm(v.id) === n) || ALL_PLACES().find((v) => norm(v.label).startsWith(n) || norm(v.id).startsWith(n)) || ALL_PLACES().find((v) => norm(v.label).includes(n));
  };
  const playerName = () => store.get('solaryn.player', null) || 'Te';

  const COMMANDS = {
    help: { d: 'Parancsok listája', run() { say('Parancsok: ' + Object.keys(COMMANDS).filter((k) => !COMMANDS[k].hide).map((k) => '/' + k).join(' ')); } },
    tp: { d: 'Ugrás: /tp csapat', args: () => ALL_PLACES().map((v) => norm(v.id)), run(a) {
      if (!a[0]) return say('Hová? Például: /tp csapat', 'err');
      const v = findPlace(a.join(' '));
      if (!v) return say('Nincs ilyen hely: ' + a.join(' '), 'err');
      location.href = v.href;
      say('Teleportálva: ' + v.label, 'ok');
    } },
    time: { d: 'Napszak: /time set night', args: () => ['set day', 'set night', 'set dawn', 'set dusk', 'set real'], run(a) {
      const m = a[0] === 'set' ? a[1] : a[0];
      const map = { day: 'day', nappal: 'day', night: 'night', ejszaka: 'night', dawn: 'dawn', hajnal: 'dawn', dusk: 'dusk', alkony: 'dusk', real: null, valos: null };
      if (!(m in map)) return say('Lehet: day, night, dawn, dusk, real', 'err');
      world.setTime(map[m]);
      say(map[m] ? 'Az idő átállítva: ' + m : 'Vissza a valós napszakhoz.', 'ok');
    } },
    weather: { d: 'Időjárás: /weather rain', args: () => ['clear', 'rain', 'snow', 'thunder', 'embers', 'bubbles', 'petals', 'real'], run(a) {
      const k = a[0];
      if (!k) return say('Lehet: clear, rain, snow, thunder, embers, bubbles, petals, real', 'err');
      if (k === 'real') world.setWeather(null);
      else if (k === 'thunder') { world.setWeather('rain'); world.weatherOverride = 'rain'; world.flash = 1; world.thunder = true; }
      else world.setWeather(k);
      say('Időjárás: ' + k, 'ok');
    } },
    theme: { d: 'Világváltás: /theme ice', args: () => window.SolarTheme.THEMES.map((t) => t.key).concat(window.SolarTheme.seasonal().map((t) => t.key)), run(a) {
      const k = a[0];
      const ok = window.SolarTheme.THEMES.some((t) => t.key === k) || window.SolarTheme.seasonal().some((t) => t.key === k);
      if (!ok) return say(k ? 'Ez a világ most nem érhető el.' : 'Melyik világ?', 'err');
      switchTheme(k);
      say('Áttelepültél: ' + (THEME_NAMES[k] || k), 'ok');
    } },
    gamemode: { d: 'creative, survival, spectator', args: () => ['creative', 'survival', 'spectator'], run(a) {
      const m = a[0];
      if (m === 'creative' || m === '1') setCreative(true);
      else if (m === 'survival' || m === '0') { setCreative(false); setPhoto(false); say('Vissza túlélő módba.', 'ok'); }
      else if (m === 'spectator' || m === '3') setPhoto(true);
      else say('Lehet: creative, survival, spectator', 'err');
    } },
    setblock: { d: 'Blokk választása építő módhoz', args: () => window.SolarWorld.BLOCK_KINDS.map((b) => b.k), run(a) {
      const kinds = window.SolarWorld.BLOCK_KINDS.map((b) => b.k);
      if (!kinds.includes(a[0])) return say('Lehet: ' + kinds.join(', '), 'err');
      world.blockKind = a[0];
      renderBuildBar();
      say('Blokk kiválasztva: ' + a[0], 'ok');
    } },
    felfedezesek: { d: 'Mit találtál eddig', run() { openList(); } },
    hang: { d: 'Hangok be vagy ki', run() { const v = !soundOn(); store.set('solaryn.sound', v); say(v ? 'Hang bekapcsolva.' : 'Hang kikapcsolva.', 'ok'); if (v) blip(CHIME); renderThemeHead(); } },
    ip: { d: 'Szerver IP másolása', run() { copyIp(); say(IP + ' kimásolva. Találkozunk odabent.', 'ok'); } },
    discord: { d: 'Discord megnyitása', run() { window.open(DISCORD, '_blank', 'noopener'); } },
    letoltes: { d: 'Ugrás a kliens letöltéséhez', run() { location.href = anchor('kliens'); } },
    kill: { d: 'Ne.', run() { die(); } },
    seed: { hide: true, run() { say('Seed: ' + themeKey() + '-' + new Date().getFullYear()); } },
    give: { hide: true, run() { say(`Szép próbálkozás, ${playerName()}. Az adminok látták.`, 'err'); } },
    op: { hide: true, run() { say('A szerver megfontolta a kérést, és nevetett.', 'err'); } },
    ban: { hide: true, run(a) { say(a[0] ? `${a[0]} megúszta. Egyelőre.` : 'Kit?', 'err'); } },
    stop: { hide: true, run() { say('Leállítás... csak vicceltünk.', 'err'); } },
    me: { hide: true, run(a) { say(`* ${playerName()} ${a.join(' ')}`, 'me'); } },
    say: { hide: true, run(a) { say(`[${playerName()}] ${a.join(' ')}`, 'me'); } },
    summon: { hide: true, run() {
      const c = world.critters[0];
      if (!c) return say('Itt senki nem jön elő.', 'err');
      c.jump = 8;
      c.x = world.camX + 40;
      c.home = c.x;
      say('Megjött.', 'ok');
    } },
    clear: { d: 'Üzenetek törlése', run() { log.innerHTML = ''; } }
  };

  function say(text, cls) {
    if (!log) return;
    const p = document.createElement('p');
    if (cls) p.className = cls;
    p.textContent = text;
    log.appendChild(p);
    while (log.children.length > 8) log.firstChild.remove();
    setTimeout(() => { if (p.isConnected && !con.classList.contains('open')) p.remove(); }, 9500);
  }

  function buildConsole() {
    con = document.createElement('div');
    con.className = 'console';
    con.innerHTML = '<div class="console-log" aria-live="polite"></div><div class="console-sug" role="listbox"></div><div class="console-box"><b>/</b><input type="text" spellcheck="false" autocomplete="off" aria-label="Parancs" maxlength="120"></div>';
    document.body.appendChild(con);
    input = $('input', con); sug = $('.console-sug', con); log = $('.console-log', con);
    // Ha kikattintasz a parancssorból, bezárul, és az üzenetek is törlődnek, mintha /clear lett volna.
    document.addEventListener('pointerdown', (e) => {
      if (!con.classList.contains('open') || con.contains(e.target)) return;
      log.innerHTML = '';
      closeConsole();
    });
    input.addEventListener('input', () => { sel = -1; histPos = -1; suggest(); });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Escape') { closeConsole(); return; }
      if (e.key === 'Enter') { e.preventDefault(); submit(); return; }
      const items = $$('button', sug);
      if (e.key === 'Tab') {
        e.preventDefault();
        const it = items[sel >= 0 ? sel : 0];
        if (it) { input.value = it.dataset.fill + (it.dataset.more ? ' ' : ''); sel = -1; suggest(); }
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        if (items.length && input.value) {
          sel = (sel + dir + items.length) % items.length;
          items.forEach((b, i) => b.classList.toggle('sel', i === sel));
          items[sel].scrollIntoView({ block: 'nearest' });
        } else if (history_.length) {
          histPos = clampN(histPos + (dir < 0 ? 1 : -1), -1, history_.length - 1);
          input.value = histPos >= 0 ? history_[history_.length - 1 - histPos] : '';
        }
      }
    });
    sug.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      input.value = b.dataset.fill;
      if (b.dataset.more) { input.value += ' '; input.focus(); suggest(); } else submit();
    });
  }

  function suggest() {
    const parts = input.value.split(/\s+/);
    let html = '';
    if (parts.length <= 1) {
      const q = norm(parts[0] || '');
      const cmds = Object.keys(COMMANDS).filter((k) => !COMMANDS[k].hide && k.startsWith(q));
      html += cmds.map((k) => `<button type="button" data-fill="${k}" ${COMMANDS[k].args ? 'data-more="1"' : ''}>${k}<span>${esc(COMMANDS[k].d)}</span></button>`).join('');
      if (q) html += ALL_PLACES().filter((p) => norm(p.label).includes(q)).slice(0, 6).map((p) => `<button type="button" data-fill="tp ${norm(p.id)}">${esc(p.label)}<span>Ugrás</span></button>`).join('');
    } else {
      const c = COMMANDS[norm(parts[0])];
      if (c && c.args) {
        const rest = parts.slice(1).join(' ').toLowerCase();
        html = c.args().filter((x) => x.startsWith(rest)).slice(0, 8).map((x) => `<button type="button" data-fill="${parts[0]} ${esc(x)}">${esc(x)}</button>`).join('');
      }
    }
    sug.innerHTML = html;
    sug.classList.toggle('has', !!html);
  }

  function submit() {
    const items = $$('button', sug);
    let raw = input.value.trim();
    if (sel >= 0 && items[sel]) raw = items[sel].dataset.fill;
    if (!raw) { closeConsole(); return; }
    raw = raw.replace(/^\//, '');
    history_.push(raw);
    history_ = history_.slice(-30);
    store.set('solaryn.console', history_);
    const [cmd, ...args] = raw.split(/\s+/);
    const c = COMMANDS[norm(cmd)];
    closeConsole();
    if (c) { discover('console'); c.run(args); return; }
    const v = findPlace(raw);
    if (v) { discover('console'); location.href = v.href; return; }
    say(`Ismeretlen parancs: /${cmd}. Próbáld: /help`, 'err');
  }

  function openConsole() {
    if (!con || !world) return;
    con.classList.add('open');
    input.value = '';
    sel = -1; histPos = -1;
    suggest();
    input.focus();
  }
  function closeConsole() {
    if (!con) return;
    con.classList.remove('open');
    sug.classList.remove('has');
    input.blur();
    input.value = '';
    $$('p', log).forEach((p) => { p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; setTimeout(() => p.isConnected && p.remove(), 9500); });
  }

  // ---- Módok ----------------------------------------------------------------------------------------
  let buildBar = null;
  let clearArm = false;
  function renderBuildBar() {
    if (!buildBar) return;
    const kinds = window.SolarWorld.BLOCK_KINDS;
    const cur = world.blockKind || 'stone';
    buildBar.innerHTML = '<div class="build-swatches">' + kinds.map((b, i) => `<button type="button" class="build-swatch${b.k === cur ? ' active' : ''}" data-kind="${b.k}" title="${esc(b.label)}" aria-label="${esc(b.label)}"><i style="background:${b.c}"></i><kbd>${i + 1}</kbd></button>`).join('') + '</div>'
      + `<div class="build-tools"><span>Bal: rakás. Jobb: bontás. Húzással több is. A/D: kamera.</span><button type="button" data-tool="undo">Vissza</button><button type="button" data-tool="clear">${clearArm ? 'Biztos?' : 'Mind törlése'}</button><button type="button" data-tool="done" class="build-done">Kész</button></div>`;
  }
  function setCreative(on) {
    if (!world) return;
    world.creative = on;
    world.setCursor(null);
    root.classList.toggle('building', on);
    if (on) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (!buildBar) {
        buildBar = document.createElement('div');
        buildBar.className = 'build-bar';
        document.body.appendChild(buildBar);
        buildBar.addEventListener('click', (e) => {
          const sw = e.target.closest('[data-kind]');
          if (sw) { world.blockKind = sw.dataset.kind; renderBuildBar(); return; }
          const tool = e.target.closest('[data-tool]');
          if (!tool) return;
          if (tool.dataset.tool === 'undo') world.undoBlock();
          if (tool.dataset.tool === 'done') setCreative(false);
          if (tool.dataset.tool === 'clear') {
            if (clearArm) { world.clearBlocks(); clearArm = false; } else { clearArm = true; setTimeout(() => { clearArm = false; renderBuildBar(); }, 2500); }
            renderBuildBar();
          }
        });
      }
      buildBar.classList.remove('hidden');
      renderBuildBar();
    } else if (buildBar) buildBar.classList.add('hidden');
  }
  function setPhoto(on) {
    root.classList.toggle('photo-mode', on);
    if (on) { discover('photo'); window.scrollTo(0, 0); say('Néző mód. Esc: vissza.', 'ok'); }
    if (world) { world.resize(); if (!world.running) world.drawOnce(); }
  }
  function die() {
    if ($('.death-screen')) return;
    const el = document.createElement('div');
    el.className = 'death-screen';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Meghaltál');
    const reasons = ['túl közel ment a Naphoz', 'parancsba adta a saját halálát', 'nem olvasta el a szabályzatot', 'rálépett egy legóra'];
    el.innerHTML = `<h2>Meghaltál!</h2><p>${esc(playerName())} ${reasons[Math.floor(Math.random() * reasons.length)]}.</p><button type="button" class="btn btn-gold">Újjászületés</button>`;
    document.body.appendChild(el);
    blip([[196, 0.2], [147, 0.3]], 'sawtooth', 0.05);
    const btn = $('button', el);
    btn.focus();
    btn.addEventListener('click', () => {
      el.remove();
      discover('kill');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Hibakereső (F3) -----------------------------------------------------------------------------
  let hud = null, hudTimer = null, frames = 0, fps = 0, lastFps = performance.now();
  function countFrame() {
    frames++;
    const now = performance.now();
    if (now - lastFps > 1000) { fps = Math.round((frames * 1000) / (now - lastFps)); frames = 0; lastFps = now; }
    if (hud) requestAnimationFrame(countFrame);
  }
  function renderHud() {
    if (!hud || !world) return;
    const st = world.solarNow();
    const cfg = window.SolarWorld.THEMES[themeKey()] || {};
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const y = Math.round(64 - ((window.scrollY || 0) / max) * 128);
    const phaseN = ['Újhold', 'Növő sarló', 'Első negyed', 'Növő Hold', 'Telihold', 'Fogyó Hold', 'Utolsó negyed', 'Fogyó sarló'][Math.floor(((st.phase + 1 / 16) % 1) * 8)];
    const lines = [
      `solaryn.hu ${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      `${fps} fps, ${world.costMs.toFixed(1)} ms, ${world.W}x${world.H} @ ${world.S}x${world.hd ? '' : ' (kímélő)'}`,
      `X: ${Math.round(world.camX)}  Y: ${y}  Z: 0`,
      `Világ: ${cfg.biome || ''}`,
      `Óra: ${new Date().toTimeString().slice(0, 5)}  Hold: ${phaseN}`,
      `Sötétség: ${Math.round(world.env0.night * 100)}%  Fények: ${world.glowAll ? world.glowAll.length : 0}`,
      `Időjárás: ${world.particleKind || 'tiszta'} (${world.particles.length})`,
      `Felfedezések: ${Object.keys(found).length}/${catalog().length}`
    ];
    hud.innerHTML = lines.map((l) => `<span>${esc(l)}</span>`).join('');
  }
  function toggleHud() {
    if (hud) { hud.remove(); hud = null; clearInterval(hudTimer); return; }
    hud = document.createElement('div');
    hud.className = 'debug-hud';
    document.body.appendChild(hud);
    discover('f3');
    renderHud();
    hudTimer = setInterval(renderHud, 250);
    requestAnimationFrame(countFrame);
  }

  // ---- Bányászat az akna mellett --------------------------------------------------------------------
  const mined = new Map();
  let ores = 0;
  function sparks(under, x, y) {
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('i');
      s.className = 'mine-spark';
      const a = Math.random() * 6.283;
      const d = 14 + Math.random() * 22;
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.round(Math.cos(a) * d) + 'px');
      s.style.setProperty('--dy', Math.round(Math.sin(a) * d - 8) + 'px');
      under.appendChild(s);
      setTimeout(() => s.remove(), 460);
    }
  }
  function mine(e) {
    const under = $('.world-under');
    if (!under || !world) return;
    const shaft = $('.shaft');
    if (shaft) {
      const sr = shaft.getBoundingClientRect();
      if (e.clientX >= sr.left && e.clientX <= sr.right) return;
    }
    const size = 16 * world.scale;
    const r = under.getBoundingClientRect();
    const row = Math.floor((e.clientY - r.top) / size);
    const shift = row % 2 ? size / 2 : 0;
    const col = Math.floor((e.clientX - r.left - shift) / size);
    const key = col + ',' + row;
    let m = mined.get(key);
    if (m && m.broken) return;
    if (!m) {
      const el = document.createElement('i');
      el.className = 'mined';
      el.style.left = col * size + shift + 'px';
      el.style.top = row * size + 'px';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      under.insertBefore(el, shaft);
      m = { el, hits: 0 };
      mined.set(key, m);
    }
    m.hits++;
    m.el.dataset.stage = String(Math.min(3, m.hits));
    sparks(under, e.clientX - r.left, e.clientY - r.top);
    blip([[190 + m.hits * 30, 0.04]], 'square', 0.025);
    if (m.hits >= 3) {
      m.broken = true;
      if (Math.random() < 0.14) {
        const st = window.SolarWorld.STRATA[themeKey()] || {};
        m.el.style.setProperty('--vein', st.vein || 'var(--gold)');
        m.el.innerHTML = ico('gem');
        ores++;
        say(ores === 1 ? 'Érctalálat! Jól gondoltad, itt van még.' : 'Érc: ' + ores, 'ok');
      }
      if (bump('mined') >= 16) discover('miner');
    }
  }

  // ---- Mélységjelző ---------------------------------------------------------------------------------
  function bindDepth() {
    const el = document.createElement('div');
    el.className = 'depth-meter';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    let hideT = null;
    window.addEventListener('scroll', () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const sy = window.scrollY || 0;
      if (sy >= max - 30 && IS_HOME) discover('depths');
      if (sy < 40) { el.classList.remove('visible'); return; }
      const under = $('.world-under');
      const top = under ? under.offsetTop : 300;
      const cell = 16 * (world ? world.scale : 3);
      const depth = sy + window.innerHeight * 0.5 - top;
      let name = 'Felszín';
      if (depth > 0) name = 'Föld';
      if (depth > cell * 4) name = 'Kő';
      if (depth > cell * 38) name = 'Mélység';
      if (sy >= max - 30) name = 'Alapkőzet';
      const y = Math.round(64 - (sy / max) * 128);
      el.innerHTML = `<b>Y ${y}</b><span>${name}</span>`;
      el.classList.add('visible');
      clearTimeout(hideT);
      hideT = setTimeout(() => el.classList.remove('visible'), 1300);
    }, { passive: true });
  }

  // ---- Világválasztó --------------------------------------------------------------------------------
  const thumbs = {};
  const queue = [];
  let thumbBusy = false;
  let panel = null;
  function thumbFor(key, img) {
    if (thumbs[key]) { img.src = thumbs[key]; return; }
    queue.push({ key, img });
    if (!thumbBusy) pumpThumbs();
  }
  function pumpThumbs() {
    const job = queue.shift();
    if (!job) { thumbBusy = false; return; }
    thumbBusy = true;
    setTimeout(() => {
      if (!thumbs[job.key]) {
        const c = document.createElement('canvas');
        c.width = 192; c.height = 96;
        window.SolarWorld.thumb(c, job.key);
        thumbs[job.key] = c.toDataURL();
      }
      if (job.img.isConnected) job.img.src = thumbs[job.key];
      pumpThumbs();
    }, 16);
  }
  function renderThemeHead() {
    if (!panel) return;
    const head = $('.theme-head', panel);
    if (!head) return;
    const items = catalog();
    const done = items.filter((c) => has(c.id)).length;
    head.innerHTML = `<div><b>Világok</b> <span>Ugyanazok, mint a SolarCenterben és a launcherben.</span></div>
      <div class="theme-tools"><button type="button" data-tool="build">Építés</button><button type="button" data-tool="sound" aria-pressed="${soundOn()}">Hang</button><button type="button" data-tool="list">Felfedezések ${done}/${items.length}</button></div>`;
  }
  function renderThemePanel() {
    if (!panel) return;
    const T = window.SolarTheme;
    const cur = T.current();
    const biome = (k) => (window.SolarWorld.THEMES[k] || {}).biome || '';
    const list = T.seasonal().filter((t) => t.mode === 'live' || !t.mode).map((t) => ({ key: t.key, label: t.label, badge: T.isNew(t) ? 'Új' : 'Most' })).concat(T.THEMES);
    panel.innerHTML = '<div class="theme-head"></div>' + list.map((t) => `<button type="button" class="theme-opt${t.key === cur ? ' active' : ''}" data-theme-key="${esc(t.key)}"><img alt="" width="192" height="96"><span class="t-name">${esc(t.label)}</span><span class="t-biome">${esc(biome(t.key))}</span>${t.badge ? `<span class="t-badge">${esc(t.badge)}</span>` : ''}</button>`).join('');
    $$('.theme-opt', panel).forEach((opt) => thumbFor(opt.dataset.themeKey, $('img', opt)));
    renderThemeHead();
  }
  function switchTheme(key) {
    const run = () => window.SolarTheme.set(key);
    if (document.startViewTransition && !reduced()) {
      const vt = document.startViewTransition(run);
      vt.ready.catch(() => {});
      vt.finished.catch(() => {});
    } else run();
  }
  function setThemeChip() {
    const btn = $('#themeBtn');
    if (!btn || !window.SolarWorld) return;
    const cfg = window.SolarWorld.THEMES[themeKey()] || {};
    const icoEl = $('.chip-ico', btn);
    const nameEl = $('.chip-label', btn);
    if (icoEl) icoEl.innerHTML = ico(cfg.time === 'night' ? 'moon' : 'sun');
    if (nameEl) nameEl.textContent = cfg.biome || 'Világok';
  }
  function bindThemePanel() {
    const btn = $('#themeBtn');
    if (!btn) return;
    panel = document.createElement('div');
    panel.className = 'theme-panel';
    panel.id = 'themePanel';
    panel.hidden = true;
    document.body.appendChild(panel);
    btn.setAttribute('aria-controls', 'themePanel');
    btn.setAttribute('aria-expanded', 'false');
    const close = () => { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = panel.hidden;
      if (open) renderThemePanel();
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      closePop();
    });
    document.addEventListener('click', (e) => { if (!panel.hidden && !panel.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    panel.addEventListener('click', (e) => {
      const tool = e.target.closest('[data-tool]');
      if (tool) {
        if (tool.dataset.tool === 'sound') { store.set('solaryn.sound', !soundOn()); if (soundOn()) blip(CHIME); renderThemeHead(); }
        if (tool.dataset.tool === 'list') { close(); openList(); }
        if (tool.dataset.tool === 'build') { close(); if (world && !world.creative) setCreative(true); }
        return;
      }
      const opt = e.target.closest('[data-theme-key]');
      if (opt) { switchTheme(opt.dataset.themeKey); close(); }
    });
    const seen = store.get('solaryn.worlds', []);
    const onTheme = () => {
      setThemeChip();
      const k = themeKey();
      if (!seen.includes(k)) { seen.push(k); store.set('solaryn.worlds', seen); }
      if (window.SolarTheme.THEMES.every((t) => seen.includes(t.key))) discover('tourist');
      placeTreasure();
    };
    new MutationObserver(onTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    document.addEventListener('solar:themes', () => { if (!panel.hidden) renderThemePanel(); });
    onTheme();
  }

  // ---- Hotbar ---------------------------------------------------------------------------------------
  let nameTip, tipTimer, pop, popBtn;
  function flashName(text) {
    if (!nameTip) return;
    nameTip.textContent = text;
    nameTip.classList.add('visible');
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => nameTip.classList.remove('visible'), 1400);
  }
  function setActiveSlot(id) {
    $$('.hotbar-slot').forEach((s) => {
      const on = s.dataset.slot === id;
      s.classList.toggle('active', on);
      if (on) s.setAttribute('aria-current', 'true'); else s.removeAttribute('aria-current');
    });
  }
  function closePop() {
    if (!pop) return;
    pop.hidden = true;
    if (popBtn) popBtn.setAttribute('aria-expanded', 'false');
  }
  function togglePop() {
    if (!pop) return;
    const open = pop.hidden;
    pop.hidden = !open;
    popBtn.setAttribute('aria-expanded', String(open));
    if (open) { const first = $('a, button', pop); if (first) first.focus(); }
  }
  function buildHotbar() {
    const nav = document.createElement('nav');
    nav.className = 'hotbar';
    nav.setAttribute('aria-label', 'Fő navigáció');
    nav.innerHTML = `<div class="hotbar-slots">${SLOTS.map((s, i) => `<a class="hotbar-slot" href="${s.href}" data-slot="${s.id}" data-label="${esc(s.label)}" aria-label="${esc(s.label)}">${ico(s.icon)}<kbd aria-hidden="true">${i + 1}</kbd></a>`).join('')}</div>
      <button type="button" class="hotbar-key" id="popBtn" aria-label="Minden hely" aria-expanded="false" aria-controls="hotbarPop">${ico('menu')}<span aria-hidden="true">E</span></button>`;
    document.body.appendChild(nav);

    nameTip = document.createElement('div');
    nameTip.className = 'hotbar-name';
    nameTip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(nameTip);

    pop = document.createElement('div');
    pop.className = 'hotbar-pop';
    pop.id = 'hotbarPop';
    pop.hidden = true;
    const item = (p) => `<a class="pop-item${p.id === PAGE ? ' active' : ''}" href="${p.href}"${p.ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${ico(p.icon)}<span>${esc(p.label)}</span></a>`;
    pop.innerHTML = `<div class="pop-col"><div class="pop-title">Főoldal</div><div class="pop-items">${PLACES.map(item).join('')}</div></div>
      <div class="pop-col"><div class="pop-title">Máshol</div><div class="pop-items">${ELSEWHERE.map(item).join('')}</div>
      <div class="pop-title" style="margin-top:16px">A világban</div><div class="pop-items">
        <button type="button" class="pop-item" data-act="console">${ico('terminal')}<span>Parancssor</span><kbd>T</kbd></button>
        <button type="button" class="pop-item" data-act="list">${ico('trophy')}<span>Felfedezések</span></button>
      </div></div>`;
    document.body.appendChild(pop);
    popBtn = $('#popBtn');
    popBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePop(); });
    pop.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (act) {
        closePop();
        if (act.dataset.act === 'console') openConsole();
        if (act.dataset.act === 'list') openList();
        return;
      }
      if (e.target.closest('a')) closePop();
    });
    document.addEventListener('click', (e) => { if (!pop.hidden && !pop.contains(e.target)) closePop(); });
    $$('.hotbar-slot', nav).forEach((s) => {
      s.addEventListener('pointerenter', () => flashName(s.dataset.label));
      s.addEventListener('focus', () => flashName(s.dataset.label));
    });

    if (!IS_HOME) setActiveSlot(PAGE);
    const secs = $$('[data-slot]').filter((s) => !s.classList.contains('hotbar-slot'));
    if (secs.length && 'IntersectionObserver' in window) {
      let current = null;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const id = en.target.dataset.slot;
          const label = en.target.dataset.label;
          if (label !== current) {
            // Telefonon a felirat a szöveget takarná görgetés közben.
            if (current !== null && window.innerWidth > 900) flashName(label);
            current = label;
            setActiveSlot(id);
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      secs.forEach((s) => io.observe(s));
    }
  }

  // ---- Billentyűk -----------------------------------------------------------------------------------
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konami = 0;
  let typed = '';
  function bindKeys() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F3') { e.preventDefault(); if (world) toggleHud(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && world && world.creative) { e.preventDefault(); world.undoBlock(); return; }
      const t = e.target;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (e.key === 'Escape') {
        if (root.classList.contains('photo-mode')) setPhoto(false);
        if (world && world.creative) setCreative(false);
        closeList();
        closePop();
      }
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (world && world.creative) {
        const kinds = window.SolarWorld.BLOCK_KINDS;
        if (/^[1-9]$/.test(k) && kinds[Number(k) - 1]) { world.blockKind = kinds[Number(k) - 1].k; renderBuildBar(); return; }
        if (k === 'a' || k === 'd') world.panTo(world.camTarget + (k === 'd' ? 56 : -56), 240);
      } else if (/^[1-9]$/.test(k)) {
        const slot = $$('.hotbar-slot')[Number(k) - 1];
        if (slot) { slot.click(); flashName(slot.dataset.label); }
        return;
      }
      if (k === 'e' && !(world && world.creative)) { togglePop(); }
      konami = k === KONAMI[konami] ? konami + 1 : (k === KONAMI[0] ? 1 : 0);
      if (konami === KONAMI.length) { konami = 0; discover('konami'); setCreative(!(world && world.creative)); }
      if (e.key.length === 1) {
        typed = (typed + k).slice(-12);
        if (typed.endsWith('solaryn') && world) {
          discover('word');
          world.buildLetters(world.env0, world.cfg(), true);
          world.burst(world.W / 2, world.ground * 0.25, ['#ffd25a', '#fff0b0'], 50, { v: 1.4, life: 44 });
        }
      }
      // A szabályzatban a / a keresőre ugrik.
      if (e.key === '/' && !$('#rulesSearch')) { e.preventDefault(); openConsole(); }
      else if (k === 't') { e.preventDefault(); openConsole(); }
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest) return;
      if (e.target.closest('.s-bed')) {
        blip([[110, 0.05]], 'square', 0.04);
        if (bump('bedrock') >= 5) discover('bedrock');
      } else if (e.target.closest('.stratum') || e.target.classList.contains('mined')) mine(e);
    });
    // Ugyanaz a védelem, mint a SolarCenterben.
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'f12' || (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) || (e.ctrlKey && key === 'u')) e.preventDefault();
    });
  }

  function timeEggs() {
    const h = new Date().getHours();
    if (h === 0) discover('midnight');
    if (h >= 4 && h < 6) discover('dawn');
    if (window.SolarWorld) {
      const ph = window.SolarWorld.solar().phase;
      if (ph > 0.47 && ph < 0.53) discover('fullmoon');
    }
  }

  // ---- Apróságok ------------------------------------------------------------------------------------
  function toast(message, icon) {
    const old = $('.toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = ico(icon || 'check') + '<span>' + esc(message) + '</span>';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }
  async function copyIp() {
    try {
      await navigator.clipboard.writeText(IP);
      toast('Szerver címe kimásolva a vágólapra.');
      discover('ip');
      return true;
    } catch {
      toast('Szerver címe: ' + IP, 'copy');
      return false;
    }
  }
  function bindCopy() {
    $$('[data-ip]').forEach((btn) => btn.addEventListener('click', async () => {
      const ok = await copyIp();
      if (!ok) return;
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1600);
    }));
    $$('[data-download]').forEach((a) => a.addEventListener('click', () => discover('download')));
  }
  function bindCookie() {
    const KEY_N = 'solaryn_cookie_notice_dismissed';
    const VERSION = 2;
    let dismissed = false;
    try { dismissed = parseInt(localStorage.getItem(KEY_N) || '0', 10) >= VERSION; } catch {}
    if (dismissed) return;
    const el = document.createElement('div');
    el.className = 'cookie';
    el.setAttribute('role', 'status');
    el.innerHTML = `<b>Sütikről röviden</b><p>Ez a weboldal nem használ követő vagy statisztikai sütit, és harmadik féltől sem tölt be tartalmat. A böngésződben csak a kényelmi beállításaidat és a felfedezéseidet tároljuk (localStorage). Részletek az <a href="${BASE}jogi/#adatkezeles">Adatkezelési tájékoztatóban</a>.</p><button type="button" class="btn">Értem</button>`;
    document.body.appendChild(el);
    $('button', el).addEventListener('click', () => {
      try { localStorage.setItem(KEY_N, String(VERSION)); } catch {}
      el.remove();
    });
  }
  function bindTopbar() {
    const bar = $('.topbar');
    if (!bar) return;
    const onScroll = () => bar.classList.toggle('scrolled', (window.scrollY || 0) > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  function fillIcons(scope) {
    $$('[data-ico]', scope).forEach((el) => {
      el.insertAdjacentHTML('afterbegin', ico(el.dataset.ico));
      el.removeAttribute('data-ico');
    });
  }
  function hardenLinks() {
    $$('a[target="_blank"]').forEach((a) => {
      const rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      if (!rel.includes('noopener')) rel.push('noopener');
      if (!rel.includes('noreferrer')) rel.push('noreferrer');
      a.setAttribute('rel', rel.join(' '));
    });
  }

  function boot() {
    fillIcons();
    mountWorld();
    buildHotbar();
    buildConsole();
    if (world) {
      bindDepth();
      bindWorld(world);
    }
    bindKeys();
    bindThemePanel();
    bindCopy();
    bindCookie();
    bindTopbar();
    hardenLinks();
    timeEggs();
    window.SolarTheme.refresh();
    const saved = store.get('solaryn.player', null);
    if (saved) loadCharacter(saved);
    window.SolarSite = { $, $$, ico, esc, store, discover, say, toast, loadCharacter, fillIcons, reduced, BASE };
    document.dispatchEvent(new CustomEvent('solar:ready'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
