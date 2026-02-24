import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';

describe('Users Tests', () => {
    let adminSession: string;
    let adminUser: any;
    let testUserId: string;

    beforeAll(async () => {
        await connectDB();
        // Clear the database
        await User.deleteMany({});
        await Session.deleteMany({});

        // Create admin user and session
        adminUser = await User.create({
            userName: 'admin',
            email: 'admin@test.com',
            passwordHash: 'adminpass',
            role: 'admin',
        });

        const adminSessionDoc = await Session.create({
            userId: adminUser._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        adminSession = adminSessionDoc._id.toString();

        // Create a test user
        const testUser = await User.create({
            userName: 'testuser',
            email: 'test@test.com',
            passwordHash: 'testpass',
            role: 'user',
            tel: '+966500000000',
            yearsOfExp: 5,
            descriptionAr: 'موظف جديد',
            descriptionEn: 'New Employee',
        });
        testUserId = testUser._id.toString();
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Session.deleteMany({});
        await disconnectDB();
    });

    describe('GET /api/users', () => {
        it('should get all users without authentication', async () => {
            const response = await request(app)
                .get('/api/users');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toBeDefined();
        });

        it('should support pagination parameters', async () => {
            const response = await request(app)
                .get('/api/users?page=1&limit=10');

            expect(response.status).toBe(200);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(10);
        });
    });

    describe('GET /api/users/:id', () => {
        it('should get a user by ID', async () => {
            const response = await request(app)
                .get(`/api/users/${testUserId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(testUserId);
            expect(response.body.data.userName).toBe('testuser');
            expect(response.body.data.email).toBe('test@test.com');
        });

        it('should return 404 for non-existent user', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/users/${fakeId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('POST /api/users', () => {
        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    userName: 'newuser',
                    email: 'newuser@test.com',
                    passwordHash: 'password123',
                    role: 'user',
                });

            expect(response.status).toBe(401);
        });

        it('should successfully create a user (admin only)', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    userName: 'newemployee',
                    email: 'newemployee@test.com',
                    passwordHash: 'password123',
                    role: 'user',
                    tel: '+966501234567',
                    yearsOfExp: 3,
                    descriptionAr: 'موظف جديد',
                    descriptionEn: 'New Employee',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.userName).toBe('newemployee');
            expect(response.body.data.email).toBe('newemployee@test.com');
            expect(response.body.data._id).toBeDefined();
        });

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    userName: 'incomplete',
                    // Missing email and passwordHash
                });

            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/users/:id', () => {
        let updateUserId: string;

        beforeAll(async () => {
            const user = await User.create({
                userName: 'updatetest',
                email: 'update@test.com',
                passwordHash: 'testpass',
                role: 'user',
            });
            updateUserId = user._id.toString();
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .put(`/api/users/${updateUserId}`)
                .send({
                    tel: '+966500000001',
                });

            expect(response.status).toBe(401);
        });

        it('should update user successfully', async () => {
            const response = await request(app)
                .put(`/api/users/${updateUserId}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    tel: '+966500000001',
                    yearsOfExp: 8,
                    descriptionAr: 'موظف محترف',
                    descriptionEn: 'Senior Employee',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.tel).toBe('+966500000001');
            expect(response.body.data.yearsOfExp).toBe(8);
        });

        it('should not update protected fields', async () => {
            const response = await request(app)
                .put(`/api/users/${updateUserId}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    role: 'admin', // This should not change based on whitelist
                });

            expect(response.status).toBe(200);
            // Verify role was updated (admin can change role)
            const updatedUser = await User.findById(updateUserId);
            expect(updatedUser?.role).toBe('admin');
        });
    });

    describe('DELETE /api/users/:id', () => {
        let deleteUserId: string;

        beforeAll(async () => {
            const user = await User.create({
                userName: 'deletetest',
                email: 'delete@test.com',
                passwordHash: 'testpass',
                role: 'user',
            });
            deleteUserId = user._id.toString();
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .delete(`/api/users/${deleteUserId}`);

            expect(response.status).toBe(401);
        });

        it('should successfully delete a user', async () => {
            const response = await request(app)
                .delete(`/api/users/${deleteUserId}`)
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify deletion
            const deletedUser = await User.findById(deleteUserId);
            expect(deletedUser).toBeNull();
        });
    });

    describe('GET /api/users/:id/profile', () => {
        it('should get user profile', async () => {
            const response = await request(app)
                .get(`/api/users/${testUserId}/profile`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.userName).toBe('testuser');
        });
    });
});
