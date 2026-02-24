/**
 * Employee Controller Unit Tests
 * 
 * هذا الملف يحتوي على اختبارات الوحدة لـ Employee Controller
 * التي تتحقق من أن كل دالة تعمل بشكل صحيح بمعزل عن غيرها
 */

import { Request, Response, NextFunction } from 'express';
import * as employeeController from '../controllers/employeeController';
import Employee from '../models/Employee';
import User from '../models/User';
import { AppError } from '../utils/AppError';

// Mock the models
jest.mock('../models/Employee');
jest.mock('../models/User');

describe('Employee Controller - Unit Tests', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Setup mock request/response
        mockRequest = {
            user: { _id: 'user123' },
            params: {},
            body: {},
        };

        mockResponse = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();
    });

    describe('getMyProfile', () => {
        test('should return employee profile with personal data', async () => {
            const mockEmployee = {
                _id: 'emp123',
                firstName: 'أحمد',
                lastName: 'محمد',
                position: 'engineer',
                email: 'ahmed@example.com',
                ssn: '123456789',
                salary: 5000,
                populate: jest.fn().mockReturnThis(),
            };

            (Employee.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockEmployee),
                }),
            });

            await employeeController.getMyProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockEmployee,
            });
        });

        test('should return 404 if employee profile not found', async () => {
            (Employee.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null),
                }),
            });

            await employeeController.getMyProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('getEmployeeDirectory', () => {
        test('should return list of active employees', async () => {
            const mockEmployees = [
                {
                    _id: 'emp1',
                    firstName: 'أحمد',
                    lastName: 'علي',
                    position: 'engineer',
                    department: 'إنشاءات',
                },
                {
                    _id: 'emp2',
                    firstName: 'فاطمة',
                    lastName: 'محمد',
                    position: 'technician',
                    department: 'صيانة',
                },
            ];

            (Employee.find as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        sort: jest.fn().mockResolvedValue(mockEmployees),
                    }),
                }),
            });

            await employeeController.getEmployeeDirectory(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockEmployees,
                count: 2,
            });
        });
    });

    describe('createEmployee', () => {
        test('should create new employee with user account', async () => {
            mockRequest.body = {
                firstName: 'أحمد',
                lastName: 'علي',
                email: 'ahmed@example.com',
                password: 'SecurePass123!',
                phoneNumber: '0501234567',
                employeeId: 'EMP001',
                position: 'engineer',
                department: 'إنشاءات',
                hireDate: '2024-01-15',
                skills: ['AutoCAD', 'Revit'],
                salary: 5000,
            };

            const mockUser = {
                _id: 'user123',
                name: 'أحمد علي',
                email: 'ahmed@example.com',
            };

            const mockEmployee = {
                _id: 'emp123',
                ...mockRequest.body,
                user: mockUser._id,
                populate: jest.fn().mockResolvedValue({
                    user: mockUser,
                    projects: [],
                }),
            };

            (User.findOne as jest.Mock).mockResolvedValue(null);
            (Employee.findOne as jest.Mock).mockResolvedValue(null);
            (User.create as jest.Mock).mockResolvedValue(mockUser);
            (Employee.create as jest.Mock).mockResolvedValue(mockEmployee);

            await employeeController.createEmployee(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(User.create).toHaveBeenCalledWith({
                name: 'أحمد علي',
                email: 'ahmed@example.com',
                password: 'SecurePass123!',
                role: 'employee',
            });

            expect(Employee.create).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });

        test('should return error if email already exists', async () => {
            mockRequest.body = {
                email: 'existing@example.com',
                firstName: 'أحمد',
                lastName: 'علي',
                password: 'Pass123!',
                phoneNumber: '0501234567',
                employeeId: 'EMP001',
                position: 'engineer',
                department: 'إنشاءات',
                hireDate: '2024-01-15',
            };

            (User.findOne as jest.Mock).mockResolvedValue({ email: 'existing@example.com' });

            await employeeController.createEmployee(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });

        test('should return error if required fields missing', async () => {
            mockRequest.body = {
                firstName: 'أحمد',
                // Missing required fields
            };

            await employeeController.createEmployee(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('updateEmployee', () => {
        test('should update employee data', async () => {
            mockRequest.params = { id: 'emp123' };
            mockRequest.body = {
                position: 'manager',
                department: 'إدارة مشاريع',
            };

            const mockEmployee = {
                _id: 'emp123',
                firstName: 'أحمد',
                lastName: 'علي',
                position: 'manager',
                department: 'إدارة مشاريع',
                populate: jest.fn().mockResolvedValue({}),
            };

            (Employee.findByIdAndUpdate as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockResolvedValue(mockEmployee),
                    }),
                }),
            });

            await employeeController.updateEmployee(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockEmployee,
                message: 'Employee updated successfully.',
            });
        });

        test('should return 404 if employee not found', async () => {
            mockRequest.params = { id: 'nonexistent' };
            mockRequest.body = { position: 'manager' };

            (Employee.findByIdAndUpdate as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        populate: jest.fn().mockResolvedValue(null),
                    }),
                }),
            });

            await employeeController.updateEmployee(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('deleteEmployee', () => {
        test('should delete employee and user account', async () => {
            mockRequest.params = { id: 'emp123' };

            const mockEmployee = {
                _id: 'emp123',
                user: 'user123',
            };

            (Employee.findById as jest.Mock).mockResolvedValue(mockEmployee);
            (User.findByIdAndDelete as jest.Mock).mockResolvedValue({});
            (Employee.findByIdAndDelete as jest.Mock).mockResolvedValue(mockEmployee);

            await employeeController.deleteEmployee(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(User.findByIdAndDelete).toHaveBeenCalledWith('user123');
            expect(Employee.findByIdAndDelete).toHaveBeenCalledWith('emp123');
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Employee and associated user account deleted successfully.',
            });
        });

        test('should return 404 if employee not found', async () => {
            mockRequest.params = { id: 'nonexistent' };

            (Employee.findById as jest.Mock).mockResolvedValue(null);

            await employeeController.deleteEmployee(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('updateEmployeeProjects', () => {
        test('should update employee projects', async () => {
            mockRequest.params = { id: 'emp123' };
            mockRequest.body = {
                projectIds: ['proj1', 'proj2', 'proj3'],
            };

            const mockEmployee = {
                _id: 'emp123',
                firstName: 'أحمد',
                projects: ['proj1', 'proj2', 'proj3'],
                populate: jest.fn().mockResolvedValue({}),
            };

            (Employee.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockEmployee),
                }),
            });

            await employeeController.updateEmployeeProjects(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockEmployee,
                message: 'Employee projects updated successfully.',
            });
        });

        test('should return error if projectIds is not array', async () => {
            mockRequest.params = { id: 'emp123' };
            mockRequest.body = {
                projectIds: 'proj1', // Not an array
            };

            await employeeController.updateEmployeeProjects(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });
    });
});
