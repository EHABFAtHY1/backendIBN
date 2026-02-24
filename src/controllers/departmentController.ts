import { Request, Response, NextFunction } from 'express';
import Department from '../models/Department';
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
 * GET /api/departments
 */
export async function getDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        const searchFields = ['name', 'description'];
        const query = buildMongoDBQuery({ ...dto, isVisible: true }, searchFields);

        const total = await Department.countDocuments(query);

        let dbQuery: any = Department.find(query)
            .sort(parseSortString(dto.sort || 'order'))
            .skip(skip)
            .limit(size);

        if (dto.fields) {
            const fieldsObj = parseFieldsString(dto.fields);
            dbQuery = dbQuery.select(fieldsObj);
        }

        const departments = await dbQuery.exec();

        res.json(
            createPaginatedResponse(departments, total, page, size, {
                search: dto.search,
                sort: dto.sort,
                fields: dto.fields,
            })
        );
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/departments/all (admin)
 */
export async function getAllDepartments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        const searchFields = ['name', 'description'];
        const query = buildMongoDBQuery(dto, searchFields);

        const total = await Department.countDocuments(query);

        let dbQuery: any = Department.find(query)
            .sort(parseSortString(dto.sort || 'order'))
            .skip(skip)
            .limit(size);

        if (dto.fields) {
            const fieldsObj = parseFieldsString(dto.fields);
            dbQuery = dbQuery.select(fieldsObj);
        }

        const departments = await dbQuery.exec();

        res.json(
            createPaginatedResponse(departments, total, page, size, {
                search: dto.search,
                sort: dto.sort,
                fields: dto.fields,
            })
        );
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/departments
 */
export async function createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const department = await Department.create(req.body);
        res.status(201).json({ success: true, data: department });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/departments/:id
 */
export async function updateDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!department) {
            throw new AppError('Department not found.', 404);
        }
        res.json({ success: true, data: department });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/departments/:id
 */
export async function deleteDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            throw new AppError('Department not found.', 404);
        }
        res.json({ success: true, message: 'Department deleted.' });
    } catch (error) {
        next(error);
    }
}
