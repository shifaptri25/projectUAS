const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ success: true, message: 'API OK' }));

// Load routes satu-satu
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));

// Orders COMMENT dulu biar ga error
app.use('/api/orders', require('./routes/orders'));

app.listen(3000, () => {
  console.log('http://localhost:3000');
  console.log('http://localhost:3000/health');
});
