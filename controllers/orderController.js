const pool = require('../config/database');
const { getShippingCost } = require('../utils/rajaongkir');

exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { items, address, origin, destination, courier = 'jne' } = req.body;
    const weight = items.reduce((sum, item) => sum + (item.quantity * 1000), 0);
    
    // Skip RajaOngkir untuk test (uncomment nanti)
    // const ongkirData = await getShippingCost(origin, destination, weight, courier);
    const shippingCost = 15000;
    const shippingEtd = '2-3 hari';
    
    // Hitung subtotal items
    const itemsSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Hitung total amount
    const totalAmount = itemsSubtotal + shippingCost;
    
    // Gunakan buyer ID dengan pengecekan jika req.user tidak ada (untuk testing)
    const buyerId = req.user ? req.user.id : 1; // Default ke user ID 1 untuk testing
    
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (buyer_id, total_amount, shipping_cost, shipping_courier, shipping_etd, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [buyerId, totalAmount, shippingCost, courier, shippingEtd, address, 'pending']
    );
    
    const orderId = orderResult.insertId;
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    
    await connection.commit();
    
    // RESPONSE YANG DIPERBAIKI - MENAMPILKAN INFORMASI ONGKIR
    res.status(201).json({ 
      success: true, 
      message: 'Order berhasil dibuat',
      orderId: orderId,
      shipping: {
        cost: shippingCost,
        courier: courier,
        estimatedDelivery: shippingEtd
      },
      total: totalAmount,
      breakdown: {
        items: itemsSubtotal,
        shipping: shippingCost,
        total: totalAmount
      }
    });
    
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ? AND buyer_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Status diupdate' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tambah function INI di controller:
exports.getOrders = async (req, res) => {
  try {
    // Ganti req.user.id dengan 1 (demo)
    const [orders] = await pool.execute(
      `SELECT o.*, u.name as buyer_name 
       FROM orders o 
       JOIN users u ON o.buyer_id = u.id 
       WHERE o.buyer_id = 1`,
      [1]
    );
    
    res.json({ 
      success: true, 
      count: orders.length,
      data: orders 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

