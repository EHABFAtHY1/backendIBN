import { Router } from 'express';
import {
    getPartners,
    getAllPartners,
    createPartner,
    updatePartner,
    deletePartner,
} from '../controllers/partnerController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /partners:
 *   get:
 *     tags:
 *       - Partners
 *     summary: Get visible partners (public)
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
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           default: order
 *     responses:
 *       200:
 *         description: Partners retrieved successfully
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
 *                         $ref: '#/components/schemas/Partner'
 *   post:
 *     tags:
 *       - Partners
 *     summary: Create new partner (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePartnerInput'
 *     responses:
 *       201:
 *         description: Partner created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /partners/admin/all:
 *   get:
 *     tags:
 *       - Partners
 *     summary: Get all partners including hidden (admin only)
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
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All partners retrieved
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
 *                         $ref: '#/components/schemas/Partner'
 */

/**
 * @swagger
 * /partners/{id}:
 *   put:
 *     tags:
 *       - Partners
 *     summary: Update partner (admin only)
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
 *             $ref: '#/components/schemas/CreatePartnerInput'
 *     responses:
 *       200:
 *         description: Partner updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Partner'
 *       404:
 *         description: Partner not found
 *   delete:
 *     tags:
 *       - Partners
 *     summary: Delete partner (admin only)
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
 *         description: Partner deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Partner not found
 */

// Public routes
router.get('/', getPartners);

// Admin routes
router.get('/admin/all', authenticate, requireRole('admin'), getAllPartners);
router.post('/', authenticate, requireRole('admin'), createPartner);
router.put('/:id', authenticate, requireRole('admin'), updatePartner);
router.delete('/:id', authenticate, requireRole('admin'), deletePartner);

export default router;