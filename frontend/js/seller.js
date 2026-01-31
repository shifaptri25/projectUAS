const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user || user.role !== 'seller') {
  window.location.href = 'login.html';
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.onclick = () => {
    localStorage.clear();
    window.location.href = 'login.html';
  };
}

const API = 'http://localhost:3000';
const headers = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer ' + token
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productsTable')) {
    loadProducts();
    loadCategories();
  }
});


async function loadProducts() {
  const res = await fetch(API + '/api/products');
  const data = await res.json();
  const tbody = document.getElementById('productsTable');

  tbody.innerHTML = data.data.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.price}</td>
      <td>${p.stock}</td>
      <td>${p.category_name || '-'}</td>
      <td>
        <button class="btn" onclick='editProduct(${JSON.stringify(p)})'>Edit</button>
        <button class="btn" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function showForm() {
  document.getElementById('productForm').style.display = 'block';
}

async function loadCategories() {
  const res = await fetch(API + '/api/categories');
  const data = await res.json();
  const select = document.getElementById('category');

  select.innerHTML = data.data.map(c =>
    `<option value="${c.id}">${c.name}</option>`
  ).join('');
}

function editProduct(p) {
  showForm();
  document.getElementById('productId').value = p.id;
  document.getElementById('name').value = p.name;
  document.getElementById('description').value = p.description;
  document.getElementById('price').value = p.price;
  document.getElementById('stock').value = p.stock;
  document.getElementById('image_url').value = p.image_url;
  document.getElementById('category').value = p.category_id;
}

async function deleteProduct(id) {
  if (!confirm('Hapus produk?')) return;

  await fetch(API + '/api/products/' + id, {
    method: 'DELETE',
    headers
  });

  loadProducts();
}

const form = document.getElementById('productForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('productId').value;

    const body = JSON.stringify({
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    price: document.getElementById('price').value,
    stock: document.getElementById('stock').value,
    category_id: document.getElementById('category').value,
    image_url: document.getElementById('image_url').value
    });

    if (id) {
      await fetch(API + '/api/products/' + id, {
        method: 'PUT',
        headers,
        body
      });
    } else {
      await fetch(API + '/api/products', {
        method: 'POST',
        headers,
        body
      });
    }

    form.reset();
    form.style.display = 'none';
    loadProducts();
  });
}


document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('ordersTable')) {
    loadOrders();
  }
});

async function loadOrders() {
  const res = await fetch(API + '/api/orders', { headers });
  const data = await res.json();

  const tbody = document.getElementById('ordersTable');

  tbody.innerHTML = data.data.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.buyer_name}</td>
      <td>${o.total_amount}</td>
      <td>${o.status}</td>
      <td>${new Date(o.created_at).toLocaleString()}</td>
    </tr>
  `).join('');
}
