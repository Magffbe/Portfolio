const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

let prefersReducedMotion = motionPreference.matches;

// ========================================
// 1. ANIMACIONES DE SECCIONES Y TARJETAS
// ========================================

const animatedElements = document.querySelectorAll(
    "#about, " +
    "#projects, " +
    "#skills, " +
    "#certificates, " +
    "#contact, " +
    "#projects .project-card, " +
    "#skills .skill-card, " +
    "#certificates .certificate-card"
);

let revealObserver = null;

function showAllElements() {
    animatedElements.forEach((element) => {
        element.classList.remove("will-animate");
        element.classList.add("is-visible");
        element.style.transitionDelay = "";
    });
}

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    showAllElements();
} else {
    revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: "0px 0px 35px 0px"
        }
    );

    animatedElements.forEach((element, index) => {
        element.classList.add("will-animate");
        element.style.transitionDelay = `${(index % 4) * 110}ms`;
        revealObserver.observe(element);
    });
}

// ========================================
// 2. FONDO CONTINUO DE PARTÍCULAS
// ========================================

const particleCanvas = document.createElement("canvas");
particleCanvas.id = "particle-background";
particleCanvas.setAttribute("aria-hidden", "true");
document.body.prepend(particleCanvas);

const particleContext = particleCanvas.getContext("2d");

if (particleContext) {
    let canvasWidth = 0;
    let canvasHeight = 0;
    let particles = [];
    let animationFrame = null;
    let lastFrameTime = 0;

    const particleCount = 90;
    const pointer = { x: -1000, y: -1000 };

    function createParticles() {
        particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,

            // Variación de tamaño para dar profundidad.
            radius: Math.random() * 1.8 + 0.8,

            // Velocidades independientes en cada dirección.
            speedX: (Math.random() - 0.5) * 0.9,
            speedY: (Math.random() - 0.5) * 0.9,

            alpha: Math.random() * 0.4 + 0.4,
            phase: Math.random() * Math.PI * 2
        }));
    }

    function resizeCanvas() {
        const pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;

        particleCanvas.width = Math.round(
            canvasWidth * pixelRatio
        );

        particleCanvas.height = Math.round(
            canvasHeight * pixelRatio
        );

        particleContext.setTransform(
            pixelRatio, 0, 0, pixelRatio, 0, 0
        );

        createParticles();
        renderParticles(0);
    }

    function renderParticles(time = 0) {
        particleContext.clearRect(
            0, 0, canvasWidth, canvasHeight
        );

        const elapsed = lastFrameTime
            ? Math.min((time - lastFrameTime) / 16.67, 2)
            : 1;

        lastFrameTime = time;

        particles.forEach((particle) => {
            if (!prefersReducedMotion) {
                particle.x += particle.speedX * elapsed;
                particle.y += particle.speedY * elapsed;

                // El brillo cambia continuamente.
                particle.phase += 0.035 * elapsed;

                // Las partículas reaparecen por el lado contrario.
                if (particle.x < -6) {
                    particle.x = canvasWidth + 6;
                } else if (particle.x > canvasWidth + 6) {
                    particle.x = -6;
                }

                if (particle.y < -6) {
                    particle.y = canvasHeight + 6;
                } else if (particle.y > canvasHeight + 6) {
                    particle.y = -6;
                }
            }

            const dx = particle.x - pointer.x;
            const dy = particle.y - pointer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Líneas tenues cerca del cursor.
            if (
                !prefersReducedMotion &&
                distance < 135 &&
                distance > 0
            ) {
                particleContext.beginPath();
                particleContext.moveTo(particle.x, particle.y);
                particleContext.lineTo(pointer.x, pointer.y);

                particleContext.strokeStyle =
                    `rgba(56, 217, 245, ${
                        (1 - distance / 135) * 0.22
                    })`;

                particleContext.lineWidth = 0.8;
                particleContext.stroke();
            }

            const twinkle = prefersReducedMotion
                ? 1
                : 0.55 + (Math.sin(particle.phase) + 1) * 0.3;

            const opacity = particle.alpha * twinkle;

            particleContext.beginPath();
            particleContext.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );

            particleContext.fillStyle =
                `rgba(56, 217, 245, ${opacity})`;

            particleContext.shadowBlur = 10;
            particleContext.shadowColor =
                "rgba(56, 217, 245, 0.8)";

            particleContext.fill();
            particleContext.shadowBlur = 0;
        });
    }

    function animateParticles(time) {
        animationFrame = null;

        if (document.hidden || prefersReducedMotion) {
            return;
        }

        renderParticles(time);
        animationFrame =
            window.requestAnimationFrame(animateParticles);
    }

    function startAnimation() {
        if (
            prefersReducedMotion ||
            document.hidden ||
            animationFrame !== null
        ) {
            return;
        }

        lastFrameTime = 0;

        animationFrame =
            window.requestAnimationFrame(animateParticles);
    }

    function stopAnimation() {
        if (animationFrame !== null) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }

        lastFrameTime = 0;
    }

    window.addEventListener("resize", () => {
        resizeCanvas();
        startAnimation();
    });

    window.addEventListener(
        "pointermove",
        (event) => {
            pointer.x = event.clientX;
            pointer.y = event.clientY;
        },
        { passive: true }
    );

    window.addEventListener("pointerleave", () => {
        pointer.x = -1000;
        pointer.y = -1000;
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    // Si cambia la preferencia del sistema, se actualiza sin
    // tener que editar el código ni recargar manualmente.
    motionPreference.addEventListener("change", (event) => {
        prefersReducedMotion = event.matches;

        if (prefersReducedMotion) {
            stopAnimation();

            if (revealObserver) {
                revealObserver.disconnect();
            }

            showAllElements();
            renderParticles(0);
        } else {
            startAnimation();
        }
    });

    resizeCanvas();
    startAnimation();
}

// Rotating hero title
document.addEventListener("DOMContentLoaded", () => {
    const title = document.querySelector(".rotating-title");

    if (!title) return;

    const titles = [
        "Web Developer",
        "WordPress & Frontend Specialist",
        "Problem Solver"
    ];

    let currentIndex = 0;

    title.textContent = titles[currentIndex];
    title.style.transition = "opacity 0.35s ease";
    
    setInterval(() => {
        title.style.opacity = "0";

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % titles.length;
            title.textContent = titles[currentIndex];
            title.style.opacity = "1";
        }, 350);
    }, 2500);
});



