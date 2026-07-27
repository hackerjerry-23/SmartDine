require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const { initIO } = require('./utils/socket');
const { startScheduledJobs } = require('./utils/scheduler');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const tableRoutes = require('./routes/tableRoutes');
const queueRoutes = require('./routes/queueRoutes');
const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

connectDB();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Innovation modules
app.use('/api/tables', tableRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

app.use(notFound);
app.use(errorHandler);

const BASE_PORT = Number(process.env.PORT || 5000);
const MAX_PORT_ATTEMPTS = 10;

const startServer = (port, attempt = 1) => {
  const server = http.createServer(app);
  initIO(server, process.env.CLIENT_URL);

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
      const fallbackPort = port + 1;
      console.warn(`Port ${port} is busy. Trying ${fallbackPort} instead.`);
      startServer(fallbackPort, attempt + 1);
      return;
    }

    if (err.code === 'EADDRINUSE') {
      console.error(`Unable to start server after ${MAX_PORT_ATTEMPTS} attempts.`);
      process.exit(1);
    }

    throw err;
  });

  server.listen(port, () => {
    console.log(`SmartDine AI server running on port ${port}`);
    startScheduledJobs();
  });
};

startServer(BASE_PORT);

module.exports = app;
