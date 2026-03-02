import { Router } from 'express';
import { getMedia, uploadMedia, uploadMultipleMedia, deleteMedia } from '../controllers/mediaController';
import { authenticate, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * @swagger
 * /media:
 *   get:
 *     tags:
 *       - Media
 *     summary: Get all media files (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Media files retrieved
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
 *                     $ref: '#/components/schemas/Media'
 */

/**
 * @swagger
 * /media/upload:
 *   post:
 *     tags:
 *       - Media
 *     summary: Upload single file (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               alt:
 *                 type: string
 *                 description: Alt text for the image
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Media'
 *       400:
 *         description: No file provided
 */

/**
 * @swagger
 * /media/upload-multiple:
 *   post:
 *     tags:
 *       - Media
 *     summary: Upload multiple files (admin only, max 10)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *     responses:
 *       201:
 *         description: Files uploaded successfully
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
 *                     $ref: '#/components/schemas/Media'
 */

/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     tags:
 *       - Media
 *     summary: Delete media file (admin only)
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
 *         description: Media deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Media not found
 */

// All media routes require authentication
router.get('/', authenticate, requireRole('admin'), getMedia);
router.post('/upload', authenticate, requireRole('admin'), upload.single('file'), uploadMedia);
router.post('/upload-multiple', authenticate, requireRole('admin'), upload.array('files', 10), uploadMultipleMedia);
router.delete('/:id', authenticate, requireRole('admin'), deleteMedia);

export default router;
