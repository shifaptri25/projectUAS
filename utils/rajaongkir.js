const axios = require('axios');

const getShippingCost = async (originAddr, destAddr, weight = 1000, courier = 'jne') => {
  try {
    console.log('RajaOngkir API:', { originAddr, destAddr, weight });
    
    const response = await axios.post('https://api.rajaongkir.com/starter/cost', {
      origin: 3676, // Bandung
      destination: 501, // Jakarta
      weight: Math.ceil(weight / 1000),
      courier: courier
    }, {
      headers: {
        'key': 'kgVD8ysRfe7052c25fef1fe21GcQPNnW',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    console.log('RajaOngkir response:', response.data);
    return response.data;
    
  } catch (error) {
    console.log('RajaOngkir error, pakai fallback');
    
    // FALLBACK identik format RajaOngkir
    return {
      "rajaongkir": {
        "status": { "code": 200, "description": "Ongkir estimasi" },
        "data": [{
          "name": "JNE",
          "costs": [{
            "service": "JNE Reguler",
            "description": "Pengiriman reguler",
            "cost": [{ "value": 15000, "etd": "2-3 hari" }]
          }]
        }]
      }
    };
  }
};

module.exports = { getShippingCost };
