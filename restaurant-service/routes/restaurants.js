const express = require('express');
const router = express.Router();

const restaurants = [
 { id: 1, name: "Pizza Palace", location: "Casablanca" },
 { id: 2, name: "Burger Town", location: "Elbrouj" },
];

// GET all restaurants
router.get('/', (req, res) => {
 res.json({ service: "restaurant-service", data: restaurants });
});

// GET single restaurant
router.get('/:id', (req, res) => {
 const restaurant = restaurants.find(r => r.id == req.params.id);

 if (!restaurant) {
  return res.status(404).json({ error: `Restaurant ${req.params.id} not found` });
 }

 res.json({ service: "restaurant-service", data: restaurant });
});

// Health check
router.get('/health', (req, res) => {
 res.json({ status: "UP", service: "restaurant-service", timestamp: new Date() });
});

module.exports = router;