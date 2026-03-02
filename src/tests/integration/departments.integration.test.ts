import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';
import Department from '../../models/Department';

describe('Departments Tests', () => {
    let adminSession: string;
    let adminUser: any;

    beforeAll(async () => {
        await connectDB();
        await User.deleteMany({});
        await Session.deleteMany({});
        await Department.deleteMany({});

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
        await Department.deleteMany({});
        await disconnectDB();
    });

    describe('GET /api/departments', () => {
        it('should return empty departments list', async () => {
            const response = await request(app).get('/api/departments');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });
    });

    describe('POST /api/departments', () => {
        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/departments')
                .send({
                    title: { ar: 'قسم هندسي', en: 'Engineering Department' },
                    icon: 'engineering',
                });

            expect(response.status).toBe(401);
        });

        it('should create a department successfully', async () => {
            const response = await request(app)
                .post('/api/departments')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    title: { ar: 'قسم هندسي', en: 'Engineering Department' },
                    icon: 'engineering',
                    subDepartments: [
                        {
                            title: { ar: 'هندسة مدنية', en: 'Civil Engineering' },
                            icon: 'civil',
                            sections: [{ ar: 'التصميم', en: 'Design' }],
                        },
                    ],
                    order: 1,
                    isVisible: true,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.title.ar).toBe('قسم هندسي');
            expect(response.body.data.title.en).toBe('Engineering Department');
            expect(response.body.data.subDepartments).toHaveLength(1);
            expect(response.body.data.subDepartments[0].title.ar).toBe('هندسة مدنية');
        });
    });

    describe('PUT /api/departments/:id', () => {
        it('should update department successfully', async () => {
            const dept = await Department.findOne({});
            const response = await request(app)
                .put(`/api/departments/${dept!._id}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    title: { ar: 'قسم هندسي محدث', en: 'Updated Engineering' },
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.title.ar).toBe('قسم هندسي محدث');
        });

        it('should return 404 for non-existent department', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .put(`/api/departments/${fakeId}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({ title: { ar: 'test', en: 'test' } });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/departments/:id', () => {
        it('should delete department successfully', async () => {
            const dept = await Department.create({
                title: { ar: 'للحذف', en: 'To Delete' },
                icon: 'delete',
            });

            const response = await request(app)
                .delete(`/api/departments/${dept._id}`)
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const deleted = await Department.findById(dept._id);
            expect(deleted).toBeNull();
        });
    });

    describe('GET /api/departments/admin/all', () => {
        it('should return all departments including hidden for admin', async () => {
            await Department.create({
                title: { ar: 'مخفي', en: 'Hidden' },
                icon: 'hidden',
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
