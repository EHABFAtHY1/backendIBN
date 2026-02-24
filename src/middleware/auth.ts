import { Request, Response, NextFunction } from 'express';
import User, { IUser, UserRole } from '../models/User';
import Session from '../models/Session';
import { AppError } from '../utils/AppError';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
            sessionId?: string;
        }
    }
}

/**
 * Middleware to verify session and attach user to request
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

        const sessionId = authHeader.split(' ')[1];

        // Find session
        const session = await Session.findById(sessionId).populate('userId');
        if (!session) {
            throw new AppError('Session not found or expired.', 401);
        }

        // Check if session has expired
        if (new Date() > session.expiresAt) {
            await Session.findByIdAndDelete(sessionId);
            throw new AppError('Session has expired.', 401);
        }

        // Get user from session
        const user = await User.findById(session.userId);
        if (!user) {
            throw new AppError('User not found.', 401);
        }

        req.user = user;
        req.sessionId = sessionId;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Invalid session.', 401));
        }
    }
}

/**
 * Middleware to check if user has the required role
 */
export function authorize(...roles: UserRole[]) {
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

// Keep backward compatibility
export function requireRole(...roles: UserRole[]) {
    return authorize(...roles);
}
