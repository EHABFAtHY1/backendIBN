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

/**
 * @swagger
 * /departments:
 *   get:
 *     tags:
 *       - Departments
 *     summary: Get visible departments (public)
 *     security: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: size
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           default: order
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Department'
 *   post:
 *     tags:
 *       - Departments
 *     summary: Create new department (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDepartmentInput'
 *     responses:
 *       201:
 *         description: Department created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /departments/admin/all:
 *   get:
 *     tags:
 *       - Departments
 *     summary: Get all departments including hidden (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: size
 *         in: query
 *         schema:
 *           type: integer
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All departments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Department'
 */

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     tags:
 *       - Departments
 *     summary: Update department (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDepartmentInput'
 *     responses:
 *       200:
 *         description: Department updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       404:
 *         description: Department not found
 *   delete:
 *     tags:
 *       - Departments
 *     summary: Delete department (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Department deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Department not found
 */

// Public routes
router.get('/', getDepartments);

// Admin routes
router.get('/admin/all', authenticate, requireRole('admin'), getAllDepartments);
router.post('/', authenticate, requireRole('admin'), createDepartment);
router.put('/:id', authenticate, requireRole('admin'), updateDepartment);
router.delete('/:id', authenticate, requireRole('admin'), deleteDepartment);

export default router;
