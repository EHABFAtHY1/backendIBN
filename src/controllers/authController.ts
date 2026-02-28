import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Session from '../models/Session';
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

        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            throw new AppError('Invalid email or password.', 401);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError('Invalid email or password.', 401);
        }

        // Create session (expires in 7 days)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const session = await Session.create({
            userId: user._id,
            expiresAt,
        });

        res.json({
            success: true,
            data: {
                token: session._id.toString(),
                user: {
                    id: user._id,
                    userName: user.userName,
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
        const { userName, email, password, role, tel, photo, yearsOfExp, descriptionAr, descriptionEn } = req.body;

        if (!userName || !password) {
            throw new AppError('Username and password are required.', 400);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Email already registered.', 409);
        }

        const user = await User.create({
            userName,
            email,
            passwordHash: password,
            role: role || 'user',
            tel,
            photo,
            yearsOfExp,
            descriptionAr,
            descriptionEn,
        });

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                userName: user.userName,
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
            userName: req.user!.userName,
            email: req.user!.email,
            role: req.user!.role,
            photo: req.user!.photo,
            tel: req.user!.tel,
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

        const user = await User.findById(req.user!._id).select('+passwordHash');
        if (!user) {
            throw new AppError('User not found.', 404);
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new AppError('Current password is incorrect.', 401);
        }

        user.passwordHash = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const sessionId = req.headers.authorization?.split(' ')[1];
        if (sessionId) {
            await Session.findByIdAndDelete(sessionId);
        }

        res.json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
        next(error);
    }
}
