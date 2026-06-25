import { loadTimetable } from './Timetable.js?v=2';
import { loadMaterialsVault } from './MaterialsVault.js?v=2';
import { loadHome } from './Home.js?v=2';

export function renderNavbar() {
    const navRoot = document.getElementById('navbar-root');
    // Inside renderNavbar()
    navRoot.innerHTML = `
    <div class="navbar-wrapper">
        <header class="navbar">
            <div class="brand-group" id="brand-logo" style="cursor: pointer;">
                <div class="logo-mark" style="background: var(--brand-accent);"></div>
                <span class="brand-text">SOUMaterial</span>
                <span class="badge-version">Sem 7</span>
            </div>
            <nav class="tabs">
                <button id="tab-home" class="tab-btn">Home</button>
                <button id="tab-timetable" class="tab-btn">Timetable</button>
                <button id="tab-materials" class="tab-btn">Subject</button> </nav>
        </header>
    </div>
`;

    document.getElementById('brand-logo').addEventListener('click', () => loadHome());

    document.getElementById('tab-home').addEventListener('click', (e) => {
        setActiveTab(e.target);
        loadHome();
    });

    document.getElementById('tab-timetable').addEventListener('click', (e) => {
        setActiveTab(e.target);
        loadTimetable('Monday');
    });

    document.getElementById('tab-materials').addEventListener('click', (e) => {
        setActiveTab(e.target);
        loadMaterialsVault();
    });
}

function setActiveTab(clickedTab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    clickedTab.classList.add('active');
}