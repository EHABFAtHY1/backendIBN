import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';
import Partner from '../../models/Partner';

describe('Partners Tests', () => {
    let adminSession: string;
    let adminUser: any;

    beforeAll(async () => {
        await connectDB();
        await User.deleteMany({});
        await Session.deleteMany({});
        await Partner.deleteMany({});

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
        await Partner.deleteMany({});
        await disconnectDB();
    });

    describe('GET /api/partners', () => {
        it('should return empty partners list', async () => {
            const response = await request(app).get('/api/partners');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });
    });

    describe('POST /api/partners', () => {
        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/partners')
                .send({
                    name: { ar: 'شركة اسمنت', en: 'Cement Company' },
                    logo: 'https://example.com/logo.png',
                });

            expect(response.status).toBe(401);
        });

        it('should create a partner successfully', async () => {
            const response = await request(app)
                .post('/api/partners')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    name: { ar: 'شركة اسمنت', en: 'Cement Company' },
                    logo: 'https://example.com/logo.png',
                    order: 1,
                    isVisible: true,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name.ar).toBe('شركة اسمنت');
            expect(response.body.data.logo).toBe('https://example.com/logo.png');
            expect(response.body.data.order).toBe(1);
        });
    });

    describe('PUT /api/partners/:id', () => {
        it('should update partner successfully', async () => {
            const partner = await Partner.findOne({});
            const response = await request(app)
                .put(`/api/partners/${partner!._id}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    name: { ar: 'شركة اسمنت محدثة', en: 'Updated Cement Company' },
                    order: 2,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name.ar).toBe('شركة اسمنت محدثة');
            expect(response.body.data.order).toBe(2);
        });

        it('should return 404 for non-existent partner', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .put(`/api/partners/${fakeId}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({ name: { ar: 'test', en: 'test' } });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/partners/:id', () => {
        it('should delete partner successfully', async () => {
            const partner = await Partner.create({
                name: { ar: 'للحذف', en: 'To Delete' },
                logo: 'https://example.com/delete-logo.png',
            });

            const response = await request(app)
                .delete(`/api/partners/${partner._id}`)
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const deleted = await Partner.findById(partner._id);
            expect(deleted).toBeNull();
        });
    });

    describe('GET /api/partners/admin/all', () => {
        it('should return all partners including hidden for admin', async () => {
            await Partner.create({
                name: { ar: 'مخفي', en: 'Hidden' },
                logo: 'https://example.com/hidden-logo.png',
                isVisible: false,
            });

            const response = await request(app)
                .get('/api/partners/admin/all');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });
    });
});
