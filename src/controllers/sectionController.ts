import { Request, Response, NextFunction } from 'express';
import Section from '../models/Section';
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

export async function getSections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        const searchFields = ['titleAr', 'titleEn', 'icon'];
        const query = buildMongoDBQuery(dto, searchFields);

        const total = await Section.countDocuments(query);

        let dbQuery: any = Section.find(query)
            .populate('departmentId')
            .sort(parseSortString(dto.sort || '-createdAt'))
            .skip(skip)
            .limit(size);

        if (dto.fields) {
            dbQuery = dbQuery.select(parseFieldsString(dto.fields));
        }

        const sections = await dbQuery.exec();

        res.json(
            createPaginatedResponse(sections, total, page, size, {
                search: dto.search,
                sort: dto.sort,
                fields: dto.fields,
            })
        );
    } catch (error) {
        next(error);
    }
}

export async function getSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const section = await Section.findById(req.params.id).populate('departmentId');
        if (!section) {
            throw new AppError('Section not found.', 404);
        }

        res.json({ success: true, data: section });
    } catch (error) {
        next(error);
    }
}

export async function createSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { departmentId } = req.body;

        const department = await Department.findById(departmentId);
        if (!department) {
            throw new AppError('Department not found.', 404);
        }

        const section = await Section.create(req.body);
        await section.populate('departmentId');

        res.status(201).json({ success: true, data: section });
    } catch (error) {
        next(error);
    }
}

export async function updateSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        if (req.body.departmentId) {
            const department = await Department.findById(req.body.departmentId);
            if (!department) {
                throw new AppError('Department not found.', 404);
            }
        }

        const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('departmentId');

        if (!section) {
            throw new AppError('Section not found.', 404);
        }

        res.json({ success: true, data: section });
    } catch (error) {
        next(error);
    }
}

export async function deleteSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const section = await Section.findByIdAndDelete(req.params.id);
        if (!section) {
            throw new AppError('Section not found.', 404);
        }

        res.json({ success: true, message: 'Section deleted.' });
    } catch (error) {
        next(error);
    }
}
