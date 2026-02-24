import { Router } from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve all users with pagination (admin only)
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *   post:
 *     tags:
 *       - Users
 *     summary: Create new user
 *     security:
 *       - bearerAuth: []
 *     description: Create a new user (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: User created successfully
 */

// All user management routes require admin
router.get('/', authenticate, authorize('admin'), getUsers);
router.get('/:id', authenticate, authorize('admin'), getUser);
router.post('/', authenticate, authorize('admin'), createUser);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;
