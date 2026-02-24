import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';
import CompanySettings from '../../models/CompanySettings';

describe('Company Settings Tests', () => {
    let adminSession: string;
    let adminUser: any;

    beforeAll(async () => {
        await connectDB();
        // Clear the database
        await CompanySettings.deleteMany({});
        await User.deleteMany({});
        await Session.deleteMany({});

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
    });

    afterAll(async () => {
        await CompanySettings.deleteMany({});
        await User.deleteMany({});
        await Session.deleteMany({});
        await disconnectDB();
    });

    describe('GET /api/company-settings', () => {
        it('should get company settings without authentication', async () => {
            const response = await request(app)
                .get('/api/company-settings');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should return empty data if no settings exist', async () => {
            const response = await request(app)
                .get('/api/company-settings');

            expect(response.status).toBe(200);
            expect(response.body.data).toBeNull();
        });
    });

    describe('POST /api/company-settings', () => {
        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/company-settings')
                .send({
                    nameAr: 'شركة ابن الشيخ',
                    nameEn: 'Ibn Al Shaekh Company',
                });

            expect(response.status).toBe(401);
        });

        it('should fail with non-admin user', async () => {
            // Create a regular user
            const user = await User.create({
                userName: 'regularuser',
                email: 'user@test.com',
                passwordHash: 'userpass',
                role: 'user',
            });

            const userSession = await Session.create({
                userId: user._id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            const response = await request(app)
                .post('/api/company-settings')
                .set('Authorization', `Bearer ${userSession._id.toString()}`)
                .send({
                    nameAr: 'شركة ابن الشيخ',
                    nameEn: 'Ibn Al Shaekh Company',
                });

            expect(response.status).toBe(403);

            // Cleanup
            await User.findByIdAndDelete(user._id);
            await Session.findByIdAndDelete(userSession._id);
        });

        it('should successfully create company settings', async () => {
            const response = await request(app)
                .post('/api/company-settings')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    nameAr: 'شركة ابن الشيخ دول',
                    nameEn: 'Ibn Al Shaekh Global',
                    yearsExperience: 15,
                    clientsCount: 500,
                    projectsCount: 100,
                    satisfiedClientsCount: 480,
                    successPercentage: 96,
                    valuesAr: ['الجودة', 'الابتكار', 'الاستدامة'],
                    valuesEn: ['Quality', 'Innovation', 'Sustainability'],
                    ourSeenAr: 'رؤيتنا هي بناء مستقبل مستدام',
                    ourSeenEn: 'Our vision is to build a sustainable future',
                    telephone: '+966112345678',
                    email: 'contact@ibnalshaekh.com',
                    addressAr: 'الرياض، المملكة العربية السعودية',
                    addressEn: 'Riyadh, Saudi Arabia',
                    addressUrl: 'https://maps.google.com/...',
                    logo: 'https://example.com/logo.png',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.nameAr).toBe('شركة ابن الشيخ دول');
            expect(response.body.data.nameEn).toBe('Ibn Al Shaekh Global');
            expect(response.body.data.yearsExperience).toBe(15);
            expect(response.body.data.projectsCount).toBe(100);
        });

        it('should fail if settings already exist', async () => {
            const response = await request(app)
                .post('/api/company-settings')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    nameAr: 'شركة أخرى',
                    nameEn: 'Another Company',
                });

            expect(response.status).toBe(400);
        });

        it('should fail with missing required fields', async () => {
            // Clear existing settings for this test
            await CompanySettings.deleteMany({});

            const response = await request(app)
                .post('/api/company-settings')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    nameAr: 'شركة ابن الشيخ',
                    // Missing required fields
                });

            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/company-settings/:id', () => {
        let settingsId: string;

        beforeAll(async () => {
            // Clear and create fresh settings
            await CompanySettings.deleteMany({});
            const settings = await CompanySettings.create({
                nameAr: 'شركة ابن الشيخ',
                nameEn: 'Ibn Al Shaekh Company',
                yearsExperience: 10,
                clientsCount: 300,
                projectsCount: 50,
                satisfiedClientsCount: 290,
                successPercentage: 95,
                valuesAr: ['الجودة', 'الابتكار'],
                valuesEn: ['Quality', 'Innovation'],
                ourSeenAr: 'رؤيتنا',
                ourSeenEn: 'Our vision',
                telephone: '+966112345678',
                email: 'contact@company.com',
                addressAr: 'الرياض',
                addressEn: 'Riyadh',
                addressUrl: 'https://maps.google.com',
                logo: 'https://example.com/logo.png',
            });
            settingsId = settings._id.toString();
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .put(`/api/company-settings/${settingsId}`)
                .send({
                    yearsExperience: 20,
                });

            expect(response.status).toBe(401);
        });

        it('should update company settings successfully', async () => {
            const response = await request(app)
                .put(`/api/company-settings/${settingsId}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    yearsExperience: 20,
                    projectsCount: 150,
                    successPercentage: 98,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.yearsExperience).toBe(20);
            expect(response.body.data.projectsCount).toBe(150);
            expect(response.body.data.successPercentage).toBe(98);
        });

        it('should update bilingual fields', async () => {
            const response = await request(app)
                .put(`/api/company-settings/${settingsId}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    nameAr: 'شركة ابن الشيخ المحدثة',
                    ourSeenAr: 'رؤيتنا الجديدة هي بناء المستقبل',
                    addressAr: 'جدة، المملكة العربية السعودية',
                });

            expect(response.status).toBe(200);
            expect(response.body.data.nameAr).toBe('شركة ابن الشيخ المحدثة');
            expect(response.body.data.ourSeenAr).toBe('رؤيتنا الجديدة هي بناء المستقبل');
        });

        it('should update arrays (values)', async () => {
            const response = await request(app)
                .put(`/api/company-settings/${settingsId}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    valuesAr: ['الجودة', 'الابتكار', 'الشفافية', 'الاستدامة'],
                    valuesEn: ['Quality', 'Innovation', 'Transparency', 'Sustainability'],
                });

            expect(response.status).toBe(200);
            expect(response.body.data.valuesAr).toHaveLength(4);
            expect(response.body.data.valuesEn).toHaveLength(4);
        });
    });

    describe('GET /api/company-settings/:id', () => {
        let settingsId: string;

        beforeAll(async () => {
            const settings = await CompanySettings.findOne({});
            if (settings) {
                settingsId = settings._id.toString();
            }
        });

        it('should get company settings by ID', async () => {
            const response = await request(app)
                .get(`/api/company-settings/${settingsId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(settingsId);
            expect(response.body.data.nameAr).toBeDefined();
            expect(response.body.data.nameEn).toBeDefined();
        });

        it('should return 404 for non-existent settings', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/company-settings/${fakeId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/company-settings/:id', () => {
        let deleteSettingsId: string;

        beforeAll(async () => {
            const settings = await CompanySettings.create({
                nameAr: 'شركة للحذف',
                nameEn: 'Company to Delete',
                yearsExperience: 5,
                clientsCount: 100,
                projectsCount: 20,
                satisfiedClientsCount: 95,
                successPercentage: 90,
                valuesAr: ['الجودة'],
                valuesEn: ['Quality'],
                ourSeenAr: 'رؤيتنا',
                ourSeenEn: 'Our vision',
                telephone: '+966112345678',
                email: 'delete@company.com',
                addressAr: 'الرياض',
                addressEn: 'Riyadh',
                addressUrl: 'https://maps.google.com',
                logo: 'https://example.com/logo.png',
            });
            deleteSettingsId = settings._id.toString();
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .delete(`/api/company-settings/${deleteSettingsId}`);

            expect(response.status).toBe(401);
        });

        it('should delete company settings successfully', async () => {
            const response = await request(app)
                .delete(`/api/company-settings/${deleteSettingsId}`)
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify deletion
            const deletedSettings = await CompanySettings.findById(deleteSettingsId);
            expect(deletedSettings).toBeNull();
        });
    });
});
