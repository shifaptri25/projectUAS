const pool = require('../config/database');

// ADMIN: Get all users
exports.getAllUsers = async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, email, name, role, address, phone, created_at FROM users"
  );
  res.json(rows);
};

// ADMIN: Get user by ID
exports.getUserById = async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT id, email, name, role, address, phone FROM users WHERE id=?",
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

// USER: Get my profile
exports.getMyProfile = async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, email, name, role, address, phone, city_name, city_id
     FROM users WHERE id=?`,
    [req.user.id]
  );
  res.json(rows[0]);
};

// ADMIN: Update any user
exports.updateUserById = async (req, res) => {
  const { name, address, phone } = req.body;
  await pool.execute(
    "UPDATE users SET name=?, address=?, phone=? WHERE id=?",
    [name, address, phone, req.params.id]
  );
  res.json({ message: "Updated by admin" });
};

// USER: Update own profile
exports.updateMyProfile = async (req, res) => {
  const { name, address, phone } = req.body;

  await pool.execute(
    `UPDATE users 
     SET name=?, address=?, phone=? 
     WHERE id=?`,
    [name, address, phone, req.user.id]
  );

  res.json({ message: "Profile updated" });
};

exports.deleteUserById = async (req, res) => {
  try {
    await pool.execute(
      "DELETE FROM users WHERE id=?",
      [req.params.id]
    );

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
