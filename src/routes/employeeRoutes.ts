import { Router } from 'express';
import {
    getMyProfile,
    getEmployeeDirectory,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    updateEmployeeProjects,
} from '../controllers/employeeController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /employees/directory:
 *   get:
 *     tags:
 *       - Employees
 *     summary: Get employee directory (public)
 *     security: []
 *     description: View list of all active employees with public information
 *     responses:
 *       200:
 *         description: Employee directory
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 */
router.get('/directory', getEmployeeDirectory);

/**
 * @swagger
 * /employees/me:
 *   get:
 *     tags:
 *       - Employees
 *     summary: Get my employee profile
 *     description: View your own employee profile with personal information (requires login)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Your employee profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee profile not found
 */
router.get('/me', authenticate, getMyProfile);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     tags:
 *       - Employees
 *     summary: Get employee public profile
 *     security: []
 *     description: View a single employee's public information
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 */
router.get('/:id', getEmployee);

/**
 * @swagger
 * /employees:
 *   post:
 *     tags:
 *       - Employees
 *     summary: Create new employee (admin only)
 *     description: Create a new employee with user account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmployeeInput'
 *     responses:
 *       201:
 *         description: Employee created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, requireRole('admin'), createEmployee);

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     tags:
 *       - Employees
 *     summary: Update employee (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmployeeInput'
 *     responses:
 *       200:
 *         description: Employee updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 */
router.put('/:id', authenticate, requireRole('admin'), updateEmployee);

/**
 * @swagger
 * /employees/{id}/projects:
 *   put:
 *     tags:
 *       - Employees
 *     summary: Update employee projects (admin only)
 *     description: Add or update projects assigned to employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectIds
 *             properties:
 *               projectIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of Project IDs
 *     responses:
 *       200:
 *         description: Projects updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 */
router.put('/:id/projects', authenticate, requireRole('admin'), updateEmployeeProjects);

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     tags:
 *       - Employees
 *     summary: Delete employee (admin only)
 *     description: Delete employee and their user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Employee not found
 */
router.delete('/:id', authenticate, requireRole('admin'), deleteEmployee);

export default router;
