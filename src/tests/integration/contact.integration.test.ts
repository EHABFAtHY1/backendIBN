import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';
import ContactMessage from '../../models/ContactMessage';

describe('Contact Messages Tests', () => {
    let adminSession: string;
    let adminUser: any;

    beforeAll(async () => {
        await connectDB();
        await User.deleteMany({});
        await Session.deleteMany({});
        await ContactMessage.deleteMany({});

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
        await ContactMessage.deleteMany({});
        await disconnectDB();
    });

    describe('POST /api/contact', () => {
        it('should submit a contact message successfully', async () => {
            const response = await request(app)
                .post('/api/contact')
                .send({
                    name: 'أحمد محمد',
                    email: 'ahmed@example.com',
                    phone: '+966501234567',
                    subject: 'استفسار عن مشروع',
                    message: 'أريد معرفة تفاصيل مشروع الفيلا السكنية في الرياض',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('أحمد محمد');
            expect(response.body.data.email).toBe('ahmed@example.com');
            expect(response.body.data.status).toBe('new');
        });

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/contact')
                .send({
                    name: 'أحمد',
                    // Missing email, phone, subject, message
                });

            expect(response.status).toBe(400);
        });

        it('should fail with invalid email', async () => {
            const response = await request(app)
                .post('/api/contact')
                .send({
                    name: 'أحمد محمد',
                    email: 'not-an-email',
                    phone: '+966501234567',
                    subject: 'اختبار',
                    message: 'هذه رسائل اختبار لملف الاتصال بنا',
                });

            expect(response.status).toBe(400);
        });

        it('should fail with short message', async () => {
            const response = await request(app)
                .post('/api/contact')
                .send({
                    name: 'أحمد محمد',
                    email: 'ahmed@example.com',
                    phone: '+966501234567',
                    subject: 'اختبار',
                    message: 'قصير',  // Less than 10 chars
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/contact', () => {
        it('should fail without authentication', async () => {
            const response = await request(app).get('/api/contact');
            expect(response.status).toBe(401);
        });

        it('should return contact messages for admin', async () => {
            const response = await request(app)
                .get('/api/contact')
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/contact/:id', () => {
        it('should get a contact message by ID', async () => {
            const msg = await ContactMessage.findOne({});

            const response = await request(app)
                .get(`/api/contact/${msg!._id}`)
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(msg!._id.toString());
        });

        it('should return 404 for non-existent message', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/contact/${fakeId}`)
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /api/contact/:id', () => {
        it('should update message status', async () => {
            const msg = await ContactMessage.findOne({});

            const response = await request(app)
                .patch(`/api/contact/${msg!._id}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({ status: 'read' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('read');
        });

        it('should fail with invalid status', async () => {
            const msg = await ContactMessage.findOne({});

            const response = await request(app)
                .patch(`/api/contact/${msg!._id}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({ status: 'invalid_status' });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/contact/stats/overview', () => {
        it('should return contact statistics', async () => {
            const response = await request(app)
                .get('/api/contact/stats/overview')
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('DELETE /api/contact/:id', () => {
        it('should delete message successfully', async () => {
            const msg = await ContactMessage.create({
                name: 'للحذف',
                email: 'delete@example.com',
                phone: '+966500000000',
                subject: 'رسالة للحذف',
                message: 'هذه رسالة اختبار ستحذف فورا بعد الإنشاء',
            });

            const response = await request(app)
                .delete(`/api/contact/${msg._id}`)
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const deleted = await ContactMessage.findById(msg._id);
            expect(deleted).toBeNull();
        });
    });
});
