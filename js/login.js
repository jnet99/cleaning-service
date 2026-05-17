// ── TAB SWITCHING ──
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'signup'));
  });
  document.getElementById('panel-login').classList.toggle('active', tab === 'login');
  document.getElementById('panel-signup').classList.toggle('active', tab === 'signup');
}

// ── PASSWORD VISIBILITY ──
function togglePass(id, btn) {
  const input = document.getElementById(id);
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  btn.querySelector('i').className = showing ? 'ti ti-eye' : 'ti ti-eye-off';
}

// ── SHOW ALERT ──
function showAlert(id, message, type) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.className = 'alert ' + type;
}

// ── LOGIN ──
function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showAlert('login-alert', 'Please fill in all fields.', 'error');
    return;
  }
  if (!email.includes('@')) {
    showAlert('login-alert', 'Please enter a valid email address.', 'error');
    return;
  }

  // Load users from localStorage
  const users = JSON.parse(localStorage.getItem('lyb_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showAlert('login-alert', 'Incorrect email or password. Please try again.', 'error');
    return;
  }

  // Save session
  localStorage.setItem('lyb_session', JSON.stringify(user));
  showAlert('login-alert', '✓ Signing you in…', 'success');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
}

// ── SIGN UP ──
function handleSignup() {
  const first = document.getElementById('signup-first').value.trim();
  const last = document.getElementById('signup-last').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (!first || !last || !email || !phone || !password || !confirm) {
    showAlert('signup-alert', 'Please fill in all fields.', 'error'); return;
  }
  if (!email.includes('@')) {
    showAlert('signup-alert', 'Please enter a valid email address.', 'error'); return;
  }
  if (password.length < 8) {
    showAlert('signup-alert', 'Password must be at least 8 characters.', 'error'); return;
  }
  if (password !== confirm) {
    showAlert('signup-alert', 'Passwords do not match.', 'error'); return;
  }

  const users = JSON.parse(localStorage.getItem('lyb_users') || '[]');
  if (users.find(u => u.email === email)) {
    showAlert('signup-alert', 'An account with this email already exists.', 'error'); return;
  }

  const newUser = { id: Date.now(), first, last, email, phone, password, joined: new Date().toLocaleDateString(), bookings: [] };
  users.push(newUser);
  localStorage.setItem('lyb_users', JSON.stringify(users));
  localStorage.setItem('lyb_session', JSON.stringify(newUser));

  showAlert('signup-alert', '✓ Account created! Taking you to your dashboard…', 'success');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
}

// ── GOOGLE (placeholder) ──
function googleAuth() {
  alert('Google sign-in requires connecting Firebase or Google Identity Services to your hosted site. See the setup guide in the README.');
}

// If already logged in, redirect
if (localStorage.getItem('lyb_session')) {
  window.location.href = 'dashboard.html';
}
