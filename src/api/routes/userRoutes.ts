// src/api/routes/userRoutes.ts
import { Router } from 'express';
import { userController } from '../controllers/userController';

export const userRouter = Router();

// Create new user
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

// Link Discord to user
userRouter.post('/:uid/link-discord', (req, res, next) => 
  userController.linkDiscord(req, res, next)
);

// Unlink Discord from user
userRouter.post('/:uid/unlink-discord', (req, res, next) => 
  userController.unlinkDiscord(req, res, next)
);

// Generate link code for PWA
userRouter.post('/:uid/generate-link-code', (req, res, next) => 
  userController.generateLinkCode(req, res, next)
);

// Validate link code
userRouter.post('/validate-link-code', (req, res, next) => 
  userController.validateLinkCode(req, res, next)
);

// Generate connect token (for /webconnect)
userRouter.post('/:uid/generate-connect-token', (req, res, next) => 
  userController.generateConnectToken(req, res, next)
);

// Validate connect token
userRouter.post('/validate-connect-token', (req, res, next) => 
  userController.validateConnectToken(req, res, next)
);

// Delete user
userRouter.delete('/:uid', (req, res, next) => 
  userController.deleteUser(req, res, next)
);