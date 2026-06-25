import { loadTimetable } from './Timetable.js?v=2';
import { loadMaterialsVault } from './MaterialsVault.js?v=2';
import { loadHome } from './Home.js?v=2';
import { openSearchModal } from './Search.js?v=2';

// Simulated top progress bar loading animation
export function triggerProgressBar() {
    const progressLine = document.getElementById('progress-line');
    if (!progressLine) return;
    
    progressLine.style.width = '0%';
    progressLine.style.opacity = '1';
    
    setTimeout(() => {
        progressLine.style.width = '30%';
    }, 50);

    setTimeout(() => {
        progressLine.style.width = '70%';
    }, 200);

    setTimeout(() => {
        progressLine.style.width = '100%';
        setTimeout(() => {
            progressLine.style.opacity = '0';
        }, 200);
    }, 450);
}

export function renderNavbar() {
    const navRoot = document.getElementById('navbar-root');
    
    navRoot.innerHTML = `
        <div class="progress-line-container">
            <div id="progress-line" class="progress-line"></div>
        </div>
        <div class="navbar-wrapper">
            <header class="navbar">
                <div class="brand-group" id="brand-logo">
                    <div class="logo-mark-svg" style="color: var(--accent-blue); background: var(--bg-elevated); width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-subtle); transition: var(--transition);">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
                        </svg>
                    </div>
                    <span class="brand-text">SOU<span>Material</span></span>
                </div>
                <div class="navbar-actions">
                    <button id="nav-search" class="icon-btn" title="Search Notes">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                    <button id="nav-timetable" class="icon-btn" title="Timetable">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </button>
                    <button id="nav-theme" class="icon-btn" title="Toggle Theme">
                        <!-- Default Sun Icon (Dark Mode switcher) -->
                        <svg id="theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                        <!-- Default Moon Icon (Light Mode switcher) -->
                        <svg id="theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    </button>
                </div>
            </header>
        </div>
    `;

    // Bind event listeners
    document.getElementById('brand-logo').addEventListener('click', () => {
        triggerProgressBar();
        loadHome();
    });

    document.getElementById('nav-search').addEventListener('click', () => {
        openSearchModal();
    });

    document.getElementById('nav-timetable').addEventListener('click', () => {
        triggerProgressBar();
        loadTimetable('Monday');
    });

    // Theme Toggle Handler
    const themeBtn = document.getElementById('nav-theme');
    themeBtn.addEventListener('click', toggleTheme);

    updateThemeUI();
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('soumaterial_theme', isDark ? 'dark' : 'light');
    updateThemeUI();
}

function updateThemeUI() {
    const isDark = document.documentElement.classList.contains('dark');
    const sunIcon = document.getElementById('theme-sun');
    const moonIcon = document.getElementById('theme-moon');
    
    if (sunIcon && moonIcon) {
        if (isDark) {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }
}