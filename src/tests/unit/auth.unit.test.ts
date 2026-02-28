/**
 * Comprehensive Authentication Tests
 * اختبارات شاملة للمصادقة والتفويض
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as authController from '../../controllers/authController';
import User, { IUser } from '../../models/User';
import { AppError } from '../../utils/AppError';

jest.mock('../../models/User');

describe('Authentication Controller - Unit Tests', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = {
            user: {
                _id: 'user123' as unknown as mongoose.Types.ObjectId,
                userName: 'testuser',
                email: 'test@example.com',
                role: 'user',
                passwordHash: 'hashed',
                createdAt: new Date(),
                updatedAt: new Date(),
                comparePassword: jest.fn(),
            } as unknown as IUser,
            body: {},
        };
        mockResponse = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    describe('Login', () => {
        test('Should login with valid credentials (admin)', async () => {
            const mockUser = {
                _id: 'admin123' as unknown as mongoose.Types.ObjectId,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                comparePassword: jest.fn().mockResolvedValue(true),
            };

            mockRequest.body = {
                email: 'admin@example.com',
                password: 'AdminPass123!',
            };

            (User.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            await authController.login(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockResponse.json).toHaveBeenCalled();
            const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
            expect(response.success).toBe(true);
            expect(response.data.user.role).toBe('admin');
        });

        test('Should login with valid credentials (user)', async () => {
            const mockUser = {
                _id: 'user123' as unknown as mongoose.Types.ObjectId,
                userName: 'TestUser',
                email: 'user@example.com',
                role: 'user',
                comparePassword: jest.fn().mockResolvedValue(true),
            };

            mockRequest.body = {
                email: 'user@example.com',
                password: 'UserPass123!',
            };

            (User.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            await authController.login(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockResponse.json).toHaveBeenCalled();
            const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
            expect(response.success).toBe(true);
            expect(response.data.user.role).toBe('user');
        });

        test('Should reject invalid credentials', async () => {
            mockRequest.body = {
                email: 'admin@example.com',
                password: 'WrongPassword',
            };

            const mockUser = {
                comparePassword: jest.fn().mockResolvedValue(false),
            };

            (User.findOne as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            await authController.login(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });

        test('Should reject missing email or password', async () => {
            mockRequest.body = { email: 'admin@example.com' };

            await authController.login(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('Register (Admin Only)', () => {
        test('Should register new user as admin', async () => {
            mockRequest.body = {
                userName: 'New User',
                email: 'newuser@example.com',
                password: 'SecurePass123!',
                role: 'user',
            };

            (User.findOne as jest.Mock).mockResolvedValue(null);
            (User.create as jest.Mock).mockResolvedValue({
                _id: 'newuser123' as unknown as mongoose.Types.ObjectId,
                ...mockRequest.body,
            });

            await authController.register(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockResponse.status).toHaveBeenCalledWith(201);
        });

        test('Should reject duplicate email', async () => {
            mockRequest.body = {
                name: 'Duplicate User',
                email: 'existing@example.com',
                password: 'Pass123!',
            };

            (User.findOne as jest.Mock).mockResolvedValue({ email: 'existing@example.com' });

            await authController.register(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('Get Current User', () => {
        test('Should return logged-in user data', async () => {
            mockRequest.user = {
                _id: 'user123' as unknown as mongoose.Types.ObjectId,
                userName: 'Current User',
                email: 'user@example.com',
                role: 'user',
                passwordHash: 'hashed',
                createdAt: new Date(),
                updatedAt: new Date(),
                comparePassword: jest.fn(),
            } as unknown as IUser;

            await authController.getMe(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.json).toHaveBeenCalled();
            const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
            expect(response.data.email).toBe('user@example.com');
        });
    });

    describe('Change Password', () => {
        test('Should change password successfully', async () => {
            mockRequest.user = {
                _id: 'user123' as unknown as mongoose.Types.ObjectId,
                userName: 'testuser',
                email: 'test@example.com',
                role: 'user',
                passwordHash: 'hashed',
                createdAt: new Date(),
                updatedAt: new Date(),
                comparePassword: jest.fn(),
            } as unknown as IUser;

            mockRequest.body = {
                currentPassword: 'OldPass123!',
                newPassword: 'NewPass123!',
            };

            const mockUser = {
                _id: 'user123' as unknown as mongoose.Types.ObjectId,
                comparePassword: jest.fn().mockResolvedValue(true),
                save: jest.fn().mockResolvedValue(true),
            };

            (User.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            await authController.changePassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockResponse.json).toHaveBeenCalled();
        });

        test('Should reject wrong current password', async () => {
            mockRequest.user = {
                _id: 'user123' as unknown as mongoose.Types.ObjectId,
                userName: 'testuser',
                email: 'test@example.com',
                role: 'user',
                passwordHash: 'hashed',
                createdAt: new Date(),
                updatedAt: new Date(),
                comparePassword: jest.fn(),
            } as unknown as IUser;

            mockRequest.body = {
                currentPassword: 'WrongPass',
                newPassword: 'NewPass123!',
            };

            const mockUser = {
                comparePassword: jest.fn().mockResolvedValue(false),
            };

            (User.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser),
            });

            await authController.changePassword(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
        });
    });
});
