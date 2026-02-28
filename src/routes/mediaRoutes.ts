import { Router } from 'express';
import { getMedia, uploadMedia, uploadMultipleMedia, deleteMedia } from '../controllers/mediaController';
import { authenticate, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All media routes require authentication
router.get('/', authenticate, requireRole('admin'), getMedia);
router.post('/upload', authenticate, requireRole('admin'), upload.single('file'), uploadMedia);
router.post('/upload-multiple', authenticate, requireRole('admin'), upload.array('files', 10), uploadMultipleMedia);
router.delete('/:id', authenticate, requireRole('admin'), deleteMedia);

export default router;
