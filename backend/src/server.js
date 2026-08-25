const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Employee Attendance System API is running smooth',
    timestamp: new Date().toISOString(),
    databaseMode: db.isInMemory ? 'In-Memory (Fallback)' : 'PostgreSQL'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize DB & Start Express Server
async function startServer() {
  await db.initDb();

  app.listen(PORT, () => {
    console.log(`🚀 Express Backend Server listening on http://localhost:${PORT}`);
    console.log(`📡 API Health Check available at http://localhost:${PORT}/api/health`);
  });
}

startServer();
