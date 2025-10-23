/** src/api/controllers/userController.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { ApiResponse, CreateUserRequest, LinkDiscordRequest, UpdateUserRequest } from '../types';

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { createdVia, discordId, timezone }: CreateUserRequest = req.body;

      if (!createdVia || !['discord', 'pwa'].includes(createdVia)) {
        res.status(400).json({
          success: false,
          error: 'Invalid createdVia value. Must be "discord" or "pwa"'
        });
        return;
      }

      if (discordId) {
        const existing = userService.getUserByDiscordId(discordId);
        if (existing) {
          res.status(400).json({
            success: false,
            error: 'Discord ID already registered'
          });
          return;
        }
      }

      const user = userService.createUser(createdVia, discordId, timezone);

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { uid } = req.params;
      const user = userService.getUser(uid);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserByDiscordId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { discordId } = req.params;
      const user = userService.getUserByDiscordId(discordId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateUserSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { uid } = req.params;
      const updates: UpdateUserRequest = req.body;

      const user = userService.updateUser(uid, updates);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Settings updated successfully'
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async linkDiscord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { uid } = req.params;
      const { discordId }: LinkDiscordRequest = req.body;

      if (!discordId) {
        res.status(400).json({
          success: false,
          error: 'Discord ID is required'
        });
        return;
      }

      const user = userService.linkDiscordToUser(uid, discordId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'Discord account linked successfully'
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { uid } = req.params;
      const success = userService.deleteUser(uid);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully'
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();