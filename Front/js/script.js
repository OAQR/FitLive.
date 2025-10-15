document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica del Menú de Navegación Móvil ---
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    console.log("FitLive Index Page Script Loaded.");
});