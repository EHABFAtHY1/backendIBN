import { Router } from 'express';
import {
    getQualityStandards,
    getAllQualityStandards,
    createQualityStandard,
    updateQualityStandard,
    deleteQualityStandard,
} from '../controllers/qualityStandardController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /quality-standards:
 *   get:
 *     tags:
 *       - Quality Standards
 *     summary: Get visible quality standards (public)
 *     security: []
 *     responses:
 *       200:
 *         description: Quality standards retrieved successfully
 *   post:
 *     tags:
 *       - Quality Standards
 *     summary: Create quality standard (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQualityStandardInput'
 *     responses:
 *       201:
 *         description: Quality standard created successfully
 */

/**
 * @swagger
 * /quality-standards/admin/all:
 *   get:
 *     tags:
 *       - Quality Standards
 *     summary: Get all quality standards including hidden (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All quality standards retrieved successfully
 */

/**
 * @swagger
 * /quality-standards/{id}:
 *   put:
 *     tags:
 *       - Quality Standards
 *     summary: Update quality standard (admin only)
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
 *             $ref: '#/components/schemas/CreateQualityStandardInput'
 *     responses:
 *       200:
 *         description: Quality standard updated successfully
 *   delete:
 *     tags:
 *       - Quality Standards
 *     summary: Delete quality standard (admin only)
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
 *         description: Quality standard deleted successfully
 */

router.get('/', getQualityStandards);
router.get('/admin/all', authenticate, requireRole('admin'), getAllQualityStandards);
router.post('/', authenticate, requireRole('admin'), createQualityStandard);
router.put('/:id', authenticate, requireRole('admin'), updateQualityStandard);
router.delete('/:id', authenticate, requireRole('admin'), deleteQualityStandard);

export default router;
