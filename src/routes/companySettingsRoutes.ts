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
 *     summary: Get company settings
 *     description: Retrieve all company settings (public access)
 *     responses:
 *       200:
 *         description: Company settings retrieved successfully
 *   post:
 *     tags:
 *       - Company Settings
 *     summary: Create company settings
 *     description: Create company settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Company settings created successfully
 *       409:
 *         description: Company settings already exist
 *   put:
 *     tags:
 *       - Company Settings
 *     summary: Update company settings
 *     description: Update company settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Company settings updated successfully
 */

// Public routes
router.get('/', getCompanySettings);

// Admin routes
router.post('/', authenticate, authorize('admin'), createCompanySettings);
router.put('/', authenticate, authorize('admin'), updateCompanySettings);

export default router;
