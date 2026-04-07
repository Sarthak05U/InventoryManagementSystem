const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/activity', activityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API docs available at http://localhost:${PORT}/api/docs`);
    });
  });
}

module.exports = app;
