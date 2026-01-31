// ================= CONFIG =================
const API = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

let cart = JSON.parse(localStorage.getItem('cart')) || [];


let allProducts = [];
let categories = [];
let shipping = 0;

// ================= HELPER =================
function api(url, options = {}){
  return fetch(API + url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    ...options
  }).then(res => res.json());
}

// ================= DASHBOARD =================
async function loadCategories(){
  const select = document.getElementById('categoryFilter');
  if(!select) return;

  const data = await api('/categories');
  categories = data.data;

  categories.forEach(cat=>{
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
}

async function loadProducts(){
  const grid = document.getElementById('productGrid');
  if(!grid) return;

  const data = await api('/products');
  allProducts = data.data;
  renderProducts(allProducts);
}

function renderProducts(products){
  const grid = document.getElementById('productGrid');
  if(!grid) return;

  grid.innerHTML = '';

  products.forEach(p=>{
    grid.innerHTML += `
      <div class="card">
        <img src="${p.image_url || 'https://via.placeholder.com/300'}">
        <h3>${p.name}</h3>
        <div class="price">Rp ${p.price}</div>
        <div class="category">${p.category_name || '-'}</div>
        <div class="card-actions">
          <button onclick='addToCart(${JSON.stringify(p)})'>+ Keranjang</button>
        </div>
      </div>
    `;
  });
}

function filterProducts(){
  const keyword = document.getElementById('search')?.value.toLowerCase() || '';
  const catId = document.getElementById('categoryFilter')?.value || '';

  let filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(keyword)
  );

  if(catId){
    filtered = filtered.filter(p => p.category_id == catId);
  }

  renderProducts(filtered);
}

// ================= CART =================
function saveCart(){
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product){
  const existing = cart.find(p=>p.product_id===product.id);
  if(existing){
    existing.quantity++;
  }else{
    cart.push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url
    });
  }
  saveCart();
  alert('Masuk keranjang');
}

// ================= CART PAGE =================
function renderCartPage(){
  const container = document.getElementById('cartItems');
  if(!container) return;

  container.innerHTML = '';

  let totalPrice = 0;
  let totalItems = 0;

  cart.forEach(item=>{
    totalPrice += item.price * item.quantity;
    totalItems += item.quantity;

    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.image_url}">
        <div>
          <h4>${item.name}</h4>
          <p>${item.quantity} x Rp ${item.price}</p>
        </div>
      </div>
    `;
  });

  document.getElementById('totalItems').textContent = totalItems;
  document.getElementById('totalPrice').textContent = totalPrice;
  updateGrandTotal();
}

function updateGrandTotal(){
  const totalPrice = Number(document.getElementById('totalPrice')?.textContent || 0);
  document.getElementById('shippingCost').textContent = shipping;
  document.getElementById('grandTotal').textContent = totalPrice + shipping;
}

// ================= CEK ONGKIR =================
async function checkShipping(){
  const origin = document.getElementById('origin').value;
  const destination = document.getElementById('destination').value;

  const data = await api('/shipping/cost', {
    method: 'POST',
    body: JSON.stringify({
      origin,
      destination,
      weight: 1000,
      courier: 'jne'
    })
  });

  const resultDiv = document.getElementById('shippingResult');
  resultDiv.innerHTML = '<h4>Pilih Layanan:</h4>';

  data.data.rajaongkir.forEach(service=>{
    resultDiv.innerHTML += `
      <div class="shipping-option">
        <input type="radio" name="shipping" 
          value="${service.cost}" 
          onchange="selectShipping(${service.cost})" />
        ${service.service} - Rp ${service.cost} (${service.etd})
      </div>
    `;
  });
}

function selectShipping(cost){
  shipping = cost;
  updateGrandTotal();
}

// ================= CREATE ORDER =================
async function createOrder(){
  const address = document.getElementById('address').value;

  const items = cart.map(c=>({
    product_id: c.product_id,
    quantity: c.quantity,
    price: c.price
  }));

  const data = await api('/orders', {
    method:'POST',
    body: JSON.stringify({
      items,
      address,
      shipping_cost: shipping
    })
  });

  if(data.success){
    alert('Order berhasil!');
    localStorage.removeItem('cart');
    window.location.href = 'buyer-orders.html';
  }else{
    alert(data.message);
  }
}

// ================= EVENTS =================
document.getElementById('search')?.addEventListener('input', filterProducts);
document.getElementById('categoryFilter')?.addEventListener('change', filterProducts);

// ================= INIT =================
loadCategories();
loadProducts();
renderCartPage();

async function loadMyOrders(){
  const res = await fetch(API + '/orders/my', {
    headers:{ Authorization: 'Bearer ' + token }
  });

  const data = await res.json();

  // panggil renderer
  renderOrders(data.data);
}

function renderOrders(orders){
  const list = document.getElementById('ordersList');
  list.innerHTML = '';

  orders.forEach(o=>{
    // 🔥 anti undefined semua kemungkinan field total
    const total =
      o.total_price ||
      o.total ||
      o.grand_total ||
      o.total_amount ||
      o.amount ||
      0;

    list.innerHTML += `
      <div class="order-card" onclick="loadDetail(${o.id})">
        <h4>Order #${o.id}</h4>
        <p>Status: ${o.status}</p>
        <p>Total: Rp ${total}</p>
      </div>
    `;
  });
}

async function loadDetail(id){
  const res = await fetch(API + '/orders/' + id, {
    headers:{ Authorization: 'Bearer ' + token }
  });

  const data = await res.json();
  const o = data.data;

  const detail = document.getElementById('orderDetail');

  // 🔥 ambil ongkir & total yang benar
  const shipping =
    o.shipping_cost ||
    o.ongkir ||
    o.shipping ||
    0;

  const total =
    o.total_price ||
    o.total ||
    o.grand_total ||
    o.total_amount ||
    o.amount ||
    0;

  detail.innerHTML = `
    <p><b>Alamat:</b> ${o.address}</p>
    <p><b>Status:</b> ${o.status}</p>
    <p><b>Ongkir:</b> Rp ${shipping}</p>
    <p><b>Total Order:</b> Rp ${total}</p>
    <hr/>
  `;

  if(o.items && o.items.length){
    o.items.forEach(i=>{
      detail.innerHTML += `
        <div class="order-item">
          ${i.product_name} - ${i.quantity} x Rp ${i.price}
        </div>
      `;
    });
  }
}

loadMyOrders();

a