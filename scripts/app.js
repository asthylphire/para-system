// STATE
let originData = null;
let destData = null;
let pendingLandmarkPos = null;
let currentViewLandmarkId = null;
const searchTimers = {};

// NOTIFICATIONS
function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'notification ' + type;
    div.textContent = message;
    container.appendChild(div);
    setTimeout(() => {
        div.classList.add('hiding');
        setTimeout(() => div.remove(), 350);
    }, 3500);
}

// DARK MODE
function applyDarkMode() {
    const isDark = localStorage.getItem('para_dark') === 'true';
    document.body.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('dark', isDark);
    syncToggleKnob(isDark);
}

function setupDarkToggle() {
    const btn = document.getElementById('dark-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
        const isDark = document.body.classList.toggle('dark');
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('para_dark', String(isDark));
        syncToggleKnob(isDark);
        this.setAttribute('aria-pressed', String(isDark));
    });
}

function syncToggleKnob(isDark) {
    const knob = document.querySelector('#dark-toggle .toggle-knob');
    if (!knob) return;
    knob.classList.toggle('is-dark', isDark);
    const icon = knob.querySelector('img');
    if (icon) {
        icon.src = isDark
            ? '../assets/dark-icon.png'
            : '../assets/light-icon.png';
    }
}

// SIDEBAR
function setupSidebar() {
    const openBtn = document.getElementById('hamburger-btn');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('sidebar-close');
    openBtn?.addEventListener('click', () => overlay?.classList.add('active'));
    closeBtn?.addEventListener('click', () => overlay?.classList.remove('active'));
    overlay?.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
}

// SCROLL ANIMATIONS
function setupScrollAnimations() {
    const observer = new IntersectionObserver(
        entries => entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        }),
        { threshold: 0.15 }
    );
    document.querySelectorAll('.anim-on-scroll').forEach(el => observer.observe(el));
}

// BACK TO TOP
function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('active', window.scrollY > 400);
    });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// AUTH NAV
function updateNavAuth() {
    const user = Auth.getCurrentUser();
    const areas = [
        { el: document.getElementById('nav-auth-area'), kind: 'nav' },
        { el: document.getElementById('sidebar-auth-area'), kind: 'sidebar' }
    ].filter(x => x.el);
    if (!areas.length) return;
    for (const { el, kind } of areas) {
        el.innerHTML = '';
        if (user) {
            const btn = document.createElement('button');
            btn.className = kind === 'sidebar' ? 'sidebar-auth-btn' : 'nav-auth-btn';
            btn.type = 'button';
            btn.textContent = 'Log Out';
            btn.addEventListener('click', doLogout);
            el.appendChild(btn);
        } else {
            const a = document.createElement('a');
            a.href = 'auth.html';
            a.className = kind === 'sidebar' ? 'sidebar-auth-btn' : 'nav-auth-btn';
            a.textContent = 'Log In';
            el.appendChild(a);
        }
    }
}

function doLogout() {
    Auth.logout();
    showNotification('Logged out. See you soon!', 'info');
    updateNavAuth();
    if (typeof renderSavedLandmarks === 'function') renderSavedLandmarks();
    if (typeof renderLandmarksList === 'function') renderLandmarksList();
}

// MODAL HELPERS
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

function setupModalOverlayClose() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });
}

function setupEscKey() {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.open')
                    .forEach(m => closeModal(m.id));
        }
    });
}

