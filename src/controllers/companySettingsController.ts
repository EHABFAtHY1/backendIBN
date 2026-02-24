import { Request, Response, NextFunction } from 'express';
import CompanySettings from '../models/CompanySettings';
import { AppError } from '../utils/AppError';

/**
 * GET /api/company-settings
 * Get all company settings (public)
 */
export async function getCompanySettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const settings = await CompanySettings.findOne();

        if (!settings) {
            throw new AppError('Company settings not found.', 404);
        }

        res.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/company-settings
 * Update company settings (admin only)
 */
export async function updateCompanySettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const allowedFields = [
            'nameAr',
            'nameEn',
            'yearsExperience',
            'clientsCount',
            'projectsCount',
            'satisfiedClientsCount',
            'successPercentage',
            'valuesAr',
            'valuesEn',
            'ourSeenAr',
            'ourSeenEn',
            'telephone',
            'email',
            'addressAr',
            'addressEn',
            'addressUrl',
            'logo',
        ];

        const updateData: any = {};
        allowedFields.forEach((field) => {
            if ((req.body as any)[field] !== undefined) {
                updateData[field] = (req.body as any)[field];
            }
        });

        let settings = await CompanySettings.findOne();

        if (!settings) {
            // Create new if doesn't exist
            settings = await CompanySettings.create(updateData);
        } else {
            // Update existing
            Object.assign(settings, updateData);
            await settings.save();
        }

        res.json({
            success: true,
            data: settings,
            message: 'Company settings updated successfully.',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/company-settings
 * Create company settings (admin only) - if not exists
 */
export async function createCompanySettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const existingSettings = await CompanySettings.findOne();
        if (existingSettings) {
            throw new AppError('Company settings already exist. Use PUT to update.', 409);
        }

        const {
            nameAr,
            nameEn,
            yearsExperience,
            clientsCount,
            projectsCount,
            satisfiedClientsCount,
            successPercentage,
            valuesAr,
            valuesEn,
            ourSeenAr,
            ourSeenEn,
            telephone,
            email,
            addressAr,
            addressEn,
            addressUrl,
            logo,
        } = req.body;

        const requiredFields = [
            'nameAr',
            'nameEn',
            'yearsExperience',
            'ourSeenAr',
            'ourSeenEn',
            'telephone',
            'email',
            'addressAr',
            'addressEn',
            'addressUrl',
            'logo',
        ];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new AppError(`Missing required field: ${field}`, 400);
            }
        }

        const settings = await CompanySettings.create({
            nameAr,
            nameEn,
            yearsExperience,
            clientsCount,
            projectsCount,
            satisfiedClientsCount,
            successPercentage,
            valuesAr,
            valuesEn,
            ourSeenAr,
            ourSeenEn,
            telephone,
            email,
            addressAr,
            addressEn,
            addressUrl,
            logo,
        });

        res.status(201).json({
            success: true,
            data: settings,
            message: 'Company settings created successfully.',
        });
    } catch (error) {
        next(error);
    }
}
