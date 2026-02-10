import { Router } from 'express';
import {
    getDepartments,
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from '../controllers/departmentController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getDepartments);

// Admin routes
router.get('/admin/all', authenticate, requireRole('admin', 'editor'), getAllDepartments);
router.post('/', authenticate, requireRole('admin', 'editor'), createDepartment);
router.put('/:id', authenticate, requireRole('admin', 'editor'), updateDepartment);
router.delete('/:id', authenticate, requireRole('admin'), deleteDepartment);

export default router;
