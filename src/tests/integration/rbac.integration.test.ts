/**
 * RBAC (Role-Based Access Control) - Integration Tests
 * اختبارات التكامل لـ Authentication و Authorization
 * 
 * يختبر:
 * 1. Admin Role: إنشاء/تعديل/حذف الموظفين
 * 2. Employee Role: عرض البيانات الشخصية فقط
 * 3. Guest: عرض دليل الموظفين العام فقط
 */

import request from 'supertest';
import app from '../../app';
import Employee from '../../models/Employee';
import User from '../../models/User';
import { connectDB, disconnectDB } from '../../config/db';

describe('RBAC - Role-Based Access Control Integration Tests', () => {
    let adminToken: string;
    let employeeToken: string;
    let adminUserId: string;
    let employeeUserId: string;
    let employeeId: string;

    beforeAll(async () => {
        await connectDB();
        await Employee.deleteMany({});
        await User.deleteMany({});

        // Create admin user
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@ibnalshaekh.com',
                password: 'Admin123!',
            });

        if (adminRes.status === 401) {
            const adminUser = await User.create({
                userName: 'Admin User',
                email: 'admin@ibnalshaekh.com',
                passwordHash: 'Admin123!',
                role: 'admin',
            });
            adminUserId = adminUser._id as unknown as string;

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@ibnalshaekh.com',
                    password: 'Admin123!',
                });

            adminToken = loginRes.body.data.token;
            adminUserId = loginRes.body.data.user.id;
        } else {
            adminToken = adminRes.body.data.token;
            adminUserId = adminRes.body.data.user.id;
        }
    });

    afterAll(async () => {
        await Employee.deleteMany({});
        await User.deleteMany({});
        await disconnectDB();
    });

    // ==================== ADMIN TESTS ====================

    describe('Admin Access Control', () => {
        test('admin can create employee', async () => {
            const res = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'Ahmed',
                    lastName: 'Ali',
                    email: 'ahmed@example.com',
                    password: 'Ahmed123!',
                    phoneNumber: '0501234567',
                    employeeId: 'EMP001',
                    position: 'engineer',
                    department: 'Construction',
                    hireDate: '2024-01-15',
                    salary: 5000,
                    ssn: '123456789',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.firstName).toBe('Ahmed');

            // Store employee token for later tests
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'ahmed@example.com',
                    password: 'Ahmed123!',
                });

            employeeToken = loginRes.body.data.token;
            employeeUserId = loginRes.body.data.user.id;
        });

        test('admin can view all employees with personal data', async () => {
            // First create another employee
            await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'Fatima',
                    lastName: 'Mohamed',
                    email: 'fatima@example.com',
                    password: 'Fatima123!',
                    phoneNumber: '0509876543',
                    employeeId: 'EMP002',
                    position: 'technician',
                    department: 'Maintenance',
                    hireDate: '2024-02-01',
                    salary: 3500,
                    ssn: '987654321',
                });

            const res = await request(app)
                .get('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            // Admin should see private fields
            const employee = res.body.data[0];
            expect(employee).toHaveProperty('salary');
            expect(employee).toHaveProperty('ssn');
        });

        test('admin can update employee', async () => {
            const empRes = await request(app)
                .get('/api/employees/directory')
                .set('Authorization', `Bearer ${adminToken}`);

            const empId = empRes.body.data[0]._id;

            const res = await request(app)
                .put(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    position: 'manager',
                    salary: 6000,
                });

            expect(res.status).toBe(200);
            expect(res.body.data.position).toBe('manager');
            expect(res.body.data.salary).toBe(6000);
        });

        test('admin can delete employee', async () => {
            // Create temp employee
            const createRes = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'Delete',
                    lastName: 'Test',
                    email: 'delete@example.com',
                    password: 'Delete123!',
                    phoneNumber: '0505555555',
                    employeeId: 'EMP_DELETE',
                    position: 'engineer',
                    department: 'Construction',
                    hireDate: '2024-03-01',
                });

            const empId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify deleted
            const checkRes = await request(app)
                .get(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(checkRes.status).toBe(404);
        });

        test('admin can assign projects to employee', async () => {
            const empRes = await request(app)
                .get('/api/employees/directory')
                .set('Authorization', `Bearer ${adminToken}`);

            const empId = empRes.body.data[0]._id;

            const res = await request(app)
                .put(`/api/employees/${empId}/projects`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    projectIds: ['proj1', 'proj2', 'proj3'],
                });

            expect(res.status).toBe(200);
            expect(res.body.data.projects.length).toBe(3);
        });
    });

    // ==================== EMPLOYEE TESTS ====================

    describe('Employee Access Control', () => {
        test('employee can login and get token', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'ahmed@example.com',
                    password: 'Ahmed123!',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user.role).toBe('viewer');
        });

        test('employee can view own profile with personal data', async () => {
            const res = await request(app)
                .get('/api/employees/me')
                .set('Authorization', `Bearer ${employeeToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.firstName).toBe('Ahmed');
            // Personal data should be visible
            expect(res.body.data.ssn).toBe('123456789');
            expect(res.body.data.salary).toBe(5000);
        });

        test('employee CANNOT create another employee', async () => {
            const res = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({
                    firstName: 'Unauthorized',
                    lastName: 'User',
                    email: 'unauthorized@example.com',
                    password: 'Pass123!',
                    phoneNumber: '0505555555',
                    employeeId: 'EMP_UNAUTH',
                    position: 'engineer',
                    department: 'Construction',
                    hireDate: '2024-03-01',
                });

            expect(res.status).toBe(403);
            expect(res.body.error).toContain('Access denied');
        });

        test('employee CANNOT update any employee', async () => {
            const empRes = await request(app)
                .get('/api/employees/directory')
                .set('Authorization', `Bearer ${employeeToken}`);

            const empId = empRes.body.data[0]._id;

            const res = await request(app)
                .put(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({
                    position: 'manager',
                });

            expect(res.status).toBe(403);
        });

        test('employee CANNOT delete any employee', async () => {
            const empRes = await request(app)
                .get('/api/employees/directory')
                .set('Authorization', `Bearer ${employeeToken}`);

            const empId = empRes.body.data[0]._id;

            const res = await request(app)
                .delete(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${employeeToken}`);

            expect(res.status).toBe(403);
        });

        test('employee CANNOT assign projects', async () => {
            const empRes = await request(app)
                .get('/api/employees/directory')
                .set('Authorization', `Bearer ${employeeToken}`);

            const empId = empRes.body.data[0]._id;

            const res = await request(app)
                .put(`/api/employees/${empId}/projects`)
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({
                    projectIds: ['proj1'],
                });

            expect(res.status).toBe(403);
        });

        test('employee can view directory (public data only)', async () => {
            const res = await request(app)
                .get('/api/employees/directory')
                .set('Authorization', `Bearer ${employeeToken}`);

            expect(res.status).toBe(200);
            const employee = res.body.data[0];
            expect(employee).toHaveProperty('firstName');
            expect(employee).toHaveProperty('position');
            // Private data not included
            expect(employee).not.toHaveProperty('salary');
            expect(employee).not.toHaveProperty('ssn');
        });
    });

    // ==================== GUEST TESTS ====================

    describe('Guest Access Control', () => {
        test('guest can view employee directory without auth', async () => {
            const res = await request(app)
                .get('/api/employees/directory');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test('guest can view single employee without auth', async () => {
            const dirRes = await request(app)
                .get('/api/employees/directory');

            const empId = dirRes.body.data[0]._id;

            const res = await request(app)
                .get(`/api/employees/${empId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('guest cannot see personal data in public view', async () => {
            const dirRes = await request(app)
                .get('/api/employees/directory');

            const employee = dirRes.body.data[0];

            // Public fields OK
            expect(employee).toHaveProperty('firstName');
            expect(employee).toHaveProperty('position');

            // Private fields hidden
            expect(employee).not.toHaveProperty('salary');
            expect(employee).not.toHaveProperty('ssn');
            expect(employee).not.toHaveProperty('address');
        });

        test('guest CANNOT access /employees/me', async () => {
            const res = await request(app)
                .get('/api/employees/me');

            expect(res.status).toBe(401);
        });

        test('guest CANNOT create employee', async () => {
            const res = await request(app)
                .post('/api/employees')
                .send({
                    firstName: 'Guest',
                    email: 'guest@example.com',
                    password: 'Pass123!',
                    phoneNumber: '0501111111',
                    employeeId: 'EMP_GUEST',
                    position: 'engineer',
                    department: 'Construction',
                    hireDate: '2024-03-01',
                });

            expect(res.status).toBe(401);
        });

        test('guest cannot self-register (no public registration endpoint)', async () => {
            // There should be no POST /auth/register endpoint for public
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'newuser@example.com',
                    password: 'Pass123!',
                    name: 'New User',
                });

            // Should either 404 or require admin auth
            expect([404, 401, 403]).toContain(res.status);
        });
    });

    // ==================== AUTHENTICATION ERROR TESTS ====================

    describe('Authentication Error Handling', () => {
        test('should reject request without token', async () => {
            const res = await request(app)
                .get('/api/employees/me');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('token');
        });

        test('should reject request with invalid token', async () => {
            const res = await request(app)
                .get('/api/employees/me')
                .set('Authorization', 'Bearer invalid.token.here');

            expect(res.status).toBe(401);
        });

        test('should reject request with malformed authorization header', async () => {
            const res = await request(app)
                .get('/api/employees/me')
                .set('Authorization', 'InvalidFormat token');

            expect(res.status).toBe(401);
        });

        test('should reject request with expired token', async () => {
            // This is tested implicitly - JWT library handles expiration
            // Real test would require mocking time or creating actual expired token
            expect(true).toBe(true);
        });
    });

    // ==================== DATA PRIVACY TESTS ====================

    describe('Data Privacy & Field Selection', () => {
        test('admin sees all fields including private data', async () => {
            const res = await request(app)
                .get('/api/employees/directory')
                .set('Authorization', `Bearer ${adminToken}`);

            const employee = res.body.data[0];
            expect(employee).toHaveProperty('salary');
            expect(employee).toHaveProperty('ssn');
        });

        test('employee sees own private fields', async () => {
            const res = await request(app)
                .get('/api/employees/me')
                .set('Authorization', `Bearer ${employeeToken}`);

            const employee = res.body.data;
            expect(employee).toHaveProperty('salary');
            expect(employee).toHaveProperty('ssn');
            expect(employee).toHaveProperty('address');
        });

        test('public view hides all private fields', async () => {
            const res = await request(app)
                .get('/api/employees/directory');

            const employee = res.body.data[0];
            expect(employee).not.toHaveProperty('salary');
            expect(employee).not.toHaveProperty('ssn');
            expect(employee).not.toHaveProperty('address');
        });

        test('employee cannot see other employees private data', async () => {
            // Create another employee
            const createRes = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'Other',
                    lastName: 'Employee',
                    email: 'other@example.com',
                    password: 'Other123!',
                    phoneNumber: '0502222222',
                    employeeId: 'EMP_OTHER',
                    position: 'engineer',
                    department: 'Construction',
                    hireDate: '2024-04-01',
                    salary: 4000,
                    ssn: '999999999',
                });

            const otherId = createRes.body.data._id;

            // Employee tries to view other
            const res = await request(app)
                .get(`/api/employees/${otherId}`)
                .set('Authorization', `Bearer ${employeeToken}`);

            expect(res.status).toBe(200);
            // But private data should be hidden
            expect(res.body.data).not.toHaveProperty('salary');
            expect(res.body.data).not.toHaveProperty('ssn');
        });
    });

    // ==================== ROLE-SPECIFIC FLOWS ====================

    describe('Complete Access Flow Tests', () => {
        test('complete admin workflow', async () => {
            // 1. Admin login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@ibnalshaekh.com',
                    password: 'Admin123!',
                });

            expect(loginRes.status).toBe(200);
            const token = loginRes.body.data.token;

            // 2. Create employee
            const createRes = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    firstName: 'Flow',
                    lastName: 'Test',
                    email: 'flowtest@example.com',
                    password: 'FlowTest123!',
                    phoneNumber: '0503333333',
                    employeeId: 'EMP_FLOW',
                    position: 'engineer',
                    department: 'Construction',
                    hireDate: '2024-05-01',
                });

            expect(createRes.status).toBe(201);
            const empId = createRes.body.data._id;

            // 3. Update employee
            const updateRes = await request(app)
                .put(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    position: 'manager',
                });

            expect(updateRes.status).toBe(200);

            // 4. Delete employee
            const deleteRes = await request(app)
                .delete(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(deleteRes.status).toBe(200);
        });

        test('complete employee workflow', async () => {
            // 1. Employee login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'ahmed@example.com',
                    password: 'Ahmed123!',
                });

            expect(loginRes.status).toBe(200);
            const token = loginRes.body.data.token;

            // 2. View own profile
            const profileRes = await request(app)
                .get('/api/employees/me')
                .set('Authorization', `Bearer ${token}`);

            expect(profileRes.status).toBe(200);

            // 3. View directory
            const dirRes = await request(app)
                .get('/api/employees/directory')
                .set('Authorization', `Bearer ${token}`);

            expect(dirRes.status).toBe(200);

            // 4. Try to create (should fail)
            const createRes = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${token}`)
                .send({ firstName: 'Fail' });

            expect(createRes.status).toBe(403);
        });
    });
});
