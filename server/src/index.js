require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const questionnairesRoutes = require('./routes/questionnaires');
const responsesRoutes = require('./routes/responses');
const errorHandler = require('./middleware/errorHandler');
const http = require('http');
const { initializeSocket } = require('./services/socket');
const activityLogsRoutes = require('./routes/activityLogs');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questionnaires', questionnairesRoutes);
app.use('/api/responses', responsesRoutes);
app.use('/api/activity-logs', activityLogsRoutes);

// Error handling middleware should be last
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initializeSocket(server);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 