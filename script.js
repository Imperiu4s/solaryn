// ── Tiszta URL-ek: ha valaki egy "...index.html" végű linkről (pl. régi
// könyvjelző, kereső-találat) érkezik, a címsorból eltüntetjük az
// "index.html"-t, és a mappa gyökerét mutatjuk helyette (a hash/query
// megtartásával), hogy a látogató sose lássa a fájlnevet a URL-ben.
(function cleanIndexUrl() {
    if (!window.history || !window.history.replaceState) return;
    if (/\/index\.html$/i.test(window.location.pathname)) {
        const cleanPath = window.location.pathname.replace(/index\.html$/i, '');
        window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
    }
})();

// ── Hulló parázs-szemcse háttéranimáció (ugyanaz, mint a SolarCenter/SolarLauncherben) ──
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function spawn() {
        return {
            x: Math.random() * canvas.width,
            y: -10,
            r: 1 + Math.random() * 2.2,
            speed: 0.4 + Math.random() * 0.9,
            drift: (Math.random() - 0.5) * 0.4,
            alpha: 0.15 + Math.random() * 0.35,
            hue: Math.random() < 0.5 ? '255,196,46' : '255,157,23'
        };
    }
    const COUNT = 55;
    for (let i = 0; i < COUNT; i++) {
        const p = spawn();
        p.y = Math.random() * (window.innerHeight || 620);
        particles.push(p);
    }

    function tick() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
            p.y += p.speed;
            p.x += p.drift;
            if (p.y > canvas.height + 10) Object.assign(p, spawn());
            ctx.beginPath();
            ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
})();

// ── Görgetési előrehaladás-sáv a lap tetején ──
(function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    function update() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
})();

function copyIP() {
    const ip = document.getElementById('ip-text').innerText;
    navigator.clipboard.writeText(ip);
    alert('Szerver IP másolva: ' + ip);
}

// ── GYIK accordion - egyszerre csak egy kérdés van nyitva ──
document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach((el) => el.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
    });
});

// ── Scroll-reveal: minden .reveal elem csak akkor kapja meg a .visible
// osztályt (ld. style.css), amikor először a nézetbe scrollódik - utána
// nem figyeljük tovább (unobserve), hogy vissza-görgetéskor ne villanjon.
(function initRevealObserver() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || revealEls.length === 0) {
        revealEls.forEach((el) => el.classList.add('visible'));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => observer.observe(el));
})();

// ── Statisztika-számlálók: 0-ból számolnak fel a data-count értékig,
// amint a stat-sáv a nézetbe kerül (a suffix, pl. "+"/"%"/"/7", a
// data-suffix attribútumból jön, ez a számláláson KÍVÜL, változatlanul
// jelenik meg a szám mögött).
(function initCountUp() {
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;
    const DURATION_MS = 1200;

    function animate(el) {
        const target = parseInt(el.getAttribute('data-count'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / DURATION_MS, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) {
        counters.forEach(animate);
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animate(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    counters.forEach((el) => observer.observe(el));
})();

// ── Csapat 3D skin-előnézetek - ugyanaz a WebGL-alapú skin3d.js, amit a
// SolarCenter is használ a saját profil-nézetéhez, csak itt statikus,
// helyi PNG-kből tölti be a textúrákat (nincs mögötte backend-lekérdezés).
(function initTeamSkins() {
    if (typeof SkinPreview === 'undefined') return;
    const members = [
        { canvasId: 'teamSkinKisskorboy', src: 'assets/team/kisskorboy.png', slim: false },
        { canvasId: 'teamSkinImperiussss', src: 'assets/team/imperiussss.png', slim: false },
        { canvasId: 'teamSkinDistance', src: 'assets/team/distance.png', slim: false }
    ];
    members.forEach(({ canvasId, src, slim }) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const img = new Image();
        img.onload = () => SkinPreview.start(canvas, img, slim);
        img.src = src;
    });
})();

// ── Jobb klikk (kontextusmenü) letiltása + a fejlesztői eszközök gyors
// billentyűinek blokkolása. Ez csak visszatartó erejű - egy technikailag
// jártas látogató a böngésző saját menüjéből még mindig megnyithatja a
// fejlesztői eszközöket, ezt kliensoldali JS nem tudja garantáltan megakadályozni.
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const blocked =
        key === 'f12' ||
        (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
        (e.ctrlKey && key === 'u');
    if (blocked) e.preventDefault();
});
