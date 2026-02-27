const express = require('express');
const logger = require('./middleware/logger');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(logger);
app.get('/', (req, res) => {
  res.json({
    service: "order-service",
    message: "Order Service is running on Google App Engine",
    environment: "production"
  });
});
app.use('/orders', orderRoutes);
app.get('/health', (req, res) => {
  res.json({
    status: "UP",
    service: "order-service",
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});