import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';
import Project from '../../models/Project';
import ProjectCategory from '../../models/ProjectCategory';

describe('Projects Tests', () => {
    let adminSession: string;
    let adminUser: any;
    let testCategory: any;

    beforeAll(async () => {
        await connectDB();
        // Clear the database
        await User.deleteMany({});
        await Session.deleteMany({});
        await Project.deleteMany({});
        await ProjectCategory.deleteMany({});

        // Create admin user and session
        adminUser = await User.create({
            userName: 'admin',
            email: 'admin@test.com',
            passwordHash: 'adminpass',
            role: 'admin',
        });

        const session = await Session.create({
            userId: adminUser._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        adminSession = session._id.toString();

        // Create a test category
        testCategory = await ProjectCategory.create({
            titleAr: 'المشاريع السكنية',
            titleEn: 'Residential Projects',
            descriptionAr: 'فلل فاخرة',
            descriptionEn: 'Luxury Villas',
            color: '#123456',
            countAr: '10+',
            countEn: '10+',
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Session.deleteMany({});
        await Project.deleteMany({});
        await ProjectCategory.deleteMany({});
        await disconnectDB();
    });

    describe('GET /api/projects', () => {
        it('should return empty projects list', async () => {
            const response = await request(app)
                .get('/api/projects');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });

        it('should return projects with pagination', async () => {
            const response = await request(app)
                .get('/api/projects?page=1&limit=10');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(10);
        });
    });

    describe('POST /api/projects', () => {
        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/projects')
                .send({
                    titleAr: 'مشروع جديد',
                    titleEn: 'New Project',
                    locationAr: 'الرياض',
                    locationEn: 'Riyadh',
                    descriptionAr: 'وصف المشروع',
                    descriptionEn: 'Project Description',
                    categoryId: testCategory._id,
                    status: 'Active',
                });

            expect(response.status).toBe(401);
        });

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    titleAr: 'مشروع جديد',
                    // Missing required fields
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should successfully create a project', async () => {
            const response = await request(app)
                .post('/api/projects')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    titleAr: 'فيلا سكنية',
                    titleEn: 'Residential Villa',
                    locationAr: 'الرياض',
                    locationEn: 'Riyadh',
                    descriptionAr: 'فيلا فاخرة جميلة',
                    descriptionEn: 'Beautiful luxury villa',
                    fullDescriptionAr: 'وصف طويل للفيلا',
                    fullDescriptionEn: 'Long description of villa',
                    durationAr: '12 شهر',
                    durationEn: '12 Months',
                    teamAr: '25 عضو',
                    teamEn: '25 Members',
                    area: '850 m²',
                    status: 'Completed',
                    categoryId: testCategory._id.toString(),
                    techStack: ['3D Design', 'Smart Home'],
                    gallery: ['https://example.com/image1.jpg'],
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.titleAr).toBe('فيلا سكنية');
            expect(response.body.data.titleEn).toBe('Residential Villa');
            expect(response.body.data._id).toBeDefined();
        });
    });

    describe('GET /api/projects/:id', () => {
        let projectId: string;

        beforeAll(async () => {
            const project = await Project.create({
                titleAr: 'مشروع تجريبي',
                titleEn: 'Test Project',
                locationAr: 'جدة',
                locationEn: 'Jeddah',
                descriptionAr: 'وصف المشروع',
                descriptionEn: 'Project Description',
                fullDescriptionAr: 'وصف كامل',
                fullDescriptionEn: 'Full Description',
                durationAr: '6 أشهر',
                durationEn: '6 Months',
                teamAr: '10 أعضاء',
                teamEn: '10 Members',
                area: '500 m²',
                status: 'Active',
                categoryId: testCategory._id,
                techStack: ['Modern Design'],
                gallery: [],
            });
            projectId = project._id.toString();
        });

        it('should get a project by ID', async () => {
            const response = await request(app)
                .get(`/api/projects/${projectId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(projectId);
            expect(response.body.data.titleAr).toBe('مشروع تجريبي');
        });

        it('should return 404 for non-existent project', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/projects/${fakeId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/projects/:id', () => {
        let projectId: string;

        beforeAll(async () => {
            const project = await Project.create({
                titleAr: 'مشروع للتحديث',
                titleEn: 'Project to Update',
                locationAr: 'الرياض',
                locationEn: 'Riyadh',
                descriptionAr: 'الوصف الأصلي',
                descriptionEn: 'Original Description',
                fullDescriptionAr: 'وصف كامل أصلي',
                fullDescriptionEn: 'Original Full Description',
                durationAr: '12 شهر',
                durationEn: '12 Months',
                teamAr: '15 عضو',
                teamEn: '15 Members',
                area: '600 m²',
                status: 'Active',
                categoryId: testCategory._id,
            });
            projectId = project._id.toString();
        });

        it('should update project successfully', async () => {
            const response = await request(app)
                .put(`/api/projects/${projectId}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    titleAr: 'مشروع محدث',
                    status: 'Completed',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.titleAr).toBe('مشروع محدث');
            expect(response.body.data.status).toBe('Completed');
        });
    });

    describe('DELETE /api/projects/:id', () => {
        let projectId: string;

        beforeAll(async () => {
            const project = await Project.create({
                titleAr: 'مشروع للحذف',
                titleEn: 'Project to Delete',
                locationAr: 'الرياض',
                locationEn: 'Riyadh',
                descriptionAr: 'سيتم حذفه',
                descriptionEn: 'Will be deleted',
                fullDescriptionAr: 'وصف كامل',
                fullDescriptionEn: 'Full Description',
                durationAr: '3 أشهر',
                durationEn: '3 Months',
                teamAr: '5 أعضاء',
                teamEn: '5 Members',
                area: '300 m²',
                status: 'Active',
                categoryId: testCategory._id,
            });
            projectId = project._id.toString();
        });

        it('should delete project successfully', async () => {
            const response = await request(app)
                .delete(`/api/projects/${projectId}`)
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify deletion
            const deletedProject = await Project.findById(projectId);
            expect(deletedProject).toBeNull();
        });
    });

    describe('GET /api/projects/category/:categoryId', () => {
        it('should get projects by category', async () => {
            const response = await request(app)
                .get(`/api/projects/category/${testCategory._id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
});
