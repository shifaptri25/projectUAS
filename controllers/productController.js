const pool = require('../config/database');

exports.getProducts = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, c.name as category_name, u.name as seller_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN users u ON p.seller_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, c.name as category_name, u.name as seller_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image_url } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO products (seller_id, category_id, name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, category_id, name, description, price, stock, image_url]
    );
    const [newProduct] = await pool.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newProduct[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image_url } = req.body;
    
    const [product] = await pool.execute('SELECT seller_id FROM products WHERE id = ?', [req.params.id]);
    if (product[0]?.seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bukan produk kamu' });
    }
    
    await pool.execute(
      'UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?, image_url=? WHERE id=?',
      [name, description, price, stock, category_id, image_url, req.params.id]
    );
    
    const [updated] = await pool.execute(`
      SELECT p.*, c.name as category_name 
      FROM products p LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const [product] = await pool.execute('SELECT seller_id FROM products WHERE id = ?', [req.params.id]);
    if (product[0]?.seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bukan produk kamu' });
    }
    
    await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
