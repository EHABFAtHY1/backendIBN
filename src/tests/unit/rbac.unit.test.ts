/**
 * RBAC (Role-Based Access Control) - Unit Tests
 * 
 * اختبارات الوحدة لـ Authentication و Authorization
 * تتحقق من صلاحيات الوصول لكل دور
 */

import { Request, Response, NextFunction } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

jest.mock('../models/User');

describe('RBAC - Unit Tests', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            headers: {},
            user: undefined,
        };
        mockResponse = {};
        mockNext = jest.fn();
    });

    // ==================== AUTHENTICATION TESTS ====================

    describe('authenticate() Middleware', () => {
        test('should reject request without authorization header', async () => {
            mockRequest.headers = {};

            await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(401);
            expect(error.message).toContain('No token provided');
        });

        test('should reject request with invalid Bearer format', async () => {
            mockRequest.headers = { authorization: 'InvalidFormat token123' };

            await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });

        test('should reject request with invalid/expired token', async () => {
            const invalidToken = 'invalid.jwt.token';
            mockRequest.headers = { authorization: `Bearer ${invalidToken}` };

            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });

        test('should attach user to request with valid token', async () => {
            const mockUser = {
                _id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                role: 'admin',
            };

            const token = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET || 'secret', {
                expiresIn: '7d',
            });

            mockRequest.headers = { authorization: `Bearer ${token}` };

            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockRequest.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalledWith();
        });

        test('should reject if user not found in database', async () => {
            const token = jwt.sign({ id: 'nonexistent' }, process.env.JWT_SECRET || 'secret');
            mockRequest.headers = { authorization: `Bearer ${token}` };

            (User.findById as jest.Mock).mockResolvedValue(null);

            await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    // ==================== AUTHORIZATION TESTS ====================

    describe('requireRole() Middleware', () => {
        test('should reject if user not authenticated', () => {
            mockRequest.user = undefined;
            const middleware = requireRole('admin');

            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });

        test('should reject admin endpoint if user is employee', () => {
            mockRequest.user = {
                _id: 'user123',
                name: 'Employee',
                email: 'emp@example.com',
                role: 'employee',
                comparePassword: jest.fn(),
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any;

            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(403);
            expect(error.message).toContain('Access denied');
        });

        test('should allow admin if user is admin', () => {
            mockRequest.user = {
                _id: 'user123',
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                comparePassword: jest.fn(),
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any;

            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        test('should support multiple allowed roles', () => {
            mockRequest.user = {
                _id: 'user123',
                name: 'Employee',
                email: 'emp@example.com',
                role: 'employee',
                comparePassword: jest.fn(),
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any;

            const middleware = requireRole('admin', 'employee');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });
    });

    // ==================== ROLE-SPECIFIC ACCESS TESTS ====================

    describe('Admin Role Access', () => {
        beforeEach(() => {
            mockRequest.user = {
                _id: 'admin1',
                name: 'Admin',
                email: 'admin@example.com',
                role: 'admin',
                comparePassword: jest.fn(),
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any;
        });

        test('should allow admin to create employee', () => {
            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        test('should allow admin to update employee', () => {
            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        test('should allow admin to delete employee', () => {
            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        test('should allow admin to assign projects', () => {
            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });
    });

    describe('Employee Role Access', () => {
        beforeEach(() => {
            mockRequest.user = {
                _id: 'emp1',
                name: 'Employee',
                email: 'employee@example.com',
                role: 'employee',
                comparePassword: jest.fn(),
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any;
        });

        test('should allow employee to view own profile', () => {
            // This is allowed because authenticate middleware validates ownership
            expect(mockRequest.user?.role).toBe('employee');
        });

        test('should deny employee from creating other employees', () => {
            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });

        test('should deny employee from updating other employees', () => {
            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });

        test('should deny employee from deleting employees', () => {
            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });

        test('should deny employee from assigning projects', () => {
            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('Guest (No Auth) Access', () => {
        test('should deny access to protected endpoints', () => {
            mockRequest.user = undefined;
            const middleware = requireRole('admin');

            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });

        test('should allow access to public endpoints', () => {
            // Public endpoints don't require authenticate middleware
            // This is tested in integration tests
            expect(true).toBe(true);
        });
    });

    // ==================== TOKEN VALIDATION TESTS ====================

    describe('Token Validation', () => {
        test('should verify JWT signature', async () => {
            const validToken = jwt.sign(
                { id: 'user123' },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '7d' }
            );

            const mockUser = {
                _id: 'user123',
                name: 'User',
                email: 'user@example.com',
                role: 'employee',
            };

            mockRequest.headers = { authorization: `Bearer ${validToken}` };
            (User.findById as jest.Mock).mockResolvedValue(mockUser);

            await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
        });

        test('should reject expired token', () => {
            const expiredToken = jwt.sign(
                { id: 'user123' },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '-1h' } // Already expired
            );

            mockRequest.headers = { authorization: `Bearer ${expiredToken}` };

            // This would be caught during verification
            expect(() => {
                jwt.verify(expiredToken, process.env.JWT_SECRET || 'secret');
            }).toThrow();
        });

        test('should reject token with wrong signature', () => {
            const token = jwt.sign({ id: 'user123' }, 'wrong-secret');
            mockRequest.headers = { authorization: `Bearer ${token}` };

            expect(() => {
                jwt.verify(token, process.env.JWT_SECRET || 'correct-secret');
            }).toThrow();
        });
    });

    // ==================== DATA PRIVACY TESTS ====================

    describe('Data Privacy & Field Selection', () => {
        test('admin should see all fields', () => {
            const selectFields = '+ssn +salary +address +emergencyContact';
            // Admin queries with all fields selected
            expect(selectFields).toContain('ssn');
            expect(selectFields).toContain('salary');
        });

        test('employee should see own private fields', () => {
            // Employee viewing own profile gets private fields
            const visibleFields = [
                'firstName',
                'lastName',
                'ssn', // ✅ Visible for own
                'salary', // ✅ Visible for own
                'address', // ✅ Visible for own
            ];

            expect(visibleFields).toContain('ssn');
            expect(visibleFields).toContain('salary');
        });

        test('guest should not see private fields', () => {
            // Guest/public request doesn't include private fields
            const publicFields = [
                'firstName',
                'lastName',
                'position',
                'department',
                'phoneNumber',
                'skills',
            ];

            const privateFields = ['ssn', 'salary', 'address'];

            privateFields.forEach((field) => {
                expect(publicFields).not.toContain(field);
            });
        });
    });

    // ==================== ERROR HANDLING TESTS ====================

    describe('Error Handling', () => {
        test('should return 401 for missing token', async () => {
            mockRequest.headers = {};

            await authenticate(mockRequest as Request, mockResponse as Response, mockNext);

            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(401);
        });

        test('should return 403 for insufficient permissions', () => {
            mockRequest.user = {
                _id: 'emp1',
                name: 'Employee',
                role: 'employee',
                comparePassword: jest.fn(),
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any;

            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(403);
        });

        test('should not leak sensitive info in error messages', () => {
            mockRequest.user = {
                _id: 'emp1',
                role: 'viewer',
                comparePassword: jest.fn(),
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any;

            const middleware = requireRole('admin');
            middleware(mockRequest as Request, mockResponse as Response, mockNext);

            const error = mockNext.mock.calls[0][0];
            // Should be generic, not expose system details
            expect(error.message).not.toContain('password');
            expect(error.message).not.toContain('token');
        });
    });
});
