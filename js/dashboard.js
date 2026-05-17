let session = null;

// ── BOOT ──
window.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('lyb_session');
  if (!raw) { window.location.href = 'login.html'; return; }
  session = JSON.parse(raw);
  renderAll();
});

function renderAll() {
  // Nav
  document.getElementById('nav-username').textContent = 'Hi, ' + session.first + '!';
  // Welcome
  document.getElementById('welcome-title').textContent = 'Welcome back, ' + session.first + '!';
  // Stats
  const bookings = session.bookings || [];
  const upcoming = bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled');
  const completed = bookings.filter(b => b.status === 'Completed');
  document.getElementById('stat-total').textContent = bookings.length;
  document.getElementById('stat-upcoming').textContent = upcoming.length;
  document.getElementById('stat-completed').textContent = completed.length;
  // Overview upcoming
  renderBookingList('overview-upcoming-list', upcoming.slice(0, 3), true);
  // All bookings
  renderBookingList('all-bookings-list', bookings, false);
  // Profile
  document.getElementById('profile-avatar').textContent = session.first[0].toUpperCase();
  document.getElementById('profile-name-display').textContent = session.first + ' ' + session.last;
  document.getElementById('profile-joined').textContent = 'Member since ' + session.joined;
  document.getElementById('p-first').value = session.first;
  document.getElementById('p-last').value = session.last;
  document.getElementById('p-email').value = session.email;
  document.getElementById('p-phone').value = session.phone;
}

// ── RENDER BOOKING LIST ──
const svcIcons = {
  'Standard clean': 'ti-home', 'Deep clean': 'ti-search',
  'Weekly / bi-weekly': 'ti-refresh', 'Move-in / move-out': 'ti-package',
  'One-time clean': 'ti-calendar-event', 'Apartment clean': 'ti-building',
  'Appliances clean': 'ti-device-floppy'
};
const statusClass = { 'Pending': 'status-pending', 'Confirmed': 'status-confirmed', 'Completed': 'status-completed', 'Cancelled': 'status-cancelled' };

function renderBookingList(containerId, bookings, compact) {
  const container = document.getElementById(containerId);
  if (!bookings.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon"><i class="ti ti-calendar-off"></i></div>
      <div class="empty-title">${compact ? 'No upcoming appointments' : 'No bookings yet'}</div>
      <div class="empty-sub">Ready to book your first clean?</div>
      <a href="#" class="btn-book" onclick="showPanel('new-booking'); return false;">✨ Book a cleaning</a>
    </div>`;
    return;
  }
  container.innerHTML = bookings.map((b, idx) => `
    <div class="booking-card" id="bcard-${b.id}">
      <div class="booking-icon"><i class="ti ${svcIcons[b.service] || 'ti-home'}"></i></div>
      <div class="booking-info">
        <div class="booking-service">${b.service}</div>
        <div class="booking-date"><i class="ti ti-calendar" style="font-size:12px;"></i> ${b.date} at ${b.time}</div>
        <div class="booking-addr"><i class="ti ti-map-pin" style="font-size:11px;"></i> ${b.address}</div>
      </div>
      <span class="booking-status ${statusClass[b.status] || 'status-pending'}">${b.status}</span>
      ${b.status !== 'Completed' && b.status !== 'Cancelled'
        ? `<button class="booking-cancel" onclick="cancelBooking('${b.id}')">Cancel</button>`
        : ''}
    </div>`).join('');
}

// ── SUBMIT BOOKING ──
async function submitBooking() {
  const service = document.getElementById('b-service').value;
  const date    = document.getElementById('b-date').value;
  const time    = document.getElementById('b-time').value;
  const address = document.getElementById('b-address').value.trim();
  const size    = document.getElementById('b-size').value;
  const notes   = document.getElementById('b-notes').value.trim();

  if (!service || !date || !time || !address || !size) {
    showFormAlert('booking-alert', 'Please fill in all required fields.', 'error'); return;
  }

  const btn = document.querySelector('.btn-submit-form');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  // Send to Formspree
  try {
    const payload = new FormData();
    payload.append('_subject', 'New Booking (Dashboard) — Limpieza y Brillo');
    payload.append('Name',    session.first + ' ' + session.last);
    payload.append('email',   session.email);
    payload.append('Phone',   session.phone);
    payload.append('Service Type', service);
    payload.append('Preferred Date', formatDate(date));
    payload.append('Preferred Time', time);
    payload.append('Home Size', size);
    payload.append('Address', address);
    payload.append('Notes', notes || 'None');

    await fetch('https://formspree.io/f/meedqele', {
      method: 'POST',
      body: payload,
      headers: { 'Accept': 'application/json' }
    });
  } catch (_) { /* fail silently — booking still saved locally */ }

  // Save locally
  const booking = {
    id: Date.now().toString(),
    service, date: formatDate(date), time, address, size, notes,
    status: 'Pending',
    created: new Date().toLocaleDateString()
  };
  if (!session.bookings) session.bookings = [];
  session.bookings.unshift(booking);
  saveSession();

  showFormAlert('booking-alert', "✓ Your booking request has been submitted! We'll confirm within 24 hours.", 'success');
  ['b-service','b-date','b-time','b-size','b-address','b-notes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  btn.disabled = false;
  btn.textContent = '✨ Request this cleaning';
  setTimeout(() => { showPanel('bookings'); renderAll(); }, 2000);
}

// ── CANCEL BOOKING ──
function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this appointment?')) return;
  const b = session.bookings.find(x => x.id === id);
  if (b) { b.status = 'Cancelled'; saveSession(); renderAll(); }
}

// ── SAVE PROFILE ──
function saveProfile() {
  const first = document.getElementById('p-first').value.trim();
  const last = document.getElementById('p-last').value.trim();
  const email = document.getElementById('p-email').value.trim();
  const phone = document.getElementById('p-phone').value.trim();
  if (!first || !last || !email) { showFormAlert('profile-alert', 'Please fill in all fields.', 'error'); return; }
  session.first = first; session.last = last; session.email = email; session.phone = phone;
  saveSession();
  showFormAlert('profile-alert', '✓ Profile updated successfully!', 'success');
  renderAll();
}

// ── HELPERS ──
function saveSession() {
  localStorage.setItem('lyb_session', JSON.stringify(session));
  const users = JSON.parse(localStorage.getItem('lyb_users') || '[]');
  const idx = users.findIndex(u => u.id === session.id);
  if (idx > -1) { users[idx] = session; localStorage.setItem('lyb_users', JSON.stringify(users)); }
}

function showPanel(name, clickedLink) {
  document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  if (clickedLink) clickedLink.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showFormAlert(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg; el.className = 'form-alert ' + type;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

function logout() {
  localStorage.removeItem('lyb_session');
  window.location.href = 'index.html';
}

// ── SET MIN DATE TO TODAY ──
const today = new Date().toISOString().split('T')[0];
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('b-date');
  if (dateInput) dateInput.min = today;
});
