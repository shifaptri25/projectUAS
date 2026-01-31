const API = 'http://localhost:3000/api';

// ================= LOGIN =================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('error');

    errorEl.textContent = '';

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // ⬇️ ARAHKAN BERDASARKAN ROLE
      if (data.user.role === 'admin') {
        window.location.href = 'dashboardadmin.html';
      } else if (data.user.role === 'seller') {
        window.location.href = 'dashboardseller.html';
      } else {
        window.location.href = 'dashboardbuyer.html';
      }

    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

// ================= REGISTER =================
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorEl = document.getElementById('registerError');

    errorEl.textContent = '';

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('Register berhasil, silakan login');
      window.location.href = 'login.html';

    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}
