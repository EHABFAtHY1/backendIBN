import { Router } from 'express';
import {
    getSections,
    getSection,
    createSection,
    updateSection,
    deleteSection,
} from '../controllers/sectionController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /sections:
 *   get:
 *     tags:
 *       - Sections
 *     summary: Get all sections
 *     security: []
 *     responses:
 *       200:
 *         description: Sections retrieved successfully
 *   post:
 *     tags:
 *       - Sections
 *     summary: Create new section (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSectionInput'
 *     responses:
 *       201:
 *         description: Section created successfully
 */

/**
 * @swagger
 * /sections/{id}:
 *   get:
 *     tags:
 *       - Sections
 *     summary: Get section by ID
 *     security: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Section retrieved successfully
 *   put:
 *     tags:
 *       - Sections
 *     summary: Update section (admin only)
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
 *             $ref: '#/components/schemas/CreateSectionInput'
 *     responses:
 *       200:
 *         description: Section updated successfully
 *   delete:
 *     tags:
 *       - Sections
 *     summary: Delete section (admin only)
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
 *         description: Section deleted successfully
 */

router.get('/', getSections);
router.get('/:id', getSection);
router.post('/', authenticate, requireRole('admin'), createSection);
router.put('/:id', authenticate, requireRole('admin'), updateSection);
router.delete('/:id', authenticate, requireRole('admin'), deleteSection);

export default router;
