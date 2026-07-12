// src/data/products.js
// In-memory product catalogue data (no external DB needed - keeps this microservice
// lightweight and focused on the DevOps/containerization objectives of this assignment).

module.exports = [
  { id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 599, stock: 120 },
  { id: 2, name: 'Mechanical Keyboard', category: 'Electronics', price: 2499, stock: 45 },
  { id: 3, name: 'Running Shoes', category: 'Footwear', price: 1899, stock: 60 },
  { id: 4, name: 'Yoga Mat', category: 'Fitness', price: 799, stock: 90 },
  { id: 5, name: 'Coffee Mug', category: 'Home', price: 299, stock: 200 },
  { id: 6, name: 'Bluetooth Speaker', category: 'Electronics', price: 1499, stock: 75 },
  { id: 7, name: 'Notebook Set', category: 'Stationery', price: 199, stock: 300 },
  { id: 8, name: 'Desk Lamp', category: 'Home', price: 899, stock: 55 }
];
