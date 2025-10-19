// src/api/routes/authRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { authController } from '../controllers/authController';

export const authRouter = Router();

// Discord OAuth login URL
authRouter.get('/discord', (req: Request, res: Response, next: NextFunction) => 
  authController.getDiscordAuthUrl(req, res, next)
);

// Discord OAuth callback
authRouter.get('/discord/callback', (req: Request, res: Response, next: NextFunction) => 
  authController.handleDiscordCallback(req, res, next)
);

// Logout
authRouter.post('/logout', (req: Request, res: Response, next: NextFunction) => 
  authController.logout(req, res, next)
);

// Get current user session
authRouter.get('/me', (req: Request, res: Response, next: NextFunction) => 
  authController.getCurrentUser(req, res, next)
);