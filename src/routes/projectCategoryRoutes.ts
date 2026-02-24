import { Router } from 'express';
import {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/projectCategoryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     description: Retrieve all project categories with pagination
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create new category
 *     security:
 *       - bearerAuth: []
 *     description: Create a new project category (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Category created successfully
 */

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin routes
router.post('/', authenticate, authorize('admin'), createCategory);
router.put('/:id', authenticate, authorize('admin'), updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

export default router;
