/**
 * Transition helper to swap views smoothly with transition animations
 */
export function switchView(viewFunction) {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    container.style.transition = 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)';

    setTimeout(() => {
        viewFunction();
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 200);
}