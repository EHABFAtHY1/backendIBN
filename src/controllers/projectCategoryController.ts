import { Request, Response, NextFunction } from 'express';
import ProjectCategory from '../models/ProjectCategory';
import Project from '../models/Project';
import { AppError } from '../utils/AppError';

/**
 * GET /api/project-categories
 */
export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const categories = await ProjectCategory.find({ isVisible: true }).sort({ order: 1 });
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/project-categories/all (admin — includes hidden)
 */
export async function getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const categories = await ProjectCategory.find().sort({ order: 1 });
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/project-categories/:slug
 */
export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const category = await ProjectCategory.findOne({ slug: req.params.slug });
        if (!category) {
            throw new AppError('Category not found.', 404);
        }

        const projects = await Project.find({
            category: category.slug,
            isVisible: true,
        }).sort({ order: 1 });

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
 * POST /api/project-categories
 */
export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const category = await ProjectCategory.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/project-categories/:id
 */
export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const category = await ProjectCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!category) {
            throw new AppError('Category not found.', 404);
        }
        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/project-categories/:id
 */
export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const category = await ProjectCategory.findByIdAndDelete(req.params.id);
        if (!category) {
            throw new AppError('Category not found.', 404);
        }
        res.json({ success: true, message: 'Category deleted.' });
    } catch (error) {
        next(error);
    }
}
