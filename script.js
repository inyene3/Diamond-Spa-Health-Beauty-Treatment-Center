document.addEventListener('DOMContentLoaded', function() {
    var navbar = document.getElementById('navbar');
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    var navLinks = document.querySelectorAll('.nav-link');
    var BOOKING_KEY = 'diamondspa_bookings';
    var SERVICES_KEY = 'diamondspa_services';

    // Navbar
    function handleScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (href.length > 1) {
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                }
            }
        });
    });

    // Set min date
    var today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(function(input) {
        input.setAttribute('min', today);
    });

    function esc(text) {
        var d = document.createElement('div');
        d.textContent = text || '';
        return d.innerHTML;
    }

    function generateId() {
        return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5);
    }

    // ============ BOOKING ============
    function formatWhatsAppMessage(booking) {
        var msg = 'Hello Diamond Spa! I\'d like to book an appointment.\n\n';
        msg += '*Booking Details:*\n';
        msg += 'Name: ' + booking.name + '\n';
        msg += 'Phone: ' + booking.phone + '\n';
        msg += 'Service: ' + booking.service + '\n';
        msg += 'Date: ' + booking.date + '\n';
        msg += 'Time: ' + booking.time + '\n';
        if (booking.notes) msg += 'Notes: ' + booking.notes + '\n';
        msg += '\nPlease confirm my appointment. Thank you!';
        return msg;
    }

    async function saveBooking(booking) {
        // Try Firestore first
        if (typeof firebaseReady !== 'undefined' && firebaseReady && typeof db !== 'undefined' && db) {
            try {
                await db.collection('bookings').doc(booking.id).set(booking);
                console.log('Booking saved to Firestore');
                return true;
            } catch (error) {
                console.error('Firestore save failed:', error);
            }
        }
        // Fallback to localStorage
        var bookings = JSON.parse(localStorage.getItem(BOOKING_KEY) || '[]');
        bookings.push(booking);
        localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings));
        console.log('Booking saved to localStorage');
        return true;
    }

    var bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
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

            await saveBooking(booking);

            var waMsg = formatWhatsAppMessage(booking);
            var waUrl = 'https://wa.me/2349066686805?text=' + encodeURIComponent(waMsg);

            var formWrap = bookingForm.parentElement;
            formWrap.innerHTML = '<div class="booking-success">' +
                '<div class="success-icon">&#10004;</div>' +
                '<h3>Appointment Confirmed!</h3>' +
                '<p>We\'ve received your booking. You can also confirm via WhatsApp to speed things up.</p>' +
                '<br>' +
                '<a href="' + waUrl + '" class="btn btn-gold" target="_blank" style="margin-bottom:12px;">&#128172; Confirm on WhatsApp</a>' +
                '<br><br>' +
                '<a href="#booking" class="btn btn-outline-dark">Book Another Appointment</a>' +
                '</div>';
        });
    }

    // ============ SERVICES ============
    var defaultServices = [
        { id: 'svc_1', name: 'Pedicure & Nail Care', description: 'Luxurious pedicure stations with professional foot care.', price: 'from \u20A65,000', image: 'images/pedicure.png', waText: 'Hi! I\'d like to book a pedicure.' },
        { id: 'svc_2', name: 'Infrared Sauna & Wellness', description: 'Detoxify and rejuvenate with our far-infrared spectrum energy room.', price: 'from \u20A68,000', image: 'images/sauna.png', waText: 'Hi! I\'d like to book a sauna session.' },
        { id: 'svc_3', name: 'Dental & Facial Care', description: 'Professional dental hygiene and facial treatments.', price: 'from \u20A610,000', image: 'images/dental.png', waText: 'Hi! I\'d like to book a dental/facial session.' }
    ];

    async function getServices() {
        if (typeof firebaseReady !== 'undefined' && firebaseReady && typeof db !== 'undefined' && db) {
            try {
                var snapshot = await db.collection('services').get();
                if (!snapshot.empty) {
                    var services = [];
                    snapshot.forEach(function(doc) { services.push(doc.data()); });
                    return services;
                }
            } catch (error) {
                console.error('Firestore services error:', error);
            }
        }
        // Fallback
        var data = localStorage.getItem(SERVICES_KEY);
        if (data) {
            var s = JSON.parse(data);
            return s.length > 0 ? s : defaultServices;
        }
        return defaultServices;
    }

    async function renderCustomerServices() {
        var container = document.getElementById('customerServices');
        if (!container) return;

        var services = await getServices();
        var html = '';

        services.forEach(function(s) {
            html += '<div class="service-card">';
            html += '<div class="service-img-wrap">';
            html += s.image ? '<img src="' + s.image + '" alt="' + esc(s.name) + '" loading="lazy">' : '<div class="service-img-placeholder">&#10024;</div>';
            html += '</div>';
            html += '<div class="service-body">';
            html += '<h3>' + esc(s.name) + '</h3>';
            html += '<p>' + esc(s.description) + '</p>';
            html += '<div class="service-footer">';
            html += '<span class="price">' + esc(s.price) + '</span>';
            html += '<a href="https://wa.me/2349066686805?text=' + encodeURIComponent(s.waText || 'Hi! I\'d like to book ' + s.name + '.') + '" class="book-link" target="_blank">BOOK NOW &rarr;</a>';
            html += '</div></div></div>';
        });

        container.innerHTML = html;
    }

    async function populateServiceDropdown() {
        var select = document.getElementById('bookService');
        if (!select) return;
        var services = await getServices();
        select.innerHTML = '<option value="" disabled selected>Select a service</option>';
        services.forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s.name;
            opt.textContent = s.name;
            select.appendChild(opt);
        });
    }

    renderCustomerServices();
    populateServiceDropdown();

    // ============ ANIMATIONS ============
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.service-card, .review-card, .about-dark, .about-light, .contact-info, .contact-map, .gallery-item, .stat, .package-card').forEach(function(el) {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    var style = document.createElement('style');
    style.textContent = '.animate-on-scroll{opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s ease}.animate-on-scroll.visible{opacity:1;transform:translateY(0)}';
    document.head.appendChild(style);

    // Counter
    function animateCounter(el, target, duration) {
        var startTime = null;
        var isDecimal = target % 1 !== 0;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var current = (1 - Math.pow(1 - progress, 3)) * target;
            el.childNodes[0].textContent = isDecimal ? current.toFixed(1) : Math.floor(current) + (el.dataset.suffix || '');
            if (progress < 1) requestAnimationFrame(step);
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
                    if (!text.includes('1000s')) animateCounter(el, number, 2000);
                }
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(function(el) { counterObserver.observe(el); });

    // Active nav
    var sections = document.querySelectorAll('section[id]');
    function highlightNav() {
        var scrollY = window.scrollY + 100;
        sections.forEach(function(section) {
            if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
                navLinks.forEach(function(link) {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + section.id);
                });
            }
        });
    }
    window.addEventListener('scroll', highlightNav);

    var activeStyle = document.createElement('style');
    activeStyle.textContent = '.nav-link.active { color: var(--gold) !important; }';
    document.head.appendChild(activeStyle);
});
