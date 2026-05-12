require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const setupSocket = require('./socket/chat');

const app = express();
const server = http.createServer(app);

// Dynamic CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/payment', require('./routes/payment'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    name: 'HealthSphere API',
    timestamp: new Date().toISOString(),
    features: {
      ai: process.env.GEMINI_API_KEY ? 'gemini' : 'mock',
      payments: process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_your_key_id' ? 'razorpay' : 'demo',
      database: 'MongoDB'
    }
  });
});

// Setup Socket.io
setupSocket(io);

// Connect to MongoDB then start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // Connect to MongoDB in the background (don't block server startup)
  connectDB().catch(err => {
    console.error('  ⚠️  MongoDB connection failed (server still running):', err.message);
  });
  
  server.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🏥 HealthSphere API Server              ║
  ║   Running on http://localhost:${PORT}         ║
  ║                                           ║
  ║   Database: 🗄️  MongoDB (connecting...)    ║
  ║   AI Mode: ${process.env.GEMINI_API_KEY ? '🤖 Gemini API' : '📋 Mock Responses'}            ║
  ║   Payments: ${process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_your_key_id' ? '💳 Razorpay Live' : '🎮 Demo Mode'}           ║
  ║   WebSocket: ✅ Active                    ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
    `);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = { app, server, io };
