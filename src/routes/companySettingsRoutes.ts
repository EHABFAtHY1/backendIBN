import { Router } from 'express';
import {
    getCompanySettings,
    updateCompanySettings,
    createCompanySettings,
} from '../controllers/companySettingsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /company-settings:
 *   get:
 *     tags:
 *       - Company Settings
 *     summary: Get company settings (public)
 *     security: []
 *     description: Retrieve all company settings
 *     responses:
 *       200:
 *         description: Company settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CompanySettings'
 *   post:
 *     tags:
 *       - Company Settings
 *     summary: Create company settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompanySettingsInput'
 *     responses:
 *       201:
 *         description: Company settings created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CompanySettings'
 *       409:
 *         description: Company settings already exist
 *   put:
 *     tags:
 *       - Company Settings
 *     summary: Update company settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompanySettingsInput'
 *     responses:
 *       200:
 *         description: Company settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CompanySettings'
 *       404:
 *         description: Company settings not found
 */

// Public routes
router.get('/', getCompanySettings);

// Admin routes
router.post('/', authenticate, authorize('admin'), createCompanySettings);
router.put('/', authenticate, authorize('admin'), updateCompanySettings);

export default router;
