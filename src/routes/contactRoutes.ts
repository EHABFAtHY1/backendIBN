import { Router } from 'express';
import {
    submitContactMessage,
    getAllContactMessages,
    getContactMessageById,
    updateContactMessageStatus,
    deleteContactMessage,
    getContactStats,
} from '../controllers/contactController';
import { validate } from '../middleware/validate';
import { authenticate, requireRole } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

/**
 * @route   POST /api/contact
 * @desc    Submit a contact message
 * @access  Public
 */
router.post(
    '/',
    validate([
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required')
            .isLength({ min: 2 })
            .withMessage('Name must be at least 2 characters'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Please provide a valid email address'),
        body('phone')
            .trim()
            .notEmpty()
            .withMessage('Phone number is required')
            .isLength({ min: 7 })
            .withMessage('Phone number must be at least 7 characters'),
        body('subject')
            .trim()
            .notEmpty()
            .withMessage('Subject is required')
            .isLength({ min: 3 })
            .withMessage('Subject must be at least 3 characters'),
        body('message')
            .trim()
            .notEmpty()
            .withMessage('Message is required')
            .isLength({ min: 10 })
            .withMessage('Message must be at least 10 characters'),
    ]),
    submitContactMessage
);

/**
 * @route   GET /api/contact/stats/overview
 * @desc    Get contact messages statistics
 * @access  Private/Admin
 */
router.get('/stats/overview', authenticate, requireRole('admin'), getContactStats);

/**
 * @route   GET /api/contact
 * @desc    Get all contact messages
 * @access  Private/Admin
 */
router.get('/', authenticate, requireRole('admin'), getAllContactMessages);

/**
 * @route   GET /api/contact/:id
 * @desc    Get single contact message
 * @access  Private/Admin
 */
router.get('/:id', authenticate, requireRole('admin'), getContactMessageById);

/**
 * @route   PATCH /api/contact/:id
 * @desc    Update contact message status
 * @access  Private/Admin
 */
router.patch(
    '/:id',
    authenticate,
    requireRole('admin'),
    validate([
        body('status')
            .isIn(['new', 'read', 'replied'])
            .withMessage('Invalid status'),
    ]),
    updateContactMessageStatus
);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Delete contact message
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, requireRole('admin'), deleteContactMessage);

export default router;
