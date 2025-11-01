import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import connectDatabase from './config/database.js';
import { initWebSocketServer } from './websocket/websocketServer.js';

// Import routes
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import swapRoutes from './routes/swap.js';
import groupRoutes from './routes/groups.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server (needed for WebSocket)
const server = http.createServer(app);

// Connect to MongoDB
connectDatabase();

// Initialize WebSocket server
initWebSocketServer(server);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api', swapRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SlotSwapper API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server (only in development, Vercel uses serverless functions)
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🔄 SlotSwapper API Server                          ║
║                                                       ║
║   🚀 Server running on port ${PORT}                      ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   📡 WebSocket enabled                                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Export for Vercel serverless
export default app;
