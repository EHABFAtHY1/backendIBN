/**
 * Employee Integration Tests
 * 
 * هذا الملف يحتوي على اختبارات التكامل لـ Employee API
 * التي تتحقق من تفاعل جميع المكونات معاً
 */

import request from 'supertest';
import app from '../../app';
import Employee from '../../models/Employee';
import User from '../../models/User';
import { connectDB, disconnectDB } from '../../config/db';

describe('Employee API - Integration Tests', () => {
    let adminToken: string;
    let employeeToken: string;
    let adminUserId: string;
    let employeeUserId: string;
    let employeeId: string;

    beforeAll(async () => {
        // Connect to test database
        await connectDB();

        // Clear collections
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
            // Create admin if not exists
            await User.create({
                name: 'Admin User',
                email: 'admin@ibnalshaekh.com',
                password: 'Admin123!',
                role: 'admin',
            });

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
        // Cleanup
        await Employee.deleteMany({});
        await User.deleteMany({});
        await disconnectDB();
    });

    // ==================== PUBLIC ROUTES ====================

    describe('GET /api/employees/directory - Public endpoint', () => {
        test('should return employee directory without authentication', async () => {
            // First create an employee
            await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'أحمد',
                    lastName: 'محمد',
                    email: 'ahmed@example.com',
                    password: 'Ahmed123!',
                    phoneNumber: '0501234567',
                    employeeId: 'EMP001',
                    position: 'engineer',
                    department: 'إنشاءات',
                    hireDate: '2024-01-15',
                    skills: ['AutoCAD'],
                });

            const res = await request(app).get('/api/employees/directory');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data[0]).toHaveProperty('firstName');
            expect(res.body.data[0]).toHaveProperty('position');
            // Personal data should NOT be included
            expect(res.body.data[0]).not.toHaveProperty('ssn');
            expect(res.body.data[0]).not.toHaveProperty('salary');
        });

        test('should only return active employees', async () => {
            const res = await request(app).get('/api/employees/directory');

            expect(res.status).toBe(200);
            res.body.data.forEach((emp: any) => {
                expect(emp.isActive).toBe(true);
            });
        });
    });

    describe('GET /api/employees/:id - Public endpoint', () => {
        test('should return single employee public profile', async () => {
            // Get first employee
            const dirRes = await request(app).get('/api/employees/directory');
            const empId = dirRes.body.data[0]._id;

            const res = await request(app).get(`/api/employees/${empId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(empId);
            expect(res.body.data).not.toHaveProperty('ssn');
            expect(res.body.data).not.toHaveProperty('salary');
        });

        test('should return 404 for nonexistent employee', async () => {
            const res = await request(app).get('/api/employees/nonexistent123');

            expect(res.status).toBe(404);
        });
    });

    // ==================== PROTECTED ROUTES ====================

    describe('GET /api/employees/me - Protected endpoint', () => {
        test('should return employee own profile with personal data', async () => {
            // Create employee
            const empRes = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'فاطمة',
                    lastName: 'علي',
                    email: 'fatima@example.com',
                    password: 'Fatima123!',
                    phoneNumber: '0509876543',
                    employeeId: 'EMP002',
                    position: 'technician',
                    department: 'الصيانة',
                    hireDate: '2024-02-01',
                    ssn: '123456789',
                    salary: 3500,
                });

            // Login as employee
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'fatima@example.com',
                    password: 'Fatima123!',
                });

            employeeToken = loginRes.body.data.token;

            const res = await request(app)
                .get('/api/employees/me')
                .set('Authorization', `Bearer ${employeeToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.firstName).toBe('فاطمة');
            // Personal data SHOULD be included for own profile
            expect(res.body.data).toHaveProperty('ssn');
            expect(res.body.data).toHaveProperty('salary');
            expect(res.body.data.ssn).toBe('123456789');
            expect(res.body.data.salary).toBe(3500);
        });

        test('should return 401 without token', async () => {
            const res = await request(app).get('/api/employees/me');

            expect(res.status).toBe(401);
        });
    });

    // ==================== ADMIN ROUTES ====================

    describe('POST /api/employees - Create employee (Admin only)', () => {
        test('should create employee with all data', async () => {
            const res = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'محمد',
                    lastName: 'سالم',
                    email: 'mohammad@example.com',
                    password: 'Mohammad123!',
                    phoneNumber: '0505555555',
                    employeeId: 'EMP003',
                    position: 'supervisor',
                    department: 'الإشراف',
                    hireDate: '2024-03-01',
                    skills: ['Project Management', 'Leadership'],
                    salary: 4500,
                    ssn: '987654321',
                    dateOfBirth: '1990-05-15',
                    address: 'الرياض - حي العليا',
                    emergencyContact: '0505555556',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.firstName).toBe('محمد');
            expect(res.body.data.employeeId).toBe('EMP003');
            expect(res.body.data.position).toBe('supervisor');

            // Verify user account created
            const userExists = await User.findOne({ email: 'mohammad@example.com' });
            expect(userExists).not.toBeNull();
            expect(userExists!.role).toBe('employee');
        });

        test('should return error if email already exists', async () => {
            const res = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'تكرار',
                    lastName: 'بريد',
                    email: 'mohammad@example.com', // Already exists
                    password: 'Pass123!',
                    phoneNumber: '0505555555',
                    employeeId: 'EMP999',
                    position: 'engineer',
                    department: 'إنشاءات',
                    hireDate: '2024-03-01',
                });

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
        });

        test('should return error if employee ID already exists', async () => {
            const res = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'تكرار',
                    lastName: 'موظف',
                    email: 'another@example.com',
                    password: 'Pass123!',
                    phoneNumber: '0505555555',
                    employeeId: 'EMP003', // Already exists
                    position: 'engineer',
                    department: 'إنشاءات',
                    hireDate: '2024-03-01',
                });

            expect(res.status).toBe(409);
        });

        test('should return 401 without token', async () => {
            const res = await request(app)
                .post('/api/employees')
                .send({
                    firstName: 'اختبار',
                    lastName: 'بدون توكن',
                    email: 'test@example.com',
                    password: 'Pass123!',
                    phoneNumber: '0505555555',
                    employeeId: 'EMP999',
                    position: 'engineer',
                    department: 'إنشاءات',
                    hireDate: '2024-03-01',
                });

            expect(res.status).toBe(401);
        });

        test('should return 403 if not admin', async () => {
            const res = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({
                    firstName: 'اختبار',
                    lastName: 'موظف عادي',
                    email: 'notadmin@example.com',
                    password: 'Pass123!',
                    phoneNumber: '0505555555',
                    employeeId: 'EMP888',
                    position: 'engineer',
                    department: 'إنشاءات',
                    hireDate: '2024-03-01',
                });

            expect(res.status).toBe(403);
        });
    });

    describe('PUT /api/employees/:id - Update employee (Admin only)', () => {
        test('should update employee data', async () => {
            // Get employee ID
            const empRes = await request(app).get('/api/employees/directory');
            const empId = empRes.body.data[0]._id;

            const res = await request(app)
                .put(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    position: 'manager',
                    department: 'إدارة المشاريع',
                    salary: 6000,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.position).toBe('manager');
            expect(res.body.data.department).toBe('إدارة المشاريع');
        });

        test('should return 404 if employee not found', async () => {
            const res = await request(app)
                .put(`/api/employees/nonexistent123`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    position: 'manager',
                });

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/employees/:id/projects - Update projects (Admin only)', () => {
        test('should update employee projects', async () => {
            const empRes = await request(app).get('/api/employees/directory');
            const empId = empRes.body.data[0]._id;

            const res = await request(app)
                .put(`/api/employees/${empId}/projects`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    projectIds: ['proj1', 'proj2', 'proj3'],
                });

            expect(res.status).toBe(200);
            expect(res.body.data.projects).toEqual(['proj1', 'proj2', 'proj3']);
        });

        test('should return error if projectIds not array', async () => {
            const empRes = await request(app).get('/api/employees/directory');
            const empId = empRes.body.data[0]._id;

            const res = await request(app)
                .put(`/api/employees/${empId}/projects`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    projectIds: 'proj1', // Not array
                });

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/employees/:id - Delete employee (Admin only)', () => {
        test('should delete employee and user account', async () => {
            // Create employee to delete
            const createRes = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'حذف',
                    lastName: 'موظف',
                    email: 'delete@example.com',
                    password: 'Delete123!',
                    phoneNumber: '0501111111',
                    employeeId: 'EMP_DELETE',
                    position: 'engineer',
                    department: 'إنشاءات',
                    hireDate: '2024-04-01',
                });

            const empId = createRes.body.data._id;

            // Delete employee
            const deleteRes = await request(app)
                .delete(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(deleteRes.status).toBe(200);
            expect(deleteRes.body.success).toBe(true);

            // Verify employee deleted
            const checkEmp = await Employee.findById(empId);
            expect(checkEmp).toBeNull();

            // Verify user deleted
            const checkUser = await User.findOne({ email: 'delete@example.com' });
            expect(checkUser).toBeNull();
        });

        test('should return 404 if employee not found', async () => {
            const res = await request(app)
                .delete(`/api/employees/nonexistent123`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(404);
        });
    });

    // ==================== AUTHORIZATION TESTS ====================

    describe('Authorization checks', () => {
        test('non-admin cannot create employee', async () => {
            const res = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({
                    firstName: 'اختبار',
                    lastName: 'غير مصرح',
                    email: 'unauthorized@example.com',
                    password: 'Pass123!',
                    phoneNumber: '0505555555',
                    employeeId: 'EMP_UNAUTH',
                    position: 'engineer',
                    department: 'إنشاءات',
                    hireDate: '2024-04-01',
                });

            expect(res.status).toBe(403);
        });

        test('non-admin cannot update employee', async () => {
            const empRes = await request(app).get('/api/employees/directory');
            const empId = empRes.body.data[0]._id;

            const res = await request(app)
                .put(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({
                    position: 'manager',
                });

            expect(res.status).toBe(403);
        });

        test('non-admin cannot delete employee', async () => {
            const empRes = await request(app).get('/api/employees/directory');
            const empId = empRes.body.data[0]._id;

            const res = await request(app)
                .delete(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${employeeToken}`);

            expect(res.status).toBe(403);
        });
    });

    // ==================== DATA PRIVACY TESTS ====================

    describe('Data Privacy', () => {
        test('employee cannot see another employee personal data', async () => {
            // Create another employee
            const createRes = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    firstName: 'أخر',
                    lastName: 'موظف',
                    email: 'other@example.com',
                    password: 'Other123!',
                    phoneNumber: '0509999999',
                    employeeId: 'EMP_OTHER',
                    position: 'engineer',
                    department: 'إنشاءات',
                    hireDate: '2024-04-01',
                    salary: 5000,
                    ssn: '111111111',
                });

            const empId = createRes.body.data._id;

            // Try to view with employee token
            const res = await request(app)
                .get(`/api/employees/${empId}`)
                .set('Authorization', `Bearer ${employeeToken}`);

            expect(res.status).toBe(200);
            // Public data visible
            expect(res.body.data).toHaveProperty('firstName');
            // Personal data NOT visible
            expect(res.body.data).not.toHaveProperty('ssn');
            expect(res.body.data).not.toHaveProperty('salary');
        });

        test('only own profile shows personal data', async () => {
            // Login as employee
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'other@example.com',
                    password: 'Other123!',
                });

            const ownToken = loginRes.body.data.token;

            // Get own profile
            const res = await request(app)
                .get('/api/employees/me')
                .set('Authorization', `Bearer ${ownToken}`);

            expect(res.status).toBe(200);
            // Should see personal data
            expect(res.body.data).toHaveProperty('ssn');
            expect(res.body.data).toHaveProperty('salary');
        });
    });
});
