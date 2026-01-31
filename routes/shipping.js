const express = require('express');
const router = express.Router();
const getShippingCost = require('../utils/rajaongkir');
const shippingController = require("../controllers/shippingController");

router.post("/cost", shippingController.getCost);

router.post('/cost', async (req, res) => {
  try {
    const {
      origin,
      destination,
      weight = 1000,
      courier = 'jne'
    } = req.body;

    console.log('🚚 Request ongkir:', {
      origin,
      destination,
      weight,
      courier
    });

    // VALIDASI: pastikan ID
    if (isNaN(origin) || isNaN(destination)) {
      return res.status(400).json({
        success: false,
        message: 'Origin & destination HARUS ID kota (angka)'
      });
    }

    const data = await getShippingCost(
      origin,
      destination,
      weight,
      courier
    );

    res.json({
      success: true,
      data
    });

  } catch (err) {
    console.error(' Error di route shipping:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
