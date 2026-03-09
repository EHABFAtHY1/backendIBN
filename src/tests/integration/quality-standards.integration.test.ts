import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';
import QualityStandard from '../../models/QualityStandard';

describe('Quality Standards Tests', () => {
    let adminSession: string;

    beforeAll(async () => {
        await connectDB();
        await User.deleteMany({});
        await Session.deleteMany({});
        await QualityStandard.deleteMany({});

        const adminUser = await User.create({
            userName: 'admin',
            email: 'admin-quality@test.com',
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
        await QualityStandard.deleteMany({});
        await disconnectDB();
    });

    it('should return public quality standards list', async () => {
        const response = await request(app).get('/api/quality-standards');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should create a quality standard as admin', async () => {
        const response = await request(app)
            .post('/api/quality-standards')
            .set('Authorization', `Bearer ${adminSession}`)
            .send({
                titleAr: 'معيار جودة',
                titleEn: 'Quality Standard',
                descriptionAr: 'وصف عربي',
                descriptionEn: 'English description',
                icon: 'Shield',
                order: 1,
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.titleAr).toBe('معيار جودة');
    });

    it('should update a quality standard as admin', async () => {
        const standard = await QualityStandard.create({
            titleAr: 'قديم',
            titleEn: 'Old',
            descriptionAr: 'قديم',
            descriptionEn: 'Old',
            icon: 'Shield',
        });

        const response = await request(app)
            .put(`/api/quality-standards/${standard._id}`)
            .set('Authorization', `Bearer ${adminSession}`)
            .send({
                titleAr: 'محدث',
                descriptionAr: 'وصف محدث',
            });

        expect(response.status).toBe(200);
        expect(response.body.data.titleAr).toBe('محدث');
        expect(response.body.data.descriptionAr).toBe('وصف محدث');
    });

    it('should delete a quality standard as admin', async () => {
        const standard = await QualityStandard.create({
            titleAr: 'حذف',
            titleEn: 'Delete',
            descriptionAr: 'حذف',
            descriptionEn: 'Delete',
            icon: 'Trash',
        });

        const response = await request(app)
            .delete(`/api/quality-standards/${standard._id}`)
            .set('Authorization', `Bearer ${adminSession}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(await QualityStandard.findById(standard._id)).toBeNull();
    });
});
