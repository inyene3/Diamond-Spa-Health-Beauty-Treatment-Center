document.addEventListener('DOMContentLoaded', function() {
    var navbar = document.getElementById('navbar');
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    var navLinks = document.querySelectorAll('.nav-link');
    var STORAGE_KEY = 'diamondspa_bookings';

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
            var href = this.getAttribute('href');
            if (href.length > 1) {
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    var offset = 80;
                    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            }
        });
    });

    // SET MIN DATE TO TODAY
    var dateInputs = document.querySelectorAll('input[type="date"]');
    var today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(function(input) {
        input.setAttribute('min', today);
    });

    // BOOKING SYSTEM
    function getBookings() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch(e) {
            return [];
        }
    }

    function saveBookings(bookings) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    }

    function generateId() {
        return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5);
    }

    function formatWhatsAppMessage(booking) {
        var msg = 'Hello Diamond Spa! I\'d like to book an appointment.\n\n';
        msg += '*Booking Details:*\n';
        msg += 'Name: ' + booking.name + '\n';
        msg += 'Phone: ' + booking.phone + '\n';
        msg += 'Service: ' + booking.service + '\n';
        msg += 'Date: ' + booking.date + '\n';
        msg += 'Time: ' + booking.time + '\n';
        if (booking.notes) {
            msg += 'Notes: ' + booking.notes + '\n';
        }
        msg += '\nPlease confirm my appointment. Thank you!';
        return msg;
    }

    // HANDLE BOOKING FORM SUBMISSION
    var bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var name = document.getElementById('bookName').value.trim();
            var phone = document.getElementById('bookPhone').value.trim();
            var service = document.getElementById('bookService').value;
            var date = document.getElementById('bookDate').value;
            var time = document.getElementById('bookTime').value;
            var notes = document.getElementById('bookNotes').value.trim();

            if (!name || !phone || !service || !date || !time) {
                alert('Please fill in all required fields.');
                return;
            }

            var booking = {
                id: generateId(),
                name: name,
                phone: phone,
                service: service,
                date: date,
                time: time,
                notes: notes,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Save to localStorage
            var bookings = getBookings();
            bookings.push(booking);
            saveBookings(bookings);

            // Format WhatsApp message
            var waMsg = formatWhatsAppMessage(booking);
            var waUrl = 'https://wa.me/2349066686805?text=' + encodeURIComponent(waMsg);

            // Show success message
            var formWrap = bookingForm.parentElement;
            formWrap.innerHTML = '<div class="booking-success">' +
                '<div class="success-icon">&#10004;</div>' +
                '<h3>Booking Received!</h3>' +
                '<p>Your appointment request has been saved. Click below to confirm via WhatsApp, or we\'ll contact you shortly.</p>' +
                '<br>' +
                '<a href="' + waUrl + '" class="btn btn-gold" target="_blank" style="margin-bottom:12px;">&#128172; Confirm via WhatsApp</a>' +
                '<br>' +
                '<a href="#home" class="btn btn-outline-dark">Book Another Appointment</a>' +
                '</div>';
        });
    }

    // INTERSECTION OBSERVER FOR ANIMATIONS
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

    // COUNTER ANIMATION
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

    // ACTIVE NAV LINK HIGHLIGHTING
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
