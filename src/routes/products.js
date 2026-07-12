// src/routes/products.js
// v2.0 - Full feature set: list, get by id, and enhanced search with query params + error handling

const express = require('express');
const router = express.Router();
const products = require('../data/products');

// GET /products - list all products
router.get('/products', (req, res) => {
  res.status(200).json({ count: products.length, products });
});

// GET /products/search?keyword=&category=&minPrice=&maxPrice=
// IMPORTANT: this route must be declared BEFORE /products/:id so "search" isn't
// mistaken for an :id value.
router.get('/products/search', (req, res) => {
  const { keyword, category, minPrice, maxPrice } = req.query;

  // v2.0 error handling: validate numeric query params
  if (minPrice !== undefined && isNaN(Number(minPrice))) {
    return res.status(400).json({ error: 'minPrice must be a valid number.' });
  }
  if (maxPrice !== undefined && isNaN(Number(maxPrice))) {
    return res.status(400).json({ error: 'maxPrice must be a valid number.' });
  }

  let results = products;

  if (keyword) {
    const kw = keyword.toLowerCase();
    results = results.filter((p) => p.name.toLowerCase().includes(kw));
  }

  if (category) {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (minPrice !== undefined) {
    results = results.filter((p) => p.price >= Number(minPrice));
  }

  if (maxPrice !== undefined) {
    results = results.filter((p) => p.price <= Number(maxPrice));
  }

  return res.status(200).json({ count: results.length, products: results });
});

// GET /products/:id - get a single product by id
router.get('/products/:id', (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Product id must be a number.' });
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: `Product with id ${id} not found.` });
  }

  return res.status(200).json({ product });
});

module.exports = router;