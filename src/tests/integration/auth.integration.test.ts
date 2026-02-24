import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';

describe('Authentication Tests', () => {
    beforeAll(async () => {
        await connectDB();
        // Clear the database
        await User.deleteMany({});
        await Session.deleteMany({});
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Session.deleteMany({});
        await disconnectDB();
    });

    describe('POST /api/auth/login', () => {
        it('should fail with missing credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should fail with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should fail with incorrect password', async () => {
            // Create a test user
            const testUser = await User.create({
                userName: 'testuser',
                email: 'test@example.com',
                passwordHash: 'correctpassword',
                role: 'user',
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);

            await User.deleteOne({ _id: testUser._id });
        });

        it('should successfully login', async () => {
            const testUser = await User.create({
                userName: 'adminuser',
                email: 'admin@test.com',
                passwordHash: 'correctpass123',
                role: 'admin',
            });

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'correctpass123',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.sessionId).toBeDefined();
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.userName).toBe('adminuser');
            expect(response.body.data.user.role).toBe('admin');

            await User.deleteOne({ _id: testUser._id });
        });
    });

    describe('POST /api/auth/register', () => {
        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    userName: 'newuser',
                    email: 'new@test.com',
                    password: 'password123',
                });

            expect(response.status).toBe(401);
        });

        it('should fail for non-admin users', async () => {
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

            const regularUser = await User.create({
                userName: 'regular',
                email: 'regular@test.com',
                passwordHash: 'regularpass',
                role: 'user',
            });

            const regularSession = await Session.create({
                userId: regularUser._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            const response = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${regularSession._id}`)
                .send({
                    userName: 'newuser',
                    email: 'new@test.com',
                    passwordHash: 'password123',
                    role: 'user',
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);

            await User.deleteMany({});
            await Session.deleteMany({});
        });

        it('should successfully register a new user as admin', async () => {
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

            const response = await request(app)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${session._id}`)
                .send({
                    userName: 'newuser',
                    email: 'newuser@test.com',
                    password: 'newpass123',
                    role: 'user',
                    tel: '+966501234567',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.userName).toBe('newuser');
            expect(response.body.data.email).toBe('newuser@test.com');

            await User.deleteMany({});
            await Session.deleteMany({});
        });
    });

    describe('GET /api/auth/me', () => {
        it('should fail without authentication', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
        });

        it('should return current user data', async () => {
            const user = await User.create({
                userName: 'currentuser',
                email: 'current@test.com',
                passwordHash: 'pass123',
                role: 'user',
                tel: '+966501111111',
            });

            const session = await Session.create({
                userId: user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${session._id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.userName).toBe('currentuser');
            expect(response.body.data.email).toBe('current@test.com');
            expect(response.body.data.tel).toBe('+966501111111');

            await User.deleteOne({ _id: user._id });
            await Session.deleteMany({});
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should successfully logout', async () => {
            const user = await User.create({
                userName: 'logoutuser',
                email: 'logout@test.com',
                passwordHash: 'pass123',
                role: 'user',
            });

            const session = await Session.create({
                userId: user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${session._id}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify session is deleted
            const deletedSession = await Session.findById(session._id);
            expect(deletedSession).toBeNull();

            await User.deleteOne({ _id: user._id });
        });
    });
});
