import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User, { IUser, UserRole } from '../models/User';
import { AppError } from '../utils/AppError';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Access denied. No token provided.', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError('User not found.', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Invalid token.', 401));
        }
    }
}

/**
 * Middleware to check if user has the required role
 */
export function requireRole(...roles: UserRole[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new AppError('Authentication required.', 401));
        }
        if (!roles.includes(req.user.role as UserRole)) {
            return next(new AppError('Insufficient permissions.', 403));
        }
        next();
    };
}

/**
 * Generate JWT token for a user
 */
export function generateToken(userId: string): string {
    return jwt.sign({ id: userId }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
}
