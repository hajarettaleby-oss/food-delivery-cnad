const express = require('express');
const logger = require('./middleware/logger');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(logger);

app.use('/orders', orderRoutes);

app.get('/health', (req, res) => {
 res.json({ status: "UP", service: "order-service" });
});

app.listen(PORT, () => {
 console.log(`Order Service running on port ${PORT}`);
});