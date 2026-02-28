const express = require('express');
const axios = require('axios');
const db = require('../firebase');
const router = express.Router();

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3001';
const MENU_SERVICE_URL = process.env.MENU_SERVICE_URL || 'http://localhost:3002';

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

  const restaurant = await verifyRestaurant(restaurantId);
  if (!restaurant) {
   return res.status(404).json({
    service: "order-service",
    error: "Restaurant not found"
   });
  }

  const menuItem = await verifyMenuItem(restaurantId, itemId);
  if (!menuItem) {
   return res.status(404).json({
    service: "order-service",
    error: "Menu item not found"
   });
  }

  const totalPrice = menuItem.price * quantity;

  const newOrder = {
   restaurantId,
   itemId,
   itemName: menuItem.name,
   quantity,
   unitPrice: menuItem.price,
   totalPrice,
   status: "CONFIRMED",
   createdAt: new Date().toISOString()
  };
  const docRef = await db.collection("orders").add(newOrder);

  res.status(201).json({
   service: "order-service",
   message: "Order created successfully",
   data: {
    id: docRef.id,
    ...newOrder
   }
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
router.get('/', async (req, res) => {
 try {
  const snapshot = await db.collection("orders").get();

  const orders = snapshot.docs.map(doc => ({
   id: doc.id,
   ...doc.data()
  }));

  res.json({
   service: "order-service",
   count: orders.length,
   data: orders
  });

 } catch (error) {
  res.status(500).json({
   service: "order-service",
   error: "Failed to fetch orders"
  });
 }
});

// GET /orders/:id
router.get('/:id', async (req, res) => {
 try {
  const doc = await db.collection("orders").doc(req.params.id).get();

  if (!doc.exists) {
   return res.status(404).json({
    service: "order-service",
    error: `Order ${req.params.id} not found`
   });
  }

  res.json({
   service: "order-service",
   data: {
    id: doc.id,
    ...doc.data()
   }
  });

 } catch (error) {
  res.status(500).json({
   service: "order-service",
   error: "Failed to fetch order"
  });
 }
});

module.exports = router;