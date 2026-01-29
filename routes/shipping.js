const express = require('express');
const router = express.Router();
const { getShippingCost } = require('../utils/rajaongkir');

//GET /api/shipping/cost?origin=Bandung&destination=Jakarta&weight=1000
router.get('/cost', async (req, res) => {
  try {
    const { origin = 'Bandung', destination = 'Jakarta', weight = 1000, courier = 'jne' } = req.query;
    
    console.log('Shipping cost:', { origin, destination, weight, courier });
    
    const ongkirData = await getShippingCost(origin, destination, weight, courier);
    
    res.json({
      success: true,
      origin,
      destination,
      weight: `${weight}g`,
      data: ongkirData
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
