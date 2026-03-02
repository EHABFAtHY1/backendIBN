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
 * @swagger
 * /contact:
 *   post:
 *     tags:
 *       - Contact
 *     summary: Submit a contact message (public)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContactMessageInput'
 *     responses:
 *       201:
 *         description: Message submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ContactMessage'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     tags:
 *       - Contact
 *     summary: Get all contact messages (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [new, read, replied]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Contact messages retrieved
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
 *                     $ref: '#/components/schemas/ContactMessage'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /contact/stats/overview:
 *   get:
 *     tags:
 *       - Contact
 *     summary: Get contact message statistics (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     new:
 *                       type: integer
 *                     read:
 *                       type: integer
 *                     replied:
 *                       type: integer
 */

/**
 * @swagger
 * /contact/{id}:
 *   get:
 *     tags:
 *       - Contact
 *     summary: Get single contact message (admin only)
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
 *         description: Message retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ContactMessage'
 *       404:
 *         description: Message not found
 *   patch:
 *     tags:
 *       - Contact
 *     summary: Update contact message status (admin only)
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
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, read, replied]
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ContactMessage'
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Message not found
 *   delete:
 *     tags:
 *       - Contact
 *     summary: Delete contact message (admin only)
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
 *         description: Message deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Message not found
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

router.get('/stats/overview', authenticate, requireRole('admin'), getContactStats);
router.get('/', authenticate, requireRole('admin'), getAllContactMessages);
router.get('/:id', authenticate, requireRole('admin'), getContactMessageById);

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

router.delete('/:id', authenticate, requireRole('admin'), deleteContactMessage);

export default router;
