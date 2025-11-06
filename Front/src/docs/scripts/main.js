document.addEventListener('DOMContentLoaded', () => {

    // --- FUNCIÓN REUTILIZABLE PARA PAN & ZOOM ---
    const enablePanAndZoom = (container) => {
        const wrapper = container.querySelector('.pan-zoom-wrapper');
        const img = container.querySelector('img');
        if (!wrapper || !img) return;

        let scale = 1;
        let isPanning = false;
        let currentTranslate = { x: 0, y: 0 };
        let targetTranslate = { x: 0, y: 0 };
        let startPan = { x: 0, y: 0 };
        const dampingFactor = 0.2; // Suavizado

        const animate = () => {
            currentTranslate.x += (targetTranslate.x - currentTranslate.x) * dampingFactor;
            currentTranslate.y += (targetTranslate.y - currentTranslate.y) * dampingFactor;

            wrapper.style.transform = `translate(${currentTranslate.x}px, ${currentTranslate.y}px)`;
            img.style.transform = `scale(${scale})`;

            const isAnimating = Math.abs(targetTranslate.x - currentTranslate.x) > 0.5 || Math.abs(targetTranslate.y - currentTranslate.y) > 0.5;
            if (isAnimating) requestAnimationFrame(animate);
        };

        const updateTransform = () => requestAnimationFrame(animate);

        container.addEventListener('wheel', e => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            scale = Math.min(Math.max(0.5, scale + delta), 5);
            updateTransform();
        });

        const onMouseMove = e => {
            if (!isPanning) return;
            targetTranslate.x = e.clientX - startPan.x;
            targetTranslate.y = e.clientY - startPan.y;
            updateTransform();
        };

        const onMouseUp = () => {
            isPanning = false;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        container.addEventListener('mousedown', e => {
            if (e.button !== 0) return;

            // LA LÍNEA PROBLEMÁTICA HA SIDO ELIMINADA. AHORA EL DRAG SIEMPRE SE INICIA.

            e.preventDefault();
            isPanning = true;
            startPan = { x: e.clientX - targetTranslate.x, y: e.clientY - targetTranslate.y };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        // Función para resetear la vista, accesible desde fuera
        container.resetView = () => {
            scale = 1;
            targetTranslate = { x: 0, y: 0 };
            currentTranslate = { x: 0, y: 0 };
            updateTransform();
        };
    };

    // --- APLICAR PAN & ZOOM A LOS VISORES PEQUEÑOS ---
    document.querySelectorAll('.image-container').forEach(enablePanAndZoom);

    // --- LÓGICA PARA EL POPUP (LIGHTBOX) ---
    const popup = document.getElementById('image-popup');
    if (popup) {
        // APLICAR PAN & ZOOM AL POPUP MISMO
        enablePanAndZoom(popup);

        const popupImage = document.getElementById('popup-image');
        const closeBtn = document.querySelector('.popup-close-btn');

        document.querySelectorAll('.image-viewer').forEach(viewer => {
            viewer.addEventListener('click', () => {
                const imgSrc = viewer.querySelector('img')?.src;
                if (imgSrc && popupImage) {
                    popupImage.src = imgSrc;
                    popup.classList.add('active');
                    if (popup.resetView) popup.resetView();
                }
            });
        });

        const closePopup = () => popup.classList.remove('active');
        if (closeBtn) closeBtn.addEventListener('click', closePopup);
        popup.addEventListener('click', e => {
            // Cierra si se hace clic en el fondo (el overlay)
            if (e.target === popup) closePopup();
        });
    }

// Smooth scroll para enlaces internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Actualizar la URL sin recargar la página
            history.pushState(null, null, targetId);
        }
    });
});

// Resaltar el enlace activo en la sidebar derecha según el scroll
const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -70% 0px',
    threshold: 0
};

const observerCallback = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');

            // Remover clase active de todos los enlaces
            document.querySelectorAll('.sidebar-right a').forEach(link => {
                link.classList.remove('active-section');
            });

            // Agregar clase active al enlace correspondiente
            const activeLink = document.querySelector(`.sidebar-right a[href="#${id}"]`);
            if (activeLink) {
                activeLink.classList.add('active-section');
            }
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

// Observar todas las secciones con id
document.querySelectorAll('h1[id], h2[id], h3[id], h4[id]').forEach(section => {
    observer.observe(section);
});

// Agregar efecto de ripple a los botones source
document.querySelectorAll('.source-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Estilo para el efecto ripple
const style = document.createElement('style');
style.textContent = `
    .source-btn {
        position: relative;
        overflow: hidden;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .active-section {
        color: #24292f !important;
        font-weight: 600 !important;
    }
`;
document.head.appendChild(style);

// Manejar el estado del menú en dispositivos móviles
const toggleSidebar = () => {
    const sidebar = document.querySelector('.sidebar-left');
    if (window.innerWidth <= 768) {
        sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    }
};

// Cerrar sidebar en móvil al hacer clic en un enlace
if (window.innerWidth <= 768) {
    document.querySelectorAll('.sidebar-left a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.sidebar-left').style.display = 'none';
        });
    });
}

/*// Lazy loading para imágenes
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback para navegadores que no soportan lazy loading nativo
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.*/

});