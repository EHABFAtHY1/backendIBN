import { Router } from 'express';
import {
    getProjects,
    getAllProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    toggleVisibility,
    updateOrder,
} from '../controllers/projectController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);

// Admin routes
router.get('/admin/all', authenticate, requireRole('admin', 'editor'), getAllProjects);
router.post('/', authenticate, requireRole('admin', 'editor'), createProject);
router.put('/:id', authenticate, requireRole('admin', 'editor'), updateProject);
router.delete('/:id', authenticate, requireRole('admin'), deleteProject);
router.patch('/:id/visibility', authenticate, requireRole('admin', 'editor'), toggleVisibility);
router.patch('/:id/order', authenticate, requireRole('admin', 'editor'), updateOrder);

export default router;
