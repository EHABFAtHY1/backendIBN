import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { connectDB, disconnectDB } from '../../config/db';
import User from '../../models/User';
import Session from '../../models/Session';
import ProjectCategory from '../../models/ProjectCategory';

describe('Project Categories Tests', () => {
    let adminSession: string;
    let adminUser: any;

    beforeAll(async () => {
        await connectDB();
        // Clear the database
        await User.deleteMany({});
        await Session.deleteMany({});
        await ProjectCategory.deleteMany({});

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
        await User.deleteMany({});
        await Session.deleteMany({});
        await ProjectCategory.deleteMany({});
        await disconnectDB();
    });

    describe('GET /api/categories', () => {
        it('should return empty categories list', async () => {
            const response = await request(app)
                .get('/api/categories');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('POST /api/categories', () => {
        it('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/categories')
                .send({
                    titleAr: 'المشاريع السكنية',
                    titleEn: 'Residential Projects',
                    descriptionAr: 'مشاريع سكنية فاخرة',
                    descriptionEn: 'Luxury residential projects',
                });

            expect(response.status).toBe(401);
        });

        it('should successfully create a category', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    titleAr: 'المشاريع السكنية',
                    titleEn: 'Residential Projects',
                    descriptionAr: 'مشاريع سكنية فاخرة',
                    descriptionEn: 'Luxury residential projects',
                    color: '#1E90FF',
                    countAr: '25+',
                    countEn: '25+',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.titleAr).toBe('المشاريع السكنية');
            expect(response.body.data.titleEn).toBe('Residential Projects');
            expect(response.body.data._id).toBeDefined();
        });

        it('should fail with missing required fields', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    titleAr: 'عنوان بدون عنوان إنجليزي',
                    // Missing titleEn and other required fields
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/categories/:id', () => {
        let categoryId: string;

        beforeAll(async () => {
            const category = await ProjectCategory.create({
                titleAr: 'المشاريع التجارية',
                titleEn: 'Commercial Projects',
                descriptionAr: 'مراكز تجارية حديثة',
                descriptionEn: 'Modern commercial centers',
                color: '#FF6347',
                countAr: '15+',
                countEn: '15+',
            });
            categoryId = category._id.toString();
        });

        it('should get a category by ID', async () => {
            const response = await request(app)
                .get(`/api/categories/${categoryId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data._id).toBe(categoryId);
            expect(response.body.data.titleAr).toBe('المشاريع التجارية');
            expect(response.body.data.titleEn).toBe('Commercial Projects');
        });

        it('should return 404 for non-existent category', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .get(`/api/categories/${fakeId}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/categories/:id', () => {
        let categoryId: string;

        beforeAll(async () => {
            const category = await ProjectCategory.create({
                titleAr: 'مشاريع للتحديث',
                titleEn: 'Category to Update',
                descriptionAr: 'وصف أولي',
                descriptionEn: 'Initial description',
                color: '#00FF00',
                countAr: '10+',
                countEn: '10+',
            });
            categoryId = category._id.toString();
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .put(`/api/categories/${categoryId}`)
                .send({
                    titleAr: 'عنوان محدث',
                });

            expect(response.status).toBe(401);
        });

        it('should update category successfully', async () => {
            const response = await request(app)
                .put(`/api/categories/${categoryId}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    titleAr: 'مشاريع محدثة',
                    descriptionAr: 'وصف محدث',
                    color: '#FFD700',
                    countAr: '20+',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.titleAr).toBe('مشاريع محدثة');
            expect(response.body.data.color).toBe('#FFD700');
            expect(response.body.data.countAr).toBe('20+');
        });

        it('should update bilingual fields independently', async () => {
            const response = await request(app)
                .put(`/api/categories/${categoryId}`)
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    descriptionEn: 'Updated English Description',
                });

            expect(response.status).toBe(200);
            expect(response.body.data.descriptionEn).toBe('Updated English Description');
            // Verify Arabic didn't change
            const category = await ProjectCategory.findById(categoryId);
            expect(category?.descriptionAr).toBe('وصف محدث');
        });
    });

    describe('DELETE /api/categories/:id', () => {
        let categoryId: string;

        beforeAll(async () => {
            const category = await ProjectCategory.create({
                titleAr: 'مشروع للحذف',
                titleEn: 'Category to Delete',
                descriptionAr: 'سيتم حذفه',
                descriptionEn: 'Will be deleted',
                color: '#000000',
                countAr: '5+',
                countEn: '5+',
            });
            categoryId = category._id.toString();
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .delete(`/api/categories/${categoryId}`);

            expect(response.status).toBe(401);
        });

        it('should successfully delete a category', async () => {
            const response = await request(app)
                .delete(`/api/categories/${categoryId}`)
                .set('Authorization', `Bearer ${adminSession}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            // Verify deletion
            const deletedCategory = await ProjectCategory.findById(categoryId);
            expect(deletedCategory).toBeNull();
        });
    });

    describe('Bilingual Content Tests', () => {
        it('should support full bilingual content', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    titleAr: 'المشاريع الصناعية',
                    titleEn: 'Industrial Projects',
                    descriptionAr: 'مصانع ومنشآت صناعية متطورة',
                    descriptionEn: 'Advanced factories and industrial facilities',
                    color: '#808080',
                    countAr: '12+',
                    countEn: '12+',
                });

            expect(response.status).toBe(201);
            expect(response.body.data.titleAr).toBe('المشاريع الصناعية');
            expect(response.body.data.titleEn).toBe('Industrial Projects');
            expect(response.body.data.descriptionAr).toBe('مصانع ومنشآت صناعية متطورة');
            expect(response.body.data.descriptionEn).toBe('Advanced factories and industrial facilities');
        });

        it('should handle special characters and unicode', async () => {
            const response = await request(app)
                .post('/api/categories')
                .set('Authorization', `Bearer ${adminSession}`)
                .send({
                    titleAr: 'المشاريع الخاصة و المميزة',
                    titleEn: 'Special & Featured Projects',
                    descriptionAr: 'مشاريع بمواصفات عالية جداً (A+)',
                    descriptionEn: 'Projects with very high specifications (A+)',
                    color: '#123456',
                    countAr: '8+',
                    countEn: '8+',
                });

            expect(response.status).toBe(201);
            expect(response.body.data.titleAr).toContain('المشاريع');
        });
    });
});
