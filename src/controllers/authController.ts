import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { generateToken } from '../middleware/auth';
import { AppError } from '../utils/AppError';

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Email and password are required.', 400);
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new AppError('Invalid email or password.', 401);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError('Invalid email or password.', 401);
        }

        const token = generateToken(user._id as unknown as string);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/register (admin only)
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Email already registered.', 409);
        }

        const user = await User.create({ name, email, password, role: role || 'viewer' });

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
    res.json({
        success: true,
        data: {
            id: req.user!._id,
            name: req.user!.name,
            email: req.user!.email,
            role: req.user!.role,
        },
    });
}

/**
 * PUT /api/auth/change-password
 */
export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new AppError('Current password and new password are required.', 400);
        }

        const user = await User.findById(req.user!._id).select('+password');
        if (!user) {
            throw new AppError('User not found.', 404);
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new AppError('Current password is incorrect.', 401);
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        next(error);
    }
}
