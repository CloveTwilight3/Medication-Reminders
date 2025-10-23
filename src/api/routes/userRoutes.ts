/** src/api/routes/userRoutes.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

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

// Update user settings
userRouter.patch('/:uid/settings', (req, res, next) => 
  userController.updateUserSettings(req, res, next)
);

// Get user by Discord ID
userRouter.get('/discord/:discordId', (req, res, next) => 
  userController.getUserByDiscordId(req, res, next)
);

// Link Discord to user
userRouter.post('/:uid/link-discord', (req, res, next) => 
  userController.linkDiscord(req, res, next)
);

// Delete user
userRouter.delete('/:uid', (req, res, next) => 
  userController.deleteUser(req, res, next)
);