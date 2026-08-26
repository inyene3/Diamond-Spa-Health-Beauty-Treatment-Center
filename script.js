document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Mobile nav toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile nav on link click
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                var offset = 80;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // Intersection Observer for scroll animations
    var observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    var animateElements = document.querySelectorAll(
        '.service-card, .review-card, .about-dark, .about-light, .contact-info, .contact-map, .gallery-item, .stat'
    );

    animateElements.forEach(function(el) {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Add animation CSS
    var style = document.createElement('style');
    style.textContent = '\
        .animate-on-scroll {\
            opacity: 0;\
            transform: translateY(30px);\
            transition: opacity 0.6s ease, transform 0.6s ease;\
        }\
        .animate-on-scroll.visible {\
            opacity: 1;\
            transform: translateY(0);\
        }\
        .service-card:nth-child(2) { transition-delay: 0.1s; }\
        .service-card:nth-child(3) { transition-delay: 0.2s; }\
        .review-card:nth-child(2) { transition-delay: 0.1s; }\
        .review-card:nth-child(3) { transition-delay: 0.2s; }\
        .gallery-item:nth-child(2) { transition-delay: 0.05s; }\
        .gallery-item:nth-child(3) { transition-delay: 0.1s; }\
        .gallery-item:nth-child(4) { transition-delay: 0.15s; }\
        .gallery-item:nth-child(5) { transition-delay: 0.2s; }\
        .stat:nth-child(2) { transition-delay: 0.1s; }\
        .stat:nth-child(3) { transition-delay: 0.2s; }\
    ';
    document.head.appendChild(style);

    // Counter animation
    function animateCounter(el, target, duration) {
        var start = 0;
        var isDecimal = target % 1 !== 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = eased * target;

            if (isDecimal) {
                el.childNodes[0].textContent = current.toFixed(1);
            } else {
                var suffix = el.dataset.suffix || '';
                el.childNodes[0].textContent = Math.floor(current) + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    var counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var text = el.textContent.trim();
                var number = parseFloat(text);

                if (!isNaN(number)) {
                    if (text.includes('+')) el.dataset.suffix = '+';
                    if (text.includes('%')) el.dataset.suffix = '%';
                    if (text.includes('1000s')) {
                        el.childNodes[0].textContent = '1000s';
                    } else {
                        animateCounter(el, number, 2000);
                    }
                }
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(function(el) {
        counterObserver.observe(el);
    });

    // Active nav link highlighting
    var sections = document.querySelectorAll('section[id]');

    function highlightNav() {
        var scrollY = window.scrollY + 100;
        sections.forEach(function(section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(function(link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    window.addEventListener('scroll', highlightNav);

    var activeStyle = document.createElement('style');
    activeStyle.textContent = '.nav-link.active { color: var(--gold) !important; }';
    document.head.appendChild(activeStyle);
});
