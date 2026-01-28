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
    
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + shippingCost;
    
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (buyer_id, total_amount, shipping_cost, shipping_courier, shipping_etd, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, totalAmount, shippingCost, courier, shippingEtd, address, 'pending']
    );
    
    const orderId = orderResult.insertId;
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    
    await connection.commit();
    res.status(201).json({ success: true, message: 'Order berhasil', orderId });
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
