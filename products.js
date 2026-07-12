// src/routes/products.js  (v1.0 - base version)
const express = require('express');
const router = express.Router();
const products = require('../data/products');

// GET /products - list all products
router.get('/products', (req, res) => {
  res.status(200).json({ count: products.length, products });
});

module.exports = router;
