import { Request, Response, NextFunction } from 'express';
import SiteSettings from '../models/SiteSettings';

/**
 * GET /api/settings
 */
export async function getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/settings
 */
export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create(req.body);
        } else {
            Object.assign(settings, req.body);
            await settings.save();
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/settings/hero
 */
export async function getHero(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const settings = await SiteSettings.findOne().select('hero companyName');
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/settings/contact
 */
export async function getContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const settings = await SiteSettings.findOne().select(
            'address contacts socialLinks workingHours mapEmbedUrl mapDirectionsUrl'
        );
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/settings/about
 */
export async function getAbout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const settings = await SiteSettings.findOne().select('about standards');
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
}
