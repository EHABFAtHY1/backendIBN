import { Router } from 'express';
import {
    getSettings,
    updateSettings,
    getHero,
    getContact,
    getAbout,
} from '../controllers/settingsController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getSettings);
router.get('/hero', getHero);
router.get('/contact', getContact);
router.get('/about', getAbout);

// Admin routes
router.put('/', authenticate, requireRole('admin'), updateSettings);

export default router;
