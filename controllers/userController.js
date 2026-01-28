const pool = require('../config/database');

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, email, name, role, created_at FROM users');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, email, name, role, address, phone, created_at FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    await pool.execute(
      'UPDATE users SET name = ?, address = ?, phone = ? WHERE id = ?',
      [name, address, phone, req.user.id]
    );
    res.json({ success: true, message: 'Profile berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tambahan get profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, name, role, address, phone, created_at FROM users WHERE id = ?', 
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
