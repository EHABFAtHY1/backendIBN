import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';
import Department from '../../models/Department';
import Section from '../../models/Section';

describe('Sections Tests', () => {
    let adminSession: string;
    let departmentId: string;

    beforeAll(async () => {
        await connectDB();
        await User.deleteMany({});
        await Session.deleteMany({});
        await Section.deleteMany({});
        await Department.deleteMany({});

        const adminUser = await User.create({
            userName: 'admin',
            email: 'admin-sections@test.com',
            passwordHash: 'adminpass',
            role: 'admin',
        });

        const session = await Session.create({
            userId: adminUser._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        adminSession = session._id.toString();

        const department = await Department.create({
            titleAr: 'قسم الهندسة',
            titleEn: 'Engineering Department',
            icon: 'Hammer',
        });
        departmentId = department._id.toString();
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Session.deleteMany({});
        await Section.deleteMany({});
        await Department.deleteMany({});
        await disconnectDB();
    });

    it('should create section as admin', async () => {
        const response = await request(app)
            .post('/api/sections')
            .set('Authorization', `Bearer ${adminSession}`)
            .send({
                titleAr: 'الهندسة المدنية',
                titleEn: 'Civil Engineering',
                icon: 'Building',
                departmentId,
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.titleEn).toBe('Civil Engineering');
    });

    it('should get all sections', async () => {
        const response = await request(app).get('/api/sections');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should update section as admin', async () => {
        const section = await Section.create({
            titleAr: 'قديمة',
            titleEn: 'Old',
            icon: 'OldIcon',
            departmentId,
        });

        const response = await request(app)
            .put(`/api/sections/${section._id}`)
            .set('Authorization', `Bearer ${adminSession}`)
            .send({
                titleAr: 'محدثة',
                icon: 'NewIcon',
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.titleAr).toBe('محدثة');
        expect(response.body.data.icon).toBe('NewIcon');
    });

    it('should delete section as admin', async () => {
        const section = await Section.create({
            titleAr: 'للحذف',
            titleEn: 'Delete',
            icon: 'Trash',
            departmentId,
        });

        const response = await request(app)
            .delete(`/api/sections/${section._id}`)
            .set('Authorization', `Bearer ${adminSession}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(await Section.findById(section._id)).toBeNull();
    });
});
