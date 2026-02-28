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
router.get('/admin/all', authenticate, requireRole('admin'), getAllDepartments);
router.post('/', authenticate, requireRole('admin'), createDepartment);
router.put('/:id', authenticate, requireRole('admin'), updateDepartment);
router.delete('/:id', authenticate, requireRole('admin'), deleteDepartment);

export default router;
