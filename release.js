(function clientRelease() {
    const root = document.getElementById('clientRelease');
    if (!root) return;
    const wait = document.getElementById('clientWait');
    const open = document.getElementById('clientOpen');
    const label = document.getElementById('clientCountdown');
    const releaseAt = Date.parse(root.getAttribute('data-release'));
    if (!Number.isFinite(releaseAt)) return;

    const pad = (n) => String(n).padStart(2, '0');

    function render() {
        const left = releaseAt - Date.now();
        if (left <= 0) {
            wait.hidden = true;
            open.hidden = false;
            return false;
        }
        const s = Math.floor(left / 1000);
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        label.textContent = d > 0 ? `${d} nap ${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(h)}:${pad(m)}:${pad(sec)}`;
        return true;
    }

    if (!render()) return;
    const timer = setInterval(() => {
        if (!render()) clearInterval(timer);
    }, 1000);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) render();
    });
})();
