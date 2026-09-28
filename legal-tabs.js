function openLegalTab(key, smooth) {
    const targetTab = document.querySelector(`.legal-tab[data-legal="${CSS.escape(key)}"]`);
    if (!targetTab) return false;
    document.querySelectorAll('.legal-tab').forEach((t) => t.classList.toggle('active', t === targetTab));
    document.querySelectorAll('.legal-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.getAttribute('data-legal-panel') === key);
    });
    if (smooth) document.querySelector('.legal-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
}

// Szabálypontok: "1.5" -> id="pont-1-5", így egy-egy pontra közvetlenül lehet hivatkozni (pl. ticketben).
document.querySelectorAll('.rules-list li[data-n]').forEach((li) => {
    if (!li.id) li.id = 'pont-' + li.getAttribute('data-n').replace(/\./g, '-');
});

function openFromHash(smooth) {
    const key = decodeURIComponent(window.location.hash.replace('#', ''));
    if (!key) return;
    if (openLegalTab(key, smooth)) return;
    const target = document.getElementById(key);
    const panel = target && target.closest('.legal-panel');
    if (!panel) return;
    openLegalTab(panel.getAttribute('data-legal-panel'), false);
    target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
}

document.querySelectorAll('.legal-tab').forEach((tab) => {
    tab.addEventListener('click', () => openLegalTab(tab.getAttribute('data-legal'), true));
});

window.addEventListener('hashchange', () => openFromHash(true));
openFromHash(false);

(function initRulesSearch() {
    const input = document.getElementById('rulesSearch');
    const page = document.querySelector('.rules-page');
    if (!input || !page) return;
    const count = document.getElementById('rulesSearchCount');
    const panels = Array.from(page.querySelectorAll('.legal-panel'));
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const itemSelector = '.rules-list > li, .rules-steps > li, .rules-table tbody tr';
    const blockSelector = '.rules-list, .rules-steps, .rules-table-wrap';
    const items = Array.from(page.querySelectorAll(itemSelector)).map((el) => ({ el, text: norm(el.textContent) }));

    function reset() {
        page.classList.remove('searching', 'no-results');
        page.querySelectorAll('.rule-hidden, .rule-hit, .no-hits').forEach((el) => el.classList.remove('rule-hidden', 'rule-hit', 'no-hits'));
        if (count) count.textContent = '';
    }

    function run() {
        const terms = norm(input.value.trim()).split(/\s+/).filter(Boolean);
        reset();
        if (terms.length === 0) return;

        page.classList.add('searching');
        let total = 0;
        items.forEach(({ el, text }) => {
            const hit = terms.every((t) => text.includes(t));
            el.classList.toggle('rule-hit', hit);
            el.classList.toggle('rule-hidden', !hit);
            if (hit) total++;
        });

        panels.forEach((panel) => {
            let panelHits = 0;
            let heading = null;
            let headingHits = 0;
            const closeHeading = () => { if (heading) heading.classList.toggle('rule-hidden', headingHits === 0); };
            Array.from(panel.children).forEach((child) => {
                if (child.tagName === 'H3') return;
                if (child.tagName === 'H4') {
                    closeHeading();
                    heading = child;
                    headingHits = 0;
                    return;
                }
                const hits = child.matches(blockSelector) ? child.querySelectorAll('.rule-hit').length : 0;
                child.classList.toggle('rule-hidden', hits === 0);
                headingHits += hits;
                panelHits += hits;
            });
            closeHeading();
            panel.classList.toggle('no-hits', panelHits === 0);
        });

        page.classList.toggle('no-results', total === 0);
        if (count) count.textContent = total + ' találat';
    }

    input.addEventListener('input', run);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { input.value = ''; run(); }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
        const tag = (document.activeElement && document.activeElement.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        input.focus();
    });
})();
