import { Request, Response, NextFunction } from 'express';
import ProjectCategory from '../models/ProjectCategory';
import Project from '../models/Project';
import { AppError } from '../utils/AppError';

/**
 * GET /api/categories
 * Get all categories with pagination
 */
export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const categories = await ProjectCategory.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await ProjectCategory.countDocuments();

        res.json({
            success: true,
            data: categories,
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
 * GET /api/categories/:id
 * Get single category by ID
 */
export async function getCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const category = await ProjectCategory.findById(req.params.id);

        if (!category) {
            throw new AppError('Category not found.', 404);
        }

        // Get projects in this category
        const projects = await Project.find({ categoryId: req.params.id });

        res.json({
            success: true,
            data: {
                category,
                projects,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/categories
 * Create new category (admin only)
 */
export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { titleAr, titleEn, descriptionAr, descriptionEn, color, countAr, countEn } = req.body;

        if (!titleAr || !titleEn || !descriptionAr || !descriptionEn || !color) {
            throw new AppError('Missing required fields.', 400);
        }

        const category = await ProjectCategory.create({
            titleAr,
            titleEn,
            descriptionAr,
            descriptionEn,
            color,
            countAr: countAr || '0',
            countEn: countEn || '0',
        });

        res.status(201).json({
            success: true,
            data: category,
            message: 'Category created successfully.',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/categories/:id
 * Update category (admin only)
 */
export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const allowedFields = ['titleAr', 'titleEn', 'descriptionAr', 'descriptionEn', 'color', 'countAr', 'countEn'];

        const updateData: any = {};
        allowedFields.forEach((field) => {
            if ((req.body as any)[field] !== undefined) {
                updateData[field] = (req.body as any)[field];
            }
        });

        const category = await ProjectCategory.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!category) {
            throw new AppError('Category not found.', 404);
        }

        res.json({
            success: true,
            data: category,
            message: 'Category updated successfully.',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/categories/:id
 * Delete category (admin only)
 */
export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const category = await ProjectCategory.findByIdAndDelete(req.params.id);

        if (!category) {
            throw new AppError('Category not found.', 404);
        }

        res.json({
            success: true,
            message: 'Category deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
}
if (!category) {
    throw new AppError('Category not found.', 404);
}
res.json({ success: true, message: 'Category deleted.' });
    } catch (error) {
    next(error);
}
}
