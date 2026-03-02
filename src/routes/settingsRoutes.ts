import { Router } from 'express';
import {
    getSettings,
    updateSettings,
    getHero,
    getContact,
    getAbout,
} from '../controllers/settingsController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /settings:
 *   get:
 *     tags:
 *       - Site Settings
 *     summary: Get all site settings (public)
 *     security: []
 *     responses:
 *       200:
 *         description: Site settings retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Full site settings object
 *   put:
 *     tags:
 *       - Site Settings
 *     summary: Update site settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Partial site settings to update
 *     responses:
 *       200:
 *         description: Settings updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /settings/hero:
 *   get:
 *     tags:
 *       - Site Settings
 *     summary: Get hero section settings (public)
 *     security: []
 *     responses:
 *       200:
 *         description: Hero settings retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */

/**
 * @swagger
 * /settings/contact:
 *   get:
 *     tags:
 *       - Site Settings
 *     summary: Get contact section settings (public)
 *     security: []
 *     responses:
 *       200:
 *         description: Contact settings retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */

/**
 * @swagger
 * /settings/about:
 *   get:
 *     tags:
 *       - Site Settings
 *     summary: Get about section settings (public)
 *     security: []
 *     responses:
 *       200:
 *         description: About settings retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */

// Public routes
router.get('/', getSettings);
router.get('/hero', getHero);
router.get('/contact', getContact);
router.get('/about', getAbout);

// Admin routes
router.put('/', authenticate, requireRole('admin'), updateSettings);

export default router;
