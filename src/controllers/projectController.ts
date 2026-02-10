import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project';
import { AppError } from '../utils/AppError';

/**
 * GET /api/projects
 * Query params: category, status, isWorking, lang, page, limit
 */
export async function getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { category, isWorking, page = '1', limit = '50' } = req.query;

        const filter: any = { isVisible: true };
        if (category) filter.category = category;
        if (isWorking === 'true') filter.isWorking = true;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const [projects, total] = await Promise.all([
            Project.find(filter)
                .sort({ order: 1, createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Project.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: projects,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/projects/all (admin — includes hidden)
 */
export async function getAllProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { category } = req.query;
        const filter: any = {};
        if (category) filter.category = category;

        const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: projects });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/projects/:id
 */
export async function getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            throw new AppError('Project not found.', 404);
        }
        res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/projects
 */
export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const project = await Project.create(req.body);
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/projects/:id
 */
export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!project) {
            throw new AppError('Project not found.', 404);
        }
        res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/projects/:id
 */
export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            throw new AppError('Project not found.', 404);
        }
        res.json({ success: true, message: 'Project deleted.' });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/projects/:id/visibility
 */
export async function toggleVisibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            throw new AppError('Project not found.', 404);
        }
        project.isVisible = !project.isVisible;
        await project.save();
        res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
}

/**
 * PATCH /api/projects/:id/order
 */
export async function updateOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { order } = req.body;
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { order },
            { new: true }
        );
        if (!project) {
            throw new AppError('Project not found.', 404);
        }
        res.json({ success: true, data: project });
    } catch (error) {
        next(error);
    }
}
