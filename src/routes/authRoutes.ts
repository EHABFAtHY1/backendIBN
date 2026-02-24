import { Router } from 'express';
import { login, register, getMe, changePassword, logout } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Login with email and password to get session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register new user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     description: Create a new user account. Only admins can register users.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Unauthorized
 */
router.post('/register', authenticate, authorize('admin'), register);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user
 *     security:
 *       - bearerAuth: []
 *     description: Get authenticated user information
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, getMe);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     tags:
 *       - Authentication
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     description: Change password for authenticated user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/change-password', authenticate, changePassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     description: Logout and invalidate session
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticate, logout);

export default router;
