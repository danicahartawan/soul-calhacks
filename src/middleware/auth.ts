import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../database/supabase';
import { ApiError } from '../types';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email?: string;
            };
        }
    }
}

/**
 * Authentication middleware for Supabase JWT tokens
 */
export async function authenticateToken(
    req: Request,
    res: Response<ApiError>,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'No token provided',
                statusCode: 401
            });
            return;
        }

        const user = await verifyToken(token);

        if (!user) {
            res.status(401).json({
                error: 'Invalid token',
                message: 'Token verification failed',
                statusCode: 401
            });
            return;
        }

        // Add user info to request object
        req.user = {
            id: user.id,
            email: user.email
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            error: 'Authentication failed',
            message: 'Token verification error',
            statusCode: 401
        });
    }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export async function optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const user = await verifyToken(token);
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email
                };
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        // Continue without authentication
        next();
    }
}

/**
 * Middleware to check if user has a profile
 */
export async function requireProfile(
    req: Request,
    res: Response<ApiError>,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'User not authenticated',
                statusCode: 401
            });
            return;
        }

        // Check if user has a profile
        const { supabase } = await import('../database/supabase');
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', req.user.id)
            .single();

        if (error || !profile) {
            res.status(404).json({
                error: 'Profile not found',
                message: 'User profile does not exist',
                statusCode: 404
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Profile check error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to verify user profile',
            statusCode: 500
        });
    }
}
