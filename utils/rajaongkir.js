require('dotenv').config();
const axios = require('axios');

const getShippingCost = async (origin, destination, weight = 1000, courier = 'jne') => {
  try {
    // ⚠️ STEP 1: Gunakan URLSearchParams untuk format x-www-form-urlencoded
    // API ini TIDAK BISA baca JSON biasa.
    const params = new URLSearchParams();
    params.append('origin', origin);         // Harus ID (misal: '22')
    params.append('destination', destination); // Harus ID (misal: '152')
    params.append('weight', weight);
    params.append('courier', courier);

    console.log('🚚 Mengirim data ke Komerce:', params.toString());

    // ⚠️ STEP 2: Kirim dengan header yang sesuai
    const response = await axios.post(
      'https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost', 
      params, // Kirim object URLSearchParams, bukan object JSON biasa
      {
        headers: {
          'key': process.env.KOMERCE_API_KEY, 
          'Content-Type': 'application/x-www-form-urlencoded' // ⬅️ WAJIB INI
        }
      }
    );

    console.log('✅ Sukses:', response.data);
    return { rajaongkir: response.data.data };

  } catch (err) {
    console.error('❌ API Error:', err.response?.data || err.message);
    
    // Tampilkan pesan error spesifik jika ada
    if (err.response?.data?.meta?.message) {
      console.error('Detail:', err.response.data.meta.message);
    }
    
    return null;
  }
};

module.exports = getShippingCost;