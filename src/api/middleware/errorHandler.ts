// src/api/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  const response: ApiResponse = {
    success: false,
    error: err.message || 'Internal server error'
  };

  // Determine status code based on error type
  let statusCode = 500;
  
  if (err.message.includes('not found')) {
    statusCode = 404;
  } else if (err.message.includes('already exists') || 
             err.message.includes('Invalid') ||
             err.message.includes('required')) {
    statusCode = 400;
  }

  res.status(statusCode).json(response);
}