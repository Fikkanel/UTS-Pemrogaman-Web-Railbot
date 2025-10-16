document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const contentArea = document.querySelector('main'); // Target main content area

    // Observer for fade-in animations
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                animationObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    // Initialize scripts for the current page
    const initializePageScripts = () => {
        const animatedSections = document.querySelectorAll('.animated-section');
        animatedSections.forEach(section => animationObserver.observe(section));

        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);
        }
        
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.draggable = false;
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });
    };

    // Toggle mobile navigation
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    navMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });

    // Handle contact form submission
    const handleFormSubmit = (event) => {
        event.preventDefault();
        let isFormValid = true;
        const form = event.target;
        const inputs = form.querySelectorAll('[required]');

        inputs.forEach(input => {
            if (!input.value.trim()) {
                showError(input, `${input.previousElementSibling.textContent} tidak boleh kosong.`);
                isFormValid = false;
            } else if (input.type === 'email' && !validateEmail(input.value)) {
                showError(input, 'Format email tidak valid.');
                isFormValid = false;
            } else {
                hideError(input);
            }
        });

        if (isFormValid) {
            const successMessage = form.querySelector('#formSuccessMessage');
            successMessage.style.display = 'block';
            form.reset();
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 4000);
        }
    };

    const showError = (input, message) => {
        input.classList.add('invalid');
        const errorEl = input.nextElementSibling;
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    };

    const hideError = (input) => {
        input.classList.remove('invalid');
        const errorEl = input.nextElementSibling;
        errorEl.style.display = 'none';
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

    // Initialize scripts for the page
    initializePageScripts();
});