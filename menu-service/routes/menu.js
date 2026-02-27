const express = require('express');
const axios = require('axios');
const router = express.Router();

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3001';

let menuItems = [
 { id: 1, restaurantId: 1, name: "Margherita Pizza", price: 80 },
 { id: 2, restaurantId: 1, name: "Pepperoni Pizza", price: 95 },
 { id: 3, restaurantId: 2, name: "Cheese Burger", price: 60 }
];

// Helper: verify restaurant exists
async function verifyRestaurant(restaurantId) {
 try {
  const response = await axios.get(
   `${RESTAURANT_SERVICE_URL}/restaurants/${restaurantId}`
  );
  return response.data.data;
 } catch (error) {
  return null;
 }
}

// GET menu by restaurant
router.get('/:restaurantId', (req, res) => {
 const items = menuItems.filter(
  item => item.restaurantId == req.params.restaurantId
 );

 res.json({
  service: "menu-service",
  count: items.length,
  data: items
 });
});

// POST new menu item
router.post('/', async (req, res) => {
 const { restaurantId, name, price } = req.body;

 if (!restaurantId || !name || !price) {
  return res.status(400).json({
  service: "menu-service",
  error: "restaurantId, name and price are required"
});
 }

 // --- Inter-service REST call ---
 const restaurant = await verifyRestaurant(restaurantId);

 if (!restaurant) {
  return res.status(404).json({
  service: "menu-service",
  error: "Restaurant does not exist"
});
 }

 const newItem = {
  id: menuItems.length + 1,
  restaurantId,
  name,
  price
 };

 menuItems.push(newItem);

 res.status(201).json({
  service: "menu-service",
  message: "Menu item created successfully",
  data: newItem
 });
});

// Health
router.get('/health', (req, res) => {
 res.json({
  status: "UP",
  service: "menu-service",
  timestamp: new Date()
 });
});

module.exports = router;