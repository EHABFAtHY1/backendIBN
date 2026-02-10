import { Router } from 'express';
import authRoutes from './authRoutes';
import projectRoutes from './projectRoutes';
import projectCategoryRoutes from './projectCategoryRoutes';
import serviceRoutes from './serviceRoutes';
import partnerRoutes from './partnerRoutes';
import departmentRoutes from './departmentRoutes';
import settingsRoutes from './settingsRoutes';
import mediaRoutes from './mediaRoutes';
import userRoutes from './userRoutes';
import contactRoutes from './contactRoutes';

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
            projects: '/projects',
            'project-categories': '/project-categories',
            services: '/services',
            partners: '/partners',
            departments: '/departments',
            settings: '/settings',
            media: '/media',
            users: '/users',
            contact: '/contact',
            docs: '/api-docs',
        },
    });
});

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/project-categories', projectCategoryRoutes);
router.use('/services', serviceRoutes);
router.use('/partners', partnerRoutes);
router.use('/departments', departmentRoutes);
router.use('/settings', settingsRoutes);
router.use('/media', mediaRoutes);
router.use('/users', userRoutes);
router.use('/contact', contactRoutes);

export default router;
