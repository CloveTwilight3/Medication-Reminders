// src/api/routes/userRoutes.ts
import { Router } from 'express';
import { userController } from '../controllers/userController';

export const userRouter = Router();

// Create new user (kept for backwards compatibility, but OAuth handles this)
userRouter.post('/', (req, res, next) => 
  userController.createUser(req, res, next)
);

// Get user by UID
userRouter.get('/:uid', (req, res, next) => 
  userController.getUser(req, res, next)
);

// Get user by Discord ID
userRouter.get('/discord/:discordId', (req, res, next) => 
  userController.getUserByDiscordId(req, res, next)
);

// Link Discord to user (kept for manual linking if needed)
userRouter.post('/:uid/link-discord', (req, res, next) => 
  userController.linkDiscord(req, res, next)
);

// Delete user
userRouter.delete('/:uid', (req, res, next) => 
  userController.deleteUser(req, res, next)
);