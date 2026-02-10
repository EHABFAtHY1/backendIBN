import { Router } from 'express';
import {
    getCategories,
    getAllCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/projectCategoryController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin routes
router.get('/admin/all', authenticate, requireRole('admin', 'editor'), getAllCategories);
router.post('/', authenticate, requireRole('admin', 'editor'), createCategory);
router.put('/:id', authenticate, requireRole('admin', 'editor'), updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), deleteCategory);

export default router;
