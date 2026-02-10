import { Request, Response, NextFunction } from 'express';
import Service from '../models/Service';
import { AppError } from '../utils/AppError';

/**
 * GET /api/services
 */
export async function getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const services = await Service.find({ isVisible: true }).sort({ order: 1 });
        res.json({ success: true, data: services });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/services/all (admin)
 */
export async function getAllServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const services = await Service.find().sort({ order: 1 });
        res.json({ success: true, data: services });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/services/:slug
 */
export async function getServiceBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const service = await Service.findOne({ slug: req.params.slug });
        if (!service) {
            throw new AppError('Service not found.', 404);
        }
        res.json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/services
 */
export async function createService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/services/:id
 */
export async function updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!service) {
            throw new AppError('Service not found.', 404);
        }
        res.json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/services/:id
 */
export async function deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            throw new AppError('Service not found.', 404);
        }
        res.json({ success: true, message: 'Service deleted.' });
    } catch (error) {
        next(error);
    }
}
