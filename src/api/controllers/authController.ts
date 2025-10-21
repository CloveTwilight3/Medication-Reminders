// src/api/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { ApiResponse } from '../types';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Add interfaces for Discord API responses
interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

export class AuthController {
  // Generate Discord OAuth URL
  getDiscordAuthUrl(req: Request, res: Response, next: NextFunction): void {
    try {
      const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;

      const response: ApiResponse = {
        success: true,
        data: { url: authUrl }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Handle Discord OAuth callback
  async handleDiscordCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        res.redirect(`${FRONTEND_URL}/?error=no_code`);
        return;
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: DISCORD_REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', await tokenResponse.text());
        res.redirect(`${FRONTEND_URL}/?error=token_exchange_failed`);
        return;
      }

      const tokenData = await tokenResponse.json() as DiscordTokenResponse;
      const accessToken = tokenData.access_token;

      // Get user info from Discord
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        console.error('User fetch failed:', await userResponse.text());
        res.redirect(`${FRONTEND_URL}/?error=user_fetch_failed`);
        return;
      }

      const discordUser = await userResponse.json() as DiscordUser;
      const discordId = discordUser.id;

      // Check if user exists, if not create one
      let user = userService.getUserByDiscordId(discordId);
      
      if (!user) {
        user = userService.createUser('discord', discordId);
        console.log(`✅ Created new user for Discord ID: ${discordId}`);
      }

      // Store user session (using simple cookie-based session)
      const sessionToken = userService.generateSessionToken(user.uid);
      
      // FIX: More permissive cookie settings
      res.cookie('session_token', sessionToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/', // Ensure cookie is available for all paths
      });

      console.log(`✅ Set session cookie for user ${user.uid}`);

      // Redirect to frontend dashboard
      res.redirect(`${FRONTEND_URL}/dashboard`);
    } catch (error) {
      console.error('Discord OAuth error:', error);
      res.redirect(`${FRONTEND_URL}/?error=auth_failed`);
    }
  }

  // Logout
  logout(req: Request, res: Response, next: NextFunction): void {
    try {
      res.clearCookie('session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      });

      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully'
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get current user from session
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionToken = req.cookies?.session_token;

      console.log('🔍 Auth check - Cookie received:', !!sessionToken);
      console.log('🔍 All cookies:', Object.keys(req.cookies || {}));

      if (!sessionToken) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
        return;
      }

      const uid = userService.validateSessionToken(sessionToken);

      if (!uid) {
        console.log('❌ Invalid or expired session token');
        res.clearCookie('session_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          path: '/',
        });
        res.status(401).json({
          success: false,
          error: 'Invalid or expired session'
        });
        return;
      }

      const user = userService.getUser(uid);

      if (!user) {
        console.log('❌ User not found for uid:', uid);
        res.clearCookie('session_token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          path: '/',
        });
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      console.log('✅ User authenticated:', uid);

      const response: ApiResponse = {
        success: true,
        data: { uid, user }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();