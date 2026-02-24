import { Router } from 'express';
import authRoutes from './authRoutes';
import projectRoutes from './projectRoutes';
import projectCategoryRoutes from './projectCategoryRoutes';
import userRoutes from './userRoutes';
import companySettingsRoutes from './companySettingsRoutes';
import serviceRoutes from './serviceRoutes';
import partnerRoutes from './partnerRoutes';
import departmentRoutes from './departmentRoutes';
import settingsRoutes from './settingsRoutes';
import mediaRoutes from './mediaRoutes';
import contactRoutes from './contactRoutes';
import employeeRoutes from './employeeRoutes';

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Health Check
 *     summary: API Health Check
 *     description: Check if the API server is running
 *     responses:
 *       200:
 *         description: Server is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ibnalshaekh API is running successfully"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Ibnalshaekh API is running successfully',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/auth',
            users: '/users',
            projects: '/projects',
            categories: '/categories',
            'company-settings': '/company-settings',
            services: '/services',
            partners: '/partners',
            departments: '/departments',
            employees: '/employees',
            settings: '/settings',
            media: '/media',
            contact: '/contact',
            docs: '/api-docs',
        },
    });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/categories', projectCategoryRoutes);
router.use('/company-settings', companySettingsRoutes);
router.use('/services', serviceRoutes);
router.use('/partners', partnerRoutes);
router.use('/departments', departmentRoutes);
router.use('/employees', employeeRoutes);
router.use('/settings', settingsRoutes);
router.use('/media', mediaRoutes);
router.use('/contact', contactRoutes);

export default router;
