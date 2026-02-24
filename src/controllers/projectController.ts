import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project';
import Category from '../models/ProjectCategory';
import { AppError } from '../utils/AppError';

/**
 * GET /api/projects
 * Get all projects with pagination
 */
export async function getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const projects = await Project.find()
            .populate('categoryId')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Project.countDocuments();

        res.json({
            success: true,
            data: projects,
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
 * GET /api/projects/:id
 * Get single project by ID
 */
export async function getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const project = await Project.findById(req.params.id).populate('categoryId');

        if (!project) {
            throw new AppError('Project not found.', 404);
        }

        res.json({
            success: true,
            data: project,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/projects/category/:categoryId
 * Get projects by category
 */
export async function getProjectsByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const projects = await Project.find({ categoryId: req.params.categoryId }).populate('categoryId');

        res.json({
            success: true,
            data: projects,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/projects
 * Create new project (admin only)
 */
export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const {
            titleAr,
            titleEn,
            locationAr,
            locationEn,
            descriptionAr,
            descriptionEn,
            fullDescriptionAr,
            fullDescriptionEn,
            durationAr,
            durationEn,
            teamAr,
            teamEn,
            area,
            status,
            categoryId,
            techStack,
            gallery,
        } = req.body;

        // Validate required fields
        if (
            !titleAr ||
            !titleEn ||
            !locationAr ||
            !locationEn ||
            !descriptionAr ||
            !descriptionEn ||
            !categoryId ||
            !status
        ) {
            throw new AppError('Missing required fields.', 400);
        }

        // Verify category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new AppError('Category not found.', 404);
        }

        const project = await Project.create({
            titleAr,
            titleEn,
            locationAr,
            locationEn,
            descriptionAr,
            descriptionEn,
            fullDescriptionAr: fullDescriptionAr || descriptionAr,
            fullDescriptionEn: fullDescriptionEn || descriptionEn,
            durationAr,
            durationEn,
            teamAr,
            teamEn,
            area,
            status,
            categoryId,
            techStack: techStack || [],
            gallery: gallery || [],
        });

        await project.populate('categoryId');

        res.status(201).json({
            success: true,
            data: project,
            message: 'Project created successfully.',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/projects/:id
 * Update project (admin only)
 */
export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const allowedFields = [
            'titleAr',
            'titleEn',
            'locationAr',
            'locationEn',
            'descriptionAr',
            'descriptionEn',
            'fullDescriptionAr',
            'fullDescriptionEn',
            'durationAr',
            'durationEn',
            'teamAr',
            'teamEn',
            'area',
            'status',
            'categoryId',
            'techStack',
            'gallery',
        ];

        const updateData: any = {};
        allowedFields.forEach((field) => {
            if ((req.body as any)[field] !== undefined) {
                updateData[field] = (req.body as any)[field];
            }
        });

        const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).populate('categoryId');

        if (!project) {
            throw new AppError('Project not found.', 404);
        }

        res.json({
            success: true,
            data: project,
            message: 'Project updated successfully.',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/projects/:id
 * Delete project (admin only)
 */
export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            throw new AppError('Project not found.', 404);
        }

        res.json({
            success: true,
            message: 'Project deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/projects/all
 * Admin - Get all projects including hidden ones
 */
export async function getAllProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const projects = await Project.find()
            .populate('categoryId')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Project.countDocuments();

        res.json({
            success: true,
            data: projects,
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
