import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../utils/AppError';

/**
 * GET /api/users
 */
export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/users
 */
export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
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
 * PUT /api/users/:id
 */
export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { name, email, role } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new AppError('User not found.', 404);
        }

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/users/:id
 */
export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Prevent deleting yourself
        if (req.params.id === (req.user!._id as any).toString()) {
            throw new AppError('You cannot delete your own account.', 400);
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            throw new AppError('User not found.', 404);
        }

        res.json({ success: true, message: 'User deleted.' });
    } catch (error) {
        next(error);
    }
}
