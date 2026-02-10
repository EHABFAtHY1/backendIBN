import { Request, Response, NextFunction } from 'express';
import Media from '../models/Media';
import { AppError } from '../utils/AppError';
import fs from 'fs';
import path from 'path';
import config from '../config';

/**
 * GET /api/media
 */
export async function getMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const [media, total] = await Promise.all([
            Media.find()
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum),
            Media.countDocuments(),
        ]);

        res.json({
            success: true,
            data: media,
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
 * POST /api/media/upload
 */
export async function uploadMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (!req.file) {
            throw new AppError('No file uploaded.', 400);
        }

        const media = await Media.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            url: `/uploads/${req.file.filename}`,
            mimeType: req.file.mimetype,
            size: req.file.size,
            alt: req.body.alt || '',
        });

        res.status(201).json({ success: true, data: media });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/media/upload-multiple
 */
export async function uploadMultipleMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            throw new AppError('No files uploaded.', 400);
        }

        const mediaItems = await Promise.all(
            files.map((file) =>
                Media.create({
                    filename: file.filename,
                    originalName: file.originalname,
                    url: `/uploads/${file.filename}`,
                    mimeType: file.mimetype,
                    size: file.size,
                    alt: '',
                })
            )
        );

        res.status(201).json({ success: true, data: mediaItems });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/media/:id
 */
export async function deleteMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            throw new AppError('Media not found.', 404);
        }

        // Delete file from disk
        const filePath = path.join(config.uploadDir, media.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Media.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Media deleted.' });
    } catch (error) {
        next(error);
    }
}
