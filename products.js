// src/routes/products.js  (v1.1 - adds /products/search by keyword)
const express = require('express');
const router = express.Router();
const products = require('../data/products');

// GET /products - list all products
router.get('/products', (req, res) => {
  res.status(200).json({ count: products.length, products });
});

// GET /products/search?keyword= - new in v1.1
// Must be declared BEFORE /products/:id
router.get('/products/search', (req, res) => {
  const { keyword } = req.query;
  let results = products;

  if (keyword) {
    const kw = keyword.toLowerCase();
    results = results.filter((p) => p.name.toLowerCase().includes(kw));
  }

  res.status(200).json({ count: results.length, products: results });
});

// GET /products/:id - get a single product by id
router.get('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: `Product with id ${id} not found.` });
  }

  res.status(200).json({ product });
});

module.exports = router;
