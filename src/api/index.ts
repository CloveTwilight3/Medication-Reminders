// src/api/index.ts
import express, { Application } from 'express';
import * as dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { medicationRouter } from './routes/medicationRoutes';
import { userRouter } from './routes/userRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(express.json());

// CORS middleware (important for PWA)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/users', userRouter);
app.use('/api/medications', medicationRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;