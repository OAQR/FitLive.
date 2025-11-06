document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DEL INTERRUPTOR DE TEMA ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    // Función para aplicar el tema y guardar la preferencia
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeIcon.classList.remove('bi-brightness-high-fill');
            themeIcon.classList.add('bi-moon-stars-fill');
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.classList.remove('bi-moon-stars-fill');
            themeIcon.classList.add('bi-brightness-high-fill');
        }
        localStorage.setItem('theme', theme);
    };

    // Evento de clic para cambiar de tema
    themeToggle.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    // Cargar el tema al iniciar la página
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    }

    // --- CÓDIGO ORIGINAL (Zoom/Pan, Scroll, etc.) ---
    const imageContainer = document.getElementById('imageContainer');
    const diagramImage = document.getElementById('diagramImage');

    if (imageContainer && diagramImage) {
        let scale = 1;
        let isPanning = false;
        let start = { x: 0, y: 0 };
        let translate = { x: 0, y: 0 };

        diagramImage.style.transformOrigin = '0 0';

        const setTransform = () => {
            diagramImage.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
        };

        imageContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = imageContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const wheel = e.deltaY < 0 ? 1.1 : 0.9;
            const newScale = Math.min(Math.max(0.5, scale * wheel), 4);

            translate.x = mouseX - (mouseX - translate.x) * (newScale / scale);
            translate.y = mouseY - (mouseY - translate.y) * (newScale / scale);
            scale = newScale;

            setTransform();
        });

        imageContainer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isPanning = true;
            start = { x: e.clientX - translate.x, y: e.clientY - translate.y };
        });

        window.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            e.preventDefault();
            translate.x = e.clientX - start.x;
            translate.y = e.clientY - start.y;
            setTransform();
        });

        window.addEventListener('mouseup', () => { isPanning = false; });
    }

    // Resaltar sección activa en sidebar derecha
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.sidebar-right a').forEach(link => link.classList.remove('active-section'));
                const activeLink = document.querySelector(`.sidebar-right a[href="#${entry.target.id}"]`);
                if (activeLink) activeLink.classList.add('active-section');
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });

    document.querySelectorAll('h1[id], h2[id]').forEach(section => observer.observe(section));
});