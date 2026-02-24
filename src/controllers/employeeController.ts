import { Request, Response, NextFunction } from 'express';
import Employee from '../models/Employee';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import {
    PaginationDto,
    createPaginatedResponse,
    buildMongoDBQuery,
    parseSortString,
    parseFieldsString,
    parsePaginationParams,
} from '../dtos/PaginationDto';

/**
 * GET /api/employees/me
 * Employee views their own profile (basic info + personal data)
 */
export async function getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!._id;

        const employee = await Employee.findOne({ user: userId })
            .select('+ssn +dateOfBirth +address +emergencyContact +salary')
            .populate('user', 'name email')
            .populate('projects', 'title');

        if (!employee) {
            throw new AppError('Employee profile not found.', 404);
        }

        res.json({
            success: true,
            data: employee,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/employees/directory
 * View list of employees with pagination, filtering, and searching
 * Query params:
 *   - page: صفحة النتائج (default: 1)
 *   - size: عدد العناصر في الصفحة (default: 10, max: 100)
 *   - search: البحث في firstName, lastName, position, department
 *   - sort: الترتيب (مثال: "firstName,-department")
 *   - fields: الحقول المطلوبة (مثال: "firstName,lastName,position")
 *   - position: تصفية حسب الوظيفة
 *   - department: تصفية حسب القسم
 *   - isActive: تصفية حسب الحالة
 */
export async function getEmployeeDirectory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        // بناء استعلام MongoDB مع البحث والفلاتر
        const searchFields = ['firstName', 'lastName', 'position', 'department'];
        const query = buildMongoDBQuery({ ...dto, isActive: true }, searchFields);

        // الحصول على العدد الإجمالي
        const total = await Employee.countDocuments(query);

        // بناء الاستعلام مع الترتيب والاختيار والـ pagination
        let dbQuery: any = Employee.find(query)
            .select('firstName lastName position department phoneNumber skills projects')
            .populate('projects', 'title')
            .sort(parseSortString(dto.sort))
            .skip(skip)
            .limit(size);

        // تطبيق اختيار الحقول إن وجد
        if (dto.fields) {
            const fieldsObj = parseFieldsString(dto.fields);
            dbQuery = dbQuery.select(fieldsObj);
        }

        const employees = await dbQuery.exec();

        res.json(
            createPaginatedResponse(employees, total, page, size, {
                search: dto.search,
                sort: dto.sort,
                fields: dto.fields,
                position: dto.position,
                department: dto.department,
            })
        );
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/employees/:id
 * View single employee public profile
 */
export async function getEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const employee = await Employee.findById(req.params.id)
            .select('firstName lastName position department phoneNumber skills projects')
            .populate('projects', 'title');

        if (!employee) {
            throw new AppError('Employee not found.', 404);
        }

        res.json({
            success: true,
            data: employee,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/employees
 * Admin creates a new employee
 */
export async function createEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            employeeId,
            position,
            department,
            hireDate,
            ssn,
            dateOfBirth,
            address,
            emergencyContact,
            skills,
            salary,
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !phoneNumber || !employeeId || !position || !department || !hireDate) {
            throw new AppError('Missing required fields.', 400);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Email already registered.', 409);
        }

        // Check if employee ID already exists
        const existingEmployee = await Employee.findOne({ employeeId });
        if (existingEmployee) {
            throw new AppError('Employee ID already exists.', 409);
        }

        // Create user account
        const user = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            password,
            role: 'employee', // Employees have employee role
        });

        // Create employee profile
        const employee = await Employee.create({
            user: user._id,
            firstName,
            lastName,
            phoneNumber,
            employeeId,
            position,
            department,
            hireDate,
            ssn,
            dateOfBirth,
            address,
            emergencyContact,
            skills: skills || [],
            salary,
        });

        // Populate relations
        await employee.populate([
            { path: 'user', select: 'name email' },
            { path: 'projects', select: 'title' },
        ]);

        res.status(201).json({
            success: true,
            data: employee,
            message: 'Employee created successfully with login credentials.',
        });
    } catch (error) {
        // Clean up user if employee creation fails
        if (error instanceof AppError && error.statusCode >= 400 && error.statusCode < 500) {
            const email = (req.body as any).email;
            if (email) {
                await User.findOneAndDelete({ email }).catch(() => { });
            }
        }
        next(error);
    }
}

/**
 * PUT /api/employees/:id
 * Admin updates employee data
 */
export async function updateEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const allowedFields = [
            'firstName',
            'lastName',
            'phoneNumber',
            'position',
            'department',
            'ssn',
            'dateOfBirth',
            'address',
            'emergencyContact',
            'skills',
            'salary',
            'isActive',
        ];

        const updateData: any = {};
        allowedFields.forEach((field) => {
            if ((req.body as any)[field] !== undefined) {
                updateData[field] = (req.body as any)[field];
            }
        });

        const employee = await Employee.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        })
            .select('+ssn +dateOfBirth +address +emergencyContact +salary')
            .populate('user', 'name email')
            .populate('projects', 'title');

        if (!employee) {
            throw new AppError('Employee not found.', 404);
        }

        res.json({
            success: true,
            data: employee,
            message: 'Employee updated successfully.',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/employees/:id
 * Admin deletes an employee and their user account
 */
export async function deleteEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            throw new AppError('Employee not found.', 404);
        }

        // Delete user account
        await User.findByIdAndDelete(employee.user);

        // Delete employee profile
        await Employee.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Employee and associated user account deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/employees/:id/projects
 * Admin adds/updates projects for an employee
 */
export async function updateEmployeeProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { projectIds } = req.body;

        if (!Array.isArray(projectIds)) {
            throw new AppError('projectIds must be an array.', 400);
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { projects: projectIds },
            { new: true }
        )
            .populate('projects', 'title')
            .populate('user', 'name email');

        if (!employee) {
            throw new AppError('Employee not found.', 404);
        }

        res.json({
            success: true,
            data: employee,
            message: 'Employee projects updated successfully.',
        });
    } catch (error) {
        next(error);
    }
}
