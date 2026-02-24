import { Router } from 'express';
import {
    getServices,
    getAllServices,
    getServiceBySlug,
    createService,
    updateService,
    deleteService,
} from '../controllers/serviceController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getServices);
router.get('/:slug', getServiceBySlug);

// Admin routes
router.get('/admin/all', authenticate, requireRole('admin'), getAllServices);
router.post('/', authenticate, requireRole('admin'), createService);
router.put('/:id', authenticate, requireRole('admin'), updateService);
router.delete('/:id', authenticate, requireRole('admin'), deleteService);

export default router;