// LOCATION SEARCH
function setupSearchInput(inputId, dropdownId, onSelect) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;
    input.addEventListener('input', function () {
        const query = this.value.trim();
        clearTimeout(searchTimers[inputId]);
        if (query.length < 2) {
            dropdown.classList.remove('open');
            dropdown.innerHTML = '';
            return;
        }
        searchTimers[inputId] = setTimeout(async () => {
            dropdown.innerHTML = '<div class="search-dropdown-item loading">Searching...</div>';
            dropdown.classList.add('open');
            const results = await searchLocations(query);
            if (!results.length) {
                dropdown.innerHTML = '<div class="search-dropdown-item">No results found</div>';
                return;
            }
            dropdown.innerHTML = results.map(r =>
                '<div class="search-dropdown-item"' +
                ' data-lat="' + r.lat + '"' +
                ' data-lng="' + r.lng + '"' +
                ' data-name="' + r.name.replace(/"/g, '&quot;') + '">' +
                '<i class="fi fi-rr-marker item-icon" aria-hidden="true"></i>' +
                '<span>' + r.name + '</span>' +
                '</div>'
            ).join('');
            dropdown.querySelectorAll('.search-dropdown-item').forEach(item => {
                item.addEventListener('click', function () {
                    const loc = {
                        name: this.dataset.name,
                        lat: parseFloat(this.dataset.lat),
                        lng: parseFloat(this.dataset.lng)
                    };
                    input.value = loc.name;
                    dropdown.classList.remove('open');
                    dropdown.innerHTML = '';
                    onSelect(loc);
                });
            });
        }, 420);
    });
    document.addEventListener('click', e => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

// CALCULATE PAGE
function setupCalcListeners() {
    setupSearchInput('origin-input', 'origin-dropdown', loc => {
        originData = loc;
        setOriginMarker(loc.lat, loc.lng, loc.name.split(',')[0]);
        tryCalculateFare();
    });
    setupSearchInput('dest-input', 'dest-dropdown', loc => {
        destData = loc;
        setDestinationMarker(loc.lat, loc.lng, loc.name.split(',')[0]);
        tryCalculateFare();
    });
    document.getElementById('swap-btn')?.addEventListener('click', () => {
        [originData, destData] = [destData, originData];
        const oInput = document.getElementById('origin-input');
        const dInput = document.getElementById('dest-input');
        [oInput.value, dInput.value] = [dInput.value, oInput.value];
        if (originData) setOriginMarker(originData.lat, originData.lng, originData.name.split(',')[0]);
        if (destData) setDestinationMarker(destData.lat, destData.lng, destData.name.split(',')[0]);
        tryCalculateFare();
    });
    document.getElementById('transport-select')?.addEventListener('change', tryCalculateFare);
    document.getElementById('passenger-select')?.addEventListener('change', tryCalculateFare);
    const landmarksBtn = document.getElementById('landmarks-toggle-btn');
    const landmarksPanel = document.getElementById('landmarks-panel');
    landmarksBtn?.addEventListener('click', function () {
        const isOpen = landmarksPanel.classList.toggle('open');
        this.setAttribute('aria-expanded', isOpen);
        if (isOpen) {
            renderLandmarksList();
            document.getElementById('landmarks-search')?.focus();
        }
    });
    document.getElementById('landmarks-search')?.addEventListener('input', function () {
        renderLandmarksList(this.value.trim().toLowerCase());
    });
    document.addEventListener('click', e => {
        const panel = document.getElementById('landmarks-panel');
        const btn = document.getElementById('landmarks-toggle-btn');
        if (panel && btn && !panel.contains(e.target) && !btn.contains(e.target)) {
            panel.classList.remove('open');
        }
    });
}

// FARE CALCULATION
async function tryCalculateFare() {
    const transport = document.getElementById('transport-select')?.value;
    const passenger = document.getElementById('passenger-select')?.value;
    const hintEl = document.getElementById('para-hint-text');
    const resultCard = document.getElementById('result-card');
    const paraHint = document.getElementById('para-hint');
    if (!originData || !destData) {
        if (hintEl) hintEl.innerHTML = '<strong>Select an origin and destination to see the fare!</strong>';
        resultCard?.classList.remove('active');
        if (paraHint) paraHint.style.display = 'flex';
        return;
    }
    if (!transport || !passenger) {
        if (hintEl) hintEl.innerHTML = '<strong>Now choose a transport type and passenger type!</strong>';
        resultCard?.classList.remove('active');
        if (paraHint) paraHint.style.display = 'flex';
        return;
    }
    if (hintEl) hintEl.textContent = 'Calculating your fare...';
    const distKm = haversineDistance(
        originData.lat, originData.lng,
        destData.lat, destData.lng
    );
    if (distKm > 8) {
        showNotification('Far destination! A Tricycle Special Trip may be needed.', 'warning');
    }
    const result = await calculateFare(distKm, transport, passenger);
    if (!result) {
        if (hintEl) hintEl.textContent = 'Could not load fare data. Check your connection.';
        return;
    }
    document.getElementById('res-origin').textContent = originData.name.split(',')[0];
    document.getElementById('res-dest').textContent = destData.name.split(',')[0];
    document.getElementById('res-distance').textContent = result.distance + ' km';
    document.getElementById('res-base').textContent = '₱' + result.baseFare;
    document.getElementById('res-excess').textContent = '₱' + result.excessFare;
    document.getElementById('res-ptype').textContent = result.passengerType;
    document.getElementById('res-discount').textContent = result.discountRate > 0
        ? '-₱' + result.discountAmount + ' (' + result.discountRate + '% off)'
        : 'None';
    document.getElementById('res-total').textContent = '₱' + result.total;
    resultCard?.classList.add('active');
    if (paraHint) paraHint.style.display = 'none';
}

// LANDMARKS LIST
function renderLandmarksList(filter = '') {
    const listEl = document.getElementById('landmarks-list');
    if (!listEl) return;
    if (!Auth.isLoggedIn()) {
        listEl.innerHTML = '<div class="lm-empty">Please <a href="auth.html">log in</a> to save landmarks.</div>';
        return;
    }
    const landmarks = DataManager.getLandmarks();
    const filtered = filter
        ? landmarks.filter(lm =>
            lm.name.toLowerCase().includes(filter) ||
            lm.category.toLowerCase().includes(filter))
        : landmarks;
    if (!filtered.length) {
        listEl.innerHTML = '<div class="lm-empty">No landmarks yet.<br>Right-click the map to add one!</div>';
        return;
    }
    listEl.innerHTML = filtered.map(lm =>
        '<div class="landmark-list-item" onclick="onLandmarkListClick(\'' + lm.id + '\')">' +
        '<i class="fi fi-rr-marker lm-icon" aria-hidden="true"></i>' +
        '<div class="lm-info">' +
        '<h5>' + lm.name + '</h5>' +
        '<span>' + lm.category + '</span>' +
        '</div>' +
        '</div>'
    ).join('');
}

function onLandmarkListClick(id) {
    const lm = DataManager.getLandmark(id);
    if (!lm) return;
    panToLandmark(lm);
    document.getElementById('landmarks-panel')?.classList.remove('open');
    openViewLandmarkModal(id);
}

// ADD LANDMARK
function openAddLandmarkModal(lat, lng) {
    pendingLandmarkPos = { lat, lng };
    document.getElementById('lm-name').value = '';
    document.getElementById('lm-category').value = 'other';
    document.getElementById('lm-desc').value = '';
    openModal('add-landmark-modal');
}

function submitAddLandmark() {
    const name = document.getElementById('lm-name')?.value.trim();
    const category = document.getElementById('lm-category')?.value;
    const desc = document.getElementById('lm-desc')?.value.trim();
    if (!name) {
        showNotification('Please enter a landmark name.', 'warning');
        return;
    }
    if (!pendingLandmarkPos) return;
    const lm = DataManager.addLandmark(name, category, desc, pendingLandmarkPos.lat, pendingLandmarkPos.lng);
    addLandmarkMarker(lm);
    renderLandmarksList();
    closeModal('add-landmark-modal');
    showNotification('"' + name + '" added to your landmarks!', 'success');
    pendingLandmarkPos = null;
}

// VIEW LANDMARK
function openViewLandmarkModal(id) {
    const lm = DataManager.getLandmark(id);
    if (!lm) return;
    currentViewLandmarkId = id;
    document.getElementById('view-lm-name').textContent = lm.name;
    document.getElementById('view-lm-category').textContent =
        lm.category.charAt(0).toUpperCase() + lm.category.slice(1);
    document.getElementById('view-lm-desc').textContent = lm.description || '—';
    openModal('view-landmark-modal');
}

function deleteLandmarkConfirm() {
    if (!currentViewLandmarkId) return;
    const lm = DataManager.getLandmark(currentViewLandmarkId);
    const name = lm ? lm.name : 'this landmark';
    if (typeof landmarkMarkers !== 'undefined' && landmarkMarkers[currentViewLandmarkId]) {
        map.removeLayer(landmarkMarkers[currentViewLandmarkId]);
        delete landmarkMarkers[currentViewLandmarkId];
    }
    DataManager.deleteLandmark(currentViewLandmarkId);
    renderLandmarksList();
    closeModal('view-landmark-modal');
    showNotification('"' + name + '" deleted.', 'info');
    currentViewLandmarkId = null;
}

// EDIT LANDMARK
function openEditLandmark() {
    if (!currentViewLandmarkId) return;
    const lm = DataManager.getLandmark(currentViewLandmarkId);
    if (!lm) return;
    document.getElementById('edit-lm-id').value = lm.id;
    document.getElementById('edit-lm-name').value = lm.name;
    document.getElementById('edit-lm-category').value = lm.category;
    document.getElementById('edit-lm-desc').value = lm.description || '';
    closeModal('view-landmark-modal');
    openModal('edit-landmark-modal');
}

function submitEditLandmark() {
    const id = document.getElementById('edit-lm-id')?.value;
    const name = document.getElementById('edit-lm-name')?.value.trim();
    const category = document.getElementById('edit-lm-category')?.value;
    const desc = document.getElementById('edit-lm-desc')?.value.trim();
    if (!name) {
        showNotification('Please enter a landmark name.', 'warning');
        return;
    }
    DataManager.updateLandmark(id, name, category, desc);
    if (typeof landmarkMarkers !== 'undefined' && landmarkMarkers[id]) {
        map.removeLayer(landmarkMarkers[id]);
        delete landmarkMarkers[id];
    }
    const updated = DataManager.getLandmark(id);
    if (updated) addLandmarkMarker(updated);
    renderLandmarksList();
    closeModal('edit-landmark-modal');
    showNotification('"' + name + '" updated!', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    applyDarkMode();
    setupDarkToggle();
    setupSidebar();
    setupScrollAnimations();
    setupBackToTop();
    setupModalOverlayClose();
    setupEscKey();
    updateNavAuth();
    if (document.getElementById('origin-input')) {
        setupCalcListeners();
        initMap();
        renderSavedLandmarks();
    }
});