const express = require('express');
const router = express.Router();

// 👤 GET /api/profile - Profil user demo
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "buyer",
      phone: "081234567890",
      address: "Jl. Sudirman No. 123, Bandung",
      joined: "2026-01-01",
      orders_count: 5,
      total_spent: "Rp1.250.000"
    }
  });
});

module.exports = router;
