function switchView(viewFunction) {
    const container = document.getElementById('app-container');
    container.classList.remove('fade-in');

    // Trigger reflow to restart animation
    void container.offsetWidth;

    container.classList.add('fade-in');
    viewFunction();
}