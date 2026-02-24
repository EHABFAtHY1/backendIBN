import { Router } from 'express';
import {
    getProjects,
    getAllProjects,
    getProject,
    getProjectsByCategory,
    createProject,
    updateProject,
    deleteProject,
} from '../controllers/projectController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get all projects
 *     description: Retrieve all projects with pagination
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create new project
 *     security:
 *       - bearerAuth: []
 *     description: Create a new project (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Project created successfully
 */

// Public routes
router.get('/', getProjects);
router.get('/category/:categoryId', getProjectsByCategory);
router.get('/:id', getProject);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), getAllProjects);
router.post('/', authenticate, authorize('admin'), createProject);
router.put('/:id', authenticate, authorize('admin'), updateProject);
router.delete('/:id', authenticate, authorize('admin'), deleteProject);

export default router;
