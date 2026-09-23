function openLegalTab(key, smooth) {
    const targetTab = document.querySelector(`.legal-tab[data-legal="${CSS.escape(key)}"]`);
    if (!targetTab) return;
    document.querySelectorAll('.legal-tab').forEach((t) => t.classList.toggle('active', t === targetTab));
    document.querySelectorAll('.legal-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.getAttribute('data-legal-panel') === key);
    });
    if (smooth) document.querySelector('.legal-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.legal-tab').forEach((tab) => {
    tab.addEventListener('click', () => openLegalTab(tab.getAttribute('data-legal'), true));
});

window.addEventListener('hashchange', () => {
    const key = window.location.hash.replace('#', '');
    if (key) openLegalTab(key, true);
});

const initialLegalTab = window.location.hash.replace('#', '');
if (initialLegalTab) openLegalTab(initialLegalTab, false);
