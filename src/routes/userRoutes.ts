import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All user management routes require admin
router.get('/', authenticate, requireRole('admin'), getUsers);
router.post('/', authenticate, requireRole('admin'), createUser);
router.put('/:id', authenticate, requireRole('admin'), updateUser);
router.delete('/:id', authenticate, requireRole('admin'), deleteUser);

export default router;
