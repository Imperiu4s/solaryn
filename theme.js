/* Világ (téma) betöltése még a kirajzolás előtt, és az éppen élő évszakos világok lekérése.
   Ugyanazok a világok, mint a SolarCenterben és a launcherben. A választás csak ebben a böngészőben marad meg. */
(function () {
  'use strict';
  const STORAGE_KEY = 'solaryn.theme';
  const PREV_KEY = 'solaryn.theme.beforeSeason';
  const SEASON_CACHE_KEY = 'solaryn.seasonal';
  const AUTO_KEY_PREFIX = 'solaryn.seasonAuto.';
  const BACKEND = 'https://api.solaryn.hu:25572';
  const NEW_BADGE_DAYS = 14;

  const THEMES = [
    { key: 'solaryn', label: 'Solaryn sötét' },
    { key: 'solaryn-light', label: 'Solaryn világos' },
    { key: 'ice', label: 'Jégkék' },
    { key: 'crimson', label: 'Bíbor' },
    { key: 'emerald', label: 'Smaragd' },
    { key: 'amethyst', label: 'Ametiszt' },
    { key: 'turquoise', label: 'Türkiz' }
  ];
  const SEASONAL_KEYS = ['halloween', 'christmas', 'newyear', 'valentine', 'carnival', 'easter', 'national', 'summer'];

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };
  const root = document.documentElement;
  root.classList.add('js');

  function readCache() {
    try {
      const list = JSON.parse(store.get(SEASON_CACHE_KEY) || '[]');
      return Array.isArray(list) ? list.filter((t) => t && SEASONAL_KEYS.includes(t.key)) : [];
    } catch { return []; }
  }

  let seasonal = readCache();
  const isSeasonal = (key) => SEASONAL_KEYS.includes(key);
  const isAvailable = (key) => THEMES.some((t) => t.key === key) || seasonal.some((t) => t.key === key);

  function saved() {
    const v = store.get(STORAGE_KEY);
    return v && isAvailable(v) ? v : 'solaryn';
  }
  function apply(key) { root.setAttribute('data-theme', key); }
  function set(key) {
    const current = saved();
    if (isSeasonal(key) && !isSeasonal(current)) store.set(PREV_KEY, current);
    apply(key);
    store.set(STORAGE_KEY, key);
  }
  apply(saved());

  // Az évszakos világ egyszer magától is bekapcsol, és ha lejárt, visszaáll az előző.
  function reconcile() {
    for (const t of seasonal) {
      if (!t.autoApply || !t.activatedAt) continue;
      const flag = AUTO_KEY_PREFIX + t.key + '.' + t.activatedAt;
      if (store.get(flag)) continue;
      store.set(flag, '1');
      set(t.key);
    }
    const cur = store.get(STORAGE_KEY);
    if (cur && isSeasonal(cur) && !isAvailable(cur)) {
      const prev = store.get(PREV_KEY);
      const fallback = prev && THEMES.some((t) => t.key === prev) ? prev : 'solaryn';
      store.del(PREV_KEY);
      apply(fallback);
      store.set(STORAGE_KEY, fallback);
    }
  }

  async function refresh() {
    try {
      const res = await fetch(BACKEND + '/api/themes/seasonal');
      const data = await res.json();
      if (!data || !data.ok || !Array.isArray(data.themes)) return;
      seasonal = data.themes.filter((t) => t && isSeasonal(t.key));
      store.set(SEASON_CACHE_KEY, JSON.stringify(seasonal));
    } catch { return; }
    reconcile();
    apply(saved());
    document.dispatchEvent(new CustomEvent('solar:themes'));
  }

  function isNew(t) {
    if (!t.activatedAt) return false;
    const at = new Date(t.activatedAt).getTime();
    return Number.isFinite(at) && Date.now() - at < NEW_BADGE_DAYS * 86400000;
  }

  window.SolarTheme = {
    BACKEND, THEMES, set, refresh, isNew,
    seasonal: () => seasonal,
    current: () => root.getAttribute('data-theme') || 'solaryn'
  };
})();
