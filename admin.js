// ADMIN PANEL - Diamond Spa
(function() {
    'use strict';

    var ADMIN_PASSWORD = 'diamond2024';
    var BOOKING_KEY = 'diamondspa_bookings';
    var SERVICES_KEY = 'diamondspa_services';

    var loginScreen = document.getElementById('loginScreen');
    var adminPanel = document.getElementById('adminPanel');
    var loginForm = document.getElementById('loginForm');
    var loginError = document.getElementById('loginError');
    var logoutBtn = document.getElementById('logoutBtn');

    if (sessionStorage.getItem('diamondspa_admin') === 'true') {
        showAdmin();
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (document.getElementById('loginPassword').value === ADMIN_PASSWORD) {
            sessionStorage.setItem('diamondspa_admin', 'true');
            loginError.style.display = 'none';
            showAdmin();
        } else {
            loginError.style.display = 'block';
            document.getElementById('loginPassword').value = '';
        }
    });

    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('diamondspa_admin');
        adminPanel.style.display = 'none';
        loginScreen.style.display = 'flex';
        document.getElementById('loginPassword').value = '';
        loginError.style.display = 'none';
    });

    function showAdmin() {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'block';
        loadAllData();
    }

    // TABS
    document.querySelectorAll('.admin-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
            document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); c.style.display = 'none'; });
            tab.classList.add('active');
            var target = document.getElementById('tab-' + tab.dataset.tab);
            if (target) { target.classList.add('active'); target.style.display = 'block'; }
        });
    });

    function esc(text) {
        var d = document.createElement('div');
        d.textContent = text || '';
        return d.innerHTML;
    }

    function dRow(label, value) {
        return '<div class="detail-row"><span class="detail-label">' + label + '</span><span class="detail-value">' + value + '</span></div>';
    }

    // ============ DATA STORAGE ============
    var allBookings = [];
    var allServices = [];

    var defaultServices = [
        { id: 'svc_1', name: 'Pedicure & Nail Care', description: 'Luxurious pedicure stations with professional foot care.', price: 'from \u20A65,000', image: 'images/pedicure.png', waText: 'Hi! I\'d like to book a pedicure.' },
        { id: 'svc_2', name: 'Infrared Sauna & Wellness', description: 'Detoxify and rejuvenate with our far-infrared spectrum energy room.', price: 'from \u20A68,000', image: 'images/sauna.png', waText: 'Hi! I\'d like to book a sauna session.' },
        { id: 'svc_3', name: 'Dental & Facial Care', description: 'Professional dental hygiene and facial treatments.', price: 'from \u20A610,000', image: 'images/dental.png', waText: 'Hi! I\'d like to book a dental/facial session.' }
    ];

    // Load all data
    async function loadAllData() {
        await loadBookings();
        await loadServices();
    }

    // ============ BOOKINGS ============
    async function loadBookings() {
        // Try Firestore first
        if (typeof firebaseReady !== 'undefined' && firebaseReady && typeof db !== 'undefined' && db) {
            try {
                var snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();
                allBookings = [];
                snapshot.forEach(function(doc) {
                    allBookings.push(doc.data());
                });
                console.log('Loaded ' + allBookings.length + ' bookings from Firestore');
                renderBookingsTable();
                return;
            } catch (error) {
                console.error('Firestore error, falling back to localStorage:', error);
            }
        }

        // Fallback to localStorage
        try {
            var data = localStorage.getItem(BOOKING_KEY);
            allBookings = data ? JSON.parse(data) : [];
        } catch(e) {
            allBookings = [];
        }
        console.log('Loaded ' + allBookings.length + ' bookings from localStorage');
        renderBookingsTable();
    }

    function renderBookingsTable() {
        var search = document.getElementById('searchInput').value.toLowerCase();
        var statusFilter = document.getElementById('filterStatus').value;

        var filtered = allBookings.filter(function(b) {
            var matchSearch = !search || b.name.toLowerCase().indexOf(search) > -1 || b.phone.indexOf(search) > -1;
            var matchStatus = statusFilter === 'all' || b.status === statusFilter;
            return matchSearch && matchStatus;
        });

        document.getElementById('totalBookings').textContent = allBookings.length;
        document.getElementById('pendingBookings').textContent = allBookings.filter(function(b) { return b.status === 'pending'; }).length;
        document.getElementById('confirmedBookings').textContent = allBookings.filter(function(b) { return b.status === 'confirmed'; }).length;
        document.getElementById('completedBookings').textContent = allBookings.filter(function(b) { return b.status === 'completed'; }).length;

        var tbody = document.getElementById('bookingsTableBody');
        if (!filtered.length) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="8"><div class="empty-state"><span class="empty-icon">&#128197;</span><p>No bookings found.</p></div></td></tr>';
            return;
        }

        var html = '';
        filtered.forEach(function(b) {
            html += '<tr>';
            html += '<td><strong>#' + b.id.slice(-6).toUpperCase() + '</strong></td>';
            html += '<td>' + esc(b.name) + '</td>';
            html += '<td>' + esc(b.phone) + '</td>';
            html += '<td>' + esc(b.service) + '</td>';
            html += '<td>' + esc(b.date) + '</td>';
            html += '<td>' + esc(b.time) + '</td>';
            html += '<td><span class="status-badge status-' + b.status + '">' + b.status + '</span></td>';
            html += '<td><div class="action-btns">';
            html += '<button class="action-btn view" title="View" onclick="AB.viewBooking(\'' + b.id + '\')">&#128065;</button>';
            if (b.status === 'pending') html += '<button class="action-btn confirm" title="Confirm" onclick="AB.updateStatus(\'' + b.id + '\',\'confirmed\')">&#9989;</button>';
            if (b.status === 'confirmed') html += '<button class="action-btn complete" title="Complete" onclick="AB.updateStatus(\'' + b.id + '\',\'completed\')">&#11088;</button>';
            if (b.status !== 'cancelled' && b.status !== 'completed') html += '<button class="action-btn cancel" title="Cancel" onclick="AB.updateStatus(\'' + b.id + '\',\'cancelled\')">&#10060;</button>';
            html += '<button class="action-btn delete" title="Delete" onclick="AB.deleteBooking(\'' + b.id + '\')">&#128465;</button>';
            html += '</div></td></tr>';
        });
        tbody.innerHTML = html;
    }

    async function saveBookingToStorage(booking) {
        if (typeof firebaseReady !== 'undefined' && firebaseReady && typeof db !== 'undefined' && db) {
            try {
                await db.collection('bookings').doc(booking.id).set(booking);
                return true;
            } catch (error) {
                console.error('Firestore save error:', error);
            }
        }
        // Fallback
        allBookings.push(booking);
        localStorage.setItem(BOOKING_KEY, JSON.stringify(allBookings));
        return true;
    }

    async function updateBookingInStorage(id, updates) {
        if (typeof firebaseReady !== 'undefined' && firebaseReady && typeof db !== 'undefined' && db) {
            try {
                await db.collection('bookings').doc(id).update(updates);
            } catch (error) {
                console.error('Firestore update error:', error);
            }
        }
        var b = allBookings.find(function(x) { return x.id === id; });
        if (b) { Object.assign(b, updates); }
        localStorage.setItem(BOOKING_KEY, JSON.stringify(allBookings));
    }

    async function deleteBookingFromStorage(id) {
        if (typeof firebaseReady !== 'undefined' && firebaseReady && typeof db !== 'undefined' && db) {
            try {
                await db.collection('bookings').doc(id).delete();
            } catch (error) {
                console.error('Firestore delete error:', error);
            }
        }
        allBookings = allBookings.filter(function(b) { return b.id !== id; });
        localStorage.setItem(BOOKING_KEY, JSON.stringify(allBookings));
    }

    window.AB = {};
    AB.updateStatus = async function(id, status) {
        await updateBookingInStorage(id, { status: status, updatedAt: new Date().toISOString() });
        renderBookingsTable();
    };

    AB.deleteBooking = function(id) {
        showConfirm('Delete Booking', 'Permanently delete this booking?', async function() {
            await deleteBookingFromStorage(id);
            renderBookingsTable();
        });
    };

    AB.viewBooking = function(id) {
        var b = allBookings.find(function(x) { return x.id === id; });
        if (!b) return;
        var content = document.getElementById('detailContent');
        content.innerHTML =
            dRow('Booking ID', '#' + b.id.slice(-6).toUpperCase()) +
            dRow('Customer', esc(b.name)) +
            dRow('Phone', esc(b.phone)) +
            dRow('Service', esc(b.service)) +
            dRow('Date', esc(b.date)) +
            dRow('Time', esc(b.time)) +
            dRow('Notes', b.notes ? esc(b.notes) : 'None') +
            dRow('Status', '<span class="status-badge status-' + b.status + '">' + b.status + '</span>') +
            dRow('Booked On', new Date(b.createdAt).toLocaleString());

        var actions = document.getElementById('detailActions');
        var waMsg = encodeURIComponent('Hi ' + b.name + ', this is Diamond Spa. We confirm your ' + b.service + ' appointment on ' + b.date + ' at ' + b.time + '. See you soon!');
        var customerPhone = b.phone.replace(/\s+/g, '').replace(/^0/, '234');
        actions.innerHTML = '<button class="btn btn-outline-sm" onclick="closeModal(\'detailModal\')">Close</button>' +
            '<a href="https://wa.me/' + customerPhone + '?text=' + waMsg + '" class="btn btn-gold" target="_blank">WhatsApp Confirm to Customer</a>';
        openModal('detailModal');
    };

    // Filters
    document.getElementById('searchInput').addEventListener('input', renderBookingsTable);
    document.getElementById('filterStatus').addEventListener('change', renderBookingsTable);
    document.getElementById('clearFilters').addEventListener('click', function() {
        document.getElementById('searchInput').value = '';
        document.getElementById('filterStatus').value = 'all';
        renderBookingsTable();
    });

    // Export CSV
    document.getElementById('exportCsv').addEventListener('click', function() {
        if (!allBookings.length) { alert('No bookings to export.'); return; }
        var csv = 'ID,Name,Phone,Service,Date,Time,Notes,Status,Booked On\n';
        allBookings.forEach(function(b) {
            csv += '"' + b.id + '","' + b.name + '","' + b.phone + '","' + b.service + '","' + b.date + '","' + b.time + '","' + (b.notes || '') + '","' + b.status + '","' + new Date(b.createdAt).toLocaleString() + '"\n';
        });
        var blob = new Blob([csv], { type: 'text/csv' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'diamond_spa_bookings_' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
    });

    document.getElementById('clearAllBtn').addEventListener('click', function() {
        showConfirm('Clear All Bookings', 'Delete ALL bookings permanently?', async function() {
            if (typeof firebaseReady !== 'undefined' && firebaseReady && typeof db !== 'undefined' && db) {
                try {
                    var snapshot = await db.collection('bookings').get();
                    var batch = db.batch();
                    snapshot.forEach(function(doc) { batch.delete(doc.ref); });
                    await batch.commit();
                } catch (error) {
                    console.error('Firestore clear error:', error);
                }
            }
            allBookings = [];
            localStorage.removeItem(BOOKING_KEY);
            renderBookingsTable();
        });
    });

    // ============ SERVICES ============
    async function loadServices() {
        if (typeof firebaseReady !== 'undefined' && firebaseReady && typeof db !== 'undefined' && db) {
            try {
                var snapshot = await db.collection('services').get();
                if (!snapshot.empty) {
                    allServices = [];
                    snapshot.forEach(function(doc) { allServices.push(doc.data()); });
                    console.log('Loaded ' + allServices.length + ' services from Firestore');
                    renderServicesGrid();
                    return;
                } else {
                    // Initialize defaults in Firestore
                    allServices = defaultServices.slice();
                    for (var i = 0; i < allServices.length; i++) {
                        await db.collection('services').doc(allServices[i].id).set(allServices[i]);
                    }
                    renderServicesGrid();
                    return;
                }
            } catch (error) {
                console.error('Firestore services error:', error);
            }
        }

        // Fallback
        try {
            var data = localStorage.getItem(SERVICES_KEY);
            allServices = data ? JSON.parse(data) : defaultServices.slice();
        } catch(e) {
            allServices = defaultServices.slice();
        }
        renderServicesGrid();
    }

    function renderServicesGrid() {
        var grid = document.getElementById('servicesGrid');
        if (!allServices.length) {
            grid.innerHTML = '<div class="empty-state"><span class="empty-icon">&#128196;</span><p>No services yet.</p></div>';
            return;
        }

        var html = '';
        allServices.forEach(function(s) {
            html += '<div class="service-admin-card">';
            html += '<div class="service-admin-img">';
            html += s.image ? '<img src="' + s.image + '" alt="' + esc(s.name) + '">' : '<div class="no-image">&#10024;</div>';
            html += '</div>';
            html += '<div class="service-admin-body">';
            html += '<h3>' + esc(s.name) + '</h3>';
            html += '<p>' + esc(s.description) + '</p>';
            html += '<div class="service-admin-price">' + esc(s.price) + '</div>';
            html += '<div class="service-admin-actions">';
            html += '<button class="btn btn-outline-sm" onclick="AB.editService(\'' + s.id + '\')">&#9998; Edit</button>';
            html += '<button class="btn btn-outline-sm danger" onclick="AB.deleteService(\'' + s.id + '\')">&#128465; Remove</button>';
            html += '</div></div></div>';
        });
        grid.innerHTML = html;
    }

    AB.editService = function(id) {
        var service = allServices.find(function(s) { return s.id === id; });
        if (!service) return;
        document.getElementById('serviceModalTitle').textContent = 'Edit Service';
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceName').value = service.name;
        document.getElementById('serviceDesc').value = service.description;
        document.getElementById('servicePrice').value = service.price;
        document.getElementById('serviceWa').value = service.waText || '';
        document.getElementById('serviceImageUrl').value = service.image && !service.image.startsWith('data:') ? service.image : '';

        var img = document.getElementById('imagePreview');
        var ph = document.getElementById('uploadPlaceholder');
        if (service.image) {
            img.src = service.image;
            img.style.display = 'block';
            ph.style.display = 'none';
        } else {
            img.style.display = 'none';
            ph.style.display = 'block';
        }
        openModal('serviceModal');
    };

    AB.deleteService = function(id) {
        showConfirm('Remove Service', 'Permanently remove this service?', async function() {
            if (typeof firebaseReady !== 'undefined' && firebaseReady && typeof db !== 'undefined' && db) {
                try { await db.collection('services').doc(id).delete(); } catch(e) {}
            }
            allServices = allServices.filter(function(s) { return s.id !== id; });
            localStorage.setItem(SERVICES_KEY, JSON.stringify(allServices));
            renderServicesGrid();
        });
    };

    // Service form
    var serviceForm = document.getElementById('serviceForm');
    var imagePreview = document.getElementById('imagePreview');
    var uploadPlaceholder = document.getElementById('uploadPlaceholder');
    var currentImageData = null;

    document.getElementById('addServiceBtn').addEventListener('click', function() {
        document.getElementById('serviceModalTitle').textContent = 'Add New Service';
        document.getElementById('serviceId').value = '';
        serviceForm.reset();
        imagePreview.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
        currentImageData = null;
        openModal('serviceModal');
    });

    document.getElementById('serviceImage').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file || file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB.'); return; }
        var reader = new FileReader();
        reader.onload = function(ev) {
            currentImageData = ev.target.result;
            imagePreview.src = currentImageData;
            imagePreview.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
            document.getElementById('serviceImageUrl').value = '';
        };
        reader.readAsDataURL(file);
    });

    serviceForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        var id = document.getElementById('serviceId').value;
        var name = document.getElementById('serviceName').value.trim();
        var desc = document.getElementById('serviceDesc').value.trim();
        var price = document.getElementById('servicePrice').value.trim();
        var wa = document.getElementById('serviceWa').value.trim();
        var imageUrl = document.getElementById('serviceImageUrl').value.trim();

        if (!name || !desc || !price) { alert('Please fill in all required fields.'); return; }

        var serviceData = {
            id: id || 'svc_' + Date.now(),
            name: name,
            description: desc,
            price: price,
            image: currentImageData || imageUrl || '',
            waText: wa
        };

        // Save to Firestore
        if (typeof firebaseReady !== 'undefined' && firebaseReady && typeof db !== 'undefined' && db) {
            try { await db.collection('services').doc(serviceData.id).set(serviceData); } catch(e) {}
        }

        // Update local
        if (id) {
            var idx = allServices.findIndex(function(s) { return s.id === id; });
            if (idx !== -1) allServices[idx] = serviceData;
        } else {
            allServices.push(serviceData);
        }
        localStorage.setItem(SERVICES_KEY, JSON.stringify(allServices));

        renderServicesGrid();
        closeModal('serviceModal');
        serviceForm.reset();
        imagePreview.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
        currentImageData = null;
    });

    document.getElementById('serviceCancel').addEventListener('click', function() { closeModal('serviceModal'); });
    document.getElementById('serviceModalClose').addEventListener('click', function() { closeModal('serviceModal'); });

    // ============ MODALS ============
    var confirmCallback = null;

    function showConfirm(title, message, callback) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        confirmCallback = callback;
        openModal('confirmModal');
    }

    document.getElementById('modalCancel').addEventListener('click', function() { closeModal('confirmModal'); confirmCallback = null; });
    document.getElementById('modalConfirm').addEventListener('click', function() { if (confirmCallback) confirmCallback(); closeModal('confirmModal'); confirmCallback = null; });
    document.getElementById('detailClose').addEventListener('click', function() { closeModal('detailModal'); });

    function openModal(id) { document.getElementById(id).classList.add('active'); }
    function closeModal(id) { document.getElementById(id).classList.remove('active'); }
    window.closeModal = closeModal;

    document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.classList.remove('active'); });
    });

})();
