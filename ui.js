(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initMobileNav() {
    const nav = $('nav');
    const links = $('.nav-links');
    if (!nav || !links) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mobile-menu-btn';
    btn.setAttribute('aria-label', 'Menü megnyitása');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'navLinksList');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
      '<g class="icon-burger" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></g>' +
      '<g class="icon-close" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></g>' +
      '</svg>';
    links.id = 'navLinksList';
    nav.insertBefore(btn, links);

    const close = () => {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    };
    const toggle = () => {
      const open = links.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    btn.addEventListener('click', toggle);
    links.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) close(); });
  }

  function initCardSpotlight() {
    if (window.matchMedia('(pointer: coarse)').matches || reduced()) return;
    $$('.feature-item, .gamemode-image, .team-card, .client-step, .sn-card, .sn-step, .sn-criterion, .legal-card')
      .forEach((el) => el.classList.add('fx-spot'));

    let pending = null;
    let last = null;
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.fx-spot');
      if (card !== last && last) last.style.setProperty('--spot', '0');
      last = card;
      if (!card) return;
      pending = { card, x: e.clientX, y: e.clientY };
      if (pending.queued) return;
      pending.queued = true;
      requestAnimationFrame(() => {
        if (!pending) return;
        const { card: c, x, y } = pending;
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', ((x - r.left) / r.width * 100).toFixed(1) + '%');
        c.style.setProperty('--my', ((y - r.top) / r.height * 100).toFixed(1) + '%');
        c.style.setProperty('--spot', '1');
        pending = null;
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => { if (last) { last.style.setProperty('--spot', '0'); last = null; } }, { passive: true });
  }

  function initRipples() {
    document.addEventListener('pointerdown', (e) => {
      if (reduced()) return;
      const btn = e.target.closest && e.target.closest('.btn-glow-download, .btn-nav-download, .btn-outline-nav, .legal-tab, .faq-question, .ip-container');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - r.left) + 'px';
      span.style.top = (e.clientY - r.top) + 'px';
      btn.appendChild(span);
      setTimeout(() => span.remove(), 620);
    }, { passive: true });
  }

  const ICON_OK = '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M4 12.5l5.2 5.2L20 7"/></svg>';
  function showToast(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<span class="toast-icon">' + ICON_OK + '</span><span>' + message + '</span>';
    document.body.appendChild(el);
    void el.offsetWidth;
    el.classList.add('visible');
    setTimeout(() => {
      el.classList.remove('visible');
      setTimeout(() => el.remove(), 320);
    }, 3200);
  }
  window.showToast = showToast;

  function initCopyIp() {
    const btn = $('#btnCopyIp');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const ip = ($('#ip-text') || {}).textContent || '';
      try {
        await navigator.clipboard.writeText(ip.trim());
      } catch {
        showToast('Szerver címe: ' + ip.trim());
        return;
      }
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1600);
      showToast('Szerver címe kimásolva a vágólapra.');
    });
  }

  const NOTICE_KEY = 'solaryn_cookie_notice_dismissed';
  const NOTICE_VERSION = 1;
  function initCookieNotice() {
    let dismissed = false;
    try { dismissed = parseInt(localStorage.getItem(NOTICE_KEY) || '0', 10) >= NOTICE_VERSION; } catch {  }
    if (dismissed) return;

    const legalHref = location.pathname.startsWith('/jogi/') || /\/jogi\//.test(location.pathname)
      ? '#adatkezeles'
      : (location.pathname === '/' || /\/index\.html$/.test(location.pathname) || location.pathname.split('/').filter(Boolean).length === 0
          ? 'jogi/#adatkezeles'
          : '../jogi/#adatkezeles');

    const el = document.createElement('div');
    el.className = 'cookie-notice';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<div class="cookie-notice-head">' +
        '<span class="cookie-notice-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M21 12.8A9 9 0 1 1 11.2 3a3.4 3.4 0 0 0 4.6 4.2A3.4 3.4 0 0 0 20 11.8a9 9 0 0 1 1 1z"/><circle cx="9" cy="10" r="1.1" fill="currentColor"/><circle cx="13.5" cy="15" r="1.1" fill="currentColor"/></svg></span>' +
        '<span class="cookie-notice-title">Sütikről röviden</span>' +
      '</div>' +
      '<p class="cookie-notice-text">Ez a weboldal nem használ követő vagy statisztikai sütit, és harmadik féltől sem tölt be tartalmat. Az egyetlen, amit a böngésződben (localStorage) tárolunk: hogy ezt az üzenetet már láttad. Részletek az <a href="' + legalHref + '">Adatkezelési tájékoztatóban</a>.</p>' +
      '<div class="cookie-notice-actions"><button type="button">Értem</button></div>';
    document.body.appendChild(el);

    requestAnimationFrame(() => { void el.offsetWidth; el.classList.add('visible'); });

    const dismiss = () => {
      el.classList.remove('visible');
      try { localStorage.setItem(NOTICE_KEY, String(NOTICE_VERSION)); } catch {  }
      setTimeout(() => el.remove(), 400);
    };
    el.querySelector('button').addEventListener('click', dismiss);
  }

  function hardenExternalLinks() {
    $$('a[target="_blank"]').forEach((a) => {
      const rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      if (!rel.includes('noopener')) rel.push('noopener');
      if (!rel.includes('noreferrer')) rel.push('noreferrer');
      a.setAttribute('rel', rel.join(' '));
    });
  }

  function boot() {
    initMobileNav();
    initCardSpotlight();
    initRipples();
    initCopyIp();
    initCookieNotice();
    hardenExternalLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
