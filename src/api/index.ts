/** src/api/index.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

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
app.set("trust proxy", 1);
const server = createServer(app);
const PORT = process.env.API_PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

// Initialize WebSocket server FIRST (before any routes)
websocketService.initialize(server);

// Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Fixed CORS middleware (works in both dev + production)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Always define allowed origin explicitly
  const allowedOrigin =
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL || "https://www.cuddle-blahaj.win"
      : origin || "http://localhost:5173";

  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true"); // ✅ allow cookies always

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
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
  
  // Serve PWA for any non-API, non-WebSocket routes (SPA fallback)
  // CRITICAL: Exclude /ws from catch-all to allow WebSocket upgrades
  app.get('*', (req, res, next) => {
    // Skip WebSocket path - let it be handled by WebSocketServer
    if (req.path === '/ws') {
      return next();
    }
    res.sendFile(path.join(pwaPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`✅ API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`🔐 OAuth callback: ${process.env.DISCORD_REDIRECT_URI}`);
  
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    console.error('⚠️  WARNING: Discord credentials not found in environment variables!');
  } else {
    console.log(`✅ Discord OAuth configured`);
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 PWA available at: http://localhost:${PORT}`);
  }
});

export default app;