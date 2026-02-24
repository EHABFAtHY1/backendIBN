import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../utils/AppError';

/**
 * GET /api/users
 * Get all users with pagination (admin only)
 */
export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-passwordHash')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/users/:id
 * Get single user by ID
 */
export async function getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');

        if (!user) {
            throw new AppError('User not found.', 404);
        }

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/users
 * Create new user (admin only)
 */
export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { userName, email, passwordHash, role, tel, photo, yearsOfExp, descriptionAr, descriptionEn } = req.body;

        if (!userName || !passwordHash) {
            throw new AppError('Username and password are required.', 400);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Email already registered.', 409);
        }

        const user = await User.create({
            userName,
            email,
            passwordHash,
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
            message: 'User created successfully.',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/users/:id
 * Update user (admin only)
 */
export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const allowedFields = [
            'userName',
            'email',
            'role',
            'tel',
            'photo',
            'yearsOfExp',
            'descriptionAr',
            'descriptionEn',
        ];

        const updateData: any = {};
        allowedFields.forEach((field) => {
            if ((req.body as any)[field] !== undefined) {
                updateData[field] = (req.body as any)[field];
            }
        });

        const user = await User.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).select('-passwordHash');

        if (!user) {
            throw new AppError('User not found.', 404);
        }

        res.json({
            success: true,
            data: user,
            message: 'User updated successfully.',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
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

        res.json({
            success: true,
            message: 'User deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
}
