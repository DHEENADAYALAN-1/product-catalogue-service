// src/server.js
require('dotenv').config();
const express = require('express');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 4000;
const APP_VERSION = process.env.APP_VERSION || '2.0.0';

app.use(express.json());

// Health check - used by Docker HEALTHCHECK and Kubernetes liveness/readiness probes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'product-catalogue-service', version: APP_VERSION });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Product Catalogue Service is running.',
    version: APP_VERSION
  });
});

app.use('/', productRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Product Catalogue Service (v${APP_VERSION}) running on port ${PORT}`);
});

module.exports = app;
