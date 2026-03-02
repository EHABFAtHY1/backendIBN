import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';
import Service from '../../models/Service';

describe('Services Tests', () => {
    let adminSession: string;
    let adminUser: any;

    beforeAll(async () => {
        await connectDB();
        await User.deleteMany({});
        await Session.deleteMany({});
        await Service.deleteMany({});

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
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Session.deleteMany({});
        await Service.deleteMany({});
        await disconnectDB();
    });

    describe('GET /api/services', () => {
        it('should return empty services list', async () => {
            const response = await request(app).get('/api/services');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });
    });

    describe('POST /api/services', () => {
        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/services')
                .send({
                    slug: 'general-construction',
                    title: { ar: 'مقاولات عامة', en: 'General Construction' },
                });

            expect(response.status).toBe(401);
        });

        it('should create a service successfully', async () => {
            const response = await request(app)
                .post('/api/services')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    slug: 'general-construction',
                    title: { ar: 'مقاولات عامة', en: 'General Construction' },
                    shortDescription: { ar: 'وصف قصير', en: 'Short description' },
                    fullDescription: { ar: 'وصف كامل', en: 'Full description' },
                    icon: 'building',
                    features: [{ ar: 'تصميم حديث', en: 'Modern Design' }],
                    images: ['https://example.com/img1.jpg'],
                    stats: { projects: '50+', experience: '10+', satisfaction: '95%' },
                    order: 1,
                    isVisible: true,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.slug).toBe('general-construction');
            expect(response.body.data.title.ar).toBe('مقاولات عامة');
            expect(response.body.data.title.en).toBe('General Construction');
            expect(response.body.data.stats.projects).toBe('50+');
        });
    });

    describe('GET /api/services/:slug', () => {
        it('should get a service by slug', async () => {
            const response = await request(app)
                .get('/api/services/general-construction');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.slug).toBe('general-construction');
        });

        it('should return 404 for non-existent slug', async () => {
            const response = await request(app)
                .get('/api/services/non-existent-slug');

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/services/:id', () => {
        it('should update service successfully', async () => {
            const service = await Service.findOne({ slug: 'general-construction' });
            const response = await request(app)
                .put(`/api/services/${service!._id}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    title: { ar: 'مقاولات عامة محدثة', en: 'Updated General Construction' },
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.title.ar).toBe('مقاولات عامة محدثة');
        });
    });

    describe('DELETE /api/services/:id', () => {
        it('should delete service successfully', async () => {
            const service = await Service.create({
                slug: 'to-delete',
                title: { ar: 'للحذف', en: 'To Delete' },
            });

            const response = await request(app)
                .delete(`/api/services/${service._id}`)
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const deleted = await Service.findById(service._id);
            expect(deleted).toBeNull();
        });
    });

    describe('GET /api/services/admin/all', () => {
        it('should return all services including hidden for admin', async () => {
            await Service.create({
                slug: 'hidden-service',
                title: { ar: 'مخفي', en: 'Hidden' },
                isVisible: false,
            });

            const response = await request(app)
                .get('/api/services/admin/all')
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });
    });
});
