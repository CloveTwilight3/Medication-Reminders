// src/api/controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { ApiResponse, CreateUserRequest, LinkDiscordRequest } from '../types';

export class UserController {
  // Create a new user (for PWA signup - not used with OAuth but kept for backwards compatibility)
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { createdVia, discordId }: CreateUserRequest = req.body;

      if (!createdVia || !['discord', 'pwa'].includes(createdVia)) {
        res.status(400).json({
          success: false,
          error: 'Invalid createdVia value. Must be "discord" or "pwa"'
        });
        return;
      }

      // If Discord ID provided, check if already exists
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

      const user = userService.createUser(createdVia, discordId);

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

  // Get user by UID
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

  // Get user by Discord ID
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

  // Link Discord ID to existing user (kept for manual linking if needed)
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

  // Delete user
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