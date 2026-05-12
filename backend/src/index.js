require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/kategori', require('./routes/kategori'));
app.use('/api/barang', require('./routes/barang'));
app.use('/api/supplier', require('./routes/supplier'));
app.use('/api/masuk', require('./routes/masuk'));
app.use('/api/keluar', require('./routes/keluar'));
app.use('/api/laporan', require('./routes/laporan'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from frontend/dist
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Handle SPA routing - send all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});