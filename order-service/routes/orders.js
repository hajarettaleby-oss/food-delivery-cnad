const express = require('express');
const axios = require('axios');
const router = express.Router();

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3001';
const MENU_SERVICE_URL = process.env.MENU_SERVICE_URL || 'http://localhost:3002';

let orders = [];
let orderIdCounter = 1;

// Helper: verify restaurant
async function verifyRestaurant(id) {
 try {
  const response = await axios.get(`${RESTAURANT_SERVICE_URL}/restaurants/${id}`);
  return response.data.data;
 } catch (err) {
  return null;
 }
}

// Helper: verify menu item
async function verifyMenuItem(restaurantId, itemId) {
 try {
  const response = await axios.get(`${MENU_SERVICE_URL}/menu/${restaurantId}`);
  const items = response.data.data;
  return items.find(item => item.id == itemId);
 } catch (err) {
  return null;
 }
}

// POST /orders
router.post('/', async (req, res) => {
 const { restaurantId, itemId, quantity = 1 } = req.body;

 if (!restaurantId || !itemId) {
  return res.status(400).json({
  service: "order-service",
  error: "restaurantId and itemId are required"
});
 }

 try {

  // --- Inter-service call 1 ---
  const restaurant = await verifyRestaurant(restaurantId);
  if (!restaurant) {
   return res.status(404).json({
  service: "order-service",
  error: "Restaurant not found"
});
  }

  // --- Inter-service call 2 ---
  const menuItem = await verifyMenuItem(restaurantId, itemId);
  if (!menuItem) {
   return res.status(404).json({
  service: "order-service",
  error: "Menu item not found"
});
  }

  const totalPrice = menuItem.price * quantity;

  const order = {
   id: orderIdCounter++,
   restaurantId,
   itemId,
   itemName: menuItem.name,
   quantity,
   unitPrice: menuItem.price,
   totalPrice,
   status: "CONFIRMED",
   createdAt: new Date().toISOString()
  };

  orders.push(order);

  res.status(201).json({
   service: "order-service",
   message: "Order created successfully",
   data: order
  });

 } catch (error) {

  if (error.code === 'ECONNREFUSED') {
   return res.status(503).json({
  service: "order-service",
  error: "Dependent service unavailable"
});
  }

  res.status(500).json({
  service: "order-service",
  error: "Order processing failed",
  detail: error.message
});
 }
});

// GET /orders
router.get('/', (req, res) => {
 res.json({
  service: "order-service",
  count: orders.length,
  data: orders
 });
});

// GET /orders/:id
router.get('/:id', (req, res) => {
 const order = orders.find(o => o.id == req.params.id);

 if (!order) {
  return res.status(404).json({
   error: `Order ${req.params.id} not found`
  });
 }

 res.json({
  service: "order-service",
  data: order
 });
});

module.exports = router;