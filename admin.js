// ADMIN PANEL - Diamond Spa
(function() {
    'use strict';

    var ADMIN_PASSWORD = 'diamond2024';
    var STORAGE_KEY = 'diamondspa_bookings';

    var loginScreen = document.getElementById('loginScreen');
    var adminPanel = document.getElementById('adminPanel');
    var loginForm = document.getElementById('loginForm');
    var loginError = document.getElementById('loginError');
    var logoutBtn = document.getElementById('logoutBtn');
    var searchInput = document.getElementById('searchInput');
    var filterStatus = document.getElementById('filterStatus');
    var filterService = document.getElementById('filterService');
    var clearFilters = document.getElementById('clearFilters');
    var bookingsTableBody = document.getElementById('bookingsTableBody');
    var exportCsv = document.getElementById('exportCsv');
    var clearAllBtn = document.getElementById('clearAllBtn');

    // Check if already logged in
    if (sessionStorage.getItem('diamondspa_admin') === 'true') {
        showAdmin();
    }

    // LOGIN
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var password = document.getElementById('loginPassword').value;
        if (password === ADMIN_PASSWORD) {
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
        renderBookings();
    }

    // GET BOOKINGS
    function getBookings() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch(e) {
            return [];
        }
    }

    // SAVE BOOKINGS
    function saveBookings(bookings) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    }

    // RENDER
    function renderBookings() {
        var bookings = getBookings();
        var search = searchInput.value.toLowerCase();
        var statusFilter = filterStatus.value;
        var serviceFilter = filterService.value;

        var filtered = bookings.filter(function(b) {
            var matchSearch = !search ||
                b.name.toLowerCase().indexOf(search) > -1 ||
                b.phone.indexOf(search) > -1;
            var matchStatus = statusFilter === 'all' || b.status === statusFilter;
            var matchService = serviceFilter === 'all' || b.service === serviceFilter;
            return matchSearch && matchStatus && matchService;
        });

        // Sort by date descending (newest first)
        filtered.sort(function(a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        updateStats(bookings);
        renderTable(filtered);
    }

    // STATS
    function updateStats(bookings) {
        document.getElementById('totalBookings').textContent = bookings.length;
        document.getElementById('pendingBookings').textContent = bookings.filter(function(b) { return b.status === 'pending'; }).length;
        document.getElementById('confirmedBookings').textContent = bookings.filter(function(b) { return b.status === 'confirmed'; }).length;
        document.getElementById('completedBookings').textContent = bookings.filter(function(b) { return b.status === 'completed'; }).length;
    }

    // RENDER TABLE
    function renderTable(bookings) {
        if (bookings.length === 0) {
            bookingsTableBody.innerHTML = '<tr class="empty-row"><td colspan="9"><div class="empty-state"><span class="empty-icon">&#128197;</span><p>No bookings found.</p></div></td></tr>';
            return;
        }

        var html = '';
        bookings.forEach(function(b) {
            html += '<tr data-id="' + b.id + '">';
            html += '<td><strong>#' + b.id.slice(-6).toUpperCase() + '</strong></td>';
            html += '<td>' + escapeHtml(b.name) + '</td>';
            html += '<td>' + escapeHtml(b.phone) + '</td>';
            html += '<td>' + escapeHtml(b.service) + '</td>';
            html += '<td>' + escapeHtml(b.date) + '</td>';
            html += '<td>' + escapeHtml(b.time) + '</td>';
            html += '<td>' + (b.notes ? escapeHtml(b.notes.substring(0, 30)) + (b.notes.length > 30 ? '...' : '') : '-') + '</td>';
            html += '<td><span class="status-badge status-' + b.status + '">' + b.status + '</span></td>';
            html += '<td><div class="action-btns">';
            html += '<button class="action-btn view" title="View Details" onclick="viewBooking(\'' + b.id + '\')">&#128065;</button>';
            if (b.status === 'pending') {
                html += '<button class="action-btn confirm" title="Confirm" onclick="updateStatus(\'' + b.id + '\', \'confirmed\')">&#9989;</button>';
            }
            if (b.status === 'confirmed') {
                html += '<button class="action-btn complete" title="Complete" onclick="updateStatus(\'' + b.id + '\', \'completed\')">&#11088;</button>';
            }
            if (b.status !== 'cancelled' && b.status !== 'completed') {
                html += '<button class="action-btn cancel" title="Cancel" onclick="updateStatus(\'' + b.id + '\', \'cancelled\')">&#10060;</button>';
            }
            html += '<button class="action-btn delete" title="Delete" onclick="deleteBooking(\'' + b.id + '\')">&#128465;</button>';
            html += '</div></td>';
            html += '</tr>';
        });
        bookingsTableBody.innerHTML = html;
    }

    // ESCAPE HTML
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // UPDATE STATUS
    window.updateStatus = function(id, status) {
        var bookings = getBookings();
        var booking = bookings.find(function(b) { return b.id === id; });
        if (booking) {
            booking.status = status;
            booking.updatedAt = new Date().toISOString();
            saveBookings(bookings);
            renderBookings();
        }
    };

    // DELETE BOOKING
    window.deleteBooking = function(id) {
        showConfirmModal('Delete Booking', 'Are you sure you want to permanently delete this booking?', function() {
            var bookings = getBookings();
            bookings = bookings.filter(function(b) { return b.id !== id; });
            saveBookings(bookings);
            renderBookings();
        });
    };

    // VIEW BOOKING
    window.viewBooking = function(id) {
        var bookings = getBookings();
        var b = bookings.find(function(book) { return book.id === id; });
        if (!b) return;

        var content = document.getElementById('detailContent');
        content.innerHTML =
            '<div class="detail-row"><span class="detail-label">Booking ID</span><span class="detail-value">#' + b.id.slice(-6).toUpperCase() + '</span></div>' +
            '<div class="detail-row"><span class="detail-label">Customer</span><span class="detail-value">' + escapeHtml(b.name) + '</span></div>' +
            '<div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">' + escapeHtml(b.phone) + '</span></div>' +
            '<div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">' + escapeHtml(b.service) + '</span></div>' +
            '<div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">' + escapeHtml(b.date) + '</span></div>' +
            '<div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">' + escapeHtml(b.time) + '</span></div>' +
            '<div class="detail-row"><span class="detail-label">Notes</span><span class="detail-value">' + (b.notes ? escapeHtml(b.notes) : 'None') + '</span></div>' +
            '<div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="status-badge status-' + b.status + '">' + b.status + '</span></span></div>' +
            '<div class="detail-row"><span class="detail-label">Booked On</span><span class="detail-value">' + new Date(b.createdAt).toLocaleString() + '</span></div>';

        var actions = document.getElementById('detailActions');
        var actionsHtml = '<button class="btn btn-outline-sm" id="detailCloseBtn">Close</button>';
        actionsHtml += '<a href="https://wa.me/2349066686805?text=' + encodeURIComponent('Hi ' + b.name + ', this is Diamond Spa. We confirm your ' + b.service + ' appointment on ' + b.date + ' at ' + b.time + '. See you soon!') + '" class="btn btn-orange" target="_blank">Send WhatsApp Confirmation</a>';
        if (b.status === 'pending') {
            actionsHtml += '<button class="btn btn-orange" onclick="updateStatus(\'' + b.id + '\', \'confirmed\'); closeModal(\'detailModal\');">Confirm Booking</button>';
        }
        actions.innerHTML = actionsHtml;

        document.getElementById('detailCloseBtn').addEventListener('click', function() {
            closeModal('detailModal');
        });

        openModal('detailModal');
    };

    // CONFIRM MODAL
    var confirmCallback = null;

    function showConfirmModal(title, message, callback) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        confirmCallback = callback;
        openModal('confirmModal');
    }

    document.getElementById('modalCancel').addEventListener('click', function() {
        closeModal('confirmModal');
        confirmCallback = null;
    });

    document.getElementById('modalConfirm').addEventListener('click', function() {
        if (confirmCallback) confirmCallback();
        closeModal('confirmModal');
        confirmCallback = null;
    });

    // MODAL HELPERS
    function openModal(id) {
        document.getElementById(id).classList.add('active');
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove('active');
    }

    window.closeModal = closeModal;

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // FILTERS
    searchInput.addEventListener('input', renderBookings);
    filterStatus.addEventListener('change', renderBookings);
    filterService.addEventListener('change', renderBookings);

    clearFilters.addEventListener('click', function() {
        searchInput.value = '';
        filterStatus.value = 'all';
        filterService.value = 'all';
        renderBookings();
    });

    // EXPORT CSV
    exportCsv.addEventListener('click', function() {
        var bookings = getBookings();
        if (bookings.length === 0) {
            alert('No bookings to export.');
            return;
        }

        var csv = 'ID,Name,Phone,Service,Date,Time,Notes,Status,Booked On\n';
        bookings.forEach(function(b) {
            csv += '"' + b.id + '","' + b.name + '","' + b.phone + '","' + b.service + '","' + b.date + '","' + b.time + '","' + (b.notes || '') + '","' + b.status + '","' + new Date(b.createdAt).toLocaleString() + '"\n';
        });

        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'diamond_spa_bookings_' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    // CLEAR ALL
    clearAllBtn.addEventListener('click', function() {
        showConfirmModal('Clear All Bookings', 'This will permanently delete ALL bookings. Are you sure?', function() {
            saveBookings([]);
            renderBookings();
        });
    });

})();
