import { Request, Response, NextFunction } from 'express';
import Department from '../models/Department';
import { AppError } from '../utils/AppError';

/**
 * GET /api/departments
 */
export async function getDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const departments = await Department.find({ isVisible: true }).sort({ order: 1 });
        res.json({ success: true, data: departments });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/departments/all (admin)
 */
export async function getAllDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const departments = await Department.find().sort({ order: 1 });
        res.json({ success: true, data: departments });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/departments
 */
export async function createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const department = await Department.create(req.body);
        res.status(201).json({ success: true, data: department });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/departments/:id
 */
export async function updateDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!department) {
            throw new AppError('Department not found.', 404);
        }
        res.json({ success: true, data: department });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/departments/:id
 */
export async function deleteDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            throw new AppError('Department not found.', 404);
        }
        res.json({ success: true, message: 'Department deleted.' });
    } catch (error) {
        next(error);
    }
}
