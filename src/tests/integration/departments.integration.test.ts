import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';
import Department from '../../models/Department';
import Section from '../../models/Section';

describe('Departments Tests', () => {
    let adminSession: string;

    beforeAll(async () => {
        await connectDB();
        await User.deleteMany({});
        await Session.deleteMany({});
        await Section.deleteMany({});
        await Department.deleteMany({});

        const adminUser = await User.create({
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
        await Section.deleteMany({});
        await Department.deleteMany({});
        await disconnectDB();
    });

    describe('GET /api/departments', () => {
        it('should return departments with pagination', async () => {
            const response = await request(app).get('/api/departments');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });
    });

    describe('POST /api/departments', () => {
        it('should fail without authentication', async () => {
            const response = await request(app).post('/api/departments').send({
                titleAr: 'قسم هندسي',
                titleEn: 'Engineering Department',
                icon: 'Hammer',
            });

            expect(response.status).toBe(401);
        });

        it('should create a department successfully', async () => {
            const response = await request(app)
                .post('/api/departments')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    titleAr: 'قسم هندسي',
                    titleEn: 'Engineering Department',
                    icon: 'Hammer',
                    order: 1,
                    isVisible: true,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.titleAr).toBe('قسم هندسي');
            expect(response.body.data.titleEn).toBe('Engineering Department');
            expect(response.body.data.icon).toBe('Hammer');
        });
    });

    describe('PUT /api/departments/:id', () => {
        it('should update department successfully', async () => {
            const dept = await Department.findOne({});
            const response = await request(app)
                .put(`/api/departments/${dept!._id}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    titleAr: 'قسم هندسي محدث',
                    icon: 'Wrench',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.titleAr).toBe('قسم هندسي محدث');
            expect(response.body.data.icon).toBe('Wrench');
        });

        it('should return 404 for non-existent department', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .put(`/api/departments/${fakeId}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({ titleAr: 'test', titleEn: 'test' });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/departments/:id', () => {
        it('should delete department successfully', async () => {
            const dept = await Department.create({
                titleAr: 'للحذف',
                titleEn: 'To Delete',
                icon: 'Trash',
            });

            const response = await request(app)
                .delete(`/api/departments/${dept._id}`)
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(await Department.findById(dept._id)).toBeNull();
        });
    });

    describe('GET /api/departments/admin/all', () => {
        it('should return all departments including hidden for admin', async () => {
            await Department.create({
                titleAr: 'مخفي',
                titleEn: 'Hidden',
                icon: 'EyeOff',
                isVisible: false,
            });

            const response = await request(app)
                .get('/api/departments/admin/all')
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });
    });
});
