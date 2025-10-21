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

// Helper to get cookie options
function getCookieOptions() {
  const isProduction = NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction, // Only use secure in production (requires HTTPS)
    sameSite: 'lax' as const, // Use 'lax' for same-site (PWA and API on same domain)
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/', // Available on all paths
    domain: undefined, // Let browser set it automatically
  };
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

      console.log('🔐 OAuth callback received');
      console.log('📍 Redirect URI:', DISCORD_REDIRECT_URI);
      console.log('📍 Frontend URL:', FRONTEND_URL);

      if (!code || typeof code !== 'string') {
        console.error('❌ No code provided in callback');
        res.redirect(`${FRONTEND_URL}/?error=no_code`);
        return;
      }

      // Exchange code for access token
      console.log('🔄 Exchanging code for token...');
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
        console.error('❌ Token exchange failed:', await tokenResponse.text());
        res.redirect(`${FRONTEND_URL}/?error=token_exchange_failed`);
        return;
      }

      const tokenData = await tokenResponse.json() as DiscordTokenResponse;
      const accessToken = tokenData.access_token;
      console.log('✅ Token received');

      // Get user info from Discord
      console.log('👤 Fetching user info...');
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        console.error('❌ User fetch failed:', await userResponse.text());
        res.redirect(`${FRONTEND_URL}/?error=user_fetch_failed`);
        return;
      }

      const discordUser = await userResponse.json() as DiscordUser;
      const discordId = discordUser.id;
      console.log('✅ User info received:', discordUser.username);

      // Check if user exists, if not create one
      let user = userService.getUserByDiscordId(discordId);
      
      if (!user) {
        user = userService.createUser('discord', discordId);
        console.log(`✅ Created new user for Discord ID: ${discordId}`);
      } else {
        console.log(`✅ Found existing user: ${user.uid}`);
      }

      // Store user session
      const sessionToken = userService.generateSessionToken(user.uid);
      const cookieOptions = getCookieOptions();
      
      console.log('🍪 Setting cookie with options:', {
        ...cookieOptions,
        token: sessionToken.substring(0, 10) + '...'
      });
      
      res.cookie('session_token', sessionToken, cookieOptions);

      console.log(`✅ Session cookie set for user ${user.uid}`);
      console.log(`🔀 Redirecting to: ${FRONTEND_URL}/dashboard`);

      // Redirect to frontend dashboard
      res.redirect(`${FRONTEND_URL}/dashboard`);
    } catch (error) {
      console.error('❌ Discord OAuth error:', error);
      res.redirect(`${FRONTEND_URL}/?error=auth_failed`);
    }
  }

  // Logout
  logout(req: Request, res: Response, next: NextFunction): void {
    try {
      res.clearCookie('session_token', getCookieOptions());

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
      console.log('🔍 Request origin:', req.headers.origin);
      console.log('🔍 Request host:', req.headers.host);

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
        res.clearCookie('session_token', getCookieOptions());
        res.status(401).json({
          success: false,
          error: 'Invalid or expired session'
        });
        return;
      }

      const user = userService.getUser(uid);

      if (!user) {
        console.log('❌ User not found for uid:', uid);
        res.clearCookie('session_token', getCookieOptions());
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