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

// Public routes - Anyone can view employee directory
/**
 * @swagger
 * /employees/directory:
 *   get:
 *     tags:
 *       - Employees
 *     summary: Get employee directory
 *     description: View list of all active employees with public information
 *     responses:
 *       200:
 *         description: Employee directory
 */
router.get('/directory', getEmployeeDirectory);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     tags:
 *       - Employees
 *     summary: Get employee public profile
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
 */
router.get('/:id', getEmployee);

// Protected routes - Employees can view their own full profile
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
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, getMyProfile);

// Admin routes - All CRUD operations
/**
 * @swagger
 * /employees:
 *   post:
 *     tags:
 *       - Employees
 *     summary: Create new employee
 *     description: Create a new employee with user account (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - phoneNumber
 *               - employeeId
 *               - position
 *               - department
 *               - hireDate
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               employeeId:
 *                 type: string
 *               position:
 *                 type: string
 *                 enum: [engineer, technician, supervisor, manager]
 *               department:
 *                 type: string
 *               hireDate:
 *                 type: string
 *                 format: date
 *               skills:
 *                 type: array
 *               salary:
 *                 type: number
 *     responses:
 *       201:
 *         description: Employee created
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
 *     summary: Update employee
 *     description: Update employee information (Admin only)
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
 *     responses:
 *       200:
 *         description: Employee updated
 */
router.put('/:id', authenticate, requireRole('admin'), updateEmployee);

/**
 * @swagger
 * /employees/{id}/projects:
 *   put:
 *     tags:
 *       - Employees
 *     summary: Update employee projects
 *     description: Add or update projects assigned to employee (Admin only)
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
 *             properties:
 *               projectIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Projects updated
 */
router.put('/:id/projects', authenticate, requireRole('admin'), updateEmployeeProjects);

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     tags:
 *       - Employees
 *     summary: Delete employee
 *     description: Delete employee and their user account (Admin only)
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
 */
router.delete('/:id', authenticate, requireRole('admin'), deleteEmployee);

export default router;
