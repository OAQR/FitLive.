document.addEventListener('DOMContentLoaded', () => {

    //CURSOR PERSONALIZADO Y FOCO DE LUZ (SPOTLIGHT)
    const cursor = document.querySelector('.cursor');
    const spotlight = document.querySelector('.spotlight');
    const interactiveElements = document.querySelectorAll('a, button, .project-card-link');

    let mouse = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    gsap.ticker.add(() => {
        gsap.to(cursor, {
            duration: 0.3,
            x: mouse.x,
            y: mouse.y,
            ease: 'power2.out'
        });
        gsap.to(spotlight, {
            duration: 1.5,
            x: mouse.x,
            y: mouse.y,
            ease: 'power3.out'
        });
    });

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    htmlElement.setAttribute('data-theme', savedTheme);
    themeToggle.addEventListener('click', () => {
        const newTheme = htmlElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateParticleColors();
    });
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
    const tl = gsap.timeline();
    tl.from('.main-header', {
            opacity: 0,
            y: -50,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.5
        })
        .from('.hero-title', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.3')
        .from('.hero-subtitle', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.5')
        .from('.cta-button', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.5');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    animatedElements.forEach(element => observer.observe(element));


    // FONDO ESTELAR
    let scene, camera, renderer, particles;
    const canvas = document.getElementById('bg-canvas');

    function initThree() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const particleCount = 4000;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 10;
        }

        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.005,
            color: getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim(),
            transparent: true,
            opacity: 0.7
        });

        particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        window.addEventListener('resize', onWindowResize, false);

        animate(); // La llamada a onDocumentMouseMove ya no es necesaria aquí
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        particles.rotation.y += 0.0001;

        // La cámara ahora usa las variables 'mouse' actualizadas por el listener global
        camera.position.x += (mouse.x / window.innerWidth * 2 - 1) * 0.2 - camera.position.x * 0.02;
        camera.position.y += (-(mouse.y / window.innerHeight * 2 - 1)) * 0.2 - camera.position.y * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    function updateParticleColors() {
        if (particles) {
            const newColor = getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim();
            gsap.to(particles.material.color, {
                duration: 0.5,
                r: new THREE.Color(newColor).r,
                g: new THREE.Color(newColor).g,
                b: new THREE.Color(newColor).b
            });
        }
    }

    initThree();


    //FOOTER: AÑO ACTUAL
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

});