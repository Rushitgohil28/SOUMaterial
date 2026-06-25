import { loadMaterialsVault } from './MaterialsVault.js?v=2';
import { triggerProgressBar } from './Navbar.js?v=2';

export function loadHome() {
    const container = document.getElementById('app-container');

    let foldersHtml = '';
    [7, 8].forEach(sem => {
        const colorClass = sem === 7 ? 'folder-color-purple' : 'folder-color-blue';
        foldersHtml += `
            <div class="folder-3d-wrapper group" data-semester="${sem}">
                <div class="folder-3d ${colorClass}">
                    <div class="folder-back"></div>
                    <div class="folder-page page-3"></div>
                    <div class="folder-page page-2"></div>
                    <div class="folder-page page-1"></div>
                    <div class="folder-front">
                        <p class="folder-title">Semester-0${sem}</p>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="hero-section">
            <div class="badge-pill">🚀 BCA Honors Study Portal</div>
            
            <h1 class="hero-title">Get All Your <span class="gradient-text">Material</span><br>at One Spot</h1>
            <p class="hero-subtitle">
                This site contains BCA Study Materials of Silver Oak University. 
                In More Beautiful and Reader Friendly Format. Consider leaving 
                <a href="https://forms.gle/soumaterialfeedback" target="_blank" rel="noopener noreferrer">Feedback</a>.
            </p>

            <h2 style="font-size: 2.2rem; font-family: 'Outfit', sans-serif; margin-top: 3.5rem; margin-bottom: 1.5rem; font-weight: 800; color: var(--text-primary);">BCA Honors</h2>
            
            <div class="grid-semesters">
                ${foldersHtml}
            </div>
        </div>
    `;

    // Attach event listeners to folders
    document.querySelectorAll('.folder-3d-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            const sem = parseInt(wrapper.dataset.semester);
            triggerProgressBar();
            loadMaterialsVault(sem);
        });
    });
}