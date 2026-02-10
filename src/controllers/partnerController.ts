import { Request, Response, NextFunction } from 'express';
import Partner from '../models/Partner';
import { AppError } from '../utils/AppError';

/**
 * GET /api/partners
 */
export async function getPartners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const partners = await Partner.find({ isVisible: true }).sort({ order: 1 });
        res.json({ success: true, data: partners });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/partners/all (admin)
 */
export async function getAllPartners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const partners = await Partner.find().sort({ order: 1 });
        res.json({ success: true, data: partners });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/partners
 */
export async function createPartner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const partner = await Partner.create(req.body);
        res.status(201).json({ success: true, data: partner });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/partners/:id
 */
export async function updatePartner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!partner) {
            throw new AppError('Partner not found.', 404);
        }
        res.json({ success: true, data: partner });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/partners/:id
 */
export async function deletePartner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const partner = await Partner.findByIdAndDelete(req.params.id);
        if (!partner) {
            throw new AppError('Partner not found.', 404);
        }
        res.json({ success: true, message: 'Partner deleted.' });
    } catch (error) {
        next(error);
    }
}
