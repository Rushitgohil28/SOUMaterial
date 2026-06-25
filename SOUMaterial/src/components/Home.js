import { loadMaterialsVault } from './MaterialsVault.js';

export function loadHome() {
    const container = document.getElementById('app-container');

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const homeTab = document.getElementById('tab-home');
    if (homeTab) homeTab.classList.add('active');

    container.innerHTML = `
        <div class="hero-section">
            <div class="glow-orb"></div>
            <div class="badge-pill">🚀 BCA Honors 7th Semester</div>
            
            <h1 class="hero-title">Welcome to <br><span class="gradient-text">SOUMaterial</span></h1>
            <p class="hero-subtitle">Your lightning-fast, beautifully designed hub for university schedules, lecture notes, and academic resources.</p>
            
            <div class="hero-actions">
                <button id="cta-explore" class="btn-primary">
                    Browse Materials 
                    <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
            </div>

            <div class="bento-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-top: 3.5rem;">
                <div class="bento-card" style="text-align: left; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); background: var(--bg-surface); transition: var(--transition);">
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--text-primary);">🤖 Generative AI</h3>
                    <p style="font-size: 0.88rem; color: var(--text-secondary);">Explore LLMs, diffusion frameworks, prompt engineering, and neural network foundations.</p>
                </div>
                <div class="bento-card" style="text-align: left; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); background: var(--bg-surface); transition: var(--transition);">
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--text-primary);">💻 Full Stack Dev-I</h3>
                    <p style="font-size: 0.88rem; color: var(--text-secondary);">Master modern multi-tier web architectures, database design patterns, and REST endpoints.</p>
                </div>
                <div class="bento-card" style="text-align: left; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); background: var(--bg-surface); transition: var(--transition);">
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--text-primary);">📊 Computational Analytics</h3>
                    <p style="font-size: 0.88rem; color: var(--text-secondary);">Unleash computational statistics, data visualization, predictive pipelines, and insight modeling.</p>
                </div>
                <div class="bento-card" style="text-align: left; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); background: var(--bg-surface); transition: var(--transition);">
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--text-primary);">🔒 Information Security</h3>
                    <p style="font-size: 0.88rem; color: var(--text-secondary);">Dive deep into network architectures, cryptographic protocols, threats, and secure policies.</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('cta-explore').addEventListener('click', () => {
        document.getElementById('tab-materials').click();
    });
}