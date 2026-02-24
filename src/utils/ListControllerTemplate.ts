/**
 * Template لتحديث أي controller يحتاج pagination/filtering/searching
 * استخدم هذا كمرجع لتحديث باقي الـ controllers
 */

import { Request, Response, NextFunction } from 'express';
import {
    PaginationDto,
    createPaginatedResponse,
    buildMongoDBQuery,
    parseSortString,
    parseFieldsString,
    parsePaginationParams,
} from '../dtos/PaginationDto';

/**
 * Template للـ GET list endpoints (Public)
 * استبدل:
 * - ModelName بـ اسم الـ Model (e.g., Service)
 * - searchFields بـ الحقول المراد البحث فيها
 * - visibilityFilter بـ الفلاتر الافتراضية (e.g., { isVisible: true })
 */
export async function getListTemplate(
    Model: any,
    searchFields: string[] = [],
    visibilityFilter: any = {},
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        // دمج فلاتر الظهور مع الفلاتر الأخرى
        const query = {
            ...visibilityFilter,
            ...buildMongoDBQuery(dto, searchFields),
        };

        const total = await Model.countDocuments(query);

        let dbQuery = Model.find(query)
            .sort(parseSortString(dto.sort || '-createdAt'))
            .skip(skip)
            .limit(size);

        if (dto.fields) {
            const fieldsObj = parseFieldsString(dto.fields);
            dbQuery = dbQuery.select(fieldsObj);
        }

        const data = await dbQuery.exec();

        res.json(
            createPaginatedResponse(data, total, page, size, {
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
 * Template للـ GET all endpoints (Admin - بدون تصفية الظهور)
 */
export async function getAllListTemplate(
    Model: any,
    searchFields: string[] = [],
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        const query = buildMongoDBQuery(dto, searchFields);

        const total = await Model.countDocuments(query);

        let dbQuery = Model.find(query)
            .sort(parseSortString(dto.sort || '-createdAt'))
            .skip(skip)
            .limit(size);

        if (dto.fields) {
            const fieldsObj = parseFieldsString(dto.fields);
            dbQuery = dbQuery.select(fieldsObj);
        }

        const data = await dbQuery.exec();

        res.json(
            createPaginatedResponse(data, total, page, size, {
                search: dto.search,
                sort: dto.sort,
                fields: dto.fields,
            })
        );
    } catch (error) {
        next(error);
    }
}
