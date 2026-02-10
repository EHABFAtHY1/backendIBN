import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config';
import { AppError } from '../utils/AppError';

// Ensure uploads directory exists
const uploadDir = path.resolve(config.uploadDir);
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

const fileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg\+xml|svg/;
    const mimeOk = allowedTypes.test(file.mimetype);
    const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase().replace('.', ''));
    if (mimeOk || extOk) {
        cb(null, true);
    } else {
        cb(new AppError('Only image files are allowed (jpeg, jpg, png, gif, webp, svg).', 400) as any);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
