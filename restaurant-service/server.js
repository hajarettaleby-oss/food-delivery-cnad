const express = require('express');
const logger = require('./middleware/logger');
const restaurantRoutes = require('./routes/restaurants');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(logger);

app.use('/restaurants', restaurantRoutes);

app.get('/health', (req, res) => {
 res.json({ status: "UP", service: "restaurant-service" });
});

app.listen(PORT, () => {
 console.log(`Restaurant Service running on port ${PORT}`);
});