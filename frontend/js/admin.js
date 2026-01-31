// ====================
// CONFIG & AUTH CHECK
// ====================
const API_BASE = 'http://localhost:3000';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user || user.role !== 'admin') {
  window.location.href = 'login.html';
}

// ====================
// API HELPER
// ====================
async function api(url, options = {}) {
  const res = await fetch(API_BASE + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.message || 'Request gagal');
    throw new Error(res.statusText);
  }

  return res.json();
}

// ====================
// PAGE DETECTOR
// ====================
document.addEventListener('DOMContentLoaded', () => {

  // USERS PAGE
  if (document.getElementById('usersTable')) {
    loadUsers();
  }

  // CATEGORIES PAGE
  if (document.getElementById('categoriesTable')) {
    loadCategories();
  }

  // ORDERS PAGE
  if (document.getElementById('ordersTable')) {
    loadOrders();
  }

  // LOGOUT BUTTON
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }
});

// ====================
// USERS
// ====================
async function loadUsers() {
  const users = await api('/api/users');
  const tbody = document.getElementById('usersTable');

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>
        <button class="btn btn-primary" onclick="viewUser(${u.id})">
          Detail
        </button>
      </td>
    </tr>
  `).join('');
}

function viewUser(id) {
  window.location.href = `user-detail.html?id=${id}`;
}

// ====================
// CATEGORIES
// ====================
async function loadCategories() {
  const res = await api('/api/categories');
  const tbody = document.getElementById('categoriesTable');

  tbody.innerHTML = res.data.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.description || '-'}</td>
      <td>
        <button class="btn btn-danger" onclick="deleteCategory(${c.id})">
          Hapus
        </button>
      </td>
    </tr>
  `).join('');
}

async function deleteCategory(id) {
  if (!confirm('Hapus kategori ini?')) return;

  await api(`/api/categories/${id}`, { method: 'DELETE' });
  loadCategories();
}

// ====================
// ORDERS
// ====================
async function loadOrders() {
  const res = await api('/api/orders');
  const tbody = document.getElementById('ordersTable');

  tbody.innerHTML = res.data.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.buyer_name}</td>
      <td>${o.total_amount}</td>
      <td>
        <select onchange="updateOrderStatus(${o.id}, this.value)">
          <option ${o.status === 'pending' ? 'selected' : ''}>pending</option>
          <option ${o.status === 'paid' ? 'selected' : ''}>paid</option>
          <option ${o.status === 'shipped' ? 'selected' : ''}>shipped</option>
          <option ${o.status === 'completed' ? 'selected' : ''}>completed</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateOrderStatus(id, status) {
  await api(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });

  alert('Status diperbarui');
}

// ====================
// LOGOUT
// ====================
function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

async function viewUser(id) {
  const user = await api(`/api/users/${id}`);

  document.getElementById('userForm').style.display = 'block';
  document.getElementById('userId').value = user.id;
  document.getElementById('name').value = user.name;
  document.getElementById('address').value = user.address || '';
  document.getElementById('phone').value = user.phone || '';
}

// ====================
// USER DETAIL PAGE
// ====================
function viewUser(id) {
  window.location.href = `userdetail.html?id=${id}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  // Jika di halaman user-detail.html
  if (id && document.getElementById('userForm')) {
    const user = await api(`/api/users/${id}`);

    document.getElementById('userId').value = user.id;
    document.getElementById('name').value = user.name;
    document.getElementById('address').value = user.address || '';
    document.getElementById('phone').value = user.phone || '';
  }

  const form = document.getElementById('userForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      await api(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: document.getElementById('name').value,
          address: document.getElementById('address').value,
          phone: document.getElementById('phone').value
        })
      });

      alert('User berhasil diupdate');
    });
  }
});

// ====================
// CATEGORIES CRUD
// ====================

function showCategoryForm(id = null, name = '', desc = '') {
  document.getElementById('categoryForm').style.display = 'block';
  document.getElementById('categoryId').value = id || '';
  document.getElementById('catName').value = name;
  document.getElementById('catDesc').value = desc;
  document.getElementById('formTitle').textContent =
    id ? 'Edit Category' : 'Tambah Category';
}

async function loadCategories() {
  const res = await api('/api/categories');
  const tbody = document.getElementById('categoriesTable');

  if (!tbody) return;

  tbody.innerHTML = res.data.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.description || '-'}</td>
      <td>
        <button class="btn btn-primary"
          onclick="showCategoryForm(${c.id}, '${c.name}', '${c.description || ''}')">
          Edit
        </button>
        <button class="btn btn-danger"
          onclick="deleteCategory(${c.id})">
          Hapus
        </button>
      </td>
    </tr>
  `).join('');
}

async function deleteCategory(id) {
  if (!confirm('Hapus category ini?')) return;
  await api(`/api/categories/${id}`, { method: 'DELETE' });
  loadCategories();
}

const categoryForm = document.getElementById('categoryForm');

if (categoryForm) {
  categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('catName').value;
    const description = document.getElementById('catDesc').value;

    if (id) {
      await api(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description })
      });
    } else {
      await api('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name, description })
      });
    }

    alert('Category disimpan');
    categoryForm.reset();
    categoryForm.style.display = 'none';
    loadCategories();
  });
}

// ====================
// ORDERS STATUS UPDATE
// ====================

async function loadOrders() {
  const res = await api('/api/orders');
  const tbody = document.getElementById('ordersTable');

  if (!tbody) return;

  tbody.innerHTML = res.data.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.buyer_name}</td>
      <td>${o.total_amount}</td>
      <td>
        <select onchange="updateOrderStatus(${o.id}, this.value)">
          <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>pending</option>
          <option value="processed" ${o.status === 'processed' ? 'selected' : ''}>processed</option>
          <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>shipped</option>
          <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>completed</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateOrderStatus(id, status) {
  await api(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });

  alert('Status order diperbarui');
}

async function deleteUserByInputId(){
  const id = document.getElementById('deleteUserId').value;

  if(!id) return alert('Masukkan ID user');
  if(!confirm('Yakin hapus user ini?')) return;

  await api(`/api/users/${id}`, {
    method: 'DELETE'
  });

  alert('User berhasil dihapus');
  loadUsers(); // refresh tabel
}