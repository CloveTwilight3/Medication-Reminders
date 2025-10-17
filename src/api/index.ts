// src/api/index.ts
import express, { Application } from 'express';
import * as dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { medicationRouter } from './routes/medicationRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/medications', medicationRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ API server running on port ${PORT}`);
});

export default app;