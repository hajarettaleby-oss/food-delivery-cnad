const express = require('express');
const logger = require('./middleware/logger');
const menuRoutes = require('./routes/menu');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(logger);

app.use('/menu', menuRoutes);

app.get('/health', (req, res) => {
 res.json({ status: "UP", service: "menu-service" });
});

app.listen(PORT, () => {
 console.log(`Menu Service running on port ${PORT}`);
});