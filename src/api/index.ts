// src/api/index.ts
import * as dotenv from 'dotenv';
// Load environment variables FIRST before importing anything else
dotenv.config();

import express, { Application } from 'express';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { errorHandler } from './middleware/errorHandler';
import { medicationRouter } from './routes/medicationRoutes';
import { userRouter } from './routes/userRoutes';
import { authRouter } from './routes/authRoutes';
import { websocketService } from './services/websocketService';

const app: Application = express();
const server = createServer(app);
const PORT = process.env.API_PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS middleware (important for PWA)
app.use((req, res, next) => {
  // In production, allow same origin (no CORS needed)
  // In development, allow the dev server origin
  const origin = req.headers.origin;
  if (process.env.NODE_ENV === 'production') {
    // Same origin - no CORS headers needed
    next();
  } else {
    // Development mode
    res.header('Access-Control-Allow-Origin', origin || FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    
    next();
  }
});

// Health check - MUST be before static files!
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    websocket: {
      active: true,
      totalConnections: websocketService.getTotalConnections()
    }
  });
});

// API routes - MUST be before static files!
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/medications', medicationRouter);

// Serve PWA static files in production - AFTER API routes!
if (process.env.NODE_ENV === 'production') {
  const pwaPath = path.join(__dirname, '../pwa');
  app.use(express.static(pwaPath));
  
  // Serve PWA for any non-API routes (SPA fallback)
  // This MUST be last!
  app.get('*', (req, res) => {
    res.sendFile(path.join(pwaPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

// Initialize WebSocket server
websocketService.initialize(server);

// Start server
server.listen(PORT, () => {
  console.log(`✅ API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`🔐 OAuth callback: ${process.env.DISCORD_REDIRECT_URI}`);
  
  // Debug: Check if env vars are loaded
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    console.error('⚠️  WARNING: Discord credentials not found in environment variables!');
    console.error('Make sure you have a .env file with DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET');
  } else {
    console.log(`✅ Discord OAuth configured`);
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 PWA available at: http://localhost:${PORT}`);
  }
});

export default app;