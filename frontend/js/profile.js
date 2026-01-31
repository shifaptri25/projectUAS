const API = 'http://localhost:3000/api';
const token = localStorage.getItem('token');

// pindah ke edit
function goEdit(){
  window.location.href = 'edit-profile.html';
}

// logout
function logout(){
  localStorage.clear();
  window.location.href = 'login.html';
}

// load profile (untuk 2 halaman)
async function loadProfile(){
  const res = await fetch(API + '/users/me/profile', {
    headers:{ Authorization:'Bearer ' + token }
  });

  const user = await res.json();

  // halaman view
  if(document.getElementById('viewEmail')){
    viewEmail.textContent = user.email;
    viewName.textContent = user.name;
    viewRole.textContent = user.role;
    viewAddress.textContent = user.address || '-';
    viewPhone.textContent = user.phone || '-';
  }

  // halaman edit
  if(document.getElementById('editName')){
    editName.value = user.name || '';
    editAddress.value = user.address || '';
    editPhone.value = user.phone || '';
  }
}

// update profile
async function updateProfile(){
  const res = await fetch(API + '/users/me/profile', {
    method:'PUT',
    headers:{
      'Content-Type':'application/json',
      Authorization:'Bearer ' + token
    },
    body: JSON.stringify({
      name: editName.value,
      address: editAddress.value,
      phone: editPhone.value,
      city_name: 'Bandung',
      city_id: 23
    })
  });

  const data = await res.json();
  alert(data.message);
  window.location.href = 'buyer-profile.html';
}

loadProfile();
