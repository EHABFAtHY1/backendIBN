import { Router } from 'express';
import {
    getServices,
    getAllServices,
    getServiceBySlug,
    createService,
    updateService,
    deleteService,
} from '../controllers/serviceController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /services:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get visible services (public)
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
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           default: order
 *         description: "Sort fields (e.g. 'order,-createdAt')"
 *       - name: fields
 *         in: query
 *         schema:
 *           type: string
 *         description: "Comma-separated fields to return"
 *     responses:
 *       200:
 *         description: Services retrieved successfully
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
 *                         $ref: '#/components/schemas/Service'
 *   post:
 *     tags:
 *       - Services
 *     summary: Create new service (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateServiceInput'
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /services/admin/all:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get all services including hidden (admin only)
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
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All services retrieved
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
 *                         $ref: '#/components/schemas/Service'
 */

/**
 * @swagger
 * /services/{slug}:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get service by slug
 *     security: []
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     tags:
 *       - Services
 *     summary: Update service (admin only)
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
 *             $ref: '#/components/schemas/CreateServiceInput'
 *     responses:
 *       200:
 *         description: Service updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 *   delete:
 *     tags:
 *       - Services
 *     summary: Delete service (admin only)
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
 *         description: Service deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Service not found
 */

// Public routes
router.get('/', getServices);
router.get('/:slug', getServiceBySlug);

// Admin routes
router.get('/admin/all', authenticate, requireRole('admin'), getAllServices);
router.post('/', authenticate, requireRole('admin'), createService);
router.put('/:id', authenticate, requireRole('admin'), updateService);
router.delete('/:id', authenticate, requireRole('admin'), deleteService);

export default router;
